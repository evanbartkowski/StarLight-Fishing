import { RELIC_TYPES } from '../data/RelicsData.js';
import { drawRelicArtifact } from '../rendering/RelicArtwork.js';
import { RestorationSession, RESTORATION_TOOLS } from '../systems/RestorationSession.js';
import { soundManager } from '../audio/SoundManager.js';

const escapeText = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const TOOL_ART = {
  brush: '<path d="m8 17 9-12 3 3-10 11M5 17l5 3-5 3-3-2z"/>',
  pick: '<path d="m5 21 9-13m-5-2 6-3 6 4m-7 1 3 3"/>',
  polish: '<path d="m3 8 10-4 8 6-9 10-9-5zM8 10l5 4m-1-7 5 4"/>',
};

export function openRestorationDesk(ui, relicItem, onDone) {
  const type = RELIC_TYPES.find(relic => relic.id === relicItem.id || relic.id === relicItem.relicType?.id) || relicItem.relicType || RELIC_TYPES[0];
  const inventory = ui.saveSystem.getInventory?.() || ui.saveSystem.data.inventory || [];
  const instanceId = relicItem.instanceId || relicItem.inventoryRef?.instanceId;
  const stored = inventory.find(item => instanceId ? item.instanceId === instanceId : item.id === type.id && !item.restored);
  const item = stored || relicItem;
  const width = 420, height = 280, cols = 28, rows = 18;
  const specimen = document.createElement('canvas'); specimen.width = width; specimen.height = height;
  const specimenCtx = specimen.getContext('2d', { willReadFrequently: true });
  specimenCtx.translate(width / 2, height / 2); specimenCtx.scale(3, 3);
  drawRelicArtifact(specimenCtx, type, 0);
  const pixels = specimenCtx.getImageData(0, 0, width, height).data;
  const mask = Array.from({ length: cols * rows }, (_, i) => {
    const cx = (i % cols + .5) * width / cols, cy = (Math.floor(i / cols) + .5) * height / rows;
    return [[0, 0], [-4, -4], [4, 4], [-4, 4], [4, -4]].some(([dx, dy]) => pixels[(Math.floor(cy + dy) * width + Math.floor(cx + dx)) * 4 + 3] > 12);
  });
  const session = new RestorationSession({ width, height, cols, rows, mask,
    progress: item.restored ? { version: 1, stage: 3 } : item.restorationProgress });
  let tool = session.requiredTool || 'polish', cleaning = false, previous = null, raf = null, exited = false, committed = false;
  let cursor = { x: width / 2, y: height / 2 }, lastSound = 0;
  ui.activeModal = 'restoration';
  ui.openModal('The Restoration Workshop', `
    <section class="restoration-workshop">
      <div class="restoration-heading"><span class="eyebrow">Recovered from the Seven Seas</span>
        <h3>${escapeText(type.name)}</h3><p>${escapeText(type.era)} · Work at your own pace. Your progress is saved.</p></div>
      <ol class="restoration-stages" aria-label="Restoration stages">${Object.entries(RESTORATION_TOOLS).map(([key, config], index) =>
        `<li data-restoration-stage="${key}"><span>${index + 1}</span>${escapeText(config.action)}</li>`).join('')}</ol>
      <div class="restoration-tools" aria-label="Restoration tools">${Object.entries(RESTORATION_TOOLS).map(([key, config], index) =>
        `<button type="button" data-restoration-tool="${key}" aria-pressed="false" title="${config.name} (${index + 1})"><svg viewBox="0 0 24 24" aria-hidden="true">${TOOL_ART[key]}</svg><span>${config.name}</span><kbd>${index + 1}</kbd></button>`).join('')}</div>
      <p id="restoration-instruction" class="restoration-instruction" aria-live="polite"></p>
      <div class="restoration-canvas-frame"><canvas id="restoration-canvas" width="420" height="280" tabindex="0" aria-label="Relic restoration surface. Drag to use your tool, or use arrow keys to move and Space to clean."></canvas></div>
      <div class="restoration-meter"><progress id="restoration-progress" max="100" value="0" aria-label="Restoration progress"></progress><strong id="restoration-pct">0%</strong></div>
      <p class="restoration-help">Drag across the relic to work. Keys 1–3 select tools; arrow keys move the tool, Space uses it.</p>
      <div id="restoration-success" class="restoration-success" hidden>
        <h4>Restored to its former glory</h4><p>${escapeText(type.description)}</p>
        <p>Restored value: <strong>$${type.restoredValue.toLocaleString()}</strong></p>
        <button type="button" class="btn btn-primary" id="btn-restoration-finish">Finish restoration</button>
      </div>
    </section>`);
  const root = document.querySelector('.restoration-workshop');
  const canvas = document.getElementById('restoration-canvas'), ctx = canvas.getContext('2d');
  const progress = document.getElementById('restoration-progress'), pct = document.getElementById('restoration-pct');
  const instruction = document.getElementById('restoration-instruction'), success = document.getElementById('restoration-success');
  const requestDraw = () => { if (raf === null) raf = requestAnimationFrame(draw); };

  const persist = () => {
    if (session.complete) delete item.restorationProgress;
    else item.restorationProgress = session.snapshot();
    ui.saveSystem.save();
  };
  const finish = () => {
    if (committed || !session.complete) return;
    committed = true;
    for (const target of new Set([item, relicItem])) { target.restored = true; target.value = type.restoredValue; delete target.restorationProgress; }
    const ledger = ui.saveSystem.data.relics ||= {};
    const previousEntry = ledger[type.id] || {};
    ledger[type.id] = { ...previousEntry, count: Math.max(1, previousEntry.count || 0), restored: true, restoredAt: previousEntry.restoredAt || Date.now() };
    ui.saveSystem.save();
    soundManager.playTreasure();
  };
  const refresh = () => {
    root.dataset.stage = session.requiredTool || 'complete';
    const percent = Math.round(session.progress * 100);
    progress.value = percent; pct.textContent = `${percent}% restored`;
    instruction.textContent = session.complete ? 'Every detail is revealed.' :
      `${RESTORATION_TOOLS[session.requiredTool].action} with the ${RESTORATION_TOOLS[session.requiredTool].name.toLowerCase()}.`;
    for (const button of root.querySelectorAll('[data-restoration-tool]')) {
      button.setAttribute('aria-pressed', String(button.dataset.restorationTool === tool));
      button.disabled = session.complete;
    }
    root.querySelectorAll('[data-restoration-stage]').forEach((node, index) => {
      node.classList.toggle('is-complete', index < session.stage);
      node.classList.toggle('is-current', index === session.stage);
    });
    success.hidden = !session.complete;
    requestDraw();
  };
  const applyAt = (x, y) => {
    const stage = session.stage;
    const from = previous || { x, y };
    const steps = Math.min(80, Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / 8)));
    let changed = false;
    for (let step = 1; step <= steps && stage === session.stage; step++) {
      changed = session.stroke(from.x + (x - from.x) * step / steps, from.y + (y - from.y) * step / steps, tool) || changed;
    }
    previous = { x, y }; cursor = { x, y };
    requestDraw();
    if (changed) {
      refresh();
      if (performance.now() - lastSound > 160) { soundManager.playReelClick(1.2); lastSound = performance.now(); }
    }
    if (stage !== session.stage) { persist(); finish(); }
  };
  const coordinates = event => {
    const box = canvas.getBoundingClientRect();
    return { x: Math.max(0, Math.min(width, (event.clientX - box.left) * width / box.width)),
      y: Math.max(0, Math.min(height, (event.clientY - box.top) * height / box.height)) };
  };
  const endStroke = () => { if (cleaning) persist(); cleaning = false; previous = null; };
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || session.complete) return;
    event.preventDefault(); canvas.focus({ preventScroll: true }); canvas.setPointerCapture(event.pointerId);
    cleaning = true; previous = null; const point = coordinates(event); applyAt(point.x, point.y);
  });
  canvas.addEventListener('pointermove', event => {
    const point = coordinates(event); cursor = point;
    if (cleaning) applyAt(point.x, point.y);
    else if (!session.complete) requestDraw();
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, endStroke);
  root.querySelectorAll('[data-restoration-tool]').forEach(button => button.addEventListener('click', () => {
    tool = button.dataset.restorationTool; previous = null; refresh();
  }));
  root.addEventListener('keydown', event => {
    const selection = Object.keys(RESTORATION_TOOLS)[Number(event.key) - 1];
    if (selection && !session.complete) { tool = selection; refresh(); event.preventDefault(); }
  });
  canvas.addEventListener('keydown', event => {
    const delta = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[event.key];
    if (delta) { event.preventDefault(); cursor.x = Math.max(0, Math.min(width, cursor.x + delta[0])); cursor.y = Math.max(0, Math.min(height, cursor.y + delta[1])); requestDraw(); }
    if (event.code === 'Space' || event.key === ' ') { event.preventDefault(); previous = null; applyAt(cursor.x, cursor.y); persist(); }
  });
  document.getElementById('btn-restoration-finish').addEventListener('click', () => ui.closeModal());
  ui._activeModalCleanup = replacing => {
    endStroke(); persist();
    if (raf !== null) cancelAnimationFrame(raf);
    if (!replacing && !exited) { exited = true; onDone?.(); }
  };

  const cellW = width / cols, cellH = height / rows;
  const draw = () => {
    raf = null;
    if (!canvas.isConnected || ui.activeModal !== 'restoration') return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#18252a'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(148,163,184,.08)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += 20) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    for (let y = 0; y < height; y += 20) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    ctx.stroke();
    ctx.drawImage(specimen, 0, 0);
    for (let i = 0; i < session.cells.length && !session.complete; i++) {
      const amount = session.cells[i]; if (!amount) continue;
      const x = (i % cols + .5) * cellW, y = (Math.floor(i / cols) + .5) * cellH;
      if (session.stage === 1) {
        ctx.fillStyle = '#b5bab2'; ctx.strokeStyle = '#52645e'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let n = 0; n < 6; n++) { const a = n * Math.PI / 3; const px = x + Math.cos(a) * 6, py = y + Math.sin(a) * 6; if (!n) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#354c48'; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = session.stage === 0 ? `rgba(${i % 2 ? '64,77,48' : '92,83,57'},${amount * .92})` : `rgba(88,145,139,${amount * .43})`;
        ctx.beginPath(); ctx.ellipse(x, y, cellW * .8, cellH * .8, .3, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (!session.complete) {
      ctx.strokeStyle = RESTORATION_TOOLS[tool].color; ctx.lineWidth = 1.4;
      ctx.setLineDash(tool === 'pick' ? [3, 3] : []);
      ctx.beginPath(); ctx.arc(cursor.x, cursor.y, RESTORATION_TOOLS[tool].radius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
  };
  finish(); refresh();
}

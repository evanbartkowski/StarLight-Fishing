import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

await mkdir('.qa', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1500 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (/error/i.test(message.type()) && /render|GameLoop/i.test(message.text())) errors.push(message.text()); });
  await page.route(/googleapis\.com|cloudfunctions\.net/, route => route.abort());
  await page.route('**/src/main.js*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}\nwindow.voyage = { save, oceanWorld, hook, render };` });
  });
  await page.goto(process.env.GAME_TEST_URL || 'http://127.0.0.1:5173/');
  await page.waitForFunction(() => window.voyage);
  const result = await page.evaluate(async () => {
    const [{ OceanWorld }, { getVesselRig }, { Relic }, { RELIC_TYPES }, { Powerup, POWERUP_TYPES }, { Treasure }, { TREASURE_ITEMS }, { Hook }] = await Promise.all([
      import('/src/world/OceanWorld.js'), import('/src/rendering/VesselRenderer.js'), import('/src/entities/Relic.js'),
      import('/src/data/RelicsData.js'), import('/src/entities/Powerup.js'), import('/src/entities/Treasure.js'),
      import('/src/data/TreasureData.js'), import('/src/entities/Hook.js'),
    ]);
    const check = (condition, message) => { if (!condition) throw Error(message); };
    const probe = document.createElement('canvas'); probe.width = 800; probe.height = 600;
    const p = probe.getContext('2d');
    const state = () => JSON.stringify({ matrix: [...p.getTransform().toFloat64Array()], alpha: p.globalAlpha,
      dash: p.getLineDash(), shadow: p.shadowBlur, blend: p.globalCompositeOperation });
    const canvasState = state();
    const hook = new Hook(); hook.state = 'REELING'; hook.x = 310; hook.vx = -220;
    hook.rodTip = { x: 480, y: 90 }; hook.lineWaveTimer = .8;
    let renderCount = 0;
    for (const camera of [0, 800, 45000]) {
      hook.y = camera + 420;
      for (const type of POWERUP_TYPES) {
        const powerup = new Powerup(type, 300, camera + 300);
        powerup.render(p, camera); powerup.collect(hook);
        check(state() === canvasState, `${type.id} leaked canvas state`);
      }
      for (const type of RELIC_TYPES) {
        const relic = new Relic(type, 300, camera + 300);
        relic.hookTo(hook, renderCount % 5); relic.render(p, camera); renderCount++;
        check(state() === canvasState, `${type.id} leaked canvas state`);
        // Evaluate the drawn line independently at the catch's height.
        const t = (hook.y - relic.y) / (hook.y - hook.rodTip.y);
        const controlX = (hook.x + hook.rodTip.x) / 2 + Math.min(45, -hook.vx * .035) + Math.sin(.8 * 2.2) * 2.5;
        const x = (1 - t) ** 2 * hook.x + 2 * (1 - t) * t * controlX + t ** 2 * hook.rodTip.x;
        check(Math.abs(relic.x - x) < 1e-6, `${type.id} drifted away from the actual line at ${camera}`);
      }
      for (const type of TREASURE_ITEMS) {
        new Treasure(type, 300, camera + 300).render(p, camera); renderCount++;
        check(state() === canvasState, `${type.id} leaked canvas state`);
      }
      const original = p.quadraticCurveTo;
      let lineEnd;
      p.quadraticCurveTo = function (...args) { lineEnd = args.slice(2); return original.apply(this, args); };
      hook.renderLine(p, hook.rodTip.x, hook.rodTip.y, camera);
      p.quadraticCurveTo = original;
      check(lineEnd[0] === hook.x && lineEnd[1] === 420, 'line endpoint must remain at the hook after buffs and catches');
    }
    // Native canvas exceptions at nested save/clip depth used to shift the next line.
    for (const [entity, method] of [
      [new Powerup(POWERUP_TYPES[0], 100, 200), 'arc'],
      [new Relic(RELIC_TYPES.find(type => type.id === 'porcelain_tea_set'), 100, 200), 'ellipse'],
      [new Treasure({ id: 'probe_opal', name: 'Fire Opal Cluster', realmStyle: true, rarity: 'rare', value: 1 }, 100, 200), 'rotate'],
    ]) {
      const original = p[method];
      p[method] = function () { this.save(); this.translate(87, 123); this.rect(0, 0, 1, 1); this.clip(); throw Error('Injected effect failure'); };
      let caught = false;
      try { entity.render(p); } catch (error) { caught = error.message === 'Injected effect failure'; }
      p[method] = original;
      check(caught && state() === canvasState, `${entity.name} failed to recover after a nested effect error`);
      p.clearRect(0, 0, 800, 600); p.fillStyle = '#ff0000'; p.fillRect(700, 500, 1, 1);
      check(p.getImageData(700, 500, 1, 1).data[0] === 255, 'clip leaked into subsequent rendering');
    }
    const styles = ['standard', 'pirate', 'submarine', 'chinese_junk', 'viking', 'ghost_ship', 'steampunk'];
    let boats = 0;
    for (const style of styles) for (let tier = 0; tier <= 8; tier++) for (const dir of [-1, 1]) {
      const world = new OceanWorld({ width: 800, height: 600, clientWidth: 800 });
      world.boat.x = 400; world.boat.y = 250; world.boat.angle = .12; world.aimDirection = dir; world.driftItems = null;
      world.saveSystem = { data: { boatHullStyle: style }, getBoatHull: () => style, getUpgradeLevel: () => tier, isPetEquipped: () => false };
      const rig = getVesselRig(tier, 140, 40, style, dir);
      let rodCount = 0, text = [];
      const curve = p.quadraticCurveTo, fillText = p.fillText;
      p.quadraticCurveTo = function (...args) {
        if (args.every((value, i) => Math.abs(value - [rig.rodControl.x, rig.rodControl.y, rig.rodTip.x, rig.rodTip.y][i]) < 1e-8)) rodCount++;
        return curve.apply(this, args);
      };
      p.fillText = function (value, ...args) { text.push(value); return fillText.call(this, value, ...args); };
      world.isAnglerKnitting = false; world.renderBoatAndFisherman(p, 0, true);
      check(rodCount === 1, `${style}/${tier}/${dir} must show one rod`);
      rodCount = 0; text = [];
      world.isAnglerKnitting = true; world.renderBoatAndFisherman(p, 0, true);
      check(rodCount === 0 && text.length === 0, `${style}/${tier}/${dir} knitting must hide the rod and show no text`);
      p.quadraticCurveTo = curve; p.fillText = fillText;
      check(state() === canvasState, `${style}/${tier} leaked canvas state`); boats++;
    }
    const running = window.voyage;
    let lines = 0, hooks = 0;
    const renderLine = running.hook.renderLine, renderHook = running.hook.render;
    running.hook.renderLine = () => lines++; running.hook.render = () => hooks++;
    running.oceanWorld.isAnglerKnitting = true; running.render();
    check(lines === 0 && hooks === 0, 'idle scene must also hide the hook and its line');
    running.oceanWorld.isAnglerKnitting = false; running.render();
    check(lines === 1 && hooks === 1, 'the hook and line must return after knitting');
    running.hook.renderLine = renderLine; running.hook.render = renderHook;

    const gallery = (id, width, height) => {
      const canvas = document.createElement('canvas'); Object.assign(canvas, { id, width, height });
      canvas.style.cssText = 'position:relative;display:block;z-index:999999'; document.body.append(canvas);
      return canvas.getContext('2d');
    };
    const b = gallery('boat-matrix', 1400, 1250);
    const cases = [...Array.from({ length: 9 }, (_, tier) => ({ tier, style: 'standard', dir: 1 })),
      ...styles.slice(1).flatMap(style => [-1, 1].map(dir => ({ tier: 8, style, dir }))),
      { tier: 8, style: 'submarine', dir: 1, knitting: true }, { tier: 2, style: 'standard', dir: 1, knitting: true }];
    for (const [index, { tier, style, dir, knitting }] of cases.entries()) {
      const x = index % 5 * 280, y = Math.floor(index / 5) * 250;
      b.fillStyle = '#102b40'; b.fillRect(x, y, 278, 248); b.fillStyle = '#79c6d5'; b.fillRect(x, y + 186, 278, 1);
      const world = new OceanWorld({ width: 278, height: 248, clientWidth: 278 });
      world.boat.x = 139; world.boat.y = 186; world.aimDirection = dir; world.driftItems = null; world.isAnglerKnitting = !!knitting;
      world.saveSystem = { data: { boatHullStyle: style }, getBoatHull: () => style, getUpgradeLevel: () => tier, isPetEquipped: () => false };
      b.save(); b.translate(x, y); world.renderBoatAndFisherman(b, 0, true); b.restore();
      b.fillStyle = '#d7f1f8'; b.font = '13px sans-serif'; b.fillText(`${style} ${tier} ${knitting ? 'knitting' : dir < 0 ? 'left' : 'right'}`, x + 10, y + 232);
    }
    const r = gallery('relic-matrix', 1400, 600);
    r.fillStyle = '#102b40'; r.fillRect(0, 0, 1400, 600);
    RELIC_TYPES.forEach((type, i) => {
      const x = i % 7 * 200, y = Math.floor(i / 7) * 200;
      r.save(); r.translate(x + 100, y + 95); r.scale(2, 2); new Relic(type, 0, 0).render(r); r.restore();
      r.fillStyle = '#d7f1f8'; r.font = '11px sans-serif'; r.textAlign = 'center'; r.fillText(type.name, x + 100, y + 165, 190);
    });
    document.body.style.overflow = 'auto';
    return { boats, relics: RELIC_TYPES.length, renders: renderCount };
  });
  await page.locator('#boat-matrix').screenshot({ path: '.qa/boats-final.png' });
  await page.locator('#relic-matrix').screenshot({ path: '.qa/relics-final.png' });
  assert.deepEqual([...new Set(errors)], []);
  console.log(`PASS rendering matrix: ${result.boats} boat/facing combinations, ${result.relics} relics, ${result.renders} collectible renders, deep line attachment, nested error recovery, silent rod-free knitting`);
} finally { await browser.close(); }

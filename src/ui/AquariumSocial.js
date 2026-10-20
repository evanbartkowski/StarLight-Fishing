import { drawTipJar } from '../rendering/TipJarArt.js';
import { aquariumAction } from '../systems/SocialFirebase.js';
import { accountManager } from '../systems/AccountManager.js';
import { specimen } from './CatchCard.js';
import { acceptServerSave } from '../systems/PremiumPurchases.js';
import { drawAquariumDecor, normalizeCustomization, AQUARIUM_OPTIONS } from '../data/CustomizationData.js';
import { TREASURE_ITEMS } from '../data/TreasureData.js';
import { Treasure } from '../entities/Treasure.js';

export function extractAquariumHost(input) {
  if (!input) return '';
  const str = String(input).trim();
  const queryMatch = str.match(/[?&]aquarium=([\w-]+)/i);
  if (queryMatch) return queryMatch[1];
  const pathMatch = str.match(/\/aquarium\/([\w-]+)/i);
  if (pathMatch) return pathMatch[1];
  try {
    const url = new URL(str.includes('://') ? str : `https://${str}`);
    const q = url.searchParams.get('aquarium');
    if (q) return q;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length > 0 && /^[\w-]{1,128}$/.test(parts[parts.length - 1])) {
      return parts[parts.length - 1];
    }
  } catch {}
  return str.replace(/[^a-zA-Z0-9_-]/g, '');
}

export async function visitAquarium(ui, rawHost) {
  const host = extractAquariumHost(rawHost);
  if (!host) {
    ui.showToast('Please enter a valid aquarium link or captain ID.');
    return;
  }
  const request = ui._aquariumVisitRequest = (ui._aquariumVisitRequest || 0) + 1;
  ui.activeModal = 'aquarium-visit';
  ui.openModal('Visiting Aquarium', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <h3 id="aquarium-host" style="margin:0;color:#f8fafc;font-size:1.15rem;">Visiting Aquarium</h3>
      <button class="btn btn-secondary btn-sm" id="btn-close-visitor-tank" style="padding:4px 10px;font-size:0.8rem;">✕ Close</button>
    </div>
    <div id="visitor-tank-wrapper" style="position:relative;text-align:center;">
      <p id="aquarium-loading" role="status" style="padding:30px 10px;color:#94a3b8;">Loading this captain's aquarium...</p>
      <canvas id="visitor-tank" width="700" height="340" style="width:100%;max-width:700px;background:#082f49;border-radius:12px;display:none;margin:0 auto 10px;"></canvas>
    </div>
    <div id="visitor-tank-controls" style="display:none;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;">
      <button class="btn btn-primary" id="tip-host">Toss 1 coin · Give host 1 Gem</button>
      <p style="margin:0;font-size:0.82rem;color:#94a3b8;">Maximum 3 tips per captain per UTC day.</p>
    </div>
  `);
  document.getElementById('btn-close-visitor-tank')?.addEventListener('click', () => ui.closeModal());
  const loading = document.getElementById('aquarium-loading');
  try {
    const exhibit = await aquariumAction({ action: 'visit', host });
    if (request !== ui._aquariumVisitRequest) return;
    
    document.getElementById('aquarium-host').textContent = exhibit.username || 'Captain';
    const canvas = document.getElementById('visitor-tank');
    if (!canvas) return;
    if (loading) loading.style.display = 'none';
    canvas.style.display = 'block';
    const controls = document.getElementById('visitor-tank-controls');
    if (controls) controls.style.display = 'flex';

    const ctx = canvas.getContext('2d');
    const colors = { reef: ['#0c7899', '#082f49'], abyss: ['#242254', '#050b20'], atlantis: ['#146a70', '#093b40'], nebula: ['#54347d', '#141330'] }[exhibit.theme] || ['#0c7899', '#082f49'];
    const background = ctx.createLinearGradient(0, 0, 0, 340);
    background.addColorStop(0, colors[0]); background.addColorStop(1, colors[1]);
    const coins = [];
    const decor = normalizeCustomization(AQUARIUM_OPTIONS, exhibit.decor);
    const rawItems = Array.isArray(exhibit?.items) ? exhibit.items : [];
    const fish = rawItems.filter(item => item.type === 'fish' || (!item.type && !item.isRelic)).map((item, index) => {
      const posX = 80 + (index * 71) % 520;
      const posY = 70 + (index * 47) % 200;
      const ent = specimen(item, posX, posY, { minY: 40, maxY: 280 });
      if (ent) {
        ent.x = posX;
        ent.y = posY;
        ent.minY = 40;
        ent.maxY = 280;
        ent.scale = Math.min(1.4, Math.max(0.4, ent.scale * 0.85));
        ent.isAquarium = true;
        ent._inTank = true;
      }
      return ent;
    }).filter(Boolean);
    const relics = rawItems.filter(item => item.type !== 'fish' && (item.type || item.isRelic));
    const treasures = relics.map((item, index) => {
      const config = TREASURE_ITEMS.find(entry => entry.id === (item.id || item.speciesId));
      return config ? new Treasure(config, 60 + (index * 65) % 510, 290) : null;
    }).filter(Boolean);

    let previous = performance.now();
    const frame = now => {
      if (!canvas.isConnected) return;
      const dt = Math.min(50, now - previous); previous = now;
      ctx.fillStyle = background; ctx.fillRect(0, 0, 700, 340);
      ctx.fillStyle = '#c8b997'; ctx.fillRect(0, 315, 700, 25);
      drawAquariumDecor(ctx, 700, 340, decor, now / 1000);

      // Render pedestals for relics/treasures
      const relicSpacing = 700 / (relics.length + 1);
      relics.forEach((relic, idx) => {
        const rx = relicSpacing * (idx + 1);
        const ry = 295;
        ctx.fillStyle = '#475569';
        ctx.fillRect(rx - 20, ry + 10, 40, 10);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(rx - 16, ry + 5, 32, 5);
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(relic.icon || '🏺', rx, ry - 6);
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText((relic.name || 'Relic').substring(0, 12), rx, ry + 24);
      });
      treasures.forEach(entity => entity.render(ctx, 0));

      fish.forEach(entity => {
        entity.update(dt, 700, null);
        entity.render(ctx, 0);
      });
      drawTipJar(ctx);
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i]; coin.y += dt * .18;
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(639, coin.y, 7, 0, Math.PI * 2); ctx.fill();
        if (coin.y > 310) coins.splice(i, 1);
      }
      if (!rawItems.length) {
        ctx.fillStyle = '#dbeafe';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No specimens on display yet in this tank.', 350, 165);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    const pendingKey = `${ui.saveSystem.getActiveStorageKey()}_aquarium_tip`;
    const tipButton = document.getElementById('tip-host');
    canvas.addEventListener('click', event => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * 700 / rect.width;
      const y = (event.clientY - rect.top) * 340 / rect.height;
      if (x >= 600 && y >= 235) tipButton?.click();
    });
    if (tipButton) {
      tipButton.disabled = exhibit.canTip === false || exhibit.remaining === 0;
      if (exhibit.canTip === false) {
        tipButton.textContent = exhibit.isOwn ? 'This is your personal aquarium' : exhibit.signedIn === false ? 'Sign in to leave a tip' : 'This captain cannot be tipped';
      } else if (exhibit.remaining === 0) {
        tipButton.textContent = 'All 3 daily tips used (resets at 00:00 UTC)';
      }
    }
    let requestId = crypto.randomUUID();
    document.getElementById('tip-host').onclick = async event => {
      const button = event.currentTarget;
      if (button.disabled) return;
      if (ui.saveSystem.data.coins < 1) { ui.showToast('You need one coin.'); return; }
      button.disabled = true;
      ui.socialBusy = true;
      try {
        ui.saveSystem.save();
        await accountManager.syncCloudSave();
        const session = accountManager.cloudSession;
        if (!session || session.busy || session.snapshot !== localStorage.getItem(ui.saveSystem.getActiveStorageKey())) throw new Error('Wait for cloud sync before tipping.');
        const pending = JSON.parse(localStorage.getItem(pendingKey) || 'null') || { host, requestId };
        localStorage.setItem(pendingKey, JSON.stringify(pending));
        session.busy = true;
        let result;
        try {
        result = await aquariumAction({ action: 'tip', host: pending.host, requestId: pending.requestId });
        acceptServerSave(ui.saveSystem, session, result);
        localStorage.removeItem(pendingKey);
        } finally { session.busy = false; }
        // The request ID survives a failed network response for safe retries.
        requestId = crypto.randomUUID();
        coins.push({ y: 30 });
        ui.showToast(`Host received 1 Gem. ${result.remaining} tips left today.`);
        button.disabled = result.remaining === 0;
      } catch (error) {
        if (['functions/resource-exhausted', 'functions/invalid-argument', 'functions/failed-precondition', 'functions/not-found'].includes(error.code)) localStorage.removeItem(pendingKey);
        ui.showToast(error.message); button.disabled = error.code === 'functions/resource-exhausted';
      }
      finally { ui.socialBusy = false; }
    };
  } catch (error) {
    if (request !== ui._aquariumVisitRequest) return;
    const errCode = String(error?.code || '').toLowerCase();
    const errMsg = String(error?.message || '').toLowerCase();
    const isNotAvailable = errCode.includes('not-found')
      || errCode.includes('failed-precondition')
      || errCode.includes('unavailable')
      || errMsg.includes('404')
      || errMsg.includes('not found')
      || errMsg.includes('cannot be completed')
      || errMsg.includes('not synced')
      || errMsg.includes('not unlocked')
      || errMsg.includes('invalid argument');

    if (isNotAvailable) {
      ui.openModal('Aquarium Not Available', `
        <div style="text-align: center; padding: 22px 10px;">
          <div style="font-size: 2.4rem; margin-bottom: 8px;">🏛️</div>
          <h3 style="color: #f8fafc; margin-bottom: 8px; font-size: 1.15rem;">Aquarium Not Available</h3>
          <p style="color: #94a3b8; font-size: 0.9rem; max-width: 360px; margin: 0 auto 18px auto; line-height: 1.45;">
            This captain does not currently have an aquarium on display.
          </p>
          <button class="btn btn-secondary" id="btn-close-visitor-aquarium">Return</button>
        </div>
      `);
      document.getElementById('btn-close-visitor-aquarium')?.addEventListener('click', () => {
        ui.closeModal();
      });
      ui.showToast('Aquarium not available.');
    } else if (errCode.includes('unauthenticated')) {
      const loading = document.getElementById('aquarium-loading');
      if (loading) loading.textContent = 'Sign in to a captain account to visit aquariums.';
      ui.showToast('Sign in to a captain account to visit aquariums.');
    } else {
      const loading = document.getElementById('aquarium-loading');
      if (loading) loading.textContent = 'The aquarium could not load. Please try again.';
      ui.showToast('The aquarium could not load. Please try again.');
    }
  }
}

export async function shareAquarium(ui) {
  try {
    await accountManager.syncCloudSave();
    const { host } = await aquariumAction({ action: 'publish' });
    const url = new URL(location.href); url.search = ''; url.searchParams.set('aquarium', host);
    ui.openModal('Your Aquarium Link', '<input id="aquarium-link" readonly style="width:100%"><p>Share this link or send it in Fleet Radio.</p>');
    const input = document.getElementById('aquarium-link'); input.value = url.href; input.select();
  } catch (error) { ui.showToast(error.message); }
}

import { aquariumAction } from '../systems/SocialFirebase.js';
import { accountManager } from '../systems/AccountManager.js';
import { specimen } from './CatchCard.js';
import { acceptServerSave } from '../systems/PremiumPurchases.js';
import { drawAquariumDecor, normalizeCustomization, AQUARIUM_OPTIONS } from '../data/CustomizationData.js';
import { TREASURE_ITEMS } from '../data/TreasureData.js';
import { Treasure } from '../entities/Treasure.js';

export async function visitAquarium(ui, host) {
  const request = ui._aquariumVisitRequest = (ui._aquariumVisitRequest || 0) + 1;
  ui.activeModal = 'aquarium-visit';
  ui.openModal('Visiting Aquarium', '<p id="aquarium-loading" role="status">Loading this captain\'s aquarium...</p>');
  const loading = document.getElementById('aquarium-loading');
  try {
    const exhibit = await aquariumAction({ action: 'visit', host });
    if (request !== ui._aquariumVisitRequest || !loading.isConnected) return;
    ui.activeModal = 'aquarium-visit';
    ui.openModal('Visiting Aquarium', '<h3 id="aquarium-host"></h3><canvas id="visitor-tank" width="700" height="340" style="width:100%;background:#082f49;border-radius:12px"></canvas><button class="btn btn-primary" id="tip-host">Toss 1 coin · Give host 1 Gem</button><p>Maximum 3 tips per captain per UTC day.</p>');
    document.getElementById('aquarium-host').textContent = exhibit.username;
    const canvas = document.getElementById('visitor-tank'), ctx = canvas.getContext('2d');
    const colors = { reef: ['#0c7899', '#082f49'], abyss: ['#242254', '#050b20'], atlantis: ['#146a70', '#093b40'], nebula: ['#54347d', '#141330'] }[exhibit.theme] || ['#0c7899', '#082f49'];
    const background = ctx.createLinearGradient(0, 0, 0, 340);
    background.addColorStop(0, colors[0]); background.addColorStop(1, colors[1]);
    const coins = [];
    const decor = normalizeCustomization(AQUARIUM_OPTIONS, exhibit.decor);
    const fish = exhibit.items.filter(item => item.type === 'fish').map((item, index) => specimen(item, 80 + index * 71 % 540, 70 + index * 47 % 220)).filter(Boolean);
    const treasures = exhibit.items.filter(item => item.type !== 'fish').map((item, index) => {
      const config = TREASURE_ITEMS.find(entry => entry.id === (item.id || item.speciesId));
      return config ? new Treasure(config, 60 + index * 65 % 510, 290) : null;
    }).filter(Boolean);
    fish.forEach(entity => { entity.minY = 40; entity.maxY = 300; entity.scale = Math.min(1.4, entity.scale); });
    let previous = performance.now();
    const frame = now => {
      if (!canvas.isConnected) return;
      const dt = Math.min(50, now - previous); previous = now;
      ctx.fillStyle = background; ctx.fillRect(0, 0, 700, 340);
      ctx.fillStyle = '#c8b997'; ctx.fillRect(0, 315, 700, 25);
      drawAquariumDecor(ctx, 700, 340, decor, now / 1000);
      treasures.forEach(entity => entity.render(ctx, 0));
      fish.forEach(entity => { entity.update(dt, 700, null); entity.render(ctx, 0); });
      ctx.fillStyle = '#e0f2fe55'; ctx.strokeStyle = '#bae6fd'; ctx.lineWidth = 2;
      ctx.fillRect(615, 265, 48, 55); ctx.strokeRect(615, 265, 48, 55);
      ctx.fillStyle = '#fde68a'; ctx.font = '13px sans-serif'; ctx.fillText('TIP JAR', 613, 252);
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i]; coin.y += dt * .18;
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(639, coin.y, 7, 0, Math.PI * 2); ctx.fill();
        if (coin.y > 310) coins.splice(i, 1);
      }
      if (!exhibit.items.length) { ctx.fillStyle = '#dbeafe'; ctx.fillText('No specimens on display yet.', 220, 165); }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    const pendingKey = `${ui.saveSystem.getActiveStorageKey()}_aquarium_tip`;
    const tipButton = document.getElementById('tip-host');
    canvas.addEventListener('click', event => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * 700 / rect.width;
      const y = (event.clientY - rect.top) * 340 / rect.height;
      if (x >= 600 && y >= 235) tipButton.click();
    });
    tipButton.disabled = exhibit.canTip === false || exhibit.remaining === 0;
    if (exhibit.canTip === false) tipButton.textContent = exhibit.signedIn === false ? 'Sign in to leave a tip' : 'This is your aquarium';
    else if (exhibit.remaining === 0) tipButton.textContent = 'All 3 daily tips used (resets at 00:00 UTC)';
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
    if (request !== ui._aquariumVisitRequest || !loading.isConnected) return;
    loading.textContent = error.code === 'functions/not-found' ? 'This captain has not synced an aquarium yet.' : error.code === 'functions/failed-precondition' ? 'This captain has not unlocked an aquarium yet.' : 'The aquarium could not load. Please try again.';
    ui.showToast(error.code === 'functions/unauthenticated' ? 'Sign in to a captain account to visit aquariums.' : error.code === 'functions/failed-precondition' ? 'This captain has not unlocked an aquarium yet.' : error.message);
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

import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

await mkdir('.qa', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 500 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (/Error in|render error|GameLoop/.test(message.text())) errors.push(message.text()); });
    await page.route(/googleapis\.com|cloudfunctions\.net/, route => route.abort());
    await page.route('**/src/main.js*', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: `${await response.text()}\nwindow.harbor = { save, uiManager, oceanWorld, hook };` });
    });
    await page.goto(process.env.GAME_TEST_URL || 'http://127.0.0.1:5177/');
    await page.waitForFunction(() => window.harbor);
    await page.evaluate(() => { const { save } = window.harbor; save.data.settings.hasSeenTutorial = true; save.save(); });
    await page.click('#btn-guest-start');
    await page.waitForFunction(() => document.getElementById('welcome-popup').style.display === 'none');
    await page.evaluate(() => window.harbor.save.addBuff('cartographerMark', 300000));
    const positions = [];
    for (const state of ['SURFACE_IDLE', 'DESCENDING', 'REELING']) {
      const geometry = await page.evaluate(state => {
        const { hook, uiManager } = window.harbor;
        uiManager._lastHudSlowCheck = 0; uiManager.updateHUD(hook, state);
        const level = document.getElementById('hud-level').getBoundingClientRect();
        const tray = document.getElementById('hud-buffs').getBoundingClientRect();
        const pill = document.querySelector('#hud-buffs .hud-buff-pill').getBoundingClientRect();
        const depth = document.getElementById('hud-depth-container').getBoundingClientRect();
        if (state !== 'SURFACE_IDLE' && (depth.x < 0 || depth.right > innerWidth)) throw Error('Dive controls spilled outside the screen');
        const event = document.getElementById('world-event-banner');
        event.hidden = false; event.textContent = 'Meteor Shower - Rare catches are stirring';
        const eventRect = event.getBoundingClientRect();
        if (eventRect.y < pill.bottom || (innerWidth < 769 && state !== 'SURFACE_IDLE' && eventRect.y < depth.bottom)) throw Error('World event overlaps another HUD row');
        event.hidden = true;
        return { level: { x: level.x, bottom: level.bottom }, tray: { x: tray.x, y: tray.y }, pill: { x: pill.x, right: pill.right, y: pill.y, bottom: pill.bottom } };
      }, state);
      assert.ok(Math.abs(geometry.pill.x - geometry.level.x) < 3, `${width}/${state}: Survey Mark belongs under the level, not over the boat: ${JSON.stringify(geometry)}`);
      assert.ok(geometry.pill.y >= geometry.level.bottom && geometry.pill.y < 80);
      assert.ok(geometry.pill.right <= width - 4);
      positions.push(geometry.tray);
    }
    assert.deepEqual(positions[0], positions[1], 'fishing must not move the buff tray');
    assert.deepEqual(positions[1], positions[2]);
    await page.screenshot({ path: `.qa/harbor-hud-${width}.png` });
    await page.evaluate(() => {
      const { save, uiManager, hook } = window.harbor;
      for (const key of ['goldSurge', 'xpSurge', 'sirensGrace', 'starlightClarity', 'cursedBarnacles', 'foggedLens']) save.addBuff(key, 300000);
      uiManager._lastHudSlowCheck = 0; uiManager.updateHUD(hook, 'REELING');
    });
    assert.equal(await page.locator('#hud-buffs .hud-buff-pill').count(), 7);
    const overflow = await page.locator('#hud-buffs').evaluate(node => ({ scroll: node.scrollWidth, client: node.clientWidth, height: node.getBoundingClientRect().height }));
    assert.ok(overflow.height <= 36, 'all buffs must fit in a compact scrollable HUD row');
    assert.ok(overflow.scroll > 0 && overflow.client > 0);
    await page.screenshot({ path: `.qa/harbor-all-buffs-${width}.png` });
    await page.evaluate(() => { window.harbor.save.data.buffs = {}; window.harbor.uiManager._lastHudSlowCheck = 0; window.harbor.uiManager.updateHUD(window.harbor.hook, 'SURFACE_IDLE'); });
    assert.equal(await page.locator('#hud-buffs').isVisible(), false, 'expired buffs leave no empty panel');
    const ids = await page.evaluate(async () => (await import('/src/systems/NPCSystem.js')).NPC_DEFINITIONS.map(npc => npc.id).concat('ghost_captain_vane'));
    const portraits = [];
    for (const id of ids) {
      await page.evaluate(async id => {
        const { NPC_DEFINITIONS } = await import('/src/systems/NPCSystem.js');
        const { createGhostCaptainEncounter } = await import('/src/systems/EasterEggs.js');
        const npc = NPC_DEFINITIONS.find(npc => npc.id === id) || createGhostCaptainEncounter();
        window.harbor.uiManager.showNPCModal(npc, () => {});
      }, id);
      const image = page.locator('.npc-portrait-art img');
      await image.waitFor({ state: 'visible' });
      await image.evaluate(img => img.decode());
      const details = await image.evaluate(img => ({ src: img.getAttribute('src'), w: img.naturalWidth, h: img.naturalHeight }));
      assert.equal(details.w, 320); assert.equal(details.h, 320);
      assert.ok(details.src.includes(id), `${id} must have its own portrait`);
      portraits.push(details.src);
      const modal = await page.locator('.npc-encounter-modal').boundingBox();
      assert.ok(modal.x >= 0 && modal.x + modal.width <= width, 'encounter must fit screen');
      if (width === 390 || width === 1280) await page.screenshot({ path: `.qa/npc-${id}-${width}.png` });
      await page.click('#btn-npc-dismiss');
    }
    assert.equal(new Set(portraits).size, 9);
    assert.deepEqual(errors, []);
    console.log(`Harbor HUD states, seven buffs and nine NPC portraits pass at ${width}px`);
    await page.close();
  }
} finally { await browser.close(); }

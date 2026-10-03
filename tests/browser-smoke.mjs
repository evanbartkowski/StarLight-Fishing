import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, hasTouch: viewport.width < 500 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && message.text().includes('GameLoop')) errors.push(message.text()); });
    // External services are tested separately; smoke tests stay offline and read-only.
    await page.route(/googleapis\.com|cloudfunctions\.net|identitytoolkit|securetoken/, route => route.abort());
    await page.goto(process.env.GAME_TEST_URL || 'http://127.0.0.1:5174/');
    await page.waitForSelector('#game-hud');
    const hudIds = await page.locator('#game-hud [id]').evaluateAll(nodes => nodes.map(node => node.id));
    assert.equal(new Set(hudIds).size, hudIds.length, 'HUD controls must have unique IDs');
    assert.equal(await page.locator('#btn-aquarium-hud').count(), 1);
    assert.equal(await page.locator('#btn-radio-hud').count(), 1);
    assert.equal(await page.locator('#hud-buffs').count(), 1);
    assert.equal(await page.locator('#hud-tension-container').count(), 0);
    await page.evaluate(async () => {
      const { saveSystem: save } = await import('/src/systems/SaveSystem.js');
      save.data.settings.hasSeenTutorial = true;
      save.data.level = 50; save.data.coins = 100000; save.data.gems = 50;
      save.setUpgradeLevel('personalAquarium', 1);
      save.setUpgradeLevel('nauticalAstrolabe', 1);
      save.save();
    });
    const start = page.locator('#btn-auth-play-guest');
    if (await start.isVisible()) await start.click();
    const guestStart = page.locator('#btn-guest-start');
    if (await guestStart.isVisible()) await guestStart.click();
    const welcome = page.locator('#btn-welcome-start');
    if (await welcome.isVisible()) await welcome.click();
    await page.waitForTimeout(300);
    // Use actual input and the running game loop before switching to UI fixtures.
    const castPoint = { x: viewport.width * .8, y: viewport.height * .58 };
    if (viewport.width < 500) await page.touchscreen.tap(castPoint.x, castPoint.y);
    else await page.mouse.click(castPoint.x, castPoint.y);
    await page.waitForFunction(() => parseFloat(document.getElementById('hud-depth').textContent) > 1, null, { timeout: 15000 });
    if (viewport.width < 500) await page.locator('#touch-controls [data-key=" "]').tap();
    else await page.keyboard.press('Space');
    await page.locator('#btn-keep-all-catches').click({ timeout: 20000 });
    await page.waitForFunction(() => document.getElementById('hud-depth-container').style.display === 'none', null, { timeout: 20000 });
    // Let the actual game know a modal is open so random NPC popups cannot replace
    // the shared modal while the isolated UI fixture exercises its contents.
    await page.evaluate(() => document.getElementById('btn-shop')?.click());
    // Exercise real UIManager methods without exposing test globals in production.
    await page.evaluate(async () => {
      const { UIManager } = await import('/src/ui/UIManager.js');
      const { saveSystem: save } = await import('/src/systems/SaveSystem.js');
      const ui = Object.assign(Object.create(UIManager.prototype), { saveSystem: save, activeModal: null, showToast() {}, questSystem: null });
      window.smokeUI = ui;
      ui.openShop();
    });
    await page.waitForSelector('#shop-gems');
    await page.evaluate(async () => {
      const { GemShop } = await import('/src/ui/GemShop.js');
      const shop = Object.create(GemShop.prototype);
      Object.assign(shop, { ui: window.smokeUI, save: window.smokeUI.saveSystem, matchesUser: () => false });
      shop.open();
    });
    assert.equal(await page.locator('[data-case-buy]').count(), 5);
    await page.locator('[data-case-preview="3"]').click();
    await page.waitForSelector('.preview-item-chip');
    await page.locator('#btn-preview-back').click();
    assert.equal(await page.locator('[data-case-buy]').count(), 5);
    await page.evaluate(async () => {
      const { accountManager } = await import('/src/systems/AccountManager.js');
      const guest = accountManager.isGuest, captain = accountManager.getCurrentUser;
      try {
        accountManager.isGuest = () => false;
        accountManager.getCurrentUser = () => 'Chat test captain';
        const panel = document.getElementById('fleet-radio');
        panel.hidden = true; panel.classList.add('fleet-minimized');
        document.getElementById('fleet-content').hidden = true;
        window.smokeUI.showAccountChat();
        if (panel.hidden || panel.classList.contains('fleet-minimized') || document.getElementById('fleet-content').hidden) throw Error('Account chat did not expand');
        if (document.getElementById('fleet-toggle').getAttribute('aria-expanded') !== 'true') throw Error('Chat accessibility state is stale');
      } finally { accountManager.isGuest = guest; accountManager.getCurrentUser = captain; }
    });
    await page.evaluate(() => window.smokeUI.openInventory('crates'));
    assert.equal(await page.locator('.crate-purchase-grid button').count(), 5);
    await page.evaluate(async () => {
      const save = window.smokeUI.saveSystem;
      const { CRATE_RANKS } = await import('/src/data/CrateData.js');
      const item = save.addItemToInventory({ ...CRATE_RANKS[0], isCrate: true, crateRank: 1, value: 0 });
      window.smokeUI.openCratesModal([item], null, null);
    });
    assert.ok(await page.locator('.crate-reward').count() > 10);
    await page.screenshot({ path: `tests/crate-preview-${viewport.width}.png` });
    await page.locator('#btn-store-crate').click();
    assert.equal(await page.evaluate(() => window.smokeUI.saveSystem.data.stats.totalCratesOpened || 0), 0);
    await page.evaluate(() => {
      const ui = window.smokeUI;
      const stored = ui.saveSystem.getInventory().find(item => item.isCrate && !item.unboxed);
      if (!stored) throw Error('Sealed crate was lost');
      ui.openCratesModal([stored], null, null);
    });
    await page.click('#btn-crack-crate');
    assert.equal(await page.evaluate(() => window.smokeUI.saveSystem.data.stats.totalCratesOpened), 1);
    // Closing mid-spin must neither lose nor repeat delivery.
    await page.evaluate(() => window.smokeUI.closeModal());
    await page.waitForTimeout(150);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(async () => {
      const ui = window.smokeUI;
      const { CRATE_RANKS } = await import('/src/data/CrateData.js');
      const crate = ui.saveSystem.addItemToInventory({ ...CRATE_RANKS[2], isCrate: true, crateRank: 3, value: 0 });
      ui.openCratesModal([crate], null, null);
    });
    await page.click('#btn-crack-crate');
    await page.waitForSelector('.gacha-winning-card');
    const centered = await page.evaluate(() => {
      const winner = document.querySelector('.gacha-winning-card').getBoundingClientRect();
      const frame = document.querySelector('#gacha-reel-viewport').getBoundingClientRect();
      return Math.abs(winner.x + winner.width / 2 - frame.x - frame.width / 2);
    });
    assert.ok(centered < 2, `winning card must stop under the pointer: ${centered}px`);
    assert.equal(await page.evaluate(() => window.smokeUI.saveSystem.data.stats.totalCratesOpened), 2);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(async () => {
      const { Fish } = await import('/src/entities/Fish.js');
      const { FISH_SPECIES } = await import('/src/data/FishData.js');
      const { LEGENDARY_SPECIES } = await import('/src/data/legendaries.js');
      const save = window.smokeUI.saveSystem;
      save.setUpgradeLevel('personalAquarium', 3);
      const item = save.addItemToInventory(new Fish(FISH_SPECIES[0], 100, 400));
      save.moveItemToAquarium(item.instanceId);
      const mythic = save.addItemToInventory(new Fish(LEGENDARY_SPECIES[0], 100, 400));
      if (!save.moveItemToAquarium(mythic.instanceId).success) throw Error('Could not slot legendary specimen');
      window.smokeUI.openAquariumModal();
    });
    await page.waitForSelector('#aquarium-canvas');
    await page.waitForTimeout(250);
    assert.equal(await page.locator('#share-aquarium').count(), 1);
    await page.locator('#aquarium-canvas').screenshot({ path: `tests/tank-preview-${viewport.width}.png` });
    await page.evaluate(async () => {
      const ui = window.smokeUI;
      const entry = { id: 'aquarium-host-fixture', username: 'Unique Captain', level: 20, xp: 50, coins: 400, totalGoldEarned: 500, totalFishCaught: 10, maxDepthReached: 150, createdAt: Date.now(), isCurrent: false };
      await ui.renderScoreboardTab('level', { entries: [entry], online: true });
    });
    assert.equal(await page.locator('.captain-username').count(), 1);
    assert.equal(await page.locator('[data-visit-aquarium="aquarium-host-fixture"]').count(), 1);
    await page.route('**/aquariumAction', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ result: { username: 'Fixture Aquarium', theme: 'reef', items: [], canTip: false, remaining: 3 } }) }));
    await page.locator('[data-visit-aquarium]').click();
    await page.waitForSelector('#visitor-tank');
    assert.equal(await page.locator('#aquarium-host').textContent(), 'Fixture Aquarium');
    assert.equal(await page.locator('#tip-host').isDisabled(), true);
    await page.evaluate(() => window.smokeUI.openJournal());
    await page.waitForSelector('canvas[data-species]');
    await page.evaluate(async () => {
      const { MinimapUI } = await import('/src/ui/MinimapUI.js');
      const { soundManager } = await import('/src/audio/SoundManager.js');
      const ui = window.smokeUI;
      ui.saveSystem.data.level = 50;
      ui.saveSystem.setUpgradeLevel('nauticalAstrolabe', 1);
      const chart = new MinimapUI(ui.saveSystem, soundManager, ui, { hook: { depthMeters: 25 } });
      chart.openChartNavigation();
    });
    await page.waitForSelector('.depth-active');
    await page.evaluate(async () => {
      const { openCatchCard } = await import('/src/ui/CatchCard.js');
      const { FISH_SPECIES } = await import('/src/data/FishData.js');
      openCatchCard(window.smokeUI, { species: FISH_SPECIES[0], name: 'Test Catch', weight: 2, weightClass: 'Giant', mutation: 'Gold' }, 'Captain', () => {});
    });
    const download = page.waitForEvent('download');
    await page.click('#download-catch');
    assert.equal((await download).suggestedFilename(), 'starlight-catch.png');
    await page.screenshot({ path: `tests/catch-card-${viewport.width}.png` });
    assert.deepEqual(errors, [], `Browser errors at ${viewport.width}px`);
    console.log(`PASS browser smoke ${viewport.width}px: boot, shop, vault, interruption-safe crate, aquarium, almanac, depth chart, catch PNG`);
    await page.close();
  }
} finally { await browser.close(); }

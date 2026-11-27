export async function openLayoutGame(page, base = process.env.GAME_TEST_URL || 'http://127.0.0.1:5173/') {
  await page.route(/googleapis\.com|cloudfunctions\.net/, route => route.abort());
  await page.route('**/src/main.js*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}\nwindow.layoutGame={save,uiManager,hook,oceanWorld,gameLoop,touchControls,npcSystem,update,render,setState:s=>{gameState=s;hook.state=s;}};` });
  });
  await page.goto(base); await page.waitForFunction(() => window.layoutGame);
  if (await page.locator('#btn-instant-play').count()) throw Error('The duplicate guest entry must be removed');
  if (await page.locator('#touch-controls').isVisible()) throw Error('Reel controls must stay hidden on the welcome screen');
  await page.evaluate(() => {
    const { save, npcSystem } = window.layoutGame;
    npcSystem.encounterCooldown = 1e9; // Keep random visitors out of this isolated layout/control fixture.
    save.data.settings.hasSeenTutorial = true; save.data.settings.isMuted = true; save.save();
  });
  await page.click('#btn-guest-start');
  await page.waitForFunction(() => document.getElementById('welcome-popup').style.display === 'none');
  await page.evaluate(() => {
    const { gameLoop, save, uiManager } = window.layoutGame;
    gameLoop.stop(); uiManager.closeModal();
    save.data.coins = 9876543210123; save.data.gems = 123456;
    save.data.stats.totalCasts = 8; save.data.stats.totalFishCaught = 8;
    for (const key of ['goldSurge', 'xpSurge', 'sirensGrace', 'starlightClarity', 'cartographerMark', 'cursedBarnacles', 'foggedLens']) save.addBuff(key, 300000);
  });
}

export async function showLayoutSummary(page) {
  await page.evaluate(async () => {
    const [{ Fish }, { FISH_SPECIES }, { RELIC_TYPES }, { TREASURE_ITEMS }, { UPGRADE_DEFINITIONS }] = await Promise.all([
      import('/src/entities/Fish.js'), import('/src/data/FishData.js'), import('/src/data/RelicsData.js'), import('/src/data/TreasureData.js'), import('/src/data/UpgradesData.js'),
    ]);
    const { hook, uiManager, save, setState } = window.layoutGame;
    save.data.upgrades.tackleBox = UPGRADE_DEFINITIONS.tackleBox.tiers.length - 1;
    setState('CATCH_SUMMARY'); hook.capacity = 16; hook.maxDepthReachedThisDive = 2999.9;
    hook.lastDiveComboCount = 8; hook.lastDiveComboBonus = 125000;
    const fish = FISH_SPECIES.find(f => f.rarity === 'legendary');
    hook.caughtItems = Array.from({ length: 6 }, (_, index) => {
      const item = new Fish(fish, 100, 400);
      Object.assign(item, { instanceId: `layout-fish-${index}`, name: 'Crowned Celestial Paradox Leviathan of the Seventh Sea', value: 123456789, isShiny: true, isMythic: true, crown: 'gold', gradeTier: { id: 'Monster' } });
      return item;
    });
    const relic = RELIC_TYPES[0];
    hook.caughtItems.push({ id: 'layout-crate', instanceId: 'layout-crate', name: 'Ancient Emperor Mystery Chest', category: 'crate', isCrate: true, crateRank: 4, rarity: 'legendary', value: 10000 },
      { ...relic, instanceId: 'layout-relic', relicType: relic, isRelic: true, restored: false, value: 1000 },
      { id: 'bottle', instanceId: 'layout-bottle', name: 'Message in a Bottle', isBottle: true, category: 'bottle', rarity: 'common', value: 0 },
      { ...TREASURE_ITEMS.find(item => item.category === 'fossil'), instanceId: 'layout-fossil' });
    window.layoutContinues = 0;
    uiManager.openCatchSummary(hook, () => { window.layoutContinues++; hook.caughtItems = []; setState('SURFACE_IDLE'); }, true);
  });
  await page.waitForFunction(() => Number(getComputedStyle(document.getElementById('modal-overlay')).opacity) >= .99);
}

export async function layoutProblems(page) {
  return page.evaluate(() => {
    const problems = [];
    const rect = node => node.getBoundingClientRect();
    const visible = node => node && rect(node).width && rect(node).height && getComputedStyle(node).visibility !== 'hidden' && getComputedStyle(node).display !== 'none';
    const overlap = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
    for (const card of document.querySelectorAll('.catch-item-card')) {
      if (overlap(rect(card.querySelector('.catch-item-icon')), rect(card.querySelector('.catch-item-details')))) problems.push('catch icon overlaps text');
      if (card.scrollWidth > card.clientWidth + 1) problems.push('catch card overflows');
    }
    if (visible(document.querySelector('.summary-container'))) {
      const modal = rect(document.querySelector('.modal-card'));
      if (modal.left < 0 || modal.right > innerWidth || modal.top < 0 || modal.bottom > innerHeight) problems.push('dialog exceeds viewport');
      for (const id of ['btn-keep-all-catches', 'btn-sell-all-catches', 'btn-summary-inventory']) {
        const node = document.getElementById(id), r = rect(node), top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        if (r.bottom > innerHeight || r.top < 0 || !node.contains(top)) problems.push(`${id} is obscured or offscreen`);
      }
      if (document.querySelector('.summary-container').textContent.includes('${')) problems.push('raw template text in catch summary');
    } else {
      const nodes = ['hud-level', 'hud-coins', 'hud-gems', 'hud-capacity', 'hud-weather-badge', 'hud-depth-container', 'hud-buffs', 'hud-right'].map(id => document.getElementById(id)).filter(visible);
      for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
        if (overlap(rect(nodes[a]), rect(nodes[b]))) problems.push(`${nodes[a].id} overlaps ${nodes[b].id}`);
      }
      const reels = [document.getElementById('btn-manual-reel-up'), document.querySelector('#touch-controls button')].filter(visible);
      if (reels.length > 1) problems.push('duplicate reel buttons');
      for (const node of reels) { const r = rect(node); if (r.height < 44 || r.x < 0 || r.right > innerWidth) problems.push('reel button is too small or clipped'); }
    }
    return [...new Set(problems)];
  });
}

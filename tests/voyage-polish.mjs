import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

await mkdir('.qa', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const width of [1280, 390]) {
    const touch = width < 500;
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: touch });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (['warning', 'error'].includes(message.type()) && /Error in|render error|GameLoop/.test(message.text())) errors.push(message.text()); });
    await page.route(/googleapis\.com|cloudfunctions\.net|identitytoolkit|securetoken/, route => route.abort());
    await page.route('**/src/main.js*', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: `${await response.text()}\nwindow.voyage = { save, uiManager, oceanWorld, hook, afkManager, update };` });
    });
    await page.goto(process.env.GAME_TEST_URL || 'http://127.0.0.1:5173/');
    await page.waitForFunction(() => window.voyage);
    await page.evaluate(() => { window.voyage.save.data.settings.hasSeenTutorial = true; window.voyage.save.save(); });
    await page.click('#btn-guest-start');
    await page.waitForFunction(() => document.getElementById('welcome-popup').style.display === 'none');
    await page.evaluate(async () => {
      const { RELIC_TYPES } = await import('/src/data/RelicsData.js');
      const { save, uiManager } = window.voyage;
      const type = RELIC_TYPES.find(relic => relic.id === 'porcelain_tea_set');
      window.otherRelic = save.addItemToInventory({ id: type.id, name: type.name, isRelic: true, type: 'relic', value: type.rawValue });
      window.workshopItem = save.addItemToInventory({ id: type.id, name: type.name, isRelic: true, type: 'relic', value: type.rawValue });
      window.liveRelic = { id: type.id, relicType: type, inventoryRef: window.workshopItem };
      save.data.relics[type.id] = { count: 4 };
      window.workshopCoins = save.data.coins;
      window.workshopExits = 0;
      window.openWorkshop = () => uiManager.openRestorationDesk(window.liveRelic, () => window.workshopExits++);
      window.openWorkshop();
      uiManager.closeModal(); // Reproduces the old undefined `finished` cleanup failure.
    });
    assert.equal(await page.evaluate(() => window.workshopExits), 1);
    await page.evaluate(() => window.openWorkshop());
    const canvas = page.locator('#restoration-canvas');
    const bounds = await canvas.boundingBox();
    assert.ok(bounds.width <= width - 24, 'workshop must fit a phone');
    await canvas.waitFor({ state: 'visible' });
    await canvas.focus();
    await page.keyboard.press('Space');
    assert.ok(await page.locator('#restoration-progress').evaluate(node => node.value) > 0, 'keyboard cleaning must work');
    await page.keyboard.press('ArrowLeft');
    const client = await page.context().newCDPSession(page);
    const sweep = async () => {
      const box = await canvas.boundingBox();
      const points = [];
      for (let pass = 0; pass < 2; pass++) {
        for (let row = 0; row <= 14; row++) {
          for (let col = 0; col <= 14; col++) {
            const x = row % 2 ? 14 - col : col;
            points.push({ x: box.x + (x + .5) / 15 * box.width, y: box.y + (row + .5) / 15 * box.height });
          }
        }
      }
      const first = points[0];
      if (touch) await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first] });
      else { await page.mouse.move(first.x, first.y); await page.mouse.down(); }
      for (const point of points) {
        if (touch) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point] });
        else await page.mouse.move(point.x, point.y);
      }
      if (touch) await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      else await page.mouse.up();
    };
    await sweep();
    await page.waitForSelector('.restoration-workshop[data-stage="pick"]');
    await page.click('#modal-close');
    await page.evaluate(() => window.openWorkshop());
    await page.waitForSelector('.restoration-workshop[data-stage="pick"]');
    await page.click('[data-restoration-tool="pick"]'); await sweep();
    await page.waitForSelector('.restoration-workshop[data-stage="polish"]');
    await page.click('[data-restoration-tool="polish"]'); await sweep();
    await page.waitForSelector('#restoration-success:visible');
    await page.screenshot({ path: `.qa/restoration-${width}.png` });
    await page.click('#btn-restoration-finish');
    const result = await page.evaluate(() => ({
      restored: window.workshopItem.restored, value: window.workshopItem.value,
      count: window.voyage.save.data.relics.porcelain_tea_set.count,
      coins: window.voyage.save.data.coins, expectedCoins: window.workshopCoins, exits: window.workshopExits,
      otherRestored: window.otherRelic.restored, liveRestored: window.liveRelic.restored,
    }));
    assert.equal(result.restored, true); assert.equal(result.value, 1500);
    assert.equal(result.count, 4); assert.equal(result.coins, result.expectedCoins); assert.equal(result.exits, 3);
    assert.equal(result.otherRestored, false); assert.equal(result.liveRestored, true);

    await page.evaluate(() => {
      const { afkManager, update } = window.voyage;
      afkManager.resume(); afkManager.tick(300); update(1000 / 60);
    });
    assert.equal(await page.evaluate(() => window.voyage.oceanWorld.isAnglerKnitting), true);
    await page.mouse.move(20, 400);
    assert.equal(await page.evaluate(() => window.voyage.oceanWorld.isAnglerKnitting), false);
    await page.keyboard.down('Shift');
    await page.evaluate(() => { window.voyage.afkManager.tick(301); window.voyage.update(1000 / 60); });
    assert.equal(await page.evaluate(() => window.voyage.oceanWorld.isAnglerKnitting), false);
    await page.keyboard.up('Shift');
    // Actual water input must work without the old stale knitting variable.
    if (touch) await page.touchscreen.tap(40, 500); else await page.mouse.click(40, 500);
    await page.waitForFunction(() => window.voyage.hook.state === 'DESCENDING');
    await page.waitForFunction(() => window.voyage.hook.depthMeters > 2);
    if (touch) await page.touchscreen.tap(40, 500); else await page.mouse.click(40, 500);
    await page.waitForFunction(() => window.voyage.hook.state === 'REELING');
    assert.deepEqual([...new Set(errors)], []);
    console.log(`PASS voyage polish ${width}px: restoration tools, keyboard/touch, saved work, safe close, exact rewards, pointer/key idle reset, casting and click-to-reel`);
    await page.close();
  }
} finally { await browser.close(); }

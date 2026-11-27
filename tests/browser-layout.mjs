import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { openLayoutGame, showLayoutSummary, layoutProblems } from './browser-layout-fixture.mjs';
await mkdir('.qa', { recursive: true });
const browser = await chromium.launch({ channel: process.env.GAME_BROWSER_CHANNEL || 'msedge', headless: true });
const reports = [], diagnostic = process.env.LAYOUT_REPORT_ONLY === '1';
try {
  for (const [width, height] of [[1366, 768], [1024, 768], [800, 600], [390, 844], [320, 568], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 500 || height < 500 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await openLayoutGame(page);
    for (const state of ['SURFACE_IDLE', 'DESCENDING', 'REELING']) {
      await page.evaluate(state => {
        const { setState, hook, uiManager, touchControls } = window.layoutGame;
        setState(state); hook.depthMeters = 2350.5; hook.maxDepthMeters = 3000;
        touchControls.update(state === 'DESCENDING');
        uiManager._lastHudSlowCheck = 0; uiManager.updateHUD(hook, state);
      }, state);
      const problems = await layoutProblems(page); reports.push({ width, height, state, problems });
      if (!diagnostic) assert.deepEqual(problems, [], `${width}x${height} ${state}`);
      if (!diagnostic) {
        let reels = 0;
        for (const selector of ['#btn-manual-reel-up', '#touch-controls button']) if (await page.locator(selector).isVisible()) reels++;
        assert.equal(reels, state === 'DESCENDING' ? 1 : 0, 'a single reel control is available only while descending');
      }
      if (state === 'DESCENDING') await page.screenshot({ path: `.qa/layout-${diagnostic ? 'before' : 'after'}-hud-${width}-${height}.png` });
    }
    await showLayoutSummary(page);
    const problems = await layoutProblems(page); reports.push({ width, height, state: 'summary', problems });
    await page.screenshot({ path: `.qa/layout-${diagnostic ? 'before' : 'after'}-summary-${width}-${height}.png` });
    if (!diagnostic) {
      assert.deepEqual(problems, [], `${width}x${height} summary`);
      await page.locator('.catch-item-card').last().scrollIntoViewIfNeeded();
      const last = await page.locator('.catch-item-card').last().boundingBox();
      const footer = await page.locator('.summary-footer').boundingBox();
      assert.ok(last.y + last.height <= footer.y + 1, 'last catch must scroll fully above the footer');
      const coinsBefore = await page.evaluate(() => window.layoutGame.save.data.coins);
      await page.locator('.btn-catch-sell').first().click();
      assert.ok(await page.evaluate(() => window.layoutGame.save.data.coins) > coinsBefore);
      await page.click('#btn-keep-all-catches');
      assert.equal(await page.evaluate(() => window.layoutContinues), 1);
      assert.equal(await page.evaluate(() => window.layoutGame.save.getInventory().filter(item => item.name === 'Crowned Celestial Paradox Leviathan of the Seventh Sea').length), 5, 'Keep All must not restore an already sold catch');
      await page.evaluate(() => {
        const { hook, gameLoop, oceanWorld, uiManager } = window.layoutGame;
        hook.reset(oceanWorld.rodTip.x, oceanWorld.rodTip.y);
        uiManager.updateHUD(hook, 'SURFACE_IDLE'); gameLoop.start();
      });
      if (width < 500 || height < 500) await page.touchscreen.tap(40, height * .65);
      else await page.mouse.click(40, height * .65);
      await page.waitForFunction(() => parseFloat(document.getElementById('hud-depth').textContent) > 2);
      const reel = page.locator('#btn-manual-reel-up:visible, #touch-controls button:visible');
      await reel.waitFor({ state: 'visible', timeout: 8000 }).catch(async error => {
        console.log(await page.evaluate(() => ({ state: window.layoutGame.hook.state, activeModal: window.layoutGame.uiManager.activeModal,
          title: document.getElementById('modal-title').textContent, touchHidden: document.getElementById('touch-controls').hidden,
          depth: document.getElementById('hud-depth').textContent, x: window.layoutGame.hook.x, y: window.layoutGame.hook.y })));
        throw error;
      });
      assert.equal(await reel.count(), 1);
      if (width === 800) { await reel.focus(); await page.keyboard.press('Enter'); }
      else if (width < 500 || height < 500) await reel.tap();
      else await reel.click();
      await page.waitForSelector('#btn-keep-all-catches', { timeout: 20000 });
      await page.click('#btn-keep-all-catches');
      assert.deepEqual(errors, []);
    }
    console.log(JSON.stringify({ width, height, issues: reports.filter(row => row.width === width && row.height === height).flatMap(row => row.problems) }));
    await page.close();
  }
  await writeFile(`.qa/layout-${diagnostic ? 'before' : 'after'}.json`, JSON.stringify(reports, null, 2));
} finally { await browser.close(); }

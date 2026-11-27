import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { openLayoutGame, showLayoutSummary, layoutProblems } from './browser-layout-fixture.mjs';
const browser = await chromium.launch({ channel: process.env.GAME_BROWSER_CHANNEL || 'msedge', headless: true });
try {
  for (const [width, height] of [[1366, 768], [1024, 768], [800, 600], [390, 844], [320, 568], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 500 || height < 500 });
    await openLayoutGame(page);
    for (const state of ['SURFACE_IDLE', 'DESCENDING']) {
      await page.evaluate(state => {
        const { uiManager, hook, setState, touchControls } = window.layoutGame;
        setState(state); touchControls.update(state === 'DESCENDING'); uiManager.updateHUD(hook, state);
        uiManager.showToast('Surface glow: +$140, +55 XP and a blessing from the tide.');
        uiManager.showAchievementPopup({ id: 'notice-layout', name: 'First Nibble', reward: 50, icon: '\uD83D\uDC1F' });
      }, state);
      await page.waitForFunction(() => Number(getComputedStyle(document.getElementById('achievement-popup-toast')).opacity) >= .99);
      const problems = await page.evaluate(() => {
        const problems = [], overlap = (a, b) => Math.min(a.right, b.right) > Math.max(a.left, b.left) + 1 && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top) + 1;
        const hud = document.getElementById('game-hud').getBoundingClientRect();
        const achievement = document.getElementById('achievement-popup-toast').getBoundingClientRect();
        const toast = document.getElementById('toast-notification').getBoundingClientRect();
        for (const rect of [achievement, toast]) {
          if (overlap(rect, hud)) problems.push('notification covers HUD');
          if (rect.x < 0 || rect.right > innerWidth || rect.y < 0 || rect.bottom > innerHeight) problems.push('notification exceeds viewport');
          const button = document.querySelector('#touch-controls button');
          if (button.getBoundingClientRect().width && overlap(rect, button.getBoundingClientRect())) problems.push('notification covers reel button');
        }
        if (overlap(achievement, toast)) problems.push('notifications overlap each other');
        return problems;
      });
      assert.deepEqual(problems, [], `${width}x${height} ${state}`);
    }
    await page.screenshot({ path: `.qa/notices-${width}-${height}.png` });
    await showLayoutSummary(page);
    assert.deepEqual(await layoutProblems(page), [], 'notifications must not obscure dialog actions');
    console.log(`PASS notifications ${width}x${height}: HUD, reel control and modal actions remain clear`);
    await page.close();
  }
} finally { await browser.close(); }

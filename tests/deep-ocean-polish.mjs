import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

await mkdir('.qa', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 500 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (/Error in|render error|GameLoop/.test(message.text())) errors.push(message.text()); });
    await page.route(/googleapis\.com|cloudfunctions\.net/, route => route.abort());
    await page.route('**/src/main.js*', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: `${await response.text()}\nwindow.deepGame={save,uiManager,oceanWorld,hook};` });
    });
    let unavailableCalls = 0;
    await page.route('**/aquariumAction', async route => {
      const { host } = route.request().postDataJSON().data;
      const error = host === 'Missing' ? ['NOT_FOUND', 404] : host === 'RetryCaptain' && unavailableCalls++ === 0 ? ['UNAVAILABLE', 503] : null;
      await route.fulfill({ status: error?.[1] || 200, contentType: 'application/json', body: JSON.stringify(error ? { error: { status: error[0], message: 'Fixture' } } :
        { result: { host: 'captain-uid', username: host, theme: 'reef', decor: {}, items: [], remaining: 0, canTip: false, signedIn: false } }) });
    });
    await page.goto(process.env.GAME_TEST_URL || 'http://127.0.0.1:5177/');
    await page.waitForFunction(() => window.deepGame);
    await page.evaluate(() => { window.deepGame.save.data.settings.hasSeenTutorial = true; window.deepGame.save.save(); });
    await page.click('#btn-guest-start');
    await page.waitForFunction(() => document.getElementById('welcome-popup').style.display === 'none');
    const letters = await page.evaluate(async () => (await import('/src/data/DriftMessages.js')).DRIFT_MESSAGES);
    for (const letter of letters) {
      await page.evaluate(letter => window.deepGame.uiManager.showBottleMessage(letter), letter);
      await page.locator('#bottle-message-text').waitFor({ state: 'visible' });
      assert.equal((await page.locator('#bottle-message-text').innerText()).trim(), letter.lines.join('\n'));
      if (letter.type === 'poem' && letter.id === 'poem_clockless_whale') await page.screenshot({ path: `.qa/poem-${width}.png` });
      await page.click('#btn-bottle-close');
    }
    await page.evaluate(() => window.deepGame.uiManager.showBottleMessage({ title: 'Old letter', text: 'First line\\nSecond line' }));
    assert.equal((await page.locator('#bottle-message-text').innerText()).trim(), 'First line\nSecond line');
    await page.click('#btn-bottle-close');
    await page.evaluate(() => window.deepGame.uiManager.openJournalLogbook('journal', 'messages'));
    assert.equal(await page.locator('.bottle-letter-list button').count(), letters.length + 1);
    await page.locator('.bottle-letter-list button').filter({ hasText: 'Whale Without' }).click();
    assert.ok((await page.locator('#bottle-message-text').innerText()).includes('A whale went swimming'));
    await page.click('#btn-bottle-close');
    assert.equal(await page.locator('.bottle-letter-list button').count(), letters.length + 1);
    await page.click('#modal-close');
    await page.reload(); await page.waitForFunction(() => window.deepGame);
    await page.click('#btn-guest-start');
    await page.waitForFunction(() => document.getElementById('welcome-popup').style.display === 'none');
    assert.equal(await page.evaluate(() => window.deepGame.save.getBottleMessages().length), letters.length + 1);

    const visit = async host => {
      await page.evaluate(() => window.deepGame.uiManager.openAquariumModal());
      await page.click('#visit-aquarium'); await page.fill('#visit-host', host); await page.click('#visit-go');
    };
    await visit('EmptyCaptain');
    await page.waitForSelector('#visitor-empty-state', { timeout: 8000 }).catch(async error => {
      console.log(await page.locator('#modal-content').innerText());
      console.log(errors);
      throw error;
    });
    assert.equal(await page.locator('#aquarium-host').textContent(), 'EmptyCaptain');
    assert.ok(await page.locator('#visitor-tank').isVisible());
    await page.screenshot({ path: `.qa/empty-aquarium-${width}.png` });
    await page.evaluate(() => {
      const ctx = document.getElementById('visitor-tank').getContext('2d'), original = ctx.fillRect;
      window.visitorDraws = 0;
      ctx.fillRect = function (...args) { window.visitorDraws++; return original.apply(this, args); };
    });
    await page.click('#btn-close-visitor-tank');
    const closedDraws = await page.evaluate(() => window.visitorDraws);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => window.visitorDraws), closedDraws, 'closed visitor tanks must stop consuming rendering time');
    await visit('RetryCaptain');
    await page.waitForSelector('#retry-visitor-tank');
    assert.ok((await page.locator('#aquarium-loading').textContent()).includes('try again'));
    await page.click('#retry-visitor-tank'); await page.waitForSelector('#visitor-empty-state');
    await page.click('#btn-close-visitor-tank');
    await visit('Missing'); await page.waitForSelector('#btn-close-visitor-aquarium');
    assert.ok((await page.locator('#modal-content').textContent()).includes('Captain account not found'));
    await page.click('#btn-close-visitor-aquarium');
    const images = await page.evaluate(async () => {
      const [{ OceanWorld }, { TRENCH_FAUNA, VOID_FAUNA, backgroundFaunaPose }, { FISH_SPECIES }, { hasFantasyTrail }] = await Promise.all([
        import('/src/world/OceanWorld.js'), import('/src/rendering/BackgroundFauna.js'), import('/src/data/FishData.js'), import('/src/rendering/FishAppearance.js'),
      ]);
      const trails = FISH_SPECIES.filter(hasFantasyTrail).length;
      if (trails >= FISH_SPECIES.length / 3) throw Error('Too many species still have ambient trails');
      const results = [];
      for (const [realm, configs] of [[2, TRENCH_FAUNA], [7, VOID_FAUNA]]) {
        const world = new OceanWorld({ width: 800, height: 500 }); world.setCurrentSea(realm);
        for (const cfg of configs.slice(0, 4)) {
          let time = 0;
          while (time < 600) { const pose = backgroundFaunaPose(cfg, time * (realm === 7 ? .75 : 1), 800, 220, 0); if (pose.x > 240 && pose.x < 560) break; time += 5; }
          world.causticTimer = time; world.waveTimer = 10;
          const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 500;
          const ctx = canvas.getContext('2d'); const camera = 220 + cfg.depth * 15 - 250;
          world.renderUnderwaterBackground(ctx, camera, 500);
          results.push({ realm, type: cfg.type, data: canvas.toDataURL('image/png').split(',')[1] });
        }
      }
      return results;
    });
    if (width === 1280) for (const art of images) await writeFile(`.qa/deep-fauna-${art.realm}-${art.type}.png`, Buffer.from(art.data, 'base64'));
    assert.deepEqual(errors, []);
    console.log(`PASS deep-ocean ${width}px: every bottle text, persisted letters, empty account tank, retry and missing-user states, eight deep habitat renders`);
    await page.close();
  }
} finally { await browser.close(); }

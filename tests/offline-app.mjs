import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

await mkdir('.qa', {recursive:true});
const base = process.env.OFFLINE_TEST_URL || 'http://127.0.0.1:5180/';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width < 500 });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/googleapis\.com|cloudfunctions\.net/, route => route.abort());
    await page.addInitScript(() => {
      if (!localStorage.getItem('seven_seas_fishing_save_v2')) localStorage.setItem('seven_seas_fishing_save_v2', JSON.stringify({ settings: { hasSeenTutorial: true } }));
    });
    await page.goto(base);
    await page.locator('#btn-install-game').waitFor({ state: 'visible', timeout: 5000 });
    const box = await page.locator('#btn-install-game').boundingBox();
    assert.ok(box.width >= 44 && box.x >= 0 && box.x + box.width <= width);
    await page.click('#btn-install-game');
    await page.waitForSelector('#install-dialog[open]');
    assert.ok((await page.locator('#install-guidance').textContent()).includes('Install'));
    await page.waitForSelector('#offline-status[data-ready="true"]', { timeout: 45000 });
    assert.equal(await page.locator('#offline-update').isHidden(), true, 'a first installation must not ask for an update');
    const client = await context.newCDPSession(page);
    const installability = await client.send('Page.getInstallabilityErrors');
    assert.deepEqual(installability.installabilityErrors.filter(error => error.errorId !== 'in-incognito'), []);
    await page.screenshot({ path: '.qa/install-' + width + '.png' });
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt', {cancelable:true});
      window.installPromptCalls = 0;
      event.prompt = async () => { window.installPromptCalls++; };
      event.userChoice = Promise.resolve({outcome:'dismissed'});
      window.dispatchEvent(event);
    });
    await page.click('#install-native');
    assert.equal(await page.evaluate(() => window.installPromptCalls), 1);
    assert.equal(await page.locator('#install-native').isHidden(), true, 'an installation event must only be used once');
    const installed = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      const cacheNames = await caches.keys();
      const core = cacheNames.find(name => name.startsWith('starlight-fishing-core-'));
      const cache = await caches.open(core), requests = await cache.keys();
      const urls = requests.map(request => new URL(request.url).pathname);
      return { scope: registration.scope, urls };
    });
    assert.ok(installed.urls.some(url => /EndgameScene.*\.js$/.test(url)), 'offline must include the unopened ending and lazy-loaded screens');
    assert.ok(installed.urls.some(url => /game-world.*\.js$/.test(url)));
    assert.ok(installed.urls.some(url => /\.woff2?$|\.ttf$/.test(url)), 'offline font must be local');
    const portraits = installed.urls.filter(url => url.startsWith('/art/npcs/') && url.endsWith('.webp'));
    assert.equal(portraits.length, 9, 'every quest portrait must be included in the offline download');
    assert.ok(!installed.urls.some(url => url.endsWith('.mp3')), 'large soundtracks require the explicit download button');
    // Exercise the real optional pack locally; production checks avoid downloading 153 MB.
    if (width === 1280 && process.env.TEST_OFFLINE_MUSIC === '1') {
      await page.click('#offline-music');
      await page.waitForFunction(() => document.getElementById('offline-music').textContent === 'Music saved offline', null, { timeout: 90000 });
      const music = await page.evaluate(async () => {
        const names = await caches.keys(), cache = await caches.open(names.find(name => name.startsWith('starlight-fishing-audio-')));
        const requests = await cache.keys(); return { count: requests.length, urls: requests.map(request => decodeURI(request.url)) };
      });
      assert.equal(music.count, 25);
      await context.setOffline(true);
      for (const url of music.urls) {
        const audio = await page.evaluate(async url => {
          const response = await fetch(url, { headers: { Range: 'bytes=0-127' } });
          return { status: response.status, bytes: (await response.arrayBuffer()).byteLength };
        }, url);
        assert.deepEqual(audio, { status: 206, bytes: 128 }, url);
      }
      console.log('PASS optional soundtrack: all 25 tracks stream from the offline cache, including names with spaces and brackets');
      await context.setOffline(false);
    }
    await page.click('#install-close');
    assert.equal(await page.locator('#btn-install-game').evaluate(node => node === document.activeElement), true);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    const portraitStatus = await page.evaluate(async urls => Promise.all(urls.map(async url => {
      const image = new Image(); image.src = url; await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    })), portraits);
    assert.ok(portraitStatus.every(([w, h]) => w === 320 && h === 320), 'all NPC art must decode without a network connection');
    await page.click('#btn-guest-start');
    await page.waitForFunction(() => document.getElementById('welcome-popup').style.display === 'none');
    // Keep this offline-control check away from the moon's ghost-captain trigger.
    const castX = Math.round(width * .75);
    if (width < 500) await page.touchscreen.tap(castX, 500); else await page.mouse.click(castX, 500);
    await page.waitForFunction(() => parseFloat(document.getElementById('hud-depth').textContent) > 2);
    if (width < 500) await page.touchscreen.tap(castX, 500); else await page.mouse.click(castX, 500);
    await page.waitForSelector('#btn-keep-all-catches', { timeout: 20000 }).catch(async error => {
      console.log(await page.evaluate(() => ({depth:document.getElementById('hud-depth').textContent,
        title:document.getElementById('modal-title').textContent,modal:document.getElementById('modal-overlay').className,
        controls:document.getElementById('touch-controls').hidden,body:document.getElementById('modal-content').innerText.slice(0,500)})));
      await page.screenshot({path:`.qa/offline-failure-${width}.png`});throw error;
    });
    await page.click('#btn-keep-all-catches');
    assert.deepEqual(errors, []);
    await context.setOffline(false);
    await context.close();
    console.log(`PASS offline app ${width}px: install access, complete core cache, offline cold reload, cast, reel, save and responsive controls`);
  }
} finally { await browser.close(); }

import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const template = await readFile('public/sw.js', 'utf8');
let release = 'one';
const server = createServer((request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/sw.js') {
    const core = ['/index.html', `/assets/game-${release}.js`, ...(release === 'broken' ? ['/missing.js'] : [])];
    response.setHeader('Content-Type', 'text/javascript');
    response.end(template.replace("'__RELEASE__'", JSON.stringify(release)).replace('__AUDIO_RELEASE__', 'qa-audio')
      .replace('/* CORE_ASSETS */ []', JSON.stringify(core)).replace('/* AUDIO_ASSETS */ []', '["/music/test.mp3"]').replace('/* AUDIO_BYTES */ 0', '12'));
  } else if (url.pathname === '/' || url.pathname === '/index.html') {
    response.setHeader('Content-Type', 'text/html');
    response.end(`<p>${release}</p><script src="/assets/game-${release}.js"></script>`);
  } else if (url.pathname.startsWith('/assets/game-')) {
    response.setHeader('Content-Type', 'text/javascript');
    response.end(`window.gameRelease=${JSON.stringify(url.pathname.match(/game-(.+)\.js/)[1])};`);
  } else if (url.pathname === '/music/test.mp3') {
    response.setHeader('Content-Type', 'audio/mpeg'); response.end('abcdefghijkl');
  } else { response.statusCode = 404; response.end('missing'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const context = await browser.newContext(), page = await context.newPage();
  await page.goto(base);
  await page.evaluate(async () => {
    const unrelated = await caches.open('unrelated-app'); await unrelated.put('/marker', new Response('keep'));
    await navigator.serviceWorker.register('/sw.js'); await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = event => {
        if (event.data.type === 'AUDIO_ERROR') reject(Error(event.data.message));
        if (event.data.type === 'AUDIO_COMPLETE') { channel.port1.close(); resolve(); }
      };
      registration.active.postMessage({ type: 'DOWNLOAD_MUSIC' }, [channel.port2]);
    });
  });
  const ranges = await page.evaluate(async () => {
    const results = [];
    for (const range of ['bytes=2-5', 'bytes=-4', 'bytes=100-']) {
      const response = await fetch('/music/test.mp3', { headers: { Range: range } });
      results.push({ status: response.status, text: await response.text(), range: response.headers.get('content-range') });
    }
    return results;
  });
  assert.deepEqual(ranges, [{ status: 206, text: 'cdef', range: 'bytes 2-5/12' },
    { status: 206, text: 'ijkl', range: 'bytes 8-11/12' }, { status: 416, text: '', range: 'bytes */12' }]);
  release = 'two';
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
  await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration()).waiting);
  assert.equal(await page.evaluate(() => window.gameRelease), 'one', 'updates must not interrupt the running game');
  await context.setOffline(true); await page.reload();
  assert.equal(await page.evaluate(() => window.gameRelease), 'one', 'a waiting update must preserve the current offline release');
  await context.setOffline(false);
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const activated = new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    registration.waiting.postMessage({ type: 'ACTIVATE_UPDATE' }); await activated;
  });
  await page.reload();
  assert.equal(await page.evaluate(() => window.gameRelease), 'two');
  assert.deepEqual((await page.evaluate(() => caches.keys())).sort(),
    ['starlight-fishing-audio-qa-audio', 'starlight-fishing-core-two', 'unrelated-app']);
  release = 'broken';
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      installing.addEventListener('statechange', () => { if (installing.state === 'redundant') window.failedInstall = true; });
    });
    await registration.update();
  });
  await page.waitForFunction(() => window.failedInstall);
  await context.setOffline(true); await page.reload();
  assert.equal(await page.evaluate(() => window.gameRelease), 'two', 'failed downloads must leave a working offline game');
  assert.ok(!(await page.evaluate(() => caches.keys())).includes('starlight-fishing-core-broken'));
  console.log('PASS offline lifecycle: atomic downloads, safe waiting updates, explicit activation, failed-update recovery, unrelated cache preservation, music reuse and audio range requests');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }

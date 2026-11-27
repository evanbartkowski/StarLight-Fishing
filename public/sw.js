const RELEASE = '__RELEASE__';
const CORE_ASSETS = /* CORE_ASSETS */ [];
const AUDIO_ASSETS = /* AUDIO_ASSETS */ [];
const AUDIO_BYTES = /* AUDIO_BYTES */ 0;
const AUDIO_PATHS = new Map(AUDIO_ASSETS.map(path => [decodeURIComponent(path), path]));
const CORE_CACHE = `starlight-fishing-core-${RELEASE}`;
const AUDIO_CACHE = 'starlight-fishing-audio-__AUDIO_RELEASE__';
let audioDownload = null;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    try { await cache.addAll(CORE_ASSETS.map(url => new Request(url, { cache: 'reload' }))); }
    catch (error) { await caches.delete(CORE_CACHE); throw error; }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('starlight-fishing-') && name !== CORE_CACHE && name !== AUDIO_CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

async function audioResponse(request, cached) {
  const range = request.headers.get('range');
  if (!range) return cached;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) return new Response(null, { status: 416 });
  const blob = await cached.blob();
  const start = match[1] ? Number(match[1]) : Math.max(0, blob.size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(blob.size - 1, Number(match[2])) : blob.size - 1;
  if (start > end || start >= blob.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${blob.size}` } });
  return new Response(blob.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': cached.headers.get('content-type') || 'audio/mpeg',
    'Content-Range': `bytes ${start}-${end}/${blob.size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes',
  } });
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  let decodedPath;
  try { decodedPath = decodeURIComponent(url.pathname); } catch { return; }
  if (request.mode === 'navigate') {
    // A cached document and its complete bundle set always belong to one release.
    event.respondWith((async () => (await (await caches.open(CORE_CACHE)).match('/index.html')) || fetch(request))());
  } else if (CORE_ASSETS.includes(url.pathname) || url.pathname.startsWith('/assets/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CORE_CACHE), cached = await cache.match(url.pathname);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') await cache.put(url.pathname, response.clone());
      return response;
    })());
  } else if (AUDIO_PATHS.has(decodedPath)) {
    event.respondWith((async () => {
      const cached = await (await caches.open(AUDIO_CACHE)).match(AUDIO_PATHS.get(decodedPath));
      if (cached) return audioResponse(request, cached);
      return fetch(request);
    })());
  }
});

self.addEventListener('message', event => {
  const port = event.ports[0];
  if (event.data?.type === 'ACTIVATE_UPDATE') { self.skipWaiting(); return; }
  if (!port) return;
  if (event.data?.type === 'OFFLINE_STATUS') {
    event.waitUntil((async () => {
      const cache = await caches.open(CORE_CACHE);
      const ready = CORE_ASSETS.length > 0 && !!(await cache.match('/index.html'));
      const audio = await caches.open(AUDIO_CACHE), music = await audio.keys();
      port.postMessage({ type: 'OFFLINE_STATUS', ready, release: RELEASE, audioBytes: AUDIO_BYTES,
        musicReady: AUDIO_ASSETS.every(url => music.some(request => new URL(request.url).pathname === url)) });
    })());
  }
  if (event.data?.type === 'DOWNLOAD_MUSIC') {
    event.waitUntil((async () => {
      if (audioDownload) { port.postMessage({ type: 'AUDIO_ERROR', message: 'A music download is already running.' }); return; }
      audioDownload = (async () => {
        const cache = await caches.open(AUDIO_CACHE);
        for (const [index, url] of AUDIO_ASSETS.entries()) {
          if (!(await cache.match(url))) {
            const response = await fetch(new Request(url, { cache: 'reload' }));
            if (!response.ok || response.status === 206) throw Error('Music download interrupted. Reconnect and try again.');
            await cache.put(url, response);
          }
          port.postMessage({ type: 'AUDIO_PROGRESS', done: index + 1, total: AUDIO_ASSETS.length });
        }
      })();
      try { await audioDownload; port.postMessage({ type: 'AUDIO_COMPLETE' }); }
      catch (error) { port.postMessage({ type: 'AUDIO_ERROR', message: error.message }); }
      finally { audioDownload = null; }
    })());
  }
});

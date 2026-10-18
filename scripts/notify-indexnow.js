#!/usr/bin/env node

/**
 * IndexNow URL Notification Script for Starlight Fishing
 *
 * Submits updated URLs to the IndexNow protocol (used by Bing, Yandex, Brave, Seznam, etc.)
 * Protocol specs: https://www.indexnow.org/documentation
 */

const HOST = 'starlightfishing.com';
const KEY = '89c1b7f23e4a49688da53f9e2d6b701c';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Default to homepage canonical URL, or take extra URLs from process.argv
const defaultUrls = [
  `https://${HOST}/`,
];

const urls = process.argv.slice(2).length > 0 ? process.argv.slice(2) : defaultUrls;

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

const ENDPOINTS = [
  { name: 'IndexNow Global (api.indexnow.org)', url: 'https://api.indexnow.org/indexnow' },
  { name: 'Microsoft Bing (www.bing.com)', url: 'https://www.bing.com/indexnow' },
  { name: 'Yandex (yandex.com)', url: 'https://yandex.com/indexnow' },
];

async function notifyEndpoint(endpoint) {
  try {
    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'StarlightFishing-IndexNow/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 200 || res.status === 202) {
      console.log(`[IndexNow] ${endpoint.name}: SUCCESS (${res.status}) - URLs submitted successfully`);
      return true;
    } else {
      const errorText = await res.text().catch(() => '');
      console.warn(`[IndexNow] ${endpoint.name}: Status ${res.status} - ${errorText || res.statusText}`);
      return false;
    }
  } catch (err) {
    console.warn(`[IndexNow] ${endpoint.name}: Network error - ${err.message}`);
    return false;
  }
}

export async function runIndexNow() {
  console.log(`[IndexNow] Notifying search engines for host: ${HOST}`);
  console.log(`[IndexNow] Key Location: ${KEY_LOCATION}`);
  console.log(`[IndexNow] URLs: ${urls.join(', ')}`);

  const results = await Promise.all(ENDPOINTS.map(notifyEndpoint));
  const successCount = results.filter(Boolean).length;
  console.log(`[IndexNow] Finished: ${successCount}/${ENDPOINTS.length} endpoints accepted notification.`);
  return successCount;
}

// Auto-run when executed directly from node CLI
if (process.argv[1] && process.argv[1].endsWith('notify-indexnow.js')) {
  runIndexNow();
}


import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const base = process.argv[2] ? new URL(process.argv[2]) : null;
const agents = base ? ['StarlightFaviconCheck/1.0', 'Googlebot', 'Googlebot-Image', 'Google-Favicon'] : ['build'];
const pngSignature = Buffer.from('89504e470d0a1a0a', 'hex');
const failures = [];

function pngSize(data) {
  assert.ok(data.subarray(0, 8).equals(pngSignature), 'Expected PNG bytes, not an HTML fallback/challenge');
  return `${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`;
}

function icoSizes(data) {
  assert.equal(data.readUInt32LE(0), 65536, 'Invalid ICO header');
  const count = data.readUInt16LE(4);
  assert.ok(count > 0, 'ICO must contain images');
  return Array.from({ length: count }, (_, i) => {
    const entry = 6 + i * 16;
    const size = `${data[entry] || 256}x${data[entry + 1] || 256}`;
    const length = data.readUInt32LE(entry + 8);
    const offset = data.readUInt32LE(entry + 12);
    assert.ok(offset >= 6 + count * 16 && offset + length <= data.length, 'Invalid ICO image offset');
    assert.equal(pngSize(data.subarray(offset, offset + length)), size, 'ICO frame dimensions disagree');
    return size;
  });
}

// Longest matching user-agent group and path rule; Allow wins equal-length ties.
function allowedByRobots(text, agent, pathname) {
  const groups = [];
  let group;
  for (const line of text.split(/\r?\n/)) {
    const [field, ...rest] = line.split('#')[0].split(':');
    const value = rest.join(':').trim();
    if (field.trim().toLowerCase() === 'user-agent') {
      if (!group || group.rules.length) groups.push(group = { agents: [], rules: [] });
      group.agents.push(value.toLowerCase());
    } else if (group && /^(allow|disallow)$/i.test(field.trim()) && value) {
      group.rules.push({ allow: field.trim().toLowerCase() === 'allow', value });
    }
  }
  const specificity = group => Math.max(-1, ...group.agents.map(a =>
    a === '*' ? 0 : agent.toLowerCase().includes(a) ? a.length : -1));
  const best = Math.max(-1, ...groups.map(specificity));
  const matches = groups.filter(g => specificity(g) === best).flatMap(g => g.rules).filter(rule => {
    const pattern = rule.value.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
    return new RegExp(`^${pattern}`).test(pathname);
  }).sort((a, b) => b.value.replaceAll('*', '').length - a.value.replaceAll('*', '').length || Number(b.allow) - Number(a.allow));
  return matches[0]?.allow ?? true;
}

function links(html) {
  return [...html.split(/<\/head>/i)[0].matchAll(/<link\b[^>]*>/gi)].map(([tag]) =>
    Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(([, key, value]) => [key, value]))
  ).filter(link => ['icon', 'apple-touch-icon', 'manifest'].includes(link.rel));
}

for (const agent of agents) {
  try {
    async function read(urlPath, type) {
      if (!base) {
        assert.ok(urlPath.startsWith('/') && !urlPath.includes('..'), 'Expected a root-relative asset path');
        const data = await fs.readFile(path.join(root, 'dist', urlPath.slice(1) || 'index.html'));
        if (urlPath !== '/') {
          assert.ok(data.equals(await fs.readFile(path.join(root, 'public', urlPath.slice(1)))), `${urlPath} differs from public/`);
        }
        return data;
      }
      const url = new URL(urlPath, base);
      const response = await fetch(url, { headers: { 'User-Agent': agent }, signal: AbortSignal.timeout(20000) });
      assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
      assert.notEqual(response.headers.get('cf-mitigated'), 'challenge', `${url}: Cloudflare challenge`);
      assert.ok(!/noindex|noimageindex|none/i.test(response.headers.get('x-robots-tag') || ''), `${url}: restrictive X-Robots-Tag`);
      assert.ok((response.headers.get('content-type') || '').includes(type), `${url}: expected ${type}, received ${response.headers.get('content-type')}`);
      if (url.pathname.endsWith('.ico')) {
        assert.match(response.headers.get('content-type'), /^image\/(x-icon|vnd\.microsoft\.icon)(;|$)/i, `${url}: wrong ICO MIME type`);
      }
      console.log(`OK [${agent}] ${url} (${response.headers.get('content-type')})`);
      return Buffer.from(await response.arrayBuffer());
    }

    const html = (await read('/', 'text/html')).toString();
    assert.ok(!/<meta[^>]+content=["'][^"']*\b(noindex|none)\b/i.test(html), 'Homepage has a noindex directive');
    const robots = (await read('/robots.txt', 'text/plain')).toString();
    assert.ok(allowedByRobots(robots, 'Googlebot', '/'), 'robots.txt blocks Googlebot from the homepage');
    const icons = links(html);
    assert.ok(icons.some(i => i.rel === 'icon' && i.type === 'image/png'), 'Homepage must advertise a PNG favicon');
    assert.ok(icons.some(i => i.rel === 'apple-touch-icon'), 'Missing Apple touch icon link');
    const manifestLink = icons.find(i => i.rel === 'manifest');
    assert.ok(manifestLink, 'Missing web manifest link');
    const manifest = JSON.parse((await read(manifestLink.href, 'application/manifest+json')).toString());
    const images = new Map(icons.filter(i => i.rel !== 'manifest').map(i => [i.href, i]));
    for (const icon of manifest.icons) images.set(icon.src, icon);
    if (!base) {
      for (const size of [16, 32, 48, 96, 144, 192, 512]) {
        images.set(`/favicon-${size}x${size}.png`, { sizes: `${size}x${size}` });
      }
    }
    images.set('/favicon.ico', images.get('/favicon.ico') || {});
    for (const [href, icon] of images) {
      const pathname = new URL(href, base || 'https://starlightfishing.com').pathname;
      for (const bot of ['Googlebot-Image', 'Google-Favicon']) {
        assert.ok(allowedByRobots(robots, bot, pathname), `robots.txt blocks ${bot} from ${href}`);
      }
      const ext = path.extname(pathname);
      const type = { '.png': 'image/png', '.ico': 'image/', '.svg': 'image/svg+xml' }[ext];
      assert.ok(type, `Unsupported icon extension: ${ext}`);
      const data = await read(href, type);
      if (ext === '.png') {
        const size = pngSize(data);
        assert.equal(size.split('x')[0], size.split('x')[1], `${href} must be square`);
        if (icon.sizes) assert.equal(size, icon.sizes, `${href}: wrong dimensions`);
        if (icon.rel === 'apple-touch-icon') assert.equal(size, '180x180');
      } else if (ext === '.ico') {
        const sizes = icoSizes(data);
        if (icon.sizes) {
          for (const size of icon.sizes.split(' ')) assert.ok(sizes.includes(size), `ICO is missing advertised size ${size}`);
        }
        if (!base) assert.deepEqual(sizes, ['16x16', '32x32', '48x48', '96x96', '256x256']);
      }
    }
    console.log(`PASS [${agent}] favicon assets, dimensions, head links, manifest, and robots.txt`);
  } catch (error) {
    failures.push(`[${agent}] ${error.message}`);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
if (base) console.log('User-agent probes do not verify requests from real Google IPs; confirm those in Search Console and Cloudflare Security Events.');

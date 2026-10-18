import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const logoPath = path.join(publicDir, 'starlight-logo.png');

function buildIco(images) {
  // images: Array<{ width, height, buffer }>
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = images.length;
  let currentOffset = headerSize + dirEntrySize * numImages;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(numImages, 4); // Number of images

  const entries = [];
  const bodies = [];

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Image size in bytes
    entry.writeUInt32LE(currentOffset, 12); // Offset of image data
    entries.push(entry);
    bodies.push(img.buffer);
    currentOffset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...bodies]);
}

async function generate() {
  console.log('[Favicon Generator] Reading master logo:', logoPath);
  const logoData = fs.readFileSync(logoPath);
  const base64Src = `data:image/png;base64,${logoData.toString('base64')}`;

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();

  const sizes = [16, 32, 48, 96, 144, 180, 192, 512];
  const rendered = {};

  for (const sz of sizes) {
    const dataUrl = await page.evaluate(async ({ src, size }) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, size, size);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = src;
      });
    }, { src: base64Src, size: sz });

    const rawBase64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    rendered[sz] = Buffer.from(rawBase64, 'base64');
    console.log(`[Favicon Generator] Generated ${sz}x${sz} (${rendered[sz].length} bytes)`);
  }

  await browser.close();

  // Write PNG files
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), rendered[48]);
  fs.writeFileSync(path.join(publicDir, 'favicon-96x96.png'), rendered[96]);
  fs.writeFileSync(path.join(publicDir, 'favicon-144x144.png'), rendered[144]);
  fs.writeFileSync(path.join(publicDir, 'favicon-192x192.png'), rendered[192]);
  fs.writeFileSync(path.join(publicDir, 'favicon-512x512.png'), rendered[512]);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), rendered[180]);

  // Build and write favicon.ico containing 16x16, 32x32, 48x48
  const icoBuffer = buildIco([
    { width: 16, height: 16, buffer: rendered[16] },
    { width: 32, height: 32, buffer: rendered[32] },
    { width: 48, height: 48, buffer: rendered[48] },
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log(`[Favicon Generator] Wrote favicon.ico (${icoBuffer.length} bytes)`);

  // Create site.webmanifest
  const manifest = {
    name: 'Starlight Fishing',
    short_name: 'Starlight',
    description: 'Free online browser-based fishing adventure game across 7 mystical realms.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a1128',
    theme_color: '#0a1128',
    icons: [
      {
        src: '/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/favicon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('[Favicon Generator] Wrote site.webmanifest');
  console.log('[Favicon Generator] Done!');
}

generate().catch(err => {
  console.error('[Favicon Generator] Error:', err);
  process.exit(1);
});

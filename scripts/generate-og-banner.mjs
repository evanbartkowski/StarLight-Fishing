import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const logoPath = path.join(publicDir, 'starlight-logo.png');
const outPath = path.join(publicDir, 'og-banner.png');

async function generateBanner() {
  const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
  const browser = await chromium.launch({ headless: true }).catch(() =>
    chromium.launch({ channel: 'msedge', headless: true })
  );
  try {
    const page = await browser.newPage();
    const dataUrl = await page.evaluate(async (logoSrc) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');

      // Deep night ocean sky gradient
      const bg = ctx.createLinearGradient(0, 0, 1200, 630);
      bg.addColorStop(0, '#040b1e');
      bg.addColorStop(0.52, '#0a1c42');
      bg.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1200, 630);

      // Celestial radial glow behind logo
      const glow = ctx.createRadialGradient(265, 300, 20, 265, 300, 290);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      glow.addColorStop(0.6, 'rgba(129, 140, 248, 0.14)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1200, 630);

      // Twinkling stars
      for (let i = 0; i < 65; i++) {
        const sx = (i * 197 + 43) % 1200;
        const sy = (i * 113 + 29) % 410;
        const r = i % 5 === 0 ? 2.4 : 1.3;
        ctx.fillStyle = i % 7 === 0 ? 'rgba(250, 204, 21, 0.85)' : 'rgba(248, 250, 252, 0.65)';
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stylized ocean wave bands at bottom
      ctx.fillStyle = 'rgba(2, 132, 199, 0.32)';
      ctx.beginPath();
      ctx.moveTo(0, 495);
      for (let x = 0; x <= 1200; x += 40) {
        ctx.lineTo(x, 495 + Math.sin(x * 0.012) * 16);
      }
      ctx.lineTo(1200, 630);
      ctx.lineTo(0, 630);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(14, 165, 233, 0.24)';
      ctx.beginPath();
      ctx.moveTo(0, 535);
      for (let x = 0; x <= 1200; x += 40) {
        ctx.lineTo(x, 535 + Math.cos(x * 0.015) * 14);
      }
      ctx.lineTo(1200, 630);
      ctx.lineTo(0, 630);
      ctx.closePath();
      ctx.fill();

      // Framed rounded logo
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = logoSrc;
      });

      const lx = 110, ly = 165, lw = 280, lh = 280, rad = 46;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(lx, ly, lw, lh, rad);
      ctx.clip();
      ctx.drawImage(img, lx, ly, lw, lh);
      ctx.restore();

      ctx.strokeStyle = 'rgba(125, 211, 252, 0.75)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(lx, ly, lw, lh, rad);
      ctx.stroke();

      // Typography & CTA pill
      ctx.textAlign = 'left';
      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 22px "Outfit", "Segoe UI", sans-serif';
      ctx.fillText('STARLIGHTFISHING.COM', 435, 198);

      const titleGrad = ctx.createLinearGradient(435, 220, 1080, 290);
      titleGrad.addColorStop(0, '#f8fafc');
      titleGrad.addColorStop(0.55, '#bae6fd');
      titleGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = titleGrad;
      ctx.font = '900 66px "Outfit", "Segoe UI", sans-serif';
      ctx.fillText('Starlight Fishing', 432, 274);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 28px "Outfit", "Segoe UI", sans-serif';
      ctx.fillText('Explore 7 Enchanted Ocean Realms', 435, 330);
      ctx.fillText('Catch 290+ Rare Fish, Titans & Custom Aquarium', 435, 370);

      // Pill badges
      const chips = ['🌊 7 Ocean Seas', '🏆 Weekly Derby', '⛵ Custom Vessels'];
      let cx = 435;
      ctx.font = '700 20px "Outfit", "Segoe UI", sans-serif';
      for (const label of chips) {
        const w = ctx.measureText(label).width + 32;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx, 405, w, 44, 22);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#e0f2fe';
        ctx.fillText(label, cx + 16, 434);
        cx += w + 14;
      }

      // Primary CTA pill
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.roundRect(435, 476, 355, 56, 28);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 24px "Outfit", "Segoe UI", sans-serif';
      ctx.fillText('PLAY FREE IN BROWSER →', 462, 513);

      return canvas.toDataURL('image/png');
    }, logoBase64);

    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
    console.log('[OG Banner] Generated:', outPath);
  } finally {
    await browser.close();
  }
}

generateBanner();

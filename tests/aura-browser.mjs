import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 520 } });
  await page.route(/googleapis\.com|cloudfunctions\.net|identitytoolkit|securetoken/, route => route.abort());
  await page.goto(process.env.GAME_TEST_URL || 'http://127.0.0.1:5174/');
  await page.evaluate(async () => {
    const { drawAura } = await import('/src/rendering/AuraRenderer.js');
    const { Fish } = await import('/src/entities/Fish.js');
    const { Treasure } = await import('/src/entities/Treasure.js');
    const { FISH_SPECIES } = await import('/src/data/FishData.js');
    const { TREASURE_ITEMS } = await import('/src/data/TreasureData.js');
    const canvas = document.createElement('canvas');
    canvas.id = 'aura-preview'; canvas.width = 1000; canvas.height = 520;
    canvas.style.cssText = 'position:fixed;inset:0;z-index:999999;width:1000px;height:520px';
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#061725'; ctx.fillRect(0, 0, 1000, 520);
    ctx.fillStyle = '#d6ecfa'; ctx.font = '22px sans-serif'; ctx.fillText('Soft, breathing fish & crate auras', 30, 42);
    const rarities = ['uncommon', 'rare', 'epic', 'legendary'];
    rarities.forEach((rarity, index) => {
      const species = FISH_SPECIES.find(f => f.rarity === rarity);
      const fish = new Fish(species, 125 + index * 250, 160);
      fish.y = 160; // Preview positions intentionally bypass habitat-depth clamping.
      fish.scale = 1.15; fish.isShiny = false; fish.auraTime = index * 1.4;
      fish.render(ctx, 0);
      const crate = new Treasure(TREASURE_ITEMS.find(t => t.isCrate && t.crateRank === index + 2), 125 + index * 250, 370);
      crate.timer = index * 3.5; crate.render(ctx, 0);
      ctx.fillStyle = '#abc5d6'; ctx.font = '15px sans-serif'; ctx.fillText(rarity, 90 + index * 250, 235);
    });
    const probe = document.createElement('canvas'); probe.width = probe.height = 180;
    const p = probe.getContext('2d');
    window.auraSnapshot = time => {
      p.clearRect(0, 0, 180, 180); p.save(); p.translate(90, 90);
      drawAura(p, time, '#a855f7', 65); p.restore(); return probe.toDataURL();
    };
  });
  const animated = await page.evaluate(() => [window.auraSnapshot(0), window.auraSnapshot(1)]);
  assert.notEqual(animated[0], animated[1], 'pulse must visibly change pixels');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const still = await page.evaluate(() => [window.auraSnapshot(0), window.auraSnapshot(1)]);
  assert.equal(still[0], still[1], 'reduced motion must freeze the aura');
  await page.locator('#aura-preview').screenshot({ path: 'tests/aura-preview.png' });
  console.log('PASS aura browser: changing pixels, reduced motion, fish/crate preview');
} finally { await browser.close(); }

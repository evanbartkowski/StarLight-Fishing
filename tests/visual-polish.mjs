import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 760 } });
  await page.route(/googleapis\.com|cloudfunctions\.net/, route => route.abort());
  await page.goto(process.env.GAME_TEST_URL || 'http://127.0.0.1:5174/');
  const result = await page.evaluate(async () => {
    const [{ Fish }, { FISH_SPECIES }, { Treasure }, { TREASURE_ITEMS }, { OceanWorld }, { saveSystem }, { drawEventAtmosphere }] = await Promise.all([
      import('/src/entities/Fish.js'), import('/src/data/FishData.js'), import('/src/entities/Treasure.js'),
      import('/src/data/TreasureData.js'), import('/src/world/OceanWorld.js'), import('/src/systems/SaveSystem.js'), import('/src/rendering/EventAtmosphere.js'),
    ]);
    const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 760;
    canvas.style.cssText = 'position:fixed;inset:0;z-index:999999'; canvas.id = 'polish-preview'; document.body.append(canvas);
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#071c2e'; ctx.fillRect(0, 0, 1000, 760);
    const label = (text, x, y) => { ctx.fillStyle = '#d9f2f6'; ctx.font = '15px sans-serif'; ctx.fillText(text, x, y); };
    label('Same fish, alternate body colors, matching rarity aura', 24, 30);
    const captures = [];
    ['common', 'rare', 'epic', 'legendary'].forEach((rarity, index) => {
      const species = FISH_SPECIES.find(f => f.rarity === rarity && !f.isLeviathan);
      const fish = new Fish(species, index * 245 + 65, 110, { shinyChance: 0 });
      fish.y = 110; fish.crown = null; fish.scale = 1.05; fish.mutation = null;
      fish.wiggleTimer = 0; fish.auraTime = 0; fish.direction = 1;
      // The same entity's outer glow must be identical when only shiny changes.
      const probe = document.createElement('canvas'); probe.width = probe.height = 180;
      const p = probe.getContext('2d'); fish.x = 90; fish.y = 90;
      fish.render(p); const normal = p.getImageData(0, 0, 180, 180).data;
      p.clearRect(0, 0, 180, 180); fish.isShiny = true; fish.render(p);
      const shiny = p.getImageData(0, 0, 180, 180).data;
      let different = 0, outerDifferences = 0;
      for (let i = 0; i < normal.length; i += 4) {
        const x = (i / 4) % 180, y = Math.floor(i / 4 / 180);
        if (normal[i] !== shiny[i] || normal[i + 1] !== shiny[i + 1] || normal[i + 2] !== shiny[i + 2]) {
          different++; if (Math.abs(x - 90) > 65 || Math.abs(y - 90) > 45) outerDifferences++;
        }
      }
      captures.push({ rarity, different, outerDifferences });
      fish.x = index * 245 + 65; fish.y = 110; fish.isShiny = false; fish.render(ctx);
      fish.x += 110; fish.isShiny = true; fish.render(ctx);
      label(rarity, index * 245 + 65, 168);
    });
    label('Mineral impressions and fossil aura', 24, 214);
    TREASURE_ITEMS.filter(item => item.fossilShape).slice(0, 7).forEach((item, i) => new Treasure(item, 65 + i * 140, 268).render(ctx));
    const world = new OceanWorld({ width: 600, height: 500 });
    world.saveSystem = saveSystem; saveSystem.isPetEquipped = () => true;
    world.boat.vesselLevel = 2; world.boat.x = 300; world.boat.y = world.surfaceY - 14;
    world.dolphin.update(4000, world.surfaceY, 'RAIN'); world.shark.update(4000, world.boat, world.surfaceY);
    world.shark.isHovered = true;
    ctx.save(); ctx.translate(160, 205); world.renderBoatAndFisherman(ctx); ctx.restore();
    label('Crew: cat, pelican, Gracie and Irene', 24, 365);
    const weather = [];
    for (const [i, id] of ['blood_moon', 'abyssal_storm', 'aurora_borealis'].entries()) {
      const c = document.createElement('canvas'); c.width = 310; c.height = 150;
      const p = c.getContext('2d'); p.fillStyle = '#0c3348'; p.fillRect(0, 0, 310, 150);
      drawEventAtmosphere(p, { active: true, id }, 12, 310, 150, 180, 0, i + 1);
      weather.push(c.toDataURL()); ctx.drawImage(c, i * 330 + 10, 575); label(id.replaceAll('_', ' '), i * 330 + 20, 747);
    }
    return { captures, uniqueWeather: new Set(weather).size };
  });
  for (const fish of result.captures) {
    assert.ok(fish.different > 30, `${fish.rarity} shiny must have different body pixels`);
    assert.equal(fish.outerDifferences, 0, `${fish.rarity} shiny must retain identical outer aura`);
  }
  assert.equal(result.uniqueWeather, 3);
  await page.locator('#polish-preview').screenshot({ path: 'tests/polish-preview.png' });
  console.log('PASS visual polish: shiny pixels and aura, fossils, crew, three event atmospheres');
} finally { await browser.close(); }

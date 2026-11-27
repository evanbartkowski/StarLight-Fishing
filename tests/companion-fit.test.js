import test from 'node:test';
import assert from 'node:assert/strict';
import { ShipsCat, PerchingPelican, BackgroundDolphin } from '../src/entities/BoatCompanions.js';
import { getVesselLayout, getSubmarineCockpit } from '../src/rendering/VesselRenderer.js';

test('crew has room beside the captain across every boat tier and hull', () => {
  for (const style of ['standard', 'pirate', 'submarine', 'chinese_junk', 'viking', 'ghost_ship', 'steampunk']) {
    for (let tier = 0; tier <= 8; tier++) {
      const layout = getVesselLayout(tier, 140, 40, style);
      assert.ok(layout.catScale > 0 && layout.catScale <= 1, `${style}/${tier}: cat needs a boat-sized perch`);
      assert.ok(layout.pelicanScale > 0 && layout.pelicanScale <= 1);
      assert.ok(layout.catPos.x + 17 * layout.catScale < layout.anglerPos.x - 10 * (layout.anglerScale || 1), `${style}/${tier}: cat overlaps captain`);
      assert.ok(layout.pelicanPos.x - 12 * layout.pelicanScale > layout.anglerPos.x + 11 * (layout.anglerScale || 1), `${style}/${tier}: bird overlaps captain`);
      if (style === 'submarine') {
        const dome = getSubmarineCockpit();
        assert.ok(layout.catPos.x + 20 * layout.catScale < dome.x - dome.radius);
        assert.ok(layout.pelicanPos.x - 13 * layout.pelicanScale > dome.x + dome.radius);
      }
    }
  }
});

test('pet interaction follows its actual position during swims and flights', () => {
  const cat = new ShipsCat(), bird = new PerchingPelican();
  const catPos = cat.getDeckPosition(8, 'submarine'), birdPos = bird.getBowspritPosition(8, 'submarine');
  cat.swimAdventure = { xOffset: 70, yOffset: 30, facing: 1 };
  bird.skyFlight = { xOffset: 90, yOffset: -100, facing: -1 };
  assert.equal(cat.hitTest(catPos.x, catPos.y, 8, 'submarine'), false, 'an empty cushion must not intercept a cast');
  assert.equal(cat.hitTest(catPos.x + 70, catPos.y + 30, 8, 'submarine'), true);
  assert.equal(bird.hitTest(birdPos.x, birdPos.y, 8, 'submarine'), false);
  assert.equal(bird.hitTest(birdPos.x + 90, birdPos.y - 100, 8, 'submarine'), true);
});

test('a dolphin cruises below a wide boat instead of leaping through its hull on a phone', () => {
  const dolphin = new BackgroundDolphin(390);
  dolphin.update(1200, 220, 'CLEAR', { x: 195, halfWidth: 100 });
  assert.equal(dolphin.arcY, 0);
  assert.ok(dolphin.y - 24 > 250, 'the full dolphin must clear the submerged hull');
});

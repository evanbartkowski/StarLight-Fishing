import test from 'node:test';
import assert from 'node:assert/strict';
import { ShipsCat } from '../src/entities/BoatCompanions.js';
import { getVesselLayout } from '../src/rendering/VesselRenderer.js';

test('Angela and her cushion rest on the Flying Dutchman deck surface', () => {
  const layout = getVesselLayout(8, 140, 40, 'ghost_ship');
  const cushionBottom = layout.catPos.y + 11 * layout.catScale;
  assert.ok(Math.abs(cushionBottom - (-16)) < .01, 'the bottom of the cushion must meet the actual deck');
});

test('Angela swims at the actual waterline outside the Flying Dutchman, including boat roll', () => {
  for (const angle of [-.12, 0, .12]) {
    const cat = new ShipsCat(), layout = getVesselLayout(8, 140, 40, 'ghost_ship');
    cat.triggerRareSwim(); cat.update(3600);
    const frame = { boatX: 400, boatY: 198, surfaceY: 220, angle, scale: 1 };
    const pose = cat.getPose?.(8, 'ghost_ship', frame) || {
      x: layout.catPos.x + cat.swimAdventure.xOffset, y: layout.catPos.y + cat.swimAdventure.yOffset,
    };
    const worldX = frame.boatX + pose.x * Math.cos(angle) - pose.y * Math.sin(angle);
    const worldY = frame.boatY + pose.x * Math.sin(angle) + pose.y * Math.cos(angle);
    assert.ok(worldX < frame.boatX - layout.halfWidth - 15, 'Angela must swim beyond the hull, not across the deck');
    assert.ok(Math.abs(worldY - (frame.surfaceY - 4 * layout.catScale)) < 1, 'Angela must touch the water instead of floating above it');
  }
});

test('Angela completes her fishing animation and lands back on her perch', () => {
  const cat = new ShipsCat(); cat.triggerRareSwim(); cat.update(3600);
  assert.equal(cat.swimAdventure.fishCaught, true);
  cat.update(4000);
  assert.equal(cat.swimAdventure, null);
  const layout = getVesselLayout(8, 140, 40, 'ghost_ship');
  if (cat.getPose) assert.deepEqual(cat.getPose(8, 'ghost_ship').x, layout.catPos.x);
});

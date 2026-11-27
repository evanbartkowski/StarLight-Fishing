import test from 'node:test';
import assert from 'node:assert/strict';
import { TREASURE_ITEMS } from '../src/data/TreasureData.js';
import { getTreasureArt } from '../src/ui/CustomVectorArt.js';

test('every dredged object has identifiable art recoverable from older saved IDs', () => {
  const art = new Set();
  for (const item of TREASURE_ITEMS.filter(item => !item.isCrate)) {
    const svg = getTreasureArt(item);
    assert.ok(svg.includes(`data-treasure="${item.id}"`), `${item.name} needs its own shared artwork`);
    assert.equal(getTreasureArt({ id: item.id, name: item.name, type: 'trinket' }), svg, `${item.name} must survive saving`);
    art.add(svg);
  }
  assert.equal(art.size, TREASURE_ITEMS.filter(item => !item.isCrate).length);
});

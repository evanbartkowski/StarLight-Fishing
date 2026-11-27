import test from 'node:test';
import assert from 'node:assert/strict';
import { Fish } from '../src/entities/Fish.js';
import { FISH_SPECIES } from '../src/data/FishData.js';
import { DriftBottle } from '../src/entities/DriftItems.js';
import { DRIFT_MESSAGES, getRandomBottleMessage, normalizeBottleMessage } from '../src/data/DriftMessages.js';
import { hasFantasyTrail } from '../src/rendering/FishAppearance.js';
import { TRENCH_FAUNA, VOID_FAUNA } from '../src/rendering/BackgroundFauna.js';
import { OceanWorld } from '../src/world/OceanWorld.js';

function context(overrides = {}) {
  return new Proxy({ save() {}, restore() {},
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    ...overrides,
  }, { get: (target, key) => key in target ? target[key] : () => {} });
}

test('ordinary fish do not inherit the four-dot realm trail', () => {
  const species = { ...FISH_SPECIES.find(f => f.rarity === 'common'), name: 'Plain Reef Cod', fantasyTrail: 'aurora' };
  const fish = new Fish(species, 200, 300); fish.crown = null;
  let dots = 0;
  fish.render(context({ arc(x, y, r) { if ([-24, -30, -36, -42].includes(x) && r === 2) dots++; } }));
  assert.equal(dots, 0);
});

test('surface bottles always carry the complete readable poem or haiku', () => {
  for (let i = 0; i < 120; i++) {
    const { message } = new DriftBottle(10, 220);
    assert.ok(message.text?.trim(), 'surface bottles must normalize lines into text');
    assert.equal(message.text, message.lines.join('\n'));
  }
});

test('legacy bottle records recover canonical lines and escaped line breaks', () => {
  const letter = DRIFT_MESSAGES.find(message => message.type === 'haiku');
  assert.equal(normalizeBottleMessage({ id: letter.id, lines: [], text: '' }).text, letter.lines.join('\n'));
  assert.equal(normalizeBottleMessage({ text: 'First\\nSecond\r\nThird' }).text, 'First\nSecond\nThird');
  assert.equal(normalizeBottleMessage({ lines: ['One\\nTwo'] }).text, 'One\nTwo');
  assert.ok(normalizeBottleMessage(null).text.length > 40);
});

test('trails remain on a small magical subset and deep fauna have four new varieties', () => {
  const count = FISH_SPECIES.filter(hasFantasyTrail).length;
  assert.ok(count > 10 && count < FISH_SPECIES.length / 3, `${count} species have trails`);
  assert.equal(hasFantasyTrail({ name: 'Aurora Prismfish', rarity: 'rare', fantasyTrail: 'aurora' }), true);
  assert.deepEqual([...new Set([...TRENCH_FAUNA, ...VOID_FAUNA].map(creature => creature.type))].sort(),
    ['chrono_nautilus', 'glass_manta', 'gulper', 'ring_ray', 'shadow', 'siphonophore', 'whale']);
});

test('bottles contain mostly poems and a smaller number of haikus', () => {
  const original = Math.random;
  const counts = { poem: 0, haiku: 0, lore: 0 };
  try {
    for (let i = 0; i < 1000; i++) {
      Math.random = () => (i + .5) / 1000;
      counts[getRandomBottleMessage().type]++;
    }
  } finally { Math.random = original; }
  assert.ok(counts.poem >= 750 && counts.poem <= 850, JSON.stringify(counts));
  assert.ok(counts.haiku >= 100 && counts.haiku <= 200);
  assert.ok(counts.lore > 0, 'the secret radio clue must remain obtainable');
  assert.ok(DRIFT_MESSAGES.filter(message => message.type === 'poem').length >= 8);
});

for (const method of ['renderBioluminescentTrenchTitans', 'renderEldritchVoidWhales']) {
  test(`${method} creatures follow the reel camera without vertical wrapping`, () => {
    const world = new OceanWorld({ width: 800, height: 600 });
    world.causticTimer = 60;
    const poses = camera => {
      let last = null; const result = [];
      world[method](context({ translate(x, y) { last = { x, y }; }, scale(x, y) { if (Math.abs(x) > 1 && Math.abs(x) === y && last) result.push(last); } }), camera, 600);
      return result;
    };
    let checked = 0;
    for (let camera = 500; camera < 45000; camera += 250) {
      const before = poses(camera), after = poses(camera + 25);
      if (!before.length || before.length !== after.length) continue;
      for (let index = 0; index < before.length; index++) {
        assert.ok(Math.abs(after[index].y - before[index].y + 25) < 1e-6, `${method}: camera ${camera} moved a creature by ${after[index].y - before[index].y}, expected -25`);
        assert.equal(after[index].x, before[index].x);
        checked++;
      }
    }
    assert.ok(checked > 0, 'there must be background creatures throughout their depth habitats');
  });
}

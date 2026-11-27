import test from 'node:test';
import assert from 'node:assert/strict';
import { Hook } from '../src/entities/Hook.js';
import { Fish } from '../src/entities/Fish.js';
import { FISH_SPECIES } from '../src/data/FishData.js';

test('all catches, including fish between treasures, follow the actual curved line', () => {
  const hook = new Hook();
  Object.assign(hook, { x: 40, y: 900, vx: 180, rodTip: { x: 700, y: 90 }, lineWaveTimer: .7 });
  const fish = new Fish(FISH_SPECIES[0], 0, 0);
  fish.hookTo(hook, 3);
  assert.deepEqual({ x: fish.x, y: fish.y }, hook.getLinePointAbove(118));
});

test('deep line uses the original curve without clamping it toward the screen edge', () => {
  const hook = new Hook();
  Object.assign(hook, { x: 60, y: 900, vx: -180, lineWaveTimer: .7 });
  const calls = [];
  const ctx = new Proxy({ canvas: { width: 320 }, moveTo: (...p) => calls.push(['move', ...p]), quadraticCurveTo: (...p) => calls.push(['curve', ...p]) }, { get: (t, k) => k in t ? t[k] : () => {} });
  hook.renderLine(ctx, 1200, 90, 600);
  assert.deepEqual(calls[0], ['move', 1200, -510]);
  assert.equal(calls[1][1], 630 + 6.3 + Math.sin(.7 * 2.2) * 2.5);
  assert.deepEqual(calls[1].slice(2), [-105, 60, 300]);
});

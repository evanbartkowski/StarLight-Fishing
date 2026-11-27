import test from 'node:test';
import assert from 'node:assert/strict';
import { Hook } from '../src/entities/Hook.js';
import { Treasure } from '../src/entities/Treasure.js';
import { TREASURE_ITEMS } from '../src/data/TreasureData.js';
import { positionLineAttachment } from '../src/entities/LineAttachment.js';

test('non-fish catches stay on the curved line through movement and slot reindexing', () => {
  const hook = new Hook();
  hook.x = 310; hook.y = 980; hook.vx = -220;
  hook.rodTip = { x: 530, y: 90 }; hook.lineWaveTimer = .8;
  for (const config of TREASURE_ITEMS) {
    const item = new Treasure(config, 100, 200);
    for (const slot of [0, 3, 8]) {
      item.hookTo(hook, slot);
      let point = hook.getLinePointAbove(28 + slot * 30);
      assert.deepEqual({ x: item.x, y: item.y }, point, `${config.id} must snap onto the line`);
      hook.x += 12; hook.y -= 14; hook.vx = 180;
      item.update(16, 800, hook);
      point = hook.getLinePointAbove(28 + slot * 30);
      assert.deepEqual({ x: item.x, y: item.y }, point, `${config.id} must follow the line`);
    }
  }
});

test('treasure rendering does not add a second wire from the hook to the catch', () => {
  const hook = new Hook();
  hook.x = 310; hook.y = 980; hook.rodTip = { x: 530, y: 90 };
  const item = new Treasure(TREASURE_ITEMS[0], 100, 200);
  item.hookTo(hook, 3);
  let branches = 0;
  const ctx = new Proxy({
    save() {}, restore() {},
    moveTo(x, y) { if (x === hook.x && y === hook.y - 700) branches++; },
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
  }, { get(target, key) { return key in target ? target[key] : () => {}; } });
  item.render(ctx, 700);
  assert.equal(branches, 0, 'the hook already renders the main wire; catches must not draw diagonal branches');
});

test('sunken-safe attachments follow shallow, deep and zero-length lines', () => {
  const hook = new Hook();
  hook.x = 240; hook.rodTip = { x: 490, y: 100 }; hook.vx = -180;
  const safe = { hook, hookIndex: 2 };
  for (const y of [100, 105, 450, 45000]) {
    hook.y = y;
    positionLineAttachment(safe);
    assert.deepEqual({ x: safe.x, y: safe.y }, hook.getLinePointAbove(88));
    assert.ok(Number.isFinite(safe.x) && Number.isFinite(safe.y));
  }
  safe.hookIndex = 0;
  positionLineAttachment(safe);
  assert.deepEqual({ x: safe.x, y: safe.y }, hook.getLinePointAbove(28));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { GameLoop } from '../src/GameLoop.js';
import { auraFrame, drawAura } from '../src/rendering/AuraRenderer.js';
import { drawDepthScenery } from '../src/rendering/DepthScenery.js';
import { Powerup, POWERUP_TYPES } from '../src/entities/Powerup.js';
import { Treasure } from '../src/entities/Treasure.js';

test('depth scenery preserves the shallow view and fixes rare landmarks to deep world depths', () => {
  const calls = [];
  const ctx = new Proxy({ globalAlpha: 1 }, {
    get: (target, key) => key in target ? target[key] : (...args) => calls.push({ key, args }),
    set: (target, key, value) => { target[key] = value; return true; },
  });
  drawDepthScenery(ctx, 1, 0, 220, 800, 600);
  assert.equal(calls.length, 0);

  drawDepthScenery(ctx, 1, 4420, 220, 800, 600);
  const firstLandmark = calls.filter(call => call.key === 'translate');
  assert.equal(firstLandmark.length, 1);
  calls.length = 0;
  drawDepthScenery(ctx, 1, 4500, 220, 800, 600);
  const nextLandmark = calls.filter(call => call.key === 'translate');
  assert.equal(nextLandmark.length, 1);
  assert.equal(nextLandmark[0].args[1], firstLandmark[0].args[1] - 80);
});

test('powerups render as bright, faceted pickups with a moving ring', () => {
  const calls = [];
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({}, {
    get: (_, key) => key === 'createRadialGradient' ? () => gradient : (...args) => calls.push({ key, args }),
    set: () => true,
  });
  new Powerup(POWERUP_TYPES[0], 100, 200).render(ctx);
  assert.ok(calls.filter(call => call.key === 'lineTo').length >= 7);
  assert.ok(calls.some(call => call.key === 'setLineDash'));
  assert.ok(calls.some(call => call.key === 'fillText' && call.args[0] === POWERUP_TYPES[0].icon));
});

test('realm treasures draw named artifacts without placeholder marks', () => {
  const calls = [];
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1 }, {
    get: (target, key) => key in target ? target[key] : key === 'createRadialGradient' ? () => gradient : (...args) => calls.push({ key, args }),
    set: (target, key, value) => { target[key] = value; return true; },
  });
  new Treasure({ id: 'realm_1_treasure_5', name: 'Reef King Crown', rarity: 'legendary', realmStyle: 'reef', color: '#2dd4bf', glow: '#38bdf8' }, 100, 200).render(ctx);
  assert.ok(calls.filter(call => call.key === 'lineTo').length >= 6);
  assert.ok(!calls.some(call => call.key === 'fillText' && call.args[0] === '?'));
});

test('auras breathe within subtle bounds and freeze for reduced motion', () => {
  for (let t = 0; t < 30; t += 0.05) {
    const frame = auraFrame(t, false);
    assert.ok(frame.scale >= 0.925 && frame.scale <= 1.075);
    assert.ok(frame.blend >= 0.1 && frame.blend <= 0.34);
    assert.deepEqual(auraFrame(t, true), auraFrame(0, true));
  }
  assert.notDeepEqual(auraFrame(0, false), auraFrame(1, false));
});

test('aura textures are reused across frames and entities', () => {
  let gradients = 0, draws = 0;
  globalThis.document = { createElement: () => ({ getContext: () => ({
    createRadialGradient: () => { gradients++; return { addColorStop() {} }; }, fillRect() {},
  }) }) };
  const ctx = { globalAlpha: 0.6, save() { this.alpha = this.globalAlpha; },
    restore() { this.globalAlpha = this.alpha; }, translate() {}, scale() {}, drawImage() { draws++; } };
  try {
    for (let i = 0; i < 120; i++) drawAura(ctx, i / 60, '#a855f7', 60);
    assert.equal(gradients, 2);
    assert.equal(draws, 240);
    assert.equal(ctx.globalAlpha, 0.6);
  } finally { delete globalThis.document; }
});

test('crate bobbing is time based and stays near its spawn', () => {
  const a = new Treasure({ isCrate: true }, 0, 100);
  const b = new Treasure({ isCrate: true }, 0, 100);
  a.timer = b.timer = 0;
  for (let i = 0; i < 600; i++) a.update(1000 / 60);
  for (let i = 0; i < 300; i++) b.update(1000 / 30);
  assert.ok(Math.abs(a.y - b.y) < 1e-9);
  assert.ok(Math.abs(a.y - 100) <= 6);
  const before = a.y;
  a.y += 80; // Magnetic sonar displacement must survive subsequent bobbing.
  a.update(0);
  assert.equal(a.y, before + 80);
});

test('loop handles timestamp zero, repeated starts, stopping and restarting inside callbacks', () => {
  const queue = new Map(); let nextId = 0, updates = 0, renders = 0;
  globalThis.requestAnimationFrame = cb => { const id = nextId++; queue.set(id, cb); return id; };
  globalThis.cancelAnimationFrame = id => queue.delete(id);
  const tick = time => { const [id, cb] = queue.entries().next().value; queue.delete(id); cb(time); };
  const loop = new GameLoop(() => { updates++; }, () => { renders++; });
  try {
    loop.start(); loop.start(); assert.equal(queue.size, 1);
    loop.stop(); assert.equal(queue.size, 0); // RAF identifier zero is valid.
    loop.start(); tick(0); tick(20); assert.equal(updates, 1); assert.equal(renders, 1);
    loop.update = () => loop.stop(); tick(40); assert.equal(queue.size, 0); assert.equal(renders, 1);
    loop.start(); tick(50);
    loop.update = () => { loop.stop(); loop.start(); };
    tick(70); assert.equal(queue.size, 1);
    loop.update = () => {};
    loop.render = () => loop.stop();
    tick(80); tick(100); assert.equal(queue.size, 0);
  } finally { loop.stop(); delete globalThis.requestAnimationFrame; delete globalThis.cancelAnimationFrame; }
});

test('high tier vessels and cloud save structures render completely with finite geometry for tonyath and randomusername', async () => {
  const { drawVesselHull, VESSEL_NAMES } = await import('../src/rendering/VesselRenderer.js');
  const { SaveSystem } = await import('../src/systems/SaveSystem.js');

  assert.equal(VESSEL_NAMES.length, 9);
  assert.equal(VESSEL_NAMES[5], 'Grand Schooner');
  assert.equal(VESSEL_NAMES[6], 'Gilded Brigantine');
  assert.equal(VESSEL_NAMES[7], 'Mythic Celestial Ketch');
  assert.equal(VESSEL_NAMES[8], 'Poseidon Sovereign Galleon');

  // Verify SaveSystem resolves raw number, object, string, or missing upgrade level
  const save = new SaveSystem();
  save.data.upgrades = { boatVessel: 5 };
  assert.equal(save.getUpgradeLevel('boatVessel'), 5);

  save.data.upgrades = { boatVessel: { level: 6 } };
  assert.equal(save.getUpgradeLevel('boatVessel'), 6);

  save.data.upgrades = { boatVessel: '7' };
  assert.equal(save.getUpgradeLevel('boatVessel'), 7);

  save.data.upgrades = {};
  assert.equal(save.getUpgradeLevel('boatVessel'), 0);

  // Verify drawVesselHull produces valid finite rendering operations for all 9 tiers
  for (let tier = 0; tier <= 8; tier++) {
    let ops = 0;
    const ctx = new Proxy({ globalAlpha: 1, filter: 'none', shadowBlur: 0 }, {
      get(target, key) {
        if (key in target) return target[key];
        if (String(key).startsWith('create')) return () => ({ addColorStop() {} });
        return (...args) => {
          ops++;
          for (const val of args) {
            if (typeof val === 'number') {
              assert.ok(Number.isFinite(val), `drawVesselHull tier ${tier} generated non-finite coordinate in ${String(key)}`);
            }
          }
        };
      },
      set(target, key, val) { target[key] = val; return true; }
    });

    drawVesselHull(ctx, tier, 140, 40, 1.25, '#fbbf24');
    assert.ok(ops >= 25, `Tier ${tier} should perform substantial drawing operations`);
  }
});

test('bulletproof vessel, companions, angler, and pet nameplate rendering across all environments', async () => {
  const { drawVesselHull } = await import('../src/rendering/VesselRenderer.js');
  const { drawAngler, drawBoatTrinket, normalizeCustomization, ANGLER_OPTIONS } = await import('../src/data/CustomizationData.js');
  const { drawMarinePet, drawPetNameplate } = await import('../src/rendering/MarinePetArt.js');
  const { ShipsCat, PerchingPelican, BackgroundDolphin, BoatShark } = await import('../src/entities/BoatCompanions.js');

  // Helper mock canvas context tracking save/restore balance and drawing operations
  function createMockCtx(hasRoundRect = false) {
    let saveCount = 0;
    let restoreCount = 0;
    const base = {
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      font: '10px sans-serif',
      textAlign: 'left',
      textBaseline: 'top',
      shadowBlur: 0,
      shadowColor: '#000',
      lineCap: 'round',
      lineJoin: 'round',
    };
    if (hasRoundRect) {
      base.roundRect = () => {};
    }
    return new Proxy(base, {
      get(target, key) {
        if (key === '__saveCount') return saveCount;
        if (key === '__restoreCount') return restoreCount;
        if (key in target) return target[key];
        if (key === 'save') return () => { saveCount++; };
        if (key === 'restore') return () => { restoreCount++; };
        if (key === 'measureText') return (text) => ({ width: (text || '').length * 7 });
        if (String(key).startsWith('create')) return () => ({ addColorStop() {} });
        return () => {};
      },
      set(target, key, val) {
        target[key] = val;
        return true;
      }
    });
  }

  // 1. Verify drawPetNameplate functions flawlessly both with and WITHOUT ctx.roundRect
  const ctxWithRoundRect = createMockCtx(true);
  drawPetNameplate(ctxWithRoundRect, 100, 200, 'Gracie the Dolphin');
  assert.equal(ctxWithRoundRect.__saveCount, ctxWithRoundRect.__restoreCount, 'save/restore must balance with roundRect');

  const ctxWithoutRoundRect = createMockCtx(false);
  drawPetNameplate(ctxWithoutRoundRect, 100, 200, 'Irene the Shark');
  assert.equal(ctxWithoutRoundRect.__saveCount, ctxWithoutRoundRect.__restoreCount, 'save/restore must balance WITHOUT roundRect (fallback)');

  // 2. Verify drawAngler handles null, undefined, and corrupted appearance gracefully
  for (const app of [null, undefined, {}, { coat: 'invalid', hat: 'none' }, { skin: null }]) {
    const ctx = createMockCtx(false);
    drawAngler(ctx, app, 0, 0);
    assert.equal(ctx.__saveCount, ctx.__restoreCount, 'drawAngler must balance save/restore for any input');
  }

  // 3. Verify drawBoatTrinket handles all trinket IDs and edge cases
  const trinkets = ['lucky_cat', 'rubber_duck', 'wind_chime', 'ship_bell', 'pirate_parrot', 'crystal_orb', 'unknown'];
  for (const t of trinkets) {
    const ctx = createMockCtx(false);
    drawBoatTrinket(ctx, t, 4, 1.5, 140, 40);
    assert.equal(ctx.__saveCount, ctx.__restoreCount, `drawBoatTrinket(${t}) must balance save/restore`);
  }

  // 4. Verify all 4 Companions render and balance canvas state
  const cat = new ShipsCat();
  const pelican = new PerchingPelican();
  const dolphin = new BackgroundDolphin(1200);
  const shark = new BoatShark();

  for (let tier = 0; tier <= 8; tier++) {
    const ctx = createMockCtx(false);
    cat.render(ctx, tier);
    assert.equal(ctx.__saveCount, ctx.__restoreCount, `ShipsCat.render tier ${tier} balanced`);

    const ctxP = createMockCtx(false);
    pelican.render(ctxP, tier);
    assert.equal(ctxP.__saveCount, ctxP.__restoreCount, `Pelican.render tier ${tier} balanced`);
  }

  const ctxD = createMockCtx(false);
  dolphin.update(16, 220, 'CLEAR');
  dolphin.render(ctxD, 0);
  assert.equal(ctxD.__saveCount, ctxD.__restoreCount, 'BackgroundDolphin.render balanced');

  const ctxS = createMockCtx(false);
  shark.update(16, { x: 600, y: 206 }, 220);
  shark.render(ctxS, 0);
  assert.equal(ctxS.__saveCount, ctxS.__restoreCount, 'BoatShark.render balanced');

  // 5. Verify drawVesselHull maintains balanced save/restore across all 9 tiers
  for (let tier = 0; tier <= 8; tier++) {
    const ctxH = createMockCtx(false);
    drawVesselHull(ctxH, tier, 140, 40, 0, '#fbbf24');
    assert.equal(ctxH.__saveCount, ctxH.__restoreCount, `drawVesselHull tier ${tier} balanced save/restore`);
  }
});



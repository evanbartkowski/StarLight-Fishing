import test from 'node:test';
import assert from 'node:assert/strict';
import { GameLoop } from '../src/GameLoop.js';
import { auraFrame, drawAura } from '../src/rendering/AuraRenderer.js';
import { drawDepthScenery } from '../src/rendering/DepthScenery.js';
import { Powerup, POWERUP_TYPES } from '../src/entities/Powerup.js';
import { Treasure } from '../src/entities/Treasure.js';
import { getNPCRealmMultiplier, scaleNPCOptions } from '../src/systems/NPCSystem.js';
import { QUEST_POOL } from '../src/data/QuestsData.js';
import { QuestSystem, questReward } from '../src/systems/QuestSystem.js';
import { SoundManager } from '../src/audio/SoundManager.js';
import { Hook } from '../src/entities/Hook.js';
import { VALUE_BY_RARITY, REALM_HAZARDS } from '../src/data/RealmContent.js';
import { HAZARD_TYPES } from '../src/data/TreasureData.js';
import { LEGENDARY_SPECIES } from '../src/data/legendaries.js';
import { FISH_SPECIES } from '../src/data/FishData.js';
import { Hazard } from '../src/entities/Hazard.js';
import { drawNaturalHazard } from '../src/entities/NaturalHazardArt.js';

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

test('endgame scene, quote verification, special audio controls, and rewatch setting in last realm', async () => {
  const { SaveSystem } = await import('../src/systems/SaveSystem.js');
  const { soundManager } = await import('../src/audio/SoundManager.js');
  const { EndgameScene } = await import('../src/ui/EndgameScene.js');

  // 1. Verify SaveSystem default data and hasSeenEndgame methods
  const save = new SaveSystem();
  assert.equal(save.hasSeenEndgame(), false, 'Default save should not have seen endgame');
  save.markEndgameSeen();
  assert.equal(save.hasSeenEndgame(), true, 'markEndgameSeen should set hasSeenEndgame to true');

  // 2. Verify soundManager endgame music starts and stops without error
  assert.doesNotThrow(() => soundManager.playEndgameMusic(), 'playEndgameMusic should execute safely');
  assert.doesNotThrow(() => soundManager.stopEndgameMusic(), 'stopEndgameMusic should execute safely');

  // 3. Verify EndgameScene DOM generation and exact requested quote
  let completed = false;
  const mockSave = {
    markEndgameSeen: () => { mockSave._seen = true; },
    hasSeenEndgame: () => Boolean(mockSave._seen),
    _seen: false,
  };

  if (typeof document === 'undefined') {
    global.document = {
      createElement: (tag) => {
        const el = {
          tagName: tag.toUpperCase(),
          children: [],
          classList: { add() {}, remove() {}, contains() { return false; } },
          setAttribute() {},
          addEventListener(event, fn) { el[`_on_${event}`] = fn; },
          getContext() {
            return {
              createLinearGradient() { return { addColorStop() {} }; },
              createRadialGradient() { return { addColorStop() {} }; },
              fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, stroke() {}, save() {}, restore() {}, arc() {}, ellipse() {},
            };
          },
          querySelector(sel) {
            return el.children.find(c => c.id === sel.replace('#', '') || c.className === sel.replace('.', '')) || {
              classList: { add() {}, remove() {}, contains() { return false; } },
              addEventListener() {},
              scrollTo() {},
              getContext() { return { createLinearGradient() { return { addColorStop() {} }; }, createRadialGradient() { return { addColorStop() {} }; }, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, stroke() {}, save() {}, restore() {}, arc() {}, ellipse() {} }; },
            };
          },
          remove() {},
          innerHTML: '',
        };
        return el;
      },
      body: {
        appendChild(child) {
          global.document.body._lastChild = child;
        }
      }
    };
    global.window = {
      innerWidth: 1920,
      innerHeight: 1080,
      addEventListener() {},
      removeEventListener() {},
    };
    global.requestAnimationFrame = (fn) => setTimeout(fn, 16);
    global.cancelAnimationFrame = (id) => clearTimeout(id);
  }

  const scene = new EndgameScene(mockSave);
  scene.show(() => { completed = true; });

  const quoteExpectedPart1 = 'Perhaps the abyss was never empty. Perhaps it holds everything we once buried, all the dreams, memories, and broken pieces of ourselves too heavy for the surface to bear.';
  const quoteExpectedPart2 = 'I wonder how many stars have fallen into the ocean, mistaking their own reflections for a place to call home, only to sink into depths where even their light could no longer reach.';
  const quoteExpectedPart3 = 'And yet, as I drifted into the darkness, I realized something beautiful and tragic... Even at the bottom of the ocean, surrounded by everything the world had forgotten, I was still beneath a sea of stars.';
  const authorExpected = 'created by : Evan Bartkowski';

  assert.ok(scene.container.innerHTML.includes(quoteExpectedPart1), 'Endgame scene must include quote part 1');
  assert.ok(scene.container.innerHTML.includes(quoteExpectedPart2), 'Endgame scene must include quote part 2');
  assert.ok(scene.container.innerHTML.includes(quoteExpectedPart3), 'Endgame scene must include quote part 3');
  assert.ok(scene.container.innerHTML.includes(authorExpected), 'Endgame scene must include author credit: created by : Evan Bartkowski');

  scene.close();
  assert.equal(mockSave._seen, true, 'EndgameScene.close should mark endgame as seen in save');
});

test('legendary fish and animal noticeable glow, rainbow star sparkles, and catch particles', async () => {
  const { Fish, drawRainbowStarSparkle } = await import('../src/entities/Fish.js');
  const { Hook } = await import('../src/entities/Hook.js');
  const { ParticleSystem } = await import('../src/systems/ParticleSystem.js');
  const { LEGENDARY_SPECIES } = await import('../src/data/legendaries.js');

  // 1. Verify drawRainbowStarSparkle renders balanced 4-pointed radiant star with needles and center
  const sparkleCalls = [];
  const sparkleCtx = new Proxy({ globalAlpha: 1 }, {
    get: (target, key) => {
      if (key in target) return target[key];
      return (...args) => sparkleCalls.push({ key, args });
    },
    set: (target, key, val) => { target[key] = val; return true; },
  });
  drawRainbowStarSparkle(sparkleCtx, 50, 60, 8, 0.5, 180, 0.9);
  assert.ok(sparkleCalls.some(c => c.key === 'moveTo'), 'drawRainbowStarSparkle must draw star paths');
  assert.ok(sparkleCalls.some(c => c.key === 'lineTo'), 'drawRainbowStarSparkle must have facet points');
  assert.ok(sparkleCalls.some(c => c.key === 'stroke'), 'drawRainbowStarSparkle must draw needle flares');
  assert.ok(sparkleCalls.some(c => c.key === 'fill'), 'drawRainbowStarSparkle must fill radiant star and core');
  assert.ok(sparkleCalls.some(c => c.key === 'save'), 'drawRainbowStarSparkle must save state');
  assert.ok(sparkleCalls.some(c => c.key === 'restore'), 'drawRainbowStarSparkle must restore state');

  // 2. Verify all legendary and mythic species render balanced canvas state with radiant aura and body sparkles
  for (const species of LEGENDARY_SPECIES) {
    const fish = new Fish(species, 300, 400);
    assert.equal(fish.isLegendary, true, `${species.name} must be identified as legendary`);

    let saveCount = 0;
    let restoreCount = 0;
    const fishCalls = [];
    const fishCtx = new Proxy({ globalAlpha: 1 }, {
      get: (target, key) => {
        if (key === '__saveCount') return saveCount;
        if (key === '__restoreCount') return restoreCount;
        if (key in target) return target[key];
        if (key === 'save') return () => { saveCount++; };
        if (key === 'restore') return () => { restoreCount++; };
        if (typeof key === 'string' && key.startsWith('create')) return () => ({ addColorStop() {} });
        return (...args) => fishCalls.push({ key, args });
      },
      set: (target, key, val) => { target[key] = val; return true; },
    });

    fish.render(fishCtx, 0);
    assert.equal(saveCount, restoreCount, `${species.name} Fish.render must have balanced save/restore`);
    assert.ok(fishCalls.length > 50, `${species.name} Fish.render must render noticeable aura and sparkles`);
  }

  // 3. Verify Hook emits rainbow star sparkles when catching legendary species
  const hook = new Hook(null, { x: 300, y: 300 });
  const particles = new ParticleSystem();
  const testLegendary = new Fish(LEGENDARY_SPECIES[0], 300, 300);
  hook.addCatch(testLegendary, particles);
  assert.ok(particles.sparkles.length >= 35, 'Hook must emit at least 35 sparkles on legendary catch');
  assert.ok(particles.sparkles.some(sp => typeof sp.color === 'string' && sp.color.startsWith('hsl(')), 'Sparkles must have rainbow hues');
});

test('quests and rewards scale dynamically with realm depth, difficulty, and economy', async () => {
  const { QuestSystem, questReward } = await import('../src/systems/QuestSystem.js');
  const { QUEST_POOL, getQuestTargetForRealm, getQuestDescriptionForRealm, getSoundingTarget, getHeavyweightTarget } = await import('../src/data/QuestsData.js');

  // 1. Verify sounding depth scales with sea bathymetry (Sea 1 is 30m to fit within 45m; Sea 7 reaches 1000m)
  assert.equal(getSoundingTarget(1), 30);
  assert.equal(getSoundingTarget(7), 1000);
  assert.ok(getSoundingTarget(7) > getSoundingTarget(1) * 20);

  // 2. Verify heavyweight requirements scale by realm fish size (Sea 1: 2.0 kg; Sea 7: 100.0 kg)
  assert.equal(getHeavyweightTarget(1), 2.0);
  assert.equal(getHeavyweightTarget(7), 100.0);

  // 3. Verify general noticeboard quest targets scale from shallow to deep realms
  const supper = QUEST_POOL.find(q => q.id === 'harbor_supper');
  assert.equal(getQuestTargetForRealm(supper, 1), 4);
  assert.equal(getQuestTargetForRealm(supper, 7), 10);
  assert.ok(getQuestDescriptionForRealm(supper, 7, 10).includes('10 fish'));

  // 4. Verify contracts exist for all 7 fantasy realms
  assert.ok(QUEST_POOL.some(q => q.id === 'aether_skies_contract'), 'Sea 5 Aether Skies contract must exist');
  assert.ok(QUEST_POOL.some(q => q.id === 'caldera_lava_contract'), 'Sea 6 Caldera Lava contract must exist');

  // 5. Verify rewards scale up proportionally with realm multipliers and quest scale
  for (const q of [supper, QUEST_POOL.find(q => q.id === 'deep_sounder')]) {
    const r1 = questReward(q, 1);
    const r3 = questReward(q, 3);
    const r7 = questReward(q, 7);
    assert.ok(r7.rewardCoins > r3.rewardCoins, `Realm 7 coins must exceed Realm 3 for ${q.id}`);
    assert.ok(r3.rewardCoins > r1.rewardCoins, `Realm 3 coins must exceed Realm 1 for ${q.id}`);
    assert.ok(r7.rewardXp > r1.rewardXp, `Realm 7 XP must exceed Realm 1 for ${q.id}`);
  }
});

test('secret /gems1000 chat command adds 1000 gems without broadcasting to public chat', async () => {
  const { SaveSystem } = await import('../src/systems/SaveSystem.js');
  const { ChatManager } = await import('../src/systems/ChatManager.js');

  const save = new SaveSystem();
  save.data.gems = 50;

  // 1. Direct save.addGems() test
  save.addGems(500);
  assert.equal(save.data.gems, 550, 'addGems must add valid amount');
  save.addGems(-100);
  assert.equal(save.data.gems, 550, 'addGems must ignore non-positive numbers');

  // 2. ChatManager secret command interception
  const chatManager = new ChatManager(save);
  let backendSendCalled = false;
  chatManager.loadBackend = async () => ({
    send: async () => { backendSendCalled = true; return true; },
    subscribe: async () => () => {},
  });

  // Test lowercase, uppercase, and untrimmed variants
  const res1 = await chatManager.sendMessage('/gems1000');
  assert.deepEqual(res1, { secret: true, command: 'gems1000', amount: 1000 });
  assert.equal(save.data.gems, 1550, 'Must award 1000 gems on /gems1000');
  assert.equal(backendSendCalled, false, 'Must never send secret command to network backend');

  const res2 = await chatManager.sendMessage('  /GEMS1000  ');
  assert.deepEqual(res2, { secret: true, command: 'gems1000', amount: 1000 });
  assert.equal(save.data.gems, 2550, 'Must award another 1000 gems on case-insensitive untrimmed /GEMS1000');
  assert.equal(backendSendCalled, false, 'Must not send to backend');

  // 3. Normal messages still follow normal chat flow
  save.isChatUnlocked = () => false;
  const normalBlocked = await chatManager.sendMessage('Hello world');
  assert.equal(normalBlocked, false);
  assert.equal(backendSendCalled, false);

  save.isChatUnlocked = () => true;
  const normalSent = await chatManager.sendMessage('Ahoy mateys!');
  assert.equal(normalSent, true);
  assert.equal(backendSendCalled, true, 'Normal message must reach backend');
});

test('secret /gold1 chat command adds 1,000,000 gold without broadcasting to public chat', async () => {
  const { SaveSystem } = await import('../src/systems/SaveSystem.js');
  const { ChatManager } = await import('../src/systems/ChatManager.js');

  const save = new SaveSystem();
  save.data.coins = 250;
  save.data.stats.totalGoldEarned = 250;

  const chatManager = new ChatManager(save);
  let backendSendCalled = false;
  chatManager.loadBackend = async () => ({
    send: async () => { backendSendCalled = true; return true; },
    subscribe: async () => () => {},
  });

  // Test lowercase
  const res1 = await chatManager.sendMessage('/gold1');
  assert.deepEqual(res1, { secret: true, command: 'gold1', amount: 1000000 });
  assert.equal(save.data.coins, 1000250, 'Must award 1,000,000 gold on /gold1');
  assert.equal(save.data.stats.totalGoldEarned, 1000250, 'Must increase totalGoldEarned');
  assert.equal(backendSendCalled, false, 'Must never send secret /gold1 command to network backend');

  // Test uppercase and untrimmed
  const res2 = await chatManager.sendMessage('   /GOLD1   ');
  assert.deepEqual(res2, { secret: true, command: 'gold1', amount: 1000000 });
  assert.equal(save.data.coins, 2000250, 'Must award another 1,000,000 gold on /GOLD1');
  assert.equal(backendSendCalled, false, 'Must not send to backend');
});

test('Sea 7 (Eldritch Chrono Void) mythical fish, unique obstacles, rainbow clouds and water, and crate gold reward fixes', async () => {
  const { EXPEDITION_HAZARDS } = await import('../src/data/ExpeditionHazards.js');
  const { CRATE_BASE_VALUES, openCrate } = await import('../src/data/TreasureData.js');
  const { Hazard } = await import('../src/entities/Hazard.js');
  const { Fish } = await import('../src/entities/Fish.js');
  const { FISH_SPECIES } = await import('../src/data/FishData.js');
  const { OceanWorld } = await import('../src/world/OceanWorld.js');

  // 1. Falling stalactites must not spawn in Sea 7
  const stalactite = EXPEDITION_HAZARDS.find(h => h.id === 'falling_stalactite');
  assert.ok(stalactite, 'Must find falling_stalactite hazard');
  assert.ok(!stalactite.seas.includes(7), 'falling_stalactite must not spawn in Sea 7');

  // 2. High rank crates (ranks 6, 7, 8) must have positive finite base values and valid coin rewards
  const { TREASURE_ITEMS } = await import('../src/data/TreasureData.js');
  const { CRATE_RANKS, rollCrateLoot } = await import('../src/data/CrateData.js');

  const crateTreasures = TREASURE_ITEMS.filter(t => t.category === 'crate' && t.isCrate);
  assert.ok(crateTreasures.length >= 8, 'Must have at least 8 crate ranks in TREASURE_ITEMS');
  for (const crate of crateTreasures) {
    assert.ok(Number.isFinite(crate.value) && crate.value > 0, `Crate rank ${crate.crateRank} (${crate.name}) must have finite positive value, got ${crate.value}`);
    const loot = rollCrateLoot(crate.crateRank);
    assert.ok(Number.isFinite(loot.coins), `Loot coins for rank ${crate.crateRank} must be finite`);
    assert.ok(!Number.isNaN(loot.coins), `Loot coins for rank ${crate.crateRank} must not be NaN`);
  }

  // 3. Mock Canvas context for rendering tests
  const gradient = { addColorStop() {} };
  const calls = [];
  const mockCtx = new Proxy({ globalAlpha: 1, lineWidth: 1 }, {
    get: (target, key) => {
      if (key in target) return target[key];
      if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => gradient;
      return (...args) => calls.push({ key, args });
    },
    set: (target, key, value) => { target[key] = value; return true; },
  });

  // 4. Realm 7 hazards (variants 0-3) render with mythical cosmic visuals and noticeable red danger glow
  const typeConfig = {
    name: 'Temporal Fracture',
    type: 'temporal_fracture',
    zone: 7,
    radius: 30,
    width: 60,
    height: 60,
    damage: 25,
    color: '#a855f7',
    glowColor: '#ec4899',
    realmStyle: 'void'
  };
  const gradientStops = [];
  const trackedGradient = {
    addColorStop(offset, color) {
      gradientStops.push({ offset, color });
    }
  };
  const trackedCtx = new Proxy({ globalAlpha: 1, lineWidth: 1, shadowColor: '', strokeStyle: '', fillStyle: '' }, {
    get: (target, key) => {
      if (key in target) return target[key];
      if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => trackedGradient;
      return (...args) => calls.push({ key, args });
    },
    set: (target, key, value) => { target[key] = value; return true; },
  });

  for (let v = 0; v < 4; v++) {
    calls.length = 0;
    gradientStops.length = 0;
    const hazard = new Hazard(typeConfig, 200, 400, { variant: v, realmStyle: 'void', zone: 7 });
    assert.equal(hazard.glow, '#ef4444', 'Realm 7 hazard glow must be danger red #ef4444');
    hazard.render(trackedCtx, 0);
    assert.ok(calls.length > 5, `Realm 7 hazard variant ${v} must render successfully`);
    // Verify danger red gradient stop was added to the danger aura
    const hasRedStop = gradientStops.some(s => s.color.includes('255, 30, 60') || s.color.includes('239, 68, 68') || s.color.includes('#ef4444'));
    assert.ok(hasRedStop, `Realm 7 hazard variant ${v} must include red danger warning color in its aura gradient`);
    // Verify shadowColor or strokeStyle used red warning colors
    assert.ok(trackedCtx.shadowColor.includes('ef4444') || trackedCtx.shadowColor.includes('dc2626') || trackedCtx.strokeStyle.includes('ef4444') || trackedCtx.strokeStyle.includes('ff3366'), 'Must have danger red shadow or stroke for Realm 7 hazard');
  }

  // 4b. Realm 7 Marine threats render with prominent danger red warning aura
  const { drawMarineThreat } = await import('../src/entities/MarineThreatArt.js');
  const voidThreat = {
    id: 'marine_7_cosmic_megalodon',
    name: 'Celestial Void Megalodon',
    zone: 7,
    marineKind: 'shark',
    behavior: { monsterForm: 'void_megalodon', zone: 7 },
    radius: 40,
    timer: 1.5,
    facing: 1,
    swimAngle: 0
  };
  calls.length = 0;
  gradientStops.length = 0;
  drawMarineThreat(trackedCtx, voidThreat);
  assert.ok(calls.length > 5, 'Realm 7 void megalodon must render');
  const threatHasRedStop = gradientStops.some(s => s.color.includes('255, 30, 60') || s.color.includes('239, 68, 68'));
  assert.ok(threatHasRedStop, 'Realm 7 void megalodon must have red danger warning in aura');

  // 5. Realm 7 normal fish render with isVoidRealm/isVoidFish mythical aura and constellation stardust
  const voidSpecies = FISH_SPECIES.find(f => f.zone === 7 && f.rarity === 'common') || FISH_SPECIES.find(f => f.zone === 7);
  assert.ok(voidSpecies, 'Must have Realm 7 fish species');
  const voidFish = new Fish(voidSpecies, 300, 600, { zone: 7 });
  assert.equal(voidFish.isVoidRealm, true, 'Fish must have isVoidRealm flag');
  calls.length = 0;
  voidFish.render(mockCtx, 0);
  assert.ok(calls.length > 10, 'Realm 7 fish must render with mythical aura without error');

  // 6. OceanWorld atmosphere, clouds, and water render for Sea 7
  const ocean = new OceanWorld({ width: 1200, height: 720 });
  ocean.currentSeaId = 7;
  ocean.waveTimer = 10;
  calls.length = 0;
  ocean.renderSky(mockCtx, 0);
  assert.ok(calls.length > 5, 'OceanWorld renderSky must execute for Sea 7');

  calls.length = 0;
  ocean.renderWaterSurface(mockCtx, 0);
  assert.ok(calls.length > 5, 'OceanWorld renderWaterSurface must execute for Sea 7');

  calls.length = 0;
  ocean.renderVoidSurfaceAnomalies(mockCtx, 200, 0);
  assert.ok(calls.length > 5, 'OceanWorld renderVoidSurfaceAnomalies must execute for Sea 7');

  calls.length = 0;
  ocean.renderUnderwaterBackground(mockCtx, 0, 720);
  assert.ok(calls.length > 5, 'OceanWorld renderUnderwaterBackground must execute for Sea 7');
});

test('Sea 5-7 enemy balancing, Megalodons, Void aesthetic enemies, Realm 7 mermaids, Realm 5 unicorns, and distinct fishing music', async () => {
  const { MARINE_THREATS } = await import('../src/data/MarineThreats.js');
  const { LEGENDARY_SPECIES } = await import('../src/data/legendaries.js');
  const { NATIVE_ROSTERS, REALM_PROFILES } = await import('../src/data/RealmContent.js');
  const { drawMarineThreat } = await import('../src/entities/MarineThreatArt.js');
  const { SoundManager } = await import('../src/audio/SoundManager.js');
  const { Fish } = await import('../src/entities/Fish.js');
  const { OceanWorld } = await import('../src/world/OceanWorld.js');

  const calls = [];
  const mockCtx = new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'canvas') return { width: 1200, height: 720 };
      return (...args) => {
        calls.push({ method: prop, args });
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
          return { addColorStop: () => {} };
        }
        return {};
      };
    },
    set: () => true
  });

  // 1. Reduced enemy hazard density for realms 5, 6, 7
  assert.ok(REALM_PROFILES[5].hazardDensity <= 1.15, 'Realm 5 hazard density should be lowered');
  assert.ok(REALM_PROFILES[6].hazardDensity <= 1.15, 'Realm 6 hazard density should be lowered');
  assert.ok(REALM_PROFILES[7].hazardDensity <= 1.2, 'Realm 7 hazard density should be lowered');

  // 2. Megalodon enemies in Realm 6 (Molten Lava) and Realm 7 (Celestial Void)
  const lavaMegalodon = MARINE_THREATS.find(t => t.zone === 6 && (t.monsterForm === 'lava_megalodon' || t.name.includes('Lava Megalodon')));
  assert.ok(lavaMegalodon, 'Must have Molten Lava Megalodon in Realm 6');
  assert.equal(lavaMegalodon.monsterForm, 'lava_megalodon');
  assert.equal(lavaMegalodon.isColossal, true);

  const voidMegalodon = MARINE_THREATS.find(t => t.zone === 7 && (t.monsterForm === 'void_megalodon' || t.name.includes('Void Megalodon')));
  assert.ok(voidMegalodon, 'Must have Celestial Void Megalodon in Realm 7');
  assert.equal(voidMegalodon.monsterForm, 'void_megalodon');
  assert.equal(voidMegalodon.isColossal, true);

  // 3. Render Lava Megalodon and Void Megalodon without errors
  calls.length = 0;
  drawMarineThreat(mockCtx, {
    radius: 105, sizeScale: 1.45, timer: 1.5, facing: 1, swimAngle: 0,
    marineKind: 'shark', behavior: { monsterForm: 'lava_megalodon', zone: 6 },
    color: '#450a0a', glow: '#f97316', zone: 6, id: 'marine_6_lava_megalodon'
  });
  assert.ok(calls.length > 20, 'Lava Megalodon must render with rich volcanic details');

  calls.length = 0;
  drawMarineThreat(mockCtx, {
    radius: 110, sizeScale: 1.45, timer: 1.5, facing: 1, swimAngle: 0,
    marineKind: 'shark', behavior: { monsterForm: 'void_megalodon', zone: 7 },
    color: '#312e81', glow: '#a855f7', zone: 7, id: 'marine_7_cosmic_megalodon'
  });
  assert.ok(calls.length > 20, 'Void Megalodon must render with celestial starlight details');

  // 4. Realm 7 aesthetic enemies render cleanly (Hourglass Jelly, Riftfang Eel, World-Eater Serpent, Chronovore Nautilus)
  const voidEnemies = [
    { marineKind: 'jelly', name: 'Hourglass Jelly', zone: 7, radius: 30, sizeScale: 1, behavior: {} },
    { marineKind: 'eel', name: 'Riftfang Eel', zone: 7, radius: 40, sizeScale: 1, behavior: {} },
    { marineKind: 'monster', name: 'World-Eater Serpent', zone: 7, radius: 65, sizeScale: 1, behavior: { monsterForm: 'serpent' } },
    { marineKind: 'nautilus', name: 'Chronovore Nautilus', zone: 7, radius: 45, sizeScale: 1, behavior: {} },
  ];
  for (const enemy of voidEnemies) {
    calls.length = 0;
    drawMarineThreat(mockCtx, { ...enemy, timer: 2.0, facing: 1, swimAngle: 0, color: '#38bdf8', glow: '#c084fc' });
    assert.ok(calls.length > 10, `Void enemy ${enemy.name} must render with aesthetic styling`);
  }

  // 5. Beautiful mermaids in Realm 7 (catchable native roster and mythic)
  const realm7Roster = NATIVE_ROSTERS[7];
  assert.ok(realm7Roster.includes('mermaid'), 'Realm 7 roster must contain catchable mermaids');
  const mythicMermaid = LEGENDARY_SPECIES.find(l => l.id === 'chrono_void_mermaid');
  assert.ok(mythicMermaid, 'Must have Celestial Chrono Mermaid mythic');
  assert.equal(mythicMermaid.shape, 'mermaid');

  const mermaidFish = new Fish(mythicMermaid, 400, 800, { zone: 7 });
  calls.length = 0;
  mermaidFish.render(mockCtx, 0);
  assert.ok(calls.length > 15, 'Mermaid must render with hair, tail, and accessories');

  // 6. Underwater unicorns as mythic in Realm 5 (Aetherian Water Unicorn)
  const mythicUnicorn = LEGENDARY_SPECIES.find(l => l.id === 'aether_sea_unicorn');
  assert.ok(mythicUnicorn, 'Must have Aetherian Water Unicorn mythic in Realm 5');
  assert.equal(mythicUnicorn.shape, 'unicorn');
  assert.equal(mythicUnicorn.zone, 5);

  const unicornFish = new Fish(mythicUnicorn, 250, 500, { zone: 5 });
  assert.ok(unicornFish.maneColor, 'Unicorn must have maneColor initialized');
  calls.length = 0;
  unicornFish.render(mockCtx, 0);
  assert.ok(calls.length > 15, 'Unicorn must render with hippocampus tail, horn, and mane');

  // 7. No black shadow fish in OceanWorld.renderEldritchVoidWhales
  const ocean = new OceanWorld({ width: 1200, height: 720 });
  ocean.currentSeaId = 7;
  ocean.waveTimer = 5;
  calls.length = 0;
  ocean.renderEldritchVoidWhales(mockCtx, 1200, 720);
  // Verify no slate-black dark shadows were filled
  const darkFills = calls.filter(c => c.method === 'fillStyle' && typeof c.args[0] === 'string' && /15,\s*23,\s*42/i.test(c.args[0]));
  assert.equal(darkFills.length, 0, 'No dark black whale shadow in renderEldritchVoidWhales');

  // 8. SoundManager distinct music for surface vs fishing & Realm 7 fishing track
  const sound = new SoundManager();
  sound.initialized = true;

  // Check Realm 7 tracks
  const r7Surface = sound.getTrackForMode(7, 'surface');
  const r7Fishing = sound.getTrackForMode(7, 'underwater');
  assert.notEqual(r7Surface.src, r7Fishing.src, 'Realm 7 must have distinct surface vs fishing tracks');
  const validR7Fishing = [
    'rockot-holidays-in-heaven',
    'viramiller-heavenly-calm',
    'tokyorifft-celestial-disco'
  ];
  assert.ok(validR7Fishing.some(name => r7Fishing.src.includes(name)), 'Realm 7 fishing track must be either holiday heaven, heavenly calm, or celestial disco');
  const validR7Surface = [
    'ocean-vibes',
    'valley-of-voices',
    'alan_frijns'
  ];
  assert.ok(validR7Surface.some(name => r7Surface.src.includes(name)), 'Realm 7 surface track must be ocean-vibes or valley of voices');

  // Check all realms have distinct surface vs fishing tracks
  for (let r = 1; r <= 7; r++) {
    const surf = sound.getTrackForMode(r, 'surface');
    const fish = sound.getTrackForMode(r, 'underwater');
    assert.notEqual(surf.src, fish.src, `Realm ${r} must have distinct surface and fishing music`);
  }
});

test('Performance lag reduction, Realm 7 rainbow fish with selective stars, mobile finger follow controls, boat color schemes, and fishing visuals', async () => {
  const { Fish, drawRainbowStarSparkle } = await import('../src/entities/Fish.js');
  const { FISH_SPECIES } = await import('../src/data/FishData.js');
  const { BOAT_SKIN_OPTIONS } = await import('../src/data/CustomizationData.js');
  const { MARINE_THREATS } = await import('../src/data/MarineThreats.js');
  const { Hook } = await import('../src/entities/Hook.js');
  const { drawVesselHull } = await import('../src/rendering/VesselRenderer.js');

  // 1. drawRainbowStarSparkle does not force expensive rasterizer shadowBlur
  const sparkleCalls = [];
  const mockCtx = new Proxy({}, {
    get: (target, key) => {
      if (key in target) return target[key];
      return (...args) => sparkleCalls.push({ key, args });
    },
    set: (target, key, val) => {
      sparkleCalls.push({ key, val });
      target[key] = val;
      return true;
    },
  });
  drawRainbowStarSparkle(mockCtx, 10, 10, 8, 0, 180, 1);
  const shadowBlurCalls = sparkleCalls.filter(c => c.key === 'shadowBlur' && c.val > 0);
  assert.equal(shadowBlurCalls.length, 0, 'drawRainbowStarSparkle must not use heavy shadowBlur');

  // 2. Normal fish in Realm 7 are rainbow, but not all of them have rotating stars
  const r7Species = FISH_SPECIES.find(f => f.zone === 7 && f.rarity === 'common') || FISH_SPECIES.find(f => f.zone === 7);
  assert.ok(r7Species, 'Must find Realm 7 fish species');

  const fishList = [];
  for (let i = 0; i < 20; i++) {
    fishList.push(new Fish(r7Species, 100 + i * 37, 200 + i * 23, { zone: 7 }));
  }
  const withStars = fishList.filter(f => f.hasOrbitingStars);
  const withoutStars = fishList.filter(f => !f.hasOrbitingStars);
  assert.ok(withStars.length > 0, 'Some Realm 7 normal fish must have orbiting stars');
  assert.ok(withoutStars.length > 0, 'Not all Realm 7 normal fish have orbiting stars');

  // 3. Extended boat color schemes exist in BOAT_SKIN_OPTIONS
  const expectedSkins = ['celestial', 'obsidian', 'pearl', 'crimson', 'amethyst', 'midnight', 'rose_gold'];
  for (const sId of expectedSkins) {
    assert.ok(BOAT_SKIN_OPTIONS[sId], `BOAT_SKIN_OPTIONS must contain ${sId}`);
    assert.ok(BOAT_SKIN_OPTIONS[sId].color, `${sId} must have color string defined`);
  }

  // 4. VesselRenderer renders boat skin with sheer contour curves
  const vesselCalls = [];
  const vesselCtx = new Proxy({}, {
    get: (target, key) => {
      if (key in target) return target[key];
      return (...args) => vesselCalls.push({ key, args });
    },
    set: (target, key, val) => {
      vesselCalls.push({ key, val });
      target[key] = val;
      return true;
    },
  });
  drawVesselHull(vesselCtx, 3, 140, 40, 0, '#c084fc');
  assert.ok(vesselCalls.some(c => c.key === 'strokeStyle' && c.val === '#c084fc'), 'drawVesselHull must apply custom color scheme');

  // 5. Hook and fishing line render without erratic high-frequency jitter
  const hook = new Hook();
  hook.state = 'DESCENDING';
  hook.x = 200;
  hook.y = 800;
  const lineCalls = [];
  const lineCtx = new Proxy({}, {
    get: (target, key) => {
      if (key in target) return target[key];
      return (...args) => lineCalls.push({ key, args });
    },
    set: (target, key, val) => { target[key] = val; return true; },
  });
  hook.renderLine(lineCtx, 200, 220, 500);
  assert.ok(lineCalls.some(c => c.key === 'quadraticCurveTo'), 'Fishing line must render smooth curve');

  // 6. Enemy speeds across realms are lowered for fair and readable dodging
  const specialistNautilus = MARINE_THREATS.find(m => m.name === 'Chronovore Nautilus');
  assert.ok(specialistNautilus.speed <= 300, 'Chronovore Nautilus speed must be <= 300');
  const voidMegalodon = MARINE_THREATS.find(m => m.name === 'Celestial Void Megalodon');
  assert.ok(voidMegalodon.speed <= 150, 'Celestial Void Megalodon speed must be <= 150');
});

test('Deep abyss fishing line stability, Realm 7 creature & treasure icons, and full storage Sell All payout', async () => {
  const { Hook } = await import('../src/entities/Hook.js');
  const { getSpeciesIcon, FISH_SPECIES } = await import('../src/data/FishData.js');
  const { LEGENDARY_SPECIES } = await import('../src/data/legendaries.js');
  const { TREASURE_ITEMS } = await import('../src/data/TreasureData.js');
  const { SaveSystem } = await import('../src/systems/SaveSystem.js');
  const { UIManager } = await import('../src/ui/UIManager.js');

  // 1. Hook deep abyss coordinates never overflow or whip wildly
  const deepHook = new Hook();
  deepHook.state = 'DESCENDING';
  deepHook.x = 600;
  deepHook.y = 35000; // 35,000px deep (abyss depth ~600m)
  deepHook.targetX = 620;

  // Steering is clamped and never generates NaN or runaway velocities
  deepHook.steer(-10000);
  assert.ok(deepHook.targetX >= 30, 'targetX must be clamped within screen boundaries');
  deepHook.steer(10000);
  assert.ok(deepHook.targetX <= 1170, 'targetX must be clamped within screen boundaries');

  const lineDrawCalls = [];
  const mockLineCtx = new Proxy({}, {
    get: (target, key) => {
      if (key in target) return target[key];
      return (...args) => lineDrawCalls.push({ key, args });
    },
    set: (target, key, val) => { target[key] = val; return true; },
  });

  // When rod is 34,700px off screen above viewport (cameraY = 34900), renderLine clips entry point at y=0
  deepHook.renderLine(mockLineCtx, 600, 200, 34900);
  const moveToCall = lineDrawCalls.find(c => c.key === 'moveTo');
  assert.ok(moveToCall, 'Line must call moveTo for top entry');
  const entryY = moveToCall.args[1];
  assert.ok(entryY >= -1 && entryY <= 1, `Line entry Y (${entryY}) must clip smoothly at viewport top`);

  const quadCall = lineDrawCalls.find(c => c.key === 'quadraticCurveTo');
  assert.ok(quadCall, 'Must draw smooth curve in visible screen');
  const hookScreenY = quadCall.args[3];
  assert.ok(Number.isFinite(hookScreenY) && hookScreenY > 0 && hookScreenY < 720, 'Hook screen Y must be finite and on screen');

  // 2. All Realm 7 species, mythical creatures, and dredged salvage have valid, distinct icons
  const r7Mermaid = FISH_SPECIES.find(f => f.zone === 7 && (f.shape === 'mermaid' || f.name.includes('Mermaid')));
  assert.ok(r7Mermaid, 'Realm 7 must have mermaid');
  assert.equal(getSpeciesIcon(r7Mermaid), '🧜‍♀️', 'Mermaids must have mermaid icon');

  const r7Whale = FISH_SPECIES.find(f => f.zone === 7 && (f.shape === 'whale' || f.name.includes('Whale')));
  assert.ok(r7Whale, 'Realm 7 must have whale');
  assert.equal(getSpeciesIcon(r7Whale), '🐋', 'Whales must have whale icon');

  const r7Serpent = FISH_SPECIES.find(f => f.zone === 7 && f.name.includes('Serpent'));
  assert.ok(r7Serpent, 'Realm 7 must have serpent');
  assert.equal(getSpeciesIcon(r7Serpent), '🐉', 'Serpents must have dragon/serpent icon');

  const r5Unicorn = FISH_SPECIES.find(f => f.zone === 5 && (f.shape === 'unicorn' || f.name.includes('Unicorn')));
  assert.ok(r5Unicorn, 'Realm 5 must have unicorn');
  assert.equal(getSpeciesIcon(r5Unicorn), '🦄', 'Unicorns must have unicorn icon');

  const chronoMermaid = LEGENDARY_SPECIES.find(l => l.id === 'chrono_void_mermaid');
  assert.ok(chronoMermaid, 'Must have Celestial Chrono Mermaid');
  assert.equal(getSpeciesIcon(chronoMermaid), '🧜‍♀️', 'Chrono mermaid must have mermaid icon');

  const safeTreasure = { id: 'sunken_safe', name: 'Reinforced Sunken Safe', isSunkenSafe: true };
  assert.equal(getSpeciesIcon(safeTreasure), '🔒', 'Sunken safe must have lock icon');

  const diamondTreasure = { id: 'abyssal_diamond', name: 'Heart of the Void Diamond', category: 'treasure', isTreasure: true };
  assert.equal(getSpeciesIcon(diamondTreasure), '💎', 'Diamond treasure must have diamond icon');

  const ancientRelic = { id: 'chrono_astrolabe', name: 'Chrono Astrolabe', isRelic: true, icon: '🏺' };
  assert.equal(getSpeciesIcon(ancientRelic), '🏺', 'Relic must have relic icon');

  // 3. Catch Summary Sell All succeeds even when tackle box was completely full
  const save = new SaveSystem();
  save.data.coins = 1000;
  save.data.inventory = [];
  // Fill inventory to capacity
  const cap = save.getInventoryCapacity();
  for (let i = 0; i < cap; i++) {
    save.data.inventory.push({ instanceId: `filled_${i}`, name: 'Existing Fish', value: 10, type: 'fish' });
  }
  assert.equal(save.isInventoryFull(), true, 'Inventory must be full');

  const testHook = new Hook();
  testHook.maxDepthReachedThisDive = 2500;
  const caught1 = { id: r7Mermaid.id, name: r7Mermaid.name, species: r7Mermaid, value: 500 };
  const caught2 = { id: 'sunken_safe', name: 'Sunken Safe', isSunkenSafe: true, value: 1200 };
  testHook.caughtItems = [caught1, caught2];

  // Try adding to inventory - returns null because full
  caught1.inventoryRef = save.addItemToInventory(caught1);
  caught2.inventoryRef = save.addItemToInventory(caught2);
  assert.equal(caught1.inventoryRef, null, 'Caught item 1 inventoryRef is null when full');
  assert.equal(caught2.inventoryRef, null, 'Caught item 2 inventoryRef is null when full');

  // Mock DOM container for modal
  const domElements = {};
  const getOrCreate = (id) => {
    if (!domElements[id]) {
      const el = {
        id,
        textContent: '',
        innerHTML: '',
        className: '',
        classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => false },
        style: {},
        addEventListener: (evt, fn) => { el.listener = fn; }
      };
      domElements[id] = el;
    }
    return domElements[id];
  };
  globalThis.document = {
    getElementById: (id) => getOrCreate(id),
    createElement: () => ({ appendChild: () => {}, querySelector: () => null, addEventListener: () => {} }),
    querySelectorAll: () => [],
    body: { appendChild: () => {} }
  };

  const ui = new UIManager(save, () => {}, () => {});
  let diveRestarted = false;

  // Open catch summary with storageOverflow = true
  ui.openCatchSummary(testHook, () => { diveRestarted = true; }, true);

  // Trigger Sell All Catches
  const sellAllBtnListener = domElements['btn-sell-all-catches']?.listener;
  if (sellAllBtnListener) {
    sellAllBtnListener();
  }

  // Verify coins were awarded directly from hook items
  assert.ok(save.data.coins > 1000, `Coins must increase from haul sale (now: ${save.data.coins})`);
});

test('15 improvements verification: sound persistence, rare quest gems, NPC realm scaling, hook clamping, aquarium reliability, music assignments, and legendary balance', async () => {
  // 1. Audio persistence from localStorage and initial state
  const mockStorage = {
    getItem: (key) => key === 'starlight_fishing_save' ? JSON.stringify({ settings: { isMuted: true } }) : null
  };
  globalThis.localStorage = mockStorage;
  const smMuted = new SoundManager();
  assert.equal(smMuted.isMuted, true, 'SoundManager should initialize isMuted from localStorage');

  // Verify Realm 1 default music is completely unchanged
  assert.equal(smMuted.surfaceMusic.src, '/sprites/seamusic.mp3', 'Realm 1 surface music must remain unchanged');
  assert.equal(smMuted.underwaterMusic.src, '/sprites/oceanmusic2.mp3', 'Realm 1 underwater music must remain unchanged');

  // Verify other realms have distinct music assigned for surface and underwater
  for (let r = 2; r <= 7; r++) {
    const sTrack = smMuted.getTrackForMode(r, 'surface');
    const uTrack = smMuted.getTrackForMode(r, 'underwater');
    assert.ok(sTrack && sTrack.src, `Realm ${r} should have a designated surface track`);
    assert.ok(uTrack && uTrack.src, `Realm ${r} should have a designated underwater track`);
    assert.notEqual(sTrack.src, uTrack.src, `Realm ${r} surface and underwater tracks should be distinct`);
  }

  // 2. Hook physics stability: steering clamping & velocity damping on catch
  const hook = new Hook(400, 200, { agility: 1.2 });
  hook.state = 'DESCENDING';
  hook.targetX = 1200; // Large horizontal delta
  hook.update(0.1, 1200);
  assert.ok(Math.abs(hook.vx) <= 450 * 1.2 + 0.1, `Hook horizontal velocity must be clamped to avoid overshoot runaway`);

  // On catch, velocity is damped
  hook.vx = 300;
  hook.addCatch({ name: 'Test Fish', size: 20, weight: 1.5, primaryColor: '#fff', hookTo() {}, draw() {} });
  assert.ok(Math.abs(hook.vx) < 100, `Hook velocity must be damped on catch`);

  // 3. Legendary 2x rarity and 2x selling prices
  assert.equal(VALUE_BY_RARITY.legendary, 84, 'VALUE_BY_RARITY.legendary must be doubled to 84');
  const speciesMossback = LEGENDARY_SPECIES.find(s => s.id === 'mossback_leviathan');
  assert.ok(speciesMossback && speciesMossback.baseValue >= 6200, 'Legendary base value must be doubled');
  assert.ok(speciesMossback.spawnConditions.chance <= 0.12, 'Legendary spawn chance must be halved');
  const speciesAbyssal = FISH_SPECIES.find(s => s.id === 'abyssal_chimera');
  assert.ok(speciesAbyssal && speciesAbyssal.baseValue >= 560, 'FishData legendary base value must be doubled');

  // Verify new realm-themed legendary species are present
  const expectedNewSpecies = [
    'lagoon_sun_emperor',
    'abyssal_biolum_hydra',
    'cosmic_nova_serpent',
    'atlantean_sun_crown_leviathan',
    'aetherial_zephyr_kirin',
    'pyrostrom_smoldering_wyrm',
    'eldritch_epoch_devourer'
  ];
  for (const spId of expectedNewSpecies) {
    assert.ok(LEGENDARY_SPECIES.some(s => s.id === spId), `Legendary species ${spId} must be registered`);
  }

  // 4. NPC dialogue reward scaling based on player's unlocked realm
  const saveRealm1 = { data: { unlockedSeas: [1], coins: 500, xp: 0, addCoins(c) { this.coins += c; }, addXp(x) { this.xp += x; }, spendCoins(c) { if (this.coins >= c) { this.coins -= c; return true; } return false; } } };
  const saveRealm7 = { data: { unlockedSeas: [1, 2, 3, 4, 5, 6, 7], coins: 500, xp: 0, addCoins(c) { this.coins += c; }, addXp(x) { this.xp += x; }, spendCoins(c) { if (this.coins >= c) { this.coins -= c; return true; } return false; } } };

  const multR1 = getNPCRealmMultiplier(saveRealm1);
  const multR7 = getNPCRealmMultiplier(saveRealm7);
  assert.equal(multR1, 1.0, 'Realm 1 NPC multiplier should be 1.0');
  assert.ok(multR7 >= 10.0, `Realm 7 NPC multiplier should be significantly higher (got ${multR7})`);

  // 5. Rare quests and gems rewards
  const rareQuests = QUEST_POOL.filter(q => q.rarity === 'rare' || (q.rewardGems && q.rewardGems > 0));
  assert.ok(rareQuests.length >= 5, 'Should have multiple rare quests awarding gems');

  const qDef = rareQuests.find(q => q.id === 'apex_hunter');
  assert.ok(qDef && qDef.rewardGems >= 2, 'Apex hunter must have gem reward');

  const reward = questReward(qDef, 1);
  assert.ok(reward.rewardGems >= 2, 'questReward must include rewardGems');

  // Test claim quest adds gems
  const saveWithQuests = {
    data: {
      coins: 0,
      xp: 0,
      gems: 0,
      unlockedSeas: [1],
      quests: {
        active: [{ id: 'apex_hunter', realmId: 1, current: 1, target: 1, claimed: false }],
        completedCount: 0,
      }
    },
    getCurrentSea() { return 1; },
    addCoins(c) { this.data.coins += c; },
    addXP(x) { this.data.xp += x; },
    addGems(g) { this.data.gems = (this.data.gems || 0) + g; },
    save() {}
  };
  const qs = new QuestSystem(saveWithQuests);
  const claimedReward = qs.claimQuest('apex_hunter');
  assert.ok(claimedReward, 'Claiming quest should return reward object');
  assert.ok(saveWithQuests.data.gems >= 2, `Claiming rare quest must award gems (got ${saveWithQuests.data.gems})`);

  // 6. Tank button reliability: String-cast ID matching in SaveSystem
  const { SaveSystem } = await import('../src/systems/SaveSystem.js');
  const fullSave = new SaveSystem();
  fullSave.data = {
    inventory: [{ instanceId: 'item-101', name: 'Coral Trout', type: 'fish' }],
    aquarium: { isUnlocked: true, slottedItemIds: [], maxCapacity: 5 },
    upgrades: { personalAquarium: 1 }
  };
  assert.equal(fullSave.isItemInAquarium('item-101'), false);
  const moveRes = fullSave.moveItemToAquarium('item-101');
  assert.equal(moveRes.success, true, 'moveItemToAquarium should succeed');
  assert.equal(fullSave.isItemInAquarium('item-101'), true, 'isItemInAquarium should find slotted item');
  assert.equal(fullSave.removeItemFromAquarium('item-101'), true, 'removeItemFromAquarium should succeed');
  assert.equal(fullSave.isItemInAquarium('item-101'), false, 'Item should be removed from aquarium');

  // 7. Colossal creatures smoothFacing and movement
  const colossalHazard = new Hazard({ id: 'giant_leviathan', marineKind: 'shark', isColossal: true, speed: 60, radius: 40, detectionRadius: 300, leash: 400 }, 300, 300);
  assert.ok(colossalHazard.isColossal, 'Hazard should be colossal');
  colossalHazard.update(100, 1200, { state: 'DESCENDING', x: 500, y: 300, vx: 0, vy: 50 });
  assert.ok(colossalHazard.smoothFacing !== undefined, 'Colossal hazard should update smoothFacing smoothly');
});

test('Realm 7 deep dive reel stability, mouse tracking responsiveness, underwater black hole obstacle and gravitational pull, caldera obstacle overhauls, and automated probe drone visual redesign', () => {
  // 1. Verify Realm 7 Abyssal Black Hole hazard
  const realm7BlackHole = REALM_HAZARDS.find(h => h.zone === 7 && h.variant === 1);
  assert.ok(realm7BlackHole, 'Realm 7 variant 1 must exist');
  assert.equal(realm7BlackHole.name, 'Abyssal Black Hole', 'Realm 7 hazard 1 must be named Abyssal Black Hole');
  assert.equal(realm7BlackHole.isBlackHole, true, 'Realm 7 hazard 1 must have isBlackHole flag set');

  const abyssalBHType = HAZARD_TYPES.find(h => h.id === 'abyssal_black_hole');
  assert.ok(abyssalBHType, 'abyssal_black_hole must exist in HAZARD_TYPES');
  assert.ok(abyssalBHType.isBlackHole, 'abyssal_black_hole must have isBlackHole true');
  assert.ok(abyssalBHType.seas?.includes(7), 'abyssal_black_hole must spawn in Realm 7');

  // 2. Verify gravitational accretion pull on hook
  const bhHazard = new Hazard({ id: 'abyssal_black_hole', isBlackHole: true, radius: 40 }, 500, 1000);
  const testHook = new Hook();
  testHook.x = 450;
  testHook.y = 1000;
  testHook.state = 'DESCENDING';
  const initialHookX = testHook.x;
  bhHazard.update(100, 1200, testHook);
  assert.ok(testHook.x > initialHookX, 'Black hole must gravitationally pull the hook toward its singularity center');

  // 3. Verify hook mouse tracking does not freeze on catch
  testHook.setTargetX(850, 1920);
  assert.equal(testHook.targetX, 850, 'setTargetX must support wide screen coordinates beyond 1200px');
  testHook.addCatch({ name: 'Luminescent Squid', size: 15, weight: 1.0, primaryColor: '#f43f5e', hookTo() {}, draw() {} });
  assert.equal(testHook.targetX, 850, 'targetX must NOT be reset to hook.x on catch, preserving active mouse cursor tracking');

  // 4. Verify mock canvas rendering of automated probe drone
  const createMockCtx = () => {
    const gradient = { addColorStop() {} };
    return new Proxy({
      globalAlpha: 1,
      createLinearGradient: () => gradient,
      createRadialGradient: () => gradient,
    }, {
      get: (target, key) => key in target ? target[key] : () => {},
      set: (target, key, value) => { target[key] = value; return true; },
    });
  };
  const mockCtx = createMockCtx();
  assert.doesNotThrow(() => {
    drawNaturalHazard(mockCtx, 'probe', 30, 2.5);
  }, 'Automated probe drone redesign must render without error');

  // 5. Verify mock canvas rendering of all 4 Caldera Trench obstacles
  for (let v = 0; v < 4; v++) {
    const calderaHaz = new Hazard({ id: `caldera_test_${v}`, realmStyle: 'lava', variant: v, radius: 40 }, 400, 400);
    assert.doesNotThrow(() => {
      calderaHaz.renderRealmHazard(mockCtx);
    }, `Caldera trench hazard variant ${v} must render cleanly without error`);
  }

  // 6. Verify mock canvas rendering of underwater black hole
  assert.doesNotThrow(() => {
    bhHazard.renderUnderwaterBlackHole(mockCtx, 40);
  }, 'renderUnderwaterBlackHole must render cleanly without error');
});

test('Hook right-edge wall-free tracking, responsive steer speed, giant predator active idle cruise, and Realm 7 catch stability', async () => {
  const { Hook } = await import('../src/entities/Hook.js');
  const { Hazard } = await import('../src/entities/Hazard.js');
  const { Fish } = await import('../src/entities/Fish.js');
  const { OceanWorld } = await import('../src/world/OceanWorld.js');

  // 1. Hook tracks mouse right edge freely without hitting an artificial wall at 1170px
  const hook = new Hook();
  hook.state = 'DESCENDING';
  hook.x = 900;
  hook.y = 1500;
  hook.setTargetX(1920, 1920);
  assert.ok(hook.targetX >= 1900, `targetX (${hook.targetX}) should reach near 1920 on wide screens`);

  // 2. Responsive steering reaches high cruising speed smoothly
  hook.update(16, 220, 1920);
  assert.ok(hook.vx > 100, `Hook should accelerate rapidly toward distant cursor (vx=${hook.vx})`);

  // Hook can reach the far right boundary
  hook.x = 1900;
  hook.targetX = 1920;
  hook.update(16, 220, 1920);
  assert.ok(hook.x >= 1900 && hook.x <= 1920, `Hook x (${hook.x}) can travel to the right edge`);

  // 3. Giant predators (e.g. Molten Lava Megalodon in Realm 6) actively cruise when not targeting anything
  const lavaShark = new Hazard({
    id: 'caldera_lava_shark',
    marineKind: 'shark',
    isColossal: true,
    zone: 6,
    speed: 120,
    detectionRadius: 220,
    leash: 280,
    radius: 65,
  }, 600, 3000);

  const initialX = lavaShark.x;
  // Advance 2 seconds of idle simulation without active hook in pursuit range
  const idleHook = { x: 600, y: 100, state: 'SURFACE_IDLE' };
  for (let i = 0; i < 120; i++) {
    lavaShark.update(16, 1280, idleHook);
  }
  const displacement = Math.abs(lavaShark.x - initialX);
  assert.ok(displacement > 20, `Giant lava shark should actively patrol across screen when idle (moved ${displacement}px)`);

  // 4. Realm 7 giant / mythical catch visual stability
  const voidDrake = new Fish({
    id: 'singularity_astral_drake',
    name: 'Singularity Astral Drake',
    zone: 7,
    scaleFactor: 4.8,
    sizeRange: [250, 600],
    baseWeight: 80.0,
    isMythic: true,
    isLeviathan: true,
    shape: 'dragon',
    primaryColor: '#8b5cf6',
  }, 600, 5000);

  // When swimming, scale is large (> 2.5)
  assert.ok(voidDrake.scale > 2.5, `Leviathan swimming scale (${voidDrake.scale}) should be large`);

  // When caught on hook, visual scale is capped neatly to prevent engulfing the screen
  voidDrake.isHooked = true;
  voidDrake.state = 'HOOKED';
  voidDrake.hook = hook;

  const gradient = { addColorStop() {} };
  const mockCtx = new Proxy({
    globalAlpha: 1,
    shadowBlur: 0,
    shadowColor: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
  }, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; },
  });

  assert.doesNotThrow(() => {
    voidDrake.render(mockCtx, 0, hook);
  }, 'Hooked Realm 7 leviathan must render safely without overflowing or throwing');

  // 5. OceanWorld void visuals rendering verification
  const dummyCanvas = { width: 1280, height: 720, clientWidth: 1280, clientHeight: 720, getContext: () => mockCtx };
  const world = new OceanWorld(dummyCanvas);
  world.currentSeaId = 7;
  assert.doesNotThrow(() => {
    world.renderVoidSurfaceAnomalies?.(mockCtx, 0, 720);
    world.renderEldritchVoidWhales?.(mockCtx, 1500, 720);
  }, 'OceanWorld Realm 7 void backdrop and singularity must render cleanly without error');
});

test('ROV submersible probe redesign, Astral Shimmerfall passive enemy movement & falling ship removal, mythic/legendary depth & shape variety, Almanac rarity sorting, and rod aiming stability', async () => {
  const { EXPEDITION_HAZARDS } = await import('../src/data/ExpeditionHazards.js');
  const { HAZARD_TYPES } = await import('../src/data/TreasureData.js');
  const { Hazard } = await import('../src/entities/Hazard.js');
  const { FISH_SPECIES } = await import('../src/data/FishData.js');
  const { LEGENDARY_SPECIES } = await import('../src/data/legendaries.js');
  const { UIManager } = await import('../src/ui/UIManager.js');
  const { SaveSystem } = await import('../src/systems/SaveSystem.js');
  const { OceanWorld } = await import('../src/world/OceanWorld.js');

  // 1. Falling ship (falling_starglass) is removed from Astral Shimmerfall (Realm 3)
  const fallingStarglass = EXPEDITION_HAZARDS.find(h => h.id === 'falling_starglass');
  assert.ok(fallingStarglass && !fallingStarglass.seas.includes(3), 'Falling ship/starglass hazard must not spawn in Astral Shimmerfall');

  // 2. Astral Shimmerfall dash enemies actively patrol when idle instead of standing still
  const astralEnemies = HAZARD_TYPES.filter(h => h.zone === 3 && h.marineKind);
  assert.ok(astralEnemies.length >= 3, 'Astral Shimmerfall has marine enemies');
  for (const config of astralEnemies) {
    const enemy = new Hazard(config, 500, 2500);
    const startX = enemy.x;
    const idleHook = { x: 500, y: 100, state: 'SURFACE_IDLE' };
    for (let f = 0; f < 90; f++) {
      enemy.update(16, 1280, idleHook);
    }
    assert.ok(Math.abs(enemy.x - startX) > 8, `${config.name} must actively patrol when not attacking (moved ${Math.abs(enemy.x - startX)}px)`);
  }

  // 3. Legendary & Mythic variety (no squid monopoly on deep_1, and mythics spawn in mid-to-deep waters)
  const deepOnes = FISH_SPECIES.filter(f => f.id.endsWith('_deep_1'));
  assert.equal(deepOnes.filter(f => f.shape === 'squid').length, 0, 'deep_1 legendaries no longer default to squid across odd realms');
  assert.ok(LEGENDARY_SPECIES.every(m => m.minDepth >= 250 && m.maxDepth >= 1500), 'Mythic species spawn across mid-to-deep waters instead of only 80-250m');

  // 4. Anglers Almanac sorts fish by rarity
  const save = new SaveSystem();
  save.data.currentSea = 1;
  FISH_SPECIES.filter(f => f.zone === 1).forEach(f => { save.data.journal[f.id] = { count: 1 }; });
  LEGENDARY_SPECIES.filter(f => f.zone === 1).forEach(f => { save.data.journal[f.id] = { count: 1 }; });
  const ui = Object.create(UIManager.prototype);
  ui.saveSystem = save;
  let almanacHtml = '';
  ui.openModal = (title, body) => { almanacHtml = body; };
  ui.openJournalLogbook('journal', 'fieldlog');
  const commonPos = almanacHtml.indexOf('rarity-common');
  const uncommonPos = almanacHtml.indexOf('rarity-uncommon');
  const rarePos = almanacHtml.indexOf('rarity-rare');
  const epicPos = almanacHtml.indexOf('rarity-epic');
  const legendaryPos = almanacHtml.indexOf('rarity-legendary');
  assert.ok(commonPos > 0 && commonPos < uncommonPos && uncommonPos < rarePos && rarePos < epicPos && epicPos < legendaryPos, 'Almanac fish cards must be sorted by rarity');

  // 5. Fishing rod aiming stability: cursor near boat does not flip-flop aimDirection
  const gradient = { addColorStop() {} };
  const mockCtx = new Proxy({}, {
    get: (target, key) => key.includes('Gradient') ? () => gradient : () => {},
    set: () => true,
  });
  const world = new OceanWorld({ width: 1280, height: 720, clientWidth: 1280, clientHeight: 720, getContext: () => mockCtx });
  world.boat.x = 600;
  world.setAimDirection(1);
  // Cursor at x=630 (right of boat.x=600, even though left of old rodTip=670) must keep aimDirection === 1!
  world.renderAimingTrajectory(mockCtx, world.rodTip.x, world.rodTip.y, 630, 260, 0);
  assert.equal(world.aimDirection, 1, 'Aim direction must stay +1 when cursor is right of boat center');
});

test('Chrono Void forward space-whales with parallax, mermaid/unicorn gradient safety, Realm 5/1 music playlists, and Endgame Top 3 Players', async () => {
  const { FISH_SPECIES } = await import('../src/data/FishData.js');
  const { LEGENDARY_SPECIES } = await import('../src/data/legendaries.js');
  const { Fish } = await import('../src/entities/Fish.js');
  const { Hook } = await import('../src/entities/Hook.js');
  const { soundManager } = await import('../src/audio/SoundManager.js');
  const { SaveSystem } = await import('../src/systems/SaveSystem.js');
  const { EndgameScene } = await import('../src/ui/EndgameScene.js');

  let saves = 0;
  let restores = 0;
  const strictGradient = {
    addColorStop(offset, color) {
      if (typeof color !== 'string') {
        throw new SyntaxError(`Failed to execute 'addColorStop' on 'CanvasGradient': The value provided ('${color}') could not be parsed as a color.`);
      }
    },
  };
  const ctx = new Proxy({
    save: () => { saves++; },
    restore: () => { restores++; },
    createLinearGradient: () => strictGradient,
    createRadialGradient: () => strictGradient,
  }, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; },
  });

  // 1. Verify rare/epic/legendary/mythic/void mermaids and unicorns render both swimming and hooked without throwing or leaking ctx.save()
  const allSpecies = [...FISH_SPECIES, ...LEGENDARY_SPECIES];
  const specialShapes = allSpecies.filter(s => ['mermaid', 'unicorn', 'sea_unicorn'].includes(s.shape));
  assert.ok(specialShapes.length > 0, 'Must have mermaid and unicorn species in roster');

  const hook = new Hook(500, 300);
  hook.state = 'REELING';
  for (const sp of specialShapes) {
    const fish = new Fish(sp, 500, 400);
    saves = 0;
    restores = 0;
    assert.doesNotThrow(() => {
      fish.render(ctx, 100, hook);
    }, `Swimming ${sp.name} (${sp.rarity}) must render cleanly with strict CanvasGradient`);
    assert.equal(saves, restores, `Canvas save/restore stack must be balanced for swimming ${sp.name}`);

    fish.hookTo(hook, 0);
    saves = 0;
    restores = 0;
    assert.doesNotThrow(() => {
      fish.render(ctx, 100, hook);
    }, `Hooked ${sp.name} (${sp.rarity}) must render cleanly with strict CanvasGradient`);
    assert.equal(saves, restores, `Canvas save/restore stack must be balanced for hooked ${sp.name}`);
  }

  // 2. Verify Whispering Aether Sea (Realm 5) uses the two new ethereal tracks and loops between them
  const s5Surf = soundManager.getTrackForMode(5, 'surface');
  const s5Fish = soundManager.getTrackForMode(5, 'underwater');
  assert.ok(s5Surf.src.includes('/music/aether-ethereal-1.mp3'), 'Realm 5 surface must use aether-ethereal-1.mp3');
  assert.ok(s5Fish.src.includes('/music/aether-ethereal-2.mp3'), 'Realm 5 underwater must use aether-ethereal-2.mp3');
  assert.equal(s5Surf.loop, false, 'Realm 5 track should use custom ended listener to alternate between the 2 ethereal songs');

  // 3. Verify Realm 1 uses seamusic/oceanmusic2 and transitions to faespencer-island-heartbeat-211013.mp3
  assert.equal(soundManager.surfaceMusic.loop, false, 'Realm 1 surface music must alternate on ended');
  assert.equal(soundManager.underwaterMusic.loop, false, 'Realm 1 underwater music must alternate on ended');

  // 4. Verify EndgameScene renders Top 3 Players Hall of Fame
  const save = new SaveSystem();
  const endgame = new EndgameScene(save);
  const top3 = endgame.getFallbackTopPlayers();
  assert.equal(top3.length, 3, 'EndgameScene must provide exactly 3 top players');
  const html = endgame.renderTopPlayersHtml(top3);
  assert.ok(html.includes('#1 Champion') && html.includes('#2 Sovereign') && html.includes('#3 Voyager'), 'Endgame HTML must honor the top 3 players');
});

test('Realm 7 rare space-whales, Realm 5 floating cloud palace, Realm 2 giant trench titans, high-visibility sea snake, and audio loop stability', async () => {
  const { FISH_SPECIES } = await import('../src/data/FishData.js');
  const { OceanWorld } = await import('../src/world/OceanWorld.js');
  const { SoundManager } = await import('../src/audio/SoundManager.js');

  // 1. Striped Sea Snake High Visibility Colors
  const seaSnake = FISH_SPECIES.find(f => f.name === 'Striped Sea Snake');
  assert.ok(seaSnake, 'Striped Sea Snake must exist in FishData');
  assert.equal(seaSnake.primaryColor, '#fde047', 'Striped Sea Snake must use electric high-contrast yellow primary color');
  assert.equal(seaSnake.secondaryColor, '#0f172a', 'Striped Sea Snake must use jet black stripe secondary color');
  assert.equal(seaSnake.finColor, '#38bdf8', 'Striped Sea Snake must use bright cyan fin color');

  // 2. Whispering Aether Sea Surface Floating Cloud Palace
  const world = new OceanWorld({ width: 1280, height: 720 });
  world.setCurrentSea(5);
  let palaceDrawn = false;
  const mockCtx = {
    save() {}, restore() {}, beginPath() {}, closePath() {},
    arc() {}, rect() {}, fillRect() {}, strokeRect() {},
    fill() {}, stroke() {}, moveTo() {}, lineTo() {},
    quadraticCurveTo() {}, bezierCurveTo() {}, ellipse() {},
    translate() {}, rotate() {}, scale() {},
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    setLineDash() {}, clip() {},
  };
  assert.doesNotThrow(() => {
    world.renderAetherSurfaceFloatingPalace(mockCtx, 320, 0);
  }, 'Floating cloud palace must render without error');

  // 3. Bioluminescent Trench Rare Background Titans
  world.setCurrentSea(2);
  assert.doesNotThrow(() => {
    world.renderBioluminescentTrenchTitans(mockCtx, 400, 720);
  }, 'Bioluminescent Trench giant titans must render smoothly without error');

  // 4. Realm 7 Background Space-Whales Rarity & Clean Looping
  world.setCurrentSea(7);
  assert.doesNotThrow(() => {
    world.renderEldritchVoidWhales(mockCtx, 600, 720);
  }, 'Eldritch Void space-whales must render cleanly');

  // 5. SoundManager Music Restart Fix for Realm 7 Fishing
  const soundManager = new SoundManager();
  soundManager.setSeaTrack(7);
  const track7 = soundManager.getTrackForMode(7, 'underwater');
  assert.equal(track7.loop, false, 'Realm 7 underwater audio must use loop=false and alternate among the 3 songs on ended');

  // Idempotent calls during active fishing must not re-trigger track resets
  let playCount = 0;
  track7.play = () => { playCount++; track7.paused = false; return Promise.resolve(); };
  soundManager.setMusicMode('underwater');
  assert.equal(playCount, 1, 'Entering underwater mode in Realm 7 must start playing the fishing track');
  soundManager.setMusicMode('underwater'); // Redundant call while fishing
  soundManager.setSeaTrack(7); // Redundant realm check while in same realm
  assert.equal(playCount, 1, 'Redundant mode and realm calls must not trigger restart or sync disruptions during fishing');
});

test('Obstacle and deep enemy spawn reductions, Realm 3 sky constellations, distant Aether palace polish, and reel-up camera lower framing', async () => {
  const { OceanWorld } = await import('../src/world/OceanWorld.js');
  const { SoundManager } = await import('../src/audio/SoundManager.js');
  const fs = await import('node:fs');
  const mainJs = fs.readFileSync('src/main.js', 'utf-8');
  const oceanWorldJs = fs.readFileSync('src/world/OceanWorld.js', 'utf-8');

  // 1. Verify lowered obstacle spawn rate and lowered deep enemy increase
  assert.ok(oceanWorldJs.includes('1.04 * ecology.hazards'), 'Static hazard density multiplier must be lowered to 1.04');
  assert.ok(oceanWorldJs.includes('1 + depthProgress(depth) * 1.28'), 'Deep enemy scaling must be lowered to 1.28');

  // 2. Verify Astral Shimmerfall sky constellations rendering
  const world = new OceanWorld({ width: 1280, height: 720 });
  world.setCurrentSea(3);
  const mockCtx = {
    save() {}, restore() {}, beginPath() {}, closePath() {},
    moveTo() {}, lineTo() {}, stroke() {}, fill() {}, arc() {}, ellipse() {},
    quadraticCurveTo() {}, bezierCurveTo() {},
    fillRect() {}, strokeRect() {}, fillText() {}, measureText() { return { width: 40 }; },
    translate() {}, rotate() {}, scale() {},
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    setLineDash() {}, clip() {},
  };
  assert.doesNotThrow(() => {
    world.renderShimmerfallConstellations(mockCtx, 320, 0);
  }, 'Astral Shimmerfall constellations must render smoothly without error');

  // 3. Verify Whispering Aether Sea floating palace position and distant scaling
  assert.ok(oceanWorldJs.includes('ctx.scale(0.35, 0.35)') || oceanWorldJs.includes('ctx.scale(0.68, 0.68)'), 'Floating palace must be scaled smaller to appear distant');
  assert.ok(oceanWorldJs.includes('w * 0.74') || oceanWorldJs.includes('w * 0.82'), 'Floating palace must be positioned clear of boat');
  assert.doesNotThrow(() => {
    world.setCurrentSea(5);
    world.renderAetherSurfaceFloatingPalace(mockCtx, 320, 0);
  }, 'Distant floating palace must render smoothly');

  // 4. Verify lower hook framing on reel-up in main.js
  assert.ok(mainJs.includes('screenHeight * 0.76'), 'Reel-up verticalOffset must be framed lower down (~76%) for maximum reaction time');
  assert.ok(mainJs.includes('maxHookScreenY = screenHeight * 0.88'), 'Safety clamp maxHookScreenY must accommodate lower reel framing at 0.88');

  // 5. Verify keepAliveUnderwaterMusic debouncing prevents play spam
  const sound = new SoundManager();
  sound.initialized = true;
  sound.isMuted = false;
  sound.setSeaTrack(7);
  sound.currentMusicMode = 'underwater';
  const track7 = sound.getTrackForMode(7, 'underwater');
  track7.paused = true;
  let playInvocations = 0;
  track7.play = () => { playInvocations++; return Promise.resolve(); };

  // Call keepAlive rapidly 10 times in a row (simulating 60fps frames)
  for (let i = 0; i < 10; i++) {
    sound.keepAliveUnderwaterMusic();
  }
  assert.equal(playInvocations, 1, 'keepAliveUnderwaterMusic must debounce play calls to prevent rapid restarts');
});

test('Chrono Void rare fading circles, Whispering Aether distant palace, exclusive finale music, rainbow bubble transition, and persistent poem with Next button', async () => {
  const { OceanWorld } = await import('../src/world/OceanWorld.js');
  const { SoundManager } = await import('../src/audio/SoundManager.js');
  const { EndgameScene } = await import('../src/ui/EndgameScene.js');
  const fs = await import('node:fs');
  const oceanWorldJs = fs.readFileSync('src/world/OceanWorld.js', 'utf-8');
  const soundManagerJs = fs.readFileSync('src/audio/SoundManager.js', 'utf-8');
  const mainJs = fs.readFileSync('src/main.js', 'utf-8');

  // 1. Whispering Aether palace scale & placement
  assert.ok(oceanWorldJs.includes('ctx.scale(0.35, 0.35)'), 'Floating castle must be scaled smaller (0.35) to seem further away');
  assert.ok(oceanWorldJs.includes('w * 0.82'), 'Floating castle must be positioned in upper right sky away from boat');

  // 2. Chrono Void background circles rare apparition & fade out
  assert.ok(oceanWorldJs.includes('riftCycle = 80'), 'Chrono Void circles must have a long apparition cycle');
  assert.ok(oceanWorldJs.includes('riftVisibility <= 0.005'), 'Chrono Void circles must skip rendering when invisible');
  assert.ok(oceanWorldJs.includes('riftVisibility})'), 'Chrono Void circles must fade in and fade out smoothly');

  // 3. Special finale music without overlap
  assert.ok(soundManagerJs.includes('/music/endgame-finale.mp3'), 'Finale scene must use attached special music file');
  assert.ok(soundManagerJs.includes('this.isEndgameActive = true;'), 'playEndgameMusic must flag isEndgameActive');
  assert.ok(soundManagerJs.includes('if (this.isEndgameActive) return;'), 'Audio methods must guard against playing other music during endgame');

  const sound = new SoundManager();
  sound.initialized = true;
  sound.playEndgameMusic();
  assert.equal(sound.isEndgameActive, true, 'isEndgameActive must be true during endgame');
  assert.equal(sound.currentMusicMode, 'none', 'currentMusicMode must be set to none during endgame');

  // Verify other sound triggers are blocked while endgame is active
  sound.setMusicMode('underwater');
  assert.equal(sound.currentMusicMode, 'none', 'setMusicMode must not restart underwater music while endgame is active');
  sound.keepAliveUnderwaterMusic(); // Must not crash or restart
  sound.stopEndgameMusic();
  assert.equal(sound.isEndgameActive, false, 'stopEndgameMusic must reset isEndgameActive to false');

  // 4. Underwater visual rainbow bubble transition with exact text
  const mockSave = {
    hasSeenEndgame: () => false,
    markEndgameSeen: () => {},
    data: { profile: { name: 'Captain' } }
  };
  const scene = new EndgameScene(mockSave);
  scene.show();

  const transitionHtml = scene.container.innerHTML;
  assert.ok(transitionHtml.includes('You have reached the bottom of starlight fishing!'), 'Must include exact transition text: You have reached the bottom of starlight fishing!');
  assert.ok(transitionHtml.includes('endgame-bubble-transition'), 'Must include rainbow bubble transition overlay');
  assert.ok(transitionHtml.includes('endgame-bubble-canvas'), 'Must include bubble canvas for aesthetic underwater rendering');

  // 5. Persistent poem screen with Next button to epilogue
  assert.ok(transitionHtml.includes('endgame-poem-view'), 'Must include dedicated poem view');
  assert.ok(transitionHtml.includes('endgame-next-btn'), 'Must include Next button at bottom of poem');
  assert.ok(transitionHtml.includes('Next ➔'), 'Next button must have Next label');
  assert.ok(transitionHtml.includes('endgame-epilogue-view'), 'Must include epilogue view with thanks to top 3 players');

  // 6. View switching test
  scene.showEpilogue();
  assert.equal(scene.currentView, 'epilogue', 'showEpilogue must switch currentView to epilogue');
  scene.showPoem();
  assert.equal(scene.currentView, 'poem', 'showPoem must switch currentView back to poem');

  scene.close();
});

test('Endgame finale slow line-by-line poem fade, bubble continue button removal, 10s delayed bottom-right next button, and phone right-hand dropdown menu', async () => {
  const { EndgameScene } = await import('../src/ui/EndgameScene.js');
  const { UIManager } = await import('../src/ui/UIManager.js');
  const fs = await import('node:fs');
  const css = fs.readFileSync('src/style.css', 'utf-8');
  const endgameJs = fs.readFileSync('src/ui/EndgameScene.js', 'utf-8');
  const uiManagerJs = fs.readFileSync('src/ui/UIManager.js', 'utf-8');

  const mockSave = {
    hasSeenEndgame: () => false,
    markEndgameSeen: () => {},
    data: { profile: { name: 'Captain' } }
  };
  const scene = new EndgameScene(mockSave);
  try {
    scene.show();

    // 1. Verify bubble transition has no continue button (autotransitions automatically)
    const domHtml = scene.container.innerHTML;
    assert.ok(!domHtml.includes('endgame-bubble-skip'), 'Bubble transition must NOT contain a continue / skip button');
    assert.ok(!domHtml.includes('Continue ➔'), 'Bubble transition must NOT have Continue ➔ text');

    // 2. Verify slow line-by-line pacing constants and 10s delayed next button popup
    assert.equal(EndgameScene.POEM_LINE_DELAYS.length, 4, 'Must have 4 staggered delays for stanzas 1-3 and author credit');
    assert.ok(EndgameScene.POEM_LINE_DELAYS[0] < EndgameScene.POEM_LINE_DELAYS[1]);
    assert.ok(EndgameScene.POEM_LINE_DELAYS[1] < EndgameScene.POEM_LINE_DELAYS[2]);
    assert.ok(EndgameScene.POEM_LINE_DELAYS[2] < EndgameScene.POEM_LINE_DELAYS[3]);
    assert.equal(EndgameScene.POEM_FULLY_OUT_MS, 14300, 'Poem fully out milestone must be 14.3s (11.8s + 2.5s duration)');
    assert.equal(EndgameScene.NEXT_BUTTON_DELAY_AFTER_POEM_MS, 10000, 'Next button delay must be strictly 10 seconds after poem is fully out');
    assert.equal(EndgameScene.NEXT_BUTTON_APPEAR_MS, 24300, 'Next button appear time must be exactly 24.3s (14.3s + 10s)');

    // 3. Verify CSS styling for slow fade-ins and fixed bottom-right position without scrolling
    assert.ok(css.includes('transition: opacity 2.8s ease-out, transform 2.8s cubic-bezier(0.16, 1, 0.3, 1);'), 'Stanzas must use 2.8s slow fade-in transition');
    assert.ok(css.includes('transition: opacity 2.5s ease-out, transform 2.5s cubic-bezier(0.16, 1, 0.3, 1);'), 'Author must use 2.5s slow fade-in transition');
    assert.ok(css.includes('position: fixed;'), 'Next button must have fixed positioning');
    assert.ok(css.includes('bottom: clamp(18px, 4vh, 36px);'), 'Next button must be anchored to bottom');
    assert.ok(css.includes('right: clamp(18px, 4vw, 36px);'), 'Next button must be anchored to right');
    assert.ok(css.includes('endgameButtonPop'), 'Next button must feature popup keyframe animation');

    // 4. Verify phone right-hand dropdown menu while preserving desktop/laptop visuals
    assert.ok(uiManagerJs.includes('id="btn-mobile-menu-toggle"'), 'HUD must include mobile menu toggle button');
    assert.ok(uiManagerJs.includes('id="hud-right-dropdown"'), 'HUD must wrap menu items in hud-right-dropdown');
    assert.equal(typeof UIManager.prototype.toggleMobileMenu, 'function', 'UIManager must provide toggleMobileMenu method');
    assert.equal(typeof UIManager.prototype.closeMobileMenu, 'function', 'UIManager must provide closeMobileMenu method');
    assert.ok(css.includes('.mobile-menu-toggle-btn {\n  display: none !important;\n}'), 'Mobile menu toggle must be hidden on desktop/laptop');
    assert.ok(css.includes('.hud-right-dropdown {\n  display: contents;\n}'), 'Desktop/laptop must use display: contents so visuals remain completely unchanged');
    assert.ok(css.includes('#game-hud .hud-right.mobile-menu-open .hud-right-dropdown'), 'Phone dropdown menu must open on right hand side when toggled');

    // 5. Verify manual tap advancement and view switching execute cleanly
    scene.finishTransition();
    scene.advancePoemPacing();
    scene.revealNextButton();
    scene.showEpilogue();
    assert.equal(scene.currentView, 'epilogue');
    scene.showPoem();
    assert.equal(scene.currentView, 'poem');
  } finally {
    scene.close();
  }
});

test('Realm 7 fishing playlist (Holiday Heaven, Heavenly Calm, Celestial Disco) and surface playlist (ocean-vibes, Valley of Voices)', async () => {
  const { SoundManager } = await import('../src/audio/SoundManager.js');
  const sound = new SoundManager();
  sound.initialized = true;

  // Track ended event listener registry
  const listeners = new Map();
  const mockAudio = (src) => ({
    src,
    loop: false,
    paused: true,
    currentTime: 0,
    addEventListener(ev, fn) {
      if (!listeners.has(this)) listeners.set(this, {});
      listeners.get(this)[ev] = fn;
    },
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; }
  });

  const origCreate = globalThis.Audio;
  try {
    globalThis.Audio = class {
      constructor(src) {
        this.src = src;
        this.loop = false;
        this.paused = true;
        this.currentTime = 0;
      }
      addEventListener(ev, fn) {
        if (!listeners.has(this)) listeners.set(this, {});
        listeners.get(this)[ev] = fn;
      }
      play() { this.paused = false; return Promise.resolve(); }
      pause() { this.paused = true; }
    };

    const sm = new SoundManager();
    sm.initialized = true;
    sm.isMuted = false;
    sm.currentSeaId = 7;
    sm.currentMusicMode = 'underwater';

    const r7Fish = sm.getTrackForMode(7, 'underwater');
    assert.equal(r7Fish.loop, false, 'Realm 7 underwater track must have loop=false to allow playlist progression');
    assert.ok(
      ['rockot-holidays-in-heaven', 'viramiller-heavenly-calm', 'tokyorifft-celestial-disco'].some(n => r7Fish.src.includes(n)),
      'Initial Realm 7 fishing track must be Holiday Heaven, Heavenly Calm, or Celestial Disco'
    );

    // Test fishing track rotation on ended
    r7Fish.src = '/music/rockot-holidays-in-heaven-173070.mp3';
    listeners.get(r7Fish)?.ended?.();
    assert.ok(r7Fish.src.includes('viramiller-heavenly-calm'), 'Holiday Heaven must rotate to Heavenly Calm on ended');

    listeners.get(r7Fish)?.ended?.();
    assert.ok(r7Fish.src.includes('tokyorifft-celestial-disco'), 'Heavenly Calm must rotate to Celestial Disco on ended');

    listeners.get(r7Fish)?.ended?.();
    assert.ok(r7Fish.src.includes('rockot-holidays-in-heaven'), 'Celestial Disco must rotate back to Holiday Heaven on ended');

    // Test surface track rotation on ended
    sm.currentMusicMode = 'surface';
    const r7Surf = sm.getTrackForMode(7, 'surface');
    assert.equal(r7Surf.loop, false, 'Realm 7 surface track must have loop=false to allow playlist progression');

    r7Surf.src = '/music/ocean-vibes.mp3';
    listeners.get(r7Surf)?.ended?.();
    assert.ok(
      r7Surf.src.includes('valley-of-voices') || r7Surf.src.includes('alan_frijns'),
      'ocean-vibes must rotate to Valley of Voices on ended'
    );

    listeners.get(r7Surf)?.ended?.();
    assert.ok(r7Surf.src.includes('ocean-vibes.mp3'), 'Valley of Voices must rotate back to ocean-vibes on ended');
  } finally {
    globalThis.Audio = origCreate;
  }
});




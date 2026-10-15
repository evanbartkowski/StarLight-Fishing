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

  // 4. Realm 7 hazards (variants 0-3) render with mythical cosmic visuals
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
  for (let v = 0; v < 4; v++) {
    calls.length = 0;
    const hazard = new Hazard(typeConfig, 200, 400, { variant: v, realmStyle: 'void', zone: 7 });
    hazard.render(mockCtx, 0);
    assert.ok(calls.length > 5, `Realm 7 hazard variant ${v} must render successfully`);
  }

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
  assert.equal(r7Fishing.src, '/music/chrono-void-fishing.mp3', 'Realm 7 fishing track must be the user attached song');
  assert.equal(r7Surface.src, '/music/ocean-vibes.mp3', 'Realm 7 surface track must be ocean-vibes');

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









import test from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
globalThis.Audio = class {};
const { FISH_SPECIES, LEGACY_SALVAGE_SPECIES } = await import('../src/data/FishData.js');
const { LEGENDARY_SPECIES } = await import('../src/data/legendaries.js');
const { FANTASY_SEAS } = await import('../src/entities/SeasData.js');
const { REALM_PROFILES, REALM_HAZARDS, REALM_TREASURES, belongsToRealm } = await import('../src/data/RealmContent.js');
const { REALM_RELICS } = await import('../src/data/RelicsData.js');
const { TREASURE_ITEMS, HAZARD_TYPES } = await import('../src/data/TreasureData.js');
const { ZONE_ALMANAC_DATA, getZoneProgress } = await import('../src/data/almanac.config.js');
const { OceanWorld } = await import('../src/world/OceanWorld.js');
const { SaveSystem } = await import('../src/systems/SaveSystem.js');
const { UPGRADE_DEFINITIONS } = await import('../src/data/UpgradesData.js');
const { Fish } = await import('../src/entities/Fish.js');
const { Hazard } = await import('../src/entities/Hazard.js');
const { Treasure } = await import('../src/entities/Treasure.js');
const { worldCycle } = await import('../src/systems/WorldCycle.js');
worldCycle.getApexSpawnMultiplier = () => 1.0;
worldCycle.getCrateDropMultiplier = () => 1.0;

function advancedSave() {
  const save = new SaveSystem();
  save.data.level = 50;
  save.data.coins = 100000000;
  save.data.unlockedSeas = FANTASY_SEAS.map(sea => sea.id);
  for (const [key, definition] of Object.entries(UPGRADE_DEFINITIONS)) save.data.upgrades[key] = definition.tiers.length - 1;
  return save;
}

test('shooters fire fast horizontal projectiles and chargers keep their committed heading', () => {
  const hook = { x: 210, y: 650, state: 'DESCENDING' };
  const config = { id: 'attack-test', damage: 1, radius: 20, speed: 80, color: '#ff0000' };
  const shooter = new Hazard({ ...config, attack: 'shoot' }, 200, 500);
  shooter.attackCooldown = 0;
  shooter.update(16, 800, hook);
  assert.ok(shooter.attackState.warning > 0);
  assert.equal(shooter.shots.length, 0);
  for (let i = 0; i < 44; i++) shooter.update(16, 800, hook);
  assert.equal(shooter.shots.length, 1);
  const shot = shooter.shots[0];
  assert.ok(Math.abs(shot.vy) <= Math.abs(shot.vx), 'shots stay within 45 degrees of horizontal');
  assert.ok(Math.hypot(shot.vx, shot.vy) >= 439, 'shots travel faster than before');
  assert.equal(shooter.intersectsHook(shot.x, shot.y, 1), true);
  assert.equal(shooter.shots.length, 0);
  const chargerHook = { x: 350, y: 500, state: 'DESCENDING' };
  const charger = new Hazard({ ...config, attack: 'dash' }, 200, 500);
  charger.attackCooldown = 0; charger.update(16, 800, chargerHook);
  chargerHook.y = 650;
  for (let i = 0; i < 50; i++) charger.update(16, 800, chargerHook);
  assert.ok(charger.x > 230); assert.equal(charger.y, 500);
});

test('same obstacle types vary in size between instances', () => {
  const config = { id: 'size-test', radius: 30, naturalKind: 'kelp' };
  const smaller = new Hazard(config, 400, 500);
  const larger = new Hazard(config, 200, 500);
  assert.ok(smaller.sizeScale < larger.sizeScale);
  assert.ok(smaller.radius < larger.radius);
});

test('fossils are realm-specific, solitary, and never respawn after discovery and reload', () => {
  const save = advancedSave();
  const random = Math.random;
  Math.random = () => .01;
  try {
    for (let realm = 1; realm <= 7; realm++) {
      save.data.currentSea = realm;
      const world = new OceanWorld({ width: 390, height: 720 });
      const local = TREASURE_ITEMS.filter(item => item.category === 'fossil' && belongsToRealm(item, realm));
      assert.ok(local.length >= 3);
      world.populateWorld(save);
      const fossils = world.entities.treasures.filter(item => item.category === 'fossil');
      assert.equal(fossils.length, 1);
      assert.ok(local.some(item => item.id === fossils[0].id));
      for (const fossil of local) { save.recordCatchItem(fossil); save.recordCatchItem(fossil); }
      save.save(); save.load();
      assert.ok(local.every(item => save.data.fossils[item.id].count === 1));
      world.populateWorld(save);
      assert.equal(world.entities.treasures.filter(item => item.category === 'fossil').length, 0);
    }
  } finally { Math.random = random; }
});

test('shiny variants retain species and rarity with rare, bounded lure odds', async () => {
  const { shinyPalette, reserveGold } = await import('../src/rendering/FishAppearance.js');
  const species = FISH_SPECIES.find(item => item.rarity === 'rare');
  const normal = new Fish(species, 100, 500, { shinyChance: 0 });
  const shiny = new Fish(species, 100, 500, { shinyChance: 1 });
  assert.equal(shiny.species, normal.species);
  assert.equal(shiny.rarityColor, normal.rarityColor);
  assert.deepEqual(shiny.shinyColors, shinyPalette(species.id));
  assert.notDeepEqual(shiny.shinyColors, normal.bodyColors);
  assert.notEqual(reserveGold('#fbbf24', false), '#fbbf24');
  assert.equal(reserveGold('#fbbf24', true), '#fbbf24');
  assert.equal(UPGRADE_DEFINITIONS.lureLuck.tiers[0].shinyChance, .002);
  assert.ok(UPGRADE_DEFINITIONS.lureLuck.tiers.every(tier => tier.shinyChance <= .02));
});

test('equipped dolphin stays visible in every weather and shark hover follows its body', async () => {
  const { BackgroundDolphin, BoatShark } = await import('../src/entities/BoatCompanions.js');
  const dolphin = new BackgroundDolphin(390);
  for (const weather of ['CLEAR', 'FOG', 'RAIN']) {
    for (let i = 0; i < 120; i++) {
      dolphin.update(1000, 220, weather);
      assert.ok(dolphin.active && Number.isFinite(dolphin.y + dolphin.arcY));
      assert.ok(dolphin.x >= 35 && dolphin.x <= 355);
    }
  }
  const shark = new BoatShark(); shark.update(1000, { x: 195 }, 220);
  assert.equal(shark.checkHover(shark.x, shark.y - 30, 30), true);
  assert.equal(shark.checkHover(0, 0), false);
});

test('themed plant patches span every realm and apex creatures remain late-realm inhabitants', () => {
  const save = advancedSave();
  for (let realm = 1; realm <= 7; realm++) {
    save.data.currentSea = realm;
    const world = new OceanWorld({ width: 390, height: 720 });
    world.populateWorld(save);
    const depths = world.entities.flora.map(plant => (plant.y - world.surfaceY) / world.pixelsPerMeter);
    assert.ok(depths.some(depth => depth < 130), `shallow plants in realm ${realm}`);
    assert.ok(depths.some(depth => depth > world.maxDepthMeters * .8), `deep plants in realm ${realm}`);
    assert.equal(new Set(world.entities.flora.map(plant => plant.id)).size, 1);
  }
  const apex = HAZARD_TYPES.filter(h => h.id.startsWith('apex_'));
  assert.equal(apex.length, 16);
  assert.ok(apex.every(h => h.zone >= 4 && h.radius * h.sizeScale >= 150));
  assert.ok(apex.some(h => h.marineKind === 'plesiosaur'));
  assert.ok(apex.some(h => h.marineKind === 'mosasaur'));
});

test('submarines are rare and full-sized while endgame enemies increase with depth', () => {
  const save = advancedSave(); save.data.currentSea = 7;
  const world = new OceanWorld({ width: 390, height: 720 });
  const original = Math.random; let seed = 91321, submarines = 0, shallow = 0, deep = 0;
  Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  try {
    for (let dive = 0; dive < 240; dive++) {
      world.populateWorld(save);
      for (const hazard of world.entities.hazards) {
        if (hazard.type === 'deep_submarine') {
          submarines++; assert.ok(hazard.radius >= 200);
          hazard.update(1000, 390); assert.ok(Number.isFinite(hazard.x));
        }
        if (!hazard.marineKind) continue;
        const depth = (hazard.y - world.surfaceY) / world.pixelsPerMeter;
        if (depth >= 300 && depth < 800) shallow++;
        if (depth >= 2000 && depth < 2500) deep++;
      }
    }
    assert.ok(submarines > 0 && submarines < 48, `${submarines}/240 submarine encounters`);
    assert.ok(deep > shallow * 1.35, `deep enemies ${deep}, shallow ${shallow}`);
  } finally { Math.random = original; }
});

test('each endgame realm more than doubles its previous enemy population', async () => {
  const { REALM_ECOLOGY } = await import('../src/data/RealmEcology.js');
  const save = advancedSave(), world = new OceanWorld({ width: 1280, height: 720 });
  const original = Math.random; let seed = 67892;
  Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  try {
    for (const realm of [5, 6, 7]) {
      save.data.currentSea = realm;
      let oldExpected = 0, actual = 0;
      for (const creature of HAZARD_TYPES.filter(h => h.marineKind && h.zone === realm && !h.id.startsWith('apex_'))) {
        const spacing = creature.isColossal ? 750 : 250;
        const chance = creature.isColossal ? .22 : creature.marineKind === 'jelly' ? .3 : .22;
        for (let depth = creature.minDepth; depth + 20 < 3000; depth += spacing) {
          oldExpected += Math.min(.85, chance * REALM_ECOLOGY[realm].enemies * (1 + depth / (depth + 350) * .8)) * (creature.marineKind === 'jelly' ? 4 : 1);
        }
      }
      for (let dive = 0; dive < 40; dive++) {
        world.populateWorld(save);
        actual += world.entities.hazards.filter(h => h.marineKind && !h.type.startsWith('apex_')).length;
      }
      assert.ok(actual / 40 > oldExpected * 2, `realm ${realm}: ${actual / 40} vs previous ${oldExpected}`);
    }
  } finally { Math.random = original; }
});

test('every realm has 42 real native fish, distinct content, and complete journal coverage', () => {
  const all = [...FISH_SPECIES, ...LEGENDARY_SPECIES];
  assert.equal(new Set(all.map(f => f.id)).size, all.length);
  assert.equal(FISH_SPECIES.length, 294);
  for (const sea of FANTASY_SEAS) {
    const natives = FISH_SPECIES.filter(f => f.zone === sea.id);
    assert.equal(natives.length, 42);
    assert.ok(new Set(natives.map(f => f.shape)).size >= 6);
    assert.ok(new Set(natives.map(f => f.movementType).filter(Boolean)).size >= 4);
    assert.equal(REALM_HAZARDS.filter(h => h.zone === sea.id).length, 4);
    assert.equal(REALM_TREASURES.filter(t => t.zone === sea.id).length, 7);
    assert.equal(REALM_RELICS.filter(r => r.zone === sea.id).length, 2);
    const ids = all.filter(f => f.zone === sea.id).map(f => f.id);
    assert.ok(ids.length >= 30 && ids.length <= 45);
    assert.deepEqual(ZONE_ALMANAC_DATA[`sea_${sea.id}`].speciesIds, ids);
    const save = new SaveSystem();
    ids.forEach(id => { save.data.journal[id] = { count: 1 }; });
    assert.equal(getZoneProgress(`sea_${sea.id}`, save).percent, 100);
    assert.ok(FISH_SPECIES.filter(f => f.zone !== sea.id && belongsToRealm(f, sea.id)).length <= 1);
  }
  assert.ok(LEGACY_SALVAGE_SPECIES.every(s => !FISH_SPECIES.some(f => f.id === s.id)));
});

test('charter prices and common rewards rise together; gates charge the authoritative price', () => {
  assert.deepEqual(FANTASY_SEAS.map(s => s.gates.unlockFee), [0,6000,35000,35000,210000,420000,3000000]);
  for (let i = 1; i < FANTASY_SEAS.length; i++) {
    const sea = FANTASY_SEAS[i], previous = FANTASY_SEAS[i-1];
    assert.equal(sea.gates.unlockFee, REALM_PROFILES[sea.id].fee);
    const meanValue = zone => FISH_SPECIES.filter(f => f.zone === zone && !f.isGodTier).reduce((sum, f) => sum + f.baseValue, 0) / 38;
    assert.ok(meanValue(sea.id) > meanValue(previous.id) * 1.5);
    assert.ok(REALM_RELICS.find(r => r.zone === sea.id).restoredValue > REALM_RELICS.find(r => r.zone === previous.id).restoredValue * 1.5);
    assert.ok(REALM_PROFILES[sea.id].commonValue > REALM_PROFILES[previous.id].commonValue * 1.5);
    const save = advancedSave();
    save.data.unlockedSeas = [1];
    save.checkAchievements = () => {}; // Isolate charter deductions from unrelated level/upgrade achievement rewards.
    save.data.coins = sea.gates.unlockFee - 1;
    assert.equal(save.unlockSea(sea.id, 0), false);
    save.data.coins++;
    assert.equal(save.unlockSea(sea.id, 0), true);
    assert.equal(save.data.coins, 0);
    assert.equal(save.unlockSea(sea.id), true);
    assert.equal(save.data.coins, 0);
  }
  const beginner = new SaveSystem();
  beginner.data.coins = 100000000;
  assert.equal(beginner.unlockSea(7), false);
  assert.equal(beginner.unlockSea(99), false);
});

test('repeated dives keep native fish, hazards, relics, and loot in their own realms', () => {
  const save = advancedSave();
  const world = new OceanWorld({ width: 1280, height: 720 });
  world.setSaveSystem(save);
  const originalRandom = Math.random;
  let seed = 123456;
  Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  try {
    for (const sea of FANTASY_SEAS) {
      save.setCurrentSea(sea.id);
      const seen = new Set();
      for (let dive = 0; dive < 60; dive++) {
        world.populateWorld(save);
        for (const fish of world.entities.fish) {
          assert.ok(belongsToRealm(fish.species, sea.id), fish.name);
          assert.ok(fish.y >= world.surfaceY + fish.radius);
          seen.add(fish.speciesId);
        }
        for (const hazard of world.entities.hazards) {
          const config = HAZARD_TYPES.find(h => h.id === hazard.type);
          assert.ok(belongsToRealm(config, sea.id));
          if (hazard.marineKind) assert.ok((hazard.y - world.surfaceY) / world.pixelsPerMeter >= config.minDepth);
        }
        const jellies = world.entities.hazards.filter(h => h.marineKind === 'jelly');
        assert.ok(jellies.length === 0 || jellies.length >= 3, 'jellyfish spawn in groups');
        for (const treasure of world.entities.treasures) assert.ok(belongsToRealm(treasure.itemConfig, sea.id));
        for (const relic of world.entities.relics) assert.equal(relic.relicType.zone, sea.id);
      }
      assert.ok(seen.size >= 30, `${sea.name}: only ${seen.size} reachable species`);
    }
  } finally { Math.random = originalRandom; }
});

test('native cache reward metadata survives inventory saves and selling uses native value', () => {
  const save = new SaveSystem();
  const config = REALM_TREASURES.find(t => t.zone === 7 && t.isCrate);
  const treasure = new Treasure(config, 100, 500);
  const item = save.addItemToInventory(treasure);
  save.save(); save.load();
  const loaded = save.getInventory().find(i => i.instanceId === item.instanceId);
  assert.equal(loaded.rewardMultiplier, config.rewardMultiplier);
  assert.equal(loaded.zone, 7);
  const sale = save.sellInventoryItem(loaded.instanceId, 1);
  assert.equal(sale.gold, config.value);
});

test('new fish and all realm visuals can render with finite geometry', () => {
  let calls = 0;
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1 }, { get(target, key) {
    if (key in target) return target[key];
    if (String(key).startsWith('create')) return () => gradient;
    return (...args) => { calls++; for (const value of args) if (typeof value === 'number') assert.ok(Number.isFinite(value), `${String(key)} received non-finite geometry`); };
  } });
  for (const species of FISH_SPECIES) new Fish(species, 300, 500).render(ctx, 0);
  for (const hazard of HAZARD_TYPES) new Hazard(hazard, 300, 500).render(ctx, 0);
  for (const treasure of REALM_TREASURES) new Treasure(treasure, 300, 500).render(ctx, 0);
  assert.ok(calls > 1000);
});

test('Irene joins at level 36 and is granted to existing high-level saves', async () => {
  const { PET_DEFINITIONS } = await import('../src/data/PetsData.js');
  assert.equal(Object.keys(PET_DEFINITIONS).length, 4);
  assert.equal(PET_DEFINITIONS.shark.reqLevel, 36);
  const save = new SaveSystem();
  save.data.level = 35;
  assert.equal(save.hasPet('shark'), false);
  save.addXp(save.getXpRequired(35));
  assert.equal(save.data.level, 36);
  assert.equal(save.hasPet('shark'), true);
  delete save.data.pets.shark;
  save.save(); save.load();
  assert.equal(save.hasPet('shark'), true);
});

test('appearance, aquarium decor, and displayed treasure survive reload without earning fish tips', () => {
  const save = new SaveSystem();
  save.data.gems = 40;
  save.setAppearance('coat', '#0d9488');
  save.setAppearance('hat', 'beanie');
  save.setUpgradeLevel('personalAquarium', 1);
  save.data.coins = 2000;
  save.setAquariumDecoration('substrate', 'pearl');
  save.setAquariumDecoration('decoration', 'crystals');
  save.setAquariumDecoration('lighting', 'moonlight');
  save.setUpgradeLevel('personalAquarium', 1);
  const config = REALM_TREASURES.find(t => t.zone === 4 && !t.isCrate);
  const treasure = save.addItemToInventory(new Treasure(config, 100, 100));
  assert.equal(save.moveItemToAquarium(treasure.instanceId).success, true);
  assert.equal(save.getVisitorTipRate(), 0);
  assert.equal(save.sellInventoryItem(treasure.instanceId), null);
  const crate = save.addItemToInventory(new Treasure(REALM_TREASURES.find(t => t.isCrate), 100, 100));
  assert.equal(save.moveItemToAquarium(crate.instanceId).success, false);
  save.save(); save.load();
  assert.equal(save.data.appearance.coat, '#0d9488');
  assert.equal(save.data.appearance.hat, 'beanie');
  assert.equal(save.data.aquarium.decor.substrate, 'pearl');
  assert.equal(save.data.aquarium.decor.lighting, 'moonlight');
  assert.equal(save.isItemInAquarium(treasure.instanceId), true);
  save.setAppearance('hat', 'invalid');
  assert.equal(save.data.appearance.hat, 'rainhat');
});

test('shop places completed upgrades after every available upgrade', async () => {
  const { UIManager } = await import('../src/ui/UIManager.js');
  const oldDocument = globalThis.document;
  globalThis.document = { getElementById: () => null, querySelectorAll: () => [] };
  try {
    const save = new SaveSystem();
    save.data.upgrades.lineLength = UPGRADE_DEFINITIONS.lineLength.tiers.length - 1;
    const ui = Object.create(UIManager.prototype);
    ui.saveSystem = save;
    let html;
    ui.openModal = (title, body) => { html = body; };
    ui.openShop();
    const completedPosition = html.indexOf('<h3>Fishing Line Length</h3>');
    for (const upgrade of Object.values(UPGRADE_DEFINITIONS)) {
      if (upgrade.id !== 'lineLength') assert.ok(html.indexOf(`<h3>${upgrade.name}</h3>`) < completedPosition);
    }
  } finally { globalThis.document = oldDocument; }
});


test('aquarium purchases persist, owned styles are free, and feeding costs exactly one coin', () => {
  const save = new SaveSystem();
  save.setUpgradeLevel('personalAquarium', 1);
  save.data.aquarium.decor = { substrate: 'sand' };
  save.data.aquarium.ownedStyles = [];
  save.data.coins = 99;
  assert.equal(save.setAquariumDecoration('substrate', 'pebbles'), false);
  assert.equal(save.data.aquarium.decor.substrate, 'sand');
  assert.equal(save.data.coins, 99);
  save.data.coins = 1;
  save.data.gems = 2;
  assert.equal(save.setAquariumDecoration('substrate', 'pebbles'), true);
  assert.equal(save.data.coins, 1);
  assert.equal(save.feedAquarium(), true);
  assert.equal(save.data.coins, 0);
  assert.equal(save.feedAquarium(), false);
  save.save(); save.load();
  assert.equal(save.setAquariumDecoration('substrate', 'sand'), true);
  assert.equal(save.setAquariumDecoration('substrate', 'pebbles'), true);
  assert.equal(save.data.coins, 0);
  assert.equal(save.setAquariumTheme('nebula'), false);
  assert.equal(save.setAquariumDecoration('substrate', 'invalid'), false);
});

test('journal opens every realm and renders the current realm roster', async () => {
  const { UIManager } = await import('../src/ui/UIManager.js');
  const oldDocument = globalThis.document;
  const element = { addEventListener() {}, classList: { add() {}, remove() {} }, style: {} };
  globalThis.document = { getElementById: () => element, querySelectorAll: () => [] };
  try {
    const save = advancedSave();
    for (const sea of FANTASY_SEAS) {
      save.data.currentSea = sea.id;
      const ui = Object.create(UIManager.prototype);
      ui.saveSystem = save;
      let html = '';
      ui.openModal = (title, body) => { html = body; };
      ui.openJournalLogbook('journal', 'fieldlog');
      assert.ok(html.includes(`${sea.name} Almanac`));
      for (const realm of FANTASY_SEAS) assert.ok(html.includes(`data-zone="sea_${realm.id}"`));
    }
  } finally { globalThis.document = oldDocument; }
});


test('scoreboard switches between level and money order with deterministic tie breaks', async () => {
  const { UIManager } = await import('../src/ui/UIManager.js');
  const oldDocument = globalThis.document;
  const container = { innerHTML: '', querySelectorAll: () => [], querySelector: () => null };
  globalThis.document = { getElementById: () => container };
  try {
    const ui = Object.create(UIManager.prototype);
    const base = { xp: 0, coins: 0, totalGoldEarned: 0, totalFishCaught: 0, maxDepthReached: 0, createdAt: 100, isCurrent: false };
    const entries = [
      { ...base, username: 'Wealthy', level: 2, coins: 500 },
      { ...base, username: 'Veteran', level: 8, xp: 10 },
      { ...base, username: 'Leader', level: 8, xp: 20 },
    ];
    await ui.renderScoreboardTab('level', { entries, online: true });
    assert.ok(container.innerHTML.indexOf('>Leader</span>') < container.innerHTML.indexOf('>Veteran</span>'));
    assert.ok(container.innerHTML.indexOf('>Veteran</span>') < container.innerHTML.indexOf('>Wealthy</span>'));
    await ui.renderScoreboardTab('money', { entries, online: true });
    assert.ok(container.innerHTML.indexOf('>Wealthy</span>') < container.innerHTML.indexOf('>Leader</span>'));
  } finally { globalThis.document = oldDocument; }
});


test('upgraded lines have native fish throughout the lower depths of every realm', () => {
  const save = advancedSave();
  for (const sea of FANTASY_SEAS) {
    save.data.currentSea = sea.id;
    const world = new OceanWorld(1000, 700);
    world.populateWorld(save);
    for (let depth = 600; depth <= 2900; depth += 200) {
      assert.ok(world.entities.fish.some(f => f.zone === sea.id && Math.abs((f.y - world.surfaceY) / world.pixelsPerMeter - depth) < 90), `${sea.name}: empty near ${depth}m`);
    }
  }
});

test('Sunlit Shoals has more small hazards and reserves giant obstacles for deep water', () => {
  const save = advancedSave();
  save.data.currentSea = 1;
  const world = new OceanWorld(1000, 700);
  world.populateWorld(save);
  assert.ok(world.entities.hazards.filter(h => !h.isColossal).length >= 12);
  assert.ok(world.entities.hazards.filter(h => !h.marineKind).every(h => ['plant', 'boulder', 'log', 'wreck', 'diver'].includes(h.naturalKind)), 'starter hazards should use recognizable coastal objects');
  for (const hazard of world.entities.hazards.filter(h => h.isColossal)) assert.ok((hazard.y - world.surfaceY) / world.pixelsPerMeter >= 100);
});

test('owned pets can be equipped and rested without losing ownership after reload', () => {
  const save = new SaveSystem();
  save.unlockPet('dolphin');
  assert.equal(save.isPetEquipped('dolphin'), true);
  save.setPetEquipped('dolphin', false);
  save.load();
  assert.equal(save.hasPet('dolphin'), true);
  assert.equal(save.isPetEquipped('dolphin'), false);
  assert.equal(save.setPetEquipped('dolphin', true), true);
  assert.equal(save.isPetEquipped('dolphin'), true);
  save.data.pets.shark = false;
  assert.equal(save.setPetEquipped('shark', true), false);
});

test('new quests count only the matching catch, crate, and completed dive events', async () => {
  const { QUEST_POOL } = await import('../src/data/QuestsData.js');
  const find = id => QUEST_POOL.find(q => q.id === id);
  assert.equal(find('harbor_supper').check({ type: 'catch_fish' }, 0), 1);
  assert.equal(find('steady_hands').check({ type: 'dive_completed', tookDamage: false, catchesCount: 2 }, 0), 1);
  assert.equal(find('steady_hands').check({ type: 'dive_completed', tookDamage: true, catchesCount: 2 }, 0), 0);
  assert.equal(find('sealed_surprise').check({ type: 'catch_crate' }, 0), 0);
  assert.equal(find('sealed_surprise').check({ type: 'open_crate' }, 0), 1);
});

test('dismissing an NPC allows future visitors and open menus block popup interruptions', async () => {
  const { NPCSystem, NPC_DEFINITIONS } = await import('../src/systems/NPCSystem.js');
  const ui = { activeModal: 'shop', showNPCModal() { this.activeModal = 'npc_encounter'; } };
  const npc = new NPCSystem({ recordNPCInteraction() {} }, null, ui);
  assert.equal(npc.checkRandomEncounter(), false);
  npc.triggerEncounter(NPC_DEFINITIONS[0]);
  ui.activeModal = null;
  npc.update(100);
  assert.equal(npc.activeEncounter, null);
  assert.equal(NPC_DEFINITIONS.length, 7);
});

test('depth populations taper fish gently and increase hazards and treasure deeper down', () => {
  const originalRandom = Math.random;
  let seed = 98765;
  Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  try {
    const save = advancedSave();
    const world = new OceanWorld({ width: 1280, height: 720 });
    for (const sea of FANTASY_SEAS) {
      save.data.currentSea = sea.id;
      const totals = { fish: [0, 0], hazards: [0, 0], treasures: [0, 0] };
      for (let dive = 0; dive < 40; dive++) {
        world.populateWorld(save);
        for (const kind of Object.keys(totals)) {
          for (const entity of world.entities[kind]) {
            const depth = (entity.y - world.surfaceY) / world.pixelsPerMeter;
            assert.ok(Number.isFinite(entity.x) && depth >= 0 && depth <= 3000);
            if (kind === 'fish' && (entity.species.isSpecialDeep || !FISH_SPECIES.includes(entity.species))) continue;
            if (depth >= 100 && depth < 600) totals[kind][0]++;
            if (depth >= 2400 && depth < 2900) totals[kind][1]++;
          }
        }
      }
      const ratio = totals.fish[1] / totals.fish[0];
      assert.ok(ratio > 0.4 && ratio < 0.85, `${sea.name}: fish ratio ${ratio}`);
      for (const kind of ['hazards', 'treasures']) {
        assert.ok(totals[kind][1] > totals[kind][0] * 1.3, `${sea.name}: ${kind} should increase with depth`);
      }
    }
    save.data.currentSea = 1;
    for (const tier of [0, 3, 11]) {
      save.data.upgrades.lineLength = tier;
      world.populateWorld(save);
      const surfaceFish = world.entities.fish.filter(f => (f.y - world.surfaceY) / world.pixelsPerMeter < 50);
      assert.ok(surfaceFish.length >= 5 && surfaceFish.length <= 6, 'surface population stays modest after upgrades');
    }
  } finally { Math.random = originalRandom; }
});

test('Atlantis columns scroll past the camera and disappear below their world depth', () => {
  const world = new OceanWorld({ width: 1280, height: 720 });
  const rectangles = [];
  const ctx = new Proxy({}, { get: (_, key) => key === 'fillRect' ? (...args) => rectangles.push(args) : () => {}, set: () => true });
  world.renderSunkenAtlantisPillars(ctx, 600, 720);
  const firstFrame = rectangles.splice(0);
  assert.ok(firstFrame.length > 6);
  world.renderSunkenAtlantisPillars(ctx, 800, 720);
  const secondFrame = rectangles.splice(0);
  assert.equal(secondFrame.length, firstFrame.length);
  firstFrame.forEach((rect, i) => {
    assert.equal(secondFrame[i][0], rect[0]);
    assert.equal(secondFrame[i][1], rect[1] - 200);
  });
  world.renderSunkenAtlantisPillars(ctx, 2000, 720);
  assert.equal(rectangles.length, 0, 'columns must leave the viewport on deeper dives');
});

test('stars and plankton stay at world positions as a dive begins', () => {
  const world = new OceanWorld({ width: 1280, height: 720 });
  world.causticTimer = 15;
  for (const method of ['renderAstralStarlightCascades', 'renderBioluminescentPlankton']) {
    const points = [];
    const ctx = new Proxy({}, { get: (_, key) => key === 'arc' ? (x, y) => points.push([x, y]) : key === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
    world[method](ctx, 300, 720);
    const before = points.splice(0).filter(([, y]) => y > 100 && y < 600);
    world[method](ctx, 350, 720);
    assert.ok(before.length > 5);
    for (const [x, y] of before) assert.ok(points.some(([nx, ny]) => nx === x && Math.abs(ny - (y - 50)) < 0.001), `${method}: particle jumped with camera`);
  }
});

test('deep water favors rarer valuable catches and leviathans remain occasional', () => {
  const random = Math.random;
  let seed = 54678;
  Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  try {
    const save = advancedSave();
    const world = new OceanWorld({ width: 1280, height: 720 });
    for (const sea of FANTASY_SEAS) {
      save.data.currentSea = sea.id;
      const rank = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
      const bins = [{ count: 0, rarity: 0, value: 0 }, { count: 0, rarity: 0, value: 0 }];
      let leviathanDives = 0;
      for (let dive = 0; dive < 40; dive++) {
        world.populateWorld(save);
        if (world.entities.fish.some(f => f.species.id === `realm_${sea.id}_deep_2`)) leviathanDives++;
        for (const f of world.entities.fish) {
          const depth = (f.y - world.surfaceY) / world.pixelsPerMeter;
          const bin = depth < 400 ? bins[0] : depth >= 2000 ? bins[1] : null;
          if (bin) { bin.count++; bin.rarity += rank[f.rarity]; bin.value += f.value; }
        }
      }
      assert.ok(bins[1].rarity / bins[1].count > bins[0].rarity / bins[0].count + .5, sea.name);
      assert.ok(bins[1].value / bins[1].count > bins[0].value / bins[0].count, sea.name);
      assert.ok(leviathanDives > 0 && leviathanDives < 25, `${sea.name}: leviathans should be occasional`);
    }
  } finally { Math.random = random; }
});

test('marine hunters chase briefly, respect habitat bounds, and jellyfish move slowly', () => {
  const make = kind => new Hazard({ ...HAZARD_TYPES.find(h => h.zone === 1 && h.marineKind === kind), attack: undefined }, 400, 5000);
  const jelly = make('jelly'), shark = make('shark');
  const hook = { x: 600, y: 5000, state: 'DESCENDING' };
  for (let frame = 0; frame < 20; frame++) { jelly.update(16, 1280, hook); shark.update(16, 1280, hook); }
  assert.ok(shark.x - 400 > 50);
  assert.ok(Math.abs(jelly.x - 400) < 7);
  for (let frame = 0; frame < 180; frame++) shark.update(16, 1280, hook);
  assert.ok(shark.restTime > 0, 'hunter gives the player a break after pursuit');
  shark.minY = 4900; shark.maxY = 5100;
  hook.y = 8000;
  for (let frame = 0; frame < 120; frame++) shark.update(16, 1280, hook);
  assert.ok(shark.y >= 4900 && shark.y <= 5100);
  const resting = make('shark');
  resting.timer = 0;
  hook.x = 650; hook.y = 5000; hook.state = 'IDLE';
  resting.update(16, 1280, hook);
  assert.ok(resting.chaseTime === 0, 'surface hook does not attract hunters');
  const distantHook = { x: 100, y: 8000, state: 'DESCENDING' };
  resting.update(16, 1280, distantHook);
  assert.equal(resting.facing, -1, 'hunters face the active hook before it enters detection range');
});

test('Aether island scenery scrolls with world depth instead of sticking to the corner', () => {
  const world = new OceanWorld({ width: 1280, height: 720 });
  const points = [];
  const ctx = new Proxy({}, { get: (_, key) => key === 'moveTo' ? (...args) => points.push(args) : () => {}, set: () => true });
  world.renderAetherSkyIslands(ctx, 1000, 720);
  const before = points.splice(0);
  world.renderAetherSkyIslands(ctx, 1100, 720);
  assert.equal(before.length, 2);
  before.forEach((point, i) => assert.equal(points[i][1], point[1] - 100));
  points.length = 0;
  world.renderAetherSkyIslands(ctx, 2500, 720);
  assert.equal(points.length, 0);
});

test('realm ecology produces distinct fish, treasure, obstacle and enemy populations', () => {
  const save = advancedSave();
  const world = new OceanWorld({ width: 1280, height: 720 });
  const random = Math.random;
  let seed = 32456;
  Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  try {
    const totals = {};
    for (const realm of [1, 2, 4, 5, 6, 7]) {
      save.data.currentSea = realm;
      const result = totals[realm] = { fish: 0, treasure: 0, obstacles: 0, enemies: 0 };
      for (let dive = 0; dive < 30; dive++) {
        world.populateWorld(save);
        result.fish += world.entities.fish.length;
        result.treasure += world.entities.treasures.length;
        result.obstacles += world.entities.hazards.filter(h => !h.marineKind).length;
        result.enemies += world.entities.hazards.filter(h => h.marineKind).length;
        if (realm === 5) {
          for (const f of world.entities.fish) assert.ok(f.size >= f.species.sizeRange[0] * 2, 'Aether fish are oversized');
        }
      }
    }
    assert.ok(totals[2].fish > totals[5].fish * 3);
    assert.ok(totals[4].treasure > totals[1].treasure * 3);
    assert.ok(totals[6].obstacles > totals[1].obstacles * 3);
    assert.ok(totals[7].enemies > totals[1].enemies * 2);
  } finally { Math.random = random; }
});

test('all realms keep shallow and deep residents after a long dive', () => {
  const save = advancedSave();
  for (let realm = 1; realm <= 7; realm++) {
    save.data.currentSea = realm;
    save.getCurrentSea = () => realm;
    const ocean = new OceanWorld({ width: 390, height: 720 });
    ocean.populateWorld(save);
    assert.ok(ocean.entities.fish.some(f => f.y < ocean.surfaceY + 30 * 15), `realm ${realm} needs shallow residents`);
    const residents = ocean.entities.fish.filter(f => f.y > ocean.surfaceY + 430 * 15);
    assert.ok(residents.length > 30);
    const originalDepths = residents.map(f => f.y);
    for (let step = 0; step < 1200; step++) residents.forEach(f => f.update(250, 390, null));
    residents.forEach((fish, index) => assert.ok(Math.abs(fish.y - originalDepths[index]) <= 121, 'fish must remain near its populated shelf'));
  }
});

test('sparse realm retains a reachable shallow fish under extreme random selection', () => {
  const save = advancedSave(); save.data.currentSea = 5;
  const ocean = new OceanWorld({ width: 390, height: 720 });
  const random = Math.random;
  try {
    Math.random = () => .99999;
    ocean.populateWorld(save);
    const shallow = ocean.entities.fish.find(fish => fish.y < ocean.surfaceY + 30 * 15);
    assert.ok(shallow);
    assert.ok((shallow.y - ocean.surfaceY) / 15 >= shallow.species.minDepth);
    assert.ok((shallow.y - ocean.surfaceY) / 15 <= shallow.species.maxDepth);
  } finally { Math.random = random; }
});

test('heavy impacts consume two shields or drop a fish; normal impacts have a fifty percent threshold', async () => {
  const { Hook } = await import('../src/entities/Hook.js');
  const { soundManager } = await import('../src/audio/SoundManager.js');
  soundManager.playHazardShock = () => {}; soundManager.playFishEscape = () => {};
  const originalRandom = Math.random;
  const makeHook = shields => {
    const hook = new Hook(); hook.state = 'REELING'; hook.shields = shields;
    hook.caughtItems = [{ speciesId: 'fish', name: 'Fish', hookTo() {} }, { isTreasure: true, name: 'Treasure', hookTo() {} }];
    return hook;
  };
  try {
    for (const [roll, lost] of [[.49, true], [.5, false]]) {
      Math.random = () => roll;
      const hook = makeHook(0); hook.takeHazardHit({ knockback: 25 }, null);
      assert.equal(hook.caughtItems.length, lost ? 1 : 2);
      assert.ok(hook.caughtItems.some(item => item.isTreasure));
    }
    Math.random = () => .99;
    const protectedHook = makeHook(2); protectedHook.takeHazardHit({ shieldCost: 2, knockback: 30 }, null);
    assert.equal(protectedHook.shields, 0); assert.equal(protectedHook.caughtItems.length, 2);
    const unprotectedHook = makeHook(1); unprotectedHook.takeHazardHit({ shieldCost: 2, knockback: 30 }, null);
    assert.equal(unprotectedHook.shields, 0); assert.equal(unprotectedHook.caughtItems.length, 1);
  } finally { Math.random = originalRandom; }
});

test('god-tier fish are scarce, collectible, aquarium eligible and grant one achievement', () => {
  const save = new SaveSystem(); save.data = save.getDefaultData();
  save.setUpgradeLevel('personalAquarium', 1);
  const gods = FISH_SPECIES.filter(fish => fish.isGodTier);
  assert.equal(gods.length, 7);
  assert.ok(gods.every(fish => fish.spawnChance <= .005 && fish.minDepth >= 1600 && fish.scaleFactor >= 6 && fish.evasion));
  const fish = new Fish(gods[0], 200, 26000);
  const item = save.addItemToInventory(fish);
  save.recordCatchItem(fish);
  assert.equal(save.data.stats.godTierCaught, 1);
  assert.ok(save.isAchievementUnlocked('divine_angler'));
  assert.ok(item.isGodTier && item.isLocked && item.value >= 10000);
  assert.equal(save.moveItemToAquarium(item.instanceId).success, true);
});

test('quest rewards rise with the contracted realm and cannot be inflated by sailing before claiming', async () => {
  const { QuestSystem, questReward } = await import('../src/systems/QuestSystem.js');
  const { QUEST_POOL } = await import('../src/data/QuestsData.js');
  const { soundManager } = await import('../src/audio/SoundManager.js');
  soundManager.playUpgrade = () => {};
  const save = advancedSave();
  const def = QUEST_POOL.find(q => q.id === 'reef_angler');
  assert.ok(questReward(def, 7).rewardCoins > questReward(def, 3).rewardCoins);
  assert.ok(questReward(def, 7).rewardCoins < def.rewardCoins * 10);
  const quests = new QuestSystem(save);
  save.data.quests.active = [{ id: def.id, realmId: 1, current: 2, target: 3, claimed: false }];
  save.getCurrentSea = () => 7;
  quests.dispatch({ type: 'catch_fish', fish: { zone: 1 } });
  assert.equal(save.data.quests.active[0].current, 2);
  save.data.quests.active[0].current = 3;
  assert.equal(quests.claimQuest(def.id).rewardCoins, def.rewardCoins);
});

test('every upgraded vessel renders finite geometry and stays centered after repopulation', () => {
  const save = advancedSave();
  const ocean = new OceanWorld({ width: 390, height: 720 });
  ocean.setSaveSystem(save);
  let drawCalls = 0;
  const ctx = new Proxy({ globalAlpha: 1 }, { get(target, key) {
    if (key in target) return target[key];
    if (String(key).startsWith('create')) return () => ({ addColorStop() {} });
    return (...args) => { drawCalls++; for (const value of args) if (typeof value === 'number') assert.ok(Number.isFinite(value), `${String(key)} received invalid vessel geometry`); };
  } });
  for (let level = 0; level < UPGRADE_DEFINITIONS.boatVessel.tiers.length; level++) {
    save.data.upgrades.boatVessel = level;
    ocean.boat.x = 5000;
    ocean.populateWorld(save);
    assert.equal(ocean.boat.x, 195);
    assert.equal(ocean.boat.vesselLevel, level);
    ocean.boat.x = Number.NaN;
    ocean.boat.y = Number.NaN;
    ocean.boat.angle = Number.NaN;
    const before = drawCalls;
    ocean.renderBoatAndFisherman(ctx, 0);
    assert.equal(ocean.boat.x, 195);
    assert.ok(drawCalls > before + 20);
  }
});

test('teleporting fish cannot escape their underwater habitat', async () => {
  const { soundManager } = await import('../src/audio/SoundManager.js');
  soundManager.playTeleportWarp = () => {};
  const fish = new Fish({ ...FISH_SPECIES[0], minDepth: 2, maxDepth: 3000, evasion: { type: 'teleport', blinkDist: 500 } }, 180, 270);
  fish.executeEvasion({ x: 180, y: 700 }, null, 390);
  assert.ok(fish.y >= fish.minY && fish.y > 220);
});

test('weather type returns concise badges and diving mode preserves angler level', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync('src/style.css', 'utf-8');

  // Verify WorldCycle getWeatherType
  worldCycle.weather = 'CLEAR';
  assert.deepEqual(worldCycle.getWeatherType(), { icon: '✨', label: 'Clear' });
  worldCycle.weather = 'RAIN';
  assert.deepEqual(worldCycle.getWeatherType(), { icon: '🌧️', label: 'Rain' });
  worldCycle.weather = 'FOG';
  assert.deepEqual(worldCycle.getWeatherType(), { icon: '🌫️', label: 'Mist' });

  // Verify CSS: level-display is NOT hidden during diving
  assert.ok(!css.includes('#game-hud.hud-diving-mode .level-display'));
  // Verify CSS: weather-display is hidden during diving
  assert.ok(css.includes('#game-hud.hud-diving-mode .weather-display'));
  // Verify CSS: cloud transition exists
  assert.ok(css.includes('.realm-cloud-transition'));
  assert.ok(css.includes('.cloud-mist-backdrop'));
});

test('legendaries sell for higher values, weather badge hides while fishing, and bucket capacity stays accurate', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync('src/style.css', 'utf-8');
  const { LEGENDARY_SPECIES } = await import('../src/data/legendaries.js');
  const { VALUE_BY_RARITY } = await import('../src/data/RealmContent.js');
  const { Hook } = await import('../src/entities/Hook.js');
  const { SaveSystem } = await import('../src/systems/SaveSystem.js');

  // 1. Verify boosted legendary base sell values
  const starWeaver = LEGENDARY_SPECIES.find(s => s.id === 'star_weaver');
  assert.ok(starWeaver && (starWeaver.baseValue >= 3500 || starWeaver.value >= 3500), 'Star Weaver baseValue should be boosted');
  assert.ok(VALUE_BY_RARITY.legendary >= 40, 'RealmContent legendary base value factor should be boosted');

  // 2. Verify weather badge hidden during diving in CSS
  assert.ok(css.includes('#game-hud.hud-diving-mode #hud-weather-badge'), 'hud-weather-badge hidden in diving mode');

  // 3. Verify summary action buttons flex-wrap nowrap in CSS
  assert.ok(css.includes('.summary-actions'), 'summary-actions present');

  // 4. Verify hook capacity derives properly from upgrades
  const save = new SaveSystem();
  save.data.upgrades = { hookCapacity: 2 };
  const hook = new Hook();
  hook.applyUpgrades(save);
  assert.strictEqual(hook.capacity, 5, 'Hook capacity should match tier 2 (5)');
});

test('creature roster updates, powerup durations, and centered modal overlay styles', async () => {
  const fs = await import('node:fs');
  const { FISH_SPECIES } = await import('../src/data/FishData.js');
  const { POWERUP_TYPES } = await import('../src/entities/Powerup.js');

  const realm1Names = FISH_SPECIES.filter(f => f.zone === 1).map(f => f.name);
  const realm2Names = FISH_SPECIES.filter(f => f.zone === 2).map(f => f.name);

  // 1. Spotted Harbor Seal removed, Harp Seal Pup present in Realm 2
  assert.equal(realm1Names.includes('Spotted Harbor Seal'), false, 'Spotted Harbor Seal must be removed');
  assert.equal(realm2Names.includes('Harp Seal Pup'), true, 'Harp Seal Pup must be in Realm 2');

  // 2. Kelp Turtle renamed from Kelpback Turtle
  assert.equal(realm1Names.includes('Kelpback Turtle'), false, 'Kelpback Turtle must be renamed');
  assert.equal(realm1Names.includes('Kelp Turtle'), true, 'Kelp Turtle must be present in Realm 1');

  // 3. Powerups last longer
  const overdrive = POWERUP_TYPES.find(p => p.id === 'overdrive');
  const magnet = POWERUP_TYPES.find(p => p.id === 'magnet');
  const capacity = POWERUP_TYPES.find(p => p.id === 'capacity_boost');
  assert.equal(overdrive.duration, 25, 'Overdrive duration should be 25s');
  assert.equal(magnet.duration, 30, 'Magnet duration should be 30s');
  assert.ok(capacity.desc.includes('5 extra catches'), 'Capacity boost should give 5 extra catches');

  // 4. Modal overlay CSS centering
  const css = fs.readFileSync('src/style.css', 'utf8');
  assert.ok(css.includes('position: fixed') && css.includes('z-index: 100000'), 'Modal overlay should be fixed with high z-index');
  assert.ok(css.includes('.chat-announcement-fleet') && css.includes('.chat-announcement-global'), 'Announcement styles should be present');
});

test('Sunken Atlantis mermaids, krakens and serpents; Shimmerfall deep sirens; Caldera magma monsters and lava obstacles', () => {
  // 1. Sunken Atlantis Mermaids: catchable species with shape 'mermaid' and distinct hair colors
  const atlantisMermaids = FISH_SPECIES.filter(f => f.zone === 4 && f.shape === 'mermaid');
  assert.ok(atlantisMermaids.length >= 2, 'Sunken Atlantis must have catchable mermaids');
  assert.ok(atlantisMermaids.some(f => f.name.includes('Mermaid')));

  // Test individual hair color variation on mermaids
  const mermaidSpecies = atlantisMermaids[0];
  const mermaid1 = new Fish(mermaidSpecies, 100, 300);
  const mermaid2 = new Fish(mermaidSpecies, 400, 500);
  assert.ok(mermaid1.hairColor, 'Mermaid instance has hair color');
  assert.ok(typeof mermaid1.hairColor === 'string');

  // Verify render without errors
  const mockCtx = new Proxy({}, {
    get: (_, key) => key.includes('Gradient') ? () => ({ addColorStop() {} }) : () => {},
    set: () => true
  });
  mermaid1.render(mockCtx, 0);
  mermaid2.render(mockCtx, 0);

  // 2. Corinthian Seahorse: verify rendered without error
  const corinthian = FISH_SPECIES.find(f => f.name === 'Corinthian Seahorse');
  assert.ok(corinthian, 'Corinthian Seahorse exists in species');
  assert.equal(corinthian.shape, 'seahorse');
  const corinthianFish = new Fish(corinthian, 200, 400);
  corinthianFish.render(mockCtx, 0);

  // 3. Sunken Atlantis Giant Kraken and Sea Serpents: attack player
  const krakenEnemy = HAZARD_TYPES.find(h => h.zone === 4 && h.marineKind === 'monster' && h.name.includes('Kraken'));
  assert.ok(krakenEnemy, 'Atlantis giant kraken enemy exists');
  assert.equal(krakenEnemy.attack, 'dash', 'Kraken enemy attacks hook with dash');
  assert.ok(krakenEnemy.isColossal, 'Kraken enemy is colossal');

  const serpentEnemy = HAZARD_TYPES.find(h => h.zone === 4 && h.monsterForm === 'serpent');
  assert.ok(serpentEnemy, 'Atlantis giant sea serpent enemy exists');
  assert.equal(serpentEnemy.attack, 'dash', 'Serpent enemy attacks hook with dash');
  assert.ok(serpentEnemy.isColossal, 'Serpent enemy is colossal');

  // 4. Astral Shimmerfall Deep Sirens: spawn deep and attack hook
  const sirenEnemy = HAZARD_TYPES.find(h => h.zone === 3 && (h.marineKind === 'siren' || h.monsterForm === 'siren'));
  assert.ok(sirenEnemy, 'Astral Shimmerfall siren enemy exists');
  assert.ok(sirenEnemy.minDepth >= 800, 'Sirens spawn very deep in Astral Shimmerfall');
  assert.equal(sirenEnemy.attack, 'dash', 'Sirens attack hook');

  // 5. Magma Caldera Giant Magma Monster & Lava Obstacles
  const magmaMonster = HAZARD_TYPES.find(h => h.zone === 6 && h.marineKind === 'monster');
  assert.ok(magmaMonster, 'Magma Caldera giant magma monster exists');
  assert.equal(magmaMonster.attack, 'dash', 'Magma monster attacks hook with dash');
  assert.ok(magmaMonster.isColossal, 'Magma monster is colossal');

  const lavaHazards = REALM_HAZARDS.filter(h => h.zone === 6 && h.realmStyle === 'lava');
  assert.equal(lavaHazards.length, 4, 'All 4 lava hazards in Caldera Trench');
  lavaHazards.forEach(h => {
    const hazardObj = new Hazard(h, 200, 300);
    hazardObj.render(mockCtx, 0);
  });
});

test('Magma Caldera visuals, Fire Opal Cluster, probe redesign, and aquarium tip capacity scaling', async () => {
  const { EXPEDITION_HAZARDS } = await import('../src/data/ExpeditionHazards.js');
  const { Treasure } = await import('../src/entities/Treasure.js');
  const { SaveSystem } = await import('../src/systems/SaveSystem.js');
  const { drawNaturalHazard } = await import('../src/entities/NaturalHazardArt.js');
  const { drawAquariumDecor } = await import('../src/data/CustomizationData.js');

  // 1. Falling stalactites (orange & black triangles) must NOT spawn in Sea 6
  const fallingInSea6 = EXPEDITION_HAZARDS.filter(h => h.naturalKind === 'stalactite' && h.seas.includes(6));
  assert.equal(fallingInSea6.length, 0, 'No falling stalactites (orange/black triangles) in Caldera Trench');

  // 2. Automated Probe & Stalactite rendering test
  const mockCtx = new Proxy({}, {
    get: (_, key) => key.includes('Gradient') ? () => ({ addColorStop() {} }) : () => {},
  });
  assert.doesNotThrow(() => drawNaturalHazard(mockCtx, 'probe', 25, 1.5));
  assert.doesNotThrow(() => drawNaturalHazard(mockCtx, 'stalactite', 28, 1.5));

  // 3. Fire Opal Cluster bespoke rendering test
  const fireOpalTreasure = new Treasure({ name: 'Fire Opal Cluster', realmStyle: 'lava', rarity: 'rare', color: '#fb923c', glow: '#ef4444' }, 150, 250);
  assert.doesNotThrow(() => fireOpalTreasure.render(mockCtx, 0));

  // 4. Aquarium decor rendering test (kelp, coral, ruins, crystals)
  ['kelp', 'coral', 'ruins', 'crystals'].forEach(decor => {
    assert.doesNotThrow(() => drawAquariumDecor(mockCtx, 760, 380, { decoration: decor }, 2.0));
  });

  // 5. Aquarium tip capacity scaling with highest unlocked realm
  const save = new SaveSystem();
  save.data.aquarium = { isUnlocked: true, bankedVisitorTips: 0 };
  save.data.upgrades.personalAquarium = 1;

  // With only Sea 1 unlocked:
  save.data.unlockedSeas = [1];
  const capSea1 = save.getVisitorTipCapacity();
  assert.equal(capSea1, 750, 'Sea 1 capacity is base 750');

  // With Sea 6 unlocked:
  save.data.unlockedSeas = [1, 2, 3, 4, 5, 6];
  const capSea6 = save.getVisitorTipCapacity();
  assert.ok(capSea6 > capSea1, 'Tip capacity increases with higher unlocked realms');
  assert.equal(capSea6, Math.round(1 * 750 * (1 + (6 - 1) * 0.5)), 'Sea 6 prestige multiplier applied');
});



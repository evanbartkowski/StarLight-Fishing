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

function advancedSave() {
  const save = new SaveSystem();
  save.data.level = 50;
  save.data.coins = 100000000;
  save.data.unlockedSeas = FANTASY_SEAS.map(sea => sea.id);
  for (const [key, definition] of Object.entries(UPGRADE_DEFINITIONS)) save.data.upgrades[key] = definition.tiers.length - 1;
  return save;
}

test('every realm has 35 real native fish, distinct content, and complete journal coverage', () => {
  const all = [...FISH_SPECIES, ...LEGENDARY_SPECIES];
  assert.equal(new Set(all.map(f => f.id)).size, all.length);
  assert.equal(FISH_SPECIES.length, 245);
  for (const sea of FANTASY_SEAS) {
    const natives = FISH_SPECIES.filter(f => f.zone === sea.id);
    assert.equal(natives.length, 35);
    assert.ok(new Set(natives.map(f => f.shape)).size >= 6);
    assert.ok(new Set(natives.map(f => f.movementType).filter(Boolean)).size >= 4);
    assert.equal(REALM_HAZARDS.filter(h => h.zone === sea.id).length, 4);
    assert.equal(REALM_TREASURES.filter(t => t.zone === sea.id).length, 7);
    assert.equal(REALM_RELICS.filter(r => r.zone === sea.id).length, 2);
    const ids = all.filter(f => f.zone === sea.id).map(f => f.id);
    assert.ok(ids.length >= 30 && ids.length <= 40);
    assert.deepEqual(ZONE_ALMANAC_DATA[`sea_${sea.id}`].speciesIds, ids);
    const save = new SaveSystem();
    ids.forEach(id => { save.data.journal[id] = { count: 1 }; });
    assert.equal(getZoneProgress(`sea_${sea.id}`, save).percent, 100);
    assert.ok(FISH_SPECIES.filter(f => f.zone !== sea.id && belongsToRealm(f, sea.id)).length <= 1);
  }
  assert.ok(LEGACY_SALVAGE_SPECIES.every(s => !FISH_SPECIES.some(f => f.id === s.id)));
});

test('charter prices and common rewards rise together; gates charge the authoritative price', () => {
  assert.deepEqual(FANTASY_SEAS.map(s => s.gates.unlockFee), [0,3000,17500,35000,70000,140000,1000000]);
  for (let i = 1; i < FANTASY_SEAS.length; i++) {
    const sea = FANTASY_SEAS[i], previous = FANTASY_SEAS[i-1];
    assert.equal(sea.gates.unlockFee, REALM_PROFILES[sea.id].fee);
    const meanValue = zone => FISH_SPECIES.filter(f => f.zone === zone).reduce((sum, f) => sum + f.baseValue, 0) / 35;
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
        for (const hazard of world.entities.hazards) assert.ok(belongsToRealm(HAZARD_TYPES.find(h => h.id === hazard.type), sea.id));
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
  for (const hazard of REALM_HAZARDS) new Hazard(hazard, 300, 500).render(ctx, 0);
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
  save.data.coins = 101;
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

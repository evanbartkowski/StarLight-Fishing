import test from 'node:test';
import assert from 'node:assert/strict';
import { rollCatchTraits, displaySpeciesName, depthRewardMultiplier } from '../src/systems/CatchTraits.js';
import { getCrateDropPreview, rollCrateLoot } from '../src/data/CrateData.js';
import { FANTASY_SEAS, getDepthSubZone } from '../src/entities/SeasData.js';
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
const { SaveSystem } = await import('../src/systems/SaveSystem.js');

test('realm depth regions are distinct, widely spaced and contain their habitat specialists', async () => {
  const { getRealmDepthZones, getRealmDepthZone, depthWaterColor } = await import('../src/data/RealmDepths.js');
  const { FISH_SPECIES } = await import('../src/data/FishData.js');
  const boundaries = new Set();
  for (let realm = 1; realm <= 7; realm++) {
    const zones = getRealmDepthZones(realm);
    boundaries.add(zones[1].minDepth);
    for (const zone of zones) {
      assert.ok(zone.maxDepth - zone.minDepth >= 180);
      assert.equal(getRealmDepthZone(zone.minDepth, realm).id, zone.id);
      assert.ok(FISH_SPECIES.some(fish => fish.zone === realm && fish.habitatZone === zone.id));
    }
    assert.notEqual(depthWaterColor(5, realm), depthWaterColor(2800, realm));
  }
  assert.equal(boundaries.size, 7);
});

test('global events last five minutes every thirty-five minutes and share server offset', async () => {
  const { WorldCycle, EVENT_CYCLE_INTERVAL, EVENT_CYCLE_DURATION } = await import('../src/systems/WorldCycle.js');
  const a = new WorldCycle(), b = new WorldCycle();
  const start = EVENT_CYCLE_INTERVAL * 100;
  assert.equal(a.getGlobalEvent(start).active, true);
  assert.equal(a.getGlobalEvent(start + EVENT_CYCLE_DURATION - 1).active, true);
  assert.equal(a.getGlobalEvent(start + EVENT_CYCLE_DURATION).active, false);
  assert.equal(a.getGlobalEvent(start + EVENT_CYCLE_INTERVAL).active, true);
  assert.notEqual(a.getGlobalEvent(start).id, a.getGlobalEvent(start + EVENT_CYCLE_INTERVAL).id);
  a.serverOffset = b.serverOffset = start - Date.now();
  assert.equal(a.getGlobalEvent().id, b.getGlobalEvent().id);
  assert.ok(a.getApexSpawnMultiplier() > 1);
  assert.ok(a.getCrateDropMultiplier() > 1);
});

test('sealed crates survive save reload and bulk selling', () => {
  const save = new SaveSystem();
  const crate = save.addItemToInventory({ id: 'crate_wood', name: 'Sealed case', isCrate: true, crateRank: 1, value: 0 });
  save.addItemToInventory({ id: 'fish', name: 'Fish', value: 10 });
  assert.equal(save.sellAllItems().count, 1);
  const restored = new SaveSystem(); restored.load();
  assert.ok(restored.getInventory().some(item => item.instanceId === crate.instanceId && !item.unboxed));
});

test('crate item odds sum to 100 and tenth pull guarantees Epic or better', () => {
  for (let rank = 1; rank <= 5; rank++) {
    for (const count of [0, 8, 9]) {
      const save = new SaveSystem(); save.data.cratePityCount = count;
      const preview = getCrateDropPreview(rank, save);
      const all = Object.values(preview.tables).flat();
      assert.ok(Math.abs(all.reduce((sum, item) => sum + item.chance, 0) - 100) < 1e-9);
      assert.equal(all.find(item => item.id === 'divine_starlight').chance, .1);
      if (count === 9) {
        assert.equal(preview.rates.superGood, 100);
        assert.equal(rollCrateLoot(rank, save).grade, 'super_good');
        assert.equal(save.data.cratePityCount, 0);
        save.load(); assert.equal(save.data.cratePityCount, 0);
      }
    }
  }
});

test('trait boundaries, readable names and depth rewards are deterministic', () => {
  for (const [roll, name, multiplier] of [[0, 'Tiny', .5], [.15, 'Regular', 1], [.85, 'Giant', 1.5], [.98, 'Colossal', 2]]) {
    const values = [roll, .5]; const traits = rollCatchTraits(() => values.shift());
    assert.equal(traits.weightClass, name); assert.equal(traits.weightMultiplier, multiplier);
  }
  for (const [roll, mutation] of [[0, 'Gold'], [.005, 'Bioluminescent'], [.015, 'Albino'], [.03, null]]) {
    const values = [.5, roll]; assert.equal(rollCatchTraits(() => values.shift()).mutation, mutation);
  }
  assert.equal(displaySpeciesName('sea1_angler_fish'), 'Angler Fish');
  assert.equal(displaySpeciesName('realm_7_void_ray'), 'Void Ray');
  assert.equal(depthRewardMultiplier(-50), 1);
  assert.ok(depthRewardMultiplier(1800) > depthRewardMultiplier(900) * 2);
});

test('depth thresholds use realm depth and gates span levels 10 through 50', () => {
  assert.deepEqual(FANTASY_SEAS.map(sea => sea.gates.reqLevel), [10, 17, 23, 30, 37, 43, 50]);
  assert.equal(getDepthSubZone(149, 1000).id, 'sunlit');
  assert.equal(getDepthSubZone(150, 1000).id, 'twilight');
  assert.equal(getDepthSubZone(400, 1000).id, 'midnight');
  assert.equal(getDepthSubZone(720, 1000).id, 'hadal');
});

test('local reward transactions commit once and roll back on failure', () => {
  const save = new SaveSystem(); save.data.coins = 12; save.save();
  assert.throws(() => save.mutateAtomically(() => { save.adjustCoins(100); throw new Error('interrupted'); }));
  assert.equal(save.data.coins, 12); save.load(); assert.equal(save.data.coins, 12);
  save.mutateAtomically(() => { save.adjustCoins(20); save.data.cratePityCount = 8; save.save(); });
  save.load(); assert.equal(save.data.coins, 32); assert.equal(save.data.cratePityCount, 8);
  save.gemShop = { getBalance: () => 100, balance: 100 }; save.data.gems = 1;
  assert.equal(save.spendGems(5), false, 'local spending cannot fake a debit of purchased Gems');
  assert.equal(save.gemShop.balance, 100);
});

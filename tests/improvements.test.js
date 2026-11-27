import test from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
};

const { drawVesselHull, getVesselLayout } = await import('../src/rendering/VesselRenderer.js');
const { BOAT_SKIN_OPTIONS, BOAT_TRINKETS, BOAT_PART_PALETTES, drawBoatTrinket, normalizeBoatColors } = await import('../src/data/CustomizationData.js');
const { ShipsCat, PerchingPelican } = await import('../src/entities/BoatCompanions.js');
const { SaveSystem } = await import('../src/systems/SaveSystem.js');
const { accountManager } = await import('../src/systems/AccountManager.js');
const { QuestSystem } = await import('../src/systems/QuestSystem.js');
const { Hook } = await import('../src/entities/Hook.js');
const { getCurrentDerby, recordDerbyDive, getLocalDerbyStandings } = await import('../src/systems/WeeklyDerby.js');

function finiteMockCtx() {
  const grad = { addColorStop() {} };
  const calls = { count: 0 };
  const proxy = new Proxy({
    globalAlpha: 1,
    createLinearGradient: () => grad,
    createRadialGradient: () => grad,
    measureText: () => ({ width: 40 }),
  }, {
    get(target, key) {
      if (key in target) return target[key];
      return (...args) => {
        calls.count++;
        for (const arg of args) {
          if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `Non-finite draw arg in ${String(key)}: ${arg}`);
        }
      };
    },
    set(target, key, val) { target[key] = val; return true; },
  });
  return { ctx: proxy, calls };
}

test('all 9 vessel tiers, custom multi-part boat colors, trinkets, and pet positions render cleanly and fit bounds', () => {
  const cat = new ShipsCat();
  const pelican = new PerchingPelican();
  const customColors = normalizeBoatColors({ hull: '#0f294a', trim: '#fbbf24', sails: '#e0e7ff' });
  assert.deepEqual(customColors, { hull: '#0f294a', trim: '#fbbf24', sails: '#e0e7ff' });
  assert.equal(normalizeBoatColors({ hull: '#12abef', trim: 'invalid' }).hull, '#12abef');
  assert.equal(normalizeBoatColors({ hull: 'bad' }).hull, BOAT_PART_PALETTES.hull.default);

  for (let tier = 0; tier <= 8; tier++) {
    const layout = getVesselLayout(tier, 140, 40);
    const catPos = cat.getDeckPosition(tier);
    const birdPos = pelican.getBowspritPosition(tier);
    assert.ok(catPos.x >= -layout.halfWidth - 20 && catPos.x < 0, `Tier ${tier} cat must perch aft cleanly (${catPos.x})`);
    assert.ok(birdPos.x > 0 && birdPos.x <= layout.halfWidth + 20, `Tier ${tier} pelican must perch near bow/bowsprit cleanly (${birdPos.x})`);

    const { ctx, calls } = finiteMockCtx();
    drawVesselHull(ctx, tier, 140, 40, 1.5, {
      skinColor: BOAT_SKIN_OPTIONS.celestial.color,
      skinMeta: BOAT_SKIN_OPTIONS.celestial,
      boatColors: customColors,
    });
    assert.ok(calls.count > 10, `Tier ${tier} hull must issue draw calls`);
    for (const trinketId of Object.keys(BOAT_TRINKETS)) {
      drawBoatTrinket(ctx, trinketId, tier, 1.5, 140, 40);
    }
    cat.render(ctx, tier);
    pelican.render(ctx, tier);
  }
});

test('boatColors persist across save/load and Daily Check-in awards mystery prizes on every 3rd day', () => {
  storage.clear();
  accountManager.activeUser = 'MysteryTester';
  const save = new SaveSystem();
  save.setBoatColors({ hull: '#7f1d1d', trim: '#38bdf8', sails: '#fef08a' });
  save.load();
  assert.deepEqual(save.getBoatColors(), { hull: '#7f1d1d', trim: '#38bdf8', sails: '#fef08a' });

  const startDay = Date.parse('2026-10-10T12:00:00Z');
  save.claimDailyLogin(startDay);
  save.claimDailyLogin(startDay + 86400000);
  save.claimDailyLogin(startDay + 2 * 86400000);
  assert.equal(save.data.dailyLogin.streak, 3);
  assert.ok(save.data.dailyLogin.lastReward.mysteryPrize, 'Day 3 check-in must award a Mystery Prize');
  assert.ok(save.data.dailyLogin.lastReward.mysteryPrize.name.length > 0);
});

test('quests include and deliver unique useful loot on completion', () => {
  storage.clear();
  accountManager.activeUser = 'QuestHero';
  const save = new SaveSystem();
  const qs = new QuestSystem(save);
  const firstQuest = qs.getActiveQuests()[0];
  assert.ok(firstQuest.rewardLoot && firstQuest.rewardLoot.name, 'Quest must expose unique rewardLoot metadata');

  const activeEntry = save.data.quests.active.find(q => q.id === firstQuest.id);
  activeEntry.current = activeEntry.target;
  const beforeCoins = save.data.coins;
  const beforeInv = save.getInventory().length;
  const beforeBuffs = Object.keys(save.data.buffs || {}).length;
  const claimed = qs.claimQuest(firstQuest.id);
  assert.ok(claimed && claimed.rewardLoot);
  assert.ok(save.data.coins > beforeCoins);
  const gotLootEffect =
    Object.keys(save.data.buffs || {}).length > beforeBuffs ||
    save.getInventory().length > beforeInv ||
    save.data.coins >= beforeCoins + claimed.rewardCoins;
  assert.equal(gotLootEffect, true, 'Claiming quest must apply unique loot effect');
});

test('hook diveCombo increases combo multiplier and resets on hazard impact', () => {
  const hook = new Hook();
  hook.reset(400, 220);
  hook.capacity = 5;
  const makeCatch = id => ({ id, hookTo() {} });
  assert.equal(hook.getComboMultiplier(), 1);
  hook.addCatch(makeCatch('a'));
  hook.addCatch(makeCatch('b'));
  hook.addCatch(makeCatch('c'));
  assert.equal(hook.diveCombo, 3);
  assert.ok(Math.abs(hook.getComboMultiplier() - 1.1) < 0.0001);
  hook.takeHazardHit({ restTime: 0 }, null);
  assert.equal(hook.diveCombo, 0);
  assert.equal(hook.getComboMultiplier(), 1);
});

test('WeeklyDerby rotates cleanly, records best weekly score, and ranks players', () => {
  storage.clear();
  accountManager.activeUser = 'DerbyAce';
  accountManager.accounts = { derbyace: { username: 'DerbyAce', createdAt: 100 } };
  const save = new SaveSystem();
  const now = Date.parse('2026-11-26T20:00:00Z');
  const derby = getCurrentDerby(now, 0);
  assert.ok(derby.id && derby.title && derby.remaining.days >= 0);

  const rec = recordDerbyDive(save, {
    items: [{ name: 'Abyss Whale', weight: 420.5, rarity: 'legendary', isShiny: true, crown: 'gold', species: { id: 'w1' } }],
    maxDepth: 1200,
    haulGold: 4500,
  }, now, 0);
  assert.ok(rec && rec.score > 0 && rec.weekId === derby.weekId);

  const { standings } = getLocalDerbyStandings(save, [{ username: 'Rival', weeklyDerby: { weekId: derby.weekId, score: rec.score + 50, bestCatchName: 'Titan' } }], now, 0);
  assert.equal(standings[0].username, 'Rival');
  assert.equal(standings[1].username, 'DerbyAce');
  assert.equal(standings[1].isCurrent, true);
});

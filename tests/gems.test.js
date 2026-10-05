import test from 'node:test';
import assert from 'node:assert/strict';
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
const { accountManager } = await import('../src/systems/AccountManager.js');
const { SaveSystem } = await import('../src/systems/SaveSystem.js');
const { rollCrateLoot } = await import('../src/data/CrateData.js');
const { achievementGems, DAILY_GEMS } = await import('../src/data/GemEconomy.js');
const { ACHIEVEMENTS } = await import('../src/data/AchievementsData.js');
function fresh() { storage.clear(); accountManager.activeUser = 'GemCaptain'; return new SaveSystem(); }

test('weekly and monthly check-ins queue sealed crates until space is available', () => {
  const save = fresh(), day = 20000;
  save.data.dailyLogin = { lastDay: day - 1, streak: 29 };
  for (let i = 0; i < save.getInventoryCapacity(); i++) save.addItemToInventory({ id: `fish${i}`, value: 1 });
  assert.equal(save.claimDailyLogin(day * 86400000), 100);
  assert.equal(save.data.dailyLogin.lastReward.xp, 5000);
  assert.deepEqual(save.data.dailyLogin.pendingCrates, [3, 3, 4, 4, 5]);
  save.load();
  assert.equal(save.claimDailyLogin(day * 86400000), 0);
  save.removeItemFromInventory(save.data.inventory[0].instanceId);
  assert.equal(save.collectDailyCrates(), 1);
  assert.deepEqual(save.data.dailyLogin.pendingCrates, [3, 4, 4, 5]);
  assert.equal(save.collectDailyCrates(), 0);
  save.load(); assert.deepEqual(save.data.dailyLogin.pendingCrates, [3, 4, 4, 5]);
});

test('guests can buy a sealed crate with earned Gems and cannot overspend', async () => {
  const { premiumPurchase } = await import('../src/systems/PremiumPurchases.js');
  const { CRATE_GEM_PRICES } = await import('../src/data/CrateData.js');
  const save = fresh(); accountManager.activeUser = null; save.data.gems = CRATE_GEM_PRICES[1];
  const ui = { saveSystem: save, showToast() {} };
  assert.equal(await premiumPurchase(ui, { kind: 'crate', rank: 1 }), true);
  assert.equal(save.data.gems, 0);
  assert.equal(save.data.inventory.filter(item => item.isCrate && !item.unboxed).length, 1);
  assert.equal(await premiumPurchase(ui, { kind: 'crate', rank: 1 }), false);
  assert.equal(save.data.inventory.length, 1);
});

test('daily login is once per UTC day, survives reload, and increases across thirty days and resets after day thirty', () => {
  const save = fresh();
  const start = Date.parse('2026-10-01T23:59:00Z');
  assert.equal(save.claimDailyLogin(start), DAILY_GEMS[0]);
  assert.equal(save.claimDailyLogin(start + 30000), 0);
  save.load();
  assert.equal(save.claimDailyLogin(start), 0);
  const nextDay = Date.parse('2026-10-02T00:00:00Z');
  for (let day = 2; day <= 30; day++) {
    assert.equal(save.claimDailyLogin(nextDay + (day - 2) * 86400000), DAILY_GEMS[day - 1]);
  }
  assert.ok(save.data.gems >= DAILY_GEMS.reduce((sum, value) => sum + value, 0));
  assert.equal(save.claimDailyLogin(start), 0, 'clock rollback must not reclaim older days');
  assert.equal(save.claimDailyLogin(nextDay + 29 * 86400000), DAILY_GEMS[0]);
  assert.equal(save.data.dailyLogin.streak, 1);
  assert.equal(save.claimDailyLogin(nextDay + 32 * 86400000), DAILY_GEMS[0]);
  assert.equal(save.data.dailyLogin.streak, 1, 'missed days restart the streak');
});

test('daily rewards require a signed-in captain and stay isolated per save', () => {
  const save = fresh();
  accountManager.activeUser = null;
  assert.equal(save.claimDailyLogin(), 0);
  accountManager.activeUser = 'GemCaptain';
  assert.equal(save.claimDailyLogin(), DAILY_GEMS[0]);
  save.switchToAccount('SecondCaptain');
  assert.equal(save.data.gems, 0);
  assert.equal(save.claimDailyLogin(), DAILY_GEMS[0]);
  save.switchToAccount('GemCaptain');
  assert.equal(save.data.gems, DAILY_GEMS[0]);
  assert.equal(save.claimDailyLogin(), 0);
});

test('ordinary check-ins can award bonus XP and a sealed crate', () => {
  const save = fresh();
  const random = Math.random;
  const rolls = [0.01, 0.01];
  Math.random = () => rolls.shift() ?? 0.99;
  try {
    save.claimDailyLogin(Date.parse('2026-10-01T12:00:00Z'));
    assert.equal(save.data.dailyLogin.lastReward.xp, 200);
    assert.deepEqual(save.data.dailyLogin.lastReward.crates, [1]);
    const earnedXp = save.data.xp + Array.from({ length: save.data.level }, (_, level) => save.getXpRequired(level)).reduce((sum, required) => sum + required, 0);
    assert.equal(earnedXp, 200);
    assert.equal(save.data.inventory.filter(item => item.isCrate).length, 1);
  } finally { Math.random = random; }
});

test('achievement gems are awarded once and legacy earned rewards migrate only once', () => {
  const save = fresh();
  save.data.stats.totalFishCaught = 1;
  save.checkAchievements();
  const gems = save.data.gems;
  assert.ok(gems > 0);
  save.checkAchievements();
  assert.equal(save.data.gems, gems);
  const legacy = save.getDefaultData();
  delete legacy.gemEconomyVersion;
  delete legacy.gems;
  legacy.achievements.first_catch = { unlocked: true };
  legacy.appearance.coat = '#0d9488';
  storage.set(save.getActiveStorageKey(), JSON.stringify(legacy));
  save.load();
  const expected = achievementGems(ACHIEVEMENTS.find(a => a.id === 'first_catch'));
  assert.equal(save.data.gems, expected);
  save.load();
  assert.equal(save.data.gems, expected);
  assert.equal(save.getAppearanceCost({ ...save.data.appearance, coat: '#0d9488' }), 0);
});

test('cosmetics spend gems once, never gold, and unaffordable purchases are atomic', () => {
  const save = fresh();
  save.data.coins = 100000;
  save.setUpgradeLevel('personalAquarium', 1);
  const look = { ...save.data.appearance, coat: '#0d9488', hat: 'cap' };
  assert.equal(save.purchaseAppearance(look), false);
  assert.equal(save.data.appearance.coat, '#eab308');
  save.data.gems = 10;
  assert.equal(save.purchaseAppearance(look), true);
  assert.equal(save.data.gems, 4);
  assert.equal(save.setAquariumDecoration('substrate', 'pebbles'), true);
  assert.equal(save.data.gems, 2);
  assert.equal(save.setAquariumDecoration('substrate', 'pearl'), false);
  assert.equal(save.data.aquarium.decor.substrate, 'pebbles');
  assert.equal(save.data.gems, 2);
  assert.equal(save.data.coins, 100000);
  save.save(); save.load();
  assert.equal(save.purchaseAppearance(save.getDefaultData().appearance), true);
  assert.equal(save.purchaseAppearance(look), true);
  assert.equal(save.setAquariumDecoration('substrate', 'sand'), true);
  assert.equal(save.setAquariumDecoration('substrate', 'pebbles'), true);
  assert.equal(save.data.gems, 2);
});

test('crate gems are rare single-gem finds and normal gold does not create gems', () => {
  const save = fresh();
  save.adjustCoins(10000);
  assert.equal(save.data.gems, 0);
  const random = Math.random;
  let seed = 5444, gems = 0;
  Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  try {
    for (let i = 0; i < 5000; i++) {
      const reward = rollCrateLoot(1 + i % 5).gems;
      assert.ok(reward === 0 || reward === 1);
      gems += reward;
    }
    assert.ok(gems > 50 && gems < 150, `expected roughly 2%, got ${gems / 50}%`);
  } finally { Math.random = random; }
});

test('fossil completion grants gems once and museum exhibits survive reload', () => {
  const save = fresh();
  for (let i = 0; i < 4; i++) save.awardSkeletonPiece('megalodonJaw');
  assert.equal(save.data.gems, 3);
  save.awardSkeletonPiece('megalodonJaw');
  save.checkAchievements();
  assert.equal(save.data.gems, 3);
  assert.equal(save.toggleMuseumDisplay('megalodonJaw'), true);
  assert.equal(save.toggleMuseumDisplay('plesiosaur'), false);
  save.load();
  assert.ok(save.data.museumDisplays.includes('megalodonJaw'));
  assert.equal(save.toggleMuseumDisplay('megalodonJaw'), true);
  assert.equal(save.data.museumDisplays.length, 0);
});

test('upgrades using gems cost the exact displayed price and debit accurately for guests and cloud', async () => {
  const { UPGRADE_DEFINITIONS: clientUpgrades } = await import('../src/data/UpgradesData.js');
  const { UPGRADE_DEFINITIONS: serverUpgrades } = await import('../functions/shared/UpgradesData.js');
  const { premiumPurchase } = await import('../src/systems/PremiumPurchases.js');

  // Verify client and server definitions have matching tier costs across all upgrades
  for (const [key, clientDef] of Object.entries(clientUpgrades)) {
    const serverDef = serverUpgrades[key];
    assert.ok(serverDef, `server must have upgrade definition for ${key}`);
    assert.equal(clientDef.tiers.length, serverDef.tiers.length, `${key} must have matching tier count`);
    for (let t = 0; t < clientDef.tiers.length; t++) {
      assert.equal(clientDef.tiers[t].cost, serverDef.tiers[t].cost, `${key} tier ${t} cost must match`);
    }
  }

  // Test guest upgrade purchase with exact gem cost
  const save = fresh();
  accountManager.activeUser = null; // guest mode
  save.data.level = 10;
  const nextTier = clientUpgrades.lineLength.tiers[1];
  const expectedGems = Math.max(1, Math.ceil(nextTier.cost / 600));
  save.data.gems = expectedGems + 5;

  const ui = { saveSystem: save, showToast() {}, onUpgradePurchased() {} };
  const success = await premiumPurchase(ui, { kind: 'upgrade', key: 'lineLength', cost: expectedGems });
  assert.equal(success, true);
  assert.equal(save.getUpgradeLevel('lineLength'), 1);
  assert.equal(save.data.gems, 5); // debited exactly expectedGems, not a single gem more
});


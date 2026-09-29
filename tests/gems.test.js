import test from 'node:test';
import assert from 'node:assert/strict';
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
const { accountManager } = await import('../src/systems/AccountManager.js');
const { SaveSystem } = await import('../src/systems/SaveSystem.js');
const { rollCrateLoot } = await import('../src/data/CrateData.js');
const { achievementGems } = await import('../src/data/GemEconomy.js');
const { ACHIEVEMENTS } = await import('../src/data/AchievementsData.js');
function fresh() { storage.clear(); accountManager.activeUser = 'GemCaptain'; return new SaveSystem(); }

test('daily login is once per UTC day, survives reload, and increases across thirty days and resets after day thirty', () => {
  const save = fresh();
  const start = Date.parse('2026-10-01T23:59:00Z');
  assert.equal(save.claimDailyLogin(start), 1);
  assert.equal(save.claimDailyLogin(start + 30000), 0);
  save.load();
  assert.equal(save.claimDailyLogin(start), 0);
  const nextDay = Date.parse('2026-10-02T00:00:00Z');
  for (let day = 2; day <= 30; day++) {
    assert.equal(save.claimDailyLogin(nextDay + (day - 2) * 86400000), day === 30 ? 5 : 1 + Math.floor((day - 1) / 10));
  }
  assert.equal(save.data.gems, 62);
  assert.equal(save.claimDailyLogin(start), 0, 'clock rollback must not reclaim older days');
  assert.equal(save.claimDailyLogin(nextDay + 29 * 86400000), 1);
  assert.equal(save.data.dailyLogin.streak, 1);
  assert.equal(save.claimDailyLogin(nextDay + 32 * 86400000), 1);
  assert.equal(save.data.dailyLogin.streak, 1, 'missed days restart the streak');
});

test('daily rewards require a signed-in captain and stay isolated per save', () => {
  const save = fresh();
  accountManager.activeUser = null;
  assert.equal(save.claimDailyLogin(), 0);
  accountManager.activeUser = 'GemCaptain';
  assert.equal(save.claimDailyLogin(), 1);
  save.switchToAccount('SecondCaptain');
  assert.equal(save.data.gems, 0);
  assert.equal(save.claimDailyLogin(), 1);
  save.switchToAccount('GemCaptain');
  assert.equal(save.data.gems, 1);
  assert.equal(save.claimDailyLogin(), 0);
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

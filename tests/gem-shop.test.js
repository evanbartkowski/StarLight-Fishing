import test from 'node:test';
import assert from 'node:assert/strict';
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
const { accountManager } = await import('../src/systems/AccountManager.js');
const { SaveSystem } = await import('../src/systems/SaveSystem.js');
const { GemShop } = await import('../src/ui/GemShop.js');
function fixture() {
  storage.clear();
  accountManager.activeUser = 'Buyer';
  accountManager.accounts = { buyer: { cloudUid: 'uid-buyer' }, other: { cloudUid: 'uid-other' } };
  const save = new SaveSystem();
  const shop = Object.assign(Object.create(GemShop.prototype), { save, ui: { showToast() {} }, balance: 0, ready: false });
  save.gemShop = shop;
  return { save, shop };
}

test('wallet updates affect only the matching loaded captain and clear on sign-out', () => {
  const { save, shop } = fixture();
  save.data.gems = 2;
  shop.receive({ uid: 'uid-buyer', gems: 10, ready: true, cosmetics: ['angler:coat:#0d9488'] });
  assert.equal(save.getGemBalance(), 12);
  assert.ok(save.data.ownedAppearance.includes('coat:#0d9488'));
  shop.receive({ uid: 'uid-other', gems: 100, ready: true, cosmetics: ['angler:hat:cap'] });
  assert.equal(save.getGemBalance(), 2);
  assert.ok(!save.data.ownedAppearance.includes('hat:cap'));
  save.switchToAccount('Other');
  assert.equal(shop.getBalance(), 100);
  assert.ok(save.data.ownedAppearance.includes('hat:cap'), 'a wallet that arrived before the account loaded must restore ownership afterward');
  shop.receive(null);
  assert.equal(shop.getBalance(), 0);
});

test('style purchases combine earned and purchased gems once, then owned styles are free', async () => {
  const { save, shop } = fixture();
  save.data.gems = 1;
  shop.receive({ uid: 'uid-buyer', gems: 10, ready: true });
  let requests = 0;
  shop.backend = Promise.resolve({ spendWallet: async (uid, items, earnedGems) => {
    requests++;
    assert.equal(uid, 'uid-buyer'); assert.equal(earnedGems, 1);
    assert.equal(items.reduce((sum, item) => sum + item.cost, 0), 3);
    return { earnedSpent: 1, gems: 8, cosmetics: items.map(item => item.id) };
  } });
  const look = { ...save.data.appearance, coat: '#0d9488' };
  assert.equal(await shop.purchase('angler', look, () => save.purchaseAppearance(look)), true);
  assert.equal(save.data.gems, 0);
  assert.equal(save.getGemBalance(), 8);
  assert.equal(save.data.appearance.coat, look.coat);
  assert.equal(await shop.purchase('angler', look, () => save.purchaseAppearance(look)), true);
  assert.equal(requests, 1);
});

test('failed wallet transactions leave earned gems and appearance intact', async () => {
  const { save, shop } = fixture();
  save.data.gems = 1;
  shop.receive({ uid: 'uid-buyer', gems: 10, ready: true });
  shop.backend = Promise.resolve({ spendWallet: async () => { throw new Error('Offline'); } });
  const before = { ...save.data.appearance };
  const look = { ...before, coat: '#0d9488' };
  assert.equal(await shop.purchase('angler', look, () => save.purchaseAppearance(look)), false);
  assert.deepEqual(save.data.appearance, before);
  assert.equal(save.data.gems, 1);
});

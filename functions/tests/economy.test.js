import test from 'node:test';
import assert from 'node:assert/strict';
import { tipAquarium, publicAquarium } from '../aquarium.js';
import { purchasePremium } from '../premium.js';
import { GEM_PACKAGES } from '../checkout.js';

const fv = { increment: value => ({ increment: value }), serverTimestamp: () => 1 };
function database() {
  const state = { coins: 10, gems: 1, level: 50, upgrades: { tackleBox: 0 }, inventory: [], aquarium: {}, traps: {} };
  const records = new Map([['captainSaves/visitor', { snapshot: JSON.stringify(state), revision: 1 }], ['aquariums/host', { username: 'Host' }], ['players/visitor', { gems: 20 }]]);
  let queue = Promise.resolve();
  return { records, doc: path => path, runTransaction(callback) {
    const operation = queue.then(async () => {
      const draft = structuredClone(records);
      const put = (path, data) => {
        const next = { ...draft.get(path) };
        for (const [key, value] of Object.entries(data)) next[key] = value?.increment !== undefined ? (next[key] || 0) + value.increment : value;
        draft.set(path, next);
      };
      const result = await callback({ get: async path => ({ exists: draft.has(path), data: () => draft.get(path) }), set: put, update: put, create(path, data) { assert.ok(!draft.has(path)); put(path, data); } });
      records.clear(); for (const entry of draft) records.set(...entry);
      return result;
    });
    queue = operation.catch(() => {}); return operation;
  } };
}

test('concurrent aquarium tips enforce three per UTC day with retry-safe credits', async () => {
  const db = database(), now = Date.UTC(2026, 9, 3, 23, 59);
  const results = await Promise.allSettled(Array.from({ length: 8 }, (_, index) => tipAquarium(db, 'visitor', 'host', `request-${index}`, fv, now)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 3);
  assert.equal(db.records.get('players/host').gems, 3);
  assert.equal(JSON.parse(db.records.get('captainSaves/visitor').snapshot).coins, 7);
  assert.equal((await tipAquarium(db, 'visitor', 'host', 'request-0', fv, now)).duplicate, true);
  assert.equal(db.records.get('players/host').gems, 3);
  await tipAquarium(db, 'visitor', 'host', 'request-next', fv, now + 60000);
  assert.equal(db.records.get('players/host').gems, 4);
  await assert.rejects(tipAquarium(db, 'visitor', 'visitor', 'request-self', fv), /invalid-argument/);
});

test('unaffordable or missing aquarium tips roll back every write', async () => {
  const db = database(); const before = structuredClone(db.records);
  await assert.rejects(tipAquarium(db, 'visitor', 'missing', 'request-missing', fv), /not-found/);
  assert.deepEqual(db.records, before);
  db.records.set('captainSaves/visitor', { snapshot: '{"coins":0}', revision: 1 });
  await assert.rejects(tipAquarium(db, 'visitor', 'host', 'request-poor', fv), /failed-precondition/);
  assert.equal(db.records.has('players/host'), false);
});

test('tip retries across UTC midnight never debit or credit twice', async () => {
  const db = database(), midnight = Date.UTC(2026, 9, 4);
  await tipAquarium(db, 'visitor', 'host', 'midnight-tip', fv, midnight - 1);
  const before = structuredClone(db.records);
  const retry = await tipAquarium(db, 'visitor', 'host', 'midnight-tip', fv, midnight + 1);
  assert.equal(retry.duplicate, true);
  assert.equal(retry.remaining, 3);
  assert.deepEqual(db.records, before);
  await assert.rejects(tipAquarium(db, 'visitor', 'different-host', 'midnight-tip', fv, midnight + 1), /invalid-argument/);
  assert.deepEqual(db.records, before);
  await tipAquarium(db, 'visitor', 'host', 'new-day-tip', fv, midnight + 2);
  assert.equal(db.records.get('players/host').gems, 2);
});

test('the three-tip limit is shared across all hosts', async () => {
  const db = database();
  db.records.set('aquariums/second-host', { username: 'Second Host' });
  const now = Date.UTC(2026, 9, 4, 12);
  await tipAquarium(db, 'visitor', 'host', 'first-tip', fv, now);
  await tipAquarium(db, 'visitor', 'second-host', 'second-tip', fv, now);
  await tipAquarium(db, 'visitor', 'host', 'third-tip', fv, now);
  await assert.rejects(tipAquarium(db, 'visitor', 'second-host', 'fourth-tip', fv, now), /resource-exhausted/);
  assert.equal(db.records.get('players/host').gems, 2);
  assert.equal(db.records.get('players/second-host').gems, 1);
});

test('premium crate debits earned then purchased gems and retries deliver only once', async () => {
  const db = database();
  const input = { kind: 'crate', rank: 2, requestId: 'purchase-one', revision: 1 };
  const results = await Promise.all([purchasePremium(db, 'visitor', input, fv), purchasePremium(db, 'visitor', input, fv)]);
  assert.equal(results[0].gems, 16); assert.equal(results[1].gems, 16);
  const state = JSON.parse(results[1].snapshot);
  assert.equal(state.inventory.length, 1); assert.equal(state.gems, 0);
  assert.equal(state.inventory[0].crateRank, 2);
  const before = structuredClone(db.records);
  await assert.rejects(purchasePremium(db, 'visitor', { ...input, requestId: 'other-request' }, fv), /aborted/);
  assert.deepEqual(db.records, before);
  await assert.rejects(purchasePremium(db, 'visitor', { kind: 'crate', rank: 5, requestId: 'poor-request', revision: 2 }, fv), /failed-precondition/);
  assert.deepEqual(db.records, before);
});

test('public exhibits exclude private fields and only include displayed fish', () => {
  const result = publicAquarium({ aquarium: { isUnlocked: true, slottedItemIds: ['fish'] }, gems: 100, inventory: [{ instanceId: 'fish', speciesId: 'ray', type: 'fish', value: 500, private: 'secret' }, { instanceId: 'hidden', type: 'fish' }] }, 'Captain');
  assert.equal(result.items.length, 1); assert.equal(result.items[0].value, undefined); assert.equal(result.gems, undefined);
});

test('gem bundle prices cover all four required USD amounts', () => {
  assert.deepEqual(Object.values(GEM_PACKAGES).map(bundle => bundle.amount), [199, 499, 999, 1999]);
});

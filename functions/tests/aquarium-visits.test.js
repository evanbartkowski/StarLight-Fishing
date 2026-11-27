import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAquariumVisit } from '../aquariumVisits.js';
import { captainEmail, publicAquarium } from '../aquarium.js';

function fixture(records = [], users = []) {
  const entries = new Map(records);
  const snap = path => ({ id: path.split('/').at(-1), exists: entries.has(path), data: () => entries.get(path) });
  const db = {
    doc: path => ({ get: async () => snap(path) }),
    collection: name => ({ where: (field, op, value) => ({ limit: () => ({ get: async () => {
      const docs = [...entries].filter(([path, data]) => path.startsWith(name + '/') && data[field] === value).map(([path]) => snap(path)).slice(0, 1);
      return { empty: !docs.length, docs };
    } }) }) }),
  };
  const find = predicate => { const user = users.find(predicate); if (user) return user; throw Object.assign(new Error('missing'), { code: 'auth/user-not-found' }); };
  return { db, auth: { getUser: async uid => find(user => user.uid === uid), getUserByEmail: async email => find(user => captainEmail(user.displayName) === email) } };
}

test('existing accounts without purchased tanks or cloud saves have real empty exhibits', async () => {
  const { db, auth } = fixture([], [{ uid: 'fresh-uid', displayName: 'Fresh Captain' }]);
  const result = await resolveAquariumVisit(db, auth, 'fresh captain');
  assert.equal(result.targetUid, 'fresh-uid');
  assert.equal(result.exhibit.username, 'Fresh Captain');
  assert.deepEqual(result.exhibit.items, []);
  assert.deepEqual(publicAquarium({ upgrades: { personalAquarium: 0 }, inventory: [{ instanceId: 'private-fish' }] }, 'Captain').items, []);
});

test('stale leaderboard IDs resolve to the registered account and current display', async () => {
  const { db, auth } = fixture([
    ['leaderboard/old-id', { username: 'Captain' }], ['leaderboard/current-uid', { username: 'Captain' }],
    ['captainSaves/current-uid', { snapshot: JSON.stringify({ coins: 99, aquarium: { slottedItemIds: ['fish'] }, inventory: [{ instanceId: 'fish', type: 'fish', name: 'Nautilus', private: 'secret' }, { instanceId: 'hidden' }] }) }],
  ], [{ uid: 'current-uid', displayName: 'Captain' }]);
  const result = await resolveAquariumVisit(db, auth, 'old-id');
  assert.equal(result.targetUid, 'current-uid');
  assert.equal(result.exhibit.items.length, 1);
  assert.equal(result.exhibit.items[0].name, 'Nautilus');
  assert.equal(result.exhibit.items[0].private, undefined); assert.equal(result.exhibit.coins, undefined);
});

test('UIDs, legacy published names and damaged saves can use safe published exhibits', async () => {
  const { db, auth } = fixture([
    ['captainSaves/old-uid', { snapshot: '{bad-json' }],
    ['aquariums/old-uid', { username: 'Old Captain', theme: 'abyss', items: [{ name: 'Old Ray', type: 'fish', value: 100, password: 'private' }] }],
  ]);
  for (const host of ['old-uid', 'Old Captain']) {
    const result = await resolveAquariumVisit(db, auth, host);
    assert.equal(result.targetUid, 'old-uid'); assert.equal(result.exhibit.theme, 'abyss');
    assert.equal(result.exhibit.items[0].name, 'Old Ray'); assert.equal(result.exhibit.items[0].password, undefined);
  }
});

test('unknown captains and malformed hosts do not produce fake aquariums', async () => {
  const { db, auth } = fixture();
  await assert.rejects(resolveAquariumVisit(db, auth, 'Unknown'), /not-found/);
  await assert.rejects(resolveAquariumVisit(db, auth, '../secret'), /invalid-argument/);
  auth.getUser = async () => { throw new Error('Auth is unavailable'); };
  await assert.rejects(resolveAquariumVisit(db, auth, 'Captain'), /Auth is unavailable/);
});

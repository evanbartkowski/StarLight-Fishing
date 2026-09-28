import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null };
const { LeaderboardManager, publicScore } = await import('../src/systems/LeaderboardManager.js');

function fixture() {
  let active = 'Captain';
  const accounts = {
    getCurrentUser: () => active,
    getRegisteredAccounts: () => [
      { username: 'Captain', createdAt: 123, passwordHash: 'private' },
      { username: 'Other', createdAt: 124 },
    ],
  };
  const rows = new Map();
  let writes = 0;
  const backend = {
    publishScore: async (key, score) => { writes++; rows.set(key, score); return key; },
    readScores: async () => [...rows].map(([id, score]) => ({ id, ...score })),
  };
  const manager = new LeaderboardManager(accounts, async () => backend);
  return { manager, backend, rows, get writes() { return writes; }, switchUser: value => { active = value; }, save: { data: { level: 1, xp: 0, coins: 25, stats: {} } } };
}

test('only public, finite ranking fields leave the browser; level one stays level one', () => {
  const score = publicScore({ username: 'Captain', createdAt: 123, passwordHash: 'secret' }, {
    level: 1, xp: NaN, coins: Infinity, inventory: ['private'], stats: { totalFishCaught: -1, maxDepthReached: 12.6 },
  });
  assert.deepEqual(score, { username: 'Captain', createdAt: 123, level: 1, xp: 0, coins: 0, totalFishCaught: 0, totalGoldEarned: 0, maxDepthReached: 12 });
});

test('guests can read shared scores without uploading or creating an identity', async () => {
  const f = fixture();
  f.rows.set('remote', { username: 'Remote', level: 40 });
  f.switchUser(null);
  const board = await f.manager.getBoard(f.save);
  assert.equal(f.writes, 0);
  assert.equal(board.entries[0].username, 'Remote');
  assert.equal(board.entries[0].isCurrent, false);
  assert.equal(board.ownScore, null);
});

test('scores update after progress, unchanged scores do not write again, accounts stay separate', async () => {
  const f = fixture();
  await f.manager.sync(f.save);
  await f.manager.sync(f.save);
  assert.equal(f.writes, 1);
  f.save.data.coins = 80;
  const board = await f.manager.getBoard(f.save);
  assert.equal(f.writes, 2);
  assert.equal(board.entries[0].isCurrent, true);
  f.switchUser('Other');
  f.save.data.coins = 0;
  await f.manager.sync(f.save);
  assert.equal(f.rows.get('captain').coins, 80);
  assert.equal(f.rows.get('other').coins, 0);
});

test('failed writes are retried without hiding readable global scores', async () => {
  const f = fixture();
  const publish = f.backend.publishScore;
  f.backend.publishScore = async () => { throw new Error('offline'); };
  f.rows.set('remote', { username: 'Remote', level: 3 });
  assert.equal((await f.manager.getBoard(f.save)).syncFailed, true);
  f.backend.publishScore = publish;
  const board = await f.manager.getBoard(f.save);
  assert.equal(board.syncFailed, false);
  assert.equal(board.entries.find(row => row.isCurrent).username, 'Captain');
});

test('same-name remote captains are not marked as the current player', async () => {
  const f = fixture();
  f.rows.set('another-browser', { username: 'Captain', level: 30 });
  const board = await f.manager.getBoard(f.save);
  assert.equal(board.entries.filter(row => row.isCurrent).length, 1);
  assert.equal(board.entries.find(row => row.id === 'another-browser').isCurrent, false);
});

test('overlapping updates publish the latest stats without mixing account identities', async () => {
  const f = fixture();
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const publish = f.backend.publishScore;
  let first = true;
  f.backend.publishScore = async (...args) => {
    if (first) { first = false; await pending; }
    return publish(...args);
  };
  const initial = f.manager.sync(f.save);
  f.save.data.coins = 100;
  const latest = f.manager.sync(f.save);
  release();
  await Promise.all([initial, latest]);
  assert.equal(f.rows.get('captain').coins, 100);
  assert.equal(f.writes, 2);
});

import test from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
const { AccountManager } = await import('../src/systems/AccountManager.js');

function fixture(remote = null) {
  storage.clear();
  const manager = new AccountManager();
  const calls = [];
  const cloud = {
    authenticate: async (username, password, create) => {
      calls.push({ username, create: !!create });
      return { uid: 'captain-uid', username: 'Captain', createdAt: 10 };
    },
    readCloudSave: async () => remote,
    writeCloudSave: async (uid, snapshot, revision) => { calls.push({ uid, snapshot, revision }); return revision + 1; },
    logoutCloud: async () => {},
  };
  manager.loadCloud = async () => cloud;
  return { manager, cloud, calls };
}

test('a captain can log in on a second laptop and load private saved progress', async () => {
  const snapshot = JSON.stringify({ level: 20, coins: 1234 });
  const f = fixture({ snapshot, revision: 4 });
  const result = await f.manager.login('CAPTAIN', 'password');
  assert.equal(result.success, true);
  assert.equal(storage.get('ssf_save_user_captain'), snapshot);
  assert.equal(f.manager.cloudSession.revision, 4);
  assert.equal(f.manager.getCurrentUser(), 'Captain');
});

test('legacy migration verifies the original local password before creating an online account', async () => {
  const f = fixture();
  f.manager.accounts.captain = { username: 'Captain', passwordHash: await f.manager.hashPassword('original'), createdAt: 1 };
  storage.set('ssf_save_user_captain', '{"level":12}');
  const original = f.cloud.authenticate;
  f.cloud.authenticate = async (username, password, create) => {
    if (!create) throw Object.assign(new Error('Not registered'), { code: 'auth/invalid-credential' });
    return original(username, password, create);
  };
  assert.equal((await f.manager.login('Captain', 'wrong')).success, false);
  assert.equal(f.calls.length, 0);
  assert.equal((await f.manager.login('Captain', 'original')).success, true);
  assert.equal(f.calls[0].create, true);
  assert.equal(f.calls[1].snapshot, '{"level":12}');
});

test('cloud setup failure never starts a returning remote captain with an empty save', async () => {
  const f = fixture();
  f.cloud.readCloudSave = async () => { throw new Error('Database missing'); };
  const result = await f.manager.login('Captain', 'password');
  assert.equal(result.success, false);
  assert.match(result.message, /Cloud progress could not be loaded/);
  assert.equal(f.manager.getCurrentUser(), null);
  assert.equal(storage.get('ssf_save_user_captain'), undefined);
});

test('newer remote progress is restored with a backup of existing local progress', async () => {
  const f = fixture({ snapshot: '{"level":30}', revision: 7 });
  storage.set('ssf_save_user_captain', '{"level":20}');
  storage.set('ssf_save_user_captain_cloud_revision', '5');
  assert.equal((await f.manager.login('Captain', 'password')).success, true);
  assert.equal(storage.get('ssf_save_user_captain_before_cloud'), '{"level":20}');
  assert.equal(storage.get('ssf_save_user_captain'), '{"level":30}');
});

test('unsynced local progress is uploaded when the remote revision has not changed', async () => {
  const f = fixture({ snapshot: '{"level":10}', revision: 3 });
  storage.set('ssf_save_user_captain', '{"level":12}');
  storage.set('ssf_save_user_captain_cloud_revision', '3');
  assert.equal((await f.manager.login('Captain', 'password')).success, true);
  assert.equal(f.calls[1].snapshot, '{"level":12}');
  assert.equal(f.manager.cloudSession.revision, 4);
});

test('guest switching cancels cloud synchronization and does not upload guest saves', async () => {
  const f = fixture({ snapshot: '{"level":10}', revision: 1 });
  await f.manager.login('Captain', 'password');
  f.manager.continueAsGuest();
  storage.set('seven_seas_fishing_save_v2', '{"level":99}');
  await f.manager.syncCloudSave();
  assert.equal(f.calls.length, 1);
});

test('save conflicts leave local progress intact and do not advance the revision', async () => {
  const f = fixture({ snapshot: '{"level":10}', revision: 1 });
  await f.manager.login('Captain', 'password');
  storage.set('ssf_save_user_captain', '{"level":11}');
  f.cloud.writeCloudSave = async () => { throw new Error('Newer progress exists on another device. Log in again to load it.'); };
  await f.manager.syncCloudSave();
  assert.equal(f.manager.cloudSession.revision, 1);
  assert.equal(storage.get('ssf_save_user_captain'), '{"level":11}');
  assert.match(f.manager.cloudStatus, /Newer progress/);
});

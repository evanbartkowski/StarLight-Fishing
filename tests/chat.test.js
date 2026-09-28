import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.localStorage = { getItem: () => null };
const { ChatManager } = await import('../src/systems/ChatManager.js');

test('fleet messages reach independent clients, deduplicate, and preserve failed sends', async () => {
  const listeners = [];
  const backend = {
    subscribe: async receive => { listeners.push(receive); return () => {}; },
    send: async (text, sender) => {
      for (const receive of listeners) {
        const message = { id: 'remote-message', text, sender, kind: 'player' };
        receive(message);
        receive(message);
      }
    },
  };
  const clients = [new ChatManager({ isChatUnlocked: () => true }), new ChatManager({ isChatUnlocked: () => true })];
  for (const client of clients) { client.loadBackend = async () => backend; await client.connect(); }
  assert.equal(await clients[0].sendMessage('Hello from another laptop'), true);
  assert.equal(clients[1].messages.length, 1);
  assert.equal(clients[1].messages[0].text, 'Hello from another laptop');
  backend.send = async () => { throw new Error('Offline'); };
  assert.equal(await clients[0].sendMessage('Retry me'), false);
  assert.equal(clients[0].messages.length, 1);
  const locked = new ChatManager({ isChatUnlocked: () => false });
  locked.loadBackend = async () => { throw new Error('Should not connect'); };
  assert.equal(await locked.sendMessage('Locked'), false);
});

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

test('radio applies remote deletions, expires idle messages and caps the newest thirty', () => {
  const client = new ChatManager({ isChatUnlocked: () => true });
  const now = Date.now();
  for (let index = 0; index < 40; index++) client.receiveExternalMessage({ id: `m${index}`, kind: 'player', text: 'hello', createdAt: now - 2000 + index });
  assert.equal(client.messages.length, 30);
  assert.equal(client.messages[0].id, 'm10');
  client.receiveExternalMessage({ id: 'expired', kind: 'player', text: 'old', createdAt: now - 86400000 });
  assert.equal(client.messages.length, 30);
  client.replaceMessages([{ id: 'last', kind: 'player', text: 'kept', createdAt: now }]);
  assert.deepEqual(client.messages.map(message => message.id), ['last']);
  client.pruneMessages(now + 86400000);
  assert.equal(client.messages.length, 0);
});

test('sendBroadcast emits system messages with designated sender tag', async () => {
  let sentText = '';
  let sentSender = '';
  const backend = {
    subscribe: async () => () => {},
    send: async (text, sender) => {
      sentText = text;
      sentSender = sender;
    },
  };
  const client = new ChatManager({ isChatUnlocked: () => true });
  client.loadBackend = async () => backend;
  await client.connect();

  const successRadio = await client.sendBroadcast('[Fleet Radio]', 'CaptainEvan has acquired a radio and joined the frequency!');
  assert.equal(successRadio, true);
  assert.equal(sentSender, '[Fleet Radio]');
  assert.equal(sentText, 'CaptainEvan has acquired a radio and joined the frequency!');

  const successCatch = await client.sendBroadcast('[Global]', 'CaptainEvan caught an elusive Abyssal Leviathan (240kg)!');
  assert.equal(successCatch, true);
  assert.equal(sentSender, '[Global]');
  assert.equal(sentText, 'CaptainEvan caught an elusive Abyssal Leviathan (240kg)!');
});

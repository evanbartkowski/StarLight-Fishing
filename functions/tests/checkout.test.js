import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { checkoutInput, fulfillCheckout } from '../checkout.js';
import { expiredMessageIds } from '../chatRetention.js';

const auth = { uid: 'captain', token: { firebase: { sign_in_provider: 'password' } } };
const env = { APP_URL: 'https://example.com', STRIPE_PRICE_POCKET: 'price_test' };
test('checkout requires an authenticated owner and a server-configured package', () => {
  const input = { userId: 'captain', packageId: 'pocket' };
  assert.equal(checkoutInput(auth, input, env).gems, 10);
  assert.throws(() => checkoutInput(null, input, env), /unauthenticated/);
  assert.throws(() => checkoutInput({ ...auth, token: { firebase: { sign_in_provider: 'anonymous' } } }, input, env), /unauthenticated/);
  assert.throws(() => checkoutInput(auth, { ...input, userId: 'other' }, env), /permission-denied/);
  assert.throws(() => checkoutInput(auth, { ...input, packageId: '__proto__' }, env), /invalid-argument/);
  assert.throws(() => checkoutInput(auth, input, {}), /failed-precondition/);
});

function database() {
  const records = new Map([['gemCheckouts/cs_test_123', { uid: 'captain', packageId: 'pocket', gems: 10, amountTotal: 199, currency: 'usd' }]]);
  let queue = Promise.resolve();
  return {
    records, doc: path => path,
    runTransaction(callback) {
      const run = queue.then(async () => {
        const pending = new Map(records);
        const tx = {
          get: async ref => ({ exists: pending.has(ref), data: () => pending.get(ref) }),
          create: (ref, data) => { assert.ok(!pending.has(ref)); pending.set(ref, data); },
          update: (ref, data) => pending.set(ref, { ...pending.get(ref), ...data }),
          set: (ref, data) => pending.set(ref, { ...pending.get(ref), ...data, gems: (pending.get(ref)?.gems || 0) + data.gems.increment }),
        };
        const result = await callback(tx);
        records.clear(); for (const entry of pending) records.set(...entry);
        return result;
      });
      queue = run.catch(() => {});
      return run;
    },
  };
}
const fieldValue = { increment: increment => ({ increment }), serverTimestamp: () => 'server-time' };
const session = { id: 'cs_test_123', mode: 'payment', payment_status: 'paid', client_reference_id: 'captain', metadata: { uid: 'captain', packageId: 'pocket' }, amount_total: 199, currency: 'usd' };

test('concurrent webhook retries credit once and preserve an existing gem balance', async () => {
  const db = database(); db.records.set('players/captain', { gems: 7, cosmetics: ['owned'] });
  const results = await Promise.all(Array.from({ length: 8 }, (_, index) => fulfillCheckout(db, session, `evt_${index}`, fieldValue)));
  assert.equal(results.filter(result => result === 'credited').length, 1);
  assert.deepEqual(db.records.get('players/captain'), { gems: 17, cosmetics: ['owned'], updatedAt: 'server-time' });
  assert.equal(db.records.get('gemCheckouts/cs_test_123').fulfilled, true);
});

test('unpaid or mismatched sessions never grant gems', async () => {
  const db = database();
  assert.equal(await fulfillCheckout(db, { ...session, payment_status: 'unpaid' }, 'evt', fieldValue), 'unpaid');
  for (const override of [{ amount_total: 1 }, { currency: 'eur' }, { metadata: { uid: 'attacker', packageId: 'pocket' } }, { id: 'cs_unknown' }]) {
    await assert.rejects(fulfillCheckout(db, { ...session, ...override }, 'evt', fieldValue));
  }
  assert.equal(db.records.has('players/captain'), false);
  assert.equal(db.records.has('stripeReceipts/cs_test_123'), false);
});

test('Stripe signatures accept the exact raw body and reject tampering', () => {
  const stripe = new Stripe('sk_test_dummy');
  const secret = 'whsec_local_test';
  const payload = JSON.stringify({ id: 'evt_local', type: 'checkout.session.completed', data: { object: session } });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  assert.equal(stripe.webhooks.constructEvent(Buffer.from(payload), signature, secret).id, 'evt_local');
  assert.throws(() => stripe.webhooks.constructEvent(Buffer.from(payload + ' '), signature, secret));
  assert.throws(() => stripe.webhooks.constructEvent(Buffer.from(payload), signature, 'wrong'));
});

test('retention removes expired messages and keeps only the newest thirty', () => {
  const now = Date.now();
  const messages = Array.from({ length: 40 }, (_, index) => ({ id: `msg${index}`, createdAt: now - index * 1000 }));
  messages.push({ id: 'expired', createdAt: now - 86400000 });
  const removed = expiredMessageIds(messages, now);
  assert.equal(removed.length, 11);
  assert.ok(removed.includes('expired'));
  assert.ok(!removed.includes('msg0'));
  assert.ok(removed.includes('msg39'));
});

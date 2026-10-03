import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { checkoutInput, fulfillCheckout } from './checkout.js';
import { onDocumentCreated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { pruneFleetMessages } from './chatRetention.js';
import { tipAquarium, publicAquarium } from './aquarium.js';
import { purchasePremium } from './premium.js';

initializeApp();
const options = { region: 'us-central1', maxInstances: 3 };
const stripeClient = () => new Stripe(process.env.STRIPE_SECRET_KEY);

export const serverClock = onCall(options, () => ({ now: Date.now() }));

export const buyPremium = onCall(options, async request => {
  if (!request.auth?.uid || request.auth.token.firebase?.sign_in_provider === 'anonymous') throw new HttpsError('unauthenticated', 'Sign in to purchase.');
  try { return await purchasePremium(getFirestore(), request.auth.uid, request.data, FieldValue); }
  catch (error) {
    const code = ['invalid-argument', 'failed-precondition', 'resource-exhausted', 'aborted'].includes(error.message) ? error.message : 'internal';
    throw new HttpsError(code, 'Purchase could not complete. Check your Gems, inventory space and connection.');
  }
});

export const aquariumAction = onCall(options, async request => {
  const uid = request.auth?.uid;
  const signedIn = !!uid && request.auth.token.firebase?.sign_in_provider !== 'anonymous';
  const db = getFirestore();
  const { action, host, requestId } = request.data || {};
  if (action !== 'visit' && !signedIn) throw new HttpsError('unauthenticated', 'Sign in to share or tip an aquarium.');
  try {
    if (action === 'publish') {
      const [save, profile] = await Promise.all([db.doc(`captainSaves/${uid}`).get(), db.doc(`leaderboard/${uid}`).get()]);
      if (!save.exists) throw new Error('not-found');
      const exhibit = publicAquarium(JSON.parse(save.data().snapshot), profile.data()?.username);
      await db.doc(`aquariums/${uid}`).set({ ...exhibit, updatedAt: FieldValue.serverTimestamp() });
      return { host: uid };
    }
    if (!/^[\w-]{1,128}$/.test(host || '')) throw new Error('invalid-argument');
    if (action === 'visit') {
      const [saved, profile, daily] = await Promise.all([
        db.doc(`captainSaves/${host}`).get(), db.doc(`leaderboard/${host}`).get(),
        signedIn ? db.doc(`daily_tips/${uid}_${Math.floor(Date.now() / 86400000)}`).get() : Promise.resolve(null),
      ]);
      if (!saved.exists) throw new Error('not-found');
      const exhibit = publicAquarium(JSON.parse(saved.data().snapshot), profile.data()?.username);
      if (signedIn) await db.doc(`aquariums/${host}`).set({ ...exhibit, updatedAt: FieldValue.serverTimestamp() });
      return { ...exhibit, remaining: Math.max(0, 3 - (daily?.data()?.count || 0)), canTip: signedIn && host !== uid, isOwn: host === uid, signedIn };
    }
    if (action === 'tip') return await tipAquarium(db, uid, host, requestId, FieldValue);
    throw new Error('invalid-argument');
  } catch (error) {
    const code = ['invalid-argument', 'not-found', 'resource-exhausted', 'failed-precondition'].includes(error.message) ? error.message : 'internal';
    throw new HttpsError(code, code === 'resource-exhausted' ? 'You have used all three tips today (UTC).' : 'Aquarium action could not be completed.');
  }
});

export const trimFleetRadio = onDocumentCreated({ ...options, document: 'fleetMessages/{messageId}', retry: true },
  () => pruneFleetMessages(getFirestore()));
export const expireFleetRadio = onSchedule({ ...options, schedule: 'every 1 minutes', timeZone: 'UTC' },
  () => pruneFleetMessages(getFirestore()));

// Broadcast persisted catch reports once, including when cloud-save events retry.
export const announceCatch = onDocumentWritten({ ...options, document: 'captainSaves/{uid}', retry: true }, async event => {
  if (!event.data?.after.exists) return;
  let after, before;
  try {
    after = JSON.parse(event.data.after.data().snapshot);
    before = event.data.before.exists ? JSON.parse(event.data.before.data().snapshot) : {};
  } catch { return; }
  if (!after || !Array.isArray(after.inventory)) return;
  const existing = new Set((before.inventory || []).map(item => item.instanceId));
  const catches = (after.inventory || []).filter(item => (item.isGodTier || item.isBoss) && !existing.has(item.instanceId)).slice(0, 3);
  if (after.lastRarePull?.id && after.lastRarePull.id !== before.lastRarePull?.id) catches.push({ instanceId: after.lastRarePull.id, name: after.lastRarePull.name });
  const db = getFirestore();
  const profile = await db.doc(`leaderboard/${event.params.uid}`).get();
  const captain = String(profile.data()?.username || 'A captain').slice(0, 40);
  for (const item of catches) {
    const key = `${event.params.uid}_${String(item.instanceId).replace(/[^\w-]/g, '').slice(0, 80)}`;
    await db.runTransaction(async tx => {
      const ref = db.doc(`catchAnnouncements/${key}`);
      if ((await tx.get(ref)).exists) return;
      tx.create(ref, { createdAt: FieldValue.serverTimestamp() });
      tx.create(db.collection('fleetMessages').doc(), { senderId: 'server', sender: 'Fleet Radio', kind: 'event', text: `${captain} discovered ${String(item.name).slice(0, 100)}!`, createdAt: FieldValue.serverTimestamp() });
    });
  }
});

export const createGemCheckoutSession = onCall({ ...options, secrets: ['STRIPE_SECRET_KEY'] }, async request => {
  let input;
  try { input = checkoutInput(request.auth, request.data, process.env); }
  catch (error) { throw new HttpsError(error.message, error.message === 'failed-precondition' ? 'Gem checkout is not configured yet.' : 'Sign in and choose a valid gem package for your own account.'); }
  try {
    const stripe = stripeClient();
    const price = await stripe.prices.retrieve(input.price);
    if (!price.active || price.recurring || price.currency !== 'usd' || price.unit_amount !== input.amount) throw new Error('Invalid one-time USD bundle price');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', payment_method_types: ['card'],
      line_items: [{ price: input.price, quantity: 1 }],
      client_reference_id: input.uid,
      metadata: { uid: input.uid, packageId: input.packageId },
      success_url: `${input.origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin}/?checkout=cancelled`,
    });
    await getFirestore().doc(`gemCheckouts/${session.id}`).create({
      uid: input.uid, packageId: input.packageId, gems: input.gems,
      amountTotal: price.unit_amount, currency: price.currency, priceId: input.price,
      fulfilled: false, createdAt: FieldValue.serverTimestamp(),
    });
    return { url: session.url };
  } catch (error) {
    console.error('Checkout creation failed', { type: error.type || error.code || 'configuration' });
    throw new HttpsError('unavailable', 'Checkout is unavailable. Please try again later.');
  }
});

export const stripeWebhook = onRequest({ ...options, secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] }, async (req, res) => {
  if (req.method !== 'POST') { res.set('Allow', 'POST').status(405).send('Method not allowed'); return; }
  let event;
  try { event = stripeClient().webhooks.constructEvent(req.rawBody, req.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET); }
  catch { res.status(400).send('Invalid Stripe signature'); return; }
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) { res.status(200).json({ received: true }); return; }
  try {
    const result = await fulfillCheckout(getFirestore(), event.data.object, event.id, FieldValue);
    res.status(200).json({ received: true, result });
  } catch (error) {
    console.error('Gem fulfillment failed', { eventId: event.id, reason: error.message });
    res.status(500).send('Fulfillment pending; retry delivery');
  }
});

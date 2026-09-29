import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { checkoutInput, fulfillCheckout } from './checkout.js';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { pruneFleetMessages } from './chatRetention.js';

initializeApp();
const options = { region: 'us-central1', maxInstances: 3 };
const stripeClient = () => new Stripe(process.env.STRIPE_SECRET_KEY);

export const trimFleetRadio = onDocumentCreated({ ...options, document: 'fleetMessages/{messageId}', retry: true },
  () => pruneFleetMessages(getFirestore()));
export const expireFleetRadio = onSchedule({ ...options, schedule: 'every 1 minutes', timeZone: 'UTC' },
  () => pruneFleetMessages(getFirestore()));

export const createGemCheckoutSession = onCall({ ...options, secrets: ['STRIPE_SECRET_KEY'] }, async request => {
  let input;
  try { input = checkoutInput(request.auth, request.data, process.env); }
  catch (error) { throw new HttpsError(error.message, error.message === 'failed-precondition' ? 'Gem checkout is not configured yet.' : 'Sign in and choose a valid gem package for your own account.'); }
  try {
    const stripe = stripeClient();
    const price = await stripe.prices.retrieve(input.price);
    if (!price.active || price.recurring || !Number.isSafeInteger(price.unit_amount) || price.unit_amount <= 0) throw new Error('Invalid one-time price');
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

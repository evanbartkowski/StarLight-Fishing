export const GEM_PACKAGES = {
  pocket: { gems: 10, amount: 199, priceEnv: 'STRIPE_PRICE_POCKET' },
  chest: { gems: 35, amount: 499, priceEnv: 'STRIPE_PRICE_CHEST' },
  vault: { gems: 100, amount: 999, priceEnv: 'STRIPE_PRICE_VAULT' },
  armory: { gems: 250, amount: 1999, priceEnv: 'STRIPE_PRICE_ARMORY' },
};

export function checkoutInput(auth, data, env) {
  if (!auth?.uid || auth.token?.firebase?.sign_in_provider === 'anonymous') throw new Error('unauthenticated');
  if (data?.userId !== auth.uid) throw new Error('permission-denied');
  const bundle = Object.hasOwn(GEM_PACKAGES, data?.packageId) ? GEM_PACKAGES[data.packageId] : null;
  if (!bundle) throw new Error('invalid-argument');
  const price = env[bundle.priceEnv];
  if (!price?.startsWith('price_')) throw new Error('failed-precondition');
  let origin;
  try { origin = new URL(env.APP_URL); } catch { throw new Error('failed-precondition'); }
  if (origin.protocol !== 'https:' || origin.username || origin.password) throw new Error('failed-precondition');
  return { uid: auth.uid, packageId: data.packageId, gems: bundle.gems, amount: bundle.amount, price, origin: origin.origin };
}

// One transaction covers both the balance increment and the durable session receipt.
export async function fulfillCheckout(db, session, eventId, fieldValue) {
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return 'unpaid';
  if (!/^cs_[a-zA-Z0-9_]+$/.test(session.id || '')) throw new Error('Invalid session');
  return db.runTransaction(async tx => {
    const receiptRef = db.doc(`stripeReceipts/${session.id}`);
    const orderRef = db.doc(`gemCheckouts/${session.id}`);
    const receipt = await tx.get(receiptRef);
    if (receipt.exists) return 'duplicate';
    const order = await tx.get(orderRef);
    if (!order.exists) throw new Error('Missing checkout order');
    const expected = order.data();
    if (session.client_reference_id !== expected.uid || session.metadata?.uid !== expected.uid
      || session.metadata?.packageId !== expected.packageId || session.amount_total !== expected.amountTotal
      || session.currency !== expected.currency || !Number.isSafeInteger(expected.gems) || expected.gems <= 0) {
      throw new Error('Checkout does not match order');
    }
    tx.set(db.doc(`players/${expected.uid}`), { gems: fieldValue.increment(expected.gems), updatedAt: fieldValue.serverTimestamp() }, { merge: true });
    tx.create(receiptRef, { uid: expected.uid, gems: expected.gems, eventId, creditedAt: fieldValue.serverTimestamp() });
    tx.update(orderRef, { fulfilled: true });
    return 'credited';
  });
}

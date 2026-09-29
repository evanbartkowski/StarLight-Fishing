import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getCloudClient } from './CloudAccounts.js';

export function watchWallet(receive, onError) {
  const { auth } = getCloudClient();
  const db = getFirestore(auth.app);
  let stopSnapshot;
  const stopAuth = onAuthStateChanged(auth, user => {
    stopSnapshot?.();
    receive(null);
    if (!user || user.isAnonymous) return;
    stopSnapshot = onSnapshot(doc(db, 'players', user.uid), { includeMetadataChanges: true }, snapshot => {
      receive({ ...snapshot.data(), uid: user.uid, ready: !snapshot.metadata.fromCache });
    }, onError);
  });
  return () => { stopAuth(); stopSnapshot?.(); };
}

export async function startCheckout(packageId, userId) {
  const { auth } = getCloudClient();
  await auth.authStateReady();
  if (!auth.currentUser || auth.currentUser.uid !== userId || auth.currentUser.isAnonymous) throw new Error('Sign in to purchase gems.');
  const callable = httpsCallable(getFunctions(auth.app, 'us-central1'), 'createGemCheckoutSession');
  const result = await callable({ packageId, userId });
  const url = new URL(result.data.url);
  if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('Invalid checkout URL.');
  return url.href;
}

// Client writes may only decrease purchased gems. Stripe alone can increase them.
export async function spendWallet(uid, items, earnedGems) {
  const { auth } = getCloudClient();
  if (auth.currentUser?.uid !== uid) throw new Error('Please sign in again.');
  const db = getFirestore(auth.app);
  return runTransaction(db, async tx => {
    const ref = doc(db, 'players', uid);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists()) throw new Error('No purchased gems available.');
    const wallet = snapshot.data();
    const owned = new Set(wallet.cosmetics || []);
    const cost = items.reduce((sum, item) => sum + (owned.has(item.id) ? 0 : item.cost), 0);
    const earnedSpent = Math.min(earnedGems, cost);
    const paidSpent = cost - earnedSpent;
    if (!Number.isSafeInteger(wallet.gems) || wallet.gems < paidSpent) throw new Error('Not enough gems.');
    items.forEach(item => owned.add(item.id));
    const gems = wallet.gems - paidSpent;
    tx.update(ref, { gems, cosmetics: [...owned], updatedAt: serverTimestamp() });
    return { earnedSpent, gems, cosmetics: [...owned] };
  });
}

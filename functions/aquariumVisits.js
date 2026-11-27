import { captainEmail, publicAquarium } from './aquarium.js';

async function accountLookup(lookup) {
  try { return await lookup(); }
  catch (error) {
    if (['auth/user-not-found', 'auth/invalid-uid', 'auth/invalid-email'].includes(error.code)) return null;
    throw error;
  }
}

// Resolve identity before projecting an exhibit, including newly registered
// accounts with no cloud save and older leaderboard IDs with a newer Auth UID.
export async function resolveAquariumVisit(db, auth, rawHost) {
  const host = String(rawHost || '').trim();
  if (!/^[\w -]{1,128}$/.test(host)) throw new Error('invalid-argument');
  const read = async uid => {
    const [save, profile, published] = await Promise.all([
      db.doc(`captainSaves/${uid}`).get(), db.doc(`leaderboard/${uid}`).get(), db.doc(`aquariums/${uid}`).get(),
    ]);
    return { uid, save, profile, published };
  };
  let target = await read(host), user = null;
  if (!target.save.exists && !target.published.exists) {
    user = await accountLookup(() => auth.getUser(host));
    if (!user) user = await accountLookup(() => auth.getUserByEmail(captainEmail(target.profile.data()?.username || host)));
    if (user) target = await read(user.uid);
    else if (!target.profile.exists) {
      for (const collection of ['leaderboard', 'aquariums']) {
        const matches = await db.collection(collection).where('username', '==', host).limit(1).get();
        if (!matches.empty) { target = await read(matches.docs[0].id); break; }
      }
    }
  }
  if (!user && !target.save.exists && !target.profile.exists && !target.published.exists) throw new Error('not-found');

  let snapshot;
  if (target.save.exists) {
    try {
      const parsed = JSON.parse(target.save.data().snapshot);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) snapshot = parsed;
    } catch { /* An older published display can still be visited. */ }
  }
  const published = target.published.data() || {};
  if (!snapshot && target.published.exists) {
    const items = (Array.isArray(published.items) ? published.items : []).slice(0, 50).filter(item => item && typeof item === 'object')
      .map((item, index) => ({ ...item, instanceId: item.instanceId || `display-${index}` }));
    snapshot = { aquarium: { theme: published.theme, decor: published.decor, slottedItemIds: items.map(item => item.instanceId) }, inventory: items };
  }
  if (!user && !target.profile.data()?.username && !published.username && !target.save.data()?.username) user = await accountLookup(() => auth.getUser(target.uid));
  const username = target.profile.data()?.username || user?.displayName || published.username || target.save.data()?.username || host;
  return { targetUid: target.uid, exhibit: publicAquarium(snapshot || {}, username), hasPublished: target.published.exists };
}

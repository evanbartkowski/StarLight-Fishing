// @ts-check
/** Authenticated aquarium tips are serialized by the visitor's UTC-day document.
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} uid
 * @param {string} host
 * @param {string} requestId
 * @param {typeof import('firebase-admin/firestore').FieldValue} fieldValue
 * @param {number} now
 */
export async function tipAquarium(db, uid, host, requestId, fieldValue, now = Date.now()) {
  if (!uid || uid === host || !/^[\w-]{1,128}$/.test(host || '') || !/^[\w-]{8,80}$/.test(requestId || '')) throw new Error('invalid-argument');
  const day = Math.floor(now / 86400000);
  return db.runTransaction(async tx => {
    const dailyRef = db.doc(`daily_tips/${uid}_${day}`);
    const aquariumRef = db.doc(`aquariums/${host}`);
    const saveRef = db.doc(`captainSaves/${uid}`);
    const receiptRef = db.doc(`aquariumTipReceipts/${uid}_${requestId}`);
    const receipt = await tx.get(receiptRef);
    const daily = await tx.get(dailyRef);
    const aquarium = await tx.get(aquariumRef);
    const save = await tx.get(saveRef);
    const saveData = save.data();
    if (!saveData) throw new Error('not-found');
    const state = daily.data() || { count: 0, requests: [] };
    if (receipt.exists) {
      if (receipt.data()?.host !== host) throw new Error('invalid-argument');
      return { duplicate: true, remaining: Math.max(0, 3 - state.count), snapshot: saveData.snapshot, revision: saveData.revision };
    }
    if (state.requests.includes(requestId)) return { duplicate: true, remaining: 3 - state.count, snapshot: saveData.snapshot, revision: saveData.revision };
    if (!aquarium.exists || !save.exists) throw new Error('not-found');
    if (state.count >= 3) throw new Error('resource-exhausted');
    const snapshot = JSON.parse(saveData.snapshot);
    if (!Number.isSafeInteger(snapshot.coins) || snapshot.coins < 1) throw new Error('failed-precondition');
    snapshot.coins -= 1;
    tx.create(receiptRef, { uid, host, day, createdAt: fieldValue.serverTimestamp() });
    tx.update(saveRef, { snapshot: JSON.stringify(snapshot), revision: saveData.revision + 1, updatedAt: fieldValue.serverTimestamp() });
    tx.set(dailyRef, { uid, day, count: state.count + 1, requests: [...state.requests, requestId], updatedAt: fieldValue.serverTimestamp() });
    tx.set(db.doc(`players/${host}`), { gems: fieldValue.increment(1), updatedAt: fieldValue.serverTimestamp() }, { merge: true });
    return { remaining: 2 - state.count, duplicate: false, snapshot: JSON.stringify(snapshot), revision: saveData.revision + 1 };
  });
}

/** Restrict public exhibits to display data; never expose private save snapshots.
 * @param {import('./economy-types.js').AquariumSnapshot} snapshot
 * @param {string} username
 */
export function publicAquarium(snapshot, username) {
  if (!snapshot.aquarium?.isUnlocked && !((snapshot.upgrades?.personalAquarium || 0) > 0)) throw new Error('failed-precondition');
  const slots = new Set(snapshot.aquarium?.slottedItemIds || []);
  const fields = ['instanceId', 'speciesId', 'name', 'rarity', 'size', 'weight', 'weightClass', 'mutation', 'scaleFactor', 'isShiny', 'crown', 'type'];
  const items = (snapshot.inventory || []).filter(item => slots.has(item.instanceId) && item.type === 'fish').slice(0, 50)
    .map(item => Object.fromEntries(fields.filter(key => item[key] !== undefined).map(key => [key, item[key]])));
  return { username: String(username || 'Captain').slice(0, 40), theme: snapshot.aquarium?.theme || 'reef', items };
}

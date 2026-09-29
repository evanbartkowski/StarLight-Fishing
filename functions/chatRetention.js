export const CHAT_LIFETIME_MS = 24 * 60 * 60 * 1000;
export function expiredMessageIds(messages, now = Date.now()) {
  return [...messages].sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id))
    .filter((message, index) => index >= 30 || message.createdAt <= now - CHAT_LIFETIME_MS)
    .map(message => message.id);
}

export async function pruneFleetMessages(db, now = Date.now()) {
  // Transactions serialize concurrent arrivals. Repeat to drain legacy histories.
  let deleted;
  do {
    deleted = await db.runTransaction(async tx => {
      const snapshot = await tx.get(db.collection('fleetMessages').orderBy('createdAt', 'desc').limit(450));
      const ids = expiredMessageIds(snapshot.docs.map(doc => ({ id: doc.id, createdAt: doc.data().createdAt.toMillis() })), now);
      ids.forEach(id => tx.delete(db.doc(`fleetMessages/${id}`)));
      return ids.length;
    });
  } while (deleted >= 420);
}

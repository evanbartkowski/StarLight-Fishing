import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, signInAnonymously } from 'firebase/auth';
import { initializeFirestore, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getFirestore as getWriteStore, collection as writeCollection, doc, writeBatch, serverTimestamp } from 'firebase/firestore/lite';

let ready;
async function client() {
  if (!ready) ready = (async () => {
    const name = 'fleet-radio';
    const app = getApps().find(app => app.name === name) || initializeApp({
      projectId: 'starlight-fishing', appId: '1:1092703473317:web:9da23a318f65f33233c74c',
      apiKey: 'AIzaSyAshP_PJhPYe_8Ug6eDRV_gUDw0LdEQ8bU', authDomain: 'starlight-fishing.firebaseapp.com',
    }, name);
    const auth = initializeAuth(app, { persistence: browserLocalPersistence });
    await auth.authStateReady();
    const user = auth.currentUser || (await signInAnonymously(auth)).user;
    return { db: initializeFirestore(app, { experimentalAutoDetectLongPolling: true }), writeDb: getWriteStore(app), uid: user.uid };
  })().catch(error => { ready = null; throw error; });
  return ready;
}

export async function subscribe(receive, onError, replace) {
  const { db, uid } = await client();
  return onSnapshot(query(collection(db, 'fleetMessages'), orderBy('createdAt', 'desc'), limit(30)),
    { includeMetadataChanges: true }, snapshot => {
      const messages = snapshot.docs.filter(item => !item.metadata.hasPendingWrites)
        .map(item => ({ ...item.data(), id: item.id, isSelf: item.data().senderId === uid }))
        .filter(item => item.createdAt?.toMillis() > Date.now() - 86400000).reverse();
      if (replace) replace(messages);
      else messages.forEach(receive);
    }, onError);
}

export async function send(text, sender) {
  if (globalThis.navigator?.onLine === false) throw new Error('You are offline. Reconnect to send.');
  // REST-backed writes return a server acknowledgement or error instead of
  // waiting indefinitely in the realtime SDK's offline write queue.
  const { writeDb: db, uid } = await client();
  const message = doc(writeCollection(db, 'fleetMessages'));
  const batch = writeBatch(db);
  batch.set(message, { senderId: uid, sender: sender.slice(0, 40), text, kind: 'player', createdAt: serverTimestamp() });
  batch.set(doc(db, 'fleetSenders', uid), { sentAt: serverTimestamp(), messageId: message.id });
  await batch.commit();
}

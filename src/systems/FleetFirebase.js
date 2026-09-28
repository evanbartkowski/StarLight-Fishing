import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, doc, query, orderBy, limit, onSnapshot, writeBatch, serverTimestamp } from 'firebase/firestore';

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
    return { db: getFirestore(app), uid: user.uid };
  })().catch(error => { ready = null; throw error; });
  return ready;
}

export async function subscribe(receive, onError) {
  const { db, uid } = await client();
  return onSnapshot(query(collection(db, 'fleetMessages'), orderBy('createdAt', 'desc'), limit(50)), snapshot => {
    snapshot.docs.slice().reverse().forEach(item => {
      if (!item.metadata.hasPendingWrites) receive({ ...item.data(), id: item.id, isSelf: item.data().senderId === uid });
    });
  }, onError);
}

export async function send(text, sender) {
  const { db, uid } = await client();
  const message = doc(collection(db, 'fleetMessages'));
  const batch = writeBatch(db);
  batch.set(message, { senderId: uid, sender, text, kind: 'player', createdAt: serverTimestamp() });
  batch.set(doc(db, 'fleetSenders', uid), { sentAt: serverTimestamp(), messageId: message.id });
  await batch.commit();
}

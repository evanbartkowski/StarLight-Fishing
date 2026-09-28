import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore/lite';

// Public web configuration. Access control lives in firestore.rules.
const config = {
  projectId: 'starlight-fishing',
  appId: '1:1092703473317:web:9da23a318f65f33233c74c',
  apiKey: 'AIzaSyAshP_PJhPYe_8Ug6eDRV_gUDw0LdEQ8bU',
  authDomain: 'starlight-fishing.firebaseapp.com',
};
const clients = new Map();

function client(name) {
  if (!clients.has(name)) {
    const app = getApps().find(app => app.name === name) || initializeApp(config, name);
    const auth = initializeAuth(app, { persistence: browserLocalPersistence });
    clients.set(name, { auth, db: getFirestore(app) });
  }
  return clients.get(name);
}

export async function publishScore(accountKey, score) {
  // A separate persisted identity for each local captain prevents account switches
  // from replacing another captain's score. Existing local passwords stay local.
  const { auth, db } = client(`captain:${accountKey}`);
  await auth.authStateReady();
  const user = auth.currentUser || (await signInAnonymously(auth)).user;
  await setDoc(doc(db, 'leaderboard', user.uid), { ...score, updatedAt: serverTimestamp() });
  return user.uid;
}

export async function readScores(mode) {
  const { db } = client('public-scoreboard');
  const fields = mode === 'money'
    ? [['coins', 'desc'], ['totalGoldEarned', 'desc'], ['level', 'desc'], ['createdAt', 'asc']]
    : [['level', 'desc'], ['xp', 'desc'], ['coins', 'desc'], ['totalFishCaught', 'desc'], ['createdAt', 'asc']];
  const result = await getDocs(query(collection(db, 'leaderboard'), ...fields.map(([field, direction]) => orderBy(field, direction)), limit(100)));
  return result.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

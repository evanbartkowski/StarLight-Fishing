import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { getFirestore, getDoc, doc, runTransaction, serverTimestamp } from 'firebase/firestore/lite';

const appName = 'captain-accounts';
let client;
export function getCloudClient() {
  if (!client) {
    const app = getApps().find(app => app.name === appName) || initializeApp({
      projectId: 'starlight-fishing', appId: '1:1092703473317:web:9da23a318f65f33233c74c',
      apiKey: 'AIzaSyAshP_PJhPYe_8Ug6eDRV_gUDw0LdEQ8bU', authDomain: 'starlight-fishing.firebaseapp.com',
    }, appName);
    client = { auth: initializeAuth(app, { persistence: browserLocalPersistence }), db: getFirestore(app) };
  }
  return client;
}

export function captainEmail(username) {
  // Collision-free internal identifier; captains continue signing in by username.
  return `${Array.from(username.trim().toLowerCase()).map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('')}@captains.starlight-fishing.invalid`;
}

export async function authenticate(username, password, create = false) {
  const { auth } = getCloudClient();
  await auth.authStateReady();
  // Compatibility prefix lets existing four-character passwords migrate intact.
  const credential = `starlight-v1:${password}`;
  const result = await (create ? createUserWithEmailAndPassword : signInWithEmailAndPassword)(auth, captainEmail(username), credential);
  if (create) await updateProfile(result.user, { displayName: username });
  return { uid: result.user.uid, username: result.user.displayName || username, createdAt: Date.parse(result.user.metadata.creationTime) || Date.now() };
}

export async function logoutCloud() {
  await signOut(getCloudClient().auth);
}

export async function readCloudSave(uid) {
  const { auth, db } = getCloudClient();
  await auth.authStateReady();
  if (auth.currentUser?.uid !== uid) throw new Error('Please sign in again to sync this captain.');
  const result = await getDoc(doc(db, 'captainSaves', uid));
  return result.exists() ? result.data() : null;
}

export async function writeCloudSave(uid, snapshot, revision) {
  const { auth, db } = getCloudClient();
  if (auth.currentUser?.uid !== uid) throw new Error('Please sign in again to sync this captain.');
  if (new TextEncoder().encode(snapshot).length > 900000) throw new Error('This save is too large to sync. Your local progress is safe.');
  return runTransaction(db, async transaction => {
    const reference = doc(db, 'captainSaves', uid);
    const existing = await transaction.get(reference);
    const currentRevision = existing.exists() ? existing.data().revision : 0;
    if (currentRevision !== revision) throw new Error('Newer progress exists on another device. Log in again to load it.');
    transaction.set(reference, { snapshot, revision: revision + 1, updatedAt: serverTimestamp() });
    return revision + 1;
  });
}

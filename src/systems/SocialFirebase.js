async function callable(name, data) {
  const [{ getFunctions, httpsCallable }, { getCloudClient }] = await Promise.all([import('firebase/functions'), import('./CloudAccounts.js')]);
  const { auth } = getCloudClient();
  await auth.authStateReady();
  return (await httpsCallable(getFunctions(auth.app, 'us-central1'), name)(data)).data;
}

export async function aquariumAction(data) {
  return callable('aquariumAction', data);
}

export async function serverOffset() {
  const start = Date.now();
  const result = await callable('serverClock', {});
  return result.now - (start + Date.now()) / 2;
}

export async function buyPremium(data) {
  return callable('buyPremium', data);
}

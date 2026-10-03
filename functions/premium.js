// @ts-check
import { UPGRADE_DEFINITIONS } from './shared/UpgradesData.js';
import { CRATE_RANKS, CRATE_GEM_PRICES } from './shared/CrateData.js';

/** One transaction debits Gems and delivers the purchase to the versioned save.
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} uid
 * @param {import('./economy-types.js').PremiumRequest} input
 * @param {typeof import('firebase-admin/firestore').FieldValue} fieldValue
 */
export async function purchasePremium(db, uid, input, fieldValue) {
  if (!/^[\w-]{8,80}$/.test(input?.requestId || '')) throw new Error('invalid-argument');
  return db.runTransaction(async tx => {
    const saveRef = db.doc(`captainSaves/${uid}`), walletRef = db.doc(`players/${uid}`);
    const receiptRef = db.doc(`premiumReceipts/${uid}_${input.requestId}`);
    const receipt = await tx.get(receiptRef);
    const saved = await tx.get(saveRef), wallet = await tx.get(walletRef);
    const savedData = saved.data();
    if (!savedData) throw new Error('failed-precondition');
    if (receipt.exists) return { snapshot: savedData.snapshot, revision: savedData.revision, gems: wallet.data()?.gems || 0 };
    if (savedData.revision !== input.revision) throw new Error('aborted');
    const state = JSON.parse(savedData.snapshot);
    let cost;
    if (input.kind === 'crate') {
      const crate = CRATE_RANKS.find(entry => entry.rank === input.rank);
      if (!crate) throw new Error('invalid-argument');
      const capacity = UPGRADE_DEFINITIONS.tackleBox.tiers[state.upgrades?.tackleBox || 0]?.capacity || 15;
      if (!Array.isArray(state.inventory) || state.inventory.length >= capacity) throw new Error('resource-exhausted');
      cost = /** @type {Record<number, number>} */ (CRATE_GEM_PRICES)[crate.rank];
      state.inventory.push({ instanceId: `purchase_${input.requestId}`, id: crate.id, name: crate.name, type: 'trinket', category: 'crate', isCrate: true, crateRank: crate.rank, rarity: crate.rarity, value: 0, unboxed: false, icon: crate.icon, caughtAt: Date.now() });
    } else if (input.kind === 'upgrade') {
      if (!Object.hasOwn(UPGRADE_DEFINITIONS, input.key)) throw new Error('invalid-argument');
      const level = state.upgrades[input.key] || 0;
      const definitions = /** @type {Record<string, { tiers: Array<{ cost: number, reqLevel: number, capacity?: number, trapCount?: number, maxStorage?: number }> }>} */ (UPGRADE_DEFINITIONS);
      const tier = definitions[input.key].tiers[level + 1];
      if (!tier || state.level < tier.reqLevel) throw new Error('failed-precondition');
      cost = Math.max(1, Math.ceil(tier.cost / 600));
      state.upgrades[input.key] = level + 1;
      if (input.key === 'personalAquarium') Object.assign(state.aquarium, { isUnlocked: true, tier: level + 1, maxCapacity: tier.capacity });
      if (input.key === 'seabedTraps') Object.assign(state.traps, { count: tier.trapCount || 1, maxStorage: tier.maxStorage || 12 });
    } else if (input.kind === 'soundtrack') {
      const prices = /** @type {Record<string, number>} */ ({ peaceful_lagoon: 3, zen_meditation: 4, tropical_solitude: 3, ocean_waves: 3 });
      if (!Object.hasOwn(prices, input.track)) throw new Error('invalid-argument');
      state.unlockedSoundtracks ||= ['harbor_breeze', 'rainy_lighthouse', 'deep_blue'];
      cost = state.unlockedSoundtracks.includes(input.track) ? 0 : prices[input.track];
      if (cost) state.unlockedSoundtracks.push(input.track);
    } else if (input.kind === 'boatSkin') {
      if (!['coral', 'indigo', 'gold'].includes(input.skin)) throw new Error('invalid-argument');
      state.boatSkins ||= [];
      cost = state.boatSkins.includes(input.skin) ? 0 : 5;
      if (cost) state.boatSkins.push(input.skin);
      state.boatSkin = input.skin;
    } else throw new Error('invalid-argument');
    const earned = Number.isSafeInteger(state.gems) ? Math.max(0, state.gems) : 0;
    const paid = wallet.data()?.gems || 0;
    const earnedSpent = Math.min(earned, cost), paidSpent = cost - earnedSpent;
    if (!Number.isSafeInteger(paid) || paid < paidSpent) throw new Error('failed-precondition');
    state.gems = earned - earnedSpent;
    const result = { snapshot: JSON.stringify(state), revision: savedData.revision + 1, gems: paid - paidSpent };
    tx.update(saveRef, { snapshot: result.snapshot, revision: result.revision, updatedAt: fieldValue.serverTimestamp() });
    if (paidSpent) tx.update(walletRef, { gems: result.gems, updatedAt: fieldValue.serverTimestamp() });
    tx.create(receiptRef, { uid, kind: input.kind, cost, earnedSpent, paidSpent, createdAt: fieldValue.serverTimestamp() });
    return result;
  });
}

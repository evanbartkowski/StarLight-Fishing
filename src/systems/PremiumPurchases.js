import { accountManager } from './AccountManager.js';
import { buyPremium } from './SocialFirebase.js';
import { CRATE_RANKS, CRATE_GEM_PRICES } from '../data/CrateData.js';
import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';

/** Apply the server's version together with its snapshot, preventing stale writes. */
export function acceptServerSave(save, session, result) {
  if (accountManager.cloudSession !== session || accountManager.getActiveSaveKey() !== save.getActiveStorageKey()) throw new Error('Account changed. Sign in again to load your purchase.');
  save.data = JSON.parse(result.snapshot);
  session.revision = result.revision; session.snapshot = result.snapshot;
  save.save();
  localStorage.setItem(`${save.getActiveStorageKey()}_cloud_revision`, String(result.revision));
}

export async function premiumPurchase(ui, input) {
  const save = ui.saveSystem;
  if (ui.premiumBusy) return false;
  ui.premiumBusy = true;
  try {
    if (accountManager.isGuest()) {
      if (input.kind === 'crate') {
        const crate = CRATE_RANKS.find(item => item.rank === input.rank);
        if (!crate) throw new Error('Choose a valid crate.');
        if (save.isInventoryFull()) throw new Error('Your inventory is full. Free a slot before buying a crate.');
        const cost = CRATE_GEM_PRICES[crate.rank];
        if (save.data.gems < cost) throw new Error(`You need ${cost} earned Gems for this crate.`);
        save.mutateAtomically(() => {
          save.data.gems -= cost;
          if (!save.addItemToInventory({ ...crate, isCrate: true, crateRank: crate.rank, category: 'crate', value: 0 })) throw new Error('Your inventory is full.');
        });
        ui.showToast('Sealed case stored in your Crate Vault.');
        return true;
      }
      if (input.kind === 'upgrade') {
        const upgDef = UPGRADE_DEFINITIONS[input.key];
        if (!upgDef) throw new Error('Choose a valid upgrade.');
        const currentLvl = save.getUpgradeLevel(input.key);
        const nextTier = upgDef.tiers[currentLvl + 1];
        if (!nextTier) throw new Error('Upgrade already maxed.');
        if ((save.data.level || 1) < (nextTier.reqLevel || 0)) throw new Error(`Requires Angler Level ${nextTier.reqLevel}.`);
        const cost = input.cost ?? Math.max(1, Math.ceil(nextTier.cost / 600));
        if (save.data.gems < cost) throw new Error(`You need ${cost} Gems for this upgrade.`);
        save.mutateAtomically(() => {
          save.data.gems -= cost;
          save.setUpgradeLevel(input.key, currentLvl + 1);
        });
        ui.onUpgradePurchased?.();
        ui.showToast(`Purchased ${upgDef.name} Level ${currentLvl + 1}!`);
        return true;
      }
      if (input.kind === 'soundtrack') {
        const cost = input.cost ?? 0;
        if (save.data.gems < cost) throw new Error(`You need ${cost} Gems for this soundtrack.`);
        save.mutateAtomically(() => {
          save.data.gems -= cost;
          save.data.unlockedSoundtracks ||= ['harbor_breeze', 'rainy_lighthouse', 'deep_blue'];
          if (!save.data.unlockedSoundtracks.includes(input.track)) {
            save.data.unlockedSoundtracks.push(input.track);
          }
        });
        ui.showToast('Soundtrack unlocked!');
        return true;
      }
    }
    save.save();
    await accountManager.syncCloudSave();
    const session = accountManager.cloudSession;
    if (!session || session.busy || session.snapshot !== localStorage.getItem(save.getActiveStorageKey())) throw new Error('Sign in and sync your captain before purchasing.');
    session.busy = true;
    try {
      // Retain the ID after uncertain responses: retrying cannot debit twice.
      const key = `${save.getActiveStorageKey()}_pending_purchase`;
      const signature = JSON.stringify(input);
      const previous = JSON.parse(localStorage.getItem(key) || 'null');
      const pending = previous || { signature, input, requestId: crypto.randomUUID() };
      localStorage.setItem(key, JSON.stringify(pending));
      const result = await buyPremium({ ...pending.input, requestId: pending.requestId, revision: session.revision });
      acceptServerSave(save, session, result);
      if (save.gemShop) save.gemShop.balance = result.gems;
      localStorage.removeItem(key);
      ui.onUpgradePurchased?.();
      ui.showToast(previous && previous.signature !== signature ? 'Previous purchase recovered. Select your next purchase again.' : 'Purchase delivered.');
      return true;
    } finally { session.busy = false; }
  } catch (error) {
    if (['functions/failed-precondition', 'functions/invalid-argument', 'functions/resource-exhausted', 'functions/aborted'].includes(error.code)) localStorage.removeItem(`${save.getActiveStorageKey()}_pending_purchase`);
    ui.showToast(error.message); return false;
  } finally { ui.premiumBusy = false; }
}

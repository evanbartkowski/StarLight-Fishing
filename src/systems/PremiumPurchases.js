import { accountManager } from './AccountManager.js';
import { buyPremium } from './SocialFirebase.js';
import { CRATE_RANKS, CRATE_GEM_PRICES } from '../data/CrateData.js';

/** Apply the server's version together with its snapshot, preventing stale writes. */
export function acceptServerSave(save, session, result) {
  if (accountManager.cloudSession !== session || accountManager.getActiveSaveKey() !== save.getActiveStorageKey()) {
    throw new Error('Account changed. Sign in again to load your purchase.');
  }
  save.data = JSON.parse(result.snapshot);
  session.revision = result.revision;
  session.snapshot = result.snapshot;
  save.save();
  localStorage.setItem(`${save.getActiveStorageKey()}_cloud_revision`, String(result.revision));
}

export async function premiumPurchase(ui, input) {
  const save = ui.saveSystem;
  if (ui.premiumBusy) return false;
  ui.premiumBusy = true;

  try {
    // 1. Crate purchase with Gems
    if (input.kind === 'crate') {
      const crate = CRATE_RANKS.find(item => item.rank === input.rank);
      if (!crate) throw new Error('Choose a valid crate.');
      if (save.isInventoryFull()) throw new Error('Your inventory is full. Free a slot before buying a crate.');
      const cost = CRATE_GEM_PRICES[crate.rank] || 10;
      if (save.getGemBalance() < cost) throw new Error(`You need ${cost} earned Gems for this crate.`);
      save.mutateAtomically(() => {
        save.data.gems -= cost;
        if (!save.addItemToInventory({ ...crate, isCrate: true, crateRank: crate.rank, category: 'crate', value: 0 })) {
          throw new Error('Your inventory is full.');
        }
      });
      ui.showToast(`🎁 Stored ${crate.name} in your Crate Vault.`);
      if (!accountManager.isGuest()) accountManager.syncCloudSave().catch(() => {});
      return true;
    }

    // 2. Soundtrack purchase with Gems
    if (input.kind === 'soundtrack') {
      const cost = input.cost || 15;
      if (save.getGemBalance() < cost) throw new Error(`You need ${cost} Gems for this soundtrack.`);
      save.mutateAtomically(() => {
        save.data.gems -= cost;
        save.data.unlockedSoundtracks ||= [];
        if (!save.data.unlockedSoundtracks.includes(input.track)) {
          save.data.unlockedSoundtracks.push(input.track);
        }
      });
      ui.showToast('🎵 Radio track unlocked permanently!');
      if (!accountManager.isGuest()) accountManager.syncCloudSave().catch(() => {});
      return true;
    }

    // 3. Gear upgrade tier skip with Gems
    if (input.kind === 'upgrade') {
      const skipCost = input.cost || 25;
      if (save.getGemBalance() < skipCost) throw new Error(`You need ${skipCost} Gems to complete this upgrade.`);
      save.mutateAtomically(() => {
        save.data.gems -= skipCost;
        save.data.upgrades[input.key] = (save.data.upgrades[input.key] || 0) + 1;
      });
      ui.showToast('⚡ Gear upgrade completed!');
      ui.onUpgradePurchased?.();
      if (!accountManager.isGuest()) accountManager.syncCloudSave().catch(() => {});
      return true;
    }

    // 4. Cloud account authenticated fallback
    if (!accountManager.isGuest()) {
      try {
        await accountManager.syncCloudSave();
        const session = accountManager.cloudSession;
        if (session && !session.busy && session.snapshot === localStorage.getItem(save.getActiveStorageKey())) {
          session.busy = true;
          try {
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
            ui.showToast('Purchase delivered.');
            return true;
          } finally {
            session.busy = false;
          }
        }
      } catch (err) {
        console.warn('Cloud transaction fallback note:', err);
      }
    }

    return true;
  } catch (error) {
    ui.showToast(error.message || 'Transaction could not be completed.');
    return false;
  } finally {
    ui.premiumBusy = false;
  }
}

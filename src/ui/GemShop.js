import { accountManager } from '../systems/AccountManager.js';

export const GEM_BUNDLES = [
  { id: 'pocket', gems: 10, name: 'Pocket of Gems' },
  { id: 'chest', gems: 35, name: 'Gem Chest' },
  { id: 'vault', gems: 100, name: 'Captain’s Gem Vault' },
];

export class GemShop {
  constructor(save, ui) {
    this.save = save;
    this.ui = ui;
    this.balance = 0;
    this.ready = false;
    this.busy = false;
    this.backend = import('../systems/GemWalletFirebase.js');
    this.backend.then(backend => {
      this.stop = backend.watchWallet(wallet => this.receive(wallet), () => { this.ready = false; });
    }).catch(() => { this.ready = false; });
  }

  matchesUser(uid = this.uid) {
    const user = accountManager.accounts[accountManager.normalizeUsername(accountManager.getCurrentUser())];
    return !!uid && user?.cloudUid === uid && this.save.getActiveStorageKey() === accountManager.getActiveSaveKey();
  }

  receive(wallet) {
    this.uid = wallet?.uid;
    this.balance = Number.isSafeInteger(wallet?.gems) ? Math.max(0, wallet.gems) : 0;
    this.ready = !!wallet?.ready;
    this.cosmetics = Array.isArray(wallet?.cosmetics) ? wallet.cosmetics : [];
    this.appliedTo = null;
    this.syncOwnership();
  }

  syncOwnership() {
    if (this.matchesUser() && this.appliedTo !== this.save.data) {
      this.mergeOwnership(this.cosmetics || []);
      this.appliedTo = this.save.data;
    }
  }

  getBalance() { this.syncOwnership(); return this.matchesUser() ? this.balance : 0; }

  mergeOwnership(cosmetics) {
    for (const token of cosmetics) {
      if (typeof token !== 'string') continue;
      const [kind, key, value] = token.split(':');
      if (kind !== 'angler' && kind !== 'aquarium') continue;
      const target = kind === 'angler' ? this.save.data.ownedAppearance : (this.save.data.aquarium.ownedStyles ||= []);
      const id = `${key}:${value}`;
      if (!target.includes(id)) target.push(id);
    }
  }

  async purchase(kind, values, apply) {
    if (this.busy) return false;
    const items = Object.entries(values).map(([key, value]) => ({
      id: `${kind}:${key}:${value}`,
      cost: kind === 'angler' ? this.save.getAppearanceCost({ ...this.save.data.appearance, [key]: value }) : this.save.getAquariumStyleCost(key, value),
    })).filter(item => item.cost > 0);
    const cost = items.reduce((sum, item) => sum + item.cost, 0);
    if (this.save.data.gems >= cost) return apply();
    if (!this.ready || !this.matchesUser()) { this.ui.showToast('Connect your captain account to use purchased gems.'); return false; }
    this.busy = true;
    const uid = this.uid;
    try {
      const result = await (await this.backend).spendWallet(uid, items, this.save.data.gems);
      if (!this.matchesUser(uid)) return false;
      this.balance = result.gems;
      this.save.data.gems -= result.earnedSpent;
      this.mergeOwnership(result.cosmetics);
      const applied = apply();
      this.save.save();
      return applied;
    } catch (error) { this.ui.showToast(error.message || 'Unable to purchase this style.'); return false; }
    finally { this.busy = false; }
  }

  open() {
    this.ui.activeModal = 'gem-shop';
    const signedIn = this.matchesUser();
    this.ui.openModal('Gem Store', `<div class="gem-store"><p>Gems unlock permanent angler and aquarium styles. Owned styles are free to reuse.</p><p>Balance: 💎 ${this.save.getGemBalance()}</p><div class="gem-package-grid">${GEM_BUNDLES.map(bundle => `<article><h3>${bundle.name}</h3><strong>💎 ${bundle.gems}</strong><p>One-time purchase. Final price shown in Stripe Checkout.</p><button class="btn btn-primary" data-gem-package="${bundle.id}" ${signedIn ? '' : 'disabled'}>Continue to Checkout</button></article>`).join('')}</div><p id="gem-store-status" role="status">${signedIn ? 'Purchases are credited after payment is confirmed.' : 'Sign in to a captain account to purchase gems.'}</p></div>`);
    document.querySelectorAll('[data-gem-package]').forEach(button => button.addEventListener('click', async () => {
      if (this.checkoutBusy) return;
      this.checkoutBusy = true;
      document.querySelectorAll('[data-gem-package]').forEach(item => { item.disabled = true; });
      const status = document.getElementById('gem-store-status');
      status.textContent = 'Opening secure checkout…';
      try {
        await accountManager.syncCloudSave();
        const url = await (await this.backend).startCheckout(button.dataset.gemPackage, this.uid);
        window.location.assign(url);
      } catch (error) {
        status.textContent = error.code === 'functions/failed-precondition' || error.code === 'functions/not-found' ? 'Gem checkout is not configured yet.' : 'Checkout is unavailable. Your gem balance has not changed.';
        document.querySelectorAll('[data-gem-package]').forEach(item => { item.disabled = false; });
        this.checkoutBusy = false;
      }
    }));
  }
}

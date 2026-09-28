// AccountManager.js - User Authentication & Account Management for Starlight Fishing
const ACCOUNTS_STORAGE_KEY = 'ssf_accounts_v1';
const ACTIVE_SESSION_KEY = 'ssf_active_session_v1';
const GUEST_SAVE_KEY = 'seven_seas_fishing_save_v2';

export class AccountManager {
  constructor() {
    this.accounts = this.loadAccounts();
    this.activeUser = this.loadActiveSession();
    this.cloudSession = null;
    this.cloudStatus = 'Local save';
    this.loadCloud = () => import('./CloudAccounts.js');
  }

  loadAccounts() {
    try {
      const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Failed to parse accounts from localStorage:', e);
      return {};
    }
  }

  saveAccounts() {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(this.accounts));
    } catch (e) {
      console.error('Failed to save accounts to localStorage:', e);
    }
  }

  loadActiveSession() {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.username && this.accounts[this.normalizeUsername(parsed.username)]) {
        return parsed.username;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  saveActiveSession(username) {
    try {
      if (username) {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
          username,
          lastActive: Date.now()
        }));
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    } catch (e) {
      console.warn('Failed to save active session:', e);
    }
  }

  normalizeUsername(username) {
    return (username || '').trim().toLowerCase();
  }

  async hashPassword(password) {
    const salt = '_starlight_ocean_secret_salt_';
    const text = password + salt;

    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      try {
        const enc = new TextEncoder().encode(text);
        const buffer = await crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (err) {
        // Fallback to deterministic algorithmic hash if subtle crypto fails
      }
    }

    // High quality deterministic Fowler-Noll-Vo / DJB2 fallback hash
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return 'h_' + (hash >>> 0).toString(16);
  }

  getCurrentUser() {
    return this.activeUser;
  }

  isGuest() {
    return !this.activeUser;
  }

  getSaveKeyForUser(username) {
    if (!username) {
      return GUEST_SAVE_KEY;
    }
    const norm = this.normalizeUsername(username);
    return `ssf_save_user_${norm}`;
  }

  getActiveSaveKey() {
    return this.getSaveKeyForUser(this.activeUser);
  }

  hasAccount(username) {
    const norm = this.normalizeUsername(username);
    return !!this.accounts[norm];
  }

  async register(username, password) {
    const trimmed = (username || '').trim();
    if (!trimmed) {
      return { success: false, message: 'Please enter a username.' };
    }
    if (trimmed.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }
    if (trimmed.length > 20) {
      return { success: false, message: 'Username cannot exceed 20 characters.' };
    }
    if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
      return { success: false, message: 'Username can only contain letters, numbers, spaces, and hyphens.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const norm = this.normalizeUsername(trimmed);
    if (this.accounts[norm]) {
      return { success: false, message: `Account "${trimmed}" already exists. Please log in instead.` };
    }

    const hash = await this.hashPassword(password);
    let cloudUser;
    try {
      cloudUser = await (await this.loadCloud()).authenticate(trimmed, password, true);
    } catch (error) {
      return { success: false, message: this.cloudError(error) };
    }
    this.accounts[norm] = {
      username: trimmed,
      passwordHash: hash,
      cloudUid: cloudUser.uid,
      createdAt: cloudUser.createdAt,
      lastLogin: Date.now(),
    };
    this.saveAccounts();

    this.activeUser = trimmed;
    this.saveActiveSession(trimmed);
    const notice = await this.restoreCloudSave(this.accounts[norm], true);
    return { success: true, username: trimmed, notice };
  }

  async login(username, password) {
    const trimmed = (username || '').trim();
    if (!trimmed) {
      return { success: false, message: 'Please enter your username.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your password.' };
    }

    const norm = this.normalizeUsername(trimmed);
    let account = this.accounts[norm];

    const hash = await this.hashPassword(password);
    if (account && !account.cloudUid && account.passwordHash !== hash) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    try {
      const cloud = await this.loadCloud();
      let user;
      try { user = await cloud.authenticate(trimmed, password); }
      catch (error) {
        if (account && !account.cloudUid && ['auth/invalid-credential', 'auth/user-not-found', 'auth/invalid-login-credentials'].includes(error.code)) {
          user = await cloud.authenticate(trimmed, password, true);
        } else { throw error; }
      }
      account = { ...account, username: user.username, cloudUid: user.uid, passwordHash: hash, createdAt: user.createdAt, lastLogin: Date.now() };
      const hasLocalSave = !!localStorage.getItem(this.getSaveKeyForUser(account.username));
      const notice = await this.restoreCloudSave(account, hasLocalSave);
      if (notice && !hasLocalSave) return { success: false, message: notice };
      this.accounts[norm] = account;
      this.cloudNotice = notice;
    } catch (error) {
      return { success: false, message: this.cloudError(error) };
    }
    account.lastLogin = Date.now();
    this.saveAccounts();

    this.activeUser = account.username;
    this.saveActiveSession(account.username);

    return { success: true, username: account.username, notice: this.cloudNotice };
  }

  cloudError(error) {
    if (error.code === 'auth/email-already-in-use') return 'This username is already registered online. Log in with its password, or choose another name.';
    if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password', 'auth/invalid-login-credentials'].includes(error.code)) return 'Username or password was not recognized online. For an old local account, log in once on the original laptop to migrate it.';
    if (error.code === 'auth/too-many-requests') return 'Too many sign-in attempts. Please wait a moment and try again.';
    return 'Unable to reach online accounts. Check your connection and try again; your local saves are safe.';
  }

  async restoreCloudSave(account, allowLocal = false) {
    this.cloudSession = null;
    const key = this.getSaveKeyForUser(account.username);
    try {
      const cloud = await this.loadCloud();
      const remote = await cloud.readCloudSave(account.cloudUid);
      const local = localStorage.getItem(key);
      let revision = remote?.revision || 0;
      if (remote) {
        const parsed = JSON.parse(remote.snapshot);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid save');
        const lastSyncedRevision = Number(localStorage.getItem(`${key}_cloud_revision`) || -1);
        if (local && local !== remote.snapshot && lastSyncedRevision === revision) {
          revision = await cloud.writeCloudSave(account.cloudUid, local, revision);
        } else {
          if (local && local !== remote.snapshot) localStorage.setItem(`${key}_before_cloud`, local);
          localStorage.setItem(key, remote.snapshot);
        }
      } else if (local) {
        revision = await cloud.writeCloudSave(account.cloudUid, local, 0);
      } else if (!allowLocal) {
        return 'This captain has no cloud save yet. Log in on the original laptop first to upload your progress.';
      }
      this.cloudSession = { uid: account.cloudUid, username: account.username, revision, snapshot: localStorage.getItem(key) };
      localStorage.setItem(`${key}_cloud_revision`, String(revision));
      this.cloudStatus = 'Cloud connected';
      return null;
    } catch {
      this.cloudStatus = 'Cloud unavailable - saved locally';
      return 'Cloud progress could not be loaded. Your local saves are safe. Check your connection and try signing in again.';
    }
  }

  async syncCloudSave() {
    const session = this.cloudSession;
    if (!session || session.username !== this.activeUser || session.busy) return;
    const snapshot = localStorage.getItem(this.getActiveSaveKey());
    if (!snapshot || snapshot === session.snapshot) return;
    session.busy = true;
    try {
      session.revision = await (await this.loadCloud()).writeCloudSave(session.uid, snapshot, session.revision);
      session.snapshot = snapshot;
      localStorage.setItem(`${this.getSaveKeyForUser(session.username)}_cloud_revision`, String(session.revision));
      this.cloudStatus = 'Saved to cloud';
    } catch (error) {
      this.cloudStatus = error.message?.includes('Newer progress') ? error.message : 'Cloud sync failed - saved locally';
    } finally { session.busy = false; }
  }

  continueAsGuest() {
    if (this.activeUser) this.loadCloud().then(cloud => cloud.logoutCloud()).catch(() => {});
    this.cloudSession = null;
    this.activeUser = null;
    this.saveActiveSession(null);
    return { success: true, isGuest: true };
  }

  logout() {
    this.cloudSession = null;
    this.loadCloud().then(cloud => cloud.logoutCloud()).catch(() => {});
    this.activeUser = null;
    this.saveActiveSession(null);
    return { success: true };
  }

  getRegisteredAccounts() {
    return Object.values(this.accounts || {});
  }

  getAccountCount() {
    return Object.keys(this.accounts || {}).length;
  }
}

export const accountManager = new AccountManager();

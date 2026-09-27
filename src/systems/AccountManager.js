// AccountManager.js - User Authentication & Account Management for Starlight Fishing
const ACCOUNTS_STORAGE_KEY = 'ssf_accounts_v1';
const ACTIVE_SESSION_KEY = 'ssf_active_session_v1';
const GUEST_SAVE_KEY = 'seven_seas_fishing_save_v2';

export class AccountManager {
  constructor() {
    this.accounts = this.loadAccounts();
    this.activeUser = this.loadActiveSession();
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
    this.accounts[norm] = {
      username: trimmed,
      passwordHash: hash,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };
    this.saveAccounts();

    this.activeUser = trimmed;
    this.saveActiveSession(trimmed);

    return { success: true, username: trimmed };
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
    const account = this.accounts[norm];
    if (!account) {
      return { success: false, message: `Account "${trimmed}" not found. Please create an account.` };
    }

    const hash = await this.hashPassword(password);
    if (account.passwordHash !== hash) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    account.lastLogin = Date.now();
    this.saveAccounts();

    this.activeUser = account.username;
    this.saveActiveSession(account.username);

    return { success: true, username: account.username };
  }

  continueAsGuest() {
    this.activeUser = null;
    this.saveActiveSession(null);
    return { success: true, isGuest: true };
  }

  logout() {
    this.activeUser = null;
    this.saveActiveSession(null);
    return { success: true };
  }
}

export const accountManager = new AccountManager();

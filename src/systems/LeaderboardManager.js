import { accountManager } from './AccountManager.js';

const safeNumber = (value, max = 1e15) => Number.isFinite(value) ? Math.min(max, Math.max(0, Math.floor(value))) : 0;

async function withTimeout(task) {
  let timer;
  try {
    return await Promise.race([task, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Leaderboard connection timed out')), 10000);
    })]);
  } finally { clearTimeout(timer); }
}

// Deliberately publish only public ranking fields, never saves or passwords.
export function publicScore(account, data) {
  return {
    username: account.username,
    level: safeNumber(data.level, 1000000),
    xp: safeNumber(data.xp),
    coins: safeNumber(data.coins),
    totalGoldEarned: safeNumber(data.stats?.totalGoldEarned),
    totalFishCaught: safeNumber(data.stats?.totalFishCaught),
    maxDepthReached: safeNumber(data.stats?.maxDepthReached),
    createdAt: safeNumber(account.createdAt),
  };
}

export class LeaderboardManager {
  constructor(accounts = accountManager, loadBackend = () => import('./LeaderboardFirebase.js')) {
    this.accounts = accounts;
    this.loadBackend = loadBackend;
    this.published = new Map();
    this.inFlight = new Map();
  }

  currentAccount() {
    const username = this.accounts.getCurrentUser();
    return username && this.accounts.getRegisteredAccounts().find(account =>
      account.username.toLowerCase() === username.toLowerCase());
  }

  async sync(saveSystem) {
    const account = this.currentAccount();
    if (!account) return null; // Guests can read the board, but never publish.
    const key = account.username.toLowerCase();
    const score = publicScore(account, saveSystem.data);
    const signature = JSON.stringify(score);
    const previous = this.published.get(key);
    if (previous?.signature === signature) return previous.id;
    if (this.inFlight.has(key)) {
      await this.inFlight.get(key);
      if (this.accounts.getCurrentUser()?.toLowerCase() !== key) return null;
      return this.sync(saveSystem);
    }
    const task = (async () => {
      const backend = await this.loadBackend();
      const id = await withTimeout(backend.publishScore(key, score));
      this.published.set(key, { signature, id });
      return id;
    })();
    this.inFlight.set(key, task);
    try { return await task; }
    finally { this.inFlight.delete(key); }
  }

  async getBoard(saveSystem, mode = 'level') {
    let syncFailed = false;
    let currentId = null;
    try { currentId = await this.sync(saveSystem); }
    catch {
      syncFailed = true;
      const account = this.currentAccount();
      currentId = account && this.published.get(account.username.toLowerCase())?.id;
    }
    const backend = await this.loadBackend();
    const entries = await withTimeout(backend.readScores(mode === 'money' ? 'money' : 'level'));
    const account = this.currentAccount();
    return {
      entries: entries.map(entry => ({ ...entry, isCurrent: entry.id === currentId })),
      ownScore: account ? publicScore(account, saveSystem.data) : null,
      syncFailed,
      online: true,
    };
  }
}

export const leaderboardManager = new LeaderboardManager();

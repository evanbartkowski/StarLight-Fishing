// WeeklyDerby.js — Synchronized weekly fishing derby challenges & rankings
import { accountManager } from './AccountManager.js';

const WEEK_MS = 7 * 86400000;

export const DERBY_CHALLENGES = [
  {
    id: 'heaviest_catch',
    title: 'Leviathan Scale Derby',
    icon: '⚖️',
    unit: 'kg',
    desc: 'Land the heaviest single catch (kg) in any ocean realm this week!',
  },
  {
    id: 'crown_collector',
    title: 'Royal Crown Derby',
    icon: '👑',
    unit: 'pts',
    desc: 'Score derby points: Rare+ (+1), Silver Crown (+2), Shiny (+3), Gold Crown (+4)!',
  },
  {
    id: 'deep_voyager',
    title: 'Abyssal Sounding Derby',
    icon: '⚓',
    unit: 'pts',
    desc: 'Points equal deepest dive depth (m) plus +20 pts per Rare+ specimen hauled!',
  },
  {
    id: 'golden_haul',
    title: 'Sovereign Haul Derby',
    icon: '💰',
    unit: 'gold',
    desc: 'Achieve the highest single-dive total catch haul value this week!',
  },
];

export function getDerbyWeekId(now = Date.now(), offsetMs = 0) {
  return Math.floor((now + (Number.isFinite(offsetMs) ? offsetMs : 0)) / WEEK_MS);
}

export function getCurrentDerby(now = Date.now(), offsetMs = 0) {
  const weekId = getDerbyWeekId(now, offsetMs);
  const template = DERBY_CHALLENGES[((weekId % DERBY_CHALLENGES.length) + DERBY_CHALLENGES.length) % DERBY_CHALLENGES.length];
  const nextResetMs = (weekId + 1) * WEEK_MS;
  const remainingMs = Math.max(0, nextResetMs - (now + (Number.isFinite(offsetMs) ? offsetMs : 0)));
  const days = Math.floor(remainingMs / 86400000);
  const hours = Math.floor((remainingMs % 86400000) / 3600000);
  const minutes = Math.floor((remainingMs % 3600000) / 60000);
  return { ...template, weekId, remaining: { days, hours, minutes } };
}

export function computeDiveDerbyScore(challengeId, { items = [], maxDepth = 0, haulGold = 0 } = {}) {
  let score = 0;
  let bestCatchName = null;
  if (challengeId === 'heaviest_catch') {
    for (const item of items) {
      const w = Number(item?.weight) || 0;
      if (w > score) {
        score = Math.round(w * 10) / 10;
        bestCatchName = item?.name || 'Big Catch';
      }
    }
  } else if (challengeId === 'crown_collector') {
    for (const item of items) {
      if (!item?.species && !item?.speciesId) continue;
      let pts = 0;
      if (item.crown === 'gold') pts += 4;
      else if (item.crown === 'silver') pts += 2;
      if (item.isShiny) pts += 3;
      if (['rare', 'epic', 'legendary'].includes(item.rarity) || item.isMythic) pts += 1;
      score += pts;
      if (pts > 0 && !bestCatchName) bestCatchName = item.name || null;
    }
  } else if (challengeId === 'deep_voyager') {
    const rareCount = items.filter(i => ['rare', 'epic', 'legendary'].includes(i?.rarity) || i?.isMythic).length;
    score = Math.round(Math.max(0, maxDepth) + rareCount * 20);
  } else {
    score = Math.max(0, Math.round(haulGold));
  }
  return { score, bestCatchName };
}

export function recordDerbyDive(saveSystem, diveData = {}, now = Date.now(), offsetMs = 0) {
  if (!saveSystem?.data) return null;
  const derby = getCurrentDerby(now, offsetMs);
  const { score, bestCatchName } = computeDiveDerbyScore(derby.id, diveData);
  const prev = saveSystem.data.weeklyDerby;
  const sameWeek = prev && prev.weekId === derby.weekId && prev.challengeId === derby.id;

  if (!sameWeek) {
    saveSystem.data.weeklyDerby = {
      weekId: derby.weekId,
      challengeId: derby.id,
      score,
      bestCatchName: bestCatchName || null,
      updatedAt: now,
    };
  } else if (score > (prev.score || 0)) {
    saveSystem.data.weeklyDerby = {
      ...prev,
      score,
      bestCatchName: bestCatchName || prev.bestCatchName || null,
      updatedAt: now,
    };
  }
  if (typeof saveSystem.save === 'function') saveSystem.save();
  return saveSystem.data.weeklyDerby;
}

export function getLocalDerbyStandings(saveSystem, remoteEntries = [], now = Date.now(), offsetMs = 0) {
  const derby = getCurrentDerby(now, offsetMs);
  const byName = new Map();

  for (const row of remoteEntries) {
    if (row?.weeklyDerby?.weekId === derby.weekId && row.weeklyDerby.score > 0) {
      byName.set(String(row.username || '').toLowerCase(), {
        username: row.username,
        score: row.weeklyDerby.score,
        bestCatchName: row.weeklyDerby.bestCatchName || null,
        isCurrent: !!row.isCurrent,
      });
    }
  }

  // Merge local saved accounts so players offline or freshly scored always see their weekly rank
  const currentUser = accountManager.getCurrentUser();
  for (const acc of accountManager.getRegisteredAccounts?.() || []) {
    try {
      const raw = localStorage.getItem(accountManager.getSaveKeyForUser(acc.username));
      const parsed = raw ? JSON.parse(raw) : null;
      const wd = parsed?.weeklyDerby;
      if (wd && wd.weekId === derby.weekId && wd.score > 0) {
        const key = acc.username.toLowerCase();
        const existing = byName.get(key);
        if (!existing || wd.score > existing.score) {
          byName.set(key, {
            username: acc.username,
            score: wd.score,
            bestCatchName: wd.bestCatchName || null,
            isCurrent: !!currentUser && key === currentUser.toLowerCase(),
          });
        }
      }
    } catch (_) {}
  }

  // Also ensure active in-memory saveSystem is reflected immediately
  const own = saveSystem?.data?.weeklyDerby;
  if (currentUser && own?.weekId === derby.weekId && own.score > 0) {
    const key = currentUser.toLowerCase();
    const existing = byName.get(key);
    if (!existing || own.score >= existing.score) {
      byName.set(key, {
        username: currentUser,
        score: own.score,
        bestCatchName: own.bestCatchName || null,
        isCurrent: true,
      });
    }
  }

  const standings = [...byName.values()].sort((a, b) => b.score - a.score);
  return { derby, standings };
}

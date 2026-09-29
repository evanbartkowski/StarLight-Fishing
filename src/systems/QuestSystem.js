// QuestSystem.js — Manages daily noticeboard missions and angler bounty progress
import { QUEST_POOL } from '../data/QuestsData.js';
import { soundManager } from '../audio/SoundManager.js';
import { REALM_PROFILES } from '../data/RealmContent.js';
import { getSeaById } from '../entities/SeasData.js';

const FIXED_REALMS = { reef_angler: 1, kelp_forager: 2, pelagic_trawler: 3, starlight_contract: 3, atlantis_core_contract: 4, void_titan_contract: 7 };
export function questReward(def, realmId) {
  const profile = REALM_PROFILES[realmId] || REALM_PROFILES[1];
  return { ...def, realmId, rewardCoins: Math.round(def.rewardCoins * Math.sqrt(profile.commonValue / 6)), rewardXp: Math.round(def.rewardXp * profile.xpMultiplier) };
}

export class QuestSystem {
  constructor(saveSystem) {
    this.saveSystem = saveSystem;
    this.onQuestCompleted = null;
    this.ensureActiveQuests();
  }

  ensureActiveQuests() {
    if (!this.saveSystem.data.quests) {
      this.saveSystem.data.quests = {
        active: [],
        completedCount: 0,
      };
    }

    const cooldowns = this.saveSystem.data.quests.cooldowns ||= {};
    const currentActive = this.saveSystem.data.quests.active;
    let changed = false;
    for (const state of currentActive) if (!state.realmId) { state.realmId = FIXED_REALMS[state.id] || this.saveSystem.getCurrentSea(); changed = true; }
    // Give the noticeboard one extra mission without replacing saved progress.
    while (currentActive.length < 4) {
      const activeIds = currentActive.map((q) => q.id);
      const available = QUEST_POOL.filter((q) => !activeIds.includes(q.id) && !(cooldowns[q.id] > Date.now()) && (!FIXED_REALMS[q.id] || this.saveSystem.data.unlockedSeas.includes(FIXED_REALMS[q.id])));
      if (available.length === 0) break;

      const randomQuest = available[Math.floor(Math.random() * available.length)];
      changed = true;
      currentActive.push({
        id: randomQuest.id,
        realmId: FIXED_REALMS[randomQuest.id] || this.saveSystem.getCurrentSea(),
        current: 0,
        target: randomQuest.target,
        claimed: false,
      });
    }

    if (changed) this.saveSystem.save();
  }

  getActiveQuests() {
    this.ensureActiveQuests();
    return this.saveSystem.data.quests.active.map((state) => {
      const def = QUEST_POOL.find((q) => q.id === state.id) || QUEST_POOL[0];
      const isComplete = state.current >= state.target;
      return {
        ...questReward(def, state.realmId),
        description: `${def.description} Complete in ${getSeaById(state.realmId)?.name || 'Sunlit Shoals'}.`,
        current: Math.min(state.target, state.current),
        target: state.target,
        isComplete,
        claimed: state.claimed,
      };
    });
  }

  hasUnclaimedRewards() {
    const quests = this.getActiveQuests();
    return quests.some((q) => q.isComplete && !q.claimed);
  }

  dispatch(event) {
    let changed = false;
    const active = this.saveSystem.data.quests.active;

    active.forEach((qState) => {
      if (qState.claimed || qState.realmId !== this.saveSystem.getCurrentSea()) return;
      const def = QUEST_POOL.find((q) => q.id === qState.id);
      if (!def) return;

      const wasComplete = qState.current >= qState.target;
      const newProgress = def.check(event, qState.current);

      if (newProgress !== qState.current) {
        qState.current = newProgress;
        changed = true;

        if (!wasComplete && qState.current >= qState.target) {
          soundManager.playRareChime();
          if (this.onQuestCompleted) {
            this.onQuestCompleted(def);
          }
        }
      }
    });

    if (changed) {
      this.saveSystem.save();
    }
  }

  claimQuest(questId) {
    const active = this.saveSystem.data.quests.active;
    const idx = active.findIndex((q) => q.id === questId);
    if (idx === -1) return null;

    const qState = active[idx];
    const def = QUEST_POOL.find((q) => q.id === qState.id);
    if (!def || qState.current < qState.target || qState.claimed) return null;
    const reward = questReward(def, qState.realmId);
    qState.claimed = true;
    (this.saveSystem.data.quests.cooldowns ||= {})[questId] = Date.now() + 30 * 60 * 1000;

    // Award coins and XP
    this.saveSystem.addCoins(reward.rewardCoins);
    this.saveSystem.addXP(reward.rewardXp);
    this.saveSystem.data.quests.completedCount = (this.saveSystem.data.quests.completedCount || 0) + 1;

    // Remove claimed quest and draw a new one
    active.splice(idx, 1);
    this.ensureActiveQuests();
    this.saveSystem.save();

    soundManager.playUpgrade();
    return reward;
  }
}

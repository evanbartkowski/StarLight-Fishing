// QuestSystem.js — Manages daily noticeboard missions and angler bounty progress
import { QUEST_POOL } from '../data/QuestsData.js';
import { soundManager } from '../audio/SoundManager.js';

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

    const currentActive = this.saveSystem.data.quests.active;
    // Keep 3 active quests at all times
    while (currentActive.length < 3) {
      const activeIds = currentActive.map((q) => q.id);
      const available = QUEST_POOL.filter((q) => !activeIds.includes(q.id));
      if (available.length === 0) break;

      const randomQuest = available[Math.floor(Math.random() * available.length)];
      currentActive.push({
        id: randomQuest.id,
        current: 0,
        target: randomQuest.target,
        claimed: false,
      });
    }

    this.saveSystem.save();
  }

  getActiveQuests() {
    this.ensureActiveQuests();
    return this.saveSystem.data.quests.active.map((state) => {
      const def = QUEST_POOL.find((q) => q.id === state.id) || QUEST_POOL[0];
      const isComplete = state.current >= state.target;
      return {
        ...def,
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
      if (qState.claimed) return;
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

    // Award coins and XP
    this.saveSystem.addCoins(def.rewardCoins);
    this.saveSystem.addXP(def.rewardXp);
    this.saveSystem.data.quests.completedCount = (this.saveSystem.data.quests.completedCount || 0) + 1;

    // Remove claimed quest and draw a new one
    active.splice(idx, 1);
    this.ensureActiveQuests();
    this.saveSystem.save();

    soundManager.playUpgrade();
    return def;
  }
}

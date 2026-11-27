// QuestSystem.js — Manages daily noticeboard missions and angler bounty progress
import { QUEST_POOL, QUEST_UNIQUE_LOOT, getQuestTargetForRealm, getQuestDescriptionForRealm } from '../data/QuestsData.js';
import { CRATE_RANKS } from '../data/CrateData.js';
import { soundManager } from '../audio/SoundManager.js';
import { REALM_PROFILES } from '../data/RealmContent.js';
import { getSeaById } from '../entities/SeasData.js';

const FIXED_REALMS = {
  reef_angler: 1,
  kelp_forager: 2,
  pelagic_trawler: 3,
  starlight_contract: 3,
  atlantis_core_contract: 4,
  aether_skies_contract: 5,
  caldera_lava_contract: 6,
  void_titan_contract: 7,
};

export function questReward(def, realmId, target = null) {
  const profile = REALM_PROFILES[realmId] || REALM_PROFILES[1];
  const realmMultiplier = Math.sqrt(profile.commonValue / 6);
  const xpMult = profile.xpMultiplier || 1;
  const baseCoins = def.rewardCoins || 100;
  const baseXp = def.rewardXp || 50;

  const baseTarget = def.target || 1;
  const effectiveTarget = target || (def.id && getQuestTargetForRealm ? getQuestTargetForRealm(def, realmId) : baseTarget);
  const targetRatio = (def.id === 'deep_sounder' || def.id === 'heavyweight_champ')
    ? 1.0
    : (effectiveTarget && baseTarget) ? Math.max(1, effectiveTarget / baseTarget) : 1;

  const rewardCoins = Math.round(baseCoins * realmMultiplier * (1 + (targetRatio - 1) * 0.45));
  const rewardXp = Math.round(baseXp * xpMult * (1 + (targetRatio - 1) * 0.35));

  // Rare quests award valuable gems!
  const baseGems = def.rewardGems || (def.rarity === 'rare' ? 2 : 0);
  const rewardGems = baseGems ? Math.max(1, Math.round(baseGems * (realmId >= 5 ? 1.5 : 1))) : 0;

  // Deterministic unique useful bounty loot per quest/realm
  let lootSeed = realmId || 1;
  for (let i = 0; i < (def.id || '').length; i++) lootSeed += def.id.charCodeAt(i);
  const template = QUEST_UNIQUE_LOOT[lootSeed % QUEST_UNIQUE_LOOT.length];
  const crateRank = Math.min(5, Math.max(1, Math.ceil((realmId || 1) / 2)));
  const rewardLoot = template
    ? (template.kind === 'crate'
      ? { ...template, crateRank, name: `Rank ${crateRank} ${template.name}`, desc: `Rank ${crateRank} Sealed Crate` }
      : { ...template })
    : null;

  return { ...def, realmId, rewardCoins, rewardXp, rewardGems, rewardLoot };
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
    for (const state of currentActive) {
      if (!state.realmId) {
        state.realmId = FIXED_REALMS[state.id] || this.saveSystem.getCurrentSea();
        changed = true;
      }
      const def = QUEST_POOL.find((q) => q.id === state.id);
      if (def) {
        const expectedTarget = getQuestTargetForRealm(def, state.realmId);
        if (state.id === 'deep_sounder' && state.realmId === 1 && state.target > 40) {
          state.target = expectedTarget;
          changed = true;
        } else if (!state.target) {
          state.target = expectedTarget;
          changed = true;
        }
      }
    }
    // Give the noticeboard missions without replacing saved progress.
    while (currentActive.length < 4) {
      const activeIds = currentActive.map((q) => q.id);
      const available = QUEST_POOL.filter((q) => !activeIds.includes(q.id) && !(cooldowns[q.id] > Date.now()) && (!FIXED_REALMS[q.id] || this.saveSystem.data.unlockedSeas.includes(FIXED_REALMS[q.id])));
      if (available.length === 0) break;

      const randomQuest = available[Math.floor(Math.random() * available.length)];
      changed = true;
      const realmId = FIXED_REALMS[randomQuest.id] || this.saveSystem.getCurrentSea();
      const target = getQuestTargetForRealm(randomQuest, realmId);
      currentActive.push({
        id: randomQuest.id,
        realmId,
        current: 0,
        target,
        claimed: false,
      });
    }

    if (changed) this.saveSystem.save();
  }

  getActiveQuests() {
    this.ensureActiveQuests();
    return this.saveSystem.data.quests.active.map((state) => {
      const def = QUEST_POOL.find((q) => q.id === state.id) || QUEST_POOL[0];
      const target = state.target || getQuestTargetForRealm(def, state.realmId);
      const isComplete = state.current >= target;
      const baseDesc = getQuestDescriptionForRealm(def, state.realmId, target);
      const sea = getSeaById(state.realmId);
      const seaName = sea?.name || 'Sunlit Shoals';
      const seaIcon = sea?.icon || '🏝️';

      const appendSea = !baseDesc.toLowerCase().includes(seaName.toLowerCase()) && !baseDesc.toLowerCase().includes(`sea ${state.realmId}`);
      const description = appendSea ? `${baseDesc} Complete in ${seaName}.` : baseDesc;

      return {
        ...questReward(def, state.realmId, target),
        realmName: seaName,
        realmIcon: seaIcon,
        description,
        current: Math.min(target, state.current),
        target,
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
      const newProgress = def.check(event, qState.current, qState.target, qState.realmId);

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
    const reward = questReward(def, qState.realmId, qState.target);
    qState.claimed = true;
    (this.saveSystem.data.quests.cooldowns ||= {})[questId] = Date.now() + 30 * 60 * 1000;

    // Award coins and XP (and gems for rare quests!)
    this.saveSystem.addCoins(reward.rewardCoins);
    this.saveSystem.addXP(reward.rewardXp);
    if (reward.rewardGems && reward.rewardGems > 0) {
      if (typeof this.saveSystem.addGems === 'function') {
        this.saveSystem.addGems(reward.rewardGems);
      } else {
        this.saveSystem.data.gems = (this.saveSystem.data.gems || 0) + reward.rewardGems;
      }
    }

    // Deliver unique useful quest loot
    const loot = reward.rewardLoot;
    if (loot) {
      if (loot.kind === 'buff') {
        if (typeof this.saveSystem.addBuff === 'function') {
          this.saveSystem.addBuff(loot.buffId, loot.durationMs || 180000);
        } else {
          this.saveSystem.data.buffs ||= {};
          this.saveSystem.data.buffs[loot.buffId] = Date.now() + (loot.durationMs || 180000);
        }
      } else if (loot.kind === 'crate') {
        const rank = loot.crateRank || 1;
        const crateDef = CRATE_RANKS.find(c => c.rank === rank) || CRATE_RANKS[0];
        let stored = false;
        if (crateDef && typeof this.saveSystem.addItemToInventory === 'function' && !this.saveSystem.isInventoryFull?.()) {
          stored = !!this.saveSystem.addItemToInventory({ ...crateDef, isCrate: true, category: 'crate', crateRank: rank, value: 0 });
        }
        if (!stored) {
          this.saveSystem.addCoins(120 * rank);
        }
      } else if (loot.kind === 'coins_bonus') {
        const bonusCoins = Math.max(25, Math.round(reward.rewardCoins * (loot.coinsPct || 0.35)));
        this.saveSystem.addCoins(bonusCoins);
      }
    }
    this.saveSystem.data.quests.completedCount = (this.saveSystem.data.quests.completedCount || 0) + 1;

    // Remove claimed quest and draw a new one
    active.splice(idx, 1);
    this.ensureActiveQuests();
    this.saveSystem.save();

    soundManager.playUpgrade();
    return reward;
  }
}

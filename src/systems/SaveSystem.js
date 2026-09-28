import { ANGLER_OPTIONS, AQUARIUM_OPTIONS, AQUARIUM_PRICES, normalizeCustomization } from '../data/CustomizationData.js';
import { FANTASY_SEAS, canUnlockSea } from '../entities/SeasData.js';
import { TREASURE_ITEMS } from '../data/TreasureData.js';
import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';
import { ACHIEVEMENTS } from '../data/AchievementsData.js';
import { FISH_SPECIES } from '../data/FishData.js';
import { LEGENDARY_SPECIES } from '../data/legendaries.js';
import { calculateGradeTier, claimZonePerk } from '../data/almanac.config.js';
import { accountManager } from './AccountManager.js';

const STORAGE_KEY = 'seven_seas_fishing_save_v2';
const LEGACY_STORAGE_KEY = 'fishing_game_save_v1';

export class SaveSystem {
  constructor() {
    this.storageKey = accountManager.getActiveSaveKey();
    this.data = this.getDefaultData();
    this.onAchievementUnlocked = null; // Callback for toast notification
    this.onLevelUp = null; // Callback for level up notification
  }

  getDefaultData() {
    const upgrades = {};
    Object.keys(UPGRADE_DEFINITIONS).forEach((k) => {
      upgrades[k] = 0;
    });

    return {
      level: 0,
      appearance: normalizeCustomization(ANGLER_OPTIONS),
      xp: 0,
      coins: 0,
      upgrades,
      traps: {
        count: 0, // Starts at 0 until bought in the Tackle Shop
        items: [],
        maxStorage: 0,
      },
      pets: {
        cat: false,
        pelican: false,
        dolphin: false,
        shark: false,
      },
      skeletons: {
        megalodonJaw: 0, // 0 / 4 pieces
        dunkleosteus: 0, // 0 / 4 pieces
        plesiosaur: 0,   // 0 / 4 pieces
      },
      currentSea: 1,
      unlockedSeas: [1],
      currentZone: 'sunken_shallows',
      unlockedZones: ['sunken_shallows'],
      buffs: {},
      stats: {
        totalFishCaught: 0,
        maxDepthReached: 0,
        totalGoldEarned: 0,
        totalTreasureCollected: 0,
        totalFossilsCollected: 0,
        rareFishCaught: 0,
        epicFishCaught: 0,
        legendaryFishCaught: 0,
        mythicsCaught: 0,
        shinyFishCaught: 0,
        goldCrowns: 0,
        silverCrowns: 0,
        totalTrapsHarvested: 0,
        fullHauls: 0,
        perfectDives: 0,
        uniqueSpeciesCaught: 0,
        totalCasts: 0,
        totalCratesOpened: 0,
        biggestCatchCm: 0,
        heaviestCatchKg: 0,
        biggestCatchName: 'None',
        npcInteractionsCount: 0,
        perfectReelsInARow: 0,
        maxPerfectReelStreak: 0,
        seasUnlockedCount: 1,
        legendariesPerSea: {},
      },
      inventory: [],
      aquarium: {
        isUnlocked: false,
        tier: 0,
        maxCapacity: 0,
        theme: 'reef',
        unlockedThemes: ['reef'],
        slottedItemIds: [],
        lastTipCollectedAt: Date.now(),
      },
      unlockedBobbers: ['pelican_bobber'],
      journal: {}, // speciesId -> { count, maxSize, minSize, maxWeight, shinyCount, goldCrown, silverCrown, firstCaughtAt }
      worldTime: 600,
      currentWeather: 'CLEAR',
      zonePerks: {}, // perkId -> true
      aberrations: {}, // speciesId -> count
      journal: {}, // speciesId -> { count, maxSize, minSize, maxWeight, shinyCount, goldCrown, silverCrown, firstCaughtAt, bestGrade, aberrationCount }
      fossils: {}, // fossilId -> { count, firstFoundAt }
      relics: {}, // relicId -> { count, restored: boolean, restoredAt: number }
      achievements: {}, // achId -> { unlocked: boolean, unlockedAt: number }
      settings: {
        musicVolume: 0.5,
        sfxVolume: 0.7,
        isMuted: false,
        hasSeenTutorial: false,
        alwaysAskOnCatch: true,
      },
    };
  }

  getXpRequired(level) {
    const lvl = Math.max(1, level || 1);
    // Rebalanced XP curve: floor(60 * level^1.45)
    return Math.floor(60 * Math.pow(lvl, 1.45));
  }

  addXp(amount) {
    if (!amount || amount <= 0) return;
    this.data.xp += Math.round(amount);

    let xpReq = this.getXpRequired(this.data.level);
    let leveledUp = false;

    while (this.data.xp >= xpReq) {
      this.data.xp -= xpReq;
      this.data.level += 1;
      leveledUp = true;

      if (this.data.level >= 36) this.data.pets.shark = true;

      // Level up cash reward
      const bonusGold = this.data.level * 100;
      this.data.coins += bonusGold;
      this.data.stats.totalGoldEarned += bonusGold;

      if (this.onLevelUp) {
        this.onLevelUp(this.data.level);
      }
      xpReq = this.getXpRequired(this.data.level);
    }

    if (leveledUp) {
      this.checkAchievements();
    }
    this.save();
  }

  addXP(amount) {
    return this.addXp(amount);
  }

  getActiveStorageKey() {
    return this.storageKey;
  }

  getSaveDataForUser(username) {
    try {
      const key = accountManager.getSaveKeyForUser(username);
      let raw = localStorage.getItem(key);
      if (!raw && !username) {
        raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      }
      if (!raw) {
        return { level: 0, coins: 0, speciesCount: 0 };
      }
      const parsed = JSON.parse(raw);
      const journal = parsed.journal || {};
      const speciesCount = Object.keys(journal).filter(k => (journal[k]?.count > 0 || journal[k]?.timesCaught > 0)).length;
      return {
        level: (parsed.level === 1 && (!parsed.xp || parsed.xp === 0) && (!parsed.stats?.totalFishCaught || parsed.stats.totalFishCaught === 0)) ? 0 : Math.max(0, parsed.level ?? 0),
        coins: Math.max(0, parsed.coins || 0),
        speciesCount,
      };
    } catch (e) {
      return { level: 0, coins: 0, speciesCount: 0 };
    }
  }

  getScoreboardData() {
    const registered = accountManager.getRegisteredAccounts();
    const activeUsername = (accountManager.getCurrentUser() || '').toLowerCase();

    return registered.map((acc) => {
      const isCurrent = acc.username.toLowerCase() === activeUsername;
      let level = 0;
      let xp = 0;
      let coins = 0;
      let totalGoldEarned = 0;
      let totalFishCaught = 0;
      let maxDepthReached = 0;
      let goldCrowns = 0;
      let currentSea = 1;

      if (isCurrent) {
        level = Math.max(0, this.data.level ?? 0);
        xp = Math.max(0, this.data.xp || 0);
        coins = Math.max(0, this.data.coins || 0);
        totalGoldEarned = Math.max(0, this.data.stats?.totalGoldEarned ?? coins);
        totalFishCaught = Math.max(0, this.data.stats?.totalFishCaught || 0);
        maxDepthReached = Math.max(0, this.data.stats?.maxDepthReached || 0);
        goldCrowns = Math.max(0, this.data.stats?.goldCrowns || 0);
        currentSea = this.data.currentSea || 1;
      } else {
        try {
          const key = accountManager.getSaveKeyForUser(acc.username);
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            level = Math.max(0, parsed.level ?? 0);
            xp = Math.max(0, parsed.xp || 0);
            coins = Math.max(0, parsed.coins || 0);
            totalGoldEarned = Math.max(0, parsed.stats?.totalGoldEarned ?? coins);
            totalFishCaught = Math.max(0, parsed.stats?.totalFishCaught || 0);
            maxDepthReached = Math.max(0, parsed.stats?.maxDepthReached || 0);
            goldCrowns = Math.max(0, parsed.stats?.goldCrowns || 0);
            currentSea = parsed.currentSea || 1;
          }
        } catch (e) {
          console.warn('Error reading score data for user', acc.username, e);
        }
      }

      return {
        username: acc.username,
        level,
        xp,
        coins,
        totalGoldEarned,
        totalFishCaught,
        maxDepthReached,
        goldCrowns,
        currentSea,
        createdAt: acc.createdAt || Date.now(),
        isCurrent,
      };
    });
  }

  switchToAccount(username) {
    if (username) {
      accountManager.activeUser = username;
      accountManager.saveActiveSession(username);
    } else {
      accountManager.continueAsGuest();
    }
    return this.load();
  }

  load() {
    try {
      this.storageKey = accountManager.getActiveSaveKey();
      const storageKey = this.getActiveStorageKey();
      let raw = localStorage.getItem(storageKey);
      if (!raw && accountManager.isGuest()) {
        // Try importing legacy save if present for guest
        raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      }

      if (!raw) {
        this.data = this.getDefaultData();
        return this.data;
      }

      const parsed = JSON.parse(raw);
      const def = this.getDefaultData();

      // Deep merge with defaults to avoid null references
      this.data = {
        ...def,
        ...parsed,
        level: (parsed.level === 1 && (!parsed.xp || parsed.xp === 0) && (!parsed.stats?.totalFishCaught || parsed.stats.totalFishCaught === 0)) ? 0 : Math.max(0, parsed.level ?? 0),
        xp: Math.max(0, parsed.xp || 0),
        coins: Math.max(0, parsed.coins || 0),
        upgrades: { ...def.upgrades, ...(parsed.upgrades || {}) },
        traps: { ...def.traps, ...(parsed.traps || {}) },
        pets: { ...def.pets, ...(parsed.pets || {}) },
        skeletons: { ...def.skeletons, ...(parsed.skeletons || {}) },
        stats: { ...def.stats, ...(parsed.stats || {}) },
        unlockedBobbers: parsed.unlockedBobbers || def.unlockedBobbers || ['pelican_bobber'],
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
        aquarium: {
          ...def.aquarium,
          ...(parsed.aquarium || {}),
          slottedItemIds: Array.isArray(parsed.aquarium?.slottedItemIds) ? parsed.aquarium.slottedItemIds : [],
          unlockedThemes: Array.isArray(parsed.aquarium?.unlockedThemes) ? parsed.aquarium.unlockedThemes : ['reef'],
        },
        journal: parsed.journal || {},
        fossils: parsed.fossils || {},
        relics: parsed.relics || {},
        achievements: parsed.achievements || {},
        currentZone: parsed.currentZone || 'sunken_shallows',
        unlockedZones: (Array.isArray(parsed.unlockedZones) && parsed.unlockedZones.length > 0) ? parsed.unlockedZones : ['sunken_shallows'],
        worldTime: typeof parsed.worldTime === 'number' ? parsed.worldTime : 600,
        currentWeather: parsed.currentWeather || 'CLEAR',
        zonePerks: parsed.zonePerks || {},
        aberrations: parsed.aberrations || {},
        settings: { ...def.settings, ...(parsed.settings || {}) },
      };

      if (this.data.level >= 36) this.data.pets.shark = true;

      // Recalculate unique species count and fossils count
      this.data.stats.uniqueSpeciesCaught = Object.keys(this.data.journal).length;
      this.data.stats.totalFossilsCollected = Object.keys(this.data.fossils).length;

      // Sync traps count & capacity strictly with seabedTraps upgrade level
      const trapLvl = this.getUpgradeLevel('seabedTraps');
      const trapTier = UPGRADE_DEFINITIONS.seabedTraps.tiers[trapLvl] || UPGRADE_DEFINITIONS.seabedTraps.tiers[0];
      this.data.traps.count = trapTier.trapCount || 0;
      this.data.traps.maxStorage = trapTier.maxStorage || 0;

      // Sync aquarium capacity & unlocked state with personalAquarium upgrade
      const aqLvl = this.getUpgradeLevel('personalAquarium');
      const aqTier = UPGRADE_DEFINITIONS.personalAquarium?.tiers[aqLvl] || UPGRADE_DEFINITIONS.personalAquarium?.tiers[0];
      this.data.aquarium.isUnlocked = aqLvl > 0;
      this.data.aquarium.tier = aqLvl;
      this.data.aquarium.maxCapacity = aqTier?.capacity || 0;
    } catch (e) {
      console.error('Failed to load save game:', e);
      this.data = this.getDefaultData();
    }
    return this.data;
  }

  save() {
    try {
      const storageKey = this.getActiveStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save game to localStorage:', e);
    }
  }

  reset() {
    try {
      const storageKey = this.getActiveStorageKey();
      localStorage.removeItem(storageKey);
      if (accountManager.isGuest()) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
      this.data = this.getDefaultData();
      this.save();
    } catch (e) {
      console.error('Failed to reset save game:', e);
    }
  }

  addCoins(amount) {
    const val = Math.max(0, Math.round(amount));
    this.data.coins += val;
    this.data.stats.totalGoldEarned += val;
    this.checkAchievements();
    this.save();
  }

  adjustCoins(amount) {
    const val = Math.round(amount || 0);
    if (val >= 0) {
      this.addCoins(val);
    } else {
      this.data.coins = Math.max(0, this.data.coins + val);
      this.save();
    }
  }

  awardSkeletonPiece(targetKey = null) {
    if (!this.data.skeletons) {
      this.data.skeletons = { megalodonJaw: 0, dunkleosteus: 0, plesiosaur: 0 };
    }
    const keys = ['megalodonJaw', 'dunkleosteus', 'plesiosaur'];
    let chosen = targetKey && keys.includes(targetKey) ? targetKey : null;
    if (!chosen) {
      const incomplete = keys.filter((k) => (this.data.skeletons[k] || 0) < 4);
      chosen = incomplete.length > 0 ? incomplete[Math.floor(Math.random() * incomplete.length)] : keys[0];
    }
    if ((this.data.skeletons[chosen] || 0) < 4) {
      this.data.skeletons[chosen] = (this.data.skeletons[chosen] || 0) + 1;
      this.save();
      return { target: chosen, count: this.data.skeletons[chosen], completed: this.data.skeletons[chosen] >= 4 };
    }
    return { target: chosen, count: 4, completed: true };
  }

  spendCoins(amount) {
    if (this.data.coins >= amount) {
      this.data.coins -= amount;
      this.save();
      return true;
    }
    return false;
  }

  getUpgradeLevel(key) {
    return this.data.upgrades[key] ?? 0;
  }

  setUpgradeLevel(key, level) {
    this.data.upgrades[key] = level;
    if (key === 'personalAquarium') {
      const tier = UPGRADE_DEFINITIONS.personalAquarium?.tiers[level] || UPGRADE_DEFINITIONS.personalAquarium?.tiers[0];
      if (!this.data.aquarium) {
        this.data.aquarium = { theme: 'reef', unlockedThemes: ['reef'], slottedItemIds: [] };
      }
      this.data.aquarium.isUnlocked = level > 0;
      this.data.aquarium.tier = level;
      this.data.aquarium.maxCapacity = tier?.capacity || 0;
    }
    this.save();
  }

  recordDiveStats({ maxDepth, tookDamage }) {
    if (maxDepth > this.data.stats.maxDepthReached) {
      this.data.stats.maxDepthReached = Math.round(maxDepth);
    }
    this.data.stats.totalCasts += 1;
    if (maxDepth >= 80 && !tookDamage) {
      this.data.stats.perfectDives += 1;
    }

    if (!tookDamage) {
      this.recordPerfectReel();
    } else {
      this.breakPerfectReelStreak();
    }

    // Award depth exploration XP
    const depthXp = Math.round(maxDepth * 0.45);
    this.addXp(depthXp);

    this.checkAchievements();
    this.save();
  }

  recordCatchItem(item) {
    if (item.isCrate || item.category === 'crate') {
      return;
    }

    const isFossil = item.category === 'fossil';
    const isTreasure = item.isTreasure || item.category === 'treasure';

    if (item.isRelic) {
      if (!this.data.relics) this.data.relics = {};
      if (!this.data.relics[item.id]) {
        this.data.relics[item.id] = {
          count: 0,
          restored: item.restored || false,
          firstFoundAt: Date.now(),
        };
      }
      this.data.relics[item.id].count += 1;
      if (item.restored) {
        this.data.relics[item.id].restored = true;
      }
      this.addXp(180);
    } else if (isFossil) {
      if (!this.data.fossils[item.id]) {
        this.data.fossils[item.id] = {
          count: 0,
          firstFoundAt: Date.now(),
        };
      }
      this.data.fossils[item.id].count += 1;
      this.data.stats.totalFossilsCollected = Object.keys(this.data.fossils).length;

      // 30% chance a deep fossil find also grants a skeleton bone piece
      if (Math.random() < 0.35) {
        if (!this.data.skeletons) this.data.skeletons = { megalodonJaw: 0, dunkleosteus: 0, plesiosaur: 0 };
        const keys = ['megalodonJaw', 'dunkleosteus', 'plesiosaur'];
        const randomTarget = keys[Math.floor(Math.random() * keys.length)];
        if (this.data.skeletons[randomTarget] < 4) {
          this.data.skeletons[randomTarget] += 1;
        }
      }

      this.addXp(140);
    } else if (isTreasure) {
      this.data.stats.totalTreasureCollected += 1;
      this.addXp(40);
    } else {
      // Fish catch
      this.data.stats.totalFishCaught += 1;

      let xpGain = 25;
      if (item.rarity === 'uncommon') {
        xpGain = 45;
      } else if (item.rarity === 'rare') {
        this.data.stats.rareFishCaught += 1;
        xpGain = 90;
      } else if (item.rarity === 'epic') {
        this.data.stats.epicFishCaught += 1;
        xpGain = 200;
      } else if (item.rarity === 'legendary') {
        this.data.stats.legendaryFishCaught += 1;
        xpGain = 600;
      }

      if (item.isMythic) {
        this.data.stats.mythicsCaught = (this.data.stats.mythicsCaught || 0) + 1;
        xpGain += 400;
      }

      if (item.isShiny) {
        this.data.stats.shinyFishCaught += 1;
        xpGain += 120;
      }

      if (item.crown === 'gold') {
        this.data.stats.goldCrowns = (this.data.stats.goldCrowns || 0) + 1;
        xpGain += 150;
      } else if (item.crown === 'silver') {
        this.data.stats.silverCrowns = (this.data.stats.silverCrowns || 0) + 1;
        xpGain += 75;
      }

      this.addXp(Math.round(xpGain * (item.species?.xpMultiplier || 1)));

      // Grade evaluation
      if (!item.gradeTier && item.species) {
        item.gradeTier = calculateGradeTier(item.species, item.size, item.weight);
      }

      // Aberration tracking
      if (item.isAberration) {
        if (!this.data.aberrations) this.data.aberrations = {};
        this.data.aberrations[item.speciesId] = (this.data.aberrations[item.speciesId] || 0) + 1;
      }

      // Journal entry
      const id = item.speciesId || item.id;
      if (!this.data.journal[id]) {
        this.data.journal[id] = {
          count: 0,
          timesCaught: 0,
          maxSize: item.size || 0,
          minSize: item.size || 0,
          maxWeight: item.weight || 0,
          recordWeight: item.weight || 0,
          recordLength: item.size || 0,
          shinyCount: 0,
          goldCrown: false,
          silverCrown: false,
          bestGrade: item.gradeTier?.id || 'Average',
          aberrationCount: 0,
          firstCaughtAt: Date.now(),
        };
      }

      const entry = this.data.journal[id];
      entry.count += 1;
      entry.timesCaught = entry.count;

      if (!entry.maxSize || item.size > entry.maxSize) entry.maxSize = item.size;
      if (!entry.maxSize || item.size > entry.maxSize) {
        entry.maxSize = item.size;
        entry.recordLength = item.size;
      }
      if (!entry.minSize || item.size < entry.minSize) entry.minSize = item.size;
      if (!entry.maxWeight || item.weight > entry.maxWeight) entry.maxWeight = item.weight;
      if (!entry.maxWeight || item.weight > entry.maxWeight) {
        entry.maxWeight = item.weight;
        entry.recordWeight = item.weight;
      }
      if (item.isShiny) entry.shinyCount += 1;
      if (item.crown === 'gold') entry.goldCrown = true;
      if (item.crown === 'silver') entry.silverCrown = true;
      if (item.isAberration) entry.aberrationCount = (entry.aberrationCount || 0) + 1;

      // Grade hierarchy: Monster > Trophy > Average > Small
      const gradeRank = { Monster: 4, Trophy: 3, Average: 2, Small: 1 };
      const currentRank = gradeRank[entry.bestGrade] || 2;
      const newRank = gradeRank[item.gradeTier?.id] || 2;
      if (newRank > currentRank) {
        entry.bestGrade = item.gradeTier?.id || 'Average';
      }

      this.data.stats.uniqueSpeciesCaught = Object.keys(this.data.journal).length;

      // Record biggest catch record
      if (item.size > this.data.stats.biggestCatchCm) {
        this.data.stats.biggestCatchCm = item.size;
        this.data.stats.biggestCatchName = item.name;
      }
      if (item.weight > this.data.stats.heaviestCatchKg) {
        this.data.stats.heaviestCatchKg = item.weight;
      }
    }

    this.checkAchievements();
    this.save();
  }

  hasZonePerk(perkId) {
    return !!(this.data.zonePerks && this.data.zonePerks[perkId]);
  }

  claimZonePerk(zoneId) {
    return claimZonePerk(zoneId, this);
  }

  recordFullHaul() {
    this.data.stats.fullHauls += 1;
    this.addXp(60);
    this.checkAchievements();
    this.save();
  }

  checkAchievements() {
    ACHIEVEMENTS.forEach((ach) => {
      if (!this.data.achievements[ach.id]) {
        if (ach.check(this.data.stats, this.data)) {
          this.data.achievements[ach.id] = {
            unlocked: true,
            unlockedAt: Date.now(),
          };
          this.data.coins += ach.reward;
          if (this.onAchievementUnlocked) {
            this.onAchievementUnlocked(ach);
          }
        }
      }
    });
  }

  isAchievementUnlocked(id) {
    return !!this.data.achievements[id]?.unlocked;
  }

  isSpeciesCaught(id) {
    return !!this.data.journal[id];
  }

  getSpeciesJournalEntry(id) {
    return this.data.journal[id] || null;
  }

  hasPet(petId) {
    return !!this.data.pets?.[petId];
  }

  isPetEquipped(petId) {
    return this.hasPet(petId) && this.data.petEquipment?.[petId] !== false;
  }

  setPetEquipped(petId, equipped) {
    if (!this.hasPet(petId)) return false;
    this.data.petEquipment ||= {};
    this.data.petEquipment[petId] = !!equipped;
    this.save();
    return true;
  }

  unlockPet(petId) {
    if (!this.data.pets) {
      this.data.pets = { cat: false, pelican: false, dolphin: false, shark: false };
    }
    if (!this.data.pets[petId]) {
      this.data.pets[petId] = true;
      this.save();
      return true;
    }
    return false;
  }

  // --- Fantasy Seas & Chart Navigation ---
  getCurrentSea() {
    return this.data.currentSea || 1;
  }

  setCurrentSea(seaId) {
    const id = parseInt(seaId, 10) || 1;
    if (this.isSeaUnlocked(id)) {
      this.data.currentSea = id;
      this.save();
      return true;
    }
    return false;
  }

  isSeaUnlocked(seaId) {
    const id = parseInt(seaId, 10) || 1;
    if (id === 1) return true;
    return Array.isArray(this.data.unlockedSeas) && this.data.unlockedSeas.includes(id);
  }

  unlockSea(seaId) {
    const id = parseInt(seaId, 10) || 1;
    if (this.isSeaUnlocked(id)) return true;
    const sea = FANTASY_SEAS.find(entry => entry.id === id);
    if (!sea || !canUnlockSea(sea, this).canUnlock) return false;
    if (!this.spendCoins(sea.gates.unlockFee)) return false;
    if (!Array.isArray(this.data.unlockedSeas)) {
      this.data.unlockedSeas = [1];
    }
    this.data.unlockedSeas.push(id);
    this.data.stats.seasUnlockedCount = this.data.unlockedSeas.length;
    this.checkAchievements();
    this.save();
    return true;
  }

  isMinimapUnlocked() {
    return (this.data.level >= 4) && (this.getUpgradeLevel('nauticalAstrolabe') >= 1);
  }

  isChatUnlocked() {
    return this.getUpgradeLevel('maritimeRadio') >= 1;
  }

  recordNPCInteraction() {
    this.data.stats.npcInteractionsCount = (this.data.stats.npcInteractionsCount || 0) + 1;
    this.checkAchievements();
    this.save();
  }

  recordPerfectReel() {
    this.data.stats.perfectReelsInARow = (this.data.stats.perfectReelsInARow || 0) + 1;
    if (this.data.stats.perfectReelsInARow > (this.data.stats.maxPerfectReelStreak || 0)) {
      this.data.stats.maxPerfectReelStreak = this.data.stats.perfectReelsInARow;
    }
    this.checkAchievements();
    this.save();
  }

  breakPerfectReelStreak() {
    this.data.stats.perfectReelsInARow = 0;
  }

  addBuff(buffId, durationMs) {
    if (!this.data.buffs) this.data.buffs = {};
    this.data.buffs[buffId] = Date.now() + durationMs;
    this.save();
  }

  hasActiveBuff(buffId) {
    if (!this.data.buffs || !this.data.buffs[buffId]) return false;
    return Date.now() < this.data.buffs[buffId];
  }

  getBuffRemainingSeconds(buffId) {
    if (!this.hasActiveBuff(buffId)) return 0;
    return Math.max(0, Math.ceil((this.data.buffs[buffId] - Date.now()) / 1000));
  }

  // --- Inventory Management ---
  getInventory() {
    if (!Array.isArray(this.data.inventory)) {
      this.data.inventory = [];
    }
    // Recover crate metadata for catches saved before inventory supported opening.
    for (const item of this.data.inventory) {
      const definition = TREASURE_ITEMS.find(entry => entry.id === item.id && entry.isCrate);
      if (definition && item.isCrate === undefined) {
        item.isCrate = true;
        item.crateRank = definition.crateRank;
        item.unboxed = item.value === 0;
      }
    }
    return this.data.inventory;
  }

  createInventoryItem(item) {
    const instanceId = 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const isCrate = !!item.isCrate || item.category === 'crate';
    const isRelic = !!item.isRelic;
    const isFossil = item.category === 'fossil';
    const isTreasure = (item.isTreasure || item.category === 'treasure') && !isCrate;

    let type = 'fish';
    if (isRelic) type = 'relic';
    else if (isFossil || isTreasure || isCrate) type = 'trinket';

    return {
      instanceId,
      isCrate,
      category: item.category,
      crateRank: item.crateRank || 1,
      rewardMultiplier: item.rewardMultiplier || 1,
      zone: item.zone || item.species?.zone,
      unboxed: !!item.unboxed,
      id: item.id || item.speciesId || 'item',
      speciesId: item.species?.id || item.speciesId || item.id || null,
      name: item.name || 'Mysterious Catch',
      type,
      rarity: item.rarity || 'common',
      size: item.size || 0,
      weight: item.weight || 0,
      value: item.value || 0,
      sellValue: item.sellValue || item.value || 0,
      icon: isCrate ? (item.loot?.icon || '📦') : isRelic ? (item.icon || '🏺') : isFossil ? '🦴' : isTreasure ? '💎' : (item.isMythic ? '🌟' : '🐟'),
      primaryColor: item.primaryColor || item.species?.primaryColor || '#38bdf8',
      finColor: item.finColor || item.species?.finColor || '#0284c7',
      scaleFactor: item.scaleFactor || item.scale || 1.0,
      isShiny: !!item.isShiny,
      crown: item.crown || null,
      isMythic: !!item.isMythic,
      lore: item.lore || item.species?.lore || '',
      isLocked: item.isLocked !== undefined ? !!item.isLocked : (item.rarity === 'legendary' || item.rarity === 'mythic' || !!item.isMythic),
      caughtAt: Date.now(),
      era: item.relicType?.era || item.era || null,
      restored: !!item.restored,
    };
  }

  getInventoryCapacity() {
    const lvl = this.getUpgradeLevel('tackleBox') || 0;
    const tier = UPGRADE_DEFINITIONS.tackleBox?.tiers[lvl] || UPGRADE_DEFINITIONS.tackleBox?.tiers[0];
    return tier?.capacity || 15;
  }

  isInventoryFull() {
    return this.getInventory().length >= this.getInventoryCapacity();
  }

  addItemToInventory(item) {
    if (!Array.isArray(this.data.inventory)) {
      this.data.inventory = [];
    }
    const cap = this.getInventoryCapacity();
    if (this.data.inventory.length >= cap) {
      return null;
    }
    const invItem = item.instanceId ? item : this.createInventoryItem(item);
    if (invItem.rarity === 'legendary' || invItem.rarity === 'mythic' || invItem.isMythic) {
      invItem.isLocked = true;
    }
    this.data.inventory.push(invItem);
    this.save();
    return invItem;
  }

  removeItemFromInventory(instanceId) {
    const inv = this.getInventory();
    const idx = inv.findIndex((i) => i.instanceId === instanceId);
    if (idx !== -1) {
      if (this.isItemInAquarium(instanceId)) this.accrueVisitorTips();
      const removed = inv.splice(idx, 1)[0];
      // Also remove from aquarium if it was slotted
      if (this.data.aquarium?.slottedItemIds) {
        this.data.aquarium.slottedItemIds = this.data.aquarium.slottedItemIds.filter((id) => id !== instanceId);
      }
      this.save();
      return removed;
    }
    return null;
  }

  toggleItemLock(instanceId) {
    const item = this.getInventory().find((i) => i.instanceId === instanceId);
    if (item) {
      item.isLocked = !item.isLocked;
      this.save();
      return item.isLocked;
    }
    return false;
  }

  sellInventoryItem(instanceId, multiplier = 1) {
    const item = this.getInventory().find((i) => i.instanceId === instanceId);
    if (!item) return null;
    if (item.isLocked) return null;
    if (this.isItemInAquarium(instanceId)) return null;

    const gold = Math.max(1, Math.round(item.value * multiplier));
    this.removeItemFromInventory(instanceId);
    this.addCoins(gold);
    return { item, gold };
  }

  sellAllItems(multiplier = 1) {
    const inv = this.getInventory();
    const itemsToSell = inv.filter((item) =>
      !item.isLocked && !this.isItemInAquarium(item.instanceId)
    );

    if (itemsToSell.length === 0) {
      return { count: 0, totalGold: 0 };
    }

    let totalGold = 0;
    const sellIds = new Set(itemsToSell.map((f) => f.instanceId));

    itemsToSell.forEach((f) => {
      totalGold += Math.max(1, Math.round(f.value * multiplier));
    });

    this.data.inventory = inv.filter((i) => !sellIds.has(i.instanceId));
    this.addCoins(totalGold);
    this.save();
    return { count: itemsToSell.length, totalGold };
  }

  sellAllFish(multiplier = 1) {
    return this.sellAllItems(multiplier);
  }

  // --- Aquarium Management ---
  hasAquarium() {
    return this.getUpgradeLevel('personalAquarium') > 0 || !!this.data.aquarium?.isUnlocked;
  }

  getAquariumCapacity() {
    const lvl = this.getUpgradeLevel('personalAquarium');
    const tier = UPGRADE_DEFINITIONS.personalAquarium?.tiers[lvl] || UPGRADE_DEFINITIONS.personalAquarium?.tiers[0];
    return tier?.capacity || this.data.aquarium?.maxCapacity || 0;
  }

  isItemInAquarium(instanceId) {
    return !!(this.data.aquarium?.slottedItemIds?.includes(instanceId));
  }

  getAquariumItems() {
    const ids = this.data.aquarium?.slottedItemIds || [];
    const inv = this.getInventory();
    return ids.map((id) => inv.find((item) => item.instanceId === id)).filter(Boolean);
  }

  moveItemToAquarium(instanceId) {
    if (!this.hasAquarium()) return { success: false, reason: 'unlocked' };
    const capacity = this.getAquariumCapacity();
    if (!this.data.aquarium.slottedItemIds) this.data.aquarium.slottedItemIds = [];
    if (this.data.aquarium.slottedItemIds.length >= capacity) {
      return { success: false, reason: 'full' };
    }
    if (this.data.aquarium.slottedItemIds.includes(instanceId)) {
      return { success: false, reason: 'already_slotted' };
    }
    const item = this.getInventory().find((i) => i.instanceId === instanceId);
    if (!item) return { success: false, reason: 'not_found' };
    if (item.isCrate) return { success: false, reason: 'Open or sell this crate first' };

    this.accrueVisitorTips();
    this.data.aquarium.slottedItemIds.push(instanceId);
    this.save();
    return { success: true, item };
  }

  removeItemFromAquarium(instanceId) {
    if (!this.data.aquarium?.slottedItemIds) return false;
    this.accrueVisitorTips();
    const initialLen = this.data.aquarium.slottedItemIds.length;
    this.data.aquarium.slottedItemIds = this.data.aquarium.slottedItemIds.filter((id) => id !== instanceId);
    if (this.data.aquarium.slottedItemIds.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  setAppearance(key, value) {
    this.data.appearance = normalizeCustomization(ANGLER_OPTIONS, { ...this.data.appearance, [key]: value });
    this.save();
  }

  setAquariumDecoration(key, value) {
    if (!this.purchaseAquariumStyle(key, value)) return false;
    this.data.aquarium.decor = normalizeCustomization(AQUARIUM_OPTIONS, { ...this.data.aquarium.decor, [key]: value });
    this.save();
    return true;
  }

  getAquariumStyleCost(key, value) {
    if (!Object.hasOwn(AQUARIUM_PRICES, key) || !Object.hasOwn(AQUARIUM_PRICES[key], value)) return null;
    const aquarium = this.data.aquarium;
    const current = key === 'theme' ? aquarium.theme || 'reef' : aquarium.decor?.[key] || AQUARIUM_OPTIONS[key]?.default;
    return current === value || aquarium.ownedStyles?.includes(`${key}:${value}`) ? 0 : AQUARIUM_PRICES[key][value];
  }

  purchaseAquariumStyle(key, value) {
    const cost = this.getAquariumStyleCost(key, value);
    if (cost === null || !this.hasAquarium() || this.data.coins < cost) return false;
    const aquarium = this.data.aquarium;
    aquarium.ownedStyles ||= [];
    const previous = key === 'theme' ? aquarium.theme || 'reef' : aquarium.decor?.[key] || AQUARIUM_OPTIONS[key]?.default;
    for (const item of [`${key}:${previous}`, `${key}:${value}`]) {
      if (!aquarium.ownedStyles.includes(item)) aquarium.ownedStyles.push(item);
    }
    this.data.coins -= cost;
    return true;
  }

  feedAquarium() {
    if (!this.hasAquarium() || this.data.coins < 1) return false;
    this.data.coins -= 1;
    this.save();
    return true;
  }

  setAquariumTheme(themeId) {
    if (!this.purchaseAquariumStyle('theme', themeId)) return false;
    this.data.aquarium.theme = themeId;
    this.save();
    return true;
  }

  getVisitorTipRate() {
    if (!this.hasAquarium()) return 0;
    const rates = { common: 3, uncommon: 5, rare: 9, epic: 18, legendary: 32, mythic: 52 };
    return this.getAquariumItems().reduce((total, fish) => {
      if (fish.type !== 'fish') return total;
      let rate = rates[fish.rarity] ?? rates.common;
      if (fish.isMythic) rate = Math.max(rate, rates.mythic);
      if (fish.isShiny) rate += 10;
      return total + rate;
    }, 0);
  }

  getPendingVisitorTips() {
    if (!this.hasAquarium()) return 0;
    return this.data.aquarium?.bankedVisitorTips || 0;
  }

  accrueVisitorTips() {
    if (!this.hasAquarium()) return;
    const tier = Math.max(1, this.getUpgradeLevel('personalAquarium') || 1);
    const maxTipCap = tier * 750;
    if ((this.data.aquarium.bankedVisitorTips || 0) > maxTipCap) {
      this.data.aquarium.bankedVisitorTips = maxTipCap;
    }
  }

  updateAquariumPlaytime(deltaSec) {
    if (!this.hasAquarium() || !deltaSec || deltaSec <= 0) return;
    const ratePerMin = this.getVisitorTipRate();
    if (ratePerMin <= 0) return;
    const tier = Math.max(1, this.getUpgradeLevel('personalAquarium') || 1);
    const maxTipCap = tier * 750;

    const current = this.data.aquarium.bankedVisitorTips || 0;
    if (current >= maxTipCap) return;

    // Tips accumulate strictly while playing the game
    const tipsToAdd = (ratePerMin / 60) * deltaSec;
    this.data.aquarium.bankedVisitorTips = Math.min(maxTipCap, current + tipsToAdd);
  }

  calculatePendingVisitorTips() {
    return Math.floor(this.getPendingVisitorTips());
  }

  collectVisitorTips() {
    const tips = this.calculatePendingVisitorTips();
    if (tips > 0) {
      this.data.aquarium.bankedVisitorTips = Math.max(0, (this.data.aquarium.bankedVisitorTips || 0) - tips);
      this.addCoins(tips);
      this.save();
    }
    return tips;
  }
}

export const saveSystem = new SaveSystem();


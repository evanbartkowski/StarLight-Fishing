import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';
import { ACHIEVEMENTS } from '../data/AchievementsData.js';
import { FISH_SPECIES } from '../data/FishData.js';
import { LEGENDARY_SPECIES } from '../data/legendaries.js';

const STORAGE_KEY = 'seven_seas_fishing_save_v2';
const LEGACY_STORAGE_KEY = 'fishing_game_save_v1';

export class SaveSystem {
  constructor() {
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
      level: 1,
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
      },
      skeletons: {
        megalodonJaw: 0, // 0 / 4 pieces
        dunkleosteus: 0, // 0 / 4 pieces
        plesiosaur: 0,   // 0 / 4 pieces
      },
      currentSea: 1,
      unlockedSeas: [1],
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
      unlockedBobbers: ['pelican_bobber'],
      journal: {}, // speciesId -> { count, maxSize, minSize, maxWeight, shinyCount, goldCrown, silverCrown, firstCaughtAt }
      fossils: {}, // fossilId -> { count, firstFoundAt }
      relics: {}, // relicId -> { count, restored: boolean, restoredAt: number }
      achievements: {}, // achId -> { unlocked: boolean, unlockedAt: number }
      settings: {
        musicVolume: 0.5,
        sfxVolume: 0.7,
        isMuted: false,
        hasSeenTutorial: false,
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

  load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Try importing legacy save if present
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
        level: Math.max(1, parsed.level || 1),
        xp: Math.max(0, parsed.xp || 0),
        coins: Math.max(0, parsed.coins || 0),
        upgrades: { ...def.upgrades, ...(parsed.upgrades || {}) },
        traps: { ...def.traps, ...(parsed.traps || {}) },
        pets: { ...def.pets, ...(parsed.pets || {}) },
        skeletons: { ...def.skeletons, ...(parsed.skeletons || {}) },
        stats: { ...def.stats, ...(parsed.stats || {}) },
        unlockedBobbers: parsed.unlockedBobbers || def.unlockedBobbers || ['pelican_bobber'],
        journal: parsed.journal || {},
        fossils: parsed.fossils || {},
        relics: parsed.relics || {},
        achievements: parsed.achievements || {},
        settings: { ...def.settings, ...(parsed.settings || {}) },
      };

      // Recalculate unique species count and fossils count
      this.data.stats.uniqueSpeciesCaught = Object.keys(this.data.journal).length;
      this.data.stats.totalFossilsCollected = Object.keys(this.data.fossils).length;

      // Sync traps count & capacity strictly with seabedTraps upgrade level
      const trapLvl = this.getUpgradeLevel('seabedTraps');
      const trapTier = UPGRADE_DEFINITIONS.seabedTraps.tiers[trapLvl] || UPGRADE_DEFINITIONS.seabedTraps.tiers[0];
      this.data.traps.count = trapTier.trapCount || 0;
      this.data.traps.maxStorage = trapTier.maxStorage || 0;
    } catch (e) {
      console.error('Failed to load save game:', e);
      this.data = this.getDefaultData();
    }
    return this.data;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save game to localStorage:', e);
    }
  }

  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
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
      this.data.stats.totalCratesOpened = (this.data.stats.totalCratesOpened || 0) + 1;
      this.save();
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

      this.addXp(xpGain);

      // Journal entry
      const id = item.speciesId || item.id;
      if (!this.data.journal[id]) {
        this.data.journal[id] = {
          count: 0,
          maxSize: item.size || 0,
          minSize: item.size || 0,
          maxWeight: item.weight || 0,
          shinyCount: 0,
          goldCrown: false,
          silverCrown: false,
          firstCaughtAt: Date.now(),
        };
      }

      const entry = this.data.journal[id];
      entry.count += 1;

      if (!entry.maxSize || item.size > entry.maxSize) entry.maxSize = item.size;
      if (!entry.minSize || item.size < entry.minSize) entry.minSize = item.size;
      if (!entry.maxWeight || item.weight > entry.maxWeight) entry.maxWeight = item.weight;
      if (item.isShiny) entry.shinyCount += 1;
      if (item.crown === 'gold') entry.goldCrown = true;
      if (item.crown === 'silver') entry.silverCrown = true;

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

  unlockPet(petId) {
    if (!this.data.pets) {
      this.data.pets = { cat: false, pelican: false, dolphin: false };
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

  unlockSea(seaId, cost = 0) {
    const id = parseInt(seaId, 10) || 1;
    if (this.isSeaUnlocked(id)) return true;
    if (cost > 0) {
      if (!this.spendCoins(cost)) return false;
    }
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
}

export const saveSystem = new SaveSystem();


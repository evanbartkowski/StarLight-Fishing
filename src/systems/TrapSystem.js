import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';

// Idle / Low-Attention Traps (Drift Pots & Seabed Longlines)
// Allows players to passively accumulate coastal crabs, pearls, shells, and fossil fragments

export const TRAP_LOOT_TABLE = [
  { id: 'dungeness_crab', name: 'Coastal Dungeness Crab', icon: '🦀', value: 90, xp: 30, type: 'catch' },
  { id: 'blue_king_crab', name: 'Giant Blue King Crab', icon: '🦀', value: 260, xp: 60, type: 'catch' },
  { id: 'spiny_lobster', name: 'Deepsea Spiny Lobster', icon: '🦞', value: 480, xp: 90, type: 'catch' },
  { id: 'pearl_oyster', name: 'Shimmering Pearl Oyster', icon: '🦪', value: 320, xp: 55, type: 'catch' },
  { id: 'ancient_nautilus', name: 'Ancient Spiral Shell', icon: '🐚', value: 180, xp: 40, type: 'catch' },
  { id: 'gold_doubloon_cluster', name: 'Barnacled Coin Cluster', icon: '🪙', value: 400, xp: 50, type: 'currency' },
  { id: 'fossil_fragment_megalodon', name: 'Megalodon Jaw Fragment', icon: '🦴', value: 900, xp: 120, type: 'skeleton', target: 'megalodonJaw' },
  { id: 'fossil_fragment_dunkleosteus', name: 'Dunkleosteus Armor Plate', icon: '🦴', value: 1000, xp: 130, type: 'skeleton', target: 'dunkleosteus' },
  { id: 'fossil_fragment_plesiosaur', name: 'Plesiosaur Vertebra', icon: '🦴', value: 1200, xp: 150, type: 'skeleton', target: 'plesiosaur' },
];

export class TrapSystem {
  constructor(saveSystem) {
    this.saveSystem = saveSystem;
    this.cycleTimeSeconds = 300; // 5 minutes per trap roll
    this.cycleTimer = 0;
    this.lastTickTime = Date.now();

    // Visual buoys coordinates relative to boat
    this.buoyOffsets = [
      { x: -90, depth: 32, bobTimer: 0 },
      { x: 105, depth: 40, bobTimer: 1.5 },
      { x: -140, depth: 48, bobTimer: 2.8 },
    ];
  }

  getTrapCount() {
    const lvl = this.saveSystem.getUpgradeLevel('seabedTraps');
    const tier = UPGRADE_DEFINITIONS.seabedTraps.tiers[lvl] || UPGRADE_DEFINITIONS.seabedTraps.tiers[0];
    return tier.trapCount || 0;
  }

  getStorageCapacity() {
    const lvl = this.saveSystem.getUpgradeLevel('seabedTraps');
    const tier = UPGRADE_DEFINITIONS.seabedTraps.tiers[lvl] || UPGRADE_DEFINITIONS.seabedTraps.tiers[0];
    return tier.maxStorage || 0;
  }

  getMaxCapacity() {
    return this.getStorageCapacity();
  }

  getStoredItems() {
    return this.saveSystem.data.traps?.items || [];
  }

  update(dt, boatX, surfaceY) {
    const trapCount = this.getTrapCount();
    if (trapCount <= 0) return; // Traps only exist once purchased in the shop!

    const now = Date.now();
    const elapsedSeconds = Math.max(0, (now - this.lastTickTime) / 1000);
    this.lastTickTime = now;

    const capacity = this.getStorageCapacity();
    const items = this.getStoredItems();

    // Accumulate time (supports tab being backgrounded!)
    this.cycleTimer += elapsedSeconds;

    const cyclesToRun = Math.floor(this.cycleTimer / this.cycleTimeSeconds);
    if (cyclesToRun > 0 && items.length < capacity) {
      this.cycleTimer -= cyclesToRun * this.cycleTimeSeconds;

      // Each deployed trap rolls a catch per completed cycle
      const totalRolls = cyclesToRun * trapCount;
      for (let r = 0; r < totalRolls; r++) {
        if (items.length >= capacity) break;
        const loot = this.rollTrapLoot();
        items.push({
          ...loot,
          caughtAt: Date.now(),
        });
      }
      this.saveSystem.save();
    }

    // Animate visual buoys
    const deltaSec = dt / 1000;
    this.buoyOffsets.forEach((b) => {
      b.bobTimer += deltaSec * 2;
    });
  }

  rollTrapLoot() {
    const roll = Math.random();
    if (roll < 0.12) {
      // Prehistoric fossil bone fragment!
      const fragIndex = Math.floor(Math.random() * 3);
      if (fragIndex === 0) return TRAP_LOOT_TABLE[6]; // Megalodon Jaw Fragment
      if (fragIndex === 1) return TRAP_LOOT_TABLE[7]; // Dunkleosteus Plate
      return TRAP_LOOT_TABLE[8]; // Plesiosaur Vertebra
    } else if (roll < 0.35) {
      // Rare shellfish / pearls / coins
      const pick = Math.floor(Math.random() * 3);
      if (pick === 0) return TRAP_LOOT_TABLE[2]; // Spiny Lobster
      if (pick === 1) return TRAP_LOOT_TABLE[3]; // Pearl Oyster
      return TRAP_LOOT_TABLE[5]; // Gold Coin Cluster
    } else {
      // Common coastal crabs & shells
      const pick = Math.floor(Math.random() * 3);
      if (pick === 0) return TRAP_LOOT_TABLE[0]; // Dungeness Crab
      if (pick === 1) return TRAP_LOOT_TABLE[1]; // Blue King Crab
      return TRAP_LOOT_TABLE[4]; // Nautilus Shell
    }
  }

  getRealmMultiplier() {
    const unlocked = Array.isArray(this.saveSystem?.data?.unlockedSeas) ? this.saveSystem.data.unlockedSeas : [1];
    const highestSea = Math.max(1, ...unlocked.map(s => parseInt(s, 10) || 1));
    return 1 + (highestSea - 1) * 0.75;
  }

  harvest() {
    const items = this.getStoredItems();
    if (items.length === 0) {
      return { count: 0, gold: 0, xp: 0, skeletonPieces: 0, items: [] };
    }

    const realmMultiplier = this.getRealmMultiplier();
    let totalGold = 0;
    let totalXp = 0;
    let skeletonPieces = 0;

    items.forEach((item) => {
      const ref = TRAP_LOOT_TABLE.find(l => l.id === item.id);
      const val = ref ? ref.value : ((item.value && item.value >= 90) ? item.value : (item.value || 45) * 2);
      const scaledVal = Math.round(val * realmMultiplier);
      totalGold += scaledVal;
      totalXp += item.xp;

      if (item.type === 'skeleton' && item.target) {
        if (!this.saveSystem.data.skeletons) {
          this.saveSystem.data.skeletons = { megalodonJaw: 0, dunkleosteus: 0, plesiosaur: 0 };
        }
        if (this.saveSystem.data.skeletons[item.target] < 4) {
          this.saveSystem.awardSkeletonPiece(item.target);
          skeletonPieces++;
        }
      }
    });

    const harvestedList = [...items];

    // Clear holding net
    this.saveSystem.data.traps.items = [];
    this.saveSystem.addCoins(totalGold);
    this.saveSystem.addXp(totalXp);
    this.saveSystem.data.stats.totalTrapsHarvested = (this.saveSystem.data.stats.totalTrapsHarvested || 0) + harvestedList.length;
    this.saveSystem.save();

    return {
      count: harvestedList.length,
      gold: totalGold,
      xp: totalXp,
      skeletonPieces,
      items: harvestedList,
    };
  }

  renderBuoys(ctx, boatX, surfaceY, cameraY) {
    if (this.saveSystem?.data?.settings?.hideSeabedTraps) return;
    if (cameraY > surfaceY + 100) return;

    const trapCount = this.getTrapCount();
    if (trapCount <= 0) return;

    const capacity = this.getStorageCapacity();
    const storedCount = this.getStoredItems().length;
    const isFull = capacity > 0 && storedCount >= capacity;

    ctx.save();
    for (let i = 0; i < trapCount; i++) {
      const b = this.buoyOffsets[i];
      const bx = boatX + b.x;
      const waveBob = Math.sin(b.bobTimer) * 4;
      const by = surfaceY - cameraY + waveBob;

      // Buoy Body (Clean spherical float with quest-like radiance when full, no lines or flags)
      if (isFull) {
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 12 + Math.sin(b.bobTimer * 3) * 4;
      }
      ctx.fillStyle = i === 0 ? '#ea580c' : i === 1 ? '#eab308' : '#0284c7';
      ctx.beginPath();
      ctx.ellipse(bx, by - 4, 10, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // White reflective center band
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx - 10, by - 6, 20, 4);
    }
    ctx.restore();
  }
}

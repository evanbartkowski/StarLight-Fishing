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
    this.cycleTimeSeconds = 240; // 4 minutes per trap roll (2x longer soak time)
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

  harvest() {
    const items = this.getStoredItems();
    if (items.length === 0) {
      return { count: 0, gold: 0, xp: 0, skeletonPieces: 0, items: [] };
    }

    let totalGold = 0;
    let totalXp = 0;
    let skeletonPieces = 0;

    items.forEach((item) => {
      const ref = TRAP_LOOT_TABLE.find(l => l.id === item.id);
      const val = ref ? ref.value : ((item.value && item.value >= 90) ? item.value : (item.value || 45) * 2);
      totalGold += val;
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
    if (cameraY > surfaceY + 100) return;
    if (this.saveSystem?.data?.settings?.hideSeabedTraps) return;

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

      // Braided polypropylene haul line descending into the benthic zone
      ctx.strokeStyle = isFull ? 'rgba(45, 212, 191, 0.85)' : 'rgba(254, 240, 138, 0.65)';
      ctx.lineWidth = isFull ? 2 : 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.sin(b.bobTimer * 0.5) * 5, by + 46);
      ctx.stroke();
      ctx.setLineDash([]);

      // Subtle underwater sunken cage silhouette hanging on line
      ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.strokeStyle = isFull ? 'rgba(45, 212, 191, 0.5)' : 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1.2;
      const cageY = by + 34;
      ctx.fillRect(bx - 7, cageY, 14, 11);
      ctx.strokeRect(bx - 7, cageY, 14, 11);

      // Buoy Body (Commercial marine conical float with dual-tone molded hull)
      if (isFull) {
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 14 + Math.sin(b.bobTimer * 4) * 6;
      }
      const buoyPrimary = i === 0 ? '#ea580c' : i === 1 ? '#eab308' : '#0284c7';
      const buoySecondary = i === 0 ? '#9a3412' : i === 1 ? '#ca8a04' : '#0369a1';

      // Lower conical taper
      ctx.fillStyle = buoySecondary;
      ctx.beginPath();
      ctx.moveTo(bx - 9, by);
      ctx.lineTo(bx, by + 10);
      ctx.lineTo(bx + 9, by);
      ctx.closePath();
      ctx.fill();

      // Upper rounded float body
      ctx.fillStyle = buoyPrimary;
      ctx.beginPath();
      ctx.ellipse(bx, by - 4, 11, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      if (isFull) {
        ctx.shadowBlur = 0;
        // Shimmering bioluminescent signal pulse
        ctx.strokeStyle = `rgba(45, 212, 191, ${0.45 + 0.35 * Math.sin(b.bobTimer * 4)})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(bx, by - 4, 17 + Math.sin(b.bobTimer * 3) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // High-visibility retro-reflective collar stripe
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx - 10, by - 6, 20, 5, 2) : ctx.rect(bx - 10, by - 6, 20, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Slender fiberglass spar antenna
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, by - 15);
      ctx.lineTo(bx, by - 28);
      ctx.stroke();

      // Solar LED dome beacon light
      const beaconColor = isFull ? '#2dd4bf' : storedCount > 0 ? '#22c55e' : '#f59e0b';
      ctx.fillStyle = beaconColor;
      ctx.shadowColor = beaconColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(bx, by - 28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // High-vis triangular marine pennant flag
      ctx.fillStyle = beaconColor;
      ctx.beginPath();
      ctx.moveTo(bx, by - 28);
      ctx.lineTo(bx + 9, by - 23);
      ctx.lineTo(bx, by - 18);
      ctx.closePath();
      ctx.fill();

      // Trap index numeral on buoy body for clarity
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), bx, by + 1);
    }
    ctx.restore();
  }
}

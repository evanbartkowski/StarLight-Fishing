// DeployableTrapManager.js — Deployable Passive Traps, Buoys & Hauling Minigame
// Supports Crab Pots, Lobster Creels, and Drift Nets placed at open-water coordinates with soak cycles

export const TRAP_TYPES = {
  crab_pot: {
    id: 'crab_pot',
    name: 'Heavy Wire Crab Pot',
    icon: '🦀',
    description: 'Benthic wire cage targeting coastal crabs, oysters, and scavengers.',
    price: 120,
    tokenCost: 2,
    soakDurationSeconds: 120, // 2 minutes
    maxSoakSeconds: 450, // 7.5 minutes before neglected
    color: '#ef4444',
    lootTable: [
      { id: 'dungeness_crab', name: 'Coastal Dungeness Crab', icon: '🦀', baseValue: 35, weight: 1.8, rarity: 'common' },
      { id: 'blue_king_crab', name: 'Giant Blue King Crab', icon: '🦀', baseValue: 95, weight: 3.5, rarity: 'rare' },
      { id: 'pearl_oyster', name: 'Shimmering Pearl Oyster', icon: '🦪', baseValue: 120, weight: 0.8, rarity: 'rare' },
      { id: 'ancient_nautilus', name: 'Ancient Spiral Shell', icon: '🐚', baseValue: 60, weight: 0.5, rarity: 'uncommon' },
    ],
  },
  lobster_creel: {
    id: 'lobster_creel',
    name: 'Slatted Timber Lobster Creel',
    icon: '🦞',
    description: 'Sturdy oak creel targeting deepwater lobsters and prime benthic treasures.',
    price: 240,
    tokenCost: 4,
    soakDurationSeconds: 180, // 3 minutes
    maxSoakSeconds: 600, // 10 minutes
    color: '#3b82f6',
    lootTable: [
      { id: 'spiny_lobster', name: 'Deepsea Spiny Lobster', icon: '🦞', baseValue: 140, weight: 2.4, rarity: 'rare' },
      { id: 'blue_king_crab', name: 'Giant Blue King Crab', icon: '🦀', baseValue: 95, weight: 3.5, rarity: 'rare' },
      { id: 'barnacled_lockbox', name: 'Barnacled Lockbox', icon: '📦', baseValue: 180, weight: 8.0, rarity: 'epic' },
      { id: 'fossil_fragment_megalodon', name: 'Megalodon Jaw Fragment', icon: '🦴', baseValue: 300, weight: 5.0, rarity: 'epic' },
    ],
  },
  drift_net: {
    id: 'drift_net',
    name: 'Surface Mesh Drift Net',
    icon: '🕸️',
    description: 'Suspended mesh sweep capturing pelagic schools and surface drift treasures.',
    price: 160,
    tokenCost: 3,
    soakDurationSeconds: 90, // 1.5 minutes
    maxSoakSeconds: 360, // 6 minutes
    color: '#10b981',
    lootTable: [
      { id: 'sardine', name: 'Coastal Sardine', icon: '🐟', baseValue: 8, weight: 0.3, rarity: 'common' },
      { id: 'driftwood_branch', name: 'Washed-up Driftwood', icon: '🪵', baseValue: 15, weight: 2.0, rarity: 'common' },
      { id: 'golden_seahorse', name: 'Golden Seahorse', icon: '✨', baseValue: 160, weight: 0.2, rarity: 'epic' },
      { id: 'gold_doubloon_cluster', name: 'Barnacled Doubloons', icon: '🪙', baseValue: 120, weight: 1.5, rarity: 'rare' },
    ],
  },
};

export class DeployableTrapManager {
  constructor(saveSystem, soundManager, uiManager) {
    this.saveSystem = saveSystem;
    this.soundManager = soundManager;
    this.uiManager = uiManager;

    this.initTrapState();

    this.bobTimer = 0;
    this.nearbyTrap = null;
  }

  initTrapState() {
    if (!Array.isArray(this.saveSystem.data.deployableTraps)) {
      this.saveSystem.data.deployableTraps = [];
    }
    if (!this.saveSystem.data.trapInventory) {
      this.saveSystem.data.trapInventory = {
        crab_pot: 1, // Starter crab pot
        lobster_creel: 0,
        drift_net: 0,
      };
    }
    this.saveSystem.save();
  }

  getDeployableInventory() {
    return this.saveSystem.data.trapInventory || { crab_pot: 0, lobster_creel: 0, drift_net: 0 };
  }

  getPlacedTraps() {
    return this.saveSystem.data.deployableTraps || [];
  }

  hasTrapToDeploy() {
    const inv = this.getDeployableInventory();
    return Object.values(inv).some((c) => c > 0);
  }

  buyTrap(typeId, useTokens = false) {
    const def = TRAP_TYPES[typeId];
    if (!def) return false;

    if (useTokens) {
      const tokens = this.saveSystem.data.marketState?.marketTokens || 0;
      if (tokens < def.tokenCost) return false;
      this.saveSystem.data.marketState.marketTokens -= def.tokenCost;
    } else {
      if (this.saveSystem.getCoins() < def.price) return false;
      this.saveSystem.deductCoins(def.price);
    }

    if (!this.saveSystem.data.trapInventory) this.saveSystem.data.trapInventory = {};
    this.saveSystem.data.trapInventory[typeId] = (this.saveSystem.data.trapInventory[typeId] || 0) + 1;
    this.saveSystem.save();
    return true;
  }

  deployTrap(typeId, x, surfaceY, zoneId, baitInstanceId = null) {
    const inv = this.getDeployableInventory();
    if ((inv[typeId] || 0) <= 0) return null;

    const def = TRAP_TYPES[typeId];
    if (!def) return null;

    let bait = null;
    if (baitInstanceId) {
      const baitItem = this.saveSystem.getInventory().find((i) => i.instanceId === baitInstanceId);
      if (baitItem) {
        bait = {
          name: baitItem.name,
          speciesId: baitItem.speciesId || baitItem.id,
          quality: baitItem.rarity === 'rare' || baitItem.rarity === 'epic' ? 2 : 1,
        };
        this.saveSystem.removeItemFromInventory(baitInstanceId);
      }
    }

    inv[typeId] -= 1;

    const newTrap = {
      id: 'dtrap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: typeId,
      name: def.name,
      icon: def.icon,
      zoneId: zoneId || this.saveSystem.data.currentZone || 'sunken_shallows',
      x: Math.round(x),
      y: surfaceY,
      placedAt: Date.now(),
      soakDurationSeconds: def.soakDurationSeconds,
      maxSoakSeconds: def.maxSoakSeconds,
      bait,
      isReady: false,
      isNeglected: false,
      catches: [],
    };

    this.saveSystem.data.deployableTraps.push(newTrap);
    this.saveSystem.save();
    return newTrap;
  }

  update(dt, boatX, currentZoneId) {
    const deltaSec = dt / 1000;
    this.bobTimer += deltaSec * 3;

    const now = Date.now();
    const traps = this.getPlacedTraps();
    let changed = false;

    traps.forEach((trap) => {
      const def = TRAP_TYPES[trap.type] || TRAP_TYPES.crab_pot;
      const elapsedSec = (now - trap.placedAt) / 1000;

      // Soak completion check
      if (!trap.isReady && elapsedSec >= trap.soakDurationSeconds) {
        trap.isReady = true;
        this.rollCatch(trap, def);
        changed = true;
      }

      // Neglect check (escapes or stolen bait)
      if (trap.isReady && !trap.isNeglected && elapsedSec >= trap.maxSoakSeconds) {
        trap.isNeglected = true;
        // 50% chance one catch escaped
        if (trap.catches.length > 1) {
          trap.catches.pop();
        }
        changed = true;
      }
    });

    if (changed) {
      this.saveSystem.save();
    }

    // Proximity check for interaction prompt
    this.nearbyTrap = null;
    for (const trap of traps) {
      if (trap.zoneId === currentZoneId) {
        const dist = Math.abs(boatX - trap.x);
        if (dist < 85) {
          this.nearbyTrap = trap;
          break;
        }
      }
    }
  }

  rollCatch(trap, def) {
    const lootPool = def.lootTable;
    const baitQuality = trap.bait?.quality || 0;
    const count = 1 + (baitQuality > 1 ? 2 : (baitQuality === 1 ? 1 : (Math.random() < 0.6 ? 1 : 0)));

    trap.catches = [];
    for (let i = 0; i < count; i++) {
      let candidate = lootPool[Math.floor(Math.random() * lootPool.length)];
      // If baited with high quality, reroll common loot
      if (baitQuality > 0 && candidate.rarity === 'common' && Math.random() < 0.6) {
        candidate = lootPool[lootPool.length - 1];
      }
      trap.catches.push({
        id: candidate.id,
        speciesId: candidate.id,
        name: candidate.name,
        icon: candidate.icon,
        rarity: candidate.rarity,
        value: candidate.baseValue,
        baseValue: candidate.baseValue,
        weight: parseFloat((candidate.weight * (0.8 + Math.random() * 0.4)).toFixed(2)),
        type: 'fish',
      });
    }
  }

  getNearbyTrap() {
    return this.nearbyTrap;
  }

  /**
   * Finalize hauling trap after minigame result
   */
  finishHaul(trapId, successQuality = 1.0) {
    const traps = this.getPlacedTraps();
    const idx = traps.findIndex((t) => t.id === trapId);
    if (idx === -1) return null;

    const trap = traps[idx];
    traps.splice(idx, 1);

    // Return the trap to player inventory if not completely lost
    if (!this.saveSystem.data.trapInventory) this.saveSystem.data.trapInventory = {};
    this.saveSystem.data.trapInventory[trap.type] = (this.saveSystem.data.trapInventory[trap.type] || 0) + 1;

    // Award caught items
    let awardedItems = [...trap.catches];
    if (successQuality < 0.5 && awardedItems.length > 1) {
      awardedItems.pop(); // Damaged line dropped a catch
    }

    awardedItems.forEach((item) => {
      this.saveSystem.addItemToInventory(item);
      this.saveSystem.recordCatch(item);
    });

    this.saveSystem.save();

    return {
      trap,
      items: awardedItems,
      cleanHaul: successQuality >= 0.8,
    };
  }

  renderBuoys(ctx, cameraY, currentZoneId) {
    const traps = this.getPlacedTraps();

    traps.forEach((trap) => {
      if (trap.zoneId !== currentZoneId) return;

      const def = TRAP_TYPES[trap.type] || TRAP_TYPES.crab_pot;
      const waveBob = Math.sin(this.bobTimer + trap.x * 0.05) * 4;
      const screenX = trap.x;
      const screenY = trap.y - cameraY + waveBob;

      ctx.save();
      ctx.translate(screenX, screenY);

      // Line going down into depths
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 180);
      ctx.stroke();
      ctx.setLineDash([]);

      // Buoy Body (Conical float)
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Buoy white reflective band
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, -2, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Antenna mast & Flag
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(0, -24);
      ctx.stroke();

      // Status Beacon Light
      let beaconColor = '#fbbf24'; // Soaking: amber
      if (trap.isReady) beaconColor = '#22c55e'; // Ready: emerald green!
      if (trap.isNeglected) beaconColor = '#f97316'; // Neglected: warning orange

      ctx.fillStyle = beaconColor;
      ctx.shadowColor = beaconColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -25, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Icon badge above buoy
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(def.icon, 0, -32);

      // Interaction text if boat is right near it
      if (this.nearbyTrap && this.nearbyTrap.id === trap.id) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        const label = trap.isReady ? 'Press [E] or Tap to Haul!' : '⏳ Soaking...';
        ctx.fillText(label, 0, -48);
      }

      ctx.restore();
    });
  }
}

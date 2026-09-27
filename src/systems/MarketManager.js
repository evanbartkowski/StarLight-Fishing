// MarketManager.js — Dynamic Macro-Market with Natural Price Drift, Supply Shock & Port Bounties
// Simulates a living economic market with supply/demand trends, port commissions, and market tokens

import { FISH_SPECIES } from '../data/FishData.js';
import { ABERRATIONS_CATALOG } from '../data/aberrations.config.js';

export class MarketManager {
  constructor(saveSystem) {
    this.saveSystem = saveSystem;
    this.cycleIntervalMs = 45000; // Natural market tick every 45s (approx. 45 in-game minutes)
    this.lastTickTime = Date.now();

    this.initMarketState();
  }

  initMarketState() {
    if (!this.saveSystem.data.marketState) {
      this.saveSystem.data.marketState = {
        lastCycleTimestamp: Date.now(),
        priceMultipliers: {},
        trends: {}, // 'RISING' | 'FALLING' | 'STABLE'
        oversupply: {}, // speciesId -> { penalty: float, expiresAt: number }
        activeCommissions: [],
        marketTokens: 0,
        craftingBlueprints: [],
      };
    }

    const state = this.saveSystem.data.marketState;
    if (!state.priceMultipliers) state.priceMultipliers = {};
    if (!state.trends) state.trends = {};
    if (!state.oversupply) state.oversupply = {};
    if (!Array.isArray(state.activeCommissions)) state.activeCommissions = [];
    if (typeof state.marketTokens !== 'number') state.marketTokens = 0;
    if (!Array.isArray(state.craftingBlueprints)) state.craftingBlueprints = ['apex_chum_blueprint'];

    // Seed baseline species if not yet present
    FISH_SPECIES.forEach((fish) => {
      if (typeof state.priceMultipliers[fish.id] !== 'number') {
        state.priceMultipliers[fish.id] = 1.0;
        state.trends[fish.id] = Math.random() < 0.4 ? 'RISING' : (Math.random() < 0.5 ? 'FALLING' : 'STABLE');
      }
    });

    // Seed aberrations
    Object.values(ABERRATIONS_CATALOG).forEach((ab) => {
      if (typeof state.priceMultipliers[ab.id] !== 'number') {
        state.priceMultipliers[ab.id] = 1.0;
        state.trends[ab.id] = Math.random() < 0.5 ? 'RISING' : 'FALLING';
      }
    });

    if (state.activeCommissions.length === 0) {
      this.generateCommissions();
    }

    this.saveSystem.save();
  }

  getMarketState() {
    return this.saveSystem.data.marketState;
  }

  getMarketTokens() {
    return this.saveSystem.data.marketState?.marketTokens || 0;
  }

  addMarketTokens(amount) {
    if (!this.saveSystem.data.marketState) this.initMarketState();
    this.saveSystem.data.marketState.marketTokens += amount;
    this.saveSystem.save();
  }

  spendMarketTokens(amount) {
    if (this.getMarketTokens() >= amount) {
      this.saveSystem.data.marketState.marketTokens -= amount;
      this.saveSystem.save();
      return true;
    }
    return false;
  }

  update(dt) {
    const now = Date.now();
    const elapsed = now - this.lastTickTime;

    if (elapsed >= this.cycleIntervalMs) {
      this.lastTickTime = now;
      this.tickMarketDrift();
    }
  }

  /**
   * Natural Macro-Drift Price Walk:
   * Common fish: ±15% range (0.85x to 1.15x)
   * Rare / Epic: ±30% range (0.70x to 1.30x)
   * Apex / Aberrations: ±40% - ±80% range (0.60x to 1.80x)
   */
  tickMarketDrift() {
    const state = this.saveSystem.data.marketState;
    if (!state) return;

    state.lastCycleTimestamp = Date.now();

    // 1. Process natural random walk with momentum
    FISH_SPECIES.forEach((fish) => {
      this._driftSingleSpecies(fish.id, fish.rarity);
    });

    Object.values(ABERRATIONS_CATALOG).forEach((ab) => {
      this._driftSingleSpecies(ab.id, 'aberration');
    });

    // 2. Clean up expired oversupply penalties (Supply & Demand rebound)
    const now = Date.now();
    for (const speciesId in state.oversupply) {
      const entry = state.oversupply[speciesId];
      if (entry && now > entry.expiresAt) {
        delete state.oversupply[speciesId];
      } else if (entry) {
        // Natural gradual penalty decay
        entry.penalty = Math.max(0, entry.penalty * 0.75);
        if (entry.penalty < 0.03) delete state.oversupply[speciesId];
      }
    }

    // 3. Check for expired commissions
    state.activeCommissions = state.activeCommissions.filter(c => now < c.expiresAt && !c.isCompleted);
    if (state.activeCommissions.length < 2) {
      this.generateCommissions();
    }

    this.saveSystem.save();
  }

  _driftSingleSpecies(speciesId, rarity = 'common') {
    const state = this.saveSystem.data.marketState;
    let current = state.priceMultipliers[speciesId] || 1.0;
    let trend = state.trends[speciesId] || 'STABLE';

    // Volatility parameters
    let minBound = 0.85;
    let maxBound = 1.15;
    let step = 0.03;

    if (rarity === 'rare' || rarity === 'epic') {
      minBound = 0.70;
      maxBound = 1.30;
      step = 0.06;
    } else if (rarity === 'legendary' || rarity === 'aberration' || rarity === 'mythic') {
      minBound = 0.60;
      maxBound = 1.80;
      step = 0.12;
    }

    // Random walk with trend inertia
    const delta = (Math.random() * step * 0.6 + step * 0.4);
    if (trend === 'RISING') {
      current += delta;
      if (current >= maxBound) {
        current = maxBound;
        trend = 'FALLING';
      } else if (Math.random() < 0.22) {
        trend = Math.random() < 0.5 ? 'STABLE' : 'FALLING';
      }
    } else if (trend === 'FALLING') {
      current -= delta;
      if (current <= minBound) {
        current = minBound;
        trend = 'RISING';
      } else if (Math.random() < 0.22) {
        trend = Math.random() < 0.5 ? 'STABLE' : 'RISING';
      }
    } else {
      // STABLE
      current += (Math.random() - 0.5) * (step * 0.5);
      if (Math.random() < 0.35) {
        trend = Math.random() < 0.5 ? 'RISING' : 'FALLING';
      }
    }

    // Clamp
    current = Math.max(minBound, Math.min(maxBound, current));

    state.priceMultipliers[speciesId] = parseFloat(current.toFixed(2));
    state.trends[speciesId] = trend;
  }

  /**
   * Returns current effective price multiplier including oversupply depression
   */
  getPriceMultiplier(speciesId) {
    const state = this.saveSystem.data.marketState;
    if (!state) return 1.0;

    const baseMult = state.priceMultipliers[speciesId] ?? 1.0;
    const oversupplyEntry = state.oversupply[speciesId];
    const penalty = oversupplyEntry && Date.now() < oversupplyEntry.expiresAt ? oversupplyEntry.penalty : 0;

    return Math.max(0.4, parseFloat((baseMult * (1.0 - penalty)).toFixed(2)));
  }

  /**
   * Returns UI friendly market indicator: Arrow, percent, trend, and depressed status
   */
  getSpeciesMarketData(speciesId) {
    const mult = this.getPriceMultiplier(speciesId);
    const state = this.saveSystem.data.marketState;
    const trend = state?.trends[speciesId] || 'STABLE';
    const isDepressed = !!(state?.oversupply[speciesId] && Date.now() < state.oversupply[speciesId].expiresAt);

    const pct = Math.round((mult - 1.0) * 100);
    let arrow = '―';
    let label = 'Stable';
    let color = '#94a3b8';

    if (isDepressed) {
      arrow = '▼▼';
      label = `Crashing (Oversupply ${pct}%)`;
      color = '#ef4444';
    } else if (pct > 3) {
      arrow = '▲';
      label = `Rising (+${pct}%)`;
      color = '#22c55e';
    } else if (pct < -3) {
      arrow = '▼';
      label = `Falling (${pct}%)`;
      color = '#f87171';
    }

    return {
      multiplier: mult,
      trend,
      percentChange: pct,
      arrow,
      label,
      color,
      isDepressed,
    };
  }

  /**
   * Player Supply Shock:
   * Dumping multiple fish of the same species depresses port price for 1-2 in-game days
   */
  recordSale(speciesId, count = 1) {
    if (count < 2) return;

    const state = this.saveSystem.data.marketState;
    if (!state) return;

    const penaltyAmount = Math.min(0.55, 0.06 * count);
    const existing = state.oversupply[speciesId]?.penalty || 0;
    const combinedPenalty = Math.min(0.60, existing + penaltyAmount);

    state.oversupply[speciesId] = {
      penalty: parseFloat(combinedPenalty.toFixed(2)),
      expiresAt: Date.now() + 180000, // 3 real minutes ~ 3 in-game hours
    };
    state.trends[speciesId] = 'FALLING';

    this.saveSystem.save();
  }

  /**
   * Port Daily Commissions & Bounties
   */
  generateCommissions() {
    const state = this.saveSystem.data.marketState;
    if (!state) return;

    const currentZone = this.saveSystem.data.currentZone || 'sunken_shallows';

    const commissionPool = [
      {
        title: 'Seaside Tavern Chowder Batch',
        icon: '🍲',
        type: 'species',
        targetSpeciesId: 'sardine',
        speciesName: 'Coastal Sardines',
        countRequired: 4,
        bonusMult: 1.8,
        tokenReward: 3,
        description: 'The local tavern needs fresh sardines for today\'s sailor stew.',
      },
      {
        title: 'Merchant Specimen Exhibition',
        icon: '📜',
        type: 'grade',
        targetGrade: 'Trophy',
        speciesName: 'Any Trophy or Monster Specimen',
        countRequired: 1,
        bonusMult: 2.2,
        tokenReward: 5,
        description: 'A wealthy visiting merchant seeks an impressive trophy catch for their private gallery.',
      },
      {
        title: 'Alchemical Guild Research Bounty',
        icon: '🧪',
        type: 'aberration',
        speciesName: 'Any Eldritch Aberration Specimen',
        countRequired: 1,
        bonusMult: 2.5,
        tokenReward: 8,
        description: 'Scholars of the occult will pay handsomely for mutated aberrations to extract eldritch ichor.',
      },
      {
        title: 'Dockmaster Fresh Supply',
        icon: '⚓',
        type: 'species',
        targetSpeciesId: 'minnow',
        speciesName: 'Silver Minnows',
        countRequired: 5,
        bonusMult: 1.6,
        tokenReward: 2,
        description: 'Dock bait handlers need live minnows to supply departing trawlers.',
      },
      {
        title: 'Mangrove Catfish Request',
        icon: '🌿',
        type: 'species',
        targetSpeciesId: 'channel_catfish',
        speciesName: 'Channel Catfish',
        countRequired: 2,
        bonusMult: 2.0,
        tokenReward: 4,
        description: 'Swamp settlers need hearty catfish fillets for preservation before high tide.',
      },
    ];

    // Pick 2-3 random distinct commissions
    const shuffled = [...commissionPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map((item, idx) => ({
      id: 'comm_' + Date.now() + '_' + idx,
      ...item,
      currentCount: 0,
      expiresAt: Date.now() + 360000, // 6 real minutes
      isCompleted: false,
    }));

    state.activeCommissions = selected;
    this.saveSystem.save();
  }

  /**
   * Checks inventory to see if player can fulfill a commission
   */
  canFulfillCommission(commissionId) {
    const state = this.saveSystem.data.marketState;
    const comm = state?.activeCommissions.find((c) => c.id === commissionId && !c.isCompleted);
    if (!comm) return { canFulfill: false, matchingItems: [] };

    const inv = this.saveSystem.getInventory().filter((i) => !i.isLocked && !this.saveSystem.isItemInAquarium(i.instanceId));
    let matching = [];

    if (comm.type === 'species') {
      matching = inv.filter((item) => (item.speciesId === comm.targetSpeciesId || item.id === comm.targetSpeciesId));
    } else if (comm.type === 'grade') {
      matching = inv.filter((item) => item.gradeTier?.id === 'Trophy' || item.gradeTier?.id === 'Monster');
    } else if (comm.type === 'aberration') {
      matching = inv.filter((item) => item.isAberration);
    }

    return {
      canFulfill: matching.length >= comm.countRequired,
      matchingItems: matching.slice(0, comm.countRequired),
    };
  }

  /**
   * Fulfills a commission: removes items, awards gold with bonusMult + market tokens
   */
  fulfillCommission(commissionId) {
    const { canFulfill, matchingItems } = this.canFulfillCommission(commissionId);
    if (!canFulfill) return null;

    const state = this.saveSystem.data.marketState;
    const comm = state.activeCommissions.find((c) => c.id === commissionId);
    if (!comm) return null;

    let baseGoldTotal = 0;
    matchingItems.forEach((item) => {
      baseGoldTotal += (item.value || 10);
      this.saveSystem.removeItemFromInventory(item.instanceId);
    });

    const finalGold = Math.round(baseGoldTotal * comm.bonusMult);
    this.saveSystem.addCoins(finalGold);
    this.addMarketTokens(comm.tokenReward);

    comm.isCompleted = true;
    this.saveSystem.save();

    return {
      commission: comm,
      goldAwarded: finalGold,
      tokensAwarded: comm.tokenReward,
      itemsHandedIn: matchingItems.length,
    };
  }
}

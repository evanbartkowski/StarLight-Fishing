import { depthWaterColor, getRealmDepthZone } from '../data/RealmDepths.js';
import { drawDepthScenery } from '../rendering/DepthScenery.js';
import { EXPEDITION_HAZARDS } from '../data/ExpeditionHazards.js';
import { REALM_ECOLOGY } from '../data/RealmEcology.js';
import { drawAngler, drawBoatTrinket, BOAT_SKIN_OPTIONS } from '../data/CustomizationData.js';
import { drawVesselHull } from '../rendering/VesselRenderer.js';
import { REALM_RELICS } from '../data/RelicsData.js';
import { Relic } from '../entities/Relic.js';
import { belongsToRealm, REALM_PROFILES } from '../data/RealmContent.js';
import { DEPTH_ZONES, FISH_SPECIES } from '../data/FishData.js';
import { FANTASY_SEAS, getSeaById } from '../entities/SeasData.js';
import { soundManager } from '../audio/SoundManager.js';
import { TREASURE_ITEMS, HAZARD_TYPES } from '../data/TreasureData.js';
import { LEGENDARY_SPECIES, checkMythicSpawn } from '../data/legendaries.js';
import { Fish, drawRainbowStarSparkle } from '../entities/Fish.js';
import { drawEventAtmosphere } from '../rendering/EventAtmosphere.js';
import { Hazard } from '../entities/Hazard.js';
import { Treasure } from '../entities/Treasure.js';
import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';
import { worldCycle } from '../systems/WorldCycle.js';
import { ShipsCat, PerchingPelican, BackgroundDolphin, BoatShark } from '../entities/BoatCompanions.js';
import { DriftItemManager } from '../entities/DriftItems.js';
import { HotspotManager } from '../entities/Hotspots.js';
import { isConditionMet } from '../data/weather.config.js';
import { InteractiveFlora, FLORA_TYPES } from '../entities/InteractiveFlora.js';
import { Powerup, POWERUP_TYPES } from '../entities/Powerup.js';

export class OceanWorld {
  constructor(canvas, trapSystem = null) {
    this.canvas = canvas;
    this.worldWidth = canvas.clientWidth || canvas.width || 800;
    this.surfaceY = 220; // Y position of ocean surface
    this.pixelsPerMeter = 15;
    this.maxDepthMeters = 3050;
    this.totalWorldHeight = this.surfaceY + this.maxDepthMeters * this.pixelsPerMeter;
    this.trapSystem = trapSystem;
    this.currentSeaId = 1;

    this.entities = {
      fish: [],
      hazards: [],
      treasures: [],
      flora: [],
      powerups: [],
    };

    // Parallax background clouds
    this.clouds = [
      { x: 50, y: 50, scale: 1.0, speed: 12 },
      { x: 350, y: 80, scale: 0.8, speed: 8 },
      { x: 700, y: 40, scale: 1.2, speed: 15 },
      { x: 950, y: 100, scale: 0.7, speed: 6 },
    ];

    // Surface wave animation timer
    this.waveTimer = 0;
    this.causticTimer = 0;

    // Boat position & physics
    this.boat = {
      x: this.worldWidth * 0.5,
      y: this.surfaceY - 14,
      width: 140,
      height: 40,
      angle: 0,
      bobOffset: 0,
      vesselLevel: 0,
    };

    // Dual-sided casting orientation: 1 = right, -1 = left
    this.aimDirection = 1;

    // Fisherman rod tip coordinates
    this.rodTip = { x: this.boat.x + 56, y: this.boat.y - 54 };

    // Vessel companions
    this.shipsCat = new ShipsCat();
    this.pelican = new PerchingPelican();
    this.dolphin = new BackgroundDolphin(this.worldWidth);
    this.shark = new BoatShark();

    // Drift items (bottles + driftwood) floating on surface
    this.driftItems = new DriftItemManager(this.worldWidth, this.surfaceY);

    // Interactive surface hotspots
    this.hotspotManager = new HotspotManager(this.surfaceY, this.worldWidth);

    // Pending bottle message for UI to display
    this.pendingBottleMessage = null;
    this.pendingDriftwoodBobber = null;
  }

  resize(width, height) {
    this.worldWidth = Number.isFinite(width) && width > 200 ? width : (this.canvas?.width || 800);
    if (!this.boat) {
      this.boat = { x: this.worldWidth * 0.5, y: this.surfaceY - 14, width: 140, height: 40, angle: 0, bobOffset: 0, vesselLevel: 0 };
    } else {
      this.boat.x = this.worldWidth * 0.5;
    }
    this.updateRodTip();
    if (this.driftItems) this.driftItems.resize(this.worldWidth);
    if (this.dolphin) this.dolphin.worldWidth = this.worldWidth;
    if (this.hotspotManager) this.hotspotManager.worldWidth = this.worldWidth;
  }

  setSaveSystem(saveSys) {
    this.saveSystem = saveSys;
  }

  setTrapSystem(trapSys) {
    this.trapSystem = trapSys;
  }

  setCurrentSea(seaId) {
    this.currentSeaId = parseInt(seaId, 10) || 1;
    this.hotspotManager?.setSea(this.currentSeaId);
  }

  setZoneManager(zoneMgr) {
    this.zoneManager = zoneMgr;
  }

  setAimDirection(dir) {
    this.aimDirection = dir < 0 ? -1 : 1;
    this.updateRodTip();
  }

  updateRodTip() {
    const dir = this.aimDirection === -1 ? -1 : 1;
    const angle = Number.isFinite(this.boat?.angle) ? this.boat.angle : 0;
    const localX = dir * 52;
    const localY = -68;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.rodTip = {
      x: this.boat.x + (localX * cos - localY * sin),
      y: this.boat.y + (localX * sin + localY * cos),
    };
  }

  // Wave height at given X
  getWaveHeight(x, timer) {
    return (
      Math.sin(x * 0.015 + timer * 2.2) * 5 +
      Math.sin(x * 0.035 - timer * 1.5) * 3 +
      Math.sin(x * 0.008 + timer * 0.8) * 4
    );
  }

  getWaveSlope(x, timer) {
    const dx = 2;
    const y1 = this.getWaveHeight(x - dx, timer);
    const y2 = this.getWaveHeight(x + dx, timer);
    return Math.atan2(y2 - y1, dx * 2);
  }

  populateWorld(saveSystem) {
    this.setCurrentSea(saveSystem.getCurrentSea());
    this.entities.fish = [];
    this.entities.hazards = [];
    this.entities.treasures = [];
    this.entities.relics = [];
    this.entities.flora = [];
    this.entities.powerups = [];

    const activeWidth = (typeof screenWidth === 'number' && screenWidth > 200) ? screenWidth : (this.canvas?.clientWidth || this.worldWidth || 1200);
    this.boat.x = activeWidth * .5;
    this.boat.y = this.surfaceY - 14;
    this.boat.bobOffset = 0;
    this.boat.angle = 0;
    this.updateRodTip();
    this.boat.vesselLevel = saveSystem.getUpgradeLevel('boatVessel') || 0;

    const luckLevel = saveSystem.getUpgradeLevel('lureLuck');
    const luckTier = UPGRADE_DEFINITIONS.lureLuck.tiers[luckLevel] || UPGRADE_DEFINITIONS.lureLuck.tiers[0];
    const weatherApexMult = worldCycle.getApexSpawnMultiplier ? worldCycle.getApexSpawnMultiplier() : 1.0;
    const rareBoost = luckTier.rareBoost * weatherApexMult;
    const shinyChance = luckTier.shinyChance;

    const fossilLevel = saveSystem.getUpgradeLevel('fossilRadar') || 0;
    const fossilBonus = UPGRADE_DEFINITIONS.fossilRadar.tiers[fossilLevel]?.fossilBonus || 1.0;

    const maxLineTier = UPGRADE_DEFINITIONS.lineLength.tiers[saveSystem.getUpgradeLevel('lineLength')] || UPGRADE_DEFINITIONS.lineLength.tiers[0];
    const activeMaxDepth = Math.min(this.maxDepthMeters, maxLineTier.depth + 30);

    const realmProfile = REALM_PROFILES[this.currentSeaId];
    const ecology = REALM_ECOLOGY[this.currentSeaId];
    const fishOptions = { shinyChance, surfaceY: this.surfaceY, sizeMultiplier: ecology.size, valueMultiplier: ecology.value };

    // Depth-band budgets prevent overlapping species habitats crowding the surface.
    const environment = { time: worldCycle.getTimeOfDay(), weather: worldCycle.getWeather(), minZoneTier: this.currentSeaId };
    const rarityWeight = { common: 1, uncommon: 0.5, rare: 0.16, epic: 0.045, legendary: 0.006 };
    const populateBands = (pool, density, weight, spawn) => {
      const limit = Math.min(activeMaxDepth, 3000);
      for (let start = 0; start < limit; start += 50) {
        const end = Math.min(start + 50, limit);
        const candidates = pool.map(item => ({ item, low: Math.max(start, item.minDepth), high: Math.min(end, item.maxDepth) }))
          .filter(candidate => candidate.high > candidate.low);
        const weights = candidates.map(({ item, low, high }) => weight(item, (low + high) / 2) * (high - low) / (end - start));
        const total = weights.reduce((sum, value) => sum + value, 0);
        if (!total) continue;
        const expected = density((start + end) / 2) * (end - start) / 50;
        const count = Math.floor(expected) + (Math.random() < expected % 1 ? 1 : 0);
        for (let i = 0; i < count; i++) {
          let roll = Math.random() * total;
          let index = 0;
          while (index < weights.length - 1 && (roll -= weights[index]) >= 0) index++;
          const { item, low, high } = candidates[index];
          const depth = low + ((i + Math.random()) / count) * (high - low);
          spawn(item, 70 + Math.random() * (this.worldWidth - 140), this.surfaceY + depth * this.pixelsPerMeter);
        }
      }
    };
    // Absolute depth keeps existing waters consistent when the line is upgraded.
    const depthProgress = depth => depth / (depth + 350);
    const fishPool = FISH_SPECIES.filter(species => belongsToRealm(species, this.currentSeaId)
      && !species.isSpecialDeep && (!species.conditions || isConditionMet(species.conditions, environment)));
    const earlyRealmSpawnMult = this.currentSeaId <= 3 ? 0.8 : 1.0;
    populateBands(fishPool, depth => (5 / (1 + depth / 1800)) * 1.15 * ecology.fish * earlyRealmSpawnMult,
      (species, depth) => (rarityWeight[species.rarity] || 0.01)
        * ({ common: 1 / (1 + depth / 350), uncommon: 1 / (1 + depth / 700), rare: 1 + depth / 300, epic: 1 + depth / 180, legendary: 1 + depth / 120 }[species.rarity] || 1)
        * (['rare', 'epic', 'legendary'].includes(species.rarity) ? rareBoost * 1.5 * ecology.rarity : 1)
        * (species.zone === this.currentSeaId ? 1 : 0.03),
      (species, x, y) => this.entities.fish.push(new Fish(species, x, y, fishOptions)));

    // Sparse realms still need one reachable resident in the first 30m. Random
    // band selection can otherwise choose only species whose habitat starts deeper.
    if (!this.entities.fish.some(fish => fish.y < this.surfaceY + 30 * this.pixelsPerMeter)) {
      const shallow = fishPool.filter(species => species.minDepth < 25 && species.maxDepth > species.minDepth);
      if (shallow.length) {
        const species = shallow[Math.floor(Math.random() * shallow.length)];
        const depth = (species.minDepth + Math.min(25, species.maxDepth, activeMaxDepth)) / 2;
        this.entities.fish.push(new Fish(species, this.worldWidth / 2, this.surfaceY + depth * this.pixelsPerMeter, fishOptions));
      }
    }

    // Special deep fish remain solitary and retain their environmental conditions.
    FISH_SPECIES.filter(species => species.isSpecialDeep && belongsToRealm(species, this.currentSeaId)).forEach(species => {
      const end = Math.min(activeMaxDepth, species.maxDepth);
      if (end <= species.minDepth || (species.conditions && !isConditionMet(species.conditions, environment)) || Math.random() >= (species.spawnChance ?? 0.85)) return;
      const y = this.surfaceY + (species.minDepth + Math.random() * (end - species.minDepth)) * this.pixelsPerMeter;
      this.entities.fish.push(new Fish(species, 70 + Math.random() * (this.worldWidth - 140), y, fishOptions));
    });

    // Populate active Mythic & Legendary species based on atmospheric world cycle
    const timeOfDay = worldCycle.getTimeOfDay();
    const weather = worldCycle.getWeather();

    LEGENDARY_SPECIES.forEach((mythic) => {
      if (!belongsToRealm(mythic, this.currentSeaId)) return;
      if (mythic.minDepth > activeMaxDepth) return;
      if (checkMythicSpawn(mythic, timeOfDay, weather, activeMaxDepth, weatherApexMult)) {
        const minSpawnY = this.surfaceY + mythic.minDepth * this.pixelsPerMeter;
        const maxSpawnY = this.surfaceY + Math.min(activeMaxDepth, mythic.maxDepth) * this.pixelsPerMeter;
        if (minSpawnY < maxSpawnY) {
          const x = 70 + Math.random() * (this.worldWidth - 140);
          const y = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);
          const mythicFish = new Fish(mythic, x, y, fishOptions);
          this.entities.fish.push(mythicFish);
        }
      }
    });

    const schoolSpecies = fishPool.filter(species => ['common', 'uncommon'].includes(species.rarity));
    for (let start = 0; start < Math.min(activeMaxDepth, 3000); start += 50) {
      if (Math.random() >= .004) continue;
      const end = Math.min(start + 50, activeMaxDepth, 3000);
      const candidates = schoolSpecies.filter(species => species.minDepth < end && species.maxDepth > start);
      if (!candidates.length) continue;
      const species = candidates[Math.floor(Math.random() * candidates.length)];
      const low = Math.max(start, species.minDepth), high = Math.min(end, species.maxDepth);
      const depth = low + Math.random() * (high - low);
      const centerX = 110 + Math.random() * Math.max(1, this.worldWidth - 220);
      const schoolSize = 10 + Math.floor(Math.random() * 7);
      for (let member = 0; member < schoolSize; member++) {
        const x = Math.max(70, Math.min(this.worldWidth - 70, centerX + (member - (schoolSize - 1) / 2) * 9));
        const memberDepth = Math.max(0, Math.min(Math.min(activeMaxDepth, 3000), depth + ((Math.random() - .5) * 44) / this.pixelsPerMeter));
        const y = this.surfaceY + memberDepth * this.pixelsPerMeter;
        this.entities.fish.push(new Fish(species, x, y, fishOptions));
      }
    }

    populateBands(TREASURE_ITEMS.filter(item => item.category !== 'fossil' && belongsToRealm(item, this.currentSeaId)),
      depth => (0.06 + 0.45 * depthProgress(depth)) * realmProfile.treasureChance / 0.2 * ecology.treasure,
      item => (rarityWeight[item.rarity] || 0.01) * (item.category === 'fossil' ? fossilBonus : item.isCrate ? .3 * worldCycle.getCrateDropMultiplier() : (item.id === 'bottle' ? 0.09 : 1)),
      (item, x, y) => this.entities.treasures.push(new Treasure(item, x, y)));

    // Fossils have an independent rare roll and cannot crowd ordinary salvage.
    // The permanent discovery ledger survives selling or exhibiting a specimen.
    const fossilPool = TREASURE_ITEMS.filter(item => item.category === 'fossil'
      && belongsToRealm(item, this.currentSeaId) && item.minDepth < activeMaxDepth
      && !saveSystem.data.fossils?.[item.id]
      && !saveSystem.data.inventory?.some(owned => owned.id === item.id));
    if (fossilPool.length && Math.random() < Math.min(.12, .035 * fossilBonus)) {
      const item = fossilPool[Math.floor(Math.random() * fossilPool.length)];
      const depth = item.minDepth + Math.random() * (Math.min(activeMaxDepth, item.maxDepth) - item.minDepth);
      this.entities.treasures.push(new Treasure(item, 50 + Math.random() * Math.max(1, this.worldWidth - 100), this.surfaceY + depth * this.pixelsPerMeter));
    }

    REALM_RELICS.filter(relic => relic.zone === this.currentSeaId).forEach(relic => {
      const reachableDepth = Math.min(activeMaxDepth, relic.maxDepth);
      if (relic.minDepth >= reachableDepth || Math.random() > 0.04 * fossilBonus * ecology.treasure) return;
      const x = 70 + Math.random() * (this.worldWidth - 140);
      const y = this.surfaceY + (relic.minDepth + Math.random() * (reachableDepth - relic.minDepth)) * this.pixelsPerMeter;
      this.entities.relics.push(new Relic(relic, x, y));
    });

    populateBands(HAZARD_TYPES.filter(hazard => !hazard.marineKind && !hazard.expedition && belongsToRealm(hazard, this.currentSeaId)),
      depth => (0.25 + 1.8 * depthProgress(depth)) * realmProfile.hazardDensity * 1.04 * ecology.hazards,
      hazard => {
        const isVolcano = this.currentSeaId === 6 && (/volcan|chimney|sulfur vent|lava pillar/i.test(hazard.name || '') || hazard.id === 'caldera_lava_pillar');
        if (isVolcano) return 0.20;
        return hazard.isColossal ? 0.55 : (this.currentSeaId === 1 && hazard.naturalKind === 'plant' ? 0.22 : 0.9);
      },
      (hazard, x, y) => this.entities.hazards.push(new Hazard(hazard, x, y)));
    populateBands(EXPEDITION_HAZARDS.filter(h => !h.expedition && h.seas.includes(this.currentSeaId)),
      depth => .06 + .15 * depthProgress(depth), () => 1,
      (hazard, x, y) => this.entities.hazards.push(new Hazard(hazard, x, y)));
    // Creature encounters are sparse groups, separate from static obstacles (modestly lowered density across all realms).
    for (const creature of HAZARD_TYPES.filter(h => h.marineKind && h.zone === this.currentSeaId)) {
      const end = Math.min(activeMaxDepth, creature.maxDepth);
      const populationBoost = this.currentSeaId >= 5 ? 1.25 : 1.5;
      const spacing = (creature.isColossal ? 750 : 250) / populationBoost;
      for (let depth = creature.minDepth; depth + 20 < end; depth += spacing) {
        const baseChance = creature.isColossal ? .22 : creature.marineKind === 'jelly' ? .3 : .22;
        const realmEnemyDampener = this.currentSeaId >= 5 ? 0.72 : 1.0;
        const depthDampener = depth > 1000 ? 0.88 : 1.0;
        const chance = baseChance * realmEnemyDampener * depthDampener;
        if (Math.random() >= Math.min(.85, chance * ecology.enemies * (1 + depthProgress(depth) * 1.28))) continue;
        const centerDepth = depth + 10 + Math.random() * Math.min(spacing - 20, end - depth - 20);
        const centerX = 120 + Math.random() * Math.max(1, this.worldWidth - 240);
        const count = creature.marineKind === 'jelly' ? 3 + Math.floor(Math.random() * 3) : 1;
        for (let member = 0; member < count; member++) {
          const x = Math.max(50, Math.min(this.worldWidth - 50, centerX + (member - (count - 1) / 2) * 55));
          const y = this.surfaceY + centerDepth * this.pixelsPerMeter + Math.sin(member * 2.4) * 45;
          const hazard = new Hazard(creature, x, y);
          hazard.minY = this.surfaceY + creature.minDepth * this.pixelsPerMeter;
          hazard.maxY = this.surfaceY + end * this.pixelsPerMeter;
          this.entities.hazards.push(hazard);
        }
      }
    }

    // Realm 1 has natural coastal hazards only (no human swimmers).

    // Deep-Sea Survey Submarine Hazard (Abyssal Depths Only: minDepth >= 1350m)
    // Never spawns in shallow or mid waters; colossal imposing deep-ocean research vessel
    if ([1, 2, 3, 4, 7].includes(this.currentSeaId) && activeMaxDepth >= 1400 && Math.random() < 0.016) {
      const minSub = 1350;
      const subDepth = minSub + Math.random() * (activeMaxDepth - minSub);
      const subY = this.surfaceY + subDepth * this.pixelsPerMeter;
      const subHazard = new Hazard({
        ...EXPEDITION_HAZARDS[1],
        id: 'deep_submarine',
        name: 'Deep Abyssal Research Submarine',
        seas: [1, 2, 3, 4, 7],
        minDepth: 1350,
        maxDepth: 3500,
        damage: 2,
        knockback: 75,
        radius: 240,
        sizeScale: 2.4,
        isColossal: true,
        color: '#1e293b',
        glow: '#38bdf8',
        moveSpeed: 16,
      }, this.worldWidth * 0.35, subY);
      subHazard.homeY = subY;
      subHazard.facing = Math.random() < 0.5 ? 1 : -1;
      this.entities.hazards.push(subHazard);
    }

    // Populate Interactive Realm Flora
    const floraConfig = FLORA_TYPES[this.currentSeaId] || FLORA_TYPES[1];
    // Jittered patches across the entire realm, with open water between clusters.
    // In Realm 1 and 2, flora is sparse and spread out, keeping clear of the surface layer (>= 48m).
    const isStarterRealm = this.currentSeaId <= 2;
    const floraStart = isStarterRealm ? Math.max(floraConfig.minDepth, 48) : Math.min(floraConfig.minDepth, 20);
    const bandStep = isStarterRealm ? 80 : 110;
    for (let band = floraStart; band < activeMaxDepth - 8; band += bandStep) {
      const end = Math.min(band + bandStep, activeMaxDepth - 8);
      const depthM = band + Math.random() * (end - band);
      const clusterX = 45 + Math.random() * Math.max(1, this.worldWidth - 90);
      const groupRoll = Math.random();
      const count = isStarterRealm
        ? (Math.random() < 0.8 ? 1 : 2)
        : (groupRoll < .48 ? 1 : groupRoll < .76 ? 2 : groupRoll < .91 ? 3 : groupRoll < .98 ? 4 : 5);
      const groupAngle = Math.random() * Math.PI * 2;
      for (let f = 0; f < count; f++) {
        const radius = Math.sqrt(Math.random()) * 48;
        const angle = groupAngle + f * Math.PI * 2 / count;
        const fx = Math.max(35, Math.min(this.worldWidth - 35, clusterX + Math.cos(angle) * radius));
        const fy = this.surfaceY + depthM * this.pixelsPerMeter + Math.sin(angle) * radius * .55;
        this.entities.flora.push(new InteractiveFlora(floraConfig, fx, fy));
      }
    }

    // Populate Underwater Power-ups (Rare Spawns: significantly rarer rewards)
    const powerupCount = Math.random() < 0.25 ? 1 : 0;
    for (let p = 0; p < powerupCount; p++) {
      const pDepth = 15 + Math.random() * Math.max(20, activeMaxDepth - 25);
      const px = 60 + Math.random() * (this.worldWidth - 120);
      const py = this.surfaceY + pDepth * this.pixelsPerMeter;
      const pConfig = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      this.entities.powerups.push(new Powerup(pConfig, px, py));
    }
  }

  update(dt, hook, particles = null) {
    const deltaSec = dt / 1000;
    this.waveTimer += deltaSec;
    this.causticTimer += deltaSec * 1.5;

    // Update world atmospheric cycle
    worldCycle.update(dt, this.worldWidth, this.surfaceY);

    // Update surface hotspots
    if (this.hotspotManager) {
      this.hotspotManager.update(dt, this.boat.x);
    }

    // Update idle traps
    if (this.trapSystem) {
      this.trapSystem.update(dt, this.boat.x, this.surfaceY);
    }

    // Update clouds
    this.clouds.forEach((cloud) => {
      cloud.x += cloud.speed * deltaSec;
      if (cloud.x > this.worldWidth + 120) {
        cloud.x = -120;
      }
    });

    // Boat wave physics
    const activeWidth = (typeof screenWidth === 'number' && screenWidth > 200) ? screenWidth : (this.canvas?.clientWidth || this.worldWidth || 1200);
    if (!Number.isFinite(this.boat.x) || this.boat.x <= 40 || this.boat.x >= activeWidth - 40) {
      this.boat.x = activeWidth * 0.5;
    }
    this.boat.x = Math.max(80, Math.min(activeWidth - 80, this.boat.x));
    const waveY = this.getWaveHeight(this.boat.x, this.waveTimer);
    const waveSlope = this.getWaveSlope(this.boat.x, this.waveTimer);
    this.boat.bobOffset = Number.isFinite(waveY) ? waveY : 0;
    this.boat.y = this.surfaceY - 14 + (Number.isFinite(waveY) ? waveY : 0);
    this.boat.angle = Number.isFinite(waveSlope) ? waveSlope * 0.6 : 0;

    this.updateRodTip();

    // Update active entities
    this.entities.fish.forEach((fish) => fish.update(dt, this.worldWidth, hook, particles));
    this.entities.hazards.forEach((hazard) => hazard.update(dt, this.worldWidth, hook));
    this.entities.treasures.forEach((treasure) => treasure.update(dt, this.worldWidth, hook));
    this.entities.flora?.forEach((flora) => flora.update(dt));
    this.entities.powerups?.forEach((powerup) => powerup.update(dt, this.worldWidth));

    // Update vessel companions (only if unlocked)
    if (this.shipsCat && this.saveSystem?.isPetEquipped('cat')) {
      this.shipsCat.update(dt);
      const tod = worldCycle.getTimeOfDay();
      const dayCount = worldCycle._dayCount || 0;
      this.shipsCat.checkMorningGift(tod, dayCount);
    }
    if (this.pelican && this.saveSystem?.isPetEquipped('pelican')) {
      const pelicanResult = this.pelican.update(dt);
      if (pelicanResult && pelicanResult.type === 'retrieve') {
        this.pendingBottleMessage = { type: 'pelican_retrieve', value: pelicanResult.value };
      }
    }
    if (this.shark && this.saveSystem?.isPetEquipped('shark')) this.shark.update(dt, this.boat, this.surfaceY);
    if (this.dolphin && this.saveSystem?.isPetEquipped('dolphin')) {
      this.dolphin.update(dt, this.surfaceY, worldCycle.getWeather());
    }

    // Update drift items
    if (this.driftItems) {
      this.driftItems.update(dt, this.surfaceY);
    }
  }

  renderSky(ctx, cameraY = 0) {
    if (cameraY > this.surfaceY + 100) return;

    const skyHeight = this.surfaceY - cameraY;
    const sky = worldCycle.getSkyColors();
    const sea = getSeaById(this.currentSeaId) || FANTASY_SEAS[0];

    // Dynamic Atmospheric Sky Gradient adapting to current Fantasy Sea Realm + Time of Day
    try {
      const skyGrad = ctx.createLinearGradient(0, -cameraY, 0, this.surfaceY - cameraY);
      if (sky.isNight) {
        skyGrad.addColorStop(0, sky.top);
        skyGrad.addColorStop(0.55, sea.skyTop || sky.middle);
        skyGrad.addColorStop(1, sea.skyHorizon || sky.horizon);
      } else {
        skyGrad.addColorStop(0, sea.skyTop || sky.top);
        skyGrad.addColorStop(0.65, sea.skyMiddle || sky.middle);
        skyGrad.addColorStop(1, sea.skyHorizon || sky.horizon);
      }
      ctx.fillStyle = skyGrad;
    } catch (e) {
      ctx.fillStyle = sea.skyTop || sky.top;
    }
    ctx.fillRect(0, 0, this.worldWidth, skyHeight);

    // Sun / Moon Orb
    const orbY = 70 - cameraY * 0.4;
    ctx.save();
    ctx.fillStyle = sky.sunColor;
    ctx.shadowColor = sky.sunGlow;
    ctx.shadowBlur = sky.isNight ? 20 : 35;
    ctx.beginPath();
    ctx.arc(this.worldWidth * 0.2, orbY, sky.isNight ? 24 : 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Clouds tinted by current sea realm palette (or rainbow colored for Sea 7)
    ctx.save();
    if (sea.id === 7) {
      // Rainbow colored clouds for the last realm
      const t = this.waveTimer || 0;
      this.clouds.forEach((cloud, idx) => {
        const cy = cloud.y - cameraY * 0.3;
        const cloudHue = (t * 25 + idx * 60) % 360;
        try {
          const cloudGrad = ctx.createLinearGradient(cloud.x - 30 * cloud.scale, cy, cloud.x + 60 * cloud.scale, cy);
          cloudGrad.addColorStop(0, `hsla(${cloudHue}, 90%, 75%, 0.85)`);
          cloudGrad.addColorStop(0.33, `hsla(${(cloudHue + 50) % 360}, 92%, 78%, 0.85)`);
          cloudGrad.addColorStop(0.66, `hsla(${(cloudHue + 110) % 360}, 95%, 76%, 0.85)`);
          cloudGrad.addColorStop(1, `hsla(${(cloudHue + 170) % 360}, 90%, 78%, 0.85)`);
          ctx.fillStyle = cloudGrad;
        } catch (e) {
          ctx.fillStyle = `hsla(${cloudHue}, 90%, 75%, 0.85)`;
        }
        ctx.shadowColor = `hsla(${cloudHue}, 90%, 70%, 0.5)`;
        ctx.shadowBlur = 10 * cloud.scale;

        ctx.beginPath();
        ctx.arc(cloud.x, cy, 22 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 20 * cloud.scale, cy - 8 * cloud.scale, 28 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 44 * cloud.scale, cy, 20 * cloud.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    } else {
      const cloudColor = sky.isNight
        ? (sea.id === 6 ? 'rgba(70, 20, 20, 0.65)' : 'rgba(30, 41, 59, 0.45)')
        : (sea.id === 6 ? 'rgba(254, 215, 170, 0.75)' : sea.id === 2 ? 'rgba(233, 213, 255, 0.75)' : sea.id === 4 ? 'rgba(204, 251, 241, 0.8)' : sea.id === 5 ? 'rgba(243, 232, 255, 0.8)' : 'rgba(255, 255, 255, 0.85)');
      ctx.fillStyle = cloudColor;
      this.clouds.forEach((cloud) => {
        const cy = cloud.y - cameraY * 0.3;
        ctx.beginPath();
        ctx.arc(cloud.x, cy, 22 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 20 * cloud.scale, cy - 8 * cloud.scale, 28 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 44 * cloud.scale, cy, 20 * cloud.scale, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();

    // Realm-specific surface atmospheric effects
    this.renderSeaAtmosphere(ctx, sea, skyHeight, cameraY);
  }

  // Atmospheric features unique to the active Sea
  renderSeaAtmosphere(ctx, sea, skyHeight, cameraY) {
    if (sea.id === 6) {
      // Magma Caldera: Distant surface volcanoes shooting smoke and molten lava periodically
      ctx.save();
      const t = this.waveTimer || 0;
      const vY = this.surfaceY - cameraY; // Anchored to water surface horizon

      // Volcano positions across the horizon
      const volcanoes = [
        { x: this.worldWidth * 0.18, w: 140, h: 65, cr: 16, eruptCycle: 0 },
        { x: this.worldWidth * 0.58, w: 220, h: 95, cr: 26, eruptCycle: 2.2 },
        { x: this.worldWidth * 0.88, w: 160, h: 72, cr: 18, eruptCycle: 4.4 },
      ];

      for (const v of volcanoes) {
        // 1. Distant volcanic mountain silhouette
        const mGrad = ctx.createLinearGradient(v.x, vY - v.h, v.x, vY);
        mGrad.addColorStop(0, '#27272a');
        mGrad.addColorStop(0.6, '#18181b');
        mGrad.addColorStop(1, '#09090b');
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.moveTo(v.x - v.w * 0.5, vY + 4);
        ctx.lineTo(v.x - v.cr, vY - v.h);
        ctx.lineTo(v.x + v.cr, vY - v.h);
        ctx.lineTo(v.x + v.w * 0.5, vY + 4);
        ctx.closePath();
        ctx.fill();

        // Glowing molten crater rim
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(v.x, vY - v.h, v.cr, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(v.x, vY - v.h, v.cr * 0.55, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Periodic eruption state (every ~7 seconds per volcano with staggering)
        const eruptPhase = ((t + v.eruptCycle) % 7.5);
        const isErupting = eruptPhase < 3.2; // Erupts for 3.2 seconds every 7.5 seconds
        const eruptPower = isErupting ? Math.sin((eruptPhase / 3.2) * Math.PI) : 0;

        // Erupting lava burst fountains
        if (eruptPower > 0.05) {
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
          for (let p = 0; p < 7; p++) {
            const spread = (p - 3) * (v.cr * 0.45);
            const burstH = eruptPower * (v.h * 0.85 + (p % 3) * 15);
            const bx = v.x + spread + Math.sin(t * 8 + p) * 4;
            const by = vY - v.h - burstH * (0.6 + 0.4 * Math.sin(t * 5 + p));
            ctx.beginPath();
            ctx.arc(bx, by, 2 + (p % 3), 0, Math.PI * 2);
            ctx.fill();
          }

          // Molten lava cascades down the mountain flanks during eruption
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(v.x - v.cr * 0.4, vY - v.h);
          ctx.lineTo(v.x - v.cr * 0.8, vY - v.h * 0.5);
          ctx.lineTo(v.x - v.w * 0.2, vY);
          ctx.moveTo(v.x + v.cr * 0.4, vY - v.h);
          ctx.lineTo(v.x + v.cr * 0.7, vY - v.h * 0.4);
          ctx.lineTo(v.x + v.w * 0.18, vY);
          ctx.stroke();
        }

        // Billowing volcanic smoke & ash plumes
        const smokeCount = 8;
        for (let s = 0; s < smokeCount; s++) {
          const sAge = ((t * 18 + s * 22) % 150);
          const sy = vY - v.h - sAge;
          const sx = v.x + Math.sin(t * 1.5 + s) * (12 + sAge * 0.25) + (sAge * 0.18);
          const sRad = 10 + sAge * 0.28;
          const sAlpha = Math.max(0, (1 - sAge / 150) * (isErupting ? 0.65 : 0.38));
          ctx.fillStyle = isErupting && sAge < 40 ? `rgba(249, 115, 22, ${sAlpha})` : `rgba(68, 64, 60, ${sAlpha})`;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Rising ambient volcanic embers & ash
      for (let i = 0; i < 24; i++) {
        const seed = i * 47.3;
        const emberX = (seed * 19 + this.waveTimer * (15 + (i % 5) * 8)) % this.worldWidth;
        const emberY = (this.surfaceY - 20) - ((this.waveTimer * 30 + seed * 23) % (skyHeight + 40)) - cameraY;
        const alpha = 0.3 + 0.6 * Math.sin(this.waveTimer * 3 + seed);
        ctx.fillStyle = i % 2 === 0 ? `rgba(234, 88, 12, ${alpha})` : `rgba(254, 240, 138, ${alpha})`;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(emberX, emberY, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (sea.id === 2) {
      // Bioluminescent Trench: Floating neon plankton spores in twilight air
      ctx.save();
      for (let i = 0; i < 20; i++) {
        const seed = i * 31.7;
        const px = (seed * 23 + Math.sin(this.waveTimer + seed) * 35) % this.worldWidth;
        const py = (this.surfaceY - 15) - ((this.waveTimer * 14 + seed * 17) % (skyHeight + 30)) - cameraY;
        const alpha = 0.35 + 0.45 * Math.sin(this.waveTimer * 2 + seed);
        ctx.fillStyle = i % 2 === 0 ? `rgba(168, 85, 247, ${alpha})` : `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (sea.id === 3) {
      // Astral Shimmerfall: Drifting fallen starlight sparkles & rare surface constellations
      ctx.save();
      for (let i = 0; i < 18; i++) {
        const seed = i * 53.1;
        const sx = (seed * 37 + this.waveTimer * 10) % this.worldWidth;
        const sy = (this.waveTimer * 20 + seed * 29) % skyHeight - cameraY;
        const alpha = 0.4 + 0.5 * Math.sin(this.waveTimer * 4 + seed);
        ctx.fillStyle = `rgba(224, 231, 255, ${alpha})`;
        ctx.font = `${8 + (i % 4) * 2}px sans-serif`;
        ctx.fillText('✦', sx, sy);
      }
      ctx.restore();
      this.renderShimmerfallConstellations(ctx, skyHeight, cameraY);
    } else if (sea.id === 4) {
      // Sunken Atlantis: Classical Atlantean architecture emerging from the horizon in ruins
      this.renderAtlantisSurfaceRuins(ctx, skyHeight, cameraY);
    } else if (sea.id === 5) {
      // Whispering Aether Sea: Floating celestial palace on a luminous cloud in the surface background
      this.renderAetherSurfaceFloatingPalace(ctx, skyHeight, cameraY);
    } else if (sea.id === 7) {
      // Eldritch Chrono Void: Surface background Black Vortex and Tornados that periodically spawn and leave
      this.renderVoidSurfaceAnomalies(ctx, skyHeight, cameraY);
    }
  }

  // Astral Shimmerfall: Rare celestial surface sky constellations with starlight filaments and glowing nodes
  renderShimmerfallConstellations(ctx, skyHeight, cameraY) {
    const vY = this.surfaceY - cameraY;
    if (vY < -200 || vY > (skyHeight || 600) + 120) return;

    ctx.save();
    const t = this.waveTimer || 0;
    const w = this.worldWidth || 1200;

    // Rare periodic apparition: cycle through celestial star figures
    // Each constellation cycle lasts 36 seconds:
    // 0-4s: fade in, 4-18s: fully visible & shimmering, 18-24s: gentle fade out, 24-36s: dormant
    const cycleDuration = 36;
    const phase = (t % cycleDuration);
    const constIndex = Math.floor(t / cycleDuration) % 3;

    let visibility = 0;
    if (phase < 4) {
      visibility = phase / 4;
    } else if (phase < 18) {
      visibility = 1.0;
    } else if (phase < 24) {
      visibility = (24 - phase) / 6;
    } else {
      visibility = 0;
    }

    if (visibility > 0.01) {
      // 3 mythical oceanic/astral constellations:
      // 0: Delphinus the Starlight Dolphin
      // 1: Cygnus the Astral Swan
      // 2: Pisces / Oceanus the Twin Celestial Fish
      const constellations = [
        {
          name: 'Delphinus the Celestial Dolphin',
          baseX: w * 0.48,
          baseY: vY - 180,
          scale: 1.15,
          stars: [
            { x: 45, y: -15, r: 3.2, primary: true, col: '#fef08a' }, // Snout
            { x: 20, y: -35, r: 2.8, col: '#67e8f9' }, // Head / Crown
            { x: -10, y: -45, r: 3.5, primary: true, col: '#ffffff' }, // Dorsal spine
            { x: -45, y: -30, r: 2.8, col: '#c4b5fd' }, // Flank
            { x: -75, y: -10, r: 3.0, primary: true, col: '#f0abfc' }, // Peduncle
            { x: -105, y: -25, r: 2.6, col: '#93c5fd' }, // Upper Fluke
            { x: -100, y: 10, r: 2.6, col: '#93c5fd' }, // Lower Fluke
            { x: 5, y: -10, r: 2.4, col: '#c4b5fd' }, // Ventral throat
            { x: -25, y: -5, r: 2.5, col: '#67e8f9' }, // Pectoral star
          ],
          lines: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [5, 6],
            [0, 7], [7, 8], [8, 4], [1, 7], [2, 8]
          ]
        },
        {
          name: 'Cygnus the Starlight Swan',
          baseX: w * 0.65,
          baseY: vY - 195,
          scale: 1.1,
          stars: [
            { x: 0, y: -20, r: 4.0, primary: true, col: '#ffffff' }, // Heart (Sadr)
            { x: 60, y: -10, r: 3.2, col: '#fef08a' }, // Head (Albireo)
            { x: -65, y: -30, r: 3.6, primary: true, col: '#67e8f9' }, // Tail (Deneb)
            { x: -25, y: -75, r: 3.0, col: '#c4b5fd' }, // Northern Wing Tip
            { x: -10, y: -48, r: 2.6, col: '#93c5fd' }, // Wing Joint North
            { x: 25, y: 35, r: 2.6, col: '#93c5fd' }, // Wing Joint South
            { x: 45, y: 65, r: 3.0, col: '#f0abfc' }, // Southern Wing Tip
          ],
          lines: [
            [2, 0], [0, 1],
            [3, 4], [4, 0], [0, 5], [5, 6]
          ]
        },
        {
          name: 'Oceanus the Twin Celestial Fish',
          baseX: w * 0.32,
          baseY: vY - 175,
          scale: 1.1,
          stars: [
            { x: -70, y: -35, r: 3.4, primary: true, col: '#67e8f9' }, // Fish 1 Mouth
            { x: -50, y: -50, r: 2.7, col: '#c4b5fd' },
            { x: -35, y: -30, r: 3.0, col: '#ffffff' },
            { x: -55, y: -15, r: 2.6, col: '#93c5fd' },
            { x: -10, y: -15, r: 2.4, col: '#fef08a' }, // Ribbon knot
            { x: 20, y: -10, r: 2.5, col: '#fbcfe8' },
            { x: 45, y: 15, r: 2.8, col: '#c4b5fd' },
            { x: 60, y: -5, r: 3.5, primary: true, col: '#ffffff' }, // Fish 2 Heart
            { x: 80, y: 10, r: 2.9, col: '#67e8f9' },
            { x: 65, y: 35, r: 2.6, col: '#93c5fd' },
          ],
          lines: [
            [0, 1], [1, 2], [2, 3], [3, 0], // Fish 1 body
            [2, 4], [4, 5], [5, 6], // Celestial ribbon
            [6, 7], [7, 8], [8, 9], [9, 6] // Fish 2 body
          ]
        }
      ];

      const cData = constellations[constIndex];
      const baseAlpha = visibility * 0.65;

      ctx.save();
      ctx.translate(cData.baseX, cData.baseY);
      ctx.scale(cData.scale, cData.scale);

      // 1. Starlight filament connecting lines
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = `rgba(196, 181, 253, ${baseAlpha * 0.65})`;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (const [fromIdx, toIdx] of cData.lines) {
        const s1 = cData.stars[fromIdx];
        const s2 = cData.stars[toIdx];
        if (s1 && s2) {
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s2.x, s2.y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Subtle radiant outer glow line
      ctx.lineWidth = 3.2;
      ctx.strokeStyle = `rgba(103, 232, 249, ${baseAlpha * 0.22})`;
      ctx.stroke();

      // 2. Star nodes with pulsating celestial halos and diamond diffraction spikes
      for (let i = 0; i < cData.stars.length; i++) {
        const star = cData.stars[i];
        const pulse = Math.sin(t * 3.0 + i * 1.5) * 0.25;
        const currentR = Math.max(1, (star.r + pulse));
        const sAlpha = Math.min(1.0, baseAlpha * (star.primary ? 1.0 : 0.8));

        // Soft starlight halo
        try {
          const haloGrad = ctx.createRadialGradient(star.x, star.y, 0.5, star.x, star.y, currentR * 3.5);
          haloGrad.addColorStop(0, star.col);
          haloGrad.addColorStop(0.4, `rgba(196, 181, 253, ${sAlpha * 0.45})`);
          haloGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(star.x, star.y, currentR * 3.5, 0, Math.PI * 2);
          ctx.fill();
        } catch (_) {}

        // Brilliant star core
        ctx.fillStyle = star.col;
        ctx.beginPath();
        ctx.arc(star.x, star.y, currentR, 0, Math.PI * 2);
        ctx.fill();

        // Diamond diffraction spikes for primary stars
        if (star.primary) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${sAlpha * 0.75})`;
          ctx.lineWidth = 1.0;
          const spikeLen = currentR * 2.8;
          ctx.beginPath();
          ctx.moveTo(star.x - spikeLen, star.y);
          ctx.lineTo(star.x + spikeLen, star.y);
          ctx.moveTo(star.x, star.y - spikeLen);
          ctx.lineTo(star.x, star.y + spikeLen);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // Sunken Atlantis Surface Background: Grand Classical temples, shattered aqueducts, and fluted marble pillars in ruins
  renderAtlantisSurfaceRuins(ctx, skyHeight, cameraY) {
    const vY = this.surfaceY - cameraY;
    if (!Number.isFinite(vY)) return;

    ctx.save();
    const t = this.waveTimer || 0;
    const w = this.worldWidth || 1200;

    // 1. Distant Turquoise Sea Haze & Ancient Orichalcum Aura along horizon
    try {
      const mistGrad = ctx.createLinearGradient(0, vY - 95, 0, vY + 8);
      mistGrad.addColorStop(0, 'rgba(13, 148, 136, 0)');
      mistGrad.addColorStop(0.5, 'rgba(45, 212, 191, 0.12)');
      mistGrad.addColorStop(1, 'rgba(20, 184, 166, 0.28)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, vY - 95, w, 103);
    } catch (e) {
      ctx.fillStyle = 'rgba(20, 184, 166, 0.15)';
      ctx.fillRect(0, vY - 95, w, 103);
    }

    // 2. Far Background: Distant Sunken Acropolis & Shattered Temple Silhouettes
    ctx.fillStyle = 'rgba(19, 78, 74, 0.55)';

    // Distant Temple 1 (Far Left Acropolis with broken pediment)
    const t1X = w * 0.12;
    ctx.beginPath();
    ctx.moveTo(t1X - 70, vY);
    ctx.lineTo(t1X - 60, vY - 24);
    ctx.lineTo(t1X - 45, vY - 24);
    ctx.lineTo(t1X - 10, vY - 58);
    ctx.lineTo(t1X + 8, vY - 42); // Fractured summit
    ctx.lineTo(t1X + 45, vY - 24);
    ctx.lineTo(t1X + 65, vY);
    ctx.closePath();
    ctx.fill();

    // Colonnade gaps on distant temple 1
    ctx.fillStyle = 'rgba(15, 118, 110, 0.65)';
    for (let c = -3; c <= 3; c++) {
      ctx.fillRect(t1X + c * 14 - 3, vY - 24, 6, 24);
    }

    // Distant Sunken Aqueduct Spans (Center Horizon)
    const aqX = w * 0.44;
    ctx.fillStyle = 'rgba(19, 78, 74, 0.45)';
    ctx.fillRect(aqX - 120, vY - 32, 240, 8);
    for (let a = -3; a <= 3; a++) {
      if (a === 1) continue; // Gap where aqueduct broke and collapsed
      const archX = aqX + a * 32;
      ctx.fillRect(archX - 4, vY - 32, 8, 32);
      ctx.beginPath();
      ctx.arc(archX + 16, vY - 14, 11, Math.PI, 0);
      ctx.fill();
    }

    // Leaning ancient obelisk (Far Right Horizon)
    const obX = w * 0.86;
    ctx.save();
    ctx.translate(obX, vY);
    ctx.rotate(0.14); // Leaning in the water
    ctx.fillStyle = 'rgba(15, 118, 110, 0.5)';
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(-4, -75);
    ctx.lineTo(0, -84);
    ctx.lineTo(4, -75);
    ctx.lineTo(7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. Midground: Grand Classical Ruined Marble Pillars Breaching the Water
    const leftPillars = [
      { x: w * 0.05, h: 62, broken: false, lean: -0.04 },
      { x: w * 0.08, h: 42, broken: true, lean: 0.06 },
      { x: w * 0.22, h: 78, broken: false, lean: 0 },
      { x: w * 0.26, h: 54, broken: true, lean: -0.05 },
    ];

    for (const p of leftPillars) {
      ctx.save();
      ctx.translate(p.x, vY);
      if (p.lean) ctx.rotate(p.lean);

      let grad = '#cbd5e1';
      try {
        const pGrad = ctx.createLinearGradient(-10, -p.h, 10, 0);
        pGrad.addColorStop(0, '#e2e8f0');
        pGrad.addColorStop(0.3, '#cbd5e1');
        pGrad.addColorStop(0.7, '#94a3b8');
        pGrad.addColorStop(1, '#64748b');
        grad = pGrad;
      } catch (e) {}

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      if (p.broken) {
        ctx.moveTo(-9, 0);
        ctx.lineTo(-9, -p.h + 8);
        ctx.lineTo(-4, -p.h);
        ctx.lineTo(2, -p.h + 12);
        ctx.lineTo(7, -p.h + 4);
        ctx.lineTo(9, -p.h + 10);
        ctx.lineTo(9, 0);
      } else {
        ctx.moveTo(-9, 0);
        ctx.lineTo(-9, -p.h);
        ctx.lineTo(9, -p.h);
        ctx.lineTo(9, 0);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fluted grooves
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.lineWidth = 1;
      for (let g = -1; g <= 1; g++) {
        const gx = g * 4.5;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, p.broken ? -p.h + 14 : -p.h);
        ctx.stroke();
      }

      // Ornate Capital (if intact)
      if (!p.broken) {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-13, -p.h - 6, 26, 6);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(-11, -p.h - 3, 3.5, 0, Math.PI * 2);
        ctx.arc(11, -p.h - 3, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Verdigris sea moss / hanging seaweed draped on marble
      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.ellipse(-7, -p.h * 0.45, 3.5, 8, 0.2, 0, Math.PI * 2);
      ctx.ellipse(8, -p.h * 0.3, 3, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal base at waterline
      ctx.fillStyle = '#475569';
      ctx.fillRect(-12, -4, 24, 6);

      ctx.restore();
    }

    // Colossal Sunken Triumphal Arch of Atlantis (Right Horizon)
    const archX = w * 0.68;
    const archH = 88;
    ctx.save();
    ctx.translate(archX, vY);

    let pierGrad = '#cbd5e1';
    try {
      const g = ctx.createLinearGradient(-35, -archH, 35, 0);
      g.addColorStop(0, '#f1f5f9');
      g.addColorStop(0.5, '#cbd5e1');
      g.addColorStop(1, '#64748b');
      pierGrad = g;
    } catch (e) {}

    // Left and Right Arch Piers
    ctx.fillStyle = pierGrad;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.4;
    ctx.fillRect(-38, -archH, 18, archH + 4);
    ctx.strokeRect(-38, -archH, 18, archH + 4);
    ctx.fillRect(20, -archH, 18, archH + 4);
    ctx.strokeRect(20, -archH, 18, archH + 4);

    // Archway vaulted ceiling span
    ctx.beginPath();
    ctx.moveTo(-20, -archH * 0.6);
    ctx.bezierCurveTo(-20, -archH * 0.92, 20, -archH * 0.92, 20, -archH * 0.6);
    ctx.lineTo(20, -archH * 0.6 + 6);
    ctx.bezierCurveTo(20, -archH * 0.86, -20, -archH * 0.86, -20, -archH * 0.6 + 6);
    ctx.closePath();
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
    ctx.stroke();

    // Broken Attica / Entablature atop the Arch
    ctx.fillStyle = pierGrad;
    ctx.beginPath();
    ctx.moveTo(-44, -archH);
    ctx.lineTo(44, -archH);
    ctx.lineTo(44, -archH - 18);
    ctx.lineTo(22, -archH - 22);
    ctx.lineTo(14, -archH - 14); // Jagged crack fissure
    ctx.lineTo(-44, -archH - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ancient glowing Orichalcum Atlantean inscription / runes on the frieze
    const runePulse = 0.6 + 0.4 * Math.sin(t * 2.2);
    ctx.fillStyle = `rgba(250, 204, 21, ${runePulse})`;
    ctx.shadowColor = '#2dd4bf';
    ctx.shadowBlur = 8 * runePulse;
    ctx.fillRect(-28, -archH - 14, 8, 3.5);
    ctx.fillRect(-14, -archH - 15, 6, 5);
    ctx.fillRect(-2, -archH - 14, 10, 3.5);
    ctx.shadowBlur = 0;

    // Hanging ivy & sea vines drooping from the ruined archway
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2;
    for (let v = 0; v < 4; v++) {
      const vx = -14 + v * 10;
      const vy = -archH * 0.65;
      const vLen = 14 + ((v * 7) % 18);
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.quadraticCurveTo(vx + Math.sin(t * 1.5 + v) * 4, vy + vLen * 0.5, vx + Math.sin(t * 2 + v) * 2, vy + vLen);
      ctx.stroke();
    }

    ctx.restore();

    // 4. Floating Orichalcum & Turquoise Motes drifting into the air from the ruins
    for (let m = 0; m < 14; m++) {
      const seed = m * 61.9;
      const mx = (seed * 19 + t * (12 + (m % 4) * 6)) % w;
      const my = (this.surfaceY - 10) - ((t * 22 + seed * 23) % (skyHeight + 30)) - cameraY;
      const alpha = 0.35 + 0.45 * Math.sin(t * 2.8 + seed);
      ctx.fillStyle = m % 2 === 0 ? `rgba(45, 212, 191, ${alpha})` : `rgba(251, 191, 36, ${alpha})`;
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(mx, my, 2 + (m % 2), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Whispering Aether Sea Surface Background: Dreamy floating palace on a luminous celestial cloud
  renderAetherSurfaceFloatingPalace(ctx, skyHeight, cameraY) {
    const vY = this.surfaceY - cameraY;
    if (!Number.isFinite(vY)) return;

    ctx.save();
    const t = this.waveTimer || 0;
    const w = this.worldWidth || 1200;

    // 1. Dreamy Ethereal Horizon Mist & Pastel Twilight Radiance
    try {
      const mistGrad = ctx.createLinearGradient(0, vY - 140, 0, vY + 12);
      mistGrad.addColorStop(0, 'rgba(192, 132, 252, 0)');
      mistGrad.addColorStop(0.5, 'rgba(232, 121, 249, 0.14)');
      mistGrad.addColorStop(0.85, 'rgba(251, 207, 232, 0.22)');
      mistGrad.addColorStop(1, 'rgba(216, 180, 254, 0.35)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, vY - 140, w, 152);
    } catch (_) {}

    // 2. Distant Soft Floating Cloud-Islands in the far background
    ctx.save();
    ctx.fillStyle = 'rgba(147, 51, 234, 0.22)';
    const farIsland1Y = vY - 80;
    const farIsland2Y = vY - 105;
    ctx.beginPath();
    ctx.ellipse(w * 0.18, farIsland1Y, 75, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.88, farIsland2Y, 95, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. The Grand Floating Celestial Palace atop a Majestic Luminous Cloud
    // Positioned in the upper right sky clear of boat (at w*0.5) and upper GUI, and scaled smaller (0.35) to appear further away
    const palaceParallax = vY - 105 + Math.sin(t * 0.65) * 3;
    const px = Math.max(w * 0.74, Math.min(w - 95, w * 0.82));
    const py = palaceParallax;

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(0.35, 0.35);
    ctx.globalAlpha = 0.76;

    // Distant Ethereal Celestial Halo behind the palace
    try {
      const haloGrad = ctx.createRadialGradient(0, -55, 25, 0, -55, 210);
      haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
      haloGrad.addColorStop(0.45, 'rgba(244, 114, 182, 0.15)');
      haloGrad.addColorStop(0.75, 'rgba(192, 132, 252, 0.08)');
      haloGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, -55, 210, 0, Math.PI * 2);
      ctx.fill();
    } catch (_) {}

    // A. Cascading Cloud Waterfalls: pour from the bottom of the cloud into mist
    ctx.save();
    ctx.globalAlpha = 0.58;
    try {
      const waterGrad = ctx.createLinearGradient(0, 35, 0, 175);
      waterGrad.addColorStop(0, 'rgba(240, 249, 255, 0.92)');
      waterGrad.addColorStop(0.4, 'rgba(199, 210, 254, 0.7)');
      waterGrad.addColorStop(0.8, 'rgba(244, 114, 182, 0.35)');
      waterGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
      ctx.fillStyle = waterGrad;
    } catch (_) {
      ctx.fillStyle = 'rgba(224, 231, 255, 0.6)';
    }

    // Main central waterfall
    ctx.beginPath();
    ctx.moveTo(-18, 30);
    ctx.lineTo(18, 30);
    ctx.lineTo(26, 170);
    ctx.lineTo(-26, 170);
    ctx.closePath();
    ctx.fill();

    // Twin delicate flanking secondary cascades
    [-65, 65].forEach(ox => {
      ctx.beginPath();
      ctx.moveTo(ox - 8, 28);
      ctx.lineTo(ox + 8, 28);
      ctx.lineTo(ox + 12, 115);
      ctx.lineTo(ox - 12, 115);
      ctx.closePath();
      ctx.fill();
    });

    // Water mist clouds at the bottom of the waterfalls
    ctx.fillStyle = 'rgba(253, 242, 248, 0.55)';
    for (let m = 0; m < 7; m++) {
      const mx = Math.sin(t * 1.8 + m) * 32;
      const my = 158 + Math.cos(t * 1.4 + m) * 12;
      ctx.beginPath();
      ctx.arc(mx, my, 5 + (m % 4) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // B. The Grand Luminous Cloud Foundation
    ctx.save();
    // Warm celestial underglow
    ctx.fillStyle = 'rgba(253, 224, 71, 0.32)';
    ctx.beginPath();
    ctx.ellipse(0, 36, 155, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Multi-puff billowing cumulus cloud base with delicate pastel depth shading
    const cloudPuffs = [
      { x: 0, y: 22, rx: 145, ry: 40, col: 'rgba(245, 238, 255, 0.94)' },
      { x: -95, y: 26, rx: 65, ry: 32, col: 'rgba(240, 228, 255, 0.92)' },
      { x: 95, y: 26, rx: 65, ry: 32, col: 'rgba(240, 228, 255, 0.92)' },
      { x: -55, y: 12, rx: 60, ry: 30, col: 'rgba(255, 250, 255, 0.97)' },
      { x: 55, y: 12, rx: 60, ry: 30, col: 'rgba(255, 250, 255, 0.97)' },
      { x: 0, y: 6, rx: 80, ry: 34, col: 'rgba(255, 255, 255, 1.0)' },
    ];
    for (const p of cloudPuffs) {
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cloud golden-rose rim highlights
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(-55, 6, 44, Math.PI * 0.7, Math.PI * 1.3);
    ctx.arc(0, 2, 56, Math.PI * 0.8, Math.PI * 1.2);
    ctx.arc(55, 6, 44, Math.PI * 0.7, Math.PI * 1.3);
    ctx.stroke();
    ctx.restore();

    // C. The Grand Palace Architecture
    // 1. Terrace Foundation & Balustrade
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-96, -2, 192, 9);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-98, 5, 196, 2.8);

    // Balustrade balusters
    ctx.fillStyle = '#cbd5e1';
    for (let b = -90; b <= 90; b += 10) {
      ctx.fillRect(b, -9, 3, 8);
    }
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-96, -11, 192, 3);

    // 2. Side Wings & Colonnades
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-80, -42, 36, 32);
    ctx.fillRect(44, -42, 36, 32);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-82, -44, 40, 3.5);
    ctx.fillRect(42, -44, 40, 3.5);

    // Side rotunda domes
    [-62, 62].forEach(rx => {
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(rx, -44, 15, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // Mini spire finial
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(rx - 1, -66, 2, 8);
      ctx.beginPath();
      ctx.arc(rx, -67, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Wing windows with warm ambient lantern glow
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-72, -32, 8, 14);
    ctx.fillRect(-56, -32, 8, 14);
    ctx.fillRect(52, -32, 8, 14);
    ctx.fillRect(68, -32, 8, 14);

    // 3. Central Grand Palace Hall
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-38, -65, 76, 54);

    // Entrance arch & royal columns
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(0, -26, 12, Math.PI, 0);
    ctx.lineTo(12, -11);
    ctx.lineTo(-12, -11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -26, 8.5, Math.PI, 0);
    ctx.lineTo(8.5, -11);
    ctx.lineTo(-8.5, -11);
    ctx.closePath();
    ctx.fill();

    // Palace front fluted columns
    ctx.fillStyle = '#e2e8f0';
    [-28, -18, 18, 28].forEach(cx => {
      ctx.fillRect(cx - 2.5, -50, 5, 39);
    });

    // Central balcony
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-22, -40, 44, 3);

    // Rose stained-glass window
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(0, -52, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 4. Soaring Grand Celestial Central Dome
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(0, -74, 30, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, -74, 30, Math.PI, 0);
    ctx.stroke();

    // Gold filigree ribs on central dome
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
    ctx.lineWidth = 1.5;
    [-15, 0, 15].forEach(rx => {
      ctx.beginPath();
      ctx.moveTo(rx, -74);
      ctx.quadraticCurveTo(rx * 0.4, -98, 0, -104);
      ctx.stroke();
    });

    // Central Spire & Glowing Aetherial Star Finial
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-2.5, -118, 5, 16);
    const starGlint = 5.2 + Math.sin(t * 3.5) * 1.8;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -121, starGlint, 0, Math.PI * 2);
    ctx.fill();

    // 5. Left & Right Flanking Minaret Spire Towers
    [-88, 88].forEach((tx, idx) => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(tx - 7.5, -72, 15, 62);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(tx - 9.5, -74, 19, 3.5);
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.moveTo(tx - 9, -74);
      ctx.lineTo(tx, -112);
      ctx.lineTo(tx + 9, -74);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.fillRect(tx - 1.5, -122, 3, 10);
      ctx.beginPath();
      ctx.arc(tx, -123, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(tx - 3, -60, 6, 12);

      // Fluttering silk pennant banner
      const bannerWave = Math.sin(t * 3.2 + idx * 1.8) * 9;
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(tx + 1, -119);
      ctx.lineTo(tx + 18 + bannerWave, -116 + bannerWave * 0.3);
      ctx.lineTo(tx + 1, -110);
      ctx.closePath();
      ctx.fill();
    });

    // 6. Floating Ascending Starlight / Sparkles above the palace
    ctx.fillStyle = '#fef08a';
    for (let s = 0; s < 6; s++) {
      const sPhase = (t * 1.8 + s * 1.4) % 4.0;
      const sx = -60 + s * 24 + Math.sin(t * 2 + s) * 8;
      const sy = -110 - sPhase * 16;
      const sAlpha = Math.max(0, 1 - sPhase / 4.0) * 0.75;
      ctx.globalAlpha = sAlpha;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.restore();
  }

  // Sea 7: Eldritch Chrono Void Surface Background Anomalies
  // Periodically spawns a majestic Black Vortex and Cosmic Tornados at the horizon that eventually leave
  renderVoidSurfaceAnomalies(ctx, skyHeight, cameraY) {
    const vY = this.surfaceY - cameraY;
    if (!Number.isFinite(vY)) return;

    ctx.save();
    const t = this.waveTimer || 0;
    const w = this.worldWidth || 1200;

    // -------------------------------------------------------------
    // 1. BLACK VORTEX (Cosmic Singularity with relativistic accretion disk, Einstein ring & Doppler boosting)
    // Spawns less frequently: every 120s, active for 24s (enters, swirls, exits), absent 96s
    // -------------------------------------------------------------
    const vortexPeriod = 120;
    const vortexPhase = (t % vortexPeriod);
    const vortexActiveTime = 24;

    if (vortexPhase < vortexActiveTime) {
      let scale = 1;
      if (vortexPhase < 5) {
        scale = Math.sin((vortexPhase / 5) * (Math.PI / 2));
      } else if (vortexPhase > vortexActiveTime - 5) {
        scale = Math.cos(((vortexPhase - (vortexActiveTime - 5)) / 5) * (Math.PI / 2));
      }
      scale = Math.max(0.001, scale);

      const vx = w * 0.72 + Math.sin(t * 0.25) * 35;
      const vy = vY - 65 - Math.cos(t * 0.2) * 10;

      ctx.save();
      ctx.translate(vx, vy);
      ctx.scale(scale, scale);

      // 1-pre. Deep Cosmic Nebular Aura Halo around Singularity
      ctx.save();
      const nebHue = (t * 35) % 360;
      const nebulaBloom = ctx.createRadialGradient(0, 0, 16, 0, 0, 195);
      nebulaBloom.addColorStop(0, `hsla(${nebHue}, 95%, 75%, 0.38)`);
      nebulaBloom.addColorStop(0.3, `hsla(${(nebHue + 60) % 360}, 90%, 65%, 0.24)`);
      nebulaBloom.addColorStop(0.65, `hsla(${(nebHue + 140) % 360}, 85%, 45%, 0.12)`);
      nebulaBloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebulaBloom;
      ctx.beginPath();
      ctx.arc(0, 0, 195, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 1a. Relativistic Astrophysical Plasma Jets (Helical collimated energy beams)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const dir of [-1, 1]) {
        const jetLen = 175;
        const jetGrad = ctx.createLinearGradient(0, 0, 0, dir * jetLen);
        const jetHue = (t * 50) % 360;
        jetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        jetGrad.addColorStop(0.15, `hsla(${jetHue}, 100%, 75%, 0.8)`);
        jetGrad.addColorStop(0.5, `hsla(${(jetHue + 80) % 360}, 95%, 65%, 0.4)`);
        jetGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.fillStyle = jetGrad;

        // Core plasma beam
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.lineTo(dir * 14, dir * jetLen);
        ctx.lineTo(dir * -14, dir * jetLen);
        ctx.closePath();
        ctx.fill();

        // Synchrotron shock diamonds along the jet
        for (let j = 1; j <= 3; j++) {
          const jy = dir * (j * 40 + Math.sin(t * 4 + j) * 6);
          const jw = 7 + j * 3;
          ctx.strokeStyle = `hsla(${(jetHue + j * 40) % 360}, 100%, 85%, 0.7)`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(0, jy - dir * 8);
          ctx.lineTo(jw, jy);
          ctx.lineTo(0, jy + dir * 8);
          ctx.lineTo(-jw, jy);
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();

      // 1b. Gravitational Lensing Einstein Ring (Curved starlight arc warped around event horizon)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let ring = 0; ring < 4; ring++) {
        const rRad = 48 + ring * 14 + Math.sin(t * 1.8 + ring * 1.2) * 3;
        const rHue = (t * 60 + ring * 55) % 360;
        ctx.strokeStyle = `hsla(${rHue}, 95%, 72%, ${0.35 - ring * 0.07})`;
        ctx.lineWidth = 2.4 - ring * 0.4;
        ctx.beginPath();
        // Upper warped arc (light bent from behind horizon)
        ctx.ellipse(0, -rRad * 0.28, rRad, rRad * 0.42, 0, Math.PI * 0.95, Math.PI * 2.05);
        ctx.stroke();
        // Lower warped counter-arc
        ctx.beginPath();
        ctx.ellipse(0, rRad * 0.28, rRad * 0.92, rRad * 0.38, 0, 0, Math.PI * 1.05);
        ctx.stroke();
      }
      ctx.restore();

      // 1c. Relativistic Accretion Disk (3D tilted matter ring with Doppler beaming)
      ctx.save();
      ctx.rotate(-0.28);

      // Back of accretion disk (warped upward by gravitational lensing)
      const backDiskGrad = ctx.createRadialGradient(0, 0, 22, 0, 0, 68);
      backDiskGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      backDiskGrad.addColorStop(0.3, 'rgba(168, 85, 247, 0.7)');
      backDiskGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.4)');
      backDiskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = backDiskGrad;
      ctx.beginPath();
      ctx.ellipse(0, -6, 68, 26, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Main Front Accretion Disk with Doppler Asymmetry (left side brighter/hotter, right side dimmer/red-shifted)
      // Left side approaching matter (blue-shifted electric cyan-white)
      const leftDisk = ctx.createRadialGradient(-26, 0, 10, -26, 0, 52);
      leftDisk.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      leftDisk.addColorStop(0.3, 'rgba(56, 189, 248, 0.95)');
      leftDisk.addColorStop(0.7, 'rgba(99, 102, 241, 0.65)');
      leftDisk.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = leftDisk;
      ctx.beginPath();
      ctx.ellipse(0, 0, 68, 20, 0, Math.PI * 0.45, Math.PI * 1.55);
      ctx.fill();

      // Right side receding matter (red-shifted deep crimson-amber)
      const rightDisk = ctx.createRadialGradient(24, 0, 8, 24, 0, 48);
      rightDisk.addColorStop(0, 'rgba(254, 215, 170, 0.85)');
      rightDisk.addColorStop(0.35, 'rgba(239, 68, 68, 0.65)');
      rightDisk.addColorStop(0.8, 'rgba(126, 34, 206, 0.35)');
      rightDisk.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rightDisk;
      ctx.beginPath();
      ctx.ellipse(0, 0, 68, 20, 0, -Math.PI * 0.55, Math.PI * 0.45);
      ctx.fill();

      // Infalling relativistic matter spirals
      for (let s = 0; s < 8; s++) {
        const spiralAng = s * (Math.PI / 4) + t * 3.2;
        const sr = 24 + ((t * 32 + s * 11) % 40);
        const sx = Math.cos(spiralAng) * sr;
        const sy = Math.sin(spiralAng) * (sr * 0.30);
        const sHue = (t * 90 + s * 45) % 360;
        ctx.fillStyle = `hsl(${sHue}, 100%, 82%)`;
        ctx.shadowColor = `hsl(${sHue}, 100%, 70%)`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // 1d. Event Horizon & Photon Sphere
      // Searing photon ring orbit (1.5 Rs)
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = `hsla(${(t * 80) % 360}, 100%, 75%, 0.9)`;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Deep obsidian void shadow
      const voidGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 21);
      voidGrad.addColorStop(0, '#000000');
      voidGrad.addColorStop(0.75, '#020617');
      voidGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = voidGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 21, 0, Math.PI * 2);
      ctx.fill();

      // Pitch-black core (consumes all light)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 18.5, 0, Math.PI * 2);
      ctx.fill();

      // Relativistic Chromatic Needle Glint at center
      drawRainbowStarSparkle(ctx, 0, 0, 5.5, t * 1.8, (t * 90) % 360, 0.95);

      // Ethereal water ripple reflection on ocean surface below the singularity
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const refY = (vY - vy);
      const refGrad = ctx.createRadialGradient(0, refY, 4, 0, refY, 110);
      refGrad.addColorStop(0, `hsla(${nebHue}, 95%, 75%, 0.35)`);
      refGrad.addColorStop(0.5, `hsla(${(nebHue + 80) % 360}, 85%, 60%, 0.16)`);
      refGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = refGrad;
      ctx.beginPath();
      ctx.ellipse(0, refY, 85, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    // -------------------------------------------------------------
    // 2. COSMIC TORNADOS (Swirling Waterspouts with stardust spray)
    // Spawns every 48s, active for 25s (funnel forms, roils & drifts, dissipates)
    // -------------------------------------------------------------
    const tornadoPeriod = 48;
    const tornadoPhase = ((t + 22) % tornadoPeriod);
    const tornadoActiveTime = 25;

    if (tornadoPhase < tornadoActiveTime) {
      let intensity = 1;
      if (tornadoPhase < 4) {
        intensity = Math.sin((tornadoPhase / 4) * (Math.PI / 2));
      } else if (tornadoPhase > tornadoActiveTime - 4) {
        intensity = Math.cos(((tornadoPhase - (tornadoActiveTime - 4)) / 4) * (Math.PI / 2));
      }
      intensity = Math.max(0.001, intensity);

      const tornados = [
        {
          startX: w * 0.18,
          travelX: 110,
          baseY: vY,
          height: 125,
          topWidth: 46,
          bottomWidth: 14,
          speedMult: 1.0,
          swirlDir: 1
        },
        {
          startX: w * 0.44,
          travelX: -90,
          baseY: vY,
          height: 110,
          topWidth: 38,
          bottomWidth: 11,
          speedMult: 0.85,
          swirlDir: -1
        }
      ];

      for (let i = 0; i < tornados.length; i++) {
        const tor = tornados[i];
        const progress = tornadoPhase / tornadoActiveTime;
        const curX = tor.startX + tor.travelX * progress;
        const curBaseY = tor.baseY;
        const curTopY = curBaseY - tor.height * Math.min(1, tornadoPhase / 2.5);
        const curTopW = tor.topWidth * intensity;
        const curBotW = tor.bottomWidth * intensity;

        ctx.save();
        ctx.globalAlpha = intensity;

        // Swirling wind funnel curves
        const slices = 16;
        for (let s = 0; s < slices; s++) {
          const sy = curTopY + (curBaseY - curTopY) * (s / slices);
          const nextY = curTopY + (curBaseY - curTopY) * ((s + 1) / slices);
          const ratio = s / slices;
          const nextRatio = (s + 1) / slices;

          const sway = Math.sin(t * 3.5 * tor.speedMult + s * 0.45) * (7 + ratio * 8);
          const nextSway = Math.sin(t * 3.5 * tor.speedMult + (s + 1) * 0.45) * (7 + nextRatio * 8);

          const w1 = (curTopW * (1 - ratio) + curBotW * ratio) * (1 + 0.15 * Math.sin(t * 5 + s));
          const w2 = (curTopW * (1 - nextRatio) + curBotW * nextRatio) * (1 + 0.15 * Math.sin(t * 5 + s + 1));

          const sliceHue = (t * 50 + s * 22) % 360;
          ctx.fillStyle = `rgba(15, 23, 42, ${0.45 + 0.25 * (1 - ratio)})`;
          ctx.beginPath();
          ctx.moveTo(curX + sway - w1 * 0.5, sy);
          ctx.lineTo(curX + sway + w1 * 0.5, sy);
          ctx.lineTo(curX + nextSway + w2 * 0.5, nextY);
          ctx.lineTo(curX + nextSway - w2 * 0.5, nextY);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = `hsla(${sliceHue}, 90%, 70%, 0.45)`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          const bandOffset = Math.sin(t * 6 * tor.swirlDir + s * 0.8) * (w1 * 0.4);
          ctx.moveTo(curX + sway + bandOffset, sy);
          ctx.lineTo(curX + nextSway + bandOffset * 0.9, nextY);
          ctx.stroke();
        }

        // Swirling stardust motes rotating around the tornado funnel
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let p = 0; p < 8; p++) {
          const pProgress = ((t * 22 + p * 15) % 100) / 100;
          const py = curTopY + (curBaseY - curTopY) * pProgress;
          const pRatio = pProgress;
          const pW = (curTopW * (1 - pRatio) + curBotW * pRatio) * 0.85;
          const pAngle = t * 6 * tor.swirlDir + p * (Math.PI / 4);
          const px = curX + Math.sin(t * 3.5 + pProgress * 3) * (7 + pRatio * 8) + Math.cos(pAngle) * pW;
          const pHue = (t * 80 + p * 45) % 360;
          ctx.fillStyle = `hsla(${pHue}, 100%, 75%, 0.8)`;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Churning sea spray & foam vortex at the touchdown point on water surface
        const touchY = curBaseY + this.getWaveHeight(curX, this.waveTimer);
        const sprayHue = (t * 70 + i * 120) % 360;
        ctx.fillStyle = `hsla(${sprayHue}, 90%, 75%, 0.6)`;
        ctx.beginPath();
        ctx.ellipse(curX, touchY, curBotW * 1.8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        for (let sp = 0; sp < 6; sp++) {
          const spAng = sp * (Math.PI / 3) + t * 4 * tor.swirlDir;
          const spDist = curBotW * 1.2 + Math.sin(t * 5 + sp) * 4;
          const spX = curX + Math.cos(spAng) * spDist;
          const spY = touchY - 4 - Math.abs(Math.sin(t * 4 + sp)) * 8;
          ctx.fillStyle = `hsla(${(sprayHue + sp * 50) % 360}, 100%, 80%, 0.7)`;
          ctx.beginPath();
          ctx.arc(spX, spY, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    ctx.restore();
  }

  renderWaterSurface(ctx, cameraY = 0) {
    const drawSurfaceY = this.surfaceY - cameraY;
    const sea = getSeaById(this.currentSeaId) || FANTASY_SEAS[0];

    ctx.save();
    let surfaceStyle = sea.waterSurfaceColor || 'rgba(56, 189, 248, 0.45)';
    let crestStyle = sea.skyHorizon || '#e0f2fe';

    // Undulating rainbow colored water for Sea 7 (Eldritch Chrono Void)
    if (sea.id === 7) {
      const t = this.waveTimer || 0;
      const baseHue = (t * 35) % 360;
      try {
        const rainbowWater = ctx.createLinearGradient(0, drawSurfaceY, this.worldWidth, drawSurfaceY);
        rainbowWater.addColorStop(0, `hsla(${baseHue}, 85%, 60%, 0.55)`);
        rainbowWater.addColorStop(0.25, `hsla(${(baseHue + 70) % 360}, 90%, 65%, 0.55)`);
        rainbowWater.addColorStop(0.5, `hsla(${(baseHue + 140) % 360}, 85%, 60%, 0.55)`);
        rainbowWater.addColorStop(0.75, `hsla(${(baseHue + 210) % 360}, 90%, 65%, 0.55)`);
        rainbowWater.addColorStop(1, `hsla(${(baseHue + 280) % 360}, 85%, 60%, 0.55)`);
        surfaceStyle = rainbowWater;

        const rainbowCrest = ctx.createLinearGradient(0, drawSurfaceY, this.worldWidth, drawSurfaceY);
        rainbowCrest.addColorStop(0, `hsla(${(baseHue + 30) % 360}, 100%, 80%, 0.95)`);
        rainbowCrest.addColorStop(0.33, `hsla(${(baseHue + 110) % 360}, 100%, 82%, 0.95)`);
        rainbowCrest.addColorStop(0.66, `hsla(${(baseHue + 200) % 360}, 100%, 82%, 0.95)`);
        rainbowCrest.addColorStop(1, `hsla(${(baseHue + 290) % 360}, 100%, 80%, 0.95)`);
        crestStyle = rainbowCrest;
      } catch (e) {}
    }

    ctx.fillStyle = surfaceStyle;
    ctx.beginPath();
    ctx.moveTo(0, drawSurfaceY);

    for (let x = 0; x <= this.worldWidth; x += 8) {
      const wy = drawSurfaceY + this.getWaveHeight(x, this.waveTimer);
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(this.worldWidth, drawSurfaceY + 14);
    ctx.lineTo(0, drawSurfaceY + 14);
    ctx.closePath();
    ctx.fill();

    // Crest line matching sea horizon tint or undulating rainbow
    ctx.strokeStyle = crestStyle;
    ctx.lineWidth = sea.id === 7 ? 4 : 3;
    ctx.beginPath();
    for (let x = 0; x <= this.worldWidth; x += 8) {
      const wy = drawSurfaceY + this.getWaveHeight(x, this.waveTimer);
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
    ctx.restore();

    // Render Seabed Traps Buoys bobbing on water
    if (this.trapSystem && !this.saveSystem?.data?.settings?.hideSeabedTraps) {
      this.trapSystem.renderBuoys(ctx, this.boat.x, this.surfaceY, cameraY);
    }

    // Render interactive surface hotspots
    if (this.hotspotManager) {
      this.hotspotManager.render(ctx, cameraY, this.worldWidth, this.canvas.height);
    }
  }

  renderBoatAndFisherman(ctx, cameraY = 0, isSurface = false) {
    if (!Number.isFinite(cameraY)) cameraY = 0;
    const surfaceY = Number.isFinite(this.surfaceY) ? this.surfaceY : 220;

    // Never cull the boat if on the surface!
    const effectiveCameraY = isSurface ? 0 : cameraY;
    if (!isSurface && effectiveCameraY > surfaceY + 220) return;

    if (!this.boat) {
      this.boat = { x: (this.worldWidth || 1200) * 0.5, y: surfaceY - 14, width: 140, height: 40, angle: 0, bobOffset: 0, vesselLevel: 0 };
    }
    const b = this.boat;
    b.width = Number.isFinite(b.width) && b.width > 0 ? b.width : 140;
    b.height = Number.isFinite(b.height) && b.height > 0 ? b.height : 40;
    const currentScreenWidth = (typeof screenWidth === 'number' && screenWidth > 200) ? screenWidth : (this.canvas?.clientWidth || this.worldWidth || 1200);
    if (!Number.isFinite(b.x) || b.x <= 40 || b.x >= currentScreenWidth - 40) {
      b.x = currentScreenWidth * 0.5;
    }
    b.x = Math.max(80, Math.min(currentScreenWidth - 80, b.x));
    if (!Number.isFinite(b.y)) b.y = surfaceY - 14;
    if (!Number.isFinite(b.angle)) b.angle = 0;
    const drawBoatY = isSurface ? (surfaceY - 14 + (Number.isFinite(b.bobOffset) ? b.bobOffset : 0)) : (b.y - effectiveCameraY);

    // If completely off-screen above or below, cull only when diving
    if (!isSurface && (drawBoatY < -280 || drawBoatY > (this.canvas?.height || 1200) + 160)) return;

    const vesselNum = Number(this.saveSystem?.getUpgradeLevel?.('boatVessel') ?? b.vesselLevel ?? 0);
    const vessel = Number.isFinite(vesselNum) ? Math.max(0, Math.floor(vesselNum)) : 0;
    b.vesselLevel = vessel;

    // Lazy instantiate companions if missing
    if (!this.shark) this.shark = new BoatShark();
    if (!this.dolphin) this.dolphin = new BackgroundDolphin(currentScreenWidth);
    if (!this.shipsCat) this.shipsCat = new ShipsCat();
    if (!this.pelican) this.pelican = new PerchingPelican();

    try {
      if (this.saveSystem?.isPetEquipped('shark') && this.shark) this.shark.render(ctx, effectiveCameraY);
    } catch (e) { console.warn('Pet shark render error:', e); }

    try {
      if (this.dolphin && this.saveSystem?.isPetEquipped('dolphin')) this.dolphin.render(ctx, effectiveCameraY);
    } catch (e) { console.warn('Pet dolphin render error:', e); }

    ctx.save();
    try {
      ctx.translate(b.x, drawBoatY);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.rotate(b.angle);

      const rawSkin = this.saveSystem?.data?.boatSkin;
      const skinColor = typeof rawSkin === 'string'
        ? (BOAT_SKIN_OPTIONS[rawSkin]?.color || { coral: '#fb7185', indigo: '#818cf8', gold: '#fbbf24', emerald: '#34d399' }[rawSkin] || null)
        : null;

      try {
        drawVesselHull(ctx, vessel, b.width, b.height, this.waveTimer || 0, skinColor);
      } catch (hullErr) {
        console.error('Error drawing vessel hull:', hullErr);
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(-b.width * 0.5, -8);
        ctx.lineTo(-b.width * 0.42, b.height * 0.6);
        ctx.quadraticCurveTo(0, b.height * 0.8, b.width * 0.44, b.height * 0.5);
        ctx.lineTo(b.width * 0.52, -8);
        ctx.closePath();
        ctx.fill();
      }

      // Equipped Boat Trinket
      try {
        const equippedTrinket = this.saveSystem?.data?.boatTrinket || 'none';
        if (equippedTrinket && equippedTrinket !== 'none') {
          drawBoatTrinket(ctx, equippedTrinket, vessel, this.waveTimer || 0, b.width, b.height);
        }
      } catch (e) { console.warn('Boat trinket render error:', e); }

      // Companions (rendered relative to boat transform - only if unlocked)
      try {
        if (this.shipsCat && this.saveSystem?.isPetEquipped('cat')) {
          this.shipsCat.render(ctx, vessel);
          if (this.hoveredCompanion === 'angela') {
            const catPos = this.shipsCat.getDeckPosition(vessel);
            ctx.save();
            try {
              ctx.translate(catPos.x - 55, catPos.y - 30);
              ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 1.5;
              const text = '🐱 Angela the Cat';
              ctx.font = 'bold 11px Outfit, sans-serif';
              const tw = ctx.measureText(text).width;
              ctx.beginPath();
              if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(-tw / 2 - 7, -10, tw + 14, 18, 6);
              } else {
                ctx.rect(-tw / 2 - 7, -10, tw + 14, 18);
              }
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = '#fef3c7';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(text, 0, 0);
            } catch (err) {
              console.warn('Angela tooltip error:', err);
            } finally {
              ctx.restore();
            }
          }
        }
      } catch (e) { console.warn('Cat render error:', e); }

      try {
        if (this.pelican && this.saveSystem?.isPetEquipped('pelican')) {
          this.pelican.render(ctx, vessel);
          if (this.hoveredCompanion === 'evan') {
            const birdPos = this.pelican.getBowspritPosition ? this.pelican.getBowspritPosition(vessel) : { x: 50, y: -20 };
            ctx.save();
            try {
              ctx.translate(birdPos.x + 55, birdPos.y - 32);
              ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1.5;
              const text = '🦤 Evan the Bird';
              ctx.font = 'bold 11px Outfit, sans-serif';
              const tw = ctx.measureText(text).width;
              ctx.beginPath();
              if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(-tw / 2 - 7, -10, tw + 14, 18, 6);
              } else {
                ctx.rect(-tw / 2 - 7, -10, tw + 14, 18);
              }
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = '#e0f2fe';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(text, 0, 0);
            } catch (err) {
              console.warn('Evan tooltip error:', err);
            } finally {
              ctx.restore();
            }
          }
        }
      } catch (e) { console.warn('Pelican render error:', e); }

      // 2. Fisherman (flips left or right based on aimDirection)
      ctx.save();
      try {
        const aimDir = this.aimDirection === -1 ? -1 : 1;
        ctx.scale(aimDir, 1);

        const fX = -2;
        const fY = -12;

        drawAngler(ctx, this.saveSystem?.data?.appearance, fX, fY);

        // 3. Fishing Rod
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fX + 16, fY - 14);
        ctx.quadraticCurveTo(fX + 38, fY - 38, fX + 54, fY - 56);
        ctx.stroke();

        // Rod spool
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(fX + 14, fY - 12, 4, 0, Math.PI * 2);
        ctx.fill();
      } catch (e) {
        console.warn('Angler render error:', e);
      } finally {
        ctx.restore();
      }
    } catch (renderBoatErr) {
      console.error('Fatal boat render error:', renderBoatErr);
    } finally {
      ctx.restore();
    }

    // Drift items on water surface (rendered in world space, not boat-relative)
    if (this.driftItems && effectiveCameraY <= this.surfaceY + 50) {
      this.driftItems.render(ctx, effectiveCameraY);
    }
  }

  // BULLETPROOF Underwater Background with 7 Ocean Seas
  renderUnderwaterBackground(ctx, cameraY = 0, screenHeight) {
    const topY = Math.max(0, this.surfaceY - cameraY);
    const bottomY = screenHeight;
    if (topY >= bottomY) return;

    const visibleTopM = Math.max(0, (cameraY - this.surfaceY) / this.pixelsPerMeter);
    const visibleBottomM = (cameraY + screenHeight - this.surfaceY) / this.pixelsPerMeter;
    const depthSpan = Math.max(1, visibleBottomM - visibleTopM);

    try {
      const sea = getSeaById(this.currentSeaId) || FANTASY_SEAS[0];
      const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
      grad.addColorStop(0, depthWaterColor(visibleTopM, this.currentSeaId));
      grad.addColorStop(1, depthWaterColor(visibleBottomM, this.currentSeaId));
      ctx.fillStyle = grad;
    } catch (e) {
      ctx.fillStyle = '#0284c7';
    }

    ctx.fillRect(0, topY, this.worldWidth, bottomY - topY);

    // Undulating rainbow water wash for Sea 7 (Eldritch Chrono Void)
    if (this.currentSeaId === 7) {
      try {
        const t = this.waveTimer || 0;
        const rainbowShift = (t * 30) % 360;
        const waterRainbow = ctx.createLinearGradient(0, topY, this.worldWidth, bottomY);
        waterRainbow.addColorStop(0, `hsla(${rainbowShift}, 85%, 55%, 0.16)`);
        waterRainbow.addColorStop(0.33, `hsla(${(rainbowShift + 60) % 360}, 90%, 60%, 0.14)`);
        waterRainbow.addColorStop(0.66, `hsla(${(rainbowShift + 140) % 360}, 85%, 58%, 0.14)`);
        waterRainbow.addColorStop(1, `hsla(${(rainbowShift + 220) % 360}, 85%, 55%, 0.16)`);
        ctx.fillStyle = waterRainbow;
        ctx.fillRect(0, topY, this.worldWidth, bottomY - topY);
      } catch (e) {}
    }

    ctx.save();
    ctx.beginPath(); ctx.rect(0, topY, this.worldWidth, bottomY - topY); ctx.clip();

    this.renderAmbientWater(ctx, cameraY, screenHeight);
    drawDepthScenery(ctx, this.currentSeaId, cameraY, this.surfaceY, this.worldWidth, screenHeight);

    if (getRealmDepthZone((visibleTopM + visibleBottomM) * .5, this.currentSeaId).index > 0) {
      this.renderUnderwaterStarlight(ctx, cameraY, screenHeight);
    }

    // Mystical Water Atmospheres for Fantasy Realms (Realm 2+)
    if (this.currentSeaId >= 2) {
      this.renderMysticalWaters(ctx, cameraY, screenHeight);
    }

    // Sea 1: Sunlit Caustics & Reef Flora (0 - 45m)
    if (this.currentSeaId === 1) {
      this.renderCaustics(ctx, topY);
      this.renderSunlitReefFlora(ctx, cameraY, screenHeight);
    }

    // Sea 2: Bioluminescent Trench Plankton, Flora & Giant Background Titans (45 - 105m)
    if (this.currentSeaId === 2) {
      this.renderBioluminescentPlankton(ctx, cameraY, screenHeight);
      this.renderBioluminescentFlora(ctx, cameraY, screenHeight);
      this.renderBioluminescentTrenchTitans(ctx, cameraY, screenHeight);
    }

    // Sea 3: Astral Shimmerfall Starlight Cascades (105 - 180m)
    if (this.currentSeaId === 3) {
      this.renderAstralStarlightCascades(ctx, cameraY, screenHeight);
    }

    // Sea 4: Sunken Atlantis Marble Pillars & Gears (180 - 280m)
    if (this.currentSeaId === 4) {
      this.renderSunkenAtlantisPillars(ctx, cameraY, screenHeight);
    }

    // Sea 5: Whispering Aether Sea Sky-Islands & Lilac Winds (280 - 410m)
    if (this.currentSeaId === 5) {
      this.renderAetherSkyIslands(ctx, cameraY, screenHeight);
    }

    // Sea 6: Magma Caldera Trench Embers & Volcanic Spire (410 - 530m)
    if (this.currentSeaId === 6) {
      this.renderThermalVentBackground(ctx, cameraY, screenHeight);
    }

    // Sea 7: Eldritch Chrono Void Auroras & Space-Whales (530 - 660m+)
    if (this.currentSeaId === 7) {
      this.renderEldritchVoidWhales(ctx, cameraY, screenHeight);
    }

    ctx.restore();

    // Render Weather Effects: Rain ripples, fog drift, night stars & biolum plankton
    worldCycle.renderWeatherEffects(ctx, cameraY, this.worldWidth, screenHeight, this.surfaceY);
    drawEventAtmosphere(ctx, worldCycle.getGlobalEvent(), worldCycle.timer, this.worldWidth, screenHeight, this.surfaceY, cameraY, this.currentSeaId);
  }

  renderAmbientWater(ctx, cameraY, screenHeight) {
    const palette = REALM_PROFILES[this.currentSeaId]?.colors || REALM_PROFILES[1].colors;
    const first = Math.floor((cameraY - this.surfaceY) / 230) - 1;
    const last = Math.ceil((cameraY + screenHeight - this.surfaceY) / 230);
    const time = this.causticTimer;
    ctx.save(); ctx.globalAlpha *= .14; ctx.lineWidth = 1.5;
    for (let band = first; band <= last; band++) {
      const y = this.surfaceY + band * 230 - cameraY;
      const x = ((band * 173) % (this.worldWidth + 220) + this.worldWidth + 220) % (this.worldWidth + 220) - 110;
      for (let strand = 0; strand < 3; strand++) {
        const offset = strand * 13;
        ctx.strokeStyle = palette[(band + strand + 10) % palette.length];
        ctx.beginPath(); ctx.moveTo(x - 90, y + offset);
        ctx.bezierCurveTo(x - 30, y - 18 + Math.sin(time + band + strand) * 8 + offset,
          x + 35, y + 18 + Math.cos(time * .8 + band) * 7 + offset, x + 105, y + Math.sin(time + strand) * 5 + offset);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  renderUnderwaterStarlight(ctx, cameraY, screenHeight) {
    const time = this.causticTimer;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let index = 0; index < 4; index++) {
      const period = 8 + index * 1.25;
      const phase = ((time + index * 2.7) % period) / period;
      if (phase > .2) continue;
      const cycle = Math.floor((time + index * 2.7) / period);
      const startX = ((index * 263 + cycle * 127) % (this.worldWidth + 180)) - 90;
      const startY = ((index * 173 + cycle * 97) % (screenHeight + 120)) - 60;
      const progress = phase / .2;
      const x = startX + progress * (150 + index * 25);
      const y = startY + progress * (85 + index * 12);
      const alpha = .75 * (1 - progress * .65);
      ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * .45})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#a5f3fc'; ctx.shadowBlur = 9;
      ctx.beginPath(); ctx.moveTo(x - 27, y - 17); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = `rgba(240, 253, 250, ${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // Mystical Water Visuals (Realm 2+)
  renderMysticalWaters(ctx, cameraY, screenHeight) {
    ctx.save();
    const time = this.causticTimer;
    const profile = REALM_PROFILES[this.currentSeaId] || REALM_PROFILES[2];
    const colors = profile.colors || ['#38bdf8', '#c084fc', '#f43f5e'];

    // 1. Ethereal mystical shimmer ribbons weaving vertically through the water column
    ctx.globalCompositeOperation = 'lighter';
    const ribbonCount = 5;
    for (let r = 0; r < ribbonCount; r++) {
      const xBase = ((r * 240 + Math.sin(time * 0.4 + r) * 60) % (this.worldWidth + 160)) - 80;
      const col = colors[r % colors.length];
      const alpha = 0.06 + Math.sin(time * 0.8 + r * 1.5) * 0.03;

      ctx.save();
      const ribbonWidth = 14 + (r % 3) * 6;
      ctx.beginPath();
      ctx.moveTo(xBase, -40);
      ctx.bezierCurveTo(
        xBase + Math.sin(time * 0.5 + r) * 70,
        screenHeight * 0.33,
        xBase - Math.cos(time * 0.6 + r) * 70,
        screenHeight * 0.66,
        xBase + Math.sin(time * 0.3 + r) * 40,
        screenHeight + 40
      );
      // Soft outer glow ribbon under lighter
      ctx.globalAlpha = Math.max(0.015, alpha * 0.45);
      ctx.strokeStyle = col;
      ctx.lineWidth = ribbonWidth * 2.2;
      ctx.stroke();
      // Vibrant core ribbon
      ctx.globalAlpha = Math.max(0.02, alpha);
      ctx.strokeStyle = col;
      ctx.lineWidth = ribbonWidth;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Realm-specific floating mystical particulate motes (glow motes drifting naturally with the background)
    const moteSpacing = 64;
    const driftY = time * 14;
    const firstMote = Math.floor((cameraY - this.surfaceY - driftY - 40) / moteSpacing);
    const lastMote = Math.floor((cameraY + screenHeight - this.surfaceY - driftY + 40) / moteSpacing);
    for (let m = firstMote; m <= lastMote; m++) {
      const mx = (((m * 179 + Math.sin(time * 0.6 + m * 2) * 50 + time * 12) % (this.worldWidth + 100) + (this.worldWidth + 100)) % (this.worldWidth + 100)) - 50;
      const my = this.surfaceY + m * moteSpacing + driftY - cameraY + Math.cos(time * 0.5 + m) * 15;
      if (my < Math.max(0, this.surfaceY - cameraY) - 30 || my > screenHeight + 30) continue;
      const mSize = 1.8 + (Math.abs(m) % 3) * 1.2;
      const mCol = colors[(Math.abs(m) + 1) % colors.length];
      const pulse = 0.35 + Math.sin(time * 2.2 + m) * 0.25;

      ctx.save();
      // Outer soft glow halo
      ctx.globalAlpha = pulse * 0.4;
      ctx.fillStyle = mCol;
      ctx.beginPath();
      ctx.arc(mx, my, mSize * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Inner luminous mote core
      ctx.globalAlpha = pulse;
      ctx.fillStyle = mCol;
      ctx.beginPath();
      ctx.arc(mx, my, mSize, 0, Math.PI * 2);
      ctx.fill();

      // Delicate ethereal halo ring around some motes
      if (Math.abs(m) % 3 === 0) {
        ctx.strokeStyle = mCol;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(mx, my, mSize * 2.4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // Sea 1: Sunlit Caustics
  renderCaustics(ctx, topY) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const xOffset = (i * 220 + Math.sin(this.causticTimer + i) * 40) % (this.worldWidth + 200) - 100;
      try {
        const beamGrad = ctx.createLinearGradient(xOffset, topY, xOffset + 150, topY + 450);
        beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        beamGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.08)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = beamGrad;

        ctx.beginPath();
        ctx.moveTo(xOffset, topY);
        ctx.lineTo(xOffset + 60, topY);
        ctx.lineTo(xOffset + 240, topY + 500);
        ctx.lineTo(xOffset + 140, topY + 500);
        ctx.closePath();
        ctx.fill();
      } catch (e) {}
    }
    ctx.restore();
  }

  // Sea 1: Sunlit Shoals Kelp Forests, Coral Gardens & Seagrass Meadows
  renderSunlitReefFlora(ctx, cameraY, screenHeight) {
    ctx.save();
    const time = this.causticTimer || 0;
    const w = this.worldWidth;
    
    // Depth clusters: spaced well below the surface, sparse and spread out (55m+ depth)
    const clusterCount = 4;
    for (let c = 0; c < clusterCount; c++) {
      const worldX = ((c * 420 + 130) % (w - 140)) + 70;
      const worldY = this.surfaceY + 820 + (c * 240) % 900;
      const screenY = worldY - cameraY;
      if (screenY < -120 || screenY > screenHeight + 120) continue;

      ctx.save();
      ctx.translate(worldX, screenY);
      ctx.globalAlpha = 0.35 + (c % 3) * 0.15;

      const clusterType = c % 4;
      if (clusterType === 0) {
        // Swaying Giant Ribbon Kelp Strand with Pneumatocysts
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        const kelpHeight = 85 + (c % 3) * 25;
        const sway = Math.sin(time * 1.8 + c) * 16;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(sway * 0.4, -kelpHeight * 0.4, -sway * 0.6, -kelpHeight * 0.7, sway, -kelpHeight);
        ctx.stroke();

        // Blades & golden gas bladders (pneumatocysts)
        ctx.fillStyle = '#10b981';
        for (let b = 1; b <= 4; b++) {
          const tBlade = b / 5;
          const bx = sway * tBlade;
          const by = -kelpHeight * tBlade;
          const bladeSway = Math.sin(time * 2.2 + c + b) * 8;
          ctx.beginPath();
          ctx.ellipse(bx + (b % 2 ? 14 : -14), by + bladeSway, 12, 4, (b % 2 ? 0.3 : -0.3), 0, Math.PI * 2);
          ctx.fill();

          // Pneumatocyst golden bulb
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(bx + (b % 2 ? 4 : -4), by, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#10b981';
        }
      } else if (clusterType === 1) {
        // Vivid Rose & Turquoise Branching Staghorn Coral Grove
        const coralColor = ['#fb7185', '#2dd4bf', '#fb923c', '#f43f5e'][c % 4];
        ctx.strokeStyle = coralColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        for (let branch = -2; branch <= 2; branch++) {
          const bx = branch * 11;
          const bHeight = 35 + Math.abs(branch) * 6;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(bx * 0.5, -bHeight * 0.6, bx, -bHeight);
          ctx.stroke();
          // Coral tips
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(bx, -bHeight, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (clusterType === 2) {
        // Emerald & Seafoam Seagrass Cluster with undulating blades
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        for (let blade = -3; blade <= 3; blade++) {
          const bladeSway = Math.sin(time * 2 + c + blade * 0.4) * 12;
          ctx.beginPath();
          ctx.moveTo(blade * 5, 0);
          ctx.quadraticCurveTo(blade * 6 + bladeSway * 0.5, -28, blade * 4 + bladeSway, -52);
          ctx.stroke();
        }
      } else {
        // Living Coral Shelf with Waving Sea Anemone Tentacles
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Anemone tentacles waving atop the shelf
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.6;
        for (let tent = -4; tent <= 4; tent++) {
          const tx = tent * 4;
          const tSway = Math.sin(time * 3 + c + tent) * 7;
          ctx.beginPath();
          ctx.moveTo(tx, -4);
          ctx.quadraticCurveTo(tx + tSway * 0.6, -14, tx + tSway, -22);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
    ctx.restore();
  }

  // Sea 2: Bioluminescent Trench Luminous Flora, Phosphorescent Fans & Fungi
  renderBioluminescentFlora(ctx, cameraY, screenHeight) {
    ctx.save();
    const time = this.causticTimer || 0;
    const w = this.worldWidth;
    
    // Depth clusters in Realm 2: sparse and spread out, well below the surface (50m+ depth)
    const clusterCount = 7;
    for (let c = 0; c < clusterCount; c++) {
      const worldX = ((c * 320 + 90) % (w - 140)) + 70;
      const worldY = this.surfaceY + 750 + (c * 160) % 1050;
      const screenY = worldY - cameraY;
      if (screenY < -130 || screenY > screenHeight + 130) continue;

      ctx.save();
      ctx.translate(worldX, screenY);
      ctx.globalAlpha = 0.42 + (c % 3) * 0.16;

      const floraType = c % 3;
      if (floraType === 0) {
        // Glowing Neon Gorgonian Sea Fan with Pulsating Polyps
        const fanColor = c % 2 === 0 ? '#38bdf8' : '#a855f7';
        ctx.strokeStyle = fanColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        const fanSway = Math.sin(time * 1.4 + c) * 9;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(fanSway * 0.3, -22);
        ctx.stroke();

        // Branching delicate fan grid
        ctx.lineWidth = 1.5;
        for (let fb = -3; fb <= 3; fb++) {
          const bx = fb * 9 + fanSway;
          const by = -22 - 28 + Math.abs(fb) * 4;
          ctx.beginPath();
          ctx.moveTo(fanSway * 0.3, -22);
          ctx.quadraticCurveTo(bx * 0.6, by + 12, bx, by);
          ctx.stroke();

          // Luminous tip node
          ctx.fillStyle = '#67e8f9';
          ctx.beginPath();
          ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (floraType === 1) {
        // Phosphorescent Shelf Bracket Coral / Fungal Ledges
        ctx.fillStyle = c % 2 ? '#34d399' : '#818cf8';
        for (let shelf = 0; shelf < 3; shelf++) {
          const sx = (shelf % 2 ? 1 : -1) * 12;
          const sy = -shelf * 18;
          ctx.beginPath();
          ctx.ellipse(sx, sy, 18 - shelf * 2, 7, (shelf % 2 ? 0.2 : -0.2), 0, Math.PI * 2);
          ctx.fill();

          // Bioluminescent glow margin
          ctx.strokeStyle = '#a7f3d0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else {
        // Abyssal Lantern Tendril Plants with undulating spore filaments
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        for (let tend = -2; tend <= 2; tend++) {
          const tSway = Math.sin(time * 2.2 + c + tend * 0.7) * 14;
          const tx = tend * 8;
          ctx.beginPath();
          ctx.moveTo(tx, 0);
          ctx.bezierCurveTo(tx + tSway * 0.4, -30, tx - tSway * 0.4, -60, tx + tSway, -85);
          ctx.stroke();

          // Glowing photophore lantern bulb on tip
          const bulbPulse = 0.5 + Math.sin(time * 3 + c + tend) * 0.5;
          ctx.fillStyle = `rgba(165, 243, 252, ${bulbPulse * 0.8})`;
          ctx.beginPath();
          ctx.arc(tx + tSway, -85, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
    ctx.restore();
  }

  // Sea 2: Bioluminescent Trench Rare Giant Background Behemoths
  // Visual-only, uncatchable, scary & cool deep-sea titans that rarely swim across the trench background
  renderBioluminescentTrenchTitans(ctx, cameraY, screenHeight) {
    const time = this.causticTimer || 0;
    const w = this.worldWidth || 1200;
    const h = screenHeight || 800;

    // Trench titan configurations: massive scale, slow ominous swim, wide horizontal cycle so they appear rarely
    const spanX = w + 4800;
    const parallaxY = Math.max(0, cameraY - this.surfaceY) * 0.32;
    const vSpan = 1400;

    const titanConfigs = [
      // Titan 1: The Abyssal Phantasm Leviathan (Colossal Deep-Trench Gulper with luminous lure and glowing ribcage)
      { type: 'gulper', dir: 1, speed: 20, scale: 1.45, baseY: 380, phaseOffset: 0 },
      // Titan 2: The Dread Umbral Shadow Behemoth (Segmented prehistoric leviathan with multi-eye clusters & glowing photophores)
      { type: 'shadow', dir: -1, speed: 17, scale: 1.35, baseY: 960, phaseOffset: 2600 },
    ];

    for (let tIdx = 0; tIdx < titanConfigs.length; tIdx++) {
      const cfg = titanConfigs[tIdx];
      const phase = (time * cfg.speed + cfg.phaseOffset) % spanX;
      const tx = cfg.dir === 1 ? (-380 + phase) : ((w + 380) - phase);

      // Vertical positioning in the trench depths with subtle parallax and serpentine wave
      const scrolledY = (((cfg.baseY - parallaxY) % vSpan) + vSpan) % vSpan - 180;
      const ty = (this.surfaceY - cameraY) + 720 + scrolledY + Math.sin(time * 0.5 + tIdx * 2.5) * 28;

      // Cull if completely off screen
      if (ty < -220 || ty > h + 220 || tx < -450 || tx > w + 450) continue;

      const tPitch = Math.cos(time * 0.5 + tIdx * 2.5) * 0.05 * cfg.dir;
      const tScale = cfg.scale;

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(tPitch);
      ctx.scale(cfg.dir * tScale, tScale);

      if (cfg.type === 'gulper') {
        // ==========================================
        // TITAN 1: COLOSSAL ABYSSAL GULPER LEVIATHAN
        // ==========================================
        ctx.globalAlpha = 0.38;

        // 1. Massive Cavernous Body Silhouette (Deep Abyssal Indigo/Cyan gradient)
        try {
          const bGrad = ctx.createLinearGradient(-140, -40, 160, 40);
          bGrad.addColorStop(0, '#020617');
          bGrad.addColorStop(0.3, '#0f172a');
          bGrad.addColorStop(0.65, '#082f49');
          bGrad.addColorStop(1, '#0e7490');
          ctx.fillStyle = bGrad;
        } catch (_) {
          ctx.fillStyle = '#082f49';
        }

        // Giant serpentine body undulating into a cavernous gaping gulper jaw
        ctx.beginPath();
        ctx.moveTo(150, -18);
        ctx.quadraticCurveTo(80, -45, -20, -38);
        ctx.quadraticCurveTo(-110, -28, -210, 0);
        ctx.quadraticCurveTo(-120, 32, -30, 36);
        ctx.quadraticCurveTo(60, 52, 140, 30);
        ctx.lineTo(85, -2);
        ctx.closePath();
        ctx.fill();

        // 2. Cavernous Gaping Jaws & Terrifying Needle Pharyngeal Fangs
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.moveTo(148, -16);
        ctx.quadraticCurveTo(110, -2, 78, -2);
        ctx.quadraticCurveTo(105, 20, 138, 28);
        ctx.closePath();
        ctx.fill();

        // Translucent glowing needle fangs
        ctx.strokeStyle = 'rgba(103, 232, 249, 0.75)';
        ctx.lineWidth = 1.4;
        const upperFangs = [142, 130, 118, 106, 94];
        upperFangs.forEach(fx => {
          ctx.beginPath();
          ctx.moveTo(fx, -14);
          ctx.lineTo(fx - 4, 2);
          ctx.stroke();
        });
        const lowerFangs = [134, 122, 110, 98, 86];
        lowerFangs.forEach(fx => {
          ctx.beginPath();
          ctx.moveTo(fx, 24);
          ctx.lineTo(fx - 3, 10);
          ctx.stroke();
        });

        // 3. Colossal Cranial Illicium Stalk & Glowing Bioluminescent Esca Lantern
        const lureSway = Math.sin(time * 1.8) * 8;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(110, -32);
        ctx.bezierCurveTo(155, -75, 195, -55 + lureSway, 210, -30 + lureSway);
        ctx.stroke();

        // Glowing Bioluminescent Esca
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        try {
          const escaGlow = ctx.createRadialGradient(210, -30 + lureSway, 2, 210, -30 + lureSway, 32);
          escaGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          escaGlow.addColorStop(0.3, 'rgba(34, 211, 238, 0.8)');
          escaGlow.addColorStop(0.7, 'rgba(6, 182, 212, 0.35)');
          escaGlow.addColorStop(1, 'rgba(8, 47, 73, 0)');
          ctx.fillStyle = escaGlow;
        } catch (_) {
          ctx.fillStyle = 'rgba(34, 211, 238, 0.8)';
        }
        ctx.beginPath();
        ctx.arc(210, -30 + lureSway, 32, 0, Math.PI * 2);
        ctx.fill();

        // Esca lantern core bulb
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.arc(210, -30 + lureSway, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Undulating Ghostly Caudal Flukes & Spiny Dorsal Fin Frills
        const flukeWave = Math.sin(time * 2.4) * 16;
        ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.beginPath();
        ctx.moveTo(-205, 0);
        ctx.quadraticCurveTo(-245, -35 + flukeWave, -270, -45 + flukeWave);
        ctx.quadraticCurveTo(-250, flukeWave * 0.4, -285, flukeWave);
        ctx.quadraticCurveTo(-250, flukeWave * 0.4, -270, 45 + flukeWave);
        ctx.quadraticCurveTo(-245, 35 + flukeWave, -205, 0);
        ctx.closePath();
        ctx.fill();

        // 5. Bioluminescent Spine Photophores & Glowing Skeletal Ribs along flank
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let r = 0; r < 8; r++) {
          const rx = 50 - r * 28;
          const rCurv = Math.sin(time * 1.5 + r * 0.4) * 5;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(rx, -24 + rCurv * 0.5);
          ctx.quadraticCurveTo(rx + 6, 2, rx - 4, 26 + rCurv);
          ctx.stroke();

          // Luminous photophore node on each spine vertex
          ctx.fillStyle = r % 2 === 0 ? '#38bdf8' : '#a855f7';
          ctx.beginPath();
          ctx.arc(rx, -26 + rCurv * 0.5, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pale, unblinking abyss eye with slit pupil
        ctx.fillStyle = 'rgba(240, 253, 250, 0.85)';
        ctx.beginPath();
        ctx.arc(116, -18, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.ellipse(116, -18, 1.4, 4.2, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else {
        // ==========================================
        // TITAN 2: DREAD UMBRAL SHADOW BEHEMOTH
        // ==========================================
        ctx.globalAlpha = 0.36;

        // 1. Chitinous Armored Abyssal Serpent Body
        try {
          const sGrad = ctx.createLinearGradient(-160, -35, 170, 35);
          sGrad.addColorStop(0, '#020617');
          sGrad.addColorStop(0.35, '#1e1b4b');
          sGrad.addColorStop(0.7, '#312e81');
          sGrad.addColorStop(1, '#4c1d95');
          ctx.fillStyle = sGrad;
        } catch (_) {
          ctx.fillStyle = '#1e1b4b';
        }

        ctx.beginPath();
        ctx.moveTo(170, 0);
        ctx.quadraticCurveTo(110, -32, 20, -30);
        ctx.quadraticCurveTo(-80, -26, -220, 0);
        ctx.quadraticCurveTo(-110, 24, 0, 28);
        ctx.quadraticCurveTo(90, 28, 170, 0);
        ctx.closePath();
        ctx.fill();

        // 2. Chitinous Armored Dorsal Scutes / Spikes
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
        ctx.lineWidth = 1.4;
        for (let sp = 0; sp < 7; sp++) {
          const spx = 120 - sp * 38;
          ctx.beginPath();
          ctx.moveTo(spx - 12, -26);
          ctx.lineTo(spx, -44 - (sp % 2) * 8);
          ctx.lineTo(spx + 10, -24);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // 3. Terrifying Multi-Tiered Predatory Eye Clusters
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const eyeCluster = [
          { x: 145, y: -8, r: 4.2, col: '#f43f5e' },
          { x: 154, y: -4, r: 3.4, col: '#fb7185' },
          { x: 140, y: -2, r: 2.8, col: '#a855f7' },
          { x: 148, y: 4, r: 3.6, col: '#e11d48' },
        ];
        eyeCluster.forEach(eye => {
          ctx.fillStyle = eye.col;
          ctx.beginPath();
          ctx.arc(eye.x, eye.y, eye.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // 4. Undulating Luminous Sensory Barbel Whisker Tendrils trailing from jaw
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
        ctx.lineWidth = 2.0;
        for (let barbel = 0; barbel < 3; barbel++) {
          const bWave = Math.sin(time * 2.5 + barbel * 1.2) * 14;
          ctx.beginPath();
          ctx.moveTo(135 - barbel * 14, 18);
          ctx.bezierCurveTo(70, 48 + bWave, -20, 68 - bWave, -90, 85 + bWave * 0.8);
          ctx.stroke();
        }

        // 5. Ventral Luminous Photophore Dots (Bioluminescent Trench Lantern Constellation)
        for (let vp = 0; vp < 9; vp++) {
          const vpx = 120 - vp * 34;
          const vpy = 18 + Math.sin(time * 1.2 + vp * 0.5) * 4;
          ctx.fillStyle = vp % 2 === 0 ? '#22d3ee' : '#c084fc';
          ctx.beginPath();
          ctx.arc(vpx, vpy, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // Sea 2: Bioluminescent Trench Plankton & Jellies
  renderBioluminescentPlankton(ctx, cameraY, screenHeight) {
    ctx.save();
    const time = this.causticTimer;
    ctx.globalCompositeOperation = 'lighter';
    for (let ribbon = 0; ribbon < 6; ribbon++) {
      const x = ((ribbon * 197 + Math.sin(time * .22 + ribbon) * 70) % (this.worldWidth + 100) + this.worldWidth + 100) % (this.worldWidth + 100) - 50;
      const hue = ribbon % 2 ? '91, 141, 255' : '83, 255, 218';
      const baseAlpha = .09 + (Math.sin(time * .5 + ribbon) + 1) * .035;
      const coreWidth = 10 + ribbon % 3 * 5;
      ctx.beginPath();
      ctx.moveTo(x, this.surfaceY - cameraY + 20);
      ctx.bezierCurveTo(x - 80, screenHeight * .32, x + 95, screenHeight * .62, x + Math.sin(time * .3 + ribbon) * 40, screenHeight + 40);

      // Outer soft glow stroke under lighter
      ctx.globalAlpha = baseAlpha * 0.45;
      ctx.strokeStyle = `rgba(${hue}, .5)`;
      ctx.lineWidth = coreWidth * 2.4;
      ctx.stroke();

      // Vibrant core ribbon stroke
      ctx.globalAlpha = baseAlpha;
      ctx.strokeStyle = `rgba(${hue}, .85)`;
      ctx.lineWidth = coreWidth;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const spacing = 48;
    const drift = time * 8;
    const first = Math.floor((cameraY - this.surfaceY - drift - 20) / spacing);
    const last = Math.floor((cameraY + screenHeight - this.surfaceY - drift + 20) / spacing);
    for (let i = first; i <= last; i++) {
      const px = (((i * 137 + time * 12) % Math.max(1, this.worldWidth - 40) + Math.max(1, this.worldWidth - 40)) % Math.max(1, this.worldWidth - 40)) + 20;
      const py = this.surfaceY + 20 + i * spacing + drift - cameraY;
      if (py < Math.max(0, this.surfaceY - cameraY) || py > screenHeight) continue;

      const pulse = 0.4 + Math.sin(time * 3 + i) * 0.4;
      const isCyan = i % 2 === 0;
      const rad = 2.5 + Math.sin(time + i) * 1.0;

      // Outer glowing halo (replaces costly Gaussian blur)
      ctx.fillStyle = isCyan ? `rgba(56, 189, 248, ${pulse * 0.35})` : `rgba(168, 85, 247, ${pulse * 0.35})`;
      ctx.beginPath();
      ctx.arc(px, py, rad * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Radiant incandescent core
      ctx.fillStyle = isCyan ? `rgba(224, 242, 254, ${pulse * 0.85})` : `rgba(243, 232, 255, ${pulse * 0.85})`;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();

      if (i % 5 === 0) {
        ctx.globalAlpha = .24 + pulse * .18;
        ctx.strokeStyle = isCyan ? '#67e8f9' : '#d8b4fe';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py + 5);
        ctx.bezierCurveTo(px - 12, py + 17, px + 12, py + 24, px + Math.sin(time + i) * 7, py + 36);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }

  // Sea 3: Astral Shimmerfall Starlight Cascades & Celestial Constellations
  renderAstralStarlightCascades(ctx, cameraY, screenHeight) {
    ctx.save();
    const time = this.causticTimer * 1.5;
    const spacing = 40;
    const drift = time * 45;
    const first = Math.floor((cameraY - this.surfaceY - drift - 20) / spacing);
    const last = Math.floor((cameraY + screenHeight - this.surfaceY - drift + 20) / spacing);
    for (let i = first; i <= last; i++) {
      const span = this.worldWidth + 100;
      const driftX = ((i * 179 + time * 25) % span + span) % span - 50;
      const driftY = this.surfaceY + 20 + i * spacing + drift - cameraY;
      if (driftY < Math.max(18, this.surfaceY - cameraY + 18) || driftY > screenHeight) continue;

      const alpha = 0.35 + Math.sin(time * 2 + i) * 0.35;
      const size = 3 + i % 4 * 1.2;

      // Faceted crystal star shard
      ctx.save(); ctx.translate(driftX, driftY); ctx.rotate(time * .45 + i * .8);
      const shard = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
      shard.addColorStop(0, `rgba(255,255,255,${alpha})`);
      shard.addColorStop(.45, `rgba(191,219,254,${alpha * .85})`);
      shard.addColorStop(1, `rgba(192,132,252,${alpha * .4})`);
      ctx.fillStyle = shard; ctx.strokeStyle = `rgba(224,231,255,${alpha})`; ctx.lineWidth = 1;
      ctx.shadowColor = '#c4b5fd'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(0, -size * 1.65); ctx.lineTo(size, size * .9); ctx.lineTo(0, size * .45); ctx.lineTo(-size, size * 1.1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();

      // Glowing star core (world-anchored Y satisfies camera tests)
      ctx.globalAlpha = alpha; ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#c4b5fd'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(driftX, driftY, 1.4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

      // Sparkling 4-point star glint for bright stars
      if (i % 2 === 0) {
        ctx.strokeStyle = `rgba(248, 250, 252, ${alpha * 0.6})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(driftX - 3.5, driftY); ctx.lineTo(driftX + 3.5, driftY);
        ctx.moveTo(driftX, driftY - 3.5); ctx.lineTo(driftX, driftY + 3.5);
        ctx.stroke();
      }

      // Constellation connecting filament with neighboring star node
      if (i % 3 === 0) {
        const partnerX = ((driftX + 38) % span + span) % span - 50;
        const partnerY = driftY + 18;
        ctx.strokeStyle = `rgba(199, 210, 254, ${alpha * 0.38})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(driftX, driftY);
        ctx.lineTo(partnerX, partnerY);
        ctx.stroke();
        ctx.fillStyle = '#e0e7ff';
        ctx.beginPath(); ctx.arc(partnerX, partnerY, 1.1, 0, Math.PI * 2); ctx.fill();
      }

      // Shooting star comet streaks
      if (i % 5 === 0) {
        const trailLen = 22 + (i % 4) * 6;
        ctx.strokeStyle = `rgba(167, 139, 250, ${alpha * 0.45})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(driftX - 3, driftY - 3);
        ctx.lineTo(driftX - trailLen * 0.7, driftY - trailLen);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Sea 4: Sunken Atlantis Marble Pillars & Ancient Gilded Gears
  renderSunkenAtlantisPillars(ctx, cameraY, screenHeight) {
    // Ruins belong to a fixed world depth, independent of the moving camera.
    const basePillarY = this.surfaceY + 60 * this.pixelsPerMeter - cameraY;

    if (basePillarY < -300 || basePillarY > screenHeight + 300) return;

    ctx.save();
    // Marble Pillar 1 (Left flank)
    ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.fillRect(80, basePillarY - 180, 28, 180);
    // Fluted lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 2;
    for (let fl = 0; fl < 4; fl++) {
      ctx.beginPath();
      ctx.moveTo(85 + fl * 6, basePillarY - 180);
      ctx.lineTo(85 + fl * 6, basePillarY);
      ctx.stroke();
    }
    // Capital & base
    ctx.fillStyle = 'rgba(203, 213, 225, 0.55)';
    ctx.fillRect(72, basePillarY - 192, 44, 12);
    ctx.fillRect(72, basePillarY, 44, 14);

    const p2X = this.worldWidth - 120;
    ctx.globalAlpha = .72; ctx.strokeStyle = 'rgba(116, 232, 216, .5)'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(116, basePillarY - 24);
    ctx.bezierCurveTo(this.worldWidth * .28, basePillarY - 170, this.worldWidth * .68, basePillarY - 170, p2X, basePillarY - 24); ctx.stroke();
    for (let tower = 0; tower < 7; tower++) {
      const tx = 80 + tower * (this.worldWidth - 160) / 6;
      const towerHeight = 65 + (tower % 3) * 24;
      ctx.fillStyle = tower % 2 ? 'rgba(39, 105, 112, .34)' : 'rgba(69, 111, 126, .3)';
      ctx.fillRect(tx, basePillarY - towerHeight, 24, towerHeight + 35);
      ctx.fillStyle = tower % 2 ? '#f6d994' : '#8cf2e0';
      for (let window = 0; window < 3; window++) {
        ctx.globalAlpha = .35 + .2 * Math.sin(this.causticTimer + tower + window);
        ctx.fillRect(tx + 6 + (window % 2) * 8, basePillarY - towerHeight + 13 + window * 19, 4, 8);
      }
    }

    // Marble Pillar 2 (Right flank)
    ctx.fillStyle = 'rgba(226, 232, 240, 0.4)';
    ctx.fillRect(p2X, basePillarY - 150, 26, 150);
    for (let fl = 0; fl < 4; fl++) {
      ctx.beginPath();
      ctx.moveTo(p2X + 5 + fl * 5, basePillarY - 150);
      ctx.lineTo(p2X + 5 + fl * 5, basePillarY);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(203, 213, 225, 0.5)';
    ctx.fillRect(p2X - 8, basePillarY - 162, 42, 12);
    ctx.fillRect(p2X - 8, basePillarY, 42, 14);

    // Sunken antique gear silhouette
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(p2X - 35, basePillarY - 20, 22, 0, Math.PI * 2);
    ctx.stroke();

    // Unique Atlantean Water Flow & Hydrodynamic Current Visuals
    const time = this.causticTimer || 0;
    const w = this.worldWidth;

    // 1. Laminar Aqueduct Surge Streams (flowing between pillars and through arches)
    for (let f = 0; f < 3; f++) {
      const flowY = basePillarY - 140 + f * 55;
      const flowAlpha = 0.28 + 0.12 * Math.sin(time * 2 + f);
      ctx.strokeStyle = f % 2 === 0 ? `rgba(45, 212, 191, ${flowAlpha})` : `rgba(56, 189, 248, ${flowAlpha})`;
      ctx.lineWidth = 3.5 - f * 0.5;
      ctx.lineCap = 'round';

      // Undulating current ribbon
      ctx.beginPath();
      ctx.moveTo(30, flowY + Math.sin(time * 2.2) * 8);
      ctx.bezierCurveTo(
        w * 0.3, flowY - 25 + Math.sin(time * 2.5 + f) * 12,
        w * 0.7, flowY + 25 + Math.cos(time * 2.5 + f) * 12,
        w - 30, flowY + Math.sin(time * 2.2 + 2) * 8
      );
      ctx.stroke();

      // Dashed rapid current streamlines with forward drift
      ctx.setLineDash([16, 26]);
      ctx.lineDashOffset = -time * (60 + f * 20);
      ctx.strokeStyle = `rgba(224, 242, 254, ${flowAlpha * 0.75})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Swirling Hydrodynamic Eddies / Vortices near archways and antique cogs
    const eddyPositions = [
      { x: 180, y: basePillarY - 80, r: 18, dir: 1 },
      { x: p2X - 50, y: basePillarY - 45, r: 24, dir: -1 },
      { x: w * 0.52, y: basePillarY - 120, r: 22, dir: 1 },
    ];
    for (const eddy of eddyPositions) {
      ctx.save();
      ctx.translate(eddy.x, eddy.y);
      const eddyAngle = time * 2.2 * eddy.dir;
      ctx.rotate(eddyAngle);
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.32)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2.5; a += 0.35) {
        const rad = (a / (Math.PI * 2.5)) * eddy.r;
        const ex = Math.cos(a) * rad;
        const ey = Math.sin(a) * rad;
        if (a === 0) ctx.moveTo(ex, ey);
        else ctx.lineTo(ex, ey);
      }
      ctx.stroke();

      // Trailing hydro-sparkle in eddy center
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(Math.cos(time * 3) * 6, Math.sin(time * 3) * 6, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // Sea 5: Whispering Aether Sea Clouds & Sky-Islands
  renderAetherSkyIslands(ctx, cameraY, screenHeight) {
    // These islands sit in the world, never pinned to a screen corner.
    const aetherDrawY = this.surfaceY + 85 * this.pixelsPerMeter - cameraY;

    if (aetherDrawY < -200 || aetherDrawY > screenHeight + 200) return;

    ctx.save();
    const time = this.causticTimer;

    // Mystical ambient aether ribbon stream (soft translucent horizontal gradient)
    try {
      const streamGrad = ctx.createLinearGradient(0, aetherDrawY - 90, 0, aetherDrawY + 110);
      streamGrad.addColorStop(0, 'rgba(192, 132, 252, 0)');
      streamGrad.addColorStop(0.35, 'rgba(192, 132, 252, 0.12)');
      streamGrad.addColorStop(0.65, 'rgba(125, 211, 252, 0.12)');
      streamGrad.addColorStop(1, 'rgba(125, 211, 252, 0)');
      ctx.fillStyle = streamGrad;
      ctx.fillRect(0, aetherDrawY - 90, this.worldWidth, 200);
    } catch (e) {}

    // Floating sky island silhouette (Left) - exactly 1st moveTo
    ctx.fillStyle = 'rgba(76, 29, 149, 0.52)';
    ctx.beginPath();
    ctx.moveTo(60, aetherDrawY);
    ctx.quadraticCurveTo(140, aetherDrawY - 30, 220, aetherDrawY);
    ctx.lineTo(190, aetherDrawY + 45);
    ctx.quadraticCurveTo(140, aetherDrawY + 80, 90, aetherDrawY + 45);
    ctx.closePath();
    ctx.fill();

    // Floating sky island silhouette (Right) - exactly 2nd moveTo
    const isle2X = this.worldWidth - 240;
    ctx.fillStyle = 'rgba(125, 157, 205, 0.42)';
    ctx.beginPath();
    ctx.moveTo(isle2X, aetherDrawY - 40);
    ctx.quadraticCurveTo(isle2X + 70, aetherDrawY - 65, isle2X + 150, aetherDrawY - 40);
    ctx.lineTo(isle2X + 125, aetherDrawY);
    ctx.quadraticCurveTo(isle2X + 70, aetherDrawY + 30, isle2X + 25, aetherDrawY);
    ctx.closePath();
    ctx.fill();

    // Island 1 Lush Cloudmoss Cap & Hanging Misty Veils
    ctx.fillStyle = 'rgba(125, 211, 252, 0.35)';
    ctx.beginPath();
    ctx.ellipse(140, aetherDrawY - 14, 65, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Island 2 Ethereal Amethyst Spire Cap
    ctx.fillStyle = 'rgba(232, 121, 249, 0.3)';
    ctx.beginPath();
    ctx.ellipse(isle2X + 75, aetherDrawY - 50, 55, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mystical Lilac & Cyan Floating Aether Wind Motes & Celestial Runic Sparks
    for (let w = 0; w < 16; w++) {
      const wx = ((w * 85 + time * 32) % (this.worldWidth + 60)) - 30;
      const wy = (aetherDrawY - 60 + Math.sin(time * 2 + w) * 42);
      const isCyan = w % 2 === 0;
      const moteRadius = 1.8 + (w % 3) * 0.8;
      ctx.fillStyle = isCyan ? 'rgba(125, 211, 252, 0.55)' : 'rgba(240, 171, 252, 0.55)';
      ctx.beginPath();
      ctx.arc(wx, wy, moteRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Sea 6: Magma Caldera Trench Deep Ambient Thermal Heat & Vents
  renderThermalVentBackground(ctx, cameraY, screenHeight) {
    const ventY = Math.max(this.surfaceY - cameraY + 100, screenHeight * 0.55);
    if (ventY < -250 || ventY > screenHeight + 250) return;

    ctx.save();
    // Warm atmospheric thermal glow in deep water
    try {
      const glowGrad = ctx.createRadialGradient(this.worldWidth * 0.5, ventY + 60, 20, this.worldWidth * 0.5, ventY + 60, 280);
      glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.22)');
      glowGrad.addColorStop(0.6, 'rgba(185, 28, 28, 0.08)');
      glowGrad.addColorStop(1, 'rgba(69, 10, 10, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, ventY - 150, this.worldWidth, 400);
    } catch (e) {}

    // Upward floating deep-sea volcanic embers & thermal plumes
    const time = this.causticTimer * 2;
    for (let e = 0; e < 16; e++) {
      const ex = this.worldWidth * 0.5 - 80 + ((e * 47 + Math.sin(time + e) * 25) % 160);
      const ey = ventY + 160 - ((e * 28 + time * 35) % 220);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.75)';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Sea 7: Eldritch Chrono Void Auroras, Cosmic Nebulas & Gliding Space-Whales
  renderEldritchVoidWhales(ctx, cameraY, screenHeight) {
    const seaStartY = Math.max(this.surfaceY, cameraY - 120);
    const voidY = seaStartY - cameraY;
    const w = this.worldWidth || 1200;

    ctx.save();
    const time = this.causticTimer * 0.75;
    const t = this.waveTimer || 0;

    // 1. Vast Deep-Space Chrono Void Rift Circles & Swirling Nebular Veils (Rare apparition)
    for (let rift = 0; rift < 3; rift++) {
      // Rare apparition cycle: each circle anomaly appears rarely on a long cycle and fades out smoothly
      const riftCycle = 80;
      const riftPhase = ((t + rift * 27) % riftCycle);
      let riftVisibility = 0;
      if (riftPhase < 58) {
        riftVisibility = 0; // Dormant / invisible for 58s
      } else if (riftPhase < 63) {
        riftVisibility = (riftPhase - 58) / 5; // Gentle fade in over 5s
      } else if (riftPhase < 72) {
        riftVisibility = 1.0; // Shimmers in the cosmic void for 9s
      } else {
        riftVisibility = (80 - riftPhase) / 8; // Fades out smoothly over 8s
      }

      if (riftVisibility <= 0.005) continue;

      const rx = ((rift * (w * 0.42) + Math.sin(time * 0.4 + rift * 1.5) * 60) % (w + 260) + w + 260) % (w + 260) - 130;
      const ry = voidY + 80 + rift * 190;
      try {
        const riftGrad = ctx.createRadialGradient(rx + 90, ry + 120, 20, rx + 90, ry + 120, 260);
        const hue = (t * 22 + rift * 70) % 360;
        riftGrad.addColorStop(0, `hsla(${hue}, 85%, 65%, ${0.16 * riftVisibility})`);
        riftGrad.addColorStop(0.35, `hsla(${(hue + 55) % 360}, 90%, 55%, ${0.11 * riftVisibility})`);
        riftGrad.addColorStop(0.7, `hsla(${(hue + 120) % 360}, 80%, 40%, ${0.06 * riftVisibility})`);
        riftGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');
        ctx.fillStyle = riftGrad;
        ctx.beginPath();
        ctx.ellipse(rx + 90, ry + 120, 240, 160, Math.sin(time * 0.3 + rift) * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } catch (e) {}
    }

    // 2. Weaving Iridescent Aurora Ribbons through the abyss
    for (let a = 0; a < 4; a++) {
      const aX = ((a * 290 + Math.sin(time * 0.8 + a) * 70) % (w + 240) + w + 240) % (w + 240) - 120;
      const aGrad = ctx.createLinearGradient(aX, voidY, aX + 220, voidY + screenHeight);
      const aHue = (t * 30 + a * 65) % 360;
      aGrad.addColorStop(0, `hsla(${aHue}, 90%, 70%, 0.14)`);
      aGrad.addColorStop(0.4, `hsla(${(aHue + 60) % 360}, 95%, 65%, 0.12)`);
      aGrad.addColorStop(0.75, `hsla(${(aHue + 130) % 360}, 85%, 55%, 0.08)`);
      aGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.moveTo(aX, voidY);
      ctx.bezierCurveTo(
        aX + 90 + Math.sin(time + a) * 50, voidY + screenHeight * 0.35,
        aX - 50 + Math.cos(time * 1.2 + a) * 60, voidY + screenHeight * 0.7,
        aX + 80, voidY + screenHeight
      );
      ctx.lineTo(aX + 180, voidY + screenHeight);
      ctx.bezierCurveTo(
        aX + 60 + Math.cos(time * 1.2 + a) * 60, voidY + screenHeight * 0.7,
        aX + 190 + Math.sin(time + a) * 50, voidY + screenHeight * 0.35,
        aX + 140, voidY
      );
      ctx.closePath();
      ctx.fill();
    }

    // 3. Rare, Majestic Background Celestial Space-Whales gracefully gliding forward through the deep cosmos
    const h = screenHeight || 800;
    // Greatly expanded travel span ensures space-whales appear only rarely as majestic cosmic sights
    const spanX = w + 5400;
    const parallaxY = Math.max(0, cameraY - this.surfaceY) * 0.30;
    const vSpan = 2200;
    const whaleConfigs = [
      { dir: 1, speed: 22, scale: 1.38, baseY: 420, phaseOffset: 0 },
      { dir: -1, speed: 18, scale: 1.12, baseY: 1480, phaseOffset: 2700 },
    ];
    for (let wIdx = 0; wIdx < whaleConfigs.length; wIdx++) {
      const cfg = whaleConfigs[wIdx];
      const wPhase = (time * cfg.speed + cfg.phaseOffset) % spanX;
      // Snout is drawn at +125 (right) and tail flukes at -155 (left).
      // When dir === 1 (entering from left, moving right), scale(+wScale, wScale) so snout leads forward (+X).
      // When dir === -1 (entering from right, moving left), scale(-wScale, wScale) so snout leads forward (-X).
      const wx = cfg.dir === 1 ? (-320 + wPhase) : ((w + 320) - wPhase);
      const scrolledY = (((cfg.baseY - parallaxY) % vSpan) + vSpan) % vSpan - 200;
      const wy = voidY + scrolledY + Math.sin(time * 0.6 + wIdx * 2) * 22;
      if (wy < -180 || wy > h + 180) continue;
      const wPitch = Math.cos(time * 0.6 + wIdx * 2) * 0.06 * cfg.dir;
      const wScale = cfg.scale;

      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(wPitch);
      ctx.scale(cfg.dir * wScale, wScale);
      ctx.globalAlpha = 0.28;

      // Whale Body Silhouette (deep cosmic indigo with bioluminescent constellation)
      const wGrad = ctx.createLinearGradient(-110, -25, 110, 25);
      wGrad.addColorStop(0, '#0369a1');
      wGrad.addColorStop(0.35, '#38bdf8');
      wGrad.addColorStop(0.7, '#818cf8');
      wGrad.addColorStop(1, '#c084fc');
      ctx.fillStyle = wGrad;

      // Smooth whale body (tail at -115, snout at +125)
      ctx.beginPath();
      ctx.moveTo(-115, 0); // Tail junction
      ctx.quadraticCurveTo(-60, -32, 40, -30); // Dorsal curve
      ctx.quadraticCurveTo(110, -24, 125, 0); // Rostrum / snout (leading forward)
      ctx.quadraticCurveTo(110, 28, 40, 26); // Ventral jaw / throat
      ctx.quadraticCurveTo(-50, 24, -115, 0); // Belly to fluke
      ctx.closePath();
      ctx.fill();

      // Tail flukes undulating
      const flukeWave = Math.sin(time * 2.2 + wIdx) * 12;
      ctx.beginPath();
      ctx.moveTo(-115, 0);
      ctx.lineTo(-145, -26 + flukeWave);
      ctx.quadraticCurveTo(-132, flukeWave * 0.5, -155, 0 + flukeWave);
      ctx.quadraticCurveTo(-132, flukeWave * 0.5, -145, 26 + flukeWave);
      ctx.closePath();
      ctx.fill();

      // Pectoral fin wing
      ctx.beginPath();
      ctx.moveTo(25, 12);
      ctx.quadraticCurveTo(0, 48, -42, 54);
      ctx.quadraticCurveTo(5, 28, 32, 10);
      ctx.closePath();
      ctx.fill();

      // Starlight constellation line along whale flank
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 4]);
      const starNodes = [
        { x: -95, y: -2 },
        { x: -55, y: -6 },
        { x: -10, y: -8 },
        { x: 35, y: -5 },
        { x: 80, y: -2 },
        { x: 105, y: -6 }
      ];
      ctx.beginPath();
      ctx.moveTo(starNodes[0].x, starNodes[0].y);
      for (let s = 1; s < starNodes.length; s++) {
        ctx.lineTo(starNodes[s].x, starNodes[s].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Constellation star diamond glints
      for (let s = 0; s < starNodes.length; s++) {
        const node = starNodes[s];
        const sHue = (t * 60 + s * 55) % 360;
        ctx.fillStyle = `hsl(${sHue}, 100%, 85%)`;
        ctx.beginPath();
        const sSize = 2.4 + Math.sin(time * 3 + s) * 0.8;
        ctx.arc(node.x, node.y, sSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    }

    // 4. Drifting stardust motes in the cosmic void abyss
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let d = 0; d < 12; d++) {
      const dx = ((d * 187 + Math.sin(time * 0.5 + d) * 40) % (w + 80) + w + 80) % (w + 80) - 40;
      const dy = voidY + 40 + ((d * 73 + time * 14) % (screenHeight - 80));
      const dHue = (t * 50 + d * 45) % 360;
      const dAlpha = 0.25 + 0.2 * Math.sin(time * 1.5 + d);
      ctx.fillStyle = `hsla(${dHue}, 100%, 80%, ${dAlpha})`;
      ctx.beginPath();
      ctx.arc(dx, dy, 1.8 + Math.sin(time + d) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  renderAbyssalDarkness(ctx, cameraY, screenHeight, hook) {
    const depthMeters = hook.depthMeters;
    if (depthMeters < 130) return;

    // Softened darkness so deep waters remain visible and atmospheric
    const darknessAlpha = Math.min(0.52, (depthMeters - 130) / 280);
    const hookDrawY = hook.y - cameraY;

    ctx.save();
    try {
      const lanternRadius = Math.max(160, (hook.lanternRadius || 80) * 1.8);
      const grad = ctx.createRadialGradient(
        hook.x,
        hookDrawY,
        lanternRadius * 0.15,
        hook.x,
        hookDrawY,
        lanternRadius
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.85, `rgba(6, 14, 38, ${darknessAlpha * 0.4})`);
      grad.addColorStop(1, `rgba(4, 10, 30, ${darknessAlpha})`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.worldWidth, screenHeight);
    } catch (e) {}
    ctx.restore();
  }

  renderAimingTrajectory(ctx, startX, startY, mouseX, mouseY, cameraY = 0, rodTier = null) {
    const boatX = Number.isFinite(this.boat?.x) ? this.boat.x : startX;
    const boatDx = mouseX - boatX;
    if (Math.abs(boatDx) > 10) {
      this.setAimDirection(boatDx < 0 ? -1 : 1);
    }
    const dir = this.aimDirection === -1 ? -1 : 1;
    this.updateRodTip();
    startX = this.rodTip.x;
    startY = this.rodTip.y;

    const drawStartY = startY - cameraY;
    const drawMouseY = mouseY - cameraY;

    const dx = mouseX - startX;
    const dy = drawMouseY - drawStartY;
    const castDx = Math.max(14, dir * dx);

    const dist = Math.sqrt(castDx * castDx + dy * dy);
    const minPower = 120;
    const maxPower = 340;
    const castRange = rodTier ? rodTier.castRange : 1.0;
    const power = Math.min(maxPower * castRange, Math.max(minPower, dist * 1.35));

    const angle = Math.atan2(Math.max(-50, dy), castDx);
    const vx = dir * Math.cos(angle) * power;
    const vy = Math.sin(angle) * power - 45;

    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);

    let simX = startX;
    let simY = startY;
    let simVx = vx;
    let simVy = vy;
    const dt = 0.035;

    ctx.beginPath();
    ctx.moveTo(simX, simY - cameraY);

    for (let step = 0; step < 26; step++) {
      simVy += 650 * dt;
      simX += simVx * dt;
      simY += simVy * dt;

      ctx.lineTo(simX, simY - cameraY);
      if (simY >= this.surfaceY) break;
    }
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(simX, this.surfaceY - cameraY, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

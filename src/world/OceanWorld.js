import { depthWaterColor, getRealmDepthZone } from '../data/RealmDepths.js';
import { drawDepthScenery } from '../rendering/DepthScenery.js';
import { EXPEDITION_HAZARDS } from '../data/ExpeditionHazards.js';
import { REALM_ECOLOGY } from '../data/RealmEcology.js';
import { drawAngler } from '../data/CustomizationData.js';
import { REALM_RELICS } from '../data/RelicsData.js';
import { Relic } from '../entities/Relic.js';
import { belongsToRealm, REALM_PROFILES } from '../data/RealmContent.js';
import { DEPTH_ZONES, FISH_SPECIES } from '../data/FishData.js';
import { FANTASY_SEAS, getSeaById } from '../entities/SeasData.js';
import { soundManager } from '../audio/SoundManager.js';
import { TREASURE_ITEMS, HAZARD_TYPES } from '../data/TreasureData.js';
import { LEGENDARY_SPECIES, checkMythicSpawn } from '../data/legendaries.js';
import { Fish } from '../entities/Fish.js';
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
    this.worldWidth = width;
    this.boat.x = width * 0.5;
    this.updateRodTip();
    if (this.driftItems) this.driftItems.resize(width);
    if (this.dolphin) this.dolphin.worldWidth = width;
    if (this.hotspotManager) this.hotspotManager.worldWidth = width;
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
    const rodBaseX = this.boat.x + this.aimDirection * 28;
    const rodBaseY = this.boat.y - 18;
    this.rodTip = {
      x: rodBaseX + this.aimDirection * 42,
      y: rodBaseY - 50,
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

    this.boat.x = this.worldWidth * .5;
    this.boat.y = this.surfaceY - 14;
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
    const rarityWeight = { common: 1, uncommon: 0.5, rare: 0.16, epic: 0.045, legendary: 0.012 };
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
    populateBands(fishPool, depth => (5 / (1 + depth / 1800)) * 1.15 * ecology.fish,
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
      if (end <= species.minDepth || (species.conditions && !isConditionMet(species.conditions, environment)) || Math.random() >= Math.min(1, (species.spawnChance ?? 0.85) * weatherApexMult)) return;
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
        const y = this.surfaceY + depth * this.pixelsPerMeter + (Math.random() - .5) * 44;
        this.entities.fish.push(new Fish(species, x, y, fishOptions));
      }
    }

    populateBands(TREASURE_ITEMS.filter(item => item.category !== 'fossil' && belongsToRealm(item, this.currentSeaId)),
      depth => (0.06 + 0.45 * depthProgress(depth)) * realmProfile.treasureChance / 0.2 * ecology.treasure,
      item => (rarityWeight[item.rarity] || 0.01) * (item.category === 'fossil' ? fossilBonus : item.isCrate ? .3 * worldCycle.getCrateDropMultiplier() : 1),
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
      if (relic.minDepth >= reachableDepth || Math.random() > 0.08 * fossilBonus * ecology.treasure) return;
      const x = 70 + Math.random() * (this.worldWidth - 140);
      const y = this.surfaceY + (relic.minDepth + Math.random() * (reachableDepth - relic.minDepth)) * this.pixelsPerMeter;
      this.entities.relics.push(new Relic(relic, x, y));
    });

    populateBands(HAZARD_TYPES.filter(hazard => !hazard.marineKind && !hazard.expedition && belongsToRealm(hazard, this.currentSeaId)),
      depth => (0.25 + 1.8 * depthProgress(depth)) * realmProfile.hazardDensity * 1.25 * ecology.hazards,
      hazard => hazard.isColossal ? 0.6 : 1,
      (hazard, x, y) => this.entities.hazards.push(new Hazard(hazard, x, y)));
    populateBands(EXPEDITION_HAZARDS.filter(h => !h.expedition && h.seas.includes(this.currentSeaId)),
      depth => .06 + .15 * depthProgress(depth), () => 1,
      (hazard, x, y) => this.entities.hazards.push(new Hazard(hazard, x, y)));
    // Creature encounters are sparse groups, separate from static obstacles.
    for (const creature of HAZARD_TYPES.filter(h => h.marineKind && h.zone === this.currentSeaId)) {
      const end = Math.min(activeMaxDepth, creature.maxDepth);
      const populationBoost = this.currentSeaId >= 5 ? 3 : 1.5;
      const spacing = (creature.isColossal ? 750 : 250) / populationBoost;
      for (let depth = creature.minDepth; depth + 20 < end; depth += spacing) {
        const chance = creature.isColossal ? .22 : creature.marineKind === 'jelly' ? .3 : .22;
        if (Math.random() >= Math.min(.85, chance * ecology.enemies * (1 + depthProgress(depth) * 1.8))) continue;
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

    // Moving Obstacles: Realm 1 Human Divers (shallow searchlight swimmers) & Deep Metallic Submarines
    if (this.currentSeaId === 1) {
      // Human Divers exploring the Sunlit Shoals
      for (let i = 0; i < 2; i++) {
        const diverY = this.surfaceY + (12 + i * 16) * this.pixelsPerMeter;
        const diverHazard = new Hazard({
          ...EXPEDITION_HAZARDS[0],
          id: 'human_diver',
          name: 'Scuba Diver',
          damage: 1,
          knockback: 30,
          radius: 22,
          color: '#38bdf8',
          glow: '#fde047',
          moveSpeed: 32 + i * 8,
        }, 100 + i * 400, diverY);
        diverHazard.homeY = diverY;
        diverHazard.facing = i % 2 === 0 ? 1 : -1;
        this.entities.hazards.push(diverHazard);
      }

      const deepestSubDepth = Math.min(activeMaxDepth - 20, 1800);
      if (deepestSubDepth >= 1000 && Math.random() < .006) {
        const subDepth = 900 + Math.random() * (deepestSubDepth - 900);
        const subY = this.surfaceY + subDepth * this.pixelsPerMeter;
        const subHazard = new Hazard({
          ...EXPEDITION_HAZARDS[1],
          id: 'deep_submarine',
          name: 'Sunken Shoals Research Submarine',
          seas: [1], minDepth: 650, maxDepth: 1600,
          radius: 170, sizeScale: 1.7, isColossal: true,
          color: '#475569', glow: '#67e8f9', moveSpeed: 12,
        }, this.worldWidth * .3, subY);
        subHazard.homeY = subY;
        subHazard.facing = 1;
        this.entities.hazards.push(subHazard);
      }
    }

    // Mid-to-Deep Submarines (Realms 2, 3, 4, 7)
    if ([2, 3, 4, 7].includes(this.currentSeaId) && activeMaxDepth >= 800 && Math.random() < 0.02) {
      const subDepth = 650 + Math.random() * (activeMaxDepth - 650);
      const subY = this.surfaceY + subDepth * this.pixelsPerMeter;
      const subHazard = new Hazard({
        ...EXPEDITION_HAZARDS[1],
        id: 'deep_submarine',
        name: 'Deep-Sea Research Submarine',
        damage: 2,
        knockback: 65,
        radius: 170,
        sizeScale: 1.7,
        isColossal: true,
        color: '#475569',
        glow: '#38bdf8',
        moveSpeed: 22,
      }, this.worldWidth * 0.3, subY);
      subHazard.homeY = subY;
      subHazard.facing = 1;
      this.entities.hazards.push(subHazard);
    }

    // Populate Interactive Realm Flora
    const floraConfig = FLORA_TYPES[this.currentSeaId] || FLORA_TYPES[1];
    // Jittered patches across the entire realm, with open water between clusters.
    const floraStart = Math.min(floraConfig.minDepth, 20);
    for (let band = floraStart; band < activeMaxDepth - 8; band += 110) {
      const end = Math.min(band + 110, activeMaxDepth - 8);
      const depthM = band + Math.random() * (end - band);
      const clusterX = 45 + Math.random() * Math.max(1, this.worldWidth - 90);
      const groupRoll = Math.random();
      const count = groupRoll < .48 ? 1 : groupRoll < .76 ? 2 : groupRoll < .91 ? 3 : groupRoll < .98 ? 4 : 5;
      const groupAngle = Math.random() * Math.PI * 2;
      for (let f = 0; f < count; f++) {
        const radius = Math.sqrt(Math.random()) * 48;
        const angle = groupAngle + f * Math.PI * 2 / count;
        const fx = Math.max(35, Math.min(this.worldWidth - 35, clusterX + Math.cos(angle) * radius));
        const fy = this.surfaceY + depthM * this.pixelsPerMeter + Math.sin(angle) * radius * .55;
        this.entities.flora.push(new InteractiveFlora(floraConfig, fx, fy));
      }
    }

    // Populate Underwater Power-ups (Rare Spawns: Positive & Negative)
    const powerupCount = Math.random() < .35 ? 0 : 1 + Math.floor(Math.random() * 2);
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
    const waveY = this.getWaveHeight(this.boat.x, this.waveTimer);
    const waveSlope = this.getWaveSlope(this.boat.x, this.waveTimer);
    this.boat.bobOffset = waveY;
    this.boat.y = this.surfaceY - 14 + waveY;
    this.boat.angle = waveSlope * 0.6;

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
    if (this.saveSystem?.isPetEquipped('shark')) this.shark.update(dt, this.boat, this.surfaceY);
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

    // Clouds tinted by current sea realm palette
    ctx.save();
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
    ctx.restore();

    // Realm-specific surface atmospheric effects
    this.renderSeaAtmosphere(ctx, sea, skyHeight, cameraY);
  }

  // Atmospheric features unique to the active Sea
  renderSeaAtmosphere(ctx, sea, skyHeight, cameraY) {
    if (sea.id === 6) {
      // Magma Caldera: Rising volcanic embers & ash
      ctx.save();
      for (let i = 0; i < 24; i++) {
        const seed = i * 47.3;
        const emberX = (seed * 19 + this.waveTimer * (15 + (i % 5) * 8)) % this.worldWidth;
        const emberY = (this.surfaceY - 20) - ((this.waveTimer * 30 + seed * 23) % (skyHeight + 40)) - cameraY;
        const alpha = 0.3 + 0.6 * Math.sin(this.waveTimer * 3 + seed);
        ctx.fillStyle = i % 2 === 0 ? `rgba(234, 88, 12, ${alpha})` : `rgba(254, 240, 138, ${alpha})`;
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
      // Astral Shimmerfall: Drifting fallen starlight sparkles
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
    } else if (sea.id === 5) {
      // Whispering Aether: Floating distant sky islands silhouette
      ctx.save();
      ctx.fillStyle = 'rgba(76, 29, 149, 0.22)';
      const islandY = this.surfaceY - 70 - cameraY * 0.2;
      ctx.beginPath();
      ctx.ellipse(this.worldWidth * 0.75, islandY, 90, 22, 0, 0, Math.PI * 2);
      ctx.ellipse(this.worldWidth * 0.25, islandY - 30, 65, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderWaterSurface(ctx, cameraY = 0) {
    const drawSurfaceY = this.surfaceY - cameraY;
    const sea = getSeaById(this.currentSeaId) || FANTASY_SEAS[0];

    ctx.save();
    ctx.fillStyle = sea.waterSurfaceColor || 'rgba(56, 189, 248, 0.45)';
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

    // Crest line matching sea horizon tint
    ctx.strokeStyle = sea.skyHorizon || '#e0f2fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= this.worldWidth; x += 8) {
      const wy = drawSurfaceY + this.getWaveHeight(x, this.waveTimer);
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
    ctx.restore();

    // Render Seabed Traps Buoys bobbing on water
    if (this.trapSystem) {
      this.trapSystem.renderBuoys(ctx, this.boat.x, this.surfaceY, cameraY);
    }

    // Render interactive surface hotspots
    if (this.hotspotManager) {
      this.hotspotManager.render(ctx, cameraY, this.worldWidth, this.canvas.height);
    }
  }

  renderBoatAndFisherman(ctx, cameraY = 0) {
    if (cameraY > this.surfaceY + 90) return;

    // Recover legacy/resize-invalid transforms before drawing the ship.
    if (!Number.isFinite(this.boat.x) || this.boat.x < 0 || this.boat.x > this.worldWidth) this.boat.x = this.worldWidth / 2;
    if (!Number.isFinite(this.boat.y)) this.boat.y = this.surfaceY - 14;
    if (!Number.isFinite(this.boat.angle)) this.boat.angle = 0;
    const drawBoatY = this.boat.y - cameraY;
    const b = this.boat;
    const vessel = b.vesselLevel || 0;

    if (this.saveSystem?.isPetEquipped('shark')) this.shark.render(ctx, cameraY);

    // Render dolphin behind boat (background layer - only if unlocked)
    if (this.dolphin && this.saveSystem?.isPetEquipped('dolphin')) this.dolphin.render(ctx, cameraY);

    ctx.save();
    ctx.translate(b.x, drawBoatY);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.rotate(b.angle);

    // ---- Boat Vessel Hull ----
    if (vessel >= 4) {
      // === GRAND SCHOONER / MYTHIC KETCH ===
      const hw = b.width * 0.65; // wider hull

      // Underwater floodlight cone beneath hull
      try {
        const floodGrad = ctx.createRadialGradient(0, 28, 0, 0, 28, 140);
        floodGrad.addColorStop(0, 'rgba(147,210,255,0.22)');
        floodGrad.addColorStop(1, 'rgba(0,30,80,0)');
        ctx.fillStyle = floodGrad;
        ctx.beginPath();
        ctx.moveTo(-40, 22);
        ctx.lineTo(-80, 160);
        ctx.lineTo(80, 160);
        ctx.lineTo(40, 22);
        ctx.closePath();
        ctx.fill();
      } catch(e) {}

      // Dark mahogany hull
      ctx.fillStyle = '#3b1a06';
      ctx.beginPath();
      ctx.moveTo(-hw, -12);
      ctx.lineTo(-hw * 0.9, b.height * 0.7);
      ctx.quadraticCurveTo(0, b.height * 0.95, hw * 0.92, b.height * 0.62);
      ctx.lineTo(hw, -12);
      ctx.closePath();
      ctx.fill();

      // Hull planks accent
      ctx.strokeStyle = '#5c2d0a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Brass trim
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.94, -4);
      ctx.quadraticCurveTo(0, 8, hw * 0.96, -2);
      ctx.stroke();

      // Wide rear deck
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-hw * 0.55, -18, hw * 1.1, 10);

      // Cabin structure
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-28, -32, 56, 18);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-24, -30, 48, 4);

      // Cabin windows
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(-12, -22, 4, 0, Math.PI * 2);
      ctx.arc(12, -22, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Brass ship wheel on deck
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-38, -22, 9, 0, Math.PI * 2);
      ctx.stroke();
      for (let spoke = 0; spoke < 8; spoke++) {
        const a = (spoke / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(-38, -22);
        ctx.lineTo(-38 + Math.cos(a) * 9, -22 + Math.sin(a) * 9);
        ctx.stroke();
      }
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(-38, -22, 3, 0, Math.PI * 2);
      ctx.fill();

      // Antique brass radio console (small box on deck)
      ctx.fillStyle = '#b45309';
      ctx.fillRect(34, -30, 16, 12);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(36, -28, 3, 3);
      ctx.fillRect(40, -28, 3, 3);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(44, -20, 4, Math.PI, 0);
      ctx.stroke(); // antenna arch

      // Foremast
      ctx.strokeStyle = '#5c2d0a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-20, -18);
      ctx.lineTo(-22, -105);
      ctx.stroke();

      // Mainmast
      ctx.beginPath();
      ctx.moveTo(18, -22);
      ctx.lineTo(20, -130);
      ctx.stroke();

      // Fore sail (billowing)
      const sailBillow1 = Math.sin(this.waveTimer * 1.1) * 12;
      ctx.fillStyle = 'rgba(248, 250, 252, 0.92)';
      ctx.beginPath();
      ctx.moveTo(-22, -100);
      ctx.lineTo(16, -95);
      ctx.quadraticCurveTo(0 + sailBillow1, -60, 14, -24);
      ctx.lineTo(-22, -28);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Main sail (billowing)
      const sailBillow2 = Math.sin(this.waveTimer * 0.9 + 0.8) * 18;
      ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
      ctx.beginPath();
      ctx.moveTo(18, -125);
      ctx.lineTo(hw * 0.7, -118);
      ctx.quadraticCurveTo(hw * 0.85 + sailBillow2, -70, hw * 0.65, -26);
      ctx.lineTo(18, -28);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crow's nest
      ctx.fillStyle = '#78350f';
      ctx.fillRect(14, -132, 14, 8);

      // Bowsprit spar
      ctx.strokeStyle = '#5c2d0a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hw * 0.88, -14);
      ctx.lineTo(hw + 40, -30);
      ctx.stroke();

      // Lantern on foremast
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(-22, -107, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

    } else if (vessel >= 2) {
      // Motor Skiff / Expedition Trawler
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(-b.width * 0.52, -10);
      ctx.lineTo(-b.width * 0.44, b.height * 0.65);
      ctx.quadraticCurveTo(0, b.height * 0.85, b.width * 0.46, b.height * 0.55);
      ctx.lineTo(b.width * 0.54, -10);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(-20, -22, 38, 14);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-16, -18, 12, 8);
      ctx.fillRect(2, -18, 12, 8);

      // Shade roof for tier 3
      if (vessel >= 3) {
        ctx.fillStyle = 'rgba(15,23,42,0.7)';
        ctx.fillRect(-b.width * 0.48, -30, b.width * 0.96, 10);
        // Crab pot mount points
        for (let cp = 0; cp < 3; cp++) {
          const cpX = -50 + cp * 42;
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.strokeRect(cpX - 8, b.height * 0.1, 16, 14);
        }
      }
    } else {
      // Classic Polished Wood Rowboat / Coastal Dory
      ctx.fillStyle = vessel === 1 ? '#78350f' : '#b45309';
      ctx.beginPath();
      ctx.moveTo(-b.width * 0.5, -8);
      ctx.lineTo(-b.width * 0.42, b.height * 0.6);
      ctx.quadraticCurveTo(0, b.height * 0.8, b.width * 0.44, b.height * 0.5);
      ctx.lineTo(b.width * 0.52, -8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-b.width * 0.45, 4);
      ctx.quadraticCurveTo(0, 16, b.width * 0.45, 6);
      ctx.stroke();

      ctx.fillStyle = '#92400e';
      ctx.fillRect(-16, -14, 32, 6);

      // Tier 1: cushioned bench + twin rod holders
      if (vessel >= 1) {
        ctx.fillStyle = '#a16207';
        ctx.fillRect(-22, -8, 44, 8);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-24, -12, 8, 5);
        ctx.fillRect(16, -12, 8, 5);
      }
    }

    // Cosmetic hull stripe follows the boat transform on every vessel tier.
    const skinColor = { coral: '#fb7185', indigo: '#818cf8', gold: '#fbbf24' }[this.saveSystem?.data.boatSkin];
    if (skinColor) { ctx.fillStyle = skinColor; ctx.fillRect(-b.width * .3, 5, b.width * .6, 7); }
    // Lantern (all vessel tiers)
    const lanternX = vessel >= 4 ? 0 : (vessel >= 2 ? 16 : 0);
    const lanternY = vessel >= 4 ? -22 : -26;
    if (vessel < 4) {
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Companions (rendered relative to boat transform - only if unlocked)
    if (this.shipsCat && this.saveSystem?.isPetEquipped('cat')) {
      this.shipsCat.render(ctx, vessel);
      if (this.hoveredCompanion === 'angela') {
        const catPos = this.shipsCat.getDeckPosition(vessel);
        ctx.save();
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
        ctx.restore();
      }
    }
    if (this.pelican && this.saveSystem?.isPetEquipped('pelican')) {
      this.pelican.render(ctx, vessel);
      if (this.hoveredCompanion === 'evan') {
        const birdPos = this.pelican.getBowspritPosition ? this.pelican.getBowspritPosition(vessel) : { x: 50, y: -20 };
        ctx.save();
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
        ctx.restore();
      }
    }

    // 2. Fisherman (flips left or right based on aimDirection)
    ctx.save();
    ctx.scale(this.aimDirection, 1);

    const fX = -2;
    const fY = -12;

    drawAngler(ctx, this.saveSystem?.data.appearance, fX, fY);

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

    ctx.restore();
    ctx.restore();

    // Drift items on water surface (rendered in world space, not boat-relative)
    if (this.driftItems && cameraY <= this.surfaceY + 50) {
      this.driftItems.render(ctx, cameraY);
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

    ctx.save();
    ctx.beginPath(); ctx.rect(0, topY, this.worldWidth, bottomY - topY); ctx.clip();

    this.renderAmbientWater(ctx, cameraY, screenHeight);
    drawDepthScenery(ctx, this.currentSeaId, cameraY, this.surfaceY, this.worldWidth, screenHeight);

    if (getRealmDepthZone((visibleTopM + visibleBottomM) * .5, this.currentSeaId).index > 0) {
      this.renderUnderwaterStarlight(ctx, cameraY, screenHeight);
    }

    // Sea 1: Sunlit Caustics (0 - 45m)
    if (this.currentSeaId === 1) {
      this.renderCaustics(ctx, topY);
    }

    // Sea 2: Bioluminescent Trench Plankton & Jellies (45 - 105m)
    if (this.currentSeaId === 2) {
      this.renderBioluminescentPlankton(ctx, cameraY, screenHeight);
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

  // Sea 2: Bioluminescent Trench Plankton & Jellies
  renderBioluminescentPlankton(ctx, cameraY, screenHeight) {
    ctx.save();
    const time = this.causticTimer;
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
      ctx.fillStyle = isCyan ? `rgba(56, 189, 248, ${pulse * 0.7})` : `rgba(168, 85, 247, ${pulse * 0.7})`;
      ctx.shadowColor = isCyan ? '#38bdf8' : '#c084fc';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(px, py, 2.5 + Math.sin(time + i) * 1.0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Sea 3: Astral Shimmerfall Starlight Cascades
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
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.arc(driftX, driftY, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Slanted starlight trail
      ctx.strokeStyle = `rgba(199, 210, 254, ${alpha * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(driftX, driftY);
      ctx.lineTo(driftX - 12, driftY - 18);
      ctx.stroke();
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

    // Marble Pillar 2 (Right flank)
    const p2X = this.worldWidth - 120;
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

    ctx.restore();
  }

  // Sea 5: Whispering Aether Sea Clouds & Sky-Islands
  renderAetherSkyIslands(ctx, cameraY, screenHeight) {
    // These islands sit in the world, never pinned to a screen corner.
    const aetherDrawY = this.surfaceY + 85 * this.pixelsPerMeter - cameraY;

    if (aetherDrawY < -200 || aetherDrawY > screenHeight + 200) return;

    ctx.save();
    // Floating sky island silhouette (Left)
    ctx.fillStyle = 'rgba(76, 29, 149, 0.45)';
    ctx.beginPath();
    ctx.moveTo(60, aetherDrawY);
    ctx.quadraticCurveTo(140, aetherDrawY - 30, 220, aetherDrawY);
    ctx.lineTo(190, aetherDrawY + 45);
    ctx.quadraticCurveTo(140, aetherDrawY + 80, 90, aetherDrawY + 45);
    ctx.closePath();
    ctx.fill();

    // Floating sky island silhouette (Right)
    const isle2X = this.worldWidth - 240;
    ctx.fillStyle = 'rgba(125, 157, 205, 0.35)';
    ctx.beginPath();
    ctx.moveTo(isle2X, aetherDrawY - 40);
    ctx.quadraticCurveTo(isle2X + 70, aetherDrawY - 65, isle2X + 150, aetherDrawY - 40);
    ctx.lineTo(isle2X + 125, aetherDrawY);
    ctx.quadraticCurveTo(isle2X + 70, aetherDrawY + 30, isle2X + 25, aetherDrawY);
    ctx.closePath();
    ctx.fill();

    // Lilac wind motes
    const time = this.causticTimer;
    for (let w = 0; w < 12; w++) {
      const wx = ((w * 110 + time * 35) % (this.worldWidth + 60)) - 30;
      const wy = (aetherDrawY - 50 + Math.sin(time * 2 + w) * 35);
      ctx.fillStyle = 'rgba(232, 121, 249, 0.35)';
      ctx.beginPath();
      ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Sea 6: Magma Caldera Trench Embers & Thermal Chimneys
  renderThermalVentBackground(ctx, cameraY, screenHeight) {
    const ventY = Math.max(this.surfaceY - cameraY + 100, screenHeight * 0.55);
    if (ventY < -250 || ventY > screenHeight + 250) return;

    ctx.save();
    // Warm radial core glow
    try {
      const glowGrad = ctx.createRadialGradient(this.worldWidth * 0.5, ventY + 60, 20, this.worldWidth * 0.5, ventY + 60, 280);
      glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
      glowGrad.addColorStop(0.6, 'rgba(185, 28, 28, 0.12)');
      glowGrad.addColorStop(1, 'rgba(69, 10, 10, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, ventY - 150, this.worldWidth, 400);
    } catch (e) {}

    // Volcanic Obsidian Spire
    ctx.fillStyle = 'rgba(24, 24, 27, 0.7)';
    ctx.beginPath();
    ctx.moveTo(this.worldWidth * 0.5 - 60, ventY + 180);
    ctx.lineTo(this.worldWidth * 0.5 - 12, ventY);
    ctx.lineTo(this.worldWidth * 0.5 + 24, ventY + 25);
    ctx.lineTo(this.worldWidth * 0.5 + 75, ventY + 180);
    ctx.closePath();
    ctx.fill();

    // Glowing magma cracks
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(this.worldWidth * 0.5 - 10, ventY + 20);
    ctx.lineTo(this.worldWidth * 0.5 - 5, ventY + 80);
    ctx.lineTo(this.worldWidth * 0.5 + 15, ventY + 130);
    ctx.stroke();

    // Upward floating embers
    const time = this.causticTimer * 2;
    for (let e = 0; e < 16; e++) {
      const ex = this.worldWidth * 0.5 - 80 + ((e * 47 + Math.sin(time + e) * 25) % 160);
      const ey = ventY + 160 - ((e * 28 + time * 35) % 220);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.8)';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Sea 7: Eldritch Chrono Void Auroras & Space-Whales
  renderEldritchVoidWhales(ctx, cameraY, screenHeight) {
    const seaStartY = Math.max(this.surfaceY, cameraY - 120);
    const voidY = seaStartY - cameraY;

    ctx.save();
    // Shimmering iridescent aurora curtains
    const time = this.causticTimer * 0.8;
    for (let a = 0; a < 3; a++) {
      const aX = (a * 280 + Math.sin(time + a) * 50) % (this.worldWidth + 200) - 100;
      try {
        const aGrad = ctx.createLinearGradient(aX, voidY, aX + 180, voidY + 400);
        aGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        aGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)');
        aGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx.fillStyle = aGrad;
        ctx.fillRect(aX, voidY, 180, 500);
      } catch (e) {}
    }

    // Space-whale background silhouette
    const whaleX = ((time * 18) % (this.worldWidth + 300)) - 150;
    const whaleY = voidY + 140 + Math.sin(time * 0.5) * 20;

    if (whaleY > -100 && whaleY < screenHeight + 100) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.beginPath();
      ctx.ellipse(whaleX, whaleY, 65, 22, 0.08, 0, Math.PI * 2);
      ctx.fill();
      // Fluke
      ctx.beginPath();
      ctx.moveTo(whaleX - 60, whaleY);
      ctx.lineTo(whaleX - 95, whaleY - 18);
      ctx.lineTo(whaleX - 85, whaleY);
      ctx.lineTo(whaleX - 95, whaleY + 18);
      ctx.closePath();
      ctx.fill();
    }

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
    const drawStartY = startY - cameraY;
    const drawMouseY = mouseY - cameraY;

    let dx = mouseX - startX;
    let dy = drawMouseY - drawStartY;

    const dir = dx < 0 ? -1 : 1;
    this.setAimDirection(dir);

    const dist = Math.sqrt(dx * dx + dy * dy);
    const minPower = 120;
    const maxPower = 340;
    const castRange = rodTier ? rodTier.castRange : 1.0;
    const power = Math.min(maxPower * castRange, Math.max(minPower, dist * 1.35));

    const angle = Math.atan2(Math.max(-50, dy), Math.abs(dx));
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

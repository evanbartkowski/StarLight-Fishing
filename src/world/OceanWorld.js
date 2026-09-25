import { DEPTH_ZONES, FISH_SPECIES } from '../data/FishData.js';
import { TREASURE_ITEMS, HAZARD_TYPES } from '../data/TreasureData.js';
import { LEGENDARY_SPECIES, checkMythicSpawn } from '../data/legendaries.js';
import { Fish } from '../entities/Fish.js';
import { Hazard } from '../entities/Hazard.js';
import { Treasure } from '../entities/Treasure.js';
import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';
import { worldCycle } from '../systems/WorldCycle.js';
import { ShipsCat, PerchingPelican, BackgroundDolphin } from '../entities/BoatCompanions.js';
import { DriftItemManager } from '../entities/DriftItems.js';

export class OceanWorld {
  constructor(canvas, trapSystem = null) {
    this.canvas = canvas;
    this.worldWidth = canvas.width;
    this.surfaceY = 220; // Y position of ocean surface
    this.pixelsPerMeter = 15;
    this.maxDepthMeters = 620;
    this.totalWorldHeight = this.surfaceY + this.maxDepthMeters * this.pixelsPerMeter;
    this.trapSystem = trapSystem;

    this.entities = {
      fish: [],
      hazards: [],
      treasures: [],
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

    // Drift items (bottles + driftwood) floating on surface
    this.driftItems = new DriftItemManager(this.worldWidth, this.surfaceY);

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
  }

  setSaveSystem(saveSys) {
    this.saveSystem = saveSys;
  }

  setTrapSystem(trapSys) {
    this.trapSystem = trapSys;
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
    this.entities.fish = [];
    this.entities.hazards = [];
    this.entities.treasures = [];

    this.boat.vesselLevel = saveSystem.getUpgradeLevel('boatVessel') || 0;

    const luckLevel = saveSystem.getUpgradeLevel('lureLuck');
    const luckTier = UPGRADE_DEFINITIONS.lureLuck.tiers[luckLevel] || UPGRADE_DEFINITIONS.lureLuck.tiers[0];
    const rareBoost = luckTier.rareBoost;
    const shinyChance = luckTier.shinyChance;

    const fossilLevel = saveSystem.getUpgradeLevel('fossilRadar') || 0;
    const fossilBonus = UPGRADE_DEFINITIONS.fossilRadar.tiers[fossilLevel]?.fossilBonus || 1.0;

    const maxLineTier = UPGRADE_DEFINITIONS.lineLength.tiers[saveSystem.getUpgradeLevel('lineLength')] || UPGRADE_DEFINITIONS.lineLength.tiers[0];
    const activeMaxDepth = Math.min(this.maxDepthMeters, maxLineTier.depth + 30);

    // Populate Fish across the Seven Seas
    FISH_SPECIES.forEach((species) => {
      if (species.minDepth > activeMaxDepth) return;

      const minSpawnY = this.surfaceY + species.minDepth * this.pixelsPerMeter;
      const maxSpawnY = this.surfaceY + Math.min(activeMaxDepth, species.maxDepth) * this.pixelsPerMeter;
      if (minSpawnY >= maxSpawnY) return;

      let count = 2;
      if (species.rarity === 'common') count = 2;
      if (species.rarity === 'uncommon') count = Math.random() < 0.8 ? 1 : 2;
      if (species.rarity === 'rare') count = Math.random() < (0.65 * rareBoost) ? 1 : 0;
      if (species.rarity === 'epic') count = Math.random() < (0.45 * rareBoost) ? 1 : 0;
      if (species.rarity === 'legendary') count = Math.random() < (0.25 * rareBoost) ? 1 : 0;

      for (let i = 0; i < count; i++) {
        const x = 60 + Math.random() * (this.worldWidth - 120);
        const y = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);
        const fish = new Fish(species, x, y, { shinyChance });
        this.entities.fish.push(fish);
      }
    });

    // Populate active Mythic & Legendary species based on atmospheric world cycle
    const timeOfDay = worldCycle.getTimeOfDay();
    const weather = worldCycle.getWeather();

    LEGENDARY_SPECIES.forEach((mythic) => {
      if (mythic.minDepth > activeMaxDepth) return;
      if (checkMythicSpawn(mythic, timeOfDay, weather, activeMaxDepth)) {
        const minSpawnY = this.surfaceY + mythic.minDepth * this.pixelsPerMeter;
        const maxSpawnY = this.surfaceY + Math.min(activeMaxDepth, mythic.maxDepth) * this.pixelsPerMeter;
        if (minSpawnY < maxSpawnY) {
          const x = 70 + Math.random() * (this.worldWidth - 140);
          const y = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);
          const mythicFish = new Fish(mythic, x, y, { shinyChance });
          this.entities.fish.push(mythicFish);
        }
      }
    });

    // Populate Treasures and Prehistoric Fossils
    // Populate Treasures, Ranked Loot Crates, and Prehistoric Fossils
    TREASURE_ITEMS.forEach((item) => {
      if (item.minDepth > activeMaxDepth) return;

      const minSpawnY = this.surfaceY + item.minDepth * this.pixelsPerMeter;
      const maxSpawnY = this.surfaceY + Math.min(activeMaxDepth, item.maxDepth) * this.pixelsPerMeter;
      if (minSpawnY >= maxSpawnY) return;

      let count = 1;
      if (item.category === 'fossil') {
        count = Math.random() < 0.55 * fossilBonus ? 1 : 0;
      } else if (item.category === 'crate') {
        // Mystery Loot Crate spawning chance based on rank
        if (item.crateRank === 1) count = Math.random() < 0.65 ? 1 : 0;
        else if (item.crateRank === 2) count = Math.random() < 0.55 ? 1 : 0;
        else if (item.crateRank === 3) count = Math.random() < 0.40 ? 1 : 0;
        else if (item.crateRank === 4) count = Math.random() < 0.30 ? 1 : 0;
        else count = Math.random() < 0.20 ? 1 : 0;
      } else {
        if (item.rarity === 'common') count = 2;
        if (item.rarity === 'uncommon') count = 1;
        if (item.rarity === 'rare') count = 1;
        if (item.rarity === 'epic') count = Math.random() < 0.7 ? 1 : 0;
        if (item.rarity === 'legendary') count = Math.random() < 0.4 ? 1 : 0;
      }

      for (let i = 0; i < count; i++) {
        const x = 70 + Math.random() * (this.worldWidth - 140);
        const y = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);
        this.entities.treasures.push(new Treasure(item, x, y));
      }
    });

    // Populate Hazards (Standard + Colossal Bad Obstacles)
    HAZARD_TYPES.forEach((haz) => {
      if (haz.minDepth > activeMaxDepth) return;

      const minSpawnY = this.surfaceY + haz.minDepth * this.pixelsPerMeter;
      const maxSpawnY = this.surfaceY + Math.min(activeMaxDepth, haz.maxDepth) * this.pixelsPerMeter;
      if (minSpawnY >= maxSpawnY) return;

      const count = haz.isColossal
        ? (Math.random() < 0.75 ? 1 : 0) // 1 imposing colossal obstacle
        : (1 + Math.floor(Math.random() * 2)); // 1-2 standard hazards

      for (let i = 0; i < count; i++) {
        const x = 70 + Math.random() * (this.worldWidth - 140);
        const y = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);
        this.entities.hazards.push(new Hazard(haz, x, y));
      }
    });
  }

  update(dt, hook) {
    const deltaSec = dt / 1000;
    this.waveTimer += deltaSec;
    this.causticTimer += deltaSec * 1.5;

    // Update world atmospheric cycle
    worldCycle.update(dt, this.worldWidth, this.surfaceY);

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
    this.entities.fish.forEach((fish) => fish.update(dt, this.worldWidth, hook));
    this.entities.hazards.forEach((hazard) => hazard.update(dt, this.worldWidth));
    this.entities.treasures.forEach((treasure) => treasure.update(dt, this.worldWidth, hook));

    // Update vessel companions (only if unlocked)
    if (this.shipsCat && this.saveSystem?.hasPet('cat')) {
      this.shipsCat.update(dt);
      const tod = worldCycle.getTimeOfDay();
      const dayCount = worldCycle._dayCount || 0;
      this.shipsCat.checkMorningGift(tod, dayCount);
    }
    if (this.pelican && this.saveSystem?.hasPet('pelican')) {
      const pelicanResult = this.pelican.update(dt);
      if (pelicanResult && pelicanResult.type === 'retrieve') {
        this.pendingBottleMessage = { type: 'pelican_retrieve', value: pelicanResult.value };
      }
    }
    if (this.dolphin && this.saveSystem?.hasPet('dolphin')) {
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

    // Dynamic Atmospheric Sky Gradient
    try {
      const skyGrad = ctx.createLinearGradient(0, -cameraY, 0, this.surfaceY - cameraY);
      skyGrad.addColorStop(0, sky.top);
      skyGrad.addColorStop(0.65, sky.middle);
      skyGrad.addColorStop(1, sky.horizon);
      ctx.fillStyle = skyGrad;
    } catch (e) {
      ctx.fillStyle = sky.top;
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

    // Clouds
    ctx.save();
    ctx.fillStyle = sky.isNight ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.85)';
    this.clouds.forEach((cloud) => {
      const cy = cloud.y - cameraY * 0.3;
      ctx.beginPath();
      ctx.arc(cloud.x, cy, 22 * cloud.scale, 0, Math.PI * 2);
      ctx.arc(cloud.x + 20 * cloud.scale, cy - 8 * cloud.scale, 28 * cloud.scale, 0, Math.PI * 2);
      ctx.arc(cloud.x + 44 * cloud.scale, cy, 20 * cloud.scale, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  renderWaterSurface(ctx, cameraY = 0) {
    const drawSurfaceY = this.surfaceY - cameraY;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, drawSurfaceY);

    for (let x = 0; x <= this.worldWidth; x += 8) {
      const wy = drawSurfaceY + this.getWaveHeight(x, this.waveTimer);
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(this.worldWidth, drawSurfaceY + 12);
    ctx.lineTo(0, drawSurfaceY + 12);
    ctx.closePath();
    ctx.fill();

    // Crest line
    ctx.strokeStyle = '#e0f2fe';
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
  }

  renderBoatAndFisherman(ctx, cameraY = 0) {
    if (cameraY > this.surfaceY + 90) return;

    const drawBoatY = this.boat.y - cameraY;
    const b = this.boat;
    const vessel = b.vesselLevel || 0;

    // Render dolphin behind boat (background layer - only if unlocked)
    if (this.dolphin && this.saveSystem?.hasPet('dolphin')) this.dolphin.render(ctx, cameraY);

    ctx.save();
    ctx.translate(b.x, drawBoatY);
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
    if (this.shipsCat && this.saveSystem?.hasPet('cat')) this.shipsCat.render(ctx, vessel);
    if (this.pelican && this.saveSystem?.hasPet('pelican')) this.pelican.render(ctx, vessel);

    // 2. Fisherman (flips left or right based on aimDirection)
    ctx.save();
    ctx.scale(this.aimDirection, 1);

    const fX = -2;
    const fY = -12;

    // Body (Yellow raincoat)
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(fX - 9, fY - 26);
    ctx.lineTo(fX + 9, fY - 26);
    ctx.lineTo(fX + 11, fY - 2);
    ctx.lineTo(fX - 11, fY - 2);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(fX, fY - 32, 7, 0, Math.PI * 2);
    ctx.fill();

    // Sou'wester yellow rain hat
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(fX, fY - 35, 9, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(fX - 13, fY - 35, 26, 4);

    // Arm holding rod
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fX + 4, fY - 18);
    ctx.lineTo(fX + 22, fY - 16);
    ctx.stroke();

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
      const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
      const stops = [];
      stops.push({ t: 0, color: DEPTH_ZONES[0].topColor });

      DEPTH_ZONES.forEach((zone) => {
        const startT = (zone.minDepth - visibleTopM) / depthSpan;
        const endT = (zone.maxDepth - visibleTopM) / depthSpan;

        if (startT >= 0.01 && startT <= 0.99) {
          stops.push({ t: startT, color: zone.topColor });
        }
        if (endT >= 0.01 && endT <= 0.99) {
          stops.push({ t: endT, color: zone.bottomColor });
        }
      });

      let bottomZone = DEPTH_ZONES[DEPTH_ZONES.length - 1];
      for (const z of DEPTH_ZONES) {
        if (visibleBottomM >= z.minDepth && visibleBottomM <= z.maxDepth) {
          bottomZone = z;
          break;
        }
      }
      stops.push({ t: 1, color: bottomZone.bottomColor });

      stops.sort((a, b) => a.t - b.t);

      stops.forEach((s) => {
        const clampedT = Math.max(0, Math.min(1, s.t));
        grad.addColorStop(clampedT, s.color);
      });

      ctx.fillStyle = grad;
    } catch (e) {
      ctx.fillStyle = '#0284c7';
    }

    ctx.fillRect(0, topY, this.worldWidth, bottomY - topY);

    // Sunlight Caustics in Sea 1 (0 - 35m)
    if (visibleTopM < 40) {
      this.renderCaustics(ctx, topY);
    }

    // Parallax Kelp Forests in Sea 2 (35 - 80m)
    if (visibleTopM < 90 && visibleBottomM > 30) {
      this.renderKelp(ctx, cameraY, screenHeight);
    }

    // Shipwreck Silhouettes in Sea 4 (150 - 240m)
    if (visibleTopM < 250 && visibleBottomM > 140) {
      this.renderShipwreckSilhouettes(ctx, cameraY, screenHeight);
    }

    // Thermal Vent Magma Glow in Sea 6 (360 - 480m)
    if (visibleTopM < 490 && visibleBottomM > 350) {
      this.renderThermalVentBackground(ctx, cameraY, screenHeight);
    }

    // Render Weather Effects: Rain ripples, fog drift, night stars & biolum plankton
    worldCycle.renderWeatherEffects(ctx, cameraY, this.worldWidth, screenHeight, this.surfaceY);
  }

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

  renderKelp(ctx, cameraY, screenHeight) {
    ctx.save();
    for (let k = 0; k < 10; k++) {
      const isRight = k >= 5;
      const baseX = isRight ? this.worldWidth - 20 - (k - 5) * 18 : 20 + k * 18;
      const startDepthY = this.surfaceY + 38 * this.pixelsPerMeter + (k % 3) * 120;
      const strandHeight = 240;

      const drawStartY = startDepthY - cameraY;
      if (drawStartY + strandHeight < 0 || drawStartY > screenHeight) continue;

      ctx.strokeStyle = k % 2 === 0 ? 'rgba(5, 150, 105, 0.35)' : 'rgba(6, 95, 70, 0.25)';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(baseX, drawStartY + strandHeight);

      const sway1 = Math.sin(this.waveTimer * 1.5 + k) * 22;
      const sway2 = Math.sin(this.waveTimer * 1.8 + k * 1.5) * 26;

      ctx.bezierCurveTo(
        baseX + sway1,
        drawStartY + strandHeight * 0.6,
        baseX - sway2,
        drawStartY + strandHeight * 0.3,
        baseX + sway1 * 0.5,
        drawStartY
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  renderShipwreckSilhouettes(ctx, cameraY, screenHeight) {
    const shipwreckY = this.surfaceY + 180 * this.pixelsPerMeter - cameraY;
    if (shipwreckY < -200 || shipwreckY > screenHeight + 200) return;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';

    ctx.beginPath();
    ctx.moveTo(80, shipwreckY + 120);
    ctx.lineTo(240, shipwreckY + 90);
    ctx.lineTo(260, shipwreckY + 130);
    ctx.lineTo(70, shipwreckY + 130);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(160, shipwreckY + 20, 10, 80);
    ctx.fillRect(140, shipwreckY + 45, 50, 6);
    ctx.restore();
  }

  renderThermalVentBackground(ctx, cameraY, screenHeight) {
    const ventY = this.surfaceY + 410 * this.pixelsPerMeter - cameraY;
    if (ventY < -150 || ventY > screenHeight + 150) return;

    ctx.save();
    try {
      const glowGrad = ctx.createRadialGradient(this.worldWidth * 0.5, ventY, 20, this.worldWidth * 0.5, ventY, 220);
      glowGrad.addColorStop(0, 'rgba(234, 88, 12, 0.25)');
      glowGrad.addColorStop(1, 'rgba(59, 13, 12, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, ventY - 200, this.worldWidth, 400);
    } catch (e) {}
    ctx.restore();
  }

  renderAbyssalDarkness(ctx, cameraY, screenHeight, hook) {
    const depthMeters = hook.depthMeters;
    if (depthMeters < 80) return;

    const darknessAlpha = Math.min(0.95, (depthMeters - 80) / 160);
    const hookDrawY = hook.y - cameraY;

    ctx.save();
    try {
      const lanternRadius = Math.max(70, hook.lanternRadius);
      const grad = ctx.createRadialGradient(
        hook.x,
        hookDrawY,
        lanternRadius * 0.2,
        hook.x,
        hookDrawY,
        lanternRadius
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.7, `rgba(2, 6, 23, ${darknessAlpha * 0.4})`);
      grad.addColorStop(1, `rgba(2, 6, 23, ${darknessAlpha})`);

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

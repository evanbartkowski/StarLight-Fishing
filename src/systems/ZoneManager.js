// ZoneManager.js — Multi-Zone Exploration System & Environmental Mechanics
import { ZONES, getZoneById } from '../data/ZonesData.js';
import { soundManager } from '../audio/SoundManager.js';

export class ZoneManager {
  constructor(saveSystem, oceanWorld, uiManager) {
    this.saveSystem = saveSystem;
    this.oceanWorld = oceanWorld;
    this.uiManager = uiManager;

    this.activeZoneId = this.saveSystem.data.currentZone || 'sunken_shallows';
    this.activeZone = getZoneById(this.activeZoneId);

    // Zone 2 (Mangrove) Snag Mechanic
    this.isSnagged = false;
    this.snagTimer = 0;
    this.snagCheckTimer = 0;

    // Zone 3 (Abyssal Rift) Pressure Surge Mechanic
    this.surgeTimer = 0;
    this.isSurging = false;

    // Zone 4 (Volcanic Caldera) Heat Overheat Mechanic
    this.lineHeat = 0; // 0 to 100%

    // Transition Screen Wipe state
    this.transitionAlpha = 0;
    this.transitioning = false;
    this.transitionZoneTarget = null;
    this.transitionCallback = null;

    // Ambient atmosphere timer
    this.ambientAnimTime = 0;
  }

  getZoneId() {
    return this.activeZoneId;
  }

  getCurrentZone() {
    return this.activeZone;
  }

  setZone(zoneId) {
    const zone = getZoneById(zoneId);
    if (!zone) return;

    this.activeZoneId = zone.id;
    this.activeZone = zone;
    this.saveSystem.data.currentZone = zone.id;

    if (!this.saveSystem.data.unlockedZones.includes(zone.id)) {
      this.saveSystem.data.unlockedZones.push(zone.id);
    }
    this.saveSystem.save();

    // Reset zone mechanics
    this.isSnagged = false;
    this.lineHeat = 0;
    this.isSurging = false;

    // Update soundscape
    soundManager.setZoneSoundscape(zone.id);
  }

  switchZoneWithTransition(zoneId, callback) {
    if (this.transitioning) return;
    this.transitioning = true;
    this.transitionZoneTarget = zoneId;
    this.transitionCallback = callback;
    this.transitionAlpha = 0.05;
  }

  update(dt, hook, gameState, isReelingInput) {
    const deltaSec = dt / 1000;
    this.ambientAnimTime += deltaSec;

    // Handle transition wipe interpolation
    if (this.transitioning) {
      if (this.transitionZoneTarget) {
        this.transitionAlpha += deltaSec * 2.5;
        if (this.transitionAlpha >= 1.0) {
          this.transitionAlpha = 1.0;
          this.setZone(this.transitionZoneTarget);
          this.transitionZoneTarget = null;
          if (this.transitionCallback) {
            this.transitionCallback();
            this.transitionCallback = null;
          }
        }
      } else {
        this.transitionAlpha -= deltaSec * 2.0;
        if (this.transitionAlpha <= 0) {
          this.transitionAlpha = 0;
          this.transitioning = false;
        }
      }
    }

    if (gameState !== 'REELING') {
      this.isSnagged = false;
      this.lineHeat = Math.max(0, this.lineHeat - 40 * deltaSec);
      return;
    }

    // Zone 2: Whispering Mangrove — Root Obstacle Snags
    if (this.activeZoneId === 'whispering_mangrove') {
      if (this.isSnagged) {
        if (!isReelingInput) {
          // Pausing reel frees snagged line
          this.snagTimer += deltaSec;
          if (this.snagTimer > 0.8) {
            this.isSnagged = false;
            this.snagTimer = 0;
            this.uiManager.showToast('🌿 Hook freed from tangled mangrove roots!');
          }
        }
      } else if (isReelingInput && hook.caughtItems.length > 0) {
        this.snagCheckTimer += deltaSec;
        if (this.snagCheckTimer > 3.0) {
          this.snagCheckTimer = 0;
          const snagPerk = this.saveSystem.hasZonePerk('swamp_immunity') ? 0.08 : 0.22;
          if (Math.random() < snagPerk) {
            this.isSnagged = true;
            this.snagTimer = 0;
            soundManager.playThud?.();
            this.uiManager.showToast('⚠️ SNAG! Tangled in mangrove roots! Stop reeling to untangle!');
          }
        }
      }
    }

    // Zone 3: Abyssal Rift — Pressure Surge lateral currents
    if (this.activeZoneId === 'abyssal_rift') {
      this.surgeTimer += deltaSec;
      if (this.surgeTimer > 5.5) {
        this.surgeTimer = 0;
        const dampener = this.saveSystem.hasZonePerk('pressure_stabilizer') ? 0.6 : 1.0;
        const spike = 18 * dampener;
        hook.vx += (Math.random() < 0.5 ? -1 : 1) * spike;
        this.isSurging = true;
        setTimeout(() => { this.isSurging = false; }, 800);
      }
    }

    // Zone 4: Volcanic Caldera — Line Heat Overheat
    if (this.activeZoneId === 'volcanic_caldera') {
      if (isReelingInput) {
        // Continuous reeling builds heat
        this.lineHeat = Math.min(100, this.lineHeat + 28 * deltaSec);
        if (this.lineHeat >= 100) {
          this.lineHeat = 40;
          hook.kelpSlowTimer = Math.max(hook.kelpSlowTimer || 0, 1.5);
          hook.kelpSlowMultiplier = 0.65;
          this.uiManager.showToast('🔥 BOILING OVERHEAT! Reel cooling for a moment!');
        }
      } else {
        // Pausing reel cools down spool
        this.lineHeat = Math.max(0, this.lineHeat - 45 * deltaSec);
      }
    }
  }

  renderAtmosphere(ctx, cameraY, screenWidth, screenHeight) {
    ctx.save();

    // 1. Whispering Mangrove: Submerged swamp mist & drifting firefly motes
    if (this.activeZoneId === 'whispering_mangrove') {
      ctx.fillStyle = 'rgba(6, 78, 59, 0.16)';
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      // Murky mist fog layers
      const mistY = Math.sin(this.ambientAnimTime * 0.8) * 15;
      const grad = ctx.createLinearGradient(0, 0, 0, screenHeight);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
      grad.addColorStop(0.5, 'rgba(6, 78, 59, 0.22)');
      grad.addColorStop(1, 'rgba(2, 44, 34, 0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, mistY, screenWidth, screenHeight);
    }

    // 2. Abyssal Rift: Crushing deep trench dark vignette
    if (this.activeZoneId === 'abyssal_rift') {
      const radGrad = ctx.createRadialGradient(
        screenWidth / 2,
        screenHeight / 2,
        Math.min(screenWidth, screenHeight) * 0.3,
        screenWidth / 2,
        screenHeight / 2,
        Math.max(screenWidth, screenHeight) * 0.75
      );
      radGrad.addColorStop(0, 'rgba(15, 23, 42, 0.05)');
      radGrad.addColorStop(1, 'rgba(2, 6, 23, 0.65)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, screenWidth, screenHeight);
    }

    // 3. Volcanic Caldera: Thermal heat haze and fiery ember underglow
    if (this.activeZoneId === 'volcanic_caldera') {
      ctx.fillStyle = 'rgba(124, 45, 18, 0.15)';
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      const boilPulse = 0.15 + Math.sin(this.ambientAnimTime * 2.2) * 0.06;
      const fireGrad = ctx.createLinearGradient(0, screenHeight - 140, 0, screenHeight);
      fireGrad.addColorStop(0, 'rgba(234, 88, 12, 0)');
      fireGrad.addColorStop(1, `rgba(220, 38, 38, ${boilPulse})`);
      ctx.fillStyle = fireGrad;
      ctx.fillRect(0, screenHeight - 140, screenWidth, 140);
    }

    // 4. Smooth Transition Screen Wipe
    if (this.transitionAlpha > 0) {
      ctx.fillStyle = `rgba(15, 23, 42, ${this.transitionAlpha})`;
      ctx.fillRect(0, 0, screenWidth, screenHeight);
    }

    ctx.restore();
  }
}

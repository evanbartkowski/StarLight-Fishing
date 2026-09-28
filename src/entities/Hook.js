import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';
import { soundManager } from '../audio/SoundManager.js';

export class Hook {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.targetX = 0;

    this.state = 'SURFACE_IDLE'; // 'SURFACE_IDLE' | 'CASTING' | 'DESCENDING' | 'REELING' | 'SURFACED'
    this.depthMeters = 0;
    this.maxDepthReachedThisDive = 0;

    // Upgraded stats
    this.maxDepthMeters = 40;
    this.capacity = 3;
    this.reelSpeed = 1.0;
    this.agility = 1.0;
    this.lanternRadius = 50;
    this.sonarLevel = 'None';
    this.shields = 0;
    this.initialShields = 0;

    // Caught items
    this.caughtItems = [];
    this.tookDamage = false;

    // Previous position for continuous collision sweep
    this.prevX = 0;
    this.prevY = 0;

    // Visuals & animation
    this.tiltAngle = 0;
    this.sonarTimer = 0;
    this.sonarPulseRadius = 0;
    this.bubbleTimer = 0;

    // Tension & Durability mechanics
    this.tension = 0;
    this.maxTension = 100;
    this.sweetSpotMin = 45;
    this.sweetSpotMax = 70;
    this.isInSweetSpot = false;

    // Instant bite readiness - can hook fish immediately going downwards or reeling
    this.initialBiteWait = 0;
    this.biteTimer = 0;
    this.hasBitten = true;

    // Relaxed rhythm-based legend reel mechanic
    this.rhythmTimer = 0;
    this.rhythmRatio = 0.5;
    this.rhythmPhase = 'LULL'; // 'LULL' (calm optimal window) | 'SWELL' (gentle resistance)
    this.isLegendaryOnLine = false;
    this.lastSweetSpotPlayTime = 0;
  }

  applyUpgrades(saveSystem) {
    const getLvl = (key) => (saveSystem?.getUpgradeLevel ? saveSystem.getUpgradeLevel(key) : 0);

    const lineTier = UPGRADE_DEFINITIONS.lineLength?.tiers?.[getLvl('lineLength')] || { depth: 50 };
    this.maxDepthMeters = lineTier.depth || 50;

    const capTier = UPGRADE_DEFINITIONS.hookCapacity?.tiers?.[getLvl('hookCapacity')] || { capacity: 3 };
    this.capacity = capTier.capacity || 3;

    const reelTier = UPGRADE_DEFINITIONS.reelPower?.tiers?.[getLvl('reelPower')] || { multiplier: 1.0 };
    this.reelSpeed = reelTier.multiplier || 1.0;

    const tensionLvl = getLvl('highTensionLine') || 0;
    const tensionTier = UPGRADE_DEFINITIONS.highTensionLine?.tiers?.[tensionLvl] || { threshold: 100, sweetSpotMult: 1.0 };
    this.maxTension = tensionTier.threshold || 100;
    const sweetMult = tensionTier.sweetSpotMult || 1.0;
    this.sweetSpotMin = Math.max(25, 45 - (sweetMult - 1) * 10);
    this.sweetSpotMax = Math.min(85, 70 + (sweetMult - 1) * 12);

    const luckLvl = getLvl('lureLuck') || 0;
    const reelLvl = getLvl('reelPower') || 0;
    this.initialBiteWait = Math.max(1.5, 7.5 - luckLvl * 1.0 - reelLvl * 0.5);

    const agilTier = UPGRADE_DEFINITIONS.hookAgility?.tiers?.[getLvl('hookAgility')] || { speedMult: 1.0 };
    this.agility = agilTier.speedMult || 1.0;

    const lanternTier = UPGRADE_DEFINITIONS.abyssalLantern?.tiers?.[getLvl('abyssalLantern')] || { radius: 100 };
    this.lanternRadius = lanternTier.radius || 100;

    const sonarTier = UPGRADE_DEFINITIONS.treasureSonar?.tiers?.[getLvl('treasureSonar')] || { levelName: 'None' };
    this.sonarLevel = sonarTier.levelName || 'None';

    const armorTier = UPGRADE_DEFINITIONS.lineArmor?.tiers?.[getLvl('lineArmor')] || { shields: 0 };
    this.initialShields = armorTier.shields || 0;
    this.shields = this.initialShields;
  }

  reset(surfaceX, surfaceY) {
    this.hazardCooldown = 0;
    this.x = surfaceX;
    this.y = surfaceY;
    this.prevX = surfaceX;
    this.prevY = surfaceY;
    this.vx = 0;
    this.vy = 0;
    this.targetX = surfaceX;
    this.state = 'SURFACE_IDLE';
    this.depthMeters = 0;
    this.maxDepthReachedThisDive = 0;
    this.caughtItems = [];
    this.tookDamage = false;
    this.shields = this.initialShields;
    this.tiltAngle = 0;
    this.sonarPulseRadius = 0;
    this.rhythmTimer = 0;
    this.isLegendaryOnLine = false;
    this.tension = 0;
    this.isInSweetSpot = false;
    this.biteTimer = 0;
    this.hasBitten = true;
  }

  cast(startX, startY, velocityX, velocityY) {
    this.x = startX;
    this.y = startY;
    this.prevX = startX;
    this.prevY = startY;
    this.vx = velocityX;
    this.vy = velocityY;
    this.state = 'CASTING';
    this.targetX = startX;
    this.caughtItems = [];
    this.tookDamage = false;
    this.shields = this.initialShields;
    this.maxDepthReachedThisDive = 0;
    this.rhythmTimer = 0;
    this.isLegendaryOnLine = false;
    this.tension = 0;
    this.isInSweetSpot = false;
    this.biteTimer = 0;
    this.hasBitten = true;

    soundManager.playCast();
  }

  startReel() {
    if (this.state === 'DESCENDING') {
      this.state = 'REELING';
      this.vy = -180 * this.reelSpeed;
    }
  }

  steer(dir, deltaSec = 0.016) {
    const steerForce = 420 * this.agility;
    this.vx += dir * steerForce * 4 * deltaSec;
    this.x += dir * steerForce * deltaSec;
    this.targetX = this.x;
  }

  setTargetX(targetX) {
    this.targetX = targetX;
  }

  addCatch(entity, particles) {
    if (this.caughtItems.length >= this.capacity) return false;

    this.caughtItems.push(entity);
    entity.hookTo(this, this.caughtItems.length - 1);

    const rarity = entity.rarity || 'common';
    soundManager.playCatch(rarity);

    // If rare, legendary, or special deep titan, play the two-tone chime!
    if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary' || entity.isMythic || entity.isSpecialDeep) {
      soundManager.playRareChime();
    }

    if (particles) {
      const glow = entity.isShiny ? '#fef08a' : (entity.rarityGlow || (entity.isSpecialDeep ? '#38bdf8' : '#fde047'));
      particles.emitSparkles(this.x, this.y, entity.isShiny ? 26 : (entity.isSpecialDeep ? 22 : 16), glow);

      const crownTag = entity.crown === 'gold' ? ' 👑' : entity.crown === 'silver' ? ' 🥈' : '';
      const deepTitanTag = entity.isSpecialDeep ? ' [DEEP TITAN]' : '';
      particles.addFloatingText(
        `+${entity.name}${entity.isShiny ? ' (SHINY!)' : ''}${deepTitanTag}${crownTag}`,
        this.x,
        this.y - 15,
        entity.rarityColor || '#ffffff',
        16,
        glow
      );
      if (entity.evasion) {
        particles.addFloatingText('🎯 ELUSIVE CATCH!', this.x, this.y - 32, '#facc15', 18, '#ca8a04');
        particles.addTrauma(0.3);
      } else if (entity.isShiny || rarity === 'epic' || rarity === 'legendary' || entity.isMythic || entity.isSpecialDeep) {
        particles.addTrauma(0.35);
      }
    }

    if (this.caughtItems.length >= this.capacity && this.state === 'DESCENDING') {
      this.startReel();
      if (particles) {
        particles.addFloatingText('BASKET FULL! REELING UP!', this.x, this.y - 35, '#f59e0b', 18);
      }
    }
    return true;
  }

  takeHazardHit(hazard, particles) {
    if (this.hazardCooldown > 0) return;
    this.hazardCooldown = 1.2;
    hazard.restTime = 3;
    this.tookDamage = true;
    soundManager.playHazardShock();

    if (particles) {
      particles.addTrauma(0.4);
      particles.emitBubbles(this.x, this.y, 14, 22);
    }

    if (this.shields > 0) {
      this.shields -= 1;
      if (particles) {
        particles.addFloatingText(`SHIELD DEFLECTED! (${this.shields} left)`, this.x, this.y - 20, '#38bdf8', 15);
      }
    } else {
      // Hitting obstacles on the way up causes you to lose fish sometimes!
      if (this.state === 'REELING' && this.caughtItems.length > 0) {
        if (Math.random() < 0.65) {
          const lostIdx = Math.floor(Math.random() * this.caughtItems.length);
          const lostFish = this.caughtItems.splice(lostIdx, 1)[0];
          if (lostFish) {
            lostFish.state = 'SWIMMING';
            soundManager.playFishEscape();
            if (particles) {
              particles.addFloatingText(`💥 ${lostFish.name} slipped off the line!`, this.x, this.y - 35, '#ef4444', 17);
              particles.emitSplash(this.x, this.y, 22, 1.2);
              particles.addTrauma(0.35);
            }
            // Re-tether remaining items cleanly along the line
            this.caughtItems.forEach((item, idx) => {
              if (typeof item.hookTo === 'function') {
                item.hookTo(this, idx);
              }
            });
          }
        } else {
          if (particles) {
            particles.addFloatingText(`TANGLED IMPACT!`, this.x, this.y - 20, '#fbbf24', 15);
          }
        }
      } else {
        if (particles) {
          particles.addFloatingText(`OBSTACLE BUMP!`, this.x, this.y - 20, '#fbbf24', 15);
        }
        if (this.state === 'DESCENDING') {
          this.startReel();
        }
      }
    }

    this.vx = (Math.random() < 0.5 ? -1 : 1) * hazard.knockback * 1.3;
  }

  update(dt, surfaceY, worldWidth, particles, isReelingInput = true, zoneManager = null) {
    const deltaSec = dt / 1000;
    this.hazardCooldown = Math.max(0, (this.hazardCooldown || 0) - deltaSec);
    this.prevX = this.x;
    this.prevY = this.y;

    if (this.state === 'CASTING') {
      this.vy += 650 * deltaSec;
      this.x += this.vx * deltaSec;
      this.y += this.vy * deltaSec;

      if (this.y >= surfaceY) {
        this.state = 'DESCENDING';
        this.y = surfaceY + 2;
        this.vy = 200;
        this.vx *= 0.4;
        soundManager.playSplash();
        if (particles) {
          particles.emitSplash(this.x, surfaceY, 28, 1.2);
          particles.emitBubbles(this.x, surfaceY + 10, 14, 15);
        }
      }
    } else if (this.state === 'DESCENDING') {
      const targetSinkSpeed = 240 + (this.caughtItems.length * 10);
      this.vy += (targetSinkSpeed - this.vy) * 4 * deltaSec;

      const steerDiff = this.targetX - this.x;
      this.vx += (steerDiff * 4.0 * this.agility - this.vx) * 6 * deltaSec;

      this.x += this.vx * deltaSec;
      this.y += this.vy * deltaSec;
      this.x = Math.max(30, Math.min(worldWidth - 30, this.x));

      this.depthMeters = Math.max(0, (this.y - surfaceY) / 15);
      if (this.depthMeters > this.maxDepthReachedThisDive) {
        this.maxDepthReachedThisDive = this.depthMeters;
      }

      if (this.depthMeters >= this.maxDepthMeters) {
        this.startReel();
        if (particles) {
          particles.addFloatingText('MAX DEPTH REACHED! REELING UP!', this.x, this.y - 30, '#38bdf8', 17);
        }
      }

      this.bubbleTimer += deltaSec;
      if (this.bubbleTimer > 0.14) {
        this.bubbleTimer = 0;
        if (particles) {
          particles.emitBubbles(this.x, this.y + 10, 2, 4);
        }
      }
    } else if (this.state === 'REELING') {
      // Automatic retrieve upward!
      this.tension = 0; // No line snap
      this.isInSweetSpot = true;

      // Base auto reel speed is responsive and scales with reelSpeed upgrades
      const baseAutoReelSpeed = -420;
      const targetReelSpeed = baseAutoReelSpeed * Math.max(1.0, this.reelSpeed);

      this.vy += (targetReelSpeed - this.vy) * 8 * deltaSec;

      // Agile steering during auto-reel
      const steerDiff = this.targetX - this.x;
      this.vx += (steerDiff * 3.6 * this.agility - this.vx) * 6 * deltaSec;

      this.x += this.vx * deltaSec;
      this.y += this.vy * deltaSec;
      this.x = Math.max(30, Math.min(worldWidth - 30, this.x));

      this.depthMeters = Math.max(0, (this.y - surfaceY) / 15);

      if (Math.random() < 0.22) {
        soundManager.playReelClick(this.reelSpeed);
      }

      if (this.y <= surfaceY) {
        this.y = surfaceY;
        this.state = 'SURFACED';
        soundManager.playSplash();
        if (particles) {
          particles.emitSplash(this.x, surfaceY, 30, 1.4);
          particles.emitSparkles(this.x, surfaceY, 20, '#fef08a');
          particles.addTrauma(0.35);
        }
      }
    }

    this.tiltAngle = Math.max(-0.4, Math.min(0.4, this.vx * 0.003));

    if (this.sonarLevel !== 'None') {
      this.sonarTimer += deltaSec;
      this.sonarPulseRadius = (this.sonarPulseRadius + 180 * deltaSec) % 240;
      if (this.sonarTimer > 2.2) {
        this.sonarTimer = 0;
        soundManager.playSonarPing();
      }
    }

    // Always update all caught items so they stay on the line a bit above the hook and follow the hook
    this.updateCaughtItems(dt, worldWidth);
  }

  updateCaughtItems(dt, worldWidth) {
    for (let i = 0; i < this.caughtItems.length; i++) {
      const item = this.caughtItems[i];
      if (item && typeof item.update === 'function') {
        item.update(dt, worldWidth, this);
      }
    }
  }

  renderLine(ctx, rodTipX, rodTipY, cameraY = 0) {
    const drawHookY = this.y - cameraY;
    const drawRodY = rodTipY - cameraY;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(rodTipX, drawRodY);

    if (this.state === 'CASTING') {
      const midX = (rodTipX + this.x) / 2;
      const midY = Math.min(drawRodY, drawHookY) - 30;
      ctx.quadraticCurveTo(midX, midY, this.x, drawHookY);
    } else {
      const sagX = (rodTipX + this.x) / 2 + Math.sin(this.y * 0.01) * 8;
      const sagY = (drawRodY + drawHookY) / 2;
      ctx.quadraticCurveTo(sagX, sagY, this.x, drawHookY);
    }
    ctx.stroke();
    ctx.restore();
  }

  render(ctx, cameraY = 0) {
    const drawY = this.y - cameraY;

    // 1. Sonar pulse rings
    if (this.sonarLevel !== 'None' && this.state !== 'SURFACE_IDLE') {
      ctx.save();
      const alpha = Math.max(0, 1 - this.sonarPulseRadius / 240);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, drawY, this.sonarPulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Relaxed Rhythm-Based Harmonic Pulse Aura for Legends
    if (this.state === 'REELING' && this.isLegendaryOnLine) {
      ctx.save();
      const isLull = this.rhythmPhase === 'LULL';
      const ringColor = isLull ? 'rgba(52, 211, 153, 0.65)' : 'rgba(251, 191, 36, 0.45)';
      const pulseSize = 28 + (1 - this.rhythmRatio) * 16;

      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isLull ? '#34d399' : '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(this.x, drawY + 8, pulseSize, 0, Math.PI * 2);
      ctx.stroke();

      // Soft caption
      ctx.fillStyle = isLull ? '#6ee7b7' : '#fcd34d';
      ctx.font = '600 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isLull ? '🌊 Calm Lull (Fast Reel)' : '〰️ Wave Swell', this.x, drawY - 24);
      ctx.restore();
    }

    // 3. Hook Shield aura
    if (this.shields > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(this.x, drawY + 8, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Hook body
    ctx.save();
    ctx.translate(this.x, drawY);
    ctx.rotate(this.tiltAngle);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 16);
    ctx.arc(-8, 16, 8, 0, Math.PI);
    ctx.lineTo(-16, 8);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(0, 6, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.lanternRadius > 50) {
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 14, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}


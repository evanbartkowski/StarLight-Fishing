import { RARITY_CONFIG } from '../data/FishData.js';
import { calculateCrown, getCrownMultiplier } from '../data/legendaries.js';
import { soundManager } from '../audio/SoundManager.js';

export class Fish {
  constructor(species, x, y, options = {}) {
    this.species = species;
    this.speciesId = species.id;
    this.name = species.name;
    this.zone = species.zone;
    this.rarity = species.rarity;
    this.rarityColor = RARITY_CONFIG[species.rarity]?.color || '#ffffff';
    this.rarityGlow = RARITY_CONFIG[species.rarity]?.glow || '#ffffff';
    this.isGodTier = !!species.isGodTier;
    this.isMythic = !!species.isMythic;
    this.isSpecialDeep = !!species.isSpecialDeep;

    this.x = x;
    this.y = y;
    this.depthMeters = options.depthMeters || Math.round(y / 15);

    // Roll random size and weight within species parameters
    const [minCm, maxCm] = species.sizeRange;
    const avgCm = (minCm + maxCm) / 2;
    this.size = Math.round((minCm + Math.random() * (maxCm - minCm)) * 10) / 10;
    const sizeRatio = this.size / avgCm;
    this.weight = Math.round((species.baseWeight * Math.pow(sizeRatio, 2.2)) * 100) / 100;

    // Crowns: Gold Crown (Giant) or Silver Crown (Mini)
    this.crown = calculateCrown(species, this.size);
    const crownMult = getCrownMultiplier(this.crown);

    // Roll shiny golden chance (defaults to 4% unless enhanced by lure)
    const shinyRoll = Math.random();
    const shinyThreshold = options.shinyChance || 0.04;
    this.isShiny = shinyRoll < shinyThreshold;

    // Bigger fish sell for exponentially more + crown bonus (boosted +35% for rewarding fishing)
    const sizeMultiplier = Math.pow(sizeRatio, 1.85);
    let val = Math.round(species.baseValue * Math.min(1.8, sizeMultiplier) * Math.min(1.5, crownMult) * (this.isShiny ? 2 : 1));
    this.value = Math.max(2, Math.round(val * (options.valueMultiplier || 1)));
    const realmSize = options.sizeMultiplier || 1;
    this.size = Math.round(this.size * realmSize * 10) / 10;
    this.weight = Math.round(this.weight * realmSize ** 2.2 * 100) / 100;

    // Visual scale based on species base scale + individual fish size (super large for leviathans)
    const baseScale = species.scaleFactor || 1.0;
    const maxScaleCap = (species.isLeviathan || baseScale >= 3.8 || realmSize > 1.5) ? 6.5 : 3.8;
    this.scale = Math.min(maxScaleCap, Math.max(0.55, baseScale * (0.8 + (sizeRatio - 1) * 0.55) * realmSize));

    // Movement & direction
    this.direction = Math.random() < 0.5 ? 1 : -1; // 1 = right, -1 = left
    this.baseSpeed = species.swimSpeed * (0.85 + Math.random() * 0.35);
    this.speed = this.baseSpeed;
    this.wiggleTimer = Math.random() * Math.PI * 2;
    this.wiggleFreq = species.wiggleSpeed;

    // Entity state
    this.state = 'SWIMMING'; // 'SWIMMING' | 'HOOKED'
    this.hook = null;
    this.hookOffset = { x: 0, y: -22 };
    this.hookIndex = 0;

    // Collision radius (generous and responsive for big leviathans)
    this.radius = Math.max(14, Math.min(48, 16 * this.scale));

    // Elusive / Evasive abilities for rare, epic, and mythical fish
    this.evasion = species.evasion || null;
    if (!this.evasion && (this.rarity === 'rare' || this.rarity === 'epic' || this.rarity === 'legendary' || this.isMythic || this.isSpecialDeep)) {
      const defaultTypes = ['teleport', 'dash', 'camouflage', 'repel', 'zigzag'];
      const pick = defaultTypes[Math.floor(Math.random() * defaultTypes.length)];
      this.evasion = {
        type: pick,
        cooldown: pick === 'camouflage' ? 3.0 : 2.2,
        range: 115,
        label: pick.toUpperCase() + '!',
      };
    }

    this.evasionCooldown = 0.4 + Math.random() * 0.8;
    this.isDashing = false;
    this.dashTimer = 0;
    this.isCamouflaged = false;
    this.camoTimer = 0;
    this.deflectWave = 0;
    this.deflectColor = this.rarityGlow || '#38bdf8';
    this.teleportFlash = 0;

    // Determine 2D swimming movement pattern for unusual fish
    const shape = species.shape || '';
    const id = species.id || '';
    if (species.movementType) {
      this.movementType = species.movementType;
    } else if (shape === 'seahorse') {
      this.movementType = 'vertical_drift'; // Seahorse bobbing upright
    } else if (shape === 'jellyfish' || shape === 'squid') {
      this.movementType = 'vertical_pulse'; // Jellyfish/squid rhythmic upward pulse & drift
    } else if (shape === 'ray' || id.includes('ray') || shape === 'siren_ray') {
      this.movementType = 'diagonal_glide'; // Graceful ray swooping & gliding along diagonals
    } else if (shape === 'eel' || shape === 'ribbon_eel' || id.includes('serpent') || id.includes('ribbon') || shape === 'star_ribbon') {
      this.movementType = 'sine_wave'; // Undulating sinusoidal oceanic wave curves
    } else if (shape === 'angler' || shape === 'blobfish' || shape === 'scorpionfish' || id.includes('turtle') || id.includes('coelacanth') || species.isStationary) {
      this.movementType = 'hover'; // Ambush predator / ancient relic staying virtually still
    } else if (species.isAberrant || (id.includes('abyss') && Math.random() < 0.35)) {
      this.movementType = 'erratic'; // Deep anomaly darting unpredictably in 2D with pauses
    } else {
      this.movementType = 'horizontal'; // Standard horizontal cruising
    }

    this.pulseTimer = Math.random() * 2.5;
    this.glideTimer = Math.random() * Math.PI * 2;
    this.erraticTimer = 1.0 + Math.random() * 2.0;
    this.erraticVx = 0;
    this.erraticVy = 0;
    this.swimAngle = 0;
    this.minY = (options.surfaceY ?? 220) + Math.max(this.radius + 16, (species.minDepth || 0) * 15);
    this.maxY = Math.max(this.minY, (options.surfaceY ?? 220) + (species.maxDepth || 9999) * 15);
    // Keep resident fish near their spawn shelf, including vertically moving species.
    this.minY = Math.max(this.minY, y - 120);
    this.maxY = Math.max(this.minY, Math.min(this.maxY, y + 120));
    this.y = Math.max(this.minY, Math.min(this.maxY, this.y));
  }

  update(dt, worldWidth, hook, particles = null) {
    const deltaSec = dt / 1000;
    if (this.isGodTier && !this.announced && hook && ['DESCENDING', 'REELING'].includes(hook.state) && Math.abs(hook.y - this.y) < 420) {
      this.announced = true;
      soundManager.playDivineChime();
      particles?.emitSparkles(this.x, this.y, 55, '#fff4bd');
      particles?.addFloatingText('A DIVINE PRESENCE', hook.x, hook.y - 110, '#fff4bd', 24);
      particles?.addTrauma(.25);
    }
    this.wiggleTimer += this.wiggleFreq * deltaSec;

    // Tick evasion cooldowns & active timers
    if (this.evasionCooldown > 0) this.evasionCooldown -= deltaSec;
    if (this.teleportFlash > 0) this.teleportFlash -= deltaSec;

    if (this.isDashing) {
      this.dashTimer -= deltaSec;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.speed = this.baseSpeed;
      } else if (particles && Math.random() < 0.35) {
        particles.emitBubbles(this.x, this.y, 2, 4);
      }
    }

    if (this.isCamouflaged) {
      this.camoTimer -= deltaSec;
      if (this.camoTimer <= 0) {
        this.isCamouflaged = false;
        if (particles) {
          particles.emitSparkles(this.x, this.y, 8, this.rarityGlow || '#94a3b8');
        }
      }
    }

    if (this.deflectWave > 0) {
      this.deflectWave += 180 * deltaSec;
      if (this.deflectWave > 75) {
        this.deflectWave = 0;
      }
    }

    if (this.state === 'SWIMMING') {
      let vx = 0;
      let vy = 0;

      switch (this.movementType) {
        case 'hover': {
          // Stays virtually in place, hovering with gentle subtle bobbing
          vx = this.direction * (this.speed * 4) * deltaSec;
          vy = Math.sin(this.wiggleTimer * 0.8) * 10 * deltaSec;
          this.swimAngle = Math.sin(this.wiggleTimer * 0.6) * 0.04;
          break;
        }

        case 'vertical_pulse': {
          // Rhythmic jellyfish/squid upward pulse and gentle downward float
          this.pulseTimer += deltaSec;
          const cycle = 2.4;
          const phase = (this.pulseTimer % cycle) / cycle;
          if (phase < 0.35) {
            const push = (1 - phase / 0.35);
            vx = this.direction * (this.speed * 26 + push * 22) * deltaSec;
            vy = -54 * push * deltaSec;
            this.swimAngle = -0.32 * push;
          } else {
            vx = this.direction * (this.speed * 7) * deltaSec;
            vy = 16 * deltaSec;
            this.swimAngle = 0.08 * (phase - 0.35);
          }
          break;
        }

        case 'vertical_drift': {
          // Seahorse upright bobbing and slow vertical navigation
          this.glideTimer += deltaSec * 0.9;
          vx = this.direction * (this.speed * 12) * deltaSec;
          vy = Math.sin(this.glideTimer) * 30 * deltaSec;
          this.swimAngle = -0.42 + Math.sin(this.glideTimer * 1.4) * 0.08;
          break;
        }

        case 'diagonal_glide': {
          // Graceful rays banking and swooping on sweeping diagonal arcs
          this.glideTimer += deltaSec * 0.75;
          const swoop = Math.sin(this.glideTimer);
          vx = this.direction * (this.speed * 46) * deltaSec;
          vy = swoop * 34 * deltaSec;
          this.swimAngle = swoop * 0.28;
          break;
        }

        case 'sine_wave': {
          // Eel / serpent deep undulating oceanic wave
          vx = this.direction * (this.speed * 50) * deltaSec;
          vy = Math.cos(this.wiggleTimer * 1.2) * 38 * deltaSec;
          this.swimAngle = Math.cos(this.wiggleTimer * 1.2) * 0.25;
          break;
        }

        case 'erratic': {
          // Unpredictable abyss anomaly: bursts in 2D directions, pauses, then bolts
          this.erraticTimer -= deltaSec;
          if (this.erraticTimer <= 0) {
            this.erraticTimer = 1.2 + Math.random() * 2.2;
            const angle = Math.random() * Math.PI * 2;
            const spd = this.speed * (28 + Math.random() * 42);
            this.erraticVx = Math.cos(angle) * spd;
            this.erraticVy = Math.sin(angle) * spd * 0.6;
            if (this.erraticVx < 0) this.direction = -1;
            else if (this.erraticVx > 0) this.direction = 1;
          }
          vx = this.erraticVx * deltaSec;
          vy = this.erraticVy * deltaSec;
          this.erraticVx *= Math.max(0, 1 - 0.85 * deltaSec);
          this.erraticVy *= Math.max(0, 1 - 0.85 * deltaSec);
          this.swimAngle = Math.atan2(this.erraticVy, Math.abs(this.erraticVx) || 1) * 0.55;
          break;
        }

        case 'horizontal':
        default: {
          vx = this.direction * this.speed * 55 * deltaSec;
          vy = Math.sin(this.wiggleTimer * 0.7) * 0.35;
          this.swimAngle = Math.sin(this.wiggleTimer * 0.7) * 0.04;
          break;
        }
      }

      this.x += vx;
      this.y += vy;

      // Depth boundary constraints so fish remain in their natural ocean zone
      if (this.y < this.minY) {
        this.y = this.minY;
        if (vy < 0) {
          if (this.movementType === 'vertical_pulse') this.pulseTimer += 1.0;
          this.erraticVy *= -0.5;
        }
      } else if (this.y > this.maxY) {
        this.y = this.maxY;
        if (vy > 0) {
          this.erraticVy *= -0.5;
        }
      }

      // Turn around at world boundaries with smooth padding
      const margin = 50;
      if (this.x < margin && this.direction < 0) {
        this.direction = 1;
        this.erraticVx = Math.abs(this.erraticVx);
      } else if (this.x > worldWidth - margin && this.direction > 0) {
        this.direction = -1;
        this.erraticVx = -Math.abs(this.erraticVx);
      }

      // Random spontaneous direction turn (except for hover)
      if (this.movementType !== 'hover' && Math.random() < 0.002) {
        this.direction *= -1;
      }
    } else if (this.state === 'HOOKED' && hook) {
      this.isDashing = false;
      this.isCamouflaged = false;
      this.deflectWave = 0;

      // Firmly locked onto the line a bit above the hook and follows the hook
      const sway = Math.sin(this.wiggleTimer * 1.5) * 1.5;
      const offsetX = (this.hookOffset ? this.hookOffset.x : 0) + sway;
      const offsetY = this.hookOffset ? this.hookOffset.y : -22;
      this.x = hook.x + offsetX;
      this.y = hook.y + offsetY;
      this.wiggleFreq = this.species.wiggleSpeed * 2.2;
    }
  }

  executeEvasion(hook, particles, worldWidth) {
    const type = this.evasion.type;

    if (type === 'teleport') {
      soundManager.playTeleportWarp();
      if (particles) {
        particles.emitSparkles(this.x, this.y, 18, this.rarityGlow || '#38bdf8');
      }

      const blinkDist = this.evasion.blinkDist || 190;
      const awayAngle = Math.atan2(this.y - hook.y, this.x - hook.x) + (Math.random() - 0.5) * 0.7;
      let newX = this.x + Math.cos(awayAngle) * blinkDist;
      let newY = this.y + Math.sin(awayAngle) * (blinkDist * 0.65);

      newX = Math.max(70, Math.min(worldWidth - 70, newX));
      const minDepthY = this.minY;
      const maxDepthY = this.maxY;
      newY = Math.max(minDepthY, Math.min(maxDepthY, newY));

      this.x = newX;
      this.y = newY;
      this.direction = this.x < hook.x ? -1 : 1;
      this.teleportFlash = 0.35;
      this.evasionCooldown = this.evasion.cooldown || 2.4;

      if (particles) {
        particles.emitSparkles(this.x, this.y, 22, '#ffffff');
        particles.addFloatingText(this.evasion.label || '⚡ PHASE BLINK!', this.x, this.y - 20, this.rarityColor, 16, '#38bdf8');
      }
    } else if (type === 'dash') {
      soundManager.playDashWhoosh();
      this.isDashing = true;
      this.dashTimer = 0.8;
      this.direction = this.x < hook.x ? -1 : 1;
      this.speed = this.baseSpeed * (this.evasion.speedMult || 4.2);
      this.evasionCooldown = this.evasion.cooldown || 2.2;

      if (particles) {
        particles.emitBubbles(this.x, this.y, 6, 8);
        particles.emitSparkles(this.x, this.y, 12, this.rarityGlow || '#38bdf8');
        particles.addFloatingText(this.evasion.label || '💨 SPEED DASH!', this.x, this.y - 20, '#38bdf8', 16, '#60a5fa');
      }
    } else if (type === 'camouflage') {
      soundManager.playCloakVanish();
      this.isCamouflaged = true;
      this.camoTimer = this.evasion.duration || 1.8;
      this.evasionCooldown = this.evasion.cooldown || 3.0;

      if (particles) {
        particles.emitBubbles(this.x, this.y, 8, 12);
        particles.emitSparkles(this.x, this.y, 14, '#94a3b8');
        particles.addFloatingText(this.evasion.label || '🌫️ SHADOW CLOAK!', this.x, this.y - 20, '#cbd5e1', 16, '#64748b');
      }
    } else if (type === 'repel') {
      soundManager.playAuraDeflect();
      const pushAngle = Math.atan2(hook.y - this.y, hook.x - this.x);
      const force = this.evasion.force || 190;
      hook.vx += Math.cos(pushAngle) * force;
      hook.vy += Math.sin(pushAngle) * (force * 0.55);

      this.deflectWave = 14;
      this.deflectColor = this.rarityGlow || '#38bdf8';
      this.evasionCooldown = this.evasion.cooldown || 2.4;

      if (particles) {
        particles.emitSparkles(this.x, this.y, 16, this.deflectColor);
        particles.addFloatingText(this.evasion.label || '🛡️ FORCE DEFLECTION!', this.x, this.y - 20, '#fde047', 16, '#eab308');
        particles.addTrauma(0.18);
      }
    } else if (type === 'zigzag') {
      soundManager.playDashWhoosh();
      this.direction *= -1;
      this.y += (Math.random() < 0.5 ? -35 : 35);
      this.isDashing = true;
      this.dashTimer = 0.6;
      this.speed = this.baseSpeed * 3.4;
      this.evasionCooldown = this.evasion.cooldown || 2.0;

      if (particles) {
        particles.emitBubbles(this.x, this.y, 6, 8);
        particles.addFloatingText(this.evasion.label || '🌀 SLITHER EVADE!', this.x, this.y - 20, '#a855f7', 16, '#d8b4fe');
      }
    }
  }

  hookTo(hook, slotIndex) {
    this.state = 'HOOKED';
    this.hook = hook;
    this.hookIndex = slotIndex;
    this.isDashing = false;
    this.isCamouflaged = false;
    this.deflectWave = 0;

    // Fish stays on the line a bit above the hook:
    // Slot 0 sits 22px above hook, slot 1 sits 48px above, slot 2 sits 74px above
    const verticalOffset = -22 - slotIndex * 26;
    const side = slotIndex % 2 === 0 ? 1 : -1;
    const horizontalOffset = side * 3; // slight alternation directly on the line

    this.hookOffset = {
      x: horizontalOffset,
      y: verticalOffset,
    };

    // Immediately snap to position on the line above the hook
    this.x = hook.x + this.hookOffset.x;
    this.y = hook.y + this.hookOffset.y;
  }

  render(ctx, cameraY = 0, hook = null) {
    const isHooked = this.state === 'HOOKED';

    // When hooked, position is locked onto the line directly above the hook
    let posX = this.x;
    let posY = this.y;
    if (isHooked && this.hook) {
      const offsetX = this.hookOffset ? this.hookOffset.x : 0;
      const offsetY = this.hookOffset ? this.hookOffset.y : -22;
      posX = this.hook.x + offsetX;
      posY = this.hook.y + offsetY;
      this.x = posX;
      this.y = posY;
    }

    const drawY = posY - cameraY;
    const s = this.species;

    // Render expanding kinetic forcefield ripple when repelling
    if (this.deflectWave > 0) {
      ctx.save();
      ctx.strokeStyle = this.deflectColor || '#38bdf8';
      ctx.lineWidth = Math.max(1, 3.5 * (1 - this.deflectWave / 75));
      ctx.globalAlpha = Math.max(0, 1 - this.deflectWave / 75);
      ctx.shadowColor = this.deflectColor || '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(posX, drawY, this.deflectWave, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Leader monofilament line from hook up to fish
    if (isHooked && this.hook) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(this.hook.x, this.hook.y - cameraY);
      ctx.lineTo(posX, drawY);
      ctx.stroke();

      // Shiny silver tackle clip where fish attaches to the line
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(posX, drawY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(posX, drawY);

    // Apply camouflage opacity if cloaked
    if (this.isCamouflaged) {
      ctx.globalAlpha = 0.22;
    }

    if (isHooked) {
      // Fish is hooked along the line, facing upwards toward surface with lively wiggling
      const side = this.hookIndex % 2 === 0 ? 1 : -1;
      const hangAngle = -Math.PI / 2 + Math.sin(this.wiggleTimer) * 0.22 + side * 0.1;
      ctx.rotate(hangAngle);
    } else {
      ctx.scale(this.direction, 1);
      if (this.swimAngle) {
        ctx.rotate(this.swimAngle);
      }
    }

    ctx.scale(this.scale, this.scale);

    // Speed lines if currently dashing
    if (this.isDashing) {
      ctx.save();
      ctx.strokeStyle = this.rarityGlow || 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-28, -6);
      ctx.lineTo(-50, -6);
      ctx.moveTo(-30, 6);
      ctx.lineTo(-55, 6);
      ctx.stroke();
      ctx.restore();
    }

    // Teleport star flash
    if (this.teleportFlash > 0) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.globalAlpha = Math.min(1.0, this.teleportFlash / 0.35);
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Flashy visual auras & particles for rarer fish (rare, epic, legendary, leviathan, shiny)
    const isRainbow = s.isRainbow || (s.rarity === 'legendary' && !this.isShiny);
    const isEpic = s.rarity === 'epic' && !this.isShiny;
    const isRare = s.rarity === 'rare' && !this.isShiny;

    if (s.rarity === 'uncommon' || this.isShiny || isRainbow || isEpic || isRare || this.isMythic || this.isSpecialDeep || s.glowColor) {
      ctx.save();
      // A feathered oval wash, with no solid center or hard ring.
      const color = RARITY_CONFIG[s.rarity]?.color || '#c084fc';
      const rgb = [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16)).join(',');
      const radius = s.isLeviathan ? 58 : 46;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      glow.addColorStop(0, `rgba(${rgb},0.40)`);
      glow.addColorStop(0.25, `rgba(${rgb},0.31)`);
      glow.addColorStop(0.55, `rgba(${rgb},0.15)`);
      glow.addColorStop(1, `rgba(${rgb},0)`);
      ctx.globalAlpha *= 0.92 + Math.sin(this.wiggleTimer * 1.2) * 0.04;
      ctx.scale(1.15, 0.72);
      ctx.fillStyle = glow;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    }

    if (this.isGodTier) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = '#fff4bd'; ctx.shadowBlur = 12;
      for (let i = 0; i < 7; i++) {
        const angle = i * Math.PI * 2 / 7 + this.wiggleTimer * .22;
        const x = Math.cos(angle) * 48, y = Math.sin(angle) * 26;
        ctx.fillStyle = i % 2 ? '#fff7dc' : this.species.primaryColor;
        ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + 2, y); ctx.lineTo(x, y + 4); ctx.lineTo(x - 2, y); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    // Trailing rainbow/stardust particle motes for rare/epic/legendary fish
    if (isRainbow || s.rarity === 'legendary') {
      ctx.save();
      const t = this.wiggleTimer;
      for (let p = 0; p < 4; p++) {
        const px = -28 - p * 9 + Math.sin(t * 3 + p) * 4;
        const py = Math.sin(t * 4 + p * 2) * 7;
        const sparkHue = (this.wiggleTimer * 80 + p * 60) % 360;
        ctx.fillStyle = `hsl(${sparkHue}, 100%, 70%)`;
        ctx.shadowColor = `hsl(${sparkHue}, 100%, 60%)`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (isEpic) {
      ctx.save();
      const t = this.wiggleTimer;
      ctx.fillStyle = '#f472b6';
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 6;
      for (let p = 0; p < 3; p++) {
        const px = -26 - p * 8 + Math.sin(t * 2.5 + p) * 3;
        const py = Math.cos(t * 3 + p) * 6;
        ctx.beginPath();
        ctx.arc(px, py, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (isRare) {
      ctx.save();
      const t = this.wiggleTimer;
      ctx.fillStyle = '#67e8f9';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 5;
      for (let p = 0; p < 2; p++) {
        const px = -24 - p * 7 + Math.sin(t * 3 + p) * 2;
        const py = Math.sin(t * 2 + p) * 5;
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Fantasy species particle trail & aura
    if (s.fantasyTrail) {
      ctx.save();
      const trail = s.fantasyTrail;
      const t = this.wiggleTimer;
      if (trail === 'starlight' || trail === 'sparkle' || trail === 'rainbow') {
        ctx.fillStyle = trail === 'rainbow' ? '#f43f5e' : '#fef08a';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 6;
        for (let p = 0; p < 3; p++) {
          const px = -25 - p * 8 + Math.sin(t * 2 + p) * 3;
          const py = Math.sin(t * 3 + p) * 5;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (trail === 'biolum' || trail === 'neon') {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        for (let p = 0; p < 3; p++) {
          const px = -24 - p * 7;
          const py = Math.cos(t * 2.5 + p) * 4;
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (trail === 'embers') {
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        for (let p = 0; p < 3; p++) {
          const px = -22 - p * 6;
          const py = Math.sin(t * 3 + p) * 6;
          ctx.beginPath();
          ctx.arc(px, py, 2.0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (trail === 'aether' || trail === 'aurora' || trail === 'emerald') {
        ctx.fillStyle = trail === 'aether' ? '#e879f9' : (trail === 'emerald' ? '#34d399' : '#38bdf8');
        ctx.shadowColor = trail === 'aether' ? '#c026d3' : (trail === 'emerald' ? '#059669' : '#a855f7');
        ctx.shadowBlur = 8;
        for (let p = 0; p < 4; p++) {
          const px = -24 - p * 6;
          const py = Math.sin(t * 2 + p * 1.5) * 5;
          ctx.beginPath();
          ctx.arc(px, py, 2.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Crown floating icon above fish if crowned
    if (this.crown) {
      ctx.save();
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.crown === 'gold' ? '👑' : '🥈', 0, -18);
      ctx.restore();
    }

    // Dynamic vibrant color gradients (rainbow for legendary, neon for epic, iridescent for rare)
    let primary = this.isShiny ? '#fbbf24' : (s.primaryColor || '#38bdf8');
    let secondary = this.isShiny ? '#fef08a' : (s.secondaryColor || '#93c5fd');
    let finColor = this.isShiny ? '#f59e0b' : (s.finColor || '#0284c7');

    if (isRainbow) {
      const hue = (this.wiggleTimer * 65 + this.x * 0.15) % 360;
      const rainbowGrad = ctx.createLinearGradient(-30, -15, 30, 15);
      rainbowGrad.addColorStop(0, `hsl(${hue}, 95%, 60%)`);
      rainbowGrad.addColorStop(0.2, `hsl(${(hue + 55) % 360}, 95%, 62%)`);
      rainbowGrad.addColorStop(0.4, `hsl(${(hue + 110) % 360}, 95%, 65%)`);
      rainbowGrad.addColorStop(0.6, `hsl(${(hue + 175) % 360}, 95%, 62%)`);
      rainbowGrad.addColorStop(0.8, `hsl(${(hue + 235) % 360}, 95%, 65%)`);
      rainbowGrad.addColorStop(1, `hsl(${(hue + 300) % 360}, 95%, 60%)`);
      primary = rainbowGrad;
      secondary = `hsl(${(hue + 180) % 360}, 90%, 75%)`;
      finColor = `hsl(${(hue + 75) % 360}, 95%, 65%)`;
    } else if (isEpic && !s.isLeviathan) {
      const epicGrad = ctx.createLinearGradient(-25, -12, 25, 12);
      epicGrad.addColorStop(0, s.primaryColor || '#9333ea');
      epicGrad.addColorStop(0.5, '#ec4899');
      epicGrad.addColorStop(1, s.secondaryColor || '#38bdf8');
      primary = epicGrad;
    } else if (isRare && !s.isLeviathan) {
      const rareGrad = ctx.createLinearGradient(-22, -10, 22, 10);
      rareGrad.addColorStop(0, s.primaryColor || '#0284c7');
      rareGrad.addColorStop(0.5, '#38bdf8');
      rareGrad.addColorStop(1, s.secondaryColor || '#67e8f9');
      primary = rareGrad;
    }

    const isCustomTailLeviathan = [
      'colossal_kraken',
      'world_serpent',
      'megalodon_behemoth',
      'gargantuan_angler',
      'void_wyrm',
    ].includes(s.shape);

    const wiggle = Math.sin(this.wiggleTimer) * 4;

    // Tail fin (custom leviathans draw their own magnificent fins/tentacles)
    if (!isCustomTailLeviathan) {
      ctx.save();
      ctx.translate(-16, 0);
      ctx.rotate(wiggle * (s.shape === 'magikart' ? 0.12 : 0.08));
      ctx.fillStyle = finColor;
      ctx.beginPath();
      if (s.shape === 'magikart') {
        ctx.moveTo(0, 0);
        ctx.lineTo(-14, -14);
        ctx.quadraticCurveTo(-18, -4, -22, -10);
        ctx.quadraticCurveTo(-15, 0, -22, 10);
        ctx.quadraticCurveTo(-18, 4, -14, 14);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, -8);
        ctx.quadraticCurveTo(-7, 0, -14, 8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Body based on shape
    ctx.fillStyle = primary;
    ctx.beginPath();

    if (s.shape === 'star_ribbon') {
      // Abyssal Star-Weaver: Celestial translucent ribbon eel
      ctx.ellipse(0, 0, 36, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (let st = -24; st <= 24; st += 12) {
        ctx.beginPath();
        ctx.arc(st, Math.sin(this.wiggleTimer * 2 + st) * 3, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (s.shape === 'mossback_turtle') {
      // Old Mossback Leviathan: Giant turtle with coral reef shell
      ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, -6, 14, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(8, -14, 4, 0, Math.PI * 2);
      ctx.arc(-6, -14, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.ellipse(12, 12, 10, 5, 0.4, 0, Math.PI * 2);
      ctx.ellipse(-12, 12, 8, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.shape === 'aurora_billfish') {
      // Aurora Sailfin: Polar billfish with aurora dorsal fin
      ctx.ellipse(0, 0, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
      ctx.beginPath();
      ctx.moveTo(-16, -6);
      ctx.quadraticCurveTo(0, -28 + Math.sin(this.wiggleTimer) * 4, 14, -6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(25, 0);
      ctx.lineTo(46, -1);
      ctx.stroke();
    } else if (s.shape === 'golden_coelacanth') {
      // Golden Coelacanth: Heavy prehistoric armor plates
      ctx.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      for (let sc = -14; sc <= 14; sc += 7) {
        ctx.beginPath();
        ctx.arc(sc, 0, 6, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
    } else if (s.shape === 'magikart') {
      // Magikart: Iconic orange-red carp with 3-pointed golden crown fin, yellow whiskers & derpy eyes!
      // 1. Chunky orange-red carp body
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flank scale pattern (cream diamond scales)
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.lineTo(-2, -3);
      ctx.lineTo(-6, 2);
      ctx.lineTo(-10, -3);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(3, -7);
      ctx.lineTo(7, -2);
      ctx.lineTo(3, 3);
      ctx.lineTo(-1, -2);
      ctx.closePath();
      ctx.fill();

      // 2. 3-Pointed Golden Royal Crown Fin on Back (Dorsal)
      ctx.fillStyle = finColor;
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-14, -12);
      ctx.lineTo(-11, -24);
      ctx.lineTo(-6, -15);
      ctx.lineTo(0, -27);
      ctx.lineTo(6, -15);
      ctx.lineTo(11, -24);
      ctx.lineTo(14, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3. 3-Pointed Golden Ventral Fin on Belly
      ctx.beginPath();
      ctx.moveTo(-10, 12);
      ctx.lineTo(-8, 22);
      ctx.lineTo(-4, 15);
      ctx.lineTo(0, 24);
      ctx.lineTo(4, 15);
      ctx.lineTo(8, 22);
      ctx.lineTo(10, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Pectoral Fin (white/cream flapping fin)
      const flap = Math.sin(this.wiggleTimer * 1.5) * 6;
      ctx.fillStyle = '#fef9c3';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(-2, 4, 8, 5, 0.4 + flap * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 5. Open Pink 'O' Gasping Mouth at front
      ctx.fillStyle = '#fb7185';
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(22, 2, 4.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 6. Long Golden Wavy Whiskers (Barbels) streaming from cheek
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      const whiskerWiggle = Math.sin(this.wiggleTimer * 1.2) * 5;
      // Top whisker
      ctx.beginPath();
      ctx.moveTo(14, 5);
      ctx.bezierCurveTo(24, 12 + whiskerWiggle, 28, 22 - whiskerWiggle, 36, 28 + whiskerWiggle);
      ctx.stroke();
      // Bottom whisker
      ctx.beginPath();
      ctx.moveTo(11, 8);
      ctx.bezierCurveTo(18, 18 - whiskerWiggle, 22, 28 + whiskerWiggle, 28, 36 - whiskerWiggle);
      ctx.stroke();
    } else if (s.shape === 'siren_ray') {
      // The Whispering Siren Ray: Royal manta ray
      ctx.moveTo(0, -22);
      ctx.lineTo(24, 0);
      ctx.lineTo(0, 22);
      ctx.lineTo(-20, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.arc(20, -6, 3, 0, Math.PI * 2);
      ctx.arc(20, 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-44, 0);
      ctx.stroke();
    } else if (s.shape === 'clockwork_nautilus') {
      // Clockwork Nautilus: Spiral shell with exposed gear-work
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2.5;
      for (let arm = 0; arm < 4; arm++) {
        const startAngle = (arm / 4) * Math.PI * 2 + this.wiggleTimer * 0.15;
        const r1 = 5 + arm * 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, r1, startAngle, startAngle + Math.PI * 0.8);
        ctx.stroke();
      }

      ctx.strokeStyle = finColor;
      ctx.lineWidth = 2;
      const gearCount = 10;
      for (let g = 0; g < gearCount; g++) {
        const ga = (g / gearCount) * Math.PI * 2 + this.wiggleTimer * 0.25;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ga) * 18, Math.sin(ga) * 18);
        ctx.lineTo(Math.cos(ga) * 23, Math.sin(ga) * 23);
        ctx.stroke();
      }

      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.shape === 'eclipse_moon_jelly') {
      // Eclipse Moon-Jelly: Dark celestial bell with radiant corona
      const pulse = 0.88 + Math.abs(Math.sin(this.wiggleTimer * 0.9)) * 0.15;

      ctx.strokeStyle = `rgba(196, 181, 253, 0.7)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 21 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = finColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Trailing luminous tentacles
      ctx.strokeStyle = `rgba(167, 139, 250, 0.65)`;
      ctx.lineWidth = 1.5;
      for (let t = -3; t <= 3; t++) {
        const tx = t * 5;
        ctx.beginPath();
        ctx.moveTo(tx, 16);
        ctx.quadraticCurveTo(
          tx + Math.sin(this.wiggleTimer + t) * 7,
          24 + t * 2,
          tx + Math.cos(this.wiggleTimer * 0.7 + t) * 5,
          36 + Math.abs(t) * 3
        );
        ctx.stroke();
      }
    } else if (s.shape === 'eel') {
      ctx.ellipse(0, 0, 30, 6, 0, 0, Math.PI * 2);
    } else if (s.shape === 'disc' || s.shape === 'oval') {
      ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
    } else if (s.shape === 'seahorse') {
      ctx.ellipse(0, -6, 7, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(0, 8, 5, 10, 0, 0, Math.PI * 2);
    } else if (s.shape === 'octopus') {
      ctx.ellipse(-2, 0, 16, 13, 0, 0, Math.PI * 2);
      ctx.strokeStyle = primary;
      ctx.lineWidth = 3;
      for (let t = -8; t <= 8; t += 4) {
        ctx.beginPath();
        ctx.moveTo(10, t);
        ctx.quadraticCurveTo(20, t + wiggle, 26, t * 1.3);
        ctx.stroke();
      }
    } else if (s.shape === 'squid') {
      ctx.moveTo(-18, 0);
      ctx.lineTo(8, -10);
      ctx.lineTo(16, 0);
      ctx.lineTo(8, 10);
      ctx.closePath();
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      for (let t = -6; t <= 6; t += 3) {
        ctx.beginPath();
        ctx.moveTo(14, t);
        ctx.quadraticCurveTo(24, t + wiggle, 30, t * 1.4);
        ctx.stroke();
      }
    } else if (s.shape === 'shark' || s.shape === 'whale' || s.shape === 'swordfish') {
      ctx.ellipse(0, 0, 28, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.lineTo(2, -22);
      ctx.lineTo(12, -10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = primary;

      if (s.shape === 'swordfish') {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(24, 0);
        ctx.lineTo(44, 0);
        ctx.stroke();
      }
    } else if (s.shape === 'colossal_kraken') {
      // 1. Colossal Abyssal Kraken: Giant undulating mantle, 8 waving bioluminescent tentacles with suckers & hypnotic golden eye
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(-6, -22);
      ctx.bezierCurveTo(-36, -26, -58, -14, -58, 0);
      ctx.bezierCurveTo(-58, 14, -36, 26, -6, 22);
      ctx.bezierCurveTo(8, 18, 14, 10, 14, 0);
      ctx.bezierCurveTo(14, -10, 8, -18, -6, -22);
      ctx.closePath();
      ctx.fill();

      // Glowing bio-luminescent mantle runes
      ctx.strokeStyle = s.glowColor || '#e879f9';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = s.glowColor || '#e879f9';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(-22, -8, 5, 0, Math.PI * 2);
      ctx.arc(-36, 0, 7, 0, Math.PI * 2);
      ctx.arc(-22, 8, 5, 0, Math.PI * 2);
      ctx.stroke();

      // 8 Undulating tentacles with glowing suction cups
      for (let t = 0; t < 8; t++) {
        const spreadY = (t - 3.5) * 6;
        const tWave = Math.sin(this.wiggleTimer * 1.6 + t * 0.7) * 10;
        const tLen = 46 + (t % 2 === 0 ? 14 : 0);

        ctx.strokeStyle = primary;
        ctx.lineWidth = Math.max(2, 4.5 - Math.abs(t - 3.5) * 0.4);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(10, spreadY * 0.5);
        ctx.bezierCurveTo(
          24, spreadY + tWave * 0.5,
          36, spreadY * 1.2 + tWave,
          10 + tLen, spreadY * 1.3 - tWave
        );
        ctx.stroke();

        // Glowing suction cups
        ctx.fillStyle = s.glowColor || '#38bdf8';
        ctx.shadowColor = s.glowColor || '#38bdf8';
        ctx.shadowBlur = 4;
        for (let sIdx = 1; sIdx <= 3; sIdx++) {
          const sx = 10 + (tLen * sIdx) / 3.8;
          const sy = spreadY * 0.8 + tWave * (sIdx / 3);
          ctx.beginPath();
          ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Massive hypnotic golden kraken eye
      const eyeX = -4;
      const eyeY = -5;
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, 6.5, 4.8, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, 1.8, 4.2, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX + 1.8, eyeY - 1.5, 1.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.shape === 'world_serpent') {
      // 2. Jörmungandr the Void Serpent: Undulating multi-segment sea dragon with rainbow dorsal spines
      const segmentCount = 6;
      for (let seg = segmentCount; seg >= 0; seg--) {
        const segT = seg / segmentCount;
        const segX = 22 - seg * 13;
        const wave = Math.sin(this.wiggleTimer * 2.2 - seg * 0.55) * 11;
        const radiusX = 13 * (1 - segT * 0.4);
        const radiusY = 10 * (1 - segT * 0.4);

        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.ellipse(segX, wave, radiusX, radiusY, wave * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // Glowing dorsal spines
        if (seg > 0) {
          ctx.fillStyle = s.glowColor || '#818cf8';
          ctx.shadowColor = s.glowColor || '#818cf8';
          ctx.shadowBlur = 7;
          ctx.beginPath();
          ctx.moveTo(segX - 3, wave - radiusY);
          ctx.lineTo(segX, wave - radiusY - 9 * (1 - segT * 0.3));
          ctx.lineTo(segX + 3, wave - radiusY);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Dragon head with horns, whiskers and glowing eye
      const headWave = Math.sin(this.wiggleTimer * 2.2) * 11;
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(18, headWave - 9);
      ctx.lineTo(38, headWave - 4);
      ctx.lineTo(36, headWave + 5);
      ctx.lineTo(18, headWave + 10);
      ctx.closePath();
      ctx.fill();

      // Dragon horns sweeping back
      ctx.fillStyle = s.finColor || '#6366f1';
      ctx.beginPath();
      ctx.moveTo(20, headWave - 8);
      ctx.quadraticCurveTo(8, headWave - 22, -4, headWave - 18);
      ctx.quadraticCurveTo(10, headWave - 13, 24, headWave - 6);
      ctx.closePath();
      ctx.fill();

      // Cosmic whiskers
      ctx.strokeStyle = s.secondaryColor || '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(34, headWave + 2);
      ctx.quadraticCurveTo(46, headWave + 10 + Math.sin(this.wiggleTimer * 2) * 6, 56, headWave + 7);
      ctx.stroke();

      // Sharp fangs
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(28, headWave + 3);
      ctx.lineTo(31, headWave + 8);
      ctx.lineTo(34, headWave + 3);
      ctx.closePath();
      ctx.fill();

      // Radiant void eye
      ctx.fillStyle = s.eyeColor || '#a5f3fc';
      ctx.shadowColor = s.glowColor || '#818cf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(26, headWave - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(27, headWave - 3, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.shape === 'megalodon_behemoth') {
      // 3. Apex Abyssal Megalodon: Colossal apex shark with volcanic magma fissures and serrated jaws
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.ellipse(0, 0, 42, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Giant apex dorsal fin with battle scar notches
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-6, -14);
      ctx.lineTo(4, -36);
      ctx.lineTo(12, -26);
      ctx.lineTo(10, -22);
      ctx.lineTo(18, -14);
      ctx.closePath();
      ctx.fill();

      // Huge crescent caudal tail
      ctx.beginPath();
      ctx.moveTo(-36, 0);
      ctx.quadraticCurveTo(-46, -26, -58, -32);
      ctx.quadraticCurveTo(-48, 0, -58, 28);
      ctx.quadraticCurveTo(-44, 20, -36, 0);
      ctx.closePath();
      ctx.fill();

      // Volcanic magma scars pulsing across flanks
      ctx.save();
      ctx.strokeStyle = s.secondaryColor || '#f97316';
      ctx.shadowColor = s.glowColor || '#fb923c';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.4;
      const pulseMagma = 0.8 + Math.sin(this.wiggleTimer * 3) * 0.2;
      ctx.globalAlpha = pulseMagma;
      ctx.beginPath();
      ctx.moveTo(-16, -6);
      ctx.lineTo(-4, 2);
      ctx.lineTo(8, -4);
      ctx.lineTo(20, 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-8, 6);
      ctx.lineTo(4, 10);
      ctx.lineTo(14, 5);
      ctx.stroke();
      ctx.restore();

      // Glowing volcanic gill slits
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      for (let g = 0; g < 3; g++) {
        ctx.beginPath();
        ctx.moveTo(10 + g * 4, -4);
        ctx.lineTo(8 + g * 4, 8);
        ctx.stroke();
      }

      // Cavernous jaw with triangular razor teeth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      for (let tooth = 0; tooth < 4; tooth++) {
        const tx = 25 + tooth * 4;
        ctx.moveTo(tx, 3);
        ctx.lineTo(tx + 2, 8);
        ctx.lineTo(tx + 4, 3);
      }
      ctx.closePath();
      ctx.fill();

      // Glowing red predatory eye with heavy armored brow
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(28, -6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = s.eyeColor || '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(28, -6, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.shape === 'gargantuan_angler') {
      // 4. Gargantuan Abyssal Dreadnought: Bulky armored angler with giant celestial star lure & crystal needle fangs
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.ellipse(0, 2, 34, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Armored dorsal spines
      ctx.fillStyle = finColor;
      for (let sp = -18; sp <= 10; sp += 7) {
        ctx.beginPath();
        ctx.moveTo(sp - 3, -18);
        ctx.lineTo(sp, -27);
        ctx.lineTo(sp + 3, -18);
        ctx.closePath();
        ctx.fill();
      }

      // Wide fan tail fin
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-30, 2);
      ctx.lineTo(-48, -16);
      ctx.quadraticCurveTo(-42, 2, -48, 20);
      ctx.closePath();
      ctx.fill();

      // Cavernous undershot jaw with needle crystal fangs
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(14, 2);
      ctx.lineTo(34, 4);
      ctx.lineTo(32, 18);
      ctx.lineTo(14, 16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#a5f3fc';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      for (let f = 0; f < 5; f++) {
        const fx = 16 + f * 4;
        ctx.beginPath();
        ctx.moveTo(fx, 16);
        ctx.lineTo(fx + 1.5, 5);
        ctx.lineTo(fx + 3, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Massive arching illicium lure stalk with glowing celestial star lantern
      const lureWiggle = Math.sin(this.wiggleTimer * 2) * 5;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(6, -20);
      ctx.bezierCurveTo(12, -42, 32, -44 + lureWiggle, 36, -30 + lureWiggle);
      ctx.stroke();

      const lanternX = 36;
      const lanternY = -30 + lureWiggle;
      const bulbPulse = 1.0 + Math.sin(this.wiggleTimer * 4) * 0.25;

      ctx.fillStyle = 'rgba(34, 211, 238, 0.45)';
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 14 * bulbPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 5 * bulbPulse, 0, Math.PI * 2);
      ctx.fill();

      // Lateral line photophores
      ctx.fillStyle = s.secondaryColor || '#22d3ee';
      ctx.shadowColor = s.secondaryColor || '#22d3ee';
      ctx.shadowBlur = 6;
      for (let p = -18; p <= 12; p += 6) {
        ctx.beginPath();
        ctx.arc(p, 4, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Piercing pale cyan eye
      ctx.fillStyle = s.eyeColor || '#67e8f9';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(20, -6, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(20, -6, 1.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.shape === 'void_wyrm') {
      // 5. Astral Void Wyrm: Celestial dragon with 4 flapping nebula wings & constellation scales
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.ellipse(0, 0, 44, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Astral tail frills
      const tailWiggle = Math.sin(this.wiggleTimer * 2.5) * 8;
      ctx.beginPath();
      ctx.moveTo(-36, 0);
      ctx.quadraticCurveTo(-54, tailWiggle - 14, -68, tailWiggle - 22);
      ctx.quadraticCurveTo(-58, tailWiggle, -68, tailWiggle + 18);
      ctx.quadraticCurveTo(-50, tailWiggle + 8, -36, 0);
      ctx.closePath();
      ctx.fillStyle = finColor;
      ctx.fill();

      // 4 Flapping glowing translucent nebula wings
      const wingFlap = Math.sin(this.wiggleTimer * 2.8) * 16;
      ctx.save();
      ctx.fillStyle = 'rgba(236, 72, 153, 0.75)';
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.quadraticCurveTo(8, -36 + wingFlap, 24, -42 + wingFlap);
      ctx.quadraticCurveTo(14, -20 + wingFlap * 0.5, 8, -10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
      ctx.beginPath();
      ctx.moveTo(-22, -8);
      ctx.quadraticCurveTo(-14, -28 + wingFlap * 0.8, -2, -32 + wingFlap * 0.8);
      ctx.quadraticCurveTo(-10, -18 + wingFlap * 0.4, -12, -8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.beginPath();
      ctx.moveTo(-4, 10);
      ctx.quadraticCurveTo(6, 28 - wingFlap * 0.6, 18, 32 - wingFlap * 0.6);
      ctx.quadraticCurveTo(10, 18 - wingFlap * 0.3, 6, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Constellation stars across body
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 8;
      const stars = [
        [-22, -2], [-14, 4], [-4, -3], [6, 2], [16, -4], [26, 1]
      ];
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(stars[0][0], stars[0][1]);
      for (let sIdx = 1; sIdx < stars.length; sIdx++) {
        ctx.lineTo(stars[sIdx][0], stars[sIdx][1]);
      }
      ctx.stroke();
      for (const [sx, sy] of stars) {
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Astral horns
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(24, -10);
      ctx.quadraticCurveTo(12, -26, 0, -24);
      ctx.quadraticCurveTo(16, -16, 28, -8);
      ctx.closePath();
      ctx.fill();

      // Starlight whiskers
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(36, 0);
      ctx.quadraticCurveTo(50, 8 + Math.sin(this.wiggleTimer * 2) * 5, 58, 4);
      ctx.stroke();

      // Radiant celestial eye
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(30, -4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4c0519';
      ctx.beginPath();
      ctx.arc(30.5, -4, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.shape === 'ray') {
      ctx.moveTo(0, -18);
      ctx.lineTo(20, 0);
      ctx.lineTo(0, 18);
      ctx.lineTo(-18, 0);
      ctx.closePath();
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.quadraticCurveTo(-28, wiggle, -40, 0);
      ctx.stroke();
    } else {
      ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Belly stripe accent (skip for magikart and custom leviathans which have custom flank art)
    if (s.shape !== 'magikart' && !isCustomTailLeviathan) {
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.ellipse(0, 4, 14, 5, 0, 0, Math.PI);
      ctx.fill();
    }

    // Species markings make members of a realm distinguishable at a glance.
    if (s.pattern) {
      ctx.save();
      ctx.globalAlpha *= 0.7;
      ctx.strokeStyle = secondary;
      ctx.fillStyle = secondary;
      ctx.lineWidth = 2;
      if (s.pattern === 'stripe') {
        ctx.beginPath(); ctx.moveTo(-12, -1); ctx.lineTo(10, -1); ctx.stroke();
      } else {
        for (let n = 0; n < 4; n++) {
          const x = -10 + n * 5;
          ctx.beginPath();
          if (s.pattern === 'spots') ctx.arc(x, -3 + n % 2 * 4, 1.8, 0, Math.PI * 2);
          else if (s.pattern === 'bands') ctx.rect(x, -6, 2, 11);
          else { ctx.moveTo(x, -5); ctx.lineTo(x + 2, -2); ctx.lineTo(x, 1); ctx.lineTo(x - 2, -2); ctx.closePath(); }
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Eye (custom leviathans already rendered their unique eyes)
    if (s.shape === 'magikart') {
      const eyeX = 12;
      const eyeY = -4;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(eyeX + 0.5, eyeY, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Eye catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX + 1.8, eyeY - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (!isCustomTailLeviathan) {
      const eyeX = s.shape === 'squid' ? 6 : s.shape === 'octopus' ? 4 : 11;
      const eyeY = -3;
      ctx.fillStyle = s.eyeColor || '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(eyeX + 0.5, eyeY, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Eye catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX + 1.2, eyeY - 1, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

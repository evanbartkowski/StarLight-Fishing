import { RARITY_CONFIG } from '../data/FishData.js';
import { calculateCrown, getCrownMultiplier } from '../data/legendaries.js';

export class Fish {
  constructor(species, x, y, options = {}) {
    this.species = species;
    this.speciesId = species.id;
    this.name = species.name;
    this.zone = species.zone;
    this.rarity = species.rarity;
    this.rarityColor = RARITY_CONFIG[species.rarity]?.color || '#ffffff';
    this.rarityGlow = RARITY_CONFIG[species.rarity]?.glow || '#ffffff';
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

    // Bigger fish sell for exponentially more + crown bonus
    const sizeMultiplier = Math.pow(sizeRatio, 1.85);
    let val = Math.round(species.baseValue * sizeMultiplier * crownMult * (this.isShiny ? 3.5 : 1.0));
    this.value = Math.max(1, val);

    // Visual scale based on species base scale + individual fish size
    const baseScale = species.scaleFactor || 1.0;
    this.scale = Math.min(3.8, Math.max(0.55, baseScale * (0.8 + (sizeRatio - 1) * 0.55)));

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

    // Collision radius
    this.radius = Math.max(14, 18 * this.scale);
  }

  update(dt, worldWidth, hook) {
    const deltaSec = dt / 1000;
    this.wiggleTimer += this.wiggleFreq * deltaSec;

    if (this.state === 'SWIMMING') {
      this.x += this.direction * this.speed * 55 * deltaSec;

      // Vertical subtle drifting bob
      this.y += Math.sin(this.wiggleTimer * 0.7) * 0.35;

      // Turn around at world boundaries with smooth padding
      const margin = 50;
      if (this.x < margin && this.direction < 0) {
        this.direction = 1;
      } else if (this.x > worldWidth - margin && this.direction > 0) {
        this.direction = -1;
      }

      // Random spontaneous direction turn
      if (Math.random() < 0.002) {
        this.direction *= -1;
      }
    } else if (this.state === 'HOOKED' && hook) {
      // Firmly locked onto the line a bit above the hook and follows the hook
      const sway = Math.sin(this.wiggleTimer * 1.5) * 1.5;
      const offsetX = (this.hookOffset ? this.hookOffset.x : 0) + sway;
      const offsetY = this.hookOffset ? this.hookOffset.y : -22;
      this.x = hook.x + offsetX;
      this.y = hook.y + offsetY;
      this.wiggleFreq = this.species.wiggleSpeed * 2.2;
    }
  }

  hookTo(hook, slotIndex) {
    this.state = 'HOOKED';
    this.hook = hook;
    this.hookIndex = slotIndex;

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

  render(ctx, cameraY = 0) {
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

    if (isHooked) {
      // Fish is hooked along the line, facing upwards toward surface with lively wiggling
      const side = this.hookIndex % 2 === 0 ? 1 : -1;
      const hangAngle = -Math.PI / 2 + Math.sin(this.wiggleTimer) * 0.22 + side * 0.1;
      ctx.rotate(hangAngle);
    } else {
      ctx.scale(this.direction, 1);
    }

    ctx.scale(this.scale, this.scale);

    // Shiny shimmer aura (optimized for zero lag)
    if (this.isShiny) {
      ctx.save();
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 14, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (this.isMythic || this.isSpecialDeep || s.glowColor) {
      // Celestial mythic or special deep titan aura (clean & efficient)
      ctx.save();
      const auraColor = s.glowColor || (this.isSpecialDeep ? 'rgba(56, 189, 248, 0.8)' : 'rgba(196, 181, 253, 0.7)');
      ctx.strokeStyle = auraColor;
      ctx.lineWidth = this.isSpecialDeep ? 2.5 : 2;
      ctx.shadowColor = s.glowColor || (this.isSpecialDeep ? '#38bdf8' : '#c084fc');
      ctx.shadowBlur = this.isSpecialDeep ? 12 : 8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
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

    // Colors
    const primary = this.isShiny ? '#fbbf24' : s.primaryColor;
    const secondary = this.isShiny ? '#fef08a' : s.secondaryColor;
    const finColor = this.isShiny ? '#f59e0b' : s.finColor;
    const wiggle = Math.sin(this.wiggleTimer) * 4;

    // Tail fin
    ctx.save();
    ctx.translate(-16, 0);
    ctx.rotate(wiggle * 0.08);
    ctx.fillStyle = finColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, -8);
    ctx.quadraticCurveTo(-7, 0, -14, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

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

    // Belly stripe accent
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.ellipse(0, 4, 14, 5, 0, 0, Math.PI);
    ctx.fill();

    // Eye
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

    ctx.restore();
  }
}

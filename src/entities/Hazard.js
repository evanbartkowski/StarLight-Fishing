import { drawNaturalHazard } from './NaturalHazardArt.js';
import { updateAttack, drawAttack } from './EnemyAttacks.js';
import { drawMarineThreat } from './MarineThreatArt.js';

export class Hazard {
  constructor(typeConfig, x, y) {
    this.type = typeConfig.id;
    this.marineKind = typeConfig.marineKind;
    this.behavior = typeConfig;
    this.homeX = x;
    this.homeY = y;
    this.chaseTime = 0;
    this.restTime = 0;
    this.facing = 1;
    this.realmStyle = typeConfig.realmStyle;
    this.naturalKind = typeConfig.naturalKind || (typeConfig.realmStyle === 'reef' ? ['plant', 'boulder', 'log', 'wreck'][typeConfig.variant || 0] : typeConfig.id === 'driftwood' ? 'log' : null);
    this.variant = typeConfig.variant || 0;
    this.zone = typeConfig.zone;
    this.name = typeConfig.name;
    this.damage = typeConfig.damage;
    this.knockback = typeConfig.knockback;
    this.color = typeConfig.color;
    this.glow = typeConfig.glow || '#ef4444';
    this.isColossal = !!typeConfig.isColossal;
    // Choose a permanent size per giant so its artwork and collision bounds agree.
    this.sizeScale = typeConfig.sizeScale || (this.isColossal ? [1.4, 1.85, 2.4][Math.floor(Math.random() * 3)] : 1);
    this.shieldCost = typeConfig.shieldCost || (this.isColossal && this.sizeScale >= 1.85 ? 2 : 1);
    this.radius = (typeConfig.radius || (this.isColossal ? 35 : 20)) * this.sizeScale;

    this.x = x;
    this.y = y;
    this.timer = Math.random() * Math.PI * 2;
    this.pulseSpeed = 1.8 + Math.random() * 1.2;
    this.driftX = (Math.random() * 2 - 1) * (this.isColossal ? 0.25 : 0.45);
  }

  update(dt, worldWidth, hook = null) {
    const deltaSec = dt / 1000;
    this.timer += this.pulseSpeed * deltaSec;
    if (this.marineKind && hook && ['DESCENDING', 'REELING'].includes(hook.state) && Math.abs(hook.x - this.x) > 1) {
      this.facing = Math.sign(hook.x - this.x);
    }
    if (updateAttack(this, dt, hook, worldWidth)) return;
    if (this.behavior.motion === 'falling') {
      this.y += 150 * deltaSec;
      if (this.y > this.homeY + 400) this.y = this.homeY;
      return;
    }
    if (this.behavior.motion === 'probe') {
      this.x = Math.max(this.radius, Math.min(worldWidth - this.radius, this.homeX + Math.sin(this.timer) * 100));
      this.y = this.homeY + Math.cos(this.timer * .7) * 70;
      return;
    }
    if (this.behavior.expedition) {
      this.x += (this.behavior.moveSpeed || 30) * this.facing * deltaSec;
      if (this.x > worldWidth + this.radius) this.facing = -1;
      if (this.x < -this.radius) this.facing = 1;
      this.y = this.homeY + Math.sin(this.timer) * 12;
      return;
    }
    if (this.marineKind) {
      this.restTime = Math.max(0, this.restTime - deltaSec);
      const config = this.behavior;
      const active = hook && ['DESCENDING', 'REELING'].includes(hook.state);
      const distance = active ? Math.hypot(hook.x - this.x, hook.y - this.y) : Infinity;
      const chasing = active && this.restTime === 0 && distance < config.detectionRadius
        && Math.abs(hook.y - this.homeY) < config.leash;
      this.chaseTime = chasing ? this.chaseTime + deltaSec : 0;
      if (this.chaseTime > (config.chaseDuration || 3)) { this.restTime = config.restDuration || 3; this.chaseTime = 0; }
      const pursuing = chasing && this.restTime === 0;
      const targetX = pursuing ? hook.x + Math.sin(this.timer * 1.6) * 24 : this.homeX + Math.sin(this.timer * .3) * 55;
      const targetY = pursuing ? hook.y + Math.cos(this.timer * 1.2) * 18 : this.homeY + Math.sin(this.timer * .4) * 22;
      const dx = targetX - this.x, dy = targetY - this.y;
      const length = Math.hypot(dx, dy);
      const step = Math.min(length, config.speed * (pursuing ? 1 : .25) * Math.min(deltaSec, .05));
      if (length > 0) { this.x += dx / length * step; this.y += dy / length * step; }
      this.x = Math.max(this.radius, Math.min(worldWidth - this.radius, this.x));
      this.y = Math.max(this.minY ?? 0, Math.min(this.maxY ?? Infinity, this.y));
      if (active && Math.abs(hook.x - this.x) > 1) this.facing = Math.sign(hook.x - this.x);
      return;
    }

    // Horizontal drift
    this.x += this.driftX * 30 * deltaSec;
    const margin = Math.min(worldWidth / 2, Math.max(35, this.radius + 12));
    this.x = Math.max(margin, Math.min(worldWidth - margin, this.x));
    if (this.x <= margin) this.driftX = Math.abs(this.driftX);
    if (this.x >= worldWidth - margin) this.driftX = -Math.abs(this.driftX);

    // Subtle vertical wave undulation
    this.y += Math.sin(this.timer * 1.5) * 0.35;
  }

  intersectsHook(x, y, hookRadius) {
    const shotIndex = this.shots?.findIndex(shot => Math.hypot(shot.x - x, shot.y - y) < hookRadius + 7) ?? -1;
    if (shotIndex >= 0) { this.shots.splice(shotIndex, 1); return true; }
    if (this.behavior.pulseHazard && this.timer % 6 < 3.5) return false;
    const verticalRadius = this.naturalKind === 'submarine' ? this.radius * 0.5 : this.radius;
    return ((x - this.x) / (this.radius + hookRadius)) ** 2
      + ((y - this.y) / (verticalRadius + hookRadius)) ** 2 < 1;
  }

  renderRealmHazard(ctx) {
    const r = this.radius / this.sizeScale;
    ctx.save();
    const material = ctx.createLinearGradient(-r, -r, r, r);
    material.addColorStop(0, this.color); material.addColorStop(1, '#172737');
    ctx.fillStyle = material;
    ctx.strokeStyle = this.glow;
    ctx.lineWidth = 2;
    ctx.shadowColor = this.glow;
    ctx.shadowBlur = 4;
    if (this.realmStyle === 'reef' || this.realmStyle === 'lava') {
      // Branching coral versus jagged basalt chimneys.
      const branches = this.realmStyle === 'reef' ? 7 : 4;
      for (let i = 0; i < branches; i++) {
        const x = (i / (branches - 1) - 0.5) * r * 1.5;
        const h = r * (0.55 + Math.abs(Math.sin(i * 8 + this.variant)) * 0.9);
        ctx.beginPath(); ctx.moveTo(x - 6, r * 0.55);
        ctx.lineTo(x - 4, -h * 0.65); ctx.lineTo(x + 5, -h);
        ctx.lineTo(x + 9, r * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    } else if (this.realmStyle === 'ruins') {
      // Rotating gear teeth, hanging chains, and broken arches.
      if (this.variant === 1) ctx.rotate(this.timer * 0.3);
      ctx.beginPath();
      for (let i = 0; i < 24; i++) {
        const angle = i * Math.PI / 12;
        const length = i % 2 ? r * 0.65 : r;
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#064e3b'; ctx.fillRect(-r * 0.22, -r * 0.35, r * 0.44, r * 0.85);
    } else if (this.realmStyle === 'crystal') {
      for (let i = 0; i < 3 + this.variant; i++) {
        ctx.save(); ctx.rotate(i * Math.PI * 2 / (3 + this.variant) + this.timer * 0.08);
        ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.22, 0);
        ctx.lineTo(0, r * 0.5); ctx.lineTo(-r * 0.22, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      }
    } else if (this.realmStyle === 'spore') {
      for (let i = 0; i < 6 + this.variant; i++) {
        const a = i * 2.4;
        const x = Math.cos(a) * r * 0.55, y = Math.sin(a) * r * 0.55;
        ctx.beginPath(); ctx.arc(x, y, r * (0.18 + 0.03 * Math.sin(this.timer + i)), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 8, y + r * 0.3, x - 4, y + r * 0.5); ctx.stroke();
      }
    } else {
      // Aether cyclones and void fractures have different moving silhouettes.
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const y = (i - 2) * r * 0.32;
        if (this.realmStyle === 'cloud') {
          ctx.ellipse(Math.sin(this.timer + i) * 4, y, r * (0.2 + i * 0.13), r * 0.17, 0, 0, Math.PI * 2);
        } else {
          ctx.moveTo(-r * 0.7, y); ctx.lineTo(-r * 0.2, y - 9);
          ctx.lineTo(r * 0.2, y + 9); ctx.lineTo(r * 0.7, y - 4);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  render(ctx, cameraY = 0) {
    const drawY = this.y - cameraY;
    ctx.save();
    ctx.translate(this.x, drawY);

    // A soft red halo signals danger without outlining the collision circle.
    const pulse = .5 + .5 * Math.sin(this.timer * 1.6);
    const haloRadius = this.radius * (1.35 + pulse * .08) + 10;
    const haloStrength = this.isColossal ? .2 : this.marineKind ? .1 : .045;
    const halo = ctx.createRadialGradient(0, 0, this.radius * .15, 0, 0, haloRadius);
    halo.addColorStop(0, `rgba(255,88,88,${haloStrength + pulse * haloStrength * .2})`);
    halo.addColorStop(.5, `rgba(255,88,88,${haloStrength * .55})`);
    halo.addColorStop(.75, `rgba(239,68,68,${haloStrength * .2})`);
    halo.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(-haloRadius, -haloRadius, haloRadius * 2, haloRadius * 2);

    ctx.scale(this.sizeScale, this.sizeScale);
    try {
      if (this.marineKind) {
        drawMarineThreat(ctx, this);
      } else if (this.naturalKind) {
        drawNaturalHazard(ctx, this.naturalKind, this.radius / this.sizeScale, this.timer);
      } else if (this.realmStyle) {
        this.renderRealmHazard(ctx);
      } else if (this.type === 'boot') {
        // Encrusted Old Sea Boot
        ctx.fillStyle = '#44403c';
        ctx.beginPath();
        ctx.moveTo(-10, -14);
        ctx.lineTo(2, -14);
        ctx.lineTo(2, -2);
        ctx.lineTo(14, 2);
        ctx.lineTo(14, 10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();

        // White barnacles
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(-4, 4, 2.5, 0, Math.PI * 2);
        ctx.arc(6, 6, 2, 0, Math.PI * 2);
        ctx.arc(-2, -8, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'pufferfish') {
        // Inflated Spiky Pufferfish
        const inflate = 1 + Math.sin(this.timer * 3) * 0.18;
        ctx.scale(inflate, inflate);

        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Radiating venom needles
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12);
          ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
          ctx.stroke();
        }

        // Puffer eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6, -4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(7, -4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'ghost_net') {
        // Tangled Ghost Net mesh
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = -14; i <= 14; i += 7) {
          ctx.moveTo(i, -12);
          ctx.lineTo(i + Math.sin(this.timer + i) * 4, 14);
        }
        for (let j = -12; j <= 14; j += 6) {
          ctx.moveTo(-14, j);
          ctx.lineTo(14, j + Math.cos(this.timer + j) * 4);
        }
        ctx.stroke();

        // Sinker weight
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(0, 14, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'electric_eel') {
        // Electric Eel with electric sparks
        const wiggle = Math.sin(this.timer * 4) * 8;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.quadraticCurveTo(0, wiggle, 18, -wiggle * 0.5);
        ctx.stroke();

        // Lightning zap spark
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(18, -6);
        ctx.lineTo(14, -2);
        ctx.lineTo(22, -8);
        ctx.stroke();
      } else if (this.type === 'anchor') {
        // Heavy Rusted Anchor
        ctx.fillStyle = '#475569';
        ctx.fillRect(-3, -16, 6, 28); // Stock
        ctx.fillRect(-12, -12, 24, 4); // Crossbar
        ctx.beginPath();
        ctx.arc(0, 8, 14, 0, Math.PI); // Flukes
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#475569';
        ctx.stroke();
      } else if (this.type === 'jellyfish') {
        const pulse = 1 + Math.sin(this.timer * 3) * 0.15;
        ctx.scale(1, pulse);

        ctx.shadowColor = this.glow;
        ctx.shadowBlur = 14;

        // Bell
        ctx.fillStyle = 'rgba(192, 132, 252, 0.75)';
        ctx.beginPath();
        ctx.arc(0, -6, 16, Math.PI, 0);
        ctx.quadraticCurveTo(0, 4, -16, 0);
        ctx.fill();

        // Stinging tentacles
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.85)';
        ctx.lineWidth = 1.8;
        for (let i = -10; i <= 10; i += 5) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          const wave = Math.sin(this.timer * 4 + i) * 6;
          ctx.bezierCurveTo(i + wave, 12, i - wave, 22, i + wave * 0.5, 30);
          ctx.stroke();
        }
      } else if (this.type === 'urchin') {
        // Dense spiky urchin
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2.2;
        const spikeCount = 14;
        for (let i = 0; i < spikeCount; i++) {
          const angle = (i / spikeCount) * Math.PI * 2 + this.timer * 0.15;
          const len = 17 + Math.sin(this.timer * 4 + i) * 3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 9, Math.sin(angle) * 9);
          ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
          ctx.stroke();
        }
      } else if (this.type === 'sea_mine') {
        // Naval Mine
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#52525b';
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          ctx.fillRect(Math.cos(angle) * 14 - 2, Math.sin(angle) * 14 - 2, 4, 7);
        }

        // Blinking red detonation light
        if (Math.sin(this.timer * 6) > 0) {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, -16, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (this.type === 'thermal_vent') {
        // Magma rock chimney
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.moveTo(-16, 16);
        ctx.lineTo(-6, -12);
        ctx.lineTo(6, -12);
        ctx.lineTo(16, 16);
        ctx.closePath();
        ctx.fill();

        // Magma glow
        ctx.fillStyle = '#ea580c';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(0, -12, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'void_tentacle') {
        // Colossal writhing tentacle with suction cups
        const wave = Math.sin(this.timer * 3) * 12;
        ctx.strokeStyle = '#4c0519';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 24);
        ctx.bezierCurveTo(wave, 10, -wave, -4, wave * 0.7, -24);
        ctx.stroke();

        // Glowing red suction cups
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(wave * 0.3 - 5, 8, 3, 0, Math.PI * 2);
        ctx.arc(-wave * 0.3 - 5, -8, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'mega_mine') {
        // Colossal Dreadnought Naval Mine
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        // Heavy steel spikes
        ctx.fillStyle = '#3f3f46';
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a - 0.15) * 24, Math.sin(a - 0.15) * 24);
          ctx.lineTo(Math.cos(a) * 36, Math.sin(a) * 36);
          ctx.lineTo(Math.cos(a + 0.15) * 24, Math.sin(a + 0.15) * 24);
          ctx.closePath();
          ctx.fill();
        }

        // Flashing siren core
        const flash = Math.sin(this.timer * 7) > 0;
        ctx.fillStyle = flash ? '#ef4444' : '#7f1d1d';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = flash ? 18 : 6;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (this.type === 'colossal_urchin') {
        // Giant Abyssal Void Urchin
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        // 20 Long Venomous Spikes
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.6;
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2 + this.timer * 0.1;
          const len = 34 + Math.sin(this.timer * 3 + i) * 4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
          ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
          ctx.stroke();
        }
      } else if (this.type === 'razor_spire') {
        // Submerged Razor Reef Spire
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(16, 20);
        ctx.lineTo(12, 32);
        ctx.lineTo(-12, 32);
        ctx.lineTo(-16, 18);
        ctx.closePath();
        ctx.fill();

        // Glowing magma veins
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(-6, 0);
        ctx.lineTo(8, 14);
        ctx.lineTo(2, 30);
        ctx.stroke();
      } else if (this.type === 'abyssal_jaw') {
        // Ancient Megalodon Fossil Skull Trap
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(0, 0, 24, Math.PI, 0);
        ctx.lineTo(20, 24);
        ctx.lineTo(-20, 24);
        ctx.closePath();
        ctx.fill();

        // Serrated White Teeth
        ctx.fillStyle = '#f8fafc';
        for (let x = -16; x <= 16; x += 8) {
          ctx.beginPath();
          ctx.moveTo(x - 3, 2);
          ctx.lineTo(x, 14);
          ctx.lineTo(x + 3, 2);
          ctx.closePath();
          ctx.fill();
        }
      } else if (this.type === 'toxic_colossus_jelly') {
        // Colossal Stygian Dread-Jelly
        ctx.fillStyle = 'rgba(88, 28, 135, 0.85)';
        ctx.beginPath();
        ctx.arc(0, -8, 26, Math.PI, 0);
        ctx.quadraticCurveTo(0, 10, -26, -8);
        ctx.fill();

        // Stinging tendrils
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        for (let i = -18; i <= 18; i += 6) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          const wave = Math.sin(this.timer * 4 + i) * 8;
          ctx.bezierCurveTo(i + wave, 14, i - wave, 28, i + wave * 0.5, 42);
          ctx.stroke();
        }
      } else if (this.type === 'sunken_galleon_hull') {
        // Colossal Sunken Galleon Hull
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.moveTo(-38, -14);
        ctx.lineTo(38, -14);
        ctx.quadraticCurveTo(42, 10, 30, 24);
        ctx.lineTo(-30, 24);
        ctx.quadraticCurveTo(-42, 10, -38, -14);
        ctx.closePath();
        ctx.fill();

        // Planks & Ribs
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Broken mast
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(-6, -34, 12, 20);

        // Barnacles
        ctx.fillStyle = '#d7ccc8';
        for (let b = -26; b <= 26; b += 12) {
          ctx.beginPath();
          ctx.arc(b, 12 + (b % 5), 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (this.type === 'megalodon_ribcage') {
        // Ancient Megalodon Fossil Ribcage
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        for (let r = -24; r <= 24; r += 12) {
          ctx.beginPath();
          ctx.arc(r, -4, 22, 0.4, Math.PI - 0.4);
          ctx.stroke();
        }
        // Spine
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(-34, -6, 68, 8);
      } else if (this.type === 'deep_sea_minefield') {
        // Titan Deep Sea Moored Mine
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Contact Spikes
        ctx.fillStyle = '#616161';
        for (let a = 0; a < 8; a++) {
          const ang = (a * Math.PI) / 4;
          const sx = Math.cos(ang) * 28;
          const sy = Math.sin(ang) * 28;
          const tx = Math.cos(ang) * 38;
          const ty = Math.sin(ang) * 38;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(tx, ty);
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        // Blinking Red LED
        const ledBlink = Math.sin(this.timer * 6) > 0;
        ctx.fillStyle = ledBlink ? '#ef4444' : '#7f1d1d';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = ledBlink ? 12 : 2;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (this.type === 'caldera_lava_pillar') {
        // Volcanic Basalt Column
        ctx.fillStyle = '#261c14';
        ctx.beginPath();
        ctx.moveTo(-22, -36);
        ctx.lineTo(22, -36);
        ctx.lineTo(26, 36);
        ctx.lineTo(-26, 36);
        ctx.closePath();
        ctx.fill();

        // Magma fissures
        ctx.strokeStyle = '#ff5722';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ff5722';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(-10, -28);
        ctx.lineTo(4, -8);
        ctx.lineTo(-8, 14);
        ctx.lineTo(12, 30);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (this.type === 'eldritch_monolith') {
        // Abyssal Chrono Monolith
        ctx.fillStyle = '#1e1135';
        ctx.beginPath();
        ctx.moveTo(0, -42);
        ctx.lineTo(20, -18);
        ctx.lineTo(16, 38);
        ctx.lineTo(-16, 38);
        ctx.lineTo(-20, -18);
        ctx.closePath();
        ctx.fill();

        // Cosmic runes
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 2, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Driftwood Log
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(-20, -7);
        ctx.lineTo(20, -7);
        ctx.quadraticCurveTo(24, 0, 20, 7);
        ctx.lineTo(-20, 7);
        ctx.quadraticCurveTo(-24, 0, -20, -7);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    } catch (e) {
      // Safe fallback rendering so hazard never crashes canvas
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  renderAttacks(ctx, cameraY = 0, height = 2000) { drawAttack(ctx, this, cameraY, height); }
}

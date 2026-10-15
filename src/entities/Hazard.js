import { drawNaturalHazard } from './NaturalHazardArt.js';
import { updateAttack, drawAttack } from './EnemyAttacks.js';
import { drawMarineThreat } from './MarineThreatArt.js';

function obstacleScaleAt(x, y) {
  const value = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
  return .78 + (value - Math.floor(value)) * .48;
}

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
    const isVoidConfig = typeConfig.realmStyle === 'void' || typeConfig.zone === 7 || (typeConfig.id && String(typeConfig.id).includes('_7_'));
    this.glow = isVoidConfig ? '#ef4444' : (typeConfig.glow || '#ef4444');
    this.isColossal = !!typeConfig.isColossal;
    this.isBlackHole = !!typeConfig.isBlackHole || (typeConfig.realmStyle === 'void' && (typeConfig.variant % 4 === 1)) || typeConfig.id === 'abyssal_black_hole';
    const isCaldera = this.realmStyle === 'caldera' || this.zone === 6 || typeConfig.zone === 6 || typeConfig.realmId === 6 || (this.type && String(this.type).includes('caldera')) || (this.name && /caldera|magma|volcan|obsidian|pyroclast/i.test(this.name));
    const isVolcanoObstacle = isCaldera && (this.type === 'caldera_lava_pillar' || (this.name && /volcan|chimney|sulfur vent|lava pillar/i.test(this.name)));
    const calderaScale = isVolcanoObstacle ? 2.85 : (isCaldera ? 1.65 : 1.0);
    // Choose a permanent size per giant so its artwork and collision bounds agree.
    this.sizeScale = (typeConfig.sizeScale || (this.isColossal ? [1.4, 1.85, 2.4][Math.floor(Math.random() * 3)] : obstacleScaleAt(x, y))) * calderaScale;
    this.shieldCost = typeConfig.shieldCost || (this.isColossal ? (this.sizeScale >= 2.0 || (this.zone && this.zone >= 5) ? 3 : 2) : (isCaldera && this.sizeScale > 1.8 ? 2 : 1));
    this.radius = (typeConfig.radius || (this.isColossal ? 35 : 20)) * this.sizeScale;

    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.swimAngle = 0;
    this.timer = Math.random() * Math.PI * 2;
    this.pulseSpeed = 1.8 + Math.random() * 1.2;
    this.driftX = (Math.random() * 2 - 1) * (this.isColossal ? 0.25 : 0.45);
  }

  update(dt, worldWidth, hook = null) {
    const deltaSec = dt / 1000;
    this.timer += this.pulseSpeed * deltaSec;

    // Gravitational accretion pull from black hole obstacles on the fishing line/hook
    if (this.isBlackHole && hook && ['DESCENDING', 'REELING'].includes(hook.state)) {
      const gDx = this.x - hook.x;
      const gDy = this.y - hook.y;
      const gDist = Math.hypot(gDx, gDy);
      const pullRange = this.radius * 3.6;
      if (gDist > 10 && gDist < pullRange) {
        const pullFactor = (1 - gDist / pullRange);
        const pullSpeed = pullFactor * (this.isColossal ? 180 : 130) * deltaSec;
        hook.x += (gDx / gDist) * pullSpeed;
        hook.y += (gDy / gDist) * pullSpeed * 0.45;
      }
    }
    if (this.marineKind && hook && ['DESCENDING', 'REELING'].includes(hook.state) && Math.abs(hook.x - this.x) > 1) {
      this.facing = Math.sign(hook.x - this.x);
    }
    if (this.smoothFacing === undefined) {
      this.smoothFacing = this.facing || 1;
    }
    const turnRate = this.isColossal ? 2.4 : 7.5;
    this.smoothFacing += (this.facing - this.smoothFacing) * Math.min(1, turnRate * deltaSec);
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
      const isCaldera = this.zone === 6 || this.behavior?.zone === 6;
      const isShark = this.marineKind === 'shark' || this.type?.includes('shark');
      const isCalderaShark = (isCaldera && isShark) || (isCaldera && this.isColossal);

      // Sharks have slightly less tracking range per user feedback
      const trackMultiplier = isShark ? 0.95 : (isCaldera ? 1.4 : 1.3);
      const leashBonus = isShark ? 1.08 : (this.chaseTime > 0 ? 1.5 : 1.2);
      const chasing = active && this.restTime === 0 && distance < (config.detectionRadius * trackMultiplier)
        && Math.abs(hook.y - this.homeY) < (config.leash * leashBonus);
      this.chaseTime = chasing ? this.chaseTime + deltaSec : 0;
      if (this.chaseTime > (config.chaseDuration || 3)) { this.restTime = config.restDuration || 3; this.chaseTime = 0; }
      const pursuing = chasing && this.restTime === 0;

      // Natural undulating wander vs targeted pursuit
      const undulate = Math.sin(this.timer * (this.isColossal ? 1.4 : 2.2));
      const undulate2 = Math.cos(this.timer * (this.isColossal ? 0.7 : 1.1));
      const waveX = pursuing ? 0 : Math.cos(this.timer * (this.isColossal ? 0.9 : 1.4)) * (this.isColossal ? 45 : 30);
      const waveY = pursuing ? 0 : (undulate * 0.7 + undulate2 * 0.3) * (this.isColossal ? 26 : 18);

      // Predictive tracking: intercept moving hook trajectory with fluid hydrodynamic lead
      const leadScale = isCalderaShark ? 0.12 : (pursuing ? 0.22 : 0);
      const leadX = pursuing ? (hook.vx || 0) * leadScale : 0;
      const leadY = pursuing ? (hook.vy || 0) * leadScale : 0;

      const targetX = pursuing ? hook.x + leadX : this.homeX + Math.sin(this.timer * 0.35) * 65;
      const targetY = pursuing ? hook.y + leadY : this.homeY + waveY;
      const dx = targetX - this.x, dy = targetY - this.y;
      const length = Math.hypot(dx, dy) || 1;

      // Realistic hydrodynamic acceleration and fluid drag - balanced tracking speed
      const maxSpd = config.speed * (pursuing ? (isCalderaShark ? 1.05 : 1.12) : 0.28);
      const desiredVx = (dx / length) * maxSpd;
      const desiredVy = (dy / length) * maxSpd;

      // Smooth turning response when pursuing hook (smooth hydrodynamic glide)
      const accelFactor = isCalderaShark
        ? (pursuing ? 6.5 : 2.2)
        : (this.isColossal ? (pursuing ? 3.6 : 1.4) : (pursuing ? 12.0 : 3.8));
      this.vx += (desiredVx - this.vx) * Math.min(1, accelFactor * deltaSec);
      this.vy += (desiredVy - this.vy) * Math.min(1, accelFactor * deltaSec);

      // Add gentle aquatic drift with inertia for colossal scale
      const sway = Math.cos(this.timer * (this.isColossal ? 1.2 : 3.0)) * (this.isColossal ? 6 : 12);
      this.x += (this.vx + (pursuing ? 0 : sway * 0.5)) * deltaSec;
      this.y += (this.vy + (pursuing ? 0 : Math.sin(this.timer * (this.isColossal ? 1.6 : 2.4)) * (this.isColossal ? 7 : 4))) * deltaSec;

      this.x = Math.max(this.radius, Math.min(worldWidth - this.radius, this.x));
      this.y = Math.max(this.minY ?? 0, Math.min(this.maxY ?? Infinity, this.y));

      // Facing direction: smooth transition following swim velocity or active hook
      if (Math.abs(this.vx) > 15) {
        this.facing = Math.sign(this.vx);
      } else if (active && Math.abs(hook.x - this.x) > 20) {
        this.facing = Math.sign(hook.x - this.x);
      }

      // Smooth banking angle according to vertical flow
      const targetPitch = Math.atan2(this.vy, Math.abs(this.vx) || 1) * 0.65;
      const pitchSpeed = isCalderaShark ? 3.2 : (this.isColossal ? 2.5 : 4.0);
      this.swimAngle += (targetPitch - this.swimAngle) * Math.min(1, pitchSpeed * deltaSec);
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

  renderUnderwaterBlackHole(ctx, r) {
    ctx.save();
    const t = this.timer || 0;
    const spin = t * 1.6;
    const rs = r * 0.44; // Event horizon radius
    const rPhoton = rs * 1.5; // Photon ring radius
    const rDisk = r * 1.1; // Outer accretion disk radius

    // 1. Outer Gravitational Lensing Halo (Einstein Ring)
    ctx.save();
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Secondary warped lensing arcs
    for (let l = 0; l < 4; l++) {
      const lAngle = spin * 0.6 + l * (Math.PI / 2);
      ctx.strokeStyle = l % 2 === 0 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(244, 63, 94, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.85 + (l % 2) * 0.15), lAngle, lAngle + 0.9);
      ctx.stroke();
    }

    // 2. Relativistic Plasma Jets along rotation axis
    ctx.save();
    for (const jetDir of [-1, 1]) {
      const jetLen = r * 1.25;
      const jetGrad = ctx.createLinearGradient(0, 0, 0, jetDir * jetLen);
      jetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      jetGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.85)');
      jetGrad.addColorStop(0.65, 'rgba(168, 85, 247, 0.6)');
      jetGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.strokeStyle = jetGrad;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, jetDir * rs * 0.5);
      ctx.lineTo(0, jetDir * jetLen);
      ctx.stroke();

      // Synchrotron shock diamonds
      for (let s = 1; s <= 3; s++) {
        const sy = jetDir * (rs * 0.7 + s * (r * 0.28));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, sy, Math.max(1.2, 2.8 - s * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 3. Rear Gravitational Lensing of the Accretion Disk (Loops over top & bottom of Event Horizon)
    ctx.save();
    const topLensGrad = ctx.createLinearGradient(-rDisk, 0, rDisk, 0);
    topLensGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)'); // Approaching (Doppler blue-shifted)
    topLensGrad.addColorStop(0.45, 'rgba(254, 240, 138, 0.95)');
    topLensGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.85)');
    topLensGrad.addColorStop(1, 'rgba(220, 38, 38, 0.55)'); // Receding (Doppler red-shifted)
    ctx.strokeStyle = topLensGrad;
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.ellipse(0, -rs * 0.35, r * 0.82, rs * 1.15, 0, Math.PI, 0);
    ctx.stroke();

    // Bottom warped lensing arc
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.ellipse(0, rs * 0.35, r * 0.82, rs * 1.05, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    // 4. Front Tilted 3D Relativistic Accretion Disk
    ctx.save();
    const diskTilt = 0.28;
    ctx.rotate(diskTilt);
    const diskGrad = ctx.createLinearGradient(-rDisk, 0, rDisk, 0);
    diskGrad.addColorStop(0, '#38bdf8'); // Approaching: bright cyan/blue
    diskGrad.addColorStop(0.2, '#fef08a'); // Superheated inner edge
    diskGrad.addColorStop(0.5, '#f97316'); // Core orange
    diskGrad.addColorStop(0.85, '#ef4444'); // Receding crimson
    diskGrad.addColorStop(1, '#991b1b');
    ctx.strokeStyle = diskGrad;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 12;
    ctx.lineWidth = r * 0.28;
    ctx.beginPath();
    ctx.ellipse(0, 0, rDisk, rDisk * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Swirling matter filaments in accretion disk
    for (let f = 0; f < 6; f++) {
      const fAngle = spin * 1.4 + f * 1.05;
      const fRad = r * (0.6 + (f % 3) * 0.16);
      ctx.strokeStyle = f % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(254, 240, 138, 0.7)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, fRad, fRad * 0.36, fAngle, 0, 1.2);
      ctx.stroke();
    }
    ctx.restore();

    // 5. Photon Sphere Ring (1.5 Rs)
    ctx.save();
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, rPhoton, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, rPhoton + 1.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // 6. Event Horizon: Absolute pitch-black singularity core
    ctx.fillStyle = '#020108';
    ctx.beginPath();
    ctx.arc(0, 0, rs, 0, Math.PI * 2);
    ctx.fill();

    // Sharp silhouette border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // 7. Inward spiraling relativistic dust particles
    for (let p = 0; p < 7; p++) {
      const progress = ((t * 45 + p * 20) % 100) / 100;
      const pDist = rs + (1 - progress) * (r * 0.65);
      const pAngle = spin * 2.2 + p * 0.9 + progress * 3.0;
      ctx.fillStyle = p % 2 === 0 ? '#ffffff' : (p % 3 === 0 ? '#38bdf8' : '#ff2b55');
      ctx.beginPath();
      ctx.arc(Math.cos(pAngle) * pDist, Math.sin(pAngle) * pDist * 0.6, 2.0 * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  renderRealmHazard(ctx) {
    const isVoid = this.realmStyle === 'void' || this.zone === 7 || this.behavior?.zone === 7;
    const r = this.radius / this.sizeScale;
    ctx.save();
    const material = ctx.createLinearGradient(-r, -r, r, r);
    material.addColorStop(0, this.color); material.addColorStop(1, isVoid ? '#200b14' : '#172737');
    ctx.fillStyle = material;
    ctx.strokeStyle = isVoid ? '#ef4444' : this.glow;
    ctx.lineWidth = isVoid ? 2.5 : 2;
    ctx.shadowColor = isVoid ? '#ef4444' : this.glow;
    ctx.shadowBlur = isVoid ? 12 : 4;
    if (this.realmStyle === 'reef') {
      // Branching coral
      const branches = 7;
      for (let i = 0; i < branches; i++) {
        const x = (i / (branches - 1) - 0.5) * r * 1.5;
        const h = r * (0.55 + Math.abs(Math.sin(i * 8 + this.variant)) * 0.9);
        ctx.beginPath(); ctx.moveTo(x - 6, r * 0.55);
        ctx.lineTo(x - 4, -h * 0.65); ctx.lineTo(x + 5, -h);
        ctx.lineTo(x + 9, r * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    } else if (this.realmStyle === 'lava') {
      // Magma Caldera Trench: Distinct, recognizable volcanic obstacles
      const lavaVariant = (this.variant || 0) % 4;
      const t = this.timer || 0;
      const pulseLava = 0.5 + 0.5 * Math.sin(t * 3.5);

      if (lavaVariant === 0) {
        // 0. Submarine Volcano Caldera Cone: Distinct volcanic cone with caldera crater lake, magma cascades & billowing steam
        ctx.save();
        const coneBaseW = r * 0.95;
        const coneTopW = r * 0.44;

        // Basalt cone silhouette with stratified rock gradient
        const coneGrad = ctx.createLinearGradient(-coneBaseW, 0, coneBaseW, 0);
        coneGrad.addColorStop(0, '#09090b');
        coneGrad.addColorStop(0.2, '#1c1917');
        coneGrad.addColorStop(0.5, '#292524');
        coneGrad.addColorStop(0.8, '#1c1917');
        coneGrad.addColorStop(1, '#09090b');
        ctx.fillStyle = coneGrad;
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 2.4;

        ctx.beginPath();
        ctx.moveTo(-coneBaseW, r * 0.75);
        ctx.lineTo(-coneBaseW * 0.85, r * 0.2); // Jagged stepped terrace
        ctx.lineTo(-coneTopW, -r * 0.6);
        ctx.quadraticCurveTo(0, -r * 0.5, coneTopW, -r * 0.6);
        ctx.lineTo(coneBaseW * 0.85, r * 0.2);
        ctx.lineTo(coneBaseW, r * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Horizontal tephra/ash stratification lines
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 1.6;
        for (let s = -2; s <= 2; s++) {
          const sy = r * 0.15 + s * (r * 0.22);
          const sw = coneBaseW * (0.85 - s * 0.12);
          ctx.beginPath();
          ctx.moveTo(-sw, sy);
          ctx.lineTo(sw, sy + s * 2);
          ctx.stroke();
        }

        // Glowing magma fissures spilling down volcanic flanks
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-coneTopW * 0.6, -r * 0.55);
        ctx.lineTo(-r * 0.35, -r * 0.1);
        ctx.lineTo(-r * 0.55, r * 0.45);
        ctx.moveTo(coneTopW * 0.5, -r * 0.55);
        ctx.lineTo(r * 0.25, -r * 0.15);
        ctx.lineTo(r * 0.42, r * 0.5);
        ctx.stroke();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Boiling molten sulfur/magma caldera lake inside summit crater
        const craterGrad = ctx.createRadialGradient(0, -r * 0.6, 2, 0, -r * 0.6, coneTopW);
        craterGrad.addColorStop(0, '#ffffff');
        craterGrad.addColorStop(0.3, '#fef08a');
        craterGrad.addColorStop(0.65, '#ea580c');
        craterGrad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = craterGrad;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.6, coneTopW, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Billowing translucent sulfur steam plumes & volcanic cavitation gas bubbles
        for (let b = 0; b < 6; b++) {
          const by = -r * 0.7 - ((t * 48 + b * 26) % (r * 1.1));
          const bx = Math.sin(t * 3.5 + b * 1.6) * (r * 0.28);
          const bRad = Math.max(2.5, r * 0.08 - (by / (-r * 1.5)) * 2);
          ctx.fillStyle = b % 2 === 0 ? 'rgba(254, 240, 138, 0.75)' : 'rgba(251, 146, 60, 0.65)';
          ctx.beginPath();
          ctx.arc(bx, by, bRad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (lavaVariant === 1) {
        // 1. Columnar Basalt & Obsidian Needles: Prismatic hexagonal columns with glowing magma seams and razor obsidian tips
        ctx.save();
        const numCols = 5;
        const colWidth = r * 0.32;
        for (let c = 0; c < numCols; c++) {
          const cx = (c - (numCols - 1) / 2) * colWidth * 0.88;
          const colHeight = r * (0.8 + Math.sin(c * 2.8 + 0.8) * 0.35);
          const topY = -colHeight;
          const botY = r * 0.75;

          // 3D Hexagonal Columnar Basalt Body
          const bGrad = ctx.createLinearGradient(cx - colWidth * 0.5, 0, cx + colWidth * 0.5, 0);
          bGrad.addColorStop(0, '#0c0a09');
          bGrad.addColorStop(0.3, '#1c1917');
          bGrad.addColorStop(0.7, '#292524');
          bGrad.addColorStop(1, '#0c0a09');
          ctx.fillStyle = bGrad;
          ctx.strokeStyle = '#44403c';
          ctx.lineWidth = 1.8;

          ctx.beginPath();
          ctx.moveTo(cx - colWidth * 0.5, botY);
          ctx.lineTo(cx - colWidth * 0.5, topY);
          ctx.lineTo(cx, topY - colWidth * 0.35); // Sharp prismatic needle top
          ctx.lineTo(cx + colWidth * 0.5, topY);
          ctx.lineTo(cx + colWidth * 0.5, botY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Hexagonal facet ridge down column center
          ctx.strokeStyle = '#1c1917';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(cx, topY - colWidth * 0.35);
          ctx.lineTo(cx, botY);
          ctx.stroke();

          // Glossy glassy obsidian facet reflection
          ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
          ctx.beginPath();
          ctx.moveTo(cx, topY - colWidth * 0.35);
          ctx.lineTo(cx + colWidth * 0.45, topY + colWidth * 0.2);
          ctx.lineTo(cx, botY);
          ctx.closePath();
          ctx.fill();

          // Molten magma artery in column crevice
          ctx.strokeStyle = '#ef4444';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(cx - colWidth * 0.1, topY + colWidth * 0.1);
          ctx.lineTo(cx, topY + colHeight * 0.5);
          ctx.lineTo(cx - colWidth * 0.15, botY);
          ctx.stroke();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 0.9;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Searing needle apex spark
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(cx, topY - colWidth * 0.35, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (lavaVariant === 2) {
        // 2. Chained Molten Planetary Core: Fractured incandescent magma sphere tightly bound by heavy titan forged iron chains
        ctx.save();
        const coreR = r * 0.72;

        // Searing liquid magma core with intense thermal glow
        const coreGrad = ctx.createRadialGradient(0, 0, coreR * 0.1, 0, 0, coreR);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.25, '#fef08a');
        coreGrad.addColorStop(0.55, '#f97316');
        coreGrad.addColorStop(0.85, '#dc2626');
        coreGrad.addColorStop(1, '#450a0a');
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(0, 0, coreR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hardened jagged basalt tectonic crust plates floating over magma
        const plates = [
          { x: -coreR * 0.45, y: -coreR * 0.35, r: coreR * 0.42 },
          { x: coreR * 0.42, y: -coreR * 0.28, r: coreR * 0.38 },
          { x: -coreR * 0.25, y: coreR * 0.42, r: coreR * 0.45 },
          { x: coreR * 0.38, y: coreR * 0.36, r: coreR * 0.40 },
          { x: 0, y: 0, r: coreR * 0.32 },
        ];
        ctx.fillStyle = '#1c1917';
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 1.8;
        for (const plate of plates) {
          ctx.beginPath();
          ctx.arc(plate.x, plate.y, plate.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Molten lava fissures glowing between the crust plates
        ctx.strokeStyle = '#fde047';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(-coreR * 0.6, 0); ctx.lineTo(-coreR * 0.15, -coreR * 0.1); ctx.lineTo(coreR * 0.2, coreR * 0.1); ctx.lineTo(coreR * 0.65, 0);
        ctx.moveTo(0, -coreR * 0.6); ctx.lineTo(-coreR * 0.08, 0); ctx.lineTo(0, coreR * 0.6);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Heavy titan forged iron chains binding the magma core
        const chainPaths = [
          [-coreR * 0.85, -coreR * 0.3, 0, -coreR * 0.55, coreR * 0.85, -coreR * 0.2],
          [-coreR * 0.8, coreR * 0.35, 0, coreR * 0.6, coreR * 0.8, coreR * 0.3],
          [-coreR * 0.3, -coreR * 0.85, 0, 0, coreR * 0.35, coreR * 0.85],
        ];

        for (const [x1, y1, cx, cy, x2, y2] of chainPaths) {
          // Glow beneath chain
          ctx.strokeStyle = 'rgba(234, 88, 12, 0.7)';
          ctx.lineWidth = 5.0;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cx, cy, x2, y2);
          ctx.stroke();

          // Dark iron chain body
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 3.6;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cx, cy, x2, y2);
          ctx.stroke();

          // Individual interlocking chain links and rivets
          const steps = 7;
          for (let st = 0; st <= steps; st++) {
            const ratio = st / steps;
            const lx = (1 - ratio) * (1 - ratio) * x1 + 2 * (1 - ratio) * ratio * cx + ratio * ratio * x2;
            const ly = (1 - ratio) * (1 - ratio) * y1 + 2 * (1 - ratio) * ratio * cy + ratio * ratio * y2;
            ctx.fillStyle = st % 2 === 0 ? '#ea580c' : '#71717a';
            ctx.beginPath();
            ctx.arc(lx, ly, 3.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#09090b';
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
        ctx.restore();
      } else {
        // 3. Colossal Hydrothermal Black Smoker Spire: Towering deepsea volcanic chimney with billowing black smoker plumes & lava flumes
        ctx.save();
        const spireBaseW = r * 0.88;
        const spireTopW = r * 0.48;

        // Mineral sulfide chimney silhouette with jagged terraces
        const spireGrad = ctx.createLinearGradient(-spireBaseW, 0, spireBaseW, 0);
        spireGrad.addColorStop(0, '#09090b');
        spireGrad.addColorStop(0.2, '#18181b');
        spireGrad.addColorStop(0.5, '#27272a');
        spireGrad.addColorStop(0.8, '#18181b');
        spireGrad.addColorStop(1, '#09090b');
        ctx.fillStyle = spireGrad;
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 2.4;

        ctx.beginPath();
        ctx.moveTo(-spireBaseW, r * 0.85);
        ctx.lineTo(-spireBaseW * 0.75, r * 0.35); // Lower terrace
        ctx.lineTo(-spireBaseW * 0.55, -r * 0.1); // Middle terrace
        ctx.lineTo(-spireTopW, -r * 0.75); // Summit chimney rim
        ctx.lineTo(spireTopW, -r * 0.75);
        ctx.lineTo(spireBaseW * 0.55, -r * 0.1);
        ctx.lineTo(spireBaseW * 0.75, r * 0.35);
        ctx.lineTo(spireBaseW, r * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Sulfide mineral crusting (pyrite and sulfur deposits) on chimney walls
        ctx.fillStyle = '#ca8a04';
        for (const pos of [-0.4, -0.15, 0.25, 0.5]) {
          ctx.beginPath();
          ctx.arc(pos * spireBaseW * 0.7, r * 0.2 + pos * 15, r * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }

        // Cascading incandescent liquid lava waterfall flutes
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 14;
        ctx.lineWidth = r * 0.14;
        ctx.beginPath();
        ctx.moveTo(-spireTopW * 0.5, -r * 0.7);
        ctx.lineTo(-r * 0.28, 0);
        ctx.lineTo(-r * 0.35, r * 0.8);
        ctx.moveTo(spireTopW * 0.4, -r * 0.7);
        ctx.lineTo(r * 0.22, 0.1);
        ctx.lineTo(r * 0.32, r * 0.8);
        ctx.stroke();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = r * 0.05;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Active hydrothermal vent orifices at summit
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.75, spireTopW, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Billowing superheated "Black Smoker" mineral particle clouds erupting into water
        for (let sm = 0; sm < 8; sm++) {
          const sy = -r * 0.82 - ((t * 52 + sm * 28) % (r * 1.2));
          const sx = Math.sin(t * 3.8 + sm * 1.5) * (r * 0.35);
          const sRad = Math.max(3.5, r * 0.12 + ((-sy - r * 0.82) / r) * 6);
          ctx.fillStyle = sm % 2 === 0 ? 'rgba(24, 24, 27, 0.85)' : 'rgba(39, 39, 42, 0.75)';
          ctx.beginPath();
          ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
          ctx.fill();

          // Incandescent thermal cinders embedded in the plume
          if (sm % 2 === 0) {
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(sx * 0.6, sy + 3, 2.0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }
    } else if (this.realmStyle === 'ruins') {
      // Sunken Atlantis: Fluted Marble Pillars, Poseidon's Trident Spires & Clockwork Astrolabes
      const ruinsVariant = (this.variant || 0) % 3;
      if (ruinsVariant === 0) {
        // Fluted Corinthian/Ionic Marble Column & Capital with verdigris moss and gold veins
        ctx.save();
        // Capital / Abacus
        ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4;
        ctx.fillRect(-r * 0.7, -r * 0.9, r * 1.4, r * 0.28);
        ctx.strokeRect(-r * 0.7, -r * 0.9, r * 1.4, r * 0.28);
        // Volute scrolls on capital
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.arc(-r * 0.55, -r * 0.76, r * 0.18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(r * 0.55, -r * 0.76, r * 0.18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Fluted Shaft
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(-r * 0.45, -r * 0.62, r * 0.9, r * 1.25);
        ctx.strokeRect(-r * 0.45, -r * 0.62, r * 0.9, r * 1.25);
        // Fluting lines
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.2;
        for (let fl = -2; fl <= 2; fl++) {
          ctx.beginPath();
          ctx.moveTo(fl * r * 0.16, -r * 0.6);
          ctx.lineTo(fl * r * 0.16, r * 0.6);
          ctx.stroke();
        }
        // Base plinth
        ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#64748b';
        ctx.fillRect(-r * 0.65, r * 0.63, r * 1.3, r * 0.28);
        ctx.strokeRect(-r * 0.65, r * 0.63, r * 1.3, r * 0.28);
        // Verdigris sea moss overlay & gold crack
        ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.2, r * 0.15, r * 0.22, r * 0.35, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-r * 0.1, -r * 0.4); ctx.lineTo(r * 0.15, -r * 0.1); ctx.lineTo(-r * 0.05, r * 0.3); ctx.stroke();
        ctx.restore();
      } else if (ruinsVariant === 1) {
        // Sunken Poseidon Imperial Trident Spire
        ctx.save();

        // 1. Ancient Atlantean Pedestal Base / Submerged Stone Plinth
        const baseGrad = ctx.createLinearGradient(-r * 0.5, 0, r * 0.5, 0);
        baseGrad.addColorStop(0, '#1e293b');
        baseGrad.addColorStop(0.5, '#334155');
        baseGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = baseGrad;
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.45, r * 0.88);
        ctx.lineTo(r * 0.45, r * 0.88);
        ctx.lineTo(r * 0.35, r * 0.72);
        ctx.lineTo(-r * 0.35, r * 0.72);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Shaft (Forged Orichalcum & Deepsea Bronze)
        const shaftGrad = ctx.createLinearGradient(-r * 0.08, 0, r * 0.08, 0);
        shaftGrad.addColorStop(0, '#78350f');
        shaftGrad.addColorStop(0.25, '#d97706');
        shaftGrad.addColorStop(0.55, '#fef08a');
        shaftGrad.addColorStop(0.8, '#b45309');
        shaftGrad.addColorStop(1, '#451a03');

        // Shaft main pillar
        ctx.fillStyle = shaftGrad;
        ctx.fillRect(-r * 0.07, -r * 0.32, r * 0.14, r * 1.05);

        // Shaft spiral grip / Atlantean wire wrapping
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.55)';
        ctx.lineWidth = 1.2;
        for (let sp = -r * 0.25; sp <= r * 0.65; sp += r * 0.12) {
          ctx.beginPath();
          ctx.moveTo(-r * 0.07, sp);
          ctx.lineTo(r * 0.07, sp + r * 0.05);
          ctx.stroke();
        }

        // Pommel / bottom counter-spike
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(-r * 0.09, r * 0.73);
        ctx.lineTo(0, r * 0.82);
        ctx.lineTo(r * 0.09, r * 0.73);
        ctx.closePath();
        ctx.fill();

        // Collar ring below trident head
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.3, r * 0.11, r * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3. Trident Head: Left and Right Swept Tines (Curved, Barbed & Beveled)
        const bronzeGrad = ctx.createLinearGradient(-r * 0.6, 0, r * 0.6, 0);
        bronzeGrad.addColorStop(0, '#b45309');
        bronzeGrad.addColorStop(0.2, '#facc15');
        bronzeGrad.addColorStop(0.5, '#fef08a');
        bronzeGrad.addColorStop(0.8, '#facc15');
        bronzeGrad.addColorStop(1, '#b45309');

        // Left Tine (Sculpted S-curve with barb)
        ctx.fillStyle = bronzeGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.3;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-r * 0.06, -r * 0.32);
        ctx.bezierCurveTo(-r * 0.35, -r * 0.34, -r * 0.58, -r * 0.45, -r * 0.54, -r * 0.72);
        ctx.lineTo(-r * 0.56, -r * 0.82);
        ctx.lineTo(-r * 0.51, -r * 0.84); // Barb hook
        ctx.lineTo(-r * 0.48, -r * 0.95); // Needle tip
        ctx.lineTo(-r * 0.44, -r * 0.82);
        ctx.bezierCurveTo(-r * 0.42, -r * 0.55, -r * 0.25, -r * 0.44, -r * 0.06, -r * 0.40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Left Tine Ridge highlight
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-r * 0.48, -r * 0.94);
        ctx.bezierCurveTo(-r * 0.50, -r * 0.75, -r * 0.44, -r * 0.50, -r * 0.15, -r * 0.37);
        ctx.stroke();

        // Right Tine (Symmetrical mirror)
        ctx.beginPath();
        ctx.moveTo(r * 0.06, -r * 0.32);
        ctx.bezierCurveTo(r * 0.35, -r * 0.34, r * 0.58, -r * 0.45, r * 0.54, -r * 0.72);
        ctx.lineTo(r * 0.56, -r * 0.82);
        ctx.lineTo(r * 0.51, -r * 0.84); // Barb hook
        ctx.lineTo(r * 0.48, -r * 0.95); // Needle tip
        ctx.lineTo(r * 0.44, -r * 0.82);
        ctx.bezierCurveTo(r * 0.42, -r * 0.55, r * 0.25, -r * 0.44, r * 0.06, -r * 0.40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right Tine Ridge highlight
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(r * 0.48, -r * 0.94);
        ctx.bezierCurveTo(r * 0.50, -r * 0.75, r * 0.44, -r * 0.50, r * 0.15, -r * 0.37);
        ctx.stroke();

        // 4. Center Primary Spearhead (Classic Atlantean Leaf Blade with Medial Spine)
        ctx.fillStyle = bronzeGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-r * 0.1, -r * 0.40);
        ctx.lineTo(-r * 0.14, -r * 0.52);
        ctx.lineTo(-r * 0.08, -r * 0.56); // Blade shoulder barb
        ctx.lineTo(-r * 0.12, -r * 0.76); // Leaf curve out
        ctx.lineTo(0, -r * 0.98); // Apex tip
        ctx.lineTo(r * 0.12, -r * 0.76);
        ctx.lineTo(r * 0.08, -r * 0.56);
        ctx.lineTo(r * 0.14, -r * 0.52);
        ctx.lineTo(r * 0.1, -r * 0.40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Center Blade Medial Ridge Spine
        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.97);
        ctx.lineTo(0, -r * 0.42);
        ctx.stroke();

        // 5. Verdigris Ancient Sea Patina Accents
        ctx.fillStyle = 'rgba(20, 184, 166, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.22, -r * 0.42, r * 0.07, r * 0.04, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(r * 0.25, -r * 0.46, r * 0.06, r * 0.04, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, r * 0.1, r * 0.04, r * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // 6. Glowing Heart Gem (Heart of the Ocean / Atlantean Prismatic Eye)
        const gemPulse = 0.85 + 0.15 * Math.sin(this.timer * 3.5);
        const gemGlow = ctx.createRadialGradient(0, -r * 0.38, 0, 0, -r * 0.38, r * 0.25);
        gemGlow.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
        gemGlow.addColorStop(0.4, 'rgba(45, 212, 191, 0.4)');
        gemGlow.addColorStop(1, 'rgba(45, 212, 191, 0)');
        ctx.fillStyle = gemGlow;
        ctx.beginPath();
        ctx.arc(0, -r * 0.38, r * 0.25 * gemPulse, 0, Math.PI * 2);
        ctx.fill();

        // Gold Gem Bezel
        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -r * 0.38, r * 0.11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Faceted Aquamarine Core
        const gemGrad = ctx.createRadialGradient(-r * 0.03, -r * 0.41, 0, 0, -r * 0.38, r * 0.1);
        gemGrad.addColorStop(0, '#ffffff');
        gemGrad.addColorStop(0.4, '#38bdf8');
        gemGrad.addColorStop(0.8, '#0891b2');
        gemGrad.addColorStop(1, '#0e7490');
        ctx.fillStyle = gemGrad;
        ctx.beginPath();
        ctx.arc(0, -r * 0.38, r * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Brilliant diamond sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-r * 0.025, -r * 0.405, r * 0.025, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else {
        // Sunken Clockwork Astrolabe & Gilded Gate
        ctx.save();
        ctx.rotate(this.timer * 0.25);
        // Outer astrolabe ring with ornate gear teeth
        ctx.strokeStyle = '#d97706'; ctx.fillStyle = '#0f172a'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < 24; i++) {
          const angle = i * Math.PI / 12;
          const rad = i % 2 ? r * 0.8 : r;
          ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Inner bronze ring
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.stroke();
        // 4 Atlantean cardinal spokes
        for (let sp = 0; sp < 4; sp++) {
          const spAngle = sp * Math.PI / 2;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(spAngle) * r * 0.78, Math.sin(spAngle) * r * 0.78); ctx.stroke();
        }
        // Glowing verdigris core
        ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    } else if (this.realmStyle === 'crystal') {
      // Astral Shimmersea cosmic crystalline hazard with glowing core, facets & starbursts
      const shards = 4 + (this.variant % 3);
      // Outer orbiting stardust particles
      for (let s = 0; s < 4; s++) {
        const starAngle = this.timer * 0.8 + s * (Math.PI / 2);
        const starDist = r * (0.8 + 0.15 * Math.sin(this.timer * 1.5 + s));
        const sx = Math.cos(starAngle) * starDist;
        const sy = Math.sin(starAngle) * starDist;
        ctx.fillStyle = '#c7d2fe';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Faceted prismatic crystal spires
      for (let i = 0; i < shards; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI * 2 / shards + this.timer * 0.09);
        // Base facet
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.26, -r * 0.2);
        ctx.lineTo(r * 0.12, r * 0.45);
        ctx.lineTo(-r * 0.12, r * 0.45);
        ctx.lineTo(-r * 0.26, -r * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner crystalline refraction facet
        ctx.fillStyle = i % 2 === 0 ? 'rgba(199, 210, 254, 0.65)' : 'rgba(165, 180, 252, 0.45)';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.85);
        ctx.lineTo(r * 0.14, -r * 0.2);
        ctx.lineTo(0, r * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Radiant glowing starlight core
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.45);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#a5b4fc');
      coreGrad.addColorStop(0.8, '#6366f1');
      coreGrad.addColorStop(1, 'rgba(79, 70, 229, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Sparkling 4-point star glint in center
      ctx.fillStyle = '#ffffff';
      const glintSize = r * (0.28 + 0.08 * Math.sin(this.timer * 3));
      ctx.beginPath();
      ctx.moveTo(0, -glintSize);
      ctx.quadraticCurveTo(0, 0, glintSize, 0);
      ctx.quadraticCurveTo(0, 0, 0, glintSize);
      ctx.quadraticCurveTo(0, 0, -glintSize, 0);
      ctx.quadraticCurveTo(0, 0, 0, -glintSize);
      ctx.fill();
    } else if (this.realmStyle === 'spore') {
      for (let i = 0; i < 6 + this.variant; i++) {
        const a = i * 2.4;
        const x = Math.cos(a) * r * 0.55, y = Math.sin(a) * r * 0.55;
        ctx.beginPath(); ctx.arc(x, y, r * (0.18 + 0.03 * Math.sin(this.timer + i)), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 8, y + r * 0.3, x - 4, y + r * 0.5); ctx.stroke();
      }
    } else if (this.realmStyle === 'cloud') {
      // Whispering Aether Sea: Floating Sky-Island, Wind Vortex & Celestial Obelisk
      const aetherVar = (this.variant || 0) % 3;
      if (aetherVar === 0) {
        // Floating Sky-Island with luminous cloudroot tendrils
        ctx.save();
        // Hanging root tendrils
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.65)'; ctx.lineWidth = 1.4;
        for (let t = -3; t <= 3; t++) {
          ctx.beginPath();
          ctx.moveTo(t * r * 0.2, r * 0.1);
          ctx.quadraticCurveTo(t * r * 0.25 + Math.sin(this.timer * 2 + t) * 6, r * 0.5, t * r * 0.15, r * 0.85);
          ctx.stroke();
        }
        // Floating island aerolith rock
        ctx.fillStyle = '#4c1d95'; ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, -r * 0.1);
        ctx.quadraticCurveTo(-r * 0.4, -r * 0.35, 0, -r * 0.3);
        ctx.quadraticCurveTo(r * 0.4, -r * 0.35, r * 0.8, -r * 0.1);
        ctx.lineTo(r * 0.5, r * 0.35);
        ctx.quadraticCurveTo(0, r * 0.7, -r * 0.5, r * 0.35);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Mossy cloudtop cap
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.15, r * 0.72, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        // Orbiting floating crystal pebble
        const orbX = Math.cos(this.timer * 1.4) * r * 0.95;
        const orbY = Math.sin(this.timer * 1.4) * r * 0.4 - r * 0.1;
        ctx.fillStyle = '#f0abfc';
        ctx.beginPath(); ctx.arc(orbX, orbY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (aetherVar === 1) {
        // Celestial Wind Vortex & Spiral Rift
        ctx.save();
        ctx.rotate(this.timer * 0.7);
        for (let arm = 0; arm < 3; arm++) {
          ctx.save();
          ctx.rotate(arm * (Math.PI * 2 / 3));
          const armGrad = ctx.createLinearGradient(0, 0, r, 0);
          armGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          armGrad.addColorStop(0.5, arm === 0 ? 'rgba(192, 132, 252, 0.7)' : arm === 1 ? 'rgba(125, 211, 252, 0.7)' : 'rgba(244, 114, 182, 0.7)');
          armGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.strokeStyle = armGrad; ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(r * 0.45, -r * 0.35, r * 0.85, 0);
          ctx.stroke();
          ctx.restore();
        }
        // Glowing core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else {
        // Sky Storm Obelisk wreathed in electric wisps
        ctx.save();
        ctx.fillStyle = '#312e81'; ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.95);
        ctx.lineTo(r * 0.32, -r * 0.2);
        ctx.lineTo(r * 0.22, r * 0.85);
        ctx.lineTo(-r * 0.22, r * 0.85);
        ctx.lineTo(-r * 0.32, -r * 0.2);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Gilded runic band
        ctx.fillStyle = '#facc15'; ctx.fillRect(-r * 0.26, -r * 0.05, r * 0.52, r * 0.12);
        // Floating cloud puffs
        ctx.fillStyle = 'rgba(240, 171, 252, 0.4)';
        ctx.beginPath();
        ctx.arc(-r * 0.35, r * 0.2 + Math.sin(this.timer * 2) * 3, r * 0.22, 0, Math.PI * 2);
        ctx.arc(r * 0.35, r * 0.15 + Math.cos(this.timer * 2) * 3, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      // Eldritch Chrono Void (Last Realm): Super mythical, unique, and very pretty cosmic obstacles with unmistakable red danger accents
      const voidVariant = (this.variant || 0) % 4;
      const t = this.timer || 0;

      if (voidVariant === 0) {
        // 0. Temporal Fracture: Space-time crystal rift with chromatic prismatic facets and intense crimson warning glow
        ctx.save();
        const rot = t * 0.45;
        ctx.rotate(rot);

        // Outer temporal distortion resonance rings with bright danger red warning pulse
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        for (let ring = 1; ring <= 3; ring++) {
          const rRadius = r * (0.65 + ring * 0.22) + Math.sin(t * 3 + ring) * 3;
          ctx.strokeStyle = ring === 1 ? 'rgba(255, 40, 70, 0.85)' : ring === 2 ? 'rgba(239, 68, 68, 0.60)' : 'rgba(220, 38, 38, 0.35)';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.ellipse(0, 0, rRadius, rRadius * 0.72, t * 0.5 + ring, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Crystalline geometric space-time rift body
        const points = 7;
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const rad = (i / (points * 2)) * Math.PI * 2;
          const dist = i % 2 === 0 ? r * 0.88 : r * 0.42;
          const px = Math.cos(rad) * dist;
          const py = Math.sin(rad) * dist;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        const crystalGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
        crystalGrad.addColorStop(0, '#ffffff');
        crystalGrad.addColorStop(0.25, '#c084fc');
        crystalGrad.addColorStop(0.55, '#ef4444');
        crystalGrad.addColorStop(0.85, '#991b1b');
        crystalGrad.addColorStop(1, '#1f030a');
        ctx.fillStyle = crystalGrad;
        ctx.fill();

        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Prismatic warning facets
        for (let i = 0; i < points; i++) {
          const rad = (i / points) * Math.PI * 2;
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 60, 90, 0.85)' : 'rgba(239, 68, 68, 0.75)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(rad) * r * 0.88, Math.sin(rad) * r * 0.88);
          ctx.stroke();
        }

        // Orbiting danger red stardust motes
        for (let m = 0; m < 5; m++) {
          const mAngle = -rot * 2 + (m / 5) * Math.PI * 2;
          const mx = Math.cos(mAngle) * (r * 1.05);
          const my = Math.sin(mAngle) * (r * 0.75);
          ctx.fillStyle = '#ff2b55';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      } else if (voidVariant === 1) {
        // 1. Abyssal Black Hole: Relativistic gravitational singularity with accretion disk & photon ring
        this.renderUnderwaterBlackHole(ctx, r);
      } else if (voidVariant === 2) {
        // 2. Entropy Tendrils: Undulating ethereal ribbons with prominent danger ruby-red tips & warning glow
        ctx.save();
        const tendrilCount = 6;
        for (let i = 0; i < tendrilCount; i++) {
          const baseAngle = (i / tendrilCount) * Math.PI * 2;
          const wave = Math.sin(t * 3 + i * 1.2) * (r * 0.32);
          const tGrad = ctx.createLinearGradient(0, 0, Math.cos(baseAngle) * r, Math.sin(baseAngle) * r);
          tGrad.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
          tGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.85)');
          tGrad.addColorStop(1, 'rgba(255, 30, 60, 0.95)');

          ctx.strokeStyle = tGrad;
          ctx.lineWidth = 3.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          const midX = Math.cos(baseAngle) * (r * 0.55) - Math.sin(baseAngle) * wave;
          const midY = Math.sin(baseAngle) * (r * 0.55) + Math.cos(baseAngle) * wave;
          const endX = Math.cos(baseAngle) * (r * 0.92) + Math.sin(baseAngle) * (wave * 0.6);
          const endY = Math.sin(baseAngle) * (r * 0.92) - Math.cos(baseAngle) * (wave * 0.6);
          ctx.quadraticCurveTo(midX, midY, endX, endY);
          ctx.stroke();

          // Radiant red warning starlight tip
          ctx.fillStyle = '#ff2555';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(endX, endY, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Central cosmic nexus core with red danger rim
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        // 3. Event Horizon Monolith: Majestic colossal floating cosmic obelisk with glowing red danger beacon and runes
        ctx.save();
        const sway = Math.sin(t * 1.8) * 3;
        ctx.translate(0, sway);

        // Outer rotating celestial danger halo ring
        ctx.save();
        ctx.rotate(t * 0.6);
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = 'rgba(255, 45, 75, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.95, r * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let h = 0; h < 4; h++) {
          const hAngle = (h / 4) * Math.PI * 2;
          ctx.fillStyle = '#ff2b55';
          ctx.beginPath();
          ctx.arc(Math.cos(hAngle) * r * 0.95, Math.sin(hAngle) * r * 0.38, 3.0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Faceted alien obelisk body with danger red rim
        const mGrad = ctx.createLinearGradient(-r * 0.45, -r, r * 0.45, r);
        mGrad.addColorStop(0, '#2e1065');
        mGrad.addColorStop(0.35, '#0f172a');
        mGrad.addColorStop(0.7, '#1e1b4b');
        mGrad.addColorStop(1, '#030712');
        ctx.fillStyle = mGrad;
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.4;

        ctx.beginPath();
        ctx.moveTo(0, -r * 0.98);
        ctx.lineTo(r * 0.38, -r * 0.45);
        ctx.lineTo(r * 0.32, r * 0.88);
        ctx.lineTo(-r * 0.32, r * 0.88);
        ctx.lineTo(-r * 0.38, -r * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Glowing red hazard warning glyphs
        const glyphCount = 4;
        for (let g = 0; g < glyphCount; g++) {
          const gy = -r * 0.4 + g * (r * 0.32);
          ctx.fillStyle = '#ff2b55';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, gy, 3.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 50, 80, 0.85)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-r * 0.16, gy);
          ctx.lineTo(r * 0.16, gy);
          ctx.stroke();
        }

        // Apex star crown danger beacon flare
        ctx.fillStyle = '#ff2555';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(0, -r * 0.98, 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }
    ctx.restore();
  }

  render(ctx, cameraY = 0) {
    const drawY = this.y - cameraY;
    ctx.save();
    ctx.translate(this.x, drawY);

    // Danger aura: prominent red danger aura for Realm 7 obstacles so players clearly know to avoid them
    const pulse = 0.5 + 0.5 * Math.sin(this.timer * 2.5);
    const isLava = this.realmStyle === 'lava' || this.zone === 6;
    const isVoid = this.realmStyle === 'void' || this.zone === 7 || this.behavior?.zone === 7 || (this.type && String(this.type).includes('_7_')) || (this.name && /void|chrono|singularity|entropy|temporal|world-eater|riftfang|event horizon/i.test(this.name));
    const auraRadius = isVoid
      ? (this.radius * (1.30 + pulse * 0.16) + 12)
      : (this.radius * (1.10 + pulse * 0.08) + 4);
    const auraStrength = isVoid
      ? ((this.isColossal ? 0.88 : this.marineKind ? 0.80 : 0.72) * (0.85 + pulse * 0.30))
      : (this.isColossal ? 0.48 : this.marineKind ? 0.40 : 0.35);

    const auraGrad = ctx.createRadialGradient(0, 0, this.radius * (isVoid ? 0.55 : 0.80), 0, 0, auraRadius);
    if (isLava) {
      auraGrad.addColorStop(0, `rgba(249, 115, 22, ${auraStrength * (0.85 + pulse * 0.15)})`);
      auraGrad.addColorStop(0.45, `rgba(239, 68, 68, ${auraStrength * 0.55})`);
      auraGrad.addColorStop(0.80, `rgba(185, 28, 28, ${auraStrength * 0.22})`);
      auraGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
    } else if (isVoid) {
      // Prominent radiant crimson danger aura so players clearly identify Realm 7 obstacles to avoid
      auraGrad.addColorStop(0, `rgba(255, 30, 60, ${auraStrength})`);
      auraGrad.addColorStop(0.35, `rgba(239, 68, 68, ${auraStrength * 0.80})`);
      auraGrad.addColorStop(0.70, `rgba(220, 38, 38, ${auraStrength * 0.45})`);
      auraGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
    } else {
      auraGrad.addColorStop(0, `rgba(244, 63, 94, ${auraStrength * (0.85 + pulse * 0.15)})`);
      auraGrad.addColorStop(0.45, `rgba(239, 68, 68, ${auraStrength * 0.55})`);
      auraGrad.addColorStop(0.80, `rgba(220, 38, 38, ${auraStrength * 0.22})`);
      auraGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
    }
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    if (isVoid) {
      // Pulsing concentric danger warning perimeter ring for Realm 7 obstacles
      ctx.save();
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12 + pulse * 8;
      ctx.strokeStyle = `rgba(255, 45, 75, ${0.55 + pulse * 0.40})`;
      ctx.lineWidth = 2.4;
      ctx.setLineDash([8, 5]);
      ctx.lineDashOffset = -this.timer * 8;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * (1.10 + pulse * 0.08), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Orbiting crimson hazard warning sparks
      ctx.fillStyle = '#ff2555';
      const sparkCount = this.isColossal ? 6 : 4;
      for (let s = 0; s < sparkCount; s++) {
        const sAngle = this.timer * 2.2 + (s / sparkCount) * Math.PI * 2;
        const sDist = this.radius * (1.18 + pulse * 0.05);
        ctx.beginPath();
        ctx.arc(Math.cos(sAngle) * sDist, Math.sin(sAngle) * sDist, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

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
        // Colossal Volcanic Basalt Column & Lava Chimney
        ctx.save();
        const t = this.timer || 0;
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.5);

        // Ambient incandescent heat glow
        ctx.save();
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 18;
        const heatGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 48);
        heatGrad.addColorStop(0, 'rgba(234, 88, 12, 0.45)');
        heatGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Hexagonal columnar basalt joints
        const colGrad = ctx.createLinearGradient(-26, 0, 26, 0);
        colGrad.addColorStop(0, '#0c0a09');
        colGrad.addColorStop(0.25, '#1c1917');
        colGrad.addColorStop(0.55, '#292524');
        colGrad.addColorStop(0.85, '#1c1917');
        colGrad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = colGrad;
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 2.0;

        ctx.beginPath();
        ctx.moveTo(-24, -38);
        ctx.lineTo(24, -38);
        ctx.lineTo(28, 38);
        ctx.lineTo(-28, 38);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Vertical columnar joint facets
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 1.6;
        for (const jx of [-12, 0, 12]) {
          ctx.beginPath();
          ctx.moveTo(jx, -38);
          ctx.lineTo(jx * 1.15, 38);
          ctx.stroke();
        }

        // Deep glowing incandescent magma flutes cutting down the stone
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-8, -36);
        ctx.lineTo(-14, -12);
        ctx.lineTo(-6, 8);
        ctx.lineTo(-12, 34);
        ctx.moveTo(8, -36);
        ctx.lineTo(14, -6);
        ctx.lineTo(6, 16);
        ctx.lineTo(14, 34);
        ctx.stroke();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Boiling sulfur/lava caldera pool at top
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(0, -38, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(0, -38, 16, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rising thermal ash motes & embers
        ctx.fillStyle = `rgba(251, 146, 60, ${0.7 + pulse * 0.3})`;
        for (let e = 0; e < 4; e++) {
          const ex = Math.sin(t * 3.5 + e * 1.8) * 18;
          const ey = -42 - ((t * 35 + e * 20) % 35);
          ctx.beginPath();
          ctx.arc(ex, ey, 2.0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (this.type === 'abyssal_black_hole' || (this.isBlackHole && !this.realmStyle)) {
        // Colossal Abyssal Black Hole Singularity Obstacle
        this.renderUnderwaterBlackHole(ctx, 44);
      } else if (this.type === 'eldritch_monolith') {
        // Colossal Abyssal Chrono Monolith & Space-Time Singularity Obelisk
        ctx.save();
        const t = this.timer || 0;
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.0);

        // Radiant danger crimson gravitational accretion perimeter
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = `rgba(255, 30, 60, ${0.75 + pulse * 0.25})`;
        ctx.lineWidth = 2.4;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -t * 12;
        ctx.beginPath();
        ctx.ellipse(0, 0, 42, 22, t * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Deep-void dark matter obelisk with beveled obsidian facets
        const monoGrad = ctx.createLinearGradient(-22, 0, 22, 0);
        monoGrad.addColorStop(0, '#090514');
        monoGrad.addColorStop(0.35, '#1e1135');
        monoGrad.addColorStop(0.65, '#2e1065');
        monoGrad.addColorStop(1, '#090514');
        ctx.fillStyle = monoGrad;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(0, -50); // Sharp pointed obelisk tip
        ctx.lineTo(22, -18);
        ctx.lineTo(18, 44);
        ctx.lineTo(-18, 44);
        ctx.lineTo(-22, -18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Medial facet spine line
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, -48);
        ctx.lineTo(0, 42);
        ctx.stroke();

        // Engraved temporal cosmic runes that glow with crimson starlight
        ctx.strokeStyle = '#ff3366';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, -2, 9, 0, Math.PI * 2);
        ctx.moveTo(-10, -2); ctx.lineTo(10, -2);
        ctx.moveTo(0, -12); ctx.lineTo(0, 8);
        ctx.stroke();

        // Floating fractured monolith fragments hovering in anti-gravity
        for (let f = 0; f < 3; f++) {
          const fAngle = t * 1.5 + f * (Math.PI * 2 / 3);
          const fx = Math.cos(fAngle) * 28;
          const fy = Math.sin(fAngle) * 16 + Math.sin(t * 2 + f) * 4;
          ctx.fillStyle = '#3b0764';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(fx, fy - 5);
          ctx.lineTo(fx + 4, fy);
          ctx.lineTo(fx, fy + 5);
          ctx.lineTo(fx - 4, fy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Radiant crimson danger beacon at obelisk apex
        ctx.fillStyle = '#ff2555';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, -50, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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

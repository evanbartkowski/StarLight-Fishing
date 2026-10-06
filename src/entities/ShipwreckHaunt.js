// ShipwreckHaunt.js — Sunken galleons & metal hulls haunting the ocean depths
// Spawns elusive phantom ghostfish or deep-sea moray eels that dart out to strike
// and quickly dart back into portholes or hull cracks if missed on the first strike.

export class ShipwreckHaunt {
  constructor(x, y, depthMeters, seaId = 4) {
    this.x = x;
    this.y = y;
    this.depthMeters = depthMeters;
    this.seaId = seaId;
    this.width = 240;
    this.height = 110;
    this.timer = Math.random() * Math.PI * 2;

    // Resident haunt creature
    this.creatureType = Math.random() < 0.5 ? 'phantom_ghostfish' : 'deep_sea_wreck_moray';
    this.creatureName = this.creatureType === 'phantom_ghostfish' ? 'Phantom Ghostfish' : 'Shipwreck Moray Eel';
    this.state = 'LURKING'; // 'LURKING' | 'STRIKING' | 'RETREATING' | 'CAUGHT'
    this.strikeProgress = 0; // 0 to 1
    this.retreatProgress = 0;
    this.strikeTimer = 0;
    this.strikeMaxDuration = 1.35;
    this.cooldown = 0;

    // 4 Portholes & hull crack coordinates relative to hull center
    this.portholes = [
      { x: -75, y: -8, r: 13, isCrack: false },
      { x: -25, y: 4, r: 15, isCrack: true },
      { x: 30, y: -6, r: 14, isCrack: false },
      { x: 80, y: 8, r: 13, isCrack: false },
    ];
    this.activePortholeIdx = Math.floor(Math.random() * this.portholes.length);
  }

  getActivePortholePos() {
    const p = this.portholes[this.activePortholeIdx] || this.portholes[0];
    return { x: this.x + p.x, y: this.y + p.y };
  }

  update(dt, hook = null, particles = null) {
    const deltaSec = dt / 1000;
    this.timer += deltaSec * 1.5;

    if (this.state === 'CAUGHT') return null;

    if (this.cooldown > 0) {
      this.cooldown -= deltaSec;
      return null;
    }

    const portPos = this.getActivePortholePos();
    const activeHook = hook && ['DESCENDING', 'REELING'].includes(hook.state);
    const distToHook = activeHook ? Math.hypot(hook.x - portPos.x, hook.y - portPos.y) : Infinity;

    if (this.state === 'LURKING') {
      this.strikeProgress = 0;
      // Strike trigger: hook drops near the occupied porthole or hull fissure
      if (activeHook && distToHook < 135) {
        this.state = 'STRIKING';
        this.strikeProgress = 0;
        this.strikeTimer = 0;
        if (particles) {
          particles.emitBubbles(portPos.x, portPos.y, 4, 3);
        }
      }
    } else if (this.state === 'STRIKING') {
      this.strikeTimer += deltaSec;
      // Fast forward strike toward hook
      this.strikeProgress = Math.min(1.0, this.strikeProgress + deltaSec * 3.6);

      const targetX = activeHook ? hook.x : portPos.x + 60;
      const targetY = activeHook ? hook.y : portPos.y - 20;
      const headX = portPos.x + (targetX - portPos.x) * this.strikeProgress;
      const headY = portPos.y + (targetY - portPos.y) * this.strikeProgress;

      // Check strike collision with hook (player catches the elusive haunt!)
      if (activeHook && Math.hypot(hook.x - headX, hook.y - headY) < (hook.radius || 15) + 16) {
        this.state = 'CAUGHT';
        return {
          type: 'SHIPWRECK_CATCH',
          speciesId: this.creatureType,
          speciesName: this.creatureName,
          x: headX,
          y: headY,
        };
      }

      // If missed on the first strike or hook retreats away, immediately dart back!
      if (!activeHook || distToHook > 155 || this.strikeTimer >= this.strikeMaxDuration) {
        this.state = 'RETREATING';
        this.retreatProgress = this.strikeProgress;
        if (particles) {
          particles.emitBubbles(headX, headY, 5, 4);
        }
      }
    } else if (this.state === 'RETREATING') {
      // Rapid dart backwards into porthole/hull crack
      this.retreatProgress -= deltaSec * 4.2;
      this.strikeProgress = Math.max(0, this.retreatProgress);
      if (this.retreatProgress <= 0) {
        this.state = 'LURKING';
        this.strikeProgress = 0;
        this.cooldown = 2.5; // Short cooldown before lurking in another porthole
        this.activePortholeIdx = (this.activePortholeIdx + 1) % this.portholes.length;
      }
    }

    return null;
  }

  render(ctx, cameraY = 0) {
    const drawY = this.y - cameraY;
    if (drawY < -150 || drawY > (ctx.canvas?.height || 900) + 150) return;

    ctx.save();
    ctx.translate(this.x, drawY);

    // 1. Sunken Galleon / Metal Hull Structure
    const hw = this.width * 0.5;
    const hh = this.height * 0.5;

    // Rusted iron/aged timber hull silhouette
    const hullGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
    hullGrad.addColorStop(0, '#1c1917');
    hullGrad.addColorStop(0.35, '#3b2014');
    hullGrad.addColorStop(0.7, '#29140a');
    hullGrad.addColorStop(1, '#0f0a07');
    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(-hw * 0.95, -hh * 0.4);
    ctx.lineTo(hw * 0.85, -hh * 0.6);
    ctx.quadraticCurveTo(hw * 1.05, 0, hw * 0.8, hh * 0.7);
    ctx.lineTo(-hw * 0.85, hh * 0.85);
    ctx.quadraticCurveTo(-hw * 1.05, hh * 0.2, -hw * 0.95, -hh * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rusted iron armor plates & vertical ribbing
    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 2.2;
    for (let r = -3; r <= 3; r++) {
      const rx = r * 30;
      ctx.beginPath();
      ctx.moveTo(rx, -hh * 0.45);
      ctx.lineTo(rx - 8, hh * 0.65);
      ctx.stroke();
    }

    // Corroded rivets & barnacles
    ctx.fillStyle = '#94a3b8';
    for (let b = 0; b < 12; b++) {
      const bx = -hw * 0.75 + b * 28;
      const by = Math.sin(b * 1.8) * 22;
      ctx.beginPath();
      ctx.arc(bx, by, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Portholes and Hull Fissures
    for (let i = 0; i < this.portholes.length; i++) {
      const port = this.portholes[i];
      if (port.isCrack) {
        // Jagged jagged hull fissure crack
        ctx.fillStyle = '#050302';
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(port.x - 12, port.y - 18);
        ctx.lineTo(port.x + 8, port.y - 6);
        ctx.lineTo(port.x - 4, port.y + 16);
        ctx.lineTo(port.x + 14, port.y + 26);
        ctx.lineTo(port.x - 10, port.y + 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Brass framed porthole
        ctx.fillStyle = '#050302';
        ctx.beginPath();
        ctx.arc(port.x, port.y, port.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(port.x, port.y, port.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(port.x - port.r + 2, port.y);
        ctx.lineTo(port.x + port.r - 2, port.y);
        ctx.moveTo(port.x, port.y - port.r + 2);
        ctx.lineTo(port.x, port.y + port.r - 2);
        ctx.stroke();
      }
    }

    // 3. Resident Haunt Creature (Phantom Ghostfish or Deep-Sea Moray)
    if (this.state !== 'CAUGHT') {
      const activePort = this.portholes[this.activePortholeIdx] || this.portholes[0];
      const isMoray = this.creatureType === 'deep_sea_wreck_moray';

      if (this.state === 'LURKING') {
        // Glowing eyes / snout peeking out through the porthole grating
        const eyePulse = 0.7 + 0.3 * Math.sin(this.timer * 3.5);
        ctx.save();
        if (isMoray) {
          // Yellow-amber menacing moray slit eyes & sharp fangs in shadows
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 6 * eyePulse;
          ctx.beginPath();
          ctx.arc(activePort.x - 4, activePort.y - 2, 2.5, 0, Math.PI * 2);
          ctx.arc(activePort.x + 4, activePort.y - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(activePort.x - 4.5, activePort.y - 4, 1.2, 4);
          ctx.fillRect(activePort.x + 3.5, activePort.y - 4, 1.2, 4);
          // Tiny needle tooth glint
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(activePort.x, activePort.y + 4);
          ctx.lineTo(activePort.x - 2, activePort.y + 8);
          ctx.lineTo(activePort.x + 2, activePort.y + 8);
          ctx.closePath();
          ctx.fill();
        } else {
          // Ghostly cyan ethereal luminescence & pale specter eyes
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 10 * eyePulse;
          ctx.beginPath();
          ctx.arc(activePort.x - 5, activePort.y - 1, 3.2, 0, Math.PI * 2);
          ctx.arc(activePort.x + 5, activePort.y - 1, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(activePort.x - 4.5, activePort.y - 1.5, 1.2, 0, Math.PI * 2);
          ctx.arc(activePort.x + 5.5, activePort.y - 1.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (this.state === 'STRIKING' || this.state === 'RETREATING') {
        // Creature lunging outward from the porthole
        const prog = this.strikeProgress;
        const reach = 85 * prog;
        const strikeAngle = -0.35 + Math.sin(this.timer * 4) * 0.15;

        ctx.save();
        ctx.translate(activePort.x, activePort.y);
        ctx.rotate(strikeAngle);

        if (isMoray) {
          // Massive serpentine moray body lunging out
          ctx.strokeStyle = '#1c1917';
          ctx.lineWidth = 16;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(reach * 0.4, Math.sin(this.timer * 5) * 12, reach, 0);
          ctx.stroke();

          // Mottled amber / gold pattern along moray spine
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(0, -3);
          ctx.quadraticCurveTo(reach * 0.4, Math.sin(this.timer * 5) * 12 - 3, reach - 6, -3);
          ctx.stroke();

          // Moray gaping predatory head & needle fangs
          ctx.fillStyle = '#292524';
          ctx.beginPath();
          ctx.moveTo(reach, -8);
          ctx.lineTo(reach + 22, -4);
          ctx.lineTo(reach + 24, 0);
          ctx.lineTo(reach + 18, 7);
          ctx.lineTo(reach, 7);
          ctx.closePath();
          ctx.fill();

          // Needle teeth
          ctx.fillStyle = '#ffffff';
          for (let tooth = 0; tooth < 4; tooth++) {
            ctx.beginPath();
            ctx.moveTo(reach + 6 + tooth * 4, -4);
            ctx.lineTo(reach + 8 + tooth * 4, 1);
            ctx.lineTo(reach + 10 + tooth * 4, -4);
            ctx.fill();
          }

          // Fiery eye
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(reach + 8, -6, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.fillRect(reach + 7.5, -8, 1, 4);
        } else {
          // Phantom Ghostfish ethereal cyan specter body lunging out
          ctx.save();
          ctx.globalAlpha = 0.82;
          ctx.fillStyle = '#0ea5e9';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(reach * 0.5, -14, reach, -10);
          ctx.lineTo(reach + 24, 0);
          ctx.lineTo(reach, 10);
          ctx.quadraticCurveTo(reach * 0.5, 14, 0, 0);
          ctx.closePath();
          ctx.fill();

          // Flowing spectral fins
          ctx.fillStyle = '#bae6fd';
          ctx.beginPath();
          ctx.moveTo(reach + 10, -10);
          ctx.lineTo(reach + 26, -22);
          ctx.lineTo(reach + 16, -6);
          ctx.closePath();
          ctx.fill();

          // Ghostly glowing eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(reach + 14, -3, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }
    }

    ctx.restore();
  }
}

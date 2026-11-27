import { drawMarinePet, drawPetNameplate } from '../rendering/MarinePetArt.js';
import { getVesselLayout } from '../rendering/VesselRenderer.js';
// BoatCompanions.js — Cozy low-maintenance crew aboard the vessel
// ShipsCat, PerchingPelican, and BackgroundDolphin

export class ShipsCat {
  constructor() {
    this.tailTimer = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.purrTimer = 0;
    this.isPurring = false;
    this.hasMorningGift = false;
    this.lastGiftDay = -1;
    this.pendingGift = null;
    this.petCount = 0;
    this.hasTinyRod = false;
    // Rare swim-and-catch-fish adventure
    this.swimAdventure = null;
    this.swimCooldown = 70 + Math.random() * 80;
  }

  triggerRareSwim() {
    this.swimAdventure = { timer: 0, duration: 7.5, fishCaught: false, xOffset: 0, yOffset: 0, facing: 1 };
    return this.swimAdventure;
  }

  update(dt) {
    const sec = dt / 1000;
    this.tailTimer += sec * 2.5;

    if (this.swimAdventure) {
      const adv = this.swimAdventure;
      adv.timer += sec;
      const p = adv.timer / adv.duration;
      if (p >= 1) {
        this.swimAdventure = null;
        this.swimCooldown = 95 + Math.random() * 90;
      } else {
        if (p >= .43) adv.fishCaught = true;
        const layout = getVesselLayout(this.lastVessel || 0, 140, 40, this.lastHullStyle || 'standard');
        const pose = this.getPose(this.lastVessel || 0, this.lastHullStyle || 'standard');
        adv.xOffset = pose.x - layout.catPos.x;
        adv.yOffset = pose.y - layout.catPos.y;
        adv.facing = pose.facing;
      }
    } else {
      this.swimCooldown -= sec;
      if (this.swimCooldown <= 0) {
        this.swimCooldown = 60 + Math.random() * 80;
        if (Math.random() < 0.32) {
          this.triggerRareSwim();
        }
      }
    }

    this.blinkTimer += sec;
    if (this.blinkTimer > 4.5) {
      this.isBlinking = true;
      if (this.blinkTimer > 4.7) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    if (this.isPurring) {
      this.purrTimer -= sec;
      if (this.purrTimer <= 0) {
        this.isPurring = false;
      }
    }
  }

  // Once every in-game morning (DAWN), paws up a gift
  checkMorningGift(timeOfDay, dayCount) {
    if (timeOfDay === 'DAWN' && dayCount !== this.lastGiftDay && !this.hasMorningGift) {
      this.lastGiftDay = dayCount;
      this.hasMorningGift = true;
      const gifts = [
        { name: 'Drift Shell', icon: '🐚', value: 25 },
        { name: 'Sea Glass', icon: '💎', value: 35 },
        { name: 'Lucky Pebble', icon: '🪨', value: 20 },
        { name: 'Silver Herring Bait', icon: '🐟', value: 40 },
        { name: 'Golden Scallop', icon: '🦪', value: 50 },
      ];
      this.pendingGift = gifts[Math.floor(Math.random() * gifts.length)];
    }
  }

  collectGift() {
    if (this.hasMorningGift && this.pendingGift) {
      const g = this.pendingGift;
      this.hasMorningGift = false;
      this.pendingGift = null;
      return g;
    }
    return null;
  }

  onClick(soundManager) {
    this.isPurring = true;
    this.purrTimer = 3.0;
    this.petCount += 1;
    let pulledTinyRod = false;
    if (this.petCount >= 7 && !this.hasTinyRod) {
      this.hasTinyRod = true;
      pulledTinyRod = true;
    }
    if (soundManager && typeof soundManager.playCatPurr === 'function') {
      soundManager.playCatPurr();
    }
    return { petCount: this.petCount, pulledTinyRod };
  }

  // Coords relative to boat center
  hitTest(localX, localY, vessel, hullStyle = 'standard') {
    const pos = this.getPose(vessel, hullStyle);
    const scale = pos.scale;
    const dx = localX - pos.x;
    const dy = localY - pos.y;
    return (dx / (22 * scale)) ** 2 + (dy / (18 * scale)) ** 2 < 1;
  }

  getDeckPosition(vessel, hullStyle = 'standard') {
    return getVesselLayout(vessel, 140, 40, hullStyle).catPos;
  }

  getPose(vessel, hullStyle = 'standard', frame = this.boatFrame) {
    const layout = getVesselLayout(vessel, 140, 40, hullStyle);
    const rest = { ...layout.catPos, scale: layout.catScale, facing: layout.catFacing, rotation: 0, swimming: false };
    const adv = this.swimAdventure;
    if (!adv) return rest;
    if (!Number.isFinite(adv.timer) || !adv.duration) {
      return { ...rest, x: rest.x + (adv.xOffset || 0), y: rest.y + (adv.yOffset || 0), facing: adv.facing || rest.facing };
    }
    const progress = Math.max(0, Math.min(1, adv.timer / adv.duration));
    const angle = Number.isFinite(frame?.angle) ? frame.angle : 0;
    const parentScale = Number.isFinite(frame?.scale) && frame.scale > 0 ? frame.scale : 1;
    const boatY = Number.isFinite(frame?.boatY) ? frame.boatY : 0;
    const surfaceY = Number.isFinite(frame?.surfaceY) ? frame.surfaceY : boatY + 14 * parentScale;
    const swimming = progress >= .25 && progress < .65;
    const swimProgress = swimming ? (progress - .25) / .4 : 0;
    const dx = (-layout.halfWidth - 30 + Math.sin(swimProgress * Math.PI * 2) * 10) * parentScale;
    const dy = surfaceY - boatY - 4 * rest.scale * parentScale + Math.sin(adv.timer * 7) * .5 * parentScale;
    // Convert the waterline into the rolling boat's local coordinates. Rendering
    // and pointer hit testing use this same pose.
    const waterX = (dx * Math.cos(angle) + dy * Math.sin(angle)) / parentScale;
    const waterY = (-dx * Math.sin(angle) + dy * Math.cos(angle)) / parentScale;
    if (swimming) return { ...rest, x: waterX, y: waterY, swimming: true,
      rotation: -angle, facing: Math.cos(swimProgress * Math.PI * 2) < 0 ? -1 : 1 };
    const leaving = progress < .25;
    const jump = leaving ? progress / .25 : (1 - progress) / .35;
    return { ...rest, x: rest.x + (waterX - rest.x) * jump,
      y: rest.y + (waterY - rest.y) * jump - Math.sin(jump * Math.PI) * 24,
      rotation: -angle * jump, facing: leaving ? -1 : 1 };
  }

  render(ctx, vessel, hullStyle = 'standard', frame) {
    this.lastVessel = vessel;
    this.lastHullStyle = hullStyle;
    if (frame) this.boatFrame = frame;
    const layout = getVesselLayout(vessel, 140, 40, hullStyle);
    const pos = layout.catPos;
    const adv = this.swimAdventure;
    const scale = layout.catScale;
    const pose = this.getPose(vessel, hullStyle);

    ctx.save();
    try {
      // Cushion stays on the vessel deck
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.ellipse(0, 6, 17, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      ctx.translate(pose.x, pose.y);
      ctx.rotate(pose.rotation);
      ctx.scale(scale * pose.facing, scale);
      if (pose.swimming) {
        // Swimming water ripple under Angela
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 5, 16 + Math.sin(this.tailTimer * 4) * 3, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

    // Warm cat body (calico ginger-orange curled ball)
    const purrScale = this.isPurring ? 1.0 + Math.sin(this.tailTimer * 6) * 0.05 : 1.0;
    ctx.scale(purrScale * 1.15, purrScale * 1.15);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body with warm gradient
    const catGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 11);
    catGrad.addColorStop(0, '#fb923c');
    catGrad.addColorStop(0.7, '#ea580c');
    catGrad.addColorStop(1, '#9a3412');
    ctx.fillStyle = catGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Calico spot
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(-4, -2, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // White belly patch
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(1, 2, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cat head
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(7, -3, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Ears with inner pink depth
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.moveTo(5, -7); ctx.lineTo(7, -11); ctx.lineTo(9, -6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.moveTo(5.8, -7); ctx.lineTo(7, -9.8); ctx.lineTo(8.2, -6.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.moveTo(8, -6); ctx.lineTo(11, -10); ctx.lineTo(12, -5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.moveTo(8.8, -6); ctx.lineTo(11, -8.8); ctx.lineTo(11.4, -5.5);
    ctx.closePath();
    ctx.fill();

    // Sleeping closed eyes (slits) or blink
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.3;
    if (this.isBlinking) {
      ctx.beginPath();
      ctx.arc(8, -3, 1.2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(8, -3, 2, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }

    // Little pink nose
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(10.5, -2, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Tiny white whiskers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(10, -1); ctx.lineTo(14, -2.5);
    ctx.moveTo(10, -0.5); ctx.lineTo(14, 0.5);
    ctx.stroke();

    // Tail (swishing gently)
    const tailWag = Math.sin(this.tailTimer) * 0.4;
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.quadraticCurveTo(-14, -2 + tailWag * 4, -13, -8 + tailWag * 6);
    ctx.stroke();

    // White tail tip
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-13, -7 + tailWag * 6);
    ctx.lineTo(-13, -9 + tailWag * 6);
    ctx.stroke();

    // Little silver fish caught in Angela's mouth during her rare swim adventure!
    if (adv?.fishCaught) {
      ctx.save();
      ctx.translate(12, -1);
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(2, 0, 4.5, 2.2, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, 0); ctx.lineTo(9, -2.5); ctx.lineTo(9, 2.5); ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Tiny miniature fishing rod when Angela reaches 7 pets!
    if (this.hasTinyRod) {
      ctx.save();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(6, -1);
      ctx.quadraticCurveTo(16, -14, 24, -15);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(24, -15);
      ctx.lineTo(24, 3 + Math.sin(this.tailTimer * 2.2) * 2.5);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(24, 3 + Math.sin(this.tailTimer * 2.2) * 2.5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Purring musical note or "z Z"
    if (this.isPurring) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '9px sans-serif';
      ctx.fillText('♪', 12, -10 + Math.sin(this.tailTimer * 4) * 2);
    } else if (this.hasMorningGift) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px sans-serif';
      ctx.fillText('🎁', -2, -12 + Math.sin(this.tailTimer * 3) * 2);
    }
    } catch (err) {
      console.warn('ShipsCat render error:', err);
    } finally {
      ctx.restore();
    }
  }
}

export class PerchingPelican {
  constructor() {
    this.trust = 15; // 0 to 100
    this.flapTimer = 0;
    this.isFlapping = false;
    this.diveTimer = 0;
    this.isDiving = false;
    // Rare sky-soaring laps above the vessel
    this.skyFlight = null;
    this.flightCooldown = 60 + Math.random() * 80;
  }

  triggerRareFlight() {
    this.skyFlight = { timer: 0, duration: 10.5, xOffset: 0, yOffset: 0, facing: 1 };
    return this.skyFlight;
  }

  update(dt) {
    const sec = dt / 1000;
    this.flapTimer += sec;
    if (this.skyFlight) {
      const fl = this.skyFlight;
      fl.timer += sec;
      const p = fl.timer / fl.duration;
      if (p < 1.0) {
        this.isFlapping = true;
        // 2 wide scenic figure-8 / oval laps high in the sky over the boat
        const angle = p * Math.PI * 4;
        const envelope = Math.sin(p * Math.PI);
        fl.xOffset = Math.sin(angle) * 145 * envelope;
        fl.yOffset = -(72 + Math.sin(angle * 0.5) * 28) * Math.min(1, envelope * 2.2);
        fl.facing = Math.cos(angle) >= 0 ? 1 : -1;
      } else {
        this.skyFlight = null;
        this.isFlapping = false;
        this.flightCooldown = 90 + Math.random() * 90;
      }
    } else {
      this.flightCooldown -= sec;
      if (this.flightCooldown <= 0) {
        this.flightCooldown = 55 + Math.random() * 80;
        if (Math.random() < 0.32) {
          this.triggerRareFlight();
        }
      }
      if (this.flapTimer > 5.5) {
        this.isFlapping = true;
        if (this.flapTimer > 6.2) {
          this.isFlapping = false;
          this.flapTimer = 0;
        }
      }
    }

    // At high trust (>= 70), pelican occasionally dives to retrieve a treasure
    if (this.trust >= 70 && !this.isDiving) {
      this.diveTimer += sec;
      if (this.diveTimer > 180) { // every ~3 minutes
        this.diveTimer = 0;
        if (Math.random() < 0.6) {
          return { type: 'retrieve', value: 80 + Math.floor(Math.random() * 60) };
        }
      }
    }
    return null;
  }

  feedFish() {
    this.trust = Math.min(100, this.trust + 12);
    this.isFlapping = true;
    this.flapTimer = 5.0;
  }

  hitTest(localX, localY, vessel, hullStyle = 'standard') {
    const layout = getVesselLayout(vessel, 140, 40, hullStyle);
    const pos = layout.pelicanPos;
    const scale = layout.pelicanScale;
    const dx = localX - pos.x - (this.skyFlight?.xOffset || 0);
    const dy = localY - pos.y - (this.skyFlight?.yOffset || 0);
    return (dx / (27 * scale)) ** 2 + (dy / (20 * scale)) ** 2 < 1;
  }

  getBowspritPosition(vessel, hullStyle = 'standard') {
    return getVesselLayout(vessel, 140, 40, hullStyle).pelicanPos;
  }

  render(ctx, vessel, hullStyle = 'standard') {
    const layout = getVesselLayout(vessel, 140, 40, hullStyle);
    const pos = layout.pelicanPos;
    const fl = this.skyFlight;
    const scale = layout.pelicanScale;

    ctx.save();
    try {
      ctx.translate(pos.x + (fl?.xOffset || 0), pos.y + (fl?.yOffset || 0));
      ctx.scale(scale * (fl?.facing === -1 ? -1 : 1), scale);

      // Body (white/grey pelican with subtle feather shading)
      const bodyGrad = ctx.createLinearGradient(-10, -5, 10, 8);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.7, '#f1f5f9');
      bodyGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 7.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Grey wing with detailed primary feather tips
      ctx.scale(1.2, 1.2);
      const wingFlap = this.isFlapping ? Math.sin(this.flapTimer * 15) * 8 : 0;
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(-2, -1 - wingFlap * 0.5, 7.5, 4.5 + Math.abs(wingFlap), -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Wing highlight
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(-2, -2 - wingFlap * 0.5, 5, 2.5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(8, -6, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Expressive eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(9, -7, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8.6, -7.4, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Large beak with realistic down-curved tip hook
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(11, -8);
      ctx.lineTo(23, -4);
      ctx.quadraticCurveTo(24, -2, 22, -1);
      ctx.quadraticCurveTo(16, 2, 10, -3);
      ctx.closePath();
      ctx.fill();

      // Yellow distensible pouch with shadow
      const pouchGrad = ctx.createLinearGradient(12, -2, 16, 3);
      pouchGrad.addColorStop(0, '#fbbf24');
      pouchGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = pouchGrad;
      ctx.beginPath();
      ctx.arc(15, -2, 4, 0, Math.PI);
      ctx.fill();

      // Bill ridge line
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(12, -6);
      ctx.lineTo(22, -3);
      ctx.stroke();

      // Strong webbed feet clutching wood
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-1, 5); ctx.lineTo(-1, 9);
      ctx.moveTo(3, 5); ctx.lineTo(3, 9);
      ctx.stroke();

      // Trust badge if hovered / high trust
      if (this.trust >= 70) {
        ctx.fillStyle = '#f43f5e';
        ctx.font = '8px sans-serif';
        ctx.fillText('♥', 0, -12);
      }
    } catch (err) {
      console.warn('Pelican render error:', err);
    } finally {
      ctx.restore();
    }
  }
}

export class BackgroundDolphin {
  constructor(worldWidth) {
    this.worldWidth = Number.isFinite(worldWidth) && worldWidth > 100 ? worldWidth : 800;
    this.active = true;
    this.x = this.worldWidth * .72;
    this.y = 0;
    this.arcY = 0;
    this.arcTimer = 0;
    this.arcDuration = 2.4;
    this.timer = 0;
    this.direction = 1;
    this.rotation = 0;
  }

  update(dt, surfaceY, weather, boatBounds = null) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    this.timer += dt / 1000;
    this.active = true;
    const surfY = Number.isFinite(surfaceY) ? surfaceY : 220;
    const width = Number.isFinite(this.worldWidth) && this.worldWidth > 100 ? this.worldWidth : 800;
    const phase = this.timer * .48;
    const radius = Math.min(100, Math.max(20, width * .15));
    this.x = Math.max(35, Math.min(width - 35, width * .65 + Math.sin(phase) * radius));
    const verticalPhase = phase * 1.4;
    const nearHull = boatBounds && Math.abs(this.x - boatBounds.x) < boatBounds.halfWidth + 90;
    const targetDepth = nearHull ? 80 : 56;
    this.cruiseDepth = (this.cruiseDepth ?? targetDepth) + (targetDepth - (this.cruiseDepth ?? targetDepth)) * Math.min(1, dt / 1000 * 3);
    this.y = surfY + this.cruiseDepth + Math.sin(verticalPhase) * 16;
    const horizontalVelocity = Math.cos(phase) * radius * .48;
    this.direction = horizontalVelocity >= 0 ? 1 : -1;
    const cycle = this.timer % 18;
    this.arcTimer = cycle;
    const jumpIndex = Math.floor(this.timer / 18);
    if (this._jumpIndex !== jumpIndex) {
      this._jumpIndex = jumpIndex;
      this._jumpAllowed = true;
      // Check the entire leap once to avoid starting it halfway over a hull.
      if (boatBounds) for (let step = 0; step <= 8; step++) {
        const futureX = width * .65 + Math.sin((jumpIndex * 18 + step * this.arcDuration / 8) * .48) * radius;
        if (Math.abs(futureX - boatBounds.x) < boatBounds.halfWidth + 55) this._jumpAllowed = false;
      }
    }
    const jumping = cycle < this.arcDuration && this._jumpAllowed;
    const jumpPhase = (cycle / this.arcDuration) * Math.PI;
    this.arcY = jumping ? -(Math.sin(jumpPhase) ** 2) * 78 : 0;
    const jumpVelocity = jumping ? (-78 * Math.PI / this.arcDuration) * Math.sin(jumpPhase * 2) : 0;
    const verticalVelocity = Math.cos(verticalPhase) * 16 * 1.4 + jumpVelocity;
    // Rare full 360-degree barrel flip on every 3rd leap cycle
    const spinOffset = (jumping && jumpIndex % 3 === 2) ? (cycle / this.arcDuration) * Math.PI * 2 : 0;
    this.rotation = Math.atan2(verticalVelocity, Math.max(0.001, Math.abs(horizontalVelocity))) * .7 + spinOffset;
  }

  render(ctx, cameraY = 0) {
    if (!this.active) return;

    const safeTimer = Number.isFinite(this.timer) ? this.timer : 0;
    const safeX = Number.isFinite(this.x) ? this.x : (this.worldWidth || 800) * 0.7;
    const safeY = Number.isFinite(this.y) ? this.y : 220;
    const safeArcY = Number.isFinite(this.arcY) ? this.arcY : 0;
    const drawY = (safeY + safeArcY) - (Number.isFinite(cameraY) ? cameraY : 0);
    if (drawY < -80 || drawY > 1200) return;

    const rot = Number.isFinite(this.rotation) ? this.rotation : 0;
    const dir = this.direction === -1 ? -1 : 1;

    ctx.save();
    try {
      ctx.translate(safeX, drawY);
      ctx.rotate(rot);
      ctx.scale(dir * 0.88, 0.88);

      drawMarinePet(ctx, 'dolphin', safeTimer);
    } catch (err) {
      console.warn('Dolphin render error:', err);
    } finally {
      ctx.restore();
    }

    if (this.isHovered) {
      try {
        drawPetNameplate(ctx, safeX, drawY - 32, 'Gracie the Dolphin');
      } catch (e) {}
    }
  }

  checkHover(mouseX, mouseY, cameraY = 0) {
    if (!this.active) {
      this.isHovered = false;
      return false;
    }
    const currentY = (this.y + this.arcY) - cameraY;
    const dx = mouseX - this.x;
    const dy = mouseY - currentY;
    // Test in sprite space so the snout, tail and fins remain targets during rotation.
    const rotation = this.rotation;
    const localX = dx * Math.cos(rotation) + dy * Math.sin(rotation);
    const localY = -dx * Math.sin(rotation) + dy * Math.cos(rotation);
    const inside = (localX / 42) ** 2 + (localY / 26) ** 2 <= 1;
    this.isHovered = inside;
    return inside;
  }
}

// Sylus cruises under the surface alongside the player's vessel.
export class BoatShark {
  constructor() { this.timer = 0; this.x = 0; this.y = 0; this.direction = 1; this.rotation = 0; this.isHovered = false; }
  update(dt, boat, surfaceY) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    this.timer += dt / 1000;
    const boatX = (boat && Number.isFinite(boat.x)) ? boat.x : 400;
    const surfY = Number.isFinite(surfaceY) ? surfaceY : 220;
    const phase = this.timer * .42;
    const horizontalVelocity = Math.cos(phase) * 125 * .42;
    const verticalVelocity = Math.cos(phase * 1.6) * 18 * .42 * 1.6;
    this.x = boatX + Math.sin(phase) * 125;
    this.y = surfY + 82 + Math.sin(phase * 1.6) * 18;
    this.direction = horizontalVelocity >= 0 ? 1 : -1;
    this.rotation = Math.atan2(verticalVelocity, Math.max(0.001, Math.abs(horizontalVelocity))) * .65;
  }
  checkHover(x, y, cameraY = 0) {
    const dx = x - this.x, dy = y - this.y + cameraY;
    const localX = dx * Math.cos(this.rotation) + dy * Math.sin(this.rotation);
    const localY = -dx * Math.sin(this.rotation) + dy * Math.cos(this.rotation);
    this.isHovered = (localX / 46) ** 2 + (localY / 26) ** 2 <= 1;
    return this.isHovered;
  }
  render(ctx, cameraY = 0) {
    const safeTimer = Number.isFinite(this.timer) ? this.timer : 0;
    const safeX = Number.isFinite(this.x) ? this.x : 0;
    const safeY = Number.isFinite(this.y) ? this.y : 300;
    const drawY = safeY - (Number.isFinite(cameraY) ? cameraY : 0);
    const rot = Number.isFinite(this.rotation) ? this.rotation : 0;
    const dir = this.direction === -1 ? -1 : 1;

    ctx.save();
    try {
      ctx.translate(safeX, drawY);
      ctx.rotate(rot);
      ctx.scale(dir * 0.96, 0.96);
      drawMarinePet(ctx, 'shark', safeTimer);
    } catch (err) {
      console.warn('Shark render error:', err);
    } finally {
      ctx.restore();
    }

    if (this.isHovered) {
      try {
        drawPetNameplate(ctx, safeX, drawY + 32, 'Sylus the Shark');
      } catch (e) {}
    }
  }
}

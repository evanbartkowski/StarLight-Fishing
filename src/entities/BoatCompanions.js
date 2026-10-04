import { drawMarinePet, drawPetNameplate } from '../rendering/MarinePetArt.js';
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
  }

  update(dt) {
    const sec = dt / 1000;
    this.tailTimer += sec * 2.5;

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
    if (soundManager && typeof soundManager.playCatPurr === 'function') {
      soundManager.playCatPurr();
    }
  }

  // Coords relative to boat center
  hitTest(localX, localY, vessel) {
    const pos = this.getDeckPosition(vessel);
    const dx = localX - pos.x;
    const dy = localY - pos.y;
    return (dx * dx + dy * dy) < 22 * 22;
  }

  getDeckPosition(vessel) {
    if (vessel >= 4) {
      return { x: -53, y: -28 }; // on rear observation deck of Mythic Celestial Ketch
    } else if (vessel === 3) {
      return { x: -49, y: -24 }; // on quarterdeck of Grand Schooner
    } else if (vessel === 2) {
      return { x: -44, y: -18 }; // on aft bench of Expedition Trawler
    } else if (vessel === 1) {
      return { x: -38, y: -14 }; // on seat cushion of Coastal Dory
    }
    return { x: -32, y: -12 }; // on pine bench of Weathered Dinghy
  }

  render(ctx, vessel) {
    const pos = this.getDeckPosition(vessel);

    ctx.save();
    ctx.translate(pos.x, pos.y);

    // Soft teal berth makes the crew readable against dark hulls.
    ctx.fillStyle = '#367f82'; ctx.beginPath(); ctx.ellipse(0, 6, 15, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Warm cat body (calico ginger-orange curled ball)
    const purrScale = this.isPurring ? 1.0 + Math.sin(this.tailTimer * 6) * 0.05 : 1.0;
    ctx.scale(purrScale * 1.15, purrScale * 1.15);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#ea580c'; // ginger orange
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2);
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

    // Ears
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.moveTo(5, -7); ctx.lineTo(7, -11); ctx.lineTo(9, -6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -6); ctx.lineTo(11, -10); ctx.lineTo(12, -5);
    ctx.closePath();
    ctx.fill();

    // Sleeping closed eyes (slits) or blink
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.2;
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
    ctx.arc(10.5, -2, 1, 0, Math.PI * 2);
    ctx.fill();

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

    ctx.restore();
  }
}

export class PerchingPelican {
  constructor() {
    this.trust = 15; // 0 to 100
    this.flapTimer = 0;
    this.isFlapping = false;
    this.diveTimer = 0;
    this.isDiving = false;
  }

  update(dt) {
    const sec = dt / 1000;
    this.flapTimer += sec;
    if (this.flapTimer > 5.5) {
      this.isFlapping = true;
      if (this.flapTimer > 6.2) {
        this.isFlapping = false;
        this.flapTimer = 0;
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

  hitTest(localX, localY, vessel) {
    const pos = this.getBowspritPosition(vessel);
    const dx = localX - pos.x;
    const dy = localY - pos.y;
    return (dx * dx + dy * dy) < 26 * 26;
  }

  getBowspritPosition(vessel) {
    if (vessel >= 4) {
      return { x: 92, y: -26 }; // gilded bowsprit spar on Celestial Ketch
    } else if (vessel === 3) {
      return { x: 78, y: -22 }; // bowsprit spar on Grand Schooner
    } else if (vessel === 2) {
      return { x: 64, y: -16 }; // bow railing on Expedition Trawler
    } else if (vessel === 1) {
      return { x: 54, y: -14 }; // bow post on Coastal Dory
    }
    return { x: 44, y: -12 }; // bow tip on Weathered Dinghy
  }

  render(ctx, vessel) {
    const pos = this.getBowspritPosition(vessel);

    ctx.save();
    ctx.translate(pos.x, pos.y);

    // Body (white/grey pelican)
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Grey wing
    ctx.scale(1.2, 1.2);
    const wingFlap = this.isFlapping ? Math.sin(this.flapTimer * 15) * 8 : 0;
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(-2, -1 - wingFlap * 0.5, 7, 4 + Math.abs(wingFlap), -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(8, -6, 5, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(9, -7, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Large yellow beak & pouch
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(11, -8);
    ctx.lineTo(22, -4);
    ctx.quadraticCurveTo(16, 2, 10, -3);
    ctx.closePath();
    ctx.fill();

    // Yellow pouch
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(14, -2, 3.5, 0, Math.PI);
    ctx.fill();

    // Legs clutching wood
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.8;
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

    ctx.restore();
  }
}

export class BackgroundDolphin {
  constructor(worldWidth) {
    this.worldWidth = worldWidth;
    this.active = true;
    this.x = worldWidth * .72;
    this.y = 0;
    this.arcY = 0;
    this.arcTimer = 0;
    this.arcDuration = 2.4;
    this.timer = 0;
    this.direction = 1;
    this.rotation = 0;
  }

  update(dt, surfaceY, weather) {
    this.timer += dt / 1000;
    this.active = true;
    const phase = this.timer * .42;
    const radius = Math.min(100, Math.max(20, this.worldWidth * .15));
    this.x = Math.max(35, Math.min(this.worldWidth - 35, this.worldWidth * .65 + Math.sin(phase) * radius));
    this.y = surfaceY + 56;
    this.direction = Math.cos(phase) >= 0 ? 1 : -1;
    const cycle = this.timer % 18;
    this.arcTimer = cycle;
    const jumping = cycle < this.arcDuration;
    this.arcY = jumping ? -Math.sin(cycle / this.arcDuration * Math.PI) * 90 : Math.sin(phase * 2) * 6;
    this.rotation = jumping ? -.5 + cycle / this.arcDuration : Math.cos(phase * 2) * .06;
  }

  render(ctx, cameraY = 0) {
    if (!this.active) return;

    const drawY = (this.y + this.arcY) - cameraY;
    if (drawY < -80 || drawY > 1200) return;

    const progress = this.arcTimer / this.arcDuration;
    const rot = this.rotation; // rotates from nose-up to nose-down

    ctx.save();
    ctx.translate(this.x, drawY);
    ctx.rotate(rot);
    ctx.scale(this.direction * 1.35, 1.35);

    drawMarinePet(ctx, 'dolphin', this.timer);

    ctx.restore();

    if (this.isHovered) drawPetNameplate(ctx, this.x, drawY - 40, 'Gracie the Dolphin');
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
    const inside = (localX / 49) ** 2 + (localY / 32) ** 2 <= 1;
    this.isHovered = inside;
    return inside;
  }
}

// Irene cruises under the surface alongside the player's vessel.
export class BoatShark {
  constructor() { this.timer = 0; this.x = 0; this.y = 0; this.direction = 1; this.isHovered = false; }
  update(dt, boat, surfaceY) {
    this.timer += dt / 1000;
    this.x = boat.x + Math.sin(this.timer * 0.35) * 125;
    this.y = surfaceY + 90 + Math.sin(this.timer * 0.7) * 6;
    this.direction = Math.cos(this.timer * 0.35) >= 0 ? 1 : -1;
  }
  checkHover(x, y, cameraY = 0) {
    this.isHovered = ((x - this.x) / 52) ** 2 + ((y - this.y + cameraY) / 30) ** 2 <= 1;
    return this.isHovered;
  }
  render(ctx, cameraY = 0) {
    ctx.save(); ctx.translate(this.x, this.y - cameraY); ctx.scale(this.direction, 1);
    drawMarinePet(ctx, 'shark', this.timer); ctx.restore();
    if (this.isHovered) drawPetNameplate(ctx, this.x, this.y - cameraY + 38, 'Irene the Shark');
  }
}

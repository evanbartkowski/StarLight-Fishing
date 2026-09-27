// DriftItems.js — Floating bottles with messages and craftable driftwood drifting across surface waves
import { DRIFT_MESSAGES, DRIFTWOOD_BOBBERS } from '../data/DriftMessages.js';

export class DriftBottle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.speed = (Math.random() < 0.5 ? 1 : -1) * (10 + Math.random() * 8);
    this.bobTimer = Math.random() * Math.PI * 2;
    this.radius = 16;
    this.type = 'bottle';

    // Pick a random message
    this.message = DRIFT_MESSAGES[Math.floor(Math.random() * DRIFT_MESSAGES.length)];

    // Color variant (sea green or clear aqua glass)
    this.tint = Math.random() < 0.5 ? '#059669' : '#0284c7';
  }

  update(dt, surfaceY) {
    const sec = dt / 1000;
    this.bobTimer += sec * 2.0;
    this.x += this.speed * sec;
    this.y = surfaceY + Math.sin(this.bobTimer) * 4 - 4;
  }

  render(ctx, cameraY = 0) {
    const drawY = this.y - cameraY;
    const angle = Math.sin(this.bobTimer) * 0.25;

    ctx.save();
    ctx.translate(this.x, drawY);
    ctx.rotate(angle);

    // Bottle glass body
    ctx.fillStyle = this.tint;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(0, 2, 7, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bottle neck
    ctx.fillRect(-3, -15, 6, 8);

    // Cork stopper
    ctx.fillStyle = '#b45309';
    ctx.globalAlpha = 1.0;
    ctx.fillRect(-3.5, -18, 7, 4);

    // Rolled parchment inside
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(0, 2, 3, 7, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Glass shine highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(2, 2, 8, -Math.PI * 0.4, 0);
    ctx.stroke();

    // Soft sparkle hint
    const sparkleAlpha = 0.4 + Math.sin(this.bobTimer * 2) * 0.4;
    ctx.fillStyle = `rgba(254, 240, 138, ${sparkleAlpha})`;
    ctx.font = '9px sans-serif';
    ctx.fillText('✦', 7, -10);

    ctx.restore();
  }

  hitTest(worldX, worldY) {
    const dx = worldX - this.x;
    const dy = worldY - this.y;
    return (dx * dx + dy * dy) < 24 * 24;
  }
}

export class DriftWood {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.speed = (Math.random() < 0.5 ? 1 : -1) * (8 + Math.random() * 6);
    this.bobTimer = Math.random() * Math.PI * 2;
    this.radius = 18;
    this.type = 'driftwood';

    // Random bobber that can be carved from this driftwood
    this.bobber = DRIFTWOOD_BOBBERS[Math.floor(Math.random() * DRIFTWOOD_BOBBERS.length)];
  }

  update(dt, surfaceY) {
    const sec = dt / 1000;
    this.bobTimer += sec * 1.8;
    this.x += this.speed * sec;
    this.y = surfaceY + Math.sin(this.bobTimer * 0.8) * 3 - 2;
  }

  render(ctx, cameraY = 0) {
    const drawY = this.y - cameraY;
    const angle = Math.sin(this.bobTimer * 0.7) * 0.18;

    ctx.save();
    ctx.translate(this.x, drawY);
    ctx.rotate(angle);

    // Weathered cedar log
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-16, -5, 32, 10, 4);
    ctx.fill();

    // Wood grain lines
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-12, -2); ctx.lineTo(12, -2);
    ctx.moveTo(-10, 2); ctx.lineTo(10, 2);
    ctx.stroke();

    // Green sea moss patch
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(-4, -4, 3, 0, Math.PI);
    ctx.fill();

    ctx.restore();
  }

  hitTest(worldX, worldY) {
    const dx = worldX - this.x;
    const dy = worldY - this.y;
    return (dx * dx + dy * dy) < 24 * 24;
  }
}

export class DriftItemManager {
  constructor(worldWidth, surfaceY) {
    this.worldWidth = worldWidth;
    this.surfaceY = surfaceY;
    this.items = [];
    this.spawnTimer = 90 + Math.random() * 60; // Initial drift item delay
  }

  resize(worldWidth) {
    this.worldWidth = worldWidth;
  }

  update(dt, surfaceY) {
    const sec = dt / 1000;
    this.surfaceY = surfaceY;
    this.spawnTimer -= sec;

    // Spawn a new drifting item rarely (every ~3-5 mins), max 1 active
    if (this.spawnTimer <= 0 && this.items.length < 1) {
      this.spawnTimer = 180 + Math.random() * 120;
      const x = Math.random() < 0.5 ? 40 : this.worldWidth - 40;
      if (Math.random() < 0.25) {
        this.items.push(new DriftBottle(x, surfaceY));
      } else {
        this.items.push(new DriftWood(x, surfaceY));
      }
    }

    // Update items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.update(dt, surfaceY);

      // Despawn if drifted completely off screen
      if (it.x < -80 || it.x > this.worldWidth + 80) {
        this.items.splice(i, 1);
      }
    }
  }

  render(ctx, cameraY = 0) {
    this.items.forEach((it) => it.render(ctx, cameraY));
  }

  checkPickup(worldX, worldY) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (it.hitTest(worldX, worldY)) {
        this.items.splice(i, 1);
        if (it.type === 'bottle') {
          return { type: 'bottle', message: it.message };
        } else if (it.type === 'driftwood') {
          return { type: 'driftwood', data: { bobber: it.bobber } };
        }
      }
    }
    return null;
  }
}

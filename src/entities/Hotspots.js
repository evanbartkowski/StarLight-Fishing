// Hotspots.js — Interactive Surface Water Hotspots & Ripple Pools
// Spawns 1-2 sparkling surface pools that grant instant bites and rare/treasure encounters

export class HotspotManager {
  constructor(surfaceY = 190, worldWidth = 1600) {
    this.surfaceY = surfaceY;
    this.worldWidth = worldWidth;
    this.hotspots = [];
    this.spawnTimer = 90 + Math.random() * 60; // First spawn in 1.5 to 2.5 minutes
    this.spawnInterval = 180; // Rare encounter
    this.sparkleTimer = 0;
  }

  update(dt, boatX = 800) {
    const deltaSec = dt / 1000;
    this.spawnTimer -= deltaSec;
    this.sparkleTimer += deltaSec;

    // Spawn new hotspot only if none are active (strictly 1 rare active max)
    if (this.spawnTimer <= 0 && this.hotspots.length < 1) {
      this.spawnHotspot(boatX);
      this.spawnTimer = 180 + Math.random() * 150; // Spawns once every 3 to 5.5 minutes
    }

    // Update active hotspots
    for (let i = this.hotspots.length - 1; i >= 0; i--) {
      const spot = this.hotspots[i];
      spot.timer -= deltaSec;
      spot.pulse += deltaSec * 2.8;

      // Update inner particles
      spot.particles.forEach((p) => {
        p.y -= p.speedY * deltaSec;
        p.alpha -= 0.6 * deltaSec;
        if (p.alpha <= 0) {
          p.x = spot.x + (Math.random() - 0.5) * spot.radius * 1.6;
          p.y = spot.y + Math.random() * 8;
          p.alpha = 0.8 + Math.random() * 0.2;
        }
      });

      if (spot.timer <= 0) {
        this.hotspots.splice(i, 1);
      }
    }
  }

  spawnHotspot(boatX) {
    // Spawn within castable distance from boat (-450 to +450 px)
    const offset = (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 320);
    let x = boatX + offset;
    x = Math.max(120, Math.min(this.worldWidth - 120, x));

    const hotspot = {
      id: 'hotspot_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      x: x,
      y: this.surfaceY,
      radius: 34 + Math.random() * 12, // 34 - 46 px radius
      maxTimer: 24 + Math.random() * 12, // Fleeting 24 - 36s duration
      timer: 24 + Math.random() * 12,
      pulse: Math.random() * Math.PI * 2,
      isSunkenSafe: Math.random() < 0.05,
      particles: [],
    };

    for (let p = 0; p < 8; p++) {
      hotspot.particles.push({
        x: hotspot.x + (Math.random() - 0.5) * hotspot.radius * 1.6,
        y: hotspot.y + Math.random() * 8,
        speedY: 12 + Math.random() * 18,
        size: 1.5 + Math.random() * 2.5,
        alpha: Math.random(),
        color: hotspot.isSunkenSafe ? '#fbbf24' : '#38bdf8',
      });
    }

    this.hotspots.push(hotspot);
  }

  /**
   * Check if hook or cast landed within a hotspot
   */
  checkHit(hookX, hookY) {
    for (let i = 0; i < this.hotspots.length; i++) {
      const spot = this.hotspots[i];
      const dist = Math.abs(hookX - spot.x);
      // Surface proximity check
      if (dist <= spot.radius && Math.abs(hookY - spot.y) < 55) {
        const hit = { ...spot };
        // Remove triggered hotspot
        this.hotspots.splice(i, 1);
        return hit;
      }
    }
    return null;
  }

  render(ctx, cameraY, screenWidth, screenHeight) {
    const yOnScreen = this.surfaceY - cameraY;
    if (yOnScreen < -60 || yOnScreen > screenHeight + 60) return;

    this.hotspots.forEach((spot) => {
      const alphaFactor = Math.min(1.0, spot.timer / 4.0); // Smooth fade out when expiring
      const wave = Math.sin(spot.pulse);
      const ringRadius = spot.radius + wave * 4;

      ctx.save();

      // Outer shimmering glow pool
      const grad = ctx.createRadialGradient(spot.x, yOnScreen, 4, spot.x, yOnScreen, spot.radius * 1.4);
      if (spot.isSunkenSafe) {
        grad.addColorStop(0, `rgba(251, 191, 36, ${0.45 * alphaFactor})`);
        grad.addColorStop(0.7, `rgba(245, 158, 11, ${0.25 * alphaFactor})`);
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else {
        grad.addColorStop(0, `rgba(56, 189, 248, ${0.45 * alphaFactor})`);
        grad.addColorStop(0.7, `rgba(99, 102, 241, ${0.25 * alphaFactor})`);
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(spot.x, yOnScreen, spot.radius * 1.3, spot.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing water rings
      ctx.strokeStyle = spot.isSunkenSafe
        ? `rgba(253, 224, 71, ${0.65 * alphaFactor})`
        : `rgba(186, 230, 253, ${0.65 * alphaFactor})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(spot.x, yOnScreen, ringRadius, ringRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary smaller ripple ring
      const innerRing = spot.radius * 0.55 + Math.cos(spot.pulse) * 3;
      ctx.strokeStyle = spot.isSunkenSafe
        ? `rgba(254, 240, 138, ${0.4 * alphaFactor})`
        : `rgba(224, 242, 254, ${0.4 * alphaFactor})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(spot.x, yOnScreen, innerRing, innerRing * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Floating sparkling bubbles
      spot.particles.forEach((p) => {
        const py = p.y - cameraY;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * alphaFactor;
        ctx.beginPath();
        ctx.arc(p.x, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Hotspot Icon Badge floating above
      ctx.globalAlpha = 0.9 * alphaFactor;
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      const label = spot.isSunkenSafe ? '🪙 SUNKEN SAFE' : '✨ HOTSPOT';
      const labelColor = spot.isSunkenSafe ? '#fde047' : '#7dd3fc';
      ctx.fillStyle = labelColor;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(label, spot.x, yOnScreen - 22);

      ctx.restore();
    });
  }
}

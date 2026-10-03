// InteractiveFlora.js — Realm-specific reactive plant life.
// 'slow' flora (kelp/vines/webs) cuts reel speed; 'slip' flora (spores/coral/vent weed) can shake a hooked fish loose.

export const FLORA_TYPES = {
  1: { id: 'tangled_kelp', name: 'Tangled Canopy Kelp', kind: 'kelp', color: '#15803d', stalkColor: '#166534', tipColor: '#86efac', effect: 'slow', slowFactor: 0.45, minDepth: 8, maxDepth: 3000, radius: 36 },
  2: { id: 'spore_flora', name: 'Bioluminescent Spore Coral', kind: 'spore', color: '#a855f7', stalkColor: '#6b21a8', tipColor: '#e879f9', effect: 'slip', slipChance: 0.35, minDepth: 25, maxDepth: 3000, radius: 32 },
  3: { id: 'astral_stardust_weed', name: 'Astral Crystal Bloom', kind: 'crystal', color: '#6366f1', stalkColor: '#3730a3', tipColor: '#c7d2fe', effect: 'slow', slowFactor: 0.4, minDepth: 40, maxDepth: 3000, radius: 38 },
  4: { id: 'grasping_coral', name: 'Atlantean Grasping Coral', kind: 'spore', color: '#10b981', stalkColor: '#065f46', tipColor: '#6ee7b7', effect: 'slip', slipChance: 0.4, minDepth: 60, maxDepth: 3000, radius: 35 },
  5: { id: 'siphonophore_web', name: 'Aetherial Siphonophore Web', kind: 'kelp', color: '#e879f9', stalkColor: '#a21caf', tipColor: '#fdf4ff', effect: 'slow', slowFactor: 0.35, minDepth: 100, maxDepth: 3000, radius: 42 },
  6: { id: 'magma_vent_weed', name: 'Smoldering Vent Weed', kind: 'spore', color: '#ea580c', stalkColor: '#9a3412', tipColor: '#fed7aa', effect: 'slip', slipChance: 0.45, minDepth: 150, maxDepth: 3000, radius: 36 },
  7: { id: 'chronal_tendril', name: 'Temporal Stasis Vines', kind: 'tendril', color: '#818cf8', stalkColor: '#4338ca', tipColor: '#e0e7ff', effect: 'slow', slowFactor: 0.3, minDepth: 200, maxDepth: 3000, radius: 44 },
};

export class InteractiveFlora {
  constructor(config, x, y) {
    Object.assign(this, {
      config, id: config.id, name: config.name, kind: config.kind, effect: config.effect,
      slowFactor: config.slowFactor || 0.45, slipChance: config.slipChance || 0.35,
      x, y, radius: config.radius || 35, color: config.color, stalkColor: config.stalkColor, tipColor: config.tipColor,
    });
    this.timer = Math.random() * Math.PI * 2;
    this.swaySpeed = 1.2 + Math.random() * 0.8;
    this.cooldown = 0;
  }

  update(dt) {
    const deltaSec = dt / 1000;
    this.timer += this.swaySpeed * deltaSec;
    this.cooldown = Math.max(0, this.cooldown - deltaSec);
  }

  /** Applies this plant's effect when the hook passes through it. Returns true if triggered. */
  checkHookInteraction(hook, particles, soundManager) {
    if (this.cooldown > 0 || Math.hypot(hook.x - this.x, hook.y - this.y) > this.radius + 15) return false;
    this.cooldown = 2.5;

    if (this.effect === 'slow') {
      hook.kelpSlowTimer = Math.max(hook.kelpSlowTimer || 0, 2.2);
      hook.kelpSlowMultiplier = this.slowFactor;
      particles?.addFloatingText(`🌿 TANGLED IN ${this.name.toUpperCase()}!`, hook.x, hook.y - 25, '#86efac', 15);
      particles?.emitBubbles(this.x, this.y, 10, 16);
      return true;
    }

    // Slip: only fish (not treasure/relics) can escape
    const fishIndexes = (hook.caughtItems || []).map((item, i) => (item.speciesId && !item.isTreasure && !item.isRelic ? i : -1)).filter(i => i >= 0);
    if (fishIndexes.length && Math.random() < this.slipChance) {
      const lost = hook.caughtItems.splice(fishIndexes[Math.floor(Math.random() * fishIndexes.length)], 1)[0];
      lost.state = 'SWIMMING';
      lost.hook = null;
      lost.y = Math.max(lost.minY ?? lost.y, Math.min(lost.maxY ?? lost.y, lost.y));
      soundManager?.playFishEscape?.();
      particles?.addFloatingText(`☣️ SPORE SLIP! ${lost.name} escaped!`, hook.x, hook.y - 30, '#f472b6', 16);
      particles?.emitSplash?.(hook.x, hook.y, 18, 1.0);
      particles?.addTrauma?.(0.25);
      hook.caughtItems.forEach((item, i) => item.hookTo?.(hook, i));
    } else {
      particles?.addFloatingText(`☣️ ${this.name.toUpperCase()} SPORES!`, hook.x, hook.y - 25, '#c084fc', 15);
      particles?.emitSparkles(this.x, this.y, 12, this.tipColor);
    }
    return true;
  }

  render(ctx, cameraY = 0) {
    ctx.save();
    ctx.translate(this.x, this.y - cameraY);
    const sway = Math.sin(this.timer) * 12;
    const r = this.radius;
    ctx.lineCap = 'round';
    ctx.strokeStyle = this.stalkColor;

    if (this.kind === 'crystal') {
      ctx.fillStyle = this.color; ctx.strokeStyle = this.tipColor; ctx.lineWidth = 1.5;
      for (let i = -1; i <= 1; i++) {
        const x = i * 15, h = r * (i === 0 ? 1.4 : .9);
        ctx.beginPath(); ctx.moveTo(x - 7, r * .6); ctx.lineTo(x - 9 + sway * .2, -h * .55);
        ctx.lineTo(x + sway * .2, -h); ctx.lineTo(x + 9 + sway * .2, -h * .55);
        ctx.lineTo(x + 7, r * .6); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    } else if (this.kind === 'tendril') {
      ctx.strokeStyle = this.color; ctx.lineWidth = 5;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(i * 12, r);
        ctx.bezierCurveTo(i * 32 + sway, r * .2, -i * 25 - sway, -r * .6, i * 18 + sway, -r); ctx.stroke();
        ctx.fillStyle = this.tipColor; ctx.beginPath(); ctx.arc(i * 18 + sway, -r, 4, 0, Math.PI * 2); ctx.fill();
      }
    } else if (this.kind === 'kelp') {
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, r); ctx.quadraticCurveTo(sway * 0.5, 0, sway, -r); ctx.stroke();
      ctx.fillStyle = this.color;
      for (let i = 0; i < 5; i++) {
        const t = i / 4, side = i % 2 ? -1 : 1;
        ctx.beginPath(); ctx.ellipse(sway * t + side * 14, r - t * r * 2, 14, 6, side * 0.4 + sway * 0.02, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = this.tipColor; ctx.shadowColor = this.tipColor; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(sway, -r, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (const [bx, tx, ty] of [[-15, -18, -0.7], [0, 0, -1], [15, 18, -0.7]]) {
        ctx.moveTo(bx, r * 0.8); ctx.quadraticCurveTo(bx * 0.66 + sway * 0.3, 0, tx + sway, ty * r);
      }
      ctx.stroke();
      ctx.fillStyle = this.color; ctx.shadowColor = this.tipColor; ctx.shadowBlur = 10;
      for (let j = 0; j < 6; j++) {
        const a = (j / 6) * Math.PI * 2 + this.timer * 0.5, d = 14 + Math.sin(this.timer + j) * 4;
        ctx.beginPath(); ctx.arc(sway * 0.5 + Math.cos(a) * d, -r * 0.3 + Math.sin(a) * d, 4.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }
}

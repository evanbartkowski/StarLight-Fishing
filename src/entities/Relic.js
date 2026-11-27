import { withCanvasState } from '../rendering/CanvasState.js';
import { drawRelicArtifact } from '../rendering/RelicArtwork.js';
import { drawAura } from '../rendering/AuraRenderer.js';
import { RELIC_TYPES } from '../data/RelicsData.js';

// Relic.js — Underwater archaeological relic entity
// Dredged from the deep ocean floor and restored at the Restoration Desk

export class Relic {
  constructor(relicType, x, y) {
    this.relicType = relicType;
    this.id = relicType.id;
    this.name = relicType.name;
    this.icon = relicType.icon;
    this.x = x;
    this.y = y;
    this.radius = 18;
    this.state = 'IDLE'; // 'IDLE' | 'HOOKED'
    this.hook = null;
    this.hookOffset = { x: 0, y: -20 };
    this.hookIndex = 0;
    this.bobTimer = Math.random() * Math.PI * 2;
    this.grimeLevel = relicType.grimeLevel || 3;
    this.restored = false;
    this.value = relicType.rawValue;
    this.rarity = relicType.rarity;
    this.isRelic = true;
  }

  update(dt, worldWidth, hook) {
    const sec = dt / 1000;
    this.bobTimer += sec * 0.9;

    if (this.state === 'HOOKED' && hook) {
      const dist = this.distanceAboveHook || (28 + this.hookIndex * 30);
      const rodTip = hook.rodTip || { x: hook.x, y: hook.y - 1000 };
      if (typeof hook.getLinePointAbove === 'function') {
        const pt = hook.getLinePointAbove(dist, rodTip.x, rodTip.y);
        this.x = pt.x;
        this.y = pt.y;
      } else {
        this.x = hook.x;
        this.y = hook.y - dist;
      }
    } else {
      this.x += Math.sin(this.bobTimer * 0.4) * 0.3;
      this.y += Math.cos(this.bobTimer * 0.35) * 0.2;
    }
  }

  hookTo(hook, slotIndex) {
    this.state = 'HOOKED';
    this.hook = hook;
    this.hookIndex = slotIndex;
    this.distanceAboveHook = 28 + slotIndex * 30;

    const rodTip = hook.rodTip || { x: hook.x, y: hook.y - 1000 };
    const pt = typeof hook.getLinePointAbove === 'function'
      ? hook.getLinePointAbove(this.distanceAboveHook, rodTip.x, rodTip.y)
      : { x: hook.x, y: hook.y - this.distanceAboveHook };

    this.x = pt.x;
    this.y = pt.y;
  }

  render(ctx, cameraY = 0) {
    const cam = Number.isFinite(cameraY) ? cameraY : 0;
    if (this.state === 'HOOKED' && this.hook) {
      const tip = this.hook.rodTip || { x: this.hook.x, y: this.hook.y - 1000 };
      const point = this.hook.getLinePointAbove?.(this.distanceAboveHook || 28 + this.hookIndex * 30, tip.x, tip.y);
      this.x = point?.x ?? this.hook.x;
      this.y = point?.y ?? this.hook.y - (this.distanceAboveHook || 28 + this.hookIndex * 30);
    }
    if (!Number.isFinite(this.x) || !Number.isFinite(this.y)) return;
    const drawY = this.y - cam;
    const height = ctx.canvas?.clientHeight || ctx.canvas?.height || 1200;
    if (drawY < -60 || drawY > height + 60) return;
    withCanvasState(ctx, () => {
      ctx.translate(this.x, drawY);
      const colors = { uncommon: '#22c55e', rare: '#38bdf8', epic: '#c084fc', legendary: '#fbbf24' };
      drawAura(ctx, this.bobTimer, colors[this.rarity] || '#38bdf8', 33, .85);
      if (this.state === 'HOOKED') {
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.scale(.78, .78);
      const type = RELIC_TYPES.find(relic => relic.id === this.id) || this.relicType;
      drawRelicArtifact(ctx, type, this.bobTimer, !this.restored);
    });
  }
}

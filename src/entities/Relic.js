import { withCanvasState } from '../rendering/CanvasState.js';
import { drawRelicArtifact } from '../rendering/RelicArtwork.js';
import { drawAura } from '../rendering/AuraRenderer.js';
import { RELIC_TYPES } from '../data/RelicsData.js';
import { positionLineAttachment } from './LineAttachment.js';

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
      positionLineAttachment(this);
    } else {
      this.x += Math.sin(this.bobTimer * 0.4) * 0.3;
      this.y += Math.cos(this.bobTimer * 0.35) * 0.2;
    }
  }

  hookTo(hook, slotIndex) {
    this.state = 'HOOKED';
    this.hook = hook;
    this.hookIndex = slotIndex;
    positionLineAttachment(this);
  }

  render(ctx, cameraY = 0) {
    const cam = Number.isFinite(cameraY) ? cameraY : 0;
    if (this.state === 'HOOKED' && this.hook) {
      positionLineAttachment(this);
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

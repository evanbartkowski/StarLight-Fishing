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
    let posX = this.x;
    let posY = this.y;
    if (this.state === 'HOOKED' && this.hook) {
      const dist = this.distanceAboveHook || (28 + this.hookIndex * 30);
      const rodTip = this.hook.rodTip || { x: this.hook.x, y: this.hook.y - 1000 };
      if (typeof this.hook.getLinePointAbove === 'function') {
        const pt = this.hook.getLinePointAbove(dist, rodTip.x, rodTip.y);
        posX = pt.x;
        posY = pt.y;
        this.x = posX;
        this.y = posY;
      } else {
        posX = this.hook.x;
        posY = this.hook.y - dist;
        this.x = posX;
        this.y = posY;
      }
    }
    const drawY = posY - cameraY;
    if (drawY < -60 || drawY > 900) return;

    // Line attachment tackle sleeve / clip right on the line
    if (this.state === 'HOOKED') {
      ctx.save();
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(posX, drawY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(posX, drawY);

    // Grime / barnacle crust overlay
    const grime = Math.min(1, this.grimeLevel / 5);

    // Barnacle crust base
    ctx.fillStyle = `rgba(30, 58, 42, ${0.5 + grime * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius, this.radius * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Irregular barnacle bumps
    ctx.fillStyle = `rgba(47, 79, 55, ${grime})`;
    for (let b = 0; b < 6; b++) {
      const bx = Math.cos((b / 6) * Math.PI * 2) * 11;
      const by = Math.sin((b / 6) * Math.PI * 2) * 9;
      ctx.beginPath();
      ctx.arc(bx, by, 3 + Math.sin(b * 1.7) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Partially revealed artifact icon beneath grime
    ctx.globalAlpha = 0.4 + (1 - grime) * 0.6;
    ctx.font = `${14 + (1 - grime) * 6}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, 0, 0);
    ctx.globalAlpha = 1;

    // Relic rarity ring
    const rarityColors = {
      uncommon: '#22c55e',
      rare: '#3b82f6',
      epic: '#a855f7',
      legendary: '#f59e0b',
    };
    ctx.strokeStyle = rarityColors[this.rarity] || '#94a3b8';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
  }
}

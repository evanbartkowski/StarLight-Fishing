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

    const time = this.bobTimer;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.2);

    // Dual-colored aura:
    // 1) Rarity color aura representing divine rarity
    // 2) Subtle warm brown/golden aura representing ancient age, seafloor sediment, and sunken antiquities
    const rarityColors = {
      uncommon: '#22c55e',
      rare: '#38bdf8',
      epic: '#c084fc',
      legendary: '#fbbf24',
    };
    const rarityRgb = {
      uncommon: '34, 197, 94',
      rare: '56, 189, 248',
      epic: '192, 132, 252',
      legendary: '251, 191, 36',
    }[this.rarity] || '148, 163, 184';

    const outerRadius = this.radius * (1.6 + pulse * 0.25) + 10;
    const innerRadius = this.radius * 0.3;

    // Outer Aura: Rarity radiance with floating sediment flecks
    const rarityAura = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius);
    rarityAura.addColorStop(0, `rgba(${rarityRgb}, ${0.45 + pulse * 0.15})`);
    rarityAura.addColorStop(0.5, `rgba(${rarityRgb}, ${0.22 + pulse * 0.08})`);
    rarityAura.addColorStop(1, `rgba(${rarityRgb}, 0)`);
    ctx.fillStyle = rarityAura;
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner / Mid Aura: Subtle golden-brown seafloor antiquity glow (age, decay, silt)
    const patinaAura = ctx.createRadialGradient(0, 0, 2, 0, 0, this.radius * 1.35 + 4);
    patinaAura.addColorStop(0, 'rgba(217, 119, 6, 0.45)');     // deep ancient amber gold
    patinaAura.addColorStop(0.45, 'rgba(146, 64, 14, 0.28)');  // weathered sea-mud bronze
    patinaAura.addColorStop(0.75, 'rgba(120, 53, 15, 0.14)');  // dark nautical wood/peat
    patinaAura.addColorStop(1, 'rgba(120, 53, 15, 0)');
    ctx.fillStyle = patinaAura;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 1.35 + 4, 0, Math.PI * 2);
    ctx.fill();

    // Dredged Seafloor Base: Weathered stone/coral substrate with authentic marine encrustation
    const grime = Math.min(1, this.grimeLevel / 5);

    // Deep seabed silt shadow beneath relic
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.ellipse(0, 8, this.radius * 0.9, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Weathered maritime artifact body / sediment encasement
    const stoneGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, this.radius);
    stoneGrad.addColorStop(0, '#57534e');
    stoneGrad.addColorStop(0.6, '#292524');
    stoneGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius, this.radius * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bronze / Verdigris patina streaks on the recovered relic
    ctx.strokeStyle = '#0d9488'; // oceanic verdigris oxidation
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.75, 0.4, 2.2);
    ctx.stroke();

    ctx.strokeStyle = '#d97706'; // ancient weathered bronze highlights
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.75, 3.4, 5.2);
    ctx.stroke();

    // Sea-bottom barnacles and mineral shells encrusted on the edges
    for (let b = 0; b < 7; b++) {
      const angle = (b / 7) * Math.PI * 2 + 0.2;
      const dist = this.radius * 0.82;
      const bx = Math.cos(angle) * dist;
      const by = Math.sin(angle) * (dist * 0.88);
      const bRad = 2.4 + Math.sin(b * 1.9) * 1.1;

      // Barnacle cone
      ctx.fillStyle = b % 2 === 0 ? '#d6d3d1' : '#a8a29e';
      ctx.beginPath();
      ctx.arc(bx, by, bRad, 0, Math.PI * 2);
      ctx.fill();

      // Barnacle aperture center
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.arc(bx, by, bRad * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Small tufts of clinging seabed green algae
    ctx.fillStyle = 'rgba(21, 128, 61, 0.75)';
    for (let a = 0; a < 3; a++) {
      const ax = -8 + a * 8;
      const ay = -this.radius * 0.65;
      ctx.beginPath();
      ctx.ellipse(ax, ay, 2.5, 4.5, Math.sin(time + a) * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centered relic icon with underwater gleam
    ctx.save();
    ctx.globalAlpha = 0.75 + (1 - grime) * 0.25;
    ctx.font = `${16 + (1 - grime) * 4}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, 0, 0);
    ctx.restore();

    // Dual-colored border ring (ancient brass weathered edge + rarity highlight)
    // 1) Antique brass / bronze outer rim
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 1.5, 0, Math.PI * 2);
    ctx.stroke();

    // 2) Glowing rarity quadrant notches
    ctx.strokeStyle = rarityColors[this.rarity] || '#94a3b8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let q = 0; q < 4; q++) {
      const startA = (q * Math.PI) / 2 - 0.25;
      const endA = (q * Math.PI) / 2 + 0.25;
      ctx.arc(0, 0, this.radius + 2, startA, endA);
    }
    ctx.stroke();

    // Ambient floating sea-silt sparkle
    const sparkleAngle = time * 1.5;
    const spX = Math.cos(sparkleAngle) * (this.radius + 6);
    const spY = Math.sin(sparkleAngle) * (this.radius * 0.8 + 6);
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(spX, spY, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

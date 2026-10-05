import { RARITY_CONFIG } from '../data/FishData.js';
import { getRandomBottleMessage } from '../data/DriftMessages.js';

function drawRealmArtifact(ctx, item, time) {
  const name = (item.name || '').toLowerCase();
  const gold = '#f0c66d', edge = item.glow || '#fff1b8';
  ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.strokeStyle = edge; ctx.fillStyle = item.color || '#38bdf8';
  if (/crown|tiara|diadem|coronet/.test(name)) {
    ctx.beginPath(); ctx.moveTo(-20, 10); ctx.lineTo(-17, -11); ctx.lineTo(-6, 0); ctx.lineTo(0, -19); ctx.lineTo(7, 0); ctx.lineTo(18, -12); ctx.lineTo(21, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = gold; ctx.fillRect(-19, 10, 39, 5);
    for (const x of [-16, 0, 16]) { ctx.fillStyle = edge; ctx.beginPath(); ctx.arc(x, x ? -8 : -14, 2.8, 0, Math.PI * 2); ctx.fill(); }
  } else if (/compass|orrery|clock|hourglass|sun disk/.test(name)) {
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = gold; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.stroke();
    ctx.fillStyle = '#fff4cc'; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(4, 3); ctx.lineTo(0, 1); ctx.lineTo(-4, 3); ctx.closePath(); ctx.fill();
  } else if (/chalice|goblet|crucible|music box/.test(name)) {
    ctx.beginPath(); ctx.moveTo(-16, -13); ctx.lineTo(16, -13); ctx.quadraticCurveTo(13, 3, 5, 5); ctx.lineTo(4, 13); ctx.lineTo(12, 15); ctx.lineTo(12, 19); ctx.lineTo(-12, 19); ctx.lineTo(-12, 15); ctx.lineTo(-4, 13); ctx.lineTo(-5, 5); ctx.quadraticCurveTo(-13, 3, -16, -13); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = gold; ctx.beginPath(); ctx.moveTo(-13, -8); ctx.quadraticCurveTo(0, -3, 13, -8); ctx.stroke();
  } else if (/key|scepter|staff|harp/.test(name)) {
    ctx.strokeStyle = gold; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-13, 15); ctx.lineTo(11, -10); ctx.stroke();
    ctx.fillStyle = item.color || '#38bdf8'; ctx.beginPath(); ctx.arc(13, -13, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(5, -3); ctx.lineTo(13, 3); ctx.lineTo(9, 7); ctx.stroke();
  } else if (/fossil|tooth|skull|trilobite|fern/.test(name)) {
    ctx.fillStyle = '#ded2ae'; ctx.beginPath(); ctx.moveTo(0, -20); ctx.quadraticCurveTo(16, -7, 14, 7); ctx.lineTo(6, 18); ctx.lineTo(-6, 18); ctx.lineTo(-14, 7); ctx.quadraticCurveTo(-16, -7, 0, -20); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#8c8068'; ctx.lineWidth = 1.3;
    for (let rib = -8; rib <= 8; rib += 4) { ctx.beginPath(); ctx.moveTo(-10, rib); ctx.lineTo(10, rib); ctx.stroke(); }
  } else if (/bottle|message/.test(name)) {
    // Elegant vintage glass bottle with cork and rolled parchment inside
    ctx.fillStyle = item.color || '#34d399';
    ctx.globalAlpha *= 0.82;
    ctx.beginPath();
    ctx.ellipse(0, 3, 8, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bottle neck & lip
    ctx.fillRect(-3, -16, 6, 8);
    ctx.strokeRect(-3, -16, 6, 8);

    // Cork stopper
    ctx.fillStyle = '#b45309';
    ctx.globalAlpha = 1.0;
    ctx.fillRect(-3.5, -20, 7, 5);

    // Rolled parchment scroll inside
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(0, 3, 3.5, 9, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Red wax ribbon seal on scroll
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-2, 1, 4, 3);

    // Glass shine highlight
    ctx.strokeStyle = '#ffffffbb';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(3, 3, 9, -Math.PI * 0.45, 0.05);
    ctx.stroke();
  } else if (/pearl|heart|amber|opal|prism|tear|shard|crystal|gem/.test(name)) {
    ctx.beginPath(); ctx.moveTo(0, -21); ctx.lineTo(17, -8); ctx.lineTo(12, 11); ctx.lineTo(0, 20); ctx.lineTo(-13, 9); ctx.lineTo(-17, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff77'; ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(6, -7); ctx.lineTo(0, 10); ctx.lineTo(-9, -7); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(0, 17); ctx.moveTo(-13, 9); ctx.lineTo(15, -8); ctx.stroke();
  } else {
    ctx.fillStyle = '#684323'; ctx.beginPath(); ctx.roundRect(-18, -12, 36, 27, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = gold; ctx.fillRect(-18, -11, 36, 5); ctx.fillRect(-18, 9, 36, 4); ctx.fillRect(-3, -5, 6, 12);
    ctx.fillStyle = edge; ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = edge; ctx.globalAlpha *= .75 + Math.sin(time * 1.3) * .15;
  ctx.beginPath(); ctx.arc(0, -25, 2, 0, Math.PI * 2); ctx.fill();
}

export class Treasure {
  constructor(itemConfig, x, y) {
    this.isTreasure = true;
    this.category = itemConfig.category || 'treasure';
    this.isCrate = !!itemConfig.isCrate || itemConfig.category === 'crate';
    this.isBottle = !!itemConfig.isBottle || itemConfig.id === 'bottle';
    this.crateRank = itemConfig.crateRank || 1;
    this.itemConfig = itemConfig;
    this.zone = itemConfig.zone;
    this.rewardMultiplier = itemConfig.rewardMultiplier || 1;
    this.id = itemConfig.id;
    this.name = itemConfig.name;
    this.rarity = itemConfig.rarity;
    this.rarityColor = RARITY_CONFIG[itemConfig.rarity]?.color || '#ffffff';
    this.rarityGlow = RARITY_CONFIG[itemConfig.rarity]?.glow || '#fde68a';
    this.value = this.isBottle ? 0 : itemConfig.value;
    this.bottleMessage = this.isBottle ? (itemConfig.bottleMessage || getRandomBottleMessage()) : null;
    this.lore = itemConfig.lore;

    this.x = x;
    this.y = y;
    this.baseY = y;
    this.radius = itemConfig.radius || 18;
    this.state = 'IDLE'; // 'IDLE' | 'HOOKED'
    this.hook = null;
    this.hookOffset = { x: 0, y: 0 };
    this.timer = Math.random() * Math.PI * 2;
  }

  update(dt, worldWidth, hook) {
    const deltaSec = dt / 1000;
    const bobOffset = this.y - (this.baseY + Math.sin(this.timer) * 6);
    this.timer += 2.5 * deltaSec;

    if (this.state === 'IDLE') {
      this.y = this.baseY + Math.sin(this.timer) * 6 + bobOffset;
    } else if (this.state === 'HOOKED' && hook) {
      this.x = hook.x + this.hookOffset.x;
      this.y = hook.y + this.hookOffset.y;
    }
  }

  hookTo(hook, slotIndex) {
    this.state = 'HOOKED';
    this.hook = hook;
    this.hookIndex = slotIndex;
    const side = slotIndex % 2 === 0 ? 1 : -1;
    this.hookOffset = {
      x: side * 3,
      y: -(22 + slotIndex * 26),
    };
    this.x = hook.x + this.hookOffset.x;
    this.y = hook.y + this.hookOffset.y;
  }

  render(ctx, cameraY = 0) {
    const drawY = this.y - cameraY;

    // Leader wire connecting to hook if hooked
    if (this.state === 'HOOKED' && this.hook) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(this.hook.x, this.hook.y - cameraY);
      ctx.lineTo(this.x, drawY);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, drawY);

    // Glowing aura
    ctx.save();
    ctx.shadowColor = this.rarityGlow;
    ctx.shadowBlur = 16;

    if (this.itemConfig.realmStyle && !this.isCrate) {
      drawRealmArtifact(ctx, this.itemConfig, this.timer);
    } else if (this.isCrate || this.category === 'crate') {
      // RANKED MYSTERY CRATES (Ranks 1 to 5)
      const rank = this.crateRank || 1;
      const hw = this.radius;
      const hh = this.radius * 0.72;

      // Base Box Body
      ctx.fillStyle = this.itemConfig.color || '#78350f';
      ctx.fillRect(-hw, -hh, hw * 2, hh * 2);

      // Darker Wood/Metal Grain Borders
      ctx.strokeStyle = rank === 8 ? '#e879f9' : rank === 7 ? '#2dd4bf' : rank === 6 ? '#f97316' : rank === 5 ? '#38bdf8' : rank === 4 ? '#c084fc' : rank === 3 ? '#fbbf24' : '#27272a';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);

      // Vertical Straps
      ctx.fillStyle = rank === 8 ? '#c084fc' : rank === 7 ? '#14b8a6' : rank === 6 ? '#ea580c' : rank === 5 ? '#38bdf8' : rank >= 3 ? '#f59e0b' : '#475569';
      ctx.fillRect(-hw + 5, -hh, 4, hh * 2);
      ctx.fillRect(hw - 9, -hh, 4, hh * 2);

      // Center Keyhole / Lock Latch
      ctx.fillStyle = rank === 8 ? '#38bdf8' : rank === 7 ? '#fef08a' : rank === 6 ? '#fbbf24' : rank === 5 ? '#f43f5e' : rank >= 3 ? '#facc15' : '#cbd5e1';
      ctx.fillRect(-4, -5, 8, 10);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-1.5, -2, 3, 4);

      // Rank Glow Emblem on top
      if (rank >= 4) {
        ctx.fillStyle = rank === 8 ? '#e879f9' : rank === 7 ? '#2dd4bf' : rank === 6 ? '#f97316' : rank === 5 ? '#67e8f9' : '#c084fc';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, -hh - 3, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else if (this.category === 'fossil') {
      // PREHISTORIC FOSSILS
      if (this.id === 'fossil_trilobite') {
        // Trilobite Carapace
        ctx.fillStyle = '#71717a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Segments
        ctx.strokeStyle = '#d4d4d8';
        ctx.lineWidth = 1.8;
        for (let i = -10; i <= 10; i += 5) {
          ctx.beginPath();
          ctx.moveTo(-10, i);
          ctx.lineTo(10, i);
          ctx.stroke();
        }
      } else if (this.id === 'fossil_ammonite') {
        // Spiral Ammonite
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 5; a += 0.2) {
          const r = 2 + a * 0.8;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      } else if (this.id === 'fossil_megalodon') {
        // Megalodon Giant Triangular Tooth
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(-14, -12);
        ctx.lineTo(14, -12);
        ctx.closePath();
        ctx.fill();

        // Root gum enamel
        ctx.fillStyle = '#475569';
        ctx.fillRect(-15, -16, 30, 6);
      } else if (this.id === 'fossil_pliosaur') {
        // Pliosaur Marine Skull
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.moveTo(-16, -6);
        ctx.lineTo(16, 0);
        ctx.lineTo(-12, 12);
        ctx.closePath();
        ctx.fill();

        // Eye socket cavity
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(-4, -1, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Atlantean Crystal Keystone
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(14, 0);
        ctx.lineTo(0, 18);
        ctx.lineTo(-14, 0);
        ctx.closePath();
        ctx.fill();

        // Glyphs
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // STANDARD SUNKEN TREASURES
      if (this.id === 'pirate_chest' || this.id === 'royal_relic') {
        const isRoyal = this.id === 'royal_relic';
        ctx.fillStyle = isRoyal ? '#b45309' : '#78350f';
        ctx.fillRect(-15, -10, 30, 20);

        ctx.fillStyle = isRoyal ? '#fef08a' : '#facc15';
        ctx.fillRect(-15, -10, 30, 4);
        ctx.fillRect(-15, 6, 30, 4);
        ctx.fillRect(-3, -4, 6, 8); // Lock
      } else if (this.id === 'ocean_heart') {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(12, -4);
        ctx.lineTo(0, 14);
        ctx.lineTo(-12, -4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(6, -4);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.fill();
      } else if (this.id === 'giant_pearl') {
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(0, 4, 14, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -2, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.id === 'coin_bag') {
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, 4, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#854d0e';
        ctx.fillRect(-4, -10, 8, 4);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('$', 0, 7);
      } else if (this.id === 'bottle') {
        ctx.fillStyle = 'rgba(134, 239, 172, 0.75)';
        ctx.fillRect(-6, -8, 12, 18);
        ctx.fillRect(-3, -13, 6, 5);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-3, -15, 6, 3);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(-4, -4, 8, 10);
      } else {
        // Iridescent Shell
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, 2, 11, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1;
        for (let i = -8; i <= 8; i += 4) {
          ctx.beginPath();
          ctx.moveTo(0, 2);
          ctx.lineTo(i, -9);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
    ctx.restore();
  }
}


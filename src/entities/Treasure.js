import { drawChest } from '../rendering/ChestArtwork.js';
import { RARITY_CONFIG } from '../data/FishData.js';
import { getRandomBottleMessage } from '../data/DriftMessages.js';
import { withCanvasState } from '../rendering/CanvasState.js';
import { positionLineAttachment } from './LineAttachment.js';
import { drawTreasureArtwork } from '../rendering/TreasureArtwork.js';

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
  } else if (/fire opal|opal cluster/.test(name)) {
    // Fire Opal Cluster: Dark basalt geode matrix encrusted with glowing, iridescent fiery opal crystal facets
    ctx.save();
    // Dark volcanic matrix rock base
    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-18, 12);
    ctx.lineTo(-21, -2);
    ctx.lineTo(-12, -14);
    ctx.lineTo(4, -18);
    ctx.lineTo(19, -8);
    ctx.lineTo(22, 10);
    ctx.lineTo(6, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hot magma vein fissures running through the rock
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-16, 5); ctx.lineTo(-4, 2); ctx.lineTo(12, 8);
    ctx.moveTo(-2, -12); ctx.lineTo(5, -2);
    ctx.stroke();

    // Cluster of 4 faceted Fire Opal gem crystals
    const crystals = [
      { x: -7, y: -4, r: 10, rot: -0.2 },
      { x: 7, y: -5, r: 11, rot: 0.3 },
      { x: 0, y: 5, r: 9, rot: 0.1 },
      { x: -11, y: 7, r: 7, rot: -0.4 },
    ];

    for (let c = 0; c < crystals.length; c++) {
      const cr = crystals[c];
      ctx.save();
      ctx.translate(cr.x, cr.y);
      ctx.rotate(cr.rot);

      // Searing fire opal gem gradient (translucent orange, fiery scarlet, incandescent amber)
      const opGrad = ctx.createRadialGradient(-cr.r * 0.3, -cr.r * 0.3, 0, 0, 0, cr.r);
      opGrad.addColorStop(0, '#fef08a');
      opGrad.addColorStop(0.35, '#fb923c');
      opGrad.addColorStop(0.7, '#ef4444');
      opGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = opGrad;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.2;

      // Faceted prismatic crystal shape
      ctx.beginPath();
      ctx.moveTo(0, -cr.r);
      ctx.lineTo(cr.r * 0.85, -cr.r * 0.3);
      ctx.lineTo(cr.r * 0.6, cr.r * 0.9);
      ctx.lineTo(-cr.r * 0.6, cr.r * 0.9);
      ctx.lineTo(-cr.r * 0.85, -cr.r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Iridescent flash facet (green/gold/cyan shimmering play-of-color in natural fire opals)
      const flashPulse = 0.5 + 0.5 * Math.sin(time * 3 + c);
      ctx.fillStyle = c % 2 === 0 ? `rgba(52, 211, 153, ${0.35 * flashPulse})` : `rgba(250, 204, 21, ${0.45 * flashPulse})`;
      ctx.beginPath();
      ctx.moveTo(0, -cr.r * 0.7);
      ctx.lineTo(cr.r * 0.5, -cr.r * 0.1);
      ctx.lineTo(0, cr.r * 0.5);
      ctx.lineTo(-cr.r * 0.4, -cr.r * 0.1);
      ctx.closePath();
      ctx.fill();

      // Sharp glassy surface glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-cr.r * 0.25, -cr.r * 0.4, 1.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
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
    this.worldScale = itemConfig.worldScale || 1;
    this.radius = (itemConfig.radius || 18) * this.worldScale;
    this.state = 'IDLE'; // 'IDLE' | 'HOOKED'
    this.hook = null;
    this.timer = Math.random() * Math.PI * 2;
    // Rare Chest Impersonator (Mimic) disguised as a pirate chest
    this.isMimic = Boolean(itemConfig.isMimic) || (itemConfig.id === 'pirate_chest' && Math.random() < 0.04);
    this.mimicRevealed = false;
    this.mimicBitten = false;
  }

  update(dt, worldWidth, hook) {
    const deltaSec = dt / 1000;
    const bobOffset = this.y - (this.baseY + Math.sin(this.timer) * 6);
    this.timer += 2.5 * deltaSec;

    if (this.state === 'IDLE') {
      this.y = this.baseY + Math.sin(this.timer) * 6 + bobOffset;
    } else if (this.state === 'HOOKED') {
      positionLineAttachment(this);
    }
  }

  hookTo(hook, slotIndex) {
    this.state = 'HOOKED';
    this.hook = hook;
    this.hookIndex = slotIndex;
    positionLineAttachment(this);
  }

  render(ctx, cameraY = 0) {
    if (this.state === 'HOOKED') positionLineAttachment(this);
    if (!Number.isFinite(this.x) || !Number.isFinite(this.y)) return;
    return withCanvasState(ctx, () => this.renderArtifact(ctx, Number.isFinite(cameraY) ? cameraY : 0));
  }

  renderArtifact(ctx, cameraY) {
    const drawY = this.y - cameraY;

    ctx.save();
    try {
    ctx.translate(this.x, drawY);

    // Glowing aura (translucent halo avoids expensive shadowBlur)
    ctx.save();
    try {
    ctx.fillStyle = this.rarityGlow;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 1.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (!this.isCrate && drawTreasureArtwork(ctx, this.itemConfig, this.state === 'HOOKED' ? 1 : this.worldScale)) {
      // Shared original art also appears in the tackle box and specimen view.
    } else if (this.itemConfig.realmStyle && !this.isCrate) {
      drawRealmArtifact(ctx, this.itemConfig, this.timer);
    } else if (this.isCrate || this.category === 'crate') {
      drawChest(ctx, this.itemConfig, this.radius, this.timer, this.isMimic && this.mimicRevealed);
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
        if (this.isMimic && this.mimicRevealed) {
          // Mimic chest snapped wide open revealing jagged fangs, tongue, and glowing eyes!
          const chompGap = 6 + Math.abs(Math.sin(this.timer * 5)) * 5;
          // Top lid & upper teeth
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-16, -15 - chompGap * 0.5, 32, 9);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-16, -15 - chompGap * 0.5, 32, 2.5);
          // Bottom jaw
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-16, 4 + chompGap * 0.4, 32, 9);
          // Inner maw + tongue
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(-15, -6 - chompGap * 0.4, 30, 10 + chompGap);
          ctx.fillStyle = '#fb7185';
          ctx.beginPath(); ctx.ellipse(0, 3, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
          // Sharp teeth
          ctx.fillStyle = '#ffffff';
          for (let t = -12; t <= 12; t += 6) {
            ctx.beginPath();
            ctx.moveTo(t - 2, -6 - chompGap * 0.4); ctx.lineTo(t, -1); ctx.lineTo(t + 2, -6 - chompGap * 0.4);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(t - 2, 5 + chompGap * 0.4); ctx.lineTo(t, 0); ctx.lineTo(t + 2, 5 + chompGap * 0.4);
            ctx.fill();
          }
          // Glowing amber predator eyes inside the lid crease
          ctx.fillStyle = '#facc15';
          ctx.beginPath(); ctx.arc(-7, -10 - chompGap * 0.4, 2.4, 0, Math.PI * 2); ctx.arc(7, -10 - chompGap * 0.4, 2.4, 0, Math.PI * 2); ctx.fill();
        } else {
          const isRoyal = this.id === 'royal_relic';
          ctx.fillStyle = isRoyal ? '#b45309' : '#78350f';
          ctx.fillRect(-15, -10, 30, 20);

          ctx.fillStyle = isRoyal ? '#fef08a' : '#facc15';
          ctx.fillRect(-15, -10, 30, 4);
          ctx.fillRect(-15, 6, 30, 4);
          ctx.fillRect(-3, -4, 6, 8); // Lock
        }
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

    } finally {
      ctx.restore();
    }
    } finally {
      ctx.restore();
    }
  }
}


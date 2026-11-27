// VesselRenderer.js — Modular, high-fidelity boat & ship rendering for all 9 Vessel Tiers
// Shared between OceanWorld (surface open water) and UIManager (Custom Boat Yard studio preview)

export const VESSEL_NAMES = [
  'Weathered Dinghy',
  'Reinforced Skiff',
  'Coastal Dory',
  'Harbor Cutter',
  'Expedition Trawler',
  'Grand Schooner',
  'Gilded Brigantine',
  'Mythic Celestial Ketch',
  'Poseidon Sovereign Galleon',
];

/**
 * Shared deck, bow, stern, trinket, and pet layout per vessel tier (0..8)
 * so boats, trinkets, and companions (cat, pelican) align cleanly across all vessels.
 */
export function getVesselLayout(vessel = 0, bW = 140, bH = 40, hullStyle = 'standard') {
  const v = Math.max(0, Math.min(8, Math.floor(Number(vessel) || 0)));
  const hw = (bW > 0 ? bW : 140) * 0.5;
  const scale = hw / 70;
  const style = hullStyle || 'standard';

  if (style === 'pirate') {
    return {
      tier: v, hullStyle: style, scale, halfWidth: hw * 1.38,
      catPos: { x: -50 * scale, y: -44 },
      pelicanPos: { x: 108 * scale, y: -26 },
      trinketLeft: { x: -72 * scale, y: -16 },
      trinketRight: { x: 60 * scale, y: -16 },
      anglerPos: { x: -4, y: -14 },
      previewScale: 0.67, previewOffsetY: 18,
    };
  }
  if (style === 'submarine') {
    return {
      tier: v, hullStyle: style, scale, halfWidth: hw * 1.34,
      catPos: { x: -44 * scale, y: -22 },
      pelicanPos: { x: 82 * scale, y: -22 },
      trinketLeft: { x: -64 * scale, y: -18 },
      trinketRight: { x: 46 * scale, y: -22 },
      anglerPos: { x: 2, y: -24 },
      previewScale: 0.72, previewOffsetY: 12,
    };
  }
  if (style === 'chinese_junk') {
    return {
      tier: v, hullStyle: style, scale, halfWidth: hw * 1.38,
      catPos: { x: -52 * scale, y: -42 },
      pelicanPos: { x: 100 * scale, y: -26 },
      trinketLeft: { x: -70 * scale, y: -16 },
      trinketRight: { x: 56 * scale, y: -16 },
      anglerPos: { x: -4, y: -14 },
      previewScale: 0.68, previewOffsetY: 16,
    };
  }
  if (style === 'viking') {
    return {
      tier: v, hullStyle: style, scale, halfWidth: hw * 1.35,
      catPos: { x: -52 * scale, y: -18 },
      pelicanPos: { x: 96 * scale, y: -34 },
      trinketLeft: { x: -68 * scale, y: -16 },
      trinketRight: { x: 54 * scale, y: -15 },
      anglerPos: { x: -4, y: -12 },
      previewScale: 0.70, previewOffsetY: 14,
    };
  }
  if (style === 'ghost_ship') {
    return {
      tier: v, hullStyle: style, scale, halfWidth: hw * 1.36,
      catPos: { x: -48 * scale, y: -44 },
      pelicanPos: { x: 102 * scale, y: -26 },
      trinketLeft: { x: -70 * scale, y: -16 },
      trinketRight: { x: 58 * scale, y: -16 },
      anglerPos: { x: -4, y: -14 },
      previewScale: 0.68, previewOffsetY: 18,
    };
  }
  if (style === 'steampunk') {
    return {
      tier: v, hullStyle: style, scale, halfWidth: hw * 1.36,
      catPos: { x: -50 * scale, y: -38 },
      pelicanPos: { x: 96 * scale, y: -22 },
      trinketLeft: { x: -68 * scale, y: -16 },
      trinketRight: { x: 56 * scale, y: -16 },
      anglerPos: { x: -6, y: -14 },
      previewScale: 0.69, previewOffsetY: 16,
    };
  }

  switch (v) {
    case 0:
      return {
        tier: 0, scale, halfWidth: hw * 0.92 * 0.52,
        catPos: { x: -23 * scale, y: -12 },
        pelicanPos: { x: 27 * scale, y: -12 },
        trinketLeft: { x: -30 * scale, y: -8 },
        trinketRight: { x: 20 * scale, y: -8 },
        anglerPos: { x: -2, y: -12 },
        previewScale: 1.05, previewOffsetY: 6,
      };
    case 1:
      return {
        tier: 1, scale, halfWidth: hw * 0.96 * 0.52,
        catPos: { x: -25 * scale, y: -12 },
        pelicanPos: { x: 30 * scale, y: -12 },
        trinketLeft: { x: -32 * scale, y: -8 },
        trinketRight: { x: 22 * scale, y: -8 },
        anglerPos: { x: -2, y: -12 },
        previewScale: 1.05, previewOffsetY: 6,
      };
    case 2:
      return {
        tier: 2, scale, halfWidth: hw * 1.0 * 0.54,
        catPos: { x: -27 * scale, y: -13 },
        pelicanPos: { x: 33 * scale, y: -14 },
        trinketLeft: { x: -34 * scale, y: -9 },
        trinketRight: { x: 24 * scale, y: -9 },
        anglerPos: { x: -2, y: -12 },
        previewScale: 1.0, previewOffsetY: 4,
      };
    case 3:
      return {
        tier: 3, scale, halfWidth: hw * 1.04 * 0.54,
        catPos: { x: -32 * scale, y: -13 },
        pelicanPos: { x: 36 * scale, y: -14 },
        trinketLeft: { x: -30 * scale, y: -32 },
        trinketRight: { x: 26 * scale, y: -9 },
        anglerPos: { x: -2, y: -12 },
        previewScale: 0.98, previewOffsetY: 4,
      };
    case 4:
      return {
        tier: 4, scale, halfWidth: hw * 1.08 * 0.58,
        catPos: { x: -33 * scale, y: -16 },
        pelicanPos: { x: 40 * scale, y: -16 },
        trinketLeft: { x: -12 * scale, y: -34 },
        trinketRight: { x: 31 * scale, y: -11 },
        anglerPos: { x: -2, y: -12 },
        previewScale: 0.95, previewOffsetY: 4,
      };
    case 5:
      return {
        tier: 5, scale, halfWidth: hw * 1.15,
        catPos: { x: -49 * scale, y: -21 },
        pelicanPos: { x: 76 * scale, y: -22 },
        trinketLeft: { x: -64 * scale, y: -18 },
        trinketRight: { x: 44 * scale, y: -12 },
        anglerPos: { x: -2, y: -12 },
        previewScale: 0.82, previewOffsetY: 10,
      };
    case 6:
      return {
        tier: 6, scale, halfWidth: hw * 1.2,
        catPos: { x: -34 * scale, y: -29 },
        pelicanPos: { x: 84 * scale, y: -21 },
        trinketLeft: { x: -58 * scale, y: -14 },
        trinketRight: { x: 48 * scale, y: -14 },
        anglerPos: { x: -2, y: -12 },
        previewScale: 0.8, previewOffsetY: 12,
      };
    case 7:
      return {
        tier: 7, scale, halfWidth: hw * 1.25,
        catPos: { x: -38 * scale, y: -31 },
        pelicanPos: { x: 92 * scale, y: -21 },
        trinketLeft: { x: -62 * scale, y: -14 },
        trinketRight: { x: 52 * scale, y: -14 },
        anglerPos: { x: -2, y: -12 },
        previewScale: 0.76, previewOffsetY: 14,
      };
    default:
      return {
        tier: 8, scale, halfWidth: hw * 1.35,
        catPos: { x: -48 * scale, y: -47 },
        pelicanPos: { x: 104 * scale, y: -26 },
        trinketLeft: { x: -72 * scale, y: -16 },
        trinketRight: { x: 60 * scale, y: -16 },
        anglerPos: { x: -2, y: -12 },
        previewScale: 0.68, previewOffsetY: 18,
      };
  }
}

function resolvePalette(v, skinOrOpts, customColors) {
  const defaults = [
    { hull: '#9a3412', trim: '#fbbf24', sail: '#f8fafc', secondary: '#78350f', cabin: '#78350f', glow: '#fbbf24' },
    { hull: '#78350f', trim: '#fef08a', sail: '#f8fafc', secondary: '#b45309', cabin: '#b45309', glow: '#fbbf24' },
    { hull: '#1e3a8a', trim: '#38bdf8', sail: '#f8fafc', secondary: '#f8fafc', cabin: '#78350f', glow: '#fbbf24' },
    { hull: '#0f3a5d', trim: '#38bdf8', sail: '#0f172a', secondary: '#f8fafc', cabin: '#f1f5f9', glow: '#fbbf24' },
    { hull: '#1e293b', trim: '#0284c7', sail: '#334155', secondary: '#cbd5e1', cabin: '#334155', glow: '#fde047' },
    { hull: '#451a03', trim: '#d97706', sail: 'rgba(248, 250, 252, 0.94)', secondary: '#78350f', cabin: '#92400e', glow: '#fbbf24' },
    { hull: '#0a192f', trim: '#f59e0b', sail: 'rgba(254, 249, 195, 0.96)', secondary: '#fde047', cabin: '#1e293b', glow: '#fbbf24' },
    { hull: '#1e1b4b', trim: '#38bdf8', sail: 'rgba(224, 231, 255, 0.94)', secondary: '#c7d2fe', cabin: '#312e81', glow: '#38bdf8' },
    { hull: '#1c1917', trim: '#fbbf24', sail: 'rgba(255, 251, 235, 0.97)', secondary: '#7f1d1d', cabin: '#292524', glow: '#fde047' },
  ][v] || {};

  let skinColor = null;
  let skinMeta = null;
  let skinId = 'default';
  let hullStyle = 'standard';
  let partColors = customColors || null;

  if (typeof skinOrOpts === 'string') {
    skinColor = skinOrOpts;
  } else if (skinOrOpts && typeof skinOrOpts === 'object') {
    skinColor = skinOrOpts.skinColor || skinOrOpts.color || null;
    skinMeta = skinOrOpts.skinMeta || null;
    skinId = skinOrOpts.skinId || skinMeta?.id || 'default';
    hullStyle = skinOrOpts.hullStyle || 'standard';
    if (!partColors && skinOrOpts.boatColors) partColors = skinOrOpts.boatColors;
  }

  const hullCustom = partColors?.hull && partColors.hull !== 'default' ? partColors.hull : null;
  const trimCustom = partColors?.trim && partColors.trim !== 'default' ? partColors.trim : null;
  const sailCustom = partColors?.sails && partColors.sails !== 'default' ? partColors.sails : null;

  return {
    hull: hullCustom || (skinMeta?.hullTint || defaults.hull),
    trim: trimCustom || skinColor || defaults.trim,
    sail: sailCustom || (skinMeta?.sailTint || defaults.sail),
    secondary: trimCustom || skinMeta?.secondaryColor || skinColor || defaults.secondary,
    cabin: hullCustom ? defaults.cabin : defaults.cabin,
    glow: trimCustom || skinMeta?.glow || skinColor || defaults.glow,
    hasCustomAccent: Boolean(skinColor || trimCustom || hullCustom),
    skinId,
    skinEffect: skinMeta?.effect || 'classic',
    hullStyle,
  };
}

function applyShipFinishOverlay(ctx, pal, wScale, h, time) {
  const effect = pal.skinEffect;
  if (!effect || effect === 'classic') return;
  const span = wScale;
  ctx.save();
  try {
    switch (effect) {
      case 'celestial_stars': {
        // Shimmering nebula wash & pulsing twinkling constellation dots across hull
        ctx.strokeStyle = '#c084fc';
        ctx.globalAlpha = 0.45 + 0.25 * Math.sin(time * 2.4);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-span * 0.9, -4);
        ctx.quadraticCurveTo(0, 8, span * 0.92, -4);
        ctx.stroke();

        // Constellation connecting lines
        ctx.strokeStyle = 'rgba(224, 231, 255, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-span * 0.62, 6);
        ctx.lineTo(-span * 0.3, -2);
        ctx.lineTo(0, 7);
        ctx.lineTo(span * 0.35, -1);
        ctx.lineTo(span * 0.65, 6);
        ctx.stroke();

        // Sparkling 4-point stars
        const stars = [-0.62, -0.3, 0, 0.35, 0.65];
        stars.forEach((sx, idx) => {
          const px = span * sx;
          const py = idx % 2 === 0 ? 6 : -1;
          const pulse = 2.6 + Math.sin(time * 4 + idx * 1.4) * 1.1;
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.moveTo(px, py - pulse);
          ctx.lineTo(px + pulse * 0.35, py - pulse * 0.35);
          ctx.lineTo(px + pulse, py);
          ctx.lineTo(px + pulse * 0.35, py + pulse * 0.35);
          ctx.lineTo(px, py + pulse);
          ctx.lineTo(px - pulse * 0.35, py + pulse * 0.35);
          ctx.lineTo(px - pulse, py);
          ctx.lineTo(px - pulse * 0.35, py - pulse * 0.35);
          ctx.closePath();
          ctx.fill();
        });
        break;
      }
      case 'magma_cracks': {
        // Jagged glowing lava fissure veins + rising embers
        const glowPulse = 0.7 + 0.3 * Math.sin(time * 3.8);
        ctx.strokeStyle = '#f97316';
        ctx.globalAlpha = glowPulse * 0.55;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(-span * 0.72, 2);
        ctx.lineTo(-span * 0.48, 12);
        ctx.lineTo(-span * 0.28, 3);
        ctx.lineTo(-span * 0.05, 14);
        ctx.lineTo(span * 0.22, 2);
        ctx.lineTo(span * 0.48, 13);
        ctx.lineTo(span * 0.72, 1);
        ctx.stroke();

        ctx.strokeStyle = '#fde047';
        ctx.globalAlpha = glowPulse;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        for (let e = 0; e < 5; e++) {
          const cycle = (time * 0.9 + e * 0.23) % 1;
          const ex = (-0.55 + e * 0.28) * span + Math.sin(time * 3 + e) * 4;
          const ey = 6 - cycle * 32;
          ctx.fillStyle = cycle < 0.5 ? '#fde047' : '#f97316';
          ctx.globalAlpha = Math.max(0, 1 - cycle);
          ctx.beginPath();
          ctx.arc(ex, ey, 2.2 * (1 - cycle * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'gold_plate': {
        // Heavy gilded hull bands, rivets, and moving glint
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-span * 0.92, -3);
        ctx.quadraticCurveTo(0, 8, span * 0.95, -3);
        ctx.stroke();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-span * 0.85, 8);
        ctx.quadraticCurveTo(0, 18, span * 0.88, 8);
        ctx.stroke();
        for (let r = -3; r <= 3; r++) {
          ctx.fillStyle = '#fef9c3';
          ctx.beginPath();
          ctx.arc(r * span * 0.24, 3 + Math.abs(r) * 1.2, 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
        const glintX = Math.sin(time * 1.6) * span * 0.7;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(glintX, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'pearl_prism': {
        const shift = (Math.sin(time * 1.8) + 1) * 0.5;
        const pGrad = ctx.createLinearGradient(-span, -6, span, 14);
        pGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        pGrad.addColorStop(0.25 + shift * 0.25, 'rgba(244, 114, 182, 0.6)');
        pGrad.addColorStop(0.65, 'rgba(167, 243, 208, 0.55)');
        pGrad.addColorStop(1, 'rgba(199, 210, 254, 0.6)');
        ctx.strokeStyle = pGrad;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-span * 0.92, 0);
        ctx.quadraticCurveTo(0, 12, span * 0.94, 0);
        ctx.stroke();
        break;
      }
      case 'neon_circuit': {
        const pulse = 0.65 + 0.35 * Math.sin(time * 5);
        ctx.strokeStyle = '#22d3ee';
        ctx.globalAlpha = pulse;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-span * 0.85, 0);
        ctx.lineTo(-span * 0.45, 0);
        ctx.lineTo(-span * 0.32, 9);
        ctx.lineTo(span * 0.25, 9);
        ctx.lineTo(span * 0.38, -1);
        ctx.lineTo(span * 0.86, -1);
        ctx.stroke();
        for (const nx of [-0.45, -0.32, 0.25, 0.38]) {
          ctx.fillStyle = '#cffafe';
          ctx.beginPath();
          ctx.arc(span * nx, (nx === -0.32 || nx === 0.25) ? 9 : 0, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'crimson_runes': {
        const throb = 0.6 + 0.4 * Math.sin(time * 3);
        ctx.strokeStyle = '#fb7185';
        ctx.globalAlpha = throb;
        ctx.lineWidth = 2;
        for (let k = -2; k <= 2; k++) {
          const rx = k * span * 0.3;
          ctx.beginPath();
          ctx.moveTo(rx - 5, 1);
          ctx.lineTo(rx, 8);
          ctx.lineTo(rx + 5, 1);
          ctx.lineTo(rx, -4);
          ctx.closePath();
          ctx.stroke();
        }
        break;
      }
      case 'amethyst_facets': {
        ctx.fillStyle = '#d8b4fe';
        ctx.strokeStyle = '#6b21a8';
        ctx.lineWidth = 1.2;
        for (let c = -2; c <= 2; c++) {
          const cx = c * span * 0.28;
          ctx.beginPath();
          ctx.moveTo(cx, -5);
          ctx.lineTo(cx + 5, 3);
          ctx.lineTo(cx, 11);
          ctx.lineTo(cx - 5, 3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        break;
      }
      case 'emerald_bio': {
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let sx = -span * 0.85; sx <= span * 0.85; sx += 14) {
          const sy = 5 + Math.sin(sx * 0.08 + time * 2.5) * 4;
          if (sx === -span * 0.85) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        break;
      }
      case 'indigo_vortex': {
        ctx.strokeStyle = '#a5b4fc';
        ctx.lineWidth = 2.6;
        for (let i = -2; i <= 2; i++) {
          const ix = i * span * 0.28;
          ctx.beginPath();
          ctx.moveTo(ix - 8, 8);
          ctx.lineTo(ix, -1);
          ctx.lineTo(ix + 8, 8);
          ctx.stroke();
        }
        break;
      }
      case 'coral_bloom': {
        for (let i = -3; i <= 3; i++) {
          const bx = i * span * 0.24;
          ctx.fillStyle = i % 2 === 0 ? '#fda4af' : '#fef08a';
          ctx.beginPath();
          ctx.arc(bx, 3 + Math.abs(i) * 1.1, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'rose_sheen': {
        const rg = ctx.createLinearGradient(-span, -6, span, 14);
        rg.addColorStop(0, '#fb7185');
        rg.addColorStop(0.5, '#fef08a');
        rg.addColorStop(1, '#fda4af');
        ctx.strokeStyle = rg;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-span * 0.9, 1);
        ctx.quadraticCurveTo(0, 12, span * 0.9, 1);
        ctx.stroke();
        break;
      }
      default:
        break;
    }
  } finally {
    ctx.restore();
  }
}

function drawGlowDot(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders the boat hull, deck structures, masts, sails, and trim for any vessel tier (0 to 8+).
 * Coordinates are centered at (0, 0) relative to the boat transform.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} vessel - Vessel tier integer (0 to 8)
 * @param {number} bW - Boat width
 * @param {number} bH - Boat height
 * @param {number} time - Animation wave timer
 * @param {string|object|null} skinColor - Optional cosmetic hull stripe color or customization object
 * @param {object|null} customColors - Optional { hull, trim, sails } overrides
 */
export function drawVesselHull(ctx, vessel = 0, bW = 140, bH = 40, time = 0, skinColor = null, customColors = null) {
  const v = Math.max(0, Math.min(8, Math.floor(Number(vessel) || 0)));
  const hw = (bW > 0 ? bW : 140) * 0.5;
  const h = (bH > 0 ? bH : 40);
  const pal = resolvePalette(v, skinColor, customColors);
  const effectiveSpan = pal.hullStyle && pal.hullStyle !== 'standard' ? hw * 1.35 : (hw * [0.92, 0.96, 1, 1.04, 1.08, 1.15, 1.2, 1.25, 1.35][v]);

  ctx.save();
  try {
    if (pal.hullStyle === 'pirate') {
      // ==========================================
      // EXOTIC HULL: BLACKBEARD'S DREAD GALLEON
      // ==========================================
      const gw = hw * 1.38;
      // Dread crimson/black lower hull
      ctx.fillStyle = pal.hull === '#1c1917' ? '#18181b' : pal.hull;
      ctx.beginPath();
      ctx.moveTo(-gw, -16);
      ctx.lineTo(-gw * 0.88, h * 0.74);
      ctx.quadraticCurveTo(0, h * 1.0, gw * 0.92, h * 0.64);
      ctx.lineTo(gw * 1.04, -16);
      ctx.closePath();
      ctx.fill();

      // Blood crimson waterline stripe
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(-gw * 0.93, 2);
      ctx.lineTo(-gw * 0.88, h * 0.74);
      ctx.quadraticCurveTo(0, h * 1.0, gw * 0.92, h * 0.64);
      ctx.lineTo(gw * 0.98, 2);
      ctx.quadraticCurveTo(0, 17, -gw * 0.93, 2);
      ctx.closePath();
      ctx.fill();

      // Gunwale & Broadside protruding brass cannons
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(-gw, -16); ctx.lineTo(gw * 1.04, -16); ctx.stroke();

      for (let c = 0; c < 5; c++) {
        const cx = -gw * 0.56 + c * (gw * 0.28);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(cx - 5, 4, 10, 8);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx - 3, 6, 8, 4);
      }

      // High Stern Castle & Burning Braziers
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-gw * 0.74, -44, gw * 0.45, 30);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-gw * 0.74, -46, gw * 0.45, 4);
      drawGlowDot(ctx, -gw * 0.72, -50, 5.5, '#f97316');

      // Spiked Pirate Bowsprit & Bone Skull Figurehead
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 5.5;
      ctx.beginPath(); ctx.moveTo(gw * 0.88, -14); ctx.lineTo(gw + 46, -34); ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(gw * 1.03 + 7, -14, 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(gw * 1.03 + 5, -15, 1.8, 0, Math.PI * 2); ctx.arc(gw * 1.03 + 10, -15, 1.8, 0, Math.PI * 2); ctx.fill();

      // Twin Masts & Tattered Dark Jolly Roger Sails
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-gw * 0.36, -18); ctx.lineTo(-gw * 0.38, -125); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gw * 0.25, -18); ctx.lineTo(gw * 0.24, -142); ctx.stroke();

      const pBillow = Math.sin(time * 1.1) * 14;
      const sailShade = pal.sail === 'rgba(255, 251, 235, 0.97)' ? '#1e293b' : pal.sail;
      ctx.fillStyle = sailShade;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.6;
      // Aft Sail
      ctx.beginPath();
      ctx.moveTo(-gw * 0.38, -120); ctx.lineTo(-gw * 0.04, -114);
      ctx.quadraticCurveTo(-gw * 0.12 + pBillow, -68, -gw * 0.06, -26);
      ctx.lineTo(-gw * 0.38, -28); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Main Sail with Skull & Crossbones Emblem
      ctx.beginPath();
      ctx.moveTo(gw * 0.24, -138); ctx.lineTo(gw * 0.72, -128);
      ctx.quadraticCurveTo(gw * 0.56 + pBillow, -76, gw * 0.66, -26);
      ctx.lineTo(gw * 0.24, -28); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Skull Icon on Sail
      const skX = gw * 0.48, skY = -82;
      ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(skX - 11, skY - 9); ctx.lineTo(skX + 11, skY + 9); ctx.moveTo(skX + 11, skY - 9); ctx.lineTo(skX - 11, skY + 9); ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(skX, skY - 2, 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(skX - 3, skY - 3, 1.8, 0, Math.PI * 2); ctx.arc(skX + 3, skY - 3, 1.8, 0, Math.PI * 2); ctx.fill();
      // Jolly Roger Masthead Flag
      const flap = Math.sin(time * 4.5) * 4;
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(gw * 0.24, -152); ctx.quadraticCurveTo(gw * 0.06, -158 + flap, -gw * 0.08, -150 - flap * 0.5);
      ctx.lineTo(gw * 0.24, -142); ctx.closePath(); ctx.fill();

    } else if (pal.hullStyle === 'submarine') {
      // ==========================================
      // EXOTIC HULL: ABYSSAL NAUTILUS SUBMERSIBLE
      // ==========================================
      const sw = hw * 1.34;
      // Searchlight Flood Beam ahead & below
      try {
        const beamGrad = ctx.createRadialGradient(sw * 0.9, 6, 4, sw * 1.45, 50, 140);
        beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.52)');
        beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(sw * 0.9, 2); ctx.lineTo(sw + 145, -18); ctx.lineTo(sw + 145, 110); ctx.closePath(); ctx.fill();
      } catch (e) {}

      // Aft Spinning Bronze Propeller blades
      const bladeScale = Math.cos(time * 12);
      ctx.fillStyle = pal.trim;
      ctx.beginPath(); ctx.ellipse(-sw * 1.03, 4, 5, 16 * Math.abs(bladeScale) + 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.fillRect(-sw * 0.98, -10, 10, 28);

      // Pressurized Riveted Cylindrical Hull
      ctx.fillStyle = pal.hull === '#1c1917' ? '#1e293b' : pal.hull;
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 2, sw * 0.98, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Conning Tower / Sail Fin + Brass Periscope
      ctx.fillStyle = pal.hull === '#1c1917' ? '#0f172a' : pal.hull;
      ctx.fillRect(-sw * 0.35, -36, sw * 0.42, 22);
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-sw * 0.35, -36, sw * 0.42, 22);

      // Periscope Pipe
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-sw * 0.18, -36); ctx.lineTo(-sw * 0.18, -58); ctx.lineTo(-sw * 0.08, -58);
      ctx.stroke();
      drawGlowDot(ctx, -sw * 0.07, -58, 3, '#38bdf8');

      // Glass Dome Cockpit over Angler Seat
      ctx.fillStyle = 'rgba(125, 211, 252, 0.32)';
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(4, -18, 20, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Glowing Porthole Windows & Rivet Belt
      for (let p = -2; p <= 2; p++) {
        const px = p * sw * 0.32;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(px, 3, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(px, 3, 4.5, 0, Math.PI * 2); ctx.fill();
      }
      // Nose searchlight housing
      drawGlowDot(ctx, sw * 0.96, 2, 5.5, '#fef08a');

    } else if (pal.hullStyle === 'chinese_junk') {
      // ==========================================
      // EXOTIC HULL: IMPERIAL DRAGON JUNK
      // ==========================================
      const jw = hw * 1.38;
      // Swept Crescent Eastern Hull
      ctx.fillStyle = pal.hull === '#1c1917' ? '#7c2d12' : pal.hull;
      ctx.beginPath();
      ctx.moveTo(-jw * 1.04, -28);
      ctx.quadraticCurveTo(-jw * 0.85, h * 0.85, 0, h * 0.92);
      ctx.quadraticCurveTo(jw * 0.82, h * 0.82, jw * 1.06, -24);
      ctx.quadraticCurveTo(jw * 0.5, -10, 0, -12);
      ctx.quadraticCurveTo(-jw * 0.6, -12, -jw * 1.04, -28);
      ctx.closePath();
      ctx.fill();

      // Gilded Dragon Scales Rail
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-jw * 1.04, -28);
      ctx.quadraticCurveTo(-jw * 0.5, -11, jw * 1.06, -24);
      ctx.stroke();

      // Pagoda Aft Cabin
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(-jw * 0.72, -46, jw * 0.42, 24);
      // Curved Pagoda Roof Eaves
      ctx.fillStyle = pal.trim;
      ctx.beginPath();
      ctx.moveTo(-jw * 0.8, -46);
      ctx.quadraticCurveTo(-jw * 0.51, -58, -jw * 0.22, -46);
      ctx.lineTo(-jw * 0.28, -43);
      ctx.lineTo(-jw * 0.74, -43);
      ctx.closePath();
      ctx.fill();

      // Golden/Jade Imperial Dragon Prow Head
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(jw * 0.98, -22);
      ctx.quadraticCurveTo(jw + 22, -40, jw + 32, -30);
      ctx.quadraticCurveTo(jw + 28, -16, jw + 14, -14);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = pal.trim;
      ctx.beginPath(); ctx.arc(jw + 24, -29, 2.5, 0, Math.PI * 2); ctx.fill();

      // Battened Ribbed Fan Sails (signature horizontal bamboo battens!)
      const jSails = [
        { mx: -jw * 0.16, hTop: -124, wSail: 44, sway: Math.sin(time * 1.1) * 5 },
        { mx: jw * 0.34, hTop: -140, wSail: 54, sway: Math.sin(time * 0.95 + 1) * 7 },
      ];
      for (const s of jSails) {
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4.5;
        ctx.beginPath(); ctx.moveTo(s.mx, -16); ctx.lineTo(s.mx, s.hTop); ctx.stroke();

        const sailTone = pal.sail === 'rgba(255, 251, 235, 0.97)' ? '#b91c1c' : pal.sail;
        ctx.fillStyle = sailTone;
        ctx.strokeStyle = pal.trim;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.mx - 6, s.hTop + 6);
        ctx.quadraticCurveTo(s.mx + s.wSail + s.sway, s.hTop + 18, s.mx + s.wSail * 0.92 + s.sway, -26);
        ctx.lineTo(s.mx - 8, -26);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bamboo Battens across fan sail
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.5;
        for (let b = 0; b < 5; b++) {
          const by = s.hTop + 20 + b * 17;
          ctx.beginPath();
          ctx.moveTo(s.mx - 7, by);
          ctx.lineTo(s.mx + s.wSail * 0.88 + s.sway * 0.6, by - 4);
          ctx.stroke();
        }
      }

      // Hanging Glowing Red Silk Paper Lanterns
      const swayL = Math.sin(time * 2.5) * 2.5;
      for (const lx of [-jw * 0.82, jw * 0.86]) {
        ctx.strokeStyle = pal.trim; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(lx, -34); ctx.lineTo(lx + swayL, -22); ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.ellipse(lx + swayL, -16, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
        drawGlowDot(ctx, lx + swayL, -16, 3.5, '#fde047');
      }

    } else if (pal.hullStyle === 'viking') {
      // ==========================================
      // EXOTIC HULL: FROSTFANG NORSE LONGSHIP
      // ==========================================
      const vw = hw * 1.35;
      // Sleek Sweeping Clinker-Built Longship Hull
      ctx.fillStyle = pal.hull === '#1c1917' ? '#78350f' : pal.hull;
      ctx.beginPath();
      ctx.moveTo(-vw * 0.96, -24);
      ctx.quadraticCurveTo(-vw * 0.72, h * 0.78, 0, h * 0.84);
      ctx.quadraticCurveTo(vw * 0.72, h * 0.78, vw * 0.98, -26);
      ctx.quadraticCurveTo(0, -4, -vw * 0.96, -24);
      ctx.closePath();
      ctx.fill();

      // Clinker plank strake lines
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-vw * 0.88, -8); ctx.quadraticCurveTo(0, 12, vw * 0.88, -8);
      ctx.moveTo(-vw * 0.82, 2); ctx.quadraticCurveTo(0, 22, vw * 0.82, 2);
      ctx.stroke();

      // Stern Dragon-Tail Spiral & Snarling Norse Dragon-Head Stempost
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-vw * 0.94, -22); ctx.quadraticCurveTo(-vw * 1.08, -46, -vw * 0.92, -52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vw * 0.94, -22); ctx.quadraticCurveTo(vw * 1.12, -54, vw * 0.95, -58); ctx.stroke();
      // Carved Dragon Head
      ctx.fillStyle = pal.trim;
      ctx.beginPath();
      ctx.moveTo(vw * 0.92, -62); ctx.lineTo(vw + 24, -56); ctx.lineTo(vw + 14, -46); ctx.lineTo(vw * 0.92, -52); ctx.closePath(); ctx.fill();
      drawGlowDot(ctx, vw + 14, -55, 2.5, '#38bdf8');

      // Row of Painted Norse Round Shields along the gunwale
      for (let s = 0; s < 6; s++) {
        const sx = -vw * 0.62 + s * (vw * 0.25);
        const sy = -6 + Math.abs(s - 2.5) * 0.6;
        ctx.fillStyle = s % 2 === 0 ? '#dc2626' : '#2563eb';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(sx, sy, 9.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
      }

      // Single Grand Central Mast & Wide Striped Norse Square Sail
      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(4, -14); ctx.lineTo(4, -135); ctx.stroke();
      const vBillow = Math.sin(time * 1.2) * 14;
      const sailLeft = -52, sailRight = 60, sailTop = -126, sailBot = -32;
      ctx.fillStyle = pal.sail === 'rgba(255, 251, 235, 0.97)' ? '#f8fafc' : pal.sail;
      ctx.strokeStyle = pal.trim; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sailLeft, sailTop); ctx.lineTo(sailRight, sailTop);
      ctx.quadraticCurveTo(sailRight + vBillow, -78, sailRight - 6, sailBot);
      ctx.quadraticCurveTo(4 + vBillow, sailBot - 8, sailLeft + 6, sailBot);
      ctx.quadraticCurveTo(sailLeft + vBillow * 0.7, -78, sailLeft, sailTop);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Crimson Nordic vertical stripes on square sail
      ctx.fillStyle = 'rgba(220, 38, 38, 0.82)';
      for (let k = -1; k <= 1; k += 2) {
        const sx = 4 + k * 24;
        ctx.fillRect(sx - 6, sailTop + 5, 12, sailBot - sailTop - 14);
      }

    } else if (pal.hullStyle === 'ghost_ship') {
      // ==========================================
      // EXOTIC HULL: FLYING DUTCHMAN SPECTER
      // ==========================================
      const dw = hw * 1.36;
      ctx.save();
      ctx.globalAlpha = 0.86;
      // Ectoplasm Aura Halo
      try {
        const gGrad = ctx.createRadialGradient(0, -10, 15, 0, -10, dw * 1.2);
        gGrad.addColorStop(0, 'rgba(45, 212, 191, 0.25)');
        gGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');
        ctx.fillStyle = gGrad;
        ctx.fillRect(-dw * 1.3, -150, dw * 2.6, 220);
      } catch (e) {}

      // Spectral Hull + Glowing Rib Cage Strakes
      ctx.fillStyle = '#0f292e';
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-dw, -16); ctx.lineTo(-dw * 0.88, h * 0.72);
      ctx.quadraticCurveTo(0, h * 0.96, dw * 0.92, h * 0.6);
      ctx.lineTo(dw * 1.04, -16); ctx.closePath(); ctx.fill(); ctx.stroke();

      for (let r = -3; r <= 3; r++) {
        ctx.strokeStyle = 'rgba(94, 234, 212, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(r * dw * 0.25, -14); ctx.quadraticCurveTo(r * dw * 0.22, 12, r * dw * 0.2, h * 0.65); ctx.stroke();
      }
      // Spectral Stern Lantern & Wisp Flames
      drawGlowDot(ctx, -dw * 0.7, -46, 5.5, '#5eead4');
      drawGlowDot(ctx, dw * 1.04, -22, 4.5, '#5eead4');

      // Masts & Tattered Spectral Sails
      ctx.strokeStyle = '#134e4a'; ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(-dw * 0.34, -18); ctx.lineTo(-dw * 0.36, -120); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dw * 0.24, -18); ctx.lineTo(dw * 0.22, -138); ctx.stroke();

      const gBillow = Math.sin(time * 1.4) * 15;
      ctx.fillStyle = 'rgba(153, 246, 228, 0.36)';
      ctx.strokeStyle = '#2dd4bf'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(dw * 0.22, -134); ctx.lineTo(dw * 0.72, -124);
      ctx.quadraticCurveTo(dw * 0.56 + gBillow, -74, dw * 0.62, -30);
      ctx.lineTo(dw * 0.46, -24); ctx.lineTo(dw * 0.34, -36); ctx.lineTo(dw * 0.22, -26);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();

    } else if (pal.hullStyle === 'steampunk') {
      // ==========================================
      // EXOTIC HULL: AETHER CHRONOS IRONCLAD
      // ==========================================
      const aw = hw * 1.36;
      // Copper & Riveted Ironclad Hull + Ramming Prow
      ctx.fillStyle = pal.hull === '#1c1917' ? '#431407' : pal.hull;
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-aw * 0.96, -16);
      ctx.lineTo(-aw * 0.88, h * 0.72);
      ctx.quadraticCurveTo(0, h * 0.96, aw * 0.94, h * 0.58);
      ctx.lineTo(aw * 1.18, 2);
      ctx.lineTo(aw * 0.98, -16);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Aft Brass Cabin + Rotating Paddlewheel
      ctx.fillStyle = '#292524';
      ctx.fillRect(-aw * 0.72, -38, aw * 0.44, 24);
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
      ctx.strokeRect(-aw * 0.72, -38, aw * 0.44, 24);

      // Animated Spinning Paddlewheel
      const wheelX = -aw * 0.02, wheelY = 6;
      ctx.save();
      ctx.translate(wheelX, wheelY);
      ctx.rotate(time * 2.6);
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.stroke();
      for (let sp = 0; sp < 8; sp++) {
        const ang = (sp / 8) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * 19, Math.sin(ang) * 19); ctx.stroke();
      }
      ctx.restore();

      // Twin Brass Smokestacks + Animated Steam Puffs
      for (let st = 0; st < 2; st++) {
        const sx = -aw * 0.56 + st * 22;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(sx - 5, -72, 10, 36);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(sx - 7, -75, 14, 5);
        for (let p = 0; p < 3; p++) {
          const cycle = (time * 0.85 + st * 0.4 + p * 0.33) % 1;
          ctx.fillStyle = `rgba(226, 232, 240, ${(1 - cycle) * 0.55})`;
          ctx.beginPath();
          ctx.arc(sx - cycle * 26, -80 - cycle * 32, 5 + cycle * 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Forward Tesla Coil Beacon Mast
      ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(aw * 0.52, -16); ctx.lineTo(aw * 0.52, -88); ctx.stroke();
      drawGlowDot(ctx, aw * 0.52, -92, 5.5, '#38bdf8');

    } else if (v >= 8) {
      // ==========================================
      // TIER 8: POSEIDON SOVEREIGN GALLEON
      // ==========================================
      const gw = hw * 1.35;

      try {
        const floodGrad = ctx.createRadialGradient(0, 24, 10, 0, 30, 150);
        floodGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        floodGrad.addColorStop(0.6, 'rgba(30, 58, 138, 0.15)');
        floodGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = floodGrad;
        ctx.beginPath();
        ctx.moveTo(-gw * 0.7, 18);
        ctx.lineTo(-gw * 1.05, 170);
        ctx.lineTo(gw * 1.05, 170);
        ctx.lineTo(gw * 0.7, 18);
        ctx.closePath();
        ctx.fill();
      } catch (e) {}

      // Heavy keel shadow
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-gw * 0.9, h * 0.65);
      ctx.quadraticCurveTo(0, h * 1.05, gw * 0.9, h * 0.55);
      ctx.lineTo(gw * 0.85, h * 0.75);
      ctx.quadraticCurveTo(0, h * 1.15, -gw * 0.85, h * 0.82);
      ctx.closePath();
      ctx.fill();

      // Main Hull (customizable hull paint)
      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.moveTo(-gw, -16);
      ctx.lineTo(-gw * 0.88, h * 0.72);
      ctx.quadraticCurveTo(0, h * 0.98, gw * 0.92, h * 0.62);
      ctx.lineTo(gw * 1.04, -16);
      ctx.closePath();
      ctx.fill();

      // Lower waterline band
      ctx.fillStyle = 'rgba(127, 29, 29, 0.72)';
      ctx.beginPath();
      ctx.moveTo(-gw * 0.93, 3);
      ctx.lineTo(-gw * 0.88, h * 0.72);
      ctx.quadraticCurveTo(0, h * 0.98, gw * 0.92, h * 0.62);
      ctx.lineTo(gw * 0.98, 3);
      ctx.quadraticCurveTo(0, 17, -gw * 0.93, 3);
      ctx.closePath();
      ctx.fill();

      // Gunwale rail & double sheer strakes
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-gw, -16);
      ctx.lineTo(gw * 1.04, -16);
      ctx.stroke();

      ctx.strokeStyle = pal.secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-gw * 0.96, -6);
      ctx.quadraticCurveTo(0, 6, gw * 0.98, -6);
      ctx.moveTo(-gw * 0.94, 1);
      ctx.quadraticCurveTo(0, 12, gw * 0.96, 1);
      ctx.stroke();

      // Cannon port covers with studs
      for (let c = 0; c < 5; c++) {
        const cx = -gw * 0.55 + c * (gw * 0.28);
        ctx.fillStyle = '#27272a';
        ctx.fillRect(cx - 5, 5, 10, 8);
        ctx.strokeStyle = pal.trim;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cx - 5, 5, 10, 8);
        ctx.fillStyle = pal.trim;
        ctx.beginPath();
        ctx.arc(cx, 9, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stern Castle (aft palace)
      ctx.fillStyle = '#292524';
      ctx.fillRect(-gw * 0.72, -44, gw * 0.44, 30);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(-gw * 0.72, -45, gw * 0.44, 4);

      // Stern Castle windows
      for (let w = 0; w < 3; w++) {
        const wx = -gw * 0.66 + w * 13;
        ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
        ctx.fillRect(wx - 2, -36, 13, 18);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(wx, -34, 9, 14);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.strokeRect(wx, -34, 9, 14);
      }

      // Stern Lantern
      drawGlowDot(ctx, -gw * 0.72, -48, 4.5, pal.glow);

      // Ship Wheel
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-gw * 0.2, -26, 10, 0, Math.PI * 2);
      ctx.stroke();
      for (let spoke = 0; spoke < 8; spoke++) {
        const a = (spoke / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(-gw * 0.2, -26);
        ctx.lineTo(-gw * 0.2 + Math.cos(a) * 10, -26 + Math.sin(a) * 10);
        ctx.stroke();
      }
      ctx.fillStyle = pal.trim;
      ctx.beginPath();
      ctx.arc(-gw * 0.2, -26, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Dragon Figurehead & Bowsprit
      ctx.fillStyle = pal.trim;
      ctx.beginPath();
      ctx.moveTo(gw * 0.98, -16);
      ctx.quadraticCurveTo(gw + 25, -28, gw + 35, -22);
      ctx.quadraticCurveTo(gw + 38, -14, gw + 24, -8);
      ctx.lineTo(gw * 0.94, -6);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(gw * 0.88, -14);
      ctx.lineTo(gw + 48, -32);
      ctx.stroke();

      // Standing rigging stays
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-gw * 0.72, -44); ctx.lineTo(-gw * 0.44, -115);
      ctx.moveTo(-gw * 0.44, -115); ctx.lineTo(-10, -145);
      ctx.moveTo(-10, -145); ctx.lineTo(gw * 0.36, -135);
      ctx.moveTo(gw * 0.36, -135); ctx.lineTo(gw + 46, -32);
      ctx.stroke();

      // Triple Masts
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-gw * 0.42, -20); ctx.lineTo(-gw * 0.44, -115); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(-10, -145); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gw * 0.38, -20); ctx.lineTo(gw * 0.36, -135); ctx.stroke();

      const billow1 = Math.sin(time * 1.1) * 12;
      const billow2 = Math.sin(time * 0.9 + 0.8) * 16;
      const billow3 = Math.sin(time * 1.2 + 1.5) * 10;

      // Mizzen Sail
      ctx.fillStyle = pal.sail;
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-gw * 0.44, -110);
      ctx.lineTo(-gw * 0.14, -104);
      ctx.quadraticCurveTo(-gw * 0.22 + billow3, -65, -gw * 0.16, -26);
      ctx.lineTo(-gw * 0.44, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Main Sail
      ctx.beginPath();
      ctx.moveTo(-10, -140);
      ctx.lineTo(gw * 0.32, -132);
      ctx.quadraticCurveTo(gw * 0.14 + billow2, -75, gw * 0.28, -26);
      ctx.lineTo(-10, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Royal Emblem on Mainsail
      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.arc(gw * 0.12, -80, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pal.trim;
      ctx.beginPath();
      ctx.arc(gw * 0.12, -80, 5, 0, Math.PI * 2);
      ctx.fill();

      // Fore Sail
      ctx.fillStyle = pal.sail;
      ctx.beginPath();
      ctx.moveTo(gw * 0.36, -130);
      ctx.lineTo(gw * 0.74, -122);
      ctx.quadraticCurveTo(gw * 0.6 + billow1, -70, gw * 0.68, -26);
      ctx.lineTo(gw * 0.36, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fluttering Masthead Pennant
      const flap = Math.sin(time * 4) * 4;
      ctx.fillStyle = pal.trim;
      ctx.beginPath();
      ctx.moveTo(-10, -153);
      ctx.quadraticCurveTo(-24, -158 + flap, -38, -152 - flap * 0.5);
      ctx.lineTo(-10, -147);
      ctx.closePath();
      ctx.fill();

      // Crow's Nest + Beacon Lantern
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-16, -148, 16, 8);
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-16, -148, 16, 8);
      drawGlowDot(ctx, -10, -150, 4.5, pal.glow);

    } else if (v === 7) {
      // ==========================================
      // TIER 7: MYTHIC CELESTIAL KETCH
      // ==========================================
      const kw = hw * 1.25;

      try {
        const floodGrad = ctx.createRadialGradient(0, 24, 5, 0, 28, 130);
        floodGrad.addColorStop(0, 'rgba(129, 140, 248, 0.4)');
        floodGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.2)');
        floodGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = floodGrad;
        ctx.beginPath();
        ctx.moveTo(-kw * 0.6, 16);
        ctx.lineTo(-kw * 0.9, 140);
        ctx.lineTo(kw * 0.9, 140);
        ctx.lineTo(kw * 0.6, 16);
        ctx.closePath();
        ctx.fill();
      } catch (e) {}

      // Astral Crystalline Hull
      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.moveTo(-kw, -14);
      ctx.lineTo(-kw * 0.9, h * 0.68);
      ctx.quadraticCurveTo(0, h * 0.96, kw * 0.92, h * 0.6);
      ctx.lineTo(kw * 1.02, -14);
      ctx.closePath();
      ctx.fill();

      // Runic Celestial Waterline Stripe (soft outer halo + core)
      ctx.strokeStyle = pal.trim;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(-kw * 0.94, -3);
      ctx.quadraticCurveTo(0, 8, kw * 0.96, -3);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-kw * 0.94, -3);
      ctx.quadraticCurveTo(0, 8, kw * 0.96, -3);
      ctx.stroke();

      // Crystalline Gunwale Rim
      ctx.strokeStyle = pal.secondary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-kw, -14);
      ctx.lineTo(kw * 1.02, -14);
      ctx.stroke();

      // Aft Observation Deck
      ctx.fillStyle = '#312e81';
      ctx.fillRect(-kw * 0.55, -28, kw * 0.36, 18);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(-kw * 0.55, -29, kw * 0.36, 3.5);
      drawGlowDot(ctx, -kw * 0.44, -18, 4, '#e0e7ff');
      drawGlowDot(ctx, -kw * 0.3, -18, 4, '#e0e7ff');

      // Star-metal Ship Wheel
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-kw * 0.14, -22, 9, 0, Math.PI * 2);
      ctx.stroke();
      for (let spoke = 0; spoke < 6; spoke++) {
        const a = (spoke / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(-kw * 0.14, -22);
        ctx.lineTo(-kw * 0.14 + Math.cos(a) * 9, -22 + Math.sin(a) * 9);
        ctx.stroke();
      }
      ctx.fillStyle = pal.glow;
      ctx.beginPath();
      ctx.arc(-kw * 0.14, -22, 3, 0, Math.PI * 2);
      ctx.fill();

      // Refractive Crystal Bowsprit & Rigging
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(kw * 0.88, -14);
      ctx.lineTo(kw + 38, -28);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(199, 210, 254, 0.35)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-kw * 0.55, -28); ctx.lineTo(-18, -112);
      ctx.moveTo(-18, -112); ctx.lineTo(24, -132);
      ctx.moveTo(24, -132); ctx.lineTo(kw + 36, -28);
      ctx.stroke();

      // Dual Astral Masts
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(-16, -18); ctx.lineTo(-18, -112); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(22, -20); ctx.lineTo(24, -132); ctx.stroke();

      const kBillow1 = Math.sin(time * 1.1) * 12;
      const kBillow2 = Math.sin(time * 0.9 + 0.8) * 16;

      ctx.fillStyle = pal.sail;
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-18, -106);
      ctx.lineTo(18, -100);
      ctx.quadraticCurveTo(0 + kBillow1, -62, 16, -24);
      ctx.lineTo(-18, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(24, -128);
      ctx.lineTo(kw * 0.72, -120);
      ctx.quadraticCurveTo(kw * 0.86 + kBillow2, -72, kw * 0.68, -26);
      ctx.lineTo(24, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Constellation Sigil on Main Sail
      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.arc(kw * 0.44, -75, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(kw * 0.44, -75, 3, 0, Math.PI * 2);
      ctx.fill();

      // Crow's Nest & Beacon
      ctx.fillStyle = '#312e81';
      ctx.fillRect(18, -134, 13, 7);
      drawGlowDot(ctx, -18, -114, 4.5, pal.glow);

    } else if (v === 6) {
      // ==========================================
      // TIER 6: GILDED BRIGANTINE
      // ==========================================
      const bw = hw * 1.2;

      ctx.fillStyle = '#090f1d';
      ctx.beginPath();
      ctx.moveTo(-bw * 0.88, h * 0.66);
      ctx.quadraticCurveTo(0, h * 1.0, bw * 0.9, h * 0.58);
      ctx.lineTo(bw * 0.85, h * 0.72);
      ctx.quadraticCurveTo(0, h * 1.08, -bw * 0.84, h * 0.78);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.moveTo(-bw, -14);
      ctx.lineTo(-bw * 0.88, h * 0.7);
      ctx.quadraticCurveTo(0, h * 0.95, bw * 0.92, h * 0.62);
      ctx.lineTo(bw * 1.02, -14);
      ctx.closePath();
      ctx.fill();

      // Double Gilded Waterline Trim
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-bw * 0.94, -4);
      ctx.quadraticCurveTo(0, 7, bw * 0.96, -3);
      ctx.moveTo(-bw * 0.92, 1);
      ctx.quadraticCurveTo(0, 12, bw * 0.94, 2);
      ctx.stroke();

      // Gunwale rim
      ctx.strokeStyle = pal.secondary;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-bw, -14);
      ctx.lineTo(bw * 1.02, -14);
      ctx.stroke();

      // Raised Aft Quarterdeck & Cabin
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-bw * 0.52, -26, bw * 0.38, 16);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(-bw * 0.52, -27, bw * 0.38, 3.5);
      drawGlowDot(ctx, -bw * 0.4, -17, 3.5, '#fbbf24');
      drawGlowDot(ctx, -bw * 0.26, -17, 3.5, '#fbbf24');

      // Brass Ship Wheel
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-bw * 0.1, -20, 8.5, 0, Math.PI * 2);
      ctx.stroke();
      for (let spoke = 0; spoke < 8; spoke++) {
        const a = (spoke / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(-bw * 0.1, -20);
        ctx.lineTo(-bw * 0.1 + Math.cos(a) * 8.5, -20 + Math.sin(a) * 8.5);
        ctx.stroke();
      }
      ctx.fillStyle = pal.trim;
      ctx.beginPath();
      ctx.arc(-bw * 0.1, -20, 3, 0, Math.PI * 2);
      ctx.fill();

      // Gilded Bowsprit + Gold Figurine
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(bw * 0.88, -14);
      ctx.lineTo(bw + 36, -26);
      ctx.stroke();
      ctx.fillStyle = pal.trim;
      ctx.beginPath();
      ctx.arc(bw + 34, -26, 4, 0, Math.PI * 2);
      ctx.fill();

      // Rigging
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.32)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-bw * 0.52, -26); ctx.lineTo(-20, -108);
      ctx.moveTo(-20, -108); ctx.lineTo(22, -128);
      ctx.moveTo(22, -128); ctx.lineTo(bw + 34, -26);
      ctx.stroke();

      // Dual Masts
      ctx.strokeStyle = '#5c2d0a';
      ctx.lineWidth = 4.8;
      ctx.beginPath(); ctx.moveTo(-18, -18); ctx.lineTo(-20, -108); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(20, -20); ctx.lineTo(22, -128); ctx.stroke();

      const bBillow1 = Math.sin(time * 1.1) * 12;
      const bBillow2 = Math.sin(time * 0.9 + 0.8) * 16;

      ctx.fillStyle = pal.sail;
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-20, -102);
      ctx.lineTo(18, -96);
      ctx.quadraticCurveTo(0 + bBillow1, -60, 16, -24);
      ctx.lineTo(-20, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(22, -124);
      ctx.lineTo(bw * 0.72, -116);
      ctx.quadraticCurveTo(bw * 0.84 + bBillow2, -70, bw * 0.66, -26);
      ctx.lineTo(22, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crow's Nest + Lantern
      ctx.fillStyle = '#78350f';
      ctx.fillRect(16, -130, 13, 7);
      drawGlowDot(ctx, -20, -110, 4.5, pal.glow);

    } else if (v === 5) {
      // ==========================================
      // TIER 5: GRAND SCHOONER
      // ==========================================
      const sw = hw * 1.15;

      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.moveTo(-sw, -12);
      ctx.lineTo(-sw * 0.9, h * 0.7);
      ctx.quadraticCurveTo(0, h * 0.95, sw * 0.92, h * 0.62);
      ctx.lineTo(sw, -12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#5c2d0a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-sw * 0.94, -4);
      ctx.quadraticCurveTo(0, 8, sw * 0.96, -2);
      ctx.stroke();

      // Wide rear deck
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-sw * 0.64, -18, sw * 1.18, 10);

      // Cabin structure
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-26, -32, 52, 18);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(-26, -33, 52, 4);

      drawGlowDot(ctx, -10, -22, 4, '#fbbf24');
      drawGlowDot(ctx, 12, -22, 4, '#fbbf24');

      // Brass ship wheel on deck
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-34, -22, 8, 0, Math.PI * 2);
      ctx.stroke();
      for (let spoke = 0; spoke < 8; spoke++) {
        const a = (spoke / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(-34, -22);
        ctx.lineTo(-34 + Math.cos(a) * 8, -22 + Math.sin(a) * 8);
        ctx.stroke();
      }
      ctx.fillStyle = pal.trim;
      ctx.beginPath();
      ctx.arc(-34, -22, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Standing stays
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-22, -105); ctx.lineTo(20, -130);
      ctx.moveTo(20, -130); ctx.lineTo(sw + 34, -30);
      ctx.stroke();

      // Foremast & Mainmast
      ctx.strokeStyle = '#5c2d0a';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-20, -18); ctx.lineTo(-22, -105); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(18, -22); ctx.lineTo(20, -130); ctx.stroke();

      const sBillow1 = Math.sin(time * 1.1) * 12;
      ctx.fillStyle = pal.sail;
      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-22, -100);
      ctx.lineTo(16, -95);
      ctx.quadraticCurveTo(0 + sBillow1, -60, 14, -24);
      ctx.lineTo(-22, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const sBillow2 = Math.sin(time * 0.9 + 0.8) * 18;
      ctx.beginPath();
      ctx.moveTo(18, -125);
      ctx.lineTo(sw * 0.7, -118);
      ctx.quadraticCurveTo(sw * 0.85 + sBillow2, -70, sw * 0.65, -26);
      ctx.lineTo(18, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.fillRect(14, -132, 14, 8);

      ctx.strokeStyle = '#5c2d0a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sw * 0.88, -14);
      ctx.lineTo(sw + 36, -30);
      ctx.stroke();

      drawGlowDot(ctx, -22, -107, 4.5, pal.glow);

    } else if (v === 4) {
      // ==========================================
      // TIER 4: EXPEDITION TRAWLER
      // ==========================================
      const tw = hw * 1.08;

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-tw * 0.56, h * 0.65);
      ctx.quadraticCurveTo(0, h * 0.95, tw * 0.58, h * 0.55);
      ctx.lineTo(tw * 0.54, h * 0.75);
      ctx.quadraticCurveTo(0, h * 1.05, -tw * 0.52, h * 0.78);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.moveTo(-tw * 0.58, -12);
      ctx.lineTo(-tw * 0.52, h * 0.65);
      ctx.quadraticCurveTo(0, h * 0.85, tw * 0.54, h * 0.55);
      ctx.lineTo(tw * 0.6, -12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-tw * 0.54, 2);
      ctx.quadraticCurveTo(0, 14, tw * 0.56, 2);
      ctx.stroke();

      // Safety Gunwale Railings
      ctx.strokeStyle = pal.secondary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-tw * 0.58, -12);
      ctx.lineTo(tw * 0.6, -12);
      ctx.stroke();

      // Raised Aft Work Deck
      ctx.fillStyle = '#334155';
      ctx.fillRect(-tw * 0.54, -15, tw * 0.4, 5);

      // Forward Wheelhouse
      ctx.fillStyle = pal.sail;
      ctx.fillRect(-16, -34, 44, 22);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(-16, -35, 44, 4);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-12, -28, 15, 10);
      ctx.fillRect(7, -28, 15, 10);

      drawGlowDot(ctx, -6, -37, 3.8, pal.glow);
      drawGlowDot(ctx, 14, -37, 3.8, pal.glow);

      // Stern Gantry A-Frame Hoist
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-tw * 0.54, -12);
      ctx.lineTo(-tw * 0.46, -34);
      ctx.lineTo(-tw * 0.36, -12);
      ctx.stroke();

      // Radar Mast
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(22, -34); ctx.lineTo(22, -48);
      ctx.arc(22, -50, 4, 0, Math.PI * 2);
      ctx.stroke();

    } else if (v === 3) {
      // ==========================================
      // TIER 3: HARBOR CUTTER
      // ==========================================
      const cw = hw * 1.04;

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-cw * 0.48, h * 0.65);
      ctx.quadraticCurveTo(0, h * 0.95, cw * 0.5, h * 0.55);
      ctx.lineTo(cw * 0.46, h * 0.72);
      ctx.quadraticCurveTo(0, h * 1.02, -cw * 0.44, h * 0.75);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.moveTo(-cw * 0.54, -10);
      ctx.lineTo(-cw * 0.46, h * 0.65);
      ctx.quadraticCurveTo(0, h * 0.85, cw * 0.48, h * 0.55);
      ctx.lineTo(cw * 0.56, -10);
      ctx.closePath();
      ctx.fill();

      // Gunwale rim + waterline trim
      ctx.strokeStyle = pal.secondary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-cw * 0.54, -10);
      ctx.lineTo(cw * 0.56, -10);
      ctx.stroke();

      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-cw * 0.5, 2);
      ctx.quadraticCurveTo(0, 14, cw * 0.51, 1);
      ctx.stroke();

      // Cabin house (cleanly framed center)
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(-18, -24, 38, 16);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(-18, -24, 38, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-13, -19, 11, 8);
      ctx.fillRect(3, -19, 11, 8);

      // Shade canopy roof & supports
      ctx.fillStyle = pal.sail;
      ctx.fillRect(-cw * 0.44, -32, cw * 0.88, 7);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-cw * 0.36, -10); ctx.lineTo(-cw * 0.36, -32);
      ctx.moveTo(cw * 0.36, -10); ctx.lineTo(cw * 0.36, -32);
      ctx.stroke();

    } else if (v === 2) {
      // ==========================================
      // TIER 2: COASTAL DORY
      // ==========================================
      const dw = hw * 1.0;

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-dw * 0.44, h * 0.65);
      ctx.quadraticCurveTo(0, h * 0.95, dw * 0.46, h * 0.55);
      ctx.lineTo(dw * 0.42, h * 0.72);
      ctx.quadraticCurveTo(0, h * 1.02, -dw * 0.4, h * 0.75);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.moveTo(-dw * 0.52, -10);
      ctx.lineTo(-dw * 0.44, h * 0.65);
      ctx.quadraticCurveTo(0, h * 0.85, dw * 0.46, h * 0.55);
      ctx.lineTo(dw * 0.54, -10);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = pal.secondary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-dw * 0.52, -10);
      ctx.lineTo(dw * 0.54, -10);
      ctx.stroke();

      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-dw * 0.48, 2);
      ctx.quadraticCurveTo(0, 14, dw * 0.49, 1);
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.fillRect(-26, -13, 52, 6);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(-dw * 0.25, -10, 5, 3);
      ctx.fillRect(dw * 0.25, -10, 5, 3);

    } else if (v === 1) {
      // ==========================================
      // TIER 1: REINFORCED SKIFF
      // ==========================================
      const rw = hw * 0.96;

      ctx.fillStyle = '#271004';
      ctx.beginPath();
      ctx.moveTo(-rw * 0.42, h * 0.58);
      ctx.quadraticCurveTo(0, h * 0.88, rw * 0.44, h * 0.48);
      ctx.lineTo(rw * 0.42, h * 0.58);
      ctx.quadraticCurveTo(0, h * 0.98, -rw * 0.4, h * 0.68);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.moveTo(-rw * 0.5, -8);
      ctx.lineTo(-rw * 0.42, h * 0.6);
      ctx.quadraticCurveTo(0, h * 0.8, rw * 0.44, h * 0.5);
      ctx.lineTo(rw * 0.52, -8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-rw * 0.46, 0);
      ctx.quadraticCurveTo(0, 10, rw * 0.48, 0);
      ctx.moveTo(-rw * 0.44, 7);
      ctx.quadraticCurveTo(0, 17, rw * 0.46, 6);
      ctx.stroke();

      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-rw * 0.5, -8);
      ctx.lineTo(rw * 0.52, -8);
      ctx.stroke();

      ctx.strokeStyle = pal.trim;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-rw * 0.46, -2);
      ctx.quadraticCurveTo(0, 5, rw * 0.48, -2);
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.fillRect(-26, -9, 52, 7);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(-28, -12, 8, 4);
      ctx.fillRect(20, -12, 8, 4);
      ctx.fillRect(rw * 0.44, -11, 7, 3);

    } else {
      // ==========================================
      // TIER 0: WEATHERED DINGHY (Starter)
      // ==========================================
      const ow = hw * 0.92;

      ctx.fillStyle = '#271004';
      ctx.beginPath();
      ctx.moveTo(-ow * 0.42, h * 0.58);
      ctx.quadraticCurveTo(0, h * 0.88, ow * 0.44, h * 0.48);
      ctx.lineTo(ow * 0.42, h * 0.58);
      ctx.quadraticCurveTo(0, h * 0.98, -ow * 0.4, h * 0.68);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pal.hull;
      ctx.beginPath();
      ctx.moveTo(-ow * 0.5, -8);
      ctx.lineTo(-ow * 0.42, h * 0.6);
      ctx.quadraticCurveTo(0, h * 0.8, ow * 0.44, h * 0.5);
      ctx.lineTo(ow * 0.52, -8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-ow * 0.46, 0);
      ctx.quadraticCurveTo(0, 10, ow * 0.48, 0);
      ctx.moveTo(-ow * 0.44, 7);
      ctx.quadraticCurveTo(0, 17, ow * 0.46, 6);
      ctx.stroke();

      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-ow * 0.5, -8);
      ctx.lineTo(ow * 0.52, -8);
      ctx.stroke();

      if (pal.hasCustomAccent) {
        ctx.strokeStyle = pal.trim;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-ow * 0.46, -2);
        ctx.quadraticCurveTo(0, 5, ow * 0.48, -2);
        ctx.stroke();
      }

      ctx.fillStyle = '#78350f';
      ctx.fillRect(-24, -12, 48, 6);
      ctx.fillStyle = pal.trim;
      ctx.fillRect(-ow * 0.25, -10, 4, 3);
      ctx.fillRect(ow * 0.25, -10, 4, 3);
    }

    // Apply dramatic Ship Finish overlay FX across any tier or exotic hull
    applyShipFinishOverlay(ctx, pal, effectiveSpan, h, time);

    // Lantern for tiers 0 through 4
    if (pal.hullStyle === 'standard' && v < 5) {
      const lanternX = v >= 3 ? 16 : 0;
      const lanternY = v >= 3 ? -24 : -24;
      drawGlowDot(ctx, lanternX, lanternY, 3.8, pal.glow);
    }
  } catch (err) {
    console.error('Fatal drawVesselHull error:', err);
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-hw, -8);
    ctx.lineTo(-hw * 0.84, h * 0.6);
    ctx.quadraticCurveTo(0, h * 0.8, hw * 0.88, h * 0.5);
    ctx.lineTo(hw, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.stroke();
  } finally {
    ctx.restore();
  }
}

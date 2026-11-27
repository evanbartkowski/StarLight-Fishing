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
export function getVesselLayout(vessel = 0, bW = 140, bH = 40) {
  const v = Math.max(0, Math.min(8, Math.floor(Number(vessel) || 0)));
  const hw = (bW > 0 ? bW : 140) * 0.5;
  const scale = hw / 70;

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
  let partColors = customColors || null;

  if (typeof skinOrOpts === 'string') {
    skinColor = skinOrOpts;
  } else if (skinOrOpts && typeof skinOrOpts === 'object') {
    skinColor = skinOrOpts.skinColor || skinOrOpts.color || null;
    skinMeta = skinOrOpts.skinMeta || null;
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
  };
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

  ctx.save();
  try {
    if (v >= 8) {
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

    // Lantern for tiers 0 through 4
    if (v < 5) {
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

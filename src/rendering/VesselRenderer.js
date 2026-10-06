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
 * Renders the boat hull, deck structures, masts, sails, and trim for any vessel tier (0 to 8+).
 * Coordinates are centered at (0, 0) relative to the boat transform.
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} vessel - Vessel tier integer (0 to 8)
 * @param {number} bW - Boat width
 * @param {number} bH - Boat height
 * @param {number} time - Animation wave timer
 * @param {string|null} skinColor - Optional cosmetic hull stripe color
 */
export function drawVesselHull(ctx, vessel = 0, bW = 140, bH = 40, time = 0, skinColor = null) {
  const v = Math.max(0, Math.min(8, Math.floor(Number(vessel) || 0)));
  const hw = (bW > 0 ? bW : 140) * 0.5;
  const h = (bH > 0 ? bH : 40);

  ctx.save();

  if (v >= 8) {
    // ==========================================
    // TIER 8: POSEIDON SOVEREIGN GALLEON
    // ==========================================
    const gw = hw * 1.35;

    // Underwater majestic blue glow
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

    // Imperial dark mahogany & obsidian hull
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(-gw, -16);
    ctx.lineTo(-gw * 0.88, h * 0.72);
    ctx.quadraticCurveTo(0, h * 0.98, gw * 0.92, h * 0.62);
    ctx.lineTo(gw * 1.04, -16);
    ctx.closePath();
    ctx.fill();

    // Lower crimson waterline band
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(-gw * 0.93, 2);
    ctx.lineTo(-gw * 0.88, h * 0.72);
    ctx.quadraticCurveTo(0, h * 0.98, gw * 0.92, h * 0.62);
    ctx.lineTo(gw * 0.98, 2);
    ctx.quadraticCurveTo(0, 16, -gw * 0.93, 2);
    ctx.closePath();
    ctx.fill();

    // Gilded gunwale rim & double gold sheer strakes
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-gw * 0.96, -6);
    ctx.quadraticCurveTo(0, 6, gw * 0.98, -6);
    ctx.moveTo(-gw * 0.94, 1);
    ctx.quadraticCurveTo(0, 12, gw * 0.96, 1);
    ctx.stroke();

    // Cannon port covers with lion-head gold studs
    for (let c = 0; c < 5; c++) {
      const cx = -gw * 0.55 + c * (gw * 0.28);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(cx - 5, 5, 10, 8);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - 5, 5, 10, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, 9, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // High Multi-Tier Stern Castle (aft palace)
    ctx.fillStyle = '#292524';
    ctx.fillRect(-gw * 0.72, -44, gw * 0.44, 30);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-gw * 0.7, -42, gw * 0.4, 4);

    // Stern Castle stained-glass windows
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    for (let w = 0; w < 3; w++) {
      const wx = -gw * 0.66 + w * 14;
      ctx.fillRect(wx, -34, 9, 14);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.strokeRect(wx, -34, 9, 14);
    }
    ctx.shadowBlur = 0;

    // Ornate Golden Stern Lanterns
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(-gw * 0.72, -48, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Imperial Gold Ship Wheel
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-gw * 0.22, -26, 10, 0, Math.PI * 2);
    ctx.stroke();
    for (let spoke = 0; spoke < 8; spoke++) {
      const a = (spoke / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(-gw * 0.22, -26);
      ctx.lineTo(-gw * 0.22 + Math.cos(a) * 10, -26 + Math.sin(a) * 10);
      ctx.stroke();
    }
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(-gw * 0.22, -26, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Gilded Sea-Serpent / Dragon Figurehead at Bow
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(gw * 0.98, -16);
    ctx.quadraticCurveTo(gw + 25, -28, gw + 35, -22);
    ctx.quadraticCurveTo(gw + 38, -14, gw + 24, -8);
    ctx.lineTo(gw * 0.94, -6);
    ctx.closePath();
    ctx.fill();

    // Bowsprit spar reaching forward
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(gw * 0.88, -14);
    ctx.lineTo(gw + 48, -32);
    ctx.stroke();

    // Triple Towering Masts: Foremast, Mainmast, Mizzenmast
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 5;
    // Mizzenmast
    ctx.beginPath(); ctx.moveTo(-gw * 0.42, -20); ctx.lineTo(-gw * 0.44, -115); ctx.stroke();
    // Foremast
    ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(-10, -145); ctx.stroke();
    // Mainmast
    ctx.beginPath(); ctx.moveTo(gw * 0.38, -20); ctx.lineTo(gw * 0.36, -135); ctx.stroke();

    // Billowing Royal Crimson & Gold Sails
    const billow1 = Math.sin(time * 1.1) * 12;
    const billow2 = Math.sin(time * 0.9 + 0.8) * 16;
    const billow3 = Math.sin(time * 1.2 + 1.5) * 10;

    // Mizzen Sail
    ctx.fillStyle = 'rgba(254, 243, 199, 0.94)';
    ctx.beginPath();
    ctx.moveTo(-gw * 0.44, -110);
    ctx.lineTo(-gw * 0.14, -104);
    ctx.quadraticCurveTo(-gw * 0.22 + billow3, -65, -gw * 0.16, -26);
    ctx.lineTo(-gw * 0.44, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Main Sail (tallest)
    ctx.fillStyle = 'rgba(255, 251, 235, 0.96)';
    ctx.beginPath();
    ctx.moveTo(-10, -140);
    ctx.lineTo(gw * 0.32, -132);
    ctx.quadraticCurveTo(gw * 0.14 + billow2, -75, gw * 0.28, -26);
    ctx.lineTo(-10, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Royal Crimson Crest Banner on Mainsail
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(gw * 0.12, -80, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(gw * 0.12, -80, 5, 0, Math.PI * 2);
    ctx.fill();

    // Fore Sail
    ctx.fillStyle = 'rgba(254, 243, 199, 0.94)';
    ctx.beginPath();
    ctx.moveTo(gw * 0.36, -130);
    ctx.lineTo(gw * 0.74, -122);
    ctx.quadraticCurveTo(gw * 0.6 + billow1, -70, gw * 0.68, -26);
    ctx.lineTo(gw * 0.36, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crow's Nest Lookout on Mainmast
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-16, -148, 16, 8);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-16, -148, 16, 8);

    // Masthead Beacon Lantern
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(-10, -150, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  } else if (v === 7) {
    // ==========================================
    // TIER 7: MYTHIC CELESTIAL KETCH
    // ==========================================
    const kw = hw * 1.25;

    // Arcane cyan/indigo ethereal waterline floodlight
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

    // Astral Crystalline Hull (#1e1b4b / #312e81)
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(-kw, -14);
    ctx.lineTo(-kw * 0.9, h * 0.68);
    ctx.quadraticCurveTo(0, h * 0.96, kw * 0.92, h * 0.6);
    ctx.lineTo(kw * 1.02, -14);
    ctx.closePath();
    ctx.fill();

    // Runic Celestial Waterline Stripe (Glowing Cyan)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-kw * 0.94, -3);
    ctx.quadraticCurveTo(0, 8, kw * 0.96, -3);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Crystalline Gunwale Rim
    ctx.strokeStyle = '#c7d2fe';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Aft Observation Deck with Starlight Windows
    ctx.fillStyle = '#312e81';
    ctx.fillRect(-kw * 0.55, -28, kw * 0.36, 18);
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(-kw * 0.53, -27, kw * 0.32, 3);
    ctx.fillStyle = '#e0e7ff';
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-kw * 0.44, -18, 4, 0, Math.PI * 2);
    ctx.arc(-kw * 0.3, -18, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Star-metal Celestial Ship Wheel
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(-kw * 0.15, -22, 9, 0, Math.PI * 2);
    ctx.stroke();
    for (let spoke = 0; spoke < 6; spoke++) {
      const a = (spoke / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(-kw * 0.15, -22);
      ctx.lineTo(-kw * 0.15 + Math.cos(a) * 9, -22 + Math.sin(a) * 9);
      ctx.stroke();
    }
    // Levitating Sapphire Core
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(-kw * 0.15, -22, 3, 0, Math.PI * 2);
    ctx.fill();

    // Refractive Crystal Bowsprit
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(kw * 0.88, -14);
    ctx.lineTo(kw + 38, -28);
    ctx.stroke();

    // Dual Astral Masts
    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(-16, -18); ctx.lineTo(-18, -112); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(22, -20); ctx.lineTo(24, -132); ctx.stroke();

    // Billowing Starlight Canvas Sails (Semi-translucent with stardust glints)
    const kBillow1 = Math.sin(time * 1.1) * 12;
    const kBillow2 = Math.sin(time * 0.9 + 0.8) * 16;

    ctx.fillStyle = 'rgba(224, 231, 255, 0.92)';
    ctx.beginPath();
    ctx.moveTo(-18, -106);
    ctx.lineTo(18, -100);
    ctx.quadraticCurveTo(0 + kBillow1, -62, 16, -24);
    ctx.lineTo(-18, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(238, 242, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(24, -128);
    ctx.lineTo(kw * 0.72, -120);
    ctx.quadraticCurveTo(kw * 0.86 + kBillow2, -72, kw * 0.68, -26);
    ctx.lineTo(24, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Arcane Star Constellation Sigil on Main Sail
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(kw * 0.44, -75, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(kw * 0.44, -75, 3, 0, Math.PI * 2);
    ctx.fill();

    // Crow's Nest
    ctx.fillStyle = '#312e81';
    ctx.fillRect(18, -134, 13, 7);

    // Glowing Azure Arcane Beacon Lantern
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(-18, -114, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  } else if (v === 6) {
    // ==========================================
    // TIER 6: GILDED BRIGANTINE
    // ==========================================
    const bw = hw * 1.2;

    // Deep Midnight Royal Navy Hull (#0a192f) with Golden Carvings
    ctx.fillStyle = '#0a192f';
    ctx.beginPath();
    ctx.moveTo(-bw, -14);
    ctx.lineTo(-bw * 0.88, h * 0.7);
    ctx.quadraticCurveTo(0, h * 0.95, bw * 0.92, h * 0.62);
    ctx.lineTo(bw * 1.02, -14);
    ctx.closePath();
    ctx.fill();

    // Triple Gilded Gold Leaf Waterline Trim
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-bw * 0.94, -4);
    ctx.quadraticCurveTo(0, 7, bw * 0.96, -3);
    ctx.moveTo(-bw * 0.92, 1);
    ctx.quadraticCurveTo(0, 12, bw * 0.94, 2);
    ctx.stroke();

    // Gunwale rim
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3.2;
    ctx.stroke();

    // Raised Aft Quarterdeck & Cabin
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-bw * 0.52, -26, bw * 0.38, 16);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-bw * 0.5, -25, bw * 0.34, 3);

    // Gold-rimmed portholes
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-bw * 0.4, -17, 3.5, 0, Math.PI * 2);
    ctx.arc(-bw * 0.26, -17, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Polished Brass Ship Wheel
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(-bw * 0.12, -20, 8.5, 0, Math.PI * 2);
    ctx.stroke();
    for (let spoke = 0; spoke < 8; spoke++) {
      const a = (spoke / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(-bw * 0.12, -20);
      ctx.lineTo(-bw * 0.12 + Math.cos(a) * 8.5, -20 + Math.sin(a) * 8.5);
      ctx.stroke();
    }
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(-bw * 0.12, -20, 3, 0, Math.PI * 2);
    ctx.fill();

    // Gilded Bowsprit Spar with Gold Lion Figurine
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(bw * 0.88, -14);
    ctx.lineTo(bw + 36, -26);
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(bw + 34, -26, 4, 0, Math.PI * 2);
    ctx.fill();

    // Dual Masts (Brigantine configuration)
    ctx.strokeStyle = '#5c2d0a';
    ctx.lineWidth = 4.8;
    ctx.beginPath(); ctx.moveTo(-18, -18); ctx.lineTo(-20, -108); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, -20); ctx.lineTo(22, -128); ctx.stroke();

    // Billowing Canvas Sails with Gold Trim
    const bBillow1 = Math.sin(time * 1.1) * 12;
    const bBillow2 = Math.sin(time * 0.9 + 0.8) * 16;

    ctx.fillStyle = 'rgba(254, 249, 195, 0.95)';
    ctx.beginPath();
    ctx.moveTo(-20, -102);
    ctx.lineTo(18, -96);
    ctx.quadraticCurveTo(0 + bBillow1, -60, 16, -24);
    ctx.lineTo(-20, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 251, 235, 0.97)';
    ctx.beginPath();
    ctx.moveTo(22, -124);
    ctx.lineTo(bw * 0.72, -116);
    ctx.quadraticCurveTo(bw * 0.84 + bBillow2, -70, bw * 0.66, -26);
    ctx.lineTo(22, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crow's Nest
    ctx.fillStyle = '#78350f';
    ctx.fillRect(16, -130, 13, 7);

    // Golden Foremast Lantern
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(-20, -110, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  } else if (v === 5) {
    // ==========================================
    // TIER 5: GRAND SCHOONER
    // ==========================================
    const sw = hw * 1.15;

    // Dark mahogany hull
    ctx.fillStyle = '#3b1a06';
    ctx.beginPath();
    ctx.moveTo(-sw, -12);
    ctx.lineTo(-sw * 0.9, h * 0.7);
    ctx.quadraticCurveTo(0, h * 0.95, sw * 0.92, h * 0.62);
    ctx.lineTo(sw, -12);
    ctx.closePath();
    ctx.fill();

    // Hull planks accent
    ctx.strokeStyle = '#5c2d0a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Brass trim
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-sw * 0.94, -4);
    ctx.quadraticCurveTo(0, 8, sw * 0.96, -2);
    ctx.stroke();

    // Wide rear deck
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-sw * 0.55, -18, sw * 1.1, 10);

    // Cabin structure
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-28, -32, 56, 18);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-24, -30, 48, 4);

    // Cabin windows
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-12, -22, 4, 0, Math.PI * 2);
    ctx.arc(12, -22, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Brass ship wheel on deck
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-38, -22, 9, 0, Math.PI * 2);
    ctx.stroke();
    for (let spoke = 0; spoke < 8; spoke++) {
      const a = (spoke / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(-38, -22);
      ctx.lineTo(-38 + Math.cos(a) * 9, -22 + Math.sin(a) * 9);
      ctx.stroke();
    }
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(-38, -22, 3, 0, Math.PI * 2);
    ctx.fill();

    // Foremast & Mainmast
    ctx.strokeStyle = '#5c2d0a';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-20, -18); ctx.lineTo(-22, -105); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, -22); ctx.lineTo(20, -130); ctx.stroke();

    // Fore sail
    const sBillow1 = Math.sin(time * 1.1) * 12;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.92)';
    ctx.beginPath();
    ctx.moveTo(-22, -100);
    ctx.lineTo(16, -95);
    ctx.quadraticCurveTo(0 + sBillow1, -60, 14, -24);
    ctx.lineTo(-22, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Main sail
    const sBillow2 = Math.sin(time * 0.9 + 0.8) * 18;
    ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
    ctx.beginPath();
    ctx.moveTo(18, -125);
    ctx.lineTo(sw * 0.7, -118);
    ctx.quadraticCurveTo(sw * 0.85 + sBillow2, -70, sw * 0.65, -26);
    ctx.lineTo(18, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crow's nest
    ctx.fillStyle = '#78350f';
    ctx.fillRect(14, -132, 14, 8);

    // Bowsprit spar
    ctx.strokeStyle = '#5c2d0a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sw * 0.88, -14);
    ctx.lineTo(sw + 36, -30);
    ctx.stroke();

    // Lantern on foremast
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(-22, -107, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  } else if (v === 4) {
    // ==========================================
    // TIER 4: EXPEDITION TRAWLER
    // ==========================================
    const tw = hw * 1.08;

    // Heavy Trawler Keel & Lower Hull
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-tw * 0.52, h * 0.65);
    ctx.quadraticCurveTo(0, h * 0.95, tw * 0.54, h * 0.55);
    ctx.lineTo(tw * 0.5, h * 0.75);
    ctx.quadraticCurveTo(0, h * 1.05, -tw * 0.48, h * 0.78);
    ctx.closePath();
    ctx.fill();

    // Sturdy Steel/Navy Hull (#1e293b with #0284c7 waterline band)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-tw * 0.55, -12);
    ctx.lineTo(-tw * 0.5, h * 0.65);
    ctx.quadraticCurveTo(0, h * 0.85, tw * 0.52, h * 0.55);
    ctx.lineTo(tw * 0.58, -12);
    ctx.closePath();
    ctx.fill();

    // Waterline band
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-tw * 0.52, 2);
    ctx.quadraticCurveTo(0, 14, tw * 0.54, 2);
    ctx.stroke();

    // Safety Gunwale Railings
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Forward Wheelhouse with illuminated cabin windows
    ctx.fillStyle = '#334155';
    ctx.fillRect(-18, -34, 46, 22);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-18, -34, 46, 4);

    // Glowing panoramic wheelhouse windows
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.fillRect(-14, -28, 16, 10);
    ctx.fillRect(6, -28, 16, 10);
    ctx.shadowBlur = 0;

    // Twin High-Intensity Searchlight Floodlights on Wheelhouse Roof
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-8, -37, 4, 0, Math.PI * 2);
    ctx.arc(14, -37, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Stern Gantry A-Frame Hoist Crane
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-tw * 0.44, -12);
    ctx.lineTo(-tw * 0.32, -36);
    ctx.lineTo(-tw * 0.18, -12);
    ctx.stroke();
    // Cable line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-tw * 0.32, -36);
    ctx.lineTo(-tw * 0.32, -18);
    ctx.stroke();

    // Radar Arch & Marine Antenna
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(22, -34); ctx.lineTo(22, -48);
    ctx.arc(22, -50, 4, 0, Math.PI * 2);
    ctx.stroke();

  } else if (v === 3) {
    // ==========================================
    // TIER 3: HARBOR CUTTER
    // ==========================================
    const cw = hw * 1.04;

    // Lower keel
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-cw * 0.46, h * 0.65);
    ctx.quadraticCurveTo(0, h * 0.95, cw * 0.48, h * 0.55);
    ctx.lineTo(cw * 0.44, h * 0.72);
    ctx.quadraticCurveTo(0, h * 1.02, -cw * 0.42, h * 0.75);
    ctx.closePath();
    ctx.fill();

    // Dark Steel-Blue Hull (#0f3a5d)
    ctx.fillStyle = '#0f3a5d';
    ctx.beginPath();
    ctx.moveTo(-cw * 0.52, -10);
    ctx.lineTo(-cw * 0.44, h * 0.65);
    ctx.quadraticCurveTo(0, h * 0.85, cw * 0.46, h * 0.55);
    ctx.lineTo(cw * 0.54, -10);
    ctx.closePath();
    ctx.fill();

    // White gunwale rim
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cyan trim line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-cw * 0.48, 2);
    ctx.quadraticCurveTo(0, 14, cw * 0.49, 1);
    ctx.stroke();

    // Cabin house
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-22, -24, 42, 16);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-22, -24, 42, 3);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-17, -19, 13, 8);
    ctx.fillRect(2, -19, 13, 8);

    // Shade canopy roof & radar arch
    ctx.fillStyle = 'rgba(15,23,42,0.85)';
    ctx.fillRect(-cw * 0.48, -32, cw * 0.96, 8);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-cw * 0.4, -24); ctx.lineTo(-cw * 0.4, -32);
    ctx.moveTo(cw * 0.4, -24); ctx.lineTo(cw * 0.4, -32);
    ctx.stroke();

    // Crab pot mount points
    for (let cp = 0; cp < 3; cp++) {
      const cpX = -50 + cp * 42;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(cpX - 8, h * 0.1, 16, 14);
    }

  } else if (v === 2) {
    // ==========================================
    // TIER 2: COASTAL DORY
    // ==========================================
    const dw = hw * 1.0;

    // Lower keel
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-dw * 0.44, h * 0.65);
    ctx.quadraticCurveTo(0, h * 0.95, dw * 0.46, h * 0.55);
    ctx.lineTo(dw * 0.42, h * 0.72);
    ctx.quadraticCurveTo(0, h * 1.02, -dw * 0.4, h * 0.75);
    ctx.closePath();
    ctx.fill();

    // Royal Blue Dory Hull (#1e3a8a)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(-dw * 0.52, -10);
    ctx.lineTo(-dw * 0.44, h * 0.65);
    ctx.quadraticCurveTo(0, h * 0.85, dw * 0.46, h * 0.55);
    ctx.lineTo(dw * 0.54, -10);
    ctx.closePath();
    ctx.fill();

    // White gunwale rim
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Light blue trim line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-dw * 0.48, 2);
    ctx.quadraticCurveTo(0, 14, dw * 0.49, 1);
    ctx.stroke();

    // Center bench seat & bow cleat
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-22, -13, 44, 6);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-dw * 0.25, -10, 4, 3);
    ctx.fillRect(dw * 0.25, -10, 4, 3);

  } else if (v === 1) {
    // ==========================================
    // TIER 1: REINFORCED SKIFF
    // ==========================================
    const rw = hw * 0.96;

    // Under-hull shadow / keel
    ctx.fillStyle = '#271004';
    ctx.beginPath();
    ctx.moveTo(-rw * 0.42, h * 0.58);
    ctx.quadraticCurveTo(0, h * 0.88, rw * 0.44, h * 0.48);
    ctx.lineTo(rw * 0.42, h * 0.58);
    ctx.quadraticCurveTo(0, h * 0.98, -rw * 0.4, h * 0.68);
    ctx.closePath();
    ctx.fill();

    // Polished Rich Mahogany Hull
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-rw * 0.5, -8);
    ctx.lineTo(-rw * 0.42, h * 0.6);
    ctx.quadraticCurveTo(0, h * 0.8, rw * 0.44, h * 0.5);
    ctx.lineTo(rw * 0.52, -8);
    ctx.closePath();
    ctx.fill();

    // Lapstrake planking lines
    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-rw * 0.46, 0);
    ctx.quadraticCurveTo(0, 10, rw * 0.48, 0);
    ctx.moveTo(-rw * 0.44, 7);
    ctx.quadraticCurveTo(0, 17, rw * 0.46, 6);
    ctx.stroke();

    // Gunwale rim
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Golden sheer strake
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-rw * 0.46, -2);
    ctx.quadraticCurveTo(0, 5, rw * 0.48, -2);
    ctx.stroke();

    // Cushioned bench + twin rod holders + brass bow cleat
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-24, -8, 48, 8);
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-26, -12, 8, 5);
    ctx.fillRect(18, -12, 8, 5);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(rw * 0.45, -11, 7, 3);

  } else {
    // ==========================================
    // TIER 0: WEATHERED DINGHY (Starter)
    // ==========================================
    const ow = hw * 0.92;

    // Under-hull shadow / keel
    ctx.fillStyle = '#271004';
    ctx.beginPath();
    ctx.moveTo(-ow * 0.42, h * 0.58);
    ctx.quadraticCurveTo(0, h * 0.88, ow * 0.44, h * 0.48);
    ctx.lineTo(ow * 0.42, h * 0.58);
    ctx.quadraticCurveTo(0, h * 0.98, -ow * 0.4, h * 0.68);
    ctx.closePath();
    ctx.fill();

    // Classic Pine/Weathered Wood Hull (#9a3412)
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(-ow * 0.5, -8);
    ctx.lineTo(-ow * 0.42, h * 0.6);
    ctx.quadraticCurveTo(0, h * 0.8, ow * 0.44, h * 0.5);
    ctx.lineTo(ow * 0.52, -8);
    ctx.closePath();
    ctx.fill();

    // Planking lines
    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-ow * 0.46, 0);
    ctx.quadraticCurveTo(0, 10, ow * 0.48, 0);
    ctx.moveTo(-ow * 0.44, 7);
    ctx.quadraticCurveTo(0, 17, ow * 0.46, 6);
    ctx.stroke();

    // Gunwale rim
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Wooden seat / center thwart
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-18, -13, 36, 6);
    // Brass oarlock mounts on edges
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-ow * 0.25, -10, 4, 3);
    ctx.fillRect(ow * 0.25, -10, 4, 3);
  }

  // Cosmetic hull stripe follows the boat transform on every vessel tier.
  if (skinColor) {
    ctx.fillStyle = skinColor;
    ctx.fillRect(-hw * 0.35, 4, hw * 0.7, 6);
  }

  // Lantern on bow/stern for tiers 0 through 4
  if (v < 5) {
    const lanternX = v >= 3 ? 16 : 0;
    const lanternY = v >= 3 ? -24 : -26;
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(lanternX, lanternY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

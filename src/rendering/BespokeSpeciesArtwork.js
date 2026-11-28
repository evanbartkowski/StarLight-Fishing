// Bespoke high-craft artwork for requested signature species across all realms.
const TAU = Math.PI * 2;

function drawEye(ctx, x, y, r = 2.5, iris = '#38bdf8', glow = false) {
  ctx.save();
  if (glow) {
    ctx.fillStyle = `${iris}44`;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.85, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.arc(x + r * 0.18, y, r * 0.62, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x + r * 0.24, y, r * 0.34, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.3, Math.max(0.5, r * 0.25), 0, TAU);
  ctx.fill();
  ctx.restore();
}

export const BESPOKE_SPECIES_IDS = new Set([
  'realm_7_visitor_2',          // Upside-Down Oracle
  'realm_6_basalt_glassfish',   // Basalt Glassfish
  'realm_6_flarecrest_marlin',  // Flarecrest Marlin
  'realm_5_dewdrop_glassfish',  // Dewdrop Glassfish
  'realm_5_aether_sail_emperor',// Aether Sail Emperor
  'realm_7_quantum_veil_ray',   // Quantum Veil Ray
  'realm_3_moonring_discus',    // Moonring Discus
  'realm_3_sundial_seahorse',   // Sundial Seahorse
  'realm_1_visitor_1',          // Sunbeam Whale
  'realm_4_mosaic_tilefish',    // Mosaic Tilefish
  'realm_6_sootfin_perch',      // Sootfin Perch
  'realm_6_molten_copper_eel',  // Molten Copper Eel
  'realm_6_caldera_crownfish',  // Caldera Crownfish
  'chrono_whale',               // Chrono-Tide Whale
  'realm_7_eternity_sail_emperor', // Eternity Sail Emperor
]);

export function isBespokeSpecies(species) {
  return Boolean(species && BESPOKE_SPECIES_IDS.has(species.id));
}

export function drawBespokeSpecies(ctx, species, primary, secondary, finColor, time = 0) {
  if (!isBespokeSpecies(species)) return false;
  const id = species.id;
  const wave = Math.sin(time * 2.4) * 2.6;
  const pCol = typeof primary === 'string' ? primary : (species.primaryColor || '#38bdf8');
  const sCol = typeof secondary === 'string' ? secondary : (species.secondaryColor || '#bae6fd');
  const fCol = typeof finColor === 'string' ? finColor : (species.finColor || '#f59e0b');

  ctx.save();
  try {
    // 1. Upside-Down Oracle (Chrono Void inverted cosmic seahorse with floating aura veil)
    if (id === 'realm_7_visitor_2') {
      ctx.save();
      ctx.scale(1, -1); // Inverted orientation signature!
      // Ethereal cyan veil fins
      ctx.fillStyle = 'rgba(34, 211, 238, 0.42)';
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.bezierCurveTo(-18, -14 + wave, -22, 6 + wave, -9, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Curled prehensile spiral tail
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-2, 10);
      ctx.bezierCurveTo(-14, 24, 10, 30, 8, 18);
      ctx.stroke();

      // Sleek cosmic seahorse torso & crown
      let grad = pCol;
      try {
        grad = ctx.createLinearGradient(-8, -22, 14, 14);
        grad.addColorStop(0, '#c084fc');
        grad.addColorStop(0.5, pCol);
        grad.addColorStop(1, '#22d3ee');
      } catch { /* fallback */ }
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-4, 12);
      ctx.bezierCurveTo(-14, 0, -9, -15, 2, -20);
      ctx.lineTo(14, -17);
      ctx.lineTo(17, -13);
      ctx.lineTo(6, -11);
      ctx.bezierCurveTo(10, -2, 8, 8, -4, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing Third-Eye Diamond Halo on Forehead
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(2, -21, 5.5, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(2, -21, 1.8, 0, TAU);
      ctx.fill();

      drawEye(ctx, 6, -15.5, 2.3, '#22d3ee', true);
      ctx.restore();
      return true;
    }

    // 2. Basalt Glassfish & Dewdrop Glassfish (Translucent crystal body revealing delicate glowing skeleton)
    if (id === 'realm_6_basalt_glassfish' || id === 'realm_5_dewdrop_glassfish') {
      const isBasalt = id === 'realm_6_basalt_glassfish';
      const l = 21;
      const h = 13.5;

      // Swept translucent veil tail
      ctx.save();
      ctx.globalAlpha *= 0.65;
      ctx.fillStyle = fCol;
      ctx.strokeStyle = isBasalt ? '#fb923c' : '#e0e7ff';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(-l + 3, -3);
      ctx.quadraticCurveTo(-l - 9, -h * 0.85, -l - 15, -h * 0.9 - wave * 0.5);
      ctx.quadraticCurveTo(-l - 8, 0, -l - 15, h * 0.9 - wave * 0.5);
      ctx.quadraticCurveTo(-l - 9, h * 0.85, -l + 3, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Angular volcanic glass OR curved cloud-droplet silhouette
      ctx.fillStyle = isBasalt ? 'rgba(239, 68, 68, 0.34)' : 'rgba(233, 213, 255, 0.38)';
      ctx.strokeStyle = isBasalt ? '#f97316' : '#f8fafc';
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      if (isBasalt) {
        ctx.moveTo(-l, 0);
        ctx.lineTo(-l * 0.45, -h);
        ctx.lineTo(l * 0.55, -h * 0.78);
        ctx.lineTo(l + 2, -1);
        ctx.lineTo(l * 0.55, h * 0.78);
        ctx.lineTo(-l * 0.45, h);
      } else {
        ctx.moveTo(-l, 0);
        ctx.bezierCurveTo(-l * 0.6, -h * 1.15, l * 0.5, -h * 1.1, l + 1, -1);
        ctx.bezierCurveTo(l * 0.6, h * 1.08, -l * 0.6, h * 1.15, -l, 0);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Glowing crystal spine & ribs inside the translucent glass body!
      ctx.strokeStyle = isBasalt ? '#fef08a' : '#f9a8d4';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(-l * 0.78, 0);
      ctx.lineTo(l * 0.42, 0);
      for (let r = -3; r <= 2; r++) {
        const rx = r * 4.5;
        ctx.moveTo(rx, -6.5);
        ctx.quadraticCurveTo(rx - 1.5, 0, rx, 6.5);
      }
      ctx.stroke();

      // Dewdrop pearl or ember heart
      ctx.fillStyle = isBasalt ? '#fb923c' : '#e0f2fe';
      ctx.beginPath();
      ctx.arc(4, 0, 3.2, 0, TAU);
      ctx.fill();

      drawEye(ctx, l * 0.64, -3, 2.5, isBasalt ? '#fde047' : '#c084fc', true);
      return true;
    }

    // 3. Flarecrest Marlin & Aether Sail Emperor (Regal towering sailfish crests)
    if (id === 'realm_6_flarecrest_marlin' || id === 'realm_5_aether_sail_emperor') {
      const isAether = id === 'realm_5_aether_sail_emperor';
      const len = 29;
      const h = 11.5;

      // Deep forked billfish crescent tail
      ctx.fillStyle = fCol;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(-len + 2, -2.5);
      ctx.quadraticCurveTo(-len - 10, -10, -len - 17, -15 + wave * 0.6);
      ctx.quadraticCurveTo(-len - 8, 0, -len - 6, 0);
      ctx.quadraticCurveTo(-len - 8, 0, -len - 17, 15 + wave * 0.6);
      ctx.quadraticCurveTo(-len - 10, 10, -len + 2, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sweeping towering sail dorsal crest
      let sailG = fCol;
      try {
        sailG = ctx.createLinearGradient(-18, -32, 16, -6);
        sailG.addColorStop(0, isAether ? '#f0abfc' : '#fef08a');
        sailG.addColorStop(0.55, isAether ? '#a5b4fc' : '#f97316');
        sailG.addColorStop(1, isAether ? '#38bdf8' : '#dc2626');
      } catch { /* fallback */ }
      ctx.fillStyle = sailG;
      ctx.beginPath();
      ctx.moveTo(-18, -6);
      ctx.quadraticCurveTo(-14, -32 + wave * 0.35, -2, -29 + wave * 0.25);
      ctx.quadraticCurveTo(8, -26, 15, -18);
      ctx.quadraticCurveTo(14, -9, 12, -7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sail ray spines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.75;
      for (let sr = 0; sr < 5; sr++) {
        ctx.beginPath();
        ctx.moveTo(-13 + sr * 5.8, -7);
        ctx.lineTo(-10 + sr * 5.2, -26 + sr * 1.4);
        ctx.stroke();
      }

      // Muscular marlin hull + tapered glowing spear bill
      let bodyG = pCol;
      try {
        bodyG = ctx.createLinearGradient(0, -h, 0, h);
        bodyG.addColorStop(0, pCol);
        bodyG.addColorStop(0.65, sCol);
        bodyG.addColorStop(1, '#f8fafc');
      } catch { /* fallback */ }
      ctx.fillStyle = bodyG;
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.bezierCurveTo(-len * 0.55, -h * 1.15, len * 0.45, -h * 1.1, len, -1.5);
      ctx.lineTo(len + 22, -0.5);
      ctx.lineTo(len, 2);
      ctx.bezierCurveTo(len * 0.45, h * 1.05, -len * 0.55, h, -len, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Broad curved pectoral fin
      ctx.fillStyle = fCol;
      ctx.beginPath();
      ctx.moveTo(8, 3);
      ctx.quadraticCurveTo(10, 14, -2, 16 + wave * 0.35);
      ctx.quadraticCurveTo(0, 8, 2, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      drawEye(ctx, len - 8, -3, 2.5, isAether ? '#c084fc' : '#fef08a', true);
      return true;
    }

    // 4. Quantum Veil Ray (Manta wings tapering into trailing cosmic silk veil ribbons)
    if (id === 'realm_7_quantum_veil_ray') {
      const flap = Math.sin(time * 2.2) * 4;
      // 3 trailing cosmic silk veil ribbons
      for (let v = -1; v <= 1; v++) {
        ctx.strokeStyle = v === 0 ? '#22d3ee' : fCol;
        ctx.lineWidth = v === 0 ? 2.2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(-14, v * 4);
        ctx.bezierCurveTo(-26, v * 8 + flap, -38, v * 5 - flap, -52, v * 7 + flap * 0.6);
        ctx.stroke();
      }

      // Expansive silk manta wings
      let rayG = pCol;
      try {
        rayG = ctx.createLinearGradient(-15, -26, 22, 26);
        rayG.addColorStop(0, '#c084fc');
        rayG.addColorStop(0.5, pCol);
        rayG.addColorStop(1, sCol);
      } catch { /* fallback */ }
      ctx.fillStyle = rayG;
      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(21, -4);
      ctx.lineTo(27, -7);
      ctx.quadraticCurveTo(11, -24, -4, -25 + flap);
      ctx.quadraticCurveTo(-15, -12, -16, 0);
      ctx.quadraticCurveTo(-15, 12, -4, 25 - flap);
      ctx.quadraticCurveTo(11, 24, 27, 7);
      ctx.lineTo(21, 4);
      ctx.quadraticCurveTo(23, 0, 21, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Delicate arcane mandala ring on wings
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.72)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.ellipse(-1, 0, 8, 12, 0, 0, TAU);
      ctx.stroke();

      drawEye(ctx, 11, -5, 2.0, '#67e8f9', true);
      drawEye(ctx, 11, 5, 2.0, '#67e8f9', true);
      return true;
    }

    // 5. Moonring Discus (Jewel discus with luminous silver moon-phase halos & veil fins)
    if (id === 'realm_3_moonring_discus') {
      const r = 17.5;
      // Graceful moon-veil dorsal & anal trailing fins
      ctx.fillStyle = 'rgba(196, 181, 253, 0.62)';
      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(-4, -r + 2);
      ctx.quadraticCurveTo(-22, -r - 9 + wave * 0.4, -30, -8 + wave * 0.4);
      ctx.quadraticCurveTo(-18, -4, -15, 0);
      ctx.quadraticCurveTo(-18, 4, -30, 8 - wave * 0.4);
      ctx.quadraticCurveTo(-22, r + 9 - wave * 0.4, -4, r - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Discus circular jewel body
      let discG = pCol;
      try {
        discG = ctx.createRadialGradient(4, -4, 2, 0, 0, r * 1.15);
        discG.addColorStop(0, '#f0abfc');
        discG.addColorStop(0.55, pCol);
        discG.addColorStop(1, '#312e81');
      } catch { /* fallback */ }
      ctx.fillStyle = discG;
      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.12, r, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Silver moon-ring halo motif + crescent moon
      ctx.strokeStyle = 'rgba(254, 249, 195, 0.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(-3, 0, 9.5, 0.5, TAU - 0.5);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-5, 0, 4.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = pCol;
      ctx.beginPath();
      ctx.arc(-3.5, -0.5, 3.4, 0, TAU);
      ctx.fill();

      drawEye(ctx, 11, -4, 2.6, '#fde047', true);
      return true;
    }

    // 6. Sundial Seahorse (Graceful golden-lavender seahorse with brass sundial halo ring)
    if (id === 'realm_3_sundial_seahorse') {
      // Ornate radiating brass sundial halo behind spine
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(-4, -4, 14, 0, TAU);
      ctx.stroke();
      for (let hr = 0; hr < 8; hr++) {
        const a = (hr / 8) * TAU;
        ctx.beginPath();
        ctx.moveTo(-4 + Math.cos(a) * 11.5, -4 + Math.sin(a) * 11.5);
        ctx.lineTo(-4 + Math.cos(a) * 16.5, -4 + Math.sin(a) * 16.5);
        ctx.stroke();
      }
      // Sundial gnomon pointer & curled seahorse silhouette
      ctx.fillStyle = pCol;
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.moveTo(-3, 14);
      ctx.bezierCurveTo(-18, 28, 12, 32, 7, 19);
      ctx.bezierCurveTo(1, 13, -7, 17, -3, 14);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-4, 12);
      ctx.bezierCurveTo(-15, -1, -9, -15, 2, -20);
      ctx.lineTo(15, -16);
      ctx.lineTo(16, -11);
      ctx.lineTo(6, -10);
      ctx.bezierCurveTo(10, -2, 7, 9, -4, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      drawEye(ctx, 6, -15, 2.2, '#fde047', true);
      return true;
    }

    // 7. Sunbeam Whale (Majestic warm sunlit humpback with scalloped pectoral wings & sunburst belly)
    if (id === 'realm_1_visitor_1') {
      const tailWave = Math.sin(time * 1.8) * 3.5;
      // Wide scalloped whale tail fluke
      ctx.fillStyle = fCol;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-34, 0);
      ctx.quadraticCurveTo(-46, -14 + tailWave, -56, -18 + tailWave);
      ctx.quadraticCurveTo(-46, -3 + tailWave * 0.4, -44, tailWave * 0.2);
      ctx.quadraticCurveTo(-46, 3 + tailWave * 0.4, -56, 18 + tailWave);
      ctx.quadraticCurveTo(-46, 14 + tailWave, -34, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Humpback whale hull with warm golden-cream countershading
      let whaleG = pCol;
      try {
        whaleG = ctx.createLinearGradient(0, -18, 0, 18);
        whaleG.addColorStop(0, '#d97706');
        whaleG.addColorStop(0.45, pCol);
        whaleG.addColorStop(1, '#fffbeb');
      } catch { /* fallback */ }
      ctx.fillStyle = whaleG;
      ctx.beginPath();
      ctx.moveTo(-36, 0);
      ctx.bezierCurveTo(-24, -16, 8, -20, 32, -8);
      ctx.bezierCurveTo(40, -3, 38, 9, 26, 13);
      ctx.bezierCurveTo(4, 18, -22, 12, -36, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sunburst dorsal glint & scalloped humpback flipper
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.0;
      for (let p = 0; p < 5; p++) {
        ctx.beginPath();
        ctx.moveTo(4, 8 + p * 1.5);
        ctx.quadraticCurveTo(16, 9 + p * 1.3, 28 - p * 2, 7 + p * 1.2);
        ctx.stroke();
      }
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.quadraticCurveTo(2, 24 + wave * 0.3, -12, 26 + wave * 0.4);
      ctx.quadraticCurveTo(-4, 15, 0, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      drawEye(ctx, 24, -2, 2.4, '#0284c7');
      return true;
    }

    // 7. Mosaic Tilefish (Sleek blunt-crowned tilefish with Atlantean inlaid stained-glass tesserae scales & swallowtail)
    if (id === 'realm_4_mosaic_tilefish') {
      // Forked swallowtail fin
      ctx.fillStyle = '#0d9488';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-21, -2);
      ctx.lineTo(-34, -13 + wave * 0.6);
      ctx.quadraticCurveTo(-27, wave * 0.2, -34, 13 + wave * 0.6);
      ctx.lineTo(-21, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Long scalloped golden-emerald dorsal ridge crest & anal ribbon
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(-16, -9);
      ctx.quadraticCurveTo(-2, -21, 14, -14);
      ctx.quadraticCurveTo(18, -10, 12, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#14b8a6';
      ctx.beginPath();
      ctx.moveTo(-15, 7);
      ctx.quadraticCurveTo(-4, 15, 5, 8);
      ctx.closePath();
      ctx.fill();

      // Characteristic squared-off tilefish cephalic brow & streamlined torpedo flank
      let tileBodyG = '#10b981';
      try {
        tileBodyG = ctx.createLinearGradient(-22, -13, 24, 12);
        tileBodyG.addColorStop(0, '#0f766e');
        tileBodyG.addColorStop(0.45, '#14b8a6');
        tileBodyG.addColorStop(0.85, '#2563eb');
        tileBodyG.addColorStop(1, '#fef3c7');
      } catch { /* fallback */ }
      ctx.fillStyle = tileBodyG;
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-23, 0);
      ctx.bezierCurveTo(-15, -12, 4, -14, 17, -11);
      ctx.bezierCurveTo(23, -8, 25, -1, 22, 4);
      ctx.quadraticCurveTo(16, 10.5, 4, 10.5);
      ctx.bezierCurveTo(-8, 10.5, -18, 6, -23, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crisp Atlantean beveled stained-glass tesserae tiles clipped inside torso
      ctx.save();
      ctx.clip();
      const tilePalette = ['#2dd4bf', '#3b82f6', '#fbbf24', '#fef3c7', '#10b981'];
      for (let row = -1; row <= 1; row++) {
        for (let col = -3; col <= 1; col++) {
          const tx = col * 7.2 + (row % 2 ? 3.5 : 0);
          const ty = row * 5.2;
          ctx.fillStyle = tilePalette[Math.abs(row * 5 + col) % tilePalette.length];
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.moveTo(tx, ty - 2.6);
          ctx.lineTo(tx + 3.4, ty);
          ctx.lineTo(tx, ty + 2.6);
          ctx.lineTo(tx - 3.4, ty);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();

      // Golden gill curve, sculpted pectoral fin & jewel-amber eye
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(6, 2);
      ctx.quadraticCurveTo(-2, 7 + wave * 0.25, -4, 13 + wave * 0.25);
      ctx.quadraticCurveTo(2, 9, 8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      drawEye(ctx, 16.5, -3.5, 2.5, '#fbbf24', true);
      return true;
    }

    // 8. Sootfin Perch (Cute chubby volcanic-ember perch with puffy soot-tipped petal fins & rosy ember cheek)
    if (id === 'realm_6_sootfin_perch') {
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.moveTo(-18, -2);
      ctx.bezierCurveTo(-24, -10, -31, -8 + wave, -30, wave * 0.4);
      ctx.bezierCurveTo(-31, 8 + wave, -24, 10, -18, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Puffy soot-black & ember-rimmed dorsal & ventral paddle fins
      ctx.fillStyle = '#3f3f46';
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.bezierCurveTo(-6, -18, 5, -17, 9, -8.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      let perchG = '#f97316';
      try {
        perchG = ctx.createLinearGradient(0, -12, 0, 12);
        perchG.addColorStop(0, '#44403c');
        perchG.addColorStop(0.42, '#ea580c');
        perchG.addColorStop(1, '#fdba74');
      } catch { /* fallback */ }
      ctx.fillStyle = perchG;
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.moveTo(-19, 0);
      ctx.bezierCurveTo(-15, -12.5, 2, -13.5, 14, -9);
      ctx.bezierCurveTo(21, -5.5, 22, 2, 18, 6.5);
      ctx.bezierCurveTo(10, 12, -10, 11.5, -19, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cute smoky soot cheek freckles & rosy glow
      ctx.fillStyle = 'rgba(254, 215, 170, 0.65)';
      ctx.beginPath();
      ctx.ellipse(-2, -1, 6, 3.2, -0.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(244, 63, 94, 0.42)';
      ctx.beginPath();
      ctx.ellipse(12, 3, 2.6, 1.5, 0, 0, TAU);
      ctx.fill();

      // Soot-tipped cute pectoral flipper & bright smile
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(4, 2);
      ctx.bezierCurveTo(-2, 5, -3, 10.5, 3, 9.5 + wave * 0.25);
      ctx.bezierCurveTo(6.5, 8.5, 7, 4, 4, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(16.5, 2.2, 1.8, 0.1, 1.6);
      ctx.stroke();
      drawEye(ctx, 13.0, -2.5, 2.8, '#facc15', true);
      return true;
    }

    // 9. Molten Copper Eel (Cute sinuous copper-ribbon eel with scalloped ember crest & shiny gold belly beads)
    if (id === 'realm_6_molten_copper_eel') {
      const ew = Math.sin(time * 3.1) * 3.2;
      // Scalloped amber dorsal frill running along curve
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.moveTo(-28, ew * 0.6 - 2);
      ctx.bezierCurveTo(-18, -12 + ew, -4, -3 - ew, 10, -10 + ew * 0.3);
      ctx.lineTo(14, -4);
      ctx.lineTo(-26, ew * 0.6 + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      let copperG = '#ea580c';
      try {
        copperG = ctx.createLinearGradient(-30, -8, 24, 8);
        copperG.addColorStop(0, '#9a3412');
        copperG.addColorStop(0.45, '#f97316');
        copperG.addColorStop(0.75, '#fdba74');
        copperG.addColorStop(1, '#ea580c');
      } catch { /* fallback */ }
      ctx.fillStyle = copperG;
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.moveTo(-30, ew * 0.7);
      ctx.bezierCurveTo(-18, -8 + ew, -4, 4 - ew, 12, -5.5);
      ctx.quadraticCurveTo(22, -7, 23, -1);
      ctx.quadraticCurveTo(22, 5.5, 13, 5);
      ctx.bezierCurveTo(-2, 11 - ew, -18, 2 + ew, -30, ew * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shimmering molten copper oval speculars & rosy blush
      ctx.fillStyle = 'rgba(254, 249, 195, 0.6)';
      for (const [cx, cy] of [[-12, ew * 0.2], [0, -ew * 0.25], [10, -1]]) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, 3.2, 1.5, 0, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
      ctx.beginPath();
      ctx.ellipse(17.5, 2, 2.2, 1.3, 0, 0, TAU);
      ctx.fill();

      drawEye(ctx, 17.5, -2.2, 2.5, '#facc15', true);
      return true;
    }

    // 10. Caldera Crownfish (Adorable regal lava jewel discus with glowing 3-prong gold crown & scalloped ember fins)
    if (id === 'realm_6_caldera_crownfish') {
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-17, -2);
      ctx.bezierCurveTo(-23, -9, -30, -9 + wave, -28, wave * 0.3);
      ctx.bezierCurveTo(-30, 9 + wave, -23, 9, -17, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Royal 3-prong molten gold crystal crown atop brow
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.moveTo(-6, -12);
      ctx.lineTo(-9, -20);
      ctx.lineTo(-2, -15.5);
      ctx.lineTo(1, -22);
      ctx.lineTo(4, -15.5);
      ctx.lineTo(10, -19.5);
      ctx.lineTo(7, -11.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      let crownFishG = '#ea580c';
      try {
        crownFishG = ctx.createRadialGradient(4, -3, 2, 0, 0, 20);
        crownFishG.addColorStop(0, '#fed7aa');
        crownFishG.addColorStop(0.45, '#f97316');
        crownFishG.addColorStop(1, '#991b1b');
      } catch { /* fallback */ }
      ctx.fillStyle = crownFishG;
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18.5, 13.5, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Tiny gold jewel filigree crescent & cute blush
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.78)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(-3, 0, 8, Math.PI * 0.55, Math.PI * 1.45);
      ctx.stroke();
      ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
      ctx.beginPath();
      ctx.ellipse(11, 3.5, 2.4, 1.4, 0, 0, TAU);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.bezierCurveTo(-3, 5, -3, 10, 2, 9 + wave * 0.25);
      ctx.bezierCurveTo(6, 8, 6, 4, 2, 2);
      ctx.closePath();
      ctx.fill();
      drawEye(ctx, 11.2, -2.5, 2.9, '#fbbf24', true);
      return true;
    }

    // 11. Chrono-Tide Whale (Plump cosmic chibi space-whale with celestial brass clock medallion & starry spout halo)
    if (id === 'chrono_whale') {
      const cwBob = Math.sin(time * 2.0) * 1.8;
      // Floating pastel starlight halo bubble over blowhole
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.72)';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.ellipse(12, -20 + cwBob, 8, 2.8, -0.08, 0, TAU);
      ctx.stroke();

      // Tail fluke
      ctx.fillStyle = '#6366f1';
      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-29, 0);
      ctx.quadraticCurveTo(-39, -14 + wave * 0.6, -42, -16 + wave * 0.7);
      ctx.quadraticCurveTo(-35, -3, -34, 0);
      ctx.quadraticCurveTo(-35, 3, -42, 16 + wave * 0.7);
      ctx.quadraticCurveTo(-39, 14 + wave * 0.6, -29, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Plump cozy whale body with deep indigo->amethyst->cream belly gradient
      let cwBody = '#312e81';
      try {
        cwBody = ctx.createLinearGradient(0, -17, 0, 17);
        cwBody.addColorStop(0, '#312e81');
        cwBody.addColorStop(0.55, '#6366f1');
        cwBody.addColorStop(1, '#e0e7ff');
      } catch { /* fallback */ }
      ctx.fillStyle = cwBody;
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(-31, 0);
      ctx.bezierCurveTo(-20, -15.5, 8, -18, 26, -7.5);
      ctx.bezierCurveTo(34, -2, 32, 9.5, 22, 12.5);
      ctx.bezierCurveTo(4, 17, -18, 12.5, -31, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Celestial brass-rimmed Chrono-Tide clock dial on flank
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-4, -1, 6.4, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.1;
      const hrAng = time * 0.45;
      ctx.beginPath();
      ctx.moveTo(-4, -1);
      ctx.lineTo(-4 + Math.cos(hrAng) * 4.2, -1 + Math.sin(hrAng) * 4.2);
      ctx.moveTo(-4, -1);
      ctx.lineTo(-4 + Math.cos(hrAng * 3) * 3, -1 + Math.sin(hrAng * 3) * 3);
      ctx.stroke();

      // Chubby happy whale pectoral fin & rosy blush
      ctx.fillStyle = '#a5b4fc';
      ctx.beginPath();
      ctx.moveTo(6, 7);
      ctx.bezierCurveTo(2, 18, -8, 19 + wave * 0.25, -6, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
      ctx.beginPath();
      ctx.ellipse(23, 4.2, 2.8, 1.6, 0, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(28, 3.2, 2.4, 0.15, 1.6);
      ctx.stroke();
      drawEye(ctx, 21.5, -2, 2.9, '#38bdf8', true);
      return true;
    }

    // 12. Eternity Sail Emperor (Unique yet cute royal cosmic sailfish with flowing stardust hourglass sail & floating gold crown)
    if (id === 'realm_7_eternity_sail_emperor') {
      // Sweeping starry crescent tail
      ctx.fillStyle = '#a855f7';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-20, -2);
      ctx.lineTo(-34, -12 + wave * 0.6);
      ctx.quadraticCurveTo(-26, wave * 0.2, -34, 12 + wave * 0.6);
      ctx.lineTo(-20, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Floating mini royal halo crown above brow
      const hBob = Math.sin(time * 2.5) * 1.4;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(12, -16 + hBob, 6, 2.1, -0.1, 0, TAU);
      ctx.stroke();

      // Towering rippling Eternity Stardust Sail
      let eSailG = '#f43f5e';
      try {
        eSailG = ctx.createLinearGradient(-14, -26, 8, -4);
        eSailG.addColorStop(0, '#38bdf8');
        eSailG.addColorStop(0.5, '#f472b6');
        eSailG.addColorStop(1, '#fde047');
      } catch { /* fallback */ }
      ctx.fillStyle = eSailG;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-15, -7);
      ctx.bezierCurveTo(-17, -23 + wave * 0.5, -4, -27 + wave * 0.4, 9, -11);
      ctx.quadraticCurveTo(-2, -6, -15, -7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Plump cute emperor swordfish body & petite jewel rostrum
      let eBodyG = '#f43f5e';
      try {
        eBodyG = ctx.createLinearGradient(-20, -9, 26, 9);
        eBodyG.addColorStop(0, '#7c3aed');
        eBodyG.addColorStop(0.55, '#ec4899');
        eBodyG.addColorStop(1, '#fef3c7');
      } catch { /* fallback */ }
      ctx.fillStyle = eBodyG;
      ctx.strokeStyle = '#4c1d95';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-21, 0);
      ctx.bezierCurveTo(-14, -10.5, 4, -11, 18, -5.5);
      ctx.lineTo(31, -1); // Cute modest crystal-tipped rostrum
      ctx.lineTo(18, 4.5);
      ctx.bezierCurveTo(6, 10, -13, 8.5, -21, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing miniature eternity/infinity emblem & rosy cheek
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.ellipse(-5, 0, 2.8, 1.8, 0, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0.5, 0, 2.8, 1.8, 0, 0, TAU);
      ctx.stroke();

      ctx.fillStyle = 'rgba(251, 113, 133, 0.5)';
      ctx.beginPath();
      ctx.ellipse(15, 2.5, 2.2, 1.3, 0, 0, TAU);
      ctx.fill();

      drawEye(ctx, 13.5, -2.5, 2.8, '#38bdf8', true);
      return true;
    }
  } finally {
    ctx.restore();
  }
  return false;
}

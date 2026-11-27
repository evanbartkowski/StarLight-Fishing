// Bespoke Canvas artwork for Eldritch Chrono Void temporal creatures (Wormhole Sturgeon, Causality Ribbonfish, etc.)
// and the 9 rare hidden encounters (Kelp Dragon, Arctic Bluetide Fox, Hermit-Crab Village, Ocean Djinn,
// Living Shipwreck, Mirror Creature, Coral Guardian, Origami Koi, Deep-Sea Witch).

const TAU = Math.PI * 2;

function drawEye(ctx, x, y, r = 2.5, iris = '#fde047', glow = false) {
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
  ctx.arc(x + r * 0.24, y, r * 0.32, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.3, Math.max(0.5, r * 0.24), 0, TAU);
  ctx.fill();
  ctx.restore();
}

// =========================================================================
// PART 1: Chrono Void (Realm 7) Bespoke Wormhole & Temporal Species Art
// =========================================================================
export function isChronoVoidSpecial(species) {
  if (!species || species.isLeviathan) return false;
  const id = species.id || '';
  const name = (species.name || '').toLowerCase();
  if (species.zone !== 7 && !id.startsWith('realm_7_')) return false;
  return (
    name.includes('wormhole') ||
    name.includes('causality') ||
    name.includes('chronal') ||
    name.includes('ribbon') ||
    name.includes('clockjaw') ||
    name.includes('zero hour') ||
    name.includes('singularity') ||
    name.includes('paradox')
  );
}

export function drawChronoVoidFish(ctx, species, primary, secondary, finColor, time, fish = null) {
  if (!isChronoVoidSpecial(species)) return false;
  const name = (species.name || '').toLowerCase();
  const wave = Math.sin(time * 2.6) * 2.6;
  const pCol = typeof primary === 'string' ? primary : '#818cf8';
  const sCol = typeof secondary === 'string' ? secondary : '#22d3ee';
  const fCol = typeof finColor === 'string' ? finColor : '#f43f5e';

  ctx.save();
  try {
    // 1. Wormhole Sturgeon — sleek armored sturgeon housing an open rotating spacetime wormhole
    if (name.includes('wormhole')) {
      // Swept heterocercal tail fluke
      ctx.fillStyle = fCol;
      ctx.strokeStyle = 'rgba(224, 231, 255, 0.6)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-29, -3);
      ctx.quadraticCurveTo(-39, -11, -46, -18 + wave * 0.7);
      ctx.quadraticCurveTo(-37, -3, -35, 1 + wave * 0.2);
      ctx.quadraticCurveTo(-40, 8, -42, 13 + wave * 0.6);
      ctx.quadraticCurveTo(-34, 5, -29, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pectoral & dorsal cosmic fins
      ctx.fillStyle = fCol;
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.quadraticCurveTo(-18, -22, -23, -19 + wave * 0.4);
      ctx.quadraticCurveTo(-20, -10, -17, -9);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(6, 7);
      ctx.quadraticCurveTo(0, 17 + wave * 0.4, -7, 16 + wave * 0.3);
      ctx.quadraticCurveTo(-2, 10, -1, 7);
      ctx.closePath();
      ctx.fill();

      // Sturgeon fusiform hull with subtle dark cosmic frame
      let hullGrad = '#1e1b4b';
      try {
        hullGrad = ctx.createLinearGradient(-30, -14, 30, 14);
        hullGrad.addColorStop(0, '#1e1b4b');
        hullGrad.addColorStop(0.5, pCol);
        hullGrad.addColorStop(1, '#312e81');
      } catch { /* fallback */ }

      ctx.fillStyle = hullGrad;
      ctx.strokeStyle = sCol;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.bezierCurveTo(-18, -14, 12, -14, 28, -3);
      ctx.lineTo(35, 0); // Armored sturgeon snout
      ctx.lineTo(27, 4);
      ctx.bezierCurveTo(12, 13, -18, 12, -30, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Armored sturgeon scutes along back glowing like temporal stars
      ctx.fillStyle = '#fde047';
      for (let sc = -2; sc <= 2; sc++) {
        const sx = sc * 9 - 2;
        ctx.beginPath();
        ctx.moveTo(sx - 3, -10);
        ctx.lineTo(sx + 1, -14);
        ctx.lineTo(sx + 4, -9.5);
        ctx.closePath();
        ctx.fill();
      }

      // WORMHOLE APERTURE inside the midsection!
      const wx = -2;
      const wy = 0;
      const wr = 9.5;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(wx, wy, wr * 1.15, wr * 0.9, -0.15, 0, TAU);
      ctx.clip();

      // Deep event-horizon core
      try {
        const portalGrad = ctx.createRadialGradient(wx, wy, 1.5, wx, wy, wr * 1.2);
        portalGrad.addColorStop(0, '#ffffff');
        portalGrad.addColorStop(0.28, '#22d3ee');
        portalGrad.addColorStop(0.65, '#9333ea');
        portalGrad.addColorStop(1, '#020617');
        ctx.fillStyle = portalGrad;
      } catch {
        ctx.fillStyle = '#020617';
      }
      ctx.fillRect(wx - 14, wy - 12, 28, 24);

      // Rotating spiral spacetime arms pulled into singularity (calm hypnotic rotation)
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
      ctx.lineWidth = 1.15;
      for (let arm = 0; arm < 4; arm++) {
        ctx.beginPath();
        const baseA = time * 0.72 + arm * (Math.PI / 2);
        for (let r = 1.5; r <= 11; r += 1.6) {
          const a = baseA + r * 0.38;
          const px = wx + Math.cos(a) * r * 1.1;
          const py = wy + Math.sin(a) * r * 0.85;
          if (r === 1.5) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Glowing accretion ring around the wormhole portal
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(wx, wy, wr * 1.15, wr * 0.9, -0.15, 0, TAU);
      ctx.stroke();

      // Tiny orbital ring passing across aperture
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.78)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.ellipse(wx, wy, wr * 1.45, wr * 0.42, 0.35 + Math.sin(time) * 0.08, 0, TAU);
      ctx.stroke();

      // Chin whiskers & temporal eye
      ctx.strokeStyle = sCol;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(27, 3);
      ctx.quadraticCurveTo(25, 9, 21, 11);
      ctx.stroke();

      drawEye(ctx, 21, -2.5, 2.3, '#22d3ee', true);
      return true;
    }

    // 2. Causality Ribbonfish & Temporal Ribbon Eels — flowing cosmic time-ribbon with echoing silhouette
    if (name.includes('causality') || name.includes('ribbon') || name.includes('chronal')) {
      const len = 34;
      const spine = [];
      for (let i = 0; i <= 7; i++) {
        const u = i / 7;
        const x = -len + u * len * 1.85;
        const y = Math.sin(time * 2.7 - u * 4.5) * (1 - u * 0.6) * 5.2;
        const r = Math.max(1.2, (u < 0.15 ? u * 6 : 1 - Math.max(0, u - 0.8) * 1.3) * 5.2);
        spine.push({ x, y, r });
      }

      // Temporal Echo Ghost Ribbon slightly phase-shifted behind it (causality trail)
      ctx.save();
      ctx.globalAlpha *= 0.38;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < spine.length; i++) {
        const ex = spine[i].x - 5;
        const ey = Math.sin(time * 2.7 - 0.65 - (i / 7) * 4.5) * 4.8;
        if (i === 0) ctx.moveTo(ex, ey);
        else ctx.lineTo(ex, ey);
      }
      ctx.stroke();
      ctx.restore();

      // Flowing translucent cosmic dorsal crest along ribbon
      ctx.save();
      ctx.fillStyle = fCol;
      ctx.globalAlpha *= 0.72;
      ctx.beginPath();
      ctx.moveTo(spine[0].x - 6, spine[0].y);
      for (let i = 0; i < spine.length; i++) {
        ctx.lineTo(spine[i].x, spine[i].y - spine[i].r - (i === 6 ? 7 : 3.5));
      }
      for (let i = spine.length - 1; i >= 0; i--) {
        ctx.lineTo(spine[i].x, spine[i].y + spine[i].r * 0.45);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Gradient ribbon body
      let ribGrad = pCol;
      try {
        ribGrad = ctx.createLinearGradient(-len, 0, len, 0);
        ribGrad.addColorStop(0, fCol);
        ribGrad.addColorStop(0.5, pCol);
        ribGrad.addColorStop(1, sCol);
      } catch { /* fallback */ }

      ctx.fillStyle = ribGrad;
      ctx.strokeStyle = 'rgba(224, 231, 255, 0.72)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(spine[0].x - 4, spine[0].y);
      for (let i = 0; i < spine.length; i++) ctx.lineTo(spine[i].x, spine[i].y - spine[i].r);
      ctx.quadraticCurveTo(spine[7].x + 6, spine[7].y, spine[7].x + 4, spine[7].y + 2);
      for (let i = spine.length - 1; i >= 0; i--) ctx.lineTo(spine[i].x, spine[i].y + spine[i].r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hourglass causality runes along spine
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 0.9;
      for (let g = 2; g <= 5; g += 2) {
        const pt = spine[g];
        ctx.beginPath();
        ctx.moveTo(pt.x - 2, pt.y - 2.2);
        ctx.lineTo(pt.x + 2, pt.y - 2.2);
        ctx.lineTo(pt.x - 2, pt.y + 2.2);
        ctx.lineTo(pt.x + 2, pt.y + 2.2);
        ctx.closePath();
        ctx.stroke();
      }

      // Floating diamond time-crown crest at head
      const hd = spine[7];
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(hd.x - 2, hd.y - 3);
      ctx.quadraticCurveTo(hd.x - 9, hd.y - 13, hd.x - 16, hd.y - 10 + wave * 0.4);
      ctx.stroke();
      drawEye(ctx, hd.x - 2.5, hd.y - 1.5, 2.1, '#fde047', true);
      return true;
    }

    // 3. Other signature Chrono Void species (Clockjaw, Zero Hour Shark, Singularity Lanternfish, Paradox Glassfish)
    const isClock = name.includes('clock') || name.includes('zero hour');
    const isSingularity = name.includes('singularity') || name.includes('paradox');

    if (isClock || isSingularity) {
      const len = isClock ? 28 : 22;
      const h = isClock ? 11.5 : 12.5;
      // Crescent tail
      ctx.fillStyle = fCol;
      ctx.beginPath();
      ctx.moveTo(-len + 3, -3);
      ctx.quadraticCurveTo(-len - 8, -h * 0.7, -len - 15, -h - wave * 0.5);
      ctx.quadraticCurveTo(-len - 8, -1, -len - 6, 0);
      ctx.quadraticCurveTo(-len - 8, 1, -len - 13, h - wave * 0.5);
      ctx.quadraticCurveTo(-len - 7, h * 0.6, -len + 3, 3);
      ctx.closePath();
      ctx.fill();

      // Body
      let g = pCol;
      try {
        g = ctx.createLinearGradient(-len, -h, len, h);
        g.addColorStop(0, '#1e1b4b');
        g.addColorStop(0.55, pCol);
        g.addColorStop(1, sCol);
      } catch { /* fallback */ }
      ctx.fillStyle = g;
      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.bezierCurveTo(-len * 0.6, -h * 1.2, len * 0.5, -h * 1.15, len, -1);
      ctx.bezierCurveTo(len * 0.85, h * 1.1, -len * 0.55, h * 1.15, -len, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Clockwork dial or gravitational singularity ring on flank
      const cx = -2;
      ctx.strokeStyle = isClock ? '#fde047' : '#67e8f9';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(cx, 0, 6.5, 0, TAU);
      ctx.stroke();
      if (isClock) {
        const handA = time * 1.6;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + Math.cos(handA) * 5, Math.sin(handA) * 5);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + Math.cos(-time * 0.4) * 3.5, Math.sin(-time * 0.4) * 3.5);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(cx, 0, 4, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#f472b6';
        ctx.beginPath();
        ctx.ellipse(cx, 0, 9.5, 3.2, 0.35, 0, TAU);
        ctx.stroke();
      }

      drawEye(ctx, len - 7, -2.5, 2.5, '#67e8f9', true);
      return true;
    }
  } finally {
    ctx.restore();
  }
  return false;
}

// =========================================================================
// PART 2: 9 New Hard-To-Find Creatures Custom Art
// =========================================================================
export function isRareEncounterShape(species) {
  if (!species) return false;
  return [
    'kelp_dragon', 'bluetide_fox', 'hermit_village', 'ocean_djinn',
    'living_shipwreck', 'mirror_creature', 'coral_guardian', 'origami_koi',
    'deep_sea_witch',
  ].includes(species.shape);
}

export function drawRareEncounterCreature(ctx, species, primary, secondary, finColor, time, fish = null) {
  if (!species || !isRareEncounterShape(species)) return false;
  const sh = species.shape;
  const pCol = typeof primary === 'string' ? primary : (species.primaryColor || '#38bdf8');
  const sCol = typeof secondary === 'string' ? secondary : (species.secondaryColor || '#bae6fd');
  const fCol = typeof finColor === 'string' ? finColor : (species.finColor || '#f59e0b');
  const wave = Math.sin(time * 2.4) * 2.8;
  const wake = fish && Number.isFinite(fish.wakeProgress) ? fish.wakeProgress : 0.85;

  ctx.save();
  try {
    // 1. Kelp Dragon — serpentine leafy dragon blending into kelp forests
    if (sh === 'kelp_dragon') {
      const pts = [];
      for (let i = 0; i <= 6; i++) {
        const u = i / 6;
        const x = -30 + u * 54;
        const y = Math.sin(time * 2.1 - u * 4.2) * (1 - u * 0.45) * 5;
        pts.push({ x, y });
      }
      // Swaying leafy kelp fronds sprouting off spine
      for (let i = 0; i < 6; i++) {
        const pt = pts[i];
        const frondSway = Math.sin(time * 2.6 + i) * 4;
        ctx.fillStyle = i % 2 ? '#10b981' : '#34d399';
        ctx.strokeStyle = '#064e3b';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y - 4);
        ctx.quadraticCurveTo(pt.x - 8 + frondSway, pt.y - 16, pt.x - 14 + frondSway, pt.y - 11);
        ctx.quadraticCurveTo(pt.x - 6, pt.y - 7, pt.x, pt.y - 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Golden pneumatocyst air-bulb
        ctx.fillStyle = fCol;
        ctx.beginPath();
        ctx.arc(pt.x - 1, pt.y - 4.5, 2.0, 0, TAU);
        ctx.fill();
      }

      // Serpentine dragon body
      ctx.fillStyle = pCol;
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(pts[0].x - 8, pts[0].y);
      for (let i = 0; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y - (3 + i * 0.45));
      ctx.lineTo(pts[6].x + 9, pts[6].y - 3);
      ctx.lineTo(pts[6].x + 11, pts[6].y + 2);
      for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i].x, pts[i].y + (3 + i * 0.45));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Leafy crest horns & whiskers
      const hd = pts[6];
      ctx.strokeStyle = sCol;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(hd.x + 1, hd.y - 5);
      ctx.quadraticCurveTo(hd.x - 5, hd.y - 15, hd.x - 11, hd.y - 13);
      ctx.moveTo(hd.x + 9, hd.y + 1);
      ctx.quadraticCurveTo(hd.x + 15, hd.y + 5, hd.x + 17, hd.y + 9);
      ctx.stroke();
      drawEye(ctx, hd.x + 3.5, hd.y - 2, 2.3, '#fde047', true);
      return true;
    }

    // 2. Arctic Bluetide Fox — glowing frost fox running smoothly across wave crests
    if (sh === 'bluetide_fox') {
      const gallop = Math.sin(time * 6.5);
      // 3 glowing blue-frost tails billowing behind
      for (let t = -1; t <= 1; t++) {
        const tWave = Math.sin(time * 4 + t * 1.1) * 4;
        ctx.fillStyle = t === 0 ? sCol : fCol;
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(-12, t * 2);
        ctx.bezierCurveTo(-24, t * 8 + tWave - 6, -34, t * 7 + tWave, -37, t * 4 + tWave);
        ctx.bezierCurveTo(-30, t * 5 + 6 + tWave, -20, t * 4 + 4, -12, t * 2 + 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Bounding legs
      ctx.strokeStyle = pCol;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-9, 6); ctx.lineTo(-14 - gallop * 5, 16);
      ctx.moveTo(-6, 6); ctx.lineTo(-9 + gallop * 4, 15);
      ctx.moveTo(10, 5); ctx.lineTo(15 + gallop * 6, 15);
      ctx.moveTo(7, 5); ctx.lineTo(10 - gallop * 4, 16);
      ctx.stroke();

      // Sleek luminous fox torso + chest ruff + pointed snout & ears
      ctx.fillStyle = pCol;
      ctx.strokeStyle = sCol;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(0, 1, 15, 7.5, -0.05, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Fluffy snow-white frost chest ruff
      ctx.fillStyle = sCol;
      ctx.beginPath();
      ctx.ellipse(12, 1, 6, 6.5, 0.2, 0, TAU);
      ctx.fill();

      // Head & fox ears
      ctx.fillStyle = pCol;
      ctx.beginPath();
      ctx.moveTo(11, -3);
      ctx.lineTo(16, -9);
      ctx.lineTo(25, -4);
      ctx.lineTo(28, -1); // Fox muzzle
      ctx.lineTo(20, 3);
      ctx.lineTo(12, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tall frost-tipped ears
      ctx.fillStyle = fCol;
      ctx.beginPath();
      ctx.moveTo(14, -8); ctx.lineTo(12, -17); ctx.lineTo(18, -10); ctx.closePath();
      ctx.moveTo(17, -7); ctx.lineTo(17, -15); ctx.lineTo(21, -8); ctx.closePath();
      ctx.fill();

      // Glowing arctic blue eye
      drawEye(ctx, 20.5, -4, 2.0, '#67e8f9', true);
      return true;
    }

    // 3. Hermit-Crab Village — giant crab carrying a tiny lantern-lit inhabited harbor town
    if (sh === 'hermit_village') {
      const step = Math.sin(time * 2.8);
      // Giant crab walking legs & massive pincer claw
      ctx.strokeStyle = pCol;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const lx = 4 + i * 6;
        const dy = ((i % 2 === 0 ? 1 : -1) * step) * 2.5;
        ctx.beginPath();
        ctx.moveTo(lx, 10);
        ctx.lineTo(lx + 4, 21 + dy);
        ctx.lineTo(lx - 1, 26 + dy);
        ctx.stroke();
      }
      // Big snapping front claw
      ctx.fillStyle = pCol;
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(15, 11);
      ctx.quadraticCurveTo(28, 6, 32, 13);
      ctx.lineTo(24, 15);
      ctx.lineTo(31, 18);
      ctx.quadraticCurveTo(22, 22, 15, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Giant spiral conch shell home
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(-4, 4, 23, 15, -0.15, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Shell spiral lines
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(-14, 4, 9, 0.5, Math.PI * 1.7);
      ctx.arc(-8, 4, 13, 0.4, Math.PI * 1.6);
      ctx.stroke();

      // Tiny inhabited harbor town perched on the shell!
      // Cottage 1 + Cottage 2
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-13, -15, 10, 9);
      ctx.fillRect(-1, -13, 9, 8);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-15, -15); ctx.lineTo(-8, -21); ctx.lineTo(-1, -15); ctx.closePath();
      ctx.moveTo(-2, -13); ctx.lineTo(3.5, -18); ctx.lineTo(9, -13); ctx.closePath();
      ctx.fill();

      // Lighthouse tower on summit
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(8, -24, 6, 15);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(11, -25, 3, 0, TAU);
      ctx.fill();

      // Warm lit tiny village windows
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-10, -12, 3, 3);
      ctx.fillRect(-6, -12, 2, 3);
      ctx.fillRect(2, -10, 3, 3);

      // Crab stalked eyes peeking under rim
      drawEye(ctx, 18, 4, 2.2, '#facc15');
      drawEye(ctx, 22, 6, 2.0, '#facc15');
      return true;
    }

    // 4. Ocean Djinn — glowing spirit emerging from an ancient bronze Atlantean jar
    if (sh === 'ocean_djinn') {
      // Ancient cracked bronze amphora vessel at bottom-left
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(-14, 10, 9, 12, 0.45, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-10, -2, 8, 5);

      // Swirling cyan/teal djinn smoke rising from bottle mouth
      ctx.fillStyle = pCol;
      ctx.strokeStyle = sCol;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-8, 1);
      ctx.bezierCurveTo(-10, -10, 4, -14, 14, -12);
      ctx.bezierCurveTo(22, -10, 20, 2, 10, 4);
      ctx.bezierCurveTo(2, 6, -4, 4, -8, 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crowned Djinn head & flowing ethereal beard/crest
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(13, -15, 6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(9, -19); ctx.lineTo(13, -25); ctx.lineTo(17, -19); ctx.closePath();
      ctx.fill();

      // Folded bracers
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(6, -8); ctx.lineTo(18, -6 + wave * 0.3);
      ctx.stroke();

      drawEye(ctx, 15, -15.5, 2.0, '#fde047', true);
      return true;
    }

    // 5. Living Shipwreck — sunken galleon hull that awakens with glowing porthole chambers, fins & eyes
    if (sh === 'living_shipwreck') {
      // Sweeping wooden oar-fins rowing along sides
      const oarSweep = Math.sin(time * 2.5) * 5 * (0.4 + wake * 0.6);
      ctx.fillStyle = '#0f766e';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-4, 10);
      ctx.quadraticCurveTo(-14, 24 + oarSweep, -22, 22 + oarSweep);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Broken ship hull
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(-26, -6);
      ctx.lineTo(16, -8);
      ctx.lineTo(27, -2);
      ctx.lineTo(20, 12);
      ctx.lineTo(-20, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Broken mainmast & ragged sail
      ctx.fillStyle = '#475569';
      ctx.fillRect(-3, -28, 4.5, 21);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.beginPath();
      ctx.moveTo(1.5, -26);
      ctx.quadraticCurveTo(14, -18, 11, -10);
      ctx.lineTo(1.5, -10);
      ctx.closePath();
      ctx.fill();

      // Hidden chamber hatch splitting open vertically with golden treasure glint
      if (wake > 0.25) {
        ctx.fillStyle = `rgba(250, 204, 21, ${(wake * 0.85).toFixed(2)})`;
        ctx.fillRect(-13, -1, 10, 7 * wake);
        ctx.strokeStyle = '#78350f';
        ctx.strokeRect(-13, -1, 10, 7 * wake);
      }

      // Awakening glowing porthole eyes
      for (const px of [5, 14]) {
        drawEye(ctx, px, 1, 2.5, wake > 0.4 ? '#fde047' : '#64748b', wake > 0.4);
      }
      return true;
    }

    // 6. Mirror Creature — chrome mirror body revealing an animated window into another realm!
    if (sh === 'mirror_creature') {
      // Sleek silver mirror body path
      const drawMirrorPath = () => {
        ctx.beginPath();
        ctx.moveTo(-22, 0);
        ctx.bezierCurveTo(-15, -17, 10, -16, 23, -1);
        ctx.bezierCurveTo(10, 16, -15, 17, -22, 0);
        ctx.closePath();
      };

      // Fins
      ctx.fillStyle = fCol;
      ctx.beginPath();
      ctx.moveTo(-20, 0); ctx.lineTo(-32, -11 + wave * 0.5); ctx.lineTo(-26, 0); ctx.lineTo(-32, 11 - wave * 0.5); ctx.closePath();
      ctx.fill();

      // Clipped interior showing a miniature volcano / sunset horizon of another realm!
      ctx.save();
      drawMirrorPath();
      ctx.clip();

      let skyG = '#312e81';
      try {
        skyG = ctx.createLinearGradient(0, -16, 0, 16);
        skyG.addColorStop(0, '#4c1d95');
        skyG.addColorStop(0.55, '#ec4899');
        skyG.addColorStop(1, '#f97316');
      } catch { /* fallback */ }
      ctx.fillStyle = skyG;
      ctx.fillRect(-24, -18, 48, 36);

      // Tiny silhouette mountain/volcano & drifting star inside the mirror fish!
      const shift = Math.sin(time * 0.9) * 4;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-24, 18); ctx.lineTo(-8 + shift, -2); ctx.lineTo(4 + shift, 8); ctx.lineTo(14 + shift, -5); ctx.lineTo(25, 18);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-6 - shift * 0.5, -7, 2.5, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Polished beveled chrome mirror border
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.0;
      drawMirrorPath();
      ctx.stroke();

      drawEye(ctx, 14, -3, 2.3, '#38bdf8', true);
      return true;
    }

    // 7. Coral Guardian — ancient carved statue encrusted with coral that awakens cleanly
    if (sh === 'coral_guardian') {
      // Branching staghorn coral crown sprouting atop statue head
      ctx.strokeStyle = fCol;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      for (const bx of [-6, 0, 6]) {
        ctx.beginPath();
        ctx.moveTo(bx * 0.6, -15);
        ctx.quadraticCurveTo(bx * 1.4, -24, bx * 1.7, -28 + wave * 0.25);
        ctx.stroke();
      }

      // Chiseled Atlantean granite body + carved shoulder pauldrons
      ctx.fillStyle = pCol;
      ctx.strokeStyle = wake > 0.45 ? sCol : '#334155';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-14, 14);
      ctx.lineTo(-16, -6);
      ctx.lineTo(-9, -15);
      ctx.lineTo(9, -15);
      ctx.lineTo(16, -6);
      ctx.lineTo(14, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Orbiting stone pauldrons that lift when awake
      const lift = wake * 4 + Math.sin(time * 2) * 1.5;
      ctx.fillRect(-23, -8 - lift, 6, 12);
      ctx.fillRect(17, -8 - lift, 6, 12);

      // Awakening rune core & stone eyes
      if (wake > 0.2) {
        ctx.fillStyle = sCol;
        ctx.beginPath();
        ctx.moveTo(0, -3); ctx.lineTo(4, 2); ctx.lineTo(0, 7); ctx.lineTo(-4, 2); ctx.closePath();
        ctx.fill();
      }
      drawEye(ctx, -4.5, -9, 2.0, wake > 0.4 ? '#22d3ee' : '#1e293b', wake > 0.4);
      drawEye(ctx, 4.5, -9, 2.0, wake > 0.4 ? '#22d3ee' : '#1e293b', wake > 0.4);
      return true;
    }

    // 8. Origami Koi — crisp geometric folded paper polygons & crease lines
    if (sh === 'origami_koi') {
      const flutter = Math.sin(time * 3.5) * 2.5;
      // Pleated geometric paper tail
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-16, 0); ctx.lineTo(-30, -12 + flutter); ctx.lineTo(-24, 0); ctx.closePath();
      ctx.moveTo(-16, 0); ctx.lineTo(-30, 12 - flutter); ctx.lineTo(-24, 0); ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Faceted folded body triangles (crisp origami pleats!)
      const facets = [
        [[-16, 0], [-4, -12], [6, -3], '#f8fafc'],
        [[-16, 0], [6, -3], [-2, 11], '#e2e8f0'],
        [[-4, -12], [14, -9], [6, -3], '#ef4444'], // Vermilion paper fold
        [[6, -3], [14, -9], [23, 0], '#f8fafc'],
        [[6, -3], [23, 0], [10, 9], '#f1f5f9'],
        [[-2, 11], [6, -3], [10, 9], '#ef4444'],
      ];
      for (const [a, b, c, fill] of facets) {
        ctx.fillStyle = fill;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Triangular paper dorsal & pectoral fins
      ctx.fillStyle = fCol;
      ctx.beginPath();
      ctx.moveTo(2, -9); ctx.lineTo(-6, -18); ctx.lineTo(-8, -9); ctx.closePath();
      ctx.moveTo(4, 5); ctx.lineTo(-4, 15 + flutter * 0.4); ctx.lineTo(-7, 7); ctx.closePath();
      ctx.fill();
      ctx.stroke();

      drawEye(ctx, 15.5, -2.2, 2.0, '#0f172a');
      return true;
    }

    // 9. Deep-Sea Witch — kelp-bell wide brimmed sea-witch with potion lantern & pearl familiars
    if (sh === 'deep_sea_witch') {
      const bob = Math.sin(time * 2.2) * 2.5;
      // Drifting bioluminescent cloak ribbons
      ctx.fillStyle = pCol;
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.quadraticCurveTo(-22, 8 + bob, -28, 16 - wave * 0.6);
      ctx.quadraticCurveTo(-14, 18, 4, 12);
      ctx.quadraticCurveTo(10, 4, 4, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wide jellyfish-bell sea-witch hat
      ctx.fillStyle = '#3b0764';
      ctx.strokeStyle = sCol;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.quadraticCurveTo(0, -14, 16, -6);
      ctx.quadraticCurveTo(8, -14, 3, -24);
      ctx.quadraticCurveTo(-5, -17, -12, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Orbiting luminous pearl familiars
      for (let i = 0; i < 3; i++) {
        const oa = time * 2.4 + i * (TAU / 3);
        const ox = Math.cos(oa) * 20;
        const oy = Math.sin(oa) * 11;
        ctx.fillStyle = sCol;
        ctx.beginPath();
        ctx.arc(ox, oy, 2.1, 0, TAU);
        ctx.fill();
      }

      // Glowing potion lantern staff held forward
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(4, 2); ctx.lineTo(19, -4 + bob * 0.4);
      ctx.stroke();
      ctx.fillStyle = 'rgba(45, 212, 191, 0.35)';
      ctx.beginPath();
      ctx.arc(21, -2 + bob * 0.4, 5.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#5eead4';
      ctx.beginPath();
      ctx.arc(21, -2 + bob * 0.4, 2.6, 0, TAU);
      ctx.fill();

      drawEye(ctx, 7.5, -3.5, 2.3, '#f0abfc', true);
      return true;
    }
  } finally {
    ctx.restore();
  }
  return false;
}

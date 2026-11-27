// Modular visual overhaul for fallback fish shapes, generic classes (eel, ray, shark, swordfish, narwhal),
// and Magma Caldera Trench styling. Flip ENHANCED_FISH_VISUALS to false to instantly restore classic rendering.
export const ENHANCED_FISH_VISUALS = true;

const TAU = Math.PI * 2;

const HANDLED_SHAPES = new Set([
  // Generic classes upgraded across all realms
  'eel', 'ribbon_eel', 'ray', 'flatfish', 'shark', 'swordfish', 'narwhal',
  // Previously unmapped / fallback-to-ellipse shapes
  'predator', 'angler', 'dragonfish', 'scorpionfish', 'boxfish', 'triggerfish',
  'tuna', 'tapered', 'lanternfish', 'catfish', 'blobfish', 'piranha', 'puffer',
]);

export function isEnhancedFishShape(species) {
  if (!ENHANCED_FISH_VISUALS || !species || species.isLeviathan) return false;
  return HANDLED_SHAPES.has(species.shape);
}

function hashSeed(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeBodyGradient(ctx, topColor, bottomColor, x0, y0, x1, y1) {
  try {
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, topColor);
    grad.addColorStop(0.55, topColor);
    grad.addColorStop(1, bottomColor);
    return grad;
  } catch {
    return topColor;
  }
}

function drawEye(ctx, x, y, r = 2.6, eyeColor = '#f8fafc', fierce = false) {
  ctx.save();
  ctx.fillStyle = eyeColor || '#f8fafc';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  if (fierce) {
    ctx.ellipse(x + r * 0.18, y, r * 0.28, r * 0.64, 0, 0, TAU);
  } else {
    ctx.arc(x + r * 0.22, y, r * 0.52, 0, TAU);
  }
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + r * 0.28, y - r * 0.3, Math.max(0.5, r * 0.26), 0, TAU);
  ctx.fill();

  if (fierce) {
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.9, y - r * 0.95);
    ctx.lineTo(x + r * 0.9, y - r * 0.45);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFin(ctx, x, y, width, height, color, strokeColor = 'rgba(15, 23, 42, 0.45)') {
  ctx.save();
  const baseHalf = Math.max(4.5, Math.abs(width) * 0.42);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + baseHalf * 0.65, y);
  ctx.quadraticCurveTo(x + baseHalf * 0.25, y + height * 0.85, x - width * 0.55, y + height);
  ctx.quadraticCurveTo(x - width * 1.05, y + height * 0.72, x - baseHalf * 1.15, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Subtle translucent fin rays for real fin texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y + height * 0.08);
  ctx.lineTo(x - width * 0.42, y + height * 0.78);
  ctx.moveTo(x - baseHalf * 0.4, y + height * 0.08);
  ctx.lineTo(x - width * 0.72, y + height * 0.62);
  ctx.stroke();
  ctx.restore();
}

function drawForkedTail(ctx, x, halfH, span, color, wave = 0, upperBias = 1) {
  ctx.save();
  const baseY = Math.max(2.6, halfH * 0.28);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.48)';
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  ctx.moveTo(x + 3, -baseY);
  ctx.quadraticCurveTo(x - span * 0.45, -halfH * 0.52 * upperBias, x - span, -halfH * upperBias + wave * 0.65);
  ctx.quadraticCurveTo(x - span * 0.62, -halfH * 0.12 + wave * 0.25, x - span * 0.42, wave * 0.25);
  ctx.quadraticCurveTo(x - span * 0.62, halfH * 0.14 + wave * 0.25, x - span * (upperBias > 1 ? 0.8 : 1), halfH + wave * 0.65);
  ctx.quadraticCurveTo(x - span * 0.45, halfH * 0.52, x + 3, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPatternMarks(ctx, species, l, h, secondary, finColor, isCaldera) {
  const pattern = species.pattern;
  const seed = hashSeed(species.id || species.name || '');
  ctx.save();
  ctx.globalAlpha *= isCaldera ? 0.52 : 0.6;
  ctx.strokeStyle = secondary;
  ctx.fillStyle = secondary;
  ctx.lineWidth = 1.25;

  if (pattern === 'stripe') {
    ctx.beginPath();
    ctx.moveTo(-l * 0.65, -h * 0.08);
    ctx.quadraticCurveTo(0, -h * 0.22, l * 0.42, -h * 0.05);
    ctx.stroke();
  } else if (pattern === 'bands') {
    // Organic curved gill/chevron saddles kept behind the eye
    for (let i = 0; i < 3; i++) {
      const bx = -l * 0.52 + i * (l * 0.32);
      ctx.beginPath();
      ctx.moveTo(bx, -h * 0.92);
      ctx.quadraticCurveTo(bx - 3, 0, bx, h * 0.85);
      ctx.stroke();
    }
  } else if (pattern === 'spots') {
    for (let i = 0; i < 6; i++) {
      const sx = -l * 0.56 + (i % 3) * (l * 0.32) + ((seed + i) % 3);
      const sy = -h * 0.42 + Math.floor(i / 3) * (h * 0.48);
      ctx.beginPath();
      ctx.arc(sx, sy, 1.3 + (i % 2) * 0.55, 0, TAU);
      ctx.fill();
    }
  } else if (pattern === 'diamonds' || isCaldera) {
    // Subtle organic scale/ember shimmer arcs instead of loud bars
    ctx.strokeStyle = isCaldera ? finColor : secondary;
    ctx.lineWidth = 1.0;
    for (let i = 0; i < 4; i++) {
      const sx = -l * 0.52 + i * (l * 0.24);
      const sy = (i % 2 === 0 ? -1 : 1) * h * 0.18;
      ctx.beginPath();
      ctx.arc(sx, sy, 3.2, -0.7, 0.7);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCrab(ctx, species, primary, secondary, finColor, time) {
  const wave = Math.sin(time * 2.4) * 1.6;
  const name = (species.name || '').toLowerCase();
  const isGear = name.includes('gear');
  const isCaldera = species.zone === 6 || name.includes('caldera') || name.includes('magma');

  // 3 pairs of jointed legs on each side
  ctx.strokeStyle = primary;
  ctx.lineWidth = 2.4;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const lx = -10 + i * 7;
      const step = Math.sin(time * 3 + i * 1.4 + (side > 0 ? Math.PI : 0)) * 2.2;
      ctx.beginPath();
      ctx.moveTo(lx, side * 9);
      ctx.lineTo(lx - 4, side * (19 + i * 0.6) + step);
      ctx.lineTo(lx - 9, side * 24 + step);
      ctx.stroke();
    }
  }

  // Front snapping pincers
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(15, side * 10);
    ctx.rotate(side * (0.25 + wave * 0.04));
    ctx.fillStyle = finColor;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(9, -side * 5, 14, -side * 1);
    ctx.lineTo(8, side * 1);
    ctx.lineTo(13, side * 4);
    ctx.quadraticCurveTo(5, side * 6, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Carapace shell
  ctx.fillStyle = makeBodyGradient(ctx, primary, secondary, 0, -14, 0, 14);
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  if (isGear) {
    const teeth = 10;
    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * TAU;
      const a2 = ((i + 0.5) / teeth) * TAU;
      const rx1 = Math.cos(a1) * 18;
      const ry1 = Math.sin(a1) * 14;
      const rx2 = Math.cos(a2) * 15;
      const ry2 = Math.sin(a2) * 11.5;
      if (i === 0) ctx.moveTo(rx1, ry1);
      else ctx.lineTo(rx1, ry1);
      ctx.lineTo(rx2, ry2);
    }
    ctx.closePath();
  } else {
    ctx.moveTo(-16, 0);
    ctx.bezierCurveTo(-15, -15, 6, -16, 15, -7);
    ctx.lineTo(17, 0);
    ctx.lineTo(15, 7);
    ctx.bezierCurveTo(6, 16, -15, 15, -16, 0);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();

  if (isGear) {
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, TAU);
    ctx.stroke();
  } else if (isCaldera) {
    ctx.strokeStyle = finColor;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-7, -5); ctx.lineTo(-1, -1); ctx.lineTo(-6, 4);
    ctx.moveTo(1, -6); ctx.lineTo(5, 0); ctx.lineTo(0, 6);
    ctx.stroke();
  }

  // Stalked eyes
  drawEye(ctx, 13, -5, 2.2, species.eyeColor);
  drawEye(ctx, 13, 5, 2.2, species.eyeColor);
  return true;
}

function drawEel(ctx, species, primary, secondary, finColor, time) {
  const name = (species.name || '').toLowerCase();
  const isRibbon = species.shape === 'ribbon_eel' || name.includes('oarfish') || name.includes('wisp');
  const isCaldera = species.zone === 6 || name.includes('sunfire') || name.includes('molten') || name.includes('crimson') || name.includes('lava') || name.includes('fireglass');
  const len = isRibbon ? 34 : 30;
  const pts = [];
  const segs = 6;

  for (let i = 0; i <= segs; i++) {
    const tNorm = i / segs; // 0 = tail, 1 = snout
    const x = -len + tNorm * len * 1.9;
    const amp = (1 - tNorm * 0.72) * (isRibbon ? 4.8 : 3.4);
    const y = Math.sin(time * 2.6 - tNorm * 4.2) * amp;
    const r = (tNorm < 0.2 ? tNorm * 5 : 1 - Math.max(0, tNorm - 0.8) * 1.4) * (isRibbon ? 5.2 : 6.4);
    pts.push({ x, y, r: Math.max(1.5, r) });
  }

  // Continuous dorsal & caudal ribbon fin behind body
  ctx.save();
  ctx.fillStyle = finColor;
  ctx.globalAlpha *= 0.84;
  ctx.beginPath();
  ctx.moveTo(pts[0].x - 7, pts[0].y);
  for (let i = 0; i < pts.length - 1; i++) {
    ctx.lineTo(pts[i].x, pts[i].y - pts[i].r - (isRibbon ? 4.2 : 2.6));
  }
  ctx.lineTo(pts[pts.length - 1].x - 4, pts[pts.length - 1].y - 3);
  for (let i = pts.length - 2; i >= 0; i--) {
    ctx.lineTo(pts[i].x, pts[i].y + pts[i].r * 0.7);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Sinuous tapered body polygon
  ctx.save();
  ctx.fillStyle = makeBodyGradient(ctx, primary, secondary, 0, -8, 0, 8);
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(pts[0].x - 3, pts[0].y);
  for (let i = 0; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y - pts[i].r);
  }
  ctx.quadraticCurveTo(pts[segs].x + 6, pts[segs].y, pts[segs].x + 4, pts[segs].y + 2);
  for (let i = pts.length - 1; i >= 0; i--) {
    ctx.lineTo(pts[i].x, pts[i].y + pts[i].r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Organic lateral shimmer or spots along spine (never vertical bars over the eye)
  ctx.save();
  ctx.clip();
  if (isCaldera) {
    // Sleek glowing molten lateral vein that curves softly along the lower flank behind head
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < pts.length - 1; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y + 1.2);
      else ctx.lineTo(pts[i].x, pts[i].y + 1.2);
    }
    ctx.stroke();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  } else if (species.pattern === 'spots' || species.pattern === 'diamonds') {
    ctx.fillStyle = secondary;
    ctx.globalAlpha *= 0.65;
    for (let i = 1; i < pts.length - 1; i++) {
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y - 1.2, 1.4, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  // Head jaw accent & clear unobstructed eye
  const head = pts[segs];
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(head.x - 1, head.y + 1.8);
  ctx.lineTo(head.x + 4.5, head.y + 1.2);
  ctx.stroke();

  if (isRibbon && name.includes('oarfish')) {
    // Crimson/silver crest plume
    ctx.strokeStyle = finColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(head.x - 2, head.y - 3);
    ctx.quadraticCurveTo(head.x - 8, head.y - 14, head.x - 15, head.y - 12);
    ctx.stroke();
  }

  drawEye(ctx, head.x - 3.5, head.y - 1.8, 2.2, species.eyeColor);
  ctx.restore();
  return true;
}

function drawRay(ctx, species, primary, secondary, finColor, time) {
  const isFlatfish = species.shape === 'flatfish';
  const flap = Math.sin(time * 2.3) * 3.8;
  const name = (species.name || '').toLowerCase();
  const isManta = name.includes('manta') || name.includes('throne') || name.includes('voidray') || name.includes('shimmer');
  const wingSpan = isFlatfish ? 15 : 22;

  ctx.save();
  // Whip tail
  ctx.strokeStyle = finColor;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.quadraticCurveTo(-27, flap * 0.7, -40, flap * 0.4);
  ctx.stroke();

  if (isFlatfish) {
    // Asymmetric rippled fin border
    ctx.fillStyle = finColor;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 21, 14.5, 0, 0, TAU);
    ctx.fill();
  }

  // Smooth curved wing disc
  ctx.fillStyle = makeBodyGradient(ctx, primary, secondary, -10, -wingSpan, 14, wingSpan);
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  if (isManta) {
    ctx.moveTo(20, -4);
    ctx.lineTo(25, -7); // cephalic lobe
    ctx.quadraticCurveTo(10, -wingSpan * 0.9, -4, -wingSpan + flap);
    ctx.quadraticCurveTo(-13, -wingSpan * 0.45, -16, 0);
    ctx.quadraticCurveTo(-13, wingSpan * 0.45, -4, wingSpan - flap);
    ctx.quadraticCurveTo(10, wingSpan * 0.9, 25, 7);
    ctx.lineTo(20, 4);
    ctx.quadraticCurveTo(22, 0, 20, -4);
  } else {
    ctx.moveTo(20, 0);
    ctx.bezierCurveTo(12, -wingSpan * 0.82, -6, -wingSpan - 2 + flap, -15, -6);
    ctx.quadraticCurveTo(-18, 0, -15, 6);
    ctx.bezierCurveTo(-6, wingSpan + 2 - flap, 12, wingSpan * 0.82, 20, 0);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Internal disc markings
  ctx.save();
  ctx.clip();
  ctx.fillStyle = secondary;
  ctx.globalAlpha *= 0.45;
  for (let i = 0; i < 6; i++) {
    const mx = -7 + (i % 3) * 6;
    const my = -8 + Math.floor(i / 3) * 16;
    ctx.beginPath();
    ctx.arc(mx, my, 1.7 + (i % 2) * 0.7, 0, TAU);
    ctx.fill();
  }
  // Center spinal ridge
  ctx.strokeStyle = secondary;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(13, 0);
  ctx.stroke();
  ctx.restore();

  if (isFlatfish) {
    drawEye(ctx, 11, -4.5, 2.0, species.eyeColor);
    drawEye(ctx, 8, -0.5, 1.9, species.eyeColor);
  } else {
    drawEye(ctx, 10, -4.5, 2.0, species.eyeColor);
    drawEye(ctx, 10, 4.5, 2.0, species.eyeColor);
  }
  ctx.restore();
  return true;
}

function drawApexPelagic(ctx, species, primary, secondary, finColor, time) {
  const sh = species.shape;
  const name = (species.name || '').toLowerCase();
  const wave = Math.sin(time * 2.2) * 2.8;
  const isHammer = name.includes('hammerhead');
  const isSturgeon = name.includes('sturgeon');
  const isBillfish = sh === 'swordfish';
  const isNarwhal = sh === 'narwhal';
  const isRainbowNarwhal = species.name === 'Rainbow Narwhal';

  ctx.save();
  const len = isBillfish ? 27 : 29;
  const h = isNarwhal ? 13 : 11.5;

  // Tail fluke (asymmetric heterocercal shark tail vs symmetric crescent vs horizontal whale fluke)
  if (isNarwhal) {
    drawForkedTail(ctx, -len + 2, 11, 14, finColor, wave, 1.0);
  } else if (sh === 'shark') {
    drawForkedTail(ctx, -len + 2, 12, 16, finColor, wave, 1.35);
  } else {
    drawForkedTail(ctx, -len + 1, 12, 17, finColor, wave, 1.0);
  }

  // Swept dorsal fin (tall sail if marlin/flarecrest)
  if (!isNarwhal) {
    const dorsalH = name.includes('sail') || name.includes('marlin') || name.includes('flarecrest') ? -24 : -21;
    ctx.fillStyle = finColor;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(-4, -h * 0.72);
    ctx.quadraticCurveTo(1, dorsalH, 6, dorsalH + 3);
    ctx.quadraticCurveTo(5, -h * 0.75, 12, -h * 0.68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Sculpted body silhouette
  let bodyFill = makeBodyGradient(ctx, primary, secondary, 0, -h, 0, h);
  if (isRainbowNarwhal) {
    try {
      const rb = ctx.createLinearGradient(-28, 0, 28, 0);
      rb.addColorStop(0, '#f472b6');
      rb.addColorStop(0.5, '#a78bfa');
      rb.addColorStop(1, '#67e8f9');
      bodyFill = rb;
    } catch { /* fallback to gradient */ }
  }

  ctx.fillStyle = bodyFill;
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.58)';
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(-len, 0);
  ctx.bezierCurveTo(-len * 0.6, -h * 1.18, len * 0.48, -h * 1.15, len, isNarwhal ? -3 : -1);
  if (isNarwhal) {
    ctx.bezierCurveTo(len + 3, 2, len * 0.7, h * 0.95, len * 0.3, h);
  } else {
    ctx.quadraticCurveTo(len + 2, 2, len * 0.75, h * 0.65);
  }
  ctx.bezierCurveTo(len * 0.3, h * 1.05, -len * 0.55, h * 1.02, -len, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Spear bill / spiraled ivory tusk
  if (isBillfish) {
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(len - 2, -2.2);
    ctx.lineTo(len + 20, -0.5);
    ctx.lineTo(len - 2, 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (isNarwhal) {
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(len - 2, -4);
    ctx.lineTo(len + 24, -6.5);
    ctx.lineTo(len - 2, 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Spiral tusk ridges
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 0.7;
    for (let t = 0; t < 4; t++) {
      const tx = len + 3 + t * 4.5;
      ctx.beginPath();
      ctx.moveTo(tx, -4.3);
      ctx.lineTo(tx + 2, -1.8);
      ctx.stroke();
    }
  }

  // Gill slits on sharks/sturgeons or scute ridge on sturgeon
  if (sh === 'shark') {
    ctx.strokeStyle = species.zone === 6 ? '#f97316' : 'rgba(15, 23, 42, 0.55)';
    ctx.lineWidth = 1.25;
    for (let g = 0; g < 3; g++) {
      ctx.beginPath();
      ctx.moveTo(8 + g * 3.2, -3.5);
      ctx.lineTo(6.5 + g * 3.2, 3.5);
      ctx.stroke();
    }
  }
  if (isSturgeon) {
    ctx.fillStyle = secondary;
    for (let s = -2; s <= 1; s++) {
      ctx.beginPath();
      ctx.moveTo(s * 8, -h + 1);
      ctx.lineTo(s * 8 + 4, -h - 2.5);
      ctx.lineTo(s * 8 + 7, -h + 1.5);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Markings & pectoral fin
  drawPatternMarks(ctx, species, len, h, secondary, finColor, species.zone === 6);
  drawFin(ctx, 4, 4, 12, 9 + wave * 0.35, finColor);

  if (isHammer) {
    ctx.fillStyle = primary;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(len - 8, -11, 7, 22, 3) : ctx.rect(len - 8, -11, 7, 22);
    ctx.fill();
    ctx.stroke();
    drawEye(ctx, len - 4.5, -8.5, 2.0, species.eyeColor, true);
    drawEye(ctx, len - 4.5, 8.5, 2.0, species.eyeColor, true);
  } else {
    drawEye(ctx, len - 8, -3.2, 2.5, species.eyeColor, sh === 'shark');
  }

  ctx.restore();
  return true;
}

function drawSpecializedFish(ctx, species, primary, secondary, finColor, time) {
  const sh = species.shape;
  const name = (species.name || '').toLowerCase();
  const wave = Math.sin(time * 2.6) * 2.8;
  const finRow = Math.sin(time * 3.2) * 2.4;
  const isCaldera = species.zone === 6;

  // Pick body silhouette archetype
  let l = 22;
  let h = 11.5;
  let fierce = false;
  let tailUpperBias = 1.0;

  if (sh === 'tuna' || sh === 'tapered') {
    l = sh === 'tapered' ? 24 : 25;
    h = sh === 'tapered' ? 8.5 : 11;
    tailUpperBias = 1.05;
  } else if (sh === 'triggerfish') {
    l = 20;
    h = 15;
  } else if (sh === 'boxfish') {
    l = 19;
    h = 14;
  } else if (sh === 'angler' || sh === 'dragonfish' || sh === 'predator') {
    l = sh === 'angler' ? 20 : 26;
    h = sh === 'angler' ? 14 : 9.5;
    fierce = true;
  } else if (sh === 'catfish' || sh === 'piranha' || sh === 'blobfish') {
    l = sh === 'blobfish' ? 18 : 22;
    h = sh === 'piranha' ? 14 : 11;
    fierce = sh === 'piranha';
  } else if (sh === 'scorpionfish') {
    l = 20;
    h = 14.5;
  } else if (sh === 'ribbon_eel') {
    l = 18;
    h = 10;
  }

  ctx.save();

  // Tail fin tailored to archetype
  if (sh === 'ribbon_eel') {
    // Flowing veil-tail guppy
    ctx.fillStyle = finColor;
    ctx.globalAlpha *= 0.85;
    ctx.beginPath();
    ctx.moveTo(-l + 3, 0);
    ctx.bezierCurveTo(-l - 8, -14 + wave, -l - 22, -16 + wave * 1.4, -l - 20, wave);
    ctx.bezierCurveTo(-l - 22, 16 + wave * 1.4, -l - 8, 14 + wave, -l + 3, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha /= 0.85;
  } else if (sh === 'tuna' || sh === 'tapered') {
    drawForkedTail(ctx, -l + 2, h * 0.95, 14, finColor, wave, tailUpperBias);
  } else {
    drawFin(ctx, -l + 2, 0, 12, -8 - wave * 0.4, finColor);
    drawFin(ctx, -l + 2, 0, 12, 8 - wave * 0.4, finColor);
  }

  // Dorsal & ventral fins
  if (sh === 'triggerfish' || sh === 'scorpionfish') {
    drawFin(ctx, -2, -h * 0.72, 14, -12 + wave * 0.3, finColor);
    drawFin(ctx, -2, h * 0.72, 12, 10 - wave * 0.3, finColor);
  } else if (sh === 'tuna') {
    drawFin(ctx, 2, -h * 0.78, 10, -10, finColor);
    // Tuna finlets
    ctx.fillStyle = finColor;
    for (let f = 0; f < 3; f++) {
      ctx.beginPath();
      ctx.moveTo(-l * 0.4 - f * 4.5, -h * 0.52);
      ctx.lineTo(-l * 0.4 - f * 4.5 - 2.5, -h * 0.82);
      ctx.lineTo(-l * 0.4 - f * 4.5 - 4, -h * 0.46);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    drawFin(ctx, 0, -h * 0.65, 11, -8 + wave * 0.3, finColor);
    drawFin(ctx, -2, h * 0.62, 9, 7 - wave * 0.3, finColor);
  }

  // Body path
  ctx.fillStyle = makeBodyGradient(ctx, primary, secondary, 0, -h, 0, h);
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.58)';
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  if (sh === 'boxfish') {
    ctx.moveTo(-l, -h * 0.45);
    ctx.lineTo(-l * 0.45, -h);
    ctx.lineTo(l * 0.65, -h * 0.8);
    ctx.lineTo(l, 0);
    ctx.lineTo(l * 0.7, h * 0.78);
    ctx.lineTo(-l * 0.5, h);
    ctx.lineTo(-l, h * 0.45);
  } else if (sh === 'predator' && (name.includes('gar') || name.includes('pike'))) {
    // Sleek armored gar/pike with projecting snout
    ctx.moveTo(-l, 0);
    ctx.bezierCurveTo(-l * 0.6, -h, l * 0.25, -h * 0.95, l * 0.55, -h * 0.42);
    ctx.lineTo(l + 9, -2);
    ctx.lineTo(l + 9, 1.5);
    ctx.lineTo(l * 0.55, h * 0.45);
    ctx.bezierCurveTo(l * 0.25, h * 0.95, -l * 0.6, h, -l, 0);
  } else if (sh === 'angler') {
    // Deep-bodied angler with jutting lower jaw
    ctx.moveTo(-l, 0);
    ctx.bezierCurveTo(-l * 0.6, -h * 1.25, l * 0.45, -h * 1.1, l * 0.85, -3);
    ctx.lineTo(l + 4, 2);
    ctx.lineTo(l + 1, 7);
    ctx.bezierCurveTo(l * 0.4, h * 1.25, -l * 0.65, h * 1.05, -l, 0);
  } else {
    ctx.moveTo(-l, 0);
    ctx.bezierCurveTo(-l * 0.68, -h * 1.22, l * 0.52, -h * 1.15, l, -1.5);
    ctx.bezierCurveTo(l * 0.82, h * 1.08, -l * 0.62, h * 1.18, -l, 0);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Markings clipped inside body
  ctx.save();
  ctx.clip();
  drawPatternMarks(ctx, species, l, h, secondary, finColor, isCaldera);
  // Subtle gill operculum arc
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(l * 0.42, -h * 0.45);
  ctx.quadraticCurveTo(l * 0.24, 0, l * 0.44, h * 0.48);
  ctx.stroke();
  ctx.restore();

  // Archetype signatures
  if (sh === 'angler') {
    // Glowing dangling esca lure
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(l * 0.35, -h * 0.85);
    ctx.quadraticCurveTo(l * 0.55, -h - 14, l + 8, -h * 0.4 + wave * 0.7);
    ctx.stroke();

    ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
    ctx.beginPath();
    ctx.arc(l + 8, -h * 0.4 + wave * 0.7, 5.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(l + 8, -h * 0.4 + wave * 0.7, 2.7, 0, TAU);
    ctx.fill();

    // Small teeth
    ctx.fillStyle = '#f8fafc';
    for (let t = 0; t < 3; t++) {
      ctx.beginPath();
      ctx.moveTo(l - 1 - t * 3, 2);
      ctx.lineTo(l - 2 - t * 3, -1);
      ctx.lineTo(l - 3 - t * 3, 2.5);
      ctx.closePath();
      ctx.fill();
    }
  } else if (sh === 'dragonfish') {
    // Photophore row + chin barbel
    ctx.fillStyle = '#67e8f9';
    for (let p = 0; p < 5; p++) {
      ctx.beginPath();
      ctx.arc(-l * 0.55 + p * 5.5, h * 0.55, 1.15, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(l * 0.7, h * 0.45);
    ctx.quadraticCurveTo(l * 0.5, h + 7, l * 0.25, h + 9 + wave * 0.5);
    ctx.stroke();
  } else if (sh === 'lanternfish') {
    ctx.fillStyle = '#fef08a';
    for (let p = 0; p < 4; p++) {
      ctx.beginPath();
      ctx.arc(-l * 0.45 + p * 5.5, h * 0.52, 1.3, 0, TAU);
      ctx.fill();
    }
  } else if (sh === 'catfish') {
    // Whisker barbels
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(l * 0.85, 2);
    ctx.quadraticCurveTo(l + 8, 5, l + 11, 10 + wave * 0.4);
    ctx.moveTo(l * 0.82, -1);
    ctx.quadraticCurveTo(l + 7, -4, l + 10, -7 + wave * 0.3);
    ctx.stroke();
  } else if (sh === 'predator' && (name.includes('gar') || name.includes('pike'))) {
    ctx.fillStyle = '#f8fafc';
    for (let t = 0; t < 3; t++) {
      ctx.beginPath();
      ctx.arc(l * 0.62 + t * 3.5, 0.5, 0.75, 0, TAU);
      ctx.fill();
    }
  }

  // Pectoral fin (smooth rowing beat) + crisp unobstructed eye
  drawFin(ctx, l * 0.25, 3, 9.5, 6.5 + (finRow || wave * 0.5), finColor);
  const eyeX = sh === 'blobfish' ? l * 0.56 : l * 0.64;
  const eyeY = sh === 'blobfish' ? -h * 0.62 : -h * 0.26;
  drawEye(ctx, eyeX, eyeY, sh === 'lanternfish' ? 3.1 : 2.5, species.eyeColor, fierce);
  ctx.restore();
  return true;
}

export function drawEnhancedFish(ctx, species, primary, secondary, finColor, time, fish = null) {
  if (!ENHANCED_FISH_VISUALS || !species || species.isLeviathan) return false;
  const sh = species.shape;
  if (!HANDLED_SHAPES.has(sh)) return false;

  const pCol = typeof primary === 'string' ? primary : (species.primaryColor || '#38bdf8');
  const sCol = typeof secondary === 'string' ? secondary : (species.secondaryColor || '#93c5fd');
  const fCol = typeof finColor === 'string' ? finColor : (species.finColor || '#0284c7');
  const name = (species.name || '').toLowerCase();

  if (name.includes('crab')) return drawCrab(ctx, species, pCol, sCol, fCol, time);
  if (sh === 'eel' || (sh === 'ribbon_eel' && name.includes('eel'))) return drawEel(ctx, species, pCol, sCol, fCol, time);
  if (sh === 'ray' || sh === 'flatfish') return drawRay(ctx, species, pCol, sCol, fCol, time);
  if (sh === 'shark' || sh === 'swordfish' || sh === 'narwhal') return drawApexPelagic(ctx, species, pCol, sCol, fCol, time);
  return drawSpecializedFish(ctx, species, pCol, sCol, fCol, time, fish);
}

// Replaces legacy Caldera vertical black jail-bars & shadowBlur with clean fiery volcanic accents
// positioned softly along lower/rear flanks so eyes and silhouettes always remain sharp.
export function renderCalderaEnhancedAccent(ctx, fish, primary, secondary, finColor) {
  if (!ENHANCED_FISH_VISUALS || !fish || !fish.species) return false;
  const sh = fish.species.shape || 'oval';
  const name = (fish.species.name || '').toLowerCase();

  ctx.save();
  if (sh === 'eel' || sh === 'serpent' || name.includes('serpent') || name.includes('oarfish') || name.includes('loach')) {
    // Sleek volcanic ember glint along the dorsal ridge instead of dark vertical bars
    ctx.fillStyle = 'rgba(251, 146, 60, 0.35)';
    ctx.beginPath();
    ctx.arc(-8, -1, 4.5, 0, TAU);
    ctx.fill();
  } else if (sh === 'squid' || sh === 'octopus') {
    // Soft fire-opal mantle highlight (no shadowBlur, no blocky tentacle rects)
    ctx.fillStyle = 'rgba(254, 240, 138, 0.48)';
    ctx.beginPath();
    ctx.arc(0, -3, 3.2, 0, TAU);
    ctx.fill();
  } else if (sh === 'ray' || sh === 'flatfish') {
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(-6, -12);
    ctx.quadraticCurveTo(4, -8, 6, 0);
    ctx.quadraticCurveTo(4, 8, -6, 12);
    ctx.stroke();
  } else if (sh === 'disc' || sh === 'boxfish') {
    // Subtle magma hearth core glow on rear flank (well clear of eye)
    ctx.fillStyle = 'rgba(249, 115, 22, 0.32)';
    ctx.beginPath();
    ctx.arc(-3, 1, 5.8, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  return true;
}

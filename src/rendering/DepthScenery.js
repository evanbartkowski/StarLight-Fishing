import { getRealmDepthZones } from '../data/RealmDepths.js';

function drawRocks(ctx, color, scale = 1, softRealm = false) {
  ctx.save();
  ctx.scale(scale, scale);
  // Bottom-fading gradient so rock ridges dissolve naturally into deep water
  try {
    const rockGrad = ctx.createLinearGradient(0, -24, 0, 60);
    if (softRealm) {
      rockGrad.addColorStop(0, '#0f3947');
      rockGrad.addColorStop(0.65, '#0c2e3b');
      rockGrad.addColorStop(1, 'rgba(12, 46, 59, 0.12)');
    } else {
      rockGrad.addColorStop(0, '#162d38');
      rockGrad.addColorStop(0.75, '#12242d');
      rockGrad.addColorStop(1, 'rgba(18, 36, 45, 0.2)');
    }
    ctx.fillStyle = rockGrad;
  } catch {
    ctx.fillStyle = softRealm ? '#0f3947' : '#152831';
  }

  ctx.beginPath();
  ctx.moveTo(-148, 58);
  ctx.quadraticCurveTo(-128, 22, -104, 14);
  ctx.quadraticCurveTo(-82, -10, -56, 6);
  ctx.quadraticCurveTo(-24, -22, 4, -8);
  ctx.quadraticCurveTo(38, 12, 68, -4);
  ctx.quadraticCurveTo(104, 4, 128, 24);
  ctx.lineTo(146, 58);
  ctx.closePath();
  ctx.fill();

  if (softRealm) {
    // Gentle sunlit upper crest rim (no harsh neon border)
    ctx.strokeStyle = 'rgba(153, 246, 228, 0.22)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-104, 14);
    ctx.quadraticCurveTo(-82, -10, -56, 6);
    ctx.quadraticCurveTo(-24, -22, 4, -8);
    ctx.quadraticCurveTo(38, 12, 68, -4);
    ctx.stroke();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // Subtle internal ridge depth fold
  ctx.fillStyle = softRealm ? 'rgba(6, 28, 38, 0.35)' : 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.moveTo(-62, 54);
  ctx.quadraticCurveTo(-28, 18, 8, 28);
  ctx.quadraticCurveTo(46, 16, 76, 54);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCoralCluster(ctx, color, time = 0, softRealm = false) {
  ctx.save();
  // Smooth rounded limestone coral mound (soft fade at bottom)
  ctx.fillStyle = softRealm ? '#0d3b49' : '#19313a';
  ctx.beginPath();
  ctx.ellipse(0, 46, 62, 16, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Layered smooth plate & brain coral domes
  ctx.fillStyle = softRealm ? 'rgba(20, 120, 118, 0.55)' : color;
  ctx.globalAlpha *= softRealm ? 0.85 : 0.72;
  for (const [cx, cy, rx, ry] of [[-26, 36, 20, 9], [18, 34, 24, 10], [-4, 24, 15, 7]]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // Tapered soft swaying kelp ribbons (filled tapering silhouettes instead of uniform thick pipes)
  ctx.fillStyle = softRealm ? 'rgba(13, 106, 98, 0.72)' : '#0f766e';
  for (const [kx, kh, w] of [[-48, 72, 6.5], [-16, 58, 5], [22, 64, 5.5], [46, 76, 6.5]]) {
    const kSway = Math.sin(time * 1.15 + kx * 0.1) * 9;
    ctx.beginPath();
    ctx.moveTo(kx - w * 0.5, 46);
    ctx.quadraticCurveTo(kx - w * 0.8 + kSway * 0.45, 46 - kh * 0.52, kx + kSway, 46 - kh);
    ctx.quadraticCurveTo(kx + w * 0.8 + kSway * 0.45, 46 - kh * 0.48, kx + w * 0.5, 46);
    ctx.closePath();
    ctx.fill();
  }

  // Organic rounded branching sea fan silhouette
  ctx.strokeStyle = softRealm ? 'rgba(94, 234, 212, 0.35)' : color;
  ctx.lineCap = 'round';
  for (let b = -2; b <= 2; b++) {
    const bx = b * 14;
    const bh = 30 + (2 - Math.abs(b)) * 10;
    const sway = Math.sin(time * 1.3 + b) * 3.5;
    ctx.lineWidth = 3.2 - Math.abs(b) * 0.4;
    ctx.beginPath();
    ctx.moveTo(bx * 0.35, 38);
    ctx.quadraticCurveTo(bx * 0.75, 38 - bh * 0.5, bx + sway, 38 - bh);
    ctx.moveTo(bx * 0.65, 38 - bh * 0.48);
    ctx.quadraticCurveTo(bx * 0.8 + (b >= 0 ? 7 : -7), 38 - bh * 0.68, bx + (b >= 0 ? 11 : -11) + sway, 38 - bh * 0.78);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWreck(ctx, color, time = 0, softRealm = false) {
  drawRocks(ctx, color, 0.92, softRealm);
  // Broken bowsprit & shaded sunken hull
  ctx.fillStyle = softRealm ? '#0e3341' : '#1c343d';
  ctx.beginPath();
  ctx.moveTo(-132, 8);
  ctx.lineTo(-90, -8);
  ctx.lineTo(10, 6);
  ctx.lineTo(126, 2);
  ctx.lineTo(94, 54);
  ctx.lineTo(-92, 54);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = softRealm ? 'rgba(125, 211, 252, 0.22)' : color;
  ctx.lineWidth = softRealm ? 1.5 : 2.4;
  ctx.stroke();

  // Masts & yardarms
  ctx.fillStyle = softRealm ? '#133e4c' : '#233e46';
  ctx.fillRect(-5, -108, 7, 116);
  ctx.fillRect(52, -70, 5.5, 78);
  ctx.strokeStyle = softRealm ? 'rgba(94, 155, 168, 0.45)' : '#476872';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-40, -76); ctx.lineTo(34, -66);
  ctx.moveTo(30, -48); ctx.lineTo(74, -54);
  ctx.stroke();

  // Tattered billowing sails
  const billow = Math.sin(time * 1.1) * 4;
  ctx.fillStyle = softRealm ? 'rgba(186, 230, 253, 0.16)' : 'rgba(148, 163, 184, 0.22)';
  ctx.beginPath();
  ctx.moveTo(2, -102);
  ctx.quadraticCurveTo(36 + billow, -76, 46, -40);
  ctx.lineTo(4, -38);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2, -74);
  ctx.quadraticCurveTo(-32 - billow, -50, -42, -22);
  ctx.lineTo(-2, -22);
  ctx.closePath();
  ctx.fill();

  // Exposed hull ribs & dim portholes
  ctx.strokeStyle = softRealm ? 'rgba(71, 118, 130, 0.45)' : '#54727a';
  ctx.lineWidth = 1.6;
  for (let rib = -3; rib <= 3; rib++) {
    ctx.beginPath();
    ctx.moveTo(rib * 27, 12);
    ctx.lineTo(rib * 23, 48);
    ctx.stroke();
  }
  ctx.fillStyle = softRealm ? 'rgba(186, 230, 253, 0.22)' : 'rgba(251, 191, 36, 0.38)';
  for (const px of [-54, -22, 16, 48]) {
    ctx.beginPath();
    ctx.arc(px, 24, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Kelp & coral growing gently over wreck hull
  drawCoralCluster(ctx, color, time, softRealm);
}

function drawRuins(ctx, color, time = 0, softRealm = false) {
  drawRocks(ctx, color, 0.95, softRealm);
  ctx.fillStyle = softRealm ? '#113a47' : '#203a43';
  ctx.strokeStyle = softRealm ? 'rgba(153, 246, 228, 0.24)' : color;
  ctx.lineWidth = softRealm ? 1.5 : 2.8;
  for (let column = -2; column <= 2; column++) {
    const x = column * 48;
    const height = 50 + (Math.abs(column) % 2) * 24;
    ctx.fillRect(x - 10, -height, 20, height + 36);
    ctx.strokeRect(x - 10, -height, 20, height + 36);
    ctx.fillRect(x - 15, -height - 6, 30, 7);
  }
  // Broken archway pediment & draped kelp vines
  ctx.beginPath();
  ctx.moveTo(-128, -45);
  ctx.quadraticCurveTo(0, -130, 128, -45);
  ctx.stroke();
  drawCoralCluster(ctx, color, time, softRealm);
}

function drawDeepLandmark(ctx, realm, color, time = 0) {
  const softRealm = realm === 1;
  drawRocks(ctx, color, 0.9, softRealm);
  if (realm === 6) {
    ctx.fillStyle = '#263640';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    for (let vent = -2; vent <= 2; vent++) {
      const x = vent * 48;
      const height = 56 + (Math.abs(vent) % 2) * 28;
      ctx.beginPath();
      ctx.moveTo(x - 20, 62);
      ctx.lineTo(x - 12, -height);
      ctx.lineTo(x + 10, -height - 26);
      ctx.lineTo(x + 24, 62);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Rising thermal shimmer wisp from chimney top
      ctx.fillStyle = 'rgba(251, 146, 60, 0.45)';
      ctx.beginPath();
      ctx.arc(x - 1 + Math.sin(time * 2 + vent) * 4, -height - 34, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#263640';
    }
    return;
  }
  // Ancient abyssal ribcage / coral arch + swaying deep kelp
  ctx.strokeStyle = softRealm ? 'rgba(94, 234, 212, 0.28)' : color;
  ctx.lineWidth = softRealm ? 4.5 : 6.5;
  ctx.lineCap = 'round';
  for (let rib = -2; rib <= 2; rib++) {
    ctx.beginPath();
    ctx.moveTo(rib * 34, 58);
    ctx.quadraticCurveTo(rib * 50, -70, rib * 20, -105);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-105, 52);
  ctx.lineTo(105, 52);
  ctx.stroke();
  drawCoralCluster(ctx, color, time, softRealm);
}

export function drawDepthScenery(ctx, realm, cameraY, surfaceY, width, height, time = 0) {
  const zones = getRealmDepthZones(realm);
  const softRealm = realm === 1;
  // Shallow zone rock ledges, coral & kelp shelves blended subtly into water depth (fewer, larger in Realm 1)
  const shallow = zones[0];
  if (shallow) {
    const shallowConfigs = softRealm
      ? [[0.52, 0.28, 1.05]]
      : [[0.35, 0.24, 0.72], [0.72, 0.76, 0.85]];
    for (const [frac, side, sc] of shallowConfigs) {
      const sy = surfaceY + (shallow.minDepth + (shallow.maxDepth - shallow.minDepth) * frac) * 15 - cameraY;
      if (sy >= -180 && sy <= height + 180) {
        ctx.save();
        ctx.translate(width * side, sy);
        ctx.globalAlpha *= softRealm ? 0.14 : 0.22;
        drawRocks(ctx, shallow.color || '#38bdf8', sc, softRealm);
        if (softRealm) ctx.scale(1.18, 1.18);
        drawCoralCluster(ctx, shallow.color || '#38bdf8', time + frac * 5, softRealm);
        ctx.restore();
      }
    }
  }
  for (const zone of zones.slice(1)) {
    const span = zone.maxDepth - zone.minDepth;
    const landmarkDepth = zone.minDepth + Math.min(120, span * 0.28);
    const y = surfaceY + landmarkDepth * 15 - cameraY;
    if (y >= -190 && y <= height + 190) {
      const side = zone.index % 2 ? 0.3 : 0.7;
      ctx.save();
      ctx.translate(width * side, y);
      ctx.globalAlpha *= softRealm ? 0.18 : 0.28;
      if (zone.index === 1) drawWreck(ctx, zone.color, time, softRealm);
      else if (zone.index === 2) drawRuins(ctx, zone.color, time, softRealm);
      else drawDeepLandmark(ctx, realm, zone.color, time);
      ctx.restore();
    }

    // Secondary reef rock & kelp/coral shelf in the opposite half so mid-waters feel alive
    const midDepth = zone.minDepth + span * 0.65;
    const my = surfaceY + midDepth * 15 - cameraY;
    if (my >= -140 && my <= height + 140) {
      const oppSide = zone.index % 2 ? 0.78 : 0.22;
      ctx.save();
      ctx.translate(width * oppSide, my);
      ctx.globalAlpha *= softRealm ? 0.13 : 0.2;
      drawRocks(ctx, zone.color, 0.75, softRealm);
      drawCoralCluster(ctx, zone.color, time + zone.index, softRealm);
      ctx.restore();
    }
  }
}

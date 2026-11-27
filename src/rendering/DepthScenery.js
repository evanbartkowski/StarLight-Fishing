import { getRealmDepthZones } from '../data/RealmDepths.js';

function drawRocks(ctx, color, scale = 1) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = '#152831';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-140, 56);
  ctx.lineTo(-112, 14);
  ctx.lineTo(-74, -4);
  ctx.lineTo(-35, 18);
  ctx.lineTo(-8, -16);
  ctx.lineTo(36, 10);
  ctx.lineTo(78, -6);
  ctx.lineTo(118, 22);
  ctx.lineTo(142, 56);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rock strata crevices
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-98, 26); ctx.lineTo(-64, 18); ctx.lineTo(-42, 34);
  ctx.moveTo(4, 10); ctx.lineTo(28, 26); ctx.lineTo(66, 18);
  ctx.stroke();
  ctx.restore();
}

function drawCoralCluster(ctx, color, time = 0) {
  ctx.save();
  // Base boulder mound
  ctx.fillStyle = '#19313a';
  ctx.beginPath();
  ctx.ellipse(0, 48, 64, 18, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Sea fan & staghorn coral silhouettes
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  for (let b = -3; b <= 3; b++) {
    const bx = b * 15;
    const bh = 38 + (3 - Math.abs(b)) * 14;
    const sway = Math.sin(time * 1.4 + b) * 4;
    ctx.beginPath();
    ctx.moveTo(bx * 0.4, 42);
    ctx.quadraticCurveTo(bx * 0.8, 42 - bh * 0.5, bx + sway, 42 - bh);
    ctx.moveTo(bx * 0.72, 42 - bh * 0.48);
    ctx.lineTo(bx + (b >= 0 ? 11 : -11) + sway, 42 - bh * 0.78);
    ctx.stroke();
  }

  // Softly swaying kelp blades behind coral
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 4;
  for (const kx of [-52, 46]) {
    const kSway = Math.sin(time * 1.2 + kx) * 10;
    ctx.beginPath();
    ctx.moveTo(kx, 48);
    ctx.bezierCurveTo(kx + kSway * 0.5, 10, kx - kSway * 0.6, -24, kx + kSway, -66);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWreck(ctx, color, time = 0) {
  drawRocks(ctx, color, 0.92);
  // Broken bowsprit & hull planking
  ctx.fillStyle = '#1c343d';
  ctx.beginPath();
  ctx.moveTo(-132, 8);
  ctx.lineTo(-90, -8);
  ctx.lineTo(10, 6);
  ctx.lineTo(126, 2);
  ctx.lineTo(94, 54);
  ctx.lineTo(-92, 54);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.8;
  ctx.stroke();

  // Masts & yardarms
  ctx.fillStyle = '#233e46';
  ctx.fillRect(-6, -112, 8, 120);
  ctx.fillRect(52, -72, 6, 80);
  ctx.strokeStyle = '#476872';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-42, -78); ctx.lineTo(36, -68);
  ctx.moveTo(30, -48); ctx.lineTo(76, -54);
  ctx.stroke();

  // Tattered billowing sails
  const billow = Math.sin(time * 1.1) * 4;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.beginPath();
  ctx.moveTo(2, -104);
  ctx.quadraticCurveTo(38 + billow, -76, 48, -40);
  ctx.lineTo(4, -38);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2, -76);
  ctx.quadraticCurveTo(-34 - billow, -50, -44, -22);
  ctx.lineTo(-2, -22);
  ctx.closePath();
  ctx.fill();

  // Exposed hull ribs & brass portholes
  ctx.strokeStyle = '#54727a';
  ctx.lineWidth = 2;
  for (let rib = -3; rib <= 3; rib++) {
    ctx.beginPath();
    ctx.moveTo(rib * 27, 12);
    ctx.lineTo(rib * 23, 48);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
  for (const px of [-54, -22, 16, 48]) {
    ctx.beginPath();
    ctx.arc(px, 24, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Trailing sunken anchor & chain
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(98, 14);
  ctx.quadraticCurveTo(124, 38, 118, 68);
  ctx.stroke();
  ctx.setLineDash([]);

  // Kelp & coral growing over wreck hull
  drawCoralCluster(ctx, color, time);
}

function drawRuins(ctx, color, time = 0) {
  drawRocks(ctx, color, 0.95);
  ctx.fillStyle = '#203a43';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  for (let column = -2; column <= 2; column++) {
    const x = column * 48;
    const height = 52 + (Math.abs(column) % 2) * 26;
    ctx.fillRect(x - 11, -height, 22, height + 36);
    ctx.strokeRect(x - 11, -height, 22, height + 36);
    ctx.fillRect(x - 17, -height - 7, 34, 8);
  }
  // Broken archway pediment & draped kelp vines
  ctx.beginPath();
  ctx.moveTo(-132, -45);
  ctx.quadraticCurveTo(0, -134, 132, -45);
  ctx.stroke();
  drawCoralCluster(ctx, color, time);
}

function drawDeepLandmark(ctx, realm, color, time = 0) {
  drawRocks(ctx, color, 0.9);
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
  ctx.strokeStyle = color;
  ctx.lineWidth = 6.5;
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
  drawCoralCluster(ctx, color, time);
}

export function drawDepthScenery(ctx, realm, cameraY, surfaceY, width, height, time = 0) {
  const zones = getRealmDepthZones(realm);
  // Shallow zone (zone 0, 45m+) rock ledges, coral & kelp shelves so upper dives never feel empty
  const shallow = zones[0];
  if (shallow) {
    for (const [frac, side, sc] of [[0.35, 0.24, 0.72], [0.72, 0.76, 0.85]]) {
      const sy = surfaceY + (shallow.minDepth + (shallow.maxDepth - shallow.minDepth) * frac) * 15 - cameraY;
      if (sy >= -150 && sy <= height + 150) {
        ctx.save();
        ctx.translate(width * side, sy);
        ctx.globalAlpha *= 0.22;
        drawRocks(ctx, shallow.color || '#38bdf8', sc);
        drawCoralCluster(ctx, shallow.color || '#38bdf8', time + frac * 5);
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
      ctx.globalAlpha *= 0.28;
      if (zone.index === 1) drawWreck(ctx, zone.color, time);
      else if (zone.index === 2) drawRuins(ctx, zone.color, time);
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
      ctx.globalAlpha *= 0.2;
      drawRocks(ctx, zone.color, 0.75);
      drawCoralCluster(ctx, zone.color, time + zone.index);
      ctx.restore();
    }
  }
}

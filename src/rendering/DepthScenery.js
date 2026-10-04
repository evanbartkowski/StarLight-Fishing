import { getRealmDepthZones } from '../data/RealmDepths.js';

function drawWreck(ctx, color) {
  ctx.fillStyle = '#1c343d';
  ctx.beginPath(); ctx.moveTo(-125, 10); ctx.lineTo(122, 10); ctx.lineTo(86, 54); ctx.lineTo(-88, 54); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#233e46'; ctx.fillRect(-5, -105, 7, 116); ctx.fillRect(53, -66, 6, 76);
  ctx.beginPath(); ctx.moveTo(1, -99); ctx.lineTo(48, -40); ctx.lineTo(5, -40); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-1, -76); ctx.lineTo(-44, -22); ctx.lineTo(-1, -22); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#54727a'; ctx.lineWidth = 2;
  for (let rib = -3; rib <= 3; rib++) { ctx.beginPath(); ctx.moveTo(rib * 27, 12); ctx.lineTo(rib * 23, 48); ctx.stroke(); }
}

function drawRuins(ctx, color) {
  ctx.fillStyle = '#203a43'; ctx.strokeStyle = color; ctx.lineWidth = 4;
  for (let column = -2; column <= 2; column++) {
    const x = column * 48, height = 48 + Math.abs(column) % 2 * 24;
    ctx.fillRect(x - 11, -height, 22, height + 34);
    ctx.fillRect(x - 17, -height - 7, 34, 8);
  }
  ctx.beginPath(); ctx.moveTo(-130, -43); ctx.quadraticCurveTo(0, -132, 130, -43); ctx.stroke();
}

function drawDeepLandmark(ctx, realm, color) {
  if (realm === 6) {
    ctx.fillStyle = '#263640'; ctx.strokeStyle = color; ctx.lineWidth = 4;
    for (let vent = -2; vent <= 2; vent++) {
      const x = vent * 48, height = 54 + (Math.abs(vent) % 2) * 26;
      ctx.beginPath(); ctx.moveTo(x - 20, 62); ctx.lineTo(x - 12, -height); ctx.lineTo(x + 10, -height - 26); ctx.lineTo(x + 24, 62); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    return;
  }
  ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let rib = -2; rib <= 2; rib++) {
    ctx.beginPath(); ctx.moveTo(rib * 34, 58); ctx.quadraticCurveTo(rib * 50, -70, rib * 20, -105); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(-105, 52); ctx.lineTo(105, 52); ctx.stroke();
}

export function drawDepthScenery(ctx, realm, cameraY, surfaceY, width, height) {
  const zones = getRealmDepthZones(realm);
  for (const zone of zones.slice(1)) {
    const span = zone.maxDepth - zone.minDepth;
    const landmarkDepth = zone.minDepth + Math.min(120, span * .28);
    const y = surfaceY + landmarkDepth * 15 - cameraY;
    if (y < -180 || y > height + 180) continue;
    const side = zone.index % 2 ? .3 : .7;
    ctx.save(); ctx.translate(width * side, y); ctx.globalAlpha *= .26;
    if (zone.index === 1) drawWreck(ctx, zone.color);
    else if (zone.index === 2) drawRuins(ctx, zone.color);
    else drawDeepLandmark(ctx, realm, zone.color);
    ctx.restore();
  }
}

import { getRealmDepthZones, getRealmDepthZone } from '../data/RealmDepths.js';

export function drawDepthScenery(ctx, realm, cameraY, surfaceY, width, height) {
  const zones = getRealmDepthZones(realm);
  const current = getRealmDepthZone(Math.max(0, (cameraY + height / 2 - surfaceY) / 15), realm);
  // Broad silhouettes stay visible between landmarks; no scene objects are allocated.
  ctx.save(); ctx.globalAlpha *= .15; ctx.fillStyle = current.color;
  ctx.beginPath(); ctx.moveTo(0, 0);
  for (let y = -100; y < height + 180; y += 80) ctx.lineTo(25 + Math.sin((y + cameraY * .25) / 160 + current.index) * (25 + current.index * 8), y);
  ctx.lineTo(0, height); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(width, 0);
  for (let y = -100; y < height + 180; y += 80) ctx.lineTo(width - 30 - Math.cos((y + cameraY * .25) / 180) * 25, y);
  ctx.lineTo(width, height); ctx.closePath(); ctx.fill(); ctx.restore();
  for (const zone of zones) {
    for (let depth = zone.minDepth + 12; depth < zone.maxDepth; depth += 42) {
      const y = surfaceY + depth * 15 - cameraY;
      if (y < -220 || y > height + 220) continue;
      ctx.save(); ctx.translate(width * .5, y); ctx.globalAlpha *= .26;
      ctx.fillStyle = zone.index > 1 ? '#74a4b8' : '#acd4cc'; ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 3;
      if (realm === 1 && zone.index === 1) {
        // Broken merchant hull, mast and ribs.
        ctx.beginPath(); ctx.moveTo(-160, 20); ctx.lineTo(150, 20); ctx.lineTo(95, 75); ctx.lineTo(-100, 60); ctx.closePath(); ctx.fill();
        ctx.fillRect(-14, -105, 7, 125);
        for (let i = -3; i <= 3; i++) ctx.fillRect(i * 35, -10, 5, 45);
      } else if (zone.index === 2 || realm === 4 && zone.index > 0 || realm === 7 && zone.index === 1) {
        // Distant drowned city, varied towers and ruined archways.
        for (let i = -3; i <= 3; i++) {
          const h = 60 + ((i * i + zone.index) % 4) * 28;
          ctx.fillRect(i * 63 - 18, -h, 36, h + 60);
          ctx.beginPath(); ctx.moveTo(i * 63 - 25, -h); ctx.lineTo(i * 63, -h - 28); ctx.lineTo(i * 63 + 25, -h); ctx.fill();
          ctx.save(); ctx.globalAlpha *= .8; ctx.fillStyle = '#041724';
          for (let windowY = -h + 18; windowY < 25; windowY += 26) { ctx.fillRect(i * 63 - 10, windowY, 6, 11); ctx.fillRect(i * 63 + 4, windowY, 6, 11); }
          ctx.restore();
          if (i < 3) { ctx.beginPath(); ctx.arc(i * 63 + 32, 15, 28, Math.PI, 0); ctx.lineWidth = 8; ctx.stroke(); }
        }
      } else {
        // Fungal shelves, crystal spires, cloud roots or volcanic chimneys.
        for (let i = -3; i <= 3; i++) {
          const x = i * 70, h = 30 + zone.index * 35 + (i * i % 3) * 25;
          ctx.beginPath(); ctx.moveTo(x - 22, 70); ctx.lineTo(x - 12, -h); ctx.lineTo(x + 6, -h - 30); ctx.lineTo(x + 24, 70); ctx.closePath(); ctx.fill();
          if (realm === 2 || realm === 5) { ctx.beginPath(); ctx.ellipse(x, -h, 45, 17, 0, 0, Math.PI * 2); ctx.fill(); }
          if (realm === 6) { ctx.beginPath(); ctx.moveTo(x, -h); ctx.bezierCurveTo(x - 35, -h - 45, x + 30, -h - 80, x - 10, -h - 135); ctx.stroke(); }
        }
      }
      ctx.restore();
    }
  }
}

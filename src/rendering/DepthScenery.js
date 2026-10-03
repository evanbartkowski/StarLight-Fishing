import { getRealmDepthZones } from '../data/RealmDepths.js';

export function drawDepthScenery(ctx, realm, cameraY, surfaceY, width, height) {
  const zones = getRealmDepthZones(realm);
  for (const zone of zones) {
    for (let depth = zone.minDepth + 90; depth < zone.maxDepth; depth += 210) {
      const y = surfaceY + depth * 15 - cameraY;
      if (y < -220 || y > height + 220) continue;
      ctx.save(); ctx.translate(width * .5, y); ctx.globalAlpha *= .22;
      ctx.fillStyle = zone.index > 1 ? '#74a4b8' : '#acd4cc'; ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 3;
      if (realm === 1 && zone.index < 2) {
        // Broken merchant hull, mast and ribs.
        ctx.beginPath(); ctx.moveTo(-160, 20); ctx.lineTo(150, 20); ctx.lineTo(95, 75); ctx.lineTo(-100, 60); ctx.closePath(); ctx.fill();
        ctx.fillRect(-14, -105, 7, 125);
        for (let i = -3; i <= 3; i++) ctx.fillRect(i * 35, -10, 5, 45);
      } else if ([1, 4, 7].includes(realm) || zone.index === 2) {
        // Distant drowned city, varied towers and ruined archways.
        for (let i = -3; i <= 3; i++) {
          const h = 60 + ((i * i + zone.index) % 4) * 28;
          ctx.fillRect(i * 63 - 18, -h, 36, h + 60);
          ctx.beginPath(); ctx.moveTo(i * 63 - 25, -h); ctx.lineTo(i * 63, -h - 28); ctx.lineTo(i * 63 + 25, -h); ctx.fill();
        }
      } else {
        // Fungal shelves, crystal spires, cloud roots or volcanic chimneys.
        for (let i = -3; i <= 3; i++) {
          const x = i * 70, h = 60 + (i * i % 3) * 25;
          ctx.beginPath(); ctx.moveTo(x - 22, 70); ctx.lineTo(x - 12, -h); ctx.lineTo(x + 6, -h - 30); ctx.lineTo(x + 24, 70); ctx.closePath(); ctx.fill();
          if (realm === 2 || realm === 5) { ctx.beginPath(); ctx.ellipse(x, -h, 45, 17, 0, 0, Math.PI * 2); ctx.fill(); }
          if (realm === 6) { ctx.beginPath(); ctx.moveTo(x, -h); ctx.bezierCurveTo(x - 35, -h - 45, x + 30, -h - 80, x - 10, -h - 135); ctx.stroke(); }
        }
      }
      ctx.restore();
    }
  }
}

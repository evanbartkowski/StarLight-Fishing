const realmTints = ['#5eead4', '#c084fc', '#93c5fd', '#2dd4bf', '#e0e7ff', '#fb7185', '#a78bfa'];
const motion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
export function drawEventAtmosphere(ctx, event, time, width, height, surfaceY, cameraY, realm = 1) {
  if (!event.active) return;
  const t = motion?.matches ? 0 : time;
  const tint = realmTints[realm - 1] || realmTints[0];
  ctx.save();
  ctx.fillStyle = event.id === 'blood_moon' ? '#9f1239' : event.id === 'abyssal_storm' ? '#4338ca' : '#047857';
  ctx.globalAlpha = .09; ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = .2;
  if (event.id === 'aurora_borealis') {
    ctx.strokeStyle = tint; ctx.lineWidth = 20;
    for (let band = 0; band < 3; band++) {
      ctx.beginPath();
      for (let x = 0; x <= width + 30; x += 30) {
        const y = 50 + band * 65 + Math.sin(x / 140 + t * .2 + band) * 38;
        if (!x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (event.id === 'blood_moon') {
    const moonY = surfaceY - cameraY - 110;
    if (moonY > -70) {
      ctx.fillStyle = '#fb7185'; ctx.beginPath(); ctx.arc(width * .78, moonY, 42, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#fda4af'; ctx.globalAlpha = .35;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath(); ctx.arc((i * 137 + Math.sin(t * .3 + i) * 15) % width, (i * 83 + t * 9) % height, 2 + i % 3, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    ctx.strokeStyle = tint; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const y = (i * 91 + t * 25) % height;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(width * .3, y - 40, width * .6, y + 40, width, y - 20); ctx.stroke();
    }
  }
  ctx.restore();
}

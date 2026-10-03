// Small vector impressions, no images or per-frame textures needed.
export function drawFossil(ctx, shape = 'skeleton') {
  ctx.fillStyle = '#47565d'; ctx.strokeStyle = '#819493'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-23, -10); ctx.lineTo(-12, -20); ctx.lineTo(16, -17);
  ctx.lineTo(25, 5); ctx.lineTo(12, 20); ctx.lineTo(-21, 13); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#dce9df'; ctx.fillStyle = '#dce9df'; ctx.lineWidth = 2;
  ctx.beginPath();
  if (shape === 'coral') {
    for (let x = -10; x <= 10; x += 10) {
      ctx.moveTo(0, 13); ctx.lineTo(x, -12);
      ctx.moveTo(x * .5, 0); ctx.lineTo(x + 5, -5);
    }
    ctx.stroke();
  } else if (shape === 'vertebra') {
    ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, -16);
    ctx.moveTo(-9, 0); ctx.lineTo(-18, 5); ctx.moveTo(9, 0); ctx.lineTo(18, 5); ctx.stroke();
  } else if (shape === 'spiral' || shape === 'shell') {
    for (let i = 0; i <= 50; i++) {
      const t = i * .23, r = shape === 'spiral' ? 1 + i * .25 : 13;
      const x = Math.cos(t) * r, y = Math.sin(t) * r * .8;
      if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (shape === 'shell') for (let y = -8; y <= 8; y += 4) { ctx.beginPath(); ctx.moveTo(-10, y); ctx.lineTo(10, y); ctx.stroke(); }
  } else if (shape === 'jaw') {
    ctx.moveTo(-15, -8); ctx.lineTo(17, 0); ctx.lineTo(-15, 9); ctx.stroke();
    for (let x = -10; x < 13; x += 5) { ctx.beginPath(); ctx.moveTo(x, -6); ctx.lineTo(x + 2, 2); ctx.lineTo(x + 4, -4); ctx.stroke(); }
  } else {
    ctx.moveTo(-16, 0); ctx.lineTo(14, 0); ctx.stroke();
    for (let x = -12; x <= 8; x += 5) {
      ctx.beginPath(); ctx.moveTo(x - 2, -9); ctx.quadraticCurveTo(x + 5, 0, x - 2, 9); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(15, 0, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#47565d'; ctx.beginPath(); ctx.arc(17, -1, 1.5, 0, Math.PI * 2); ctx.fill();
  }
}

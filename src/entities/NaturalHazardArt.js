// Canvas-native coastal obstacles, sized to their existing collision bounds.
export function drawNaturalHazard(ctx, kind, r, time) {
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  if (kind === 'stalactite') {
    ctx.fillStyle = '#475569'; ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * .5, -r); ctx.lineTo(r * .5, -r); ctx.lineTo(0, r); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (kind === 'probe') {
    ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.arc(0, 0, r * .7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
    ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(0, 0, r * .2, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'diver' || kind === 'submarine') {
    const light = ctx.createLinearGradient(r * .5, 0, r * 4, 0);
    light.addColorStop(0, '#fef08a88'); light.addColorStop(1, '#fef08a00');
    ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(r * .5, 0); ctx.lineTo(r * 4, -r); ctx.lineTo(r * 4, r); ctx.closePath(); ctx.fill();
    ctx.fillStyle = kind === 'diver' ? '#172554' : '#64748b';
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * .45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7dd3fc'; ctx.beginPath(); ctx.arc(r * .6, 0, r * .22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = r * .18;
    ctx.beginPath(); ctx.moveTo(-r * .6, 0); ctx.lineTo(-r * 1.1, Math.sin(time * 3) * r * .3); ctx.stroke();
    ctx.fillStyle = '#334155'; ctx.fillRect(-r * .3, -r * .65, r * .45, r * .35);
    if (kind === 'submarine') {
      ctx.fillRect(-r * .1, -r * .95, r * .055, r * .4);
      ctx.fillRect(-r * .1, -r * .95, r * .22, r * .055);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * .45, 0, 0, Math.PI * 2); ctx.stroke();
      for (let i = -2; i <= 2; i++) {
        ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(i * r * .25, 0, r * .075, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#67e8f9'; ctx.beginPath(); ctx.arc(i * r * .25, 0, r * .047, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.moveTo(-r * .8, 0); ctx.lineTo(-r * 1.1, -r * .5); ctx.lineTo(-r * 1.1, r * .5); ctx.closePath(); ctx.fill();
    }
  } else if (kind === 'plant') {
    ctx.fillStyle = '#526257';
    ctx.beginPath(); ctx.ellipse(0, r * .65, r * .7, r * .22, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = -2; i <= 2; i++) {
      const x = i * r * .22, sway = Math.sin(time * .8 + i) * r * .13;
      const tip = -r * (.65 + .12 * (2 - Math.abs(i)));
      ctx.strokeStyle = i % 2 ? '#287e59' : '#3b9c68'; ctx.lineWidth = r * .09;
      ctx.beginPath(); ctx.moveTo(x, r * .6); ctx.bezierCurveTo(x - r * .2, 0, x + sway, -r * .3, x + sway, tip); ctx.stroke();
      for (let j = 0; j < 3; j++) {
        const y = r * .3 - j * r * .3, side = (i + j) % 2 ? 1 : -1;
        ctx.fillStyle = j % 2 ? '#62b57a' : '#359966';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + side * r * .5, y - r * .4, x + side * r * .38, y - r * .08); ctx.quadraticCurveTo(x + side * r * .15, y + r * .08, x, y); ctx.fill();
      }
    }
  } else if (kind === 'boulder') {
    const stone = ctx.createLinearGradient(-r, -r, r, r);
    stone.addColorStop(0, '#9aa7a5'); stone.addColorStop(.45, '#667974'); stone.addColorStop(1, '#334841');
    ctx.fillStyle = stone; ctx.strokeStyle = '#2c403a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * .9, r * .25); ctx.lineTo(-r * .72, -r * .48); ctx.lineTo(-r * .2, -r * .85); ctx.lineTo(r * .5, -r * .7); ctx.lineTo(r * .9, -.1 * r); ctx.lineTo(r * .68, r * .65); ctx.lineTo(-r * .5, r * .75); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c4cec266'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * .65, -.35 * r); ctx.lineTo(-r * .16, -.65 * r); ctx.lineTo(r * .38, -.55 * r); ctx.stroke();
    ctx.strokeStyle = '#30433e'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(r * .08, -.6 * r); ctx.lineTo(-r * .1, -.12 * r); ctx.lineTo(r * .25, r * .2); ctx.lineTo(r * .1, r * .55); ctx.stroke();
    ctx.fillStyle = '#658c5b';
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse((i - 2) * r * .22, r * .46 + Math.sin(i) * r * .06, r * .16, r * .09, 0, 0, Math.PI * 2); ctx.fill(); }
  } else if (kind === 'log') {
    ctx.rotate(-.18);
    const wood = ctx.createLinearGradient(0, -r * .35, 0, r * .4);
    wood.addColorStop(0, '#99744d'); wood.addColorStop(.4, '#765231'); wood.addColorStop(1, '#3e3021');
    ctx.fillStyle = wood; ctx.strokeStyle = '#3c2b1d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * .8, -r * .32); ctx.lineTo(r * .72, -r * .3); ctx.quadraticCurveTo(r, 0, r * .72, r * .34); ctx.lineTo(-r * .8, r * .3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b18b5c'; ctx.beginPath(); ctx.ellipse(-r * .78, 0, r * .19, r * .31, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#74512f'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(-r * .78, 0, r * .1, r * .2, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-r * .5, i * r * .16); ctx.quadraticCurveTo(0, i * r * .1, r * .65, i * r * .18); ctx.stroke(); }
    ctx.strokeStyle = '#765231'; ctx.lineWidth = r * .12;
    ctx.beginPath(); ctx.moveTo(r * .05, -r * .2); ctx.lineTo(r * .25, -r * .63); ctx.lineTo(r * .48, -r * .7); ctx.stroke();
    ctx.fillStyle = '#5f8252'; ctx.beginPath(); ctx.ellipse(r * .3, -r * .25, r * .28, r * .08, .15, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.rotate(.12);
    const hull = ctx.createLinearGradient(0, -r * .2, 0, r * .6);
    hull.addColorStop(0, '#987451'); hull.addColorStop(1, '#3c2e24');
    ctx.fillStyle = hull; ctx.strokeStyle = '#35291f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * .94, -r * .14); ctx.lineTo(-r * .45, -r * .2); ctx.lineTo(-r * .15, .02 * r); ctx.lineTo(r * .14, -r * .18); ctx.lineTo(r * .92, -r * .3); ctx.quadraticCurveTo(r * .8, r * .5, r * .3, r * .58); ctx.lineTo(-r * .55, r * .45); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c49a6855'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-r * .65, r * (.08 + i * .12)); ctx.lineTo(r * .65, r * (.02 + i * .12)); ctx.stroke(); }
    ctx.strokeStyle = '#6b5038'; ctx.lineWidth = r * .075;
    ctx.beginPath(); ctx.moveTo(r * .16, 0); ctx.lineTo(r * .07, -r * .83); ctx.moveTo(-r * .3, -.46 * r); ctx.lineTo(r * .45, -.52 * r); ctx.stroke();
    ctx.fillStyle = '#bbb596'; ctx.beginPath(); ctx.moveTo(r * .1, -.75 * r); ctx.lineTo(r * .48, -.55 * r); ctx.lineTo(r * .26, -.35 * r); ctx.lineTo(r * .12, -.43 * r); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 3; i++) { ctx.fillStyle = '#1f302e'; ctx.beginPath(); ctx.arc((i - 1) * r * .35, r * .15, r * .075, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#c9c4ab';
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc((i - 2) * r * .23, r * .4, r * .025, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

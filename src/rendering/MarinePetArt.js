export function drawMarinePet(ctx, kind, time = 0) {
  const dolphin = kind === 'dolphin';
  const sway = Math.sin(time * 3) * 3;
  if (dolphin) {
    ctx.fillStyle = '#4e8eaa';
    ctx.beginPath(); ctx.moveTo(-28, -2); ctx.lineTo(-47, -17 + sway); ctx.quadraticCurveTo(-45, -3, -38, 1); ctx.lineTo(-48, 15 + sway); ctx.quadraticCurveTo(-34, 11, -28, 4); ctx.fill();
    ctx.fillStyle = '#71b9c9';
    ctx.beginPath(); ctx.moveTo(-34, 1); ctx.bezierCurveTo(-24, -17, -4, -21, 13, -15); ctx.quadraticCurveTo(22, -13, 27, -8); ctx.lineTo(44, -5); ctx.quadraticCurveTo(49, -3, 44, 1); ctx.lineTo(27, 2); ctx.bezierCurveTo(16, 15, -13, 14, -34, 1); ctx.fill();
    ctx.fillStyle = '#d9e9ed';
    ctx.beginPath(); ctx.moveTo(-25, 5); ctx.quadraticCurveTo(3, 17, 29, 3); ctx.quadraticCurveTo(6, 11, -25, 5); ctx.fill();
    ctx.fillStyle = '#4e8eaa';
    ctx.beginPath(); ctx.moveTo(-8, -14); ctx.quadraticCurveTo(-3, -34, 8, -25); ctx.quadraticCurveTo(12, -18, 16, -13); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 7); ctx.quadraticCurveTo(-4, 21, -16, 20); ctx.lineTo(-8, 4); ctx.fill();
    ctx.fillStyle = '#102434'; ctx.beginPath(); ctx.arc(21, -8, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -16, 1.4, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#43586c';
    ctx.beginPath(); ctx.moveTo(-29, 0); ctx.lineTo(-49, -17 + sway); ctx.lineTo(-42, -2); ctx.lineTo(-50, 17 + sway); ctx.lineTo(-28, 6); ctx.fill();
    ctx.fillStyle = '#718699';
    ctx.beginPath(); ctx.moveTo(-34, 1); ctx.bezierCurveTo(-23, -13, 2, -16, 23, -9); ctx.lineTo(46, -2); ctx.quadraticCurveTo(51, 0, 46, 2); ctx.lineTo(23, 5); ctx.bezierCurveTo(3, 16, -23, 12, -34, 1); ctx.fill();
    ctx.fillStyle = '#d9e9ed';
    ctx.beginPath(); ctx.moveTo(-24, 5); ctx.quadraticCurveTo(4, 15, 28, 4); ctx.quadraticCurveTo(2, 10, -24, 5); ctx.fill();
    ctx.fillStyle = '#43586c';
    ctx.beginPath(); ctx.moveTo(-7, -10); ctx.lineTo(2, -35); ctx.quadraticCurveTo(8, -31, 11, -13); ctx.fill();
    ctx.beginPath(); ctx.moveTo(1, 5); ctx.lineTo(18, 20); ctx.quadraticCurveTo(12, 22, -9, 10); ctx.fill();
    ctx.strokeStyle = '#243d50'; ctx.lineWidth = 1.3;
    for (let x = 12; x < 22; x += 3) { ctx.beginPath(); ctx.moveTo(x, -5); ctx.quadraticCurveTo(x - 3, 0, x, 5); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(22, 5); ctx.quadraticCurveTo(33, 5, 43, 1); ctx.stroke();
    ctx.fillStyle = '#f1f5f9';
    for (let x = 28; x < 39; x += 4) { ctx.beginPath(); ctx.moveTo(x, 3); ctx.lineTo(x + 2, 7); ctx.lineTo(x + 3, 2); ctx.fill(); }
    ctx.fillStyle = '#102434'; ctx.beginPath(); ctx.arc(29, -4, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(dolphin ? 21 : 29.5, dolphin ? -8.5 : -4.5, .6, 0, Math.PI * 2); ctx.fill();
}

export function drawPetNameplate(ctx, x, y, text) {
  ctx.save(); ctx.translate(x, y); ctx.font = 'bold 11px Outfit, sans-serif';
  const width = ctx.measureText(text).width + 18;
  ctx.fillStyle = 'rgba(15,23,42,.92)'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-width / 2, -11, width, 22, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e0f2fe'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 0); ctx.restore();
}

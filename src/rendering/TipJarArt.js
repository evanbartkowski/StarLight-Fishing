export function drawTipJar(ctx) {
  ctx.save(); ctx.translate(615, 253);
  ctx.fillStyle = '#05182366'; ctx.beginPath(); ctx.ellipse(25, 68, 36, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#765b32'; ctx.beginPath(); ctx.roundRect(-2, 3, 55, 11, 4); ctx.fill();
  ctx.fillStyle = '#d7bc78'; ctx.beginPath(); ctx.roundRect(-3, 1, 56, 7, 3); ctx.fill();
  ctx.fillStyle = '#263b43'; ctx.beginPath(); ctx.roundRect(10, 3, 30, 3, 1.5); ctx.fill();
  const glass = ctx.createLinearGradient(0, 10, 48, 65);
  glass.addColorStop(0, '#c9f7ffb8'); glass.addColorStop(.24, '#4da5be55'); glass.addColorStop(.72, '#0b3b55a8'); glass.addColorStop(1, '#092a3dbb');
  ctx.fillStyle = glass; ctx.strokeStyle = '#d8f7f4'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(1, 9, 48, 56, 10); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(2, 10, 46, 54, 9); ctx.clip();
  ctx.fillStyle = '#f5bd4f';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(9 + i * 8, 57 - i % 2 * 5, 6, 3, .2, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#fce7a4'; ctx.beginPath(); ctx.arc(13, 47, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#effbfa55'; ctx.fillRect(6, 15, 4, 30);
  ctx.restore();
  ctx.fillStyle = '#12384b'; ctx.strokeStyle = '#9cdbe0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(8, 23, 34, 20, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f4d98d'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('THANKS', 25, 32);
  ctx.fillStyle = '#70d4d0'; ctx.beginPath(); ctx.arc(25, 38, 2, 0, Math.PI * 2); ctx.fill();
  ctx.font = 'bold 11px sans-serif'; ctx.fillStyle = '#e4fbf4'; ctx.fillText('TIP JAR', 25, -8);
  ctx.fillStyle = '#a5f3fc99'; ctx.beginPath(); ctx.arc(4, -2, 2.5, 0, Math.PI * 2); ctx.arc(49, -13, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

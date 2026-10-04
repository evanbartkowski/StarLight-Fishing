export function drawMarinePet(ctx, kind, time = 0) {
  const dolphin = kind === 'dolphin';
  const sway = Math.sin(time * 3) * 3;
  if (dolphin) {
    // Flukes / Tail fin
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.quadraticCurveTo(-40, -14 + sway, -46, -15 + sway);
    ctx.quadraticCurveTo(-42, -5, -34, 1);
    ctx.quadraticCurveTo(-42, 7, -46, 15 + sway);
    ctx.quadraticCurveTo(-40, 14 + sway, -28, 4);
    ctx.closePath();
    ctx.fill();

    // Main Dolphin Body - smooth, cute, friendly curved silhouette
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-32, 1);
    // Upper back arching up to cute rounded melon forehead
    ctx.bezierCurveTo(-20, -15, 0, -22, 22, -16);
    // Rounded melon forehead curving down to smiling snout
    ctx.bezierCurveTo(34, -13, 38, -6, 42, -2);
    // Snout tip
    ctx.quadraticCurveTo(46, 0, 42, 2);
    // Lower jaw & smiling cheek
    ctx.bezierCurveTo(35, 5, 26, 8, 16, 12);
    // Belly curving back to tail
    ctx.bezierCurveTo(-2, 17, -20, 14, -32, 1);
    ctx.closePath();
    ctx.fill();

    // Cute soft creamy/cyan underbelly
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.moveTo(-22, 6);
    ctx.bezierCurveTo(0, 15, 22, 9, 36, 1);
    ctx.quadraticCurveTo(28, 7, 16, 9);
    ctx.quadraticCurveTo(-4, 13, -22, 6);
    ctx.closePath();
    ctx.fill();

    // Cute rounded Dorsal Fin
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.moveTo(-6, -18);
    ctx.quadraticCurveTo(-2, -32, 8, -26);
    ctx.quadraticCurveTo(10, -20, 12, -15);
    ctx.closePath();
    ctx.fill();

    // Pectoral Fin (flipper)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.quadraticCurveTo(2, 18, -8, 17);
    ctx.quadraticCurveTo(-5, 9, 0, 4);
    ctx.closePath();
    ctx.fill();

    // Adorable Blushing Pink Cheek
    ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
    ctx.beginPath();
    ctx.ellipse(23, -1, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gentle upward-curving smile line
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(31, 1);
    ctx.quadraticCurveTo(37, 1.5, 43, 0);
    ctx.stroke();

    // Big Kawaii Anime / Cartoon Eye (Sparkly & Cute)
    // Dark outer eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(24, -8, 3.2, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shiny oceanic blue iris hint
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(24, -7.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Primary big glossy catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(23, -9.2, 1.3, 0, Math.PI * 2);
    ctx.fill();
    // Secondary subtle highlight
    ctx.beginPath();
    ctx.arc(25.2, -6.8, 0.7, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(29.5, -4.5, .6, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawPetNameplate(ctx, x, y, text) {
  ctx.save(); ctx.translate(x, y); ctx.font = 'bold 11px Outfit, sans-serif';
  const width = ctx.measureText(text).width + 18;
  ctx.fillStyle = 'rgba(15,23,42,.92)'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-width / 2, -11, width, 22, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e0f2fe'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 0); ctx.restore();
}

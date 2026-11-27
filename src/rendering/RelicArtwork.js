import { withCanvasState } from './CanvasState.js';

// The same small vector artifact is used in the ocean and workshop.
export function drawRelicArtifact(ctx, relicType, time = 0, weathered = false) {
  withCanvasState(ctx, () => {
    relicType.drawRestored?.(ctx, time);
    if (!weathered) return;
    // Local patina flecks leave the actual silhouette legible beneath the grime.
    ctx.globalAlpha *= .45;
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = i % 2 ? '#115e59' : '#a16207';
      ctx.beginPath(); ctx.arc(Math.sin(i * 2.4) * 10, Math.cos(i * 1.7) * 11, 1.2 + (i % 3) * .35, 0, Math.PI * 2); ctx.fill();
    }
  });
}

export function drawRealmRelic(ctx, kind, color = '#38bdf8', time = 0) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#d97706'; ctx.fillStyle = '#173b4b'; ctx.lineWidth = 2;
  if (kind === 'tablet' || kind === 'testament' || kind === 'star_map') {
    if (kind === 'star_map') {
      ctx.fillStyle = '#e7d7ad'; ctx.beginPath(); ctx.moveTo(-22, -17); ctx.lineTo(22, -14); ctx.lineTo(19, 20); ctx.lineTo(-21, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#315779'; ctx.lineWidth = 1;
      const points = [[-13, 6], [-5, -8], [3, 2], [15, -6], [11, 12]];
      ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      for (const [x, y] of points) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = '#315779'; ctx.fill(); }
    } else {
      ctx.fillStyle = kind === 'tablet' ? '#292130' : '#4c4268';
      ctx.beginPath(); ctx.moveTo(-18, -22); ctx.lineTo(13, -22); ctx.lineTo(21, -12); ctx.lineTo(17, 23); ctx.lineTo(-18, 20); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = 1.3;
      for (let row = 0; row < 4; row++) {
        ctx.beginPath(); ctx.moveTo(-10, -12 + row * 8); ctx.lineTo(-3, -16 + row * 8); ctx.lineTo(2, -10 + row * 8); ctx.lineTo(11, -13 + row * 8); ctx.stroke();
      }
    }
    return;
  }
  if (kind === 'harp') {
    ctx.lineWidth = 4; ctx.strokeStyle = '#d6b365';
    ctx.beginPath(); ctx.moveTo(-18, 19); ctx.quadraticCurveTo(-20, -10, -8, -23); ctx.quadraticCurveTo(4, -10, 19, -16); ctx.lineTo(13, 18); ctx.closePath(); ctx.stroke();
    ctx.lineWidth = .9; ctx.strokeStyle = color;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-9 + i * 5, -12); ctx.lineTo(-9 + i * 4, 16); ctx.stroke(); }
    return;
  }
  if (kind === 'memorial') {
    ctx.fillStyle = '#cbd5cf'; ctx.beginPath(); ctx.moveTo(-20, 20); ctx.lineTo(-12, -7); ctx.quadraticCurveTo(0, -27, 12, -7); ctx.lineTo(20, 20); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e0f2fe'; ctx.beginPath(); ctx.arc(0, -6, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#334155'; ctx.fillRect(-9, 7, 18, 7); ctx.fillStyle = '#d97706'; ctx.fillRect(-23, 20, 46, 5);
    return;
  }
  if (kind === 'clock_heart') {
    ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.moveTo(0, 23); ctx.bezierCurveTo(-37, -1, -19, -28, 0, -12); ctx.bezierCurveTo(20, -29, 36, -1, 0, 23); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    return;
  }
  // Compass, seal, lens, dial and astrolabe have distinct faces and fittings.
  ctx.fillStyle = kind === 'lens' ? '#164e63' : '#b77926';
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = kind === 'seal' ? '#7f1d1d' : '#153b50';
  ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  if (kind === 'lens') {
    ctx.fillStyle = 'rgba(186,230,253,.7)'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-2, 1, 11, Math.PI * 1.1, Math.PI * 1.65); ctx.stroke();
    ctx.fillStyle = '#a16207'; ctx.fillRect(-8, 20, 16, 5);
  } else if (kind === 'seal') {
    ctx.beginPath(); ctx.moveTo(-10, 4); ctx.lineTo(-10, -8); ctx.lineTo(-3, -2); ctx.lineTo(0, -11); ctx.lineTo(5, -2); ctx.lineTo(11, -8); ctx.lineTo(9, 6); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = '#a16207'; ctx.fillRect(-4, -28, 8, 8);
  } else {
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 11, Math.sin(a) * 11); ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); ctx.stroke(); }
    const a = kind === 'astrolabe' ? time * .15 : -.8;
    ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-Math.cos(a) * 13, -Math.sin(a) * 13); ctx.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); ctx.stroke();
    if (kind === 'astrolabe') { ctx.beginPath(); ctx.arc(0, -26, 5, 0, Math.PI * 2); ctx.stroke(); }
    if (kind === 'dial') { ctx.strokeStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(9, -6); ctx.stroke(); }
  }
}

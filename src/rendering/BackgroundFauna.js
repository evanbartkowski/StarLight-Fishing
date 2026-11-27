// Sparse habitats in meters below the surface. Creatures never wrap vertically.
export const TRENCH_FAUNA = Object.freeze([
  { type: 'gulper', depth: 560, dir: 1, speed: 11, scale: 1.45, phaseOffset: 650 },
  { type: 'shadow', depth: 1090, dir: -1, speed: 9, scale: 1.35, phaseOffset: 700 },
  { type: 'glass_manta', depth: 1480, dir: 1, speed: 13, scale: 1.4, phaseOffset: 180 },
  { type: 'siphonophore', depth: 2020, dir: -1, speed: 8, scale: 1.3, phaseOffset: 1100 },
  { type: 'shadow', depth: 2480, dir: 1, speed: 10, scale: 1.5, phaseOffset: 300 },
  { type: 'gulper', depth: 2870, dir: -1, speed: 7, scale: 1.65, phaseOffset: 500 },
]);
export const VOID_FAUNA = Object.freeze([
  { type: 'whale', depth: 690, dir: 1, speed: 22, scale: 1.38, phaseOffset: 80 },
  { type: 'ring_ray', depth: 1320, dir: -1, speed: 15, scale: 1.35, phaseOffset: 200 },
  { type: 'whale', depth: 1710, dir: -1, speed: 18, scale: 1.5, phaseOffset: 300 },
  { type: 'chrono_nautilus', depth: 2150, dir: 1, speed: 12, scale: 1.45, phaseOffset: 400 },
  { type: 'ring_ray', depth: 2600, dir: 1, speed: 17, scale: 1.5, phaseOffset: 50 },
  { type: 'chrono_nautilus', depth: 2920, dir: -1, speed: 9, scale: 1.65, phaseOffset: 500 },
]);

export function backgroundFaunaPose(config, time, width, surfaceY, cameraY, pixelsPerMeter = 15) {
  const margin = 520, span = width + margin * 2 + 2200;
  const phase = ((time * config.speed + config.phaseOffset) % span + span) % span;
  return { x: config.dir === 1 ? -margin + phase : width + margin - phase,
    y: surfaceY + config.depth * pixelsPerMeter - cameraY + Math.sin(time * .35 + config.phaseOffset) * 20,
    pitch: Math.cos(time * .35 + config.phaseOffset) * .035 * config.dir };
}

// Original Canvas artwork: no textures, randomness or expensive shadow filters.
export function drawBackgroundFauna(ctx, type, time, phase = 0) {
  const wave = Math.sin(time * .8 + phase);
  ctx.globalAlpha = .34; ctx.lineWidth = 1.5;
  ctx.fillStyle = ['glass_manta', 'siphonophore'].includes(type) ? '#155e75' : '#6366b1';
  ctx.strokeStyle = ['glass_manta', 'siphonophore'].includes(type) ? '#67e8f9' : '#c4b5fd';
  if (type === 'glass_manta' || type === 'ring_ray') {
    if (type === 'ring_ray') {
      ctx.save(); ctx.rotate(-.25 + wave * .04); ctx.globalAlpha = .2;
      ctx.beginPath(); ctx.ellipse(0, 0, 150, 40, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, 157, 44, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(90, -5);
    ctx.bezierCurveTo(30, -10, -80, -130 + wave * 18, -145, -100 + wave * 25);
    ctx.quadraticCurveTo(-55, -28, -85, 0); ctx.quadraticCurveTo(-50, 25, -140, 108 - wave * 22);
    ctx.bezierCurveTo(-65, 135 - wave * 18, 35, 10, 90, 5); ctx.quadraticCurveTo(105, 0, 90, -5);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-80, 0); ctx.bezierCurveTo(-130, 10, -190, wave * 25, -240, wave * 15); ctx.stroke();
    ctx.globalAlpha = .5;
    for (let rib = 0; rib < 5; rib++) {
      const x = -12 - rib * 19;
      ctx.beginPath(); ctx.moveTo(30, 0); ctx.quadraticCurveTo(x, -25, x - 10, -57 - rib * 8 + wave * 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, 0); ctx.quadraticCurveTo(x, 25, x - 10, 57 + rib * 8 - wave * 10); ctx.stroke();
    }
    ctx.fillStyle = '#e0f2fe'; ctx.beginPath(); ctx.arc(72, -5, 3, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'siphonophore') {
    for (let segment = 0; segment < 12; segment++) {
      const x = 125 - segment * 28, y = Math.sin(time * .6 + segment * .45) * 19;
      ctx.globalAlpha = .3 + (12 - segment) * .012;
      ctx.beginPath(); ctx.ellipse(x, y, segment ? 17 : 28, segment ? 26 : 37, -.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(x + 6, y - 4, 3, 0, Math.PI * 2); ctx.fill();
      if (segment % 2 === 0) {
        ctx.globalAlpha = .23; ctx.beginPath(); ctx.moveTo(x, y + 21);
        ctx.bezierCurveTo(x - 10, 55, x - 50, 75 + wave * 12, x - 100, 95 + wave * 15); ctx.stroke();
      }
    }
  } else if (type === 'chrono_nautilus') {
    ctx.beginPath(); ctx.ellipse(-15, -4, 81, 74, -.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    for (let point = 0; point <= 50; point++) {
      const angle = point * .22, radius = 3 + point * 1.4;
      const x = -15 + Math.cos(angle) * radius, y = -4 + Math.sin(angle) * radius * .87;
      point ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    for (let rib = 0; rib < 11; rib++) {
      const angle = rib * Math.PI * 2 / 11;
      ctx.beginPath(); ctx.moveTo(-15 + Math.cos(angle) * 64, -4 + Math.sin(angle) * 57);
      ctx.lineTo(-15 + Math.cos(angle) * 79, -4 + Math.sin(angle) * 72); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(68, 25, 35, 17, .2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (let arm = 0; arm < 7; arm++) {
      const y = 14 + arm * 4;
      ctx.beginPath(); ctx.moveTo(90, y); ctx.bezierCurveTo(140, y - 15, 180, y + wave * 25 + arm * 3, 210 - arm * 9, y + wave * 20); ctx.stroke();
    }
    ctx.fillStyle = '#e0f2fe'; ctx.beginPath(); ctx.arc(82, 20, 4, 0, Math.PI * 2); ctx.fill();
  }
}

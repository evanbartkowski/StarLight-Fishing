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
  } else if (event.id === 'abyssal_storm') {
    // Deep Ocean Tempest: Electric bioluminescent energy surging through turbulent waters
    // 1. Shifting deep indigo-cyan storm gradient overlay
    const stormGrad = ctx.createLinearGradient(0, 0, 0, height);
    stormGrad.addColorStop(0, 'rgba(30, 27, 75, 0.22)');
    stormGrad.addColorStop(0.5, 'rgba(67, 56, 202, 0.16)');
    stormGrad.addColorStop(1, 'rgba(15, 23, 42, 0.26)');
    ctx.fillStyle = stormGrad;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, width, height);

    // 2. Atmospheric lightning discharge flashes & plasma forks
    const stormPulse = Math.sin(t * 3.5);
    const flashTrigger = Math.sin(t * 1.8 + Math.cos(t * 2.7)) > 0.82;
    if (flashTrigger && !motion?.matches) {
      ctx.fillStyle = 'rgba(129, 140, 248, 0.12)';
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Arcing electrical tempest discharges through the water column
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#67e8f9';
    for (let bolt = 0; bolt < 4; bolt++) {
      const boltSeed = (bolt * 97 + Math.floor(t * 4)) % 1000;
      const startX = ((bolt * 311 + t * 40) % (width + 100)) - 50;
      let curX = startX;
      let curY = 0;
      ctx.strokeStyle = bolt % 2 === 0 ? '#38bdf8' : '#a855f7';
      ctx.globalAlpha = 0.35 + 0.3 * Math.sin(t * 5 + bolt);
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      while (curY < height) {
        curY += 28 + (boltSeed % 20);
        curX += (Math.sin(curY * 0.08 + t * 6 + bolt) * 32);
        ctx.lineTo(curX, curY);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // 4. Bioluminescent tempest swirls / vortex waves
    ctx.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      const waveY = (i * (height / 6) + t * 45) % (height + 80) - 40;
      const waveAlpha = 0.18 + 0.12 * Math.sin(t * 2 + i);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, ' + waveAlpha + ')' : 'rgba(168, 85, 247, ' + waveAlpha + ')';
      ctx.beginPath();
      ctx.moveTo(0, waveY);
      ctx.bezierCurveTo(
        width * 0.25, waveY - 50 + Math.sin(t * 3 + i) * 35,
        width * 0.75, waveY + 50 + Math.cos(t * 3 + i) * 35,
        width, waveY
      );
      ctx.stroke();
    }

    // 5. Charged ion sparks floating upward against the current
    ctx.fillStyle = '#67e8f9';
    ctx.globalAlpha = 0.55;
    for (let p = 0; p < 24; p++) {
      const px = (p * 79 + Math.sin(t * 2 + p) * 25) % width;
      const py = (height - (p * 53 + t * 80) % height);
      ctx.beginPath();
      ctx.arc(px, py, (p % 3) * 0.9 + 1.2, 0, Math.PI * 2);
      ctx.fill();
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

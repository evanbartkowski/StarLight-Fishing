// Illustrated Art rendering for Marine Companion Pets (Dolphin & Shark)
// Faithfully matches user-provided reference illustrations with natural swimming sway

export function drawMarinePet(ctx, kind, time = 0) {
  const isDolphin = kind === 'dolphin';

  ctx.save();
  if (isDolphin) {
    // Gracie the Bottlenose Dolphin:
    // Sleek periwinkle-blue body (#6583be), gentle bottle snout, rounded melon forehead,
    // graceful falcate dorsal fin, white chest/pectoral flipper, soft belly countershading,
    // cute dark eye with glossy glint, soft blush, and fluked tail with fluid swimming motion.
    const swimWave = Math.sin(time * 5.0);
    const tailFlukeWave = Math.sin(time * 5.0 - 0.7);

    ctx.save();
    // Smooth undulation of tail relative to head
    ctx.rotate(swimWave * 0.06);

    // 1. Pectoral flipper on chest (sleek swept-back paddle flipper)
    ctx.save();
    ctx.translate(10, 6.5);
    ctx.rotate(-0.15 + swimWave * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-3, 6, -9, 8.5);
    ctx.quadraticCurveTo(-11, 8.8, -10.5, 7.5);
    ctx.quadraticCurveTo(-6, 4.5, -1, 1);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#222831';
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    // 2. Main Dolphin Body (#6583be)
    const drawDolphinBodyPath = () => {
      ctx.beginPath();
      ctx.moveTo(34, 3);
      ctx.lineTo(40, 2);
      ctx.quadraticCurveTo(36, -2, 30, -5);
      ctx.quadraticCurveTo(20, -10, 6, -10);
      ctx.quadraticCurveTo(0, -18, -2, -22);
      ctx.quadraticCurveTo(-2, -14, -8, -9);
      const tailY = tailFlukeWave * 3.8;
      // Upper back tapering into tail stock (peduncle)
      ctx.quadraticCurveTo(-22, -8 + tailY * 0.4, -34, -2 + tailY);
      // Upper fluke wing
      ctx.quadraticCurveTo(-38, -9 + tailY, -45, -11 + tailY);
      ctx.quadraticCurveTo(-41, -2 + tailY, -38, 0 + tailY);
      // Lower fluke wing
      ctx.quadraticCurveTo(-41, 2 + tailY, -45, 9 + tailY);
      ctx.quadraticCurveTo(-38, 6 + tailY, -34, 2 + tailY);
      // Sleek lower belly contour: smooth gentle taper from peduncle to chest
      ctx.quadraticCurveTo(-20, 6 + tailY * 0.3, 0, 9);
      ctx.quadraticCurveTo(18, 9, 30, 4);
      ctx.closePath();
    };

    drawDolphinBodyPath();
    // Rich dual-tone oceanic gradient
    const bodyGrad = ctx.createLinearGradient(0, -22, 0, 10);
    bodyGrad.addColorStop(0, '#7c9be0');
    bodyGrad.addColorStop(0.65, '#6583be');
    bodyGrad.addColorStop(1, '#5370ab');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // 3. Soft lighter belly countershading (matches dolphin body colors smoothly with no dark line)
    ctx.save();
    const tailY = tailFlukeWave * 3.8;
    ctx.beginPath();
    ctx.moveTo(28, 4);
    ctx.quadraticCurveTo(18, 7, 2, 7.5);
    ctx.quadraticCurveTo(-14, 6, -28, 1.5 + tailY * 0.5);
    ctx.quadraticCurveTo(-20, 6 + tailY * 0.3, 0, 9);
    ctx.quadraticCurveTo(18, 9, 30, 4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(219, 234, 254, 0.45)';
    ctx.fill();
    ctx.restore();

    // 4. Crisp outer silhouette outline
    drawDolphinBodyPath();
    ctx.strokeStyle = '#222831';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // 5. Fluke median notch detail
    ctx.beginPath();
    ctx.moveTo(-35, 0 + tailY);
    ctx.lineTo(-38, 0 + tailY);
    ctx.strokeStyle = '#222831';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // 6. Sweet pink cheek blush
    ctx.beginPath();
    ctx.arc(23, 2.5, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(251, 113, 133, 0.38)';
    ctx.fill();

    // 7. Cute dark eye with lively white sparkle
    ctx.beginPath();
    ctx.arc(20, -1, 1.9, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(19.3, -1.6, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 8. Gentle mouth curve
    ctx.beginPath();
    ctx.moveTo(34, 2);
    ctx.lineTo(29, 3);
    ctx.strokeStyle = '#222831';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  } else {
    // Irene the Friendly Reef Shark:
    // Sleek oceanic slate-blue body (#5587c1), classic upright dorsal fin,
    // harmonious matching belly, triangular pectoral fin, 3 neat gill slits,
    // friendly smiling eye with white sparkle, soft cheek blush, cute white tooth,
    // and heterocercal tail with natural fluid swimming sway.
    const swimWave = Math.sin(time * 5.2);
    const tailFlukeWave = Math.sin(time * 5.2 - 0.7);

    ctx.save();
    ctx.rotate(swimWave * 0.05);

    // 1. Pectoral fin (sleek classic shark fin sweeping backward)
    ctx.save();
    ctx.translate(6, 7);
    ctx.rotate(-0.12 + swimWave * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-5, 6, -14, 11);
    ctx.quadraticCurveTo(-16, 11.2, -14, 8.8);
    ctx.quadraticCurveTo(-7, 4.8, -2, 1);
    ctx.closePath();
    ctx.fillStyle = '#477aa8';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    // 2. Main Shark Body
    // Snout at (+38, 0), Dorsal fin at (-2, -23), Tail at (-40, tailY)
    const tailY = tailFlukeWave * 3.8;
    const drawSharkBodyPath = () => {
      ctx.beginPath();
      // Snout tip
      ctx.moveTo(40, 1);
      // Upper snout curve
      ctx.quadraticCurveTo(34, -4, 24, -6);
      // Forehead into back
      ctx.quadraticCurveTo(12, -9, 4, -9);
      // Upright triangular dorsal fin
      ctx.quadraticCurveTo(2, -18, 0, -23);
      // Trailing dorsal fin edge
      ctx.quadraticCurveTo(-1, -16, -7, -9);
      // Back towards tail stock (peduncle)
      ctx.quadraticCurveTo(-20, -7 + tailY * 0.4, -34, -2 + tailY);
      // Heterocercal shark tail: tall upper lobe
      ctx.quadraticCurveTo(-41, -10 + tailY, -47, -12 + tailY);
      ctx.quadraticCurveTo(-42, -2 + tailY, -38, 0 + tailY);
      // Lower tail lobe
      ctx.quadraticCurveTo(-41, 5 + tailY, -44, 8 + tailY);
      ctx.quadraticCurveTo(-37, 4 + tailY, -33, 2 + tailY);
      // Smooth streamlined belly contour without sudden bulge
      ctx.quadraticCurveTo(-18, 7 + tailY * 0.3, 4, 9);
      // Throat to jaw
      ctx.quadraticCurveTo(22, 7.5, 34, 3);
      ctx.closePath();
    };

    drawSharkBodyPath();
    // Blue-grey shark body gradient
    const sharkGrad = ctx.createLinearGradient(0, -23, 0, 10);
    sharkGrad.addColorStop(0, '#6093cd');
    sharkGrad.addColorStop(0.6, '#5587c1');
    sharkGrad.addColorStop(1, '#3f6fa3');
    ctx.fillStyle = sharkGrad;
    ctx.fill();

    // 3. Soft lighter underbelly countershading (naturally blends with shark slate-blue with no dark dividing stroke)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(33, 2);
    ctx.quadraticCurveTo(20, 5.5, 4, 6.5);
    ctx.quadraticCurveTo(-14, 5.5, -28, 1.5 + tailY * 0.5);
    ctx.quadraticCurveTo(-18, 7 + tailY * 0.3, 4, 9);
    ctx.quadraticCurveTo(22, 7.5, 34, 3);
    ctx.closePath();
    const sharkBellyGrad = ctx.createLinearGradient(0, 0, 0, 9);
    sharkBellyGrad.addColorStop(0, 'rgba(219, 234, 254, 0.45)');
    sharkBellyGrad.addColorStop(1, 'rgba(241, 245, 249, 0.65)');
    ctx.fillStyle = sharkBellyGrad;
    ctx.fill();
    ctx.restore();

    // 4. Main body silhouette outline
    drawSharkBodyPath();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // 5. Three iconic vertical shark gill slits
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    for (let g = 0; g < 3; g++) {
      const gx = 6 - g * 3.5;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.quadraticCurveTo(gx - 0.8, 3, gx, 6);
      ctx.stroke();
    }

    // 6. Cute rosy blush cheek
    ctx.beginPath();
    ctx.arc(22, 2, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.fill();

    // 7. Friendly shark eye with white shine
    ctx.beginPath();
    ctx.arc(22, -2, 2.1, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(21.3, -2.7, 0.9, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 8. Cheerful smile with tiny cute white tooth
    ctx.beginPath();
    ctx.moveTo(34, 1.5);
    ctx.quadraticCurveTo(28, 4, 25, 2);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Small sharp cute tooth
    ctx.beginPath();
    ctx.moveTo(29, 2.5);
    ctx.lineTo(27.5, 4.8);
    ctx.lineTo(26, 2.5);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    ctx.restore();
  }
  ctx.restore();
}

export function drawPetNameplate(ctx, x, y, text) {
  ctx.save();
  ctx.translate(x, y);
  ctx.font = 'bold 11px Outfit, sans-serif';
  const width = ctx.measureText(text).width + 18;
  ctx.fillStyle = 'rgba(15,23,42,.92)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-width / 2, -11, width, 22, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e0f2fe';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

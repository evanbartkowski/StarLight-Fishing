function drawStar4(ctx, cx, cy, outerR, innerR) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const rad = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawVoidOrbitingStardust(ctx, r, t) {
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const angle = t * 1.5 + i * (Math.PI * 2 / 5);
    const radX = r * (1.15 + Math.sin(t * 0.8 + i) * 0.2);
    const radY = r * (0.65 + Math.cos(t * 0.6 + i) * 0.15);
    const sx = Math.cos(angle) * radX;
    const sy = Math.sin(angle) * radY;
    ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#f472b6';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 10;
    drawStar4(ctx, sx, sy, 3.2, 1.2);
  }
  ctx.restore();
}

function drawLavaMegalodon(ctx, threat, r, t) {
  const tailSway = Math.sin(t * 3.5) * (r * 0.12);
  const finFlutter = Math.sin(t * 4.0) * (r * 0.05);

  ctx.save();
  // Underbelly heat haze / fiery glow
  ctx.save();
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = 18;
  const underGlow = ctx.createLinearGradient(0, -r * 0.3, 0, r * 0.5);
  underGlow.addColorStop(0, 'rgba(239, 68, 68, 0)');
  underGlow.addColorStop(0.7, 'rgba(249, 115, 22, 0.45)');
  underGlow.addColorStop(1, 'rgba(254, 240, 138, 0.6)');
  ctx.fillStyle = underGlow;
  ctx.beginPath();
  ctx.ellipse(r * 0.1, r * 0.15, r * 0.7, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Heavy basalt obsidian body
  const bodyGrad = ctx.createLinearGradient(0, -r * 0.6, 0, r * 0.6);
  bodyGrad.addColorStop(0, '#1c1917');
  bodyGrad.addColorStop(0.5, '#292524');
  bodyGrad.addColorStop(0.85, '#450a0a');
  bodyGrad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 2.5;

  // Main shark torso & powerful caudal peduncle
  ctx.beginPath();
  ctx.moveTo(r * 1.05, -r * 0.05); // Snout
  ctx.quadraticCurveTo(r * 0.45, -r * 0.55, -r * 0.55, -r * 0.18);
  // Caudal tail fin
  ctx.lineTo(-r * 0.95 + tailSway * 0.3, -r * 0.55 + tailSway);
  ctx.quadraticCurveTo(-r * 0.8 + tailSway * 0.3, tailSway * 0.5, -r * 0.75 + tailSway * 0.3, 0);
  ctx.lineTo(-r * 0.98 + tailSway * 0.3, r * 0.48 + tailSway);
  ctx.quadraticCurveTo(-r * 0.65, r * 0.15, -r * 0.55, r * 0.18);
  ctx.quadraticCurveTo(r * 0.35, r * 0.52, r * 1.05, -r * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rugged volcanic dorsal fin with glowing magma crest
  ctx.save();
  const dorsalGrad = ctx.createLinearGradient(-r * 0.1, -r * 0.2, 0, -r * 0.8);
  dorsalGrad.addColorStop(0, '#1c1917');
  dorsalGrad.addColorStop(0.7, '#7f1d1d');
  dorsalGrad.addColorStop(1, '#f97316');
  ctx.fillStyle = dorsalGrad;
  ctx.beginPath();
  ctx.moveTo(-r * 0.22, -r * 0.2);
  ctx.quadraticCurveTo(-r * 0.1, -r * 0.6, 0, -r * 0.82); // Tip of dorsal
  ctx.quadraticCurveTo(-r * 0.02, -r * 0.5, r * 0.12, -r * 0.4);
  ctx.quadraticCurveTo(r * 0.2, -r * 0.3, r * 0.28, -r * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Volcanic pectoral fins with molten magma edges
  ctx.save();
  ctx.fillStyle = '#292524';
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(r * 0.3, r * 0.15);
  ctx.quadraticCurveTo(r * 0.15, r * 0.55 + finFlutter, -r * 0.25, r * 0.75 + finFlutter);
  ctx.quadraticCurveTo(-r * 0.15, r * 0.4, r * 0.05, r * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Branching molten lava veins across flank
  ctx.save();
  ctx.strokeStyle = '#f97316';
  ctx.shadowColor = '#ea580c';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(r * 0.75, 0);
  ctx.lineTo(r * 0.45, -r * 0.08);
  ctx.lineTo(r * 0.15, -r * 0.04);
  ctx.lineTo(-r * 0.18, -r * 0.12);
  ctx.lineTo(-r * 0.48, tailSway * 0.4);
  ctx.stroke();

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(r * 0.45, -r * 0.08);
  ctx.lineTo(r * 0.3, r * 0.1);
  ctx.lineTo(0, r * 0.05);
  ctx.lineTo(-r * 0.25, r * 0.08);
  ctx.stroke();
  ctx.restore();

  // Glowing volcanic gill vents venting molten heat
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 2;
  for (let g = 0; g < 4; g++) {
    const gx = r * (0.28 + g * 0.08);
    ctx.beginPath();
    ctx.moveTo(gx, -r * 0.12);
    ctx.lineTo(gx - r * 0.06, r * 0.1);
    ctx.stroke();
  }

  // Terrifying Gaping Magma Jaws
  ctx.fillStyle = '#450a0a';
  ctx.beginPath();
  ctx.moveTo(r * 0.42, r * 0.06);
  ctx.lineTo(r * 0.98, -r * 0.02);
  ctx.quadraticCurveTo(r * 0.75, r * 0.36, r * 0.42, r * 0.06);
  ctx.closePath();
  ctx.fill();

  // Razor-sharp double-tier jagged incandescent magma teeth
  ctx.fillStyle = '#fffbeb';
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1;
  for (let tooth = 0; tooth < 7; tooth++) {
    const tx = r * (0.48 + tooth * 0.07);
    ctx.beginPath();
    ctx.moveTo(tx, r * 0.04);
    ctx.lineTo(tx + r * 0.03, r * 0.16);
    ctx.lineTo(tx + r * 0.055, r * 0.03);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Lower jaw serrated teeth pointing upward
  for (let tooth = 0; tooth < 5; tooth++) {
    const tx = r * (0.55 + tooth * 0.075);
    ctx.beginPath();
    ctx.moveTo(tx, r * 0.22);
    ctx.lineTo(tx + r * 0.025, r * 0.12);
    ctx.lineTo(tx + r * 0.05, r * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Searing volcanic magma eye with blazing sulfur iris
  ctx.save();
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(r * 0.72, -r * 0.14, Math.max(3, r * 0.065), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.arc(r * 0.73, -r * 0.14, Math.max(1.5, r * 0.03), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Drifting cinder ember sparks
  ctx.fillStyle = '#fef08a';
  for (let p = 0; p < 4; p++) {
    const px = -r * 0.6 - p * r * 0.15;
    const py = Math.sin(t * 3 + p * 2) * (r * 0.25) - r * 0.1;
    ctx.beginPath();
    ctx.arc(px, py, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawVoidMegalodon(ctx, threat, r, t) {
  const tailSway = Math.sin(t * 2.8) * (r * 0.1);
  const finWave = Math.sin(t * 2.5) * (r * 0.06);

  ctx.save();

  // 1. Luminous Celestial Aurora Halo / Shimmer
  ctx.save();
  ctx.shadowColor = '#c084fc';
  ctx.shadowBlur = 24;
  const auroraGlow = ctx.createLinearGradient(-r * 0.8, 0, r * 0.8, 0);
  auroraGlow.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
  auroraGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.45)');
  auroraGlow.addColorStop(1, 'rgba(244, 114, 182, 0.45)');
  ctx.strokeStyle = auroraGlow;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(r * 1.08, 0);
  ctx.quadraticCurveTo(r * 0.45, -r * 0.52, -r * 0.55, -r * 0.15);
  ctx.quadraticCurveTo(-r * 0.8, tailSway, -r * 1.0, tailSway);
  ctx.quadraticCurveTo(-r * 0.65, r * 0.15, -r * 0.55, r * 0.16);
  ctx.quadraticCurveTo(r * 0.4, r * 0.5, r * 1.08, 0);
  ctx.stroke();
  ctx.restore();

  // 2. Cosmic Nebula Gradient Body
  const nebulaGrad = ctx.createLinearGradient(-r * 0.8, -r * 0.4, r * 0.8, r * 0.4);
  nebulaGrad.addColorStop(0, '#090d16');
  nebulaGrad.addColorStop(0.25, '#1e1b4b');
  nebulaGrad.addColorStop(0.55, '#4338ca');
  nebulaGrad.addColorStop(0.8, '#7c3aed');
  nebulaGrad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = nebulaGrad;
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(r * 1.08, 0); // Graceful pointed celestial snout
  ctx.quadraticCurveTo(r * 0.48, -r * 0.5, -r * 0.55, -r * 0.16);
  // Crescent lunar tail flukes
  ctx.lineTo(-r * 1.02 + tailSway * 0.3, -r * 0.62 + tailSway);
  ctx.quadraticCurveTo(-r * 0.82 + tailSway * 0.3, tailSway * 0.5, -r * 0.78 + tailSway * 0.3, 0);
  ctx.lineTo(-r * 1.04 + tailSway * 0.3, r * 0.55 + tailSway);
  ctx.quadraticCurveTo(-r * 0.65, r * 0.14, -r * 0.55, r * 0.16);
  ctx.quadraticCurveTo(r * 0.42, r * 0.48, r * 1.08, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Faceted Star-Glass Crystalline Dorsal Fin with internal Constellation
  ctx.save();
  const dorsalCrystal = ctx.createLinearGradient(-r * 0.1, -r * 0.1, 0, -r * 0.85);
  dorsalCrystal.addColorStop(0, 'rgba(67, 56, 202, 0.9)');
  dorsalCrystal.addColorStop(0.5, 'rgba(168, 85, 247, 0.85)');
  dorsalCrystal.addColorStop(1, 'rgba(224, 231, 255, 0.95)');
  ctx.fillStyle = dorsalCrystal;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, -r * 0.18);
  ctx.lineTo(-r * 0.08, -r * 0.82); // High crystalline apex
  ctx.lineTo(r * 0.08, -r * 0.75);
  ctx.lineTo(r * 0.22, -r * 0.32);
  ctx.lineTo(r * 0.25, -r * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Internal constellation nodes inside dorsal fin
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  for (let c = 0; c < 3; c++) {
    const cx = -r * 0.05 + c * r * 0.06;
    const cy = -r * (0.65 - c * 0.18);
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. Sweeping Prismatic Pectoral Wing-Fins
  ctx.save();
  const pectGrad = ctx.createLinearGradient(r * 0.25, r * 0.15, -r * 0.2, r * 0.8);
  pectGrad.addColorStop(0, 'rgba(67, 56, 202, 0.9)');
  pectGrad.addColorStop(0.6, 'rgba(124, 58, 237, 0.8)');
  pectGrad.addColorStop(1, 'rgba(56, 189, 248, 0.9)');
  ctx.fillStyle = pectGrad;
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(r * 0.32, r * 0.14);
  ctx.quadraticCurveTo(r * 0.1, r * 0.55 + finWave, -r * 0.35, r * 0.82 + finWave);
  ctx.quadraticCurveTo(-r * 0.18, r * 0.42, r * 0.06, r * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5. Constellation Stars along Lateral Line
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let s = 0; s < 6; s++) {
    const sx = r * (0.7 - s * 0.22);
    const sy = Math.sin(s * 1.2) * (r * 0.06);
    if (s === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Glowing diamond star markers
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 10;
  for (let s = 0; s < 6; s++) {
    const sx = r * (0.7 - s * 0.22);
    const sy = Math.sin(s * 1.2) * (r * 0.06);
    drawStar4(ctx, sx, sy, 3.5, 1.5);
  }
  ctx.restore();

  // 6. Ethereal Luminous Gill Ribbons
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 6;
  for (let g = 0; g < 4; g++) {
    const gx = r * (0.28 + g * 0.075);
    ctx.beginPath();
    ctx.moveTo(gx, -r * 0.12);
    ctx.lineTo(gx - r * 0.05, r * 0.1);
    ctx.stroke();
  }

  // 7. Gaping Diamond-Lined Jaws
  ctx.fillStyle = '#050814';
  ctx.beginPath();
  ctx.moveTo(r * 0.45, r * 0.05);
  ctx.lineTo(r * 1.02, 0);
  ctx.quadraticCurveTo(r * 0.78, r * 0.34, r * 0.45, r * 0.05);
  ctx.closePath();
  ctx.fill();

  // Glistening Diamond Crystal Teeth (Upper & Lower)
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  for (let tooth = 0; tooth < 7; tooth++) {
    const tx = r * (0.5 + tooth * 0.07);
    ctx.beginPath();
    ctx.moveTo(tx, r * 0.03);
    ctx.lineTo(tx + r * 0.028, r * 0.14);
    ctx.lineTo(tx + r * 0.05, r * 0.02);
    ctx.closePath();
    ctx.fill();
  }
  for (let tooth = 0; tooth < 5; tooth++) {
    const tx = r * (0.58 + tooth * 0.075);
    ctx.beginPath();
    ctx.moveTo(tx, r * 0.2);
    ctx.lineTo(tx + r * 0.025, r * 0.1);
    ctx.lineTo(tx + r * 0.048, r * 0.22);
    ctx.closePath();
    ctx.fill();
  }

  // 8. Supernova Star Eye with Radiant 4-Point Lens Flare
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(r * 0.74, -r * 0.13, Math.max(3.5, r * 0.07), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  drawStar4(ctx, r * 0.74, -r * 0.13, Math.max(5, r * 0.1), Math.max(1.8, r * 0.035));

  // 9. Orbiting Cosmic Stardust Particles
  for (let p = 0; p < 6; p++) {
    const angle = t * 1.8 + p * (Math.PI * 2 / 6);
    const ox = Math.cos(angle) * (r * 0.95);
    const oy = Math.sin(angle) * (r * 0.55);
    ctx.fillStyle = p % 2 === 0 ? '#fbcfe8' : '#a5f3fc';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 8;
    drawStar4(ctx, ox, oy, 2.5, 1.0);
  }

  ctx.restore();
}

function drawHourglassJelly(ctx, threat, r, t) {
  ctx.save();
  // 1. Ethereal silk bioluminescent tentacles
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * r * 0.18;
    const tentWave1 = Math.sin(t * 2.2 + i * 0.9) * (r * 0.22);
    const tentWave2 = Math.cos(t * 1.8 + i * 0.7) * (r * 0.28);
    ctx.save();
    const tentGrad = ctx.createLinearGradient(x, 0, x, r * 1.2);
    tentGrad.addColorStop(0, 'rgba(168, 85, 247, 0.85)');
    tentGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.75)');
    tentGrad.addColorStop(1, 'rgba(244, 114, 182, 0.9)');
    ctx.strokeStyle = tentGrad;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(x, r * 0.1);
    ctx.bezierCurveTo(x + tentWave1, r * 0.45, x - tentWave2, r * 0.8, x + tentWave1 * 0.8, r * 1.25);
    ctx.stroke();

    // Glowing stardust beads on tentacle tips
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + tentWave1 * 0.8, r * 1.25, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Translucent Glass Hourglass Bell
  ctx.save();
  ctx.shadowColor = '#c084fc';
  ctx.shadowBlur = 18;
  const glassGrad = ctx.createRadialGradient(0, -r * 0.25, r * 0.1, 0, -r * 0.25, r * 0.75);
  glassGrad.addColorStop(0, 'rgba(224, 231, 255, 0.85)');
  glassGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.45)');
  glassGrad.addColorStop(1, 'rgba(56, 189, 248, 0.7)');
  ctx.fillStyle = glassGrad;
  ctx.strokeStyle = '#e0e7ff';
  ctx.lineWidth = 2;

  // Hourglass bell contour
  ctx.beginPath();
  ctx.moveTo(-r * 0.65, -r * 0.65);
  ctx.quadraticCurveTo(0, -r * 0.78, r * 0.65, -r * 0.65);
  ctx.quadraticCurveTo(r * 0.25, -r * 0.25, r * 0.12, -r * 0.2); // Waist
  ctx.quadraticCurveTo(r * 0.6, -r * 0.1, r * 0.65, r * 0.1);
  ctx.quadraticCurveTo(0, r * 0.22, -r * 0.65, r * 0.1);
  ctx.quadraticCurveTo(-r * 0.6, -r * 0.1, -r * 0.12, -r * 0.2); // Waist
  ctx.quadraticCurveTo(-r * 0.25, -r * 0.25, -r * 0.65, -r * 0.65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Cosmic Chrono Sand flowing through the hourglass waist
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 10;
  // Upper chamber sand
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.45, r * 0.35, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Falling sand trickle
  ctx.fillRect(-1.5, -r * 0.35, 3, r * 0.25);
  // Lower chamber sand mound
  ctx.beginPath();
  ctx.ellipse(0, r * 0.05, r * 0.25, r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

function drawChronovoreNautilus(ctx, threat, r, t) {
  ctx.save();
  // 1. Gilded cosmic spiral shell
  ctx.save();
  ctx.shadowColor = '#c084fc';
  ctx.shadowBlur = 14;
  const shellGrad = ctx.createRadialGradient(-r * 0.1, 0, r * 0.1, 0, 0, r * 0.75);
  shellGrad.addColorStop(0, '#fef08a');
  shellGrad.addColorStop(0.35, '#c084fc');
  shellGrad.addColorStop(0.75, '#4338ca');
  shellGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = shellGrad;
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden Fibonacci chrono spiral
  ctx.beginPath();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 100; i++) {
    const angle = i * 0.16;
    const rad = (i / 100) * r * 0.58;
    const x = Math.cos(angle) * rad;
    const y = Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // 2. Translucent celestial mantle & stardust tentacles
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
  ctx.beginPath();
  ctx.ellipse(r * 0.38, r * 0.1, r * 0.28, r * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#a5f3fc';
  ctx.lineWidth = 2.2;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  for (let i = 0; i < 7; i++) {
    const yOff = (i - 3) * r * 0.08 + r * 0.1;
    const wave = Math.sin(t * 3 + i * 0.7) * (r * 0.18);
    ctx.beginPath();
    ctx.moveTo(r * 0.45, yOff);
    ctx.quadraticCurveTo(r * 0.8 + wave * 0.5, yOff * 1.2, r * 1.15 + wave, yOff * 1.4);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Hypnotic Clockwork Chrono Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(r * 0.35, -r * 0.08, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(r * 0.35, -r * 0.08, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Spinning chrono hand
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(r * 0.35, -r * 0.08);
  ctx.lineTo(r * 0.35 + Math.cos(t * 4) * (r * 0.045), -r * 0.08 + Math.sin(t * 4) * (r * 0.045));
  ctx.stroke();

  ctx.restore();
}

function drawCelestialSerpent(ctx, threat, r, t) {
  ctx.save();
  const sway1 = Math.sin(t * 2.5) * (r * 0.22);
  const sway2 = Math.sin(t * 2.5 - 1.2) * (r * 0.28);

  // 1. Cosmic body ribbon
  ctx.save();
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = 20;
  const serpentGrad = ctx.createLinearGradient(r * 0.5, 0, -r * 1.3, 0);
  serpentGrad.addColorStop(0, '#38bdf8');
  serpentGrad.addColorStop(0.35, '#7c3aed');
  serpentGrad.addColorStop(0.7, '#312e81');
  serpentGrad.addColorStop(1, '#090d16');
  ctx.strokeStyle = serpentGrad;
  ctx.lineWidth = r * 0.42;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(r * 0.52, 0);
  ctx.bezierCurveTo(r * 0.1, -r * 0.55, -r * 0.25, r * 0.65, -r * 0.65, -r * 0.35 + sway1);
  ctx.bezierCurveTo(-r * 0.85, -r * 0.1, -r * 1.05, r * 0.4, -r * 1.35, sway2);
  ctx.stroke();
  ctx.restore();

  // 2. Shimmering Starlight Spine Crests
  for (let s = 0; s < 6; s++) {
    const sx = -r * 0.95 + s * r * 0.24;
    const sy = Math.sin(t * 2.5 + s * 0.8) * (r * 0.2) - r * 0.18;
    ctx.fillStyle = s % 2 === 0 ? '#38bdf8' : '#f472b6';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - r * 0.08, sy - r * 0.35);
    ctx.lineTo(sx + r * 0.08, sy);
    ctx.closePath();
    ctx.fill();
  }

  // 3. Majestic Astral Dragon Head
  ctx.fillStyle = '#1e1b4b';
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(r * 0.55, 0, r * 0.42, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Grand Celestial Dragon Horns arching back
  ctx.save();
  const hornGrad = ctx.createLinearGradient(r * 0.5, -r * 0.15, r * 0.1, -r * 0.65);
  hornGrad.addColorStop(0, '#a855f7');
  hornGrad.addColorStop(1, '#fef08a');
  ctx.fillStyle = hornGrad;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(r * 0.45, -r * 0.15);
  ctx.quadraticCurveTo(r * 0.3, -r * 0.52, r * 0.1, -r * 0.65);
  ctx.quadraticCurveTo(r * 0.35, -r * 0.38, r * 0.58, -r * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Gaping celestial maw
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.moveTo(r * 0.52, -r * 0.08);
  ctx.lineTo(r * 0.92, 0);
  ctx.lineTo(r * 0.52, r * 0.1);
  ctx.closePath();
  ctx.fill();

  // Diamond crystal fangs
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(r * 0.65, -r * 0.07); ctx.lineTo(r * 0.68, r * 0.06); ctx.lineTo(r * 0.72, -r * 0.07);
  ctx.moveTo(r * 0.76, -r * 0.04); ctx.lineTo(r * 0.79, r * 0.06); ctx.lineTo(r * 0.83, -r * 0.04);
  ctx.fill();

  // Brilliant Supernova Star Eye
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(r * 0.62, -r * 0.12, Math.max(3, r * 0.06), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  drawStar4(ctx, r * 0.62, -r * 0.12, Math.max(4.5, r * 0.09), Math.max(1.5, r * 0.03));

  ctx.restore();
}

function drawCelestialEel(ctx, threat, r, t) {
  ctx.save();
  const eelWave1 = Math.sin(t * 3.2) * (r * 0.2);
  const eelWave2 = Math.sin(t * 3.2 - 1.0) * (r * 0.26);

  // Sinuous cosmic ribbon
  ctx.save();
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 16;
  const eelGrad = ctx.createLinearGradient(r * 0.5, 0, -r * 1.1, 0);
  eelGrad.addColorStop(0, '#38bdf8');
  eelGrad.addColorStop(0.45, '#818cf8');
  eelGrad.addColorStop(0.8, '#c084fc');
  eelGrad.addColorStop(1, '#090d16');
  ctx.strokeStyle = eelGrad;
  ctx.lineWidth = r * 0.28;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(r * 0.55, 0);
  ctx.bezierCurveTo(r * 0.1, -r * 0.5, -r * 0.2, r * 0.55, -r * 0.6, eelWave1);
  ctx.bezierCurveTo(-r * 0.8, -r * 0.2, -r * 1.0, r * 0.3, -r * 1.25, eelWave2);
  ctx.stroke();
  ctx.restore();

  // Translucent glowing dorsal fin ribbon
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(r * 0.45, -r * 0.14);
  ctx.bezierCurveTo(r * 0.1, -r * 0.62, -r * 0.2, r * 0.45, -r * 0.6, eelWave1 - r * 0.14);
  ctx.bezierCurveTo(-r * 0.8, -r * 0.3, -r * 1.0, r * 0.2, -r * 1.25, eelWave2 - r * 0.1);
  ctx.stroke();
  ctx.restore();

  // Celestial Riftfang Head
  ctx.fillStyle = '#1e1b4b';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(r * 0.55, 0, r * 0.36, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Crystal needle fangs
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  for (let f = 0; f < 4; f++) {
    const fx = r * (0.58 + f * 0.08);
    ctx.beginPath();
    ctx.moveTo(fx, -r * 0.08);
    ctx.lineTo(fx + r * 0.02, r * 0.04);
    ctx.lineTo(fx + r * 0.04, -r * 0.08);
    ctx.closePath();
    ctx.fill();
  }

  // Radiant star eye
  ctx.fillStyle = '#f472b6';
  ctx.shadowColor = '#f472b6';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(r * 0.62, -r * 0.09, Math.max(2.5, r * 0.05), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  drawStar4(ctx, r * 0.62, -r * 0.09, Math.max(4, r * 0.08), Math.max(1.2, r * 0.025));

  ctx.restore();
}

export function drawMarineThreat(ctx, threat) {
  const r = threat.radius / threat.sizeScale;
  const t = threat.timer;
  const isVoidRealm = threat.zone === 7 || threat.behavior?.zone === 7 || (threat.id && String(threat.id).includes('_7_')) || threat.behavior?.monsterForm === 'void_megalodon';
  const isCaldera = threat.zone === 6 || threat.behavior?.zone === 6 || (threat.id && String(threat.id).includes('_6_'));
  const isLavaMegalodon = threat.behavior?.monsterForm === 'lava_megalodon' || (threat.behavior?.monsterForm === 'megalodon' && isCaldera) || threat.id === 'marine_6_lava_megalodon';
  const isVoidMegalodon = threat.behavior?.monsterForm === 'void_megalodon' || (threat.behavior?.monsterForm === 'megalodon' && isVoidRealm) || threat.id === 'marine_7_cosmic_megalodon';

  ctx.save();
  if (threat.marineKind !== 'jelly') {
    ctx.scale(threat.facing || 1, 1);
    if (threat.swimAngle) {
      ctx.rotate((threat.facing || 1) * threat.swimAngle);
    }
  }

  // Ethereal celestial aura behind all Realm 7 enemies
  if (isVoidRealm) {
    ctx.save();
    ctx.shadowColor = threat.glow || '#c084fc';
    ctx.shadowBlur = 18;
    const aura = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.15);
    aura.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
    aura.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
    aura.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.15, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (isVoidMegalodon) {
    drawVoidMegalodon(ctx, threat, r, t);
    drawVoidOrbitingStardust(ctx, r, t);
    ctx.restore();
    return;
  }

  if (isLavaMegalodon) {
    drawLavaMegalodon(ctx, threat, r, t);
    ctx.restore();
    return;
  }

  const body = ctx.createLinearGradient(0, -r, 0, r);
  body.addColorStop(0, threat.color || (isVoidRealm ? '#4338ca' : '#243c59'));
  body.addColorStop(0.6, isVoidRealm ? '#6366f1' : '#243c59');
  body.addColorStop(1, isVoidRealm ? '#38bdf8' : '#bacbd7');
  ctx.fillStyle = body;
  ctx.strokeStyle = threat.glow || (isVoidRealm ? '#c084fc' : '#38bdf8');
  ctx.lineWidth = 2;
  if (threat.marineKind === 'jelly') {
    if (isVoidRealm) {
      drawHourglassJelly(ctx, threat, r, t);
    } else {
      for (let i = 0; i < 6; i++) {
        const x = (i - 2.5) * r * 0.22;
        ctx.beginPath(); ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + Math.sin(t + i) * 12, r * .3, x - 10, r * .6, x + Math.sin(t * .7 + i) * 9, r * .9);
        ctx.stroke();
      }
      ctx.globalAlpha *= .85;
      ctx.beginPath(); ctx.ellipse(0, -r * .2, r * .75, r * .55, 0, Math.PI, Math.PI * 2);
      ctx.quadraticCurveTo(0, r * .15, -r * .75, -r * .2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath(); ctx.ellipse(-r * .2, -r * .45, r * .18, r * .09, -.4, 0, Math.PI * 2); ctx.fill();
    }
  } else if (threat.marineKind === 'crab') {
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo((i - 1.5) * r * .28, side * r * .2);
      ctx.lineTo((i - 1.5) * r * .5, side * r * (.6 + Math.sin(t + i) * .1));
      ctx.lineTo((i - 1.5) * r * .7, side * r * .8); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(0, 0, r * .65, r * .42, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(r * .3, side * r * .2); ctx.lineTo(r * .9, side * r * .5); ctx.stroke();
      ctx.beginPath(); ctx.arc(r * .9, side * r * .5, r * .22, .4, Math.PI * 1.8); ctx.lineTo(r * .9, side * r * .5); ctx.fill(); ctx.stroke();
    }
  } else if (threat.marineKind === 'nautilus') {
    if (isVoidRealm) {
      drawChronovoreNautilus(ctx, threat, r, t);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, r * .65, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 100; i++) { const angle = i * .16, radius = i / 100 * r * .55; ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius); }
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(r * .4, r * .3); ctx.quadraticCurveTo(r, (i - 2) * r * .2, r * 1.1 + Math.sin(t + i) * 6, (i - 2) * r * .2); ctx.stroke();
      }
    }
  } else if (threat.marineKind === 'lionfish') {
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI * 2 / 12;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r * .8); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(0, 0, r * .65, r * .3, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * r * .2, -r * .25); ctx.lineTo((i - .4) * r * .2, r * .25); ctx.stroke(); }
  } else if (threat.marineKind === 'ray') {
    ctx.beginPath(); ctx.moveTo(r * .75, 0);
    ctx.quadraticCurveTo(0, -r * .3, -r * .5, -r * (.8 + Math.sin(t) * .1));
    ctx.quadraticCurveTo(-r * .2, 0, -r * .8, 0);
    ctx.quadraticCurveTo(-r * .2, 0, -r * .5, r * (.8 + Math.sin(t) * .1));
    ctx.quadraticCurveTo(0, r * .3, r * .75, 0); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * .5, 0); ctx.quadraticCurveTo(-r, r * .2, -r * 1.3, Math.sin(t) * 10); ctx.stroke();
  } else if (threat.marineKind === 'plesiosaur' || threat.marineKind === 'mosasaur') {
    const longNeck = threat.marineKind === 'plesiosaur';
    ctx.beginPath(); ctx.ellipse(-r * .15, 0, r * .55, r * .23, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const side of [-1, 1]) for (const x of [-.4, .15]) {
      ctx.beginPath(); ctx.moveTo(x * r, side * r * .12);
      ctx.quadraticCurveTo((x - .1) * r, side * r * .6, (x - .4) * r, side * r * (.55 + Math.sin(t) * .06));
      ctx.lineTo((x - .2) * r, side * r * .1); ctx.fill(); ctx.stroke();
    }
    ctx.strokeStyle = threat.color; ctx.lineWidth = r * .16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(r * .2, 0);
    ctx.bezierCurveTo(r * .6, 0, r * .3, -r * (longNeck ? .65 : .15), r * .7, -r * (longNeck ? .5 : .1)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * .55, 0); ctx.quadraticCurveTo(-r * .9, r * .2, -r * 1.2, Math.sin(t) * r * .15); ctx.stroke();
    const headY = -r * (longNeck ? .5 : .1);
    ctx.fillStyle = threat.color; ctx.beginPath(); ctx.ellipse(r * .76, headY, r * .23, r * .12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffb4a0'; ctx.beginPath(); ctx.arc(r * .78, headY - r * .04, r * .025, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff4d6';
    for (let i = 0; i < 5; i++) { const x = r * (.67 + i * .055); ctx.beginPath(); ctx.moveTo(x, headY + r * .04); ctx.lineTo(x + r * .025, headY + r * .105); ctx.lineTo(x + r * .04, headY + r * .04); ctx.fill(); }
  } else if (threat.marineKind === 'siren' || threat.behavior.monsterForm === 'siren') {
    // Astral Deep Siren: Ethereal mermaid beauty combined with terrifying predatory maw and scary needle teeth
    const sirenSway = Math.sin(t * 3.5) * (r * 0.15);
    const tailWave = Math.sin(t * 3.2) * (r * 0.22);
    const hairWave = Math.sin(t * 2.4) * (r * 0.12);

    // 1. Shadowy undulating nebula tail
    ctx.fillStyle = threat.color || '#6366f1';
    ctx.beginPath();
    ctx.moveTo(r * 0.05, 0);
    ctx.quadraticCurveTo(-r * 0.3, tailWave * 0.5, -r * 0.6, tailWave);
    ctx.quadraticCurveTo(-r * 0.85, tailWave * 1.3, -r * 1.05, tailWave * 1.2);
    ctx.quadraticCurveTo(-r * 0.8, tailWave * 0.8, -r * 0.55, tailWave * 0.3);
    ctx.quadraticCurveTo(-r * 0.25, -r * 0.08, r * 0.05, -r * 0.05);
    ctx.closePath();
    ctx.fill();

    // Spectral caudal flukes
    ctx.save();
    ctx.fillStyle = threat.glow || '#e879f9';
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, tailWave * 1.2);
    ctx.quadraticCurveTo(-r * 1.25, -r * 0.35 + tailWave, -r * 1.45, -r * 0.45 + tailWave);
    ctx.quadraticCurveTo(-r * 1.25, tailWave * 0.9, -r * 1.05, tailWave * 1.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, tailWave * 1.2);
    ctx.quadraticCurveTo(-r * 1.25, r * 0.35 + tailWave, -r * 1.45, r * 0.45 + tailWave);
    ctx.quadraticCurveTo(-r * 1.25, tailWave * 1.4, -r * 1.05, tailWave * 1.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Long flowing shadowy nebula hair
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(r * 0.35, -r * 0.35);
    ctx.quadraticCurveTo(0, -r * 0.55 + hairWave, -r * 0.45, -r * 0.4 + hairWave);
    ctx.quadraticCurveTo(-r * 0.75, -r * 0.25 + hairWave * 1.5, -r * 0.95, -r * 0.15 + hairWave);
    ctx.quadraticCurveTo(-r * 0.65, -r * 0.1, -r * 0.35, -r * 0.15);
    ctx.quadraticCurveTo(r * 0.05, -r * 0.2, r * 0.25, -r * 0.18);
    ctx.closePath();
    ctx.fill();

    // Luminous hair strands
    ctx.strokeStyle = threat.glow || '#e879f9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r * 0.35, -r * 0.35);
    ctx.quadraticCurveTo(0, -r * 0.48 + hairWave, -r * 0.55, -r * 0.3 + hairWave);
    ctx.stroke();

    // 3. Ethereal Siren Torso & Grasping Talons
    ctx.fillStyle = threat.color || '#818cf8';
    ctx.beginPath();
    ctx.moveTo(r * 0.05, -r * 0.05);
    ctx.quadraticCurveTo(r * 0.2, -r * 0.18, r * 0.35, -r * 0.2);
    ctx.quadraticCurveTo(r * 0.48, -r * 0.1, r * 0.45, 0);
    ctx.quadraticCurveTo(r * 0.28, r * 0.05, r * 0.05, 0);
    ctx.closePath();
    ctx.fill();

    // Clawed webbed arms reaching aggressively toward hook
    ctx.strokeStyle = threat.color || '#818cf8';
    ctx.lineWidth = r * 0.08;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.3, -r * 0.08);
    ctx.quadraticCurveTo(r * 0.55, r * 0.05 + sirenSway * 0.5, r * 0.75, r * 0.02 + sirenSway);
    ctx.stroke();
    // Talons / claws
    ctx.fillStyle = '#ffffff';
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.moveTo(r * 0.74, r * 0.02 + sirenSway + c * 3);
      ctx.lineTo(r * 0.84, r * 0.01 + sirenSway + c * 4);
      ctx.lineTo(r * 0.76, r * 0.04 + sirenSway + c * 3);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Siren Head & Terrifying Predatory Scary Teeth
    // Head & brow
    ctx.fillStyle = threat.color || '#818cf8';
    ctx.beginPath();
    ctx.ellipse(r * 0.44, -r * 0.24, r * 0.18, r * 0.15, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Gaping cavernous predatory throat
    ctx.fillStyle = '#180b1e';
    ctx.beginPath();
    ctx.moveTo(r * 0.42, -r * 0.24);
    ctx.lineTo(r * 0.68, -r * 0.34);
    ctx.quadraticCurveTo(r * 0.62, -r * 0.15, r * 0.68, 0.02);
    ctx.lineTo(r * 0.42, -r * 0.14);
    ctx.closePath();
    ctx.fill();

    // Terrifying razor needle teeth (Upper jaw)
    ctx.fillStyle = '#ffffff';
    for (let tooth = 0; tooth < 5; tooth++) {
      const tx = r * (0.45 + tooth * 0.052);
      const ty = -r * (0.24 + tooth * 0.02);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + r * 0.02, ty + r * 0.11);
      ctx.lineTo(tx + r * 0.04, ty);
      ctx.closePath();
      ctx.fill();
    }
    // Terrifying razor needle teeth (Lower jaw pointing up)
    for (let tooth = 0; tooth < 5; tooth++) {
      const tx = r * (0.45 + tooth * 0.052);
      const ty = -r * (0.13 - tooth * 0.03);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + r * 0.02, ty - r * 0.11);
      ctx.lineTo(tx + r * 0.04, ty);
      ctx.closePath();
      ctx.fill();
    }

    // Piercing glowing red/magenta predatory star eye
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(r * 0.44, -r * 0.28, Math.max(2.5, r * 0.045), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.44, -r * 0.28, Math.max(1, r * 0.02), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (threat.marineKind === 'monster' || threat.marineKind === 'eel') {
    const monster = threat.marineKind === 'monster';
    const form = threat.behavior.monsterForm;

    if (monster && form === 'magma_maw') {
      // Magma Caldera Behemoth: Massive cracked obsidian leviathan with glowing molten veins & fiery maw
      const magmaSway = Math.sin(t * 2.2) * (r * 0.12);

      // 1. Heavy serpentine / leviathan body
      ctx.strokeStyle = '#1c1917'; // Obsidian stone
      ctx.lineWidth = r * 0.52;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(r * 0.5, 0);
      ctx.bezierCurveTo(-r * 0.1, -r * 0.5, -r * 0.25, r * 0.6, -r * 0.95, magmaSway);
      ctx.stroke();

      // 2. Pulsing Molten Lava Veins running through cracked basalt carapace
      ctx.save();
      ctx.strokeStyle = threat.glow || '#f97316';
      ctx.shadowColor = threat.glow || '#f97316';
      ctx.shadowBlur = 12;
      ctx.lineWidth = r * 0.09;
      ctx.beginPath();
      ctx.moveTo(r * 0.45, -r * 0.08);
      ctx.lineTo(r * 0.15, -r * 0.02);
      ctx.lineTo(-r * 0.1, -r * 0.15);
      ctx.lineTo(-r * 0.4, -r * 0.05);
      ctx.lineTo(-r * 0.7, magmaSway * 0.5);
      ctx.stroke();

      ctx.strokeStyle = '#facc15'; // Incandescent yellow core veins
      ctx.lineWidth = r * 0.04;
      ctx.beginPath();
      ctx.moveTo(r * 0.4, r * 0.08);
      ctx.lineTo(r * 0.1, r * 0.12);
      ctx.lineTo(-r * 0.25, r * 0.08);
      ctx.lineTo(-r * 0.55, magmaSway * 0.7);
      ctx.stroke();
      ctx.restore();

      // 3. Volcanic Basalt Spines & Horns
      ctx.fillStyle = '#451a03';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const sx = -r * 0.65 + i * r * 0.25;
        const sy = -r * 0.15;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - r * 0.1, sy - r * 0.45);
        ctx.lineTo(sx + r * 0.12, sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Massive obsidian head
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.ellipse(r * 0.55, 0, r * 0.42, r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gaping incandescent fiery magma maw
      ctx.save();
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.ellipse(r * 0.72, r * 0.04, r * 0.26, r * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Molten liquid flame core
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(r * 0.7, r * 0.04, r * 0.16, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Razor jagged obsidian burning teeth
      ctx.fillStyle = '#fff7ed';
      for (let tooth = 0; tooth < 5; tooth++) {
        const tx = r * (0.52 + tooth * 0.08);
        ctx.beginPath();
        ctx.moveTo(tx, -r * 0.12);
        ctx.lineTo(tx + r * 0.04, r * 0.02);
        ctx.lineTo(tx + r * 0.07, -r * 0.12);
        ctx.closePath();
        ctx.fill();
      }

      // Searing volcanic magma eye
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(r * 0.62, -r * 0.14, Math.max(3, r * 0.06), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(r * 0.64, -r * 0.14, Math.max(1.5, r * 0.025), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (monster && form === 'kraken') {
      // Colossal Kraken: Immense mantle, 8 thick writhing tentacles with suction cups & hypnotic eye
      ctx.fillStyle = threat.color || '#0284c7';
      // Bulbous kraken mantle
      ctx.beginPath();
      ctx.moveTo(r * 0.15, -r * 0.4);
      ctx.quadraticCurveTo(-r * 0.45, -r * 0.55, -r * 0.85, 0);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.55, r * 0.15, r * 0.4);
      ctx.quadraticCurveTo(r * 0.35, r * 0.25, r * 0.35, -r * 0.25);
      ctx.closePath();
      ctx.fill();

      // Mantle bioluminescent runes / ridges
      ctx.strokeStyle = threat.glow || '#38bdf8';
      ctx.lineWidth = 2.5;
      for (let g = 0; g < 3; g++) {
        ctx.beginPath();
        ctx.arc(-r * (0.3 + g * 0.2), 0, r * (0.18 + g * 0.08), -Math.PI * 0.6, Math.PI * 0.6);
        ctx.stroke();
      }

      // 8 thick, powerful writhing tentacles lunging forward and outward
      ctx.lineWidth = Math.max(2.5, r * 0.08);
      ctx.lineCap = 'round';
      ctx.strokeStyle = threat.color;
      for (let i = 0; i < 8; i++) {
        const tentWave = Math.sin(t * 3.5 + i * 0.8) * (r * 0.25);
        const yOffset = (i - 3.5) * r * 0.14;
        ctx.beginPath();
        ctx.moveTo(r * 0.3, yOffset * 0.8);
        ctx.quadraticCurveTo(r * 0.6 + tentWave * 0.4, yOffset * 1.5, r * 0.9 + tentWave, yOffset * 1.8 + Math.cos(t * 2 + i) * 6);
        ctx.stroke();

        // Glowing suction cups along each tentacle
        ctx.fillStyle = threat.glow || '#fef08a';
        ctx.beginPath();
        ctx.arc(r * 0.55, yOffset * 1.2, Math.max(1.5, r * 0.035), 0, Math.PI * 2);
        ctx.arc(r * 0.78 + tentWave * 0.6, yOffset * 1.5, Math.max(1.2, r * 0.028), 0, Math.PI * 2);
        ctx.fill();
      }

      // Cavernous eye cluster
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(r * 0.18, -r * 0.12, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = threat.glow || '#fef08a';
      ctx.beginPath();
      ctx.arc(r * 0.18, -r * 0.12, r * 0.06, 0, Math.PI * 2);
      ctx.fill();
      // Slit pupil
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(r * 0.18, -r * 0.12, r * 0.02, r * 0.055, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (monster && form === 'serpent') {
      if (isVoidRealm) {
        drawCelestialSerpent(ctx, threat, r, t);
      } else {
        // Colossal Sea Serpent: Long undulating sinuous coils, armored crest, horned dragon head
        ctx.strokeStyle = body;
        ctx.lineWidth = r * 0.38;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(r * 0.5, 0);
        ctx.bezierCurveTo(r * 0.1, -r * 0.55, -r * 0.25, r * 0.65, -r * 0.65, -r * 0.35 + Math.sin(t * 2.2) * (r * 0.2));
        ctx.bezierCurveTo(-r * 0.85, -r * 0.1, -r * 1.05, r * 0.4, -r * 1.3, Math.sin(t * 2.2 - 1) * (r * 0.25));
        ctx.stroke();

        // Glowing spine spikes along serpent body
        ctx.fillStyle = threat.glow || '#34d399';
        for (let s = 0; s < 6; s++) {
          const sx = -r * 0.9 + s * r * 0.24;
          const sy = Math.sin(t * 2.2 + s * 0.8) * (r * 0.18) - r * 0.15;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - r * 0.08, sy - r * 0.32);
          ctx.lineTo(sx + r * 0.08, sy);
          ctx.closePath();
          ctx.fill();
        }

        // Horned serpent head
        ctx.fillStyle = threat.color || '#059669';
        ctx.beginPath();
        ctx.ellipse(r * 0.52, 0, r * 0.38, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dragon horns arching back
        ctx.fillStyle = threat.glow || '#fde047';
        ctx.beginPath();
        ctx.moveTo(r * 0.45, -r * 0.15);
        ctx.quadraticCurveTo(r * 0.3, -r * 0.48, r * 0.15, -r * 0.55);
        ctx.quadraticCurveTo(r * 0.35, -r * 0.35, r * 0.55, -r * 0.15);
        ctx.closePath();
        ctx.fill();

        // Gaping serpent maw & fangs
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.moveTo(r * 0.5, -r * 0.08);
        ctx.lineTo(r * 0.85, 0);
        ctx.lineTo(r * 0.5, r * 0.1);
        ctx.closePath();
        ctx.fill();

        // Sharp white fangs
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(r * 0.62, -r * 0.07); ctx.lineTo(r * 0.65, r * 0.04); ctx.lineTo(r * 0.68, -r * 0.07);
        ctx.moveTo(r * 0.72, -r * 0.04); ctx.lineTo(r * 0.74, r * 0.05); ctx.lineTo(r * 0.77, -r * 0.04);
        ctx.fill();

        // Glowing predatory serpent eye
        ctx.fillStyle = threat.glow || '#34d399';
        ctx.shadowColor = threat.glow || '#34d399';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(r * 0.58, -r * 0.11, Math.max(2.5, r * 0.055), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#022c22';
        ctx.beginPath();
        ctx.ellipse(r * 0.58, -r * 0.11, Math.max(1, r * 0.02), Math.max(2, r * 0.05), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else {
      if (isVoidRealm && threat.marineKind === 'eel') {
        drawCelestialEel(ctx, threat, r, t);
      } else {
        // Default monster / eel
        ctx.strokeStyle = body; ctx.lineWidth = r * (monster ? .38 : .24); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(r * .45, 0);
        ctx.bezierCurveTo(-r * .15, -r * .6, -r * .2, r * .7, -r * .9, Math.sin(t) * r * .2); ctx.stroke();
        if (monster) {
          ctx.fillStyle = threat.glow;
          for (let i = 0; i < 4; i++) {
            const x = -r * .6 + i * r * .23;
            ctx.beginPath(); ctx.moveTo(x, -r * .12); ctx.lineTo(x - r * .12, -r * .48); ctx.lineTo(x + r * .15, -r * .1); ctx.fill();
          }
          if (threat.behavior.monsterForm === 'dragon') {
            for (const side of [-1, 1]) {
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r * .7, side * r * .8);
              ctx.quadraticCurveTo(-r * .05, side * r * .4, r * .3, side * r * .55); ctx.closePath(); ctx.fill();
            }
          }
        }
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.ellipse(r * .48, 0, r * .38, r * .24, 0, 0, Math.PI * 2); ctx.fill();
        if (monster && threat.behavior.monsterForm === 'maw') {
          ctx.fillStyle = '#130f25'; ctx.beginPath(); ctx.ellipse(r * .65, r * .04, r * .24, r * .2, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fef3c7';
          for (let i = 0; i < 4; i++) {
            const x = r * (.46 + i * .1);
            ctx.beginPath(); ctx.moveTo(x, -r * .12); ctx.lineTo(x + r * .04, r * .02); ctx.lineTo(x + r * .07, -r * .12); ctx.fill();
          }
        }
      }
    }
  } else {
    ctx.beginPath(); ctx.moveTo(r * .95, 0);
    ctx.quadraticCurveTo(r * .3, -r * .5, -r * .55, -r * .12);
    ctx.lineTo(-r * .95, -r * .46); ctx.lineTo(-r * .8, 0); ctx.lineTo(-r * .95, r * .4);
    ctx.lineTo(-r * .55, r * .1); ctx.quadraticCurveTo(r * .3, r * .4, r * .95, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-r * .2, -r * .18); ctx.lineTo(-r * .05, -r * .65); ctx.lineTo(r * .25, -r * .18); ctx.fill();
    ctx.beginPath(); ctx.moveTo(r * .05, r * .12); ctx.lineTo(-r * .25, r * .55); ctx.lineTo(r * .35, r * .18); ctx.fill();
    ctx.strokeStyle = '#14283b'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(r * (.15 + i * .09), -r * .13); ctx.lineTo(r * (.1 + i * .09), r * .1); ctx.stroke(); }
    if (threat.behavior.monsterForm === 'megalodon') {
      ctx.fillStyle = '#180b17'; ctx.beginPath(); ctx.moveTo(r * .42, r * .05);
      ctx.lineTo(r * .9, 0); ctx.quadraticCurveTo(r * .7, r * .3, r * .42, r * .05); ctx.fill();
      ctx.fillStyle = '#fff7db';
      for (let i = 0; i < 6; i++) {
        const x = r * (.48 + i * .06);
        ctx.beginPath(); ctx.moveTo(x, r * .04); ctx.lineTo(x + r * .025, r * .13);
        ctx.lineTo(x + r * .045, r * .035); ctx.closePath(); ctx.fill();
      }
    }
  }
  if (!['jelly', 'plesiosaur', 'mosasaur', 'siren'].includes(threat.marineKind) && !['siren', 'kraken', 'serpent', 'magma_maw', 'void_megalodon', 'lava_megalodon'].includes(threat.behavior?.monsterForm)) {
    if (isVoidRealm) {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(r * .57, -r * .1, Math.max(2.5, r * .06), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      drawStar4(ctx, r * .57, -r * .1, Math.max(3.5, r * .08), Math.max(1, r * .025));
    } else {
      ctx.fillStyle = '#fff2b2'; ctx.beginPath(); ctx.arc(r * .57, -r * .1, Math.max(2, r * .06), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#091323'; ctx.beginPath(); ctx.arc(r * .59, -r * .1, Math.max(1, r * .025), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#091323'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(r * .58, r * .12); ctx.lineTo(r * .83, r * .05); ctx.stroke();
    }
  }
  if (isVoidRealm) {
    drawVoidOrbitingStardust(ctx, r, t);
  }
  ctx.restore();
}

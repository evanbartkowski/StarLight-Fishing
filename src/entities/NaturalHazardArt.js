// Canvas-native coastal obstacles, sized to their existing collision bounds.
export function drawNaturalHazard(ctx, kind, r, time) {
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  if (kind === 'stalactite') {
    ctx.fillStyle = '#475569'; ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * .5, -r); ctx.lineTo(r * .5, -r); ctx.lineTo(0, r); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (kind === 'probe') {
    // Automated Abyss Probe: Sleek Horizontal Autonomous Deep-Sea ROV Submersible with Front Robotic Claws, Rear Shrouded Propeller & Sweeping Laser Array
    ctx.save();
    const bob = Math.sin(time * 3.2) * (r * 0.06);
    const pitch = Math.sin(time * 2.1) * 0.05;
    ctx.translate(0, bob);
    ctx.rotate(pitch);

    // 1. Forward Sweeping Bathymetric Laser Cone (emanating from front sensor dome)
    const scanSweep = Math.sin(time * 2.6) * 0.22;
    ctx.save();
    ctx.translate(r * 0.78, 0);
    ctx.rotate(scanSweep);
    const beamGrad = ctx.createLinearGradient(0, 0, r * 2.5, 0);
    beamGrad.addColorStop(0, 'rgba(244, 63, 94, 0.55)');
    beamGrad.addColorStop(0.45, 'rgba(239, 68, 68, 0.24)');
    beamGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 2.5, -r * 0.72);
    ctx.lineTo(r * 2.5, r * 0.72);
    ctx.closePath();
    ctx.fill();

    // Laser grid scanlines inside cone
    ctx.strokeStyle = 'rgba(255, 90, 120, 0.65)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(r * 0.9, -r * 0.24);
    ctx.lineTo(r * 0.9, r * 0.24);
    ctx.moveTo(r * 1.6, -r * 0.44);
    ctx.lineTo(r * 1.6, r * 0.44);
    ctx.stroke();
    ctx.restore();

    // 2. Rear Shrouded Kort-Nozzle Propeller & Cavitation Wake (at stern x = -r * 1.05)
    const jetPulse = 0.5 + 0.5 * Math.sin(time * 16);
    const wakeGrad = ctx.createLinearGradient(-r * 0.95, 0, -r * (1.85 + jetPulse * 0.35), 0);
    wakeGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
    wakeGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.45)');
    wakeGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = wakeGrad;
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, -r * 0.22);
    ctx.lineTo(-r * (1.85 + jetPulse * 0.35), -r * 0.42);
    ctx.lineTo(-r * (1.85 + jetPulse * 0.35), r * 0.42);
    ctx.lineTo(-r * 0.95, r * 0.22);
    ctx.closePath();
    ctx.fill();

    // Trailing cavitation micro-bubbles
    ctx.fillStyle = 'rgba(186, 230, 253, 0.75)';
    for (let b = 0; b < 4; b++) {
      const bx = -r * (1.15 + ((time * 1.8 + b * 0.25) % 0.85));
      const by = Math.sin(time * 8 + b * 2.1) * (r * 0.18);
      ctx.beginPath();
      ctx.arc(bx, by, r * (0.045 - b * 0.006), 0, Math.PI * 2);
      ctx.fill();
    }

    // Rear Kort Nozzle Shroud & Spinning Rotor Blades
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-r * 0.72, -r * 0.28);
    ctx.lineTo(-r * 1.04, -r * 0.36);
    ctx.lineTo(-r * 1.04, r * 0.36);
    ctx.lineTo(-r * 0.72, r * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Spinning propeller blades inside nozzle
    const bladeScale = Math.sin(time * 24);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(-r * 0.88, 0, r * 0.06, Math.abs(bladeScale) * r * 0.30 + r * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Dual Articulated Front Robotic Manipulator Claws (extending forward from lower bow)
    const pinch = Math.sin(time * 4.2) * 0.14;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(r * 0.48, side * r * 0.34);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = r * 0.10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 0.36, side * r * 0.10);
      ctx.lineTo(r * 0.64, side * r * 0.03);
      ctx.stroke();

      // Hydraulic joint bolt
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(r * 0.36, side * r * 0.10, r * 0.055, 0, Math.PI * 2);
      ctx.fill();

      // Dual opposing pincer jaws
      ctx.save();
      ctx.translate(r * 0.64, side * r * 0.03);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 0.22, -r * (0.11 + pinch * 0.3));
      ctx.lineTo(r * 0.30, -r * 0.03);
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 0.22, r * (0.11 + pinch * 0.3));
      ctx.lineTo(r * 0.30, r * 0.03);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }

    // 4. Ventral Ballast Skids & Hydro-Pontoons (sleek horizontal undercarriage)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-r * 0.68, r * 0.48);
    ctx.lineTo(r * 0.52, r * 0.48);
    ctx.lineTo(r * 0.66, r * 0.36);
    ctx.lineTo(-r * 0.78, r * 0.36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vertical strut stanchions connecting skids to hull
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.42, r * 0.22); ctx.lineTo(-r * 0.42, r * 0.40);
    ctx.moveTo(r * 0.24, r * 0.22); ctx.lineTo(r * 0.24, r * 0.40);
    ctx.stroke();

    // 5. Dorsal Hydrophone Fin & Twin Flashing Telemetry Beacons
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.32);
    ctx.lineTo(-r * 0.28, -r * 0.68);
    ctx.lineTo(r * 0.12, -r * 0.68);
    ctx.lineTo(r * 0.28, -r * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Telemetry antenna whip
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, -r * 0.68);
    ctx.lineTo(-r * 0.32, -r * 0.98);
    ctx.stroke();

    const strobe = Math.sin(time * 9.0) > 0.15 ? 1 : 0.25;
    ctx.fillStyle = `rgba(244, 63, 94, ${strobe})`;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = strobe * 12;
    ctx.beginPath();
    ctx.arc(-r * 0.32, -r * 0.98, r * 0.065, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 6. Streamlined Horizontal ROV Main Fuselage (Industrial Syntactic-Foam Yellow & Titanium Armor)
    const hullGrad = ctx.createLinearGradient(0, -r * 0.46, 0, r * 0.42);
    hullGrad.addColorStop(0, '#facc15');
    hullGrad.addColorStop(0.38, '#eab308');
    hullGrad.addColorStop(0.55, '#334155');
    hullGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-r * 0.78, -r * 0.26);
    ctx.quadraticCurveTo(-r * 0.20, -r * 0.48, r * 0.48, -r * 0.36);
    ctx.quadraticCurveTo(r * 0.92, -r * 0.24, r * 0.92, 0);
    ctx.quadraticCurveTo(r * 0.92, r * 0.26, r * 0.48, r * 0.34);
    ctx.lineTo(-r * 0.74, r * 0.30);
    ctx.quadraticCurveTo(-r * 0.88, 0, -r * 0.78, -r * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Diagonal Black/Yellow Industrial Hazard Chevrons along mid-hull
    ctx.fillStyle = '#0f172a';
    for (let c = 0; c < 3; c++) {
      const cx = -r * 0.45 + c * (r * 0.26);
      ctx.beginPath();
      ctx.moveTo(cx, -r * 0.04);
      ctx.lineTo(cx + r * 0.11, -r * 0.04);
      ctx.lineTo(cx + r * 0.03, r * 0.18);
      ctx.lineTo(cx - r * 0.08, r * 0.18);
      ctx.closePath();
      ctx.fill();
    }

    // Lateral Vectored Attitude Thruster Fan (recessed into side armor)
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-r * 0.48, -r * 0.14, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;
    for (let f = 0; f < 3; f++) {
      const fa = time * 10 + (f * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(-r * 0.48, -r * 0.14);
      ctx.lineTo(-r * 0.48 + Math.cos(fa) * r * 0.11, -r * 0.14 + Math.sin(fa) * r * 0.11);
      ctx.stroke();
    }

    // 7. Forward Hemispherical Crimson Optical Dome & Laser Turret (at bow x = +r * 0.62)
    const domeGrad = ctx.createRadialGradient(r * 0.68, -r * 0.06, r * 0.03, r * 0.60, 0, r * 0.30);
    domeGrad.addColorStop(0, '#ffffff');
    domeGrad.addColorStop(0.28, '#fb7185');
    domeGrad.addColorStop(0.65, '#e11d48');
    domeGrad.addColorStop(1, '#4c0519');
    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(r * 0.58, 0, r * 0.25, -Math.PI * 0.55, Math.PI * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Specular glass highlight on forward dome
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(r * 0.58, 0, r * 0.19, -Math.PI * 0.42, -Math.PI * 0.10);
    ctx.stroke();

    ctx.restore();
  } else if (kind === 'diver') {
    // Authentic Human Scuba Diver with swim fins, air tank, diving mask, and flashlight beam
    const light = ctx.createLinearGradient(r * .5, 0, r * 4.5, 0);
    light.addColorStop(0, '#fef08a66');
    light.addColorStop(0.3, '#fef08a33');
    light.addColorStop(1, '#fef08a00');
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.moveTo(r * .5, 0);
    ctx.lineTo(r * 4.5, -r * 1.1);
    ctx.lineTo(r * 4.5, r * 1.1);
    ctx.closePath();
    ctx.fill();

    // Human diver wetsuit body (torso and limbs)
    ctx.fillStyle = '#1e293b'; // Sleek dark wetsuit
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.75, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yellow neoprene accent stripe along suit
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = r * 0.09;
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, 0);
    ctx.lineTo(r * 0.35, 0);
    ctx.stroke();

    // Diver head & dive hood
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(r * 0.65, -r * 0.05, r * 0.26, 0, Math.PI * 2);
    ctx.fill();

    // Scuba mask visor (cyan glass with glare)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(r * 0.8, -r * 0.06, r * 0.12, r * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.77, -r * 0.12, r * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Silver scuba cylinder tank strapped on back
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(-r * 0.4, -r * 0.55, r * 0.7, r * 0.22, r * 0.08);
    } else {
      ctx.rect(-r * 0.4, -r * 0.55, r * 0.7, r * 0.22);
    }
    ctx.fill();
    ctx.stroke();
    // Tank valve & regulator
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(r * 0.26, -r * 0.52, r * 0.08, r * 0.16);

    // Kicking legs and flexible swim flippers
    const kick = Math.sin(time * 4) * r * 0.28;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, 0);
    ctx.lineTo(-r * 0.95, kick);
    ctx.stroke();

    // Bright flipper blade
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, kick - r * 0.08);
    ctx.lineTo(-r * 1.35, kick - r * 0.22);
    ctx.lineTo(-r * 1.3, kick + r * 0.22);
    ctx.lineTo(-r * 0.9, kick + r * 0.08);
    ctx.closePath();
    ctx.fill();

    // Handheld dive torch / searchlight
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(r * 0.45, -r * 0.08, r * 0.2, r * 0.14);
  } else if (kind === 'submarine') {
    const light = ctx.createLinearGradient(r * .5, 0, r * 4.5, 0);
    light.addColorStop(0, '#fef08a99'); light.addColorStop(1, '#fef08a00');
    ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(r * .5, 0); ctx.lineTo(r * 4.5, -r * 1.2); ctx.lineTo(r * 4.5, r * 1.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * .48, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7dd3fc'; ctx.beginPath(); ctx.arc(r * .6, 0, r * .22, 0, Math.PI * 2); ctx.fill();
    // Conning tower & periscope
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-r * .3, -r * .7, r * .5, r * .35);
    ctx.fillRect(-r * .1, -r * .98, r * .06, r * .4);
    ctx.fillRect(-r * .1, -r * .98, r * .24, r * .06);
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * .48, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = -2; i <= 2; i++) {
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(i * r * .25, 0, r * .085, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(i * r * .25, 0, r * .055, 0, Math.PI * 2); ctx.fill();
    }
    // Rear propulsion thruster
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.moveTo(-r * .8, 0); ctx.lineTo(-r * 1.15, -r * .5); ctx.lineTo(-r * 1.15, r * .5); ctx.closePath(); ctx.fill();
    const propAngle = time * 8;
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r * 1.15, -Math.sin(propAngle) * r * 0.4);
    ctx.lineTo(-r * 1.15, Math.sin(propAngle) * r * 0.4);
    ctx.stroke();
  } else if (kind === 'plant') {
    // Rugged Razor-Kelp Tangle anchored to a sculpted reef stone with thorny tendrils & sea urchins
    const baseGrad = ctx.createLinearGradient(0, r * 0.35, 0, r * 0.92);
    baseGrad.addColorStop(0, '#334155');
    baseGrad.addColorStop(0.65, '#1e293b');
    baseGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.78, r * 0.78);
    ctx.lineTo(-r * 0.58, r * 0.44);
    ctx.lineTo(-r * 0.14, r * 0.36);
    ctx.lineTo(r * 0.36, r * 0.42);
    ctx.lineTo(r * 0.76, r * 0.68);
    ctx.lineTo(r * 0.56, r * 0.88);
    ctx.lineTo(-r * 0.48, r * 0.88);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sweeping tapered ruffled kelp blades (5 distinct asymmetrical fronds)
    const blades = [
      { bx: -r * 0.42, tilt: -0.34, h: r * 1.12, w: r * 0.22, dark: '#064e3b', light: '#059669' },
      { bx: r * 0.38, tilt: 0.32, h: r * 1.06, w: r * 0.20, dark: '#065f46', light: '#10b981' },
      { bx: -r * 0.18, tilt: -0.14, h: r * 1.38, w: r * 0.24, dark: '#065f46', light: '#10b981' },
      { bx: r * 0.16, tilt: 0.16, h: r * 1.32, w: r * 0.23, dark: '#047857', light: '#34d399' },
      { bx: 0, tilt: 0.02, h: r * 1.48, w: r * 0.26, dark: '#065f46', light: '#34d399' },
    ];
    blades.forEach((b, idx) => {
      const sway = Math.sin(time * 1.7 + idx * 1.1) * r * 0.16;
      const tipX = b.bx + b.tilt * b.h + sway;
      const tipY = r * 0.52 - b.h;
      const ctrl1X = b.bx + b.tilt * b.h * 0.3 + sway * 0.35;
      const ctrl1Y = r * 0.52 - b.h * 0.4;
      const ctrl2X = b.bx + b.tilt * b.h * 0.7 - sway * 0.2;
      const ctrl2Y = r * 0.52 - b.h * 0.72;

      const bladeGrad = ctx.createLinearGradient(b.bx, r * 0.52, tipX, tipY);
      bladeGrad.addColorStop(0, b.dark);
      bladeGrad.addColorStop(0.55, b.light);
      bladeGrad.addColorStop(1, '#6ee7b7');
      ctx.fillStyle = bladeGrad;
      ctx.strokeStyle = '#022c22';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(b.bx - b.w * 0.35, r * 0.54);
      ctx.bezierCurveTo(ctrl1X - b.w * 0.9, ctrl1Y, ctrl2X - b.w * 0.45, ctrl2Y, tipX, tipY);
      ctx.bezierCurveTo(ctrl2X + b.w * 0.45, ctrl2Y, ctrl1X + b.w * 0.9, ctrl1Y, b.bx + b.w * 0.35, r * 0.54);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Subtle central midrib vein
      ctx.strokeStyle = 'rgba(167, 243, 208, 0.45)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(b.bx, r * 0.52);
      ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, tipX, tipY + r * 0.08);
      ctx.stroke();
    });

    // Intertwined thorny bramble vines & coastal purple sea urchins on rock crest
    ctx.strokeStyle = '#134e4a';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-r * 0.52, r * 0.42);
    ctx.bezierCurveTo(-r * 0.15, -r * 0.05, r * 0.25, r * 0.12, r * 0.48, -r * 0.28);
    ctx.stroke();

    for (const [ux, uy, ur] of [[-r * 0.38, r * 0.48, r * 0.13], [r * 0.32, r * 0.54, r * 0.11]]) {
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.3;
      for (let s = 0; s < 9; s++) {
        const ang = -Math.PI + (s / 8) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(ux, uy);
        ctx.lineTo(ux + Math.cos(ang) * ur * 1.9, uy + Math.sin(ang) * ur * 1.9);
        ctx.stroke();
      }
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.arc(ux, uy, ur, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'boulder') {
    // Mossy Coastal Reef Boulder with Living Sea Anemones, Purple Coral Polyps, and Sea Urchin Clusters
    const stone = ctx.createLinearGradient(-r, -r, r, r);
    stone.addColorStop(0, '#64748b');
    stone.addColorStop(0.4, '#475569');
    stone.addColorStop(0.85, '#334155');
    stone.addColorStop(1, '#1e293b');
    ctx.fillStyle = stone;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;

    // Organic jagged reef rock shape
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, r * 0.22);
    ctx.lineTo(-r * 0.78, -r * 0.45);
    ctx.lineTo(-r * 0.35, -r * 0.88);
    ctx.lineTo(r * 0.35, -r * 0.78);
    ctx.lineTo(r * 0.92, -r * 0.15);
    ctx.lineTo(r * 0.72, r * 0.68);
    ctx.lineTo(-r * 0.45, r * 0.82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rock fissure cracks & strata shading
    ctx.strokeStyle = '#94a3b844';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.65, -r * 0.3);
    ctx.lineTo(-r * 0.15, -r * 0.58);
    ctx.lineTo(r * 0.4, -r * 0.45);
    ctx.stroke();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(r * 0.05, -r * 0.5);
    ctx.lineTo(-r * 0.12, -r * 0.08);
    ctx.lineTo(r * 0.28, r * 0.25);
    ctx.stroke();

    // Vibrant living coral plate on top crest
    ctx.fillStyle = '#f43f5e'; // vivid rose shelf coral
    ctx.beginPath();
    ctx.ellipse(r * 0.2, -r * 0.75, r * 0.32, r * 0.14, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(r * 0.2, -r * 0.76, r * 0.25, r * 0.09, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // 2 Living Sea Anemones with waving tentacles
    for (const [ax, ay, aCol, aGlow] of [
      [-r * 0.55, -r * 0.35, '#ec4899', '#f472b6'],
      [r * 0.65, r * 0.15, '#a855f7', '#c084fc'],
    ]) {
      ctx.fillStyle = aCol;
      ctx.beginPath();
      ctx.arc(ax, ay, r * 0.14, 0, Math.PI * 2);
      ctx.fill();

      // Waving tentacles
      ctx.strokeStyle = aGlow;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      for (let t = 0; t < 8; t++) {
        const ang = (t / 8) * Math.PI * 2;
        const wave = Math.sin(time * 3 + t + ax) * r * 0.08;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + Math.cos(ang) * (r * 0.26) + wave, ay + Math.sin(ang) * (r * 0.26) + wave);
        ctx.stroke();
      }
    }

    // Clinging sea moss & green algae patches
    ctx.fillStyle = '#16a34a';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse((i - 2.5) * r * 0.26, r * 0.48 + Math.sin(i * 1.5) * r * 0.08, r * 0.18, r * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'log') {
    // Waterlogged Tree Trunk with clinging barnacles, hollow mossy knots, trailing aquatic vines
    ctx.rotate(-0.16);
    const wood = ctx.createLinearGradient(0, -r * 0.4, 0, r * 0.45);
    wood.addColorStop(0, '#a16207');
    wood.addColorStop(0.35, '#78350f');
    wood.addColorStop(0.8, '#451a03');
    wood.addColorStop(1, '#291004');
    ctx.fillStyle = wood;
    ctx.strokeStyle = '#291004';
    ctx.lineWidth = 2.4;

    ctx.beginPath();
    ctx.moveTo(-r * 0.88, -r * 0.35);
    ctx.lineTo(r * 0.82, -r * 0.3);
    ctx.quadraticCurveTo(r * 1.05, 0, r * 0.82, r * 0.36);
    ctx.lineTo(-r * 0.88, r * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Log end growth rings
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(-r * 0.86, 0, r * 0.2, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(-r * 0.86, 0, r * 0.11, r * 0.21, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Tree bark fissures & knots
    ctx.strokeStyle = '#5c2b09';
    ctx.lineWidth = 1.4;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.55, i * r * 0.18);
      ctx.quadraticCurveTo(0, i * r * 0.1, r * 0.72, i * r * 0.2);
      ctx.stroke();
    }

    // Branch stub with hollow dark core
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(r * 0.08, -r * 0.22);
    ctx.lineTo(r * 0.28, -r * 0.68);
    ctx.lineTo(r * 0.52, -r * 0.74);
    ctx.lineTo(r * 0.38, -r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cluster of clinging coastal barnacles
    ctx.fillStyle = '#f5f5f4';
    for (let b = 0; b < 5; b++) {
      const bx = -r * 0.3 + b * r * 0.22;
      const by = r * 0.22 + Math.sin(b * 1.4) * r * 0.06;
      ctx.beginPath();
      ctx.arc(bx, by, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(bx, by, r * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5f5f4';
    }

    // Flowing river-moss / green sea velvet
    ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
    ctx.beginPath();
    ctx.ellipse(r * 0.32, -r * 0.28, r * 0.32, r * 0.09, 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'starglass') {
    // Astral Starglass Crystal Shard
    const grad = ctx.createLinearGradient(-r * 0.5, -r, r * 0.5, r);
    grad.addColorStop(0, '#e0e7ff');
    grad.addColorStop(0.5, '#a855f7');
    grad.addColorStop(1, '#3b0764');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#f0abfc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.95);
    ctx.lineTo(r * 0.45, -r * 0.15);
    ctx.lineTo(0, r * 0.95);
    ctx.lineTo(-r * 0.45, -r * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Broken Coastal Wreck with shattered timber ribs, brass lantern mount, tattered sail cloth, and swaying seaweed
    ctx.rotate(0.12);
    const hull = ctx.createLinearGradient(0, -r * 0.25, 0, r * 0.65);
    hull.addColorStop(0, '#78350f');
    hull.addColorStop(0.5, '#451a03');
    hull.addColorStop(1, '#1c1917');
    ctx.fillStyle = hull;
    ctx.strokeStyle = '#291004';
    ctx.lineWidth = 2.4;

    ctx.beginPath();
    ctx.moveTo(-r * 0.96, -r * 0.15);
    ctx.lineTo(-r * 0.45, -r * 0.24);
    ctx.lineTo(-r * 0.15, 0.02 * r);
    ctx.lineTo(r * 0.14, -r * 0.2);
    ctx.lineTo(r * 0.94, -r * 0.32);
    ctx.quadraticCurveTo(r * 0.82, r * 0.54, r * 0.3, r * 0.62);
    ctx.lineTo(-r * 0.58, r * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Exposed rotting oak ribs
    ctx.strokeStyle = '#d9770655';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7 + i * r * 0.38, r * (0.05 + i * 0.08));
      ctx.lineTo(-r * 0.5 + i * r * 0.38, r * 0.45);
      ctx.stroke();
    }

    // Broken splintered mast
    ctx.strokeStyle = '#5c2b09';
    ctx.lineWidth = r * 0.1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.16, 0);
    ctx.lineTo(r * 0.06, -r * 0.88);
    ctx.moveTo(-r * 0.32, -r * 0.48);
    ctx.lineTo(r * 0.48, -r * 0.54);
    ctx.stroke();

    // Tattered canvas sail fragment fluttering in the ocean current
    const flutter = Math.sin(time * 2.8) * r * 0.08;
    ctx.fillStyle = 'rgba(241, 245, 249, 0.82)';
    ctx.beginPath();
    ctx.moveTo(r * 0.08, -r * 0.82);
    ctx.quadraticCurveTo(r * 0.35 + flutter, -r * 0.65, r * 0.52, -r * 0.58);
    ctx.lineTo(r * 0.28, -r * 0.38);
    ctx.lineTo(r * 0.12, -r * 0.46);
    ctx.closePath();
    ctx.fill();

    // Barnacle encrustations along keel
    ctx.fillStyle = '#e2e8f0';
    for (let b = 0; b < 6; b++) {
      ctx.beginPath();
      ctx.arc(-r * 0.5 + b * r * 0.22, r * 0.42 + (b % 2) * 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Portholes with deep mysterious seawater inside
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc((i - 1) * r * 0.35, r * 0.16, r * 0.085, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Canvas-native coastal obstacles, sized to their existing collision bounds.
export function drawNaturalHazard(ctx, kind, r, time) {
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  if (kind === 'starglass') {
    // Shimmering Falling Starglass Crystal Shard with celestial facets & radiant stardust glow
    const shimmer = Math.sin(time * 3) * 0.15;
    
    // 1. Soft prismatic outer aura
    ctx.save();
    const aura = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.4);
    aura.addColorStop(0, 'rgba(196, 181, 253, 0.45)');
    aura.addColorStop(0.5, 'rgba(129, 140, 248, 0.2)');
    aura.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Main crystalline faceted shard (sharp celestial diamond/spear)
    // Left facet
    ctx.fillStyle = 'rgba(165, 180, 252, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25);
    ctx.lineTo(-r * 0.55, -r * 0.15);
    ctx.lineTo(0, r * 1.15);
    ctx.closePath();
    ctx.fill();

    // Right facet (darker refraction)
    ctx.fillStyle = 'rgba(129, 140, 248, 0.75)';
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25);
    ctx.lineTo(r * 0.55, -r * 0.15);
    ctx.lineTo(0, r * 1.15);
    ctx.closePath();
    ctx.fill();

    // Center jewel core facet
    ctx.fillStyle = 'rgba(238, 242, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.1);
    ctx.lineTo(-r * 0.22, -r * 0.1);
    ctx.lineTo(0, r * 0.95);
    ctx.lineTo(r * 0.22, -r * 0.1);
    ctx.closePath();
    ctx.fill();

    // Upper gem facet
    ctx.fillStyle = 'rgba(224, 231, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25);
    ctx.lineTo(-r * 0.55, -r * 0.15);
    ctx.lineTo(0, -r * 0.1);
    ctx.lineTo(r * 0.55, -r * 0.15);
    ctx.closePath();
    ctx.fill();

    // 3. Crisp luminous crystal bevel edges
    ctx.strokeStyle = '#e0e7ff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25);
    ctx.lineTo(-r * 0.55, -r * 0.15);
    ctx.lineTo(0, r * 1.15);
    ctx.lineTo(r * 0.55, -r * 0.15);
    ctx.closePath();
    ctx.stroke();

    // Internal facet lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25);
    ctx.lineTo(0, r * 1.15);
    ctx.moveTo(-r * 0.55, -r * 0.15);
    ctx.lineTo(r * 0.55, -r * 0.15);
    ctx.stroke();

    // 4. Sparkling starburst flare at the upper apex
    const flarePulse = 1 + shimmer;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -r * 0.3, 2.5 * flarePulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6 * flarePulse, -r * 0.3); ctx.lineTo(6 * flarePulse, -r * 0.3);
    ctx.moveTo(0, -r * 0.3 - 6 * flarePulse); ctx.lineTo(0, -r * 0.3 + 6 * flarePulse);
    ctx.stroke();
  } else if (kind === 'stalactite') {
    ctx.fillStyle = '#475569'; ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * .5, -r); ctx.lineTo(r * .5, -r); ctx.lineTo(0, r); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (kind === 'probe') {
    ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.arc(0, 0, r * .7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
    ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(0, 0, r * .2, 0, Math.PI * 2); ctx.fill();
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
    // Swaying Kelp Bed & Sunlit Seaweed Meadow with undulating fronds, air bladders, and sea spores
    const swayBase = Math.sin(time * 1.6) * r * 0.18;
    ctx.fillStyle = '#1e3a2b';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.72, r * 0.8, r * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    // 7 Distinct Layered Kelp Fronds with varying phase, color gradients & pneumatocysts (air bladders)
    for (let i = -3; i <= 3; i++) {
      const frondX = i * r * 0.22;
      const sway = Math.sin(time * 1.8 + i * 0.85) * r * (0.22 + Math.abs(i) * 0.04);
      const tipY = -r * (0.85 + 0.15 * (3 - Math.abs(i)));
      const midY = -r * 0.35;

      // Stem
      ctx.strokeStyle = i % 2 === 0 ? '#166534' : '#15803d';
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.moveTo(frondX, r * 0.65);
      ctx.quadraticCurveTo(frondX + sway * 0.4, midY, frondX + sway, tipY);
      ctx.stroke();

      // Golden-green kelp leaves with ruffled wave edges
      for (let j = 0; j < 4; j++) {
        const leafY = r * 0.45 - j * r * 0.32;
        const side = (i + j) % 2 === 0 ? 1 : -1;
        const leafSway = Math.sin(time * 2.2 + j + i) * r * 0.1;

        ctx.fillStyle = j % 2 === 0 ? '#22c55e' : '#4ade80';
        ctx.beginPath();
        ctx.moveTo(frondX, leafY);
        ctx.bezierCurveTo(
          frondX + side * r * 0.35, leafY - r * 0.28,
          frondX + side * r * 0.55 + leafSway, leafY - r * 0.08,
          frondX + side * r * 0.2, leafY + r * 0.12
        );
        ctx.closePath();
        ctx.fill();

        // Pneumatocyst (golden glowing buoyant bubble bead)
        if (j > 0 && (i + j) % 2 === 0) {
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(frondX + side * r * 0.15, leafY - r * 0.06, r * 0.055, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Gentle micro-bubbles drifting up through the kelp
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let b = 0; b < 4; b++) {
      const bubbleTime = (time * 1.5 + b * 1.2) % 3;
      const bY = r * 0.6 - bubbleTime * r * 0.5;
      const bX = Math.sin(time * 2 + b * 2) * r * 0.45;
      ctx.beginPath();
      ctx.arc(bX, bY, 1.6 + (b % 2), 0, Math.PI * 2);
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

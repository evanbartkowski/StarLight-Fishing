// Specialized silhouette rendering for all distinct marine life forms:
// Octopus, squid, cuttlefish, jellyfish, salps, plankton, krill, copepods,
// dolphins, whales, seals, sea lions, walruses, sea turtles, sea snakes,
// manatees, dugongs, sea otters, penguins, albatrosses, puffins, cormorants,
// marine iguanas, nautiluses, Portuguese man o' war, siphonophores, flying squid,
// Velella velella, sea butterflies, arrow worms, tardigrades, and marine worms.

export function drawMarineCreature(ctx, shape, primary, secondary, finColor, wiggle, wiggleTimer) {
  const t = wiggleTimer;
  switch (shape) {
    case 'cuttlefish': {
      // W-pupil, undulating rippling skirt fin around broad mantle, 8 arms + 2 feeding tentacles
      ctx.beginPath();
      ctx.ellipse(-2, 0, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rippling skirt fin along mantle border
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.25) {
        const ripple = Math.sin(t * 5 + a * 4) * 2.5;
        const rx = Math.cos(a) * (19 + ripple);
        const ry = Math.sin(a) * (13 + ripple);
        if (a === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.stroke();

      // 8 cluster arms at front
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      for (let a = -4; a <= 4; a += 2) {
        ctx.beginPath();
        ctx.moveTo(14, a * 1.5);
        ctx.quadraticCurveTo(22, a * 2 + wiggle, 28, a * 1.8);
        ctx.stroke();
      }
      return true;
    }

    case 'salp': {
      // Transparent barrel-shaped tunicate with glowing circular muscle bands and nucleus
      ctx.save();
      ctx.globalAlpha *= 0.75;
      ctx.fillStyle = primary || 'rgba(186, 230, 253, 0.4)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-16, -9, 32, 18, 7) : ctx.rect(-16, -9, 32, 18);
      ctx.fill();

      // Translucent muscle bands
      ctx.strokeStyle = secondary || '#38bdf8';
      ctx.lineWidth = 1.8;
      for (let b = -10; b <= 10; b += 5) {
        ctx.beginPath();
        ctx.ellipse(b, 0, 2, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Glowing gut nucleus (stomach sphere)
      ctx.fillStyle = finColor || '#f43f5e';
      ctx.beginPath();
      ctx.arc(8, 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'krill': {
      // Delicate euphausiid shrimp with luminous red photophores, feathery pleopods and curved rostrum
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.quadraticCurveTo(-6, -7, 12, -4);
      ctx.lineTo(16, 0);
      ctx.quadraticCurveTo(8, 6, -8, 5);
      ctx.closePath();
      ctx.fill();

      // Serrated rostrum horn & long antennae
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(14, -3); ctx.lineTo(24, -6);
      ctx.moveTo(14, -1); ctx.lineTo(26, 3);
      ctx.stroke();

      // Feathery swimming pleopods (paddles beneath belly)
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.5;
      for (let p = -10; p <= 4; p += 3) {
        const kick = Math.sin(t * 8 + p) * 4;
        ctx.beginPath();
        ctx.moveTo(p, 4);
        ctx.lineTo(p - 3, 9 + kick);
        ctx.stroke();
      }

      // Bioluminescent red photophore bead
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(2, 2, 1.8, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'copepod': {
      // Teardrop crustacean with single median naupliar eye and huge rowing antennae
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.quadraticCurveTo(6, -8, -6, -6);
      ctx.quadraticCurveTo(-14, -2, -18, 0);
      ctx.quadraticCurveTo(-14, 2, -6, 6);
      ctx.quadraticCurveTo(6, 8, 12, 0);
      ctx.closePath();
      ctx.fill();

      // Twin long rowing antennae
      const sweep = Math.sin(t * 7) * 5;
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(8, -4); ctx.quadraticCurveTo(4, -16 + sweep, -12, -18 + sweep);
      ctx.moveTo(8, 4); ctx.quadraticCurveTo(4, 16 - sweep, -12, 18 - sweep);
      ctx.stroke();

      // Single bright red naupliar eye
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(8, 0, 2, 0, Math.PI * 2);
      ctx.fill();

      // Furca tail filaments
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-18, 0); ctx.lineTo(-26, -4);
      ctx.moveTo(-18, 0); ctx.lineTo(-26, 4);
      ctx.stroke();
      return true;
    }

    case 'dolphin': {
      // Streamlined cetacean body with falcate dorsal fin, beak snout, and horizontal tail flukes
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.quadraticCurveTo(14, -8, -2, -9);
      ctx.quadraticCurveTo(-18, -6, -26, 0);
      ctx.quadraticCurveTo(-18, 6, -2, 8);
      ctx.quadraticCurveTo(14, 7, 22, 0);
      ctx.closePath();
      ctx.fill();

      // Snout beak
      ctx.beginPath();
      ctx.moveTo(18, 2); ctx.lineTo(26, 1); ctx.lineTo(19, -2);
      ctx.closePath();
      ctx.fill();

      // Curved dorsal fin
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-4, -8);
      ctx.quadraticCurveTo(-2, -19, 6, -17);
      ctx.quadraticCurveTo(2, -10, 4, -8);
      ctx.closePath();
      ctx.fill();

      // Pectoral flipper
      ctx.beginPath();
      ctx.moveTo(4, 3);
      ctx.quadraticCurveTo(8, 12, 0, 14);
      ctx.quadraticCurveTo(2, 6, 4, 3);
      ctx.closePath();
      ctx.fill();

      // Tail flukes
      const flukeWave = Math.sin(t * 5) * 4;
      ctx.beginPath();
      ctx.moveTo(-26, 0);
      ctx.lineTo(-34, -8 + flukeWave);
      ctx.quadraticCurveTo(-30, flukeWave, -34, 8 + flukeWave);
      ctx.closePath();
      ctx.fill();
      return true;
    }

    case 'seal':
    case 'sea_lion': {
      // Rounded streamlined pinniped body, whiskers, forward/rear flippers
      const isSeaLion = shape === 'sea_lion';
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rounded head & muzzle
      ctx.beginPath();
      ctx.arc(18, -3, 7, 0, Math.PI * 2);
      ctx.fill();

      // Fore flippers (sea lions have prominent broad wings)
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(6, 4);
      ctx.quadraticCurveTo(10, isSeaLion ? 18 : 13, 0, isSeaLion ? 19 : 14);
      ctx.quadraticCurveTo(2, 8, 6, 4);
      ctx.closePath();
      ctx.fill();

      // Hind flippers extending backwards
      const kick = Math.sin(t * 4) * 3;
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-30, -5 + kick);
      ctx.lineTo(-28, 0);
      ctx.lineTo(-30, 5 + kick);
      ctx.closePath();
      ctx.fill();

      // Whiskers (vibrissae)
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(22, -2); ctx.lineTo(28, -5);
      ctx.moveTo(22, 0); ctx.lineTo(29, 0);
      ctx.moveTo(22, 2); ctx.lineTo(28, 4);
      ctx.stroke();
      return true;
    }

    case 'walrus': {
      // Bulky robust body with long white ivory tusks and whiskered snout pad
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Massive head with muzzle pad
      ctx.beginPath();
      ctx.arc(20, -2, 9, 0, Math.PI * 2);
      ctx.fill();

      // Prominent twin ivory tusks
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(22, 2); ctx.lineTo(24, 15); ctx.lineTo(20, 2);
      ctx.moveTo(25, 2); ctx.lineTo(27, 14); ctx.lineTo(23, 2);
      ctx.closePath();
      ctx.fill();

      // Heavy flippers
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(4, 6); ctx.lineTo(2, 17); ctx.lineTo(-4, 15); ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.fill();

      // Rear flippers
      ctx.beginPath();
      ctx.moveTo(-24, 0); ctx.lineTo(-33, -6); ctx.lineTo(-31, 0); ctx.lineTo(-33, 6);
      ctx.closePath();
      ctx.fill();
      return true;
    }

    case 'sea_turtle': {
      // Streamlined carapace, swimming flippers, beak head
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shell scute borders
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.stroke();

      // Head
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.ellipse(19, 0, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing-like front swimming flippers
      const flap = Math.sin(t * 3.5) * 6;
      ctx.beginPath();
      ctx.moveTo(8, -8); ctx.quadraticCurveTo(16, -22 + flap, 6, -24 + flap); ctx.lineTo(2, -9);
      ctx.moveTo(8, 8); ctx.quadraticCurveTo(16, 22 - flap, 6, 24 - flap); ctx.lineTo(2, 9);
      ctx.closePath();
      ctx.fill();

      // Back rudder flippers
      ctx.beginPath();
      ctx.ellipse(-16, -8, 6, 3, -0.4, 0, Math.PI * 2);
      ctx.ellipse(-16, 8, 6, 3, 0.4, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'sea_snake': {
      // Long serpentine flattened ribbon body with paddle-shaped oar tail
      ctx.lineWidth = 6;
      ctx.strokeStyle = primary;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      for (let s = 1; s <= 5; s++) {
        const sx = 22 - s * 9;
        const sy = Math.sin(t * 4 - s * 0.7) * 7;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Flattened oar tail fin
      const tailY = Math.sin(t * 4 - 3.5) * 7;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.ellipse(-24, tailY, 7, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Striped venomous banding
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 6;
      for (let b = 1; b <= 4; b += 2) {
        const bx = 22 - b * 9;
        const by = Math.sin(t * 4 - b * 0.7) * 7;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      return true;
    }

    case 'manatee':
    case 'dugong': {
      // Gentle rounded sirenian body with rounded paddle tail (manatee) or fluked tail (dugong)
      const isDugong = shape === 'dugong';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Whiskered downturned muzzle
      ctx.beginPath();
      ctx.arc(20, 2, 7, 0, Math.PI * 2);
      ctx.fill();

      // Rounded pectoral flippers
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.ellipse(8, 8, 6, 3.5, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Tail: Beaver paddle (manatee) vs whale fluke (dugong)
      const tWave = Math.sin(t * 3) * 3;
      if (isDugong) {
        ctx.beginPath();
        ctx.moveTo(-22, 0);
        ctx.lineTo(-32, -9 + tWave);
        ctx.quadraticCurveTo(-27, tWave, -32, 9 + tWave);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(-24, tWave, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    }

    case 'sea_otter': {
      // Floating playful otter body, dense fur, paw pads, and webbed feet
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head with cute small ears and snout
      ctx.beginPath();
      ctx.arc(18, -2, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Small round ear
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.arc(16, -7, 2, 0, Math.PI * 2);
      ctx.fill();

      // Paws tucked on chest (or clutching a clam)
      ctx.beginPath();
      ctx.arc(10, 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Flattened muscular rudder tail
      const tailSway = Math.sin(t * 4) * 4;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.quadraticCurveTo(-26, tailSway, -32, tailSway);
      ctx.lineTo(-20, tailSway + 2);
      ctx.closePath();
      ctx.fill();
      return true;
    }

    case 'penguin': {
      // Torpedo-shaped flightless diver with stiff flipper wings and pointed beak
      ctx.beginPath();
      ctx.ellipse(0, 0, 21, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // White chest countershading
      ctx.fillStyle = secondary || '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(2, 2, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(18, -2); ctx.lineTo(26, 0); ctx.lineTo(18, 2);
      ctx.closePath();
      ctx.fill();

      // Hydrodynamic stiff flipper wing
      const wing = Math.sin(t * 6) * 5;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(2, -5); ctx.lineTo(0, -18 + wing); ctx.lineTo(-6, -14 + wing); ctx.lineTo(-2, -5);
      ctx.closePath();
      ctx.fill();

      // Webbed feet
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-18, 2); ctx.lineTo(-25, 4); ctx.lineTo(-24, 0);
      ctx.closePath();
      ctx.fill();
      return true;
    }

    case 'albatross':
    case 'puffin':
    case 'cormorant': {
      // Diving pelagic sea birds plunging through underwater currents
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Beak (puffin has brightly colored parrot bill)
      ctx.fillStyle = shape === 'puffin' ? '#f97316' : '#facc15';
      ctx.beginPath();
      if (shape === 'puffin') {
        ctx.moveTo(16, -4); ctx.lineTo(24, 0); ctx.lineTo(16, 5);
      } else {
        ctx.moveTo(16, -2); ctx.lineTo(26, 0); ctx.lineTo(16, 2);
      }
      ctx.closePath();
      ctx.fill();

      // Dynamic wing swept back as it "flies" through ocean water
      const sweep = Math.sin(t * 4.5) * 8;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(2, -4);
      ctx.lineTo(-8, -22 + sweep);
      ctx.lineTo(-14, -18 + sweep);
      ctx.lineTo(-4, -2);
      ctx.closePath();
      ctx.fill();

      // Trailing webbed paddling feet with trailing bubbles
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-16, 2); ctx.lineTo(-23, 6); ctx.lineTo(-22, 1);
      ctx.closePath();
      ctx.fill();
      return true;
    }

    case 'marine_iguana': {
      // Blunt snout, spiky dorsal crest, long swimming tail, clawed legs
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Blunt squarish herbivorous head
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(16, -6, 9, 10, 3) : ctx.rect(16, -6, 9, 10);
      ctx.fill();

      // Spiky dorsal crest spines
      ctx.fillStyle = finColor;
      for (let s = -12; s <= 12; s += 4) {
        ctx.beginPath();
        ctx.moveTo(s - 1.5, -8); ctx.lineTo(s, -13); ctx.lineTo(s + 1.5, -8);
        ctx.closePath();
        ctx.fill();
      }

      // Long undulating laterally compressed tail
      const tailWave = Math.sin(t * 4.5) * 6;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.quadraticCurveTo(-28, tailWave, -38, tailWave * 1.4);
      ctx.stroke();

      // Clawed swimming legs held against body
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(6, 6); ctx.lineTo(2, 14); ctx.lineTo(7, 13);
      ctx.moveTo(-10, 6); ctx.lineTo(-14, 14); ctx.lineTo(-9, 13);
      ctx.fill();
      return true;
    }

    case 'nautilus': {
      // Planispiral logarithmic chambered shell with hood and 30 tentacle tentacles
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Distinct zebra shell stripes
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.8;
      for (let a = 0; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 1.5 + 0.4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * 16, Math.sin(ang) * 16);
        ctx.stroke();
      }

      // Leathery protective hood
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.arc(10, -4, 8, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.fill();

      // Waving tentacles emerging from shell opening
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 6; i++) {
        const tentWave = Math.sin(t * 3 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(14, 2 + i * 1.5);
        ctx.lineTo(24, 2 + i * 1.5 + tentWave);
        ctx.stroke();
      }
      return true;
    }

    case 'man_o_war': {
      // Floating translucent purple-blue pneumatophore sail on surface, long stinging tentacles
      ctx.save();
      ctx.fillStyle = 'rgba(168, 85, 247, 0.75)';
      // Crest / air bladder float
      ctx.beginPath();
      ctx.moveTo(-16, 2);
      ctx.quadraticCurveTo(0, -18, 16, 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Translucent cyan sail crest
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.beginPath();
      ctx.moveTo(-12, -4);
      ctx.quadraticCurveTo(0, -22, 12, -4);
      ctx.closePath();
      ctx.fill();

      // Long trailing toxic fishing tentacle cords
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.7)';
      ctx.lineWidth = 1.3;
      for (let tc = -8; tc <= 8; tc += 4) {
        ctx.beginPath();
        ctx.moveTo(tc, 2);
        for (let seg = 1; seg <= 4; seg++) {
          ctx.lineTo(tc + Math.sin(t * 2.5 + seg + tc) * 5, 2 + seg * 9);
        }
        ctx.stroke();
      }
      ctx.restore();
      return true;
    }

    case 'siphonophore': {
      // Spectacular colonial chain of nectophores (swimming bells) and glowing gastrozooids
      ctx.save();
      ctx.globalAlpha *= 0.85;
      ctx.lineWidth = 1.4;
      const chainLen = 7;
      for (let c = 0; c < chainLen; c++) {
        const cx = 18 - c * 6.5;
        const cy = Math.sin(t * 2.5 - c * 0.6) * 6;

        // Swimming bell
        ctx.fillStyle = c % 2 === 0 ? 'rgba(56, 189, 248, 0.6)' : 'rgba(236, 72, 153, 0.6)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing center dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Trailing delicate stinging tentacles
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
      for (let tIdx = 0; tIdx < 3; tIdx++) {
        const tx = 6 - tIdx * 8;
        ctx.beginPath();
        ctx.moveTo(tx, 4);
        ctx.quadraticCurveTo(tx - 6, 16, tx + Math.sin(t * 2 + tIdx) * 6, 26);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    }

    case 'flying_squid': {
      // Aerodynamic dart-shaped squid with flared flight fins and folded tentacles
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(6, -8);
      ctx.lineTo(18, 0);
      ctx.lineTo(6, 8);
      ctx.closePath();
      ctx.fill();

      // Broad rhomboid flying fins (glide wings)
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-4, -16);
      ctx.lineTo(4, -8);
      ctx.moveTo(-18, 0);
      ctx.lineTo(-4, 16);
      ctx.lineTo(4, 8);
      ctx.closePath();
      ctx.fill();

      // Streamlined tentacle cone
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(28, 0);
      ctx.stroke();
      return true;
    }

    case 'velella': {
      // By-the-wind sailor: Oval floating disc with an upright diagonal chitinous triangular sail
      ctx.save();
      // Floating blue mantle disc
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.ellipse(0, 2, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Clear diagonal sail catching ocean breeze
      ctx.fillStyle = 'rgba(241, 245, 249, 0.75)';
      ctx.beginPath();
      ctx.moveTo(-12, 1);
      ctx.lineTo(0, -17);
      ctx.lineTo(12, 1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Fringe of short blue feeding tentacles below disc
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      for (let f = -10; f <= 10; f += 4) {
        ctx.beginPath();
        ctx.moveTo(f, 6);
        ctx.lineTo(f + Math.sin(t * 3 + f) * 2, 11);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    }

    case 'sea_butterfly': {
      // Pelagic pteropod snail with translucent shell and twin fluttering wing-like parapodia
      ctx.save();
      // Translucent shell / body
      ctx.fillStyle = 'rgba(192, 132, 252, 0.65)';
      ctx.beginPath();
      ctx.arc(0, 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Twin fluttering parapodial wings (swimming through ocean like a butterfly)
      const wingFlap = Math.sin(t * 6) * 8;
      ctx.fillStyle = 'rgba(125, 211, 252, 0.7)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;

      // Left wing
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.quadraticCurveTo(-14, -12 + wingFlap, -18, 2 + wingFlap * 0.5);
      ctx.quadraticCurveTo(-10, 8, -2, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.quadraticCurveTo(14, -12 + wingFlap, 18, 2 + wingFlap * 0.5);
      ctx.quadraticCurveTo(10, 8, 2, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'arrow_worm': {
      // Chaetognath: Glassy transparent torpedo with grasping head spines and fin flaps
      ctx.save();
      ctx.globalAlpha *= 0.75;
      ctx.fillStyle = primary || 'rgba(224, 242, 254, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Paired lateral fins and caudal tail fin
      ctx.fillStyle = finColor || 'rgba(186, 230, 253, 0.7)';
      ctx.beginPath();
      ctx.ellipse(-6, 0, 8, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(-22, 0, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Curved chitinous grasping spines at head
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(22, -3); ctx.lineTo(26, -1);
      ctx.moveTo(22, 3); ctx.lineTo(26, 1);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'tardigrade': {
      // Water bear: Plump segmented body, 8 stubby legs with claws, circular sucking mouth
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4 Pairs of stubby crawling legs
      ctx.fillStyle = finColor;
      for (let leg = 0; leg < 4; leg++) {
        const lx = -10 + leg * 7;
        const kickL = Math.sin(t * 5 + leg * 1.5) * 2;
        // Top leg
        ctx.beginPath();
        ctx.ellipse(lx, -9 + kickL, 3, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Bottom leg
        ctx.beginPath();
        ctx.ellipse(lx, 9 - kickL, 3, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Circular snout pad
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.arc(15, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'marine_worm': {
      // Polychaete / feather duster worm with iridescent chaetae bristles
      ctx.lineWidth = 5;
      ctx.strokeStyle = primary;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(20, 0);
      for (let w = 1; w <= 5; w++) {
        const wx = 20 - w * 8;
        const wy = Math.sin(t * 4.5 - w * 0.7) * 5;
        ctx.lineTo(wx, wy);
      }
      ctx.stroke();

      // Parapodia bristles along body segments
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 1.3;
      for (let b = 0; b <= 4; b++) {
        const bx = 16 - b * 8;
        const by = Math.sin(t * 4.5 - b * 0.7) * 5;
        ctx.beginPath();
        ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by - 8);
        ctx.moveTo(bx, by + 4); ctx.lineTo(bx, by + 8);
        ctx.stroke();
      }

      // Radiant feathery radioles / tentacles at crown
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.4;
      for (let r = 0; r < 5; r++) {
        const rAng = (r / 4) * Math.PI * 0.8 - Math.PI * 0.4;
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(20 + Math.cos(rAng) * 9, Math.sin(rAng) * 9);
        ctx.stroke();
      }
      return true;
    }

    case 'octopus': {
      // Bulbous muscular mantle with chromatophore dappling
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.ellipse(-4, 0, 16, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lateral mantle highlights & skin spots
      ctx.fillStyle = secondary;
      for (let s = -2; s <= 2; s++) {
        ctx.beginPath();
        ctx.arc(-8 + s * 4, s * 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Siphon jet at base
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-1, 8); ctx.lineTo(-4, 13); ctx.lineTo(3, 11); ctx.closePath();
      ctx.fill();

      // Intelligent cephalopod eyes with horizontal slit pupil
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, -4, 3, 0, Math.PI * 2);
      ctx.arc(8, 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(7, -5, 3, 1.6);
      ctx.fillRect(7, 3, 3, 1.6);

      // 8 Articulated writhing arms with suction cups
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const offset = (i - 3.5) * 3;
        const wave = Math.sin(t * 3.5 + i * 0.8) * 6;
        ctx.beginPath();
        ctx.moveTo(11, offset);
        ctx.quadraticCurveTo(20, offset + wave * 0.7, 28 + (i % 3) * 3, offset + wave);
        ctx.stroke();

        // Tiny suckers on inner arm curve
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.arc(17, offset + wave * 0.35 + 1.2, 1.2, 0, Math.PI * 2);
        ctx.arc(23, offset + wave * 0.7 + 1.2, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    }

    case 'squid': {
      // Torpedo mantle with pointed apex
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.quadraticCurveTo(-10, -10, 10, -9);
      ctx.lineTo(12, 9);
      ctx.quadraticCurveTo(-10, 10, -24, 0);
      ctx.closePath();
      ctx.fill();

      // Stabilizing rhachis / triangular fins at mantle tail
      const finPulse = Math.sin(t * 4) * 2;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(-12, -14 + finPulse);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(-12, 14 - finPulse);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();

      // Large luminous eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(9, -4, 3.2, 0, Math.PI * 2);
      ctx.arc(9, 4, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(9.5, -4, 1.8, 0, Math.PI * 2);
      ctx.arc(9.5, 4, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 8 Arms
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      for (let a = -3; a <= 3; a += 1) {
        ctx.beginPath();
        ctx.moveTo(12, a * 2.2);
        ctx.quadraticCurveTo(20, a * 3 + wiggle * 0.5, 27, a * 2.5 + wiggle);
        ctx.stroke();
      }

      // 2 Elongated feeding tentacles with expanded sucker clubs
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.6;
      for (const side of [-1, 1]) {
        const tw = Math.sin(t * 4.5 + side) * 5;
        ctx.beginPath();
        ctx.moveTo(12, side * 2);
        ctx.bezierCurveTo(24, side * 4, 30, side * 2 + tw, 40, side * 3 + tw);
        ctx.stroke();
        // Club tip
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.ellipse(40, side * 3 + tw, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    }

    case 'jellyfish': {
      // Pulsating bell dome with margin lobes
      const pulse = 0.9 + Math.abs(Math.sin(t * 2.5)) * 0.2;
      ctx.save();
      ctx.globalAlpha *= 0.85;

      // Outer umbrella dome
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.ellipse(0, -4 * pulse, 18 * pulse, 15 * pulse, 0, Math.PI, 0);
      ctx.quadraticCurveTo(0, 4 * pulse, -18 * pulse, -4 * pulse);
      ctx.closePath();
      ctx.fill();

      // Scalloped lappets along bell rim
      ctx.fillStyle = secondary;
      ctx.beginPath();
      for (let lx = -18 * pulse; lx <= 18 * pulse; lx += 6 * pulse) {
        ctx.arc(lx, -4 * pulse, 3 * pulse, 0, Math.PI);
      }
      ctx.fill();

      // Translucent radial canals inside bell
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.5;
      for (let c = -2; c <= 2; c++) {
        ctx.beginPath();
        ctx.moveTo(c * 6 * pulse, -17 * pulse);
        ctx.quadraticCurveTo(c * 7 * pulse, -10 * pulse, c * 6 * pulse, -4 * pulse);
        ctx.stroke();
      }

      // Frilly oral arms in center
      ctx.fillStyle = finColor;
      for (const oa of [-1, 1]) {
        const oasway = Math.sin(t * 3 + oa) * 4;
        ctx.beginPath();
        ctx.moveTo(oa * 3, -4 * pulse);
        ctx.bezierCurveTo(oa * 5 + oasway, 6, oa * 2 - oasway, 14, oa * 4 + oasway, 22);
        ctx.lineTo(oa * 2 + oasway, 22);
        ctx.bezierCurveTo(oa * 1 - oasway, 14, oa * 3 + oasway, 6, 0, -4 * pulse);
        ctx.closePath();
        ctx.fill();
      }

      // Long trailing stinging tentacles
      ctx.strokeStyle = primary;
      ctx.lineWidth = 1.2;
      for (let tn = -3; tn <= 3; tn++) {
        const tx = tn * 4 * pulse;
        ctx.beginPath();
        ctx.moveTo(tx, -4 * pulse);
        ctx.quadraticCurveTo(
          tx + Math.sin(t * 2.8 + tn) * 6,
          12 + Math.abs(tn) * 2,
          tx + Math.cos(t * 2.2 + tn * 0.7) * 8,
          26 + Math.abs(tn) * 4
        );
        ctx.stroke();
      }

      ctx.restore();
      return true;
    }

    case 'plankton': {
      // Luminous microscopic radiolarian / dinoflagellate
      ctx.save();
      // Outer glass capsule
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Glowing cellular nucleus
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Radial silicious spines projecting outwards
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 1.4;
      for (let sp = 0; sp < 12; sp++) {
        const ang = (sp / 12) * Math.PI * 2 + t * 0.3;
        const len = 14 + (sp % 3) * 4 + Math.sin(t * 4 + sp) * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 9, Math.sin(ang) * 9);
        ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
        ctx.stroke();
      }

      // Trailing microscopic flagella
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.2;
      for (const fl of [-1, 1]) {
        const fSway = Math.sin(t * 6 + fl) * 5;
        ctx.beginPath();
        ctx.moveTo(fl * 4, 9);
        ctx.quadraticCurveTo(fl * 6 + fSway, 18, fl * 3 - fSway, 26);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    }

    case 'whale': {
      // Massive streamlined cetacean body
      ctx.beginPath();
      ctx.moveTo(-32, 0);
      ctx.quadraticCurveTo(-10, -16, 16, -14);
      ctx.quadraticCurveTo(34, -10, 38, 0);
      ctx.quadraticCurveTo(34, 12, 14, 14);
      ctx.quadraticCurveTo(-10, 14, -32, 0);
      ctx.closePath();
      ctx.fill();

      // Ventral throat grooves (baleen whale pleats)
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.5;
      for (let vp = -6; vp <= 6; vp += 3) {
        ctx.beginPath();
        ctx.moveTo(10, 5 + vp);
        ctx.quadraticCurveTo(24, 7 + vp, 32, 2 + vp * 0.5);
        ctx.stroke();
      }

      // Broad horizontal caudal fluke (tail) undulating
      const flukeSway = Math.sin(t * 3) * 4;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-32, 0);
      ctx.lineTo(-44, -12 + flukeSway);
      ctx.quadraticCurveTo(-38, flukeSway, -44, 12 + flukeSway);
      ctx.closePath();
      ctx.fill();

      // Curved dorsal fin
      ctx.beginPath();
      ctx.moveTo(-6, -15);
      ctx.quadraticCurveTo(-2, -23, 6, -14);
      ctx.closePath();
      ctx.fill();

      // Long paddle-like pectoral flipper
      const flipAngle = Math.sin(t * 2.5) * 0.15;
      ctx.save();
      ctx.translate(14, 8);
      ctx.rotate(flipAngle);
      ctx.beginPath();
      ctx.ellipse(0, 8, 4, 14, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Expressive eye & rostrum
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(28, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(28.5, -4, 1.4, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    default:
      return false;
  }
}

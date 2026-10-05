// Specialized high-performance silhouette rendering for all distinct marine life forms:
// Octopus, squid, cuttlefish, jellyfish, salps, plankton, krill, copepods,
// dolphins, whales, seals, sea lions, walruses, sea turtles, sea snakes,
// manatees, dugongs, sea otters, penguins, albatrosses, puffins, cormorants,
// marine iguanas, nautiluses, Portuguese man o' war, siphonophores, flying squid,
// Velella velella, sea butterflies, arrow worms, tardigrades, and marine worms.

export function drawMarineCreature(ctx, shape, primary, secondary, finColor, wiggle, wiggleTimer) {
  const t = wiggleTimer;
  switch (shape) {
    case 'cuttlefish': {
      // Broad mantle with undulating skirt fin and clustered front arms
      ctx.beginPath();
      ctx.ellipse(-2, 0, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rippling skirt fin along mantle border (batched smooth wave)
      const skirtWave = Math.sin(t * 5) * 2.5;
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.quadraticCurveTo(-10, -14 + skirtWave, 0, -13 - skirtWave);
      ctx.quadraticCurveTo(10, -12 + skirtWave, 16, 0);
      ctx.quadraticCurveTo(10, 12 - skirtWave, 0, 13 + skirtWave);
      ctx.quadraticCurveTo(-10, 14 - skirtWave, -18, 0);
      ctx.stroke();

      // Front cluster arms (batched in single path)
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let a = -3; a <= 3; a += 2) {
        ctx.moveTo(14, a * 1.8);
        ctx.quadraticCurveTo(21, a * 2.2 + wiggle, 27, a * 1.8);
      }
      ctx.stroke();
      return true;
    }

    case 'salp': {
      // Barrel-shaped transparent tunicate with circular muscle bands and nucleus
      ctx.save();
      ctx.globalAlpha *= 0.72;
      ctx.fillStyle = primary || 'rgba(186, 230, 253, 0.4)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-16, -9, 32, 18, 7) : ctx.rect(-16, -9, 32, 18);
      ctx.fill();

      // Translucent muscle bands (batched)
      ctx.strokeStyle = secondary || '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let b = -10; b <= 10; b += 5) {
        ctx.ellipse(b, 0, 2, 8, 0, 0, Math.PI * 2);
      }
      ctx.stroke();

      // Glowing nucleus
      ctx.fillStyle = finColor || '#f43f5e';
      ctx.beginPath();
      ctx.arc(8, 2, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'krill': {
      // Euphausiid shrimp with luminous photophores, feathery pleopods and curved rostrum
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.quadraticCurveTo(-6, -7, 12, -4);
      ctx.lineTo(16, 0);
      ctx.quadraticCurveTo(8, 6, -8, 5);
      ctx.closePath();
      ctx.fill();

      // Rostrum horn & antennae (batched)
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(14, -3); ctx.lineTo(24, -6);
      ctx.moveTo(14, -1); ctx.lineTo(26, 3);
      ctx.stroke();

      // Swimming pleopods (batched)
      const kick = Math.sin(t * 7) * 3.5;
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let p = -10; p <= 4; p += 4) {
        ctx.moveTo(p, 4);
        ctx.lineTo(p - 3, 9 + kick);
      }
      ctx.stroke();

      // Photophore bead
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(2, 2, 1.6, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'copepod': {
      // Teardrop body with single naupliar eye and rowing antennae
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.quadraticCurveTo(6, -8, -6, -6);
      ctx.quadraticCurveTo(-14, -2, -18, 0);
      ctx.quadraticCurveTo(-14, 2, -6, 6);
      ctx.quadraticCurveTo(6, 8, 12, 0);
      ctx.closePath();
      ctx.fill();

      // Long rowing antennae & caudal furca (batched)
      const sweep = Math.sin(t * 6.5) * 5;
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, -4); ctx.quadraticCurveTo(4, -16 + sweep, -12, -18 + sweep);
      ctx.moveTo(8, 4); ctx.quadraticCurveTo(4, 16 - sweep, -12, 18 - sweep);
      ctx.moveTo(-18, 0); ctx.lineTo(-25, -4);
      ctx.moveTo(-18, 0); ctx.lineTo(-25, 4);
      ctx.stroke();

      // Naupliar red eye
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(8, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'dolphin': {
      // Streamlined body with falcate dorsal fin, beak snout, and tail flukes
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.quadraticCurveTo(14, -8, -2, -9);
      ctx.quadraticCurveTo(-18, -6, -26, 0);
      ctx.quadraticCurveTo(-18, 6, -2, 8);
      ctx.quadraticCurveTo(14, 7, 22, 0);
      ctx.closePath();
      ctx.fill();

      // Curved falcate dorsal fin
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-2, -9);
      ctx.quadraticCurveTo(2, -18, 8, -9);
      ctx.closePath();
      ctx.fill();

      // Swept-back pectoral flipper & undulating caudal flukes
      const flukeAngle = Math.sin(t * 4) * 5;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      // Swept-back pectoral flipper
      ctx.moveTo(8, 4);
      ctx.quadraticCurveTo(4, 8, -2, 11);
      ctx.quadraticCurveTo(1, 7, 7, 3.5);
      ctx.closePath();
      // Caudal flukes
      ctx.moveTo(-26, 0); ctx.lineTo(-34, -7 + flukeAngle); ctx.lineTo(-32, flukeAngle); ctx.lineTo(-34, 7 + flukeAngle); ctx.closePath();
      ctx.fill();

      // Snout beak & eye
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(20, -2); ctx.lineTo(28, 0); ctx.lineTo(20, 2); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(16, -2, 1.4, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'seal': {
      // Cute Harp Seal Pup: Adorable plump snowball body, huge glossy dark puppy eyes, sweet boopable snout
      const sealSway = Math.sin(t * 3.5) * 4;

      // Soft plump blubber body
      ctx.beginPath();
      ctx.ellipse(-2, 0, 22, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy rounded head
      ctx.beginPath();
      ctx.arc(17, -1, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Rear webbed flippers swaying
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(-33, -7 + sealSway);
      ctx.lineTo(-29, sealSway);
      ctx.lineTo(-33, 7 + sealSway);
      ctx.closePath();
      ctx.fill();

      // Front cute rounded paddle flipper
      ctx.beginPath();
      ctx.ellipse(4, 8, 4.5, 9, 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Sweet blushing cheeks
      ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
      ctx.beginPath();
      ctx.arc(16, 3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Big adorable puppy eyes with gleaming double highlights
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(19, -3.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(18.3, -4.3, 1.0, 0, Math.PI * 2);
      ctx.arc(19.8, -3.0, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Boopable black nose & sweet mouth
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(24, 0, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(23, 2, 1.5, 0, Math.PI * 0.8);
      ctx.stroke();

      // Tiny cute whiskers
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(22, 1); ctx.lineTo(27, -0.5);
      ctx.moveTo(22, 2.5); ctx.lineTo(27, 3);
      ctx.stroke();

      return true;
    }

    case 'sea_lion': {
      // Flexible muscular neck, prominent external ear flaps, large foreflippers
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.quadraticCurveTo(-10, -11, 8, -9);
      ctx.lineTo(18, -4);
      ctx.quadraticCurveTo(24, 0, 18, 5);
      ctx.lineTo(8, 10);
      ctx.quadraticCurveTo(-10, 12, -20, 0);
      ctx.closePath();
      ctx.fill();

      // Large wing-like pectoral foreflipper
      const flapAngle = Math.sin(t * 3.2) * 0.18;
      ctx.save();
      ctx.translate(6, 6);
      ctx.rotate(flapAngle);
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.ellipse(0, 8, 4.5, 12, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Tail flippers
      const slFluke = Math.sin(t * 3) * 3;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-29, -5 + slFluke);
      ctx.lineTo(-26, slFluke);
      ctx.lineTo(-29, 5 + slFluke);
      ctx.closePath();
      ctx.fill();

      // Head, pinna ear & eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(17, -3, 1.4, 0, Math.PI * 2);
      ctx.arc(12, -7, 1.2, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'walrus': {
      // Shoal Tusked Walrus: Massive rotund blubber body, neck rolls, rear flippers, whiskered mystacial pad & thick curved ivory tusks
      const wSwim = Math.sin(t * 2.2) * 2.5;
      const flipperWave = Math.sin(t * 2.0) * 0.18;

      // 1. Rear hind flippers (tucked together paddling)
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-24, -2);
      ctx.quadraticCurveTo(-34, -7 + wSwim, -39, -9 + wSwim);
      ctx.quadraticCurveTo(-36, -3 + wSwim, -39, 1 + wSwim);
      ctx.quadraticCurveTo(-34, 4 + wSwim, -24, 3);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-22, 1);
      ctx.quadraticCurveTo(-32, 2 + wSwim * 0.8, -37, 7 + wSwim * 0.8);
      ctx.quadraticCurveTo(-33, 8 + wSwim * 0.8, -35, 12 + wSwim * 0.8);
      ctx.quadraticCurveTo(-30, 9 + wSwim * 0.8, -22, 5);
      ctx.closePath();
      ctx.fill();

      // 2. Heavy rotund blubber torso with arched back and thick neck
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(14, -7);
      ctx.quadraticCurveTo(8, -17, -10, -15);
      ctx.quadraticCurveTo(-26, -11, -26, 2);
      ctx.quadraticCurveTo(-24, 14, -8, 16);
      ctx.quadraticCurveTo(8, 17, 18, 9);
      ctx.quadraticCurveTo(24, 5, 22, -3);
      ctx.quadraticCurveTo(19, -8, 14, -7);
      ctx.closePath();
      ctx.fill();

      // 3. Thick blubber neck rolls & shoulder creases
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(10, -13);
      ctx.quadraticCurveTo(6, -4, 9, 7);
      ctx.moveTo(3, -14);
      ctx.quadraticCurveTo(-1, -3, 2, 9);
      ctx.stroke();

      // 4. Broad muscular front pectoral flipper (sweeping down and back)
      ctx.save();
      ctx.translate(6, 6);
      ctx.rotate(0.35 + flipperWave);
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-4, 12, -7, 17);
      ctx.quadraticCurveTo(-1, 16, 5, 11);
      ctx.quadraticCurveTo(7, 6, 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 5. Heavy jowled head & dome
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(17, -2, 9.5, 0, Math.PI * 2);
      ctx.fill();

      // 6. Prominent whiskered mystacial muzzle pad
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.ellipse(22, 2.5, 6.5, 5.5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Leathery dark nose
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(25.5, -0.5, 2.2, 1.6, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Whisker pits / vibrissae dots on the muzzle pad
      ctx.fillStyle = '#1e293b';
      for (const [mx, my] of [[20, 1], [22.5, 1.5], [25, 2], [19.5, 3.5], [22, 4], [24.5, 4.5], [21, 6]]) {
        ctx.beginPath();
        ctx.arc(mx, my, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bristling stiff white whiskers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(23, 2); ctx.lineTo(29, 3);
      ctx.moveTo(24, 3.5); ctx.lineTo(30, 5.5);
      ctx.moveTo(22, 5); ctx.lineTo(28, 7.5);
      ctx.moveTo(20, 5.5); ctx.lineTo(24, 9);
      ctx.stroke();

      // 7. Iconic thick, curved ivory tusks with realistic taper & inner shadow
      // Far tusk
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(22, 4);
      ctx.quadraticCurveTo(24, 11, 23, 19);
      ctx.quadraticCurveTo(20.5, 12, 19.5, 4.5);
      ctx.closePath();
      ctx.fill();
      // Near tusk (slightly longer and in foreground)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(24.5, 4);
      ctx.quadraticCurveTo(27, 12, 26, 21);
      ctx.quadraticCurveTo(23, 13, 22, 4.5);
      ctx.closePath();
      ctx.fill();
      // Tusk tip shine & groove
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(24, 6);
      ctx.quadraticCurveTo(25.5, 13, 25.2, 19.5);
      ctx.stroke();

      // 8. Expressive walrus eye with brow crease
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(17.5, -4, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(18, -4.5, 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Brow fold
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(17, -5.5, 2.5, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      return true;
    }

    case 'sea_turtle': {
      // Coral Sea Turtle: Streamlined cute carapace with rowing flippers and sweet face
      const turtleSway = Math.sin(t * 2.5) * 0.16;

      // Rear flippers & tiny tail
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-16, 0); ctx.lineTo(-20, 0); ctx.lineTo(-16, 1.5); ctx.closePath();
      ctx.ellipse(-12, -9, 3, 6, -0.3, 0, Math.PI * 2);
      ctx.ellipse(-12, 9, 3, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Smooth rowing front flippers
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(6, side * 9);
        ctx.rotate(side * (0.32 + turtleSway));
        ctx.beginPath();
        ctx.ellipse(0, side * 6, 3.5, 11, side * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Streamlined carapace shell
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.ellipse(-1, 0, 18, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Carapace scute rim & honey markings
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-2, 0, 5, 0, Math.PI * 2);
      ctx.stroke();

      // Cute head & sweet shining eyes
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.ellipse(19, 0, 6, 4.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(20, -1.8, 2.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(19.4, -2.4, 0.9, 0, Math.PI * 2);
      ctx.arc(20.6, -1.2, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Rosy blush & beak smile
      ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
      ctx.beginPath();
      ctx.arc(18, 1.8, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(22, 0.8, 1.5, 0.1, Math.PI * 0.7);
      ctx.stroke();

      return true;
    }

    case 'sea_snake': {
      // Flattened paddle tail with sinusoidal undulating body
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = primary;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      for (let s = 1; s <= 4; s++) {
        const sx = 22 - s * 11;
        const sy = Math.sin(t * 3.8 - s * 0.8) * 8;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Banded pattern rings (batched)
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let b = 1; b <= 3; b += 2) {
        const bx = 22 - b * 11;
        const by = Math.sin(t * 3.8 - b * 0.8) * 8;
        ctx.moveTo(bx - 3, by);
        ctx.lineTo(bx + 3, by);
      }
      ctx.stroke();

      // Head & eye
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(23, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(24, -1, 1, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'manatee':
    case 'dugong': {
      // Plump rotund body with paddle/fluked tail
      ctx.beginPath();
      ctx.ellipse(-2, 0, 24, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Whiskered muzzle & head
      ctx.beginPath();
      ctx.arc(18, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Broad caudal tail (spatula for manatee, dolphin fluke for dugong)
      const tailSway = Math.sin(t * 2.6) * 4;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      if (shape === 'manatee') {
        ctx.ellipse(-28, tailSway, 9, 13, 0, 0, Math.PI * 2);
      } else {
        ctx.moveTo(-22, 0);
        ctx.lineTo(-33, -9 + tailSway);
        ctx.lineTo(-30, tailSway);
        ctx.lineTo(-33, 9 + tailSway);
        ctx.closePath();
      }
      ctx.fill();

      // Paddle flipper
      ctx.beginPath();
      ctx.ellipse(8, 7, 4, 9, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Tiny eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(19, -3, 1.2, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'sea_otter': {
      // Sleek fur body with rounded teddy head, paws, and flattened rudder tail
      ctx.beginPath();
      ctx.ellipse(-2, 0, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Round head with cute muzzle
      ctx.beginPath();
      ctx.arc(16, -2, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Flattened rudder tail
      const otterTail = Math.sin(t * 3.5) * 5;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.quadraticCurveTo(-26, otterTail * 0.5, -30, otterTail);
      ctx.quadraticCurveTo(-26, otterTail + 4, -18, 2);
      ctx.closePath();
      ctx.fill();

      // Webbed feet & paws
      ctx.beginPath();
      ctx.ellipse(-10, 6, 3.5, 6, 0.4, 0, Math.PI * 2);
      ctx.ellipse(8, 5, 3, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Eye & nose
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(17, -4, 1.2, 0, Math.PI * 2);
      ctx.arc(21, -1, 1.2, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'penguin': {
      // Torpedo diving body with flipper wings and wedge tail
      ctx.beginPath();
      ctx.ellipse(-1, 0, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // White chest counter-shading
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(1, 2, 13, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing flippers flapping
      const pengFlap = Math.sin(t * 6) * 0.28;
      ctx.save();
      ctx.translate(4, -4);
      ctx.rotate(-0.4 + pengFlap);
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.ellipse(0, -6, 2.8, 10, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Head & sharp beak
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(15, -1, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(19, -2); ctx.lineTo(26, 0); ctx.lineTo(19, 1); ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(16, -2, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(16.5, -2, 0.8, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'albatross':
    case 'puffin':
    case 'cormorant': {
      // Dynamic diving pelagic seabird
      ctx.beginPath();
      ctx.ellipse(0, 0, 19, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Swept-back diving wings
      const wingSweep = Math.sin(t * 4.5) * 0.15;
      ctx.save();
      ctx.translate(2, -3);
      ctx.rotate(-0.5 + wingSweep);
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.ellipse(0, -8, 3, 14, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Beak (large colorful wedge for puffin, hooked for albatross/cormorant)
      ctx.fillStyle = shape === 'puffin' ? '#f97316' : '#facc15';
      ctx.beginPath();
      ctx.moveTo(17, -2); ctx.lineTo(26, 0); ctx.lineTo(17, 2); ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(15, -2, 1.2, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'marine_iguana': {
      // Textured reptile body with dorsal spines and long waving rudder tail
      ctx.beginPath();
      ctx.ellipse(4, 0, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Long undulating rudder tail (batched stroke)
      ctx.strokeStyle = primary;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      for (let s = 1; s <= 3; s++) {
        const sx = -10 - s * 10;
        const sy = Math.sin(t * 3.5 - s * 0.7) * 7;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Dorsal crest spines
      ctx.fillStyle = finColor;
      ctx.beginPath();
      for (let sp = -6; sp <= 12; sp += 4) {
        ctx.moveTo(sp - 1, -8); ctx.lineTo(sp, -13); ctx.lineTo(sp + 1, -8);
      }
      ctx.fill();

      // Blunt head & eye
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(18, -1, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(18, -2, 1.2, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'nautilus': {
      // Chambered Nautilus: Calm spiral shell with gentle breathing pulse and neat tentacle cluster
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Elegant curved shell growth septa
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let a = 0; a < 5; a++) {
        const ang = (a / 5) * Math.PI * 1.3 + 0.5;
        const rad = 16;
        ctx.moveTo(Math.cos(ang) * 4, Math.sin(ang) * 4);
        ctx.quadraticCurveTo(Math.cos(ang + 0.2) * (rad * 0.6), Math.sin(ang + 0.2) * (rad * 0.6), Math.cos(ang) * rad, Math.sin(ang) * rad);
      }
      ctx.stroke();

      // Fleshy protective hood (leathery shield)
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.arc(8, -4, 9, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Calm, prominent nautilus eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(10, 2, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10.5, 1.6, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Calm, compact tentacle bundle with very gentle, soothing pulse
      const calmWave = Math.sin(t * 1.2) * 0.6;
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const yOff = 1 + i * 1.8;
        ctx.moveTo(14, yOff);
        ctx.quadraticCurveTo(19, yOff + calmWave * 0.5, 22, yOff + calmWave);
      }
      ctx.stroke();

      // Small peaceful siphon jet bubble
      ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
      ctx.beginPath();
      ctx.arc(12, 9, 1.2, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'man_o_war': {
      // Translucent pneumatophore float with trailing toxic tentacles
      ctx.save();
      ctx.fillStyle = 'rgba(168, 85, 247, 0.75)';
      ctx.beginPath();
      ctx.moveTo(-16, 2);
      ctx.quadraticCurveTo(0, -18, 16, 2);
      ctx.closePath();
      ctx.fill();

      // Cyan sail crest
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.beginPath();
      ctx.moveTo(-12, -4);
      ctx.quadraticCurveTo(0, -22, 12, -4);
      ctx.closePath();
      ctx.fill();

      // Trailing tentacles (batched in single path)
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let tc = -8; tc <= 8; tc += 4) {
        ctx.moveTo(tc, 2);
        ctx.quadraticCurveTo(
          tc + Math.sin(t * 2.5 + tc) * 5, 14,
          tc + Math.cos(t * 2.2 + tc) * 6, 28
        );
      }
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'siphonophore': {
      // Colonial chain of nectophores (swimming bells) - batched for high FPS
      ctx.save();
      ctx.globalAlpha *= 0.85;
      ctx.fillStyle = primary || 'rgba(147, 197, 253, 0.6)';
      ctx.beginPath();
      for (let c = 0; c < 5; c++) {
        const cx = 16 - c * 8;
        const cy = Math.sin(t * 2.5 - c * 0.6) * 5;
        ctx.arc(cx, cy, 5.5 - c * 0.5, 0, Math.PI * 2);
      }
      ctx.fill();

      // Trailing gastrozooid tentilla (batched)
      ctx.strokeStyle = finColor || '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let c = 0; c < 5; c++) {
        const cx = 16 - c * 8;
        const cy = Math.sin(t * 2.5 - c * 0.6) * 5;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(t * 3 + c) * 3, cy + 14);
      }
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'flying_squid': {
      // Sleek missile mantle with broad rhomboid fins
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(6, -8);
      ctx.lineTo(-24, 0);
      ctx.lineTo(6, 8);
      ctx.closePath();
      ctx.fill();

      // Rhomboid stabilizing fins
      const finFlutter = Math.sin(t * 5) * 1.5;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-22, -14 + finFlutter);
      ctx.lineTo(-24, 0);
      ctx.lineTo(-22, 14 - finFlutter);
      ctx.closePath();
      ctx.fill();

      // Arms (batched)
      ctx.strokeStyle = primary;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let a = -2; a <= 2; a++) {
        ctx.moveTo(18, a * 2.5);
        ctx.quadraticCurveTo(26, a * 3 + wiggle, 34, a * 2);
      }
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, -2, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(12.5, -2, 1.2, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'velella': {
      // By-the-wind sailor floating disc with upright triangular sail
      ctx.fillStyle = primary || '#1d4ed8';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Concentric structural ribs
      ctx.strokeStyle = secondary || '#60a5fa';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Diagonal sail catching ocean breeze
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.moveTo(-10, -2);
      ctx.quadraticCurveTo(0, -18, 12, -4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return true;
    }

    case 'sea_butterfly': {
      // Thecosome pteropod with delicate shell and flapping wing-like parapodia
      ctx.beginPath();
      ctx.arc(-4, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Flapping wing-like parapodia
      const wingFlap = Math.sin(t * 5.5) * 0.35;
      ctx.fillStyle = finColor;
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(2, side * 3);
        ctx.rotate(side * wingFlap);
        ctx.beginPath();
        ctx.ellipse(0, side * 9, 4, 10, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      return true;
    }

    case 'arrow_worm': {
      // Chaetognath transparent body with lateral fins and tail fin
      ctx.save();
      ctx.globalAlpha *= 0.75;
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lateral and caudal ray fins (batched)
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-24, 0); ctx.lineTo(-30, -5); ctx.lineTo(-30, 5); ctx.closePath();
      ctx.moveTo(-6, -4); ctx.lineTo(-1, -8); ctx.lineTo(4, -4);
      ctx.moveTo(-6, 4); ctx.lineTo(-1, 8); ctx.lineTo(4, 4);
      ctx.stroke();

      // Grasping spines at head
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(22, -3); ctx.lineTo(27, -1);
      ctx.moveTo(22, 3); ctx.lineTo(27, 1);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'tardigrade': {
      // Water bear segmented plump body with stubby clawed legs
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4 Pairs of stubby clawed legs (batched)
      const walk = Math.sin(t * 4.5) * 3;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      for (let leg = -2; leg <= 1; leg++) {
        const lx = leg * 8 + 3;
        ctx.rect(lx - 2.5, 9, 5, 5 + (leg % 2 ? walk : -walk));
      }
      ctx.fill();

      // Cute snout
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(17, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    case 'marine_worm': {
      // Polychaete worm with sinuous segments and feathery radioles
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = primary;
      ctx.beginPath();
      ctx.moveTo(20, 0);
      for (let w = 1; w <= 4; w++) {
        const wx = 20 - w * 9;
        const wy = Math.sin(t * 4.2 - w * 0.7) * 5;
        ctx.lineTo(wx, wy);
      }
      ctx.stroke();

      // Feathery radioles at crown (batched)
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let r = 0; r < 4; r++) {
        const rAng = (r / 3) * Math.PI * 0.8 - Math.PI * 0.4;
        ctx.moveTo(20, 0);
        ctx.lineTo(20 + Math.cos(rAng) * 9, Math.sin(rAng) * 9);
      }
      ctx.stroke();
      return true;
    }

    case 'octopus': {
      // Bulbous muscular mantle
      ctx.beginPath();
      ctx.ellipse(-4, 0, 16, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Intelligent eyes with horizontal slit
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, -4, 3, 0, Math.PI * 2);
      ctx.arc(8, 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(7, -5, 3, 1.6);
      ctx.fillRect(7, 3, 3, 1.6);

      // Articulated writhing arms (batched into single path for max performance)
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const offset = (i - 2) * 4;
        const wave = Math.sin(t * 3.2 + i * 0.9) * 6;
        ctx.moveTo(11, offset);
        ctx.quadraticCurveTo(20, offset + wave * 0.7, 28 + (i % 2) * 4, offset + wave);
      }
      ctx.stroke();
      return true;
    }

    case 'squid': {
      // Torpedo mantle with triangular tail fins
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.quadraticCurveTo(-10, -10, 10, -9);
      ctx.lineTo(12, 9);
      ctx.quadraticCurveTo(-10, 10, -24, 0);
      ctx.closePath();
      ctx.fill();

      // Triangular tail fins
      const finPulse = Math.sin(t * 4) * 2;
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(-12, -14 + finPulse);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-12, 14 - finPulse);
      ctx.closePath();
      ctx.fill();

      // Luminous eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(9, -4, 3, 0, Math.PI * 2);
      ctx.arc(9, 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(9.5, -4, 1.6, 0, Math.PI * 2);
      ctx.arc(9.5, 4, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Arms & feeding tentacles (batched)
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let a = -2; a <= 2; a++) {
        ctx.moveTo(12, a * 3);
        ctx.quadraticCurveTo(20, a * 3.5 + wiggle * 0.5, 27, a * 3 + wiggle);
      }
      ctx.stroke();

      // 2 Elongated feeding clubs
      const tw = Math.sin(t * 4.2) * 5;
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(12, -3); ctx.bezierCurveTo(22, -5, 28, -2 + tw, 38, -3 + tw);
      ctx.moveTo(12, 3); ctx.bezierCurveTo(22, 5, 28, 2 - tw, 38, 3 - tw);
      ctx.stroke();
      return true;
    }

    case 'jellyfish': {
      // Pulsating bell dome with margin lobes
      const pulse = 0.9 + Math.abs(Math.sin(t * 2.4)) * 0.2;
      ctx.save();
      ctx.globalAlpha *= 0.85;

      // Bell dome
      ctx.beginPath();
      ctx.ellipse(0, -4 * pulse, 18 * pulse, 15 * pulse, 0, Math.PI, 0);
      ctx.quadraticCurveTo(0, 4 * pulse, -18 * pulse, -4 * pulse);
      ctx.closePath();
      ctx.fill();

      // Radial canals (batched)
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let c = -1; c <= 1; c++) {
        ctx.moveTo(c * 7 * pulse, -16 * pulse);
        ctx.quadraticCurveTo(c * 8 * pulse, -9 * pulse, c * 7 * pulse, -4 * pulse);
      }
      ctx.stroke();

      // Oral arms & trailing tentacles (batched in single path)
      ctx.strokeStyle = primary;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let tn = -2; tn <= 2; tn++) {
        const tx = tn * 6 * pulse;
        ctx.moveTo(tx, -4 * pulse);
        ctx.quadraticCurveTo(
          tx + Math.sin(t * 2.6 + tn) * 6, 12,
          tx + Math.cos(t * 2 + tn) * 8, 26
        );
      }
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'plankton': {
      // Luminous microscopic radiolarian with glass spines and core
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Radial silicious spines (batched, 6 spines instead of 12 for 2x performance)
      ctx.strokeStyle = finColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let sp = 0; sp < 6; sp++) {
        const ang = (sp / 6) * Math.PI * 2 + t * 0.3;
        const len = 16 + Math.sin(t * 3 + sp) * 2;
        ctx.moveTo(Math.cos(ang) * 9, Math.sin(ang) * 9);
        ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
      }
      // Trailing flagella
      const fSway = Math.sin(t * 5) * 5;
      ctx.moveTo(-4, 9); ctx.quadraticCurveTo(-6 + fSway, 17, -3 - fSway, 24);
      ctx.moveTo(4, 9); ctx.quadraticCurveTo(6 - fSway, 17, 3 + fSway, 24);
      ctx.stroke();
      ctx.restore();
      return true;
    }

    case 'whale': {
      // Sunlit Humpback Whale: Cute gentle giant with smiling rostrum, friendly gleaming eyes & graceful flippers
      const flukeSway = Math.sin(t * 2.8) * 4;
      const flipAngle = Math.sin(t * 2.2) * 0.12;

      // 1. Undulating caudal peduncle & broad flukes
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.quadraticCurveTo(-38, -2 + flukeSway * 0.5, -45, -13 + flukeSway);
      ctx.quadraticCurveTo(-41, -2 + flukeSway, -37, flukeSway);
      ctx.quadraticCurveTo(-41, 2 + flukeSway, -45, 13 + flukeSway);
      ctx.quadraticCurveTo(-38, 2 + flukeSway * 0.5, -28, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 2. Plump rounded whale body
      ctx.beginPath();
      ctx.moveTo(38, -1);
      ctx.quadraticCurveTo(34, -11, 16, -14);
      ctx.quadraticCurveTo(-10, -15, -30, 0);
      ctx.quadraticCurveTo(-10, 13, 14, 13);
      ctx.quadraticCurveTo(32, 10, 38, -1);
      ctx.closePath();
      ctx.fillStyle = primary;
      ctx.fill();

      // 3. Cute rounded knobby bumps (humpback tubercles) along snout
      ctx.fillStyle = finColor;
      for (const tx of [24, 29, 34]) {
        ctx.beginPath();
        ctx.arc(tx, -8 + (38 - tx) * 0.2, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Soft cream countershading underbelly with gentle throat pleats
      ctx.beginPath();
      ctx.moveTo(34, 1);
      ctx.quadraticCurveTo(24, 8, 8, 8.5);
      ctx.quadraticCurveTo(-8, 7.5, -24, 1);
      ctx.quadraticCurveTo(-10, 13, 14, 13);
      ctx.quadraticCurveTo(32, 10, 38, -1);
      ctx.closePath();
      ctx.fillStyle = 'rgba(254, 243, 199, 0.85)';
      ctx.fill();

      ctx.strokeStyle = 'rgba(202, 138, 4, 0.4)';
      ctx.lineWidth = 1.2;
      for (let vp = -3; vp <= 3; vp += 3) {
        ctx.beginPath();
        ctx.moveTo(8, 7 + vp * 0.6);
        ctx.quadraticCurveTo(22, 7.5 + vp * 0.4, 32, 2 + vp * 0.4);
        ctx.stroke();
      }

      // 5. Small cute curved dorsal fin
      ctx.fillStyle = finColor;
      ctx.beginPath();
      ctx.moveTo(-6, -14);
      ctx.quadraticCurveTo(-2, -21, 5, -14);
      ctx.closePath();
      ctx.fill();

      // 6. Graceful long wing-like pectoral flipper (sweeping backward)
      ctx.save();
      ctx.translate(10, 6);
      ctx.rotate(-0.15 + flipAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-6, 8, -15, 14);
      ctx.quadraticCurveTo(-17, 14.5, -15.5, 12);
      ctx.quadraticCurveTo(-8, 6, -1, 1);
      ctx.closePath();
      ctx.fillStyle = finColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();

      // 7. Sweet smiling mouth
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(36, 1);
      ctx.quadraticCurveTo(28, 4.5, 23, 1.5);
      ctx.stroke();

      // 8. Soft rosy blush
      ctx.fillStyle = 'rgba(251, 113, 133, 0.42)';
      ctx.beginPath();
      ctx.arc(22, 2, 2.6, 0, Math.PI * 2);
      ctx.fill();

      // 9. Big shining anime whale eye
      const wEyeX = 26, wEyeY = -3.5;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(wEyeX, wEyeY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(wEyeX - 0.8, wEyeY - 0.8, 1.1, 0, Math.PI * 2);
      ctx.arc(wEyeX + 0.8, wEyeY + 0.7, 0.55, 0, Math.PI * 2);
      ctx.fill();

      // 10. Whimsical gentle blowhole water puff
      const puffPulse = Math.sin(t * 3.2);
      if (puffPulse > 0.2) {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
        ctx.beginPath();
        ctx.arc(10, -18 - puffPulse * 2.5, 1.6 + puffPulse * 0.8, 0, Math.PI * 2);
        ctx.arc(13, -21 - puffPulse * 3.5, 1.2 + puffPulse * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      return true;
    }

    default:
      return false;
  }
}

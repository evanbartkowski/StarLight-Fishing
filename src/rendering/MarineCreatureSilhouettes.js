// Specialized high-performance silhouette rendering for all distinct marine life forms:
// Octopus, squid, cuttlefish, jellyfish, salps, plankton, krill, copepods,
// dolphins, whales, seals, sea lions, walruses, sea turtles, sea snakes,
// manatees, dugongs, sea otters, penguins, albatrosses, puffins, cormorants,
// marine iguanas, nautiluses, Portuguese man o' war, siphonophores, flying squid,
// Velella velella, sea butterflies, arrow worms, tardigrades, and marine worms.

export function drawMarineCreature(ctx, shape, primary, secondary, finColor, wiggle, wiggleTimer, species = null, fish = null) {
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
      // Elongated sinusoidal undulating body with flattened paddle tail - slower, graceful serpentine movement
      ctx.lineWidth = 5.2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = primary;
      ctx.beginPath();
      ctx.moveTo(24, 0);
      for (let s = 1; s <= 6; s++) {
        const sx = 24 - s * 8.5;
        const sy = Math.sin(t * 1.35 - s * 0.7) * 6.5;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Banded pattern rings (alternating striped markings)
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 4.8;
      ctx.beginPath();
      for (let b = 1; b <= 5; b += 2) {
        const bx = 24 - b * 8.5;
        const by = Math.sin(t * 1.35 - b * 0.7) * 6.5;
        ctx.moveTo(bx - 2.5, by);
        ctx.lineTo(bx + 2.5, by);
      }
      ctx.stroke();

      // Flattened paddle tail fin
      const tailX = 24 - 6 * 8.5;
      const tailY = Math.sin(t * 1.35 - 6 * 0.7) * 6.5;
      ctx.fillStyle = finColor || secondary;
      ctx.beginPath();
      ctx.ellipse(tailX - 4, tailY, 6, 4, Math.sin(t * 1.35) * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Slender snake head & dark eye
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(25, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(26, -1, 1, 0, Math.PI * 2);
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
      // Hydrothermal vent tube worm (Riftia pachyptila):
      // Stately pearlescent chitinous tube sheath with a vibrant crimson plume branch,
      // anchored in volcanic basalt with calm, steady respiration.
      ctx.save();
      const sway = Math.sin(t * 1.5) * 3; // Calm, steady motion with few moving parts

      // 1. Tough protective mineralized tube casing
      const tubeGrad = ctx.createLinearGradient(-15, 0, 10, 0);
      tubeGrad.addColorStop(0, '#e2e8f0');
      tubeGrad.addColorStop(0.5, '#f8fafc');
      tubeGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = tubeGrad;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.moveTo(-18, 5);
      ctx.quadraticCurveTo(-5, 4, 8, 3 + sway * 0.3);
      ctx.lineTo(8, -5 + sway * 0.3);
      ctx.quadraticCurveTo(-5, -4, -18, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tube growth rings (collars)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      for (let ring = -12; ring <= 2; ring += 5) {
        ctx.beginPath();
        ctx.ellipse(ring, 0, 1.4, 4.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Tube collar lip
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(8, sway * 0.3, 2.5, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2. Vibrant crimson branchial plume (respiratory gill structure rich in hemoglobin)
      const plumeGrad = ctx.createLinearGradient(8, 0, 24, 0);
      plumeGrad.addColorStop(0, '#be123c');
      plumeGrad.addColorStop(0.5, '#e11d48');
      plumeGrad.addColorStop(1, '#fb7185');
      ctx.fillStyle = plumeGrad;

      // Crown plume petals (smooth, graceful cluster, steady breathing)
      ctx.beginPath();
      ctx.moveTo(8, -3 + sway * 0.3);
      ctx.quadraticCurveTo(16, -7 + sway * 0.7, 24, -2 + sway);
      ctx.quadraticCurveTo(18, 0 + sway * 0.5, 23, 2 + sway);
      ctx.quadraticCurveTo(16, 6 + sway * 0.6, 8, 3 + sway * 0.3);
      ctx.closePath();
      ctx.fill();

      // Plume central lamellae ridges
      ctx.strokeStyle = '#ffe4e6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(9, sway * 0.3);
      ctx.lineTo(21, sway * 0.8);
      ctx.stroke();

      // Soft ambient vent glow
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.arc(17, sway * 0.7, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
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

    case 'seahorse': {
      const isCorinthian = species?.name?.toLowerCase().includes('corinthian');
      const sway = Math.sin(t * 2.2) * 2;
      const finFlutter = Math.sin(t * 8) * 3;

      ctx.save();
      // Upright seahorse posture with gentle swimming pitch
      ctx.rotate(sway * 0.05);

      // 1. Fluttering Dorsal Fin (rippling on back)
      ctx.save();
      ctx.fillStyle = finColor || '#38bdf8';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(-7, -4);
      ctx.quadraticCurveTo(-16 + finFlutter, -1, -15 + finFlutter, 8);
      ctx.quadraticCurveTo(-11, 10, -5, 6);
      ctx.closePath();
      ctx.fill();
      // Delicate fin rays
      ctx.strokeStyle = isCorinthian ? '#fde047' : (secondary || '#ffffff');
      ctx.lineWidth = 1;
      for (let r = 0; r < 4; r++) {
        ctx.beginPath();
        ctx.moveTo(-6, -2 + r * 2.5);
        ctx.lineTo(-14 + finFlutter * 0.8, -1 + r * 2.6);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Prehensile Spiraled Tail
      ctx.strokeStyle = primary;
      ctx.lineWidth = isCorinthian ? 5 : 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-2, 10);
      ctx.quadraticCurveTo(-6, 18, -10, 22);
      ctx.quadraticCurveTo(-14, 26, -11, 29);
      ctx.quadraticCurveTo(-7, 32, -3, 29);
      ctx.quadraticCurveTo(1, 26, -1, 22);
      ctx.quadraticCurveTo(-3, 19, -6, 21);
      ctx.stroke();

      if (isCorinthian) {
        // Gilded acanthus flourishes along coiled tail
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, 13);
        ctx.quadraticCurveTo(-8, 20, -11, 24);
        ctx.stroke();
      }

      // 3. Arched S-Curved Torso & Prominent Rounded Belly
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(-3, -12);
      ctx.quadraticCurveTo(-8, -4, -6, 4);
      ctx.quadraticCurveTo(-4, 10, -2, 12);
      ctx.quadraticCurveTo(7, 10, 7, 2);
      ctx.quadraticCurveTo(7, -4, 3, -10);
      ctx.closePath();
      ctx.fill();

      // 4. Segmented Bony Armor Plates (Annuli Rings)
      ctx.strokeStyle = isCorinthian ? '#fbbf24' : (secondary || '#bae6fd');
      ctx.lineWidth = isCorinthian ? 1.8 : 1.3;
      for (let ring = -8; ring <= 8; ring += 3.2) {
        ctx.beginPath();
        ctx.moveTo(-5, ring);
        ctx.quadraticCurveTo(0, ring - 1, 5, ring);
        ctx.stroke();
      }

      // 5. Arched Neck and Equine Head
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(1, -10);
      ctx.quadraticCurveTo(4, -16, 9, -15);
      ctx.lineTo(19, -13);
      ctx.lineTo(20, -11);
      ctx.lineTo(15, -9);
      ctx.quadraticCurveTo(9, -8, 4, -5);
      ctx.closePath();
      ctx.fill();

      // Snout tip puckered mouth
      ctx.fillStyle = isCorinthian ? '#f59e0b' : (finColor || '#38bdf8');
      ctx.beginPath();
      ctx.ellipse(19, -12, 1.8, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Small fluttering pectoral cheek fin
      const pecFlutter = Math.sin(t * 8.5) * 2;
      ctx.fillStyle = finColor || '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(4, -10);
      ctx.quadraticCurveTo(0 + pecFlutter, -12, 2, -15);
      ctx.quadraticCurveTo(6, -14, 5, -10);
      ctx.closePath();
      ctx.fill();

      // 6. Coronet Crest (Head Ornament)
      if (isCorinthian) {
        // Majestic Classical Greek Corinthian Acanthus Column Capital Crest
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(5, -15);
        ctx.quadraticCurveTo(2, -24, -3, -26);
        ctx.quadraticCurveTo(2, -20, 7, -17);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(4, -14);
        ctx.quadraticCurveTo(-2, -21, -8, -19);
        ctx.quadraticCurveTo(-4, -16, 2, -13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(1, -12);
        ctx.quadraticCurveTo(-5, -15, -9, -12);
        ctx.quadraticCurveTo(-4, -11, 0, -10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Corinthian ornate golden bridle filigree across cheek
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(15, -11);
        ctx.lineTo(7, -8);
        ctx.lineTo(2, -12);
        ctx.stroke();

        // Imperial Atlantean sapphire gem on bridle
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(8, -9, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(7.4, -9.4, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Breastplate golden laurel fluting
        ctx.fillStyle = '#fde047';
        for (let b = -4; b <= 6; b += 4) {
          ctx.beginPath();
          ctx.ellipse(5, b, 1.5, 2.5, 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Natural seahorse spiny coronet
        ctx.fillStyle = finColor || '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(5, -15);
        ctx.lineTo(2, -22);
        ctx.lineTo(6, -17);
        ctx.lineTo(4, -24);
        ctx.lineTo(8, -16);
        ctx.closePath();
        ctx.fill();
      }

      // 7. Expressive Seahorse Eye
      const eyeX = 9, eyeY = -12;
      ctx.fillStyle = isCorinthian ? '#f59e0b' : '#0f172a';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isCorinthian ? '#38bdf8' : (secondary || '#fde047');
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(eyeX + 0.3, eyeY, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX - 0.6, eyeY - 0.7, 0.9, 0, Math.PI * 2);
      ctx.arc(eyeX + 0.9, eyeY + 0.6, 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return true;
    }

    case 'mermaid': {
      const hairPalette = [
        '#f59e0b', // Golden blonde
        '#10b981', // Emerald seafoam
        '#ef4444', // Ruby coral
        '#8b5cf6', // Midnight violet
        '#06b6d4', // Ocean cyan
        '#ec4899', // Rose petal pink
        '#f8fafc', // Platinum starlight
      ];
      let hairColor = fish?.hairColor || species?.hairColor;
      if (!hairColor) {
        const seed = Math.abs((Math.round((fish?.x || 0) * 13 + (fish?.y || 0) * 29) || (species?.name?.length || 1) * 7) % hairPalette.length);
        hairColor = hairPalette[seed];
      }

      const sway = Math.sin(t * 3.2) * 4;
      const tailWave1 = Math.sin(t * 3.2) * 5;
      const tailWave2 = Math.sin(t * 3.2 - 0.7) * 9;
      const tailWave3 = Math.sin(t * 3.2 - 1.4) * 14;
      const hairWave = Math.sin(t * 2.4) * 3.5;

      ctx.save();

      // 1. Iridescent Scaled Lower Mermaid Tail (Graceful undulating S-curve)
      ctx.save();
      const tailGrad = ctx.createLinearGradient(0, 0, -38, tailWave3);
      tailGrad.addColorStop(0, primary || '#0284c7');
      tailGrad.addColorStop(0.5, secondary || '#38bdf8');
      tailGrad.addColorStop(1, finColor || '#34d399');
      ctx.fillStyle = tailGrad;

      ctx.beginPath();
      ctx.moveTo(1, 2);
      ctx.quadraticCurveTo(-10, 4 + tailWave1 * 0.4, -18, 3 + tailWave1);
      ctx.quadraticCurveTo(-26, 2 + tailWave2 * 0.7, -34, tailWave2);
      ctx.quadraticCurveTo(-38, tailWave3, -42, tailWave3);
      ctx.quadraticCurveTo(-34, -4 + tailWave2, -26, -5 + tailWave2 * 0.6);
      ctx.quadraticCurveTo(-18, -4 + tailWave1 * 0.3, -8, -3);
      ctx.quadraticCurveTo(1, -2, 1, 2);
      ctx.closePath();
      ctx.fill();

      // Shimmering tail scales
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      for (let s = 0; s < 4; s++) {
        const sx = -6 - s * 6;
        const sy = tailWave1 * (s / 4);
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Translucent Flowing Caudal Flukes (Tail Fins)
      ctx.save();
      ctx.fillStyle = finColor || '#38bdf8';
      ctx.globalAlpha = 0.78;
      ctx.beginPath();
      ctx.moveTo(-40, tailWave3);
      ctx.quadraticCurveTo(-52, -12 + tailWave3 + hairWave, -62, -16 + tailWave3);
      ctx.quadraticCurveTo(-54, -4 + tailWave3, -45, tailWave3 - 1);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-40, tailWave3);
      ctx.quadraticCurveTo(-52, 12 + tailWave3 - hairWave, -62, 16 + tailWave3);
      ctx.quadraticCurveTo(-54, 4 + tailWave3, -45, tailWave3 + 1);
      ctx.closePath();
      ctx.fill();

      // Delicate translucent pelvic/hip fin frills
      ctx.beginPath();
      ctx.moveTo(-4, 3);
      ctx.quadraticCurveTo(-10, 10 + tailWave1 * 0.5, -16, 8 + tailWave1 * 0.5);
      ctx.quadraticCurveTo(-11, 4, -4, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Graceful Feminine Torso & Arms
      const skinTone = '#fde68a';
      ctx.fillStyle = skinTone;

      ctx.beginPath();
      ctx.moveTo(1, 2);
      ctx.lineTo(2, -3);
      ctx.quadraticCurveTo(6, -6, 9, -6);
      ctx.quadraticCurveTo(13, -7, 14, -11);
      ctx.quadraticCurveTo(10, -11, 8, -6);
      ctx.quadraticCurveTo(3, -5, 1, 2);
      ctx.closePath();
      ctx.fill();

      // Delicate arms
      ctx.strokeStyle = skinTone;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(13, -8);
      ctx.quadraticCurveTo(19, -4 + sway * 0.3, 25, -5 + sway * 0.4);
      ctx.stroke();

      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.ellipse(26, -5 + sway * 0.4, 2, 1.2, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, -7);
      ctx.quadraticCurveTo(7, -1, 3, 1);
      ctx.stroke();

      // 4. Seashell / Pearl Bustier Top
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(12, -7, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(9, -7, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10.5, -7, 1, 0, Math.PI * 2);
      ctx.fill();

      // 5. Neck and Head
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.moveTo(13, -11);
      ctx.lineTo(15, -14);
      ctx.quadraticCurveTo(19, -15, 19, -18);
      ctx.quadraticCurveTo(18, -21, 14, -21);
      ctx.quadraticCurveTo(10, -18, 11, -13);
      ctx.closePath();
      ctx.fill();

      // Rosy cheek blush
      ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(15.5, -17, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Serene gentle smile
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(17.5, -16.2, 1.2, 0.2, Math.PI * 0.7);
      ctx.stroke();

      // 6. Large Beautiful Anime/Classical Eye
      const eyeX = 16, eyeY = -18.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, 2.2, 2.6, 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(eyeX + 0.3, eyeY, 1.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(eyeX + 0.4, eyeY, 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX - 0.4, eyeY - 0.7, 0.8, 0, Math.PI * 2);
      ctx.arc(eyeX + 0.7, eyeY + 0.6, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY - 0.4, 2.4, -Math.PI * 0.8, -0.2);
      ctx.stroke();

      // 7. Long Luxurious Flowing Hair
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.moveTo(12, -22);
      ctx.quadraticCurveTo(17, -23, 19, -19);
      ctx.quadraticCurveTo(15, -19, 13, -16);
      ctx.quadraticCurveTo(10, -18, 9, -21);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(12, -22);
      ctx.quadraticCurveTo(5, -23 + hairWave, -4, -18 + hairWave);
      ctx.quadraticCurveTo(-14, -10 + hairWave * 1.5, -24, -8 + hairWave * 2);
      ctx.quadraticCurveTo(-15, -4 + hairWave, -5, -8 + hairWave);
      ctx.quadraticCurveTo(4, -12, 10, -13);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, -21);
      ctx.quadraticCurveTo(2, -18 + hairWave, -6, -12 + hairWave);
      ctx.quadraticCurveTo(-16, -5 + hairWave * 1.4, -28, -2 + hairWave * 2);
      ctx.quadraticCurveTo(-18, 1 + hairWave, -7, -3 + hairWave);
      ctx.quadraticCurveTo(2, -7, 8, -12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(12, -21);
      ctx.quadraticCurveTo(4, -20 + hairWave, -8, -14 + hairWave);
      ctx.stroke();

      // 8. Pearl / Coral Tiara Headpiece
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(14, -22);
      ctx.lineTo(16, -24.5);
      ctx.lineTo(17.5, -22);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(16, -23, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return true;
    }

    default:
      return false;
  }
}

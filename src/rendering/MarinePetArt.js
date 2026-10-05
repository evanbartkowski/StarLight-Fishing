// Illustrated Art rendering for Marine Companion Pets (Dolphin & Shark)
// Faithfully matches user-provided reference illustrations with natural swimming sway

const SHARK_PIXELS = [
  '........DBBBB...........',
  '.........DBBBBB.........',
  '..........DBBBBBBBB....',
  '..........DBBBBBBBBBB..',
  'BBB.....BBBBBBBBBBBBBBB.',
  '.BBB..DBBBBBBBBBBBBBBBBB',
  '..BBDDBBBBDBDBBBBBBBBBBB',
  '..BBBBBBDBDBDB#BBBBBBB..',
  '..BD.DDDBBBBBBBBBBBBBB..',
  '..BD....DDDBBBBRRBBB...',
  '..D........BBBBBBBDD....',
  '...........BBB...DDD....',
  '...........BB.....DD....',
  '...........B.......D....',
];

const SHARK_PALETTE = {
  '#': '#0f172a', // Cute black eye
  'R': '#ef4444', // Cute red blush cheek / mouth
  'B': '#5587c1', // Gentle oceanic blue body
  'D': '#3b73ab', // Darker blue fin & shading
  'W': '#ffffff', // Subtle white highlight
  '.': null,
};

export function drawMarinePet(ctx, kind, time = 0) {
  const isDolphin = kind === 'dolphin';

  ctx.save();
  if (isDolphin) {
    // Gracie the Bottlenose Dolphin matching user's reference illustration:
    // Sleek periwinkle-blue body (#6583be), gentle bottle snout, rounded melon forehead,
    // graceful falcate dorsal fin, white chest/pectoral flipper with clean dark outline,
    // cute dark eye, and fluked tail with fluid undulating swimming motion.
    const swimWave = Math.sin(time * 5.0);
    const tailFlukeWave = Math.sin(time * 5.0 - 0.7);

    ctx.save();
    // Smooth undulation of tail relative to head
    ctx.rotate(swimWave * 0.06);

    // 1. Pectoral flipper on chest (underbelly side, white with thin dark outline)
    ctx.save();
    ctx.translate(-2, 10);
    ctx.rotate(0.35 + swimWave * 0.12);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, 14, 13, 17);
    ctx.quadraticCurveTo(8, 14, 4, 3);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#222831';
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    // 2. Main Dolphin Body (#6583be)
    // Snout at (+36, 0), Melon at (+28, -6), Dorsal fin at (-4, -18), Tail stock at (-36, +1), Flukes at (-46, +1)
    ctx.beginPath();
    // Start at bottom of beak / mouth
    ctx.moveTo(34, 3);
    // Tip of snout
    ctx.lineTo(40, 2);
    // Upper beak into melon curve
    ctx.quadraticCurveTo(36, -2, 30, -5);
    // Melon into back
    ctx.quadraticCurveTo(20, -10, 6, -10);
    // Leading edge of falcate dorsal fin
    ctx.quadraticCurveTo(0, -18, -2, -22);
    // Trailing curved edge of dorsal fin back to spine
    ctx.quadraticCurveTo(-2, -14, -8, -9);
    // Dorsal spine towards tail stock with swimming flex
    const tailY = tailFlukeWave * 4.5;
    ctx.quadraticCurveTo(-24, -8 + tailY * 0.5, -36, -3 + tailY);
    // Upper fluke tip
    ctx.quadraticCurveTo(-40, -10 + tailY, -46, -11 + tailY);
    // Fluke inner curve / notch
    ctx.quadraticCurveTo(-41, -2 + tailY, -39, 0 + tailY);
    // Lower fluke tip
    ctx.quadraticCurveTo(-41, 6 + tailY, -45, 9 + tailY);
    // Lower fluke return to ventral tail stock
    ctx.quadraticCurveTo(-38, 5 + tailY, -34, 3 + tailY);
    // Underbelly towards chest
    ctx.quadraticCurveTo(-18, 9, 4, 10);
    // Ventral throat towards jaw
    ctx.quadraticCurveTo(20, 8, 30, 4);
    ctx.closePath();

    ctx.fillStyle = '#6583be';
    ctx.fill();

    // Subtle natural dorsal shading / highlight
    const bodyGrad = ctx.createLinearGradient(0, -22, 0, 10);
    bodyGrad.addColorStop(0, '#7594d2');
    bodyGrad.addColorStop(0.7, '#6583be');
    bodyGrad.addColorStop(1, '#5370ab');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // 3. Crisp outline matching clean cartoon line-art
    ctx.strokeStyle = '#222831';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // 4. Subtle fluke median line detail
    ctx.beginPath();
    ctx.moveTo(-36, 0 + tailY);
    ctx.lineTo(-40, 0 + tailY);
    ctx.strokeStyle = '#222831';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // 5. Cute dark eye (small round pupil placed naturally behind melon)
    ctx.beginPath();
    ctx.arc(20, -1, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#1e232a';
    ctx.fill();

    // 6. Subtle gentle mouth slit
    ctx.beginPath();
    ctx.moveTo(34, 2);
    ctx.lineTo(29, 3);
    ctx.strokeStyle = '#222831';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  } else {
    // Shark Companion
    const pxSize = 2.0;
    const cols = 24;
    const rows = 14;
    const ox = -(cols * pxSize) / 2;
    const oy = -(rows * pxSize) / 2;

    for (let r = 0; r < rows; r++) {
      const line = SHARK_PIXELS[r];
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        const color = SHARK_PALETTE[char];
        if (color) {
          // Trailing tail fin (left columns 0..6) sways gently
          const swayFactor = c <= 6 ? (7 - c) / 7 : 0;
          const sway = Math.sin(time * 6 + c * 0.3) * 2.2 * swayFactor;

          ctx.fillStyle = color;
          ctx.fillRect(ox + c * pxSize, oy + r * pxSize + sway, pxSize, pxSize);
        }
      }
    }
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

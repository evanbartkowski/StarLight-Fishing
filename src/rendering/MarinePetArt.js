// Authentic Pixel Art rendering for Marine Companion Pets (Dolphin & Shark)
// Faithfully matches user-provided pixel art references with animated swimming sway

const DOLPHIN_PIXELS = [
  '..........####............',
  '.........#LLLB#...........',
  '........#LLLLBB#..........',
  '..###...#LLLLBBB######....',
  '.#DDD###LLLLBBBBBBBBBB#...',
  '#DDDDD#LLLLBBBB#WBBBBBB###',
  '.#DDDDD#LLLBBB##BBBBBBBBBB',
  '..##DDD#BBBBBBBBBBBBBB###.',
  '...#DDD#BBBCCCCBBBBBB#....',
  '..#DDDD#BBBCCCCBBBDD#.....',
  '.#DDDDD#DDBBBCCBDDDD#.....',
  '#DDDD##.##DDDDDDDDD#......',
  '..###.....#########.......',
];

const DOLPHIN_PALETTE = {
  '#': '#000000', // Crisp black border outline
  'B': '#2196f3', // Vibrant aquatic blue body
  'L': '#03a9f4', // Lighter cyan back / melon highlight
  'W': '#ffffff', // Pure white eye glint
  'C': '#00bcd4', // Bright cyan chest flipper
  'D': '#3f51b5', // Deep indigo underbelly & tail flukes
};

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
    const pxSize = 2.0;
    const cols = 26;
    const rows = 13;
    const ox = -(cols * pxSize) / 2;
    const oy = -(rows * pxSize) / 2;

    for (let r = 0; r < rows; r++) {
      const line = DOLPHIN_PIXELS[r];
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        const color = DOLPHIN_PALETTE[char];
        if (color) {
          // Flowing horizontal swimming wave from snout to flukes
          const wavePhase = time * 5.5 + c * 0.28;
          const tailInfluence = c < 15 ? (15 - c) / 15 : 0;
          const waveY = Math.sin(wavePhase) * (tailInfluence * 2.8 + 0.35);
          ctx.fillStyle = color;
          ctx.fillRect(ox + c * pxSize, oy + r * pxSize + waveY, pxSize, pxSize);
        }
      }
    }
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

// Reuse small glow textures instead of allocating gradients for every fish/frame.
const textures = new Map();
const motion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
const SIZE = 128;
const LIMIT = 32;

function texture(color) {
  if (textures.has(color)) return textures.get(color);
  const canvas = globalThis.document?.createElement('canvas');
  if (!canvas) return null;
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.25, color);
  gradient.addColorStop(1, `${color}00`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);
  if (textures.size >= LIMIT) textures.delete(textures.keys().next().value);
  textures.set(color, canvas);
  return canvas;
}

export function auraFrame(time, reducedMotion = motion?.matches ?? false) {
  const t = reducedMotion ? 0 : time;
  return {
    scale: 1 + Math.sin(t * 1.65) * 0.075,
    blend: 0.22 + Math.sin(t * 0.85) * 0.12,
    x: reducedMotion ? 0 : Math.cos(t * 0.7) * 2.5,
    y: reducedMotion ? 0 : Math.sin(t * 0.7) * 1.5,
  };
}

export function drawAura(ctx, time, color, radius, aspect = 0.7) {
  // Catalog colors are six-digit hex. Keep invalid/legacy colors harmless.
  const base = /^#[\da-f]{6}$/i.test(color) ? color : '#c084fc';
  const glow = texture(base);
  if (!glow) return;
  const accent = texture('#bdefff');
  const frame = auraFrame(time);
  const size = radius * frame.scale;
  ctx.save();
  ctx.translate(frame.x, frame.y);
  ctx.scale(1, aspect);
  const alpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha * (0.5 - frame.blend * 0.2);
  ctx.drawImage(glow, -size, -size, size * 2, size * 2);
  ctx.globalAlpha = alpha * frame.blend * 0.35;
  ctx.drawImage(accent, -size * 0.88, -size * 0.88, size * 1.76, size * 1.76);
  ctx.restore();
}

// Unwind every nested save if an effect fails, including its clipping region.
export function withCanvasState(ctx, draw) {
  const save = ctx.save, restore = ctx.restore;
  let depth = 0;
  ctx.save = () => { save.call(ctx); depth++; };
  ctx.restore = () => { if (depth > 1) { restore.call(ctx); depth--; } };
  try {
    ctx.save();
    return draw();
  } finally {
    while (depth > 0) { restore.call(ctx); depth--; }
    ctx.save = save;
    ctx.restore = restore;
  }
}

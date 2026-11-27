// Non-fish catches share the hook's actual curve rather than drawing extra wires.
// Refresh during rendering too: the rod tip can move after the entity update.
export function positionLineAttachment(item) {
  const hook = item.hook;
  if (!hook) return;
  const distance = 28 + (item.hookIndex || 0) * 30;
  const tip = hook.rodTip || { x: hook.x, y: hook.y - 1000 };
  const point = hook.getLinePointAbove?.(distance, tip.x, tip.y);
  item.x = point?.x ?? hook.x;
  item.y = point?.y ?? hook.y - distance;
}

/** Pointer capture keeps controls responsive when a finger leaves a button. */
export function createTouchControls(keys, reel) {
  const controls = document.createElement('nav');
  controls.id = 'touch-controls'; controls.setAttribute('aria-label', 'Fishing controls');
  controls.innerHTML = '<button data-key="arrowleft" aria-label="Steer left">◀</button><button data-key="arrowright" aria-label="Steer right">▶</button><button data-key=" " aria-label="Reel in">Reel</button>';
  document.body.appendChild(controls);
  const reset = () => controls.querySelectorAll('button').forEach(button => { keys[button.dataset.key] = false; });
  controls.querySelectorAll('button').forEach(button => {
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); button.setPointerCapture(event.pointerId);
      keys[button.dataset.key] = true;
      if (button.dataset.key === ' ') reel();
    });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, () => { keys[button.dataset.key] = false; });
  });
  window.addEventListener('blur', reset);
  return { update(active) { controls.hidden = !active; if (!active) reset(); } };
}

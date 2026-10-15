/** 
 * Mobile Touch Controls: Single fluid touch follow-your-finger steering on canvas,
 * with a sleek floating "Reel" button for manual early reel-up.
 */
export function createTouchControls(keys, reel) {
  const controls = document.createElement('nav');
  controls.id = 'touch-controls';
  controls.setAttribute('aria-label', 'Fishing controls');
  controls.innerHTML = '<button data-key=" " class="touch-reel-btn" aria-label="Reel in">🎣 Reel</button>';
  document.body.appendChild(controls);
  const reset = () => controls.querySelectorAll('button').forEach(button => { keys[button.dataset.key] = false; });
  controls.querySelectorAll('button').forEach(button => {
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      keys[button.dataset.key] = true;
      if (button.dataset.key === ' ') reel();
    });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(name, () => { keys[button.dataset.key] = false; });
    }
  });
  window.addEventListener('blur', reset);
  return { update(active) { controls.hidden = !active; if (!active) reset(); } };
}

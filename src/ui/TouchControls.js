/** 
 * Mobile Touch Controls: Single fluid touch follow-your-finger steering on canvas,
 * with a sleek floating "Reel" button for manual early reel-up.
 */
export const REEL_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 10l7-7 7 7M12 3v11a5 5 0 0 1-10 0v-2l3 2"/><path d="M16 15h5m-2-3 3 3-3 3"/></svg>';

export function createTouchControls(reel) {
  const controls = document.createElement('nav');
  controls.id = 'touch-controls';
  controls.hidden = true;
  controls.setAttribute('aria-label', 'Fishing controls');
  controls.innerHTML = `<button type="button" data-key=" " class="touch-reel-btn" aria-label="Reel up to the boat">${REEL_ICON}<span>Reel Up</span></button>`;
  document.body.appendChild(controls);
  const button = controls.querySelector('button');
  button.addEventListener('click', event => {
    event.preventDefault(); event.stopPropagation(); reel();
  });
  return { update(active) { if (controls.hidden === active) controls.hidden = !active; } };
}

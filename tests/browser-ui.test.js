import test from 'node:test';
import assert from 'node:assert/strict';
import { GameLoop } from '../src/GameLoop.js';

test('modal render pacing preserves simulation updates and resumes full-speed drawing immediately', () => {
  const previousRAF = globalThis.requestAnimationFrame, previousCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  try {
    let updates = 0, renders = 0, interval = 1000 / 15;
    const loop = new GameLoop(() => updates++, () => renders++, () => interval);
    loop.start();
    for (let frame = 0; frame <= 60; frame++) loop.mainLoop(frame * 1000 / 60);
    assert.ok(updates >= 59 && updates <= 60, 'the simulation must retain its fixed timestep');
    assert.ok(renders >= 14 && renders <= 16, `modal pacing rendered ${renders} frames, expected about 15`);
    const before = renders; interval = 0;
    loop.mainLoop(61 * 1000 / 60); loop.mainLoop(62 * 1000 / 60);
    assert.equal(renders, before + 2, 'closing a modal must resume drawing on the next frame');
    loop.stop(); loop.start(); loop.mainLoop(2000); loop.mainLoop(2017);
    assert.equal(renders, before + 3, 'restart must not inherit a render delay');
  } finally { globalThis.requestAnimationFrame = previousRAF; globalThis.cancelAnimationFrame = previousCancel; }
});

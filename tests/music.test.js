import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.Audio = class { pause() {} };
const { SoundManager } = await import('../src/audio/SoundManager.js');

test('each realm plays its own melody and changing realms retires the old scheduler', () => {
  const oldInterval = globalThis.setInterval;
  const oldClear = globalThis.clearInterval;
  const oldTimeout = globalThis.setTimeout;
  const timers = new Set();
  const notes = [];
  let nextTimer = 0;
  globalThis.setInterval = callback => { const timer = { id: nextTimer++, callback }; timers.add(timer); return timer; };
  globalThis.clearInterval = timer => timers.delete(timer);
  globalThis.setTimeout = callback => { callback(); return 0; };
  const parameter = () => ({ value: 0, setValueAtTime(value) { this.value = value; }, linearRampToValueAtTime(value) { this.value = value; }, exponentialRampToValueAtTime(value) { this.value = value; } });
  const audio = {
    currentTime: 0, state: 'running', destination: {},
    createGain: () => ({ gain: parameter(), connect() {}, disconnect() {} }),
    createOscillator: () => ({ frequency: { setValueAtTime: value => notes.push(value) }, connect() {}, disconnect() {}, start() {}, stop() {} }),
  };
  try {
    const sound = new SoundManager();
    sound.initialized = true;
    sound.audioCtx = audio;
    sound.currentMusicMode = 'surface';
    const melodies = new Set();
    for (let realm = 1; realm <= 7; realm++) {
      notes.length = 0;
      sound.setSeaTrack(realm);
      assert.equal(timers.size, 1);
      const timer = [...timers][0];
      for (let beat = 0; beat < 15; beat++) timer.callback();
      melodies.add(JSON.stringify(notes));
    }
    assert.equal(melodies.size, 7);
    sound.setMuted(true);
    assert.equal(sound.seaGain.gain.value, 0);
    sound.setMuted(false);
    sound.setMusicVolume(0.3);
    assert.equal(sound.seaGain.gain.value, 0.3 * 0.38);
    sound.activeStation = 'radio';
    sound.applyVolumes();
    assert.equal(sound.seaGain.gain.value, 0);
    sound.activeStation = null;
    sound.setMusicMode('underwater');
    assert.equal(timers.size, 1);
    assert.ok(sound.seaGain.gain.value > 0);
  } finally {
    globalThis.setInterval = oldInterval;
    globalThis.clearInterval = oldClear;
    globalThis.setTimeout = oldTimeout;
  }
});

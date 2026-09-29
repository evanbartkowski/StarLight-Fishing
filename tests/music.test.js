import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.Audio = class {
  constructor(src) { this.src = src; this.paused = true; }
  pause() { this.paused = true; }
  play() { this.paused = false; return Promise.resolve(); }
};
const { SoundManager } = await import('../src/audio/SoundManager.js');
test('original starter music returns; realms and radio play mutually exclusive recordings', () => {
  const sound = new SoundManager();
  sound.initialized = true;
  sound.setMusicMode('surface');
  assert.equal(sound.surfaceMusic.paused, false);
  assert.equal(sound.surfaceMusic.src, '/sprites/seamusic.mp3');
  sound.setMusicMode('underwater');
  assert.equal(sound.surfaceMusic.paused, true);
  assert.equal(sound.underwaterMusic.paused, false);
  const sources = new Set();
  for (let realm = 2; realm <= 7; realm++) {
    sound.setSeaTrack(realm);
    assert.equal(sound.underwaterMusic.paused, true);
    const playing = [...sound.realmTracks.values()].filter(track => !track.paused);
    assert.equal(playing.length, 1);
    sources.add(playing[0].src);
  }
  assert.equal(sources.size, 6);
  sound.startRadioStation('harbor_breeze');
  assert.equal(sound.radioTrack.paused, false);
  assert.equal([...sound.realmTracks.values()].every(track => track.paused), true);
  sound.setSeaTrack(3);
  assert.equal(sound.radioTrack.paused, false);
  sound.setMuted(true);
  assert.equal(sound.radioTrack.volume, 0);
  sound.setMuted(false);
  sound.stopRadioStation();
  assert.equal(sound.realmTracks.get(3).paused, false);
  sound.setMusicMode('none');
  assert.ok([...sound.realmTracks.values()].every(track => track.paused));
});

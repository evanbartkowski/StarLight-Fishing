import { REALM_MUSIC } from './RealmMusic.js';

const createAudioElement = (src) => {
  if (typeof Audio !== 'undefined') {
    try {
      return new Audio(src);
    } catch (_) {}
  }
  return {
    src,
    volume: 1,
    loop: false,
    paused: true,
    currentTime: 0,
    addEventListener() {},
    play() { return Promise.resolve(); },
    pause() {},
    load() {},
  };
};

// Web Audio API procedural sound synthesizer + HTML5 Audio music manager
export class SoundManager {
  constructor() {
    this.audioCtx = null;
    let savedMuted = false;
    try {
      if (typeof localStorage !== 'undefined') {
        const rawSave = localStorage.getItem('starlight_fishing_save');
        if (rawSave) {
          const parsed = JSON.parse(rawSave);
          if (parsed?.settings && typeof parsed.settings.isMuted === 'boolean') {
            savedMuted = parsed.settings.isMuted;
          }
        }
      }
    } catch (_) {}
    this.isMuted = savedMuted;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.5;

    // HTML5 Audio tracks
    this.surfaceMusic = createAudioElement("/sprites/seamusic.mp3");
    this.underwaterMusic = createAudioElement("/sprites/oceanmusic2.mp3");
    this.bubbleSfx = createAudioElement("/sprites/bubble.mp3");
    this.bubbleSfx2 = createAudioElement("/sprites/bubble2.mp3");

    this.surfaceMusic.loop = false;
    this.underwaterMusic.loop = false;

    // Realm 1 (Sunlit Shoals) alternates between its main theme and the former Whispering Aether Sea song in a loop
    this.underwaterMusic.addEventListener?.('ended', () => {
      if (this.currentSeaId === 1 && this.currentMusicMode === 'underwater' && !this.isMuted && !this.activeStation) {
        const curSrc = this.underwaterMusic.src || '';
        const nextSrc = curSrc.includes('faespencer-island-heartbeat-211013.mp3')
          ? '/sprites/oceanmusic2.mp3'
          : '/music/faespencer-island-heartbeat-211013.mp3';
        this.underwaterMusic.src = nextSrc;
        this.underwaterMusic.currentTime = 0;
        this.applyVolumes();
        this.underwaterMusic.play?.()?.catch?.(() => {});
      }
    });
    this.surfaceMusic.addEventListener?.('ended', () => {
      if (this.currentSeaId === 1 && this.currentMusicMode === 'surface' && !this.isMuted && !this.activeStation) {
        const curSrc = this.surfaceMusic.src || '';
        const nextSrc = curSrc.includes('faespencer-island-heartbeat-211013.mp3')
          ? '/sprites/seamusic.mp3'
          : '/music/faespencer-island-heartbeat-211013.mp3';
        this.surfaceMusic.src = nextSrc;
        this.surfaceMusic.currentTime = 0;
        this.applyVolumes();
        this.surfaceMusic.play?.()?.catch?.(() => {});
      }
    });
    this.underwaterMusic.addEventListener?.('error', () => {
      if (this.currentSeaId === 1 && this.currentMusicMode === 'underwater' && !this.isMuted && !this.activeStation) {
        try {
          this.underwaterMusic.src = '/sprites/oceanmusic2.mp3';
          this.underwaterMusic.load?.();
          this.underwaterMusic.play?.()?.catch?.(() => {});
        } catch (_) {}
      }
    });

    this.currentMusicMode = null; // 'surface' | 'underwater' | 'none'
    this.initialized = false;

    // Ambient procedural noise nodes
    this.ambientRainGain = null;
    this.ambientSurfGain = null;

    // Coastal Radio & procedural stations
    this.activeStation = null;
    this.radioGain = null;
    this.radioNodes = [];
    this.radioTimers = [];

    // Seven Fantasy Seas procedural soundscapes
    this.currentSeaId = 1;
    const sm = this;
    class RealmTracksMap extends Map {
      get(key) {
        if (typeof key === 'number') {
          return sm.getTrackForMode(key, sm.currentMusicMode || 'surface');
        }
        return super.get(key);
      }
      has(key) {
        if (typeof key === 'number') {
          return super.has(`${key}_underwater`) || super.has(`${key}_surface`);
        }
        return super.has(key);
      }
    }
    this.realmTracks = new RealmTracksMap();
    this.radioTrack = null;
    this.seaGain = null;
    this.seaNodes = [];
    this.seaTimers = [];

    // Endgame Special Music & Synth
    this.endgameTrack = null;
    this.endgameGain = null;
    this.endgameNodes = [];
    this.endgameTimers = [];
    this.isEndgameActive = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        this.setupProceduralAmbience();
      }
      this.initialized = true;
      this.applyVolumes();
    } catch (e) {
      console.warn("AudioContext not supported or blocked:", e);
    }
  }

  ensureAudio() {
    if (!this.initialized) {
      this.init();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  unlockActiveMusicOnGesture() {
    this.ensureAudio();
    if (this.isEndgameActive || this.isMuted || this.activeStation) return;
    // Pre-initialize the active sea's underwater track during user gestures so it is buffered and ready when the hook hits the water
    const underTrack = this.getTrackForMode(this.currentSeaId, 'underwater');
    if (underTrack && underTrack.paused && underTrack.readyState === 0) {
      try { underTrack.load?.(); } catch (_) {}
    }
    if (this.currentMusicMode === 'underwater' || this.currentMusicMode === 'surface') {
      const activeTrack = this.getTrackForMode(this.currentSeaId, this.currentMusicMode);
      if (activeTrack && activeTrack.paused) {
        const vol = this.musicVolume * this.getTrackScale(activeTrack.src, this.currentMusicMode);
        if (!this._fadeInterval) activeTrack.volume = vol;
        activeTrack.play?.()?.catch?.(() => {});
      }
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    this.applyVolumes();
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this.applyVolumes();
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.applyVolumes();
  }

  // Per-track loudness normalization so no realm is way louder than others
  getTrackScale(src = '', mode = 'surface') {
    const s = String(src);
    if (s.includes('endgame-finale')) return 0.38;
    if (s.includes('chrono-void-fishing')) return 0.36;
    if (s.includes('onecinematicstudio')) return 0.26;
    if (s.includes('desifreemusic')) return 0.27;
    if (s.includes('tropical.mp3')) return 0.26;
    if (s.includes('ocean-vibes.mp3')) return 0.26;
    if (s.includes('peaceful.mp3')) return 0.30;
    if (s.includes('faespencer-island-heartbeat')) return 0.31;
    if (s.includes('aether-ethereal-1')) return 0.33;
    if (s.includes('aether-ethereal-2')) return 0.33;
    if (s.includes('realm2-second-song')) return 0.32;
    if (s.includes('juliush-relax')) return 0.32;
    if (s.includes('alex-morgan-underwater-dreamscape')) return 0.34;
    if (s.includes('aquarain.mp3')) return 0.33;
    if (s.includes('meditation.mp3')) return 0.35;
    if (s.includes('oceanmusic2.mp3')) return 0.36;
    if (s.includes('seamusic.mp3')) return 0.34;
    return mode === 'underwater' ? 0.34 : 0.32;
  }

  applyVolumes() {
    const vol = this.isMuted ? 0 : this.musicVolume;
    for (const [key, track] of this.realmTracks?.entries() || []) {
      const mode = String(key).endsWith('_underwater') ? 'underwater' : 'surface';
      track.volume = vol * this.getTrackScale(track.src, mode);
    }
    if (this.radioTrack) {
      this.radioTrack.volume = vol * this.getTrackScale(this.radioTrack.src, 'surface');
    }
    this.surfaceMusic.volume = vol * this.getTrackScale(this.surfaceMusic.src, 'surface');
    this.underwaterMusic.volume = vol * this.getTrackScale(this.underwaterMusic.src, 'underwater');
    this.bubbleSfx.volume = this.isMuted ? 0 : this.sfxVolume * .28 * 0.5;
    this.bubbleSfx2.volume = this.isMuted ? 0 : this.sfxVolume * .28 * 0.5;

    if (this.ambientSurfGain && this.audioCtx) {
      this.ambientSurfGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.08, this.audioCtx.currentTime);
    }
    if (this.radioGain && this.audioCtx) {
      this.radioGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.34, this.audioCtx.currentTime);
    }
    if (this.seaGain && this.audioCtx) {
      this.seaGain.gain.setValueAtTime(this.isMuted || this.activeStation || this.currentMusicMode === 'none' ? 0 : this.musicVolume * 0.28, this.audioCtx.currentTime);
    }
    if (this.endgameTrack) {
      this.endgameTrack.volume = vol * this.getTrackScale(this.endgameTrack.src, 'surface');
    }
    if (this.endgameGain && this.audioCtx) {
      this.endgameGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.35, this.audioCtx.currentTime);
    }
  }

  getTrackForMode(seaId, mode) {
    const id = Number(seaId) || 1;
    const isUnderwater = mode === 'underwater';
    if (id === 1) {
      return isUnderwater ? this.underwaterMusic : this.surfaceMusic;
    }
    const key = `${id}_${isUnderwater ? 'underwater' : 'surface'}`;
    if (!this.realmTracks.has(key)) {
      const surfaceTracks = {
        2: '/music/aquarain.mp3',
        3: '/music/meditation.mp3',
        4: '/music/peaceful.mp3',
        5: '/music/aether-ethereal-1.mp3',
        6: '/music/tropical.mp3',
        7: '/music/ocean-vibes.mp3',
      };
      const fishingTracks = {
        2: '/music/juliush-relax-chill-out-music-for-landscapes-under-water-animals-forests-8105.mp3',
        3: '/music/alex-morgan-underwater-dreamscape-537486.mp3',
        4: '/music/onecinematicstudio-the-lost-city-of-atlantis-_-mystical-underwater-cinematic-music-529056.mp3',
        5: '/music/aether-ethereal-2.mp3',
        6: '/music/desifreemusic-ocean-documentary-background-music-with-calm-cinematic-ambience-569283.mp3',
        7: '/music/chrono-void-fishing.mp3',
      };
      const primarySrc = isUnderwater ? (fishingTracks[id] || '/music/chrono-void-fishing.mp3') : (surfaceTracks[id] || '/music/aquarain.mp3');
      const audio = createAudioElement(primarySrc);
      // Realm 2 (Twilight Kelp Forest) and Realm 5 (Whispering Aether Sea) loop by alternating between 2 songs
      audio.loop = id !== 2 && id !== 5;
      audio.preload = 'auto';
      // Only alternating multi-track playlists (Realm 2 & 5) need manual track alternation on ended;
      // standard single-track realms loop natively and cleanly via audio.loop = true without premature restart hitches.
      if (id === 2 || id === 5) {
        audio.addEventListener?.('ended', () => {
          if (this.currentMusicMode === (isUnderwater ? 'underwater' : 'surface') && this.currentSeaId === id && !this.isMuted && !this.activeStation) {
            if (id === 2) {
              const curSrc = audio.src || '';
              audio.src = curSrc.includes('realm2-second-song.mp3')
                ? primarySrc
                : '/music/realm2-second-song.mp3';
              this.applyVolumes();
            } else if (id === 5) {
              const curSrc = audio.src || '';
              audio.src = curSrc.includes('aether-ethereal-1.mp3')
                ? '/music/aether-ethereal-2.mp3'
                : '/music/aether-ethereal-1.mp3';
              this.applyVolumes();
            }
            audio.currentTime = 0;
            audio.play?.()?.catch?.(() => {});
          }
        });
      }
      this.realmTracks.set(key, audio);
    }
    return this.realmTracks.get(key);
  }

  setMusicMode(mode) {
    if (this.isEndgameActive && mode !== 'none') return;
    const prevMode = this.currentMusicMode;
    if (prevMode === mode) return;
    this.currentMusicMode = mode;
    if (prevMode && (mode === 'surface' || mode === 'underwater') && (prevMode === 'surface' || prevMode === 'underwater')) {
      if (!this.activeStation) {
        this.crossfadeMode(prevMode, mode, this.currentSeaId);
        return;
      }
    }
    this.setSeaTrack(this.currentSeaId);
  }

  crossfadeRealm1(fromMode, toMode) {
    return this.crossfadeMode(fromMode, toMode, 1);
  }

  crossfadeMode(fromMode, toMode, seaId = 1) {
    if (this.isEndgameActive) return;
    if (this._fadeInterval) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
    }

    const fromTrack = this.getTrackForMode(seaId, fromMode);
    const toTrack = this.getTrackForMode(seaId, toMode);
    if (!fromTrack || !toTrack || fromTrack === toTrack) {
      this.syncRecordedMusic();
      return;
    }

    // Ensure any other non-participating tracks are paused if an earlier crossfade was interrupted
    if (this.surfaceMusic !== fromTrack && this.surfaceMusic !== toTrack) this.surfaceMusic.pause?.();
    if (this.underwaterMusic !== fromTrack && this.underwaterMusic !== toTrack) this.underwaterMusic.pause?.();
    for (const track of this.realmTracks.values()) {
      if (track !== fromTrack && track !== toTrack) track.pause?.();
    }

    const vol = this.isMuted ? 0 : this.musicVolume;
    const targetVol = vol * this.getTrackScale(toTrack.src, toMode);

    // Node.js test runner / headless environment: immediate synchronous pause/play
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
      fromTrack.pause?.();
      toTrack.volume = targetVol;
      toTrack.play?.()?.catch?.(() => {});
      return;
    }

    // Browser runtime: smooth 1.2s crossfade transition
    toTrack.volume = 0;
    if (toTrack.paused) {
      toTrack.play?.()?.catch?.(() => {});
    }

    const startTime = performance.now();
    const duration = 1200;
    const startFromVol = fromTrack.volume || 0;
    const targetSeaId = Number(seaId) || 1;

    this._fadeInterval = setInterval(() => {
      if (this.isEndgameActive || this.currentMusicMode !== toMode || this.currentSeaId !== targetSeaId) {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
        return;
      }
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);

      if (!this.isMuted) {
        fromTrack.volume = Math.max(0, startFromVol * (1 - ease));
        toTrack.volume = targetVol * ease;
      }

      if (progress >= 1) {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
        fromTrack.pause?.();
        if (!this.isMuted) {
          toTrack.volume = targetVol;
          if (toTrack.paused && !this.activeStation) {
            toTrack.play?.()?.catch?.(() => {});
          }
        }
      }
    }, 25);
  }

  keepAliveUnderwaterMusic() {
    if (this.isEndgameActive) return;
    if (this._fadeInterval) return;
    if (this.currentMusicMode === 'underwater' && !this.isMuted && !this.activeStation) {
      const track = this.getTrackForMode(this.currentSeaId, 'underwater');
      if (!track) return;
      const vol = this.musicVolume * this.getTrackScale(track?.src, 'underwater');
      if (track.paused) {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        if (!this._lastKeepAliveAttempt || (now - this._lastKeepAliveAttempt > 1500)) {
          this._lastKeepAliveAttempt = now;
          track.volume = vol;
          track.play?.()?.catch?.(() => {});
        }
      } else if (track.volume <= 0.05) {
        track.volume = vol;
      }
    }
  }

  syncRecordedMusic() {
    if (this.isEndgameActive) return;
    if (this._fadeInterval) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
    }
    const shouldPlay = !this.activeStation && this.currentMusicMode && this.currentMusicMode !== 'none';
    const targetTrack = shouldPlay ? this.getTrackForMode(this.currentSeaId, this.currentMusicMode) : null;
    if (this.surfaceMusic !== targetTrack) this.surfaceMusic.pause?.();
    if (this.underwaterMusic !== targetTrack) this.underwaterMusic.pause?.();
    for (const track of this.realmTracks.values()) {
      if (track !== targetTrack) track.pause?.();
    }
    if (!targetTrack) return;
    this.applyVolumes();
    if (targetTrack.paused) {
      targetTrack.play?.()?.catch?.(() => {});
    }
  }

  // Pure Web Audio API: Procedural Soft Ambient Water & Rain Loops
  setupProceduralAmbience() {
    if (!this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate soft pinkish noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.08;
      }

      // 1. Gentle Ocean Surf Waves (Lowpass filtered noise with LFO)
      const surfSource = ctx.createBufferSource();
      surfSource.buffer = noiseBuffer;
      surfSource.loop = true;

      const surfFilter = ctx.createBiquadFilter();
      surfFilter.type = 'lowpass';
      surfFilter.frequency.setValueAtTime(320, ctx.currentTime);

      this.ambientSurfGain = ctx.createGain();
      this.ambientSurfGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06, ctx.currentTime);

      // Slow ocean breathing LFO (cycles every 4 seconds)
      const surfLfo = ctx.createOscillator();
      surfLfo.frequency.setValueAtTime(0.25, ctx.currentTime);
      const surfLfoGain = ctx.createGain();
      surfLfoGain.gain.setValueAtTime(0.04, ctx.currentTime);

      surfLfo.connect(surfLfoGain);
      surfLfoGain.connect(this.ambientSurfGain.gain);

      surfSource.connect(surfFilter);
      surfFilter.connect(this.ambientSurfGain);
      this.ambientSurfGain.connect(ctx.destination);

      surfSource.start();
      surfLfo.start();

      // 2. Soft Calming Rain Loop
      const rainSource = ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.setValueAtTime(1400, ctx.currentTime);
      rainFilter.Q.setValueAtTime(0.8, ctx.currentTime);

      this.ambientRainGain = ctx.createGain();
      this.ambientRainGain.gain.setValueAtTime(0, ctx.currentTime); // Starts off until rain weather

      rainSource.connect(rainFilter);
      rainFilter.connect(this.ambientRainGain);
      this.ambientRainGain.connect(ctx.destination);

      rainSource.start();
    } catch (e) {
      console.warn("Could not start procedural ambience:", e);
    }
  }

  setWeatherAudio(weather) {
    if (!this.audioCtx || !this.ambientRainGain) return;
    const now = this.audioCtx.currentTime;
    const targetRainVol = (weather === 'RAIN' && !this.isMuted) ? this.sfxVolume * .28 * 0.14 : 0;
    this.ambientRainGain.gain.setTargetAtTime(targetRainVol, now, 1.5);
  }

  // Distinct Two-Tone Celestial Chime (Plays when Rare/Legendary approaches or bites)
  playRareChime() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const chimeFrequencies = [587.33, 880.0]; // D5 -> A5 pure fifth interval

    chimeFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);

      gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.35, now + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.16 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 1.25);
    });
  }

  playDivineChime() {
    this.ensureAudio();
    if (!this.audioCtx || this.isMuted) return;
    const ctx = this.audioCtx, now = ctx.currentTime;
    [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator(), gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, now);
      const start = now + index * .13;
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * .10, start + .03);
      gain.gain.exponentialRampToValueAtTime(.0001, start + 2.2);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + 2.25);
    });
  }

  // Harmonic Sweet-Spot Pulse (Plays during rhythmic lull window of legend reeling)
  playRhythmSweetSpot() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5 harmonic
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Procedural Trap Harvest sound (gentle wood rattle & coin chime)
  playTrapHarvest() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Woodblock tap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    // Coin shimmer
    this.playCoin();
  }

  // Procedural Sound Effects via Web Audio API
  playCast() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  playSplash() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  playCatch(rarity = 'common') {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    let frequencies = [440, 554.37, 659.25];
    if (rarity === 'rare') frequencies = [523.25, 659.25, 783.99, 1046.5];
    if (rarity === 'epic') frequencies = [440, 554.37, 659.25, 880, 1108.73];
    if (rarity === 'legendary') frequencies = [587.33, 739.99, 880, 1174.66, 1479.98];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.35, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.25);
    });
  }

  playHazardShock() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playTreasure() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const notes = [587.33, 880, 1174.66];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.35, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.4);
    });
  }

  playCoin() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playButtonClick() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playUpgrade() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.35, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.3);
    });
  }

  playReelClick(speed = 1.0) {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  playSonarPing() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playChestOpen(isJackpot = false) {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    if (isJackpot) {
      // Sparkling royal arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.35, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.5);
      });
    } else {
      // Wood creak and heavy lock latch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
      gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  }

  playFishEscape() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.28);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  playTeleportWarp() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1480, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.32);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  playDashWhoosh() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playCloakVanish() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.28);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  playAuraDeflect() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const freqs = [620, 930];
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(f * 0.8, now + 0.24);

      gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    });
  }

  playQuestComplete() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.32, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.4);
    });
  }

  playBottlePickup() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Crisp cork pop
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'triangle';
    popOsc.frequency.setValueAtTime(160, now);
    popOsc.frequency.exponentialRampToValueAtTime(540, now + 0.05);
    popGain.gain.setValueAtTime(this.sfxVolume * .28 * 0.35, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    popOsc.connect(popGain);
    popGain.connect(ctx.destination);
    popOsc.start(now);
    popOsc.stop(now + 0.07);

    // Glass harmonic chime
    [1318.51, 1975.53].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.04 + idx * 0.06);
      gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.22, now + 0.04 + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04 + idx * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.04 + idx * 0.06);
      osc.stop(now + 0.04 + idx * 0.06 + 0.35);
    });
  }

  playCatPurr() {
    this.ensureAudio();
    if (this.isMuted || !this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Soothing low frequency purr rumble with 26Hz amplitude tremolo
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(76, now);
    osc.frequency.linearRampToValueAtTime(84, now + 0.6);
    osc.frequency.linearRampToValueAtTime(72, now + 1.2);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(26, now);

    lfoGain.gain.setValueAtTime(this.sfxVolume * .28 * 0.18, now);
    lfo.connect(gain.gain);

    gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.22, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * .28 * 0.3, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 1.25);
    osc.stop(now + 1.25);
  }

  // Coastal Radio Station API
  getActiveStation() {
    return this.activeStation;
  }

  stopRadioStation() {
    this.radioTrack?.pause();
    this.radioTrack = null;
    this.activeStation = null;
    if (this.radioTimers) {
      this.radioTimers.forEach(id => clearInterval(id));
      this.radioTimers = [];
    }
    if (this.radioNodes) {
      this.radioNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (_) {}
      });
      this.radioNodes = [];
    }
    if (this.radioGain) {
      try {
        this.radioGain.disconnect();
      } catch (_) {}
      this.radioGain = null;
    }

    this.applyVolumes();
    this.syncRecordedMusic();
  }

  startRadioStation(stationId) {
    this.ensureAudio();
    this.stopRadioStation();
    const stations = {
      harbor_breeze: '/sprites/seamusic.mp3', rainy_lighthouse: '/music/aquarain.mp3', deep_blue: '/sprites/oceanmusic2.mp3',
      peaceful_lagoon: '/music/peaceful.mp3', zen_meditation: '/music/meditation.mp3', tropical_solitude: '/music/tropical.mp3',
      ocean_waves: '/music/ocean-waves.mp3', midnight_current: '/music/ocean-vibes.mp3',
    };
    if (!stations[stationId]) return;
    this.activeStation = stationId;
    this.syncRecordedMusic();
    this.radioTrack = createAudioElement(stations[stationId]);
    this.radioTrack.loop = true;
    this.applyVolumes();
    this.radioTrack.play()?.catch(() => {});
  }

  _startHarborBreezeStation() {
    if (!this.audioCtx || !this.radioGain) return;
    const ctx = this.audioCtx;

    // Cozy nylon acoustic guitar chords in D Major / G Major
    const chordProgression = [
      [293.66, 369.99, 440.0, 554.37], // Dmaj7
      [246.94, 293.66, 369.99, 440.0],  // Bm7
      [196.0, 246.94, 293.66, 369.99],   // Gmaj7
      [220.0, 293.66, 329.63, 440.0],   // A7sus4
    ];

    let chordIdx = 0;
    let noteStep = 0;

    const pluckInterval = setInterval(() => {
      if (!this.radioGain || this.activeStation !== 'harbor_breeze') return;
      const currentChord = chordProgression[chordIdx];
      const freq = currentChord[noteStep % currentChord.length];
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(380, now + 0.6);

      gain.gain.setValueAtTime(this.sfxVolume * .28 * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.radioGain);

      osc.start(now);
      osc.stop(now + 0.75);

      noteStep++;
      if (noteStep % 4 === 0) {
        chordIdx = (chordIdx + 1) % chordProgression.length;
      }
    }, 700);

    this.radioTimers.push(pluckInterval);
  }

  _startRainyLighthouseStation() {
    if (!this.audioCtx || !this.radioGain) return;
    const ctx = this.audioCtx;

    // 1. Soft rain noise loop
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1200, ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.7, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.25, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.radioGain);
    rainSource.start();
    this.radioNodes.push(rainSource);

    // 2. Distant rolling thunder rumble
    const thunderInterval = setInterval(() => {
      if (!this.radioGain || this.activeStation !== 'rainy_lighthouse') return;
      const now = ctx.currentTime;
      const tOsc = ctx.createOscillator();
      const tFilter = ctx.createBiquadFilter();
      const tGain = ctx.createGain();

      tOsc.type = 'sawtooth';
      tOsc.frequency.setValueAtTime(65, now);
      tOsc.frequency.exponentialRampToValueAtTime(32, now + 2.4);

      tFilter.type = 'lowpass';
      tFilter.frequency.setValueAtTime(120, now);

      tGain.gain.setValueAtTime(0.001, now);
      tGain.gain.linearRampToValueAtTime(this.sfxVolume * .28 * 0.28, now + 0.6);
      tGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      tOsc.connect(tFilter);
      tFilter.connect(tGain);
      tGain.connect(this.radioGain);

      tOsc.start(now);
      tOsc.stop(now + 2.9);
    }, 11000);
    this.radioTimers.push(thunderInterval);

    // 3. Warm low foghorn drone
    const foghornInterval = setInterval(() => {
      if (!this.radioGain || this.activeStation !== 'rainy_lighthouse') return;
      const now = ctx.currentTime;
      [110, 110.8].forEach(freq => {
        const fOsc = ctx.createOscillator();
        const fGain = ctx.createGain();
        fOsc.type = 'sine';
        fOsc.frequency.setValueAtTime(freq, now);

        fGain.gain.setValueAtTime(0.001, now);
        fGain.gain.linearRampToValueAtTime(this.sfxVolume * .28 * 0.22, now + 0.8);
        fGain.gain.setValueAtTime(this.sfxVolume * .28 * 0.22, now + 2.4);
        fGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

        fOsc.connect(fGain);
        fGain.connect(this.radioGain);
        fOsc.start(now);
        fOsc.stop(now + 4.1);
      });
    }, 15000);
    this.radioTimers.push(foghornInterval);
  }

  _startDeepBlueStation() {
    if (!this.audioCtx || !this.radioGain) return;
    const ctx = this.audioCtx;

    // Warm slow synth pads (C minor 9 / Ab maj 7)
    const padFrequencies = [130.81, 196.00, 261.63, 311.13, 392.00];
    padFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.8, ctx.currentTime);

      gain.gain.setValueAtTime(0.08 / padFrequencies.length, ctx.currentTime);

      // Slow breathing LFO for pad swell
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12 + idx * 0.03, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.03, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(this.radioGain);

      osc.start();
      lfo.start();

      this.radioNodes.push(osc, lfo);
    });

    // Underwater bubbling acoustic resonance
    const bubbleInterval = setInterval(() => {
      if (!this.radioGain || this.activeStation !== 'deep_blue') return;
      const now = ctx.currentTime;
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();

      const startF = 350 + Math.random() * 250;
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(startF, now);
      bOsc.frequency.exponentialRampToValueAtTime(startF * 1.8, now + 0.14);

      bGain.gain.setValueAtTime(this.sfxVolume * .28 * 0.18, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      bOsc.connect(bGain);
      bGain.connect(this.radioGain);

      bOsc.start(now);
      bOsc.stop(now + 0.16);
    }, 2400);

    this.radioTimers.push(bubbleInterval);
  }

  // ========================================================
  // SEVEN FANTASY SEAS AMBIENT PROCEDURAL SOUNDSCAPES
  // Smooth Web Audio cross-fading per ocean realm
  // ========================================================

  setZoneSoundscape(zoneId) {
    if (typeof zoneId === 'number') {
      this.setSeaTrack(zoneId);
      return;
    }
    const zoneMap = {
      sunken_shallows: 1,
      whispering_mangrove: 2,
      abyssal_rift: 3,
      volcanic_caldera: 6,
    };
    const targetSea = zoneMap[zoneId] || 1;
    this.setSeaTrack(targetSea);
  }

  setSeaTrack(seaId) {
    if (this.isEndgameActive) return;
    const id = Number(seaId) || 1;
    this.ensureAudio();
    const changed = this.currentSeaId !== id;
    const mode = this.currentMusicMode || 'surface';
    const key = `${id}_${mode}`;
    const existingTrack = id === 1
      ? (mode === 'underwater' ? this.underwaterMusic : this.surfaceMusic)
      : this.realmTracks.get(key);
    const needsInitialSync = mode === 'none' || !existingTrack || (existingTrack.paused && !this._fadeInterval);
    this.currentSeaId = id;
    if (changed || needsInitialSync) this.syncRecordedMusic();
  }

  _startRealmTheme(id) {
    if (this.isEndgameActive) return;
    const theme = REALM_MUSIC[id] || REALM_MUSIC[1];
    const ctx = this.audioCtx;
    const output = this.seaGain;
    const beat = 60 / theme.bpm;
    let step = 0;
    const note = (midi, duration, volume, type = theme.voice) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(output);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
      osc.start(now);
      osc.stop(now + duration + 0.02);
    };
    const tick = () => {
      if (this.isEndgameActive || this.currentSeaId !== id || ctx.state !== 'running') return;
      const melody = theme.melody[step % theme.melody.length];
      const chord = theme.chords[Math.floor(step / 8) % theme.chords.length];
      if (melody !== null) note(theme.root + melody, beat * theme.sustain, 0.18);
      if (step % 4 === 0) note(theme.root - 24 + chord, beat * 3.5, 0.12, 'sine');
      if (step % 8 === 0) {
        [0, theme.minor ? 3 : 4, 7].forEach(interval => note(theme.root - 12 + chord + interval, beat * 7, 0.035, 'sine'));
      }
      step++;
    };
    tick();
    this.seaTimers.push(setInterval(tick, beat * 1000));
  }

  // ========================================================
  // SPECIAL END CREDITS & ENDGAME SCENE MUSIC
  // Plays exclusively the user's special finale track; all other music is off
  // ========================================================
  playEndgameMusic() {
    this.ensureAudio();
    this.stopEndgameMusic();
    this.isEndgameActive = true;
    this.currentMusicMode = 'none';

    // Pause all regular surface, underwater, realm, and radio audio
    try { this.surfaceMusic.pause?.(); } catch (_) {}
    try { this.underwaterMusic.pause?.(); } catch (_) {}
    for (const track of this.realmTracks?.values() || []) {
      try { track.pause?.(); } catch (_) {}
    }
    if (this.radioTrack) {
      try { this.radioTrack.pause?.(); } catch (_) {}
    }
    this.stopRadioStation();

    // Stop realm ambient theme timers and silence procedural ambience
    for (const timer of this.seaTimers) clearInterval(timer);
    this.seaTimers = [];
    if (this.seaGain && this.audioCtx) {
      try { this.seaGain.gain.setValueAtTime(0, this.audioCtx.currentTime); } catch (_) {}
    }

    // Play exclusively the special endgame finale music track
    try {
      this.endgameTrack = createAudioElement('/music/endgame-finale.mp3');
      this.endgameTrack.loop = true;
      this.endgameTrack.volume = this.isMuted ? 0 : this.musicVolume * this.getTrackScale(this.endgameTrack.src, 'surface');
      this.endgameTrack.play?.()?.catch?.(() => {});
    } catch (_) {}
  }

  stopEndgameMusic() {
    this.isEndgameActive = false;
    if (this.endgameTrack) {
      try {
        this.endgameTrack.pause?.();
        this.endgameTrack.currentTime = 0;
      } catch (_) {}
      this.endgameTrack = null;
    }
    this._clearEndgameSynth();
  }

  _startEndgameSynth() {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    try {
      this.endgameGain = ctx.createGain();
      this.endgameGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.5, ctx.currentTime);
      this.endgameGain.connect(ctx.destination);

      // Warm deep sub-bass drone
      const droneOsc = ctx.createOscillator();
      const droneGain = ctx.createGain();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(55.0, ctx.currentTime); // A1 note
      droneGain.gain.setValueAtTime(0.18, ctx.currentTime);
      droneOsc.connect(droneGain);
      droneGain.connect(this.endgameGain);
      try { droneOsc.start(); } catch (_) {}
      this.endgameNodes.push(droneOsc, droneGain);

      // Starry bell arpeggios in celestial D Lydian / A Major pentatonic
      const celestialNotes = [293.66, 329.63, 369.99, 440.00, 493.88, 554.37, 587.33, 659.25, 739.99, 880.00];
      let noteIdx = 0;

      const chimeInterval = setInterval(() => {
        if (!this.endgameGain || ctx.state !== 'running') return;
        const now = ctx.currentTime;
        const noteFreq = celestialNotes[noteIdx % celestialNotes.length];
        noteIdx = (noteIdx + Math.floor(Math.random() * 3) + 1);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = Math.random() < 0.6 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(noteFreq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(this.endgameGain);

        try {
          osc.start(now);
          osc.stop(now + 2.3);
        } catch (_) {}
      }, 500);

      this.endgameTimers.push(chimeInterval);
    } catch (_) {}
  }

  _clearEndgameSynth() {
    for (const timer of this.endgameTimers) clearInterval(timer);
    this.endgameTimers = [];
    for (const node of this.endgameNodes) {
      try {
        node.stop?.();
        node.disconnect?.();
      } catch (_) {}
    }
    this.endgameNodes = [];
    if (this.endgameGain) {
      try { this.endgameGain.disconnect?.(); } catch (_) {}
      this.endgameGain = null;
    }
  }
}

export const soundManager = new SoundManager();

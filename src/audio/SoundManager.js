import { REALM_MUSIC } from './RealmMusic.js';
// Web Audio API procedural sound synthesizer + HTML5 Audio music manager
export class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.5;

    // HTML5 Audio tracks
    this.surfaceMusic = new Audio("/sprites/seamusic.mp3");
    this.underwaterMusic = new Audio("/sprites/oceanmusic2.mp3");
    this.bubbleSfx = new Audio("/sprites/bubble.mp3");
    this.bubbleSfx2 = new Audio("/sprites/bubble2.mp3");

    this.surfaceMusic.loop = true;
    this.underwaterMusic.loop = true;

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
    this.realmTracks = new Map();
    this.radioTrack = null;
    this.seaGain = null;
    this.seaNodes = [];
    this.seaTimers = [];
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

  applyVolumes() {
    const vol = this.isMuted ? 0 : this.musicVolume;
    for (const track of this.realmTracks?.values() || []) track.volume = vol * .45;
    if (this.radioTrack) this.radioTrack.volume = vol * .45;
    this.surfaceMusic.volume = vol * 0.4;
    this.underwaterMusic.volume = vol * 0.6;
    this.bubbleSfx.volume = this.isMuted ? 0 : this.sfxVolume * .8 * 0.5;
    this.bubbleSfx2.volume = this.isMuted ? 0 : this.sfxVolume * .8 * 0.5;

    if (this.ambientSurfGain && this.audioCtx) {
      this.ambientSurfGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.12, this.audioCtx.currentTime);
    }
    if (this.radioGain && this.audioCtx) {
      this.radioGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.45, this.audioCtx.currentTime);
    }
    if (this.seaGain && this.audioCtx) {
      this.seaGain.gain.setValueAtTime(this.isMuted || this.activeStation || this.currentMusicMode === 'none' ? 0 : this.musicVolume * 0.38, this.audioCtx.currentTime);
    }
  }

  setMusicMode(mode) {
    this.currentMusicMode = mode;
    this.setSeaTrack(this.currentSeaId);
  }

  syncRecordedMusic() {
    this.surfaceMusic.pause();
    this.underwaterMusic.pause();
    for (const track of this.realmTracks.values()) track.pause();
    if (this.activeStation || this.currentMusicMode === 'none' || !this.currentMusicMode) return;
    let track;
    if (this.currentSeaId === 1) {
      track = this.currentMusicMode === 'underwater' ? this.underwaterMusic : this.surfaceMusic;
    } else {
      const names = { 2: 'aquarain', 3: 'meditation', 4: 'peaceful', 5: 'ocean-waves', 6: 'tropical', 7: 'ocean-vibes' };
      if (!this.realmTracks.has(this.currentSeaId)) {
        const audio = new Audio(`/music/${names[this.currentSeaId] || 'aquarain'}.mp3`);
        audio.loop = true;
        audio.preload = 'none';
        this.realmTracks.set(this.currentSeaId, audio);
      }
      track = this.realmTracks.get(this.currentSeaId);
    }
    this.applyVolumes();
    track.play()?.catch(() => {});
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
    const targetRainVol = (weather === 'RAIN' && !this.isMuted) ? this.sfxVolume * .8 * 0.14 : 0;
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

      gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.35, now + idx * 0.16);
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
      gain.gain.linearRampToValueAtTime(this.sfxVolume * .16, start + .03);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.22, now);
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
    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.3, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.5, now);
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
    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.6, now);
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

      gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.35, now + idx * 0.05);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.5, now);
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

      gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.35, now + idx * 0.06);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.3, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.2, now);
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

      gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.35, now + idx * 0.06);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.15, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.25, now);
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
        gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.35, now + i * 0.08);
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
      gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.25, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.3, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.28, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.25, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.2, now);
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

      gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.22, now);
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
      gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.32, now + idx * 0.09);
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
    popGain.gain.setValueAtTime(this.sfxVolume * .8 * 0.35, now);
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
      gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.22, now + 0.04 + idx * 0.06);
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

    lfoGain.gain.setValueAtTime(this.sfxVolume * .8 * 0.18, now);
    lfo.connect(gain.gain);

    gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.22, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * .8 * 0.3, now + 0.4);
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
    const stations = { harbor_breeze: 'tropical', rainy_lighthouse: 'aquarain', deep_blue: 'ocean-vibes' };
    if (!stations[stationId]) return;
    this.activeStation = stationId;
    this.syncRecordedMusic();
    this.radioTrack = new Audio(`/music/${stations[stationId]}.mp3`);
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

      gain.gain.setValueAtTime(this.sfxVolume * .8 * 0.35, now);
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
      tGain.gain.linearRampToValueAtTime(this.sfxVolume * .8 * 0.28, now + 0.6);
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
        fGain.gain.linearRampToValueAtTime(this.sfxVolume * .8 * 0.22, now + 0.8);
        fGain.gain.setValueAtTime(this.sfxVolume * .8 * 0.22, now + 2.4);
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

      bGain.gain.setValueAtTime(this.sfxVolume * .8 * 0.18, now);
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
    const id = Number(seaId) || 1;
    this.ensureAudio();
    const changed = this.currentSeaId !== id;
    this.currentSeaId = id;
    if (changed || this.currentMusicMode) this.syncRecordedMusic();
  }

  _startRealmTheme(id) {
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
      if (this.currentSeaId !== id || ctx.state !== 'running') return;
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

}

export const soundManager = new SoundManager();

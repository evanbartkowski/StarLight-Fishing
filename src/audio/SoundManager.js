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
    this.surfaceMusic.volume = vol * 0.4;
    this.underwaterMusic.volume = vol * 0.6;
    this.bubbleSfx.volume = this.isMuted ? 0 : this.sfxVolume * 0.5;
    this.bubbleSfx2.volume = this.isMuted ? 0 : this.sfxVolume * 0.5;

    if (this.ambientSurfGain && this.audioCtx) {
      this.ambientSurfGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.12, this.audioCtx.currentTime);
    }
    if (this.radioGain && this.audioCtx) {
      this.radioGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.45, this.audioCtx.currentTime);
    }
    if (this.seaGain && this.audioCtx) {
      this.seaGain.gain.setValueAtTime(this.isMuted || this.activeStation ? 0 : this.musicVolume * 0.38, this.audioCtx.currentTime);
    }
  }

  setMusicMode(mode) {
    if (this.currentMusicMode === mode) return;
    this.currentMusicMode = mode;

    if (this.isMuted || this.activeStation) return;

    if (mode === 'surface') {
      this.underwaterMusic.pause();
      this.surfaceMusic.currentTime = 0;
      this.surfaceMusic.play().catch(() => {});
    } else if (mode === 'underwater') {
      this.surfaceMusic.pause();
      this.underwaterMusic.play().catch(() => {});
    } else {
      this.surfaceMusic.pause();
      this.underwaterMusic.pause();
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
    const targetRainVol = (weather === 'RAIN' && !this.isMuted) ? this.sfxVolume * 0.14 : 0;
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

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, now + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.16 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 1.25);
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

    gain.gain.setValueAtTime(this.sfxVolume * 0.22, now);
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
    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
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
    gain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
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

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, now + idx * 0.05);
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

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
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

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, now + idx * 0.06);
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

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
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

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, now + idx * 0.06);
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

    gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
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
        gain.gain.setValueAtTime(this.sfxVolume * 0.35, now + i * 0.08);
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
      gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
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

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
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
      gain.gain.setValueAtTime(this.sfxVolume * 0.32, now + idx * 0.09);
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
    popGain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
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
      gain.gain.setValueAtTime(this.sfxVolume * 0.22, now + 0.04 + idx * 0.06);
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

    lfoGain.gain.setValueAtTime(this.sfxVolume * 0.18, now);
    lfo.connect(gain.gain);

    gain.gain.setValueAtTime(this.sfxVolume * 0.22, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, now + 0.4);
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

    // Resume standard surface/underwater music if applicable
    if (this.currentMusicMode === 'surface' && !this.isMuted) {
      this.surfaceMusic.play().catch(() => {});
    } else if (this.currentMusicMode === 'underwater' && !this.isMuted) {
      this.underwaterMusic.play().catch(() => {});
    }
  }

  startRadioStation(stationId) {
    this.ensureAudio();
    this.stopRadioStation();
    if (!this.audioCtx) return;

    this.activeStation = stationId;
    this.surfaceMusic.pause();
    this.underwaterMusic.pause();

    const ctx = this.audioCtx;
    this.radioGain = ctx.createGain();
    this.radioGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.45, ctx.currentTime);
    this.radioGain.connect(ctx.destination);

    if (stationId === 'harbor_breeze') {
      this._startHarborBreezeStation();
    } else if (stationId === 'rainy_lighthouse') {
      this._startRainyLighthouseStation();
    } else if (stationId === 'deep_blue') {
      this._startDeepBlueStation();
    }
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

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
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
      tGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.28, now + 0.6);
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
        fGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.22, now + 0.8);
        fGain.gain.setValueAtTime(this.sfxVolume * 0.22, now + 2.4);
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

      bGain.gain.setValueAtTime(this.sfxVolume * 0.18, now);
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

  setSeaTrack(seaId) {
    const id = parseInt(seaId, 10) || 1;
    if (this.currentSeaId === id && this.seaGain) return;
    this.ensureAudio();
    if (!this.audioCtx) return;

    this.currentSeaId = id;
    const ctx = this.audioCtx;

    // Smooth crossfade out old sea track
    if (this.seaGain) {
      const oldGain = this.seaGain;
      const oldNodes = [...this.seaNodes];
      const oldTimers = [...this.seaTimers];
      this.seaNodes = [];
      this.seaTimers = [];
      try {
        oldGain.gain.setValueAtTime(oldGain.gain.value, ctx.currentTime);
        oldGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        setTimeout(() => {
          oldTimers.forEach(t => clearInterval(t));
          oldNodes.forEach(n => {
            try { if (n.stop) n.stop(); if (n.disconnect) n.disconnect(); } catch (_) {}
          });
          try { oldGain.disconnect(); } catch (_) {}
        }, 1300);
      } catch (_) {}
    }

    // Create new Sea Gain Node and crossfade in
    this.seaGain = ctx.createGain();
    const targetVol = (this.isMuted || this.activeStation) ? 0 : this.musicVolume * 0.38;
    this.seaGain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.seaGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 1.5);
    this.seaGain.connect(ctx.destination);

    // Launch synthesizer based on Sea realm
    switch (id) {
      case 1: this._startSea1SunlitShoals(); break;
      case 2: this._startSea2BiolumTrench(); break;
      case 3: this._startSea3AstralShimmerfall(); break;
      case 4: this._startSea4SunkenAtlantis(); break;
      case 5: this._startSea5WhisperingAether(); break;
      case 6: this._startSea6MagmaCaldera(); break;
      case 7: this._startSea7EldritchVoid(); break;
      default: this._startSea1SunlitShoals(); break;
    }
  }

  // Sea 1: Sunlit Shoals — Breezy coastal blues, gentle gulls, calm acoustic/kalimba tones
  _startSea1SunlitShoals() {
    if (!this.audioCtx || !this.seaGain) return;
    const ctx = this.audioCtx;

    // Kalimba / Acoustic plucks in D Major pentatonic
    const notes = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33];
    let noteIdx = 0;

    const pluckInterval = setInterval(() => {
      if (!this.seaGain || this.currentSeaId !== 1) return;
      const now = ctx.currentTime;
      const freq = notes[noteIdx % notes.length];
      noteIdx = (noteIdx + 1 + Math.floor(Math.random() * 2)) % notes.length;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(this.sfxVolume * 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(this.seaGain);
      osc.start(now);
      osc.stop(now + 0.95);
    }, 1100);
    this.seaTimers.push(pluckInterval);

    // Occasional gentle gull glide sound
    const gullInterval = setInterval(() => {
      if (!this.seaGain || this.currentSeaId !== 1) return;
      const now = ctx.currentTime;
      const gOsc = ctx.createOscillator();
      const gGain = ctx.createGain();
      gOsc.type = 'sine';
      gOsc.frequency.setValueAtTime(1750, now);
      gOsc.frequency.exponentialRampToValueAtTime(1350, now + 0.35);

      gGain.gain.setValueAtTime(0.001, now);
      gGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.12, now + 0.1);
      gGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      gOsc.connect(gGain);
      gGain.connect(this.seaGain);
      gOsc.start(now);
      gOsc.stop(now + 0.55);
    }, 14000);
    this.seaTimers.push(gullInterval);
  }

  // Sea 2: Bioluminescent Trench — Deep violet/neon-cyan abyss, deep resonant synth pads with chime arpeggios
  _startSea2BiolumTrench() {
    if (!this.audioCtx || !this.seaGain) return;
    const ctx = this.audioCtx;

    // Deep resonant pad (85Hz root & 127Hz fifth)
    [85, 127.5].forEach(freq => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.seaGain);

      osc.start();
      this.seaNodes.push(osc);
    });

    // Chime arpeggios
    const chimes = [880.00, 1046.50, 1318.51, 1567.98, 1760.00];
    let chimeIdx = 0;
    const chimeTimer = setInterval(() => {
      if (!this.seaGain || this.currentSeaId !== 2) return;
      const now = ctx.currentTime;
      const freq = chimes[chimeIdx % chimes.length];
      chimeIdx++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(this.sfxVolume * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.seaGain);
      osc.start(now);
      osc.stop(now + 1.25);
    }, 1400);
    this.seaTimers.push(chimeTimer);
  }

  // Sea 3: Astral Shimmerfall — Starlit crystalline waters, glass-harp & ambient piano chords
  _startSea3AstralShimmerfall() {
    if (!this.audioCtx || !this.seaGain) return;
    const ctx = this.audioCtx;

    // Glass-harp high chord pad (C5, E5, G5, B5)
    const glassNotes = [523.25, 659.25, 783.99, 987.77];
    glassNotes.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.6, ctx.currentTime);

      gain.gain.setValueAtTime(0.035, ctx.currentTime);

      // Vibrato
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(4.5, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(gain);
      gain.connect(this.seaGain);
      osc.start();
      lfo.start();
      this.seaNodes.push(osc, lfo);
    });

    // Ambient piano chords
    const pianoTimer = setInterval(() => {
      if (!this.seaGain || this.currentSeaId !== 3) return;
      const now = ctx.currentTime;
      const chord = [261.63, 329.63, 392.00, 523.25];
      chord.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);

        gain.gain.setValueAtTime(this.sfxVolume * 0.16, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 2.2);

        osc.connect(gain);
        gain.connect(this.seaGain);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 2.3);
      });
    }, 3600);
    this.seaTimers.push(pianoTimer);
  }

  // Sea 4: Sunken Atlantis — Sunken marble pillars, soothing harp & flute harmonies
  _startSea4SunkenAtlantis() {
    if (!this.audioCtx || !this.seaGain) return;
    const ctx = this.audioCtx;

    // Soothing Celtic harp arpeggios
    const harpNotes = [369.99, 440.00, 554.37, 659.25, 739.99]; // F# minor
    let hIdx = 0;
    const harpTimer = setInterval(() => {
      if (!this.seaGain || this.currentSeaId !== 4) return;
      const now = ctx.currentTime;
      const freq = harpNotes[hIdx % harpNotes.length];
      hIdx++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(this.sfxVolume * 0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      osc.connect(gain);
      gain.connect(this.seaGain);
      osc.start(now);
      osc.stop(now + 1.15);
    }, 950);
    this.seaTimers.push(harpTimer);

    // Warm wooden flute breath tone
    const fluteTimer = setInterval(() => {
      if (!this.seaGain || this.currentSeaId !== 4) return;
      const now = ctx.currentTime;
      const fOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const fGain = ctx.createGain();

      fOsc.type = 'triangle';
      fOsc.frequency.setValueAtTime(440, now);
      fOsc.frequency.exponentialRampToValueAtTime(554.37, now + 1.2);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(1.8, now);

      fGain.gain.setValueAtTime(0.001, now);
      fGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.18, now + 0.5);
      fGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      fOsc.connect(filter);
      filter.connect(fGain);
      fGain.connect(this.seaGain);
      fOsc.start(now);
      fOsc.stop(now + 2.5);
    }, 7000);
    this.seaTimers.push(fluteTimer);
  }

  // Sea 5: Whispering Aether Sea — Lilac winds, wind chimes, celestial choral pads
  _startSea5WhisperingAether() {
    if (!this.audioCtx || !this.seaGain) return;
    const ctx = this.audioCtx;

    // Celestial choral pad (detuned warm sine waves)
    [220, 277.18, 329.63].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.4, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.seaGain);
      osc.start();
      this.seaNodes.push(osc);
    });

    // Delicate wind chimes
    const chimeTimer = setInterval(() => {
      if (!this.seaGain || this.currentSeaId !== 5) return;
      const now = ctx.currentTime;
      const randomFreq = 1200 + Math.random() * 1200;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomFreq, now);

      gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(this.seaGain);
      osc.start(now);
      osc.stop(now + 1.45);
    }, 1800);
    this.seaTimers.push(chimeTimer);
  }

  // Sea 6: Magma Caldera Trench — Volcanic reefs, warm bass drone with gentle handpan drums
  _startSea6MagmaCaldera() {
    if (!this.audioCtx || !this.seaGain) return;
    const ctx = this.audioCtx;

    // Warm bass drone
    const droneOsc = ctx.createOscillator();
    const droneFilter = ctx.createBiquadFilter();
    const droneGain = ctx.createGain();

    droneOsc.type = 'sawtooth';
    droneOsc.frequency.setValueAtTime(55, ctx.currentTime); // A1 sub-bass

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(110, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.18, ctx.currentTime);

    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.seaGain);
    droneOsc.start();
    this.seaNodes.push(droneOsc);

    // Handpan drum tap
    const handpanTimer = setInterval(() => {
      if (!this.seaGain || this.currentSeaId !== 6) return;
      const now = ctx.currentTime;
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();

      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(160, now);
      drumOsc.frequency.exponentialRampToValueAtTime(65, now + 0.25);

      drumGain.gain.setValueAtTime(this.sfxVolume * 0.26, now);
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      drumOsc.connect(drumGain);
      drumGain.connect(this.seaGain);
      drumOsc.start(now);
      drumOsc.stop(now + 0.38);
    }, 2100);
    this.seaTimers.push(handpanTimer);
  }

  // Sea 7: Eldritch Chrono Void — Iridescent aurora waves, space-whale silhouettes, ethereal theremin
  _startSea7EldritchVoid() {
    if (!this.audioCtx || !this.seaGain) return;
    const ctx = this.audioCtx;

    // Ethereal theremin pitch glide
    const theremin = ctx.createOscillator();
    const thereminGain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    theremin.type = 'sine';
    theremin.frequency.setValueAtTime(260, ctx.currentTime);

    // Slow 0.1Hz theremin pitch modulation
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    lfoGain.gain.setValueAtTime(60, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(theremin.frequency);

    thereminGain.gain.setValueAtTime(0.09, ctx.currentTime);

    theremin.connect(thereminGain);
    thereminGain.connect(this.seaGain);
    theremin.start();
    lfo.start();
    this.seaNodes.push(theremin, lfo);

    // Infrasonic deep space rumble
    const spaceDrone = ctx.createOscillator();
    const spaceGain = ctx.createGain();
    spaceDrone.type = 'triangle';
    spaceDrone.frequency.setValueAtTime(45, ctx.currentTime);
    spaceGain.gain.setValueAtTime(0.15, ctx.currentTime);
    spaceDrone.connect(spaceGain);
    spaceGain.connect(this.seaGain);
    spaceDrone.start();
    this.seaNodes.push(spaceDrone);
  }
}

export const soundManager = new SoundManager();

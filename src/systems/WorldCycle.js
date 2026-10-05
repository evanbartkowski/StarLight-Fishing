// Atmospheric World Cycle System: Day/Night Cycle, Dynamic Weather & Global Events
// Synchronized global event cycle triggers every 35 minutes for 5 minutes duration

export const GLOBAL_EVENTS = [
  {
    id: 'blood_moon',
    name: 'Blood Moon',
    icon: '🩸',
    description: 'A crimson moon awakens prehistoric horrors! Legendary fish & apex monsters rise from the deep.',
    legendaryMultiplier: 2.5,
    crateMultiplier: 2.0,
    sky: {
      top: '#2b0707',
      middle: '#7f1d1d',
      horizon: '#ef4444',
      sunColor: '#dc2626',
      sunGlow: '#f87171',
      isNight: true,
      ambientLight: 0.75,
    },
  },
  {
    id: 'abyssal_storm',
    name: 'Abyssal Storm',
    icon: '⚡',
    description: 'Electric storm surges dredge lost sunken crates and tempest relics to reachable depths!',
    legendaryMultiplier: 2.0,
    crateMultiplier: 2.5,
    sky: {
      top: '#050b14',
      middle: '#1e1b4b',
      horizon: '#38bdf8',
      sunColor: '#c084fc',
      sunGlow: '#60a5fa',
      isNight: true,
      ambientLight: 0.7,
    },
  },
  {
    id: 'aurora_borealis',
    name: 'Aurora Borealis',
    icon: '🌌',
    description: 'Cosmic lights shimmer across the ocean. Rare mutated & shiny fish glow brightly!',
    legendaryMultiplier: 2.2,
    crateMultiplier: 2.2,
    sky: {
      top: '#022c22',
      middle: '#064e3b',
      horizon: '#34d399',
      sunColor: '#a7f3d0',
      sunGlow: '#38bdf8',
      isNight: true,
      ambientLight: 0.85,
    },
  },
];

export const EVENT_CYCLE_INTERVAL = 35 * 60 * 1000; // 35 minutes cycle
export const EVENT_CYCLE_DURATION = 5 * 60 * 1000;  // 5 minutes duration

export class WorldCycle {
  constructor() {
    this.cycleDuration = 600; // 10 minutes total cycle
    this.timer = 60; // Start at Day (e.g. 60s into cycle)

    this.weatherTimer = 0;
    this.weatherDuration = 180; // Weather shifts every ~3 minutes
    this.weather = 'CLEAR'; // 'CLEAR' | 'FOG' | 'RAIN'
    this.targetWeather = 'CLEAR';
    this.weatherTransition = 1.0;

    // Visual particles for weather
    this.rainDrops = [];
    this.fogBanks = [];
    this.bioPlankton = [];
    this.surfaceRipples = [];

    this.initFog();
    this.initPlankton();
  }

  initFog() {
    this.fogBanks = [];
    for (let i = 0; i < 8; i++) {
      this.fogBanks.push({
        x: Math.random() * 1600,
        y: 190 + Math.random() * 60,
        radiusX: 120 + Math.random() * 100,
        radiusY: 25 + Math.random() * 20,
        speed: 6 + Math.random() * 8,
        alpha: 0.15 + Math.random() * 0.2,
      });
    }
  }

  initPlankton() {
    this.bioPlankton = [];
    for (let i = 0; i < 40; i++) {
      this.bioPlankton.push({
        x: Math.random() * 1600,
        y: 220 + Math.random() * 500,
        size: 1.5 + Math.random() * 2.5,
        speedY: -3 - Math.random() * 5,
        speedX: (Math.random() - 0.5) * 4,
        pulseOffset: Math.random() * Math.PI * 2,
        alpha: 0.2 + Math.random() * 0.7,
      });
    }
  }

  update(dt, worldWidth, surfaceY) {
    const deltaSec = dt / 1000;
    this.timer = (this.timer + deltaSec) % this.cycleDuration;
    this.weatherTimer += deltaSec;

    // Weather change routine
    if (this.weatherTimer >= this.weatherDuration) {
      this.weatherTimer = 0;
      const roll = Math.random();
      if (roll < 0.55) {
        this.weather = 'CLEAR';
      } else if (roll < 0.80) {
        this.weather = 'RAIN';
      } else {
        this.weather = 'FOG';
      }
    }

    // Update Rain particles if raining
    if (this.weather === 'RAIN') {
      const targetCount = 90;
      while (this.rainDrops.length < targetCount) {
        this.rainDrops.push({
          x: Math.random() * worldWidth,
          y: -20 - Math.random() * 100,
          speed: 480 + Math.random() * 140,
          len: 12 + Math.random() * 14,
        });
      }

      for (let i = this.rainDrops.length - 1; i >= 0; i--) {
        const drop = this.rainDrops[i];
        drop.y += drop.speed * deltaSec;
        drop.x -= 40 * deltaSec; // gentle wind slant

        if (drop.y >= surfaceY) {
          // Splash ripple on water surface
          this.surfaceRipples.push({
            x: drop.x,
            y: surfaceY + (Math.random() * 6 - 3),
            radius: 2,
            maxRadius: 10 + Math.random() * 8,
            alpha: 0.6,
          });
          this.rainDrops.splice(i, 1);
        }
      }
    } else {
      // Drain existing rain drops
      for (let i = this.rainDrops.length - 1; i >= 0; i--) {
        const drop = this.rainDrops[i];
        drop.y += drop.speed * deltaSec;
        if (drop.y >= surfaceY) {
          this.rainDrops.splice(i, 1);
        }
      }
    }

    // Update surface ripples
    for (let i = this.surfaceRipples.length - 1; i >= 0; i--) {
      const rip = this.surfaceRipples[i];
      rip.radius += 20 * deltaSec;
      rip.alpha -= 1.8 * deltaSec;
      if (rip.alpha <= 0) {
        this.surfaceRipples.splice(i, 1);
      }
    }

    // Update Fog banks
    this.fogBanks.forEach((fog) => {
      fog.x += fog.speed * deltaSec;
      if (fog.x > worldWidth + 200) {
        fog.x = -200;
      }
    });

    // Update Bioluminescent plankton motes
    this.bioPlankton.forEach((mote) => {
      mote.y += mote.speedY * deltaSec;
      mote.x += mote.speedX * deltaSec;
      mote.pulseOffset += deltaSec * 1.5;

      if (mote.y < surfaceY + 20) {
        mote.y = surfaceY + 600;
        mote.x = Math.random() * worldWidth;
      }
    });
  }

  getGlobalEvent(now = Date.now() + (this.serverOffset || 0)) {
    const cycleTime = now % EVENT_CYCLE_INTERVAL;
    const active = cycleTime < EVENT_CYCLE_DURATION;
    const eventIndex = Math.floor(now / EVENT_CYCLE_INTERVAL) % GLOBAL_EVENTS.length;
    const eventDef = GLOBAL_EVENTS[eventIndex];
    const timeRemainingMs = active ? (EVENT_CYCLE_DURATION - cycleTime) : (EVENT_CYCLE_INTERVAL - cycleTime);

    return {
      active,
      eventIndex,
      ...eventDef,
      timeRemainingSec: Math.ceil(timeRemainingMs / 1000),
      timeRemainingMs,
    };
  }

  getApexSpawnMultiplier() {
    const event = this.getGlobalEvent();
    return event.active ? event.legendaryMultiplier : 1.0;
  }

  getCrateDropMultiplier() {
    const event = this.getGlobalEvent();
    return event.active ? event.crateMultiplier : 1.0;
  }

  // Time of Day state: 'DAWN' (0-90s) | 'DAY' (90-360s) | 'DUSK' (360-450s) | 'NIGHT' (450-600s)
  getTimeOfDay() {
    if (this.timer < 90) return 'DAWN';
    if (this.timer < 360) return 'DAY';
    if (this.timer < 450) return 'DUSK';
    return 'NIGHT';
  }

  getWeather() {
    return this.weather;
  }

  getTimeLabel() {
    const event = this.getGlobalEvent();
    if (event.active) {
      const min = Math.floor(event.timeRemainingSec / 60);
      const sec = event.timeRemainingSec % 60;
      return `${event.icon} ${event.name} (${min}m ${sec}s)`;
    }
    const t = this.getTimeOfDay();
    switch (t) {
      case 'DAWN': return '🌅 Dawn Twilight';
      case 'DAY': return '☀️ Sunlit Noon';
      case 'DUSK': return '🌆 Golden Sunset';
      case 'NIGHT': return '🌙 Biolum Night';
      default: return '☀️ Day';
    }
  }

  getWeatherLabel() {
    const w = this.getWeather();
    switch (w) {
      case 'CLEAR': return '✨ Clear Waters';
      case 'FOG': return '🌫️ Gentle Sea Mist';
      case 'RAIN': return '🌧️ Calming Rain';
      default: return '✨ Clear';
    }
  }

  getWeatherType() {
    const w = this.getWeather();
    switch (w) {
      case 'CLEAR': return { icon: '✨', label: 'Clear' };
      case 'FOG': return { icon: '🌫️', label: 'Mist' };
      case 'RAIN': return { icon: '🌧️', label: 'Rain' };
      default: return { icon: '✨', label: 'Clear' };
    }
  }

  getSkyColors() {
    const event = this.getGlobalEvent();
    if (event.active && event.sky) {
      return event.sky;
    }
    const t = this.getTimeOfDay();
    const progress = this.timer;

    if (t === 'DAWN') {
      // Soft rose gold and pastel amber
      return {
        top: '#3b82f6',
        middle: '#f472b6',
        horizon: '#fef08a',
        sunColor: '#fef08a',
        sunGlow: '#fde047',
        isNight: false,
        ambientLight: 0.9,
      };
    } else if (t === 'DAY') {
      // Azure sky
      return {
        top: '#0284c7',
        middle: '#38bdf8',
        horizon: '#bae6fd',
        sunColor: '#fef08a',
        sunGlow: '#facc15',
        isNight: false,
        ambientLight: 1.0,
      };
    } else if (t === 'DUSK') {
      // Deep sunset violet, crimson, warm gold
      return {
        top: '#312e81',
        middle: '#b91c1c',
        horizon: '#f97316',
        sunColor: '#fdba74',
        sunGlow: '#ea580c',
        isNight: false,
        ambientLight: 0.85,
      };
    } else {
      // Bioluminescent night with moon and stars
      return {
        top: '#020617',
        middle: '#090d23',
        horizon: '#171a3d',
        sunColor: '#e0e7ff',
        sunGlow: '#818cf8',
        isNight: true,
        ambientLight: 0.65,
      };
    }
  }

  renderWeatherEffects(ctx, cameraY, screenWidth, screenHeight, surfaceY) {
    const isNight = this.getTimeOfDay() === 'NIGHT';

    // 1. Night Stars & Moon
    if (isNight && cameraY < surfaceY) {
      ctx.save();
      // Draw subtle twinkling stars in the sky
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 35; i++) {
        const sx = ((i * 127 + 53) % screenWidth);
        const sy = ((i * 91 + 17) % (surfaceY - cameraY));
        const twinkle = 0.4 + Math.sin(this.timer * 2 + i) * 0.4;
        ctx.globalAlpha = twinkle;
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.restore();
    }

    // 2. Gentle Rain
    if (this.rainDrops.length > 0 && cameraY < surfaceY + 150) {
      ctx.save();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      this.rainDrops.forEach((drop) => {
        const dy = drop.y - cameraY;
        if (dy > -20 && dy < screenHeight + 20) {
          ctx.moveTo(drop.x, dy);
          ctx.lineTo(drop.x - 3, dy + drop.len);
        }
      });
      ctx.stroke();

      // Rain ripples on water
      this.surfaceRipples.forEach((rip) => {
        const ry = rip.y - cameraY;
        if (ry > -20 && ry < screenHeight + 20) {
          ctx.strokeStyle = `rgba(224, 242, 254, ${rip.alpha * 0.7})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(rip.x, ry, rip.radius, rip.radius * 0.35, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    // 3. Fog / Sea Mist
    if (this.weather === 'FOG' && cameraY < surfaceY + 150) {
      ctx.save();
      this.fogBanks.forEach((fog) => {
        const fy = fog.y - cameraY;
        if (fy > -50 && fy < screenHeight + 50) {
          try {
            const fogGrad = ctx.createRadialGradient(fog.x, fy, 10, fog.x, fy, fog.radiusX);
            fogGrad.addColorStop(0, `rgba(241, 245, 249, ${fog.alpha * 0.5})`);
            fogGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');
            ctx.fillStyle = fogGrad;
            ctx.beginPath();
            ctx.ellipse(fog.x, fy, fog.radiusX, fog.radiusY, 0, 0, Math.PI * 2);
            ctx.fill();
          } catch (e) {}
        }
      });
      ctx.restore();
    }

    // 4. Night Bioluminescent Plankton (High performance dual-arc glow, zero shadowBlur lag)
    if (isNight) {
      ctx.save();
      for (let i = 0; i < this.bioPlankton.length; i++) {
        const mote = this.bioPlankton[i];
        const my = mote.y - cameraY;
        if (my > surfaceY - cameraY && my < screenHeight + 40) {
          const pulse = 0.4 + Math.sin(mote.pulseOffset) * 0.5;
          const a = mote.alpha * pulse;

          // Outer soft glow halo
          ctx.fillStyle = `rgba(56, 189, 248, ${a * 0.25})`;
          ctx.beginPath();
          ctx.arc(mote.x, my, mote.size * 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Bright inner core
          ctx.fillStyle = `rgba(224, 242, 254, ${a * 0.9})`;
          ctx.beginPath();
          ctx.arc(mote.x, my, mote.size * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }
}

export const worldCycle = new WorldCycle();

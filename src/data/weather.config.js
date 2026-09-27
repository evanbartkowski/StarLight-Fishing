// weather.config.js — Atmospheric Weather & Day/Night 24-Hour Cycle Definitions
// Supports 4 distinct time bands and 4 dynamic weather states with gameplay modifiers

export const TIME_BANDS = {
  DAWN: {
    id: 'DAWN',
    name: 'Dawn Twilight',
    icon: '🌅',
    startHour: 4,
    endHour: 8,
    ambientLight: 0.88,
    description: 'Pastel amber morning skies with calm coastal breezes.',
  },
  DAY: {
    id: 'DAY',
    name: 'Sunlit Noon',
    icon: '☀️',
    startHour: 8,
    endHour: 18,
    ambientLight: 1.0,
    description: 'Bright azure skies and clear visibility across the surface.',
  },
  DUSK: {
    id: 'DUSK',
    name: 'Golden Sunset',
    icon: '🌆',
    startHour: 18,
    endHour: 21,
    ambientLight: 0.82,
    description: 'Crimson and violet horizon as twilight settles on the water.',
  },
  NIGHT: {
    id: 'NIGHT',
    name: 'Bioluminescent Night',
    icon: '🌙',
    startHour: 21,
    endHour: 4, // wraps around 24h
    ambientLight: 0.58,
    description: 'Deep midnight waters glowing with starry plankton and nocturnal predators.',
  },
};

export const WEATHER_STATES = {
  CLEAR: {
    id: 'CLEAR',
    name: 'Clear Waters',
    icon: '✨',
    biteRateBonus: 0,
    tensionModifier: 1.0,
    apexSpawnBonus: 1.0,
    description: 'Gentle, placid sea conditions. Baseline bite rate and calm currents.',
    weight: 45,
  },
  RAIN: {
    id: 'RAIN',
    name: 'Calming Rain',
    icon: '🌧️',
    biteRateBonus: 0.25, // +25% bite rate
    tensionModifier: 1.05,
    apexSpawnBonus: 1.15,
    description: 'Soft raindrops create surface ripples. +25% Bite Rate across all waters!',
    weight: 25,
  },
  THUNDERSTORM: {
    id: 'THUNDERSTORM',
    name: 'Thunderstorm',
    icon: '⛈️',
    biteRateBonus: 0.15,
    tensionModifier: 1.35, // Tension bar swings 35% faster
    apexSpawnBonus: 1.60, // +60% chance for Apex & Legendary fish
    description: 'Dramatic lightning flashes & thunderclaps! Apex & Legendary fish awaken, but line tension swings wildly.',
    weight: 15,
  },
  FOG: {
    id: 'FOG',
    name: 'Dense Sea Fog',
    icon: '🌫️',
    biteRateBonus: 0,
    tensionModifier: 1.0,
    apexSpawnBonus: 1.25,
    hidesSilhouettes: true, // Conceals surface fish silhouettes unless boat has Fog Lantern
    description: 'Thick, drifting mist rolls over the waves. Conceals fish silhouettes unless equipped with a Fog Lantern.',
    weight: 15,
  },
};

/**
 * Checks whether a fish species' spawn conditions are met given current environment
 */
export function isConditionMet(conditions, env) {
  if (!conditions) return true;

  const { time, weather, minZoneTier } = env;

  // Check Zone Tier condition
  if (conditions.minZoneTier && minZoneTier < conditions.minZoneTier) {
    return false;
  }

  // Check Time of Day condition
  if (conditions.time && conditions.time.length > 0) {
    const timeMatch = conditions.time.some(
      (t) => t.toUpperCase() === time.toUpperCase()
    );
    if (!timeMatch) return false;
  }

  // Check Weather condition
  if (conditions.weather && conditions.weather.length > 0) {
    const weatherMatch = conditions.weather.some(
      (w) => w.toUpperCase() === weather.toUpperCase()
    );
    if (!weatherMatch) return false;
  }

  return true;
}

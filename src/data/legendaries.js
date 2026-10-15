// Dedicated Mythic & Legendary Fish Roster
// Features atmospheric spawn conditions, size variance, and crown algorithms

export const LEGENDARY_SPECIES = [
  {
    id: 'star_weaver',
    name: 'Abyssal Star-Weaver',
    isMythic: true,
    isSpecialDeep: true,
    zone: 5,
    minDepth: 240,
    maxDepth: 550,
    rarity: 'legendary',
    baseValue: 3800, // increased sell reward for legendary achievement
    baseWeight: 22.0,
    sizeRange: [180, 310], // cm
    scaleFactor: 2.8,
    shape: 'star_ribbon',
    primaryColor: '#c084fc',
    secondaryColor: '#e0e7ff',
    finColor: '#a855f7',
    glowColor: '#e0e7ff',
    eyeColor: '#38bdf8',
    swimSpeed: 1.4,
    wiggleSpeed: 5,
    evasion: { type: 'teleport', cooldown: 1.8, blinkDist: 260, label: 'STELLAR WARP!' },
    lore: 'A translucent celestial ribbon eel that gathers stellar luminescence from cosmic ocean currents. Appears only during clear abyssal nights.',
    spawnConditions: {
      timesOfDay: ['NIGHT'],
      weathers: ['CLEAR'],
      minDepth: 240,
      chance: 0.18, // Checked per dive roll
    },
  },
  {
    id: 'mossback_leviathan',
    name: 'Old Mossback Leviathan',
    isMythic: true,
    zone: 2,
    minDepth: 45,
    maxDepth: 180,
    rarity: 'legendary',
    baseValue: 3100, // increased sell reward for legendary achievement
    baseWeight: 140.0,
    sizeRange: [220, 380], // cm
    scaleFactor: 3.2,
    shape: 'mossback_turtle',
    primaryColor: '#166534',
    secondaryColor: '#ca8a04',
    finColor: '#14532d',
    glowColor: '#86efac',
    eyeColor: '#facc15',
    swimSpeed: 0.85,
    wiggleSpeed: 3,
    evasion: { type: 'camouflage', cooldown: 2.8, duration: 2.2, label: 'COLOSSAL REEF CAMO!' },
    lore: 'A centuries-old colossal sea turtle whose shell hosts a living coral reef ecosystem. Surfaces in foggy twilight mists at dawn.',
    spawnConditions: {
      timesOfDay: ['DAWN'],
      weathers: ['FOG', 'RAIN'],
      minDepth: 45,
      chance: 0.22,
    },
  },
  {
    id: 'aurora_sailfin',
    name: 'Aurora Sailfin',
    isMythic: true,
    zone: 3,
    minDepth: 80,
    maxDepth: 220,
    rarity: 'legendary',
    baseValue: 3500, // increased sell reward for legendary achievement
    baseWeight: 48.0,
    sizeRange: [160, 260], // cm
    scaleFactor: 2.6,
    shape: 'aurora_billfish',
    primaryColor: '#06b6d4',
    secondaryColor: '#a7f3d0',
    finColor: '#10b981',
    glowColor: '#67e8f9',
    eyeColor: '#ffffff',
    swimSpeed: 2.3,
    wiggleSpeed: 7,
    evasion: { type: 'dash', cooldown: 1.5, speedMult: 5.0, label: 'AURORAL LIGHTSPEED!' },
    lore: 'A majestic polar billfish whose crystalline dorsal sail refracts polar lights across the pelagic waves at dusk and night.',
    spawnConditions: {
      timesOfDay: ['DUSK', 'NIGHT'],
      weathers: ['CLEAR'],
      minDepth: 80,
      chance: 0.20,
    },
  },
  {
    id: 'golden_coelacanth',
    name: 'Golden Coelacanth',
    isMythic: true,
    isSpecialDeep: true,
    zone: 6,
    minDepth: 360,
    maxDepth: 490,
    rarity: 'legendary',
    baseValue: 4600, // increased sell reward for legendary achievement
    baseWeight: 68.0,
    sizeRange: [140, 230], // cm
    scaleFactor: 2.4,
    shape: 'golden_coelacanth',
    primaryColor: '#eab308',
    secondaryColor: '#fef08a',
    finColor: '#ca8a04',
    glowColor: '#fde047',
    eyeColor: '#ffffff',
    swimSpeed: 1.2,
    wiggleSpeed: 4,
    evasion: { type: 'zigzag', cooldown: 2.0, label: 'PREHISTORIC EVASION!' },
    lore: 'A pristine prehistoric relic adorned with natural pyrite and gold plating from magma vent vents. Extremely rare drop of ancient antiquity.',
    spawnConditions: {
      timesOfDay: ['DAWN', 'DAY', 'DUSK', 'NIGHT'], // Any time, but very rare
      weathers: ['CLEAR', 'FOG', 'RAIN'],
      minDepth: 360,
      chance: 0.08, // Rare 0.8% - 1.5% drop frequency
    },
  },
  {
    id: 'whispering_siren_ray',
    name: 'The Whispering Siren Ray',
    isMythic: true,
    zone: 4,
    minDepth: 130,
    maxDepth: 300,
    rarity: 'legendary',
    baseValue: 4100, // increased sell reward for legendary achievement
    baseWeight: 95.0,
    sizeRange: [200, 340], // cm
    scaleFactor: 3.0,
    shape: 'siren_ray',
    primaryColor: '#3b82f6',
    secondaryColor: '#93c5fd',
    finColor: '#1d4ed8',
    glowColor: '#bfdbfe',
    eyeColor: '#ffffff',
    swimSpeed: 1.5,
    wiggleSpeed: 4,
    evasion: { type: 'repel', cooldown: 1.9, force: 250, label: 'SIREN GRAVITY WAVE!' },
    lore: 'A majestic royal manta ray that produces a soothing, harmonic hum resonant with wooden boat hulls under calm evening skies.',
    spawnConditions: {
      timesOfDay: ['DUSK', 'NIGHT'],
      weathers: ['CLEAR'],
      minDepth: 130,
      chance: 0.18,
    },
  },
  {
    id: 'aether_sea_unicorn',
    name: 'Aetherian Water Unicorn',
    isMythic: true,
    isSpecialDeep: true,
    zone: 5,
    minDepth: 285,
    maxDepth: 420,
    rarity: 'legendary',
    baseValue: 4900,
    baseWeight: 85.0,
    sizeRange: [210, 350],
    scaleFactor: 3.1,
    shape: 'unicorn',
    primaryColor: '#fdf4ff',
    secondaryColor: '#f0abfc',
    finColor: '#c084fc',
    glowColor: '#e879f9',
    eyeColor: '#38bdf8',
    swimSpeed: 2.1,
    wiggleSpeed: 5,
    evasion: { type: 'dash', cooldown: 1.6, speedMult: 4.8, label: 'CELESTIAL PRANCE!' },
    lore: 'A mythic aquatic unicorn crowned with a spiraled starlight horn. Its ethereal mane leaves swirling constellations of purple and lilac stardust in the aether currents.',
    spawnConditions: {
      timesOfDay: ['DAWN', 'DAY', 'DUSK', 'NIGHT'],
      weathers: ['CLEAR', 'FOG', 'RAIN'],
      minDepth: 285,
      chance: 0.24,
    },
  },
  {
    id: 'chrono_void_mermaid',
    name: 'Celestial Chrono Mermaid',
    isMythic: true,
    isSpecialDeep: true,
    zone: 7,
    minDepth: 540,
    maxDepth: 2500,
    rarity: 'legendary',
    baseValue: 6500,
    baseWeight: 52.0,
    sizeRange: [160, 270],
    scaleFactor: 2.9,
    shape: 'mermaid',
    primaryColor: '#38bdf8',
    secondaryColor: '#ec4899',
    finColor: '#a855f7',
    glowColor: '#f43f5e',
    eyeColor: '#ffffff',
    swimSpeed: 1.8,
    wiggleSpeed: 5,
    evasion: { type: 'teleport', cooldown: 1.7, blinkDist: 280, label: 'CHRONO LULLABY!' },
    lore: 'A breathtaking maiden of the void ocean singing timeless lullabies from distant galaxies. Her starlight scales shimmer with pure cosmic auroras, singing mesmerizing songs of the universe.',
    spawnConditions: {
      timesOfDay: ['DAWN', 'DAY', 'DUSK', 'NIGHT'],
      weathers: ['CLEAR', 'FOG', 'RAIN'],
      minDepth: 540,
      chance: 0.25,
    },
  },
  {
    id: 'sunlit_pearl_kirin',
    name: 'Sunlit Pearl Kirin',
    isMythic: true,
    zone: 1,
    minDepth: 15,
    maxDepth: 55,
    rarity: 'legendary',
    baseValue: 2900,
    baseWeight: 42.0,
    sizeRange: [140, 220],
    scaleFactor: 2.5,
    shape: 'unicorn',
    primaryColor: '#fef08a',
    secondaryColor: '#fed7aa',
    finColor: '#f59e0b',
    glowColor: '#fef9c3',
    eyeColor: '#0284c7',
    swimSpeed: 1.9,
    wiggleSpeed: 5,
    evasion: { type: 'dash', cooldown: 1.8, speedMult: 4.2, label: 'GOLDEN GALLOP!' },
    lore: 'An ancient draconic kirin of the sunlit coral reef, crowned with iridescent mother-of-pearl horns and golden scales.',
    spawnConditions: {
      timesOfDay: ['DAWN', 'DAY'],
      weathers: ['CLEAR'],
      minDepth: 15,
      chance: 0.22,
    },
  },
  {
    id: 'stardust_pegasus_fish',
    name: 'Stardust Winged Hippocampus',
    isMythic: true,
    zone: 3,
    minDepth: 110,
    maxDepth: 250,
    rarity: 'legendary',
    baseValue: 3900,
    baseWeight: 62.0,
    sizeRange: [180, 290],
    scaleFactor: 2.7,
    shape: 'unicorn',
    primaryColor: '#e0e7ff',
    secondaryColor: '#c7d2fe',
    finColor: '#818cf8',
    glowColor: '#a5b4fc',
    eyeColor: '#f43f5e',
    swimSpeed: 2.2,
    wiggleSpeed: 6,
    evasion: { type: 'dash', cooldown: 1.5, speedMult: 4.5, label: 'STARDUST LEAP!' },
    lore: 'A glittering aquatic steed whose crystalline dorsal fins open like angel wings through falling meteor showers.',
    spawnConditions: {
      timesOfDay: ['DUSK', 'NIGHT'],
      weathers: ['CLEAR', 'FOG'],
      minDepth: 110,
      chance: 0.22,
    },
  },
  {
    id: 'pyroclast_phoenix_ray',
    name: 'Solar Flare Phoenix Ray',
    isMythic: true,
    isSpecialDeep: true,
    zone: 6,
    minDepth: 415,
    maxDepth: 535,
    rarity: 'legendary',
    baseValue: 5400,
    baseWeight: 115.0,
    sizeRange: [240, 390],
    scaleFactor: 3.4,
    shape: 'ray',
    primaryColor: '#ea580c',
    secondaryColor: '#facc15',
    finColor: '#dc2626',
    glowColor: '#fbbf24',
    eyeColor: '#ffffff',
    swimSpeed: 2.0,
    wiggleSpeed: 5,
    evasion: { type: 'dash', cooldown: 1.4, speedMult: 5.2, label: 'SOLAR FLARE SURGE!' },
    lore: 'A legendary volcanic manta ray trailing incandescent solar flares and molten feathers from the earth mantle.',
    spawnConditions: {
      timesOfDay: ['DAWN', 'DAY', 'DUSK', 'NIGHT'],
      weathers: ['CLEAR', 'FOG', 'RAIN'],
      minDepth: 415,
      chance: 0.24,
    },
  },
  {
    id: 'singularity_astral_drake',
    name: 'Singularity Astral Drake',
    isMythic: true,
    isSpecialDeep: true,
    zone: 7,
    minDepth: 620,
    maxDepth: 3000,
    rarity: 'legendary',
    baseValue: 7800,
    baseWeight: 240.0,
    sizeRange: [350, 600],
    scaleFactor: 4.2,
    shape: 'world_serpent',
    primaryColor: '#7c3aed',
    secondaryColor: '#38bdf8',
    finColor: '#d946ef',
    glowColor: '#67e8f9',
    eyeColor: '#fef08a',
    swimSpeed: 2.3,
    wiggleSpeed: 6,
    evasion: { type: 'teleport', cooldown: 1.5, blinkDist: 340, label: 'EVENT HORIZON WARP!' },
    lore: 'A celestial cosmic dragon coiled around the event horizon, whose starlight scales warp the fabric of space and ocean time.',
    spawnConditions: {
      timesOfDay: ['DAWN', 'DAY', 'DUSK', 'NIGHT'],
      weathers: ['CLEAR', 'FOG', 'RAIN'],
      minDepth: 620,
      chance: 0.25,
    },
  },
];

/**
 * Crown calculation based on extreme size variance
 * Gold Crown (Giant): top 15% of species size range (+50% sell value)
 * Silver Crown (Mini): bottom 15% of species size range (+25% sell value)
 */
export function calculateCrown(species, size) {
  if (!species || !species.sizeRange) return null;
  const [minCm, maxCm] = species.sizeRange;
  const range = maxCm - minCm;
  if (range <= 0) return null;

  if (size >= minCm + range * 0.95) {
    return 'gold';
  }
  if (size <= minCm + range * 0.05) {
    return 'silver';
  }
  return null;
}

export function getCrownMultiplier(crown) {
  if (crown === 'gold') return 1.5;
  if (crown === 'silver') return 1.25;
  return 1.0;
}

export function checkMythicSpawn(species, timeOfDay, weather, depthMeters) {
  if (!species.spawnConditions) return true;
  const cond = species.spawnConditions;

  if (cond.timesOfDay && !cond.timesOfDay.includes(timeOfDay)) {
    return false;
  }
  if (cond.weathers && !cond.weathers.includes(weather)) {
    return false;
  }
  if (depthMeters < cond.minDepth) {
    return false;
  }
  return Math.random() < (cond.chance || 0.15);
}

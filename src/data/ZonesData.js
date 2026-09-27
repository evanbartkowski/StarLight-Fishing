// ZonesData.js — Multi-Zone Configuration and Exploration Data
// Defines distinct visual profiles, depth metrics, and environmental mechanics for all zones

export const ZONES = [
  {
    id: 'sunken_shallows',
    numId: 1,
    name: 'Sunken Shallows',
    subtitle: 'Shallow Turquoise Reef',
    icon: '🏖️',
    description: 'Bright daylight, sandy turquoise water, gentle wave ripples, and ambient coastal birds.',
    unlockRequirements: { coins: 0, boatTier: 1 },
    aesthetics: {
      topColor: '#38bdf8',
      bottomColor: '#0369a1',
      ambientLight: '#bae6fd',
      skyTint: 'rgba(56, 189, 248, 0.1)',
      particleType: 'plankton',
    },
    catches: [
      'minnow',
      'sardine',
      'sand_flounder',
      'clownfish',
      'driftwood_branch',
      'kelp_strand',
      'rusty_can',
      'golden_seahorse',
    ],
    mechanic: {
      type: 'standard',
      name: 'Calm Waters',
      description: 'Gentle currents, standard tension dynamics, and clear water.',
    },
  },
  {
    id: 'whispering_mangrove',
    numId: 2,
    name: 'Whispering Mangrove',
    subtitle: 'Murky Brackish Swamps',
    icon: '🌿',
    description: 'Fog overlay, dark emerald murky water, drifting fireflies, submerged roots, ambient crickets and frogs.',
    unlockRequirements: { coins: 250, boatTier: 2 },
    aesthetics: {
      topColor: '#064e3b',
      bottomColor: '#022c22',
      ambientLight: '#047857',
      skyTint: 'rgba(6, 78, 59, 0.25)',
      particleType: 'firefly',
    },
    catches: [
      'channel_catfish',
      'mudskipper',
      'alligator_gar',
      'swamp_bass',
      'mangrove_roots',
      'glowing_moss',
      'sunken_artifact',
    ],
    mechanic: {
      type: 'snags',
      name: 'Obstacle Snags',
      description: 'Submerged twisted roots can snag aggressive reeling. Pause reel to free line!',
      snagChance: 0.18,
    },
  },
  {
    id: 'abyssal_rift',
    numId: 3,
    name: 'Abyssal Rift',
    subtitle: 'Crushing Midnight Deep',
    icon: '🔮',
    description: 'Pitch-black depths, bioluminescent drifting spores, crushing ambient pressure drones.',
    unlockRequirements: { coins: 1200, boatTier: 3, highTensionLvl: 2 },
    aesthetics: {
      topColor: '#1e1b4b',
      bottomColor: '#09090b',
      ambientLight: '#4338ca',
      skyTint: 'rgba(30, 27, 75, 0.35)',
      particleType: 'biolum',
    },
    catches: [
      'deep_anglerfish',
      'gulper_eel',
      'viperfish',
      'phosphor_crystal',
      'sunken_anchor',
      'abyssal_chimera',
      'abyssal_vent',
    ],
    mechanic: {
      type: 'pressure',
      name: 'Pressure Bursts',
      description: 'Violent barometric pressure surges spike line tension. Feather retrieval cautiously!',
      surgeInterval: 4.5,
    },
  },
  {
    id: 'volcanic_caldera',
    numId: 4,
    name: 'Volcanic Caldera',
    subtitle: 'Boiling Hydrothermal Seas',
    icon: '🌋',
    description: 'Molten orange glow, ash particles drifting, bubbling thermal vents.',
    unlockRequirements: { coins: 4000, boatTier: 4 },
    aesthetics: {
      topColor: '#7c2d12',
      bottomColor: '#1c1917',
      ambientLight: '#ea580c',
      skyTint: 'rgba(124, 45, 18, 0.3)',
      particleType: 'ember',
    },
    catches: [
      'obsidian_pike',
      'magma_ray',
      'fire_conch',
      'lava_geode',
      'cinder_coelacanth',
      'obsidian_rock',
    ],
    mechanic: {
      type: 'heat',
      heatBuildup: true,
      name: 'Thermal Line Overheat',
      description: 'Reeling in boiling hydrothermal waters builds spool heat. Pause reeling to let the line cool!',
    },
  },
];

export function getZoneById(id) {
  return ZONES.find((z) => z.id === id || z.numId === id) || ZONES[0];
}

export function canUnlockZone(zone, saveSystem) {
  if (!zone.unlockRequirements) return { canUnlock: true };
  const coins = saveSystem.getCoins();
  const boatTier = saveSystem.getUpgradeLevel('boatHull') + 1;
  const lineTensionLvl = saveSystem.getUpgradeLevel('highTensionLine') || 0;

  const req = zone.unlockRequirements;
  const missing = [];

  if (req.coins && coins < req.coins) {
    missing.push(`${req.coins - coins} more Coins (Need ${req.coins})`);
  }
  if (req.boatTier && boatTier < req.boatTier) {
    missing.push(`Boat Hull Tier ${req.boatTier}`);
  }
  if (req.highTensionLvl && lineTensionLvl < req.highTensionLvl) {
    missing.push(`High-Tension Line Lv${req.highTensionLvl}`);
  }

  return {
    canUnlock: missing.length === 0,
    missing,
  };
}


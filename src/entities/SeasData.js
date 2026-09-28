// SeasData.js — The Seven Fantasy Seas
// Rich world data, environmental aesthetics, gates, coordinates, and hotspots

export const FANTASY_SEAS = [
  {
    id: 1,
    name: 'Sunlit Shoals',
    subtitle: 'The Cradle of Anglers',
    icon: '🏝️',
    coordinates: "42° 18' N, 70° 52' W",
    minDepth: 0,
    maxDepth: 45,
    topColor: '#38bdf8',
    bottomColor: '#0284c7',
    skyTop: '#bae6fd',
    skyMiddle: '#e0f2fe',
    skyHorizon: '#f0f9ff',
    waterSurfaceColor: 'rgba(56, 189, 248, 0.4)',
    particleType: 'light_rays',
    ambientLight: 1.0,
    description: 'Breezy coastal blues, warm sunbeams, and gentle sandy shoals teeming with lively reef species.',
    lore: 'Where every novice mariner casts their first line. The tide is gentle and the gulls sing welcoming melodies.',
    gates: {
      reqLevel: 0,
      reqVessel: 0, // Weathered Dinghy
      reqTackle: null,
      unlockFee: 0,
    },
    hotspots: [
      { name: "Anemone Haven", type: "Reef Nursery", bonus: "+15% Common & Uncommon Catch Rate", coords: [120, 80] },
      { name: "Pelican's Perch", type: "Sunken Sandbar", bonus: "Occasional Drift Bottles & Pearls", coords: [280, 110] },
      { name: "Shallow Shallows", type: "Starter Shelf", bonus: "Calm Waves, Zero Storm Hazards", coords: [460, 60] },
    ],
    weatherCurrent: 'Gentle Trade Winds',
  },
  {
    id: 2,
    name: 'Bioluminescent Trench',
    subtitle: 'The Neon Shimmer Deep',
    icon: '🔮',
    coordinates: "28° 44' N, 64° 19' W",
    minDepth: 45,
    maxDepth: 105,
    topColor: '#0c4a6e',
    bottomColor: '#3b0764',
    skyTop: '#1e1b4b',
    skyMiddle: '#2e1065',
    skyHorizon: '#581c87',
    waterSurfaceColor: 'rgba(168, 85, 247, 0.45)',
    particleType: 'biolum_plankton',
    ambientLight: 0.75,
    description: 'A deep violet and neon-cyan abyss illuminated by floating photophores, pulsating jellies, and glowing plankton.',
    lore: 'Sunlight never pierces this canyon; instead, ancient algae and crystal corals radiate their own cold, ethereal twilight.',
    gates: {
      reqLevel: 3,
      reqVessel: 1, // Coastal Dory
      reqTackle: { id: 'lineLength', level: 1, label: 'Line Length Lv. 1 (80m+)' },
      unlockFee: 200,
    },
    hotspots: [
      { name: "Glow-Squid Rift", type: "Luminescent Trench", bonus: "+25% Rare Neon Catch Rate", coords: [150, 140] },
      { name: "Phosphor Chasm", type: "Deep Plankton Well", bonus: "High Bioluminescent XP Multiplier", coords: [320, 190] },
      { name: "Violet Shelf", type: "Crystal Coral", bonus: "+20% Shiny Variant Chance", coords: [500, 120] },
    ],
    weatherCurrent: 'Luminous Thermal Drift',
  },
  {
    id: 3,
    name: 'Astral Shimmerfall',
    subtitle: 'Where Constellations Bathe',
    icon: '✨',
    coordinates: "15° 12' S, 142° 30' W",
    minDepth: 105,
    maxDepth: 180,
    topColor: '#1e1b4b',
    bottomColor: '#0f172a',
    skyTop: '#0f172a',
    skyMiddle: '#1e1b4b',
    skyHorizon: '#312e81',
    waterSurfaceColor: 'rgba(99, 102, 241, 0.4)',
    particleType: 'starlight_dust',
    ambientLight: 0.6,
    description: 'Starlit crystalline waters mirroring brilliant nebula skies, with cascades of meteor dust and floating crystal shards.',
    lore: 'Legend tells of a fallen comet that shattered upon the sea, embedding starlight into the scales of every creature that dwells here.',
    gates: {
      reqLevel: 5,
      reqVessel: 1, // Coastal Dory
      reqTackle: { id: 'abyssalLantern', level: 1, label: 'Abyssal Lantern Lv. 1' },
      unlockFee: 500,
    },
    hotspots: [
      { name: "Nebula Eddy", type: "Starlight Vortex", bonus: "+30% Meteor Dust & Gem Drops", coords: [180, 160] },
      { name: "Star-Weaver Nursery", type: "Astral Shallows", bonus: "Higher Legendary Spawns under Clear Skies", coords: [360, 130] },
      { name: "Prism Reef", type: "Refractive Crystal", bonus: "+35% Rare Fish Value", coords: [480, 210] },
    ],
    weatherCurrent: 'Meteor Dust Cascades',
  },
  {
    id: 4,
    name: 'Sunken Atlantis',
    subtitle: 'The Gilded Marble Ruins',
    icon: '🏛️',
    coordinates: "34° 05' N, 25° 40' E",
    minDepth: 180,
    maxDepth: 280,
    topColor: '#064e3b',
    bottomColor: '#022c22',
    skyTop: '#064e3b',
    skyMiddle: '#065f46',
    skyHorizon: '#047857',
    waterSurfaceColor: 'rgba(16, 185, 129, 0.35)',
    particleType: 'emerald_bubbles',
    ambientLight: 0.45,
    description: 'Submerged classical marble pillars, emerald currents, ancient brass automatons, and moss-draped amphitheaters.',
    lore: 'The sovereign metropolis swallowed by an ancient deluge. Its clocks still tick and its gilded treasures rest untouched.',
    gates: {
      reqLevel: 8,
      reqVessel: 2, // Expedition Trawler
      reqTackle: { id: 'treasureSonar', level: 1, label: 'Treasure Sonar Lv. 1' },
      unlockFee: 1200,
    },
    hotspots: [
      { name: "Sunken Amphitheater", type: "Gilded Relic Field", bonus: "High Ancient Relic Dredging Rate", coords: [140, 240] },
      { name: "Imperial Clocktower", type: "Automaton Forge", bonus: "Clockwork Nautilus Encounter Point", coords: [310, 270] },
      { name: "Emerald Atoll", type: "Sovereign Sanctuary", bonus: "+25% Relic Restoration Value", coords: [490, 220] },
    ],
    weatherCurrent: 'Submerged Tide Current',
  },
  {
    id: 5,
    name: 'Whispering Aether Sea',
    subtitle: 'The Sky-Islands Horizon',
    icon: '🪶',
    coordinates: "02° 33' N, 110° 15' E",
    minDepth: 280,
    maxDepth: 410,
    topColor: '#4c1d95',
    bottomColor: '#172554',
    skyTop: '#701a75',
    skyMiddle: '#86198f',
    skyHorizon: '#a21caf',
    waterSurfaceColor: 'rgba(217, 70, 239, 0.35)',
    particleType: 'lilac_winds',
    ambientLight: 0.35,
    description: 'Cloud-shrouded floating sky-islands, lilac winds, shimmering cloud-fins, and gentle celestial wind chimes.',
    lore: 'An impossible sea lifted towards the clouds by volcanic aetherium. Fish here navigate between sea spray and low clouds with equal ease.',
    gates: {
      reqLevel: 11,
      reqVessel: 2, // Expedition Trawler
      reqTackle: { id: 'hookAgility', level: 2, label: 'Hook Agility Lv. 2' },
      unlockFee: 2500,
    },
    hotspots: [
      { name: "Sky-Isle Shallows", type: "Floating Shoal", bonus: "Aetherial XP Multiplier (+50%)", coords: [160, 310] },
      { name: "Lilac Cloud Abyss", type: "Nimbus Basin", bonus: "+30% Winged Fish Catch Rate", coords: [350, 340] },
      { name: "Seraph Perch", type: "High Aether Spire", bonus: "High Windfall Crate Bounty", coords: [520, 290] },
    ],
    weatherCurrent: 'Brisk Aether Shimmer',
  },
  {
    id: 6,
    name: 'Magma Caldera Trench',
    subtitle: 'The Smoldering Core',
    icon: '🌋',
    coordinates: "19° 25' S, 175° 38' W",
    minDepth: 410,
    maxDepth: 530,
    topColor: '#7f1d1d',
    bottomColor: '#450a0a',
    skyTop: '#450a0a',
    skyMiddle: '#7f1d1d',
    skyHorizon: '#991b1b',
    waterSurfaceColor: 'rgba(239, 68, 68, 0.4)',
    particleType: 'volcanic_embers',
    ambientLight: 0.25,
    description: 'Volcanic reefs, cooled obsidian spires, floating glowing embers, and superheated hydrothermal vents.',
    lore: 'The beating thermal heart of the Seven Seas. Only heavily armored vessels and heat-forged lines dare plumb these bubbling depths.',
    gates: {
      reqLevel: 14,
      reqVessel: 3, // Grand Schooner
      reqTackle: { id: 'lineArmor', level: 3, label: 'Line Armor Lv. 3 (Shields)' },
      unlockFee: 5000,
    },
    hotspots: [
      { name: "Obsidian Spire", type: "Volcanic Chimney", bonus: "Golden Coelacanth Habitat", coords: [190, 420] },
      { name: "Molten Trench", type: "Thermal Rift", bonus: "+40% Black Opal & Gem Value", coords: [370, 460] },
      { name: "Cinder Crater", type: "Magma Pool", bonus: "High Prehistoric Fossil Spawn", coords: [510, 410] },
    ],
    weatherCurrent: 'Thermal Magma Updrafts',
  },
  {
    id: 7,
    name: 'Eldritch Chrono Void',
    subtitle: 'The Infinite Starlight Tide',
    icon: '🌌',
    coordinates: "??° ??' ??, ??° ??' ??",
    minDepth: 530,
    maxDepth: 2650,
    topColor: '#09090b',
    bottomColor: '#000000',
    skyTop: '#020617',
    skyMiddle: '#090d16',
    skyHorizon: '#1e1b4b',
    waterSurfaceColor: 'rgba(56, 189, 248, 0.5)',
    particleType: 'cosmic_aurora',
    ambientLight: 0.15,
    description: 'Iridescent aurora waves, space-whale silhouettes drifting in the background, time distortion rings, and cosmic silence.',
    lore: 'Where time curves back upon itself. Reaching the Chrono Tide is the crowning triumph of only the most patient masters of the rod.',
    gates: {
      reqLevel: 18,
      reqVessel: 4, // Mythic Celestial Ketch
      reqTackle: { id: 'fishingRod', level: 4, label: 'Gilded Sovereign Rod+' },
      unlockFee: 12000,
    },
    hotspots: [
      { name: "Singularity Well", type: "Chrono Eddy", bonus: "Celestial Reliquary Crate Vault", coords: [210, 560] },
      { name: "Aurora Event Horizon", type: "Cosmic Rift", bonus: "Legendary Titans Pulse Every 2 Mins", coords: [390, 590] },
      { name: "Eternity Deep", type: "Apex Trench", bonus: "Maximum Selling Bonus (+100%)", coords: [540, 540] },
    ],
    weatherCurrent: 'Cosmic Temporal Flux',
  },
];

export function getSeaById(id) {
  const numId = parseInt(id, 10) || 1;
  return FANTASY_SEAS.find((s) => s.id === numId) || FANTASY_SEAS[0];
}

export function canUnlockSea(sea, saveSystem) {
  if (!sea || !saveSystem) return { canUnlock: false, reason: 'Invalid data' };
  const playerLevel = saveSystem.data.level;
  const vesselLevel = saveSystem.getUpgradeLevel('boatVessel') || 0;
  const coins = saveSystem.data.coins;

  if (playerLevel < sea.gates.reqLevel) {
    return { canUnlock: false, reason: `Requires Angler Level ${sea.gates.reqLevel}` };
  }
  if (vesselLevel < sea.gates.reqVessel) {
    const vesselName = ['Weathered Dinghy', 'Coastal Dory', 'Expedition Trawler', 'Grand Schooner', 'Mythic Celestial Ketch'][sea.gates.reqVessel];
    return { canUnlock: false, reason: `Requires Vessel Tier: ${vesselName}` };
  }
  if (sea.gates.reqTackle) {
    const currentTackleLvl = saveSystem.getUpgradeLevel(sea.gates.reqTackle.id) || 0;
    if (currentTackleLvl < sea.gates.reqTackle.level) {
      return { canUnlock: false, reason: `Requires ${sea.gates.reqTackle.label}` };
    }
  }
  if (coins < sea.gates.unlockFee) {
    return { canUnlock: false, reason: `Insufficient gold: Costs $${sea.gates.unlockFee.toLocaleString()}` };
  }

  return { canUnlock: true, reason: null };
}

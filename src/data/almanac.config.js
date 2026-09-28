import { REALM_RELICS } from './RelicsData.js';
import { FISH_SPECIES } from './FishData.js';
import { LEGENDARY_SPECIES } from './legendaries.js';
import { FANTASY_SEAS } from '../entities/SeasData.js';
// almanac.config.js — The Angler's Almanac (Bestiary) Config & Zone Milestones
// Complete 7 Fantasy Seas coverage with discovery hints, grading tiers, and permanent zone perks

export const CATCH_GRADES = {
  Small: {
    id: 'Small',
    label: 'Small Catch',
    icon: '🐟',
    color: '#94a3b8',
    multiplier: 0.85,
    badgeClass: 'grade-small',
  },
  Average: {
    id: 'Average',
    label: 'Average Specimen',
    icon: '✨',
    color: '#38bdf8',
    multiplier: 1.0,
    badgeClass: 'grade-average',
  },
  Trophy: {
    id: 'Trophy',
    label: '🏆 Trophy Catch',
    icon: '🏆',
    color: '#a855f7',
    multiplier: 1.5,
    badgeClass: 'grade-trophy',
    sound: 'rareChime',
  },
  Monster: {
    id: 'Monster',
    label: '👑 Monster Leviathan',
    icon: '👑',
    color: '#f59e0b',
    multiplier: 3.0,
    badgeClass: 'grade-monster',
    sound: 'legendaryFanfare',
  },
};

/**
 * Calculates randomized catch grade based on size ratio within species parameters
 */
export function calculateGradeTier(species, size, weight) {
  if (!species || !species.sizeRange) return CATCH_GRADES.Average;

  const [minCm, maxCm] = species.sizeRange;
  const range = maxCm - minCm;
  if (range <= 0) return CATCH_GRADES.Average;

  const percentile = (size - minCm) / range;

  // Monster: top 4% (>= 0.96)
  if (percentile >= 0.96) {
    return CATCH_GRADES.Monster;
  }
  // Trophy: top 12% (>= 0.88)
  if (percentile >= 0.88) {
    return CATCH_GRADES.Trophy;
  }
  // Small: bottom 20% (<= 0.20)
  if (percentile <= 0.20) {
    return CATCH_GRADES.Small;
  }
  return CATCH_GRADES.Average;
}

export const ZONE_ALMANAC_DATA = {
  sea_1: {
    id: 'sea_1',
    numId: 1,
    name: 'Sunlit Shoals',
    subtitle: 'The Cradle of Anglers',
    icon: '🏝️',
    depthRange: '0 - 45m',
    themeColor: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.35), rgba(15, 23, 42, 0.85))',
    description: 'Breezy turquoise coastal blues, warm sunbeams, and gentle sandy shoals teeming with lively reef species.',
    speciesIds: [
      'minnow',
      'sardine',
      'sand_flounder',
      'clownfish',
      'blue_tang',
      'golden_seahorse',
      'rainbow_parrotfish',
      'coral_butterfly',
      'driftwood_branch',
      'kelp_strand',
      'rusty_can',
    ],
    relicIds: ['antique_compass', 'ancient_amphora'],
    hints: {
      minnow: { weather: 'Clear / Any', time: 'Day / Any', bait: 'Breadcrumbs / Basic Worm', depth: '1 - 25m' },
      sardine: { weather: 'Any', time: 'Day / Dawn', bait: 'Plankton Lure', depth: '2 - 35m' },
      sand_flounder: { weather: 'Clear / Calm', time: 'Any', bait: 'Sandy Grub', depth: '5 - 40m' },
      clownfish: { weather: 'Clear Waters', time: 'Sunlit Noon', bait: 'Anemone Shrimp', depth: '8 - 45m' },
      blue_tang: { weather: 'Clear / Sunny', time: 'Day', bait: 'Algae Flakes', depth: '10 - 42m' },
      golden_seahorse: { weather: 'Rain / Mist', time: 'Dawn / Dusk', bait: 'Gilded Krill', depth: '15 - 45m' },
      rainbow_parrotfish: { weather: 'Clear Skies', time: 'Midday', bait: 'Coral Polyps', depth: '12 - 40m' },
      coral_butterfly: { weather: 'Calm Breeze', time: 'Dawn / Day', bait: 'Bright Feathers', depth: '6 - 36m' },
      driftwood_branch: { weather: 'Rain / Mist', time: 'Any', bait: 'Surface Dredge', depth: '1 - 30m' },
      kelp_strand: { weather: 'Any', time: 'Any', bait: 'Weedless Hook', depth: '2 - 35m' },
      rusty_can: { weather: 'Any', time: 'Any', bait: 'Magnet Sonar', depth: '3 - 40m' },
    },
    perk: {
      id: 'shallows_mastery',
      title: 'Shoals Reel Mastery',
      icon: '⚡',
      description: '+15% Line Reel Speed when fishing in coastal waters.',
      speedMultiplier: 1.15,
    },
  },

  sea_2: {
    id: 'sea_2',
    numId: 2,
    name: 'Bioluminescent Trench',
    subtitle: 'The Neon Shimmer Deep',
    icon: '🔮',
    depthRange: '45 - 105m',
    themeColor: '#c084fc',
    bgGradient: 'linear-gradient(135deg, rgba(88, 28, 135, 0.45), rgba(15, 23, 42, 0.85))',
    description: 'A deep violet and neon-cyan abyss illuminated by floating photophores, pulsating jellies, and glowing plankton.',
    speciesIds: [
      'channel_catfish',
      'mudskipper',
      'alligator_gar',
      'swamp_bass',
      'moonlit_koi',
      'neon_squid',
      'plankton_glider',
      'cyan_viperfish',
      'ghost_jelly',
      'mossback_leviathan',
      'mangrove_roots',
      'glowing_moss',
      'sunken_artifact',
    ],
    relicIds: ['rusted_cutlass', 'ship_bell'],
    hints: {
      channel_catfish: { weather: 'Rain / Fog', time: 'Dusk / Night', bait: 'Stink Bait', depth: '45 - 90m' },
      mudskipper: { weather: 'Dense Mist', time: 'Dawn / Day', bait: 'Mud Worms', depth: '45 - 65m' },
      alligator_gar: { weather: 'Thunderstorm', time: 'Night', bait: 'Live Minnow', depth: '50 - 100m' },
      swamp_bass: { weather: 'Rain', time: 'Dusk', bait: 'Frog Lure', depth: '45 - 85m' },
      moonlit_koi: { weather: 'Clear / Calm', time: 'Night', bait: 'Lotus Seed', depth: '50 - 95m' },
      neon_squid: { weather: 'Any', time: 'Night', bait: 'Phosphor Jig', depth: '60 - 105m' },
      plankton_glider: { weather: 'Mist / Fog', time: 'Dusk', bait: 'Micro Grubs', depth: '48 - 80m' },
      cyan_viperfish: { weather: 'Thunderstorm', time: 'Night', bait: 'Biolum Lure', depth: '70 - 105m' },
      ghost_jelly: { weather: 'Any', time: 'Night / Dark', bait: 'Luminescent Spore', depth: '65 - 105m' },
      mossback_leviathan: { weather: 'Fog / Rain', time: 'Dawn', bait: 'Ancient Kelp', depth: '45 - 105m' },
      mangrove_roots: { weather: 'Any', time: 'Any', bait: 'Heavy Line', depth: '45 - 75m' },
      glowing_moss: { weather: 'Night', time: 'Night', bait: 'Luminescent Hook', depth: '50 - 100m' },
      sunken_artifact: { weather: 'Fog / Calm', time: 'Any', bait: 'Treasure Sonar', depth: '55 - 105m' },
    },
    perk: {
      id: 'swamp_immunity',
      title: 'Bioluminescent Attunement',
      icon: '💡',
      description: '+25% Chance to attract rare shiny and mutated glow variants in deep waters.',
      shinyBoost: 0.25,
    },
  },

  sea_3: {
    id: 'sea_3',
    numId: 3,
    name: 'Astral Shimmerfall',
    subtitle: 'Where Constellations Bathe',
    icon: '✨',
    depthRange: '105 - 180m',
    themeColor: '#818cf8',
    bgGradient: 'linear-gradient(135deg, rgba(49, 46, 129, 0.45), rgba(15, 23, 42, 0.85))',
    description: 'Starlit crystalline waters mirroring brilliant nebula skies, with cascades of meteor dust and floating crystal shards.',
    speciesIds: [
      'deep_anglerfish',
      'gulper_eel',
      'viperfish',
      'chrono_guppy',
      'prism_fin',
      'astral_shimmer_ray',
      'starlight_angler',
      'comet_dart',
      'aurora_sailfin',
      'phosphor_crystal',
      'sunken_anchor',
      'abyssal_chimera',
      'abyssal_vent',
    ],
    relicIds: ['nautical_astrolabe', 'sunken_safe'],
    hints: {
      deep_anglerfish: { weather: 'Any', time: 'Night / Dark', bait: 'Biolum Jig', depth: '105 - 170m' },
      gulper_eel: { weather: 'Any', time: 'Night', bait: 'Deep Squid', depth: '115 - 180m' },
      viperfish: { weather: 'Thunderstorm', time: 'Any', bait: 'Phosphor Grubs', depth: '110 - 175m' },
      chrono_guppy: { weather: 'Clear Night', time: 'Midnight', bait: 'Stardust Dust', depth: '105 - 145m' },
      prism_fin: { weather: 'Clear / Starlight', time: 'Dusk / Night', bait: 'Crystal Shard', depth: '120 - 165m' },
      astral_shimmer_ray: { weather: 'Clear Skies', time: 'Night', bait: 'Nebula Worm', depth: '130 - 180m' },
      starlight_angler: { weather: 'Any', time: 'Night', bait: 'Glowing Larva', depth: '125 - 180m' },
      comet_dart: { weather: 'Meteor Dust', time: 'Night', bait: 'Swift Feather', depth: '110 - 160m' },
      aurora_sailfin: { weather: 'Clear', time: 'Dusk / Night', bait: 'Prismatic Lure', depth: '105 - 180m' },
      phosphor_crystal: { weather: 'Any', time: 'Night', bait: 'Magnet Sonar', depth: '120 - 180m' },
      sunken_anchor: { weather: 'Any', time: 'Any', bait: 'Heavy Winch', depth: '135 - 180m' },
      abyssal_chimera: { weather: 'Thunderstorm', time: 'Night', bait: 'Glow Essence', depth: '140 - 180m' },
      abyssal_vent: { weather: 'Any', time: 'Any', bait: 'Thermal Armor', depth: '130 - 175m' },
    },
    perk: {
      id: 'astral_grace',
      title: 'Starlight Stabilizer',
      icon: '⭐',
      description: 'Dampens high-tension line surges and snaps by 35% in deep waters.',
      surgeDampener: 0.35,
    },
  },

  sea_4: {
    id: 'sea_4',
    numId: 4,
    name: 'Sunken Atlantis',
    subtitle: 'The Gilded Marble Ruins',
    icon: '🏛️',
    depthRange: '180 - 280m',
    themeColor: '#34d399',
    bgGradient: 'linear-gradient(135deg, rgba(6, 78, 59, 0.45), rgba(15, 23, 42, 0.85))',
    description: 'Submerged classical marble pillars, emerald currents, ancient brass automatons, and moss-draped amphitheaters.',
    speciesIds: [
      'obsidian_pike',
      'magma_ray',
      'fire_conch',
      'cinder_coelacanth',
      'marble_sunken_bass',
      'gilded_automaton_fish',
      'emerald_coral_eel',
      'atlantis_sun_core',
      'brass_gear_crab',
      'whispering_siren_ray',
      'lava_geode',
      'obsidian_rock',
    ],
    relicIds: ['pirate_captain_journal', 'cinder_relic', 'ancient_amphora'],
    hints: {
      obsidian_pike: { weather: 'Any', time: 'Dusk / Night', bait: 'Molten Lure', depth: '180 - 270m' },
      magma_ray: { weather: 'Clear / Thunder', time: 'Any', bait: 'Fire Worm', depth: '200 - 280m' },
      fire_conch: { weather: 'Any', time: 'Day', bait: 'Shell Clamp', depth: '190 - 260m' },
      cinder_coelacanth: { weather: 'Thunderstorm', time: 'Night', bait: 'Basalt Core', depth: '220 - 280m' },
      marble_sunken_bass: { weather: 'Calm', time: 'Day / Dusk', bait: 'Pillar Moss', depth: '185 - 250m' },
      gilded_automaton_fish: { weather: 'Clear Waters', time: 'Midday', bait: 'Brass Cog', depth: '210 - 280m' },
      emerald_coral_eel: { weather: 'Any', time: 'Any', bait: 'Emerald Shrimp', depth: '195 - 265m' },
      atlantis_sun_core: { weather: 'Clear / Sunlit', time: 'Noon', bait: 'Solar Crystal', depth: '230 - 280m' },
      brass_gear_crab: { weather: 'Any', time: 'Night', bait: 'Clockwork Pin', depth: '185 - 245m' },
      whispering_siren_ray: { weather: 'Clear', time: 'Dusk / Night', bait: 'Harmonic Shell', depth: '180 - 280m' },
      lava_geode: { weather: 'Any', time: 'Any', bait: 'Magnet Sonar', depth: '200 - 280m' },
      obsidian_rock: { weather: 'Any', time: 'Any', bait: 'Heavy Line', depth: '190 - 270m' },
    },
    perk: {
      id: 'atlantis_fortune',
      title: 'Gilded Antiquity Surge',
      icon: '🏺',
      description: '+30% Sell Value for ancient relics, artifacts, and mechanical catches.',
      sellBonus: 0.30,
    },
  },

  sea_5: {
    id: 'sea_5',
    numId: 5,
    name: 'Whispering Aether Sea',
    subtitle: 'The Sky-Islands Horizon',
    icon: '🪶',
    depthRange: '280 - 410m',
    themeColor: '#e879f9',
    bgGradient: 'linear-gradient(135deg, rgba(112, 26, 117, 0.45), rgba(15, 23, 42, 0.85))',
    description: 'Cloud-shrouded floating sky-islands, lilac winds, shimmering cloud-fins, and gentle celestial wind chimes.',
    speciesIds: [
      'aether_jelly',
      'cloud_fin',
      'lilac_skate',
      'seraph_fish',
      'aether_wisp_guppy',
      'star_weaver',
    ],
    relicIds: ['nautical_astrolabe', 'cinder_relic'],
    hints: {
      aether_jelly: { weather: 'Lilac Mist', time: 'Dusk / Night', bait: 'Aether Spore', depth: '280 - 360m' },
      cloud_fin: { weather: 'Clear / Breezy', time: 'Day', bait: 'Nimbus Feather', depth: '290 - 380m' },
      lilac_skate: { weather: 'Any', time: 'Dawn / Dusk', bait: 'Violet Plankton', depth: '310 - 400m' },
      seraph_fish: { weather: 'Clear Skies', time: 'Day / Noon', bait: 'Celestial Dew', depth: '320 - 410m' },
      aether_wisp_guppy: { weather: 'Any', time: 'Night', bait: 'Glowing Spark', depth: '285 - 350m' },
      star_weaver: { weather: 'Clear Night', time: 'Night', bait: 'Starlight Core', depth: '280 - 410m' },
    },
    perk: {
      id: 'aether_levitation',
      title: 'Aether Weightlessness',
      icon: '🪶',
      description: '+25% Hook Steering Agility and maneuverability across all deep dives.',
      agilityBonus: 0.25,
    },
  },

  sea_6: {
    id: 'sea_6',
    numId: 6,
    name: 'Magma Caldera Trench',
    subtitle: 'The Smoldering Core',
    icon: '🌋',
    depthRange: '410 - 530m',
    themeColor: '#f97316',
    bgGradient: 'linear-gradient(135deg, rgba(127, 29, 29, 0.5), rgba(15, 23, 42, 0.85))',
    description: 'Volcanic reefs, cooled obsidian spires, floating glowing embers, and superheated hydrothermal vents.',
    speciesIds: [
      'sunfire_eel',
      'caldera_crab',
      'pyroclastic_ray',
      'obsidian_spire_shark',
      'cinder_dory',
      'golden_coelacanth',
    ],
    relicIds: ['cinder_relic', 'sunken_safe'],
    hints: {
      sunfire_eel: { weather: 'Any', time: 'Night', bait: 'Magma Larva', depth: '410 - 490m' },
      caldera_crab: { weather: 'Any', time: 'Any', bait: 'Basalt Claw Trap', depth: '420 - 510m' },
      pyroclastic_ray: { weather: 'Ember Winds', time: 'Dusk', bait: 'Cinder Chunk', depth: '430 - 520m' },
      obsidian_spire_shark: { weather: 'Thunder / Ash', time: 'Night', bait: 'Heavy Iron Rig', depth: '450 - 530m' },
      cinder_dory: { weather: 'Any', time: 'Day', bait: 'Sulfur Flake', depth: '415 - 480m' },
      golden_coelacanth: { weather: 'Clear / Rain', time: 'Any time', bait: 'Pyrite Nugget', depth: '410 - 500m' },
    },
    perk: {
      id: 'pyro_core',
      title: 'Hydrothermal Core Harvest',
      icon: '🔥',
      description: '+35% Sell Value for all fish and minerals caught in volcanic caldera waters.',
      sellBonus: 0.35,
    },
  },

  sea_7: {
    id: 'sea_7',
    numId: 7,
    name: 'Eldritch Chrono Void',
    subtitle: 'The Infinite Starlight Tide',
    icon: '🌌',
    depthRange: '530 - 660m+',
    themeColor: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(2, 6, 23, 0.95))',
    description: 'Iridescent aurora waves, space-whale silhouettes drifting in the background, time distortion rings, and cosmic silence.',
    speciesIds: [
      'phantom_fin',
      'chrono_whale',
      'eldritch_maw',
      'voidray',
      'chrono_siphon',
    ],
    relicIds: ['nautical_astrolabe', 'pirate_captain_journal'],
    hints: {
      phantom_fin: { weather: 'Cosmic Drift', time: 'Night', bait: 'Quantum Particle', depth: '530 - 620m' },
      chrono_whale: { weather: 'Temporal Flux', time: 'Midnight', bait: 'Aether Core', depth: '560 - 660m' },
      eldritch_maw: { weather: 'Void Storm', time: 'Any', bait: 'Forbidden Flesh', depth: '580 - 660m' },
      voidray: { weather: 'Any', time: 'Night', bait: 'Dark Matter Jig', depth: '540 - 640m' },
      chrono_siphon: { weather: 'Temporal Flux', time: 'Dawn / Dusk', bait: 'Hourglass Sand', depth: '550 - 650m' },
    },
    perk: {
      id: 'chrono_mastery',
      title: 'Chrono Time Dilation',
      icon: '⏳',
      description: '+50% Gold value for all catches from the abyssal void and slows hooked fish darts.',
      sellBonus: 0.50,
    },
  },
};

// Build the bestiary from the live roster so additions and moved species are discoverable.
for (const sea of FANTASY_SEAS) {
  const entry = ZONE_ALMANAC_DATA[`sea_${sea.id}`];
  entry.speciesIds = [...FISH_SPECIES, ...LEGENDARY_SPECIES].filter(fish => fish.zone === sea.id).map(fish => fish.id);
  entry.relicIds = REALM_RELICS.filter(relic => relic.zone === sea.id).map(relic => relic.id);
  entry.depthRange = `0 - ${sea.maxDepth}m`;
  // Old hard-coded depth hints no longer describe the expanded ecology.
  for (const id of entry.speciesIds) if (entry.hints[id]) delete entry.hints[id].depth;
}

// Aliases for legacy saves & backwards compatibility
ZONE_ALMANAC_DATA.sunken_shallows = ZONE_ALMANAC_DATA.sea_1;
ZONE_ALMANAC_DATA.whispering_mangrove = ZONE_ALMANAC_DATA.sea_2;
ZONE_ALMANAC_DATA.abyssal_rift = ZONE_ALMANAC_DATA.sea_3;
ZONE_ALMANAC_DATA.volcanic_caldera = ZONE_ALMANAC_DATA.sea_4;
ZONE_ALMANAC_DATA.sunken_atlantis = ZONE_ALMANAC_DATA.sea_4;
ZONE_ALMANAC_DATA.whispering_aether = ZONE_ALMANAC_DATA.sea_5;
ZONE_ALMANAC_DATA.magma_caldera = ZONE_ALMANAC_DATA.sea_6;
ZONE_ALMANAC_DATA.eldritch_void = ZONE_ALMANAC_DATA.sea_7;
ZONE_ALMANAC_DATA['1'] = ZONE_ALMANAC_DATA.sea_1;
ZONE_ALMANAC_DATA['2'] = ZONE_ALMANAC_DATA.sea_2;
ZONE_ALMANAC_DATA['3'] = ZONE_ALMANAC_DATA.sea_3;
ZONE_ALMANAC_DATA['4'] = ZONE_ALMANAC_DATA.sea_4;
ZONE_ALMANAC_DATA['5'] = ZONE_ALMANAC_DATA.sea_5;
ZONE_ALMANAC_DATA['6'] = ZONE_ALMANAC_DATA.sea_6;
ZONE_ALMANAC_DATA['7'] = ZONE_ALMANAC_DATA.sea_7;

/**
 * Returns completion statistics for a specific zone
 */
export function getZoneProgress(zoneId, saveSystem) {
  const zone = ZONE_ALMANAC_DATA[zoneId] || ZONE_ALMANAC_DATA.sea_1;
  if (!zone || !saveSystem) return { caught: 0, total: 0, percent: 0, completed: false, perkUnlocked: false };

  const journal = saveSystem.data.journal || {};
  let caught = 0;
  const total = zone.speciesIds.length;

  zone.speciesIds.forEach((id) => {
    if (journal[id] && (journal[id].count > 0 || journal[id].timesCaught > 0)) {
      caught += 1;
    }
  });

  const percent = total > 0 ? Math.round((caught / total) * 100) : 0;
  const completed = caught >= total;

  if (!saveSystem.data.zonePerks) {
    saveSystem.data.zonePerks = {};
  }
  const perkUnlocked = !!saveSystem.data.zonePerks[zone.perk.id];

  return {
    caught,
    total,
    percent,
    completed,
    perkUnlocked,
    perk: zone.perk,
  };
}

/**
 * Claims a completed zone perk
 */
export function claimZonePerk(zoneId, saveSystem) {
  const progress = getZoneProgress(zoneId, saveSystem);
  if (!progress.completed) {
    return { success: false, reason: 'Complete 100% of this sea bestiary first!' };
  }
  if (progress.perkUnlocked) {
    return { success: false, reason: 'Perk already claimed!' };
  }

  saveSystem.data.zonePerks[progress.perk.id] = true;
  saveSystem.save();
  return { success: true, perk: progress.perk };
}

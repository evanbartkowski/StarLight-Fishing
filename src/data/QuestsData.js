// QuestsData.js — Cozy Harbor Noticeboard & Daily Angler Missions

export const QUEST_POOL = [
  {
    id: 'reef_angler',
    title: 'Sunlit Reef Angler',
    category: 'fishing',
    icon: '🐠',
    description: 'Catch 3 fish from Sea 1: Sunlit Shoals.',
    target: 3,
    rewardCoins: 120,
    rewardXp: 60,
    check: (event, current) => {
      if (event.type === 'catch_fish' && event.fish.zone === 1) return current + 1;
      return current;
    },
  },
  {
    id: 'kelp_forager',
    title: 'Bioluminescent Abyss Explorer',
    category: 'fishing',
    icon: '🌌',
    description: 'Catch 3 fish from Sea 2: Bioluminescent Trench.',
    target: 3,
    rewardCoins: 180,
    rewardXp: 85,
    check: (event, current) => {
      if (event.type === 'catch_fish' && event.fish.zone === 2) return current + 1;
      return current;
    },
  },
  {
    id: 'deep_sounder',
    title: 'Sounding the Deep',
    category: 'exploration',
    icon: '⚓',
    description: 'Descend to at least 90 meters in a single dive.',
    target: 90,
    unit: 'm',
    rewardCoins: 220,
    rewardXp: 100,
    check: (event, current) => {
      if (event.type === 'dive_completed') return Math.max(current, Math.floor(event.maxDepth));
      return current;
    },
  },
  {
    id: 'crate_salvager',
    title: 'Sunken Crate Salvager',
    category: 'treasure',
    icon: '📦',
    description: 'Hook and haul up 1 mystery loot crate or treasure chest.',
    target: 1,
    rewardCoins: 250,
    rewardXp: 110,
    check: (event, current) => {
      if (event.type === 'catch_crate' || (event.type === 'catch_treasure' && event.item?.isCrate)) return current + 1;
      return current;
    },
  },
  {
    id: 'apex_hunter',
    title: 'Apex Ocean Hunter',
    category: 'fishing',
    rarity: 'rare',
    icon: '🌟',
    description: 'Reel in any Epic, Legendary, Mythic, or Deep Titan fish.',
    target: 1,
    rewardCoins: 450,
    rewardXp: 200,
    rewardGems: 2,
    check: (event, current) => {
      if (event.type === 'catch_fish') {
        const r = event.fish.rarity;
        if (r === 'epic' || r === 'legendary' || event.fish.isMythic || event.fish.isSpecialDeep) return current + 1;
      }
      return current;
    },
  },
  {
    id: 'trap_tender',
    title: 'Seabed Pot Tender',
    category: 'idle',
    icon: '🪤',
    description: 'Harvest 2 catches from your passive seabed drift pots.',
    target: 2,
    rewardCoins: 160,
    rewardXp: 75,
    check: (event, current) => {
      if (event.type === 'harvest_traps') return current + (event.count || 1);
      return current;
    },
  },
  {
    id: 'companion_friend',
    title: 'Vessel Crew Bond',
    category: 'cozy',
    icon: '🐾',
    description: "Pet the ship's cat or feed Evan the pelican.",
    target: 1,
    rewardCoins: 140,
    rewardXp: 65,
    check: (event, current) => {
      if (event.type === 'pet_companion') return current + 1;
      return current;
    },
  },
  {
    id: 'clean_dive',
    title: 'Pristine Navigation',
    category: 'skill',
    icon: '⛵',
    description: 'Complete a dive haul without taking any hazard or obstacle hits.',
    target: 1,
    rewardCoins: 200,
    rewardXp: 90,
    check: (event, current) => {
      if (event.type === 'dive_completed' && !event.tookDamage && event.catchesCount >= 1) return current + 1;
      return current;
    },
  },
  {
    id: 'full_basket',
    title: 'Bountiful Line',
    category: 'skill',
    icon: '🪣',
    description: 'Return to the surface with a completely full hook basket.',
    target: 1,
    rewardCoins: 190,
    rewardXp: 85,
    check: (event, current) => {
      if (event.type === 'dive_completed' && event.isFull) return current + 1;
      return current;
    },
  },
  {
    id: 'crown_trophy',
    title: 'Crown Trophy Hunter',
    category: 'fishing',
    rarity: 'rare',
    icon: '👑',
    description: 'Catch any fish that earns a Gold Crown (Giant) or Silver Crown (Mini).',
    target: 1,
    rewardCoins: 350,
    rewardXp: 160,
    rewardGems: 2,
    check: (event, current) => {
      if (event.type === 'catch_fish' && (event.fish.crown === 'gold' || event.fish.crown === 'silver')) {
        return current + 1;
      }
      return current;
    },
  },
  {
    id: 'heavyweight_champ',
    title: 'Heavyweight Catch',
    category: 'fishing',
    rarity: 'rare',
    icon: '⚖️',
    description: 'Catch any fish weighing 15.0 kg or heavier.',
    target: 1,
    rewardCoins: 280,
    rewardXp: 120,
    rewardGems: 1,
    check: (event, current, target, realmId = 1) => {
      const minWeight = getHeavyweightTarget(realmId);
      if (event.type === 'catch_fish' && event.fish.weight >= minWeight) return current + 1;
      return current;
    },
  },
  {
    id: 'pelagic_trawler',
    title: 'Astral Shimmerfall Trawler',
    category: 'fishing',
    icon: '🌌',
    description: 'Catch 2 fish from Sea 3: Astral Shimmerfall.',
    target: 2,
    rewardCoins: 260,
    rewardXp: 110,
    check: (event, current) => {
      if (event.type === 'catch_fish' && event.fish.zone === 3) return current + 1;
      return current;
    },
  },
  {
    id: 'starlight_contract',
    title: 'Starlight Nightfall Contract',
    category: 'fantasy',
    rarity: 'rare',
    icon: '✨',
    description: 'Catch 2 Starlight or Prism specimens from celestial waters.',
    target: 2,
    rewardCoins: 380,
    rewardXp: 150,
    rewardGems: 2,
    check: (event, current) => {
      if (event.type === 'catch_fish' && (event.fish.speciesId === 'starlight_angler' || event.fish.speciesId === 'prism_fin' || event.fish.speciesId === 'chrono_guppy')) {
        return current + 1;
      }
      return current;
    },
  },
  {
    id: 'atlantis_core_contract',
    title: 'Atlantis Core Salvage',
    category: 'fantasy',
    rarity: 'rare',
    icon: '🏛️',
    description: 'Dredge 1 sunken relic, automaton fish, or Sun-Core specimen from Sea 4.',
    target: 1,
    rewardCoins: 480,
    rewardXp: 190,
    rewardGems: 2,
    check: (event, current) => {
      if (event.type === 'catch_fish' && (event.fish.speciesId === 'atlantis_sun_core' || event.fish.speciesId === 'gilded_automaton_fish')) return current + 1;
      if (event.type === 'catch_treasure' && event.item?.era) return current + 1;
      return current;
    },
  },
  {
    id: 'aether_skies_contract',
    title: 'Whispering Aether Contract',
    category: 'fantasy',
    rarity: 'rare',
    icon: '☁️',
    description: 'Catch 2 cloud-dwelling or celestial specimens from Sea 5: Whispering Aether Sea.',
    target: 2,
    rewardCoins: 520,
    rewardXp: 220,
    rewardGems: 3,
    check: (event, current) => {
      if (event.type === 'catch_fish' && (event.fish.zone === 5 || event.fish.speciesId?.includes('aether') || event.fish.speciesId?.includes('cloud'))) return current + 1;
      return current;
    },
  },
  {
    id: 'caldera_lava_contract',
    title: 'Magma Caldera Expedition',
    category: 'fantasy',
    rarity: 'rare',
    icon: '🌋',
    description: 'Catch 2 molten or volcanic creatures from Sea 6: Magma Caldera Trench.',
    target: 2,
    rewardCoins: 580,
    rewardXp: 250,
    rewardGems: 3,
    check: (event, current) => {
      if (event.type === 'catch_fish' && (event.fish.zone === 6 || event.fish.speciesId?.includes('caldera') || event.fish.speciesId?.includes('lava') || event.fish.speciesId?.includes('magma'))) return current + 1;
      return current;
    },
  },
  {
    id: 'void_titan_contract',
    title: 'Chrono Void Expedition',
    category: 'fantasy',
    rarity: 'rare',
    icon: '🌀',
    description: 'Lend your line to the Chrono Void: Catch 1 specimen or descend past 500m.',
    target: 1,
    rewardCoins: 650,
    rewardXp: 280,
    rewardGems: 4,
    check: (event, current) => {
      if (event.type === 'catch_fish' && event.fish.zone === 7) return current + 1;
      if (event.type === 'dive_completed' && event.maxDepth >= 500) return current + 1;
      return current;
    },
  },
];

// Additional short contracts use the same catch and dive events as the noticeboard.
QUEST_POOL.push(
  { id: 'harbor_supper', title: 'Supper for the Harbor', category: 'fishing', icon: '\uD83C\uDF72', description: 'Catch 6 fish of any kind.', target: 6, rewardCoins: 180, rewardXp: 80,
    check: (event, current) => event.type === 'catch_fish' ? current + 1 : current },
  { id: 'silver_scales', title: 'A Flash of Silver', category: 'fishing', icon: '\uD83D\uDC1F', description: 'Catch 3 uncommon or rare fish.', target: 3, rewardCoins: 240, rewardXp: 100,
    check: (event, current) => event.type === 'catch_fish' && ['uncommon', 'rare'].includes(event.fish.rarity) ? current + 1 : current },
  { id: 'salvage_patrol', title: 'Salvage Patrol', category: 'treasure', icon: '\u2693', description: 'Bring up 2 treasures, fossils, or crates.', target: 2, rewardCoins: 260, rewardXp: 110,
    check: (event, current) => event.type === 'catch_treasure' ? current + 1 : current },
  { id: 'sealed_surprise', title: 'A Sealed Surprise', category: 'treasure', icon: '\uD83D\uDCE6', description: 'Open a mystery crate from your inventory.', target: 1, rewardCoins: 160, rewardXp: 80,
    check: (event, current) => event.type === 'open_crate' ? current + 1 : current },
  { id: 'steady_hands', title: 'Steady Hands', category: 'skill', rarity: 'rare', rewardGems: 1, icon: '\u26F5', description: 'Finish 2 dives with at least one catch and no hazard hits.', target: 2, rewardCoins: 300, rewardXp: 130,
    check: (event, current) => event.type === 'dive_completed' && !event.tookDamage && event.catchesCount > 0 ? current + 1 : current },
  { id: 'three_good_trips', title: 'Three Good Trips', category: 'exploration', icon: '\uD83E\uDDED', description: 'Return from 3 dives carrying at least one catch.', target: 3, rewardCoins: 220, rewardXp: 100,
    check: (event, current) => event.type === 'dive_completed' && event.catchesCount > 0 ? current + 1 : current },
);

/**
 * Returns realm-tailored target sounding depths that fit naturally within each sea's bathymetry.
 */
export function getSoundingTarget(realmId = 1) {
  const depths = { 1: 30, 2: 80, 3: 180, 4: 280, 5: 420, 6: 650, 7: 1000 };
  return depths[realmId] || 90;
}

/**
 * Returns realm-tailored minimum fish weight thresholds scaled to local species sizes.
 */
export function getHeavyweightTarget(realmId = 1) {
  const weights = { 1: 2.0, 2: 6.0, 3: 14.0, 4: 25.0, 5: 40.0, 6: 65.0, 7: 100.0 };
  return weights[realmId] || 15.0;
}

/**
 * Scales quest objective targets to reflect the depth, scale, and difficulty of the contracted realm.
 */
export function getQuestTargetForRealm(def, realmId = 1) {
  if (!def) return 1;
  const r = Math.max(1, Math.min(7, Number(realmId) || 1));
  switch (def.id) {
    case 'deep_sounder':
      return getSoundingTarget(r);
    case 'harbor_supper':
      // Scales 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10
      return 3 + r;
    case 'silver_scales':
      // Scales 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8
      return 1 + r;
    case 'salvage_patrol':
      return r <= 2 ? 2 : r <= 4 ? 3 : 4;
    case 'steady_hands':
      return r <= 2 ? 2 : r <= 4 ? 3 : 4;
    case 'three_good_trips':
      return r <= 2 ? 3 : r <= 4 ? 4 : 5;
    case 'trap_tender':
      return r <= 2 ? 2 : r <= 4 ? 3 : 4;
    case 'crate_salvager':
      return r <= 3 ? 1 : 2;
    case 'apex_hunter':
      return r <= 3 ? 1 : 2;
    case 'sealed_surprise':
      return r <= 3 ? 1 : 2;
    default:
      return def.target || 1;
  }
}

/**
 * Returns a realm-tailored, dynamic description matching the contracted objective.
 */
export function getQuestDescriptionForRealm(def, realmId = 1, target = null) {
  if (!def) return '';
  const r = Math.max(1, Math.min(7, Number(realmId) || 1));
  const t = target || getQuestTargetForRealm(def, r);

  if (def.id === 'deep_sounder') {
    return `Descend to at least ${t} meters in a single dive.`;
  }
  if (def.id === 'heavyweight_champ') {
    const minW = getHeavyweightTarget(r);
    return `Catch any fish weighing ${minW.toFixed(1)} kg or heavier.`;
  }
  if (def.id === 'harbor_supper') {
    return `Catch ${t} fish of any kind.`;
  }
  if (def.id === 'silver_scales') {
    return `Catch ${t} uncommon or rare fish.`;
  }
  if (def.id === 'salvage_patrol') {
    return `Bring up ${t} treasures, fossils, or crates.`;
  }
  if (def.id === 'steady_hands') {
    return `Finish ${t} dives with at least one catch and no hazard hits.`;
  }
  if (def.id === 'three_good_trips') {
    return `Return from ${t} dives carrying at least one catch.`;
  }
  if (def.id === 'trap_tender') {
    return `Harvest ${t} catches from your passive seabed drift pots.`;
  }
  if (def.id === 'crate_salvager') {
    return `Hook and haul up ${t} mystery loot ${t > 1 ? 'crates or treasure chests' : 'crate or treasure chest'}.`;
  }
  if (def.id === 'apex_hunter') {
    return `Reel in ${t} Epic, Legendary, Mythic, or Deep Titan ${t > 1 ? 'specimens' : 'fish'}.`;
  }
  if (def.id === 'sealed_surprise') {
    return `Open ${t} mystery ${t > 1 ? 'crates' : 'crate'} from your inventory.`;
  }
  return def.description;
}

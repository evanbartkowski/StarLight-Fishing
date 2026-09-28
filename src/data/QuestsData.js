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
    icon: '🌟',
    description: 'Reel in any Epic, Legendary, Mythic, or Deep Titan fish.',
    target: 1,
    rewardCoins: 450,
    rewardXp: 200,
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
    icon: '👑',
    description: 'Catch any fish that earns a Gold Crown (Giant) or Silver Crown (Mini).',
    target: 1,
    rewardCoins: 350,
    rewardXp: 160,
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
    icon: '⚖️',
    description: 'Catch any fish weighing 15.0 kg or heavier.',
    target: 1,
    rewardCoins: 280,
    rewardXp: 120,
    check: (event, current) => {
      if (event.type === 'catch_fish' && event.fish.weight >= 15.0) return current + 1;
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
    icon: '✨',
    description: 'Catch 2 Starlight or Prism specimens from celestial waters.',
    target: 2,
    rewardCoins: 380,
    rewardXp: 150,
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
    icon: '🏛️',
    description: 'Dredge 1 sunken relic, automaton fish, or Sun-Core specimen from Sea 4.',
    target: 1,
    rewardCoins: 480,
    rewardXp: 190,
    check: (event, current) => {
      if (event.type === 'catch_fish' && (event.fish.speciesId === 'atlantis_sun_core' || event.fish.speciesId === 'gilded_automaton_fish')) return current + 1;
      if (event.type === 'catch_treasure' && event.item?.era) return current + 1;
      return current;
    },
  },
  {
    id: 'void_titan_contract',
    title: 'Chrono Void Expedition',
    category: 'fantasy',
    icon: '🌀',
    description: 'Lend your line to the Chrono Void: Catch 1 specimen or descend past 500m.',
    target: 1,
    rewardCoins: 650,
    rewardXp: 280,
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
  { id: 'steady_hands', title: 'Steady Hands', category: 'skill', icon: '\u26F5', description: 'Finish 2 dives with at least one catch and no hazard hits.', target: 2, rewardCoins: 300, rewardXp: 130,
    check: (event, current) => event.type === 'dive_completed' && !event.tookDamage && event.catchesCount > 0 ? current + 1 : current },
  { id: 'three_good_trips', title: 'Three Good Trips', category: 'exploration', icon: '\uD83E\uDDED', description: 'Return from 3 dives carrying at least one catch.', target: 3, rewardCoins: 220, rewardXp: 100,
    check: (event, current) => event.type === 'dive_completed' && event.catchesCount > 0 ? current + 1 : current },
);

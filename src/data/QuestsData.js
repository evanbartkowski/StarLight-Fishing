// QuestsData.js — Cozy Harbor Noticeboard & Daily Angler Missions

export const QUEST_POOL = [
  {
    id: 'reef_angler',
    title: 'Sunlit Reef Angler',
    category: 'fishing',
    icon: '🐠',
    description: 'Catch 3 fish from Sea 1: Sunlit Coral Haven.',
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
    title: 'Kelp Canopy Forager',
    category: 'fishing',
    icon: '🌿',
    description: 'Catch 3 fish from Sea 2: Emerald Kelp Forest.',
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
    description: 'Reel in any Epic, Legendary, or Mythic fish.',
    target: 1,
    rewardCoins: 450,
    rewardXp: 200,
    check: (event, current) => {
      if (event.type === 'catch_fish') {
        const r = event.fish.rarity;
        if (r === 'epic' || r === 'legendary' || event.fish.isMythic) return current + 1;
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
    description: "Pet the ship's cat or feed Captain Pete the pelican.",
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
    title: 'Pelagic Open-Water Trawler',
    category: 'fishing',
    icon: '🌊',
    description: 'Catch 2 fish from Sea 3: Twilight Pelagic Sea.',
    target: 2,
    rewardCoins: 260,
    rewardXp: 110,
    check: (event, current) => {
      if (event.type === 'catch_fish' && event.fish.zone === 3) return current + 1;
      return current;
    },
  },
];

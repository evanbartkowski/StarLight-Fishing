export const DAILY_MYSTERY_POOL = [
  { id: 'sirens_grace_draught', name: "Siren's Grace Draught", icon: '🌊', desc: "Boosts Rare+ fish encounters for 4 min!", buffId: 'sirensGrace', durationMs: 240000, rarity: 'rare' },
  { id: 'starlight_sight_lens', name: 'Starlight Sight Lens', icon: '🌟', desc: 'Reveals hidden fish silhouettes for 4 min!', buffId: 'starlightClarity', durationMs: 240000, rarity: 'rare' },
  { id: 'surveyor_chart', name: "Cartographer's Secret Map", icon: '🗺️', desc: 'Marks a high-yield fishing hotspot for 4 min!', buffId: 'cartographerMark', durationMs: 240000, rarity: 'rare' },
  { id: 'golden_doubloon_purse', name: "Captain's Doubloon Purse", icon: '🪙', desc: '+450 Bonus Gold Coins!', coins: 450, rarity: 'uncommon' },
  { id: 'bonus_gem_shard', name: 'Starlight Prism Shard', icon: '💎', desc: '+3 Bonus Starlight Gems!', extraGems: 3, rarity: 'epic' },
  { id: 'mystery_salvage_crate', name: 'Mystery Sunken Crate', icon: '🎁', desc: 'Rank 2 Sealed Mystery Crate!', crateRank: 2, rarity: 'epic' },
  { id: 'chronicle_xp_tome', name: "Tidekeeper's Almanac", icon: '📘', desc: '+350 Bonus Angler XP!', extraXp: 350, rarity: 'uncommon' },
];

export const DAILY_REWARDS = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1, weekly = day % 7 === 0, monthly = day === 30;
  const mystery = !weekly && !monthly && day % 3 === 0;
  const uniqueBadge = monthly
    ? '👑 Sovereign Starlight Vault'
    : weekly
    ? `🎁 Week ${day / 7} Captain's Chest`
    : mystery
    ? '🔮 Mystery Tide Prize'
    : null;
  return {
    day,
    gems: monthly ? 100 : weekly ? 20 + day / 7 * 5 : [2, 4, 3, 6, 4, 8][index % 7],
    xp: monthly ? 5000 : weekly ? 1000 + day / 7 * 250 : 0,
    crates: monthly ? [3, 3, 4, 4, 5] : weekly ? [2, 3] : [],
    weekly,
    monthly,
    mystery,
    uniqueBadge,
  };
});
export const DAILY_GEMS = DAILY_REWARDS.map(reward => reward.gems);
export const achievementGems = achievement => achievement.reward >= 1000 ? 3 : achievement.reward >= 300 ? 2 : 1;
export const utcDay = (now = Date.now()) => Math.floor(now / 86400000);
export const APPEARANCE_PRICES = { skin: 1, hair: 1, coat: 3, hatColor: 2, hat: 3 };

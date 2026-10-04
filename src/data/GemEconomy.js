export const DAILY_REWARDS = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1, weekly = day % 7 === 0, monthly = day === 30;
  return { day, gems: monthly ? 100 : weekly ? 20 + day / 7 * 5 : [2, 4, 3, 6, 4, 8][index % 7],
    xp: monthly ? 5000 : weekly ? 1000 + day / 7 * 250 : 0,
    crates: monthly ? [3, 3, 4, 4, 5] : weekly ? [2, 3] : [], weekly, monthly };
});
export const DAILY_GEMS = DAILY_REWARDS.map(reward => reward.gems);
export const achievementGems = achievement => achievement.reward >= 1000 ? 3 : achievement.reward >= 300 ? 2 : 1;
export const utcDay = (now = Date.now()) => Math.floor(now / 86400000);
export const APPEARANCE_PRICES = { skin: 1, hair: 1, coat: 3, hatColor: 2, hat: 3 };

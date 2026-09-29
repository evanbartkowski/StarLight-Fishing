export const DAILY_GEMS = Array.from({ length: 30 }, (_, day) => day === 29 ? 5 : 1 + Math.floor(day / 10));
export const achievementGems = achievement => achievement.reward >= 1000 ? 3 : achievement.reward >= 300 ? 2 : 1;
export const utcDay = (now = Date.now()) => Math.floor(now / 86400000);
export const APPEARANCE_PRICES = { skin: 1, hair: 1, coat: 3, hatColor: 2, hat: 3 };

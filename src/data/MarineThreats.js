import { REALM_PROFILES } from './RealmContent.js';

const names = {
  1: ['Moon Jelly', 'Reef Hunter Shark', 'Ancient Reef Kraken'],
  2: ['Lantern Jelly', 'Violet Fang Eel', 'Trench Maw'],
  3: ['Stardust Jelly', 'Cometfin Shark', 'Constellation Serpent'],
  4: ['Crown Jelly', 'Bronze Sentinel Ray', 'Palace Guardian Kraken'],
  5: ['Cloudveil Jelly', 'Galecrest Ray', 'Stormwing Sea Dragon'],
  6: ['Ember Jelly', 'Obsidian Hunter Shark', 'Caldera Maw'],
  7: ['Hourglass Jelly', 'Riftfang Eel', 'World-Eater Serpent'],
};

export const MARINE_THREATS = Object.entries(names).flatMap(([realm, roster]) => roster.map((name, i) => {
  const zone = Number(realm);
  return {
    id: `marine_${zone}_${i}`, name, zone, marineKind: i === 0 ? 'jelly' : i === 2 ? 'monster' : zone === 2 || zone === 7 ? 'eel' : zone === 4 || zone === 5 ? 'ray' : 'shark',
    minDepth: [40, 250, 900][i], maxDepth: 3000,
    radius: [22, 34, 65][i], damage: [1, 2, 3][i], knockback: [25, 50, 85][i],
    speed: [18, 280, 145][i], detectionRadius: [140, 340, 480][i], leash: [130, 600, 800][i],
    isColossal: i === 2, color: REALM_PROFILES[zone].colors[i], glow: REALM_PROFILES[zone].colors[(i + 2) % 5],
    monsterForm: ['kraken', 'maw', 'serpent', 'kraken', 'dragon', 'maw', 'serpent'][zone - 1],
  };
}));

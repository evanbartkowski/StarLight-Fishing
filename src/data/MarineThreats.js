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
  const isColossal = i === 2;
  const colossalShieldCost = isColossal ? (zone >= 4 ? 3 : 2) : 1;
  return {
    id: `marine_${zone}_${i}`, name, zone, marineKind: i === 0 ? 'jelly' : i === 2 ? 'monster' : zone === 2 || zone === 7 ? 'eel' : zone === 4 || zone === 5 ? 'ray' : 'shark',
    attack: (i === 1 || ((zone === 4 || zone === 6) && i === 2)) ? 'dash' : undefined,
    minDepth: [40, 250, 900][i], maxDepth: 3000,
    radius: [22, 34, 65][i], damage: [1, 2, 3][i], knockback: [25, 50, 85][i],
    speed: [18, 245, 140][i] * (1 + (zone - 1) * .085), detectionRadius: [140, 340, 480][i] * (1 + (zone - 1) * .05), leash: [130, 600, 800][i],
    isColossal, shieldCost: colossalShieldCost, color: REALM_PROFILES[zone].colors[i], glow: REALM_PROFILES[zone].colors[(i + 2) % 5],
    monsterForm: ['kraken', 'maw', 'serpent', 'kraken', 'dragon', 'maw', 'serpent'][zone - 1],
  };
}));

// Realm-specific special predators & legendary attackers
MARINE_THREATS.push(
  // Sunken Atlantis Giant Sea Serpent
  {
    id: 'marine_4_sea_serpent', name: 'Sunken Colossal Sea Serpent', zone: 4, marineKind: 'monster', monsterForm: 'serpent',
    minDepth: 450, maxDepth: 3000, attack: 'dash', radius: 72, sizeScale: 1.5,
    damage: 3, shieldCost: 2, knockback: 90, speed: 250, detectionRadius: 490, leash: 780,
    chaseDuration: 3.2, restDuration: 2.8, isColossal: true, color: '#059669', glow: '#34d399',
  },
  // Astral Shimmerfall Deep Siren
  {
    id: 'marine_3_abyssal_siren', name: 'Abyssal Void Siren', zone: 3, marineKind: 'siren', monsterForm: 'siren',
    minDepth: 920, maxDepth: 3000, attack: 'dash', radius: 48, sizeScale: 1.25,
    damage: 3, shieldCost: 2, knockback: 75, speed: 295, detectionRadius: 480, leash: 750,
    chaseDuration: 3.5, restDuration: 2.0, color: '#6366f1', glow: '#e879f9',
  },
  // Magma Caldera Giant Magma Monster Sea Creature
  {
    id: 'marine_6_magma_behemoth', name: 'Caldera Magma Behemoth', zone: 6, marineKind: 'monster', monsterForm: 'magma_maw',
    minDepth: 620, maxDepth: 3000, attack: 'dash', radius: 78, sizeScale: 1.55,
    damage: 4, shieldCost: 2, knockback: 110, speed: 275, detectionRadius: 540, leash: 860,
    chaseDuration: 3.5, restDuration: 2.4, isColossal: true, color: '#7f1d1d', glow: '#f97316',
  }
);

// Each realm has an additional specialist, with distinct pursuit rhythms.
const specialists = [
  ['Spiny Reef Lionfish', 'lionfish', 120, 75, 200],
  ['Glassfang Siphonophore', 'jelly', 180, 14, 190],
  ['Meteor Mantis Shrimp', 'crab', 350, 330, 280],
  ['Imperial Spider Crab', 'crab', 420, 165, 340],
  ['Thunderwing Manta', 'ray', 650, 350, 430],
  ['Furnace Scorpionfish', 'lionfish', 850, 240, 420],
  ['Chronovore Nautilus', 'nautilus', 1000, 390, 500],
];
specialists.forEach(([name, marineKind, minDepth, speed, detectionRadius], index) => {
  const zone = index + 1;
  MARINE_THREATS.push({ id: `marine_${zone}_specialist`, name, zone, marineKind, minDepth, maxDepth: 3000,
    attack: marineKind === 'jelly' ? undefined : ['lionfish', 'nautilus'].includes(marineKind) ? 'shoot' : 'dash',
    radius: 28 + index * 3, damage: 2 + Math.floor(index / 2), knockback: 35 + index * 9,
    speed, detectionRadius, leash: 400 + index * 80,
    chaseDuration: marineKind === 'crab' ? 1.2 : zone >= 5 ? 4 : 2.5,
    restDuration: marineKind === 'crab' ? 3 : 2, shieldCost: zone >= 6 ? 2 : 1,
    color: REALM_PROFILES[zone].colors[2], glow: REALM_PROFILES[zone].colors[0],
  });
});

// Late-realm apex predators have their own silhouettes and slower, readable pursuits.
for (const zone of [4, 5, 6, 7]) {
  const palette = REALM_PROFILES[zone].colors;
  for (const [kind, name, depth, radius, form, shieldDmg] of [
    ['shark', 'Megalodon', 650, 105, 'megalodon', 2],
    ['plesiosaur', 'Ancient Plesiosaur', 850, 115, 'plesiosaur', 2],
    ['mosasaur', 'Abyssal Mosasaur', 1100, 125, 'mosasaur', 3],
    ['monster', 'Dread Kraken', 1400, 135, 'kraken', 3],
  ]) {
    MARINE_THREATS.push({
      id: `apex_${zone}_${kind}_${form}`, name: `${['', '', '', '', 'Atlantean', 'Stormbound', 'Infernal', 'Void'][zone]} ${name}`,
      zone, marineKind: kind, monsterForm: form, minDepth: depth, maxDepth: 3000,
      radius, sizeScale: 1.45, isColossal: true, damage: 3, shieldCost: shieldDmg, knockback: 95,
      speed: 105 + zone * 8, detectionRadius: 470, leash: 650,
      chaseDuration: 2.5, restDuration: 4.5, color: palette[1], glow: palette[3],
    });
  }
}

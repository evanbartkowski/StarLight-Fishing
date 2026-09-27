// leviathans.config.js — Mythic Leviathan Boss Definitions & Prerequisites
// End-game apex titan encounters with multi-phase mechanics, summoning conditions, and mythic rewards

export const APEX_CHUM_ITEM = {
  id: 'apex_chum',
  name: 'Apex Chum Lure',
  icon: '🥩',
  description: 'Fermented predatory offal infused with abyssal phosphors. Summons ancient mythic titans during midnight storms.',
  craftCostCoins: 200,
  tokenCost: 3,
};

export const LEVIATHANS = {
  abyssal_kraken: {
    id: 'abyssal_kraken',
    name: 'The Abyssal Kraken',
    title: 'Bane of the Seven Fleets',
    zone: 'abyssal_rift',
    icon: '🦑',
    color: '#a855f7',
    glowColor: '#c084fc',
    summonConditions: {
      zone: 'abyssal_rift',
      weather: ['THUNDERSTORM'],
      timeOfDay: ['NIGHT'],
      requiresChum: true,
    },
    maxStamina: 1000,
    surgeSpeed: 1.4,
    chargeDuration: 3.5,
    qteDirections: ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'],
    dialogue: {
      roar: '🦑 THE ABYSS SHUDDERS! A titan of writhing shadow surfaces from the trench!',
      surge: '⚠️ High-speed tentacle drag! Feather the reel and control the line drag!',
      breach: '🌊 SURFACE BREACH! Writhing colossal tentacles erupt! Match reflex cues!',
      charge: '💥 TITAN CHARGE! The Kraken lunges at the vessel! SOUND THE HORN AT THE FLASH!',
      victory: '👑 THE ABYSSAL KRAKEN IS SUBDUED! A mythical triumph recorded across the seas!',
    },
    rewards: {
      fishTrophy: {
        id: 'abyssal_kraken_core',
        speciesId: 'abyssal_kraken_core',
        name: 'Heart of the Abyssal Kraken',
        icon: '🦑',
        rarity: 'mythic',
        rarityColor: '#f43f5e',
        rarityGlow: '#fb7185',
        baseValue: 5000,
        value: 5000,
        weight: 1250.0,
        size: 280,
        isMythic: true,
        type: 'fish',
        lore: 'A pulsing, bioluminescent core from the deep trench leviathan. Radiant centerpiece for the grand aquarium.',
      },
      primordialMaterial: {
        id: 'primordial_tentacle',
        name: 'Primordial Kraken Sinew',
        icon: '🧬',
        description: 'Unbreakable titan fiber used for divine rod reinforcements.',
        quantity: 2,
      },
      almanacBadge: 'conqueror_of_the_abyss',
      badgeTitle: 'Conqueror of the Abyssal Void',
    },
  },

  caldera_jormungandr: {
    id: 'caldera_jormungandr',
    name: 'The Caldera Jormungandr',
    title: 'The Molten World-Eater',
    zone: 'volcanic_caldera',
    icon: '🐉',
    color: '#ea580c',
    glowColor: '#f97316',
    summonConditions: {
      zone: 'volcanic_caldera',
      weather: ['THUNDERSTORM', 'DENSE_FOG'],
      timeOfDay: ['NIGHT'],
      requiresChum: true,
    },
    maxStamina: 1200,
    surgeSpeed: 1.6,
    chargeDuration: 3.2,
    qteDirections: ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'],
    dialogue: {
      roar: '🌋 THE HYDROTHERMAL CRATER ROARS! A molten wyrm coils through the boiling waves!',
      surge: '🔥 Scalding line friction! Ease tension before the spool melts!',
      breach: '💨 MAGMA BREACH! The fiery serpent coils through geysers! Dodge and strike!',
      charge: '🔥 INFERNAL CHARGE! The Wyrm surges forward! BRACE HULL AT THE CRITICAL FLASH!',
      victory: '👑 THE CALDERA JORMUNGANDR HAS BEEN CONQUERED! Ancient magma scale acquired!',
    },
    rewards: {
      fishTrophy: {
        id: 'caldera_jormungandr_scale',
        speciesId: 'caldera_jormungandr_scale',
        name: 'Cinder Crest of Jormungandr',
        icon: '🐉',
        rarity: 'mythic',
        rarityColor: '#f43f5e',
        rarityGlow: '#fb7185',
        baseValue: 6500,
        value: 6500,
        weight: 1680.0,
        size: 340,
        isMythic: true,
        type: 'fish',
        lore: 'An incandescent obsidian and lava crown that radiates primordial heat within your aquarium.',
      },
      primordialMaterial: {
        id: 'primordial_magma_heart',
        name: 'Primordial Magma Core',
        icon: '🔥',
        description: 'Living geological fire forged in the planetary mantle.',
        quantity: 2,
      },
      almanacBadge: 'tamer_of_the_caldera',
      badgeTitle: 'Tamer of the Caldera Wyrm',
    },
  },

  ancient_bog_behemoth: {
    id: 'ancient_bog_behemoth',
    name: 'The Ancient Bog Behemoth',
    title: 'Titan of the Primeval Marsh',
    zone: 'whispering_mangrove',
    icon: '🐊',
    color: '#10b981',
    glowColor: '#34d399',
    summonConditions: {
      zone: 'whispering_mangrove',
      weather: ['DENSE_FOG', 'RAIN'],
      timeOfDay: ['NIGHT', 'DUSK'],
      requiresChum: true,
    },
    maxStamina: 900,
    surgeSpeed: 1.3,
    chargeDuration: 3.8,
    qteDirections: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
    dialogue: {
      roar: '🌿 MISTS PART! A primeval amphibious behemoth tears through the tangled roots!',
      surge: '🪵 Muddy torrent surge! Avoid snapping line against submerged swamp snags!',
      breach: '🐊 SWAMP BREACH! The armored colossus thrashes across the surface! Match cues!',
      charge: '⚠️ BOG RAMMING CHARGE! Prepare counter-flare or brace!',
      victory: '👑 THE PRIMEVAL BEHEMOTH HAS BEEN TAMED! The swamp yields its oldest secret!',
    },
    rewards: {
      fishTrophy: {
        id: 'ancient_bog_behemoth_fossil',
        speciesId: 'ancient_bog_behemoth_fossil',
        name: 'Primeval Behemoth Skull',
        icon: '🐊',
        rarity: 'mythic',
        rarityColor: '#f43f5e',
        rarityGlow: '#fb7185',
        baseValue: 4200,
        value: 4200,
        weight: 980.0,
        size: 240,
        isMythic: true,
        type: 'fish',
        lore: 'A massive petrified crocodilian skull coated in glowing swamp moss. An imposing aquarium centerpiece.',
      },
      primordialMaterial: {
        id: 'primordial_ancient_amber',
        name: 'Primordial Moss Amber',
        icon: '💎',
        description: 'Million-year fossilized sap containing ancient oceanic life.',
        quantity: 2,
      },
      almanacBadge: 'master_of_the_mangrove',
      badgeTitle: 'Master of the Primeval Marsh',
    },
  },
};

export function getEligibleLeviathan(zoneId, weather, timeOfDay, hasApexChum) {
  if (!hasApexChum) return null;

  for (const key in LEVIATHANS) {
    const lev = LEVIATHANS[key];
    const cond = lev.summonConditions;
    if (cond.zone === zoneId) {
      if (cond.weather.includes(weather) && cond.timeOfDay.includes(timeOfDay)) {
        return lev;
      }
    }
  }
  return null;
}

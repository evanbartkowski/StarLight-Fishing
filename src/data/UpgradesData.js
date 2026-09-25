export const UPGRADE_DEFINITIONS = {
  lineLength: {
    id: 'lineLength',
    name: 'Fishing Line Length',
    icon: '🧵',
    description: 'Extends your fishing line to reach deeper oceanic seas and mythical zones.',
    tiers: [
      { level: 0, cost: 0, depth: 35, reqLevel: 1, label: '35m (Sea 1: Sunlit Haven)' },
      { level: 1, cost: 90, depth: 80, reqLevel: 2, label: '80m (Sea 2: Emerald Kelp)' },
      { level: 2, cost: 260, depth: 150, reqLevel: 4, label: '150m (Sea 3: Twilight Pelagic)' },
      { level: 3, cost: 720, depth: 240, reqLevel: 7, label: '240m (Sea 4: Shipwreck Graveyard)' },
      { level: 4, cost: 2100, depth: 360, reqLevel: 10, label: '360m (Sea 5: Midnight Biolum)' },
      { level: 5, cost: 5500, depth: 480, reqLevel: 14, label: '480m (Sea 6: Magma Vent)' },
      { level: 6, cost: 14000, depth: 620, reqLevel: 18, label: '620m (Sea 7: Hadal Void)' },
    ],
  },

  hookCapacity: {
    id: 'hookCapacity',
    name: 'Tackle Capacity',
    icon: '🪣',
    description: 'Allows your line to hold more fish, treasures, and fossils on a single cast.',
    tiers: [
      { level: 0, cost: 0, capacity: 3, reqLevel: 1, label: '3 Catches' },
      { level: 1, cost: 110, capacity: 5, reqLevel: 2, label: '5 Catches' },
      { level: 2, cost: 320, capacity: 8, reqLevel: 3, label: '8 Catches' },
      { level: 3, cost: 850, capacity: 12, reqLevel: 5, label: '12 Catches' },
      { level: 4, cost: 2400, capacity: 18, reqLevel: 8, label: '18 Catches' },
      { level: 5, cost: 6200, capacity: 26, reqLevel: 12, label: '26 Catches' },
      { level: 6, cost: 16000, capacity: 36, reqLevel: 16, label: '36 Catches' },
    ],
  },

  reelPower: {
    id: 'reelPower',
    name: 'Reel Winch & Motor',
    icon: '⚙️',
    description: 'Hauls the fishing line back to the boat much faster with higher torque.',
    tiers: [
      { level: 0, cost: 0, multiplier: 1.0, reqLevel: 1, label: 'Manual Hand-Crank (1.0x)' },
      { level: 1, cost: 75, multiplier: 1.35, reqLevel: 2, label: 'Ball Bearing Reel (1.35x)' },
      { level: 2, cost: 220, multiplier: 1.75, reqLevel: 3, label: 'Carbon Drag Spool (1.75x)' },
      { level: 3, cost: 600, multiplier: 2.25, reqLevel: 6, label: 'Electric Hydro-Motor (2.25x)' },
      { level: 4, cost: 1650, multiplier: 2.9, reqLevel: 9, label: 'Pneumatic Winch (2.9x)' },
      { level: 5, cost: 4400, multiplier: 3.8, reqLevel: 13, label: 'Titan Turbo Hauler (3.8x)' },
    ],
  },

  hookAgility: {
    id: 'hookAgility',
    name: 'Hook Maneuverability',
    icon: '🧭',
    description: 'Sharper steering response underwater to weave between hazards and snatch high-value fish.',
    tiers: [
      { level: 0, cost: 0, speedMult: 1.0, reqLevel: 1, label: 'Standard Lead Sinker (1.0x)' },
      { level: 1, cost: 80, speedMult: 1.3, reqLevel: 2, label: 'Finned Hydro-Weight (1.3x)' },
      { level: 2, cost: 240, speedMult: 1.65, reqLevel: 4, label: 'Acrobatic Glider (1.65x)' },
      { level: 3, cost: 680, speedMult: 2.1, reqLevel: 7, label: 'Vortex Rudders (2.1x)' },
      { level: 4, cost: 1900, speedMult: 2.65, reqLevel: 11, label: 'Sub-Hydraulic Thruster (2.65x)' },
    ],
  },

  fishingRod: {
    id: 'fishingRod',
    name: 'Seven Seas Fishing Rod',
    icon: '🎣',
    description: 'Increases casting arc trajectory and gives a permanent cash bonus on all sales.',
    tiers: [
      { level: 0, cost: 0, castRange: 1.0, sellBonus: 0, reqLevel: 1, label: 'Old Bamboo Pole (+0% Gold)' },
      { level: 1, cost: 130, castRange: 1.25, sellBonus: 0.12, reqLevel: 2, label: 'Fiberglass Rod (+12% Gold)' },
      { level: 2, cost: 420, castRange: 1.55, sellBonus: 0.25, reqLevel: 5, label: 'Graphite Elite (+25% Gold)' },
      { level: 3, cost: 1250, castRange: 1.9, sellBonus: 0.45, reqLevel: 8, label: 'Titanium Deepsea (+45% Gold)' },
      { level: 4, cost: 3600, castRange: 2.3, sellBonus: 0.7, reqLevel: 12, label: 'Gilded Sovereign (+70% Gold)' },
      { level: 5, cost: 9500, castRange: 2.8, sellBonus: 1.1, reqLevel: 17, label: 'Poseidon Mythic Trident (+110% Gold)' },
    ],
  },

  boatVessel: {
    id: 'boatVessel',
    name: 'Angler Vessel & Boat',
    icon: '⛵',
    description: 'Upgrade your seafaring craft with greater deck space, stability, and maritime prestige.',
    tiers: [
      { level: 0, cost: 0, vesselName: 'Weathered Dinghy', xpBonus: 0, reqLevel: 1, label: 'Weathered Dinghy (Starter)' },
      { level: 1, cost: 250, vesselName: 'Coastal Dory', xpBonus: 0.15, reqLevel: 3, label: 'Coastal Dory (+15% XP)' },
      { level: 2, cost: 800, vesselName: 'Expedition Trawler', xpBonus: 0.35, reqLevel: 6, label: 'Expedition Trawler (+35% XP)' },
      { level: 3, cost: 2400, vesselName: 'Grand Schooner', xpBonus: 0.65, reqLevel: 10, label: 'Grand Schooner (+65% XP)' },
      { level: 4, cost: 7500, vesselName: 'Mythic Celestial Ketch', xpBonus: 1.0, reqLevel: 15, label: 'Mythic Celestial Ketch (+100% XP)' },
    ],
  },

  abyssalLantern: {
    id: 'abyssalLantern',
    name: 'Abyssal Lantern',
    icon: '🏮',
    description: 'Pierces the murky darkness of Midnight, Magma, and Hadal trenches.',
    tiers: [
      { level: 0, cost: 0, radius: 55, reqLevel: 1, label: 'Candle Beacon (55px)' },
      { level: 1, cost: 130, radius: 110, reqLevel: 3, label: 'Halogen Lamp (110px)' },
      { level: 2, cost: 380, radius: 180, reqLevel: 6, label: 'Biolum Array (180px)' },
      { level: 3, cost: 1100, radius: 260, reqLevel: 9, label: 'Phosphor Floodlight (260px)' },
      { level: 4, cost: 3000, radius: 380, reqLevel: 14, label: 'Sunstone Core (380px)' },
    ],
  },

  treasureSonar: {
    id: 'treasureSonar',
    name: 'Treasure Sonar',
    icon: '📡',
    description: 'Emits sonar pings and directional radar arrows pointing to sunken riches and titans.',
    tiers: [
      { level: 0, cost: 0, levelName: 'None', reqLevel: 1, label: 'Disabled' },
      { level: 1, cost: 160, levelName: 'Acoustic', reqLevel: 2, label: 'Acoustic Pings' },
      { level: 2, cost: 480, levelName: 'Radar', reqLevel: 4, label: 'Directional Arrows' },
      { level: 3, cost: 1400, levelName: 'SonarPulse', reqLevel: 8, label: 'Wide Pulse Visualizer' },
      { level: 4, cost: 3800, levelName: 'MagnetSonar', reqLevel: 12, label: 'Magnetic Coin Pull' },
    ],
  },

  fossilRadar: {
    id: 'fossilRadar',
    name: 'Paleo Fossil Scanner',
    icon: '🦴',
    description: 'Specialized geo-resonance scanner that boosts fossil discovery rates in deep seabed silt.',
    tiers: [
      { level: 0, cost: 0, fossilBonus: 1.0, reqLevel: 1, label: 'Uncalibrated' },
      { level: 1, cost: 300, fossilBonus: 1.5, reqLevel: 3, label: 'Geo-Acoustic Radar (+50% Fossils)' },
      { level: 2, cost: 950, fossilBonus: 2.2, reqLevel: 7, label: 'Sub-Bottom Profiler (+120% Fossils)' },
      { level: 3, cost: 2800, fossilBonus: 3.2, reqLevel: 11, label: 'Quantum Magnetometer (+220% Fossils)' },
    ],
  },

  lureLuck: {
    id: 'lureLuck',
    name: 'Lure Charm & Luck',
    icon: '✨',
    description: 'Dramatically raises spawn rates of Rare, Epic, Legendary, and Shiny Golden fish.',
    tiers: [
      { level: 0, cost: 0, rareBoost: 1.0, shinyChance: 0.04, reqLevel: 1, label: 'Basic Bait' },
      { level: 1, cost: 150, rareBoost: 1.35, shinyChance: 0.07, reqLevel: 2, label: 'Silver Spinner (+35% Rare)' },
      { level: 2, cost: 450, rareBoost: 1.8, shinyChance: 0.12, reqLevel: 5, label: 'Glow Squid Lure (+80% Rare)' },
      { level: 3, cost: 1350, rareBoost: 2.4, shinyChance: 0.18, reqLevel: 9, label: 'Pearl Attractor (+140% Rare)' },
      { level: 4, cost: 3600, rareBoost: 3.2, shinyChance: 0.28, reqLevel: 13, label: 'Sirens Feather (+220% Rare)' },
    ],
  },

  lineArmor: {
    id: 'lineArmor',
    name: 'Hook Shield / Line Armor',
    icon: '🛡️',
    description: 'Absorbs hazard impacts (mines, shocks, urchins) without losing hooked fish.',
    tiers: [
      { level: 0, cost: 0, shields: 0, reqLevel: 1, label: 'No Shield (0 Hits)' },
      { level: 1, cost: 120, shields: 1, reqLevel: 2, label: 'Padded Coating (1 Hit)' },
      { level: 2, cost: 350, shields: 2, reqLevel: 4, label: 'Reinforced Kevlar (2 Hits)' },
      { level: 3, cost: 950, shields: 3, reqLevel: 7, label: 'Diamond Plated (3 Hits)' },
      { level: 4, cost: 2500, shields: 5, reqLevel: 11, label: 'Titanium Forcefield (5 Hits)' },
    ],
  },

  seabedTraps: {
    id: 'seabedTraps',
    name: 'Seabed Drift Pots',
    icon: '🪤',
    description: 'Deploy idle drift traps that passively catch coastal crabs, oysters, and prehistoric bone fragments.',
    tiers: [
      { level: 0, cost: 0, trapCount: 0, maxStorage: 0, reqLevel: 1, label: 'Not Purchased (0 Pots)' },
      { level: 1, cost: 250, trapCount: 1, maxStorage: 10, reqLevel: 2, label: '1 Drift Pot (10 Capacity)' },
      { level: 2, cost: 650, trapCount: 2, maxStorage: 20, reqLevel: 4, label: '2 Drift Pots (20 Capacity)' },
      { level: 3, cost: 1600, trapCount: 3, maxStorage: 35, reqLevel: 8, label: '3 Commercial Pots (35 Capacity)' },
    ],
  },
};


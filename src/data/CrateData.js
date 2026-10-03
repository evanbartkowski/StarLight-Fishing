// CrateData.js — Ranked Mystery Loot Crates & Chests
// Dredged from the ocean depths with random loot: Super Good, Fair, or Super Bad!

export const CRATE_RANKS = [
  {
    id: 'crate_wood',
    name: 'Weathered Driftwood Crate',
    rank: 1,
    rankName: 'Barnacle Crate',
    rarity: 'common',
    minDepth: 8,
    maxDepth: 60,
    radius: 20,
    color: '#78350f',
    bandColor: '#92400e',
    lockColor: '#a1a1aa',
    glow: '#fde68a',
    icon: '📦',
    desc: 'A waterlogged timber supply crate adrift near coastal shallows. Often contains beachcomber junk, lost supplies, or a rare carved bobber.',
    badChance: 0.35,
    superGoodChance: 0.16,
  },
  {
    id: 'crate_iron',
    name: 'Sunken Ironbound Strongbox',
    rank: 2,
    rankName: 'Merchant Strongbox',
    rarity: 'uncommon',
    minDepth: 40,
    maxDepth: 160,
    radius: 22,
    color: '#475569',
    bandColor: '#1e293b',
    lockColor: '#cbd5e1',
    glow: '#86efac',
    icon: '🧰',
    desc: 'Heavily riveted iron freight box lost by merchant traders. Filled with colonial silver, aged rum, or damp cargo.',
    badChance: 0.28,
    superGoodChance: 0.24,
  },
  {
    id: 'crate_gold',
    name: "Gilded Corsair's Treasure Chest",
    rank: 3,
    rankName: 'Corsair Chest',
    rarity: 'rare',
    minDepth: 90,
    maxDepth: 290,
    radius: 24,
    color: '#b45309',
    bandColor: '#fbbf24',
    lockColor: '#fde047',
    glow: '#facc15',
    icon: '🪙',
    desc: 'A mahogany pirate chest decorated with solid gold filigree. Rich with stolen doubloons, ruby gems, and cursed pirate tricks.',
    badChance: 0.22,
    superGoodChance: 0.34,
  },
  {
    id: 'crate_abyssal',
    name: 'Abyssal Leviathan Coffer',
    rank: 4,
    rankName: 'Abyssal Coffer',
    rarity: 'epic',
    minDepth: 240,
    maxDepth: 470,
    radius: 26,
    color: '#1e1b4b',
    bandColor: '#818cf8',
    lockColor: '#c084fc',
    glow: '#a855f7',
    icon: '🔮',
    desc: 'Carved from deep sea volcanic glass, humming with eerie violet bioluminescence. Holds prehistoric fossils, deep pearls, or stinging horrors.',
    badChance: 0.15,
    superGoodChance: 0.44,
  },
  {
    id: 'crate_celestial',
    name: 'Mythic Celestial Reliquary',
    rank: 5,
    rankName: 'Cosmic Reliquary',
    rarity: 'legendary',
    minDepth: 380,
    maxDepth: 620,
    radius: 28,
    color: '#030712',
    bandColor: '#38bdf8',
    lockColor: '#f43f5e',
    glow: '#38bdf8',
    icon: '🌟',
    desc: 'Prehistoric alien reliquary glowing with cosmic star runes from the Hadal trenches. Can unleash staggering starfall fortunes or strange cosmic mishaps.',
    badChance: 0.10,
    superGoodChance: 0.58,
  },
];

// Rich, rank-segregated loot tables with diverse themes per oceanic depth
export const CRATE_LOOT_TABLES = {
  // RANK 1: Weathered Driftwood Crate (Shallows / Coastal)
  1: {
    superBad: [
      {
        id: 'soggy_boot',
        name: 'Waterlogged Old Boot',
        icon: '👢',
        type: 'trash',
        grade: 'super_bad',
        coins: 2,
        xp: 8,
        headline: 'Awful Luck! Just a soggy old leather boot...',
        flavor: 'Dripping with saltwater and seaweed. An angler’s classic disappointment.',
      },
      {
        id: 'snapping_crab',
        name: 'Snapping Hermit Crab',
        icon: '🦀',
        type: 'hazard',
        grade: 'super_bad',
        coins: -18,
        xp: 12,
        headline: 'Ouch! A hermit crab pinched your thumb!',
        flavor: 'You flinched in surprise and dropped $18 worth of loose sinkers overboard!',
      },
      {
        id: 'blank_drift_bottle',
        name: 'Faded Blank Drift Bottle',
        icon: '🍾',
        type: 'trash',
        grade: 'super_bad',
        coins: 3,
        xp: 10,
        headline: 'A message bottle... but the ink washed away!',
        flavor: 'Nothing but soaked blank pulp inside. The ancient secrets remain untold.',
      },
      {
        id: 'rotten_kelp',
        name: 'Rotten Stinking Kelp Ball',
        icon: '🌿',
        type: 'trash',
        grade: 'super_bad',
        coins: 1,
        xp: 6,
        headline: 'Gross! A slimy ball of rotting kelp!',
        flavor: 'Smells like low tide on a scorching afternoon. Utterly worthless.',
      },
      {
        id: 'rusted_fishhooks',
        name: 'Tangle of Rusty Fishhooks',
        icon: '🪝',
        type: 'trash',
        grade: 'super_bad',
        coins: 4,
        xp: 10,
        headline: 'A clump of rusted, dull fishhooks.',
        flavor: 'Corroded by coastal brine. You carefully toss the dull barbs into the scrap bin.',
      },
      {
        id: 'abandoned_gull_nest',
        name: 'Gull Guano Drift Twigs',
        icon: '🪹',
        type: 'trash',
        grade: 'super_bad',
        coins: 2,
        xp: 5,
        headline: 'Ugh! An abandoned seagull nest!',
        flavor: 'Full of drift sticks and chalky white bird mess. Better wash your deck.',
      },
    ],
    fair: [
      {
        id: 'sea_glass_pouch',
        name: 'Frosted Sea Glass Pouch',
        icon: '💎',
        type: 'fair',
        grade: 'fair',
        coins: 60,
        xp: 30,
        headline: 'A neat pouch of pastel tumbled sea glass!',
        flavor: 'Smooth jewel-like pebbles weathered by decades of coastal surf.',
      },
      {
        id: 'coastal_shell_stash',
        name: 'Mother-of-Pearl Shell Stash',
        icon: '🐚',
        type: 'fair',
        grade: 'fair',
        coins: 85,
        xp: 35,
        headline: 'Lustrous mother-of-pearl shells!',
        flavor: 'Gleaming with soft iridescence under the harbor sun.',
      },
      {
        id: 'copper_pence_purse',
        name: 'Corroded Copper Coin Purse',
        icon: '🪙',
        type: 'fair',
        grade: 'fair',
        coins: 115,
        xp: 45,
        headline: 'A handful of antique ferry copper coins!',
        flavor: 'Historic copper pence still accepted as scrap copper in port.',
      },
      {
        id: 'cedar_floats',
        name: 'Hand-Carved Cedar Net Floats',
        icon: '🪵',
        type: 'fair',
        grade: 'fair',
        coins: 140,
        xp: 50,
        headline: 'Vintage cedar net floats in fine condition!',
        flavor: 'Warm aromatic wood that resists decay even in salty seas.',
      },
      {
        id: 'hardtack_tin',
        name: 'Preserved Sailor Hardtack Tin',
        icon: '🥫',
        type: 'fair',
        grade: 'fair',
        coins: 95,
        xp: 40,
        headline: 'An airtight vintage sailor ration tin!',
        flavor: 'Rock-solid biscuits preserved from an early coastal survey expedition.',
      },
    ],
    superGood: [
      {
        id: 'smugglers_silver',
        name: "Smuggler's Silver Stash",
        icon: '💰',
        type: 'jackpot',
        grade: 'super_good',
        coins: 480,
        xp: 140,
        headline: '⭐ WINDFALL! A hidden velvet roll of silver coins!',
        flavor: 'Tucked beneath a false wood plank, untouched by the seawater!',
      },
      {
        id: 'abalone_locket',
        name: 'Polished Silver Abalone Locket',
        icon: '📿',
        type: 'relic',
        grade: 'super_good',
        coins: 620,
        xp: 180,
        headline: '💎 EXTRAORDINARY! Heirloom Abalone Locket!',
        flavor: 'A pristine silver jewelry piece crafted by an old master coastal jeweler.',
      },
      {
        id: 'pelican_bobber_crate',
        name: 'Carved Pelican Bobber Gear',
        icon: '🪶',
        type: 'cosmetic',
        grade: 'super_good',
        coins: 300,
        xp: 200,
        bonusBobber: { id: 'pelican_bobber', name: 'Carved Pelican Bobber' },
        headline: '🎁 UNLOCKED EXCLUSIVE GEAR! Carved Pelican Bobber!',
        flavor: 'A lovingly whittled pine pelican float with weatherproof varnish.',
      },
      {
        id: 'trilobite_specimen',
        name: 'Pristine Petrified Trilobite',
        icon: '🪨',
        type: 'fossil',
        grade: 'super_good',
        coins: 520,
        xp: 220,
        bonusFossil: { id: 'fossil_trilobite', name: 'Petrified Trilobite' },
        headline: '🏛️ MUSEUM FIND! Intact Cambrian Trilobite!',
        flavor: 'A 500-million-year-old fossil carefully packed in sawdust!',
      },
    ],
  },

  // RANK 2: Sunken Ironbound Strongbox (Mid-Shallows / Merchant Waters)
  2: {
    superBad: [
      {
        id: 'angry_urchin',
        name: 'Nesting Spiny Sea Urchin',
        icon: '🦔',
        type: 'hazard',
        grade: 'super_bad',
        coins: -45,
        xp: 25,
        headline: 'Ouch! A spiny urchin nested in the lock latch!',
        flavor: 'Its needle-sharp spines stung your fingers, startling $45 into the drink!',
      },
      {
        id: 'waterlogged_log',
        name: 'Soggy Illegible Merchant Ledger',
        icon: '📜',
        type: 'trash',
        grade: 'super_bad',
        coins: 15,
        xp: 20,
        headline: 'Waterlogged ruins of an old trade ledger.',
        flavor: 'Black ink bled across all 200 pages into an indecipherable purple puddle.',
      },
      {
        id: 'barnacled_padlock',
        name: 'Solid Barnacled Iron Lock',
        icon: '🔒',
        type: 'trash',
        grade: 'super_bad',
        coins: 12,
        xp: 20,
        headline: 'Pried open... only to find coarse gray sand!',
        flavor: 'The seal failed long ago; silt filled every millimeter of the interior.',
      },
      {
        id: 'cracked_demijohn',
        name: 'Shattered Olive Glass Demijohn',
        icon: '🍾',
        type: 'trash',
        grade: 'super_bad',
        coins: 18,
        xp: 25,
        headline: 'A cracked antique glass demijohn.',
        flavor: 'Broken into jagged pieces by underwater pressure. Salvageable only for glass melt.',
      },
    ],
    fair: [
      {
        id: 'silver_ingots',
        name: 'Stamped Merchant Silver Bars',
        icon: '🪙',
        type: 'fair',
        grade: 'fair',
        coins: 280,
        xp: 75,
        headline: 'A pair of stamped trade silver ingots!',
        flavor: 'Refined silver bearing the crest of the East Ocean Trading Company.',
      },
      {
        id: 'sailor_rum_bottle',
        name: 'Vintage Navigator Spiced Rum',
        icon: '🍾',
        type: 'fair',
        grade: 'fair',
        coins: 340,
        xp: 85,
        headline: 'Wax-sealed 50-year-old aged rum bottle!',
        flavor: 'Preserved perfectly under cold salt brine. Collectors pay handsome sums in port.',
      },
      {
        id: 'brass_compass',
        name: 'Antique Brass Pocket Compass',
        icon: '🧭',
        type: 'fair',
        grade: 'fair',
        coins: 390,
        xp: 90,
        headline: 'A functioning antique brass gimbal compass!',
        flavor: 'The jeweled needle still points faithfully to magnetic north.',
      },
      {
        id: 'trade_porcelain',
        name: 'Delftware Blue Porcelain Shards',
        icon: '🏺',
        type: 'fair',
        grade: 'fair',
        coins: 320,
        xp: 80,
        headline: 'Fine hand-painted ceramic trade porcelain!',
        flavor: 'Cobalt glazed motifs that survived three centuries under the ocean waves.',
      },
    ],
    superGood: [
      {
        id: 'pursers_gold',
        name: "Purser's Merchant Gold Cache",
        icon: '💰',
        type: 'jackpot',
        grade: 'super_good',
        coins: 1350,
        xp: 320,
        headline: '⭐ JACKPOT! The trade vessel purser payroll!',
        flavor: 'Minted gold coins packed inside heavy canvas bags, bright as the morning sun!',
      },
      {
        id: 'jeweled_sextant',
        name: 'Naval Jeweled Brass Sextant',
        icon: '📐',
        type: 'relic',
        grade: 'super_good',
        coins: 1750,
        xp: 380,
        headline: '💎 EXTRAORDINARY! Museum-Grade Brass Sextant!',
        flavor: 'Inlaid with mother-of-pearl vernier scales and flawless optics.',
      },
      {
        id: 'lighthouse_bobber_crate',
        name: 'Mini Lighthouse Bobber Gear',
        icon: '🗼',
        type: 'cosmetic',
        grade: 'super_good',
        coins: 800,
        xp: 350,
        bonusBobber: { id: 'lighthouse_bobber', name: 'Mini Lighthouse Bobber' },
        headline: '🎁 UNLOCKED EXCLUSIVE GEAR! Mini Lighthouse Bobber!',
        flavor: 'A miniature lighthouse float that glows with a cozy warm beacon beam on the water!',
      },
      {
        id: 'ammonite_specimen',
        name: 'Golden Pyritized Ammonite Shell',
        icon: '🐚',
        type: 'fossil',
        grade: 'super_good',
        coins: 1100,
        xp: 360,
        bonusFossil: { id: 'fossil_ammonite', name: 'Spiral Ammonite Shell' },
        headline: '🏛️ MUSEUM FIND! Pyrite Ammonite Fossil!',
        flavor: 'Fossilized spiral chambers replaced with genuine gleaming fool’s gold minerals.',
      },
    ],
  },

  // RANK 3: Gilded Corsair's Treasure Chest (Twilight Depths / Pirate Waters)
  3: {
    superBad: [
      {
        id: 'pirate_prank',
        name: 'Pirate Prank Note',
        icon: '📜',
        type: 'prank',
        grade: 'super_bad',
        coins: 0,
        xp: 40,
        headline: 'Bamboozled! The pirate chest is empty!',
        flavor: '"Thanks for hauling this up, matey! I spent the treasure on grog in Tortuga 300 years ago!" — Captain Barnaby',
      },
      {
        id: 'cuttlefish_ink',
        name: 'Trapped Cuttlefish Ink Squirt',
        icon: '🦑',
        type: 'hazard',
        grade: 'super_bad',
        coins: -120,
        xp: 50,
        headline: 'Splat! An angry cuttlefish blasted your boat deck!',
        flavor: 'Cost $120 for dockhands to scrub the permanent jet-black ink off your deck boards.',
      },
      {
        id: 'rusted_cutlass',
        name: 'Brittle Pirate Cutlass Hilt',
        icon: '🗡️',
        type: 'trash',
        grade: 'super_bad',
        coins: 35,
        xp: 35,
        headline: 'Just a rusted, crumbling cutlass hilt.',
        flavor: 'The steel blade was consumed by saltwater decades ago; only the brass pommel holds.',
      },
      {
        id: 'fools_gold',
        name: "Chunk of Crumbly Fool's Gold",
        icon: '🪨',
        type: 'trash',
        grade: 'super_bad',
        coins: 25,
        xp: 35,
        headline: 'Disappointment! It’s cheap iron pyrite!',
        flavor: 'Shimmers under the lantern, but crumbles into chalky sulfur dust in your palms.',
      },
    ],
    fair: [
      {
        id: 'spanish_doubloons',
        name: 'Minted Spanish Gold Doubloons',
        icon: '🪙',
        type: 'fair',
        grade: 'fair',
        coins: 820,
        xp: 160,
        headline: 'Hefty handful of minted Spanish 8-escudo gold!',
        flavor: 'Heavy, hammered coins stamped with the cross of galleon fleets.',
      },
      {
        id: 'captains_spyglass',
        name: "Corsair Captain's Brass Spyglass",
        icon: '🔭',
        type: 'fair',
        grade: 'fair',
        coins: 960,
        xp: 175,
        headline: 'A 4-draw brass spyglass with leather grip!',
        flavor: 'Once used by notorious buccaneers to spot merchant convoys on the horizon.',
      },
      {
        id: 'corsair_velvet_pouch',
        name: 'Pirate Velvet Jewelry Pouch',
        icon: '💍',
        type: 'fair',
        grade: 'fair',
        coins: 1050,
        xp: 190,
        headline: 'Silver hoop earrings and turquoise rings!',
        flavor: 'Plundered jewelry stored safely in a drawstring velvet pouch.',
      },
      {
        id: 'walrus_scrimshaw',
        name: 'Etched Walrus Ivory Scrimshaw',
        icon: '🦴',
        type: 'fair',
        grade: 'fair',
        coins: 1180,
        xp: 200,
        headline: 'Intricately etched antique scrimshaw!',
        flavor: 'Depicts a three-masted schooner weathering towering ocean breakers.',
      },
    ],
    superGood: [
      {
        id: 'corsair_gold_jackpot',
        name: 'Sunken Corsair Gold Bullion',
        icon: '💰',
        type: 'jackpot',
        grade: 'super_good',
        coins: 3850,
        xp: 600,
        headline: '⭐ EPIC JACKPOT! Solid pirate gold bullion bars!',
        flavor: 'The mahogany lid bursts open to reveal heavy stacked bars of pure yellow gold!',
      },
      {
        id: 'sparkling_ruby',
        name: 'Blood-Red Heart Ruby Gem',
        icon: '💎',
        type: 'gem',
        grade: 'super_good',
        coins: 4800,
        xp: 750,
        headline: '💎 EXTRAORDINARY! Royal Blood-Red Ruby!',
        flavor: 'A 40-carat crimson gem with radiant fiery facets that burn in the sun.',
      },
      {
        id: 'exclusive_bobber',
        name: 'Pirate Skull & Crossbones Bobber',
        icon: '☠️',
        type: 'cosmetic',
        grade: 'super_good',
        coins: 2000,
        xp: 650,
        bonusBobber: { id: 'bobber_corsair_skull', name: 'Corsair Skull Bobber' },
        headline: '🎁 UNLOCKED EXCLUSIVE GEAR! Corsair Skull Bobber!',
        flavor: 'Carved from antique walrus ivory with glowing ruby eyes that bob on the waves!',
      },
      {
        id: 'megalodon_tooth_cache',
        name: 'Apex Megalodon Serrated Tooth',
        icon: '🦷',
        type: 'fossil_cache',
        grade: 'super_good',
        coins: 3200,
        xp: 700,
        bonusSkeleton: { target: 'megalodonJaw', name: 'Megalodon Jaw Bone Piece' },
        headline: '🏛️ PREHISTORIC TROVE! +1 Megalodon Skeleton Bone!',
        flavor: 'A razor-sharp 7-inch tooth fossil preserved in mineral pitch, ready for the museum!',
      },
    ],
  },

  // RANK 4: Abyssal Leviathan Coffer (Midnight Trench / Hadal Depths)
  4: {
    superBad: [
      {
        id: 'abyssal_shock',
        name: 'Deepsea Electric Eel Jolt',
        icon: '⚡',
        type: 'hazard',
        grade: 'super_bad',
        coins: -260,
        xp: 80,
        headline: 'ZAP! A curled electric eel blasted your boat circuits!',
        flavor: '600 volts surged through your deck, shorting out $260 of navigational electronics!',
      },
      {
        id: 'volcanic_pumice',
        name: 'Crumbled Volcanic Ash Block',
        icon: '🌋',
        type: 'trash',
        grade: 'super_bad',
        coins: 50,
        xp: 60,
        headline: 'Looked like an obsidian jewel... until it turned to dust!',
        flavor: 'Brittle volcanic pumice that instantly dissolved into black muck upon touching air.',
      },
      {
        id: 'slime_hagfish',
        name: 'Gargantuan Abyssal Slime Hagfish',
        icon: '🐟',
        type: 'hazard',
        grade: 'super_bad',
        coins: 40,
        xp: 65,
        headline: 'Slime everywhere! A suffocating slime hagfish!',
        flavor: 'Secreted buckets of gelatinous defensive slime all across the bow before slipping away.',
      },
    ],
    fair: [
      {
        id: 'abyssal_black_pearl',
        name: 'Luminous Abyssal Black Pearl',
        icon: '🔮',
        type: 'fair',
        grade: 'fair',
        coins: 2100,
        xp: 320,
        headline: 'A flawless obsidian black pearl!',
        flavor: 'Pulses with deep hypnotic ultraviolet shimmer harvested from the midnight trench.',
      },
      {
        id: 'volcanic_black_opal',
        name: 'Fiery Volcanic Black Opal',
        icon: '💎',
        type: 'fair',
        grade: 'fair',
        coins: 2600,
        xp: 350,
        headline: 'A rich black opal with peacock green flashes!',
        flavor: 'Crystallized silica formed in the extreme thermal vents of underwater volcanoes.',
      },
      {
        id: 'angler_lantern',
        name: 'Deep Angler Bioluminescent Bulb',
        icon: '💡',
        type: 'fair',
        grade: 'fair',
        coins: 2900,
        xp: 380,
        headline: 'An intact bioluminescent angler organ!',
        flavor: 'Glows with perpetual soothing cyan light that never requires oil or electricity.',
      },
      {
        id: 'dunkleosteus_plate',
        name: 'Armored Dunkleosteus Cephalic Shield',
        icon: '🛡️',
        type: 'fossil_cache',
        grade: 'fair',
        coins: 3200,
        xp: 420,
        bonusSkeleton: { target: 'dunkleosteus', name: 'Dunkleosteus Armor Bone Piece' },
        headline: '🏛️ MUSEUM FIND! +1 Dunkleosteus Bone Piece!',
        flavor: 'Thick dermal bone armor from the 380-million-year-old armored superpredator!',
      },
    ],
    superGood: [
      {
        id: 'leviathan_sovereign_treasury',
        name: 'Abyssal Sovereign Crown Treasury',
        icon: '👑',
        type: 'jackpot',
        grade: 'super_good',
        coins: 9500,
        xp: 1200,
        headline: '⭐ ASTRONOMICAL JACKPOT! Sovereign Leviathan Treasury!',
        flavor: 'Ancient platinum ingots, ceremonial crests, and deepsea jewels fit for an emperor!',
      },
      {
        id: 'star_sapphire',
        name: 'Flawless Hadal Star Sapphire',
        icon: '💠',
        type: 'gem',
        grade: 'super_good',
        coins: 12000,
        xp: 1500,
        headline: '💎 EXTRAORDINARY! Six-Pointed Hadal Star Sapphire!',
        flavor: 'Under sunlight, an ethereal glowing six-ray star dances across the indigo crystal.',
      },
      {
        id: 'nautilus_bobber_crate',
        name: 'Nautilus Spiral Bobber Gear',
        icon: '🐚',
        type: 'cosmetic',
        grade: 'super_good',
        coins: 5000,
        xp: 1100,
        bonusBobber: { id: 'nautilus_bobber', name: 'Nautilus Spiral Bobber' },
        headline: '🎁 UNLOCKED EXCLUSIVE GEAR! Nautilus Spiral Bobber!',
        flavor: 'Carved from an ancient iridescent chambered nautilus with celestial bioluminescence!',
      },
      {
        id: 'prehistoric_bone_cache',
        name: 'Complete Hadal Bone Cache',
        icon: '🦴',
        type: 'fossil_cache',
        grade: 'super_good',
        coins: 7500,
        xp: 1400,
        bonusSkeleton: { target: 'plesiosaur', name: 'Plesiosaur Vertebrae Bone Piece' },
        headline: '🏛️ MUSEUM TROVE! +1 Plesiosaur Skeleton Piece!',
        flavor: 'Mineralized marine reptile bones unearthed from ancient seabed strata!',
      },
    ],
  },

  // RANK 5: Mythic Celestial Reliquary (Hadal Abyss / Cosmic Trenches)
  5: {
    superBad: [
      {
        id: 'cosmic_fizzle',
        name: 'Gravitational Singularity Fizzle',
        icon: '🌀',
        type: 'hazard',
        grade: 'super_bad',
        coins: -600,
        xp: 150,
        headline: 'Bizarre! A tiny gravitational rift popped!',
        flavor: 'A mini space vortex swallowed $600 worth of titanium tackle before winking out!',
      },
      {
        id: 'astral_dust',
        name: 'Puff of Nebular Space Dust',
        icon: '✨',
        type: 'trash',
        grade: 'super_bad',
        coins: 180,
        xp: 120,
        headline: 'A glittery cloud of space dust!',
        flavor: 'Made your ship companion sneeze! It leaves behind only a funny humming space pebble.',
      },
      {
        id: 'temporal_paradox',
        name: 'Temporal Paradox Note',
        icon: '⏳',
        type: 'prank',
        grade: 'super_bad',
        coins: 100,
        xp: 180,
        headline: 'A note inside in your own handwriting?!',
        flavor: '"You already opened this crate yesterday. Stop being greedy!" — Future You',
      },
    ],
    fair: [
      {
        id: 'atlantean_aquamarine',
        name: 'Glowing Atlantean Aquamarine Crystal',
        icon: '💎',
        type: 'fair',
        grade: 'fair',
        coins: 5500,
        xp: 600,
        headline: 'A humming geometric Atlantean power crystal!',
        flavor: 'Bioluminescent azure frequencies radiate from this ancient extraterrestrial stone.',
      },
      {
        id: 'meteoritic_starlight',
        name: 'Meteoritic Olivine Starlight Ingot',
        icon: '☄️',
        type: 'fair',
        grade: 'fair',
        coins: 6800,
        xp: 700,
        headline: 'A heavy space meteorite studded with peridot gems!',
        flavor: 'Fell from the heavens ten million years ago into the deepest trench on Earth.',
      },
      {
        id: 'atlantean_crown',
        name: 'Crown of the Sunken Sovereign',
        icon: '👑',
        type: 'fair',
        grade: 'fair',
        coins: 8500,
        xp: 800,
        headline: 'An ancient sovereign platinum circlet!',
        flavor: 'Adorned with Hadal teardrop crystals that illuminate the entire ship cabin.',
      },
      {
        id: 'plesiosaur_vertebrae',
        name: 'Giant Plesiosaur Vertebrae Fossil',
        icon: '🦴',
        type: 'fossil_cache',
        grade: 'fair',
        coins: 7800,
        xp: 750,
        bonusSkeleton: { target: 'plesiosaur', name: 'Plesiosaur Neck Vertebra' },
        headline: '🏛️ MUSEUM FIND! +1 Plesiosaur Bone Piece!',
        flavor: 'A giant mineralized neck vertebra preserved in hydrothermal crystal quartz.',
      },
    ],
    superGood: [
      {
        id: 'star_diamond_mega',
        name: 'Starlight Hadal Diamond',
        icon: '🌟',
        type: 'jackpot',
        grade: 'super_good',
        coins: 26000,
        xp: 3200,
        headline: '⭐ UNBELIEVABLE COSMIC MEGA JACKPOT! Starlight Diamond!',
        flavor: 'A mythical celestial diamond that refracts ocean water into brilliant auroras!',
      },
      {
        id: 'heart_of_atlantis',
        name: 'The Heart of Atlantis Prime Gem',
        icon: '💎',
        type: 'gem',
        grade: 'super_good',
        coins: 30000,
        xp: 4000,
        headline: '💎 MYTHIC DISCOVERY! Sovereign Heart of Atlantis!',
        flavor: 'The fabled cosmic crystal said to have powered the legendary continent of antiquity!',
      },
      {
        id: 'comet_bobber_crate',
        name: 'Mythic Celestial Comet Bobber Gear',
        icon: '☄️',
        type: 'cosmetic',
        grade: 'super_good',
        coins: 14000,
        xp: 2800,
        bonusBobber: { id: 'bobber_celestial_comet', name: 'Celestial Comet Bobber' },
        headline: '🎁 UNLOCKED MYTHIC GEAR! Celestial Comet Bobber!',
        flavor: 'A glowing cosmic comet bobber that leaves an ethereal starlight trail across the water!',
      },
      {
        id: 'apex_skeleton_trove',
        name: 'Divine Prehistoric Apex Bone Trove',
        icon: '🏛️',
        type: 'fossil_cache',
        grade: 'super_good',
        coins: 18000,
        xp: 3000,
        bonusSkeleton: { target: 'megalodonJaw', name: 'Prehistoric Apex Bone Piece' },
        headline: '🏛️ APEX MUSEUM TROVE! +1 Skeleton Bone Piece!',
        flavor: 'Grants vital missing skeleton pieces for your boat’s museum display gallery!',
      },
    ],
  },
};

export const CRATE_GEM_PRICES = {
  1: 2,  // Driftwood Crate: 2 Gems
  2: 5,  // Ironbound Strongbox: 5 Gems
  3: 10, // Corsair's Chest: 10 Gems
  4: 20, // Abyssal Leviathan Coffer: 20 Gems
  5: 40, // Mythic Celestial Reliquary: 40 Gems
};

/**
 * Rolls loot for a crate rank.
 * @param {number} crateRank - 1 to 5
 * @param {object|null} saveSystem - Optional save system for skeleton / pity tracking
 * @returns {object} Loot reward packet
 */
export function rollCrateLoot(crateRank, saveSystem = null) {
  const rank = Math.min(5, Math.max(1, parseInt(crateRank, 10) || 1));
  const rankConfig = CRATE_RANKS.find((r) => r.rank === rank) || CRATE_RANKS[0];
  const tables = CRATE_LOOT_TABLES[rank] || CRATE_LOOT_TABLES[1];

  let pityTriggered = false;
  if (saveSystem && saveSystem.data) {
    saveSystem.data.cratePityCount = saveSystem.data.cratePityCount || 0;
    if (saveSystem.data.cratePityCount >= 9) {
      // 10th consecutive pull guarantees an Epic / super_good jackpot!
      pityTriggered = true;
    }
  }

  const rand = Math.random();
  let grade = 'fair';
  if (pityTriggered) {
    grade = 'super_good';
  } else if (rand < rankConfig.badChance) {
    grade = 'super_bad';
  } else if (rand > (1 - rankConfig.superGoodChance)) {
    grade = 'super_good';
  }

  // Update persistent pity counter
  if (saveSystem && saveSystem.data) {
    if (grade === 'super_good') {
      saveSystem.data.cratePityCount = 0;
    } else {
      saveSystem.data.cratePityCount = (saveSystem.data.cratePityCount || 0) + 1;
    }
    if (typeof saveSystem.save === 'function') {
      saveSystem.save();
    }
  }

  let tableList = tables.fair;
  if (grade === 'super_bad') {
    tableList = tables.superBad;
  } else if (grade === 'super_good') {
    tableList = tables.superGood;
  }

  // Pick random item
  const item = tableList[Math.floor(Math.random() * tableList.length)];

  // Slight variance on positive coins (+/- 10%)
  let finalCoins = item.coins;
  if (finalCoins > 20) {
    const variance = 0.9 + Math.random() * 0.2; // 0.90 to 1.10
    finalCoins = Math.round(finalCoins * variance);
  }

  // Handle skeleton reward if saveSystem provided
  let skeletonAwarded = null;
  if (item.bonusSkeleton && saveSystem && typeof saveSystem.awardSkeletonPiece === 'function') {
    skeletonAwarded = saveSystem.awardSkeletonPiece(item.bonusSkeleton.target);
  }

  return {
    crate: rankConfig,
    grade,
    item,
    coins: finalCoins,
    gems: Math.random() < 0.02 ? 1 : 0,
    xp: item.xp,
    headline: item.headline,
    flavor: item.flavor,
    icon: item.icon,
    name: item.name,
    bonusBobber: item.bonusBobber || null,
    bonusFossil: item.bonusFossil || null,
    bonusSkeleton: item.bonusSkeleton || null,
    skeletonAwarded,
    pityTriggered,
  };
}

export function getCrateDropPreview(crateRank, saveSystem = null) {
  const rank = Math.min(5, Math.max(1, parseInt(crateRank, 10) || 1));
  const rankConfig = CRATE_RANKS.find((r) => r.rank === rank) || CRATE_RANKS[0];
  const tables = CRATE_LOOT_TABLES[rank] || CRATE_LOOT_TABLES[1];
  const badPct = Math.round(rankConfig.badChance * 100);
  const goodPct = Math.round(rankConfig.superGoodChance * 100);
  const fairPct = Math.max(0, 100 - badPct - goodPct);
  const pityCount = saveSystem?.data?.cratePityCount || 0;

  return {
    rankConfig,
    pityCount,
    pityThreshold: 10,
    rates: {
      superGood: goodPct,
      fair: fairPct,
      superBad: badPct,
      gems: 2,
    },
    tables: {
      superGood: tables.superGood,
      fair: tables.fair,
      superBad: tables.superBad,
    },
  };
}

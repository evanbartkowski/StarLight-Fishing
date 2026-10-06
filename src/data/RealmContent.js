import { getRealmDepthZones } from './RealmDepths.js';
// Native ecology and economy shared by world generation, the chart, and the journal.
import { FANTASY_SEAS } from '../entities/SeasData.js';

export const REALM_PROFILES = {
  1: { fee: 0, commonValue: 6, xpMultiplier: 1, colors: ['#fbbf24', '#fb7185', '#2dd4bf', '#38bdf8', '#f97316'], trail: 'bubbles', habitat: 'coral gardens and sunlit seagrass', style: 'reef', hazardDensity: 1, treasureChance: 0.2 },
  2: { fee: 3000, commonValue: 18, xpMultiplier: 1.3, colors: ['#22d3ee', '#a3e635', '#c084fc', '#34d399', '#818cf8'], trail: 'biolum', habitat: 'glowing fungal shelves and lantern kelp', style: 'spore', hazardDensity: 1.1, treasureChance: 0.22 },
  3: { fee: 17500, commonValue: 40, xpMultiplier: 1.7, colors: ['#818cf8', '#e0e7ff', '#c4b5fd', '#67e8f9', '#f0abfc'], trail: 'stardust', habitat: 'meteor craters and falling starlight', style: 'crystal', hazardDensity: 1.2, treasureChance: 0.24 },
  4: { fee: 35000, commonValue: 65, xpMultiplier: 2.2, colors: ['#facc15', '#10b981', '#d97706', '#fef3c7', '#2dd4bf'], trail: 'emerald', habitat: 'marble courtyards and clockwork aqueducts', style: 'ruins', hazardDensity: 1.3, treasureChance: 0.26 },
  5: { fee: 70000, commonValue: 100, xpMultiplier: 2.9, colors: ['#f0abfc', '#e9d5ff', '#7dd3fc', '#f9a8d4', '#a5b4fc'], trail: 'aether', habitat: 'cloud reefs and floating root islands', style: 'cloud', hazardDensity: 1.4, treasureChance: 0.28 },
  6: { fee: 140000, commonValue: 180, xpMultiplier: 3.8, colors: ['#fb923c', '#ef4444', '#facc15', '#a8a29e', '#f97316'], trail: 'embers', habitat: 'black smokers and rivers of molten basalt', style: 'lava', hazardDensity: 1.5, treasureChance: 0.3 },
  7: { fee: 1000000, commonValue: 420, xpMultiplier: 5, colors: ['#a855f7', '#22d3ee', '#f43f5e', '#818cf8', '#e2e8f0'], trail: 'aurora', habitat: 'gravity wells and shattered timelines', style: 'void', hazardDensity: 1.6, treasureChance: 0.32 },
};

for (const sea of FANTASY_SEAS) REALM_PROFILES[sea.id].fee = sea.gates.unlockFee;

// Hand-named species use different silhouettes, swimming behaviors, depth niches,
// sizes, markings, and native palettes. Existing species IDs are retained.
const NATIVE_ROSTERS = {
  1: `Honeycomb Boxfish|disc;Reef Octopus|octopus;Sunlit Bottlenose Dolphin|dolphin;Sunlit Damselfish|oval;Coral Sea Turtle|sea_turtle;Lagoon Manatee|manatee;Pacific Sea Otter|sea_otter;Galapagos Marine Iguana|marine_iguana;Coastal Cormorant|cormorant;Atlantic Puffin|puffin;Breezy Velella Sailor|velella;Sunlit Flying Squid|flying_squid;Striped Sea Snake|sea_snake;Sunlit Sea Angel|sea_butterfly;Reef Moon Jellyfish|jellyfish;Coastal Copepod Swarm|copepod;Sunlit Plankton Cloud|plankton;Chambered Nautilus|nautilus;Reef Arrow Worm|arrow_worm;California Sea Lion|sea_lion;Shoals Mandarinfish|oval;Coral Dugong|dugong;Shoals Gentoo Penguin|penguin;Sandbar Guitar Ray|ray;Sunlit Humpback Whale|whale;Turtlegrass Snipefish|swordfish;Sunlit Krill Swarm|krill;Rosewater Lionfish|disc;Crown Coral Grouper|oval;Dawn Marlin|swordfish;Golden Lagoon Shark|shark;Amber Reef Skate|ray;Crested Seahorse|seahorse;Polka Dot Sole|disc;Coral Emperor|disc`,
  2: `Trench Plankton Bloom|plankton;Glowgill Tetra|oval;Bioluminescent Salp Chain|salp;Sporebell Squid|squid;Bioluminescent Sea Turtle|sea_turtle;Bioluminescent Sea Snake|sea_snake;Abyssal Arrow Worm|arrow_worm;Prismatic Cave Loach|eel;Shoals Tusked Walrus|walrus;Harp Seal Pup|seal;Deep Trench Tardigrade|tardigrade;Luminous Chambered Nautilus|nautilus;Glowroot Horsesea|seahorse;Midnight Lantern Ray|ray;Coldflame Cuttlefish|cuttlefish;Deep Sea Portuguese Man O War|man_o_war;Luminescent Box Jellyfish|jellyfish;Abyssal Krill Swarm|krill;Deepwater Siphonophore|siphonophore;Trench Sea Butterfly|sea_butterfly;Bioluminescent Marine Worm|marine_worm;Neon Sawtooth|shark;Iridescent Cave Skate|ray;Glowworm Grenadier|eel;Lanternjaw Hunter|oval;Electric Moss Eel|eel;Moonspore Octopus|octopus;Abyssal Flying Squid|flying_squid;Blacklight Ribbon Eel|eel;Crystal Eyed Sleeper|oval;Pulseheart Shark|shark;Luminous Crown Ray|ray;Lantern King|disc;Violet Ghost Marlin|swordfish;Trench Fire Opah|disc`,
  3: `Meteor Glassfish|disc;Zodiac Ribbonfish|eel;Stardust Krill Swarm|krill;Moonstone Tetra|oval;Sundial Seahorse|seahorse;Eclipse Sailfish|swordfish;Celestial Glass Eel|eel;Orbitfin Pomfret|disc;Quasar Lanternfish|oval;Silver Comet Loach|eel;Nebula Crownfish|disc;Asteroid Cusk|oval;Stardrop Cuttlefish|cuttlefish;Crescent Veil Ray|ray;Prismtail Char|oval;Constellation Perch|oval;Cosmic Needlefish|swordfish;Moonring Discus|disc;Stellar Chimaera|shark;Meteor Shower Sprat|oval;Equinox Pipefish|eel;Falling Star Octopus|octopus;Solstice Puffer|disc;Cometstream Mackerel|oval;Lunar Mirror Sole|disc;Starglass Sturgeon|shark;Silver Zenith Eel|eel;Celestial Compass Ray|ray;Dawnstar Oarfish|eel;Nebula Thorn Shark|shark;Astral Crown Marlin|swordfish;Twilight Orbit Opah|disc;Supernova Sailfin|oval;Moonfall Emperor|disc;Perihelion Whale|whale`,
  4: `Mosaic Tilefish|disc;Sunken Coral Mermaid|mermaid;Bronze Cog Loach|eel;Marble Vein Discus|disc;Atlantean Royal Mermaid|mermaid;Verdigris Pipefish|eel;Corinthian Seahorse|seahorse;Clocktower Needlefish|swordfish;Jade Plaza Perch|oval;Gilded Arch Ray|ray;Aqueduct Silverfish|oval;Orichalcum Bream|disc;Patina Ribbon Eel|eel;Laurel Crownfish|disc;Gilded Pearl Mermaid|mermaid;Porcelain Lanternfish|oval;Sunken Throne Grouper|oval;Sapphire Gearfish|disc;Orichalcum Amphora Fish|oval;Emerald Mosaic Skate|ray;Bronze Sentinel Shark|shark;Aureate Cuttlefish|cuttlefish;Temple Bell Puffer|disc;Royal Seal Octopus|octopus;Pearl Column Wrasse|eel;Cistern Shadowfish|oval;Crowned Clockwork Pike|swordfish;Golden Chariot Ray|ray;Imperial Scepter Marlin|swordfish;Atlantean Oracle|disc;Sovereign Coral Shark|shark;Opal Basilica Eel|eel;Palace Guard Sturgeon|shark;Sunken Dynasty Whale|whale;Sunken Poseidon Emperor|disc`,
  5: `Nimbus Ribbonfish|eel;Wandering Albatross|albatross;Cloudlace Seahorse|seahorse;Gossamer Wing Ray|ray;Rainbell Cuttlefish|cuttlefish;Portuguese Man O War|man_o_war;Dewdrop Glassfish|oval;Cirrus Needlefish|swordfish;Celestial Sea Butterfly|sea_butterfly;Sky Petal Discus|disc;Mistral Sailfish|swordfish;Cottoncloud Puffer|disc;Silver Updraft Smelt|oval;Aether Harp Eel|eel;Rosemist Char|oval;Cloudroot Goby|oval;Halo Feather Ray|ray;Floating Lotus Koi|oval;Whisperwing Skate|ray;Violet Rain Opah|disc;Windsong Pipefish|eel;Stormveil Octopus|octopus;Horizon Threadfish|eel;Lilac Sky Sturgeon|shark;Sunshower Butterflyfish|disc;Cloudcrown Angelfish|disc;Galecrest Shark|shark;Aether Sail Emperor|swordfish;Mooncloud Whale|whale;Seraphic Ribbon Eel|eel;Heavenfall Manta|ray;Windchime Crownfish|disc;Aurora Cloudrunner|oval;Dusk Petal Wrasse|eel;Stratosphere Monarch|disc`,
  6: `Sulfur Goby|oval;Basalt Glassfish|disc;Hydrothermal Marine Worm|marine_worm;Furnace Jawfish|oval;Scoria Puffer|disc;Molten Copper Eel|eel;Blacksmoker Cusk|oval;Cinder Veil Skate|ray;Lavaflow Needlefish|swordfish;Iron Vent Sturgeon|shark;Pyrite Scale Bream|disc;Obsidian Lanternfish|oval;Crimson Rift Loach|eel;Magma Bell Squid|squid;Sootfin Perch|oval;Brimstone Seahorse|seahorse;Smoldering Coral Grouper|oval;Flarecrest Marlin|swordfish;Ashfall Sole|disc;Volcanic Glass Ray|ray;Caldera Crownfish|disc;Fire Opal Octopus|octopus;Emberheart Opah|disc;Lava Ribbon Oarfish|eel;Charcoal Hammerhead|shark;Thermal Plume Char|oval;Golden Furnace Pike|swordfish;Magma Throne Manta|ray;Eruption Sail Emperor|swordfish;Crucible Whale|whale;Pyroclast Serpent|eel;Obsidian Crown Shark|shark;Redhot Glass Discus|disc;Sulfur Bloom Tetra|oval;Ashwing Dragonfish|eel`,
  7: `Paradox Glassfish|disc;Eventide Needlefish|swordfish;Chronal Ribbon Eel|eel;Darkmatter Puffer|disc;Gravity Well Loach|eel;Nullfin Tetra|oval;Hourglass Seahorse|seahorse;Singularity Lanternfish|oval;Memory Shard Skate|ray;Timeworn Crownfish|disc;Entropy Threadfish|eel;Echo Loop Cuttlefish|cuttlefish;Wormhole Sturgeon|shark;Void Petal Discus|disc;Antimatter Smelt|oval;Quantum Veil Ray|ray;Fracturefin Perch|oval;Forgotten Epoch Koi|oval;Nightmare Compass Eel|eel;Infinite Orbit Opah|disc;Unwritten Starfish|disc;Abyssal Clockjaw|shark;Eon Needle Marlin|swordfish;Causality Ribbonfish|eel;Dreamless Octopus|octopus;Vacuum Crown Manta|ray;Zero Hour Shark|shark;Eternity Sail Emperor|swordfish;Last Light Whale|whale;World End Serpent|eel;Black Sun Monarch|disc;Timeless Oracle Fish|disc;Redshift Dragonfish|eel;Pale Horizon Sleeper|oval;Stolen Tomorrow Ray|ray`,
};

const SALVAGE_IDS = new Set(['driftwood_branch', 'kelp_strand', 'rusty_can', 'mangrove_roots', 'glowing_moss', 'sunken_artifact', 'phosphor_crystal', 'sunken_anchor', 'abyssal_vent', 'lava_geode', 'obsidian_rock']);
const VOLCANIC_IDS = new Set(['obsidian_pike', 'magma_ray', 'fire_conch', 'cinder_coelacanth']);
export const VALUE_BY_RARITY = { common: 1, uncommon: 2, rare: 5, epic: 12, legendary: 42 };
export const isSalvageSpecies = species => SALVAGE_IDS.has(species.id);

export function buildRealmFish(originals) {
  const result = [];
  for (const sea of FANTASY_SEAS) {
    const profile = REALM_PROFILES[sea.id];
    const natives = originals.filter(f => !isSalvageSpecies(f) && (VOLCANIC_IDS.has(f.id) ? 6 : f.zone) === sea.id)
      .map(f => ({ ...f, zone: sea.id, baseValue: Math.round(profile.commonValue * (VALUE_BY_RARITY[f.rarity] || 1) * (f.isSpecialDeep ? 1.5 : 1)), xpMultiplier: profile.xpMultiplier }));
    const additions = NATIVE_ROSTERS[sea.id].split(';');
    for (let i = 0; natives.length < 35; i++) {
      const [name, shape] = additions[i].split('|');
      const rank = i % 10;
      const rarity = rank < 4 ? 'common' : rank < 7 ? 'uncommon' : rank < 9 ? 'rare' : (i < 20 ? 'epic' : 'legendary');
      const niche = i % 5;
      const minDepth = niche === 0 ? 2 : Math.max(8, Math.round(sea.maxDepth * [0.015, 0.08, 0.22, 0.43, 0.67][niche]));
      const maxDepth = Math.min(sea.maxDepth, Math.round(minDepth + sea.maxDepth * (0.25 + (i % 3) * 0.08)));
      const length = 8 + (i % 8) * 7 + (shape === 'shark' || shape === 'whale' ? 80 : 0);
      const movementType = ['eel', 'swordfish', 'mermaid'].includes(shape) ? 'sine_wave' : shape === 'ray' ? 'diagonal_glide' : (shape === 'seahorse' || shape === 'nautilus') ? 'vertical_drift' : shape === 'squid' ? 'vertical_pulse' : (sea.id === 1 ? (i === 13 ? 'hover' : (i % 3 === 0 ? 'diagonal_glide' : i % 2 === 0 ? 'sine_wave' : 'horizontal')) : (i % 4 === 0 ? 'hover' : i % 4 === 1 ? 'erratic' : 'horizontal'));
      natives.push({
        id: `realm_${sea.id}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, name, zone: sea.id, rarity,
        minDepth, maxDepth, baseValue: Math.round(profile.commonValue * VALUE_BY_RARITY[rarity] * (0.9 + (i % 5) * 0.08)),
        baseWeight: Math.round(length * length / 1200 * 100) / 100, sizeRange: [length, Math.round(length * 1.9)],
        scaleFactor: 0.65 + (i % 7) * 0.16, shape, movementType,
        primaryColor: profile.colors[i % 5], secondaryColor: profile.colors[(i + 2) % 5], finColor: profile.colors[(i + 3) % 5], eyeColor: '#ffffff',
        swimSpeed: 0.55 + (i % 6) * 0.22 + sea.id * 0.04, wiggleSpeed: 3 + i % 7,
        pattern: ['spots', 'bands', 'stripe', 'diamonds'][i % 4], fantasyTrail: profile.trail, xpMultiplier: profile.xpMultiplier,
        lore: `${name} inhabits the ${['sheltered surface nurseries', 'kelp-lined ledges', 'open currents', 'shadowed shelves', 'deep sanctuaries'][niche]} of ${sea.name}. It ${['grazes on mineral blooms', 'hunts drifting larvae', 'sifts tiny shells', 'stalks luminous plankton', 'follows warm upwellings'][i % 5]} among ${profile.habitat}.`,
      });
    }
    const deepNames = {
      1: ['Pearlscale Dragonet', 'Royal Glass Nautilus', 'Crowned Reef Leviathan'],
      2: ['Prismatic Lantern Eel', 'Blacklight Phantom Ray', 'Abyssal Lantern Leviathan'],
      3: ['Nebula Mirrorfish', 'Quasar Crown Squid', 'Starfall World Serpent'],
      4: ['Orichalcum Ghost Koi', 'Imperial Sapphire Sturgeon', 'Sovereign Palace Leviathan'],
      5: ['Opaline Featherfin', 'Moonveil Sky Manta', 'Celestial Cloud Leviathan'],
      6: ['Fireglass Dragonfish', 'Diamond Furnace Ray', 'Molten Crown Behemoth'],
      7: ['Paradox Mirror Eel', 'Event Horizon Oracle', 'Eternity World Serpent'],
    };
    deepNames[sea.id].forEach((name, i) => natives.push({
      id: `realm_${sea.id}_deep_${i}`, name, zone: sea.id,
      rarity: i === 0 ? 'epic' : 'legendary', minDepth: [380, 800, 1400][i], maxDepth: 3000,
      isSpecialDeep: i === 2, isLeviathan: i === 2, spawnChance: i === 2 ? .24 : undefined,
      baseValue: profile.commonValue * [35, 75, 180][i], xpMultiplier: profile.xpMultiplier * (1.3 + i * .3),
      baseWeight: [8, 40, 650][i], sizeRange: [[40, 100], [150, 350], [800, 1800]][i],
      scaleFactor: [1.3, 2.8, 6][i], shape: i === 2 ? (sea.id % 2 ? 'world_serpent' : 'megalodon_behemoth') : i === 1 ? (sea.id % 2 ? 'squid' : 'ray') : (sea.id % 2 ? 'disc' : 'eel'),
      primaryColor: profile.colors[(i + 1) % 5], secondaryColor: profile.colors[(i + 3) % 5],
      finColor: profile.colors[i], eyeColor: '#fef3c7', pattern: 'diamonds', fantasyTrail: profile.trail,
      swimSpeed: [1.1, .8, .55][i], wiggleSpeed: 3, movementType: i === 2 ? 'sine_wave' : 'horizontal',
      lore: `${name} lives in the deep sanctuaries of ${sea.name}. ${i === 2 ? 'A solitary giant, rarely seen even by veteran captains.' : 'Its extraordinary markings and elusive nature make it a prized deep-water catch.'}`,
    }));
    const deityNames = ['Aurelia, Heart of the Reef', 'Lux, the Living Aurora', 'Asterion, Star Forger', 'Thalassa, Crown of Atlantis', "Seraph, Heaven's Tide", 'Ignis, Sun Devourer', 'Aeon, Keeper of Eternity'];
    natives.push({
      id: `realm_${sea.id}_deity`, name: deityNames[sea.id - 1], zone: sea.id,
      rarity: 'legendary', isGodTier: true, isSpecialDeep: true, isLeviathan: true,
      minDepth: 1600, maxDepth: 3000, spawnChance: .004,
      baseValue: Math.max(25000, profile.commonValue * 220), xpMultiplier: 4,
      baseWeight: 2400, sizeRange: [1600, 2600], scaleFactor: 6.5,
      shape: sea.id % 2 ? 'world_serpent' : 'siren_ray', movementType: 'sine_wave',
      primaryColor: profile.colors[0], secondaryColor: '#fff7d6', finColor: profile.colors[2], eyeColor: '#ffffff',
      pattern: 'diamonds', fantasyTrail: profile.trail, swimSpeed: 1.6, wiggleSpeed: 2,
      evasion: { type: 'dash', cooldown: 1.4, range: 180, label: 'DIVINE SURGE!' },
      lore: 'A god-tier guardian of the deepest ocean. Its luminous crown is said to hold an entire forgotten constellation.',
    });
    const visitors = {
      1: [['Lagoon Stingray', 'ray'], ['Sunbeam Whale', 'whale'], ['Kelp Turtle', 'mossback_turtle']],
      2: [['Bioluminescent Sea Turtle', 'mossback_turtle'], ['Abyssal Spore Frog', 'salamander'], ['Neon Trench Horsesea', 'seahorse']],
      3: [['Rainbow Star Narwhal', 'narwhal'], ['Moon Salamander', 'salamander'], ['Comet Ribbon Ray', 'ray']],
      4: [['Atlantean Royal Turtle', 'mossback_turtle'], ['Poseidon Crested Swordfish', 'swordfish'], ['Golden Atlantis Nautilus', 'disc']],
      5: [['Rainbow Cloud Narwhal', 'narwhal'], ['Cloudwhisker Whale', 'whale'], ['Kitewing Sky Ray', 'ray']],
      6: [['Ember Axolotl', 'salamander'], ['Obsidianback Turtle', 'mossback_turtle'], ['Lava Lantern Puffer', 'disc']],
      7: [['Prismatic Rift Narwhal', 'narwhal'], ['Hourglass Whale', 'whale'], ['Upside-Down Oracle', 'seahorse']],
    };
    visitors[sea.id].forEach(([name, shape], index) => natives.push({
      ...natives[6 + index], id: `realm_${sea.id}_visitor_${index}`, name, shape,
      rarity: index === 0 ? 'rare' : 'uncommon',
      movementType: shape === 'salamander' ? 'erratic' : shape === 'narwhal' ? 'sine_wave' : shape === 'seahorse' ? 'vertical_pulse' : 'diagonal_glide',
      scaleFactor: shape === 'whale' ? 2.7 : shape === 'narwhal' ? 1.8 : 1.2,
      isRainbow: shape === 'narwhal', sizeRange: shape === 'whale' ? [250, 500] : [30, 100],
      lore: `${name} is a native resident of ${sea.name}, adapted to its unusual currents and hidden gardens.`,
    }));
    const habitats = getRealmDepthZones(sea.id);
    natives.forEach((fish, index) => {
      fish.name = fish.name.replace(/^(?:sea|realm)[_ ]*\d+[_ :?-]+/i, '');
      if (fish.isSpecialDeep || fish.conditions || fish.id.includes('_deep_') || fish.isGodTier) {
        const targetZone = habitats.find(z => fish.minDepth >= z.minDepth && fish.minDepth < z.maxDepth) || habitats[habitats.length - 1];
        fish.habitatZone = targetZone.id;
        return;
      }
      let habIdx;
      if (sea.id === 1) {
        // Realm 1: Surface & nursery species stay shallow (Zone 0: 0-180m),
        // shelf species in Zone 1 (180-720m), harbour species in Zone 2 (720-1650m),
        // and trench species in Zone 3 (1650-3050m). Rarer fish spawn deeper.
        const surfaceSpecies = new Set([
          'Honeycomb Boxfish', 'Sunlit Bottlenose Dolphin', 'Sunlit Damselfish',
          'Coral Sea Turtle', 'Lagoon Manatee', 'Pacific Sea Otter',
          'Galapagos Marine Iguana', 'Coastal Cormorant', 'Atlantic Puffin',
          'Breezy Velella Sailor', 'Sunlit Flying Squid', 'Striped Sea Snake',
          'Sunlit Sea Angel', 'Reef Moon Jellyfish', 'Coastal Copepod Swarm',
          'Sunlit Plankton Cloud', 'Shoals Mandarinfish', 'Coral Dugong',
          'Shoals Gentoo Penguin', 'Sunlit Humpback Whale', 'Crested Seahorse',
          'Sunbeam Whale', 'Kelp Turtle',
        ]);
        const shelfSpecies = new Set([
          'Reef Octopus', 'Golden Lagoon Shark', 'Sunlit Krill Swarm',
          'California Sea Lion', 'Lagoon Stingray',
        ]);
        const harbourSpecies = new Set([
          'Amber Reef Skate', 'Chambered Nautilus', 'Rosewater Lionfish',
          'Crown Coral Grouper', 'Coral Emperor',
        ]);
        const trenchSpecies = new Set([
          'Polka Dot Sole', 'Sandbar Guitar Ray', 'Turtlegrass Snipefish',
          'Reef Arrow Worm', 'Dawn Marlin',
        ]);
        if (surfaceSpecies.has(fish.name)) habIdx = 0;
        else if (shelfSpecies.has(fish.name)) habIdx = 1;
        else if (harbourSpecies.has(fish.name)) habIdx = 2;
        else if (trenchSpecies.has(fish.name)) habIdx = 3;
        else {
          habIdx = fish.rarity === 'legendary' ? 3 : fish.rarity === 'epic' ? 2 : fish.rarity === 'rare' ? 2 : (index % 2);
        }
      } else {
        // Other realms: Zone-based distribution where rarer fish spawn in deeper waters
        if (fish.rarity === 'legendary') {
          habIdx = 3;
        } else if (fish.rarity === 'epic') {
          habIdx = index % 2 === 0 ? 3 : 2;
        } else if (fish.rarity === 'rare') {
          habIdx = index % 3 === 0 ? 3 : (index % 3 === 1 ? 2 : 1);
        } else if (fish.rarity === 'uncommon') {
          habIdx = index % 3 === 0 ? 2 : (index % 3 === 1 ? 1 : 0);
        } else {
          habIdx = index % 6 === 0 ? 3 : (index % 6 === 1 ? 2 : (index % 6 <= 3 ? 1 : 0));
        }
      }
      const habitat = habitats[habIdx];
      fish.habitatZone = habitat.id;
      fish.minDepth = habitat.index === 0 ? Math.min(fish.minDepth, 20) : habitat.minDepth;
      fish.maxDepth = habitat.maxDepth;
    });
    // Exactly one modest migrant from each realm may visit the next realm.
    natives[0].sharedSeas = sea.id < 7 ? [sea.id + 1] : [];
    result.push(...natives);
  }
  return result;
}

export function belongsToRealm(item, seaId) {
  return item.zone === seaId || item.sharedSeas?.includes(seaId) || item.seas?.includes(seaId);
}

const HAZARDS = {
  1: ['Swaying Kelp Bed', 'Mossy Coastal Boulder', 'Waterlogged Tree Trunk', 'Broken Coastal Wreck'],
  2: ['Stinging Spore Cloud', 'Electric Anemone Colony', 'Lantern Jelly Swarm', 'Fungal Reef Tower'],
  3: ['Razor Meteor Shards', 'Pulsar Shock Field', 'Orbiting Crystal Cage', 'Fallen Comet Spire'],
  4: ['Collapsing Marble Arch', 'Clockwork Saw Array', 'Imperial Chain Curtain', 'Sunken Palace Gate'],
  5: ['Thunderhead Bloom', 'Shearing Wind Funnel', 'Skyroot Tangle', 'Falling Aether Island'],
  6: ['Boiling Sulfur Vent', 'Erupting Basalt Spikes', 'Molten Chain Cluster', 'Caldera Lava Chimney'],
  7: ['Temporal Fracture', 'Gravity Snare', 'Entropy Tendrils', 'Event Horizon Monolith'],
};
const TREASURES = {
  1: ['Rose Coral Cameo', 'Abalone Music Box', 'Sunbleached Pearl Comb', 'Lagoon Amber', 'Fossil Coral Fan', 'Reef King Crown'],
  2: ['Bottled Coldfire', 'Lantern Opal', 'Fungal Crystal Chalice', 'Neon Pearl', 'Petrified Lantern Sponge', 'Bioluminescent Heart'],
  3: ['Meteorite Compass', 'Moonstone Orrery', 'Starglass Diadem', 'Comet Tear', 'Meteor Trilobite Fossil', 'Supernova Prism'],
  4: ['Imperial Signet', 'Orichalcum Cog', 'Emerald Throne Key', 'Marble Oracle Mask', 'Marble Nautilus Fossil', 'Atlantean Sun Crown'],
  5: ['Zephyr Harp', 'Cloudglass Tiara', 'Aether Silk Spool', 'Storm Pearl', 'Petrified Sky Fern', 'Sky Sovereign Feather'],
  6: ['Fire Opal Cluster', 'Obsidian Scepter', 'Molten Gold Crucible', 'Pyrite Sun Disk', 'Basalt Dragon Egg Fossil', 'Heart of the Caldera'],
  7: ['Stopped Hourglass', 'Darkmatter Sigil', 'Chronal Memory Shard', 'Quantum Crown', 'Fossil of an Unborn Star', 'Seed of a Lost Universe'],
};
export const REALM_HAZARDS = FANTASY_SEAS.flatMap(sea => HAZARDS[sea.id].map((name, i) => ({
  id: `realm_${sea.id}_hazard_${i}`, name, zone: sea.id, realmStyle: REALM_PROFILES[sea.id].style, variant: i,
  minDepth: sea.id === 1 && i === 3 ? 100 : (sea.id <= 2 && i === 0 ? 48 : 5 + Math.round(sea.maxDepth * i * 0.06)),
  maxDepth: 3000,
  damage: 1 + Math.floor((sea.id + i) / 3), knockback: 22 + sea.id * 5 + i * 4,
  radius: i === 3 ? 48 : 18 + i * 6, isColossal: i === 3,
  pulseHazard: sea.id === 6 && i === 0 || sea.id === 2 && i === 1,
  color: REALM_PROFILES[sea.id].colors[i], glow: REALM_PROFILES[sea.id].colors[(i + 1) % 5],
})));
export const REALM_TREASURES = FANTASY_SEAS.flatMap(sea => {
  const profile = REALM_PROFILES[sea.id];
  const items = TREASURES[sea.id].map((name, i) => ({
    id: `realm_${sea.id}_treasure_${i}`, name, zone: sea.id, category: i === 4 ? 'fossil' : 'treasure',
    realmStyle: profile.style, treasureShape: i % 3, color: profile.colors[i % 5], glow: profile.colors[(i + 1) % 5],
    minDepth: 4 + Math.round(sea.maxDepth * i * 0.1), maxDepth: 3000,
    rarity: ['common', 'uncommon', 'rare', 'rare', 'epic', 'legendary'][i],
    value: profile.commonValue * [5, 10, 20, 28, 50, 110][i],
    lore: `Recovered from ${profile.habitat}. Collectors prize this artifact of ${sea.name}.`,
  }));
  items.push({ id: `realm_${sea.id}_cache`, name: `${sea.name} Sealed Cache`, zone: sea.id, category: 'crate', isCrate: true,
    crateRank: Math.min(5, sea.id), minDepth: 8, maxDepth: 3000, rarity: 'rare',
    value: profile.commonValue * 12, rewardMultiplier: Math.max(1, profile.commonValue / [0, 6, 20, 60, 180, 600][Math.min(5, sea.id)]),
    lore: `A sealed cache from ${sea.name}. Its mystery rewards scale with this realm's charter cost.` });
  return items;
});

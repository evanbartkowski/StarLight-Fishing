const collections = [
  ['Tidal Ancestors', 'Horseshoe Crab Impression', 'Ancient Ray Cartilage'],
  ['Lantern Age', 'Petrified Glow Coral', 'Lantern Salamander Skeleton'],
  ['Stellar Remnants', 'Meteor Ammonite', 'Starwhale Vertebra'],
  ['Lost Dynasty', 'Imperial Sea Turtle Shell', 'Royal Plesiosaur Skeleton'],
  ['Skyborn Ancestors', 'Cloud Nautilus', 'Winged Ray Impression'],
  ['Ember Age', 'Obsidian Mosasaur Jaw', 'Ashbound Trilobite'],
  ['Before Time', 'Chrono Serpent Spine', 'Fractured Leviathan Skull'],
];
const shapes = ['shell', 'skeleton', 'coral', 'skeleton', 'spiral', 'vertebra', 'shell', 'skeleton', 'spiral', 'skeleton', 'jaw', 'shell', 'skeleton', 'jaw'];
export const REALM_FOSSILS = collections.flatMap(([collection, ...names], realm) => names.map((name, index) => ({
  id: `fossil_realm_${realm + 1}_${index + 1}`, name, collection,
  zone: realm + 1, category: 'fossil', fossilShape: shapes[realm * 2 + index],
  minDepth: 80 + realm * 90 + index * 450, maxDepth: 1500 + realm * 220,
  value: 450 + realm * 650 + index * 400, rarity: index ? 'epic' : 'rare',
  color: '#cbd5d1', glow: '#5eead4',
  lore: `A unique mineral impression from the ${collection} collection. Native to this realm; discovered once per captain.`,
})));

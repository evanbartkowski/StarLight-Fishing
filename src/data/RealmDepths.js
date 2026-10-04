const regions = {
  1: [[0, 180, 720, 1650], ['Coral Nursery', 'Wreckwood Shelf', 'Drowned Harbour', 'Pearl Trench'], ['#148994', '#254c69', '#24304e', '#071d37']],
  2: [[0, 260, 880, 1850], ['Lantern Gardens', 'Spore Forest', 'Glass Caverns', 'Blacklight Chasm'], ['#1a6969', '#43385d', '#293c69', '#160d2f']],
  3: [[0, 320, 1050, 2050], ['Starglass Shoals', 'Meteor Orchard', 'Fallen Observatory', 'Comet Graveyard'], ['#305c81', '#504075', '#24395b', '#15112d']],
  4: [[0, 220, 950, 1900], ['Palace Gardens', 'Sunken Forum', 'Imperial Necropolis', 'Forgotten Throne'], ['#26766e', '#275970', '#38334e', '#0b2830']],
  5: [[0, 380, 1150, 2200], ['Cloudroot Reefs', 'Storm Archipelago', 'Floating Citadels', 'Silent Firmament'], ['#605e97', '#30577b', '#493861', '#131e40']],
  6: [[0, 280, 1000, 2000], ['Obsidian Gardens', 'Furnace Vents', 'Basalt Cathedral', 'Molten Core'], ['#483953', '#843d38', '#40304c', '#420f24']],
  7: [[0, 450, 1250, 2350], ['Fractured Reefs', 'Clockwork Ruins', 'Memory Mausoleum', 'Event Horizon'], ['#414b7e', '#514060', '#2d3658', '#160d2b']],
};

const zoneCache = new Map();
const WATER_STOPS = {
  1: ['#54d7cf', '#22a6a9', '#147c91', '#0a486b', '#061b3f'],
  2: ['#70dfce', '#31baba', '#286a9d', '#26245c', '#0e102e'],
  3: ['#8bd8e6', '#4b9bb8', '#46517f', '#2a2a60', '#100f32'],
  4: ['#81d6be', '#2ba98e', '#17677c', '#19445b', '#0b202e'],
  5: ['#c2c5ed', '#8d99d0', '#486b9e', '#30345f', '#14172e'],
  6: ['#d49262', '#a85342', '#623848', '#352846', '#140f24'],
  7: ['#7a8ae2', '#455ba7', '#243769', '#211e50', '#0b0d22'],
};

export const getRealmDepthZones = realm => {
  if (zoneCache.has(realm)) return zoneCache.get(realm);
  const [starts, names, colors] = regions[realm] || regions[1];
  const zones = starts.map((minDepth, index) => ({ id: `realm_${realm}_layer_${index}`, index,
    name: names[index], minDepth, maxDepth: starts[index + 1] || 3050,
    color: colors[index], icon: ['☀', '◐', '☾', '✦'][index], borderStyle: 'solid' }));
  zoneCache.set(realm, zones);
  return zones;
};
export const getRealmDepthZone = (depth, realm = 1) => getRealmDepthZones(realm).find(zone => depth < zone.maxDepth) || getRealmDepthZones(realm)[3];

export function depthWaterColor(depth, realm) {
  const zones = getRealmDepthZones(realm), zone = getRealmDepthZone(depth, realm);
  const stops = WATER_STOPS[realm] || WATER_STOPS[1];
  const span = Math.max(1, zone.maxDepth - zone.minDepth);
  const blend = Math.max(0, Math.min(1, (depth - zone.minDepth) / span));
  const from = stops[zone.index], to = stops[zone.index + 1];
  const rgb = [1, 3, 5].map(offset => Math.round(parseInt(from.slice(offset, offset + 2), 16) * (1 - blend) + parseInt(to.slice(offset, offset + 2), 16) * blend));
  return `rgb(${rgb.join(',')})`;
}

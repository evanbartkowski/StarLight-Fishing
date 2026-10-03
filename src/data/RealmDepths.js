const regions = {
  1: [[0, 180, 720, 1650], ['Coral Nursery', 'Wreckwood Shelf', 'Drowned Harbour', 'Pearl Trench'], ['#167d9b', '#12556a', '#103344', '#081a2e']],
  2: [[0, 260, 880, 1850], ['Lantern Gardens', 'Spore Forest', 'Glass Caverns', 'Blacklight Chasm'], ['#164c70', '#273452', '#322349', '#110f2f']],
  3: [[0, 320, 1050, 2050], ['Starglass Shoals', 'Meteor Orchard', 'Fallen Observatory', 'Comet Graveyard'], ['#304879', '#293863', '#201d48', '#10132d']],
  4: [[0, 220, 950, 1900], ['Palace Gardens', 'Sunken Forum', 'Imperial Necropolis', 'Forgotten Throne'], ['#17676e', '#15515a', '#163945', '#09242e']],
  5: [[0, 380, 1150, 2200], ['Cloudroot Reefs', 'Storm Archipelago', 'Floating Citadels', 'Silent Firmament'], ['#55517e', '#393e69', '#282c54', '#141b38']],
  6: [[0, 280, 1000, 2000], ['Obsidian Gardens', 'Furnace Vents', 'Basalt Cathedral', 'Molten Core'], ['#653e48', '#4f293b', '#361c32', '#220f20']],
  7: [[0, 450, 1250, 2350], ['Fractured Reefs', 'Clockwork Ruins', 'Memory Mausoleum', 'Event Horizon'], ['#383768', '#302651', '#23193d', '#110f25']],
};

const zoneCache = new Map();
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

// Blend over 60m at boundaries instead of abrupt screen-wide palette changes.
export function depthWaterColor(depth, realm) {
  const zones = getRealmDepthZones(realm), zone = getRealmDepthZone(depth, realm);
  const next = zones[zone.index + 1];
  if (!next) return zone.color;
  const blend = Math.max(0, Math.min(1, (depth - zone.maxDepth + 60) / 60));
  const rgb = [1, 3, 5].map(offset => Math.round(parseInt(zone.color.slice(offset, offset + 2), 16) * (1 - blend) + parseInt(next.color.slice(offset, offset + 2), 16) * blend));
  return `rgb(${rgb.join(',')})`;
}

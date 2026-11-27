// World-building lore for first-time Rare, Epic, Legendary, and Mythic catches,
// connecting rare species to Starlight Fishing's realms, relics, and cosmic phenomena.

const REALM_LORE_TIES = {
  1: 'Mariners in Sunlit Shoals say its scales catch the same pale gleam as the midnight Ghost Ship when it drifts across the moonlit swell.',
  2: 'Explorers of the Bioluminescent Trench link its lantern glow to sunken Atlantis beacons swallowed centuries ago.',
  3: 'Astral stargazers chart its migration beside the Fish Constellation that wakes above Shimmerfall on clear nights.',
  4: 'Old Atlantean Forge tablets depict this creature circling clockwork vaults before the city sank beneath the waves.',
  5: 'Sky-whalers of Whispering Aether claim it rides the warm updrafts between the floating cloud palaces at dusk.',
  6: 'Caldera smiths believed its heat-tempered scales once cooled beside the Obsidian Tablets forged inside the magma vents.',
  7: 'Chrono Void navigators whisper that sightings herald tears in tide-time, carrying echoes from every sunken realm below.',
};

const SPECIES_LORE_TIES = {
  star_weaver: 'Woven from spilled constellation threads above Whispering Aether, it knots shattered starlight back into the abyss.',
  mossback_leviathan: 'Ancient cartographers carved early sea charts directly onto the coral ridges of its shell during calm dawn fogs.',
  aurora_sailfin: 'Its prismatic sail splits sunken starlight cascades into rainbow beacons visible from Astral Shimmerfall to the surface.',
  golden_coelacanth: 'Outliving seven sunken empires, fossils matching its armored fins still rest in the Captain\'s Museum.',
  magikarp_emperor: 'Even the Drift-Isle gambler tips his hat when a golden splash breaks the waves — legends say it never fails a bold cast.',
};

export function getFirstCatchLore(species) {
  if (!species) return '';
  const baseLore = (species.lore || '').trim();
  const rarity = species.rarity || 'common';
  const isRarePlus = rarity === 'rare' || rarity === 'epic' || rarity === 'legendary' || species.isMythic || species.isGodTier;
  if (!isRarePlus) return baseLore;

  const tie = SPECIES_LORE_TIES[species.id] || REALM_LORE_TIES[species.zone] || REALM_LORE_TIES[1];
  if (!baseLore) return tie;
  if (baseLore.includes(tie)) return baseLore;
  return `${baseLore} ${tie}`;
}

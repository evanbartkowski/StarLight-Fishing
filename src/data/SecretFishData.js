// Stable ID preserves existing Tiny Lantern Pip catches in older saves.
export const LANTERN_PIP = {
  id: 'easter_misleading_monster', name: 'Lanternmaw Pip', zone: 1,
  secretEncounter: true, rarity: 'epic', minDepth: 18, maxDepth: 250,
  baseValue: 7200, baseWeight: .25, sizeRange: [6, 9], scaleFactor: .78,
  shape: 'oval', primaryColor: '#237d89', secondaryColor: '#d0eee0', finColor: '#eeb45c', eyeColor: '#ffe8a4',
  swimSpeed: .55, wiggleSpeed: 4,
  evasion: { type: 'camouflage', cooldown: 4, range: 100, label: 'SHADOW DRIFT' },
  lore: 'This little lantern bearer projects a vast, many-fanged predator into the murk. Its copper fins, false eye and antique glass lamp make an extraordinarily valuable collector catch.',
};

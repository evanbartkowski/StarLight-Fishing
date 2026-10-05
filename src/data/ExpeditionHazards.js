export const EXPEDITION_HAZARDS = [
  { id: 'human_diver', name: 'Scuba Diver', seas: [1], naturalKind: 'diver', expedition: true, minDepth: 12, maxDepth: 60, damage: 1, knockback: 30, radius: 22, color: '#38bdf8', glow: '#fde047', moveSpeed: 32 },
  { id: 'deep_submarine', name: 'Survey Submarine', seas: [1, 2, 3, 4, 7], naturalKind: 'submarine', expedition: true, minDepth: 1350, maxDepth: 4000, damage: 2, knockback: 75, radius: 100, color: '#334155', glow: '#38bdf8', moveSpeed: 16 },
  { id: 'falling_starglass', name: 'Falling Starglass Shard', seas: [3], naturalKind: 'starglass', motion: 'falling', minDepth: 180, maxDepth: 3000, damage: 2, knockback: 60, radius: 28, color: '#a5b4fc', glow: '#c084fc' },
  { id: 'falling_stalactite', name: 'Falling Obsidian Stalactite', seas: [6, 7], naturalKind: 'stalactite', motion: 'falling', minDepth: 180, maxDepth: 3000, damage: 2, knockback: 60, radius: 30, color: '#64748b', glow: '#fb923c' },
  { id: 'automated_probe', name: 'Automated Abyss Probe', seas: [4, 6, 7], naturalKind: 'probe', motion: 'probe', minDepth: 240, maxDepth: 3000, damage: 1, knockback: 45, radius: 25, color: '#94a3b8', glow: '#f43f5e' },
];

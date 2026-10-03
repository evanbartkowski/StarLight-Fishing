// @ts-check
/** @param {() => number} random */
export function rollCatchTraits(random = Math.random) {
  const roll = random();
  const weight = roll < .15 ? ['Tiny', .5] : roll < .85 ? ['Regular', 1] : roll < .98 ? ['Giant', 1.5] : ['Colossal', 2];
  const palette = random();
  const mutation = palette < .005 ? 'Gold' : palette < .015 ? 'Bioluminescent' : palette < .03 ? 'Albino' : null;
  return { weightClass: String(weight[0]), weightMultiplier: Number(weight[1]), mutation,
    sellMultiplier: mutation === 'Gold' ? 4 : mutation === 'Bioluminescent' ? 3 : mutation === 'Albino' ? 2 : 1 };
}

/** @param {number} depth */
export const depthRewardMultiplier = depth => Math.exp(Math.min(3, Math.max(0, depth) / 900));

/** @param {string} value */
export const displaySpeciesName = value => value.replace(/^(?:sea|realm)[_ ]*\d+[_ :?-]+/i, '').replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());

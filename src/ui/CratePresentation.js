import { getCrateDropPreview } from '../data/CrateData.js';

export function crateArtwork(rank) {
  return `<div class="relic-case relic-case-${rank}" aria-hidden="true"><i></i><b>${['', 'I', 'II', 'III', 'IV', 'V'][rank]}</b><span></span></div>`;
}

export function crateRewardGallery(rank, save) {
  const preview = getCrateDropPreview(rank, save);
  return `<section class="crate-rewards"><h3>Inside this case</h3><p>One reward per opening. Odds include your current guarantee. Base coins shown; depth bonuses apply, with up to 10% variance on positive payouts. Some outcomes lose coins. Independent 2% chance of +1 Gem.</p><div class="crate-reward-grid">${Object.entries(preview.tables).flatMap(([grade, items]) => items.map(item => `<article class="crate-reward ${grade}"><span>${item.icon}</span><strong>${item.name}</strong><small>${item.chance.toFixed(4)}% · ${item.coins < 0 ? '−' : '+'}${Math.abs(item.coins).toLocaleString()} coins</small></article>`)).join('')}</div></section>`;
}

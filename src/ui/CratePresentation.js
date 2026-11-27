import { getCrateDropPreview, CRATE_RANKS } from '../data/CrateData.js';
import { chestThumbnail } from '../rendering/ChestArtwork.js';
import { getCrateLootArt } from './CustomVectorArt.js';

export function crateArtwork(rank, item = {}) {
  const config = { ...CRATE_RANKS.find(crate => crate.rank === rank), ...item, crateRank: rank };
  return `<div class="crate-artwork" aria-hidden="true"><img src="${chestThumbnail(config)}" alt="" width="144" height="120"><b>${['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][rank] || String(rank)}</b></div>`;
}

export function crateRewardGallery(rank, save) {
  const preview = getCrateDropPreview(rank, save);
  return `<section class="crate-rewards"><h3>Inside this case</h3><p>One reward per opening. Odds include your current guarantee. Base coins shown; depth bonuses apply, with up to 10% variance on positive payouts. Some outcomes lose coins. Independent 2% chance of +1 Gem.</p><div class="crate-reward-grid">${Object.entries(preview.tables).flatMap(([grade, items]) => items.map(item => `<article class="crate-reward ${grade}"><span class="crate-reward-art">${getCrateLootArt(item, grade)}</span><strong>${item.name}</strong><small>${item.chance.toFixed(4)}% · ${item.coins < 0 ? '−' : '+'}${Math.abs(item.coins).toLocaleString()} coins${item.bonusBuff ? ` · ${item.bonusBuff.label}` : ''}</small></article>`)).join('')}</div></section>`;
}

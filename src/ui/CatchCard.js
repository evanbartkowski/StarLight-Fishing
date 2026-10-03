import { Fish } from '../entities/Fish.js';
import { FISH_SPECIES } from '../data/FishData.js';
import { LEGENDARY_SPECIES } from '../data/legendaries.js';
import { getSeaById } from '../entities/SeasData.js';

/** Restore a specimen without changing its saved traits or the species catalog. */
export function specimen(item, x, y) {
  const species = item.species || [...FISH_SPECIES, ...LEGENDARY_SPECIES].find(entry => entry.id === (item.speciesId || item.id));
  if (!species) return null;
  const fish = new Fish(species, x, y, { shinyChance: 0, surfaceY: -100000 });
  for (const key of ['size', 'weight', 'weightClass', 'mutation', 'isShiny', 'crown']) if (item[key] !== undefined) fish[key] = item[key];
  fish.x = x; fish.y = y;
  fish.scale = Math.min(2, item.scaleFactor || item.scale || species.scaleFactor || 1);
  return fish;
}

export function openCatchCard(ui, item, player, onBack) {
  ui.activeModal = 'catch-card';
  ui.openModal('Catch Celebration', '<canvas id="share-catch" width="800" height="480" style="width:100%;height:auto"></canvas><div class="catch-share-actions"><button class="btn btn-primary" id="copy-catch">Copy image</button><button class="btn btn-secondary" id="download-catch">Download PNG</button><button class="btn btn-secondary" id="back-catch">Back to catch</button></div>');
  const canvas = document.getElementById('share-catch');
  const ctx = canvas.getContext('2d');
  const realm = getSeaById(item.zone || item.species?.zone);
  const gradient = ctx.createLinearGradient(0, 0, 0, 480);
  gradient.addColorStop(0, realm.topColor); gradient.addColorStop(1, realm.bottomColor);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 800, 480);
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4; ctx.strokeRect(14, 14, 772, 452);
  const fish = specimen(item, 400, 205);
  if (fish) fish.scale = 4.5;
  fish?.render(ctx, 0);
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 32px sans-serif';
  ctx.fillText(item.name || 'Rare Catch', 400, 70, 730);
  ctx.font = '22px sans-serif';
  ctx.fillText(`${item.weightClass || 'Regular'} · ${item.weight || 0} kg${item.mutation ? ` · ${item.mutation}` : ''}`, 400, 340);
  ctx.fillText(`${player} · ${realm.name}`, 400, 395, 730);
  const blob = () => new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not export image.')), 'image/png'));
  document.getElementById('copy-catch').onclick = async () => {
    try {
      if (!globalThis.ClipboardItem || !navigator.clipboard?.write) throw new Error('Image copy is unavailable; use Download PNG.');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob() })]);
      ui.showToast('Catch image copied.');
    } catch (error) { ui.showToast(error.message); }
  };
  document.getElementById('download-catch').onclick = async () => {
    try {
      const url = URL.createObjectURL(await blob());
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'starlight-catch.png'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { ui.showToast(error.message); }
  };
  document.getElementById('back-catch').onclick = onBack;
}

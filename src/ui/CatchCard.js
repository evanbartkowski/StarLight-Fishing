import { Fish } from '../entities/Fish.js';
import { FISH_SPECIES, RARITY_CONFIG } from '../data/FishData.js';
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
  const realm = getSeaById(item.zone || item.species?.zone) || { name: 'Sunlit Shoals', topColor: '#0284c7', bottomColor: '#082f49' };
  const rarityConf = RARITY_CONFIG[item.rarity || item.species?.rarity] || { color: '#38bdf8' };
  const rarityColor = item.isGodTier ? '#e879f9' : rarityConf.color;

  // 1. Deep Oceanic Gradient with vignette
  const gradient = ctx.createLinearGradient(0, 0, 0, 480);
  gradient.addColorStop(0, '#0a0f1d');
  gradient.addColorStop(0.35, realm.topColor || '#0369a1');
  gradient.addColorStop(0.85, realm.bottomColor || '#020617');
  gradient.addColorStop(1, '#020617');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 480);

  // 2. Bioluminescent ambient radial glow behind the fish
  try {
    const radialGlow = ctx.createRadialGradient(400, 215, 20, 400, 215, 260);
    radialGlow.addColorStop(0, `${rarityColor}55`);
    radialGlow.addColorStop(0.5, `${rarityColor}22`);
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, 800, 480);
  } catch (e) {}

  // 3. Holographic celestial stardust particulates
  ctx.save();
  for (let s = 0; s < 42; s++) {
    const sx = (s * 137.5) % 760 + 20;
    const sy = (s * 93.1) % 440 + 20;
    ctx.fillStyle = s % 2 === 0 ? 'rgba(255, 255, 255, 0.45)' : `${rarityColor}77`;
    ctx.beginPath();
    ctx.arc(sx, sy, (s % 3) * 0.8 + 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. Stylized Gilded & Bioluminescent Triple Border Frame
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 780, 460);

  // Primary Rarity Glow Border
  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 4;
  ctx.shadowColor = rarityColor;
  ctx.shadowBlur = 18;
  ctx.strokeRect(18, 18, 764, 444);
  ctx.shadowBlur = 0;

  // Inner filigree corners
  const cornerSize = 24;
  const corners = [
    [26, 26, 1, 1],
    [774, 26, -1, 1],
    [26, 454, 1, -1],
    [774, 454, -1, -1],
  ];
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * cornerSize);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * cornerSize, cy);
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // 5. Header Banner: Realm & Rarity Pill
  const rarityLabel = item.isGodTier ? '★ GOD TIER ★' : item.isMythic ? '★ MYTHIC ★' : (item.rarity || 'RARE').toUpperCase();
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Rarity Pill Badge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(400 - 95, 24, 190, 28, 14);
  } else {
    ctx.rect(400 - 95, 24, 190, 28);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = rarityColor;
  ctx.font = '900 13px sans-serif';
  ctx.fillText(rarityLabel, 400, 39);

  // Catch Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 36px sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 12;
  ctx.fillText(item.name || 'Rare Catch', 400, 85, 710);
  ctx.shadowBlur = 0;
  ctx.restore();

  // 6. Center: Render specimen with enhanced scale
  const fish = specimen(item, 400, 225);
  if (fish) fish.scale = 4.8;
  fish?.render(ctx, 0);

  // 7. Footer: Specimen Stats Cards
  ctx.save();
  ctx.textAlign = 'center';
  const weightText = `${item.weight || 0} kg`;
  const sizeText = item.size ? `${item.size} cm` : '';
  const gradeText = item.gradeTier?.name || (item.crown ? 'Giant Record' : item.weightClass || 'Prime Specimen');
  const specsDetail = [sizeText, weightText, gradeText].filter(Boolean).join(' • ');

  ctx.fillStyle = '#fef08a';
  ctx.font = '700 20px sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 8;
  ctx.fillText(specsDetail, 400, 370);

  // Subtitle: Captain & Realm Location
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 16px sans-serif';
  ctx.fillText(`Angler: ${player}  •  Waters: ${realm.name}`, 400, 412, 720);
  ctx.restore();
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

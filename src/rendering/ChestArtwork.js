// Original vector chests: each material has its own silhouette and hardware.
const RANK_DESIGNS = ['wood', 'iron', 'pirate', 'abyssal', 'celestial', 'magma', 'atlantis', 'void'];
const REALM_DESIGNS = ['reef', 'spore', 'celestial', 'atlantis', 'cloud', 'magma', 'void'];
const MATERIALS = {
  wood: ['#74452c', '#c09b6a', '#cbd5e1'], reef: ['#8b5e3c', '#d8bd85', '#fb7185'],
  iron: ['#344453', '#8498a4', '#d9e9e9'], pirate: ['#713d30', '#e5b459', '#f87171'],
  abyssal: ['#222b53', '#8c8ccb', '#c4b5fd'], celestial: ['#202653', '#b6d7f4', '#fef3c7'],
  magma: ['#302b2b', '#a57a60', '#fb923c'], atlantis: ['#184c4e', '#d6b66f', '#5eead4'],
  void: ['#28183e', '#c6a0dd', '#67e8f9'], cloud: ['#5b6687', '#e1d5ef', '#f9a8d4'],
  spore: ['#24464b', '#709a80', '#a3e635'],
};
const thumbnails = new Map();
export function chestThumbnail(item) {
  const key = `${getChestDesign(item)}:${item.rarity}:${item.id === 'royal_relic'}`;
  if (thumbnails.has(key)) return thumbnails.get(key);
  if (!globalThis.document?.createElement) return '';
  const canvas = document.createElement('canvas'); canvas.width = 192; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.translate(96, 92); drawChest(ctx, item, 52);
  const url = canvas.toDataURL();
  if (thumbnails.size >= 48) thumbnails.delete(thumbnails.keys().next().value);
  thumbnails.set(key, url);
  return url;
}
export function getChestDesign(item) {
  if (/^realm_\d+_cache$/.test(item.id || '')) return REALM_DESIGNS[Math.max(0, Math.min(6, Number(item.zone || item.id.split('_')[1]) - 1))];
  if (item.id === 'royal_relic') return 'atlantis';
  if (item.id === 'pirate_chest') return 'pirate';
  return RANK_DESIGNS[Math.max(0, Math.min(7, (item.crateRank || item.rank || 1) - 1))];
}
const polygon = (ctx, points) => {
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); ctx.stroke();
};
const line = (ctx, points) => { ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
function jewel(ctx, x, y, r, color) {
  ctx.fillStyle = color; polygon(ctx, [[x, y - r], [x + r, y], [x, y + r], [x - r, y]]);
}

export function drawChest(ctx, item, radius, time = 0, mimic = false) {
  const design = getChestDesign(item), [body, metal, accent] = MATERIALS[design];
  const scale = radius * 1.16 / 25;
  ctx.save();
  try {
    ctx.scale(scale, scale); ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.fillStyle = body; ctx.strokeStyle = metal;
    if (design === 'void') {
      polygon(ctx, [[-25, -13], [-4, -25], [25, -13], [25, 14], [4, 25], [-25, 13]]);
      ctx.strokeStyle = accent; ctx.lineWidth = 1;
      line(ctx, [[-25, -13], [4, -1], [25, -13]]); line(ctx, [[4, -1], [4, 25]]);
      ctx.strokeStyle = metal;
      polygon(ctx, [[-13, -15], [13, -15], [13, 12], [-13, 12]]);
      ctx.strokeStyle = accent; line(ctx, [[-9, -10], [9, 7], [-9, 7], [9, -10], [-9, -10]]);
    } else if (design === 'atlantis') {
      polygon(ctx, [[-25, -12], [0, -27], [25, -12], [22, 18], [-22, 18]]);
      ctx.fillStyle = metal; ctx.fillRect(-27, 16, 54, 5); ctx.fillRect(-22, -9, 5, 25); ctx.fillRect(17, -9, 5, 25);
      ctx.lineWidth = 1; ctx.strokeStyle = accent;
      for (const x of [-12, -4, 5, 12]) line(ctx, [[x, -4], [x + 3, 0], [x - 2, 4], [x + 2, 9]]);
      jewel(ctx, 0, -16, 4, accent);
      if (item.id === 'royal_relic') {
        ctx.fillStyle = metal; polygon(ctx, [[-11, -24], [-13, -33], [-5, -28], [0, -36], [5, -28], [13, -33], [11, -24]]);
      }
    } else if (design === 'abyssal') {
      ctx.beginPath(); ctx.moveTo(-28, 10); ctx.bezierCurveTo(-29, -28, 29, -28, 28, 10); ctx.lineTo(20, 18); ctx.lineTo(-20, 18); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (let x = -18; x <= 18; x += 9) { ctx.beginPath(); ctx.moveTo(x * .5, -16); ctx.quadraticCurveTo(x * 1.4, -3, x, 14); ctx.stroke(); }
      ctx.fillStyle = '#101b31'; ctx.beginPath(); ctx.ellipse(0, 2, 11, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(0, 2, 5, 0, Math.PI * 2); ctx.fill();
      for (const sign of [-1, 1]) line(ctx, [[sign * 23, 10], [sign * 31, 18], [sign * 34, 12]]);
    } else if (design === 'celestial') {
      polygon(ctx, [[-25, -12], [-17, -22], [17, -22], [25, -12], [20, 17], [0, 23], [-20, 17]]);
      ctx.strokeStyle = accent;
      line(ctx, [[-18, -12], [18, -12]]); line(ctx, [[-17, 10], [0, -9], [17, 10], [-17, 10]]);
      jewel(ctx, 0, -26, 7, accent);
      for (const [x, y] of [[-22, -13], [22, -13], [0, 19]]) jewel(ctx, x, y, 3, '#d8b4fe');
      ctx.beginPath(); ctx.ellipse(0, -3, 33, 8, -.25, 0, Math.PI * 2); ctx.stroke();
    } else if (design === 'magma') {
      polygon(ctx, [[-25, -12], [-16, -21], [16, -21], [25, -12], [23, 18], [-23, 18]]);
      ctx.strokeStyle = accent; ctx.lineWidth = 2.2;
      line(ctx, [[-21, -13], [-13, -6], [-17, 4], [-11, 9], [-15, 16]]);
      line(ctx, [[17, -16], [11, -8], [18, 0], [11, 10], [17, 17]]);
      ctx.strokeStyle = metal; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -1, 9, 0, Math.PI * 2); ctx.stroke();
      for (let n = 0; n < 6; n++) { const a = n * Math.PI / 3; line(ctx, [[0, -1], [Math.cos(a) * 12, Math.sin(a) * 12 - 1]]); }
      ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(0, -1, 3, 0, Math.PI * 2); ctx.fill();
    } else if (design === 'cloud') {
      ctx.beginPath(); ctx.ellipse(0, 0, 25, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      for (const sign of [-1, 1]) polygon(ctx, [[sign * 21, 2], [sign * 37, -13], [sign * 30, 4], [sign * 22, 9]]);
      ctx.strokeStyle = accent; ctx.lineWidth = 1;
      for (const x of [-10, 10]) { ctx.beginPath(); ctx.arc(x, -1, 7, 0, Math.PI * 1.7); ctx.stroke(); }
      jewel(ctx, 0, 0, 6, accent);
    } else {
      // Timber crates, reinforced strongboxes, and a curved corsair lid.
      if (design === 'pirate') {
        ctx.beginPath(); ctx.moveTo(-25, -6); ctx.bezierCurveTo(-25, -29, 25, -29, 25, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      polygon(ctx, [[-25, -12], [25, -12], [25, 18], [-25, 18]]);
      if (design === 'wood' || design === 'reef' || design === 'spore') {
        ctx.lineWidth = 1; for (const x of [-16, -6, 4, 14]) line(ctx, [[x, -10], [x + 1, 15]]);
        ctx.strokeStyle = metal; ctx.lineWidth = 3; line(ctx, [[-23, -9], [23, 15]]);
        if (design === 'wood') line(ctx, [[23, -9], [-23, 15]]);
      } else {
        ctx.fillStyle = metal; ctx.fillRect(-19, -11, 5, 28); ctx.fillRect(14, -11, 5, 28);
      }
      if (design === 'iron') {
        ctx.fillStyle = '#172c3c'; ctx.fillRect(-7, -17, 14, 5); ctx.strokeRect(-7, -17, 14, 5);
        ctx.fillStyle = metal;
        for (const x of [-20, 20]) for (const y of [-8, 13]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
      }
      if (design === 'spore') {
        for (const [x, y] of [[-18, -19], [-8, -24], [18, -18]]) {
          ctx.strokeStyle = metal; ctx.lineWidth = 2; line(ctx, [[x, -10], [x, y]]);
          ctx.fillStyle = accent; ctx.beginPath(); ctx.ellipse(x, y, 6, 3, 0, Math.PI, Math.PI * 2); ctx.fill();
        }
      }
      if (design === 'reef') {
        ctx.strokeStyle = accent; ctx.lineWidth = 2;
        line(ctx, [[-21, 7], [-28, -2], [-27, -11]]); line(ctx, [[-27, -3], [-33, -7]]);
      }
      ctx.fillStyle = metal; ctx.fillRect(-5, -5, 10, 11); ctx.fillStyle = '#10232e'; ctx.fillRect(-1.5, -2, 3, 5);
      if (design === 'pirate') {
        ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(0, -14, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#162b36'; ctx.fillRect(-3, -15, 2, 2); ctx.fillRect(1, -15, 2, 2);
      }
    }
    // Higher rarities add hardware and cut gems, rather than only a color swap.
    if (['epic', 'legendary', 'mythic', 'ancient', 'god'].includes(item.rarity)) {
      ctx.strokeStyle = metal; jewel(ctx, -17, 12, 2.5, accent); jewel(ctx, 17, 12, 2.5, accent);
    }
    if (mimic) {
      ctx.fillStyle = '#120d16'; ctx.fillRect(-22, -6, 44, 12);
      ctx.fillStyle = '#f8fafc';
      for (let x = -18; x < 20; x += 7) polygon(ctx, [[x, -6], [x + 3, 1], [x + 6, -6]]);
      ctx.fillStyle = '#fb923c';
      for (const x of [-8, 8]) { ctx.beginPath(); ctx.arc(x, -13, 2, 0, Math.PI * 2); ctx.fill(); }
    }
  } finally { ctx.restore(); }
}

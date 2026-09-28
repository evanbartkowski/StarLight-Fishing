export const ANGLER_OPTIONS = {
  skin: { label: 'Skin tone', default: '#fde6c8', choices: [['#fde6c8', 'Ivory'], ['#e7b98a', 'Warm beige'], ['#c88c60', 'Golden tan'], ['#a66c47', 'Bronze'], ['#774a34', 'Chestnut'], ['#4c3028', 'Deep brown']] },
  coat: { label: 'Coat', default: '#eab308', choices: [['#eab308', 'Classic yellow'], ['#0d9488', 'Ocean teal'], ['#ef4444', 'Coral red'], ['#6366f1', 'Indigo'], ['#f472b6', 'Rose'], ['#334155', 'Slate']] },
  hatColor: { label: 'Hat color', default: '#ca8a04', choices: [['#ca8a04', 'Golden'], ['#f8fafc', 'Cloud white'], ['#0f172a', 'Midnight'], ['#14b8a6', 'Seafoam'], ['#f97316', 'Tangerine']] },
  hat: { label: 'Headwear', default: 'rainhat', choices: [['rainhat', 'Rain hat'], ['beanie', 'Beanie'], ['cap', 'Sailing cap'], ['none', 'No hat']] },
  hair: { label: 'Hair', default: '#713f12', choices: [['#713f12', 'Brown'], ['#1c1917', 'Black'], ['#fcd34d', 'Blond'], ['#b45309', 'Auburn'], ['#d6d3d1', 'Silver']] },
};
export const AQUARIUM_OPTIONS = {
  substrate: { label: 'Seabed', default: 'sand', choices: [['sand', 'Golden sand'], ['pebbles', 'River pebbles'], ['obsidian', 'Black volcanic sand'], ['pearl', 'Pearl gravel']] },
  decoration: { label: 'Scenery', default: 'kelp', choices: [['kelp', 'Swaying kelp garden'], ['coral', 'Coral grove'], ['ruins', 'Ancient arches'], ['crystals', 'Crystal garden'], ['none', 'Open water']] },
  lighting: { label: 'Lighting', default: 'daylight', choices: [['daylight', 'Daylight'], ['moonlight', 'Moonlight blue'], ['sunset', 'Warm sunset'], ['rose', 'Rose glow']] },
  bubbles: { label: 'Bubbles', default: 'normal', choices: [['off', 'Off'], ['gentle', 'Gentle'], ['normal', 'Lively']] },
};
export function normalizeCustomization(options, values = {}) {
  return Object.fromEntries(Object.entries(options).map(([key, config]) => [key, config.choices.some(([value]) => value === values?.[key]) ? values[key] : config.default]));
}
export function drawAngler(ctx, appearance, x = 0, y = 0) {
  const look = normalizeCustomization(ANGLER_OPTIONS, appearance);
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = look.coat;
  ctx.beginPath(); ctx.moveTo(-9, -26); ctx.lineTo(9, -26); ctx.lineTo(11, -2); ctx.lineTo(-11, -2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = look.skin; ctx.beginPath(); ctx.arc(0, -32, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = look.hair; ctx.beginPath(); ctx.arc(0, -34, 7, Math.PI, Math.PI * 2); ctx.fill(); ctx.fillRect(-7, -34, 3, 7);
  if (look.hat !== 'none') {
    ctx.fillStyle = look.hatColor; ctx.beginPath(); ctx.arc(0, -35, look.hat === 'beanie' ? 8 : 9, Math.PI, 0); ctx.fill();
    if (look.hat === 'rainhat') ctx.fillRect(-13, -35, 26, 4);
    else if (look.hat === 'cap') ctx.fillRect(-7, -35, 23, 3);
    else { ctx.fillRect(-8, -36, 16, 4); ctx.beginPath(); ctx.arc(0, -45, 3, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(3, -32, 1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = look.coat; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(4, -18); ctx.lineTo(22, -16); ctx.stroke();
  ctx.restore();
}

export function drawAquariumDecor(ctx, width, height, options, time) {
  const look = normalizeCustomization(AQUARIUM_OPTIONS, options);
  const floor = height - 38;
  const colors = { sand: '#e9c46a', pebbles: '#64748b', obsidian: '#292524', pearl: '#e2e8f0' };
  ctx.save(); ctx.fillStyle = colors[look.substrate]; ctx.fillRect(0, floor, width, 38);
  for (let i = 0; i < 75; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)';
    ctx.beginPath(); ctx.ellipse((i * 73) % width, floor + 6 + (i * 13) % 29, look.substrate === 'pebbles' ? 5 : 2, 2, 0, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < 6; i++) {
    const x = 28 + i * (width - 56) / 5;
    if (look.decoration === 'kelp' || look.decoration === 'coral') {
      ctx.strokeStyle = look.decoration === 'kelp' ? '#2dd4bf' : ['#fb7185', '#c084fc', '#fb923c'][i % 3];
      ctx.lineWidth = look.decoration === 'kelp' ? 5 : 7; ctx.lineCap = 'round';
      for (let j = -1; j <= 1; j++) {
        ctx.beginPath(); ctx.moveTo(x, floor); ctx.quadraticCurveTo(x + j * 22, floor - 28, x + j * 17 + Math.sin(time + i) * 5, floor - 48 - (i % 3) * 12); ctx.stroke();
      }
    } else if (look.decoration === 'ruins') {
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(x - 14, floor - 50, 9, 50); ctx.fillRect(x + 12, floor - 50, 9, 50); ctx.fillRect(x - 18, floor - 58, 43, 10);
    } else if (look.decoration === 'crystals') {
      ctx.fillStyle = ['#a78bfa', '#67e8f9', '#f0abfc'][i % 3];
      ctx.beginPath(); ctx.moveTo(x - 14, floor); ctx.lineTo(x - 9, floor - 38); ctx.lineTo(x + 4, floor - 63); ctx.lineTo(x + 17, floor - 30); ctx.lineTo(x + 12, floor); ctx.closePath(); ctx.fill();
    }
  }
  ctx.fillStyle = { daylight: 'rgba(255,255,255,0.025)', moonlight: 'rgba(30,58,138,0.23)', sunset: 'rgba(251,146,60,0.16)', rose: 'rgba(236,72,153,0.13)' }[look.lighting];
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

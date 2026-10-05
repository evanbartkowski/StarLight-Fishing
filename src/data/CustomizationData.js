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
export const AQUARIUM_PRICES = {
  substrate: { sand: 0, pebbles: 2, obsidian: 4, pearl: 6 },
  decoration: { kelp: 0, coral: 3, ruins: 6, crystals: 8, none: 0 },
  lighting: { daylight: 0, moonlight: 2, sunset: 3, rose: 3 },
  bubbles: { normal: 0, off: 0, gentle: 1 },
  theme: { reef: 0, abyss: 4, atlantis: 6, nebula: 8 },
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

export const BOAT_SKIN_OPTIONS = {
  default: { id: 'default', label: 'Classic Oak', desc: 'Timeless varnished oak gunwale finish.', cost: 0, color: null },
  coral: { id: 'coral', label: 'Coral Blossom', desc: 'Vibrant salmon-coral waterline stripe.', cost: 15, color: '#fb7185' },
  indigo: { id: 'indigo', label: 'Deep Indigo', desc: 'Abyssal royal indigo racing stripe.', cost: 20, color: '#818cf8' },
  emerald: { id: 'emerald', label: 'Sea Emerald', desc: 'Luminescent seafoam emerald accent line.', cost: 25, color: '#34d399' },
  gold: { id: 'gold', label: 'Gilded Gilt', desc: 'Opulent sunken galleon gold trim.', cost: 40, color: '#fbbf24' },
};

export const BOAT_TRINKETS = {
  none: { id: 'none', label: 'Bare Deck', desc: 'No deck trinket mounted.', cost: 0, icon: '⛵' },
  lucky_cat: { id: 'lucky_cat', label: 'Lucky Maneki-neko', desc: 'A porcelain bobbing cat waving its golden paw for lucky catches.', cost: 25, icon: '🐱' },
  rubber_duck: { id: 'rubber_duck', label: 'Captain Rubber Ducky', desc: 'A cheerful yellow bath duck wearing a tiny sailor bicorne hat.', cost: 15, icon: '🐤' },
  wind_chime: { id: 'wind_chime', label: 'Seashell Wind Chime', desc: 'Tinkling pearlescent shells swaying gently in the sea breeze.', cost: 20, icon: '🐚' },
  ship_bell: { id: 'ship_bell', label: 'Brass Fog Bell', desc: 'Polished antique brass bell mounted upon the bow deck.', cost: 30, icon: '🔔' },
  pirate_parrot: { id: 'pirate_parrot', label: 'Polly the Deck Parrot', desc: 'A colorful scarlet macaw perched loyally on a deck post.', cost: 35, icon: '🦜' },
  crystal_orb: { id: 'crystal_orb', label: 'Arcane Divining Sphere', desc: 'A glowing sapphire orb hovering inside a brass cage.', cost: 45, icon: '🔮' },
};

export function drawBoatTrinket(ctx, trinketId, vessel = 0, time = 0, bW = 120, bH = 34) {
  if (!trinketId || trinketId === 'none') return;
  ctx.save();

  if (trinketId === 'lucky_cat') {
    const cx = bW * 0.32;
    const cy = -9;
    ctx.translate(cx, cy);
    // Red cushion
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-8, -2, 16, 5, 2) : ctx.rect(-8, -2, 16, 5);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-9, 1, 2, 2);
    ctx.fillRect(7, 1, 2, 2);
    // Porcelain white cat body
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -9, 7, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head & ears
    ctx.beginPath();
    ctx.arc(0, -17, 6, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-5, -20); ctx.lineTo(-2, -26); ctx.lineTo(0, -21); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(5, -20); ctx.lineTo(2, -26); ctx.lineTo(0, -21); ctx.fill();
    // Pink ear centers
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(-4, -20); ctx.lineTo(-2, -24); ctx.lineTo(-1, -21); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4, -20); ctx.lineTo(2, -24); ctx.lineTo(1, -21); ctx.fill();
    // Red collar & bell
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-4, -13, 8, 2);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -11, 2, 0, Math.PI * 2);
    ctx.fill();
    // Gold Koban coin
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(1, -7, 3, 5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Face dots
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3, -18, 1.5, 1.5);
    ctx.fillRect(2, -18, 1.5, 1.5);
    // Waving paw
    const pawAngle = Math.sin(time * 6) * 0.35 - 0.2;
    ctx.save();
    ctx.translate(-5, -14);
    ctx.rotate(pawAngle);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -4, 2.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(0, -7, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (trinketId === 'rubber_duck') {
    const dx = bW * 0.30;
    const dy = -8 + Math.sin(time * 4) * 1.5;
    ctx.translate(dx, dy);
    // Yellow body
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(0, -6, 8, 6, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Tail flip
    ctx.beginPath();
    ctx.moveTo(-6, -6); ctx.lineTo(-11, -11); ctx.lineTo(-6, -3); ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(5, -12, 5.5, 0, Math.PI * 2);
    ctx.fill();
    // Orange beak
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(9, -13); ctx.lineTo(15, -11); ctx.lineTo(9, -9); ctx.closePath();
    ctx.fill();
    // Cute eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(6, -14, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6.2, -14.5, 0.7, 0.7);
    // Sailor bicorne hat
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(0, -16); ctx.lineTo(10, -16); ctx.lineTo(8, -21); ctx.lineTo(2, -21); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(3, -18, 4, 1.5);
  } else if (trinketId === 'wind_chime') {
    const wx = -bW * 0.32;
    const wy = -9;
    ctx.translate(wx, wy);
    // Support pole & bracket
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, -22); ctx.lineTo(8, -22); ctx.stroke();
    // Horizontal cross-rod
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(4, -22); ctx.lineTo(18, -22); ctx.stroke();
    // Hanging strings with swaying shells
    const sway1 = Math.sin(time * 3) * 3;
    const sway2 = Math.sin(time * 3.3 + 1.2) * 3.5;
    const sway3 = Math.sin(time * 2.8 + 2.5) * 2.8;
    ctx.lineWidth = 1;
    // Shell 1
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.moveTo(6, -21); ctx.lineTo(6 + sway1, -11); ctx.stroke();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath(); ctx.ellipse(6 + sway1, -10, 2.5, 3.5, 0.2, 0, Math.PI * 2); ctx.fill();
    // Shell 2
    ctx.beginPath(); ctx.moveTo(11, -21); ctx.lineTo(11 + sway2, -8); ctx.stroke();
    ctx.fillStyle = '#c7d2fe';
    ctx.beginPath(); ctx.ellipse(11 + sway2, -7, 3, 4, -0.1, 0, Math.PI * 2); ctx.fill();
    // Shell 3
    ctx.beginPath(); ctx.moveTo(16, -21); ctx.lineTo(16 + sway3, -12); ctx.stroke();
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath(); ctx.ellipse(16 + sway3, -11, 2.5, 3.5, 0.15, 0, Math.PI * 2); ctx.fill();
  } else if (trinketId === 'ship_bell') {
    const bx = bW * 0.35;
    const by = -9;
    ctx.translate(bx, by);
    // Brass bracket
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, -18); ctx.lineTo(-6, -18); ctx.stroke();
    // Bell body with gentle swing
    const bellSway = Math.sin(time * 3.5) * 0.12;
    ctx.save();
    ctx.translate(-6, -18);
    ctx.rotate(bellSway);
    // Golden Bell
    const bellGrad = ctx.createLinearGradient(-5, 0, 5, 0);
    bellGrad.addColorStop(0, '#d97706');
    bellGrad.addColorStop(0.5, '#fde047');
    bellGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = bellGrad;
    ctx.beginPath();
    ctx.moveTo(-1, 0); ctx.lineTo(1, 0); ctx.lineTo(5, 9); ctx.lineTo(-5, 9); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 9, 5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Clapper
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 8); ctx.lineTo(Math.sin(time * 4) * 2, 12); ctx.stroke();
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(Math.sin(time * 4) * 2, 12, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (trinketId === 'pirate_parrot') {
    const px = -bW * 0.28;
    const py = -9;
    ctx.translate(px, py);
    // Wood perch post
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -18, 4, 18);
    ctx.fillRect(-6, -19, 12, 3);
    // Parrot body
    ctx.save();
    ctx.translate(0, -19);
    const tilt = Math.sin(time * 2) * 0.12;
    ctx.rotate(tilt);
    // Long tail feathers
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(-2, 0); ctx.lineTo(-5, 12); ctx.lineTo(-1, 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-2, 15); ctx.lineTo(1, 11); ctx.closePath(); ctx.fill();
    // Plump red body
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, -7, 4.5, 7, 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Royal blue wing
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.ellipse(-2, -6, 3, 5.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Yellow feather accent
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(-1, -8, 2, 2.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(1, -15, 4, 0, Math.PI * 2);
    ctx.fill();
    // White eye patch
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(2, -16, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(2.5, -16, 0.8, 0, Math.PI * 2);
    ctx.fill();
    // Curved hooked beak
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(4, -16); ctx.lineTo(7, -15); ctx.lineTo(4, -13); ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (trinketId === 'crystal_orb') {
    const ox = bW * 0.26;
    const oy = -9;
    ctx.translate(ox, oy);
    // Polished brass pedestal
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(3, -9); ctx.lineTo(-3, -9); ctx.closePath();
    ctx.fill();
    ctx.fillRect(-5, -11, 10, 2);
    // Levitating pulsating glowing crystal orb
    const hoverY = -18 + Math.sin(time * 3) * 2;
    // Outer magical aura
    const pulseRadius = 9 + Math.sin(time * 5) * 1.5;
    const auraGrad = ctx.createRadialGradient(0, hoverY, 1, 0, hoverY, pulseRadius);
    auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    auraGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.4)');
    auraGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, hoverY, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
    // Crystal sphere core
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, hoverY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Gleam highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-1.5, hoverY - 1.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}


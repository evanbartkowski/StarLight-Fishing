import { getVesselLayout } from '../rendering/VesselRenderer.js';

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
  const safeValues = (values && typeof values === 'object') ? values : {};
  return Object.fromEntries(
    Object.entries(options || {}).map(([key, config]) => [
      key,
      config?.choices?.some(([value]) => value === safeValues[key]) ? safeValues[key] : (config?.default || '#eab308')
    ])
  );
}
export function drawAngler(ctx, appearance, x = 0, y = 0) {
  const safeX = Number.isFinite(x) ? x : 0;
  const safeY = Number.isFinite(y) ? y : 0;
  ctx.save();
  try {
    ctx.translate(safeX, safeY);
    const look = normalizeCustomization(ANGLER_OPTIONS, appearance);
    ctx.fillStyle = look.coat || '#eab308';
    ctx.beginPath(); ctx.moveTo(-9, -26); ctx.lineTo(9, -26); ctx.lineTo(11, -2); ctx.lineTo(-11, -2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = look.skin || '#fde6c8'; ctx.beginPath(); ctx.arc(0, -32, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = look.hair || '#713f12'; ctx.beginPath(); ctx.arc(0, -34, 7, Math.PI, Math.PI * 2); ctx.fill(); ctx.fillRect(-7, -34, 3, 7);
    if (look.hat && look.hat !== 'none') {
      ctx.fillStyle = look.hatColor || '#ca8a04'; ctx.beginPath(); ctx.arc(0, -35, look.hat === 'beanie' ? 8 : 9, Math.PI, 0); ctx.fill();
      if (look.hat === 'rainhat') ctx.fillRect(-13, -35, 26, 4);
      else if (look.hat === 'cap') ctx.fillRect(-7, -35, 23, 3);
      else { ctx.fillRect(-8, -36, 16, 4); ctx.beginPath(); ctx.arc(0, -45, 3, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(3, -32, 1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = look.coat || '#eab308'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(4, -18); ctx.lineTo(22, -16); ctx.stroke();
  } catch (err) {
    console.warn('drawAngler render error:', err);
  } finally {
    ctx.restore();
  }
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
    const x = 32 + i * (width - 64) / 5;
    if (look.decoration === 'kelp') {
      // Lush multi-frond Giant Bull Kelp forest with stipes, gas bladders (pneumatocysts) & serrated undulating blades
      const kelpSway = Math.sin(time * 1.8 + i * 0.9) * 14;
      const kelpGrad = ctx.createLinearGradient(x, floor, x + kelpSway, floor - 140);
      kelpGrad.addColorStop(0, '#064e3b');
      kelpGrad.addColorStop(0.5, '#059669');
      kelpGrad.addColorStop(1, '#34d399');

      // Main flexible stipe
      ctx.strokeStyle = kelpGrad;
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, floor);
      ctx.quadraticCurveTo(x + kelpSway * 0.4, floor - 50, x + kelpSway, floor - 110 - (i % 3) * 18);
      ctx.stroke();

      // Swaying ribbon blades & floating bulbs along the stalk
      for (let f = 1; f <= 4; f++) {
        const fy = floor - f * 24;
        const fx = x + kelpSway * (f / 4.2);
        const fSide = (f % 2 === 0 ? 1 : -1);
        const bladeWave = Math.sin(time * 2.2 + f + i) * 8;

        // Pneumatocyst bulb
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(fx + fSide * 3, fy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Flowing serrated blade
        ctx.fillStyle = f % 2 === 0 ? '#10b981' : '#34d399';
        ctx.beginPath();
        ctx.moveTo(fx + fSide * 3, fy);
        ctx.quadraticCurveTo(fx + fSide * 18 + bladeWave * 0.5, fy - 8, fx + fSide * 32 + bladeWave, fy - 14);
        ctx.quadraticCurveTo(fx + fSide * 16 + bladeWave * 0.5, fy - 4, fx + fSide * 3, fy + 2);
        ctx.closePath();
        ctx.fill();
      }
    } else if (look.decoration === 'coral') {
      // Vibrant Staghorn & Table Coral Reef Grove with waving sea anemones and glowing polyps
      const colPalette = [
        { main: '#f43f5e', light: '#fda4af', dark: '#9f1239' },
        { main: '#a855f7', light: '#d8b4fe', dark: '#6b21a8' },
        { main: '#f97316', light: '#fed7aa', dark: '#9a3412' }
      ][i % 3];

      // Branching coral structure
      ctx.strokeStyle = colPalette.main;
      ctx.fillStyle = colPalette.dark;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, floor);
      ctx.lineTo(x, floor - 32);
      ctx.stroke();

      // Branching antler prongs
      ctx.lineWidth = 4;
      for (const side of [-1, 1]) {
        const bx = x + side * 14;
        const by = floor - 54 - (i % 2) * 12;
        ctx.beginPath();
        ctx.moveTo(x, floor - 24);
        ctx.quadraticCurveTo(x + side * 6, floor - 38, bx, by);
        ctx.stroke();

        // Secondary antler fork
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(x + side * 8, floor - 36);
        ctx.lineTo(x + side * 22, by + 6);
        ctx.stroke();

        // Glowing coral polyp tips
        ctx.fillStyle = colPalette.light;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.arc(x + side * 22, by + 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Base sea anemone with gentle waving tentacles
      ctx.fillStyle = colPalette.main;
      ctx.beginPath();
      ctx.arc(x, floor - 6, 11, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = colPalette.light;
      ctx.lineWidth = 1.8;
      for (let t = -4; t <= 4; t++) {
        const tx = x + t * 2.4;
        const tWave = Math.sin(time * 2.8 + t + i) * 5;
        ctx.beginPath();
        ctx.moveTo(tx, floor - 10);
        ctx.quadraticCurveTo(tx + tWave * 0.4, floor - 18, tx + tWave, floor - 25);
        ctx.stroke();
      }
    } else if (look.decoration === 'ruins') {
      // Classical Greco-Roman Sunken Temple Arches & Corinthian Columns with verdigris vine creepers
      ctx.save();
      const colW = 10;
      const archH = 56 + (i % 2) * 14;
      const leftX = x - 18;
      const rightX = x + 18;

      // Weathered marble column shafts with fluting
      const marbleGrad = ctx.createLinearGradient(leftX, 0, rightX, 0);
      marbleGrad.addColorStop(0, '#94a3b8');
      marbleGrad.addColorStop(0.3, '#cbd5e1');
      marbleGrad.addColorStop(0.7, '#f1f5f9');
      marbleGrad.addColorStop(1, '#64748b');

      // Left & right pillars
      for (const px of [leftX, rightX]) {
        ctx.fillStyle = marbleGrad;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        // Plinth base
        ctx.fillRect(px - 7, floor - 8, 14, 8);
        ctx.strokeRect(px - 7, floor - 8, 14, 8);
        // Column shaft
        ctx.fillRect(px - colW * 0.5, floor - archH, colW, archH - 8);
        ctx.strokeRect(px - colW * 0.5, floor - archH, colW, archH - 8);
        // Column fluting lines
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - 2, floor - archH + 2); ctx.lineTo(px - 2, floor - 10);
        ctx.moveTo(px + 2, floor - archH + 2); ctx.lineTo(px + 2, floor - 10);
        ctx.stroke();
        // Capital
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px - 8, floor - archH - 5, 16, 5);
      }

      // Rounded classical roman archway lintel connecting columns
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(x, floor - archH, 20, Math.PI, 0);
      ctx.lineTo(rightX + 8, floor - archH);
      ctx.lineTo(rightX + 8, floor - archH - 7);
      ctx.arc(x, floor - archH - 7, 26, 0, Math.PI, true);
      ctx.lineTo(leftX - 8, floor - archH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Keystone carving
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x - 3.5, floor - archH - 12, 7, 8);

      // Verdigris seaweed / ivy vines clinging to the ruins
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(leftX - 3, floor);
      ctx.quadraticCurveTo(leftX + 4, floor - archH * 0.5, leftX - 1, floor - archH);
      ctx.quadraticCurveTo(x, floor - archH - 8, rightX + 2, floor - archH + 12);
      ctx.stroke();
      ctx.restore();
    } else if (look.decoration === 'crystals') {
      // Radiant Prismatic Geode Cluster with faceted quartz pillars & sparkling internal refraction
      ctx.save();
      const crystalColors = [
        { gem: '#a855f7', glow: '#c084fc', highlight: '#f3e8ff' },
        { gem: '#06b6d4', glow: '#38bdf8', highlight: '#e0f2fe' },
        { gem: '#f43f5e', glow: '#fb7185', highlight: '#ffe4e6' },
      ][i % 3];

      // Dark basalt geode matrix pedestal
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(x, floor - 3, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cluster of 3 faceted crystals (tall center, leaning left & right)
      const spires = [
        { ox: -11, h: 42, w: 9, rot: -0.22 },
        { ox: 0, h: 68, w: 12, rot: 0.05 },
        { ox: 12, h: 36, w: 8, rot: 0.28 },
      ];

      for (const sp of spires) {
        ctx.save();
        ctx.translate(x + sp.ox, floor - 4);
        ctx.rotate(sp.rot);

        // Radiant crystal body gradient
        const cGrad = ctx.createLinearGradient(-sp.w * 0.5, 0, sp.w * 0.5, 0);
        cGrad.addColorStop(0, crystalColors.gem);
        cGrad.addColorStop(0.5, crystalColors.highlight);
        cGrad.addColorStop(1, crystalColors.glow);
        ctx.fillStyle = cGrad;
        ctx.strokeStyle = crystalColors.glow;
        ctx.lineWidth = 1.2;

        // Faceted crystal spire
        ctx.beginPath();
        ctx.moveTo(-sp.w * 0.5, 0);
        ctx.lineTo(-sp.w * 0.5, -sp.h * 0.7);
        ctx.lineTo(0, -sp.h);
        ctx.lineTo(sp.w * 0.5, -sp.h * 0.7);
        ctx.lineTo(sp.w * 0.5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Sharp interior facet ridge
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -sp.h);
        ctx.lineTo(0, 0);
        ctx.stroke();

        ctx.restore();
      }

      // Pulsating prismatic starlight starburst glint at apex
      const glintPulse = 0.75 + 0.25 * Math.sin(time * 3.5 + i);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = crystalColors.glow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, floor - 70, 2.5 * glintPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }
  ctx.fillStyle = { daylight: 'rgba(255,255,255,0.025)', moonlight: 'rgba(30,58,138,0.23)', sunset: 'rgba(251,146,60,0.16)', rose: 'rgba(236,72,153,0.13)' }[look.lighting];
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export const BOAT_PART_PALETTES = {
  hull: {
    label: 'Hull Paint',
    default: 'default',
    choices: [
      ['default', 'Classic Wood / Steel'],
      ['#0f294a', 'Deep Navy'],
      ['#7f1d1d', 'Royal Crimson'],
      ['#064e3b', 'Emerald Timber'],
      ['#18181b', 'Obsidian Slate'],
      ['#92400e', 'Amber Oak'],
      ['#cbd5e1', 'Pearl Hull'],
      ['#3b0764', 'Abyssal Violet'],
      ['#9d174d', 'Coral Rose'],
    ],
  },
  trim: {
    label: 'Trim & Railings',
    default: 'default',
    choices: [
      ['default', 'Signature Trim'],
      ['#fbbf24', 'Imperial Gold'],
      ['#38bdf8', 'Starlight Cyan'],
      ['#f8fafc', 'Ivory White'],
      ['#34d399', 'Seafoam Mint'],
      ['#f97316', 'Volcanic Amber'],
      ['#e879f9', 'Astral Magenta'],
      ['#f43f5e', 'Crimson Stripe'],
    ],
  },
  sails: {
    label: 'Sails & Canopy',
    default: 'default',
    choices: [
      ['default', 'Classic Canvas'],
      ['#e0e7ff', 'Celestial Mist'],
      ['#fef08a', 'Sunset Gold'],
      ['#fda4af', 'Corsair Blush'],
      ['#a7f3d0', 'Emerald Breeze'],
      ['#334155', 'Shadow Stealth'],
      ['#e9d5ff', 'Aurora Lavender'],
    ],
  },
};

export function normalizeBoatColors(values = {}) {
  const safeValues = (values && typeof values === 'object') ? values : {};
  return Object.fromEntries(
    Object.entries(BOAT_PART_PALETTES).map(([key, config]) => {
      const val = safeValues[key];
      const validChoice = config.choices.some(([c]) => c === val);
      const isHex = typeof val === 'string' && /^#[0-9a-f]{6}$/i.test(val);
      return [key, (validChoice || isHex) ? val : config.default];
    })
  );
}

export const EXOTIC_BOAT_HULLS = {
  standard: {
    id: 'standard',
    label: 'Sovereign Standard Hull',
    subtitle: 'Upgraded Fleet Chassis',
    desc: 'Your classic tiered seafaring vessel geometry forged through shipyard upgrades.',
    cost: 0,
    requiresMax: false,
    accent: '#fbbf24',
  },
  pirate: {
    id: 'pirate',
    label: "Blackbeard's Dread Galleon",
    subtitle: 'Legendary Corsair Warship',
    desc: 'Broadside cannon ports, grim skull-and-crossbones mainsail, spiked figurehead, and burning deck braziers.',
    cost: 120000,
    requiresMax: true,
    accent: '#ef4444',
  },
  submarine: {
    id: 'submarine',
    label: 'Abyssal Nautilus Submersible',
    subtitle: 'Pressurized Bathyscaphe',
    desc: 'Riveted pressure hull, glowing observatory glass dome, rotating brass periscope, and turbine screw.',
    cost: 165000,
    requiresMax: true,
    accent: '#38bdf8',
  },
  chinese_junk: {
    id: 'chinese_junk',
    label: 'Imperial Dragon Junk',
    subtitle: 'Ancient Eastern Treasure Fleet',
    desc: 'Swept high teak stern, battened vermilion fan sails, hanging silk lanterns, and gilded jade dragon prow.',
    cost: 190000,
    requiresMax: true,
    accent: '#f59e0b',
  },
  viking: {
    id: 'viking',
    label: 'Frostfang Norse Longship',
    subtitle: 'Dragon-Prow Drakkar',
    desc: 'Clinker-planked shallow hull lined with painted shieldwall bosses, fierce dragon-head stem, and striped wool sail.',
    cost: 145000,
    requiresMax: true,
    accent: '#60a5fa',
  },
  ghost_ship: {
    id: 'ghost_ship',
    label: 'Flying Dutchman Specter',
    subtitle: 'Spectral Phantom Vessel',
    desc: 'Ectoplasmic luminous ribs, tattered spirit sails, ghostly sea-fire lanterns, and drifting spectral mist.',
    cost: 225000,
    requiresMax: true,
    accent: '#2dd4bf',
  },
  steampunk: {
    id: 'steampunk',
    label: 'Aether Chronos Ironclad',
    subtitle: 'Clockwork Steam Dreadnought',
    desc: 'Copper-plated armored prow, spinning brass paddlewheel, puffing twin smokestacks, and arcane lightning spire.',
    cost: 260000,
    requiresMax: true,
    accent: '#fb923c',
  },
};

export const BOAT_SKIN_OPTIONS = {
  default: { id: 'default', label: 'Classic Oak', desc: 'Clean heritage maritime varnish & brushed brass seams.', cost: 0, color: null, effect: 'classic' },
  coral: { id: 'coral', label: 'Living Reef Coral', desc: 'Sculpted coral blossoms, pearl waterline studs & sunlit rose wash.', cost: 15, color: '#fb7185', hullTint: '#881337', secondaryColor: '#fda4af', glow: '#fb7185', effect: 'coral_bloom' },
  indigo: { id: 'indigo', label: 'Vortex Tide Indigo', desc: 'Twin crashing storm-wave chevron stripes & luminous sapphire compass sigil.', cost: 20, color: '#818cf8', hullTint: '#1e1b4b', secondaryColor: '#38bdf8', glow: '#818cf8', effect: 'indigo_vortex' },
  emerald: { id: 'emerald', label: 'Bioluminescent Jade', desc: 'Glowing seafoam filigree patterns & enchanted emerald spirit lanterns.', cost: 25, color: '#34d399', hullTint: '#064e3b', secondaryColor: '#a7f3d0', glow: '#10b981', effect: 'emerald_bio' },
  gold: { id: 'gold', label: 'Imperial Bullion Gold', desc: 'Mirror-hammered gold-leaf armor plates, filigree flourishes & radiant sparkle glints.', cost: 40, color: '#fbbf24', hullTint: '#451a03', secondaryColor: '#fef08a', sailTint: '#fef3c7', glow: '#facc15', effect: 'gold_plate' },
  celestial: { id: 'celestial', label: 'Celestial Starlight', desc: 'Shimmering animated constellation stars & cosmic nebula aurora sheen across hull & sails.', cost: 45, color: '#c084fc', secondaryColor: '#e0e7ff', glow: '#a855f7', hullTint: '#2e1065', sailTint: '#e9d5ff', effect: 'celestial_stars' },
  obsidian: { id: 'obsidian', label: 'Molten Caldera Magma', desc: 'Charred volcanic basalt armor cracked open with glowing pulsing lava veins & rising sparks.', cost: 40, color: '#ea580c', secondaryColor: '#fde047', glow: '#f97316', hullTint: '#1c1917', sailTint: '#fed7aa', effect: 'magma_cracks' },
  pearl: { id: 'pearl', label: 'Prismatic Mother-of-Pearl', desc: 'Shifting rainbow iridescent nacre shimmer sweeping smoothly along every plank and sail.', cost: 35, color: '#38bdf8', secondaryColor: '#f5d0fe', glow: '#7dd3fc', hullTint: '#475569', sailTint: '#f8fafc', effect: 'pearl_prism' },
  crimson: { id: 'crimson', label: 'Bloodmoon Specter', desc: 'Wraithlike obsidian hulls etched with glowing crimson rune bands and ember drift.', cost: 30, color: '#f43f5e', secondaryColor: '#fda4af', glow: '#e11d48', hullTint: '#4c0519', sailTint: '#ffe4e6', effect: 'crimson_runes' },
  amethyst: { id: 'amethyst', label: 'Crystal Geode Amethyst', desc: 'Faceted royal quartz clusters & luminous violet crystal prism highlights.', cost: 35, color: '#9333ea', secondaryColor: '#f3e8ff', glow: '#c084fc', hullTint: '#3b0764', sailTint: '#f3e8ff', effect: 'amethyst_facets' },
  midnight: { id: 'midnight', label: 'Abyssal Cyber Neon', desc: 'Matte tactical carbon planking traced by pulsing electric cyan circuit strips.', cost: 25, color: '#22d3ee', secondaryColor: '#06b6d4', glow: '#22d3ee', hullTint: '#090d16', sailTint: '#cbd5e1', effect: 'neon_circuit' },
  rose_gold: { id: 'rose_gold', label: 'Champagne Rose Sunset', desc: 'Brushed copper-rose metallic gradient banded with warm sunset shimmer beams.', cost: 30, color: '#fda4af', secondaryColor: '#fed7aa', glow: '#fb7185', hullTint: '#500724', sailTint: '#fce7f3', effect: 'rose_sheen' },
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

export function drawBoatTrinket(ctx, trinketId, vessel = 0, time = 0, bW = 120, bH = 34, hullStyle = 'standard') {
  if (!trinketId || trinketId === 'none') return;
  const layout = getVesselLayout(vessel, bW, bH, hullStyle);
  ctx.save();
  try {
    if (trinketId === 'lucky_cat') {
    const cx = layout.trinketRight.x;
    const cy = layout.trinketRight.y;
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
    const dx = layout.trinketRight.x;
    const dy = layout.trinketRight.y + Math.sin(time * 4) * 1.5;
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
    const wx = layout.trinketLeft.x;
    const wy = layout.trinketLeft.y;
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
    const bx = layout.trinketRight.x;
    const by = layout.trinketRight.y;
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
    const px = layout.trinketLeft.x;
    const py = layout.trinketLeft.y;
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
    const ox = layout.trinketRight.x;
    const oy = layout.trinketRight.y;
    ctx.translate(ox, oy);
    // Polished brass pedestal
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(3, -9); ctx.lineTo(-3, -9); ctx.closePath();
    ctx.fill();
    ctx.fillRect(-5, -11, 10, 2);
    // Levitating pulsating glowing crystal orb
    const hoverY = Number.isFinite(time) ? -18 + Math.sin(time * 3) * 2 : -18;
    // Outer magical aura
    const pulseRadius = Number.isFinite(time) ? 9 + Math.sin(time * 5) * 1.5 : 9;
    try {
      const auraGrad = ctx.createRadialGradient(0, hoverY, 1, 0, hoverY, pulseRadius);
      auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      auraGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.4)');
      auraGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, hoverY, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
    } catch (e) {}
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
  } catch (err) {
    console.warn('drawBoatTrinket error:', err);
  } finally {
    ctx.restore();
  }
}


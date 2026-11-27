// EasterEggs.js — Whimsical hidden easter eggs across the Seven Seas

export const CONSTELLATION_FISH_STARS = [
  { id: 'nose', nx: 0.78, ny: 0.24, label: 'Snout Star' },
  { id: 'dorsal', nx: 0.67, ny: 0.14, label: 'Dorsal Crest' },
  { id: 'peduncle_top', nx: 0.59, ny: 0.22, label: 'Tail Spine' },
  { id: 'tail_top', nx: 0.53, ny: 0.13, label: 'Upper Fluke' },
  { id: 'tail_bot', nx: 0.53, ny: 0.34, label: 'Lower Fluke' },
  { id: 'belly', nx: 0.66, ny: 0.33, label: 'Belly Fin' },
  { id: 'chin', nx: 0.73, ny: 0.29, label: 'Gill Star' },
];

// Connection edges forming the celestial fish outline
const CONSTELLATION_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 2], [2, 5], [5, 6], [6, 0],
];

export function getConstellationScreenCoords(screenWidth, surfaceY, cameraY) {
  const w = Number.isFinite(screenWidth) && screenWidth > 200 ? screenWidth : 1200;
  const skyH = Math.max(120, surfaceY - cameraY);
  return CONSTELLATION_FISH_STARS.map(s => ({
    ...s,
    x: s.nx * w,
    y: Math.max(24, Math.min(skyH - 22, s.ny * Math.min(skyH * 2.1, 420))),
  }));
}

export function renderFishConstellation(ctx, state, screenWidth, surfaceY, cameraY, time) {
  if (!state?.active || cameraY >= surfaceY) return;
  const pts = getConstellationScreenCoords(screenWidth, surfaceY, cameraY);
  const clicked = state.clicked instanceof Set ? state.clicked : new Set(state.clicked || []);
  const solved = !!state.solved;

  ctx.save();
  try {
    // Faint guide lines between already-lit adjacent stars (or full silhouette when solved)
    ctx.lineCap = 'round';
    for (const [aIdx, bIdx] of CONSTELLATION_EDGES) {
      const a = pts[aIdx];
      const b = pts[bIdx];
      const bothLit = solved || (clicked.has(a.id) && clicked.has(b.id));
      ctx.strokeStyle = bothLit
        ? 'rgba(250, 204, 21, 0.88)'
        : 'rgba(148, 163, 184, 0.16)';
      ctx.lineWidth = bothLit ? 2.2 : 1.0;
      if (!bothLit) ctx.setLineDash([4, 5]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw the 7 interactive stars
    pts.forEach((star, idx) => {
      const isLit = solved || clicked.has(star.id);
      const pulse = 0.8 + 0.25 * Math.sin(time * 3.2 + idx * 1.1);
      const radius = (isLit ? 6.5 : 4.6) * pulse;

      // Halo glow
      ctx.fillStyle = isLit ? 'rgba(250, 204, 21, 0.36)' : 'rgba(56, 189, 248, 0.28)';
      ctx.beginPath();
      ctx.arc(star.x, star.y, radius * 2.3, 0, Math.PI * 2);
      ctx.fill();

      // Star core
      ctx.fillStyle = isLit ? '#fef08a' : '#bae6fd';
      ctx.beginPath();
      ctx.arc(star.x, star.y, radius * 0.72, 0, Math.PI * 2);
      ctx.fill();

      // 4-point star flare
      ctx.strokeStyle = isLit ? '#fde047' : '#ffffff';
      ctx.lineWidth = isLit ? 1.6 : 1.0;
      ctx.beginPath();
      ctx.moveTo(star.x - radius * 1.4, star.y);
      ctx.lineTo(star.x + radius * 1.4, star.y);
      ctx.moveTo(star.x, star.y - radius * 1.4);
      ctx.lineTo(star.x, star.y + radius * 1.4);
      ctx.stroke();
    });
  } finally {
    ctx.restore();
  }
}

export function handleConstellationClick(state, clickX, clickY, screenWidth, surfaceY, cameraY) {
  if (!state?.active || state.solved || cameraY >= surfaceY) return { hit: false };
  const pts = getConstellationScreenCoords(screenWidth, surfaceY, cameraY);
  if (!(state.clicked instanceof Set)) state.clicked = new Set(state.clicked || []);

  for (const star of pts) {
    if (Math.hypot(clickX - star.x, clickY - star.y) <= 26) {
      const wasNew = !state.clicked.has(star.id);
      state.clicked.add(star.id);
      const completed = state.clicked.size >= pts.length;
      if (completed) state.solved = true;
      return { hit: true, wasNew, star, completed, clickedCount: state.clicked.size, total: pts.length };
    }
  }
  return { hit: false };
}

export function renderMoonReflectionAndGhostShip(ctx, worldWidth, surfaceY, cameraY, time, sky, ghostState) {
  if (!sky?.isNight) return;
  const w = Number.isFinite(worldWidth) && worldWidth > 0 ? worldWidth : 1200;
  const drawSurfaceY = surfaceY - cameraY;
  const moonX = w * 0.2;

  ctx.save();
  try {
    // 1. Shimmering Moon Reflection Pillar on surface water directly below the moon
    if (drawSurfaceY > -40 && drawSurfaceY < 900) {
      for (let i = 0; i < 6; i++) {
        const yOff = drawSurfaceY + 5 + i * 7;
        const wOff = Math.max(8, 36 - i * 4.5) + Math.sin(time * 2.4 + i) * 5;
        const shimmerX = moonX + Math.sin(time * 2.0 + i * 1.2) * 4;
        ctx.fillStyle = ghostState?.active
          ? `rgba(153, 246, 228, ${0.42 - i * 0.055})`
          : `rgba(254, 249, 195, ${0.38 - i * 0.05})`;
        ctx.beginPath();
        ctx.ellipse(shimmerX, yOff, wOff, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Summoned Spectral Ghost Ship gliding across the moonlit water horizon
    if (ghostState?.active && cameraY < surfaceY + 140) {
      const gx = Number.isFinite(ghostState.x) ? ghostState.x : moonX;
      const gy = drawSurfaceY - 12 + Math.sin(time * 1.8) * 4;
      const alpha = Math.min(0.85, ghostState.alpha ?? 0.8);
      ctx.save();
      ctx.translate(gx, gy);
      ctx.globalAlpha = alpha;
      // Ghostly fog aura
      ctx.fillStyle = 'rgba(45, 212, 191, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, -16, 74, 38, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spectral galleon hull
      ctx.fillStyle = '#0f292e';
      ctx.strokeStyle = '#5eead4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-48, -10);
      ctx.lineTo(-40, 14);
      ctx.quadraticCurveTo(0, 22, 42, 12);
      ctx.lineTo(52, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tattered translucent spectral sails
      ctx.strokeStyle = '#99f6e4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-12, -10); ctx.lineTo(-14, -74);
      ctx.moveTo(16, -10); ctx.lineTo(14, -84);
      ctx.stroke();

      ctx.fillStyle = 'rgba(153, 246, 228, 0.42)';
      ctx.beginPath();
      ctx.moveTo(14, -80);
      ctx.lineTo(42, -72);
      ctx.quadraticCurveTo(32 + Math.sin(time * 2) * 6, -42, 34, -18);
      ctx.lineTo(22, -24);
      ctx.lineTo(14, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Floating spectral lantern
      ctx.fillStyle = '#99f6e4';
      ctx.beginPath();
      ctx.arc(-44, -18, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } finally {
    ctx.restore();
  }
}

export function createGhostCaptainEncounter() {
  return {
    id: 'ghost_captain_vane',
    name: 'Captain Vane, Spectral Skipper',
    title: 'Phantom Helmsman of the Silver Wake',
    avatar: '👻⚓',
    themeColor: '#2dd4bf',
    greeting: 'You cast straight through the pale reflection of midnight... Few living captains know the old lunar signal. Accept a phantom gift from our sunken hold!',
    options: [
      {
        id: 'spectral_boon',
        label: 'Accept Spectral Oracle Lantern (+2 Gems & Starlight Sight)',
        desc: 'Claims 2 rare abyssal Gems plus 4 minutes of Starlight Sight & +300 XP.',
        cost: 0,
        action: (saveSystem) => {
          saveSystem.data.gems = (saveSystem.data.gems || 0) + 2;
          saveSystem.addBuff('starlightClarity', 240000);
          saveSystem.addXp(300);
          saveSystem.save();
          return { success: true, message: '👻 Captain Vane bestowed +2 Gems, +300 XP & Starlight Sight (4m)!' };
        },
      },
      {
        id: 'phantom_doubloons',
        label: 'Claim Sunken Moon Doubloons (+$1,500 Gold)',
        desc: 'Receive $1,500 in gleaming moon-washed gold coins forged centuries ago.',
        cost: 0,
        action: (saveSystem) => {
          saveSystem.addCoins(1500);
          saveSystem.addXp(180);
          return { success: true, message: '👻 Claimed +$1,500 Moon Doubloons & +180 XP!' };
        },
      },
    ],
  };
}

export function renderAlienUfoEvent(ctx, ufoState, targetX, targetY, cameraY, time) {
  if (!ufoState?.active) return;
  const ux = Number.isFinite(ufoState.x) ? ufoState.x : targetX;
  const uy = (Number.isFinite(ufoState.y) ? ufoState.y : 78) - cameraY * 0.25;
  const beamTargetY = targetY - cameraY;

  ctx.save();
  try {
    // Tractor beam cone when beaming over the bobber
    if (ufoState.phase === 'beaming') {
      const beamAlpha = 0.22 + 0.1 * Math.sin(time * 9);
      const beamGrad = ctx.createLinearGradient(ux, uy + 8, targetX, beamTargetY);
      beamGrad.addColorStop(0, `rgba(74, 222, 128, ${beamAlpha * 1.4})`);
      beamGrad.addColorStop(1, 'rgba(34, 211, 238, 0.04)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(ux - 12, uy + 10);
      ctx.lineTo(targetX + 24, beamTargetY);
      ctx.lineTo(targetX - 24, beamTargetY);
      ctx.lineTo(ux + 12, uy + 10);
      ctx.closePath();
      ctx.fill();
    }

    // Miniature saucer craft
    ctx.translate(ux, uy + Math.sin(time * 5) * 3);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.72)';
    ctx.beginPath();
    ctx.arc(0, -5, 11, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 1, 23, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Blinking emerald rim lights
    for (let i = -2; i <= 2; i++) {
      ctx.fillStyle = Math.floor(time * 8 + i) % 2 === 0 ? '#4ade80' : '#fef08a';
      ctx.beginPath();
      ctx.arc(i * 7.5, 2, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } finally {
    ctx.restore();
  }
}

export const UNION_SIGNS = [
  'BETTER BAIT!',
  'FAIR HOOK PAY',
  'NO CHEAP WORMS',
  'FISH UNION #404',
];

export function renderFishEasterEggOverlay(ctx, fish, hook, cameraY) {
  if (!fish) return;

  // 1. Misleading Monster: ominous giant shadow until hook approaches within 145px
  if (fish.isMisleadingMonster) {
    const dist = hook ? Math.hypot(hook.x - fish.x, hook.y - fish.y) : 999;
    if (dist <= 145 || fish.state === 'HOOKED') {
      fish._revealedSmall = true;
    }
    if (!fish._revealedSmall) {
      // Looming colossal monster silhouette around the tiny minnow
      ctx.save();
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(-8, 0, 110, 48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-108, 0);
      ctx.lineTo(-142, -44);
      ctx.lineTo(-128, 0);
      ctx.lineTo(-142, 44);
      ctx.closePath();
      ctx.fill();
      // Glowing red fake eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(58, -14, 5.5, 0, Math.PI * 2);
      ctx.arc(76, -10, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Adorable tiny brass lantern held on a miniature twig!
      ctx.save();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(12, -2);
      ctx.lineTo(26, -12);
      ctx.lineTo(26, -4);
      ctx.stroke();
      ctx.fillStyle = 'rgba(254, 240, 138, 0.36)';
      ctx.beginPath();
      ctx.arc(26, -1, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(23, -4, 6, 7);
      ctx.restore();
    }
  }

  // 2. Fish with a tiny fishing rod trying to catch YOU!
  if (fish.isFishingFish) {
    ctx.save();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.quadraticCurveTo(28, -22, 44, -26);
    ctx.stroke();

    // Mini fishing line & hook dangling down in front
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.85)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(44, -26);
    ctx.lineTo(44, 6 + Math.sin((fish.wiggleTimer || 0) * 3) * 4);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(44, 9 + Math.sin((fish.wiggleTimer || 0) * 3) * 4, 3.2, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  // 3. Unionized Fish carrying protest placard sign
  if (fish.isUnionFish) {
    ctx.save();
    // Flip text upright even if fish swims left (ctx was scaled by direction)
    const dir = fish.direction === -1 ? -1 : 1;
    ctx.scale(dir, 1);

    // Picket stick & wooden placard sign above the fish
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, -34);
    ctx.stroke();

    const signText = fish.unionSign || 'BETTER BAIT!';
    ctx.font = 'bold 9px Outfit, sans-serif';
    const textW = Math.max(58, ctx.measureText(signText).width + 12);
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.8;
    ctx.fillRect(-textW * 0.5, -52, textW, 18);
    ctx.strokeRect(-textW * 0.5, -52, textW, 18);
    ctx.fillStyle = '#7f1d1d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(signText, 0, -43);
    ctx.restore();
  }
}

export function renderAquariumFamiliarCaptain(ctx, state, canvasWidth, time, captainName) {
  if (!state?.active) return;
  const w = Number.isFinite(canvasWidth) && canvasWidth > 100 ? canvasWidth : 760;
  const bx = Number.isFinite(state.x) ? state.x : w * 0.5;
  const by = 22 + Math.sin(time * 2.3) * 2.5;
  const label = captainName || 'Guest';

  ctx.save();
  try {
    ctx.translate(bx, by);
    // Tiny miniature timber boat
    ctx.fillStyle = '#9a3412';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-24, -4);
    ctx.lineTo(-18, 9);
    ctx.quadraticCurveTo(0, 14, 19, 8);
    ctx.lineTo(25, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Miniature stick captain silhouetted on deck
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-4, -14, 7, 10);
    ctx.fillStyle = '#fde6c8';
    ctx.beginPath();
    ctx.arc(-0.5, -17, 4, 0, Math.PI * 2);
    ctx.fill();

    // Mini sail mast + nameplate banner bearing Captain's username
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(8, -4);
    ctx.lineTo(8, -26);
    ctx.stroke();

    ctx.font = 'bold 10px Outfit, sans-serif';
    const tw = Math.max(46, ctx.measureText(label).width + 14);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(-tw * 0.5, -36, tw, 15, 5);
    } else {
      ctx.rect(-tw * 0.5, -36, tw, 15);
    }
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, -28.5);
  } finally {
    ctx.restore();
  }
}

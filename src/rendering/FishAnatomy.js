// Original Canvas artwork. Anatomy is resolved once per species, with no textures
// or random per-frame geometry. Existing species IDs, palettes and stats stay intact.
const anatomyCache = new WeakMap();
export function getFishAnatomy(species) {
  if (!species || species.isLeviathan || !['oval', 'disc'].includes(species.shape)) return null;
  if (anatomyCache.has(species)) return anatomyCache.get(species);
  const name = species.name.toLowerCase();
  let seed = 0;
  for (const char of species.id || name) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0;
  const kind = /amphora/.test(name) ? 'amphora' : /temple bell/.test(name) ? 'bell' :
    /puffer/.test(name) ? 'puffer' : /boxfish/.test(name) ? 'box' : /gear|cog/.test(name) ? 'gear' :
    /lantern/.test(name) ? 'lantern' : /grouper/.test(name) ? 'grouper' : /sole/.test(name) ? 'sole' :
    /glass/.test(name) ? 'glass' : /opah|discus/.test(name) ? 'discus' :
    /tetra|sprat|smelt/.test(name) ? 'tetra' : /crown|emperor|oracle|monarch/.test(name) ? 'crown' : 'reef';
  const dimensions = { grouper: [26, 13], sole: [26, 8], discus: [17, 19], tetra: [22, 8], glass: [19, 13],
    crown: [19, 15], reef: [20 + seed % 5, 10 + seed % 5], lantern: [20, 13] };
  const [length, height] = dimensions[kind] || [18, 16];
  const anatomy = { kind, length, height, seed, pattern: species.pattern || 'spots',
    motif: /porcelain|willow/.test(name) ? 'porcelain' : /mosaic|tile/.test(name) ? 'mosaic' :
      /scoria|basalt|obsidian/.test(name) ? 'basalt' : /cloud|cotton/.test(name) ? 'cloud' :
      /solstice|lunar|moon/.test(name) ? 'moon' : /darkmatter|void|paradox/.test(name) ? 'void' : 'scales' };
  anatomyCache.set(species, anatomy);
  return anatomy;
}

function eye(ctx, x, y, radius = 2.6) {
  ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#102f3d'; ctx.beginPath(); ctx.arc(x + .7, y, radius * .54, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + .5, y - .8, .7, 0, Math.PI * 2); ctx.fill();
}
function fin(ctx, x, y, width, height, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - width * .45, y + height * .4, x - width, y + height);
  ctx.lineTo(x - width * .3, y + height * .85); ctx.closePath(); ctx.fill();
}
function bodyPath(ctx, length, height, kind) {
  ctx.beginPath(); ctx.moveTo(-length, 0);
  if (kind === 'glass' || kind === 'box') {
    ctx.lineTo(-length * .55, -height); ctx.lineTo(length * .65, -height * .8);
    ctx.lineTo(length, -2); ctx.lineTo(length * .9, height * .65); ctx.lineTo(-length * .6, height);
  } else {
    ctx.bezierCurveTo(-length * .7, -height * 1.3, length * .55, -height * 1.25, length, -height * .12);
    if (kind === 'grouper') { ctx.lineTo(length + 3, 1); ctx.lineTo(length - 2, 4); }
    ctx.bezierCurveTo(length * .8, height * 1.15, -length * .6, height * 1.25, -length, 0);
  }
  ctx.closePath();
}

export function drawDistinctFish(ctx, anatomy, primary, secondary, finColor, time) {
  if (!anatomy) return false;
  const { kind, length: l, height: h, seed, motif } = anatomy;
  const wave = Math.sin(time * 2) * 2;
  ctx.save();
  try {
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 1.1;
    ctx.strokeStyle = secondary;
    if (kind === 'amphora') {
      // A ceramic belly, narrow flared neck, twin handle fins and Greek-key band.
      fin(ctx, -19, 0, 13, -11 + wave, finColor); fin(ctx, -19, 0, 13, 11 + wave, finColor);
      ctx.strokeStyle = finColor; ctx.lineWidth = 4;
      for (const sign of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(-11, sign * 8); ctx.bezierCurveTo(-16, sign * 26, 8, sign * 26, 6, sign * 7); ctx.stroke();
      }
      ctx.fillStyle = primary; ctx.strokeStyle = secondary; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(-21, 0); ctx.bezierCurveTo(-18, -20, 1, -20, 10, -7);
      ctx.lineTo(20, -7); ctx.lineTo(23, -10); ctx.lineTo(25, -8); ctx.lineTo(25, 8); ctx.lineTo(23, 10);
      ctx.lineTo(20, 7); ctx.lineTo(10, 7); ctx.bezierCurveTo(0, 20, -18, 20, -21, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = finColor; ctx.lineWidth = 2.2;
      for (const x of [-10, -3]) { ctx.beginPath(); ctx.moveTo(x, -12); ctx.lineTo(x, 12); ctx.stroke(); }
      ctx.strokeStyle = secondary; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-16, 4); ctx.lineTo(-12, 4); ctx.lineTo(-12, 0); ctx.lineTo(-7, 0); ctx.lineTo(-7, 5); ctx.stroke();
      ctx.strokeStyle = '#5eead4'; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(3, -6); ctx.lineTo(0, -2); ctx.lineTo(4, 4); ctx.stroke();
      eye(ctx, 13, -2, 2.2); return true;
    }
    if (kind === 'bell') {
      // Scalloped bronze bell body, ringing clapper, vent slits and crown spines.
      fin(ctx, -15, -1, 13, -9 + wave, finColor); fin(ctx, 14, 0, -13, 8 - wave, finColor);
      ctx.fillStyle = primary; ctx.beginPath(); ctx.moveTo(-19, 10);
      ctx.bezierCurveTo(-14, 4, -18, -18, -1, -20); ctx.bezierCurveTo(16, -20, 14, 3, 20, 10);
      for (let x = 20; x > -19; x -= 8) ctx.quadraticCurveTo(x - 4, 15, x - 8, 10);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = finColor;
      ctx.beginPath(); ctx.moveTo(-16, 6); ctx.quadraticCurveTo(0, 11, 17, 6); ctx.stroke();
      for (const x of [-11, -5, 1]) { ctx.beginPath(); ctx.moveTo(x, -9); ctx.lineTo(x, -1); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, 13); ctx.lineTo(Math.sin(time * 2) * 3, 19); ctx.stroke();
      ctx.fillStyle = secondary; ctx.beginPath(); ctx.arc(Math.sin(time * 2) * 3, 19, 3, 0, Math.PI * 2); ctx.fill();
      for (const [x, y] of [[-13, -13], [-7, -18], [2, -20], [11, -15]]) fin(ctx, x, y, 3, -6, finColor);
      eye(ctx, 10, -6); return true;
    }
    if (kind === 'puffer' || kind === 'gear') {
      const teeth = kind === 'gear' ? 12 : 9 + seed % 5;
      ctx.strokeStyle = finColor; ctx.lineWidth = kind === 'gear' ? 3 : 1.5;
      for (let n = 0; n < teeth; n++) {
        const a = n * Math.PI * 2 / teeth;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * 15, Math.sin(a) * 15);
        ctx.lineTo(Math.cos(a) * (kind === 'gear' ? 21 : 23), Math.sin(a) * (kind === 'gear' ? 21 : 23)); ctx.stroke();
      }
      ctx.fillStyle = primary; ctx.beginPath(); ctx.ellipse(0, 0, 18, motif === 'cloud' ? 16 : 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = secondary; ctx.lineWidth = 1.1; ctx.stroke();
      if (kind === 'gear') {
        ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke();
        for (let n = 0; n < 5; n++) { const a = n * Math.PI * 2 / 5; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4); ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10); ctx.stroke(); }
      } else {
        ctx.fillStyle = secondary;
        for (let n = 0; n < 7; n++) { const x = -10 + n % 3 * 7, y = -10 + Math.floor(n / 3) * 8;
          ctx.beginPath(); motif === 'basalt' ? ctx.rect(x, y, 4, 4) : ctx.arc(x, y, motif === 'moon' ? 2.2 : 1.4, 0, Math.PI * 2); ctx.fill(); }
        if (motif === 'cloud') { ctx.strokeStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(-3, -3, 9, Math.PI, Math.PI * 1.8); ctx.stroke(); }
      }
      fin(ctx, -17, 0, 12, 7 + wave, finColor); fin(ctx, 14, 4, 7, 6 - wave, finColor); eye(ctx, 11, -5); return true;
    }
    // Silhouettes differ before markings: deep discus, flat sole, slender tetra,
    // broad-jawed grouper, angular glassfish, and individual reef proportions.
    fin(ctx, -l + 1, 0, 12 + seed % 5, -9 - wave, finColor);
    fin(ctx, -l + 1, 0, 12 + seed % 5, 9 - wave, finColor);
    fin(ctx, 1, -h * .65, 12, kind === 'crown' ? -17 : -6 - seed % 7, finColor);
    fin(ctx, -1, h * .6, 9, kind === 'sole' ? 3 : 8 + seed % 4, finColor);
    if (kind === 'glass') ctx.globalAlpha *= .75;
    ctx.fillStyle = primary; bodyPath(ctx, l, h, kind); ctx.fill(); ctx.strokeStyle = secondary; ctx.stroke();
    ctx.save(); bodyPath(ctx, l, h, kind); ctx.clip();
    ctx.strokeStyle = secondary; ctx.fillStyle = secondary; ctx.lineWidth = 1.2;
    for (let n = 0; n < 3 + seed % 4; n++) {
      const x = -l * .65 + n * 5, y = Math.sin(n + seed) * h * .35;
      ctx.beginPath();
      if (motif === 'mosaic' || kind === 'box') { ctx.moveTo(x, y - 4); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 4); ctx.lineTo(x - 4, y); ctx.closePath(); ctx.stroke(); }
      else if (motif === 'porcelain') { ctx.arc(x, y, 5, 0, Math.PI * 1.3); ctx.stroke(); }
      else if (anatomy.pattern === 'bands') { ctx.moveTo(x, -h); ctx.quadraticCurveTo(x - 4, 0, x, h); ctx.stroke(); }
      else { ctx.arc(x, y, 1.3 + seed % 3 * .4, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
    ctx.strokeStyle = secondary; ctx.lineWidth = .9;
    ctx.beginPath(); ctx.moveTo(l * .5, -h * .4); ctx.quadraticCurveTo(l * .3, 1, l * .55, h * .5); ctx.stroke();
    fin(ctx, l * .3, 2, 10, 6 + wave, finColor);
    if (kind === 'lantern') {
      ctx.strokeStyle = secondary; ctx.beginPath(); ctx.moveTo(5, -h + 1); ctx.quadraticCurveTo(4, -h - 14, 17, -h - 8 + wave); ctx.stroke();
      ctx.fillStyle = finColor; ctx.beginPath(); ctx.arc(17, -h - 8 + wave, 3.2, 0, Math.PI * 2); ctx.fill();
    }
    eye(ctx, l * .71, -h * .27, kind === 'tetra' ? 2 : 2.7);
    if (kind === 'sole') eye(ctx, l * .42, -h * .58, 2.1);
    ctx.strokeStyle = secondary; ctx.beginPath(); ctx.moveTo(l * .94, 2); ctx.lineTo(l + 1, 3); ctx.stroke();
    return true;
  } finally { ctx.restore(); }
}

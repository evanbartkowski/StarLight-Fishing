import { TREASURE_ITEMS } from '../data/TreasureData.js';

// Original vector drawings. One definition drives the ocean, haul, inventory and
// specimen view. Resolve by catalog ID so existing saves need no art migration.
const catalog = new Map(TREASURE_ITEMS.filter(item => !item.isCrate).map(item => [item.id, item]));
catalog.set('sunken_safe',{id:'sunken_safe',name:'Sunken Iron Safe',color:'#657c83',glow:'#c7d9d5'});
const artworkId = item => catalog.has(item?.id) ? item.id : catalog.has(item?.speciesId) ? item.speciesId :
  (item?.isSunkenSafe || String(item?.id || '').startsWith('sunken_safe_')) ? 'sunken_safe' : null;
const drawings = new Map(), svgCache = new Map(), paths = new WeakMap(), sprites = new Map();
const gold = '#e9bc68', ink = '#493b57', light = '#fff0c2';
const p = (d, fill = 'none', stroke = ink, width = 1.5, opacity = 1) => ({ d, fill, stroke, width, opacity });
const ellipse = (x, y, rx, ry, fill, stroke = ink, width = 1.5) => p(`M${x-rx} ${y}a${rx} ${ry} 0 1 0 ${rx*2} 0a${rx} ${ry} 0 1 0 ${-rx*2} 0`, fill, stroke, width);
const gem = (x, y, r, color) => [p(`M${x} ${y-r}l${r*.8} ${r*.6}l${-r*.25} ${r*1.15}l${-r*.55} ${r*.25}l${-r*.55} ${-r*.25}l${-r*.25} ${-r*1.15}Z`, color), p(`M${x} ${y-r}v${r*2}m${-r*.8} ${-r*1.4}h${r*1.6}`, 'none', light, .8)];
const lines = (d, stroke = gold, width = 1.5) => p(d, 'none', stroke, width);

function design(item) {
  const n = item.name.toLowerCase(), c = item.color || '#6dc5d0', g = item.glow || light;
  let a;
  if (/\bsafe\b/.test(n)) {
    a=[p('M-25-23H19L26-17V25H-25Z','#526871','#293e4d',2),p('M-21-18H20V19H-21Z','#233d4a','#a8bfc1',1.3),
      p('M-17-15H17V16H-17Z','#758b8b','#394e5c',1.6),p('M-25-23H19L26-17H-18Z','#9bb1ad','#40545c'),
      ellipse(1,0,9,9,'#3d5664',gold),ellipse(1,0,3,3,gold,'#e7d5a0'),lines('M1-7V7M-6 0H8M-4-5L6 5M-4 5L6-5','#d5c191',2),
      p('M-23-10H-17V-3H-23ZM-23 7H-17V14H-23Z','#bd9b6a','#455866'),ellipse(13,10,1.8,2.4,'#263c4a',gold,.7),
      lines('M-19 21H21M-13-11H12','#cad9d2',.7),...[-19,19].map(x=>ellipse(x,21,2,2,'#ac8d65','#eadbb4',.7)),
      p('M-25 12L-20 14L-22 22L-25 21ZM17-22L22-20L21-16L16-18Z','#9b7354','none')];
  } else if (/hourglass/.test(n)) {
    a = [p('M-13-18H13C13-7 5-6 3 0C5 6 13 7 13 18H-13C-13 7-5 6-3 0C-5-6-13-7-13-18Z', '#86cfe04d', '#b9e7f4'),
      p('M-11-13H11L2-2H-2ZM-11 16L-2 6H2L11 16Z', '#d7b9ff', '#aa79dd', 1),
      lines('M0-1V4M-18-19V19M18-19V19', gold, 2.5),
      p('M-22-24H22V-19H-22ZM-22 19H22V24H-22Z', gold),
      lines('M-17-22H17M-17 22H17', light, 1), ellipse(0, 1, 2, 2, '#fff0e8', 'none')];
  } else if (/keystone|diamond|memory shard|prism/.test(n)) {
    a = /shard/.test(n) ? [p('M-4-28L13-11L5 25L-9 18L-15-1Z',c,gold,2),lines('M-4-28L0-7L5 25M0-7L13-11M0-7L-9 18',g)] :
      [p('M-13-18H13L26-3L0 26L-26-3Z',c,gold,2),lines('M-13-18L-8-3L0 26L8-3L13-18M-26-3H26',g,1.5)];
    if (/prism/.test(n)) a.push(lines('M-23-18L-30-23M0-23V-30M23-18L30-23M25 11L30 16',gold,2));
  } else if (/lantern opal/.test(n)) {
    a=[lines('M-9-23Q0-35 9-23',gold,2),p('M-16-21H16L21-16H-21ZM-18-16H18V18H-18ZM-21 18H21L16 24H-16Z','#24364d',gold,2),...gem(0,1,14,c),lines('M-11-15V18M11-15V18',gold,1.5)];
  } else if (/swamp relic/.test(n)) {
    a=[p('M-12-24H12V-15L21-5L16 20L0 25L-16 20L-21-5L-12-15Z','#718f75',gold,2),p('M-14-3L-5-7L-6 1H-12ZM5-7L14-3L12 1H6Z','#253e3e'),lines('M0-8L-3 8H3M-9 14Q0 10 9 14M-13-18H13',gold,1.5)];
  } else if (/roots/.test(n)) {
    a=[p('M-6-27H8L5-7L14 3L20 23L10 24L6 8L-1 2L-5 12L-6 26L-15 26L-15 10L-9-3Z','#92735e',gold),lines('M-1-23L-3-3L-10 13M1-2L13 16M-7 8L-21 16L-24 26M12 11L24 14L28 23','#bf9b73',2)];
  } else if (/moss/.test(n)) {
    a=[p('M-26 16L-20-3L-7-12L11-10L25 8L18 23H-17Z','#4a5b66','#889784'),p('M-24 9L-19-5L-10-1L-5-16L4-8L13-14L18-2L25 4L19 13L8 10L0 19L-8 12L-18 17Z','#56d799','#a1f3c5'),...[-13,-4,7,17].map((x,i)=>ellipse(x,i%2?2:7,2,2,'#d0ffd1','none'))];
  } else if (/music box/.test(n)) {
    a = [p('M-20-4L15-4L21 3V18H-20Z', '#338e91'), p('M-20-4V-20L15-17V-4Z', '#8ee5cc'),
      p('M-16-15Q-1-23 11-12Q-1-3-16-15Z', '#dbb5dc', gold), lines('M-16 3H16M-16 14H17M20 9H25V14', gold, 2),
      ellipse(-1, -12, 4, 4, '#fff4d6'), p('M-2-5H2V8H-2Z', gold), ellipse(-2, 10, 4, 2, gold)];
  } else if (/comb/.test(n)) {
    a = [p('M-22-7Q0-22 22-7V-1H-22Z', '#f6dcc1', gold), ...Array.from({length:9}, (_,i) => p(`M${-20+i*5}-1v19h2v-19Z`, '#f9e6d0', '#b89477', .7)),
      ...[-12,0,12].map(x => ellipse(x, -8-(x===0?3:0), 3, 3, '#fff7ef'))];
  } else if (/signet/.test(n)) {
    // Three-quarter sculpted Imperial Signet ring: tapered solid gold shank with recessed bore, fluted shoulders, & emerald crown seal
    a = [
      p('M-13 -4C-20 4 -17 20 0 22C17 20 20 4 13 -4L9 0C14 6 12 16 0 17C-12 16 -14 6 -9 0Z', gold, ink, 1.4),
      p('M-11 8C-9 17 9 17 11 8C7 13 -7 13 -11 8Z', '#8a5d1c', 'none'),
      lines('M-14 6Q-11 19 0 20Q11 19 14 6', light, 1.1),
      p('M-16 -9L-9 -19L9 -19L16 -9L12 1L-12 1Z', gold, ink, 1.5),
      p('M-12 -9L-7 -16L7 -16L12 -9L8 -2L-8 -2Z', '#0f766e', '#fde047', 1.2),
      p('M-6 -6L-5 -12L-2 -9L0 -14L2 -9L5 -12L6 -6Z', gold, ink, 0.8),
      lines('M-9 -13L-4 -14', light, 1.0),
    ];
  } else if (/cameo/.test(n)) {
    a = [lines('M-8-19Q0-28 8-19', gold, 2),
      ellipse(0, -3, 17, 19, gold), ellipse(0, -3, 13, 15, '#e994ac'),
      p('M-4-13Q6-17 8-8L12-3L7-1V4L2 6L4 11H-10Q-12 4-4 3Z', '#ffe3cf', 'none'), lines('M-9 11H9', light, 1)];
  } else if (/crown|diadem|tiara/.test(n)) {
    const high = /quantum/.test(n) ? -23 : -19;
    a = [p(`M-23 9L-20-12L-10-3L0 ${high}L10-3L20-12L23 9L19 18H-19Z`, c, gold, 2), p('M-20 9H20L18 15H-18Z', gold),
      ...gem(0,-3,6,g), ...[-19,19].map(x => ellipse(x,-11,2.8,2.8,g)), lines('M-14 11H-8M8 11H14', light)];
    if (/sun/.test(n)) a.push(lines('M0-25V-29M-9-21L-14-25M9-21L14-25', gold, 2));
    if (/cloud/.test(n)) a.push(p('M-13 5Q-21-2-12-5Q-9-14-3-6Q5-10 6-2Q16-5 16 5Z', '#ecf7fd', gold, 1));
    if (/quantum/.test(n)) a.push(ellipse(0, 0, 28, 9, 'none', '#b69aff', 1));
  } else if (/hour|compass|orrery|sun disk|cog/.test(n)) {
    if (/cog/.test(n)) {
      a = [p('M-7-23H7L8-17L14-14L20-17L26-7L20-3V3L26 7L20 17L14 14L8 17L7 23H-7L-8 17L-14 14L-20 17L-26 7L-20 3V-3L-26-7L-20-17L-14-14L-8-17Z', '#b78a63', gold), ellipse(0,0,11,11,'#102936',gold), ellipse(0,0,4,4,gold)];
    } else if (/orrery/.test(n)) {
      a = [lines('M0 8V20M-14 22H14',gold,3), ellipse(0,-4,25,10,'none',gold), ellipse(0,-4,10,22,'none','#bad3e5'), ellipse(0,-4,7,7,'#d6e3fa'), ellipse(22,-8,4,4,c), ellipse(-5,-25,3,3,g)];
    } else {
      a = [ellipse(0,0,22,22,c,gold,2), ellipse(0,0,16,16,'#123744',gold),
        /sun disk/.test(n) ? p('M0-14L4-6L12-9L8-1L15 4L6 7L5 16L0 10L-6 16L-6 7L-15 3L-8-1L-12-9L-4-6Z',gold) : p('M0-18L6 5L0 1L-6 5ZM0 17L-4 3L0 5L4 3Z', '#efcdb8',gold), lines('M-18 0H-13M13 0H18M0-18V-13M0 13V18',light)];
    }
  } else if (/harp/.test(n)) {
    a = [p('M-20-21Q-2-12 18-20L11 21H-17L-20-21Z', '#b7e6e8', gold, 3),
      ...[-12,-6,0,6,12].map((x,i)=>lines(`M${x} ${-16-i*.4}L${x-2} 17`, '#d6c3f1', 1)), p('M-20 18H13V23H-20Z',gold)];
  } else if (/\bkey\b|scepter|staff/.test(n)) {
    if (/obsidian scepter/.test(n)) {
      a = [
        lines('M-16 23L8 -4', '#1c1917', 6),
        lines('M-16 23L8 -4', '#f97316', 1.4),
        p('M3 -5L0 -17L12 -27L24 -16L19 -3Z', '#18181b', '#facc15', 1.6),
        ...gem(12, -14, 6, '#f97316'),
        lines('M4 -17L1 -25M12 -27L12 -32M21 -18L28 -22', '#fde047', 1.8),
      ];
    } else {
      a = [lines('M-14 22L10-5',gold,5), /key/.test(n)?ellipse(14,-12,9,9,'none',gold,4):p('M5-6L1-16L13-25L24-15L21-5Z', '#293444', gold),
        ...gem(13,-13,5,c), /\bkey\b/.test(n) ? lines('M-8 13L0 19M-12 18L-5 24',gold,4) : lines('M3-22L3-28M20-23L26-25M24-8L29-7M-15 23L-11 26',gold,2)];
    }
  } else if (/spool/.test(n)) {
    a = [p('M-13-15H13V15H-13Z','#d6e3ff',gold), ellipse(0,-16,21,6,gold), ellipse(0,16,21,6,gold),
      ...[-10,-5,0,5,10].map(y=>lines(`M-13 ${y}Q0 ${y+5} 13 ${y}`, '#b496e8',1.5)), lines('M13 7Q28 13 20 24L28 26', '#e3ccff',2)];
  } else if (/mask/.test(n)) {
    a = [p('M-20-20Q0-28 20-20L17 10L0 24L-17 10Z','#e8e1d5',gold), p('M-14-5L-4-8L-5-1H-12ZM4-8L14-5L12-1H5Z','#273541'),
      lines('M0-11L-3 7H3M-8 13Q0 9 8 13M-17-16L17-16','#a79c9d'), lines('M12-20L8-11L12 0L7 9','#7d787f',.9)];
  } else if (/feather/.test(n)) {
    a = [p('M-17 19Q-29-16 18-25Q30 5-9 16L-17 19Z','#d7f2f8',gold), lines('M-24 27L15-19','#ac88d9',2),
      ...[-9,-2,5,12].map((v,i)=>lines(`M${v-7} ${13-i*7}L${v-14} ${-1-i*6}M${v-7} ${13-i*7}L${v+7} ${7-i*6}`, '#71bbca',1))];
  } else if (/bottl|message/.test(n)) {
    a = [p('M-6-24H6V-12Q17-9 14 13Q13 22 0 22Q-13 22-14 13Q-17-9-6-12Z','#60bdaf88','#a4e9dd'), p('M-7-26H7V-20H-7Z','#a98055',gold),
      /coldfire/.test(n) ? p('M-7 13Q-14 1-2-4L0 4L8-5Q15 9 6 15Z','#9dd6ff','#c7bbfc') : p('M-6-6L7-4L5 16L-7 14Z','#fff0ce','#c8ae8d'),
      lines('M-8-9Q-11 0-9 10','#e3fff8',1.5)];
  } else if (/chalice|crucible/.test(n)) {
    a = [/crucible/.test(n) ? p('M-20-17H20L14 14L5 19H-5L-14 14Z','#635665',gold,2) : p('M-18-21H18Q19-2 4 3V16H14V21H-14V16H-4V3Q-19-2-18-21Z',c,gold,2),
      ellipse(0,-18,18,5,/molten/.test(n)?'#ffaf47':'#bde7e1',gold), lines('M-12-8Q0 1 12-8',g,2), ...gem(0,1,4,g)];
    if (/fungal/.test(n)) a.push(p('M-13-20Q-11-33-1-23Q10-34 15-20Z','#d9b8f9',gold));
  } else if (/sigil/.test(n)) {
    a = [p('M0-26L23-13V13L0 26L-23 13V-13Z','#241c3d','#ad94e8',2), ellipse(0,0,16,16,'none',c,2),
      p('M0-14L12 7H-12Z','#433163','#c9a7ff'), ellipse(0,0,4,4,'#110c22','#dec2ff'), lines('M-19-11L19 11M-19 11L19-11','#9079ca',.8)];
  } else if (/seed/.test(n)) {
    a = [ellipse(0,3,14,21,'#252746','#b9a0f2',2), p('M0 19Q-12 4 3-12Q15-1 0 19Z','#a6b8f5','#e5d5ff'), lines('M-25 6Q0-18 25-6Q0 18-25 6Z','#b693e8',1.5), ellipse(0,2,3,3,'#fff9da','none')];
  } else if (/heart/.test(n)) {
    a = [p('M0 23C-5 16-27 3-22-13C-18-25-4-23 0-13C4-23 18-25 22-13C27 3 5 16 0 23Z',c,gold,2),
      lines('M0 17L-4 3L4-3L0-13M-4 3L-15-5M4-3L14-10',g,1.6)];
    if (/caldera/.test(n)) a.push(lines('M-18 2L-10 4L-8 12M11 8L15-2L19-5','#ffb34a',2));
  } else if (/coral fan|glow coral/.test(n)) {
    a = [p('M-4 25H4L7 17H-7Z','#c5bfa8'), lines('M0 20V-5M0 8L-17-4L-23-17M-17-4L-16-21M0 2L16-8L21-23M16-8L25-10M0-5L-6-21M0-5L8-24',c,4),
      lines('M0 18V-5M-16-4L-22-16M16-8L21-21',g,1)];
  } else if (/fern|kelp|moss|roots/.test(n)) {
    a = [lines('M0 24Q-10 5 6-25', '#9b9274',3)];
    for(let i=0;i<5;i++) { const y=15-i*8; a.push(p(`M0 ${y}Q-23 ${y-8} -16 ${y-16}Q-3 ${y-12} 0 ${y}M0 ${y}Q22 ${y-6} 17 ${y-14}Q5 ${y-13} 0 ${y}`,c,g,1)); }
  } else if (/sponge/.test(n)) {
    a = [p('M-20 18L-17-14Q-11-25-5-11L-3 4L0-19Q7-29 12-17L14-1Q27-13 25 1L18 22Z','#aabfb2',gold),
      ...[[-11,-9],[6,-15],[19,2],[-9,7],[6,10]].map(([x,y])=>ellipse(x,y,3,4,'#445c5d',g,1))];
  } else if (/trilobite/.test(n)) {
    a = [ellipse(0,0,17,24,'#afa99c',gold), p('M-12-13Q0-27 12-13L17-6H-17Z',c), lines('M0-14V21','#63666a',2),
      ...[-6,0,6,12,18].map(y=>lines(`M-13 ${y}Q0 ${y+4} 13 ${y}`, '#666268',1.4)), ellipse(-7,-14,2,2,g),ellipse(7,-14,2,2,g)];
  } else if (/nautilus|ammonite|turtle|crab|shell/.test(n)) {
    a = [ellipse(0,0,23,22,c,gold,2)];
    if (/turtle/.test(n)) a.push(p('M-8-13H8L15 0L8 14H-8L-15 0Z','#b9b4a4'),lines('M-8-13L-16-17M8-13L16-17M15 0H23M-15 0H-23M8 14L14 19M-8 14L-14 19',gold));
    else if (/crab/.test(n)) a.push(p('M-21 8Q0-29 21 8L13 3Q0-9-13 3Z','#d9c7a8'), lines('M0 8V28M-16 6L-21 16M16 6L21 16',gold,2));
    else if (/shell/.test(n) && !/ammonite/.test(n)) a.push(...[-16,-8,0,8,16].map(x=>lines(`M0 18L${x}-15`,g,1.8)),ellipse(2,6,8,8,'#fff3ed'));
    else a.push(p('M16 6C23-15-2-25-14-8C-25 12 5 23 12 6C18-6-1-14-6-4C-11 6 6 10 5 1Q3-4 0 0','none',g,3));
  } else if (/tooth|jaw/.test(n)) {
    a = [p('M-22-17Q0-27 22-17L18-8L0 24L-18-8Z','#efe3c9','#9f988d',2),p('M-22-17Q0-27 22-17L18-8Q0-16-18-8Z','#a7a09b'),lines('M0-12L-3 15','#fff8df',2)];
    if (/jaw/.test(n)) a = [p('M-24-10Q-4 11 24-17L18 5Q0 27-24 5Z','#b6af9e',gold), ...Array.from({length:7},(_,i)=>p(`M${-20+i*6} ${-3-Math.abs(i-3)*2}l3-10l3 10Z`,'#f4e8ce'))];
  } else if (/skull/.test(n)) {
    a = [p('M-23-6Q-20-24 1-22L17-15L25-1L19 12L4 20L-5 11L-23 7Z','#d6cdb5',gold),ellipse(-8,-5,7,8,'#343848'),ellipse(10,-7,6,6,'#343848'),p('M0 1L-4 8H4Z','#343848'), lines('M0 18L3 10M7 16L9 8M14 12L16 5','#88837b',2)];
  } else if (/egg/.test(n)) {
    a = [p('M0-26C21-16 27 19 8 24H-8C-27 19-21-16 0-26Z','#62565c',gold),lines('M-3-20L4-10L-2 0L6 9L2 23M-2 0L-14 4M4-10L15-8','#f1a45e',2)];
  } else if (/skeleton|cartilage|spine|vertebra|impression/.test(n)) {
    a = [lines('M-23 2Q-8-5 4 0L23-4','#cfcbba',4), ...[-15,-7,1,9,17].map(x=>lines(`M${x} 0q-4-13 3-18M${x} 0q-4 13 3 18`, '#b8b3a7',2.8)), ellipse(-21,2,6,8,c,gold)];
    if (/ray/.test(n)) a.push(lines('M-20 2L-7-23L8 0L-7 24Z','#e2d8b8',1.5));
    if (/vertebra/.test(n)) a=[p('M-7-10L-5-26H5L7-10L19-17L25-10L13 0L24 10L19 17L7 10L5 26H-5L-7 10L-19 17L-25 10L-13 0L-25-10L-19-17Z','#c3bcaa',gold),ellipse(0,0,11,12,'#9c9d93','#eee1c5'),ellipse(0,0,5,6,'#304654','#e0cda7')];
  } else if (/unborn star/.test(n)) {
    a = [ellipse(0,0,24,24,'#554c65',gold),p('M0-20L6-6L21-5L10 5L13 20L0 12L-13 20L-10 5L-21-5L-6-6Z','#b5a4cf','#e8d1ff',2),lines('M-8-11L-3 0L-8 7M8-11L3 0L8 7','#766487')];
  } else if (/pearl/.test(n)) {
    a = [ellipse(0,0,21,21,/black/.test(n)?'#333b61':c,gold,2),ellipse(-6,-7,9,7,'#f0eef380','none'),ellipse(-8,-9,4,3,'#fff7f0','none')];
    if (/storm/.test(n)) a.push(p('M5-16L-7 2H1L-6 18L13-5H4Z','#f7e9ab','none'));
    if (/neon/.test(n)) a.push(ellipse(0,0,26,9,'none','#b5ffda',1.5));
  } else if (/anchor/.test(n)) {
    a = [ellipse(0,-20,6,6,'none',gold,4), lines('M0-14V22M-13-8H13M-23 3Q-20 23 0 22Q20 23 23 3', '#9daab4',5), p('M-25 0L-25 11L-14 5ZM25 0L25 11L14 5Z',gold)];
  } else if (/\bcan\b/.test(n)) {
    a = [p('M-16-16H16V17Q0 26-16 17Z','#958b7b',gold),ellipse(0,-16,16,5,'#53676c',gold),lines('M-11-8L-8-1L-12 6M9 3L5 9L9 16','#b47850',3),ellipse(3,-17,5,2,'#172e3b')];
  } else if (/wood|branch/.test(n)) {
    a = [p('M-26 9L-19-1L-8-4L-5-20L2-23L3-5L20-12L27-6L6 5L-10 13L-23 16Z','#a7815a',gold),lines('M-21 11L-9 7L-1-1L-2-16M5 0L19-6','#6d513d',1.3)];
  } else if (/coin bag/.test(n)) {
    a = [p('M-9-15L-14-24H14L9-15Q27 1 18 18Q0 29-18 18Q-27 1-9-15Z','#a78560',gold),lines('M-11-13H11',light,3),ellipse(0,5,9,10,gold),lines('M0-1V12M4 1H-3V5H3V9H-4','#956c3d',1.8)];
  } else if (/vent/.test(n)) {
    a = [p('M-23 22L-14 1L-11-17L5-23L15-10L17 9L25 22Z','#686d73',gold),ellipse(0,-17,11,5,'#162e3a','#a0cfcb'),lines('M-4-23Q-14-30-3-31M6-24Q16-29 8-32','#b3e9e1',2)];
  } else {
    // Mineral families retain their geology instead of masquerading as a chest.
    a = [p('M-25 15L-22-5L-9-22L11-23L24-7L25 13L9 24H-11Z',/obsidian/.test(n)?'#312e43':'#73657a',gold), ...gem(-7,-1,14,c), ...gem(10,5,11,g), lines('M-16 16L-7 9M11-14L18-8',light,1)];
    if (/obsidian rock/.test(n)) a=[p('M-24 18L-21-3L-6-24L8-15L15-23L25 4L19 21Z','#252a40','#8794b2'),p('M-6-24L-3 4L-24 18M-3 4L19 21L8-15M-3 4L25 4','none','#56617e',2),lines('M-17-1L-10-10M15-12L21 3','#c9c1de',1.5)];
    if (/amber/.test(n)) a = [p('M-17-21L9-24L24-7L17 20L-8 24L-23 6Z','#e9b14f',gold),p('M-8-5L7 6M-5 4L4-9M-2 1L-10 8M0 2L9-4','none','#795b34',2),lines('M-15-14L-17-2','#fff3bf',3)];
    if (/tear/.test(n)) a = [p('M0-27C-2-15-25 4-18 17C-10 30 16 27 20 11C23 1 5-15 0-27Z',c,gold,2),lines('M-5-9Q-19 12-7 18',light,2)];
    if (/lantern opal/.test(n)) a.push(lines('M-10-23Q0-34 10-23M-14 17H14',gold,2));
  }
  // Engraving, hardware and glass highlights belong to the artifact itself.
  if (/cameo/.test(n)) a.push(ellipse(0,-3,15,17,'none','#fff0c2',.55), ...[-11,0,11].map(x=>ellipse(x,12-Math.abs(x)*.1,1,1,'#f9e3a7','none')),
    lines('M-9-17Q-18-9-10 0M9-17Q18-9 10 0','#b2676a',.7));
  if (/music box/.test(n)) a.push(p('M-17 2L14 2L18 7L-17 7Z','#c4cbd0',gold,.7), ...[-11,-6,-1,4,9].map(x=>lines(`M${x} 3v3`,'#5d7481',.7)),
    ellipse(9,12,3,3,'#e6bc78'), lines('M-17-14Q-7-22 8-16M-17 12V17H-10','#e3cfab',.7));
  if (/comb/.test(n)) a.push(lines('M-20-6Q0-18 20-6M-18-3Q0-12 18-3','#c89b67',.7), ...[-15,-5,5,15].map(x=>ellipse(x,-6-Math.cos(x/18)*3,1.2,1.4,'#fff6dc','#a98465',.5)));
  if (/hourglass/.test(n)) a.push(p('M-10-16L-6-16Q-8-9-3-5L-4-2Q-12-9-10-16Z','#e5f8ff88','none'), lines('M-10 15Q0 10 10 15','#f6e4bd',.7), ...[-18,18].flatMap(x=>[ellipse(x,-19,2,2,gold),ellipse(x,19,2,2,gold)]));
  if (/amber/.test(n)) a.push(p('M-17-17L-3-21L-12-6L-20 1Z','#fff1b755','none'), ellipse(10,9,3,4,'#f4d27366','#fff0bb88',.7), ellipse(-8,12,1.3,2,'#f5de9c88','none'));
  if (/crown|diadem|tiara/.test(n)) a.push(...[-13,13].map(x=>ellipse(x,5,2.5,3,'#7cded2','#fff0bd',.7)),lines('M-17 15H17M-9 11H-3M3 11H9','#947744',.7));
  if (/fossil coral fan/.test(n)) {
    a.unshift(p('M-29 12L-27-17L-9-28L17-25L29-4L24 24L-4 29L-24 23Z','#a9a58b','#7b8577',1.5));
    for(const s of a.slice(1)){if(s.stroke===c){s.stroke='#e9dfba';s.width=3;}if(s.stroke===g)s.stroke='#8c917b';}
    a.push(lines('M-25-11L-18-7M17-19L13-13M19 16L14 21M-16 19L-12 23','#6e7e72',.8));
  }
  return a;
}

function artwork(item) {
  const config = catalog.get(artworkId(item));
  if (!config) return null;
  if (!drawings.has(config.id)) drawings.set(config.id, design(config));
  return drawings.get(config.id);
}

export function treasureSvg(item) {
  const id = artworkId(item);
  const art = artwork(item);
  if (!art) return null;
  if (!svgCache.has(id)) {
    const colors=[...new Set(art.map(s=>s.fill).filter(color=>/^#[\da-f]{6}$/i.test(color)))];
    const defs=colors.map(color=>`<linearGradient id="${id}-${color.slice(1)}" x1="-18" y1="-25" x2="16" y2="28" gradientUnits="userSpaceOnUse"><stop stop-color="${tone(color,1.18,18)}"/><stop offset=".42" stop-color="${color}"/><stop offset="1" stop-color="${tone(color,.55)}"/></linearGradient>`).join('');
    svgCache.set(id, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-34 -34 68 68" width="64" height="64" data-treasure="${id}" aria-hidden="true"><defs>${defs}</defs><g stroke-linecap="round" stroke-linejoin="round">${art.map(s => `<path d="${s.d}" fill="${colors.includes(s.fill)?`url(#${id}-${s.fill.slice(1)})`:s.fill}" stroke="${s.stroke}" stroke-width="${s.width}" opacity="${s.opacity}"/>`).join('')}</g></svg>`);
  }
  return svgCache.get(id);
}

function tone(color,factor,add=0){return '#'+color.slice(1).match(/../g).map(channel=>Math.min(255,Math.round(parseInt(channel,16)*factor+add)).toString(16).padStart(2,'0')).join('');}

export function drawTreasureArtwork(ctx, item, scale = 1) {
  const id = artworkId(item);
  const art = artwork(item);
  if (!art || typeof Path2D === 'undefined') return false;
  // Rasterize once at double resolution. World rendering is then one cheap blit,
  // rather than rebuilding material gradients and dozens of paths each frame.
  if (!sprites.has(id)) {
    const canvas = document.createElement('canvas'); canvas.width=136;canvas.height=136;
    const paint=canvas.getContext('2d');paint.scale(2,2);paint.translate(34,34);paint.lineCap='round';paint.lineJoin='round';
    const materials=new Map();
    for(const shape of art){
      if(!paths.has(shape))paths.set(shape,new Path2D(shape.d));
      let fill=shape.fill;
      if(/^#[\da-f]{6}$/i.test(fill)){
        if(!materials.has(fill)){const material=paint.createLinearGradient(-18,-25,16,28);material.addColorStop(0,tone(fill,1.18,18));material.addColorStop(.42,fill);material.addColorStop(1,tone(fill,.55));materials.set(fill,material);}
        fill=materials.get(fill);
      }
      paint.fillStyle=fill;paint.strokeStyle=shape.stroke;paint.lineWidth=shape.width;paint.globalAlpha=shape.opacity;
      if(shape.fill!=='none')paint.fill(paths.get(shape));
      if(shape.stroke!=='none')paint.stroke(paths.get(shape));
    }
    sprites.set(id,canvas);
  }
  ctx.drawImage(sprites.get(id),-34*scale,-34*scale,68*scale,68*scale);
  return true;
}

// DriftMessages.js — Driftwood Bobbers & Handwritten Message-in-a-Bottle Poems

export const DRIFT_MESSAGES = [
  {
    id: 'haiku_lantern_tide',
    title: 'Silver Lanterns on the Swell',
    author: 'Anonymous Deckhand, Harbor III',
    type: 'haiku',
    lines: [
      'Salt mist on the oar,',
      'Lantern light wakes sleeping tides,',
      'Gold scales pierce the dark.',
    ],
  },
  {
    id: 'haiku_deep_hook',
    title: 'Thread Into the Blue',
    author: 'The Bell-Ringer of Pier 9',
    type: 'haiku',
    lines: [
      'Thin thread sinks through glass,',
      'Quiet giants circle close,',
      'Wait for one sharp tug.',
    ],
  },
  {
    id: 'haiku_star_compass',
    title: 'Starlight Bearing',
    author: 'Navigator Linnea, 1984',
    type: 'haiku',
    lines: [
      'North star in the swell,',
      'Wooden hull rocks soft and slow,',
      'Home waits past the fog.',
    ],
  },
  {
    id: 'haiku_trench_ember',
    title: 'Embers Beneath Ice',
    author: 'Bathysphere Log #14',
    type: 'haiku',
    lines: [
      'Cold black water sleeps,',
      'Red vents bloom like sunken stars,',
      'Strange fins brush the bow.',
    ],
  },
  {
    id: 'haiku_dawn_net',
    title: 'First Amber Catch',
    author: 'Old Salt Barnaby',
    type: 'haiku',
    lines: [
      'Dawn spills honey gold,',
      'Pelican wakes on the prow,',
      'Sea bream leap like sparks.',
    ],
  },
  {
    id: 'haiku_moon_jelly',
    title: 'Drifting Bell',
    author: 'Midnight Watch, Schooner Iris',
    type: 'haiku',
    lines: [
      'Pale moon wears a crown,',
      'Glass-winged jellies climb the dark,',
      'Ghosts that learned to glow.',
    ],
  },
  {
    id: 'poem_sunken_bell',
    title: 'The Sunken Harbor Bell',
    author: 'Found Sealed in Green Sea-Glass',
    type: 'poem',
    lines: [
      'A thousand bells are cast for noise,',
      'To summon fleets and count the hour,',
      'Yet the one bell that keeps its poise',
      'Lies silenced in an emerald bower.',
      'Not rusted out of usefulness,',
      'Just finished with the frantic shore—',
      'It rings without a sound to bless',
      'Whatever passes by its door.',
    ],
  },
  {
    id: 'poem_starlight_mariner',
    title: 'What the Horizon Refuses',
    author: 'First Mate K. Sato',
    type: 'poem',
    lines: [
      'We sail to close a distance',
      'That moves ahead of every bow;',
      'The sea teaches persistence',
      'Is only learning to allow',
      'The deep to stay a question,',
      'The star to remain out of reach—',
      'Some truths belong to ocean,',
      'And break if hauled upon the beach.',
    ],
  },
  {
    id: 'poem_cats_watch',
    title: 'Letter to Nobody in Particular',
    author: 'Scribbled in Charcoal on Sailcloth',
    type: 'poem',
    lines: [
      'If you have fished until the dark',
      'Turned every ripple into glass,',
      'And wondered if your fleeting mark',
      'Outlasts the silver shoals that pass:',
      'Take comfort from the lantern’s wick—',
      'It burns no taller than a thumb,',
      'Yet whole constellations pick',
      'Its tiny harbor to become.',
    ],
  },
  {
    id: 'lore_atlantis_gate',
    title: 'Torn Logbook of the Meridian',
    author: 'Cartographer Helena Vance',
    type: 'lore',
    lines: [
      'Day 44 — Our depth sounder struck flat stone four hundred fathoms down.',
      'The marble columns were still draped in living emerald ribbons,',
      'and golden coins settled unbroken along the threshold Steps.',
      'Wait for the slack tide at dusk; the current itself whispers where to cast.',
    ],
  },
  {
    id: 'lore_midnight_jelly',
    title: 'Glass Vial Note',
    author: 'Dr. Aris Thorne, Pelagic Survey',
    type: 'lore',
    lines: [
      'Three hundred fathoms below sunfall, darkness is never truly dark.',
      'Comb jellies pulse like falling constellations beside the cable.',
      'Hold steady when the abyss gleams cyan—something rare is investigating your lure.',
    ],
  },
  {
    id: 'lore_golden_carp',
    title: 'Tattered Lucky Charm',
    author: 'Harbor Elder Mei',
    type: 'lore',
    lines: [
      'My grandmother swore a coin-bright koi sleeps beneath the jade steps,',
      'shimmering only for captains patient enough to mend their own line.',
      'Keep your cat well-petted and your lantern trimmed before deep dives.',
    ],
  },
  {
    id: 'secret_freq_777',
    title: 'Waterlogged Brass Radio Scrap',
    author: 'Broadcast Phantom · Dead Channel',
    type: 'lore',
    unlocksFrequency: '7.77',
    lines: [
      'Scrawled hastily in fading blue grease-pencil along the cork margin:',
      '"When the midnight ocean goes dead silent, tune your brass dial past Station 9...',
      'Dial in frequency 7.77 MHz to hear what sings beneath the trench floor."',
    ],
  },
];

export const DRIFTWOOD_BOBBERS = [
  { id: 'driftwood_float', name: 'Carved Oak Driftwood Bobber', color: '#a16207', accent: '#fef08a', description: 'Hand-whittled from bleached driftwood with a brass swivel.' },
  { id: 'sea_glass_bobber', name: 'Teal Sea Glass Sphere', color: '#0d9488', accent: '#99f6e4', description: 'Smooth emerald bottle glass tumbled smooth for a century.' },
  { id: 'barnacle_cork', name: 'Barnacle-Crusted Bottle Cork', color: '#78350f', accent: '#cbd5e1', description: 'Bound in braided tarred hemp that rides even heavy chop.' },
  { id: 'lantern_bobber', name: 'Brass Beacon Bobber', color: '#d97706', accent: '#fde047', description: 'Warm amber oil lamp float visible even in squalls.' },
];

// The same normalization is used for surface bottles, dredged bottles and old saves.
export function normalizeBottleMessage(message) {
  const input = typeof message === 'string' ? { text: message } : (message || {});
  const canonical = DRIFT_MESSAGES.find(entry => entry.id === input.id);
  const merged = { ...canonical, ...input };
  const rawLines = Array.isArray(merged.lines) && merged.lines.length ? merged.lines :
    merged.text ? String(merged.text).split('\n') : (canonical?.lines || []);
  const lines = rawLines.filter(line => typeof line === 'string')
    .flatMap(line => line.replace(/\\r\\n|\\n|\r\n?/g, '\n').split('\n')).map(line => line.trim()).filter(Boolean);
  if (!lines.length) return normalizeBottleMessage(DRIFT_MESSAGES.find(entry => entry.type === 'poem'));
  return { ...merged, title: merged.title || 'A Letter from the Sea', type: merged.type || 'poem', lines, text: lines.join('\n') };
}

const POEM_ADDITIONS = [
  ['poem_mended_sail', 'On Mending What Storms Leave', 'A Sailmaker of the Eastern Pier', [
    'Every voyage breaks something clean,',
    'And every return stitches it back,',
    'Yet the seam outlives what might have been',
    'Before the hull took on its crack.',
    'Time does not restore the uncut thread;',
    'It binds the tear with salt and art,',
    'And carries forward, scarred yet wed',
    'To oceans larger than the heart.',
  ]],
  ['poem_glass_gardens', 'Gardens Without Sun', 'Nell, Between Survey Stations', [
    'Far down where daylight never learns to bend,',
    'We think the world grows barren, mute, and blind;',
    'Yet blind corals build cathedrals without end',
    'Of calcium, darkness, and unhurried time.',
    'Not everything that blooms requires our gaze;',
    'Most beauty ripens where no lantern swings—',
    'Patient as bedrock through the silent days,',
    'Content to keep its own forgotten wings.',
  ]],
  ['poem_second_cup', 'An Elegy for Brief Harbors', 'Mara of the Dockside Kitchen', [
    'We measure lives by anchors dropped in haste,',
    'By trophies weighed and longitudes attained,',
    'Yet what outlasts the tide is rarely chased:',
    'A warm cup poured before the lantern waned.',
    'The ocean takes the brass, the boast, the fleet,',
    'And leaves behind the quiet grace of bread—',
    'Two quiet shadows where the lamplights meet,',
    'Remembering the living and the dead.',
  ]],
  ['poem_clockless_whale', 'The Whale Without a Clock', 'Recovered Beyond the Seventh Sea', [
    'Before we carved the sea into degrees,',
    'A leviathan swam across the nameless deep;',
    'It bore no calendar inside its seas,',
    'Nor owed an hour to promises to keep.',
    'We ask the water what its depth may mean,',
    'As though a riddle waited for a key;',
    'It answers only with the space between',
    'The line we cast and all we fail to see.',
  ]],
  ['poem_small_catch', 'What We Release', 'An Angler at the Last Mooring', [
    'Today I drew a creature from the blue',
    'Whose silver scales held twilight in their grain,',
    'And for one breathless second felt I knew',
    'Why everything we hold returns to pain.',
    'I unhooked gently what I could not own',
    'And watched it vanish into living glass—',
    'True wealth is knowing when to let alone',
    'The passing wonder we were meant to pass.',
  ]],
  ['poem_lantern_window', 'The Weight of Water', 'Jun of the Evening Watch', [
    'To drop a weight a thousand fathoms down',
    'Is just to ask the darkness who you are;',
    'No crown is heavy near an empty town,',
    'No map holds steady past the northern star.',
    'The line runs taut between two unknowns here:',
    'Our small brief hands above the wooden rail,',
    'And ancient currents turning year on year,',
    'Which neither grieve our passing nor prevail.',
  ]],
];
DRIFT_MESSAGES.push(...POEM_ADDITIONS.map(([id, title, author, lines]) => ({ id, title, author, lines, type: 'poem' })));
const bottlePools = Object.fromEntries(['poem', 'haiku', 'lore'].map(type => [type, DRIFT_MESSAGES.filter(message => message.type === type)]));

export function getRandomBottleMessage() {
  const roll = Math.random();
  const type = roll < .8 ? 'poem' : roll < .95 ? 'haiku' : 'lore';
  const fraction = type === 'poem' ? roll / .8 : type === 'haiku' ? (roll - .8) / .15 : (roll - .95) / .05;
  const pool = bottlePools[type];
  return normalizeBottleMessage(pool[Math.min(pool.length - 1, Math.floor(fraction * pool.length))]);
}

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
      'Where tall kelp sways like cathedral silk,',
      'An iron bell rests on silver silt;',
      'No hand has pulled its hemp-bound rope,',
      'Since clipper ships outran the cape.',
      'Yet when the midnight moon runs thin,',
      'Soft bronze tolls rise above the fin—',
      'Not calling sailors to the shore,',
      'But guiding wonders from the floor.',
    ],
  },
  {
    id: 'poem_starlight_mariner',
    title: 'Chart of the Seven Seas',
    author: 'First Mate K. Sato',
    type: 'poem',
    lines: [
      'First came the sun-warmed emerald bay,',
      'Then bioluminescent twilight blue;',
      'Beyond the broken marble arches lay',
      'The cloud-sea where the wind-whales flew.',
      'Lower we dropped past ember-smoking stone',
      'Till stars swam underneath our keel,',
      'And learned the ocean keeps its own',
      'Strange poetry beneath the wheel.',
    ],
  },
  {
    id: 'poem_cats_watch',
    title: "The Ship Cat's Vigil",
    author: 'Scribbled in Charcoal on Sailcloth',
    type: 'poem',
    lines: [
      'All hands are sleeping in the bunk,',
      'The harbor fog rolls thick and gray,',
      'A ginger cat sits on the trunk,',
      'And counts the minnows in the bay.',
      'She guards the twine, she guards the bell,',
      'She purrs when silver wakes the crest—',
      'Whoever sails with whiskers well',
      'Shall bring home treasures of the best.',
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
];

export const DRIFTWOOD_BOBBERS = [
  { id: 'driftwood_float', name: 'Carved Oak Driftwood Bobber', color: '#a16207', accent: '#fef08a', description: 'Hand-whittled from bleached driftwood with a brass swivel.' },
  { id: 'sea_glass_bobber', name: 'Teal Sea Glass Sphere', color: '#0d9488', accent: '#99f6e4', description: 'Smooth emerald bottle glass tumbled smooth for a century.' },
  { id: 'barnacle_cork', name: 'Barnacle-Crusted Bottle Cork', color: '#78350f', accent: '#cbd5e1', description: 'Bound in braided tarred hemp that rides even heavy chop.' },
  { id: 'lantern_bobber', name: 'Brass Beacon Bobber', color: '#d97706', accent: '#fde047', description: 'Warm amber oil lamp float visible even in squalls.' },
];

export function getRandomBottleMessage() {
  return DRIFT_MESSAGES[Math.floor(Math.random() * DRIFT_MESSAGES.length)];
}

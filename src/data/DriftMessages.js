// DriftMessages.js — Messages in bottles and driftwood bobbers found adrift

export const DRIFT_MESSAGES = [
  // Haikus
  {
    type: 'haiku',
    text: `Salt upon the deck,\nWhite gulls wheel against the sky,\nLine sinks in the blue.`,
  },
  {
    type: 'haiku',
    text: `Gentle rocking boat,\nLantern casts an amber ring,\nDeep beneath the swell.`,
  },
  {
    type: 'haiku',
    text: `Morning brings the fog,\nQuiet ripples greet the dawn,\nTime to cast once more.`,
  },
  {
    type: 'haiku',
    text: `Silver scales below,\nShadows passing in the deep,\nPatience is the reel.`,
  },
  {
    type: 'haiku',
    text: `Night ocean glows blue,\nTiny plankton dance like stars,\nSleep upon the sea.`,
  },
  {
    type: 'haiku',
    text: `Winds of seven seas,\nCarry home the weary boat,\nFull of ancient tales.`,
  },
  {
    type: 'haiku',
    text: `Rain falls on the hat,\nDroplets scatter on the pond,\nPeaceful quiet calm.`,
  },

  // Sea Legend Lore Hints
  {
    type: 'lore',
    hint: true,
    text: `Old Old Mossback:\n"At dawn twilight when thick sea fog hugs the surface, look closely for what appears to be a floating patch of green moss and coral."`,
  },
  {
    type: 'lore',
    hint: true,
    text: `The Abyssal Star-Weaver:\n"Only on clear, cloudless nights does the ribbon eel weave its constellation between depths of 240m and 550m."`,
  },
  {
    type: 'lore',
    hint: true,
    text: `The Aurora Sailfin:\n"When twilight paints the horizon neon cyan and green, the Sailfin leaps through the thermocline into the twilight current."`,
  },
  {
    type: 'lore',
    hint: true,
    text: `The Golden Coelacanth:\n"Near the abyssal magma rift trenches, dredging deep hooks into the volcanic silt can hook a living prehistoric armor of solid pyrite."`,
  },
  {
    type: 'lore',
    hint: true,
    text: `The Whispering Siren Ray:\n"On calm evenings at dusk, listen closely against the hull. The royal ray produces a harmonic hum that vibrates the ship's timbers."`,
  },
  {
    type: 'lore',
    hint: true,
    text: `The Clockwork Nautilus:\n"An automaton from a lost epoch. Its gears still click in steady tempo in the deep mid-waters around 300 meters."`,
  },
  {
    type: 'lore',
    hint: true,
    text: `The Eclipse Moon-Jelly:\n"When night sky mirrors the darkest cosmos, the celestial jellyfish ignites a corona of pure violet-gold light."`,
  },

  // Sailor's Notes
  {
    type: 'general',
    text: `"Day 42 at sea. The cat fell asleep on the radio console again. The weather is calm and the pelican caught a drifting sprig of cedar."`,
  },
  {
    type: 'general',
    text: `"To whoever finds this bottle: never rush your retrieve. When the rhythm wave swells, let the tension ease, then reel fast in the lull."`,
  },
  {
    type: 'general',
    text: `"Old salt proverb: A fisherman with a warm coat, a sleeping cat, and a cup of tea is richer than any king in the harbor."`,
  },
  {
    type: 'general',
    text: `"Found an ancient brass compass in the coral beds today. A little rubbing with salt and wool restored the brass to a golden mirror."`,
  },
  {
    type: 'general',
    text: `"Dolphins breached off the starboard bow at noon. Clear skies ahead. The Seven Seas welcome all who drift quietly."`,
  },
  {
    type: 'general',
    text: `"Seabed pots left soaking overnight always reward the patient angler. Don't forget to harvest your crab traps every few casts."`,
  },
  {
    type: 'general',
    text: `"They say the Grand Schooner's underwater floodlights can reveal the ancient shipwrecks resting in Sea 4."`,
  },
];

export const DRIFTWOOD_BOBBERS = [
  { id: 'pelican_bobber', name: 'Carved Pelican Bobber', icon: '🪶', bonus: 'Pleasant visual flair' },
  { id: 'lighthouse_bobber', name: 'Mini Lighthouse Bobber', icon: '🗼', bonus: 'Warm beacon light' },
  { id: 'pinecone_bobber', name: 'Cedar Pinecone Bobber', icon: '🌲', bonus: 'Natural cedar wood' },
  { id: 'nautilus_bobber', name: 'Nautilus Spiral Bobber', icon: '🐚', bonus: 'Ocean spiral carve' },
  { id: 'bobber_corsair_skull', name: 'Corsair Skull Bobber', icon: '☠️', bonus: 'Carved ivory with glowing ruby eyes' },
  { id: 'bobber_celestial_comet', name: 'Celestial Comet Bobber', icon: '☄️', bonus: 'Pulsing starlight tail' },
];

export function getRandomBottleMessage() {
  const roll = Math.floor(Math.random() * DRIFT_MESSAGES.length);
  return DRIFT_MESSAGES[roll] || DRIFT_MESSAGES[0];
}


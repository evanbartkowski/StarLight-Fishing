// PetsData.js — Vessel Companions and Deck Pets
// Found randomly by chance from spending time fishing across the Seven Seas

export const PET_DEFINITIONS = {
  cat: {
    id: 'cat',
    name: "Barnaby the Ship's Cat",
    species: 'Calico Shorthair',
    icon: '🐱',
    perk: 'Purrs when stroked on deck. At Dawn every morning, brings gifts of sea shells, glass, or coins.',
    lore: 'A quiet, curious calico that loves the salty ocean air and fresh fish. Stows away aboard boats that bring in bountiful catches.',
    unlockHint: 'Has a chance to climb aboard as you catch fish and haul bountiful catches.',
  },
  pelican: {
    id: 'pelican',
    name: 'Captain Pete the Pelican',
    species: 'Brown Coastal Pelican',
    icon: '🦤',
    perk: 'Perches on the bowsprit spar. Feed him fish to raise trust; occasionally dives into the surf for sunken gold.',
    lore: 'A wild, seafaring pelican with an eye for shiny things. He adopts lucky fishing vessels as his personal coastal sanctuary.',
    unlockHint: 'Has a chance to swoop down and claim your bowsprit as you explore coastal waters.',
  },
  dolphin: {
    id: 'dolphin',
    name: 'Echo the Bottlenose Dolphin',
    species: 'Bottlenose Dolphin',
    icon: '🐬',
    perk: 'Leaps and breaches through ocean waves during clear weather, bringing good luck and serenity.',
    lore: 'A spirited dolphin that loves accompanying friendly fishing boats, riding the bow waves across the open sea.',
    unlockHint: 'Has a chance to befriend your vessel after long voyages across the Seven Seas.',
  },
};

/**
 * Checks for a random chance to encounter an unowned vessel companion.
 * Called when completing a dive haul or after relaxing/spending time on the surface.
 */
export function checkRandomPetEncounter(save, particles, oceanWorld, uiManager, soundManager) {
  if (!save) return null;

  const unowned = Object.keys(PET_DEFINITIONS).filter((k) => !save.hasPet(k));
  if (unowned.length === 0) return null; // All companions already unlocked

  const totalDives = save.data?.stats?.totalCasts || 0;
  const totalFish = save.data?.stats?.totalFishCaught || 0;

  // Escalating random chance:
  // Starts at 8%, grows with dives and total fish caught so playing a lot ensures encounters
  const pityCount = save.data.petPityDives || 0;
  const baseChance = 0.08;
  const activityBoost = Math.min(0.20, (totalDives * 0.008) + (totalFish * 0.004));
  const pityBoost = pityCount * 0.025; // +2.5% per dive without pet

  const totalChance = Math.min(0.45, baseChance + activityBoost + pityBoost);

  if (Math.random() < totalChance) {
    // Randomly pick one of the remaining unowned pets
    const chosenId = unowned[Math.floor(Math.random() * unowned.length)];
    const pet = PET_DEFINITIONS[chosenId];

    save.unlockPet(chosenId);
    save.data.petPityDives = 0;
    save.save();

    if (soundManager) {
      soundManager.playTreasure();
      soundManager.playRareChime();
    }

    if (particles && oceanWorld) {
      particles.emitSparkles(oceanWorld.boat.x, oceanWorld.boat.y - 20, 35, '#fbbf24');
      particles.addFloatingText(
        `NEW COMPANION! ${pet.icon} ${pet.name}`,
        oceanWorld.boat.x,
        oceanWorld.boat.y - 45,
        '#38bdf8',
        18,
        '#fef08a'
      );
      particles.addTrauma(0.35);
    }

    if (uiManager) {
      uiManager.showToast(`🐾 A stray friend arrived! ${pet.icon} ${pet.name} has joined your vessel crew!`);
    }

    return chosenId;
  } else {
    save.data.petPityDives = pityCount + 1;
    save.save();
    return null;
  }
}

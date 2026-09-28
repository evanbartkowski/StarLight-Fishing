// PetsData.js — Vessel Companions and Deck Pets
// Found randomly by chance from spending time fishing across the Seven Seas

export const PET_DEFINITIONS = {
  shark: {
    id: 'shark', name: 'Irene the Shark', species: 'Friendly Reef Shark', icon: '??', reqLevel: 36,
    perk: 'Swims beside your boat, keeping you company on every voyage.',
    lore: 'A curious reef shark with a silver dorsal fin and a surprisingly gentle smile.',
    unlockHint: 'Irene joins your crew automatically at Angler Level 36.',
  },
  cat: {
    id: 'cat',
    name: 'Angela the Cat',
    species: 'Calico Shorthair',
    icon: '🐱',
    reqLevel: 8,
    perk: 'Purrs when stroked on deck. At Dawn every morning, brings gifts of sea shells, glass, or coins.',
    lore: 'A loving, quiet calico that enjoys ocean breezes and gentle pats. She climbs aboard seasoned captains boats at Angler Level 8+.',
    unlockHint: 'Has a random chance to climb aboard as you level up and explore deeper seas (Requires Level 8).',
  },
  pelican: {
    id: 'pelican',
    name: 'Evan the Bird',
    species: 'Coastal Seafarer Pelican',
    icon: '🦤',
    reqLevel: 14,
    perk: 'Perches on the bowsprit spar. Feed him fish to raise trust; occasionally dives into the surf for sunken gold.',
    lore: 'A loyal, wise coastal pelican who watches over the vessel bowsprit. Befriends skilled mariners at Angler Level 14+.',
    unlockHint: 'Has a random chance to swoop down and join your crew as you reach Angler Level 14+.',
  },
  dolphin: {
    id: 'dolphin',
    name: 'Echo the Bottlenose Dolphin',
    species: 'Bottlenose Dolphin',
    icon: '🐬',
    reqLevel: 22,
    perk: 'Leaps and breaches through ocean waves during clear weather, bringing good luck and serenity.',
    lore: 'A spirited dolphin that loves accompanying friendly fishing boats, riding the bow waves across the open sea.',
    unlockHint: 'Has a chance to befriend your vessel after long voyages across the Seven Seas (Requires Level 22).',
  },
};

/**
 * Checks for a random chance to encounter an unowned vessel companion.
 * Called when completing a dive haul or after relaxing/spending time on the surface.
 */
export function checkRandomPetEncounter(save, particles, oceanWorld, uiManager, soundManager) {
  if (!save) return null;

  const playerLvl = save.data?.level || 1;
  const unowned = Object.keys(PET_DEFINITIONS).filter((k) => {
    if (save.hasPet(k)) return false;
    const pet = PET_DEFINITIONS[k];
    return playerLvl >= (pet.reqLevel || 1);
  });
  if (unowned.length === 0) return null; // No companions currently eligible or all owned

  const totalDives = save.data?.stats?.totalCasts || 0;
  const totalFish = save.data?.stats?.totalFishCaught || 0;

  // Rare, rewarding random chance later on as you level up
  const pityCount = save.data.petPityDives || 0;
  const baseChance = 0.05;
  const activityBoost = Math.min(0.15, (totalDives * 0.005) + (totalFish * 0.002));
  const pityBoost = pityCount * 0.015;

  const totalChance = Math.min(0.35, baseChance + activityBoost + pityBoost);

  if (Math.random() < totalChance) {
    // Randomly pick one of the eligible unowned pets
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

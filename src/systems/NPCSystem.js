// NPCSystem.js — Atmospheric Rare NPC Encounters
// Wandering merchants, sirens, stargazers, ghost smugglers, and cartographers

export const NPC_DEFINITIONS = [
  {
    id: 'drifting_merchant',
    name: 'Barnaby the Drifting Merchant',
    title: 'Wandering Maritime Trader',
    avatar: '🧔‍♂️⛵',
    themeColor: '#f59e0b',
    greeting: 'Ahoy, fellow mariner! The trade winds were generous today. Care to inspect my rare seafaring curios?',
    options: [
      {
        id: 'buy_star_bait',
        label: 'Purchase Enchanted Star-Bait ($180)',
        desc: 'Infuses your line with starlight: +35% Rare fish catch chance for 4 minutes.',
        cost: 180,
        action: (saveSystem) => {
          if (saveSystem.spendCoins(180)) {
            saveSystem.addBuff('sirensGrace', 240000);
            return { success: true, message: '✨ Obtained Enchanted Star-Bait! (+35% Rare catch rate for 4m)' };
          }
          return { success: false, message: 'Not enough coins for Star-Bait!' };
        },
      },
      {
        id: 'buy_pearl_bobber',
        label: 'Buy Antique Pearl Bobber ($320)',
        desc: 'A lustrous abalone pearl float that glows softly on the surface waves.',
        cost: 320,
        action: (saveSystem) => {
          if (saveSystem.spendCoins(320)) {
            if (!saveSystem.data.unlockedBobbers.includes('pearl_bobber')) {
              saveSystem.data.unlockedBobbers.push('pearl_bobber');
              saveSystem.save();
            }
            return { success: true, message: '📿 Added Antique Pearl Bobber to your vessel wardrobe!' };
          }
          return { success: false, message: 'Not enough coins for Pearl Bobber!' };
        },
      },
      {
        id: 'sell_trinkets',
        label: 'Trade Beachcomber Drift Trinkets (+$150)',
        desc: 'Barnaby happily buys extra drift shells and scrap driftwood from your deck.',
        cost: 0,
        action: (saveSystem) => {
          saveSystem.addCoins(150);
          return { success: true, message: '🪙 Traded beachcomber scraps to Barnaby for +$150 coins!' };
        },
      },
    ],
  },
  {
    id: 'blind_siren',
    name: 'Lyra the Stargazer Siren',
    title: 'Whispering Oracle of the Tide',
    avatar: '🧜‍♀️✨',
    themeColor: '#38bdf8',
    greeting: 'The currents carry whispers of celestial tides. Open your heart to the songs of the deep...',
    options: [
      {
        id: 'siren_blessing',
        label: "Accept Siren's Grace Blessing (Free)",
        desc: 'Bestows +25% Rare & Mythic catch chance and calm ocean waters for 3 minutes.',
        cost: 0,
        action: (saveSystem) => {
          saveSystem.addBuff('sirensGrace', 180000);
          return { success: true, message: "🌊 Bestowed Siren's Grace! (+25% Rare catch rate for 3 minutes)" };
        },
      },
      {
        id: 'starlight_clarity',
        label: 'Seek Starlight Oracle Sight (Free)',
        desc: 'Unveils exact depth outlines and silhouettes of all submerged fish for 3 minutes.',
        cost: 0,
        action: (saveSystem) => {
          saveSystem.addBuff('starlightClarity', 180000);
          return { success: true, message: '🌟 Bestowed Starlight Oracle Sight! Submerged silhouettes revealed for 3m!' };
        },
      },
      {
        id: 'pearl_tribute',
        label: 'Offer Silver Coin Tribute ($100)',
        desc: 'Make a reverent gift to receive a grand windfall of +250 XP.',
        cost: 100,
        action: (saveSystem) => {
          if (saveSystem.spendCoins(100)) {
            saveSystem.addXp(250);
            return { success: true, message: '⭐ Lyra smiled upon your tribute: Received +250 Angler XP!' };
          }
          return { success: false, message: 'You lack $100 coins for the tribute.' };
        },
      },
    ],
  },
  {
    id: 'ghost_smuggler',
    name: 'Captain Vane the Ghost Smuggler',
    title: 'Spectral Corsair Phantom',
    avatar: '🏴‍☠️👻',
    themeColor: '#a855f7',
    greeting: 'Shiver me bones! Ye tread upon waters claimed by the Phantom Fleet. What say ye, mortal angler?',
    options: [
      {
        id: 'pay_toll',
        label: 'Pay Peaceful Toll ($75)',
        desc: 'Surrender a token fee to avoid confrontation and sail with safe spectral passage.',
        cost: 75,
        action: (saveSystem) => {
          if (saveSystem.spendCoins(75)) {
            saveSystem.addXp(90);
            return { success: true, message: '⚓ Paid the $75 toll. Captain Vane tipped his spectral tricorn hat (+90 XP).' };
          }
          return { success: false, message: 'You cannot afford the $75 toll!' };
        },
      },
      {
        id: 'duel_smuggler',
        label: 'Challenge Corsair to a Reel Struggle (High Stakes)',
        desc: 'Wager line skill: 70% chance to claim his Cursed Doubloon Cache (+$450), 30% chance to lose 1 caught fish.',
        cost: 0,
        action: (saveSystem) => {
          const win = Math.random() < 0.7;
          if (win) {
            saveSystem.addCoins(450);
            saveSystem.addXp(180);
            saveSystem.recordPerfectReel();
            return { success: true, message: "🏆 Victory! Ye out-reeled Captain Vane! Won Corsair's Cursed Cache (+$450, +180 XP)!" };
          } else {
            saveSystem.breakPerfectReelStreak();
            return { success: false, message: "💀 The phantom's cutlass severed your line lead! Reel struggle lost." };
          }
        },
      },
    ],
  },
  {
    id: 'wayward_cartographer',
    name: 'Professor Alden the Cartographer',
    title: 'Royal Maritime Geographer',
    avatar: '🧭📜',
    themeColor: '#10b981',
    greeting: 'Incredible! Another soul charting these fantastical horizons! My survey charts are missing crucial soundings.',
    options: [
      {
        id: 'trade_fossil_notes',
        label: 'Share Oceanic Survey Notes (Free)',
        desc: 'Exchange depth coordinates to receive +120 Angler XP and unlock a secret map hotspot.',
        cost: 0,
        action: (saveSystem) => {
          saveSystem.addXp(120);
          saveSystem.addBuff('cartographerMark', 300000);
          return { success: true, message: '🗺️ Shared survey notes with Alden: +120 XP & Secret Hotspot Marked!' };
        },
      },
      {
        id: 'fossil_exchange',
        label: 'Donate Fossil Fragment ($120 Bounty)',
        desc: 'If you have collected fossil specimens, Alden will grant a generous research grant of $240.',
        cost: 0,
        action: (saveSystem) => {
          if ((saveSystem.data.stats.totalFossilsCollected || 0) >= 1) {
            saveSystem.addCoins(240);
            saveSystem.addXp(150);
            return { success: true, message: '🏛️ Alden cataloged your fossil findings: Awarded +$240 research grant (+150 XP)!' };
          }
          return { success: false, message: 'You have not excavated any prehistoric fossils yet!' };
        },
      },
    ],
  },
];

export class NPCSystem {
  constructor(saveSystem, soundManager, uiManager) {
    this.saveSystem = saveSystem;
    this.soundManager = soundManager;
    this.uiManager = uiManager;
    this.activeEncounter = null;
    this.encounterCooldown = 0;
  }

  update(dt) {
    if (this.encounterCooldown > 0) {
      this.encounterCooldown -= dt;
    }
  }

  // Trigger check called after catch or travel (~3% chance)
  checkRandomEncounter(triggerSource = 'catch') {
    if (this.encounterCooldown > 0) return false;
    if (this.activeEncounter) return false;

    // 3.5% chance
    const roll = Math.random();
    if (roll < 0.035) {
      const npc = NPC_DEFINITIONS[Math.floor(Math.random() * NPC_DEFINITIONS.length)];
      this.triggerEncounter(npc);
      this.encounterCooldown = 60000; // 1 minute cooldown between encounters
      return true;
    }
    return false;
  }

  triggerEncounter(npc) {
    this.activeEncounter = npc;
    if (this.soundManager) {
      this.soundManager.playRareChime();
    }
    if (this.saveSystem) {
      this.saveSystem.recordNPCInteraction();
    }
    if (this.uiManager) {
      this.uiManager.showNPCModal(npc, (chosenOption) => this.handleOptionChosen(chosenOption));
    }
  }

  handleOptionChosen(option) {
    if (!option || !this.activeEncounter) return;
    const result = option.action(this.saveSystem);
    if (this.soundManager) {
      if (result.success) this.soundManager.playQuestComplete();
      else this.soundManager.playButtonClick();
    }
    if (this.uiManager) {
      this.uiManager.showToast(result.message);
      this.uiManager.closeModal();
    }
    this.activeEncounter = null;
  }
}

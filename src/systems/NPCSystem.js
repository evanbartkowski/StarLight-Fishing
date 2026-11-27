// NPCSystem.js — Atmospheric Rare NPC Encounters
// Wandering merchants, sirens, stargazers, ghost smugglers, and cartographers

export function getNPCRealmMultiplier(saveSystem) {
  const unlocked = saveSystem?.data?.unlockedSeas || [1];
  const highestRealm = Math.max(1, ...unlocked);
  // Scale dynamically per unlocked realm:
  // Realm 1: 1.0x, Realm 2: 1.6x, Realm 3: 2.5x, Realm 4: 4.0x, Realm 5: 6.5x, Realm 6: 10.0x, Realm 7: 16.0x
  const mults = { 1: 1.0, 2: 1.6, 3: 2.5, 4: 4.0, 5: 6.5, 6: 10.0, 7: 16.0 };
  return mults[highestRealm] || Math.max(1, 1 + (highestRealm - 1) * 2.5);
}

export function scaleNPCOptions(npc, saveSystem) {
  const mult = getNPCRealmMultiplier(saveSystem);
  const highestRealm = Math.max(1, ...(saveSystem?.data?.unlockedSeas || [1]));
  const bonusTag = highestRealm > 1 ? ` (Sea ${highestRealm} x${mult.toFixed(1)} Bonus)` : '';

  const scaledOptions = npc.options.map(opt => {
    const scaled = { ...opt };
    if (opt.baseCoins !== undefined || opt.baseXp !== undefined) {
      const coins = opt.baseCoins ? Math.round(opt.baseCoins * mult) : 0;
      const xp = opt.baseXp ? Math.round(opt.baseXp * mult) : 0;
      scaled.scaledCoins = coins;
      scaled.scaledXp = xp;

      if (typeof opt.makeLabel === 'function') {
        scaled.label = opt.makeLabel(coins, xp, mult);
      }
      if (typeof opt.makeDesc === 'function') {
        scaled.desc = opt.makeDesc(coins, xp, mult, bonusTag);
      }
      if (typeof opt.makeAction === 'function') {
        scaled.action = opt.makeAction(coins, xp, mult);
      }
    }
    return scaled;
  });

  return { ...npc, options: scaledOptions };
}

export const NPC_DEFINITIONS = [
  {
    id: 'drifting_merchant',
    name: 'Tony the Drifting Merchant',
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
        baseCoins: 150,
        label: 'Trade Beachcomber Drift Trinkets (+$150)',
        desc: 'Tony happily buys extra drift shells and scrap driftwood from your deck.',
        cost: 0,
        makeLabel: (coins) => `Trade Beachcomber Drift Trinkets (+$${coins.toLocaleString()})`,
        makeDesc: (coins, xp, mult, tag) => `Tony happily buys extra drift shells and scrap driftwood from your deck for +$${coins.toLocaleString()} coins.${tag}`,
        makeAction: (coins) => (saveSystem) => {
          saveSystem.addCoins(coins);
          return { success: true, message: `🪙 Traded beachcomber scraps to Tony for +$${coins.toLocaleString()} coins!` };
        },
        action: (saveSystem) => {
          saveSystem.addCoins(150);
          return { success: true, message: '🪙 Traded beachcomber scraps to Tony for +$150 coins!' };
        },
      },
      {
        id: 'tony_mystery_trunk',
        badge: 'High Risk',
        baseCoins: 520,
        baseXp: 160,
        label: 'Pry Open Tony\'s Sealed Smuggler Trunk ($200)',
        desc: 'Gamble $200: 65% chance to pull a Sealed Strongbox Crate + Gold Windfall, or 35% chance of Barnacle Trap debuff.',
        cost: 200,
        makeLabel: () => 'Pry Open Tony\'s Sealed Smuggler Trunk ($200)',
        makeDesc: (coins, xp, mult, tag) => `Gamble $200: 65% chance to claim +$${coins.toLocaleString()} & a Sealed Strongbox, or 35% chance a trap inflicts Barnacle Drag debuff.${tag}`,
        makeAction: (coins, xp) => (saveSystem) => {
          if (!saveSystem.spendCoins(200)) return { success: false, message: 'You need $200 coins to buy the trunk key!' };
          if (Math.random() < 0.65) {
            saveSystem.addCoins(coins);
            saveSystem.addXp(xp);
            saveSystem.awardSealedCrate?.(2);
            return { success: true, message: `Jackpot! Unlocked Strongbox Crate +$${coins.toLocaleString()} & +${xp} XP!` };
          }
          saveSystem.addBuff('cursedBarnacles', 90000);
          return { success: false, message: 'Snap! Sticky barnacles burst out — -15% Reel Speed debuff for 90s!' };
        },
        action: (saveSystem) => {
          if (!saveSystem.spendCoins(200)) return { success: false, message: 'You need $200 coins!' };
          if (Math.random() < 0.65) {
            saveSystem.addCoins(520);
            saveSystem.addXp(160);
            saveSystem.awardSealedCrate?.(2);
            return { success: true, message: 'Jackpot! Unlocked Strongbox Crate +$520 & +160 XP!' };
          }
          saveSystem.addBuff('cursedBarnacles', 90000);
          return { success: false, message: 'Snap! Barnacles clung to your hull — Reel Speed slowed for 90s!' };
        },
      },
    ],
  },
  {
    id: 'blind_siren',
    name: 'Issara the Stargazer Siren',
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
        baseXp: 250,
        label: 'Offer Silver Coin Tribute ($100)',
        desc: 'Make a reverent gift to receive a grand windfall of +250 XP.',
        cost: 100,
        makeLabel: (coins, xp) => `Offer Silver Coin Tribute ($100: +${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `Make a reverent gift to receive a grand windfall of +${xp} XP.${tag}`,
        makeAction: (coins, xp) => (saveSystem) => {
          if (saveSystem.spendCoins(100)) {
            saveSystem.addXp(xp);
            return { success: true, message: `⭐ Issara smiled upon your tribute: Received +${xp} Angler XP!` };
          }
          return { success: false, message: 'You lack $100 coins for the tribute.' };
        },
        action: (saveSystem) => {
          if (saveSystem.spendCoins(100)) {
            saveSystem.addXp(250);
            return { success: true, message: '⭐ Issara smiled upon your tribute: Received +250 Angler XP!' };
          }
          return { success: false, message: 'You lack $100 coins for the tribute.' };
        },
      },
      {
        id: 'abyssal_hymn',
        badge: 'Gamble',
        baseXp: 340,
        label: 'Channel Forbidden Abyssal Hymn (Free)',
        desc: 'Gain +1 Gem and massive XP—50% chance for 2x Gold Rush (3m), or 50% chance to dim your lantern (Brine Mist debuff).',
        cost: 0,
        makeLabel: (coins, xp) => `Channel Forbidden Abyssal Hymn (+1 Gem, +${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `Gain +1 Gem & +${xp} XP—50% chance for 2x Gold Rush (3m), or 50% chance Brine Mist dims your lantern for 90s.${tag}`,
        makeAction: (coins, xp) => (saveSystem) => {
          saveSystem.addGems(1);
          saveSystem.addXp(xp);
          if (Math.random() < 0.5) {
            saveSystem.addBuff('goldSurge', 180000);
            return { success: true, message: `Blessed by the deep song! +1 Gem, +${xp} XP & 2x Gold Rush (3m)!` };
          }
          saveSystem.addBuff('foggedLens', 90000);
          return { success: true, message: `You claimed +1 Gem & +${xp} XP, but Brine Mist dimmed your lantern for 90s!` };
        },
        action: (saveSystem) => {
          saveSystem.addGems(1);
          saveSystem.addXp(340);
          saveSystem.addBuff('foggedLens', 90000);
          return { success: true, message: 'Claimed +1 Gem & +340 XP, though Brine Mist dimmed your lantern!' };
        },
      },
    ],
  },
  {
    id: 'ghost_smuggler',
    name: 'Curtis the Ghost Smuggler',
    title: 'Spectral Corsair Phantom',
    avatar: '🏴‍☠️👻',
    themeColor: '#a855f7',
    greeting: 'Shiver me bones! Ye tread upon waters claimed by the Phantom Fleet. What say ye, mortal angler?',
    options: [
      {
        id: 'pay_toll',
        baseXp: 90,
        label: 'Pay Peaceful Toll ($75)',
        desc: 'Surrender a token fee to avoid confrontation and sail with safe spectral passage.',
        cost: 75,
        makeLabel: (coins, xp) => `Pay Peaceful Toll ($75: +${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `Surrender a token fee to avoid confrontation and sail with safe spectral passage (+${xp} XP).${tag}`,
        makeAction: (coins, xp) => (saveSystem) => {
          if (saveSystem.spendCoins(75)) {
            saveSystem.addXp(xp);
            return { success: true, message: `⚓ Paid the $75 toll. Curtis tipped his spectral tricorn hat (+${xp} XP).` };
          }
          return { success: false, message: 'You cannot afford the $75 toll!' };
        },
        action: (saveSystem) => {
          if (saveSystem.spendCoins(75)) {
            saveSystem.addXp(90);
            return { success: true, message: '⚓ Paid the $75 toll. Curtis tipped his spectral tricorn hat (+90 XP).' };
          }
          return { success: false, message: 'You cannot afford the $75 toll!' };
        },
      },
      {
        id: 'duel_smuggler',
        baseCoins: 450,
        baseXp: 180,
        label: 'Challenge Corsair to a Reel Struggle (High Stakes)',
        desc: 'Wager line skill: 70% chance to claim his Cursed Doubloon Cache (+$450), 30% chance to lose 1 caught fish.',
        cost: 0,
        makeLabel: (coins, xp) => `Challenge Corsair to a Reel Struggle (High Stakes: +$${coins.toLocaleString()}, +${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `Wager line skill: 70% chance to claim his Cursed Doubloon Cache (+$${coins.toLocaleString()}, +${xp} XP), 30% chance to lose 1 caught fish.${tag}`,
        makeAction: (coins, xp) => (saveSystem) => {
          const win = Math.random() < 0.7;
          if (win) {
            saveSystem.addCoins(coins);
            saveSystem.addXp(xp);
            saveSystem.recordPerfectReel();
            return { success: true, message: `🏆 Victory! Ye out-reeled Curtis! Won Corsair's Cursed Cache (+$${coins.toLocaleString()}, +${xp} XP)!` };
          } else {
            saveSystem.breakPerfectReelStreak();
            saveSystem.adjustCoins(-120);
            saveSystem.addBuff('cursedBarnacles', 75000);
            return { success: false, message: "Curtis clipped $120 & barnacle-snagged your reel for 75s!" };
          }
        },
        action: (saveSystem) => {
          const win = Math.random() < 0.7;
          if (win) {
            saveSystem.addCoins(450);
            saveSystem.addXp(180);
            saveSystem.recordPerfectReel();
            return { success: true, message: "Victory! Claimed Corsair Cache (+$450, +180 XP)!" };
          } else {
            saveSystem.breakPerfectReelStreak();
            saveSystem.adjustCoins(-120);
            saveSystem.addBuff('cursedBarnacles', 75000);
            return { success: false, message: "Reel struggle lost — lost $120 and suffered Barnacle Drag (75s)!" };
          }
        },
      },
      {
        id: 'phantom_pact',
        badge: 'Unique Loot',
        baseXp: 240,
        label: 'Accept Cursed Smuggler Compass (Risky)',
        desc: 'Immediately unlock 2x XP Surge (4m) & Compass Bobber—35% chance Curtis steals $180 coins on departure.',
        cost: 0,
        makeAction: (coins, xp) => (saveSystem) => {
          saveSystem.addBuff('xpSurge', 240000);
          saveSystem.unlockBobber?.('compass_bobber');
          saveSystem.addXp(xp || 240);
          if (Math.random() < 0.35) {
            saveSystem.adjustCoins(-180);
            return { success: true, message: 'Unlocked 2x XP Surge (4m) & Compass Bobber—Curtis pocketed $180 on his way out!' };
          }
          return { success: true, message: 'Claimed 2x XP Surge (4m) & unlocked Brass Compass Bobber!' };
        },
        action: (saveSystem) => {
          saveSystem.addBuff('xpSurge', 240000);
          saveSystem.unlockBobber?.('compass_bobber');
          saveSystem.addXp(240);
          return { success: true, message: 'Claimed 2x XP Surge (4m) & Brass Compass Bobber!' };
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
        baseXp: 120,
        label: 'Share Oceanic Survey Notes (Free)',
        desc: 'Exchange depth coordinates to receive +120 Angler XP and unlock a secret map hotspot.',
        cost: 0,
        makeLabel: (coins, xp) => `Share Oceanic Survey Notes (+${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `Exchange depth coordinates to receive +${xp} Angler XP and unlock a secret map hotspot.${tag}`,
        makeAction: (coins, xp) => (saveSystem) => {
          saveSystem.addXp(xp);
          saveSystem.addBuff('cartographerMark', 300000);
          return { success: true, message: `🗺️ Shared survey notes with Alden: +${xp} XP & Secret Hotspot Marked!` };
        },
        action: (saveSystem) => {
          saveSystem.addXp(120);
          saveSystem.addBuff('cartographerMark', 300000);
          return { success: true, message: '🗺️ Shared survey notes with Alden: +120 XP & Secret Hotspot Marked!' };
        },
      },
      {
        id: 'fossil_exchange',
        baseCoins: 240,
        baseXp: 150,
        label: 'Donate Fossil Fragment ($120 Bounty)',
        desc: 'If you have collected fossil specimens, Alden will grant a generous research grant of $240.',
        cost: 0,
        makeLabel: (coins, xp) => `Donate Fossil Fragment (+$${coins.toLocaleString()} Bounty, +${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `If you have collected fossil specimens, Alden will grant a generous research grant of $${coins.toLocaleString()} and +${xp} XP.${tag}`,
        makeAction: (coins, xp) => (saveSystem) => {
          if ((saveSystem.data.stats.totalFossilsCollected || 0) >= 1) {
            saveSystem.addCoins(coins);
            saveSystem.addXp(xp);
            return { success: true, message: `🏛️ Alden cataloged your fossil findings: Awarded +$${coins.toLocaleString()} research grant (+${xp} XP)!` };
          }
          return { success: false, message: 'You have not excavated any prehistoric fossils yet!' };
        },
        action: (saveSystem) => {
          if ((saveSystem.data.stats.totalFossilsCollected || 0) >= 1) {
            saveSystem.addCoins(240);
            saveSystem.addXp(150);
            return { success: true, message: '🏛️ Alden cataloged your fossil findings: Awarded +$240 research grant (+150 XP)!' };
          }
          return { success: false, message: 'You have not excavated any prehistoric fossils yet!' };
        },
      },
      {
        id: 'deep_chart_bundle',
        badge: 'Unique Loot',
        baseXp: 210,
        label: 'Commission Secret Trench Crate ($350)',
        desc: 'Pay $350 for a guaranteed Sealed Corsair Crate (Rank 3) & Starlight Sight (3m).',
        cost: 350,
        makeAction: (coins, xp) => (saveSystem) => {
          if (!saveSystem.spendCoins(350)) return { success: false, message: 'Need $350 coins to commission Alden\'s salvage.' };
          saveSystem.awardSealedCrate?.(3);
          saveSystem.addBuff('starlightClarity', 180000);
          saveSystem.addXp(xp);
          return { success: true, message: `Alden handed over a Sealed Corsair Crate & Starlight Sight (+${xp} XP)!` };
        },
        action: (saveSystem) => {
          if (!saveSystem.spendCoins(350)) return { success: false, message: 'Need $350 coins.' };
          saveSystem.awardSealedCrate?.(3);
          saveSystem.addBuff('starlightClarity', 180000);
          saveSystem.addXp(210);
          return { success: true, message: 'Alden handed over a Sealed Corsair Crate & Starlight Sight!' };
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
    this.lastEncounterId = null;
  }

  update(dt) {
    // Closing a popup without choosing an option must not block future visitors.
    if (this.activeEncounter && this.uiManager?.activeModal !== 'npc_encounter') this.activeEncounter = null;
    if (this.encounterCooldown > 0) {
      this.encounterCooldown -= dt;
    }
  }

  // Trigger check called after catch or travel (~3% chance)
  checkRandomEncounter(triggerSource = 'catch') {
    if (this.encounterCooldown > 0) return false;
    if (this.activeEncounter || this.uiManager?.activeModal) return false;
    const welcome = typeof document !== 'undefined' ? document.getElementById('welcome-popup') : null;
    if (welcome && !welcome.classList.contains('welcome-overlay-hidden')) return false;

    // More visitors, with a cooldown and no consecutive repeat characters.
    const roll = Math.random();
    if (roll < (triggerSource === 'travel' ? 0.18 : 0.07)) {
      const available = NPC_DEFINITIONS.filter(npc => npc.id !== this.lastEncounterId);
      const npc = available[Math.floor(Math.random() * available.length)];
      this.triggerEncounter(npc);
      this.encounterCooldown = 90000;
      return true;
    }
    return false;
  }

  triggerEncounter(npc) {
    this.lastEncounterId = npc.id;
    const scaledNpc = scaleNPCOptions(npc, this.saveSystem);
    this.activeEncounter = scaledNpc;
    if (this.soundManager) {
      this.soundManager.playRareChime();
    }
    if (this.saveSystem) {
      this.saveSystem.recordNPCInteraction();
    }
    if (this.uiManager) {
      this.uiManager.showNPCModal(scaledNpc, (chosenOption) => this.handleOptionChosen(chosenOption));
    }
  }

  handleOptionChosen(option) {
    if (!option) return;
    try {
      const result = typeof option.action === 'function' ? option.action(this.saveSystem) : { success: true, message: 'Thank you, captain!' };
      if (this.soundManager) {
        if (result?.success) this.soundManager.playQuestComplete();
        else this.soundManager.playButtonClick();
      }
      if (this.uiManager) {
        if (result?.message) this.uiManager.showToast(result.message);
        this.uiManager.closeModal();
      }
    } catch (err) {
      console.warn('NPC option execution error:', err);
      this.uiManager?.closeModal();
    } finally {
      this.activeEncounter = null;
    }
  }
}

NPC_DEFINITIONS.push(
  {
    id: 'harbor_cook',
    name: 'Mara the Harbor Cook',
    title: 'Keeper of the Dockside Kitchen',
    avatar: '🍲',
    themeColor: '#fb923c',
    greeting: 'The soup is warm and the harbor is waking up. Every good fishing trip starts with a little company.',
    options: [
      {
        id: 'share_recipe',
        baseXp: 60,
        label: 'Swap fishing stories (Free)',
        desc: 'Share a quiet moment on deck and earn 60 XP.',
        cost: 0,
        makeLabel: (coins, xp) => `Swap fishing stories (+${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `Share a quiet moment on deck and earn ${xp} XP.${tag}`,
        makeAction: (coins, xp) => (save) => {
          save.addXp(xp);
          return { success: true, message: `Mara adds your tale to her recipe book. +${xp} XP!` };
        },
        action: (save) => {
          save.addXp(60);
          return { success: true, message: 'Mara adds your tale to her recipe book. +60 XP!' };
        },
      },
      {
        id: 'warm_lunch',
        baseXp: 100,
        label: 'Buy a packed lunch ($40)',
        desc: 'A hearty lunch and a lesson from an old angler: +100 XP.',
        cost: 40,
        makeLabel: (coins, xp) => `Buy a packed lunch ($40: +${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `A hearty lunch and a lesson from an old angler: +${xp} XP.${tag}`,
        makeAction: (coins, xp) => (save) => {
          if (!save.spendCoins(40)) return { success: false, message: 'You need $40 for lunch.' };
          save.addXp(xp);
          return { success: true, message: `A warm meal and good advice. +${xp} XP!` };
        },
        action: (save) => {
          if (!save.spendCoins(40)) return { success: false, message: 'You need $40 for lunch.' };
          save.addXp(100);
          return { success: true, message: 'A warm meal and good advice. +100 XP!' };
        },
      },
      {
        id: 'mystery_chowder',
        badge: 'Gamble',
        baseXp: 190,
        label: 'Sample Experimental Trench Chowder (Free)',
        desc: '70% chance for 2x Gold Rush (3m) + cleanses debuffs; 30% chance indigestion costs $100 & slows reel speed.',
        cost: 0,
        makeAction: (coins, xp) => (save) => {
          if (Math.random() < 0.7) {
            save.clearDebuffs?.();
            save.addBuff('goldSurge', 180000);
            save.addXp(xp);
            return { success: true, message: `Hearty spicy chowder! Cleared debuffs & 2x Gold Rush (3m) (+${xp} XP)!` };
          }
          save.adjustCoins(-100);
          save.addBuff('cursedBarnacles', 60000);
          return { success: false, message: 'Too spicy! Dropped $100 & slowed down for 60s!' };
        },
        action: (save) => {
          save.clearDebuffs?.();
          save.addBuff('goldSurge', 180000);
          save.addXp(190);
          return { success: true, message: 'Hearty spicy chowder! Cleared debuffs & 2x Gold Rush!' };
        },
      },
    ],
  },
  {
    id: 'lantern_keeper',
    name: 'Jun the Lantern Keeper',
    title: 'Guide of the Evening Tide',
    avatar: '🏮',
    themeColor: '#a5b4fc',
    greeting: 'Keep a light in the window and an eye on the water. There is more down there than the surface lets on.',
    options: [
      {
        id: 'borrow_lantern',
        label: 'Borrow a lantern (Free)',
        desc: 'Receive Starlight Sight for 90 seconds.',
        cost: 0,
        action: (save) => {
          save.addBuff('starlightClarity', 90000);
          return { success: true, message: 'Jun lends you a lantern. Starlight Sight for 90 seconds!' };
        },
      },
      {
        id: 'lantern_lesson',
        baseXp: 75,
        label: 'Listen to a lighthouse tale (Free)',
        desc: 'Learn about life along the coast and gain 75 XP.',
        cost: 0,
        makeLabel: (coins, xp) => `Listen to a lighthouse tale (+${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `Learn about life along the coast and gain ${xp} XP.${tag}`,
        makeAction: (coins, xp) => (save) => {
          save.addXp(xp);
          return { success: true, message: `The lighthouse still shines for every returning boat. +${xp} XP!` };
        },
        action: (save) => {
          save.addXp(75);
          return { success: true, message: 'The lighthouse still shines for every returning boat. +75 XP!' };
        },
      },
      {
        id: 'trim_storm_wick',
        badge: 'High Risk',
        baseCoins: 380,
        baseXp: 160,
        label: 'Trim High-Pressure Storm Burner ($90)',
        desc: '65% chance for 2x Gold Rush (3m) & Coins; 35% chance lamp flare inflicts Brine Mist debuff (75s) & burns $150.',
        cost: 90,
        makeAction: (coins, xp) => (save) => {
          if (!save.spendCoins(90)) return { success: false, message: 'Need $90 for wick oil.' };
          if (Math.random() < 0.65) {
            save.addCoins(coins);
            save.addXp(xp);
            save.addBuff('goldSurge', 180000);
            return { success: true, message: `Lantern blazed golden! +$${coins.toLocaleString()}, +${xp} XP & 2x Gold Rush!` };
          }
          save.adjustCoins(-60);
          save.addBuff('foggedLens', 75000);
          return { success: false, message: 'Flare soot smoked your goggles! Lost $60 extra & Brine Mist (75s)!' };
        },
        action: (save) => {
          if (!save.spendCoins(90)) return { success: false, message: 'Need $90 for wick oil.' };
          if (Math.random() < 0.65) {
            save.addCoins(380);
            save.addXp(160);
            save.addBuff('goldSurge', 180000);
            return { success: true, message: 'Lantern blazed golden! +$380, +160 XP & 2x Gold Rush!' };
          }
          save.adjustCoins(-60);
          save.addBuff('foggedLens', 75000);
          return { success: false, message: 'Flare soot smoked your goggles! Brine Mist debuff (75s)!' };
        },
      },
    ],
  },
  {
    id: 'tide_researcher',
    name: 'Nell the Tide Researcher',
    title: 'Harbor Field Naturalist',
    avatar: '🔬',
    themeColor: '#2dd4bf',
    greeting: 'Wonderful timing! I am comparing field notes from these waters. Even the smallest catch can teach us something.',
    options: [
      {
        id: 'share_journal',
        baseCoins: 100,
        baseXp: 60,
        label: 'Share your field journal (Free)',
        desc: 'With at least 3 discovered fish species, receive a $100 research grant and 60 XP.',
        cost: 0,
        makeLabel: (coins, xp) => `Share your field journal (+$${coins.toLocaleString()}, +${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `With at least 3 discovered fish species, receive a $${coins.toLocaleString()} research grant and ${xp} XP.${tag}`,
        makeAction: (coins, xp) => (save) => {
          if (Object.keys(save.data.journal || {}).length < 3) return { success: false, message: 'Discover 3 fish species, then bring Nell your notes.' };
          save.addCoins(coins);
          save.addXp(xp);
          return { success: true, message: `Nell records your discoveries. +$${coins.toLocaleString()} and +${xp} XP!` };
        },
        action: (save) => {
          if (Object.keys(save.data.journal || {}).length < 3) return { success: false, message: 'Discover 3 fish species, then bring Nell your notes.' };
          save.addCoins(100);
          save.addXp(60);
          return { success: true, message: 'Nell records your discoveries. +$100 and +60 XP!' };
        },
      },
      {
        id: 'research_advice',
        baseXp: 45,
        label: 'Ask for field advice (Free)',
        desc: 'Receive 45 XP and a tip for your next expedition.',
        cost: 0,
        makeLabel: (coins, xp) => `Ask for field advice (+${xp} XP)`,
        makeDesc: (coins, xp, mult, tag) => `Receive ${xp} XP and a tip for your next expedition.${tag}`,
        makeAction: (coins, xp) => (save) => {
          save.addXp(xp);
          return { success: true, message: `Check each realm in your journal for fish depth hints. +${xp} XP!` };
        },
        action: (save) => {
          save.addXp(45);
          return { success: true, message: 'Check each realm in your journal for fish depth hints. +45 XP!' };
        },
      },
      {
        id: 'sponsor_expedition',
        badge: 'Unique Loot',
        baseXp: 220,
        label: 'Co-Fund Deep Plankton Probe ($280)',
        desc: 'Invest $280 into research for +1 Gem & Survey Mark hotspot reveal (5m).',
        cost: 280,
        makeAction: (coins, xp) => (save) => {
          if (!save.spendCoins(280)) return { success: false, message: 'Need $280 to co-fund probe.' };
          save.addGems(1);
          save.addBuff('cartographerMark', 300000);
          save.addXp(xp);
          return { success: true, message: `Probe succeeded! +1 Gem, Survey Mark (5m) & +${xp} XP!` };
        },
        action: (save) => {
          if (!save.spendCoins(280)) return { success: false, message: 'Need $280.' };
          save.addGems(1);
          save.addBuff('cartographerMark', 300000);
          save.addXp(220);
          return { success: true, message: 'Probe succeeded! +1 Gem & Survey Mark (5m)!' };
        },
      },
    ],
  },
  {
    id: 'deep_trench_broker',
    name: 'Kael the Abyssal Salvager',
    title: 'Hard-Suit Trench Diver',
    avatar: '🤿⚓',
    themeColor: '#fb923c',
    greeting: 'Hull pressure builds fast down below. Want me to scrape barnacles off your tackle, trade a salvage canister, or gamble on pressure-sealed loot?',
    options: [
      {
        id: 'scrape_hull',
        badge: 'Cleanse',
        baseXp: 180,
        label: 'Scrape Hull Cleanse ($150)',
        desc: 'Removes all active debuffs (Barnacle Drag, Brine Mist) and awards +180 XP.',
        cost: 150,
        makeAction: (coins, xp) => (save) => {
          if (!save.spendCoins(150)) return { success: false, message: 'Need $150 coins for hull scraping.' };
          save.clearDebuffs?.();
          save.addXp(xp);
          return { success: true, message: `Hull scrubbed clean! Debuffs removed & +${xp} XP!` };
        },
        action: (save) => {
          if (!save.spendCoins(150)) return { success: false, message: 'Need $150 coins.' };
          save.clearDebuffs?.();
          save.addXp(180);
          return { success: true, message: 'Hull scrubbed clean! Debuffs removed & +180 XP!' };
        },
      },
      {
        id: 'salvage_canister',
        badge: 'Unique Loot',
        label: 'Crack Unstable Deep Canister ($260)',
        desc: '60% chance for Sealed Strongbox Crate + 2x XP Surge (4m); 40% chance canister ruptures for Brine Mist debuff (90s).',
        cost: 260,
        action: (save) => {
          if (!save.spendCoins(260)) return { success: false, message: 'Need $260 coins.' };
          if (Math.random() < 0.6) {
            save.awardSealedCrate?.(2);
            save.addBuff('xpSurge', 240000);
            return { success: true, message: 'Recovered Sealed Strongbox Crate & 2x XP Surge (4m)!' };
          }
          save.addBuff('foggedLens', 90000);
          return { success: false, message: 'Pressurized brine sprayed everywhere! Brine Mist debuff for 90s!' };
        },
      },
      {
        id: 'force_hatch',
        badge: 'High Risk',
        baseCoins: 750,
        baseXp: 260,
        label: 'Pry Open Sunken Safe Hatch (Free)',
        desc: 'Bold move: 55% chance to claim big gold & XP; 45% chance metal shards cost $220 repairs + Barnacle Drag.',
        cost: 0,
        makeAction: (coins, xp) => (save) => {
          if (Math.random() < 0.55) {
            save.addCoins(coins);
            save.addXp(xp);
            return { success: true, message: `Prized open cleanly! Claimed +$${coins.toLocaleString()} & +${xp} XP!` };
          }
          save.adjustCoins(-220);
          save.addBuff('cursedBarnacles', 90000);
          return { success: false, message: 'Snapped a winch cable! Paid $220 repairs & Barnacle Drag (90s)!' };
        },
        action: (save) => {
          if (Math.random() < 0.55) {
            save.addCoins(750);
            save.addXp(260);
            return { success: true, message: 'Claimed +$750 & +260 XP!' };
          }
          save.adjustCoins(-220);
          save.addBuff('cursedBarnacles', 90000);
          return { success: false, message: 'Paid $220 repairs & Barnacle Drag!' };
        },
      },
    ],
  },
);

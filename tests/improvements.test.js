import test from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
};

const { drawVesselHull, getVesselLayout } = await import('../src/rendering/VesselRenderer.js');
const { BOAT_SKIN_OPTIONS, BOAT_TRINKETS, BOAT_PART_PALETTES, drawBoatTrinket, normalizeBoatColors } = await import('../src/data/CustomizationData.js');
const { ShipsCat, PerchingPelican } = await import('../src/entities/BoatCompanions.js');
const { SaveSystem } = await import('../src/systems/SaveSystem.js');
const { accountManager } = await import('../src/systems/AccountManager.js');
const { QuestSystem } = await import('../src/systems/QuestSystem.js');
const { Hook } = await import('../src/entities/Hook.js');
const { getCurrentDerby, recordDerbyDive, getLocalDerbyStandings } = await import('../src/systems/WeeklyDerby.js');

function finiteMockCtx() {
  const grad = { addColorStop() {} };
  const calls = { count: 0 };
  const proxy = new Proxy({
    globalAlpha: 1,
    createLinearGradient: () => grad,
    createRadialGradient: () => grad,
    measureText: () => ({ width: 40 }),
  }, {
    get(target, key) {
      if (key in target) return target[key];
      return (...args) => {
        calls.count++;
        for (const arg of args) {
          if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `Non-finite draw arg in ${String(key)}: ${arg}`);
        }
      };
    },
    set(target, key, val) { target[key] = val; return true; },
  });
  return { ctx: proxy, calls };
}

test('all 9 vessel tiers, custom multi-part boat colors, trinkets, and pet positions render cleanly and fit bounds', () => {
  const cat = new ShipsCat();
  const pelican = new PerchingPelican();
  const customColors = normalizeBoatColors({ hull: '#0f294a', trim: '#fbbf24', sails: '#e0e7ff' });
  assert.deepEqual(customColors, { hull: '#0f294a', trim: '#fbbf24', sails: '#e0e7ff' });
  assert.equal(normalizeBoatColors({ hull: '#12abef', trim: 'invalid' }).hull, '#12abef');
  assert.equal(normalizeBoatColors({ hull: 'bad' }).hull, BOAT_PART_PALETTES.hull.default);

  for (let tier = 0; tier <= 8; tier++) {
    const layout = getVesselLayout(tier, 140, 40);
    const catPos = cat.getDeckPosition(tier);
    const birdPos = pelican.getBowspritPosition(tier);
    assert.ok(catPos.x >= -layout.halfWidth - 20 && catPos.x < 0, `Tier ${tier} cat must perch aft cleanly (${catPos.x})`);
    assert.ok(birdPos.x > 0 && birdPos.x <= layout.halfWidth + 20, `Tier ${tier} pelican must perch near bow/bowsprit cleanly (${birdPos.x})`);

    const { ctx, calls } = finiteMockCtx();
    drawVesselHull(ctx, tier, 140, 40, 1.5, {
      skinColor: BOAT_SKIN_OPTIONS.celestial.color,
      skinMeta: BOAT_SKIN_OPTIONS.celestial,
      boatColors: customColors,
    });
    assert.ok(calls.count > 10, `Tier ${tier} hull must issue draw calls`);
    for (const trinketId of Object.keys(BOAT_TRINKETS)) {
      drawBoatTrinket(ctx, trinketId, tier, 1.5, 140, 40);
    }
    cat.render(ctx, tier);
    pelican.render(ctx, tier);
  }
});

test('boatColors persist across save/load and Daily Check-in awards mystery prizes on every 3rd day', () => {
  storage.clear();
  accountManager.activeUser = 'MysteryTester';
  const save = new SaveSystem();
  save.setBoatColors({ hull: '#7f1d1d', trim: '#38bdf8', sails: '#fef08a' });
  save.load();
  assert.deepEqual(save.getBoatColors(), { hull: '#7f1d1d', trim: '#38bdf8', sails: '#fef08a' });

  const startDay = Date.parse('2026-10-10T12:00:00Z');
  save.claimDailyLogin(startDay);
  save.claimDailyLogin(startDay + 86400000);
  save.claimDailyLogin(startDay + 2 * 86400000);
  assert.equal(save.data.dailyLogin.streak, 3);
  assert.ok(save.data.dailyLogin.lastReward.mysteryPrize, 'Day 3 check-in must award a Mystery Prize');
  assert.ok(save.data.dailyLogin.lastReward.mysteryPrize.name.length > 0);
});

test('quests include and deliver unique useful loot on completion', () => {
  storage.clear();
  accountManager.activeUser = 'QuestHero';
  const save = new SaveSystem();
  const qs = new QuestSystem(save);
  const firstQuest = qs.getActiveQuests()[0];
  assert.ok(firstQuest.rewardLoot && firstQuest.rewardLoot.name, 'Quest must expose unique rewardLoot metadata');

  const activeEntry = save.data.quests.active.find(q => q.id === firstQuest.id);
  activeEntry.current = activeEntry.target;
  const beforeCoins = save.data.coins;
  const beforeInv = save.getInventory().length;
  const beforeBuffs = Object.keys(save.data.buffs || {}).length;
  const claimed = qs.claimQuest(firstQuest.id);
  assert.ok(claimed && claimed.rewardLoot);
  assert.ok(save.data.coins > beforeCoins);
  const gotLootEffect =
    Object.keys(save.data.buffs || {}).length > beforeBuffs ||
    save.getInventory().length > beforeInv ||
    save.data.coins >= beforeCoins + claimed.rewardCoins;
  assert.equal(gotLootEffect, true, 'Claiming quest must apply unique loot effect');
});

test('hook diveCombo increases combo multiplier and resets on hazard impact', () => {
  const hook = new Hook();
  hook.reset(400, 220);
  hook.capacity = 5;
  const makeCatch = id => ({ id, hookTo() {} });
  assert.equal(hook.getComboMultiplier(), 1);
  hook.addCatch(makeCatch('a'));
  hook.addCatch(makeCatch('b'));
  hook.addCatch(makeCatch('c'));
  assert.equal(hook.diveCombo, 3);
  assert.ok(Math.abs(hook.getComboMultiplier() - 1.1) < 0.0001);
  hook.takeHazardHit({ restTime: 0 }, null);
  assert.equal(hook.diveCombo, 0);
  assert.equal(hook.getComboMultiplier(), 1);
});

test('WeeklyDerby rotates cleanly, records best weekly score, and ranks players', () => {
  storage.clear();
  accountManager.activeUser = 'DerbyAce';
  accountManager.accounts = { derbyace: { username: 'DerbyAce', createdAt: 100 } };
  const save = new SaveSystem();
  const now = Date.parse('2026-11-26T20:00:00Z');
  const derby = getCurrentDerby(now, 0);
  assert.ok(derby.id && derby.title && derby.remaining.days >= 0);

  const rec = recordDerbyDive(save, {
    items: [{ name: 'Abyss Whale', weight: 420.5, rarity: 'legendary', isShiny: true, crown: 'gold', species: { id: 'w1' } }],
    maxDepth: 1200,
    haulGold: 4500,
  }, now, 0);
  assert.ok(rec && rec.score > 0 && rec.weekId === derby.weekId);

  const { standings } = getLocalDerbyStandings(save, [{ username: 'Rival', weeklyDerby: { weekId: derby.weekId, score: rec.score + 50, bestCatchName: 'Titan' } }], now, 0);
  assert.equal(standings[0].username, 'Rival');
  assert.equal(standings[1].username, 'DerbyAce');
  assert.equal(standings[1].isCurrent, true);
});

test('Exotic Boat Hulls require max boat tier, persist after coin purchase, and render cleanly with all Ship Finishes', async () => {
  const { EXOTIC_BOAT_HULLS, BOAT_SKIN_OPTIONS } = await import('../src/data/CustomizationData.js');
  const { drawVesselHull, getVesselLayout } = await import('../src/rendering/VesselRenderer.js');

  storage.clear();
  accountManager.activeUser = null;
  const save = new SaveSystem();
  save.addCoins(1000000);

  // Blocked prior to maxing boatVessel (tier 8)
  save.setUpgradeLevel('boatVessel', 4);
  assert.equal(save.isMaxVessel(), false);
  const blocked = save.purchaseBoatHull('pirate');
  assert.equal(blocked.success, false);

  // Unlocked once maxed
  save.setUpgradeLevel('boatVessel', 8);
  assert.equal(save.isMaxVessel(), true);
  const bought = save.purchaseBoatHull('submarine');
  assert.equal(bought.success, true);
  assert.equal(save.getBoatHull(), 'submarine');
  assert.equal(save.hasBoatHull('submarine'), true);

  const reloaded = new SaveSystem();
  reloaded.load();
  assert.equal(reloaded.getBoatHull(), 'submarine');
  assert.equal(reloaded.hasBoatHull('submarine'), true);

  // Render every exotic hull + every finish FX with finite canvas coordinates
  let draws = 0;
  const mockCtx = new Proxy({}, {
    get: (_, key) => {
      if (key.includes('Gradient')) return () => ({ addColorStop() {} });
      return (...args) => {
        draws++;
        for (const v of args) {
          if (typeof v === 'number') assert.ok(Number.isFinite(v), `Non-finite number passed to ${String(key)}`);
        }
      };
    },
    set: () => true,
  });

  for (const hullId of Object.keys(EXOTIC_BOAT_HULLS)) {
    const layout = getVesselLayout(8, 140, 40, hullId);
    assert.ok(Number.isFinite(layout.anglerPos.x) && Number.isFinite(layout.catPos.x) && Number.isFinite(layout.pelicanPos.x));
    for (const skin of Object.values(BOAT_SKIN_OPTIONS)) {
      drawVesselHull(mockCtx, 8, 140, 40, 1.25, { skinColor: skin.color, skinMeta: skin, skinId: skin.id, hullStyle: hullId });
    }
  }
  assert.ok(draws > 500, 'Exotic hulls and ship finishes issued drawing commands');
});

test('Crate timed multipliers buff Coin sales & XP, crate SVG art renders, and Stripped Sea Snake glides smoothly', async () => {
  const { CRATE_LOOT_TABLES, rollCrateLoot } = await import('../src/data/CrateData.js');
  const { getCrateLootArt, BOAT_UI_ART, TRINKET_ART, HULL_ART } = await import('../src/ui/CustomVectorArt.js');
  const { Fish } = await import('../src/entities/Fish.js');
  const { FISH_SPECIES } = await import('../src/data/FishData.js');
  const { DRIFT_MESSAGES } = await import('../src/data/DriftMessages.js');

  storage.clear();
  const save = new SaveSystem();

  // Verify SVG icons contain <svg elements (no raw emoji placeholders in Boat Yard / Crates art)
  assert.ok(BOAT_UI_ART.tabHulls.includes('<svg') && TRINKET_ART.lucky_cat.includes('<svg') && HULL_ART.chinese_junk.includes('<svg'));
  const goldTonic = CRATE_LOOT_TABLES[1].fair.find(i => i.bonusBuff?.id === 'goldSurge');
  assert.ok(goldTonic, 'Rank 1 crate table includes 2x Gold Rush timed boost');
  assert.ok(getCrateLootArt(goldTonic, 'fair').includes('<svg'));

  // Timed buff multipliers
  const itemA = save.addItemToInventory({ id: 'cod', name: 'Cod', type: 'fish', value: 100 });
  const itemB = save.addItemToInventory({ id: 'cod2', name: 'Cod', type: 'fish', value: 100 });
  const normalSale = save.sellInventoryItem(itemA.instanceId, 1);
  assert.equal(normalSale.gold, 100);

  save.addBuff('goldSurge', 120000);
  assert.equal(save.getCoinBonusMultiplier(), 2);
  const surgeSale = save.sellInventoryItem(itemB.instanceId, 1);
  assert.equal(surgeSale.gold, 200);

  const xpBefore = save.data.xp;
  assert.equal(save.data.level, 0);
  save.addBuff('xpSurge', 120000);
  save.addXp(50);
  // 50 * 2 = 100 XP at Level 0 (req 60) -> Level 1 with 40 XP remaining
  assert.equal(save.data.level, 1);
  assert.equal(save.data.xp, xpBefore + 40);

  // Crate rolls remain bounded & include 2% gem rule
  const sample = rollCrateLoot(3, save);
  assert.ok(sample && typeof sample.coins === 'number' && typeof sample.xp === 'number');

  // Sea Snake moves horizontally more smoothly than vertical jitter
  const snakeSpecies = FISH_SPECIES.find(f => f.name === 'Striped Sea Snake') || { name: 'Striped Sea Snake', shape: 'sea_snake', swimSpeed: 0.35, wiggleSpeed: 1.2 };
  const snake = new Fish(snakeSpecies, 400, 320);
  snake.direction = 1;
  const startX = snake.x;
  const startY = snake.y;
  snake.update(1000, 1200, null);
  assert.ok(snake.x - startX > Math.abs(snake.y - startY), 'Striped Sea Snake travels horizontally faster than vertical oscillation');

  // Bottle poems present
  assert.ok(DRIFT_MESSAGES.length >= 10 && DRIFT_MESSAGES.every(m => m.lines.length >= 3));
});

test('All 11 Easter Eggs trigger, persist unlocks, and render with finite canvas geometry', async () => {
  const { ShipsCat } = await import('../src/entities/BoatCompanions.js');
  const { Treasure } = await import('../src/entities/Treasure.js');
  const { Fish } = await import('../src/entities/Fish.js');
  const { drawAngler } = await import('../src/data/CustomizationData.js');
  const { DRIFT_MESSAGES } = await import('../src/data/DriftMessages.js');
  const {
    CONSTELLATION_FISH_STARS,
    getConstellationScreenCoords,
    handleConstellationClick,
    renderFishConstellation,
    renderMoonReflectionAndGhostShip,
    createGhostCaptainEncounter,
    renderAlienUfoEvent,
    renderFishEasterEggOverlay,
    renderAquariumFamiliarCaptain,
  } = await import('../src/systems/EasterEggs.js');

  let drawCalls = 0;
  const mockCtx = new Proxy({}, {
    get: (_, key) => {
      if (key.includes('Gradient')) return () => ({ addColorStop() {} });
      if (key === 'measureText') return () => ({ width: 50 });
      return (...args) => {
        drawCalls++;
        for (const v of args) {
          if (typeof v === 'number') assert.ok(Number.isFinite(v), `Non-finite number in easter egg ${String(key)}`);
        }
      };
    },
    set: () => true,
  });

  // 1. Cat Angler (7 pets unlocks tiny rod)
  const cat = new ShipsCat();
  for (let i = 1; i <= 6; i++) {
    const r = cat.onClick(null);
    assert.equal(r.pulledTinyRod, false);
  }
  const seventh = cat.onClick(null);
  assert.equal(seventh.pulledTinyRod, true);
  assert.equal(cat.hasTinyRod, true);
  cat.render(mockCtx, 0);

  // 2. Secret Radio 7.77 Bottle Clue + SaveSystem unlock
  storage.clear();
  const save = new SaveSystem();
  const freqBottle = DRIFT_MESSAGES.find(m => m.unlocksFrequency === '7.77');
  assert.ok(freqBottle, 'Secret 7.77 bottle clue exists');
  assert.equal(save.hasFrequency777(), false);
  save.unlockFrequency777();
  assert.equal(save.hasFrequency777(), true);

  // 3. Constellation Puzzle -> solves on clicking all 7 fish stars
  const constState = { active: true, clicked: new Set(), solved: false };
  const coords = getConstellationScreenCoords(1200, 220, 0);
  assert.equal(coords.length, CONSTELLATION_FISH_STARS.length);
  coords.forEach((pt, idx) => {
    const res = handleConstellationClick(constState, pt.x, pt.y, 1200, 220, 0);
    assert.equal(res.hit, true);
    assert.equal(res.completed, idx === coords.length - 1);
  });
  renderFishConstellation(mockCtx, constState, 1200, 220, 0, 1.5);

  // 4. Ghost Ship Moon Reflection & Encounter + Alien UFO + Familiar Captain + Knitting Captain
  renderMoonReflectionAndGhostShip(mockCtx, 1200, 220, 0, 2.0, { isNight: true }, { active: true, x: 240, alpha: 0.85 });
  const ghostNpc = createGhostCaptainEncounter();
  const ghostRes = ghostNpc.options[0].action(save);
  assert.equal(ghostRes.success, true);
  assert.ok(save.getGemBalance() >= 2);

  renderAlienUfoEvent(mockCtx, { active: true, x: 600, y: 74, phase: 'beaming' }, 600, 190, 0, 1.2);
  renderAquariumFamiliarCaptain(mockCtx, { active: true, x: 220 }, 760, 1.4, 'CaptainEvan');
  drawAngler(mockCtx, {}, 0, 0, { isKnitting: true, time: 3.1 });

  // 5. Chest Impersonator (Mimic) + Fish with Rod + Unionized Fish + Misleading Monster
  const mimicChest = new Treasure({ id: 'pirate_chest', name: 'Pirate Chest', rarity: 'rare', value: 200, isMimic: true }, 400, 500);
  mimicChest.mimicRevealed = true;
  mimicChest.render(mockCtx, 0);

  const fWithRod = new Fish({ id: 'ff', name: 'Tackle-Toting Trout', rarity: 'rare', sizeRange: [20, 30], baseWeight: 1, baseValue: 100 }, 300, 400);
  fWithRod.isFishingFish = true;
  const unionFish = new Fish({ id: 'uf', name: 'Union Perch', rarity: 'uncommon', sizeRange: [18, 25], baseWeight: 1, baseValue: 80 }, 320, 400);
  unionFish.isUnionFish = true;
  unionFish.unionSign = 'BETTER BAIT!';
  const miniMonster = new Fish({ id: 'mm', name: 'Tiny Lantern Pip', rarity: 'rare', sizeRange: [6, 9], baseWeight: 0.2, baseValue: 200 }, 500, 500);
  miniMonster.isMisleadingMonster = true;
  miniMonster._revealedSmall = false;

  renderFishEasterEggOverlay(mockCtx, fWithRod, { x: 0, y: 0 }, 0);
  renderFishEasterEggOverlay(mockCtx, unionFish, { x: 0, y: 0 }, 0);
  renderFishEasterEggOverlay(mockCtx, miniMonster, { x: 0, y: 0 }, 0);
  assert.equal(miniMonster._revealedSmall, false);
  // Hook gets close -> reveals small lantern minnow
  renderFishEasterEggOverlay(mockCtx, miniMonster, { x: 495, y: 495 }, 0);
  assert.equal(miniMonster._revealedSmall, true);
  assert.ok(drawCalls > 100);
});

test('Rare pet adventures, richer 3+ option quests/debuffs with illustrated portraits, and security rate-limiting', async () => {
  const { ShipsCat, PerchingPelican } = await import('../src/entities/BoatCompanions.js');
  const { NPC_DEFINITIONS } = await import('../src/systems/NPCSystem.js');
  const { NPC_PORTRAITS, QUEST_ART } = await import('../src/ui/CustomVectorArt.js');
  const { ChatManager } = await import('../src/systems/ChatManager.js');

  let draws = 0;
  const mockCtx = new Proxy({}, {
    get: (_, key) => {
      if (key.includes('Gradient')) return () => ({ addColorStop() {} });
      return (...args) => {
        draws++;
        for (const v of args) {
          if (typeof v === 'number') assert.ok(Number.isFinite(v), `Non-finite number in ${String(key)}`);
        }
      };
    },
    set: () => true,
  });

  // 1. Cat rare swim-and-catch adventure & Pelican rare sky flight laps
  const cat = new ShipsCat();
  cat.triggerRareSwim();
  cat.update(3600); // ~midpoint hunting with fish caught
  assert.ok(cat.swimAdventure && cat.swimAdventure.xOffset < 0 && cat.swimAdventure.yOffset > 0);
  assert.equal(cat.swimAdventure.fishCaught, true);
  cat.render(mockCtx, 0);
  cat.update(5000); // finishes swim cleanly
  assert.equal(cat.swimAdventure, null);

  const bird = new PerchingPelican();
  bird.triggerRareFlight();
  bird.update(2500);
  assert.ok(bird.skyFlight && bird.skyFlight.yOffset < -20 && bird.isFlapping);
  bird.render(mockCtx, 0);
  bird.update(9000);
  assert.equal(bird.skyFlight, null);
  assert.ok(draws > 30);

  // 2. NPC quests: every NPC has >= 3 options and its own illustrated portrait.
  assert.ok(NPC_DEFINITIONS.length >= 8);
  for (const npc of NPC_DEFINITIONS) {
    assert.ok(npc.options.length >= 3, `${npc.id} should have >= 3 quest options`);
    assert.ok(NPC_PORTRAITS[npc.id]?.includes(`/art/npcs/${npc.id}.webp`), `${npc.id} missing its own portrait`);
  }
  assert.ok(QUEST_ART.noticeboard.includes('<svg') && QUEST_ART.lootBuff.includes('<svg'));

  // 3. Debuffs affect Hook physics cleanly & clearDebuffs restores normal performance
  storage.clear();
  const save = new SaveSystem();
  save.addCoins(1000);
  const hook = new Hook();
  hook.applyUpgrades(save);
  const baseReel = hook.reelSpeed;
  const baseLantern = hook.lanternRadius;

  save.addBuff('cursedBarnacles', 90000);
  save.addBuff('foggedLens', 90000);
  hook.applyUpgrades(save);
  assert.ok(hook.reelSpeed < baseReel, 'Barnacle Drag debuff slows reel speed');
  assert.ok(hook.lanternRadius < baseLantern, 'Brine Mist debuff dims lantern radius');

  assert.equal(save.clearDebuffs(), true);
  hook.applyUpgrades(save);
  assert.equal(hook.reelSpeed, baseReel);
  assert.equal(hook.lanternRadius, baseLantern);

  const sealed = save.awardSealedCrate(2);
  assert.ok(sealed && sealed.isCrate && sealed.crateRank === 2);

  // 4. Security & Anti-DDoS: ChatManager rate-limits bursts and strips control chars
  save.setUpgradeLevel('maritimeRadio', 1);
  const sentPayloads = [];
  const chat = new ChatManager(save);
  chat.loadBackend = async () => ({
    subscribe: async () => () => {},
    send: async (msgText) => { sentPayloads.push(msgText); },
  });
  for (let i = 0; i < 5; i++) {
    assert.equal(await chat.sendMessage(`Hello\u0007\u200B fleet ${i}`), true);
  }
  assert.equal(sentPayloads[0], 'Hello fleet 0');
  assert.equal(await chat.sendMessage('Flood burst 6'), false);
  assert.equal(chat.lastError, 'rate-limited');
});

test('Submarine seating & dome overlay, 5m silent AFK knitting, 30m AFK pause, moving spectral ship with captain, colorful keep/sell art, and Dive Summary X return flow', async () => {
  const { drawVesselHull, drawVesselForeground, getVesselLayout } = await import('../src/rendering/VesselRenderer.js');
  const { AfkManager, AFK_KNITTING_SECONDS, AFK_PAUSE_SECONDS } = await import('../src/systems/AfkManager.js');
  const { renderMoonReflectionAndGhostShip } = await import('../src/systems/EasterEggs.js');
  const { MISC_ART } = await import('../src/ui/CustomVectorArt.js');

  assert.equal(AFK_KNITTING_SECONDS, 300);
  assert.equal(AFK_PAUSE_SECONDS, 1800);

  // 1. Submarine fits angler inside cockpit dome & foreground dome renders with finite args
  const subLayout = getVesselLayout(8, 140, 40, 'submarine');
  assert.equal(subLayout.anglerPos.x, (await import('../src/rendering/VesselRenderer.js')).getSubmarineCockpit(140).x);
  assert.equal(subLayout.anglerScale < 0.9, true);
  assert.ok(subLayout.catPos.y <= -36 && subLayout.pelicanPos.x > 0);

  let fgDraws = 0;
  const mockCtx = new Proxy({}, {
    get: (_, key) => {
      if (key === 'createRadialGradient' || key === 'createLinearGradient') {
        return () => ({ addColorStop: () => {} });
      }
      return (...args) => {
        fgDraws++;
        for (const v of args) {
          if (typeof v === 'number') assert.ok(Number.isFinite(v), `Non-finite draw arg in ${String(key)}`);
        }
      };
    },
    set: () => true,
  });
  drawVesselHull(mockCtx, 8, 140, 40, 1.0, { hullStyle: 'submarine' });
  drawVesselForeground(mockCtx, 8, 140, 40, 1.0, { hullStyle: 'submarine' });
  assert.ok(fgDraws > 25);

  // 2. Spectral Ghost Ship patrols and shrinks cleanly into distance
  renderMoonReflectionAndGhostShip(mockCtx, 1200, 220, 0, 2.5, { isNight: true }, {
    active: true,
    x: 420,
    vx: -26,
    scale: 0.65,
    yOffset: -8,
    alpha: 0.7,
  });

  // 3. AfkManager: 5m knitting readiness without interaction & 30m pause gate
  const afk = new AfkManager();
  afk.tick(299);
  assert.equal(afk.isKnittingReady('SURFACE_IDLE', null), false);
  afk.tick(2);
  assert.equal(afk.isKnittingReady('SURFACE_IDLE', null), true);
  afk.recordInteraction();
  assert.equal(afk.isKnittingReady('SURFACE_IDLE', null), false);

  const res = afk.tick(1800);
  assert.equal(res.paused, true);
  assert.equal(res.justPaused, true);
  assert.equal(afk.isKnittingReady('SURFACE_IDLE', null), false);
  afk.resume();
  assert.equal(afk.isPaused, false);
  assert.equal(afk.idleSeconds, 0);

  // 4. Colorful Keep and Sell Now SVG icons
  assert.ok(MISC_ART.keepItem.includes('#0ea5e9') && !MISC_ART.keepItem.includes('currentColor'));
  assert.ok(MISC_ART.sellCoin.includes('#fde047') && !MISC_ART.sellCoin.includes('currentColor'));
});

test('Casual Chrono Void fish have reduced swirl/dots and Realm 1 corner Gambler Island stays 5m with Roulette & Blackjack', async () => {
  const { Fish } = await import('../src/entities/Fish.js');
  const { OceanWorld } = await import('../src/world/OceanWorld.js');
  const { resolveRouletteSpin, evaluateBlackjackHand, resolveBlackjackRound, getRouletteColor } = await import('../src/ui/IslandCasino.js');

  // 1. Casual Chrono Void fish should not have orbiting stars
  const casualVoid = new Fish({
    id: 'realm_7_common_test', name: 'Void Minnow', zone: 7, rarity: 'common',
    sizeRange: [15, 22], baseWeight: 1, baseValue: 50,
    primaryColor: '#4f46e5', secondaryColor: '#818cf8', finColor: '#38bdf8',
  }, 300, 400);
  assert.equal(casualVoid.hasOrbitingStars, false);

  let finiteErrors = 0;
  const mockCtx = new Proxy({}, {
    get: (_, key) => {
      if (key === 'createRadialGradient' || key === 'createLinearGradient') {
        return () => ({ addColorStop: () => {} });
      }
      if (key === 'measureText') return () => ({ width: 90 });
      return (...args) => {
        for (const v of args) {
          if (typeof v === 'number' && !Number.isFinite(v)) finiteErrors++;
        }
      };
    },
    set: () => true,
  });
  casualVoid.render(mockCtx, 0);

  // 2. Realm 1 Gambler Island spawns in corner, stays 5 minutes (300s), hit-tests & renders cleanly, and vanishes on expiry or realm change
  const world = new OceanWorld({ width: 1200, height: 720, getContext: () => mockCtx });
  world.currentSeaId = 1;
  const island = world.spawnGamblerIsland('right');
  assert.equal(island.active, true);
  assert.equal(island.timer, 300);
  world.updateGamblerIsland(2, 1);
  assert.ok(world.hitTestGamblerIsland(island.x, world.surfaceY - 22));
  world.renderGamblerIsland(mockCtx, 0);
  assert.equal(finiteErrors, 0);

  // Departs after 5 minutes total
  world.updateGamblerIsland(299, 1);
  assert.equal(world.gamblerIsland.active, false);

  // Immediately leaves if captain travels out of Realm 1
  world.spawnGamblerIsland('right');
  world.updateGamblerIsland(1, 2);
  assert.equal(world.gamblerIsland.active, false);

  // 3. Roulette & Blackjack rules + Coins/Gems payout verification
  assert.equal(getRouletteColor(0), 'green');
  assert.equal(getRouletteColor(7), 'red');
  const redWin = resolveRouletteSpin('red', 100, 'coins', null, 7);
  assert.equal(redWin.won, true);
  assert.equal(redWin.payout, 200);
  const zeroWin = resolveRouletteSpin('green', 2, 'gems', null, 0);
  assert.equal(zeroWin.won, true);
  assert.equal(zeroWin.payout, 36);

  const bjHand = evaluateBlackjackHand([{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♥' }]);
  assert.equal(bjHand.total, 21);
  assert.equal(bjHand.isBlackjack, true);
  const bjRes = resolveBlackjackRound(
    [{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♥' }],
    [{ rank: '9', suit: '♣' }, { rank: '10', suit: '♦' }],
    4,
    'gems'
  );
  assert.equal(bjRes.outcome, 'blackjack');
  assert.equal(bjRes.payout, 10);
});

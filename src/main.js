import './style.css';
import { GameLoop } from './GameLoop.js';
import { soundManager } from './audio/SoundManager.js';
import { saveSystem } from './systems/SaveSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { Hook } from './entities/Hook.js';
import { OceanWorld } from './world/OceanWorld.js';
import { UIManager } from './ui/UIManager.js';
import { UPGRADE_DEFINITIONS } from './data/UpgradesData.js';
import { TrapSystem } from './systems/TrapSystem.js';
import { checkRandomPetEncounter } from './data/PetsData.js';
import { QuestSystem } from './systems/QuestSystem.js';
import { NPCSystem } from './systems/NPCSystem.js';
import { MinimapUI } from './ui/MinimapUI.js';
import { ZoneManager } from './systems/ZoneManager.js';
import { worldCycle } from './systems/WorldCycle.js';
import { ChatManager } from './systems/ChatManager.js';
import { leaderboardManager } from './systems/LeaderboardManager.js';
import { accountManager } from './systems/AccountManager.js';
import { GemShop } from './ui/GemShop.js';

// Setup canvas and rendering context
const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');

let dpr = Math.min(window.devicePixelRatio || 1, 2);
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

let oceanWorld = null;
let uiManager = null;
let zoneManager = null;

function handleResize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;

  canvas.width = screenWidth * dpr;
  canvas.height = screenHeight * dpr;
  canvas.style.width = `${screenWidth}px`;
  canvas.style.height = `${screenHeight}px`;

  if (oceanWorld) {
    oceanWorld.resize(screenWidth, screenHeight);
  }
}

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
  setTimeout(handleResize, 150);
});

// Core systems
const save = saveSystem;
save.load();

// Publish changed public scores at most once a minute during normal play.
// Local saving remains independent of the network.
const syncLeaderboard = () => leaderboardManager.sync(save).catch(() => {});
setInterval(syncLeaderboard, 60000);
setInterval(() => accountManager.syncCloudSave(), 30000);
window.addEventListener('online', () => accountManager.syncCloudSave());
document.addEventListener('visibilitychange', () => { if (document.hidden) accountManager.syncCloudSave(); });
window.addEventListener('online', syncLeaderboard);
syncLeaderboard();

const trapSystem = new TrapSystem(save);
const particles = new ParticleSystem();
const hook = new Hook();

// Off-tab title alert & chime system
const originalTitle = document.title || 'Starlight Fishing';
let titleNotificationInterval = null;

function notifyTitle(msg) {
  if (!document.hidden) return;
  if (titleNotificationInterval) clearInterval(titleNotificationInterval);
  let toggle = false;
  titleNotificationInterval = setInterval(() => {
    if (!document.hidden) {
      clearInterval(titleNotificationInterval);
      titleNotificationInterval = null;
      document.title = originalTitle;
      return;
    }
    document.title = toggle ? msg : originalTitle;
    toggle = !toggle;
  }, 1000);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    if (titleNotificationInterval) {
      clearInterval(titleNotificationInterval);
      titleNotificationInterval = null;
    }
    document.title = originalTitle;
  }
});

let chatManager = null;

function notifyRareCatch(fish) {
  const name = typeof fish === 'string' ? fish : fish?.name || 'Rare Fish';
  soundManager.playRareChime();
  notifyTitle(`🌟 Rare Catch: ${name}!`);

}

trapSystem.onTrapFull = () => {
  if (trapSystem.getTrapCount() <= 0) return;
  soundManager.playRareChime();
  notifyTitle('🪤 Seabed Traps Full!');
  if (uiManager) {
    uiManager.showToast('🪤 Your seabed drift pots are full and ready to harvest!');
  }
};

// Game State Machine:
// 'SURFACE_IDLE' -> 'AIMING' -> 'CASTING' -> 'DESCENDING' -> 'REELING' -> 'CATCH_SUMMARY'
let gameState = 'SURFACE_IDLE';

// Camera tracking
let cameraY = 0;
let targetCameraY = 0;

// Input tracking
const mousePos = { x: screenWidth * 0.5, y: screenHeight * 0.5 };
let isMouseDown = false;
const keysDown = {};
let lastSteerMode = 'none'; // 'keyboard' | 'mouse'
const lastPointerPos = { x: 0, y: 0 };

// Core quest system
const questSystem = new QuestSystem(save);

// Initialize entities and managers
oceanWorld = new OceanWorld(canvas);
oceanWorld.setTrapSystem(trapSystem);
oceanWorld.setSaveSystem(save);
handleResize();

uiManager = new UIManager(save, triggerCast, startDive, trapSystem, questSystem);
save.gemShop = new GemShop(save, uiManager);
chatManager = new ChatManager(save);
uiManager.setChatManager(chatManager);

// Handle Stripe Checkout return pipeline
try {
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutStatus = urlParams.get('checkout');
  if (checkoutStatus === 'success') {
    uiManager.showToast('🎉 Gem bundle purchased successfully! Your balance has been updated.');
    soundManager.playUpgrade();
    urlParams.delete('checkout');
    urlParams.delete('session_id');
    const cleanSearch = urlParams.toString();
    const newUrl = window.location.pathname + (cleanSearch ? '?' + cleanSearch : '') + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
  } else if (checkoutStatus === 'cancelled') {
    uiManager.showToast('Checkout cancelled. No gems were purchased.');
    urlParams.delete('checkout');
    const cleanSearch = urlParams.toString();
    const newUrl = window.location.pathname + (cleanSearch ? '?' + cleanSearch : '') + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
  }
} catch (e) {
  console.warn('Checkout return param handling error:', e);
}

questSystem.onQuestCompleted = (q) => {
  uiManager.showToast(`📋 Noticeboard Mission Complete: ${q.title}! Claim your reward!`);
};

// Atmospheric NPC System & Multi-Zone Exploration System
const npcSystem = new NPCSystem(save, soundManager, uiManager);

// Initialize ZoneManager driving dynamic visual architecture and zone mechanics
zoneManager = new ZoneManager(save, oceanWorld, uiManager);
oceanWorld.setZoneManager(zoneManager);
uiManager.setZoneManager(zoneManager);

const minimapUI = new MinimapUI(save, soundManager, uiManager, oceanWorld, zoneManager);
uiManager.setMinimapUI(minimapUI);
uiManager.onAccountSwitched = () => {
  save.save();
  accountManager.syncCloudSave();
  syncLeaderboard();
  hook.applyUpgrades(save);
  oceanWorld.setCurrentSea(save.getCurrentSea ? save.getCurrentSea() : 1);
  oceanWorld.populateWorld(save);
  zoneManager.setZone(save.data.currentZone || 'sunken_shallows');
  soundManager.setSeaTrack(save.getCurrentSea());
};

uiManager.onUpgradePurchased = () => {
  hook.applyUpgrades(save);
  if (['SURFACE_IDLE', 'AIMING'].includes(gameState)) {
    oceanWorld.populateWorld(save);
    hook.reset(oceanWorld.rodTip.x, oceanWorld.rodTip.y);
    cameraY = 0;
    gameState = 'SURFACE_IDLE';
  }
};

uiManager.onModalClosed = () => {
  isMouseDown = false;
  if (gameState === 'AIMING') {
    gameState = 'SURFACE_IDLE';
  }
};

minimapUI.onSailToSea = (sea) => {
  oceanWorld.populateWorld(save);
  soundManager.setSeaTrack(sea.id);
  uiManager.updateHUD(hook, gameState);
};

uiManager.onManualReel = () => {
  if (gameState === 'DESCENDING' || hook.state === 'DESCENDING') {
    hook.startReel();
    particles.addFloatingText('REELING UP!', hook.x, hook.y - 25, '#38bdf8', 16);
  }
};

// Initialize world cycle from persistent save
if (worldCycle && typeof worldCycle.deserialize === 'function') {
  worldCycle.deserialize({ timer: save.data.worldTime, weather: save.data.currentWeather });
}

// Initialize current zone soundscape
soundManager.setSeaTrack(save.getCurrentSea());

hook.applyUpgrades(save);
hook.reset(oceanWorld.rodTip.x, oceanWorld.rodTip.y);

// Populate ocean life across current zone
oceanWorld.populateWorld(save);

// Input handlers
function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  let clientX = 0;
  let clientY = 0;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX || 0;
    clientY = e.clientY || 0;
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function handlePointerDown(e) {
  // If user clicks while modal is actively visible, ignore
  const overlay = document.getElementById('modal-overlay');
  if (uiManager.activeModal && overlay && overlay.classList.contains('modal-overlay-visible')) {
    return;
  }
  // Clear any stale activeModal state
  if (!overlay || !overlay.classList.contains('modal-overlay-visible')) {
    uiManager.activeModal = null;
  }

  // Initialize audio on user gesture
  soundManager.ensureAudio();

  const coords = getCanvasCoords(e);
  mousePos.x = coords.x;
  mousePos.y = coords.y;
  isMouseDown = true;

  if (gameState === 'SURFACE_IDLE') {
    // 1. Check if user clicked a floating drift item (bottle / driftwood)
    if (oceanWorld.driftItems) {
      const picked = oceanWorld.driftItems.checkPickup(mousePos.x, mousePos.y + cameraY);
      if (picked) {
        if (picked.type === 'bottle') {
          soundManager.playBottlePickup();
          uiManager.showBottleMessage(picked.message);
          return;
        } else if (picked.type === 'driftwood') {
          soundManager.playBottlePickup();
          const bobber = picked.data.bobber;
          if (!save.data.unlockedBobbers) save.data.unlockedBobbers = [];
          if (!save.data.unlockedBobbers.includes(bobber.id)) {
            save.data.unlockedBobbers.push(bobber.id);
            save.save();
          }
          uiManager.showToast(`🪵 Salvaged Driftwood! Carved new bobber: ${bobber.name} (${bobber.description})`);
          return;
        }
      }
    }

    // 2. Check if user clicked boat companions (Cat or Pelican)
    const vessel = save.getUpgradeLevel('boatVessel') || 0;
    const dx = mousePos.x - oceanWorld.boat.x;
    const dy = (mousePos.y + cameraY) - oceanWorld.boat.y;
    const boatAngle = oceanWorld.boat.angle || 0;
    const cos = Math.cos(-boatAngle);
    const sin = Math.sin(-boatAngle);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    // Check Cat (only if player has unlocked this companion)
    if (save.isPetEquipped('cat') && oceanWorld.shipsCat && oceanWorld.shipsCat.hitTest(localX, localY, vessel)) {
      if (oceanWorld.shipsCat.hasMorningGift) {
        const gift = oceanWorld.shipsCat.collectGift();
        if (gift) {
          save.data.coins += gift.value;
          save.save();
          soundManager.playCoin();
          uiManager.showToast(`🐱 Angela the Cat gifted you: ${gift.icon} ${gift.name} (+${gift.value} coins)!`);
          return;
        }
      }
      oceanWorld.shipsCat.onClick(soundManager);
      if (questSystem) questSystem.dispatch({ type: 'pet_companion', pet: 'cat' });
      particles.addFloatingText('Purr... ♪', oceanWorld.boat.x - 20, oceanWorld.boat.y - 30, '#f59e0b', 16);
      uiManager.showToast("🐱 Angela the Cat purrs cozily as you stroke her warm fur.");
      return;
    }

    // Check Pelican (only if player has unlocked this companion)
    if (save.isPetEquipped('pelican') && oceanWorld.pelican && oceanWorld.pelican.hitTest(localX, localY, vessel)) {
      oceanWorld.pelican.feedFish();
      if (questSystem) questSystem.dispatch({ type: 'pet_companion', pet: 'pelican' });
      soundManager.playPelicanChirp();
      particles.addFloatingText('Chirp! 🦤', oceanWorld.boat.x + 50, oceanWorld.boat.y - 30, '#38bdf8', 16);
      uiManager.showToast(`🦤 Fed Evan the Bird! Trust: ${oceanWorld.pelican.trust}%`);
      return;
    }

    gameState = 'AIMING';
    const aimDx = mousePos.x - oceanWorld.boat.x;
    oceanWorld.setAimDirection(aimDx < 0 ? -1 : 1);
  } else if (gameState === 'DESCENDING' || gameState === 'REELING') {
    isMouseDown = true;
    hook.setTargetX(mousePos.x);
  }
}

function handlePointerMove(e) {
  const coords = getCanvasCoords(e);
  const deltaMove = Math.hypot(coords.x - lastPointerPos.x, coords.y - lastPointerPos.y);
  if (deltaMove > 3) {
    lastPointerPos.x = coords.x;
    lastPointerPos.y = coords.y;
    lastSteerMode = 'mouse';
  }
  mousePos.x = coords.x;
  mousePos.y = coords.y;

  // Auto-recover if mouseup was released outside browser or over modal
  if (e.buttons === 0 && isMouseDown && !e.touches) {
    if (gameState === 'AIMING') {
      triggerCast();
    }
    isMouseDown = false;
  }

  if (gameState === 'SURFACE_IDLE' || gameState === 'AIMING') {
    // Companion hover detection for floating name badges
    const vessel = save.getUpgradeLevel('boatHull') || 1;
    const dy = (mousePos.y + cameraY) - oceanWorld.boat.y;
    const dx = mousePos.x - oceanWorld.boat.x;
    const boatAngle = oceanWorld.boat.angle || 0;
    const cos = Math.cos(-boatAngle);
    const sin = Math.sin(-boatAngle);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    if (save.isPetEquipped('cat') && oceanWorld.shipsCat && oceanWorld.shipsCat.hitTest(localX, localY, vessel)) {
      oceanWorld.hoveredCompanion = 'angela';
      if (oceanWorld.dolphin) oceanWorld.dolphin.isHovered = false;
    } else if (save.isPetEquipped('pelican') && oceanWorld.pelican && oceanWorld.pelican.hitTest(localX, localY, vessel)) {
      oceanWorld.hoveredCompanion = 'evan';
      if (oceanWorld.dolphin) oceanWorld.dolphin.isHovered = false;
    } else if (save.isPetEquipped('dolphin') && oceanWorld.dolphin && oceanWorld.dolphin.checkHover(mousePos.x, mousePos.y, cameraY)) {
      oceanWorld.hoveredCompanion = 'dolphin';
    } else {
      oceanWorld.hoveredCompanion = null;
      if (oceanWorld.dolphin) oceanWorld.dolphin.isHovered = false;
    }

    // Dynamically update fisherman orientation (left or right side of boat)
    oceanWorld.setAimDirection(dx < 0 ? -1 : 1);
  } else if (gameState === 'DESCENDING' || gameState === 'REELING') {
    oceanWorld.hoveredCompanion = null;
    if (oceanWorld.dolphin) oceanWorld.dolphin.isHovered = false;
    // Only steer hook to mouse if the mouse is actively being moved
    if (lastSteerMode === 'mouse') {
      hook.setTargetX(mousePos.x);
    }
  }
}

function handlePointerUp(e) {
  if (e) {
    const coords = getCanvasCoords(e);
    mousePos.x = coords.x;
    mousePos.y = coords.y;
  }
  if (gameState === 'AIMING') {
    triggerCast();
  }
  isMouseDown = false;
}

// Mouse events
canvas.addEventListener('mousedown', handlePointerDown);
window.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerUp);

// Touch events for mobile/tablet
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handlePointerDown(e);
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  const overlay = document.getElementById('modal-overlay');
  const isModalOpen = uiManager && uiManager.activeModal && overlay && overlay.classList.contains('modal-overlay-visible');
  const welcomePopup = document.getElementById('welcome-popup');
  const isWelcomeOpen = welcomePopup && !welcomePopup.classList.contains('welcome-overlay-hidden') && welcomePopup.style.display !== 'none';

  if (!isModalOpen && !isWelcomeOpen) {
    if (e.cancelable) e.preventDefault();
  }
  handlePointerMove(e);
}, { passive: false });

window.addEventListener('touchend', (e) => {
  handlePointerUp(e);
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keysDown[k] = true;
  if (['arrowleft', 'arrowright', 'a', 'd'].includes(k)) {
    lastSteerMode = 'keyboard';
  }
  if (e.key === ' ' && gameState === 'DESCENDING') {
    hook.startReel();
  }
});

window.addEventListener('keyup', (e) => {
  keysDown[e.key.toLowerCase()] = false;
});

function triggerCast() {
  if (gameState !== 'AIMING') return;

  const rodX = oceanWorld.rodTip.x;
  const rodY = oceanWorld.rodTip.y;

  let dx = mousePos.x - rodX;
  let dy = (mousePos.y + cameraY) - rodY;

  const dir = dx < 0 ? -1 : 1;
  oceanWorld.setAimDirection(dir);

  const dist = Math.sqrt(dx * dx + dy * dy);
  const minPower = 120;
  const maxPower = 340;
  const rodTier = UPGRADE_DEFINITIONS.fishingRod.tiers[save.getUpgradeLevel('fishingRod')] || UPGRADE_DEFINITIONS.fishingRod.tiers[0];

  const power = Math.min(maxPower * rodTier.castRange, Math.max(minPower, dist * 1.35));
  const angle = Math.atan2(Math.max(-50, dy), Math.abs(dx));

  const vx = dir * Math.cos(angle) * power;
  const vy = Math.sin(angle) * power - 45;

  hook.applyUpgrades(save);
  hook.cast(oceanWorld.rodTip.x, oceanWorld.rodTip.y, vx, vy);
  gameState = 'CASTING';
}

function startDive() {
  cameraY = 0;
  oceanWorld.populateWorld(save);
  hook.applyUpgrades(save);
  hook.reset(oceanWorld.rodTip.x, oceanWorld.rodTip.y);
  gameState = 'SURFACE_IDLE';

  // Offer occasional harbor encounters after resurfacing.
  npcSystem.checkRandomEncounter('catch');
}

let surfaceIdleTimer = 0;
let aquariumAutosaveTimer = 0;

// Fixed-step Update Logic (60fps)
const update = (dt) => {
  const deltaSec = dt / 1000;

  // Accumulate aquarium tips strictly while actively playing the game
  save.updateAquariumPlaytime?.(deltaSec);
  aquariumAutosaveTimer += deltaSec;
  if (aquariumAutosaveTimer >= 30) {
    aquariumAutosaveTimer = 0;
    if (save.hasAquarium?.()) {
      save.save();
    }
  }

  // Update NPC director cooldowns
  npcSystem.update(dt);

  // Track surface playtime to reward long cozy sessions with pet visits or wandering traders
  if (gameState === 'SURFACE_IDLE') {
    surfaceIdleTimer += deltaSec;
    if (surfaceIdleTimer >= 90) {
      surfaceIdleTimer = 0;
      if (!npcSystem.checkRandomEncounter('travel')) {
        checkRandomPetEncounter(save, particles, oceanWorld, uiManager, soundManager);
      }
    }
  } else {
    surfaceIdleTimer = 0;
  }

  // Keyboard steering (arrow keys take precedence over stationary mouse)
  const isArrowLeft = keysDown['a'] || keysDown['arrowleft'];
  const isArrowRight = keysDown['d'] || keysDown['arrowright'];

  if (isArrowLeft || isArrowRight) {
    lastSteerMode = 'keyboard';
  }

  if (gameState === 'DESCENDING' || gameState === 'REELING') {
    if (isArrowLeft) {
      hook.steer(-1, deltaSec);
    }
    if (isArrowRight) {
      hook.steer(1, deltaSec);
    }
    if (lastSteerMode === 'keyboard') {
      hook.targetX = hook.x;
    }
  }

  const isReelingInput = isMouseDown || !!keysDown[' '] || !!keysDown['arrowup'] || !!keysDown['w'];

  // Update world environment
  oceanWorld.update(dt, hook, particles);

  // Update Zone-Specific Environmental Mechanics (Mangrove snags, Abyssal pressure bursts, Caldera heat)
  if (zoneManager) {
    zoneManager.update(dt, hook, gameState, isReelingInput);
  }

  // Update Hook
  if (gameState !== 'SURFACE_IDLE' && gameState !== 'AIMING') {
    hook.rodTip = oceanWorld.rodTip;
    hook.update(dt, oceanWorld.surfaceY, screenWidth, particles, isReelingInput, zoneManager);

    // Transition: entering water
    if (gameState === 'CASTING' && hook.state === 'DESCENDING') {
      gameState = 'DESCENDING';
      soundManager.setMusicMode('underwater');

      // Check interactive surface hotspot strike
      if (oceanWorld.hotspotManager) {
        const hit = oceanWorld.hotspotManager.checkHit(hook.x, oceanWorld.surfaceY);
        if (hit) {
          hook.biteTimer = 0;
          hook.hasBitten = true;
          soundManager.playRareChime();
          if (particles) {
            particles.emitSparkles(hook.x, oceanWorld.surfaceY, 28, hit.isSunkenSafe ? '#fbbf24' : '#38bdf8');
            particles.addFloatingText(
              hit.isSunkenSafe ? '🪙 SUNKEN SAFE STRIKE! 0s BITE!' : '✨ HOTSPOT STRIKE! INSTANT BITE!',
              hook.x,
              oceanWorld.surfaceY - 30,
              hit.isSunkenSafe ? '#fbbf24' : '#38bdf8',
              18
            );
            particles.addTrauma(0.3);
          }

          if (hit.isSunkenSafe && hook.caughtItems.length < hook.capacity) {
            const safeItem = {
              id: 'sunken_safe_' + Date.now(),
              speciesId: 'sunken_safe',
              name: 'Sunken Iron Safe',
              rarity: 'rare',
              rarityColor: '#38bdf8',
              rarityGlow: '#7dd3fc',
              baseValue: 180,
              value: 180,
              size: 45,
              weight: 18.5,
              scale: 1.2,
              isSunkenSafe: true,
              itemType: 'relic',
              category: 'relic',
              unlocked: false,
              hookTo: (h, idx) => {
                safeItem.hook = h;
                safeItem.hookIndex = idx;
              },
              render: (ctx, camY) => {
                ctx.save();
                ctx.translate(safeItem.x, safeItem.y - camY);
                ctx.font = '24px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🔒', 0, 0);
                ctx.restore();
              }
            };
            hook.addCatch(safeItem, particles);
          }
        }
      }
    }

    // Hook reached max depth or began reeling
    if (gameState === 'DESCENDING' && hook.state === 'REELING') {
      gameState = 'REELING';
    }

    // Surfaced
    if (gameState === 'REELING' && hook.state === 'SURFACED') {
      gameState = 'CATCH_SUMMARY';
      soundManager.setMusicMode('surface');
      checkRandomPetEncounter(save, particles, oceanWorld, uiManager, soundManager);

      // Save atmospheric cycle to persistent save
      if (worldCycle && typeof worldCycle.serialize === 'function') {
        const cycleState = worldCycle.serialize();
        save.data.worldTime = cycleState.timer;
        save.data.currentWeather = cycleState.weather;
        save.save();
      }

      // Record items to journal, stats, achievements, and persistent inventory!
      let ranOutOfStorage = false;
      hook.caughtItems.forEach((item) => {
        if (!item._recordedInInventory) {
          save.recordCatchItem(item);
          if (item.species) questSystem?.dispatch({ type: 'catch_fish', fish: item });
          else if (item.isCrate || item.category === 'crate') questSystem?.dispatch({ type: 'catch_crate', item });
          else if (item.isTreasure || item.category === 'fossil') questSystem?.dispatch({ type: 'catch_treasure', item });
          item.inventoryRef = save.addItemToInventory(item);
          if (!item.inventoryRef) {
            ranOutOfStorage = true;
          }
          item._recordedInInventory = true;
        }
      });

      if (ranOutOfStorage) {
        uiManager.showToast('⚠️ You ran out of storage and need to sell items!');
      }

      if (hook.caughtItems.length >= hook.capacity) {
        save.recordFullHaul();
      }
      save.recordDiveStats({
        maxDepth: hook.maxDepthReachedThisDive,
        tookDamage: hook.tookDamage,
      });

      if (questSystem) {
        questSystem.dispatch({
          type: 'dive_completed',
          maxDepth: hook.maxDepthReachedThisDive,
          catchesCount: hook.caughtItems.length,
          isFull: hook.caughtItems.length >= hook.capacity,
          tookDamage: hook.tookDamage,
        });
      }

      const unpickedSafe = hook.caughtItems.find(i => i.isSunkenSafe && !i.unlocked);
      const showSummary = () => uiManager.openCatchSummary(hook, () => startDive(), ranOutOfStorage);
      if (unpickedSafe) uiManager.openLockpickMinigame(unpickedSafe, showSummary);
      else showSummary();

    }

    // Continuous swept-line collision helper to prevent high-speed tunneling
    const distToSegment = (px, py, x1, y1, x2, y2) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) return Math.hypot(px - x1, py - y1);
      const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
      const projX = x1 + t * dx;
      const projY = y1 + t * dy;
      return Math.hypot(px - projX, py - projY);
    };

    // Collision detection: Hook vs Fish (active during both descent and reeling!)
    const hookRadius = 36;
    const canCatch = hook.caughtItems.length < hook.capacity;

    if (canCatch && (gameState === 'REELING' || gameState === 'DESCENDING' || hook.state === 'REELING' || hook.state === 'DESCENDING')) {
      const prevX = typeof hook.prevX === 'number' ? hook.prevX : hook.x;
      const prevY = typeof hook.prevY === 'number' ? hook.prevY : hook.y;

      for (let i = oceanWorld.entities.fish.length - 1; i >= 0; i--) {
        const fish = oceanWorld.entities.fish[i];
        if (fish.state !== 'SWIMMING') continue;

        const dist = distToSegment(fish.x, fish.y, prevX, prevY, hook.x, hook.y);

        if (dist < hookRadius + fish.radius) {
          const hooked = hook.addCatch(fish, particles);
          if (hooked) {
            oceanWorld.entities.fish.splice(i, 1);

            if (fish.rarity === 'rare' || fish.rarity === 'epic' || fish.rarity === 'legendary' || fish.isMythic) {
              notifyRareCatch(fish);
            }
          }
          if (hook.caughtItems.length >= hook.capacity) break;
        }
      }

      // Collision detection: Hook vs Treasures and Fossils
      for (let i = oceanWorld.entities.treasures.length - 1; i >= 0; i--) {
        const tr = oceanWorld.entities.treasures[i];
        if (tr.state !== 'IDLE') continue;

        const dist = distToSegment(tr.x, tr.y, prevX, prevY, hook.x, hook.y);

        // Magnetic sonar attractor if upgraded
        if (hook.sonarLevel === 'MagnetSonar' && dist < 85) {
          tr.x += (hook.x - tr.x) * 4.5 * deltaSec;
          tr.y += (hook.y - tr.y) * 4.5 * deltaSec;
        }

        if (dist < hookRadius + tr.radius) {
          const hooked = hook.addCatch(tr, particles);
          if (hooked) {
            soundManager.playTreasure();
            oceanWorld.entities.treasures.splice(i, 1);

          }
          if (hook.caughtItems.length >= hook.capacity) break;
        }
      }

      // Collision detection: Hook vs Sunken Archaeological Relics
      if (oceanWorld.entities.relics) {
        for (let i = oceanWorld.entities.relics.length - 1; i >= 0; i--) {
          const relic = oceanWorld.entities.relics[i];
          if (relic.state !== 'IDLE') continue;

          const dist = distToSegment(relic.x, relic.y, prevX, prevY, hook.x, hook.y);

          if (hook.sonarLevel === 'MagnetSonar' && dist < 85) {
            relic.x += (hook.x - relic.x) * 4.5 * deltaSec;
            relic.y += (hook.y - relic.y) * 4.5 * deltaSec;
          }

          if (dist < hookRadius + relic.radius) {
            const hooked = hook.addCatch(relic, particles);
            if (hooked) {
              soundManager.playTreasure();
              oceanWorld.entities.relics.splice(i, 1);
            }
            if (hook.caughtItems.length >= hook.capacity) break;
          }
        }
      }
    }

    // Collision detection: Hook vs Hazards
    if (gameState === 'DESCENDING' || gameState === 'REELING') {
      for (const haz of oceanWorld.entities.hazards) {
        const dx = haz.x - hook.x;
        const dy = haz.y - hook.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < hookRadius + haz.radius && !(hook.hazardCooldown > 0)) {
          hook.takeHazardHit(haz, particles);
          // Deflect hazard away to prevent rapid repeated hits
          haz.y += 45;
          break;
        }
      }
    }
  } else {
    // Keep hook resting at rod tip on surface
    hook.x = oceanWorld.rodTip.x;
    hook.y = oceanWorld.rodTip.y + 12;
    hook.rodTip = oceanWorld.rodTip;
    hook.updateCaughtItems(dt, screenWidth);
  }

  // Handle pelican delivery or drift items from companions
  if (oceanWorld.pendingBottleMessage) {
    const msg = oceanWorld.pendingBottleMessage;
    oceanWorld.pendingBottleMessage = null;
    if (msg.type === 'pelican_retrieve') {
      save.data.coins += msg.value;
      save.save();
      uiManager.showToast(`🦤 Evan the Bird dove into the surf and brought you +$${msg.value} in coins!`);
      soundManager.playCoin();
    }
  }

  // Update particles
  particles.update(dt, oceanWorld.surfaceY);

  // Camera vertical dampening
  if (gameState === 'SURFACE_IDLE' || gameState === 'AIMING') {
    targetCameraY = 0;
  } else if (gameState === 'REELING') {
    // Keep hook lower on screen (~84% down) so player has a wide view of hazards and fish above
    const verticalOffset = screenHeight * 0.84;
    targetCameraY = Math.max(0, hook.y - verticalOffset);
  } else {
    // CASTING or DESCENDING: Keep hook at ~38% down so player can see deeper waters below
    const verticalOffset = screenHeight * 0.38;
    targetCameraY = Math.max(0, hook.y - verticalOffset);
  }
  cameraY += (targetCameraY - cameraY) * 7.5 * deltaSec;

  // Update HUD
  uiManager.updateHUD(hook, gameState);
};

// Render Logic
const render = () => {
  ctx.save();
  ctx.scale(dpr, dpr);

  // Apply screen shake
  const shakeX = particles.shakeOffsetX;
  const shakeY = particles.shakeOffsetY;
  ctx.translate(shakeX, shakeY);

  // Clear canvas
  ctx.clearRect(0, 0, screenWidth, screenHeight);

  // 1. Sky & Sun
  oceanWorld.renderSky(ctx, cameraY);

  // 2. 7 Seas Underwater Background
  oceanWorld.renderUnderwaterBackground(ctx, cameraY, screenHeight);

  // 3. Animated Water Surface
  oceanWorld.renderWaterSurface(ctx, cameraY);

  // 4. Hazards
  oceanWorld.entities.hazards.forEach((hazard) => {
    if (hazard.y - cameraY > -hazard.radius * 2 - 20 && hazard.y - cameraY < screenHeight + hazard.radius * 2 + 20) {
      hazard.render(ctx, cameraY);
    }
  });

  // 5. Treasures & Prehistoric Fossils
  oceanWorld.entities.treasures.forEach((treasure) => {
    if (treasure.y - cameraY > -60 && treasure.y - cameraY < screenHeight + 60) {
      treasure.render(ctx, cameraY);
    }
  });

  // 5b. Sunken Archaeological Relics
  if (oceanWorld.entities.relics) {
    oceanWorld.entities.relics.forEach((relic) => {
      if (relic.y - cameraY > -60 && relic.y - cameraY < screenHeight + 60) {
        relic.render(ctx, cameraY);
      }
    });
  }

  // 6. Fish (with dynamic size scaling, shapes, and uncalibrated sonar silhouettes)
  oceanWorld.entities.fish.forEach((fish) => {
    if (fish.y - cameraY > -fish.scale * 130 && fish.y - cameraY < screenHeight + fish.scale * 130) {
      fish.render(ctx, cameraY, hook);
    }
  });

  // 7. Abyssal Darkness & Hook Lantern Light Cone
  oceanWorld.renderAbyssalDarkness(ctx, cameraY, screenHeight, hook);

  // 8. Fishing Line, Hook, and Tethered Catches
  hook.renderLine(ctx, oceanWorld.rodTip.x, oceanWorld.rodTip.y, cameraY);
  hook.render(ctx, cameraY);

  // Render catches tethered to line (stays on the line a bit above the hook and follows it)
  hook.caughtItems.forEach((item) => {
    item.render(ctx, cameraY);
  });

  // 9. Boat and Fisherman (supporting left/right cast orientation)
  oceanWorld.renderBoatAndFisherman(ctx, cameraY);

  // 10. Aiming Trajectory Preview Arc (dual-sided)
  if (gameState === 'AIMING') {
    const rodTier = UPGRADE_DEFINITIONS.fishingRod.tiers[save.getUpgradeLevel('fishingRod')] || UPGRADE_DEFINITIONS.fishingRod.tiers[0];
    oceanWorld.renderAimingTrajectory(
      ctx,
      oceanWorld.rodTip.x,
      oceanWorld.rodTip.y,
      mousePos.x,
      mousePos.y,
      cameraY,
      rodTier
    );
  }

  // 10b. Zone Atmospheric Shaders (Mangrove fog wisps, Abyssal vignette, Caldera heat haze ripples, and Transition screen wipes)
  if (zoneManager) {
    zoneManager.renderAtmosphere(ctx, cameraY, screenWidth, screenHeight);
  }

  // 11. Particles (splashes, bubbles, sparkles, floating text)
  particles.render(ctx, cameraY);

  // 12. Directional Sonar Radar
  if ((hook.sonarLevel === 'Radar' || hook.sonarLevel === 'SonarPulse' || hook.sonarLevel === 'MagnetSonar') &&
      (gameState === 'DESCENDING' || gameState === 'REELING')) {
    renderSonarRadarPings();
  }

  ctx.restore();
};

function renderSonarRadarPings() {
  let nearestTarget = null;
  let minDist = 850;

  const targets = [
    ...oceanWorld.entities.treasures,
    ...(oceanWorld.entities.relics || []),
    ...oceanWorld.entities.fish.filter(f => f.rarity === 'epic' || f.rarity === 'legendary')
  ];

  targets.forEach((t) => {
    const dx = t.x - hook.x;
    const dy = t.y - hook.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist && (t.y - cameraY < 0 || t.y - cameraY > screenHeight)) {
      minDist = dist;
      nearestTarget = t;
    }
  });

  if (nearestTarget) {
    const angle = Math.atan2((nearestTarget.y - cameraY) - (hook.y - cameraY), nearestTarget.x - hook.x);
    const arrowDist = 72;
    const ax = hook.x + Math.cos(angle) * arrowDist;
    const ay = (hook.y - cameraY) + Math.sin(angle) * arrowDist;

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(angle);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Fade out initial loading bar once assets are ready
const loadingScreen = document.getElementById('loading-screen');
setTimeout(() => {
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 450);
  }
}, 350);

// Start game loop
const gameLoop = new GameLoop(update, render);
gameLoop.start();


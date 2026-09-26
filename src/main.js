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

// Setup canvas and rendering context
const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');

let dpr = window.devicePixelRatio || 1;
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

let oceanWorld = null;
let uiManager = null;

function handleResize() {
  dpr = window.devicePixelRatio || 1;
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

// Core systems
const save = saveSystem;
save.load();

const trapSystem = new TrapSystem(save);
const particles = new ParticleSystem();
const hook = new Hook();

// Off-tab title alert & chime system
const originalTitle = document.title || 'Seven Seas Fishing';
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

function notifyRareCatch(name) {
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

// Core quest system
const questSystem = new QuestSystem(save);

// Initialize entities and managers
oceanWorld = new OceanWorld(canvas);
oceanWorld.setTrapSystem(trapSystem);
oceanWorld.setSaveSystem(save);
handleResize();

uiManager = new UIManager(save, triggerCast, startDive, trapSystem, questSystem);
questSystem.onQuestCompleted = (q) => {
  uiManager.showToast(`📋 Noticeboard Mission Complete: ${q.title}! Claim your reward!`);
};

// Atmospheric NPC System & Chart Minimap
const npcSystem = new NPCSystem(save, soundManager, uiManager);
const minimapUI = new MinimapUI(save, soundManager, uiManager, oceanWorld);
uiManager.setMinimapUI(minimapUI);

minimapUI.onSailToSea = (sea) => {
  oceanWorld.setCurrentSea(sea.id);
  soundManager.setSeaTrack(sea.id);
  oceanWorld.populateWorld(save);
};

// Apply current realm state to ocean and soundscape
const initialSea = save.getCurrentSea() || 1;
oceanWorld.setCurrentSea(initialSea);
soundManager.setSeaTrack(initialSea);

hook.applyUpgrades(save);
hook.reset(oceanWorld.rodTip.x, oceanWorld.rodTip.y);

// Populate ocean life across the Seven Seas
oceanWorld.populateWorld(save);

// Input handlers
function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function handlePointerDown(e) {
  // If user clicks while in modal, ignore
  if (uiManager.activeModal) return;

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
    gameState = 'AIMING';
    const dx = mousePos.x - oceanWorld.boat.x;
    const dy = (mousePos.y + cameraY) - oceanWorld.boat.y;
    const boatAngle = oceanWorld.boat.angle || 0;
    const cos = Math.cos(-boatAngle);
    const sin = Math.sin(-boatAngle);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    // Check Cat (only if player has unlocked this companion)
    if (save.hasPet('cat') && oceanWorld.shipsCat && oceanWorld.shipsCat.hitTest(localX, localY, vessel)) {
      if (oceanWorld.shipsCat.hasMorningGift) {
        const gift = oceanWorld.shipsCat.collectGift();
        if (gift) {
          save.data.coins += gift.value;
          save.save();
          soundManager.playCoin();
          uiManager.showToast(`🐱 The ship's cat gifted you: ${gift.icon} ${gift.name} (+${gift.value} coins)!`);
          return;
        }
      }
      oceanWorld.shipsCat.onClick(soundManager);
      if (questSystem) questSystem.dispatch({ type: 'pet_companion', pet: 'cat' });
      particles.addFloatingText('Purr... ♪', oceanWorld.boat.x - 20, oceanWorld.boat.y - 30, '#f59e0b', 16);
      uiManager.showToast("🐱 The ship's cat purrs cozily as you stroke its warm fur.");
      return;
    }

    // Check Pelican (only if player has unlocked this companion)
    if (save.hasPet('pelican') && oceanWorld.pelican && oceanWorld.pelican.hitTest(localX, localY, vessel)) {
      oceanWorld.pelican.feedFish();
      if (questSystem) questSystem.dispatch({ type: 'pet_companion', pet: 'pelican' });
      soundManager.playPelicanChirp();
      particles.addFloatingText('Chirp! 🦤', oceanWorld.boat.x + 50, oceanWorld.boat.y - 30, '#38bdf8', 16);
      uiManager.showToast(`🦤 Fed the perching pelican! Trust: ${oceanWorld.pelican.trust}%`);
      return;
    }

    isMouseDown = true;
    gameState = 'AIMING';
    const aimDx = mousePos.x - oceanWorld.boat.x;
    oceanWorld.setAimDirection(aimDx < 0 ? -1 : 1);
  } else if (gameState === 'DESCENDING') {
    isMouseDown = true;
    // Click during descent to manually begin reeling up
    hook.startReel();
    particles.addFloatingText('REELING UP!', hook.x, hook.y - 25, '#38bdf8', 16);
  }
}

function handlePointerMove(e) {
  const coords = getCanvasCoords(e);
  mousePos.x = coords.x;
  mousePos.y = coords.y;

  if (gameState === 'AIMING') {
    // Dynamically update fisherman orientation (left or right side of boat)
    const dx = mousePos.x - oceanWorld.boat.x;
    oceanWorld.setAimDirection(dx < 0 ? -1 : 1);
  } else if (gameState === 'DESCENDING' || gameState === 'REELING') {
    hook.setTargetX(mousePos.x);
  }
}

function handlePointerUp() {
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
  handlePointerMove(e);
}, { passive: false });

window.addEventListener('touchend', (e) => {
  handlePointerUp();
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
  keysDown[e.key.toLowerCase()] = true;
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
  oceanWorld.populateWorld(save);
  hook.applyUpgrades(save);
  hook.reset(oceanWorld.rodTip.x, oceanWorld.rodTip.y);
  gameState = 'SURFACE_IDLE';

  // Check for rare atmospheric NPC wandering encounter upon resurfacing (~3.5% chance)
  npcSystem.checkRandomEncounter('catch');
}

let surfaceIdleTimer = 0;

// Fixed-step Update Logic (60fps)
const update = (dt) => {
  const deltaSec = dt / 1000;

  // Update NPC director cooldowns
  npcSystem.update(dt);

  // Track surface playtime to reward long cozy sessions with pet visits or wandering traders
  if (gameState === 'SURFACE_IDLE') {
    surfaceIdleTimer += deltaSec;
    if (surfaceIdleTimer >= 120) {
      surfaceIdleTimer = 0;
      if (!npcSystem.checkRandomEncounter('travel')) {
        checkRandomPetEncounter(save, particles, oceanWorld, uiManager, soundManager);
      }
    }
  } else {
    surfaceIdleTimer = 0;
  }

  // Keyboard steering
  if (gameState === 'DESCENDING' || gameState === 'REELING') {
    if (keysDown['a'] || keysDown['arrowleft']) {
      hook.steer(-1);
    }
    if (keysDown['d'] || keysDown['arrowright']) {
      hook.steer(1);
    }
  }

  // Update world environment
  oceanWorld.update(dt, hook);

  // Update Hook
  if (gameState !== 'SURFACE_IDLE' && gameState !== 'AIMING') {
    hook.rodTip = oceanWorld.rodTip;
    hook.update(dt, oceanWorld.surfaceY, screenWidth, particles);

    // Transition: entering water
    if (gameState === 'CASTING' && hook.state === 'DESCENDING') {
      gameState = 'DESCENDING';
      soundManager.setMusicMode('underwater');
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
      const unboxedCrates = hook.caughtItems.filter(i => (i.isCrate || i.category === 'crate') && !i.unboxed);
      if (unboxedCrates.length > 0) {
        uiManager.openCratesModal(unboxedCrates, hook, () => {
          startDive();
        });
      } else {
        uiManager.openCatchSummary(hook, () => {
          startDive();
        });
      }
    }

    // Collision detection: Hook vs Fish
    const hookRadius = 16;
    const canCatch = hook.caughtItems.length < hook.capacity;

    if (canCatch && (gameState === 'REELING' || gameState === 'DESCENDING')) {
      for (let i = oceanWorld.entities.fish.length - 1; i >= 0; i--) {
        const fish = oceanWorld.entities.fish[i];
        if (fish.state !== 'SWIMMING') continue;

        const dx = fish.x - hook.x;
        const dy = fish.y - hook.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < hookRadius + fish.radius) {
          const hooked = hook.addCatch(fish, particles);
          if (hooked) {
            oceanWorld.entities.fish.splice(i, 1);
            if (questSystem) {
              questSystem.dispatch({ type: 'catch_fish', fish });
            }
            if (fish.rarity === 'rare' || fish.rarity === 'epic' || fish.rarity === 'legendary' || fish.isMythic) {
              notifyRareCatch(fish.name);
            }
          }
          if (hook.caughtItems.length >= hook.capacity) break;
        }
      }

      // Collision detection: Hook vs Treasures and Fossils
      for (let i = oceanWorld.entities.treasures.length - 1; i >= 0; i--) {
        const tr = oceanWorld.entities.treasures[i];
        if (tr.state !== 'IDLE') continue;

        const dx = tr.x - hook.x;
        const dy = tr.y - hook.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

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
            if (questSystem) {
              questSystem.dispatch({ type: 'catch_treasure', item: tr });
              if (tr.isCrate || tr.category === 'crate') {
                questSystem.dispatch({ type: 'catch_crate', item: tr });
              }
            }
          }
          if (hook.caughtItems.length >= hook.capacity) break;
        }
      }

      // Collision detection: Hook vs Sunken Archaeological Relics
      if (oceanWorld.entities.relics) {
        for (let i = oceanWorld.entities.relics.length - 1; i >= 0; i--) {
          const relic = oceanWorld.entities.relics[i];
          if (relic.state !== 'IDLE') continue;

          const dx = relic.x - hook.x;
          const dy = relic.y - hook.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

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

        if (dist < hookRadius + haz.radius) {
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
      uiManager.showToast(`🦤 Your pelican dove into the surf and brought you +$${msg.value} in coins!`);
      soundManager.playCoin();
    }
  }

  // Update particles
  particles.update(dt, oceanWorld.surfaceY);

  // Camera vertical dampening
  if (gameState === 'SURFACE_IDLE' || gameState === 'AIMING') {
    targetCameraY = 0;
  } else {
    const verticalOffset = screenHeight * 0.45;
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
    if (hazard.y - cameraY > -60 && hazard.y - cameraY < screenHeight + 60) {
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

  // 6. Fish (with dynamic size scaling and shapes)
  oceanWorld.entities.fish.forEach((fish) => {
    if (fish.y - cameraY > -70 && fish.y - cameraY < screenHeight + 70) {
      fish.render(ctx, cameraY);
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


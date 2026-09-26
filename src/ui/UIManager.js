import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';
import { ACHIEVEMENTS } from '../data/AchievementsData.js';
import { FISH_SPECIES, DEPTH_ZONES, RARITY_CONFIG } from '../data/FishData.js';
import { LEGENDARY_SPECIES } from '../data/legendaries.js';
import { TREASURE_ITEMS } from '../data/TreasureData.js';
import { RELIC_TYPES } from '../data/RelicsData.js';
import { PET_DEFINITIONS } from '../data/PetsData.js';
import { CRATE_RANKS, rollCrateLoot } from '../data/CrateData.js';
import { soundManager } from '../audio/SoundManager.js';
import { worldCycle } from '../systems/WorldCycle.js';

export class UIManager {
  constructor(saveSystem, onCastTrigger, onStartDive, trapSystem = null, questSystem = null) {
    this.saveSystem = saveSystem;
    this.onCastTrigger = onCastTrigger;
    this.onStartDive = onStartDive;
    this.trapSystem = trapSystem;
    this.questSystem = questSystem;
    this.minimapUI = null;

    this.activeModal = null;
    this.toastTimer = null;

    this.createDomElements();
    this.bindEvents();
    this.initWelcomePopup();

    this.saveSystem.onAchievementUnlocked = (achievement) => {
      this.showToast(`🏆 Trophy Unlocked: ${achievement.name}! (+$${achievement.reward})`);
      soundManager.playUpgrade();
    };

    this.saveSystem.onLevelUp = (newLevel) => {
      this.showToast(`⭐ LEVEL UP! You reached Angler Level ${newLevel}! (+$${newLevel * 100})`);
      soundManager.playUpgrade();
    };
  }

  setMinimapUI(minimapUI) {
    this.minimapUI = minimapUI;
  }

  setTrapSystem(trapSys) {
    this.trapSystem = trapSys;
  }

  setQuestSystem(questSys) {
    this.questSystem = questSys;
  }

  createDomElements() {
    const hud = document.createElement('div');
    hud.id = 'game-hud';
    hud.innerHTML = `
      <div class="hud-left">
        <div class="level-display" id="hud-level" title="Angler Level & XP">
          <span class="level-badge" id="level-badge-num">Lv. 1</span>
          <div class="xp-container">
            <div class="xp-bar-track">
              <div class="xp-bar-fill" id="hud-xp-fill"></div>
            </div>
            <span class="xp-text" id="hud-xp-text">0 / 120 XP</span>
          </div>
        </div>

        <div class="coin-display" id="hud-coins">
          <span class="coin-icon">🪙</span>
          <span id="coin-amount">$0</span>
        </div>

        <div class="capacity-display" id="hud-capacity">
          <span class="basket-icon">🪣</span>
          <span id="capacity-amount">0 / 3</span>
        </div>

        <div class="weather-display" id="hud-weather" title="Atmospheric Time & Weather">
          <span class="weather-time" id="hud-time-text">🌅 Dawn</span>
          <span class="weather-sub" id="hud-weather-text">✨ Clear</span>
        </div>

        <div class="shield-display" id="hud-shields" style="display: none;">
          <span class="shield-icon">🛡️</span>
          <span id="shield-amount">0</span>
        </div>

        <div class="hud-buffs-container" id="hud-buffs"></div>
      </div>

      <div class="hud-center">
        <div class="depth-meter-container" id="hud-depth-container" style="display: none;">
          <div class="depth-number" id="hud-depth">0.0m</div>
          <div class="zone-badge" id="hud-zone">Sea 1: Sunlit Shoals</div>
          <div class="depth-bar-track">
            <div class="depth-bar-fill" id="hud-depth-fill"></div>
          </div>
        </div>
        <div class="hint-message" id="hud-hint">Aim on either side of the boat & release!</div>
      </div>

      <div class="hud-right">
        <button class="icon-btn" id="btn-minimap" title="Fantasy Nautical Chart & Minimap">🧭 Chart</button>
        <button class="icon-btn trap-hud-btn" id="btn-traps-hud" title="Harvest Idle Seabed Traps" style="display: none;">
          🪤 Traps <span class="trap-badge-num" id="hud-trap-badge" style="display: none;">0</span>
        </button>
        <button class="icon-btn" id="btn-quests" title="Harbor Noticeboard Quests">
          📋 Quests <span class="trap-badge-num" id="hud-quest-badge" style="display: none; background: #f59e0b;">!</span>
        </button>
        <button class="icon-btn" id="btn-shop" title="Tackle Shop">🛒 Shop</button>
        <button class="icon-btn" id="btn-journal" title="Angler's Field Log & Museum">📜 Journal</button>
        <button class="icon-btn" id="btn-achievements" title="Logbook & Trophy Room">🏆 Logbook</button>
        <button class="icon-btn" id="btn-radio-hud" title="Coastal Radio Receiver">📻 Radio</button>
        <button class="icon-btn" id="btn-settings" title="Settings">⚙️</button>
        <button class="icon-btn" id="btn-tutorial" title="How to Play">❓</button>
        <button class="icon-btn" id="btn-mute" title="Toggle Sound">🔊</button>
      </div>
    `;
    document.body.appendChild(hud);

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-hidden';
    document.body.appendChild(toast);

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'modal-overlay';
    modalOverlay.className = 'modal-overlay-hidden';
    modalOverlay.innerHTML = `
      <div class="modal-card" id="modal-container">
        <div class="modal-header">
          <h2 id="modal-title">Title</h2>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>
        <div class="modal-body" id="modal-content"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
  }

  initWelcomePopup() {
    const welcomePopup = document.getElementById('welcome-popup');
    if (!welcomePopup) return;

    const lvlEl = document.getElementById('welcome-level');
    const coinsEl = document.getElementById('welcome-coins');
    const speciesEl = document.getElementById('welcome-species');

    if (lvlEl) lvlEl.textContent = `Lv. ${this.saveSystem.data.level}`;
    if (coinsEl) coinsEl.textContent = `$${this.saveSystem.data.coins.toLocaleString()}`;
    if (speciesEl) speciesEl.textContent = `${Object.keys(this.saveSystem.data.journal).length} / 33`;

    const startBtn = document.getElementById('btn-welcome-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        soundManager.ensureAudio();
        soundManager.playButtonClick();
        soundManager.setMusicMode('surface');
        welcomePopup.classList.add('welcome-overlay-hidden');
        setTimeout(() => {
          welcomePopup.style.display = 'none';
        }, 400);

        if (!this.saveSystem.data.settings.hasSeenTutorial) {
          this.openTutorial();
          this.saveSystem.data.settings.hasSeenTutorial = true;
          this.saveSystem.save();
        }
      });
    }
  }

  bindEvents() {
    document.getElementById('btn-minimap')?.addEventListener('click', () => {
      if (this.minimapUI) {
        this.minimapUI.openChartNavigation();
      }
    });
    document.getElementById('btn-shop').addEventListener('click', () => this.openShop());
    document.getElementById('btn-quests')?.addEventListener('click', () => this.openQuestsModal());
    document.getElementById('btn-journal').addEventListener('click', () => this.openJournal());
    document.getElementById('btn-achievements').addEventListener('click', () => this.openAchievements());
    document.getElementById('btn-radio-hud')?.addEventListener('click', () => this.openRadio());
    document.getElementById('btn-settings').addEventListener('click', () => this.openSettings());
    document.getElementById('btn-tutorial').addEventListener('click', () => this.openTutorial());
    document.getElementById('btn-traps-hud').addEventListener('click', () => this.handleTrapClick());

    const muteBtn = document.getElementById('btn-mute');
    muteBtn.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      this.saveSystem.data.settings.isMuted = isMuted;
      this.saveSystem.save();
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
      soundManager.playButtonClick();
    });

    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') {
        this.closeModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal();
      }
    });
  }

  handleTrapClick() {
    if (!this.trapSystem || this.trapSystem.getTrapCount() <= 0) {
      this.showToast('🪤 You have not purchased any Seabed Drift Pots yet! Buy them in the Tackle Shop.');
      this.openShop();
      return;
    }
    if (this.trapSystem.getStoredItems().length > 0) {
      const result = this.trapSystem.harvest();
      soundManager.playTrapHarvest();
      if (this.questSystem) {
        this.questSystem.dispatch({ type: 'harvest_traps', count: result.count });
      }
      this.showToast(`🪤 Harvested ${result.count} trap catches! (+$${result.gold.toLocaleString()} • +${result.xp} XP${result.skeletonPieces > 0 ? ` • +${result.skeletonPieces} Fossil Bones!` : ''})`);
    } else {
      this.openJournal('traps');
    }
  }

  updateHUD(hook, gameState) {
    const isDiving = (gameState === 'CASTING' || gameState === 'DESCENDING' || gameState === 'REELING');
    const hudEl = document.getElementById('game-hud');
    if (hudEl) {
      hudEl.classList.toggle('hud-diving-mode', isDiving);
    }

    const lvl = this.saveSystem.data.level;
    const currentXp = this.saveSystem.data.xp;
    const xpReq = this.saveSystem.getXpRequired(lvl);
    document.getElementById('level-badge-num').textContent = `Lv. ${lvl}`;
    document.getElementById('hud-xp-text').textContent = `${currentXp} / ${xpReq} XP`;
    const xpPct = Math.min(100, (currentXp / xpReq) * 100);
    document.getElementById('hud-xp-fill').style.width = `${xpPct}%`;

    document.getElementById('coin-amount').textContent = `$${this.saveSystem.data.coins.toLocaleString()}`;

    // Update atmospheric time & weather in HUD
    const timeTextEl = document.getElementById('hud-time-text');
    const weatherTextEl = document.getElementById('hud-weather-text');
    if (timeTextEl) timeTextEl.textContent = worldCycle.getTimeLabel();
    if (weatherTextEl) weatherTextEl.textContent = worldCycle.getWeatherLabel();

    // Update audio rain state based on weather
    soundManager.setWeatherAudio(worldCycle.getWeather());

    // Update trap count in HUD (only visible if traps have been purchased!)
    if (this.trapSystem) {
      const trapCount = this.trapSystem.getTrapCount();
      const trappedCount = this.trapSystem.getStoredItems().length;
      const trapBadge = document.getElementById('hud-trap-badge');
      const trapBtn = document.getElementById('btn-traps-hud');
      if (trapBtn) {
        if (trapCount > 0) {
          trapBtn.style.display = 'inline-flex';
          if (trapBadge) {
            if (trappedCount > 0) {
              trapBadge.style.display = 'inline-block';
              trapBadge.textContent = trappedCount;
              trapBtn.classList.add('trap-ready');
            } else {
              trapBadge.style.display = 'none';
              trapBtn.classList.remove('trap-ready');
            }
          }
        } else {
          trapBtn.style.display = 'none';
        }
      }
    }

    // Update quests badge in HUD
    if (this.questSystem) {
      const questBadge = document.getElementById('hud-quest-badge');
      if (questBadge) {
        if (this.questSystem.hasUnclaimedRewards()) {
          questBadge.style.display = 'inline-block';
        } else {
          questBadge.style.display = 'none';
        }
      }
    }

    // Update active buffs in HUD
    const buffsContainer = document.getElementById('hud-buffs');
    if (buffsContainer) {
      let buffsHtml = '';
      if (this.saveSystem.hasActiveBuff('sirensGrace')) {
        const sec = this.saveSystem.getBuffRemainingSeconds('sirensGrace');
        buffsHtml += `<span class="hud-buff-pill" title="Increased Rare Catch Rate">🌊 Siren's Grace (${sec}s)</span>`;
      }
      if (this.saveSystem.hasActiveBuff('starlightClarity')) {
        const sec = this.saveSystem.getBuffRemainingSeconds('starlightClarity');
        buffsHtml += `<span class="hud-buff-pill" title="Reveals fish silhouettes">🌟 Starlight Sight (${sec}s)</span>`;
      }
      if (this.saveSystem.hasActiveBuff('cartographerMark')) {
        const sec = this.saveSystem.getBuffRemainingSeconds('cartographerMark');
        buffsHtml += `<span class="hud-buff-pill" title="Secret Hotspot Active">🗺️ Survey Mark (${sec}s)</span>`;
      }
      buffsContainer.innerHTML = buffsHtml;
    }

    const capEl = document.getElementById('hud-capacity');
    const capAmt = document.getElementById('capacity-amount');
    if (gameState === 'SURFACE_IDLE' || gameState === 'AIMING') {
      capAmt.textContent = `0 / ${hook.capacity}`;
      document.getElementById('hud-depth-container').style.display = 'none';
      document.getElementById('hud-shields').style.display = 'none';
    } else {
      capAmt.textContent = `${hook.caughtItems.length} / ${hook.capacity}`;
      if (hook.caughtItems.length >= hook.capacity) {
        capEl.classList.add('capacity-full');
      } else {
        capEl.classList.remove('capacity-full');
      }

      const depthContainer = document.getElementById('hud-depth-container');
      depthContainer.style.display = 'flex';
      const depthM = Math.min(hook.depthMeters, hook.maxDepthMeters);
      document.getElementById('hud-depth').textContent = `${depthM.toFixed(1)}m`;

      const fillPct = Math.min(100, (depthM / hook.maxDepthMeters) * 100);
      document.getElementById('hud-depth-fill').style.width = `${fillPct}%`;

      let currentZone = DEPTH_ZONES[0];
      for (const z of DEPTH_ZONES) {
        if (depthM >= z.minDepth) currentZone = z;
      }
      document.getElementById('hud-zone').textContent = `Sea ${currentZone.id}: ${currentZone.name}`;

      const shieldEl = document.getElementById('hud-shields');
      if (hook.shields > 0) {
        shieldEl.style.display = 'flex';
        document.getElementById('shield-amount').textContent = hook.shields;
      } else {
        shieldEl.style.display = 'none';
      }
    }

    const hintEl = document.getElementById('hud-hint');
    if (gameState === 'SURFACE_IDLE') {
      hintEl.textContent = 'Drag left or right of the boat to aim & cast!';
    } else if (gameState === 'AIMING') {
      hintEl.textContent = 'Release to launch line into the sea!';
    } else if (gameState === 'CASTING') {
      hintEl.textContent = 'Hook is soaring through the air!';
    } else if (gameState === 'DESCENDING') {
      hintEl.textContent = 'Dodge obstacles! Move mouse or use A/D keys to steer';
    } else if (gameState === 'REELING') {
      if (hook.isLegendaryOnLine) {
        hintEl.textContent = hook.rhythmPhase === 'LULL'
          ? '🌊 CALM LULL: Optimal retrieval window!'
          : '〰️ WAVE SWELL: Easing line tension...';
      } else {
        hintEl.textContent = 'Catches stay attached to the line! Snag more as you rise!';
      }
    } else {
      hintEl.textContent = '';
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.className = 'toast-visible';

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.className = 'toast-hidden';
    }, 4500);
  }

  openModal(title, contentHtml) {
    soundManager.playButtonClick();
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = contentHtml;
    document.getElementById('modal-overlay').className = 'modal-overlay-visible';
  }

  closeModal() {
    soundManager.playButtonClick();
    const wasCrateModal = this.activeModal === 'crate_opening';
    const crateCtx = this._currentCrateContext;
    this._currentCrateContext = null;
    document.getElementById('modal-overlay').className = 'modal-overlay-hidden';
    this.activeModal = null;
    if (wasCrateModal && crateCtx && crateCtx.hook) {
      this.openCatchSummary(crateCtx.hook, crateCtx.onContinue);
    }
  }

  showNPCModal(npc, onOptionChosen) {
    this.activeModal = 'npc_encounter';

    let optionsHtml = '';
    npc.options.forEach((opt, idx) => {
      optionsHtml += `
        <div class="npc-option-card" data-idx="${idx}">
          <div class="npc-option-label">${opt.label}</div>
          <div class="npc-option-desc">${opt.desc}</div>
        </div>
      `;
    });

    const contentHtml = `
      <div class="npc-encounter-modal">
        <div class="npc-header-bar" style="border-bottom: 2px solid ${npc.themeColor || '#38bdf8'};">
          <div class="npc-avatar-box" style="border-color: ${npc.themeColor || '#38bdf8'};">
            <span class="npc-avatar-emoji">${npc.avatar}</span>
          </div>
          <div class="npc-meta">
            <h3 class="npc-name" style="color: ${npc.themeColor || '#f8fafc'};">${npc.name}</h3>
            <div class="npc-title">${npc.title}</div>
          </div>
        </div>

        <div class="npc-speech-bubble">
          <p>“${npc.greeting}”</p>
        </div>

        <div class="npc-options-section">
          <div class="npc-options-heading">Choose Your Course of Action:</div>
          <div class="npc-options-list">
            ${optionsHtml}
          </div>
        </div>
      </div>
    `;

    this.openModal(`✨ Atmospheric Encounter: ${npc.name}`, contentHtml);

    document.querySelectorAll('.npc-option-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        const chosenOpt = npc.options[idx];
        if (chosenOpt && onOptionChosen) {
          onOptionChosen(chosenOpt);
        }
      });
    });
  }

  openRadio() {
    this.activeModal = 'radio';
    soundManager.playButtonClick();

    const activeStation = soundManager.getActiveStation();

    const stations = [
      { id: 'harbor_breeze', name: 'Station 1: Harbor Breeze', desc: 'Acoustic nylon chords & gentle swelling ocean waves', icon: '🎸' },
      { id: 'rainy_lighthouse', name: 'Station 2: Rainy Lighthouse', desc: 'Soft rain patter, rolling thunder & warm low foghorn', icon: '🌧️' },
      { id: 'deep_blue', name: 'Station 3: Deep Blue Reverie', desc: 'Slow warm synth pads & gentle underwater resonance', icon: '🫧' },
    ];

    let html = `
      <div class="radio-modal-container">
        <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:14px;">
          Tune your vessel's vintage brass radio to cozy procedural soundscapes. Plays in the background without needing any external audio files.
        </p>
        <div style="display:flex; flex-direction:column; gap:10px;">
    `;

    stations.forEach(st => {
      const isActive = activeStation === st.id;
      html += `
        <div class="radio-station-card ${isActive ? 'radio-station-active' : ''}" data-station="${st.id}" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:10px; background:${isActive ? 'rgba(56,189,248,0.18)' : 'rgba(15,23,42,0.6)'}; border:1px solid ${isActive ? '#38bdf8' : 'rgba(255,255,255,0.08)'}; cursor:pointer; transition:all 0.2s ease;">
          <span style="font-size:1.8rem;">${st.icon}</span>
          <div style="flex:1;">
            <h4 style="margin:0 0 3px 0; color:#f8fafc; font-size:0.95rem;">${st.name} ${isActive ? '<span style="color:#38bdf8; font-size:0.75rem;">● ON AIR</span>' : ''}</h4>
            <p style="margin:0; font-size:0.78rem; color:#94a3b8;">${st.desc}</p>
          </div>
          <button class="btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm">${isActive ? 'Playing' : 'Tune In'}</button>
        </div>
      `;
    });

    html += `
        </div>
        <div style="margin-top:16px; text-align:center;">
          <button class="btn btn-secondary btn-sm" id="btn-radio-off" ${!activeStation ? 'disabled' : ''}>Turn Off Radio</button>
        </div>
      </div>
    `;

    this.openModal('📻 Coastal Radio Receiver', html);

    document.querySelectorAll('.radio-station-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const stId = e.currentTarget.dataset.station;
        soundManager.startRadioStation(stId);
        this.openRadio();
      });
    });

    const offBtn = document.getElementById('btn-radio-off');
    if (offBtn) {
      offBtn.addEventListener('click', () => {
        soundManager.stopRadioStation();
        this.openRadio();
      });
    }
  }

  showBottleMessage(message) {
    this.activeModal = 'bottleMessage';
    soundManager.playBottlePickup();

    const isHaiku = message.type === 'haiku';
    const isLore = message.type === 'lore';

    const formattedText = (message.text || '').replace(/\n/g, '<br>');

    this.openModal('📜 Message from the Sea', `
      <div style="text-align:center; padding:15px 10px;">
        <div style="font-size:2.8rem; margin-bottom:8px;">🍾</div>
        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:${isLore ? '#38bdf8' : isHaiku ? '#a78bfa' : '#fbbf24'}; margin-bottom:12px;">
          ${isLore ? 'Ancient Sea Legend Clue' : isHaiku ? "Sailor's Drifting Haiku" : "Bottle Post Note"}
        </div>
        <div style="font-family:serif; font-size:1.15rem; font-style:italic; line-height:1.7; color:#fef3c7; background:rgba(0,0,0,0.3); padding:16px 20px; border-radius:10px; border:1px solid rgba(251,191,36,0.25); margin-bottom:18px;">
          ${formattedText}
        </div>
        <button class="btn btn-primary" id="btn-bottle-close">Keep In Journal & Close</button>
      </div>
    `);

    const closeBtn = document.getElementById('btn-bottle-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }
  }

  openShop() {
    this.activeModal = 'shop';
    const upgrades = UPGRADE_DEFINITIONS;
    const save = this.saveSystem;
    const playerLevel = save.data.level;

    let itemsHtml = '<div class="shop-grid">';

    Object.values(upgrades).forEach((upg) => {
      const currentLvl = save.getUpgradeLevel(upg.id);
      const currentTier = upg.tiers[currentLvl] || upg.tiers[0];
      const nextTier = upg.tiers[currentLvl + 1] || null;
      const isMax = !nextTier;
      const meetsLevel = nextTier ? playerLevel >= nextTier.reqLevel : true;
      const canAfford = nextTier && meetsLevel && save.data.coins >= nextTier.cost;

      itemsHtml += `
        <div class="shop-card ${isMax ? 'shop-card-max' : ''} ${!meetsLevel ? 'shop-card-locked' : ''}">
          <div class="shop-card-header">
            <span class="shop-icon">${upg.icon}</span>
            <div class="shop-info">
              <h3>${upg.name}</h3>
              <p class="shop-desc">${upg.description}</p>
            </div>
          </div>
          <div class="shop-stat">
            <div class="stat-tier">Level: <strong>${currentLvl} / ${upg.tiers.length - 1}</strong></div>
            <div class="stat-perk">Current: <span class="perk-highlight">${currentTier.label}</span></div>
            ${
              nextTier
                ? `<div class="stat-next">Next: <span>${nextTier.label}</span></div>`
                : '<div class="stat-max">⭐ MAXED OUT ⭐</div>'
            }
          </div>
          <div class="shop-card-action">
            ${
              isMax
                ? `<button class="btn btn-disabled" disabled>MAX</button>`
                : !meetsLevel
                ? `<button class="btn btn-disabled" disabled>🔒 Unlocks at Lv. ${nextTier.reqLevel}</button>`
                  : `<button class="btn ${canAfford ? 'btn-buy' : 'btn-disabled'} btn-upgrade" data-upgrade="${upg.id}">
                    ${currentLvl === 0 && upg.id === 'seabedTraps' ? 'Deploy Pots: ' : 'Upgrade: '}$${nextTier.cost.toLocaleString()}
                   </button>`
            }
          </div>
        </div>
      `;
    });

    itemsHtml += '</div>';

    this.openModal('🎣 Seven Seas Tackle & Vessel Outfitters', itemsHtml);

    document.querySelectorAll('.btn-upgrade').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const upgId = e.currentTarget.dataset.upgrade;
        const currentLvl = save.getUpgradeLevel(upgId);
        const upg = UPGRADE_DEFINITIONS[upgId];
        const nextTier = upg.tiers[currentLvl + 1];

        if (nextTier && save.data.level >= nextTier.reqLevel && save.spendCoins(nextTier.cost)) {
          save.setUpgradeLevel(upgId, currentLvl + 1);

          // If seabedTraps was upgraded, sync trap count and storage
          if (upgId === 'seabedTraps' && save.data.traps) {
            save.data.traps.count = nextTier.trapCount || 1;
            save.data.traps.maxStorage = nextTier.maxStorage || 12;
            save.save();
          }

          soundManager.playUpgrade();
          if (upgId === 'seabedTraps' && currentLvl === 0) {
            this.showToast(`🪤 Purchased Seabed Drift Pots! Deployed ${nextTier.trapCount} pot in coastal waters.`);
          } else {
            this.showToast(`✨ Upgraded ${upg.name} to Level ${currentLvl + 1}!`);
          }
          this.openShop();
        }
      });
    });
  }

  openCatchSummary(hook, onContinue) {
    this.activeModal = 'catchSummary';
    soundManager.playCoin();

    const rodTier = UPGRADE_DEFINITIONS.fishingRod.tiers[this.saveSystem.getUpgradeLevel('fishingRod')] || UPGRADE_DEFINITIONS.fishingRod.tiers[0];
    const sellMultiplier = 1 + rodTier.sellBonus;

    let subtotal = 0;
    let listHtml = '<div class="catch-summary-list">';
    const hasUnrestoredRelic = hook.caughtItems.some(i => i.isRelic && !i.restored);

    if (hook.caughtItems.length === 0) {
      listHtml += `
        <div class="empty-catch">
          <p class="empty-icon">🪹</p>
          <p>The line surfaced without catches this dive!</p>
          <p class="empty-sub">Cast deeper into the Seven Seas to discover valuable fish and fossils.</p>
        </div>
      `;
    } else {
      hook.caughtItems.forEach((item) => {
        const isCrate = !!item.isCrate || item.category === 'crate';
        const itemVal = isCrate ? 0 : Math.round(item.value * sellMultiplier);
        subtotal += itemVal;

        const isRelic = !!item.isRelic;
        const isFossil = item.category === 'fossil';
        const isTreasure = item.isTreasure && !isCrate;
        const rarityBadge = `<span class="rarity-tag rarity-${item.rarity}">${item.rarity.toUpperCase()}</span>`;
        const shinyTag = item.isShiny ? `<span class="shiny-tag">✨ SHINY</span>` : '';
        const fossilTag = isFossil ? `<span class="fossil-tag">🦴 FOSSIL</span>` : '';
        const relicTag = isRelic ? `<span class="relic-tag" style="background:#854d0e;color:#fef08a;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;">🏺 ${item.restored ? 'RESTORED' : 'RELIC'}</span>` : '';
        const crateTag = isCrate
          ? (item.unboxed
            ? `<span class="crate-tag" style="background:#10b981;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;">🎁 UNLOCKED</span>`
            : `<span class="crate-tag" style="background:#f59e0b;color:#1e293b;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;">🎁 UNOPENED</span>`)
          : '';
        const mythicTag = item.isMythic ? `<span class="mythic-tag">🌟 MYTHIC</span>` : '';
        const crownTag = item.crown === 'gold'
          ? `<span class="crown-tag crown-gold">👑 GOLD CROWN</span>`
          : item.crown === 'silver'
          ? `<span class="crown-tag crown-silver">🥈 SILVER CROWN</span>`
          : '';

        listHtml += `
          <div class="catch-item-card rarity-border-${item.rarity}">
            <div class="catch-item-icon">
              ${isCrate ? (item.loot?.icon || '📦') : isRelic ? (item.icon || '🏺') : isFossil ? '🦴' : isTreasure ? '📦' : item.isMythic ? '🌟' : '🐟'}
            </div>
            <div class="catch-item-details">
              <div class="catch-item-name">${item.name} ${shinyTag} ${mythicTag} ${crownTag} ${fossilTag} ${relicTag} ${crateTag} ${rarityBadge}</div>
              <div class="catch-item-specs">
                ${
                  isCrate
                    ? `<span>🎁 Rank ${item.crateRank || 1} Mystery Loot Crate • ${item.unboxed ? `Loot: <strong>${item.loot?.name || 'Claimed'}</strong>` : 'Crack open to claim loot!'}</span>`
                    : !isTreasure && !isRelic
                    ? `<span>📏 <strong>${item.size} cm</strong></span> <span>⚖️ ${item.weight} kg</span> ${item.crown ? `<span>⭐ Size Record</span>` : ''}`
                    : isRelic
                    ? `<span>🏺 Archaeological Artifact (${item.relicType?.era || 'Ancient'}) • ${item.restored ? '✨ Restored' : '🪥 Needs Cleaning'}</span>`
                    : isFossil
                    ? `<span>🏛️ Prehistoric Museum Relic</span>`
                    : `<span>🗺️ Sunken Treasure</span>`
                }
              </div>
            </div>
            <div class="catch-item-price">
              ${
                isCrate
                  ? (item.unboxed
                    ? (item.loot && item.loot.coins !== undefined
                      ? (item.loot.coins >= 0 ? `+$${item.loot.coins.toLocaleString()} (Claimed)` : `-$${Math.abs(item.loot.coins)} (Paid)`)
                      : 'Claimed')
                    : 'Needs Opening')
                  : `+$${itemVal.toLocaleString()}`
              }
            </div>
          </div>
        `;
      });
    }

    listHtml += '</div>';

    const unboxedCrates = hook.caughtItems.filter(i => (i.isCrate || i.category === 'crate') && !i.unboxed);
    const totalGold = subtotal;

    const modalBody = `
      <div class="summary-container">
        <div class="summary-header-stats">
          <div class="stat-box">
            <span class="stat-label">Max Depth</span>
            <span class="stat-value">${hook.maxDepthReachedThisDive.toFixed(1)}m</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Line Catches</span>
            <span class="stat-value">${hook.caughtItems.length} / ${hook.capacity}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Rod Bonus</span>
            <span class="stat-value">+${Math.round(rodTier.sellBonus * 100)}%</span>
          </div>
        </div>

        ${listHtml}

        <div class="summary-footer">
          <div class="total-earnings">
            <span>Total Haul Value:</span>
            <strong class="total-cash">+$${totalGold.toLocaleString()}</strong>
          </div>
          <div class="summary-actions">
            ${unboxedCrates.length > 0 ? `<button class="btn btn-warning" id="btn-open-crates" style="background:#eab308; color:#1e293b; font-weight:800; border-color:#ca8a04;">🎁 Crack Open Crates (${unboxedCrates.length})</button>` : ''}
            ${hasUnrestoredRelic ? `<button class="btn btn-warning" id="btn-restore-relic">🪥 Restoration Desk</button>` : ''}
            <button class="btn btn-primary" id="btn-collect-catch">Sell All & Deposit</button>
            <button class="btn btn-secondary" id="btn-summary-shop">Tackle Shop</button>
          </div>
        </div>
      </div>
    `;

    this.openModal('⛵ Dive Completed — Catch Summary', modalBody);

    if (hasUnrestoredRelic) {
      const restoreBtn = document.getElementById('btn-restore-relic');
      if (restoreBtn) {
        restoreBtn.addEventListener('click', () => {
          const unrestored = hook.caughtItems.find(i => i.isRelic && !i.restored);
          if (unrestored) {
            this.openRestorationDesk(unrestored, () => {
              this.openCatchSummary(hook, onContinue);
            });
          }
        });
      }
    }

    const cratesBtn = document.getElementById('btn-open-crates');
    if (cratesBtn) {
      cratesBtn.addEventListener('click', () => {
        this.openCratesModal(unboxedCrates, hook, onContinue);
      });
    }

    document.getElementById('btn-collect-catch').addEventListener('click', () => {
      hook.caughtItems.forEach((item) => {
        this.saveSystem.recordCatchItem(item);
      });
      if (hook.caughtItems.length >= hook.capacity) {
        this.saveSystem.recordFullHaul();
      }
      this.saveSystem.recordDiveStats({
        maxDepth: hook.maxDepthReachedThisDive,
        tookDamage: hook.tookDamage,
      });
      if (this.questSystem) {
        this.questSystem.dispatch({
          type: 'complete_dive',
          maxDepth: hook.maxDepthReachedThisDive,
          caughtCount: hook.caughtItems.length,
          isFullCapacity: hook.caughtItems.length >= hook.capacity,
          tookDamage: hook.tookDamage,
        });
      }
      this.saveSystem.addCoins(totalGold);
      this.closeModal();
      if (onContinue) onContinue();
    });

    document.getElementById('btn-summary-shop').addEventListener('click', () => {
      hook.caughtItems.forEach((item) => {
        this.saveSystem.recordCatchItem(item);
      });
      if (hook.caughtItems.length >= hook.capacity) {
        this.saveSystem.recordFullHaul();
      }
      this.saveSystem.recordDiveStats({
        maxDepth: hook.maxDepthReachedThisDive,
        tookDamage: hook.tookDamage,
      });
      if (this.questSystem) {
        this.questSystem.dispatch({
          type: 'complete_dive',
          maxDepth: hook.maxDepthReachedThisDive,
          caughtCount: hook.caughtItems.length,
          isFullCapacity: hook.caughtItems.length >= hook.capacity,
          tookDamage: hook.tookDamage,
        });
      }
      this.saveSystem.addCoins(totalGold);
      this.openShop();
    });
  }

  // Mystery Loot Crate Unboxing Modal
  openCratesModal(crates, hook, onContinue) {
    this.activeModal = 'crate_opening';
    this._currentCrateContext = { hook, onContinue };

    if (!crates || crates.length === 0) {
      this._currentCrateContext = null;
      this.openCatchSummary(hook, onContinue);
      return;
    }

    const currentCrate = crates[0];
    const rankInfo = CRATE_RANKS.find((r) => r.rank === currentCrate.crateRank) || CRATE_RANKS[0];

    const modalBody = `
      <div class="crate-unboxing-panel" style="text-align: center; padding: 20px 10px;">
        <div style="font-size: 0.85rem; text-transform: uppercase; color: #facc15; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px;">
          Rank ${rankInfo.rank} Mystery Crate (${crates.length} Remaining)
        </div>
        <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1.4rem;">${rankInfo.name}</h3>

        <div id="crate-display-stage" style="margin: 20px auto; width: 140px; height: 140px; background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0) 70%); display: flex; align-items: center; justify-content: center; border-radius: 50%;">
          <span id="crate-icon-anim" style="font-size: 4.8rem; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.6)); transition: transform 0.2s;">
            ${rankInfo.icon}
          </span>
        </div>

        <p id="crate-status-desc" style="color: #cbd5e1; font-size: 0.95rem; max-width: 380px; margin: 0 auto 20px auto; line-height: 1.5;">
          ${rankInfo.desc}
        </p>

        <div id="crate-loot-result" style="display: none; margin-bottom: 20px;"></div>

        <div class="crate-actions">
          <button class="btn btn-primary" id="btn-crack-crate" style="padding: 12px 28px; font-size: 1.05rem; font-weight: 800; background: #eab308; color: #1e293b; border-color: #ca8a04; cursor: pointer; transition: all 0.2s ease;">
            🔓 Unlock & Open Crate!
          </button>
        </div>
      </div>
    `;

    this.openModal(`🎁 Opening ${rankInfo.name}`, modalBody);

    const crackBtn = document.getElementById('btn-crack-crate');
    if (crackBtn) {
      crackBtn.addEventListener('click', () => {
        crackBtn.disabled = true;
        const iconEl = document.getElementById('crate-icon-anim');
        const descEl = document.getElementById('crate-status-desc');
        const resultEl = document.getElementById('crate-loot-result');

        // Suspenseful shake animation
        let shakes = 0;
        soundManager.playCast();
        const shakeInterval = setInterval(() => {
          shakes++;
          if (iconEl) {
            const rot = (shakes % 2 === 0 ? -14 : 14);
            iconEl.style.transform = `rotate(${rot}deg) scale(1.15)`;
          }
          if (shakes >= 8) {
            clearInterval(shakeInterval);
            if (iconEl) iconEl.style.transform = 'scale(1.25)';

            // Roll loot
            const loot = rollCrateLoot(currentCrate.crateRank, this.saveSystem);
            currentCrate.unboxed = true;
            currentCrate.loot = loot;
            currentCrate.value = 0; // Value is claimed directly to prevent double counting on Sell All

            const isJackpot = loot.grade === 'super_good';
            const isBad = loot.grade === 'super_bad';
            soundManager.playChestOpen(isJackpot);

            // Apply coins and XP
            this.saveSystem.adjustCoins(loot.coins);
            this.saveSystem.addXp(loot.xp);

            // Unlock cosmetics if rolled
            if (loot.bonusBobber) {
              if (!this.saveSystem.data.unlockedBobbers) this.saveSystem.data.unlockedBobbers = [];
              if (!this.saveSystem.data.unlockedBobbers.includes(loot.bonusBobber.id)) {
                this.saveSystem.data.unlockedBobbers.push(loot.bonusBobber.id);
                this.saveSystem.save();
              }
            }

            // Record fossil if rolled
            if (loot.bonusFossil) {
              if (!this.saveSystem.data.fossils) this.saveSystem.data.fossils = {};
              if (!this.saveSystem.data.fossils[loot.bonusFossil.id]) {
                this.saveSystem.data.fossils[loot.bonusFossil.id] = { count: 0, firstFoundAt: Date.now() };
              }
              this.saveSystem.data.fossils[loot.bonusFossil.id].count += 1;
              this.saveSystem.data.stats.totalFossilsCollected = Object.keys(this.saveSystem.data.fossils).length;
              this.saveSystem.save();
            }

            // Stats & Quests
            this.saveSystem.data.stats.totalCratesOpened = (this.saveSystem.data.stats.totalCratesOpened || 0) + 1;
            this.saveSystem.save();

            if (this.questSystem) {
              this.questSystem.dispatch({ type: 'catch_crate', item: currentCrate, loot });
              this.questSystem.dispatch({ type: 'open_crate', item: currentCrate, loot });
            }

            if (descEl) descEl.style.display = 'none';

            let gradeTag = '';
            let borderColor = 'rgba(255, 255, 255, 0.15)';
            let bgGlow = 'rgba(15, 23, 42, 0.8)';
            if (isJackpot) {
              gradeTag = '<span style="background: #eab308; color: #1e293b; font-weight: 800; padding: 4px 14px; border-radius: 999px; font-size: 0.85rem; letter-spacing: 0.5px;">⭐ SUPER GOOD LOOT! ⭐</span>';
              borderColor = '#f59e0b';
              bgGlow = 'rgba(245, 158, 11, 0.18)';
            } else if (isBad) {
              gradeTag = '<span style="background: #ef4444; color: #ffffff; font-weight: 800; padding: 4px 14px; border-radius: 999px; font-size: 0.85rem; letter-spacing: 0.5px;">⚠️ BUMMER! SUPER BAD LOOT!</span>';
              borderColor = '#ef4444';
              bgGlow = 'rgba(239, 68, 68, 0.18)';
            } else {
              gradeTag = '<span style="background: #38bdf8; color: #0f172a; font-weight: 800; padding: 4px 14px; border-radius: 999px; font-size: 0.85rem; letter-spacing: 0.5px;">✨ FAIR SALVAGE</span>';
              borderColor = '#38bdf8';
              bgGlow = 'rgba(56, 189, 248, 0.12)';
            }

            resultEl.style.display = 'block';
            resultEl.innerHTML = `
              <div style="border: 2px solid ${borderColor}; background: ${bgGlow}; border-radius: 12px; padding: 18px; margin-top: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
                <div style="margin-bottom: 8px;">${gradeTag}</div>
                <div style="font-size: 3.2rem; margin: 8px 0; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));">${loot.icon}</div>
                <h4 style="margin: 0 0 6px 0; font-size: 1.3rem; color: #f8fafc;">${loot.name}</h4>
                <p style="margin: 0 0 10px 0; font-size: 0.95rem; font-weight: 600; color: ${isBad ? '#fca5a5' : '#fef08a'};">${loot.headline}</p>
                <p style="margin: 0 0 14px 0; font-size: 0.88rem; color: #94a3b8; font-style: italic; line-height: 1.4;">"${loot.flavor}"</p>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; font-size: 0.95rem; font-weight: 700;">
                  <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid ${loot.coins >= 0 ? '#4ade80' : '#ef4444'}; color: ${loot.coins >= 0 ? '#4ade80' : '#ef4444'}; padding: 4px 12px; border-radius: 999px;">
                    ${loot.coins >= 0 ? `+${loot.coins.toLocaleString()}` : `-${Math.abs(loot.coins)}`} Coins
                  </span>
                  <span style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; padding: 4px 12px; border-radius: 999px;">
                    +${loot.xp} XP
                  </span>
                  ${loot.bonusBobber ? `<span style="background: rgba(234, 179, 8, 0.15); border: 1px solid #facc15; color: #fde047; padding: 4px 12px; border-radius: 999px;">🎣 Unlocked ${loot.bonusBobber.name}!</span>` : ''}
                  ${loot.bonusFossil ? `<span style="background: rgba(168, 85, 247, 0.15); border: 1px solid #c084fc; color: #e9d5ff; padding: 4px 12px; border-radius: 999px;">🏛️ Museum: ${loot.bonusFossil.name}!</span>` : ''}
                  ${loot.bonusSkeleton ? `<span style="background: rgba(249, 115, 22, 0.15); border: 1px solid #fb923c; color: #fed7aa; padding: 4px 12px; border-radius: 999px;">🦴 +1 ${loot.bonusSkeleton.name}!</span>` : ''}
                </div>
              </div>
            `;

            // Next button
            crates.shift(); // remove opened crate
            if (crates.length > 0) {
              crackBtn.disabled = false;
              crackBtn.textContent = `Open Next Crate (${crates.length} Remaining) 🎁`;
              crackBtn.onclick = () => {
                this.openCratesModal(crates, hook, onContinue);
              };
            } else {
              crackBtn.disabled = false;
              crackBtn.textContent = 'Continue to Catch Summary ⛵';
              crackBtn.onclick = () => {
                this._currentCrateContext = null;
                this.openCatchSummary(hook, onContinue);
              };
            }
          }
        }, 60);
      });
    }
  }

  // Harbor Noticeboard Quests Modal
  openQuestsModal() {
    this.activeModal = 'quests';
    if (!this.questSystem) return;

    const quests = this.questSystem.getActiveQuests();
    const completedTotal = this.saveSystem.data.quests?.completedCount || 0;

    let questsHtml = `
      <div class="quests-container" style="padding: 6px 0;">
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="margin: 0; color: #f8fafc; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
              <span>📋</span> Harbor Noticeboard Missions
            </h3>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 0.88rem;">Complete daily coastal tasks to earn gold, research XP, and bonus rewards!</p>
          </div>
          <div style="background: rgba(30, 41, 59, 0.8); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; color: #fef08a; font-weight: 700; border: 1px solid rgba(254, 240, 138, 0.2);">
            ⭐ ${completedTotal} Missions Completed
          </div>
        </div>

        <div class="quests-grid" style="display: flex; flex-direction: column; gap: 14px;">
    `;

    quests.forEach((q) => {
      const pct = Math.min(100, Math.round((q.current / q.target) * 100));
      const isComplete = q.isComplete;

      questsHtml += `
        <div class="quest-card" style="background: ${isComplete ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.8)'}; border: 1px solid ${isComplete ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; transition: all 0.2s;">
          <div style="display: flex; gap: 14px; align-items: center; flex: 1; min-width: 240px;">
            <div style="font-size: 2.2rem; background: rgba(0, 0, 0, 0.3); width: 54px; height: 54px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${q.icon}
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <h4 style="margin: 0; color: #f8fafc; font-size: 1rem;">${q.title}</h4>
                <span style="font-size: 0.75rem; text-transform: uppercase; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${q.category}</span>
              </div>
              <p style="margin: 5px 0 8px 0; color: #cbd5e1; font-size: 0.88rem; line-height: 1.4;">${q.description}</p>
              
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="flex: 1; height: 8px; background: rgba(0, 0, 0, 0.5); border-radius: 999px; overflow: hidden; max-width: 220px;">
                  <div style="height: 100%; width: ${pct}%; background: ${isComplete ? '#22c55e' : '#38bdf8'}; transition: width 0.3s;"></div>
                </div>
                <span style="font-size: 0.82rem; color: #94a3b8; font-weight: 700;">${q.current} / ${q.target}${q.unit || ''}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <div style="font-size: 0.88rem; color: #fef08a; font-weight: 700;">
              +${q.rewardCoins.toLocaleString()} • +${q.rewardXp} XP
            </div>
            ${
              isComplete
                ? `<button class="btn btn-primary btn-claim-quest" data-quest="${q.id}" style="padding: 8px 18px; font-size: 0.9rem; font-weight: 700; background: #f59e0b; border-color: #d97706; color: #1e293b;">
                    🎁 Claim Reward
                   </button>`
                : `<button class="btn btn-disabled" disabled style="padding: 8px 16px; font-size: 0.85rem; opacity: 0.6;">In Progress (${pct}%)</button>`
            }
          </div>
        </div>
      `;
    });

    questsHtml += `
        </div>
        <div style="margin-top: 18px; text-align: center; color: #94a3b8; font-size: 0.85rem; background: rgba(15, 23, 42, 0.5); padding: 10px; border-radius: 8px;">
          💡 <em>When you claim a mission, a new harbor notice will take its place immediately!</em>
        </div>
      </div>
    `;

    this.openModal("📋 Harbor Noticeboard — Angler Quests", questsHtml);

    document.querySelectorAll('.btn-claim-quest').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const qId = e.currentTarget.dataset.quest;
        const claimed = this.questSystem.claimQuest(qId);
        if (claimed) {
          soundManager.playQuestComplete();
          this.showToast(`🎉 Quest Claimed! ${claimed.title} (+${claimed.rewardCoins.toLocaleString()} • +${claimed.rewardXp} XP)!`);
          this.openQuestsModal();
        }
      });
    });
  }

  // The Restoration Desk: Soothing, relaxed mouse/touch drag to wipe away ocean grime
  openRestorationDesk(relicItem, onDone) {
    this.activeModal = 'restoration';
    soundManager.playButtonClick();

    const relicType = relicItem.relicType || RELIC_TYPES.find(r => r.id === relicItem.id) || RELIC_TYPES[0];

    this.openModal('🏺 The Restoration Desk', `
      <div style="text-align:center; padding: 6px 0;">
        <p style="color:#94a3b8; font-size:13px; margin-bottom:12px;">
          Gently wipe your mouse or finger across the ocean grime to restore this ${relicType.era} artifact!
        </p>

        <div style="position:relative; width:340px; height:240px; margin:0 auto; border-radius:12px; overflow:hidden; border:2px solid rgba(251,191,36,0.3); background:#0f172a; cursor:crosshair; touch-action:none;">
          <canvas id="restoration-canvas" width="340" height="240"></canvas>
        </div>

        <div style="margin-top:14px; display:flex; align-items:center; justify-content:center; gap:12px;">
          <div style="width:200px; height:12px; background:rgba(255,255,255,0.1); border-radius:6px; overflow:hidden;">
            <div id="restoration-progress" style="width:0%; height:100%; background:linear-gradient(90deg, #f59e0b, #38bdf8); transition:width 0.1s ease;"></div>
          </div>
          <span id="restoration-pct" style="font-size:13px; font-weight:700; color:#fde68a;">0% Clean</span>
        </div>

        <div id="restoration-success" style="display:none; margin-top:14px;">
          <p style="color:#34d399; font-weight:700; font-size:15px; margin-bottom:8px;">✨ Fully Restored to Pristine Condition! (+$${relicType.restoredValue.toLocaleString()})</p>
          <button class="btn btn-primary" id="btn-restoration-finish">🏛️ Place on Cabin Shelf</button>
        </div>
      </div>
    `);

    const cvs = document.getElementById('restoration-canvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');

    const cols = 20;
    const rows = 14;
    const cellW = cvs.width / cols;
    const cellH = cvs.height / rows;
    const grime = [];
    let remainingCells = 0;

    for (let r = 0; r < rows; r++) {
      grime[r] = [];
      for (let c = 0; c < cols; c++) {
        const cx = (c + 0.5) * cellW - cvs.width * 0.5;
        const cy = (r + 0.5) * cellH - cvs.height * 0.5;
        const dist = Math.sqrt(cx * cx + cy * cy);
        if (dist < 80 + Math.random() * 15) {
          grime[r][c] = 1.0;
          remainingCells++;
        } else {
          grime[r][c] = 0;
        }
      }
    }

    const totalGrimeCells = Math.max(1, remainingCells);
    let cleanedCells = 0;
    let isCleaning = false;
    let isDone = false;
    let animTimer = 0;
    let raf = null;

    const wipeAt = (canvasX, canvasY, radius = 28) => {
      if (isDone) return;
      let wipedThisStroke = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grime[r][c] > 0) {
            const gx = (c + 0.5) * cellW;
            const gy = (r + 0.5) * cellH;
            const dx = canvasX - gx;
            const dy = canvasY - gy;
            if (dx * dx + dy * dy < radius * radius) {
              grime[r][c] = 0;
              cleanedCells++;
              wipedThisStroke++;
            }
          }
        }
      }

      if (wipedThisStroke > 0 && Math.random() < 0.3) {
        soundManager.playReelClick(1.8);
      }

      const pct = Math.min(100, Math.round((cleanedCells / totalGrimeCells) * 100));
      const progEl = document.getElementById('restoration-progress');
      const pctEl = document.getElementById('restoration-pct');
      if (progEl) progEl.style.width = `${pct}%`;
      if (pctEl) pctEl.textContent = `${pct}% Clean`;

      if (pct >= 82 && !isDone) {
        isDone = true;
        relicItem.restored = true;
        relicItem.value = relicType.restoredValue;
        if (!this.saveSystem.data.relics) this.saveSystem.data.relics = {};
        this.saveSystem.data.relics[relicType.id] = { count: 1, restored: true, restoredAt: Date.now() };
        this.saveSystem.save();

        soundManager.playTreasure();
        const successEl = document.getElementById('restoration-success');
        if (successEl) successEl.style.display = 'block';
        const finishBtn = document.getElementById('btn-restoration-finish');
        if (finishBtn) {
          finishBtn.addEventListener('click', () => {
            if (raf) cancelAnimationFrame(raf);
            this.closeModal();
            if (onDone) onDone();
          });
        }
      }
    };

    const handlePointer = (e) => {
      const rect = cvs.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      wipeAt(x, y);
    };

    cvs.addEventListener('mousedown', (e) => { isCleaning = true; handlePointer(e); });
    window.addEventListener('mousemove', (e) => { if (isCleaning) handlePointer(e); });
    window.addEventListener('mouseup', () => { isCleaning = false; });

    cvs.addEventListener('touchstart', (e) => { isCleaning = true; handlePointer(e); }, { passive: true });
    cvs.addEventListener('touchmove', (e) => { if (isCleaning) handlePointer(e); }, { passive: true });
    cvs.addEventListener('touchend', () => { isCleaning = false; });

    const drawDesk = () => {
      if (this.activeModal !== 'restoration') return;
      animTimer += 0.03;

      ctx.clearRect(0, 0, cvs.width, cvs.height);

      // Desk background
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 1;
      for (let x = 0; x < cvs.width; x += 35) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cvs.height); ctx.stroke();
      }

      // Restored artifact in center
      ctx.save();
      ctx.translate(cvs.width * 0.5, cvs.height * 0.5);
      ctx.scale(2.2, 2.2);
      if (typeof relicType.drawRestored === 'function') {
        relicType.drawRestored(ctx, animTimer);
      } else {
        ctx.font = '32px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(relicType.icon || '🏺', 0, 0);
      }
      ctx.restore();

      // Grime overlay
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grime[r][c] > 0) {
            const gx = c * cellW;
            const gy = r * cellH;
            ctx.fillStyle = ((r + c) % 2 === 0) ? 'rgba(30, 58, 42, 0.94)' : 'rgba(47, 79, 55, 0.96)';
            ctx.fillRect(gx - 1, gy - 1, cellW + 2, cellH + 2);

            if ((r * 7 + c * 13) % 5 === 0) {
              ctx.fillStyle = '#1f2937';
              ctx.beginPath();
              ctx.arc(gx + cellW * 0.5, gy + cellH * 0.5, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      raf = requestAnimationFrame(drawDesk);
    };

    drawDesk();
  }

  // The Cozy Field Log & Illustrated Antique Journal
  openJournal(defaultTab = 'fieldlog') {
    this.activeModal = 'journal';
    const save = this.saveSystem;
    const allSpecies = [...FISH_SPECIES, ...LEGENDARY_SPECIES];
    const caughtSpeciesCount = Object.keys(save.data.journal).length;
    const fossilCount = Object.keys(save.data.fossils).length;

    const renderFieldLogHtml = () => {
      let cardsHtml = '<div class="journal-grid">';

      allSpecies.forEach((species) => {
        const entry = save.getSpeciesJournalEntry(species.id);
        const isDiscovered = !!entry;
        const zoneName = DEPTH_ZONES[species.zone - 1]?.name || 'Deep Abyssal Ocean';

        if (isDiscovered) {
          const goldCrownBadge = entry.goldCrown ? `<span class="crown-badge gold-crown" title="Gold Crown (Giant)">👑 Giant</span>` : '';
          const silverCrownBadge = entry.silverCrown ? `<span class="crown-badge silver-crown" title="Silver Crown (Mini)">🥈 Mini</span>` : '';

          cardsHtml += `
            <div class="journal-card journal-discovered rarity-border-${species.rarity}">
              <div class="journal-card-top">
                <span class="rarity-tag rarity-${species.rarity}">${species.isMythic ? '🌟 MYTHIC' : species.rarity.toUpperCase()}</span>
                <span class="zone-tag">Sea ${species.zone}: ${zoneName}</span>
              </div>
              <div class="journal-visual">
                <div class="journal-fish-preview" style="color: ${species.primaryColor}; font-size: ${1.8 * (species.scaleFactor || 1)}rem;">
                  ${species.isMythic ? '🌟' : '🐟'}
                </div>
              </div>
              <div class="journal-card-info">
                <h4>${species.name} ${goldCrownBadge} ${silverCrownBadge}</h4>
                <p class="journal-lore">${species.lore}</p>
                <div class="journal-meta">
                  <span>Caught: <strong>${entry.count}</strong></span>
                  <span>Max: <strong>${entry.maxSize} cm</strong></span>
                  <span>Min: <strong>${entry.minSize || entry.maxSize} cm</strong></span>
                  ${entry.shinyCount > 0 ? `<span class="shiny-count">✨ ${entry.shinyCount} Shiny</span>` : ''}
                </div>
              </div>
            </div>
          `;
        } else {
          cardsHtml += `
            <div class="journal-card journal-undiscovered">
              <div class="journal-card-top">
                <span class="rarity-tag">${species.isMythic ? '🌟 MYTHIC' : '???'}</span>
                <span class="zone-tag">Sea ${species.zone}: ${zoneName}</span>
              </div>
              <div class="journal-visual">
                <div class="journal-fish-preview silhouette">${species.isMythic ? '🌟' : '🐟'}</div>
              </div>
              <div class="journal-card-info">
                <h4>Undiscovered Species</h4>
                <p class="journal-lore">Dwells between ${species.minDepth}m and ${species.maxDepth}m.${species.isMythic ? ' Responds to specific atmospheric weather and time of day!' : ' Cast deep to discover!'}</p>
              </div>
            </div>
          `;
        }
      });

      cardsHtml += '</div>';
      return cardsHtml;
    };

    const renderSkeletonsTab = () => {
      const skeletons = save.data.skeletons || { megalodonJaw: 0, dunkleosteus: 0, plesiosaur: 0 };
      const skelList = [
        {
          id: 'megalodonJaw',
          name: 'Colossal Megalodon Jaw Exhibit',
          desc: 'Reconstructed jaw of the supreme apex predator of the Cenozoic oceans.',
          pieces: skeletons.megalodonJaw || 0,
          reward: '$3,000 + 400 XP',
          icon: '🦈',
        },
        {
          id: 'dunkleosteus',
          name: 'Dunkleosteus Placoderm Armor',
          desc: 'Armored dermal plates of a 360-million-year-old Devonian super-carnivore.',
          pieces: skeletons.dunkleosteus || 0,
          reward: '$3,500 + 500 XP',
          icon: '🛡️',
        },
        {
          id: 'plesiosaur',
          name: 'Plesiosaur Marine Skeleton',
          desc: 'Full articulated serpentine neck and paddle skeleton of a Jurassic sea voyager.',
          pieces: skeletons.plesiosaur || 0,
          reward: '$4,500 + 700 XP',
          icon: '🦕',
        },
      ];

      let html = `
        <div class="skeletons-container">
          <p class="skeleton-header-tip">🦴 Collect ancient bone fragments from deep fossil silt and idle seabed drift pots to assemble museum skeleton exhibits!</p>
          <div class="skeletons-grid">
      `;

      skelList.forEach((sk) => {
        const pct = Math.min(100, Math.round((sk.pieces / 4) * 100));
        const isComplete = sk.pieces >= 4;

        html += `
          <div class="skeleton-card ${isComplete ? 'skeleton-complete' : ''}">
            <div class="skeleton-header">
              <span class="skeleton-icon">${sk.icon}</span>
              <div>
                <h4>${sk.name}</h4>
                <p class="skeleton-desc">${sk.desc}</p>
              </div>
            </div>

            <div class="skeleton-progress-row">
              <div class="bone-slots">
                <span class="bone-slot ${sk.pieces >= 1 ? 'bone-active' : ''}">🦴</span>
                <span class="bone-slot ${sk.pieces >= 2 ? 'bone-active' : ''}">🦴</span>
                <span class="bone-slot ${sk.pieces >= 3 ? 'bone-active' : ''}">🦴</span>
                <span class="bone-slot ${sk.pieces >= 4 ? 'bone-active' : ''}">🦴</span>
              </div>
              <span class="skeleton-count">${sk.pieces} / 4 Pieces</span>
            </div>

            <div class="ach-prog-bar">
              <div class="ach-prog-fill" style="width: ${pct}%"></div>
            </div>

            <div class="skeleton-status-tag">
              ${isComplete ? '🏛️ Fully Assembled Museum Centerpiece' : `Bonus Completion: ${sk.reward}`}
            </div>
          </div>
        `;
      });

      html += '</div></div>';
      return html;
    };

    const renderTrapsTab = () => {
      if (!this.trapSystem) return '<div>No trap system installed</div>';
      const trapCount = this.trapSystem.getTrapCount();

      if (trapCount <= 0) {
        return `
          <div class="traps-panel empty-trap-box" style="text-align:center; padding: 40px 20px;">
            <span style="font-size: 3.5rem;">🪤</span>
            <h3 style="margin: 14px 0 8px 0; color: #f8fafc; font-size: 1.25rem;">No Seabed Drift Pots Deployed</h3>
            <p style="color: #94a3b8; font-size: 0.92rem; max-width: 440px; margin: 0 auto 24px auto; line-height: 1.6;">
              Seabed drift pots passively catch coastal crabs, lobsters, pearl oysters, and prehistoric fossil bone fragments over time. Purchase your first pot in the Tackle Shop to begin idle harvesting!
            </p>
            <button class="btn btn-primary" id="btn-traps-go-shop">🛒 Visit Tackle Shop to Buy Traps</button>
          </div>
        `;
      }

      const capacity = this.trapSystem.getStorageCapacity();
      const items = this.trapSystem.getStoredItems();

      let itemsHtml = '<div class="traps-inventory-grid">';
      if (items.length === 0) {
        itemsHtml += `
          <div class="empty-trap-box">
            <span style="font-size: 2.5rem;">🌊</span>
            <p>Your seabed pots are actively soaking in coastal waters!</p>
            <p class="empty-sub">Traps passively catch crabs, oysters, and bone fragments every 2 minutes even while in other tabs.</p>
          </div>
        `;
      } else {
        items.forEach((it) => {
          itemsHtml += `
            <div class="trap-item-pill">
              <span class="trap-item-icon">${it.icon || '🦀'}</span>
              <div class="trap-item-info">
                <strong>${it.name}</strong>
                <span>+$${it.value} • +${it.xp} XP</span>
              </div>
            </div>
          `;
        });
      }
      itemsHtml += '</div>';

      return `
        <div class="traps-panel">
          <div class="traps-header-info">
            <div class="stat-box">
              <span class="stat-label">Active Drift Pots</span>
              <span class="stat-value">${trapCount} Pots Deployed</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Holding Net</span>
              <span class="stat-value">${items.length} / ${capacity} Catches</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Cycle Speed</span>
              <span class="stat-value">2.0 mins / soak</span>
            </div>
          </div>

          ${itemsHtml}

          <div class="traps-footer">
            <button class="btn btn-primary" id="btn-harvest-modal" ${items.length === 0 ? 'disabled' : ''}>
              🧺 Harvest All Traps (${items.length} Items)
            </button>
          </div>
        </div>
      `;
    };

    const renderCrewTab = () => {
      let crewHtml = `
        <div class="crew-panel" style="padding: 10px 0;">
          <p class="skeleton-header-tip" style="margin-bottom: 20px;">
            🐾 <strong>Vessel Companions & Deck Crew:</strong> Charming sea creatures and deck pets that visit and join your boat by chance as you spend time fishing across the Seven Seas!
          </p>
          <div class="journal-grid">
      `;

      Object.values(PET_DEFINITIONS).forEach((pet) => {
        const isUnlocked = save.hasPet(pet.id);
        if (isUnlocked) {
          crewHtml += `
            <div class="journal-card journal-discovered" style="border-color: #f59e0b; background: rgba(30, 41, 59, 0.9);">
              <div class="journal-card-top">
                <span class="rarity-tag" style="background: #f59e0b; color: #1e293b; font-weight: 800;">ACTIVE COMPANION</span>
                <span class="zone-tag">${pet.species}</span>
              </div>
              <div class="journal-visual" style="font-size: 3rem; padding: 15px 0; text-align: center;">
                <span style="filter: drop-shadow(0 4px 12px rgba(245, 158, 11, 0.4));">${pet.icon}</span>
              </div>
              <div class="journal-card-info">
                <h4 style="color: #fef08a;">${pet.name}</h4>
                <p class="journal-lore">${pet.lore}</p>
                <div style="margin-top: 10px; padding: 8px 12px; background: rgba(15, 23, 42, 0.6); border-radius: 6px; font-size: 0.85rem; color: #38bdf8; line-height: 1.4;">
                  ✨ <strong>Perk:</strong> ${pet.perk}
                </div>
                <div class="journal-meta" style="margin-top: 8px; justify-content: flex-end;">
                  <span style="color: #4ade80; font-weight: 700;">🐾 Aboard Vessel</span>
                </div>
              </div>
            </div>
          `;
        } else {
          crewHtml += `
            <div class="journal-card journal-undiscovered" style="opacity: 0.75; border-style: dashed;">
              <div class="journal-card-top">
                <span class="rarity-tag" style="background: #475569; color: #cbd5e1;">LOCKED COMPANION</span>
                <span class="zone-tag">${pet.species}</span>
              </div>
              <div class="journal-visual" style="font-size: 3rem; padding: 15px 0; text-align: center;">
                <span style="filter: grayscale(100%) opacity(35%);">${pet.icon}</span>
              </div>
              <div class="journal-card-info">
                <h4 style="color: #94a3b8;">${pet.name}</h4>
                <p class="journal-lore" style="font-style: italic; color: #64748b;">"${pet.lore}"</p>
                <div style="margin-top: 10px; padding: 8px 12px; background: rgba(15, 23, 42, 0.6); border-radius: 6px; font-size: 0.85rem; color: #fbbf24; line-height: 1.4;">
                  🎲 <strong>How to Attract:</strong> ${pet.unlockHint}
                </div>
                <div class="journal-meta" style="margin-top: 8px; justify-content: flex-end;">
                  <span style="color: #94a3b8; font-weight: 600;">🔒 Not yet arrived</span>
                </div>
              </div>
            </div>
          `;
        }
      });

      crewHtml += `
          </div>
          <div style="margin-top: 20px; text-align: center; color: #94a3b8; font-size: 0.88rem; background: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 8px;">
            💡 <em>Tip: The more dives you make and fish you catch across the Seven Seas, the higher your chance of attracting friendly companions to your boat!</em>
          </div>
        </div>
      `;
      return crewHtml;
    };

    const relicData = save.data.relics || {};
    const restoredRelicsCount = Object.values(relicData).filter(r => r.restored).length;
    const activeTrapCount = this.trapSystem ? this.trapSystem.getTrapCount() : 0;
    const unlockedPetCount = ['cat', 'pelican', 'dolphin'].filter(id => save.hasPet(id)).length;

    const modalBody = `
      <div class="journal-wrapper">
        <div class="journal-tabs">
          <button class="tab-btn ${defaultTab === 'fieldlog' ? 'active' : ''}" id="tab-fieldlog">📜 Field Log (${caughtSpeciesCount} / ${allSpecies.length})</button>
          <button class="tab-btn ${defaultTab === 'crew' ? 'active' : ''}" id="tab-crew">🐾 Vessel Crew (${unlockedPetCount} / 3)</button>
          <button class="tab-btn ${defaultTab === 'relics' ? 'active' : ''}" id="tab-relics">🏺 Cabin Shelf (${restoredRelicsCount} / 5)</button>
          <button class="tab-btn ${defaultTab === 'skeletons' ? 'active' : ''}" id="tab-skeletons">🦴 Skeletons</button>
          <button class="tab-btn ${defaultTab === 'traps' ? 'active' : ''}" id="tab-traps">🪤 Seabed Traps${activeTrapCount > 0 ? '' : ' (Not Owned)'}</button>
          <button class="tab-btn ${defaultTab === 'traps' ? 'active' : ''}" id="tab-traps">🪤 Seabed Traps</button>
          <button class="tab-btn" id="tab-fossils">🏛️ Relic Museum (${fossilCount} / 5)</button>
          <button class="tab-btn" id="tab-aquarium">🐠 Virtual Aquarium</button>
        </div>
        <div id="journal-tab-content">
          ${defaultTab === 'crew' ? renderCrewTab() : defaultTab === 'traps' ? renderTrapsTab() : defaultTab === 'skeletons' ? renderSkeletonsTab() : defaultTab === 'relics' ? '' : renderFieldLogHtml()}
          ${defaultTab === 'traps' ? renderTrapsTab() : defaultTab === 'skeletons' ? renderSkeletonsTab() : defaultTab === 'relics' ? '' : renderFieldLogHtml()}
        </div>
      </div>
    `;

    this.openModal("📜 Angler's Field Log & Illustrated Journal", modalBody);

    if (defaultTab === 'relics') {
      this.renderCabinShelfTab();
    } else if (defaultTab === 'traps') {
      const harvestBtn = document.getElementById('btn-harvest-modal');
      if (harvestBtn) {
        harvestBtn.addEventListener('click', () => {
          this.handleTrapClick();
          this.openJournal('traps');
        });
      }
      const goShopBtn = document.getElementById('btn-traps-go-shop');
      if (goShopBtn) {
        goShopBtn.addEventListener('click', () => {
          this.openShop();
        });
      }
    }

    const setupTabListeners = () => {
      document.getElementById('tab-fieldlog').addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.getElementById('tab-fieldlog').classList.add('active');
        document.getElementById('journal-tab-content').innerHTML = renderFieldLogHtml();
      });

      const crewBtn = document.getElementById('tab-crew');
      if (crewBtn) {
        crewBtn.addEventListener('click', () => {
          document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
          crewBtn.classList.add('active');
          document.getElementById('journal-tab-content').innerHTML = renderCrewTab();
        });
      }

      document.getElementById('tab-relics').addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.getElementById('tab-relics').classList.add('active');
        this.renderCabinShelfTab();
      });

      document.getElementById('tab-skeletons').addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.getElementById('tab-skeletons').classList.add('active');
        document.getElementById('journal-tab-content').innerHTML = renderSkeletonsTab();
      });

      document.getElementById('tab-traps').addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.getElementById('tab-traps').classList.add('active');
        document.getElementById('journal-tab-content').innerHTML = renderTrapsTab();
        const harvestBtn = document.getElementById('btn-harvest-modal');
        if (harvestBtn) {
          harvestBtn.addEventListener('click', () => {
            this.handleTrapClick();
            this.openJournal('traps');
          });
        }
        const goShopBtn = document.getElementById('btn-traps-go-shop');
        if (goShopBtn) {
          goShopBtn.addEventListener('click', () => {
            this.openShop();
          });
        }
      });

      document.getElementById('tab-fossils').addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.getElementById('tab-fossils').classList.add('active');
        this.renderFossilMuseumTab();
      });

      document.getElementById('tab-aquarium').addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.getElementById('tab-aquarium').classList.add('active');
        this.renderAquariumTab();
      });

      const harvestBtn = document.getElementById('btn-harvest-modal');
      if (harvestBtn) {
        harvestBtn.addEventListener('click', () => {
          this.handleTrapClick();
          this.openJournal('traps');
        });
      }
    };

    setupTabListeners();
  }

  // Cabin Shelf: Displays the 5 archaeological relics on an antique wooden shelf
  renderCabinShelfTab() {
    const save = this.saveSystem;
    const relicData = save.data.relics || {};

    let shelfHtml = `
      <div class="cabin-shelf-container">
        <p class="shelf-header-tip">🏺 Historical artifacts dredged from the seabed, displayed on your boat's mahogany cabin shelf.</p>
        <div class="cabin-shelf-grid">
    `;

    RELIC_TYPES.forEach((relic) => {
      const entry = relicData[relic.id];
      const isDiscovered = !!entry;
      const isRestored = entry?.restored;

      if (isRestored) {
        shelfHtml += `
          <div class="relic-shelf-card relic-restored rarity-border-${relic.rarity}">
            <div class="relic-pedestal">
              <span class="relic-icon" style="font-size:2.4rem;">${relic.icon}</span>
              <div class="relic-sparkle-dot">✨</div>
            </div>
            <div class="relic-info">
              <div class="relic-era-tag">${relic.era} • Restored</div>
              <h4>${relic.name}</h4>
              <p class="relic-desc">${relic.description}</p>
              <div class="relic-meta">
                <span class="relic-value">Value: <strong>$${relic.restoredValue.toLocaleString()}</strong></span>
                <span class="relic-status" style="color:#34d399; font-weight:700;">🏛️ Polished on Shelf</span>
              </div>
            </div>
          </div>
        `;
      } else if (isDiscovered) {
        shelfHtml += `
          <div class="relic-shelf-card relic-barnacled rarity-border-${relic.rarity}">
            <div class="relic-pedestal">
              <span class="relic-icon" style="filter: brightness(0.6) sepia(0.6); font-size:2.4rem;">${relic.icon}</span>
              <div class="relic-grime-badge">Barnacled</div>
            </div>
            <div class="relic-info">
              <div class="relic-era-tag">${relic.era} • Needs Cleaning</div>
              <h4>${relic.name}</h4>
              <p class="relic-desc">Encased in marine sediment and barnacle shells.</p>
              <div class="relic-meta" style="margin-top:8px;">
                <button class="btn btn-warning btn-sm btn-open-desk" data-relic="${relic.id}">
                  🪥 Clean at Restoration Desk
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        shelfHtml += `
          <div class="relic-shelf-card relic-locked">
            <div class="relic-pedestal empty-pedestal">
              <span class="relic-icon" style="filter: grayscale(1) opacity(0.2); font-size:2.4rem;">🏺</span>
            </div>
            <div class="relic-info">
              <div class="relic-era-tag">Undiscovered</div>
              <h4>Lost Archaeological Relic</h4>
              <p class="relic-desc">Rests on the seabed between ${relic.minDepth}m and ${relic.maxDepth}m. Cast deep to dredge it!</p>
            </div>
          </div>
        `;
      }
    });

    shelfHtml += '</div></div>';

    document.getElementById('journal-tab-content').innerHTML = shelfHtml;

    document.querySelectorAll('.btn-open-desk').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const relicId = e.currentTarget.dataset.relic;
        const relicType = RELIC_TYPES.find(r => r.id === relicId);
        if (relicType) {
          this.openRestorationDesk({ id: relicId, relicType }, () => {
            this.openJournal('relics');
          });
        }
      });
    });
  }

  renderFossilMuseumTab() {
    const fossils = TREASURE_ITEMS.filter((t) => t.category === 'fossil');
    const save = this.saveSystem;

    let html = '<div class="fossil-grid">';
    fossils.forEach((f) => {
      const entry = save.data.fossils[f.id];
      const isFound = !!entry;

      if (isFound) {
        html += `
          <div class="fossil-card fossil-discovered rarity-border-${f.rarity}">
            <div class="fossil-pedestal">
              <span class="fossil-icon">🦴</span>
            </div>
            <div class="fossil-info">
              <h4>${f.name}</h4>
              <p class="fossil-lore">${f.lore}</p>
              <div class="fossil-meta">
                <span>Estimated Value: <strong>$${f.value.toLocaleString()}</strong></span>
                <span>Specimens Excavated: <strong>${entry.count}</strong></span>
              </div>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="fossil-card fossil-locked">
            <div class="fossil-pedestal empty-pedestal">
              <span class="fossil-icon" style="filter: grayscale(1) opacity(0.3);">🦴</span>
            </div>
            <div class="fossil-info">
              <h4>Unknown Fossilized Specimen</h4>
              <p class="fossil-lore">Buried in deep oceanic silt between ${f.minDepth}m and ${f.maxDepth}m. Equip a Paleo-Scanner to detect it!</p>
            </div>
          </div>
        `;
      }
    });
    html += '</div>';

    document.getElementById('journal-tab-content').innerHTML = html;
  }

  renderAquariumTab() {
    const save = this.saveSystem;
    const caughtKeys = Object.keys(save.data.journal);
    const allSpecies = [...FISH_SPECIES, ...LEGENDARY_SPECIES];

    if (caughtKeys.length === 0) {
      document.getElementById('journal-tab-content').innerHTML = `
        <div class="empty-aquarium">
          <p style="font-size: 3rem;">🫧</p>
          <h3>Your Seven Seas Aquarium is Currently Empty</h3>
          <p>Cast your line into the ocean and catch fish to populate your personal marine sanctuary!</p>
        </div>
      `;
      return;
    }

    document.getElementById('journal-tab-content').innerHTML = `
      <div class="aquarium-container">
        <div class="aquarium-controls">
          <span>Click the tank to tap the glass!</span>
          <button class="btn btn-secondary btn-sm" id="btn-feed-fish">🌾 Drop Fish Food</button>
        </div>
        <canvas id="aquarium-canvas" width="760" height="380"></canvas>
      </div>
    `;

    this.startAquariumCanvas(allSpecies);
  }

  startAquariumCanvas(allSpecies) {
    const canvas = document.getElementById('aquarium-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const save = this.saveSystem;

    const aquariumFish = [];
    Object.keys(save.data.journal).forEach((speciesId) => {
      const species = allSpecies.find((s) => s.id === speciesId);
      if (species) {
        aquariumFish.push({
          species,
          x: 40 + Math.random() * (canvas.width - 80),
          y: 40 + Math.random() * (canvas.height - 80),
          vx: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
          vy: (Math.random() * 2 - 1) * 0.4,
          timer: Math.random() * 10,
          scale: species.scaleFactor || 1.0,
        });
      }
    });

    const ripples = [];
    const foodPellets = [];

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripples.push({ x, y, r: 2, alpha: 1.0 });
      soundManager.playSplash();

      aquariumFish.forEach((f) => {
        const dx = f.x - x;
        const dy = f.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          f.vx = (dx / dist) * 3.5;
          f.vy = (dy / dist) * 2.0;
        }
      });
    });

    const feedBtn = document.getElementById('btn-feed-fish');
    if (feedBtn) {
      feedBtn.addEventListener('click', () => {
        for (let i = 0; i < 6; i++) {
          foodPellets.push({
            x: 60 + Math.random() * (canvas.width - 120),
            y: 10,
            vy: 0.8 + Math.random() * 0.6,
          });
        }
        soundManager.playButtonClick();
      });
    }

    let aqRaf = null;
    const renderAq = () => {
      if (this.activeModal !== 'journal' || !document.getElementById('aquarium-canvas')) {
        cancelAnimationFrame(aqRaf);
        return;
      }

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(0, canvas.height - 35, canvas.width, 35);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, canvas.height - 40, canvas.width, 5);

      for (let i = foodPellets.length - 1; i >= 0; i--) {
        const fp = foodPellets[i];
        fp.y += fp.vy;
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        if (fp.y >= canvas.height - 35) {
          foodPellets.splice(i, 1);
        }
      }

      aquariumFish.forEach((f) => {
        f.timer += 0.05;
        f.x += f.vx;
        f.y += f.vy + Math.sin(f.timer) * 0.4;

        if (f.x < 30) f.vx = Math.abs(f.vx);
        if (f.x > canvas.width - 30) f.vx = -Math.abs(f.vx);
        if (f.y < 30) f.vy = Math.abs(f.vy);
        if (f.y > canvas.height - 55) f.vy = -Math.abs(f.vy);

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.scale((f.vx > 0 ? 1 : -1) * f.scale, f.scale);
        ctx.fillStyle = f.species.primaryColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = f.species.finColor;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-22, -6 + Math.sin(f.timer * 4) * 3);
        ctx.lineTo(-22, 6 + Math.sin(f.timer * 4) * 3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8, -2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(9, -2, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 1.8;
        r.alpha -= 0.02;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        if (r.alpha <= 0) ripples.splice(i, 1);
      }

      aqRaf = requestAnimationFrame(renderAq);
    };

    renderAq();
  }

  openAchievements() {
    this.activeModal = 'achievements';
    const save = this.saveSystem;

    const milestoneIds = [
      'cartographer_unknown',
      'friend_of_the_deep',
      'titan_tamer',
      'patience_of_the_tide',
    ];

    const milestones = ACHIEVEMENTS.filter((a) => milestoneIds.includes(a.id));
    const regularAchievements = ACHIEVEMENTS.filter((a) => !milestoneIds.includes(a.id));

    let html = `
      <div class="trophy-room-container">
        <!-- Grand Milestones Showcase Banner -->
        <div class="trophy-showcase-section">
          <div class="trophy-section-title">
            <span>✨ Hall of Grand Milestones</span>
            <span style="font-size:0.8rem; color:#94a3b8; font-weight:normal;">Legendary Angler Feats</span>
          </div>
          <div class="milestones-highlight-grid">
    `;

    milestones.forEach((ach) => {
      const isUnlocked = save.isAchievementUnlocked(ach.id);
      const prog = ach.progress(save.data.stats, save.data);
      const pct = Math.min(100, Math.round((prog.current / prog.target) * 100));

      html += `
        <div class="milestone-hero-card ${isUnlocked ? 'milestone-unlocked' : 'milestone-in-progress'}">
          <div class="milestone-badge-pedestal">
            <span class="milestone-badge-icon">${ach.icon}</span>
            ${isUnlocked ? '<span class="milestone-gold-star">⭐</span>' : ''}
          </div>
          <div class="milestone-info">
            <div class="milestone-title-row">
              <h4>${ach.name}</h4>
              <span class="milestone-bounty">+$${ach.reward.toLocaleString()}</span>
            </div>
            <p class="milestone-desc">${ach.description}</p>
            <div class="milestone-bar-container">
              <div class="ach-prog-bar">
                <div class="ach-prog-fill" style="width: ${pct}%; background: ${isUnlocked ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #38bdf8, #818cf8)'};"></div>
              </div>
              <div class="milestone-stat-label">
                <span>Progress: ${prog.current} / ${prog.target}</span>
                <span>${pct}% ${isUnlocked ? '• COMPLETED 🏆' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>

        <!-- Seafaring Medals & Badges -->
        <div class="trophy-section-title" style="margin-top:24px;">
          <span>🎖️ Seafaring Badges & Medals</span>
        </div>
        <div class="achievements-grid">
    `;

    regularAchievements.forEach((ach) => {
      const isUnlocked = save.isAchievementUnlocked(ach.id);
      const prog = ach.progress(save.data.stats, save.data);
      const pct = Math.min(100, Math.round((prog.current / prog.target) * 100));

      html += `
        <div class="achievement-card ${isUnlocked ? 'ach-unlocked' : 'ach-locked'}">
          <div class="ach-icon">${ach.icon}</div>
          <div class="ach-details">
            <div class="ach-title-row">
              <h4>${ach.name}</h4>
              <span class="ach-reward">+$${ach.reward.toLocaleString()}</span>
            </div>
            <p class="ach-desc">${ach.description}</p>
            <div class="ach-prog-bar">
              <div class="ach-prog-fill" style="width: ${pct}%"></div>
            </div>
            <div class="ach-prog-label">${prog.current} / ${prog.target} (${pct}%)</div>
          </div>
          <div class="ach-status">
            ${isUnlocked ? '✅' : '🔒'}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    this.openModal('🏆 Logbook & Trophy Room', html);
  }

  openSettings() {
    this.activeModal = 'settings';
    const stats = this.saveSystem.data.stats;
    const settings = this.saveSystem.data.settings;

    const modalBody = `
      <div class="settings-wrapper">
        <div class="settings-section">
          <h3>🎮 Career Statistics</h3>
          <div class="stats-table">
            <div class="stat-row"><span>Angler Level:</span><strong>Level ${this.saveSystem.data.level}</strong></div>
            <div class="stat-row"><span>Total Fish Caught:</span><strong>${stats.totalFishCaught}</strong></div>
            <div class="stat-row"><span>Gold Crowns Found:</span><strong>👑 ${stats.goldCrowns || 0} Giant Records</strong></div>
            <div class="stat-row"><span>Silver Crowns Found:</span><strong>🥈 ${stats.silverCrowns || 0} Mini Records</strong></div>
            <div class="stat-row"><span>Mythic Titans Landed:</span><strong>🌟 ${stats.mythicsCaught || 0}</strong></div>
            <div class="stat-row"><span>Max Depth Reached:</span><strong>${stats.maxDepthReached}m</strong></div>
            <div class="stat-row"><span>Total Gold Earned:</span><strong>$${stats.totalGoldEarned.toLocaleString()}</strong></div>
            <div class="stat-row"><span>Unique Species Discovered:</span><strong>${stats.uniqueSpeciesCaught} / 33</strong></div>
            <div class="stat-row"><span>Prehistoric Fossils Found:</span><strong>${stats.totalFossilsCollected} / 5</strong></div>
            <div class="stat-row"><span>Biggest Catch:</span><strong>${stats.biggestCatchName} (${stats.biggestCatchCm} cm, ${stats.heaviestCatchKg} kg)</strong></div>
          </div>
        </div>

        <div class="settings-section">
          <h3>🔊 Audio Controls</h3>
          <div class="setting-item">
            <label for="music-vol">Music Volume:</label>
            <input type="range" id="music-vol" min="0" max="1" step="0.05" value="${settings.musicVolume}">
          </div>
          <div class="setting-item">
            <label for="sfx-vol">Sound Effects Volume:</label>
            <input type="range" id="sfx-vol" min="0" max="1" step="0.05" value="${settings.sfxVolume}">
          </div>
        </div>

        <div class="settings-section">
          <h3>⚠️ Save Data Management</h3>
          <p class="settings-danger-warning">Resetting progress will permanently erase your currency, level, upgrades, journal, fossils, and achievements.</p>
          <button class="btn btn-danger" id="btn-trigger-reset">Reset All Game Progress</button>
        </div>
      </div>
    `;

    this.openModal('⚙️ Settings & Career Records', modalBody);

    document.getElementById('music-vol').addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      soundManager.setMusicVolume(vol);
      this.saveSystem.data.settings.musicVolume = vol;
      this.saveSystem.save();
    });

    document.getElementById('sfx-vol').addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      soundManager.setSfxVolume(vol);
      this.saveSystem.data.settings.sfxVolume = vol;
      this.saveSystem.save();
    });

    document.getElementById('btn-trigger-reset').addEventListener('click', () => {
      this.openConfirmReset();
    });
  }

  openConfirmReset() {
    this.activeModal = 'confirmReset';
    const modalBody = `
      <div class="confirm-reset-box">
        <p class="warning-icon">⚠️</p>
        <h3>Reset All Seven Seas Progress?</h3>
        <p>This action cannot be undone. All caught species, fossils, coins, upgrades, and trophies will be reset to Day 1.</p>
        <div class="confirm-actions">
          <button class="btn btn-danger" id="btn-do-reset">Yes, Reset Everything</button>
          <button class="btn btn-secondary" id="btn-cancel-reset">Cancel & Return</button>
        </div>
      </div>
    `;

    this.openModal('Reset Game Progress', modalBody);

    document.getElementById('btn-do-reset').addEventListener('click', () => {
      this.saveSystem.reset();
      this.showToast('Game progress has been reset.');
      this.closeModal();
      window.location.reload();
    });

    document.getElementById('btn-cancel-reset').addEventListener('click', () => {
      this.openSettings();
    });
  }

  openTutorial() {
    this.activeModal = 'tutorial';
    const modalBody = `
      <div class="tutorial-wrapper">
        <div class="tutorial-step">
          <div class="step-num">1</div>
          <div class="step-text">
            <h4>Dual-Sided Aiming & Casting</h4>
            <p>You can cast to the <strong>left or right</strong> side of the boat! Click and pull back to set your trajectory arc. Release to launch!</p>
          </div>
        </div>

        <div class="tutorial-step">
          <div class="step-num">2</div>
          <div class="step-text">
            <h4>Atmospheric World Cycle & Weather</h4>
            <p>The ocean transitions naturally through <strong>Dawn, Day, Golden Sunset, and Biolum Night</strong>. Rare mythic titans only emerge during specific sky and weather conditions!</p>
          </div>
        </div>

        <div class="tutorial-step">
          <div class="step-num">3</div>
          <div class="step-text">
            <h4>Relaxed, Forgiving Reel Rhythm</h4>
            <p>When hauling in rare legends, a calming rhythmic wave pulse guides your reel. Reeling during the gentle <strong>Lull</strong> retrieves faster. Line never breaks!</p>
          </div>
        </div>

        <div class="tutorial-step">
          <div class="step-num">4</div>
          <div class="step-text">
            <h4>Idle Drift Pots & Longlines</h4>
            <p>Set seabed traps that passively gather coastal crabs, oysters, pearls, and prehistoric bone fragments while you relax or keep the game in a side tab!</p>
          </div>
        </div>

        <div class="tutorial-step">
          <div class="step-num">5</div>
          <div class="step-text">
            <h4>Size Records & Crown Badges</h4>
            <p>Discover <strong>👑 Gold Crowns (Giant)</strong> and <strong>🥈 Silver Crowns (Mini)</strong> for huge coin bonuses and illustrated Field Log bragging rights!</p>
          </div>
        </div>

        <div class="tutorial-footer">
          <button class="btn btn-primary" id="btn-tutorial-ready">Let's Fish! 🎣</button>
        </div>
      </div>
    `;

    this.openModal("🎣 Seven Seas Angler's Field Guide", modalBody);

    document.getElementById('btn-tutorial-ready').addEventListener('click', () => {
      this.closeModal();
    });
  }
}

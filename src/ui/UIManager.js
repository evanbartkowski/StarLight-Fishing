import { getRealmDepthZone as getDepthSubZone } from '../data/RealmDepths.js';
import { crateArtwork, crateRewardGallery } from './CratePresentation.js';
import { displaySpeciesName } from '../systems/CatchTraits.js';
import { openCatchCard, specimen } from './CatchCard.js';
import { shareAquarium, visitAquarium } from './AquariumSocial.js';
import { premiumPurchase } from '../systems/PremiumPurchases.js';
import { DAILY_REWARDS, achievementGems } from '../data/GemEconomy.js';
import { Fish } from '../entities/Fish.js';
import { FANTASY_SEAS } from '../entities/SeasData.js';
import { Treasure } from '../entities/Treasure.js';
import { ANGLER_OPTIONS, AQUARIUM_OPTIONS, normalizeCustomization, drawAngler, drawAquariumDecor, BOAT_TRINKETS, BOAT_SKIN_OPTIONS, drawBoatTrinket } from '../data/CustomizationData.js';
import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';
import { ACHIEVEMENTS } from '../data/AchievementsData.js';
import { FISH_SPECIES, DEPTH_ZONES, RARITY_CONFIG } from '../data/FishData.js';
import { LEGENDARY_SPECIES } from '../data/legendaries.js';
import { TREASURE_ITEMS } from '../data/TreasureData.js';
import { RELIC_TYPES } from '../data/RelicsData.js';
import { PET_DEFINITIONS } from '../data/PetsData.js';
import { CRATE_RANKS, CRATE_GEM_PRICES, rollCrateLoot, getCrateDropPreview } from '../data/CrateData.js';
import { soundManager } from '../audio/SoundManager.js';
import { worldCycle } from '../systems/WorldCycle.js';
import { ZONE_ALMANAC_DATA, getZoneProgress, claimZonePerk } from '../data/almanac.config.js';
import { ABERRATIONS_CATALOG } from '../data/aberrations.config.js';
import { accountManager } from '../systems/AccountManager.js';
import { leaderboardManager } from '../systems/LeaderboardManager.js';
import { SHOP_ART, REALM_ART, RADIO_ART, JOURNAL_TAB_ART, CREW_ART, FOSSIL_ART, MISC_ART, SETTINGS_ART, INV_FILTER_ART } from './CustomVectorArt.js';
import { TRAP_LOOT_TABLE } from '../systems/TrapSystem.js';


const escapeScoreboardText = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const HUD_ICONS = {
  map: '<svg viewBox="0 0 24 24"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15"/></svg>',
  trap: '<svg viewBox="0 0 24 24"><path d="M4 8h16l-2 12H6L4 8Zm2 0 2-5h8l2 5M8 12v4m4-4v4m4-4v4M12 3v-1"/></svg>',
  quests: '<svg viewBox="0 0 24 24"><path d="M6 3h12a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Zm2 5h8m-8 4h8m-8 4h5"/></svg>',
  inventory: '<svg viewBox="0 0 24 24"><path d="M5 8h14l1 13H4L5 8Zm3 0V6a4 4 0 0 1 8 0v2m-4 4v4m-2-2 2 2 2-2"/></svg>',
  shop: '<svg viewBox="0 0 24 24"><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L21 9H6m4 12h.01M18 21h.01"/></svg>',
  journal: '<svg viewBox="0 0 24 24"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5zm0 0v13M8 6h8m-8 4h8m-8 4h6"/></svg>',
  aquarium: '<svg viewBox="0 0 24 24"><path d="M3 12c3-5 10-7 15-3l3-3v12l-3-3c-5 4-12 2-15-3Zm5-1h.01m2 5 2-2m-8-3-2-2m16 3h1"/></svg>',
  radio: '<svg viewBox="0 0 24 24"><path d="M4 7h16v14H4zM7 7l10-4m-9 8h5m-5 4h5m5 1h.01"/><circle cx="17" cy="12" r="1"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v3m0 14v3m10-10h-3M5 12H2m17.1-7.1-2.1 2.1M7 17l-2.1 2.1m14.2 0L17 17M7 7 4.9 4.9"/></svg>',
  help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.6 1.3c-.9 1.1-2.2 1.4-2.2 3.2m0 3h.01"/></svg>',
  sound: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6l-5 4H4Zm12-1a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12"/></svg>',
  muted: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6l-5 4H4Zm12-1 5 6m0-6-5 6"/></svg>',
};
const hudIcon = name => `<span class="hud-icon" aria-hidden="true">${HUD_ICONS[name]}</span>`;

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
      this.showAchievementPopup(achievement);
      soundManager.playUpgrade();
    };

    this.saveSystem.onLevelUp = (newLevel) => {
      this.showToast(`⭐ LEVEL UP! You reached Angler Level ${newLevel}! (+$${Math.min(750, newLevel * 100)})`);
      soundManager.playUpgrade();
    };
  }

  setChatManager(manager) {
    this.chatManager = manager;
    const panel = document.createElement('section');
    panel.id = 'fleet-radio';
    panel.hidden = true;
    panel.innerHTML = `<div class="fleet-header"><strong>Fleet Radio</strong><button type="button" id="fleet-toggle" aria-label="Minimize Fleet Radio" aria-expanded="true" aria-controls="fleet-content" title="Minimize Fleet Radio">&minus;</button></div>
      <div id="fleet-content"><small>Live messages from captains across the seas</small>
      <div id="fleet-messages" aria-live="polite"></div>
      <form id="fleet-form"><input id="fleet-input" maxlength="180" aria-label="Fleet message" placeholder="Message players..."><button type="submit">Send</button></form></div>`;
    document.body.appendChild(panel);
    const toggle = panel.querySelector('#fleet-toggle');
    const content = panel.querySelector('#fleet-content');
    toggle.addEventListener('click', () => {
      const minimized = panel.classList.toggle('fleet-minimized');
      content.hidden = minimized;
      toggle.innerHTML = minimized ? '&#128251;' : '&minus;';
      toggle.setAttribute('aria-expanded', String(!minimized));
      toggle.setAttribute('aria-label', minimized ? 'Open Fleet Radio' : 'Minimize Fleet Radio');
      toggle.title = minimized ? 'Open Fleet Radio' : 'Minimize Fleet Radio';
      if (!minimized) {
        panel.querySelector('input').focus();
        list.scrollTop = list.scrollHeight;
      }
    });
    const hud = document.getElementById('game-hud');
    const positionFleet = () => {
      panel.style.top = `${hud.getBoundingClientRect().bottom + 6}px`;
    };
    this.fleetHudObserver = new ResizeObserver(positionFleet);
    this.fleetHudObserver.observe(hud);
    positionFleet();
    const list = panel.querySelector('#fleet-messages');
    manager.onMessagesChanged = messages => {
      list.replaceChildren(...messages.map(msg => {
        const row = document.createElement('p');
        const profile = document.createElement('button');
        profile.className = 'chat-profile'; profile.textContent = msg.isSelf ? 'You' : msg.sender;
        profile.disabled = !msg.senderId || msg.senderId === 'server';
        profile.title = "Visit this captain's aquarium";
        profile.onclick = () => visitAquarium(this, msg.senderId);
        row.append(profile, document.createTextNode(`: ${msg.text}`));
        const aquarium = msg.text.match(/[?&]aquarium=([\w-]{1,128})/);
        if (aquarium) {
          const visit = document.createElement('button'); visit.className = 'btn btn-secondary btn-sm'; visit.textContent = 'Visit Aquarium';
          visit.onclick = () => visitAquarium(this, aquarium[1]); row.appendChild(visit);
        }
        return row;
      }));
      list.scrollTop = list.scrollHeight;
    };
    panel.addEventListener('keydown', event => event.stopPropagation());
    panel.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const input = panel.querySelector('input');
      const button = panel.querySelector('button[type=submit]');
      if (button.disabled || !input.value.trim()) return;
      const text = input.value;
      button.disabled = true;
      const sent = await manager.sendMessage(text);
      button.disabled = false;
      if (sent && input.value === text) input.value = '';
      if (!sent) this.showToast('Message not sent. Reconnect or wait two seconds before trying again.');
    });
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

  setZoneManager(zoneMgr) {
    this.zoneManager = zoneMgr;
  }

  announceZoneEntry(zone) {
    const banner = document.getElementById('zone-entry-banner');
    if (!banner || !zone) return;
    const iconEl = document.getElementById('zone-banner-icon');
    const titleEl = document.getElementById('zone-banner-title');
    const descEl = document.getElementById('zone-banner-desc');
    if (iconEl) iconEl.textContent = zone.icon || '🗺️';
    if (titleEl) titleEl.textContent = zone.name;
    if (descEl) descEl.textContent = `${zone.subtitle} • ${zone.mechanic?.badge || ''}`;

    banner.classList.remove('zone-banner-hidden');
    banner.classList.add('zone-banner-visible');

    soundManager.playUpgrade();
    setTimeout(() => {
      banner.classList.remove('zone-banner-visible');
      banner.classList.add('zone-banner-hidden');
    }, 4500);
  }

  playCloudTransition(onMidpoint, onComplete) {
    const existing = document.getElementById('realm-cloud-transition');
    if (existing) existing.remove();

    const transitionOverlay = document.createElement('div');
    transitionOverlay.id = 'realm-cloud-transition';
    transitionOverlay.className = 'realm-cloud-transition';
    transitionOverlay.setAttribute('aria-hidden', 'true');
    transitionOverlay.innerHTML = `
      <div class="cloud-mist-backdrop"></div>
      <div class="cloud-layer cloud-layer-left">
        <svg class="cloud-svg-bank" viewBox="0 0 1000 700" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cloudGradL1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="65%" stop-color="#f0f9ff"/>
              <stop offset="100%" stop-color="#bae6fd"/>
            </linearGradient>
            <linearGradient id="cloudGradL2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="60%" stop-color="#e0f2fe"/>
              <stop offset="100%" stop-color="#7dd3fc"/>
            </linearGradient>
          </defs>
          <path d="M-100,750 L-100,220 Q0,100 120,170 Q240,60 390,140 Q540,40 690,160 Q840,80 960,250 L960,750 Z" fill="url(#cloudGradL2)" opacity="0.92"/>
          <path d="M-100,750 L-100,340 Q100,220 250,310 Q400,180 570,280 Q740,160 900,320 L1050,420 L1050,750 Z" fill="url(#cloudGradL1)"/>
        </svg>
      </div>
      <div class="cloud-layer cloud-layer-right">
        <svg class="cloud-svg-bank" viewBox="0 0 1000 700" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cloudGradR1" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="65%" stop-color="#f0f9ff"/>
              <stop offset="100%" stop-color="#bae6fd"/>
            </linearGradient>
            <linearGradient id="cloudGradR2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="60%" stop-color="#e0f2fe"/>
              <stop offset="100%" stop-color="#7dd3fc"/>
            </linearGradient>
          </defs>
          <path d="M1100,750 L1100,220 Q1000,100 880,170 Q760,60 610,140 Q460,40 310,160 Q160,80 40,250 L-50,380 L-50,750 Z" fill="url(#cloudGradR2)" opacity="0.92"/>
          <path d="M1100,750 L1100,340 Q900,220 750,310 Q600,180 430,280 Q260,160 100,320 L-50,420 L-50,750 Z" fill="url(#cloudGradR1)"/>
        </svg>
      </div>
      <div class="cloud-puffs-cluster">
        <div class="cloud-puff puff-1"></div>
        <div class="cloud-puff puff-2"></div>
        <div class="cloud-puff puff-3"></div>
        <div class="cloud-puff puff-4"></div>
        <div class="cloud-puff puff-5"></div>
      </div>
    `;

    document.body.appendChild(transitionOverlay);

    if (soundManager && typeof soundManager.playDashWhoosh === 'function') {
      soundManager.playDashWhoosh();
    }

    // Trigger phase-in on next frame for smooth animation
    requestAnimationFrame(() => {
      transitionOverlay.classList.add('phase-in');
    });

    const midDuration = 480;
    setTimeout(() => {
      try {
        if (typeof onMidpoint === 'function') onMidpoint();
      } catch (err) {
        console.error('Error in cloud transition midpoint callback:', err);
      }

      transitionOverlay.classList.remove('phase-in');
      transitionOverlay.classList.add('phase-out');

      setTimeout(() => {
        transitionOverlay.remove();
        if (typeof onComplete === 'function') onComplete();
      }, 620);
    }, midDuration);
  }

  createDomElements() {
    const hud = document.createElement('div');
    hud.id = 'game-hud';
    hud.innerHTML = `
      <div class="hud-left">
        <div class="level-display" id="hud-level" title="Angler Level & XP">
          <span class="level-badge" id="level-badge-num">Lv. 0</span>
          <div class="xp-container">
            <div class="xp-bar-track">
              <div class="xp-bar-fill" id="hud-xp-fill"></div>
            </div>
            <span class="xp-text" id="hud-xp-text">0 / 120 XP</span>
          </div>
        </div>

        <div class="hud-wallet">
        <div class="coin-display" id="hud-coins">
          <span class="coin-icon">🪙</span>
          <span id="coin-amount">$0</span>
        </div>

        <button class="gem-display" id="hud-gems" type="button" title="Gems and daily login reward" aria-label="Gems and daily login reward">💎 <span id="gem-amount">0</span><span id="daily-ready" hidden>•</span></button>
        <div class="capacity-display" id="hud-capacity">
          <span class="basket-icon">🪣</span>
          <span id="capacity-amount">0 / 3</span>
        </div>
        <div class="weather-type-display" id="hud-weather-badge" title="Current Weather">
          <span class="weather-badge-icon" id="hud-weather-badge-icon">✨</span>
          <span class="weather-badge-type" id="hud-weather-badge-type">Clear</span>
        </div>
        </div>

        <div class="weather-display" id="hud-weather" title="Atmospheric Time & Weather">
          <span class="weather-time" id="hud-time-text">🌅 Dawn</span>
          <span class="weather-sub" id="hud-weather-text">✨ Clear</span>
        </div>

        <div class="shield-display" id="hud-shields" style="display: none;">
          <span class="shield-icon">🛡️</span>
          <span id="shield-amount">0</span>
        </div>

      </div>

      <div id="world-event-banner" hidden role="status"></div>
      <div class="hud-buffs-container" id="hud-buffs" aria-live="polite"></div>

      <div class="hud-center">
        <div class="depth-meter-container" id="hud-depth-container" style="display: none;">
          <div class="depth-number" id="hud-depth">0.0m</div>
          <div class="zone-badge" id="hud-zone">Sunken Shallows</div>
          <div class="depth-bar-track">
            <div class="depth-bar-fill" id="hud-depth-fill"></div>
          </div>
          <button class="btn-reel-dive" id="btn-manual-reel-up" style="display: none;" title="Reel Up (or press Space)">⬆️ Reel Up</button>
        </div>

        <!-- Line Tension Meter during Reeling -->
        <div class="heat-meter-container" id="hud-heat-container" style="display: none;">
          <div class="heat-header-row">
            <span class="heat-title-txt">🌋 LINE HEAT</span>
            <span class="heat-val-txt" id="hud-heat-percent">0%</span>
          </div>
          <div class="heat-bar-track">
            <div class="heat-bar-fill" id="hud-heat-fill"></div>
          </div>
        </div>
      </div>

      <div class="hud-right">
        <button class="icon-btn" id="btn-minimap" title="Charted Waters Map & World Navigation">${hudIcon('map')} <span class="btn-label">Map</span></button>
        <button class="icon-btn trap-hud-btn" id="btn-traps-hud" title="Harvest Idle Seabed Traps" style="display: none;">
          ${hudIcon('trap')} <span class="btn-label">Traps</span> <span class="trap-badge-num" id="hud-trap-badge" style="display: none;">0</span>
        </button>
        <button class="icon-btn" id="btn-quests" title="Harbor Noticeboard Quests">
          ${hudIcon('quests')} <span class="btn-label">Quests</span>
        </button>
        <button class="icon-btn" id="btn-inventory" title="Inventory">
          ${hudIcon('inventory')} <span class="btn-label">Inventory</span> <span class="inv-badge-num" id="hud-inv-badge" style="font-size: 0.72rem; color: #38bdf8; font-weight: 700;"></span>
        </button>
        <button class="icon-btn" id="btn-shop" title="Shop">${hudIcon('shop')} <span class="btn-label">Shop</span></button>
        <button class="icon-btn" id="btn-journal" title="Open Field Journal or Trophy Room">${hudIcon('journal')} <span class="btn-label">Journal</span></button>
        <button class="icon-btn aquarium-hud-btn" id="btn-aquarium-hud" title="Personal Marine Aquarium" style="display: none;">${hudIcon('aquarium')} <span class="btn-label">Aquarium</span></button>
        <button class="icon-btn" id="btn-radio-hud" title="Coastal Radio Receiver" aria-label="Coastal Radio Receiver">${hudIcon('radio')} <span class="btn-label">Radio</span></button>
        <button class="icon-btn" id="btn-settings" title="Settings">${hudIcon('settings')}</button>
        <button class="icon-btn" id="btn-tutorial" title="How to Play">${hudIcon('help')}</button>
        <button class="icon-btn" id="btn-mute" title="Toggle Sound">${hudIcon('sound')}</button>
      </div>
    `;
    document.body.appendChild(hud);

    // Stylish Zone Entry Announcement Banner
    const zoneBanner = document.createElement('div');
    zoneBanner.id = 'zone-entry-banner';
    zoneBanner.className = 'zone-entry-banner zone-banner-hidden';
    zoneBanner.innerHTML = `
      <div class="zone-banner-icon" id="zone-banner-icon">🏖️</div>
      <div class="zone-banner-info">
        <div class="zone-banner-sub" id="zone-banner-sub">NOW ENTERING</div>
        <div class="zone-banner-title" id="zone-banner-title">Sunken Shallows</div>
        <div class="zone-banner-desc" id="zone-banner-desc">Sandy Turquoise Coastal Reef • Calm Waters</div>
      </div>
    `;
    document.body.appendChild(zoneBanner);

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

    const updatePreviewStats = (usernameOrGuest) => {
      if (usernameOrGuest === '__new_account__') {
        if (lvlEl) lvlEl.textContent = 'Lv. 0';
        if (coinsEl) coinsEl.textContent = '$0';
        if (speciesEl) speciesEl.textContent = `0 / ${FISH_SPECIES.length + LEGENDARY_SPECIES.length}`;
        if (speciesEl) speciesEl.textContent = '0 / 66';
        return;
      }
      if (usernameOrGuest === '__not_found__') {
        if (lvlEl) lvlEl.textContent = 'Lv. —';
        if (coinsEl) coinsEl.textContent = '$—';
        if (speciesEl) speciesEl.textContent = '— / ${FISH_SPECIES.length + LEGENDARY_SPECIES.length}';
        if (speciesEl) speciesEl.textContent = '— / 66';
        return;
      }
      const data = this.saveSystem.getSaveDataForUser(usernameOrGuest);
      if (lvlEl) lvlEl.textContent = `Lv. ${data.level ?? 0}`;
      if (coinsEl) coinsEl.textContent = `$${(data.coins || 0).toLocaleString()}`;
      if (speciesEl) speciesEl.textContent = `${data.speciesCount || 0} / ${FISH_SPECIES.length + LEGENDARY_SPECIES.length}`;
      if (speciesEl) speciesEl.textContent = `${data.speciesCount || 0} / 66`;
    };

    const loggedInView = document.getElementById('auth-logged-in-view');
    const formView = document.getElementById('auth-form-view');
    const currentUsernameEl = document.getElementById('auth-current-username');

    const tabGuest = document.getElementById('tab-auth-guest');
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');

    const panelGuest = document.getElementById('panel-auth-guest');
    const panelLogin = document.getElementById('panel-auth-login');
    const panelRegister = document.getElementById('panel-auth-register');

    const btnGuestStart = document.getElementById('btn-guest-start');
    const btnAuthPlayGuest = document.getElementById('btn-auth-play-guest');
    const btnAuthSwitch = document.getElementById('btn-auth-switch-account');

    const loginForm = document.getElementById('form-auth-login');
    const loginUser = document.getElementById('auth-login-user');
    const loginPass = document.getElementById('auth-login-pass');
    const loginFeedback = document.getElementById('auth-login-feedback');

    const regForm = document.getElementById('form-auth-register');
    const regUser = document.getElementById('auth-reg-user');
    const regPass = document.getElementById('auth-reg-pass');
    const regFeedback = document.getElementById('auth-reg-feedback');

    const launchGame = () => {
      try {
        soundManager.ensureAudio();
        soundManager.playButtonClick();
        soundManager.setMusicMode('surface');
      } catch (e) {
        console.warn('Audio start error:', e);
      }

      try {
        this.updateHUD();
      } catch (e) {
        console.warn('HUD update error:', e);
      }

      try {
        if (this.onAccountSwitched) {
          this.onAccountSwitched();
        }
      } catch (e) {
        console.warn('Account switched callback error:', e);
      }

      this._focusedCaptain = null;
      this.showAccountChat();

      welcomePopup.classList.add('welcome-overlay-hidden');
      setTimeout(() => {
        welcomePopup.style.display = 'none';
      }, 400);

      try {
        if (!this.saveSystem.data.settings.hasSeenTutorial) {
          this.openTutorial();
          this.saveSystem.data.settings.hasSeenTutorial = true;
          this.saveSystem.save();
        }

      } catch (e) {
        console.warn('Tutorial/Chat open error:', e);
        console.warn('Tutorial open error:', e);
      }
    };

    const switchTab = (tabName) => {
      [tabGuest, tabLogin, tabRegister].forEach(t => t?.classList.remove('active'));
      [panelGuest, panelLogin, panelRegister].forEach(p => {
        if (p) {
          p.classList.remove('active');
          p.style.display = 'none';
        }
      });

      if (loginFeedback) {
        loginFeedback.textContent = '';
        loginFeedback.className = 'auth-feedback';
      }
      if (regFeedback) {
        regFeedback.textContent = '';
        regFeedback.className = 'auth-feedback';
      }

      if (tabName === 'guest') {
        tabGuest?.classList.add('active');
        if (panelGuest) {
          panelGuest.classList.add('active');
          panelGuest.style.display = 'flex';
        }
        updatePreviewStats(null);
      } else if (tabName === 'login') {
        tabLogin?.classList.add('active');
        if (panelLogin) {
          panelLogin.classList.add('active');
          panelLogin.style.display = 'flex';
        }
        const val = loginUser?.value?.trim();
        if (val && accountManager.hasAccount(val)) {
          updatePreviewStats(val);
        } else {
          updatePreviewStats(null);
        }
        setTimeout(() => loginUser?.focus(), 50);
      } else if (tabName === 'register') {
        tabRegister?.classList.add('active');
        if (panelRegister) {
          panelRegister.classList.add('active');
          panelRegister.style.display = 'flex';
        }
        updatePreviewStats('__new_account__');
        setTimeout(() => regUser?.focus(), 50);
      }
    };

    tabGuest?.addEventListener('click', () => switchTab('guest'));
    tabLogin?.addEventListener('click', () => switchTab('login'));
    tabRegister?.addEventListener('click', () => switchTab('register'));

    loginUser?.addEventListener('input', () => {
      const val = loginUser.value.trim();
      if (!val) {
        updatePreviewStats(null);
        if (loginFeedback) {
          loginFeedback.textContent = '';
          loginFeedback.className = 'auth-feedback';
        }
        return;
      }
      if (accountManager.hasAccount(val)) {
        updatePreviewStats(val);
        if (loginFeedback) {
          loginFeedback.textContent = `⚓ Account found! Enter password to set sail.`;
          loginFeedback.className = 'auth-feedback auth-info';
        }
      } else {
        updatePreviewStats('__not_found__');
        if (loginFeedback) {
          loginFeedback.textContent = `Enter your password to look up this captain online.`;
          loginFeedback.textContent = `No account found for "${val}".`;
          loginFeedback.className = 'auth-feedback auth-muted';
        }
      }
    });

    regUser?.addEventListener('input', () => {
      const val = regUser.value.trim();
      if (!val) {
        if (regFeedback) {
          regFeedback.textContent = '';
          regFeedback.className = 'auth-feedback';
        }
        return;
      }
      if (accountManager.hasAccount(val)) {
        if (regFeedback) {
          regFeedback.textContent = `⚠️ Username "${val}" already exists. Log in instead.`;
          regFeedback.className = 'auth-feedback auth-error';
        }
      } else {
        if (regFeedback) {
          regFeedback.textContent = `✨ Username will be checked online when you create the account.`;
          regFeedback.className = 'auth-feedback auth-success';
        }
      }
    });

    const activeUser = accountManager.getCurrentUser();
    if (activeUser && accountManager.hasAccount(activeUser)) {
      if (loggedInView) loggedInView.style.display = 'flex';
      if (formView) formView.style.display = 'none';
      if (currentUsernameEl) currentUsernameEl.textContent = activeUser;
      updatePreviewStats(activeUser);
    } else {
      if (loggedInView) loggedInView.style.display = 'none';
      if (formView) formView.style.display = 'flex';
      switchTab('guest');
    }

    document.getElementById('btn-welcome-start')?.addEventListener('click', async () => {
      const username = accountManager.getCurrentUser();
      const account = accountManager.accounts[accountManager.normalizeUsername(username)];
      if (account?.cloudUid) {
        const notice = await accountManager.restoreCloudSave(account, true);
        this.saveSystem.switchToAccount(username);
        if (notice) this.showToast(notice);
      }
      launchGame();
    });

    const startAsGuest = () => {
      this.saveSystem.switchToAccount(null);
      if (this.saveSystem.data.xp === 0 && (!this.saveSystem.data.stats?.totalFishCaught || this.saveSystem.data.stats.totalFishCaught === 0)) {
        this.saveSystem.data.level = 0;
        this.saveSystem.save();
      }
      this.showToast('⛵ Sailing as Guest Mariner!');
      launchGame();
    };

    btnGuestStart?.addEventListener('click', startAsGuest);
    btnAuthPlayGuest?.addEventListener('click', startAsGuest);

    btnAuthSwitch?.addEventListener('click', () => {
      soundManager.playButtonClick();
      accountManager.logout();
      if (loggedInView) loggedInView.style.display = 'none';
      if (formView) formView.style.display = 'flex';
      switchTab('login');
    });

    let authBusy = false;
    const handleLogin = async (e) => {
      if (e) e.preventDefault();
      const u = loginUser?.value?.trim();
      const p = loginPass?.value;
      if (!u || !p) {
        if (loginFeedback) {
          loginFeedback.textContent = 'Please enter both username and password.';
          loginFeedback.className = 'auth-feedback auth-error';
        }
        return;
      }
      if (authBusy) return;
      authBusy = true;
      if (loginFeedback) loginFeedback.textContent = 'Signing in and checking saved progress...';
      let res;
      try { res = await accountManager.login(u, p); } finally { authBusy = false; }
      if (!res.success) {
        if (loginFeedback) {
          loginFeedback.textContent = res.message;
          loginFeedback.className = 'auth-feedback auth-error';
        }
        return;
      }
      if (loginFeedback) {
        loginFeedback.textContent = `✅ Welcome back, Captain ${res.username}!`;
        loginFeedback.className = 'auth-feedback auth-success';
      }
      this.saveSystem.switchToAccount(res.username);
      this.showToast(res.notice || `⚓ Welcome aboard, Captain ${res.username}!`);
      setTimeout(() => launchGame(), 300);
    };

    document.getElementById('btn-auth-login')?.addEventListener('click', handleLogin);
    loginForm?.addEventListener('submit', handleLogin);

    const handleRegister = async (e) => {
      if (e) e.preventDefault();
      const u = regUser?.value?.trim();
      const p = regPass?.value;
      if (!u || !p) {
        if (regFeedback) {
          regFeedback.textContent = 'Please enter both username and password.';
          regFeedback.className = 'auth-feedback auth-error';
        }
        return;
      }
      if (authBusy) return;
      authBusy = true;
      if (regFeedback) regFeedback.textContent = 'Creating your online captain...';
      let res;
      try { res = await accountManager.register(u, p); } finally { authBusy = false; }
      if (!res.success) {
        if (regFeedback) {
          regFeedback.textContent = res.message;
          regFeedback.className = 'auth-feedback auth-error';
        }
        return;
      }
      if (regFeedback) {
        regFeedback.textContent = `🎉 Account created! Welcome, Captain ${res.username}!`;
        regFeedback.className = 'auth-feedback auth-success';
      }
      this.saveSystem.switchToAccount(res.username);
      this.showToast(res.notice || `🎉 Account Created! Welcome, Captain ${res.username}!`);
      setTimeout(() => launchGame(), 350);
    };

    document.getElementById('btn-auth-register')?.addEventListener('click', handleRegister);
    regForm?.addEventListener('submit', handleRegister);
  }

  bindEvents() {
    document.getElementById('hud-gems')?.addEventListener('click', () => this.openDailyLogin());
    document.getElementById('btn-minimap')?.addEventListener('click', () => {
      if (this.minimapUI) {
        this.minimapUI.openChartNavigation();
      }
    });
    document.getElementById('btn-shop')?.addEventListener('click', () => this.openShop());
    document.getElementById('btn-quests')?.addEventListener('click', () => this.openQuestsModal());
    document.getElementById('btn-inventory')?.addEventListener('click', () => this.openInventory());
    document.getElementById('btn-journal')?.addEventListener('click', () => this.openJournalLogbook('journal'));
    document.getElementById('btn-aquarium-hud')?.addEventListener('click', () => this.openAquariumModal());
    document.getElementById('btn-achievements')?.addEventListener('click', () => this.openJournalLogbook('logbook'));
    document.getElementById('btn-radio-hud')?.addEventListener('click', () => this.openRadio());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.openSettings());
    document.getElementById('btn-tutorial')?.addEventListener('click', () => this.openTutorial());
    document.getElementById('btn-traps-hud')?.addEventListener('click', () => this.handleTrapClick());
    document.getElementById('btn-manual-reel-up')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onManualReel) this.onManualReel();
    });

    const muteBtn = document.getElementById('btn-mute');
    muteBtn?.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      this.saveSystem.data.settings.isMuted = isMuted;
      this.saveSystem.save();
      muteBtn.innerHTML = hudIcon(isMuted ? 'muted' : 'sound');
      muteBtn.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
      soundManager.playButtonClick();
    });

    document.getElementById('modal-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
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

  showAccountChat() {
    if (accountManager.isGuest() || !accountManager.getCurrentUser()) return false;
    const panel = document.getElementById('fleet-radio');
    if (!panel) return false;
    panel.hidden = false;
    panel.classList.remove('fleet-minimized');
    const content = panel.querySelector('#fleet-content');
    if (content) content.hidden = false;
    const toggle = panel.querySelector('#fleet-toggle');
    if (toggle) {
      toggle.textContent = '\u2212';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Minimize Fleet Radio');
      toggle.title = 'Minimize Fleet Radio';
    }
    this.chatManager?.connect();
    return true;
  }

  _getEl(id) {
    if (!this._domCache) this._domCache = new Map();
    let el = this._domCache.get(id);
    if (!el || !el.isConnected) {
      el = document.getElementById(id);
      if (el) this._domCache.set(id, el);
    }
    return el;
  }

  _setText(id, val) {
    const el = this._getEl(id);
    if (el && el.textContent !== String(val)) el.textContent = String(val);
    return el;
  }

  _setWidth(id, width) {
    const el = this._getEl(id);
    if (el && el.style.width !== width) el.style.width = width;
    return el;
  }

  _setDisplay(id, display) {
    const el = this._getEl(id);
    if (el && el.style.display !== display) el.style.display = display;
    return el;
  }

  _setHidden(id, hidden) {
    const el = this._getEl(id);
    if (el && el.hidden !== hidden) el.hidden = hidden;
    return el;
  }

  updateHUD(hook, gameState) {
    if (this.chatManager && (!this._lastChatConnect || Date.now() - this._lastChatConnect > 5000)) {
      this._lastChatConnect = Date.now();
      this.chatManager.connect();
    }
    const fleet = this._getEl('fleet-radio');
    const hideFleet = !this.saveSystem.isChatUnlocked() || gameState !== 'SURFACE_IDLE';
    if (fleet && fleet.hidden !== hideFleet) fleet.hidden = hideFleet;
    const captain = accountManager.getCurrentUser();
    if (!accountManager.isGuest() && captain && fleet && !fleet.hidden && !this.activeModal && this._focusedCaptain !== captain) {
      this._focusedCaptain = captain;
      this.showAccountChat();
    }
    if (!captain) this._focusedCaptain = null;
    const isDiving = (gameState === 'CASTING' || gameState === 'DESCENDING' || gameState === 'REELING');
    if ((isDiving || gameState === 'AIMING') && this.toastDismissOnFishing) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
      this.toastDismissOnFishing = false;
      this._getEl('toast-notification')?.classList.replace('toast-visible', 'toast-hidden');
    }
    const hudEl = this._getEl('game-hud');
    if (hudEl) {
      hudEl.classList.toggle('hud-diving-mode', isDiving);
    }

    const event = worldCycle.getGlobalEvent();
    const eventBanner = this._getEl('world-event-banner');
    if (eventBanner) {
      if (eventBanner.hidden !== !event.active) eventBanner.hidden = !event.active;
      if (event.active) {
        const text = `${event.icon} ${event.name} · ${event.description}`;
        if (eventBanner.textContent !== text) eventBanner.textContent = text;
        const title = `${Math.floor(event.timeRemainingSec / 60)}:${String(event.timeRemainingSec % 60).padStart(2, '0')} remaining · Legends x${event.legendaryMultiplier} · Crates x${event.crateMultiplier}`;
        if (eventBanner.title !== title) eventBanner.title = title;
      }
    }
    const lvl = this.saveSystem.data.level;
    const currentXp = this.saveSystem.data.xp;
    const xpReq = this.saveSystem.getXpRequired(lvl);
    this._setText('level-badge-num', `Lv. ${lvl}`);
    this._setText('hud-xp-text', `${currentXp} / ${xpReq} XP`);
    const xpPct = Math.min(100, (currentXp / xpReq) * 100);
    this._setWidth('hud-xp-fill', `${xpPct}%`);

    this._setText('coin-amount', `$${this.saveSystem.data.coins.toLocaleString()}`);
    this._setText('gem-amount', this.saveSystem.getGemBalance().toLocaleString());
    this._setHidden('daily-ready', !this.saveSystem.getDailyLoginStatus().available);

    // Update atmospheric time & weather in HUD
    this._setText('hud-time-text', worldCycle.getTimeLabel());
    this._setText('hud-weather-text', worldCycle.getWeatherLabel());

    // Update weather type badge next to the bucket in the top GUI: only show when up on the boat
    const weatherBadgeEl = this._getEl('hud-weather-badge');
    if (weatherBadgeEl) {
      if (isDiving) {
        this._setDisplay('hud-weather-badge', 'none');
      } else {
        this._setDisplay('hud-weather-badge', 'inline-flex');
        const wt = worldCycle.getWeatherType ? worldCycle.getWeatherType() : { icon: '✨', label: 'Clear' };
        this._setText('hud-weather-badge-icon', wt.icon);
        this._setText('hud-weather-badge-type', wt.label);
        const wTitle = `Atmosphere: ${wt.label}`;
        if (weatherBadgeEl.title !== wTitle) weatherBadgeEl.title = wTitle;
      }
    }

    // Update audio rain state based on weather
    soundManager.setWeatherAudio(worldCycle.getWeather());

    // Update trap count in HUD (only visible if traps have been purchased!)
    if (this.trapSystem) {
      const trapCount = this.trapSystem.getTrapCount ? this.trapSystem.getTrapCount() : 0;
      const capacity = this.trapSystem.getStorageCapacity ? this.trapSystem.getStorageCapacity() : (this.trapSystem.getMaxCapacity ? this.trapSystem.getMaxCapacity() : 0);
      const trappedCount = this.trapSystem.getStoredItems ? this.trapSystem.getStoredItems().length : 0;
      const isFull = capacity > 0 && trappedCount >= capacity;
      const trapBtn = this._getEl('btn-traps-hud');
      if (trapBtn) {
        if (trapCount > 0) {
          this._setDisplay('btn-traps-hud', 'inline-flex');
          trapBtn.classList.toggle('quest-ready', isFull);
          trapBtn.classList.toggle('trap-full', isFull);
          const trapBadge = this._getEl('hud-trap-badge');
          if (trapBadge) {
            if (trappedCount > 0) {
              this._setDisplay('hud-trap-badge', 'inline-block');
              this._setText('hud-trap-badge', trappedCount);
              trapBtn.classList.add('trap-ready');
            } else {
              this._setDisplay('hud-trap-badge', 'none');
              trapBtn.classList.remove('trap-ready');
            }
          }
        } else {
          this._setDisplay('btn-traps-hud', 'none');
          trapBtn.classList.remove('quest-ready', 'trap-full');
        }
      }
    }

    const questButton = this._getEl('btn-quests');
    if (questButton) {
      const ready = !!this.questSystem?.hasUnclaimedRewards();
      questButton.classList.toggle('quest-ready', ready);
      const qAria = ready ? 'Quests: reward ready to claim' : 'Quests';
      if (questButton.getAttribute('aria-label') !== qAria) questButton.setAttribute('aria-label', qAria);
    }

    // Update active buffs in HUD
    const buffsContainer = this._getEl('hud-buffs');
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
      if (buffsContainer.innerHTML !== buffsHtml) {
        buffsContainer.innerHTML = buffsHtml;
      }
    }

    const capEl = this._getEl('hud-capacity');

    // Authoritative maximum capacity based on save system upgrade level
    const capLvl = this.saveSystem.getUpgradeLevel('hookCapacity') || 0;
    const capTier = UPGRADE_DEFINITIONS.hookCapacity?.tiers?.[capLvl] || { capacity: 3 };
    const maxCapacity = (hook?.capacity || capTier.capacity || 3) + (hook?.capacityBoost || 0);

    // Accurate current count of items held in bucket (on the line)
    const holdingCount = hook?.caughtItems ? hook.caughtItems.length : 0;

    this._setText('capacity-amount', `${holdingCount} / ${maxCapacity}`);
    if (capEl) {
      capEl.classList.toggle('capacity-full', holdingCount >= maxCapacity);
    }

    if (!hook || gameState === 'SURFACE_IDLE' || gameState === 'AIMING') {
      this._setDisplay('hud-depth-container', 'none');
      this._setDisplay('hud-shields', 'none');
    } else {
      this._setDisplay('hud-depth-container', 'flex');
      const depthM = Math.min(hook.depthMeters, hook.maxDepthMeters);

      const depthEl = this._getEl('hud-depth');
      if (depthEl) {
        const subZ = getDepthSubZone(depthM, this.saveSystem.getCurrentSea());
        const dText = `${depthM.toFixed(1)}m`;
        if (depthEl.textContent !== dText) depthEl.textContent = dText;
        const dTitle = `Depth: ${depthM.toFixed(1)}m • ${subZ.name}`;
        if (depthEl.title !== dTitle) depthEl.title = dTitle;
      }

      const fillPct = Math.min(100, (depthM / hook.maxDepthMeters) * 100);
      this._setWidth('hud-depth-fill', `${fillPct}%`);

      this._setDisplay('btn-manual-reel-up', (gameState === 'DESCENDING' || hook.state === 'DESCENDING') ? 'inline-flex' : 'none');

      let activeZoneName = 'Sunken Shallows';
      let fullZoneTitle = 'Sunken Shallows';
      if (this.zoneManager) {
        const az = this.zoneManager.getCurrentZone();
        if (az) {
          const currentSea = FANTASY_SEAS.find(s => s.id === this.saveSystem.getCurrentSea());
          const realmName = currentSea ? currentSea.name : az.name;
          const subZ = getDepthSubZone(depthM, this.saveSystem.getCurrentSea());
          activeZoneName = subZ?.name || realmName;
          fullZoneTitle = `${realmName} • ${subZ?.name || az.name}`;
        }
      }
      const zoneEl = this._getEl('hud-zone');
      if (zoneEl) {
        if (zoneEl.textContent !== activeZoneName) zoneEl.textContent = activeZoneName;
        if (zoneEl.title !== fullZoneTitle) zoneEl.title = fullZoneTitle;
      }

      const shieldEl = this._getEl('hud-shields');
      if (shieldEl) {
        if (hook.shields > 0) {
          this._setDisplay('hud-shields', 'flex');
          this._setText('shield-amount', hook.shields);
        } else {
          this._setDisplay('hud-shields', 'none');
        }
      }
    }

    // Line Tension & Volcanic Heat Gauges
    if (hook && gameState === 'REELING') {
      if (this.zoneManager?.activeZone?.mechanic?.heatBuildup) {
        this._setDisplay('hud-heat-container', 'flex');
        const heatPct = Math.min(100, Math.max(0, this.zoneManager.lineHeat || 0));
        this._setWidth('hud-heat-fill', `${heatPct}%`);
        this._setText('hud-heat-percent', `${Math.round(heatPct)}%`);
      } else {
        this._setDisplay('hud-heat-container', 'none');
      }
    } else {
      this._setDisplay('hud-heat-container', 'none');
    }

    // Update Inventory Button capacity text
    const invCount = this.saveSystem.getInventory().length;
    const invCap = this.saveSystem.getInventoryCapacity();
    const invBtn = this._getEl('btn-inventory');
    if (invBtn) {
      const invTitle = `Inventory (${invCount} / ${invCap} slots)`;
      if (invBtn.title !== invTitle) invBtn.title = invTitle;
      const invBadge = this._getEl('hud-inv-badge');
      if (invBadge) {
        this._setText('hud-inv-badge', `(${invCount}/${invCap})`);
        const badgeColor = invCount >= invCap ? '#ef4444' : '#38bdf8';
        if (invBadge.style.color !== badgeColor) invBadge.style.color = badgeColor;
      }
    }

    // Update Personal Aquarium Button visibility
    const aqBtn = this._getEl('btn-aquarium-hud');
    if (aqBtn) {
      const hasAq = this.saveSystem.hasAquarium();
      this._setDisplay('btn-aquarium-hud', hasAq ? 'inline-flex' : 'none');
      if (hasAq) {
        const aqItems = this.saveSystem.getAquariumItems?.() || [];
        const aqCap = this.saveSystem.getAquariumCapacity?.() || 5;
        const aqTitle = `Personal Marine Aquarium (${aqItems.length} / ${aqCap} fish in tank)`;
        if (aqBtn.title !== aqTitle) aqBtn.title = aqTitle;
      }
    }
  }

  showAchievementPopup(achievement) {
    let popup = document.getElementById('achievement-popup-toast');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'achievement-popup-toast';
      document.body.appendChild(popup);
    }
    const gems = achievementGems(achievement);
    popup.innerHTML = `
      <div class="ach-toast-glow"></div>
      <div class="ach-toast-icon">${achievement.icon || '🏆'}</div>
      <div class="ach-toast-body">
        <div class="ach-toast-tag">TROPHY UNLOCKED</div>
        <div class="ach-toast-name">${achievement.name}</div>
        <div class="ach-toast-rewards">+${achievement.reward.toLocaleString()} Gold ${gems > 0 ? `· 💎 +${gems}` : ''}</div>
      </div>
    `;
    popup.classList.remove('ach-toast-exit');
    popup.classList.add('ach-toast-enter');

    if (this._achPopupTimer) clearTimeout(this._achPopupTimer);
    clearTimeout(this._achExitTimer);
    this._achPopupTimer = setTimeout(() => {
      popup.classList.remove('ach-toast-enter');
      popup.classList.add('ach-toast-exit');
      this._achExitTimer = setTimeout(() => {
        popup.classList.remove('ach-toast-exit');
      }, 500);
      this._achPopupTimer = null;
    }, 3500);
  }

  showToast(message, { dismissOnFishing = false } = {}) {
    this.toastDismissOnFishing = dismissOnFishing;
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.className = 'toast-visible';

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.className = 'toast-hidden';
      this.toastDismissOnFishing = false;
      this.toastTimer = null;
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

    const wasCatchSummary = this.activeModal === 'catchSummary';
    const catchContinue = this._onCatchSummaryContinue;
    this._onCatchSummaryContinue = null;

    document.getElementById('modal-overlay').className = 'modal-overlay-hidden';
    this.activeModal = null;
    if (typeof this.onModalClosed === 'function') {
      this.onModalClosed();
    }
    if (wasCrateModal && crateCtx) {
      if (crateCtx.hook) this.openCatchSummary(crateCtx.hook, crateCtx.onContinue);
      else this.openInventory();
    } else if (wasCatchSummary && catchContinue) {
      catchContinue();
    }
  }

  showNPCModal(npc, onOptionChosen) {
    this.activeModal = 'npc_encounter';

    let optionsHtml = '';
    npc.options.forEach((opt, idx) => {
      optionsHtml += `
        <button type="button" class="npc-option-card" data-idx="${idx}" aria-label="${opt.label}">
          <div class="npc-option-label">${opt.label}</div>
          <div class="npc-option-desc">${opt.desc}</div>
        </button>
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
          <button type="button" class="btn btn-outline npc-dismiss-btn" id="btn-npc-dismiss" style="margin-top: 14px; width: 100%;">Walk away politely</button>
        </div>
      </div>
    `;

    this.openModal(`✨ Atmospheric Encounter: ${npc.name}`, contentHtml);

    const cards = document.querySelectorAll('.npc-option-card');
    cards.forEach((card) => {
      const handleSelect = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget || e.target.closest('.npc-option-card');
        const idx = parseInt(target?.dataset?.idx ?? '-1', 10);
        const chosenOpt = npc.options[idx];
        if (chosenOpt && onOptionChosen) {
          onOptionChosen(chosenOpt);
        }
      };
      card.addEventListener('click', handleSelect);
    });

    document.getElementById('btn-npc-dismiss')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeModal();
    });
  }

  openRadio() {
    this.activeModal = 'radio';
    soundManager.playButtonClick();

    const activeStation = soundManager.getActiveStation();
    const save = this.saveSystem;
    save.data.unlockedSoundtracks ||= ['harbor_breeze', 'rainy_lighthouse', 'deep_blue'];

    const stations = [
      { id: 'harbor_breeze', name: 'Station 1: Harbor Breeze', desc: 'Sunny shoreline melodies and gentle swelling waves', icon: '🎸', cost: 0 },
      { id: 'rainy_lighthouse', name: 'Station 2: Rainy Lighthouse', desc: 'Soft rain, rolling thunder & a warm low foghorn', icon: '🌧️', cost: 0 },
      { id: 'deep_blue', name: 'Station 3: Deep Blue Reverie', desc: 'Slow underwater pads and drifting resonance', icon: '🫧', cost: 0 },
      { id: 'peaceful_lagoon', name: 'Soundtrack: Peaceful Shallows', desc: 'Serene ambient strings and gentle turquoise ripples', icon: '🕊️', cost: 3 },
      { id: 'zen_meditation', name: 'Soundtrack: Abyssal Meditation', desc: 'Tranquil harmonic chimes from the deep ocean trenches', icon: '🧘', cost: 4 },
      { id: 'tropical_solitude', name: 'Soundtrack: Tropical Warmth', desc: 'Bright island percussion and warm offshore breeze', icon: '🌴', cost: 3 },
      { id: 'ocean_waves', name: 'Soundtrack: Rhythmic Swell', desc: 'Lapping coastal waves and gentle seafoam whispers', icon: '🌊', cost: 3 },
      { id: 'midnight_current', name: 'Soundtrack: Midnight Current', desc: 'Dreamy night-tide synths drifting over dark water', icon: '🌙', cost: 3 },
    ];

    let html = `
      <div class="radio-modal-container">
        <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:14px;">
          Tune your vessel's vintage brass radio to atmospheric soundscapes. Every station plays its own unique track, looping while you sail and fish.
        </p>
        <div style="display:flex; flex-direction:column; gap:10px;">
    `;

    stations.forEach(st => {
      const isActive = activeStation === st.id;
      const isUnlocked = st.cost === 0 || save.data.unlockedSoundtracks.includes(st.id);
      html += `
        <div class="radio-station-card ${isActive ? 'radio-station-active' : ''}" data-station="${st.id}" data-cost="${st.cost}" data-unlocked="${isUnlocked}" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:10px; background:${isActive ? 'rgba(56,189,248,0.18)' : 'rgba(15,23,42,0.6)'}; border:1px solid ${isActive ? '#38bdf8' : 'rgba(255,255,255,0.08)'}; cursor:pointer; transition:all 0.2s ease;">
          <span class="radio-art-icon">${RADIO_ART[st.id] || st.icon}</span>
          <div style="flex:1;">
            <h4 style="margin:0 0 3px 0; color:#f8fafc; font-size:0.95rem;">${st.name} ${isActive ? '<span style="color:#38bdf8; font-size:0.75rem;">● ON AIR</span>' : ''}</h4>
            <p style="margin:0; font-size:0.78rem; color:#94a3b8;">${st.desc}</p>
          </div>
          <button class="btn ${isActive ? 'btn-primary' : isUnlocked ? 'btn-secondary' : 'btn-outline'} btn-sm">
            ${isActive ? 'Playing' : isUnlocked ? 'Tune In' : `💎 ${st.cost} Gems`}
          </button>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    this.openModal('📻 Coastal Radio & Soundtracks', html);

    document.querySelectorAll('.radio-station-card').forEach(card => {
      card.addEventListener('click', async (e) => {
        const stId = e.currentTarget.dataset.station;
        const cost = parseInt(e.currentTarget.dataset.cost, 10) || 0;
        const isUnlocked = e.currentTarget.dataset.unlocked === 'true';

        if (!isUnlocked && cost > 0) {
          if (save.getGemBalance() < cost) {
            this.showToast(`💎 Need ${cost} Gems to unlock this track. You have ${save.getGemBalance()} Gems.`);
            return;
          }
          if (await premiumPurchase(this, { kind: 'soundtrack', track: stId })) {
            soundManager.startRadioStation(stId);
            this.openRadio();
          }
          return;
        }

        soundManager.startRadioStation(stId);
        this.openRadio();
      });
    });
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

    let shopHeaderHtml = `
      <div class="shop-top-bar" style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6); padding: 10px 14px; border-radius: 10px; margin-bottom: 14px; border: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="font-size: 1rem; color: #f8fafc;">
          🪙 Current Purse: <strong style="color: #facc15; font-size: 1.15rem;">$${save.data.coins.toLocaleString()}</strong>
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-shop-inventory" title="Open tackle box to view or sell catches">
          🎒 Sell Catches from Inventory
        </button>
      </div>
    `;

    let itemsHtml = '<div class="shop-grid">';

    Object.values(upgrades).sort((a, b) => {
      const aMaxed = save.getUpgradeLevel(a.id) >= a.tiers.length - 1;
      const bMaxed = save.getUpgradeLevel(b.id) >= b.tiers.length - 1;
      return Number(aMaxed) - Number(bMaxed);
    }).forEach((upg) => {
      const currentLvl = save.getUpgradeLevel(upg.id);
      const currentTier = upg.tiers[currentLvl] || upg.tiers[0];
      const nextTier = upg.tiers[currentLvl + 1] || null;
      const isMax = !nextTier;
      const meetsLevel = nextTier ? playerLevel >= nextTier.reqLevel : true;
      const canAfford = nextTier && meetsLevel && save.data.coins >= nextTier.cost;

      itemsHtml += `
        <div class="shop-card ${isMax ? 'shop-card-max' : ''} ${!meetsLevel ? 'shop-card-locked' : ''}">
          <div class="shop-card-header">
            <span class="shop-icon">${SHOP_ART[upg.id] || upg.icon}</span>
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
                : `
                  <button class="btn ${canAfford ? 'btn-buy' : 'btn-disabled'} btn-upgrade" data-upgrade="${upg.id}">
                    ${currentLvl === 0 && upg.id === 'seabedTraps' ? 'Deploy Pots: ' : currentLvl === 0 && upg.id === 'personalAquarium' ? 'Purchase Tank: ' : 'Upgrade: '}$${nextTier.cost.toLocaleString()}
                  </button>
                  <button class="btn btn-secondary btn-sm btn-upgrade-gem" data-upgrade="${upg.id}" title="Upgrade this tier using Gems" style="margin-top: 6px; width: 100%; font-size: 0.8rem; background: rgba(147, 51, 234, 0.22); border: 1px solid rgba(192, 132, 252, 0.45); color: #f0abfc;">
                    💎 Upgrade: ${Math.max(1, Math.ceil(nextTier.cost / 600))} Gems
                  </button>
                `
            }
            ${currentLvl > 0 && upg.id === 'personalAquarium' ? `
              <button class="btn btn-secondary btn-sm" id="btn-shop-view-aquarium" style="margin-top: 6px; width: 100%;">🐠 View Aquarium</button>
            ` : ''}
          </div>
        </div>
      `;
    });

    itemsHtml += '</div>';

    this.openModal('🎣 Starlight Shop', shopHeaderHtml + '<button class="btn btn-secondary" id="shop-gems">Gem Store &middot; Angler and Aquarium Styles</button>' + itemsHtml);

    document.getElementById('shop-gems')?.addEventListener('click', () => save.gemShop?.open());
    document.getElementById('btn-shop-inventory')?.addEventListener('click', () => {
      this.openInventory('fish');
    });

    document.getElementById('btn-shop-view-aquarium')?.addEventListener('click', () => {
      this.openAquariumModal();
    });

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
          } else if (upgId === 'personalAquarium' && currentLvl === 0) {
            this.showToast(`🐠 Unlocked Personal Marine Aquarium! Visit your Journal or Inventory to view your tank.`);
          } else {
            this.showToast(`✨ Upgraded ${upg.name} to Level ${currentLvl + 1}!`);
          }
          this.onUpgradePurchased?.();
          this.openShop();
        }
      });
    });

    document.querySelectorAll('.btn-upgrade-gem').forEach(button => {
      button.onclick = async () => {
        button.disabled = true;
        if (await premiumPurchase(this, { kind: 'upgrade', key: button.dataset.upgrade })) this.openShop();
        else button.disabled = false;
      };
    });
  }

  openCatchSummary(hook, onContinue, storageOverflow = false) {
    this.activeModal = 'catchSummary';
    this._onCatchSummaryContinue = onContinue;
    soundManager.playCoin();

    const rodTier = UPGRADE_DEFINITIONS.fishingRod.tiers[this.saveSystem.getUpgradeLevel('fishingRod')] || UPGRADE_DEFINITIONS.fishingRod.tiers[0];
    const sellMultiplier = 1 + rodTier.sellBonus;

    let subtotal = 0;
    let listHtml = '<div class="catch-summary-list">';
    const hasUnrestoredRelic = hook.caughtItems.some(i => i.isRelic && !i.restored);
    const soldIds = new Set();
    const isStorageFull = storageOverflow || this.saveSystem.isInventoryFull();

    if (hook.caughtItems.length === 0) {
      listHtml += `
        <div class="empty-catch">
          <div class="empty-icon" style="width:48px;height:48px;margin:0 auto 10px;">${MISC_ART.harvestBasket}</div>
          <p>The line surfaced without catches this dive!</p>
          <p class="empty-sub">Cast deeper into the Seven Seas to discover valuable fish and fossils.</p>
        </div>
      `;
    } else {
      hook.caughtItems.forEach((item, itemIdx) => {
        const isCrate = !!item.isCrate || item.category === 'crate';
        const itemVal = isCrate && item.unboxed ? 0 : Math.max(1, Math.round(item.value * sellMultiplier));
        subtotal += itemVal;

        const isRelic = !!item.isRelic;
        const isFossil = item.category === 'fossil' || item.type === 'fossil';
        const isTreasure = item.isTreasure && !isCrate;
        const isFish = !isCrate && !isRelic && !isFossil && !isTreasure;

        const rarityBadge = `<span class="rarity-tag rarity-${item.rarity}">${item.isGodTier ? 'GOD TIER' : item.rarity.toUpperCase()}</span>`;
        const shinyTag = item.isShiny ? `<span class="shiny-tag"><svg viewBox="0 0 24 24" width="11" height="11" fill="#1e1b4b" style="vertical-align:middle;margin-right:2px;"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>SHINY</span>` : '';
        const fossilTag = isFossil ? `<span class="fossil-tag"><span style="display:inline-block;width:11px;height:11px;vertical-align:middle;margin-right:2px;">${JOURNAL_TAB_ART.fossils}</span>FOSSIL</span>` : '';
        const relicTag = isRelic ? `<span class="relic-tag" style="background:#854d0e;color:#fef08a;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;"><span style="display:inline-block;width:11px;height:11px;vertical-align:middle;margin-right:2px;">${JOURNAL_TAB_ART.relics}</span>${item.restored ? 'RESTORED' : 'RELIC'}</span>` : '';
        const crateTag = isCrate
          ? (item.unboxed
            ? `<span class="crate-tag" style="background:#10b981;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;">UNLOCKED</span>`
            : `<span class="crate-tag" style="background:#f59e0b;color:#1e293b;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;">UNOPENED</span>`)
          : '';
        const mythicTag = item.isMythic ? `<span class="mythic-tag">MYTHIC</span>` : '';
        const crownTag = item.crown === 'gold'
          ? `<span class="crown-tag">GIANT RECORD</span>`
          : item.crown === 'silver'
          ? `<span class="crown-tag crown-silver">SILVER CROWN</span>`
          : '';
        const gradeBadge = item.gradeTier?.id === 'Monster'
          ? `<span class="grade-badge grade-monster" style="background:#b45309;color:#fef08a;border:1px solid #facc15;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;">MONSTER (3x)</span>`
          : item.gradeTier?.id === 'Trophy'
          ? `<span class="grade-badge grade-trophy" style="background:#6b21a8;color:#f5d0fe;border:1px solid #d8b4fe;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;">TROPHY (1.5x)</span>`
          : item.gradeTier?.id === 'Small'
          ? `<span class="grade-badge grade-small" style="background:#334155;color:#94a3b8;padding:2px 6px;border-radius:4px;font-size:10px;">Small</span>`
          : '';
        const aberrationTag = item.isAberration
          ? `<span class="aberration-tag" style="background:#581c87;color:#f3e8ff;border:1px solid #c084fc;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;">ABERRATION (${item.aberrationMult || 4.0}x)</span>`
          : '';

        const instId = item.inventoryRef?.instanceId;

        // Custom artwork slot: real canvas for fish, bespoke vector illustration for crates, fossils, relics, and treasures
        let iconHtml = '';
        if (isFish) {
          iconHtml = `<canvas class="catch-item-canvas" id="catch-summary-canvas-${itemIdx}" width="112" height="88"></canvas>`;
        } else if (isCrate) {
          iconHtml = `<div class="catch-item-art-icon" style="transform: scale(0.65);">${crateArtwork(item.crateRank || 1)}</div>`;
        } else if (isFossil) {
          iconHtml = `<div class="catch-item-art-icon">${FOSSIL_ART.boneFragment || JOURNAL_TAB_ART.fossils}</div>`;
        } else if (isRelic) {
          iconHtml = `<div class="catch-item-art-icon">${JOURNAL_TAB_ART.relics}</div>`;
        } else {
          iconHtml = `<div class="catch-item-art-icon">${SHOP_ART.personalAquarium || JOURNAL_TAB_ART.almanac}</div>`;
        }

        listHtml += `
          <div class="catch-item-card rarity-border-${item.rarity}" id="catch-card-${instId}">
            <div class="catch-item-icon">
              ${iconHtml}
            </div>
            <div class="catch-item-details">
              <div class="catch-item-name">${item.name} ${aberrationTag} ${gradeBadge} ${shinyTag} ${mythicTag} ${crownTag} ${fossilTag} ${relicTag} ${crateTag} ${rarityBadge}</div>
              <div class="catch-item-specs">
                ${
                  isCrate
                    ? `<span>Rank ${item.crateRank || 1} Mystery Loot Crate • ${item.unboxed ? `Loot: <strong>${item.loot?.name || 'Claimed'}</strong>` : 'Crack open to claim loot!'}</span>`
                    : !isTreasure && !isRelic
                    ? `<span><strong>${item.size} cm</strong></span> <span>${item.weight} kg</span> ${item.crown ? `<span>• Size Record</span>` : ''}`
                    : isRelic
                    ? `<span>Archaeological Artifact (${item.relicType?.era || 'Ancient'}) • ${item.restored ? 'Restored' : 'Needs Cleaning'}</span>`
                    : isFossil
                    ? `<span>Prehistoric Museum Specimen</span>`
                    : `<span>Sunken Dredged Treasure</span>`
                }
              </div>
            </div>
            <div class="catch-item-price-side">
              <div class="catch-item-price">
                ${
                  isCrate
                    ? (item.unboxed
                      ? (item.loot && item.loot.coins !== undefined
                        ? (item.loot.coins >= 0 ? `+$${item.loot.coins.toLocaleString()}` : `-$${Math.abs(item.loot.coins)}`)
                        : 'Claimed')
                      : 'Unopened')
                    : `+$${itemVal.toLocaleString()}`
                }
              </div>
              ${!isCrate && instId ? `
                <div class="catch-item-actions-row" id="catch-actions-${instId}">
                  <button class="btn btn-sm btn-outline btn-catch-keep" data-id="${instId}" title="Keep safe in tackle box">
                    <span style="display:inline-block;width:13px;height:13px;vertical-align:middle;margin-right:3px;">${HUD_ICONS.inventory}</span> Keep
                  </button>
                  <button class="btn btn-sm btn-buy btn-catch-sell" data-id="${instId}" data-val="${itemVal}" title="Sell immediately for gold">
                    <span style="display:inline-block;width:13px;height:13px;vertical-align:middle;margin-right:3px;">${HUD_ICONS.shop}</span> Sell Now
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      });
    }

    listHtml += '</div>';

    const unboxedCrates = hook.caughtItems.filter(i => (i.isCrate || i.category === 'crate') && !i.unboxed);
    let remainingGold = subtotal;
    const summaryCapLvl = this.saveSystem.getUpgradeLevel('hookCapacity') || 0;
    const summaryCapTier = UPGRADE_DEFINITIONS.hookCapacity?.tiers?.[summaryCapLvl] || { capacity: 3 };
    const summaryMaxCap = Math.max(hook?.capacity || 3, summaryCapTier.capacity || 3) + (hook?.capacityBoost || 0);

    const modalBody = `
      <div class="summary-container">
        ${isStorageFull ? `
          <div style="background: rgba(239, 68, 68, 0.22); border: 1.5px solid #ef4444; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; text-align: center; color: #fecaca; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);">
            You ran out of storage and need to sell items!
          </div>
        ` : ''}
        <div class="summary-header-stats">
          <div class="stat-box">
            <span class="stat-label">Max Depth</span>
            <span class="stat-value">${hook.maxDepthReachedThisDive.toFixed(1)}m</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Line Catches</span>
            <span class="stat-value">${hook.caughtItems.length} / ${summaryMaxCap}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Rod Bonus</span>
            <span class="stat-value">+${Math.round(rodTier.sellBonus * 100)}%</span>
          </div>
        </div>

        ${listHtml}

        ${hook.caughtItems.some(item => item.species && (item.rarity === 'legendary' || item.isMythic || item.isGodTier)) ? '<div style="text-align:center;margin:10px 0;"><button class="btn btn-secondary" id="share-best-catch" style="border-color:#eab308;color:#fef08a;"><span style="display:inline-block;width:14px;height:14px;vertical-align:middle;margin-right:4px;">${MISC_ART.trophyCup}</span> Create Catch Card</button></div>' : ''}
        <div class="summary-footer">
          <div class="total-earnings">
            <span>Haul Value:</span>
            <strong class="total-cash" id="summary-total-cash">+$${remainingGold.toLocaleString()}</strong>
          </div>
          <div class="summary-actions">
            ${unboxedCrates.length > 0 ? `<button class="btn btn-warning" id="btn-open-crates" style="background:#eab308; color:#1e293b; font-weight:800; border-color:#ca8a04;"><span style="display:inline-block;width:15px;height:15px;vertical-align:middle;margin-right:4px;">${HUD_ICONS.inventory}</span> Open Crates</button>` : ''}
            ${hasUnrestoredRelic ? `<button class="btn btn-warning" id="btn-restore-relic"><span style="display:inline-block;width:15px;height:15px;vertical-align:middle;margin-right:4px;">${JOURNAL_TAB_ART.relics}</span> Restoration Desk</button>` : ''}
            <button class="btn btn-primary" id="btn-keep-all-catches"><span class="summary-btn-art">${MISC_ART.keepAll}</span> Keep All</button>
            <button class="btn btn-buy" id="btn-sell-all-catches"><span class="summary-btn-art">${MISC_ART.sellAll}</span> Sell All</button>
            <button class="btn btn-secondary" id="btn-summary-inventory"><span class="summary-btn-art">${MISC_ART.viewInventory}</span> View Inventory</button>
          </div>
      </div>
    `;

    this.openModal('Dive Completed', modalBody);

    // Render authentic fish previews onto summary canvases
    hook.caughtItems.forEach((item, itemIdx) => {
      const canvas = document.getElementById(`catch-summary-canvas-${itemIdx}`);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fish = specimen(item, canvas.width / 2, canvas.height / 2);
      if (fish) {
        fish.scale = 1.35;
        fish.direction = 1;
        fish.render(ctx, 0);
      }
    });

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

    document.getElementById('share-best-catch')?.addEventListener('click', () => {
      const ranked = hook.caughtItems.filter(item => item.species).sort((a, b) => b.value - a.value);
      if (!ranked.length) return;
      openCatchCard(this, ranked[0], accountManager.getCurrentUser() || 'Guest', () => this.openCatchSummary(hook, onContinue));
    });
    const cratesBtn = document.getElementById('btn-open-crates');
    if (cratesBtn) {
      cratesBtn.addEventListener('click', () => {
        this.openCratesModal(unboxedCrates, hook, onContinue);
      });
    }

    // Individual Keep
    document.querySelectorAll('.btn-catch-keep').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const instId = e.currentTarget.dataset.id;
        const actionsDiv = document.getElementById(`catch-actions-${instId}`);
        if (actionsDiv) {
          actionsDiv.innerHTML = `<span class="status-badge kept-badge"><span style="display:inline-block;width:12px;height:12px;vertical-align:middle;margin-right:3px;">${HUD_ICONS.inventory}</span> In Tackle Box</span>`;
        }
        soundManager.playButtonClick();
      });
    });

    // Individual Sell
    document.querySelectorAll('.btn-catch-sell').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const instId = e.currentTarget.dataset.id;
        if (soldIds.has(instId)) return;
        const res = this.saveSystem.sellInventoryItem(instId, sellMultiplier);
        if (res) {
          soldIds.add(instId);
          soundManager.playCoin();
          const actionsDiv = document.getElementById(`catch-actions-${instId}`);
          if (actionsDiv) {
            actionsDiv.innerHTML = `<span class="status-badge sold-badge"><span style="display:inline-block;width:12px;height:12px;vertical-align:middle;margin-right:3px;">${HUD_ICONS.shop}</span> Sold (+$${res.gold.toLocaleString()})</span>`;
          }
          remainingGold = Math.max(0, remainingGold - res.gold);
          const totalEl = document.getElementById('summary-total-cash');
          if (totalEl) totalEl.textContent = `+$${remainingGold.toLocaleString()}`;
          this.showToast(`🪙 Sold ${res.item.name} for +$${res.gold.toLocaleString()}!`, { dismissOnFishing: true });
        }
      });
    });

    // Keep All Catches
    document.getElementById('btn-keep-all-catches')?.addEventListener('click', () => {
      soundManager.playButtonClick();
      this._onCatchSummaryContinue = null;
      this.closeModal();
      if (onContinue) onContinue();
    });

    // Sell All Catches Now
    document.getElementById('btn-sell-all-catches')?.addEventListener('click', () => {
      let soldCount = 0;
      let totalSoldGold = 0;
      hook.caughtItems.forEach((item) => {
        if (item.isCrate && !item.unboxed) return;
        const instId = item.inventoryRef?.instanceId;
        if (instId && !soldIds.has(instId)) {
          const res = this.saveSystem.sellInventoryItem(instId, sellMultiplier);
          if (res) {
            soldIds.add(instId);
            soldCount++;
            totalSoldGold += res.gold;
          }
        }
      });
      if (soldCount > 0) {
        soundManager.playCoin();
        this.showToast(`🪙 Sold ${soldCount} catches for +$${totalSoldGold.toLocaleString()}!`, { dismissOnFishing: true });
      }
      this._onCatchSummaryContinue = null;
      this.closeModal();
      if (typeof onContinue === 'function') {
        onContinue();
      }
    });

    // View Inventory
    document.getElementById('btn-summary-inventory')?.addEventListener('click', () => {
      this._onCatchSummaryContinue = null;
      this.closeModal();
      this.openInventory();
    });
  }

  // Mystery Loot Crate Unboxing Modal & Drop Preview
  // Mystery Loot Crate Unboxing Modal
  openCratesModal(crates, hook, onContinue) {
    this.activeModal = 'crate_opening';
    this._currentCrateContext = { hook, onContinue };

    if (!crates || crates.length === 0) {
      this._currentCrateContext = null;
      if (hook) this.openCatchSummary(hook, onContinue);
      else this.openInventory();
      return;
    }

    const currentCrate = crates[0];
    const rank = currentCrate.crateRank || 1;
    const rankInfo = CRATE_RANKS.find((r) => r.rank === rank) || CRATE_RANKS[0];
    const preview = getCrateDropPreview(rank, this.saveSystem);

    const modalBody = `
      <p>Epic pity: ${preview.pityCount}/10 · Guaranteed within ${10 - preview.pityCount} opens</p><progress max="10" value="${preview.pityCount}" aria-label="Epic pity"></progress><div class="crate-unboxing-panel" style="text-align: center; padding: 20px 10px;">
        <div style="font-size: 0.85rem; text-transform: uppercase; color: ${RARITY_CONFIG[rankInfo.rarity]?.color || '#cbd5e1'}; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px;">
          Rank ${rankInfo.rank} Mystery Crate (${crates.length} Remaining)
        </div>
        <h3 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 1.35rem;">${currentCrate.name || rankInfo.name}</h3>

        <!-- Interactive Drop Preview Pill -->
        <div style="margin-bottom: 14px;">
          <button class="btn btn-secondary btn-sm" id="btn-inspect-crate-drops" style="font-size: 0.82rem; padding: 5px 14px; border-radius: 999px;">
            🔍 Inspect Drop Table (${preview.rates.superGood.toFixed(2)}% Jackpot · ${preview.rates.fair.toFixed(2)}% Fair · ${preview.rates.superBad.toFixed(2)}% Hazard)
          </button>
        </div>

        <div id="crate-display-stage" style="margin: 20px auto; width: 140px; height: 140px; background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0) 70%); display: flex; align-items: center; justify-content: center; border-radius: 50%;">
          <span id="crate-icon-anim" style="font-size: 4.8rem; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.6)); transition: transform 0.2s;">
            ${crateArtwork(rank)}
          </span>
        </div>

        <!-- CS:GO Horizontal Spinning Reel Stage -->
        <div class="gacha-reel-container" id="gacha-reel-viewport">
          <div class="gacha-reel-pointer"></div>
          <div class="gacha-reel-strip" id="gacha-reel-track">
            <!-- Populated dynamically on spin -->
            <div class="gacha-reel-placeholder">
              <span style="font-size: 3.8rem; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.6));">${rankInfo.icon}</span>
            </div>
          </div>
        </div>

        <p id="crate-status-desc" style="color: #cbd5e1; font-size: 0.92rem; max-width: 420px; margin: 12px auto; line-height: 1.4;">
          ${currentCrate.lore || rankInfo.desc}
        </p>

        <div id="crate-loot-result" style="display: none; margin-bottom: 16px;"></div>

        <div class="crate-actions">
          <button class="btn btn-primary" id="btn-crack-crate" style="padding: 12px 28px; font-size: 1.05rem; font-weight: 800; background: #eab308; color: #1e293b; border-color: #ca8a04; cursor: pointer; transition: all 0.2s ease;">
            🔓 Unlock & Open Crate!
          </button>
        </div>
        <details class="crate-preview"><summary>Potential rewards & exact odds</summary>${crateRewardGallery(rank, this.saveSystem)}</details>
      </div>
    `;

    this.openModal(`🎁 Opening ${rankInfo.name}`, modalBody);

    document.getElementById('btn-inspect-crate-drops')?.addEventListener('click', () => {
      this.openCrateDropPreviewModal(rankInfo.rank, () => {
        this.openCratesModal(crates, hook, onContinue);
      });
    });

    const crackBtn = document.getElementById('btn-crack-crate');
    if (crackBtn) {
      crackBtn.onclick = () => {
        crackBtn.disabled = true;
        const track = document.getElementById('gacha-reel-track');
        const iconEl = document.getElementById('crate-icon-anim');
        const descEl = document.getElementById('crate-status-desc');
        const resultEl = document.getElementById('crate-loot-result');

        if (currentCrate.unboxed || (!hook && !this.saveSystem.getInventory().includes(currentCrate))) return;

        // Local catch economy is committed before its presentation animation.
        const loot = this.saveSystem.mutateAtomically(() => {
        const loot = rollCrateLoot(currentCrate.crateRank, this.saveSystem);
        const realmReward = currentCrate.rewardMultiplier || 1;
        loot.coins = Math.round(loot.coins * realmReward);
        loot.xp = Math.round(loot.xp * Math.min(5, Math.sqrt(realmReward)));
        currentCrate.unboxed = true;
        currentCrate.loot = loot;
        const storedCrateId = currentCrate.instanceId || currentCrate.inventoryRef?.instanceId;
        if (storedCrateId) this.saveSystem.removeItemFromInventory(storedCrateId);
        currentCrate.value = 0;

            this.saveSystem.data.gems = (this.saveSystem.data.gems || 0) + (loot.gems || 0);
            if (loot.gems) this.showToast(`Rare crate find: +${loot.gems} gem!`);
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
            if (loot.bonusFossil && !this.saveSystem.data.fossils?.[loot.bonusFossil.id]) {
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


        if (loot.isDivine) this.saveSystem.data.lastRarePull = { id: crypto.randomUUID(), name: loot.name };
        return loot;
        });
        // Generate 35 items for the CS:GO carousel reel strip with winning item at index 28
        const winningIndex = 28;
        const stripItems = [];
        const allPossible = [...preview.tables.superGood, ...preview.tables.fair, ...preview.tables.superBad];

        for (let i = 0; i < 35; i++) {
          if (i === winningIndex) {
            stripItems.push(loot);
          } else {
            let sample = Math.random() * 100;
            const randItem = allPossible.find(item => (sample -= item.chance) < 0) || allPossible[allPossible.length - 1];
            stripItems.push(randItem);
          }
        }

        // Render carousel cards in track
        if (track) {
          track.innerHTML = stripItems.map((item, idx) => {
            const grade = item.grade || (item.coins > 300 ? 'super_good' : item.coins < 0 ? 'super_bad' : 'fair');
            const borderColor = grade === 'super_good' ? '#c084fc' : grade === 'super_bad' ? '#ef4444' : '#38bdf8';
            return `
              <div class="gacha-reel-card" ${idx === winningIndex ? 'data-winning="true"' : ''} style="border-bottom: 4px solid ${borderColor};">
                <span class="gacha-card-icon">${item.icon || '🎁'}</span>
                <span class="gacha-card-name">${(item.name || 'Loot').substring(0, 16)}</span>
              </div>
            `;
          }).join('');
        }

        // Animate the horizontal reel
        const winner = track?.querySelector('[data-winning]');
        const cards = track?.querySelectorAll('.gacha-reel-card');
        const cardWidth = cards?.length > 1 ? cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left : 110;
        const viewportWidth = track?.parentElement?.clientWidth || 460;
        const winnerCenter = winner && track ? winner.getBoundingClientRect().left - track.getBoundingClientRect().left + winner.getBoundingClientRect().width / 2 : winningIndex * cardWidth;
        const targetScroll = winnerCenter - viewportWidth / 2;

        soundManager.playCast();
        let scrollPos = 0;
        let lastTickCard = -1;
        const startTime = Date.now();
        const spinDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 3200; // ~3.8 seconds suspenseful deceleration

        const spinInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          if (!track?.isConnected) { clearInterval(spinInterval); return; }
          const progress = Math.min(1, elapsed / spinDuration);
          // Ease-out cubic curve
          const easeProgress = 1 - Math.pow(1 - progress, 3.2);
          scrollPos = targetScroll * easeProgress;

          if (track) {
            track.style.transform = `translateX(-${scrollPos}px)`;
          }

          // Suspenseful ticking audio
          const currentCardIdx = Math.floor((scrollPos + viewportWidth / 2) / cardWidth);
          if (currentCardIdx !== lastTickCard && currentCardIdx < stripItems.length) {
            lastTickCard = currentCardIdx;
            try { soundManager.playReelClick(0.8); } catch (e) {}
          }

          if (progress >= 1) {
            clearInterval(spinInterval);

            winner?.classList.add('gacha-winning-card');
            // Reel stopped on winner!
            const isJackpot = loot.grade === 'super_good';
            const isBad = loot.grade === 'super_bad';
            soundManager.playChestOpen(isJackpot);

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
              <div style="border: 2px solid ${borderColor}; background: ${bgGlow}; border-radius: 12px; padding: 18px; margin-top: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); animation: gachaWinnerPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <div style="margin-bottom: 8px;">${gradeTag}</div>
                <div style="font-size: 3.2rem; margin: 8px 0; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));">${loot.icon}</div>
                <h4 style="margin: 0 0 6px 0; font-size: 1.3rem; color: #f8fafc;">${loot.name}</h4>
                <p style="margin: 0 0 10px 0; font-size: 0.95rem; font-weight: 600; color: ${isBad ? '#fca5a5' : '#fef08a'};">${loot.headline}</p>
                <p style="margin: 0 0 14px 0; font-size: 0.88rem; color: #94a3b8; font-style: italic; line-height: 1.4;">"${loot.flavor}"</p>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; font-size: 0.95rem; font-weight: 700;">
                  <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid ${loot.coins >= 0 ? '#4ade80' : '#ef4444'}; color: ${loot.coins >= 0 ? '#4ade80' : '#ef4444'}; padding: 4px 12px; border-radius: 999px;">
                    ${loot.coins >= 0 ? `+${loot.coins.toLocaleString()}` : `-${Math.abs(loot.coins)}`} Coins ${loot.gems ? ` · 💎 +${loot.gems}` : ''}
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

            crates.shift(); // remove opened crate
            // Next button
            if (crates.length > 0) {
              crackBtn.disabled = false;
              crackBtn.textContent = `Open Next Crate (${crates.length} Remaining) 🎁`;
              crackBtn.onclick = () => {
                this.openCratesModal(crates, hook, onContinue);
              };
            } else {
              crackBtn.disabled = false;
              crackBtn.textContent = 'Continue ⛵';
              crackBtn.onclick = () => {
                this._currentCrateContext = null;
                if (hook) this.openCatchSummary(hook, onContinue);
                else this.openInventory();
              };
            }
          }
        }, 16);
      };
    }
  }

  // Interactive drop preview modal showing tables and tier pull percentages
  openCrateDropPreviewModal(crateRank, onBack) {
    const preview = getCrateDropPreview(crateRank, this.saveSystem);
    const modalBody = `
      <div class="drop-preview-modal-panel" style="padding: 10px 4px; max-width: 580px; margin: 0 auto;">
        <p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 16px;">
          Inspecting <strong>${preview.rankConfig.name}</strong>. Here are all potential items and probability percentages:
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; text-align: center;">
          <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; border-radius: 8px; padding: 10px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #f59e0b;">JACKPOT</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #fef08a;">${preview.rates.superGood.toFixed(2)}%</div>
          </div>
          <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; border-radius: 8px; padding: 10px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #38bdf8;">FAIR SALVAGE</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #bae6fd;">${preview.rates.fair.toFixed(2)}%</div>
          </div>
          <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 8px; padding: 10px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #ef4444;">HAZARD / TRASH</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #fca5a5;">${preview.rates.superBad.toFixed(2)}%</div>
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <h4 style="color: #facc15; font-size: 0.95rem; margin-bottom: 8px;">⭐ Super Good Drops (${preview.rates.superGood.toFixed(2)}%):</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${preview.tables.superGood.map(item => `
              <span class="preview-item-chip chip-gold" title="${item.flavor || ''}">${item.icon} ${item.name} (+$${item.coins}) · ${item.chance.toFixed(4)}%</span>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <h4 style="color: #38bdf8; font-size: 0.95rem; margin-bottom: 8px;">✨ Fair Salvage (${preview.rates.fair.toFixed(2)}%):</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${preview.tables.fair.map(item => `
              <span class="preview-item-chip chip-blue" title="${item.flavor || ''}">${item.icon} ${item.name} (+$${item.coins}) · ${item.chance.toFixed(4)}%</span>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 18px;">
          <h4 style="color: #ef4444; font-size: 0.95rem; margin-bottom: 8px;">⚠️ Hazards & Scrap (${preview.rates.superBad.toFixed(2)}%):</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${preview.tables.superBad.map(item => `
              <span class="preview-item-chip chip-red" title="${item.flavor || ''}">${item.icon} ${item.name} (${item.coins >= 0 ? `+$${item.coins}` : `-$${Math.abs(item.coins)}`}) · ${item.chance.toFixed(4)}%</span>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-primary" id="btn-preview-back" style="width: 100%; padding: 10px;">🔙 Return to Crate Unboxing</button>
      </div>
    `;

    this.openModal(`📦 Drop Rates: ${preview.rankConfig.name}`, modalBody);
    document.getElementById('btn-preview-back')?.addEventListener('click', () => {
      if (onBack) onBack();
      else this.closeModal();
    });
  }

  // Sunken Safe & Chest Lockpicking Minigame
  openLockpickMinigame(safeItem, onDone) {
    this.activeModal = 'lockpick';
    soundManager.playTreasure();

    let pinsPicked = 0;
    const totalPins = 3;
    let targetAngle = 60 + Math.random() * 240;
    let currentAngle = 0;
    let needleSpeed = 90; // smooth, controllable degrees per second
    let needleDir = 1;
    let isFinished = false;
    let animId = null;

    const modalBody = `
      <div class="lockpick-modal-content" style="text-align: center; padding: 15px 10px;">
        <div style="margin-bottom: 14px;">
          <h3 style="color: #fde047; font-size: 1.25rem; margin-bottom: 4px;">🪙 Sunken Iron Safe Dredged!</h3>
          <p style="color: #94a3b8; font-size: 0.88rem;">Click the lock dial, click the button, or press Space when the needle is in the green zone to pick all 3 pins!</p>
        </div>

        <div style="position: relative; width: 220px; height: 220px; margin: 0 auto 16px auto; cursor: pointer;" id="lockpick-tap-zone" title="Click anywhere on the dial to pick!">
          <canvas id="lockpick-canvas" width="220" height="220" style="background: #0f172a; border-radius: 50%; border: 3px solid #38bdf8; box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);"></canvas>
        </div>

        <div style="display: flex; justify-content: center; gap: 14px; margin-bottom: 16px;">
          <div class="stat-box" style="padding: 8px 16px;">
            <span class="stat-label">Pins Picked</span>
            <span class="stat-value" id="lockpick-pins" style="color: #4ade80;">0 / 3</span>
          </div>
          <div class="stat-box" style="padding: 8px 16px;">
            <span class="stat-label">Mechanism State</span>
            <span class="stat-value" id="lockpick-status" style="color: #fbbf24;">LOCKED</span>
          </div>
        </div>

        <div id="lockpick-actions">
          <button class="btn btn-primary" id="btn-pick-pin" style="font-size: 1.05rem; padding: 12px 28px;">
            ⚡ Pick Pin (Click Dial or Press Space)
          </button>
        </div>

        <div id="lockpick-rewards" style="display: none; margin-top: 15px; padding: 16px; background: rgba(15, 23, 42, 0.7); border-radius: 8px; border: 1px solid #22c55e;">
          <h4 style="color: #4ade80; margin-bottom: 8px; font-size: 1.15rem;">🔓 SAFE CRACKED OPEN!</h4>
          <p id="lockpick-payout" style="color: #fef08a; font-size: 0.95rem; margin-bottom: 14px; line-height: 1.5;"></p>
          <button class="btn btn-primary" id="btn-claim-safe-loot">🧺 Collect All Safe Loot</button>
        </div>
      </div>
    `;

    this.openModal('🔒 Sunken Safe — Lockpicking Minigame', modalBody);

    const canvas = document.getElementById('lockpick-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sweetTolerance = 42; // Generous +-42 degrees sweet spot

    const updateLoop = () => {
      if (this.activeModal !== 'lockpick' || isFinished) return;

      currentAngle += needleSpeed * needleDir * 0.016;
      if (currentAngle >= 360) currentAngle -= 360;
      if (currentAngle < 0) currentAngle += 360;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 85;

      // Check if needle currently inside sweet spot
      const normCurr = ((currentAngle % 360) + 360) % 360;
      const normTgt = ((targetAngle % 360) + 360) % 360;
      const diff = Math.abs(normCurr - normTgt);
      const shortestDiff = Math.min(diff, 360 - diff);
      const isInside = shortestDiff <= sweetTolerance;

      // Outer dial ring
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Green sweet spot arc
      const startRad = (((targetAngle - sweetTolerance) % 360) * Math.PI) / 180;
      const endRad = (((targetAngle + sweetTolerance) % 360) * Math.PI) / 180;

      ctx.save();
      if (isInside) {
        ctx.strokeStyle = '#4ade80';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 18;
      } else {
        ctx.strokeStyle = '#22c55e';
        ctx.shadowBlur = 0;
      }
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startRad, endRad);
      ctx.stroke();
      ctx.restore();

      // Rotating Needle
      const needleRad = (currentAngle * Math.PI) / 180;
      const nx = cx + Math.cos(needleRad) * (r - 8);
      const ny = cy + Math.sin(needleRad) * (r - 8);

      ctx.save();
      ctx.strokeStyle = isInside ? '#4ade80' : '#f43f5e';
      ctx.lineWidth = isInside ? 5 : 4;
      if (isInside) {
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      ctx.restore();

      // Center lock hub
      ctx.fillStyle = isInside ? '#4ade80' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Center status text
      if (isInside) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('STRIKE!', cx, cy);
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);

    let keyHandler = null;

    const attemptPick = () => {
      if (isFinished) return;

      const normCurr = ((currentAngle % 360) + 360) % 360;
      const normTgt = ((targetAngle % 360) + 360) % 360;
      const diff = Math.abs(normCurr - normTgt);
      const shortestDiff = Math.min(diff, 360 - diff);

      if (shortestDiff <= sweetTolerance + 6) { // Generous latency buffer
        // Hit sweet spot!
        pinsPicked++;
        soundManager.playLockpickClick();
        const pinsEl = document.getElementById('lockpick-pins');
        if (pinsEl) pinsEl.textContent = `${pinsPicked} / ${totalPins}`;

        if (pinsPicked >= totalPins) {
          isFinished = true;
          if (animId) cancelAnimationFrame(animId);
          if (keyHandler) window.removeEventListener('keydown', keyHandler);
          soundManager.playLockpickUnlock();

          const goldPayout = 450 + Math.floor(Math.random() * 350);
          this.saveSystem.addCoins(goldPayout);
          safeItem.unlocked = true;

          const statusEl = document.getElementById('lockpick-status');
          if (statusEl) {
            statusEl.textContent = 'UNLOCKED!';
            statusEl.style.color = '#4ade80';
          }
          const actionsEl = document.getElementById('lockpick-actions');
          if (actionsEl) actionsEl.style.display = 'none';

          const rewardsEl = document.getElementById('lockpick-rewards');
          const payoutEl = document.getElementById('lockpick-payout');
          if (rewardsEl && payoutEl) {
            rewardsEl.style.display = 'block';
            payoutEl.innerHTML = `
              <div>💰 <strong>+$${goldPayout.toLocaleString()} Gold Coins</strong> dredged from the chest!</div>
              <div style="margin-top: 6px; font-size: 0.85rem; color: #38bdf8;">📜 Ancient Hydro-Logbook Page: <em>"In the depths of the trenches, lightning awakens the aberrations..."</em></div>
            `;
            document.getElementById('btn-claim-safe-loot')?.addEventListener('click', () => {
              this.closeModal();
              if (onDone) onDone();
            });
          }
        } else {
          // Advance to next pin target angle
          targetAngle = (targetAngle + 100 + Math.random() * 110) % 360;
          needleSpeed += 15; // Modest needle acceleration
        }
      } else {
        // Miss
        soundManager.playFishEscape();
        needleDir *= -1; // Reverse needle direction
      }
    };

    // Direct click/touch listeners on canvas and tap zone
    canvas.addEventListener('click', attemptPick);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      attemptPick();
    }, { passive: false });

    document.getElementById('btn-pick-pin')?.addEventListener('click', attemptPick);

    keyHandler = (e) => {
      if (this.activeModal === 'lockpick' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        attemptPick();
      }
    };
    window.addEventListener('keydown', keyHandler);
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
              <span>📋</span> Harbor Noticeboard
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

    this.openModal("📋 Quests", questsHtml);

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
    this.openJournalLogbook('journal', defaultTab);
  }

  openJournalLogbook(primaryMenu = 'journal', defaultSubTab = 'fieldlog') {
    this.activeModal = primaryMenu === 'logbook' ? 'achievements' : 'journal';
    const save = this.saveSystem;
    const allSpecies = [...FISH_SPECIES, ...LEGENDARY_SPECIES];
    const caughtSpeciesCount = Object.keys(save.data.journal).length;
    const fossilCount = Object.keys(save.data.fossils).length;

    let currentAlmanacZone = `sea_${save.getCurrentSea()}`;

    const renderAlmanacHtml = (zoneKey = currentAlmanacZone) => {
      currentAlmanacZone = zoneKey;
      const isAberrations = zoneKey === 'aberrations';

      const zonePills = [...FANTASY_SEAS.map(sea => ({ id: `sea_${sea.id}`, name: sea.name, icon: REALM_ART[sea.id] || sea.icon })), { id: 'aberrations', name: 'Aberrations', icon: '☣️' }];

      let navHtml = '<div class="almanac-zone-pills">';
      zonePills.forEach((z) => {
        const activeClass = z.id === zoneKey ? 'active' : '';
        const isArt = typeof z.icon === 'string' && z.icon.includes('<svg');
        const iconHtml = isArt ? `<span class="almanac-pill-art">${z.icon}</span>` : `${z.icon} `;
        navHtml += `<button class="almanac-pill-btn ${activeClass}" data-zone="${z.id}">${iconHtml}${z.name}</button>`;
      });
      navHtml += '</div>';

      if (isAberrations) {
        const catalogList = Object.values(ABERRATIONS_CATALOG);
        const discoveredCount = catalogList.filter(ab => (save.data.aberrations && save.data.aberrations[ab.baseSpeciesId] > 0)).length;

        let html = `
          <div class="almanac-container">
            ${navHtml}
            <div class="almanac-header-card" style="border-left: 4px solid #a855f7; background: linear-gradient(135deg, rgba(88, 28, 135, 0.45), rgba(15, 23, 42, 0.85)); padding: 16px 20px; border-radius: 8px; margin-bottom: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                  <h3 style="color: #f3e8ff; margin: 0 0 4px 0; font-size: 1.25rem;">☣️ The Eldritch Aberrations (Dredge-style Mutations)</h3>
                  <p style="color: #c084fc; font-size: 0.88rem; margin: 0;">Unnatural corrupted horrors dredged from the black depths. Sells for 3.5x to 5.0x gold value!</p>
                </div>
                <div class="almanac-progress-box" style="min-width: 220px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">
                    <span>Aberrations Cataloged</span>
                    <strong style="color: #f3e8ff;">${discoveredCount} / ${catalogList.length}</strong>
                  </div>
                  <div style="background: rgba(15, 23, 42, 0.6); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${Math.round((discoveredCount / catalogList.length) * 100)}%; height: 100%; background: #a855f7;"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="journal-grid">
        `;

        catalogList.forEach((ab) => {
          const count = save.data.aberrations ? (save.data.aberrations[ab.baseSpeciesId] || 0) : 0;
          const isCaught = count > 0;

          if (isCaught) {
            html += `
              <div class="journal-card journal-discovered" style="border-color: #a855f7; background: rgba(30, 27, 75, 0.65);">
                <div class="journal-card-top">
                  <span class="rarity-tag" style="background:#581c87; color:#f3e8ff; border:1px solid #c084fc;">☣️ ABERRATION</span>
                  <span class="zone-tag" style="color: #facc15;">💰 ${ab.sellMultiplier}x Value</span>
                </div>
                <div class="journal-visual">
                  <div class="journal-fish-preview" style="color: ${ab.primaryColor}; font-size: 2.2rem; filter: drop-shadow(0 0 10px ${ab.glowColor});">
                    🐟
                  </div>
                </div>
                <div class="journal-card-info">
                  <h4 style="color: #f3e8ff;">${ab.name}</h4>
                  <p style="font-size: 0.78rem; font-style: italic; color: #d8b4fe; margin-bottom: 6px;">"${ab.title}"</p>
                  <p class="journal-lore">${ab.lore}</p>
                  <div class="journal-meta">
                    <span>Times Caught: <strong>${count}</strong></span>
                    <span>Mutation Rate: <strong>4.0%</strong></span>
                  </div>
                </div>
              </div>
            `;
          } else {
            html += `
              <div class="journal-card journal-undiscovered" style="border-color: #475569;">
                <div class="journal-card-top">
                  <span class="rarity-tag" style="background:#334155; color:#94a3b8;">☣️ ???</span>
                  <span class="zone-tag">Unknown Depth</span>
                </div>
                <div class="journal-visual">
                  <div class="journal-fish-preview silhouette" style="font-size: 2.2rem;">🐟</div>
                </div>
                <div class="journal-card-info">
                  <h4 style="color: #94a3b8;">Undiscovered Aberration</h4>
                  <p class="journal-lore">Eerie genetic mutation of a ${displaySpeciesName(ab.baseSpeciesId)}. Emerges in dark waters, stormy seas, and nocturnal tides.</p>
                  <div style="margin-top: 8px; font-size: 0.78rem; color: #fbbf24; background: rgba(15, 23, 42, 0.5); padding: 4px 8px; border-radius: 4px;">
                    ⚡ <em>Tip: Fish during Thunderstorms or Night tides to trigger mutations!</em>
                  </div>
                </div>
              </div>
            `;
          }
        });

        html += '</div></div>';
        return html;
      }

      // Zone Bestiary
      const zoneData = ZONE_ALMANAC_DATA[zoneKey] || ZONE_ALMANAC_DATA.sea_1;
      const progress = getZoneProgress(zoneKey, save);
      const zoneNum = parseInt(zoneKey.replace('sea_', ''), 10) || 1;
      const zoneArtwork = REALM_ART[zoneNum] || zoneData.icon;

      let perkStatusHtml = '';
      if (progress.perkUnlocked) {
        perkStatusHtml = `<span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; padding: 4px 10px; border-radius: 4px; font-size: 0.82rem; font-weight: 700;">✅ PERK ACTIVE</span>`;
      } else if (progress.completed) {
        perkStatusHtml = `<button class="btn btn-primary btn-claim-zone-perk" data-zone="${zoneKey}" style="padding: 4px 12px; font-size: 0.85rem;">🎁 Claim Zone Perk!</button>`;
      } else {
        perkStatusHtml = `<span style="color: #94a3b8; font-size: 0.82rem; font-style: italic;">🔒 Unlocks at 100% Bestiary</span>`;
      }

      let html = `
        <div class="almanac-container">
          ${navHtml}
          <div class="almanac-header-card" style="background: rgba(15, 23, 42, 0.7); border: 1px solid #334155; padding: 16px 20px; border-radius: 8px; margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
              <div style="display: flex; gap: 14px; align-items: center;">
                <span class="almanac-header-art">${zoneArtwork}</span>
                <div>
                  <h3 style="color: #f8fafc; margin: 0 0 4px 0; font-size: 1.25rem;">${zoneData.name} Almanac</h3>
                  <p style="color: #94a3b8; font-size: 0.88rem; margin: 0; max-width: 520px;">${zoneData.description}</p>
                </div>
              </div>
              <div style="min-width: 220px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 4px;">
                  <span>Bestiary Progress</span>
                  <strong style="color: #38bdf8;">${progress.caught} / ${progress.total} (${progress.percent}%)</strong>
                </div>
                <div style="background: rgba(30, 41, 59, 0.8); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 10px;">
                  <div style="width: ${progress.percent}%; height: 100%; background: #38bdf8; transition: width 0.3s ease;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.6); padding: 6px 10px; border-radius: 6px;">
                  <div style="font-size: 0.82rem; color: #e2e8f0; margin-right: 8px;">
                    <strong>${zoneData.perk.icon} ${zoneData.perk.title}:</strong> <span style="color: #94a3b8;">${zoneData.perk.description}</span>
                  </div>
                  <div>${perkStatusHtml}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="journal-grid">
      `;

      zoneData.speciesIds.forEach((spId) => {
        const species = FISH_SPECIES.find((s) => s.id === spId) || LEGENDARY_SPECIES.find((s) => s.id === spId);
        if (!species) return;

        const entry = save.getSpeciesJournalEntry(species.id);
        const isDiscovered = !!entry;
        const zoneName = FANTASY_SEAS.find(sea => sea.id === species.zone)?.name || 'Unknown Realm';
        const hint = zoneData.hints[species.id] || {};

        if (isDiscovered) {
          const goldCrownBadge = entry.goldCrown ? `<span class="crown-badge gold-crown" title="Gold Crown (Giant)">👑 Giant</span>` : '';
          const silverCrownBadge = entry.silverCrown ? `<span class="crown-badge silver-crown" title="Silver Crown (Mini)">🥈 Mini</span>` : '';
          const gradeBadge = entry.bestGrade === 'Monster'
            ? `<span class="grade-badge grade-monster" style="background:#b45309;color:#fef08a;border:1px solid #facc15;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;">👑 MONSTER</span>`
            : entry.bestGrade === 'Trophy'
            ? `<span class="grade-badge grade-trophy" style="background:#6b21a8;color:#f5d0fe;border:1px solid #d8b4fe;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;">🏆 TROPHY</span>`
            : `<span class="grade-badge grade-average" style="background:#0369a1;color:#bae6fd;padding:2px 6px;border-radius:4px;font-size:10px;">Average</span>`;

          const cleanFishName = displaySpeciesName(species.name || species.id);
          html += `
            <div class="journal-card journal-discovered rarity-border-${species.rarity}">
              <div class="journal-card-top">
                <span class="rarity-tag rarity-${species.rarity}">${species.isGodTier ? 'GOD TIER' : species.isMythic ? '🌟 MYTHIC' : species.rarity.toUpperCase()}</span>
                <span class="zone-tag">Sea ${species.zone}: ${zoneName}</span>
                <span class="zone-tag">${gradeBadge}</span>
              </div>
              <div class="journal-visual">
                <canvas class="journal-fish-preview" data-species="${species.id}" width="240" height="100" aria-label="${cleanFishName}"></canvas>
              </div>
              <div class="journal-card-info">
                <h4>${cleanFishName} ${goldCrownBadge} ${silverCrownBadge}</h4>
                <p class="journal-lore">${species.lore}</p>
                <div class="journal-meta" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.8rem;">
                  <span>Caught: <strong>${entry.timesCaught || entry.count || 0}</strong></span>
                  <span>Record Wt: <strong>${entry.recordWeight || entry.maxWeight || 0} kg</strong></span>
                  <span>Record Len: <strong>${entry.recordLength || entry.maxSize || 0} cm</strong></span>
                  <span>Top Grade: <strong>${entry.bestGrade || 'Average'}</strong></span>
                  ${entry.shinyCount > 0 ? `<span style="color:#fef08a; grid-column: span 2;">✨ ${entry.shinyCount} Shiny</span>` : ''}
                  ${entry.aberrationCount > 0 ? `<span style="color:#c084fc; grid-column: span 2;">☣️ ${entry.aberrationCount} Mutated</span>` : ''}
                </div>
              </div>
            </div>
          `;
        } else {
          html += `
            <div class="journal-card journal-undiscovered">
              <div class="journal-card-top">
                <span class="rarity-tag">${species.isMythic ? '🌟 MYTHIC' : '???'}</span>
                <span class="zone-tag">Sea ${species.zone}: ${zoneName}</span>
                <span class="zone-tag">Dwells: ${hint.depth || (species.minDepth + '-' + species.maxDepth + 'm')}</span>
              </div>
              <div class="journal-visual">
                <canvas class="journal-fish-preview silhouette" data-species="${species.id}" width="240" height="100" aria-label="Undiscovered fish silhouette"></canvas>
              </div>
              <div class="journal-card-info">
                <h4>??? Undiscovered Species</h4>
                <p class="journal-lore">Dwells between ${species.minDepth}m and ${species.maxDepth}m.${species.isMythic ? ' Responds to specific atmospheric weather and time of day!' : ' Cast deep to discover!'}</p>
                <div style="font-size: 0.82rem; color: #94a3b8; display: flex; flex-direction: column; gap: 3px; background: rgba(15, 23, 42, 0.4); padding: 8px; border-radius: 6px; margin-top: 6px;">
                  <div>📍 <strong>Depth:</strong> ${hint.depth || (species.minDepth + ' - ' + species.maxDepth + 'm')}</div>
                  <div>☁️ <strong>Weather:</strong> ${hint.weather || 'Any weather'}</div>
                  <div>🕒 <strong>Time:</strong> ${hint.time || 'Any time'}</div>
                  <div>🪱 <strong>Preferred:</strong> ${hint.bait || 'Standard bait'}</div>
                </div>
              </div>
            </div>
          `;
        }
      });

      html += '</div></div>';
      return html;
    };

    const renderSkeletonsTab = () => {
      const skeletons = save.data.skeletons || { megalodonJaw: 0, dunkleosteus: 0, plesiosaur: 0 };
      const skelList = [
        {
          id: 'megalodonJaw',
          name: 'Colossal Megalodon Jaw Exhibit',
          desc: 'Reconstructed jaw of the supreme apex predator of the Cenozoic oceans.',
          pieces: skeletons.megalodonJaw || 0,
          reward: '3 gems + $1,000 achievement',
          icon: FOSSIL_ART.megalodonJaw,
        },
        {
          id: 'dunkleosteus',
          name: 'Dunkleosteus Placoderm Armor',
          desc: 'Armored dermal plates of a 360-million-year-old Devonian super-carnivore.',
          pieces: skeletons.dunkleosteus || 0,
          reward: '3 gems + $1,000 achievement',
          icon: FOSSIL_ART.dunkleosteus,
        },
        {
          id: 'plesiosaur',
          name: 'Plesiosaur Marine Skeleton',
          desc: 'Full articulated serpentine neck and paddle skeleton of a Jurassic sea voyager.',
          pieces: skeletons.plesiosaur || 0,
          reward: '3 gems + $1,000 achievement',
          icon: FOSSIL_ART.plesiosaur,
        },
      ];

      let html = `
        <div class="skeletons-container">
<div class="museum-intro"><p class="eyebrow">FRAGMENTS OF A LOST OCEAN</p><h3>Fossil Workshop</h3><p>Complete each set to earn 3 gems and unlock a museum centerpiece.</p></div>
          <p class="skeleton-header-tip"><span class="journal-tab-icon-svg" style="display:inline-block; width:18px; height:18px; vertical-align:middle; margin-right:4px;">${FOSSIL_ART.boneFragment}</span> Collect ancient bone fragments from deep fossil silt and idle seabed drift pots to assemble museum skeleton exhibits!</p>
          <div class="skeletons-grid">
      `;

      skelList.forEach((sk) => {
        const pct = Math.min(100, Math.round((sk.pieces / 4) * 100));
        const isComplete = sk.pieces >= 4;

        html += `
          <div class="skeleton-card ${isComplete ? 'skeleton-complete' : ''}">
            <div class="skeleton-header">
              <span class="skeleton-icon" style="width:40px; height:40px; display:inline-flex; align-items:center; justify-content:center;">${sk.icon}</span>
              <div>
                <h4>${sk.name}</h4>
                <p class="skeleton-desc">${sk.desc}</p>
              </div>
            </div>

            <div class="skeleton-progress-row">
              <div class="bone-slots">
                <span class="bone-slot ${sk.pieces >= 1 ? 'bone-active' : ''}">${FOSSIL_ART.boneFragment}</span>
                <span class="bone-slot ${sk.pieces >= 2 ? 'bone-active' : ''}">${FOSSIL_ART.boneFragment}</span>
                <span class="bone-slot ${sk.pieces >= 3 ? 'bone-active' : ''}">${FOSSIL_ART.boneFragment}</span>
                <span class="bone-slot ${sk.pieces >= 4 ? 'bone-active' : ''}">${FOSSIL_ART.boneFragment}</span>
              </div>
              <span class="skeleton-count">${sk.pieces} / 4 Pieces</span>
            </div>

            <div class="ach-prog-bar">
              <div class="ach-prog-fill" style="width: ${pct}%"></div>
            </div>

            <div class="skeleton-status-tag">
              ${isComplete ? '<span class="status-complete-badge">Fully Assembled Museum Centerpiece</span>' : `Bonus Completion: ${sk.reward}`}
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
            <span style="font-size: 3.5rem; display:inline-block; width:64px; height:64px; margin-bottom:10px;">${MISC_ART.trapPot}</span>
            <h3 style="margin: 14px 0 8px 0; color: #f8fafc; font-size: 1.25rem;">No Seabed Drift Pots Deployed</h3>
            <p style="color: #94a3b8; font-size: 0.92rem; max-width: 440px; margin: 0 auto 24px auto; line-height: 1.6;">
              Seabed drift pots passively catch coastal crabs, lobsters, pearl oysters, and prehistoric fossil bone fragments over time. Purchase your first pot in the Tackle Shop to begin idle harvesting!
            </p>
            <button class="btn btn-primary" id="btn-traps-go-shop">Visit Tackle Shop to Buy Traps</button>
          </div>
        `;
      }

      const capacity = this.trapSystem.getStorageCapacity();
      const items = this.trapSystem.getStoredItems();

      let itemsHtml = '<div class="traps-inventory-grid">';
      if (items.length === 0) {
        itemsHtml += `
          <div class="empty-trap-box">
            <span style="font-size: 2.5rem; display:inline-block; width:52px; height:52px; margin-bottom:8px;">${MISC_ART.trapPot}</span>
            <p>Your seabed pots are actively soaking in coastal waters!</p>
            <p class="empty-sub">Traps passively catch crabs, oysters, and bone fragments every 2 minutes even while in other tabs.</p>
            <p class="empty-sub">Traps passively catch crabs, oysters, and bone fragments every 4 minutes even while in other tabs.</p>
          </div>
        `;
      } else {
        items.forEach((it) => {
          const lootDef = TRAP_LOOT_TABLE.find(entry => entry.id === it.id);
          const resolvedValue = lootDef ? lootDef.value : (it.value || 0);
          itemsHtml += `
            <div class="trap-item-pill">
              <span class="trap-item-icon">${it.icon || '🦀'}</span>
              <div class="trap-item-info">
                <strong>${it.name}</strong>
                <span>+$${it.value} • +${it.xp} XP</span>
                <span>+$${resolvedValue} • +${it.xp || 10} XP</span>
              </div>
            </div>
          `;
        });
      }
      itemsHtml += '</div>';

      return `
<div class="traps-panel"><div class="museum-intro"><p class="eyebrow">QUIET WATERS, HIDDEN FINDS</p><h3>Seabed Drift Pots</h3><p>Let your pots soak while you explore. Collect shellfish, lost coins, and ancient fragments.</p></div>
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
              <span class="stat-value">4.0 mins / soak</span>
            </div>
          </div>

          ${itemsHtml}

          <div class="traps-footer">
            <button class="btn btn-primary" id="btn-harvest-modal" ${items.length === 0 ? 'disabled' : ''}>
              <span class="btn-icon-svg" style="display:inline-block; width:20px; height:20px; vertical-align:middle; margin-right:6px;">${MISC_ART.harvestBasket}</span>Harvest All Traps (${items.length} Items)
            </button>
          </div>
        </div>
      `;
    };

    const renderCrewTab = () => `<div class="crew-panel">
      <p class="skeleton-header-tip">Your vessel companions. Bring each friend aboard or let them rest ashore.</p>
      <div class="crew-grid">${Object.values(PET_DEFINITIONS).map(pet => {
        const unlocked = save.hasPet(pet.id), aboard = save.isPetEquipped(pet.id);
        return `<article class="crew-card ${unlocked ? '' : 'crew-locked'}">
          <div class="crew-card-top"><span>${pet.species}</span><span>${unlocked ? aboard ? 'Aboard' : 'Resting' : 'Undiscovered'}</span></div>
          <div class="crew-art-portrait">${CREW_ART[pet.id] || pet.icon}</div><h3>${pet.name}</h3>
          <p>${pet.lore}</p><p class="crew-perk">${unlocked ? pet.perk : pet.unlockHint}</p>
          ${unlocked ? `<button class="btn btn-secondary" data-equip-pet="${pet.id}" aria-pressed="${aboard}">${aboard ? 'Let rest ashore' : 'Bring aboard'}</button>` : ''}
        </article>`;
      }).join('')}</div></div>`;

    const relicData = save.data.relics || {};
    const restoredRelicsCount = Object.values(relicData).filter(r => r.restored).length;
    const activeTrapCount = this.trapSystem ? this.trapSystem.getTrapCount() : 0;
    const unlockedPetCount = Object.keys(PET_DEFINITIONS).filter(id => save.hasPet(id)).length;

    const modalBody = `
      <div class="journal-logbook-container">
        <!-- 2 Primary Menus -->
        <div class="primary-menu-tabs">
          <button class="primary-tab-btn ${primaryMenu === 'journal' ? 'active' : ''}" id="primary-menu-journal">
            <span class="journal-tab-icon-svg">${MISC_ART.fieldJournalBook}</span> Field Journal & Collections
          </button>
          <button class="primary-tab-btn ${primaryMenu === 'logbook' ? 'active' : ''}" id="primary-menu-logbook">
            <span class="journal-tab-icon-svg">${MISC_ART.trophyCup}</span> Trophy Room
          </button>
        </div>

        <!-- Primary Menu 1: Field Journal & Collections -->
        <div id="view-journal" style="display: ${primaryMenu === 'journal' ? 'block' : 'none'};">
          <div class="journal-wrapper">
            <div class="journal-tabs">
              <button class="tab-btn ${defaultSubTab === 'fieldlog' ? 'active' : ''}" id="tab-fieldlog"><span class="journal-tab-icon-svg">${JOURNAL_TAB_ART.almanac}</span> Angler's Almanac (${caughtSpeciesCount} / ${allSpecies.length})</button>
              <button class="tab-btn ${defaultSubTab === 'scoreboard' ? 'active' : ''}" id="tab-scoreboard" style="border: 1px solid #facc15; color: #facc15; font-weight: 700;"><span class="journal-tab-icon-svg">${JOURNAL_TAB_ART.scoreboard}</span> Scoreboard</button>
              <button class="tab-btn ${defaultSubTab === 'aquarium' ? 'active' : ''}" id="tab-aquarium" style="border: 1px solid #38bdf8; color: #38bdf8; font-weight: 700;"><span class="journal-tab-icon-svg">${JOURNAL_TAB_ART.aquarium}</span> Aquarium ${save.hasAquarium() ? `(${save.getAquariumItems().length}/${save.getAquariumCapacity()})` : '(Unlock in Shop)'}</button>
              <button class="tab-btn ${defaultSubTab === 'crew' ? 'active' : ''}" id="tab-crew"><span class="journal-tab-icon-svg">${JOURNAL_TAB_ART.crew}</span> Vessel Crew (${unlockedPetCount} / ${Object.keys(PET_DEFINITIONS).length})</button>
              <button class="tab-btn ${defaultSubTab === 'relics' ? 'active' : ''}" id="tab-relics"><span class="journal-tab-icon-svg">${JOURNAL_TAB_ART.relics}</span> Cabin Shelf (${restoredRelicsCount} / 5)</button>
              <button class="tab-btn ${defaultSubTab === 'skeletons' ? 'active' : ''}" id="tab-skeletons"><span class="journal-tab-icon-svg">${JOURNAL_TAB_ART.fossils}</span> Fossils</button>
              <button class="tab-btn ${defaultSubTab === 'traps' ? 'active' : ''}" id="tab-traps"><span class="journal-tab-icon-svg">${JOURNAL_TAB_ART.traps}</span> Seabed Traps${activeTrapCount > 0 ? '' : ' (Not Owned)'}</button>
              <button class="tab-btn ${defaultSubTab === 'fossils' ? 'active' : ''}" id="tab-fossils"><span class="journal-tab-icon-svg">${JOURNAL_TAB_ART.museum}</span> Relic Museum (${fossilCount} / 5)</button>
            </div>
            <div id="journal-tab-content">
              ${defaultSubTab === 'crew' ? renderCrewTab() : defaultSubTab === 'traps' ? renderTrapsTab() : defaultSubTab === 'skeletons' ? renderSkeletonsTab() : defaultSubTab === 'relics' ? '' : defaultSubTab === 'fossils' ? '' : defaultSubTab === 'aquarium' ? '' : defaultSubTab === 'scoreboard' ? '' : renderAlmanacHtml(currentAlmanacZone)}
            </div>
          </div>
        </div>

        <!-- Primary Menu 2: Trophy Room -->
        <div id="view-logbook" style="display: ${primaryMenu === 'logbook' ? 'block' : 'none'};">
          ${this.getLogbookHtml()}
        </div>
      </div>
    `;

    this.openModal("Angler's Almanac & Field Journal", modalBody);

    const journalTabBtn = document.getElementById('primary-menu-journal');
    const logbookTabBtn = document.getElementById('primary-menu-logbook');
    const viewJournal = document.getElementById('view-journal');
    const viewLogbook = document.getElementById('view-logbook');

    journalTabBtn?.addEventListener('click', () => {
      soundManager.playButtonClick();
      this.activeModal = 'journal';
      journalTabBtn.classList.add('active');
      logbookTabBtn.classList.remove('active');
      viewJournal.style.display = 'block';
      viewLogbook.style.display = 'none';
    });

    logbookTabBtn?.addEventListener('click', () => {
      soundManager.playButtonClick();
      this.activeModal = 'achievements';
      logbookTabBtn.classList.add('active');
      journalTabBtn.classList.remove('active');
      viewJournal.style.display = 'none';
      viewLogbook.style.display = 'block';
    });

    const bindCrewEvents = () => {
      document.querySelectorAll('[data-equip-pet]').forEach(button => button.addEventListener('click', () => {
        const id = button.dataset.equipPet;
        save.setPetEquipped(id, !save.isPetEquipped(id));
        document.getElementById('journal-tab-content').innerHTML = renderCrewTab();
        bindCrewEvents();
      }));
    };
    if (defaultSubTab === 'crew') bindCrewEvents();
    const bindAlmanacEvents = () => {
      document.querySelectorAll('canvas[data-species]').forEach(canvas => {
        const species = allSpecies.find(fish => fish.id === canvas.dataset.species);
        if (!species) return;
        const fish = new Fish(species, 0, 0);
        fish.x = 0; fish.y = 0;
        fish.isShiny = false; fish.crown = null; fish.scale = 0.65;
        const ctx = canvas.getContext('2d');
        const isSilhouette = canvas.classList.contains('silhouette');
        if (isSilhouette) {
          ctx.save();
          ctx.filter = 'brightness(0) contrast(100%) opacity(0.35)';
        }
        ctx.translate(120, 50); fish.render(ctx, 0);
        if (isSilhouette) {
          ctx.restore();
        }
      });
      document.querySelectorAll('.almanac-pill-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          soundManager.playButtonClick();
          const zKey = e.currentTarget.getAttribute('data-zone');
          document.getElementById('journal-tab-content').innerHTML = renderAlmanacHtml(zKey);
          bindAlmanacEvents();
        });
      });

      document.querySelectorAll('.btn-claim-zone-perk').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const zKey = e.currentTarget.getAttribute('data-zone');
          const res = this.saveSystem.claimZonePerk(zKey);
          if (res.success) {
            soundManager.playUpgrade();
            this.showToast(`🎉 UNLOCKED PERK: ${res.perk.title}! (${res.perk.description})`);
            document.getElementById('journal-tab-content').innerHTML = renderAlmanacHtml(zKey);
            bindAlmanacEvents();
          } else {
            this.showToast(`❌ ${res.reason}`);
          }
        });
      });
    };

    if (primaryMenu === 'journal') {
      if (defaultSubTab === 'relics') {
        this.renderCabinShelfTab();
      } else if (defaultSubTab === 'fossils') {
        this.renderFossilMuseumTab();
      } else if (defaultSubTab === 'aquarium') {
        this.renderAquariumTab();
      } else if (defaultSubTab === 'scoreboard') {
        this.renderScoreboardTab('level');
      } else if (defaultSubTab === 'traps') {
        this.bindTrapsTabEvents();
      } else if (defaultSubTab === 'fieldlog') {
        bindAlmanacEvents();
      }
    }

    const setupTabListeners = () => {
      const activateTab = (tabId) => {
        document.querySelectorAll('#view-journal .tab-btn').forEach((b) => b.classList.remove('active'));
        document.getElementById(tabId)?.classList.add('active');
      };

      document.getElementById('tab-fieldlog')?.addEventListener('click', () => {
        soundManager.playButtonClick();
        activateTab('tab-fieldlog');
        document.getElementById('journal-tab-content').innerHTML = renderAlmanacHtml(currentAlmanacZone);
        bindAlmanacEvents();
      });

      document.getElementById('tab-scoreboard')?.addEventListener('click', () => {
        soundManager.playButtonClick();
        activateTab('tab-scoreboard');
        this.renderScoreboardTab('level');
      });

      const crewBtn = document.getElementById('tab-crew');
      if (crewBtn) {
        crewBtn.addEventListener('click', () => {
          soundManager.playButtonClick();
          activateTab('tab-crew');
          document.getElementById('journal-tab-content').innerHTML = renderCrewTab();
          bindCrewEvents();
        });
      }

      document.getElementById('tab-relics')?.addEventListener('click', () => {
        soundManager.playButtonClick();
        activateTab('tab-relics');
        this.renderCabinShelfTab();
      });

      document.getElementById('tab-skeletons')?.addEventListener('click', () => {
        soundManager.playButtonClick();
        activateTab('tab-skeletons');
        document.getElementById('journal-tab-content').innerHTML = renderSkeletonsTab();
      });

      document.getElementById('tab-traps')?.addEventListener('click', () => {
        soundManager.playButtonClick();
        activateTab('tab-traps');
        document.getElementById('journal-tab-content').innerHTML = renderTrapsTab();
        this.bindTrapsTabEvents();
      });

      document.getElementById('tab-fossils')?.addEventListener('click', () => {
        soundManager.playButtonClick();
        activateTab('tab-fossils');
        this.renderFossilMuseumTab();
      });

      document.getElementById('tab-aquarium')?.addEventListener('click', () => {
        soundManager.playButtonClick();
        activateTab('tab-aquarium');
        this.renderAquariumTab();
      });
    };

    setupTabListeners();
  }

  bindTrapsTabEvents() {
    const harvestBtn = document.getElementById('btn-harvest-modal');
    if (harvestBtn) {
      harvestBtn.addEventListener('click', () => {
        this.handleTrapClick();
        this.openJournalLogbook('journal', 'traps');
      });
    }
    const goShopBtn = document.getElementById('btn-traps-go-shop');
    if (goShopBtn) {
      goShopBtn.addEventListener('click', () => {
        this.openShop();
      });
    }
  }

  // Fetch shared rankings; local standings are explicitly labelled if offline.
  async renderScoreboardTab(sortMode = 'level', board = null) {
    const container = document.getElementById('journal-tab-content');
    if (!container) return;

    if (!board) {
      const request = this.scoreboardRequest = (this.scoreboardRequest || 0) + 1;
      const username = accountManager.getCurrentUser();
      container.innerHTML = '<p role="status" class="scoreboard-loading">Connecting to the World Angler Scoreboard…</p>';
      const loading = container.firstElementChild;
      try { board = await leaderboardManager.getBoard(this.saveSystem, sortMode); }
      catch {
        board = { entries: this.saveSystem.getScoreboardData(), online: false };
      }
      // A delayed response must never replace a different journal tab/account.
      if (request !== this.scoreboardRequest || !container.isConnected ||
          container.firstElementChild !== loading || username !== accountManager.getCurrentUser()) return;
    }

    const rawEntries = board.entries;
    const isGuest = accountManager.isGuest();
    const currentUser = accountManager.getCurrentUser();

    // Sort according to requested ranking mode
    const sorted = [...rawEntries];
    if (sortMode === 'level') {
      sorted.sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (b.coins !== a.coins) return b.coins - a.coins;
        if (b.totalFishCaught !== a.totalFishCaught) return b.totalFishCaught - a.totalFishCaught;
        return a.createdAt - b.createdAt;
      });
    } else {
      sorted.sort((a, b) => {
        if (b.coins !== a.coins) return b.coins - a.coins;
        if (b.totalGoldEarned !== a.totalGoldEarned) return b.totalGoldEarned - a.totalGoldEarned;
        if (b.level !== a.level) return b.level - a.level;
        return a.createdAt - b.createdAt;
      });
    }

    const top100 = sorted.slice(0, 100);

    let userRank = -1;
    let userStats = null;
    if (!isGuest && currentUser) {
      userRank = sorted.findIndex(e => e.isCurrent) + 1;
      userStats = sorted.find(e => e.isCurrent) || board.ownScore;
      userStats = sorted.find(e => e.isCurrent);
    }

    let html = `
      <div class="scoreboard-container">
        <!-- Scoreboard Header Card -->
        <div class="scoreboard-header-card">
          <div class="scoreboard-header-left">
            <div class="scoreboard-trophy-badge">🏆</div>
            <div>
              <h3 class="scoreboard-title">World Angler Scoreboard</h3>
              <p class="scoreboard-subtitle">
                ${board.online ? 'Shared rankings across the Seven Seas. Scores update every minute; guests are unranked.' : 'Offline: showing accounts saved in this browser only. World rankings are currently unavailable.'}
                Official rankings of registered captain accounts across the Seven Seas (Guest records are unranked).
              </p>
            </div>
          </div>
          <div class="scoreboard-header-actions">
            <button class="btn btn-secondary btn-sm" id="btn-scoreboard-refresh">Refresh</button>
            <div class="scoreboard-toggle-pill-group">
              <button class="scoreboard-pill-btn ${sortMode === 'level' ? 'active' : ''}" data-sort="level">
                🎖️ Rank by Level (Top 100)
              </button>
              <button class="scoreboard-pill-btn ${sortMode === 'money' ? 'active' : ''}" data-sort="money">
                💰 Rank by Money (Top 100)
              </button>
            </div>
          </div>
        </div>
    `;

    // Status Banner: Account vs Guest
    if (isGuest) {
      html += `
        <div class="scoreboard-guest-banner">
          <div class="guest-banner-icon">⚓</div>
          <div class="guest-banner-text">
            <strong>Playing as Guest:</strong> Only created player accounts are officially ranked on the Top 100 Scoreboard. Guest catches and coins are stored locally and excluded from standings.
          </div>
          <button class="btn btn-primary btn-sm" id="btn-scoreboard-open-auth">
            Create Account & Join Ranks
          </button>
        </div>
      `;
    } else if (userStats) {
      html += `
        <div class="scoreboard-user-banner">
          <div class="user-banner-col">
            <span class="user-banner-label">Your Captain Account</span>
            <span class="user-banner-val">👤 <strong>${escapeScoreboardText(currentUser)}</strong></span>
          </div>
          <div class="user-banner-col">
            <span class="user-banner-label">Current Standing</span>
            <span class="user-banner-val" style="color: #facc15;">${userRank > 0 ? `#${userRank}` : board.syncFailed ? 'Sync pending' : 'Outside Top 100'}</span>
          </div>
          <div class="user-banner-col">
            <span class="user-banner-label">Level</span>
            <span class="user-banner-val">Lv. ${userStats.level}</span>
          </div>
          <div class="user-banner-col">
            <span class="user-banner-label">Purse Wealth</span>
            <span class="user-banner-val" style="color: #38bdf8;">💰 ${userStats.coins.toLocaleString()}</span>
          </div>
          <div class="user-banner-col">
            <span class="user-banner-label">Deepest Dive</span>
            <span class="user-banner-val">⚓ ${Math.round(userStats.maxDepthReached)}m</span>
          </div>
        </div>
      `;
    }

    if (top100.length === 0) {
      html += `
        <div class="scoreboard-empty-state">
          <div style="font-size: 3.2rem; margin-bottom: 8px;">📜</div>
          <h4>No Ranked Captains Yet</h4>
          <p>
            ${board.online ? 'Captains appear here after playing online with a registered account.' : 'No registered captain saves were found in this browser.'}
            Guest accounts are not ranked.
            Create an account to be ranked #1 on the scoreboard!
          </p>
          <button class="btn btn-primary" id="btn-scoreboard-register-empty">
            ⚓ Create First Captain Account
          </button>
        </div>
      `;
    } else {
      html += `
        <div class="scoreboard-table-wrap">
          <table class="scoreboard-table">
            <thead>
              <tr>
                <th style="width: 70px; text-align: center;">Rank</th>
                <th style="text-align: left;">Captain Account</th>
                <th style="text-align: center;">${sortMode === 'level' ? '⭐ Level' : '💰 Coins'}</th>
                <th style="text-align: center;">${sortMode === 'level' ? '💰 Coins' : '⭐ Level'}</th>
                <th style="text-align: center;">🐟 Fish Caught</th>
                <th style="text-align: center;">⚓ Max Depth</th>
                <th style="text-align: right;">Joined</th>
              </tr>
            </thead>
            <tbody>
      `;

      top100.forEach((item, idx) => {
        const rank = idx + 1;
        let rankBadge = `<span class="rank-num">#${rank}</span>`;
        let rowClass = 'scoreboard-row';

        if (rank === 1) {
          rankBadge = `<span class="rank-medal rank-gold">🥇 1</span>`;
          rowClass += ' row-top-1';
        } else if (rank === 2) {
          rankBadge = `<span class="rank-medal rank-silver">🥈 2</span>`;
          rowClass += ' row-top-2';
        } else if (rank === 3) {
          rankBadge = `<span class="rank-medal rank-bronze">🥉 3</span>`;
          rowClass += ' row-top-3';
        }

        if (item.isCurrent) {
          rowClass += ' row-current-user';
        }

        const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        const primaryCol = sortMode === 'level'
          ? `<span class="level-badge-tag">Lv. ${item.level}</span>`
          : `<span class="coin-gold-tag">💰 ${item.coins.toLocaleString()}</span>`;

        const secondaryCol = sortMode === 'level'
          ? `<span class="coin-muted-tag">💰 ${item.coins.toLocaleString()}</span>`
          : `<span class="level-badge-tag">Lv. ${item.level}</span>`;

        html += `
          <tr class="${rowClass}">
            <td style="text-align: center;">${rankBadge}</td>
            <td style="text-align: left;">
              <div class="captain-cell">
                <span class="captain-avatar">${item.level >= 20 ? '👑' : item.level >= 10 ? '⚓' : '⛵'}</span>
                <span class="captain-username">${escapeScoreboardText(item.username)}</span>${item.id ? `<button class="btn btn-secondary btn-sm" data-visit-aquarium="${escapeScoreboardText(item.id)}">Visit</button>` : ''}
                ${item.isCurrent ? '<span class="badge-you">YOU</span>' : ''}
              </div>
            </td>
            <td style="text-align: center;">${primaryCol}</td>
            <td style="text-align: center;">${secondaryCol}</td>
            <td style="text-align: center; color: #cbd5e1;">${item.totalFishCaught.toLocaleString()}</td>
            <td style="text-align: center; color: #38bdf8;">${Math.round(item.maxDepthReached)}m</td>
            <td style="text-align: right; color: #94a3b8; font-size: 0.8rem;">${dateStr}</td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    if (board.syncFailed) html += '<p role="status">Your score could not be uploaded yet. Your game is saved locally; use Refresh to retry.</p>';
    html += `</div>`;

    container.innerHTML = html;
    container.querySelectorAll('[data-visit-aquarium]').forEach(button => { button.onclick = () => visitAquarium(this, button.dataset.visitAquarium); });

    // Bind events for sorting & account buttons
    container.querySelector('#btn-scoreboard-refresh')?.addEventListener('click', () => this.renderScoreboardTab(sortMode));
    container.querySelectorAll('.scoreboard-pill-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        soundManager.playButtonClick();
        const mode = e.currentTarget.getAttribute('data-sort');
        this.renderScoreboardTab(mode);
      });
    });

    const openAuthHandler = () => {
      soundManager.playButtonClick();
      this.closeModal();
      const welcome = document.getElementById('welcome-popup');
      if (welcome) {
        welcome.classList.remove('welcome-overlay-hidden');
        welcome.style.display = 'flex';
      }
    };

    container.querySelector('#btn-scoreboard-open-auth')?.addEventListener('click', openAuthHandler);
    container.querySelector('#btn-scoreboard-register-empty')?.addEventListener('click', openAuthHandler);
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
    const save = this.saveSystem;
    const fossils = TREASURE_ITEMS.filter(item => item.category === 'fossil');
    const sets = Object.entries({ megalodonJaw: 'Megalodon Jaw', dunkleosteus: 'Dunkleosteus Armor', plesiosaur: 'Plesiosaur Skeleton' })
      .map(([id, name]) => ({ id, name, lore: 'A reconstructed prehistoric centerpiece.', found: save.data.skeletons[id] >= 4 }));
    const collection = [...sets, ...fossils.map(f => ({ ...f, found: save.data.fossils[f.id]?.count > 0 }))];
    const displays = save.data.museumDisplays || [];
    const exhibited = collection.filter(item => displays.includes(item.id) && item.found);
    const gallery = Array.from({ length: 6 }, (_, index) => {
      const item = exhibited[index];
      return `<div class="museum-plinth"><span>${item ? '🦴' : '✦'}</span><strong>${item ? item.name : 'Empty exhibit'}</strong></div>`;
    }).join('');
    document.getElementById('journal-tab-content').innerHTML = `<div class="museum-intro"><p class="eyebrow">THE CAPTAIN'S COLLECTION</p><h3>Your Fossil Gallery</h3><p>Choose six discoveries to exhibit. Reconstructed sets earn a one-time gem achievement.</p></div><div class="museum-gallery">${gallery}</div><h3 class="collection-heading">Arrange your collection</h3><div class="fossil-grid">${collection.map(item => `<article class="fossil-card ${item.found ? 'fossil-discovered' : 'fossil-locked'}"><div class="fossil-info"><h4>${item.found ? item.name : 'Undiscovered specimen'}</h4>${item.collection ? `<p>${item.collection} &middot; Realm ${item.zone}</p>` : ''}<p class="fossil-lore">${item.found ? item.lore || 'A remarkable relic of the ancient ocean.' : item.minDepth ? `Search below ${item.minDepth}m.` : 'Find all four fragments to reconstruct this set.'}</p><button class="btn btn-secondary btn-sm" data-exhibit="${item.id}" ${item.found ? '' : 'disabled'}>${displays.includes(item.id) ? 'Remove from gallery' : 'Place in museum'}</button></div></article>`).join('')}</div>`;
    document.querySelectorAll('[data-exhibit]').forEach(button => button.addEventListener('click', () => {
      if (!save.toggleMuseumDisplay(button.dataset.exhibit)) this.showToast('The gallery holds six exhibits. Remove one first.');
      this.renderFossilMuseumTab();
    }));
  }

  openAquariumModal() {
    this.openJournalLogbook('journal', 'aquarium');
  }

  renderAquariumTab() {
    const save = this.saveSystem;
    const container = document.getElementById('journal-tab-content');
    if (!container) return;

    if (!save.hasAquarium()) {
      container.innerHTML = `
        <div class="aquarium-locked-container">
          <div style="font-size: 3.5rem; margin-bottom: 8px;">🏛️🐠</div>
          <h3 style="font-size: 1.5rem; color: #f8fafc; margin-bottom: 8px;">Personal Marine Aquarium (Milestone Purchase)</h3>
          <p style="color: #94a3b8; max-width: 540px; margin: 0 auto 16px; font-size: 0.95rem; line-height: 1.5;">
            Purchase your very own <strong>Personal Marine Aquarium</strong> from the Tackle Shop! House your favorite catches and rare sea relics in an interactive animated tank, customize water themes, and collect passive visitor tip income.
          </p>
          <div class="aquarium-perks-box">
            <div class="perk-row"><span>🐠</span> Display live swimming fish with authentic species colors, scales & crowns</div>
            <div class="perk-row"><span>🏺</span> Exhibit rare ocean relics & sunken treasures on seabed pedestals</div>
            <div class="perk-row"><span>🎨</span> Choose between 4 themes: Sunlit Reef, Biolum Abyss, Atlantis & Nebula</div>
            <div class="perk-row"><span>🪙</span> Earn passive visitor tip gold generated over time</div>
            <div class="perk-row"><span>📦</span> Expandable capacity: 5 slots (Tier I), 10 slots (Tier II), 20 slots (Tier III)</div>
          </div>
          <button class="btn btn-buy btn-lg" id="btn-unlock-aquarium-shop" style="margin-top: 16px;">
            🛒 View Personal Aquarium in Tackle Shop ($1,450)
          </button>
        </div>
      `;
      document.getElementById('btn-unlock-aquarium-shop')?.addEventListener('click', () => {
        this.openShop();
      });
      return;
    }

    const items = save.getAquariumItems();
    const capacity = save.getAquariumCapacity();
    const theme = save.data.aquarium?.theme || 'reef';
    const pendingTips = save.calculatePendingVisitorTips();
    const currentTier = save.getUpgradeLevel('personalAquarium') || 1;

    let inhabitantsCardsHtml = '';
    items.forEach((item) => {
      const isFish = item.type === 'fish';
      const isRelic = item.type === 'relic' || item.isRelic;
      const shinyTag = item.isShiny ? '✨' : '';
      const crownTag = item.crown === 'gold' ? '👑' : item.crown === 'silver' ? '🥈' : '';

      inhabitantsCardsHtml += `
        <div class="inhabitant-slot-card filled rarity-border-${item.rarity}">
          <div class="slot-icon" style="color: ${item.primaryColor || '#38bdf8'}; font-size: 1.8rem;">
            ${item.icon || (isRelic ? '🏺' : '🐟')}
          </div>
          <div class="slot-info">
            <div class="slot-name">${shinyTag} ${crownTag} ${item.name}</div>
            <div class="slot-sub">${isFish ? `${item.size}cm • ${item.weight}kg` : isRelic ? `Relic (${item.era || 'Ancient'})` : 'Specimen'}</div>
          </div>
          <button class="btn btn-sm btn-outline btn-remove-inhabitant" data-id="${item.instanceId}" title="Return specimen back to tackle box" style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-color:#38bdf8;color:#e0f2fe;font-weight:600;font-size:0.75rem;"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg><span>Return</span></button>
        </div>
      `;
    });

    const emptySlots = Math.max(0, capacity - items.length);
    for (let s = 0; s < emptySlots; s++) {
      inhabitantsCardsHtml += `
        <div class="inhabitant-slot-card empty btn-assign-slot">
          <div class="slot-empty-icon">➕</div>
          <div class="slot-empty-text">Empty Slot<br><span style="font-size:0.75rem; color:#64748b;">Click to Assign</span></div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="aquarium-panel">
        <div class="aquarium-header-bar">
          <div class="aq-stat-pill">
            <span class="aq-lbl">Capacity:</span>
            <strong>${items.length} / ${capacity} Slots (Tier ${currentTier})</strong>
          </div>
          <div class="aq-stat-pill aq-tips-pill">
            <span class="aq-lbl" title="Each fish earns tips by rarity. More fish and rarer catches increase earnings; stores up to one hour of tips.">Visitor Tips ($${save.getVisitorTipRate().toLocaleString()}/min):</span>
            <strong style="color: #facc15;">🪙 $${pendingTips.toLocaleString()}</strong>
            <button class="btn btn-sm btn-buy" id="btn-collect-tips" ${pendingTips > 0 ? '' : 'disabled'}>💰 Collect</button>
          </div>
          <div class="aq-theme-selector">
            <span class="aq-lbl">Theme:</span>
            <button class="theme-btn ${theme === 'reef' ? 'active' : ''}" data-theme="reef">🪸 Reef</button>
            <button class="theme-btn ${theme === 'abyss' ? 'active' : ''}" data-theme="abyss">🌌 Abyss</button>
            <button class="theme-btn ${theme === 'atlantis' ? 'active' : ''}" data-theme="atlantis">🏛️ Atlantis</button>
            <button class="theme-btn ${theme === 'nebula' ? 'active' : ''}" data-theme="nebula">✨ Nebula</button>
          </div>
          <div class="aq-actions-col">
            <button class="btn btn-secondary btn-sm" id="btn-feed-fish">🌾 Feed Fish ($1)</button>
            <button class="btn btn-secondary btn-sm" id="share-aquarium">Share Aquarium</button><button class="btn btn-secondary btn-sm" id="visit-aquarium">Visit Aquarium Link</button>
            <button class="btn btn-outline btn-sm" id="btn-aq-upgrade">🛒 Upgrade</button>
          </div>
        </div>

        <div class="aquarium-canvas-box">
          <canvas id="aquarium-canvas" width="760" height="380"></canvas>
          <div class="aquarium-canvas-hint">Click tank to tap the glass • Food attracts fish • Relics rest on seabed</div>
        </div>

        <details class="aquarium-style-shop" ${this.aquariumDecorOpen ? 'open' : ''}>
          <summary>Decorate your aquarium <span>Owned styles are free to reuse</span></summary>
          <div class="aq-theme-selector">
            <span class="aq-lbl">Theme:</span>
            <button class="theme-btn ${theme === 'reef' ? 'active' : ''}" data-theme="reef">🪸 Reef ${save.getAquariumStyleCost('theme', 'reef') ? '💎 ' + save.getAquariumStyleCost('theme', 'reef') : '(Owned)'}</button>
            <button class="theme-btn ${theme === 'abyss' ? 'active' : ''}" data-theme="abyss">🌌 Abyss ${save.getAquariumStyleCost('theme', 'abyss') ? '💎 ' + save.getAquariumStyleCost('theme', 'abyss') : '(Owned)'}</button>
            <button class="theme-btn ${theme === 'atlantis' ? 'active' : ''}" data-theme="atlantis">🏛️ Atlantis ${save.getAquariumStyleCost('theme', 'atlantis') ? '💎 ' + save.getAquariumStyleCost('theme', 'atlantis') : '(Owned)'}</button>
            <button class="theme-btn ${theme === 'nebula' ? 'active' : ''}" data-theme="nebula">✨ Nebula ${save.getAquariumStyleCost('theme', 'nebula') ? '💎 ' + save.getAquariumStyleCost('theme', 'nebula') : '(Owned)'}</button>
          </div>
        <div class="customize-grid aquarium-decor-controls">${Object.entries(AQUARIUM_OPTIONS).map(([key, config]) => `<label class="customize-field">${config.label}<select data-aquarium-decor="${key}">${config.choices.map(([value, label]) => `<option value="${value}" ${value === (save.data.aquarium.decor?.[key] || config.default) ? 'selected' : ''}>${label} - ${save.getAquariumStyleCost(key, value) ? '💎 ' + save.getAquariumStyleCost(key, value) : 'Owned'}</option>`).join('')}</select><button class="btn btn-secondary btn-sm" data-buy-decor="${key}">Buy / Apply</button></label>`).join('')}</div>
        <p class="customize-note">Display fish, treasures, fossils, and relics. Displayed items use tank slots; only fish earn visitor tips. You have 💎 ${save.getGemBalance()} gems. Buy styles once with gems, then switch between owned styles for free.</p>
        </details>
        <div class="aquarium-inhabitants-section">
          <div class="inhabitants-header">
            <h4>Tank Inhabitants (${items.length} / ${capacity})</h4>
            <button class="btn btn-primary btn-sm" id="btn-assign-inhabitant-main" ${items.length >= capacity ? 'disabled title="Tank is at max capacity"' : ''}>
              ➕ Assign Catch from Tackle Box
            </button>
          </div>
          <div class="inhabitants-grid">
            ${inhabitantsCardsHtml}
          </div>
        </div>
      </div>
    `;

    document.getElementById('share-aquarium')?.addEventListener('click', () => shareAquarium(this));
    document.getElementById('visit-aquarium')?.addEventListener('click', () => {
      this.openModal('Visit Aquarium', '<input id="visit-host" placeholder="Paste aquarium link or captain ID" style="width:100%"><button class="btn btn-primary" id="visit-go">Visit</button>');
      document.getElementById('visit-go').onclick = () => {
        let host = document.getElementById('visit-host').value.trim();
        try { host = new URL(host).searchParams.get('aquarium') || host; } catch {}
        visitAquarium(this, host);
      };
    });
    this.startAquariumCanvas(items, theme);
    const styleShop = container.querySelector('.aquarium-style-shop');
    styleShop?.addEventListener('toggle', () => { this.aquariumDecorOpen = styleShop.open; });
    const updateStyleButtons = () => {
      container.querySelectorAll('[data-buy-decor]').forEach(button => {
        const key = button.dataset.buyDecor;
        const selected = container.querySelector(`[data-aquarium-decor="${key}"]`).value;
        const cost = save.getAquariumStyleCost(key, selected);
        const applied = selected === (save.data.aquarium.decor?.[key] || AQUARIUM_OPTIONS[key].default);
        button.textContent = applied ? 'Applied' : cost ? `Buy & apply - 💎 ${cost}` : 'Apply owned style';
        button.disabled = applied || cost > save.getGemBalance();
      });
    };
    container.querySelectorAll('[data-aquarium-decor]').forEach(select => select.addEventListener('change', updateStyleButtons));
    updateStyleButtons();
    document.querySelectorAll('[data-buy-decor]').forEach(button => button.addEventListener('click', async () => {
      const key = button.dataset.buyDecor;
      const value = document.querySelector(`[data-aquarium-decor="${key}"]`).value;
      if (!(await (save.gemShop ? save.gemShop.purchase('aquarium', { [key]: value }, () => save.setAquariumDecoration(key, value)) : save.setAquariumDecoration(key, value)))) this.showToast('Not enough gems for this aquarium style.');
      this.renderAquariumTab();
    }));

    // Event listeners
    document.getElementById('btn-collect-tips')?.addEventListener('click', () => {
      const tips = this.saveSystem.collectVisitorTips();
      if (tips > 0) {
        soundManager.playCoin();
        this.showToast(`🪙 Collected +$${tips.toLocaleString()} in visitor tips!`);
        this.renderAquariumTab();
      }
    });

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const newTheme = e.currentTarget.dataset.theme;
        if (!(await (save.gemShop ? save.gemShop.purchase('aquarium', { theme: newTheme }, () => save.setAquariumTheme(newTheme)) : save.setAquariumTheme(newTheme)))) { this.showToast('Not enough gems for this aquarium theme.'); return; }
        soundManager.playButtonClick();
        this.renderAquariumTab();
      });
    });

    document.getElementById('btn-aq-upgrade')?.addEventListener('click', () => {
      this.openShop();
    });

    document.getElementById('btn-assign-inhabitant-main')?.addEventListener('click', () => {
      this.openAssignToAquariumModal();
    });

    document.querySelectorAll('.btn-assign-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openAssignToAquariumModal();
      });
    });

    document.querySelectorAll('.btn-remove-inhabitant').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const itm = items.find(i => i.instanceId === id);
        this.saveSystem.removeItemFromAquarium(id);
        soundManager.playButtonClick();
        this.showToast(`🎒 Returned ${itm?.name || 'item'} to tackle box.`);
        this.renderAquariumTab();
      });
    });
  }

  startAquariumCanvas(items, theme = 'reef') {
    const canvas = document.getElementById('aquarium-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const aquariumFish = [];
    const aquariumRelics = [];
    const displayTreasures = new Map(items.map(item => {
      const config = TREASURE_ITEMS.find(treasure => treasure.id === item.id);
      return [item.instanceId, config && !config.isCrate ? new Treasure(config, 0, 0) : null];
    }));

    items.forEach((item) => {
      if (item.type === 'fish' || (!item.type && !item.isRelic)) {
        const fishEntity = specimen(item, 0, 0);
        if (!fishEntity) return;
        const species = fishEntity.species;
        fishEntity.scale = Math.min(1.4, Math.max(0.4, fishEntity.scale * .85));

        aquariumFish.push({
          item,
          entity: fishEntity,
          x: 60 + Math.random() * (canvas.width - 120),
          y: 40 + Math.random() * (canvas.height - 120),
          vx: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.9),
          vy: (Math.random() * 2 - 1) * 0.4,
          cruiseSpeed: 0.6 + Math.random() * 0.5,
          timer: Math.random() * 10,
          scale: Math.max(0.6, Math.min(1.8, item.scaleFactor || 1.0)),
          primaryColor: item.primaryColor || '#38bdf8',
          finColor: item.finColor || '#0284c7',
          isShiny: !!item.isShiny,
          crown: item.crown || null,
        });
      } else {
        aquariumRelics.push(item);
      }
    });

    const ripples = [];
    const foodPellets = [];
    const bubbles = [];

    for (let i = 0; i < 20; i++) {
      bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vy: 0.3 + Math.random() * 0.5,
        r: 1 + Math.random() * 2.5,
      });
    }

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * canvas.width / rect.width;
      const y = (e.clientY - rect.top) * canvas.height / rect.height;
      ripples.push({ x, y, r: 2, alpha: 1.0 });
      soundManager.playSplash();

      aquariumFish.forEach((f) => {
        const dx = f.x - x;
        const dy = f.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          f.vx = (dx / (dist || 1)) * 4.0;
          f.vy = (dy / (dist || 1)) * 2.5;
        }
      });
    });

    const feedBtn = document.getElementById('btn-feed-fish');
    if (feedBtn) {
      feedBtn.addEventListener('click', () => {
        if (!this.saveSystem.feedAquarium()) { this.showToast('You need $1 to feed the fish.'); return; }
        for (let i = 0; i < 7; i++) {
          foodPellets.push({
            x: 60 + Math.random() * (canvas.width - 120),
            y: 10,
            vy: 0.7 + Math.random() * 0.5,
          });
        }
        soundManager.playButtonClick();
      });
    }

    let aqRaf = null;
    let decorTime = 0;
    let previousFrame = performance.now();
    const renderAq = () => {
      if (document.getElementById('aquarium-canvas') !== canvas) {
        cancelAnimationFrame(aqRaf);
        return;
      }

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      let floorColor1 = '#fde047';
      let floorColor2 = '#eab308';

      if (theme === 'abyss') {
        grad.addColorStop(0, '#030712');
        grad.addColorStop(1, '#0f172a');
        floorColor1 = '#1e293b';
        floorColor2 = '#334155';
      } else if (theme === 'atlantis') {
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(1, '#022c22');
        floorColor1 = '#047857';
        floorColor2 = '#065f46';
      } else if (theme === 'nebula') {
        grad.addColorStop(0, '#3b0764');
        grad.addColorStop(1, '#1e1b4b');
        floorColor1 = '#701a75';
        floorColor2 = '#4a044e';
      } else {
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(1, '#0c4a6e');
        floorColor1 = '#fde047';
        floorColor2 = '#eab308';
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor Seabed
      ctx.fillStyle = floorColor1;
      ctx.fillRect(0, canvas.height - 35, canvas.width, 35);
      ctx.fillStyle = floorColor2;
      ctx.fillRect(0, canvas.height - 40, canvas.width, 5);

      const now = performance.now();
      const frameMs = Math.min(50, now - previousFrame); previousFrame = now;
      decorTime += frameMs / 1000;
      const decor = normalizeCustomization(AQUARIUM_OPTIONS, this.saveSystem.data.aquarium.decor);
      drawAquariumDecor(ctx, canvas.width, canvas.height, decor, decorTime);

      // Ambient bubbles
      ctx.fillStyle = theme === 'abyss' ? 'rgba(56, 189, 248, 0.4)' : theme === 'nebula' ? 'rgba(232, 121, 249, 0.4)' : 'rgba(255, 255, 255, 0.3)';
      bubbles.slice(0, decor.bubbles === 'off' ? 0 : decor.bubbles === 'gentle' ? 7 : 20).forEach((b) => {
        b.y -= b.vy;
        if (b.y < 0) {
          b.y = canvas.height - 40;
          b.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Relics on pedestals
      const relicSpacing = canvas.width / (aquariumRelics.length + 1);
      aquariumRelics.forEach((relic, idx) => {
        const rx = relicSpacing * (idx + 1);
        const ry = canvas.height - 45;

        ctx.fillStyle = '#475569';
        ctx.fillRect(rx - 22, ry + 10, 44, 12);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(rx - 18, ry + 4, 36, 6);

        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(relic.icon || '🏺', rx, ry - 6);

        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(relic.name.substring(0, 14), rx, ry + 28);
      });

      // Food pellets
      for (let i = foodPellets.length - 1; i >= 0; i--) {
        const fp = foodPellets[i];
        fp.y += fp.vy;
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        if (fp.y >= canvas.height - 40) {
          foodPellets.splice(i, 1);
        }
      }

      // The aquarium and ocean share Fish.update/render, including species paths.
      aquariumFish.forEach(f => {
        const entity = f.entity;
        if (!entity._inTank) {
          entity.x = f.x; entity.y = f.y; entity.minY = 35; entity.maxY = canvas.height - 65;
          entity._inTank = true;
        }
        if (foodPellets.length) {
          const food = foodPellets[0];
          entity.direction = food.x > entity.x ? 1 : -1;
          if (Math.hypot(food.x - entity.x, food.y - entity.y) < 20) foodPellets.shift();
        }
        entity.update(frameMs, canvas.width, null);
        entity.render(ctx, 0);
        f.x = entity.x; f.y = entity.y;
      });

      // Ripples
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

  openAssignToAquariumModal() {
    this.activeModal = 'assignAquarium';
    const inv = this.saveSystem.getInventory();
    const save = this.saveSystem;
    const eligible = inv.filter((item) => {
      const isEligibleType = !item.isCrate && ['fish', 'relic', 'trinket', 'treasure', 'fossil'].includes(item.type);
      return isEligibleType && !save.isItemInAquarium(item.instanceId);
    });

    let listHtml = '';
    if (eligible.length === 0) {
      listHtml = `
        <div style="text-align: center; padding: 40px; color: #94a3b8;">
          <p style="font-size: 3rem;">🪹</p>
          <h4>No Available Catches Found</h4>
          <p>All eligible fish, treasures, fossils, and relics in your tackle box are already in the tank, or you haven't caught any yet.</p>
        </div>
      `;
    } else {
      listHtml = '<div class="assign-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; max-height: 420px; overflow-y: auto; padding: 4px;">';
      eligible.forEach((item) => {
        const isFish = item.type === 'fish';
        const isRelic = item.type === 'relic' || item.isRelic;
        const shinyTag = item.isShiny ? '✨' : '';
        const crownTag = item.crown === 'gold' ? '👑' : item.crown === 'silver' ? '🥈' : '';
        const rarityBadge = `<span class="rarity-tag rarity-${item.rarity}">${item.isGodTier ? 'GOD TIER' : item.rarity.toUpperCase()}</span>`;

        listHtml += `
          <div class="inventory-card rarity-border-${item.rarity}" style="padding: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 1.8rem; color: ${item.primaryColor || '#38bdf8'};">${item.icon || (isRelic ? '🏺' : '🐟')}</span>
              <div style="flex: 1; overflow: hidden;">
                <div style="font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${shinyTag} ${crownTag} ${item.name}
                </div>
                <div>${rarityBadge}</div>
              </div>
            </div>
            <div style="font-size: 0.78rem; color: #94a3b8; margin-bottom: 8px;">
              ${isFish ? `${item.size}cm • ${item.weight}kg` : isRelic ? `Relic (${item.era || 'Ancient'})` : ''}
            </div>
            <button class="btn btn-buy btn-sm btn-slot-item" data-id="${item.instanceId}" style="width: 100%;">
              ➕ Move into Tank
            </button>
          </div>
        `;
      });
      listHtml += '</div>';
    }

    const modalBody = `
      <div class="assign-aquarium-container">
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 12px;">
          Select a fish or archaeological relic from your tackle box to place into your Personal Marine Sanctuary.
        </p>
        ${listHtml}
        <div style="margin-top: 14px; text-align: right;">
          <button class="btn btn-secondary" id="btn-assign-back">Back to Aquarium</button>
        </div>
      </div>
    `;

    this.openModal('➕ Assign Catch to Aquarium', modalBody);

    document.querySelectorAll('.btn-slot-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const res = this.saveSystem.moveItemToAquarium(id);
        if (res.success) {
          soundManager.playUpgrade();
          this.showToast(`🐠 Added ${res.item?.name || 'catch'} to your aquarium!`);
          this.openJournalLogbook('journal', 'aquarium');
        } else {
          this.showToast(`⚠️ Could not add to aquarium: ${res.reason}`);
        }
      });
    });

    document.getElementById('btn-assign-back')?.addEventListener('click', () => {
      this.openJournalLogbook('journal', 'aquarium');
    });
  }

  openInventory(filter = 'all') {
    this.activeModal = 'inventory';
    const inv = this.saveSystem.getInventory();
    const save = this.saveSystem;
    const rodTier = UPGRADE_DEFINITIONS.fishingRod.tiers[save.getUpgradeLevel('fishingRod')] || UPGRADE_DEFINITIONS.fishingRod.tiers[0];
    const sellMultiplier = 1 + rodTier.sellBonus;

    const fishCount = inv.filter(i => i.type === 'fish').length;
    const crateCount = inv.filter(i => (i.isCrate || i.category === 'crate') && !i.unboxed).length;
    const fossilCount = inv.filter(i => i.type === 'fossil' || i.category === 'fossil').length;
    const relicCount = inv.filter(i => i.type === 'relic' || i.isRelic).length;
    const tankCount = inv.filter(i => save.isItemInAquarium(i.instanceId)).length;
    const lockedCount = inv.filter(i => i.isLocked).length;

    const sellableItems = inv.filter(i => !i.isLocked && !(i.isCrate && !i.unboxed) && !save.isItemInAquarium(i.instanceId));
    const totalSellableValue = sellableItems.reduce((acc, f) => acc + Math.max(1, Math.round(f.value * sellMultiplier)), 0);

    let filteredItems = inv;
    if (filter === 'fish') {
      filteredItems = inv.filter(i => i.type === 'fish');
    } else if (filter === 'crates') {
      filteredItems = inv.filter(i => (i.isCrate || i.category === 'crate') && !i.unboxed);
    } else if (filter === 'fossils') {
      filteredItems = inv.filter(i => i.type === 'fossil' || i.category === 'fossil');
    } else if (filter === 'relics') {
      filteredItems = inv.filter(i => i.type === 'relic' || i.isRelic);
    } else if (filter === 'aquarium') {
      filteredItems = inv.filter(i => save.isItemInAquarium(i.instanceId));
    } else if (filter === 'locked') {
      filteredItems = inv.filter(i => i.isLocked);
    }

    const hasAq = save.hasAquarium();
    const aqCap = save.getAquariumCapacity();

    let itemsGridHtml = '';
    if (filteredItems.length === 0) {
      itemsGridHtml = `
        <div class="empty-inventory-state">
          <p style="font-size:3rem;">🎒</p>
          <h4>No Items Found in this Category</h4>
          <p>Cast your line into the deep ocean or harvest seabed traps to collect fish, fossils, and relics!</p>
        </div>
      `;
    } else {
      itemsGridHtml = '<div class="inventory-grid">';
      filteredItems.forEach((item) => {
        const isFish = item.type === 'fish';
        const isRelic = item.type === 'relic' || item.isRelic;
        const isFossil = item.type === 'fossil' || item.category === 'fossil';
        const inTank = save.isItemInAquarium(item.instanceId);
        const isLocked = !!item.isLocked;
        const itemVal = Math.max(1, Math.round(item.value * sellMultiplier));

        const shinyTag = item.isShiny ? `<span class="shiny-tag">✨ SHINY</span>` : '';
        const mythicTag = item.isMythic ? `<span class="mythic-tag">🌟 MYTHIC</span>` : '';
        const crownTag = item.crown === 'gold'
          ? `<span class="crown-tag">${item.rarity === 'legendary' ? '👑' : '◇'} GIANT</span>`
          : item.crown === 'silver'
          ? `<span class="crown-tag crown-silver">🥈 SILVER</span>`
          : '';
        const rarityBadge = `<span class="rarity-tag rarity-${item.rarity}">${item.isGodTier ? 'GOD TIER' : item.rarity.toUpperCase()}</span>`;

        itemsGridHtml += `
          <div class="inventory-card rarity-border-${item.rarity} ${isLocked ? 'item-locked-border' : ''}">
            <div class="inv-card-header">
              <div class="inv-card-icon ${isFish ? 'inv-card-icon-canvas' : ''}" style="color: ${item.primaryColor || '#38bdf8'}; font-size: 1.8rem;">
                ${isFish ? `<canvas id="inv-fish-canvas-${item.instanceId}" width="64" height="48" class="inv-specimen-canvas" aria-label="${item.name}"></canvas>` : (item.icon || (isRelic ? '🏺' : isFossil ? '🦴' : '🐟'))}
              </div>
              <div class="inv-card-title-col">
                <div class="inv-card-name">${item.name}</div>
                <div class="inv-card-tags">${rarityBadge} ${shinyTag} ${mythicTag} ${crownTag}</div>
              </div>
              <button class="btn-icon-lock btn-toggle-lock" data-id="${item.instanceId}" title="${isLocked ? 'Unlock item' : 'Lock item (protects from selling)'}">
                ${isLocked ? '🔒' : '🔓'}
              </button>
            </div>

            <div class="inv-card-specs">
              ${isFish ? `<span>📏 <strong>${item.size || 0} cm</strong></span> <span>⚖️ <strong>${item.weight || 0} kg</strong></span>` : ''}
              ${isRelic ? `<span>🏺 ${item.era || 'Ancient'} Era • ${item.restored ? '✨ Restored' : '🪥 Needs Cleaning'}</span>` : ''}
              ${isFossil ? `<span>🏛️ Prehistoric Specimen</span>` : ''}
            </div>

            <div class="inv-card-status-row">
              ${inTank ? `<span class="badge-tank">🐠 IN AQUARIUM</span>` : ''}
              ${isLocked ? `<span class="badge-lock">🔒 PROTECTED</span>` : ''}
              <div class="inv-card-price">Market Value: <strong>🪙 $${itemVal.toLocaleString()}</strong></div>
            </div>

            <div class="inv-card-actions">
              ${item.isCrate && !item.unboxed ? `<button class="btn btn-sm btn-primary btn-inv-open-crate" data-id="${item.instanceId}">Open Crate</button>` : ''}
              <button class="btn btn-sm btn-outline btn-inspect-item" data-id="${item.instanceId}" title="Inspect details, lore, and records">🔍 Inspect</button>

              ${inTank ? `
                <button class="btn btn-sm btn-secondary btn-tank-remove" data-id="${item.instanceId}" title="Remove from personal aquarium back to tackle box"><svg viewBox="0 0 24 24" style="width:13px;height:13px;vertical-align:middle;margin-right:3px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>Return</button>
              ` : (!item.isCrate && ['fish', 'relic', 'trinket', 'treasure', 'fossil'].includes(item.type)) ? `
                ${hasAq ? `
                  <button class="btn btn-sm btn-outline btn-tank-add" data-id="${item.instanceId}" ${tankCount >= aqCap ? 'disabled title="Aquarium is at max capacity"' : 'title="Place in personal aquarium"'}>🐠 To Tank</button>
                ` : `
                  <button class="btn btn-sm btn-disabled" disabled title="Personal Aquarium not owned. Unlock in Tackle Shop.">🔒 No Tank</button>
                `}
              ` : ''}

              <button class="btn btn-sm ${isLocked || inTank ? 'btn-disabled' : 'btn-buy'} btn-sell-single" data-id="${item.instanceId}" data-val="${itemVal}"
                ${isLocked ? 'disabled title="Unlock item before selling"' : inTank ? 'disabled title="Remove from aquarium before selling"' : 'title="Sell single item"'}
              >
                🪙 Sell
              </button>
            </div>
          </div>
        `;
      });
      itemsGridHtml += '</div>';
    }

    const invCap = save.getInventoryCapacity();

    const modalBody = `
      <div class="inventory-container">
        <!-- Top Stats Banner -->
        <div class="inventory-header-stats">
          <div class="inv-stat-box">
            <span class="stat-label">Tackle Box Cap</span>
            <span class="stat-value" style="color: ${inv.length >= invCap ? '#ef4444' : '#38bdf8'}; font-weight: 700;">${inv.length} / ${invCap}</span>
          </div>
          <div class="inv-stat-box">
            <span class="stat-label">Fish</span>
            <span class="stat-value">${fishCount}</span>
          </div>
          <div class="inv-stat-box">
            <span class="stat-label">In Aquarium</span>
            <span class="stat-value">${tankCount} ${hasAq ? `/ ${aqCap}` : '(No Tank)'}</span>
          </div>
          <div class="inv-stat-box">
            <span class="stat-label">Locked</span>
            <span class="stat-value">🔒 ${lockedCount}</span>
          </div>
          <div class="inv-stat-box">
            <span class="stat-label">Unlocked Sell Value</span>
            <span class="stat-value" style="color: #facc15;">🪙 $${totalSellableValue.toLocaleString()}</span>
          </div>
        </div>

        <!-- Controls & Bulk Action Bar -->
        <div class="inventory-controls-bar">
          <div class="inv-tabs">
            <button class="tab-btn ${filter === 'all' ? 'active' : ''}" data-filter="all"><span class="inv-filter-art">${INV_FILTER_ART.all}</span><span class="inv-filter-txt">All</span><span class="inv-filter-pill">${inv.length}</span></button>
            <button class="tab-btn ${filter === 'crates' ? 'active' : ''}" data-filter="crates"><span class="inv-filter-art">${INV_FILTER_ART.crates}</span><span class="inv-filter-txt">Crates</span><span class="inv-filter-pill">${crateCount}</span></button>
            <button class="tab-btn ${filter === 'fish' ? 'active' : ''}" data-filter="fish"><span class="inv-filter-art">${INV_FILTER_ART.fish}</span><span class="inv-filter-txt">Fish</span><span class="inv-filter-pill">${fishCount}</span></button>
            <button class="tab-btn ${filter === 'relics' ? 'active' : ''}" data-filter="relics"><span class="inv-filter-art">${INV_FILTER_ART.relics}</span><span class="inv-filter-txt">Relics</span><span class="inv-filter-pill">${relicCount}</span></button>
            <button class="tab-btn ${filter === 'fossils' ? 'active' : ''}" data-filter="fossils"><span class="inv-filter-art">${INV_FILTER_ART.fossils}</span><span class="inv-filter-txt">Fossils</span><span class="inv-filter-pill">${fossilCount}</span></button>
            <button class="tab-btn ${filter === 'aquarium' ? 'active' : ''}" data-filter="aquarium"><span class="inv-filter-art">${INV_FILTER_ART.aquarium}</span><span class="inv-filter-txt">In Tank</span><span class="inv-filter-pill">${tankCount}</span></button>
            <button class="tab-btn ${filter === 'locked' ? 'active' : ''}" data-filter="locked"><span class="inv-filter-art">${INV_FILTER_ART.locked}</span><span class="inv-filter-txt">Locked</span><span class="inv-filter-pill">${lockedCount}</span></button>
          </div>
          <div class="inv-top-actions">
            <button class="btn ${sellableItems.length > 0 ? 'btn-buy' : 'btn-disabled'} btn-bulk-sell" id="btn-inv-bulk-sell" ${sellableItems.length > 0 ? '' : 'disabled'}>
              🪙 Sell All (${sellableItems.length} • +$${totalSellableValue.toLocaleString()})
            </button>
            ${hasAq ? `
              <button class="btn btn-secondary" id="btn-inv-visit-aquarium">🐠 Visit Aquarium</button>
            ` : ''}
          </div>
        </div>

        ${itemsGridHtml}
      </div>
    `;

    this.openModal("🎒 Inventory", modalBody);

    // Render authentic specimen fish images on inventory cards
    filteredItems.forEach((item) => {
      if (item.type === 'fish' || item.species) {
        const canvas = document.getElementById(`inv-fish-canvas-${item.instanceId}`);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fish = specimen(item, canvas.width / 2, canvas.height / 2);
        if (fish) {
          fish.scale = 1.05;
          fish.direction = 1;
          fish.render(ctx, 0);
        }
      }
    });

    if (filter === 'crates') {
      const body = document.getElementById('modal-content');
      const storeSection = document.createElement('div');
      storeSection.className = 'crates-tab-store-header';
      storeSection.innerHTML = `
        <div class="crates-store-banner">
          <div class="crates-banner-info">
            <span class="crates-banner-icon">🎁</span>
            <div>
              <h4 style="margin:0 0 4px 0; color:#f8fafc; font-size:1.05rem;">Deepsea Mystery Supply Crates</h4>
              <p style="margin:0; font-size:0.82rem; color:#94a3b8;">Dredge up valuable gold, high-grade tackle, rare curios, or ancient fossils!</p>
            </div>
          </div>
          <div class="crates-gem-pill">
            <span>💎 Your Gems:</span>
            <strong style="color:#67e8f9; font-size:1.05rem;">${(this.saveSystem.data.gems || 0).toLocaleString()}</strong>
          </div>
        </div>
      `;
      const shop = document.createElement('div');
      shop.className = 'crate-purchase-grid';
      CRATE_RANKS.forEach(crate => {
        const button = document.createElement('button');
        button.className = 'btn btn-secondary crate-store-buy-btn';
        button.innerHTML = `
          <div class="crate-btn-icon">${crate.icon || '📦'}</div>
          <div class="crate-btn-meta">
            <span class="crate-btn-name">${crate.name}</span>
            <span class="crate-btn-price">💎 ${CRATE_GEM_PRICES[crate.rank]} Gems</span>
          </div>
        `;
        button.onclick = async () => { button.disabled = true; if (await premiumPurchase(this, { kind: 'crate', rank: crate.rank })) this.openInventory('crates'); else button.disabled = false; };
        shop.appendChild(button);
      });
      storeSection.appendChild(shop);
      body?.prepend(storeSection);
    }
    document.querySelectorAll('.btn-inv-open-crate').forEach(button => {
      button.addEventListener('click', () => {
        const crate = this.saveSystem.getInventory().find(item => item.instanceId === button.dataset.id);
        if (crate && !crate.unboxed) this.openCratesModal([crate], null, null);
      });
    });
    document.querySelectorAll('.inv-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.openInventory(e.currentTarget.dataset.filter);
      });
    });

    document.getElementById('btn-inv-bulk-sell')?.addEventListener('click', () => {
      this.openBulkSellConfirm(sellableItems, totalSellableValue, sellMultiplier, filter);
    });

    document.getElementById('btn-inv-visit-aquarium')?.addEventListener('click', () => {
      this.openAquariumModal();
    });

    document.querySelectorAll('.btn-toggle-lock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.saveSystem.toggleItemLock(id);
        soundManager.playButtonClick();
        this.openInventory(filter);
      });
    });

    document.querySelectorAll('.btn-inspect-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.openInspectItemModal(id, filter);
      });
    });

    document.querySelectorAll('.btn-tank-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const res = this.saveSystem.moveItemToAquarium(id);
        if (res.success) {
          soundManager.playUpgrade();
          this.showToast('🐠 Placed catch into your personal aquarium!');
          this.openInventory(filter);
        } else {
          this.showToast(`⚠️ Could not add to aquarium: ${res.reason}`);
        }
      });
    });

    document.querySelectorAll('.btn-tank-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.saveSystem.removeItemFromAquarium(id);
        soundManager.playButtonClick();
        this.showToast('🎒 Returned to tackle box.');
        this.openInventory(filter);
      });
    });

    document.querySelectorAll('.btn-sell-single').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const res = this.saveSystem.sellInventoryItem(id, sellMultiplier);
        if (res) {
          soundManager.playCoin();
          this.showToast(`🪙 Sold ${res.item.name} for +$${res.gold.toLocaleString()}!`, { dismissOnFishing: true });
          this.showToast(`🪙 Sold ${res.item.name} for +$${res.gold.toLocaleString()}!`);
          this.openInventory(filter);
        }
      });
    });
  }

  openBulkSellConfirm(sellableItems, totalPayout, sellMultiplier, returnFilter = 'all') {
    this.activeModal = 'bulkSellConfirm';
    const modalBody = `
      <div class="confirm-bulk-sell-modal" style="text-align: center; padding: 20px 10px;">
        <div style="font-size: 3.5rem; margin-bottom: 12px;">🪙</div>
        <h3 style="font-size: 1.5rem; color: #f8fafc; margin-bottom: 10px;">Confirm Bulk Sale</h3>
        <p style="font-size: 1.05rem; color: #cbd5e1; max-width: 480px; margin: 0 auto 16px;">
          Sell <strong>${sellableItems.length} items</strong> from your inventory for a total of <strong style="color: #facc15; font-size: 1.25rem;">+$${totalPayout.toLocaleString()}</strong>?
        </p>
        <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 12px; max-width: 480px; margin: 0 auto 20px; font-size: 0.85rem; color: #94a3b8; text-align: left;">
          🛡️ <strong>Safety Protection Active:</strong>
          <ul style="margin: 6px 0 0 16px; padding: 0;">
            <li>Favorited and locked items (🔒) will <strong>NOT</strong> be sold.</li>
            <li>Specimens currently swimming in your aquarium (🐠) are protected and will <strong>NOT</strong> be sold.</li>
          </ul>
        </div>
        <div style="display: flex; justify-content: center; gap: 12px;">
          <button class="btn btn-buy btn-lg" id="btn-confirm-bulk-sale">🪙 Sell All (+$${totalPayout.toLocaleString()})</button>
          <button class="btn btn-secondary btn-lg" id="btn-cancel-bulk-sale">Cancel & Return</button>
        </div>
      </div>
    `;

    this.openModal('Confirm Bulk Sale', modalBody);

    document.getElementById('btn-confirm-bulk-sale')?.addEventListener('click', () => {
      const result = this.saveSystem.sellAllItems(sellMultiplier);
      soundManager.playCoin();
      this.showToast(`🪙 Sold ${result.count} items for +$${result.totalGold.toLocaleString()}!`, { dismissOnFishing: true });
      this.showToast(`🪙 Sold ${result.count} items for +$${result.totalGold.toLocaleString()}!`);
      this.openInventory(returnFilter);
    });

    document.getElementById('btn-cancel-bulk-sale')?.addEventListener('click', () => {
      this.openInventory(returnFilter);
    });
  }

  openInspectItemModal(instanceId, returnFilter = 'all') {
    this.activeModal = 'inspectItem';
    const inv = this.saveSystem.getInventory();
    const item = inv.find((i) => i.instanceId === instanceId);
    if (!item) {
      this.openInventory(returnFilter);
      return;
    }

    const save = this.saveSystem;
    const rodTier = UPGRADE_DEFINITIONS.fishingRod.tiers[save.getUpgradeLevel('fishingRod')] || UPGRADE_DEFINITIONS.fishingRod.tiers[0];
    const sellMultiplier = 1 + rodTier.sellBonus;
    const itemVal = Math.max(1, Math.round(item.value * sellMultiplier));

    const isFish = item.type === 'fish';
    const isRelic = item.type === 'relic' || item.isRelic;
    const isFossil = item.type === 'fossil' || item.category === 'fossil';
    const inTank = save.isItemInAquarium(item.instanceId);
    const isLocked = !!item.isLocked;
    const hasAq = save.hasAquarium();
    const tankFull = save.getAquariumItems().length >= save.getAquariumCapacity();

    const shinyTag = item.isShiny ? `<span class="shiny-tag">✨ SHINY</span>` : '';
    const mythicTag = item.isMythic ? `<span class="mythic-tag">🌟 MYTHIC</span>` : '';
    const crownTag = item.crown === 'gold'
      ? `<span class="crown-tag">${item.rarity === 'legendary' ? '👑' : '◇'} GIANT</span>`
      : item.crown === 'silver'
      ? `<span class="crown-tag crown-silver">🥈 SILVER CROWN</span>`
      : '';
    const rarityBadge = `<span class="rarity-tag rarity-${item.rarity}">${item.isGodTier ? 'GOD TIER' : item.rarity.toUpperCase()}</span>`;

    const modalBody = `
      <div class="inspect-item-container">
        <div class="inspect-item-hero rarity-border-${item.rarity}">
          <div class="inspect-item-icon" style="color: ${item.primaryColor || '#38bdf8'}; font-size: 4rem;">
            ${item.icon || (isRelic ? '🏺' : isFossil ? '🦴' : '🐟')}
          </div>
          <div class="inspect-item-titles">
            <h2>${item.name}</h2>
            <div class="inspect-item-tags">${rarityBadge} ${shinyTag} ${mythicTag} ${crownTag}</div>
          </div>
        </div>

        <div class="inspect-item-body">
          ${item.lore ? `<p class="inspect-item-lore">${item.lore}</p>` : ''}

          <div class="inspect-specs-grid">
            ${isFish ? `
              <div class="inspect-spec"><span class="lbl">Length</span><strong>${item.size || 0} cm</strong></div>
              <div class="inspect-spec"><span class="lbl">Weight</span><strong>${item.weight || 0} kg</strong></div>
              <div class="inspect-spec"><span class="lbl">Trophy Rank</span><strong>${item.crown ? `${item.crown.toUpperCase()} CROWN` : 'Standard'}</strong></div>
            ` : ''}
            ${isRelic ? `
              <div class="inspect-spec"><span class="lbl">Archaeological Era</span><strong>${item.era || 'Ancient'}</strong></div>
              <div class="inspect-spec"><span class="lbl">Condition</span><strong>${item.restored ? '✨ Restored' : '🪥 Dirty Relic'}</strong></div>
            ` : ''}
            <div class="inspect-spec"><span class="lbl">Date Landed</span><strong>${item.caughtAt ? new Date(item.caughtAt).toLocaleDateString() : 'Unknown'}</strong></div>
            <div class="inspect-spec"><span class="lbl">Base Market Value</span><strong>$${(item.value || 0).toLocaleString()}</strong></div>
            <div class="inspect-spec"><span class="lbl">With Rod Bonus</span><strong style="color:#facc15;">🪙 $${itemVal.toLocaleString()}</strong></div>
            <div class="inspect-spec"><span class="lbl">Storage Status</span><strong>${inTank ? '🐠 In Personal Aquarium' : '🎒 In Tackle Box'}</strong></div>
          </div>

          <div class="inspect-actions-row">
            ${(item.isCrate || item.category === 'crate') && !item.unboxed ? '<button class="btn btn-primary" id="btn-inspect-open-crate">Open Mystery Crate</button>' : ''}
            <button class="btn btn-secondary" id="btn-inspect-toggle-lock">${isLocked ? '🔓 Unlock Item' : '🔒 Lock Item'}</button>

            ${inTank ? `
              <button class="btn btn-warning" id="btn-inspect-tank"><svg viewBox="0 0 24 24" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>Return from Aquarium</button>
            ` : (!item.isCrate && ['fish', 'relic', 'trinket', 'treasure', 'fossil'].includes(item.type)) ? `
              ${hasAq ? `
                <button class="btn btn-primary" id="btn-inspect-tank" ${tankFull ? 'disabled title="Aquarium is full"' : ''}>🐠 Move to Aquarium</button>
              ` : `
                <button class="btn btn-disabled" disabled title="Unlock Personal Aquarium in Tackle Shop">🔒 Aquarium Locked</button>
              `}
            ` : ''}

            <button class="btn ${isLocked || inTank ? 'btn-disabled' : 'btn-buy'}" id="btn-inspect-sell" ${isLocked || inTank ? 'disabled' : ''}>
              🪙 Sell Item (+$${itemVal.toLocaleString()})
            </button>
            <button class="btn btn-secondary" id="btn-inspect-back">🔙 Back to Tackle Box</button>
          </div>
        </div>
      </div>
    `;

    this.openModal(`🔍 Inspecting Catch: ${item.name}`, modalBody);

    document.getElementById('btn-inspect-open-crate')?.addEventListener('click', () => this.openCratesModal([item], null, null));

    document.getElementById('btn-inspect-toggle-lock')?.addEventListener('click', () => {
      this.saveSystem.toggleItemLock(instanceId);
      this.openInspectItemModal(instanceId, returnFilter);
    });

    document.getElementById('btn-inspect-tank')?.addEventListener('click', () => {
      if (inTank) {
        this.saveSystem.removeItemFromAquarium(instanceId);
        this.showToast(`🎒 Returned ${item.name} to tackle box.`);
      } else {
        const res = this.saveSystem.moveItemToAquarium(instanceId);
        if (res.success) {
          this.showToast(`🐠 Placed ${item.name} in your personal aquarium!`);
        }
      }
      this.openInspectItemModal(instanceId, returnFilter);
    });

    document.getElementById('btn-inspect-sell')?.addEventListener('click', () => {
      const res = this.saveSystem.sellInventoryItem(instanceId, sellMultiplier);
      if (res) {
        soundManager.playCoin();
        this.showToast(`🪙 Sold ${res.item.name} for +$${res.gold.toLocaleString()}!`, { dismissOnFishing: true });
        this.openInventory(returnFilter);
      }
    });

    document.getElementById('btn-inspect-back')?.addEventListener('click', () => {
      this.openInventory(returnFilter);
    });
  }

  getLogbookHtml() {
    const save = this.saveSystem;

    const milestoneIds = [
      'cartographer_unknown',
      'friend_of_the_deep',
      'titan_tamer',
      'patience_of_the_tide',
    ];

    const milestones = ACHIEVEMENTS.filter((a) => milestoneIds.includes(a.id));
    const regularAchievements = ACHIEVEMENTS.filter((a) => !milestoneIds.includes(a.id));
    const stats = save.data.stats;

    let html = `
      <div class="trophy-room-container">
        <!-- Career Snapshot -->
        <div class="trophy-career-snapshot">
          <div class="stat-pill-box">
            <span class="stat-lbl">Angler Rank</span>
            <span class="stat-val">Lv. ${save.data.level}</span>
          </div>
          <div class="stat-pill-box">
            <span class="stat-lbl">Total Catches</span>
            <span class="stat-val">${stats.totalFishCaught}</span>
          </div>
          <div class="stat-pill-box">
            <span class="stat-lbl">Total Gold</span>
            <span class="stat-val">$${stats.totalGoldEarned.toLocaleString()}</span>
          </div>
          <div class="stat-pill-box">
            <span class="stat-lbl">Max Depth</span>
            <span class="stat-val">${stats.maxDepthReached}m</span>
          </div>
          <div class="stat-pill-box">
            <span class="stat-lbl">Mythic Titans</span>
            <span class="stat-val">🌟 ${stats.mythicsCaught || 0}</span>
          </div>
        </div>

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
              <span class="milestone-bounty">🪙 +$${ach.reward.toLocaleString()} · 💎 ${achievementGems(ach)}</span>
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
              <span class="ach-reward">🪙 +$${ach.reward.toLocaleString()} · 💎 ${achievementGems(ach)}</span>
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

    return html;
  }

  openAchievements() {
    this.openJournalLogbook('logbook');
  }

  customizationControls(options, values, prefix) {
    const selected = normalizeCustomization(options, values);
    return Object.entries(options).map(([key, config]) => `<label class="customize-field">${config.label}
      <select data-${prefix}="${key}" aria-label="${config.label}">${config.choices.map(([value, label]) => `<option value="${value}" ${selected[key] === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>`).join('');
  }

  openDailyLogin() {
    this.activeModal = 'daily';
    const save = this.saveSystem;
    const status = save.getDailyLoginStatus();
    const guest = accountManager.isGuest();
    const streak = save.data.dailyLogin.streak;
    const describe = reward => `${reward.gems} Gems${reward.xp ? ` + ${reward.xp} XP` : ''}${reward.crates.length ? ` + ${reward.crates.length} sealed crate${reward.crates.length > 1 ? 's' : ''}` : ''}`;
    this.openModal('Daily Check-in', `<div class="daily-rewards"><h3>${save.getGemBalance()} Gems</h3>
      <p>Different rewards each day. Every seventh day brings a celebration bundle; day 30 brings the monthly treasure haul.</p>
      <button class="btn btn-secondary" id="open-gem-store">Gem Store</button>
      <div class="daily-reward-grid">${DAILY_REWARDS.map(reward => `<div class="daily-reward-day ${reward.weekly || reward.monthly ? 'milestone' : ''} ${status.available && reward.day === status.nextStreak ? 'ready' : ''}"><span>${reward.monthly ? 'Monthly haul' : reward.weekly ? 'Weekly bundle' : 'Day ' + reward.day}</span><strong>${describe(reward)}</strong></div>`).join('')}</div>
      <p>${guest ? 'Sign in to claim check-in rewards.' : status.claimed ? `Claimed today. Streak: ${streak} days.` : describe(status)}</p>
      <button class="btn btn-primary" id="claim-daily-gems" ${status.available ? '' : 'disabled'}>${status.claimed ? 'Claimed today' : 'Claim rewards'}</button>
      ${(save.data.dailyLogin.pendingCrates || []).length ? `<p>${save.data.dailyLogin.pendingCrates.length} reward crates are waiting for inventory space.</p><button class="btn btn-secondary" id="collect-daily-crates">Collect waiting crates</button>` : ''}
      <p class="customize-note">Ordinary days also have an 8% chance of 200 bonus XP and a 3% chance of a sealed crate. Resets at 00:00 UTC. Missing a day restarts the 30-day streak.</p></div>`);
    document.getElementById('open-gem-store').onclick = () => save.gemShop?.open();
    document.getElementById('claim-daily-gems').onclick = () => {
      const gems = save.claimDailyLogin();
      if (gems) { this.showToast(`Check-in: ${describe(save.data.dailyLogin.lastReward)}`); accountManager.syncCloudSave(); }
      this.openDailyLogin();
    };
    document.getElementById('collect-daily-crates')?.addEventListener('click', () => {
      const count = save.collectDailyCrates(); this.showToast(count ? `${count} crates stored in your inventory.` : 'Free an inventory slot first.'); this.openDailyLogin();
    });
  }

  openAppearance() {
    this.activeModal = 'appearance';
    let draft = normalizeCustomization(ANGLER_OPTIONS, this.saveSystem.data.appearance);
    const look = normalizeCustomization(ANGLER_OPTIONS, this.saveSystem.data.appearance);
    const controls = Object.entries(ANGLER_OPTIONS).map(([key, config]) => `<fieldset class="appearance-group"><legend>${config.label} <span data-look-label="${key}"></span></legend><div class="appearance-choices">${config.choices.map(([value, label]) => `<button type="button" class="appearance-choice ${value.startsWith('#') ? 'appearance-swatch' : 'appearance-hat'}" data-look-key="${key}" data-look-value="${value}" title="${label}" aria-label="${label}" aria-pressed="${look[key] === value}" ${value.startsWith('#') ? `style="--swatch:${value}"` : ''}>${value.startsWith('#') ? '<span class="swatch-check" aria-hidden="true">&#10003;</span>' : label}</button>`).join('')}</div></fieldset>`).join('');
    this.openModal('Your Angler', `<div class="appearance-studio">
      <div class="appearance-preview-panel"><canvas id="angler-preview" width="340" height="300" aria-label="Live preview of your angler"></canvas><h3>Ready for the next cast</h3><p id="appearance-status" role="status">Choose a color or a hat to try it on.</p><div class="appearance-presets"><button class="btn btn-secondary btn-sm" data-outfit="classic">Classic</button><button class="btn btn-secondary btn-sm" data-outfit="coastal">Coastal</button><button class="btn btn-secondary btn-sm" data-outfit="sunset">Sunset</button></div></div>
      <div class="appearance-controls">${controls}<div class="appearance-actions"><button class="btn btn-secondary" id="appearance-random">Shuffle outfit</button><button class="btn btn-outline" id="appearance-reset">Reset look</button></div></div>
      <div class="appearance-footer"><span id="appearance-price"></span><button class="btn btn-secondary" id="appearance-goto-boat">⛵ Boat Studio</button><button class="btn btn-primary" id="appearance-buy">Wear this look</button><button class="btn btn-primary" id="appearance-back">Done</button></div></div>`);
    const preview = document.getElementById('angler-preview');
    const ctx = preview.getContext('2d');
    const redraw = () => {
      const current = draft;
      const cost = this.saveSystem.getAppearanceCost(draft);
      document.getElementById('appearance-price').textContent = `💎 ${this.saveSystem.getGemBalance()} gems available · Owned looks are free to reuse`;
      const buy = document.getElementById('appearance-buy');
      buy.textContent = cost ? `Buy & wear · 💎 ${cost}` : 'Wear owned look';
      buy.disabled = cost > this.saveSystem.getGemBalance();
      ctx.clearRect(0, 0, 340, 300);
      const sky = ctx.createLinearGradient(0, 0, 0, 300);
      sky.addColorStop(0, '#172b47'); sky.addColorStop(.55, '#467983'); sky.addColorStop(1, '#0e3d55');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, 340, 300);
      ctx.fillStyle = '#f9dfa7'; ctx.beginPath(); ctx.arc(265, 64, 23, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(186,230,253,.14)'; ctx.beginPath(); ctx.moveTo(20 + i % 2 * 30, 165 + i * 20); ctx.lineTo(300 - i % 3 * 30, 165 + i * 20); ctx.stroke(); }
      ctx.fillStyle = '#563e2c'; ctx.beginPath(); ctx.ellipse(170, 248, 115, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ad8859'; ctx.fillRect(65, 233, 210, 10);
      ctx.save(); ctx.translate(163, 237); ctx.scale(4.2, 4.2); drawAngler(ctx, current); ctx.restore();
      document.querySelectorAll('[data-look-key]').forEach(button => button.setAttribute('aria-pressed', String(current[button.dataset.lookKey] === button.dataset.lookValue)));
      Object.entries(ANGLER_OPTIONS).forEach(([key, config]) => {
        const price = this.saveSystem.getAppearanceCost({ ...this.saveSystem.data.appearance, [key]: current[key] });
        document.querySelector(`[data-look-label="${key}"]`).textContent = `${config.choices.find(([value]) => value === current[key])[1]} · ${price ? `💎 ${price}` : 'Owned'}`;
      });
    };
    const apply = changes => {
      draft = normalizeCustomization(ANGLER_OPTIONS, { ...draft, ...changes });
      redraw();
      document.getElementById('appearance-status').textContent = 'Preview only. Buy and wear when you are ready.';
    };
    document.querySelectorAll('[data-look-key]').forEach(button => button.addEventListener('click', () => apply({ [button.dataset.lookKey]: button.dataset.lookValue })));
    const outfits = { classic: { coat: '#eab308', hat: 'rainhat', hatColor: '#ca8a04' }, coastal: { coat: '#0d9488', hat: 'cap', hatColor: '#f8fafc' }, sunset: { coat: '#ef4444', hat: 'beanie', hatColor: '#0f172a' } };
    document.querySelectorAll('[data-outfit]').forEach(button => button.addEventListener('click', () => apply(outfits[button.dataset.outfit])));
    document.getElementById('appearance-random').addEventListener('click', () => apply(Object.fromEntries(['coat', 'hat', 'hatColor'].map(key => { const choices = ANGLER_OPTIONS[key].choices; return [key, choices[Math.floor(Math.random() * choices.length)][0]]; }))));
    document.getElementById('appearance-reset').addEventListener('click', () => apply(normalizeCustomization(ANGLER_OPTIONS)));
    document.getElementById('appearance-buy').addEventListener('click', async () => {
      const lookToBuy = { ...draft };
      const save = this.saveSystem;
      if (!(await (save.gemShop ? save.gemShop.purchase('angler', lookToBuy, () => save.purchaseAppearance(lookToBuy)) : save.purchaseAppearance(lookToBuy)))) return;
      if (this.activeModal !== 'appearance') return;
      redraw();
      document.getElementById('appearance-status').textContent = 'Look saved! These styles are now yours to reuse.';
    });
    document.getElementById('appearance-goto-boat')?.addEventListener('click', () => this.openBoatCustomization());
    document.getElementById('appearance-back').addEventListener('click', () => this.openSettings());
    redraw();
  }

  openBoatCustomization() {
    this.activeModal = 'boat_customization';
    const save = this.saveSystem;
    const vessel = save.data.upgrades?.vessel || 0;
    let selectedTrinket = save.data.boatTrinket || 'none';
    let selectedSkin = save.data.boatSkin || 'default';
    let animTimer = 0;
    let animFrame = null;

    const trinketCards = Object.values(BOAT_TRINKETS).map(t => {
      const isEquipped = (save.data.boatTrinket || 'none') === t.id;
      const isOwned = save.hasBoatTrinket(t.id);
      const isSelected = selectedTrinket === t.id;
      let badge = '';
      if (isEquipped) badge = '<span class="boat-badge boat-badge-equipped">Equipped</span>';
      else if (isOwned) badge = '<span class="boat-badge boat-badge-owned">Owned</span>';
      else badge = `<span class="boat-badge boat-badge-price">💎 ${t.cost}</span>`;

      return `
        <div class="boat-custom-card ${isSelected ? 'selected' : ''}" data-boat-type="trinket" data-boat-id="${t.id}" tabindex="0" role="button">
          <div class="boat-card-header">
            <span class="boat-card-icon">${t.icon}</span>
            <div class="boat-card-info">
              <strong class="boat-card-title">${t.label}</strong>
              ${badge}
            </div>
          </div>
          <p class="boat-card-desc">${t.desc}</p>
        </div>
      `;
    }).join('');

    const skinCards = Object.values(BOAT_SKIN_OPTIONS).map(s => {
      const isEquipped = (save.data.boatSkin || 'default') === s.id;
      const isOwned = save.hasBoatSkin(s.id);
      const isSelected = selectedSkin === s.id;
      let badge = '';
      if (isEquipped) badge = '<span class="boat-badge boat-badge-equipped">Equipped</span>';
      else if (isOwned) badge = '<span class="boat-badge boat-badge-owned">Owned</span>';
      else badge = `<span class="boat-badge boat-badge-price">💎 ${s.cost}</span>`;

      const swatchHtml = s.color
        ? `<span class="boat-color-dot" style="background:${s.color};"></span>`
        : `<span class="boat-color-dot" style="background:#854d0e;"></span>`;

      return `
        <div class="boat-custom-card ${isSelected ? 'selected' : ''}" data-boat-type="skin" data-boat-id="${s.id}" tabindex="0" role="button">
          <div class="boat-card-header">
            <span class="boat-card-icon">${swatchHtml}</span>
            <div class="boat-card-info">
              <strong class="boat-card-title">${s.label}</strong>
              ${badge}
            </div>
          </div>
          <p class="boat-card-desc">${s.desc}</p>
        </div>
      `;
    }).join('');

    const modalBody = `
      <div class="boat-customization-studio">
        <div class="boat-preview-pane">
          <div class="boat-canvas-wrap">
            <canvas id="boat-studio-canvas" width="460" height="230" aria-label="Boat customization live preview"></canvas>
          </div>
          <div class="boat-preview-summary">
            <div class="boat-stat-chip">
              <span class="stat-label">Vessel Rank</span>
              <strong class="stat-val">Tier ${vessel + 1}</strong>
            </div>
            <div class="boat-stat-chip">
              <span class="stat-label">Gem Reserve</span>
              <strong class="stat-val">💎 <span id="boat-gem-val">${save.getGemBalance()}</span></strong>
            </div>
          </div>
          <p id="boat-studio-status" class="boat-studio-status">Select a deck trinket or hull accent to preview it on your ship.</p>
        </div>

        <div class="boat-selector-pane">
          <div class="boat-tabs-bar">
            <button type="button" class="boat-tab-btn active" data-boat-tab="trinkets">Deck Trinkets (${Object.keys(BOAT_TRINKETS).length})</button>
            <button type="button" class="boat-tab-btn" data-boat-tab="skins">Hull Accents (${Object.keys(BOAT_SKIN_OPTIONS).length})</button>
          </div>

          <div id="boat-tab-trinkets" class="boat-tab-content active">
            <div class="boat-cards-grid">
              ${trinketCards}
            </div>
          </div>

          <div id="boat-tab-skins" class="boat-tab-content">
            <div class="boat-cards-grid">
              ${skinCards}
            </div>
          </div>

          <div class="boat-studio-footer">
            <div class="boat-footer-left">
              <span id="boat-cost-indicator" class="boat-cost-indicator">Owned · Free to equip</span>
            </div>
            <div class="boat-footer-actions">
              <button class="btn btn-secondary" id="btn-boat-goto-angler">👤 Angler Look</button>
              <button class="btn btn-primary" id="btn-boat-apply">Equip Trinket</button>
              <button class="btn btn-outline" id="btn-boat-done">Done</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.openModal('Custom Boat Yard ⛵', modalBody);

    const canvas = document.getElementById('boat-studio-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateControls = () => {
      // Update selected cards
      document.querySelectorAll('[data-boat-type="trinket"]').forEach(card => {
        const id = card.getAttribute('data-boat-id');
        card.classList.toggle('selected', id === selectedTrinket);
      });
      document.querySelectorAll('[data-boat-type="skin"]').forEach(card => {
        const id = card.getAttribute('data-boat-id');
        card.classList.toggle('selected', id === selectedSkin);
      });

      const gemEl = document.getElementById('boat-gem-val');
      if (gemEl) gemEl.textContent = save.getGemBalance();

      // Check current active tab to decide action button label & cost
      const activeTab = document.querySelector('.boat-tab-btn.active')?.getAttribute('data-boat-tab') || 'trinkets';
      const applyBtn = document.getElementById('btn-boat-apply');
      const costEl = document.getElementById('boat-cost-indicator');

      if (activeTab === 'trinkets') {
        const trk = BOAT_TRINKETS[selectedTrinket];
        const isEquipped = (save.data.boatTrinket || 'none') === selectedTrinket;
        const isOwned = save.hasBoatTrinket(selectedTrinket);
        const cost = save.getBoatTrinketCost(selectedTrinket);
        const canAfford = save.getGemBalance() >= cost;

        if (isEquipped) {
          if (applyBtn) { applyBtn.textContent = 'Already Equipped'; applyBtn.disabled = true; }
          if (costEl) costEl.textContent = '✨ Currently mounted on your ship';
        } else if (isOwned) {
          if (applyBtn) { applyBtn.textContent = 'Equip Trinket'; applyBtn.disabled = false; }
          if (costEl) costEl.textContent = 'Owned item · Free to mount';
        } else {
          if (applyBtn) {
            applyBtn.textContent = `Unlock & Mount · 💎 ${cost}`;
            applyBtn.disabled = !canAfford;
          }
          if (costEl) costEl.textContent = canAfford ? `Cost: 💎 ${cost} gems` : `Requires 💎 ${cost} gems (Need ${cost - save.getGemBalance()} more)`;
        }
      } else {
        const sk = BOAT_SKIN_OPTIONS[selectedSkin];
        const isEquipped = (save.data.boatSkin || 'default') === selectedSkin;
        const isOwned = save.hasBoatSkin(selectedSkin);
        const cost = save.getBoatSkinCost(selectedSkin);
        const canAfford = save.getGemBalance() >= cost;

        if (isEquipped) {
          if (applyBtn) { applyBtn.textContent = 'Already Applied'; applyBtn.disabled = true; }
          if (costEl) costEl.textContent = '✨ Active hull paint';
        } else if (isOwned) {
          if (applyBtn) { applyBtn.textContent = 'Apply Paint'; applyBtn.disabled = false; }
          if (costEl) costEl.textContent = 'Owned paint · Free to apply';
        } else {
          if (applyBtn) {
            applyBtn.textContent = `Unlock & Paint · 💎 ${cost}`;
            applyBtn.disabled = !canAfford;
          }
          if (costEl) costEl.textContent = canAfford ? `Cost: 💎 ${cost} gems` : `Requires 💎 ${cost} gems (Need ${cost - save.getGemBalance()} more)`;
        }
      }
    };

    const renderPreview = () => {
      if (this.activeModal !== 'boat_customization') {
        if (animFrame) cancelAnimationFrame(animFrame);
        return;
      }
      animTimer += 0.035;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0c1a2e');
      skyGrad.addColorStop(0.5, '#1e3a5f');
      skyGrad.addColorStop(0.72, '#2563eb');
      skyGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant stars / sparkle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let s = 0; s < 12; s++) {
        const sx = (s * 39 + 15) % w;
        const sy = (s * 19 + 12) % (h * 0.45);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Moon
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(w - 60, 48, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Animated Water waves
      const waterY = h * 0.68;
      ctx.fillStyle = 'rgba(14, 116, 144, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, waterY);
      for (let x = 0; x <= w; x += 20) {
        const y = waterY + Math.sin(x * 0.02 + animTimer * 2) * 5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Boat transform with bobbing
      const boatX = w * 0.50;
      const bobY = waterY - 14 + Math.sin(animTimer * 2) * 4;
      const boatAngle = Math.sin(animTimer * 1.5) * 0.04;

      ctx.save();
      ctx.translate(boatX, bobY);
      ctx.rotate(boatAngle);

      const bW = 120 + vessel * 12;
      const bH = 34 + vessel * 3;

      // Keel shadow
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(-bW * 0.42, bH * 0.55);
      ctx.quadraticCurveTo(0, bH * 0.88, bW * 0.44, bH * 0.48);
      ctx.lineTo(bW * 0.42, bH * 0.58);
      ctx.quadraticCurveTo(0, bH * 0.98, -bW * 0.4, bH * 0.68);
      ctx.closePath();
      ctx.fill();

      // Wooden hull
      ctx.fillStyle = vessel >= 1 ? '#78350f' : '#9a3412';
      ctx.beginPath();
      ctx.moveTo(-bW * 0.5, -8);
      ctx.lineTo(-bW * 0.42, bH * 0.6);
      ctx.quadraticCurveTo(0, bH * 0.8, bW * 0.44, bH * 0.5);
      ctx.lineTo(bW * 0.52, -8);
      ctx.closePath();
      ctx.fill();

      // Planking lines
      ctx.strokeStyle = '#431407';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-bW * 0.46, 0);
      ctx.quadraticCurveTo(0, 10, bW * 0.48, 0);
      ctx.moveTo(-bW * 0.44, 7);
      ctx.quadraticCurveTo(0, 17, bW * 0.46, 6);
      ctx.stroke();

      // Gunwale rim
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-bW * 0.5, -8);
      ctx.lineTo(bW * 0.52, -8);
      ctx.stroke();

      // Selected Skin Accent Line
      const activeSkin = BOAT_SKIN_OPTIONS[selectedSkin];
      if (activeSkin && activeSkin.color) {
        ctx.fillStyle = activeSkin.color;
        ctx.fillRect(-bW * 0.35, 3, bW * 0.7, 5);
      }

      // Wooden seat thwart
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-20, -13, 40, 6);

      // Angler sitting on boat
      ctx.save();
      ctx.translate(-2, -12);
      ctx.scale(1.2, 1.2);
      drawAngler(ctx, save.data.appearance || {});
      ctx.restore();

      // Selected Deck Trinket
      if (selectedTrinket && selectedTrinket !== 'none') {
        drawBoatTrinket(ctx, selectedTrinket, vessel, animTimer, bW, bH);
      }

      ctx.restore();

      // Front wave layer
      ctx.fillStyle = 'rgba(2, 132, 199, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, waterY + 6);
      for (let x = 0; x <= w; x += 18) {
        const y = waterY + 6 + Math.sin(x * 0.025 + animTimer * 2.5 + 1) * 4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      animFrame = requestAnimationFrame(renderPreview);
    };

    renderPreview();
    updateControls();

    // Tab switching
    document.querySelectorAll('.boat-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.boat-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.boat-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabKey = btn.getAttribute('data-boat-tab');
        const target = document.getElementById(`boat-tab-${tabKey}`);
        if (target) target.classList.add('active');
        updateControls();
      });
    });

    // Selecting Trinkets
    document.querySelectorAll('[data-boat-type="trinket"]').forEach(card => {
      card.addEventListener('click', () => {
        selectedTrinket = card.getAttribute('data-boat-id');
        const status = document.getElementById('boat-studio-status');
        const trk = BOAT_TRINKETS[selectedTrinket];
        if (status && trk) status.textContent = `Selected: ${trk.label} — ${trk.desc}`;
        updateControls();
      });
    });

    // Selecting Skins
    document.querySelectorAll('[data-boat-type="skin"]').forEach(card => {
      card.addEventListener('click', () => {
        selectedSkin = card.getAttribute('data-boat-id');
        const status = document.getElementById('boat-studio-status');
        const sk = BOAT_SKIN_OPTIONS[selectedSkin];
        if (status && sk) status.textContent = `Selected: ${sk.label} — ${sk.desc}`;
        updateControls();
      });
    });

    // Apply Button
    const applyBtn = document.getElementById('btn-boat-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', async () => {
        const activeTab = document.querySelector('.boat-tab-btn.active')?.getAttribute('data-boat-tab') || 'trinkets';
        if (activeTab === 'trinkets') {
          const isOwned = save.hasBoatTrinket(selectedTrinket);
          if (isOwned) {
            save.setBoatTrinket(selectedTrinket);
            this.showToast(`Mounted ${BOAT_TRINKETS[selectedTrinket].label} on deck! ⛵`);
          } else {
            const success = await (save.gemShop ? save.gemShop.purchase('boatTrinket', selectedTrinket, () => save.purchaseBoatTrinket(selectedTrinket)) : save.purchaseBoatTrinket(selectedTrinket));
            if (!success) {
              this.showToast('Not enough gems to unlock trinket!');
              return;
            }
            this.showToast(`Unlocked & mounted ${BOAT_TRINKETS[selectedTrinket].label}! 💎`);
          }
        } else {
          const isOwned = save.hasBoatSkin(selectedSkin);
          if (isOwned) {
            save.setBoatSkin(selectedSkin);
            this.showToast(`Applied ${BOAT_SKIN_OPTIONS[selectedSkin].label} hull paint! 🎨`);
          } else {
            const success = await (save.gemShop ? save.gemShop.purchase('boatSkin', selectedSkin, () => save.purchaseBoatSkin(selectedSkin)) : save.purchaseBoatSkin(selectedSkin));
            if (!success) {
              this.showToast('Not enough gems to unlock hull paint!');
              return;
            }
            this.showToast(`Unlocked & applied ${BOAT_SKIN_OPTIONS[selectedSkin].label}! 💎`);
          }
        }
        // Re-render modal to refresh badges & costs
        if (this.activeModal === 'boat_customization') {
          this.openBoatCustomization();
        }
      });
    }

    // Done button
    document.getElementById('btn-boat-done')?.addEventListener('click', () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      this.openSettings();
    });

    // Go to Angler Look button
    document.getElementById('btn-boat-goto-angler')?.addEventListener('click', () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      this.openAppearance();
    });
  }

  openSettings() {
    this.activeModal = 'settings';
    const stats = this.saveSystem.data.stats;
    const settings = this.saveSystem.data.settings;

    const modalBody = `
      <div class="settings-wrapper">
        <div class="settings-section">
          <h3><span class="settings-sec-icon">${SETTINGS_ART.cloudSave}</span> Captain Save</h3>
          <p id="cloud-save-status">${escapeScoreboardText(accountManager.isGuest() ? 'Guest progress is saved on this browser.' : accountManager.cloudStatus)}</p>
          <button class="btn btn-secondary" id="btn-cloud-save" ${accountManager.cloudSession ? '' : 'disabled'}>Save to cloud now</button>
          <p class="customize-note">For an older local account, sign in once on the original laptop to migrate your progress.</p>
        </div>

        <div class="settings-section">
          <h3><span class="settings-sec-icon">${SETTINGS_ART.angler}</span> Vessel & Angler Customization</h3>
          <p>Customize your boat hull accents & deck trinkets, or change your angler colors, coat style, and headwear.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
            <button class="btn btn-primary" id="btn-customize-boat">⛵ Customize Boat & Trinkets</button>
            <button class="btn btn-secondary" id="btn-customize-angler">👤 Customize Angler</button>
          </div>
        </div>

        <div class="settings-section career-section">
          <h3><span class="settings-sec-icon">${SETTINGS_ART.trophyRecords}</span> Career Records</h3>
          <div class="career-grid">
            ${[
              [SETTINGS_ART.level, 'Angler Level', `Lv. ${this.saveSystem.data.level}`],
              [SETTINGS_ART.fishCount, 'Fish Caught', stats.totalFishCaught.toLocaleString()],
              [SETTINGS_ART.depth, 'Max Depth', `${stats.maxDepthReached}m`],
              [SETTINGS_ART.gold, 'Gold Earned', `$${stats.totalGoldEarned.toLocaleString()}`],
              [SETTINGS_ART.species, 'Species Found', `${stats.uniqueSpeciesCaught} / ${FISH_SPECIES.length + LEGENDARY_SPECIES.length}`],
              [SETTINGS_ART.fossil, 'Fossils', `${stats.totalFossilsCollected} / ${TREASURE_ITEMS.filter(item => item.category === 'fossil').length}`],
              [SETTINGS_ART.goldCrown, 'Gold Crowns', stats.goldCrowns || 0],
              [SETTINGS_ART.silverCrown, 'Silver Crowns', stats.silverCrowns || 0],
              [SETTINGS_ART.mythicTitan, 'Mythic Titans', stats.mythicsCaught || 0],
            ].map(([iconArt, label, value]) => `<div class="career-tile"><span class="career-icon">${iconArt}</span><strong>${value}</strong><small>${label}</small></div>`).join('')}
          </div>
          <div class="career-record">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="career-icon" style="width:20px;height:20px;display:inline-flex;">${SETTINGS_ART.biggestCatch}</span>
              <span>Biggest Catch: <strong>${escapeScoreboardText(stats.biggestCatchName || 'None yet')}</strong></span>
            </div>
            <span>${stats.biggestCatchCm} cm · ${stats.heaviestCatchKg} kg</span>
          </div>
        </div>

        <div class="settings-section">
          <h3><span class="settings-sec-icon">${SETTINGS_ART.preferences}</span> Fishing Preferences</h3>
          <div class="setting-item" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0;">
            <label for="setting-always-ask" style="font-size: 0.95rem; color: #cbd5e1; cursor: pointer;">
              Always ask on catch (show Keep / Sell modal):
            </label>
            <input type="checkbox" id="setting-always-ask" ${settings.alwaysAskOnCatch ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
          </div>
          <div class="setting-item" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); margin-top: 4px;">
            <label for="setting-hide-traps" style="font-size: 0.95rem; color: #cbd5e1; cursor: pointer;">
              Hide Seabed Traps & Buoys View on Water:
            </label>
            <input type="checkbox" id="setting-hide-traps" ${settings.hideSeabedTraps ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
          </div>
        </div>

        <div class="settings-section">
          <h3><span class="settings-sec-icon">${SETTINGS_ART.audio}</span> Audio Controls</h3>
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
          <h3><span class="settings-sec-icon">${SETTINGS_ART.danger}</span> Save Data Management</h3>
          <p class="settings-danger-warning">Resetting progress will permanently erase your currency, level, upgrades, journal, fossils, and achievements.</p>
          <button class="btn btn-danger" id="btn-trigger-reset">Reset All Game Progress</button>
        </div>
      </div>
    `;

    this.openModal('Settings & Career Records', modalBody);

    document.getElementById('btn-customize-boat')?.addEventListener('click', () => this.openBoatCustomization());
    document.getElementById('btn-customize-angler')?.addEventListener('click', () => this.openAppearance());
    document.getElementById('btn-cloud-save')?.addEventListener('click', async () => {
      this.saveSystem.save();
      await accountManager.syncCloudSave();
      const status = document.getElementById('cloud-save-status');
      if (status) status.textContent = accountManager.cloudStatus;
    });

    document.getElementById('setting-always-ask')?.addEventListener('change', (e) => {
      this.saveSystem.data.settings.alwaysAskOnCatch = e.target.checked;
      this.saveSystem.save();
      this.showToast(e.target.checked ? '🔔 Catch resolution popup enabled.' : '🎒 Catches will now be added directly to inventory.');
    });

    document.getElementById('setting-hide-traps')?.addEventListener('change', (e) => {
      this.saveSystem.data.settings.hideSeabedTraps = e.target.checked;
      this.saveSystem.save();
      this.showToast(e.target.checked ? '👁️ Seabed traps view hidden on water.' : '👁️ Seabed traps view visible on water.');
    });

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
        <div class="tutorial-banner">
          <p>Welcome to Starlight Fishing! Here is your quick-start handbook to mastering the ocean depths, catching exotic species, and avoiding hazards.</p>
        </div>

        <div class="tutorial-step">
          <div class="step-num">1</div>
          <div class="step-text">
            <h4>Aiming & Casting Arc</h4>
            <p>Click, tap, or drag backwards from your vessel to adjust your launch trajectory arc. Release to cast your hook! Aim for <strong>luminous hotspots</strong> and surface ripples for rare fish clusters.</p>
          </div>
        </div>

        <div class="tutorial-step">
          <div class="step-num">2</div>
          <div class="step-text">
            <h4>Steering & Dodging Hazards</h4>
            <p>As your hook sinks, steer smoothly left and right using your mouse, touch drag, or arrow keys. Maneuver past jagged rocks and prowling predators. <strong>Pulsing red auras</strong> warn of danger!</p>
          </div>
        </div>

        <div class="tutorial-step">
          <div class="step-num">3</div>
          <div class="step-text">
            <h4>Reeling & Armor Shields</h4>
            <p>Reeling starts automatically when your creel is full or at max line depth. <strong>Armor Shields</strong> absorb impacts. If your shields are depleted, colossal obstacles can knock <strong>1 or 2 fish</strong> off your line!</p>
          </div>
        </div>

        <div class="tutorial-step">
          <div class="step-num">4</div>
          <div class="step-text">
            <h4>Relaxed Rhythm & Calming Lulls</h4>
            <p>When hauling in rare and legendary titans, a rhythmic tension wave guides your retrieval. Reeling during the gentle <strong>Lull</strong> retrieves faster and smoother. Lines are unbreakable!</p>
          </div>
        </div>

        <div class="tutorial-step">
          <div class="step-num">5</div>
          <div class="step-text">
            <h4>Port Upgrades & Crate Vault</h4>
            <p>Cash in your haul at the Starlight Shop to upgrade <strong>Line Depth, Hook Capacity, and Reel Speed</strong>. Salvaged mystery crates are stored in your Crate Vault for bonus gems, skins, and loot.</p>
          </div>
        </div>

        <div class="tutorial-step">
          <div class="step-num">6</div>
          <div class="step-text">
            <h4>Realms & Boat Companions</h4>
            <p>Voyage across <strong>7 distinct fantasy ocean realms</strong> to complete your Field Journal. Equip beloved companions like <strong>Gracie the Dolphin</strong> and <strong>Irene the Shark</strong> to swim and dive with you!</p>
          </div>
        </div>

        <div class="tutorial-footer">
          <button class="btn btn-primary" id="btn-tutorial-ready">Let's Fish! 🎣</button>
        </div>
      </div>
    `;

    this.openModal("Starlight Angler's Field Guide", modalBody);

    document.getElementById('btn-tutorial-ready').addEventListener('click', () => {
      this.closeModal();
    });
  }
}

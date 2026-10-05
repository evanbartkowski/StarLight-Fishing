import { getRealmDepthZone as getDepthSubZone, getRealmDepthZones } from '../data/RealmDepths.js';
import { REALM_ECOLOGY } from '../data/RealmEcology.js';
import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';
import { REALM_PROFILES } from '../data/RealmContent.js';
// MinimapUI.js — Chart Navigation & Fantasy World Minimap
// Parchment/fantasy styled navigation chart, radial compass, coordinates, and fast travel

import { FANTASY_SEAS, getSeaById, canUnlockSea } from '../entities/SeasData.js';
import { REALM_ART } from './CustomVectorArt.js';

const REALM_MARKERS = [
  { color: '#4e9b71', shore: '#e3c884', contour: '#b7d28a', path: 'M-30 -5 Q-29 -23 -14 -25 Q-4 -34 8 -25 Q20 -28 25 -14 Q38 -4 25 9 Q17 24 2 20 Q-13 29 -22 15 Q-36 8 -30 -5Z', detail: 'M-19 -7 Q-10 -17 1 -11 T18 -13 M-15 8 Q-4 1 8 7 T20 5' },
  { color: '#558fb5', shore: '#9ad8d0', contour: '#b7e7e1', path: 'M-31 -2 Q-28 -22 -10 -28 Q8 -35 22 -20 Q34 -7 25 8 Q18 25 -1 26 Q-18 23 -25 12Z', detail: 'M-20 -8 Q-7 -20 4 -12 T18 -16 M-14 10 Q0 1 14 10' },
  { color: '#6a91b9', shore: '#d8d5ac', contour: '#dce7eb', path: 'M0 -32 Q8 -24 10 -13 Q27 -14 31 -4 Q19 2 15 7 Q25 21 16 29 Q5 19 0 15 Q-13 30 -23 23 Q-17 8 -20 3 Q-34 -4 -27 -14 Q-13 -10 -8 -14Z', detail: 'M-14 -4 Q-4 -14 5 -5 T17 -7 M-12 13 Q0 4 10 14' },
  { color: '#458c81', shore: '#d4c58e', contour: '#a8d8b0', path: 'M-29 22 Q-33 5 -27 -13 L-18 -15 -17 -27 -7 -27 -6 -14 5 -13 7 -26 17 -24 18 -12 28 -10 30 8 24 24Z', detail: 'M-21 11 Q-10 2 -1 9 T17 5 M-13 -7 Q-4 -15 7 -7' },
  { color: '#8581ad', shore: '#ddd0a5', contour: '#dfd8ef', path: 'M-31 0 Q-35 -15 -19 -19 Q-12 -34 2 -25 Q18 -34 25 -18 Q40 -9 28 5 Q25 22 9 20 Q-5 31 -15 19 Q-29 20 -31 0Z', detail: 'M-21 -6 Q-10 -18 0 -9 T19 -12 M-17 9 Q-4 1 8 10 T20 7' },
  { color: '#9b5548', shore: '#dfb377', contour: '#efbf79', path: 'M-31 22 Q-22 5 -15 -12 L-9 -28 4 -31 12 -23 16 -8 29 7 33 23Z', detail: 'M-19 15 Q-8 3 -4 -12 M1 -19 Q11 -8 18 5' },
  { color: '#555c99', shore: '#aaa3c7', contour: '#b8c3ee', path: 'M0 -32 Q10 -25 12 -13 Q29 -8 28 2 Q16 8 14 13 Q17 27 5 31 Q-3 19 -10 16 Q-24 23 -31 12 Q-20 1 -20 -5 Q-31 -17 -19 -23 Q-9 -13 -3 -16Z', detail: 'M-16 -8 Q-4 -18 5 -8 T18 -10 M-16 9 Q-5 2 6 11' },
];

export class MinimapUI {
  constructor(saveSystem, soundManager, uiManager, oceanWorld) {
    this.saveSystem = saveSystem;
    this.soundManager = soundManager;
    this.uiManager = uiManager;
    this.oceanWorld = oceanWorld;
    this.onSailToSea = null; // Callback when player fast travels to another sea
  }

  isUnlocked() {
    return this.saveSystem.isMinimapUnlocked();
  }

  openChartNavigation() {
    this.soundManager.playButtonClick();

    if (!this.isUnlocked()) {
      this.showLockedNotice();
      return;
    }

    const currentSeaId = this.saveSystem.getCurrentSea();
    const currentSea = getSeaById(currentSeaId);
    const unlockedSeas = this.saveSystem.data.unlockedSeas || [1];

    const currentDepthMeters = this.oceanWorld?.hook?.depthMeters || 0;
    const currentSubZone = getDepthSubZone(currentDepthMeters, currentSea.id);

    let html = `
      <div class="minimap-modal-container" style="border:1px solid ${currentSubZone.color};border-radius:12px;padding:8px;--depth-color:${currentSubZone.color}">
        <!-- Header with coordinates and current atmospheric current -->
        <div class="minimap-header-bar">
          <div class="minimap-coords">
            <span class="compass-rose-icon">🧭</span>
            <div>
              <div style="font-weight:700; color:#f8fafc; font-size:1.05rem;">${currentSea.name} (${currentSea.subtitle})</div>
              <div style="color:#94a3b8; font-size:0.8rem; font-family:monospace;">COORDINATES: ${currentSea.coordinates} | DEPTH: 0m - ${currentSea.maxDepth}m</div>
            </div>
          </div>
          <div class="minimap-weather-current">
            <span style="color:#38bdf8;">💨 ${currentSea.weatherCurrent}</span>
          </div>
        </div>

        <!-- Vertical Sub-Zone Exploration Gauge -->
        <div class="minimap-depth-zones-banner" style="background:rgba(15,23,42,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px 14px; margin-bottom:14px; display:flex; flex-direction:column; gap:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
            <span style="color:#cbd5e1; font-weight:600;">🌊 Current Depth Layer: <strong style="color:${currentSubZone.color};">${currentSubZone.icon} ${currentSubZone.name}</strong> (${currentDepthMeters.toFixed(1)}m)</span>
            <span style="color:#94a3b8; font-size:0.75rem;">Depth range: 0m - 3050m</span>
          </div>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; margin-top:4px;">
            ${getRealmDepthZones(currentSea.id).map(sz => {
              const isActive = currentSubZone.id === sz.id;
              const minM = sz.minDepth;
              const maxM = sz.maxDepth;
              return `
                <div class="${isActive ? 'depth-active' : ''}" style="color:${sz.color};background:${isActive ? 'rgba(56,189,248,0.22)' : 'rgba(30,41,59,0.5)'}; border:1px ${sz.borderStyle} ${isActive ? sz.color : 'rgba(255,255,255,0.12)'}; border-radius:6px; padding:6px; text-align:center; transition:all 0.2s;">
                  <div style="font-size:0.75rem; font-weight:700; color:${sz.color};">${sz.icon} ${sz.name}</div>
                  <div style="font-size:0.68rem; color:#94a3b8; font-family:monospace;">${minM}m - ${maxM}m</div>
                  ${isActive ? '<span style="font-size:0.65rem; background:#38bdf8; color:#0f172a; padding:1px 4px; border-radius:3px; font-weight:800;">CURRENT</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Interactive Fantasy Nautical Chart Canvas / Grid -->
        <div class="treasure-chart" aria-label="Treasure map of the seven realms">
          <svg viewBox="0 0 760 380" role="img" aria-label="A winding sea route from Sunlit Shoals to the final realm">
            <defs>
              <pattern id="chart-lines" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" fill="none" stroke="#79552d" stroke-opacity=".13"/></pattern>
              <!-- Dynamic bathymetric contour pattern -->
              <radialGradient id="realm-glow-${currentSeaId}" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="${currentSea.topColor}" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="${currentSea.bottomColor}" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="760" height="380" fill="url(#chart-lines)"/>
            <!-- Contour bathymetric lines -->
            <path d="M40 80 Q 200 40 400 90 T 720 70" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.25" stroke-dasharray="4 6"/>
            <path d="M30 160 Q 220 130 380 180 T 730 150" fill="none" stroke="#818cf8" stroke-width="1.2" stroke-opacity="0.25" stroke-dasharray="4 6"/>
            <path d="M20 240 Q 240 210 420 250 T 740 230" fill="none" stroke="#6366f1" stroke-width="1.2" stroke-opacity="0.2" stroke-dasharray="4 6"/>
            <path d="M10 320 Q 260 290 460 330 T 750 310" fill="none" stroke="#c084fc" stroke-width="1.2" stroke-opacity="0.2" stroke-dasharray="4 6"/>
            <path d="M90 260 C60 150 120 100 205 120 S235 285 330 265 S345 125 435 140 S480 265 555 220 S545 60 635 90 S645 140 705 175" fill="none" stroke="#9a5636" stroke-width="2" stroke-dasharray="5 8"/>
            <g fill="none" stroke="#84613b" opacity=".5"><path d="M20 330q20-12 40 0t40 0m390 0q20-12 40 0t40 0m-290-290q20-12 40 0t40 0"/><circle cx="85" cy="72" r="31"/><path d="M85 28v88M41 72h88M64 51l42 42m0-42L64 93"/></g>
            <path d="M85 35l7 37-7 31-7-31Z" fill="#735334"/><text x="85" y="22" text-anchor="middle" fill="#614025" font-size="12">N</text>
            ${FANTASY_SEAS.map((sea, index) => {
              const [x, y] = [[90,260],[205,120],[330,265],[435,140],[555,220],[635,90],[705,175]][index];
              const isSelected = sea.id === currentSeaId;
              const marker = REALM_MARKERS[index];
              const fillCol = marker.color;
              return `<g class="chart-island ${isSelected ? 'charted-current' : ''}" data-chart-realm="${sea.id}" tabindex="0" role="button" aria-label="View ${sea.name}">
                ${isSelected ? `<circle cx="${x}" cy="${y}" r="38" fill="url(#realm-glow-${currentSeaId})"/>` : ''}
                <path d="${marker.path}" transform="translate(${x} ${y})" fill="${marker.shore}" fill-opacity="${unlockedSeas.includes(sea.id) ? .95 : .5}" stroke="${isSelected ? '#f4e6bd' : '#4c5d67'}" stroke-width="2.5"/>
                <path class="realm-landmass" transform="translate(${x} ${y}) scale(.84)" d="${marker.path}" fill="${fillCol}" fill-opacity="${unlockedSeas.includes(sea.id) ? 1 : .55}" stroke="${marker.contour}" stroke-width="1.4"/>
                <path d="${marker.detail}" transform="translate(${x} ${y})" fill="none" stroke="${marker.contour}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>
                <circle cx="${x}" cy="${y}" r="9" fill="#102a39" fill-opacity=".75" stroke="${marker.shore}" stroke-width="1.4"/>
                <text x="${x}" y="${y+3.5}" text-anchor="middle" fill="#f3e7c6" font-size="10" font-weight="bold">${sea.id}</text>
                <text x="${x}" y="${y+53}" text-anchor="middle" fill="#513821" font-size="10">${sea.name.split(',')[0]}</text>
              </g>`;
            }).join('')}
            <text x="365" y="355" text-anchor="middle" fill="#7e5733" font-family="Georgia,serif" font-size="16" font-style="italic">The Seven Seas of Starlight</text>
          </svg>
        </div>
        <div class="fantasy-chart-map-view">
          <div class="seas-grid-layout">
    `;

    FANTASY_SEAS.forEach((sea) => {
      const isUnlocked = unlockedSeas.includes(sea.id);
      const isCurrent = currentSeaId === sea.id;
      const unlockStatus = canUnlockSea(sea, this.saveSystem);
      const profile = REALM_PROFILES[sea.id];

      html += `
        <div class="sea-chart-card ${isCurrent ? 'sea-card-active' : ''} ${!isUnlocked ? 'sea-card-locked' : 'sea-card-unlocked'}" data-sea-id="${sea.id}">
          <div class="sea-card-top" style="border-left: 4px solid ${sea.topColor};">
            <span class="sea-card-icon-art">${REALM_ART[sea.id] || sea.icon}</span>
            <div style="flex:1;">
              <div class="sea-card-title">
                ${sea.id}. ${sea.name}
                ${isCurrent ? '<span class="active-anchor-badge"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:3px;"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="21"/><line x1="5" y1="12" x2="19" y2="12"/><path d="M5 14a7 7 0 0 0 14 0"/></svg>ANCHORED</span>' : ''}
              </div>
              <div class="sea-card-subtitle">${sea.subtitle}</div>
            </div>
          </div>

          <p class="sea-card-desc">${sea.description}</p><p class="sea-card-desc">${REALM_ECOLOGY[sea.id].description}</p>

          <!-- Hotspots list -->
          <div class="sea-card-hotspots">
            <div style="font-size:0.75rem; font-weight:600; color:#cbd5e1; margin-bottom:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="#f43f5e" style="vertical-align:middle; margin-right:4px;"><circle cx="12" cy="9" r="4"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>Known Chart Hotspots:</div>
            <div class="hotspots-tags">
              ${sea.hotspots.map(h => `<span class="hotspot-tag" title="${h.bonus}">● ${h.name}</span>`).join('')}
            </div>
          </div>

          <!-- Action / Gate status -->
          <div class="sea-card-actions">
      `;

      if (isCurrent) {
        html += `<button class="btn btn-secondary btn-sm" disabled>Currently Fishing Here</button>`;
      } else if (isUnlocked) {
        html += `<button class="btn btn-primary btn-sm btn-sail-sea" data-sea-id="${sea.id}">Sail to Realm</button>`;
      } else {
        if (unlockStatus.canUnlock) {
          html += `
            <button class="btn btn-warning btn-sm btn-unlock-sea" data-sea-id="${sea.id}" data-cost="${sea.gates.unlockFee}">
              Charter Waters: $${sea.gates.unlockFee.toLocaleString()}
            </button>
          `;
        } else {
          html += `
            <div class="gate-lock-reason" title="${unlockStatus.reason}">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>${unlockStatus.reason}
            </div>
          `;
        }
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>

        <div class="minimap-footer-note">
          <span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#facc15" stroke-width="2" style="vertical-align:middle; margin-right:5px;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg><em>Sailing to an ocean realm transitions your vessel, unlocks unique fantasy species, atmospheric music, and depth profiles.</em></span>
        </div>
      </div>
    `;

    this.uiManager.openModal('Treasure Chart', html);

    document.querySelectorAll('[data-chart-realm]').forEach(marker => {
      const reveal = () => document.querySelector(`.sea-chart-card[data-sea-id="${marker.dataset.chartRealm}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      marker.addEventListener('click', reveal);
      marker.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); reveal(); } });
    });
    // Wire sail buttons
    document.querySelectorAll('.btn-sail-sea').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetSeaId = parseInt(e.currentTarget.dataset.seaId, 10);
        this.sailToSea(targetSeaId);
      });
    });

    // Wire unlock buttons
    document.querySelectorAll('.btn-unlock-sea').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetSeaId = parseInt(e.currentTarget.dataset.seaId, 10);
        const cost = parseInt(e.currentTarget.dataset.cost, 10);
        this.unlockSea(targetSeaId, cost);
      });
    });
  }

  showLockedNotice() {
    const playerLevel = this.saveSystem.data.level;
    const astrolabeLvl = this.saveSystem.getUpgradeLevel('nauticalAstrolabe') || 0;

    let notice = `
      <div style="text-align:center; padding: 24px 16px;">
        <div style="margin-bottom: 12px; display:inline-block; width:64px; height:64px;">
          <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="#facc15" stroke-width="2"/><path d="M24 8v32M8 24h32" stroke="#eab308" stroke-width="1.5"/><circle cx="24" cy="24" r="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/><polygon points="24,18 27,24 24,30 21,24" fill="#38bdf8"/></svg>
        </div>
        <h3 style="color:#f8fafc; margin-bottom:8px;">Chart Navigation Locked</h3>
        <p style="color:#94a3b8; font-size:0.9rem; max-width:440px; margin: 0 auto 16px auto;">
          To navigate the fantasy realms of the Seven Seas and track drifting mythic schools, you must equip proper celestial instruments.
        </p>
        <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px; max-width:380px; margin:0 auto 20px auto; text-align:left; font-size:0.85rem;">
          <div style="margin-bottom:8px; color:${playerLevel >= 4 ? '#22c55e' : '#ef4444'};">
            ${playerLevel >= 4 ? '✓' : '✗'} <strong>Angler Level 4+</strong> (Current: Lv. ${playerLevel})
          </div>
          <div style="color:${astrolabeLvl >= 1 ? '#22c55e' : '#ef4444'};">
            ${astrolabeLvl >= 1 ? '✓' : '✗'} <strong>Brass Astrolabe & Nautical Compass</strong> (Purchase in Tackle Shop for $${UPGRADE_DEFINITIONS.nauticalAstrolabe.tiers[1].cost.toLocaleString()})
          </div>
        </div>
        <button class="btn btn-primary" id="btn-goto-shop-minimap">Open Tackle Shop</button>
      </div>
    `;

    this.uiManager.openModal('Chart Navigation', notice);

    document.getElementById('btn-goto-shop-minimap')?.addEventListener('click', () => {
      this.uiManager.closeModal();
      this.uiManager.openShop();
    });
  }

  unlockSea(seaId, cost) {
    const sea = getSeaById(seaId);
    if (!sea) return;

    if (this.saveSystem.unlockSea(seaId, cost)) {
      this.soundManager.playUpgrade();
      this.uiManager.showToast(`✨ Charted ${sea.name}! You can now sail to these waters.`);
      this.openChartNavigation(); // Refresh view
    } else {
      this.soundManager.playButtonClick();
      this.uiManager.showToast(`Cannot charter ${sea.name}. Check requirements!`);
    }
  }

  sailToSea(seaId) {
    const sea = getSeaById(seaId);
    if (!sea) return;

    if (this.saveSystem.setCurrentSea(seaId)) {
      this.soundManager.playCast();
      this.uiManager.closeModal();

      if (this.uiManager && typeof this.uiManager.playCloudTransition === 'function') {
        this.uiManager.playCloudTransition(() => {
          if (this.onSailToSea) {
            this.onSailToSea(sea);
          }
        });
      } else if (this.onSailToSea) {
        this.onSailToSea(sea);
      }
    }
  }
}

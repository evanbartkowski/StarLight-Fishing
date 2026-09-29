import { REALM_ECOLOGY } from '../data/RealmEcology.js';
import { UPGRADE_DEFINITIONS } from '../data/UpgradesData.js';
import { REALM_PROFILES } from '../data/RealmContent.js';
// MinimapUI.js — Chart Navigation & Fantasy World Minimap
// Parchment/fantasy styled navigation chart, radial compass, coordinates, and fast travel

import { FANTASY_SEAS, getSeaById, canUnlockSea } from '../entities/SeasData.js';

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

    let html = `
      <div class="minimap-modal-container">
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

        <!-- Interactive Fantasy Nautical Chart Canvas / Grid -->
        <div class="treasure-chart" aria-label="Treasure map of the seven realms">
          <svg viewBox="0 0 760 380" role="img" aria-label="A winding sea route from Sunlit Shoals to the final realm">
            <defs><pattern id="chart-lines" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" fill="none" stroke="#79552d" stroke-opacity=".13"/></pattern></defs>
            <rect width="760" height="380" fill="url(#chart-lines)"/>
            <path d="M90 260 C60 150 120 100 205 120 S235 285 330 265 S345 125 435 140 S480 265 555 220 S545 60 635 90 S645 140 705 175" fill="none" stroke="#9a5636" stroke-width="2" stroke-dasharray="5 8"/>
            <g fill="none" stroke="#84613b" opacity=".5"><path d="M20 330q20-12 40 0t40 0m390 0q20-12 40 0t40 0m-290-290q20-12 40 0t40 0"/><circle cx="85" cy="72" r="31"/><path d="M85 28v88M41 72h88M64 51l42 42m0-42L64 93"/></g>
            <path d="M85 35l7 37-7 31-7-31Z" fill="#735334"/><text x="85" y="22" text-anchor="middle" fill="#614025" font-size="12">N</text>
            ${FANTASY_SEAS.map((sea, index) => {
              const [x, y] = [[90,260],[205,120],[330,265],[435,140],[555,220],[635,90],[705,175]][index];
              return `<g class="chart-island ${sea.id === currentSeaId ? 'charted-current' : ''}" data-chart-realm="${sea.id}" tabindex="0" role="button" aria-label="View ${sea.name}"><path d="M${x-29} ${y-8}l12-22 27 4 19 20-9 25-25 8-29-13Z" fill="${unlockedSeas.includes(sea.id) ? '#8c9d65' : '#b5a17a'}" stroke="#745331" stroke-width="2"/><circle cx="${x}" cy="${y}" r="13" fill="#eee0bb" stroke="#735334"/><text x="${x}" y="${y+4}" text-anchor="middle" fill="#513821" font-size="13" font-weight="bold">${sea.id}</text><text x="${x}" y="${y+53}" text-anchor="middle" fill="#513821" font-size="10">${sea.name.split(',')[0]}</text></g>`;
            }).join('')}
            <text x="365" y="355" text-anchor="middle" fill="#7e5733" font-family="Georgia,serif" font-size="16" font-style="italic">The Seven Seas of Starlight</text>
          </svg>
          <p>Follow the dotted route. Select an island to inspect its waters.</p>
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
            <span class="sea-card-icon">${sea.icon}</span>
            <div style="flex:1;">
              <div class="sea-card-title">
                ${sea.id}. ${sea.name}
                ${isCurrent ? '<span class="active-anchor-badge">⚓ ANCHORED</span>' : ''}
              </div>
              <div class="sea-card-subtitle">${sea.subtitle}</div>
            </div>
          </div>

          <p class="sea-card-desc">${sea.description}</p><p class="sea-card-desc">${REALM_ECOLOGY[sea.id].description}</p>

          <!-- Hotspots list -->
          <div class="sea-card-hotspots">
            <div style="font-size:0.75rem; font-weight:600; color:#cbd5e1; margin-bottom:4px;">📍 Known Chart Hotspots:</div>
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
        html += `<button class="btn btn-primary btn-sm btn-sail-sea" data-sea-id="${sea.id}">Sail to Realm ⛵</button>`;
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
              🔒 ${unlockStatus.reason}
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
          <span>💡 <em>Sailing to an ocean realm transitions your vessel, unlocks unique fantasy species, atmospheric music, and depth profiles.</em></span>
        </div>
      </div>
    `;

    this.uiManager.openModal('🧭 Treasure Chart', html);

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
        <div style="font-size: 3.2rem; margin-bottom: 12px;">🧭🔒</div>
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
        <button class="btn btn-primary" id="btn-goto-shop-minimap">Open Tackle Shop 🛒</button>
      </div>
    `;

    this.uiManager.openModal('🧭 Chart Navigation', notice);

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
      this.uiManager.showToast(`⛵ Setting sail for ${sea.name} (${sea.subtitle})!`);
      this.uiManager.closeModal();

      if (this.onSailToSea) {
        this.onSailToSea(sea);
      }
    }
  }
}

import { soundManager } from '../audio/SoundManager.js';
import { leaderboardManager } from '../systems/LeaderboardManager.js';

export class EndgameScene {
  constructor(saveSystem) {
    this.saveSystem = saveSystem;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.animFrameId = null;
    this.stars = [];
    this.auroraTime = 0;
    this.timers = [];
    this.onCompleteCallback = null;
    this.isClosing = false;
  }

  show(onComplete) {
    if (this.container) {
      this.close();
    }
    this.onCompleteCallback = onComplete;
    this.isClosing = false;

    // Start special endgame music
    soundManager.playEndgameMusic();

    this.createDom();
    this.loadTopThreePlayers();
    this.initCanvas();
    this.startSequence();
  }

  getFallbackTopPlayers() {
    let entries = [];
    try {
      if (this.saveSystem && typeof this.saveSystem.getScoreboardData === 'function') {
        entries = this.saveSystem.getScoreboardData('level') || [];
      }
    } catch (_) {}
    if (!Array.isArray(entries) || entries.length < 3) {
      const playerName = this.saveSystem?.data?.profile?.name || 'Captain Mariner';
      const playerLevel = this.saveSystem?.getLevel ? this.saveSystem.getLevel() : 50;
      entries = [
        { name: playerName, value: Math.max(playerLevel, 55), isPlayer: true },
        { name: 'tonyanth', value: 52 },
        { name: 'randomusername', value: 49 },
      ];
    }
    return entries.slice(0, 3);
  }

  renderTopPlayersHtml(players) {
    const medals = ['🥇 #1 Champion', '🥈 #2 Sovereign', '🥉 #3 Voyager'];
    const classes = ['rank-1', 'rank-2', 'rank-3'];
    const safeEsc = (str) => String(str || 'Captain')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const cardsHtml = players.slice(0, 3).map((p, i) => {
      const name = safeEsc(p.name || p.username || `Captain #${i + 1}`);
      const lvl = Number.isFinite(Number(p.value)) ? `Lv. ${Number(p.value).toLocaleString()}` : (p.level ? `Lv. ${p.level}` : 'Master Angler');
      return `
        <div class="endgame-podium-card ${classes[i] || ''}">
          <div class="endgame-podium-rank">${medals[i] || `#${i + 1}`}</div>
          <div class="endgame-podium-name">${name}</div>
          <div class="endgame-podium-stat">${lvl}</div>
        </div>
      `;
    }).join('');

    const namesList = players.slice(0, 3).map(p => safeEsc(p.name || p.username || 'Captain')).join(', ');
    return `
      <div class="endgame-podium-grid">
        ${cardsHtml}
      </div>
      <div class="endgame-thanks-note">
        Eternal gratitude to our top 3 players — <strong>${namesList}</strong> — and to every mariner who cast their line into the starlit abyss.
      </div>
    `;
  }

  loadTopThreePlayers() {
    const fallback = this.getFallbackTopPlayers();
    const mount = this.container?.querySelector('#endgame-top-players-mount');
    if (mount) {
      mount.innerHTML = this.renderTopPlayersHtml(fallback);
    }

    try {
      if (leaderboardManager && typeof leaderboardManager.getBoard === 'function') {
        leaderboardManager.getBoard(this.saveSystem, 'level')
          .then((res) => {
            if (this.isClosing || !this.container) return;
            const entries = res?.entries;
            if (Array.isArray(entries) && entries.length > 0) {
              const top3 = entries.slice(0, 3);
              while (top3.length < 3 && fallback[top3.length]) {
                top3.push(fallback[top3.length]);
              }
              const target = this.container.querySelector('#endgame-top-players-mount');
              if (target) {
                target.innerHTML = this.renderTopPlayersHtml(top3);
              }
            }
          })
          .catch(() => {});
      }
    } catch (_) {}
  }

  createDom() {
    this.container = document.createElement('div');
    this.container.id = 'endgame-scene-overlay';
    this.container.className = 'endgame-scene-overlay';

    const initialTop3 = this.getFallbackTopPlayers();

    this.container.innerHTML = `
      <canvas id="endgame-canvas" class="endgame-canvas"></canvas>
      <button type="button" id="endgame-skip-btn" class="endgame-skip-btn" title="Skip to surface">Skip ⏭</button>
      
      <div class="endgame-scroll-wrapper" id="endgame-scroll-wrapper">
        <div class="endgame-prelude-badge" id="endgame-prelude">
          <span>🌌</span> <span>Realm VII · Eldritch Chrono Void · Finale</span>
        </div>

        <div class="endgame-quote-container">
          <p class="endgame-quote-stanza" id="stanza-1">
            &ldquo;Perhaps the abyss was never empty. Perhaps it holds everything we once buried, all the dreams, memories, and broken pieces of ourselves too heavy for the surface to bear.&rdquo;
          </p>

          <p class="endgame-quote-stanza" id="stanza-2">
            &ldquo;I wonder how many stars have fallen into the ocean, mistaking their own reflections for a place to call home, only to sink into depths where even their light could no longer reach.&rdquo;
          </p>

          <p class="endgame-quote-stanza highlight" id="stanza-3">
            &ldquo;And yet, as I drifted into the darkness, I realized something beautiful and tragic... Even at the bottom of the ocean, surrounded by everything the world had forgotten, I was still beneath a sea of stars.&rdquo;
          </p>

          <div class="endgame-author" id="endgame-author">
            created by : Evan Bartkowski
          </div>
        </div>

        <div class="endgame-divider" id="endgame-divider"></div>

        <div class="endgame-credits-block" id="endgame-credits">
          <div class="endgame-crown-emblem">👑 ✨ ⚓</div>
          <h2 class="endgame-title">STARLIGHT FISHING</h2>
          <div class="endgame-subtitle">The Seven Seas · Celestial Abyss Epilogue</div>

          <div class="endgame-credits-grid">
            <div class="endgame-credit-item">
              <div class="endgame-credit-role">Created &amp; Developed By</div>
              <div class="endgame-credit-name">Evan Bartkowski</div>
            </div>

            <div class="endgame-credit-item">
              <div class="endgame-credit-role">Game Design &amp; Programming</div>
              <div class="endgame-credit-name">Evan Bartkowski</div>
            </div>

            <div class="endgame-credit-item">
              <div class="endgame-credit-role">Original Music &amp; Sound Direction</div>
              <div class="endgame-credit-name">Evan Bartkowski</div>
            </div>
          </div>

          <div class="endgame-top-players-section">
            <div class="endgame-credit-role" style="color: #fde047; font-size: 0.85rem; margin-bottom: 12px;">
              🏆 Special Thanks to the Top 3 Players of the Game 🏆
            </div>
            <div id="endgame-top-players-mount">
              ${this.renderTopPlayersHtml(initialTop3)}
            </div>
          </div>
        </div>

        <button type="button" class="endgame-finish-btn" id="endgame-finish-btn">
          ⚓ Return to Surface &amp; Continue Journey
        </button>
      </div>
    `;

    document.body.appendChild(this.container);

    // Fade in
    requestAnimationFrame(() => {
      this.container?.classList.add('visible');
    });

    // Button event listeners
    const skipBtn = this.container.querySelector('#endgame-skip-btn');
    skipBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    const finishBtn = this.container.querySelector('#endgame-finish-btn');
    finishBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    // Clicking anywhere on the scroll wrapper advances pacing
    const scrollWrapper = this.container.querySelector('#endgame-scroll-wrapper');
    scrollWrapper?.addEventListener('click', () => {
      this.advancePacing();
    });
  }

  initCanvas() {
    this.canvas = this.container.querySelector('#endgame-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const resize = () => {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    this._windowResizeHandler = resize;

    // Generate cosmic abyss stars (optimized count, no shadowBlur lag)
    this.stars = [];
    const starCount = Math.min(130, Math.floor((window.innerWidth * window.innerHeight) / 8000));
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.8 + 0.6,
        color: ['#ffffff', '#bae6fd', '#c7d2fe', '#fef08a', '#e9d5ff'][Math.floor(Math.random() * 5)],
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftY: -(Math.random() * 12 + 4),
        driftX: (Math.random() - 0.5) * 6,
      });
    }

    // Start background render loop
    let lastTime = performance.now();
    const renderLoop = (time) => {
      if (this.isClosing || !this.canvas || !this.ctx) return;
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;
      this.renderCanvas(dt);
      this.animFrameId = requestAnimationFrame(renderLoop);
    };
    this.animFrameId = requestAnimationFrame(renderLoop);
  }

  renderCanvas(dt) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.auroraTime += dt;

    // Deep void cosmic gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.42, '#090d26');
    grad.addColorStop(0.78, '#1b1038');
    grad.addColorStop(1, '#030712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Flowing ethereal aurora ribbons in the abyss
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let a = 0; a < 3; a++) {
      ctx.beginPath();
      const waveY = h * (0.32 + a * 0.22);
      ctx.moveTo(0, waveY);
      for (let x = 0; x <= w; x += 36) {
        const y = waveY
          + Math.sin(x * 0.0028 + this.auroraTime * 0.55 + a * 1.4) * 42
          + Math.cos(x * 0.0055 - this.auroraTime * 0.35 + a) * 24;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const auroraGrad = ctx.createLinearGradient(0, waveY - 60, 0, waveY + 140);
      const colors = [
        'rgba(56, 189, 248, 0.09)',
        'rgba(192, 132, 252, 0.08)',
        'rgba(250, 204, 21, 0.05)'
      ];
      auroraGrad.addColorStop(0, colors[a]);
      auroraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auroraGrad;
      ctx.fill();
    }
    ctx.restore();

    // Drifting glowing stars & abyssal motes (fast soft halo circles instead of expensive shadowBlur)
    ctx.save();
    for (const star of this.stars) {
      star.y += star.driftY * dt;
      star.x += star.driftX * dt;
      if (star.y < -10) star.y = h + 10;
      if (star.x < -10) star.x = w + 10;
      if (star.x > w + 10) star.x = -10;

      const alpha = Math.max(0.08, Math.min(1, 0.38 + 0.55 * Math.sin(this.auroraTime * star.twinkleSpeed + star.twinkleOffset)));
      ctx.fillStyle = star.color;
      if (star.radius > 1.35) {
        ctx.globalAlpha = alpha * 0.22;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Distant cosmic space-whale silhouette swimming forward across the starlit background
    const whaleSpeed = 22;
    const whaleX = ((this.auroraTime * whaleSpeed) % (w + 480)) - 240;
    const whaleY = h * 0.74 + Math.sin(this.auroraTime * 0.4) * 16;
    const pitch = Math.cos(this.auroraTime * 0.4) * 0.05;
    ctx.save();
    ctx.translate(whaleX, whaleY);
    ctx.rotate(pitch);
    ctx.globalAlpha = 0.14;
    const wGrad = ctx.createLinearGradient(-110, -20, 120, 20);
    wGrad.addColorStop(0, '#0284c7');
    wGrad.addColorStop(0.5, '#38bdf8');
    wGrad.addColorStop(1, '#c084fc');
    ctx.fillStyle = wGrad;
    ctx.beginPath();
    ctx.moveTo(-115, 0);
    ctx.quadraticCurveTo(-60, -30, 40, -28);
    ctx.quadraticCurveTo(110, -22, 125, 0);
    ctx.quadraticCurveTo(110, 26, 40, 24);
    ctx.quadraticCurveTo(-50, 22, -115, 0);
    ctx.closePath();
    ctx.fill();
    // Tail fluke
    const flukeWave = Math.sin(this.auroraTime * 1.8) * 8;
    ctx.beginPath();
    ctx.moveTo(-115, 0);
    ctx.lineTo(-145, -24 + flukeWave);
    ctx.quadraticCurveTo(-132, flukeWave * 0.5, -152, flukeWave);
    ctx.quadraticCurveTo(-132, flukeWave * 0.5, -145, 24 + flukeWave);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  startSequence() {
    this.sequenceStep = 0;

    const s1 = this.container.querySelector('#stanza-1');
    const s2 = this.container.querySelector('#stanza-2');
    const s3 = this.container.querySelector('#stanza-3');
    const author = this.container.querySelector('#endgame-author');
    const divider = this.container.querySelector('#endgame-divider');
    const credits = this.container.querySelector('#endgame-credits');
    const finishBtn = this.container.querySelector('#endgame-finish-btn');
    const scrollWrapper = this.container.querySelector('#endgame-scroll-wrapper');

    // Stanza 1 after 1.8s
    this.addTimer(() => {
      s1?.classList.add('active');
      this.sequenceStep = 1;
    }, 1800);

    // Stanza 2 after 7.0s
    this.addTimer(() => {
      s2?.classList.add('active');
      this.sequenceStep = 2;
    }, 7000);

    // Stanza 3 after 12.5s
    this.addTimer(() => {
      s3?.classList.add('active');
      this.sequenceStep = 3;
    }, 12500);

    // Author after 16.5s
    this.addTimer(() => {
      author?.classList.add('active');
      this.sequenceStep = 4;
    }, 16500);

    // Divider & Credits after 19.5s
    this.addTimer(() => {
      divider?.classList.add('active');
      credits?.classList.add('active');
      this.sequenceStep = 5;
      scrollWrapper?.scrollTo({ top: scrollWrapper.scrollHeight * 0.4, behavior: 'smooth' });
    }, 19500);

    // Finish button after 23.0s
    this.addTimer(() => {
      finishBtn?.classList.add('active');
      this.sequenceStep = 6;
      scrollWrapper?.scrollTo({ top: scrollWrapper.scrollHeight, behavior: 'smooth' });
    }, 23000);
  }

  advancePacing() {
    const s1 = this.container?.querySelector('#stanza-1');
    const s2 = this.container?.querySelector('#stanza-2');
    const s3 = this.container?.querySelector('#stanza-3');
    const author = this.container?.querySelector('#endgame-author');
    const divider = this.container?.querySelector('#endgame-divider');
    const credits = this.container?.querySelector('#endgame-credits');
    const finishBtn = this.container?.querySelector('#endgame-finish-btn');
    const scrollWrapper = this.container?.querySelector('#endgame-scroll-wrapper');

    if (!s1?.classList.contains('active')) {
      s1?.classList.add('active');
    } else if (!s2?.classList.contains('active')) {
      s2?.classList.add('active');
    } else if (!s3?.classList.contains('active')) {
      s3?.classList.add('active');
    } else if (!author?.classList.contains('active')) {
      author?.classList.add('active');
    } else {
      divider?.classList.add('active');
      credits?.classList.add('active');
      finishBtn?.classList.add('active');
      scrollWrapper?.scrollTo({ top: scrollWrapper.scrollHeight, behavior: 'smooth' });
    }
  }

  addTimer(fn, ms) {
    const timer = setTimeout(fn, ms);
    this.timers.push(timer);
    return timer;
  }

  close() {
    if (this.isClosing) return;
    this.isClosing = true;

    for (const t of this.timers) clearTimeout(t);
    this.timers = [];

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this._windowResizeHandler) {
      window.removeEventListener('resize', this._windowResizeHandler);
      this._windowResizeHandler = null;
    }

    // Stop special music
    soundManager.stopEndgameMusic();

    // Mark completed in save
    if (this.saveSystem && typeof this.saveSystem.markEndgameSeen === 'function') {
      this.saveSystem.markEndgameSeen();
    }

    if (this.container) {
      this.container.classList.remove('visible');
      setTimeout(() => {
        this.container?.remove();
        this.container = null;
        if (typeof this.onCompleteCallback === 'function') {
          const cb = this.onCompleteCallback;
          this.onCompleteCallback = null;
          cb();
        }
      }, 800);
    } else {
      if (typeof this.onCompleteCallback === 'function') {
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = null;
        cb();
      }
    }
  }
}

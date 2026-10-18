import { soundManager } from '../audio/SoundManager.js';
import { leaderboardManager } from '../systems/LeaderboardManager.js';

export class EndgameScene {
  constructor(saveSystem) {
    this.saveSystem = saveSystem;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.bubbleCanvas = null;
    this.bubbleCtx = null;
    this.animFrameId = null;
    this.stars = [];
    this.bubbles = [];
    this.auroraTime = 0;
    this.bubbleTime = 0;
    this.timers = [];
    this.onCompleteCallback = null;
    this.isClosing = false;
    this.inTransition = true;
    this.currentView = 'poem'; // 'poem' | 'epilogue'
  }

  show(onComplete) {
    if (this.container) {
      this.close();
    }
    this.onCompleteCallback = onComplete;
    this.isClosing = false;
    this.inTransition = true;
    this.currentView = 'poem';

    // Start special endgame music (all other music and synths silenced)
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

      <!-- 1. Underwater Visual Rainbow Bubble Transition Overlay -->
      <div class="endgame-bubble-transition active" id="endgame-bubble-transition">
        <canvas id="endgame-bubble-canvas" class="endgame-bubble-canvas"></canvas>
        <div class="endgame-bubble-content">
          <div class="endgame-bubble-badge">✦ 3,000 METERS · THE CELESTIAL ABYSS ✦</div>
          <h1 class="endgame-bubble-title">You have reached the bottom of starlight fishing!</h1>
          <div class="endgame-bubble-subtitle">✨ Entering the Eldritch Chrono Void Finale... ✨</div>
          <button type="button" class="endgame-bubble-skip" id="endgame-bubble-skip">Continue ➔</button>
        </div>
      </div>
      
      <!-- 2. Main Content Wrapper: Stays on Poem with Next Button to Epilogue -->
      <div class="endgame-scroll-wrapper" id="endgame-scroll-wrapper">
        <!-- POEM VIEW -->
        <div class="endgame-poem-view" id="endgame-poem-view">
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

          <button type="button" class="endgame-next-btn" id="endgame-next-btn">
            Next ➔
          </button>
        </div>

        <!-- EPILOGUE & THANKS VIEW (initially hidden, revealed on Next) -->
        <div class="endgame-epilogue-view" id="endgame-epilogue-view" style="display: none;">
          <div class="endgame-divider active" id="endgame-divider"></div>

          <div class="endgame-credits-block active" id="endgame-credits">
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

          <div class="endgame-epilogue-actions">
            <button type="button" class="endgame-back-btn" id="endgame-back-btn">
              ⬅ Read Poem
            </button>
            <button type="button" class="endgame-finish-btn active" id="endgame-finish-btn">
              ⚓ Return to Surface &amp; Continue Journey
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Fade in overlay
    requestAnimationFrame(() => {
      this.container?.classList?.add?.('visible');
    });

    // Skip Button
    const skipBtn = this.container.querySelector('#endgame-skip-btn');
    skipBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    // Bubble transition tap / skip button
    const bubbleOverlay = this.container.querySelector('#endgame-bubble-transition');
    bubbleOverlay?.addEventListener('click', () => {
      this.finishTransition();
    });

    // Next Button (moves from Poem to Epilogue & Thanks)
    const nextBtn = this.container.querySelector('#endgame-next-btn');
    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showEpilogue();
    });

    // Back Button (returns from Epilogue back to Poem)
    const backBtn = this.container.querySelector('#endgame-back-btn');
    backBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showPoem();
    });

    // Finish Button (returns to surface)
    const finishBtn = this.container.querySelector('#endgame-finish-btn');
    finishBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    // Clicking anywhere on poem advances pacing
    const poemView = this.container.querySelector('#endgame-poem-view');
    poemView?.addEventListener('click', () => {
      this.advancePoemPacing();
    });
  }

  showEpilogue() {
    this.currentView = 'epilogue';
    const poemView = this.container?.querySelector('#endgame-poem-view');
    const epilogueView = this.container?.querySelector('#endgame-epilogue-view');
    const scrollWrapper = this.container?.querySelector('#endgame-scroll-wrapper');
    if (poemView && epilogueView) {
      poemView.style.display = 'none';
      epilogueView.style.display = 'flex';
      epilogueView.classList?.add?.('active');
      scrollWrapper?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  showPoem() {
    this.currentView = 'poem';
    const poemView = this.container?.querySelector('#endgame-poem-view');
    const epilogueView = this.container?.querySelector('#endgame-epilogue-view');
    const scrollWrapper = this.container?.querySelector('#endgame-scroll-wrapper');
    if (poemView && epilogueView) {
      epilogueView.style.display = 'none';
      poemView.style.display = 'flex';
      scrollWrapper?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  finishTransition() {
    if (!this.inTransition) return;
    this.inTransition = false;
    const overlay = this.container?.querySelector('#endgame-bubble-transition');
    if (overlay) {
      overlay.classList?.remove?.('active');
      this.addTimer(() => {
        if (overlay) overlay.style.display = 'none';
      }, 700);
    }
    this.startPoemPacing();
  }

  initCanvas() {
    // 1. Background Stars & Space Whale Canvas
    this.canvas = this.container.querySelector('#endgame-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext?.('2d') || null;
    }

    // 2. Rainbow Bubble Transition Canvas
    this.bubbleCanvas = this.container.querySelector('#endgame-bubble-canvas');
    if (this.bubbleCanvas) {
      this.bubbleCtx = this.bubbleCanvas.getContext?.('2d') || null;
    }

    const resize = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const h = typeof window !== 'undefined' ? window.innerHeight : 720;
      if (this.canvas) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
      if (this.bubbleCanvas) {
        this.bubbleCanvas.width = w;
        this.bubbleCanvas.height = h;
      }
    };
    resize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', resize);
      this._windowResizeHandler = resize;
    }

    // Generate cosmic abyss stars
    this.stars = [];
    const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const height = typeof window !== 'undefined' ? window.innerHeight : 720;
    const starCount = Math.min(130, Math.floor((width * height) / 8000));
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        color: ['#ffffff', '#bae6fd', '#c7d2fe', '#fef08a', '#e9d5ff'][Math.floor(Math.random() * 5)],
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftY: -(Math.random() * 12 + 4),
        driftX: (Math.random() - 0.5) * 6,
      });
    }

    // Generate aesthetic underwater rainbow bubbles for transition
    this.bubbles = [];
    const bubbleCount = 42;
    for (let i = 0; i < bubbleCount; i++) {
      this.bubbles.push({
        x: Math.random() * width,
        baseX: Math.random() * width,
        y: Math.random() * (height + 200),
        radius: Math.random() * 18 + 7,
        speedY: Math.random() * 85 + 55,
        hue: (i * 24) % 360,
        wobbleSpeed: Math.random() * 2.2 + 1.2,
        wobbleAmp: Math.random() * 20 + 8,
        wobbleOffset: Math.random() * Math.PI * 2,
        glintSize: Math.random() * 0.18 + 0.18,
      });
    }

    // Start background render loop
    let lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const renderLoop = (time) => {
      if (this.isClosing) return;
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;
      this.renderCanvas(dt);
      if (this.inTransition) {
        this.renderBubbleCanvas(dt);
      }
      this.animFrameId = requestAnimationFrame(renderLoop);
    };
    this.animFrameId = requestAnimationFrame(renderLoop);
  }

  renderBubbleCanvas(dt) {
    const ctx = this.bubbleCtx;
    if (!ctx || !this.bubbleCanvas) return;
    const w = this.bubbleCanvas.width || 1280;
    const h = this.bubbleCanvas.height || 720;
    this.bubbleTime += dt;
    const t = this.bubbleTime;

    ctx.clearRect(0, 0, w, h);

    // Deep ethereal oceanic wash with iridescent caustics
    try {
      const wash = ctx.createLinearGradient(0, 0, 0, h);
      wash.addColorStop(0, 'rgba(2, 6, 23, 0.94)');
      wash.addColorStop(0.4, 'rgba(15, 23, 42, 0.88)');
      wash.addColorStop(0.8, 'rgba(49, 46, 129, 0.85)');
      wash.addColorStop(1, 'rgba(2, 6, 23, 0.96)');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);
    } catch (_) {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
      ctx.fillRect(0, 0, w, h);
    }

    // Undulating rainbow caustic light ribbons
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let c = 0; c < 3; c++) {
      const cy = h * (0.28 + c * 0.22) + Math.sin(t * 1.4 + c * 1.8) * 32;
      const cHue = (t * 50 + c * 105) % 360;
      try {
        const cGrad = ctx.createLinearGradient(0, cy - 60, 0, cy + 60);
        cGrad.addColorStop(0, `hsla(${cHue}, 100%, 75%, 0)`);
        cGrad.addColorStop(0.5, `hsla(${(cHue + 60) % 360}, 95%, 70%, 0.15)`);
        cGrad.addColorStop(1, `hsla(${(cHue + 120) % 360}, 100%, 75%, 0)`);
        ctx.fillStyle = cGrad;
        ctx.fillRect(0, cy - 60, w, 120);
      } catch (_) {}
    }
    ctx.restore();

    // Rising iridescent rainbow bubbles
    for (const b of this.bubbles) {
      b.y -= b.speedY * dt;
      b.x = b.baseX + Math.sin(t * b.wobbleSpeed + b.wobbleOffset) * b.wobbleAmp;
      if (b.y < -45) {
        b.y = h + 45;
        b.baseX = Math.random() * w;
      }

      const hue = (b.hue + t * 40) % 360;
      ctx.save();

      // Translucent rainbow sphere body
      try {
        const bGrad = ctx.createRadialGradient(
          b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.08,
          b.x, b.y, b.radius
        );
        bGrad.addColorStop(0, `hsla(${hue}, 100%, 95%, 0.75)`);
        bGrad.addColorStop(0.35, `hsla(${(hue + 55) % 360}, 95%, 80%, 0.32)`);
        bGrad.addColorStop(0.72, `hsla(${(hue + 130) % 360}, 90%, 72%, 0.45)`);
        bGrad.addColorStop(1, `hsla(${(hue + 210) % 360}, 100%, 85%, 0.85)`);
        ctx.fillStyle = bGrad;
      } catch (_) {
        ctx.fillStyle = `hsla(${hue}, 90%, 80%, 0.6)`;
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing rainbow contour rim
      ctx.strokeStyle = `hsla(${hue}, 100%, 88%, 0.85)`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Specular starlight glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, Math.max(1.5, b.radius * b.glintSize), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  renderCanvas(dt) {
    const ctx = this.ctx;
    if (!ctx || !this.canvas) return;
    const w = this.canvas.width || 1280;
    const h = this.canvas.height || 720;
    this.auroraTime += dt;

    // Deep void cosmic gradient
    try {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.42, '#090d26');
      grad.addColorStop(0.78, '#1b1038');
      grad.addColorStop(1, '#030712');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } catch (_) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);
    }

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
      try {
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
      } catch (_) {}
    }
    ctx.restore();

    // Drifting glowing stars & abyssal motes
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
    try {
      const wGrad = ctx.createLinearGradient(-110, -20, 120, 20);
      wGrad.addColorStop(0, '#0284c7');
      wGrad.addColorStop(0.5, '#38bdf8');
      wGrad.addColorStop(1, '#c084fc');
      ctx.fillStyle = wGrad;
    } catch (_) {
      ctx.fillStyle = '#0284c7';
    }
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
    // Stage 1: Display aesthetic underwater rainbow bubble transition
    // Automatically smoothly dissolves after 3.6s, or earlier on user tap
    this.addTimer(() => {
      this.finishTransition();
    }, 3600);
  }

  startPoemPacing() {
    const s1 = this.container?.querySelector('#stanza-1');
    const s2 = this.container?.querySelector('#stanza-2');
    const s3 = this.container?.querySelector('#stanza-3');
    const author = this.container?.querySelector('#endgame-author');
    const nextBtn = this.container?.querySelector('#endgame-next-btn');

    // Stanza 1 after 200ms
    this.addTimer(() => {
      s1?.classList?.add?.('active');
    }, 200);

    // Stanza 2 after 2600ms
    this.addTimer(() => {
      s2?.classList?.add?.('active');
    }, 2600);

    // Stanza 3 after 5200ms
    this.addTimer(() => {
      s3?.classList?.add?.('active');
    }, 5200);

    // Author & Next Button after 7500ms
    this.addTimer(() => {
      author?.classList?.add?.('active');
      nextBtn?.classList?.add?.('active');
    }, 7500);
  }

  advancePoemPacing() {
    if (this.inTransition) {
      this.finishTransition();
      return;
    }

    const s1 = this.container?.querySelector('#stanza-1');
    const s2 = this.container?.querySelector('#stanza-2');
    const s3 = this.container?.querySelector('#stanza-3');
    const author = this.container?.querySelector('#endgame-author');
    const nextBtn = this.container?.querySelector('#endgame-next-btn');

    if (!s1?.classList?.contains?.('active')) {
      s1?.classList?.add?.('active');
    } else if (!s2?.classList?.contains?.('active')) {
      s2?.classList?.add?.('active');
    } else if (!s3?.classList?.contains?.('active')) {
      s3?.classList?.add?.('active');
    } else {
      author?.classList?.add?.('active');
      nextBtn?.classList?.add?.('active');
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

    if (this._windowResizeHandler && typeof window !== 'undefined') {
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
      this.container?.classList?.remove?.('visible');
      const closeTimer = setTimeout(() => {
        try {
          if (typeof this.container?.remove === 'function') {
            this.container.remove();
          }
        } catch (_) {}
        this.container = null;
        if (typeof this.onCompleteCallback === 'function') {
          const cb = this.onCompleteCallback;
          this.onCompleteCallback = null;
          cb();
        }
      }, 800);
      this.timers.push(closeTimer);
    } else {
      if (typeof this.onCompleteCallback === 'function') {
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = null;
        cb();
      }
    }
  }
}

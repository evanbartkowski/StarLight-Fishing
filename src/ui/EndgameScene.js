import { soundManager } from '../audio/SoundManager.js';

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
    this.initCanvas();
    this.startSequence();
  }

  createDom() {
    this.container = document.createElement('div');
    this.container.id = 'endgame-scene-overlay';
    this.container.className = 'endgame-scene-overlay';

    this.container.innerHTML = `
      <canvas id="endgame-canvas" class="endgame-canvas"></canvas>
      <button type="button" id="endgame-skip-btn" class="endgame-skip-btn" title="Skip to surface">Skip ⏭</button>
      
      <div class="endgame-scroll-wrapper" id="endgame-scroll-wrapper">
        <div class="endgame-prelude-badge" id="endgame-prelude">
          <span>🌌</span> <span>Realm VII · Eldritch Chrono Void</span>
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
          <h2 class="endgame-title">STARLIGHT FISHING</h2>
          <div class="endgame-subtitle">The Seven Seas · Abyss Epilogue</div>

          <div class="endgame-credit-item">
            <div class="endgame-credit-role">Created & Developed By</div>
            <div class="endgame-credit-name">Evan Bartkowski</div>
          </div>

          <div class="endgame-credit-item">
            <div class="endgame-credit-role">Game Design & Programming</div>
            <div class="endgame-credit-name">Evan Bartkowski</div>
          </div>

          <div class="endgame-credit-item">
            <div class="endgame-credit-role">Original Music & Sound Direction</div>
            <div class="endgame-credit-name">Evan Bartkowski</div>
          </div>

          <div class="endgame-credit-item">
            <div class="endgame-credit-role">Special Thanks</div>
            <div class="endgame-credit-name" style="font-size: 0.95rem; color: #cbd5e1; max-width: 500px; margin: 0 auto; line-height: 1.5;">
              To tonyanth, randomusername, and every mariner who cast their line into the eternal tides.
            </div>
          </div>
        </div>

        <button type="button" class="endgame-finish-btn" id="endgame-finish-btn">
          ⚓ Return to Surface & Continue Journey
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

    // Generate cosmic abyss stars
    this.stars = [];
    const starCount = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 6000));
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.8 + 0.6,
        color: ['#ffffff', '#bae6fd', '#c7d2fe', '#fef08a', '#e9d5ff'][Math.floor(Math.random() * 5)],
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftY: -(Math.random() * 12 + 4), // drift upward gently like bioluminescent marine snow
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
    grad.addColorStop(0.45, '#0b0f29');
    grad.addColorStop(0.85, '#1e1035');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Flowing ethereal aurora wave in the abyss
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let a = 0; a < 2; a++) {
      ctx.beginPath();
      const waveY = h * (0.4 + a * 0.25);
      ctx.moveTo(0, waveY);
      for (let x = 0; x <= w; x += 30) {
        const y = waveY + Math.sin(x * 0.003 + this.auroraTime * 0.6 + a) * 45 + Math.cos(x * 0.006 - this.auroraTime * 0.4) * 25;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const auroraGrad = ctx.createLinearGradient(0, waveY - 50, 0, waveY + 120);
      auroraGrad.addColorStop(0, a === 0 ? 'rgba(56, 189, 248, 0.08)' : 'rgba(168, 85, 247, 0.06)');
      auroraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auroraGrad;
      ctx.fill();
    }
    ctx.restore();

    // Drifting glowing stars & abyssal motes
    for (const star of this.stars) {
      star.y += star.driftY * dt;
      star.x += star.driftX * dt;
      if (star.y < -10) star.y = h + 10;
      if (star.x < -10) star.x = w + 10;
      if (star.x > w + 10) star.x = -10;

      const alpha = 0.35 + 0.55 * Math.sin(this.auroraTime * star.twinkleSpeed + star.twinkleOffset);
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = star.color;
      ctx.shadowColor = star.color;
      ctx.shadowBlur = star.radius > 1.4 ? 8 : 4;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Distant cosmic space-whale silhouette drifting across deep background
    const whaleSpeed = 22;
    const whaleX = ((this.auroraTime * whaleSpeed) % (w + 400)) - 200;
    const whaleY = h * 0.72 + Math.sin(this.auroraTime * 0.3) * 15;
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.ellipse(whaleX, whaleY, 110, 28, 0.08, 0, Math.PI * 2);
    ctx.fill();
    // Tail fluke
    ctx.beginPath();
    ctx.moveTo(whaleX - 95, whaleY);
    ctx.lineTo(whaleX - 130, whaleY - 22);
    ctx.lineTo(whaleX - 120, whaleY);
    ctx.lineTo(whaleX - 130, whaleY + 22);
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

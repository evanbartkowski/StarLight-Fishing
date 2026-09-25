export class ParticleSystem {
  constructor() {
    this.bubbles = [];
    this.splashes = [];
    this.sparkles = [];
    this.floatingTexts = [];
    this.screenShake = 0; // 0 to 1 trauma
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  // Add trauma for camera shake (0.0 to 1.0)
  addTrauma(amount) {
    this.screenShake = Math.min(1.0, this.screenShake + amount);
  }

  emitBubbles(x, y, count = 3, spread = 8) {
    for (let i = 0; i < count; i++) {
      this.bubbles.push({
        x: x + (Math.random() * 2 - 1) * spread,
        y: y + (Math.random() * 2 - 1) * spread,
        vx: (Math.random() * 2 - 1) * 0.4,
        vy: -(0.8 + Math.random() * 1.5),
        radius: 1.5 + Math.random() * 3.5,
        alpha: 0.6 + Math.random() * 0.4,
        wobble: Math.random() * Math.PI * 2,
        life: 1.0,
        decay: 0.005 + Math.random() * 0.008,
      });
    }
  }

  emitSplash(x, y, count = 20, intensity = 1.0) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.1;
      const speed = (2.5 + Math.random() * 5.0) * intensity;
      this.splashes.push({
        x: x + (Math.random() * 2 - 1) * 6,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.22,
        radius: 2 + Math.random() * 3,
        alpha: 0.9,
        decay: 0.025 + Math.random() * 0.02,
        color: '#e0f2fe',
      });
    }
  }

  emitSparkles(x, y, count = 12, color = '#fef08a') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.0;
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        decay: 0.03 + Math.random() * 0.02,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() * 2 - 1) * 0.15,
      });
    }
  }

  addFloatingText(text, x, y, color = '#ffffff', fontSize = 16, glowColor = null) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -1.2,
      alpha: 1.0,
      decay: 0.015,
      color,
      fontSize,
      glowColor,
    });
  }

  update(dt, surfaceY = 0) {
    const deltaSec = dt / 1000;

    // Screen shake decay (trauma squared)
    if (this.screenShake > 0.001) {
      const shakePower = this.screenShake * this.screenShake;
      const maxOffset = 18;
      this.shakeOffsetX = (Math.random() * 2 - 1) * maxOffset * shakePower;
      this.shakeOffsetY = (Math.random() * 2 - 1) * maxOffset * shakePower;
      this.screenShake = Math.max(0, this.screenShake - 1.8 * deltaSec);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.screenShake = 0;
    }

    // Bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.wobble += 0.08;
      b.x += b.vx + Math.sin(b.wobble) * 0.4;
      b.y += b.vy;
      b.life -= b.decay;
      // Pop at water surface
      if (b.y <= surfaceY || b.life <= 0) {
        this.bubbles.splice(i, 1);
      }
    }

    // Splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += s.gravity;
      s.alpha -= s.decay;
      if (s.alpha <= 0) {
        this.splashes.splice(i, 1);
      }
    }

    // Sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const sp = this.sparkles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vx *= 0.94;
      sp.vy *= 0.94;
      sp.rot += sp.rotSpeed;
      sp.alpha -= sp.decay;
      if (sp.alpha <= 0) {
        this.sparkles.splice(i, 1);
      }
    }

    // Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= ft.decay;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  render(ctx, cameraY = 0) {
    // Render Bubbles
    ctx.save();
    for (const b of this.bubbles) {
      const drawY = b.y - cameraY;
      ctx.beginPath();
      ctx.arc(b.x, drawY, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 242, 254, ${b.alpha * 0.4})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.75})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Bubble highlight dot
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.35, drawY - b.radius * 0.35, b.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.9})`;
      ctx.fill();
    }
    ctx.restore();

    // Render Splashes
    ctx.save();
    for (const s of this.splashes) {
      const drawY = s.y - cameraY;
      ctx.beginPath();
      ctx.arc(s.x, drawY, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 242, 254, ${s.alpha})`;
      ctx.fill();
    }
    ctx.restore();

    // Render Sparkles
    ctx.save();
    for (const sp of this.sparkles) {
      const drawY = sp.y - cameraY;
      ctx.save();
      ctx.translate(sp.x, drawY);
      ctx.rotate(sp.rot);
      ctx.globalAlpha = Math.max(0, sp.alpha);
      ctx.fillStyle = sp.color;

      // 4-point sparkle star
      const sz = sp.size;
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.lineTo(sz * 0.25, -sz * 0.25);
      ctx.lineTo(sz, 0);
      ctx.lineTo(sz * 0.25, sz * 0.25);
      ctx.lineTo(0, sz);
      ctx.lineTo(-sz * 0.25, sz * 0.25);
      ctx.lineTo(-sz, 0);
      ctx.lineTo(-sz * 0.25, -sz * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Render Floating Text
    ctx.save();
    for (const ft of this.floatingTexts) {
      const drawY = ft.y - cameraY;
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${ft.fontSize}px 'Outfit', 'Segoe UI', sans-serif`;
      ctx.textAlign = 'center';

      if (ft.glowColor) {
        ctx.shadowColor = ft.glowColor;
        ctx.shadowBlur = 10;
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(ft.text, ft.x, drawY);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, drawY);
      ctx.restore();
    }
    ctx.restore();
  }
}

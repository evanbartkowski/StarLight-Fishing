// Powerup.js — Rare collectible power-ups (gold/cyan glow) and curses (pulsing red aura).

export const POWERUP_TYPES = [
  { id: 'overdrive', name: 'Reel Overdrive', isPositive: true, color: '#38bdf8', glow: '#0284c7', icon: '⚡', duration: 6, desc: '+100% reeling speed' },
  { id: 'magnet', name: 'Magnetic Lure', isPositive: true, color: '#fbbf24', glow: '#d97706', icon: '🧲', duration: 8, desc: 'Pulls nearby fish to the hook' },
  { id: 'capacity_boost', name: 'Basket Infusion', isPositive: true, color: '#22c55e', glow: '#16a34a', icon: '🎒', duration: 0, desc: '+2 hook capacity this dive' },
  { id: 'weight_trap', name: 'Abyssal Sinker Curse', isPositive: false, color: '#ef4444', glow: '#b91c1c', icon: '⚓', duration: 4.5, desc: 'Heavy drag stalls the reel' },
  { id: 'tension_spike', name: 'Turbulence Snare', isPositive: false, color: '#dc2626', glow: '#991b1b', icon: '⚠️', duration: 0, desc: 'Violent current shoves the line' },
  { id: 'fish_scare', name: 'Phantom Tremor', isPositive: false, color: '#f87171', glow: '#7f1d1d', icon: '💀', duration: 0, desc: 'Nearby fish scatter' },
];

export class Powerup {
  constructor(config, x, y) {
    Object.assign(this, { type: config.id, name: config.name, isPositive: config.isPositive, color: config.color, glow: config.glow, icon: config.icon, duration: config.duration, desc: config.desc, x, y });
    this.radius = 18;
    this.timer = Math.random() * Math.PI * 2;
    this.state = 'ACTIVE';
    this.driftX = (Math.random() * 2 - 1) * 0.3;
  }

  update(dt, worldWidth) {
    if (this.state !== 'ACTIVE') return;
    const deltaSec = dt / 1000;
    this.timer += 2.5 * deltaSec;
    this.x = Math.max(30, Math.min(worldWidth - 30, this.x + this.driftX * 20 * deltaSec));
    this.y += Math.sin(this.timer) * 0.4;
  }

  /** Applies the buff/curse to the hook. Returns true on first collection. */
  collect(hook, particles, soundManager, oceanWorld) {
    if (this.state !== 'ACTIVE') return false;
    this.state = 'COLLECTED';
    if (this.isPositive) {
      soundManager?.playRareChime?.();
      particles?.emitSparkles(this.x, this.y, 25, this.glow);
      particles?.addFloatingText(`✨ ${this.name.toUpperCase()}: ${this.desc}`, this.x, this.y - 25, this.color, 16, this.glow);
      if (this.type === 'overdrive') hook.overdriveTimer = Math.max(hook.overdriveTimer || 0, this.duration);
      if (this.type === 'magnet') hook.magnetTimer = Math.max(hook.magnetTimer || 0, this.duration);
      if (this.type === 'capacity_boost') hook.capacityBoost = (hook.capacityBoost || 0) + 2;
    } else {
      soundManager?.playHazardShock?.();
      particles?.emitBubbles(this.x, this.y, 16, 20);
      particles?.addFloatingText(`💀 CURSE: ${this.name.toUpperCase()}`, this.x, this.y - 25, '#ef4444', 16, '#7f1d1d');
      particles?.addTrauma?.(0.35);
      if (this.type === 'weight_trap') hook.weightTrapTimer = Math.max(hook.weightTrapTimer || 0, this.duration);
      if (this.type === 'tension_spike') hook.vx = (Math.random() < 0.5 ? -1 : 1) * 260;
      if (this.type === 'fish_scare') {
        for (const fish of oceanWorld?.entities?.fish || []) {
          if (fish.state === 'SWIMMING' && Math.hypot(fish.x - this.x, fish.y - this.y) < 260) {
            fish.direction = fish.x < this.x ? -1 : 1;
            fish.speed = fish.baseSpeed * 2.5;
          }
        }
      }
    }
    return true;
  }

  render(ctx, cameraY = 0) {
    if (this.state !== 'ACTIVE') return;
    ctx.save();
    ctx.translate(this.x, this.y - cameraY);
    // Curses pulse harder so they read as danger
    const pulse = 1 + Math.sin(this.timer * (this.isPositive ? 3 : 5)) * (this.isPositive ? 0.12 : 0.2);
    ctx.scale(pulse, pulse);
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius + 10);
    grad.addColorStop(0, this.color);
    grad.addColorStop(0.6, this.glow);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this.isPositive ? 'rgba(255,255,255,0.85)' : 'rgba(30,10,10,0.85)';
    ctx.strokeStyle = this.color; ctx.lineWidth = 2.5; ctx.shadowColor = this.glow; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, 0, 1);
    ctx.restore();
  }
}


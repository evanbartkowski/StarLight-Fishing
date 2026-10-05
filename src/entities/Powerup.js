// Positive, collectible dive abilities with a bright pickup silhouette.

export const POWERUP_TYPES = [
  { id: 'overdrive', name: 'Reel Overdrive', hint: '2X REEL · 25 SEC', isPositive: true, color: '#38bdf8', glow: '#0284c7', icon: '⚡', duration: 25, desc: '+100% reeling speed for 25 seconds' },
  { id: 'magnet', name: 'Magnetic Lure', hint: 'PULL FISH · 30 SEC', isPositive: true, color: '#fbbf24', glow: '#d97706', icon: '🧲', duration: 30, desc: 'Nearby fish are pulled toward the hook for 30 seconds' },
  { id: 'capacity_boost', name: 'Basket Infusion', hint: '+5 CATCHES', isPositive: true, color: '#22c55e', glow: '#16a34a', icon: '🎒', duration: 0, desc: 'Carry 5 extra catches this dive' },
];

export class Powerup {
  constructor(config, x, y) {
    Object.assign(this, { type: config.id, name: config.name, hint: config.hint, isPositive: config.isPositive, color: config.color, glow: config.glow, icon: config.icon, duration: config.duration, desc: config.desc, x, y });
    this.radius = 21;
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
  collect(hook, particles, soundManager) {
    if (this.state !== 'ACTIVE') return false;
    this.state = 'COLLECTED';
    soundManager?.playRareChime?.();
    particles?.emitSparkles(this.x, this.y, 25, this.glow);
    particles?.addFloatingText(`✨ ${this.name.toUpperCase()}: ${this.desc}`, this.x, this.y - 25, this.color, 16, this.glow);
    if (this.type === 'overdrive') hook.overdriveTimer = Math.max(hook.overdriveTimer || 0, this.duration);
    if (this.type === 'magnet') hook.magnetTimer = Math.max(hook.magnetTimer || 0, this.duration);
    if (this.type === 'capacity_boost') hook.capacityBoost = (hook.capacityBoost || 0) + 5;
    return true;
  }

  render(ctx, cameraY = 0) {
    if (this.state !== 'ACTIVE') return;
    ctx.save();
    ctx.translate(this.x, this.y - cameraY);
    const pulse = 1 + Math.sin(this.timer * 2.4) * .08;
    ctx.scale(pulse, pulse);
    ctx.save(); ctx.rotate(this.timer * .22);
    ctx.strokeStyle = this.glow; ctx.globalAlpha = .72; ctx.lineWidth = 2;
    ctx.setLineDash([5, 7]);
    ctx.beginPath(); ctx.arc(0, 0, this.radius + 11, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
    ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const labelWidth = Math.max(78, Math.min(150, ctx.measureText(this.name).width + 18));
    ctx.fillStyle = 'rgba(5, 22, 35, .94)'; ctx.strokeStyle = this.glow; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.roundRect(-labelWidth / 2, -this.radius - 35, labelWidth, 28, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f8fafc'; ctx.fillText(this.name.toUpperCase(), 0, -this.radius - 26);
    ctx.fillStyle = this.color; ctx.font = 'bold 7px sans-serif'; ctx.fillText(this.hint, 0, -this.radius - 16);
    const grad = ctx.createRadialGradient(-5, -7, 2, 0, 0, this.radius + 8);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(.2, this.color);
    grad.addColorStop(.78, this.glow);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, this.radius + 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#073042';
    ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 2.5; ctx.shadowColor = this.glow; ctx.shadowBlur = 16;
    ctx.beginPath();
    for (let point = 0; point < 8; point++) {
      const angle = point * Math.PI / 4 - Math.PI / 2;
      const radius = point % 2 === 0 ? this.radius : this.radius * .76;
      const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
      if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.font = 'bold 19px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, 0, 1);
    ctx.restore();
  }
}


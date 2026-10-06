export function updateAttack(enemy, dt, hook, width) {
  const step = Math.min(dt / 1000, .05);
  enemy.shots ||= [];
  for (let i = enemy.shots.length - 1; i >= 0; i--) {
    const shot = enemy.shots[i]; shot.x += shot.vx * step; shot.y += shot.vy * step; shot.life -= step;
    if (shot.life <= 0 || shot.x < -40 || shot.x > width + 40) enemy.shots.splice(i, 1);
  }
  if (!enemy.behavior.attack) return false;
  enemy.attackCooldown = Math.max(0, (enemy.attackCooldown ?? 1.5) - step);
  const active = hook && ['DESCENDING', 'REELING'].includes(hook.state);
  if (!enemy.attackState && active && !enemy.attackCooldown && Math.hypot(hook.x - enemy.x, hook.y - enemy.y) < 450) {
    const leadX = (hook.vx || 0) * 0.2;
    const leadY = (hook.vy || 0) * 0.2;
    const dx = (hook.x + leadX) - enemy.x, dy = (hook.y + leadY) - enemy.y;
    const length = Math.hypot(dx, dy) || 1;
    let x = dx / length, y = dy / length;
    if (enemy.behavior.attack === 'shoot') {
      const direction = Math.sign(dx) || enemy.facing || 1;
      const angle = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, Math.atan2(dy, Math.abs(dx))));
      x = direction * Math.cos(angle);
      y = Math.sin(angle);
    }
    enemy.attackState = { x, y, warning: .45, remaining: .75 };
  }
  const attack = enemy.attackState;
  if (!attack) return true;
  if (!active) { enemy.attackState = null; enemy.attackCooldown = 2; return true; }
  if (attack.warning > 0) {
    attack.warning -= step;
    return true;
  }
  enemy.facing = attack.x < 0 ? -1 : 1;
  if (enemy.behavior.attack === 'shoot') {
    if (enemy.shots.length < 2) enemy.shots.push({ x: enemy.x, y: enemy.y, vx: attack.x * 480, vy: attack.y * 480, life: 2.5 });
    enemy.attackState = null; enemy.attackCooldown = 3.2;
  } else {
    // High-speed committed charge along committed vector
    const totalDuration = 0.75;
    const elapsed = totalDuration - attack.remaining;
    // Speed curve: explosive acceleration up front, overshooting past hook, followed by compensatory braking glide
    const speedMultiplier = elapsed < 0.35 ? 1.35 : elapsed < 0.58 ? 0.95 : 0.55;
    const currentSpeed = 520 * speedMultiplier;

    enemy.x += attack.x * currentSpeed * step;
    enemy.y += attack.y * currentSpeed * step;

    // Banking pitch angle during charge
    enemy.swimAngle = Math.atan2(attack.y, Math.abs(attack.x)) * 0.8;

    enemy.x = Math.max(20, Math.min(width - 20, enemy.x));
    enemy.y = Math.max(enemy.minY || 0, Math.min(enemy.maxY || Infinity, enemy.y));
    attack.remaining -= step;
    if (attack.remaining <= 0) {
      enemy.attackState = null;
      enemy.attackCooldown = 2.6;
      enemy.restTime = 1.5;
      // Re-orient facing toward active hook to resume tracking
      if (active && Math.abs(hook.x - enemy.x) > 1) {
        enemy.facing = Math.sign(hook.x - enemy.x);
      }
    }
  }
  return true;
}

export function drawAttack(ctx, enemy, cameraY, height = 2000) {
  if (!enemy.attackState && !enemy.shots?.length) return;
  ctx.save();
  ctx.globalAlpha = 1;

  // Cavitation wake and bubble trail during high-speed dash
  if (enemy.attackState && enemy.behavior.attack === 'dash' && enemy.attackState.warning <= 0) {
    const drawY = enemy.y - cameraY;
    const r = enemy.radius || 24;
    const trailLen = r * 1.6;
    const dir = enemy.facing || 1;

    try {
      const grad = ctx.createLinearGradient(enemy.x - dir * trailLen, drawY, enemy.x, drawY);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.65, 'rgba(186, 230, 253, 0.45)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.7)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(2, r * 0.22);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(enemy.x - dir * trailLen, drawY);
      ctx.lineTo(enemy.x, drawY);
      ctx.stroke();

      // Aquatic cavitation bubbles
      ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
      for (let b = 0; b < 3; b++) {
        const bx = enemy.x - dir * (r * 0.4 + b * 12);
        const by = drawY + Math.sin(enemy.timer * 6 + b) * 5;
        ctx.beginPath();
        ctx.arc(bx, by, 1.8 + b * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } catch (e) {}
  }
  for (const shot of enemy.shots || []) {
    const y = shot.y - cameraY; if (y < -15 || y > height + 15) continue;
    ctx.fillStyle = enemy.glow || '#67e8f9'; ctx.shadowColor = enemy.glow || '#67e8f9'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(shot.x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ecfeff'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(shot.x - 1, y - 1, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

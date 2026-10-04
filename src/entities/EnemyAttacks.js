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
  if (!enemy.attackState && active && !enemy.attackCooldown && Math.hypot(hook.x - enemy.x, hook.y - enemy.y) < 400) {
    const dx = hook.x - enemy.x, dy = hook.y - enemy.y;
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
  if (attack.warning > 0) { attack.warning -= step; return true; }
  enemy.facing = attack.x < 0 ? -1 : 1;
  if (enemy.behavior.attack === 'shoot') {
    if (enemy.shots.length < 2) enemy.shots.push({ x: enemy.x, y: enemy.y, vx: attack.x * 440, vy: attack.y * 440, life: 2.5 });
    enemy.attackState = null; enemy.attackCooldown = 3.5;
  } else {
    enemy.x += attack.x * 480 * step; enemy.y += attack.y * 480 * step;
    enemy.x = Math.max(20, Math.min(width - 20, enemy.x));
    enemy.y = Math.max(enemy.minY || 0, Math.min(enemy.maxY || Infinity, enemy.y));
    attack.remaining -= step;
    if (attack.remaining <= 0) { enemy.attackState = null; enemy.attackCooldown = 3; enemy.restTime = 2; }
  }
  return true;
}

export function drawAttack(ctx, enemy, cameraY, height = 2000) {
  if (!enemy.attackState && !enemy.shots?.length) return;
  ctx.save();
  ctx.globalAlpha = 1;
  for (const shot of enemy.shots || []) {
    const y = shot.y - cameraY; if (y < -15 || y > height + 15) continue;
    ctx.fillStyle = enemy.glow || '#67e8f9'; ctx.shadowColor = enemy.glow || '#67e8f9'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(shot.x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ecfeff'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(shot.x - 1, y - 1, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

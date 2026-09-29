export function drawMarineThreat(ctx, threat) {
  const r = threat.radius / threat.sizeScale;
  const t = threat.timer;
  ctx.save();
  if (threat.marineKind !== 'jelly') ctx.scale(threat.facing || 1, 1);
  const body = ctx.createLinearGradient(0, -r, 0, r);
  body.addColorStop(0, threat.color);
  body.addColorStop(0.6, '#243c59');
  body.addColorStop(1, '#bacbd7');
  ctx.fillStyle = body;
  ctx.strokeStyle = threat.glow;
  ctx.lineWidth = 2;
  if (threat.marineKind === 'jelly') {
    for (let i = 0; i < 6; i++) {
      const x = (i - 2.5) * r * 0.22;
      ctx.beginPath(); ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + Math.sin(t + i) * 12, r * .3, x - 10, r * .6, x + Math.sin(t * .7 + i) * 9, r * .9);
      ctx.stroke();
    }
    ctx.globalAlpha *= .85;
    ctx.beginPath(); ctx.ellipse(0, -r * .2, r * .75, r * .55, 0, Math.PI, Math.PI * 2);
    ctx.quadraticCurveTo(0, r * .15, -r * .75, -r * .2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath(); ctx.ellipse(-r * .2, -r * .45, r * .18, r * .09, -.4, 0, Math.PI * 2); ctx.fill();
  } else if (threat.marineKind === 'crab') {
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo((i - 1.5) * r * .28, side * r * .2);
      ctx.lineTo((i - 1.5) * r * .5, side * r * (.6 + Math.sin(t + i) * .1));
      ctx.lineTo((i - 1.5) * r * .7, side * r * .8); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(0, 0, r * .65, r * .42, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(r * .3, side * r * .2); ctx.lineTo(r * .9, side * r * .5); ctx.stroke();
      ctx.beginPath(); ctx.arc(r * .9, side * r * .5, r * .22, .4, Math.PI * 1.8); ctx.lineTo(r * .9, side * r * .5); ctx.fill(); ctx.stroke();
    }
  } else if (threat.marineKind === 'nautilus') {
    ctx.beginPath(); ctx.arc(0, 0, r * .65, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 100; i++) { const angle = i * .16, radius = i / 100 * r * .55; ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius); }
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo(r * .4, r * .3); ctx.quadraticCurveTo(r, (i - 2) * r * .2, r * 1.1 + Math.sin(t + i) * 6, (i - 2) * r * .2); ctx.stroke();
    }
  } else if (threat.marineKind === 'lionfish') {
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI * 2 / 12;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r * .8); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(0, 0, r * .65, r * .3, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * r * .2, -r * .25); ctx.lineTo((i - .4) * r * .2, r * .25); ctx.stroke(); }
  } else if (threat.marineKind === 'ray') {
    ctx.beginPath(); ctx.moveTo(r * .75, 0);
    ctx.quadraticCurveTo(0, -r * .3, -r * .5, -r * (.8 + Math.sin(t) * .1));
    ctx.quadraticCurveTo(-r * .2, 0, -r * .8, 0);
    ctx.quadraticCurveTo(-r * .2, 0, -r * .5, r * (.8 + Math.sin(t) * .1));
    ctx.quadraticCurveTo(0, r * .3, r * .75, 0); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * .5, 0); ctx.quadraticCurveTo(-r, r * .2, -r * 1.3, Math.sin(t) * 10); ctx.stroke();
  } else if (threat.marineKind === 'monster' || threat.marineKind === 'eel') {
    const monster = threat.marineKind === 'monster';
    ctx.strokeStyle = body; ctx.lineWidth = r * (monster ? .38 : .24); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(r * .45, 0);
    ctx.bezierCurveTo(-r * .15, -r * .6, -r * .2, r * .7, -r * .9, Math.sin(t) * r * .2); ctx.stroke();
    if (monster && threat.behavior.monsterForm === 'kraken') {
      ctx.lineWidth = 3; ctx.strokeStyle = threat.color;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(r * .35, r * .1);
        ctx.quadraticCurveTo((i - 2) * r * .3, r * .4, (i - 3) * r * .22 + Math.sin(t + i) * 9, r * .7); ctx.stroke();
      }
    }
    if (monster) {
      ctx.fillStyle = threat.glow;
      for (let i = 0; i < 4; i++) {
        const x = -r * .6 + i * r * .23;
        ctx.beginPath(); ctx.moveTo(x, -r * .12); ctx.lineTo(x - r * .12, -r * .48); ctx.lineTo(x + r * .15, -r * .1); ctx.fill();
      }
      if (threat.behavior.monsterForm === 'dragon') {
        for (const side of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r * .7, side * r * .8);
          ctx.quadraticCurveTo(-r * .05, side * r * .4, r * .3, side * r * .55); ctx.closePath(); ctx.fill();
        }
      }
    }
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(r * .48, 0, r * .38, r * .24, 0, 0, Math.PI * 2); ctx.fill();
    if (monster && threat.behavior.monsterForm === 'maw') {
      ctx.fillStyle = '#130f25'; ctx.beginPath(); ctx.ellipse(r * .65, r * .04, r * .24, r * .2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fef3c7';
      for (let i = 0; i < 4; i++) {
        const x = r * (.46 + i * .1);
        ctx.beginPath(); ctx.moveTo(x, -r * .12); ctx.lineTo(x + r * .04, r * .02); ctx.lineTo(x + r * .07, -r * .12); ctx.fill();
      }
    }
  } else {
    ctx.beginPath(); ctx.moveTo(r * .95, 0);
    ctx.quadraticCurveTo(r * .3, -r * .5, -r * .55, -r * .12);
    ctx.lineTo(-r * .95, -r * .46); ctx.lineTo(-r * .8, 0); ctx.lineTo(-r * .95, r * .4);
    ctx.lineTo(-r * .55, r * .1); ctx.quadraticCurveTo(r * .3, r * .4, r * .95, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-r * .2, -r * .18); ctx.lineTo(-r * .05, -r * .65); ctx.lineTo(r * .25, -r * .18); ctx.fill();
    ctx.beginPath(); ctx.moveTo(r * .05, r * .12); ctx.lineTo(-r * .25, r * .55); ctx.lineTo(r * .35, r * .18); ctx.fill();
    ctx.strokeStyle = '#14283b'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(r * (.15 + i * .09), -r * .13); ctx.lineTo(r * (.1 + i * .09), r * .1); ctx.stroke(); }
  }
  if (threat.marineKind !== 'jelly') {
    ctx.fillStyle = '#fff2b2'; ctx.beginPath(); ctx.arc(r * .57, -r * .1, Math.max(2, r * .06), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#091323'; ctx.beginPath(); ctx.arc(r * .59, -r * .1, Math.max(1, r * .025), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#091323'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(r * .58, r * .12); ctx.lineTo(r * .83, r * .05); ctx.stroke();
  }
  ctx.restore();
}

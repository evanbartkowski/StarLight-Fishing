// The shadow is measured in world pixels, independently of the tiny body scale.
export const PIP_PROJECTION_EXTENT = 430;
export function drawPipProjection(ctx, fish, hook) {
  const close = hook && Math.hypot(hook.x-fish.x, hook.y-fish.y) <= 82;
  if (close || fish.state === 'HOOKED') fish._revealedSmall = true;
  if (!hook || fish._revealedSmall || fish.isAquarium || fish._inTank) return false;
  const t = fish.wiggleTimer || 0, wave = Math.sin(t*.65)*15;
  ctx.save();
  try {
    ctx.save();ctx.scale(1,.43);
    const fog = ctx.createRadialGradient(0, 0, 25, 0, 0, 420);
    fog.addColorStop(0,'#06131c77');fog.addColorStop(.65,'#07172244');fog.addColorStop(1,'#06131c00');
    ctx.fillStyle=fog;ctx.beginPath();ctx.arc(0,0,420,0,Math.PI*2);ctx.fill();ctx.restore();
    // Asymmetric maw, spinal sails and a curling tail hide the minnow's position.
    ctx.fillStyle='#06131f';ctx.beginPath();ctx.moveTo(288,-25);
    ctx.bezierCurveTo(228,-93,105,-112,-24,-70);
    ctx.lineTo(-78,-139);ctx.lineTo(-100,-65);ctx.lineTo(-147,-114);ctx.lineTo(-160,-48);
    ctx.bezierCurveTo(-230,-27,-288,-48,-329,-94+wave);
    ctx.bezierCurveTo(-344,-42,-347,-8,-310,17);
    ctx.bezierCurveTo(-352,50,-367,76,-381,115+wave);
    ctx.bezierCurveTo(-275,69,-241,81,-192,40);
    ctx.bezierCurveTo(-99,111,15,97,94,73);ctx.lineTo(166,124);ctx.lineTo(147,54);
    ctx.bezierCurveTo(212,56,254,51,279,22);ctx.lineTo(209,2);ctx.lineTo(253,-3);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#25414b';ctx.lineWidth=3;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(151-i*20,-42);ctx.quadraticCurveTo(125-i*20,-2,144-i*20,30);ctx.stroke();}
    ctx.fillStyle='#456271';
    for(let i=0;i<10;i++){const x=217+i*6;ctx.beginPath();ctx.moveTo(x,-8+i*.65);ctx.lineTo(x-4,7+(i%3)*5);ctx.lineTo(x+5,-6+i*.6);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#0c202b';ctx.beginPath();ctx.moveTo(-86,-35);ctx.bezierCurveTo(-29,-66,53,-55,88,-28);ctx.bezierCurveTo(3,-42,-30,-12,-86,-35);ctx.fill();
    ctx.fillStyle='#b23b3b';ctx.beginPath();ctx.ellipse(209,-34,11,3,-.15,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f0a166';ctx.beginPath();ctx.ellipse(212,-34,2,2,0,0,Math.PI*2);ctx.fill();
    return true;
  } finally { ctx.restore(); }
}

// Original side-view anatomy for the first realm. IDs also work in saved previews.
export const SHOALS_FISH_DESIGNS = {
  minnow:'minnow', sardine:'sardine', clownfish:'clown', blue_tang:'tang',
  coral_butterfly:'butterfly', sand_flounder:'flounder', rainbow_parrotfish:'parrot', golden_seahorse:'seahorse',
  realm_1_honeycomb_boxfish:'box', realm_1_sunlit_damselfish:'damsel',
  realm_1_shoals_mandarinfish:'mandarin', realm_1_shoals_blue_tang:'tang',
  realm_1_reef_octopus:'octopus', realm_1_coral_sea_turtle:'turtle',
  realm_1_chambered_nautilus:'nautilus', realm_1_reef_moon_jellyfish:'jelly',
  realm_1_sandbar_guitar_ray:'guitar', easter_misleading_monster:'pip',
};
const tau=Math.PI*2;
function oval(ctx,x,y,rx,ry,fill,stroke=null){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,tau);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function path(ctx,points,fill,stroke='#123948',width=1){ctx.beginPath();points(ctx);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke();}}
function eye(ctx,x,y,r=2.5){oval(ctx,x,y,r,r,'#fff4db','#173341');oval(ctx,x+.6,y,r*.53,r*.69,'#122c39');oval(ctx,x+.7,y-.7,.65,.65,'#fff');}
function body(ctx,l,h){ctx.beginPath();ctx.moveTo(-l,0);ctx.bezierCurveTo(-l*.65,-h*1.34,l*.65,-h*1.25,l,-1);ctx.bezierCurveTo(l*.9,h,l*.05,h*1.4,-l,0);ctx.closePath();}
function tail(ctx,l,h,color,t){path(ctx,c=>{c.moveTo(-l+2,0);c.quadraticCurveTo(-l-7,-h*.3,-l-17,-h*.8+t);c.lineTo(-l-12,t);c.lineTo(-l-17,h*.8+t);c.quadraticCurveTo(-l-6,h*.3,-l+2,0);},color);}
function fan(ctx,x,y,w,h,color){path(ctx,c=>{c.moveTo(x,y);c.quadraticCurveTo(x-w*.7,y+h*1.2,x-w,y+h);c.quadraticCurveTo(x-w*.6,y+h*.15,x,y);},color);ctx.strokeStyle='#f3e7ba77';ctx.lineWidth=.6;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-w*.2*i,y+h*.23*i);ctx.stroke();}}

export function drawShoalsFish(ctx,species,primary,secondary,finColor,time){
 const kind=SHOALS_FISH_DESIGNS[species.id];if(!kind)return false;
 if(typeof primary!=='string')primary=species.primaryColor;
 const wave=Math.sin(time*2)*1.8;ctx.save();
 try{
  ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=1;
  const shade=ctx.createLinearGradient(-5,-20,8,22);shade.addColorStop(0,secondary);shade.addColorStop(.42,primary);shade.addColorStop(1,finColor);
  if(kind==='seahorse'){
   ctx.strokeStyle='#b47a28';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-2,8);ctx.bezierCurveTo(-18,31,18,35,10,19);ctx.bezierCurveTo(5,11,-2,19,4,22);ctx.stroke();
   fan(ctx,-7,0,7,8+wave,'#eeaf4c');path(ctx,c=>{c.moveTo(-5,13);c.bezierCurveTo(-21,2,-10,-12,-4,-18);c.lineTo(-11,-20);c.lineTo(-7,-27);c.lineTo(-2,-23);c.lineTo(4,-24);c.lineTo(9,-17);c.lineTo(20,-14);c.lineTo(20,-9);c.lineTo(8,-10);c.bezierCurveTo(1,-3,11,5,-5,13);},shade,'#895e29');
   ctx.strokeStyle='#fff0b9';ctx.lineWidth=.9;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(-9,-11+i*4);ctx.lineTo(1,-8+i*3);ctx.stroke();}eye(ctx,6,-17,2);return true;
  }
  if(kind==='turtle'){
   for(const side of [-1,1])for(const x of [-14,12])path(ctx,c=>{c.moveTo(x,side*8);c.quadraticCurveTo(x-18,side*35,x+7,side*23);c.quadraticCurveTo(x+13,side*17,x+5,side*8);},finColor);
   oval(ctx,24,-1,9,6,secondary,'#275746');oval(ctx,0,0,24,17,shade,'#244c3c');
   ctx.strokeStyle='#cae4a0';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-11,-10);ctx.lineTo(3,-13);ctx.lineTo(14,-4);ctx.lineTo(11,10);ctx.lineTo(-3,13);ctx.lineTo(-14,4);ctx.closePath();ctx.moveTo(-11,-10);ctx.lineTo(-19,-12);ctx.moveTo(14,-4);ctx.lineTo(23,-6);ctx.moveTo(11,10);ctx.lineTo(16,14);ctx.moveTo(-14,4);ctx.lineTo(-22,7);ctx.moveTo(-3,13);ctx.lineTo(-4,17);ctx.stroke();eye(ctx,28,-3,1.7);return true;
  }
  if(kind==='octopus'){
   for(let i=0;i<8;i++){const y=-9+i*2.6;ctx.strokeStyle=i%2?finColor:primary;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(6,y);ctx.bezierCurveTo(22,y+wave,24+i,y+15-i*3,36+i*.6,y+7-i);ctx.stroke();ctx.fillStyle=secondary;for(let j=0;j<3;j++)oval(ctx,18+j*5,y+3+j*(3-i)*.45,.75,.65,secondary);}
   oval(ctx,-7,-1,19,14,shade,'#6f4c3b');oval(ctx,7,1,9,9,primary,'#6f4c3b');for(let i=0;i<7;i++)oval(ctx,-17+i%3*8,-7+Math.floor(i/3)*6,1.5,.8,finColor);eye(ctx,10,-4,3.1);return true;
  }
  if(kind==='nautilus'){
   oval(ctx,-4,0,22,23,'#f2dcaf','#9c6845');ctx.save();ctx.beginPath();ctx.ellipse(-4,0,21,22,0,0,tau);ctx.clip();
   ctx.strokeStyle='#ac6748';ctx.lineWidth=5;for(let i=0;i<10;i++){const a=i*tau/10;ctx.beginPath();ctx.moveTo(-4+Math.cos(a)*13,Math.sin(a)*13);ctx.lineTo(-4+Math.cos(a+.15)*25,Math.sin(a+.15)*25);ctx.stroke();}ctx.restore();
   ctx.strokeStyle='#8a6c4a';ctx.lineWidth=1.2;ctx.beginPath();for(let a=0;a<Math.PI*5;a+=.2){const r=1+a*1.22,x=-4+Math.cos(a)*r,y=Math.sin(a)*r;if(a===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
   path(ctx,c=>{c.moveTo(9,-15);c.quadraticCurveTo(25,-16,29,0);c.lineTo(14,8);},'#b99b74');for(let i=0;i<8;i++){ctx.strokeStyle=i%2?'#f0d8b8':'#bc9d81';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(20,i-1);ctx.quadraticCurveTo(36+wave,16-i*3,40+i*.5,7-i*2);ctx.stroke();}eye(ctx,23,-1,2.7);return true;
  }
  if(kind==='jelly'){
   for(let i=0;i<7;i++){ctx.strokeStyle=i%2?'#d9c1e7aa':'#93ddd4aa';ctx.lineWidth=i%2?1.3:.8;ctx.beginPath();ctx.moveTo(-16+i*5,5);for(let j=1;j<7;j++)ctx.lineTo(-16+i*5+Math.sin(time+i+j*.8)*3,5+j*(i%2?5:7));ctx.stroke();}
   ctx.globalAlpha*=.83;path(ctx,c=>{c.moveTo(-24,5);c.bezierCurveTo(-24,-30,24,-30,24,5);for(let x=24;x>-24;x-=8)c.quadraticCurveTo(x-4,11,x-8,5);},shade,'#dbd4ef');ctx.globalAlpha/= .83;
   for(const x of [-5,5])for(const y of [-8,0])oval(ctx,x,y,4,5,'#b59ccc88','#eee0ff88');return true;
  }
  if(kind==='guitar'){
   path(ctx,c=>{c.moveTo(33,0);c.quadraticCurveTo(13,-9,-4,-22);c.quadraticCurveTo(-12,-17,-18,-7);c.lineTo(-39,-3+wave);c.lineTo(-43,-11+wave);c.lineTo(-49,-4+wave);c.lineTo(-39,4+wave);c.lineTo(-17,8);c.quadraticCurveTo(-8,22,-4,22);c.quadraticCurveTo(15,8,33,0);},shade,'#405d5b');
   ctx.strokeStyle=secondary;ctx.beginPath();ctx.moveTo(26,0);ctx.lineTo(-27,0);ctx.stroke();for(let i=0;i<9;i++)oval(ctx,-9+i%3*9,-9+Math.floor(i/3)*8,1,.7,'#81745f');eye(ctx,11,-5,1.6);eye(ctx,11,5,1.6);return true;
  }
  let l=23,h=12;
  if(kind==='minnow'||kind==='sardine'){l=26;h=7;}if(kind==='butterfly'||kind==='tang'){l=22;h=19;}if(kind==='flounder'){l=27;h=12;}if(kind==='box'){l=20;h=16;}if(kind==='parrot'){l=29;h=17;}if(kind==='pip'){l=19;h=11;}
  tail(ctx,l,h,finColor,wave);
  fan(ctx,-4,-h*.65,15,-(kind==='butterfly'?12:8)+wave,finColor);fan(ctx,-2,h*.7,10,7+wave,finColor);
  if(kind==='box')path(ctx,c=>{c.moveTo(-20,-8);c.lineTo(-9,-16);c.lineTo(15,-13);c.lineTo(23,-4);c.lineTo(22,8);c.lineTo(9,17);c.lineTo(-18,12);c.closePath();},shade);
  else{body(ctx,l,h);ctx.fillStyle=shade;ctx.fill();ctx.strokeStyle='#173f4c';ctx.stroke();}
  ctx.save();if(kind==='box'){ctx.beginPath();ctx.rect(-18,-12,39,25);}else body(ctx,l,h);ctx.clip();
  if(kind==='clown'){
   for(const x of [-14,0,15]){ctx.strokeStyle='#243447';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x-2,-h-3);ctx.quadraticCurveTo(x+4,0,x-2,h+3);ctx.stroke();ctx.strokeStyle='#fff8e2';ctx.lineWidth=4;ctx.stroke();}
  }else if(kind==='tang'){
   path(ctx,c=>{c.moveTo(-20,-10);c.bezierCurveTo(-8,-18,5,-9,17,-13);c.lineTo(20,-5);c.bezierCurveTo(5,-7,0,3,-12,10);c.lineTo(-18,7);c.bezierCurveTo(-4,1,-2,-7,-20,-10);},'#102e50',null);
   ctx.strokeStyle='#5acde5';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-16,10);ctx.quadraticCurveTo(0,12,11,3);ctx.stroke();
  }else if(kind==='butterfly'){
   ctx.strokeStyle='#f6edbc';ctx.lineWidth=1;for(let x=-16;x<14;x+=5){ctx.beginPath();ctx.moveTo(x,-h);ctx.lineTo(x+9,h);ctx.stroke();}ctx.strokeStyle='#293638';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(13,-h);ctx.lineTo(18,h);ctx.stroke();oval(ctx,-11,-4,6,7,'#f9edbe');oval(ctx,-11,-4,4,5,'#253c4c');
  }else if(kind==='minnow'||kind==='sardine'){
   ctx.strokeStyle='#f1f4df';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-24,0);ctx.quadraticCurveTo(0,2,23,-1);ctx.stroke();if(kind==='sardine')for(let i=0;i<6;i++)oval(ctx,-17+i*5,-2.6,1,.8,'#346478');
  }else if(kind==='mandarin'){
   ctx.lineWidth=2;ctx.strokeStyle='#153f79';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(-15+i*9,Math.sin(i)*4,6,12,-.4,0,tau);ctx.stroke();ctx.strokeStyle='#57d8c5';ctx.lineWidth=1;ctx.stroke();ctx.strokeStyle='#153f79';ctx.lineWidth=2;}
  }else if(kind==='box'){
   ctx.strokeStyle='#a47a32';ctx.lineWidth=.8;for(let row=0;row<3;row++)for(let col=0;col<4;col++){const x=-13+col*8+(row%2)*4,y=-8+row*8;ctx.beginPath();for(let i=0;i<6;i++){const a=i*tau/6;i?ctx.lineTo(x+Math.cos(a)*4.5,y+Math.sin(a)*4.5):ctx.moveTo(x+Math.cos(a)*4.5,y+Math.sin(a)*4.5);}ctx.closePath();ctx.stroke();oval(ctx,x,y,1.3,1.2,'#624f30');}
  }else if(kind==='parrot'){
   for(let row=0;row<4;row++)for(let col=0;col<5;col++){const x=-21+col*8+(row%2)*4,y=-11+row*7;path(ctx,c=>{c.moveTo(x-3,y-3);c.quadraticCurveTo(x+7,y-1,x,y+4);c.quadraticCurveTo(x-5,y+1,x-3,y-3);},['#48b5ab','#819ee3','#e8be8a','#b1dfbe'][row], '#28587a88',.6);}
  }else if(kind==='flounder'){
   for(let i=0;i<19;i++)oval(ctx,Math.sin(i*2.4)*22,Math.cos(i*1.7)*9,1.5+(i%3)*.5,1, i%2?'#b8ad87':'#6d785e');
  }else if(kind==='damsel'){
   ctx.strokeStyle='#2167a2';ctx.lineWidth=1.1;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-14+i*7,-h);ctx.lineTo(-11+i*7,h);ctx.stroke();}
  }else if(kind==='pip'){
   oval(ctx,-8,-1,5.5,6,'#e6ba69');oval(ctx,-8,-1,3.5,4,'#153b4c');for(let i=0;i<3;i++)oval(ctx,-7+i*7,7,1,.7,'#f7d38e');
  }
  ctx.restore();fan(ctx,l*.24,3,9,6+wave,finColor);
  if(kind==='parrot')path(ctx,c=>{c.moveTo(l-1,-4);c.lineTo(l+5,-1);c.lineTo(l,4);c.lineTo(l-2,1);},'#f1dfbf','#355267');
  ctx.strokeStyle='#183f4c88';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(l*.5,-h*.5);ctx.quadraticCurveTo(l*.3,1,l*.55,h*.6);ctx.stroke();
  eye(ctx,l*.74,-h*.28,kind==='minnow'||kind==='sardine'?1.9:2.5);if(kind==='flounder')eye(ctx,l*.45,-h*.65,2.1);
  if(kind==='pip'){
   ctx.strokeStyle='#aa7c3f';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(13,2);ctx.lineTo(26,-12);ctx.lineTo(30,-4+wave);ctx.stroke();
   oval(ctx,30,1+wave,10,10,'#f6c76022');path(ctx,c=>{c.moveTo(26,-4+wave);c.lineTo(34,-4+wave);c.lineTo(34,6+wave);c.lineTo(26,6+wave);c.closePath();},'#e2a957','#816138');path(ctx,c=>{c.moveTo(28,-2+wave);c.lineTo(32,-2+wave);c.lineTo(32,4+wave);c.lineTo(28,4+wave);},'#fff2ac','#c3dec9',.7);
  }
  return true;
 }finally{ctx.restore();}
}

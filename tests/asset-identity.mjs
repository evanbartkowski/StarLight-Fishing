import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('.qa',{recursive:true});
import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1400,height:1500},hasTouch:true});
 await page.route(/googleapis\.com|cloudfunctions\.net/,route=>route.abort());
 const errors=[]; page.on('pageerror',error=>errors.push(error.message)); page.on('console',message=>{if(/render error|Error rendering|Error drawing|Fatal boat/i.test(message.text()))errors.push(message.text());});
 await page.route('**/src/main.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nwindow.petGame={save,oceanWorld,hook};'});});
 await page.goto(process.env.GAME_TEST_URL||'http://127.0.0.1:5173/');await page.waitForSelector('#game-hud');
 await page.waitForFunction(()=>window.petGame);await page.evaluate(()=>{window.petGame.save.data.settings.hasSeenTutorial=true;window.petGame.save.save();});await page.click('#btn-guest-start');await page.waitForFunction(()=>document.getElementById('welcome-popup').style.display==='none');
 const result=await page.evaluate(async()=>{
  const [{Fish},{FISH_SPECIES},{Treasure},{CRATE_RANKS},{TREASURE_ITEMS},{OceanWorld}]=await Promise.all([
   import('/src/entities/Fish.js'),import('/src/data/FishData.js'),import('/src/entities/Treasure.js'),import('/src/data/CrateData.js'),import('/src/data/TreasureData.js'),import('/src/world/OceanWorld.js')]);
  const c=document.createElement('canvas');c.width=1400;c.height=1350;c.id='art-gallery';c.style.cssText='position:relative;z-index:999999;display:block';document.body.append(c);document.body.style.overflow='auto';const ctx=c.getContext('2d');ctx.fillStyle='#092a3b';ctx.fillRect(0,0,c.width,c.height);
  const names=['Orichalcum Amphora Fish','Temple Bell Puffer','Sapphire Gearfish','Porcelain Lanternfish','Solstice Puffer','Scoria Puffer','Cottoncloud Puffer','Honeycomb Boxfish','Moonring Discus','Moonstone Tetra','Sunken Throne Grouper','Caldera Crownfish','Lunar Mirror Sole','Shoals Mandarinfish'];
  const masks=[];
  names.forEach((name,i)=>{const species=FISH_SPECIES.find(s=>s.name===name);if(!species)throw Error(`Missing ${name}`);const fish=new Fish(species,0,0);fish.y=0;fish.scale=1.7;fish.direction=1;fish.crown=null;fish.mutation=null;fish.isShiny=false;fish.wiggleTimer=1;fish.auraTime=1;const x=i%7*200+100,y=Math.floor(i/7)*170+75;ctx.save();ctx.translate(x,y);fish.render(ctx);ctx.restore();ctx.fillStyle='#d7eef6';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(name,x,y+67,190);
   if(i<2){const p=document.createElement('canvas');p.width=160;p.height=120;const pc=p.getContext('2d');const test=new Fish({...species,rarity:'common',fantasyTrail:null,primaryColor:'#65a7b6',secondaryColor:'#d3ebe4',finColor:'#298a91'},80,60);test.y=60;test.scale=1.7;test.direction=1;test.crown=null;test.mutation=null;test.isShiny=false;test.wiggleTimer=1;test.render(pc);masks.push([...pc.getImageData(0,0,160,120).data].filter((_,i)=>i%4===3).map(a=>a>180));}
  });
  const styles=['standard','pirate','submarine','chinese_junk','viking','ghost_ship','steampunk'];
  let crewCases=0;
  const probe=document.createElement('canvas');probe.width=800;probe.height=600;const p=probe.getContext('2d');
  for(const style of styles)for(let tier=0;tier<=8;tier++)for(const dir of [-1,1]){
   const world=new OceanWorld({width:800,height:600,clientWidth:800});world.boat.x=400;world.boat.y=220;world.aimDirection=dir;world.driftItems=null;
   world.saveSystem={data:{boatHullStyle:style},getBoatHull:()=>style,getUpgradeLevel:()=>tier,isPetEquipped:()=>true};
   world.shipsCat.hasTinyRod=true;world.pelican.trust=80;world.renderBoatAndFisherman(p,0,true);
   world.shipsCat.triggerRareSwim();world.shipsCat.update(1800);world.pelican.triggerRareFlight();world.pelican.update(1800);world.renderBoatAndFisherman(p,0,true);crewCases++;
   if(!p.getTransform().isIdentity)throw Error('Crew leaked a canvas transform');
  }
  const chestMasks=CRATE_RANKS.map(rank=>{p.clearRect(0,0,800,600);new Treasure({...rank,isCrate:true,crateRank:rank.rank,radius:25},100,100).render(p);const pixels=p.getImageData(40,40,120,120).data;return [...pixels].filter((_,i)=>i%4===3).map(a=>a>180?'1':'0').join('');});
  const chests=[...CRATE_RANKS.map(rank=>({...rank,isCrate:true,crateRank:rank.rank})),...TREASURE_ITEMS.filter(item=>/^realm_.*_cache$/.test(item.id))];
  chests.forEach((item,i)=>{const x=i%8*175+87,y=410+Math.floor(i/8)*135;const treasure=new Treasure(item,x,y);treasure.render(ctx);ctx.fillStyle='#d7eef6';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(item.name,x,y+58,166);});
  const cases=[...Array.from({length:9},(_,tier)=>({tier,style:'standard'})),...['pirate','submarine','chinese_junk','viking','ghost_ship','steampunk'].map(style=>({tier:8,style}))];
  for(const [i,{tier,style}] of cases.entries()){const x=i%5*280,y=665+Math.floor(i/5)*200;const world=new OceanWorld({width:278,height:198,clientWidth:278});world.boat.x=139;world.boat.y=146;world.driftItems=null;world.saveSystem={data:{boatHullStyle:style},getBoatHull:()=>style,getUpgradeLevel:()=>tier,isPetEquipped:id=>['cat','pelican'].includes(id)};world.shipsCat.hasTinyRod=true;world.pelican.trust=80;ctx.save();ctx.translate(x,y);world.renderBoatAndFisherman(ctx,0,true);ctx.restore();ctx.fillStyle='#d7eef6';ctx.font='12px sans-serif';ctx.textAlign='left';ctx.fillText(`${style} tier ${tier}`,x+10,y+190);}
  return {crewCases,chestSilhouettes:new Set(chestMasks).size,silhouetteDifference:masks[0].filter((value,i)=>value!==masks[1][i]).length};
 });
 await page.locator('#art-gallery').screenshot({path:'.qa/art-identity.png'});
 console.log(result);
 assert.equal(result.chestSilhouettes,8);assert.ok(result.silhouetteDifference>120,'Amphora fish and bell puffer must have different anatomy, even without their colors');
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});
  await page.waitForFunction(width => document.getElementById('game-canvas').style.width === `${width}px`, width);
  for(const style of ['standard','pirate','submarine','chinese_junk','viking','ghost_ship','steampunk']){
   await page.evaluate(style=>{const {save,oceanWorld}=window.petGame;document.getElementById('art-gallery')?.remove();save.data.upgrades.boatVessel=8;save.data.boatHullStyle=style;save.data.pets={cat:true,pelican:true};oceanWorld.driftItems=null;oceanWorld.shipsCat.swimAdventure=null;oceanWorld.shipsCat.petCount=0;oceanWorld.shipsCat.lastGiftDay=0;oceanWorld.shipsCat.hasMorningGift=false;oceanWorld.shipsCat.pendingGift=null;oceanWorld.pelican.skyFlight=null;oceanWorld.pelican.trust=0;},style)
   for(const pet of ['cat','pelican']){
    const point=await page.evaluate(({pet,style})=>{const world=window.petGame.oceanWorld;const pos=pet==='cat'?world.shipsCat.getDeckPosition(8,style):world.pelican.getBowspritPosition(8,style);const angle=world.boat.angle||0;return {x:world.boat.x+pos.x*Math.cos(angle)-pos.y*Math.sin(angle),y:world.boat.y+pos.x*Math.sin(angle)+pos.y*Math.cos(angle)};},{pet,style});
    if(width<500)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
    assert.equal(await page.evaluate(pet=>pet==='cat'?window.petGame.oceanWorld.shipsCat.petCount:window.petGame.oceanWorld.pelican.trust,pet),pet==='cat'?1:12,'Click must reach the pet on '+style);
    assert.equal(await page.evaluate(()=>window.petGame.hook.state),'SURFACE_IDLE','Petting must not cast the hook');
   }
  }
 }
 assert.deepEqual([...new Set(errors)],[]);
 console.log('PASS asset identities: '+result.crewCases+' crew layouts and adventures, all chest silhouettes, different fish anatomy, actual pet clicks on desktop and phone');
}finally{await browser.close();}

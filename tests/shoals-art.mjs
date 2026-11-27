import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {openLayoutGame} from './browser-layout-fixture.mjs';
const browser=await chromium.launch({channel:process.env.GAME_BROWSER_CHANNEL||'msedge',headless:true});
try{
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await openLayoutGame(page);
  const result=await page.evaluate(async()=>{
   const [{Fish},{FISH_SPECIES},{specimen},{drawTreasureArtwork},{TREASURE_ITEMS},{SHOALS_FISH_DESIGNS}]=await Promise.all([import('/src/entities/Fish.js'),import('/src/data/FishData.js'),import('/src/ui/CatchCard.js'),import('/src/rendering/TreasureArtwork.js'),import('/src/data/TreasureData.js'),import('/src/rendering/ShoalsFishArtwork.js')]);
   const canvas=document.createElement('canvas');canvas.width=900;canvas.height=400;const ctx=canvas.getContext('2d');
   const species=FISH_SPECIES.find(f=>f.id==='easter_misleading_monster'),pip=new Fish(species,450,200,{shinyChance:0});
   pip.x=450;pip.y=200;pip.direction=1;pip.crown=null;
   const bounds=()=>{const pixels=ctx.getImageData(0,0,900,400).data;let left=900,right=0;for(let y=0;y<400;y++)for(let x=0;x<900;x++)if(pixels[(y*900+x)*4+3]>80){left=Math.min(left,x);right=Math.max(right,x);}return right-left;};
   pip.render(ctx,0,{x:1500,y:200});const distant=bounds(),shadow=canvas.toDataURL();ctx.clearRect(0,0,900,400);
   pip.scale*=2;pip.render(ctx,0,{x:1500,y:200});const largeFishProjection=bounds();ctx.clearRect(0,0,900,400);
   pip.scale/=2;pip.render(ctx,0,{x:520,y:200});const revealed=bounds(),small=canvas.toDataURL();
   const saved=window.layoutGame.save.addItemToInventory(pip);window.layoutGame.save.save();window.layoutGame.save.load();
   const loaded=window.layoutGame.save.getInventory().find(i=>i.instanceId===saved.instanceId),restored=specimen(loaded,450,200);
   ctx.clearRect(0,0,900,400);restored.render(ctx,0,{x:1500,y:200});const aquarium=bounds();
   let fishCases=0;
   for(const id of Object.keys(SHOALS_FISH_DESIGNS))for(const direction of [-1,1])for(const shiny of [false,true]){
    const fish=new Fish(FISH_SPECIES.find(f=>f.id===id),450,200,{shinyChance:0});fish.x=450;fish.y=200;fish.isShiny=shiny;fish.direction=direction;fish.render(ctx,0);if(!ctx.getTransform().isIdentity)throw Error('Fish leaked its transform: '+id);fishCases++;
   }
   // Material creation must stop once each treasure sprite is cached.
   for(const item of TREASURE_ITEMS)drawTreasureArtwork(ctx,item);
   const old=CanvasRenderingContext2D.prototype.createLinearGradient;let gradients=0;
   CanvasRenderingContext2D.prototype.createLinearGradient=function(...a){gradients++;return old.apply(this,a);};
   const start=performance.now();try{for(let i=0;i<20;i++)for(const item of TREASURE_ITEMS)drawTreasureArtwork(ctx,item);}finally{CanvasRenderingContext2D.prototype.createLinearGradient=old;}
   window.layoutGame.uiManager.openInspectItemModal(saved.instanceId);
   return{distant,largeFishProjection,revealed,aquarium,fishCases,gradients,treasureMs:performance.now()-start,name:restored.name,value:loaded.value,shadow,small};
  });
  assert.ok(result.distant>650,'projection must dwarf ordinary reef fish');assert.equal(result.largeFishProjection,result.distant,'projection size must not shrink with its minnow');
  assert.ok(result.revealed<200);assert.ok(result.aquarium<220,'owned specimens must not project giant shadows');assert.equal(result.gradients,0,'cached treasure rendering must not allocate new material gradients');
  await page.locator('#inspect-specimen-canvas').waitFor({state:'visible'});assert.ok((await page.locator('#modal-title').innerText()).includes('Lanternmaw Pip'));
  const {writeFile}=await import('node:fs/promises');for(const [key,file]of [['shadow','shadow'],['small','revealed']])await writeFile(`.qa/pip-${file}-${width}.png`,Buffer.from(result[key].split(',')[1],'base64'));
  assert.deepEqual(errors,[]);console.log(`PASS shoals ${width}px: ${result.fishCases} native fish variants, ${result.distant}px projection, ${result.revealed}px revealed body, saved/aquarium Pip, cached treasure materials (${result.treasureMs.toFixed(1)} ms for 20 catalog draws)`);await page.close();
 }
}finally{await browser.close();}

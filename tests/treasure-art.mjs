import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { openLayoutGame } from './browser-layout-fixture.mjs';

await mkdir('.qa', { recursive: true });
const browser = await chromium.launch({ channel: process.env.GAME_BROWSER_CHANNEL || 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await openLayoutGame(page);
  const result = await page.evaluate(async () => {
    const { TREASURE_ITEMS } = await import('/src/data/TreasureData.js');
    const { drawTreasureArtwork, treasureSvg } = await import('/src/rendering/TreasureArtwork.js');
    const { Treasure } = await import('/src/entities/Treasure.js');
    const items = [...TREASURE_ITEMS.filter(item => !item.isCrate), {id:'sunken_safe',name:'Sunken Iron Safe'}], errors = [];
    const sheet = document.createElement('canvas'); sheet.id='treasure-sheet';
    sheet.width=1200; sheet.height=Math.ceil(items.length/8)*130;
    sheet.style.cssText='position:absolute;inset:0;z-index:99999';document.body.append(sheet);
    const ctx=sheet.getContext('2d');ctx.fillStyle='#102c40';ctx.fillRect(0,0,sheet.width,sheet.height);
    for(const [index,item] of items.entries()) {
      const canvas=document.createElement('canvas');canvas.width=68;canvas.height=68;
      const p=canvas.getContext('2d');p.translate(34,34);drawTreasureArtwork(p,item);
      const before=p.getImageData(0,0,68,68).data;
      if([...before].filter((v,i)=>i%4===3&&v>30).length<80) errors.push(`${item.name} is blank`);
      const image=new Image();image.src=`data:image/svg+xml,${encodeURIComponent(treasureSvg(item))}`;await image.decode();
      // Both versions use the same double-resolution rasterization policy.
      const high=document.createElement('canvas');high.width=136;high.height=136;
      high.getContext('2d').drawImage(image,0,0,136,136);
      p.resetTransform();p.clearRect(0,0,68,68);p.drawImage(high,0,0,68,68);
      const after=p.getImageData(0,0,68,68).data;
      let mismatch=0;for(let i=3;i<after.length;i+=4)if(Math.abs(before[i]-after[i])>30)mismatch++;
      if(mismatch>70)errors.push(`${item.name} differs between SVG and native art: ${mismatch}`);
      const x=index%8*150+75,y=Math.floor(index/8)*130+45;
      const world=new Treasure(item,x-27,y);world.timer=0;world.render(ctx);
      ctx.drawImage(image,x+2,y-34,68,68);
      ctx.fillStyle='#d9eaf6';ctx.font='10px sans-serif';ctx.textAlign='center';
      const words=item.name.split(' '),middle=Math.ceil(words.length/2);
      ctx.fillText(words.slice(0,middle).join(' '),x,y+47,146);ctx.fillText(words.slice(middle).join(' '),x,y+60,146);
    }
    const { save, uiManager }=window.layoutGame;
    const hourglass=TREASURE_ITEMS.find(i=>i.name==='Stopped Hourglass');
    const stored=save.addItemToInventory(new Treasure(hourglass,0,0));
    save.addItemToInventory({id:'sunken_safe_legacy',speciesId:'sunken_safe',isSunkenSafe:true,name:'Sunken Iron Safe',rarity:'rare',value:180});
    sheet.remove();uiManager.openInventory();
    return {errors,count:items.length,instanceId:stored.instanceId,svg:treasureSvg(hourglass),sheet:sheet.toDataURL()};
  });
  assert.deepEqual(result.errors,[]);
  const { writeFile }=await import('node:fs/promises');
  await writeFile('.qa/treasure-contact-sheet.png',Buffer.from(result.sheet.split(',')[1],'base64'));
  assert.ok(await page.locator('.inventory-card svg[data-treasure="realm_7_treasure_0"]').isVisible());
  assert.ok(await page.locator('.inventory-card svg[data-treasure="sunken_safe"]').isVisible());
  await page.evaluate(id=>window.layoutGame.uiManager.openInspectItemModal(id),result.instanceId);
  await page.locator('#inspect-specimen-canvas').waitFor({state:'visible'});
  await page.screenshot({path:'.qa/hourglass-inspect.png'});
  console.log(`PASS ${result.count} native treasure illustrations: all visible, SVG/Canvas silhouettes match, saved hourglass uses shared art in inventory and inspection`);
} finally {await browser.close();}

import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { openLayoutGame } from './browser-layout-fixture.mjs';

const browser = await chromium.launch({ channel: process.env.GAME_BROWSER_CHANNEL || 'msedge', headless: true });
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await openLayoutGame(page);
    const bottles = await page.evaluate(async () => {
      const { Treasure } = await import('/src/entities/Treasure.js');
      const { TREASURE_ITEMS } = await import('/src/data/TreasureData.js');
      const { DRIFT_MESSAGES } = await import('/src/data/DriftMessages.js');
      const { hook, save, uiManager, setState } = window.layoutGame;
      const entries = [DRIFT_MESSAGES.find(m => m.type === 'poem'), DRIFT_MESSAGES.find(m => m.type === 'haiku')];
      hook.caughtItems = entries.map(message => new Treasure({ ...TREASURE_ITEMS.find(i => i.id === 'bottle'), bottleMessage: message }, 100, 300));
      hook.caughtItems.forEach(item => save.recordCatchItem(item));
      setState('CATCH_SUMMARY');
      window.bottleContinues = 0;
      uiManager.openCatchSummary(hook, () => { window.bottleContinues++; setState('SURFACE_IDLE'); });
      return entries;
    });
    assert.equal(await page.evaluate(() => window.layoutGame.save.getBottleMessages().length), 2, 'landing bottles must archive both letters even when the haul popup is skipped');
    await page.locator('.btn-catch-read-bottle').nth(1).click();
    assert.equal((await page.locator('#bottle-message-text').innerText()).trim(), bottles[1].lines.join('\n'), 'each bottle must open its own letter');
    await page.click('#btn-bottle-close');
    assert.ok(await page.locator('#btn-keep-all-catches').isVisible(), 'reading must return to the unresolved haul');
    await page.click('#btn-keep-all-catches');
    assert.equal(await page.evaluate(() => window.bottleContinues), 1);
    await page.evaluate(() => window.layoutGame.uiManager.openInventory());
    const savedBottles = await page.evaluate(() => window.layoutGame.save.getInventory().filter(i => i.isBottle));
    assert.equal(savedBottles.length, 2, 'reading must preserve both bottles for keeping');
    await page.evaluate(id => window.layoutGame.uiManager.openInspectItemModal(id), savedBottles[1].instanceId);
    await page.click('#btn-inspect-open-bottle');
    assert.equal((await page.locator('#bottle-message-text').innerText()).trim(), bottles[1].lines.join('\n'));
    await page.click('#btn-bottle-close');
    assert.ok(await page.locator('#inspect-specimen-canvas').isVisible(), 'inventory reading must return to the item');
    const surface = await page.evaluate(async () => {
      const { DriftBottle }=await import('/src/entities/DriftItems.js');
      const { uiManager, oceanWorld, setState }=window.layoutGame;
      uiManager.closeModal();setState('SURFACE_IDLE');
      const bottle=new DriftBottle(70,oceanWorld.surfaceY);
      oceanWorld.driftItems.items=[bottle];
      return {x:bottle.x,y:bottle.y,text:bottle.message.text};
    });
    await page.locator('#game-canvas').click({position:{x:surface.x,y:surface.y}});
    await page.locator('#bottle-message-text').waitFor({state:'visible'});
    assert.equal((await page.locator('#bottle-message-text').innerText()).trim(),surface.text,'clicking a floating bottle must display its poem');
    const migrated = await page.evaluate(() => {
      const {save}=window.layoutGame;
      save.data.bottleMessages=[];
      save.data.inventory=[{id:'bottle',instanceId:'old-bottle',type:'trinket',name:'Old bottle',bottleMessage:{text:'Old first line\\nOld second line'}}];
      save.save();save.load();
      return {type:save.getInventory()[0].type,letters:save.getBottleMessages()};
    });
    assert.equal(migrated.type,'bottle');
    assert.equal(migrated.letters[0].text,'Old first line\nOld second line','owned legacy letters must appear in the journal after loading');
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS real bottle flows: archive on landing, two different letters, return to haul, keep, inventory reader and return, floating bottle pickup');
} finally { await browser.close(); }

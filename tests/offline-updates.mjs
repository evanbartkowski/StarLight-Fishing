import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const template = await readFile('public/sw.js', 'utf8');
const install = await readFile('src/ui/InstallGame.js', 'utf8');
let release = 'one';
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  response.setHeader('Cache-Control', 'no-store');
  if (url.pathname === '/sw.js') {
    response.setHeader('Content-Type', 'text/javascript');
    response.end(template.replace("'__RELEASE__'", JSON.stringify(release)).replace('__AUDIO_RELEASE__','test')
      .replace('/* CORE_ASSETS */ []', JSON.stringify(['/index.html','/install.js',`/assets/${release}.js`])));
  } else if (url.pathname === '/install.js') {
    response.setHeader('Content-Type', 'text/javascript'); response.end(install);
  } else if (url.pathname.startsWith('/assets/')) {
    response.setHeader('Content-Type', 'text/javascript'); response.end(`window.loaded=${JSON.stringify(url.pathname)};`);
  } else {
    response.setHeader('Content-Type', 'text/html');
    response.end(`<div id="welcome-popup">${release === 'one' ? '<button id="btn-instant-play">Play Free Now</button>' : ''}</div>
      <button id="btn-install-game"></button><dialog id="install-dialog"><button id="install-close"></button></dialog>
      ${['offline-status','install-guidance','install-native','offline-music','offline-retry','offline-update'].map(id=>`<button id="${id}" hidden></button>`).join('')}
      <script src="/assets/${release}.js"></script><script type="module">import {initializeInstallGame} from '/install.js';initializeInstallGame({production:true});window.appReady=true;</script>`);
  }
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(()=>navigator.serviceWorker.controller && window.appReady);
  await page.evaluate(()=>localStorage.setItem('progress-marker','keep my captain'));
  release='two';
  await page.evaluate(async()=>(await navigator.serviceWorker.getRegistration()).update());
  await page.waitForFunction(()=>window.loaded==='/assets/two.js',{},{timeout:15000});
  assert.equal(await page.locator('#btn-instant-play').count(),0,'an old start screen must automatically refresh');
  assert.equal(await page.evaluate(()=>localStorage.getItem('progress-marker')),'keep my captain');
  await page.evaluate(()=>document.getElementById('welcome-popup').style.display='none');
  release='three';
  await page.evaluate(async()=>{
    const changed=new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
    await (await navigator.serviceWorker.getRegistration()).update(); await changed;
  });
  assert.equal(await page.evaluate(()=>window.loaded),'/assets/two.js','a deployment must not reload a running voyage');
  assert.equal(await page.evaluate(async()=> (await fetch('/assets/two.js')).text()),'window.loaded="/assets/two.js";','the previous running bundle must remain available');
  await page.context().setOffline(true); await page.reload();
  await page.waitForFunction(()=>window.loaded==='/assets/three.js');
  assert.equal(await page.evaluate(()=>localStorage.getItem('progress-marker')),'keep my captain');
  console.log('PASS offline updates: obsolete welcome refreshes, captain data survives, active play is uninterrupted, previous assets and latest offline reload work');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}

import test from 'node:test';
import assert from 'node:assert/strict';
import {FISH_SPECIES} from '../src/data/FishData.js';
import {Fish} from '../src/entities/Fish.js';
import {drawPipProjection} from '../src/rendering/LanternPipArtwork.js';

test('the rare lantern mimic survives catalog-based inventory and aquarium reconstruction',()=>{
  const species=FISH_SPECIES.find(f=>f.id==='easter_misleading_monster');
  assert.ok(species,'the encounter needs a permanent save-compatible species definition');
  assert.equal(species.secretEncounter,true,'ordinary world population must exclude the special encounter');
  assert.ok(species.baseValue>=7000,'finding the tiny fish should be a valuable reward');
  const fish=new Fish(species,100,200,{shinyChance:0});
  assert.equal(fish.isMisleadingMonster,true);
  assert.ok(fish.radius<25,'the intimidating projection must not turn into a giant collision target');
  assert.ok(fish.value>=4000,'even the smallest specimen should remain valuable');
});

test('the disguise conceals the body until close approach, then stays revealed',()=>{
  const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>k in t?t[k]:()=>{}});
  const fish={x:200,y:300,state:'SWIMMING',wiggleTimer:0};
  assert.equal(drawPipProjection(ctx,fish,{x:300,y:300}),true);
  assert.ok(!fish._revealedSmall);
  assert.equal(drawPipProjection(ctx,fish,{x:280,y:300}),false);
  assert.equal(fish._revealedSmall,true);
  assert.equal(drawPipProjection(ctx,fish,{x:900,y:300}),false);
  assert.equal(drawPipProjection(ctx,{...fish,_revealedSmall:false,state:'HOOKED'},{x:900,y:300}),false);
});

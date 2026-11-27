import test from 'node:test';
import assert from 'node:assert/strict';
import { TREASURE_ITEMS } from '../src/data/TreasureData.js';
import { getTreasureArt } from '../src/ui/CustomVectorArt.js';
globalThis.localStorage = {getItem:()=>null,setItem(){},removeItem(){}};
const { SaveSystem } = await import('../src/systems/SaveSystem.js');

test('every dredged object has identifiable art recoverable from older saved IDs', () => {
  const art = new Set();
  for (const item of TREASURE_ITEMS.filter(item => !item.isCrate)) {
    const svg = getTreasureArt(item);
    assert.ok(svg.includes(`data-treasure="${item.id}"`), `${item.name} needs its own shared artwork`);
    assert.equal(getTreasureArt({ id: item.id, name: item.name, type: 'trinket' }), svg, `${item.name} must survive saving`);
    art.add(svg);
  }
  assert.equal(art.size, TREASURE_ITEMS.filter(item => !item.isCrate).length);
});

test('sunken safes keep real artifact art and remain salvage when saved',()=>{
  const caught={id:'sunken_safe_1234',speciesId:'sunken_safe',name:'Sunken Iron Safe',category:'relic',isSunkenSafe:true,value:180};
  const saved=SaveSystem.prototype.createInventoryItem(caught);
  assert.equal(saved.type,'trinket','a sunken safe must not become a fish preview');
  assert.ok(getTreasureArt(caught).includes('data-treasure="sunken_safe"'));
  assert.equal(getTreasureArt(saved),getTreasureArt(caught));
  assert.equal(getTreasureArt({...caught,id:'sunken_safe_9999'}),getTreasureArt(caught),'per-catch IDs must reuse one bounded artwork definition');
  const originalRead=localStorage.getItem;
  try{
    localStorage.getItem=()=>JSON.stringify({gemEconomyVersion:1,inventory:[{...caught,isSunkenSafe:undefined,type:'fish'}]});
    const legacy=new SaveSystem();legacy.load();
    assert.equal(legacy.getInventory()[0].type,'trinket');
    assert.equal(getTreasureArt(legacy.getInventory()[0]),getTreasureArt(caught));
  }finally{localStorage.getItem=originalRead;}
});

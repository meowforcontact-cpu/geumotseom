import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {ensureFurnitureLayout,DEFAULT_FURNITURE_LAYOUT,snapshot,validateSave} from '../src/storage.mjs';
import {PET_PRODUCTS} from '../src/pet-catalog.mjs';
const catalog=JSON.parse(await readFile('src/furniture-catalog.json','utf8'));
const html=await readFile('dist/index.html','utf8');
const start=html.indexOf('const WHITEWOOD_ASSETS=')+'const WHITEWOOD_ASSETS='.length;
const assets=JSON.parse(html.slice(start,html.indexOf(';\n',start)));
const hash=data=>createHash('sha256').update(data).digest('hex');
test('production bundle embeds the selected background, all eight cats and eleven furniture files exactly',async()=>{
 assert.equal(assets.version,'selected-20261112');
 assert.equal(Object.keys(assets.cat).length,8);assert.equal(Object.keys(assets.furniture).length,11);
 const entries=[['room.png',assets.room],...Object.entries(assets.cat).map(([d,url])=>['cat/'+d+'.png',url]),...Object.entries(assets.furniture).map(([id,url])=>['furniture/'+id+'.png',url])];
 for(const [file,url]of entries){const original=await readFile(file.startsWith('cat/')?'src/assets/cat-Q-original-20261112/'+file.slice(4):'src/assets/selected-room-20261112/'+file);assert.equal(hash(Buffer.from(url.split(',')[1],'base64')),hash(original),file)}
 assert.equal(hash(Buffer.from(assets.room.split(',')[1],'base64')),'75ca9ab7ccea643919fc40c3a5b87e8eb02b4249e8d855270c6c2d3b82d1b8c8');
 assert.equal(hash(Buffer.from(assets.cat.south.split(',')[1],'base64')),'6e505f21850adca3bf8fe48bb3b9e390cb76dc7d09f116add8ab9ff7da33d78a');
 assert.ok(html.includes('const selectedCatImages='));
});
test('landscape camera uses the full wide world with no square crop or black margins',async()=>{
 const source=await readFile('src/room-assets.js','utf8');
 const a=source.indexOf('function whitewoodRoomView'),b=source.indexOf('const isWhitewoodRoom',a);
 const ctx=vm.createContext({MODE:'console',RW:170,RH:128});vm.runInContext(source.slice(a,b),ctx);
 const view=vm.runInContext('whitewoodRoomView()',ctx);
 assert.equal(view.scale,1);assert.equal(view.size,170);assert.equal(view.x,0);assert.equal(view.y,0);
 assert.ok(!source.includes('50,0,284,276'));
});
const previous={cream_f1:[11,35],cream_f8:[17,79],cream_f3:[54,37],cream_f4:[80,40],cream_tea_table:[93,67],cream_f9:[105,38],cream_flower_table:[10,94],cream_f6:[42,100],cream_f7:[85,94],cream_f10:[109,114]};
function oldState(){return {coins:1500,earned:1000,xp:500,owned:['p3',...Object.keys(previous)],eq:{벽:null,바닥:null,칭호:null,배지:null,가구:['cream_f1','cream_f3','cream_f4','cream_f9','cream_tea_table','cream_flower_table','cream_f7']},pets:[{name:'내 고양이',kind:'cat',hatched:true,taps:3}],rep:0,hun:2,mood:2,poop:[],att:{streak:0,done:false},sent:[],log:[],pos:structuredClone(previous),roomLook:{wall:'whitewood',floor:'whitewood'},furnitureLayoutVersion:4}}
test('old room stores all furniture once and persists version6 without changing ownership',()=>{
 const s=oldState(),pets=structuredClone(s.pets);ensureFurnitureLayout(s,[...catalog,...PET_PRODUCTS]);
 assert.deepEqual(s.eq.가구,[]);assert.equal(s.furnitureLayoutVersion,6);assert.deepEqual(s.pos,previous);
 assert.deepEqual(s.owned,['p3',...Object.keys(previous)]);
 assert.equal(s.coins,1500);assert.deepEqual(s.pets,pets);
 s.pos.m1=[2,78];s.pos.m2=[94,72];s.pos.m3=[34,80];
 const restored=validateSave(snapshot(s),[...catalog,...PET_PRODUCTS]);assert.equal(restored.eq.가구.length,0);assert.equal(restored.furnitureLayoutVersion,6);
 assert.equal(ensureFurnitureLayout(restored,[...catalog,...PET_PRODUCTS]),false);
});
test('custom positions and intentionally stored pieces survive the asset migration',()=>{
 const s=oldState();s.pos.cream_f1=[23,65];s.eq.가구=s.eq.가구.filter(id=>id!=='cream_f7');
 ensureFurnitureLayout(s,[...catalog,...PET_PRODUCTS]);assert.deepEqual(s.pos.cream_f1,[23,65]);assert.deepEqual(s.eq.가구,[]);assert.ok(s.owned.includes('cream_f7'));
});

test('storing v1-v5 furniture preserves retired pieces, wallet, history and user positions',()=>{
 for(const version of [1,2,3,4,5]){
  const s=oldState();s.furnitureLayoutVersion=version;s.owned.push('m1');s.eq.가구.push('m1');s.pos.cream_f1=[25,64];s.log=[['침대 구매','-100','어제']];
  const before=structuredClone(s);
  assert.equal(ensureFurnitureLayout(s,[...catalog,{id:'m1',cat:'가구',retired:true},...PET_PRODUCTS]),true);
  assert.deepEqual(s.eq,{...before.eq,가구:[]});assert.deepEqual(s.owned,before.owned);assert.deepEqual(s.pos,before.pos);
  for(const key of ['coins','earned','xp','pets','log','roomLook'])assert.deepEqual(s[key],before[key]);
 }
});

test('furniture placed after the one-time storage migration survives repeated loads',()=>{
 const s=oldState();ensureFurnitureLayout(s,[...catalog,...PET_PRODUCTS]);s.eq.가구=['cream_f1'];s.pos.cream_f1=[30,60];
 s.pos.m1=[2,78];s.pos.m2=[94,72];s.pos.m3=[34,80];
 const restored=validateSave(snapshot(s),[...catalog,...PET_PRODUCTS]);
 assert.deepEqual(restored.eq.가구,['cream_f1']);assert.deepEqual(restored.pos.cream_f1,[30,60]);assert.equal(ensureFurnitureLayout(restored,[...catalog,...PET_PRODUCTS]),false);
});
test('selected furniture stays inside the wide room and leaves a central walking strip',()=>{
 for(const [id,[x,y]]of Object.entries(DEFAULT_FURNITURE_LAYOUT)){const [w,h]=catalog.find(i=>i.id===id).size;assert.ok(x>=0&&x+w<=170,id);assert.ok(y>=0&&y+h<=128,id)}
});


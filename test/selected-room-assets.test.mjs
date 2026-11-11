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
 for(const [file,url]of entries){const original=await readFile('src/assets/selected-room-20261112/'+file);assert.equal(hash(Buffer.from(url.split(',')[1],'base64')),hash(original),file)}
 assert.equal(hash(Buffer.from(assets.room.split(',')[1],'base64')),'75ca9ab7ccea643919fc40c3a5b87e8eb02b4249e8d855270c6c2d3b82d1b8c8');
 assert.equal(hash(Buffer.from(assets.cat.south.split(',')[1],'base64')),'babdb48e46577edf9469683d97f418663ec9f3e070a92e4fd056e54d6b1e50ea');
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
test('default v4 room upgrades to all ten selected designs and persists version5',()=>{
 const s=oldState(),pets=structuredClone(s.pets);ensureFurnitureLayout(s,[...catalog,...PET_PRODUCTS]);
 assert.equal(s.eq.가구.length,10);assert.equal(s.furnitureLayoutVersion,5);assert.deepEqual(s.pos,DEFAULT_FURNITURE_LAYOUT);
 assert.equal(s.coins,1500);assert.deepEqual(s.pets,pets);
 s.pos.m1=[2,78];s.pos.m2=[94,72];s.pos.m3=[34,80];
 const restored=validateSave(snapshot(s),[...catalog,...PET_PRODUCTS]);assert.equal(restored.eq.가구.length,10);assert.equal(restored.furnitureLayoutVersion,5);
 assert.equal(ensureFurnitureLayout(restored,[...catalog,...PET_PRODUCTS]),false);
});
test('custom positions and intentionally stored pieces survive the asset migration',()=>{
 const s=oldState();s.pos.cream_f1=[23,65];s.eq.가구=s.eq.가구.filter(id=>id!=='cream_f7');const equipped=[...s.eq.가구];
 ensureFurnitureLayout(s,[...catalog,...PET_PRODUCTS]);assert.deepEqual(s.pos.cream_f1,[23,65]);assert.deepEqual(s.eq.가구,equipped);assert.ok(s.owned.includes('cream_f7'));
});
test('selected furniture stays inside the wide room and leaves a central walking strip',()=>{
 for(const [id,[x,y]]of Object.entries(DEFAULT_FURNITURE_LAYOUT)){const [w,h]=catalog.find(i=>i.id===id).size;assert.ok(x>=0&&x+w<=170,id);assert.ok(y>=0&&y+h<=128,id)}
});

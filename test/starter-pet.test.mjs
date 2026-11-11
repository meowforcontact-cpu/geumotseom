import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {claimStarterPet,needsStarterPet,snapshot,validateSave,purchase} from '../src/storage.mjs';
import {PET_PRODUCTS} from '../src/pet-catalog.mjs';

const items=[
 {id:'m1',cat:'가구',name:'작은 화분',price:80},
 {id:'p1',cat:'펫',name:'천사냥',price:0,only:'누적 미션 보상'},
 ...PET_PRODUCTS
];
function fresh(){
 return {
  coins:1500,earned:1000,xp:500,owned:['m1'],
  eq:{벽:null,바닥:null,칭호:null,배지:null,가구:['m1']},
  pets:[{name:'피카',kind:'white',hatched:false,taps:0}],
  rep:0,hun:2,mood:2,poop:[],att:{streak:0,done:false},
  sent:[],log:[],pos:{m1:[2,78],m2:[94,72],m3:[34,80]}
 };
}

for(const [kind,id] of [['cat','p3'],['dog','p2']]){
 test('new user receives one free '+kind+' starter, not the legacy bunny',()=>{
  const state=fresh(),wallet=state.coins;
  assert.equal(needsStarterPet(state),true);
  claimStarterPet(state,kind,{preserveLegacy:false});
  assert.deepEqual(state.pets.map(p=>p.kind),[kind]);
  assert.equal(state.rep,0);
  assert.equal(state.coins,wallet);
  assert.equal(state.owned.includes(id),true);
  assert.equal(needsStarterPet(state),false);
  assert.throws(()=>claimStarterPet(state,kind==='cat'?'dog':'cat'),/이미 선택/);
  const restored=validateSave(snapshot(state),items);
  assert.deepEqual(restored.pets.map(p=>p.kind),[kind]);
  assert.deepEqual(restored.owned.filter(i=>i==='p2'||i==='p3'),[id]);
 });
}

test('returning legacy user keeps existing pet, coins and furniture',()=>{
 const state=fresh();state.pets[0].hatched=true;state.pets[0].taps=3;
 const before=structuredClone({owned:state.owned,eq:state.eq,coins:state.coins,pos:state.pos});
 claimStarterPet(state,'dog',{preserveLegacy:true});
 assert.deepEqual(state.pets.map(p=>p.kind),['white','dog']);
 assert.equal(state.rep,1);
 assert.equal(state.coins,before.coins);
 assert.deepEqual(state.eq,before.eq);
 assert.deepEqual(state.pos,before.pos);
 const restored=validateSave(snapshot(state),items);
 assert.deepEqual(restored.pets.map(p=>p.kind),['white','dog']);
});

test('one free starter cannot purchase the other cat or dog for zero coins',()=>{
 const state=fresh();claimStarterPet(state,'cat',{preserveLegacy:false});
 assert.throws(()=>purchase(state,PET_PRODUCTS.find(p=>p.id==='p2')),/구매할 수 없는/);
 assert.throws(()=>purchase(state,PET_PRODUCTS.find(p=>p.id==='p4')),/구매할 수 없는/);
});

test('built web game includes choice UI and catalog card click handling',async()=>{
 const source=await readFile('dist/index.html','utf8');
 assert.match(source,/function showStarterChoice\(/);
 assert.match(source,/function petShopAction\(/);
 assert.match(source,/data-starter-kind/);
 assert.match(source,/data-pet-shop/);
 assert.match(source,/ITEMS\.push\(\.\.\.\[\{"id":"p2"/);
});

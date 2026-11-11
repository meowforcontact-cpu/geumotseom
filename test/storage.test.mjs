import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {snapshot,validateSave,purchase,day,needsStarterPet,claimStarterPet} from '../src/storage.mjs';
const products=[{id:'m1',cat:'가구',price:80},{id:'w1',cat:'벽',price:150},{id:'p1',cat:'펫',price:500},{id:'t2',cat:'칭호',price:0,only:'멤버십 전용'}];
const fresh=()=>({coins:1500,earned:1000,xp:0,owned:['m1'],eq:{벽:null,바닥:null,칭호:null,배지:null,가구:['m1']},pets:[{name:'피카',kind:'white',hatched:false,taps:0}],rep:0,hun:2,mood:2,poop:[],att:{streak:0,done:false,total:0,totalEstimated:false,lastDate:null},sent:[],log:[],pos:{m1:[2,78],m2:[94,72],m3:[34,80]}});
test('saved pet, wallet and room round-trip without losing ownership',()=>{const s=fresh();s.pets[0].hatched=true;s.pets[0].taps=3;assert.deepEqual(validateSave(snapshot(s),products),{...s,cleaned:0})});
test('purchase deducts once and leaves equipment unchanged',()=>{const s=fresh();const r=purchase(s,products[1]);Object.assign(s,r);assert.equal(s.coins,1350);assert.equal(s.eq.벽,null);assert.throws(()=>purchase(s,products[1]),/이미/);assert.equal(s.coins,1350)});
test('insufficient balance and exclusive products cannot be purchased',()=>{const s=fresh();s.coins=20;assert.throws(()=>purchase(s,products[1]),/부족/);assert.throws(()=>purchase(s,products[3]),/조건/);assert.equal(s.owned.length,1)});
test('unowned and wrong-category equipment are rejected on import',()=>{let v=snapshot(fresh());v.state.eq.벽='w1';assert.throws(()=>validateSave(v,products),/보유/);v=snapshot(fresh());v.state.eq.벽='m1';assert.throws(()=>validateSave(v,products),/보유/)});
test('malformed wallets, duplicate IDs and invalid pets are rejected',()=>{for(const change of [s=>s.coins=-1,s=>s.coins=NaN,s=>s.owned.push('m1'),s=>s.pets[0].kind='unknown',s=>s.pos.m1=[Infinity,0]]){const v=snapshot(fresh());change(v.state);assert.throws(()=>validateSave(v,products))}});
test('import strips unexpected fields and prototype keys',()=>{const v=snapshot(fresh());v.state.token='not retained';v.state.__proto__={attack:true};const s=validateSave(v,products);assert.equal(s.token,undefined);assert.equal(s.attack,undefined)});
test('Korean day rollover resets daily actions, preserves cumulative balance',()=>{const s=fresh();s.att={done:true,streak:4};s.sent=[['친구','고마워']];let v=snapshot(s);v.day=day(Date.now()-86400000);let r=validateSave(v,products);assert.equal(r.att.done,false);assert.equal(r.att.streak,4);assert.deepEqual(r.sent,[]);assert.equal(r.coins,1500);v.day='2020-01-01';assert.equal(validateSave(v,products).att.streak,0)});
test('build contains no production API or preview bearer, keeps original device art',async()=>{const html=await readFile('dist/index.html','utf8');assert.doesNotMatch(html,/Bearer preview|fetch\(['"]\/api|CLIENT_TOKEN|DISCORD_CLIENT_SECRET/);assert.match(html,/function makeEgg/);assert.match(html,/function makeConsole/);assert.match(html,/이 기기에 저장/)});

test('first-time player chooses exactly one free cat or dog without spending currency',()=>{
 const productsWithPets=[...products,{id:'p2',cat:'펫',price:0,only:'첫 선택'},{id:'p3',cat:'펫',price:0,only:'첫 선택'}];
 const s=fresh();
 assert.equal(needsStarterPet(s),true);
 claimStarterPet(s,'cat',{preserveLegacy:false});
 assert.deepEqual(s.pets.map(p=>p.kind),['cat']);
 assert.equal(s.rep,0);
 assert.equal(s.coins,1500);
 assert.equal(s.owned.includes('p3'),true);
 assert.equal(s.owned.includes('p2'),false);
 assert.equal(needsStarterPet(s),false);
 assert.throws(()=>claimStarterPet(s,'dog',{preserveLegacy:false}),/이미/);
 assert.deepEqual(validateSave(snapshot(s),productsWithPets).pets,s.pets);
});
test('older saves keep their rabbit and furniture when choosing a starter',()=>{
 const s=fresh();s.pets[0].hatched=true;
 const oldPositions=structuredClone(s.pos),oldFurniture=[...s.eq.가구];
 claimStarterPet(s,'dog',{preserveLegacy:true});
 assert.deepEqual(s.pets.map(p=>p.kind),['white','dog']);
 assert.deepEqual(s.pos,oldPositions);
 assert.deepEqual(s.eq.가구,oldFurniture);
 assert.equal(s.coins,1500);
});
test('pet purchase charges the catalog price only when a payable pet is configured',()=>{
 const s=fresh();claimStarterPet(s,'cat',{preserveLegacy:false});
 const dogForSale={id:'p2',cat:'펫',pet:'dog',price:900};
 const purchased=purchase(s,dogForSale);Object.assign(s,purchased);
 assert.equal(s.coins,600);
 assert.equal(s.owned.includes('p2'),true);
 assert.throws(()=>purchase(s,dogForSale),/이미/);
 assert.throws(()=>purchase(s,{...dogForSale,id:'p4',only:'미확정'}),/조건/);
});

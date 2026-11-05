import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {ensureDaily,recordDailyAction,snapshot,validateSave,day} from '../src/storage.mjs';
const fixture=()=>({coins:1500,earned:1000,xp:0,owned:['m1'],eq:{벽:null,바닥:null,칭호:null,배지:null,가구:['m1']},pets:[{name:'친구',kind:'white',hatched:true,taps:3}],rep:0,hun:2,mood:2,poop:[],att:{streak:0,done:false},sent:[],log:[],pos:{m1:[2,78],m2:[94,72],m3:[34,80]}});
test('daily actions persist once without granting unapproved currency or XP',()=>{
 const s=fixture();assert.equal(recordDailyAction(s,'feed'),true);assert.equal(recordDailyAction(s,'feed'),false);
 assert.equal(recordDailyAction(s,'unknown'),false);assert.equal(s.coins,1500);assert.equal(s.xp,0);
 const saved=validateSave(snapshot(s),[{id:'m1',cat:'가구'}]);assert.deepEqual(saved.daily,{day:day(),feed:true,play:false});
});
test('KST midnight resets mission flags while retaining account balances',()=>{
 const before=day(Date.parse('2026-11-05T14:59:59Z')),after=day(Date.parse('2026-11-05T15:00:00Z'));
 assert.equal(before,'2026-11-05');assert.equal(after,'2026-11-06');
 const s=fixture();recordDailyAction(s,'play',before);ensureDaily(s,after);
 assert.deepEqual(s.daily,{day:after,feed:false,play:false});assert.equal(s.coins,1500);
});
test('old saves remain readable and stale daily records reset on import',()=>{
 const s=fixture();assert.equal(validateSave(snapshot(s),[{id:'m1',cat:'가구'}]).daily,undefined);
 s.daily={day:'2020-01-01',feed:true,play:true};const v=snapshot(s);
 assert.deepEqual(validateSave(v,[{id:'m1',cat:'가구'}]).daily,{day:day(),feed:false,play:false});
 v.state.daily.feed='yes';assert.throws(()=>validateSave(v,[{id:'m1',cat:'가구'}]),/일일미션/);
});
test('actual care path counts only successful feeding and playing',async()=>{
 const html=await readFile('dist/index.html','utf8');
 const source=html.slice(html.indexOf('function care('),html.indexOf('function cleanPoop('));
 const s=fixture(),ctx=vm.createContext({state:s,goHome(){},idle:0,stage:()=>s.pets[0].hatched?'child':'egg',say(){},startAnim(){},recordDaily:action=>recordDailyAction(s,action)});
 vm.runInContext(source,ctx);
 s.hun=3;vm.runInContext("care('eat',1,0)",ctx);assert.equal(s.daily,undefined);
 s.pets[0].hatched=false;vm.runInContext("care('play')",ctx);assert.equal(s.daily,undefined);
 s.pets[0].hatched=true;s.hun=0;vm.runInContext("care('play')",ctx);assert.equal(s.daily,undefined);
 vm.runInContext("care('eat',1,0);care('play')",ctx);assert.equal(s.daily.feed,true);assert.equal(s.daily.play,true);
});

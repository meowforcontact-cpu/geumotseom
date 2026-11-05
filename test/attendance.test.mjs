import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {day,syncAttendance,claimAttendance,snapshot,validateSave} from '../src/storage.mjs';
const at=date=>Date.parse(date+'T12:00:00+09:00');
const fresh=()=>({att:{streak:0,done:false}});
test('one attendance per Korean date, consecutive and cumulative counters persist independently',()=>{
 const s=fresh();assert.equal(claimAttendance(s,at('2026-11-05')),true);
 assert.equal(claimAttendance(s,at('2026-11-05')),false);
 assert.equal(claimAttendance(s,at('2026-11-06')),true);
 assert.equal(s.att.streak,2);assert.equal(s.att.total,2);
 syncAttendance(s,at('2026-11-07')); // Open the app without checking in.
 syncAttendance(s,at('2026-11-08'));
 assert.equal(s.att.streak,0);assert.equal(s.att.total,2);
 claimAttendance(s,at('2026-11-08'));assert.equal(s.att.streak,1);assert.equal(s.att.total,3);
 assert.equal(s.att.totalEstimated,false);
});
test('KST midnight allows the next stamp and duplicate taps do not count twice',()=>{
 const s=fresh();claimAttendance(s,Date.parse('2026-11-05T14:59:59Z'));
 assert.equal(claimAttendance(s,Date.parse('2026-11-05T15:00:00Z')),true);
 assert.equal(claimAttendance(s,Date.parse('2026-11-05T15:00:01Z')),false);
 assert.equal(s.att.streak,2);assert.equal(s.att.total,2);
});
const full=()=>({coins:1500,earned:1000,xp:0,owned:['m1'],eq:{벽:null,바닥:null,칭호:null,배지:null,가구:['m1']},pets:[{name:'피카',kind:'white',hatched:false,taps:0}],rep:0,hun:2,mood:2,poop:[],att:{streak:4,done:true},sent:[],log:[],pos:{m1:[2,78],m2:[94,72],m3:[34,80]}});
const items=[{id:'m1',cat:'가구'}];
test('legacy records retain known counts with a lower-bound marker, never fabricate exact history',()=>{
 const save=snapshot(full()),s=validateSave(save,items);
 assert.equal(s.att.total,4);assert.equal(s.att.totalEstimated,true);assert.equal(s.att.lastDate,day());
 const reloaded=validateSave(snapshot(s),items);assert.deepEqual(reloaded.att,s.att);
 save.day='2020-01-01';const stale=validateSave(save,items);
 assert.equal(stale.att.total,4);assert.equal(stale.att.streak,0);assert.equal(stale.att.done,false);
});
test('new cumulative data survives export/import and malformed counters are rejected',()=>{
 const s=full();s.att={streak:0,done:false};claimAttendance(s);
 assert.deepEqual(validateSave(snapshot(s),items).att,s.att);
 const broken=snapshot(s);broken.state.att={...s.att,total:-1};assert.throws(()=>validateSave(broken,items),/누적 출석/);
});
test('actual screen awards once, saves totals, and remains on completed attendance',async()=>{
 const source=await readFile(new URL('../src/navigation-v9.js',import.meta.url),'utf8');
 const fragment=source.slice(source.indexOf('function attendanceView'),source.indexOf('const dailyTitle'));
 const state={att:{streak:0,done:false},coins:0,xp:0};let saves=0,renders=0;
 const ctx=vm.createContext({state,SCR:{},day,claimAttendance,persist(){syncAttendance(state);saves++},gain(c,x){state.coins+=c;state.xp+=x},say(){},render(){renders++},fmt:String,icon:()=>'<canvas></canvas>'});
 vm.runInContext(fragment,ctx);vm.runInContext('SCR.att.ok();SCR.att.ok()',ctx);
 assert.equal(state.coins,100);assert.equal(state.xp,5000);assert.equal(state.att.total,1);assert.equal(renders,1);assert.ok(saves>=3);
 assert.match(vm.runInContext('SCR.att.view()',ctx),/오늘 출석 완료/);
});

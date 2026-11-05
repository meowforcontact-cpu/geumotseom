import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {KEY,day,snapshot,validateSave} from '../src/storage.mjs';
const adapter=await readFile(new URL('../src/original-runtime.js',import.meta.url),'utf8');
function harness(){
  const memory=new Map(),state={coins:1320,earned:1000,xp:12340,owned:['m1','m2'],eq:{벽:null,바닥:null,칭호:null,배지:null,가구:['m2']},pets:[{name:'내 고양이',kind:'white',hatched:true,taps:3}],rep:0,hun:2,mood:2,poop:[],att:{streak:3,done:false},sent:[],log:[],pos:{m1:[2,78],m2:[94,72],m3:[34,80]}};
  let skin='blue';
  const theme={label:'테마 바꾸기',action:()=>{skin=skin==='pink'?'blue':'pink';memory.set('pikaSkin',skin)}};
  const context=vm.createContext({state,KEY,day,snapshot,validateSave,ITEMS:[{id:'m1',cat:'가구'},{id:'m2',cat:'가구'}],SCR:{set:{list:()=>[theme,{label:'소리'},{label:'내 XP'},{label:'내 계정'},{label:'뒤로'}]}},L:(label,icon,action)=>({label,action}),BACK:()=>({label:'뒤로'}),localStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)},say(){},setInterval(){},fetch:async()=>{throw Error('offline')},render(){},scr:()=>({id:'home'})});
  context.buyOK=async()=>{};vm.runInContext(adapter,context);return {state,memory,run:code=>vm.runInContext(code,context)};
}
test('original settings retain the theme action and expose storage in the original list',()=>{const h=harness();assert.equal(h.run('SCR.set.list()[0].label'),'테마 바꾸기');h.run('SCR.set.list()[0].action()');assert.equal(h.memory.get('pikaSkin'),'pink');assert.equal(h.run('SCR.set.list()[3].label'),'저장·연결');h.run('SCR.set.list()[0].action()');assert.equal(h.memory.get('pikaSkin'),'blue')});
test('restored UI retains existing pet name, balance, ownership and furniture across reloads',()=>{const h=harness(),saved=structuredClone(h.state);h.run('persist()');h.state.coins=0;h.state.pets[0].name='changed';h.state.eq.가구=[];h.run('restore()');assert.equal(h.state.coins,saved.coins);assert.equal(h.state.pets[0].name,saved.pets[0].name);assert.deepEqual(h.state.eq.가구,saved.eq.가구);assert.deepEqual(h.state.owned,saved.owned)});

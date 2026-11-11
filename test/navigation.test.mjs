import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../src/navigation-v9.js',import.meta.url),'utf8');
function harness(){
 const original='{"version":1,"state":{"coins":321}}',memory=new Map([['save',original],['pikaSkin','pink'],['pikaSnd','0']]);
 const ui={stack:[{id:'home'}]},state={sent:[],coins:321},SCR={menu:{},set:{list:()=>[]},save:{list:()=>[]},att:{ok(){}},daily:{right:()=>''}},F={act:[],out:[]};
 const ctx=vm.createContext({KEY:'save',localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)},SCR,F,S:{},state,ui,document:{addEventListener(){}},push:id=>ui.stack.push({id}),goHome:()=>ui.stack.splice(1),render(){},persist(){},L:(label,ic,go)=>({label,go}),BACK:()=>({label:'뒤로'}),icon:()=>'',esc:x=>x});
 ctx.homeHTML=()=>'<div class="bd"></div>';
 ctx.body=()=>'';
 vm.runInContext(source,ctx);return {memory,ui,state,SCR,run:s=>vm.runInContext(s,ctx),original};
}
test('first upgrade preserves original progress and appearance once, without altering the active save',()=>{
 const h=harness();const before=JSON.parse(h.memory.get('geumotseom.before-menu-v9'));
 assert.equal(before.save,h.original);assert.equal(before.skin,'pink');assert.equal(before.sound,'0');assert.equal(h.memory.get('save'),h.original);
 h.memory.set('save','new progress');h.run('preserveBeforeMenu()');assert.equal(JSON.parse(h.memory.get('geumotseom.before-menu-v9')).save,h.original);
});
test('map destinations preserve wallet and return from direct community navigation to the map',()=>{
 const h=harness();h.run("visitMapPlace('shop')");assert.equal(h.ui.stack.at(-1).id,'shop');
 h.run("visitMapPlace('home');push('friends');visitMapPlace('plaza');returnToMap()");assert.equal(h.ui.stack.at(-1).id,'out');assert.equal(h.ui.stack.length,2);
 h.run("visitMapPlace('plaza');returnToMap()");assert.equal(h.ui.stack.at(-1).id,'out');assert.equal(h.ui.stack.length,2);assert.equal(h.state.coins,321);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

test('all face buttons are outside the raster panel before control painting',async()=>{
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 const start=html.indexOf('function makeConsole('),end=html.indexOf('function makeEgg(',start),code=html.slice(start,end);
 const panel=code.match(/const inPanel=([^;]+);/);
 assert.ok(panel);
 const buttons=vm.runInNewContext(code.match(/const BT=(\[[^\n]+\]);/)[1]);
 const inPanel=vm.runInNewContext('(x,y)=>'+panel[1]);
 for(const [cx,cy,r,key] of buttons){
  if(!['a','b','x','y'].includes(key))continue;
  // Test every rendered pixel of each physical circle, including its left rim.
  for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){
   if(Math.hypot(x+.5-cx,y+.5-cy)<=r)assert.equal(inPanel(x,y),false,key+' clipped at '+x+','+y);
  }
 }
});


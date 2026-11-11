import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const script=await readFile(new URL('../src/room-photo.js',import.meta.url),'utf8');
const context=vm.createContext({SCR:{deco:{list:()=>[]}},MENU_ALL:[],L:()=>{}});
vm.runInContext(script,context);
const crop=(w,h,z,x=.5,y=.5)=>Array.from(vm.runInContext('photoCrop('+w+','+h+','+z+',{x:'+x+',y:'+y+'})',context));
test('photo at 1× captures a complete 4:3 room',()=>{
 const [x,y,w,h]=crop(680,512,1);
 assert.equal(w,680);assert.equal(h,510);assert.ok(x>=0&&y>=0);
});
test('3× photo crops without escaping world bounds',()=>{
 for(const [x,y] of [[0,0],[1,1],[.5,.5]]){
  const [left,top,w,h]=crop(680,512,3,x,y);
  assert.ok(left>=0&&top>=0&&left+w<=680.001&&top+h<=512.001);
  assert.ok(Math.abs(w/h-4/3)<1e-5);
 }
});
test('portrait room is cropped to 4:3 without distortion',()=>{
 const [x,y,w,h]=crop(1024,1024,1);
 assert.equal(w,1024);assert.equal(h,768);assert.equal(y,128);
});


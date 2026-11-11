import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../src/room-placement.js',import.meta.url),'utf8');
const context=vm.createContext({});vm.runInContext(source,context);
const run=expression=>vm.runInContext(expression,context);
test('fixed 170×128 camera keeps pet feet on the visible floor',()=>{
 const bounds=run('roomPetFootLimits()');assert.equal(bounds.min,72);assert.equal(bounds.max,124);
});
test('standing furniture can overlap the back wall but its feet cannot float',()=>{
 assert.equal(JSON.stringify(run("roomPlacementPosition('cream_f1',32,53,9,5)")),JSON.stringify([9,19]));
 assert.equal(JSON.stringify(run("roomPlacementPosition('cream_f1',32,53,9,29)")),JSON.stringify([9,29]));
});
test('wall-mounted windows stay on wall and cannot be dragged to the floor',()=>{
 assert.equal(run("roomPlacementSurface('cream_f2')"),'wall');
 assert.equal(JSON.stringify(run("roomPlacementPosition('cream_f2',44,36,130,109)")),JSON.stringify([126,36]));
});
test('floor furniture clamps fully inside the room while keeping original dimensions',()=>{
 assert.equal(JSON.stringify(run("roomPlacementPosition('cream_f7',48,30,-400,1000)")),JSON.stringify([0,98]));
 assert.equal(JSON.stringify(run("roomPlacementPosition('cream_f10',17,12,200,60)")),JSON.stringify([153,60]));
});

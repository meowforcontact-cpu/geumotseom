import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const context=vm.createContext({WeakMap});
const source=await readFile(new URL('../src/tint-palette.js',import.meta.url),'utf8');
vm.runInContext(source,context);
const tint=(r,g,b,a)=>JSON.parse(JSON.stringify(vm.runInContext('atticFurnitureTintPixel('+[r,g,b,a].join(',')+')',context)));
test('pink room converts blue fabric and outline but preserves alpha',()=>{
 assert.deepEqual(tint(162,192,226,255),[220,171,209,255]);
 assert.deepEqual(tint(61,79,119,128),[113,66,99,128]);
});
test('neutral cream and green props remain unchanged',()=>{
 assert.deepEqual(tint(247,231,214,255),[247,231,214,255]);
 assert.deepEqual(tint(90,145,78,255),[90,145,78,255]);
 assert.deepEqual(tint(167,194,230,0),[167,194,230,0]);
});

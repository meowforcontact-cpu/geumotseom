import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

test('published device uses exact shared button art and hitbox coordinates',async()=>{
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 const match=html.match(/const DEVS=([\s\S]*?);\s*let MODE=/);
 assert.ok(match,'compiled device layout');
 const dev=vm.runInNewContext('('+match[1]+')').console;
 const artMatch=[...html.matchAll(/const BT=(\[[^\n]+\]);/g)].find(m=>m[1].includes('"paw"'));
 assert.ok(artMatch,'compiled button art positions');
 const art=vm.runInNewContext(artMatch[1]);
 assert.equal(dev.W,448);assert.equal(dev.H,262);
 const keys=['OK','BACK','MENU','HOME','FEED','PLAY'];
 for(const key of keys){
   const dom=dev.btn.find(b=>b[0]===key);
   const map={OK:'a',BACK:'b',MENU:'x',HOME:'y',FEED:'food',PLAY:'play'};
   const candidate=art.find(b=>b[3]===map[key]);
   assert.ok(dom&&candidate,key+' must have art and hitbox');
   assert.equal(candidate[0],dom[1],key+' x');
   assert.equal(candidate[1]+10,dom[2],key+' shell offset y');
   assert.ok(dom[1]-dom[3]>0&&dom[1]+dom[3]<dev.W,key+' horizontal shell bounds');
   assert.ok(dom[2]-dom[3]>0&&dom[2]+dom[3]<dev.H,key+' vertical shell bounds');
 }
 const cross=html.match(/const DC=(\[[0-9,]+\])/);
 assert.ok(cross);const dc=vm.runInNewContext(cross[1]);
 for(const key of ['U','D','L','R']){
   const b=dev.btn.find(b=>b[0]===key);assert.ok(b,'D-pad '+key+' must be clickable');
   assert.equal(b[1],dc[0]+(key==='L'?-25:key==='R'?25:0));
   assert.equal(b[2],dc[1]+10+(key==='U'?-25:key==='D'?25:0));
 }
 assert.match(html,/renderControllerForeground\(shellRasterCache\[shellKey\],shellBlankRasterCache\[shellKey\]\)/);
 assert.match(html,/const plain=MODE==='console'\?makeConsole\(th,skin,false\):c/);
});

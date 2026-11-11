import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('foreground button artwork follows the scaled handheld geometry',async()=>{
 const source=await readFile(new URL('../src/pet.html',import.meta.url),'utf8');
 const compiled=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 for(const html of [source,compiled]){
  const rule=html.match(/\.btns>\.controller-art-front\{([^}]+)\}/);
  assert.ok(rule,'foreground controller canvas must have a scoped layout rule');
  for(const declaration of ['position:absolute','inset:0','display:block','width:100%','height:100%','image-rendering:pixelated','pointer-events:none']){
   assert.ok(rule[1].includes(declaration),'missing controller geometry: '+declaration);
  }
  assert.match(html,/\.btns>\.eb\{z-index:1\}/,'button hitboxes must stay above the artwork');
 }
 const renderer=await readFile(new URL('../build.mjs',import.meta.url),'utf8');
 assert.match(renderer,/host\.prepend\(layer\)/,'foreground art must live in the scaled control host');
 assert.match(renderer,/renderControllerForeground\(shellRasterCache\[shellKey\],shellBlankRasterCache\[shellKey\]\)/);
});

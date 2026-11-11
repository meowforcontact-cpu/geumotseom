import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('console physical controls are composited exactly once on their own layer',async()=>{
 const build=await readFile(new URL('../build.mjs',import.meta.url),'utf8');
 const output=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(build,/makeConsole\(th,skin,false\)/);
 assert.match(build,/renderControllerForeground\(shellRasterCache\[shellKey\],shellBlankRasterCache\[shellKey\]\)/);
 assert.match(output,/function makeConsole\(th,sk,paintControls=true\)/);
 assert.match(output,/paintControls&&dp\(x,y\)/);
 assert.match(output,/if\(paintControls\)for\(const \[cx,cy,r,key,ic\] of BT\)/);
 assert.match(output,/whole\[i\]===background\[i\]/);
 assert.doesNotMatch(output,/for\(let y=80;y<172;y\+\+\)/);
});

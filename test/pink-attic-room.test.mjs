import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('pink attic reference art is 4:3 WebP and separated from movable decorations',async()=>{
 const data=await readFile(new URL('../src/assets/pink-attic-v1/room.webp',import.meta.url));
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
 const view=data.toString('ascii',12,16);
 assert.equal(view,'VP8 ');
 const width=((data[26]&63)<<8)|data[27];
 const height=((data[28]&63)<<8)|data[29];
 assert.equal(width,170);assert.equal(height,128);
});
test('pink room is an opt-in theme and legacy save validates',async()=>{
 const build=await readFile(new URL('../build.mjs',import.meta.url),'utf8');
 const room=await readFile(new URL('../src/room-assets.js',import.meta.url),'utf8');
 const storage=await readFile(new URL('../src/storage.mjs',import.meta.url),'utf8');
 assert.match(build,/pink-attic-v1\/room\.webp/);
 assert.match(room,/attic:'겨울 핑크 다락방'/);
 assert.match(room,/pinkAtticRoomImage\.src=WHITEWOOD_ASSETS\.attic/);
 assert.match(storage,/whitewood','attic/);
});

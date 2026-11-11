import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile('src/room-depth-public.js','utf8');
function harness(){
 const art=(alpha=[255,255,255,255])=>({width:2,height:2,naturalWidth:2,naturalHeight:2,complete:true,alpha});
 const images={a:art(),b:art()},avatar=art(),calls=[];
 const state={eq:{가구:['b','a']},pos:{a:[0,10],b:[0,30]},poop:[]};
 const ctx=vm.createContext({state,cat:{x:0,y:100,tx:0,ty:100,t:0,wait:30},furnitureEdit:null,FS:32,FLOOR:106,RW:128,calm:true,anim:null,
  furnitureImages:images,whitewoodFurnitureImages:images,item:id=>({id,size:[40,80]}),isWhitewoodRoom:()=>true,
  furnitureRenderBounds:(id,p)=>({x:(p||state.pos[id])[0],y:(p||state.pos[id])[1],width:40,height:80}),
  stage:()=> 'child',expr:()=> 'normal',pet:()=>({kind:'cat'}),sprite:()=>avatar,
  drawFurniture:(_,id)=>calls.push(id),drawPet:()=>calls.push('pet'),put:()=>calls.push('poop'),poopX:x=>x,S:{ipoop:{}},
  roomFurnitureAt(){},Uint8Array,
  document:{createElement:()=>{let current;return {getContext:()=>({drawImage:im=>current=im,getImageData:()=>({data:new Uint8Array(current.alpha.flatMap(a=>[0,0,0,a]))})})}}}
 });
 vm.runInContext(source,ctx);
 return {ctx,state,images,avatar,calls,art,run:code=>vm.runInContext(code,ctx)};
}
test('all furniture and pet sort by feet, independently of equip order',()=>{
 const h=harness();h.run('drawRoomDepthSorted({},true)');assert.deepEqual(h.calls,['a','pet','b']);
 h.state.eq.가구.reverse();h.calls.length=0;h.run('drawRoomDepthSorted({},true)');assert.deepEqual(h.calls,['a','pet','b']);
});
test('pet crossing furniture feet changes who occludes whom',()=>{
 const h=harness();h.run('cat.y=120;drawRoomDepthSorted({},true)');assert.deepEqual(h.calls,['a','b','pet']);
 h.calls.length=0;h.run('cat.y=85;drawRoomDepthSorted({},true)');assert.deepEqual(h.calls,['pet','a','b']);
});
test('live drag draft participates in drawing and picking before it is saved',()=>{
 const h=harness();h.run("furnitureEdit={id:'a',draft:[0,45]};drawRoomDepthSorted({},true)");
 assert.deepEqual(h.calls,['pet','b','a']);assert.deepEqual(h.state.pos.a,[0,10]);
 assert.equal(h.run('roomFurnitureAt(5,80)'),'a');
});
test('ties remain stable when equip order changes',()=>{
 const h=harness();h.state.pos.b=[0,10];h.run('drawRoomDepthSorted({},true)');assert.deepEqual(h.calls,['a','b','pet']);
 h.calls.length=0;h.state.eq.가구.reverse();h.run('drawRoomDepthSorted({},true)');assert.deepEqual(h.calls,['a','b','pet']);
});
test('opaque front furniture is selected, its transparent corner exposes the back object',()=>{
 const h=harness();h.images.b=h.art([0,255,255,255]);
 assert.equal(h.run('roomFurnitureAt(5,35)'),'a');
 assert.equal(h.run('roomFurnitureAt(25,35)'),'b');
});
test('visible pet blocks picking furniture hidden behind it',()=>{
 const h=harness();h.run('cat.y=120');
 assert.equal(h.run('roomFurnitureAt(20,90)'),null);
 assert.equal(h.run('roomDepthPetAt(20,90)'),true);
});
test('a transparent pet pixel exposes the furniture behind it',()=>{
 const h=harness();h.avatar.alpha=[0,255,255,255];h.run('cat.y=120');
 assert.equal(h.run('roomFurnitureAt(20,90)'),'b');
 assert.equal(h.run('roomDepthPetAt(20,90)'),false);
});
test('background-only pass does not draw the pet or advance its position',()=>{
 const h=harness();h.run('drawRoomDepthSorted({},false)');assert.deepEqual(h.calls,['a','b']);assert.equal(h.run('cat.y'),100);
});

test('movement advances before ordering, and rendering never advances it again',()=>{
 const h=harness();h.run('calm=false;cat.tx=10;cat.ty=110;advanceRoomPetForDepth()');
 const x=h.run('cat.x'),y=h.run('cat.y');
 assert.ok(Math.abs(Math.hypot(x,y-100)-1)<1e-10);
 h.run('drawRoomDepthSorted({},true)');
 assert.equal(h.run('cat.x'),x);assert.equal(h.run('cat.y'),y);
 h.run('anim={type:"pet"};advanceRoomPetForDepth()');
 assert.equal(h.run('cat.x'),x);assert.equal(h.run('cat.y'),y);
});

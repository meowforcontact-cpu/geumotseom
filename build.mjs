import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {PET_PRODUCTS,PET_CATALOG} from './src/pet-catalog.mjs';
let html=(await readFile('src/pet.html','utf8')).replace(/\r\n/g,'\n');
html=html.replaceAll('"DotGothic16","Apple SD Gothic Neo","Malgun Gothic",monospace','Galmuri9,monospace');
html=html.replace(/<link href="https:\/\/fonts\.googleapis\.com[^"]*" rel="stylesheet">/g,'');
const replace=(before,after)=>{if(!html.includes(before))throw Error('원본 변경 확인 필요: '+before.slice(0,65));html=html.replace(before,after)};
replace("tintAll(k,t,R)\n  winLight(k,t,sx,sy,sw,sh);", "/* Room lighting is composited after furniture and pet. */");
replace("(vh-padT-14)*GD.W/GD.H,1040", "(vh-padT-48)*GD.W/GD.H,1040");
replace('const E1=[[84,38],[112,-6],[148,30]]','const E1=[[84,38],[112,0],[148,30]]');
// Widen the physical display and camera together: 288/190 = 194/128.
replace('bez:[96,48,256,194]','bez:[80,50,288,190]');
replace('mg:4,rw:170,stw:234','mg:4,rw:194,stw:270');
replace('rr(x,y,90,32,358,238,10),hole=(x,y)=>x>=98&&x<=349','rr(x,y,72,32,376,238,10),hole=(x,y)=>x>=80&&x<=367');
replace('rr(x,y,95,37,353,233,7)','rr(x,y,77,37,371,233,7)');
replace('rr(x,y-1,95,37,353,233,7)','rr(x,y-1,77,37,371,233,7)');
replace('rr(x-1,y,95,37,353,233,7)','rr(x-1,y,77,37,371,233,7)');
replace('const DC=[45,112],dH=(x,y,o)=>rr(x,y,10,99+o,80,125+o,6),dV=(x,y,o)=>rr(x,y,32,77+o,58,147+o,6)',
 'const DC=[36,112],dH=(x,y,o)=>rr(x,y,7,101+o,65,123+o,5),dV=(x,y,o)=>rr(x,y,25,83+o,47,141+o,5)');
replace('v>=-31&&v<=-23&&Math.abs(u)<=(v+31)*.9','v>=-25&&v<=-19&&Math.abs(u)<=(v+25)*.9');
replace("const BT=[[425,108,14.5,'a','paw'],[404.5,129,14.5,'b','back'],[404.5,87,14.5,'x','menu'],[384,108,14.5,'y','home']",
 "const BT=[[430,108,11.9,'a','paw'],[412,126,11.9,'b','back'],[412,90,11.9,'x','menu'],[394,108,11.9,'y','home']");
replace("btn:[['L',45,99,13,0,'위'],['R',45,145,13,0,'아래'],['L',22,122,13,0,'왼쪽'],['R',68,122,13,0,'오른쪽'],",
 "btn:[['U',36,103,10.66,0,'위'],['D',36,141,10.66,0,'아래'],['L',17,122,10.66,0,'왼쪽'],['R',55,122,10.66,0,'오른쪽'],");
replace("['OK',425,118,15,0,'A 확인'],['BACK',404.5,139,15,0,'B 뒤로'],['MENU',404.5,97,15,0,'X 메뉴'],['HOME',384,118,15,0,'Y 홈']",
 "['OK',430,118,12.3,0,'A 확인'],['BACK',412,136,12.3,0,'B 뒤로'],['MENU',412,100,12.3,0,'X 메뉴'],['HOME',394,118,12.3,0,'Y 홈']");
replace("ArrowUp:'L',ArrowDown:'R'","ArrowUp:'U',ArrowDown:'D'");
const bindStart=html.indexOf('function bindBtn(b,k){'),bindEnd=html.indexOf("\naddEventListener('keydown'",bindStart);
if(bindStart<0||bindEnd<0)throw Error('Device input boundary missing');
html=html.slice(0,bindStart)+(await readFile('src/device-input.js','utf8'))+html.slice(bindEnd);

replace("if(x===84||x===85||x===363||x===364)col=x%2?'#ffffff':mixc(C.body[2],C.out,.4);\n        else if(inPanel&&!frameO(x,y)){col=C.panel;", "if(inPanel&&!frameO(x,y)){");
replace("sid==='home'&&x>=sx&&x<sx+sw&&y>=sy&&y<sy+sh", "sid==='home'&&roomWindowAt(x,y)");
replace("const item=id=>",`ITEMS.push(...${JSON.stringify(PET_PRODUCTS)});\nconst item=id=>`);
replace("const PETS=[{kind:'white',name:'기본 냥이'},{kind:'angel',name:'천사냥'}];",`const PETS=${JSON.stringify(PET_CATALOG)};`);
replace("(d.own?esc(d.name):'???')","esc(d.name)");
// The species catalog uses species labels. Personal pet names stay in the save and profile.
replace("name:own?pp.name:p.name,own,pet:","name:p.name,own,pet:");
// Badges are postponed. Keep badge ownership/equipment intact in existing saves.
replace("const BOOK_TABS=[['펫','heart'],['칭호','crown'],['배지','star']];","const BOOK_TABS=[['펫','heart'],['칭호','crown']];");
replace("const d=cs[s.cur-n];if(!d.own)","const d=cs[s.cur-n];if(!d){s.cur=n;return render()}if(!d.own)");
// Achievements describe completed actions, not free starter furniture or only today's streak.
replace("()=>state.att.streak>0?1:0","()=>state.att.total>0?1:0");
replace("()=>state.att.streak,7","()=>state.att.bestStreak||state.att.streak,7");
replace("()=>state.owned.length>1?1:0","()=>state.firstPurchase||state.log.some(r=>r[0].endsWith(' 구매')&&/^-\\d/.test(r[1]))?1:0");
replace("state.coins=r.coins;state.owned=r.owned;state.log.unshift([i.name+' 구매'","state.coins=r.coins;state.owned=r.owned;state.firstPurchase=true;state.log.unshift([i.name+' 구매'");
replace("p.kind+'|'+(own&&pp.hatched?1:0)","p.kind+'|'+(!own||pp.hatched?1:0)");
replace("on:own&&pet().kind===p.kind,go:","on:own&&pet().kind===p.kind,how:'상점 → 펫에서 '+p.name+' 알을 살 수 있어요',go:");
// Preserve the supplied device, artwork, palette, menus and responsive layout.
const furnitureCatalog=JSON.parse(await readFile('src/furniture-catalog.json','utf8'));
const furnitureUrls=Object.fromEntries(await Promise.all(furnitureCatalog.map(async p=>[p.id,'data:image/png;base64,'+(await readFile('src/art/furniture/'+p.id+'.png')).toString('base64')])));
replace("const shopItems=s=>ITEMS.filter(i=>i.cat===CATS[s.cat||0][0]);","const shopItems=s=>ITEMS.filter(i=>!i.retired&&!i.only&&i.cat===CATS[s.cat||0][0]);");
replace("const icon=(k,px,cls)=>", "const legacyIcon=(k,px,cls)=>");
replace('const CATS=', 'function icon(k,px,cls){return FURNITURE_URLS[k]?furnitureIcon(k,px,cls):legacyIcon(k,px,cls)}\nconst CATS=');
replace("const pf=id=>{", "const pf=id=>{return drawFurniture(k,id);");
replace("state.pos[id][1]+FS<=FLOOR+4", "(state.pos[id]?.[1]??74)+(item(id)?.size?.[1]??FS)<=FLOOR+4");
replace("state.pos[id][1]+FS>FLOOR+4", "(state.pos[id]?.[1]??74)+(item(id)?.size?.[1]??FS)>FLOOR+4");
replace('<html>','<html lang="ko">');
// Show the signed-in Discord name on the ID card instead of the placeholder.
replace("d={name:'나',rep:p.name","d={name:(typeof account!=='undefined'&&account&&account.name)||'나',rep:p.name");
replace('<title>피카 다마고치</title>','<title>토모고찌 · 내 방</title>');
// Keep the archived original HTML intact; remove its cat renderer from builds.
const rabbitAssets={};
await mkdir('dist/assets/rabbits',{recursive:true});
for(const theme of ['blue','pink']){
  rabbitAssets[theme]={};
  for(const [key,suffix] of [['standing','standing'],['states','states'],['expressions','expressions']]){
    const file=theme+'-'+suffix+'.png';
    await copyFile('src/assets/rabbits/'+file,'dist/assets/rabbits/'+file);
    rabbitAssets[theme][key]='./assets/rabbits/'+file;
  }
}
const catStart=html.indexOf('// ===== 사용자가 만든 냥이');
const catEnd=html.indexOf('// 캐릭터 시트:',catStart);
if(catStart<0||catEnd<0)throw Error('Character renderer boundary missing');
const rabbitRuntime=(await readFile('src/rabbit-runtime.js','utf8')).replace('__RABBIT_ASSETS__',JSON.stringify(rabbitAssets));
const petAssets={blue:{},pink:{}};
await mkdir('dist/assets/pets',{recursive:true});
for(const theme of ['blue','pink'])for(const kind of ['dog','cat','raccoon']){
  const file=theme+'-'+kind+'.png';
  await copyFile('src/assets/pets/'+file,'dist/assets/pets/'+file);
  petAssets[theme][kind]='./assets/pets/'+file;
}
const petRuntime=(await readFile('src/pet-runtime.js','utf8')).replace('__PET_ASSETS__',JSON.stringify(petAssets));
html=html.slice(0,catStart)+rabbitRuntime+'\n'+petRuntime+'\n'+html.slice(catEnd);
replace('function sprite(st,ex,f,kind){','function sprite(st,ex,f,kind){\n  if(st!==\'egg\')return petSprite(kind,ex);');
const legacyStart=html.indexOf("  else{drawUser(k,USTATE[ex]");
const legacyEnd=html.indexOf('\n  spriteCache.set(key,c)',legacyStart);
if(legacyStart<0||legacyEnd<0)throw Error('Legacy cat fallback boundary missing');
html=html.slice(0,legacyStart)+html.slice(legacyEnd);
replace(",...Object.values(UTH[sk]).slice(1)",'');
replace("if(anim)return {eat:'eat',play:'play',pet:'happy',clean:'happy',cure:'happy',hello:'happy',no:'sad'}[anim.type]||'happy';","if(anim)return {eat:'eat',play:'play',pet:'happy',clean:'happy',cure:'happy',hello:'hello',no:'sad'}[anim.type]||'happy';\n  if(state.poop.length)return 'embarrassed';");
replace("return f%10===9?'blink':'normal';","if(!calm&&Math.abs(cat.x-cat.tx)>.5)return 'walk';\n  return 'normal';");
replace("0,kd),0,0)","0,kd),0,0,32,32)");
// Keep room coordinates unchanged but rasterize at 3x so the original eye
// highlights are not destroyed by an intermediate 64px sprite reduction.
replace('rc.width=RW;rc.height=RH;buf.width=RW;buf.height=RH;rx.imageSmoothingEnabled=false;bx.imageSmoothingEnabled=false;',
  'rc.width=RW*3;rc.height=RH*3;buf.width=RW*3;buf.height=RH*3;rx.imageSmoothingEnabled=false;bx.imageSmoothingEnabled=false;bx.setTransform(3,0,0,3,0,0);');
replace('const im=bx.getImageData(0,0,RW,RH),d=im.data;', 'const im=bx.getImageData(0,0,buf.width,buf.height),d=im.data;');
// Match the in-room pet to furniture rather than its 128px source canvas.
replace('k.drawImage(sprite(st,ex,f,pet().kind),x,CY,64,64);',
  "const hop=!calm&&ex==='play'?-(f%2?3:0):!calm&&ex==='walk'?-(f%2):0;\n  const petSize=st==='egg'?34:38;\n  const petX=x+(64-petSize)/2;\n  k.drawImage(sprite(st,ex,f,pet().kind),petX,FLOOR-petSize+hop,petSize,petSize);");
// Preserve the supplied rabbit's eye colors through the room quantizer.
replace('let v=qmap.get(key);','if(rabbitColors.has(key))continue;let v=qmap.get(key);');
replace("const qs=Q.get('stage');","Promise.all([loadRabbits(),loadPets()]).catch(error=>{console.error(error);say('캐릭터 로딩 실패 · 새로고침해 주세요');});\nconst qs=Q.get('stage');");
// Keep native keyboard access for the existing screen back action.
replace('<span class="bk" data-back title="뒤로">','<button type="button" class="bk" data-back aria-label="뒤로" title="뒤로">');
replace(`+icon('ileft',8)+'</span><span class="t">'+esc(title)`,`+icon('ileft',8)+'</button><span class="t">'+esc(title)`);
const pixelFont=(await readFile('src/fonts/Galmuri9.woff2')).toString('base64');
replace('</head>',`<style>@font-face{font-family:Galmuri9;src:url(data:font/woff2;base64,${pixelFont}) format('woff2');font-weight:400;font-style:normal;font-display:swap}${await readFile('src/navigation-v9.css','utf8')}</style></head>`);
const start=html.indexOf('// 서버 연동 지점:');
const end=html.indexOf('\nconst state=',start);
if(start<0||end<0)throw Error('상점 경계 없음');
html=html.slice(0,start)+`const ShopAPI={mode:'demo',async load(){return {coins:1500,earned:1000,owned:['m1']}},async buy(id){return purchase(state,item(id))}};\n`+html.slice(end);
replace('const state=',`const FURNITURE_CATALOG=${JSON.stringify(furnitureCatalog)};\nconst FURNITURE_URLS=${JSON.stringify(furnitureUrls)};\nITEMS.filter(i=>i.cat==='가구').forEach(i=>i.retired=true);ITEMS.push(...FURNITURE_CATALOG);\nconst state=`);
replace('<script>',`<style>${await readFile('src/ui-phase1.css','utf8')}</style>`+'<script type="module">\nimport {KEY,day,validateSave,snapshot,purchase,ensureDaily,recordDailyAction,syncAttendance,claimAttendance,ensureFurnitureLayout} from "./storage.mjs";');
replace("startAnim('eat',18);return say('냠냠!')", "recordDaily('feed');startAnim('eat',18);return say('냠냠!')");
replace("startAnim('play',20);return say('신난다!')", "recordDaily('play');startAnim('play',20);return say('신난다!')");
replace('if(i.pet)return;','if(!i || !state.owned.includes(i.id) || i.pet)return;');
replace("addEventListener('keydown',e=>{", "addEventListener('keydown',e=>{\n  if(e.target.closest?.('input,textarea,select,[contenteditable]'))return;");
replace("else{equip(i,true);back();say('방에 놓았어요!')}","else{back();say('보유함에 담았어요!')}\n    persist(); render();");
replace("const qs=Q.get('stage');",`const qs=null;\n${await readFile('src/original-runtime.js','utf8')}\n${await readFile('src/menu-icons.js','utf8')}\n${await readFile('src/navigation-v9.js','utf8')}\n`);
replace('att:{streak:3,done:false}','att:{streak:0,done:false}');
replace("state.coins=+Q.get('coins')||r.coins;state.earned=r.earned;state.owned=r.owned;r.owned.forEach(id=>equip(item(id),true));", "state.coins=r.coins;state.earned=r.earned;state.owned=r.owned;state.eq.가구=['m1'];restore();ensureFurnitureLayout(state,ITEMS);");
replace('layout();\n  if(stage()', 'layout(); persist();\n  if(stage()');
const roomFiles=['cream-wall','cream-floor','pink-wall','pink-floor','sky-dawn','sky-morning','sky-evening','sky-night'];
const roomUrls=Object.fromEntries(await Promise.all(roomFiles.map(async name=>[name,'data:image/png;base64,'+(await readFile('src/art/rooms/'+name+'.png')).toString('base64')])));
replace("const qs=null;",`const ROOM_ASSET_URLS=${JSON.stringify(roomUrls)};\nconst qs=null;`);
const roomStart=html.indexOf("  R('#dfeaff',0,0,RW,RH);",html.indexOf('function scene(withPet)'));
const roomEnd=html.indexOf("  if(pl.place==='friend'){k.globalCompositeOperation",roomStart);
if(roomStart<0||roomEnd<0)throw Error('Room background boundary missing');
html=html.slice(0,roomStart)+'  if(roomAssetsReady()){drawAssetRoom(k)}else{\n'+html.slice(roomStart,roomEnd)+'  }\n'+html.slice(roomEnd);
replace('for(let i=0;i<d.length;i+=4){const key=', 'if(!roomAssetsReady())for(let i=0;i<d.length;i+=4){const key=');
replace('function draw(){','function draw(){\n  if(roomAssetsReady()&&placeNow().place!=="park")return drawDetailedRoom();\n  if(buf.width!==RW){rc.width=buf.width=RW;rc.height=buf.height=RH;bx.setTransform(1,0,0,1,0,0);}');
replace('</script>',`${await readFile('src/whitewood-assets.js','utf8')}\n${await readFile('src/art-style.js','utf8')}\n${await readFile('src/room-assets.js','utf8')}\n${await readFile('src/furniture-runtime.js','utf8')}\n${await readFile('src/room-interactions.js','utf8')}\n${await readFile('src/diary-menu.js','utf8')}\naddEventListener('pagehide',persist);\ndocument.addEventListener('visibilitychange',()=>{if(document.hidden)persist()});\n</script>`);
await mkdir('dist',{recursive:true});
await writeFile('dist/index.html',html);
await copyFile('src/storage.mjs','dist/storage.mjs');
await mkdir('dist/api',{recursive:true});
await writeFile('dist/api/connection',JSON.stringify({configured:false,mode:'playtest',productionEconomy:false}));
await writeFile('dist/_headers','/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n');
let offline=html.replace('type="module"','').replace('import {KEY,day,validateSave,snapshot,purchase,ensureDaily,recordDailyAction,syncAttendance,claimAttendance,ensureFurnitureLayout} from "./storage.mjs";',(await readFile('src/storage.mjs','utf8')).replaceAll('export ',''));
offline=offline.replace('checkConnection();','/* Offline: account connection unavailable. */');
for(const theme of ['blue','pink'])for(const suffix of ['standing','states','expressions']){
  const asset='./assets/rabbits/'+theme+'-'+suffix+'.png';
  offline=offline.replace(asset,'data:image/png;base64,'+(await readFile('src/assets/rabbits/'+theme+'-'+suffix+'.png')).toString('base64'));
}
for(const theme of ['blue','pink'])for(const kind of ['dog','cat','raccoon']){
  const asset='./assets/pets/'+theme+'-'+kind+'.png';
  offline=offline.replace(asset,'data:image/png;base64,'+(await readFile('src/assets/pets/'+theme+'-'+kind+'.png')).toString('base64'));
}
await mkdir('outputs',{recursive:true});
await writeFile('outputs/그못섬-오프라인-체험판.html',offline);
await import('./integration/build-worker.mjs');
console.log('Built restored original UI with compatible local saves.');

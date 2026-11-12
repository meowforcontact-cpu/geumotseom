import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {PET_PRODUCTS,PET_CATALOG} from './src/pet-catalog.mjs';
let html=(await readFile('src/pet.html','utf8')).replace(/\r\n/g,'\n');
html=html.replaceAll('"DotGothic16","Apple SD Gothic Neo","Malgun Gothic",monospace','Galmuri9,monospace');
html=html.replace(/<link href="https:\/\/fonts\.googleapis\.com[^"]*" rel="stylesheet">/g,'');
const replace=(before,after)=>{if(!html.includes(before))throw Error('원본 변경 확인 필요: '+before.slice(0,65));html=html.replace(before,after)};
replace("tintAll(k,t,R)\n  winLight(k,t,sx,sy,sw,sh);", "/* Room lighting is composited after furniture and pet. */");
replace("(vh-padT-14)*GD.W/GD.H,1040", "(vh-padT-48)*GD.W/GD.H,1040");
/* Keep the entire handheld inside the iPad's visible viewport, not flush
   against the screen edge. When a furniture drawer is open, every resize
   must reapply the shared left-drawer layout rather than restoring an
   oversized console with an old translation. */
replace("const w=MODE==='egg'?Math.min(vw-16,(vh-padT-14)*GD.W/GD.H,560):Math.min(vw-16,(vh-padT-48)*GD.W/GD.H,1040);",
 "const w=MODE==='egg'?Math.min(vw-32,(vh-padT-14)*GD.W/GD.H,560):Math.min(vw-48,Math.max(1,vh-padT-48)*GD.W/GD.H,1040);");
replace("  $('dev').style.width=Math.max(220,w)+'px';fitLCD();",
 "  const device=$('dev');device.style.translate='';device.style.width=Math.max(1,w)+'px';"
 +"if(typeof furnitureTools!=='undefined'&&!furnitureTools.hidden)positionFurnitureDrawer();fitLCD();");


// Draw the console's existing pixel-art controls in their own topmost layer.
// The shell image used to contain buttons, so changing z-index alone could
// never raise their artwork above a bezel or any overlapping LCD decoration.
const controlForegroundCode = `
function renderControllerForeground(full,plain){
 const host=$('btns');
 if(!host||MODE!=='console'||!full||!plain)return;
 let layer=host.querySelector('.controller-art-front');
 if(!layer){
  layer=document.createElement('canvas');
  layer.className='controller-art-front';
  layer.setAttribute('aria-hidden','true');
  host.prepend(layer);
 }
 if(layer.width!==GD.W)layer.width=GD.W;
 if(layer.height!==GD.H)layer.height=GD.H;
 const context=layer.getContext('2d');
 const whole=full.getContext('2d').getImageData(0,0,GD.W,GD.H).data;
 const background=plain.getContext('2d').getImageData(0,0,GD.W,GD.H).data;
 const pixels=context.createImageData(GD.W,GD.H);
 // Only the actual changed button pixels are overlaid. Never copy
 // surrounding rectangular shell pixels or paint the same button twice.
 for(let i=0;i<whole.length;i+=4){
  if(whole[i]===background[i]&&whole[i+1]===background[i+1]
    &&whole[i+2]===background[i+2]&&whole[i+3]===background[i+3])continue;
  pixels.data[i]=whole[i];pixels.data[i+1]=whole[i+1];
  pixels.data[i+2]=whole[i+2];pixels.data[i+3]=whole[i+3];
 }
 context.clearRect(0,0,GD.W,GD.H);
 context.putImageData(pixels,0,0);
}
`;
replace("function applyShell(){", controlForegroundCode+"\nfunction applyShell(){");
replace("const shellCache={};let shellKey='';","const shellCache={},shellRasterCache={},shellBlankRasterCache={};let shellKey='';");
replace("shellCache[shellKey]='url('+c.toDataURL()+')'","shellRasterCache[shellKey]=c;const plain=MODE==='console'?makeConsole(th,skin,false):c;shellBlankRasterCache[shellKey]=plain;shellCache[shellKey]='url('+plain.toDataURL()+')'");
replace("  $('dev').style.setProperty('--shell',shellCache[shellKey]);",
 "  $('dev').style.setProperty('--shell',shellCache[shellKey]);\n  renderControllerForeground(shellRasterCache[shellKey],shellBlankRasterCache[shellKey]);");
// Paint the console body without physical controls; the foreground layer
// receives only the pixel difference between a complete and plain shell.
// This avoids double-painting, rectangular D-pad copies and scale-dependent seams.
replace("function makeConsole(th,sk){","function makeConsole(th,sk,paintControls=true){");
replace("if(dp(x,y)){const a=arrow(x,y)","if(paintControls&&dp(x,y)){const a=arrow(x,y)");
replace("else if(dp(x,y,5))col=","else if(paintControls&&dp(x,y,5))col=");
replace("for(const [cx,cy,r,key,ic] of BT){","if(paintControls)for(const [cx,cy,r,key,ic] of BT){");
replace('const E1=[[84,38],[112,-6],[148,30]]','const E1=[[84,38],[112,0],[148,30]]');
// 4:3 landscape LCD: 240x180 inside the existing 448x262 console.
// The room remains square, and physical buttons sit outside the frame.
// Drawing coordinates are shifted down by OY=10 in makeConsole().
replace('bez:[96,48,256,194]','bez:[104,52,240,180]');
// The former panel extended to x=362 and swallowed the left edge of HOME
// (centre 374, radius 14) before the controls could be rasterized.
replace('const inPanel=x>=86&&x<=362;','const inPanel=x>=96&&x<=352;');
replace('rr(x,y,90,32,358,238,10),hole=(x,y)=>x>=98&&x<=349&&y>=40&&y<=229',
 'rr(x,y,96,34,352,232,10),hole=(x,y)=>x>=104&&x<=343&&y>=42&&y<=221');
replace('rr(x,y,95,37,353,233,7)','rr(x,y,100,38,348,228,7)');
replace('rr(x,y-1,95,37,353,233,7)','rr(x,y-1,100,38,348,228,7)');
replace('rr(x-1,y,95,37,353,233,7)','rr(x-1,y,100,38,348,228,7)');
// One console-layout specification controls both the rendered plastic buttons
// and their real HTML pointer targets (448×262 shell pixel coordinates).
// In makeConsole(), the raster drawing uses y - 10; the DOM uses full y.
const shellArtOffsetY=10;
const consoleButtonRadius=10;
const consoleStickRadius=13;
const consoleDpad={x:50,y:122,reach:17,halfLength:27,halfThickness:consoleButtonRadius,hitRadius:consoleButtonRadius};
const consoleFaceButtons=[
  ['OK',415,122,consoleButtonRadius,'a','paw','A 확인'],
  ['BACK',398,139,consoleButtonRadius,'b','back','B 뒤로'],
  ['MENU',398,105,consoleButtonRadius,'x','menu','X 메뉴'],
  ['HOME',381,122,consoleButtonRadius,'y','home','Y 홈']
];
const consoleBottomButtons=[
  ['FEED',64,196,consoleStickRadius,'food','bowl','먹이 (길게: 간식 고르기)'],
  ['PLAY',384,196,consoleStickRadius,'play','yarn','놀이']
];
const consoleArtButtons=[...consoleFaceButtons,...consoleBottomButtons]
  .map(([,x,y,r,fill,glyph])=>[x,y-shellArtOffsetY,r,fill,glyph]);
const {x:padX,y:padY,reach:padReach,halfLength:padLen,halfThickness:padThick,hitRadius:padRadius}=consoleDpad;
const consoleHitButtons=[
  ['U',padX,padY-padReach,padRadius,0,'위'],
  ['D',padX,padY+padReach,padRadius,0,'아래'],
  ['L',padX-padReach,padY,padRadius,0,'왼쪽'],
  ['R',padX+padReach,padY,padRadius,0,'오른쪽'],
  ...[...consoleFaceButtons,...consoleBottomButtons].map(([code,x,y,r,,,label])=>[code,x,y,r,0,label])
];
const padArtY=padY-shellArtOffsetY;
replace('const DC=[45,112],dH=(x,y,o)=>rr(x,y,10,99+o,80,125+o,6),dV=(x,y,o)=>rr(x,y,32,77+o,58,147+o,6)',
 'const DC='+JSON.stringify([padX,padArtY])+',dH=(x,y,o)=>rr(x,y,'+
 [padX-padLen,padArtY-padThick,padX+padLen,padArtY+padThick,5].map((v,i)=>i===1||i===3?v+'+o':v).join(',')+
 '),dV=(x,y,o)=>rr(x,y,'+
 [padX-padThick,padArtY-padLen,padX+padThick,padArtY+padLen,5].map((v,i)=>i===1||i===3?v+'+o':v).join(',')+')');
replace('v>=-31&&v<=-23&&Math.abs(u)<=(v+31)*.9',
 'v>=-'+(padLen-4)+'&&v<=-'+(padLen-10)+'&&Math.abs(u)<=(v+'+(padLen-4)+')*.9');
replace("const BT=[[425,108,14.5,'a','paw'],[404.5,129,14.5,'b','back'],[404.5,87,14.5,'x','menu'],[384,108,14.5,'y','home'],[63,205,17,'food','bowl'],[385,205,17,'play','yarn']]",
 'const BT='+JSON.stringify(consoleArtButtons));
// Keep each pixel glyph inside the smaller button face with visible padding.
replace('const P_=IC[ic],n_=P_.length,ix=x-Math.round(cx-n_/2)-ICO[ic][0],iy=y-Math.round(cy-n_/2)-ICO[ic][1];',
 'const P_=IC[ic],n_=P_.length,size_=Math.min(n_,Math.round(r*1.1)),ix=Math.floor((x-Math.round(cx-size_/2))*n_/size_)-ICO[ic][0],iy=Math.floor((y-Math.round(cy-size_/2))*n_/size_)-ICO[ic][1];');
replace("btn:[['L',45,99,13,0,'위'],['R',45,145,13,0,'아래'],['L',22,122,13,0,'왼쪽'],['R',68,122,13,0,'오른쪽'],\n        ['OK',425,118,15,0,'A 확인'],['BACK',404.5,139,15,0,'B 뒤로'],['MENU',404.5,97,15,0,'X 메뉴'],['HOME',384,118,15,0,'Y 홈'],\n        ['FEED',63,215,17,0,'먹이 (길게: 간식 고르기)'],['PLAY',385,215,17,0,'놀이']]",
 'btn:'+JSON.stringify(consoleHitButtons));
replace("ArrowUp:'L',ArrowDown:'R'","ArrowUp:'U',ArrowDown:'D'");
const bindStart=html.indexOf('function bindBtn(b,k){'),bindEnd=html.indexOf("\naddEventListener('keydown'",bindStart);
if(bindStart<0||bindEnd<0)throw Error('Device input boundary missing');
html=html.slice(0,bindStart)+(await readFile('src/device-input.js','utf8'))+html.slice(bindEnd);

replace("if(x===84||x===85||x===363||x===364)col=x%2?'#ffffff':mixc(C.body[2],C.out,.4);\n        else if(inPanel&&!frameO(x,y)){col=C.panel;", "if(inPanel&&!frameO(x,y)){col=C.panel;");
// No decorative dots, rivets or pixel confetti around the LCD.
// Keep the surrounding body flat; use crisp bands on the actual bezel.
replace("col=C.panel;if(x%12===6&&y%12===6)col=C.dot;if((x%24===18&&y%24===18)||(x%24===19&&y%24===18)||(x%24===18&&y%24===19))col=mixc(TH[1],'#ffffff',.3);",
 "col=C.panel;");
replace("if(ins){col=C.bezel;if(!rr(x,y-1,100,38,348,228,7)||!rr(x-1,y,100,38,348,228,7))col=mixc(C.bezel,'#ffffff',.4);else if(hole(x,y+1)||hole(x+1,y))col=mixc(C.bezel,'#000000',.1)}",
 "if(ins){col=C.bezel;const highlight=rr(x,y,102,40,346,226,6);"
 +"if(!highlight)col=mixc(C.bezel,'#ffffff',.74);"
 +"else if(hole(x-1,y)||hole(x+1,y)||hole(x,y-1)||hole(x,y+1))col=mixc(C.bezel,C.out,.72)}");
replace("else{col=pTH[0];if(x%6===3&&y%6===3)col=pTH[1];if([[100,35],[348,35],[160,235],[224,235],[288,235]].some(([p,q])=>(Math.abs(x-p)<=1&&y===q)||(x===p&&Math.abs(y-q)<=1)))col=pTH[2];",
 "else{col=mixc(C.bezel,C.out,.16);");
replace("if(!frameO(x,y-2)||!frameO(x-2,y))col=mixc(pTH[0],'#ffffff',.65);if(NB2.some(([p,q])=>Math.abs(p)+Math.abs(q)<=2&&!frameO(x+p,y+q)))col=C.out",
 "if(!frameO(x,y-1)||!frameO(x-1,y))col=mixc(C.bezel,'#ffffff',.58);else if(!frameO(x+1,y)||!frameO(x,y+1))col=C.out");

// Restore the actual console shell fill behind the LCD. The old C.panel
// branch painted a large near-white rectangle outside the blue bezel.
replace("if(inPanel&&!frameO(x,y)){col=C.panel;\n          if(!face(x,y-3))col=mixc(col,'#ffffff',.9);if(!face(x,y+2))col=C.body[3]}",
 "if(inPanel&&!frameO(x,y)){/* seamless original body gradient */}");
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
replace("on:own&&pet().kind===p.kind,go:","on:own&&pet().kind===p.kind,how:p.kind==='angel'?'일일 미션 3개 완료 누적 15일 보상':p.kind==='cat'||p.kind==='dog'?'첫 친구 무료 선택 · 이후 획득 경로 미확정':'가격·획득 경로 미확정',go:");
// Preserve the supplied device, artwork, palette, menus and responsive layout.
const titlePolicyProducts=[
 {id:'title_solid',cat:'칭호',name:'단색 칭호',price:500000,spr:'crown',catalogOnly:true},
 {id:'title_gradient',cat:'칭호',name:'그라데이션 칭호',price:1500000,spr:'crown',catalogOnly:true,seasonLimit:5}
];
const furnitureCatalog=JSON.parse(await readFile('src/furniture-catalog.json','utf8'));
const furnitureUrls=Object.fromEntries(await Promise.all(furnitureCatalog.map(async p=>[p.id,'data:image/png;base64,'+(await readFile('src/art/furniture/'+p.id+'.png')).toString('base64')])));
replace("const shopItems=s=>ITEMS.filter(i=>i.cat===CATS[s.cat||0][0]);","const shopItems=s=>ITEMS.filter(i=>!i.retired&&!i.only&&i.cat===CATS[s.cat||0][0]);");
replace("if(i.only)return say(i.only+'이에요');","if(i.catalogOnly)return say('실제 디스코드 역할 연동 확인 전에는 구매할 수 없어요');if(i.only)return say(i.only+'이에요');");
replace("const icon=(k,px,cls)=>", "const legacyIcon=(k,px,cls)=>");
replace('const CATS=', 'function icon(k,px,cls){return FURNITURE_URLS[k]?furnitureIcon(k,px,cls):legacyIcon(k,px,cls)}\nconst CATS=');
replace('<html>','<html lang="ko">');
// Show the signed-in Discord name on the ID card instead of the placeholder.
replace("d={name:'나',rep:p.name","d={name:(typeof account!=='undefined'&&account&&account.name)||'나',rep:p.name");
// Canonical app title is authored directly in src/pet.html.
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
replace("return f%10===9?'blink':'normal';","if(!calm&&(Math.abs(cat.x-cat.tx)>.5||Math.abs(cat.y-cat.ty)>.5))return 'walk';\n  return 'normal';");
replace("0,kd),0,0)","0,kd),0,0,32,32)");
// Keep room coordinates unchanged but rasterize at 3x so the original eye
// highlights are not destroyed by an intermediate 64px sprite reduction.
replace('rc.width=RW;rc.height=RH;buf.width=RW;buf.height=RH;rx.imageSmoothingEnabled=false;bx.imageSmoothingEnabled=false;',
  'rc.width=RW*3;rc.height=RH*3;buf.width=RW*3;buf.height=RH*3;rx.imageSmoothingEnabled=false;bx.imageSmoothingEnabled=false;bx.setTransform(3,0,0,3,0,0);');
replace('const im=bx.getImageData(0,0,RW,RH),d=im.data;', 'const im=bx.getImageData(0,0,buf.width,buf.height),d=im.data;');
// Match the in-room pet to furniture rather than its 128px source canvas.
replace('k.drawImage(sprite(st,ex,f,pet().kind),x,CY,64,64);',
  "const hop=!calm&&ex==='play'?-(f%2?3:0):!calm&&ex==='walk'?-(f%2):0;\n  const petSize=st==='egg'?34:38;\n  const petX=x+(64-petSize)/2;\n  k.drawImage(sprite(st,ex,f,pet().kind),petX,FLOOR-petSize+hop,petSize,petSize);");
// Keep pet feet and their shadow anchored to the same floor line (FLOOR=106).
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
replace('const state=',`const FURNITURE_CATALOG=${JSON.stringify(furnitureCatalog)};\nconst FURNITURE_URLS=${JSON.stringify(furnitureUrls)};\nITEMS.filter(i=>i.cat==='가구').forEach(i=>i.retired=true);ITEMS.push(...FURNITURE_CATALOG);\nITEMS.find(i=>i.id==='t1').retired=true;ITEMS.find(i=>i.id==='p1').price=0;ITEMS.find(i=>i.id==='p1').only='일일 미션 3개 완수 누적 15일 보상';\nITEMS.push(...${JSON.stringify(titlePolicyProducts)});\nconst state=`);
replace('<script>',`<style>${await readFile('src/ui-phase1.css','utf8')}</style>`+'<script type="module">\nimport {KEY,day,validateSave,snapshot,purchase,ensureDaily,recordDailyAction,syncAttendance,claimAttendance,ensureFurnitureLayout,needsStarterPet,claimStarterPet} from "./storage.mjs";');
replace("startAnim('eat',18);return say('냠냠!')", "recordDaily('feed');startAnim('eat',18);return say('냠냠!')");
replace("startAnim('play',20);return say('신난다!')", "recordDaily('play');startAnim('play',20);return say('신난다!')");
replace('if(i.pet)return;','if(!i || !state.owned.includes(i.id) || i.pet)return;');
replace("addEventListener('keydown',e=>{", "addEventListener('keydown',e=>{\n  if(e.target.closest?.('input,textarea,select,[contenteditable]'))return;");
replace("else{equip(i,true);back();say('방에 놓았어요!')}","else{back();say('보유함에 담았어요!')}\n    persist(); render();");
replace("const qs=Q.get('stage');",`const qs=null;\n${await readFile('src/original-runtime.js','utf8')}\n${await readFile('src/menu-icons.js','utf8')}\n${await readFile('src/navigation-v9.js','utf8')}\n`);
replace('att:{streak:3,done:false}','att:{streak:0,done:false}');
replace("state.coins=+Q.get('coins')||r.coins;state.earned=r.earned;state.owned=r.owned;r.owned.forEach(id=>equip(item(id),true));", "state.coins=r.coins;state.earned=r.earned;state.owned=r.owned;state.eq.가구=['m1'];restore();ensureFurnitureLayout(state,ITEMS);");
replace('layout();\n  if(stage()', 'layout(); showStarterChoice(); persist();\n  if(stage()');
const roomFiles=['cream-wall','cream-floor','pink-wall','pink-floor','sky-dawn','sky-morning','sky-evening','sky-night'];
const roomUrls=Object.fromEntries(await Promise.all(roomFiles.map(async name=>[name,'data:image/png;base64,'+(await readFile('src/art/rooms/'+name+'.png')).toString('base64')])));
replace("const qs=null;",`const ROOM_ASSET_URLS=${JSON.stringify(roomUrls)};\nconst qs=null;`);
const roomStart=html.indexOf("  R('#dfeaff',0,0,RW,RH);",html.indexOf('function scene(withPet)'));
const roomEnd=html.indexOf("  if(pl.place==='friend'){k.globalCompositeOperation",roomStart);
if(roomStart<0||roomEnd<0)throw Error('Room background boundary missing');
html=html.slice(0,roomStart)+"  if(roomAssetsReady()){drawAssetRoom(k)}else{R('#f4f0eb',0,0,RW,RH)}\n"+html.slice(roomEnd);
replace('for(let i=0;i<d.length;i+=4){const key=', 'if(!roomAssetsReady())for(let i=0;i<d.length;i+=4){const key=');
replace('function draw(){','function draw(){\n  if(!roomAssetsReady()&&placeNow().place!=="park"){\n    if(rc.width!==RW||rc.height!==RH){rc.width=RW;rc.height=RH;}\n    rx.setTransform(1,0,0,1,0,0);rx.fillStyle="#f4f0eb";rx.fillRect(0,0,rc.width,rc.height);return;\n  }\n  if(roomAssetsReady()&&placeNow().place!=="park")return drawDetailedRoom();\n  if(buf.width!==RW){rc.width=buf.width=RW;rc.height=buf.height=RH;bx.setTransform(1,0,0,1,0,0);}');
const selectedRoot='src/assets/selected-room-20261112/';
const png=async file=>'data:image/png;base64,'+(await readFile(selectedRoot+file)).toString('base64');
const selectedDirections=['south','south-east','east','north-east','north','north-west','west','south-west'];
const selectedFurniture=['cream_f1','cream_f3','cream_f4','cream_f5','cream_f6','cream_f7','cream_f8','cream_f9','cream_f10','cream_tea_table','cream_flower_table'];
const selectedAssets={version:'selected-20261112',room:await png('room.png'),attic:'data:image/webp;base64,'+(await readFile('src/assets/pink-attic-v1/room.webp')).toString('base64'),cat:Object.fromEntries(await Promise.all(selectedDirections.map(async d=>[d,'data:image/png;base64,'+(await readFile('src/assets/cat-Q-original-20261112/'+d+'.png')).toString('base64')]))),furniture:Object.fromEntries(await Promise.all(selectedFurniture.map(async id=>[id,await png('furniture/'+id+'.png')])))};
replace('</script>',`const WHITEWOOD_ASSETS=${JSON.stringify(selectedAssets)};\n${await readFile('src/art-style.js','utf8')}\n${await readFile('src/room-placement.js','utf8')}\n${await readFile('src/room-assets.js','utf8')}\n${await readFile('src/tint-palette.js','utf8')}\n${await readFile('src/furniture-runtime.js','utf8')}\n${await readFile('src/room-interactions.js','utf8')}\n${await readFile('src/diary-menu.js','utf8')}\n${await readFile('src/mission-policy.js','utf8')}\n${await readFile('src/starter-pet.js','utf8')}\n${await readFile('src/selected-cat.js','utf8')}\naddEventListener('pagehide',persist);\ndocument.addEventListener('visibilitychange',()=>{if(document.hidden)persist()});\n</script>`);
replace('</script>',(await readFile('src/room-depth-public.js','utf8'))+'\n'+(await readFile('src/room-photo.js','utf8'))+'\n</script>');
// D-pad movement shares the same floor limit as touch and auto-roaming.
replace("else cat.ty=Math.max(45,Math.min(124,cat.y+(k==='D'?20:-20)));","else cat.ty=Math.max(roomFloorBackY(RH),Math.min(124,cat.y+(k==='D'?20:-20)));");
await mkdir('dist',{recursive:true});
await writeFile('dist/index.html',html);
await copyFile('src/storage.mjs','dist/storage.mjs');
await mkdir('dist/api',{recursive:true});
await writeFile('dist/api/connection',JSON.stringify({configured:false,mode:'playtest',productionEconomy:false}));
await writeFile('dist/_headers','/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n');
let offline=html.replace('type="module"','').replace('import {KEY,day,validateSave,snapshot,purchase,ensureDaily,recordDailyAction,syncAttendance,claimAttendance,ensureFurnitureLayout,needsStarterPet,claimStarterPet} from "./storage.mjs";',(await readFile('src/storage.mjs','utf8')).replaceAll('export ',''));
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



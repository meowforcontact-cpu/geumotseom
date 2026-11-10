// Local playtest only. Keep every control inside the original device.
const UI_KEY='pika.room.ui.v2';
// Reuse the actual illustrations from the user's shop reference, not replacements.
const ART_URLS={m1:'./art/plant.png',m2:'./art/lamp.png',m3:'./art/bed.png'};
const roomProductImages={};
for(const [id,url] of Object.entries(ART_URLS)){const image=new Image();image.src=url;image.onload=()=>{if(roomUI.screen==='preview')render()};roomProductImages[id]=image}
for(const key of ['bed','bed16'])if(S[key])S[key]=S[key].map(row=>row.replace(/[arp]/g,'l'));
let savedFingerprint='',saveIssue='',activeDay=day(),resetting=false,pendingImport=null;
const roomUI={screen:'home',category:0,selected:0,product:null,menu:false,step:0,done:false,notice:'',returnTo:'shop',buying:false};
let account=null,accountRevision=null,connectionReady=false;
function persist(){
  if(resetting)return;
  if(activeDay!==day()){if(activeDay!==day(Date.now()-86400000))state.att.streak=0;state.att.done=false;state.sent=[];activeDay=day()}
  const value=snapshot(state),fingerprint=JSON.stringify(value.state)+value.day;
  try{if(fingerprint!==savedFingerprint){localStorage.setItem(KEY,JSON.stringify(value));savedFingerprint=fingerprint}localStorage.setItem(UI_KEY,JSON.stringify({step:roomUI.step,done:roomUI.done,tutorialVersion:3}));saveIssue=''}catch{saveIssue='저장이 안 됐어. 설정에서 진행 파일을 저장해 줘.'}
}
function restore(){
  try{const raw=localStorage.getItem(KEY);if(raw)Object.assign(state,validateSave(JSON.parse(raw),ITEMS))}catch{saveIssue='이전 저장을 읽지 못했어. 설정에서 확인해 줘.'}
  try{const raw=JSON.parse(localStorage.getItem(UI_KEY)||'null');if(raw&&Number.isInteger(raw.step)&&raw.step>=0&&raw.step<=6){roomUI.step=raw.tutorialVersion===3?raw.step:raw.step===4?6:raw.step;roomUI.done=raw.done===true}}catch{}
  if(pet().hatched&&roomUI.step===0)roomUI.step=1;
}
function download(value,name){const u=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function roomNavigate(screen,options={}){roomUI.screen=screen==='menu'?'home':screen;roomUI.menu=false;roomUI.selected=0;roomUI.notice='';Object.assign(roomUI,options);ui.stack.length=1;if(screen==='menu')return devicePush('menu');render()}
function roomMessage(message){roomUI.notice=message;render()}
function finishTutorial(){roomUI.done=true;roomUI.menu=false;persist();render()}
const tutorialText=['안녕! 알을 세 번 톡톡 눌러 줘.','반가워! 물고기 버튼으로 밥을 줘.','이번엔 오른쪽 버튼으로 같이 놀자!','어떤 걸 해 볼까?','준비 끝! 네 취향으로 꾸며 봐.'];
function menuChoices(){return [['상점 구경하기',()=>roomNavigate('shop')],['내 방 꾸미기',()=>roomNavigate('inventory')],['나중에 하기',()=>{if(!roomUI.done){roomUI.step=4;persist()}roomUI.menu=false;render()}]]}
function textChoices(choices){return '<div class="text-choices" role="group" aria-label="선택지">'+choices.map(([label],i)=>'<button class="text-choice" data-choice="'+i+'" '+(roomUI.selected===i?'aria-current="true"':'')+'><span class="dot-cursor" aria-hidden="true">'+(roomUI.selected===i?'▶':'')+'</span><span>'+esc(label)+'</span></button>').join('')+'</div>'}
function dialogue(){
  if(roomUI.done&&!roomUI.menu)return '';
  const choices=roomUI.menu||roomUI.step===3;
  return '<section class="pika-dialogue" aria-label="친구와 대화"><span class="pika-name">✦ '+esc(pet().name)+'</span><p>'+esc(choices?'어떤 걸 해 볼까?':tutorialText[roomUI.step])+'</p>'+(choices?textChoices(menuChoices()):roomUI.step===4?textChoices([['내 방으로',finishTutorial]]):'<span class="dialogue-hint">'+(roomUI.step===0?'화면 속 알을 톡톡 눌러 줘':roomUI.step===1?'아래 물고기 버튼을 눌러 줘':'아래 오른쪽 놀이 버튼을 눌러 줘')+'</span>')+'</section>';
}
const originalHomeHTML=homeHTML;
homeHTML=function(){
  let html=originalHomeHTML();
  if(!roomUI.done||roomUI.menu){html=html.replace(/<div class="sb">[\s\S]*?<\/div><div class="bd">/,'<div class="tutorial-top"><span>'+(!roomUI.done?'처음 만나는 그못섬 '+(roomUI.step+1)+'/5':'내 방')+'</span>'+(!roomUI.done?'<button data-room-action="skip">건너뛰기</button>':'<button data-room-back="home">닫기</button>')+'</div><div class="bd">').replace('<div id="bub" hidden></div>','');html+=dialogue()}
  else html+='<button class="room-menu" data-room-action="talk">대화</button>';
  return html;
};
const devicePush=push;
push=function(id,options){const map={shop:'shop',deco:'inventory',menu:'menu',set:'settings',help:'guide',out:'menu'};return map[id]?roomNavigate(map[id]):devicePush(id,options)};
const deviceGoHome=goHome;
goHome=function(){roomUI.screen='home';roomUI.menu=false;deviceGoHome()};
const deviceSay=say;
say=function(message){if(!roomUI.done&&roomUI.step===0&&pet().hatched){roomUI.step=1;persist()}return deviceSay(message)};
const deviceCare=care;
care=function(kind,hunger,mood){const hatched=pet().hatched;deviceCare(kind,hunger,mood);if(hatched&&!roomUI.done){if(kind==='eat'&&roomUI.step===1)roomUI.step=2;else if(kind==='play'&&roomUI.step===2){roomUI.step=3;roomUI.selected=0}persist();render()}};
function roomHeader(title,backTo='home',right=''){return '<header class="room-heading"><button data-room-back="'+backTo+'" aria-label="뒤로">‹</button><span>'+esc(title)+'</span><small>'+right+'</small></header>'}
const roomCategories=[['가구',['가구']],['벽지',['벽','바닥']],['펫',['펫']],['꾸미기',['칭호','배지']]];
function productSprite(i){return S[i.spr+'16']?i.spr+'16':i.spr}
function illustratedProduct(i,size){return ART_URLS[i.id]?'<img class="source-product-art" src="'+ART_URLS[i.id]+'" alt="" width="'+size+'" height="'+size+'">':icon(productSprite(i),size)}
function categoryTabs(){return '<div class="room-tabs" role="group" aria-label="종류">'+roomCategories.map(([label],i)=>'<button data-room-category="'+i+'" aria-pressed="'+(roomUI.category===i)+'">'+esc(label)+'</button>').join('')+'</div>'}
function roomProducts(ownedOnly=false){const products=ITEMS.filter(i=>roomCategories[roomUI.category][1].includes(i.cat)&&(!ownedOnly||state.owned.includes(i.id)));return '<div class="room-products">'+(products.length?products.map(i=>'<button class="room-product" data-room-item="'+i.id+'">'+illustratedProduct(i,29)+'<span>'+esc(i.name)+'</span><small class="'+(state.owned.includes(i.id)?'owned-tag':'')+'">'+(ownedOnly?(i.pet?'도감에서 만나기':isOn(i)?'적용 중':'보유 중'):state.owned.includes(i.id)?'보유 중':i.only?'조건 전용':icon('icoin',8)+fmt(i.price))+'</small></button>').join(''):'<div class="room-empty">아직 가진 물건이 없어.<br><button data-room-action="shop">상점 구경하기</button></div>')+'</div>'}
function noticeHTML(){return roomUI.notice||saveIssue?'<p class="room-notice" role="status">'+esc(roomUI.notice||saveIssue)+'</p>':''}
function itemPage(){
  const i=item(roomUI.product),owned=state.owned.includes(i.id),preview=roomUI.screen==='preview',decor=['가구','벽','바닥'].includes(i.cat);
  return roomHeader(preview?i.name+' · 미리보기':i.name,roomUI.returnTo)+'<div class="item-details">'+(preview?'<canvas id="room-preview" width="176" height="90" aria-label="'+esc(i.name)+'을 적용한 방 미리보기"></canvas>':'<div class="item-portrait">'+illustratedProduct(i,48)+'</div>')+'<strong>'+esc(i.name)+'</strong><span>'+(owned?'보유 중':i.only?esc(i.only):fmt(i.price)+' 냐냐냥')+'</span><small>'+(preview?'미리보기 중 · 실제 방은 그대로야':owned?'언제든 다시 적용할 수 있어':i.only?'조건 확인은 준비 중이야':'구매하면 보유함에 담겨. 적용은 직접 골라 줘.')+'</small>'+noticeHTML()+'<div class="item-actions">'+(decor&&!preview?'<button data-room-action="preview">내 방에서 보기</button>':'')+(owned?(i.pet?'<button data-room-action="pet">도감에서 만나기</button>':'<button data-room-action="equip">'+(isOn(i)?'적용 해제':'내 방에 적용')+'</button>'):i.only?'<button disabled>조건 전용</button>':'<button data-room-action="confirm" '+(state.coins<i.price?'disabled':'')+'>'+(state.coins<i.price?'잔액 부족':'구매하기')+'</button>')+'</div><span class="demo-note">체험용 잔액 '+fmt(state.coins)+' 냥</span></div>';
}
function settingsPage(){return roomHeader('설정')+'<div class="room-scroll"><p>이 기기에 저장되는 체험판이야.</p>'+noticeHTML()+'<button data-room-action="export">내 진행 파일 저장</button><label class="room-file">진행 파일 불러오기<input id="room-import" type="file" accept=".json,application/json"></label><button data-room-action="rename">친구 이름 바꾸기</button><button data-room-action="tutorial">튜토리얼 다시 보기</button><button data-room-action="sound">소리 '+(SND?'끄기':'켜기')+'</button><button data-room-action="account">Discord 연결</button><button data-room-action="reset">체험 처음부터</button><small>실제 냐냐냥·운영 봇과 별도로 저장돼.</small></div>'}
function customHTML(){
  const screen=roomUI.screen;
  if(screen==='shop'||screen==='inventory')return roomHeader(screen==='shop'?'상점':'내 보유함','home',screen==='shop'?icon('icoin',8)+fmt(state.coins)+' 냐냐냥':'')+categoryTabs()+roomProducts(screen==='inventory')+'<footer class="room-bottom illustrated-bottom"><button data-room-action="'+(screen==='shop'?'inventory':'shop')+'">'+(screen==='shop'?'보유함에서 꾸미기':'상점 구경하기')+' ›</button></footer>';
  if(screen==='item'||screen==='preview')return itemPage();
  if(screen==='confirm'){const i=item(roomUI.product);return roomHeader('구매 확인','item')+'<div class="purchase-review">'+illustratedProduct(i,38)+'<strong>'+esc(i.name)+'</strong><p>보유함에 담을까?</p><span>'+fmt(state.coins)+' → '+fmt(state.coins-i.price)+' 냥</span><small>방에 자동으로 놓이지 않아.</small>'+noticeHTML()+textChoices([['구매하기',buyRoomItem],['돌아가기',()=>roomNavigate('item')]])+'</div>'}
  if(screen==='menu')return roomHeader('섬 메뉴')+'<div class="device-menu">'+[['shop','상점'],['inventory','보유함'],['book','도감'],['act','활동'],['prof','프로필'],['guide','안내'],['settings','설정'],['talk','친구와 대화']].map(([id,label])=>'<button data-room-action="'+id+'">'+label+'</button>').join('')+'</div><span class="demo-note">내 방 · 이 기기에 저장</span>';
  if(screen==='settings')return settingsPage();
  if(screen==='guide')return roomHeader('그못섬 생활 안내')+'<div class="room-scroll"><p>그못섬에 온 걸 환영해.<br>작은 친구와 내 방을 돌보고 꾸며 봐.</p><p>밥과 놀이는 무료야.<br>물건은 상점에서 사고 보유함에서 적용해 줘.</p><p>가격과 잔액은 체험용이야. 성장 조건과 광장은 준비 중이야.</p><button data-room-action="tutorial">튜토리얼 보기</button><button data-room-action="settings">저장·불러오기</button></div>';
  if(screen==='rename')return roomHeader('이름 바꾸기','settings')+'<form id="room-name-form" class="room-scroll"><label>친구 이름<input name="petname" maxlength="20" required value="'+esc(pet().name)+'"></label><button type="submit">이 이름으로 할래</button>'+noticeHTML()+'</form>';
  if(screen==='reset')return roomHeader('체험 처음부터','settings')+'<div class="room-scroll"><p>이 브라우저의 체험 진행을 지울까?</p><p>진행 파일을 저장하면 나중에 불러올 수 있어.</p><button data-room-action="export">진행 파일 먼저 저장</button><button data-room-action="reset-confirm">진행 지우고 시작</button><button data-room-action="settings">돌아가기</button></div>';
  if(screen==='import')return roomHeader('진행 불러오기','settings')+'<div class="room-scroll"><p>현재 진행을 선택한 파일로 바꿀까?</p><button data-room-action="import-confirm">이 파일로 불러오기</button><button data-room-action="settings">돌아가기</button></div>';
  if(screen==='account')return roomHeader('Discord 연결','settings')+'<div class="room-scroll">'+(connectionReady?(account?'<p>'+esc(account.name)+' 님으로 연결됐어.</p><button data-room-account="save">계정에 진행 저장</button><button data-room-account="load">계정에서 불러오기</button><button data-room-account="logout">로그아웃</button>':'<p>닉네임만 조회해. 실제 잔액과 역할은 바뀌지 않아.</p><a href="/auth/discord">Discord로 연결하기</a>'):'<p>계정 연결은 준비 중이야.</p><p>지금은 이 브라우저에 저장돼. 다른 기기로 옮길 때는 진행 파일을 가져가 줘.</p>')+noticeHTML()+'</div>';
  return '';
}
function paintRoomPreview(){
  const canvas=$('room-preview');if(!canvas)return;
  const i=item(roomUI.product),old=state.eq,oldPoop=state.poop,oldCat={...cat},oldAnimation=anim;
  try{
    state.eq={...old,가구:[...old.가구]};state.poop=[];cat.x=cat.tx=32;cat.wait=999;anim=null;
    if(i.cat==='가구'){if(!state.eq.가구.includes(i.id))state.eq.가구.push(i.id)}else state.eq[i.cat]=i.id;
    const furniture=state.eq.가구;state.eq.가구=[];scene(false);
    const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;context.drawImage(buf,0,0,128,128,0,0,176,90);
    for(const id of furniture){const product=item(id),art=document.createElement('canvas');paint(art,productSprite(product));const position=state.pos[id]||[60,78],image=roomProductImages[id];const ready=image?.complete&&image.naturalWidth,size=id==='m2'?40:id==='m3'?32:28,width=ready?size*image.naturalWidth/image.naturalHeight:size;context.drawImage(ready?image:art,Math.min(172-width,position[0]/128*176),81-size+(position[1]-72)*.25,width,size)}
    context.drawImage(sprite(stage(),stage()==='egg'?'idle':'normal',0,pet().kind),64,34,48,48);
  }finally{state.eq=old;state.poop=oldPoop;Object.assign(cat,oldCat);anim=oldAnimation}
}
const deviceRender=render;
render=function(){
  if(!GD)return;
  if(roomUI.screen==='home')deviceRender();else{$('lcdwrap').classList.add('plain');$('lcd').innerHTML='<div id="st" class="st room-screen" style="width:'+GD.stw+'px">'+customHTML()+'</div>';document.querySelectorAll('#lcd canvas[data-s]').forEach(c=>paint(c,c.dataset.s));fitLCD();paintRoomPreview();$('sr').textContent=$('lcd').innerText.replace(/\s+/g,' ').trim()}
  const talking=roomUI.screen==='home'&&(!roomUI.done||roomUI.menu);$('lcdwrap').classList.toggle('talking',talking);
  $('btns').querySelectorAll('[data-k]').forEach(button=>button.classList.toggle('tutorial-target',talking&&!roomUI.menu&&((roomUI.step===1&&button.dataset.k==='FEED')||(roomUI.step===2&&button.dataset.k==='PLAY'))));
};
async function buyRoomItem(){
  if(roomUI.buying)return;roomUI.buying=true;
  try{const i=item(roomUI.product),result=await ShopAPI.buy(i.id);Object.assign(state,result);state.log.unshift([i.name+' 구매','-'+fmt(i.price),'냥']);if(i.pet&&!state.pets.some(p=>p.kind===i.pet))state.pets.push({name:i.pname,kind:i.pet,hatched:false,taps:0});roomNavigate('item');roomUI.notice='보유함에 담았어. 적용은 직접 골라 줘.';if(!roomUI.done&&roomUI.step===3)roomUI.step=4;persist();render()}catch(error){roomMessage(error.message)}finally{roomUI.buying=false}
}
function activeChoices(){if(roomUI.screen==='confirm')return [['구매하기',buyRoomItem],['돌아가기',()=>roomNavigate('item')]];if(roomUI.screen==='home'&&(roomUI.menu||(!roomUI.done&&roomUI.step===3)))return menuChoices();if(roomUI.screen==='home'&&!roomUI.done&&roomUI.step===4)return [['내 방으로',finishTutorial]];return []}
const deviceInput=input;
input=function(key){
  const choices=activeChoices();
  if(choices.length&&['L','R','OK'].includes(key)){if(key==='OK')return choices[roomUI.selected%choices.length][1]();roomUI.selected=(roomUI.selected+(key==='R'?1:-1)+choices.length)%choices.length;return render()}
  if(key==='MENU')return roomNavigate('menu');if(key==='HOME')return goHome();
  if(roomUI.screen!=='home'){if(key==='BACK')return roomNavigate($('lcd').querySelector('[data-room-back]')?.dataset.roomBack||'home');return}
  if(key==='BACK'&&roomUI.menu){roomUI.menu=false;return render()}
  if(key==='OK'&&pet().hatched&&roomUI.done&&scr().id==='home'&&!state.poop.length){roomUI.menu=true;roomUI.selected=0;return render()}
  return deviceInput(key);
};
$('lcd').addEventListener('click',event=>{
  const target=event.target.closest('[data-room-action],[data-choice],[data-room-back],[data-room-category],[data-room-item],[data-room-account]');if(!target)return;event.stopImmediatePropagation();if(target.disabled)return;
  if(target.dataset.choice!==undefined){roomUI.selected=+target.dataset.choice;return activeChoices()[roomUI.selected]?.[1]()}
  if(target.dataset.roomBack)return roomNavigate(target.dataset.roomBack);
  if(target.dataset.roomCategory!==undefined){roomUI.category=+target.dataset.roomCategory;return render()}
  if(target.dataset.roomItem)return roomNavigate('item',{product:target.dataset.roomItem,returnTo:roomUI.screen});
  if(target.dataset.roomAccount)return handleAccount(target.dataset.roomAccount);
  const action=target.dataset.roomAction;
  if(action==='tour-menu')return input('MENU');
  if(['shop','inventory','settings','guide','rename','reset','account'].includes(action))return roomNavigate(action);
  if(['book','act','prof'].includes(action)){roomUI.screen='home';return devicePush(action)}
  if(action==='skip')return finishTutorial();
  if(action==='talk'){roomNavigate('home');roomUI.menu=true;return render()}
  if(action==='tutorial'){roomUI.done=false;roomUI.step=pet().hatched?1:0;roomNavigate('home');persist();return}
  if(action==='preview'||action==='confirm')return roomNavigate(action);
  if(action==='equip'){equip(item(roomUI.product));persist();return roomMessage(isOn(item(roomUI.product))?'내 방에 적용했어!':'적용을 해제했어.')}
  if(action==='pet'){roomUI.screen='home';return devicePush('book')}
  if(action==='export')return download(snapshot(state),'geumotseom-'+day()+'.json');
  if(action==='sound'){SND=!SND;try{localStorage.setItem('pikaSnd',SND?'1':'0')}catch{}return render()}
  if(action==='reset-confirm'){try{localStorage.removeItem(KEY);localStorage.removeItem(UI_KEY);resetting=true;location.reload()}catch{roomMessage('저장소에 접근할 수 없어.')}return}
  if(action==='import-confirm'&&pendingImport){Object.assign(state,pendingImport);pendingImport=null;roomUI.done=false;roomUI.step=pet().hatched?1:0;persist();roomNavigate('settings');roomMessage('진행을 불러왔어.')}
},true);
$('lcd').addEventListener('pointermove',event=>{const choice=event.target.closest('[data-choice]');if(choice&&roomUI.selected!==+choice.dataset.choice){roomUI.selected=+choice.dataset.choice;render()}});
document.addEventListener('change',async event=>{if(event.target.id!=='room-import')return;try{const file=event.target.files[0];if(!file)return;if(file.size>100000)throw Error('100KB 이하의 진행 파일을 골라 줘.');pendingImport=validateSave(JSON.parse(await file.text()),ITEMS);roomNavigate('import')}catch(error){roomMessage(error.message)}});
document.addEventListener('submit',event=>{if(event.target.id!=='room-name-form')return;event.preventDefault();const name=String(new FormData(event.target).get('petname')).trim();if(!name)return roomMessage('이름을 입력해 줘.');pet().name=name.slice(0,20);persist();roomNavigate('settings');roomMessage('이름을 바꿨어!')});
addEventListener('keydown',event=>{
  if(!roomUI.done)return; // Guided input is handled by tutorial.js.
  if(event.target.closest?.('.tutorial-panel'))return;
  if(event.target.closest?.('input,textarea,select,[contenteditable]')||event.key==='Tab')return;
  if(roomUI.screen==='home'&&!activeChoices().length)return;
  const controls=Array.from($('lcd').querySelectorAll('button:not(:disabled),a[href],input'));
  const key={ArrowLeft:'L',ArrowUp:'L',ArrowRight:'R',ArrowDown:'R',Enter:'OK',' ':'OK',Escape:'BACK',Backspace:'BACK'}[event.key];if(!key)return;event.preventDefault();event.stopImmediatePropagation();
  if(activeChoices().length){if(key==='OK'&&event.target.closest?.('[data-choice]'))roomUI.selected=+event.target.closest('[data-choice]').dataset.choice;return input(key)}if(key==='BACK')return input(key);if(!controls.length)return;
  const index=controls.indexOf(document.activeElement);if(key==='OK')return controls[index<0?0:index].click();controls[(index+(key==='R'?1:-1)+controls.length)%controls.length].focus();
},true);
async function accountRequest(route,body){const response=await fetch('./api/'+route,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:body===undefined?{}:{'Content-Type':'application/json','X-Pika-CSRF':account?.csrf||''},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(12000)});const value=await response.json();if(!response.ok)throw Error(value.error||'계정 연결을 확인해 줘.');return value}
async function checkConnection(){try{const status=await accountRequest('connection');if(!status.configured)return;connectionReady=true;try{account=await accountRequest('account/me')}catch{account=null}if(roomUI.screen==='account')render()}catch{}}
async function handleAccount(action){try{
  if(action==='load'){const result=await accountRequest('account/pet');accountRevision=result.revision;if(!result.save)return roomMessage('계정에 저장된 기록이 없어.');pendingImport=validateSave(result.save,ITEMS);roomNavigate('import')}
  if(action==='save'){if(accountRevision===null){const result=await accountRequest('account/pet');accountRevision=result.revision;if(result.save&&!confirm('계정의 체험 기록을 현재 진행으로 바꿀까요?'))return}const result=await accountRequest('account/pet',{save:snapshot(state),revision:accountRevision});accountRevision=result.revision;roomMessage('계정에 진행을 저장했어.')}
  if(action==='logout'){await accountRequest('account/logout',{});location.replace('/')}
}catch(error){roomMessage(error.message)}}
setInterval(persist,1500);
checkConnection();

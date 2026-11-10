// Usage instructions live outside the device; character dialogue stays inside.
const HELP_KEY='geumotseom.help.v1';
const TOUR_STEPS=[
  {title:'작은 친구를 깨워 볼까요?',text:'화면 속 알을 세 번 톡톡 눌러 주세요.',hint:'가운데 발바닥 버튼으로도 깨울 수 있어요.',target:'pet'},
  {title:'밥을 줘 볼까요?',text:'빛나는 물고기 버튼을 눌러 주세요.',hint:'친구의 배를 채워 줘요. 밥은 무료예요.',target:'FEED'},
  {title:'이번에는 같이 놀아요',text:'오른쪽 놀이 버튼을 눌러 주세요.',hint:'친구의 기분이 좋아져요. 놀이도 무료예요.',target:'PLAY'}
];
const CONTEXT_HELP={
  shop:{title:'마음에 드는 물건을 골라요',text:'상품 그림을 누르면 자세히 보거나 내 방에서 미리 볼 수 있어요.',hint:'구매한 물건은 보유함에 담겨요. 구매 없이 구경만 해도 괜찮아요.',selector:'.room-products'},
  inventory:{title:'내 물건으로 방을 꾸며요',text:'보유한 물건을 누르고 내 방에 적용해 주세요.',hint:'구매와 적용은 따로예요. 적용한 물건은 다시 해제할 수 있어요.',selector:'.room-products'},
  menu:{title:'필요할 때 메뉴를 열어요',text:'상점·꾸미기·도감·설정은 이 메뉴에 있어요.',hint:'가운데 버튼은 선택 확인, 길게 누르면 뒤로 가기예요.',selector:'.grid4'},
  choices:{title:'글자를 골라 대답해요',text:'마우스·터치 또는 방향키로 원하는 줄을 골라 주세요.',hint:'가운데 발바닥 버튼이나 Enter로 확인할 수 있어요.',selector:'.pika-dialogue'}
};
let helpSeen=new Set(),activeHelp=null,tourPanel=null,tourShade=null,tourRing=null,tourQueued=false;
try{const saved=JSON.parse(localStorage.getItem(HELP_KEY)||'[]');if(Array.isArray(saved))helpSeen=new Set(saved.filter(key=>Object.hasOwn(CONTEXT_HELP,key)))}catch{}
function guidedTour(){return !roomUI.done&&roomUI.step<=2}
function compactRoom(){return roomUI.screen==='home'&&scr().id==='home'&&roomUI.menu&&!guidedTour()}
function petFrame(){return {x:Math.floor((RW-48)/2),y:20,size:48,roomHeight:96}}
const fullRoomScene=scene,roomBackdrop=document.createElement('canvas');roomBackdrop.width=128;roomBackdrop.height=128;
scene=function(withPet){
  if(!compactRoom())return fullRoomScene(withPet);
  fullRoomScene(false);
  roomBackdrop.width=RW;const background=roomBackdrop.getContext('2d');background.setTransform(1,0,0,1,0,0);background.clearRect(0,0,RW,128);background.drawImage(buf,0,0);
  const frame=petFrame();bx.setTransform(1,0,0,1,0,0);bx.globalAlpha=1;bx.globalCompositeOperation='source-over';bx.imageSmoothingEnabled=false;
  bx.fillStyle='#e7f0ff';bx.fillRect(0,0,RW,RH);bx.drawImage(roomBackdrop,0,32,RW,96,0,0,RW,96);
  if(withPet){bx.fillStyle=shadowC();bx.fillRect(frame.x+12,frame.y+frame.size-3,24,2);bx.drawImage(sprite(stage(),expr(),Math.floor(cat.t/3),pet().kind),frame.x,frame.y,frame.size,frame.size)}
};
rc.addEventListener('click',event=>{
  if(!compactRoom())return;event.stopImmediatePropagation();
  const rect=rc.getBoundingClientRect(),frame=petFrame(),x=(event.clientX-rect.left)/rect.width*RW,y=(event.clientY-rect.top)/rect.height*RH;
  if(x>=frame.x&&x<=frame.x+frame.size&&y>=frame.y&&y<=frame.y+frame.size)petTap();
},true);
homeHTML=function(){
  let html=originalHomeHTML();
  if(guidedTour())return html.replace('<div id="bub" hidden></div>','');
  if(roomUI.menu)return html.replace('<div id="bub" hidden></div>','')+dialogue();
  return html+'<button class="room-menu" data-room-action="talk">대화</button>';
};
const restoreBeforeShortTour=restore;
restore=function(){restoreBeforeShortTour();if(!roomUI.done&&roomUI.step>2){roomUI.done=true;roomUI.step=2;persist()}};
finishTutorial=function(){roomUI.done=true;roomUI.step=Math.min(2,roomUI.step);roomUI.menu=false;persist();render()};
menuChoices=function(){return [['상점 구경하기',()=>chooseDestination('shop')],['내 방 꾸미기',()=>chooseDestination('inventory')],['나중에 하기',()=>chooseDestination('home')]]};
function chooseDestination(screen){roomNavigate(screen);persist()}
activeChoices=function(){
  if(roomUI.screen==='confirm')return [['구매하기',buyRoomItem],['돌아가기',()=>roomNavigate('item')]];
  if(roomUI.screen==='home'&&!guidedTour()&&roomUI.menu)return menuChoices();
  return [];
};
function goTourStep(step){roomUI.step=Math.max(pet().hatched?1:0,Math.min(2,step));roomUI.menu=false;roomUI.selected=0;roomUI.screen='home';ui.stack.length=1;persist();render()}
const navigateBeforeContext=roomNavigate;
roomNavigate=function(screen,options={}){
  activeHelp=null;const result=navigateBeforeContext(screen,options);
  if(!guidedTour()&&CONTEXT_HELP[screen]&&!helpSeen.has(screen)){activeHelp=screen;syncTour()}
  return result;
};
const careBeforeShortTour=care;
care=function(kind,hunger,mood){const finish=guidedTour()&&roomUI.step===2&&kind==='play'&&pet().hatched;careBeforeShortTour(kind,hunger,mood);if(finish)finishTutorial()};
// The long-press hint is available in contextual help, rather than another LCD bubble.
feedHint=function(){};
const normalDeviceInput=input;
input=function(key){
  if(!guidedTour())return normalDeviceInput(key);
  if(key==='BACK')return goTourStep(roomUI.step-1);
  if(roomUI.step===0&&key==='OK')return petTap();
  if(roomUI.step===1&&key==='FEED')return normalDeviceInput(key);
  if(roomUI.step===2&&key==='PLAY')return normalDeviceInput(key);
};
function dismissHelp(){
  if(activeHelp){helpSeen.add(activeHelp);try{localStorage.setItem(HELP_KEY,JSON.stringify([...helpSeen]))}catch{}}
  activeHelp=null;syncTour();
}
function createTourElements(){
  if(tourPanel)return;
  tourShade=document.createElement('div');tourShade.className='tutorial-shade';tourShade.setAttribute('aria-hidden','true');
  tourRing=document.createElement('div');tourRing.className='tutorial-ring';tourRing.setAttribute('aria-hidden','true');
  tourPanel=document.createElement('section');tourPanel.className='tutorial-panel external-guide';tourPanel.setAttribute('aria-label','그못섬 사용 안내');tourPanel.setAttribute('aria-live','polite');
  document.body.append(tourShade,tourRing,tourPanel);
  tourPanel.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.tour==='skip')return finishTutorial();
    if(button.dataset.tour==='previous')return goTourStep(roomUI.step-1);
    if(button.dataset.tour==='dismiss')return dismissHelp();
  });
}
function rectanglePath(rect,padding=0){const x=Math.round(rect.x-padding),y=Math.round(rect.y-padding),w=Math.round(rect.width+padding*2),h=Math.round(rect.height+padding*2);return 'M'+x+' '+y+'h'+w+'v'+h+'h-'+w+'Z'}
function targetPath(rect){if(!rect.round)return rectanglePath(rect,5);const radius=Math.round(Math.max(rect.width,rect.height)/2+5),x=Math.round(rect.x+rect.width/2),y=Math.round(rect.y+rect.height/2);return 'M'+(x-radius)+' '+y+'a'+radius+' '+radius+' 0 1 0 '+(radius*2)+' 0a'+radius+' '+radius+' 0 1 0 -'+(radius*2)+' 0Z'}
function rectData(element){const rect=element.getBoundingClientRect();return {x:rect.x,y:rect.y,width:rect.width,height:rect.height}}
function focusTarget(){
  if(!guidedTour()){const element=activeHelp?$('lcd').querySelector(CONTEXT_HELP[activeHelp].selector):null;return element?{...rectData(element),round:false}:null}
  const step=TOUR_STEPS[roomUI.step];
  if(step.target==='pet'){const rect=rc.getBoundingClientRect();return {x:rect.x+cat.x/RW*rect.width,y:rect.y+CY/RH*rect.height,width:64/RW*rect.width,height:64/RH*rect.height,round:false}}
  const element=$('btns').querySelector('[data-k="'+step.target+'"]');return element?{...rectData(element),round:true}:null;
}
function syncTour(){
  tourQueued=false;if(!GD)return;
  if(!guidedTour()&&roomUI.menu&&!helpSeen.has('choices')&&!activeHelp)activeHelp='choices';
  if(!guidedTour()&&!activeHelp){
    document.documentElement.classList.remove('has-external-guide');
    if(tourPanel)tourPanel.hidden=tourShade.hidden=tourRing.hidden=true;
    return;
  }
  createTourElements();tourPanel.hidden=tourShade.hidden=false;document.documentElement.classList.add('has-external-guide');
  const initial=guidedTour(),step=initial?TOUR_STEPS[roomUI.step]:CONTEXT_HELP[activeHelp],wide=innerWidth>=900||(innerWidth>=700&&innerWidth>innerHeight);
  tourPanel.style.width=Math.min(innerWidth-32,260)+'px';tourPanel.style.fontSize='14px';tourPanel.style.maxHeight=Math.max(150,innerHeight-32)+'px';
  const previous=initial&&roomUI.step>(pet().hatched?1:0)?'<button data-tour="previous">이전</button>':'';
  tourPanel.innerHTML='<h2>'+esc(step.title)+'</h2><p>'+esc(step.text)+'</p><nav aria-label="튜토리얼 이동"><small>'+(initial?(roomUI.step+1)+'/3':'사용 팁')+'</small>'+previous+(initial?'<button data-tour="skip">건너뛰기</button>':'<button data-tour="dismiss">알겠어요</button>')+'</nav>';
  const height=tourPanel.getBoundingClientRect().height;
  const device=$('dev').getBoundingClientRect();
  const anchor=focusTarget(),width=tourPanel.getBoundingClientRect().width,cx=anchor?anchor.x+anchor.width/2:device.x+device.width/2;
  const left=Math.max(16,Math.min(innerWidth-width-16,cx-width/2));
  const above=anchor?anchor.y-height-18:device.top+24;
  const top=above>=16?above:Math.min(innerHeight-height-16,(anchor?anchor.y+anchor.height:device.top)+18);
  tourPanel.style.left=Math.round(left)+'px';tourPanel.style.top=Math.round(top)+'px';
  tourPanel.dataset.side=above>=16?'above':'below';
  tourPanel.style.setProperty('--arrow-x',Math.max(20,Math.min(width-20,cx-left))+'px');
  const panelRect=tourPanel.getBoundingClientRect(),target=focusTarget();
  let path='M0 0H'+innerWidth+'V'+innerHeight+'H0Z'+rectanglePath(panelRect,2);
  if(target){path+=targetPath(target);Object.assign(tourRing.style,{left:Math.round(target.x-5)+'px',top:Math.round(target.y-5)+'px',width:Math.round(target.width+10)+'px',height:Math.round(target.height+10)+'px',borderRadius:target.round?'50%':'5px'});tourRing.hidden=false}else tourRing.hidden=true;
  tourShade.style.clipPath='path(evenodd, "'+path+'")';
  $('btns').querySelectorAll('.tutorial-target').forEach(button=>button.classList.remove('tutorial-target'));
}
const renderWithoutTour=render;
render=function(){renderWithoutTour();syncTour();if(typeof requestAnimationFrame==='function'&&!tourQueued){tourQueued=true;requestAnimationFrame(syncTour)}};
for(const event of ['resize','scroll'])addEventListener(event,syncTour,{passive:true});
if(typeof ResizeObserver==='function')new ResizeObserver(()=>{if(!tourQueued){tourQueued=true;requestAnimationFrame(syncTour)}}).observe($('lcdwrap'));
addEventListener('keydown',event=>{
  if((!guidedTour()&&!activeHelp)||event.target.closest?.('input,textarea,select,[contenteditable]'))return;
  const focused=event.target.closest?.('.tutorial-panel button');
  if((event.key==='Enter'||event.key===' ')&&focused){event.preventDefault();event.stopImmediatePropagation();return focused.click()}
  if(event.key==='Tab'&&!guidedTour()&&activeHelp&&tourPanel){const target=$('lcd').querySelector(CONTEXT_HELP[activeHelp].selector),controls=[...(target?target.querySelectorAll('button:not(:disabled),a[href]'):[]),...tourPanel.querySelectorAll('button')];if(controls.length){event.preventDefault();event.stopImmediatePropagation();const index=controls.indexOf(document.activeElement);controls[(index+(event.shiftKey?-1:1)+controls.length)%controls.length].focus()}return}
  if(!guidedTour())return;
  const key={Enter:'OK',' ':'OK',Escape:'BACK',Backspace:'BACK',f:'FEED',p:'PLAY'}[event.key];
  if(event.key==='Tab'&&tourPanel){const target=TOUR_STEPS[roomUI.step].target,button=['FEED','PLAY'].includes(target)?$('btns').querySelector('[data-k="'+target+'"]'):null,controls=[...(button?[button]:[]),...tourPanel.querySelectorAll('button')];if(controls.length){event.preventDefault();event.stopImmediatePropagation();const index=controls.indexOf(document.activeElement);controls[(index+(event.shiftKey?-1:1)+controls.length)%controls.length].focus()}return}
  if(!key)return;event.preventDefault();event.stopImmediatePropagation();input(key);
},true);

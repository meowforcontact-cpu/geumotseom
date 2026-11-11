let furnitureEdit=null,roomPress=null,suppressRoomClick=false;
let furnitureBagPage=0,furnitureEditSnapshot=null;
const furnitureTools=document.createElement('section');
furnitureTools.className='furniture-tools furniture-drawer';
furnitureTools.hidden=true;
furnitureTools.setAttribute('role','region');
furnitureTools.setAttribute('aria-label','가구 가방');
document.body.append(furnitureTools);
// Keep the edit drawer on the D-pad side, OUTSIDE the console and LCD.
// Refit the whole console when space is tight instead of drawing over the room.
function positionFurnitureDrawer(){
 if(furnitureTools.hidden)return;
 const device=$('dev'),viewport=window.visualViewport;
 const viewWidth=viewport?.width||document.documentElement.clientWidth;
 const viewHeight=viewport?.height||window.innerHeight;
 const originX=viewport?.offsetLeft||0,originY=viewport?.offsetTop||0;
 const gap=12,margin=20,drawerWidth=furnitureTools.offsetWidth;
 // The left drawer and all of the console must fit the *visible* viewport.
 // Calculate from the natural viewport size, never the previously resized device.
 const touch=matchMedia('(pointer:coarse)').matches;
 const padT=touch?(MODE==='egg'?64:44):16;
 const naturalWidth=Math.min(viewWidth-48,Math.max(1,viewHeight-padT-48)*GD.W/GD.H,1040);
 const available=Math.max(1,viewWidth-drawerWidth-gap-2*margin);
 device.style.translate='';
 device.style.width=Math.max(1,Math.min(naturalWidth,available))+'px';
 const centeredShift=(drawerWidth+gap)/2;
 device.style.translate=Math.round(centeredShift)+'px 0';
 let rect=device.getBoundingClientRect();
 // Safari visualViewport can be narrower than the layout viewport.
 // Clamp the translated console to both visible edges after CSS sizing.
 const beyondRight=rect.right-(originX+viewWidth-margin);
 if(beyondRight>0){
  device.style.translate=Math.round(centeredShift-beyondRight)+'px 0';
  rect=device.getBoundingClientRect();
 }
 const left=Math.max(originX+8,Math.min(rect.left-drawerWidth-gap,originX+viewWidth-drawerWidth-8));
 const height=furnitureTools.offsetHeight;
 const top=Math.max(originY+8,Math.min(rect.top+(rect.height-height)/2,originY+viewHeight-height-8));
 furnitureTools.style.left=Math.round(left)+'px';
 furnitureTools.style.top=Math.round(top)+'px';
 fitLCD();
}

addEventListener('resize',()=>{if(!furnitureTools.hidden)requestAnimationFrame(positionFurnitureDrawer)});
window.visualViewport?.addEventListener('resize',()=>{if(!furnitureTools.hidden)requestAnimationFrame(positionFurnitureDrawer)});
window.visualViewport?.addEventListener('scroll',()=>{if(!furnitureTools.hidden)requestAnimationFrame(positionFurnitureDrawer)});
const roomPoint=e=>{
 const r=rc.getBoundingClientRect();
 let x=(e.clientX-r.left)/r.width*RW,y=(e.clientY-r.top)/r.height*RH;
 if(isWhitewoodRoom()&&roomAssetsReady()&&placeNow().place!=='park'){
  const view=whitewoodRoomView();
  x=(x-view.x)/view.scale;y=(y-view.y)/view.scale;
 }
 return {x,y};
};
function roomFurnitureAt(x,y){
 return [...state.eq.가구].reverse().find(id=>{
  const b=furnitureRenderBounds(id,furnitureEdit?.id===id?furnitureEdit.draft:null);
  return b&&x>=b.x&&x<b.x+b.width&&y>=b.y&&y<b.y+b.height;
 });
}
function renderFurnitureDrawer(){
 if(!furnitureEdit)return;
 const owned=state.owned.map(item).filter(i=>i&&i.cat==='가구'&&!i.retired).reverse();
 const pages=Math.max(1,Math.ceil(owned.length/4));
 furnitureBagPage=Math.max(0,Math.min(furnitureBagPage,pages-1));
 const selected=item(furnitureEdit.id);
 const tiles=owned.slice(furnitureBagPage*4,furnitureBagPage*4+4).map(i=>
  '<button type="button" class="furniture-drawer__item'+(furnitureEdit.id===i.id?' is-selected':'')+'" data-drawer-item="'+i.id+'" aria-pressed="'+(furnitureEdit.id===i.id)+'" aria-label="'+esc(i.name)+(isOn(i)?' · 배치됨':' · 보관 중')+'">'
  +furnitureIcon(i.id,28)+'<span>'+esc(i.name)+'</span><small>'+(furnitureEdit.id===i.id?'선택됨':isOn(i)?'배치됨':'보관 중')+'</small></button>'
 ).join('');
 furnitureTools.innerHTML=
  '<div class="furniture-drawer__heading"><strong>가구 가방</strong><span>'+owned.length+'개</span></div>'
  +'<p class="furniture-drawer__caption">'+esc(selected?.name||'가구')+' 위치 편집</p>'
  +'<div class="furniture-drawer__grid" role="group" aria-label="보유 가구">'
  +(tiles||'<span class="furniture-drawer__empty">보유한 가구가 없습니다.</span>')+'</div>'
  +'<div class="furniture-drawer__pages"><button type="button" data-drawer-page="-1" aria-label="이전 가구" '+(!furnitureBagPage?'disabled':'')+'>‹</button><span>'+(furnitureBagPage+1)+' / '+pages+'</span><button type="button" data-drawer-page="1" aria-label="다음 가구" '+(furnitureBagPage>=pages-1?'disabled':'')+'>›</button></div>'
  +'<div class="furniture-drawer__actions"><button type="button" data-edit="done">완료</button><button type="button" data-edit="store">보관</button><button type="button" data-edit="cancel">취소</button></div>';
 if(!furnitureTools.hidden)requestAnimationFrame(positionFurnitureDrawer);
}
function startFurnitureEdit(id){
 const i=item(id);if(!i)return;
 if(!furnitureEditSnapshot){
  furnitureEditSnapshot={
   equipped:[...state.eq.가구],
   positions:Object.fromEntries(Object.entries(state.pos).map(([key,p])=>[key,[...p]]))
  };
 }
 if(furnitureEdit&&furnitureEdit.id!==id)state.pos[furnitureEdit.id]=[...furnitureEdit.draft];
 const [,h]=i.size||[FS,FS];
 furnitureEdit={id,draft:[...(state.pos[id]||[32,106-h])]};
 const owned=state.owned.map(item).filter(x=>x&&x.cat==='가구'&&!x.retired).reverse();
 furnitureBagPage=Math.max(0,Math.floor(owned.findIndex(x=>x.id===id)/4));
 furnitureTools.hidden=false;
 renderFurnitureDrawer();
 say('가구를 움직인 뒤 완료를 눌러 주세요.');
}
function finishFurnitureEdit(action){
 if(!furnitureEdit)return;
 if(action==='cancel'&&furnitureEditSnapshot){
  state.eq.가구=[...furnitureEditSnapshot.equipped];
  state.pos=Object.fromEntries(Object.entries(furnitureEditSnapshot.positions).map(([key,p])=>[key,[...p]]));
 }else{
  if(action==='done')state.pos[furnitureEdit.id]=[...furnitureEdit.draft];
  if(action==='store')state.eq.가구=state.eq.가구.filter(id=>id!==furnitureEdit.id);
 }
 furnitureEdit=null;furnitureEditSnapshot=null;furnitureBagPage=0;
 furnitureTools.hidden=true;$('dev').style.translate='';fitDev();
 persist();render();
}
furnitureTools.addEventListener('click',e=>{
 const button=e.target.closest('button');
 if(!button||button.disabled)return;
 const action=button.dataset.edit;
 if(action){finishFurnitureEdit(action);return}
 if(button.dataset.drawerPage){
  furnitureBagPage+=Number(button.dataset.drawerPage);
  renderFurnitureDrawer();return;
 }
 const id=button.dataset.drawerItem;
 if(!id)return;
 const i=item(id);
 if(!i||!state.owned.includes(id))return;
 if(!isOn(i))equip(i,true);
 startFurnitureEdit(id);
 persist();render();
});
function beginFurnitureDrag(press,id){
 if(!furnitureEdit||furnitureEdit.id!==id)startFurnitureEdit(id);
 if(!furnitureEdit)return;
 const b=furnitureRenderBounds(id,furnitureEdit.draft);
 if(!b)return;
 press.active=true;
 // Keep the touched point under the finger instead of jumping to the centre.
 press.offset=[press.start.x-b.x,press.start.y-b.y];
 suppressRoomClick=true;
}
function moveFurnitureDraft(press,p){
 const b=furnitureRenderBounds(furnitureEdit.id,furnitureEdit.draft);
 if(!b)return;
 const whitewood=isWhitewoodRoom();
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 // Keep the complete furniture sprite inside the room, without any other placement restriction.
 const maxX=whitewood?whitewoodWorldWidth():RW;
 const x=clamp(p.x-press.offset[0],0,Math.max(0,maxX-b.width));
 const y=clamp(p.y-press.offset[1],0,Math.max(0,RH-b.height));
 furnitureEdit.draft=[Math.round(x-(whitewood?0:DX)),Math.round(y)];
 QK='';
}
rc.addEventListener('pointerdown',e=>{
 if(scr().id!=='home'||e.button!==0||roomPress)return;
 suppressRoomClick=false;
 const p=roomPoint(e),id=roomFurnitureAt(p.x,p.y);
 if(furnitureEdit&&id!==furnitureEdit.id)return;
 roomPress={pointer:e.pointerId,start:p,last:p,id,active:false,pet:false};
 if(id){
  suppressRoomClick=true;
  if(furnitureEdit)beginFurnitureDrag(roomPress,id);
  else roomPress.timer=setTimeout(()=>{if(roomPress?.pointer===e.pointerId)beginFurnitureDrag(roomPress,id)},450);
 }else{
  if(!furnitureEdit&&roomDepthPetAt(p.x,p.y)){
   roomPress.pet=true;roomPress.active=true;
   roomPress.petOffset=[p.x-(cat.x+32),p.y-(cat.y-size/2)];
  }else if(!furnitureEdit){
   roomPress.timer=setTimeout(()=>{if(roomPress?.pointer===e.pointerId){roomPress=null;push('deco')}},550);
  }
 }
 rc.setPointerCapture?.(e.pointerId);
 if(furnitureEdit||id)e.preventDefault();
});
rc.addEventListener('pointermove',e=>{
 if(!roomPress||roomPress.pointer!==e.pointerId)return;
 const p=roomPoint(e);roomPress.last=p;
 const moved=Math.hypot(p.x-roomPress.start.x,p.y-roomPress.start.y)>3;
 if(roomPress.pet){
  if(moved){
   const inset=(64-(stage()==='egg'?34:38))/2;
   const right=(isWhitewoodRoom()&&roomAssetsReady()&&placeNow().place!=='park'?whitewoodWorldWidth():RW);
   cat.x=cat.tx=Math.round(Math.max(-inset,Math.min(right-64+inset,p.x-roomPress.petOffset[0]-32)));
   cat.y=cat.ty=Math.round(Math.max(45,Math.min(124,p.y-roomPress.petOffset[1]+(stage()==='egg'?17:19))));
   anim={type:'play',t:20};suppressRoomClick=true;e.preventDefault();
  }
  return;
 }
 if(!roomPress.active&&moved){
  clearTimeout(roomPress.timer);
  if(roomPress.id&&furnitureEdit)beginFurnitureDrag(roomPress,roomPress.id);
  else {roomPress.moved=true;return}
 }
 if(!roomPress.active||!furnitureEdit)return;
 moveFurnitureDraft(roomPress,p);
 rc.style.cursor='grabbing';
 e.preventDefault();
});
function endRoomPress(e){
 if(!roomPress||e.pointerId!==roomPress.pointer)return;
 clearTimeout(roomPress.timer);
 if(roomPress.pet&&Math.hypot(roomPress.last.x-roomPress.start.x,roomPress.last.y-roomPress.start.y)<=3)suppressRoomClick=false;
 roomPress=null;rc.style.cursor='default';
}
rc.addEventListener('pointerup',endRoomPress);
rc.addEventListener('pointercancel',endRoomPress);
rc.addEventListener('contextmenu',e=>{if(scr().id==='home')e.preventDefault()});
rc.addEventListener('click',e=>{
 if(suppressRoomClick||furnitureEdit){e.stopImmediatePropagation();suppressRoomClick=false;}
},true);
document.addEventListener('keydown',e=>{if(furnitureEdit&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finishFurnitureEdit('cancel');}},true);
function drawFurnitureSelection(k){
 if(!furnitureEdit)return;
 if(scr().id!=='home'){finishFurnitureEdit('cancel');return;}
 const b=furnitureRenderBounds(furnitureEdit.id,furnitureEdit.draft);if(!b)return;
 k.save();k.strokeStyle=skin==='pink'?'#b87598':'#60729f';k.lineWidth=.5;k.setLineDash([2,1]);
 k.strokeRect(b.x-1,b.y-1,b.width+2,b.height+2);k.restore();
}

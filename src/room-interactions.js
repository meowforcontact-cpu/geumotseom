let furnitureEdit=null,roomPress=null,suppressRoomClick=false;
const furnitureTools=document.createElement('div');
furnitureTools.className='furniture-tools';furnitureTools.hidden=true;
furnitureTools.setAttribute('role','group');furnitureTools.setAttribute('aria-label','가구 위치 편집');
furnitureTools.innerHTML='<button type="button" data-edit="done">완료</button><button type="button" data-edit="store">보관</button><button type="button" data-edit="bag">가구 가방</button><button type="button" data-edit="cancel">취소</button>';
$('lcdwrap').append(furnitureTools);
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
function startFurnitureEdit(id){
 const i=item(id);if(!i)return;
 const [w,h]=i.size||[FS,FS];
 furnitureEdit={id,draft:[...(state.pos[id]||[32,106-h])]};
 furnitureTools.hidden=false;
 say('가구를 손가락으로 옮긴 뒤 완료를 눌러 주세요.');
}
function finishFurnitureEdit(action){
 if(!furnitureEdit)return;
 if(action==='done')state.pos[furnitureEdit.id]=[...furnitureEdit.draft];
 if(action==='store')state.eq.가구=state.eq.가구.filter(id=>id!==furnitureEdit.id);
 furnitureEdit=null;furnitureTools.hidden=true;persist();render();
 if(action==='bag')push('furnitureBag');
}
furnitureTools.addEventListener('click',e=>{const action=e.target.closest('[data-edit]')?.dataset.edit;if(action)finishFurnitureEdit(action)});
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
 const left=whitewood?3:0,right=whitewood?125:RW;
 const minY=whitewood?34:55-b.height;
 const maxY=whitewood?125-b.height:RH-b.height;
 const x=clamp(p.x-press.offset[0],left,Math.max(left,right-b.width));
 const y=clamp(p.y-press.offset[1],minY,Math.max(minY,maxY));
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
  const size=stage()==='egg'?34:38,px=cat.x+(64-size)/2,py=FLOOR-size+(isWhitewoodRoom()?14:0);
  if(!furnitureEdit&&p.x>=px&&p.x<px+size&&p.y>=py&&p.y<py+size){
   roomPress.pet=true;roomPress.active=true;
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
  if(moved){cat.x=cat.tx=Math.round(Math.max(0,Math.min(RW-64,p.x-32)));anim={type:'play',t:20};suppressRoomClick=true;e.preventDefault();}
  return;
 }
 if(!roomPress.active&&moved){
  clearTimeout(roomPress.timer);
  if(roomPress.id)beginFurnitureDrag(roomPress,roomPress.id);
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
 if(scr().id!=='home'){furnitureEdit=null;furnitureTools.hidden=true;return;}
 const b=furnitureRenderBounds(furnitureEdit.id,furnitureEdit.draft);if(!b)return;
 k.save();k.strokeStyle=skin==='pink'?'#b87598':'#60729f';k.lineWidth=.5;k.setLineDash([2,1]);
 k.strokeRect(b.x-1,b.y-1,b.width+2,b.height+2);k.restore();
}

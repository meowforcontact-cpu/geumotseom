let furnitureEdit=null,roomPress=null,suppressRoomClick=false;
const furnitureTools=document.createElement('div');
furnitureTools.className='furniture-tools';furnitureTools.hidden=true;
furnitureTools.setAttribute('role','group');furnitureTools.setAttribute('aria-label','가구 위치 편집');
furnitureTools.innerHTML='<button type="button" data-edit="done">완료</button><button type="button" data-edit="store">보관</button><button type="button" data-edit="bag">가구 가방</button><button type="button" data-edit="cancel">취소</button>';
$('lcdwrap').append(furnitureTools);
const roomPoint=e=>{const r=rc.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*RW,y:(e.clientY-r.top)/r.height*RH}};
function roomFurnitureAt(x,y){
 return [...state.eq.가구].reverse().find(id=>{const i=item(id);if(!i||i.retired)return false;
 const [w,h]=i.size||[FS,FS],p=state.pos[id]||[32,106-h];return x>=p[0]+DX&&x<p[0]+DX+w&&y>=p[1]&&y<p[1]+h;});
}
function startFurnitureEdit(id){
 const i=item(id),[w,h]=i.size||[FS,FS];
 furnitureEdit={id,draft:[...(state.pos[id]||[32,106-h])]};
 furnitureTools.hidden=false;say('드래그로 옮긴 뒤 완료를 눌러 주세요.');
}
function finishFurnitureEdit(action){
 if(!furnitureEdit)return;
 if(action==='done')state.pos[furnitureEdit.id]=[...furnitureEdit.draft];
 if(action==='store')state.eq.가구=state.eq.가구.filter(id=>id!==furnitureEdit.id);
 furnitureEdit=null;furnitureTools.hidden=true;persist();render();
 if(action==='bag')push('furnitureBag');
}
furnitureTools.addEventListener('click',e=>{const action=e.target.closest('[data-edit]')?.dataset.edit;if(action)finishFurnitureEdit(action)});
rc.addEventListener('pointerdown',e=>{
 if(scr().id!=='home'||e.button!==0||roomPress)return;
 const p=roomPoint(e),id=roomFurnitureAt(p.x,p.y);
 if(!furnitureEdit&&p.x>=cat.x&&p.x<=cat.x+64&&p.y>=CY&&p.y<=CY+64){roomPress={pointer:e.pointerId,start:p,last:p,pet:true,active:true};rc.setPointerCapture(e.pointerId);suppressRoomClick=true;rc.style.cursor='grabbing';return;}
 roomPress={pointer:e.pointerId,start:p,last:p,id,active:false};
 if(furnitureEdit){roomPress.active=true;roomPress.offset=[p.x-DX-furnitureEdit.draft[0],p.y-furnitureEdit.draft[1]];suppressRoomClick=true;}
 else roomPress.timer=setTimeout(()=>{
  if(!roomPress)return;suppressRoomClick=true;roomPress.active=true;
  if(id){startFurnitureEdit(id);roomPress.offset=[p.x-DX-furnitureEdit.draft[0],p.y-furnitureEdit.draft[1]];}
  else{roomPress=null;push('deco');}
 },550);
 rc.setPointerCapture(e.pointerId);
});
rc.addEventListener('pointermove',e=>{
 if(scr().id==='home'){const p=roomPoint(e);rc.style.cursor=roomPress?'grabbing':roomFurnitureAt(p.x,p.y)||(p.x>=cat.x&&p.x<=cat.x+64&&p.y>=CY&&p.y<=CY+64)?'grab':'default';}
 if(!roomPress||e.pointerId!==roomPress.pointer)return;
 const p=roomPoint(e);roomPress.last=p;
 if(roomPress.pet){cat.x=cat.tx=Math.round(Math.max(0,Math.min(RW-64,p.x-32)));anim={type:'play',t:20};e.preventDefault();return;}
 if(!roomPress.active&&Math.hypot(p.x-roomPress.start.x,p.y-roomPress.start.y)>3){clearTimeout(roomPress.timer);return;}
 if(!roomPress.active||!furnitureEdit)return;
 const [w,h]=item(furnitureEdit.id).size||[FS,FS],o=roomPress.offset;
 furnitureEdit.draft=[Math.round(Math.max(-DX,Math.min(RW-DX-w,p.x-DX-o[0]))),Math.round(Math.max(55-h,Math.min(RH-h,p.y-o[1])))];
 e.preventDefault();
});
function endRoomPress(e){if(!roomPress||e.pointerId!==roomPress.pointer)return;clearTimeout(roomPress.timer);
 // Keep the existing petTap response reachable after a tap; only a real drag consumes click.
 if(roomPress.pet&&Math.hypot(roomPress.last.x-roomPress.start.x,roomPress.last.y-roomPress.start.y)<=3)suppressRoomClick=false;
 roomPress=null;}
rc.addEventListener('pointerup',endRoomPress);
rc.addEventListener('pointercancel',e=>{endRoomPress(e);if(furnitureEdit)finishFurnitureEdit('cancel')});
rc.addEventListener('contextmenu',e=>{if(scr().id==='home')e.preventDefault()});
rc.addEventListener('click',e=>{if(suppressRoomClick||furnitureEdit){e.stopImmediatePropagation();suppressRoomClick=false;}},true);
document.addEventListener('keydown',e=>{if(furnitureEdit&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finishFurnitureEdit('cancel');}},true);
function drawFurnitureSelection(k){
 if(!furnitureEdit)return;
 if(scr().id!=='home'){furnitureEdit=null;furnitureTools.hidden=true;return;}
 const [w,h]=item(furnitureEdit.id).size||[FS,FS],p=furnitureEdit.draft;
 k.save();k.strokeStyle=skin==='pink'?'#b87598':'#60729f';k.lineWidth=.5;k.setLineDash([2,1]);k.strokeRect(p[0]+DX-1,p[1]-1,w+2,h+2);k.restore();
}


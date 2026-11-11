// Camera captures the 4:3 LCD pixels, not the physical console controls.
// Always render from the existing room canvas; game state is never modified.
let photoPanel=null,photoZoom=1,photoCenter={x:.5,y:.5};
function photoCrop(w,h,z,focus){
  let cw=w/Math.max(1,z),ch=cw*3/4;
  if(ch>h){ch=h/Math.max(1,z);cw=ch*4/3}
  cw=Math.max(1,Math.min(cw,w));ch=Math.max(1,Math.min(ch,h));
  const cx=Math.max(cw/2,Math.min(w-cw/2,focus.x*w));
  const cy=Math.max(ch/2,Math.min(h-ch/2,focus.y*h));
  return [cx-cw/2,cy-ch/2,cw,ch];
}
function paintPhoto(){
 if(!photoPanel||!rc||!rc.width||!rc.height)return;
 const c=photoPanel.querySelector('canvas'),k=c.getContext('2d'),box=photoCrop(rc.width,rc.height,photoZoom,photoCenter);
 k.imageSmoothingEnabled=false;k.clearRect(0,0,c.width,c.height);
 k.drawImage(rc,...box,0,0,c.width,c.height);
 photoPanel.querySelector('[data-zoom-label]').textContent=photoZoom.toFixed(1)+'×';
}
function photoKey(e){if(e.key==='Escape')closePhoto()}
function closePhoto(){if(!photoPanel)return;photoPanel.remove();photoPanel=null;document.removeEventListener('keydown',photoKey)}
function savePhoto(){
 if(!photoPanel)return;
 const canvas=photoPanel.querySelector('canvas');
 canvas.toBlob(blob=>{
   if(!blob){photoPanel?.querySelector('[data-photo-info]')?.replaceChildren(document.createTextNode('PNG 저장을 지원하지 않습니다.'));return}
   const url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='geumotseom-room-'+new Date().toISOString().slice(0,10)+'.png';
   document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 },'image/png');
}
function openPhoto(){
 if(photoPanel){paintPhoto();return}
 if(placeNow().place==='park'){say('내 방에서 촬영할 수 있어요.');return}
 photoZoom=1;photoCenter={x:.5,y:.5};
 const panel=document.createElement('section');
 panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
 panel.setAttribute('aria-label','마이룸 사진 모드');
 panel.style.cssText='position:fixed;inset:0;z-index:2147483640;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box';
 panel.innerHTML='<div class="photo-sheet"><header><strong>마이룸 사진 모드</strong><button data-close>닫기 ×</button></header><canvas width="1360" height="1020" aria-label="사진 미리보기"></canvas><small>사진을 드래그해 구도를 이동할 수 있습니다.</small><footer><button data-minus aria-label="축소">−</button><span data-zoom-label>1.0×</span><button data-plus aria-label="확대">+</button><button data-reset>전체 보기</button><button data-save>PNG 저장</button></footer><small data-photo-info aria-live="polite"></small></div>';
 const sheet=panel.querySelector('.photo-sheet');
 sheet.style.cssText='box-sizing:border-box;width:min(96vw,850px);max-height:96dvh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:12px;border:2px solid #dfa9c3;border-radius:14px;background:#fff7fb;color:#714661;font:14px sans-serif';
 sheet.querySelector('header').style.cssText='display:flex;justify-content:space-between;align-items:center';
 sheet.querySelector('footer').style.cssText='display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap';
 const canvas=panel.querySelector('canvas');
 canvas.style.cssText='display:block;width:100%;height:auto;aspect-ratio:4/3;max-height:65dvh;object-fit:contain;image-rendering:pixelated;background:#000;border:2px solid #d5a4bc;touch-action:none;box-sizing:border-box';
 panel.querySelectorAll('button').forEach(b=>b.style.cssText='background:#f9deeb;color:#70445c;border:1px solid #c991af;border-radius:8px;padding:8px 12px;cursor:pointer;min-height:38px');
 document.body.append(panel);photoPanel=panel;
 const zoom=v=>{photoZoom=Math.max(1,Math.min(3,Math.round(v*10)/10));paintPhoto()};
 panel.querySelector('[data-close]').addEventListener('click',closePhoto);
 panel.addEventListener('click',e=>{if(e.target===panel)closePhoto()});
 panel.querySelector('[data-minus]').addEventListener('click',()=>zoom(photoZoom-.2));
 panel.querySelector('[data-plus]').addEventListener('click',()=>zoom(photoZoom+.2));
 panel.querySelector('[data-reset]').addEventListener('click',()=>{photoCenter={x:.5,y:.5};zoom(1)});
 panel.querySelector('[data-save]').addEventListener('click',savePhoto);
 let pointer=null;
 canvas.addEventListener('pointerdown',e=>{pointer=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{
   if(!pointer)return;
   const r=canvas.getBoundingClientRect();
   photoCenter.x=Math.max(0,Math.min(1,photoCenter.x-(e.clientX-pointer[0])/r.width/photoZoom));
   photoCenter.y=Math.max(0,Math.min(1,photoCenter.y-(e.clientY-pointer[1])/r.height/photoZoom));
   pointer=[e.clientX,e.clientY];paintPhoto();
 });
 canvas.addEventListener('pointerup',()=>pointer=null);
 canvas.addEventListener('pointercancel',()=>pointer=null);
 document.addEventListener('keydown',photoKey);
 paintPhoto();panel.querySelector('[data-close]').focus();
}
const previousPhotoDecoList=SCR.deco.list;
SCR.deco.list=()=>[L('사진 찍기','ipaw',openPhoto,'확대·이동·PNG 저장'),...previousPhotoDecoList()];

// Direct access from the console X menu, even outside the decorating submenu.
MENU_ALL.push(['사진 찍기','npaw',openPhoto]);

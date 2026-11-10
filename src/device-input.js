// Physical controls own a pointer gesture; compatibility click never runs it twice.
function bindBtn(b,k){
 let press=null,ignoreClick=false;
 const clear=()=>{if(press)clearTimeout(press.timer);press=null;b.classList.remove('is-pressed');};
 const cancel=()=>{clear();ignoreClick=true;};
 b.addEventListener('pointerdown',e=>{
  if(e.button!==0||press||b.disabled)return;
  e.preventDefault();ignoreClick=false;
  beep(k==='OK'?660:k==='HOME'?440:540);
  const p=press={id:e.pointerId,screen:scr(),long:false};
  b.setPointerCapture(e.pointerId);b.classList.add('is-pressed');
  if(k==='OK'||k==='FEED')p.timer=setTimeout(()=>{
   if(press!==p||scr()!==p.screen)return;
   p.long=true;input(k==='OK'?'BACK':'FEEDMENU');
  },550);
 });
 b.addEventListener('pointerup',e=>{
  if(!press||e.pointerId!==press.id)return;
  const p=press,r=b.getBoundingClientRect();
  const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
  clear();ignoreClick=true;
  if(!p.long&&inside&&scr()===p.screen&&!b.disabled)input(k);
 });
 b.addEventListener('pointermove',e=>{
  if(!press||e.pointerId!==press.id)return;
  const r=b.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)cancel();
 });
 b.addEventListener('pointercancel',e=>{if(press&&e.pointerId===press.id)cancel();});
 b.addEventListener('lostpointercapture',()=>{if(press)cancel()});
 b.addEventListener('contextmenu',e=>e.preventDefault());
 b.addEventListener('click',e=>{
  // detail=0 is keyboard/assistive activation, with no pointerup counterpart.
  if(ignoreClick&&e.detail!==0){ignoreClick=false;return;}
  if(!b.disabled)input(k);
 });
}

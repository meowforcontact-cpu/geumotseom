// Existing navigation actions and account state are reused; no independent wallet/save.
const DIARY_GROUPS=[['오늘의 활동',[0,1,5]],['꾸미기·수집',[2,9,3]],['커뮤니티',[4,6]],['내 정보',[8]]];
const DIARY_ORDER=DIARY_GROUPS.flatMap(([,ids])=>ids);
MAIN_MENU.push(['보관함','navShop',()=>push('deco')]);
function diaryProfile(){
 const p=pet();
 return '<article class="diary-profile"><span class="diary-caption">MY ROOM DIARY</span><button type="button" class="diary-polaroid" data-diary-profile aria-label="내 프로필 열기"><canvas data-pet="'+p.kind+'|'+(p.hatched?1:0)+'"></canvas><span>'+esc(p.name)+'</span></button><strong>나의 작은 기록</strong><span>XP '+fmt(state.xp)+'</span><p>오늘도 함께 쉬어 가요.</p><button type="button" class="diary-link" data-diary-profile>내 프로필 ›</button></article>';
}
function diaryMenuView(s){
 const profile=s.diaryPage==='profile';
 return '<section class="diary-spread'+(profile?' show-profile':'')+'" aria-label="마이룸 다이어리"><nav class="diary-tabs" aria-label="다이어리 페이지"><button type="button" data-diary-page="menu" aria-pressed="'+!profile+'">메뉴</button><button type="button" data-diary-page="profile" aria-pressed="'+profile+'">내 기록</button></nav>'+diaryProfile()+'<div class="diary-binding" aria-hidden="true"></div><article class="diary-menu-page"><h2>섬의 하루</h2>'+DIARY_GROUPS.map(([label,ids])=>'<section class="diary-group"><h3>'+label+'</h3><div>'+ids.map(i=>{const [name,art]=MAIN_MENU[i];return '<button type="button" class="diary-cell'+(s.cur===i?' is-selected':'')+'" data-diary-item="'+i+'" aria-label="'+name+'" aria-current="'+(s.cur===i)+'">'+icon(art,16)+'<span>'+name+'</span></button>';}).join('')+'</div></section>').join('')+'</article></section>';
}
const beforeDiaryBody=body;
body=function(s){return ['menu','act'].includes(s.id)?diaryMenuView(s):beforeDiaryBody(s)};
function diaryOpen(index){const entry=MAIN_MENU[index];if(!entry)return;MAIN_MENU[index][2]();}
document.addEventListener('focusin',e=>{
 const b=e.target.closest?.('[data-diary-item]');if(!b||!['menu','act'].includes(scr().id))return;
 scr().cur=Number(b.dataset.diaryItem);
 document.querySelectorAll('[data-diary-item]').forEach(el=>{const selected=el===b;el.classList.toggle('is-selected',selected);el.setAttribute('aria-current',String(selected));});
});
document.addEventListener('click',e=>{
 if(!['menu','act'].includes(scr().id))return;
 const b=e.target.closest?.('[data-diary-item],[data-diary-profile],[data-diary-page]');if(!b||b.disabled)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(b.hasAttribute('data-diary-profile'))return diaryOpen(7);
 if(b.dataset.diaryPage){scr().diaryPage=b.dataset.diaryPage;return render();}
 const index=Number(b.dataset.diaryItem);scr().cur=index;diaryOpen(index);
},true);
const beforeDiaryInput=input;
input=function(key){
 const s=scr();
 if(!['menu','act'].includes(s.id))return beforeDiaryInput(key==='U'?'L':key==='D'?'R':key);
 if(!['U','D','L','R','OK'].includes(key))return beforeDiaryInput(key);
 const focused=document.activeElement?.closest?.('[data-diary-profile],[data-diary-page]');
 if(key==='OK'&&focused){focused.click();return;}
 if(s.diaryPage==='profile'){
  if(key==='OK')return diaryOpen(7);
  if(key==='R'||key==='L'){s.diaryPage='menu';render();}return;
 }
 let pos=DIARY_ORDER.indexOf(s.cur);if(pos<0)pos=0;
 if(key==='OK')return diaryOpen(DIARY_ORDER[pos]);
 if(key==='U'||key==='D'){
  let row=DIARY_GROUPS.findIndex(([,ids])=>ids.includes(DIARY_ORDER[pos]));
  const col=DIARY_GROUPS[row][1].indexOf(DIARY_ORDER[pos]);
  row=(row+(key==='D'?1:-1)+DIARY_GROUPS.length)%DIARY_GROUPS.length;
  const ids=DIARY_GROUPS[row][1];s.cur=ids[Math.min(col,ids.length-1)];
 }else{pos=(pos+(key==='R'?1:-1)+DIARY_ORDER.length)%DIARY_ORDER.length;s.cur=DIARY_ORDER[pos];}
 render();
};
// Keep screen contents at their original vertical scale; reveal more room horizontally.
const beforeDiaryRender=render;
render=function(){beforeDiaryRender();const st=$('st');if(st)st.classList.toggle('diary-host',['menu','act'].includes(scr().id));};

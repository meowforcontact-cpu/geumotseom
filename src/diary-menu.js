// Landscape ring-binder menu. Profile and daily actions stay left; nine distinct features stay right.
const LANDSCAPE_QUICK=[
 {label:'출석',icon:'navAttendance',screen:'att'},
 {label:'일일미션',icon:'navMissions',screen:'daily'},
 {label:'우편함',icon:'navMail',screen:'mail'}
];
const LANDSCAPE_MENU_GROUPS=[
 {label:'기록·수집',items:[
  {label:'랭킹',icon:'itrophy',screen:'rank'},
  {label:'도감',icon:'navBook',screen:'book'},
  {label:'업적',icon:'ialbum',screen:'ach'}
 ]},
 {label:'꾸미기',items:[
  {label:'상점',icon:'navShop',screen:'shop'},
  {label:'보관함',icon:'ilist',screen:'furnitureBag'},
  {label:'방 꾸미기',icon:'ihouse',screen:'deco'}
 ]},
 {label:'커뮤니티·이동',items:[
  {label:'친구',icon:'navFriends',screen:'friends'},
  {label:'게시판',icon:'navBoard',screen:'board'},
  {label:'외출',icon:'navPlaza',screen:'out'}
 ]}
];
const LANDSCAPE_MENU=LANDSCAPE_MENU_GROUPS.flatMap(group=>group.items);
const LANDSCAPE_ACTIONS=[...LANDSCAPE_QUICK,...LANDSCAPE_MENU];

function landscapeProfile(){
 const p=pet();
 const name=(typeof account!=='undefined'&&account?.name)||p.name;
 const stats=[
  ['냐냐냥',fmt(state.coins)],
  ['XP',fmt(state.xp)]
 ].map(([label,value])=>
  '<div class="landscape-diary__stat"><span>'+label+'</span><strong>'+value+'</strong></div>').join('');
 return '<section class="landscape-diary__left" aria-label="내 프로필과 오늘의 활동">'
  +'<div class="landscape-diary__left-title">MY PAGE <span>· GEUMOTSEOM</span></div>'
  +'<div class="landscape-diary__identity"><button type="button" class="landscape-diary__portrait" data-diary-profile aria-label="내 프로필 열기">'
  +'<canvas data-pet="'+p.kind+'|'+(p.hatched?1:0)+'"></canvas></button>'
  +'<div class="landscape-diary__identity-copy"><strong>'+esc(name)+'</strong>'
  +'<button type="button" data-diary-profile class="landscape-diary__profile-link">내 프로필</button></div></div>'
  +'<div class="landscape-diary__stats">'+stats+'</div>'
  +'<div class="landscape-diary__activity-heading">오늘의 활동 <span>DAILY</span></div>'
  +'<nav class="landscape-diary__quick" aria-label="출석, 일일미션, 우편함">'
  +LANDSCAPE_QUICK.map((item,i)=>
   '<button type="button" data-diary-action="'+i+'" class="landscape-diary__quick-button" aria-label="'+item.label+'">'
   +'<span class="landscape-diary__quick-icon">'+icon(item.icon,13)+'</span><span>'+item.label+'</span>'
   +(i===0&&state.att.done?'<small>완료</small>':'')+'</button>').join('')
  +'</nav></section>';
}
function landscapeMenuView(s){
 let actionIndex=LANDSCAPE_QUICK.length;
 const groups=LANDSCAPE_MENU_GROUPS.map(group=>
  '<section class="landscape-diary__category" aria-label="'+group.label+'">'
  +'<h3>'+group.label+'</h3><div class="landscape-diary__category-items">'
  +group.items.map(item=>{
   const index=actionIndex++;
   return '<button type="button" data-diary-action="'+index+'" class="landscape-diary__menu-link'+(s.cur===index?' is-selected':'')+'" aria-label="'+item.label+'">'
    +'<span class="landscape-diary__menu-icon">'+icon(item.icon,14)+'</span>'
    +'<span class="landscape-diary__menu-label">'+item.label+'</span></button>';
  }).join('')
  +'</div></section>').join('');
 return '<section class="landscape-diary" aria-label="그못섬 가로 다이어리 메뉴">'
  +'<div class="landscape-diary__layer" aria-hidden="true"></div>'
  +landscapeProfile()
  +'<div class="landscape-diary__binding" aria-hidden="true">'
  +Array.from({length:4},()=>'<i class="landscape-diary__ring"></i>').join('')+'</div>'
  +'<article class="landscape-diary__right" aria-label="카테고리 메뉴">'
  +'<header class="landscape-diary__right-title"><span>MENU</span><small>INDEX / 01</small></header>'
  +'<nav class="landscape-diary__groups" aria-label="게임 기능 9개">'+groups+'</nav>'
  +'</article>'
  +'<nav class="landscape-diary__index" aria-label="바인더 인덱스">'
  +'<button type="button" class="is-current" data-diary-index="home" aria-current="page" aria-label="HOME · 내 방">HOME</button>'
  +'<button type="button" data-diary-index="help" aria-label="HELP · 도움말">HELP</button>'
  +'<button type="button" data-diary-index="set" aria-label="SETTINGS · 설정">SETTINGS</button>'
  +'</nav></section>';
}
const beforeLandscapeBody=body;
body=function(s){return (s.id==='menu'||s.id==='act')?landscapeMenuView(s):beforeLandscapeBody(s)};
function landscapeOpen(index){
 const action=LANDSCAPE_ACTIONS[index];
 if(action)push(action.screen);
}
document.addEventListener('click',e=>{
 if(!['menu','act'].includes(scr().id))return;
 const btn=e.target.closest?.('[data-diary-action],[data-diary-profile],[data-diary-index]');
 if(!btn||btn.disabled)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(btn.hasAttribute('data-diary-profile'))return push('prof');
 if(btn.hasAttribute('data-diary-index')){
  const page=btn.dataset.diaryIndex;
  if(page==='home')return goHome();
  if(page==='help'||page==='set')return push(page);
  return;
 }
 const index=Number(btn.dataset.diaryAction);
 if(Number.isInteger(index)&&index>=0&&index<LANDSCAPE_ACTIONS.length)landscapeOpen(index);
},true);
document.addEventListener('focusin',e=>{
 const btn=e.target.closest?.('[data-diary-action]');
 if(!btn||!['menu','act'].includes(scr().id))return;
 const index=Number(btn.dataset.diaryAction);
 if(Number.isInteger(index)&&index>=0&&index<LANDSCAPE_ACTIONS.length){
  scr().cur=index;
  document.querySelectorAll('[data-diary-action]').forEach(el=>el.classList.toggle('is-selected',el===btn));
 }
});
const beforeLandscapeInput=input;
input=function(key){
 const s=scr();
 if(!['menu','act'].includes(s.id))return beforeLandscapeInput(key);
 if(!['U','D','L','R','OK'].includes(key))return beforeLandscapeInput(key);
 const active=document.activeElement?.closest?.('[data-diary-profile],[data-diary-index]');
 if(key==='OK'&&active){
  if(active.hasAttribute('data-diary-profile'))return push('prof');
  const page=active.dataset.diaryIndex;
  if(page==='home')return goHome();
  if(page==='help'||page==='set')return push(page);
 }
 let i=Number.isInteger(s.cur)&&s.cur>=0&&s.cur<LANDSCAPE_ACTIONS.length?s.cur:3;
 if(key==='OK')return landscapeOpen(i);
 if(key==='L')i=i>=3?((i-3)%3===0?Math.floor((i-3)/3):i-1):i;
 else if(key==='R')i=i<3?3+i*3:((i-3)%3===2?i:i+1);
 else if(i<3)i=(i+(key==='D'?1:2))%3;
 else {
  const row=Math.floor((i-3)/3),col=(i-3)%3;
  i=3+((row+(key==='D'?1:2))%3)*3+col;
 }
 s.cur=i;render();
};
const beforeLandscapeRender=render;
render=function(){
 beforeLandscapeRender();
 const st=$('st');
 if(st)st.classList.toggle('diary-host',['menu','act'].includes(scr().id));
};
(function ensureLandscapeGuard(){
 if(document.getElementById('landscape-only'))return;
 const gate=document.createElement('div');
 gate.id='landscape-only';gate.setAttribute('role','status');
 gate.setAttribute('aria-label','가로 화면으로 회전 안내');
 gate.innerHTML='<div class="landscape-only__icon" aria-hidden="true">▭</div><strong>가로 화면으로 돌려주세요</strong><span>세로 모드는 임시 점검 중입니다.</span>';
 document.body.appendChild(gate);
})();

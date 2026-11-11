// Landscape notebook menu. Reuses existing screens, storage, wallet and pet assets.
const LANDSCAPE_QUICK=[
 {label:'출석',icon:'navAttendance',screen:'att'},
 {label:'일일미션',icon:'navMissions',screen:'daily'},
 {label:'우편함',icon:'navMail',screen:'mail'}
];
const LANDSCAPE_MENU=[
 {label:'랭킹',icon:'itrophy',screen:'rank'},
 {label:'도감',icon:'navBook',screen:'book'},
 {label:'상점',icon:'navShop',screen:'shop'},
 {label:'보관함',icon:'navShop',screen:'deco'},
 {label:'게시판',icon:'navBoard',screen:'board'},
 {label:'설정',icon:'navSettings',screen:'set'}
];
const LANDSCAPE_ACTIONS=[...LANDSCAPE_QUICK,...LANDSCAPE_MENU];
function landscapeProfile(){
 const p=pet(),rank=Number.isInteger(state.rank)&&state.rank>0?'#'+state.rank:'—';
 const fields=[
  ['보유 재화',fmt(state.coins)+'냥'],
  ['XP',fmt(state.xp)],
  ['랭킹',rank]
 ];
 const stats=fields.map(([label,value])=>
  '<div class="landscape-diary__stat"><span>'+label+'</span><strong>'+value+'</strong></div>').join('');
 return '<section class="landscape-diary__left" aria-label="내 정보와 오늘의 활동">'
  +'<div class="landscape-diary__left-title">그못섬 <span>· PROFILE</span></div>'
  +'<div class="landscape-diary__identity"><button type="button" class="landscape-diary__portrait" data-diary-profile aria-label="내 프로필 열기">'
  +'<canvas data-pet="'+p.kind+'|'+(p.hatched?1:0)+'"></canvas></button>'
  +'<div class="landscape-diary__identity-copy"><small>닉네임</small><strong>'+esc(p.name)+'</strong>'
  +'<button type="button" data-diary-profile class="landscape-diary__profile-link">프로필 보기</button></div></div>'
  +'<div class="landscape-diary__stats">'+stats+'</div>'
  +'<div class="landscape-diary__activity-heading">오늘의 활동 <span>DAILY</span></div>'
  +'<nav class="landscape-diary__quick" aria-label="오늘의 활동">'
  +LANDSCAPE_QUICK.map((item,i)=>
   '<button type="button" data-diary-action="'+i+'" class="landscape-diary__quick-button" aria-label="'+item.label+'">'
   +'<span class="landscape-diary__quick-icon">'+icon(item.icon,11)+'</span><span>'+item.label+'</span>'
   +(i===0&&state.att.done?'<small>완료</small>':'')+'</button>').join('')
  +'</nav></section>';
}
function landscapeMenuView(s){
 return '<section class="landscape-diary" aria-label="그못섬 가로 다이어리 메뉴">'
 +'<div class="landscape-diary__layer" aria-hidden="true"></div>'
 +landscapeProfile()
 +'<div class="landscape-diary__binding" aria-hidden="true">'
 +Array.from({length:4},()=>'<i class="landscape-diary__ring"></i>').join('')+'</div>'
 +'<article class="landscape-diary__right" aria-label="게임 메뉴">'
 +'<header class="landscape-diary__right-title"><span>MENU</span><small>GEUMOTSEOM</small></header>'
 +'<nav class="landscape-diary__menu" aria-label="메인 메뉴">'
 +LANDSCAPE_MENU.map((item,i)=>
 '<button type="button" data-diary-action="'+(i+3)+'" class="landscape-diary__menu-button'+(s.cur===i+3?' is-selected':'')+'" aria-label="'+item.label+'">'
 +'<span class="landscape-diary__menu-icon">'+icon(item.icon,19)+'</span>'
 +'<span>'+item.label+'</span></button>').join('')
 +'</nav></article><div class="landscape-diary__index" aria-hidden="true">'
 +'<span>HOME</span><span>INFO</span><span>SHOP</span></div></section>';
}
const beforeLandscapeBody=body;
body=function(s){return (s.id==='menu'||s.id==='act')?landscapeMenuView(s):beforeLandscapeBody(s)};
function landscapeOpen(index){
 const action=LANDSCAPE_ACTIONS[index];
 if(!action)return;
 push(action.screen);
}
document.addEventListener('click',e=>{
 if(!['menu','act'].includes(scr().id))return;
 const btn=e.target.closest?.('[data-diary-action],[data-diary-profile]');
 if(!btn||btn.disabled)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(btn.hasAttribute('data-diary-profile'))return push('prof');
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
 const active=document.activeElement?.closest?.('[data-diary-profile]');
 if(key==='OK'&&active)return push('prof');
 let i=Number.isInteger(s.cur)&&s.cur>=0&&s.cur<9?s.cur:3;
 if(key==='OK')return landscapeOpen(i);
 if(key==='L')i=i>=3?(i===3?0:i-3):Math.max(0,i-1);
 else if(key==='R')i=i<3?i+3:Math.min(8,i+1);
 else if(i<3)i=(i+(key==='D'?1:2))%3;
 else {
  const pos=i-3,row=Math.floor(pos/2),column=pos%2;
  i=3+((row+(key==='D'?1:2))%3)*2+column;
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

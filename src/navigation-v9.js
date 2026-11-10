// v9 changes navigation only; src/pet.html remains the byte-preserved original.
const ROLLBACK_KEY='geumotseom.before-menu-v9';
function preserveBeforeMenu(){
  try{
    if(localStorage.getItem(ROLLBACK_KEY)===null){
      localStorage.setItem(ROLLBACK_KEY,JSON.stringify({version:8,capturedAt:new Date().toISOString(),save:localStorage.getItem(KEY),skin:localStorage.getItem('pikaSkin'),sound:localStorage.getItem('pikaSnd')}));
    }
  }catch{/* A full or blocked storage must not prevent playing. */}
}
preserveBeforeMenu();
try{if(localStorage.getItem('geumotseom.before-calendar-v10')===null)localStorage.setItem('geumotseom.before-calendar-v10',JSON.stringify({capturedAt:new Date().toISOString(),save:localStorage.getItem(KEY)}))}catch{}
function exportBeforeMenu(){
  try{
    const before=JSON.parse(localStorage.getItem(ROLLBACK_KEY)||'null');
    if(!before?.save)return say('개편 전 저장된 진행이 없어요.');
    const value=JSON.parse(before.save);validateSave(value,ITEMS);
    const url=URL.createObjectURL(new Blob([before.save],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='geumotseom-before-menu-v9.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch{say('개편 전 진행 파일을 확인해 주세요.');}
}

const openScreen=id=>()=>push(id);
const MAIN_MENU=[
  ['출석체크','navAttendance',openScreen('att')],['일일미션','navMissions',openScreen('daily')],['상점','navShop',openScreen('shop')],
  ['도감','navBook',openScreen('book')],['친구목록','navFriends',openScreen('friends')],['우편함','navMail',openScreen('mail')],
  ['게시판','navBoard',openScreen('board')],['내 프로필','navProfile',openScreen('prof')],['설정','navSettings',openScreen('set')]
];
SCR.menu.grid=()=>MAIN_MENU;
const originalBody=body;
body=function(s){
 if(s.id==='att')return attendanceView();
 if(s.id==='daily')return dailyNotebookView(s);
 if(s.id!=='menu'&&s.id!=='act')return originalBody(s);
 return '<div class="nav-menu-grid">'+MAIN_MENU.map(([label,sprite],i)=>'<button type="button" class="nav-menu-cell'+(s.cur===i?' is-selected':'')+'" data-i="'+i+'" aria-label="'+label+'"><span class="nav-menu-art">'+icon(sprite,22)+'</span><span class="nav-menu-label">'+label+'</span></button>').join('')+'</div>';
};
// The console's old activity shortcut now opens the same nine-item menu.
F.act[0]='메뉴';F.act[1]='nmenu';F.act[2]=openScreen('menu');F.act[3]='nmenu';
F.out[0]='외출';F.out[2]=openScreen('out');
const originalHomeHTML=homeHTML;
S.idoor=['..dddddd....','..dkkkkdd...','..dkkbbkd...','..dkkbbkd...','..dkkkkkd...','..dkkkykd...','..dkkkkkd...','..dkkkkkd...','..dkkkkkd...','..ddddddd...','.ddddddddd..','............'];
homeHTML=function(){return originalHomeHTML().replace('<div class="bd"></div>','<div class="bd"><button type="button" class="room-exit" data-go="out" aria-label="문 열고 외출" title="외출">'+icon('idoor',18)+'</button></div>')};
SCR.act={title:'메뉴',grid:()=>MAIN_MENU};
SCR.visit={title:'친구목록',list:()=>SCR.friends.list()};
// The catalog opens directly. Personal achievements and records belong to the ID card.
if(SCR.prof?.view){
 const profileView=SCR.prof.view;
 SCR.prof.view=s=>{
  const html=profileView(s);if(s.fi!=null)return html;
  return html.replace(/<div class="bt">[\s\S]*?<\/div><\/div><\/div>$/, '<div class="bt profile-links"><button type="button" data-go="ach">업적</button><button type="button" data-go="daily" data-notebook-open="history">활동 기록</button><button type="button" data-go="album">앨범</button></div></div></div>');
 };
}
SCR.friends={title:'친구목록',list:()=>[
  L('친구 연결을 준비하고 있어요','heart',()=>{},'',1),
  L('내 프로필 보기','iid',openScreen('prof')),L('광장으로 가기','itree',()=>visitMapPlace('plaza')),BACK()
]};
SCR.mail={title:'우편함',list:()=>[
  L('쪽지','imail',openScreen('messages')),L('칭찬카드','heart',openScreen('praise')),
  ...(state.sent.length?[L('이전 체험 카드 기록','ilist',openScreen('oldCards'))]:[]),BACK()
]};
SCR.messages={title:'쪽지',list:()=>[L('친구 연결 후 이용할 수 있어요','imail',()=>{},'',1),BACK()]};
SCR.praise={title:'칭찬카드',list:()=>[L('마음을 전할 카드를 준비 중이에요','heart',()=>{},'',1),BACK()]};
SCR.oldCards={title:'이전 체험 카드',list:()=>[L('실제로 전송된 카드는 아니에요','ilist',()=>{},'',1),...state.sent.map(([to,msg])=>L(to+' · '+msg,'imail',()=>{},'',1)),BACK()]};
SCR.board={title:'게시판',list:()=>[L('섬 소식을 나눌 공간이에요','ialbum',()=>{},'',1),L('글쓰기·댓글은 준비 중이에요','ilist',()=>{},'',1),BACK()]};
const baseSettings=SCR.set.list;
SCR.set.list=()=>{const rows=baseSettings();rows.splice(rows.length-1,0,L('구매·보상 기록','ilist',openScreen('log')),L('도움말','ibook',openScreen('help')));return rows};
const baseSaves=SCR.save.list;
SCR.save.list=()=>{const rows=baseSaves();rows.splice(2,0,L('개편 전 진행 저장','ilist',exportBeforeMenu));return rows};
SCR.help={title:'도움말',pages:()=>3,view:s=>{
 const pages=[['내 방에서','알은 세 번 톡톡 눌러 주세요.','먹이·놀이·꾸미기·외출을 해요.','외출을 누르면 지도가 열려요.'],['오늘 할 일','메뉴에서 출석과 미션을 열어요.','밥 주기와 놀이가 미션에 반영돼요.','미션은 한국시간 0시에 갱신돼요.'],['내 기록','설정 → 저장·연결에서 저장해요.','새로고침해도 진행은 남아요.','친구·쪽지·게시판은 준비 중이에요.']];
 const [title,...lines]=pages[s.pg];return '<div class="c"><div class="h">'+title+'</div>'+lines.map(l=>'<div class="s">'+l+'</div>').join('')+'</div>';
}};
function attendanceView(){
 persist();const a=state.att,today=day(),[year,month]=today.split('-').map(Number);
 const offset=new Date(Date.UTC(year,month-1,1)).getUTCDay();
 const count=new Date(Date.UTC(year,month,0)).getUTCDate(),rows=Math.ceil((offset+count)/7);
 const dates=new Set(a.dates||[]);
 const cells=Array.from({length:rows*7},(_,i)=>{
  const n=i-offset+1;if(n<1||n>count)return '<span class="calendar-day empty" aria-hidden="true"></span>';
  const date=today.slice(0,7)+'-'+String(n).padStart(2,'0'),marked=dates.has(date),current=date===today;
  return '<span class="calendar-day'+(marked?' stamped':'')+(current?' today':'')+'"'+(current?' aria-current="date"':'')+' aria-label="'+month+'월 '+n+'일'+(marked?' 출석 완료':current?' 오늘':'')+'"><span>'+n+'</span>'+(marked?icon('ipaw',8):'')+'</span>';
 }).join('');
 return '<section class="attendance" aria-label="내 출석 기록">'
  +'<div class="att-summary"><span>연속 '+fmt(a.streak)+'일</span><span title="'+(a.totalEstimated?'이전 누적은 확인된 기록 기준의 최소 횟수예요':'누적 출석 일수')+'">누적 '+fmt(a.total)+'일'+(a.totalEstimated?'+':'')+'</span></div>'
  +'<div class="att-calendar pixel-paper"><div class="calendar-month">'+year+'년 '+month+'월</div><div class="calendar-week" aria-hidden="true">'+['일','월','화','수','목','금','토'].map(d=>'<span>'+d+'</span>').join('')+'</div><div class="calendar-days" style="--weeks:'+rows+'">'+cells+'</div></div>'
  +'<button type="button" class="pixel-action att-check'+(a.done?' is-done':'')+'" '+(a.done?'disabled':'data-ok')+' title="출석 보상 100냥 · 5,000 XP">'+icon('ipaw',8)+'<span>'+(a.done?'오늘 출석 완료':'오늘 발도장 찍기')+'</span></button>'
  +'<span class="sr">한국시간 매일 0시 갱신. 출석 보상 100냥, 5,000 XP. 날짜별 도장은 확인된 출석 기록만 표시합니다.</span></section>';
}
SCR.att={title:'출석수첩',right:()=>{persist();return day().slice(5).replace('-','.')},view:attendanceView,ok:()=>{
 persist();if(!claimAttendance(state))return;
 gain(100,5000,'출석 보상');persist();render();
}};
const dailyTitle=()=>day().slice(5).replace('-','.');
function dailyMissionRows(){
 const d=ensureDaily(state),locked=stage()==='egg';
 return [
  {label:'오늘 출석하기',done:state.att.done,action:'출석 도장 찍기',go:()=>SCR.att.ok()},
  {label:'밥 한 번 주기',done:d.feed,locked,action:'밥 주러 가기',go:()=>push('food')},
  {label:'함께 한 번 놀기',done:d.play,locked,action:'함께 놀기',go:()=>care('play')}
 ];
}
function notebookTabs(s){
 return '<div class="notebook-tabs" aria-label="미션 수첩 페이지"><button type="button" data-notebook-tab="today" aria-pressed="'+(s.notebookTab!=='history')+'">오늘 미션</button><button type="button" data-notebook-tab="history" aria-pressed="'+(s.notebookTab==='history')+'">활동 기록</button></div>';
}
function notebookHistoryView(s){
 const d=ensureDaily(state);
 return '<section class="daily-notebook" aria-label="내 활동 기록">'+notebookTabs(s)+'<div class="notebook-history"><h3>오늘 돌보기</h3><dl>'+[['출석',state.att.done?'완료':'아직'],['밥 주기',d.feed?'완료':'아직'],['함께 놀기',d.play?'완료':'아직'],['누적 출석',fmt(state.att.total||0)+'일']].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>').join('')+'</dl><button type="button" data-go="log">구매·보상 기록</button></div></section>';
}
function dailyNotebookView(s){
 if(s.notebookTab==='history')return notebookHistoryView(s);
 persist();const rows=dailyMissionRows(),count=rows.filter(r=>r.done).length;
 if(!s.missionInitialized){s.pg=Math.max(0,rows.findIndex(r=>!r.done));s.missionInitialized=true}
 s.pg=Math.max(0,Math.min(s.pg||0,rows.length-1));
 const selected=rows[s.pg];
 return '<section class="daily-notebook" aria-label="일일미션 체크수첩">'
  +notebookTabs(s)+'<div class="mission-summary"><span>오늘 '+count+'/'+rows.length+' 완료</span><span>'+(count===rows.length?'모두 완료':(rows.length-count)+'개 남음')+'</span></div>'
  +'<div class="mission-paper pixel-paper"><span class="notebook-rings" aria-hidden="true"><i></i><i></i><i></i></span><div class="mission-lines">'
  +rows.map((r,i)=>'<button type="button" class="mission-row'+(r.done?' complete':'')+(s.pg===i&&!r.done?' chosen':'')+'" data-mission="'+i+'" aria-current="'+(s.pg===i)+'" aria-label="'+r.label+' · '+(r.done?'완료':r.locked?'부화 후 가능':r.status||'미완료')+'"><span class="mission-checkbox'+(r.done?' checked':'')+'" aria-hidden="true"></span><span class="mission-label">'+r.label+'</span><span class="mission-status">'+(r.done?'완료':r.locked?'잠김':r.status||'0/1')+'</span></button>').join('')+'</div></div>'
  +'<button type="button" class="pixel-action mission-action" '+(count===rows.length||selected.done||selected.locked?'disabled':'data-ok')+'>'+(count===rows.length?'오늘 미션 완료':selected.done?'완료한 미션이에요':selected.locked?'알을 깨우면 시작해요':selected.action+' ›')+'</button>'
  +'<span class="sr">한국시간 매일 0시에 갱신돼요. 각 행동을 완료하면 자동으로 체크돼요.</span></section>';
}
SCR.daily={title:'일일미션',right:()=>{persist();return dailyTitle()},view:dailyNotebookView,pages:()=>dailyMissionRows().length,ok:s=>{
 if(s.notebookTab==='history')return;
 persist();const selected=dailyMissionRows()[s.pg];
 if(selected.done)return;if(selected.locked)return say('알을 먼저 깨워 주세요.');
 selected.go();persist();
 if(scr().id==='daily'){const next=dailyMissionRows().findIndex(r=>!r.done);if(next>=0)s.pg=next;render()}
}};
document.addEventListener('click',event=>{
 const tab=event.target.closest?.('[data-notebook-tab]');
 if(tab&&scr().id==='daily'){event.preventDefault();event.stopImmediatePropagation();const change=()=>{scr().notebookTab=tab.dataset.notebookTab;scr().pg=0;scr().missionInitialized=false;};if(typeof turnNotebook==='function')turnNotebook(change);else{change();render();}return;}
 const history=event.target.closest?.('[data-notebook-open]');
 if(history){event.preventDefault();event.stopImmediatePropagation();push('daily',{notebookTab:'history'});return;}
 const target=event.target.closest?.('[data-mission]');if(!target||scr().id!=='daily')return;
 event.preventDefault();event.stopImmediatePropagation();scr().pg=Number(target.dataset.mission);render();
},true);

const MAP_PLACES=[
 {id:'home',name:'내 방',icon:'navHome',x:23,y:67,detail:'친구가 기다리는 포근한 내 방'},
 {id:'plaza',name:'광장',icon:'navPlaza',x:51,y:32,detail:'친구들과 인사할 섬의 한가운데'},
 {id:'shop',name:'상점',icon:'navShop',x:79,y:66,detail:'내 방을 꾸밀 물건을 구경해요'}
];
function visitMapPlace(id){
 if(id==='home'){goHome();return;}
 if(id==='shop'){push('shop');return;}
 if(id==='plaza'){push('plaza');return;}
}
function returnToMap(){
 const index=ui.stack.findLastIndex(s=>s.id==='out');
 if(index>=0){ui.stack.length=index+1;render();}else{goHome();push('out');}
}
function mapTerrain(){
 return '<svg class="island-terrain" viewBox="0 0 240 112" preserveAspectRatio="none" aria-hidden="true"><rect width="240" height="112" fill="#c3e3ef"/><path fill="#eaf8ff" d="M8 18h17v2H8zm192 14h23v2h-23zM12 90h19v2H12zm193 6h24v2h-24z"/><path fill="#80b8cf" d="M53 12h129v8h27v12h12v45h-15v20h-34v8H60v-8H30V83H20V37h15V23h18z"/><path fill="#f2e2bc" d="M53 8h129v8h27v12h12v45h-15v20h-34v8H60v-8H30V79H20V33h15V19h18z"/><path fill="#b8d6b0" d="M58 16h118v8h26v13h10v30h-16v17h-29v8H64v-8H39V74H30V39h15V27h13z"/><path fill="#f6ebd4" d="M116 30h12v39h60v10H51V69h65z"/><path fill="#a1c69e" d="M57 35h17v4H57zm106-4h20v4h-20zM78 84h15v3H78zm78-29h15v3h-15z"/><path fill="#f5d6d5" d="M43 46h3v3h-3zm142-5h3v3h-3zM92 23h3v3h-3zm63 60h3v3h-3z"/></svg>';
}
function mapView(s){
 const selected=MAP_PLACES[s.pg||0];
 return '<div class="island-map">'+mapTerrain()+MAP_PLACES.map((p,i)=>'<button type="button" class="map-destination'+(p.id===selected.id?' chosen':'')+'" style="left:'+p.x+'%;top:'+p.y+'%" data-map-place="'+p.id+'" aria-label="'+p.name+' 가기">'+icon(p.icon,16)+'<span>'+p.name+'</span></button>').join('')+'</div><div class="map-caption">'+esc(selected.detail)+'</div><button type="button" class="map-enter" data-map-place="'+selected.id+'">▶ '+selected.name+' 가기</button>';
}
SCR.out={title:'어디로 갈까?',pages:()=>MAP_PLACES.length,view:mapView,ok:s=>visitMapPlace(MAP_PLACES[s.pg||0].id)};
SCR.plaza={title:'광장',list:()=>[
 L('친구들이 모일 광장이에요','itree',()=>{},'',1),
 L('함께 걷고 인사할 공간을 준비 중','heart',()=>{},'',1),
 L('친구목록','iid',openScreen('friends')),L('게시판','ialbum',openScreen('board')),L('지도로 돌아가기','idoor',returnToMap),L('내 방으로','ihouse',goHome)
]};
document.addEventListener('click',event=>{
 const target=event.target.closest?.('[data-map-place]');
 if(!target||scr().id!=='out')return;
 event.preventDefault();event.stopImmediatePropagation();visitMapPlace(target.dataset.mapPlace);
},true);

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
  ['도감·업적','navBook',openScreen('collection')],['친구목록','navFriends',openScreen('friends')],['우편함','navMail',openScreen('mail')],
  ['게시판','navBoard',openScreen('board')],['내 프로필','navProfile',openScreen('prof')],['설정','navSettings',openScreen('set')]
];
SCR.menu.grid=()=>MAIN_MENU;
const originalBody=body;
body=function(s){
 if(s.id!=='menu'&&s.id!=='act')return originalBody(s);
 return '<div class="nav-menu-grid">'+MAIN_MENU.map(([label,sprite],i)=>'<button type="button" class="nav-menu-cell'+(s.cur===i?' is-selected':'')+'" data-i="'+i+'" aria-label="'+label+'"><span class="nav-menu-art">'+icon(sprite,16)+'</span><span class="nav-menu-label">'+label+'</span></button>').join('')+'</div>';
};
// The console's old activity shortcut now opens the same nine-item menu.
F.act[0]='메뉴';F.act[1]='nmenu';F.act[2]=openScreen('menu');F.act[3]='nmenu';
F.out[0]='외출';F.out[2]=openScreen('out');
const originalHomeHTML=homeHTML;
homeHTML=function(){return originalHomeHTML().replace('<div class="bd"></div>','<div class="bd"><div class="home-quick"><button type="button" data-go="deco">▶ 꾸미기</button><button type="button" data-go="out">▶ 외출</button></div></div>')};
SCR.act={title:'메뉴',grid:()=>MAIN_MENU};
SCR.visit={title:'친구목록',list:()=>SCR.friends.list()};
SCR.collection={title:'도감·업적',list:()=>[
  L('펫·칭호·배지','ibook',openScreen('book')),L('업적','itrophy',openScreen('ach')),L('앨범','ialbum',openScreen('album')),BACK()
]};
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
SCR.set.list=()=>{const rows=baseSettings();rows.splice(rows.length-1,0,L('활동 기록','ilist',openScreen('log')),L('도움말','ibook',openScreen('help')));return rows};
const baseSaves=SCR.save.list;
SCR.save.list=()=>{const rows=baseSaves();rows.splice(2,0,L('개편 전 진행 저장','ilist',exportBeforeMenu));return rows};
SCR.help={title:'도움말',pages:()=>3,view:s=>{
 const pages=[['내 방에서','알은 세 번 톡톡 눌러 주세요.','먹이·놀이·꾸미기·외출을 해요.','외출을 누르면 지도가 열려요.'],['오늘 할 일','메뉴에서 출석과 미션을 열어요.','밥 주기와 놀이가 미션에 반영돼요.','미션은 한국시간 0시에 갱신돼요.'],['내 기록','설정 → 저장·연결에서 저장해요.','새로고침해도 진행은 남아요.','친구·쪽지·게시판은 준비 중이에요.']];
 const [title,...lines]=pages[s.pg];return '<div class="c"><div class="h">'+title+'</div>'+lines.map(l=>'<div class="s">'+l+'</div>').join('')+'</div>';
}};
const attendanceOK=SCR.att.ok;
SCR.att.ok=()=>{persist();attendanceOK();persist();};
const dailyTitle=SCR.daily.right;
SCR.daily.right=()=>{persist();return dailyTitle()};

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

// Discord activity belongs to the existing notebook, not another menu tree.
// Existing reward ledgers/API are retained. This notebook does not award new P.
let activityData=null,activityBusy=false,activityError='',activityErrorStatus=0,activityLoadedAt=0,activityRequestedDay='',activityPoll=null,activityPollCount=0;
async function activityRequest(action='',value={}){
 if(activityBusy)return;activityBusy=true;activityError='';activityErrorStatus=0;render();
 try{
  const result=await accountRequest('account/activity'+(action?'/'+action:'?source=discord'),action?{...value,source:'discord'}:undefined);
  if(action){activityPollCount=0;activityData={...activityData,selection:{status:'pending'}};}
  else{activityData={...result,history:Array.isArray(result.history)?result.history.slice(0,30):[],earnings:Array.isArray(result.earnings)?result.earnings.slice(0,30):undefined};activityLoadedAt=Date.now();}
  if((action||result.loading||result.selection?.status==='pending')&&activityPollCount<12){clearTimeout(activityPoll);activityPoll=setTimeout(()=>{activityPollCount++;void activityRequest();},2500);}else activityPollCount=0;
  if(result.grantedPets?.includes('angel')){if(!state.owned.includes('p1'))state.owned.push('p1');if(!state.pets.some(p=>p.kind==='angel'))state.pets.push({name:'천사냥',kind:'angel',hatched:false,taps:0});}
  for(const id of result.granted||[])if(ITEMS.some(p=>p.id===id)&&!state.owned.includes(id))state.owned.push(id);
  persist();
 }catch(error){activityErrorStatus=error.status||0;activityError=error.status===401?'로그인을 다시 확인해 주세요.':error.message||'그못방 활동 기록을 불러오지 못했어요.';}
 finally{activityBusy=false;render();}
}
function ensureNotebookActivity(){
 if(!account||activityBusy||activityRequestedDay===day())return;
 activityRequestedDay=day();void activityRequest();
}
function openNotebookHistory(){
 const s=scr();s.notebookTab='history';ensureNotebookActivity();render();
}
MAIN_MENU[1][2]=()=>push('daily');
for(const id of ['missions','community','activityMissions'])SCR[id]={...SCR.daily,title:'일일미션'};
function notebookHistoryRows(){
 if(activityData?.day!==day()||activityData.trackingEnabled===false||!activityData.totals)return [];
 const start=day(Date.now()-29*86400000),end=day(),seen=new Set();
 return [{day:end,...activityData.totals},...(Array.isArray(activityData.history)?activityData.history:[])].filter(h=>{
  if(!h||typeof h.day!=='string'||h.day<start||h.day>end||seen.has(h.day)||!/^\d{4}-\d{2}-\d{2}$/.test(h.day)||!Number.isSafeInteger(h.messages)||h.messages<0||!Number.isSafeInteger(h.voiceSeconds)||h.voiceSeconds<0)return false;
  seen.add(h.day);return true;
 }).sort((a,b)=>b.day.localeCompare(a.day)).slice(0,30);
}
function notebookRecordHeader(){
 const right=activityError?(activityErrorStatus===401?'<button type="button" data-go="account">로그인 확인</button>':'<button type="button" data-activity-retry title="'+esc(activityError)+'">다시 확인</button>'):activityBusy?'확인 중…':'최근 30일';
 return '<div class="mission-summary"><span>그못방</span><span>'+right+'</span></div>';
}
function notebookEarningsRows(){
 // These amounts must come from the existing bot ledger, never from local care or P rewards.
 if(activityData?.origin!=='newpika'||!Array.isArray(activityData.earnings))return null;
 const start=day(Date.now()-29*86400000),end=day();
 return activityData.earnings.filter(r=>r.day>=start&&r.day<=end&&Number.isSafeInteger(r.coins)&&r.coins>0).slice(0,30);
}
SCR.daily.pages=()=>scr().notebookTab==='history'?Math.max(1,Math.ceil((scr().recordView==='earnings'?notebookEarningsRows()||[]:notebookHistoryRows()).length/3)):dailyMissionRows().length;
notebookHistoryView=function(s){
 if(s.recordView==='earnings')return notebookEarningsView(s);
 const today=activityData?.day===day(),ready=today&&activityData.trackingEnabled!==false&&!!activityData.totals;
 const history=notebookHistoryRows(),pages=Math.max(1,Math.ceil(history.length/3));
 s.pg=Math.max(0,Math.min(s.pg||0,pages-1));
 const status=activityBusy?'기록 확인 중…':activityError||(!account?'계정을 연결하면 내 활동을 볼 수 있어요.':'뉴피카 기록 연결 전이에요.\n연결 후 여기에 표시돼요.');
 return '<section class="daily-notebook" aria-label="내 활동 기록">'+notebookTabs(s)
  +notebookRecordHeader()
  +'<div class="mission-paper pixel-paper history-paper"><span class="notebook-rings" aria-hidden="true"><i></i><i></i><i></i></span><div class="history-content">'
  +'<div class="history-heading"><span>날짜</span><span>대화</span><span>음성</span></div>'
  +(ready?history.slice(s.pg*3,s.pg*3+3).map(h=>'<div class="history-day"><span>'+esc(h.day===day()?'오늘':h.day.slice(5).replace('-','.'))+'</span><span>'+fmt(h.messages)+'회</span><span>'+Math.floor(h.voiceSeconds/60)+'분</span></div>').join(''):'<div class="history-day"><span>오늘</span><span aria-label="그못방 대화 미연결">—</span><span aria-label="그못방 음성 미연결">—</span></div><p class="history-empty" role="status">'+esc(status)+'</p>')
  +'</div></div>'
  +'<button type="button" class="history-switch" data-record-view="earnings">냐냐냥 획득 내역 ›</button>'
  +(pages>1?'<div class="history-pager" aria-label="활동 기록 페이지"><button type="button" data-pg="-1" aria-label="이전 기록">‹</button><span>'+(s.pg+1)+' / '+pages+'</span><button type="button" data-pg="1" aria-label="다음 기록">›</button></div>':'')
  +'</section>';
};
function notebookEarningsView(s){
 const rows=notebookEarningsRows(),pages=Math.max(1,Math.ceil((rows||[]).length/3));
 s.pg=Math.max(0,Math.min(s.pg||0,pages-1));
 const labels={mission:'미션',tag:'태그',event:'이벤트',chat:'대화',voice:'음성',attendance:'출석','stream-bonus':'방송',community:'커뮤니티','first-sortie':'첫 출격','broadcast-mission':'미션',admin:'지급','admin-adjust':'조정',refund:'환불',casino:'게임'};
 return '<section class="daily-notebook" aria-label="냐냐냥 획득 내역">'+notebookTabs(s)
  +notebookRecordHeader()
  +'<div class="mission-paper pixel-paper history-paper"><span class="notebook-rings" aria-hidden="true"><i></i><i></i><i></i></span><div class="history-content earnings-content">'
  +'<div class="history-heading"><span>날짜</span><span>획득 경로</span><span>냐냐냥</span></div>'
  +(rows?.length?rows.slice(s.pg*3,s.pg*3+3).map(r=>'<div class="history-day"><span>'+esc(r.day===day()?'오늘':r.day.slice(5).replace('-','.'))+'</span><span title="'+esc(r.title||labels[r.source]||'기타')+'">'+esc(labels[r.source]||'기타')+'</span><span>+'+fmt(r.coins)+'</span></div>').join(''):'<p class="history-empty" role="status">'+esc(activityBusy?'획득 기록 확인 중…':activityError|| (rows?'이 기간의 획득 내역이 없어요.':'뉴피카 원장 연결 후\n미션·태그·이벤트로 얻은\n냐냐냥을 표시해요.'))+'</p>')
  +'</div></div><button type="button" class="history-switch" data-record-view="activity">‹ 활동량 보기</button>'
  +(pages>1?'<div class="history-pager" aria-label="획득 내역 페이지"><button type="button" data-pg="-1" aria-label="이전 내역">‹</button><span>'+(s.pg+1)+' / '+pages+'</span><button type="button" data-pg="1" aria-label="다음 내역">›</button></div>':'')
  +'</section>';
}
// An existing nonzero reward balance remains usable without advertising a new economy.
SCR.activityRewards={title:'이전 활동 보상',list:()=>[
 L('이전 보상 잔액','icoin',()=>{},activityData?.points==null?'확인 필요':activityData.points+'P',1),
 ...(activityData?.rewards||[]).map(r=>L(r.name,r.itemId,async()=>{
  if(state.owned.includes(r.itemId))return say('보유함에서 방에 놓을 수 있어요.');
  await activityRequest('exchange',{itemId:r.itemId});
  if(activityError)say(activityError);else if(state.owned.includes(r.itemId))say('보유함에 담았어요.');
 },state.owned.includes(r.itemId)?'보유 중':r.cost+'P')),BACK()
]};
document.addEventListener('click',event=>{
 const view=event.target.closest?.('[data-record-view]');
 if(view&&scr().id==='daily'){event.preventDefault();event.stopImmediatePropagation();scr().recordView=view.dataset.recordView;scr().pg=0;render();return;}
 const target=event.target.closest?.('[data-activity-retry]');if(!target)return;
 event.preventDefault();event.stopImmediatePropagation();void activityRequest();
},true);
// Refresh automatically when the user comes back from participating in Discord.
addEventListener('focus',()=>{
 if(scr().id==='daily'&&account&&!activityBusy&&Date.now()-activityLoadedAt>30000)void activityRequest();
});

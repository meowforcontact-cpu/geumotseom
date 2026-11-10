// Approved daily/weekly pools and open season goals.
// Rewards and care receipts are validated by the server and bot.
const COMMUNITY_MISSIONS=[['play','함께 놀기','펫과 놀이 성공'],['feed','밥 주기','펫에게 밥 주기 성공'],['chat','그못방 대화','뉴피카가 인정한 대화'],['voice','함께 음성','인정된 음성 채널 활동'],['party','파티 참여','주최자가 참여 확정한 파티']];
const SEASON_MISSIONS=[['days','꾸준한 하루','일일 미션 세 개 완수 누적 30일'],['chat','대화 친구','인정된 대화 누적 1,000회'],['voice','함께한 시간','인정된 음성 누적 40시간'],['party','파티 단골','확정 파티 누적 20회'],['partners','새로운 동행','서로 다른 파티 동행자 15명']];
const missionIds=new Set(COMMUNITY_MISSIONS.map(m=>m[0]));
const careTutorialView=dailyNotebookView,careTutorialOK=SCR.daily.ok;
// Keep the old three care exercises available as tutorial practice, not missions.
SCR.carePractice={title:'돌보기 연습',list:()=>[L('밥 주기 연습','ifood',()=>stage()==='egg'?say('알을 먼저 깨워 주세요.'):push('food')),L('함께 놀기 연습','heart',()=>stage()==='egg'?say('알을 먼저 깨워 주세요.'):care('play')),BACK()]};
const originalNotebookTabs=notebookTabs;notebookTabs=s=>originalNotebookTabs(s).replace('오늘 미션','미션');
if(SCR.help?.view){const helpView=SCR.help.view;SCR.help.view=s=>helpView(s).replace('밥 주기와 놀이가 미션에 반영돼요.','서버가 확인한 밥 주기·놀이 성공이 미션에 반영돼요.').replace('미션은 한국시간 0시에 갱신돼요.','미션은 일일·주간·시즌으로 확인해요.')+(s.pg===1?'<button type="button" class="practice-link" data-go="carePractice">돌보기 연습</button>':'');}
function missionPeriod(s){return ['daily','weekly','season'].includes(s.missionPeriod)?s.missionPeriod:'daily';}
function missionPeriodKey(period){
 if(period==='daily')return day();
 const local=new Date(day()+'T00:00:00Z');return day(local.getTime()-((local.getUTCDay()+6)%7)*86400000);
}
function missionRemote(period){
 const data=activityData?.origin==='newpika'&&activityData.day===day()?activityData.missionPeriods?.[period]:null;
 return data&&typeof data.id==='string'&&data.id.length<=100?data:null;
}
function missionChoices(period){
 const remote=missionRemote(period);
 if(remote)return [...new Set((Array.isArray(remote.choices)?remote.choices:[]).filter(id=>missionIds.has(id)))].slice(0,3);
 const plan=state.missionPlans?.[period];
 return plan?.period===missionPeriodKey(period)?plan.choices:[];
}
function missionTask(period,id){const tasks=missionRemote(period)?.tasks;return Array.isArray(tasks)?tasks.find(t=>t?.id===id):undefined;}
function missionPaid(period,id){return missionTask(period,id)?.paid===true;}
function missionSelected(s){return s.missionEditing?s.missionDraft||[]:missionChoices(missionPeriod(s));}
function missionOpenChoices(s){s.missionEditing=true;s.missionDraft=[...missionChoices(missionPeriod(s))];s.pg=0;render();}
function missionProgress(task){
 if(!task)return '기록 미연결';
 if(task.paid===true)return '보상 지급 완료';
 if(task.complete===true)return '달성 · 지급 확인 중';
 if(task.id==='first-sortie')return '시즌 첫 파티 참여 확정';
 const labels={feed:'밥 주기',play:'놀이',days:'완수일',chat:'대화',voice_ms:'음성',attendance:'출석',stream_ms:'방송',parties:'파티',partners:'동행자'};
 const values=Object.entries(task.requirements||{}).filter(([key,n])=>labels[key]&&Number.isSafeInteger(n)&&n>0).map(([key,n])=>{
  const p=Number.isSafeInteger(task.progress?.[key])&&task.progress[key]>=0?task.progress[key]:null;
  return labels[key]+' '+(p===null?'—':key.endsWith('_ms')?Math.floor(p/60000):p)+'/'+(key.endsWith('_ms')?Math.ceil(n/60000)+'분':n+'회');
 });
 return values.join(' · ')||'목표 확인 중';
}
function missionPeriodTabs(s){const p=missionPeriod(s);return '<div class="mission-periods" aria-label="미션 기간">'+[['daily','일일'],['weekly','주간'],['season','시즌']].map(([id,n])=>'<button type="button" data-mission-period="'+id+'" aria-pressed="'+(p===id)+'">'+n+'</button>').join('')+'</div>';}
function communityMissionView(s){
 ensureNotebookActivity();if(s.notebookTab==='history')return notebookHistoryView(s);
 const period=missionPeriod(s),remote=missionRemote(period),selected=missionSelected(s);
 const tasks=period==='season'?SEASON_MISSIONS:s.missionEditing?COMMUNITY_MISSIONS:COMMUNITY_MISSIONS.filter(m=>selected.includes(m[0]));
 const pages=Math.max(1,Math.ceil(tasks.length/3));s.pg=Math.max(0,Math.min(s.pg||0,pages-1));
 const paid=selected.filter(id=>missionPaid(period,id)).length;
 const summary=period==='season'?(remote?.seasonName||'시즌 기록'):s.missionEditing?'할 미션 '+selected.length+'/3 선택':selected.length?(remote?paid+'/3 보상 지급':'3개 선택 저장'):'5개 중 3개 선택';
 const notice=activityData?.selection?.status==='pending'?'뉴피카에서 선택 확인 중…':activityData?.selection?.status==='rejected'?activityData.selection.reason:s.missionEditing?'보상받은 미션은 바꿀 수 없어요.':remote?'보상은 냐냐냥·XP 각각 동일 지급':'뉴피카에서 최신 미션을 확인 중이에요.';
 let rows=tasks.slice(s.pg*3,s.pg*3+3).map(([id,name,description])=>{
  const t=missionTask(period,id),checked=s.missionEditing?selected.includes(id):t?.complete||t?.paid;
  const disabled=s.missionEditing&&remote&&t?.enabled!==true;
  const status=s.missionEditing?(missionPaid(period,id)?'지급 완료 · 유지':disabled?'현재 선택 불가':selected.includes(id)?'선택됨':'선택하기'):missionProgress(t);
  return '<button type="button" class="community-mission-row'+(checked?' checked':'')+'" '+(disabled?'disabled ':'')+(s.missionEditing?'data-mission-choice="'+id+'"':'data-mission-detail="'+id+'"')+' aria-label="'+esc(name+' · '+status)+'"><span class="mission-checkbox'+(checked?' checked':'')+'" aria-hidden="true"></span><span><strong>'+esc(name)+'</strong><small>'+esc(s.missionEditing?(disabled?status:description):status+(t?' · '+fmt(t.coins)+' 냐냐냥 / XP':''))+'</small></span></button>';
 }).join('');
 if(!tasks.length)rows='<p class="mission-empty">원래 정한 미션 목록에서<br>직접 세 가지를 선택해요.</p>';
 let action=period==='season'?'<span class="mission-footer">'+'전체 개방 · 달성한 보상 자동 지급'+'</span>':s.missionEditing?'<button type="button" class="mission-primary" data-mission-save '+(selected.length!==3?'disabled':'')+'>선택한 3개 저장</button>':'<button type="button" class="mission-primary" data-mission-edit>'+(selected.length?'미션 선택 변경':'미션 3개 고르기')+'</button>';
 if(remote?.bonus)action+='<small class="mission-footer">세 개 모두 완료 +'+fmt(remote.bonus.coins)+' 냐냐냥 / XP'+(remote.bonus.paid?' · 지급 완료':'')+'</small>';
 return '<section class="daily-notebook community-notebook" aria-label="그못방 미션 수첩">'+notebookTabs(s)+missionPeriodTabs(s)+'<div class="community-summary"><span>'+summary+'</span>'+(s.missionEditing?'<button type="button" data-mission-cancel>취소</button>':'')+'</div><div class="community-paper pixel-paper">'+rows+'</div><p class="mission-notice" role="status">'+esc(notice)+'</p>'+action+(pages>1?'<div class="mission-page"><button type="button" data-pg="-1" aria-label="이전 미션">‹</button><span>'+(s.pg+1)+'/'+pages+'</span><button type="button" data-pg="1" aria-label="다음 미션">›</button></div>':'')+'</section>';
}
async function missionSaveChoices(s){
 const period=missionPeriod(s),choices=s.missionDraft||[],remote=missionRemote(period);
 if(period==='season'||choices.length!==3||new Set(choices).size!==3||choices.some(id=>!missionIds.has(id)))return;
 if(missionChoices(period).some(id=>missionPaid(period,id)&&!choices.includes(id)))return say('보상받은 미션은 유지해 주세요.');
 if(remote){
  if(!remote.canSelect)return say('미션 선택 연결을 확인해 주세요.');
  await activityRequest('missions/select',{period,windowId:remote.id,choices});if(activityError)return;
 }else{return say('최신 미션 연결을 먼저 확인해 주세요.');}
 s.missionEditing=false;s.pg=0;render();
}
dailyNotebookView=communityMissionView;SCR.daily.view=communityMissionView;SCR.daily.title='미션 수첩';
let notebookTurning=false;
function turnNotebook(change){
 if(notebookTurning)return;
 const s=scr(),paper=document.querySelector('.daily-notebook');
 if(!paper||matchMedia('(prefers-reduced-motion: reduce)').matches){change();render();return;}
 notebookTurning=true;paper.classList.add('turning');
 setTimeout(()=>{notebookTurning=false;if(scr()!==s)return;change();render();},180);
}
function notebookPageState(s){
 if(s.notebookTab==='history'){const rows=s.recordView==='earnings'?notebookEarningsRows()||[]:notebookHistoryRows();return {page:s.pg||0,count:Math.max(1,Math.ceil(rows.length/3))};}
 return {page:s.pg||0,count:s.missionEditing||missionPeriod(s)==='season'?2:1};
}
dailyNotebookView=SCR.daily.view=s=>{
 const html=communityMissionView(s),p=notebookPageState(s);
 const footer='<nav class="notebook-pagination" aria-label="수첩 페이지"><button type="button" data-notebook-step="-1" aria-label="이전 수첩 페이지" '+(!p.page?'disabled':'')+'>‹</button><span>'+(p.page+1)+' / '+p.count+'</span><button type="button" data-notebook-step="1" aria-label="다음 수첩 페이지" '+(p.page>=p.count-1?'disabled':'')+'>›</button></nav>';
 return html.replace(/<div class="(?:history-pager|mission-page)"[\s\S]*?<\/div>/g,'').replace('</section>',footer+'</section>');
};
document.addEventListener('click',e=>{
 const button=e.target.closest?.('[data-notebook-step]');if(scr().id!=='daily'||!button||button.disabled)return;
 e.preventDefault();e.stopImmediatePropagation();
 turnNotebook(()=>{const s=scr(),p=notebookPageState(s),next=Math.max(0,Math.min(p.count-1,p.page+Number(button.dataset.notebookStep)));
  s.pg=next;
 });
},true);
const recordPages=SCR.daily.pages;
SCR.daily.pages=()=>{const s=scr();return s.notebookTab==='history'?recordPages():s.missionEditing||missionPeriod(s)==='season'?2:1;};
SCR.daily.ok=s=>{if(s.notebookTab==='history')return;if(s.missionEditing)return missionSaveChoices(s);if(missionPeriod(s)!=='season')missionOpenChoices(s);};
document.addEventListener('click',event=>{
 if(scr().id!=='daily')return;
 const el=event.target.closest?.('[data-mission-period],[data-mission-choice],[data-mission-edit],[data-mission-save],[data-mission-cancel],[data-mission-detail]');if(!el)return;
 event.preventDefault();event.stopImmediatePropagation();const s=scr();
 if(el.dataset.missionPeriod){s.missionPeriod=el.dataset.missionPeriod;s.missionEditing=false;s.pg=0;render();}
 else if(el.hasAttribute('data-mission-edit'))missionOpenChoices(s);
 else if(el.hasAttribute('data-mission-cancel')){s.missionEditing=false;s.pg=0;render();}
 else if(el.hasAttribute('data-mission-save'))void missionSaveChoices(s);
 else if(el.dataset.missionChoice){
  const id=el.dataset.missionChoice;if(!s.missionEditing||!missionIds.has(id))return;
  if(missionPaid(missionPeriod(s),id))return say('이미 보상받은 미션이에요.');
  const draft=s.missionDraft||[];if(draft.includes(id))s.missionDraft=draft.filter(x=>x!==id);else if(draft.length<3)s.missionDraft=[...draft,id];else return say('미션은 세 개까지 선택해요.');render();
 }else if(el.dataset.missionDetail){
  const period=missionPeriod(s),id=el.dataset.missionDetail,task=period==='season'?missionRemote(period)?.first:missionTask(period,id);
  const reward=task&&Number.isSafeInteger(task.coins)&&task.coins>=0?' · '+fmt(task.coins)+' 냐냐냥':'';
  say(missionProgress(task)+reward);
 }
},true);
// Physical left/right/OK buttons navigate the same visible controls as touch.
const beforeCommunityInput=input;
input=function(key){
 if(scr().id!=='daily'||!['L','R','OK'].includes(key))return beforeCommunityInput(key);
 const controls=[...document.querySelectorAll('.daily-notebook button:not(:disabled)')];
 if(!controls.length)return;
 let i=controls.indexOf(document.activeElement);
 if(key==='OK'){(i>=0?controls[i]:document.querySelector('.mission-primary')||controls[0]).click();return;}
 i=(i+(key==='R'?1:-1)+controls.length)%controls.length;controls[i].focus();
};


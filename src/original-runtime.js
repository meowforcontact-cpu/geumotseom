// Storage and account support use the original SCR lists, without UI overrides.
let savedFingerprint='',activeDay=day(),resetting=false;
let account=null,accountRevision=null,connectionReady=false;
function persist(){
  if(resetting)return;
  const changedDay=activeDay!==day();
  syncAttendance(state);
  if(activeDay!==day()){state.sent=[];activeDay=day()}
  ensureDaily(state);
  const value=snapshot(state),fingerprint=JSON.stringify(value.state)+value.day;
  try{if(fingerprint!==savedFingerprint){localStorage.setItem(KEY,JSON.stringify(value));savedFingerprint=fingerprint}}catch{}
  if(changedDay&&scr().id==='att')render();
}
function restore(){try{const raw=localStorage.getItem(KEY);if(raw)Object.assign(state,validateSave(JSON.parse(raw),ITEMS))}catch{say('이전 저장을 읽지 못했어요. 진행 파일을 확인해 주세요.')}}
function exportProgress(){
  const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot(state),null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='geumotseom-'+day()+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function importProgress(){
  const file=document.createElement('input');file.type='file';file.accept='.json,application/json';
  file.onchange=async()=>{try{const selected=file.files[0];if(!selected)return;if(selected.size>100000)throw Error('100KB 이하의 진행 파일을 골라 주세요.');const next=validateSave(JSON.parse(await selected.text()),ITEMS);if(!confirm('현재 진행을 선택한 파일로 바꿀까요?'))return;Object.assign(state,next);persist();goHome();say('진행을 불러왔어요.')}catch(error){say(error.message)}};file.click();
}
function renamePet(){const name=prompt('친구 이름을 입력해 주세요.',pet().name);if(!name?.trim())return;pet().name=name.trim().slice(0,20);persist();render()}
function resetProgress(){if(!confirm('이 브라우저의 체험 진행을 지우고 처음부터 시작할까요?'))return;try{localStorage.removeItem(KEY);resetting=true;location.reload()}catch{say('저장소에 접근할 수 없어요.')}}
const originalSettingsList=SCR.set.list;
const originalActivityList=SCR.act.list;
const missionCount=()=>Number(state.att.done)+Number(ensureDaily(state).feed)+Number(state.daily.play);
SCR.act.list=()=>{persist();return [L('일일미션','ilist',()=>push('daily'),missionCount()+'/3'),...originalActivityList()]};
function recordDaily(action){recordDailyAction(state,action);persist()}
SCR.daily={title:'일일미션',right:()=>missionCount()+'/3',list:()=>{
  persist();const daily=ensureDaily(state);
  return [
    L('오늘 출석하기','ipaw',()=>push('att'),state.att.done?'완료':'0/1'),
    L('밥 한 번 주기','ibowl',eggOnly(()=>push('food')),daily.feed?'완료':'0/1'),
    L('함께 한 번 놀기','iball',()=>care('play'),daily.play?'완료':'0/1'),
    L('매일 0시 갱신','ilist',()=>{},'한국시간',1),
    L('달성 기록만 저장돼요','ilist',()=>{},'체험',1),BACK()
  ];
}};
const originalBuyOK=buyOK;
let purchasePending=false;
buyOK=async function(screen){if(purchasePending)return;purchasePending=true;try{return await originalBuyOK(screen)}finally{purchasePending=false}};
SCR.set.list=()=>{const rows=originalSettingsList();rows[3]=L('저장·연결','ilist',()=>push('save'));return rows};
SCR.save={title:'저장·연결',list:()=>[
  L('이 기기에 저장','ilist',()=>{},'체험판',1),
  L('진행 파일 저장','ilist',exportProgress),L('진행 불러오기','ilist',importProgress),
  L('친구 이름 바꾸기','heart',renamePet),L('Discord 연결','ilist',()=>push('account')),
  L('체험 처음부터','ilist',resetProgress),BACK()
]};
SCR.account={title:'Discord 연결',list:()=>!connectionReady?[
  L('계정 연결 준비 중','ilist',()=>{},'',1),L('진행은 이 기기에 저장','ilist',()=>{},'',1),BACK()
]:account?[
  L(account.name,'heart',()=>{},'연결됨',1),L('계정에 진행 저장','ilist',()=>handleAccount('save')),
  L('계정에서 불러오기','ilist',()=>handleAccount('load')),L('로그아웃','ilist',()=>handleAccount('logout')),BACK()
]:[L('Discord로 연결하기','ilist',()=>location.assign('/auth/discord')),BACK()]};
async function accountRequest(route,body){
  const response=await fetch('./api/'+route,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:body===undefined?{}:{'Content-Type':'application/json','X-Pika-CSRF':account?.csrf||''},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(12000)});
  const value=await response.json();if(!response.ok)throw Error(value.error||'계정 연결을 확인해 주세요.');return value;
}
async function checkConnection(){try{const status=await accountRequest('connection');if(!status.configured)return;connectionReady=true;try{account=await accountRequest('account/me')}catch{account=null}if(scr().id==='account')render()}catch{}}
async function handleAccount(action){try{
  if(action==='load'){const result=await accountRequest('account/pet');accountRevision=result.revision;if(!result.save)return say('계정에 저장된 기록이 없어요.');const next=validateSave(result.save,ITEMS);if(!confirm('현재 진행을 계정 기록으로 바꿀까요?'))return;Object.assign(state,next);persist();goHome();say('계정 기록을 불러왔어요.')}
  if(action==='save'){if(accountRevision===null){const result=await accountRequest('account/pet');accountRevision=result.revision;if(result.save&&!confirm('계정의 체험 기록을 현재 진행으로 바꿀까요?'))return}const result=await accountRequest('account/pet',{save:snapshot(state),revision:accountRevision});accountRevision=result.revision;say('계정에 진행을 저장했어요.')}
  if(action==='logout'){await accountRequest('account/logout',{});location.replace('/')}
}catch(error){say(error.message)}}
setInterval(persist,1500);
checkConnection();

// Included only by build-public.mjs; the private/offline build keeps local play.
let publicBooting=true,publicStorageKey=KEY,cloudSaveTimer=null,publicFreshState=null,cloudRetryAt=0;
const accountStatus=document.createElement('button');
accountStatus.className='account-status';accountStatus.type='button';accountStatus.textContent='내 기록 불러오는 중';
accountStatus.onclick=()=>{if(!publicBooting)push('account')};document.body.append(accountStatus);
const accountMask=document.createElement('div');accountMask.className='account-loading';accountMask.textContent='내 섬을 불러오고 있어요…';document.body.append(accountMask);
const cloudSession=createCloudSession({request:accountRequest,readSave:()=>snapshot(state),onStatus:status=>{accountStatus.textContent=status;accountStatus.setAttribute('aria-label','계정 저장 상태: '+status)}});
const localPersist=persist;
persist=function(){
 if(publicBooting)return;localPersist();
 if(account&&cloudSession.dirty()&&!cloudSession.blocked&&!cloudSaveTimer&&Date.now()>=cloudRetryAt){
  cloudSaveTimer=setTimeout(async()=>{cloudSaveTimer=null;if(!await cloudSession.flush())cloudRetryAt=Date.now()+15000},1500);
 }
};
async function initializePublicAccount(){
 publicFreshState=structuredClone(state);
 try{
  account=await accountRequest('account/me');
  if(!/^\d{17,20}$/.test(account.id))throw Error('계정을 확인하지 못했어요.');
  publicStorageKey=KEY+'.discord.'+account.id;
  connectionReady=true;
  const remote=await accountRequest('account/pet');
  // Always load this account's server state first; never adopt another account's browser save.
  if(remote.save)Object.assign(state,validateSave(remote.save,ITEMS));
  else{
   accountMask.replaceChildren();
   const heading=document.createElement('p');heading.textContent='함께 살 첫 펫을 골라 주세요. 한 마리는 무료예요.';accountMask.append(heading);
   const kind=await new Promise(resolve=>{for(const [kind,label] of [['cat','고양이'],['dog','강아지']]){const button=document.createElement('button');button.textContent=label;button.onclick=()=>{for(const b of accountMask.querySelectorAll('button'))b.disabled=true;resolve(kind);};accountMask.append(button);}});
   const starter=await accountRequest('account/starter',{kind});
   Object.assign(state,validateSave(starter.save,ITEMS));remote.save=starter.save;remote.revision=starter.revision;
  }
  cloudSession.adopt(remote);accountRevision=remote.revision;
  publicBooting=false;accountMask.remove();persist();
 }catch(error){
  accountMask.replaceChildren();
  const message=document.createElement('p');message.textContent='기록을 불러오지 못했어요. 저장된 진행은 그대로예요.';
  const retry=document.createElement('button');retry.textContent='다시 불러오기';retry.onclick=()=>location.reload();
  const login=document.createElement('a');login.textContent='Discord로 다시 로그인';login.href='/auth/discord';
  accountMask.append(message,retry,login);accountStatus.textContent='연결 확인 필요';
  throw error;
 }
}
SCR.account={title:'내 계정',list:()=>[
 L(account?.name||'Discord 계정','iid',()=>{},'로그인됨',1),
 L('자동 저장: '+cloudSession.status,'ilist',()=>{},'',1),
 L('그못방 활동 기록','ilist',()=>push('daily',{notebookTab:'history'}),activityData?.trackingEnabled?(activityData.linkOnline?'연동됨':'연결 확인'): '연결 확인'),
 ...(activityData?.balances?[L('보유 냐냐냥','icoin',()=>{},fmt(activityData.balances.coins),1),L('XP','star',()=>{},fmt(activityData.balances.xp)+' XP',1)]:[]),
 L('로그아웃','ilist',async()=>{
  await cloudSession.flush();if(cloudSession.dirty()&&!confirm('아직 계정에 저장되지 않은 변경이 있어요. 진행 파일을 먼저 저장할 수 있어요. 그래도 로그아웃할까요?'))return;
  try{await accountRequest('account/logout',{});location.replace('/')}catch{say('로그아웃하지 못했어요. 다시 시도해 주세요.')}
 }),BACK()
]};
SCR.save.title='계정 설정';
SCR.save.list=()=>[L('내 계정 · 자동 저장','iid',()=>push('account')),L('내 펫 이름 바꾸기','heart',renamePet),BACK()];
setInterval(()=>{if(!publicBooting&&account&&!cloudSession.blocked)cloudSession.flush()},15000);
addEventListener('online',()=>{if(!publicBooting)cloudSession.flush()});
addEventListener('beforeunload',event=>{if(!publicBooting&&cloudSession.dirty()){event.preventDefault();event.returnValue=''}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!publicBooting)cloudSession.flush()});


const accountSettingsList=SCR.set.list;
SCR.set.list=(...args)=>accountSettingsList(...args).filter(row=>row.l!=='내 XP').map(row=>row.l==='저장·연결'?{...row,l:'계정 설정'}:row);

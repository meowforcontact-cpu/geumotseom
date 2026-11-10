// The server validates successful care before sending a receipt to the bot.
let publicCareBusy=false;
const beforePublicCare=care;
care=async function(kind,hunger,mood){
 if(!['eat','play'].includes(kind)||stage()==='egg')return beforePublicCare(kind,hunger,mood);
 if(publicCareBusy||publicBooting)return;
 publicCareBusy=true;
 try{
  if(cloudSession.dirty())await cloudSession.flush();
  if(cloudSession.dirty())throw Error('저장 연결을 확인한 뒤 다시 돌봐 주세요.');
  const action=kind==='eat'?'feed':'play',id='c_'+crypto.randomUUID().replaceAll('-','');
  const result=await accountRequest('account/game-care',{action,id});
  if(!Number.isInteger(result.hunger))throw Error('돌보기 결과를 다시 확인해 주세요.');
  state.hun=result.hunger+(kind==='eat'?-1:1);beforePublicCare(kind,hunger,mood);state.hun=result.hunger;
  persist();void activityRequest();
 }catch(error){say(error.message||'돌보기 연결을 확인해 주세요.');}
 finally{publicCareBusy=false;}
};

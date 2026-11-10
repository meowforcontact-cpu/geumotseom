// Serializes account saves. A conflict stops writes until the user reloads remote data.
export function createCloudSession({request,readSave,onStatus=()=>{}}){
 let revision=null,busy=false,blocked=false,last='',status='불러오는 중';
 const fingerprint=save=>JSON.stringify({day:save.day,state:save.state});
 const report=value=>{status=value;onStatus(value)};
 return {
  get revision(){return revision},get blocked(){return blocked},get status(){return status},
  adopt(result){revision=result.revision;last=result.save?fingerprint(result.save):'';blocked=false;report('저장됨')},
  dirty(){return revision!==null&&fingerprint(readSave())!==last},
  async flush(){
   if(busy||blocked||revision===null)return false;
   const save=readSave(),fp=fingerprint(save);if(fp===last)return true;
   busy=true;report('저장 중');
   try{const result=await request('account/pet',{revision,save});revision=result.revision;last=fp;report('저장됨');return true}
   catch(error){if(error.status===409){blocked=true;report('다른 기기 기록 확인 필요')}else if(error.status===401){blocked=true;report('다시 로그인 필요')}else report('연결되면 다시 저장');return false}
   finally{busy=false}
  }
 };
}

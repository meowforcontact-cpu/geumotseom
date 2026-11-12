// Optional Cloudflare deployment. NOT enabled by the static Sites playtest.
// No bot token is used. Discord access tokens are not persisted or sent to the client.
const KEY = 'pika.pet.playtest.v1';
const day = (time = Date.now()) => new Date(time + 9 * 3600000).toISOString().slice(0, 10);
const integer = (v, min, max) => Number.isSafeInteger(v) && v >= min && v <= max;
const previousDay = date => day(Date.parse(date+'T00:00:00+09:00')-86400000);
const validDay = date => typeof date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0,10)===date;
function migrateAttendance(att,savedDay){
  const legacy=att.total===undefined;
  const dates=[...(att.dates||[])];
  const known=att.lastDate||(att.done?savedDay:null);
  if(att.dates===undefined&&known&&!dates.includes(known))dates.push(known);
  dates.sort();
  let run=0,best=att.bestStreak||0,previous=null;
  for(const date of dates){run=previous&&previousDay(date)===previous?run+1:1;best=Math.max(best,run);previous=date;}
  best=Math.max(best,att.streak);
  return {dates,streak:att.streak,...(best?{bestStreak:best}:{}),done:att.done,total:legacy?Math.max(att.streak,Number(att.done)):att.total,
    totalEstimated:legacy?att.streak>0||att.done:att.totalEstimated===true,
    lastDate:att.lastDate??(att.done?savedDay:att.streak>0?previousDay(savedDay):null)};
}
function syncAttendance(state,now=Date.now()){
  const today=day(now),yesterday=day(now-86400000);
  state.att=migrateAttendance(state.att,today);
  state.att.done=state.att.lastDate===today;
  if(!state.att.done&&state.att.lastDate!==yesterday)state.att.streak=0;
  return state.att;
}
function claimAttendance(state,now=Date.now()){
  const att=syncAttendance(state,now);
  if(att.done)return false;
  att.streak++;att.total++;att.done=true;att.lastDate=day(now);
  att.bestStreak=Math.max(att.bestStreak||0,att.streak);
  if(!att.dates.includes(att.lastDate))att.dates.push(att.lastDate);
  att.dates.sort();
  return true;
}
// Both device orientations share world coordinates. All furniture themes remain freely mixable.
const LAYOUT_V1={
 cream_f1:[-18,48],cream_f8:[20,57],cream_f3:[41,45],cream_f4:[70,45],
 cream_tea_table:[91,58],cream_f9:[127,58],
 cream_flower_table:[-16,96],cream_f6:[23,99],cream_f7:[90,91],cream_f10:[119,116]
};
const LAYOUT_V2={
 cream_f1:[12,36],cream_f8:[43,64],cream_f3:[54,40],cream_f4:[80,42],
 cream_tea_table:[95,57],cream_f9:[109,36],
 cream_flower_table:[12,92],cream_f6:[44,93],cream_f7:[79,90],cream_f10:[110,114]
};
const LAYOUT_V3={
 cream_f1:[10,38],cream_f8:[42,57],cream_f3:[55,38],cream_f4:[81,40],
 cream_tea_table:[91,64],cream_f9:[108,38],
 cream_flower_table:[8,95],cream_f6:[41,100],cream_f7:[89,96],cream_f10:[109,114]
};
const LAYOUT_V4={
 cream_f1:[11,35],cream_f8:[17,79],cream_f3:[54,37],cream_f4:[80,40],
 cream_tea_table:[93,67],cream_f9:[105,38],
 cream_flower_table:[10,94],cream_f6:[42,100],cream_f7:[85,94],cream_f10:[109,114]
};
const DEFAULT_FURNITURE_LAYOUT={
 cream_f1:[9,29],cream_f8:[43,32],cream_f3:[65,28],cream_f4:[97,28],
 cream_tea_table:[130,60],cream_f9:[140,29],
 cream_flower_table:[14,94],cream_f6:[52,99],cream_f7:[112,94],cream_f10:[87,111]
};
const SHOWROOM_FURNITURE_V3=['cream_f1','cream_f8','cream_f3','cream_f4','cream_tea_table','cream_f9','cream_flower_table','cream_f7'];
// Visual demo only. All furniture stays owned and every theme remains mixable.
const SHOWROOM_FURNITURE_V4=['cream_f1','cream_f3','cream_f4','cream_f9','cream_tea_table','cream_flower_table','cream_f7'];
const SHOWROOM_FURNITURE=Object.keys(DEFAULT_FURNITURE_LAYOUT);
function ensureFurnitureLayout(state,items){
 if(!items.some(i=>i.id==='cream_tea_table'))return false;
 if(state.furnitureLayoutVersion===6)return false;
 // Start the new room arrangement with everything in the bag. Existing
 // ownership, saved positions and purchase history remain recoverable.
 for(const [id,pos] of Object.entries(DEFAULT_FURNITURE_LAYOUT)){
  if(!state.furnitureLayoutVersion&&!state.owned.includes(id))state.owned.push(id);
  if(!state.pos[id])state.pos[id]=[...pos];
 }
 state.eq.가구=[];
 state.furnitureLayoutVersion=6;
 return true;
}
function validateSave(value, items) {
  if (!value || value.version !== 1 || !value.state) throw Error('그못섬 체험판 진행 파일을 골라 주세요.');
  const s = value.state, ids = new Set(items.map(i => i.id));
  if (!integer(s.coins, 0, 100000000) || !integer(s.earned, 0, 100000000) || !integer(s.xp, 0, 100000000)) throw Error('저장된 금액을 읽을 수 없어요.');
  if (!Array.isArray(s.owned) || s.owned.length > items.length || new Set(s.owned).size !== s.owned.length || s.owned.some(id => !ids.has(id))) throw Error('보유 목록을 읽을 수 없어요.');
  if (!s.eq || !Array.isArray(s.eq['가구']) || new Set(s.eq['가구']).size !== s.eq['가구'].length) throw Error('방 설정을 읽을 수 없어요.');
  for (const category of ['벽','바닥','칭호','배지','가구']) {
    const selection = category === '가구' ? s.eq[category] : s.eq[category] == null ? [] : [s.eq[category]];
    if (selection.length > items.length || selection.some(id => !s.owned.includes(id) || items.find(i => i.id === id)?.cat !== category)) throw Error('보유하지 않은 물건은 적용할 수 없어요.');
  }
  const petProducts={white:null,angel:'p1',dog:'p2',cat:'p3',raccoon:'p4'};
  if (!Array.isArray(s.pets) || !s.pets.length || s.pets.length > Object.keys(petProducts).length || !integer(s.rep,0,s.pets.length - 1) || new Set(s.pets.map(p=>p.kind)).size !== s.pets.length) throw Error('펫 기록을 읽을 수 없어요.');
  for (const p of s.pets) if (!Object.hasOwn(petProducts,p.kind) || typeof p.name !== 'string' || p.name.length > 20 || typeof p.hatched !== 'boolean' || !integer(p.taps,0,3) || (petProducts[p.kind] && !s.owned.includes(petProducts[p.kind]))) throw Error('펫 정보를 읽을 수 없어요.');
  if (!integer(s.hun,0,3) || !integer(s.mood,0,3) || !Array.isArray(s.poop) || s.poop.length > 2 || s.poop.some(n => !integer(n,0,128))) throw Error('돌봄 상태를 읽을 수 없어요.');
  if (!s.att || typeof s.att.done !== 'boolean' || !integer(s.att.streak,0,100000)) throw Error('출석 기록을 읽을 수 없어요.');
  if(s.att.bestStreak!==undefined&&!integer(s.att.bestStreak,0,100000))throw Error('최장 연속 출석 기록을 읽을 수 없어요.');
  if(s.firstPurchase!==undefined&&typeof s.firstPurchase!=='boolean')throw Error('구매 업적 기록을 읽을 수 없어요.');
  if(!validDay(value.day))throw Error('저장 날짜를 읽을 수 없어요.');
  if(s.att.total!==undefined&&(!integer(s.att.total,Math.max(s.att.streak,Number(s.att.done)),1000000)||typeof s.att.totalEstimated!=='boolean'||(s.att.lastDate!==null&&(!validDay(s.att.lastDate)||s.att.lastDate>value.day))))throw Error('누적 출석 기록을 읽을 수 없어요.');
  if(s.att.dates!==undefined&&(!Array.isArray(s.att.dates)||s.att.dates.length>100000||new Set(s.att.dates).size!==s.att.dates.length||s.att.dates.some(d=>!validDay(d)||d>value.day||!s.att.lastDate||d>s.att.lastDate)||s.att.dates.length>(s.att.total??Math.max(s.att.streak,Number(s.att.done)))))throw Error('날짜별 출석 기록을 읽을 수 없어요.');
  if (!Array.isArray(s.sent) || s.sent.length > 3 || s.sent.some(x=>!Array.isArray(x)||x.length!==2||x.some(t=>typeof t!=='string'||t.length>200))) throw Error('카드 기록을 읽을 수 없어요.');
  if (!Array.isArray(s.log) || s.log.length > 100 || s.log.some(x=>!Array.isArray(x)||x.length!==3||x.some(t=>typeof t!=='string'||t.length>200))) throw Error('활동 기록을 읽을 수 없어요.');
  const pos={}; for (const id of ['m1','m2','m3',...items.filter(i=>i.cat==='가구'&&i.size).map(i=>i.id)]) { const product=items.find(i=>i.id===id);const xy=s.pos?.[id]??(product?.size?[32,106-product.size[1]]:undefined); if (!Array.isArray(xy)||xy.length!==2||xy.some(n=>!Number.isFinite(n)||n < -128||n>256)) throw Error('가구 배치를 읽을 수 없어요.');pos[id]=[...xy]; }
  const result={coins:s.coins,earned:s.earned,xp:s.xp,owned:[...s.owned],eq:{벽:s.eq.벽??null,바닥:s.eq.바닥??null,칭호:s.eq.칭호??null,배지:s.eq.배지??null,가구:[...s.eq.가구]},pets:s.pets.map(p=>({name:p.name,kind:p.kind,hatched:p.hatched,taps:p.taps})),rep:s.rep,hun:s.hun,mood:s.mood,poop:[...s.poop],att:{streak:s.att.streak,done:s.att.done},sent:s.sent.map(x=>[...x]),log:s.log.map(x=>[...x]),pos,cleaned:integer(s.cleaned,0,1000000)?s.cleaned:0};
  result.att=migrateAttendance(s.att,value.day);
  syncAttendance(result);
  if(s.firstPurchase===true||s.log.some(row=>row[0].endsWith(' 구매')&&/^-\d/.test(row[1])))result.firstPurchase=true;
  if(value.day!==day())result.sent=[];
  if(s.daily!==undefined){
    if(!s.daily||typeof s.daily.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s.daily.day)||typeof s.daily.feed!=='boolean'||typeof s.daily.play!=='boolean')throw Error('일일미션 기록을 읽을 수 없어요.');
    result.daily=s.daily.day===day()&&value.day===day()?{day:s.daily.day,feed:s.daily.feed,play:s.daily.play}:{day:day(),feed:false,play:false};
  }
  if(s.roomLook!==undefined){
    if(!s.roomLook||!['cream','pink','whitewood','attic'].includes(s.roomLook.wall)||!['cream','pink','whitewood','attic'].includes(s.roomLook.floor))throw Error('방 배경을 읽을 수 없어요.');
    result.roomLook={wall:s.roomLook.wall,floor:s.roomLook.floor};
  }
  if(s.missionPlans!==undefined){
    const allowed=new Set(['chat','voice','attendance','stream','party','partners','mixed']);
    if(!s.missionPlans||typeof s.missionPlans!=='object'||Array.isArray(s.missionPlans)||Object.keys(s.missionPlans).some(k=>!['daily','weekly'].includes(k)))throw Error('선택한 미션을 읽을 수 없어요.');
    result.missionPlans={};
    for(const [period,plan] of Object.entries(s.missionPlans)){
      if(!plan||!validDay(plan.period)||plan.period>value.day||!Array.isArray(plan.choices)||plan.choices.length>3||new Set(plan.choices).size!==3||plan.choices.some(id=>!allowed.has(id)))throw Error('선택한 미션을 읽을 수 없어요.');
      result.missionPlans[period]={period:plan.period,choices:[...plan.choices]};
    }
  }
  if(s.furnitureLayoutVersion!==undefined){
    if(![1,2,3,4,5,6].includes(s.furnitureLayoutVersion))throw Error('가구 배치를 읽을 수 없어요.');
    result.furnitureLayoutVersion=s.furnitureLayoutVersion;
  }
  ensureFurnitureLayout(result,items);
  return result;
}
// One free starter per save. Do not reset legacy pets, wallets or furniture.
function needsStarterPet(state){
 return !['cat','dog'].some(kind=>state.pets?.some(p=>p.kind===kind))
   && !['p2','p3'].some(id=>state.owned?.includes(id));
}
function claimStarterPet(state,kind,{preserveLegacy=true}={}){
 if(!['cat','dog'].includes(kind))throw Error('고양이 또는 강아지를 선택해 주세요.');
 if(!needsStarterPet(state))throw Error('첫 펫은 이미 선택했어요.');
 const id=kind==='cat'?'p3':'p2';
 const pet={name:kind==='cat'?'고양이':'강아지',kind,hatched:false,taps:0};
 if(!preserveLegacy&&state.pets.length===1&&state.pets[0].kind==='white'
    &&!state.pets[0].hatched&&state.pets[0].taps===0){
   state.pets=[pet];state.rep=0;
 }else{
   state.pets.push(pet);state.rep=state.pets.length-1;
 }
 state.owned.push(id);
 return pet;
}
function ensureDaily(state,today=day()){
  if(!state.daily||state.daily.day!==today)state.daily={day:today,feed:false,play:false};
  return state.daily;
}
function recordDailyAction(state,action,today=day()){
  const daily=ensureDaily(state,today);
  if(action!=='feed'&&action!=='play')return false;
  const changed=!daily[action];daily[action]=true;return changed;
}
function snapshot(state) {return {version:1,day:day(),savedAt:new Date().toISOString(),state:{...state,log:state.log.slice(0,100)}};}
function purchase(state, product) {
  if (!product || product.retired) throw Error('판매하지 않는 상품이에요.');
  if (product.only) throw Error('별도 획득 조건이 있어 구매할 수 없는 상품이에요.');
  if (product.catalogOnly) throw Error('실제 역할 연동 전에는 구매할 수 없는 상품이에요.');
  if (state.owned.includes(product.id)) throw Error('이미 가지고 있어요.');
  if (!integer(product.price,0,100000000) || state.coins < product.price) throw Error('냐냐냥이 부족해요.');
  return {coins:state.coins-product.price,owned:[...state.owned,product.id]};
}


const enc=new TextEncoder();
const b64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const random=()=>b64(crypto.getRandomValues(new Uint8Array(32)));
const hash=async value=>b64(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value))));
const cookie=(name,value,age)=>`${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
const cookies=req=>Object.fromEntries((req.headers.get('cookie')||'').split(';').map(x=>x.trim().split('=')).filter(x=>x.length===2));
const secretHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
function json(value,status=200,headers={}){return Response.json(value,{status,headers:{...secretHeaders,...headers}})}
function redirect(url,values=[]){const h=new Headers({...secretHeaders,Location:url});for(const v of values)h.append('Set-Cookie',v);return new Response(null,{status:303,headers:h})}
const fail=(status,message)=>Object.assign(Error(message),{status});
export function configured(env){try{return !!env.PET_DB&&/^\d{17,20}$/.test(env.DISCORD_CLIENT_ID)&&!!env.DISCORD_CLIENT_SECRET&&new URL(env.PUBLIC_ORIGIN).protocol==='https:'&&new URL(env.PUBLIC_ORIGIN).origin===env.PUBLIC_ORIGIN}catch{return false}}
function sameOrigin(req,env){if(req.headers.get('origin')!==env.PUBLIC_ORIGIN||req.headers.get('sec-fetch-site')==='cross-site')throw fail(403,'사이트에서 다시 시도해 주세요.');}
async function body(req){if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')||''))throw fail(415,'JSON 요청이 필요해요.');if(Number(req.headers.get('content-length')||0)>50000)throw fail(413,'저장 파일이 너무 커요.');const reader=req.body?.getReader();if(!reader)throw fail(400,'내용이 없어요.');let chunks=[],size=0;for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>50000){await reader.cancel();throw fail(413,'저장 파일이 너무 커요.')}chunks.push(value)}const out=new Uint8Array(size);let offset=0;for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.length}try{return JSON.parse(new TextDecoder().decode(out))}catch{throw fail(400,'저장 파일을 읽을 수 없어요.')}}
async function session(req,env,now){const raw=cookies(req)['__Host-pika_session'];if(!/^[\w-]{43}$/.test(raw||''))throw fail(401,'Discord로 로그인해 주세요.');const row=await env.PET_DB.prepare('SELECT s.hash,s.user_id,s.csrf,p.display_name FROM pet_sessions s JOIN pet_profiles p ON p.user_id=s.user_id WHERE s.hash=? AND s.expires>?').bind(await hash(raw),now).first();if(!row)throw fail(401,'로그인이 만료됐어요.');return row;}
export function createWorker({fetcher=fetch,clock=Date.now,products=[]}={}){
 async function discord(path,options){let res;try{res=await fetcher('https://discord.com/api/v10'+path,{...options,signal:AbortSignal.timeout(10000),redirect:'error'})}catch{throw fail(502,'Discord 연결이 지연되고 있어요. 잠시 후 다시 시도해 주세요.')}if(!res.ok)throw fail(502,'Discord 인증을 완료하지 못했어요. 다시 로그인해 주세요.');return res.status===204?null:res.json();}
 return {async fetch(req,env){const url=new URL(req.url),route=url.pathname,now=clock();try{
  if(route==='/api/connection'&&req.method==='GET')return json({configured:configured(env),mode:'playtest',productionEconomy:false});
  if(route.startsWith('/auth/')||route.startsWith('/api/account')){
   if(!configured(env))throw fail(503,'Discord 연결 설정을 준비 중이에요. 로그인 없이 체험할 수 있어요.');
   if(url.origin!==env.PUBLIC_ORIGIN)throw fail(400,'정식 사이트 주소에서 열어 주세요.');
  }
  if(route==='/auth/discord'&&req.method==='GET'){
   const rateKey=await hash((req.headers.get('cf-connecting-ip')||'unknown')+':'+Math.floor(now/60000));
   const rate=await env.PET_DB.prepare('INSERT INTO pet_login_rates(hash,count,expires) VALUES(?,1,?) ON CONFLICT(hash) DO UPDATE SET count=count+1 RETURNING count').bind(rateKey,now+120000).first();if(rate.count>10)throw fail(429,'로그인 시도가 많아요. 1분 뒤 다시 시도해 주세요.');
   const state=random();await env.PET_DB.prepare('INSERT INTO pet_oauth_states(hash,expires) VALUES(?,?)').bind(await hash(state),now+300000).run();
   const auth=new URL('https://discord.com/oauth2/authorize');auth.search=new URLSearchParams({client_id:env.DISCORD_CLIENT_ID,redirect_uri:env.PUBLIC_ORIGIN+'/auth/discord/callback',response_type:'code',scope:'identify',state,prompt:'consent'}).toString();return redirect(auth.toString(),[cookie('__Host-pika_oauth',state,300)]);
  }
  if(route==='/auth/discord/callback'&&req.method==='GET'){
   const state=url.searchParams.get('state'),given=cookies(req)['__Host-pika_oauth'];if(!/^[\w-]{43}$/.test(state||'')||state!==given)throw fail(400,'로그인 확인이 만료됐어요. 다시 시작해 주세요.');
   const consumed=await env.PET_DB.prepare('DELETE FROM pet_oauth_states WHERE hash=? AND expires>? RETURNING hash').bind(await hash(state),now).first();if(!consumed)throw fail(400,'이미 사용했거나 만료된 로그인이에요.');
   if(url.searchParams.has('error'))return redirect(env.PUBLIC_ORIGIN+'/?login=cancelled',[cookie('__Host-pika_oauth','',0)]);
   const code=url.searchParams.get('code');if(!code||code.length>1000)throw fail(400,'Discord 인증을 다시 시작해 주세요.');
   const token=await discord('/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.DISCORD_CLIENT_ID,client_secret:env.DISCORD_CLIENT_SECRET,grant_type:'authorization_code',code,redirect_uri:env.PUBLIC_ORIGIN+'/auth/discord/callback'})});
   if(!token.access_token||!String(token.scope||'').split(' ').includes('identify'))throw fail(502,'프로필 조회 권한이 필요해요.');
   let user;try{user=await discord('/users/@me',{headers:{Authorization:'Bearer '+token.access_token}})}finally{try{await discord('/oauth2/token/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.DISCORD_CLIENT_ID,client_secret:env.DISCORD_CLIENT_SECRET,token:token.access_token,token_type_hint:'access_token'})})}catch{/* Never persist Discord tokens even if revocation is temporarily unavailable. */}}
   if(!/^\d{17,20}$/.test(user.id))throw fail(502,'Discord 프로필을 확인하지 못했어요.');
   const name=String(user.global_name||user.username||'섬 친구').slice(0,80);const raw=random(),csrf=random();
   await env.PET_DB.batch([env.PET_DB.prepare('INSERT INTO pet_profiles(user_id,display_name,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name').bind(user.id,name,now),env.PET_DB.prepare('INSERT INTO pet_sessions(hash,user_id,csrf,expires) VALUES(?,?,?,?)').bind(await hash(raw),user.id,csrf,now+7*86400000),env.PET_DB.prepare('DELETE FROM pet_oauth_states WHERE expires<?').bind(now),env.PET_DB.prepare('DELETE FROM pet_sessions WHERE expires<?').bind(now),env.PET_DB.prepare('DELETE FROM pet_login_rates WHERE expires<?').bind(now)]);
   return redirect(env.PUBLIC_ORIGIN+'/?login=connected',[cookie('__Host-pika_session',raw,7*86400),cookie('__Host-pika_oauth','',0)]);
  }
  if(route==='/api/account/me'&&req.method==='GET'){const s=await session(req,env,now);return json({name:s.display_name,csrf:s.csrf,mode:'playtest',productionEconomy:false});}
  if(route==='/api/account/pet'&&['GET','POST'].includes(req.method)){
   const s=await session(req,env,now);
   if(req.method==='GET'){const row=await env.PET_DB.prepare('SELECT pet_json,revision FROM pet_profiles WHERE user_id=?').bind(s.user_id).first();return json({save:row.pet_json?JSON.parse(row.pet_json):null,revision:row.revision});}
   sameOrigin(req,env);if(req.headers.get('x-pika-csrf')!==s.csrf)throw fail(403,'로그인을 다시 확인해 주세요.');
   const value=await body(req);if(!Number.isSafeInteger(value.revision)||value.revision<0)throw fail(400,'저장 버전을 확인해 주세요.');let safe;try{safe=snapshot(validateSave(value.save,products))}catch{throw fail(400,'체험 저장 파일을 확인해 주세요.');}
   const result=await env.PET_DB.prepare('UPDATE pet_profiles SET pet_json=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=? RETURNING revision').bind(JSON.stringify(safe),now,s.user_id,value.revision).first();if(!result)throw fail(409,'다른 기기에서 먼저 저장했어요. 계정 기록을 불러온 뒤 다시 저장해 주세요.');return json({revision:result.revision});
  }
  if(route==='/api/account/logout'&&req.method==='POST'){sameOrigin(req,env);const s=await session(req,env,now);if(req.headers.get('x-pika-csrf')!==s.csrf)throw fail(403,'로그인을 다시 확인해 주세요.');await env.PET_DB.prepare('DELETE FROM pet_sessions WHERE hash=?').bind(s.hash).run();return json({ok:true},200,{'Set-Cookie':cookie('__Host-pika_session','',0)});}
  if(route.startsWith('/api/')||route.startsWith('/auth/'))return json({error:'없는 경로예요.'},404);
  return env.ASSETS?env.ASSETS.fetch(req):new Response('Not found',{status:404});
 }catch(error){return json({error:error.status?error.message:'일시적으로 연결할 수 없어요. 잠시 후 다시 시도해 주세요.'},error.status||503);}}};
}
// Product definitions are replaced by build-worker.mjs from the approved demo catalog.
export default createWorker({products:[{"id":"w1","cat":"벽","name":"하늘 줄무늬","price":150,"spr":"wall1"},{"id":"w2","cat":"벽","name":"별빛 벽","price":300,"spr":"wall2"},{"id":"f1","cat":"바닥","name":"체크 바닥","price":120,"spr":"floor1"},{"id":"f2","cat":"바닥","name":"나무 바닥","price":200,"spr":"floor2"},{"id":"m1","cat":"가구","name":"작은 화분","price":80,"spr":"plant","retired":true},{"id":"m2","cat":"가구","name":"노란 조명","price":180,"spr":"lamp","retired":true},{"id":"m3","cat":"가구","name":"분홍 침대","price":450,"spr":"bed","retired":true},{"id":"t1","cat":"칭호","name":"왕관 고양이","price":900,"spr":"crown","season":1,"retired":true},{"id":"t2","cat":"칭호","name":"냐냐냥 멤버","price":0,"spr":"star","only":"멤버십 전용"},{"id":"t3","cat":"칭호","name":"서버 부스터","price":0,"spr":"heart","only":"부스터 전용"},{"id":"b1","cat":"배지","name":"별 배지","price":250,"spr":"star"},{"id":"b2","cat":"배지","name":"하트 배지","price":250,"spr":"heart"},{"id":"b3","cat":"배지","name":"달 배지","price":300,"spr":"moon"},{"id":"b4","cat":"배지","name":"구름 배지","price":300,"spr":"cloud"},{"id":"p1","cat":"펫","name":"천사냥 알","price":0,"spr":"iegg","pet":"angel","pname":"천사냥","only":"일일 미션 3개 완수 누적 15일 보상"},{"id":"p2","cat":"펫","name":"강아지","price":0,"spr":"iegg","pet":"dog","pname":"강아지","only":"신규 첫 선택 무료"},{"id":"p3","cat":"펫","name":"고양이","price":0,"spr":"iegg","pet":"cat","pname":"고양이","only":"신규 첫 선택 무료"},{"id":"p4","cat":"펫","name":"너구리","price":0,"spr":"iegg","pet":"raccoon","pname":"너구리","only":"가격·획득 경로 미확정"},{"id":"pink_f1","cat":"가구","name":"로즈 침대","price":450,"spr":"pink_f1","theme":"pink","crop":[40,25,265,425],"size":[48,70]},{"id":"pink_f2","cat":"가구","name":"로즈 커튼창","price":180,"spr":"pink_f2","theme":"pink","crop":[305,85,310,265],"size":[44,36]},{"id":"pink_f3","cat":"가구","name":"로즈 화장대","price":300,"spr":"pink_f3","theme":"pink","crop":[615,45,235,355],"size":[36,54]},{"id":"pink_f4","cat":"가구","name":"로즈 괘종시계","price":250,"spr":"pink_f4","theme":"pink","crop":[855,25,140,375],"size":[22,62]},{"id":"pink_f5","cat":"가구","name":"로즈 티테이블","price":220,"spr":"pink_f5","theme":"pink","crop":[1000,160,280,240],"size":[46,38]},{"id":"pink_f6","cat":"가구","name":"로즈 의자","price":120,"spr":"pink_f6","theme":"pink","crop":[1285,165,125,240],"size":[22,40]},{"id":"pink_f7","cat":"가구","name":"로즈 소파","price":350,"spr":"pink_f7","theme":"pink","crop":[15,460,365,230],"size":[58,36]},{"id":"pink_f8","cat":"가구","name":"로즈 장미조명","price":180,"spr":"pink_f8","theme":"pink","crop":[380,420,135,270],"size":[24,48]},{"id":"pink_f9","cat":"가구","name":"로즈 장미꽃병","price":100,"spr":"pink_f9","theme":"pink","crop":[515,450,175,240],"size":[28,40]},{"id":"pink_f10","cat":"가구","name":"로즈 장미화분","price":80,"spr":"pink_f10","theme":"pink","crop":[690,505,108,185],"size":[20,32]},{"id":"pink_f11","cat":"가구","name":"로즈 하트러그","price":120,"spr":"pink_f11","theme":"pink","crop":[803,580,130,105],"size":[36,24]},{"id":"pink_f12","cat":"가구","name":"로즈 일기장","price":80,"spr":"pink_f12","theme":"pink","crop":[938,572,100,110],"size":[20,22]},{"id":"pink_f13","cat":"가구","name":"로즈 펼친책","price":80,"spr":"pink_f13","theme":"pink","crop":[1045,580,130,100],"size":[28,20]},{"id":"pink_f14","cat":"가구","name":"로즈 찻잔","price":80,"spr":"pink_f14","theme":"pink","crop":[1180,570,130,110],"size":[24,22]},{"id":"pink_f15","cat":"가구","name":"로즈 딸기케이크","price":100,"spr":"pink_f15","theme":"pink","crop":[1310,558,120,120],"size":[24,24]},{"id":"cream_f1","cat":"가구","name":"크림 침대","price":450,"spr":"cream_f1","theme":"cream","crop":[35,30,275,440],"size":[32,53]},{"id":"cream_f2","cat":"가구","name":"크림 커튼창","price":180,"spr":"cream_f2","theme":"cream","crop":[315,85,300,265],"size":[44,36]},{"id":"cream_f3","cat":"가구","name":"크림 화장대","price":300,"spr":"cream_f3","theme":"cream","crop":[620,60,230,340],"size":[28,42]},{"id":"cream_f4","cat":"가구","name":"크림 괘종시계","price":250,"spr":"cream_f4","theme":"cream","crop":[855,25,150,370],"size":[16,42]},{"id":"cream_f5","cat":"가구","name":"크림 원형테이블","price":220,"spr":"cream_f5","theme":"cream","crop":[1010,165,280,240],"size":[46,38]},{"id":"cream_f6","cat":"가구","name":"크림 의자","price":120,"spr":"cream_f6","theme":"cream","crop":[1288,178,126,225],"size":[14,27]},{"id":"cream_f7","cat":"가구","name":"크림 소파","price":350,"spr":"cream_f7","theme":"cream","crop":[15,490,405,255],"size":[48,30]},{"id":"cream_f8","cat":"가구","name":"크림 스탠드","price":180,"spr":"cream_f8","theme":"cream","crop":[425,458,135,280],"size":[14,30]},{"id":"cream_f9","cat":"가구","name":"크림 초록화분","price":80,"spr":"cream_f9","theme":"cream","crop":[560,490,160,250],"size":[20,29]},{"id":"cream_f10","cat":"가구","name":"크림 원형쿠션","price":100,"spr":"cream_f10","theme":"cream","crop":[720,620,150,120],"size":[17,12]},{"id":"cream_f11","cat":"가구","name":"크림 책","price":80,"spr":"cream_f11","theme":"cream","crop":[878,620,120,110],"size":[20,22]},{"id":"cream_f12","cat":"가구","name":"크림 펼친책","price":80,"spr":"cream_f12","theme":"cream","crop":[1005,625,130,100],"size":[28,20]},{"id":"cream_f13","cat":"가구","name":"크림 찻잔","price":80,"spr":"cream_f13","theme":"cream","crop":[1145,620,135,105],"size":[24,22]},{"id":"cream_f14","cat":"가구","name":"크림 수국화분","price":100,"spr":"cream_f14","theme":"cream","crop":[1278,520,152,200],"size":[26,36]},{"id":"cream_tea_table","cat":"가구","name":"크림 찻잔 테이블","price":300,"spr":"cream_tea_table","theme":"cream","size":[34,29]},{"id":"cream_flower_table","cat":"가구","name":"크림 수국 테이블","price":300,"spr":"cream_flower_table","theme":"cream","size":[37,32]},{"id":"title_solid","cat":"칭호","name":"단색 칭호","price":500000,"spr":"crown","catalogOnly":true},{"id":"title_gradient","cat":"칭호","name":"그라데이션 칭호","price":1500000,"spr":"crown","catalogOnly":true,"seasonLimit":5}]});

// Optional Cloudflare deployment. NOT enabled by the static Sites playtest.
// No bot token is used. Discord access tokens are not persisted or sent to the client.
const KEY = 'pika.pet.playtest.v1';
const day = (time = Date.now()) => new Date(time + 9 * 3600000).toISOString().slice(0, 10);
const integer = (v, min, max) => Number.isSafeInteger(v) && v >= min && v <= max;
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
  if (!Array.isArray(s.pets) || !s.pets.length || s.pets.length > 2 || !integer(s.rep,0,s.pets.length - 1) || new Set(s.pets.map(p=>p.kind)).size !== s.pets.length) throw Error('펫 기록을 읽을 수 없어요.');
  for (const p of s.pets) if (!['white','angel'].includes(p.kind) || typeof p.name !== 'string' || p.name.length > 20 || typeof p.hatched !== 'boolean' || !integer(p.taps,0,3) || (p.kind === 'angel' && !s.owned.includes('p1'))) throw Error('펫 정보를 읽을 수 없어요.');
  if (!integer(s.hun,0,3) || !integer(s.mood,0,3) || !Array.isArray(s.poop) || s.poop.length > 2 || s.poop.some(n => !integer(n,0,128))) throw Error('돌봄 상태를 읽을 수 없어요.');
  if (!s.att || typeof s.att.done !== 'boolean' || !integer(s.att.streak,0,100000)) throw Error('출석 기록을 읽을 수 없어요.');
  if (!Array.isArray(s.sent) || s.sent.length > 3 || s.sent.some(x=>!Array.isArray(x)||x.length!==2||x.some(t=>typeof t!=='string'||t.length>200))) throw Error('카드 기록을 읽을 수 없어요.');
  if (!Array.isArray(s.log) || s.log.length > 100 || s.log.some(x=>!Array.isArray(x)||x.length!==3||x.some(t=>typeof t!=='string'||t.length>200))) throw Error('활동 기록을 읽을 수 없어요.');
  const pos={}; for (const id of ['m1','m2','m3']) { const xy=s.pos?.[id]; if (!Array.isArray(xy)||xy.length!==2||xy.some(n=>!Number.isFinite(n)||n < -128||n>256)) throw Error('가구 배치를 읽을 수 없어요.');pos[id]=[...xy]; }
  const result={coins:s.coins,earned:s.earned,xp:s.xp,owned:[...s.owned],eq:{벽:s.eq.벽??null,바닥:s.eq.바닥??null,칭호:s.eq.칭호??null,배지:s.eq.배지??null,가구:[...s.eq.가구]},pets:s.pets.map(p=>({name:p.name,kind:p.kind,hatched:p.hatched,taps:p.taps})),rep:s.rep,hun:s.hun,mood:s.mood,poop:[...s.poop],att:{streak:s.att.streak,done:s.att.done},sent:s.sent.map(x=>[...x]),log:s.log.map(x=>[...x]),pos,cleaned:integer(s.cleaned,0,1000000)?s.cleaned:0};
  if (value.day !== day()) { result.att.done=false;result.sent=[]; if(value.day!==day(Date.now()-86400000))result.att.streak=0; }
  return result;
}
function snapshot(state) {return {version:1,day:day(),savedAt:new Date().toISOString(),state:{...state,log:state.log.slice(0,100)}};}
function purchase(state, product) {
  if (!product || product.only) throw Error('조건을 충족해야 받을 수 있는 상품이에요.');
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
export default createWorker({products:[{"id":"w1","cat":"벽","name":"하늘 줄무늬","price":150,"spr":"wall1"},{"id":"w2","cat":"벽","name":"별빛 벽","price":300,"spr":"wall2"},{"id":"f1","cat":"바닥","name":"체크 바닥","price":120,"spr":"floor1"},{"id":"f2","cat":"바닥","name":"나무 바닥","price":200,"spr":"floor2"},{"id":"m1","cat":"가구","name":"작은 화분","price":80,"spr":"plant"},{"id":"m2","cat":"가구","name":"노란 조명","price":180,"spr":"lamp"},{"id":"m3","cat":"가구","name":"분홍 침대","price":450,"spr":"bed"},{"id":"t1","cat":"칭호","name":"왕관 고양이","price":900,"spr":"crown","season":1},{"id":"t2","cat":"칭호","name":"냐냐냥 멤버","price":0,"spr":"star","only":"멤버십 전용"},{"id":"t3","cat":"칭호","name":"서버 부스터","price":0,"spr":"heart","only":"부스터 전용"},{"id":"b1","cat":"배지","name":"별 배지","price":250,"spr":"star"},{"id":"b2","cat":"배지","name":"하트 배지","price":250,"spr":"heart"},{"id":"b3","cat":"배지","name":"달 배지","price":300,"spr":"moon"},{"id":"b4","cat":"배지","name":"구름 배지","price":300,"spr":"cloud"},{"id":"p1","cat":"펫","name":"천사냥 알","price":500,"spr":"iegg","pet":"angel","pname":"천사냥"}]});

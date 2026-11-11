export const KEY = 'pika.pet.playtest.v1';
export const day = (time = Date.now()) => new Date(time + 9 * 3600000).toISOString().slice(0, 10);
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
export function syncAttendance(state,now=Date.now()){
  const today=day(now),yesterday=day(now-86400000);
  state.att=migrateAttendance(state.att,today);
  state.att.done=state.att.lastDate===today;
  if(!state.att.done&&state.att.lastDate!==yesterday)state.att.streak=0;
  return state.att;
}
export function claimAttendance(state,now=Date.now()){
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
export const DEFAULT_FURNITURE_LAYOUT={
 cream_f1:[10,38],cream_f8:[42,57],cream_f3:[55,38],cream_f4:[81,40],
 cream_tea_table:[91,64],cream_f9:[108,38],
 cream_flower_table:[8,95],cream_f6:[41,100],cream_f7:[89,96],cream_f10:[109,114]
};
const SHOWROOM_FURNITURE=['cream_f1','cream_f8','cream_f3','cream_f4','cream_tea_table','cream_f9','cream_flower_table','cream_f7'];
export function ensureFurnitureLayout(state,items){
 if(!items.some(i=>i.id==='cream_tea_table'))return false;
 const retired=new Set(items.filter(i=>i.cat==='가구'&&i.retired).map(i=>i.id));
 const ownedBefore=state.owned.length,equippedBefore=state.eq.가구.length;
 state.owned=state.owned.filter(id=>!retired.has(id));
 state.eq.가구=state.eq.가구.filter(id=>!retired.has(id));
 if(state.furnitureLayoutVersion===3)return ownedBefore!==state.owned.length||equippedBefore!==state.eq.가구.length;
 const oldVersion=state.furnitureLayoutVersion;
 const previous=oldVersion===1?LAYOUT_V1:LAYOUT_V2;
 const oldIds=Object.keys(LAYOUT_V2);
 const pristineEquipped=oldIds.every(id=>state.eq.가구.includes(id))
   &&state.eq.가구.every(id=>oldIds.includes(id));
 for(const [id,pos] of Object.entries(DEFAULT_FURNITURE_LAYOUT)){
  if(!oldVersion&&!state.owned.includes(id))state.owned.push(id);
  const saved=state.pos[id],prev=previous[id];
  if(!saved||!oldVersion||(prev&&saved[0]===prev[0]&&saved[1]===prev[1]))
   state.pos[id]=[...pos];
 }
 // Curated showroom is the first-view equipment list, not an item ownership limit.
 // Do not remove intentionally placed furniture or theme-mixed sets.
 if(!oldVersion||pristineEquipped)state.eq.가구=[...SHOWROOM_FURNITURE];
 state.furnitureLayoutVersion=3;
 return true;
}
export function validateSave(value, items) {
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
    if(!s.roomLook||!['cream','pink','whitewood'].includes(s.roomLook.wall)||!['cream','pink','whitewood'].includes(s.roomLook.floor))throw Error('방 배경을 읽을 수 없어요.');
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
    if(![1,2,3].includes(s.furnitureLayoutVersion))throw Error('가구 배치를 읽을 수 없어요.');
    result.furnitureLayoutVersion=s.furnitureLayoutVersion;
  }
  ensureFurnitureLayout(result,items);
  return result;
}
export function ensureDaily(state,today=day()){
  if(!state.daily||state.daily.day!==today)state.daily={day:today,feed:false,play:false};
  return state.daily;
}
export function recordDailyAction(state,action,today=day()){
  const daily=ensureDaily(state,today);
  if(action!=='feed'&&action!=='play')return false;
  const changed=!daily[action];daily[action]=true;return changed;
}
export function snapshot(state) {return {version:1,day:day(),savedAt:new Date().toISOString(),state:{...state,log:state.log.slice(0,100)}};}
export function purchase(state, product) {
  if (!product || product.only || product.catalogOnly || product.retired) throw Error('실제 역할 연동 전에는 구매할 수 없는 상품이에요.');
  if (state.owned.includes(product.id)) throw Error('이미 가지고 있어요.');
  if (!integer(product.price,0,100000000) || state.coins < product.price) throw Error('냐냐냥이 부족해요.');
  return {coins:state.coins-product.price,owned:[...state.owned,product.id]};
}

export const KEY = 'pika.pet.playtest.v1';
export const day = (time = Date.now()) => new Date(time + 9 * 3600000).toISOString().slice(0, 10);
const integer = (v, min, max) => Number.isSafeInteger(v) && v >= min && v <= max;
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
export function snapshot(state) {return {version:1,day:day(),savedAt:new Date().toISOString(),state:{...state,log:state.log.slice(0,100)}};}
export function purchase(state, product) {
  if (!product || product.only) throw Error('조건을 충족해야 받을 수 있는 상품이에요.');
  if (state.owned.includes(product.id)) throw Error('이미 가지고 있어요.');
  if (!integer(product.price,0,100000000) || state.coins < product.price) throw Error('냐냐냥이 부족해요.');
  return {coins:state.coins-product.price,owned:[...state.owned,product.id]};
}

// First pet selection and interactive pet shop. Existing saves are not reset.
const SHOP_SPECIES=['cat','dog','white','angel','raccoon'];
let starterModal=null,starterPreserveLegacy=true;
function petShopAction(kind){
 const index=state.pets.findIndex(p=>p.kind===kind);
 if(index>=0){
  state.rep=index;
  persist();render();
  say('대표 펫을 변경했어요');
  return;
 }
 if(needsStarterPet(state)){
  if(kind==='cat'||kind==='dog')return finishStarterChoice(kind);
  return showStarterChoice();
 }
 const p=ITEMS.find(i=>i.pet===kind);
 if(p&&Number.isSafeInteger(p.price)&&p.price>0&&!p.only&&!p.catalogOnly&&!p.retired){
  if(state.coins<p.price)return say('냐냐냥이 부족해요');
  // First focus goes to Buy, not Cancel; the actual charge is made only after confirmation.
  return push('buy',{item:p,cur:0});
 }
 say(kind==='angel'?'일일 미션 3개 완료 누적 15일 보상이에요':'획득 조건과 가격이 아직 확정되지 않았어요');
}
function finishStarterChoice(kind){
 try{
  claimStarterPet(state,kind,{preserveLegacy:starterPreserveLegacy});
  starterModal?.remove();starterModal=null;
  spriteCache.clear();
  persist();
  goHome();
  say((kind==='cat'?'고양이':'강아지')+'를 첫 친구로 선택했어요!');
 }catch(error){
  if(starterModal){
   const note=starterModal.querySelector('[role="alert"]');
   if(note)note.textContent=error.message;
   starterModal.querySelectorAll('[data-starter-kind]').forEach(button=>button.disabled=false);
  }else say(error.message);
 }
}
function showStarterChoice(){
 if(!needsStarterPet(state))return false;
 if(starterModal)return true;
 try{starterPreserveLegacy=Boolean(localStorage.getItem(KEY));}catch{starterPreserveLegacy=true;}
 const mask=document.createElement('section');mask.className='starter-choice-mask';mask.setAttribute('role','dialog');
 mask.setAttribute('aria-modal','true');mask.setAttribute('aria-label','첫 펫 고르기');
 mask.innerHTML='<div class="starter-choice-panel"><h2>그못섬 첫 친구</h2><p>고양이와 강아지 중 한 마리를 무료로 선택해 주세요.</p>'
 +'<div class="starter-choice-options">'+[['cat','고양이'],['dog','강아지']].map(([kind,label])=>
 '<button type="button" data-starter-kind="'+kind+'"><img src="'+PET_ASSETS[skin][kind]+'" alt="" />'
 +'<strong>'+label+'</strong><small>무료 선택</small></button>').join('')+'</div>'
 +'<p class="starter-choice-note">첫 친구는 한 마리만 무료로 지급됩니다. 이후 펫은 상점이나 미션을 통해 획득할 수 있습니다.</p><p role="alert"></p></div>';
 mask.addEventListener('click',e=>{
  const button=e.target.closest('[data-starter-kind]');if(!button)return;
  for(const b of mask.querySelectorAll('[data-starter-kind]'))b.disabled=true;
  finishStarterChoice(button.dataset.starterKind);
 });
 starterModal=mask;document.body.append(mask);
 return true;
}
// The original store renders only four generic product slots. Pet species need
// their own visible, scrollable cards; the same actions must work by tap and pad.
function petShopStatus(kind){
 if(state.pets.some(p=>p.kind===kind))return '보유 중 · 대표 선택';
 if(needsStarterPet(state)&&(kind==='cat'||kind==='dog'))return '첫 친구 무료';
 if(kind==='angel')return '미션 15일 보상';
 const product=ITEMS.find(i=>i.pet===kind);
 if(product&&Number.isSafeInteger(product.price)&&product.price>0&&!product.only&&!product.catalogOnly&&!product.retired)
  return fmt(product.price)+'냥 · 구매';
 return '가격·획득 경로 미확정';
}
const beforePetShopBody=shopBody;
shopBody=function(s){
 if(CATS[s.cat||0]?.[0]!=='펫')return beforePetShopBody(s);
 const n=CATS.length;
 const tabs='<div class="cats" role="tablist" aria-label="상점 종류">'+CATS.map(([label,sprite],i)=>
  '<div class="ct'+(i===(s.cat||0)?' on':'')+(s.cur===i?' sel blink':'')+'" data-i="'+i+'" role="tab" aria-selected="'+(i===(s.cat||0))+'" aria-label="'+label+'">'+icon(sprite,14)+'</div>').join('')+'</div>';
 const cards=SHOP_SPECIES.map((kind,i)=>{
  const name=({cat:'고양이',dog:'강아지',white:'토끼',angel:'천사냥',raccoon:'너구리'})[kind];
  const url=PET_ASSETS[skin]?.[kind];
  const portrait=url?'<img src="'+url+'" alt="" />':'<canvas data-pet="'+kind+'|1" aria-hidden="true"></canvas>';
  return '<button type="button" class="pet-catalog-card'+(s.cur===n+i?' sel':'')+'" data-pet-shop="'+kind+'" aria-label="'+name+' · '+petShopStatus(kind)+'">'
   +portrait+'<span class="pet-catalog-name">'+name+'</span><small>'+petShopStatus(kind)+'</small></button>';
 }).join('');
 return tabs+'<div class="pet-catalog-grid" role="group" aria-label="펫 목록">'+cards+'</div>'
  +'<p class="shop-policy-caption">첫 펫: 고양이·강아지 중 1마리 무료</p>'
  +'<button type="button" class="row shop-back" data-pet-shop-back>'+icon('ileft',8)+'<span class="l">뒤로</span></button>';
};
const earlierShopOK=shopOK;
shopOK=function(s){
 if(CATS[s.cat||0]?.[0]!=='펫')return earlierShopOK(s);
 const n=CATS.length;
 if(s.cur<n){s.cat=s.cur;s.cur=n;return render();}
 if(s.cur>=n+SHOP_SPECIES.length)return back();
 return petShopAction(SHOP_SPECIES[s.cur-n]);
};
document.addEventListener('click',e=>{
 if(scr().id!=='shop')return;
 const card=e.target.closest?.('[data-pet-shop]');
 const backButton=e.target.closest?.('[data-pet-shop-back]');
 if(!card&&!backButton)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(backButton)return back();
 if(card.disabled)return;
 const i=SHOP_SPECIES.indexOf(card.dataset.petShop);
 if(i<0)return;
 scr().cur=CATS.length+i;
 petShopAction(SHOP_SPECIES[i]);
},true);

const furnitureImages={};
const whitewoodFurnitureImages={};
for(const [id,url] of Object.entries(WHITEWOOD_ASSETS.furniture)){const image=new Image();image.onload=()=>{QK='';render()};image.src=url;whitewoodFurnitureImages[id]=image;}
for(const product of FURNITURE_CATALOG){const im=new Image();im.onload=()=>{QK='';render()};im.src=FURNITURE_URLS[product.id];furnitureImages[product.id]=im;}
function furnitureIcon(id,px,cls){return '<img class="furniture-art '+(cls||'')+'" alt="" src="'+FURNITURE_URLS[id]+'" style="width:'+px+'px;height:'+px+'px;object-fit:contain">'}
// Rendering and hit testing share the same rectangle; furniture is never resized by theme choice.
function furnitureRenderBounds(id, position){
 const product=item(id);
 if(!product||product.retired)return null;
 const [w,h]=product.size||[FS,FS];
 const p=position||state.pos[id]||[32,106-h];
 const whitewood=isWhitewoodRoom(),factor=whitewood?.78:1;
 const width=Math.max(8,Math.round(w*factor));
 const height=Math.max(8,Math.round(h*factor));
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 // The room boundary is the only placement limit; wall area and furniture overlap are allowed.
 const x=whitewood?clamp(p[0],0,Math.max(0,128-width)):clamp(p[0]+DX,0,Math.max(0,RW-width));
 const y=clamp(p[1],0,Math.max(0,RH-height));
 return {x:Math.round(x),y:Math.round(y),width,height,sourceWidth:w,sourceHeight:h};
}
function drawFurniture(k,id){
 const product=item(id),image=furnitureImages[id];
 if(!product||product.retired||!image?.complete||!image.naturalWidth)return;
 const whitewood=isWhitewoodRoom();
 const art=whitewood?(whitewoodFurnitureImages[id]?.naturalWidth?whitewoodFurnitureImages[id]:image):image;
 const b=furnitureRenderBounds(id,furnitureEdit?.id===id?furnitureEdit.draft:null);
 if(!b)return;
 k.imageSmoothingEnabled=false;
 // The size, position and hit area must agree on touch devices.
 k.drawImage(whitewood?art:styleRoomArt(image,b.sourceWidth,b.sourceHeight),b.x,b.y,b.width,b.height);
}
shopBody=function(s){
 const its=shopItems(s),n=CATS.length,c=s.cur,category=CATS[s.cat||0][0];
 const cats='<div class="cats" aria-label="상점 카테고리">'
  +CATS.map(([name,sprite],i)=>'<div class="ct'+(i===(s.cat||0)?' on':'')+(c===i?' sel':'')
   +'" data-i="'+i+'" role="button" aria-label="'+name+'" title="'+name+'">'+icon(sprite,14)+'</div>').join('')+'</div>';
 if(category==='펫'){
  const species=[['cat','고양이'],['dog','강아지'],['white','토끼'],['angel','천사냥'],['raccoon','너구리']];
  const grid=species.map(([kind,name],idx)=>{
   const ownerIndex=state.pets.findIndex(p=>p.kind===kind),owned=ownerIndex>=0;
   const first=needsStarterPet(state)&&(kind==='cat'||kind==='dog');
   const product=ITEMS.find(i=>i.pet===kind);
   const buyable=!owned&&!first&&product&&product.price>0&&!product.only&&!product.catalogOnly&&!product.retired;
   const status=owned?(state.rep===ownerIndex?'대표 펫':'대표로 설정'):first?'첫 펫 무료 선택':
     buyable?fmt(product.price)+'냥':kind==='angel'?'미션 누적 15일':'획득 조건 미확정';
   const available=owned||first||buyable;
   return '<button type="button" class="pet-catalog-card'+(c===n+idx?' sel':'')+'" data-pet-shop="'+kind+'"'
    +' aria-disabled="'+(!available)+'" aria-label="'+name+' · '+status+'">'
    +'<canvas data-pet="'+kind+'|1" aria-hidden="true"></canvas>'
    +'<span class="pet-catalog-name">'+name+'</span><small>'+status+'</small></button>';
  }).join('');
  return cats+'<div class="pet-catalog-grid">'+grid+'</div>'
   +'<p class="shop-policy-caption">첫 펫 고양이·강아지 중 한 마리 무료 · 미확정 상품 판매 안 함</p>'
   +'<div class="row shop-back" data-pet-shop-back="1">'+icon('ileft',8)+'<span class="l">뒤로</span></div>';
 }
 const offset=c>=n&&c<n+its.length?Math.floor((c-n)/4)*4:0;
 const shown=its.slice(offset,offset+4);
 const products=shown.length
  ?shown.map((i,j)=>{
    const own=state.owned.includes(i.id);
    const status=own?'보유 중':i.only?i.only:fmt(i.price)+'냥';
    const hint=i.catalogOnly?'연동 전':i.cat==='가구'?'체험가':'';
    return '<div class="pd'+(c===n+offset+j?' sel':'')+'" data-i="'+(n+offset+j)+'" aria-label="'+esc(i.name)+' '+status+'">'
      +'<div class="shop-product-art">'+icon(i.spr,28)+'</div><span class="n">'+esc(i.name)+'</span>'
      +'<span class="p">'+status+'</span>'+(hint?'<small class="shop-product-hint">'+hint+'</small>':'')+'</div>';
   }).join('')
  :'<p class="shop-empty">현재 등록된 상품이 없습니다.</p>';
 const pages=Math.max(1,Math.ceil(its.length/4));
 return cats+'<div class="prods count-'+shown.length+'">'+products+'</div>'
  +'<div class="furniture-pages"><button type="button" data-fpage="-1" aria-label="이전 상품" '+(pages<2?'disabled':'')+'>◀</button>'
  +'<span>'+(Math.floor(offset/4)+1)+' / '+pages+'</span>'
  +'<button type="button" data-fpage="1" aria-label="다음 상품" '+(pages<2?'disabled':'')+'>▶</button></div>'
  +'<div class="row shop-back" data-i="'+(n+its.length)+'">'+icon('ileft',8)+'<span class="l">뒤로</span></div>';
};
$('lcd').addEventListener('click',e=>{const button=e.target.closest('[data-fpage]');if(!button||scr().id!=='shop')return;const s=scr(),its=shopItems(s),pages=Math.ceil(its.length/4);if(!pages)return;const page=s.cur>=CATS.length&&s.cur<CATS.length+its.length?Math.floor((s.cur-CATS.length)/4):0;s.cur=CATS.length+((page+Number(button.dataset.fpage)+pages)%pages)*4;render();});
const previousFurnitureList=SCR.decoCat.list;
SCR.furnitureBag={title:'가구 가방',view:s=>{
 const owned=state.owned.map(item).filter(i=>i&&i.cat==='가구'&&!i.retired).reverse(),pages=Math.max(1,Math.ceil(owned.length/4));s.pg=Math.max(0,Math.min(s.pg||0,pages-1));
 return '<section class="furniture-bag"><p>가구를 골라 놓거나 보관해요</p><div class="bag-grid">'+owned.slice(s.pg*4,s.pg*4+4).map(i=>'<button type="button" data-bag-item="'+i.id+'">'+icon(i.spr,28)+'<strong>'+esc(i.name)+'</strong><small>'+(isOn(i)?'방에 배치됨':'가방에 보관 중')+'</small></button>').join('')+'</div><div class="bag-pager"><button type="button" data-bag-page="-1" aria-label="이전 가구">‹</button><span>'+(s.pg+1)+' / '+pages+'</span><button type="button" data-bag-page="1" aria-label="다음 가구">›</button></div></section>';
}};
SCR.bagItem={title:s=>item(s.itemId)?.name||'가구',list:s=>{
 const i=item(s.itemId);if(!i||!state.owned.includes(i.id))return [BACK()];
 const place=()=>{if(!isOn(i))equip(i);if(!state.pos[i.id])state.pos[i.id]=[32,106-(i.size?.[1]||FS)];persist();goHome();startFurnitureEdit(i.id);};
 return [L(isOn(i)?'위치 옮기기':'방에 놓기',i.spr,place),...(isOn(i)?[L('가방에 보관','ilist',()=>{state.eq.가구=state.eq.가구.filter(id=>id!==i.id);persist();back();})]:[]),L('가구 가방','ilist',()=>push('furnitureBag')),BACK()];
}};
document.addEventListener('click',e=>{
 const target=e.target.closest?.('[data-bag-item],[data-bag-page]');if(!target||scr().id!=='furnitureBag')return;
 e.preventDefault();e.stopImmediatePropagation();
 if(target.dataset.bagItem){const i=item(target.dataset.bagItem);if(i&&state.owned.includes(i.id))push('bagItem',{itemId:i.id});}
 else{scr().pg=Math.max(0,(scr().pg||0)+Number(target.dataset.bagPage));render();}
},true);
const beforeBagDeco=SCR.deco.list;SCR.deco.list=()=>[L('가구 가방','ilist',()=>push('furnitureBag')),...beforeBagDeco()];
SCR.decoCat.list=s=>s.cat!=='가구'?previousFurnitureList(s):[...state.owned.map(item).filter(i=>i&&i.cat==='가구'&&!i.retired).map(i=>L(i.name,i.spr,()=>{if(!state.pos[i.id])state.pos[i.id]=[32,106-(i.size?.[1]||FS)];equip(i);persist();render();},isOn(i)?'적용 중':'')),L('상점에서 고르기','ishop',()=>push('shop',{cat:2,cur:2})),BACK()];

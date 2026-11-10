// The public shop uses the original device's SCR screens and authoritative bot catalog.
let liveShop=null,liveShopBusy=false,liveShopMessage='',liveShopSelected=null;
const liveScreens=new Set(['shop','liveTitles','liveShopHistory']);
async function refreshLiveShop(){
 if(publicBooting||!account||liveShopBusy)return;
 liveShopBusy=true;
 try{liveShop=await accountRequest('account/shop');}
 catch(error){liveShopMessage=error.message;}
 finally{liveShopBusy=false;if(liveScreens.has(scr().id))render();}
}
const beforeLiveShopPush=push;
push=function(id,options){beforeLiveShopPush(id,options);if(liveScreens.has(id)){liveShopSelected=null;liveShopMessage='';void refreshLiveShop();}};
const liveShopStyle=document.createElement('style');liveShopStyle.textContent='.live-panel{width:100%;height:100%;min-height:0;overflow-y:auto;box-sizing:border-box;padding:4px;font:inherit}.live-panel p{margin:4px 0;font-size:9px;line-height:1.5}.live-panel button{font:inherit;font-size:9px;color:var(--ink);border:1px solid var(--dash);background:var(--cell);padding:4px;margin:2px}.live-panel article{border-bottom:1px dashed var(--dash);padding:4px 0}.live-panel strong{font-size:10px}.live-panel small{display:block;font-size:8px}.live-panel button:disabled{opacity:.55}.live-products{display:grid;grid-template-columns:1fr 1fr}.live-products button{min-width:0;overflow-wrap:anywhere}.live-products small{margin-top:3px}';document.head.append(liveShopStyle);
function liveShopView(){
 const profile=liveShop?.profile,products=profile?.shop?.products||[],pending=liveShop?.pending||[];
 let html='<button data-live-refresh>새로 확인</button><button data-live-titles>칭호 보유함</button><button data-live-history>구매·사용 기록</button>';
 const status=liveShopMessage||(!liveShop?'상점 정보를 불러오는 중이에요.':!profile?.inGuild?'그못방 계정을 확인 중이에요.':!profile.shop?'상점 연결을 확인 중이에요.':pending.length?'구매·역할 변경 확인 중이에요.':products.length?'구매한 칭호는 영구 소유해요.':'현재 판매 중인 상품이 없어요.');
 html+='<p role="status">'+esc(status)+'</p>';
 if(liveShopSelected){const p=liveShopSelected;html+='<strong>'+esc(p.name)+'</strong><p>'+fmt(p.price)+' 냐냐냥을 사용할까요?</p><button data-live-confirm '+(liveShopBusy?'disabled':'')+'>구매 확정</button><button data-live-cancel>취소</button>';}
 else html+='<div class="live-products">'+products.map(p=>'<button data-live-product="'+esc(p.key)+'" '+(!p.available||p.owned||liveShopBusy||pending.some(r=>r.roleKey===p.key)?'disabled':'')+'><strong>'+esc(p.name)+'</strong><small>'+(p.owned?'보유 중':fmt(p.price)+' 냐냐냥')+'</small>'+(p.stock!==null?'<small>이번 시즌 '+p.stock+'개 남음</small>':'')+(!p.available&&!p.owned?'<small>구매 조건 확인 필요</small>':'')+'</button>').join('')+'</div>';
 return '<section class="live-panel" aria-label="실제 냐냐냥 상점">'+html+'</section>';
}
shopBody=liveShopView;
SCR.shop.title='상점';SCR.shop.right=()=>liveShop?.profile?.inGuild?fmt(liveShop.profile.coins)+' 냐냐냥':'';
shopOK=()=>{document.querySelector('[data-live-product]:not(:disabled),[data-live-confirm]:not(:disabled),[data-live-refresh]')?.click();};
SCR.liveTitles={title:'칭호 보유함',view:()=>{
 const holdings=liveShop?.profile?.shop?.holdings||[],pending=liveShop?.pending||[];
 return '<section class="live-panel"><button data-live-refresh>새로 확인</button><p role="status">'+esc(liveShopMessage||'착용·해제는 무료예요. 해제해도 소유권은 유지돼요.')+'</p>'+(!liveShop?'<p>보유함 확인 중…</p>':!holdings.length?'<p>보유한 칭호 역할이 없어요.</p>':'')+holdings.map(h=>'<article><strong>'+esc(h.name)+'</strong><small>'+(h.equipped?'착용 중':'보관 중')+'</small><button data-live-wear="'+esc(h.id)+'" '+(!h.manageable||liveShopBusy||pending.length?'disabled':'')+'>'+(pending.some(r=>r.roleKey==='wear_'+h.id)?'변경 확인 중':h.equipped?'해제하기':'착용하기')+'</button></article>').join('')+'</section>';
}};
SCR.liveShopHistory={title:'구매·사용 기록',view:()=>{
 const history=liveShop?.profile?.shop?.spending||[],requests=liveShop?.transactions||[];
 return '<section class="live-panel"><button data-live-refresh>새로 확인</button><p>'+esc(liveShopMessage)+'</p>'+requests.filter(r=>r.status!=='applied').map(r=>'<p>'+esc(r.status==='pending'?'처리 확인 중':r.reason||'요청하지 못했어요.')+'</p>').join('')+(history.length?history.map(r=>'<article><small>'+esc(new Date(r.at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))+'</small><strong>'+esc(r.name)+'</strong><p>'+fmt(r.coins)+' 냐냐냥</p></article>').join(''):'<p>최근 사용 내역이 없어요.</p>')+'</section>';
}};
const beforeLiveDeco=SCR.deco.list;
if(beforeLiveDeco)SCR.deco.list=(...args)=>[L('칭호 보유함','crown',()=>push('liveTitles')),...beforeLiveDeco(...args)];
const beforeLiveInput=input;
input=function(key){if(!liveScreens.has(scr().id)||!['L','R','OK'].includes(key))return beforeLiveInput(key);const controls=[...document.querySelectorAll('.live-panel button:not(:disabled)')];if(!controls.length)return;let i=controls.indexOf(document.activeElement);if(key==='OK')return (i>=0?controls[i]:controls[0]).click();controls[(i+(key==='R'?1:-1)+controls.length)%controls.length].focus();};
document.addEventListener('click',async event=>{
 const button=event.target.closest?.('[data-live-refresh],[data-live-product],[data-live-confirm],[data-live-cancel],[data-live-titles],[data-live-wear],[data-live-history]');if(!button)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(button.hasAttribute('data-live-titles'))return push('liveTitles');
 if(button.hasAttribute('data-live-history'))return push('liveShopHistory');
 if(button.hasAttribute('data-live-refresh')){liveShopMessage='';return refreshLiveShop();}
 if(button.hasAttribute('data-live-cancel')){liveShopSelected=null;return render();}
 if(button.dataset.liveProduct){liveShopSelected=liveShop?.profile?.shop?.products.find(p=>p.key===button.dataset.liveProduct);return render();}
 if(liveShopBusy)return;
 const holding=button.dataset.liveWear&&liveShop?.profile?.shop?.holdings.find(h=>h.id===button.dataset.liveWear),p=liveShopSelected;
 if(!holding&&!p)return;
 liveShopBusy=true;render();
 try{
  if(holding)await accountRequest('account/shop/equip',{item:holding.id,equipped:!holding.equipped});
  else await accountRequest('account/shop/buy',{roleKey:p.key,season:liveShop.profile.shop.season,price:p.price});
  liveShopSelected=null;liveShopMessage='뉴피카에서 처리 확인 중이에요.';
 }catch(error){liveShopMessage=error.message;}
 finally{liveShopBusy=false;await refreshLiveShop();}
},true);
ShopAPI.buy=async()=>{throw Error('상점에서 최신 판매 목록을 확인해 주세요.');};
setInterval(()=>{if(liveScreens.has(scr().id)&&!liveShopSelected)void refreshLiveShop();},5000);

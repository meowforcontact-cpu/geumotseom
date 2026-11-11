// Depth patch for the downloaded 4:3 public release. Camera, assets and saves stay intact.
const roomDepthAlphaCache=new WeakMap();
function advanceRoomPetForDepth(){
 const st=stage(),ex=expr();
 if(calm||st==='egg'||ex==='sleep'||anim)return;
 const dx=cat.tx-cat.x,dy=cat.ty-cat.y,dist=Math.hypot(dx,dy);
 if(dist>.5){
  const speed=Math.min(1,dist);cat.x+=dx/dist*speed;cat.y+=dy/dist*speed;
 }else if(--cat.wait<0){
  const inset=(64-38)/2;
  cat.tx=-inset+Math.random()*(RW-64+2*inset);
  cat.ty=roomFloorBackY(RH)+Math.random()*(124-roomFloorBackY(RH));cat.wait=20+Math.floor(Math.random()*35);
 }
}
function sortRoomDepthEntries(entries){
 return entries.sort((a,b)=>a.footY-b.footY||(a.key<b.key?-1:a.key>b.key?1:0));
}
function roomDepthFurnitureArt(id){
 const product=item(id),image=furnitureImages[id];
 if(!product||product.retired||!image?.complete||!image.naturalWidth)return null;
 if(isWhitewoodRoom()){
  const master=whitewoodFurnitureImages[id]?.naturalWidth?whitewoodFurnitureImages[id]:image;
  return isPinkAtticRoom()?atticFurnitureArt(master):master;
 }
 const [w,h]=product.size||[FS,FS];return styleRoomArt(image,w,h);
}
function roomDepthPetBounds(){
 const size=stage()==='egg'?34:38,ex=expr(),f=Math.floor(cat.t/3);
 const hop=!calm&&ex==='play'?-(f%2?3:0):!calm&&ex==='walk'?-(f%2):0;
 return {x:Math.round(cat.x)+(64-size)/2,y:Math.round(cat.y)-size+hop,width:size,height:size};
}
function roomDepthEntries(withPet=true){
 const entries=[];
 for(const id of state.eq.가구){
  const b=furnitureRenderBounds(id,furnitureEdit?.id===id?furnitureEdit.draft:null);
  if(b)entries.push({kind:'furniture',id,key:'furniture:'+id,footY:b.y+b.height,bounds:b});
 }
 if(withPet)entries.push({kind:'pet',key:'pet',footY:Math.round(cat.y),bounds:roomDepthPetBounds()});
 state.poop.forEach((x,index)=>entries.push({kind:'poop',x,key:'poop:'+index,footY:FLOOR+4}));
 return sortRoomDepthEntries(entries);
}
function drawRoomDepthSorted(k,withPet){
 for(const entry of roomDepthEntries(withPet)){
  if(entry.kind==='furniture')drawFurniture(k,entry.id);
  else if(entry.kind==='pet')drawPet(k);
  else put(k,S.ipoop,poopX(entry.x),FLOOR-12,2);
 }
}
function roomDepthAlphaAt(art,b,x,y){
 if(!art||!b||x<b.x||y<b.y||x>=b.x+b.width||y>=b.y+b.height)return false;
 const width=art.naturalWidth||art.width,height=art.naturalHeight||art.height;
 if(!width||!height)return false;
 let mask=roomDepthAlphaCache.get(art);
 if(!mask){
  try{
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(art,0,0);
   const pixels=ctx.getImageData(0,0,width,height).data;
   const alpha=new Uint8Array(width*height);for(let i=0;i<alpha.length;i++)alpha[i]=pixels[i*4+3];
   mask={width,height,alpha};
  }catch{mask={width,height,alpha:null}}
  roomDepthAlphaCache.set(art,mask);
 }
 if(!mask.alpha)return true;
 const px=Math.min(mask.width-1,Math.floor((x-b.x)/b.width*mask.width));
 const py=Math.min(mask.height-1,Math.floor((y-b.y)/b.height*mask.height));
 return mask.alpha[py*mask.width+px]>=16;
}
function roomDepthFrontAt(x,y){
 const entries=roomDepthEntries(true);
 for(let index=entries.length-1;index>=0;index--){
  const entry=entries[index];
  if(entry.kind==='furniture'){
   if(roomDepthAlphaAt(roomDepthFurnitureArt(entry.id),entry.bounds,x,y))return entry;
  }else if(entry.kind==='pet'){
   const art=sprite(stage(),expr(),Math.floor(cat.t/3),pet().kind);
   if(roomDepthAlphaAt(art,entry.bounds,x,y))return entry;
  }
 }
 return null;
}
roomFurnitureAt=function(x,y){const entry=roomDepthFrontAt(x,y);return entry?.kind==='furniture'?entry.id:null};
function roomDepthPetAt(x,y){return roomDepthFrontAt(x,y)?.kind==='pet'}

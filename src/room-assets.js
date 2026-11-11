// Original PNGs remain separate so wallpaper and flooring can be mixed.
const roomLayers={};
const roomNames={cream:'크림블루',pink:'핑크장식',whitewood:'화이트 우드 방',attic:'겨울 핑크 다락방'};
const whitewoodRoomImage=new Image();
let whitewoodSquareImage=null;
// Selected 4:3 background is used in full. No square crop or stretched room.
function prepareWhitewoodSquare(image){
 return image;
}
whitewoodRoomImage.onload=()=>{whitewoodSquareImage=prepareWhitewoodSquare(whitewoodRoomImage);if(isWhitewoodRoom()&&cat.x===32&&cat.tx===32)cat.x=cat.tx=53;QK='';render()};
whitewoodRoomImage.src=WHITEWOOD_ASSETS.room;
const pinkAtticRoomImage=new Image();
let pinkAtticReady=false;
pinkAtticRoomImage.onload=()=>{pinkAtticReady=true;QK='';render()};
pinkAtticRoomImage.src=WHITEWOOD_ASSETS.attic;
function whitewoodRoomView(){
 const size=whitewoodWorldWidth(),scale=Math.min(RW/size,1);
 return {x:Math.round((RW-size*scale)/2),y:0,size,scale};
}
function whitewoodWorldWidth(){return 170}
const isPinkAtticRoom=()=>roomLook().wall==='attic'||roomLook().floor==='attic';
const isWhitewoodRoom=()=>isPinkAtticRoom()||roomLook().wall==='whitewood'||roomLook().floor==='whitewood';
function roomLook(){return Q.get('room')==='attic'?{wall:'attic',floor:'attic'}:(state.roomLook||{wall:'attic',floor:'attic'})}
for(const name of ['cream-wall','cream-floor','pink-wall','pink-floor',...SKY4.map(t=>'sky-'+t)]){
 const im=new Image();
 im.onload=()=>{
  if(name.endsWith('-wall')){
   const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
   const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
   const pixels=ctx.getImageData(0,0,c.width,c.height),d=pixels.data;
   // Cut only blue glass, retaining curtains, frame and white window bars.
   for(let y=0;y<c.height*.43;y++)for(let x=0;x<c.width;x++){
    const nx=x/c.width;if(!((nx>.19&&nx<.34)||(nx>.67&&nx<.82)))continue;
    const i=(y*c.width+x)*4,r=d[i],g=d[i+1],b=d[i+2];
    if(b>r+18&&g>r+12&&b>g+4)d[i+3]=0;
   }
   ctx.putImageData(pixels,0,0);roomLayers[name]=c;
  }else roomLayers[name]=im;
  QK='';render();
 };
 im.src=ROOM_ASSET_URLS[name];
}
function roomAssetsReady(){if(isPinkAtticRoom())return pinkAtticReady;if(isWhitewoodRoom())return !!whitewoodSquareImage;const look=roomLook();return !!(roomLayers[look.wall+'-wall']&&roomLayers[look.floor+'-floor']&&roomLayers['sky-'+skyNow()])}
function roomWindowAt(x,y){
 if(isPinkAtticRoom())return (y>=0&&y<=47&&Math.abs(x-85)<=Math.max(0,y*1.0))||((x<16||x>154)&&y<74);
 if(isWhitewoodRoom())return x>=whitewoodWorldWidth()*.39&&x<=whitewoodWorldWidth()*.61&&y>=2&&y<=23;
 if(!roomAssetsReady()){const [sx,sy,sw,sh]=skyRect();return x>=sx&&x<sx+sw&&y>=sy&&y<sy+sh;}
 const width=Math.max(170,RW),left=(RW-width)/2,extra=width-170;
 return y>=-2&&y<=37&&((x>=left+20&&x<=left+67)||(x>=left+101+extra&&x<=left+148+extra));
}
function drawRoomLayer(k,source,x,y,w,h){
 const art=styleRoomArt(source,170,h),extra=w-170;
 if(!extra){k.drawImage(art,x,y,170,h);return;}
 // Widen only the plain middle wall/floor. Window frames and art retain scale.
 const scale=art.width/170,half=85*scale;
 k.drawImage(art,0,0,half,art.height,x,y,85,h);
 k.drawImage(art,half,0,scale,art.height,x+85,y,extra,h);
 k.drawImage(art,half,0,half,art.height,x+85+extra,y,85,h);
}
function drawAssetRoom(k){
 if(isWhitewoodRoom()){
  k.imageSmoothingEnabled=false;
  k.fillStyle='#eeebe5';k.fillRect(0,0,RW,RH);
  const roomImage=isPinkAtticRoom()?pinkAtticRoomImage:whitewoodSquareImage;
  if(roomImage?.naturalWidth){
   k.drawImage(roomImage,0,0,RW,RH);
   // Portrait reveals additional floor below the complete 4:3 room.
   if(MODE==='egg')for(let y=RH;y<whitewoodWorldWidth();y+=32)
    k.drawImage(roomImage,0,roomImage.height-48,roomImage.width,48,0,y,RW,32);
  }
  return;
 }
 const look=roomLook(),sky=roomLayers['sky-'+skyNow()];
 // One fixed room shared by both cameras: portrait shows the centre crop.
 const w=Math.max(170,RW),h=147,x=Math.round((RW-w)/2),y=-19;
 k.imageSmoothingEnabled=false;
 k.fillStyle=SKYC[skyNow()][0];k.fillRect(0,0,RW,RH);
 const drift=calm?0:Math.floor(Date.now()/240)%w;
 const skyArt=styleRoomArt(sky,w,58);
 k.drawImage(skyArt,x-drift,-15,w,58);k.drawImage(skyArt,x-drift+w,-15,w,58);
 // Separate cloud silhouettes remain visible through both cut-out windows.
 k.save();k.fillStyle=skyNow()==='night'?'#7783b0':'#f7fcff';k.globalAlpha=skyNow()==='night'?.3:.8;
 for(const [offset,cy] of [[0,13],[63,24],[121,6]]){const cx=x+((offset+drift)%(w+38))-30;k.fillRect(cx,cy+3,30,6);k.fillRect(cx+6,cy,15,4);}
 k.restore();
 drawRoomLayer(k,roomLayers[look.wall+'-wall'],x,y,w,h);
 drawRoomLayer(k,roomLayers[look.floor+'-floor'],x,y,w,h);
}
const previousDecoList=SCR.deco.list;
SCR.deco.list=()=>[
 L('벽지 바꾸기','wall1',()=>push('roomWall'),roomNames[roomLook().wall]),
 L('바닥 바꾸기','floor1',()=>push('roomFloor'),roomNames[roomLook().floor]),
 ...previousDecoList().filter(row=>!['벽','바닥'].includes(row.l))
];
function roomChoiceList(part){return [...Object.entries(roomNames).map(([id,label])=>L(label,part==='wall'?'wall1':'floor1',()=>{
 state.roomLook=(id==='whitewood'||id==='attic')?{wall:id,floor:id}:{...roomLook(),[part]:id, ...(isWhitewoodRoom()?{[part==='wall'?'floor':'wall']:'cream'}:{})};
 // Clear legacy colour overlays only for the surface the user changes.
 state.eq[part==='wall'?'벽':'바닥']=null;QK='';persist();render();
},roomLook()[part]===id?'적용 중':'')),BACK()]}
SCR.roomWall={title:'벽지 선택',list:()=>roomChoiceList('wall')};
SCR.roomFloor={title:'바닥 선택',list:()=>roomChoiceList('floor')};

// Draw originals straight into a dense backing store, never through 128px.
function drawDetailedRoom(){
 const scale=4;
 if(buf.width!==RW*scale||rc.width!==RW*scale){
  buf.width=rc.width=RW*scale;buf.height=rc.height=RH*scale;
 }
 bx.setTransform(scale,0,0,scale,0,0);
 bx.imageSmoothingEnabled=false;
 cat.t++;idle++;
 if(anim&&--anim.t<=0){const a=anim;anim=null;a.done&&a.done()}
 const contained=isWhitewoodRoom()&&roomAssetsReady()&&placeNow().place!=='park';
 if(contained){
  const view=whitewoodRoomView(),savedRW=RW,savedDX=DX;
  bx.fillStyle=MODE==='egg'?'#f4f0eb':'#000';bx.fillRect(0,0,RW,RH);
  bx.save();
  bx.setTransform(scale*view.scale,0,0,scale*view.scale,scale*view.x,scale*view.y);
  RW=whitewoodWorldWidth();DX=0;
  // Shared 4:3 world; sprite feet may reach every floor edge.
  const inset=(64-(stage()==='egg'?34:38))/2;
  cat.x=Math.max(-inset,Math.min(RW-64+inset,cat.x));
  cat.tx=Math.max(-inset,Math.min(RW-64+inset,cat.tx));
  cat.y=Math.max(roomFloorBackY(RH),Math.min(124,cat.y));
  cat.ty=Math.max(roomFloorBackY(RH),Math.min(124,cat.ty));
  try{scene(true);drawFurnitureSelection(bx)}
  finally{RW=savedRW;DX=savedDX;bx.restore()}
 }else{
  scene(true);
  if(placeNow().place!=='park'){
   const R=(c,x,y,w,h)=>{bx.fillStyle=c;bx.fillRect(x,y,w,h)};
   tintAll(bx,skyNow(),R);
   const [sx,sy,sw,sh]=skyRect();winLight(bx,skyNow(),sx,sy,sw,sh);
  }
  drawFurnitureSelection(bx);
 }
 rx.setTransform(1,0,0,1,0,0);rx.imageSmoothingEnabled=false;
 rx.clearRect(0,0,rc.width,rc.height);rx.drawImage(buf,0,0);
 placeBubble();
 const th=skyNow();if(MODE+skin+th!==shellKey)applyShell();
}

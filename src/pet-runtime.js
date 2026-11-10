// Supplied dog, cat and raccoon masters, with a shared ten-state expression set.
const PET_ASSETS=__PET_ASSETS__;
const petFrames={blue:{},pink:{}};
const PET_FACE={
  dog:{eyes:[[37,74,19,16],[74,74,19,16]],mouth:[61,84,8,5],cheeks:[[34,90],[88,90]]},
  cat:{eyes:[[24,64,28,19],[76,64,28,19]],mouth:[61,76,8,6],cheeks:[[28,85],[91,85]]},
  raccoon:{eyes:[[24,55,25,23],[76,55,25,23]],mouth:[54,65,22,12],cheeks:[[26,79],[94,79]]}
};
function makePetFrame(master,kind,index,theme,legacyAngel=false){
  const c=rabbitCanvas(128,128),k=c.getContext('2d');k.imageSmoothingEnabled=false;
  k.drawImage(master,0,0);
  const face=PET_FACE[kind];
  // Match this species' actual eye ink; the raccoon is not pink-faced like the cat.
  const [ex,ey,ew,eh]=face.eyes[0],sample=k.getImageData(ex,ey,ew,eh).data,colors=new Map();
  for(let p=0;p<sample.length;p+=4)if(sample[p+3]>127&&(sample[p]+sample[p+1]+sample[p+2])/3<185){
    const color=`rgb(${sample[p]},${sample[p+1]},${sample[p+2]})`;colors.set(color,(colors.get(color)||0)+1);
  }
  const ink=legacyAngel?(theme==='pink'?'#b87598':'#58688e'):[...colors].sort((a,b)=>b[1]-a[1])[0]?.[0]||(theme==='pink'?'#b87598':'#58688e');
  const fur=kind==='raccoon'?(()=>{const d=k.getImageData(64,50,1,1).data;return `rgb(${d[0]},${d[1]},${d[2]})`;})():'#fff';
  const px=(x,y,w,h,color=ink)=>{k.fillStyle=color;k.fillRect(Math.round(x),Math.round(y),w,h);};
  const line=(points,color=ink,size=2)=>{
    k.strokeStyle=color;k.lineWidth=size;k.lineJoin='miter';k.beginPath();
    points.forEach(([x,y],i)=>i?k.lineTo(x,y):k.moveTo(x,y));k.stroke();
  };
  const dotEye=(x,y,w,h)=>{
    const cx=Math.round(x+w/2),cy=Math.round(y+h/2),r=Math.round(Math.min(w,h)*.43);
    k.fillStyle=ink;k.beginPath();
    [[-r,-r/2],[-r/2,-r],[r/2,-r],[r,-r/2],[r,r/2],[r/2,r],[-r/2,r],[-r,r/2]].forEach(([dx,dy],i)=>i?k.lineTo(Math.round(cx+dx),Math.round(cy+dy)):k.moveTo(Math.round(cx+dx),Math.round(cy+dy)));
    k.closePath();k.fill();px(cx-3,cy-5,4,4,'#fff');
  };
  // The supplied half-lidded eyes ARE the cat's base design, not an error to redraw.
  // Keep angel's existing face independent from this cat-only restoration.
  if((kind==='cat'&&legacyAngel)||[1,2,3,4].includes(index)){
    for(const [side,[x,y,w,h]] of face.eyes.entries()){
      px(x,y,w,h,fur);const cx=x+w/2,cy=y+h/2;
      if(index===1||index===3){const direction=side&&!legacyAngel?-1:1;line([[cx-5*direction,cy-5],[cx+4*direction,cy],[cx-5*direction,cy+5]],ink,3);}
      else if(index===2){px(x+1,y+4,w-2,3);px(cx-5,y+7,11,7);px(cx-1,y+7,2,2,'#fff');}
      else if(index===4)line([[cx-6,cy],[cx-2,cy+3],[cx+2,cy+3],[cx+6,cy]],ink,3);
      else dotEye(x,y,w,h);
    }
  }
  const [mx,my,mw,mh]=face.mouth,mc=mx+mw/2;
  if(index>0){
    px(mx-3,my-1,mw+6,mh+5,fur);
    if(index===1)line([[mc-5,my+1],[mc-4,my+7],[mc,my+9],[mc+4,my+7],[mc+5,my+1],[mc-5,my+1]]);
    else if(index===3){
      line([[mc-5,my+7],[mc,my+3],[mc+5,my+7]]);
      for(const [x,y,w,h] of face.eyes){px(x+w/2,y+h,3,12,'#75bff1');px(x+w/2-1,y+h+8,5,4,'#75bff1');}
    }else if(index===5)line([[mc-2,my],[mc+2,my],[mc+4,my+3],[mc+4,my+7],[mc+2,my+9],[mc-2,my+9],[mc-4,my+7],[mc-4,my+3],[mc-2,my]]);
    else if(index===6){
      line([[mc-7,my+2],[mc-6,my+6],[mc-3,my+7],[mc,my+4],[mc+3,my+7],[mc+6,my+6],[mc+7,my+2]]);
      for(const [x,y] of face.cheeks)for(let n=0;n<3;n++)line([[x+n*3,y],[x+n*3-2,y+4]],'#ef8fae',1);
    }else px(mc-2,my+3,5,2);
  }
  if(index===2){line([[88,42],[88,48],[84,48]],'#f27699');line([[94,42],[94,48],[98,48]],'#f27699');}
  if(index===4){line([[mc+5,my+5],[mc+10,my+1],[mc+15,my+5],[mc+12,my+11],[mc+7,my+10],[mc+5,my+5]],'#75bff1');}
  if(index===7){line([[20,101],[17,97]],ink);line([[16,107],[12,107]],ink);}
  if(index===8){line([[41,123],[48,123]],ink);line([[78,125],[85,125]],ink);}
  if(index===9){line([[43,125],[43,121]],ink);line([[83,125],[83,121]],ink);}
  return kind==='dog'?fitDogFrame(c):c;
}
function fitDogFrame(source){
  // The wide ears limit enlargement. 16% fits the entire dog with a 1px margin.
  const c=rabbitCanvas(128,128),k=c.getContext('2d');k.imageSmoothingEnabled=false;
  k.translate(64,120);k.scale(1.16,1.16);k.drawImage(source,-64,-120);return c;
}
function angelFrame(catFrame,theme){
  const c=rabbitCanvas(128,128),k=c.getContext('2d');k.imageSmoothingEnabled=false;
  const ink=theme==='pink'?'#b87598':'#58688e';
  // Three stepped feather tips. Face/body and halo keep their existing pixels.
  for(const flip of [false,true]){
    k.save();if(flip){k.translate(128,0);k.scale(-1,1);}
    const outline=[[43,102],[35,97],[28,87],[23,82],[19,81],[16,84],[16,89],[19,96],[13,90],[9,89],[6,92],[7,98],[12,105],[8,102],[4,103],[4,108],[10,115],[18,120],[28,121],[36,117],[43,111]];
    const shape=points=>{k.beginPath();points.forEach(([x,y],i)=>i?k.lineTo(x,y):k.moveTo(x,y));k.closePath();k.fill();};
    k.fillStyle=ink;shape(outline);
    k.fillStyle='#fffdf4';shape([[41,103],[34,100],[26,89],[22,85],[20,85],[19,87],[21,94],[27,103],[23,104],[12,93],[10,93],[10,97],[17,107],[15,109],[8,106],[8,108],[12,113],[20,117],[27,118],[34,115],[41,109]]);
    k.strokeStyle=theme==='pink'?'#e4c4d6':'#c1d5e9';k.lineWidth=2;
    k.beginPath();k.moveTo(17,107);k.lineTo(23,112);k.lineTo(30,113);k.moveTo(26,103);k.lineTo(31,108);k.lineTo(35,108);k.stroke();k.restore();
  }
  k.drawImage(catFrame,0,0);
  k.fillStyle='#c99542';k.fillRect(47,3,34,2);k.fillRect(43,5,4,4);k.fillRect(81,5,4,4);k.fillRect(47,9,34,2);
  k.fillStyle='#ffe9a0';k.fillRect(48,4,32,1);k.fillRect(48,8,32,1);
  return c;
}
async function loadPets(){
  await Promise.all(['blue','pink'].flatMap(theme=>['dog','cat','raccoon'].map(async kind=>{
    const master=await rabbitImage(PET_ASSETS[theme][kind]);
    petFrames[theme][kind]=Array.from({length:10},(_,i)=>makePetFrame(master,kind,i,theme));
    if(kind==='cat')petFrames[theme].angel=Array.from({length:10},(_,i)=>angelFrame(makePetFrame(master,kind,i,theme,true),theme));
  })));
  spriteCache.clear();render();
}
const whitewoodCatImages={};
const whitewoodFrames={};let whitewoodCatInitialized=false;
function whitewoodCatFrame(dir){
 if(!whitewoodCatInitialized){
  whitewoodCatInitialized=true;
  for(const [name,url] of Object.entries(WHITEWOOD_ASSETS.cat)){
   const image=new Image();image.onload=()=>{QK='';render()};image.src=url;whitewoodCatImages[name]=image;
  }
 }
 const source=whitewoodCatImages[dir];if(!source?.naturalWidth)return null;
 if(whitewoodFrames[dir])return whitewoodFrames[dir];
 const c=document.createElement('canvas');c.width=c.height=64;
 const k=c.getContext('2d');k.imageSmoothingEnabled=false;
 // 96 -> 48 is an exact 1:2 nearest pixel mapping; 8px inset keeps the
 // existing pet position, click area and interaction calculations unchanged.
 k.drawImage(source,8,16,48,48);whitewoodFrames[dir]=c;return c;
}
function petSprite(kind,expression,theme=skin){
 if(kind==='cat'&&isWhitewoodRoom()){
  const direction=Math.abs(cat.x-cat.tx)>.5?(cat.tx>cat.x?'east':'west'):'south';
  return whitewoodCatFrame(direction)||petFrames[theme][kind]?.[0]||rabbitCanvas(128,128);
 }
  if(!kind||kind==='white')return rabbitSprite(expression,theme);
  return petFrames[theme][kind]?.[RABBIT_STATES[expression]??0]||rabbitCanvas(128,128);
}

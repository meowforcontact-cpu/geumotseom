// Original standing artwork is authoritative; atlas cell 0 is never used.
const RABBIT_ASSETS = __RABBIT_ASSETS__;
const rabbitFrames = {blue: null, pink: null};
const rabbitColors = new Set();
const RABBIT_STATES = {happy:1, eat:1, proud:1, angry:2, sad:2, sulky:2,
  hungry:3, sick:3, teary:3, dizzy:3, sleepy:4, sleep:4, surprised:5,
  embarrassed:6, hello:7, wave:7, walk:8, play:9, jump:9};

function rabbitCanvas(w,h){
  const c=document.createElement('canvas');c.width=w;c.height=h;return c;
}
function rabbitImage(src){
  return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('토끼 이미지를 불러오지 못했습니다.'));im.src=src;});
}
function cleanRabbit(im,removeWhiteBorder=false){
  const c=rabbitCanvas(im.width,im.height),k=c.getContext('2d');k.drawImage(im,0,0);
  const image=k.getImageData(0,0,c.width,c.height),d=image.data,w=c.width,h=c.height;
  // ImageGen alpha-1 color artifacts must not bleed into the room palette.
  for(let i=0;i<d.length;i+=4)if(d[i+3]<128)d[i]=d[i+1]=d[i+2]=d[i+3]=0;
  if(removeWhiteBorder){
    // The supplied pink master has a white exterior. Only flood-connected
    // exterior whites are removed; the enclosed white rabbit stays opaque.
    const seen=new Uint8Array(w*h),queue=[];
    const visit=p=>{if(p<0||p>=w*h||seen[p])return;seen[p]=1;const i=p*4;
      if(d[i+3]===0||(d[i]>238&&d[i+1]>238&&d[i+2]>238)){d[i+3]=0;queue.push(p);}};
    for(let x=0;x<w;x++){visit(x);visit((h-1)*w+x);}
    for(let y=0;y<h;y++){visit(y*w);visit(y*w+w-1);}
    for(let q=0;q<queue.length;q++){const p=queue[q],x=p%w;
      if(x)visit(p-1);if(x<w-1)visit(p+1);visit(p-w);visit(p+w);}
  }
  k.putImageData(image,0,0);return c;
}
// All states share the original 693 x 587 coordinate space. Never fit or
// normalize individual frames: a change of expression cannot change body size.
function makeRabbitFrame(master,index,theme,atlas){
  const c=rabbitCanvas(693,693),k=c.getContext('2d');
  k.imageSmoothingEnabled=false;
  if(index&&atlas)k.drawImage(atlas,(index%5)*693,Math.floor(index/5)*693,693,693,0,0,693,693);
  else k.drawImage(master,0,106);
  return c;
}
async function loadRabbits(){
  await Promise.all(['blue','pink'].map(async theme=>{
    const master=cleanRabbit(await rabbitImage(RABBIT_ASSETS[theme].standing),theme==='pink');
    // Keep the original visible even if an expression asset cannot be loaded.
    rabbitFrames[theme]=Array.from({length:10},(_,index)=>makeRabbitFrame(master,index,theme));
    const atlas=await rabbitImage(RABBIT_ASSETS[theme].expressions);
    rabbitFrames[theme]=Array.from({length:10},(_,index)=>makeRabbitFrame(master,index,theme,atlas));
  }));
  spriteCache.clear();QK='';render();
}
function rabbitSprite(expression,theme=skin){
  const frames=rabbitFrames[theme];return frames?frames[RABBIT_STATES[expression]??0]:rabbitCanvas(64,64);
}
// Friend previews use the same rabbit artwork, never the previous cat renderer.
function drawUser(ctx,expression,f,theme){
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.imageSmoothingEnabled=false;
  ctx.drawImage(rabbitSprite(expression,theme),0,0,ctx.canvas.width,ctx.canvas.height);
}



// One half-room-pixel grid for scenery and furniture. Keep rabbit masters intact.
const ART_SCALE=2;
const ART_INK={blue:[96,114,159],pink:[184,117,152]};
const styledArtCache=new WeakMap();
function styleRoomArt(source,w,h,theme=skin){
 let variants=styledArtCache.get(source);
 if(!variants){variants=new Map();styledArtCache.set(source,variants)}
 const key=[w,h,theme].join(':');if(variants.has(key))return variants.get(key);
 const c=document.createElement('canvas');c.width=Math.round(w*ART_SCALE);c.height=Math.round(h*ART_SCALE);
 const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(source,0,0,c.width,c.height);
 const pixels=ctx.getImageData(0,0,c.width,c.height),d=pixels.data,mask=new Uint8Array(c.width*c.height);
 for(let p=0;p<mask.length;p++){
  const i=p*4;if(d[i+3]<128){d[i+3]=0;continue}d[i+3]=255;
  // Isolate the near-black generated outline, leaving wood grain and folds pale.
  mask[p]=Math.max(d[i],d[i+1],d[i+2])<145&&Math.min(d[i],d[i+1],d[i+2])<110?1:0;
  for(let j=0;j<3;j++)d[i+j]=Math.min(255,Math.round(d[i+j]/12)*12);
 }
 const ink=ART_INK[theme]||ART_INK.blue;
 for(let p=0;p<mask.length;p++){
  const x=p%c.width,y=Math.floor(p/c.width),i=p*4;
  // Close half-pixel gaps without making already-heavy window outlines thicker.
  const edge=mask[p]||(x>0&&x<c.width-1&&mask[p-1]&&mask[p+1])||(y>0&&y<c.height-1&&mask[p-c.width]&&mask[p+c.width]);
  if(edge){d[i]=ink[0];d[i+1]=ink[1];d[i+2]=ink[2];d[i+3]=255}
 }
 ctx.putImageData(pixels,0,0);variants.set(key,c);return c;
}

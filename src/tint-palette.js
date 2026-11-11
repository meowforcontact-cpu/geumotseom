// Recolor only cool-blue furniture pixels for the pink attic theme.
// The source atlas is never modified. Neutral cream, wood and green plants stay intact.
function atticFurnitureTintPixel(r,g,b,a=255){
 if(a<16||!(b>r+8&&b>=g-7))return [r,g,b,a];
 const clamp=n=>Math.max(0,Math.min(255,Math.round(n)));
 return [clamp(.9*b+.1*r),clamp(.7*r+.3*g),clamp(.5*b+.5*g),a];
}
const atticFurnitureArtCache=new WeakMap();
function atticFurnitureArt(source){
 if(!source||!(source.naturalWidth||source.width))return source;
 if(atticFurnitureArtCache.has(source))return atticFurnitureArtCache.get(source);
 const w=source.naturalWidth||source.width,h=source.naturalHeight||source.height;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 ctx.imageSmoothingEnabled=false;ctx.drawImage(source,0,0);
 const bitmap=ctx.getImageData(0,0,w,h),data=bitmap.data;
 for(let i=0;i<data.length;i+=4){
  const [r,g,b,a]=atticFurnitureTintPixel(data[i],data[i+1],data[i+2],data[i+3]);
  data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=a;
 }
 ctx.putImageData(bitmap,0,0);atticFurnitureArtCache.set(source,canvas);
 return canvas;
}

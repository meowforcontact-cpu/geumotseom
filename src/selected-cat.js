// Restored-L/G original eight directions selected by the user. Never regenerate the face.
const selectedCatImages={},selectedCatFacing={direction:'south'};
const selectedCatOriginalSprite=petSprite;
petSprite=function(kind,expression,theme=skin){
 if(kind==='cat'){
  if(pet().kind==='cat'){
   const dx=cat.tx-cat.x,dy=cat.ty-cat.y;
   if(Math.hypot(dx,dy)>.5){
    const directions=['east','south-east','south','south-west','west','north-west','north','north-east'];
    selectedCatFacing.direction=directions[(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
   }
  }
  const image=selectedCatImages[selectedCatFacing.direction];
  if(image?.naturalWidth)return image;
 }
 return selectedCatOriginalSprite(kind,expression,theme);
};
for(const [direction,url] of Object.entries(WHITEWOOD_ASSETS.cat)){
 const image=new Image();image.onload=()=>{selectedCatImages[direction]=image;spriteCache.clear();QK='';render()};image.src=url;
}

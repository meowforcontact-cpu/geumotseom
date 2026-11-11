// Fixed 4:3 world coordinates; keep all room themes and furniture on one camera.
// Coordinate units are logical game pixels, not source PNG pixels.
const ROOM_CAMERA_STANDARD=Object.freeze({width:170,height:128,floorBackY:72,petFrontY:124});
const WALL_MOUNT_FURNITURE=new Set(['cream_f2','pink_f2']);
function roomFloorBackY(height=ROOM_CAMERA_STANDARD.height){
 return Math.round(height*ROOM_CAMERA_STANDARD.floorBackY/ROOM_CAMERA_STANDARD.height);
}
function roomPlacementSurface(id){return WALL_MOUNT_FURNITURE.has(id)?'wall':'floor'}
function roomPlacementPosition(id,width,height,x,y,worldWidth=ROOM_CAMERA_STANDARD.width,worldHeight=ROOM_CAMERA_STANDARD.height){
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
 const maxX=Math.max(0,worldWidth-width),maxY=Math.max(0,worldHeight-height);
 const cut=roomFloorBackY(worldHeight);
 // A tall standing sprite may overlap the wall visually, but its feet stay on the floor.
 const minY=roomPlacementSurface(id)==='floor'?Math.max(0,cut-height):0;
 const limitY=roomPlacementSurface(id)==='wall'?Math.max(0,Math.min(maxY,cut-height)):maxY;
 return [Math.round(clamp(x,0,maxX)),Math.round(clamp(y,Math.min(minY,limitY),limitY))];
}
function roomPetFootLimits(height=ROOM_CAMERA_STANDARD.height){
 return {min:roomFloorBackY(height),max:Math.min(height-4,ROOM_CAMERA_STANDARD.petFrontY)};
}

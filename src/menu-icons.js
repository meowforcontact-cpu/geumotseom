// Extend the original filled 16×16 family. Existing artwork is reused verbatim.
function menuSprite(draw){
 const px=Array.from({length:16},()=>Array(16).fill('.'));
 const rect=(x,y,w,h,c='d')=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(px[j]?.[i]!==undefined)px[j][i]=c};
 const box=(x,y,w,h,fill='l')=>{rect(x+1,y,w-2,1);rect(x+1,y+h-1,w-2,1);rect(x,y+1,1,h-2);rect(x+w-1,y+1,1,h-2);rect(x+1,y+1,w-2,h-2,fill)};
 draw(rect,box);return px.map(row=>row.join(''));
}
Object.assign(S,{
 navAttendance:S.npaw,navShop:S.nshop,navBook:S.nbook,navProfile:S.nid,navSettings:S.ngear,navHome:S.nhouse,
 navMissions:menuSprite((r,f)=>{f(2,2,12,13);r(3,3,2,10,'k');r(12,3,1,10,'m');f(5,0,6,4,'b');r(7,1,2,1,'l');r(5,6,2,2,'b');r(8,6,3,1,'m');r(5,10,2,2,'b');r(8,10,3,1,'m')}),
 navFriends:menuSprite((r,f)=>{f(1,1,6,6,'b');r(2,2,2,1,'l');r(5,4,1,2,'m');f(9,1,6,6,'b');r(10,2,2,1,'l');r(13,4,1,2,'m');f(0,9,8,6,'b');r(2,8,4,1);r(1,10,2,3,'l');r(6,11,1,3,'m');f(8,9,8,6,'b');r(10,8,4,1);r(9,10,2,3,'l');r(14,11,1,3,'m')}),
 navMail:menuSprite((r,f)=>{f(0,3,16,11,'l');r(1,4,14,1,'b');r(3,5,10,1,'b');r(5,6,6,1,'b');r(7,7,2,1,'b');r(1,5,2,1);r(3,6,2,1);r(5,7,2,1);r(7,8,2,1);r(9,7,2,1);r(11,6,2,1);r(13,5,2,1);r(1,11,2,1,'m');r(3,10,2,1,'m');r(13,11,2,1,'m');r(11,10,2,1,'m');r(1,12,14,1,'m')}),
 navBoard:menuSprite((r,f)=>{f(0,1,16,12);r(2,3,2,8,'k');r(14,3,1,8,'m');r(4,4,8,1,'b');r(4,7,8,1,'b');r(4,10,5,1,'b');r(2,12,1,3);r(3,12,2,1,'l');r(3,13,1,1,'l');r(3,14,1,1);r(4,13,1,1)}),
 navPlaza:menuSprite((r,f)=>{r(7,0,2,8,'b');r(6,1,1,2,'l');r(3,3,3,1,'b');r(10,3,3,1,'b');r(2,4,1,3,'b');r(13,4,1,3,'b');f(2,7,12,4,'b');r(4,8,8,1,'l');r(5,11,6,2,'m');f(0,13,16,3,'l')})
});

// One native pixel family: 16×16 canvas, one-pixel outline, shared theme palette.
function menuSprite(draw){
 const px=Array.from({length:16},()=>Array(16).fill('.'));
 const rect=(x,y,w,h,c='d')=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(px[j]?.[i]!==undefined)px[j][i]=c};
 const box=(x,y,w,h)=>{rect(x,y,w,h);rect(x+1,y+1,w-2,h-2,'k')};
 draw(rect,box);return px.map(row=>row.join(''));
}
Object.assign(S,{
 navAttendance:menuSprite((r,b)=>{b(2,3,12,11);r(2,6,12,1);r(5,1,1,4);r(10,1,1,4);r(5,9,1,2,'b');r(6,11,1,1,'b');r(7,10,1,1,'b');r(8,9,1,1,'b');r(9,8,1,1,'b')}),
 navMissions:menuSprite((r,b)=>{b(3,2,10,12);r(6,1,4,2,'b');r(5,5,2,2,'b');r(8,5,3,1);r(5,9,2,2,'b');r(8,9,3,1)}),
 navShop:menuSprite((r,b)=>{b(2,5,12,9);b(5,1,6,6);r(6,4,4,3,'k');r(3,6,2,7,'l');r(11,6,2,7,'l');r(6,8,4,1,'b');r(7,9,2,2,'b')}),
 navBook:menuSprite((r,b)=>{b(1,3,7,10);b(8,3,7,10);r(7,3,2,11);r(3,5,3,1,'b');r(3,8,3,1,'b');r(10,5,3,1,'b');r(10,8,3,1,'b');r(3,2,3,1);r(10,2,3,1)}),
 navFriends:menuSprite((r,b)=>{b(2,2,5,5);b(9,2,5,5);r(3,3,3,3,'l');r(10,3,3,3,'l');b(1,9,7,5);b(8,9,7,5);r(3,8,3,1);r(10,8,3,1);r(3,10,3,3,'b');r(10,10,3,3,'b')}),
 navMail:menuSprite((r,b)=>{b(1,3,14,10);r(2,4,2,1,'b');r(4,5,2,1,'b');r(6,6,1,1,'b');r(7,7,2,1,'b');r(9,6,1,1,'b');r(10,5,2,1,'b');r(12,4,2,1,'b');r(2,11,2,1,'l');r(12,11,2,1,'l')}),
 navBoard:menuSprite((r,b)=>{b(2,2,12,10);r(4,12,1,2);r(11,12,1,2);r(4,4,3,3,'b');r(9,4,3,1);r(9,6,3,1);r(4,9,8,1,'b')}),
 navProfile:menuSprite((r,b)=>{b(1,3,14,10);b(3,5,4,4);r(4,6,2,2,'l');r(3,10,4,1,'b');r(9,5,4,1);r(9,8,4,1,'b');r(9,10,3,1,'b')}),
 navSettings:menuSprite((r,b)=>{r(6,1,4,14);r(1,6,14,4);r(3,3,10,10);r(4,4,8,8,'l');r(6,5,4,1);r(5,6,1,4);r(10,6,1,4);r(6,10,4,1);r(6,6,4,4,'k');r(7,7,2,2,'b')}),
 navHome:menuSprite((r,b)=>{b(3,7,10,7);r(1,6,14,1);r(2,5,12,1);r(3,4,10,1);r(4,3,8,1);r(5,2,6,1);r(6,1,4,1);r(4,5,8,1,'b');r(6,9,4,5);r(7,10,2,4,'l')}),
 navPlaza:menuSprite((r,b)=>{r(7,1,2,8,'b');r(4,3,2,1,'b');r(10,3,2,1,'b');r(3,4,1,3,'b');r(12,4,1,3,'b');b(3,8,10,3);r(6,11,4,2);b(1,13,14,2);r(4,9,8,1,'b')})
});

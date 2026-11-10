export const PET_PRODUCTS = [
  {id:'p2',cat:'펫',name:'강아지 알',price:500,spr:'iegg',pet:'dog',pname:'강아지'},
  {id:'p3',cat:'펫',name:'고양이 알',price:500,spr:'iegg',pet:'cat',pname:'고양이'},
  {id:'p4',cat:'펫',name:'너구리 알',price:500,spr:'iegg',pet:'raccoon',pname:'너구리'}
];
export const PET_CATALOG = [
  {kind:'white',name:'토끼'}, {kind:'angel',name:'천사냥'},
  ...PET_PRODUCTS.map(p=>({kind:p.pet,name:p.pname}))
];

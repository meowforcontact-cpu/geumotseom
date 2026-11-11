// Pet acquisition is not a 500-coin purchase.
// New accounts choose exactly one starter (dog or cat). The server must enforce this.
export const PET_PRODUCTS = [
  {id:'p2',cat:'펫',name:'강아지',price:0,spr:'iegg',pet:'dog',pname:'강아지',only:'신규 첫 선택 무료'},
  {id:'p3',cat:'펫',name:'고양이',price:0,spr:'iegg',pet:'cat',pname:'고양이',only:'신규 첫 선택 무료'},
  {id:'p4',cat:'펫',name:'너구리',price:0,spr:'iegg',pet:'raccoon',pname:'너구리',only:'가격·획득 경로 미확정'}
];
export const PET_CATALOG = [
  {kind:'white',name:'토끼'}, {kind:'angel',name:'천사냥'},
  ...PET_PRODUCTS.map(p=>({kind:p.pet,name:p.pname}))
];

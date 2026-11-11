import {readFile,writeFile} from 'node:fs/promises';
import {PET_PRODUCTS} from '../src/pet-catalog.mjs';
const original=await readFile('src/pet.html','utf8');const catalog=original.slice(original.indexOf('const ITEMS=[')+12,original.indexOf('\n];',original.indexOf('const ITEMS=['))+2);
const legacyProducts=Function('return '+catalog)();
const furnitureProducts=JSON.parse(await readFile('src/furniture-catalog.json','utf8'));
const roleCatalog=[
 {id:'title_solid',cat:'칭호',name:'단색 칭호',price:500000,spr:'crown',catalogOnly:true},
 {id:'title_gradient',cat:'칭호',name:'그라데이션 칭호',price:1500000,spr:'crown',catalogOnly:true,seasonLimit:5}
];
const products=[
 ...legacyProducts.map(p=>{
  if(p.cat==='가구'||p.id==='t1')return {...p,retired:true};
  if(p.id==='p1')return {...p,price:0,only:'일일 미션 3개 완수 누적 15일 보상'};
  return p;
 }),...PET_PRODUCTS,...furnitureProducts,...roleCatalog
];
let worker=await readFile('integration/worker.mjs','utf8');worker=worker.replace('export default createWorker();','export default createWorker({products:'+JSON.stringify(products)+'});');
worker=worker.replace("import {validateSave,snapshot} from '../src/storage.mjs';",(await readFile('src/storage.mjs','utf8')).replaceAll('export ',''));
await writeFile('integration/worker-built.mjs',worker);console.log('Discord Worker prepared. Deployment/credentials not configured.');

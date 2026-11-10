import {readFile,writeFile} from 'node:fs/promises';
import {PET_PRODUCTS} from '../src/pet-catalog.mjs';
const original=await readFile('src/pet.html','utf8');const catalog=original.slice(original.indexOf('const ITEMS=[')+12,original.indexOf('\n];',original.indexOf('const ITEMS=['))+2);
const legacyProducts=Function('return '+catalog)();
const furnitureProducts=JSON.parse(await readFile('src/furniture-catalog.json','utf8'));
const products=[...legacyProducts.map(p=>p.cat==='가구'?{...p,retired:true}:p),...PET_PRODUCTS,...furnitureProducts];
let worker=await readFile('integration/worker.mjs','utf8');worker=worker.replace('export default createWorker();','export default createWorker({products:'+JSON.stringify(products)+'});');
worker=worker.replace("import {validateSave,snapshot} from '../src/storage.mjs';",(await readFile('src/storage.mjs','utf8')).replaceAll('export ',''));
await writeFile('integration/worker-built.mjs',worker);console.log('Discord Worker prepared. Deployment/credentials not configured.');

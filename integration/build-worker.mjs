import {readFile,writeFile} from 'node:fs/promises';
const original=await readFile('src/pet.html','utf8');const catalog=original.slice(original.indexOf('const ITEMS=[')+12,original.indexOf('\n];',original.indexOf('const ITEMS=['))+2);
const products=Function('return '+catalog)();
let worker=await readFile('integration/worker.mjs','utf8');worker=worker.replace('export default createWorker();','export default createWorker({products:'+JSON.stringify(products)+'});');
worker=worker.replace("import {validateSave,snapshot} from '../src/storage.mjs';",(await readFile('src/storage.mjs','utf8')).replaceAll('export ',''));
await writeFile('integration/worker-built.mjs',worker);console.log('Discord Worker prepared. Deployment/credentials not configured.');

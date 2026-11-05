import {readdir,readFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'../assets/perfect-view');
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 const path=resolve(dir,entry.name),name=relative(root,path);
 if(/indicator-source|custom-indicators\.bundle|personal-pack|\.(?:map|pine|mq4|mq5|zip)$/.test(name))throw new Error('Private indicator file in public assets: '+name);
 if(entry.isDirectory()){await walk(path);continue;}
 if(/\.(?:mjs|js|json|txt)$/.test(name)){
  const text=await readFile(path,'utf8');
  if(/gamma2\s*=|function\s+(?:pe1|baseline|tradeState|momentumValues|qqeValues)\s*\(|sourceMappingURL/.test(text))throw new Error('Indicator calculation source in public assets: '+name);
 }
}}
await walk(root);console.log('Public chart assets contain settings, transport and rendering only.');

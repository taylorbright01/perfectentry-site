import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const imageType=/\.(?:avif|gif|jpe?g|png|webp)$/i;
const escape=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export async function collectResults(directory){
 const found=[];
 async function walk(folder){
  for(const entry of await readdir(folder,{withFileTypes:true})){
   if(entry.name.startsWith('.'))continue;
   const path=join(folder,entry.name);
   if(entry.isDirectory())await walk(path);
   else if(entry.isFile()&&imageType.test(entry.name))found.push(relative(directory,path).split('\\').join('/'));
  }
 }
 await walk(directory);
 return found.sort((a,b)=>a.localeCompare(b,'en',{numeric:true,sensitivity:'base'})||a.localeCompare(b,'en'));
}
export async function buildResults(root){
 const directory=join(root,'assets/results'),files=await collectResults(directory);
 const images=files.map((path,index)=>({src:'assets/results/'+path.split('/').map(encodeURIComponent).join('/'),alt:`Community result ${index+1}. Open full image.`}));
 const revision=createHash('sha256').update(JSON.stringify(images)).digest('hex').slice(0,16);
 const manifest={version:1,revision,images};
 await writeFile(join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 const htmlPath=join(root,'index.html'),html=await readFile(htmlPath,'utf8');
 const content=images.map(({src,alt})=>`<a class="result-slide" href="${escape(src)}"><img src="${escape(src)}" alt="${escape(alt)}" width="300" height="330" loading="lazy" decoding="async"></a>`).join('');
 if(!html.includes('<!-- pe:gallery:start -->')||!html.includes('<!-- pe:gallery:end -->'))throw Error('Homepage gallery markers are missing.');
 const withImages=html.replace(/<!-- pe:gallery:start -->[\s\S]*?<!-- pe:gallery:end -->/,`<!-- pe:gallery:start -->${content}<!-- pe:gallery:end -->`);
 await writeFile(htmlPath,withImages.replace(/\sdata-gallery-revision="[^"]*"/g,'').replace('data-results-track',`data-results-track data-gallery-revision="${revision}"`));
 return manifest;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const manifest=await buildResults(resolve(import.meta.dirname,'..'));
 console.log(`Community gallery updated: ${manifest.images.length} images.`);
}

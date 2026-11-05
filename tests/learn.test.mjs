import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {articles,published} from '../content/learn/articles.mjs';
import {routes,editorialPaths,shell} from '../scripts/site-shell.mjs';
const root=resolve(import.meta.dirname,'..');
const paths=[...new Set([...routes.map(r=>r[0]),...editorialPaths,'privacy.html','terms.html'])];
const sources=new Map(await Promise.all(paths.map(async p=>[p,await readFile(resolve(root,p),'utf8')])));

test('all local links, images, stylesheets and fragment targets resolve across the expanded site',async()=>{
 const errors=[];
 for(const [path,html] of sources){
  const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
  for(const match of markup.matchAll(/\b(?:href|src)="([^"]+)"/g)){
   const raw=match[1];if(/^(?:https?:|data:|mailto:|tel:)/.test(raw))continue;
   const url=new URL(raw,'https://test.local/'+path),rel=decodeURIComponent(url.pathname).slice(1),file=!rel||rel.endsWith('/')?rel+'index.html':rel;
   try{await stat(resolve(root,file));}catch{errors.push(path+' → '+raw);continue;}
   if(url.hash){const target=sources.get(file)||await readFile(resolve(root,file),'utf8');if(!target.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"')&&!target.includes("id='"+decodeURIComponent(url.hash.slice(1))+"'"))errors.push(path+' → missing '+raw);}
  }
 }
 assert.deepEqual(errors,[]);
});
test('articles have consistent visible authorship, dates and canonical structured data',()=>{
 for(const a of articles){
  const path='learn/'+a.slug+'/index.html',html=sources.get(path),canonical='https://perfectentry.store/learn/'+a.slug+'/';
  const data=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const post=data.find(d=>d['@type']==='BlogPosting');
  assert.equal(post.url,canonical);assert.equal(post.headline,a.title);assert.equal(post.datePublished,published);assert.equal(post.dateModified,published);
  assert.equal(post.author.url,'https://perfectentry.store/learn/taylor-bright/');
  assert(html.includes('rel="author" href="/learn/taylor-bright/"'));assert(html.includes('datetime="'+published+'"'));
  assert(html.includes('rel="canonical" href="'+canonical+'"'));assert(html.includes(a.answer.replaceAll('&','&amp;')));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);assert(!html.includes('noindex'));
  assert(html.includes(shell(path).header));assert(html.includes(shell(path).footer));
 }
});
test('hub and sitemap expose every canonical article once without listing the university page',async()=>{
 const sitemap=await readFile(resolve(root,'sitemap.xml'),'utf8'),hub=sources.get('learn/index.html');
 const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
 assert.equal(urls.length,new Set(urls).size);assert(!sitemap.includes('0-1m.html'));
 for(const a of articles){const url='https://perfectentry.store/learn/'+a.slug+'/';assert(urls.includes(url));assert(hub.includes('href="/learn/'+a.slug+'/"'));}
});
test('Learn generation is repeatable and does not duplicate sitemap entries',async()=>{
 const files=[...editorialPaths,'learn/index.html','learn/feed.xml','sitemap.xml'];
 const before=await Promise.all(files.map(f=>readFile(resolve(root,f),'utf8')));
 execFileSync(process.execPath,['scripts/build-learn.mjs'],{cwd:root});
 const after=await Promise.all(files.map(f=>readFile(resolve(root,f),'utf8')));
 assert.deepEqual(after,before);
});

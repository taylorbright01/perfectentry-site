import {packCalculation,unpackResult} from './study-wire.mjs';
// Browser code contains settings and chart output only. All proprietary
// calculations execute in the Worker, including for imported candle files.
export class RemoteStudies {
 constructor(url,{fetchImpl=globalThis.fetch,token=()=>null,limitBytes=24*1024*1024}={}){this.url=url;this.fetch=(...args)=>fetchWithBusyRetry(fetchImpl,args);this.token=token;this.cache=new Map();this.requirementCache=new Map();this.requirementInflight=new Map();this.bytes=0;this.limitBytes=limitBytes;}
 async historyRequirements(studies,timeframe,{signal}={}){
  signal?.throwIfAborted();
  const body=JSON.stringify({timeframe,studies:studies.filter(study=>study.enabled!==false).map(study=>Object.fromEntries(Object.entries(study).filter(([key])=>!['key','name','enabled'].includes(key)).sort(([a],[b])=>a.localeCompare(b))))});
  if(this.requirementCache.has(body))return this.requirementCache.get(body);
  let pending=this.requirementInflight.get(body);
  if(!pending){
   const token=this.token();
   pending=(async()=>{
    const response=await this.fetch(this.url.replace(/\/calculate$/,'/requirements'),{method:'POST',credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body,signal:AbortSignal.timeout(15000)});
    const value=await response.json();
    if(!response.ok)throw new Error(value.error??'Indicator history settings could not be loaded.');
    if(!Array.isArray(value.requirements)||value.requirements.length>256||value.requirements.some(req=>!Number.isInteger(req.timeframe)||req.timeframe<30||req.timeframe>604800||!Number.isInteger(req.bars)||req.bars<1||req.bars>100000))throw new Error('Invalid indicator history settings.');
    this.requirementCache.set(body,value.requirements);
    while(this.requirementCache.size>64)this.requirementCache.delete(this.requirementCache.keys().next().value);
    return value.requirements;
   })();
   this.requirementInflight.set(body,pending);
   pending.then(()=>this.requirementInflight.delete(body),()=>this.requirementInflight.delete(body));
  }
  // A short shared settings request can finish after a chart change. It may
  // populate this bounded cache, but an aborted caller cannot update its UI.
  const requirements=await pending;signal?.throwIfAborted();return requirements;
 }
 async calculate(payload,{signal,previous}={}){
  const request={...payload,...(payload.study?{study:Object.fromEntries(Object.entries(payload.study).filter(([key])=>!['key','name','enabled'].includes(key)).sort(([a],[b])=>a.localeCompare(b)))}:{})};
  const body=JSON.stringify(packCalculation(request)),digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body));
  signal?.throwIfAborted();
  const key=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  if(previous?.requestKey===key)return previous;
  const cached=this.cache.get(key);
  if(cached){this.cache.delete(key);this.cache.set(key,cached);return unpackResult(cached.value);}
  const token=this.token();
  const timeout=AbortSignal.timeout(90000),combined=signal?AbortSignal.any([signal,timeout]):timeout;
  const response=await this.fetch(this.url,{method:'POST',credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body,signal:combined});
  const stored=await response.json();let value=stored;
  if(!response.ok)throw new Error(value.error??'Indicator calculation is temporarily unavailable.');
  stored.requestKey=key;
  value=unpackResult(stored);
  if(!value.model||!value.history)throw new Error('Invalid indicator response.');
  signal?.throwIfAborted();
  value.requestKey=key;
  const size=JSON.stringify(stored).length*2;
  if(size<=this.limitBytes){this.cache.set(key,{value:stored,size});this.bytes+=size;while(this.bytes>this.limitBytes){const oldest=this.cache.keys().next().value;this.bytes-=this.cache.get(oldest).size;this.cache.delete(oldest);}}
  return value;
 }
}
export function outputWindow(bars,end,count){
 if(!bars.length)return null;
 const last=Math.min(bars.length-1,Math.max(0,Math.ceil(end)+127));
 const first=Math.max(0,Math.floor(end-count)-128,last-2047);
 return {from:bars[first].time,to:bars[last].time};
}
export function sourceDatasets(study,context,timeframe){
 const needed=new Set(Object.entries(study).filter(([key,value])=>/timeframe$/i.test(key)&&Number.isFinite(value)&&value>0).map(([,value])=>value*60));
 if(Object.entries(study).some(([key,value])=>/Calendar$/.test(key)&&value!=='minutes'))needed.add(86400);
 needed.delete(timeframe);
 return [...needed].map(tf=>({baseTimeframe:tf,candles:context.getBars(tf)})).filter(data=>data.candles.length);
}
// Preserve the full earlier prefix. Keep future bars needed by negative plot
// offsets and confirmed pivots, counted as candles so weekend gaps are safe.
export function historyPrefix(rows,to,study){
 // These labels are anchored to the latest swing, rather than historical bars.
 if(study.id==='pe_baseline'&&['showFibHigh','showFibLow','showFib236','showFib382','showFib618','showFib786'].some(key=>study[key]!==false))return rows;
 const future=2+Object.entries(study).reduce((sum,[key,value])=>sum+(Number.isInteger(value)&&(/offset$/i.test(key)&&value<0||/right$/i.test(key)&&value>0)?Math.abs(value):0),0);
 let lo=0,hi=rows.length;while(lo<hi){const mid=(lo+hi)>>1;if(rows[mid].time<=to)lo=mid+1;else hi=mid;}
 return rows.slice(0,Math.min(rows.length,lo+future));
}

function waitForRetry(milliseconds,signal){
 return new Promise((resolve,reject)=>{
  signal?.throwIfAborted();
  const cleanup=()=>signal?.removeEventListener('abort',cancel);
  const cancel=()=>{clearTimeout(timer);cleanup();reject(signal.reason??new DOMException('Aborted','AbortError'));};
  const timer=setTimeout(()=>{cleanup();resolve();},milliseconds);
  signal?.addEventListener('abort',cancel,{once:true});
 });
}
export async function fetchWithBusyRetry(fetchImpl,args,{wait=waitForRetry}={}){
 const signal=args[1]?.signal;
 for(let attempt=0;;attempt++){
  signal?.throwIfAborted();
  const response=await fetchImpl.apply(globalThis,args);
  if(response.status!==503||attempt>=4)return response;
  const body=await response.clone().json().catch(()=>({}));
  if(typeof body.error!=='string'||!body.error.startsWith('Calculation server is busy'))return response;
  await wait(1000*2**attempt,signal);
 }
}

// Generic transport only: no indicator calculations or proprietary rules.
const WIRE='pv1', MAX_ROWS=100000, MAX_TOTAL=200000;
export function packCalculation(input){
 const rows=values=>values.map(b=>[b.time,b.open,b.high,b.low,b.close,b.volume??0]);
 return {...input,wire:WIRE,bars:rows(input.bars),datasets:(input.datasets??[]).map(d=>({...d,candles:rows(d.candles)}))};
}
export function unpackCalculation(input){
 if(input?.wire!==WIRE){if(input?.wire!==undefined)throw new Error('Unsupported candle transport.');return input;}
 const sources=input.datasets;
 if(!Array.isArray(input.bars)||input.bars.length>MAX_ROWS||!Array.isArray(sources)||sources.length>16||sources.some(d=>!Array.isArray(d?.candles)||d.candles.length>MAX_ROWS)||input.bars.length+sources.reduce((n,d)=>n+d.candles.length,0)>MAX_TOTAL)throw new Error('Invalid compact candle history.');
 const rows=values=>values.map(r=>{if(!Array.isArray(r)||r.length!==6)throw new Error('Invalid compact candle.');return {time:r[0],open:r[1],high:r[2],low:r[3],close:r[4],volume:r[5]};});
 return {...input,bars:rows(input.bars),datasets:sources.map(d=>({...d,candles:rows(d.candles)}))};
}
function mapSeries(model,convert){
 return {...model,lines:(model.lines??[]).map(l=>({...l,points:convert(l.points)})),histograms:(model.histograms??[]).map(l=>({...l,points:convert(l.points)})),fills:(model.fills??[]).map(f=>({...f,upper:convert(f.upper),lower:convert(f.lower)}))};
}
export function packResult(result){
 const timelines=[],indices=new Map();
 const convert=points=>{
  const times=points.map(p=>p.time),key=JSON.stringify(times);let t=indices.get(key);
  if(t===undefined){t=timelines.length;indices.set(key,t);timelines.push(times);}
  const v=points.map(p=>p.value);let extras;
  for(let i=0;i<points.length;i++){
   let extra;for(const key in points[i])if(key!=='time'&&key!=='value'){extra??={};extra[key]=points[i][key];}
   if(extra){extras??=Array(points.length).fill(null);extras[i]=extra;}
  }
  return {t,v,...(extras?{extras}:{})};
 };
 return {...result,wire:WIRE,model:mapSeries(result.model,convert),timelines};
}
export function unpackResult(result){
 if(result?.wire!==WIRE)return result;
 const convert=series=>{
  const times=result.timelines?.[series?.t];
  if(!Array.isArray(times)||!Array.isArray(series.v)||times.length!==series.v.length||(series.extras&&series.extras.length!==times.length))throw new Error('Invalid compact indicator response.');
  return times.map((time,i)=>({time,value:series.v[i],...(series.extras?.[i]??{})}));
 };
 const {wire,timelines,...rest}=result;
 return {...rest,model:mapSeries(result.model,convert)};
}

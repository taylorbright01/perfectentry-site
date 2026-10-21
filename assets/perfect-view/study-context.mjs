// Build higher-timeframe inputs only from complete source buckets. A missing
// minute is not interpolated and cannot silently become a complete HTF candle.
export function completeStudyBars(bars,timeframe,baseTimeframe,now=Date.now()/1000){
 if(!Number.isInteger(timeframe)||timeframe<baseTimeframe||timeframe%baseTimeframe)return [];
 const out=[];let group;
 for(const bar of bars){const time=Math.floor(bar.time/timeframe)*timeframe;
  if(!group||group.time!==time){group={...bar,time,count:1,first:bar.time,last:bar.time};out.push(group);}
  else{group.high=Math.max(group.high,bar.high);group.low=Math.min(group.low,bar.low);group.close=bar.close;group.volume+=bar.volume;group.count++;group.last=bar.time;}
 }
 return out.filter(b=>b.time+timeframe<=now&&b.count===timeframe/baseTimeframe&&b.first===b.time&&b.last===b.time+timeframe-baseTimeframe).map(({count,first,last,...b})=>b);
}
export function createStudyContext(bars,timeframe,datasets=[],now=Date.now()/1000){
 const cache=new Map([[timeframe,bars]]);
 return {timeframe,now,getBars(tf){if(cache.has(tf))return cache.get(tf);
  const candidates=[{baseTimeframe:timeframe,candles:bars},...datasets].filter(d=>d&&d.baseTimeframe<=tf&&tf%d.baseTimeframe===0).sort((a,b)=>b.baseTimeframe-a.baseTimeframe);
  const merged=new Map();for(const data of candidates)for(const b of completeStudyBars(data.candles,tf,data.baseTimeframe,now))merged.set(b.time,b);
  const result=[...merged.values()].sort((a,b)=>a.time-b.time).slice(-100000);cache.set(tf,result);return result;
 }};
}
export function studyRequirements(studies,registry,chartTimeframe){
 const needs=new Map();for(const study of studies){if(study.enabled===false)continue;const d=registry.definitions.get(study.id);if(!d)continue;
  const requirements=d.historyRequirements?.(study,chartTimeframe)??[{timeframe:chartTimeframe,bars:Math.max(40,d.warmupBars?.(study)??40)}];
  for(const r of requirements)if(Number.isInteger(r.timeframe)&&r.timeframe>=30&&Number.isFinite(r.bars))needs.set(r.timeframe,Math.min(100000,Math.max(needs.get(r.timeframe)??40,r.bars+40)));
 }return needs;
}

const DAY=86400,HOUR=3600;

// UTC days, matching the existing archive. Only actual closed hourly candles
// contribute prices or volume; a missing hour is never filled synthetically.
export function dailyFromHours(hours,{now=Date.now()/1000,coverage=[]}={}) {
 const unique=new Map(hours.map(bar=>[bar.time,bar])),days=new Map();
 const ranges=Array.isArray(coverage)?coverage.filter(r=>Array.isArray(r)&&r.length===2&&r.every(Number.isSafeInteger)&&r[1]>r[0]).sort((a,b)=>a[0]-b[0]):[];
 for(const bar of [...unique.values()].sort((a,b)=>a.time-b.time)){
  const time=Math.floor(bar.time/DAY)*DAY;
  if(bar.time%HOUR||bar.time+HOUR>now||time+DAY>now)continue;
  let day=days.get(time);
  if(!day){day={...bar,time,reconstructedFrom:HOUR,sourceBars:0,coverageComplete:false};days.set(time,day);}
  day.high=Math.max(day.high,bar.high);day.low=Math.min(day.low,bar.low);
  day.close=bar.close;day.volume=(day.sourceBars?day.volume:0)+bar.volume;day.sourceBars++;
 }
 for(const day of days.values()){
  let through=day.time;
  for(const [start,end] of ranges){if(start>through)break;if(end>through)through=end;if(through>=day.time+DAY)break;}
  day.coverageComplete=day.sourceBars===24||through>=day.time+DAY;
 }
 return [...days.values()];
}

export function dailySourceLabel(bar){
 return bar?.reconstructedFrom===HOUR?`Rebuilt from ${bar.sourceBars} hourly candles${bar.coverageComplete?'':' · coverage unverified'}`:'';
}

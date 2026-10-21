// Rendering primitives shared by built-in studies and authenticated study bundles.
export function drawStudyLine(c,line,x,y,visible){
 c.save();c.lineWidth=line.width??1.5;c.globalAlpha=line.opacity??1;
 if(line.ticks||line.dots){for(const p of line.points??[]){if(!Number.isFinite(p.value)||!Number.isFinite(p.time)||!visible(p))continue;c.strokeStyle=p.color??line.color??'#ffffff';c.fillStyle=c.strokeStyle;c.beginPath();if(line.dots){c.arc(x(p.time),y(p.value),Math.max(.8,(line.width??1)/2),0,Math.PI*2);c.fill();}else{c.moveTo(x(p.time)-3,y(p.value));c.lineTo(x(p.time)+3,y(p.value));c.stroke();}}c.restore();return;}
 let prior=null;
 for(const p of line.points??[]){
  if(!Number.isFinite(p.time)||!Number.isFinite(p.value)){prior=null;continue;}
  if(prior&&(visible(p)||visible(prior))){c.strokeStyle=p.color??line.color??'#b4a2ff';c.beginPath();c.moveTo(x(prior.time),y(prior.value));if(line.step)c.lineTo(x(p.time),y(prior.value));c.lineTo(x(p.time),y(p.value));c.stroke();}
  prior=p;
 }
 c.restore();
}
export function drawStudyFills(c,fills,x,y,visible){
 for(const fill of fills??[]){c.save();c.globalAlpha=fill.opacity??.25;
  for(let i=1;i<(fill.upper??[]).length;i++){
   const a=fill.upper[i-1],b=fill.upper[i],d=fill.lower?.[i],e=fill.lower?.[i-1];
   if(![a,b,d,e].every(p=>p&&Number.isFinite(p.time)&&Number.isFinite(p.value))||a.time!==e.time||b.time!==d.time||!visible(a)&&!visible(b))continue;
   c.fillStyle=fill.colors?.[i]??fill.color??'#80cec6';c.beginPath();c.moveTo(x(a.time),y(a.value));c.lineTo(x(b.time),y(b.value));c.lineTo(x(d.time),y(d.value));c.lineTo(x(e.time),y(e.value));c.closePath();c.fill();
  }c.restore();
 }
}

const track=document.querySelector('[data-results-track]');
if(track){
 const previous=document.querySelector('[data-gallery-previous]'),next=document.querySelector('[data-gallery-next]'),count=document.querySelector('[data-gallery-count]');
 const dialog=document.querySelector('#result-dialog'),fullImage=dialog.querySelector('img'),caption=dialog.querySelector('[data-result-caption]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let selected=0;
 const slides=()=>[...track.querySelectorAll('.result-slide')];
 function update(){
  const items=slides(),max=Math.max(0,track.scrollWidth-track.clientWidth);
  previous.disabled=track.scrollLeft<=2;next.disabled=track.scrollLeft>=max-2;
  count.textContent=items.length===1?'1 member submission':`${items.length} member submissions`;
 }
 function move(direction){const step=slides()[0]?.getBoundingClientRect().width??300;track.scrollBy({left:direction*(step+20),behavior:reduced.matches?'instant':'smooth'});}
 previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 track.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(track);
 track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
 function show(index){const items=slides();if(!items.length)return;selected=(index+items.length)%items.length;fullImage.src=items[selected].href;fullImage.alt=`Community result ${selected+1} of ${items.length}`;caption.textContent=`Member submission ${selected+1} of ${items.length}`;if(!dialog.open)dialog.showModal();}
 track.addEventListener('click',event=>{const link=event.target.closest('.result-slide');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();show(slides().indexOf(link));});
 dialog.querySelector('[data-result-close]').addEventListener('click',()=>dialog.close());
 dialog.querySelector('[data-result-previous]').addEventListener('click',()=>show(selected-1));dialog.querySelector('[data-result-next]').addEventListener('click',()=>show(selected+1));
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(selected+(event.key==='ArrowRight'?1:-1));}});
 update();
 // The generated HTML is the fallback. A fresh manifest adds newly uploaded images.
 const manifestUrl=new URL('../results/manifest.json',import.meta.url);manifestUrl.searchParams.set('v',track.dataset.galleryRevision??'current');
 fetch(manifestUrl,{cache:'no-store'}).then(response=>{if(!response.ok)throw Error('Gallery unavailable');return response.json();}).then(manifest=>{
  if(manifest.version!==1||!Array.isArray(manifest.images))return;
  if(track.dataset.galleryRevision&&manifest.revision!==track.dataset.galleryRevision)return;
  const entries=manifest.images.filter(item=>{
   if(typeof item.src!=='string'||!/^assets\/results\//.test(item.src)||!/^\.(?:avif|gif|jpe?g|png|webp)$/i.test('.'+item.src.split('.').at(-1)))return false;
   const url=new URL(item.src,location.href);return url.origin===location.origin&&url.pathname.startsWith(new URL('./assets/results/',location.href).pathname);
  });
  if(!entries.length&&manifest.images.length)return;
  const current=slides().map(item=>item.getAttribute('href'));
  if(JSON.stringify(current)!==JSON.stringify(entries.map(item=>item.src))){
   const fragment=document.createDocumentFragment();
   entries.forEach((item,index)=>{const link=document.createElement('a'),img=document.createElement('img');link.className='result-slide';link.href=item.src;img.src=item.src;img.alt=`Community result ${index+1}. Open full image.`;img.width=300;img.height=330;img.loading='lazy';img.decoding='async';link.append(img);fragment.append(link);});
   track.replaceChildren(fragment);update();
  }
 }).catch(()=>{});
}

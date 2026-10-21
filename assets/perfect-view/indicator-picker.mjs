// Keep long indicator catalogues inside the dialog, independent of OS select menus.
export function createIndicatorPicker(select,input,list,container){
 let visible=[],active=-1;
 const options=()=>Array.from(select.options);
 function close(){list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');}
 function refresh(){input.value=select.selectedOptions[0]?.textContent??'';input.disabled=select.disabled;close();}
 function highlight(index){
  active=index;
  Array.from(list.querySelectorAll('[role=option]')).forEach((row,i)=>row.dataset.active=String(i===active));
  const row=list.children[active];
  if(row){input.setAttribute('aria-activedescendant',row.id);row.scrollIntoView?.({block:'nearest'});}else input.removeAttribute('aria-activedescendant');
 }
 function choose(index){
  const option=visible[index];if(!option)return;
  select.value=option.value;select.dispatchEvent(new select.ownerDocument.defaultView.Event('change',{bubbles:true}));refresh();
 }
 function show(query=''){
  if(input.disabled)return;
  visible=options().filter(o=>o.textContent.toLocaleLowerCase().includes(query.toLocaleLowerCase()));list.replaceChildren();
  for(const [index,option] of visible.entries()){
   const row=list.ownerDocument.createElement('div');row.id=list.id+'-'+index;row.setAttribute('role','option');row.setAttribute('aria-selected',String(option.value===select.value));row.textContent=option.textContent;
   row.addEventListener('pointerdown',event=>event.preventDefault());row.addEventListener('click',()=>choose(index));list.append(row);
  }
  if(!visible.length){const empty=list.ownerDocument.createElement('div');empty.className='indicator-picker-empty';empty.textContent='No indicators found';list.append(empty);}
  list.hidden=false;input.setAttribute('aria-expanded','true');highlight(visible.length?Math.max(0,visible.findIndex(o=>o.value===select.value)):-1);
 }
 input.addEventListener('focus',()=>{show();input.select();});
 input.addEventListener('click',()=>{if(list.hidden)show();});
 input.addEventListener('input',()=>show(input.value));
 input.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();if(list.hidden){show();return;}
   if(visible.length)highlight((active+(event.key==='ArrowDown'?1:-1)+visible.length)%visible.length);
  }else if(event.key==='Enter'&&!list.hidden){event.preventDefault();choose(active);}
  else if(event.key==='Escape'&&!list.hidden){event.preventDefault();event.stopPropagation();refresh();}
  else if(event.key==='Tab')refresh();
 });
 input.addEventListener('blur',refresh);
 select.addEventListener('change',refresh);
 container.ownerDocument.addEventListener('pointerdown',event=>{if(!container.contains(event.target))refresh();});
 container.closest('dialog')?.addEventListener('close',refresh);
 refresh();return {refresh,close};
}

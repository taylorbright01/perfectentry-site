// Native details keep navigation usable without JavaScript.
const menus=[...document.querySelectorAll('.pe-dropdown,.pe-mobile')];
menus.forEach(menu=>menu.addEventListener('toggle',()=>{if(menu.open)menus.forEach(other=>{if(other!==menu)other.open=false;});}));
document.addEventListener('click',event=>{if(!event.target.closest('.pe-header'))menus.forEach(menu=>menu.open=false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const open=menus.find(menu=>menu.open);menus.forEach(menu=>menu.open=false);open?.querySelector('summary')?.focus();}});
menus.forEach(menu=>menu.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false;}));

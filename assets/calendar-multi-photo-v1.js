(()=>{
 const isEnglish=location.pathname.startsWith('/en/')||document.documentElement.lang==='en';
 const t=isEnglish?{
  upload:'Upload photos',count:n=>`${n}/5 photos`,remove:'Delete selected',reset:'Reset layout',limit:'You can add up to 5 photos per month.',bad:'Please choose image files only.',photo:i=>`Calendar photo ${i}`
 }:{
  upload:'העלאת תמונות',count:n=>`${n}/5 תמונות`,remove:'מחיקת תמונה נבחרת',reset:'איפוס סידור',limit:'ניתן להוסיף עד 5 תמונות לכל חודש.',bad:'אפשר לבחור קובצי תמונה בלבד.',photo:i=>`תמונה ${i} ללוח השנה`
 };
 const months=new Map(); let activeKey=''; let selected=''; let scheduled=false; let gesture=null; let frame=0;
 const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`;
 function key(){return document.querySelector('.calendar-preview-frame .calendar-sheet-title')?.textContent?.trim()||'current';}
 function current(){activeKey=key();if(!months.has(activeKey))months.set(activeKey,[]);return months.get(activeKey)}
 function uploadInput(){return [...document.querySelectorAll('input[type=file][accept*="image"]')].find(el=>el.closest('.calendar-builder'))}
 function notify(message){const box=document.createElement('div');box.className='calendar-photo-notice';box.setAttribute('role','status');box.textContent=message;document.body.append(box);setTimeout(()=>box.remove(),2600)}
 function controls(input){let box=document.querySelector('.calendar-multi-photo-controls');if(!box){box=document.createElement('div');box.className='calendar-multi-photo-controls';box.innerHTML='<span class="calendar-multi-photo-count"></span><button type="button" data-photo-remove></button><button type="button" data-photo-reset></button>';input.closest('label')?.after(box);box.querySelector('[data-photo-remove]').addEventListener('click',()=>{if(!selected)return;months.set(activeKey,current().filter(x=>x.id!==selected));selected='';render()});box.querySelector('[data-photo-reset]').addEventListener('click',()=>{current().forEach((p,i)=>Object.assign(p,{x:4+(i%3)*31,y:i<3?8:52,w:27,h:38}));render()})} const list=current();box.querySelector('.calendar-multi-photo-count').textContent=t.count(list.length);const del=box.querySelector('[data-photo-remove]');del.textContent=t.remove;del.disabled=!selected;box.querySelector('[data-photo-reset]').textContent=t.reset;}
 function read(file){return new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(typeof r.result==='string'?r.result:'');r.onerror=()=>resolve('');r.readAsDataURL(file)})}
 async function pick(e){const files=[...(e.target.files||[])];if(!files.length)return;const valid=files.filter(f=>f.type.startsWith('image/'));if(valid.length!==files.length)notify(t.bad);const list=current(),room=5-list.length;if(room<=0){notify(t.limit);e.target.value='';return}if(valid.length>room)notify(t.limit);const data=await Promise.all(valid.slice(0,room).map(read));data.filter(Boolean).forEach((src,i)=>list.push({id:uid(),src,x:4+((list.length+i)%3)*31,y:(list.length+i)<3?8:52,w:27,h:38}));selected=list.at(-1)?.id||'';e.target.value='';render()}
 function bind(item,p,stage){
  const select=()=>{selected=p.id;stage.querySelectorAll('.calendar-multi-photo-item').forEach(x=>x.classList.toggle('is-selected',x===item));const del=document.querySelector('[data-photo-remove]');if(del)del.disabled=false};
  const begin=(e,mode)=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.stopPropagation();select();const rect=stage.getBoundingClientRect();gesture={pointerId:e.pointerId,mode,item,p,stage,rect,sx:e.clientX,sy:e.clientY,ox:p.x,oy:p.y,ow:p.w,oh:p.h};try{item.setPointerCapture(e.pointerId)}catch(_){} };
  item.addEventListener('pointerdown',e=>{if(e.target.closest('.calendar-multi-photo-resize'))return;begin(e,'move')});
  item.querySelector('.calendar-multi-photo-resize').addEventListener('pointerdown',e=>begin(e,'resize'));
 }
 function updateGesture(e){
  const g=gesture;if(!g||e.pointerId!==g.pointerId)return;e.preventDefault();
  const dx=(e.clientX-g.sx)/g.rect.width*100,dy=(e.clientY-g.sy)/g.rect.height*100;
  if(g.mode==='move'){g.p.x=Math.max(0,Math.min(100-g.p.w,g.ox+dx));g.p.y=Math.max(0,Math.min(100-g.p.h,g.oy+dy))}
  else{g.p.w=Math.max(12,Math.min(100-g.p.x,g.ow+dx));g.p.h=Math.max(15,Math.min(100-g.p.y,g.oh+dy))}
  if(frame)return;frame=requestAnimationFrame(()=>{frame=0;if(!gesture)return;g.item.style.left=`${g.p.x}%`;g.item.style.top=`${g.p.y}%`;g.item.style.width=`${g.p.w}%`;g.item.style.height=`${g.p.h}%`})
 }
 function endGesture(e){if(!gesture||e.pointerId!==gesture.pointerId)return;updateGesture(e);const g=gesture;gesture=null;try{g.item.releasePointerCapture(e.pointerId)}catch(_){}g.stage.dataset.signature='';}
 window.addEventListener('pointermove',updateGesture,{passive:false,capture:true});
 window.addEventListener('pointerup',endGesture,{passive:false,capture:true});
 window.addEventListener('pointercancel',endGesture,{passive:false,capture:true});
 function render(){if(gesture)return;const input=uploadInput();if(!input)return;input.multiple=true;input.accept='image/png,image/jpeg,image/webp,image/gif';const label=input.closest('label');if(label){[...label.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).forEach(n=>n.textContent=` ${t.upload}`)}controls(input);document.querySelectorAll('.calendar-photo-wrap').forEach((wrap,wi)=>{const sheet=wrap.closest('.hebrew-calendar-sheet'),sheetKey=sheet?.querySelector('.calendar-sheet-title')?.textContent?.trim()||activeKey,list=months.get(sheetKey)||[],signature=JSON.stringify([sheetKey,list.map(p=>[p.id,p.x,p.y,p.w,p.h]),wi===0?selected:'']);let stage=wrap.querySelector('.calendar-multi-photo-stage');if(!list.length){stage?.remove();return}if(stage?.dataset.signature===signature)return;if(!stage){stage=document.createElement('div');stage.className='calendar-multi-photo-stage';wrap.append(stage)}stage.dataset.signature=signature;stage.replaceChildren();list.forEach((p,i)=>{const item=document.createElement('div');item.className=`calendar-multi-photo-item${p.id===selected&&wi===0?' is-selected':''}`;item.style.cssText=`left:${p.x}%;top:${p.y}%;width:${p.w}%;height:${p.h}%`;item.innerHTML=`<img alt="${t.photo(i+1)}"><span class="calendar-multi-photo-resize" aria-label="${isEnglish?'Resize photo':'שינוי גודל התמונה'}"></span>`;item.querySelector('img').src=p.src;stage.append(item);if(wi===0)bind(item,p,stage)})})}
 function init(){const input=uploadInput();if(input&&!input.dataset.multiPhoto){input.dataset.multiPhoto='true';input.addEventListener('change',pick,true)}const next=key();if(next!==activeKey){activeKey=next;selected=''}render()}
 new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(!gesture)init()})}).observe(document.documentElement,{subtree:true,childList:true});init();
})();

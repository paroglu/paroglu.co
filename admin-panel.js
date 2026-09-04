(() => {
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let cache={projects:[],brands:[],briefs:[],content:[],media:[],assistant:[]};
  const client=()=>window.PMSupabase;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  function navInit(){
    $$('.admin-nav button').forEach(btn=>btn.addEventListener('click',()=>{
      $$('.admin-nav button').forEach(b=>b.classList.remove('active'));$$('.admin-view').forEach(v=>v.classList.remove('active'));
      btn.classList.add('active');$('#'+btn.dataset.target)?.classList.add('active');
    }));
  }
  function metrics(){
    if($('#metricProjects')) $('#metricProjects').textContent=cache.projects.length;
    if($('#metricMedia')) $('#metricMedia').textContent=cache.media.length;
    if($('#metricBrands')) $('#metricBrands').textContent=cache.brands.length;
    if($('#metricNew')) $('#metricNew').textContent=cache.briefs.filter(x=>x.status==='Yeni').length;
  }
  function formObj(form){return Object.fromEntries(new FormData(form).entries())}
  function setForm(form,obj){Object.keys(obj||{}).forEach(k=>{if(form.elements[k] && form.elements[k].type!=='file') form.elements[k].value=String(obj[k]??'')})}
  function safeName(name='file'){const ext=(name.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'');const base=name.replace(/\.[^.]+$/,'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'file';return `${Date.now()}-${Math.random().toString(36).slice(2,9)}-${base}.${ext}`}
  async function uploadOriginal(file,folder='library'){
    if(!file) return null; const sb=client(); const path=`${folder}/${safeName(file.name)}`;
    const {error}=await sb.storage.from('media').upload(path,file,{cacheControl:'31536000',upsert:false,contentType:file.type||undefined}); if(error) throw error;
    const {data}=sb.storage.from('media').getPublicUrl(path); return {url:data.publicUrl,path};
  }

  function renderProjects(){const body=$('#projectRows');if(!body)return;body.innerHTML=cache.projects.map(x=>`<tr><td>${esc(x.category||'—')}${x.content_type?`<br><small>${esc(x.content_type)}</small>`:''}</td><td><strong>${esc(x.title)}</strong>${x.client?`<br><small>${esc(x.client)}</small>`:''}</td><td>${esc(x.ratio||'—')}</td><td>${x.published?'Yayında':'Taslak'}${x.featured?' · Öne çıkan':''}</td><td><button data-edit-project="${x.id}">Düzenle</button> <button data-del-project="${x.id}">Sil</button></td></tr>`).join('')}
  function renderBrands(){const body=$('#brandRows');if(!body)return;body.innerHTML=cache.brands.map(x=>`<tr><td>${x.logo_url?`<div class="admin-media-preview"><img src="${esc(x.logo_url)}" alt=""></div>`:'—'}</td><td>${esc(x.name)}</td><td>${esc(x.row_no||1)}</td><td>${esc(x.sort_order||0)}</td><td><button data-edit-brand="${x.id}">Düzenle</button> <button data-del-brand="${x.id}">Sil</button></td></tr>`).join('')}
  function renderBriefs(){const body=$('#briefRows');if(!body)return;body.innerHTML=cache.briefs.map(x=>`<tr><td>${esc(x.company||x.name||'İsimsiz')}</td><td>${esc(x.service||'—')}</td><td>${esc(x.budget||'—')}</td><td><select data-brief-status="${x.id}"><option ${x.status==='Yeni'?'selected':''}>Yeni</option><option ${x.status==='Görüşüldü'?'selected':''}>Görüşüldü</option><option ${x.status==='Teklif Verildi'?'selected':''}>Teklif Verildi</option><option ${x.status==='Onaylandı'?'selected':''}>Onaylandı</option><option ${x.status==='Arşiv'?'selected':''}>Arşiv</option></select></td><td><button data-view-brief="${x.id}">Detay</button></td></tr>`).join('')}
  function renderContent(){
    const body=$('#contentRows');if(!body)return;body.innerHTML=cache.content.map(x=>`<tr><td>${esc(x.section||'—')}</td><td>${esc(x.label||x.key)}</td><td style="max-width:520px"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:520px">${esc(x.value||'')}</div><small>${esc(x.key)}</small></td><td><button data-edit-content="${esc(x.key)}">Düzenle</button></td></tr>`).join('');
    const q=$('#quickContentForm');if(q){const map=Object.fromEntries(cache.content.map(x=>[x.key,x.value]));[...q.elements].forEach(el=>{if(el.name&&map[el.name]!=null)el.value=map[el.name]})}
  }
  function renderMedia(){const body=$('#mediaRows');if(!body)return;body.innerHTML=cache.media.map(x=>{const isVid=x.media_type==='video';return `<tr><td><div class="admin-media-preview">${isVid?`<video src="${esc(x.file_url)}" muted></video>`:`<img src="${esc(x.file_url)}" alt="">`}</div></td><td>${esc(x.title||x.file_name||'Medya')}</td><td>${esc(x.media_type)} · ${esc(x.ratio)}</td><td><small>${Math.round((Number(x.file_size)||0)/1024/1024*10)/10} MB</small></td><td><button data-copy-url="${esc(x.file_url)}">URL Kopyala</button> <button data-del-media="${x.id}" data-path="${esc(x.storage_path)}">Sil</button></td></tr>`}).join('')}
  function renderAssistant(){const body=$('#assistantRows');if(!body)return;body.innerHTML=cache.assistant.map(x=>`<tr><td>${esc(x.category||'Genel')}</td><td><strong>${esc(x.question||'')}</strong><br><small>${esc((x.answer||'').slice(0,110))}${(x.answer||'').length>110?'…':''}</small></td><td>${esc(x.keywords||'—')}</td><td><button data-edit-assistant="${x.id}">Düzenle</button> <button data-del-assistant="${x.id}">Sil</button></td></tr>`).join('')}

  async function loadAll(){
    const sb=client();if(!sb)return;
    const [p,b,br,c,m,a]=await Promise.all([
      sb.from('projects').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false}),
      sb.from('brands').select('*').order('sort_order',{ascending:true}),
      sb.from('briefs').select('*').order('created_at',{ascending:false}),
      sb.from('site_content').select('*').order('section').order('key'),
      sb.from('media_library').select('*').order('created_at',{ascending:false}),
      sb.from('assistant_knowledge').select('*').order('sort_order',{ascending:true})
    ]);
    const err=p.error||b.error||br.error||c.error||m.error||a.error;if(err){console.error(err);alert('Panel verileri yüklenemedi. V4 SQL migration çalıştırıldı mı?\n\n'+err.message);return}
    cache={projects:p.data||[],brands:b.data||[],briefs:br.data||[],content:c.data||[],media:m.data||[],assistant:a.data||[]};
    metrics();renderProjects();renderBrands();renderBriefs();renderContent();renderMedia();renderAssistant();
  }

  $('#quickContentForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const sb=client();const fd=new FormData(e.currentTarget);const rows=[];for(const [key,value] of fd.entries())rows.push({key,value:String(value)});
    for(const row of rows){const {error}=await sb.from('site_content').update({value:row.value}).eq('key',row.key);if(error)return alert(error.message)}
    await loadAll();alert('Site yazıları kaydedildi.');
  });
  $('#contentEditForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const fd=formObj(e.currentTarget);const {error}=await client().from('site_content').update({value:fd.value}).eq('key',fd.key);if(error)return alert(error.message);$('#contentEditCard').hidden=true;await loadAll();
  });

  $('#mediaForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget,status=$('#mediaUploadStatus');const fd=new FormData(form);const input=form.elements.file;const files=[...(input?.files||[])];if(!files.length)return;
    try{
      status.textContent=`${files.length} dosya orijinal kalitede yükleniyor…`;
      let done=0;
      for(const file of files){
        const up=await uploadOriginal(file,'library');const type=file.type.startsWith('video/')?'video':'image';
        const {error}=await client().from('media_library').insert({title:String(fd.get('title')||file.name.replace(/\.[^.]+$/,'')),file_url:up.url,storage_path:up.path,media_type:type,ratio:String(fd.get('ratio')||'original'),alt_text:String(fd.get('alt_text')||''),file_name:file.name,file_size:file.size});if(error)throw error;
        done++;status.textContent=`${done}/${files.length} yüklendi…`;
      }
      status.textContent=`${files.length} dosya yüklendi ✓`;form.reset();await loadAll();
    }catch(err){status.textContent='Hata: '+err.message}
  });

  $('#projectForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget,status=$('#projectUploadStatus');const fd=new FormData(form);const id=String(fd.get('id')||'');
    try{
      const cover=fd.get('cover_file'), media=fd.get('media_file');let coverUrl=String(fd.get('cover_url')||''),mediaUrl=String(fd.get('media_url')||''),mediaType='';
      if(cover instanceof File&&cover.size){status.textContent='Kapak yükleniyor…';coverUrl=(await uploadOriginal(cover,'projects/covers')).url}
      if(media instanceof File&&media.size){status.textContent='Medya yükleniyor…';mediaUrl=(await uploadOriginal(media,'projects/media')).url;mediaType=media.type.startsWith('video/')?'video':'image'}
      const v={category:String(fd.get('category')||''),content_type:String(fd.get('content_type')||''),title:String(fd.get('title')||''),client:String(fd.get('client')||''),tags:String(fd.get('tags')||''),filter_tags:String(fd.get('filter_tags')||''),year:Number(fd.get('year'))||2026,ratio:String(fd.get('ratio')||'16:9'),description:String(fd.get('description')||''),cover_url:coverUrl,media_url:mediaUrl,media_type:mediaType||undefined,project_url:String(fd.get('project_url')||''),sort_order:Number(fd.get('sort_order'))||0,featured:String(fd.get('featured'))==='true',published:String(fd.get('published'))==='true'};
      if(!v.media_type)delete v.media_type;const q=id?client().from('projects').update(v).eq('id',id):client().from('projects').insert(v);const {error}=await q;if(error)throw error;status.textContent='Proje kaydedildi ✓';form.reset();form.elements.year.value='2026';form.elements.sort_order.value='0';form.elements.id.value='';await loadAll()
    }catch(err){status.textContent='Hata: '+err.message}
  });
  $('#projectReset')?.addEventListener('click',()=>{const f=$('#projectForm');f.reset();f.elements.id.value='';f.elements.year.value='2026';f.elements.sort_order.value='0'});

  $('#brandForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget,status=$('#brandUploadStatus');const fd=new FormData(form);const id=String(fd.get('id')||'');
    try{let logoUrl=String(fd.get('logo_url')||'');const file=fd.get('logo_file');if(file instanceof File&&file.size){status.textContent='Logo yükleniyor…';logoUrl=(await uploadOriginal(file,'brands')).url}
      const v={name:String(fd.get('name')||''),sector:String(fd.get('sector')||''),url:String(fd.get('url')||''),logo_url:logoUrl,row_no:Number(fd.get('row_no'))||1,sort_order:Number(fd.get('sort_order'))||0,visible:String(fd.get('visible'))==='true'};const q=id?client().from('brands').update(v).eq('id',id):client().from('brands').insert(v);const {error}=await q;if(error)throw error;status.textContent='Marka kaydedildi ✓';form.reset();form.elements.id.value='';form.elements.sort_order.value='0';await loadAll()}catch(err){status.textContent='Hata: '+err.message}
  });
  $('#brandReset')?.addEventListener('click',()=>{const f=$('#brandForm');f.reset();f.elements.id.value='';f.elements.sort_order.value='0'});

  $('#assistantForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const f=e.currentTarget,fd=new FormData(f),id=String(fd.get('id')||'');
    const v={category:String(fd.get('category')||'Genel'),question:String(fd.get('question')||''),keywords:String(fd.get('keywords')||''),answer:String(fd.get('answer')||''),sort_order:Number(fd.get('sort_order'))||0,active:String(fd.get('active'))==='true'};
    const q=id?client().from('assistant_knowledge').update(v).eq('id',id):client().from('assistant_knowledge').insert(v);const {error}=await q;if(error)return alert(error.message);f.reset();f.elements.id.value='';f.elements.sort_order.value='0';await loadAll();
  });
  $('#assistantReset')?.addEventListener('click',()=>{const f=$('#assistantForm');f.reset();f.elements.id.value='';f.elements.sort_order.value='0'});

  document.addEventListener('click',async e=>{
    const sb=client();let id=e.target.dataset.editProject;
    if(id){const x=cache.projects.find(v=>v.id===id),f=$('#projectForm');if(x&&f){setForm(f,x);f.elements.id.value=id;document.querySelector('[data-target="projects"]')?.click();f.scrollIntoView({behavior:'smooth'});}return}
    id=e.target.dataset.delProject;if(id&&confirm('Projeyi silmek istiyor musun?')){const {error}=await sb.from('projects').delete().eq('id',id);if(error)alert(error.message);else await loadAll();return}
    id=e.target.dataset.editBrand;if(id){const x=cache.brands.find(v=>v.id===id),f=$('#brandForm');if(x&&f){setForm(f,x);f.elements.id.value=id;document.querySelector('[data-target="brands"]')?.click();f.scrollIntoView({behavior:'smooth'})}return}
    id=e.target.dataset.delBrand;if(id&&confirm('Markayı silmek istiyor musun?')){const {error}=await sb.from('brands').delete().eq('id',id);if(error)alert(error.message);else await loadAll();return}
    id=e.target.dataset.editAssistant;if(id){const x=cache.assistant.find(v=>v.id===id),f=$('#assistantForm');if(x&&f){setForm(f,x);f.elements.id.value=id;document.querySelector('[data-target="assistant"]')?.click();f.scrollIntoView({behavior:'smooth'})}return}
    id=e.target.dataset.delAssistant;if(id&&confirm('Bu asistan cevabı silinsin mi?')){const {error}=await sb.from('assistant_knowledge').delete().eq('id',id);if(error)alert(error.message);else await loadAll();return}
    const key=e.target.dataset.editContent;if(key){const x=cache.content.find(v=>v.key===key),f=$('#contentEditForm');if(x&&f){f.elements.key.value=x.key;f.elements.label.value=x.label||x.key;f.elements.section.value=x.section||'';f.elements.value.value=x.value||'';$('#contentEditCard').hidden=false;$('#contentEditCard').scrollIntoView({behavior:'smooth'})}return}
    const copy=e.target.dataset.copyUrl;if(copy){try{await navigator.clipboard.writeText(copy);e.target.textContent='Kopyalandı ✓';setTimeout(()=>e.target.textContent='URL Kopyala',1200)}catch{prompt('URL',copy)}return}
    id=e.target.dataset.delMedia;if(id&&confirm('Bu medya dosyası Storage ve kütüphaneden silinsin mi?')){const path=e.target.dataset.path;const a=await sb.storage.from('media').remove([path]);if(a.error)return alert(a.error.message);const {error}=await sb.from('media_library').delete().eq('id',id);if(error)alert(error.message);else await loadAll();return}
    id=e.target.dataset.viewBrief;if(id){const x=cache.briefs.find(v=>v.id===id),card=$('#briefDetailCard'),box=$('#briefDetail');if(x&&card&&box){box.innerHTML=`<p><strong>${esc(x.company||x.name||'İsimsiz')}</strong></p><p>${esc(x.service||'')} ${x.project_type?'· '+esc(x.project_type):''}</p><p>${esc(x.city||'')} ${x.deadline?'· '+esc(x.deadline):''}</p><p>${esc(x.budget||'')}</p><p>${esc(x.email||'')} ${x.phone?'· '+esc(x.phone):''}</p><p style="white-space:pre-wrap">${esc(x.notes||'')}</p>`;card.hidden=false;card.scrollIntoView({behavior:'smooth'})}return}
  });
  document.addEventListener('change',async e=>{const id=e.target.dataset.briefStatus;if(!id)return;const {error}=await client().from('briefs').update({status:e.target.value}).eq('id',id);if(error)alert(error.message);else await loadAll()});

  navInit();window.PMAdminPanel={loadAll};
})();

(() => {
  let cache = { projects: [], brands: [], briefs: [] };

  const esc = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const client = () => window.PMSupabase;

  function navInit() {
    document.querySelectorAll('.admin-nav button').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.target)?.classList.add('active');
    }));
  }

  function metrics() {
    const p = document.getElementById('metricProjects'); if (p) p.textContent = cache.projects.length;
    const b = document.getElementById('metricBrands'); if (b) b.textContent = cache.brands.length;
    const br = document.getElementById('metricBriefs'); if (br) br.textContent = cache.briefs.length;
    const n = document.getElementById('metricNew'); if (n) n.textContent = cache.briefs.filter(x => x.status === 'Yeni').length;
  }

  function renderProjects() {
    const body = document.getElementById('projectRows'); if (!body) return;
    body.innerHTML = cache.projects.map(x => `<tr><td>${esc(x.title)}</td><td>${esc(x.client||'—')}</td><td>${esc(x.tags||'—')}</td><td>${x.published?'Yayında':'Taslak'}</td><td><button data-edit-project="${x.id}">Düzenle</button> <button data-del-project="${x.id}">Sil</button></td></tr>`).join('');
  }

  function renderBrands() {
    const body = document.getElementById('brandRows'); if (!body) return;
    body.innerHTML = cache.brands.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(x.sector||'—')}</td><td>${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noreferrer">Aç</a>`:'—'}</td><td><button data-edit-brand="${x.id}">Düzenle</button> <button data-del-brand="${x.id}">Sil</button></td></tr>`).join('');
  }

  function renderBriefs() {
    const body = document.getElementById('briefRows'); if (!body) return;
    body.innerHTML = cache.briefs.map(x => `<tr><td>${esc(x.company||x.name||'İsimsiz')}</td><td>${esc(x.service||'—')}</td><td>${esc(x.budget||'—')}</td><td><select data-brief-status="${x.id}"><option ${x.status==='Yeni'?'selected':''}>Yeni</option><option ${x.status==='Görüşüldü'?'selected':''}>Görüşüldü</option><option ${x.status==='Teklif Verildi'?'selected':''}>Teklif Verildi</option><option ${x.status==='Onaylandı'?'selected':''}>Onaylandı</option><option ${x.status==='Arşiv'?'selected':''}>Arşiv</option></select></td><td><button data-view-brief="${x.id}">Detay</button></td></tr>`).join('');
  }

  async function loadAll() {
    const sb = client(); if (!sb) return;
    const [p,b,br] = await Promise.all([
      sb.from('projects').select('*').order('created_at',{ascending:false}),
      sb.from('brands').select('*').order('sort_order',{ascending:true}),
      sb.from('briefs').select('*').order('created_at',{ascending:false})
    ]);
    if (p.error || b.error || br.error) { console.error(p.error||b.error||br.error); return; }
    cache = { projects:p.data||[], brands:b.data||[], briefs:br.data||[] };
    metrics(); renderProjects(); renderBrands(); renderBriefs();
  }

  function formToObj(form) { return Object.fromEntries(new FormData(form).entries()); }

  document.addEventListener('submit', async e => {
    const sb = client(); if (!sb) return;
    if (e.target.id === 'projectForm') {
      e.preventDefault(); const f = e.target; const v=formToObj(f); const id=v.id; delete v.id;
      v.year = Number(v.year)||2026; v.published = v.published === 'true';
      const q = id ? sb.from('projects').update(v).eq('id',id) : sb.from('projects').insert(v);
      const {error}=await q; if(error) return alert(error.message); f.reset(); f.year.value='2026'; await loadAll();
    }
    if (e.target.id === 'brandForm') {
      e.preventDefault(); const f=e.target; const v=formToObj(f); const id=v.id; delete v.id;
      v.sort_order=Number(v.sort_order)||0; v.visible=v.visible==='true';
      const q=id?sb.from('brands').update(v).eq('id',id):sb.from('brands').insert(v);
      const {error}=await q; if(error) return alert(error.message); f.reset(); f.sort_order.value='0'; await loadAll();
    }
  });

  document.addEventListener('click', async e => {
    const sb = client(); if(!sb) return;
    let id=e.target.dataset.editProject;
    if(id){ const x=cache.projects.find(v=>v.id===id),f=document.getElementById('projectForm'); if(!x||!f)return; Object.keys(x).forEach(k=>{if(f.elements[k]) f.elements[k].value=String(x[k]??'')}); f.elements.id.value=id; return; }
    id=e.target.dataset.delProject; if(id&&confirm('Projeyi silmek istiyor musun?')){ const {error}=await sb.from('projects').delete().eq('id',id); if(error)alert(error.message); else await loadAll(); return; }
    id=e.target.dataset.editBrand; if(id){ const x=cache.brands.find(v=>v.id===id),f=document.getElementById('brandForm'); if(!x||!f)return; Object.keys(x).forEach(k=>{if(f.elements[k]) f.elements[k].value=String(x[k]??'')}); f.elements.id.value=id; return; }
    id=e.target.dataset.delBrand; if(id&&confirm('Markayı silmek istiyor musun?')){ const {error}=await sb.from('brands').delete().eq('id',id); if(error)alert(error.message); else await loadAll(); return; }
    id=e.target.dataset.viewBrief; if(id){ const x=cache.briefs.find(v=>v.id===id); const card=document.getElementById('briefDetailCard'),box=document.getElementById('briefDetail'); if(!x||!card||!box)return; box.innerHTML=`<p><strong>${esc(x.company||x.name||'İsimsiz')}</strong></p><p>${esc(x.service||'')} ${x.project_type?'· '+esc(x.project_type):''}</p><p>${esc(x.city||'')} ${x.deadline?'· '+esc(x.deadline):''}</p><p>${esc(x.budget||'')}</p><p>${esc(x.email||'')} ${x.phone?'· '+esc(x.phone):''}</p><p>${esc(x.notes||'')}</p>`; card.hidden=false; card.scrollIntoView({behavior:'smooth'}); }
  });

  document.addEventListener('change', async e => {
    const id=e.target.dataset.briefStatus; if(!id)return; const sb=client(); const {error}=await sb.from('briefs').update({status:e.target.value}).eq('id',id); if(error) alert(error.message); else await loadAll();
  });

  navInit();
  window.PMAdminPanel = { loadAll };
})();

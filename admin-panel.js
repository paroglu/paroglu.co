(function(){
  let token='';
  const cfg=()=>window.PM_BACKEND||{};
  const headers=()=>({apikey:cfg().supabaseAnonKey,Authorization:`Bearer ${token}`,'Content-Type':'application/json'});
  async function req(path,options={}){
    const res=await fetch(cfg().supabaseUrl.replace(/\/$/,'')+path,{...options,headers:{...headers(),...(options.headers||{})}});
    if(!res.ok){let d={};try{d=await res.json()}catch{}throw new Error(d.message||'İşlem başarısız')}
    const t=await res.text();return t?JSON.parse(t):null;
  }
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let projects=[],brands=[],briefs=[];
  async function load(){
    [projects,brands,briefs]=await Promise.all([
      req('/rest/v1/projects?select=*&order=created_at.desc'),
      req('/rest/v1/brands?select=*&order=sort_order.asc,created_at.desc'),
      req('/rest/v1/briefs?select=*&order=created_at.desc')
    ]);render();
  }
  function render(){
    const map={metricProjects:projects.length,metricBrands:brands.length,metricBriefs:briefs.length,metricNew:briefs.filter(x=>x.status==='Yeni').length};
    Object.entries(map).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v});
    const pt=document.getElementById('projectRows');if(pt)pt.innerHTML=projects.map(p=>`<tr><td>${esc(p.title)}</td><td>${esc(p.client||'-')}</td><td>${esc(p.tags||'-')}</td><td><span class="status">${p.published?'Yayında':'Taslak'}</span></td><td class="table-actions"><button class="btn" data-edit-project="${p.id}">Düzenle</button><button class="btn danger" data-delete-project="${p.id}">Sil</button></td></tr>`).join('')||'<tr><td colspan="5">Henüz proje yok.</td></tr>';
    const bt=document.getElementById('brandRows');if(bt)bt.innerHTML=brands.map(b=>`<tr><td>${esc(b.name)}</td><td>${esc(b.sector||'-')}</td><td>${esc(b.url||'-')}</td><td class="table-actions"><button class="btn" data-edit-brand="${b.id}">Düzenle</button><button class="btn danger" data-delete-brand="${b.id}">Sil</button></td></tr>`).join('')||'<tr><td colspan="4">Henüz marka yok.</td></tr>';
    const br=document.getElementById('briefRows');if(br)br.innerHTML=briefs.map(b=>`<tr><td>${esc(b.company||b.name||'-')}</td><td>${esc(b.service||'-')}</td><td>${esc(b.budget||'-')}</td><td><select data-brief-status="${b.id}"><option ${b.status==='Yeni'?'selected':''}>Yeni</option><option ${b.status==='Görüşüldü'?'selected':''}>Görüşüldü</option><option ${b.status==='Teklif Verildi'?'selected':''}>Teklif Verildi</option><option ${b.status==='Onaylandı'?'selected':''}>Onaylandı</option><option ${b.status==='Kapandı'?'selected':''}>Kapandı</option></select></td><td><button class="btn" data-brief-view="${b.id}">Detay</button></td></tr>`).join('')||'<tr><td colspan="5">Henüz brief yok.</td></tr>';
    bindRows();
  }
  function bindRows(){
    document.querySelectorAll('[data-delete-project]').forEach(b=>b.onclick=()=>del('projects',b.dataset.deleteProject));
    document.querySelectorAll('[data-delete-brand]').forEach(b=>b.onclick=()=>del('brands',b.dataset.deleteBrand));
    document.querySelectorAll('[data-edit-project]').forEach(b=>b.onclick=()=>fillProject(b.dataset.editProject));
    document.querySelectorAll('[data-edit-brand]').forEach(b=>b.onclick=()=>fillBrand(b.dataset.editBrand));
    document.querySelectorAll('[data-brief-status]').forEach(s=>s.onchange=()=>updateBrief(s.dataset.briefStatus,s.value));
    document.querySelectorAll('[data-brief-view]').forEach(b=>b.onclick=()=>viewBrief(b.dataset.briefView));
  }
  async function del(table,id){if(!confirm('Bu kaydı silmek istediğine emin misin?'))return;await req(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,{method:'DELETE'});await load()}
  function fillProject(id){const p=projects.find(x=>String(x.id)===String(id));if(!p)return;const f=document.getElementById('projectForm');Object.entries(p).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v??''});f.elements.id.value=p.id;document.getElementById('projectSubmit').textContent='Değişiklikleri Kaydet';f.scrollIntoView({behavior:'smooth'})}
  function fillBrand(id){const b=brands.find(x=>String(x.id)===String(id));if(!b)return;const f=document.getElementById('brandForm');Object.entries(b).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v??''});f.elements.id.value=b.id;document.getElementById('brandSubmit').textContent='Değişiklikleri Kaydet';f.scrollIntoView({behavior:'smooth'})}
  function viewBrief(id){const b=briefs.find(x=>String(x.id)===String(id));if(!b)return;document.getElementById('briefDetail').innerHTML=Object.entries(b).filter(([,v])=>v!==null&&v!=='').map(([k,v])=>`<div class="summary-row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');document.getElementById('briefDetailCard').hidden=false;document.getElementById('briefDetailCard').scrollIntoView({behavior:'smooth'})}
  async function updateBrief(id,status){await req(`/rest/v1/briefs?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status})});await load()}
  async function saveForm(table,form){
    const fd=new FormData(form);const obj=Object.fromEntries(fd.entries());const id=obj.id;delete obj.id;
    if('published' in obj)obj.published=obj.published==='true';if('sort_order' in obj)obj.sort_order=Number(obj.sort_order||0);if('visible' in obj)obj.visible=obj.visible==='true';
    if(id)await req(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(obj)});
    else await req(`/rest/v1/${table}`,{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(obj)});
    form.reset();if(form.elements.id)form.elements.id.value='';document.getElementById(table==='projects'?'projectSubmit':'brandSubmit').textContent=table==='projects'?'Projeyi Ekle':'Markayı Ekle';await load();
  }
  document.getElementById('projectForm')?.addEventListener('submit',e=>{e.preventDefault();saveForm('projects',e.currentTarget).catch(err=>alert(err.message))});
  document.getElementById('brandForm')?.addEventListener('submit',e=>{e.preventDefault();saveForm('brands',e.currentTarget).catch(err=>alert(err.message))});
  document.querySelectorAll('.admin-nav button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.admin-nav button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.admin-view').forEach(v=>v.classList.remove('active'));document.getElementById(btn.dataset.target)?.classList.add('active')}));
  window.PMAdmin={init(t){token=t;load().catch(err=>{alert('Panel verileri yüklenemedi: '+err.message)})}};
})();

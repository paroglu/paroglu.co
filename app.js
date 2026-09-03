(() => {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  // Navigation
  const menu=$('.menu-toggle'), mobile=$('.mobile-menu');
  menu?.addEventListener('click',()=>{const open=mobile?.classList.toggle('open');menu.setAttribute('aria-expanded',open?'true':'false')});
  $$('[data-transition]').forEach(a=>a.addEventListener('click',e=>{
    const href=a.getAttribute('href'); if(!href || href.startsWith('#') || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); const layer=$('.page-transition'); if(layer){layer.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});setTimeout(()=>location.href=href,310)} else location.href=href;
  }));

  // Scroll reveal
  const io=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('visible');io.unobserve(x.target)}}),{threshold:.11});
  $$('.reveal').forEach(el=>io.observe(el));

  // CMS content
  async function loadContent(){
    if(!window.PMData) return;
    try{
      const rows=await PMData.content(); const map=Object.fromEntries(rows.map(r=>[r.key,r.value]));
      $$('[data-cms]').forEach(el=>{const v=map[el.dataset.cms]; if(v!=null&&v!=='') el.textContent=v});
      $$('[data-cms-html]').forEach(el=>{const v=map[el.dataset.cmsHtml]; if(v!=null&&v!=='') el.innerHTML=v});
      $$('[data-cms-href]').forEach(el=>{const v=map[el.dataset.cmsHref]; if(v) el.setAttribute('href',v)});
      document.documentElement.style.setProperty('--marquee-speed',(map['brands.speed_seconds']||'34')+'s');
      window.PMContentMap=map;
    }catch(err){console.warn('CMS content unavailable',err)}
  }

  // Home expandable service rows
  $$('[data-service-mini]').forEach(row=>row.addEventListener('click',e=>{
    if(e.target.closest('a')) return; row.classList.toggle('open');
  }));

  // Services accordion
  $$('[data-service-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
    const item=btn.closest('[data-service]'); const open=item.classList.toggle('open'); btn.setAttribute('aria-expanded',open?'true':'false'); const span=btn.querySelector('span'); if(span) span.textContent=open?'Kapat':'Detayı Gör';
  }));

  // Works filters
  $$('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.filter-btn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;
    $$('.work-item').forEach(it=>{
      const tags=(it.dataset.tags||'').split(','); const show=f==='all'||tags.includes(f);
      if(show){it.hidden=false;requestAnimationFrame(()=>it.classList.remove('is-hiding'))}
      else{it.classList.add('is-hiding');setTimeout(()=>{if(it.classList.contains('is-hiding'))it.hidden=true},240)}
    });
  }));
  $$('.view-mode button').forEach(btn=>btn.addEventListener('click',()=>{$$('.view-mode button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.body.classList.toggle('showreel-mode',btn.dataset.view==='showreel')}));

  function mediaMarkup(p){
    const src=p.media_url||p.cover_url||''; if(!src) return `<div class="project-visual ${p.visual_class||'visual-design'}"></div>`;
    const isVideo=/\.(mp4|webm|mov)(\?|$)/i.test(src) || p.media_type==='video';
    return `<div class="project-visual">${isVideo?`<video src="${esc(src)}" muted loop playsinline autoplay preload="metadata"></video>`:`<img src="${esc(src)}" alt="${esc(p.title||'Proje')}" loading="lazy"/>`}</div>`;
  }
  function projectCard(p, cls=''){
    const tags=(p.tags||'').split(',').map(x=>x.trim()).filter(Boolean).join(' · ');
    const cats=[p.category,p.content_type].filter(Boolean).join(' · ') || 'Kreatif İş';
    const url=p.project_url||'#';
    return `<article class="work-item reveal visible ${cls}" data-tags="${esc((p.filter_tags||p.tags||'').toLowerCase().replaceAll(' ',''))}" data-ratio="${esc(p.ratio||'16:9')}"><a class="project-card" href="${esc(url)}">${mediaMarkup(p)}<div class="project-meta"><div><div class="eyebrow">${esc(cats)}${p.year?' · '+esc(p.year):''}</div><h3>${esc(p.title||'Proje')}</h3>${tags?`<div class="project-tags">${esc(tags)}</div>`:''}${p.client?`<div class="project-client">${esc(p.client)}</div>`:''}</div><div class="view-chip">↗</div></div></a></article>`;
  }
  async function loadProjects(){
    const host=$('[data-project-grid]'); if(!host||!window.PMData) return;
    try{const rows=await PMData.projects(); if(!rows.length)return; host.innerHTML=rows.map(p=>projectCard(p)).join('');}
    catch(err){console.warn('Projects unavailable',err)}
  }


  async function loadFeatured(){
    const host=$('[data-featured-grid]'); if(!host||!window.PMData) return;
    try{const rows=(await PMData.projects()).filter(x=>x.featured).slice(0,6); if(!rows.length)return; host.innerHTML=rows.map((p,i)=>{
      const tags=(p.tags||'').split(',').map(x=>x.trim()).filter(Boolean).join(' · ');
      const cats=[p.category,p.content_type].filter(Boolean).join(' · ') || 'Kreatif İş';
      return `<a class="project-card ${i%3===1?'small':''} reveal visible" href="${esc(p.project_url||'isler.html')}">${mediaMarkup(p)}<div class="project-meta"><div><div class="eyebrow">${esc(cats)}${p.year?' · '+esc(p.year):''}</div><h3>${esc(p.title||'Proje')}</h3>${tags?`<div class="project-tags">${esc(tags)}</div>`:''}${p.client?`<div class="project-client">${esc(p.client)}</div>`:''}</div><div class="view-chip">↗</div></div></a>`
    }).join('');}
    catch(err){console.warn('Featured unavailable',err)}
  }

  // Brand marquee from panel
  async function loadBrands(){
    const wrap=$('[data-brand-area]'); if(!wrap||!window.PMData) return;
    try{
      let rows=await PMData.brands(); if(!rows.length)return;
      const limit=parseInt(window.PMContentMap?.['brands.carousel_limit']||'14',10)||14; rows=rows.slice(0,limit);
      const row1=rows.filter(x=>Number(x.row_no||1)===1); const row2=rows.filter(x=>Number(x.row_no||1)===2);
      const make=(arr,reverse=false)=>{if(!arr.length)return'';const list=[...arr,...arr,...arr];return `<div class="marquee-row"><div class="marquee ${reverse?'reverse':''}">${list.map(b=>`<a class="brand-pill" ${b.url?`href="${esc(b.url)}" target="_blank" rel="noreferrer"`:''}>${b.logo_url?`<img src="${esc(b.logo_url)}" alt="${esc(b.name)}"/>`:`<span>${esc(b.name)}</span>`}</a>`).join('')}</div></div>`};
      wrap.innerHTML=make(row1.length?row1:rows.filter((_,i)=>i%2===0),false)+make(row2.length?row2:rows.filter((_,i)=>i%2===1),true);
    }catch(err){console.warn('Brands unavailable',err)}
  }

  // Assistant - lightweight guided helper
  const launch=$('.assistant-launch'), panel=$('.assistant-panel'), close=$('.assistant-close'), input=$('.assistant-input input'), send=$('.assistant-input button'), messages=$('.messages');
  const add=(text,who='bot')=>{if(!messages)return;const d=document.createElement('div');d.className='msg '+who;d.textContent=text;messages.appendChild(d);messages.scrollTop=messages.scrollHeight};
  const reply=(txt)=>{
    const t=txt.toLocaleLowerCase('tr-TR');
    if(/fiyat|bütçe|kaç tl|ücret/.test(t)) return 'Fiyat; kapsam, çekim günü, teslim adedi ve prodüksiyon ihtiyacına göre değişiyor. İstersen “Teklif Al” bölümündeki kısa brief ile netleştirebiliriz.';
    if(/telefon|iletişim|whatsapp/.test(t)) return 'Paroglu Media iletişim numarası: +90 541 662 98 62. İstersen önce projenin türünü de beraber netleştirebiliriz.';
    if(/sosyal medya/.test(t)) return 'Sosyal medya tarafında içerik planı, tasarım dili, Reels üretimi, çekim ve sayfa yönetimi birlikte kurgulanabilir. Hangi firma için düşündüğünü yazarsan kapsamı daraltalım.';
    if(/reels|video|film/.test(t)) return 'Reels ve video işlerinde önce kullanım amacı, içerik adedi, çekim lokasyonu ve teslim süresini netleştiriyoruz. Hangi firma ve sektör için düşünüyorsun?';
    if(/tasarım/.test(t)) return 'Tasarım tarafında sosyal medya, kampanya, afiş, baskı ve marka iletişimi çalışıyorum. Tek görsel mi yoksa düzenli bir içerik sistemi mi düşünüyorsun?';
    if(/drone/.test(t)) return 'Drone çekiminde lokasyon, çekim amacı ve teslim formatına göre plan yapıyorum. Mimari, etkinlik ve reklam üretimlerinde kullanılabilir.';
    if(/web|site/.test(t)) return 'Digital tarafta portfolyo, landing page ve kreatif web deneyimleri üretebiliyorum. Siteyi ne amaçla kullanacağını söylersen doğru yapıyı önerebilirim.';
    return 'Bunu birlikte netleştirebiliriz. Önce hangi firma/marka için düşündüğünü ve hedefinin ne olduğunu yaz; sana uygun hizmet akışını çıkarayım.';
  };
  launch?.addEventListener('click',()=>{panel?.classList.add('open');if(messages&&!messages.children.length)add('Merhaba. Projenle ilgili aklına takılan şeyi yazabilir veya hangi firma için ne üretmek istediğini anlatabilirsin.')}); close?.addEventListener('click',()=>panel?.classList.remove('open'));
  const submitChat=()=>{const v=input?.value.trim();if(!v)return;add(v,'user');input.value='';setTimeout(()=>add(reply(v)),260)}; send?.addEventListener('click',submitChat); input?.addEventListener('keydown',e=>{if(e.key==='Enter')submitChat()});

  // Brief flow
  const steps=$$('.brief-step'); let step=0; const brief={};
  function showStep(n){if(!steps.length)return;step=Math.max(0,Math.min(steps.length-1,n));steps.forEach((s,i)=>s.classList.toggle('active',i===step));const bar=$('.progress span');if(bar)bar.style.width=((step+1)/steps.length*100)+'%';scrollTo({top:0,behavior:'smooth'});if(step===steps.length-1){const box=$('.brief-summary');if(box)box.innerHTML=`<strong>${esc(brief.company||brief.name||'Proje')}</strong><br>${esc(brief.service||'—')} · ${esc(brief.project_type||'—')}<br>${esc(brief.budget||'—')} · ${esc(brief.deadline||'—')}<br>${esc(brief.notes||'')}`}}
  $$('.choice').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.key;const value=b.dataset.value||b.textContent.trim();brief[key==='needType'?'project_type':key==='timeline'?'deadline':key]=value;b.parentElement.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');setTimeout(()=>showStep(step+1),140)}));
  $$('[data-next]').forEach(b=>b.addEventListener('click',()=>{const s=steps[step];$$('input,textarea,select',s).forEach(el=>{const k=el.name;if(!k)return;const map={details:'notes',website:'website',colors:'colors',sector:'sector',channel:'channel'};brief[map[k]||k]=el.value});showStep(step+1)}));
  $$('[data-prev]').forEach(b=>b.addEventListener('click',()=>showStep(step-1)));
  $('[data-submit-brief]')?.addEventListener('click',async e=>{const btn=e.currentTarget;btn.disabled=true;btn.textContent='Gönderiliyor…';try{await PMData.submitBrief({name:brief.name||'',company:brief.company||'',email:brief.email||'',phone:brief.phone||'',service:brief.service||'',project_type:brief.project_type||'',budget:brief.budget||'',deadline:brief.deadline||'',city:brief.city||'',notes:[brief.notes,brief.website&&`Web/IG: ${brief.website}`,brief.colors&&`Renkler: ${brief.colors}`,brief.sector&&`Sektör: ${brief.sector}`,brief.channel&&`İletişim: ${brief.channel}`].filter(Boolean).join('\n'),source:'website'});btn.textContent='Brief alındı ✓';}catch(err){btn.disabled=false;btn.textContent='Tekrar Dene';alert('Brief gönderilemedi: '+err.message)}});

  Promise.resolve(loadContent()).then(()=>{loadBrands();});
  loadProjects();
  loadFeatured();
})();

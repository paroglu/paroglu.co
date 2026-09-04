(() => {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     OPENING / PAGE TRANSITIONS
  --------------------------------------------------------- */
  const loader=$('.site-loader');
  const transition=$('.page-transition');
  const firstHome=document.body.dataset.home==='true' && !sessionStorage.getItem('pmIntroSeen');
  const cachedHome=parseInt(localStorage.getItem('pmMotionHome')||'1850',10); const cachedInner=parseInt(localStorage.getItem('pmMotionInner')||'820',10);
  const introMs=reduceMotion?80:(firstHome?cachedHome:cachedInner);
  const finishIntro=()=>{
    if(!loader){document.body.classList.add('page-ready');return}
    loader.classList.add('is-running');
    setTimeout(()=>{
      loader.classList.add('is-finished');
      document.body.classList.add('page-ready');
      if(firstHome) sessionStorage.setItem('pmIntroSeen','1');
      setTimeout(()=>loader.remove(),700);
    },introMs);
  };
  if(document.readyState==='complete') finishIntro(); else window.addEventListener('load',finishIntro,{once:true});

  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');
    if(!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target==='_blank' || a.hasAttribute('download')) return;
    const raw=a.getAttribute('href');
    if(!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return;
    let url; try{url=new URL(raw,location.href)}catch{return}
    if(url.origin!==location.origin) return;
    if(url.pathname===location.pathname && url.hash) return;
    e.preventDefault();
    if(reduceMotion){location.href=url.href;return}
    document.body.classList.add('page-leaving');
    transition?.classList.add('active');
    setTimeout(()=>location.href=url.href,540);
  });

  /* ---------------------------------------------------------
     NAVIGATION + FAVORITE WORK MEGA MENU
  --------------------------------------------------------- */
  const menu=$('.menu-toggle'), mobile=$('.mobile-menu');
  menu?.addEventListener('click',()=>{const open=mobile?.classList.toggle('open');menu.setAttribute('aria-expanded',open?'true':'false')});

  let currentProjects=[];
  function buildWorkMega(projects=[]){
    const nav=$('.site-nav'); const workLink=$('.nav-links a[href="isler.html"]');
    if(!nav||!workLink) return;
    let mega=$('.work-mega',nav);
    if(!mega){
      mega=document.createElement('div'); mega.className='work-mega';
      mega.innerHTML='<div class="work-mega-head"><span>FAVORİ İŞLER</span><a href="isler.html">Tüm işleri gör ↗</a></div><div class="work-mega-grid"></div>';
      nav.appendChild(mega);
      const open=()=>mega.classList.add('open'), close=()=>mega.classList.remove('open');
      workLink.addEventListener('mouseenter',open); workLink.addEventListener('focus',open); mega.addEventListener('mouseenter',open);
      nav.addEventListener('mouseleave',close); workLink.addEventListener('blur',()=>setTimeout(()=>{if(!mega.matches(':hover'))close()},80));
    }
    const favorites=(projects.length?projects.filter(x=>x.featured):[]).slice(0,3);
    const defaults=[
      {category:'SOSYAL MEDYA · SPOR',title:'Karabük İdman Yurdu',project_url:'karabuk-idman-yurdu.html'},
      {category:'KONSER · REELS',title:'Konser İçerikleri',project_url:'sefo.html'},
      {category:'DRONE · MİMARİ',title:'Mimari / İnşaat',project_url:'isler.html'}
    ];
    const rows=favorites.length?favorites:defaults;
    $('.work-mega-grid',mega).innerHTML=rows.map((p,i)=>`<a class="work-mega-item" href="${esc(p.project_url||'isler.html')}"><span>0${i+1}</span><div><small>${esc([p.category,p.content_type].filter(Boolean).join(' · ')||'KREATİF İŞ')}</small><strong>${esc(p.title||'Proje')}</strong></div><i>↗</i></a>`).join('');
    if(mobile && !$('.mobile-favorites',mobile)){
      const box=document.createElement('div'); box.className='mobile-favorites'; box.innerHTML='<span>Favori İşler</span>'+rows.slice(0,2).map(p=>`<a href="${esc(p.project_url||'isler.html')}">${esc(p.title||'Proje')} <i>↗</i></a>`).join(''); mobile.appendChild(box);
    }
  }
  buildWorkMega();

  /* ---------------------------------------------------------
     HOME HERO MOTION
  --------------------------------------------------------- */
  const hero=$('.hero[data-motion], body[data-home="true"] .hero') || (document.body.dataset.home==='true'?$('.hero'):null);
  if(hero && document.body.dataset.home==='true'){
    if(!$('.hero-ambient',hero)) hero.insertAdjacentHTML('afterbegin','<div class="hero-ambient"><i></i><i></i><i></i></div><div class="hero-ghost" aria-hidden="true">PAROGLU MEDIA</div><div class="hero-beam" aria-hidden="true"></div>');
    if(!reduceMotion){
      hero.addEventListener('pointermove',e=>{
        const r=hero.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
        hero.style.setProperty('--mx',`${x*100}%`); hero.style.setProperty('--my',`${y*100}%`);
        hero.style.setProperty('--px',`${(x-.5)*18}px`); hero.style.setProperty('--py',`${(y-.5)*14}px`);
      });
      addEventListener('scroll',()=>{const g=$('.hero-ghost',hero);if(g)g.style.transform=`translate3d(-50%,${Math.min(scrollY*.07,45)}px,0)`},{passive:true});
    }
  }

  /* ---------------------------------------------------------
     SCROLL / TYPOGRAPHY REVEALS
  --------------------------------------------------------- */
  $$('.section-title,.inner-hero h1,.about-headline').forEach(el=>el.classList.add('motion-title'));
  const io=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('visible');x.target.classList.add('motion-in');io.unobserve(x.target)}}),{threshold:.10,rootMargin:'0px 0px -4%'});
  $$('.reveal,.motion-title').forEach(el=>io.observe(el));

  /* ---------------------------------------------------------
     CMS CONTENT
  --------------------------------------------------------- */
  async function loadContent(){
    if(!window.PMData) return {};
    try{
      const rows=await PMData.content(); const map=Object.fromEntries(rows.map(r=>[r.key,r.value]));
      $$('[data-cms]').forEach(el=>{const v=map[el.dataset.cms]; if(v!=null&&v!=='') el.textContent=v});
      $$('[data-cms-html]').forEach(el=>{const v=map[el.dataset.cmsHtml]; if(v!=null&&v!=='') el.innerHTML=v});
      $$('[data-cms-href]').forEach(el=>{const v=map[el.dataset.cmsHref]; if(v) el.setAttribute('href',v)});
      document.documentElement.style.setProperty('--marquee-speed',(map['brands.speed_seconds']||'34')+'s');
      window.PMContentMap=map;
      if(map['motion.intro_home_ms']) localStorage.setItem('pmMotionHome',map['motion.intro_home_ms']);
      if(map['motion.intro_inner_ms']) localStorage.setItem('pmMotionInner',map['motion.intro_inner_ms']);
      return map;
    }catch(err){console.warn('CMS content unavailable',err);return {}}
  }

  /* ---------------------------------------------------------
     SERVICES
  --------------------------------------------------------- */
  $$('[data-service-mini]').forEach(row=>row.addEventListener('click',e=>{if(e.target.closest('a'))return;const was=row.classList.contains('open');$$('[data-service-mini].open').forEach(x=>x.classList.remove('open'));if(!was)row.classList.add('open')}));
  $$('[data-service-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
    const item=btn.closest('[data-service]'); const was=item.classList.contains('open');
    $$('[data-service].open').forEach(x=>{x.classList.remove('open');const b=$('[data-service-toggle]',x);if(b){b.setAttribute('aria-expanded','false');const s=$('span',b);if(s)s.textContent='Detayı Gör'}});
    if(!was){item.classList.add('open');btn.setAttribute('aria-expanded','true');const span=btn.querySelector('span');if(span)span.textContent='Kapat'}
  }));

  /* ---------------------------------------------------------
     PROJECT CARDS / MEDIA CROSSFADE
  --------------------------------------------------------- */
  function mediaMarkup(p){
    const cover=p.cover_url||''; const media=p.media_url||'';
    if(!cover&&!media) return `<div class="project-visual ${p.visual_class||'visual-design'}"></div>`;
    const render=(src,kind,cls)=>{const isVideo=kind==='video'||/\.(mp4|webm|mov)(\?|$)/i.test(src);return isVideo?`<video class="${cls}" src="${esc(src)}" muted loop playsinline preload="metadata"></video>`:`<img class="${cls}" src="${esc(src)}" alt="${esc(p.title||'Proje')}" loading="lazy"/>`};
    const primary=cover||media; const secondary=cover&&media&&cover!==media?media:'';
    return `<div class="project-visual media-stack">${render(primary,cover?'image':p.media_type,'media-primary')}${secondary?render(secondary,p.media_type,'media-secondary'):''}<span class="media-sheen"></span></div>`;
  }
  function projectCard(p, cls=''){
    const tags=(p.tags||'').split(',').map(x=>x.trim()).filter(Boolean).join(' · ');
    const cats=[p.category,p.content_type].filter(Boolean).join(' · ') || 'Kreatif İş'; const url=p.project_url||'#';
    return `<article class="work-item reveal visible ${cls}" data-tags="${esc((p.filter_tags||p.tags||'').toLowerCase().replaceAll(' ',''))}" data-ratio="${esc(p.ratio||'16:9')}"><a class="project-card" href="${esc(url)}">${mediaMarkup(p)}<div class="project-meta"><div><div class="eyebrow">${esc(cats)}${p.year?' · '+esc(p.year):''}</div><h3>${esc(p.title||'Proje')}</h3>${tags?`<div class="project-tags">${esc(tags)}</div>`:''}${p.client?`<div class="project-client">${esc(p.client)}</div>`:''}</div><div class="view-chip">↗</div></div></a></article>`;
  }
  function enhanceCards(root=document){
    $$('.project-card',root).forEach(card=>{
      if(card.dataset.enhanced)return;card.dataset.enhanced='1';
      card.addEventListener('pointerenter',()=>{const v=$('.media-secondary',card);if(v?.tagName==='VIDEO')v.play().catch(()=>{});});
      card.addEventListener('pointerleave',()=>{const v=$('.media-secondary',card);if(v?.tagName==='VIDEO'){v.pause();v.currentTime=0}});
      card.addEventListener('pointermove',e=>{if(reduceMotion)return;const r=card.getBoundingClientRect();card.style.setProperty('--cx',`${((e.clientX-r.left)/r.width)*100}%`);card.style.setProperty('--cy',`${((e.clientY-r.top)/r.height)*100}%`)});
    });
  }
  enhanceCards();

  const hoverCursor=document.createElement('div');hoverCursor.className='project-cursor';hoverCursor.textContent='İNCELE';document.body.appendChild(hoverCursor);
  document.addEventListener('pointermove',e=>{if(matchMedia('(pointer:fine)').matches){hoverCursor.style.transform=`translate3d(${e.clientX+15}px,${e.clientY+15}px,0)`;hoverCursor.classList.toggle('show',!!e.target.closest('.project-card'))}});

  async function loadProjects(){
    const host=$('[data-project-grid]'); if(!host||!window.PMData) return [];
    try{const rows=await PMData.projects();currentProjects=rows;if(rows.length){host.innerHTML=rows.map(p=>projectCard(p)).join('');enhanceCards(host);buildWorkMega(rows)}return rows}
    catch(err){console.warn('Projects unavailable',err);return []}
  }
  async function loadFeatured(){
    const host=$('[data-featured-grid]'); if(!host||!window.PMData) return;
    try{const rows=(await PMData.projects()).filter(x=>x.featured).slice(0,6);if(!rows.length)return;host.innerHTML=rows.map((p,i)=>{
      const tags=(p.tags||'').split(',').map(x=>x.trim()).filter(Boolean).join(' · '); const cats=[p.category,p.content_type].filter(Boolean).join(' · ')||'Kreatif İş';
      return `<a class="project-card ${i%3===1?'small':''} reveal visible" href="${esc(p.project_url||'isler.html')}">${mediaMarkup(p)}<div class="project-meta"><div><div class="eyebrow">${esc(cats)}${p.year?' · '+esc(p.year):''}</div><h3>${esc(p.title||'Proje')}</h3>${tags?`<div class="project-tags">${esc(tags)}</div>`:''}${p.client?`<div class="project-client">${esc(p.client)}</div>`:''}</div><div class="view-chip">↗</div></div></a>`
    }).join('');enhanceCards(host);buildWorkMega(rows)}catch(err){console.warn('Featured unavailable',err)}
  }

  /* Works filtering with staged reflow instead of abrupt layout jumps */
  function filterWorks(filter){
    const items=$$('.work-item'); if(!items.length)return;
    const first=new Map(items.filter(x=>!x.hidden).map(x=>[x,x.getBoundingClientRect()]));
    const hiding=items.filter(it=>{const tags=(it.dataset.tags||'').split(',');return !(filter==='all'||tags.includes(filter))&&!it.hidden});
    const showing=items.filter(it=>{const tags=(it.dataset.tags||'').split(',');return (filter==='all'||tags.includes(filter))&&it.hidden});
    hiding.forEach(it=>it.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.97)'}],{duration:180,easing:'ease',fill:'forwards'}));
    setTimeout(()=>{
      hiding.forEach(it=>it.hidden=true);showing.forEach(it=>{it.hidden=false;it.style.opacity='0'});void document.body.offsetWidth;
      items.filter(x=>!x.hidden).forEach(it=>{
        const last=it.getBoundingClientRect(),f=first.get(it);if(f){const dx=f.left-last.left,dy=f.top-last.top;it.animate([{transform:`translate(${dx}px,${dy}px)`,opacity:1},{transform:'translate(0,0)',opacity:1}],{duration:480,easing:'cubic-bezier(.2,.75,.2,1)'})}else{it.animate([{opacity:0,transform:'translateY(18px) scale(.98)'},{opacity:1,transform:'none'}],{duration:430,easing:'cubic-bezier(.2,.75,.2,1)'})}it.style.opacity='';
      });
    },185);
  }
  $$('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{$$('.filter-btn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');filterWorks(btn.dataset.filter)}));
  $$('.view-mode button').forEach(btn=>btn.addEventListener('click',()=>{$$('.view-mode button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.body.classList.toggle('showreel-mode',btn.dataset.view==='showreel')}));

  /* ---------------------------------------------------------
     BRAND MARQUEE
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     PAROGLU ASSISTANT — FAQ + GUIDED LEAD FLOW
  --------------------------------------------------------- */
  const defaultKnowledge=[
    ['Reels / Video','Reels çekimi nasıl ilerliyor?','reels,video,çekim,kurgu,film','Önce hedefi ve yayın platformunu netleştiriyoruz. Ardından fikir, çekim planı, prodüksiyon, kurgu, renk/ses düzenleme ve revizyon geliyor. Teslimler 9:16 başta olmak üzere ihtiyaç varsa 16:9 ve 4:5 formatlarda hazırlanabiliyor.'],
    ['Sosyal Medya','Sosyal medya yönetimi yapıyor musunuz?','sosyal medya,yönetim,sayfa,içerik planı,instagram','Evet. İçerik planı, sayfanın görsel dili, Reels ve tasarım üretimi, çekim planlaması ve yayın akışı birlikte kurgulanabiliyor. Amaç yalnızca paylaşım yapmak değil, markanın düzenli ve tanınır bir içerik sistemine sahip olması.'],
    ['Fotoğraf','Fotoğraf çekimi yapıyor musunuz?','fotoğraf,ürün,portre,etkinlik,spor fotoğraf','Evet. Ürün, portre, spor, etkinlik ve kurumsal fotoğraf çekimleri yapılabilir. Çekim öncesinde kullanım alanına göre ışık, kadraj ve teslim oranları planlanır.'],
    ['Tasarım','Hangi tasarım hizmetlerini veriyorsunuz?','tasarım,afiş,post,story,banner,baskı,kampanya','Sosyal medya post/story, kampanya görselleri, afiş, banner, baskı işleri ve marka iletişimi tasarımları üretiyorum. Tek görselden ziyade mümkün olduğunda tekrar kullanılabilir, tutarlı bir görsel sistem kuruyorum.'],
    ['Drone','Drone çekimi yapıyor musunuz?','drone,hava çekimi,mimari,inşaat','Evet. Mimari, inşaat, etkinlik, spor, mekân ve reklam projelerinde sinematik hava çekimleri yapılabilir. Lokasyon ve uçuş koşulları çekim öncesinde değerlendirilir.'],
    ['Web / Digital','Web sitesi yapıyor musunuz?','web,site,landing page,digital,portfolyo','Evet. Portfolyo, landing page ve kreatif web deneyimleri hazırlanabilir. Öncelik; mobil uyum, hızlı açılış, güçlü portfolyo sunumu ve gerektiğinde yönetilebilir içerik altyapısıdır.'],
    ['Spor','Spor kulüpleriyle çalışıyor musunuz?','spor,kulüp,futbol,maç günü,forma','Evet. Spor tarafında Reels, maç günü içerikleri, transfer/forma lansmanları, fotoğraf, grafik tasarım ve sosyal medya yönetimi birlikte üretilebilir. Portfolyoda Karabük İdman Yurdu gibi örnekler bulunuyor.'],
    ['Konser','Konser çekimi yapıyor musunuz?','konser,sahne,backstage,sanatçı,sefo','Evet. Sahne, backstage, kalabalık atmosferi ve sanatçı detaylarını kapsayan dikey Reels ve etkinlik videoları üretilebilir. Sefo konser çalışmaları portfolyodaki referanslardan biri.'],
    ['Fiyat / Süreç','Fiyatlar nasıl belirleniyor?','fiyat,ücret,bütçe,kaç tl,teklif','Fiyat; çekim süresi, lokasyon, ekip ihtiyacı, teslim adedi, kurgu yoğunluğu ve kullanım kapsamına göre belirlenir. En doğru fiyat için Teklif Al bölümündeki kısa brief yeterli.'],
    ['Fiyat / Süreç','Teslim süresi ne kadar?','teslim,süre,kaç gün,ne zaman','Teslim süresi projenin kapsamına göre değişir. Kısa Reels çalışmalarında süreç daha hızlı olabilir; çoklu çekim, kampanya veya kapsamlı kurumsal işlerde takvim brief aşamasında netleştirilir.'],
    ['Fiyat / Süreç','Revizyon hakkı var mı?','revizyon,değişiklik,düzeltme','Evet. Revizyon kapsamı iş başlamadan önce netleştirilir. Amaç, projeyi sonsuz revizyon döngüsüne sokmadan briefte belirlenen hedefe en doğru şekilde ulaştırmaktır.'],
    ['Genel','Hangi şehirlerde çalışıyorsunuz?','şehir,karabük,istanbul,ankara,nerede,lokasyon','Karabük merkezli çalışıyorum; proje kapsamına göre farklı şehirlerde çekim ve prodüksiyon planlanabilir. Şehri yazarsan ulaşım ve çekim planını ona göre değerlendirebiliriz.'],
    ['Genel','İletişim bilgileri nedir?','telefon,whatsapp,iletişim,mail,email','Telefon: +90 541 662 98 62. E-posta: umutparoglu87@gmail.com. İstersen önce buradan projenin kapsamını netleştirip ardından brief bırakabilirsin.'],
    ['Genel','Ham görüntüleri teslim ediyor musunuz?','ham görüntü,raw,raw video,ham dosya','Ham dosya teslimi proje bazında ayrıca konuşulur. Standart teslim; seçilmiş, düzenlenmiş ve kullanıma hazır içeriklerdir. Ham arşiv gerekiyorsa brief aşamasında belirtilmesi iyi olur.'],
    ['Sosyal Medya','Kafe veya restoran için ne önerirsiniz?','kafe,cafe,restoran,yemek,menü,coffee','Kafe/restoran için en güçlü kombinasyon genelde düzenli Reels + ürün/mekân fotoğrafı + sosyal medya tasarım sistemidir. Menü lansmanı, mekân atmosferi ve ürün odaklı kısa videolar birlikte planlanabilir.'],
    ['Sosyal Medya','İnşaat veya emlak için ne önerirsiniz?','inşaat,emlak,konut,mimari,proje','İnşaat/emlak tarafında drone, mimari fotoğraf, kısa tanıtım Reels’leri ve proje ilerleme içerikleri güçlü çalışır. Satış odaklıysa landing page ve reklam kreatifleri de sisteme eklenebilir.']
  ].map((x,i)=>({category:x[0],question:x[1],keywords:x[2],answer:x[3],sort_order:i,active:true}));
  let assistantKnowledge=[...defaultKnowledge];
  async function loadAssistantKnowledge(){try{const rows=await PMData?.assistant?.();if(rows?.length)assistantKnowledge=[...rows,...defaultKnowledge]}catch(err){console.warn('Assistant knowledge unavailable',err)}}

  const launch=$('.assistant-launch'), assistantPanel=$('.assistant-panel'), close=$('.assistant-close'), input=$('.assistant-input input'), send=$('.assistant-input button'), messages=$('.messages');
  let leadState={stage:null,data:{}};
  const normalize=s=>String(s||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9çğıöşü\s]/g,' ');
  const add=(text,who='bot',html=false)=>{if(!messages)return;const d=document.createElement('div');d.className='msg '+who;if(html)d.innerHTML=text;else d.textContent=text;messages.appendChild(d);messages.scrollTop=messages.scrollHeight;return d};
  function addSuggestions(items){if(!messages)return;const row=document.createElement('div');row.className='assistant-suggestions';items.forEach(label=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{input.value=label;submitChat()});row.appendChild(b)});messages.appendChild(row);messages.scrollTop=messages.scrollHeight}
  function matchKnowledge(txt){
    const t=normalize(txt), words=new Set(t.split(/\s+/).filter(x=>x.length>2));let best=null,bestScore=0;
    for(const k of assistantKnowledge){const kws=String(k.keywords||'').split(',').map(normalize).filter(Boolean);let score=0;kws.forEach(kw=>{if(t.includes(kw))score+=kw.includes(' ')?5:3});normalize(k.question).split(/\s+/).forEach(w=>{if(words.has(w)&&w.length>3)score+=1});if(score>bestScore){bestScore=score;best=k}}
    return bestScore>=3?best:null;
  }
  function isProjectIntent(t){return /(istiyorum|istiyoruz|yaptırmak|çektirmek|proje|teklif|çalışmak|ihtiyacım|ihtiyacımız)/.test(normalize(t))}
  function guidedReply(txt){
    if(!leadState.stage && isProjectIntent(txt)){leadState.stage='company';return {text:'Memnuniyetle. Süreci hızlandırmak için önce firma / marka adını öğrenebilir miyim?',suggest:[]}}
    if(leadState.stage==='company'){leadState.data.company=txt;leadState.stage='service';return {text:`${txt} için ilerleyelim. En çok hangi alana ihtiyacınız var?`,suggest:['Reels / Video','Sosyal Medya','Fotoğraf','Tasarım','Drone','Web Sitesi']}}
    if(leadState.stage==='service'){leadState.data.service=txt;leadState.stage='goal';return {text:'Bu çalışmayla ana hedefiniz ne?',suggest:['Daha fazla müşteri','Yeni ürün / hizmet duyurusu','Markayı daha profesyonel göstermek','Sosyal medyayı canlandırmak']}}
    if(leadState.stage==='goal'){leadState.data.goal=txt;leadState.stage='timing';return {text:'Ne zaman başlamayı düşünüyorsunuz?',suggest:['En kısa sürede','1–2 hafta','Bu ay','1–3 ay']}}
    if(leadState.stage==='timing'){leadState.data.timing=txt;leadState.stage='budget';return {text:'Yaklaşık bütçe aralığınız var mı?',suggest:['10–25 bin TL','25–50 bin TL','50–100 bin TL','100 bin TL+','Henüz belirlemedim']}}
    if(leadState.stage==='budget'){leadState.data.budget=txt;leadState.stage='contact';return {text:'Son olarak size ulaşabileceğim telefon veya e-posta bilgisini yazabilirsiniz. İsterseniz “Teklif Al” formuna da geçebilirsiniz.',suggest:['Teklif Al formuna geç']}}
    if(leadState.stage==='contact'){
      if(/teklif al formuna geç/i.test(txt)){sessionStorage.setItem('pmAssistantLead',JSON.stringify(leadState.data));location.href='teklif-al.html';return {text:'Brief sayfasına yönlendiriyorum.',suggest:[]}}
      leadState.data.contact=txt;sessionStorage.setItem('pmAssistantLead',JSON.stringify(leadState.data));leadState.stage=null;return {text:'Teşekkürler. Bilgileri not aldım. Teklif Al bölümünde briefi tamamladığınızda proje çok daha hızlı netleşir.',suggest:['Teklif Al formuna geç','Portfolyoyu gör']}
    }
    return null;
  }
  function faqReply(txt){
    const guide=guidedReply(txt);if(guide)return guide;
    const hit=matchKnowledge(txt);if(hit)return {text:hit.answer,suggest:[]};
    const t=normalize(txt);
    if(/merhaba|selam|hey/.test(t))return {text:'Merhaba. Reels, sosyal medya, fotoğraf, tasarım, drone, web, spor ve konser prodüksiyonu hakkında sorabilirsin. Bir proje düşünüyorsan firma adını da yazabilirsin.',suggest:['Reels süreci nasıl?','Sosyal medya yönetimi','Fiyat nasıl belirleniyor?']};
    return {text:'Bu konuda en doğru yönlendirmeyi yapabilmem için firma / sektör, istediğin iş ve hedefini bir cümleyle yaz. Örneğin “bir restoran için aylık Reels ve sosyal medya yönetimi istiyorum” diyebilirsin.',suggest:['Bir proje başlatmak istiyorum','Hizmetleri anlat','İletişim bilgileri']};
  }
  launch?.addEventListener('click',()=>{assistantPanel?.classList.add('open');if(messages&&!messages.children.length){add('Merhaba. Paroglu Media hakkında aklına takılanları sorabilir veya projen için doğru hizmeti birlikte netleştirebiliriz.');addSuggestions(['Reels süreci nasıl?','Sosyal medya yönetimi','Spor kulübü içerikleri','Konser çekimi','Fiyat nasıl belirleniyor?'])}});
  close?.addEventListener('click',()=>assistantPanel?.classList.remove('open'));
  const submitChat=()=>{const v=input?.value.trim();if(!v)return;add(v,'user');input.value='';$$('.assistant-suggestions',messages).forEach(x=>x.remove());setTimeout(()=>{const r=faqReply(v);add(r.text);if(r.suggest?.length)addSuggestions(r.suggest)},230)};
  send?.addEventListener('click',submitChat);input?.addEventListener('keydown',e=>{if(e.key==='Enter')submitChat()});

  /* ---------------------------------------------------------
     BRIEF FLOW
  --------------------------------------------------------- */
  const steps=$$('.brief-step'); let step=0; const brief={};
  try{Object.assign(brief,JSON.parse(sessionStorage.getItem('pmAssistantLead')||'{}'))}catch{}
  function showStep(n){if(!steps.length)return;step=Math.max(0,Math.min(steps.length-1,n));steps.forEach((s,i)=>s.classList.toggle('active',i===step));const bar=$('.progress span');if(bar)bar.style.width=((step+1)/steps.length*100)+'%';scrollTo({top:0,behavior:'smooth'});if(step===steps.length-1){const box=$('.brief-summary');if(box)box.innerHTML=`<strong>${esc(brief.company||brief.name||'Proje')}</strong><br>${esc(brief.service||'—')} · ${esc(brief.project_type||'—')}<br>${esc(brief.budget||'—')} · ${esc(brief.deadline||'—')}<br>${esc(brief.notes||'')}`}}
  $$('.choice').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.key;const value=b.dataset.value||b.textContent.trim();brief[key==='needType'?'project_type':key==='timeline'?'deadline':key]=value;b.parentElement.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');setTimeout(()=>showStep(step+1),140)}));
  $$('[data-next]').forEach(b=>b.addEventListener('click',()=>{const s=steps[step];$$('input,textarea,select',s).forEach(el=>{const k=el.name;if(!k)return;const map={details:'notes',website:'website',colors:'colors',sector:'sector',channel:'channel'};brief[map[k]||k]=el.value});showStep(step+1)}));
  $$('[data-prev]').forEach(b=>b.addEventListener('click',()=>showStep(step-1)));
  $('[data-submit-brief]')?.addEventListener('click',async e=>{const btn=e.currentTarget;btn.disabled=true;btn.textContent='Gönderiliyor…';try{await PMData.submitBrief({name:brief.name||'',company:brief.company||'',email:brief.email||'',phone:brief.phone||'',service:brief.service||'',project_type:brief.project_type||'',budget:brief.budget||'',deadline:brief.deadline||'',city:brief.city||'',notes:[brief.notes,brief.website&&`Web/IG: ${brief.website}`,brief.colors&&`Renkler: ${brief.colors}`,brief.sector&&`Sektör: ${brief.sector}`,brief.channel&&`İletişim: ${brief.channel}`].filter(Boolean).join('\n'),source:'website'});btn.textContent='Brief alındı ✓';sessionStorage.removeItem('pmAssistantLead')}catch(err){btn.disabled=false;btn.textContent='Tekrar Dene';alert('Brief gönderilemedi: '+err.message)}});

  /* BOOT */
  Promise.resolve(loadContent()).then(()=>loadBrands());
  loadProjects();loadFeatured();loadAssistantKnowledge();
})();

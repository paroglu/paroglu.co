(function(){
  const root=document.documentElement;
  const body=document.body;
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Intro: once per session, branded with the real Paroglu Media logo.
  const intro=document.querySelector('.intro');
  if(intro){
    const seen=sessionStorage.getItem('pm_intro_seen');
    if(seen)intro.remove();
    else{
      const finish=()=>{intro.classList.add('done');sessionStorage.setItem('pm_intro_seen','1')};
      setTimeout(finish,reduceMotion?350:2100);
      setTimeout(()=>intro.remove(),reduceMotion?750:2900);
    }
  }

  // Navigation
  const nav=document.querySelector('.site-nav');
  const onScroll=()=>nav?.classList.toggle('scrolled',scrollY>18);
  onScroll();addEventListener('scroll',onScroll,{passive:true});
  const menuBtn=document.querySelector('.menu-toggle');
  const mobileMenu=document.querySelector('.mobile-menu');
  menuBtn?.addEventListener('click',()=>{const open=mobileMenu?.classList.toggle('open');menuBtn.setAttribute('aria-expanded',open?'true':'false')});
  mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));

  // Reveal
  if(!reduceMotion){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -4%'});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  }else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

  // Language
  const dict={
    tr:{nav_work:'İşler',nav_services:'Hizmetler',nav_about:'Hakkımda',nav_contact:'İletişim',nav_quote:'Teklif Al',hero_title:'Görünen değil, <em>hatırlanan</em> işler üretiyorum.',hero_copy:'Video, fotoğraf, tasarım, sosyal medya, drone ve dijital deneyimleri tek bir kreatif dünyada buluşturuyorum.',discover:'Keşfet',featured:'Seçili İşler',view_all:'Tüm İşleri Gör',brands:'Çalıştığım Markalar',footer_title:'Bir sonraki işi <a href="teklif-al.html">birlikte yapalım.</a>'},
    en:{nav_work:'Work',nav_services:'Services',nav_about:'About',nav_contact:'Contact',nav_quote:'Start a Project',hero_title:'I create work that is not just seen, but <em>remembered.</em>',hero_copy:'Bringing video, photography, design, social media, aerial and digital experiences into one creative world.',discover:'Explore',featured:'Selected Work',view_all:'View All Work',brands:'Selected Clients',footer_title:'Let’s make the next one <a href="teklif-al.html">together.</a>'}
  };
  function applyLang(lang){
    localStorage.setItem('pm_lang',lang);root.lang=lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(dict[lang]?.[key])el.innerHTML=dict[lang][key]});
    document.querySelectorAll('.lang-switch').forEach(b=>b.textContent=lang==='tr'?'TR / EN':'EN / TR');
  }
  let lang=localStorage.getItem('pm_lang');if(!lang)lang=(navigator.language||'tr').toLowerCase().startsWith('tr')?'tr':'en';applyLang(lang);
  document.querySelectorAll('.lang-switch').forEach(b=>b.addEventListener('click',()=>applyLang(root.lang==='tr'?'en':'tr')));

  // Page transition. Fixed duration avoids navigation/layout glitches on tablets.
  const transition=document.querySelector('.page-transition');
  document.querySelectorAll('a[data-transition]').forEach(a=>a.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank')return;
    const href=a.getAttribute('href');if(!href||href.startsWith('#')||href===location.pathname.split('/').pop())return;
    if(reduceMotion)return;
    e.preventDefault();transition?.classList.add('in');setTimeout(()=>location.assign(href),420);
  }));
  if(transition&&!reduceMotion){transition.classList.add('out');setTimeout(()=>transition.classList.remove('out'),620)}

  // Home hero video: play safely on iOS; fallback poster remains visible if autoplay is blocked.
  const heroVideo=document.querySelector('.hero-video-el');
  heroVideo?.play().catch(()=>body.classList.add('video-paused'));

  // Work filters with FLIP animation: no random jumps between different device widths.
  const grid=document.querySelector('.work-grid');
  function animateGridChange(mutator){
    if(!grid){mutator();return}
    const before=new Map([...grid.children].filter(x=>!x.hidden).map(x=>[x,x.getBoundingClientRect()]));
    mutator();
    if(reduceMotion)return;
    requestAnimationFrame(()=>{
      [...grid.children].filter(x=>!x.hidden).forEach((item,i)=>{
        const after=item.getBoundingClientRect(),prev=before.get(item);
        if(prev){
          const dx=prev.left-after.left,dy=prev.top-after.top;
          if(Math.abs(dx)>1||Math.abs(dy)>1)item.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
        }else item.animate([{opacity:0,transform:'translateY(18px) scale(.975)'},{opacity:1,transform:'none'}],{duration:460,delay:i*30,easing:'cubic-bezier(.22,1,.36,1)'});
      });
    });
  }
  const filterBtns=[...document.querySelectorAll('.filter-btn')];
  filterBtns.forEach(btn=>btn.addEventListener('click',()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;
    animateGridChange(()=>document.querySelectorAll('.work-item').forEach(item=>{item.hidden=!(f==='all'||(item.dataset.tags||'').split(',').includes(f))}));
  }));
  document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    animateGridChange(()=>grid?.classList.toggle('showreel',btn.dataset.view==='showreel'));
  }));

  // Load CMS projects/brands when backend is configured. Hardcoded showcase remains as a graceful fallback.
  async function loadPublicCMS(){
    if(!window.PMData?.configured?.())return;
    try{
      const [projects,brands]=await Promise.all([PMData.getPublic('projects'),PMData.getPublic('brands')]);
      if(grid&&Array.isArray(projects)){
        const names=new Set([...grid.querySelectorAll('.project-meta h3')].map(x=>x.textContent.trim().toLowerCase()));
        projects.filter(p=>p.published!==false&&!names.has(String(p.title||'').toLowerCase())).forEach(p=>{
          const wrap=document.createElement('article');wrap.className='work-item reveal visible';wrap.dataset.tags=(p.tags||'').toLowerCase().replace(/\s+/g,'').replaceAll('reels','film').replaceAll('fotoğraf','photo').replaceAll('tasarım','design').replaceAll('sosyalmedya','social').replaceAll('konser','concert').replaceAll('spor','sport');
          const style=p.cover_url?` style="background-image:linear-gradient(180deg,transparent 42%,rgba(0,0,0,.82)),url('${String(p.cover_url).replaceAll("'","%27")}')"`:'';
          wrap.innerHTML=`<a class="project-card" ${p.project_url?`href="${p.project_url}" target="_blank"`: 'href="#" onclick="return false"'}><div class="project-visual visual-design"${style}></div><div class="project-meta"><div><div class="eyebrow">${p.client||'Paroglu Media'} · ${p.year||''}</div><h3>${p.title||'Yeni Proje'}</h3><div class="project-tags">${p.tags||'Tasarım'}</div></div><div class="view-chip">↗</div></div></a>`;
          grid.appendChild(wrap);
        });
      }
      const rows=[...document.querySelectorAll('[data-brand-marquee]')];
      if(rows.length&&Array.isArray(brands)&&brands.length){
        const visible=brands.filter(b=>b.visible!==false);const doubled=[...visible,...visible];
        rows.forEach((row,ri)=>{const ordered=ri%2?[...doubled].reverse():doubled;row.innerHTML=ordered.map(b=>`<a class="brand-pill" ${b.url?`href="${b.url}" target="_blank" rel="noopener"`:''}>${b.logo_url?`<img src="${b.logo_url}" alt="${b.name}">`:`${b.name}`}</a>`).join('')});
      }
    }catch(err){console.info('CMS fallback active:',err.message)}
  }
  loadPublicCMS();

  // Services: expandable details with a clear next action.
  document.querySelectorAll('[data-service-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
    const service=btn.closest('[data-service]');const open=service.classList.toggle('open');btn.setAttribute('aria-expanded',open?'true':'false');btn.querySelector('span')&&(btn.querySelector('span').textContent=open?'Kapat':'Detayı Gör');
  }));

  // Assistant: local intelligent sales/FAQ flow. It works without exposing an API key on GitHub Pages.
  const launch=document.querySelector('.assistant-launch'),panel=document.querySelector('.assistant-panel'),close=document.querySelector('.assistant-close'),messages=document.querySelector('.messages'),input=document.querySelector('.assistant-input input'),send=document.querySelector('.assistant-input button');
  const ai={mode:'idle',stage:0,data:{}};
  const serviceLabels={video:'Video / Reels',design:'Grafik Tasarım',social:'Sosyal Medya',photo:'Fotoğraf',drone:'Drone',web:'Web / Digital'};
  function bot(text,quick=[]){if(!messages)return;const m=document.createElement('div');m.className='message bot';m.innerHTML=text;if(quick.length){const q=document.createElement('div');q.className='quick-replies';quick.forEach(x=>{const b=document.createElement('button');b.type='button';b.textContent=x;b.onclick=()=>handleUser(x);q.appendChild(b)});m.appendChild(q)}messages.appendChild(m);messages.scrollTop=messages.scrollHeight}
  function user(text){if(!messages)return;const m=document.createElement('div');m.className='message user';m.textContent=text;messages.appendChild(m);messages.scrollTop=messages.scrollHeight}
  function normalize(s){return String(s||'').toLocaleLowerCase('tr-TR').replace(/[?.!,;:]/g,' ').replace(/\s+/g,' ').trim()}
  function serviceFrom(t){
    if(/reels|video|film|çekim|prodüksiyon/.test(t))return 'video';if(/tasarım|grafik|afiş|logo|banner/.test(t))return 'design';if(/sosyal medya|instagram|sayfa yönet/.test(t))return 'social';if(/foto|fotoğraf/.test(t))return 'photo';if(/drone|fpv|hava çek/.test(t))return 'drone';if(/web|site|landing|digital|dijital/.test(t))return 'web';return '';
  }
  function answerFAQ(t){
    if(/merhaba|selam|sa|hey/.test(t))return 'Merhaba. Paroglu Media’nın işleri, hizmetleri veya çalışma süreciyle ilgili sorabilirsin. Bir proje düşünüyorsan fikrini de birlikte netleştirebiliriz.';
    if(/iletişim|telefon|numara|mail|e posta|whatsapp|ulaş/.test(t))return 'Umut Paroğlu’na <a href="tel:+905416629863">+90 541 662 98 63</a> veya <a href="mailto:umutparoglu87@gmail.com">umutparoglu87@gmail.com</a> üzerinden ulaşabilirsin. İstersen önce burada kısa bir brief de hazırlayabiliriz.';
    if(/hangi hizmet|neler yap|hizmetler/.test(t))return 'Film / Reels, fotoğraf, grafik tasarım, sosyal medya yönetimi, drone çekimi ve yaratıcı web/digital işler üretiyorum. <a href="hizmetler.html">Hizmetleri detaylı gör →</a>';
    if(/fiyat|ücret|ne kadar|bütçe/.test(t))return 'Fiyat; çekim günü, içerik adedi, lokasyon, ekip ve teslim kapsamına göre değişiyor. En sağlıklısı 1 dakikalık brief ile kapsamı netleştirmek. <a href="teklif-al.html">Teklif briefini başlat →</a>';
    if(/kaç gün|ne zaman teslim|teslim süresi|süre/.test(t))return 'Teslim süresi işin kapsamına göre değişiyor. Tekil sosyal medya işleri daha kısa, prodüksiyon ve kapsamlı kampanyalar daha uzun planlanıyor. Net tarihi brief sonrası proje takvimine göre belirliyorum.';
    if(/revize|revizyon/.test(t))return 'Revizyon sayısı ve kapsamı projeye göre teklif aşamasında netleştiriliyor. Amaç baştan doğru brief alıp revizyon ihtiyacını minimumda tutmak.';
    if(/nerede|hangi şehir|şehir|karabük|istanbul|ankara|türkiye/.test(t))return 'Paroglu Media Karabük merkezli çalışıyor; proje ihtiyacına göre farklı şehirlerde çekim ve prodüksiyon planlanabiliyor. Lokasyonu söylersen uygun akışı birlikte çıkarabiliriz.';
    if(/spor|futbol|kulüp/.test(t))return 'Spor tarafında Karabük İdman Yurdu, Kepez Spor ve Çorlu Spor 1947 ile çalışmalar bulunuyor. Karabük İdman Yurdu projesinde Reels, tasarım, fotoğraf ve sosyal medya üretimleri birlikte sergileniyor. <a href="karabuk-idman-yurdu.html">Projeyi incele →</a>';
    if(/konser|sefo|etkinlik/.test(t))return 'Konser ve etkinlik çekimleri portfolyonun ayrı güçlü alanlarından biri. Sefo konser çalışmasını <a href="sefo.html">buradan inceleyebilirsin →</a>';
    if(/portfolyo|işler|örnek/.test(t))return 'Seçili Reels, tasarım, fotoğraf, sosyal medya, drone, spor ve konser işlerini <a href="isler.html">İşler sayfasında</a> görebilirsin.';
    if(/sosyal medya|instagram/.test(t))return 'Sosyal medya hizmeti yalnızca post tasarımı değil; sayfa dili, içerik planı, Reels, çekim ve tasarım bütünlüğünü kapsayabiliyor. İhtiyaca göre aylık düzenli çalışma da planlanabilir.';
    if(/web|site|digital|dijital/.test(t))return 'Web tarafında klasik şablon yerine markaya özel yaratıcı, responsive ve motion odaklı deneyimler tasarlanıyor. Bu sitenin kendisi de bu yaklaşımın bir örneği.';
    if(/drone|fpv/.test(t))return 'Drone tarafında sinematik hava çekimi, mimari/inşaat, etkinlik ve mekân içerikleri üretilebiliyor. Çekim planı lokasyon ve izin şartlarına göre netleştiriliyor.';
    if(/fotoğraf|foto/.test(t))return 'Ürün, spor, etkinlik, portre ve kurumsal fotoğraf çekimleri yapılabiliyor. Kullanım alanına göre çekim planı ve teslim formatı baştan belirleniyor.';
    if(/tasarım|grafik|afiş|banner/.test(t))return 'Grafik tasarım tarafında kampanya görselleri, sosyal medya, afiş, baskı ve marka iletişimi işleri üretiliyor. İstersen ihtiyacını söyle, uygun kapsamı birlikte çıkaralım.';
    if(/reels|video|film|prodüksiyon/.test(t))return 'Video tarafında reklam filmleri, Reels, etkinlik/konser, kurumsal tanıtım, ürün ve mekân içerikleri üretiliyor. Tekil çekim veya düzenli içerik modeli kurulabilir.';
    return '';
  }
  function beginLead(service){ai.mode='lead';ai.stage=1;ai.data={service:service||'Henüz belirlenmedi'};bot(`${service?`<strong>${service}</strong> için başlayalım. `:''}Hangi firma / marka için düşünüyorsun?`)}
  function saveAIPrefill(){localStorage.setItem('pm_ai_prefill',JSON.stringify(ai.data))}
  function handleUser(raw){
    const text=String(raw||'').trim();if(!text)return;user(text);if(input)input.value='';const t=normalize(text);
    if(/brief oluştur|briefi oluştur|teklif al|teklif iste/.test(t)){saveAIPrefill();location.href='teklif-al.html';return}
    if(ai.mode==='lead'){
      if(ai.stage===1){ai.data.company=text;ai.stage=2;setTimeout(()=>bot(`${text} için ana hedefin ne?`,['Daha fazla müşteri','Markayı daha profesyonel göstermek','Yeni ürün / hizmet duyurusu','Sosyal medyayı canlandırmak','Emin değilim']),180);return}
      if(ai.stage===2){ai.data.goal=text;ai.stage=3;setTimeout(()=>bot('Bu iş için nasıl bir zaman planın var?',['Mümkün olan en kısa sürede','1–2 hafta','Bu ay','1–3 ay','Esnek']),180);return}
      if(ai.stage===3){ai.data.timeline=text;ai.stage=4;setTimeout(()=>bot('Yaklaşık bütçe aralığın nedir?',['10.000 TL altı','10.000–25.000 TL','25.000–50.000 TL','50.000–100.000 TL','100.000 TL+','Henüz belirlemedim']),180);return}
      if(ai.stage===4){ai.data.budget=text;ai.stage=5;setTimeout(()=>bot('Son olarak sana ulaşabileceğimiz telefon veya e-posta bilgisini yazabilirsin. İstersen bu adımı brief formunda da tamamlayabilirsin.',['Brief oluştur','İletişimi briefte gireceğim']),180);return}
      if(ai.stage===5){ai.data.contact=text;saveAIPrefill();ai.stage=6;setTimeout(()=>bot('Tamam. Elimizde iyi bir başlangıç briefi var. Formda bilgileri kontrol edip eksikleri tamamlayabilirsin.',['Brief oluştur','Portfolyoyu incele']),180);return}
      const faq=answerFAQ(t);if(faq){bot(faq,['Brief oluştur']);return}
    }
    if(ai.mode==='qa'){
      const faq=answerFAQ(t);if(faq){setTimeout(()=>bot(faq,['Başka bir şey soracağım','Bir proje başlatacağım']),160);return}
      const service=serviceFrom(t);if(service){setTimeout(()=>bot(answerFAQ(t)||`${serviceLabels[service]} hakkında yardımcı olabilirim.`,['Bu hizmet için proje başlat','Başka bir şey soracağım']),160);return}
      setTimeout(()=>bot('Bu sorunun detayına göre Umut’un doğrudan cevap vermesi daha doğru olur. İstersen iletişim bilgisini paylaşayım veya kısa bir proje briefi hazırlayalım.',['İletişim bilgileri','Brief oluştur','Başka bir şey soracağım']),160);return;
    }
    if(/sadece bir şey sor|başka bir şey sor/.test(t)){ai.mode='qa';setTimeout(()=>bot('Tabii. Hizmetler, fiyatlandırma yaklaşımı, teslim süreci, portfolyo veya iletişim hakkında sorabilirsin.'),150);return}
    if(/iletişim bilgileri/.test(t)){bot(answerFAQ('iletişim'));return}
    if(/portfolyoyu incele/.test(t)){location.href='isler.html';return}
    if(/bir proje başlat/.test(t)){beginLead();return}
    const service=serviceFrom(t);
    if(service&&(/istiyorum|yaptır|lazım|ihtiyac|başlat|proje/.test(t))){beginLead(serviceLabels[service]);return}
    const faq=answerFAQ(t);if(faq){ai.mode='qa';setTimeout(()=>bot(faq,['Başka bir şey soracağım','Bir proje başlatacağım']),160);return}
    beginLead(service?serviceLabels[service]:text);
  }
  launch?.addEventListener('click',()=>{panel?.classList.add('open');input?.focus();if(messages&&!messages.children.length)bot('Bir fikrin mi var? Anlat, birlikte şekillendirelim.',['Video / Reels istiyorum','Tasarım yaptırmak istiyorum','Sosyal medya desteği istiyorum','Fotoğraf çekimi istiyorum','Drone çekimi istiyorum','Web sitesi istiyorum','Sadece bir şey soracağım'])});
  close?.addEventListener('click',()=>panel?.classList.remove('open'));send?.addEventListener('click',()=>handleUser(input?.value));input?.addEventListener('keydown',e=>{if(e.key==='Enter')handleUser(input.value)});

  // Brief form
  const steps=[...document.querySelectorAll('.brief-step')];
  if(steps.length){
    let step=0;const data={};const pre=JSON.parse(localStorage.getItem('pm_ai_prefill')||'null');
    if(pre){data.service=pre.service;data.company=pre.company;data.goal=pre.goal;data.budget=pre.budget;data.timeline=pre.timeline;data.contact=pre.contact;localStorage.removeItem('pm_ai_prefill')}
    const progress=document.querySelector('.progress span');
    function show(n){step=Math.max(0,Math.min(steps.length-1,n));steps.forEach((s,i)=>s.classList.toggle('active',i===step));if(progress)progress.style.width=((step+1)/steps.length*100)+'%';if(step===steps.length-1)renderSummary();scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'})}
    document.querySelectorAll('.choice').forEach(c=>c.addEventListener('click',()=>{const group=c.closest('.brief-step');group.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));c.classList.add('selected');data[c.dataset.key]=c.dataset.value||c.textContent.trim();setTimeout(()=>show(step+1),180)}));
    document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.brief-step.active input,.brief-step.active textarea,.brief-step.active select').forEach(i=>data[i.name]=i.value);show(step+1)}));
    document.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',()=>show(step-1)));
    function renderSummary(){document.querySelectorAll('.brief-step input,.brief-step textarea,.brief-step select').forEach(i=>{if(i.value)data[i.name]=i.value});const el=document.querySelector('.brief-summary');if(!el)return;const rows=[['Hizmet',data.service],['İhtiyaç',data.needType],['Bütçe',data.budget],['Zaman',data.timeline],['Firma',data.company],['Ad Soyad',data.name],['Telefon',data.phone||data.contact]];el.innerHTML=rows.filter(x=>x[1]).map(x=>`<div class="summary-row"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('')}
    const submit=document.querySelector('[data-submit-brief]');
    submit?.addEventListener('click',async()=>{
      document.querySelectorAll('.brief-step input,.brief-step textarea,.brief-step select').forEach(i=>{if(i.value)data[i.name]=i.value});
      const payload={service:data.service,need_type:data.needType,budget:data.budget,timeline:data.timeline,company:data.company,name:data.name,phone:data.phone||data.contact,email:data.email,goal:data.goal,message:data.details,sector:data.sector,website:data.website,colors:data.colors,channel:data.channel};
      submit.disabled=true;submit.textContent='Gönderiliyor…';
      try{await window.PMData?.submitBrief(payload);submit.textContent='Brief alındı ✓';bot('Briefin alındı. Umut proje detaylarını inceleyip iletişim bilgin üzerinden dönüş yapacak.');}
      catch(err){submit.disabled=false;submit.textContent='Tekrar Dene';alert('Brief gönderilemedi: '+err.message)}
    });
    if(pre){
      const company=document.querySelector('[name="company"]');if(company)company.value=pre.company||'';
      const phone=document.querySelector('[name="phone"]');if(phone&&pre.contact&&/\d/.test(pre.contact))phone.value=pre.contact;
      const email=document.querySelector('[name="email"]');if(email&&pre.contact&&pre.contact.includes('@'))email.value=pre.contact;
    }
    show(0);
  }
})();

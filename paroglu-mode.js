(() => {
  if (window.__parogluModeLoaded) return;
  window.__parogluModeLoaded = true;

  const reels=['DXoHQSrCNvx','DIBMYMBMxnh','DRPi3SPCExr','DI_meJjsVr-','DKtgLKoo0wK','DcdiUdLsL0n','DcBj3tZtcLP','DQ3Xw3fDGqB','DKZBmjHoR9u','DRBwJYZAsZk','Dc28-L-u1OV','DcBqnqNsfzw','DbyLBaKM7bd'];
  const worlds = [
    {key:'concert', no:'01', title:'Konser', hint:'Sahne · Film · Fotoğraf', href:'konser.html', media:'showreel-sefo.mp4', poster:'concert-sefo-poster.jpg', project:'SEFO — Canlı Sahne'},
    {key:'sport', no:'02', title:'Spor', hint:'Kulüp · Maç Günü · Sosyal', href:'isler.html?filter=sport', image:'cover-karabuk.jpg', project:'Karabük İdman Yurdu'},
    {key:'reels', no:'03', title:'Reels', hint:'Dikey video · Kurgu · Sosyal', href:'isler.html?filter=film', project:'@iamparoglu — Son Reels'},
    {key:'photo', no:'04', title:'Fotoğraf', hint:'Portre · Etkinlik · Konser', href:'fotograf.html', image:'cover-photo.jpg', project:'Konser Fotoğraf Serisi'},
    {key:'drone', no:'05', title:'Drone', hint:'Hava · Mekân · Hikâye', href:'drone.html', image:'cover-drone.jpg', project:'Safranbolu — Havadan'},
    {key:'design', no:'06', title:'Tasarım', hint:'Kampanya · Görsel Sistem', href:'tasarim.html', image:'cover-design.jpg', project:'Seçili Tasarım İşleri'},
    {key:'production', no:'07', title:'Prodüksiyon', hint:'Film · Reklam · Hikâye', href:'isler.html?filter=film', media:'ack-bicak-preview.mp4', poster:'ack-bicak-poster.jpg', project:'ACK Bıçak — Zanaatın İçinden'}
  ];

  const state={index:0, opened:false, scrollY:0, reelIndex:0, reelTimer:null, touchX:null, dragX:null};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const layer=document.createElement('div');
  layer.className='pm9-layer';
  layer.hidden=true;
  layer.setAttribute('role','dialog');
  layer.setAttribute('aria-modal','true');
  layer.setAttribute('aria-label','Paroğlu Mode');
  layer.innerHTML=`
    <div class="pm9-boot" aria-hidden="true"></div>
    <div class="pm9-scan" aria-hidden="true"></div>
    <header class="pm9-hud">
      <div class="pm9-hud-left">
        <strong>IAM PAROĞLU</strong>
        <span>DÜNYAMA HOŞ GELDİN</span>
      </div>
      <nav class="pm9-hud-nav" aria-label="Paroğlu Mode menü">
        <a href="isler.html">İşler</a><a href="hakkimda.html">Hakkımda</a><a href="iletisim.html">İletişim</a>
        <button class="pm9-off" type="button" aria-label="Paroğlu Mode kapat">MODE OFF</button>
      </nav>
    </header>

    <div class="pm9-scene-window" tabindex="0" aria-label="Paroğlu dünyaları">
      <div class="pm9-world-track">
        ${worlds.map((w,i)=>`<section class="pm9-world pm9-world-${esc(w.key)}" data-index="${i}" aria-label="${esc(w.title)} dünyası">
          <div class="pm9-sky-stars" aria-hidden="true"></div>
          <div class="pm9-cloud c1" aria-hidden="true"></div><div class="pm9-cloud c2" aria-hidden="true"></div><div class="pm9-cloud c3" aria-hidden="true"></div>
          <div class="pm9-mountains far" aria-hidden="true"></div><div class="pm9-mountains near" aria-hidden="true"></div><div class="pm9-tree-line" aria-hidden="true"></div>
          <div class="pm9-world-copy">
            <span>UMUT PAROĞLU / GÖRSEL HİKÂYELER</span>
            <h2>IAM PAROGLU</h2>
            <p>Görünen değil, hatırlanan işler üretiyoruz.</p>
          </div>
          <button class="pm9-question" type="button" data-world="${i}" aria-label="${esc(w.title)} dünyasını aç">
            <span class="pm9-qmark">?</span><small>${esc(w.title)}</small>
          </button>
          <div class="pm9-sign" aria-hidden="true"><b>WORLD ${w.no}</b><span>${esc(w.hint)}</span></div>
          <div class="pm9-badge b1" title="Seçili iş">P</div><div class="pm9-badge b2" title="Seçili iş">M</div>
          <div class="pm9-ground" aria-hidden="true"></div>
        </section>`).join('')}
      </div>
    </div>

    <div class="pm9-avatar" aria-hidden="true">
      <span class="hair"></span><span class="head"></span><span class="glasses"></span><span class="torso"></span><span class="camera"></span><span class="arm a1"></span><span class="arm a2"></span><span class="leg l1"></span><span class="leg l2"></span>
    </div>

    <div class="pm9-counter"><span class="pm9-current">01 / 07</span></div>
    <div class="pm9-help"><span>Kaydır, yürü, zıpla. Mantarlı işleri aç.</span></div>
    <div class="pm9-controls" aria-label="Oyun kontrolleri">
      <button type="button" data-move="-1" aria-label="Önceki dünya">←</button>
      <button type="button" data-move="1" aria-label="Sonraki dünya">→</button>
      <button type="button" data-jump aria-label="Zıpla">Zıpla ↑</button>
    </div>
    <button class="pm9-portfolio" type="button" data-open-world>Portföyü aç ↗</button>

    <aside class="pm9-project" aria-hidden="true">
      <button class="pm9-project-close" type="button" aria-label="Projeyi kapat">×</button>
      <div class="pm9-project-media"></div>
      <div class="pm9-project-meta"><span class="pm9-project-kicker">PIXEL → CINEMATIC</span><h3></h3><p></p><a class="pm9-project-link" href="#">Projeyi aç ↗</a></div>
    </aside>

    <aside class="pm9-reels" aria-hidden="true">
      <div class="pm9-reels-head"><div><strong>@iamparoglu</strong><span>REELS / LIVE FEED</span></div><button type="button" class="pm9-reels-close" aria-label="Reels kapat">×</button></div>
      <div class="pm9-reels-stage"><iframe title="Paroğlu Media Instagram Reel" src="about:blank" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
      <div class="pm9-reels-foot"><span class="pm9-reels-count">01 / 13</span><i><b></b></i><div><button data-reel-prev type="button">←</button><button data-reel-next type="button">→</button></div></div>
    </aside>
  `;
  document.body.appendChild(layer);

  const track=layer.querySelector('.pm9-world-track');
  const sceneWindow=layer.querySelector('.pm9-scene-window');
  const current=layer.querySelector('.pm9-current');
  const avatar=layer.querySelector('.pm9-avatar');
  const project=layer.querySelector('.pm9-project');
  const projectMedia=layer.querySelector('.pm9-project-media');
  const projectTitle=layer.querySelector('.pm9-project-meta h3');
  const projectText=layer.querySelector('.pm9-project-meta p');
  const projectLink=layer.querySelector('.pm9-project-link');
  const reelsPanel=layer.querySelector('.pm9-reels');
  const reelFrame=layer.querySelector('.pm9-reels iframe');
  const reelCount=layer.querySelector('.pm9-reels-count');
  const reelProgress=layer.querySelector('.pm9-reels-foot i b');
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setWorld(index, animate=true){
    state.index=(index+worlds.length)%worlds.length;
    const x=state.index*100;
    track.style.transition=(!animate||reduceMotion)?'none':'';
    track.style.transform=`translate3d(-${x}vw,0,0)`;
    current.textContent=`${String(state.index+1).padStart(2,'0')} / ${String(worlds.length).padStart(2,'0')}`;
    layer.dataset.world=worlds[state.index].key;
    avatar.classList.add('walking');
    clearTimeout(setWorld._t);setWorld._t=setTimeout(()=>avatar.classList.remove('walking'),420);
    setTimeout(()=>{if(!animate)track.style.transition=''},30);
  }
  function jump(openAfter=false){
    avatar.classList.remove('jump');void avatar.offsetWidth;avatar.classList.add('jump');
    setTimeout(()=>avatar.classList.remove('jump'),620);
    if(openAfter)setTimeout(openCurrent,300);
  }
  function stopReels(){
    clearInterval(state.reelTimer);state.reelTimer=null;reelFrame.src='about:blank';reelsPanel.classList.remove('open');reelsPanel.setAttribute('aria-hidden','true');
  }
  function loadReel(){
    reelFrame.src=`https://www.instagram.com/reel/${reels[state.reelIndex]}/embed/?autoplay=1`;
    reelCount.textContent=`${String(state.reelIndex+1).padStart(2,'0')} / ${String(reels.length).padStart(2,'0')}`;
    if(!reduceMotion){reelProgress.style.animation='none';void reelProgress.offsetWidth;reelProgress.style.animation='pm9ReelProgress 10s linear forwards'}
  }
  function changeReel(delta=1){state.reelIndex=(state.reelIndex+delta+reels.length)%reels.length;reelFrame.src='about:blank';setTimeout(()=>{if(reelsPanel.classList.contains('open'))loadReel()},100)}
  function openReels(){
    closeProject();reelsPanel.classList.add('open');reelsPanel.setAttribute('aria-hidden','false');loadReel();clearInterval(state.reelTimer);if(!reduceMotion)state.reelTimer=setInterval(()=>changeReel(1),10000);
  }
  function closeProject(){
    project.classList.remove('open');project.setAttribute('aria-hidden','true');projectMedia.innerHTML='';
  }
  function openCurrent(){
    const w=worlds[state.index];
    if(w.key==='reels'){openReels();return}
    stopReels();
    projectMedia.innerHTML='';
    if(w.media){
      const v=document.createElement('video');v.src=w.media;v.poster=w.poster||'';v.autoplay=true;v.muted=true;v.loop=true;v.playsInline=true;v.controls=true;projectMedia.appendChild(v);v.play().catch(()=>{});
    } else if(w.image){
      const img=document.createElement('img');img.src=w.image;img.alt='';projectMedia.appendChild(img);
    }
    projectTitle.textContent=w.project;
    projectText.textContent=w.hint;
    projectLink.href=w.href;
    project.classList.add('open');project.setAttribute('aria-hidden','false');
  }
  function close(){
    if(!state.opened)return;
    state.opened=false;stopReels();closeProject();layer.classList.remove('open','booting');document.documentElement.style.overflow='';document.body.style.overflow='';
    setTimeout(()=>{layer.hidden=true;window.scrollTo({top:state.scrollY,left:0,behavior:'auto'})},520);
    window.dispatchEvent(new CustomEvent('paroglu-mode-change',{detail:{on:false}}));
  }
  function open(){
    if(state.opened)return;
    state.scrollY=scrollY;state.opened=true;layer.hidden=false;document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';
    layer.classList.add('booting');requestAnimationFrame(()=>requestAnimationFrame(()=>layer.classList.add('open')));setWorld(state.index,false);sceneWindow.focus({preventScroll:true});
    setTimeout(()=>layer.classList.remove('booting'),800);window.dispatchEvent(new CustomEvent('paroglu-mode-change',{detail:{on:true}}));
  }

  layer.querySelector('.pm9-off').addEventListener('click',close);
  layer.querySelectorAll('[data-move]').forEach(btn=>btn.addEventListener('click',()=>setWorld(state.index+Number(btn.dataset.move))));
  layer.querySelector('[data-jump]').addEventListener('click',()=>jump(true));
  layer.querySelector('[data-open-world]').addEventListener('click',openCurrent);
  layer.querySelectorAll('.pm9-question').forEach(btn=>btn.addEventListener('click',()=>{setWorld(Number(btn.dataset.world),false);jump(true)}));
  layer.querySelector('.pm9-project-close').addEventListener('click',closeProject);
  layer.querySelector('.pm9-reels-close').addEventListener('click',stopReels);
  layer.querySelector('[data-reel-prev]').addEventListener('click',()=>{changeReel(-1);clearInterval(state.reelTimer);if(!reduceMotion)state.reelTimer=setInterval(()=>changeReel(1),10000)});
  layer.querySelector('[data-reel-next]').addEventListener('click',()=>{changeReel(1);clearInterval(state.reelTimer);if(!reduceMotion)state.reelTimer=setInterval(()=>changeReel(1),10000)});

  sceneWindow.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;state.dragX=e.clientX},{passive:true});
  sceneWindow.addEventListener('pointerup',e=>{if(state.dragX==null)return;const dx=e.clientX-state.dragX;state.dragX=null;if(Math.abs(dx)>55)setWorld(state.index+(dx<0?1:-1))},{passive:true});
  sceneWindow.addEventListener('touchstart',e=>{state.touchX=e.touches[0]?.clientX??null},{passive:true});
  sceneWindow.addEventListener('touchend',e=>{if(state.touchX==null)return;const dx=(e.changedTouches[0]?.clientX??state.touchX)-state.touchX;state.touchX=null;if(Math.abs(dx)>48)setWorld(state.index+(dx<0?1:-1))},{passive:true});

  document.addEventListener('keydown',e=>{
    if(!state.opened)return;
    if(e.key==='Escape'){if(reelsPanel.classList.contains('open'))stopReels();else if(project.classList.contains('open'))closeProject();else close();return}
    if(project.classList.contains('open')||reelsPanel.classList.contains('open'))return;
    if(e.key==='ArrowRight'||e.key.toLowerCase()==='d'){e.preventDefault();setWorld(state.index+1)}
    else if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a'){e.preventDefault();setWorld(state.index-1)}
    else if(e.key==='ArrowUp'||e.key===' '){e.preventDefault();jump(true)}
    else if(e.key==='Enter'){e.preventDefault();openCurrent()}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopReels();if(state.opened)close()}});

  window.ParogluMode={open,close,toggle:()=>state.opened?close():open,get opened(){return state.opened}};
  window.dispatchEvent(new CustomEvent('paroglu-mode-ready'));
})();

(() => {
  if (window.__parogluModeLoaded) return;
  window.__parogluModeLoaded = true;

  const reels=['DXoHQSrCNvx','DIBMYMBMxnh','DRPi3SPCExr','DI_meJjsVr-','DKtgLKoo0wK','DcdiUdLsL0n','DcBj3tZtcLP','DQ3Xw3fDGqB','DKZBmjHoR9u','DRBwJYZAsZk','Dc28-L-u1OV','DcBqnqNsfzw','DbyLBaKM7bd'];

  const worlds=[
    {
      key:'home', no:'01', title:'Ana Dünya', hint:'Paroğlu Universe', bg:'mode-assets/world-home.png',
      headline:'IAM PAROĞLU', sub:'Görünen değil, hatırlanan işler üretiyoruz.',
      nodes:[
        {label:'Konser', world:1}, {label:'Spor', world:2}, {label:'Studio', world:3}, {label:'Prodüksiyon', world:4}
      ]
    },
    {
      key:'concert', no:'02', title:'Konser', hint:'Sahne · Film · Fotoğraf', bg:'mode-assets/world-concert.png',
      headline:'KONSER', sub:'Işık, ses, kalabalık. Anı değil; sahnenin enerjisini kaydediyoruz.',
      nodes:[
        {label:'SEFO', href:'konser-sefo.html', media:'showreel-sefo.mp4', poster:'concert-sefo-poster.jpg'},
        {label:'Dedublüman', href:'konser-dedubluman.html', media:'showreel-dedubluman.mp4', poster:'concert-dedubluman-poster.jpg'},
        {label:'Hakan Peker', href:'konser-hakan-peker.html', media:'showreel-hakan-peker.mp4', poster:'concert-hakan-peker-poster.jpg'},
        {label:'Gökhan Türkmen', href:'konser-gokhan-turkmen.html', image:'cover-gokhan-turkmen.jpg'}
      ]
    },
    {
      key:'sport', no:'03', title:'Spor', hint:'Maç Günü · Sosyal · Tasarım', bg:'mode-assets/world-sport.png',
      headline:'SPOR', sub:'Tribünün sesi, maçın ritmi, kulübün kimliği. Hepsi aynı oyunun içinde.',
      nodes:[
        {label:'Karabük İY', href:'karabuk-idman-yurdu.html', image:'cover-karabuk.jpg'},
        {label:'Kepezspor', href:'kepezspor.html', image:'kepezspor-matchday-01.jpg'},
        {label:'Çorluspor', href:'corluspor.html', image:'corluspor-1947-01.jpg'}
      ]
    },
    {
      key:'studio', no:'04', title:'Studio', hint:'Fotoğraf · Tasarım · Reels', bg:'mode-assets/world-studio.png',
      headline:'STUDIO', sub:'Fikir masada başlar. Kadraja, tasarıma ve akışa dönüşür.',
      nodes:[
        {label:'Fotoğraf', href:'fotograf.html', image:'cover-photo.jpg'},
        {label:'Tasarım', href:'tasarim.html', image:'cover-design.jpg'},
        {label:'Reels', reels:true}
      ]
    },
    {
      key:'production', no:'05', title:'Prodüksiyon', hint:'Film · Drone · Reklam', bg:'mode-assets/world-production.png',
      headline:'PRODÜKSİYON', sub:'Ateş, çelik, hareket. Gerçek dünyanın dokusunu sinematik hale getiriyoruz.',
      nodes:[
        {label:'ACK Bıçak', href:'isler.html?filter=film', media:'ack-bicak-preview.mp4', poster:'ack-bicak-poster.jpg'},
        {label:'Drone', href:'drone.html', image:'cover-drone.jpg'},
        {label:'Tüm işler', href:'isler.html', image:'og-cover.jpg'}
      ]
    }
  ];

  const state={index:0, opened:false, scrollY:0, reelIndex:0, reelTimer:null, touchX:null, playerX:.23, moving:false};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const layer=document.createElement('div');
  layer.className='pm10-layer'; layer.hidden=true; layer.setAttribute('role','dialog'); layer.setAttribute('aria-modal','true'); layer.setAttribute('aria-label','Paroğlu Mode');
  layer.innerHTML=`
    <div class="pm10-transition" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <header class="pm10-hud">
      <div class="pm10-brand"><strong>IAM PAROĞLU</strong><span>DÜNYAMA HOŞ GELDİN</span></div>
      <nav class="pm10-nav" aria-label="Paroğlu Mode menü"><a href="isler.html">İşler</a><a href="hakkimda.html">Hakkımda</a><a href="iletisim.html">İletişim</a><button class="pm10-off" type="button">MODE OFF</button></nav>
    </header>
    <main class="pm10-viewport" tabindex="0">
      <div class="pm10-track">
        ${worlds.map((w,wi)=>`<section class="pm10-world" data-world="${wi}" style="--scene:url('${esc(w.bg)}')">
          <div class="pm10-bg" aria-hidden="true"></div><div class="pm10-glow" aria-hidden="true"></div>
          <div class="pm10-copy"><span>UMUT PAROĞLU / GÖRSEL HİKÂYELER</span><h2>${esc(w.headline)}</h2><p>${esc(w.sub)}</p></div>
          <div class="pm10-world-tag"><b>WORLD ${w.no}</b><span>${esc(w.hint)}</span></div>
          <div class="pm10-nodes">${w.nodes.map((n,ni)=>`<button class="pm10-node" type="button" data-world="${wi}" data-node="${ni}"><i>?</i><small>${esc(n.label)}</small></button>`).join('')}</div>
          <div class="pm10-ground-shine" aria-hidden="true"></div>
        </section>`).join('')}
      </div>
    </main>
    <div class="pm10-avatar" aria-hidden="true"><i></i></div>
    <div class="pm10-counter"><b class="pm10-current">01 / 05</b><span class="pm10-current-title">ANA DÜNYA</span></div>
    <div class="pm10-help">Kaydır, yürü, zıpla. Kutularla işleri aç.</div>
    <div class="pm10-controls"><button type="button" data-move="-1">←</button><button type="button" data-move="1">→</button><button type="button" data-jump>Zıpla ↑</button></div>
    <button class="pm10-portfolio" type="button" data-open-world>Portföyü aç ↗</button>
    <aside class="pm10-project" aria-hidden="true"><button class="pm10-project-close" type="button" aria-label="Projeyi kapat">×</button><div class="pm10-project-media"></div><div class="pm10-project-meta"><span>PIXEL → CINEMATIC</span><h3></h3><p></p><a class="pm10-project-link" href="#">Projeyi aç ↗</a></div></aside>
    <aside class="pm10-reels" aria-hidden="true"><div class="pm10-reels-head"><div><strong>@iamparoglu</strong><span>REELS / LIVE FEED</span></div><button type="button" class="pm10-reels-close">×</button></div><div class="pm10-reels-stage"><iframe title="Paroğlu Media Instagram Reel" src="about:blank" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div><div class="pm10-reels-foot"><span class="pm10-reels-count">01 / 13</span><i><b></b></i><div><button data-reel-prev type="button">←</button><button data-reel-next type="button">→</button></div></div></aside>
  `;
  document.body.appendChild(layer);

  const track=layer.querySelector('.pm10-track'), viewport=layer.querySelector('.pm10-viewport'), avatar=layer.querySelector('.pm10-avatar'), current=layer.querySelector('.pm10-current'), currentTitle=layer.querySelector('.pm10-current-title');
  const project=layer.querySelector('.pm10-project'), projectMedia=layer.querySelector('.pm10-project-media'), projectTitle=layer.querySelector('.pm10-project-meta h3'), projectText=layer.querySelector('.pm10-project-meta p'), projectLink=layer.querySelector('.pm10-project-link');
  const reelsPanel=layer.querySelector('.pm10-reels'), reelFrame=layer.querySelector('.pm10-reels iframe'), reelCount=layer.querySelector('.pm10-reels-count'), reelProgress=layer.querySelector('.pm10-reels-foot i b');
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sceneTransition(){ if(reduceMotion)return; layer.classList.remove('switching'); void layer.offsetWidth; layer.classList.add('switching'); setTimeout(()=>layer.classList.remove('switching'),520); }
  function setWorld(index,animate=true){
    state.index=(index+worlds.length)%worlds.length; const w=worlds[state.index];
    if(animate) sceneTransition();
    track.style.transition=(!animate||reduceMotion)?'none':''; track.style.transform=`translate3d(-${state.index*100}vw,0,0)`;
    current.textContent=`${String(state.index+1).padStart(2,'0')} / ${String(worlds.length).padStart(2,'0')}`; currentTitle.textContent=w.title.toUpperCase(); layer.dataset.world=w.key;
    state.playerX=.23; updateAvatar(); walkPulse(); setTimeout(()=>{if(!animate)track.style.transition=''},40);
  }
  function updateAvatar(){avatar.style.left=`${Math.max(.11,Math.min(.78,state.playerX))*100}%`}
  function walkPulse(){avatar.classList.add('walking'); clearTimeout(walkPulse.t); walkPulse.t=setTimeout(()=>avatar.classList.remove('walking'),460)}
  function movePlayer(delta){state.playerX+=delta*.055; if(state.playerX>.76){setWorld(state.index+1); return} if(state.playerX<.1){setWorld(state.index-1); state.playerX=.72} updateAvatar(); walkPulse()}
  function jump(){avatar.classList.remove('jump'); void avatar.offsetWidth; avatar.classList.add('jump'); setTimeout(()=>avatar.classList.remove('jump'),650)}

  function stopReels(){clearInterval(state.reelTimer); state.reelTimer=null; reelFrame.src='about:blank'; reelsPanel.classList.remove('open'); reelsPanel.setAttribute('aria-hidden','true')}
  function loadReel(){reelFrame.src=`https://www.instagram.com/reel/${reels[state.reelIndex]}/embed/?autoplay=1`; reelCount.textContent=`${String(state.reelIndex+1).padStart(2,'0')} / ${String(reels.length).padStart(2,'0')}`; reelProgress.style.animation='none'; void reelProgress.offsetWidth; if(!reduceMotion)reelProgress.style.animation='pm10Reel 10s linear forwards'}
  function changeReel(d=1){state.reelIndex=(state.reelIndex+d+reels.length)%reels.length; reelFrame.src='about:blank'; setTimeout(()=>{if(reelsPanel.classList.contains('open'))loadReel()},80)}
  function openReels(){closeProject(); reelsPanel.classList.add('open'); reelsPanel.setAttribute('aria-hidden','false'); loadReel(); clearInterval(state.reelTimer); if(!reduceMotion)state.reelTimer=setInterval(()=>changeReel(1),10000)}
  function closeProject(){project.classList.remove('open'); project.setAttribute('aria-hidden','true'); projectMedia.innerHTML=''}
  function openNode(wi,ni){
    const n=worlds[wi].nodes[ni]; if(n.world!==undefined){setWorld(n.world);return} if(n.reels){openReels();return}
    stopReels(); projectMedia.innerHTML='';
    if(n.media){const v=document.createElement('video'); Object.assign(v,{src:n.media,poster:n.poster||'',autoplay:true,muted:true,loop:true,playsInline:true,controls:true}); projectMedia.appendChild(v); v.play().catch(()=>{});} else if(n.image){const img=document.createElement('img'); img.src=n.image; img.alt=''; projectMedia.appendChild(img)}
    projectTitle.textContent=n.label; projectText.textContent=worlds[wi].hint; projectLink.href=n.href||'isler.html'; project.classList.add('open'); project.setAttribute('aria-hidden','false');
  }
  function openCurrent(){const w=worlds[state.index]; if(w.nodes[0]) openNode(state.index,0); else location.href='isler.html'}
  function close(){if(!state.opened)return; state.opened=false; stopReels(); closeProject(); layer.classList.remove('open'); document.documentElement.style.overflow=''; document.body.style.overflow=''; setTimeout(()=>{layer.hidden=true; window.scrollTo({top:state.scrollY,left:0,behavior:'auto'})},360); window.dispatchEvent(new CustomEvent('paroglu-mode-change',{detail:{on:false,source:'mode'}}))}
  function open(){if(state.opened)return; state.opened=true; state.scrollY=scrollY; layer.hidden=false; document.documentElement.style.overflow='hidden'; document.body.style.overflow='hidden'; requestAnimationFrame(()=>layer.classList.add('open')); setWorld(0,false); viewport.focus({preventScroll:true})}

  layer.addEventListener('click',e=>{
    const node=e.target.closest('.pm10-node'); if(node){jump(); setTimeout(()=>openNode(+node.dataset.world,+node.dataset.node),260); return}
    if(e.target.closest('.pm10-off')){close();return} if(e.target.closest('[data-open-world]')){openCurrent();return}
    const mv=e.target.closest('[data-move]'); if(mv){setWorld(state.index+(+mv.dataset.move));return} if(e.target.closest('[data-jump]')){jump();return}
    if(e.target.closest('.pm10-project-close')){closeProject();return} if(e.target.closest('.pm10-reels-close')){stopReels();return}
    if(e.target.closest('[data-reel-prev]')){changeReel(-1);return} if(e.target.closest('[data-reel-next]')){changeReel(1);return}
  });
  document.addEventListener('keydown',e=>{if(!state.opened)return; if(e.key==='Escape'){if(reelsPanel.classList.contains('open'))stopReels(); else if(project.classList.contains('open'))closeProject(); else close(); return} if(['ArrowRight','d','D'].includes(e.key)){e.preventDefault();movePlayer(1)} if(['ArrowLeft','a','A'].includes(e.key)){e.preventDefault();movePlayer(-1)} if([' ','ArrowUp','w','W'].includes(e.key)){e.preventDefault();jump()} if(e.key==='Enter'){openCurrent()}});
  viewport.addEventListener('touchstart',e=>{state.touchX=e.touches[0].clientX},{passive:true}); viewport.addEventListener('touchend',e=>{if(state.touchX==null)return; const dx=e.changedTouches[0].clientX-state.touchX; if(Math.abs(dx)>45)setWorld(state.index+(dx<0?1:-1)); state.touchX=null},{passive:true});
  viewport.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){const r=viewport.getBoundingClientRect(), x=(e.clientX-r.left)/r.width; layer.style.setProperty('--px',`${(x-.5)*18}px`); layer.style.setProperty('--py',`${((e.clientY-r.top)/r.height-.5)*10}px`)}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.opened){stopReels();closeProject()}});
  window.addEventListener('paroglu-mode-change',e=>{if(e.detail&&e.detail.source==='mode')return; e.detail&&e.detail.on?open():close()});
  window.ParogluMode={open,close,toggle:()=>state.opened?close():open,get opened(){return state.opened}};
  window.dispatchEvent(new CustomEvent('paroglu-mode-ready'));
})();

(() => {
  if (window.__parogluModeLoaded) return;
  window.__parogluModeLoaded = true;

  const worlds = [
    {key:'concert', no:'01', title:'Konser', href:'konser.html', label:'Sahne / Film / Fotoğraf'},
    {key:'sport', no:'02', title:'Spor', href:'isler.html?filter=sport', label:'Kulüp / Sosyal / Maç Günü'},
    {key:'photo', no:'03', title:'Fotoğraf', href:'fotograf.html', label:'Portre / Etkinlik / Konser'},
    {key:'design', no:'04', title:'Tasarım', href:'tasarim.html', label:'Kampanya / Görsel Sistem'},
    {key:'drone', no:'05', title:'Drone', href:'drone.html', label:'Hava / Mekân / Hikâye'},
    {key:'reels', no:'06', title:'Video / Reels', href:'isler.html?filter=film', label:'Dikey Video / Kurgu'},
    {key:'web', no:'07', title:'Dijital', href:'hizmetler.html', label:'Web / Dijital Deneyim'}
  ];

  const state = {index:0, scrollY:0, walkTimer:null, opened:false};
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const layer = document.createElement('div');
  layer.className = 'pm-mode-layer';
  layer.setAttribute('role','dialog');
  layer.setAttribute('aria-modal','true');
  layer.setAttribute('aria-label','Paroğlu Mode');
  layer.innerHTML = `
    <div class="pm-mode-flash"></div>
    <div class="pm-mode-topbar">
      <div class="pm-mode-brand"><span class="pm-mode-brand-mark">PM</span><span>PAROĞLU MODE<small>PIXEL PORTFOLIO / 01</small></span></div>
      <div class="pm-mode-actions"><button class="pm-mode-help" type="button" aria-label="Kontroller">← → / A D</button><button class="pm-mode-off" type="button">MODE OFF</button></div>
    </div>
    <div class="pm-mode-stage">
      <div class="pm-mode-copy"><div class="eyebrow">SELECT A WORLD</div><h2>İşleri <em>oynayarak</em><br>keşfet.</h2><p>Kaydır, yön tuşlarını kullan veya bir dünyaya dokun. Proje sayfaları yine normal, hızlı ve profesyonel görünümde açılır.</p></div>
      <div class="pm-level-viewport" tabindex="0" aria-label="Proje dünyaları"><div class="pm-level-track">
        ${worlds.map((w,i)=>`<a class="pm-world pm-world-${esc(w.key)}${i===0?' is-active':''}" href="${esc(w.href)}" data-index="${i}" aria-label="${esc(w.title)} projelerini aç"><div class="pm-world-art"></div><div class="pm-world-info"><div><div class="pm-world-no">WORLD ${esc(w.no)} · ${esc(w.label)}</div><div class="pm-world-title">${esc(w.title)}</div></div><span class="pm-world-go">↗</span></div></a>`).join('')}
      </div></div>
      <div class="pm-mode-floor"></div>
      <div class="pm-avatar" aria-hidden="true"><i class="pm-avatar-head"></i><i class="pm-avatar-body"></i><i class="pm-avatar-leg one"></i><i class="pm-avatar-leg two"></i></div>
    </div>
    <div class="pm-mode-bottom"><span>DRAG / SWIPE TO MOVE</span><span class="pm-mode-current">WORLD 01 / ${worlds.length.toString().padStart(2,'0')} · KONSER</span><span class="pm-mode-controls"><span><b>A D</b> MOVE</span><span><b>ENTER</b> OPEN</span><span><b>ESC</b> OFF</span></span></div>
    <div class="pm-mode-mobile-controls"><button type="button" data-move="-1" aria-label="Önceki dünya">←</button><button type="button" data-open aria-label="Dünyayı aç">↗</button><button type="button" data-move="1" aria-label="Sonraki dünya">→</button></div>`;
  document.body.appendChild(layer);

  const viewport = layer.querySelector('.pm-level-viewport');
  const cards = [...layer.querySelectorAll('.pm-world')];
  const current = layer.querySelector('.pm-mode-current');
  const off = layer.querySelector('.pm-mode-off');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function syncActive(idx){
    idx = Math.max(0, Math.min(worlds.length - 1, idx));
    if (idx === state.index && cards[idx].classList.contains('is-active')) return;
    state.index = idx;
    cards.forEach((c,i)=>c.classList.toggle('is-active', i===idx));
    const w = worlds[idx];
    current.textContent = `WORLD ${w.no} / ${worlds.length.toString().padStart(2,'0')} · ${w.title.toUpperCase()}`;
  }
  function centerIndex(idx, smooth=true){
    const c = cards[idx]; if(!c) return;
    syncActive(idx);
    c.scrollIntoView({behavior: smooth && !reduceMotion ? 'smooth':'auto', inline:'center', block:'nearest'});
  }
  function showWalking(){
    layer.classList.add('is-walking');
    clearTimeout(state.walkTimer);
    state.walkTimer = setTimeout(()=>layer.classList.remove('is-walking'),180);
  }
  let raf=0;
  viewport.addEventListener('scroll',()=>{
    showWalking();
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const vr=viewport.getBoundingClientRect(), centerX=vr.left+vr.width/2;
      let best=0,dist=Infinity;
      cards.forEach((c,i)=>{const r=c.getBoundingClientRect(), d=Math.abs((r.left+r.width/2)-centerX);if(d<dist){dist=d;best=i}});
      syncActive(best);
    });
  },{passive:true});

  function close(){
    if(!state.opened) return;
    state.opened=false;
    layer.classList.remove('is-open','is-opening','is-walking');
    document.documentElement.style.overflow='';
    document.body.style.overflow='';
    window.scrollTo({top:state.scrollY,left:0,behavior:'auto'});
    window.dispatchEvent(new CustomEvent('paroglu-mode-change',{detail:{on:false}}));
    setTimeout(()=>{layer.hidden=true},650);
  }
  function open(){
    if(state.opened) return;
    state.scrollY=window.scrollY;
    state.opened=true;
    layer.hidden=false;
    document.documentElement.style.overflow='hidden';
    document.body.style.overflow='hidden';
    layer.classList.add('is-opening');
    requestAnimationFrame(()=>requestAnimationFrame(()=>layer.classList.add('is-open')));
    setTimeout(()=>layer.classList.remove('is-opening'),760);
    setTimeout(()=>centerIndex(state.index,false),40);
    viewport.focus({preventScroll:true});
    window.dispatchEvent(new CustomEvent('paroglu-mode-change',{detail:{on:true}}));
  }

  off.addEventListener('click',close);
  layer.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>centerIndex(state.index+Number(b.dataset.move))));
  layer.querySelector('[data-open]').addEventListener('click',()=>cards[state.index].click());
  layer.addEventListener('keydown',e=>{
    if(!state.opened) return;
    if(e.key==='Escape'){e.preventDefault();close();return}
    if(e.key==='ArrowRight'||e.key.toLowerCase()==='d'){e.preventDefault();centerIndex(state.index+1);return}
    if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a'){e.preventDefault();centerIndex(state.index-1);return}
    if(e.key==='Enter' && document.activeElement===viewport){e.preventDefault();cards[state.index].click()}
  });
  document.addEventListener('keydown',e=>{if(state.opened&&e.key==='Escape')close()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.opened)close()});

  window.ParogluMode = {open, close, toggle:()=>state.opened?close():open, get opened(){return state.opened}};
  window.dispatchEvent(new CustomEvent('paroglu-mode-ready'));
})();

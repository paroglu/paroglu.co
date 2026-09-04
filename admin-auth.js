(() => {
  const gate=document.getElementById('adminGate'),app=document.getElementById('adminApp'),form=document.getElementById('adminLoginForm'),status=document.getElementById('adminLoginStatus'),notice=document.getElementById('adminSetupNotice'),logoutBtn=document.getElementById('adminLogout'),progress=document.getElementById('adminAuthProgress'),cfg=window.PM_BACKEND||{};
  const configured=cfg.supabaseUrl&&cfg.supabaseAnonKey&&!cfg.supabaseUrl.includes('BURAYA_')&&!cfg.supabaseAnonKey.includes('BURAYA_')&&!cfg.supabaseAnonKey.endsWith('...');
  const setProgress=(text,state='loading')=>{if(!progress)return;progress.classList.add('show');progress.classList.toggle('success',state==='success');const b=progress.querySelector('b');if(b)b.textContent=text};
  const hideProgress=()=>progress?.classList.remove('show','success');
  const showGate=()=>{gate.hidden=false;gate.classList.remove('auth-success');app.hidden=true;window.scrollTo(0,0);hideProgress()};
  if(!configured||!window.supabase){if(notice)notice.hidden=false;if(form)form.querySelector('button[type="submit"]').disabled=true;showGate();return}
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});window.PMSupabase=client;
  const isAdmin=user=>user?.email?.toLowerCase()===String(cfg.adminEmail||'').toLowerCase();
  async function showApp(animate=true){
    window.scrollTo(0,0);setProgress('Giriş başarılı. Panel hazırlanıyor…','success');
    if(animate){gate.classList.add('auth-success');await new Promise(r=>setTimeout(r,420))}
    gate.hidden=true;gate.classList.remove('auth-success');app.hidden=false;app.classList.remove('admin-app-enter');void app.offsetWidth;app.classList.add('admin-app-enter');window.scrollTo(0,0);
    if(window.PMAdminPanel?.loadAll)await window.PMAdminPanel.loadAll();
  }
  async function apply(session){
    setProgress('Oturum doğrulanıyor…');
    if(session?.user&&isAdmin(session.user))return showApp(false);
    if(session?.user&&!isAdmin(session.user))await client.auth.signOut();
    showGate();
  }
  client.auth.getSession().then(({data})=>apply(data.session)).catch(()=>showGate());
  client.auth.onAuthStateChange((_e,s)=>{if(s?.user&&isAdmin(s.user)&&app.hidden)showApp(false)});
  form?.addEventListener('submit',async e=>{
    e.preventDefault();status.textContent='';setProgress('E-posta ve şifre doğrulanıyor…');
    const fd=new FormData(form),email=String(fd.get('email')||'').trim().toLowerCase(),password=String(fd.get('password')||'');
    if(email!==String(cfg.adminEmail).toLowerCase()){hideProgress();status.textContent='Bu hesap yönetici olarak yetkili değil.';return}
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error){hideProgress();status.textContent='Giriş başarısız: e-posta veya şifre hatalı.';return}
    if(!isAdmin(data.user)){await client.auth.signOut();hideProgress();status.textContent='Bu hesap yönetici olarak yetkili değil.';return}
    await showApp(true);
  });
  logoutBtn?.addEventListener('click',async()=>{await client.auth.signOut();showGate()});
})();

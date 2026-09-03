(() => {
  const gate=document.getElementById('adminGate'),app=document.getElementById('adminApp'),form=document.getElementById('adminLoginForm'),status=document.getElementById('adminLoginStatus'),notice=document.getElementById('adminSetupNotice'),logoutBtn=document.getElementById('adminLogout'),cfg=window.PM_BACKEND||{};
  const configured=cfg.supabaseUrl&&cfg.supabaseAnonKey&&!cfg.supabaseUrl.includes('BURAYA_')&&!cfg.supabaseAnonKey.includes('BURAYA_');
  if(!configured||!window.supabase){if(notice)notice.hidden=false;if(form)form.querySelector('button[type="submit"]').disabled=true;return}
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});window.PMSupabase=client;
  const isAdmin=user=>user?.email?.toLowerCase()===String(cfg.adminEmail||'').toLowerCase();
  const showGate=()=>{gate.hidden=false;app.hidden=true};const showApp=async()=>{gate.hidden=true;app.hidden=false;if(window.PMAdminPanel?.loadAll)await window.PMAdminPanel.loadAll()};
  async function apply(session){if(session?.user&&isAdmin(session.user))return showApp();if(session?.user&&!isAdmin(session.user))await client.auth.signOut();showGate()}
  client.auth.getSession().then(({data})=>apply(data.session));client.auth.onAuthStateChange((_e,s)=>apply(s));
  form?.addEventListener('submit',async e=>{e.preventDefault();status.textContent='Giriş kontrol ediliyor…';const fd=new FormData(form),email=String(fd.get('email')||'').trim().toLowerCase(),password=String(fd.get('password')||'');if(email!==String(cfg.adminEmail).toLowerCase()){status.textContent='Bu hesap yönetici olarak yetkili değil.';return}const {data,error}=await client.auth.signInWithPassword({email,password});if(error){status.textContent='Giriş başarısız: e-posta veya şifre hatalı.';return}if(!isAdmin(data.user)){await client.auth.signOut();status.textContent='Bu hesap yönetici olarak yetkili değil.';return}status.textContent='';await showApp()});
  logoutBtn?.addEventListener('click',async()=>{await client.auth.signOut();showGate()});
})();

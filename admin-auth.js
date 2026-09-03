(function(){
  const cfg=window.PM_BACKEND||{};
  const gate=document.getElementById('adminGate');
  const app=document.getElementById('adminApp');
  const form=document.getElementById('adminLoginForm');
  const status=document.getElementById('adminLoginStatus');
  const setup=document.getElementById('adminSetupNotice');
  const configured=Boolean(cfg.supabaseUrl&&cfg.supabaseAnonKey&&cfg.adminEmail);
  const key='pm_admin_session';

  function setStatus(text,error=false){if(status){status.textContent=text;status.classList.toggle('error',error)}}
  async function api(path,options={}){
    const res=await fetch(cfg.supabaseUrl.replace(/\/$/,'')+path,{...options,headers:{apikey:cfg.supabaseAnonKey,'Content-Type':'application/json',...(options.headers||{})}});
    let data={};try{data=await res.json()}catch{}
    if(!res.ok)throw new Error(data.msg||data.message||data.error_description||'Giriş başarısız');
    return data;
  }
  async function verify(session){
    if(!session?.access_token)return false;
    try{
      const user=await api('/auth/v1/user',{headers:{Authorization:`Bearer ${session.access_token}`}});
      return user?.email?.toLowerCase()===cfg.adminEmail.toLowerCase();
    }catch{return false}
  }
  function unlock(session){
    sessionStorage.setItem(key,JSON.stringify(session));
    gate.hidden=true;app.hidden=false;
    window.PMAdmin?.init(session.access_token);
  }
  async function init(){
    if(!configured){
      if(setup)setup.hidden=false;
      form?.querySelectorAll('input,button').forEach(el=>el.disabled=true);
      setStatus('Panel güvenli kimlik doğrulama kurulana kadar kilitli.',true);
      return;
    }
    const saved=JSON.parse(sessionStorage.getItem(key)||'null');
    if(await verify(saved)){unlock(saved);return}
    sessionStorage.removeItem(key);
  }
  form?.addEventListener('submit',async e=>{
    e.preventDefault();setStatus('Giriş kontrol ediliyor…');
    const fd=new FormData(form);const email=String(fd.get('email')||'').trim().toLowerCase();const password=String(fd.get('password')||'');
    if(email!==cfg.adminEmail.toLowerCase()){setStatus('Bu hesap yönetici olarak yetkili değil.',true);return}
    try{
      const session=await api('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
      if(!(await verify(session)))throw new Error('Yönetici doğrulanamadı');
      unlock(session);
    }catch(err){setStatus(err.message||'Giriş başarısız',true)}
  });
  document.getElementById('adminLogout')?.addEventListener('click',()=>{sessionStorage.removeItem(key);location.reload()});
  init();
})();

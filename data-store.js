(() => {
  const cfg = window.PM_BACKEND || {};
  const configured = cfg.supabaseUrl && cfg.supabaseAnonKey && !cfg.supabaseUrl.includes('BURAYA_') && !cfg.supabaseAnonKey.includes('BURAYA_');
  let clientPromise;
  function getClient(){
    if(!configured) return Promise.resolve(null);
    if(clientPromise) return clientPromise;
    clientPromise = new Promise((resolve,reject)=>{
      const finish=()=>resolve(window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey));
      if(window.supabase) return finish();
      const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'; s.onload=finish; s.onerror=reject; document.head.appendChild(s);
    });
    return clientPromise;
  }
  window.PMData = {
    async projects(){ const c=await getClient(); if(!c)return []; const {data}=await c.from('projects').select('*').eq('published',true).order('created_at',{ascending:false}); return data||[]; },
    async brands(){ const c=await getClient(); if(!c)return []; const {data}=await c.from('brands').select('*').eq('visible',true).order('sort_order',{ascending:true}); return data||[]; },
    async submitBrief(payload){ const c=await getClient(); if(!c) throw new Error('Backend henüz bağlı değil.'); const {error}=await c.from('briefs').insert(payload); if(error) throw error; return true; }
  };
})();

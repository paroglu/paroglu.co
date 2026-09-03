(function(){
  const cfg=()=>window.PM_BACKEND||{};
  const configured=()=>Boolean(cfg().supabaseUrl&&cfg().supabaseAnonKey);
  const baseHeaders=()=>({apikey:cfg().supabaseAnonKey,'Content-Type':'application/json'});
  async function request(path,options={}){
    if(!configured())throw new Error('backend-not-configured');
    const res=await fetch(cfg().supabaseUrl.replace(/\/$/,'')+path,{...options,headers:{...baseHeaders(),...(options.headers||{})}});
    if(!res.ok){let msg='İstek başarısız';try{msg=(await res.json()).message||msg}catch{}throw new Error(msg)}
    const text=await res.text();return text?JSON.parse(text):null;
  }
  async function getPublic(table){
    if(!configured())return null;
    const order=table==='brands'?'sort_order.asc,created_at.desc':'created_at.desc';return request(`/rest/v1/${table}?select=*&order=${order}`,{headers:{Prefer:'return=representation'}});
  }
  async function submitBrief(payload){
    const clean={...payload,created_at:payload.createdAt||new Date().toISOString(),status:'Yeni'};
    delete clean.createdAt;
    if(configured()){
      await request('/rest/v1/briefs',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(clean)});
      return {remote:true};
    }
    const arr=JSON.parse(localStorage.getItem('pm_briefs')||'[]');arr.unshift({...payload,createdAt:new Date().toISOString(),status:'Yeni'});localStorage.setItem('pm_briefs',JSON.stringify(arr));
    return {remote:false};
  }
  window.PMData={configured,getPublic,submitBrief,request};
})();

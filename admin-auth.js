(() => {
  const gate = document.getElementById('adminGate');
  const app = document.getElementById('adminApp');
  const form = document.getElementById('adminLoginForm');
  const status = document.getElementById('adminLoginStatus');
  const notice = document.getElementById('adminSetupNotice');
  const logoutBtn = document.getElementById('adminLogout');
  const cfg = window.PM_BACKEND || {};

  const configured = cfg.supabaseUrl && cfg.supabaseAnonKey &&
    !cfg.supabaseUrl.includes('BURAYA_') && !cfg.supabaseAnonKey.includes('BURAYA_');

  if (!configured || !window.supabase) {
    if (notice) notice.hidden = false;
    if (form) form.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.PMSupabase = client;

  const isAdmin = (user) => user?.email?.toLowerCase() === cfg.adminEmail.toLowerCase();
  const showGate = () => { gate.hidden = false; app.hidden = true; };
  const showApp = async () => {
    gate.hidden = true;
    app.hidden = false;
    if (window.PMAdminPanel?.loadAll) await window.PMAdminPanel.loadAll();
  };

  async function applySession(session) {
    if (session?.user && isAdmin(session.user)) return showApp();
    if (session?.user && !isAdmin(session.user)) await client.auth.signOut();
    showGate();
  }

  client.auth.getSession().then(({ data }) => applySession(data.session));
  client.auth.onAuthStateChange((_event, session) => applySession(session));

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Giriş kontrol ediliyor…';
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const password = String(fd.get('password') || '');
    if (email !== cfg.adminEmail.toLowerCase()) {
      status.textContent = 'Bu hesap yönetici olarak yetkili değil.';
      return;
    }
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      status.textContent = 'Giriş başarısız: e-posta veya şifre hatalı.';
      return;
    }
    if (!isAdmin(data.user)) {
      await client.auth.signOut();
      status.textContent = 'Bu hesap yönetici olarak yetkili değil.';
      return;
    }
    status.textContent = '';
    await showApp();
  });

  logoutBtn?.addEventListener('click', async () => {
    await client.auth.signOut();
    showGate();
  });
})();

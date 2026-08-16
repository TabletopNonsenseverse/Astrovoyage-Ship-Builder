(() => {
  const SUPABASE_URL = window.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
  const app = document.getElementById('app');
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !window.supabase) {
    app.innerHTML = '<div style="max-width:680px;margin:80px auto;padding:32px;color:#fff;background:#111827;border-radius:16px;font-family:system-ui"><h1>Astrovoyage Ship Builder</h1><p>Supabase configuration is missing.</p></div>';
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.astroAuth = client;

  const style = document.createElement('style');
  style.textContent = `
    #astro-auth{min-height:100vh;display:grid;place-items:center;padding:24px;background:#080c16;color:#fff;font-family:system-ui,sans-serif}
    .astro-auth-card{width:min(460px,100%);padding:32px;border:1px solid #27324a;border-radius:18px;background:#101727;box-shadow:0 20px 60px #0008}
    .astro-auth-card h1{margin:0 0 8px}.astro-auth-card p{color:#aeb8cb}.astro-auth-card label{display:block;margin:16px 0 6px;font-size:13px;color:#aeb8cb}.astro-auth-card input{width:100%;box-sizing:border-box;padding:12px;border-radius:9px;border:1px solid #35415b;background:#0b1120;color:#fff}
    .astro-auth-card button{margin-top:18px;width:100%;padding:12px;border:0;border-radius:9px;background:#5d7cff;color:#fff;font-weight:700;cursor:pointer}.astro-auth-card .secondary{background:#263149}.astro-auth-error{color:#ff9b9b;min-height:22px;margin-top:12px;font-size:13px}
    #astro-library{min-height:100vh;padding:40px;box-sizing:border-box;background:#080c16;color:#fff;font-family:system-ui,sans-serif}#astro-library .wrap{max-width:1000px;margin:auto}#astro-library header{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:28px}#astro-library h1{margin:0}#astro-library .ship-card{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:18px 20px;margin:12px 0;background:#101727;border:1px solid #27324a;border-radius:14px}#astro-library .muted{color:#9da8bd}#astro-library button{padding:9px 14px;border-radius:8px;border:1px solid #35415b;background:#182238;color:#fff;cursor:pointer;margin-left:6px}.astro-primary{background:#5d7cff!important;border-color:#5d7cff!important}
  `;
  document.head.appendChild(style);

  function authScreen(message='') {
    app.innerHTML = `<div id="astro-auth"><div class="astro-auth-card"><h1>Astrovoyage Ship Builder</h1><p>Sign in to keep your ships private and separate from other players.</p><form id="astro-login"><label>Email</label><input id="astro-email" type="email" autocomplete="email" required><label>Password</label><input id="astro-password" type="password" autocomplete="current-password" minlength="6" required><div class="astro-auth-error">${message}</div><button type="submit">Sign in</button><button type="button" class="secondary" id="astro-signup">Create account</button></form></div></div>`;
    document.getElementById('astro-login').onsubmit = async e => {
      e.preventDefault();
      const email = document.getElementById('astro-email').value.trim();
      const password = document.getElementById('astro-password').value;
      const {error} = await client.auth.signInWithPassword({email,password});
      if(error) authScreen(error.message); else startApp();
    };
    document.getElementById('astro-signup').onclick = async () => {
      const email = document.getElementById('astro-email').value.trim();
      const password = document.getElementById('astro-password').value;
      if(!email || password.length < 6){ authScreen('Enter an email and a password of at least 6 characters.'); return; }
      const {data,error} = await client.auth.signUp({email,password});
      if(error){ authScreen(error.message); return; }
      if(data.session) startApp(); else authScreen('Account created. Check your email to confirm your account, then sign in.');
    };
  }

  async function startApp(){
    const {data:{session}} = await client.auth.getSession();
    if(!session){authScreen();return;}
    app.innerHTML='';
    for(const src of ['app.js','pdf-export.js','enhancements.js','builder.js','layout-fix.js','cargo-weapon-fix.js','live-status-fix.js','cp-direct.js?v=3']){
      await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
    }
    addAccountControls();
  }

  function addAccountControls(){
    const header = document.querySelector('.topbar .actions');
    if(!header || document.getElementById('astro-account-btn')) return;
    const btn=document.createElement('button');btn.id='astro-account-btn';btn.className='btn';btn.textContent='My Ships';btn.onclick=showLibrary;header.prepend(btn);
    const out=document.createElement('button');out.className='btn';out.textContent='Sign out';out.onclick=async()=>{await client.auth.signOut();location.href=location.pathname};header.appendChild(out);
  }

  async function showLibrary(){
    const {data:{user}}=await client.auth.getUser();
    if(!user)return authScreen();
    const {data,error}=await client.from('ships').select('token,data,created_at,updated_at').order('updated_at',{ascending:false});
    if(error){alert('Ship Library is not ready yet. Apply the Supabase ownership migration first.');return;}
    app.innerHTML=`<div id="astro-library"><div class="wrap"><header><div><div class="muted">ASTROVOYAGE</div><h1>My Ships</h1><div class="muted">${user.email}</div></div><div><button class="astro-primary" id="astro-new">New Ship</button><button id="astro-back">Back to Builder</button></div></header><div id="astro-ships">${(data||[]).map(row=>{const d=row.data||{};return `<div class="ship-card"><div><strong>${escapeHtml(d.name||'Unnamed Vessel')}</strong><div class="muted">${escapeHtml(d.hull||'Unknown hull')} · ${row.updated_at?new Date(row.updated_at).toLocaleString():''}</div></div><div><button class="astro-open" data-token="${escapeHtml(row.token)}">Open</button><button class="astro-delete" data-token="${escapeHtml(row.token)}">Delete</button></div></div>`}).join('') || '<p class="muted">No ships yet. Create your first ship.</p>'}</div></div></div>`;
    document.getElementById('astro-back').onclick=()=>location.reload();
    document.getElementById('astro-new').onclick=()=>{location.href=location.pathname+'?new=1'};
    document.querySelectorAll('.astro-open').forEach(b=>b.onclick=()=>{location.href=location.pathname+'?ship='+encodeURIComponent(b.dataset.token)});
    document.querySelectorAll('.astro-delete').forEach(b=>b.onclick=async()=>{if(!confirm('Delete this ship? This cannot be undone.'))return;const {error}=await client.from('ships').delete().eq('token',b.dataset.token);if(error)alert(error.message);else showLibrary();});
  }

  function escapeHtml(v){return String(v||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}

  client.auth.onAuthStateChange((_event,session)=>{if(!session && document.querySelector('.shell')) location.href=location.pathname;});
  startApp();
})();

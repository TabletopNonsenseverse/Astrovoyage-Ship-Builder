(() => {
  if (window.__astroCPFix) return;
  window.__astroCPFix = true;
  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };
  function patch() {
    if (!window.ship || !window.BRIDGES) return;
    const card = [...document.querySelectorAll('.card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (!card) return;
    const stat = [...card.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'COMMAND');
    if (!stat || stat.querySelector('.cp-controls')) return;
    const max = BRIDGES[ship.bridge]?.cp ?? 0;
    let current = Math.min(max, Math.max(0, Number(ship.currentCP ?? max) || 0));
    ship.currentCP = current;
    const value = stat.querySelector('strong');
    if (value) value.textContent = current;
    const controls = document.createElement('span');
    controls.className = 'cp-controls';
    controls.innerHTML = '<button type="button" class="mini cp-minus">−</button><button type="button" class="mini cp-plus">+</button>';
    controls.querySelector('.cp-minus').onclick = () => { ship.currentCP = Math.max(0, (Number(ship.currentCP) || 0) - 1); saveQuiet(); patchValue(); };
    controls.querySelector('.cp-plus').onclick = () => { ship.currentCP = Math.min(BRIDGES[ship.bridge]?.cp ?? 0, (Number(ship.currentCP) || 0) + 1); saveQuiet(); patchValue(); };
    stat.appendChild(controls);
    function patchValue(){ const v=stat.querySelector('strong'); if(v) v.textContent=ship.currentCP; }
  }
  const style=document.createElement('style'); style.textContent='.cp-controls{display:inline-flex;gap:5px;margin-left:8px;vertical-align:middle}.cp-controls .mini{min-width:28px;padding:4px 8px}'; document.head.appendChild(style);
  const root=document.getElementById('app');
  if(root)new MutationObserver(()=>requestAnimationFrame(patch)).observe(root,{childList:true,subtree:true});
  requestAnimationFrame(patch);
})();

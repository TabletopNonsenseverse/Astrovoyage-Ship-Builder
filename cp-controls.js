(() => {
  if (window.__astroCPControlsV2) return;
  window.__astroCPControlsV2 = true;

  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };

  function patch() {
    const shipObj = window.ship;
    if (!shipObj) return;
    const stat = [...document.querySelectorAll('.stat')].find(s => (s.querySelector('small')?.textContent || '').trim().toUpperCase() === 'COMMAND');
    if (!stat || stat.querySelector('.cp-controls-v2')) return;
    const max = (window.BRIDGES && window.BRIDGES[shipObj.bridge]) ? Number(window.BRIDGES[shipObj.bridge].cp) : 0;
    if (shipObj.currentCP == null) shipObj.currentCP = max;
    shipObj.currentCP = Math.max(0, Math.min(max, Number(shipObj.currentCP) || 0));

    const old = stat.querySelector('.mini');
    if (old) old.remove();
    const strong = stat.querySelector('strong');
    if (strong) strong.textContent = shipObj.currentCP;

    const controls = document.createElement('div');
    controls.className = 'cp-controls-v2';
    controls.innerHTML = '<button type="button" class="cp-btn cp-minus" aria-label="Decrease command points">−</button><button type="button" class="cp-btn cp-plus" aria-label="Increase command points">+</button>';
    const update = value => {
      shipObj.currentCP = Math.max(0, Math.min(max, value));
      if (strong) strong.textContent = shipObj.currentCP;
      saveQuiet();
    };
    controls.querySelector('.cp-minus').onclick = e => { e.preventDefault(); e.stopPropagation(); update((Number(shipObj.currentCP)||0)-1); };
    controls.querySelector('.cp-plus').onclick = e => { e.preventDefault(); e.stopPropagation(); update((Number(shipObj.currentCP)||0)+1); };
    stat.appendChild(controls);
  }

  const style = document.createElement('style');
  style.textContent = `.cp-controls-v2{display:flex!important;gap:6px!important;margin-top:8px!important;position:relative!important}.cp-controls-v2 .cp-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:34px!important;height:30px!important;padding:0!important;border:1px solid #53627d!important;border-radius:6px!important;background:#182238!important;color:#fff!important;font-size:18px!important;line-height:1!important;cursor:pointer!important;opacity:1!important;visibility:visible!important}.cp-controls-v2 .cp-btn:hover{filter:brightness(1.2)}`;
  document.head.appendChild(style);

  const root = document.getElementById('app');
  if (root) new MutationObserver(() => requestAnimationFrame(patch)).observe(root, {childList:true, subtree:true});
  window.addEventListener('load', patch);
  setTimeout(patch, 100);
  setTimeout(patch, 500);
  setTimeout(patch, 1500);
})();

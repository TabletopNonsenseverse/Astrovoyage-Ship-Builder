(() => {
  if (window.__astroCPDirect) return;
  window.__astroCPDirect = true;

  function findCommandStat() {
    return [...document.querySelectorAll('.stat')].find(s => (s.querySelector('small')?.textContent || '').trim().toUpperCase() === 'COMMAND');
  }

  function maxCP() {
    try { return Number(BRIDGES[ship.bridge]?.cp || 0); } catch (_) { return 0; }
  }

  function saveCP() {
    try { if (typeof save === 'function') save(false); } catch (_) {}
  }

  function patch() {
    const stat = findCommandStat();
    if (!stat || stat.querySelector('[data-cp-control]')) return;

    const strong = stat.querySelector('strong');
    const current = Math.max(0, Math.min(maxCP(), Number(ship.currentCP ?? maxCP())));
    ship.currentCP = current;
    if (strong) strong.textContent = String(current);

    const controls = document.createElement('span');
    controls.setAttribute('data-cp-control', '1');
    controls.style.cssText = 'display:inline-flex;gap:6px;margin-left:10px;vertical-align:middle;';
    controls.innerHTML = '<button type="button" aria-label="Decrease command points" style="min-width:32px;height:30px;cursor:pointer;">−</button><button type="button" aria-label="Increase command points" style="min-width:32px;height:30px;cursor:pointer;">+</button>';

    controls.children[0].addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      ship.currentCP = Math.max(0, Number(ship.currentCP || 0) - 1);
      if (strong) strong.textContent = String(ship.currentCP);
      saveCP();
    });
    controls.children[1].addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      ship.currentCP = Math.min(maxCP(), Number(ship.currentCP || 0) + 1);
      if (strong) strong.textContent = String(ship.currentCP);
      saveCP();
    });
    stat.appendChild(controls);
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; try { patch(); } catch (_) {} });
  }

  function start() {
    const root = document.getElementById('app');
    if (!root) return;
    new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();

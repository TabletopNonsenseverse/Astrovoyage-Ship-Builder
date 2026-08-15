(() => {
  if (window.__astroCPControls) return;
  window.__astroCPControls = true;

  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };
  const rerender = () => { try { if (typeof render === 'function') render(); } catch (_) {} };

  function patch() {
    if (typeof ship === 'undefined' || !ship) return;
    const stat = [...document.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'COMMAND');
    if (!stat || stat.querySelector('.cp-controls')) return;

    const bridgeCP = typeof BRIDGES !== 'undefined' && BRIDGES[ship.bridge] ? BRIDGES[ship.bridge].cp : 0;
    if (ship.currentCP == null) ship.currentCP = bridgeCP;
    ship.currentCP = Math.max(0, Math.min(bridgeCP, Number(ship.currentCP) || 0));

    const strong = stat.querySelector('strong');
    if (strong) strong.textContent = ship.currentCP;
    const suffix = stat.querySelector('i');
    if (suffix) suffix.textContent = ' CP remaining';

    const controls = document.createElement('div');
    controls.className = 'cp-controls';
    controls.innerHTML = '<button type="button" class="mini cp-down" aria-label="Decrease command points">−</button><button type="button" class="mini cp-up" aria-label="Increase command points">+</button>';
    controls.querySelector('.cp-down').addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      ship.currentCP = Math.max(0, (Number(ship.currentCP) || 0) - 1);
      saveQuiet(); rerender();
    });
    controls.querySelector('.cp-up').addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const max = BRIDGES[ship.bridge]?.cp ?? 0;
      ship.currentCP = Math.min(max, (Number(ship.currentCP) || 0) + 1);
      saveQuiet(); rerender();
    });
    stat.appendChild(controls);
  }

  const style = document.createElement('style');
  style.textContent = `.cp-controls{display:flex;gap:6px;margin-top:8px}.cp-controls .mini{position:static!important;min-width:34px;min-height:30px;cursor:pointer}.cp-controls .cp-up{font-size:18px}.cp-controls .cp-down{font-size:18px}`;
  document.head.appendChild(style);

  let queued = false;
  const run = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; patch(); }); };
  const root = document.getElementById('app');
  if (root) new MutationObserver(run).observe(root, { childList:true, subtree:true });
  run();
})();

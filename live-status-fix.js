(() => {
  if (window.__astroLiveStatusFix) return;
  window.__astroLiveStatusFix = true;

  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };
  const renderNow = () => { try { if (typeof render === 'function') render(); } catch (_) {} };

  function patchLiveStatus() {
    const card = [...document.querySelectorAll('.card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (!card || card.querySelector('.live-status-edit')) return;
    const stats = card.querySelector('.statgrid');
    if (!stats || typeof ship === 'undefined' || !ship) return;

    const labels = [...stats.querySelectorAll('.stat small')].map(x => x.textContent.trim());
    const map = { HULL:'currentHull', SHIELD:'currentShield', POWER:'currentPower', CARGO:'cargoUsed' };
    labels.forEach((label, i) => {
      const key = map[label];
      if (!key) return;
      const stat = stats.querySelectorAll('.stat')[i];
      const old = stat.querySelector('.mini');
      if (old) old.remove();
      const input = document.createElement('input');
      input.className = 'live-edit';
      input.type = 'number';
      input.step = '1';
      input.min = '0';
      input.value = Number(ship[key]) || 0;
      input.title = `Edit ${label}`;
      input.addEventListener('change', () => {
        ship[key] = Number(input.value) || 0;
        if (typeof normalise === 'function') normalise();
        saveQuiet();
        renderNow();
      });
      stat.appendChild(input);
    });

    const badge = document.createElement('div');
    badge.className = 'live-status-edit';
    badge.innerHTML = '<span>Edit current values directly</span>';
    card.querySelector('.card-title')?.appendChild(badge);
  }

  const style = document.createElement('style');
  style.textContent = `.live-edit{display:block;width:100%;box-sizing:border-box;margin-top:8px;background:#0c1422;color:#e8edf7;border:1px solid #394966;border-radius:7px;padding:7px 9px;font:inherit}.live-status-edit{font-size:.72rem;color:#91a1bd;margin-left:auto}.stat .live-edit{max-width:120px}`;
  document.head.appendChild(style);

  let queued = false;
  const run = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; patchLiveStatus(); }); };
  const root = document.getElementById('app');
  if (root) new MutationObserver(run).observe(root, {childList:true, subtree:true});
  run();
})();

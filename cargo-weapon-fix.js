(() => {
  if (window.__astroCargoWeaponFix) return;
  window.__astroCargoWeaponFix = true;

  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };

  function addCargoManifest() {
    if (typeof ship === 'undefined' || !ship) return;
    const stations = document.getElementById('system-stations');
    if (!stations) return;
    const cargo = [...stations.querySelectorAll('.system-block')].find(b => b.querySelector('h3')?.textContent.trim() === 'Cargo');
    if (!cargo || cargo.querySelector('.cargo-manifest')) return;

    ship.cargoManifest = Array.isArray(ship.cargoManifest) ? ship.cargoManifest : [];
    while (ship.cargoManifest.length < 5) ship.cargoManifest.push({type:'', weight:''});

    const box = document.createElement('div');
    box.className = 'cargo-manifest';
    box.innerHTML = `<div class="mod-area"><strong>Cargo Manifest</strong><div class="cargo-grid-head"><span>TYPE</span><span>WEIGHT (TONNES)</span></div>${ship.cargoManifest.slice(0,5).map((r,i) => `<div class="cargo-grid-row"><input type="text" data-cargo-type="${i}" value="${esc(r.type)}" placeholder="Cargo type"><input type="number" min="0" step="0.1" data-cargo-weight="${i}" value="${esc(r.weight)}" placeholder="0"></div>`).join('')}</div>`;
    cargo.appendChild(box);

    box.querySelectorAll('[data-cargo-type]').forEach(input => input.addEventListener('input', () => {
      const i = Number(input.dataset.cargoType);
      ship.cargoManifest[i].type = input.value;
      saveQuiet();
    }));
    box.querySelectorAll('[data-cargo-weight]').forEach(input => input.addEventListener('input', () => {
      const i = Number(input.dataset.cargoWeight);
      ship.cargoManifest[i].weight = input.value;
      saveQuiet();
    }));
  }

  function addWeaponTierResults() {
    if (typeof ship === 'undefined' || !ship || typeof WEAPONS === 'undefined') return;
    const stations = document.getElementById('system-stations');
    if (!stations) return;
    const weapons = [...stations.querySelectorAll('.system-block')].find(b => b.querySelector('h3')?.textContent.trim() === 'Weapons');
    if (!weapons) return;

    const cards = [...weapons.querySelectorAll('.action-card')];
    (ship.weapons || []).forEach((w, i) => {
      const card = cards[i];
      if (!card || card.querySelector('.weapon-tier-results')) return;
      const spec = WEAPONS[w.type];
      if (!spec || !spec.damage) return;
      const values = String(spec.damage).split('/').map(s => s.trim());
      if (values.length !== 3) return;
      const box = document.createElement('div');
      box.className = 'weapon-tier-results action-results';
      box.innerHTML = `<div><b>≤ 11</b> ${esc(values[0])} damage</div><div><b>12–16</b> ${esc(values[1])} damage</div><div><b>≥ 17</b> ${esc(values[2])} damage</div>`;
      card.appendChild(box);
    });
  }

  function run() {
    addCargoManifest();
    addWeaponTierResults();
  }

  const style = document.createElement('style');
  style.textContent = `.cargo-manifest .mod-area{margin-top:14px}.cargo-grid-head,.cargo-grid-row{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:8px}.cargo-grid-head{margin-top:10px;font-size:.7rem;color:#91a1bd}.cargo-grid-row{margin-top:7px}.cargo-grid-row input{width:100%;box-sizing:border-box;background:#0c1422;color:#e8edf7;border:1px solid #394966;border-radius:7px;padding:8px}.weapon-tier-results{display:grid;gap:5px;margin-top:9px}.weapon-tier-results div{display:block;line-height:1.45}.weapon-tier-results b{display:inline-block;min-width:58px}@media(max-width:600px){.cargo-grid-head,.cargo-grid-row{grid-template-columns:1fr 110px}}`;
  document.head.appendChild(style);

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; run(); });
  };

  const root = document.getElementById('app');
  if (root) {
    new MutationObserver(schedule).observe(root, {childList:true, subtree:true});
    schedule();
  }
})();

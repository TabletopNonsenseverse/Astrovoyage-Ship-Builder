(() => {
  if (window.__astroStableUI) return;
  window.__astroStableUI = true;

  const CARGO_ROWS = 5;

  function esc(v) { return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };

  // Keep the existing tiered-result renderer readable: every tier is its own block.
  function formatTieredResults(root = document) {
    root.querySelectorAll('.action-results, .weapon-results, .results').forEach(container => {
      const text = container.textContent || '';
      if (!/≤\s*11|12\s*[–-]\s*16|≥\s*17/.test(text)) return;
      const lines = [...container.querySelectorAll('div')];
      if (lines.length) lines.forEach(x => { x.style.display = 'block'; x.style.marginBottom = '4px'; });
    });
  }

  function cargoData() {
    ship.cargoItems = Array.isArray(ship.cargoItems) ? ship.cargoItems : [];
    while (ship.cargoItems.length < CARGO_ROWS) ship.cargoItems.push({ type: '', weight: '' });
    return ship.cargoItems.slice(0, CARGO_ROWS);
  }

  function cargoMarkup() {
    const rows = cargoData();
    return `<div class="cargo-manifest" style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(130,150,190,.18)">
      <div class="eyebrow">CARGO MANIFEST</div>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) 140px;gap:8px;margin-top:8px;font-size:.72rem;color:#91a1bd"><span>TYPE</span><span>WEIGHT (TONNES)</span></div>
      ${rows.map((r,i)=>`<div class="cargo-row" style="display:grid;grid-template-columns:minmax(0,1fr) 140px;gap:8px;margin-top:7px">
        <input type="text" data-cargo-type="${i}" value="${esc(r.type)}" placeholder="Cargo type">
        <input type="number" min="0" step="0.1" data-cargo-weight="${i}" value="${esc(r.weight)}" placeholder="0">
      </div>`).join('')}
    </div>`;
  }

  function installCargoHandlers(root) {
    root.querySelectorAll('[data-cargo-type]').forEach(input => input.addEventListener('input', () => {
      const i = Number(input.dataset.cargoType); cargoData()[i].type = input.value; saveQuiet();
    }));
    root.querySelectorAll('[data-cargo-weight]').forEach(input => input.addEventListener('input', () => {
      const i = Number(input.dataset.cargoWeight); cargoData()[i].weight = input.value; saveQuiet();
    }));
  }

  function addCargoToCargoStation() {
    const cargoBlock = [...document.querySelectorAll('#system-stations .system-block')].find(b => b.querySelector('h3')?.textContent.trim() === 'Cargo');
    if (!cargoBlock || cargoBlock.querySelector('.cargo-manifest')) return;
    cargoBlock.insertAdjacentHTML('beforeend', cargoMarkup());
    installCargoHandlers(cargoBlock);
  }

  function removeLegacy() {
    const bad = ['core systems','cargo & crew','system damage','installed modifications','combat control','notes'];
    document.querySelectorAll('.grid .card').forEach(card => {
      const h = card.querySelector('h2')?.textContent.trim().toLowerCase();
      if (bad.includes(h)) card.remove();
    });
    document.querySelectorAll('button').forEach(b => {
      const t = b.textContent.trim().toLowerCase();
      if (t === 'combat' || t === 'combat mode' || t === 'exit combat') b.remove();
    });
  }

  function fixLayout() {
    const grid = document.querySelector('.grid');
    if (!grid) return;
    grid.querySelectorAll('.card').forEach(card => {
      if (card.id === 'ships-log') return;
      const h = card.querySelector('h2')?.textContent.trim().toLowerCase();
      if (h === 'travel') card.remove();
    });
    const stations = document.getElementById('system-stations');
    if (stations) {
      const blocks = [...stations.querySelectorAll('.system-block')];
      const power = blocks.find(b => b.querySelector('h3')?.textContent.trim() === 'Power Plant');
      const engineering = blocks.find(b => b.querySelector('h3')?.textContent.trim() === 'Engineering');
      if (power && engineering) {
        const pa = power.querySelector('.system-actions'), ea = engineering.querySelector('.system-actions');
        if (pa && ea) [...ea.querySelectorAll('.action-card')].forEach(card => {
          if (card.querySelector('.action-head strong')?.textContent.trim() === 'Travel') pa.appendChild(card);
        });
      }
      addCargoToCargoStation();
    }
    const log = document.getElementById('ships-log');
    if (log) grid.appendChild(log);
    formatTieredResults(grid);
  }

  function run() {
    removeLegacy();
    fixLayout();
  }

  const app = document.getElementById('app');
  if (!app) return;
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; run(); });
  });
  observer.observe(app, { childList: true, subtree: true });
  requestAnimationFrame(run);
})();

(() => {
  if (window.__astroPowerCapacityFix) return;
  window.__astroPowerCapacityFix = true;

  const capacityOf = name => Number((typeof POWER !== 'undefined' ? POWER[name]?.capacity : 0)) || 0;
  const totalCapacity = () => {
    if (typeof ship === 'undefined' || !ship) return 0;
    return capacityOf(ship.powerPlant) + (ship.extraPowerPlants || []).reduce((n, p) => n + capacityOf(p), 0);
  };

  let lastCapacity = null;
  let syncing = false;

  function syncPower() {
    if (syncing || typeof ship === 'undefined' || !ship) return;
    const cap = totalCapacity();

    if (lastCapacity === null) {
      lastCapacity = cap;
    } else if (cap !== lastCapacity) {
      syncing = true;
      const delta = cap - lastCapacity;
      // Adding/removing a plant changes both capacity and available current power.
      // Preserve any power the crew has already spent, while applying the plant delta.
      ship.currentPower = Math.max(0, Math.min(cap, (Number(ship.currentPower) || 0) + delta));
      lastCapacity = cap;
      try { if (typeof save === 'function') save(false); } catch (_) {}
      syncing = false;
    }

    updateLivePower(cap);
    updatePowerStation(cap);
  }

  function updateLivePower(cap) {
    const card = [...document.querySelectorAll('.grid .card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (!card) return;
    const stat = [...card.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'POWER');
    if (!stat) return;
    const value = Math.max(0, Number(ship.currentPower) || 0);
    const edit = stat.querySelector('.live-edit');
    if (edit) {
      edit.max = String(cap);
      edit.value = String(value);
      return;
    }
    const strong = stat.querySelector('strong');
    if (strong) strong.innerHTML = `${value}<i> / ${cap}</i>`;
  }

  function updatePowerStation(cap) {
    const block = [...document.querySelectorAll('.system-block')].find(b => b.querySelector('h3')?.textContent.trim() === 'Power Plant');
    if (!block) return;
    let summary = block.querySelector('.power-capacity-summary');
    if (!summary) {
      summary = document.createElement('div');
      summary.className = 'power-capacity-summary muted';
      summary.style.marginTop = '10px';
      summary.style.fontWeight = '600';
      const addArea = block.querySelector('.power-add');
      if (addArea) block.insertBefore(summary, addArea);
      else block.appendChild(summary);
    }
    summary.textContent = `Total power capacity: ${cap} units · Current power: ${Number(ship.currentPower) || 0}`;
  }

  const root = document.getElementById('app');
  if (root) {
    new MutationObserver(() => {
      if (!syncing) requestAnimationFrame(syncPower);
    }).observe(root, { childList: true, subtree: true });
  }
  setTimeout(syncPower, 250);
})();

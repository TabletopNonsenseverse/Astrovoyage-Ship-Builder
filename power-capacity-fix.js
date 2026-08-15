(() => {
  if (window.__astroPowerCapacityFix) return;
  window.__astroPowerCapacityFix = true;

  const capacityOf = name => Number(window.POWER?.[name]?.capacity) || 0;
  const totalCapacity = () => {
    if (typeof ship === 'undefined' || !ship) return 0;
    return capacityOf(ship.powerPlant) + (ship.extraPowerPlants || []).reduce((n, p) => n + capacityOf(p), 0);
  };

  let lastCapacity = null;
  let syncing = false;

  function updateLivePower() {
    if (typeof ship === 'undefined' || !ship) return;
    const cap = totalCapacity();
    const card = [...document.querySelectorAll('.grid .card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (!card) return;
    const stat = [...card.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'POWER');
    if (!stat) return;

    const edit = stat.querySelector('.live-edit');
    if (edit) {
      edit.max = String(cap);
      edit.value = String(Math.max(0, Math.min(Number(ship.currentPower) || 0, cap)));
      const maxText = stat.querySelector('strong i');
      if (maxText) maxText.textContent = ` / ${cap}`;
      return;
    }

    const strong = stat.querySelector('strong');
    if (strong) strong.innerHTML = `${Math.max(0, Number(ship.currentPower) || 0)}<i> / ${cap}</i>`;
  }

  function updatePowerStation() {
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
    summary.textContent = `Total power capacity: ${totalCapacity()} units · Current power: ${Number(ship.currentPower) || 0}`;
  }

  function sync() {
    if (syncing || typeof ship === 'undefined' || !ship) return;
    const cap = totalCapacity();
    if (lastCapacity === null) {
      lastCapacity = cap;
      updateLivePower();
      updatePowerStation();
      return;
    }
    if (cap !== lastCapacity) {
      syncing = true;
      const delta = cap - lastCapacity;
      const oldPower = Number(ship.currentPower) || 0;
      ship.currentPower = Math.max(0, Math.min(cap, oldPower + delta));
      lastCapacity = cap;
      try { if (typeof save === 'function') save(false); } catch (_) {}
      updateLivePower();
      updatePowerStation();
      syncing = false;
      return;
    }
    updateLivePower();
    updatePowerStation();
  }

  const root = document.getElementById('app');
  if (root) {
    const observer = new MutationObserver(() => {
      if (!syncing) requestAnimationFrame(sync);
    });
    observer.observe(root, { childList: true, subtree: true });
  }
  setTimeout(sync, 250);
})();

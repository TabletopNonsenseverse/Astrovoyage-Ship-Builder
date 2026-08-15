(() => {
  if (window.__astroCapacityFix) return;
  window.__astroCapacityFix = true;

  function getTotals() {
    if (typeof ship === 'undefined' || !ship || typeof HULLS === 'undefined' || typeof MODS === 'undefined' || typeof POWER === 'undefined') return null;
    const hull = HULLS[ship.hull];
    if (!hull) return null;

    const modificationSpace = (ship.mods || []).reduce((sum, key) => sum + (MODS[key]?.size || 0), 0);
    const extraPowerSpace = (ship.extraPowerPlants || []).reduce((sum, key) => sum + (POWER[key]?.size || 0), 0);
    const cargoCapacity = Math.max(0, hull.cargo - modificationSpace - extraPowerSpace);

    const primary = POWER[ship.powerPlant];
    const primaryCapacity = primary?.capacity || 0;
    const extraPowerCapacity = (ship.extraPowerPlants || []).reduce((sum, key) => sum + (POWER[key]?.capacity || 0), 0);
    const powerCapacity = primaryCapacity + extraPowerCapacity;

    return { cargoCapacity, modificationSpace, extraPowerSpace, powerCapacity };
  }

  function update() {
    const totals = getTotals();
    if (!totals) return;

    const card = [...document.querySelectorAll('.grid .card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (!card) return;

    const stats = [...card.querySelectorAll('.stat')];
    const power = stats.find(s => s.querySelector('small')?.textContent.trim() === 'POWER');
    const cargo = stats.find(s => s.querySelector('small')?.textContent.trim() === 'CARGO');

    if (power) {
      const strong = power.querySelector('strong');
      if (strong) strong.innerHTML = `${Number(ship.currentPower) || 0}<i> / ${totals.powerCapacity}</i>`;
    }

    if (cargo) {
      const strong = cargo.querySelector('strong');
      if (strong) strong.innerHTML = `${Number(ship.cargoUsed) || 0}<i> / ${totals.cargoCapacity} t</i>`;
    }

    const cargoCard = [...document.querySelectorAll('.grid .card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Cargo & Crew');
    if (cargoCard) {
      const usedLine = cargoCard.querySelector('.split');
      if (usedLine) {
        const used = Number(ship.cargoUsed) || 0;
        usedLine.innerHTML = `<b>${used} t used</b><span>${Math.max(0, totals.cargoCapacity - used)} t free</span>`;
      }
      const notes = [...cargoCard.querySelectorAll('.muted')];
      const spaceNote = notes.find(p => p.textContent.includes('modifications occupy'));
      if (spaceNote) {
        spaceNote.textContent = `Hull cargo: ${HULLS[ship.hull].cargo} t · modifications occupy ${totals.modificationSpace} t · additional power plants occupy ${totals.extraPowerSpace} t`;
      }
      const input = cargoCard.querySelector('input[type="number"]');
      if (input) input.max = String(totals.cargoCapacity);
    }
  }

  const root = document.getElementById('app');
  if (root) {
    const observer = new MutationObserver(() => requestAnimationFrame(update));
    observer.observe(root, { childList: true, subtree: true });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-add-mod],[data-remove-mod],#station-add-power,[data-remove-power]')) {
      requestAnimationFrame(update);
      setTimeout(update, 50);
    }
  });

  document.addEventListener('input', event => {
    if (event.target.closest('.money-input')) return;
    requestAnimationFrame(update);
  });

  setTimeout(update, 0);
})();

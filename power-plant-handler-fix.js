(() => {
  if (window.__astroPowerPlantHandlerFix) return;
  window.__astroPowerPlantHandlerFix = true;

  const capacityOf = name => Number(window.POWER?.[name]?.capacity || 0);
  const totalCapacity = () => {
    if (!window.ship) return 0;
    return capacityOf(window.ship.powerPlant) + (window.ship.extraPowerPlants || []).reduce((sum, p) => sum + capacityOf(p), 0);
  };

  function updatePowerDisplay() {
    if (!window.ship) return;
    const cap = totalCapacity();
    const value = Math.max(0, Math.min(cap, Number(window.ship.currentPower) || 0));
    const card = [...document.querySelectorAll('.grid .card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    const stat = card && [...card.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'POWER');
    if (stat) {
      const input = stat.querySelector('.live-edit');
      if (input) {
        input.max = String(cap);
        input.value = String(value);
      } else {
        const strong = stat.querySelector('strong');
        if (strong) strong.innerHTML = `${value}<i> / ${cap}</i>`;
      }
    }
  }

  function restoreScroll(y) {
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
  }

  document.addEventListener('click', event => {
    const add = event.target.closest?.('#station-add-power');
    const remove = event.target.closest?.('[data-remove-power]');
    if (!add && !remove) return;
    if (!window.ship) return;

    const scrollY = window.scrollY;
    const before = Number(window.ship.currentPower) || 0;
    let delta = 0;

    if (add) {
      const select = document.getElementById('station-power-select');
      const plant = select?.value;
      if (!plant) return;
      delta = capacityOf(plant);
    } else {
      const index = Number(remove.dataset.removePower);
      const plant = (window.ship.extraPowerPlants || [])[index];
      if (plant) delta = -capacityOf(plant);
    }

    if (!delta) return;

    // Capture phase runs before the existing station handler. The handler then
    // adds/removes the plant and rebuilds the station without changing power.
    window.ship.currentPower = Math.max(0, before + delta);

    // Prevent the browser's default button behavior from affecting the viewport.
    event.preventDefault();
    restoreScroll(scrollY);
    setTimeout(() => {
      updatePowerDisplay();
      try { if (typeof save === 'function') save(false); } catch (_) {}
      restoreScroll(scrollY);
    }, 0);
  }, true);
})();

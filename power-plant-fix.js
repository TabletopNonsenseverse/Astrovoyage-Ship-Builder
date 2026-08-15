(() => {
  if (window.__astroPowerPlantFix) return;
  window.__astroPowerPlantFix = true;

  const getShip = () => {
    try { return typeof ship !== 'undefined' ? ship : null; } catch (_) { return null; }
  };
  const capacityOf = name => Number((typeof POWER !== 'undefined' ? POWER?.[name]?.capacity : 0) || 0);

  document.addEventListener('click', event => {
    const add = event.target.closest?.('#station-add-power');
    const remove = event.target.closest?.('[data-remove-power]');
    if (!add && !remove) return;

    const s = getShip();
    if (!s) return;

    const scrollY = window.scrollY;
    let delta = 0;

    if (add) {
      const select = document.getElementById('station-power-select');
      const plant = select?.value;
      if (!plant) return;
      delta = capacityOf(plant);
    } else {
      const index = Number(remove.dataset.removePower);
      const plant = (s.extraPowerPlants || [])[index];
      if (!plant) return;
      delta = -capacityOf(plant);
    }

    if (!delta) return;

    // The normal handler only changes extraPowerPlants. Apply the corresponding
    // power change to the same ship object before it re-renders the station.
    const oldPower = Number(s.currentPower);
    s.currentPower = Number.isFinite(oldPower) ? oldPower + delta : delta;

    // The station renderer rebuilds DOM after the normal handler. Restore the
    // user's viewport after that rebuild rather than allowing it to jump home.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
    });
    setTimeout(() => window.scrollTo(0, scrollY), 50);
  }, true);
})();

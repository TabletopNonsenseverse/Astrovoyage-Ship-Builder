(() => {
  if (window.__astroPowerPlantFix) return;
  window.__astroPowerPlantFix = true;

  const getShip = () => { try { return typeof ship !== 'undefined' ? ship : null; } catch (_) { return null; } };
  const capacityOf = name => Number((typeof POWER !== 'undefined' ? POWER?.[name]?.capacity : 0) || 0);
  const totalCapacity = s => capacityOf(s.powerPlant) + (s.extraPowerPlants || []).reduce((n, p) => n + capacityOf(p), 0);

  // The base app's normalise() clamps currentPower to the PRIMARY plant only.
  // Wrap it so additional plants are part of the legal power ceiling.
  if (typeof window.normalise === 'function') {
    const baseNormalise = window.normalise;
    window.normalise = function () {
      baseNormalise();
      const s = getShip();
      if (!s) return;
      const cap = totalCapacity(s);
      s.currentPower = Math.min(Math.max(0, Number(s.currentPower) || 0), cap);
    };
  }

  // Wrap calc() so every existing Live Status renderer sees the combined capacity.
  if (typeof window.calc === 'function') {
    const baseCalc = window.calc;
    window.calc = function () {
      const result = baseCalc();
      const s = getShip();
      if (s && result?.p) result.p = { ...result.p, capacity: totalCapacity(s) };
      return result;
    };
  }

  document.addEventListener('click', event => {
    const add = event.target.closest?.('#station-add-power');
    const remove = event.target.closest?.('[data-remove-power]');
    if (!add && !remove) return;

    const s = getShip();
    if (!s) return;
    const scrollY = window.scrollY;
    let delta = 0;

    if (add) {
      const plant = document.getElementById('station-power-select')?.value;
      if (!plant) return;
      delta = capacityOf(plant);
    } else {
      const index = Number(remove.dataset.removePower);
      const plant = (s.extraPowerPlants || [])[index];
      if (!plant) return;
      delta = -capacityOf(plant);
    }

    if (!delta) return;
    s.currentPower = Math.max(0, (Number(s.currentPower) || 0) + delta);

    // The normal handler performs the actual list mutation and render.
    // Keep the viewport stable after that render.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
    });
    setTimeout(() => window.scrollTo(0, scrollY), 50);
  }, true);
})();

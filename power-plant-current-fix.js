(() => {
  if (window.__astroPowerPlantCurrentFix) return;
  window.__astroPowerPlantCurrentFix = true;

  const capacityOf = name => Number((typeof POWER !== 'undefined' ? POWER[name]?.capacity : 0)) || 0;
  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };

  document.addEventListener('click', event => {
    if (typeof ship === 'undefined' || !ship) return;
    const add = event.target.closest?.('#station-add-power');
    if (add) {
      const select = document.querySelector('#station-power-select');
      const type = select?.value;
      if (!type) return;
      const amount = capacityOf(type);
      ship.currentPower = Math.max(0, (Number(ship.currentPower) || 0) + amount);
      saveQuiet();
      return;
    }

    const remove = event.target.closest?.('[data-remove-power]');
    if (remove) {
      const index = Number(remove.dataset.removePower);
      const type = ship.extraPowerPlants?.[index];
      if (!type) return;
      const amount = capacityOf(type);
      ship.currentPower = Math.max(0, (Number(ship.currentPower) || 0) - amount);
      saveQuiet();
    }
  }, true);
})();

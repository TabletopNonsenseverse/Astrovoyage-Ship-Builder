(() => {
  if (window.__astroPowerPlantFix) return;
  window.__astroPowerPlantFix = true;

  function extraCapacity(s) {
    return (s?.extraPowerPlants || []).reduce((n, p) => n + (POWER[p]?.capacity || 0), 0);
  }

  // Extend the existing calculation rather than replacing the ship renderer.
  const originalCalc = window.calc;
  if (typeof originalCalc === 'function') {
    window.calc = function () {
      const result = originalCalc();
      const extra = extraCapacity(window.ship);
      result.p = { ...result.p, capacity: result.p.capacity + extra };
      return result;
    };
  }

  function saveQuiet() { try { if (typeof save === 'function') save(false); } catch (_) {} }

  function refreshPowerState(oldCapacity, newCapacity, delta) {
    if (!window.ship) return;
    // Adding a plant gives the crew the new power immediately.
    if (delta > 0) {
      window.ship.currentPower = Math.min(newCapacity, Math.max(0, Number(window.ship.currentPower) || 0) + delta);
    } else {
      window.ship.currentPower = Math.min(newCapacity, Math.max(0, Number(window.ship.currentPower) || 0));
    }
    saveQuiet();
    try { if (typeof render === 'function') render(); } catch (_) {}
  }

  function wire() {
    const add = document.getElementById('station-add-power');
    if (add && !add.dataset.powerWired) {
      add.dataset.powerWired = '1';
      add.addEventListener('click', () => {
        const select = document.getElementById('station-power-select');
        const type = select?.value;
        if (!type) return;
        window.ship.extraPowerPlants = window.ship.extraPowerPlants || [];
        const before = extraCapacity(window.ship);
        window.ship.extraPowerPlants.push(type);
        const delta = (POWER[type]?.capacity || 0);
        const after = before + delta + (window.ship.powerPlant ? 0 : 0);
        refreshPowerState(before, (POWER[window.ship.powerPlant]?.capacity || 0) + after, delta);
      });
    }

    document.querySelectorAll('[data-remove-power]').forEach(btn => {
      if (btn.dataset.powerWired) return;
      btn.dataset.powerWired = '1';
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.removePower);
        const plants = window.ship.extraPowerPlants || [];
        if (!Number.isInteger(i) || !plants[i]) return;
        const removed = POWER[plants[i]]?.capacity || 0;
        plants.splice(i, 1);
        const total = (POWER[window.ship.powerPlant]?.capacity || 0) + extraCapacity(window.ship);
        window.ship.currentPower = Math.min(total, Math.max(0, (Number(window.ship.currentPower) || 0) - removed));
        saveQuiet();
        try { if (typeof render === 'function') render(); } catch (_) {}
      });
    });
  }

  const observer = new MutationObserver(() => requestAnimationFrame(wire));
  const app = document.getElementById('app');
  if (app) observer.observe(app, { childList: true, subtree: true });
  requestAnimationFrame(wire);
})();

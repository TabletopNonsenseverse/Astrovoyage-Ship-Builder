(() => {
  if (window.__astroPowerPlantCalc) return;
  window.__astroPowerPlantCalc = true;

  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };

  function totalCapacity() {
    if (typeof ship === 'undefined' || !ship || typeof POWER === 'undefined') return 0;
    const primary = Number(POWER[ship.powerPlant]?.capacity || 0);
    const extras = (ship.extraPowerPlants || []).reduce((sum, type) => sum + Number(POWER[type]?.capacity || 0), 0);
    return primary + extras;
  }

  function refreshPowerDisplay() {
    if (typeof ship === 'undefined' || !ship) return;
    const max = totalCapacity();
    const card = [...document.querySelectorAll('.card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (!card) return;
    const stat = [...card.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'POWER');
    if (!stat) return;

    const input = stat.querySelector('input.live-edit');
    if (input) {
      input.max = String(max);
      input.value = String(Math.max(0, Math.min(max, Number(ship.currentPower) || 0)));
    }
    let cap = stat.querySelector('.power-capacity');
    if (!cap) {
      cap = document.createElement('div');
      cap.className = 'power-capacity';
      stat.appendChild(cap);
    }
    cap.textContent = `Capacity: ${max}`;
  }

  const style = document.createElement('style');
  style.textContent = '.power-capacity{margin-top:5px;font-size:.72rem;color:#91a1bd}';
  document.head.appendChild(style);

  // enhancements.js owns the actual add/remove operation. These capture handlers
  // adjust current power before that handler runs, so the existing renderer remains
  // responsible for rebuilding the station UI and saving the plant selection.
  document.addEventListener('click', event => {
    if (typeof ship === 'undefined' || !ship || typeof POWER === 'undefined') return;

    const add = event.target.closest?.('#station-add-power');
    if (add) {
      const type = document.getElementById('station-power-select')?.value;
      if (!type || !POWER[type]) return;
      ship.currentPower = Math.max(0, Number(ship.currentPower) || 0) + Number(POWER[type].capacity || 0);
      saveQuiet();
      requestAnimationFrame(refreshPowerDisplay);
      return;
    }

    const remove = event.target.closest?.('[data-remove-power]');
    if (remove) {
      const index = Number(remove.dataset.removePower);
      const type = (ship.extraPowerPlants || [])[index];
      if (!type || !POWER[type]) return;
      ship.currentPower = Math.max(0, (Number(ship.currentPower) || 0) - Number(POWER[type].capacity || 0));
      saveQuiet();
      requestAnimationFrame(refreshPowerDisplay);
    }
  }, true);

  const app = document.getElementById('app');
  if (app) new MutationObserver(() => requestAnimationFrame(refreshPowerDisplay)).observe(app, {childList:true, subtree:true});
  requestAnimationFrame(refreshPowerDisplay);
})();

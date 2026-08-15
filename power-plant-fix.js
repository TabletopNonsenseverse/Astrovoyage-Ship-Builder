(() => {
  if (window.__astroPowerPlantFixV2) return;
  window.__astroPowerPlantFixV2 = true;

  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };
  const capacity = () => {
    if (typeof ship === 'undefined' || !ship) return 0;
    const primary = POWER?.[ship.powerPlant]?.capacity || 0;
    const extras = (ship.extraPowerPlants || []).reduce((n, p) => n + (POWER?.[p]?.capacity || 0), 0);
    return primary + extras;
  };

  function updatePowerStat() {
    const max = capacity();
    const card = [...document.querySelectorAll('.card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (!card) return;
    const stat = [...card.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'POWER');
    if (!stat) return;
    const input = stat.querySelector('.live-edit');
    if (input) input.value = Math.max(0, Math.min(max, Number(ship.currentPower) || 0));
    const oldMini = stat.querySelector('.mini');
    if (oldMini) oldMini.textContent = `${Math.max(0, Number(ship.currentPower) || 0)} / ${max}`;
    else {
      const text = [...stat.childNodes].find(n => n.nodeType === 3);
      if (text) text.textContent = ` ${Math.max(0, Number(ship.currentPower) || 0)} / ${max}`;
    }
  }

  function addVisual(type) {
    const block = [...document.querySelectorAll('#system-stations .system-block')]
      .find(b => b.querySelector('h3')?.textContent.trim() === 'Power Plant');
    if (!block) return;
    const addArea = block.querySelector('.power-add');
    if (!addArea) return;
    const item = document.createElement('div');
    item.className = 'station-item';
    item.dataset.extraPower = type;
    item.innerHTML = `<div class="station-item-head"><strong>${type} Power Plant</strong><button class="btn danger" type="button" data-remove-power-direct="${(ship.extraPowerPlants || []).length - 1}">Remove</button></div><small class="muted">${POWER[type]?.capacity || 0} capacity · ${POWER[type]?.size || 0} tonnes</small>`;
    addArea.before(item);
  }

  function addPlant(type) {
    if (!type) return;
    ship.extraPowerPlants = Array.isArray(ship.extraPowerPlants) ? ship.extraPowerPlants : [];
    ship.extraPowerPlants.push(type);
    ship.currentPower = Math.min(capacity(), Math.max(0, Number(ship.currentPower) || 0) + (POWER[type]?.capacity || 0));
    saveQuiet();
    addVisual(type);
    updatePowerStat();
  }

  function removePlant(index, button) {
    const plants = ship.extraPowerPlants || [];
    if (!Number.isInteger(index) || !plants[index]) return;
    const type = plants[index];
    const removedCapacity = POWER[type]?.capacity || 0;
    plants.splice(index, 1);
    ship.currentPower = Math.min(capacity(), Math.max(0, Number(ship.currentPower) || 0) - removedCapacity);
    saveQuiet();
    button.closest('.station-item')?.remove();
    document.querySelectorAll('[data-remove-power-direct]').forEach((b, i) => b.dataset.removePowerDirect = i);
    updatePowerStat();
  }

  // Capture the station buttons before the older renderer handlers. This prevents
  // the old handler from rendering the whole page and wiping the calculated state.
  document.addEventListener('click', event => {
    const add = event.target.closest?.('#station-add-power');
    if (add) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const select = document.getElementById('station-power-select');
      addPlant(select?.value || '');
      if (select) select.value = '';
      return;
    }
    const remove = event.target.closest?.('[data-remove-power], [data-remove-power-direct]');
    if (remove) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const index = Number(remove.dataset.removePowerDirect ?? remove.dataset.removePower);
      removePlant(index, remove);
    }
  }, true);

  const app = document.getElementById('app');
  if (app) new MutationObserver(() => requestAnimationFrame(updatePowerStat)).observe(app, { childList:true, subtree:true });
  requestAnimationFrame(updatePowerStat);
})();

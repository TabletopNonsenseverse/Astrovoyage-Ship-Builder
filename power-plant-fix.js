(() => {
  if (window.__astroPowerPlantFix) return;
  window.__astroPowerPlantFix = true;

  const getShip = () => { try { return typeof ship !== 'undefined' ? ship : null; } catch (_) { return null; } };
  const capacityOf = name => Number((typeof POWER !== 'undefined' ? POWER?.[name]?.capacity : 0) || 0);
  const totalCapacity = s => capacityOf(s.powerPlant) + (s.extraPowerPlants || []).reduce((n, p) => n + capacityOf(p), 0);

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

  if (typeof window.calc === 'function') {
    const baseCalc = window.calc;
    window.calc = function () {
      const result = baseCalc();
      const s = getShip();
      if (s && result?.p) result.p = { ...result.p, capacity: totalCapacity(s) };
      return result;
    };
  }

  function updateLiveStatus() {
    const s = getShip();
    if (!s) return;
    const cap = totalCapacity(s);
    const power = Math.max(0, Math.min(cap, Number(s.currentPower) || 0));
    const card = [...document.querySelectorAll('.card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (!card) return;
    const stat = [...card.querySelectorAll('.stat')].find(x => x.querySelector('small')?.textContent.trim() === 'POWER');
    if (!stat) return;
    const input = stat.querySelector('.live-edit');
    if (input) {
      input.max = String(cap);
      input.value = String(power);
      return;
    }
    const strong = stat.querySelector('strong');
    if (strong) strong.innerHTML = `${power}<i> / ${cap}</i>`;
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

    const beforePower = Number(s.currentPower) || 0;
    const desiredPower = Math.max(0, beforePower + delta);

    // The existing handler performs the list mutation and render. Re-apply the
    // power delta after that render so it cannot be lost during re-render.
    setTimeout(() => {
      const current = getShip();
      if (!current) return;
      current.currentPower = desiredPower;
      try { if (typeof save === 'function') save(false); } catch (_) {}
      updateLiveStatus();
      window.scrollTo(0, scrollY);
    }, 0);

    setTimeout(() => {
      updateLiveStatus();
      window.scrollTo(0, scrollY);
    }, 50);
  }, true);
})();
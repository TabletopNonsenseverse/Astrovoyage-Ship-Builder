(() => {
  if (window.__astroPowerPlantFix) return;
  window.__astroPowerPlantFix = true;

  const getShip = () => { try { return typeof ship !== 'undefined' ? ship : null; } catch (_) { return null; } };
  const capacityOf = name => Number((typeof POWER !== 'undefined' ? POWER?.[name]?.capacity : 0) || 0);
  const plantCapacity = s => capacityOf(s.powerPlant) + (s.extraPowerPlants || []).reduce((n, p) => n + capacityOf(p), 0);
  const maximumPower = s => Number.isFinite(Number(s.powerCapacity)) ? Math.max(0, Number(s.powerCapacity)) : plantCapacity(s);
  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };

  if (typeof window.normalise === 'function') {
    const baseNormalise = window.normalise;
    window.normalise = function () {
      baseNormalise();
      const s = getShip();
      if (!s) return;
      s.powerCapacity = maximumPower(s);
      s.currentPower = Math.min(Math.max(0, Number(s.currentPower) || 0), s.powerCapacity);
    };
  }

  if (typeof window.calc === 'function') {
    const baseCalc = window.calc;
    window.calc = function () {
      const result = baseCalc();
      const s = getShip();
      if (s && result?.p) result.p = { ...result.p, capacity: maximumPower(s) };
      return result;
    };
  }

  function updateLiveStatus() {
    const s = getShip();
    if (!s) return;
    const cap = maximumPower(s);
    const power = Math.max(0, Math.min(cap, Number(s.currentPower) || 0));
    const card = [...document.querySelectorAll('.card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (!card) return;
    const stat = [...card.querySelectorAll('.stat')].find(x => x.querySelector('small')?.textContent.trim() === 'POWER');
    if (!stat) return;

    let current = stat.querySelector('.live-edit');
    if (!current) {
      const strong = stat.querySelector('strong');
      if (!strong) return;
      current = document.createElement('input');
      current.className = 'live-edit';
      current.type = 'number';
      current.min = '0';
      current.step = '1';
      current.style.width = '70px';
      strong.replaceWith(current);
      current.addEventListener('input', () => {
        s.currentPower = Math.max(0, Math.min(maximumPower(s), Number(current.value) || 0));
        saveQuiet();
      });
    }
    current.value = String(power);
    current.max = String(cap);

    let maxInput = stat.querySelector('.power-capacity-edit');
    if (!maxInput) {
      const label = document.createElement('span');
      label.className = 'power-capacity-label';
      label.textContent = ' / ';
      maxInput = document.createElement('input');
      maxInput.className = 'power-capacity-edit';
      maxInput.type = 'number';
      maxInput.min = '0';
      maxInput.step = '1';
      maxInput.style.width = '70px';
      maxInput.title = 'Maximum power';
      current.insertAdjacentElement('afterend', label);
      label.insertAdjacentElement('afterend', maxInput);
      maxInput.addEventListener('input', () => {
        s.powerCapacity = Math.max(0, Number(maxInput.value) || 0);
        s.currentPower = Math.min(Math.max(0, Number(s.currentPower) || 0), s.powerCapacity);
        current.max = String(s.powerCapacity);
        current.value = String(s.currentPower);
        saveQuiet();
      });
    }
    maxInput.value = String(cap);
  }

  document.addEventListener('click', event => {
    const add = event.target.closest?.('#station-add-power');
    const remove = event.target.closest?.('[data-remove-power]');
    if (!add && !remove) return;

    const s = getShip();
    if (!s) return;
    const scrollY = window.scrollY;
    const beforeCapacity = maximumPower(s);
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

    // Capacity changes with the plant list; current power remains independent/editable.
    const desiredCapacity = Math.max(0, beforeCapacity + delta);

    setTimeout(() => {
      const current = getShip();
      if (!current) return;
      current.powerCapacity = desiredCapacity;
      current.currentPower = Math.min(Math.max(0, Number(current.currentPower) || 0), desiredCapacity);
      saveQuiet();
      updateLiveStatus();
      window.scrollTo(0, scrollY);
    }, 0);

    setTimeout(() => {
      updateLiveStatus();
      window.scrollTo(0, scrollY);
    }, 50);
  }, true);

  setTimeout(updateLiveStatus, 0);
})();
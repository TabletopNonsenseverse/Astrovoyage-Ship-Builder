(() => {
  if (window.__astroPowerPlantFixV3) return;
  window.__astroPowerPlantFixV3 = true;

  const baseCalc = window.calc;
  if (typeof baseCalc !== 'function') return;

  const extras = () => {
    if (!window.ship) return [];
    if (!Array.isArray(window.ship.extraPowerPlants)) window.ship.extraPowerPlants = [];
    return window.ship.extraPowerPlants;
  };

  // Extend the real calculation used by the ship renderer. The previous fix only
  // changed the displayed number; this changes the actual calculated capacity.
  window.calc = function () {
    const result = baseCalc();
    const list = extras();
    const extraCapacity = list.reduce((n, type) => n + Number(window.POWER?.[type]?.capacity || 0), 0);
    const extraSize = list.reduce((n, type) => n + Number(window.POWER?.[type]?.size || 0), 0);
    const extraCost = list.reduce((n, type) => n + (typeof window.numMoney === 'function' ? window.numMoney(window.POWER?.[type]?.cost || 0) : 0), 0);
    result.p = { ...result.p, capacity: result.p.capacity + extraCapacity, size: result.p.size + extraSize };
    result.total += extraCost;
    return result;
  };

  function persistRender() {
    if (typeof window.normalise === 'function') window.normalise();
    if (typeof window.render === 'function') window.render();
    if (typeof window.debouncedSave === 'function') window.debouncedSave();
  }

  function addPlant(type) {
    if (!type || !window.POWER?.[type]) return;
    const list = extras();
    list.push(type);
    window.ship.currentPower = Math.max(0, Number(window.ship.currentPower) || 0) + Number(window.POWER[type].capacity || 0);
    persistRender();
  }

  function removePlant(index) {
    const list = extras();
    const type = list[index];
    if (!type) return;
    list.splice(index, 1);
    window.ship.currentPower = Math.max(0, Number(window.ship.currentPower) || 0 - Number(window.POWER[type]?.capacity || 0));
    // The expression above is intentionally corrected below; keep current power
    // reduced by exactly the removed plant's capacity.
    window.ship.currentPower = Math.max(0, (Number(window.ship.currentPower) || 0) - Number(window.POWER[type]?.capacity || 0));
    persistRender();
  }

  window.addPowerPlant = addPlant;
  window.removePowerPlant = removePlant;

  function install() {
    const card = [...document.querySelectorAll('.card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Core Systems');
    if (!card || card.querySelector('.power-plant-extra-control')) return;

    const selects = [...card.querySelectorAll('select')];
    const primary = selects.find(s => window.POWER?.[s.value]);
    if (!primary) return;

    const wrap = document.createElement('div');
    wrap.className = 'power-plant-extra-control';
    wrap.style.cssText = 'margin-top:14px;padding-top:14px;border-top:1px solid rgba(130,150,190,.18)';
    wrap.innerHTML = `<div class="field"><label>Add power plant</label><select class="power-plant-extra-select"><option value="">Select power plant…</option>${Object.entries(window.POWER).map(([k,p]) => `<option value="${k}">${k} · ${p.capacity} capacity · ${p.size} t · ${p.cost}</option>`).join('')}</select></div><div class="power-plant-extra-list"></div>`;
    primary.closest('.field')?.after(wrap);

    const select = wrap.querySelector('.power-plant-extra-select');
    const list = wrap.querySelector('.power-plant-extra-list');
    select.addEventListener('change', () => {
      const type = select.value;
      if (!type) return;
      addPlant(type);
    });

    const refreshList = () => {
      const current = extras();
      list.innerHTML = current.length ? current.map((type, i) => {
        const p = window.POWER[type];
        return `<div class="component" style="margin-top:7px"><span><b>${type} Power Plant</b><span class="meta"> +${p.capacity} power · ${p.size} t</span></span><button type="button" class="btn danger" data-extra-power-remove="${i}">Remove</button></div>`;
      }).join('') : '<p class="muted" style="margin:7px 0 0">No additional power plants installed.</p>';
      list.querySelectorAll('[data-extra-power-remove]').forEach(btn => btn.addEventListener('click', () => removePlant(Number(btn.dataset.extraPowerRemove))));
    };
    refreshList();
  }

  const style = document.createElement('style');
  style.textContent = '.power-plant-extra-select{width:100%;box-sizing:border-box}';
  document.head.appendChild(style);

  const root = document.getElementById('app');
  if (root) new MutationObserver(() => requestAnimationFrame(install)).observe(root, { childList:true, subtree:true });
  requestAnimationFrame(install);
})();

(() => {
  if (window.__astroPowerCapacityFix) return;
  window.__astroPowerCapacityFix = true;

  const capacityOf = name => Number(window.POWER?.[name]?.capacity || 0);
  const totalCapacity = () => {
    if (!window.ship) return 0;
    return capacityOf(window.ship.powerPlant) + (window.ship.extraPowerPlants || []).reduce((n, p) => n + capacityOf(p), 0);
  };

  function updateUI() {
    if (!window.ship) return;
    const cap = totalCapacity();
    const power = Math.max(0, Math.min(cap, Number(window.ship.currentPower) || 0));
    const card = [...document.querySelectorAll('.grid .card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    const stat = card && [...card.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'POWER');
    if (stat) {
      const edit = stat.querySelector('.live-edit');
      if (edit) { edit.max = String(cap); edit.value = String(power); }
      else { const strong = stat.querySelector('strong'); if (strong) strong.innerHTML = `${power}<i> / ${cap}</i>`; }
    }
    const block = [...document.querySelectorAll('.system-block')].find(b => b.querySelector('h3')?.textContent.trim() === 'Power Plant');
    if (block) {
      let s = block.querySelector('.power-capacity-summary');
      if (!s) {
        s = document.createElement('div');
        s.className = 'power-capacity-summary muted';
        s.style.marginTop = '10px';
        s.style.fontWeight = '600';
        const add = block.querySelector('.power-add');
        if (add) block.insertBefore(s, add); else block.appendChild(s);
      }
      s.textContent = `Total power capacity: ${cap} units · Current power: ${power}`;
    }
  }

  const root = document.getElementById('app');
  if (root) new MutationObserver(() => requestAnimationFrame(updateUI)).observe(root, { childList: true, subtree: true });
  setTimeout(updateUI, 300);
})();

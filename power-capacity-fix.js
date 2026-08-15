(() => {
  if (window.__astroPowerCapacityFix) return;
  window.__astroPowerCapacityFix = true;

  const capacityOf = name => Number((typeof POWER !== 'undefined' ? POWER[name]?.capacity : 0)) || 0;
  const totalCapacity = () => {
    if (typeof ship === 'undefined' || !ship) return 0;
    return capacityOf(ship.powerPlant) + (ship.extraPowerPlants || []).reduce((n, p) => n + capacityOf(p), 0);
  };

  function update() {
    if (typeof ship === 'undefined' || !ship) return;
    const cap = totalCapacity();
    const card = [...document.querySelectorAll('.grid .card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (card) {
      const stat = [...card.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'POWER');
      if (stat) {
        const edit = stat.querySelector('.live-edit');
        if (edit) { edit.max = String(cap); edit.value = String(Math.max(0, Math.min(Number(ship.currentPower) || 0, cap))); }
        else { const strong = stat.querySelector('strong'); if (strong) strong.innerHTML = `${Math.max(0, Number(ship.currentPower) || 0)}<i> / ${cap}</i>`; }
      }
    }
    const block = [...document.querySelectorAll('.system-block')].find(b => b.querySelector('h3')?.textContent.trim() === 'Power Plant');
    if (block) {
      let summary = block.querySelector('.power-capacity-summary');
      if (!summary) { summary = document.createElement('div'); summary.className = 'power-capacity-summary muted'; summary.style.marginTop = '10px'; summary.style.fontWeight = '600'; const add = block.querySelector('.power-add'); if (add) block.insertBefore(summary, add); else block.appendChild(summary); }
      summary.textContent = `Total power capacity: ${cap} units · Current power: ${Number(ship.currentPower) || 0}`;
    }
  }

  const root = document.getElementById('app');
  if (root) new MutationObserver(() => requestAnimationFrame(update)).observe(root, {childList:true, subtree:true});
  setTimeout(update, 250);
})();

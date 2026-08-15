(() => {
  const style = document.createElement('style');
  style.textContent = `
    #astro-final-log{grid-column:1/-1;width:100%;box-sizing:border-box}
    #astro-final-log textarea{width:100%;min-height:520px;box-sizing:border-box;resize:vertical;background:#0c1422;color:#e8edf7;border:1px solid #394966;border-radius:10px;padding:16px;font:inherit;line-height:1.55}
    #astro-final-log .log-count{margin-top:7px;font-size:.75rem;color:#91a1bd;text-align:right}
    .tier-results{display:grid;gap:4px;margin-top:7px}.tier-results div{line-height:1.4}.tier-results b{display:inline-block;min-width:55px;color:#a9b8d2}
    .station-item .weapon-remove{margin-top:8px}
    .money-field input{width:100%;box-sizing:border-box}
  `;
  document.head.appendChild(style);

  let timer = null;
  const callSave = () => { try { if (typeof save === 'function') save(false); } catch(e) { console.error(e); } };
  const callEnhance = () => { try { if (typeof enhance === 'function') enhance(); } catch(e) { console.error(e); } };

  function removeCombatButtons() {
    document.querySelectorAll('button').forEach(b => {
      const t = b.textContent.trim().toLowerCase();
      if (t === 'combat' || t === 'combat mode' || t.includes('exit combat')) b.remove();
    });
  }

  function fixMoney() {
    const card = [...document.querySelectorAll('.grid .card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    if (!card || typeof ship === 'undefined') return;
    const stat = [...card.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'MONEY');
    if (!stat) return;
    stat.classList.add('money-field');
    if (stat.querySelector('input')) return;
    const current = Number(ship.money ?? 0);
    stat.innerHTML = `<small>MONEY</small><input type="number" min="0" step="1" value="${Number.isFinite(current) ? current : 0}" aria-label="Money">`;
    const input = stat.querySelector('input');
    input.addEventListener('input', () => {
      ship.money = Math.max(0, Number(input.value) || 0);
      clearTimeout(timer); timer = setTimeout(callSave, 350);
    });
  }

  function addTravelAction() {
    const blocks = document.querySelectorAll('.system-block');
    const eng = [...blocks].find(b => b.querySelector('h3')?.textContent.trim() === 'Engineering');
    if (!eng) return;
    const actions = eng.querySelector('.system-actions');
    if (!actions || actions.querySelector('[data-travel-action]')) return;
    const card = document.createElement('article');
    card.className = 'action-card'; card.dataset.travelAction = 'true';
    card.innerHTML = `<div class="action-head"><strong>Travel</strong><span>Space Travel</span></div><div class="action-meta"><span>1 parsec</span><span>100 power / day</span></div><p>Spend 100 units of power and travel 1 parsec in 1 day. You cannot travel through a parsec containing a black hole or similar extreme gravitational body.</p>`;
    actions.appendChild(card);
  }

  function fixShipLog() {
    const cards = [...document.querySelectorAll('.grid .card')];
    cards.filter(c => /ship.?s log/i.test(c.querySelector('h2')?.textContent || '')).forEach(c => c.remove());
    const stations = document.getElementById('system-stations');
    if (!stations || typeof ship === 'undefined') return;
    let log = document.getElementById('astro-final-log');
    if (log) return;
    log = document.createElement('section'); log.id = 'astro-final-log'; log.className = 'card wide';
    const value = String(ship.notes || '');
    log.innerHTML = `<div class="card-title"><h2>Ship's Log</h2><span class="pill">100,000 characters</span></div><textarea maxlength="100000" placeholder="Record the crew's journey, discoveries, repairs, debts, rumours, victories and disasters..."></textarea><div class="log-count">0 / 100,000</div>`;
    const ta = log.querySelector('textarea'); ta.value = value;
    const count = log.querySelector('.log-count');
    const update = () => { count.textContent = `${ta.value.length.toLocaleString()} / 100,000`; ship.notes = ta.value; clearTimeout(timer); timer=setTimeout(callSave,350); };
    ta.addEventListener('input', update); update();
    stations.parentNode.insertBefore(log, stations.nextSibling);
  }

  function formatTiers() {
    document.querySelectorAll('.action-card p').forEach(p => {
      if (p.dataset.tierFormatted) return;
      const text = p.textContent.trim();
      if (!/(≤11|12[–-]16|≥17)/.test(text)) return;
      const parts = text.split(/\s*(?=(?:≤11|12[–-]16|≥17)\s*:)/).filter(Boolean);
      if (parts.length < 2) return;
      p.dataset.tierFormatted = 'true';
      const wrap = document.createElement('div'); wrap.className='tier-results';
      parts.forEach(part => {
        const m = part.match(/^(≤11|12[–-]16|≥17)\s*:\s*(.*)$/);
        if (!m) { const d=document.createElement('div'); d.textContent=part; wrap.appendChild(d); return; }
        const d=document.createElement('div'); d.innerHTML=`<b>${m[1]}:</b> ${m[2].replace(/;\s*$/, '')}`; wrap.appendChild(d);
      });
      p.replaceWith(wrap);
    });
  }

  function addWeaponRemoveButtons() {
    const block = [...document.querySelectorAll('.system-block')].find(b => b.querySelector('h3')?.textContent.trim() === 'Weapons');
    if (!block || typeof ship === 'undefined') return;
    const items = [...block.querySelectorAll('.station-item')];
    const weaponItems = items.filter(i => !i.closest('.weapon-add') && !i.querySelector('select'));
    weaponItems.forEach((item, index) => {
      if (item.querySelector('.weapon-remove')) return;
      const btn=document.createElement('button'); btn.className='btn danger weapon-remove'; btn.textContent='Remove weapon';
      btn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        if (!ship.weapons || !ship.weapons[index]) return;
        ship.weapons.splice(index,1); callSave(); callEnhance();
      });
      item.appendChild(btn);
    });
  }

  function interceptAdds() {
    document.addEventListener('click', e => {
      const target = e.target.closest?.('[data-add-mod],#station-add-weapon,#station-add-power');
      if (!target || typeof ship === 'undefined') return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (target.matches('[data-add-mod]')) {
        const system=target.dataset.addMod; const sel=document.querySelector(`[data-mod-select="${system}"]`); const mod=sel?.value;
        if (!mod || ship.mods.includes(mod)) return;
        ship.mods.push(mod); callSave(); callEnhance(); return;
      }
      if (target.id==='station-add-weapon') {
        const sel=document.getElementById('station-weapon-select'); const type=sel?.value;
        if (!type) return;
        ship.weapons=ship.weapons||[]; ship.weapons.push({type,qty:1}); callSave(); callEnhance(); return;
      }
      if (target.id==='station-add-power') {
        const sel=document.getElementById('station-power-select'); const type=sel?.value;
        if (!type) return;
        ship.extraPowerPlants=ship.extraPowerPlants||[]; ship.extraPowerPlants.push(type); callSave(); callEnhance(); return;
      }
    }, true);
  }

  function interceptRemoveModsPower() {
    document.addEventListener('click', e => {
      const modBtn=e.target.closest?.('[data-remove-mod]');
      if (modBtn && typeof ship !== 'undefined') { e.preventDefault(); e.stopImmediatePropagation(); const m=modBtn.dataset.removeMod; ship.mods=ship.mods.filter(x=>x!==m); callSave(); callEnhance(); return; }
      const pBtn=e.target.closest?.('[data-remove-power]');
      if (pBtn && typeof ship !== 'undefined') { e.preventDefault(); e.stopImmediatePropagation(); const i=Number(pBtn.dataset.removePower); ship.extraPowerPlants=ship.extraPowerPlants||[]; ship.extraPowerPlants.splice(i,1); callSave(); callEnhance(); }
    }, true);
  }

  function apply() {
    removeCombatButtons();
    fixMoney();
    addTravelAction();
    fixShipLog();
    formatTiers();
    addWeaponRemoveButtons();
  }

  interceptAdds(); interceptRemoveModsPower();
  const observer = new MutationObserver(() => setTimeout(apply, 0));
  observer.observe(document.body, {childList:true, subtree:true});
  setTimeout(apply, 50);
})();

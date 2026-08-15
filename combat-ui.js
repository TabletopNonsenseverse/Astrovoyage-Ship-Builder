(() => {
  const ACTIONS = {
    Cargo: ['No combat action listed in the rules. Cargo hold damage destroys 10 tonnes per system damage.'],
    Helm: ['Evasive Manoeuvre — 2d10 + Pilot (I); ≤11: 1 attack penalty; 12–16: double penalty; ≥17: double penalty and no system damage (SNT).'],
    Weapons: ['Fire a weapon — each shot costs 1 CP. Power per shot (PPS) and ammunition cost per shot (CPS) depend on the weapon.'],
    Engineering: ['Go! Go! Go! — 2d10 + Engineering (E); ≤11: FTL in 5 rounds; 12–16: 4 rounds; ≥17: 3 rounds. Spend 100 power.', 'Reroute Power — if Rerouter installed: 2d10 + Electronics (E); gain 20/50/80 power and take 1 chosen system damage.', 'Boost Shield — if Booster installed: spend 20 power; Engineering (I), +5/+10/+15 shield threshold.', 'Power to the Bridge — if Booster installed: spend 30/25/20 power; gain 1 CP.', 'Weapons Boost — if Booster installed: spend 10/7/5 power; +2d6 to next weapon attack.', 'Go Easy / Push It Hard — if Efficiency Adjuster installed: modify next action power and result as written in the rules.'],
    LSC: ['Deploy Drones — Electronics (I), ranged 1 parsec; success attaches drones to the enemy airlock.', 'Hack Enemy Airlock — prerequisite: Deploy Drones success; Computers (E), ranged 1 parsec.', 'Deploy Boarding Party — prerequisite: Hack Enemy Airlock success; all boarding members at LSC; each makes Reflex (A) check.', 'Detach Drones — prerequisite: enemy drones detected; Electronics (I) to detach them.', 'Secure Airlock — prerequisite: Detach Drones success; Computers (E) to relock your airlock.']
  };

  let combatMode = false;

  function findGrid() { return document.querySelector('#app .grid'); }
  function esc(v='') { return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function calcLocal() { return typeof calc === 'function' ? calc() : null; }

  function injectToolbar() {
    const top = document.querySelector('#app .topbar .actions');
    if (!top || top.querySelector('[data-combat-toggle]')) return;
    const b = document.createElement('button');
    b.className = 'btn combat-toggle'; b.dataset.combatToggle = 'true'; b.textContent = 'Combat';
    b.onclick = () => setCombat(!combatMode);
    top.insertBefore(b, top.firstChild);
  }

  function renderCombat() {
    let old = document.querySelector('#combat-view');
    if (old) old.remove();
    if (!combatMode) return;
    const c = calcLocal();
    const shipName = window.ship?.name || 'Starship';
    const systems = ['Helm','Weapons','Engineering','LSC','Cargo','Power'];
    const systemHtml = systems.map(s => `<section class="combat-system"><div class="combat-system-head"><h3>${s}</h3><span>System damage: ${window.ship?.systemDamage?.[s] || 0}</span></div><div class="combat-actions">${ACTIONS[s].map(a => `<div class="combat-action"><strong>${esc(a.split(' — ')[0])}</strong><span>${esc(a.includes(' — ')?a.split(' — ').slice(1).join(' — '):a)}</span></div>`).join('')}</div></section>`).join('');
    const weapons = (window.ship?.weapons || []).map((w,i) => {
      const x = window.WEAPONS?.[w.type];
      return `<div class="combat-action weapon-action"><strong>${esc(x?.name || w.type)} × ${w.qty || 1}</strong><span>${esc(x?.range || '')} · PPS ${esc(x?.pps ?? '—')} · CPS ${esc(x?.cps ?? '—')} · Damage ${esc(x?.damage || '')}</span><button class="btn mini-combat" onclick="window.spendPower(${Number(x?.pps)||0}); if(window.ship){window.ship.combatRound=window.ship.combatRound||1; if(typeof save==='function')save();}">Fire / Spend Power</button></div>`;
    }).join('');
    const v = document.createElement('div');
    v.id = 'combat-view';
    v.innerHTML = `<div class="combat-shell">
      <div class="combat-header"><div><span class="badge">COMBAT MODE</span><h2>${esc(shipName)}</h2></div><button class="btn" onclick="window.__toggleCombat(false)">Exit Combat</button></div>
      <div class="combat-stats">
        <div><small>COMMAND POINTS</small><strong>${c?.b?.cp ?? '—'}</strong><span>CP / turn</span></div>
        <div><small>HULL HP</small><strong>${window.ship?.currentHull ?? '—'} / ${c?.h?.hp ?? '—'}</strong><span>Hull damage triggers system damage</span></div>
        <div><small>SHIELD HP</small><strong>${window.ship?.currentShield ?? '—'} / ${c?.shieldMax ?? '—'}</strong><span>Threshold ${c?.sh?.physical ?? '—'}P / ${c?.sh?.energy ?? '—'}E</span></div>
        <div><small>POWER</small><strong>${window.ship?.currentPower ?? '—'} / ${c?.p?.capacity ?? '—'}</strong><span>Power Plant</span></div>
        <div><small>ROUND</small><strong>${window.ship?.combatRound ?? 1}</strong><span>1 minute</span></div>
      </div>
      <div class="combat-quick"><button class="btn" onclick="window.spendPower(10)">Spend 10 Power</button><button class="btn" onclick="window.damageShield(1)">Shield −1</button><button class="btn" onclick="window.damageHull(1)">Hull −1</button><button class="btn" onclick="window.ship.combatRound=(window.ship.combatRound||1)+1;window.render();">Next Round</button></div>
      <section class="combat-system"><div class="combat-system-head"><h3>Weapons — Available Attacks</h3><span>Each shot costs 1 CP</span></div>${weapons || '<div class="combat-action"><span>No weapons installed.</span></div>'}</section>
      ${systemHtml}
      <section class="combat-system"><div class="combat-system-head"><h3>Global Combat Action</h3></div><div class="combat-action"><strong>Move Between Ship Systems</strong><span>Costs 1 CP. A crew member must move from one system to another.</span></div></section>
    </div>`;
    document.querySelector('#app .shell').appendChild(v);
  }

  function setCombat(on) {
    combatMode = !!on;
    const grid = findGrid();
    if (grid) grid.style.display = combatMode ? 'none' : '';
    renderCombat();
    const b = document.querySelector('[data-combat-toggle]');
    if (b) { b.textContent = combatMode ? 'Exit Combat' : 'Combat'; b.classList.toggle('primary', combatMode); }
  }
  window.__toggleCombat = setCombat;

  function injectLog() {
    const grid = findGrid();
    if (!grid || document.querySelector('#ships-log-card')) return;
    const card = document.createElement('section'); card.className='card full'; card.id='ships-log-card';
    card.innerHTML = `<div class="card-title"><h2>Ship's Log</h2><span class="pill">Up to 100,000 characters</span></div><textarea id="ships-log" maxlength="100000" placeholder="Record the ship's journey, events, repairs, debts, discoveries, orders and anything else the crew needs to remember."></textarea><div class="log-footer"><span id="log-count">0 / 100,000</span><span>Autosaved</span></div>`;
    grid.appendChild(card);
    const ta = card.querySelector('#ships-log'); ta.value = window.ship?.notes || '';
    const count = card.querySelector('#log-count'); const update=()=>{count.textContent=`${ta.value.length.toLocaleString()} / 100,000`; if(window.ship){window.ship.notes=ta.value; if(typeof save==='function')save();}};
    ta.addEventListener('input', update); update();
  }

  function refreshEnhancements() { injectToolbar(); injectLog(); if(combatMode) renderCombat(); }
  const observer = new MutationObserver(() => setTimeout(refreshEnhancements, 0));
  observer.observe(document.body, {childList:true,subtree:true});
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      // Preserve the browser's native Ctrl+F search; this reminder ensures the full rendered sheet is searchable.
      return;
    }
  });
  window.renderCombat = renderCombat;
  setTimeout(refreshEnhancements, 50);
})();

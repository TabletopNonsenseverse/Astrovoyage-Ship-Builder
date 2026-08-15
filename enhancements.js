(() => {
  // UI extensions are applied after the core renderer completes. This is intentionally
  // hooked into render() so the stations cannot disappear when the ship sheet redraws.
  const SYSTEM_MODS = {
    Helm: ['Targeting','Stabiliser','EfficientHelm'],
    Engineering: ['Rerouter','Booster','Efficiency'],
    LSC: ['MidCommunicator','LongCommunicator','UltraCommunicator']
  };
  const ACTIONS = {
    Helm: [
      ['Evasive Manoeuvre','2d10 + Pilot (I)','Self','SNT','≤11: one attack penalty; 12–16: double penalty; ≥17: double penalty and no system damage.'],
      ['Targeting System','2d10 + Pilot (A)','Far → one ship','SNT','If the enemy hull is bigger, gain a bonus. Tier 2 grants an attack bonus; tier 3 also lets you choose the damaged system.','Targeting'],
      ['Hold Steady','—','Self','Passive','Pilot checks to steady the ship, and difficult landing/docking checks, gain a bonus.','Stabiliser'],
      ['Aid Boarding','2d10 + Pilot (E)','Self','SNT','12–16: bonus to boarding actions; ≥17: double bonus.','Stabiliser'],
      ['Efficient Flying','2d10 + Pilot (I)','Self','Next parsec','≤11: +25 power for next parsec; 12–16: 20 fewer; ≥17: 40 fewer.','EfficientHelm']
    ],
    Weapons: [['Fire Weapon','2d10 + Gunner (A)','Weapon range → one ship','Per shot','Each shot costs 1 CP and uses the weapon PPS/CPS. Resolve the weapon damage tiers.']],
    Engineering: [
      ['Go! Go! Go!','2d10 + Engineering (E)','Self','3–5 rounds','Spend 100 power. ≤11: FTL in 5 rounds; 12–16: 4; ≥17: 3.'],
      ['Reroute Power','2d10 + Electronics (E)','Self','Immediate','Gain 20/50/80 power, then deal 1 system damage to a system you choose.','Rerouter'],
      ['Boost Shield','2d10 + Engineering (I)','Self','SNT','Spend 20 power. Increase shield damage threshold by 5/10/15.','Booster'],
      ['Power to the Bridge','2d10 + Engineering (E)','Self','Immediate','Spend 30/25/20 power. Gain 1 CP that can be spent immediately or until the end of your next turn.','Booster'],
      ['Weapons Boost','2d10 + Engineering (I)','Self','Next weapon attack','Spend 10/7/5 power. Add 2d6 damage to your next weapon attack.','Booster'],
      ['Go Easy','2d10 + Electronics (E)','Self','Next action','Next action requires 25% less power. ≤11 also has double penalty; 12–16 has a penalty.','Efficiency'],
      ['Push It Hard','2d10 + Electronics (E)','Self','Next action','Next action requires 25% more power. ≤11 grants a bonus; 12–16 double bonus; ≥17 is automatically tier 3.','Efficiency']
    ],
    LSC: [
      ['Deploy Drones','2d10 + Electronics (I)','Ranged 1 parsec → one ship','Until next stage','≤11 failure and enemy alerted; 12–16 success and enemy alerted; ≥17 success.',''],
      ['Hack Enemy Airlock','2d10 + Computers (E)','Ranged 1 parsec → one ship','Until next stage','Requires successful Deploy Drones. ≤16 fails; ≥17 succeeds.',''],
      ['Deploy Boarding Party','Reflex (A)','Ranged 1 parsec → one ship','Immediate','Requires successful Hack Enemy Airlock and boarding party at LSC. Each member takes 15/10/7 physical damage and reaches the airlock.',''],
      ['Detach Drones','2d10 + Electronics (I)','Self','Immediate','Requires successful Detect Drones. ≤11 gives enemy Hack Enemy Airlock a bonus; ≥17 detaches drones.',''],
      ['Secure Airlock','2d10 + Computers (E)','Self','Immediate','Requires successful Detach Drones. ≤11 causes LSC system damage; ≥17 relocks the airlock.','']
    ],
    Cargo: [['Cargo Hold Damage','—','Self','Persistent','Each Cargo Hold system damage destroys 10 tonnes of cargo. The defender chooses the cargo type.']],
    Power: [['Power Plant Damage','—','Self','Persistent','Each Power Plant system damage removes 25 units of power.']]
  };

  const title = s => s === 'LSC' ? 'Life Support & Communications' : s === 'Power' ? 'Power Plant' : s;
  const saveIt = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };
  const redraw = () => { try { if (typeof normalise === 'function') normalise(); if (typeof render === 'function') render(); } catch (e) { console.error(e); } };

  function systemBlocks() {
    const grid = document.querySelector('.grid');
    if (!grid || !window.ship) return;
    document.getElementById('system-stations')?.remove();
    const wrap = document.createElement('section');
    wrap.id = 'system-stations';
    wrap.className = 'system-blocks full';
    wrap.innerHTML = `<div class="system-blocks-title"><div><div class="eyebrow">SHIP OPERATIONS</div><h2>System Stations</h2></div><span class="muted">Actions and modifications by station</span></div>`;

    Object.keys(ACTIONS).forEach(system => {
      const mods = SYSTEM_MODS[system] || [];
      const actions = ACTIONS[system].map((a) => {
        const available = !a[5] || ship.mods.includes(a[5]);
        return `<article class="action-card ${available ? '' : 'action-locked'}"><div class="action-head"><strong>${a[0]}</strong><span>${a[1]}</span></div><div class="action-meta"><span>Range: ${a[2]}</span><span>Duration: ${a[3]}</span></div><p>${a[4]}</p>${a[5] && !available ? `<small class="requires">Install ${MODS[a[5]]?.description?.split(':')[0] || a[5]} to unlock</small>` : ''}</article>`;
      }).join('');
      const modUI = mods.length ? `<div class="mod-area"><div class="mod-add"><select data-mod-select="${system}"><option value="">Add modification…</option>${mods.map(m => `<option value="${m}">${MODS[m].cost} · ${MODS[m].size} t · ${m}</option>`).join('')}</select><button class="btn primary" data-add-mod="${system}">Add modification</button></div><div class="installed-mods">${ship.mods.filter(m => mods.includes(m)).map(m => `<div class="installed-mod"><strong>${m}</strong><span>${MODS[m].description}</span><button class="btn danger" data-remove-mod="${m}">Remove</button></div>`).join('') || '<span class="muted">No modifications installed.</span>'}</div></div>` : '';
      const block = document.createElement('article');
      block.className = 'system-block';
      block.innerHTML = `<div class="system-block-head"><div><div class="eyebrow">STATION</div><h3>${title(system)}</h3></div><span>${ship.systemDamage?.[system] || 0} damage</span></div><div class="system-actions">${actions}</div>${modUI}`;
      wrap.appendChild(block);
    });
    grid.appendChild(wrap);

    wrap.querySelectorAll('[data-add-mod]').forEach(btn => btn.addEventListener('click', () => {
      const system = btn.dataset.addMod;
      const select = wrap.querySelector(`[data-mod-select="${system}"]`);
      if (!select.value) return;
      const mod = select.value;
      if (MODS[mod]?.system === system && !ship.mods.includes(mod)) ship.mods.push(mod);
      redraw(); saveIt();
    }));
    wrap.querySelectorAll('[data-remove-mod]').forEach(btn => btn.addEventListener('click', () => {
      ship.mods = ship.mods.filter(m => m !== btn.dataset.removeMod);
      redraw(); saveIt();
    }));
  }

  function shipsLog() {
    const grid = document.querySelector('.grid');
    if (!grid || !window.ship) return;
    // Remove the legacy Notes card from the rendered page.
    [...grid.querySelectorAll('.card')].forEach(card => {
      const heading = card.querySelector('h2');
      if (heading && /^notes$/i.test(heading.textContent.trim())) card.remove();
    });
    document.getElementById('ships-log')?.remove();
    const card = document.createElement('section');
    card.id = 'ships-log';
    card.className = 'card wide ships-log';
    const value = ship.notes || '';
    card.innerHTML = `<div class="card-title"><h2>Ship's Log</h2><span class="pill" id="log-count">${value.length.toLocaleString()} / 100,000</span></div><textarea id="ship-log-input" maxlength="100000" placeholder="Record the ship's journey, discoveries, repairs, debts, rumours, cargo, encounters, or anything else worth remembering…"></textarea>`;
    grid.appendChild(card);
    const ta = card.querySelector('textarea'); ta.value = value;
    ta.addEventListener('input', () => { ship.notes = ta.value; card.querySelector('#log-count').textContent = `${ta.value.length.toLocaleString()} / 100,000`; saveIt(); });
  }

  function combat() {
    if (!ship) return;
    let screen = document.getElementById('combat-screen');
    if (!screen) { screen = document.createElement('div'); screen.id = 'combat-screen'; document.body.appendChild(screen); }
    const c = calc();
    screen.innerHTML = `<div class="combat-shell"><div class="combat-top"><div><div class="eyebrow">ASTROVOYAGE · COMBAT CONTROL</div><h1>${esc(ship.name)}</h1></div><button class="btn" id="exit-combat">Exit Combat</button></div><div class="combat-stats"><div><small>COMMAND POINTS</small><b>${c.b.cp}</b></div><div><small>HULL HP</small><b>${ship.currentHull} / ${c.h.hp}</b></div><div><small>SHIELD HP</small><b>${ship.currentShield} / ${c.shieldMax}</b></div><div><small>THRESHOLD</small><b>${c.sh.physical}P / ${c.sh.energy}E</b></div><div><small>POWER</small><b>${ship.currentPower} / ${c.p.capacity}</b></div><div><small>ROUND</small><b>${ship.combatRound}</b></div></div><div class="combat-grid">${Object.keys(ACTIONS).map(s => `<section class="combat-system"><header><h2>${title(s)}</h2><span>${ship.systemDamage?.[s] || 0} damage</span></header>${ACTIONS[s].map(a => `<button class="combat-action" type="button"><strong>${a[0]}</strong><span>${a[1]} · ${a[2]}</span><small>${a[4]}</small></button>`).join('')}</section>`).join('')}</div></div>`;
    screen.style.display = 'block';
    document.body.classList.add('in-combat');
    screen.querySelector('#exit-combat').onclick = () => { screen.style.display = 'none'; document.body.classList.remove('in-combat'); };
  }

  function toolbar() {
    const actions = document.querySelector('.topbar .actions');
    if (!actions) return;
    if (!actions.querySelector('[data-combat-button]')) {
      const b = document.createElement('button'); b.className = 'btn primary'; b.dataset.combatButton = '1'; b.textContent = 'Combat'; b.onclick = combat; actions.insertBefore(b, actions.firstChild);
    }
  }

  let originalRender = null;
  function hook() {
    if (originalRender || typeof window.render !== 'function') return;
    originalRender = window.render;
    window.render = function () {
      originalRender.apply(this, arguments);
      requestAnimationFrame(() => { toolbar(); systemBlocks(); shipsLog(); });
    };
    // Trigger the wrapper immediately for the already-rendered sheet.
    window.render();
  }

  const observer = new MutationObserver(() => hook());
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(hook, 100);
})();

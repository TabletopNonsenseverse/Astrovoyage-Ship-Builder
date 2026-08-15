(() => {
  const SYSTEM_MODS = {
    Helm: ['Targeting','Stabiliser','EfficientHelm'],
    Engineering: ['Rerouter','Booster','Efficiency'],
    LSC: ['MidCommunicator','LongCommunicator','UltraCommunicator']
  };
  const ACTIONS = {
    Helm: [
      ['Evasive Manoeuvre','2d10 + Pilot (I)','Self','SNT','<=11: 1 penalty to attacks; 12-16: double penalty; >=17: double penalty and no system damage.'],
      ['Targeting System','2d10 + Pilot (A)','Ranged Far → one ship','SNT','If enemy hull is bigger, gain a bonus. 12-16: bonus to attacks. >=17: bonus and choose the system damaged.','Targeting'],
      ['Aid Boarding','2d10 + Pilot (E)','Self','SNT','12-16: bonus to boarding actions. >=17: double bonus.','Stabiliser'],
      ['Efficient Flying','2d10 + Pilot (I)','Self','Next parsec','<=11: +25 power for next parsec. 12-16: 20 fewer. >=17: 40 fewer.','EfficientHelm']
    ],
    Weapons: [['Fire weapon','Gunner (A)','Weapon range → one ship','Per shot','Each shot costs 1 CP. Apply the weapon PPS/CPS and damage tiers.']],
    Engineering: [
      ['Go! Go! Go!','2d10 + Engineering (E)','Self','3–5 rounds','Spend 100 power. <=11: FTL in 5 rounds; 12-16: 4; >=17: 3.'],
      ['Reroute Power','2d10 + Electronics (E)','Self','Immediate','Gain 20/50/80 power and deal 1 system damage to a chosen system.','Rerouter'],
      ['Boost Shield','2d10 + Engineering (I)','Self','SNT','Spend 20 power. Increase shield threshold by 5/10/15.','Booster'],
      ['Power to the Bridge','2d10 + Engineering (E)','Self','Immediate','Spend 30/25/20 power. Gain 1 CP immediately or until end of next turn.','Booster'],
      ['Weapons Boost','2d10 + Engineering (I)','Self','Next attack','Spend 10/7/5 power. Add 2d6 damage to next weapon attack.','Booster'],
      ['Go Easy','2d10 + Electronics (E)','Self','Next action','Next action uses 25% less power. <=11 also double penalty; 12-16 penalty.','Efficiency'],
      ['Push It Hard','2d10 + Electronics (E)','Self','Next action','Next action uses 25% more power. <=11 bonus; 12-16 double bonus; >=17 automatic tier 3.','Efficiency']
    ],
    LSC: [
      ['Deploy Drones','2d10 + Electronics (I)','Ranged 1 parsec → one ship','Until next stage','Success attaches drones to enemy airlock. <=11 failure; enemy alerted.',''],
      ['Hack Enemy Airlock','2d10 + Computers (E)','Ranged 1 parsec → one ship','Until next stage','Prerequisite: Deploy Drones success. >=17 unlocks airlock; <=16 fails.',''],
      ['Deploy Boarding Party','Reflex (A)','Ranged 1 parsec → one ship','Immediate','Prerequisite: Hack Enemy Airlock success and boarding party at LSC. Each member takes 15/10/7 physical damage and reaches airlock.',''],
      ['Detach Drones','2d10 + Electronics (I)','Self','Immediate','Prerequisite: Detect Drones success. >=17 detaches drones; <=11 gives enemy bonus to Hack Enemy Airlock.',''],
      ['Secure Airlock','2d10 + Computers (E)','Self','Immediate','Prerequisite: Detach Drones success. <=11 causes LSC system damage; >=17 relocks airlock.','']
    ],
    Cargo: [['Cargo Damage','—','Self','Persistent','Each cargo system damage destroys 10 tonnes of cargo. Defender chooses cargo type.']],
    Power: [['Power Plant Damage','—','Self','Persistent','Each power plant system damage removes 25 units of power.']]
  };

  function callRender(){ if (typeof normalise === 'function') normalise(); if (typeof render === 'function') render(); }
  function commit(){ if (typeof save === 'function') save(false); }
  function addModFor(system, mod){
    if (!ship || !MODS[mod] || MODS[mod].system !== system) return;
    if (!ship.mods.includes(mod)) ship.mods.push(mod);
    callRender(); commit();
  }
  window.astAddMod = addModFor;

  function buildSystemBlocks(){
    const anchor = document.querySelector('.grid'); if (!anchor || document.getElementById('system-blocks')) return;
    const wrap = document.createElement('section'); wrap.id='system-blocks'; wrap.className='system-blocks full';
    wrap.innerHTML = '<div class="system-blocks-title"><div><div class="eyebrow">SHIP OPERATIONS</div><h2>System Stations</h2></div><span class="muted">Actions and modifications by station</span></div>';
    Object.keys(ACTIONS).forEach(system => {
      const block=document.createElement('article'); block.className='system-block';
      const mods=SYSTEM_MODS[system]||[];
      block.innerHTML=`<div class="system-block-head"><h3>${system==='LSC'?'Life Support & Communications':system}</h3><span>${(ship.systemDamage?.[system]||0)} damage</span></div>
        <div class="system-actions">${ACTIONS[system].map((a,i)=>`<div class="action-card"><div class="action-head"><strong>${a[0]}</strong><span>${a[1]}</span></div><div class="action-meta"><span>Range: ${a[2]}</span><span>Duration: ${a[3]}</span></div><p>${a[4]}</p>${a[5]?`<small class="requires">Requires: ${a[5]}</small>`:''}</div>`).join('')}</div>
        ${mods.length?`<div class="mod-area"><div class="mod-add"><select id="mod-select-${system}"><option value="">Add modification…</option>${mods.map(m=>`<option value="${m}">${MODS[m].name||m} — ${MODS[m].cost}, ${MODS[m].size} t</option>`).join('')}</select><button class="btn primary" data-add-mod="${system}">Add modification</button></div><div class="installed-mods">${ship.mods.filter(m=>mods.includes(m)).map(m=>`<div class="installed-mod"><strong>${m}</strong><span>${MODS[m].description}</span><button class="btn danger" data-remove-mod="${m}">Remove</button></div>`).join('')||'<span class="muted">No modifications installed.</span>'}</div></div>`:''}`;
      wrap.appendChild(block);
    });
    anchor.appendChild(wrap);
    wrap.querySelectorAll('[data-add-mod]').forEach(btn=>btn.onclick=()=>{const s=btn.dataset.addMod;const sel=wrap.querySelector('#mod-select-'+s);if(sel.value) addModFor(s,sel.value);});
    wrap.querySelectorAll('[data-remove-mod]').forEach(btn=>btn.onclick=()=>{ship.mods=ship.mods.filter(m=>m!==btn.dataset.removeMod);callRender();commit();});
  }

  function buildShipsLog(){
    if (!ship) return;
    const old=[...document.querySelectorAll('.card')].find(c=>/notes|ship.?log/i.test(c.textContent||''));
    if(old && /notes/i.test(old.textContent||'')) old.style.display='none';
    if(document.getElementById('ships-log')) return;
    const grid=document.querySelector('.grid'); if(!grid) return;
    const card=document.createElement('section'); card.id='ships-log'; card.className='card wide ships-log';
    card.innerHTML=`<div class="card-title"><h2>Ship's Log</h2><span class="pill" id="log-count">0 / 100,000</span></div><textarea id="ship-log-input" maxlength="100000" placeholder="Record the ship's journey, discoveries, repairs, debts, rumours, cargo, encounters, or anything else worth remembering..."></textarea>`;
    grid.appendChild(card);
    const ta=card.querySelector('textarea'); ta.value=ship.notes||''; const count=card.querySelector('#log-count'); const update=()=>{count.textContent=`${ta.value.length.toLocaleString()} / 100,000`;ship.notes=ta.value;if(typeof save==='function')save(false);}; ta.addEventListener('input',update); update();
  }

  function combatView(){
    let screen=document.getElementById('combat-screen');
    if(!screen){ screen=document.createElement('div');screen.id='combat-screen';document.body.appendChild(screen); }
    const c=calc();
    screen.innerHTML=`<div class="combat-shell"><div class="combat-top"><div><div class="eyebrow">ASTROVOYAGE · COMBAT CONTROL</div><h1>${esc(ship.name)}</h1></div><button class="btn" id="exit-combat">Exit Combat</button></div>
      <div class="combat-stats"><div><small>COMMAND POINTS</small><b>${c.b.cp}</b></div><div><small>HULL HP</small><b>${ship.currentHull} / ${c.h.hp}</b></div><div><small>SHIELD HP</small><b>${ship.currentShield} / ${c.shieldMax}</b></div><div><small>THRESHOLD</small><b>${c.sh.physical}P / ${c.sh.energy}E</b></div><div><small>POWER</small><b>${ship.currentPower} / ${c.p.capacity}</b></div><div><small>ROUND</small><b>${ship.combatRound}</b></div></div>
      <div class="combat-grid">${Object.keys(ACTIONS).map(system=>`<section class="combat-system"><header><h2>${system==='LSC'?'Life Support & Communications':system}</h2><span>${ship.systemDamage?.[system]||0} damage</span></header>${ACTIONS[system].map(a=>{const usable=!a[5]||ship.mods.includes(a[5]);return `<button class="combat-action ${usable?'':'disabled'}" ${usable?'':'disabled'}><strong>${a[0]}</strong><span>${a[1]} · ${a[2]}</span><small>${a[4]}</small></button>`}).join('')}</section>`).join('')}</div></div>`;
    screen.style.display='block'; document.body.classList.add('in-combat'); screen.querySelector('#exit-combat').onclick=()=>{screen.style.display='none';document.body.classList.remove('in-combat');};
  }

  function addCombatButton(){
    const actions=document.querySelector('.topbar .actions'); if(!actions||actions.querySelector('[data-combat]'))return;
    const b=document.createElement('button');b.className='btn primary';b.dataset.combat='1';b.textContent='Combat';b.onclick=combatView;actions.insertBefore(b,actions.firstChild);
  }

  const observer=new MutationObserver(()=>{setTimeout(()=>{addCombatButton();buildSystemBlocks();buildShipsLog();},0);});
  observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>{addCombatButton();buildSystemBlocks();buildShipsLog();},300);
})();

(() => {
  const SYSTEM_MODS = {
    Helm: ['Targeting','Stabiliser','EfficientHelm'],
    Engineering: ['Rerouter','Booster','Efficiency'],
    LSC: ['MidCommunicator','LongCommunicator','UltraCommunicator']
  };
  const ACTIONS = {
    Helm: [
      ['Evasive Manoeuvre','2d10 + Pilot (I)','Self','SNT','≤11: one attack penalty; 12–16: double penalty; ≥17: double penalty and no system damage.'],
      ['Targeting System','2d10 + Pilot (A)','Ranged Far → one ship','SNT','If enemy hull is bigger, gain a bonus. Tier 2 gives attack bonus; tier 3 also lets you choose the damaged system.','Targeting'],
      ['Hold Steady','Passive','Self','Passive','Pilot checks to steady the ship, and difficult landing/docking checks, gain a bonus.','Stabiliser'],
      ['Aid Boarding','2d10 + Pilot (E)','Self','SNT','12–16: bonus to boarding actions; ≥17: double bonus.','Stabiliser'],
      ['Efficient Flying','2d10 + Pilot (I)','Self','Next parsec','≤11: +25 power for next parsec; 12–16: 20 fewer; ≥17: 40 fewer.','EfficientHelm']
    ],
    Weapons: [],
    Engineering: [
      ['Go! Go! Go!','2d10 + Engineering (E)','Self','3–5 rounds','Spend 100 power. ≤11: FTL in 5 rounds; 12–16: 4; ≥17: 3.'],
      ['Reroute Power','2d10 + Electronics (E)','Self','Immediate','Gain 20/50/80 power, then deal 1 system damage to a chosen system.','Rerouter'],
      ['Boost Shield','2d10 + Engineering (I)','Self','SNT','Spend 20 power. Increase shield damage threshold by 5/10/15.','Booster'],
      ['Power to the Bridge','2d10 + Engineering (E)','Self','Immediate','Spend 30/25/20 power. Gain 1 CP usable immediately or until the end of your next turn.','Booster'],
      ['Weapons Boost','2d10 + Engineering (I)','Self','Next weapon attack','Spend 10/7/5 power. Add 2d6 damage to your next weapon attack.','Booster'],
      ['Go Easy','2d10 + Electronics (E)','Self','Next action','Next action requires 25% less power. ≤11 also double penalty; 12–16 penalty.','Efficiency'],
      ['Push It Hard','2d10 + Electronics (E)','Self','Next action','Next action requires 25% more power. ≤11 bonus; 12–16 double bonus; ≥17 automatically tier 3.','Efficiency']
    ],
    LSC: [
      ['Deploy Drones','2d10 + Electronics (I)','Ranged 1 parsec → one ship','1 CP','≤11 failure and enemy alerted; 12–16 success and alerted; ≥17 success.'],
      ['Hack Enemy Airlock','2d10 + Computers (E)','Ranged 1 parsec → one ship','1 CP','Requires successful Deploy Drones. ≤16 fails; ≥17 succeeds.'],
      ['Deploy Boarding Party','Reflex (A)','Ranged 1 parsec → one ship','1 CP','Requires successful Hack Enemy Airlock and boarding party at LSC. Each member takes 15/10/7 physical damage.'],
      ['Detach Drones','2d10 + Electronics (I)','Self','1 CP','Requires successful Detect Drones. ≤11 gives enemy Hack Enemy Airlock a bonus; ≥17 detaches drones.'],
      ['Secure Airlock','2d10 + Computers (E)','Self','1 CP','Requires successful Detach Drones. ≤11 causes LSC system damage; ≥17 relocks the airlock.']
    ],
    Cargo: [['Cargo Hold','Passive','Self','Persistent','Each Cargo Hold system damage destroys 10 tonnes of cargo.']],
    Power: [['Power Plant','Passive','Self','Persistent','Each Power Plant system damage removes 25 units of power.']]
  };
  const title = s => s === 'LSC' ? 'Life Support & Communications' : s === 'Power' ? 'Power Plant' : s;
  const css = `
    #system-stations{grid-column:1/-1}.system-blocks-title{display:flex;justify-content:space-between;align-items:end;margin-bottom:14px}.system-blocks-title h2{margin:4px 0 0}.system-blocks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.system-block{border:1px solid rgba(130,150,190,.28);border-radius:14px;padding:16px;background:rgba(12,18,34,.72)}.system-block-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.system-block h3{margin:4px 0}.system-actions{display:grid;gap:9px;margin-top:12px}.action-card{padding:11px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid rgba(130,150,190,.18)}.action-head{display:flex;justify-content:space-between;gap:12px}.action-head strong{font-size:.95rem}.action-head span,.action-meta{font-size:.72rem;color:#91a1bd}.action-meta{display:flex;gap:12px;margin-top:4px}.action-card p{margin:7px 0 0;font-size:.85rem}.mod-area{margin-top:14px;padding-top:12px;border-top:1px solid rgba(130,150,190,.18)}.mod-add{display:flex;gap:8px}.mod-add select,.weapon-add select,.power-add select{flex:1;min-width:0;background:#101827!important;color:#e8edf7!important;border:1px solid #394966!important;border-radius:8px;padding:9px 10px;appearance:auto;color-scheme:dark}.installed-mods{display:grid;gap:7px;margin-top:9px}.installed-mod{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;font-size:.82rem}.installed-mod span{color:#91a1bd}.station-item{padding:10px;border:1px solid rgba(130,150,190,.18);border-radius:9px;background:rgba(255,255,255,.025);margin-top:9px}.station-item-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.weapon-add,.power-add{display:flex;gap:8px;margin-top:12px}.builder-screen{position:fixed;inset:0;z-index:100000;background:#080d19;color:#e8edf7;overflow:auto;padding:28px;box-sizing:border-box}.builder-inner{max-width:1050px;margin:auto}.builder-pages{display:grid;grid-template-columns:180px 1fr;gap:20px}.builder-nav{display:grid;align-content:start;gap:6px}.builder-nav button{background:#101827;color:#cbd5e1;border:1px solid #2b3852;border-radius:8px;padding:10px;text-align:left}.builder-nav button.active{border-color:#7c93bd}.builder-panel{background:#101827;border:1px solid #2b3852;border-radius:14px;padding:20px}.builder-panel h2{margin-top:0}.builder-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.builder-grid .field{display:grid;gap:6px}.builder-grid select,.builder-grid input{background:#0c1422;color:#e8edf7;border:1px solid #394966;border-radius:8px;padding:10px}.builder-weapons{display:grid;gap:9px}.builder-weapon{display:grid;grid-template-columns:1fr 90px auto;gap:8px;align-items:center}.builder-actions{display:flex;justify-content:space-between;margin-top:20px}.combat-screen-old{display:none!important}@media(max-width:800px){.system-blocks,.builder-grid{grid-template-columns:1fr}.mod-add,.weapon-add,.power-add{flex-direction:column}.builder-pages{grid-template-columns:1fr}.installed-mod{grid-template-columns:1fr}}
  `;
  if (!document.getElementById('astro-layout-css')) { const s=document.createElement('style'); s.id='astro-layout-css'; s.textContent=css; document.head.appendChild(s); }

  let busy = false;
  const saveIt = () => { try { if (typeof save === 'function') save(false); } catch(e) { console.error(e); } };
  const refresh = () => { if (busy) return; busy=true; try { render(); } finally { busy=false; setTimeout(enhance,0); } };

  function removeOldCards() {
    const grid=document.querySelector('.grid'); if(!grid) return;
    const removeTitles=['Core Systems','Cargo & Crew','System Damage','Installed Modifications','Weapons','Combat Control','Notes'];
    [...grid.querySelectorAll('.card')].forEach(card=>{const h=card.querySelector('h2'); if(h && removeTitles.some(t=>h.textContent.trim().toLowerCase()===t.toLowerCase())) card.remove();});
  }

  function rebuildHero() {
    const hero=document.querySelector('.hero'); if(!hero || typeof ship==='undefined' || !ship) return;
    const c=calc();
    const left=hero.querySelector('div'); const right=hero.querySelector('.hero-actions');
    if(left) left.innerHTML=`<span class="badge">${c.h.size} HULL</span><strong>${esc(ship.hull)} Class</strong><span class="muted"> · ${c.h.hp} max HP · shield factor ${c.h.shieldFactor}</span>`;
    if(right) right.innerHTML=`<span>${c.h.crew} crew quarters</span>`;
  }

  function rebuildLiveStatus() {
    const card=[...document.querySelectorAll('.grid .card')].find(x=>x.querySelector('h2')?.textContent.trim()==='Live Status');
    if(!card || typeof ship==='undefined') return; const c=calc();
    card.querySelector('.statgrid').innerHTML=`
      <div class="stat"><small>HULL</small><strong>${ship.currentHull}<i> / ${c.h.hp}</i></strong><button class="mini" onclick="damageHull(1)">−1</button></div>
      <div class="stat"><small>SHIELD</small><strong>${ship.currentShield}<i> / ${c.shieldMax}</i></strong><button class="mini" onclick="damageShield(1)">−1</button></div>
      <div class="stat"><small>POWER</small><strong>${ship.currentPower}<i> / ${c.p.capacity}</i></strong><button class="mini" onclick="spendPower(10)">−10</button></div>
      <div class="stat"><small>COMMAND</small><strong>${c.b.cp}</strong><i> CP / turn</i></div>
      <div class="stat"><small>MONEY</small><strong>${fmtMoney(c.total)}</strong><i> ship value</i></div>
      <div class="stat"><small>CARGO</small><strong>${ship.cargoUsed}<i> / ${c.cargo} t</i></strong><button class="mini" onclick="cargoAdd(1)">+1t</button></div>`;
  }

  function actionCards(system) {
    let actions = ACTIONS[system].slice();
    if(system==='Weapons') {
      actions = (ship.weapons||[]).map((w,i)=>{const x=WEAPONS[w.type]||{}; return [`Fire ${x.name||w.type} #${i+1}`,'2d10 + Gunner (A)',`Ranged ${x.range||''} → one ship`,'1 CP / shot',`PPS ${x.pps??'—'} · CPS ${x.cps??'—'} · damage ${x.damage||'—'}. Each shot is one action.`];});
    }
    return actions.filter(a=>!a[5] || ship.mods.includes(a[5]));
  }

  function modificationUI(system) {
    const mods=SYSTEM_MODS[system]||[]; if(!mods.length) return '';
    const installed=ship.mods.filter(m=>mods.includes(m));
    return `<div class="mod-area"><div class="mod-add"><select data-mod-select="${system}"><option value="">Add ${system} modification...</option>${mods.filter(m=>!ship.mods.includes(m)).map(m=>`<option value="${m}">${m} · ${MODS[m].cost} · ${MODS[m].size} t</option>`).join('')}</select><button class="btn primary" data-add-mod="${system}">Add</button></div>${installed.length?`<div class="installed-mods">${installed.map(m=>`<div class="installed-mod"><strong>${m}</strong><span>${MODS[m].description}</span><button class="btn danger" data-remove-mod="${m}">Remove</button></div>`).join('')}</div>`:''}</div>`;
  }

  function weaponUI(){
    const rows=(ship.weapons||[]).map((w,i)=>{const x=WEAPONS[w.type]||{};return `<div class="station-item"><div class="station-item-head"><strong>${x.name||w.type} × ${w.qty||1}</strong><span>${x.range||''} · ${x.damage||''}</span></div><small class="muted">PPS ${x.pps??'—'} · CPS ${x.cps??'—'}</small></div>`;}).join('');
    return `<div class="station-item">${rows||'<span class="muted">No weapons installed.</span>'}</div><div class="weapon-add"><select id="station-weapon-select"><option value="">Add weapon...</option>${Object.entries(WEAPONS).map(([k,v])=>`<option value="${k}">${v.name} · ${v.cost}</option>`).join('')}</select><button class="btn primary" id="station-add-weapon">Add weapon</button></div>`;
  }

  function powerUI(){
    const count=1+(ship.extraPowerPlants||[]).length;
    const extras=(ship.extraPowerPlants||[]).map((p,i)=>`<div class="station-item"><div class="station-item-head"><strong>${POWER[p]?.name||p} Power Plant</strong><button class="btn danger" data-remove-power="${i}">Remove</button></div><small class="muted">${POWER[p]?.capacity||0} capacity · ${POWER[p]?.size||0} tonnes · ${POWER[p]?.cost||''}</small></div>`).join('');
    return `<div class="station-item"><div class="station-item-head"><strong>Primary: ${ship.powerPlant} Power Plant</strong><span>${calc().p.capacity} capacity</span></div></div>${extras}<div class="power-add"><select id="station-power-select"><option value="">Add power plant...</option>${Object.entries(POWER).map(([k,v])=>`<option value="${k}">${k} · ${v.cost} · ${v.capacity} capacity</option>`).join('')}</select><button class="btn primary" id="station-add-power">Add</button></div>`;
  }

  function addStations(){
    if(typeof ship==='undefined'||!ship)return; const grid=document.querySelector('.grid');if(!grid)return;
    document.getElementById('system-stations')?.remove();
    const wrap=document.createElement('section');wrap.id='system-stations';wrap.className='card wide';
    wrap.innerHTML='<div class="system-blocks-title"><div><div class="eyebrow">SHIP OPERATIONS</div><h2>System Stations</h2></div><span class="muted">Available actions and system modifications</span></div><div class="system-blocks"></div>';
    const blocks=wrap.querySelector('.system-blocks');
    Object.keys(ACTIONS).forEach(system=>{
      const block=document.createElement('article');block.className='system-block';
      const cards=actionCards(system).map(a=>`<article class="action-card"><div class="action-head"><strong>${a[0]}</strong><span>${a[1]}</span></div><div class="action-meta"><span>Range: ${a[2]}</span><span>${a[3]}</span></div><p>${a[4]}</p></article>`).join('');
      const extra=system==='Weapons'?weaponUI():system==='Power'?powerUI():'';
      block.innerHTML=`<div class="system-block-head"><div><div class="eyebrow">STATION</div><h3>${title(system)}</h3></div></div><div class="system-actions">${cards||'<span class="muted">No available actions.</span>'}</div>${modificationUI(system)}${extra}`;
      blocks.appendChild(block);
    });
    grid.appendChild(wrap);
    wrap.querySelectorAll('[data-add-mod]').forEach(btn=>btn.onclick=()=>{const sel=wrap.querySelector(`[data-mod-select="${btn.dataset.addMod}"]`);if(!sel.value)return;if(!ship.mods.includes(sel.value)){ship.mods.push(sel.value);saveIt();refresh();}});
    wrap.querySelectorAll('[data-remove-mod]').forEach(btn=>btn.onclick=()=>{ship.mods=ship.mods.filter(m=>m!==btn.dataset.removeMod);saveIt();refresh();});
    wrap.querySelector('#station-add-weapon')?.addEventListener('click',()=>{const sel=wrap.querySelector('#station-weapon-select');if(!sel.value)return;ship.weapons.push({type:sel.value,qty:1});saveIt();refresh();});
    wrap.querySelector('#station-add-power')?.addEventListener('click',()=>{const sel=wrap.querySelector('#station-power-select');if(!sel.value)return;ship.extraPowerPlants=ship.extraPowerPlants||[];ship.extraPowerPlants.push(sel.value);saveIt();refresh();});
    wrap.querySelectorAll('[data-remove-power]').forEach(btn=>btn.onclick=()=>{ship.extraPowerPlants.splice(Number(btn.dataset.removePower),1);saveIt();refresh();});
  }

  function addShipsLog(){
    if(typeof ship==='undefined'||!ship)return;const grid=document.querySelector('.grid');if(!grid)return;
    document.getElementById('ships-log')?.remove();
    const card=document.createElement('section');card.id='ships-log';card.className='card wide';const value=ship.notes||'';
    card.innerHTML=`<div class="card-title"><h2>Ship's Log</h2><span class="pill log-count">${value.length.toLocaleString()} / 100,000</span></div><textarea class="notes" maxlength="100000" placeholder="Record the ship's journey, discoveries, repairs, debts, rumours, cargo, encounters, or anything else worth remembering..."></textarea>`;
    grid.appendChild(card);const ta=card.querySelector('textarea');ta.value=value;ta.oninput=()=>{ship.notes=ta.value;card.querySelector('.log-count').textContent=`${ta.value.length.toLocaleString()} / 100,000`;saveIt();};
  }

  function removeOldCombatButtons(){
    document.querySelectorAll('.topbar .actions button').forEach(b=>{if(b.textContent.trim().toLowerCase()==='combat')b.remove();});
    const old=document.getElementById('combat-screen');if(old)old.remove();
  }
  function addCombatButton(){
    const actions=document.querySelector('.topbar .actions');if(!actions)return;removeOldCombatButtons();
    const b=document.createElement('button');b.className='btn primary';b.textContent='Combat';b.dataset.astroCombat='1';b.onclick=showCombat;actions.insertBefore(b,actions.firstChild);
  }
  function showCombat(){
    if(typeof ship==='undefined'||!ship)return;let s=document.getElementById('astro-combat');if(!s){s=document.createElement('div');s.id='astro-combat';s.className='builder-screen';document.body.appendChild(s);}
    const c=calc();const groups=Object.keys(ACTIONS).map(system=>{const acts=actionCards(system);return `<section class="system-block"><div class="system-block-head"><h3>${title(system)}</h3></div>${acts.map(a=>`<article class="action-card"><div class="action-head"><strong>${a[0]}</strong><span>${a[1]}</span></div><div class="action-meta"><span>${a[2]}</span><span>${a[3]}</span></div><p>${a[4]}</p></article>`).join('')}</section>`}).join('');
    s.innerHTML=`<div class="builder-inner"><div class="system-blocks-title"><div><div class="eyebrow">ASTROVOYAGE · COMBAT</div><h1>${esc(ship.name)}</h1></div><button class="btn" id="exit-astro-combat">Exit Combat</button></div><div class="combat-stats" style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:16px"><div class="station-item"><small>COMMAND POINTS</small><br><b>${c.b.cp}</b></div><div class="station-item"><small>HULL HP</small><br><b>${ship.currentHull} / ${c.h.hp}</b></div><div class="station-item"><small>SHIELD HP</small><br><b>${ship.currentShield} / ${c.shieldMax}</b></div><div class="station-item"><small>THRESHOLD</small><br><b>${c.sh.physical}P / ${c.sh.energy}E</b></div><div class="station-item"><small>POWER</small><br><b>${ship.currentPower} / ${c.p.capacity}</b></div><div class="station-item"><small>ROUND</small><br><b>${ship.combatRound}</b></div></div><div class="system-blocks">${groups}</div></div>`;
    s.style.display='block';s.querySelector('#exit-astro-combat').onclick=()=>s.remove();
  }

  function enhance(){
    if(typeof ship==='undefined'||!ship)return;const app=document.getElementById('app');if(!app||!app.children.length)return;
    removeOldCards();rebuildHero();rebuildLiveStatus();addCombatButton();addStations();addShipsLog();
  }
  const observer=new MutationObserver(()=>{clearTimeout(window.__astroLayoutTimer);window.__astroLayoutTimer=setTimeout(enhance,0);});
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  setTimeout(enhance,50);
})();

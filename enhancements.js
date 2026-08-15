(() => {
  const SYSTEM_MODS = {
    Helm: ['Targeting','Stabiliser','EfficientHelm'],
    Engineering: ['Rerouter','Booster','Efficiency'],
    LSC: ['MidCommunicator','LongCommunicator','UltraCommunicator']
  };
  const ACTIONS = {
    Helm: [
      ['Evasive Manoeuvre','2d10 + Pilot (I)','Self','1 CP','≤ 11 — one penalty to all attacks against you (SNT).\n12–16 — double penalty (SNT).\n≥ 17 — double penalty and no system damage (SNT).'],
      ['Targeting System','2d10 + Pilot (A)','Ranged Far → one ship','1 CP','≤ 11 — no effect.\n12–16 — bonus to all your attacks (SNT).\n≥ 17 — bonus to all your attacks and choose the system when you impose system damage (SNT).','Targeting'],
      ['Hold Steady','Passive','Self','Passive','Pilot checks to steady the ship gain a bonus. Difficult landing and docking checks also gain a bonus.','Stabiliser'],
      ['Aid Boarding','2d10 + Pilot (E)','Self','1 CP','≤ 11 — no effect.\n12–16 — bonus to all boarding actions (SNT).\n≥ 17 — double bonus to all boarding actions (SNT).','Stabiliser'],
      ['Efficient Flying','2d10 + Pilot (I)','Self','1 CP','≤ 11 — failure; consume 25 additional power for the next parsec.\n12–16 — consume 20 fewer power for the next parsec.\n≥ 17 — consume 40 fewer power for the next parsec.','EfficientHelm']
    ],
    Weapons: [],
    Engineering: [
      ['Go! Go! Go!','2d10 + Engineering (E)','Self','1 CP','≤ 11 — go to FTL in 5 rounds.\n12–16 — go to FTL in 4 rounds.\n≥ 17 — go to FTL in 3 rounds.\nEffect: spend 100 power.'],
      ['Reroute Power','2d10 + Electronics (E)','Self','1 CP','≤ 11 — gain 20 power.\n12–16 — gain 50 power.\n≥ 17 — gain 80 power.\nEffect: deal one system damage to a system of your own ship.','Rerouter'],
      ['Boost Shield','2d10 + Engineering (I)','Self','1 CP','≤ 11 — increase shield threshold by 5.\n12–16 — increase by 10.\n≥ 17 — increase by 15.\nEffect: spend 20 power.','Booster'],
      ['Power to the Bridge','2d10 + Engineering (E)','Self','1 CP','≤ 11 — spend 30 power.\n12–16 — spend 25 power.\n≥ 17 — spend 20 power.\nEffect: gain 1 command point usable immediately or until the end of your next turn.','Booster'],
      ['Weapons Boost','2d10 + Engineering (I)','Self','1 CP','≤ 11 — spend 10 power.\n12–16 — spend 7 power.\n≥ 17 — spend 5 power.\nEffect: add 2d6 damage to your next weapon attack.','Booster'],
      ['Go Easy','2d10 + Electronics (E)','Self','1 CP','≤ 11 — next action uses 25% less power and has a double penalty.\n12–16 — 25% less power and a penalty.\n≥ 17 — 25% less power.','Efficiency'],
      ['Push It Hard','2d10 + Electronics (E)','Self','1 CP','≤ 11 — next action uses 25% more power and has a bonus.\n12–16 — 25% more power and a double bonus.\n≥ 17 — 25% more power and is automatically a tier 3 result.','Efficiency'],
      ['Travel','Space Travel','1 parsec','1 day','Spend 100 units of power and travel 1 parsec in 1 day. Non-FTL travel uses 10 power per day.']
    ],
    LSC: [
      ['Deploy Drones','2d10 + Electronics (I)','Ranged 1 parsec → one ship','1 CP','≤ 11 — failure; enemy alerted.\n12–16 — success; enemy alerted.\n≥ 17 — success.\nEffect: drones attach to the enemy airlock.'],
      ['Hack Enemy Airlock','2d10 + Computers (E)','Ranged 1 parsec → one ship','1 CP','Prerequisite: successful Deploy Drones.\n≤ 11 — failure; enemy alerted.\n12–16 — failure.\n≥ 17 — success.'],
      ['Deploy Boarding Party','Reflex (A)','Ranged 1 parsec → one ship','1 CP','Prerequisite: successful Hack Enemy Airlock and all boarding members at LSC.\n≤ 11 — 15 physical damage to each member.\n12–16 — 10 physical damage.\n≥ 17 — 7 physical damage.'],
      ['Detach Drones','2d10 + Electronics (I)','Self','1 CP','Prerequisite: success in Detach/Detect Drones sequence.\n≤ 11 — enemy Hack Enemy Airlock gets a bonus.\n12–16 — failure.\n≥ 17 — detach the enemy drones.'],
      ['Secure Airlock','2d10 + Computers (E)','Self','1 CP','Prerequisite: success in Detach Drones.\n≤ 11 — your LSC takes system damage.\n12–16 — failure.\n≥ 17 — relock the airlock.']
    ],
    Cargo: [['Cargo Hold','Passive','Self','Persistent','Each time the cargo hold takes system damage, 10 tonnes of cargo is destroyed.']],
    Power: [['Power Plant','Passive','Self','Persistent','Each time the Power Plant takes system damage, it loses 25 units of power.']]
  };
  const title = s => s === 'LSC' ? 'Life Support & Communications' : s === 'Power' ? 'Power Plant' : s;

  const style = document.createElement('style');
  style.textContent = `
    #system-stations,#ships-log{grid-column:1/-1;width:100%;box-sizing:border-box}
    .system-blocks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .system-block{border:1px solid rgba(130,150,190,.28);border-radius:14px;padding:16px;background:rgba(12,18,34,.72)}
    .system-block-head{display:flex;justify-content:space-between;align-items:center}.system-block h3{margin:4px 0}
    .system-actions{display:grid;gap:9px;margin-top:12px}.action-card{padding:11px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid rgba(130,150,190,.18)}
    .action-head{display:flex;justify-content:space-between;gap:12px}.action-head span,.action-meta{font-size:.72rem;color:#91a1bd}.action-meta{display:flex;gap:12px;margin-top:4px}
    .action-card p{white-space:pre-line;margin:7px 0 0;font-size:.85rem;line-height:1.5}
    .mod-area{margin-top:14px;padding-top:12px;border-top:1px solid rgba(130,150,190,.18)}.mod-add,.weapon-add,.power-add{display:flex;gap:8px;margin-top:8px}
    .mod-add select,.weapon-add select,.power-add select{flex:1;min-width:0;background:#101827!important;color:#e8edf7!important;border:1px solid #394966!important;border-radius:8px;padding:9px 10px;color-scheme:dark}
    .installed-mods{display:grid;gap:7px;margin-top:9px}.installed-mod{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;font-size:.82rem}.installed-mod span{color:#91a1bd}
    .station-item{padding:10px;border:1px solid rgba(130,150,190,.18);border-radius:9px;background:rgba(255,255,255,.025);margin-top:9px}.station-item-head{display:flex;justify-content:space-between;gap:10px;align-items:center}
    #ships-log textarea{width:100%;min-height:520px;box-sizing:border-box;resize:vertical;background:#0c1422;color:#e8edf7;border:1px solid #394966;border-radius:10px;padding:16px;font:inherit;line-height:1.55}
    #ships-log .log-count{margin-top:7px;font-size:.75rem;color:#91a1bd;text-align:right}
    .tier-results{display:grid;gap:5px;margin-top:7px}.tier-results div{line-height:1.45}.tier-results b{display:inline-block;min-width:58px}
    @media(max-width:800px){.system-blocks{grid-template-columns:1fr}.mod-add,.weapon-add,.power-add{flex-direction:column}.installed-mod{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };
  const removeCards = () => {
    document.querySelectorAll('.grid .card').forEach(card => {
      const h = card.querySelector('h2')?.textContent.trim().toLowerCase();
      if (['core systems','cargo & crew','system damage','installed modifications','weapons','combat control','notes'].includes(h)) card.remove();
    });
    document.querySelectorAll('button').forEach(b => { const t=b.textContent.trim().toLowerCase(); if(t==='combat'||t==='combat mode'||t==='exit combat') b.remove(); });
    document.getElementById('astro-combat')?.remove();
  };

  function updateMoney() {
    const card=[...document.querySelectorAll('.grid .card')].find(c=>c.querySelector('h2')?.textContent.trim()==='Live Status');
    if(!card || typeof ship==='undefined') return;
    const stat=[...card.querySelectorAll('.stat')].find(s=>s.querySelector('small')?.textContent.trim()==='MONEY');
    if(!stat || stat.querySelector('input')) return;
    stat.innerHTML='<small>MONEY</small><input class="money-input" type="number" min="0" step="1">';
    const input=stat.querySelector('input'); input.value=Number(ship.money||0);
    input.addEventListener('input',()=>{ship.money=Math.max(0,Number(input.value)||0);saveQuiet();});
  }

  function actionMarkup(a){
    return `<article class="action-card"><div class="action-head"><strong>${a[0]}</strong><span>${a[1]}</span></div><div class="action-meta"><span>${a[2]}</span><span>${a[3]}</span></div><p>${a[4]}</p></article>`;
  }
  function actionsFor(system){
    let list=ACTIONS[system].slice();
    if(system==='Weapons') list=(ship.weapons||[]).map((w,i)=>{const x=WEAPONS[w.type]||{};return [`Fire ${x.name||w.type} #${i+1}`,'2d10 + Gunner (A)',`Ranged ${x.range||''} → one ship`,'1 CP / shot',`PPS ${x.pps??'—'} · CPS ${x.cps??'—'} · Damage: ${x.damage||'—'}`];});
    return list.filter(a=>!a[5] || (ship.mods||[]).includes(a[5]));
  }
  function modMarkup(system){
    const mods=SYSTEM_MODS[system]||[]; if(!mods.length) return '';
    const available=mods.filter(m=>!(ship.mods||[]).includes(m));
    const installed=mods.filter(m=>(ship.mods||[]).includes(m));
    return `<div class="mod-area"><div class="mod-add"><select data-mod-select="${system}"><option value="">Add modification...</option>${available.map(m=>`<option value="${m}">${m}</option>`).join('')}</select><button class="btn primary" data-add-mod="${system}" type="button">Add</button></div>${installed.length?`<div class="installed-mods">${installed.map(m=>`<div class="installed-mod"><strong>${m}</strong><span>${MODS[m]?.description||''}</span><button class="btn danger" data-remove-mod="${m}" type="button">Remove</button></div>`).join('')}</div>`:''}</div>`;
  }
  function weaponMarkup(){
    const rows=(ship.weapons||[]).map((w,i)=>{const x=WEAPONS[w.type]||{};return `<div class="station-item"><div class="station-item-head"><strong>${x.name||w.type} × ${w.qty||1}</strong><button class="btn danger" type="button" data-remove-weapon="${i}">Remove</button></div><small class="muted">${x.range||''} · PPS ${x.pps??'—'} · CPS ${x.cps??'—'}</small></div>`;}).join('');
    return `${rows||'<div class="station-item"><span class="muted">No weapons installed.</span></div>'}<div class="weapon-add"><select id="station-weapon-select"><option value="">Add weapon...</option>${Object.entries(WEAPONS).map(([k,v])=>`<option value="${k}">${v.name} · ${v.cost}</option>`).join('')}</select><button class="btn primary" id="station-add-weapon" type="button">Add weapon</button></div>`;
  }
  function powerMarkup(){
    const extras=(ship.extraPowerPlants||[]).map((p,i)=>`<div class="station-item"><div class="station-item-head"><strong>${POWER[p]?.name||p} Power Plant</strong><button class="btn danger" type="button" data-remove-power="${i}">Remove</button></div><small class="muted">${POWER[p]?.capacity||0} capacity · ${POWER[p]?.size||0} tonnes</small></div>`).join('');
    return `<div class="station-item"><div class="station-item-head"><strong>Primary: ${ship.powerPlant} Power Plant</strong><span>${calc().p.capacity} capacity</span></div></div>${extras}<div class="power-add"><select id="station-power-select"><option value="">Add power plant...</option>${Object.entries(POWER).map(([k,v])=>`<option value="${k}">${k} · ${v.cost} · ${v.capacity} capacity</option>`).join('')}</select><button class="btn primary" id="station-add-power" type="button">Add power plant</button></div>`;
  }
  function buildStations(){
    const grid=document.querySelector('.grid'); if(!grid||typeof ship==='undefined'||!ship) return;
    document.getElementById('system-stations')?.remove();
    const wrap=document.createElement('section');wrap.id='system-stations';wrap.className='card wide';
    wrap.innerHTML='<div class="system-blocks-title"><div><div class="eyebrow">SHIP OPERATIONS</div><h2>System Stations</h2></div></div><div class="system-blocks"></div>';
    const blocks=wrap.querySelector('.system-blocks');
    Object.keys(ACTIONS).forEach(system=>{
      const block=document.createElement('article');block.className='system-block';
      let extra=system==='Weapons'?weaponMarkup():system==='Power'?powerMarkup():'';
      block.innerHTML=`<div class="system-block-head"><div><div class="eyebrow">STATION</div><h3>${title(system)}</h3></div></div><div class="system-actions">${actionsFor(system).map(actionMarkup).join('')}</div>${modMarkup(system)}${extra}`;
      blocks.appendChild(block);
    });
    grid.appendChild(wrap);
    bindStationEvents(wrap);
  }
  function bindStationEvents(wrap){
    wrap.querySelectorAll('[data-add-mod]').forEach(btn=>btn.addEventListener('click',()=>{const sel=wrap.querySelector(`[data-mod-select="${btn.dataset.addMod}"]`);if(!sel?.value)return;ship.mods=ship.mods||[];if(!ship.mods.includes(sel.value))ship.mods.push(sel.value);saveQuiet();buildStations();}));
    wrap.querySelectorAll('[data-remove-mod]').forEach(btn=>btn.addEventListener('click',()=>{ship.mods=(ship.mods||[]).filter(m=>m!==btn.dataset.removeMod);saveQuiet();buildStations();}));
    wrap.querySelector('#station-add-weapon')?.addEventListener('click',()=>{const v=wrap.querySelector('#station-weapon-select')?.value;if(!v)return;ship.weapons=ship.weapons||[];ship.weapons.push({type:v,qty:1});saveQuiet();buildStations();});
    wrap.querySelectorAll('[data-remove-weapon]').forEach(btn=>btn.addEventListener('click',()=>{ship.weapons.splice(Number(btn.dataset.removeWeapon),1);saveQuiet();buildStations();}));
    wrap.querySelector('#station-add-power')?.addEventListener('click',()=>{const v=wrap.querySelector('#station-power-select')?.value;if(!v)return;ship.extraPowerPlants=ship.extraPowerPlants||[];ship.extraPowerPlants.push(v);saveQuiet();buildStations();});
    wrap.querySelectorAll('[data-remove-power]').forEach(btn=>btn.addEventListener('click',()=>{ship.extraPowerPlants.splice(Number(btn.dataset.removePower),1);saveQuiet();buildStations();}));
  }
  function buildLog(){
    const grid=document.querySelector('.grid'); if(!grid||typeof ship==='undefined')return;
    document.querySelectorAll('.grid .card').forEach(c=>{if(/ship.?s log/i.test(c.querySelector('h2')?.textContent||''))c.remove();});
    const log=document.createElement('section');log.id='ships-log';log.className='card wide';
    const value=String(ship.notes||'');
    log.innerHTML=`<div class="card-title"><h2>Ship's Log</h2><span class="pill log-count">${value.length.toLocaleString()} / 100,000</span></div><textarea maxlength="100000" placeholder="Record the ship's journey..."></textarea><div class="log-count">${value.length.toLocaleString()} / 100,000</div>`;
    const ta=log.querySelector('textarea');ta.value=value;ta.addEventListener('input',()=>{ship.notes=ta.value;log.querySelector('.log-count:last-child').textContent=`${ta.value.length.toLocaleString()} / 100,000`;saveQuiet();});
    grid.appendChild(log);
  }
  function formatTiers(){
    document.querySelectorAll('.action-card p').forEach(p=>{if(p.dataset.tier)return;const lines=p.textContent.split('\n').map(x=>x.trim()).filter(Boolean);if(lines.length<2||!lines.some(x=>/^(≤ 11|12–16|≥ 17)/.test(x)))return;p.dataset.tier='1';const w=document.createElement('div');w.className='tier-results';lines.forEach(line=>{const d=document.createElement('div');const m=line.match(/^(≤ 11|12–16|≥ 17)\s*[—:-]?\s*(.*)$/);d.innerHTML=m?`<b>${m[1]}</b> ${m[2]}`:line;w.appendChild(d);});p.replaceWith(w);});
  }
  function ensure(){
    if(typeof ship==='undefined'||!ship||!document.querySelector('.grid'))return;
    removeCards();
    buildStations();
    buildLog();
    formatTiers();
    updateMoney();
  }
  window.setTimeout(ensure,100);
  window.setInterval(()=>{if(document.getElementById('app')?.children.length&&!document.getElementById('system-stations'))ensure();},700);
})();
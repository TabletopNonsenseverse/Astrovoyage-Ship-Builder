(() => {
  if (window.__astroStableUI) return;
  window.__astroStableUI = true;

  const MODS_BY_SYSTEM = {
    Helm: ['Targeting','Stabiliser','EfficientHelm'],
    Engineering: ['Rerouter','Booster','Efficiency'],
    LSC: ['MidCommunicator','LongCommunicator','UltraCommunicator']
  };

  const ACTIONS = {
    Helm: [
      ['Evasive Manoeuvre','2d10 + Pilot (I)','Self','1 CP',['≤ 11 — one penalty to all attacks against you (SNT).','12–16 — double penalty to all attacks against you (SNT).','≥ 17 — double penalty to all attacks against you and no system damage (SNT).']],
      ['Targeting System','2d10 + Pilot (A)','Ranged Far → one ship','1 CP',['≤ 11 — no effect.','12–16 — bonus to all your attacks (SNT).','≥ 17 — bonus to all your attacks and choose the system when you impose system damage (SNT).'],'Targeting'],
      ['Hold Steady','Passive','Self','Passive',['Pilot checks to steady the ship gain a bonus. Difficult landing and docking checks also gain a bonus.'],'Stabiliser'],
      ['Aid Boarding','2d10 + Pilot (E)','Self','1 CP',['≤ 11 — no effect.','12–16 — bonus to all boarding actions (SNT).','≥ 17 — double bonus to all boarding actions (SNT).'],'Stabiliser'],
      ['Efficient Flying','2d10 + Pilot (I)','Self','1 CP',['≤ 11 — failure; consume 25 additional power for the next parsec.','12–16 — consume 20 fewer power for the next parsec.','≥ 17 — consume 40 fewer power for the next parsec.'],'EfficientHelm']
    ],
    Weapons: [],
    Engineering: [
      ['Go! Go! Go!','2d10 + Engineering (E)','Self','1 CP',['≤ 11 — go to FTL in 5 rounds.','12–16 — go to FTL in 4 rounds.','≥ 17 — go to FTL in 3 rounds.','Effect: spend 100 units of power.']],
      ['Reroute Power','2d10 + Electronics (E)','Self','1 CP',['≤ 11 — gain 20 units of power.','12–16 — gain 50 units of power.','≥ 17 — gain 80 units of power.','Effect: deal one system damage to a system of your own ship.'],'Rerouter'],
      ['Boost Shield','2d10 + Engineering (I)','Self','1 CP',['≤ 11 — increase shield damage threshold by 5.','12–16 — increase it by 10.','≥ 17 — increase it by 15.','Effect: spend 20 units of power.'],'Booster'],
      ['Power to the Bridge','2d10 + Engineering (E)','Self','1 CP',['≤ 11 — spend 30 units of power.','12–16 — spend 25 units of power.','≥ 17 — spend 20 units of power.','Effect: gain 1 command point usable immediately or until the end of your next turn.'],'Booster'],
      ['Weapons Boost','2d10 + Engineering (I)','Self','1 CP',['≤ 11 — spend 10 units of power.','12–16 — spend 7 units of power.','≥ 17 — spend 5 units of power.','Effect: add 2d6 damage to your next weapon attack.'],'Booster'],
      ['Go Easy','2d10 + Electronics (E)','Self','1 CP',['≤ 11 — next action uses 25% less power and has a double penalty.','12–16 — next action uses 25% less power and has a penalty.','≥ 17 — next action uses 25% less power.'],'Efficiency'],
      ['Push It Hard','2d10 + Electronics (E)','Self','1 CP',['≤ 11 — next action uses 25% more power and has a bonus.','12–16 — next action uses 25% more power and has a double bonus.','≥ 17 — next action uses 25% more power and is automatically a tier 3 result.'],'Efficiency'],
      ['Travel','Space Travel','1 parsec','1 day',['Spend 100 units of power and travel 1 parsec in 1 day.','Non-FTL travel uses 10 units of power per day.']]
    ],
    LSC: [
      ['Deploy Drones','2d10 + Electronics (I)','Ranged 1 parsec → one ship','1 CP',['≤ 11 — failure; enemy alerted.','12–16 — success; enemy alerted.','≥ 17 — success.','Effect: drones attach to the enemy airlock.']],
      ['Hack Enemy Airlock','2d10 + Computers (E)','Ranged 1 parsec → one ship','1 CP',['Prerequisite: successful Deploy Drones.','≤ 11 — failure; enemy alerted.','12–16 — failure.','≥ 17 — success.']],
      ['Deploy Boarding Party','Reflex (A)','Ranged 1 parsec → one ship','1 CP',['Prerequisite: successful Hack Enemy Airlock and all boarding members at LSC.','≤ 11 — 15 physical damage to each member.','12–16 — 10 physical damage.','≥ 17 — 7 physical damage.']],
      ['Detach Drones','2d10 + Electronics (I)','Self','1 CP',['Prerequisite: successful detection sequence.','≤ 11 — failure; enemy Hack Enemy Airlock gets a bonus.','12–16 — failure.','≥ 17 — detach the enemy drones.']],
      ['Secure Airlock','2d10 + Computers (E)','Self','1 CP',['Prerequisite: success in Detach Drones.','≤ 11 — your LSC takes system damage.','12–16 — failure.','≥ 17 — relock the airlock.']]
    ],
    Cargo: [['Cargo Hold','Passive','Self','Persistent',['Each time the cargo hold takes system damage, 10 tonnes of cargo is destroyed.']]],
    Power: [['Power Plant','Passive','Self','Persistent',['Each time the Power Plant takes system damage, it loses 25 units of power.']]]
  };

  const title = s => s === 'LSC' ? 'Life Support & Communications' : s === 'Power' ? 'Power Plant' : s;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const saveQuiet = () => { try { if (typeof save === 'function') save(false); } catch (_) {} };
  const powerCapacity = () => {
    const primary = (typeof ship !== 'undefined' && ship?.powerPlant) || 'Basic';
    const primaryCap = Number(POWER?.[primary]?.capacity || 0);
    const extraCap = ((typeof ship !== 'undefined' && ship?.extraPowerPlants) || []).reduce((n,p) => n + Number(POWER?.[p]?.capacity || 0), 0);
    return primaryCap + extraCap;
  };

  const style = document.createElement('style');
  style.textContent = `
    #system-stations,#ships-log{grid-column:1/-1;width:100%;box-sizing:border-box}
    .system-blocks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .system-block{border:1px solid rgba(130,150,190,.28);border-radius:14px;padding:16px;background:rgba(12,18,34,.72)}
    .system-block h3{margin:4px 0}.system-actions{display:grid;gap:9px;margin-top:12px}
    .action-card{padding:11px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid rgba(130,150,190,.18)}
    .action-head{display:flex;justify-content:space-between;gap:12px}.action-head span,.action-meta{font-size:.72rem;color:#91a1bd}.action-meta{display:flex;gap:12px;margin-top:4px}
    .action-results{display:grid;gap:5px;margin:8px 0 0}.action-results div{line-height:1.45}.action-results b{display:inline-block;min-width:58px}
    .mod-area,.station-add-area{margin-top:14px;padding-top:12px;border-top:1px solid rgba(130,150,190,.18)}
    .mod-add,.weapon-add,.power-add{display:flex;gap:8px;margin-top:8px}.mod-add select,.weapon-add select,.power-add select{flex:1;min-width:0;background:#101827;color:#e8edf7;border:1px solid #394966;border-radius:8px;padding:9px 10px;color-scheme:dark}
    .installed-mods{display:grid;gap:7px;margin-top:9px}.installed-mod{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;font-size:.82rem}.installed-mod span{color:#91a1bd}
    .station-item{padding:10px;border:1px solid rgba(130,150,190,.18);border-radius:9px;background:rgba(255,255,255,.025);margin-top:9px}.station-item-head{display:flex;justify-content:space-between;gap:10px;align-items:center}
    #ships-log textarea{display:block;width:100%;min-height:520px;box-sizing:border-box;resize:vertical;background:#0c1422;color:#e8edf7;border:1px solid #394966;border-radius:10px;padding:16px;font:inherit;line-height:1.55}
    #ships-log .log-count{margin-top:7px;font-size:.75rem;color:#91a1bd;text-align:right}
    .money-input{width:100%;box-sizing:border-box;background:#0c1422;color:#e8edf7;border:1px solid #394966;border-radius:7px;padding:6px}
    .power-edit{width:70px;box-sizing:border-box;background:#0c1422;color:#e8edf7;border:1px solid #394966;border-radius:7px;padding:5px 7px}
    .power-slash{margin:0 5px;color:#91a1bd}
    @media(max-width:800px){.system-blocks{grid-template-columns:1fr}.mod-add,.weapon-add,.power-add{flex-direction:column}.installed-mod{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function removeLegacy(){
    const bad=['core systems','cargo & crew','system damage','installed modifications','weapons','combat control','notes'];
    document.querySelectorAll('.grid .card').forEach(card=>{const h=card.querySelector('h2')?.textContent.trim().toLowerCase();if(bad.includes(h))card.remove();});
    document.querySelectorAll('button').forEach(b=>{const t=b.textContent.trim().toLowerCase();if(t==='combat'||t==='combat mode'||t==='exit combat')b.remove();});
    document.getElementById('astro-combat')?.remove();
  }

  function updateLiveStatus(){
    const card=[...document.querySelectorAll('.grid .card')].find(c=>c.querySelector('h2')?.textContent.trim()==='Live Status');
    if(!card||typeof ship==='undefined')return;
    const old=[...card.querySelectorAll('.stat')].find(s=>s.querySelector('small')?.textContent.trim()==='PASSENGERS');
    if(old){old.innerHTML='<small>MONEY</small><input class="money-input" type="number" min="0" step="1">';const input=old.querySelector('input');input.value=Number(ship.money||0);input.addEventListener('input',()=>{ship.money=Math.max(0,Number(input.value)||0);saveQuiet();});}
    const stat=[...card.querySelectorAll('.stat')].find(s=>s.querySelector('small')?.textContent.trim()==='POWER');
    if(!stat)return;
    const cap=powerCapacity();
    let current=stat.querySelector('[data-power-current]');
    let max=stat.querySelector('[data-power-max]');
    if(!current||!max){
      stat.innerHTML=`<small>POWER</small><div class="power-line"><input data-power-current class="power-edit" type="number" min="0" step="1"><span class="power-slash">/</span><input data-power-max class="power-edit" type="number" min="0" step="1"><button class="mini" onclick="spendPower(10)">−10</button></div>`;
      current=stat.querySelector('[data-power-current]');max=stat.querySelector('[data-power-max]');
      current.addEventListener('input',()=>{ship.currentPower=Math.max(0,Number(current.value)||0);saveQuiet();});
      max.addEventListener('input',()=>{ship.powerCapacity=Math.max(0,Number(max.value)||0);ship.currentPower=Math.min(Math.max(0,Number(ship.currentPower)||0),ship.powerCapacity);current.value=ship.currentPower;saveQuiet();});
    }
    current.value=String(Math.max(0,Number(ship.currentPower)||0));
    max.value=String(Number.isFinite(Number(ship.powerCapacity)) ? Number(ship.powerCapacity) : cap);
  }

  function actionMarkup(a){
    const results=a[4].map(line=>{const m=line.match(/^(≤ 11|12–16|≥ 17)\s*[—:-]?\s*(.*)$/);return `<div>${m?`<b>${m[1]}</b> ${esc(m[2])}`:esc(line)}</div>`;}).join('');
    return `<article class="action-card"><div class="action-head"><strong>${esc(a[0])}</strong><span>${esc(a[1])}</span></div><div class="action-meta"><span>${esc(a[2])}</span><span>${esc(a[3])}</span></div><div class="action-results">${results}</div></article>`;
  }

  function actionsFor(system){
    if(system==='Weapons')return (ship.weapons||[]).map((w,i)=>{const x=WEAPONS[w.type]||{};return [`Fire ${x.name||w.type} #${i+1}`,'2d10 + Gunner (A)',`Ranged ${x.range||''} → one ship`,'1 CP / shot',[`PPS: ${x.pps??'—'}`,`CPS: ${x.cps??'—'}`,`Damage: ${x.damage||'—'}`]];});
    return (ACTIONS[system]||[]).filter(a=>!a[5]||(ship.mods||[]).includes(a[5]));
  }

  function modMarkup(system){
    const mods=MODS_BY_SYSTEM[system]||[];if(!mods.length)return '';
    const available=mods.filter(m=>!(ship.mods||[]).includes(m));
    const installed=mods.filter(m=>(ship.mods||[]).includes(m));
    return `<div class="mod-area"><div class="mod-add"><select data-mod-select="${system}"><option value="">Add modification…</option>${available.map(m=>`<option value="${m}">${esc(MODS[m]?.name||m)}</option>`).join('')}</select><button class="btn primary" type="button" data-add-mod="${system}">Add</button></div>${installed.length?`<div class="installed-mods">${installed.map(m=>`<div class="installed-mod"><strong>${esc(MODS[m]?.name||m)}</strong><span>${esc(MODS[m]?.description||'')}</span><button class="btn danger" type="button" data-remove-mod="${m}">Remove</button></div>`).join('')}</div>`:''}</div>`;
  }

  function weaponMarkup(){
    const rows=(ship.weapons||[]).map((w,i)=>{const x=WEAPONS[w.type]||{};return `<div class="station-item"><div class="station-item-head"><strong>${esc(x.name||w.type)} × ${w.qty||1}</strong><button class="btn danger" type="button" data-remove-weapon="${i}">Remove</button></div><small class="muted">${esc(x.range||'')} · PPS ${x.pps??'—'} · CPS ${x.cps??'—'}</small></div>`;}).join('');
    return `${rows||'<div class="station-item"><span class="muted">No weapons installed.</span></div>'}<div class="weapon-add"><select id="station-weapon-select"><option value="">Add weapon…</option>${Object.entries(WEAPONS).map(([k,v])=>`<option value="${k}">${esc(v.name)} · ${esc(v.cost)}</option>`).join('')}</select><button class="btn primary" id="station-add-weapon" type="button">Add weapon</button></div>`;
  }

  function powerMarkup(){
    const extras=(ship.extraPowerPlants||[]).map((p,i)=>`<div class="station-item"><div class="station-item-head"><strong>${esc(p)} Power Plant</strong><button class="btn danger" type="button" data-remove-power="${i}">Remove</button></div><small class="muted">${POWER[p]?.capacity||0} capacity · ${POWER[p]?.size||0} tonnes</small></div>`).join('');
    const primary=ship.powerPlant||'Basic';
    return `<div class="station-item"><div class="station-item-head"><strong>Primary: ${esc(primary)} Power Plant</strong><span>${POWER[primary]?.capacity||0} capacity</span></div></div>${extras}<div class="power-add"><select id="station-power-select"><option value="">Add power plant…</option>${Object.entries(POWER).map(([k,v])=>`<option value="${k}">${esc(k)} · ${esc(v.cost)} · ${v.capacity} capacity</option>`).join('')}</select><button class="btn primary" id="station-add-power" type="button">Add power plant</button></div>`;
  }

  function buildStations(){
    if(typeof ship==='undefined'||!ship)return;
    const grid=document.querySelector('.grid');if(!grid)return;
    document.getElementById('system-stations')?.remove();
    const wrap=document.createElement('section');wrap.id='system-stations';wrap.className='card wide';
    wrap.innerHTML='<div class="card-title"><div><div class="eyebrow">SHIP OPERATIONS</div><h2>System Stations</h2></div></div><div class="system-blocks"></div>';
    const blocks=wrap.querySelector('.system-blocks');
    Object.keys(ACTIONS).forEach(system=>{
      const block=document.createElement('article');block.className='system-block';
      const extra=system==='Weapons'?weaponMarkup():system==='Power'?powerMarkup():'';
      block.innerHTML=`<div class="system-block-head"><div><div class="eyebrow">STATION</div><h3>${title(system)}</h3></div></div><div class="system-actions">${actionsFor(system).map(actionMarkup).join('')}</div>${modMarkup(system)}${extra}`;
      blocks.appendChild(block);
    });
    grid.appendChild(wrap);
    bindStationEvents(wrap);
  }

  function bindStationEvents(wrap){
    wrap.querySelectorAll('[data-add-mod]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();const sel=wrap.querySelector(`[data-mod-select="${btn.dataset.addMod}"]`);if(!sel?.value)return;ship.mods=ship.mods||[];if(!ship.mods.includes(sel.value))ship.mods.push(sel.value);saveQuiet();buildStations();}));
    wrap.querySelectorAll('[data-remove-mod]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();ship.mods=(ship.mods||[]).filter(m=>m!==btn.dataset.removeMod);saveQuiet();buildStations();}));
    wrap.querySelector('#station-add-weapon')?.addEventListener('click',e=>{e.preventDefault();const v=wrap.querySelector('#station-weapon-select')?.value;if(!v)return;ship.weapons=ship.weapons||[];ship.weapons.push({type:v,qty:1});saveQuiet();buildStations();});
    wrap.querySelectorAll('[data-remove-weapon]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();ship.weapons.splice(Number(btn.dataset.removeWeapon),1);saveQuiet();buildStations();}));
    wrap.querySelector('#station-add-power')?.addEventListener('click',e=>{e.preventDefault();const v=wrap.querySelector('#station-power-select')?.value;if(!v)return;const y=window.scrollY;const oldCap=Number.isFinite(Number(ship.powerCapacity))?Number(ship.powerCapacity):powerCapacity();ship.extraPowerPlants=ship.extraPowerPlants||[];ship.extraPowerPlants.push(v);ship.powerCapacity=oldCap+Number(POWER?.[v]?.capacity||0);saveQuiet();buildStations();updateLiveStatus();requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'auto'}));});
    wrap.querySelectorAll('[data-remove-power]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();const y=window.scrollY;const i=Number(btn.dataset.removePower);const p=ship.extraPowerPlants?.[i];if(!p)return;const oldCap=Number.isFinite(Number(ship.powerCapacity))?Number(ship.powerCapacity):powerCapacity();ship.extraPowerPlants.splice(i,1);ship.powerCapacity=Math.max(0,oldCap-Number(POWER?.[p]?.capacity||0));ship.currentPower=Math.min(Math.max(0,Number(ship.currentPower)||0),ship.powerCapacity);saveQuiet();buildStations();updateLiveStatus();requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'auto'}));}));
  }

  function buildLog(){
    if(typeof ship==='undefined')return;
    const grid=document.querySelector('.grid');if(!grid)return;
    document.querySelectorAll('#ships-log,.ships-log').forEach(x=>x.remove());
    const log=document.createElement('section');log.id='ships-log';log.className='card wide';
    const value=String(ship.notes||'');
    log.innerHTML=`<div class="card-title"><h2>Ship's Log</h2><span class="pill log-count">${value.length.toLocaleString()} / 100,000</span></div><textarea maxlength="100000" placeholder="Record the ship's journey…"></textarea><div class="log-count">${value.length.toLocaleString()} / 100,000</div>`;
    const ta=log.querySelector('textarea');ta.value=value;ta.addEventListener('input',()=>{ship.notes=ta.value;log.querySelector('.log-count:last-child').textContent=`${ta.value.length.toLocaleString()} / 100,000`;saveQuiet();});
    grid.appendChild(log);
  }

  let enhancing=false;
  function ensure(){
    if(enhancing||typeof ship==='undefined'||!ship||!document.querySelector('.grid'))return;
    enhancing=true;
    const y=window.scrollY;
    removeLegacy();
    updateLiveStatus();
    buildStations();
    buildLog();
    enhancing=false;
    requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'auto'}));
  }

  const root=document.getElementById('app');
  if(root){
    const observer=new MutationObserver(()=>{if(!enhancing)requestAnimationFrame(ensure);});
    observer.observe(root,{childList: true,subtree:false});
  }
  setTimeout(ensure,0);
})();

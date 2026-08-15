(() => {
  // These features intentionally observe #app rather than trying to wrap render().
  // app.js keeps its state/functions in the classic-script global lexical scope, not window.render.
  const SYSTEM_MODS = {
    Helm: ['Targeting','Stabiliser','EfficientHelm'],
    Engineering: ['Rerouter','Booster','Efficiency'],
    LSC: ['MidCommunicator','LongCommunicator','UltraCommunicator']
  };
  const ACTIONS = {
    Helm: [
      ['Evasive Manoeuvre','2d10 + Pilot (I)','Self','SNT','≤11: one attack penalty; 12–16: double penalty; ≥17: double penalty and no system damage.'],
      ['Targeting System','2d10 + Pilot (A)','Ranged Far → one ship','SNT','If enemy hull is bigger, gain a bonus. Tier 2 gives attack bonus; tier 3 also lets you choose the damaged system.','Targeting'],
      ['Hold Steady','—','Self','Passive','Pilot checks to steady the ship, and difficult landing/docking checks, gain a bonus.','Stabiliser'],
      ['Aid Boarding','2d10 + Pilot (E)','Self','SNT','12–16: bonus to boarding actions; ≥17: double bonus.','Stabiliser'],
      ['Efficient Flying','2d10 + Pilot (I)','Self','Next parsec','≤11: +25 power for next parsec; 12–16: 20 fewer; ≥17: 40 fewer.','EfficientHelm']
    ],
    Weapons: [['Fire Weapon','2d10 + Gunner (A)','Weapon range → one ship','1 CP / shot','Each shot is one action and uses the weapon PPS/CPS. Resolve its damage tiers.']],
    Engineering: [
      ['Go! Go! Go!','2d10 + Engineering (E)','Self','3–5 rounds','Spend 100 power. ≤11: FTL in 5 rounds; 12–16: 4; ≥17: 3.'],
      ['Reroute Power','2d10 + Electronics (E)','Self','Immediate','Gain 20/50/80 power, then deal 1 system damage to a system you choose.','Rerouter'],
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
    Cargo: [['Cargo Hold Damage','—','Self','Persistent','Each Cargo Hold system damage destroys 10 tonnes of cargo; defender chooses cargo type.']],
    Power: [['Power Plant Damage','—','Self','Persistent','Each Power Plant system damage removes 25 units of power.']]
  };
  const title = s => s === 'LSC' ? 'Life Support & Communications' : s === 'Power' ? 'Power Plant' : s;
  const css = `
    #system-stations,#ships-log{grid-column:1/-1} .system-blocks-title{display:flex;justify-content:space-between;align-items:end;margin-bottom:14px}.system-blocks-title h2{margin:4px 0 0}.system-blocks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.system-block{border:1px solid rgba(130,150,190,.28);border-radius:14px;padding:16px;background:rgba(12,18,34,.72)}.system-block-head,.action-head,.card-title{display:flex;justify-content:space-between;gap:12px;align-items:center}.system-block h3{margin:4px 0}.system-actions{display:grid;gap:9px;margin-top:12px}.action-card{padding:11px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid rgba(130,150,190,.18)}.action-card.action-locked{opacity:.52}.action-card p{margin:7px 0 0;font-size:.85rem}.action-head strong{font-size:.95rem}.action-head span,.action-meta,.requires{font-size:.72rem;color:#91a1bd}.action-meta{display:flex;gap:12px;margin-top:4px}.mod-area{margin-top:14px;padding-top:12px;border-top:1px solid rgba(130,150,190,.18)}.mod-add{display:flex;gap:8px}.mod-add select{flex:1}.installed-mods{display:grid;gap:7px;margin-top:9px}.installed-mod{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;font-size:.82rem}.installed-mod span{color:#91a1bd}.ships-log textarea{width:100%;min-height:420px;resize:vertical;box-sizing:border-box}.ships-log .log-count{font-variant-numeric:tabular-nums}
    #combat-screen{position:fixed;inset:0;z-index:99999;overflow:auto;background:#080d19;color:#e8edf7;padding:24px;box-sizing:border-box}.combat-shell{max-width:1300px;margin:0 auto}.combat-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.combat-top h1{margin:4px 0}.combat-stats{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;position:sticky;top:0;background:#080d19;padding:10px 0;z-index:2}.combat-stats>div{border:1px solid #2b3852;border-radius:10px;padding:11px;background:#101827}.combat-stats small{display:block;color:#8e9cb5;font-size:.67rem}.combat-stats b{display:block;font-size:1.2rem;margin-top:5px}.combat-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}.combat-system{border:1px solid #2b3852;border-radius:12px;padding:14px;background:#0e1625}.combat-system h2{margin:0}.combat-system header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.combat-action{display:block;width:100%;text-align:left;margin:7px 0;padding:11px;border:1px solid #2b3852;border-radius:9px;background:#151f31;color:#e8edf7;cursor:pointer}.combat-action strong,.combat-action span,.combat-action small{display:block}.combat-action span,.combat-action small{color:#9aa8c0;margin-top:4px;font-size:.75rem}.combat-action:hover{border-color:#7187ad}
    @media(max-width:800px){.system-blocks,.combat-grid{grid-template-columns:1fr}.combat-stats{grid-template-columns:repeat(3,1fr)}.mod-add{flex-direction:column}.installed-mod{grid-template-columns:1fr}.installed-mod .btn{justify-self:start}}
  `;
  if (!document.getElementById('enhancement-runtime-css')) { const s=document.createElement('style'); s.id='enhancement-runtime-css'; s.textContent=css; document.head.appendChild(s); }

  let rendering=false, lastAppHTML='';
  const saveIt = () => { try { if (typeof save === 'function') save(false); } catch(e) { console.error(e); } };

  function addStations() {
    if (typeof ship === 'undefined' || !ship) return;
    const grid=document.querySelector('.grid'); if(!grid) return;
    document.getElementById('system-stations')?.remove();
    const wrap=document.createElement('section'); wrap.id='system-stations'; wrap.className='card wide';
    wrap.innerHTML='<div class="system-blocks-title"><div><div class="eyebrow">SHIP OPERATIONS</div><h2>System Stations</h2></div><span class="muted">Actions and modifications by station</span></div><div class="system-blocks"></div>';
    const blocks=wrap.querySelector('.system-blocks');
    Object.keys(ACTIONS).forEach(system=>{
      const block=document.createElement('article'); block.className='system-block';
      const actions=ACTIONS[system].map(a=>{const available=!a[5]||ship.mods.includes(a[5]);return `<article class="action-card ${available?'':'action-locked'}"><div class="action-head"><strong>${a[0]}</strong><span>${a[1]}</span></div><div class="action-meta"><span>Range: ${a[2]}</span><span>${a[3]}</span></div><p>${a[4]}</p>${a[5]&&!available?`<small class="requires">Requires ${MODS[a[5]]?.description||a[5]}</small>`:''}</article>`}).join('');
      const mods=SYSTEM_MODS[system]||[];
      const modUI=mods.length?`<div class="mod-area"><div class="mod-add"><select data-mod-select="${system}"><option value="">Add modification...</option>${mods.map(m=>`<option value="${m}">${m} · ${MODS[m].cost} · ${MODS[m].size} t</option>`).join('')}</select><button class="btn primary" data-add-mod="${system}">Add modification</button></div><div class="installed-mods">${ship.mods.filter(m=>mods.includes(m)).map(m=>`<div class="installed-mod"><strong>${m}</strong><span>${MODS[m].description}</span><button class="btn danger" data-remove-mod="${m}">Remove</button></div>`).join('')||'<span class="muted">No modifications installed.</span>'}</div></div>`:'';
      block.innerHTML=`<div class="system-block-head"><div><div class="eyebrow">STATION</div><h3>${title(system)}</h3></div><span>${ship.systemDamage?.[system]||0} damage</span></div><div class="system-actions">${actions}</div>${modUI}`;
      blocks.appendChild(block);
    });
    grid.appendChild(wrap);
    wrap.querySelectorAll('[data-add-mod]').forEach(btn=>btn.onclick=()=>{const sel=wrap.querySelector(`[data-mod-select="${btn.dataset.addMod}"]`);if(!sel.value)return;if(!ship.mods.includes(sel.value)){ship.mods.push(sel.value);saveIt();triggerRefresh();}});
    wrap.querySelectorAll('[data-remove-mod]').forEach(btn=>btn.onclick=()=>{ship.mods=ship.mods.filter(m=>m!==btn.dataset.removeMod);saveIt();triggerRefresh();});
  }

  function addShipsLog(){
    if(typeof ship==='undefined'||!ship)return; const grid=document.querySelector('.grid');if(!grid)return;
    [...grid.querySelectorAll('.card')].forEach(card=>{const h=card.querySelector('h2');if(h&&/^notes$/i.test(h.textContent.trim()))card.remove();});
    document.getElementById('ships-log')?.remove();
    const card=document.createElement('section');card.id='ships-log';card.className='card wide ships-log';const value=ship.notes||'';
    card.innerHTML=`<div class="card-title"><h2>Ship's Log</h2><span class="pill log-count">${value.length.toLocaleString()} / 100,000</span></div><textarea maxlength="100000" placeholder="Record the ship's journey, discoveries, repairs, debts, rumours, cargo, encounters, or anything else worth remembering..."></textarea>`;
    grid.appendChild(card);const ta=card.querySelector('textarea');ta.value=value;ta.oninput=()=>{ship.notes=ta.value;card.querySelector('.log-count').textContent=`${ta.value.length.toLocaleString()} / 100,000`;saveIt();};
  }

  function addCombatButton(){const actions=document.querySelector('.topbar .actions');if(!actions||actions.querySelector('[data-combat-button]'))return;const b=document.createElement('button');b.className='btn primary';b.dataset.combatButton='1';b.textContent='Combat';b.onclick=showCombat;actions.insertBefore(b,actions.firstChild);}
  function showCombat(){if(typeof ship==='undefined'||!ship)return;let s=document.getElementById('combat-screen');if(!s){s=document.createElement('div');s.id='combat-screen';document.body.appendChild(s);}const c=calc();s.innerHTML=`<div class="combat-shell"><div class="combat-top"><div><div class="eyebrow">ASTROVOYAGE · COMBAT CONTROL</div><h1>${esc(ship.name)}</h1></div><button class="btn" id="exit-combat">Exit Combat</button></div><div class="combat-stats"><div><small>COMMAND POINTS</small><b>${c.b.cp}</b></div><div><small>HULL HP</small><b>${ship.currentHull} / ${c.h.hp}</b></div><div><small>SHIELD HP</small><b>${ship.currentShield} / ${c.shieldMax}</b></div><div><small>THRESHOLD</small><b>${c.sh.physical}P / ${c.sh.energy}E</b></div><div><small>POWER</small><b>${ship.currentPower} / ${c.p.capacity}</b></div><div><small>ROUND</small><b>${ship.combatRound}</b></div></div><div class="combat-grid">${Object.keys(ACTIONS).map(system=>`<section class="combat-system"><header><h2>${title(system)}</h2><span>${ship.systemDamage?.[system]||0} damage</span></header>${ACTIONS[system].map(a=>`<button class="combat-action"><strong>${a[0]}</strong><span>${a[1]} · ${a[2]} · ${a[3]}</span><small>${a[4]}</small></button>`).join('')}</section>`).join('')}</div></div>`;s.style.display='block';s.querySelector('#exit-combat').onclick=()=>s.style.display='none';}

  function triggerRefresh(){if(rendering)return;rendering=true;try{if(typeof render==='function')render();}catch(e){console.error(e);}finally{rendering=false;setTimeout(enhance,0);}}
  function enhance(){if(rendering)return;const app=document.getElementById('app');if(!app||!app.children.length)return;addCombatButton();addStations();addShipsLog();}
  const observer=new MutationObserver(()=>{clearTimeout(window.__astroEnhanceTimer);window.__astroEnhanceTimer=setTimeout(enhance,0);});
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  setTimeout(enhance,50);
})();

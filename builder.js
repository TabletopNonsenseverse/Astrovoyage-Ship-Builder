(() => {
  const escB = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let step = 0;
  const pages = ['Identity','Hull & Core','Weapons','Modifications'];

  const css = `
    #ship-builder{position:fixed;inset:0;z-index:100001;background:#080d19;color:#e8edf7;overflow:auto;padding:28px;box-sizing:border-box}
    #ship-builder .builder-wrap{max-width:1100px;margin:auto}.builder-title{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:20px}.builder-title h1{margin:4px 0}.builder-tabs{display:flex;gap:7px;overflow:auto;margin-bottom:16px}.builder-tabs button{background:#101827;color:#aebbd0;border:1px solid #2b3852;border-radius:8px;padding:9px 14px;white-space:nowrap}.builder-tabs button.active{color:#fff;border-color:#7c93bd;background:#18243a}.builder-card{background:#101827;border:1px solid #2b3852;border-radius:14px;padding:20px}.builder-card h2{margin-top:0}.builder-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.builder-field{display:grid;gap:6px}.builder-field.full{grid-column:1/-1}.builder-field input,.builder-field select{background:#0c1422;color:#e8edf7;border:1px solid #394966;border-radius:8px;padding:10px;color-scheme:dark}.builder-list{display:grid;gap:9px}.builder-row{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:11px;border:1px solid #2b3852;border-radius:9px;background:#0c1422}.builder-row select,.builder-row input{background:#0c1422;color:#e8edf7;border:1px solid #394966;border-radius:7px;padding:8px;color-scheme:dark}.builder-nav{display:flex;justify-content:space-between;margin-top:18px}.builder-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}.builder-summary div{border:1px solid #2b3852;border-radius:9px;padding:10px;background:#0c1422}.builder-summary small{display:block;color:#91a1bd}.builder-summary b{display:block;margin-top:4px}.builder-hint{color:#91a1bd;font-size:.88rem}.builder-choices{display:grid;gap:9px}.builder-choice{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:12px;border:1px solid #2b3852;border-radius:9px;background:#0c1422}.builder-choice strong{display:block}.builder-choice small{color:#91a1bd}.builder-checks{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.builder-check{display:flex;gap:8px;align-items:center;padding:8px;background:#0c1422;border:1px solid #2b3852;border-radius:8px}.builder-check input{accent-color:#8197bd}@media(max-width:800px){.builder-grid,.builder-summary,.builder-checks{grid-template-columns:1fr}.builder-row{grid-template-columns:1fr}.builder-title{align-items:flex-start;flex-direction:column}}
  `;
  if (!document.getElementById('builder-css')) { const s=document.createElement('style'); s.id='builder-css'; s.textContent=css; document.head.appendChild(s); }

  function totalPowerCapacity(){
    return POWER[ship.powerPlant].capacity + (ship.extraPowerPlants || []).reduce((n,p) => n + (POWER[p]?.capacity || 0), 0);
  }
  function renderBuilder(){
    let root=document.getElementById('ship-builder');
    if(!root){root=document.createElement('div');root.id='ship-builder';document.body.appendChild(root);}
    const c=calc();
    let body='';
    if(step===0){
      body=`<div class="builder-card"><h2>Ship Identity</h2><p class="builder-hint">Set the basic identity of the ship before building its systems.</p><div class="builder-grid"><label class="builder-field"><span>Ship name</span><input id="b-name" value="${escB(ship.name)}"></label><label class="builder-field"><span>Captain / crew lead</span><input id="b-captain" value="${escB(ship.captain)}"></label></div></div>`;
    } else if(step===1){
      body=`<div class="builder-card"><h2>Hull & Core Systems</h2><div class="builder-grid">
        <label class="builder-field"><span>Hull</span><select id="b-hull">${Object.entries(HULLS).map(([k,v])=>`<option value="${k}" ${k===ship.hull?'selected':''}>${k} Class · ${v.cost} · ${v.hp} HP · ${v.size}</option>`).join('')}</select></label>
        <label class="builder-field"><span>Bridge</span><select id="b-bridge">${Object.entries(BRIDGES).map(([k,v])=>`<option value="${k}" ${k===ship.bridge?'selected':''}>${k} Bridge · ${v.cost} · ${v.cp} CP</option>`).join('')}</select></label>
        <label class="builder-field"><span>Primary power plant</span><select id="b-power">${Object.entries(POWER).map(([k,v])=>`<option value="${k}" ${k===ship.powerPlant?'selected':''}>${k} · ${v.cost} · ${v.capacity} power · ${v.size} t</option>`).join('')}</select></label>
        <label class="builder-field"><span>Shield</span><select id="b-shield">${Object.entries(SHIELDS).map(([k,v])=>`<option value="${k}" ${k===ship.shield?'selected':''}>${k} · ${v.cost} · ${v.hp} base HP · ${v.physical}P / ${v.energy}E</option>`).join('')}</select></label>
      </div><h3>Additional Power Plants</h3><div class="builder-list">${(ship.extraPowerPlants||[]).map((p,i)=>`<div class="builder-row"><strong>${p} Power Plant</strong><span>${POWER[p].capacity} power · ${POWER[p].size} t</span><button class="btn danger" data-rm-power="${i}">Remove</button></div>`).join('')||'<p class="builder-hint">No additional power plants.</p>'}</div><div class="builder-row"><select id="b-extra-power"><option value="">Add another power plant...</option>${Object.entries(POWER).map(([k,v])=>`<option value="${k}">${k} · ${v.cost} · ${v.capacity} power</option>`).join('')}</select><button class="btn primary" id="b-add-power">Add</button><span></span></div><div class="builder-summary"><div><small>Hull HP</small><b>${HULLS[ship.hull].hp}</b></div><div><small>Shield HP</small><b>${SHIELDS[ship.shield].hp * HULLS[ship.hull].shieldFactor}</b></div><div><small>Command Points</small><b>${BRIDGES[ship.bridge].cp}</b></div><div><small>Total Power</small><b>${totalPowerCapacity()}</b></div></div></div>`;
    } else if(step===2){
      body=`<div class="builder-card"><h2>Weapons</h2><p class="builder-hint">Ships do not come armed by default. Add as many weapons as the campaign allows.</p><div class="builder-list">${(ship.weapons||[]).map((w,i)=>`<div class="builder-row"><select data-wtype="${i}">${Object.entries(WEAPONS).map(([k,v])=>`<option value="${k}" ${k===w.type?'selected':''}>${v.name} · ${v.cost}</option>`).join('')}</select><input type="number" min="1" data-wqty="${i}" value="${w.qty||1}"><button class="btn danger" data-rm-weapon="${i}">Remove</button></div>`).join('')||'<p class="builder-hint">No weapons installed.</p>'}</div><div class="builder-row"><select id="b-weapon"><option value="">Add weapon...</option>${Object.entries(WEAPONS).map(([k,v])=>`<option value="${k}">${v.name} · ${v.cost}</option>`).join('')}</select><button class="btn primary" id="b-add-weapon">Add</button><span></span></div></div>`;
    } else {
      body=`<div class="builder-card"><h2>Modifications</h2><p class="builder-hint">Choose modifications here. The final ship sheet will only show the resulting systems and available actions.</p><div class="builder-checks">${Object.entries(MODS).map(([k,v])=>`<label class="builder-check"><input type="checkbox" data-mod="${k}" ${ship.mods.includes(k)?'checked':''}><span><strong>${k}</strong><br><small>${v.system} · ${v.cost} · ${v.size} t · ${v.installation} days</small></span></label>`).join('')}</div></div>`;
    }
    root.innerHTML=`<div class="builder-wrap"><div class="builder-title"><div><div class="eyebrow">ASTROVOYAGE · SHIP BUILDER</div><h1>Configure ${escB(ship.name)}</h1></div><button class="btn" id="b-cancel">Cancel</button></div><div class="builder-tabs">${pages.map((p,i)=>`<button class="${i===step?'active':''}" data-step="${i}">${i+1}. ${p}</button>`).join('')}</div>${body}<div class="builder-nav"><button class="btn" id="b-prev" ${step===0?'disabled':''}>Previous</button><button class="btn primary" id="b-next">${step===pages.length-1?'Finish & Open Ship':'Next'}</button></div></div>`;
    root.querySelector('#b-cancel').onclick=()=>root.remove();
    root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{commitStep();step=Number(b.dataset.step);renderBuilder();});
    root.querySelector('#b-prev').onclick=()=>{commitStep();step=Math.max(0,step-1);renderBuilder();};
    root.querySelector('#b-next').onclick=()=>{commitStep();if(step===pages.length-1){ship.currentHull=calc().h.hp;ship.currentShield=calc().shieldMax;ship.currentPower=totalPowerCapacity();ship.cargoUsed=Math.min(ship.cargoUsed||0,calc().cargo);save(true);root.remove();}else{step++;renderBuilder();}};
    root.querySelector('#b-add-power')?.addEventListener('click',()=>{const v=root.querySelector('#b-extra-power').value;if(!v)return;ship.extraPowerPlants=ship.extraPowerPlants||[];ship.extraPowerPlants.push(v);renderBuilder();});
    root.querySelectorAll('[data-rm-power]').forEach(b=>b.onclick=()=>{ship.extraPowerPlants.splice(Number(b.dataset.rmPower),1);renderBuilder();});
    root.querySelector('#b-add-weapon')?.addEventListener('click',()=>{const v=root.querySelector('#b-weapon').value;if(!v)return;ship.weapons.push({type:v,qty:1});renderBuilder();});
    root.querySelectorAll('[data-rm-weapon]').forEach(b=>b.onclick=()=>{ship.weapons.splice(Number(b.dataset.rmWeapon),1);renderBuilder();});
    root.querySelectorAll('[data-wtype]').forEach(s=>s.onchange=()=>{ship.weapons[Number(s.dataset.wtype)].type=s.value;renderBuilder();});
    root.querySelectorAll('[data-wqty]').forEach(i=>i.onchange=()=>{ship.weapons[Number(i.dataset.wqty)].qty=Math.max(1,Number(i.value)||1);});
    root.querySelectorAll('[data-mod]').forEach(c=>c.onchange=()=>{const m=c.dataset.mod;if(c.checked&&!ship.mods.includes(m))ship.mods.push(m);if(!c.checked)ship.mods=ship.mods.filter(x=>x!==m);renderBuilder();});
  }

  function commitStep(){
    const root=document.getElementById('ship-builder');if(!root)return;
    if(step===0){ship.name=root.querySelector('#b-name')?.value||ship.name;ship.captain=root.querySelector('#b-captain')?.value||'';}
    if(step===1){ship.hull=root.querySelector('#b-hull')?.value||ship.hull;ship.bridge=root.querySelector('#b-bridge')?.value||ship.bridge;ship.powerPlant=root.querySelector('#b-power')?.value||ship.powerPlant;ship.shield=root.querySelector('#b-shield')?.value||ship.shield;}
  }
  function openBuilder(){step=0;renderBuilder();}

  function wire(){
    const actions=document.querySelector('.topbar .actions');if(!actions)return;
    const oldNew=[...actions.querySelectorAll('button')].find(b=>b.textContent.trim()==='New ship');
    if(oldNew){oldNew.textContent='Edit ship';oldNew.onclick=openBuilder;}
    if(!actions.querySelector('[data-new-builder]')){const b=document.createElement('button');b.className='btn';b.dataset.newBuilder='1';b.textContent='New ship';b.onclick=()=>{if(!confirm('Create a new ship?'))return;token=crypto.randomUUID();history.pushState({},'',location.pathname+'?ship='+token);ship=fresh();ship.extraPowerPlants=[];openBuilder();};actions.insertBefore(b,actions.firstChild);}
  }
  const observer=new MutationObserver(()=>setTimeout(wire,0));observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});setTimeout(wire,100);
  if(new URLSearchParams(location.search).get('mode')==='builder') setTimeout(openBuilder,150);
})();

const HULLS={
  Faber:{cost:'1MCr',hp:75,size:'Small',shieldFactor:2,cargo:75,crew:4,staterooms:2},
  Esterbrook:{cost:'2MCr',hp:100,size:'Small',shieldFactor:2,cargo:100,crew:6,staterooms:4},
  Sheaffer:{cost:'3MCr',hp:150,size:'Small',shieldFactor:2,cargo:150,crew:8,staterooms:8},
  Parker:{cost:'5MCr',hp:225,size:'Medium',shieldFactor:1,cargo:225,crew:10,staterooms:12},
  Montblanc:{cost:'6.5MCr',hp:250,size:'Medium',shieldFactor:1,cargo:250,crew:16,staterooms:18},
  Pilot:{cost:'8MCr',hp:280,size:'Medium',shieldFactor:1,cargo:280,crew:16,staterooms:20},
  Cross:{cost:'20MCr',hp:400,size:'Large',shieldFactor:.5,cargo:400,crew:20,staterooms:36},
  Waterman:{cost:'25MCr',hp:500,size:'Large',shieldFactor:.5,cargo:500,crew:30,staterooms:50}
};
const BRIDGES={
  Basic:{cost:'1MCr',cp:4,installation:10},Expert:{cost:'2MCr',cp:5,installation:15},
  Companion:{cost:'3.5MCr',cp:6,installation:20},Master:{cost:'5MCr',cp:7,installation:25},Immortal:{cost:'7.5MCr',cp:8,installation:30}
};
const POWER={Basic:{cost:'100KCr',capacity:100,size:10,installation:1},Generator:{cost:'1MCr',capacity:100,size:15,installation:10}};
const SHIELDS={
  Buckler:{cost:'10KCr',hp:50,physical:20,energy:10,installation:1},Rondache:{cost:'10KCr',hp:50,physical:14,energy:14,installation:1},
  Targe:{cost:'20KCr',hp:60,physical:20,energy:20,installation:1},Lantern:{cost:'20KCr',hp:60,physical:14,energy:22,installation:1},
  Rotella:{cost:'20KCr',hp:50,physical:22,energy:14,installation:1},Hungry:{cost:'35KCr',hp:90,physical:14,energy:14,installation:1},
  Adarga:{cost:'35KCr',hp:60,physical:22,energy:22,installation:1},Escutcheon:{cost:'50KCr',hp:100,physical:14,energy:14,installation:1},
  Clipeus:{cost:'50KCr',hp:75,physical:22,energy:22,installation:1},Kite:{cost:'75KCr',hp:150,physical:22,energy:22,installation:1},
  Scutum:{cost:'120KCr',hp:200,physical:28,energy:28,installation:1},Pavise:{cost:'250KCr',hp:300,physical:33,energy:33,installation:1}
};
const MODS={
  Rerouter:{system:'Engineering',cost:'100KCr',size:5,installation:10,description:'Reroute Power: 2d10 + Electronics (E); gain 20/50/80 power and deal 1 system damage to a chosen system.'},
  Booster:{system:'Engineering',cost:'250KCr',size:10,installation:20,description:'Boost Shield, Power to the Bridge, and Weapons Boost actions.'},
  Efficiency:{system:'Engineering',cost:'100KCr',size:5,installation:10,description:'Go Easy or Push It Hard to alter the next action’s power use and result.'},
  Targeting:{system:'Helm',cost:'100KCr',size:5,installation:10,description:'Targeting System: ranged Far; bonus against larger hulls; can choose the system damaged on a tier 3 result.'},
  Stabiliser:{system:'Helm',cost:'50KCr',size:10,installation:5,description:'Hold Steady grants a bonus to pilot checks to steady, land or dock. Aid Boarding grants boarding bonuses.'},
  EfficientHelm:{system:'Helm',cost:'50KCr',size:5,installation:5,description:'Efficient Flying: 2d10 + Pilot (I); alter power spent on the next parsec.'},
  MidCommunicator:{system:'LSC',cost:'10KCr',size:5,installation:1,description:'Communication range increases to 3 parsecs.'},
  LongCommunicator:{system:'LSC',cost:'25KCr',size:10,installation:1,description:'Communication range increases to 5 parsecs.'},
  UltraCommunicator:{system:'LSC',cost:'50KCr',size:15,installation:1,description:'Communication range increases to 8 parsecs.'}
};
const WEAPONS={
  Laser:{name:'Laser Cannon',cost:'10KCr',pps:10,cps:'—',range:'Mid',damage:'10 / 14 / 20',reset:0},
  Plasma:{name:'Plasma Cannon',cost:'25KCr',pps:25,cps:'—',range:'Near',damage:'22 / 28 / 35',reset:0},
  Torpedo:{name:'Torpedo Bay',cost:'15KCr',pps:'—',cps:'5KCr',range:'Mid',damage:'30 / 36 / 45',reset:0},
  Plume:{name:'Energy Plume',cost:'30KCr',pps:40,cps:'—',range:'Near',damage:'28 / 33 / 40',reset:0},
  Missile:{name:'Missile Silo',cost:'35KCr',pps:'—',cps:'1KCr',range:'Far',damage:'10 / 14 / 20',reset:0}
};
const SYSTEMS=['Cargo','Helm','Weapons','Engineering','LSC','Power'];
const $=s=>document.querySelector(s);const id=()=>crypto.randomUUID();
const params=new URLSearchParams(location.search);let token=params.get('ship');let supa=null;let ship=null;let timer=null;
function fresh(){return {name:'Unnamed Vessel',captain:'',hull:'Faber',bridge:'Basic',powerPlant:'Basic',shield:'Buckler',currentHull:75,currentShield:100,currentPower:100,cargoUsed:0,systemDamage:{Cargo:0,Helm:0,Weapons:0,Engineering:0,LSC:0,Power:0},mods:[],weapons:[],notes:'',combatRound:1,ftlCountdown:null,updatedAt:null}}
function numMoney(v){if(typeof v==='number')return v;return Number(String(v).replace('MCr','000000').replace('KCr','000').replace(/,/g,''))||0}
function fmtMoney(v){return Math.round(v).toLocaleString()+' Cr'}
function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function options(obj,selected){return Object.keys(obj).map(k=>`<option ${k===selected?'selected':''} value="${esc(k)}">${esc(obj[k].name||k)}</option>`).join('')}
function calc(){
  const h=HULLS[ship.hull], sh=SHIELDS[ship.shield], b=BRIDGES[ship.bridge], p=POWER[ship.powerPlant];
  const shieldMax=sh.hp*h.shieldFactor;
  const used=ship.mods.reduce((a,m)=>a+(MODS[m]?.size||0),0);
  const cargo=Math.max(0,h.cargo-used);
  const weaponCost=ship.weapons.reduce((a,w)=>a+(numMoney(WEAPONS[w.type]?.cost||0)*(Number(w.qty)||1)),0);
  const modCost=ship.mods.reduce((a,m)=>a+numMoney(MODS[m]?.cost||0),0);
  const total=numMoney(h.cost)+numMoney(b.cost)+numMoney(p.cost)+numMoney(sh.cost)+modCost+weaponCost;
  const comm=ship.mods.includes('UltraCommunicator')?8:ship.mods.includes('LongCommunicator')?5:ship.mods.includes('MidCommunicator')?3:1;
  return {h,sh,b,p,shieldMax,cargo,used,total,maintenance:Math.round(numMoney(h.cost)*.01),passengers:h.staterooms*2,comm};
}
function normalise(){const c=calc();ship.currentHull=Math.min(Math.max(0,Number(ship.currentHull)||0),c.h.hp);ship.currentShield=Math.min(Math.max(0,Number(ship.currentShield)||0),c.shieldMax);ship.currentPower=Math.min(Math.max(0,Number(ship.currentPower)||0),c.p.capacity);ship.cargoUsed=Math.min(Math.max(0,Number(ship.cargoUsed)||0),c.cargo);SYSTEMS.forEach(s=>ship.systemDamage[s]=Math.max(0,Number(ship.systemDamage?.[s])||0));}
function render(){
  const c=calc(),d=ship.systemDamage;
  const weaponRows=ship.weapons.map((w,i)=>{const x=WEAPONS[w.type];return `<div class="weapon-row"><select onchange="weaponType(${i},this.value)">${options(WEAPONS,w.type)}</select><input class="qty" type="number" min="1" value="${w.qty||1}" onchange="weaponQty(${i},this.value)"><span>${x.pps}</span><span>${x.cps}</span><span>${x.range}</span><span>${x.damage}</span><button class="btn danger" onclick="removeWeapon(${i})">Remove</button></div>`}).join('');
  $('#app').innerHTML=`<div class="shell">
  <header class="topbar"><div class="brand"><div class="eyebrow">ASTROVOYAGE · STARSHIP CONTROL</div><h1>${esc(ship.name)}</h1><p>Shared campaign ship sheet · <span class="save">${ship.updatedAt?'Saved '+new Date(ship.updatedAt).toLocaleTimeString():'Unsaved draft'}</span></p></div><div class="actions"><button class="btn" onclick="newShip()">New ship</button><button class="btn" onclick="copyLink()">Copy share link</button><button class="btn primary" onclick="save(true)">Save now</button></div></header>
  ${!supa?'<div class="notice">Local mode: Supabase is not connected. Shared persistence is unavailable until Vercel supplies the Supabase configuration.</div>':''}
  <section class="hero"><div><span class="badge">${c.h.size} HULL</span><strong>${esc(ship.hull)} Class</strong><span class="muted"> · ${c.h.hp} max HP · shield factor ${c.h.shieldFactor}</span></div><div class="hero-actions"><span>Comms ${c.comm} pc</span><span>${c.passengers} passenger berths</span></div></section>
  <main class="grid">
    <section class="card wide"><div class="card-title"><h2>Ship Identity</h2><span class="pill">Campaign Record</span></div><div class="fields"><div class="field"><label>Ship name</label><input value="${esc(ship.name)}" onchange="setv('name',this.value)"></div><div class="field"><label>Captain / crew lead</label><input value="${esc(ship.captain)}" onchange="setv('captain',this.value)"></div></div></section>
    <section class="card"><div class="card-title"><h2>Ship Value</h2></div><div class="total">${fmtMoney(c.total)}</div><p class="muted">Hull maintenance: ${fmtMoney(c.maintenance)} / month</p><p class="muted">Hull repair: 100,000 Cr per HP · 1 day per HP</p></section>
    <section class="card full"><div class="card-title"><h2>Live Status</h2><span class="pill">Round ${ship.combatRound}</span></div><div class="statgrid"><div class="stat"><small>HULL</small><strong>${ship.currentHull}<i> / ${c.h.hp}</i></strong><button class="mini" onclick="damageHull(1)">−1</button></div><div class="stat"><small>SHIELD</small><strong>${ship.currentShield}<i> / ${c.shieldMax}</i></strong><button class="mini" onclick="damageShield(1)">−1</button></div><div class="stat"><small>POWER</small><strong>${ship.currentPower}<i> / ${c.p.capacity}</i></strong><button class="mini" onclick="spendPower(10)">−10</button></div><div class="stat"><small>CARGO</small><strong>${ship.cargoUsed}<i> / ${c.cargo} t</i></strong><button class="mini" onclick="cargoAdd(1)">+1t</button></div><div class="stat"><small>COMMAND</small><strong>${c.b.cp}</strong><i> CP / turn</i></div><div class="stat"><small>PASSENGERS</small><strong>${c.passengers}</strong><i> berths</i></div></div></section>
    <section class="card"><div class="card-title"><h2>Core Systems</h2></div><div class="field"><label>Hull</label><select onchange="setCore('hull',this.value)">${options(HULLS,ship.hull)}</select></div><div class="component"><span>${c.h.size} · ${c.h.hp} HP · ${c.h.cargo} t cargo · ${c.h.crew} crew quarters</span><span>${c.h.cost}</span></div><div class="field"><label>Bridge</label><select onchange="setv('bridge',this.value)">${options(BRIDGES,ship.bridge)}</select></div><div class="component"><span>${c.b.cp} command points · ${c.b.installation} days install</span><span>${c.b.cost}</span></div><div class="field"><label>Power plant</label><select onchange="setv('powerPlant',this.value)">${options(POWER,ship.powerPlant)}</select></div><div class="component"><span>${c.p.capacity} capacity · ${c.p.size} t · ${c.p.installation} days</span><span>${c.p.cost}</span></div><div class="field"><label>Shield</label><select onchange="setv('shield',this.value)">${options(SHIELDS,ship.shield)}</select></div><div class="component"><span>${c.sh.hp} base HP × ${c.h.shieldFactor} = <b>${c.shieldMax}</b> effective · ${c.sh.physical}P / ${c.sh.energy}E</span><span>${c.sh.cost}</span></div></section>
    <section class="card"><div class="card-title"><h2>Cargo & Crew</h2></div><div class="meter"><span style="width:${Math.min(100,c.cargo?ship.cargoUsed/c.cargo*100:0)}%"></span></div><div class="split"><b>${ship.cargoUsed} t used</b><span>${Math.max(0,c.cargo-ship.cargoUsed)} t free</span></div><p class="muted">Hull cargo: ${c.h.cargo} t · modifications occupy ${c.used} t</p><p class="muted">Crew quarters: ${c.h.crew} · Staterooms: ${c.h.staterooms} · Passenger capacity: ${c.passengers}</p><div class="fields"><div class="field"><label>Set cargo used</label><input type="number" min="0" max="${c.cargo}" value="${ship.cargoUsed}" onchange="setn('cargoUsed',this.value)"></div><div class="field"><label>Power recharge</label><button class="btn widebtn" onclick="setn('currentPower',${c.p.capacity})">Fill to capacity</button></div></div></section>
    <section class="card full"><div class="card-title"><h2>System Damage</h2><span class="muted">Hull damage always triggers system damage</span></div><div class="damage">${SYSTEMS.map(k=>`<div class="damage-box"><button class="btn ${d[k]?'active':''}" onclick="damage('${k}')"><span>${k}</span><b>${d[k]}</b></button><div class="damage-actions"><button onclick="clearDamage('${k}')">−</button><button onclick="damage('${k}')">+</button></div></div>`).join('')}</div><p class="muted">Weapons: each damage adds a penalty to Weapons checks. Power Plant: each damage removes 25 power. Cargo: each damage destroys 10 tonnes of cargo.</p></section>
    <section class="card wide"><div class="card-title"><h2>Installed Modifications</h2><span>${ship.mods.length} installed · ${c.used} t</span></div>${Object.entries(MODS).map(([k,v])=>`<div class="component"><span><b>${esc(k)}</b><span class="meta"> ${v.system} · ${v.size} t · ${v.installation} days</span><br><small class="muted">${esc(v.description)}</small></span><button class="btn ${ship.mods.includes(k)?'danger':''}" onclick="toggleMod('${k}')">${ship.mods.includes(k)?'Remove':'Install'} · ${v.cost}</button></div>`).join('')}</section>
    <section class="card"><div class="card-title"><h2>Travel</h2></div><div class="fields"><div class="field"><label>FTL parsecs</label><input id="travelPc" type="number" min="0" value="1"></div><div class="field"><label>Non-FTL days</label><input id="travelDays" type="number" min="0" value="1"></div></div><div class="component"><span>FTL power</span><b id="ftlCost">100</b></div><div class="component"><span>Non-FTL power</span><b id="nonFtlCost">10</b></div><button class="btn widebtn" onclick="calcTravel()">Calculate travel cost</button><p class="muted">Each parsec of FTL travel uses 100 power and takes 1 day. Non-FTL travel uses 10 power per day.</p></section>
    <section class="card full"><div class="card-title"><h2>Weapons</h2><button class="btn" onclick="addWeapon()">+ Add weapon</button></div><div class="weapon-header weapon-row"><span>Weapon</span><span>Qty</span><span>PPS</span><span>CPS</span><span>Range</span><span>Damage</span><span></span></div>${weaponRows||'<p class="muted">No weapons installed. Starships do not come armed by default.</p>'}<p class="muted">Each shot costs 1 Command Point. PPS is power per shot; CPS is ammunition cost per shot. Damage shown is tier 1 / tier 2 / tier 3.</p></section>
    <section class="card"><div class="card-title"><h2>Combat Control</h2></div><div class="fields"><div class="field"><label>Round</label><input type="number" min="1" value="${ship.combatRound}" onchange="setn('combatRound',this.value)"></div><div class="field"><label>FTL countdown</label><input type="number" min="0" value="${ship.ftlCountdown??''}" placeholder="Not active" onchange="setCountdown(this.value)"></div></div><div class="actions"><button class="btn" onclick="nextRound()">Next round</button><button class="btn" onclick="startFTL()">Start Go! Go! Go!</button></div><p class="muted">Use the combat rules for the Engineering check and set the countdown to 5 / 4 / 3 rounds as appropriate.</p></section>
    <section class="card"><div class="card-title"><h2>Notes</h2></div><textarea class="notes" onchange="setv('notes',this.value)" placeholder="Campaign notes, repairs, debts, rumours…">${esc(ship.notes)}</textarea></section>
  </main></div>`;
}
function setv(k,v){ship[k]=v;normalise();render();debouncedSave()}
function setn(k,v){ship[k]=Number(v);normalise();render();debouncedSave()}
function setCore(k,v){ship[k]=v;normalise();render();debouncedSave()}
function damageHull(n){ship.currentHull=Math.max(0,ship.currentHull-n);ship.systemDamage[SYSTEMS[Math.floor(Math.random()*6)]]++;render();debouncedSave()}
function damageShield(n){ship.currentShield=Math.max(0,ship.currentShield-n);render();debouncedSave()}
function spendPower(n){ship.currentPower=Math.max(0,ship.currentPower-n);render();debouncedSave()}
function cargoAdd(n){ship.cargoUsed=Math.min(calc().cargo,ship.cargoUsed+n);render();debouncedSave()}
function damage(k){ship.systemDamage[k]++;if(k==='Power')ship.currentPower=Math.max(0,ship.currentPower-25);if(k==='Cargo')ship.cargoUsed=Math.max(0,ship.cargoUsed-10);normalise();render();debouncedSave()}
function clearDamage(k){ship.systemDamage[k]=Math.max(0,ship.systemDamage[k]-1);render();debouncedSave()}
function toggleMod(k){ship.mods=ship.mods.includes(k)?ship.mods.filter(x=>x!==k):[...ship.mods,k];normalise();render();debouncedSave()}
function addWeapon(){ship.weapons.push({type:'Laser',qty:1});render();debouncedSave()}
function removeWeapon(i){ship.weapons.splice(i,1);render();debouncedSave()}
function weaponType(i,v){ship.weapons[i].type=v;render();debouncedSave()}
function weaponQty(i,v){ship.weapons[i].qty=Math.max(1,Number(v)||1);render();debouncedSave()}
function calcTravel(){const pc=Math.max(0,Number($('#travelPc').value)||0),days=Math.max(0,Number($('#travelDays').value)||0);$('#ftlCost').textContent=pc*100;$('#nonFtlCost').textContent=days*10}
function setCountdown(v){ship.ftlCountdown=v===''?null:Math.max(0,Number(v)||0);render();debouncedSave()}
function nextRound(){ship.combatRound=Math.max(1,ship.combatRound+1);if(ship.ftlCountdown!==null&&ship.ftlCountdown>0)ship.ftlCountdown--;render();debouncedSave()}
function startFTL(){ship.ftlCountdown=3;render();debouncedSave()}
function debouncedSave(){clearTimeout(timer);timer=setTimeout(()=>save(false),500)}
async function save(manual){normalise();ship.updatedAt=new Date().toISOString();if(supa&&token){const {error}=await supa.rpc('save_ship',{p_token:token,p_data:ship});if(error){console.error(error);if(manual)alert('Save failed. Check the browser console for details.')}}else localStorage.setItem('astro-ship-'+(token||'local'),JSON.stringify(ship));if(manual)render()}
async function load(){if(!token){token=id();history.replaceState({},'',location.pathname+'?ship='+token)}if(supa){const {data,error}=await supa.rpc('get_ship',{p_token:token});if(!error&&data)ship=data;else{ship=fresh();await save(false)}}else{try{ship=JSON.parse(localStorage.getItem('astro-ship-'+token))||fresh()}catch{ship=fresh()}}normalise();render()}
function newShip(){if(!confirm('Create a new ship? This page will become a new shared ship.'))return;token=id();history.pushState({},'',location.pathname+'?ship='+token);ship=fresh();save(true)}
function copyLink(){navigator.clipboard.writeText(location.href).then(()=>alert('Share link copied.')).catch(()=>prompt('Copy this share link:',location.href))}
const SUPABASE_URL=window.SUPABASE_URL||'';const SUPABASE_ANON_KEY=window.SUPABASE_ANON_KEY||'';if(SUPABASE_URL&&SUPABASE_ANON_KEY)supa=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);load();
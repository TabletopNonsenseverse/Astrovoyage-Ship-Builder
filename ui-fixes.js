(() => {
  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const saveNow = () => { try { if (typeof save === 'function') save(false); } catch(e) {} };

  const css = `
    .ship-log-card{grid-column:1/-1!important;width:100%!important}.ship-log-card textarea{display:block;width:100%;min-height:420px;resize:vertical;box-sizing:border-box;background:#0b1220;color:#e8edf7;border:1px solid #394966;border-radius:10px;padding:16px;font:inherit;line-height:1.6}.ship-log-card .log-footer{display:flex;justify-content:space-between;margin-top:7px;font-size:.75rem;color:#91a1bd}
    .money-field{display:flex;align-items:center;gap:8px}.money-field input{width:100%;min-width:0;box-sizing:border-box;background:#0b1220!important;color:#e8edf7!important;border:1px solid #394966!important;border-radius:7px;padding:7px 8px}
    .station-control select,.weapon-add select,.power-add select{background:#101827!important;color:#e8edf7!important;color-scheme:dark!important;border:1px solid #394966!important}
  `;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function removeDuplicateCombatButtons(){
    const buttons=[...document.querySelectorAll('button')].filter(b=>/^\s*(combat|exit combat)\s*$/i.test(b.textContent));
    const functional=buttons.find(b=>b.hasAttribute('data-combat-toggle')) || buttons.find(b=>b.onclick);
    buttons.forEach(b=>{if(b!==functional)b.remove();});
  }

  function moveAndFixLog(){
    const grid=document.querySelector('.grid'); if(!grid)return;
    let logs=[...document.querySelectorAll('#ships-log-card')];
    let card=logs[0]; logs.slice(1).forEach(x=>x.remove());
    if(!card){
      card=document.createElement('section');card.id='ships-log-card';card.className='card ship-log-card';
      card.innerHTML=`<div class="card-title"><h2>Ship's Log</h2><span class="pill">Up to 100,000 characters</span></div><textarea maxlength="100000" placeholder="Record the ship's journey, events, repairs, discoveries, orders and anything else the crew needs to remember."></textarea><div class="log-footer"><span>0 / 100,000</span><span>Autosaved</span></div>`;
    } else {
      card.classList.add('ship-log-card');
      const oldTitle=card.querySelector('h2'); if(oldTitle)oldTitle.textContent="Ship's Log";
      const ta=card.querySelector('textarea'); if(ta){ta.maxLength=100000;ta.style.width='100%';ta.style.minHeight='420px';}
    }
    const travel=[...grid.querySelectorAll('.card')].find(x=>/Travel/i.test(x.textContent) && x!==card);
    if(travel) travel.insertAdjacentElement('afterend',card); else grid.appendChild(card);
    const ta=card.querySelector('textarea'); if(!ta)return;
    if(typeof ship!=='undefined' && ship){ta.value=ship.shipLog ?? ship.notes ?? '';}
    let footer=card.querySelector('.log-footer');
    if(!footer){footer=document.createElement('div');footer.className='log-footer';footer.innerHTML='<span></span><span>Autosaved</span>';card.appendChild(footer);}
    const count=footer.querySelector('span'); const update=()=>{if(count)count.textContent=`${ta.value.length.toLocaleString()} / 100,000`;}; update();
    if(!ta.dataset.bound){ta.dataset.bound='1';ta.addEventListener('input',()=>{if(typeof ship!=='undefined'&&ship){ship.shipLog=ta.value;ship.notes=ta.value;saveNow();}update();});}
  }

  function fixMoney(){
    const card=[...document.querySelectorAll('.grid .card')].find(x=>x.querySelector('h2')?.textContent.trim()==='Live Status');
    if(!card||typeof ship==='undefined')return;
    const labels=[...card.querySelectorAll('.stat')]; const money=labels.find(s=>s.querySelector('small')?.textContent.trim()==='MONEY');
    if(!money)return;
    const current=Number(ship.commonLoot ?? ship.money ?? 0);
    money.innerHTML=`<small>MONEY</small><div class="money-field"><input id="common-loot" type="number" min="0" step="1" value="${current}"><span>Cr common loot</span></div>`;
    const input=money.querySelector('input');input.oninput=()=>{ship.commonLoot=Number(input.value)||0;ship.money=ship.commonLoot;saveNow();};
  }

  function addTravel(){
    const stations=document.getElementById('system-stations');if(!stations)return;
    const eng=[...stations.querySelectorAll('.system-block')].find(x=>x.querySelector('h3')?.textContent.trim()==='Engineering');if(!eng)return;
    const actions=eng.querySelector('.system-actions');if(!actions||actions.querySelector('[data-travel-action]'))return;
    const card=document.createElement('article');card.className='action-card';card.dataset.travelAction='1';card.innerHTML='<div class="action-head"><strong>Travel</strong><span>Engineering</span></div><div class="action-meta"><span>FTL / non-FTL</span><span>Travel action</span></div><p>FTL: 100 units of power per parsec and 1 day per parsec. Non-FTL: 10 units of power per day.</p>';
    actions.appendChild(card);
  }

  function bindDropdowns(){
    document.addEventListener('click',e=>{
      const addMod=e.target.closest('[data-add-mod]');
      if(addMod){const root=addMod.closest('#system-stations');const sel=root?.querySelector(`[data-mod-select="${addMod.dataset.addMod}"]`);if(sel?.value&&typeof ship!=='undefined'){ship.mods=ship.mods||[];if(!ship.mods.includes(sel.value)){ship.mods.push(sel.value);saveNow();if(typeof render==='function')render();} }return;}
      const remMod=e.target.closest('[data-remove-mod]');
      if(remMod&&typeof ship!=='undefined'){ship.mods=(ship.mods||[]).filter(x=>x!==remMod.dataset.removeMod);saveNow();if(typeof render==='function')render();return;}
      const addWeapon=e.target.closest('#station-add-weapon');
      if(addWeapon&&typeof ship!=='undefined'){const sel=document.querySelector('#station-weapon-select');if(!sel?.value)return;ship.weapons=ship.weapons||[];const found=ship.weapons.find(w=>w.type===sel.value);if(found)found.qty=(found.qty||1)+1;else ship.weapons.push({type:sel.value,qty:1});saveNow();if(typeof render==='function')render();return;}
      const remWeapon=e.target.closest('[data-remove-weapon]');
      if(remWeapon&&typeof ship!=='undefined'){ship.weapons.splice(Number(remWeapon.dataset.removeWeapon),1);saveNow();if(typeof render==='function')render();return;}
      const addPower=e.target.closest('#station-add-power');
      if(addPower&&typeof ship!=='undefined'){const sel=document.querySelector('#station-power-select');if(!sel?.value)return;ship.extraPowerPlants=ship.extraPowerPlants||[];ship.extraPowerPlants.push(sel.value);saveNow();if(typeof render==='function')render();return;}
      const remPower=e.target.closest('[data-remove-power]');
      if(remPower&&typeof ship!=='undefined'){ship.extraPowerPlants=ship.extraPowerPlants||[];ship.extraPowerPlants.splice(Number(remPower.dataset.removePower),1);saveNow();if(typeof render==='function')render();return;}
    },true);
  }

  function clean(){removeDuplicateCombatButtons();moveAndFixLog();fixMoney();addTravel();}
  bindDropdowns();
  const observer=new MutationObserver(()=>setTimeout(clean,40));observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(clean,200);
})();

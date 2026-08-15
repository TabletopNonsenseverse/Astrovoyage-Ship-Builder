(() => {
  if (window.__astroPowerCapacityFix) return;
  window.__astroPowerCapacityFix = true;

  const capacityOf = name => Number(window.POWER?.[name]?.capacity || 0);
  const totalCapacity = () => {
    if (!window.ship) return 0;
    return capacityOf(window.ship.powerPlant) + (window.ship.extraPowerPlants || []).reduce((n, p) => n + capacityOf(p), 0);
  };

  let previousPlants = null;

  function plants(){
    if (!window.ship) return [];
    return [window.ship.powerPlant, ...(window.ship.extraPowerPlants || [])].filter(Boolean);
  }

  function sync(){
    if (!window.ship) return;
    const currentPlants = plants();
    const key = currentPlants.join('|');
    const cap = totalCapacity();

    if (previousPlants !== null && key !== previousPlants) {
      const old = previousPlants ? previousPlants.split('|').filter(Boolean) : [];
      const oldCounts = old.reduce((m,p)=>(m[p]=(m[p]||0)+1,m),{});
      const newCounts = currentPlants.reduce((m,p)=>(m[p]=(m[p]||0)+1,m),{});
      let delta = 0;
      for (const [p,n] of Object.entries(newCounts)) delta += Math.max(0,n-(oldCounts[p]||0)) * capacityOf(p);
      for (const [p,n] of Object.entries(oldCounts)) delta -= Math.max(0,n-(newCounts[p]||0)) * capacityOf(p);
      if (delta) window.ship.currentPower = Math.max(0, Math.min(cap, (Number(window.ship.currentPower)||0) + delta));
      try { if (typeof window.save === 'function') window.save(false); } catch (_) {}
    }

    previousPlants = key;
    updateUI(cap);
  }

  function updateUI(cap){
    if (!window.ship) return;
    const power = Math.max(0, Math.min(cap, Number(window.ship.currentPower)||0));
    const card = [...document.querySelectorAll('.grid .card')].find(c => c.querySelector('h2')?.textContent.trim() === 'Live Status');
    const stat = card && [...card.querySelectorAll('.stat')].find(s => s.querySelector('small')?.textContent.trim() === 'POWER');
    if (stat) {
      const edit = stat.querySelector('.live-edit');
      if (edit) { edit.max=String(cap); edit.value=String(power); }
      else { const strong=stat.querySelector('strong'); if(strong) strong.innerHTML=`${power}<i> / ${cap}</i>`; }
    }
    const block=[...document.querySelectorAll('.system-block')].find(b=>b.querySelector('h3')?.textContent.trim()==='Power Plant');
    if(block){
      let s=block.querySelector('.power-capacity-summary');
      if(!s){s=document.createElement('div');s.className='power-capacity-summary muted';s.style.marginTop='10px';s.style.fontWeight='600';const add=block.querySelector('.power-add');if(add)block.insertBefore(s,add);else block.appendChild(s);}
      s.textContent=`Total power capacity: ${cap} units · Current power: ${power}`;
    }
  }

  const root=document.getElementById('app');
  if(root)new MutationObserver(()=>requestAnimationFrame(sync)).observe(root,{childList:true,subtree:true});
  setTimeout(sync,300);
})();

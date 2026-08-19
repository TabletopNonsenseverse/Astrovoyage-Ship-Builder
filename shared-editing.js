(() => {
  const MAX_UNDO = 10;
  const undoStack = [];
  const mutationNames = [
    'setv','setn','setCore','damageHull','damageShield','spendPower','cargoAdd',
    'damage','clearDamage','toggleMod','addWeapon','removeWeapon','weaponType',
    'weaponQty','setCountdown','nextRound','startFTL'
  ];

  const clone = value => JSON.parse(JSON.stringify(value));
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);

  function updateUndoUi() {
    const button = document.getElementById('astro-undo-button');
    if (button) {
      button.disabled = undoStack.length === 0;
      button.textContent = `Undo (${undoStack.length}/10)`;
    }
  }

  function pushUndo(snapshot) {
    undoStack.push(snapshot);
    while (undoStack.length > MAX_UNDO) undoStack.shift();
    updateUndoUi();
  }

  function undo() {
    if (!undoStack.length || typeof ship === 'undefined' || !ship) return;
    const previous = undoStack.pop();
    ship = clone(previous);
    if (typeof normalise === 'function') normalise();
    if (typeof render === 'function') render();
    if (typeof debouncedSave === 'function') debouncedSave();
    updateUndoUi();
  }

  function installUndoUi() {
    if (document.getElementById('astro-undo-button')) return;
    const wrap = document.createElement('div');
    wrap.id = 'astro-undo-controls';
    wrap.innerHTML = '<button id="astro-undo-button" type="button" disabled>Undo (0/10)</button>';
    wrap.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:2147483000;background:rgba(11,16,32,.96);border:1px solid #35415b;border-radius:10px;padding:6px;box-shadow:0 8px 24px rgba(0,0,0,.35)';
    const button = wrap.firstElementChild;
    button.style.cssText = 'padding:9px 13px;border-radius:7px;border:1px solid #35415b;background:#182238;color:#fff;font-weight:700;cursor:pointer';
    button.onclick = undo;
    document.body.appendChild(wrap);
    updateUndoUi();
  }

  mutationNames.forEach(name => {
    const original = window[name];
    if (typeof original !== 'function') return;
    window[name] = function(...args) {
      if (typeof ship === 'undefined' || !ship) return original.apply(this,args);
      const before = clone(ship);
      const result = original.apply(this,args);
      if (typeof ship !== 'undefined' && ship && !same(before, ship)) pushUndo(before);
      return result;
    };
  });

  document.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z' || event.shiftKey) return;
    const active = document.activeElement;
    const typing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    if (typing) return;
    event.preventDefault();
    undo();
  });

  installUndoUi();
})();

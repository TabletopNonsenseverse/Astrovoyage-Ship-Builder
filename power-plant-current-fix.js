(() => {
  if (window.__astroPowerPlantCurrentFix) return;
  window.__astroPowerPlantCurrentFix = true;

  const capacityOf = name => Number(window.POWER?.[name]?.capacity || 0);
  const plantList = () => window.ship ? [window.ship.powerPlant, ...(window.ship.extraPowerPlants || [])].filter(Boolean) : [];
  const counts = list => list.reduce((m, p) => { m[p] = (m[p] || 0) + 1; return m; }, {});

  document.addEventListener('click', event => {
    const add = event.target.closest?.('#station-add-power');
    const remove = event.target.closest?.('[data-remove-power]');
    if (!add && !remove) return;
    if (!window.ship) return;

    const before = plantList();
    const beforeCounts = counts(before);
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // The real station handler runs after this listener and mutates ship.extraPowerPlants.
    // Wait until that handler and its render have completed, then apply the power delta.
    setTimeout(() => {
      if (!window.ship) return;
      const after = plantList();
      const afterCounts = counts(after);
      let delta = 0;
      for (const [p, n] of Object.entries(afterCounts)) delta += Math.max(0, n - (beforeCounts[p] || 0)) * capacityOf(p);
      for (const [p, n] of Object.entries(beforeCounts)) delta -= Math.max(0, n - (afterCounts[p] || 0)) * capacityOf(p);

      if (delta) {
        const capacity = after.reduce((sum, p) => sum + capacityOf(p), 0);
        window.ship.currentPower = Math.max(0, Math.min(capacity, (Number(window.ship.currentPower) || 0) + delta));
        try { if (typeof window.save === 'function') window.save(false); } catch (_) {}
      }

      // Rendering the station used to jump the viewport to the top. Restore exactly where the user was.
      requestAnimationFrame(() => window.scrollTo(scrollX, scrollY));
      setTimeout(() => window.scrollTo(scrollX, scrollY), 0);
    }, 0);
  }, false);
})();

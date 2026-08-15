(() => {
  if (window.__astroLayoutFixV2) return;
  window.__astroLayoutFixV2 = true;

  function fixLayout() {
    const app = document.getElementById('app');
    const grid = app?.querySelector('.grid');
    if (!grid) return;

    // The old standalone Travel card must never exist on the finished sheet.
    grid.querySelectorAll('.card').forEach(card => {
      const heading = card.querySelector('h2')?.textContent?.trim().toLowerCase();
      if (heading === 'travel') card.remove();
    });

    const stations = document.getElementById('system-stations');
    if (!stations) return;

    const blocks = [...stations.querySelectorAll('.system-block')];
    const power = blocks.find(b => b.querySelector('h3')?.textContent?.trim() === 'Power Plant');
    const engineering = blocks.find(b => b.querySelector('h3')?.textContent?.trim() === 'Engineering');
    if (!power || !engineering) return;

    const powerActions = power.querySelector('.system-actions');
    const engineeringActions = engineering.querySelector('.system-actions');
    if (!powerActions || !engineeringActions) return;

    // The stable renderer currently creates Travel under Engineering.
    // Move that action into Power Plant every time the station is rebuilt.
    [...engineeringActions.querySelectorAll('.action-card')].forEach(card => {
      if (card.querySelector('.action-head strong')?.textContent?.trim() === 'Travel') {
        powerActions.appendChild(card);
      }
    });

    // Keep exactly one Ship's Log and always put it last.
    const logs = [...grid.querySelectorAll('#ships-log')];
    if (logs.length) {
      const log = logs[logs.length - 1];
      logs.slice(0, -1).forEach(x => x.remove());
      grid.appendChild(log);
    }
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fixLayout();
    });
  }

  const app = document.getElementById('app');
  if (!app) return;
  new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
  schedule();
})();

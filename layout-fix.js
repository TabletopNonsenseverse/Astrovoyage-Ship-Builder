(() => {
  if (window.__astroLayoutFix) return;
  window.__astroLayoutFix = true;

  function moveTravelAndLog() {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    // Remove the old standalone Travel card. Travel belongs in Power Plant.
    grid.querySelectorAll('.card').forEach(card => {
      const heading = card.querySelector('h2')?.textContent?.trim().toLowerCase();
      if (heading === 'travel') card.remove();
    });

    const stations = document.getElementById('system-stations');
    if (!stations) return;

    const blocks = stations.querySelectorAll('.system-block');
    let powerBlock = null;
    let engineeringBlock = null;
    blocks.forEach(block => {
      const name = block.querySelector('h3')?.textContent?.trim();
      if (name === 'Power Plant') powerBlock = block;
      if (name === 'Engineering') engineeringBlock = block;
    });

    // Move the existing Travel action from Engineering into Power Plant.
    if (powerBlock && engineeringBlock) {
      const powerActions = powerBlock.querySelector('.system-actions');
      const engineeringActions = engineeringBlock.querySelector('.system-actions');
      if (powerActions && engineeringActions) {
        [...engineeringActions.querySelectorAll('.action-card')].forEach(card => {
          if (card.querySelector('.action-head strong')?.textContent?.trim() === 'Travel') {
            powerActions.appendChild(card);
          }
        });
      }
    }

    // Ship's Log is always the final block on the page.
    const log = document.getElementById('ships-log');
    if (log) grid.appendChild(log);
  }

  let running = false;
  function apply() {
    if (running) return;
    running = true;
    try { moveTravelAndLog(); } finally { running = false; }
  }

  const root = document.getElementById('app');
  if (root) {
    const observer = new MutationObserver(() => {
      if (!running) requestAnimationFrame(apply);
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  requestAnimationFrame(apply);
})();

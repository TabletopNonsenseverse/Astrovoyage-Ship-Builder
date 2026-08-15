(() => {
  if (window.__astroTravelFix) return;
  window.__astroTravelFix = true;

  function moveTravel() {
    const stations = document.getElementById('system-stations');
    if (!stations) return;

    const blocks = [...stations.querySelectorAll('.system-block')];
    const power = blocks.find(b => b.querySelector('h3')?.textContent?.trim() === 'Power Plant');
    const engineering = blocks.find(b => b.querySelector('h3')?.textContent?.trim() === 'Engineering');
    if (!power || !engineering) return;

    const powerActions = power.querySelector('.system-actions');
    const engineeringActions = engineering.querySelector('.system-actions');
    if (!powerActions || !engineeringActions) return;

    const travel = [...engineeringActions.querySelectorAll('.action-card')].find(card =>
      card.querySelector('.action-head strong')?.textContent?.trim() === 'Travel'
    );
    if (travel) powerActions.appendChild(travel);
  }

  function watchStations() {
    const stations = document.getElementById('system-stations');
    if (!stations || stations.__astroTravelObserved) return;
    stations.__astroTravelObserved = true;
    const observer = new MutationObserver(() => requestAnimationFrame(moveTravel));
    observer.observe(stations, { childList: true, subtree: true });
    requestAnimationFrame(moveTravel);
  }

  const app = document.getElementById('app');
  if (!app) return;
  const observer = new MutationObserver(() => requestAnimationFrame(watchStations));
  observer.observe(app, { childList: true });
  requestAnimationFrame(watchStations);
})();

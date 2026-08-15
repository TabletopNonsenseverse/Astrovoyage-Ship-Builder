(() => {
  function addField(form, page, name, value, x, y, w, h, font, multiline = false) {
    const field = form.createTextField(name);
    field.setText(String(value ?? ''));
    if (multiline) field.enableMultiline();
    field.setFontSize(h <= 18 ? 8 : 10);
    field.addToPage(page, {
      x, y, width: w, height: h,
      borderWidth: 1,
      borderColor: PDFLib.rgb(0.35, 0.40, 0.48),
      backgroundColor: PDFLib.rgb(0.97, 0.98, 1)
    });
    return field;
  }

  function text(page, value, x, y, size, fonts, bold = false) {
    // Standard PDF fonts are intentionally used here so the export has no font-file dependency.
    page.drawText(String(value ?? ''), {
      x, y, size,
      font: bold ? fonts.bold : fonts.regular,
      color: PDFLib.rgb(0.08, 0.11, 0.17)
    });
  }

  async function exportFillablePDF() {
    if (!ship) throw new Error('Ship data is not loaded yet.');
    if (!window.PDFLib) throw new Error('The PDF library did not load. Please refresh the page and try again.');

    const { PDFDocument, StandardFonts } = window.PDFLib;
    const pdf = await PDFDocument.create();
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fonts = { regular, bold };
    const form = pdf.getForm();
    const c = calc();

    let page = pdf.addPage([612, 792]);
    text(page, 'ASTROVOYAGE - STARSHIP SHEET', 40, 750, 18, fonts, true);
    text(page, 'Shared campaign ship record - Fillable PDF export', 40, 730, 9, fonts);

    text(page, 'SHIP IDENTITY', 40, 695, 11, fonts, true);
    addField(form, page, 'ship_name', ship.name, 40, 660, 250, 24, regular);
    addField(form, page, 'captain', ship.captain, 310, 660, 262, 24, regular);
    text(page, 'Ship name', 45, 648, 7, fonts); text(page, 'Captain / crew lead', 315, 648, 7, fonts);

    text(page, 'CORE SYSTEMS', 40, 620, 11, fonts, true);
    const core = [
      ['hull', `Hull: ${ship.hull} Class`], ['bridge', `Bridge: ${ship.bridge}`],
      ['power_plant', `Power Plant: ${ship.powerPlant}`], ['shield', `Shield: ${ship.shield}`]
    ];
    core.forEach((row, i) => {
      const x = i % 2 ? 310 : 40, y = 580 - Math.floor(i / 2) * 52;
      addField(form, page, row[0], row[1], x, y, 262, 28, regular);
    });

    text(page, 'LIVE STATUS', 40, 470, 11, fonts, true);
    const stats = [
      ['current_hull', `Hull HP: ${ship.currentHull} / ${c.h.hp}`],
      ['current_shield', `Shield HP: ${ship.currentShield} / ${c.shieldMax}`],
      ['current_power', `Power: ${ship.currentPower} / ${c.p.capacity}`],
      ['cargo_used', `Cargo: ${ship.cargoUsed} / ${c.cargo} tonnes`],
      ['combat_round', `Combat Round: ${ship.combatRound}`],
      ['ftl_countdown', `FTL Countdown: ${ship.ftlCountdown ?? '-'}`]
    ];
    stats.forEach((row, i) => {
      const x = i % 2 ? 310 : 40, y = 430 - Math.floor(i / 2) * 45;
      addField(form, page, row[0], row[1], x, y, 262, 24, regular);
    });

    text(page, 'SHIP CAPABILITIES', 40, 275, 11, fonts, true);
    const caps = [
      `Command Points: ${c.b.cp}`, `Shield Factor: ${c.h.shieldFactor}`, `Cargo Capacity: ${c.cargo} tonnes`,
      `Crew Quarters: ${c.h.crew}`, `Staterooms: ${c.h.staterooms}`, `Passenger Capacity: ${c.passengers}`,
      `Communication Range: ${c.comm} parsecs`, `Monthly Maintenance: ${fmtMoney(c.maintenance)}`
    ];
    caps.forEach((v, i) => text(page, v, 45 + (i % 2) * 270, 245 - Math.floor(i / 2) * 25, 9, fonts));

    text(page, 'SYSTEM DAMAGE', 40, 135, 11, fonts, true);
    SYSTEMS.forEach((s, i) => addField(form, page, `damage_${s.toLowerCase()}`, `${s}: ${ship.systemDamage[s]}`, 40 + (i % 3) * 180, 98 - Math.floor(i / 3) * 38, 160, 24, regular));
    text(page, 'Exported from the Astrovoyage Ship Builder. Calculated values are printed as reference; editable fields remain fillable.', 40, 25, 7, fonts);

    page = pdf.addPage([612, 792]);
    text(page, 'ASTROVOYAGE - EQUIPMENT & COMBAT', 40, 750, 18, fonts, true);
    text(page, 'Weapons and installed modifications', 40, 730, 9, fonts);

    text(page, 'WEAPONS', 40, 700, 11, fonts, true);
    let y = 665;
    if (!ship.weapons.length) text(page, 'No weapons installed.', 45, y, 9, fonts);
    ship.weapons.forEach((w, i) => {
      const weapon = WEAPONS[w.type];
      addField(form, page, `weapon_${i + 1}`, `${weapon?.name || w.type} x ${w.qty || 1}`, 40, y, 300, 24, regular);
      addField(form, page, `weapon_${i + 1}_notes`, `PPS ${weapon?.pps ?? '-'} | CPS ${weapon?.cps ?? '-'} | ${weapon?.range ?? ''} | ${weapon?.damage ?? ''}`, 350, y, 222, 24, regular);
      y -= 34;
    });

    y = Math.min(y - 10, 560);
    text(page, 'INSTALLED MODIFICATIONS', 40, y, 11, fonts, true); y -= 30;
    if (!ship.mods.length) text(page, 'No modifications installed.', 45, y, 9, fonts);
    ship.mods.forEach((m, i) => {
      const mod = MODS[m];
      addField(form, page, `mod_${i + 1}`, `${m} - ${mod?.system || ''} - ${mod?.size || 0} t`, 40, y, 532, 25, regular);
      y -= 32;
    });

    text(page, 'NOTES', 40, 245, 11, fonts, true);
    addField(form, page, 'campaign_notes', ship.notes || '', 40, 90, 532, 145, regular, true);
    text(page, 'Campaign notes / repairs / debts / rumours', 45, 78, 7, fonts);

    text(page, 'TRAVEL & MAINTENANCE', 40, 55, 10, fonts, true);
    addField(form, page, 'travel_notes', 'FTL: 100 power / parsec, 1 day / parsec. Non-FTL: 10 power / day. Maintenance: 1% of hull cost / month.', 40, 28, 532, 20, regular);

    form.updateFieldAppearances(regular);
    const bytes = await pdf.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (ship.name || 'Astrovoyage-Ship').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'Astrovoyage-Ship';
    a.href = url;
    a.download = `${safeName}-fillable.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  window.exportFillablePDF = exportFillablePDF;

  function installButton() {
    const actions = document.querySelector('.topbar .actions');
    if (!actions || actions.querySelector('[data-pdf-export]')) return;
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.dataset.pdfExport = 'true';
    btn.textContent = 'Export fillable PDF';
    btn.addEventListener('click', () => exportFillablePDF().catch(err => {
      console.error('Astrovoyage PDF export error:', err);
      alert(`PDF export failed: ${err.message || 'Unknown error'}. Please refresh and try again.`);
    }));
    actions.insertBefore(btn, actions.firstChild);
  }

  const observer = new MutationObserver(installButton);
  observer.observe(document.body, { childList: true, subtree: true });
  installButton();
})();

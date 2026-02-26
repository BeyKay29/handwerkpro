/* ============ PLANTAFEL ============ */
let plantafelWeekOffset = 0;

function getWeekDays(offset = 0) {
    const d = new Date(); d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
    const days = [];
    for (let i = 0; i < 5; i++) {
        const dd = new Date(d); dd.setDate(d.getDate() + i);
        days.push({ label: ['Mo', 'Di', 'Mi', 'Do', 'Fr'][i] + ' ' + dd.getDate() + '.' + String(dd.getMonth() + 1).padStart(2, '0'), date: dd.toISOString().split('T')[0] });
    }
    return days;
}

function getKW(offset = 0) {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
}

function renderPlantafel() {
    const days = getWeekDays(plantafelWeekOffset);
    const kw = getKW(plantafelWeekOffset);
    el('plantafel-kw-sub').textContent = `KW ${kw} · ${days[0].label} – ${days[4].label}`;

    const mas = DB.mitarbeiter();
    const zeiten = DB.zeiten();
    const projs = DB.projekte();

    const projColors = {};
    projs.forEach((p, i) => projColors[p.id] = PROJ_COLORS[i % PROJ_COLORS.length]);

    let html = `<div class="pt-wrap"><table style="width:100%;min-width:700px;border-collapse:collapse">
    <thead><tr><th style="padding:.6rem 1.25rem;text-align:left;font-size:.78rem;font-weight:700;color:var(--text-3);background:rgba(0,0,0,.2);border-bottom:1px solid var(--border)">Mitarbeiter</th>`;
    days.forEach(d => {
        const isToday = d.date === today();
        html += `<th style="padding:.6rem;text-align:center;font-size:.78rem;font-weight:700;color:${isToday ? 'var(--brand-light)' : 'var(--text-3)'};background:${isToday ? 'rgba(37,99,235,.08)' : 'rgba(0,0,0,.2)'};border-bottom:1px solid var(--border)">${d.label}</th>`;
    });
    html += `</tr></thead><tbody>`;

    mas.forEach(ma => {
        html += `<tr><td style="padding:.6rem 1.25rem;font-size:.85rem;font-weight:600;border-bottom:1px solid rgba(255,255,255,.04)">
      <div style="display:flex;align-items:center;gap:.5rem">
        <div style="width:8px;height:8px;border-radius:50%;background:${ma.color || '#3b82f6'}"></div>
        ${ma.vorname} ${ma.nachname}
      </div></td>`;
        days.forEach(d => {
            const dayZeiten = zeiten.filter(z => z.maId === ma.id && z.datum === d.date);
            const isToday = d.date === today();
            if (!dayZeiten.length) {
                html += `<td style="padding:.4rem;border-bottom:1px solid rgba(255,255,255,.04);background:${isToday ? 'rgba(37,99,235,.03)' : ''}">
          <div class="pt-slot-inner slot-free" onclick="openZeitEntryForslot('${ma.id}','${d.date}')">+</div></td>`;
            } else if (dayZeiten.length > 1) {
                html += `<td style="padding:.4rem;border-bottom:1px solid rgba(255,255,255,.04);background:${isToday ? 'rgba(37,99,235,.03)' : ''}">
          <div class="pt-slot-inner slot-conflict" title="Konflikt: ${dayZeiten.length} Einträge">⚠ Konflikt</div></td>`;
            } else {
                const z = dayZeiten[0];
                const p = projs.find(x => x.id === z.projektId);
                const colorClass = p ? 'slot-color-' + (projs.findIndex(x => x.id === p.id) % 8) : 'slot-free';
                html += `<td style="padding:.4rem;border-bottom:1px solid rgba(255,255,255,.04);background:${isToday ? 'rgba(37,99,235,.03)' : ''}">
          <div class="pt-slot-inner ${colorClass}" title="${p ? p.name : z.typ} · ${z.von}–${z.bis}">${p ? p.name.slice(0, 12) : z.typ}</div></td>`;
            }
        });
        html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    el('plantafel-table').innerHTML = html;

    // Legend
    const usedProjs = [...new Set(zeiten.map(z => z.projektId).filter(Boolean))];
    el('plant-legend').innerHTML = usedProjs.map((pid, i) => {
        const p = projs.find(x => x.id === pid); if (!p) return '';
        return `<div class="plant-legend-item"><div class="plant-legend-dot" style="background:${PROJ_COLORS[projs.findIndex(x => x.id === pid) % 8]}"></div>${p.name}</div>`;
    }).join('');
}

window.openZeitEntryForslot = function (maId, datum) {
    openZeitModal();
    setTimeout(() => { if (el('zeit-ma')) el('zeit-ma').value = maId; if (el('zeit-datum')) el('zeit-datum').value = datum; }, 50);
};

document.getElementById('plant-prev')?.addEventListener('click', () => { plantafelWeekOffset--; renderPlantafel(); });
document.getElementById('plant-next')?.addEventListener('click', () => { plantafelWeekOffset++; renderPlantafel(); });
document.getElementById('plant-today')?.addEventListener('click', () => { plantafelWeekOffset = 0; renderPlantafel(); });

/* ============ ZEITERFASSUNG ============ */
let timerRunning = false, timerSeconds = 0, timerInterval = null, timerType = 'Arbeit';

function renderZeiten() {
    fillZeitSelects();
    renderZeitenList();
    renderApprovalList();
    fillTimerProjSelect();
}

function fillTimerProjSelect() {
    const sel = el('timer-proj-select'); if (!sel) return;
    const projs = DB.projekte().filter(p => p.status === 'Aktiv');
    sel.innerHTML = '<option value="">— Projekt wählen —</option>' + projs.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function fillZeitSelects() {
    const mas = DB.mitarbeiter();
    const projs = DB.projekte();
    [el('zeit-filter-ma'), el('zeit-ma')].forEach(sel => {
        if (!sel) return;
        const isFilter = sel.id.includes('filter');
        sel.innerHTML = (isFilter ? '<option value="">Alle Mitarbeiter</option>' : '') + mas.map(m => `<option value="${m.id}">${m.vorname} ${m.nachname}</option>`).join('');
    });
    [el('zeit-filter-proj'), el('zeit-proj')].forEach(sel => {
        if (!sel) return;
        const isFilter = sel.id.includes('filter');
        sel.innerHTML = (isFilter ? '<option value="">Alle Projekte</option>' : '') + projs.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    });
}

function renderZeitenList() {
    const zeiten = DB.zeiten();
    const maFilter = el('zeit-filter-ma')?.value;
    const projFilter = el('zeit-filter-proj')?.value;
    const fromFilter = el('zeit-filter-from')?.value;
    const toFilter = el('zeit-filter-to')?.value;
    const filtered = zeiten.filter(z => {
        if (maFilter && String(z.maId) !== maFilter) return false;
        if (projFilter && String(z.projektId) !== projFilter) return false;
        if (fromFilter && z.datum < fromFilter) return false;
        if (toFilter && z.datum > toFilter) return false;
        return true;
    }).sort((a, b) => b.datum.localeCompare(a.datum));
    const container = el('zeiten-list-container'); if (!container) return;
    if (!filtered.length) { container.innerHTML = '<div class="empty-state">Keine Einträge.</div>'; return; }
    container.innerHTML = filtered.slice(0, 20).map(z => `
    <div class="zeit-item">
      <span class="zeit-type-badge zt-${z.typ.toLowerCase()}">${z.typ}</span>
      <div style="flex:1"><div style="font-weight:700;font-size:.875rem">${maName(z.maId)}</div><div style="font-size:.78rem;color:var(--text-3)">${projName(z.projektId)} · ${fmtDate(z.datum)}</div>${z.beschr ? `<div style="font-size:.78rem;color:var(--text-3);margin-top:2px">${z.beschr}</div>` : ''}</div>
      <div class="zeit-duration">${z.dauer?.toFixed(1) || '0'}h</div>
      <span class="status ${z.status === 'Genehmigt' ? 'status-angenommen' : 'status-offen'}" style="font-size:.7rem">${z.status}</span>
      <div class="zeit-actions">
        ${z.status !== 'Genehmigt' ? `<button class="tbl-action-btn green" onclick="approveZeit(${z.id})">✓</button>` : ''}
        <button class="tbl-action-btn red" onclick="deleteZeit(${z.id})">🗑</button>
      </div>
    </div>`).join('');
}

function renderApprovalList() {
    const pending = DB.zeiten().filter(z => z.status !== 'Genehmigt');
    const cont = el('approval-list-container'); if (!cont) return;
    if (!pending.length) { el('approval-empty')?.classList.remove('hidden'); cont.innerHTML = ''; return; }
    el('approval-empty')?.classList.add('hidden');
    cont.innerHTML = pending.slice(0, 6).map(z => `
    <div class="approval-item">
      <div class="approval-name">${maName(z.maId)}</div>
      <div class="approval-details">${z.typ} · ${fmtDate(z.datum)} · ${z.dauer?.toFixed(1) || 0}h · ${projName(z.projektId)}</div>
      <div class="approval-actions">
        <button class="btn btn-sm" style="background:rgba(16,185,129,.15);color:var(--accent-green);border:1px solid rgba(16,185,129,.3)" onclick="approveZeit(${z.id})">✓ Genehmigen</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteZeit(${z.id})">Ablehnen</button>
      </div>
    </div>`).join('');
}

window.approveZeit = function (id) {
    const zts = DB.zeiten(); const idx = zts.findIndex(z => z.id === id);
    zts[idx].status = 'Genehmigt'; DB.saveZeiten(zts);
    toast('Zeit genehmigt', 'success'); renderZeiten(); renderPlantafel();
};
window.deleteZeit = function (id) {
    DB.saveZeiten(DB.zeiten().filter(z => z.id !== id));
    toast('Eintrag gelöscht', 'info'); renderZeiten(); renderPlantafel();
};

// Timer
const timerTypBtns = document.querySelectorAll('.ttb');
timerTypBtns.forEach(b => b.addEventListener('click', () => { timerTypBtns.forEach(x => x.classList.remove('active')); b.classList.add('active'); timerType = b.dataset.type; }));

document.getElementById('timer-toggle-btn')?.addEventListener('click', () => {
    if (!timerRunning) {
        timerRunning = true;
        el('timer-toggle-btn').textContent = '⏹ Timer stoppen';
        el('timer-toggle-btn').style.background = 'rgba(239,68,68,.2)';
        timerInterval = setInterval(() => { timerSeconds++; el('live-timer').textContent = fmtSecs(timerSeconds); }, 1000);
        toast('Timer gestartet', 'info');
    } else {
        timerRunning = false; clearInterval(timerInterval);
        const dauer = timerSeconds / 3600;
        const projId = parseInt(el('timer-proj-select')?.value) || null;
        if (dauer > 0.02) {
            const now = new Date(); const bis = now.toTimeString().slice(0, 5);
            now.setSeconds(now.getSeconds() - timerSeconds); const von = now.toTimeString().slice(0, 5);
            const zts = DB.zeiten();
            zts.push({ id: DB.nextId(zts), maId: 1, projektId: projId, datum: today(), typ: timerType, von, bis, dauer: Math.round(dauer * 100) / 100, beschr: '', status: 'Offen' });
            DB.saveZeiten(zts);
            toast('Zeit gespeichert', 'success', fmtSecs(timerSeconds) + ' — ' + timerType);
            renderZeiten(); renderPlantafel();
        }
        timerSeconds = 0; el('live-timer').textContent = '00:00:00';
        el('timer-toggle-btn').textContent = '▶ Timer starten';
        el('timer-toggle-btn').style.background = '';
    }
});

function fmtSecs(s) { return String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor((s % 3600) / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

function openZeitModal() {
    const datum = el('zeit-datum'); if (datum) datum.value = today();
    openModal('modal-zeit');
}
document.getElementById('btn-new-zeit')?.addEventListener('click', () => openZeitModal());

document.getElementById('btn-save-zeit')?.addEventListener('click', () => {
    const maId = parseInt(el('zeit-ma')?.value); const projId = parseInt(el('zeit-proj')?.value) || null;
    const datum = el('zeit-datum')?.value; const von = el('zeit-von')?.value || '07:00'; const bis = el('zeit-bis')?.value || '15:30';
    const typ = el('zeit-typ')?.value || 'Arbeit';
    if (!maId || !datum) { toast('Bitte alle Pflichtfelder ausfüllen', 'error'); return; }
    const [vh, vm] = von.split(':').map(Number); const [bh, bm] = bis.split(':').map(Number);
    const dauer = Math.max(0, ((bh * 60 + bm) - (vh * 60 + vm)) / 60);
    const zts = DB.zeiten();
    zts.push({ id: DB.nextId(zts), maId, projektId: projId, datum, typ, von, bis, dauer: Math.round(dauer * 100) / 100, beschr: el('zeit-beschr')?.value || '', status: 'Offen' });
    DB.saveZeiten(zts);
    toast('Zeiteintrag gespeichert', 'success', `${dauer.toFixed(1)}h · ${maName(maId)}`);
    closeModal('modal-zeit'); renderZeiten(); renderPlantafel();
});

el('zeiten-filter-toggle')?.addEventListener('click', () => {
    const fb = el('zeiten-filter-bar'); if (!fb) return;
    fb.style.display = fb.style.display === 'none' || fb.style.display === '' ? 'flex' : 'none';
});
[el('zeit-filter-ma'), el('zeit-filter-proj'), el('zeit-filter-from'), el('zeit-filter-to')].forEach(s => s?.addEventListener('change', renderZeitenList));
el('zeit-filter-clear')?.addEventListener('click', () => {
    [el('zeit-filter-ma'), el('zeit-filter-proj')].forEach(s => { if (s) s.value = ''; });
    [el('zeit-filter-from'), el('zeit-filter-to')].forEach(s => { if (s) s.value = ''; });
    renderZeitenList();
});

document.getElementById('btn-export-zeiten')?.addEventListener('click', () => {
    const zts = DB.zeiten();
    const csv = ['ID,Mitarbeiter,Projekt,Datum,Typ,Von,Bis,Dauer,Beschreibung,Status',
        ...zts.map(z => `${z.id},"${maName(z.maId)}","${projName(z.projektId)}",${z.datum},${z.typ},${z.von},${z.bis},${z.dauer},"${z.beschr || ''}",${z.status}`)
    ].join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'zeiterfassung_export.csv'; a.click();
    toast('CSV exportiert', 'success');
});

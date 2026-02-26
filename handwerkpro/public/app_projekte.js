/* ============ MAHNWESEN ============ */
function renderMahnungen() {
    const docs = DB.dokumente().filter(d => d.type === 'Rechnung' && d.status !== 'Bezahlt' && d.status !== 'Entwurf');
    const overdue = docs.filter(d => daysDiff(d.due) > 0 || d.status === 'Überfällig' || d.status === 'Gemahnt');

    const totalOverdue = overdue.reduce((s, d) => s + (d.brutto - d.zahlungEingegangen), 0);
    const totalMahnungen = docs.reduce((s, d) => s + (d.mahnDaten?.length || 0), 0);

    el('stat-ueberfaellig').textContent = fmt(totalOverdue);
    el('stat-ueberfaellig-count').textContent = overdue.length + ' Rechnungen';
    el('stat-gemahnt').textContent = totalMahnungen;
    el('mahn-sub').textContent = overdue.length + ' offene Forderungen';

    if (!overdue.length) { el('mahn-tbody').innerHTML = ''; el('mahn-empty')?.classList.remove('hidden'); return; }
    el('mahn-empty')?.classList.add('hidden');

    el('mahn-tbody').innerHTML = overdue.map(d => {
        const days = daysDiff(d.due);
        const stufe = d.mahnStufe || 0;
        const lastMahn = d.mahnDaten?.length ? fmtDate(d.mahnDaten[d.mahnDaten.length - 1].datum) : '—';
        const offen = d.brutto - d.zahlungEingegangen;
        return `<tr>
      <td style="font-weight:700">${d.nr}</td>
      <td>${kundeName(d.kundeId)}</td>
      <td style="font-weight:700;color:var(--accent-red)">${fmt(offen)}</td>
      <td style="color:var(--accent-red)">${days > 0 ? days + ' Tage' : 'Fällig heute'}</td>
      <td><span class="mahn-stufe mahn-stufe-${stufe}">${stufe === 0 ? 'Keine' : 'Mahnstufe ' + stufe}</span></td>
      <td>${lastMahn}</td>
      <td><div class="tbl-actions">
        <button class="tbl-action-btn" onclick="openMahnungModal(${d.id})">📧 Mahnen</button>
        <button class="tbl-action-btn green" onclick="openZahlungModal(${d.id})">💰 Zahlung</button>
      </div></td>
    </tr>`;
    }).join('');
}

let currentMahnId = null;
function openMahnungModal(id) {
    currentMahnId = id;
    const dok = DB.dokumente().find(d => d.id === id); if (!dok) return;
    const k = DB.kunden().find(c => c.id === dok.kundeId);
    const stufe = (dok.mahnStufe || 0) + 1;
    const offen = dok.brutto - dok.zahlungEingegangen;
    const gebuehr = stufe === 1 ? 0 : stufe === 2 ? 5 : 15;

    el('mahn-modal-content').innerHTML = `
    <div class="mahn-info-card">
      <div class="mahn-info-row"><span>Rechnung</span><strong>${dok.nr}</strong></div>
      <div class="mahn-info-row"><span>Kunde</span>${k?.name || '—'} (${k?.email || '—'})</div>
      <div class="mahn-info-row"><span>Offener Betrag</span><strong>${fmt(offen)}</strong></div>
      <div class="mahn-info-row"><span>Fällig seit</span>${daysDiff(dok.due)} Tagen</div>
    </div>
    <div style="background:rgba(37,99,235,0.05);border:1px solid rgba(37,99,235,0.2);border-radius:8px;padding:1rem;margin-bottom:1rem">
      <div style="font-weight:700;margin-bottom:.5rem">📧 Mahnstufe ${stufe} wird versendet</div>
      <div style="font-size:.85rem;color:var(--text-2)">Betreff: ${stufe === 1 ? 'Zahlungserinnerung' : stufe === 2 ? '1. Mahnung' : '2. Mahnung – Letzte Aufforderung'}: ${dok.nr}</div>
      <div style="font-size:.85rem;color:var(--text-2);margin-top:.5rem">Mahngebühr: ${gebuehr > 0 ? fmt(gebuehr) : 'keine'}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Neue Zahlungsfrist</label>
      <input type="date" class="form-control" id="mahn-neue-frist" value="${(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0] })()}">
    </div>
    <div class="form-group">
      <label class="form-label">Persönliche Nachricht (optional)</label>
      <textarea class="form-control" id="mahn-nachricht" rows="3" placeholder="Bitte beachten Sie unsere Zahlungsaufforderung…">Bitte beachten Sie unsere Zahlungsaufforderung. Bei Fragen wenden Sie sich bitte an uns.</textarea>
    </div>
    ${dok.mahnDaten?.length ? `<div class="mahn-stufen-history">
      <div style="font-size:.8rem;color:var(--text-3);margin-bottom:.4rem">Bisherige Mahnungen</div>
      ${dok.mahnDaten.map(m => `<div class="mahn-hist-item"><span class="mahn-stufe mahn-stufe-${m.stufe}">Stufe ${m.stufe}</span><span>${fmtDate(m.datum)}</span><span>${fmt(m.betrag)}</span></div>`).join('')}
    </div>`: ''}`;
    openModal('modal-mahnung');
}
window.openMahnungModal = openMahnungModal;

document.getElementById('btn-send-mahnung')?.addEventListener('click', () => {
    const docs = DB.dokumente(); const idx = docs.findIndex(d => d.id === currentMahnId);
    const stufe = (docs[idx].mahnStufe || 0) + 1;
    const gebuehr = stufe === 1 ? 0 : stufe === 2 ? 5 : 15;
    docs[idx].mahnStufe = stufe;
    docs[idx].status = 'Gemahnt';
    if (!docs[idx].mahnDaten) docs[idx].mahnDaten = [];
    docs[idx].mahnDaten.push({ stufe, datum: today(), betrag: docs[idx].brutto + gebuehr, frist: el('mahn-neue-frist')?.value });
    DB.saveDokumente(docs);
    toast(`Mahnstufe ${stufe} versendet`, 'success', `An ${kundeName(docs[idx].kundeId)}`);
    closeModal('modal-mahnung'); renderMahnungen(); renderAngebote(); updateBadges();
});

document.getElementById('btn-auto-mahnen')?.addEventListener('click', () => {
    const docs = DB.dokumente();
    let count = 0;
    docs.forEach((d, i) => {
        if (d.type === 'Rechnung' && d.status !== 'Bezahlt' && daysDiff(d.due) > 0 && (d.mahnStufe || 0) < 3) {
            docs[i].mahnStufe = (docs[i].mahnStufe || 0) + 1;
            docs[i].status = 'Gemahnt';
            if (!docs[i].mahnDaten) docs[i].mahnDaten = [];
            docs[i].mahnDaten.push({ stufe: docs[i].mahnStufe, datum: today(), betrag: docs[i].brutto });
            count++;
        }
    });
    DB.saveDokumente(docs);
    if (count > 0) { toast(`${count} Mahnung(en) automatisch versendet`, 'success'); renderMahnungen(); renderAngebote(); }
    else toast('Keine Rechnungen für Auto-Mahnung', 'info');
});

/* ============ PROJEKTE ============ */
let editProjId = null;
const PROJ_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#a855f7'];

function renderProjekte() {
    let projs = DB.projekte();
    const filteredStatus = document.querySelector('#proj-filter-tabs .filter-tab.active')?.dataset.filter || 'alle';
    const q = el('proj-search')?.value.toLowerCase() || '';
    if (filteredStatus !== 'alle') projs = projs.filter(p => p.status === filteredStatus);
    if (q) projs = projs.filter(p => (p.name + kundeName(p.kundeId)).toLowerCase().includes(q));
    el('proj-sub').textContent = projs.length + ' Projekte';
    const grid = el('projects-grid'); if (!grid) return;
    if (!projs.length) { grid.innerHTML = ''; el('proj-empty')?.classList.remove('hidden'); return; }
    el('proj-empty')?.classList.add('hidden');
    grid.innerHTML = projs.map(p => `
    <div class="project-card" onclick="openProjDetail(${p.id})">
      <div class="proj-color-bar" style="background:${p.color || '#3b82f6'}"></div>
      <div class="proj-card-top">
        <div><div class="proj-name">${p.name}</div><div class="proj-customer">${kundeName(p.kundeId)}</div></div>
        <span class="proj-status-badge proj-status-${(p.status || '').toLowerCase().replace('ü', 'ue')}">${p.status}</span>
      </div>
      <div class="proj-progress">
        <div class="prog-label"><span>Budget: ${fmt(p.budget || 0)}</span><span>${p.progress || 0}%</span></div>
        <div class="prog-bar"><div class="prog-fill" style="width:${p.progress || 0}%;background:${p.color || '#3b82f6'}"></div></div>
      </div>
      <div class="proj-meta">
        <div class="proj-team">${(p.team || []).map(id => { const m = DB.mitarbeiter().find(x => x.id === id); return m ? `<div class="proj-avatar" style="background:${m.color || '#3b82f6'}" title="${m.vorname} ${m.nachname}">${m.vorname[0]}${m.nachname[0]}</div>` : '' }).join('')}</div>
        <span style="font-size:.78rem;color:var(--text-3)">${fmtDate(p.end)}</span>
      </div>
      <div style="display:flex;gap:.4rem;margin-top:.75rem" onclick="event.stopPropagation()">
        <button class="tbl-action-btn" onclick="openProjModal(${p.id})">✏️ Bearbeiten</button>
        <button class="tbl-action-btn red" onclick="deleteProjekt(${p.id})">🗑</button>
      </div>
    </div>`).join('');
}

document.querySelectorAll('#proj-filter-tabs .filter-tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('#proj-filter-tabs .filter-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active'); renderProjekte();
}));
el('proj-search')?.addEventListener('input', renderProjekte);
document.getElementById('btn-new-projekt')?.addEventListener('click', () => openProjModal(null));

function openProjModal(id) {
    editProjId = id;
    const p = id ? DB.projekte().find(x => x.id === id) : null;
    el('proj-modal-title').textContent = id ? 'Projekt bearbeiten' : 'Neues Projekt';
    const kunden = DB.kunden();
    el('proj-customer').innerHTML = kunden.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
    if (p) {
        el('proj-name').value = p.name; el('proj-customer').value = p.kundeId;
        el('proj-address').value = p.address || ''; el('proj-status').value = p.status;
        el('proj-start').value = p.start || ''; el('proj-end').value = p.end || '';
        el('proj-budget').value = p.budget || ''; el('proj-progress').value = p.progress || 0;
        el('proj-notes').value = p.notes || '';
    } else {
        el('proj-name').value = ''; el('proj-address').value = '';
        el('proj-status').value = 'Planung'; el('proj-start').value = today();
        el('proj-budget').value = ''; el('proj-progress').value = 0; el('proj-notes').value = '';
    }
    // Team selector
    const mas = DB.mitarbeiter();
    const sel = p?.team || [];
    el('proj-team-selector').innerHTML = mas.map(m => `
    <div class="team-chip${sel.includes(m.id) ? ' selected' : ''}" data-maid="${m.id}" onclick="this.classList.toggle('selected')">
      <span style="width:8px;height:8px;border-radius:50%;background:${m.color || '#3b82f6'};display:inline-block"></span>
      ${m.vorname} ${m.nachname}
    </div>`).join('');
    openModal('modal-projekt');
}
window.openProjModal = openProjModal;

document.getElementById('btn-save-projekt')?.addEventListener('click', () => {
    const name = el('proj-name').value.trim();
    if (!name) { toast('Bitte Projektname eingeben', 'error'); return; }
    const team = [...document.querySelectorAll('#proj-team-selector .team-chip.selected')].map(c => parseInt(c.dataset.maid));
    const projs = DB.projekte();
    const data = {
        name, kundeId: parseInt(el('proj-customer').value), address: el('proj-address').value,
        status: el('proj-status').value, start: el('proj-start').value, end: el('proj-end').value,
        budget: parseFloat(el('proj-budget').value) || 0, progress: parseInt(el('proj-progress').value) || 0,
        notes: el('proj-notes').value, team,
        color: PROJ_COLORS[projs.length % PROJ_COLORS.length],
    };
    if (editProjId) {
        const idx = projs.findIndex(p => p.id === editProjId);
        data.color = projs[idx].color;
        projs[idx] = { ...projs[idx], ...data };
        DB.saveProjekte(projs); toast('Projekt aktualisiert', 'success', name);
    } else {
        data.id = DB.nextId(projs); projs.push(data);
        DB.saveProjekte(projs); toast('Projekt erstellt', 'success', name);
    }
    closeModal('modal-projekt'); renderProjekte(); renderDashboard(); updateBadges();
    fillProjektSelectsInModals();
});

function deleteProjekt(id) {
    if (!confirm('Projekt wirklich löschen?')) return;
    DB.saveProjekte(DB.projekte().filter(p => p.id !== id));
    toast('Projekt gelöscht', 'info'); renderProjekte(); updateBadges();
}
window.deleteProjekt = deleteProjekt;

function openProjDetail(id) {
    const p = DB.projekte().find(x => x.id === id); if (!p) return;
    const docs = DB.dokumente().filter(d => d.projektId === id);
    const zeiten = DB.zeiten().filter(z => z.projektId === id);
    const sumStunden = zeiten.reduce((s, z) => s + (z.dauer || 0), 0);
    const sumRechnungen = docs.filter(d => d.type === 'Rechnung').reduce((s, d) => s + d.brutto, 0);
    el('proj-detail-title').textContent = p.name;
    el('proj-detail-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:1rem;margin-bottom:1.5rem">
      ${[['Budget', fmt(p.budget || 0), ''], ['Rechnungen', fmt(sumRechnungen), ''], ['Stunden', sumStunden.toFixed(1) + ' h', ''], ['Fortschritt', (p.progress || 0) + '%', '']].map(([l, v]) => `<div class="proj-detail-stat"><div class="val">${v}</div><div class="lbl">${l}</div></div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.25rem">
      <div>
        <div style="font-size:.78rem;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.75rem;font-weight:700">Projektinfos</div>
        <div style="font-size:.875rem;color:var(--text-2);display:flex;flex-direction:column;gap:.4rem">
          <div>📍 ${p.address || '—'}</div><div>👤 ${kundeName(p.kundeId)}</div>
          <div>📅 ${fmtDate(p.start)} – ${fmtDate(p.end)}</div>
          <div>👷 Team: ${(p.team || []).map(maName).join(', ') || '—'}</div>
        </div>
        ${p.notes ? `<div class="proj-notes-card" style="margin-top:1rem">${p.notes}</div>` : ''}
      </div>
      <div>
        <div style="font-size:.78rem;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.75rem;font-weight:700">Fortschritt</div>
        <div style="margin-bottom:.5rem;font-size:.85rem">Status: <span class="proj-status-badge proj-status-${(p.status).toLowerCase()}">${p.status}</span></div>
        <div class="prog-bar" style="height:8px"><div class="prog-fill" style="width:${p.progress || 0}%;background:${p.color || '#3b82f6'}"></div></div>
        <div style="font-size:.78rem;color:var(--text-3);margin-top:.4rem">${p.progress || 0}% abgeschlossen</div>
        <div style="margin-top:1rem">
          <label class="form-label">Fortschritt aktualisieren</label>
          <div style="display:flex;gap:.5rem">
            <input type="range" min="0" max="100" value="${p.progress || 0}" id="prog-slider" style="flex:1" oninput="this.nextElementSibling.textContent=this.value+'%'">
            <span>${p.progress || 0}%</span>
          </div>
          <button class="btn btn-outline btn-sm" style="margin-top:.5rem" onclick="updateProgress(${p.id},document.getElementById('prog-slider').value)">💾 Speichern</button>
        </div>
      </div>
    </div>
    <div style="font-size:.78rem;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.75rem;font-weight:700">Verknüpfte Dokumente (${docs.length})</div>
    ${docs.length ? `<table class="data-table" style="margin-bottom:1.25rem">
      <thead><tr><th>Nr.</th><th>Typ</th><th>Betrag</th><th>Status</th></tr></thead>
      <tbody>${docs.map(d => `<tr><td style="font-weight:700">${d.nr}</td><td>${d.type}</td><td>${fmt(d.brutto)}</td><td><span class="status status-${statusCls(d.status)}">${d.status}</span></td></tr>`).join('')}</tbody>
    </table>`: '<div style="color:var(--text-3);font-size:.875rem;margin-bottom:1.25rem">Keine verknüpften Dokumente.</div>'}
    <div style="display:flex;gap:.75rem;flex-wrap:wrap">
      <button class="btn btn-outline btn-sm" onclick="openProjModal(${p.id});closeModal('modal-projekt-detail')">✏️ Bearbeiten</button>
      <button class="btn btn-primary btn-sm" onclick="openDokModal(null);closeModal('modal-projekt-detail');setTimeout(()=>{el('dok-project').value=${p.id};el('dok-customer').value=${p.kundeId}},50)">🧾 Neue Rechnung</button>
    </div>`;
    el('proj-detail-edit').onclick = () => { closeModal('modal-projekt-detail'); openProjModal(id); };
    openModal('modal-projekt-detail');
}
window.openProjDetail = openProjDetail;
window.updateProgress = function (id, val) {
    const projs = DB.projekte(); const idx = projs.findIndex(p => p.id === id);
    projs[idx].progress = parseInt(val); DB.saveProjekte(projs);
    toast('Fortschritt aktualisiert', 'success', val + '%');
    renderProjekte();
};

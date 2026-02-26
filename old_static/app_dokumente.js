/* ============ DOKUMENTE (Angebote & Rechnungen) ============ */
let currentDokId = null;
let editDokMode = false;

function renderAngebote() {
    const docs = DB.dokumente();
    const filteredType = document.querySelector('#dok-filter-tabs .filter-tab.active')?.dataset.filter || 'alle';
    const q = el('dok-search')?.value.toLowerCase() || '';
    let list = docs.filter(d => {
        const typeMatch = filteredType === 'alle' || d.type === filteredType;
        const qMatch = !q || (d.nr + kundeName(d.kundeId) + d.status).toLowerCase().includes(q);
        return typeMatch && qMatch;
    });
    el('angeb-sub').textContent = list.length + ' Dokumente';
    const tbody = el('angebote-tbody');
    if (!list.length) { tbody.innerHTML = ''; el('angebote-empty') ? el('angebote-empty').classList.remove('hidden') : null; return; }
    el('angebote-empty')?.classList.add('hidden');
    tbody.innerHTML = list.map(d => `
    <tr>
      <td style="font-weight:700;color:var(--text-1);cursor:pointer" onclick="showDokDetail(${d.id})">${d.nr}</td>
      <td><span class="type-badge ${typeCls(d.type)}">${d.type}</span></td>
      <td>${kundeName(d.kundeId)}</td>
      <td>${fmtDate(d.date)}</td>
      <td style="color:${(d.status === 'Überfällig' || daysDiff(d.due) > 0) && d.status !== 'Bezahlt' ? 'var(--accent-red)' : 'inherit'}">${fmtDate(d.due)}</td>
      <td style="font-weight:700">${fmt(d.brutto)}</td>
      <td><span class="status status-${statusCls(d.status)}">${d.status}</span></td>
      <td><div class="tbl-actions">
        <button class="tbl-action-btn" title="Ansehen" onclick="showDokDetail(${d.id})">👁</button>
        <button class="tbl-action-btn" title="Bearbeiten" onclick="openDokModal(${d.id})">✏️</button>
        ${d.type === 'Rechnung' && d.status !== 'Bezahlt' ? `<button class="tbl-action-btn green" title="Zahlung buchen" onclick="openZahlungModal(${d.id})">💰</button>` : ''}
        ${d.type === 'Angebot' && d.status === 'Angenommen' ? `<button class="tbl-action-btn" title="Rechnung erstellen" onclick="convertToRechnung(${d.id})">🧾</button>` : ''}
        <button class="tbl-action-btn red" title="Löschen" onclick="deleteDok(${d.id})">🗑</button>
      </div></td>
    </tr>`).join('');
}

document.getElementById('btn-new-dok')?.addEventListener('click', () => openDokModal(null));
document.querySelectorAll('#dok-filter-tabs .filter-tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('#dok-filter-tabs .filter-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active'); renderAngebote();
}));
el('dok-search')?.addEventListener('input', renderAngebote);

function openDokModal(id) {
    editDokMode = !!id; currentDokId = id;
    const dok = id ? DB.dokumente().find(d => d.id === id) : null;
    el('dok-modal-title').textContent = id ? 'Dokument bearbeiten' : 'Neues Dokument';

    const kunden = DB.kunden();
    el('dok-customer').innerHTML = kunden.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
    const projs = DB.projekte();
    el('dok-project').innerHTML = '<option value="">— kein Projekt —</option>' + projs.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    if (dok) {
        el('dok-type').value = dok.type;
        el('dok-customer').value = dok.kundeId;
        el('dok-date').value = dok.date;
        el('dok-due').value = dok.due || '';
        el('dok-project').value = dok.projektId || '';
        el('dok-tax').value = dok.tax || 19;
        el('dok-discount').value = dok.discount || 0;
        el('dok-notes').value = dok.notes || '';
        renderPositionsFromData(dok.positions || []);
    } else {
        el('dok-type').value = 'Angebot';
        el('dok-date').value = today();
        el('dok-due').value = (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; })();
        el('dok-tax').value = 19;
        el('dok-discount').value = 0;
        el('dok-notes').value = 'Zahlbar innerhalb von 14 Tagen netto ohne Abzug.';
        renderPositionsFromData([{ desc: '', qty: 1, unit: 'm²', price: 0 }]);
    }
    calcDokTotals(); updateDokPreview();
    openModal('modal-dokument');
}

let posRowCount = 0;
function renderPositionsFromData(positions) {
    posRowCount = 0;
    el('dok-positions').innerHTML = '';
    positions.forEach(p => addPositionRow(p));
}
function addPositionRow(data = {}) {
    posRowCount++;
    const i = posRowCount;
    const row = document.createElement('div');
    row.className = 'position-row'; row.dataset.idx = i;
    row.innerHTML = `
    <span class="pos-nr">${i}</span>
    <input class="form-control pos-desc" placeholder="Leistungsbeschreibung" value="${data.desc || ''}">
    <input class="form-control pos-qty" type="number" value="${data.qty || 1}" min="0" step="0.01">
    <select class="form-control pos-unit">
      ${['m²', 'Std.', 'Stück', 'pauschal', 'm', 'lfdm'].map(u => `<option${data.unit === u ? ' selected' : ''}>${u}</option>`).join('')}
    </select>
    <input class="form-control pos-price" type="number" value="${data.price || 0}" step="0.01" placeholder="EP">
    <span class="pos-total">${fmt(data.total || 0)}</span>
    <button class="pos-remove" onclick="this.closest('.position-row').remove();calcDokTotals();updateDokPreview()">✕</button>`;
    el('dok-positions').appendChild(row);
    row.querySelectorAll('input,select').forEach(inp => inp.addEventListener('input', () => { calcDokTotals(); updateDokPreview(); }));
}

document.getElementById('dok-add-pos')?.addEventListener('click', () => { addPositionRow(); calcDokTotals(); });
document.getElementById('dok-add-from-catalog')?.addEventListener('click', () => { openKatalogModal(); });
document.getElementById('dok-tax')?.addEventListener('change', () => { calcDokTotals(); updateDokPreview(); });
document.getElementById('dok-discount')?.addEventListener('input', () => { calcDokTotals(); updateDokPreview(); });
document.getElementById('dok-notes')?.addEventListener('input', updateDokPreview);
document.getElementById('dok-customer')?.addEventListener('change', updateDokPreview);
document.getElementById('dok-type')?.addEventListener('change', updateDokPreview);

function getPositionsData() {
    return [...el('dok-positions').querySelectorAll('.position-row')].map(row => {
        const qty = parseFloat(row.querySelector('.pos-qty').value) || 0;
        const price = parseFloat(row.querySelector('.pos-price').value) || 0;
        return { desc: row.querySelector('.pos-desc').value, qty, unit: row.querySelector('.pos-unit').value, price, total: qty * price };
    });
}
function calcDokTotals() {
    const positions = getPositionsData();
    const netto = positions.reduce((s, p) => s + p.total, 0);
    const disc = (parseFloat(el('dok-discount').value) || 0) / 100;
    const discVal = netto * disc;
    const netAfter = netto - discVal;
    const tax = (parseFloat(el('dok-tax').value) || 19) / 100;
    const taxVal = netAfter * tax;
    const brutto = netAfter + taxVal;
    el('dok-sum-net').textContent = fmt(netto);
    el('dok-sum-disc').textContent = '- ' + fmt(discVal);
    el('dok-sum-tax').textContent = fmt(taxVal);
    el('dok-sum-total').textContent = fmt(brutto);
    return { positions, netto, discVal, taxVal, brutto, disc, tax };
}
function updateDokPreview() {
    const totals = calcDokTotals();
    const kId = parseInt(el('dok-customer').value);
    const k = DB.kunden().find(x => x.id === kId);
    const type = el('dok-type').value;
    const dateStr = fmtDate(el('dok-date').value);
    const dueStr = fmtDate(el('dok-due').value);
    el('dpa-meta-right').innerHTML = `<div>${type}nummer: ${type === 'Angebot' ? 'AN' : 'RE'}-${new Date().getFullYear()}-XXX</div><div>Datum: ${dateStr}</div><div>Fällig: ${dueStr}</div>`;
    el('dpa-cust').innerHTML = k ? `<div class="dpa-type-title">${type}</div><div><strong>${k.name}</strong><br>${k.address || ''}</div>` : '<div class="dpa-type-title">' + type + '</div>';
    el('dpa-positions-preview').innerHTML = `
    <table class="dpa-pos-table">
      <thead><tr><th>Pos.</th><th>Beschreibung</th><th>Menge</th><th>EP</th><th>Gesamt</th></tr></thead>
      <tbody>${totals.positions.map((p, i) => `<tr><td>${i + 1}</td><td>${p.desc || '—'}</td><td>${p.qty} ${p.unit}</td><td>${fmt(p.price)}</td><td>${fmt(p.total)}</td></tr>`).join('')}</tbody>
    </table>`;
    el('dpa-totals').innerHTML = `
    <div class="dpa-total-row"><span>Nettobetrag</span><span>${fmt(totals.netto)}</span></div>
    ${totals.discVal > 0 ? `<div class="dpa-total-row"><span>Rabatt</span><span>- ${fmt(totals.discVal)}</span></div>` : ''}
    <div class="dpa-total-row"><span>MwSt. ${el('dok-tax').value}%</span><span>${fmt(totals.taxVal)}</span></div>
    <div class="dpa-total-row grand"><span>Gesamtbetrag</span><span>${fmt(totals.brutto)}</span></div>`;
    el('dok-notes-prev').textContent = el('dok-notes').value;
}

function saveDok(status) {
    const totals = calcDokTotals();
    const kId = parseInt(el('dok-customer').value);
    const type = el('dok-type').value;
    const prefix = type === 'Angebot' ? 'AN' : type === 'Rechnung' ? 'RE' : 'AB';
    const docs = DB.dokumente();
    const year = new Date().getFullYear();
    const nextNum = String(docs.filter(d => d.type === type).length + 1).padStart(4, '0');

    const dokData = {
        kundeId: kId, type, projektId: parseInt(el('dok-project').value) || null,
        date: el('dok-date').value, due: el('dok-due').value,
        positions: totals.positions, netto: totals.netto,
        tax: parseFloat(el('dok-tax').value) || 19,
        discount: parseFloat(el('dok-discount').value) || 0,
        brutto: totals.brutto, notes: el('dok-notes').value,
        status: status, zahlungEingegangen: 0, mahnStufe: 0, mahnDaten: [],
    };

    if (editDokMode && currentDokId) {
        const idx = docs.findIndex(d => d.id === currentDokId);
        docs[idx] = { ...docs[idx], ...dokData };
        DB.saveDokumente(docs);
        toast('Dokument gespeichert', 'success', docs[idx].nr);
    } else {
        dokData.id = DB.nextId(docs);
        dokData.nr = `${prefix}-${year}-${nextNum}`;
        docs.push(dokData);
        DB.saveDokumente(docs);
        toast('Dokument erstellt', 'success', dokData.nr);
    }
    closeModal('modal-dokument');
    renderAngebote(); renderMahnungen(); renderDashboard(); updateBadges();
}

document.getElementById('dok-save-draft')?.addEventListener('click', () => saveDok('Entwurf'));
document.getElementById('dok-save-send')?.addEventListener('click', () => {
    const type = el('dok-type').value;
    saveDok(type === 'Rechnung' ? 'Offen' : 'Offen');
    if (type === 'Rechnung') toast('Rechnung versendet', 'info', 'Rechnung wurde als "Offen" gespeichert');
});

function deleteDok(id) {
    if (!confirm('Dokument wirklich löschen?')) return;
    DB.saveDokumente(DB.dokumente().filter(d => d.id !== id));
    toast('Gelöscht', 'info'); renderAngebote(); renderDashboard(); updateBadges();
}

function convertToRechnung(id) {
    const dok = DB.dokumente().find(d => d.id === id);
    if (!dok) return;
    openDokModal(null);
    setTimeout(() => {
        el('dok-type').value = 'Rechnung';
        el('dok-customer').value = dok.kundeId;
        el('dok-project').value = dok.projektId || '';
        renderPositionsFromData(dok.positions || []);
        const d = new Date(); d.setDate(d.getDate() + 14);
        el('dok-due').value = d.toISOString().split('T')[0];
        calcDokTotals(); updateDokPreview();
        toast('Angebot in Rechnung umgewandelt', 'info', 'Bitte prüfen und speichern');
    }, 100);
}

function showDokDetail(id) {
    const dok = DB.dokumente().find(d => d.id === id); if (!dok) return;
    el('dok-detail-title').textContent = dok.nr + ' — ' + dok.type;
    el('dok-detail-body').innerHTML = `
    <div style="background:#fff;color:#1a1a1a;border-radius:8px;padding:2rem;font-size:.875rem">
      <div style="display:flex;justify-content:space-between;border-bottom:2px solid #1d4ed8;padding-bottom:1rem;margin-bottom:1.5rem">
        <div style="font-size:1.1rem;font-weight:800;color:#1d4ed8">⚙️ HandwerkPro GmbH</div>
        <div style="text-align:right;font-size:.8rem;color:#555">
          <div>${dok.type}: ${dok.nr}</div>
          <div>Datum: ${fmtDate(dok.date)}</div>
          <div>Fällig: ${fmtDate(dok.due)}</div>
        </div>
      </div>
      <div style="margin-bottom:1.5rem">
        <div style="font-size:1.1rem;font-weight:800;color:#1d4ed8;margin-bottom:.5rem">${dok.type}</div>
        <div><strong>${kundeName(dok.kundeId)}</strong></div>
        ${dok.projektId ? `<div style="color:#888;font-size:.8rem">Projekt: ${projName(dok.projektId)}</div>` : ''}
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:1rem">
        <thead><tr style="background:#f1f5f9">${['Pos.', 'Beschreibung', 'Menge', 'E-Preis', 'Gesamt'].map(h => `<th style="padding:6px 8px;text-align:left;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#555;border-bottom:1px solid #e2e8f0">${h}</th>`).join('')}</tr></thead>
        <tbody>${dok.positions.map((p, i) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">${i + 1}</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">${p.desc}</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">${p.qty} ${p.unit}</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9">${fmt(p.price)}</td><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;font-weight:700">${fmt(p.total)}</td></tr>`).join('')}</tbody>
      </table>
      <div style="text-align:right;border-top:1px solid #e2e8f0;padding-top:.75rem">
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:.85rem;color:#555"><span>Netto</span><span>${fmt(dok.netto)}</span></div>
        ${dok.discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:.85rem;color:#555"><span>Rabatt ${dok.discount}%</span><span>- ${fmt(dok.netto * (dok.discount / 100))}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:.85rem;color:#555"><span>MwSt. ${dok.tax}%</span><span>${fmt((dok.netto * (1 - dok.discount / 100)) * (dok.tax / 100))}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:1.1rem;font-weight:800;border-top:2px solid #1d4ed8;margin-top:4px"><span>Gesamt</span><span>${fmt(dok.brutto)}</span></div>
      </div>
      <div style="margin-top:1rem;font-size:.78rem;color:#888;border-top:1px solid #e2e8f0;padding-top:.75rem">${dok.notes}</div>
    </div>
    <div style="display:flex;gap:.75rem;margin-top:1.25rem;flex-wrap:wrap">
      <span class="status status-${statusCls(dok.status)}" style="align-self:center">${dok.status}</span>
      ${dok.type === 'Rechnung' && dok.status !== 'Bezahlt' ? `<button class="btn btn-primary btn-sm" onclick="closeModal('modal-dok-detail');openZahlungModal(${dok.id})">💰 Zahlung buchen</button>` : ''}
      ${dok.type === 'Angebot' && dok.status === 'Offen' ? `<button class="btn btn-outline btn-sm" onclick="closeModal('modal-dok-detail');acceptAngebot(${dok.id})">✓ Als Angenommen markieren</button>` : ''}
      <button class="btn btn-outline btn-sm" onclick="closeModal('modal-dok-detail');openDokModal(${dok.id})">✏️ Bearbeiten</button>
      <button class="btn btn-ghost btn-sm" onclick="window.print()">🖨️ Drucken</button>
    </div>`;
    el('dok-detail-edit').onclick = () => { closeModal('modal-dok-detail'); openDokModal(id); };
    el('dok-detail-print').onclick = () => window.print();
    openModal('modal-dok-detail');
}
window.showDokDetail = showDokDetail;
window.openDokModal = openDokModal;
window.deleteDok = deleteDok;
window.convertToRechnung = convertToRechnung;

function acceptAngebot(id) {
    const docs = DB.dokumente(); const idx = docs.findIndex(d => d.id === id);
    docs[idx].status = 'Angenommen'; DB.saveDokumente(docs);
    toast('Angebot angenommen', 'success'); renderAngebote(); renderDashboard(); updateBadges();
}
window.acceptAngebot = acceptAngebot;

/* === ZAHLUNG === */
let zahlungDokId = null;
function openZahlungModal(id) {
    zahlungDokId = id;
    const dok = DB.dokumente().find(d => d.id === id); if (!dok) return;
    const offen = dok.brutto - dok.zahlungEingegangen;
    el('zahlung-modal-content').innerHTML = `
    <div class="zahlung-info">
      <div class="mahn-info-row"><span>Rechnung</span><strong>${dok.nr}</strong></div>
      <div class="mahn-info-row"><span>Kunde</span>${kundeName(dok.kundeId)}</div>
      <div class="mahn-info-row"><span>Gesamtbetrag</span><strong>${fmt(dok.brutto)}</strong></div>
      <div class="mahn-info-row"><span>Bereits bezahlt</span>${fmt(dok.zahlungEingegangen)}</div>
      <div class="mahn-info-row"><span>Noch offen</span><strong style="color:var(--accent-orange)">${fmt(offen)}</strong></div>
    </div>
    <div class="form-group"><label class="form-label">Zahlungsbetrag (€)</label>
      <input type="number" class="form-control" id="zahlung-betrag" value="${offen.toFixed(2)}" step="0.01" min="0">
    </div>
    <div class="form-group"><label class="form-label">Eingangsdatum</label>
      <input type="date" class="form-control" id="zahlung-datum" value="${today()}">
    </div>`;
    openModal('modal-zahlung');
}
window.openZahlungModal = openZahlungModal;

document.getElementById('btn-confirm-zahlung')?.addEventListener('click', () => {
    const betrag = parseFloat(el('zahlung-betrag')?.value) || 0;
    if (!betrag || betrag <= 0) { toast('Ungültiger Betrag', 'error'); return; }
    const docs = DB.dokumente(); const idx = docs.findIndex(d => d.id === zahlungDokId);
    docs[idx].zahlungEingegangen = (docs[idx].zahlungEingegangen || 0) + betrag;
    if (docs[idx].zahlungEingegangen >= docs[idx].brutto - 0.01) {
        docs[idx].status = 'Bezahlt'; docs[idx].zahlungEingegangen = docs[idx].brutto;
        toast('Zahlung gebucht – Rechnung bezahlt!', 'success', fmt(betrag));
    } else {
        toast('Teilzahlung gebucht', 'info', fmt(betrag) + ' eingegangen');
    }
    DB.saveDokumente(docs); closeModal('modal-zahlung');
    renderAngebote(); renderMahnungen(); renderDashboard(); updateBadges();
});

/* === KATALOG === */
function openKatalogModal() {
    renderKatalogList('');
    el('katalog-search').value = '';
    openModal('modal-katalog');
}
el('katalog-search')?.addEventListener('input', () => renderKatalogList(el('katalog-search').value.toLowerCase()));
function renderKatalogList(q) {
    const lst = DB.leistungen().filter(l => !q || (l.name + l.cat + l.desc).toLowerCase().includes(q));
    el('katalog-list').innerHTML = lst.map(l => `
    <div class="katalog-item" onclick="addFromKatalog(${l.id})">
      <div class="katalog-item-info"><div class="katalog-item-name">${l.name}</div><div class="katalog-item-desc">${l.cat} · ${l.desc}</div></div>
      <div class="katalog-item-price">${fmt(l.price)}/${l.unit}</div>
    </div>`).join('') || '<div class="empty-state">Keine Leistungen gefunden.</div>';
}
window.addFromKatalog = function (id) {
    const l = DB.leistungen().find(x => x.id === id); if (!l) return;
    addPositionRow({ desc: l.name, qty: 1, unit: l.unit, price: l.price, total: l.price });
    closeModal('modal-katalog'); calcDokTotals(); updateDokPreview();
};

/* ============ KUNDEN ============ */
let editKundeId = null;

function renderKunden() {
    let kunden = DB.kunden();
    const q = el('kunde-search')?.value.toLowerCase() || '';
    const typeFilter = el('kunde-filter-type')?.value || '';
    if (q) kunden = kunden.filter(k => (k.name + k.email + k.tel + k.address).toLowerCase().includes(q));
    if (typeFilter) kunden = kunden.filter(k => k.type === typeFilter);
    el('kunden-sub').textContent = kunden.length + ' Kunden';
    const grid = el('kunden-grid'); if (!grid) return;
    if (!kunden.length) { grid.innerHTML = ''; el('kunden-empty')?.classList.remove('hidden'); return; }
    el('kunden-empty')?.classList.add('hidden');
    const docs = DB.dokumente(); const projs = DB.projekte();
    grid.innerHTML = kunden.map(k => {
        const kDocs = docs.filter(d => d.kundeId === k.id);
        const umsatz = kDocs.filter(d => d.status === 'Bezahlt').reduce((s, d) => s + d.brutto, 0);
        const kProjs = projs.filter(p => p.kundeId === k.id).length;
        const typeClass = k.type === 'Stammkunde' ? 'kc-stamm' : k.type === 'Gewerblich' ? 'kc-gew' : 'kc-priv';
        const initials = k.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        return `<div class="kunden-card">
      <div class="kc-top">
        <div class="kc-avatar">${initials}</div>
        <div><div class="kc-name">${k.name}</div><span class="kc-type ${typeClass}">${k.type}</span></div>
      </div>
      <div class="kc-info">
        ${k.email ? `<span>📧 ${k.email}</span>` : ''}
        ${k.tel ? `<span>📞 ${k.tel}</span>` : ''}
        ${k.address ? `<span>📍 ${k.address}</span>` : ''}
      </div>
      <div class="kc-stat-row">
        <div><strong class="cs-val">${fmt(umsatz)}</strong><span style="font-size:.75rem;color:var(--text-3)">Umsatz</span></div>
        <div><strong class="cs-val">${kDocs.length}</strong><span style="font-size:.75rem;color:var(--text-3)">Dokumente</span></div>
        <div><strong class="cs-val">${kProjs}</strong><span style="font-size:.75rem;color:var(--text-3)">Projekte</span></div>
      </div>
      <div style="display:flex;gap:.4rem;margin-top:.75rem">
        <button class="tbl-action-btn" onclick="openKundeModal(${k.id})">✏️ Bearbeiten</button>
        <button class="tbl-action-btn" onclick="openDokModal(null);setTimeout(()=>{el('dok-customer').value=${k.id}},50)">🧾 Rechnung</button>
        <button class="tbl-action-btn red" onclick="deleteKunde(${k.id})">🗑</button>
      </div>
    </div>`;
    }).join('');
}

el('kunde-search')?.addEventListener('input', renderKunden);
el('kunde-filter-type')?.addEventListener('change', renderKunden);
document.getElementById('btn-new-kunde')?.addEventListener('click', () => openKundeModal(null));

function openKundeModal(id) {
    editKundeId = id;
    const k = id ? DB.kunden().find(x => x.id === id) : null;
    el('kunde-modal-title').textContent = id ? 'Kunden bearbeiten' : 'Neuer Kunde';
    el('kunde-name').value = k?.name || '';
    el('kunde-type').value = k?.type || 'Gewerblich';
    el('kunde-email').value = k?.email || '';
    el('kunde-tel').value = k?.tel || '';
    el('kunde-address').value = k?.address || '';
    el('kunde-zahlungsziel').value = k?.zahlungsziel || 14;
    el('kunde-kreditlimit').value = k?.kreditlimit || 10000;
    el('kunde-notes').value = k?.notes || '';
    openModal('modal-kunde');
}

document.getElementById('btn-save-kunde')?.addEventListener('click', () => {
    const name = el('kunde-name').value.trim();
    if (!name) { toast('Bitte Name eingeben', 'error'); return; }
    const kunden = DB.kunden();
    const data = { name, type: el('kunde-type').value, email: el('kunde-email').value, tel: el('kunde-tel').value, address: el('kunde-address').value, zahlungsziel: parseInt(el('kunde-zahlungsziel').value) || 14, kreditlimit: parseFloat(el('kunde-kreditlimit').value) || 10000, notes: el('kunde-notes').value };
    if (editKundeId) {
        const idx = kunden.findIndex(k => k.id === editKundeId); kunden[idx] = { ...kunden[idx], ...data };
        DB.saveKunden(kunden); toast('Kunde aktualisiert', 'success', name);
    } else {
        data.id = DB.nextId(kunden); kunden.push(data);
        DB.saveKunden(kunden); toast('Kunde gespeichert', 'success', name);
    }
    closeModal('modal-kunde'); renderKunden(); fillKundenSelectsInModals(); updateBadges();
});

window.deleteKunde = function (id) { if (!confirm('Kunden wirklich löschen?')) return; DB.saveKunden(DB.kunden().filter(k => k.id !== id)); toast('Gelöscht', 'info'); renderKunden(); updateBadges(); };
window.openKundeModal = openKundeModal;

/* ============ MITARBEITER ============ */
let editMaId = null;

function renderMitarbeiter() {
    const mas = DB.mitarbeiter();
    el('ma-sub').textContent = mas.length + ' Mitarbeiter';
    const grid = el('mitarbeiter-grid'); if (!grid) return;
    const zeiten = DB.zeiten();
    grid.innerHTML = mas.map(m => {
        const stundenM = zeiten.filter(z => z.maId === m.id).reduce((s, z) => s + (z.dauer || 0), 0);
        return `<div class="ma-card">
      <div class="ma-avatar" style="background:linear-gradient(135deg,${m.color || '#3b82f6'},#8b5cf6)">${m.vorname[0]}${m.nachname[0]}</div>
      <div class="ma-name">${m.vorname} ${m.nachname}</div>
      <div class="ma-role">${m.rolle || 'Mitarbeiter'}</div>
      <div class="ma-skills">${(m.skills || []).map(s => `<span class="ma-skill">${s}</span>`).join('')}</div>
      <div style="font-size:.8rem;color:var(--text-2);margin-bottom:.75rem">${stundenM.toFixed(1)}h erfasste Arbeitszeit</div>
      <div style="font-size:.85rem;color:var(--brand-light);font-weight:700">${fmt(m.stunde || 0)} / Std.</div>
      <div style="display:flex;gap:.4rem;margin-top:.75rem;justify-content:center">
        <button class="tbl-action-btn" onclick="openMaModal(${m.id})">✏️</button>
        <button class="tbl-action-btn red" onclick="deleteMa(${m.id})">🗑</button>
      </div>
    </div>`;
    }).join('');
}

document.getElementById('btn-new-ma')?.addEventListener('click', () => openMaModal(null));
function openMaModal(id) {
    editMaId = id;
    const m = id ? DB.mitarbeiter().find(x => x.id === id) : null;
    el('ma-modal-title').textContent = id ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter hinzufügen';
    el('ma-vorname').value = m?.vorname || ''; el('ma-nachname').value = m?.nachname || '';
    el('ma-rolle').value = m?.rolle || ''; el('ma-stunde').value = m?.stunde || 45;
    el('ma-email').value = m?.email || ''; el('ma-tel').value = m?.tel || '';
    el('ma-skills').value = (m?.skills || []).join(', ');
    openModal('modal-ma');
}
window.openMaModal = openMaModal;

document.getElementById('btn-save-ma')?.addEventListener('click', () => {
    const vorname = el('ma-vorname').value.trim(), nachname = el('ma-nachname').value.trim();
    if (!vorname || !nachname) { toast('Bitte Vor- und Nachname eingeben', 'error'); return; }
    const mas = DB.mitarbeiter();
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'];
    const data = { vorname, nachname, rolle: el('ma-rolle').value, stunde: parseFloat(el('ma-stunde').value) || 45, email: el('ma-email').value, tel: el('ma-tel').value, skills: el('ma-skills').value.split(',').map(s => s.trim()).filter(Boolean), color: colors[mas.length % colors.length] };
    if (editMaId) {
        const idx = mas.findIndex(m => m.id === editMaId); mas[idx] = { ...mas[idx], ...data };
        DB.saveMitarbeiter(mas); toast('Mitarbeiter aktualisiert', 'success');
    } else {
        data.id = DB.nextId(mas); mas.push(data);
        DB.saveMitarbeiter(mas); toast('Mitarbeiter gespeichert', 'success', `${vorname} ${nachname}`);
    }
    closeModal('modal-ma'); renderMitarbeiter();
});
window.deleteMa = function (id) { if (!confirm('Mitarbeiter wirklich löschen?')) return; DB.saveMitarbeiter(DB.mitarbeiter().filter(m => m.id !== id)); toast('Gelöscht', 'info'); renderMitarbeiter(); };

/* ============ LEISTUNGEN ============ */
let editLeistungId = null;

function renderLeistungen() {
    const lst = DB.leistungen();
    el('leistungen-sub').textContent = lst.length + ' Leistungen';
    const grid = el('leistungen-grid'); if (!grid) return;
    grid.innerHTML = lst.map(l => `
    <div class="leistung-card">
      <div class="lk-category">${l.cat}</div>
      <div class="lk-name">${l.name}</div>
      <div class="lk-desc">${l.desc}</div>
      <div class="lk-price-row"><div class="lk-price">${fmt(l.price)}</div><div class="lk-unit">/${l.unit}</div></div>
      <div style="display:flex;gap:.4rem;margin-top:.75rem">
        <button class="tbl-action-btn" onclick="openLeistungModal(${l.id})">✏️</button>
        <button class="tbl-action-btn red" onclick="deleteLeistung(${l.id})">🗑</button>
      </div>
    </div>`).join('');
}

document.getElementById('btn-new-leistung')?.addEventListener('click', () => openLeistungModal(null));
function openLeistungModal(id) {
    editLeistungId = id;
    const l = id ? DB.leistungen().find(x => x.id === id) : null;
    el('leistung-modal-title').textContent = id ? 'Leistung bearbeiten' : 'Neue Leistung';
    el('lst-name').value = l?.name || ''; el('lst-cat').value = l?.cat || '';
    el('lst-unit').value = l?.unit || 'm²'; el('lst-price').value = l?.price || ''; el('lst-desc').value = l?.desc || '';
    openModal('modal-leistung');
}
window.openLeistungModal = openLeistungModal;

document.getElementById('btn-save-leistung')?.addEventListener('click', () => {
    const name = el('lst-name').value.trim();
    if (!name) { toast('Bitte Bezeichnung eingeben', 'error'); return; }
    const lst = DB.leistungen();
    const data = { name, cat: el('lst-cat').value, unit: el('lst-unit').value, price: parseFloat(el('lst-price').value) || 0, desc: el('lst-desc').value };
    if (editLeistungId) {
        const idx = lst.findIndex(l => l.id === editLeistungId); lst[idx] = { ...lst[idx], ...data };
        DB.saveLeistungen(lst); toast('Leistung aktualisiert', 'success');
    } else {
        data.id = DB.nextId(lst); lst.push(data);
        DB.saveLeistungen(lst); toast('Leistung gespeichert', 'success', name);
    }
    closeModal('modal-leistung'); renderLeistungen();
});
window.deleteLeistung = function (id) { if (!confirm('Leistung wirklich löschen?')) return; DB.saveLeistungen(DB.leistungen().filter(l => l.id !== id)); toast('Gelöscht', 'info'); renderLeistungen(); };

/* ============ FILL SELECTS IN MODALS ============ */
function fillKundenSelectsInModals() {
    const kunden = DB.kunden();
    ['dok-customer', 'proj-customer'].forEach(sid => {
        const s = el(sid); if (!s) return;
        s.innerHTML = kunden.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
    });
}
function fillProjektSelectsInModals() {
    const projs = DB.projekte();
    const s = el('dok-project'); if (!s) return;
    s.innerHTML = '<option value="">— kein Projekt —</option>' + projs.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

/* ============ QUICK CREATE & SHORTCUTS ============ */
document.getElementById('quick-create-btn')?.addEventListener('click', () => openModal('modal-quick'));
document.getElementById('qq-angebot')?.addEventListener('click', () => { closeModal('modal-quick'); openDokModal(null); setTimeout(() => el('dok-type').value = 'Angebot', 50); });
document.getElementById('qq-rechnung')?.addEventListener('click', () => { closeModal('modal-quick'); openDokModal(null); setTimeout(() => el('dok-type').value = 'Rechnung', 50); });
document.getElementById('qq-projekt')?.addEventListener('click', () => { closeModal('modal-quick'); navigateTo('projekte'); setTimeout(() => openProjModal(null), 100); });
document.getElementById('qq-kunde')?.addEventListener('click', () => { closeModal('modal-quick'); navigateTo('kunden'); setTimeout(() => openKundeModal(null), 100); });

document.getElementById('qa-angebot')?.addEventListener('click', () => { openDokModal(null); setTimeout(() => el('dok-type').value = 'Angebot', 50); });
document.getElementById('qa-rechnung')?.addEventListener('click', () => { openDokModal(null); setTimeout(() => el('dok-type').value = 'Rechnung', 50); });
document.getElementById('qa-projekt')?.addEventListener('click', () => { navigateTo('projekte'); setTimeout(() => openProjModal(null), 100); });
document.getElementById('qa-kunde')?.addEventListener('click', () => { navigateTo('kunden'); setTimeout(() => openKundeModal(null), 100); });

/* global search */
document.getElementById('global-search')?.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const q = e.target.value.toLowerCase();
    if (!q) return;
    const nav = { angebot: 'angebote', rechnung: 'angebote', mahnung: 'mahnungen', projekt: 'projekte', plan: 'plantafel', zeit: 'zeiten', kunde: 'kunden', mitarbeiter: 'mitarbeiter', leistung: 'leistungen' };
    for (const [k, v] of Object.entries(nav)) { if (q.includes(k)) { navigateTo(v); break; } }
    e.target.value = '';
});

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', () => {
    fillKundenSelectsInModals(); fillProjektSelectsInModals();
    renderDashboard(); updateBadges();
    el('dash-date-sub').textContent = new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
});

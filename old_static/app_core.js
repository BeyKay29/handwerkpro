/* ============ UTILS ============ */
const fmt = v => '€ ' + Number(v).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('de-DE') : '—';
const today = () => new Date().toISOString().split('T')[0];
const daysDiff = s => { if (!s) return 0; const d = new Date(s + 'T12:00:00'); const n = new Date(); n.setHours(12, 0, 0, 0); return Math.round((n - d) / (1000 * 60 * 60 * 24)); };
const uid = () => Math.random().toString(36).slice(2, 9);
const maName = id => { const m = DB.mitarbeiter().find(x => x.id === id); return m ? m.vorname + ' ' + m.nachname : '—'; };
const kundeName = id => { const k = DB.kunden().find(x => x.id === id); return k ? k.name : '—'; };
const projName = id => { const p = DB.projekte().find(x => x.id === id); return p ? p.name : '—'; };

function toast(msg, type = 'success', detail = '') {
    const ct = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type]}</span><div class="toast-text"><strong>${msg}</strong>${detail ? `<span>${detail}</span>` : ''}</div><button class="toast-close">✕</button>`;
    ct.appendChild(el);
    el.querySelector('.toast-close').onclick = () => removeToast(el);
    setTimeout(() => removeToast(el), 4000);
}
function removeToast(el) { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.close)));
document.querySelectorAll('.modal-overlay').forEach(ov => ov.addEventListener('click', e => { if (e.target === ov) ov.classList.add('hidden'); }));

/* ============ NAVIGATION ============ */
function navigateTo(v) {
    document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
    const vEl = document.getElementById('view-' + v); if (vEl) vEl.classList.add('active');
    const nEl = document.querySelector(`.nav-item[data-view="${v}"]`); if (nEl) nEl.classList.add('active');
    document.getElementById('views-container').scrollTop = 0;
    renderView(v);
}

document.querySelectorAll('.nav-item:not(.locked)').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    const v = el.dataset.view; if (v) navigateTo(v);
    if (window.innerWidth < 900) closeSidebar();
}));

document.querySelectorAll('[data-nav]').forEach(el => el.addEventListener('click', () => navigateTo(el.dataset.nav)));

const sidebar = document.getElementById('sidebar');
document.getElementById('topbar-menu-btn').addEventListener('click', () => sidebar.classList.add('open'));
document.getElementById('sidebar-close').addEventListener('click', () => sidebar.classList.remove('open'));
function closeSidebar() { sidebar.classList.remove('open'); }

/* ============ GLOBAL NAV BADGES ============ */
function updateBadges() {
    const docs = DB.dokumente();
    const offene = docs.filter(d => d.type === 'Angebot' && d.status === 'Offen').length;
    const ueberfaellig = docs.filter(d => d.type === 'Rechnung' && d.status === 'Überfällig').length;
    const projekte = DB.projekte().filter(p => p.status === 'Aktiv').length;
    const kunden = DB.kunden().length;
    el('badge-angebote').textContent = offene || '';
    el('badge-angebote').style.display = offene ? '' : 'none';
    el('badge-mahnungen').textContent = ueberfaellig || '';
    el('badge-mahnungen').style.display = ueberfaellig ? '' : 'none';
    el('badge-projekte').textContent = projekte || '';
    el('badge-projekte').style.display = projekte ? '' : 'none';
    el('badge-kunden').textContent = kunden || '';
}

function el(id) { return document.getElementById(id); }

/* ============ RENDER DISPATCH ============ */
function renderView(v) {
    updateBadges();
    if (v === 'dashboard') renderDashboard();
    else if (v === 'angebote') renderAngebote();
    else if (v === 'mahnungen') renderMahnungen();
    else if (v === 'projekte') renderProjekte();
    else if (v === 'plantafel') renderPlantafel();
    else if (v === 'zeiten') renderZeiten();
    else if (v === 'kunden') renderKunden();
    else if (v === 'mitarbeiter') renderMitarbeiter();
    else if (v === 'leistungen') renderLeistungen();
}

/* ============ DASHBOARD ============ */
function renderDashboard() {
    const docs = DB.dokumente();
    const projs = DB.projekte();
    const now = today();

    const umsatz = docs.filter(d => d.status === 'Bezahlt').reduce((s, d) => s + d.brutto, 0);
    const offen = docs.filter(d => d.type === 'Rechnung' && ['Offen', 'Überfällig', 'Gemahnt'].includes(d.status));
    const offenSum = offen.reduce((s, d) => s + (d.brutto - d.zahlungEingegangen), 0);
    const ueberfaellig = offen.filter(d => d.status === 'Überfällig' || daysDiff(d.due) > 0).length;
    const aktiv = projs.filter(p => p.status === 'Aktiv').length;
    const planung = projs.filter(p => p.status === 'Planung').length;
    const angOffen = docs.filter(d => d.type === 'Angebot' && d.status === 'Offen');
    const angVol = angOffen.reduce((s, d) => s + d.brutto, 0);

    el('stat-umsatz').textContent = fmt(umsatz);
    el('stat-offen').textContent = fmt(offenSum);
    el('stat-offen-sub').textContent = ueberfaellig + ' überfällig';
    el('stat-projekte').textContent = aktiv;
    el('stat-proj-sub').textContent = planung + ' in Planung';
    el('stat-angebote').textContent = angOffen.length;
    el('stat-ang-sub').textContent = fmt(angVol) + ' Volumen';

    // Alerts
    const alerts = [];
    docs.filter(d => d.type === 'Rechnung' && (d.status === 'Überfällig' || daysDiff(d.due) > 0) && d.status !== 'Bezahlt').forEach(d => {
        const days = daysDiff(d.due);
        alerts.push(`<div class="alert-item red"><span class="alert-icon">🚨</span><div class="alert-text"><strong>${d.nr} überfällig (${days} Tage)</strong><span>${kundeName(d.kundeId)} · ${fmt(d.brutto - d.zahlungEingegangen)}</span></div></div>`);
    });
    if (!alerts.length) alerts.push('<div class="alert-item blue"><span class="alert-icon">✅</span><div class="alert-text"><strong>Kein Handlungsbedarf</strong><span>Alles im grünen Bereich</span></div></div>');
    el('dash-alerts').innerHTML = alerts.join('');

    // Recent docs
    const tbody = el('dash-docs-tbody');
    if (tbody) tbody.innerHTML = docs.slice(-5).reverse().map(d => `
    <tr>
      <td style="font-weight:700;color:var(--text-1)">${d.nr}</td>
      <td><span class="type-badge ${typeCls(d.type)}">${d.type}</span></td>
      <td>${kundeName(d.kundeId)}</td>
      <td style="font-weight:700">${fmt(d.brutto)}</td>
      <td><span class="status status-${statusCls(d.status)}">${d.status}</span></td>
      <td><button class="tbl-action-btn" onclick="showDokDetail(${d.id})">→</button></td>
    </tr>`).join('');

    // Projects
    const projList = el('dash-projects-list');
    if (projList) projList.innerHTML = projs.filter(p => p.status === 'Aktiv').slice(0, 4).map(p => `
    <div style="display:flex;align-items:center;gap:.75rem;padding:.75rem;border:1px solid var(--border);border-radius:8px;margin-bottom:.5rem;cursor:pointer" onclick="openProjDetail(${p.id})">
      <div style="width:10px;height:10px;border-radius:50%;background:${p.color || '#3b82f6'};flex-shrink:0"></div>
      <div style="flex:1"><div style="font-weight:700;font-size:.875rem">${p.name}</div><div style="font-size:.75rem;color:var(--text-3)">${kundeName(p.kundeId)}</div></div>
      <div style="font-size:.8rem;color:var(--text-2)">${p.progress}%</div>
    </div>`).join('') || '<div class="empty-state">Keine aktiven Projekte.</div>';
}

function typeCls(t) { return t === 'Angebot' ? 'type-angebot' : t === 'Rechnung' ? 'type-rechnung' : 'type-ab'; }
function statusCls(s) { const m = { 'Offen': 'offen', 'Angenommen': 'angenommen', 'Abgelehnt': 'abgelehnt', 'Überfällig': 'ueberfaellig', 'Bezahlt': 'bezahlt', 'Entwurf': 'entwurf', 'Gemahnt': 'gemahnt' }; return m[s] || 'offen'; }

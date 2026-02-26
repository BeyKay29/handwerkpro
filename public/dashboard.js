/* ============================================================
   DASHBOARD – dashboard.js
   Full interactive demo for HandwerkPro
   ============================================================ */

// ============================================================
// MOCK DATA
// ============================================================
const DATA = {
    documents: [
        { nr: 'AN-2026-0142', type: 'Angebot', customer: 'Müller GmbH', date: '24.02.2026', due: '24.03.2026', amount: '€ 5.462', status: 'offen' },
        { nr: 'RE-2026-0089', type: 'Rechnung', customer: 'Schäfer KG', date: '20.02.2026', due: '06.03.2026', amount: '€ 2.890', status: 'ueberfaellig' },
        { nr: 'AB-2026-0041', type: 'Auftragsbestätigung', customer: 'Weber Immobilien', date: '18.02.2026', due: '—', amount: '€ 18.750', status: 'angenommen' },
        { nr: 'RE-2026-0088', type: 'Rechnung', customer: 'Fischer & Braun', date: '15.02.2026', due: '01.03.2026', amount: '€ 1.240', status: 'bezahlt' },
        { nr: 'AN-2026-0141', type: 'Angebot', customer: 'Hoffmann Verwaltung', date: '12.02.2026', due: '12.03.2026', amount: '€ 8.300', status: 'offen' },
        { nr: 'RE-2026-0087', type: 'Rechnung', customer: 'Müller GmbH', date: '10.02.2026', due: '24.02.2026', amount: '€ 3.780', status: 'ueberfaellig' },
        { nr: 'AN-2026-0140', type: 'Angebot', customer: 'Bergmann GbR', date: '06.02.2026', due: '06.03.2026', amount: '€ 4.100', status: 'abgelehnt' },
    ],
    alerts: [
        { type: 'red', icon: '🚨', title: 'Rechnung 2 Tage überfällig', sub: 'RE-2026-0089 · Schäfer KG · € 2.890' },
        { type: 'red', icon: '🚨', title: 'Rechnung 5 Tage überfällig', sub: 'RE-2026-0087 · Müller GmbH · € 3.780' },
        { type: 'orange', icon: '⚠️', title: 'Konflik in Plantafel', sub: 'R. Braun · Mittwoch 26.02. · 2 Projekte' },
        { type: 'blue', icon: '📋', title: '3 Angebote ohne Antwort', sub: 'Ältestes: AN-2026-0141 · 14 Tage alt' },
    ],
    today: [
        { initials: 'KW', name: 'K. Weber', project: 'Kirchgasse 3 – Malerarbeiten', hours: '8h', color: '#3b82f6' },
        { initials: 'MS', name: 'M. Schulz', project: 'Müller GmbH – Fassade', hours: '8h', color: '#10b981' },
        { initials: 'AF', name: 'A. Fischer', project: 'Schäfer KG – Innen', hours: '6h', color: '#8b5cf6' },
        { initials: 'RB', name: 'R. Braun', project: 'Kirchgasse 3', hours: '8h', color: '#f59e0b' },
        { initials: 'BK', name: 'B. Koch', project: 'Büro / Krank', hours: '0h', color: '#6b7280' },
    ],
    chartData7: [
        { label: 'Mo', value: 4200 },
        { label: 'Di', value: 6800 },
        { label: 'Mi', value: 5500 },
        { label: 'Do', value: 9200 },
        { label: 'Fr', value: 7100 },
        { label: 'Sa', value: 3400 },
        { label: 'So', value: 800 },
    ],
    projects: [
        { name: 'Kirchgasse 3', customer: 'Privat – Müller', status: 'aktiv', progress: 65, team: ['KW', 'RB'], budget: '€ 12.400', color: '#3b82f6' },
        { name: 'Müller GmbH Fassade', customer: 'Müller GmbH', status: 'aktiv', progress: 40, team: ['MS'], budget: '€ 24.800', color: '#10b981' },
        { name: 'Schäfer KG Innenarbeiten', customer: 'Schäfer KG', status: 'aktiv', progress: 80, team: ['AF'], budget: '€ 8.600', color: '#8b5cf6' },
        { name: 'Hotel Bergblick Renovierung', customer: 'Hotel Bergblick GmbH', status: 'planung', progress: 10, team: ['KW', 'MS', 'AF'], budget: '€ 62.000', color: '#f59e0b' },
        { name: 'Wohnanlage Südring', customer: 'Immobilien AG', status: 'planung', progress: 0, team: ['MS', 'RB'], budget: '€ 34.500', color: '#ec4899' },
        { name: 'Stadthaus Bachgasse', customer: 'Weber Familie', status: 'aktiv', progress: 90, team: ['RB'], budget: '€ 9.800', color: '#06b6d4' },
        { name: 'Büro Technologiepark', customer: 'TechPark GmbH', status: 'abgeschlossen', progress: 100, team: ['AF', 'BK'], budget: '€ 15.200', color: '#6b7280' },
        { name: 'Kindergarten Sandweg', customer: 'Stadt Heidelberg', status: 'aktiv', progress: 55, team: ['KW', 'MS'], budget: '€ 28.900', color: '#f97316' },
    ],
    kunden: [
        { initials: 'MG', name: 'Müller GmbH', type: 'gew', typeLabel: 'Gewerblich · Stammkunde', email: 'info@mueller-gmbh.de', tel: '06221 / 48200', umsatz: '€ 142.000', projekte: 23 },
        { initials: 'SK', name: 'Schäfer KG', type: 'gew', typeLabel: 'Gewerblich', email: 'kontakt@schaefer-kg.de', tel: '06221 / 33100', umsatz: '€ 28.500', projekte: 7 },
        { initials: 'WI', name: 'Weber Immobilien', type: 'gew', typeLabel: 'Gewerblich', email: 'info@weber-immo.de', tel: '06222 / 55800', umsatz: '€ 88.000', projekte: 18 },
        { initials: 'FB', name: 'Fischer & Braun', type: 'stamm', typeLabel: 'Privat · Stammkunde', email: 'family.fischer@web.de', tel: '0176 11223344', umsatz: '€ 9.400', projekte: 4 },
        { initials: 'HV', name: 'Hoffmann Verwaltung', type: 'gew', typeLabel: 'Gewerblich', email: 'verwaltung@hoffmann.de', tel: '06221 / 72900', umsatz: '€ 45.000', projekte: 11 },
        { initials: 'BG', name: 'Bergmann GbR', type: 'gew', typeLabel: 'Gewerblich', email: 'info@bergmann-gbr.de', tel: '06223 / 41500', umsatz: '€ 18.000', projekte: 5 },
        { initials: 'PM', name: 'Peter Maier', type: 'priv', typeLabel: 'Privat', email: 'p.maier@gmail.com', tel: '0179 87654321', umsatz: '€ 5.800', projekte: 2 },
        { initials: 'LS', name: 'Laura Schmitt', type: 'priv', typeLabel: 'Privat', email: 'l.schmitt@outlook.de', tel: '0160 99887766', umsatz: '€ 3.200', projekte: 1 },
    ],
    mitarbeiter: [
        { initials: 'TM', name: 'Thomas Müller', role: 'Betriebsleiter', skills: ['Malerei', 'Fassade', 'Leitung'], avail: 'belegt', availLabel: 'Belegt bis Fr.' },
        { initials: 'KW', name: 'Klaus Weber', role: 'Geselle', skills: ['Malerei', 'Tapezieren'], avail: 'belegt', availLabel: 'Belegt bis Mi.' },
        { initials: 'MS', name: 'Markus Schulz', role: 'Geselle', skills: ['Fassade', 'Spachtelarbeiten'], avail: 'belegt', availLabel: 'Belegt bis Do.' },
        { initials: 'AF', name: 'Anna Fischer', role: 'Gesellin', skills: ['Tapezieren', 'Dekor'], avail: 'verfuegbar', availLabel: 'Frei ab Mo.' },
        { initials: 'RB', name: 'Robert Braun', role: 'Geselle', skills: ['Malerei', 'Grundierung'], avail: 'belegt', availLabel: 'Belegt bis Fr.' },
        { initials: 'BK', name: 'Brigitte Koch', role: 'Bürokraft', skills: ['Buchhaltung', 'Angebote'], avail: 'verfuegbar', availLabel: 'Im Büro' },
        { initials: 'PJ', name: 'Peter Jung', role: 'Auszubildender', skills: ['Malerei'], avail: 'verfuegbar', availLabel: 'Verfügbar' },
        { initials: 'LN', name: 'Luisa Novak', role: 'Auszubildende', skills: ['Tapezieren'], avail: 'belegt', availLabel: 'Belegt bis Di.' },
    ],
    leistungen: [
        { category: 'Malerei Innen', name: 'Wandanstrich 2-fach', desc: 'Deckweißanstrich auf Putz, 2 Lagen', price: '€ 12,50', unit: '/ m²' },
        { category: 'Malerei Innen', name: 'Deckenanstrich', desc: 'Weißanstrich Deckenfläche inkl. Abkleben', price: '€ 14,80', unit: '/ m²' },
        { category: 'Fassade', name: 'Fassadenanstrich 2-fach', desc: 'Silikatfarbe auf Außenputz', price: '€ 18,00', unit: '/ m²' },
        { category: 'Fassade', name: 'Fassadengrundierung', desc: 'Grundierungsanstrich vor Farbauftrag', price: '€ 6,50', unit: '/ m²' },
        { category: 'Tapezieren', name: 'Tapezieren (Raufaser)', desc: 'Raufasertapete kleben und grundieren', price: '€ 9,80', unit: '/ m²' },
        { category: 'Spachtelarbeiten', name: 'Glattzug Wand', desc: 'Feinspachtelung auf Putz, schleiffertig', price: '€ 16,20', unit: '/ m²' },
        { category: 'Sonstiges', name: 'Gerüststellung', desc: 'Aufbau und Abbau durch Dienstleister', price: '€ 1.200', unit: '/ pauschal' },
        { category: 'Sonstiges', name: 'Stundenlohnarbeit', desc: 'Regieleistung nach tatsächlichem Aufwand', price: '€ 65', unit: '/ Std.' },
    ],
    plantafel: {
        headers: ['Mitarbeiter', 'Mo 24.02', 'Di 25.02', 'Mi 26.02', 'Do 27.02', 'Fr 28.02'],
        rows: [
            { name: 'K. Weber', cells: ['proj-a', 'proj-a', 'proj-a', 'proj-b', 'proj-b'] },
            { name: 'M. Schulz', cells: ['proj-b', 'proj-b', 'proj-b', 'proj-b', 'proj-b'] },
            { name: 'A. Fischer', cells: ['empty', 'empty', 'proj-c', 'proj-c', 'proj-c'] },
            { name: 'R. Braun', cells: ['proj-a', 'proj-a', 'conflict', 'proj-c', 'proj-c'] },
            { name: 'P. Jung', cells: ['proj-a', 'proj-a', 'proj-a', 'empty', 'empty'] },
            { name: 'L. Novak', cells: ['urlaub', 'urlaub', 'proj-b', 'proj-b', 'proj-b'] },
        ],
        cellLabels: {
            'proj-a': 'Kirchgasse 3',
            'proj-b': 'Müller Fassade',
            'proj-c': 'Schäfer KG',
            'conflict': '⚠ Konflikt',
            'empty': '—',
            'urlaub': 'Urlaub',
        }
    },
    zeiten: [
        { name: 'K. Weber', project: 'Kirchgasse 3', mo: '8:00h', di: '8:30h', mi: '8:00h', do: '8:00h', fr: '—', total: '32:30h', status: 'offen' },
        { name: 'M. Schulz', project: 'Müller GmbH', mo: '8:00h', di: '8:00h', mi: '7:30h', do: '8:00h', fr: '8h', total: '39:30h', status: 'offen' },
        { name: 'R. Braun', project: 'Kirchgasse 3', mo: '8:00h', di: '8:00h', mi: '8:00h', do: '8:00h', fr: '—', total: '32:00h', status: 'genehmigt' },
        { name: 'A. Fischer', project: 'Schäfer KG', mo: '—', di: '—', mi: '6:00h', do: '8:00h', fr: '8h', total: '22:00h', status: 'offen' },
    ],
    offenePosten: [
        { icon: '🔴', name: 'Schäfer KG', invoice: 'RE-2026-0089', amount: '€ 2.890', days: '5 Tage überfällig', urgent: true },
        { icon: '🔴', name: 'Müller GmbH', invoice: 'RE-2026-0087', amount: '€ 3.780', days: '8 Tage überfällig', urgent: true },
        { icon: '🟡', name: 'Bergmann GbR', invoice: 'RE-2026-0085', amount: '€ 1.440', days: 'Fällig in 2 Tagen', urgent: false },
        { icon: '🟡', name: 'Hoffmann Verwaltung', invoice: 'RE-2026-0082', amount: '€ 5.200', days: 'Fällig in 5 Tagen', urgent: false },
        { icon: '🟢', name: 'Fischer & Braun', invoice: 'RE-2026-0079', amount: '€ 890', days: 'Fällig in 12 Tagen', urgent: false },
    ],
};

// ============================================================
// NAVIGATION
// ============================================================
let activeView = 'dashboard';

function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.classList.add('active');
        activeView = viewId;
    }
    const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (navItem) navItem.classList.add('active');
    document.querySelector('.views-container').scrollTop = 0;
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        if (item.classList.contains('locked')) return;
        const view = item.dataset.view;
        if (view) navigateTo(view);
        if (window.innerWidth < 900) closeSidebar();
    });
});

document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.nav;
        if (view) navigateTo(view);
        if (btn.hasAttribute('data-close')) closeQuickModal();
    });
});

// ============================================================
// SIDEBAR
// ============================================================
const sidebar = document.getElementById('sidebar');
const topbarMenuBtn = document.getElementById('topbar-menu-btn');
const sidebarClose = document.getElementById('sidebar-close');

function openSidebar() { sidebar.classList.add('open'); }
function closeSidebar() { sidebar.classList.remove('open'); }

if (topbarMenuBtn) topbarMenuBtn.addEventListener('click', openSidebar);
if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);

// ============================================================
// DASHBOARD CHARTS
// ============================================================
function renderChart(data) {
    const barsEl = document.getElementById('chart-bars');
    const labelsEl = document.getElementById('chart-labels');
    if (!barsEl || !labelsEl) return;

    const max = Math.max(...data.map(d => d.value));

    barsEl.innerHTML = data.map(d => {
        const pct = (d.value / max) * 100;
        return `
            <div class="chart-bar" style="height: ${pct}%">
                <div class="bar-fill"></div>
                <div class="bar-tip">€ ${d.value.toLocaleString('de-DE')}</div>
            </div>
        `;
    }).join('');

    labelsEl.innerHTML = data.map(d => `<span>${d.label}</span>`).join('');
}

// Animate count-up on stat cards
function animateCountUp(el, target, prefix = '', suffix = '') {
    const duration = 1200;
    const start = performance.now();
    const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = prefix + current.toLocaleString('de-DE') + suffix;
        if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

function initDashboard() {
    // Fill chart
    renderChart(DATA.chartData7);

    // Stats count-up
    const umsatzEl = document.querySelector('#stat-umsatz .sc-value');
    if (umsatzEl) animateCountUp(umsatzEl, 48200, '€ ');

    // Fill documents table
    const tbody = document.getElementById('docs-table-body');
    if (tbody) {
        tbody.innerHTML = DATA.documents.slice(0, 5).map(doc => `
            <tr>
                <td><span style="font-weight:700;color:var(--text-1)">${doc.nr}</span></td>
                <td><span class="type-badge ${typeBadgeClass(doc.type)}">${doc.type}</span></td>
                <td>${doc.customer}</td>
                <td style="font-weight:700">${doc.amount}</td>
                <td><span class="status status-${doc.status}">${statusLabel(doc.status)}</span></td>
                <td><button class="btn btn-ghost btn-sm" style="padding:0.3rem 0.6rem">→</button></td>
            </tr>
        `).join('');
    }

    // Alerts
    const alertList = document.getElementById('alert-list');
    if (alertList) {
        alertList.innerHTML = DATA.alerts.map(a => `
            <div class="alert-item ${a.type}">
                <span class="alert-icon">${a.icon}</span>
                <div class="alert-text">
                    <strong>${a.title}</strong>
                    <span>${a.sub}</span>
                </div>
            </div>
        `).join('');
    }

    // Today
    const todayList = document.getElementById('today-list');
    if (todayList) {
        todayList.innerHTML = DATA.today.map(t => `
            <div class="today-item">
                <div class="today-dot" style="background:${t.color}"></div>
                <div>
                    <div class="today-name">${t.name}</div>
                    <div class="today-project">${t.project}</div>
                </div>
                <div class="today-hours">${t.hours}</div>
            </div>
        `).join('');
    }

    // Chart tab switching
    document.querySelectorAll('.chart-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Randomize data for demo
            const randomData = DATA.chartData7.map(d => ({ ...d, value: Math.round(d.value * (0.7 + Math.random() * 0.6)) }));
            renderChart(randomData);
        });
    });
}

function typeBadgeClass(type) {
    if (type === 'Angebot') return 'type-angebot';
    if (type === 'Rechnung') return 'type-rechnung';
    return 'type-ab';
}

function statusLabel(s) {
    const map = { offen: 'Offen', angenommen: 'Angenommen', abgelehnt: 'Abgelehnt', ueberfaellig: 'Überfällig', bezahlt: 'Bezahlt', entwurf: 'Entwurf' };
    return map[s] || s;
}

// ============================================================
// ANGEBOTE TABLE
// ============================================================
function initAngebote() {
    const tbody = document.getElementById('angebote-full-table');
    if (!tbody) return;
    tbody.innerHTML = DATA.documents.map(doc => `
        <tr>
            <td><span style="font-weight:700;color:var(--text-1)">${doc.nr}</span></td>
            <td><span class="type-badge ${typeBadgeClass(doc.type)}">${doc.type}</span></td>
            <td>${doc.customer}</td>
            <td>${doc.date}</td>
            <td style="color:${doc.status === 'ueberfaellig' ? 'var(--accent-red)' : 'inherit'}">${doc.due}</td>
            <td style="font-weight:700">${doc.amount}</td>
            <td><span class="status status-${doc.status}">${statusLabel(doc.status)}</span></td>
            <td>
                <div style="display:flex;gap:0.4rem">
                    <button class="btn btn-ghost btn-sm">📄</button>
                    <button class="btn btn-ghost btn-sm">📧</button>
                    <button class="btn btn-ghost btn-sm">⋮</button>
                </div>
            </td>
        </tr>
    `).join('');

    // Filter tabs
    document.querySelectorAll('#view-angebote .filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#view-angebote .filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// ============================================================
// ANGEBOT MODAL
// ============================================================
const newAngebotBtn = document.getElementById('new-angebot-btn');
const angebotModal = document.getElementById('angebot-modal');
const closeAngebotModal = document.getElementById('close-angebot-modal');
const closeAngebotModal2 = document.getElementById('close-angebot-modal-2');
const addPositionBtn = document.getElementById('add-position-btn');

if (newAngebotBtn) newAngebotBtn.addEventListener('click', () => angebotModal.classList.remove('hidden'));
if (closeAngebotModal) closeAngebotModal.addEventListener('click', () => angebotModal.classList.add('hidden'));
if (closeAngebotModal2) closeAngebotModal2.addEventListener('click', () => angebotModal.classList.add('hidden'));
if (angebotModal) angebotModal.addEventListener('click', (e) => { if (e.target === angebotModal) angebotModal.classList.add('hidden'); });

// Calculate totals in modal
function calculateTotals() {
    const rows = document.querySelectorAll('.position-row');
    let net = 0;
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.pos-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.pos-price')?.value) || 0;
        const total = qty * price;
        const totalEl = row.querySelector('.pos-total');
        if (totalEl) totalEl.textContent = '€ ' + total.toLocaleString('de-DE', { minimumFractionDigits: 2 });
        net += total;
    });
    const taxRate = parseFloat(document.getElementById('tax-rate')?.value || 19) / 100;
    const discount = parseFloat(document.getElementById('discount')?.value || 0) / 100;
    const discountVal = net * discount;
    const netAfterDiscount = net - discountVal;
    const tax = netAfterDiscount * taxRate;
    const total = netAfterDiscount + tax;

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('sum-net', '€ ' + net.toLocaleString('de-DE', { minimumFractionDigits: 2 }));
    setEl('sum-tax', '€ ' + tax.toLocaleString('de-DE', { minimumFractionDigits: 2 }));
    setEl('sum-discount', '- € ' + discountVal.toLocaleString('de-DE', { minimumFractionDigits: 2 }));
    setEl('sum-total', '€ ' + total.toLocaleString('de-DE', { minimumFractionDigits: 2 }));
}

let posCounter = 3;
if (addPositionBtn) {
    addPositionBtn.addEventListener('click', () => {
        const container = document.getElementById('positions-container');
        const newRow = document.createElement('div');
        newRow.className = 'position-row';
        newRow.dataset.pos = posCounter;
        newRow.innerHTML = `
            <span class="pos-nr">${posCounter}</span>
            <input class="form-control pos-desc" placeholder="Beschreibung der Leistung">
            <input class="form-control pos-qty" type="number" value="1" placeholder="Menge">
            <select class="form-control pos-unit">
                <option>m²</option><option>Std.</option><option>Stück</option><option>pauschal</option>
            </select>
            <input class="form-control pos-price" type="number" value="0" placeholder="EP (€)">
            <div class="pos-total">€ 0,00</div>
            <button class="pos-remove">✕</button>
        `;
        container.appendChild(newRow);
        posCounter++;
        bindPositionEvents();
    });
}

function bindPositionEvents() {
    document.querySelectorAll('.pos-qty, .pos-price').forEach(inp => {
        inp.removeEventListener('input', calculateTotals);
        inp.addEventListener('input', calculateTotals);
    });
    document.querySelectorAll('.pos-remove').forEach(btn => {
        btn.onclick = () => {
            btn.closest('.position-row').remove();
            calculateTotals();
        };
    });
    const taxRate = document.getElementById('tax-rate');
    const discount = document.getElementById('discount');
    if (taxRate) { taxRate.removeEventListener('change', calculateTotals); taxRate.addEventListener('change', calculateTotals); }
    if (discount) { discount.removeEventListener('input', calculateTotals); discount.addEventListener('input', calculateTotals); }
}

bindPositionEvents();
calculateTotals();

// ============================================================
// PROJECTS
// ============================================================
function initProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = DATA.projects.map(p => `
        <div class="project-card">
            <div class="proj-color-bar" style="background:${p.color}"></div>
            <div class="proj-card-top">
                <div>
                    <div class="proj-name">${p.name}</div>
                    <div class="proj-customer">${p.customer}</div>
                </div>
                <span class="proj-status-badge proj-status-${p.status}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
            </div>
            <div class="proj-progress">
                <div class="prog-label">
                    <span>Fortschritt</span>
                    <span>${p.progress}%</span>
                </div>
                <div class="prog-bar">
                    <div class="prog-fill" style="width:${p.progress}%; background:${p.color}"></div>
                </div>
            </div>
            <div class="proj-meta">
                <div class="proj-team">
                    ${p.team.map((t, i) => `<div class="proj-avatar" style="background:linear-gradient(135deg,${p.color},#8b5cf6)">${t}</div>`).join('')}
                </div>
                <span>${p.budget}</span>
            </div>
        </div>
    `).join('');
}

// ============================================================
// PLANTAFEL
// ============================================================
function initPlantafel() {
    const container = document.getElementById('plantafel-table');
    if (!container) return;

    const pt = DATA.plantafel;
    let html = `<table class="pt-table">
        <thead><tr>${pt.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>`;

    pt.rows.forEach(row => {
        html += `<tr><td class="name-cell">${row.name}</td>`;
        row.cells.forEach(cell => {
            const label = pt.cellLabels[cell] || '—';
            html += `<td><div class="pt-cell pt-${cell}">${label}</div></td>`;
        });
        html += `</tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ============================================================
// ZEITERFASSUNG
// ============================================================
let timerRunning = false;
let timerSeconds = 0;
let timerInterval = null;

function formatTime(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function initZeiten() {
    const startBtn = document.getElementById('timer-start-btn');
    const timerEl = document.getElementById('live-timer');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!timerRunning) {
                timerRunning = true;
                startBtn.textContent = '⏹ Timer stoppen';
                startBtn.style.background = 'rgba(239,68,68,0.2)';
                startBtn.style.borderColor = 'rgba(239,68,68,0.4)';
                startBtn.style.color = '#fca5a5';
                timerInterval = setInterval(() => {
                    timerSeconds++;
                    if (timerEl) timerEl.textContent = formatTime(timerSeconds);
                }, 1000);
            } else {
                timerRunning = false;
                clearInterval(timerInterval);
                startBtn.textContent = '▶ Timer starten';
                startBtn.style.background = '';
                startBtn.style.borderColor = '';
                startBtn.style.color = '';
                // Reset after stop
                setTimeout(() => { timerSeconds = 0; if (timerEl) timerEl.textContent = '00:00:00'; }, 2000);
            }
        });
    }

    // Wochenübersicht table
    const tableContainer = document.getElementById('zeiten-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = `
            <table class="zeiten-week-table">
                <thead>
                    <tr><th>Mitarbeiter</th><th>Mo</th><th>Di</th><th>Mi</th><th>Do</th><th>Fr</th><th>Gesamt</th><th>Status</th></tr>
                </thead>
                <tbody>
                    ${DATA.zeiten.map(z => `
                        <tr>
                            <td style="font-weight:700;color:var(--text-1)">${z.name}</td>
                            <td>${z.mo}</td><td>${z.di}</td><td>${z.mi}</td><td>${z.do}</td><td>${z.fr}</td>
                            <td style="font-weight:700;color:var(--text-1)">${z.total}</td>
                            <td><span class="status ${z.status === 'genehmigt' ? 'status-angenommen' : 'status-offen'}">${z.status === 'genehmigt' ? 'Genehmigt' : 'Ausstehend'}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Approval list
    const approvalList = document.getElementById('approval-list-container');
    if (approvalList) {
        approvalList.innerHTML = DATA.zeiten.filter(z => z.status !== 'genehmigt').map(z => `
            <div class="approval-item">
                <div class="approval-name">${z.name}</div>
                <div class="approval-details">${z.total} · KW 09/2026</div>
                <div class="approval-actions">
                    <button class="btn btn-sm" style="background:rgba(16,185,129,0.15);color:var(--accent-green);border:1px solid rgba(16,185,129,0.3)" onclick="approveItem(this)">✓ Genehmigen</button>
                    <button class="btn btn-ghost btn-sm">Ablehnen</button>
                </div>
            </div>
        `).join('');
    }

    // Timer type buttons
    document.querySelectorAll('.ttb').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ttb').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

window.approveItem = function (btn) {
    const item = btn.closest('.approval-item');
    item.style.opacity = '0';
    setTimeout(() => item.remove(), 300);
};

// ============================================================
// KUNDEN
// ============================================================
function initKunden() {
    const grid = document.getElementById('kunden-grid');
    if (!grid) return;
    renderKunden(DATA.kunden, grid);

    const search = document.getElementById('kunde-search');
    if (search) {
        search.addEventListener('input', () => {
            const q = search.value.toLowerCase();
            const filtered = DATA.kunden.filter(k =>
                k.name.toLowerCase().includes(q) ||
                k.email.toLowerCase().includes(q) ||
                k.tel.includes(q)
            );
            renderKunden(filtered, grid);
        });
    }
}

function renderKunden(kunden, grid) {
    grid.innerHTML = kunden.map(k => `
        <div class="kunden-card">
            <div class="kc-top">
                <div class="kc-avatar">${k.initials}</div>
                <div>
                    <div class="kc-name">${k.name}</div>
                    <span class="kc-type kc-${k.type}">${k.typeLabel}</span>
                </div>
            </div>
            <div class="kc-info">
                <span>📧 ${k.email}</span>
                <span>📞 ${k.tel}</span>
            </div>
            <div class="kc-stat-row">
                <div><strong>${k.umsatz}</strong>Gesamtumsatz</div>
                <div><strong>${k.projekte} Projekte</strong></div>
            </div>
        </div>
    `).join('');
}

// ============================================================
// MITARBEITER
// ============================================================
function initMitarbeiter() {
    const grid = document.getElementById('mitarbeiter-grid');
    if (!grid) return;
    grid.innerHTML = DATA.mitarbeiter.map(m => `
        <div class="ma-card">
            <div class="ma-avatar">${m.initials}</div>
            <div class="ma-name">${m.name}</div>
            <div class="ma-role">${m.role}</div>
            <div class="ma-skills">
                ${m.skills.map(s => `<span class="ma-skill">${s}</span>`).join('')}
            </div>
            <div class="ma-avail ${m.avail}">${m.availLabel}</div>
        </div>
    `).join('');
}

// ============================================================
// RECHNUNGEN
// ============================================================
function initRechnungen() {
    const container = document.getElementById('offene-posten-list');
    if (!container) return;
    container.innerHTML = DATA.offenePosten.map(op => `
        <div class="op-item ${op.urgent ? 'op-urgent' : ''}">
            <span class="op-icon">${op.icon}</span>
            <div class="op-main">
                <div class="op-name">${op.name}</div>
                <div class="op-meta">${op.invoice} · <span class="${op.urgent ? 'op-days' : ''}">${op.days}</span></div>
            </div>
            <div class="${op.urgent ? 'op-amount red' : 'op-amount'}">${op.amount}</div>
            <div class="op-action">
                <button class="btn btn-sm btn-outline">Mahnen</button>
            </div>
        </div>
    `).join('');
}

// ============================================================
// LEISTUNGEN
// ============================================================
function initLeistungen() {
    const grid = document.getElementById('leistungen-grid');
    if (!grid) return;
    grid.innerHTML = DATA.leistungen.map(l => `
        <div class="leistung-card">
            <div class="lk-category">${l.category}</div>
            <div class="lk-name">${l.name}</div>
            <div class="lk-desc">${l.desc}</div>
            <div class="lk-price-row">
                <div class="lk-price">${l.price}</div>
                <div class="lk-unit">${l.unit}</div>
            </div>
        </div>
    `).join('');
}

// ============================================================
// QUICK CREATE MODAL
// ============================================================
const quickCreateBtn = document.getElementById('quick-create-btn');
const quickModal = document.getElementById('quick-modal');
const closeQuickModalBtn = document.getElementById('close-quick-modal');

if (quickCreateBtn) quickCreateBtn.addEventListener('click', () => quickModal.classList.remove('hidden'));
if (closeQuickModalBtn) closeQuickModalBtn.addEventListener('click', closeQuickModal);
if (quickModal) quickModal.addEventListener('click', (e) => { if (e.target === quickModal) closeQuickModal(); });
function closeQuickModal() { quickModal.classList.add('hidden'); }

// ============================================================
// GLOBAL SEARCH
// ============================================================
const globalSearch = document.getElementById('global-search');
if (globalSearch) {
    globalSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const q = globalSearch.value.toLowerCase();
            if (q.includes('angebot')) navigateTo('angebote');
            else if (q.includes('rechnung')) navigateTo('rechnungen');
            else if (q.includes('projekt')) navigateTo('projekte');
            else if (q.includes('kunde')) navigateTo('kunden');
            else if (q.includes('mitarbeiter') || q.includes('team')) navigateTo('mitarbeiter');
            else if (q.includes('zeit')) navigateTo('zeiten');
            globalSearch.value = '';
        }
    });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initAngebote();
    initProjects();
    initPlantafel();
    initZeiten();
    initKunden();
    initMitarbeiter();
    initRechnungen();
    initLeistungen();
});

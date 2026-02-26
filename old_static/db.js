/* ============ DATA LAYER ============ */
const DB = {
    get(k) { try { return JSON.parse(localStorage.getItem('hwp_' + k)) || null; } catch (e) { return null; } },
    set(k, v) { localStorage.setItem('hwp_' + k, JSON.stringify(v)); },

    kunden() { return this.get('kunden') || []; },
    mitarbeiter() { return this.get('mitarbeiter') || []; },
    projekte() { return this.get('projekte') || []; },
    dokumente() { return this.get('dokumente') || []; },
    zeiten() { return this.get('zeiten') || []; },
    leistungen() { return this.get('leistungen') || []; },
    mahnungen() { return this.get('mahnungen') || []; },

    saveKunden(d) { this.set('kunden', d); },
    saveMitarbeiter(d) { this.set('mitarbeiter', d); },
    saveProjekte(d) { this.set('projekte', d); },
    saveDokumente(d) { this.set('dokumente', d); },
    saveZeiten(d) { this.set('zeiten', d); },
    saveLeistungen(d) { this.set('leistungen', d); },
    saveMahnungen(d) { this.set('mahnungen', d); },

    nextId(list) { return list.length ? Math.max(...list.map(x => x.id || 0)) + 1 : 1; },
};

/* ============ SEED DATA ============ */
function seed() {
    if (DB.get('seeded')) return;

    const kunden = [
        { id: 1, name: 'Müller GmbH', type: 'Gewerblich', email: 'info@mueller.de', tel: '06221/48200', address: 'Hauptstraße 12, 69115 Heidelberg', zahlungsziel: 30, kreditlimit: 50000, notes: 'Stammkunde seit 2018' },
        { id: 2, name: 'Schäfer KG', type: 'Gewerblich', email: 'kontakt@schaefer-kg.de', tel: '06221/33100', address: 'Industrieweg 5, 69120 Heidelberg', zahlungsziel: 14, kreditlimit: 20000, notes: '' },
        { id: 3, name: 'Weber Immobilien', type: 'Gewerblich', email: 'info@weber-immo.de', tel: '06222/55800', address: 'Römerstraße 8, 69151 Neckargemünd', zahlungsziel: 30, kreditlimit: 30000, notes: '' },
        { id: 4, name: 'Max Mustermann', type: 'Privat', email: 'max@gmail.com', tel: '0176/12345678', address: 'Gartenweg 3, 69124 Heidelberg', zahlungsziel: 14, kreditlimit: 5000, notes: '' },
        { id: 5, name: 'Hoffmann Verwaltung', type: 'Stammkunde', email: 'info@hoffmann-vw.de', tel: '06221/72900', address: 'Schillerstraße 20, 69115 Heidelberg', zahlungsziel: 14, kreditlimit: 25000, notes: 'Jahresvertrag' },
    ];

    const mitarbeiter = [
        { id: 1, vorname: 'Klaus', nachname: 'Weber', rolle: 'Geselle', stunde: 45, email: 'k.weber@firma.de', tel: '0152/11111', skills: ['Malerei', 'Tapezieren'], color: '#3b82f6' },
        { id: 2, vorname: 'Markus', nachname: 'Schulz', rolle: 'Bauleiter', stunde: 55, email: 'm.schulz@firma.de', tel: '0152/22222', skills: ['Fassade', 'Spachtel'], color: '#10b981' },
        { id: 3, vorname: 'Anna', nachname: 'Fischer', rolle: 'Gesellin', stunde: 42, email: 'a.fischer@firma.de', tel: '0152/33333', skills: ['Tapezieren', 'Dekor'], color: '#8b5cf6' },
        { id: 4, vorname: 'Robert', nachname: 'Braun', rolle: 'Geselle', stunde: 44, email: 'r.braun@firma.de', tel: '0152/44444', skills: ['Malerei', 'Grundierung'], color: '#f59e0b' },
        { id: 5, vorname: 'Brigitte', nachname: 'Koch', rolle: 'Bürokraft', stunde: 35, email: 'b.koch@firma.de', tel: '0152/55555', skills: ['Buchhaltung'], color: '#ec4899' },
    ];

    const projekte = [
        { id: 1, name: 'Kirchgasse 3 – Malerarbeiten', kundeId: 4, address: 'Kirchgasse 3, 69115 Heidelberg', status: 'Aktiv', start: '2026-02-10', end: '2026-03-15', budget: 12400, progress: 65, team: [1, 4], notes: 'Schlüssel beim Kunden vor Ort', color: '#3b82f6' },
        { id: 2, name: 'Müller GmbH Fassade', kundeId: 1, address: 'Hauptstraße 12, 69115 Heidelberg', status: 'Aktiv', start: '2026-02-01', end: '2026-04-30', budget: 24800, progress: 40, team: [2], notes: 'Gerüst bereits aufgestellt', color: '#10b981' },
        { id: 3, name: 'Schäfer KG Innenarbeiten', kundeId: 2, address: 'Industrieweg 5, 69120 Heidelberg', status: 'Planung', start: '2026-03-01', end: '2026-03-31', budget: 8600, progress: 0, team: [3], notes: '', color: '#8b5cf6' },
        { id: 4, name: 'Hoffmann Bürosanierung', kundeId: 5, address: 'Schillerstraße 20, 69115 Heidelberg', status: 'Abgeschlossen', start: '2026-01-05', end: '2026-02-20', budget: 15200, progress: 100, team: [1, 2], notes: 'Abgenommen am 20.02.2026', color: '#6b7280' },
    ];

    const today = new Date();
    const fmt = d => d.toISOString().split('T')[0];
    const ago = n => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };
    const plus = n => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d); };

    const dokumente = [
        { id: 1, nr: 'AN-2026-0140', type: 'Angebot', kundeId: 1, projektId: 2, date: ago(20), due: plus(10), positions: [{ desc: 'Fassadenanstrich 2-fach', qty: 300, unit: 'm²', price: 18, total: 5400 }, { desc: 'Grundierung', qty: 300, unit: 'm²', price: 4.5, total: 1350 }], netto: 6750, tax: 19, discount: 0, brutto: 8032.50, notes: 'Zahlbar in 14 Tagen.', status: 'Angenommen', zahlungEingegangen: 0, mahnStufe: 0, mahnDaten: [] },
        { id: 2, nr: 'RE-2026-0085', type: 'Rechnung', kundeId: 1, projektId: 2, date: ago(45), due: ago(15), positions: [{ desc: 'Vorauszahlung Fassade 50%', qty: 1, unit: 'pauschal', price: 4016.25, total: 4016.25 }], netto: 4016.25, tax: 19, discount: 0, brutto: 4779.34, notes: '', status: 'Überfällig', zahlungEingegangen: 0, mahnStufe: 1, mahnDaten: [{ stufe: 1, datum: ago(7), betrag: 4779.34 }] },
        { id: 3, nr: 'RE-2026-0086', type: 'Rechnung', kundeId: 4, projektId: 1, date: ago(30), due: ago(16), positions: [{ desc: 'Malerarbeiten Wohnzimmer', qty: 45, unit: 'm²', price: 12.5, total: 562.5 }, { desc: 'Deckenanstrich', qty: 22, unit: 'm²', price: 14.8, total: 325.6 }], netto: 888.10, tax: 19, discount: 0, brutto: 1056.84, notes: '', status: 'Überfällig', zahlungEingegangen: 0, mahnStufe: 2, mahnDaten: [{ stufe: 1, datum: ago(10), betrag: 1056.84 }, { stufe: 2, datum: ago(3), betrag: 1056.84 }] },
        { id: 4, nr: 'RE-2026-0087', type: 'Rechnung', kundeId: 5, projektId: 4, date: ago(25), due: plus(5), positions: [{ desc: 'Bürosanierung komplett', qty: 1, unit: 'pauschal', price: 15200, total: 15200 }], netto: 15200, tax: 19, discount: 0, brutto: 18088, notes: '', status: 'Offen', zahlungEingegangen: 0, mahnStufe: 0, mahnDaten: [] },
        { id: 5, nr: 'AN-2026-0141', type: 'Angebot', kundeId: 2, projektId: 3, date: ago(5), due: plus(25), positions: [{ desc: 'Innenmalerei komplett', qty: 180, unit: 'm²', price: 12.5, total: 2250 }, { desc: 'Tapezieren Büro', qty: 60, unit: 'm²', price: 9.8, total: 588 }], netto: 2838, tax: 19, discount: 5, brutto: 3219.99, notes: '5% Rabatt für Stammkunden.', status: 'Offen', zahlungEingegangen: 0, mahnStufe: 0, mahnDaten: [] },
        { id: 6, nr: 'RE-2026-0088', type: 'Rechnung', kundeId: 1, projektId: null, date: ago(60), due: ago(46), positions: [{ desc: 'Altauftrag Malerarbeiten', qty: 1, unit: 'pauschal', price: 3200, total: 3200 }], netto: 3200, tax: 19, discount: 0, brutto: 3808, notes: '', status: 'Bezahlt', zahlungEingegangen: 3808, mahnStufe: 0, mahnDaten: [] },
    ];

    const leistungen = [
        { id: 1, name: 'Wandanstrich 2-fach', cat: 'Malerei Innen', unit: 'm²', price: 12.50, desc: 'Deckweißanstrich auf Putz, 2 Lagen' },
        { id: 2, name: 'Deckenanstrich', cat: 'Malerei Innen', unit: 'm²', price: 14.80, desc: 'Weißanstrich Deckenfläche inkl. Abkleben' },
        { id: 3, name: 'Fassadenanstrich 2-fach', cat: 'Fassade', unit: 'm²', price: 18.00, desc: 'Silikatfarbe auf Außenputz' },
        { id: 4, name: 'Fassadengrundierung', cat: 'Fassade', unit: 'm²', price: 6.50, desc: 'Grundierungsanstrich vor Farbauftrag' },
        { id: 5, name: 'Tapezieren (Raufaser)', cat: 'Tapezieren', unit: 'm²', price: 9.80, desc: 'Raufasertapete kleben und grundieren' },
        { id: 6, name: 'Glattzug Wand', cat: 'Spachtelarbeiten', unit: 'm²', price: 16.20, desc: 'Feinspachtelung auf Putz, schleifbereit' },
        { id: 7, name: 'Gerüststellung', cat: 'Sonstiges', unit: 'pauschal', price: 1200, desc: 'Aufbau und Abbau inkl. Vorhaltung 4 Wochen' },
        { id: 8, name: 'Stundenlohnarbeit', cat: 'Sonstiges', unit: 'Std.', price: 65, desc: 'Regieleistung nach tatsächlichem Aufwand' },
    ];

    const zeiten = [
        { id: 1, maId: 1, projektId: 1, datum: ago(1), typ: 'Arbeit', von: '07:00', bis: '15:30', dauer: 8.5, beschr: 'Wohnzimmer grundiert', status: 'Offen' },
        { id: 2, maId: 2, projektId: 2, datum: ago(1), typ: 'Arbeit', von: '07:30', bis: '16:00', dauer: 8.5, beschr: 'Fassade Ostseite', status: 'Genehmigt' },
        { id: 3, maId: 1, projektId: 1, datum: ago(2), typ: 'Arbeit', von: '07:00', bis: '15:00', dauer: 8, beschr: 'Schlafzimmer 1. Anstrich', status: 'Offen' },
        { id: 4, maId: 3, projektId: 1, datum: ago(2), typ: 'Fahrt', von: '06:30', bis: '07:00', dauer: 0.5, beschr: 'Anfahrt Kirchgasse', status: 'Offen' },
        { id: 5, maId: 4, projektId: 2, datum: ago(3), typ: 'Arbeit', von: '07:00', bis: '16:00', dauer: 9, beschr: 'Grundierung Westseite', status: 'Genehmigt' },
    ];

    DB.saveKunden(kunden);
    DB.saveMitarbeiter(mitarbeiter);
    DB.saveProjekte(projekte);
    DB.saveDokumente(dokumente);
    DB.saveLeistungen(leistungen);
    DB.saveZeiten(zeiten);
    DB.saveMahnungen([]);
    DB.set('seeded', true);
}

seed();

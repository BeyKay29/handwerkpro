import { Customer, Employee, Project, Invoice, TimeEntry, CatalogItem, DocumentItem } from "@/types";

function ago(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
}
function plus(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
}

export const mockCustomers: Customer[] = [
    { id: "c1", company_id: "co1", name: "Müller GmbH", type: "Gewerblich", contact_person: "Hans Müller", email: "info@mueller.de", phone: "06221/48200", address: "Hauptstrasse 12, 69115 Heidelberg", notes: "Stammkunde seit 2018", created_at: ago(400) },
    { id: "c2", company_id: "co1", name: "Schäfer KG", type: "Gewerblich", contact_person: "Dr. Schäfer", email: "kontakt@schaefer-kg.de", phone: "06221/33100", address: "Industrieweg 5, 69120 Heidelberg", created_at: ago(200) },
    { id: "c3", company_id: "co1", name: "Weber Immobilien", type: "Gewerblich", contact_person: "Petra Weber", email: "info@weber-immo.de", phone: "06222/55800", address: "Römerstrasse 8, 69151 Neckargemünd", created_at: ago(150) },
    { id: "c4", company_id: "co1", name: "Max Mustermann", type: "Privat", contact_person: "Max Mustermann", email: "max@gmail.com", phone: "0176/12345678", address: "Gartenweg 3, 69124 Heidelberg", created_at: ago(90) },
    { id: "c5", company_id: "co1", name: "Hoffmann Verwaltung", type: "Stammkunde", contact_person: "H. Hoffmann", email: "info@hoffmann-vw.de", phone: "06221/72900", address: "Schillerstrasse 20, 69115 Heidelberg", notes: "Jahresvertrag", created_at: ago(500) },
];

export const mockEmployees: Employee[] = [
    { id: "e1", company_id: "co1", first_name: "Klaus", last_name: "Weber", role: "Geselle", hourly_rate: 45, email: "k.weber@firma.de", password: "password123", phone: "0152/11111", skills: ["Malerei", "Tapezieren"], color: "#3b82f6", is_active: true, created_at: ago(600) },
    { id: "e2", company_id: "co1", first_name: "Markus", last_name: "Schulz", role: "Bauleiter", hourly_rate: 55, email: "m.schulz@firma.de", password: "password123", phone: "0152/22222", skills: ["Fassade", "Spachtel"], color: "#10b981", is_active: true, created_at: ago(500) },
    { id: "e3", company_id: "co1", first_name: "Anna", last_name: "Fischer", role: "Gesellin", hourly_rate: 42, email: "a.fischer@firma.de", password: "password123", phone: "0152/33333", skills: ["Tapezieren", "Dekor"], color: "#8b5cf6", is_active: true, created_at: ago(300) },
    { id: "e4", company_id: "co1", first_name: "Robert", last_name: "Braun", role: "Geselle", hourly_rate: 44, email: "r.braun@firma.de", password: "password123", phone: "0152/44444", skills: ["Malerei", "Grundierung"], color: "#f59e0b", is_active: true, created_at: ago(250) },
    { id: "e5", company_id: "co1", first_name: "Brigitte", last_name: "Koch", role: "Bürokraft", hourly_rate: 35, email: "b.koch@firma.de", password: "password123", phone: "0152/55555", skills: ["Buchhaltung"], color: "#ec4899", is_active: true, created_at: ago(400) },
];

export const mockProjects: Project[] = [
    { id: "p1", company_id: "co1", customer_id: "c4", name: "Kirchgasse 3 – Malerarbeiten", address: "Kirchgasse 3, 69115 Heidelberg", status: "aktiv", budget: 12400, progress: 65, start_date: ago(16), end_date: plus(17), color: "#3b82f6", team: ["e1", "e4"], notes: "Schlussel beim Kunden vor Ort", created_at: ago(16) },
    { id: "p2", company_id: "co1", customer_id: "c1", name: "Muller GmbH Fassade", address: "Hauptstrasse 12, 69115 Heidelberg", status: "aktiv", budget: 24800, progress: 40, start_date: ago(25), end_date: plus(63), color: "#10b981", team: ["e2"], notes: "Gerust bereits aufgestellt", created_at: ago(25) },
    { id: "p3", company_id: "co1", customer_id: "c2", name: "Schafer KG Innenarbeiten", address: "Industrieweg 5, 69120 Heidelberg", status: "planung", budget: 8600, progress: 0, start_date: plus(3), end_date: plus(33), color: "#8b5cf6", team: ["e3"], created_at: ago(5) },
    { id: "p4", company_id: "co1", customer_id: "c5", name: "Hoffmann Burosanierung", address: "Schillerstrasse 20, 69115 Heidelberg", status: "abgeschlossen", budget: 15200, progress: 100, start_date: ago(52), end_date: ago(6), color: "#6b7280", team: ["e1", "e2"], notes: "Abgenommen am 20.02.2026", created_at: ago(52) },
];

export const mockInvoices: Invoice[] = [
    { id: "d1", company_id: "co1", customer_id: "c1", project_id: "p2", doc_type: "angebot", doc_number: "AN-2026-0140", status: "angenommen", date: ago(20), due_date: plus(10), tax_rate: 19, discount_rate: 0, subtotal: 6750, tax_amount: 1282.50, total_amount: 8032.50, paid_amount: 0, dunning_level: 0, items: [{ description: "Fassadenanstrich 2-fach", quantity: 300, unit: "m2", unit_price: 18, total: 5400, sort_order: 1 }, { description: "Grundierung", quantity: 300, unit: "m2", unit_price: 4.50, total: 1350, sort_order: 2 }], notes: "Zahlbar in 14 Tagen.", created_at: ago(20) },
    { id: "d2", company_id: "co1", customer_id: "c1", project_id: "p2", doc_type: "rechnung", doc_number: "RE-2026-0085", status: "ueberfaellig", date: ago(45), due_date: ago(15), tax_rate: 19, discount_rate: 0, subtotal: 4016.25, tax_amount: 763.09, total_amount: 4779.34, paid_amount: 0, dunning_level: 1, items: [{ description: "Vorauszahlung Fassade 50%", quantity: 1, unit: "pauschal", unit_price: 4016.25, total: 4016.25, sort_order: 1 }], created_at: ago(45) },
    { id: "d3", company_id: "co1", customer_id: "c4", project_id: "p1", doc_type: "rechnung", doc_number: "RE-2026-0086", status: "ueberfaellig", date: ago(30), due_date: ago(16), tax_rate: 19, discount_rate: 0, subtotal: 888.10, tax_amount: 168.74, total_amount: 1056.84, paid_amount: 0, dunning_level: 2, items: [{ description: "Malerarbeiten Wohnzimmer", quantity: 45, unit: "m2", unit_price: 12.50, total: 562.50, sort_order: 1 }, { description: "Deckenanstrich", quantity: 22, unit: "m2", unit_price: 14.80, total: 325.60, sort_order: 2 }], created_at: ago(30) },
    { id: "d4", company_id: "co1", customer_id: "c5", project_id: "p4", doc_type: "rechnung", doc_number: "RE-2026-0087", status: "offen", date: ago(25), due_date: plus(5), tax_rate: 19, discount_rate: 0, subtotal: 15200, tax_amount: 2888, total_amount: 18088, paid_amount: 0, dunning_level: 0, items: [{ description: "Burosanierung komplett", quantity: 1, unit: "pauschal", unit_price: 15200, total: 15200, sort_order: 1 }], created_at: ago(25) },
    { id: "d5", company_id: "co1", customer_id: "c2", project_id: "p3", doc_type: "angebot", doc_number: "AN-2026-0141", status: "offen", date: ago(5), due_date: plus(25), tax_rate: 19, discount_rate: 5, subtotal: 2838, tax_amount: 512.01, total_amount: 3219.99, paid_amount: 0, dunning_level: 0, items: [{ description: "Innenmalerei komplett", quantity: 180, unit: "m2", unit_price: 12.50, total: 2250, sort_order: 1 }, { description: "Tapezieren Buro", quantity: 60, unit: "m2", unit_price: 9.80, total: 588, sort_order: 2 }], notes: "5% Rabatt fur Stammkunden.", created_at: ago(5) },
    { id: "d6", company_id: "co1", customer_id: "c1", doc_type: "rechnung", doc_number: "RE-2026-0088", status: "bezahlt", date: ago(60), due_date: ago(46), tax_rate: 19, discount_rate: 0, subtotal: 3200, tax_amount: 608, total_amount: 3808, paid_amount: 3808, dunning_level: 0, items: [{ description: "Altauftrag Malerarbeiten", quantity: 1, unit: "pauschal", unit_price: 3200, total: 3200, sort_order: 1 }], created_at: ago(60) },
];

export const mockTimeEntries: TimeEntry[] = [
    { id: "t1", company_id: "co1", employee_id: "e1", project_id: "p1", date: ago(1), start_time: "07:00", end_time: "15:30", duration: 8.5, type: "arbeit", description: "Wohnzimmer grundiert", is_approved: false, created_at: ago(1) },
    { id: "t2", company_id: "co1", employee_id: "e2", project_id: "p2", date: ago(1), start_time: "07:30", end_time: "16:00", duration: 8.5, type: "arbeit", description: "Fassade Ostseite", is_approved: true, created_at: ago(1) },
    { id: "t3", company_id: "co1", employee_id: "e1", project_id: "p1", date: ago(2), start_time: "07:00", end_time: "15:00", duration: 8, type: "arbeit", description: "Schlafzimmer 1. Anstrich", is_approved: false, created_at: ago(2) },
    { id: "t4", company_id: "co1", employee_id: "e3", project_id: "p1", date: ago(2), start_time: "06:30", end_time: "07:00", duration: 0.5, type: "fahrt", description: "Anfahrt Kirchgasse", is_approved: false, created_at: ago(2) },
    { id: "t5", company_id: "co1", employee_id: "e4", project_id: "p2", date: ago(3), start_time: "07:00", end_time: "16:00", duration: 9, type: "arbeit", description: "Grundierung Westseite", is_approved: true, created_at: ago(3) },
];

export const mockCatalog: CatalogItem[] = [
    { id: "cat1", company_id: "co1", name: "Wandanstrich 2-fach", category: "Malerei Innen", unit: "m2", price: 12.50, description: "Deckweissanstrich auf Putz, 2 Lagen", created_at: ago(200) },
    { id: "cat2", company_id: "co1", name: "Deckenanstrich", category: "Malerei Innen", unit: "m2", price: 14.80, description: "Weissanstrich Deckenflache inkl. Abkleben", created_at: ago(200) },
    { id: "cat3", company_id: "co1", name: "Fassadenanstrich 2-fach", category: "Fassade", unit: "m2", price: 18.00, description: "Silikatfarbe auf Aussenputz", created_at: ago(200) },
    { id: "cat4", company_id: "co1", name: "Fassadengrundierung", category: "Fassade", unit: "m2", price: 6.50, description: "Grundierungsanstrich vor Farbauftrag", created_at: ago(200) },
    { id: "cat5", company_id: "co1", name: "Tapezieren (Raufaser)", category: "Tapezieren", unit: "m2", price: 9.80, description: "Raufasertapete kleben und grundieren", created_at: ago(200) },
    { id: "cat6", company_id: "co1", name: "Glattzug Wand", category: "Spachtelarbeiten", unit: "m2", price: 16.20, description: "Feinspachtelung auf Putz, schleifbereit", created_at: ago(200) },
    { id: "cat7", company_id: "co1", name: "Geruststellung", category: "Sonstiges", unit: "pauschal", price: 1200, description: "Aufbau und Abbau inkl. Vorhaltung 4 Wochen", created_at: ago(200) },
    { id: "cat8", company_id: "co1", name: "Stundenlohnarbeit", category: "Sonstiges", unit: "Std.", price: 65, description: "Regieleistung nach tatsachlichem Aufwand", created_at: ago(200) },
];

import { Customer, Employee, Project, Invoice, TimeEntry, CatalogItem, LeaveRequest } from "@/types";

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
    { id: "c1", company_id: "co1", name: "Müller Bau GmbH", type: "Gewerblich", contact_person: "Hans Müller", email: "info@mueller-bau.de", phone: "06221/48200", address: "Hauptstraße 12, 69115 Heidelberg", notes: "Stammkunde seit 2018", created_at: ago(400) },
    { id: "c2", company_id: "co1", name: "Schäfer Industrietechnik", type: "Gewerblich", contact_person: "Dr. Thomas Schäfer", email: "kontakt@schaefer-industrie.de", phone: "06221/33100", address: "Industrieweg 5, 69120 Heidelberg", created_at: ago(200) },
    { id: "c3", company_id: "co1", name: "Weber Immobilienverwaltung", type: "Gewerblich", contact_person: "Petra Weber", email: "p.weber@weber-immo.de", phone: "06222/55800", address: "Römerstraße 8, 69151 Neckargemünd", created_at: ago(150) },
    { id: "c4", company_id: "co1", name: "Privatkunde Schmidt", type: "Privat", contact_person: "Christian Schmidt", email: "c.schmidt@privat.de", phone: "0176/12345678", address: "Gartenweg 3, 69124 Heidelberg", created_at: ago(90) },
    { id: "c5", company_id: "co1", name: "Hausverwaltung Hoffmann", type: "Stammkunde", contact_person: "Helmut Hoffmann", email: "info@hoffmann-hv.de", phone: "06221/72900", address: "Schillerstraße 20, 69115 Heidelberg", notes: "Wartungsvertrag vorhanden", created_at: ago(500) },
];

export const mockEmployees: Employee[] = [
    { id: "e1", company_id: "co1", first_name: "Klaus", last_name: "Weber", role: "Geselle", hourly_rate: 45, email: "k.weber@firma.de", password: "password123", phone: "0152/11111", skills: ["Malerarbeiten", "Tapezieren"], color: "#3b82f6", is_active: true, created_at: ago(600) },
    { id: "e2", company_id: "co1", first_name: "Markus", last_name: "Schulz", role: "Admin", hourly_rate: 55, email: "m.schulz@firma.de", password: "password123", phone: "0152/22222", skills: ["Projektleitung", "Bauleitung"], color: "#10b981", is_active: true, created_at: ago(500) },
    { id: "e3", company_id: "co1", first_name: "Lukas", last_name: "Weber", role: "Geselle", hourly_rate: 42, email: "l.weber@firma.de", password: "password123", phone: "0152/33333", skills: ["Trockenbau", "Spachtelarbeiten"], color: "#8b5cf6", is_active: true, created_at: ago(300) },
    { id: "e4", company_id: "co1", first_name: "Robert", last_name: "Braun", role: "Geselle", hourly_rate: 44, email: "r.braun@firma.de", password: "password123", phone: "0152/44444", skills: ["Malerarbeiten", "Fassade"], color: "#f59e0b", is_active: true, created_at: ago(250) },
    { id: "e5", company_id: "co1", first_name: "Brigitte", last_name: "Koch", role: "Backoffice", hourly_rate: 38, email: "b.koch@firma.de", password: "password123", phone: "0152/55555", skills: ["Buchhaltung", "Office"], color: "#ec4899", is_active: true, created_at: ago(400) },
];

export const mockProjects: Project[] = [
    { id: "p1", company_id: "co1", customer_id: "c4", name: "Sanierung EFH Schmidt", address: "Gartenweg 3, 69124 Heidelberg", status: "aktiv", budget: 12400, progress: 65, start_date: ago(16), end_date: plus(17), color: "#3b82f6", team: ["e1", "e4"], notes: "Zutritt über Garagentor", created_at: ago(16) },
    { id: "p2", company_id: "co1", customer_id: "c1", name: "Fassadensanierung Müller Bau", address: "Hauptstraße 12, 69115 Heidelberg", status: "aktiv", budget: 24800, progress: 40, start_date: ago(25), end_date: plus(63), color: "#10b981", team: ["e2", "e4"], notes: "Gerüststellung erfolgt", created_at: ago(25) },
    { id: "p3", company_id: "co1", customer_id: "c2", name: "Innenausbau Büro Schäfer", address: "Industrieweg 5, 69120 Heidelberg", status: "planung", budget: 8600, progress: 0, start_date: plus(3), end_date: plus(33), color: "#8b5cf6", team: ["e3"], created_at: ago(5) },
    { id: "p4", company_id: "co1", customer_id: "c5", name: "Renovierung Treppenhaus Hoffmann", address: "Schillerstraße 20, 69115 Heidelberg", status: "abgeschlossen", budget: 15200, progress: 100, start_date: ago(52), end_date: ago(6), color: "#6b7280", team: ["e1", "e2"], notes: "Abnahme ohne Mängel erfolgt", created_at: ago(52) },
];

export const mockInvoices: Invoice[] = [
    { id: "d1", company_id: "co1", customer_id: "c1", project_id: "p2", doc_type: "angebot", doc_number: "AN-2026-0140", status: "angenommen", date: ago(20), due_date: plus(10), tax_rate: 19, discount_rate: 0, subtotal: 6750, tax_amount: 1282.50, total_amount: 8032.50, paid_amount: 0, dunning_level: 0, items: [{ description: "Fassadenanstrich 2-fach", quantity: 300, unit: "m2", unit_price: 18, total: 5400, sort_order: 1 }, { description: "Grundierung", quantity: 300, unit: "m2", unit_price: 4.50, total: 1350, sort_order: 2 }], notes: "Gültig bis 30 Tage nach Ausstellungsdatum.", created_at: ago(20) },
    { id: "d2", company_id: "co1", customer_id: "c1", project_id: "p2", doc_type: "rechnung", doc_number: "RE-2026-0085", status: "ueberfaellig", date: ago(45), due_date: ago(15), tax_rate: 19, discount_rate: 0, subtotal: 4016.25, tax_amount: 763.09, total_amount: 4779.34, paid_amount: 0, dunning_level: 1, items: [{ description: "Abschlagsrechnung Fassade 50%", quantity: 1, unit: "pauschal", unit_price: 4016.25, total: 4016.25, sort_order: 1 }], created_at: ago(45) },
    { id: "d3", company_id: "co1", customer_id: "c4", project_id: "p1", doc_type: "rechnung", doc_number: "RE-2026-0086", status: "ueberfaellig", date: ago(30), due_date: ago(16), tax_rate: 19, discount_rate: 0, subtotal: 888.10, tax_amount: 168.74, total_amount: 1056.84, paid_amount: 0, dunning_level: 2, items: [{ description: "Malerarbeiten Wohnzimmer", quantity: 45, unit: "m2", unit_price: 12.50, total: 562.50, sort_order: 1 }, { description: "Deckenanstrich", quantity: 22, unit: "m2", unit_price: 14.80, total: 325.60, sort_order: 2 }], created_at: ago(30) },
    { id: "d4", company_id: "co1", customer_id: "c5", project_id: "p4", doc_type: "rechnung", doc_number: "RE-2026-0087", status: "offen", date: ago(25), due_date: plus(5), tax_rate: 19, discount_rate: 0, subtotal: 15200, tax_amount: 2888, total_amount: 18088, paid_amount: 0, dunning_level: 0, items: [{ description: "Komplettrenovierung", quantity: 1, unit: "pauschal", unit_price: 15200, total: 15200, sort_order: 1 }], created_at: ago(25) },
];

export const mockTimeEntries: TimeEntry[] = [
    { id: "t1", company_id: "co1", employee_id: "e1", project_id: "p1", date: ago(1), start_time: "07:00", end_time: "15:30", pause_minutes: 30, duration: 8, type: "arbeit", description: "Wandflächen vorbereitet", is_approved: false, created_at: ago(1) },
    { id: "t2", company_id: "co1", employee_id: "e2", project_id: "p2", date: ago(1), start_time: "07:30", end_time: "16:00", pause_minutes: 45, duration: 7.75, type: "arbeit", description: "Bauüberwachung Fassade", is_approved: true, created_at: ago(1) },
    { id: "t3", company_id: "co1", employee_id: "e1", project_id: "p1", date: ago(2), start_time: "07:00", end_time: "15:00", pause_minutes: 30, duration: 7.5, type: "arbeit", description: "Grundierungsarbeiten", is_approved: false, created_at: ago(2) },
    { id: "t4", company_id: "co1", employee_id: "e3", project_id: "p1", date: ago(2), start_time: "07:00", end_time: "16:00", pause_minutes: 30, duration: 8.5, type: "arbeit", description: "Trockenbauarbeiten Zimmer 2", is_approved: true, created_at: ago(2) },
    { id: "t5", company_id: "co1", employee_id: "e4", project_id: "p2", date: ago(3), start_time: "06:30", end_time: "15:00", pause_minutes: 30, duration: 8, type: "arbeit", description: "Fassadenabschnitt A", is_approved: false, created_at: ago(3) },
    { id: "t6", company_id: "co1", employee_id: "e5", project_id: undefined, date: ago(1), start_time: "08:00", end_time: "17:00", pause_minutes: 60, duration: 8, type: "arbeit", description: "Rechnungsbearbeitung", is_approved: true, created_at: ago(1) },
    { id: "t7", company_id: "co1", employee_id: "e3", project_id: "p3", date: ago(4), start_time: "07:00", end_time: "14:30", pause_minutes: 30, duration: 7, type: "fahrt", description: "Materialanlieferung", is_approved: true, created_at: ago(4) },
    { id: "t8", company_id: "co1", employee_id: "e1", project_id: "p1", date: ago(5), start_time: "07:00", end_time: "15:30", pause_minutes: 30, duration: 8, type: "arbeit", description: "Deckenanstrich Bad/Küche", is_approved: true, created_at: ago(5) },
    { id: "t9", company_id: "co1", employee_id: "e4", project_id: undefined, date: ago(4), start_time: "08:00", end_time: "12:00", pause_minutes: 0, duration: 4, type: "schulung", description: "Arbeitssicherheit Schulung", is_approved: true, created_at: ago(4) },
    { id: "t10", company_id: "co1", employee_id: "e3", project_id: "p2", date: ago(3), start_time: "07:00", end_time: "11:00", pause_minutes: 0, duration: 4, type: "schlechtwetter", description: "Regen, Baustelle nicht begehbar", is_approved: true, created_at: ago(3) },
];

export const mockLeaveRequests: LeaveRequest[] = [
    { id: "lr1", company_id: "co1", employee_id: "e1", type: "urlaub", status: "beantragt", start_date: plus(7), end_date: plus(14), days: 6, reason: "Familienurlaub Mallorca", created_at: ago(3) },
    { id: "lr2", company_id: "co1", employee_id: "e3", type: "urlaub", status: "genehmigt", start_date: plus(21), end_date: plus(25), days: 4, reason: "Kurzurlaub", admin_note: "Genehmigt – bitte vorher Aufgaben an Klaus Weber übergeben.", approved_by: "e2", created_at: ago(5) },
    { id: "lr3", company_id: "co1", employee_id: "e4", type: "krankheit", status: "genehmigt", start_date: ago(5), end_date: ago(3), days: 3, reason: "Grippaler Infekt, Attest liegt vor", admin_note: "Gute Besserung! KV-Bescheinigung bitte einreichen.", approved_by: "e2", created_at: ago(5) },
    { id: "lr4", company_id: "co1", employee_id: "e5", type: "sonderurlaub", status: "beantragt", start_date: plus(3), end_date: plus(3), days: 1, reason: "Arzttermin Facharzt", created_at: ago(1) },
    { id: "lr5", company_id: "co1", employee_id: "e1", type: "freizeitausgleich", status: "abgelehnt", start_date: plus(2), end_date: plus(2), days: 1, reason: "Überstunden Ausgleich", admin_note: "Leider nicht möglich – Baustelle Schmidt läuft noch bis Ende des Monats.", approved_by: "e2", created_at: ago(2) },
];

export const mockCatalog: CatalogItem[] = [
    { id: "cat1", company_id: "co1", name: "Innenanstrich (Standard)", category: "Malerei Innen", unit: "m2", price: 12.50, description: "Deckweißanstrich auf Putz", created_at: ago(200) },
    { id: "cat2", company_id: "co1", name: "Lackierarbeiten Türen", category: "Malerei Innen", unit: "Stück", price: 85.00, description: "Türblatt und Zarge lackieren", created_at: ago(200) },
    { id: "cat3", company_id: "co1", name: "Fassadenbeschichtung", category: "Fassade", unit: "m2", price: 21.00, description: "Silikonharzfarbe auf Außenputz", created_at: ago(200) },
    { id: "cat4", company_id: "co1", name: "Spachtelarbeiten Q3", category: "Trockenbau", unit: "m2", price: 14.50, description: "Oberflächengüte Q3 spachteln", created_at: ago(200) },
];

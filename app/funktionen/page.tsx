"use client";

import { useState } from "react";
import Link from "next/link";
import {
    FileText, AlertTriangle, Briefcase, CalendarRange,
    Clock, Users, Wrench, BarChart3, ArrowRight, ArrowLeft,
    CheckCircle2, ChevronDown, ChevronUp,
} from "lucide-react";

const modules = [
    {
        id: "dokumente",
        icon: FileText,
        title: "Angebote & Rechnungen",
        subtitle: "Professionelle Dokumente in unter 5 Minuten",
        color: "blue",
        sections: [
            {
                heading: "Dokument erstellen",
                text: "Waehlen Sie zwischen Angebot und Rechnung. Ordnen Sie einen Kunden und optional ein Projekt zu. Das System generiert automatisch eine fortlaufende Dokumentnummer (z.B. AN-2026-0001 oder RE-2026-0003).",
                bullets: ["Dokumenttyp: Angebot oder Rechnung", "Automatische Nummernvergabe pro Typ", "Kunde und Projekt zuordnen", "Faelligkeitsdatum und Zahlungsziel setzen"],
            },
            {
                heading: "Positions-Editor",
                text: "Fuegen Sie beliebig viele Positionen hinzu. Jede Position hat Beschreibung, Menge, Einheit (m2, Stunde, pauschal, lfdm) und Einzelpreis. Der Gesamtpreis berechnet sich automatisch. Positionen koennen direkt aus dem Leistungskatalog uebernommen werden.",
                bullets: ["Unbegrenzte Positionen pro Dokument", "Automatische Berechnung: Netto, Rabatt, MwSt., Brutto", "Einheiten: m2, Stunde, Stueck, pauschal, Meter, lfdm", "Ein-Klick-Import aus dem Leistungskatalog"],
            },
            {
                heading: "Zahlung & Status",
                text: "Rechnungen koennen als vollstaendig oder teilweise bezahlt markiert werden. Das System berechnet den offenen Betrag automatisch und aktualisiert den Status. Bezahlte Rechnungen werden automatisch dem Kunden- und Projektumsatz zugerechnet.",
                bullets: ["Voll- und Teilzahlung buchen", "Automatischer Statuswechsel bei vollstaendiger Zahlung", "Offener Betrag wird live berechnet", "Umsatz wird Kunde und Projekt zugeordnet"],
            },
        ],
    },
    {
        id: "mahnwesen",
        icon: AlertTriangle,
        title: "Automatisches Mahnwesen",
        subtitle: "Ueberfaellige Forderungen nie wieder uebersehen",
        color: "amber",
        sections: [
            {
                heading: "Automatische Erkennung",
                text: "Das System erkennt automatisch alle Rechnungen, deren Faelligkeitsdatum ueberschritten ist. In der Mahnuebersicht sehen Sie sofort: Welcher Kunde schuldet wie viel, seit wie vielen Tagen ist die Rechnung ueberfaellig, und welche Mahnstufe wurde bereits erreicht.",
                bullets: ["Echtzeit-Erkennung ueberfaelliger Rechnungen", "Tage-Zaehler seit Faelligkeitsdatum", "Gesamtbetrag offener Forderungen auf einen Blick"],
            },
            {
                heading: "3-Stufen-Mahnsystem",
                text: "Mahnen Sie einzelne Rechnungen manuell oder nutzen Sie die Auto-Mahnung fuer alle ueberfaelligen Rechnungen gleichzeitig. Die Mahnstufe wird automatisch hochgesetzt (max. 3 Stufen). Bei Stufe 3 wird die Maximalgrenze erreicht.",
                bullets: ["Stufe 1: Zahlungserinnerung", "Stufe 2: Erste Mahnung", "Stufe 3: Letzte Mahnung (Inkasso-Vorbereitung)", "Auto-Mahnung: Alle auf einmal hochstufen"],
            },
        ],
    },
    {
        id: "projekte",
        icon: Briefcase,
        title: "Projektverwaltung",
        subtitle: "Budget, Fortschritt und Team pro Baustelle",
        color: "purple",
        sections: [
            {
                heading: "Projekt anlegen",
                text: "Erstellen Sie ein Projekt mit Name, Kunde, Adresse und Budget. Definieren Sie Start- und Enddatum. Weisen Sie Mitarbeiter per Klick dem Projektteam zu. Jedes Projekt erhaelt eine eigene Farbe fuer die visuelle Zuordnung in der Plantafel.",
                bullets: ["Kunde und Adresse zuordnen", "Budget und Zeitraum festlegen", "Team aus Mitarbeiterliste zusammenstellen", "Farbliche Codierung fuer Plantafel"],
            },
            {
                heading: "Automatische Verrechnung",
                text: "Alle Rechnungen, die einem Projekt zugeordnet sind, werden automatisch summiert. Auf der Projektkarte sehen Sie: Budget vs. fakturiert vs. bezahlt. So erkennen Sie sofort, ob ein Projekt im Budget liegt oder ueberschritten wird.",
                bullets: ["Budget vs. fakturierter Betrag", "Bezahlter Betrag pro Projekt", "Fortschrittsbalken mit Prozentwert", "Statusfilter: Planung, Aktiv, Abgeschlossen"],
            },
        ],
    },
    {
        id: "plantafel",
        icon: CalendarRange,
        title: "Plantafel",
        subtitle: "Visueller Wochenplan mit Konflikterkennung",
        color: "cyan",
        sections: [
            {
                heading: "Wochenansicht",
                text: "Die Plantafel zeigt Montag bis Freitag in Spalten, alle Mitarbeiter in Zeilen. Zugewiesene Projekte erscheinen als farbige Bloecke. Der aktuelle Tag wird blau hervorgehoben. Navigieren Sie mit Pfeiltasten wochenweise.",
                bullets: ["5-Tage-Wochenansicht (Mo-Fr)", "Mitarbeiter als Zeilen", "Farbcodierte Projektzuordnung", "Hervorhebung des aktuellen Tages"],
            },
            {
                heading: "Konflikterkennung",
                text: "Wenn ein Mitarbeiter an einem Tag mehreren Projekten zugeordnet ist, wird der Block rot markiert mit dem Hinweis 'Konflikt'. So vermeiden Sie Doppelbelegungen und Planungsfehler.",
                bullets: ["Automatische Konflikterkennung", "Rote Markierung bei Doppelbelegung", "Legende mit allen aktiven Projekten"],
            },
        ],
    },
    {
        id: "zeiten",
        icon: Clock,
        title: "Zeiterfassung",
        subtitle: "Live-Timer, Stundenzettel und Genehmigungen",
        color: "emerald",
        sections: [
            {
                heading: "Live-Timer",
                text: "Waehlen Sie einen Mitarbeiter und ein Projekt, dann starten Sie den Timer mit einem Klick. Die Uhr zaehlt in Echtzeit. Beim Stoppen wird der Zeiteintrag automatisch mit Start- und Endzeit gespeichert.",
                bullets: ["Ein-Klick-Timer starten/stoppen", "Mitarbeiter und Projekt zuordnen", "Automatische Dauer-Berechnung", "Eintrag sofort im System gespeichert"],
            },
            {
                heading: "Manuelle Erfassung & Export",
                text: "Erfassen Sie Zeiten nachtraeglich: Datum, Von/Bis, Typ (Arbeit, Fahrt, Pause, Urlaub, Krankheit) und Beschreibung. Alle Eintraege koennen als CSV exportiert werden fuer die Lohnbuchhaltung.",
                bullets: ["5 Zeittypen: Arbeit, Fahrt, Pause, Urlaub, Krankheit", "Genehmigungsworkflow fuer Vorgesetzte", "CSV-Export fuer Lohnbuchhaltung", "Summen pro Mitarbeiter und Projekt"],
            },
        ],
    },
    {
        id: "kunden",
        icon: Users,
        title: "Kundenverwaltung",
        subtitle: "Stammdaten, Umsatz und Dokumente pro Kunde",
        color: "indigo",
        sections: [
            {
                heading: "Kundenprofil",
                text: "Legen Sie Kunden an mit Name, Typ (Gewerblich, Privat, Stammkunde), E-Mail, Telefon und Adresse. Definieren Sie individuelle Zahlungsziele. Interne Notizen helfen bei der Kundenbetreuung.",
                bullets: ["3 Kundentypen: Gewerblich, Privat, Stammkunde", "Kontaktdaten: E-Mail, Telefon, Adresse", "Individuelles Zahlungsziel (Tage)", "Interne Notizen"],
            },
            {
                heading: "Automatische Umsatzberechnung",
                text: "Auf jeder Kundenkarte sehen Sie automatisch: Gesamtumsatz (aus bezahlten Rechnungen), Anzahl der Dokumente und Anzahl der Projekte. Die Live-Suche filtert sofort nach Kundenname.",
                bullets: ["Gesamtumsatz pro Kunde (automatisch)", "Anzahl Dokumente und Projekte", "Live-Suche nach Name", "Bearbeiten und Loeschen per Hover-Aktion"],
            },
        ],
    },
    {
        id: "mitarbeiter",
        icon: Users,
        title: "Mitarbeiterverwaltung",
        subtitle: "Profile mit Zugangsdaten und Verguetung",
        color: "pink",
        sections: [
            {
                heading: "Mitarbeiterprofil",
                text: "Erstellen Sie vollstaendige Profile: Vorname, Nachname, Rolle, E-Mail und Passwort fuer den Systemzugang. Jeder Mitarbeiter erhaelt ein farbcodiertes Avatar fuer die Plantafel und Projektteams.",
                bullets: ["E-Mail und Passwort fuer Systemzugang", "Rolle und Qualifikationen (Skills)", "Farbcodiertes Avatar", "Aktiv/Inaktiv-Status"],
            },
            {
                heading: "Verguetung",
                text: "Definieren Sie Stundensatz UND pauschales Monatsgehalt. Waehlen Sie den Vertragstyp: Vollzeit, Teilzeit, Minijob oder Freelancer. Erfasste Stunden werden automatisch summiert und pro Mitarbeiter angezeigt.",
                bullets: ["Stundensatz (EUR pro Stunde)", "Pauschales Monatsgehalt", "4 Vertragstypen: Vollzeit, Teilzeit, Minijob, Freelancer", "Automatische Stundenauswertung"],
            },
        ],
    },
    {
        id: "katalog",
        icon: Wrench,
        title: "Leistungskatalog",
        subtitle: "Stammleistungen fuer schnelle Dokumenterstellung",
        color: "orange",
        sections: [
            {
                heading: "Leistungen definieren",
                text: "Legen Sie Ihre haeufigsten Leistungen einmal an: Name, Kategorie, Einheit und Preis. Beim Erstellen von Angeboten oder Rechnungen koennen Sie Positionen mit einem Klick aus dem Katalog uebernehmen.",
                bullets: ["Name, Kategorie und Beschreibung", "7 Einheiten: m2, Stunde, Stueck, pauschal, Meter, lfdm, Liter", "Preis pro Einheit festlegen", "Ein-Klick-Import in Dokumente"],
            },
        ],
    },
    {
        id: "dashboard",
        icon: BarChart3,
        title: "Dashboard",
        subtitle: "Alle Kennzahlen auf einen Blick",
        color: "emerald",
        sections: [
            {
                heading: "Vier Kennzahlen",
                text: "Das Dashboard zeigt die vier wichtigsten Werte: Bezahlter Umsatz, offene Forderungen (mit Anzahl ueberfaelliger), aktive Projekte und offene Angebote mit Gesamtvolumen.",
                bullets: ["Umsatz: Summe aller bezahlten Rechnungen", "Offene Forderungen: mit Ueberfaellig-Zaehler", "Aktive Projekte: mit Planungs-Zaehler", "Offene Angebote: mit Volumen"],
            },
            {
                heading: "Handlungsbedarf",
                text: "Im Bereich 'Handlungsbedarf' werden ueberfaellige Rechnungen automatisch mit Tagen und offenem Betrag angezeigt. So wird nichts vergessen. Zusaetzlich sehen Sie die 5 aktuellsten Dokumente und alle aktiven Projekte mit Fortschrittsbalken.",
                bullets: ["Ueberfaellige Rechnungen hervorgehoben", "Aktuelle Dokumente mit Status", "Aktive Projekte mit Fortschritt", "Ein Klick fuehrt zum jeweiligen Modul"],
            },
        ],
    },
];

export default function FunktionenPage() {
    const [expandedModule, setExpandedModule] = useState<string | null>("dokumente");

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center font-display font-extrabold text-white text-xs">HP</div>
                        <span className="font-display text-base font-extrabold text-white tracking-tight">Handwerk<span className="text-blue-500">Pro</span></span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors font-medium"><ArrowLeft className="w-4 h-4" /> Zurueck</Link>
                        <Link href="/login" className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-500/20">Jetzt testen</Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-28 pb-12 px-6 text-center">
                <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                    So funktioniert HandwerkPro
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto text-base">
                    Detaillierte Erklaerungen aller Module mit Funktionsbeschreibungen. Klicken Sie auf ein Modul, um alle Details zu sehen.
                </p>
            </section>

            {/* Quick Nav */}
            <div className="px-6 mb-12">
                <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2">
                    {modules.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => { setExpandedModule(m.id); document.getElementById(m.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${expandedModule === m.id ? "bg-blue-500/15 border-blue-500/30 text-blue-400" : "border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"}`}
                        >
                            <m.icon className="w-3.5 h-3.5" /> {m.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modules */}
            <div className="max-w-5xl mx-auto px-6 pb-24 space-y-6">
                {modules.map((mod) => {
                    const isOpen = expandedModule === mod.id;
                    return (
                        <div key={mod.id} id={mod.id} className="glass rounded-2xl overflow-hidden scroll-mt-24">
                            <button
                                onClick={() => setExpandedModule(isOpen ? null : mod.id)}
                                className="w-full flex items-center justify-between px-6 lg:px-8 py-5 text-left hover:bg-slate-800/20 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <mod.icon className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-white">{mod.title}</h2>
                                        <p className="text-xs text-slate-500 mt-0.5">{mod.subtitle}</p>
                                    </div>
                                </div>
                                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                            </button>

                            {isOpen && (
                                <div className="px-6 lg:px-8 pb-6 space-y-6 border-t border-slate-800/60 pt-6">
                                    {mod.sections.map((section, i) => (
                                        <div key={i} className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-[11px] font-bold text-blue-400">{i + 1}</span>
                                                    </div>
                                                    <h3 className="text-sm font-bold text-white">{section.heading}</h3>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                                    {section.text}
                                                </p>
                                            </div>
                                            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-800/60">
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Funktionen</div>
                                                <ul className="space-y-2.5">
                                                    {section.bullets.map((b, j) => (
                                                        <li key={j} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                            {b}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-800/40">
                                        <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                                            Jetzt ausprobieren <ArrowRight className="w-4 h-4" />
                                        </Link>
                                        <span className="text-xs text-slate-600">30 Tage kostenlos, keine Kreditkarte</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-800/60 py-8 px-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-500">
                    <span>&copy; {new Date().getFullYear()} HandwerkPro</span>
                    <Link href="/" className="hover:text-slate-300 transition-colors">Zurueck zur Startseite</Link>
                </div>
            </footer>
        </div>
    );
}

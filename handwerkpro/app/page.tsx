"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  BarChart3,
  CalendarRange,
  AlertTriangle,
  Wrench,
  X,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Angebote & Rechnungen",
    desc: "Professionelle Dokumente in unter 5 Minuten erstellen, versenden und nachverfolgen.",
    detail: [
      "Erstellen Sie Angebote und Rechnungen mit einem professionellen Positions-Editor. Jede Position enthaelt Beschreibung, Menge, Einheit und Einzelpreis.",
      "Das System berechnet automatisch Netto, Rabatt, MwSt. und Brutto. Sie koennen Positionen direkt aus Ihrem Leistungskatalog uebernehmen.",
      "Offene Angebote koennen per Klick angenommen und in Rechnungen umgewandelt werden. Zahlungen lassen sich als Voll- oder Teilzahlung buchen. Jedes Dokument erhaelt automatisch eine fortlaufende Nummer.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Mahnwesen",
    desc: "Automatisiertes Mahnwesen mit konfigurierbaren Stufen und Gebuerenberechnung.",
    detail: [
      "Ueberfaellige Rechnungen werden automatisch erkannt und in einer uebersichtlichen Tabelle dargestellt. Sie sehen sofort, wie viele Tage eine Rechnung ueberfaellig ist.",
      "Mit einem Klick auf 'Automatisch mahnen' werden alle ueberfaelligen Rechnungen in die naechste Mahnstufe versetzt (bis zu 3 Stufen). Sie koennen auch einzelne Rechnungen gezielt mahnen.",
      "Das Dashboard zeigt Ihnen jederzeit den Gesamtbetrag offener Forderungen und die Anzahl kritischer Faelle.",
    ],
  },
  {
    icon: Briefcase,
    title: "Projektverwaltung",
    desc: "Budget, Fortschritt und Team pro Projekt. Immer den Ueberblick behalten.",
    detail: [
      "Legen Sie Projekte an mit Kunde, Adresse, Budget und Zeitraum. Weisen Sie Mitarbeiter per Klick dem Projekt-Team zu.",
      "Der Fortschrittsbalken zeigt visuell, wie weit ein Projekt ist. Filtern Sie nach Status: Planung, Aktiv, Abgeschlossen oder Storniert.",
      "Jedes Projekt ist farblich codiert und erscheint in der Plantafel und im Dashboard. So behalten Sie auch bei vielen Baustellen den Ueberblick.",
    ],
  },
  {
    icon: CalendarRange,
    title: "Plantafel",
    desc: "Visueller Wochenplan mit Mitarbeiterzuordnung und Konflikterkennung.",
    detail: [
      "Die Plantafel zeigt eine Wochenansicht mit allen Mitarbeitern in Zeilen und den Wochentagen in Spalten. Zugewiesene Projekte erscheinen farblich markiert.",
      "Konflikte (Doppelbelegungen) werden automatisch rot hervorgehoben. Mit den Pfeiltasten navigieren Sie wochenweise vor und zurueck.",
      "Die Zuordnungen basieren auf den erfassten Zeiteintraegen. So sehen Sie auf einen Blick, wer wann wo im Einsatz ist.",
    ],
  },
  {
    icon: Clock,
    title: "Zeiterfassung",
    desc: "Live-Timer, Stundenzettel und Genehmigungsworkflow in einem System.",
    detail: [
      "Starten Sie einen Live-Timer fuer einen Mitarbeiter und ein Projekt. Beim Stoppen wird der Zeiteintrag automatisch gespeichert.",
      "Alternativ koennen Sie Zeiten manuell erfassen: Mitarbeiter, Projekt, Datum, Von/Bis und Taetigkeitsbeschreibung. Das System berechnet die Dauer automatisch.",
      "Nicht genehmigte Eintraege erscheinen in einem separaten Bereich. Per Klick auf 'Genehmigen' werden sie freigegeben. Ein CSV-Export aller Daten ist jederzeit moeglich.",
    ],
  },
  {
    icon: Users,
    title: "Kundenverwaltung",
    desc: "Alle Kunden, Kontakte und Umsatzhistorien zentral verwaltet.",
    detail: [
      "Legen Sie Kunden an mit Name, Typ (Gewerblich, Privat, Stammkunde), Kontaktdaten und Adresse. Definieren Sie individuelle Zahlungsziele pro Kunde.",
      "Auf jeder Kundenkarte sehen Sie den Gesamtumsatz, die Anzahl der Dokumente und laufende Projekte. Die Live-Suche filtert sofort nach Name.",
      "Kunden koennen jederzeit bearbeitet oder geloescht werden. Alle Aenderungen werden sofort gespeichert.",
    ],
  },
  {
    icon: Wrench,
    title: "Leistungskatalog",
    desc: "Stammleistungen mit Preisen anlegen und direkt in Dokumente uebernehmen.",
    detail: [
      "Definieren Sie Ihre haeufigsten Leistungen einmal: Name, Kategorie, Einheit (m2, Stunde, pauschal) und Preis.",
      "Beim Erstellen eines Angebots oder einer Rechnung koennen Sie Positionen direkt aus dem Katalog uebernehmen. Das spart Zeit und vermeidet Tippfehler.",
      "Der Katalog ist durchsuchbar und nach Kategorien organisiert. Preise koennen jederzeit angepasst werden.",
    ],
  },
  {
    icon: BarChart3,
    title: "Dashboard & Auswertungen",
    desc: "Umsatz, offene Forderungen und Projektauslastung auf einen Blick.",
    detail: [
      "Das Dashboard zeigt vier zentrale Kennzahlen: Bezahlter Umsatz, offene Forderungen (mit Anzahl ueberfaelliger), aktive Projekte und offene Angebote.",
      "Die Liste der aktuellen Dokumente zeigt Nummer, Kunde, Betrag und Status. Aktive Projekte mit Fortschrittsbalken geben einen schnellen Ueberblick.",
      "Im Bereich 'Handlungsbedarf' werden ueberfaellige Rechnungen mit Tagen und Betraegen hervorgehoben, damit nichts uebersehen wird.",
    ],
  },
];

const benefits = [
  "Keine Einrichtungsgebuehr",
  "DSGVO-konform",
  "Deutsche Serverstandorte",
  "Automatische Backups",
  "SSL-Verschluesselung",
  "Unlimitierte Dokumente",
];

export default function LandingPage() {
  const [openFeature, setOpenFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* DEBUG BANNER */}
      <div className="fixed top-0 left-0 w-full bg-orange-600 text-white text-[10px] font-black py-1 px-4 z-[9999] text-center uppercase tracking-widest">
        System Update Live: {new Date().toLocaleTimeString()} (v2.0 / Next.js Stability Fix)
      </div>
      <div className="fixed top-8 left-0 w-full bg-red-600 text-white text-xl font-black py-4 z-[9998] text-center">
        VIVID DEPLOYMENT TEST: IF YOU SEE THIS, IT IS UPDATED!
      </div>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center font-display font-extrabold text-white text-sm shadow-lg shadow-blue-500/20">
              HP
            </div>
            <span className="font-display text-lg font-extrabold text-white tracking-tight">
              Handwerk<span className="text-blue-500">Pro</span> <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded ml-1">v2.0</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/funktionen" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
              Funktionen
            </Link>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
              Preise
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors font-semibold px-4 py-2"
            >
              Anmelden
            </Link>
            <Link
              href="/login"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-5 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.12),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400 mb-8">
            <Zap className="w-3.5 h-3.5" />
            Neu: Automatisiertes Mahnwesen mit 3 Stufen
          </div>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 sm:mb-8">
            Die Software, die Ihr
            <br />
            Handwerksbetrieb
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              verdient hat.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Angebote, Rechnungen, Projekte und Zeiterfassung &ndash; alles in einer Anwendung.
            Kein Papierkram, keine Excel-Tabellen. Einfach professionell arbeiten.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/25 text-sm"
            >
              30 Tage kostenlos testen
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/funktionen"
              className="flex items-center gap-2 px-8 py-3.5 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-semibold rounded-xl transition-all text-sm"
            >
              Alle Funktionen im Detail
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 sm:mt-10 text-xs text-slate-500">
            {["Keine Kreditkarte noetig", "In 2 Minuten startklar", "Jederzeit kuendbar"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              Alles, was Ihr Betrieb braucht.
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-base">
              Klicken Sie auf eine Funktion, um zu erfahren, wie sie im Detail funktioniert.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, idx) => {
              const moduleId = f.title.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");
              // Match the IDs in funktionen/page.tsx: dokumente, mahnwesen, projekte, plantafel, zeiten, kunden, mitarbeiter, katalog, dashboard
              const mapping: Record<string, string> = {
                "angebote-rechnungen": "dokumente",
                "mahnwesen": "mahnwesen",
                "projektverwaltung": "projekte",
                "plantafel": "plantafel",
                "zeiterfassung": "zeiten",
                "kundenverwaltung": "kunden",
                "leistungskatalog": "katalog",
                "dashboard-auswertungen": "dashboard"
              };
              const id = mapping[moduleId] || moduleId;

              return (
                <Link
                  key={f.title}
                  href={`/funktionen#${id}`}
                  className="text-left rounded-2xl p-6 transition-all duration-300 group cursor-pointer border glass hover:border-blue-500/50 hover:bg-blue-500/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                      <f.icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-transform duration-200" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Details ansehen <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(37,99,235,0.06),transparent_60%)]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              Transparente Preise. Keine versteckten Kosten.
            </h2>
            <p className="text-slate-400 text-base">
              Starten Sie kostenlos und skalieren Sie nach Bedarf.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "29",
                desc: "Fuer Einzelunternehmer",
                features: ["1 Benutzer", "Unbegrenzte Dokumente", "Zeiterfassung", "E-Mail-Support"],
              },
              {
                name: "Professional",
                price: "59",
                desc: "Fuer kleine Teams",
                features: [
                  "5 Benutzer",
                  "Alles aus Starter",
                  "Projektverwaltung",
                  "Plantafel",
                  "Mahnwesen",
                ],
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "99",
                desc: "Fuer wachsende Betriebe",
                features: [
                  "Unbegrenzte Benutzer",
                  "Alles aus Professional",
                  "API-Zugang",
                  "Priority-Support",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 transition-all duration-300 ${plan.highlight
                  ? "bg-blue-600/10 border-2 border-blue-500/30 relative"
                  : "glass hover:border-slate-700/60"
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Beliebt
                  </div>
                )}
                <div className="text-sm font-bold text-slate-400 mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">EUR / Monat</span>
                </div>
                <p className="text-xs text-slate-500 mb-8">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full flex items-center justify-center py-3 rounded-lg text-sm font-bold transition-all ${plan.highlight
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white"
                    }`}
                >
                  Jetzt starten
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 px-6 border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {benefits.map((b) => (
            <span key={b} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Shield className="w-3.5 h-3.5 text-slate-600" />
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-md flex items-center justify-center font-display font-bold text-white text-[10px]">
              HP
            </div>
            <span className="text-sm text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} HandwerkPro
            </span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Impressum
            </a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Datenschutz
            </a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              AGB
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

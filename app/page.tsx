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
} from "lucide-react";

const features = [
  { icon: FileText, title: "Angebote & Rechnungen", desc: "Professionelle Dokumente in unter 5 Minuten erstellen, versenden und nachverfolgen." },
  { icon: AlertTriangle, title: "Mahnwesen", desc: "Automatisiertes Mahnwesen mit konfigurierbaren Stufen und Gebuhrenberechnung." },
  { icon: Briefcase, title: "Projektverwaltung", desc: "Budget, Fortschritt und Team pro Projekt. Immer den Uberblick behalten." },
  { icon: CalendarRange, title: "Plantafel", desc: "Visueller Wochenplan mit Mitarbeiterzuordnung und Konflikterkennung." },
  { icon: Clock, title: "Zeiterfassung", desc: "Live-Timer, Stundenzettel und Genehmigungsworkflow in einem System." },
  { icon: Users, title: "Kundenverwaltung", desc: "Alle Kunden, Kontakte und Umsatzhistorien zentral verwaltet." },
  { icon: Wrench, title: "Leistungskatalog", desc: "Stammleistungen mit Preisen anlegen und direkt in Dokumente ubernehmen." },
  { icon: BarChart3, title: "Auswertungen", desc: "Umsatz, offene Forderungen und Projektauslastung auf einen Blick." },
];

const benefits = [
  "Keine Einrichtungsgebuhr",
  "DSGVO-konform",
  "Deutsche Serverstandorte",
  "Automatische Backups",
  "SSL-Verschlusselung",
  "Unlimitierte Dokumente",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center font-display font-extrabold text-white text-sm shadow-lg shadow-blue-500/20">
              HP
            </div>
            <span className="font-display text-lg font-extrabold text-white tracking-tight">
              Handwerk<span className="text-blue-500">Pro</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">Funktionen</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">Preise</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-semibold px-4 py-2">
              Anmelden
            </Link>
            <Link href="/register" className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.12),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400 mb-6">
            <Zap className="w-3.5 h-3.5" />
            Neu: Automatisiertes Mahnwesen mit 3 Stufen
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Die Software, die Ihr<br />
            Handwerksbetrieb<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">verdient hat.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Angebote, Rechnungen, Projekte und Zeiterfassung – alles in einer Anwendung.
            Kein Papierkram. Keine Excel-Tabellen. Einfach professionell arbeiten.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/25 text-sm"
            >
              30 Tage kostenlos testen
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-3.5 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-semibold rounded-xl transition-all text-sm"
            >
              Demo ansehen
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-500">
            {["Keine Kreditkarte noetig", "In 2 Minuten startklar", "Jederzeit kuendbar"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-extrabold text-white tracking-tight mb-3">
              Alles, was Ihr Betrieb braucht.
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Von der Angebotserstellung bis zur Zeiterfassung – eine Plattform fur alle Prozesse.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-6 hover:border-slate-700/60 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/15 transition-colors">
                  <f.icon className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(37,99,235,0.06),transparent_60%)]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-extrabold text-white tracking-tight mb-3">
              Transparente Preise. Keine versteckten Kosten.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "29", desc: "Fur Einzelunternehmer", features: ["1 Benutzer", "Unbegrenzte Dokumente", "Zeiterfassung", "E-Mail-Support"] },
              { name: "Professional", price: "59", desc: "Fur kleine Teams", features: ["5 Benutzer", "Alles aus Starter", "Projektverwaltung", "Plantafel", "Mahnwesen"], highlight: true },
              { name: "Enterprise", price: "99", desc: "Fur wachsende Betriebe", features: ["Unbegrenzte Benutzer", "Alles aus Professional", "API-Zugang", "Priority-Support"] },
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
                <div className="text-sm font-bold text-slate-400 mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">EUR / Monat</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
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
      <section className="py-14 px-6 border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {benefits.map((b) => (
            <span key={b} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Shield className="w-3.5 h-3.5 text-slate-600" />
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-md flex items-center justify-center font-display font-bold text-white text-[10px]">
              HP
            </div>
            <span className="text-sm text-slate-500 font-medium">&copy; {new Date().getFullYear()} HandwerkPro</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Impressum</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Datenschutz</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

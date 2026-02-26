"use client";

import { useState } from "react";
import Link from "next/link";
import {
    FileText, AlertTriangle, Briefcase, CalendarRange,
    Clock, Users, Wrench, BarChart3, ArrowRight, ArrowLeft,
    CheckCircle2, ChevronDown, TrendingUp, MapPin,
    UserCheck, Database, Zap, Lock, ShieldCheck, Award
} from "lucide-react";

// --- Realistic UI Mockups ---

const DashboardUI = () => (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4 font-sans select-none pointer-events-none">
        <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <div className="text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase">Status: Live</div>
        </div>
        <div className="grid grid-cols-3 gap-3">
            <div className="glass p-3 rounded-xl border border-blue-500/20">
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Umsatz</div>
                <div className="text-sm font-black text-white">42.850€</div>
                <div className="text-[7px] text-emerald-500 font-bold mt-1">+12.4% ↑</div>
            </div>
            <div className="glass p-3 rounded-xl border border-amber-500/20">
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Offen</div>
                <div className="text-sm font-black text-amber-500">8.210€</div>
                <div className="text-[7px] text-slate-600 font-bold mt-1">12 Belege</div>
            </div>
            <div className="glass p-3 rounded-xl border border-purple-500/20">
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Projekte</div>
                <div className="text-sm font-black text-white">14</div>
                <div className="text-[7px] text-purple-500 font-bold mt-1">8 Aktiv</div>
            </div>
        </div>
        <div className="glass p-4 rounded-xl border border-slate-800/60 bg-slate-900/40">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="text-[9px] font-bold text-white uppercase tracking-wider">Aktive Baustellen</div>
                <BarChart3 className="w-3 h-3 text-blue-500" />
            </div>
            <div className="space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between text-[9px]"><span className="text-slate-400">Neubau MFH Heidelberg</span> <span className="text-white font-bold">75%</span></div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-blue-500" /></div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[9px]"><span className="text-slate-400">Sanierung Villa West</span> <span className="text-white font-bold">40%</span></div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden"><div className="w-[40%] h-full bg-emerald-500" /></div>
                </div>
            </div>
        </div>
    </div>
);

const InvoiceUI = () => (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 font-sans space-y-5 select-none pointer-events-none">
        <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg shadow-blue-500/20">HP</div>
            <div className="text-right">
                <div className="text-[10px] font-black text-white">RECHNUNG</div>
                <div className="text-[8px] text-slate-500">RE-2026-042</div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="text-[7px] font-bold text-blue-500 uppercase tracking-widest mb-1">Empfänger</div>
                <div className="text-[9px] font-bold text-white">Baugesellschaft Müller GmbH</div>
                <div className="text-[8px] text-slate-500">Industriestr. 12, 69115 Heidelberg</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="text-[7px] font-bold text-blue-500 uppercase tracking-widest mb-1">Details</div>
                <div className="text-[9px] font-bold text-white">Datum: 24.02.2026</div>
                <div className="text-[8px] text-slate-500">Projekt: MFH EG-Ausbau</div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="grid grid-cols-5 text-[7px] font-black text-slate-600 uppercase border-b border-slate-800 pb-1 px-1">
                <div className="col-span-2">Position</div>
                <div className="text-center">Menge</div>
                <div className="text-right">Einzel</div>
                <div className="text-right">Gesamt</div>
            </div>
            <div className="grid grid-cols-5 text-[8px] text-white p-1 bg-white/5 rounded">
                <div className="col-span-2 font-bold line-clamp-1">Fassadenanstrich Silikonharz</div>
                <div className="text-center text-slate-500">240 m²</div>
                <div className="text-right text-slate-500">28,50 €</div>
                <div className="text-right font-black">6.840,00 €</div>
            </div>
            <div className="grid grid-cols-5 text-[8px] text-white p-1">
                <div className="col-span-2 font-bold line-clamp-1">Gerüstbau Gr. 3</div>
                <div className="text-center text-slate-500">1 Pausch.</div>
                <div className="text-right text-slate-500">1.250,00 €</div>
                <div className="text-right font-black">1.250,00 €</div>
            </div>
        </div>
        <div className="pt-3 border-t border-slate-800 flex justify-end">
            <div className="w-32 space-y-1">
                <div className="flex justify-between text-[8px]"><span className="text-slate-500">Nettobetrag</span><span className="text-white font-bold">8.090,00 €</span></div>
                <div className="flex justify-between text-[8px]"><span className="text-slate-500">MwSt. (19%)</span><span className="text-white font-bold">1.537,10 €</span></div>
                <div className="flex justify-between text-[10px] pt-1 border-t border-slate-800"><span className="text-blue-400 font-black">GESAMT</span><span className="text-blue-400 font-extrabold">9.627,10 €</span></div>
            </div>
        </div>
    </div>
);

const PlantafelUI = () => (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-3 font-sans space-y-3 select-none pointer-events-none">
        <div className="flex items-center justify-between">
            <div className="text-[10px] font-black text-white">WOCHENPLAN: FEBRUAR KW 09</div>
            <div className="flex gap-1">
                <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[8px] text-slate-500">&lt;</div>
                <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[8px] text-slate-500">&gt;</div>
            </div>
        </div>
        <div className="overflow-hidden border border-slate-800 rounded-xl">
            <table className="w-full text-left text-[8px]">
                <thead>
                    <tr className="bg-slate-900 border-b border-slate-800">
                        <th className="p-2 border-r border-slate-800 w-16">Name</th>
                        <th className="p-2 text-center">Mo</th>
                        <th className="p-2 text-center bg-blue-500/5 text-blue-400">Di</th>
                        <th className="p-2 text-center">Mi</th>
                        <th className="p-2 text-center">Do</th>
                        <th className="p-2 text-center">Fr</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    <tr>
                        <td className="p-2 border-r border-slate-800 font-bold text-white">M. Weber</td>
                        <td className="p-1"><div className="bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded py-1 px-1 font-black truncate">MFH-Heid</div></td>
                        <td className="p-1 bg-blue-500/5"><div className="bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded py-1 px-1 font-black truncate">MFH-Heid</div></td>
                        <td className="p-1"><div className="bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded py-1 px-1 font-black truncate">MFH-Heid</div></td>
                        <td className="p-1"><div className="bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded py-1 px-1 font-black truncate">Villa-W</div></td>
                        <td className="p-1"><div className="bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded py-1 px-1 font-black truncate">Villa-W</div></td>
                    </tr>
                    <tr>
                        <td className="p-2 border-r border-slate-800 font-bold text-white">S. Klein</td>
                        <td className="p-1"><div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded py-1 px-1 font-black truncate">Sanierung</div></td>
                        <td className="p-1 bg-blue-500/5"><div className="bg-red-500/20 border border-red-500/30 text-red-500 rounded py-1 px-1 font-black truncate">KONFLIKT</div></td>
                        <td className="p-1"><div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded py-1 px-1 font-black truncate">Sanierung</div></td>
                        <td className="p-1"><div className="bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded py-1 px-1 font-black truncate">MFH-Heid</div></td>
                        <td className="p-1 text-center italic text-slate-600">-</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

const EmployeeUI = () => (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 font-sans space-y-4 select-none pointer-events-none">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg">MW</div>
            <div>
                <div className="text-sm font-black text-white">Markus Weber</div>
                <div className="text-[10px] text-slate-500">Bauleiter / Geselle</div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stundensatz</div>
                <div className="text-xs font-black text-white">55,00 € / h</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gesamtzeit (Feb)</div>
                <div className="text-xs font-black text-white">142.5 h</div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Kompetenzen</div>
            <div className="flex flex-wrap gap-1">
                {["Trockenbau", "Brandschutz", "Leitung"].map(s => (
                    <span key={s} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-bold rounded-lg uppercase">{s}</span>
                ))}
            </div>
        </div>
    </div>
);

// --- Content Definitions ---

const modules = [
    {
        id: "dashboard",
        icon: BarChart3,
        title: "Intelligentes Dashboard",
        subtitle: "Ihre Schaltzentrale für den Unternehmenserfolg",
        description: "Behalten Sie alle Kennzahlen in Echtzeit im Auge. Das Dashboard automatisiert die Überwachung von Umsatz, offenen Forderungen und Projektfortschritten, sodass Sie sich auf die Arbeit konzentrieren können.",
        UI: DashboardUI,
        features: [
            { title: "Live-Kennzahlen", text: "Umsatz, Cashflow und offene Posten auf einen Blick, ohne manuelles Rechnen.", icon: TrendingUp },
            { title: "Smart Alerts", text: "Warnungen bei Budgetüberschreitungen oder kritischen Fristen.", icon: AlertTriangle },
            { title: "Handlungsbedarf", text: "Tägliche To-Do Liste mit fälligen Mahnungen und anstehenden Terminen.", icon: CheckCircle2 }
        ]
    },
    {
        id: "dokumente",
        icon: FileText,
        title: "Angebote & Rechnungen",
        subtitle: "Präzise Dokumente in sekundenschnelle",
        description: "Vom ersten Angebot bis zur finalen Rechnung – erstellen Sie professionelle Dokumente, die Kunden überzeugen. Automatisierte Nummernkreise und Kalkulationen eliminieren Fehlerquellen vollständig.",
        UI: InvoiceUI,
        features: [
            { title: "Positions-Editor", text: "Fügen Sie Leistungen direkt aus dem Katalog ein. MwSt. und Gesamtsummen werden live berechnet.", icon: Zap },
            { title: "Integrierter Katalog", text: "Greifen Sie auf Ihre Stammleistungen zu und sparen Sie bei jedem Beleg wertvolle Tipparbeit.", icon: Database },
            { title: "Status-Workflow", text: "Verfolgen Sie den Weg jedes Dokuments: Vom Entwurf über 'Gesendet' bis 'Bezahlt'.", icon: Clock }
        ]
    },
    {
        id: "plantafel",
        icon: CalendarRange,
        title: "Visuelle Plantafel",
        subtitle: "Optimale Auslastung per Drag & Drop",
        description: "Koordinieren Sie Ihr Team mit chirurgischer Präzision. Unsere visuelle Plantafel erkennt Planungskonflikte automatisch und sorgt für eine reibungslose Baustellenabwicklung.",
        UI: PlantafelUI,
        features: [
            { title: "Konflikt-Warner", text: "Das System meldet rote Warnungen, wenn Mitarbeiter doppelt verplant werden.", icon: ShieldCheck },
            { title: "Projekt-Farbcode", text: "Jede Baustelle hat ihre eigene Farbe – für maximale Übersicht im Wochenplan.", icon: Briefcase },
            { title: "Team-Fokus", text: "Sehen Sie sofort, wer auf welcher Baustelle eingeteilt ist und wo Kapazitäten frei sind.", icon: Users }
        ]
    },
    {
        id: "mitarbeiter",
        icon: UserCheck,
        title: "Team & Zeiterfassung",
        subtitle: "Digitale Profile und transparente Stunden",
        description: "Verwalten Sie Ihr Team modern und fair. Jedes Teammitglied hat ein eigenes Profil mit Qualifikationen, Gehaltsdaten und einer lückenlosen Zeiterfassung pro Projekt.",
        UI: EmployeeUI,
        features: [
            { title: "Präzise Abrechnung", text: "Hinterlegen Sie individuelle Stundensätze für eine exakte Nachkalkulation.", icon: Lock },
            { title: "Skill-Management", text: "Finden Sie sofort den richtigen Experten für das Projekt basierend auf hinterlegten Kompetenzen.", icon: Award },
            { title: "Standortbezogen", text: "Zuordnung von Arbeitszeiten zu Baustellenadressen für perfekte Transparenz.", icon: MapPin }
        ]
    }
];

export default function FunktionenPage() {
    const [activeMod, setActiveMod] = useState(modules[0].id);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 font-sans">
            {/* Nav */}
            <header className="fixed top-0 w-full z-[100] border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-10 h-20">
                    <Link href="/" className="flex items-center gap-4 transition-transform hover:scale-105">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-2xl shadow-blue-500/30">HP</div>
                        <span className="font-black text-xl text-white tracking-tighter">Handwerk<span className="text-blue-500">Pro</span></span>
                    </Link>
                    <Link href="/login" className="hidden sm:flex bg-blue-600 hover:bg-blue-500 text-white font-black text-sm px-8 py-3 rounded-2xl transition-all shadow-xl shadow-blue-500/25 items-center gap-2 group">
                        Live Demo starten <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-40 pb-20 px-6 max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">Explainer Guide</div>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    Smarte Funktionen für Ihr <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Handwerk</span>
                </h1>
                <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                    Wir haben HandwerkPro so entwickelt, dass es sich Ihrem Arbeitsalltag anpasst – nicht umgekehrt. Entdecken Sie die Werkzeuge von morgen.
                </p>
            </section>

            {/* Feature Tabs */}
            <section className="px-6 pb-32 max-w-7xl mx-auto">
                <div className="flex flex-wrap justify-center gap-3 mb-16">
                    {modules.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setActiveMod(m.id)}
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all duration-300 ${activeMod === m.id ? "bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-500/30 -translate-y-1" : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700"}`}
                        >
                            <m.icon className="w-4 h-4" /> {m.title}
                        </button>
                    ))}
                </div>

                {/* Active Content */}
                {modules.map((m) => {
                    if (m.id !== activeMod) return null;
                    return (
                        <div key={m.id} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center animate-in fade-in zoom-in-95 duration-500">
                            {/* Visual Side */}
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-blue-500/10 rounded-[2.5rem] blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                                <div className="relative transform group-hover:scale-[1.02] transition-transform duration-700">
                                    <div className="p-2 border border-slate-800/60 bg-slate-900/50 rounded-[2.5rem] shadow-3xl">
                                        <m.UI />
                                    </div>
                                    <div className="absolute -bottom-6 -right-6 glass p-4 rounded-2xl border border-blue-500/20 shadow-2xl animate-bounce-subtle">
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Live Software View</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[11px] text-white font-bold italic">HandwerkPro v1.4</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className="space-y-10">
                                <div>
                                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">{m.title}</h2>
                                    <p className="text-blue-500 font-black text-sm uppercase tracking-[0.2em] mb-6">{m.subtitle}</p>
                                    <p className="text-slate-400 text-lg leading-relaxed">{m.description}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {m.features.map((f, i) => (
                                        <div key={i} className="flex gap-5 group/feat">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover/feat:border-blue-500/50 group-hover/feat:bg-blue-500/5 transition-all duration-300">
                                                <f.icon className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black text-base mb-1 group-hover/feat:text-blue-400 transition-colors">{f.title}</h4>
                                                <p className="text-slate-500 text-sm leading-relaxed">{f.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 flex flex-wrap items-center gap-6">
                                    <Link href="/login" className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all shadow-xl active:scale-95">
                                        Diese Funktion testen
                                    </Link>
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">U{i}</div>
                                        ))}
                                        <div className="w-10 h-10 rounded-full border-4 border-slate-950 bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">+8k</div>
                                    </div>
                                    <span className="text-xs text-slate-500 font-bold">Nutzen diese Funktion täglich</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Dynamic CTA */}
            <section className="bg-gradient-to-b from-slate-950 to-blue-900/10 py-32 px-6">
                <div className="max-w-4xl mx-auto glass p-10 sm:p-20 rounded-[3rem] border border-blue-500/20 text-center relative overflow-hidden shadow-3xl">
                    <div className="absolute top-0 right-0 p-10 opacity-10"><Zap className="w-40 h-40 text-blue-500" /></div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-8">Bereit für ein Upgrade?</h2>
                    <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">Digitalisieren Sie Ihren Betrieb noch heute. 30 Tage lang kostenlos, ohne Verpflichtungen.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-base shadow-2xl shadow-blue-500/30 transition-all active:scale-95">
                            Jetzt kostenlos starten
                        </Link>
                        <Link href="/support" className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-5 rounded-2xl font-black text-base border border-slate-700 transition-all">
                            Beratungsgespräch
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-900 py-16 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-[10px]">HP</div>
                            <span className="font-black text-white tracking-tight">HandwerkPro</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed font-medium">Die führende SaaS-Lösung für moderne Handwerksbetriebe. Effizienz, Transparenz und Erfolg in einem System.</p>
                    </div>
                    <div className="grid grid-cols-2 col-span-2 gap-10">
                        <div className="space-y-4">
                            <h4 className="font-black text-white uppercase tracking-widest text-[11px]">Produkt</h4>
                            <ul className="space-y-2 text-slate-500 font-bold">
                                <li><Link href="/" className="hover:text-blue-400 transition-colors">Startseite</Link></li>
                                <li><Link href="/funktionen" className="text-blue-500">Funktionen</Link></li>
                                <li><Link href="/login" className="hover:text-blue-400 transition-colors">Preise</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-black text-white uppercase tracking-widest text-[11px]">Rechtliches</h4>
                            <ul className="space-y-2 text-slate-500 font-bold">
                                <li><Link href="/impressum" className="hover:text-blue-400 transition-colors">Impressum</Link></li>
                                <li><Link href="/datenschutz" className="hover:text-blue-400 transition-colors">Datenschutz</Link></li>
                                <li><Link href="/support" className="hover:text-blue-400 transition-colors">Support</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-900 flex justify-between items-center text-[11px] font-bold text-slate-600">
                    <span>&copy; {new Date().getFullYear()} HandwerkPro. Alle Rechte vorbehalten.</span>
                    <span className="flex items-center gap-2">Made with <Zap className="w-3 h-3 text-blue-500" /> for pros</span>
                </div>
            </footer>
        </div>
    );
}

"use client";

import { useStore } from "@/lib/store";
import StatCard from "@/components/ui/stat-card";
import StatusBadge from "@/components/ui/status-badge";
import { formatCurrency, formatDate, daysDiff } from "@/lib/utils";
import { TrendingUp, FileText, Briefcase, AlertTriangle, ArrowRight, Plus, Clock, Bell, Check, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DocumentPreview from "@/components/document-preview";

export default function DashboardPage() {
    const store = useStore();
    const { invoices, projects, currentUser, timeEntries } = store;
    const [previewId, setPreviewId] = useState<string | null>(null);

    const isAdmin = currentUser?.role?.toLowerCase() === "admin";
    const today = new Date();
    const todayStr = today.toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    // Admin-specific stats
    const revenue = invoices.filter((d) => d.status === "bezahlt").reduce((s, d) => s + d.total_amount, 0);
    const openInvoices = invoices.filter((d) => d.doc_type === "rechnung" && ["offen", "ueberfaellig", "gemahnt"].includes(d.status));
    const openAmount = openInvoices.reduce((s, d) => s + (d.total_amount - d.paid_amount), 0);
    const overdueCount = openInvoices.filter((d) => d.due_date && daysDiff(d.due_date) > 0).length;
    const activeProjects = projects.filter((p) => p.status === "aktiv");
    const planningCount = projects.filter((p) => p.status === "planung").length;
    const openProposals = invoices.filter((d) => d.doc_type === "angebot" && d.status === "offen");
    const proposalVolume = openProposals.reduce((s, d) => s + d.total_amount, 0);
    const recentDocs = [...invoices].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

    // Employee-specific stats
    const myLogsToday = timeEntries.filter(l => l.employee_id === currentUser?.id && l.date === today.toISOString().split('T')[0]);
    const totalHoursToday = myLogsToday.reduce((s: number, l: any) => s + (l.duration || 0), 0);
    const hoursToday = Math.floor(totalHoursToday);
    const minutesToday = Math.round((totalHoursToday - hoursToday) * 60);

    // Find project assigned to employee
    const myProject = projects.find(p => p.team?.includes(currentUser?.id || ""));

    if (!isAdmin) {
        return (
            <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-6">
                <header className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Guten Tag, {currentUser?.first_name}</p>
                    <h1 className="text-2xl font-extrabold text-white">{todayStr}</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Time Tracking Focus */}
                    <div className="lg:col-span-2 glass border-blue-500/20 bg-blue-500/[0.02] p-6 lg:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-500/10">
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[8px] border-slate-800 flex items-center justify-center relative shadow-inner">
                                <div className="absolute inset-0 rounded-full border-[8px] border-blue-500 border-t-transparent animate-spin-slow opacity-40"></div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-black text-white">{hoursToday}h {minutesToday}m</div>
                                    <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Heute</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-white mb-1">Deine Zeiterfassung</h2>
                                <p className="text-sm text-slate-400">Erfasse deine Arbeitszeiten für heute.</p>
                            </div>
                            <Link href="/zeiten" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/30 active:scale-95 text-base md:text-lg">
                                <Clock className="w-5 h-5" /> Einstempeln
                            </Link>
                        </div>
                    </div>

                    <StatCard title="Meine Stunden (MM)" value={`${hoursToday}h ${minutesToday}m`} subtitle="Monatsziel: 160h" icon={Clock} color="blue" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Project */}
                    <div className="glass rounded-3xl overflow-hidden p-6 lg:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-xl font-extrabold text-white">Aktuelles Projekt</h2>
                            <Briefcase className="w-5 h-5 text-slate-500" />
                        </div>

                        {myProject ? (
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: myProject.color }} />
                                        <h3 className="text-lg font-bold text-white">{myProject.name}</h3>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-6 line-clamp-2">Laufendes Projekt im Handwerksbetrieb.</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span>Fortschritt</span>
                                            <span>{myProject.progress}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${myProject.progress}%`, backgroundColor: myProject.color }} />
                                        </div>
                                    </div>
                                </div>
                                <Link href={`/projekte/${myProject.id}`} className="flex items-center justify-center gap-2 w-full py-4 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                    Projektdetails ansehen <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Aktuell kein Projekt zugewiesen.</p>
                            </div>
                        )}
                    </div>

                    {/* Today's Schedule / Notifications */}
                    <div className="glass rounded-3xl overflow-hidden p-6 lg:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-xl font-extrabold text-white">Wichtige Infos</h2>
                            <Bell className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="space-y-4">
                            {store.notifications.slice(0, 3).map(n => (
                                <div key={n.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-colors cursor-pointer group">
                                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{n.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                                </div>
                            ))}
                            <Link href="/notifications" className="block text-center text-xs font-bold text-slate-500 hover:text-white mt-4 uppercase tracking-[0.2em] transition-colors">Alle Benachrichtigungen</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ADMIN VIEW (RESTORED & OPTIMIZED)
    return (
        <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{todayStr}</p>
                    <h1 className="text-2xl md:text-3xl font-black text-white">Betriebsübersicht</h1>
                </div>
                <Link href="/angebote" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-xl transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                    <Plus className="w-5 h-5" /> Neues Dokument
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Umsatz (bezahlt)" value={formatCurrency(revenue)} subtitle="Alle bezahlten Rechnungen" icon={TrendingUp} color="emerald" />
                <StatCard title="Offene Forderungen" value={formatCurrency(openAmount)} subtitle={`${overdueCount} ueberfaellig`} icon={FileText} color={overdueCount > 0 ? "red" : "amber"} />
                <StatCard title="Aktive Projekte" value={String(activeProjects.length)} subtitle={`${planningCount} in Planung`} icon={Briefcase} color="blue" />
                <StatCard title="Offene Angebote" value={String(openProposals.length)} subtitle={formatCurrency(proposalVolume) + " Volumen"} icon={AlertTriangle} color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 glass rounded-3xl overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60 bg-white/[0.02]">
                        <h2 className="font-display text-lg font-extrabold text-white">Aktuelle Dokumente</h2>
                        <Link href="/angebote" className="text-xs text-slate-400 hover:text-blue-400 font-bold flex items-center gap-1 transition-colors">Alle anzeigen <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                    <div className="divide-y divide-slate-800/40">
                        {recentDocs.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                onClick={() => setPreviewId(doc.id)}
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-slate-700 transition-colors">
                                        <FileText className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[15px] font-bold text-white">{doc.doc_number}</span>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 py-0.5 px-1.5 bg-slate-800/50 rounded">{doc.doc_type}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[13px] text-slate-500 truncate">{store.getCustomerName(doc.customer_id)}</span>
                                            <Link
                                                href={`/kunden/${doc.customer_id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                            >
                                                &bull; Historie <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4">
                                    <div className="sm:text-right">
                                        <div className="text-[15px] font-black text-white">{formatCurrency(doc.total_amount)}</div>
                                        <div className="text-[11px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">{formatDate(doc.date)}</div>
                                    </div>
                                    <StatusBadge status={doc.status} />
                                </div>
                            </div>
                        ))}
                        {recentDocs.length === 0 && <div className="px-6 py-12 text-center text-sm text-slate-500">Noch keine Dokumente vorhanden.</div>}
                    </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                    <div className="glass rounded-3xl overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60 bg-white/[0.02]">
                            <h2 className="font-display text-lg font-extrabold text-white">Handlungsbedarf</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            {openInvoices.filter((d) => d.due_date && daysDiff(d.due_date) > 0).map((doc) => (
                                <div key={doc.id} className="flex items-start gap-4 p-4 bg-red-500/[0.03] border border-red-500/10 rounded-2xl hover:bg-red-500/[0.06] transition-colors cursor-pointer group">
                                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-black text-red-500 uppercase tracking-widest">{doc.doc_number}</div>
                                        <div className="text-sm font-bold text-white mt-1 group-hover:text-red-400 transition-colors">{daysDiff(doc.due_date!)} Tage ueberfaellig</div>
                                        <div className="text-[11px] text-slate-500 mt-1 font-medium">
                                            <Link
                                                href={`/kunden/${doc.customer_id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                {store.getCustomerName(doc.customer_id)}
                                            </Link>
                                            <span> | {formatCurrency(doc.total_amount - doc.paid_amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {overdueCount === 0 && (
                                <div className="flex items-center gap-4 p-6 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <span className="text-[13px] font-bold text-emerald-400">Alles im grünen Bereich</span>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Keine überfälligen Rechnungen.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Simplified Projects list for Mobile */}
                    <div className="glass rounded-3xl overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60 bg-white/[0.02]">
                            <h2 className="font-display text-lg font-extrabold text-white">Projektstatus</h2>
                            <Link href="/projekte" className="text-xs text-slate-400 hover:text-blue-400 font-bold flex items-center gap-1 transition-colors">Alle <ArrowRight className="w-4 h-4" /></Link>
                        </div>
                        <div className="divide-y divide-slate-800/40">
                            {activeProjects.slice(0, 4).map((p) => (
                                <div key={p.id} className="flex items-center gap-4 px-6 py-5 hover:bg-white/[0.03] transition-colors cursor-pointer">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-white truncate">{p.name}</div>
                                        <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-widest font-black">{p.progress}% Abgeschlossen</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <DocumentPreview
                documentId={previewId}
                open={!!previewId}
                onClose={() => setPreviewId(null)}
            />
        </div>
    );
}

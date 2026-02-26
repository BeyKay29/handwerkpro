"use client";

import { useStore } from "@/lib/store";
import StatCard from "@/components/ui/stat-card";
import StatusBadge from "@/components/ui/status-badge";
import { formatCurrency, formatDate, daysDiff } from "@/lib/utils";
import { TrendingUp, FileText, Briefcase, AlertTriangle, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const store = useStore();
    const { invoices, projects } = store;

    const revenue = invoices.filter((d) => d.status === "bezahlt").reduce((s, d) => s + d.total_amount, 0);
    const openInvoices = invoices.filter((d) => d.doc_type === "rechnung" && ["offen", "ueberfaellig", "gemahnt"].includes(d.status));
    const openAmount = openInvoices.reduce((s, d) => s + (d.total_amount - d.paid_amount), 0);
    const overdueCount = openInvoices.filter((d) => d.due_date && daysDiff(d.due_date) > 0).length;
    const activeProjects = projects.filter((p) => p.status === "aktiv");
    const planningCount = projects.filter((p) => p.status === "planung").length;
    const openProposals = invoices.filter((d) => d.doc_type === "angebot" && d.status === "offen");
    const proposalVolume = openProposals.reduce((s, d) => s + d.total_amount, 0);
    const recentDocs = [...invoices].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

    const todayStr = new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-slate-400 text-sm">{todayStr}</p>
                </div>
                <Link href="/angebote" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20 w-fit">
                    <Plus className="w-4 h-4" /> Neues Dokument
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Umsatz (bezahlt)" value={formatCurrency(revenue)} subtitle="Alle bezahlten Rechnungen" icon={TrendingUp} color="emerald" />
                <StatCard title="Offene Forderungen" value={formatCurrency(openAmount)} subtitle={`${overdueCount} ueberfaellig`} icon={FileText} color={overdueCount > 0 ? "red" : "amber"} />
                <StatCard title="Aktive Projekte" value={String(activeProjects.length)} subtitle={`${planningCount} in Planung`} icon={Briefcase} color="blue" />
                <StatCard title="Offene Angebote" value={String(openProposals.length)} subtitle={formatCurrency(proposalVolume) + " Volumen"} icon={AlertTriangle} color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                        <h2 className="font-display text-lg font-bold text-white">Aktuelle Dokumente</h2>
                        <Link href="/angebote" className="text-xs text-slate-400 hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors">Alle anzeigen <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </div>
                    <div className="divide-y divide-slate-800/40">
                        {recentDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-slate-800/80 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">{doc.doc_number}</span>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{doc.doc_type === "angebot" ? "Angebot" : "Rechnung"}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">{store.getCustomerName(doc.customer_id)}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-sm font-bold text-white">{formatCurrency(doc.total_amount)}</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">{formatDate(doc.date)}</div>
                                </div>
                                <StatusBadge status={doc.status} />
                            </div>
                        ))}
                        {recentDocs.length === 0 && <div className="px-6 py-8 text-center text-sm text-slate-500">Noch keine Dokumente vorhanden.</div>}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                            <h2 className="font-display text-lg font-bold text-white">Aktive Projekte</h2>
                            <Link href="/projekte" className="text-xs text-slate-400 hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors">Alle <ArrowRight className="w-3.5 h-3.5" /></Link>
                        </div>
                        <div className="divide-y divide-slate-800/40">
                            {activeProjects.map((p) => (
                                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors cursor-pointer">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-white truncate">{p.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{store.getCustomerName(p.customer_id || "")}</div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-xs font-bold text-slate-400">{p.progress}%</span>
                                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {activeProjects.length === 0 && <div className="px-6 py-8 text-center text-sm text-slate-500">Keine aktiven Projekte.</div>}
                        </div>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800/60">
                            <h2 className="font-display text-lg font-bold text-white">Handlungsbedarf</h2>
                        </div>
                        <div className="p-4 space-y-3">
                            {openInvoices.filter((d) => d.due_date && daysDiff(d.due_date) > 0).map((doc) => (
                                <div key={doc.id} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-xs font-bold text-red-400">{doc.doc_number} – {daysDiff(doc.due_date!)} Tage ueberfaellig</div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">{store.getCustomerName(doc.customer_id)} | {formatCurrency(doc.total_amount - doc.paid_amount)}</div>
                                    </div>
                                </div>
                            ))}
                            {overdueCount === 0 && (
                                <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                    <span className="text-emerald-500 text-sm">&#10003;</span>
                                    <span className="text-xs font-semibold text-emerald-400">Alles im gruenen Bereich</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

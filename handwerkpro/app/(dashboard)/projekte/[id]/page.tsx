"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/ui/status-badge";
import {
    ArrowLeft, Calendar, MapPin, Users, FileText,
    TrendingUp, Clock, CheckCircle2, AlertCircle,
    ChevronRight, ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const store = useStore();

    const project = store.projects.find(p => p.id === id);
    if (!project) return <div className="p-8 text-white">Projekt nicht gefunden.</div>;

    const customer = store.customers.find(c => c.id === project.customer_id);
    const invoices = store.invoices.filter(i => i.project_id === project.id);
    const timeEntries = store.timeEntries.filter(t => t.project_id === project.id);

    const invoicedTotal = store.getProjectInvoiced(project.id);
    const paidTotal = store.getProjectPaid(project.id);
    const totalHours = timeEntries.reduce((sum, t) => sum + t.duration, 0);

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
                </button>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <StatusBadge status={project.status} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projekt ID: {project.id.slice(0, 8)}</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">{project.name}</h1>
                        <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm">
                            <MapPin className="w-3.5 h-3.5" /> {project.address || "Keine Adresse hinterlegt"}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all border border-slate-700"> Bearbeiten</button>
                        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20">Aktion wählen</button>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass p-6 rounded-2xl border-l-4 border-blue-500">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Budget</div>
                    <div className="text-2xl font-black text-white">{formatCurrency(project.budget)}</div>
                    <div className="mt-2 text-[10px] text-slate-500">Gesamtvolumen</div>
                </div>
                <div className="glass p-6 rounded-2xl border-l-4 border-amber-500">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fakturiert</div>
                    <div className="text-2xl font-black text-amber-500">{formatCurrency(invoicedTotal)}</div>
                    <div className="mt-2 text-[10px] text-slate-500">{((invoicedTotal / project.budget) * 100).toFixed(0)}% vom Budget</div>
                </div>
                <div className="glass p-6 rounded-2xl border-l-4 border-emerald-500">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bezahlt</div>
                    <div className="text-2xl font-black text-emerald-500">{formatCurrency(paidTotal)}</div>
                    <div className="mt-2 text-[10px] text-slate-500">{((paidTotal / invoicedTotal) * 100 || 0).toFixed(0)}% Quote</div>
                </div>
                <div className="glass p-6 rounded-2xl border-l-4 border-purple-500">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stunden</div>
                    <div className="text-2xl font-black text-white">{totalHours.toFixed(1)}h</div>
                    <div className="mt-2 text-[10px] text-slate-500">Arbeitszeit total</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details & Team */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Notes / Details */}
                    <div className="glass rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="font-bold text-white">Projektinformationen</h2>
                            <TrendingUp className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="p-6">
                            <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-wrap">
                                {project.notes || "Keine weiteren Details oder Notizen für dieses Projekt vorhanden."}
                            </p>
                        </div>
                    </div>

                    {/* Timeline / Recent Activity Placeholder */}
                    <div className="glass rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="font-bold text-white">Kürzliche Zeitbuchungen</h2>
                            <Clock className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="p-0">
                            {timeEntries.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 italic text-sm">Keine Buchungen vorhanden</div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {timeEntries.slice(0, 5).map(entry => {
                                        const employee = store.employees.find(e => e.id === entry.employee_id);
                                        return (
                                            <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: employee?.color || '#333' }}>
                                                        {employee?.first_name[0]}{employee?.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white">{employee?.first_name} {employee?.last_name}</div>
                                                        <div className="text-[10px] text-slate-500">{entry.description}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-white">{entry.duration}h</div>
                                                    <div className="text-[10px] text-slate-500">{formatDate(entry.date)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar info */}
                <div className="space-y-6">
                    {/* Customer Card */}
                    <div className="glass rounded-3xl overflow-hidden p-6 border border-blue-500/20 bg-blue-500/5">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Kunde</div>
                        {customer ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-lg font-bold text-white">{customer.name}</div>
                                    <div className="text-xs text-slate-500">{customer.contact_person}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-slate-400"><MapPin className="w-3 h-3" /> {customer.address}</div>
                                </div>
                                <Link href={`/kunden`} className="flex items-center justify-between text-xs font-bold text-blue-400 hover:text-blue-300 pt-2 border-t border-blue-500/10 transition-colors">
                                    Kundenprofil aufrufen <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 italic">Kein Kunde zugeordnet</div>
                        )}
                    </div>

                    {/* Team Members */}
                    <div className="glass rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Projekt-Team</h3>
                            <Users className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div className="space-y-3">
                            {(project.team || []).map(eid => {
                                const emp = store.employees.find(e => e.id === eid);
                                if (!emp) return null;
                                return (
                                    <div key={eid} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: emp.color }}>
                                            {emp.first_name[0]}{emp.last_name[0]}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{emp.first_name} {emp.last_name}</div>
                                            <div className="text-[10px] text-slate-500">{emp.role}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {(project.team || []).length === 0 && <p className="text-xs text-slate-500 italic">Keine Mitarbeiter zugewiesen</p>}
                        </div>
                    </div>

                    {/* Associated Documents */}
                    <div className="glass rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dokumente</h3>
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div className="space-y-3">
                            {invoices.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">Noch keine Angebote oder Rechnungen</p>
                            ) : (
                                invoices.map(inv => (
                                    <div key={inv.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inv.doc_type === 'angebot' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[11px] font-bold text-white truncate">{inv.doc_number}</div>
                                                <div className="text-[9px] text-slate-500 uppercase">{inv.doc_type} &bull; {inv.status}</div>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

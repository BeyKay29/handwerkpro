"use client";

import { useStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    ChevronLeft, Mail, Phone, MapPin, User,
    Briefcase, FileText, TrendingUp, AlertTriangle,
    ExternalLink, Calendar, Clock, Plus
} from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/ui/status-badge";
import StatCard from "@/components/ui/stat-card";

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const store = useStore();

    const customer = store.customers.find(c => c.id === id);

    if (!customer) {
        return (
            <div className="p-8 text-center">
                <p className="text-slate-400">Kunde nicht gefunden.</p>
                <button onClick={() => router.back()} className="mt-4 text-blue-500 hover:underline">Zurück zur Übersicht</button>
            </div>
        );
    }

    const customerProjects = store.projects.filter(p => p.customer_id === id);
    const customerInvoices = store.invoices.filter(i => i.customer_id === id);

    const totalRevenue = store.getCustomerRevenue(customer.id);
    const openAmount = store.getCustomerOpenAmount(customer.id);
    const projectCount = store.getCustomerProjectCount(customer.id);
    const docCount = store.getCustomerDocCount(customer.id);

    return (
        <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header & Back Action */}
            <div className="flex flex-col gap-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors w-fit"
                >
                    <ChevronLeft className="w-4 h-4" /> Zurück zu Kunden
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-black text-white shadow-2xl shadow-blue-500/20">
                            {customer.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-white">{customer.name}</h1>
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest 
                                    ${customer.type === 'Stammkunde' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        customer.type === 'Gewerblich' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-slate-800 text-slate-400'}`}>
                                    {customer.type}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                                {customer.contact_person && <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-600" /> {customer.contact_person}</div>}
                                {customer.email && <div className="flex items-center gap-2 font-medium hover:text-blue-400 transition-colors"><Mail className="w-4 h-4 text-slate-600" /> {customer.email}</div>}
                                {customer.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-600" /> {customer.phone}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Gesamtumsatz" value={formatCurrency(totalRevenue)} subtitle="Alle bezahlten Rechnungen" icon={TrendingUp} color="emerald" />
                <StatCard title="Offene Posten" value={formatCurrency(openAmount)} subtitle={`${customerInvoices.filter(i => i.status === 'ueberfaellig').length} überfällig`} icon={AlertTriangle} color={openAmount > 0 ? "amber" : "slate"} />
                <StatCard title="Aktive Projekte" value={String(customerProjects.filter(p => p.status === 'aktiv').length)} subtitle={`${projectCount} Projekte gesamt`} icon={Briefcase} color="blue" />
                <StatCard title="Dokumente" value={String(docCount)} subtitle="Angebote & Rechnungen" icon={FileText} color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: History */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Projects History */}
                    <div className="glass rounded-[2rem] overflow-hidden shadow-xl">
                        <div className="px-8 py-6 border-b border-slate-800/60 bg-white/[0.02] flex items-center justify-between">
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-blue-500" /> Projekthistorie
                            </h2>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{customerProjects.length} Einträge</span>
                        </div>
                        <div className="divide-y divide-slate-800/40">
                            {customerProjects.length > 0 ? customerProjects.map((p) => (
                                <Link href={`/projekte/${p.id}`} key={p.id} className="flex items-center gap-6 px-8 py-6 hover:bg-white/[0.03] transition-all group">
                                    <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</div>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-40" /> {formatDate(p.start_date || '')}</div>
                                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 opacity-40" /> {p.status === 'aktiv' ? 'In Arbeit' : 'Abgeschlossen'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="text-right">
                                            <div className="text-sm font-black text-white">{p.progress}%</div>
                                            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                                                <div className="h-full rounded-full" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-12 text-center text-slate-600 italic">Keine Projekte vorhanden.</div>
                            )}
                        </div>
                    </div>

                    {/* Documents History */}
                    <div className="glass rounded-[2rem] overflow-hidden shadow-xl">
                        <div className="px-8 py-6 border-b border-slate-800/60 bg-white/[0.02] flex items-center justify-between">
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <FileText className="w-5 h-5 text-indigo-500" /> Dokumenthistorie
                            </h2>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{customerInvoices.length} Einträge</span>
                        </div>
                        <div className="divide-y divide-slate-800/40">
                            {customerInvoices.length > 0 ? customerInvoices.map((doc) => (
                                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-8 py-6 hover:bg-white/[0.03] transition-all cursor-pointer group">
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[15px] font-bold text-white uppercase">{doc.doc_number}</span>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{doc.doc_type}</span>
                                            </div>
                                            <div className="text-[13px] text-slate-500 mt-0.5">{formatDate(doc.date)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6">
                                        <div className="sm:text-right">
                                            <div className="text-[15px] font-black text-white">{formatCurrency(doc.total_amount)}</div>
                                            <StatusBadge status={doc.status} />
                                        </div>
                                        <button className="p-2 text-slate-700 hover:text-white transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center text-slate-600 italic">Keine Dokumente vorhanden.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Details Card */}
                <div className="space-y-6">
                    <div className="glass rounded-[2rem] p-8 shadow-xl space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Stammdaten</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500"><MapPin className="w-4 h-4" /></div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Adresse</div>
                                        <div className="text-sm font-bold text-white leading-relaxed">{customer.address || 'Keine Adresse hinterlegt'}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500"><Mail className="w-4 h-4" /></div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">E-Mail</div>
                                        <div className="text-sm font-bold text-white">{customer.email || 'Keine E-Mail'}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500"><Phone className="w-4 h-4" /></div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Telefon</div>
                                        <div className="text-sm font-bold text-white">{customer.phone || 'Keine Telefonnummer'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {customer.notes && (
                            <div className="pt-8 border-t border-slate-800/60">
                                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Interne Notizen</h3>
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[13px] text-slate-400 leading-relaxed italic">
                                    "{customer.notes}"
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/angebote" className="p-6 glass rounded-3xl hover:bg-blue-600/10 transition-all border border-blue-500/10 text-center space-y-2 group">
                            <Plus className="w-5 h-5 text-blue-500 mx-auto group-hover:scale-110 transition-transform" />
                            <div className="text-[10px] font-black text-white uppercase tracking-widest">Neues Angebot</div>
                        </Link>
                        <Link href="/projekte" className="p-6 glass rounded-3xl hover:bg-emerald-600/10 transition-all border border-emerald-500/10 text-center space-y-2 group">
                            <Plus className="w-5 h-5 text-emerald-500 mx-auto group-hover:scale-110 transition-transform" />
                            <div className="text-[10px] font-black text-white uppercase tracking-widest">Neues Projekt</div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

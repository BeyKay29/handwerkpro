"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    ArrowLeft, Mail, Phone, Calendar, Briefcase,
    Clock, Shield, Award, Settings, ChevronRight,
    TrendingUp, History, UserCheck, CheckCircle2, AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function EmployeeDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const store = useStore();

    const employee = store.employees.find(e => e.id === id);
    if (!employee) return <div className="p-8 text-white">Mitarbeiter nicht gefunden.</div>;

    const timeEntries = store.timeEntries.filter(t => t.employee_id === employee.id);
    const projects = store.projects.filter(p => p.team?.includes(employee.id));

    const totalHours = timeEntries.reduce((sum, t) => sum + t.duration, 0);
    const thisMonthHours = timeEntries.filter(t => {
        const d = new Date(t.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, t) => sum + t.duration, 0);

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" /> Zurück zur Mitarbeiterliste
                </button>

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl relative" style={{ background: `linear-gradient(135deg, ${employee.color}, #8b5cf6)` }}>
                            {employee.first_name[0]}{employee.last_name[0]}
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-slate-950 flex items-center justify-center">
                                <UserCheck className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-extrabold text-white tracking-tight">{employee.first_name} {employee.last_name}</h1>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${employee.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`}>
                                    {employee.is_active ? "AKTIV" : "INAKTIV"}
                                </span>
                            </div>
                            <p className="text-slate-400 font-medium">{employee.role || "Mitarbeiter"}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <a href={`mailto:${employee.email}`} className="text-xs text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 font-semibold">
                                    <Mail className="w-3.5 h-3.5" /> {employee.email}
                                </a>
                                <a href={`tel:${employee.phone}`} className="text-xs text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 font-semibold">
                                    <Phone className="w-3.5 h-3.5" /> {employee.phone || "Keine Nr."}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all border border-slate-700">Profil bearbeiten</button>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass p-6 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                        Arbeitszeit (Total) <Clock className="w-3 h-3 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-white">{totalHours.toFixed(1)}h</div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                        <TrendingUp className="w-3 h-3" /> +12% vs Vormonat
                    </div>
                </div>
                <div className="glass p-6 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                        Diesen Monat <Calendar className="w-3 h-3 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-white">{thisMonthHours.toFixed(1)}h</div>
                    <div className="mt-1 text-[10px] text-slate-500 font-bold">
                        Soll: 160h ({((thisMonthHours / 160) * 100).toFixed(0)}%)
                    </div>
                </div>
                <div className="glass p-6 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                        Durchschn. Satz <TrendingUp className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-500">{formatCurrency(employee.hourly_rate)}</div>
                    <div className="mt-1 text-[10px] text-slate-500 font-bold italic">Standard Abrechnung</div>
                </div>
                <div className="glass p-6 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                        Fix-Gehalt <Shield className="w-3 h-3 text-purple-500" />
                    </div>
                    <div className="text-2xl font-black text-white">{employee.monthly_salary ? formatCurrency(employee.monthly_salary) : "—"}</div>
                    <div className="mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">{employee.contract_type}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Projects */}
                    <div className="glass rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="font-bold text-white flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-500" /> Aktuelle Projekte
                            </h2>
                        </div>
                        <div className="p-0">
                            {projects.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 italic text-sm">Keine zugewiesenen Projekte</div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {projects.map(p => (
                                        <Link href={`/projekte/${p.id}`} key={p.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: p.color }} />
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</div>
                                                    <div className="text-[10px] text-slate-500">{store.getCustomerName(p.customer_id || "")}</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Work Journal */}
                    <div className="glass rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="font-bold text-white flex items-center gap-2">
                                <History className="w-4 h-4 text-amber-500" /> Letzte Tätigkeiten
                            </h2>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Datum</th>
                                        <th className="px-6 py-4">Projekt</th>
                                        <th className="px-6 py-4">Tätigkeit</th>
                                        <th className="px-6 py-4 text-right">Dauer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {timeEntries.slice(0, 10).map(t => (
                                        <tr key={t.id} className="text-xs hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-slate-400 font-medium">{formatDate(t.date)}</td>
                                            <td className="px-6 py-4 text-white font-bold">{store.getProjectName(t.project_id)}</td>
                                            <td className="px-6 py-4 text-slate-500">{t.description}</td>
                                            <td className="px-6 py-4 text-right font-black text-white">{t.duration}h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {timeEntries.length === 0 && <div className="p-8 text-center text-slate-500 italic text-sm">Keine Einträge</div>}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Skills & Quals */}
                    <div className="glass rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Qualifikationen</h3>
                            <Award className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(employee.skills || []).length > 0 ? (
                                employee.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-bold uppercase tracking-tight shadow-sm hover:scale-105 transition-all cursor-default">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-slate-500 italic">Keine Qualifikationen hinterlegt</p>
                            )}
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="glass rounded-3xl p-6 border border-slate-800/60">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Adminbereich</h3>
                            <Settings className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-xs text-white font-semibold flex items-center justify-between group">
                                Login-Daten verwalten <Settings className="w-3 h-3 text-slate-600 group-hover:text-white transition-all shadow-sm shadow-blue-500/20" />
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-xs text-white font-semibold flex items-center justify-between group">
                                Vertrag herunterladen <CheckCircle2 className="w-3 h-3 text-slate-600 group-hover:text-emerald-500 transition-all shadow-sm shadow-blue-500/20" />
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-xs text-red-500 font-semibold flex items-center justify-between group">
                                Account sperren <AlertCircle className="w-3 h-3 text-red-900 group-hover:text-red-500 transition-all shadow-sm shadow-blue-500/20" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

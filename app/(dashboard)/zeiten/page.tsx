"use client";
import { formatDate } from "@/lib/utils";
import { mockTimeEntries, mockEmployees, mockProjects } from "@/lib/mock-data";
import { Plus, Clock, Play, Download } from "lucide-react";
import { useState } from "react";

const typeLabels: Record<string, string> = { arbeit: "Arbeit", fahrt: "Fahrt", pause: "Pause", urlaub: "Urlaub", krankheit: "Krankheit" };
const typeColors: Record<string, string> = { arbeit: "bg-blue-500/15 text-blue-400", fahrt: "bg-emerald-500/15 text-emerald-400", pause: "bg-slate-500/15 text-slate-400", urlaub: "bg-amber-500/15 text-amber-400", krankheit: "bg-red-500/15 text-red-400" };

export default function ZeitenPage() {
    const entries = mockTimeEntries;
    const getEmp = (id: string) => { const e = mockEmployees.find(e => e.id === id); return e ? `${e.first_name} ${e.last_name}` : "\u2014"; };
    const getProj = (id?: string) => id ? mockProjects.find(p => p.id === id)?.name || "\u2014" : "\u2014";
    const pending = entries.filter(e => !e.is_approved);

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Zeiterfassung</h1>
                    <p className="text-slate-400 text-sm mt-1">{entries.length} Eintraege | {pending.length} zur Genehmigung</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm font-semibold rounded-lg transition-colors">
                        <Download className="w-4 h-4" /> CSV Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                        <Plus className="w-4 h-4" /> Neuer Eintrag
                    </button>
                </div>
            </header>

            {/* Timer */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-6">
                    <div className="font-display text-4xl font-extrabold text-white tracking-tight">00:00:00</div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors">
                        <Play className="w-4 h-4" /> Timer starten
                    </button>
                    <select className="bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white px-3 py-2.5">
                        <option>Projekt waehlen</option>
                        {mockProjects.filter(p => p.status === "aktiv").map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Pending Approvals */}
            {pending.length > 0 && (
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold text-white">Genehmigungen offen</h2>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold">{pending.length}</span>
                    </div>
                    <div className="divide-y divide-slate-800/40">
                        {pending.map(e => (
                            <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${typeColors[e.type]}`}>{typeLabels[e.type]}</span>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-white">{getEmp(e.employee_id)}</div>
                                    <div className="text-xs text-slate-500">{getProj(e.project_id)} | {formatDate(e.date)} | {e.description}</div>
                                </div>
                                <div className="text-sm font-bold text-white">{e.duration.toFixed(1)}h</div>
                                <button className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors">
                                    Genehmigen
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Entries */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/60">
                    <h2 className="font-display text-lg font-bold text-white">Alle Eintraege</h2>
                </div>
                <div className="divide-y divide-slate-800/40">
                    {entries.map(e => (
                        <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${typeColors[e.type]}`}>{typeLabels[e.type]}</span>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white">{getEmp(e.employee_id)}</div>
                                <div className="text-xs text-slate-500">{getProj(e.project_id)} | {formatDate(e.date)}</div>
                            </div>
                            <div className="text-sm font-bold text-white">{e.duration.toFixed(1)}h</div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.is_approved ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"}`}>
                                {e.is_approved ? "Genehmigt" : "Offen"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

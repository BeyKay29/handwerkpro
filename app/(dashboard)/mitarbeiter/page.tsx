"use client";
import { formatCurrency } from "@/lib/utils";
import { mockEmployees, mockTimeEntries } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export default function MitarbeiterPage() {
    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Mitarbeiter</h1>
                    <p className="text-slate-400 text-sm mt-1">{mockEmployees.length} Mitarbeiter</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4" /> Hinzufuegen
                </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {mockEmployees.map(m => {
                    const hours = mockTimeEntries.filter(t => t.employee_id === m.id).reduce((s, t) => s + t.duration, 0);
                    return (
                        <div key={m.id} className="glass rounded-2xl p-6 hover:border-slate-700/60 transition-all duration-300 cursor-pointer text-center group space-y-4">
                            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-lg font-bold text-white" style={{ background: `linear-gradient(135deg, ${m.color}, #8b5cf6)` }}>
                                {m.first_name[0]}{m.last_name[0]}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{m.first_name} {m.last_name}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{m.role}</div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1.5">
                                {m.skills.map(s => (
                                    <span key={s} className="px-2 py-0.5 bg-slate-800/80 rounded-full text-[10px] font-semibold text-slate-400">{s}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/60">
                                <div><div className="text-sm font-bold text-blue-400">{formatCurrency(m.hourly_rate)}</div><div className="text-[10px] text-slate-500">pro Stunde</div></div>
                                <div><div className="text-sm font-bold text-white">{hours.toFixed(1)}h</div><div className="text-[10px] text-slate-500">erfasst</div></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

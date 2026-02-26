"use client";

import { useStore } from "@/lib/store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const COLORS = ["bg-blue-500/25 text-blue-300", "bg-emerald-500/25 text-emerald-300", "bg-purple-500/25 text-purple-300", "bg-amber-500/25 text-amber-300", "bg-pink-500/25 text-pink-300", "bg-cyan-500/25 text-cyan-300"];

function getWeekDays(offset: number) {
    const d = new Date(); d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
    const days = [];
    for (let i = 0; i < 5; i++) {
        const dd = new Date(d); dd.setDate(d.getDate() + i);
        days.push({ label: ["Mo", "Di", "Mi", "Do", "Fr"][i] + " " + dd.getDate() + "." + String(dd.getMonth() + 1).padStart(2, "0"), date: dd.toISOString().split("T")[0] });
    }
    return days;
}

export default function PlantafelPage() {
    const store = useStore();
    const [offset, setOffset] = useState(0);
    const days = getWeekDays(offset);
    const todayStr = new Date().toISOString().split("T")[0];

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Plantafel</h1>
                    <p className="text-slate-400 text-sm mt-1">{days[0].label} &ndash; {days[4].label}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setOffset((o) => o - 1)} className="w-9 h-9 rounded-lg border border-slate-700 hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setOffset(0)} className="px-4 py-2 text-xs font-semibold border border-slate-700 hover:border-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors">Heute</button>
                    <button onClick={() => setOffset((o) => o + 1)} className="w-9 h-9 rounded-lg border border-slate-700 hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </header>

            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-800/60">
                                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-48">Mitarbeiter</th>
                                {days.map((d) => (
                                    <th key={d.date} className={`px-3 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider ${d.date === todayStr ? "text-blue-400 bg-blue-500/5" : "text-slate-500"}`}>{d.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {store.employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: emp.color }} />
                                            <span className="text-sm font-semibold text-white">{emp.first_name} {emp.last_name}</span>
                                        </div>
                                    </td>
                                    {days.map((d) => {
                                        const entries = store.timeEntries.filter((t) => t.employee_id === emp.id && t.date === d.date);
                                        const isToday = d.date === todayStr;
                                        if (!entries.length) {
                                            return (
                                                <td key={d.date} className={`px-2 py-3 ${isToday ? "bg-blue-500/5" : ""}`}>
                                                    <div className="w-full py-2 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-600 hover:border-slate-600 hover:text-slate-400 cursor-pointer transition-colors">+</div>
                                                </td>
                                            );
                                        }
                                        const entry = entries[0];
                                        const proj = store.projects.find((p) => p.id === entry.project_id);
                                        const colorIdx = proj ? store.projects.indexOf(proj) % COLORS.length : 0;
                                        return (
                                            <td key={d.date} className={`px-2 py-3 ${isToday ? "bg-blue-500/5" : ""}`}>
                                                <div className={`w-full px-2 py-2 rounded-lg text-[11px] font-semibold text-center truncate cursor-pointer hover:opacity-80 transition-opacity ${entries.length > 1 ? "bg-red-500/20 text-red-300" : COLORS[colorIdx]}`} title={proj?.name || entry.type}>
                                                    {entries.length > 1 ? "Konflikt" : (proj ? proj.name.slice(0, 14) : entry.type)}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                {store.projects.filter((p) => p.status === "aktiv").map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: p.color }} />{p.name}
                    </div>
                ))}
            </div>
        </div>
    );
}

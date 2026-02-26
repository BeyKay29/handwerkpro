"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatCurrency, formatDate, today } from "@/lib/utils";
import {
    ChevronLeft, ChevronRight, Plus, Trash2,
    Calendar, Users, Briefcase, Clock, Search,
    Filter, MoreVertical, X
} from "lucide-react";
import { useState } from "react";
import { TimeEntry, TimeEntryType } from "@/types";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#f97316"];
const ENTRY_TYPES: { value: TimeEntryType; label: string }[] = [
    { value: "arbeit", label: "Arbeit" },
    { value: "fahrt", label: "Fahrt" },
    { value: "pause", label: "Pause" },
    { value: "urlaub", label: "Urlaub" },
    { value: "krankheit", label: "Krankheit" }
];

function getWeekDays(offset: number) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
    const days = [];
    for (let i = 0; i < 5; i++) {
        const dd = new Date(d);
        dd.setDate(d.getDate() + i);
        days.push({
            label: ["Mo", "Di", "Mi", "Do", "Fr"][i] + " " + dd.getDate() + "." + String(dd.getMonth() + 1).padStart(2, "0"),
            date: dd.toISOString().split("T")[0],
            dayName: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"][i]
        });
    }
    return days;
}

export default function PlantafelPage() {
    const store = useStore();
    const { toast } = useToast();
    const [offset, setOffset] = useState(0);
    const days = getWeekDays(offset);
    const todayStr = today();

    // Modal state for managing a day
    const [selectedDay, setSelectedDay] = useState<{ empId: string; date: string } | null>(null);
    const [manageModalOpen, setManageModalOpen] = useState(false);

    // Form state for new entry in the manage modal
    const [newProjId, setNewProjId] = useState("");
    const [newType, setNewType] = useState<TimeEntryType>("arbeit");
    const [newDuration, setNewDuration] = useState(8);
    const [newDesc, setNewDesc] = useState("");

    function openManage(empId: string, date: string) {
        setSelectedDay({ empId, date });
        setNewProjId("");
        setNewType("arbeit");
        setNewDuration(8);
        setNewDesc("");
        setManageModalOpen(true);
    }

    function handleAddEntry() {
        if (!selectedDay) return;
        store.addTimeEntry({
            employee_id: selectedDay.empId,
            project_id: newProjId || undefined,
            date: selectedDay.date,
            duration: newDuration,
            type: newType,
            description: newDesc,
            is_approved: false
        });
        toast("Zeit gebucht", "success");
        setNewDesc("");
    }

    function handleDeleteEntry(id: string) {
        if (!confirm("Eintrag wirklich löschen?")) return;
        store.deleteTimeEntry(id);
        toast("Eintrag gelöscht", "info");
    }

    const currentEmp = selectedDay ? store.employees.find(e => e.id === selectedDay.empId) : null;
    const currentEntries = selectedDay ? store.timeEntries.filter(t => t.employee_id === selectedDay.empId && t.date === selectedDay.date) : [];

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Plantafel</h1>
                    <p className="text-slate-400 text-sm mt-1">Wochenübersicht: {days[0].label} bis {days[4].label}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
                        <button onClick={() => setOffset((o) => o - 1)} className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={() => setOffset(0)} className="px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">HEUTE</button>
                        <button onClick={() => setOffset((o) => o + 1)} className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </header>

            {/* Planning Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {days.map((day) => {
                    const isToday = day.date === todayStr;
                    return (
                        <div key={day.date} className={`flex flex-col gap-4 ${isToday ? "opacity-100" : "opacity-90"}`}>
                            {/* Day Header */}
                            <div className={`p-4 rounded-2xl border ${isToday ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20" : "bg-slate-900/50 border-slate-800"}`}>
                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? "text-blue-100" : "text-slate-500"}`}>
                                    {day.dayName}
                                </div>
                                <div className={`text-lg font-black mt-1 ${isToday ? "text-white" : "text-slate-200"}`}>
                                    {day.label.split(" ")[1]}
                                </div>
                            </div>

                            {/* Employees for this day */}
                            <div className="space-y-3">
                                {store.employees
                                    .filter(e => store.currentUser?.role?.toLowerCase() === "admin" || e.id === store.currentUser?.id)
                                    .map((emp) => {
                                        const entries = store.timeEntries.filter((t) => t.employee_id === emp.id && t.date === day.date);
                                        return (
                                            <div
                                                key={emp.id}
                                                onClick={() => openManage(emp.id, day.date)}
                                                className="glass rounded-2xl p-4 border border-slate-800/60 hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden"
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style={{ backgroundColor: emp.color }}>
                                                        {emp.first_name[0]}{emp.last_name[0]}
                                                    </div>
                                                    <div className="text-xs font-bold text-white truncate">{emp.first_name}</div>
                                                    <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 ml-auto transition-colors" />
                                                </div>

                                                <div className="space-y-2">
                                                    {entries.length === 0 ? (
                                                        <div className="text-[10px] text-slate-600 italic py-1">Nicht eingeteilt</div>
                                                    ) : (
                                                        entries.map((entry) => {
                                                            const proj = store.projects.find((p) => p.id === entry.project_id);
                                                            const color = proj?.color || "#475569";
                                                            return (
                                                                <div
                                                                    key={entry.id}
                                                                    className="px-2.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                                                        <div className="text-[10px] font-bold text-white truncate">
                                                                            {proj ? proj.name : entry.type.toUpperCase()}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-[9px] text-slate-500 font-medium">
                                                                        {entry.duration}h &bull; {entry.description || "Projektarbeit"}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Manage Day Modal */}
            <Modal
                open={manageModalOpen}
                onClose={() => setManageModalOpen(false)}
                title={selectedDay ? `Einteilung: ${currentEmp?.first_name} ${currentEmp?.last_name} (${formatDate(selectedDay.date)})` : ""}
                size="lg"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1">
                    {/* List of current entries */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Aktuelle Einträge</h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {currentEntries.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                                    <Clock className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                                    <p className="text-xs text-slate-600 italic">Noch keine Einträge für diesen Tag</p>
                                </div>
                            ) : (
                                currentEntries.map(entry => {
                                    const proj = store.projects.find(p => p.id === entry.project_id);
                                    return (
                                        <div key={entry.id} className="glass p-4 rounded-2xl flex items-center justify-between group/item border border-slate-800/60 hover:border-slate-700 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: proj?.color || '#444' }} />
                                                <div>
                                                    <div className="text-sm font-bold text-white">{proj ? proj.name : entry.type.toUpperCase()}</div>
                                                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                                        <Clock className="w-3 h-3" /> {entry.duration} Stunden &bull; {entry.description}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                className="w-8 h-8 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Form to add new entry */}
                    <div className="glass p-6 rounded-3xl space-y-5 bg-blue-500/5 border border-blue-500/20">
                        <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Neuer Eintrag</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Projekt</label>
                                <select
                                    value={newProjId}
                                    onChange={(e) => setNewProjId(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="">-- Sonstige / Kein Projekt --</option>
                                    {store.projects.filter(p => p.status === 'aktiv' || p.status === 'planung').map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Typ</label>
                                    <select
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value as TimeEntryType)}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        {ENTRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Dauer (Std.)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={newDuration}
                                        onChange={(e) => setNewDuration(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Beschreibung / Notiz</label>
                                <textarea
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    placeholder="z.B. Fassade gestrichen, Material geholt..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                />
                            </div>

                            <button
                                onClick={handleAddEntry}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                            >
                                Eintrag speichern
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

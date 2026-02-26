"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import {
    ChevronLeft, ChevronRight, Plus, X, CalendarRange,
    MapPin, Users, Briefcase, UserPlus, Check
} from "lucide-react";
import { useState } from "react";

const DAYS_DE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const DAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getWeekDates(offset = 0): Date[] {
    const now = new Date();
    const day = now.getDay() || 7;
    const mon = new Date(now);
    mon.setDate(now.getDate() - day + 1 + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return d;
    });
}

function dateStr(d: Date) {
    return d.toISOString().split("T")[0];
}

function isToday(d: Date) {
    return dateStr(d) === dateStr(new Date());
}

// A planning assignment: employee → project on a day (stored in timeEntries as type 'arbeit')
// For Plantafel we generate from projects' team[] and timeEntries

interface Assignment {
    timeEntryId?: string;
    employeeId: string;
    projectId?: string;
    date: string;
    note?: string;
}

export default function PlantafelPage() {
    const store = useStore();
    const { toast } = useToast();
    const isAdmin = store.currentUser?.role === "Admin";

    const [weekOffset, setWeekOffset] = useState(0);
    const weekDates = getWeekDates(weekOffset);
    const visibleDays = weekDates.slice(0, 5); // Mon–Fri

    const weekLabel = `${visibleDays[0].toLocaleDateString("de", { day: "2-digit", month: "long" })} – ${visibleDays[4].toLocaleDateString("de", { day: "2-digit", month: "long", year: "numeric" })}`;

    // Filter: which employees to show
    const employees = isAdmin
        ? store.employees.filter(e => e.is_active)
        : store.employees.filter(e => e.id === store.currentUser?.id);

    // Leave requests: employees on leave this week
    const leaveDates = new Set<string>();
    store.leaveRequests
        .filter(r => r.status === "genehmigt")
        .forEach(r => {
            let d = new Date(r.start_date + "T12:00:00");
            const end = new Date(r.end_date + "T12:00:00");
            while (d <= end) {
                leaveDates.add(`${r.employee_id}::${d.toISOString().split("T")[0]}`);
                d.setDate(d.getDate() + 1);
            }
        });

    // Get assignments for a given employee + day (from timeEntries with project)
    function getAssignments(empId: string, date: string) {
        return store.timeEntries.filter(t => t.employee_id === empId && t.date === date && t.type === "arbeit");
    }

    // Modal for adding an assignment
    const [addModal, setAddModal] = useState<{ empId: string; date: string } | null>(null);
    const [selProject, setSelProject] = useState("");
    const [selStart, setSelStart] = useState("07:00");
    const [selEnd, setSelEnd] = useState("15:30");
    const [selNote, setSelNote] = useState("");

    function openAdd(empId: string, date: string) {
        setSelProject(store.projects.filter(p => p.status === "aktiv")[0]?.id || "");
        setSelStart("07:00");
        setSelEnd("15:30");
        setSelNote("");
        setAddModal({ empId, date });
    }

    function saveAssignment() {
        if (!addModal) return;
        const [sh, sm] = selStart.split(":").map(Number);
        const [eh, em] = selEnd.split(":").map(Number);
        const dur = (eh + em / 60) - (sh + sm / 60);
        if (dur <= 0) { toast("Ungültige Zeitspanne", "error"); return; }

        store.addTimeEntry({
            employee_id: addModal.empId,
            project_id: selProject || undefined,
            date: addModal.date,
            start_time: selStart,
            end_time: selEnd,
            duration: Math.round(dur * 100) / 100,
            type: "arbeit",
            description: selNote || undefined,
            is_approved: isAdmin,
        });

        // If project is specified and employee not yet in team, add them
        if (selProject) {
            const proj = store.projects.find(p => p.id === selProject);
            if (proj && !proj.team.includes(addModal.empId)) {
                store.updateProject(proj.id, { team: [...proj.team, addModal.empId] });
            }
        }
        toast("Einsatz geplant ✓", "success");
        setAddModal(null);
    }

    function removeAssignment(timeEntryId: string) {
        store.deleteTimeEntry(timeEntryId);
        toast("Einsatz entfernt", "info");
    }

    // View: compact project overview for the week
    const activeProjects = store.projects.filter(p => p.status === "aktiv" || p.status === "planung");

    return (
        <div className="p-5 lg:p-8 max-w-[1800px] mx-auto animate-in fade-in duration-500 space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl lg:text-4xl font-black text-white tracking-tight">Plantafel</h1>
                    <p className="text-slate-500 text-sm mt-1">{employees.length} Mitarbeiter · {activeProjects.length} aktive Projekte</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setWeekOffset(w => w - 1)} className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl transition">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="px-4 py-2 text-sm font-bold text-white bg-slate-900 border border-slate-800 rounded-xl min-w-[220px] text-center">
                        {weekLabel}
                    </div>
                    <button onClick={() => setWeekOffset(w => w + 1)} className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl transition">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    {weekOffset !== 0 && (
                        <button onClick={() => setWeekOffset(0)} className="px-3 py-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition">
                            Heute
                        </button>
                    )}
                </div>
            </header>

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-500/40" />Projekt geplant</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/30" />Urlaub/Krank</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700" />Frei / Kein Einsatz</span>
                {isAdmin && <span className="text-slate-600 ml-2">Klick auf + um Einsatz zu planen</span>}
            </div>

            {/* Planner Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                    {/* Day Headers */}
                    <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: "200px repeat(5, 1fr)" }}>
                        <div className="px-3 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">Mitarbeiter</div>
                        {visibleDays.map((day, i) => (
                            <div key={i} className={`px-3 py-2 rounded-xl text-center text-xs font-black uppercase tracking-wide transition-colors ${isToday(day) ? "bg-blue-600 text-white" : "bg-slate-900 border border-slate-800 text-slate-400"}`}>
                                <div>{DAYS_SHORT[i]}</div>
                                <div className={`text-base font-black mt-0.5 ${isToday(day) ? "text-white" : "text-white"}`}>
                                    {day.getDate()}
                                </div>
                                <div className={`text-[9px] ${isToday(day) ? "text-blue-200" : "text-slate-600"}`}>
                                    {day.toLocaleDateString("de", { month: "short" })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Employee Rows */}
                    <div className="space-y-2">
                        {employees.map(emp => (
                            <div key={emp.id} className="grid gap-2 items-start" style={{ gridTemplateColumns: "200px repeat(5, 1fr)" }}>
                                {/* Employee Name */}
                                <div className="flex items-center gap-2.5 px-3 py-3 h-full">
                                    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black text-white uppercase" style={{ backgroundColor: emp.color + "30", border: `1px solid ${emp.color}50` }}>
                                        {emp.first_name[0]}{emp.last_name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-white truncate">{emp.first_name} {emp.last_name}</div>
                                        <div className="text-[10px] text-slate-600 truncate">{emp.role}</div>
                                    </div>
                                </div>

                                {/* Day cells */}
                                {visibleDays.map((day, di) => {
                                    const ds = dateStr(day);
                                    const onLeave = leaveDates.has(`${emp.id}::${ds}`);
                                    const assignments = getAssignments(emp.id, ds);
                                    const isWeekend = di >= 5;

                                    return (
                                        <div
                                            key={di}
                                            className={`group relative min-h-[80px] rounded-xl border p-2 transition-all ${onLeave
                                                ? "bg-amber-500/5 border-amber-500/20"
                                                : assignments.length > 0
                                                    ? "bg-slate-900/60 border-slate-800"
                                                    : "bg-slate-900/30 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/60"
                                                } ${isToday(day) ? "ring-1 ring-blue-500/30" : ""}`}
                                        >
                                            {onLeave ? (
                                                <div className="flex flex-col items-center justify-center h-full py-2 text-amber-500/60">
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Abwesend</span>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Assignments */}
                                                    <div className="space-y-1">
                                                        {assignments.map(a => {
                                                            const proj = store.projects.find(p => p.id === a.project_id);
                                                            return (
                                                                <div key={a.id} className="group/tag relative flex items-start gap-1 rounded-lg p-1.5 pr-5 text-[10px] font-bold" style={{
                                                                    backgroundColor: (proj?.color || "#3b82f6") + "20",
                                                                    borderLeft: `3px solid ${proj?.color || "#3b82f6"}`,
                                                                }}>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="text-white leading-tight truncate">{proj?.name || "Allgemein"}</div>
                                                                        <div className="text-slate-500 text-[9px]">{a.start_time}–{a.end_time}</div>
                                                                        {a.description && <div className="text-slate-600 text-[9px] italic truncate">{a.description}</div>}
                                                                    </div>
                                                                    {isAdmin && (
                                                                        <button
                                                                            onClick={() => removeAssignment(a.id)}
                                                                            className="absolute top-1 right-1 opacity-0 group-hover/tag:opacity-100 transition-opacity text-slate-600 hover:text-red-400"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Add button (admin only) */}
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => openAdd(emp.id, ds)}
                                                            className="mt-1 w-full flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-bold text-slate-700 hover:text-slate-400 hover:bg-slate-800 border border-dashed border-slate-800 hover:border-slate-700 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Plus className="w-3 h-3" /> Einsatz
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Project Overview */}
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
                    <div className="md:col-span-2 xl:col-span-3">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Aktive Projekte & Team</h2>
                    </div>
                    {activeProjects.map(proj => {
                        const teamEmps = store.employees.filter(e => proj.team.includes(e.id));
                        const thisWeekHours = store.timeEntries
                            .filter(t => t.project_id === proj.id && visibleDays.map(dateStr).includes(t.date))
                            .reduce((s, t) => s + t.duration, 0);

                        return (
                            <div key={proj.id} className="glass rounded-xl p-4 border border-slate-800/60">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-3 h-8 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-white truncate">{proj.name}</div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{proj.address || "Kein Ort"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${proj.status === "aktiv" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                                        {proj.status}
                                    </span>
                                </div>

                                {/* Progress */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                        <span>Fortschritt</span>
                                        <span className="text-white font-bold">{proj.progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${proj.progress}%`, backgroundColor: proj.color }} />
                                    </div>
                                </div>

                                {/* Team + this week hours */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {teamEmps.map((e, i) => (
                                            <div key={e.id} title={`${e.first_name} ${e.last_name}`} className="w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: e.color, marginLeft: i > 0 ? "-6px" : "0" }}>
                                                {e.first_name[0]}{e.last_name[0]}
                                            </div>
                                        ))}
                                        {teamEmps.length === 0 && <span className="text-[10px] text-slate-600">Kein Team</span>}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        Diese Woche: <span className="text-white font-bold">{thisWeekHours.toFixed(1)}h</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Assignment Modal */}
            <Modal
                open={!!addModal}
                onClose={() => setAddModal(null)}
                title="Einsatz planen"
                size="sm"
                footer={<>
                    <button onClick={() => setAddModal(null)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button>
                    <button onClick={saveAssignment} className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20">Einplanen</button>
                </>}
            >
                {addModal && (
                    <div className="space-y-4">
                        {/* Info */}
                        <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ backgroundColor: (store.employees.find(e => e.id === addModal.empId)?.color || "#3b82f6") + "30" }}>
                                {store.getEmployeeName(addModal.empId).split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">{store.getEmployeeName(addModal.empId)}</div>
                                <div className="text-xs text-slate-500">{new Date(addModal.date + "T12:00:00").toLocaleDateString("de", { weekday: "long", day: "2-digit", month: "long" })}</div>
                            </div>
                        </div>

                        {/* Project */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Projekt</label>
                            <select value={selProject} onChange={e => setSelProject(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                                <option value="">— Allgemein / kein Projekt —</option>
                                {store.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        {/* Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Von</label>
                                <input type="time" value={selStart} onChange={e => setSelStart(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Bis</label>
                                <input type="time" value={selEnd} onChange={e => setSelEnd(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none" />
                            </div>
                        </div>
                        <div className="px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 flex justify-between">
                            <span>Geplante Dauer</span>
                            <span className="font-black text-white">{(() => {
                                const [sh, sm] = selStart.split(":").map(Number);
                                const [eh, em] = selEnd.split(":").map(Number);
                                const d = Math.max(0, (eh + em / 60) - (sh + sm / 60));
                                return `${d.toFixed(1)}h`;
                            })()}</span>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Notiz (optional)</label>
                            <input value={selNote} onChange={e => setSelNote(e.target.value)} placeholder="z.B. Fassade Abschnitt B..." className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none" />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

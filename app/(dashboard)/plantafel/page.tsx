"use client";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { Plus, ChevronLeft, ChevronRight, X, MapPin, Trash2, Edit3, Download, AlertTriangle, CheckCircle2, BarChart3, List, Calendar, CalendarRange } from "lucide-react";
import { useState, useMemo } from "react";
import { today } from "@/lib/utils";
import { TimeEntry } from "@/types";

// ── Helpers ──────────────────────────────────────────────────────────────
function dateStr(d: Date) { return d.toISOString().split("T")[0]; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function getWeekDates(off = 0): Date[] {
    const n = new Date(); const day = n.getDay() || 7;
    const m = new Date(n); m.setDate(n.getDate() - day + 1 + off * 7);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(m); d.setDate(m.getDate() + i); return d; });
}
function getMonthDates(y: number, mo: number): Date[] {
    const first = new Date(y, mo, 1);
    const sd = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, i) => new Date(y, mo, 1 - sd + i));
}
function getKW(d: Date) {
    const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const d0 = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - d0);
    const y = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
    return Math.ceil((((x.getTime() - y.getTime()) / 86400000) + 1) / 7);
}
function calcNetDur(start: string, end: string, pauseMin = 0) {
    const [sh, sm] = start.split(":").map(Number), [eh, em] = end.split(":").map(Number);
    return Math.max(0, (eh + em / 60) - (sh + sm / 60) - pauseMin / 60);
}
function auslastungColor(pct: number) {
    if (pct < 90) return "text-emerald-400";
    if (pct <= 110) return "text-amber-400";
    return "text-red-400";
}
function auslastungBg(pct: number) {
    if (pct < 90) return "bg-emerald-500";
    if (pct <= 110) return "bg-amber-500";
    return "bg-red-500";
}

const TYPE_LABELS: Record<string, string> = { arbeit: "Arbeitszeit", fahrt: "Fahrtzeit", pause: "Pause", urlaub: "Urlaub", krankheit: "Krankheit", schlechtwetter: "Schlechtwetter", schulung: "Schulung" };
type ViewMode = "woche" | "monat" | "liste";

export default function PlantafelPage() {
    const store = useStore();
    const { toast } = useToast();
    const isAdmin = store.currentUser?.role === "Admin";

    const [view, setView] = useState<ViewMode>("woche");
    const [weekOff, setWeekOff] = useState(0);
    const [monthY, setMonthY] = useState(new Date().getFullYear());
    const [monthM, setMonthM] = useState(new Date().getMonth());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filterEmp, setFilterEmp] = useState<string[]>([]);
    const [filterProj, setFilterProj] = useState<string[]>([]);

    // Employees shown (all active, or filtered)
    const activeEmps = store.employees.filter(e => e.is_active);
    const shownEmps = filterEmp.length > 0 ? activeEmps.filter(e => filterEmp.includes(e.id)) : activeEmps;

    // Week navigation
    const weekDates = getWeekDates(weekOff);
    const visDays = weekDates.slice(0, 5); // Mon-Fri
    const kw = getKW(weekDates[0]);
    const weekLabel = `KW ${kw} · ${weekDates[0].toLocaleDateString("de", { day: "2-digit", month: "long" })} – ${weekDates[4].toLocaleDateString("de", { day: "2-digit", month: "long", year: "numeric" })}`;

    // Month navigation
    const monthDates = getMonthDates(monthY, monthM);
    const monthLabel = new Date(monthY, monthM).toLocaleDateString("de", { month: "long", year: "numeric" });
    function prevMonth() { if (monthM === 0) { setMonthY(y => y - 1); setMonthM(11); } else setMonthM(m => m - 1); }
    function nextMonth() { if (monthM === 11) { setMonthY(y => y + 1); setMonthM(0); } else setMonthM(m => m + 1); }

    // Get assignments (time entries with type "arbeit" that have a project)
    function getAssignments(empId: string, ds: string) {
        return store.timeEntries.filter(t => t.employee_id === empId && t.date === ds && t.type === "arbeit");
    }

    // Capacity calculation per employee (current week)
    const capacity = useMemo(() => {
        const result: Record<string, { planned: number; pct: number }> = {};
        shownEmps.forEach(emp => {
            const weekH = visDays.reduce((s, d) => {
                return s + getAssignments(emp.id, dateStr(d)).reduce((x, t) => x + t.duration, 0);
            }, 0);
            const soll = 40;
            result[emp.id] = { planned: weekH, pct: Math.round((weekH / soll) * 100) };
        });
        return result;
    }, [store.timeEntries, shownEmps, weekOff]);

    // Conflicts: same employee, same day, multiple entries
    const conflicts = useMemo(() => {
        const list: { empId: string; date: string; count: number }[] = [];
        shownEmps.forEach(emp => {
            visDays.forEach(d => {
                const ds = dateStr(d);
                const a = getAssignments(emp.id, ds);
                if (a.length > 1) list.push({ empId: emp.id, date: ds, count: a.length });
            });
        });
        return list;
    }, [store.timeEntries, shownEmps, weekOff]);

    // Leave: employees on approved leave
    const leaveDates = useMemo(() => {
        const set = new Set<string>();
        store.leaveRequests.filter(r => r.status === "genehmigt").forEach(r => {
            let d = new Date(r.start_date + "T12:00:00");
            const end = new Date(r.end_date + "T12:00:00");
            while (d <= end) { set.add(`${r.employee_id}::${dateStr(d)}`); d = addDays(d, 1); }
        });
        return set;
    }, [store.leaveRequests]);

    // ── Add/Edit Modal ────────────────────────────────────────────────────
    const [addModal, setAddModal] = useState<{ empId: string; date: string } | null>(null);
    const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);

    const [selProj, setSelProj] = useState("");
    const [selStart, setSelStart] = useState("07:00");
    const [selEnd, setSelEnd] = useState("15:30");
    const [selPause, setSelPause] = useState(30);
    const [selNote, setSelNote] = useState("");
    const dur = calcNetDur(selStart, selEnd, selPause);

    function openAdd(empId: string, date: string) {
        setSelProj(store.projects.filter(p => p.status === "aktiv")[0]?.id || "");
        setSelStart("07:00"); setSelEnd("15:30"); setSelPause(30); setSelNote("");
        setEditEntry(null);
        setAddModal({ empId, date });
    }

    function openEdit(t: TimeEntry) {
        setSelProj(t.project_id || "");
        setSelStart(t.start_time || "07:00"); setSelEnd(t.end_time || "15:30");
        setSelPause(t.pause_minutes || 0); setSelNote(t.description || "");
        setEditEntry(t);
        setAddModal({ empId: t.employee_id, date: t.date });
    }

    function saveAssignment() {
        if (!addModal) return;
        if (dur <= 0) { toast("Ungültige Zeitspanne", "error"); return; }

        // Conflict check: same employee, overlapping time
        if (!editEntry) {
            const overlap = store.timeEntries.find(t =>
                t.employee_id === addModal.empId && t.date === addModal.date &&
                t.id !== editEntry && t.start_time && t.end_time &&
                selStart < t.end_time && selEnd > t.start_time
            );
            if (overlap) {
                const ok = window.confirm(`⚠️ Überschneidung mit bestehendem Eintrag (${overlap.start_time}–${overlap.end_time}).\n\nTrotzdem speichern?`);
                if (!ok) return;
            }
        }

        if (editEntry) {
            store.updateTimeEntry(editEntry.id, { project_id: selProj || undefined, start_time: selStart, end_time: selEnd, pause_minutes: selPause, duration: Math.round(dur * 100) / 100, description: selNote });
            toast("Einsatz aktualisiert ✅", "success");
        } else {
            store.addTimeEntry({ employee_id: addModal.empId, project_id: selProj || undefined, date: addModal.date, start_time: selStart, end_time: selEnd, pause_minutes: selPause, duration: Math.round(dur * 100) / 100, type: "arbeit", description: selNote, is_approved: isAdmin });
            // Add employee to project team
            if (selProj) {
                const proj = store.projects.find(p => p.id === selProj);
                if (proj && !proj.team.includes(addModal.empId)) store.updateProject(proj.id, { team: [...proj.team, addModal.empId] });
            }
            toast("Einsatz geplant ✅", "success");
        }
        setAddModal(null); setEditEntry(null);
    }

    // ── CSV Export ────────────────────────────────────────────────────────
    function exportCSV() {
        const rows = [["Mitarbeiter", "Datum", "Projekt", "Von", "Bis", "Pause(min)", "Stunden", "Notiz"].join(";")];
        store.timeEntries.filter(t => t.type === "arbeit").sort((a, b) => b.date.localeCompare(a.date)).forEach(t => {
            rows.push([store.getEmployeeName(t.employee_id), t.date, store.getProjectName(t.project_id), t.start_time || "", t.end_time || "", String(t.pause_minutes || 0), t.duration.toFixed(2), t.description || ""].join(";"));
        });
        const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `plantafel_${today()}.csv`; a.click();
    }

    return (
        <div className="p-5 lg:p-8 max-w-[1800px] mx-auto space-y-5 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl lg:text-4xl font-black text-white tracking-tight">Plantafel</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500">
                        <span>{shownEmps.length} Mitarbeiter</span>
                        <span>·</span>
                        <span>{store.projects.filter(p => p.status === "aktiv").length} aktive Projekte</span>
                        {conflicts.length > 0 && <span className="flex items-center gap-1 text-amber-400 font-bold"><AlertTriangle className="w-3 h-3" />{conflicts.length} Konflikte</span>}
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"><Download className="w-3.5 h-3.5" />CSV</button>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`flex items-center gap-1.5 px-3 py-2 border text-xs font-bold rounded-xl transition ${sidebarOpen ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}><BarChart3 className="w-3.5 h-3.5" />Kapazitäten</button>
                    {isAdmin && <button onClick={() => openAdd(shownEmps[0]?.id || "", today())} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/20"><Plus className="w-3.5 h-3.5" />Neuer Einsatz</button>}
                </div>
            </header>

            {/* View Toggle + Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
                <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {([["woche", "Woche", CalendarRange], ["monat", "Monat", Calendar], ["liste", "Liste", List]] as const).map(([k, l, I]) => (
                        <button key={k} onClick={() => setView(k)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === k ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}><I className="w-3.5 h-3.5" />{l}</button>
                    ))}
                </div>

                {view === "woche" && <div className="flex items-center gap-2 ml-auto">
                    <button onClick={() => setWeekOff(w => w - 1)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs font-bold text-white min-w-[260px] text-center">{weekLabel}</span>
                    <button onClick={() => setWeekOff(w => w + 1)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400"><ChevronRight className="w-4 h-4" /></button>
                    {weekOff !== 0 && <button onClick={() => setWeekOff(0)} className="px-2.5 py-1 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg">Heute</button>}
                </div>}

                {view === "monat" && <div className="flex items-center gap-2 ml-auto">
                    <button onClick={prevMonth} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm font-bold text-white min-w-[160px] text-center capitalize">{monthLabel}</span>
                    <button onClick={nextMonth} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400"><ChevronRight className="w-4 h-4" /></button>
                </div>}

                {/* Employee filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    {activeEmps.map(emp => (
                        <button key={emp.id} onClick={() => setFilterEmp(f => f.includes(emp.id) ? f.filter(x => x !== emp.id) : [...f, emp.id])}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${filterEmp.includes(emp.id) ? "text-white border-transparent" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"}`}
                            style={filterEmp.includes(emp.id) ? { backgroundColor: emp.color + "40", borderColor: emp.color + "60" } : {}}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: emp.color }} />{emp.first_name}
                        </button>
                    ))}
                    {filterEmp.length > 0 && <button onClick={() => setFilterEmp([])} className="text-[10px] text-slate-600 hover:text-slate-400">Alle</button>}
                </div>
            </div>

            <div className={`flex gap-5 ${sidebarOpen ? "items-start" : ""}`}>
                <div className="flex-1 min-w-0">

                    {/* ═══ WEEK VIEW ═══ */}
                    {view === "woche" && <div className="overflow-x-auto">
                        <div className="min-w-[750px]">
                            {/* Day headers */}
                            <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: "180px repeat(5, 1fr)" }}>
                                <div className="px-2 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">Mitarbeiter</div>
                                {visDays.map((day, i) => {
                                    const isToday = dateStr(day) === today();
                                    return (<div key={i} className={`px-2 py-2.5 rounded-xl text-center text-xs font-black uppercase tracking-wide ${isToday ? "bg-blue-600 text-white" : "bg-slate-900 border border-slate-800 text-slate-400"}`}>
                                        <div>{["Mo", "Di", "Mi", "Do", "Fr"][i]}</div>
                                        <div className="text-base font-black mt-0.5">{day.getDate()}</div>
                                        <div className={`text-[9px] ${isToday ? "text-blue-200" : "text-slate-600"}`}>{day.toLocaleDateString("de", { month: "short" })}</div>
                                    </div>);
                                })}
                            </div>

                            {/* Employee rows */}
                            <div className="space-y-1.5">
                                {shownEmps.map(emp => {
                                    const cap = capacity[emp.id] || { planned: 0, pct: 0 };
                                    return (
                                        <div key={emp.id} className="grid gap-1.5 items-start" style={{ gridTemplateColumns: "180px repeat(5, 1fr)" }}>
                                            {/* Employee col */}
                                            <div className="px-3 py-2.5 glass rounded-xl border border-slate-800/40">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: emp.color + "40", border: `1px solid ${emp.color}50` }}>
                                                        {emp.first_name[0]}{emp.last_name[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[11px] font-bold text-white truncate">{emp.first_name} {emp.last_name}</div>
                                                        <div className="text-[9px] text-slate-600 truncate">{emp.role}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="flex justify-between text-[9px] mb-0.5">
                                                        <span className="text-slate-600">{cap.planned.toFixed(1)}h / 40h</span>
                                                        <span className={`font-black ${auslastungColor(cap.pct)}`}>{cap.pct}%</span>
                                                    </div>
                                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${auslastungBg(cap.pct)}`} style={{ width: `${Math.min(cap.pct, 100)}%` }} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Day cells */}
                                            {visDays.map((day, di) => {
                                                const ds = dateStr(day);
                                                const onLeave = leaveDates.has(`${emp.id}::${ds}`);
                                                const entries = getAssignments(emp.id, ds);
                                                const isToday = ds === today();
                                                const hasConflict = conflicts.some(c => c.empId === emp.id && c.date === ds);

                                                return (
                                                    <div key={di}
                                                        className={`group min-h-[90px] rounded-xl border p-1.5 transition-all cursor-pointer ${onLeave ? "bg-amber-500/5 border-amber-500/20" : hasConflict ? "bg-orange-500/5 border-orange-500/30" : entries.length > 0 ? "bg-slate-900/60 border-slate-800" : "bg-slate-900/30 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/60"} ${isToday ? "ring-1 ring-blue-500/40" : ""}`}
                                                        onDoubleClick={() => isAdmin && !onLeave && openAdd(emp.id, ds)}
                                                    >
                                                        {hasConflict && <div className="mb-1 flex items-center gap-1 text-[9px] font-black text-orange-400"><AlertTriangle className="w-2.5 h-2.5" />Konflikt</div>}
                                                        {onLeave
                                                            ? <div className="flex items-center justify-center h-full py-3 text-[10px] font-black text-amber-500/50 uppercase tracking-wider">Abwesend</div>
                                                            : <>
                                                                <div className="space-y-1">
                                                                    {entries.map(t => {
                                                                        const proj = store.projects.find(p => p.id === t.project_id);
                                                                        return (
                                                                            <div key={t.id} className="relative group/card rounded-lg p-1.5 pr-7 cursor-pointer text-[9px] font-bold transition hover:brightness-110"
                                                                                style={{ backgroundColor: (proj?.color || "#3b82f6") + "25", borderLeft: `3px solid ${proj?.color || "#3b82f6"}` }}
                                                                                onClick={() => openEdit(t)}>
                                                                                <div className="text-white leading-tight truncate">{proj?.name || "Allgemein"}</div>
                                                                                <div className="text-slate-500">{t.start_time}–{t.end_time} · {t.duration.toFixed(1)}h</div>
                                                                                {t.description && <div className="text-slate-600 italic truncate">{t.description}</div>}
                                                                                {isAdmin && <button onClick={e => { e.stopPropagation(); store.deleteTimeEntry(t.id); toast("Entfernt", "info"); }} className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 text-slate-600 hover:text-red-400 transition"><X className="w-3 h-3" /></button>}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {isAdmin && <button onClick={() => openAdd(emp.id, ds)} className="mt-1 w-full flex items-center justify-center gap-0.5 py-1 rounded text-[9px] text-slate-700 hover:text-slate-400 border border-dashed border-slate-800 hover:border-slate-700 transition opacity-0 group-hover:opacity-100">
                                                                    <Plus className="w-2.5 h-2.5" />Einsatz
                                                                </button>}
                                                            </>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}

                                {shownEmps.length === 0 && <div className="text-center py-12 text-slate-600 text-sm">Keine Mitarbeiter</div>}
                            </div>
                        </div>
                    </div>}

                    {/* ═══ MONTH VIEW ═══ */}
                    {view === "monat" && <div className="glass rounded-xl border border-slate-800/60 p-4">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(d => <div key={d} className="text-[10px] font-black text-slate-600 uppercase text-center py-1">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {monthDates.map((day, i) => {
                                const ds = dateStr(day);
                                const inMonth = day.getMonth() === monthM;
                                const isToday = ds === today();
                                const dayEntries = store.timeEntries.filter(t => t.date === ds && t.type === "arbeit" && (filterEmp.length === 0 || filterEmp.includes(t.employee_id)));
                                const empCount = new Set(dayEntries.map(t => t.employee_id)).size;
                                const isWeekend = [5, 6].includes(i % 7);
                                const bg = empCount === 0 ? "" : empCount >= 4 ? "bg-emerald-500/10 border-emerald-500/10" : "bg-blue-500/10 border-blue-500/10";
                                return (
                                    <div key={i} className={`rounded-lg border p-1.5 min-h-[64px] transition ${!inMonth ? "opacity-20" : ""} ${isWeekend ? "bg-slate-950/40 border-slate-900" : `bg-slate-900/40 border-slate-800/50 ${bg}`} ${isToday ? "ring-1 ring-blue-500/50" : ""}`}>
                                        <div className={`text-xs font-bold ${isToday ? "text-blue-400" : "text-slate-400"}`}>{day.getDate()}</div>
                                        {inMonth && empCount > 0 && <div className="mt-1">
                                            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black rounded border border-blue-500/20">{empCount}M</span>
                                            {dayEntries.slice(0, 2).map(t => {
                                                const proj = store.projects.find(p => p.id === t.project_id);
                                                return <div key={t.id} className="mt-0.5 text-[8px] truncate font-bold" style={{ color: proj?.color || "#94a3b8" }}>{store.getEmployeeName(t.employee_id).split(" ")[0]}</div>;
                                            })}
                                        </div>}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-[9px] font-bold text-slate-600 uppercase">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500/20 border border-blue-500/20" />1–3 MA</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/20" />4+ MA</span>
                        </div>
                    </div>}

                    {/* ═══ LIST VIEW ═══ */}
                    {view === "liste" && <div className="glass rounded-xl overflow-hidden border border-slate-800/60">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="bg-slate-950/60 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                    <th className="px-4 py-3">Mitarbeiter</th><th className="px-4 py-3">Datum</th><th className="px-4 py-3">Projekt</th><th className="px-4 py-3 text-center">Zeit</th><th className="px-4 py-3 text-center">Pause</th><th className="px-4 py-3 text-center">Stunden</th><th className="px-4 py-3 text-center">Status</th>{isAdmin && <th className="px-4 py-3" />}
                                </tr></thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {store.timeEntries.filter(t => t.type === "arbeit" && (filterEmp.length === 0 || filterEmp.includes(t.employee_id)) && (filterProj.length === 0 || filterProj.includes(t.project_id || ""))).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50).map(t => {
                                        const proj = store.projects.find(p => p.id === t.project_id);
                                        const emp = store.employees.find(e => e.id === t.employee_id);
                                        return (
                                            <tr key={t.id} className="group hover:bg-white/[0.015] transition">
                                                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: (emp?.color || "#555") + "40" }}>{emp?.first_name[0]}{emp?.last_name[0]}</div><span className="text-xs font-bold text-white">{store.getEmployeeName(t.employee_id)}</span></div></td>
                                                <td className="px-4 py-3 text-xs text-slate-300 font-mono">{new Date(t.date + "T12:00:00").toLocaleDateString("de", { weekday: "short", day: "2-digit", month: "2-digit", year: "2-digit" })}</td>
                                                <td className="px-4 py-3"><div className="flex items-center gap-1.5">{proj && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />}<span className="text-xs text-white">{proj?.name || "—"}</span></div>{t.description && <div className="text-[10px] text-slate-600 italic truncate max-w-[160px]">{t.description}</div>}</td>
                                                <td className="px-4 py-3 text-center text-xs text-slate-400 font-mono">{t.start_time}–{t.end_time}</td>
                                                <td className="px-4 py-3 text-center text-xs text-slate-500">{t.pause_minutes || 0}m</td>
                                                <td className="px-4 py-3 text-center text-sm font-black text-white">{t.duration.toFixed(1)}h</td>
                                                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${t.is_approved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>{t.is_approved ? "✅" : "⏳"}</span></td>
                                                {isAdmin && <td className="px-4 py-3"><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                    <button onClick={() => openEdit(t)} className="p-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md"><Edit3 className="w-3 h-3" /></button>
                                                    <button onClick={() => { store.deleteTimeEntry(t.id); toast("Gelöscht", "info"); }} className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md"><Trash2 className="w-3 h-3" /></button>
                                                </div></td>}
                                            </tr>
                                        );
                                    })}
                                    {store.timeEntries.filter(t => t.type === "arbeit").length === 0 && <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-600 text-sm">Keine Einsätze geplant</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>}

                </div>

                {/* ═══ CAPACITY SIDEBAR ═══ */}
                {sidebarOpen && <div className="w-72 shrink-0 space-y-3">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Auslastung (diese Woche)</h3>
                    {shownEmps.map(emp => {
                        const cap = capacity[emp.id] || { planned: 0, pct: 0 };
                        const empEntries = visDays.flatMap(d => getAssignments(emp.id, dateStr(d)));
                        const projects = [...new Set(empEntries.map(t => t.project_id).filter(Boolean))];
                        return (
                            <div key={emp.id} className="glass rounded-xl p-3.5 border border-slate-800/60">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black text-white shrink-0" style={{ backgroundColor: emp.color + "40" }}>{emp.first_name[0]}{emp.last_name[0]}</div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{emp.first_name} {emp.last_name}</div>
                                            <div className="text-[9px] text-slate-600">{emp.role}</div>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-black ${auslastungColor(cap.pct)}`}>{cap.pct}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                                    <div className={`h-full rounded-full transition-all ${auslastungBg(cap.pct)}`} style={{ width: `${Math.min(cap.pct, 100)}%` }} />
                                </div>
                                <div className="text-[10px] text-slate-500 mb-2">{cap.planned.toFixed(1)}h / 40h geplant</div>
                                {projects.length > 0 && <div className="space-y-1">
                                    {projects.map(pid => {
                                        const proj = store.projects.find(p => p.id === pid);
                                        const h = empEntries.filter(t => t.project_id === pid).reduce((s, t) => s + t.duration, 0);
                                        return (<div key={pid} className="flex items-center justify-between text-[10px]">
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: proj?.color || "#555" }} /><span className="text-slate-400 truncate max-w-[140px]">{proj?.name || "Allgemein"}</span></div>
                                            <span className="text-white font-bold">{h.toFixed(1)}h</span>
                                        </div>);
                                    })}
                                </div>}
                                {cap.pct > 100 && <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1"><AlertTriangle className="w-2.5 h-2.5" />Überlastet!</div>}
                            </div>
                        );
                    })}

                    {/* Conflict center */}
                    {conflicts.length > 0 && <div className="glass rounded-xl p-3.5 border border-orange-500/20 bg-orange-500/5">
                        <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" />{conflicts.length} Konflikte</h4>
                        <div className="space-y-2">
                            {conflicts.map((c, i) => (
                                <div key={i} className="text-[10px] text-slate-400">
                                    <div className="font-bold text-white">{store.getEmployeeName(c.empId)}</div>
                                    <div>{new Date(c.date + "T12:00:00").toLocaleDateString("de", { weekday: "short", day: "2-digit", month: "2-digit" })} — {c.count}× eingeplant</div>
                                </div>
                            ))}
                        </div>
                    </div>}

                    {/* Project legend */}
                    <div className="glass rounded-xl p-3.5 border border-slate-800/60">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Aktive Projekte</h4>
                        <div className="space-y-1.5">
                            {store.projects.filter(p => p.status === "aktiv" || p.status === "planung").map(proj => {
                                const weekH = visDays.flatMap(d => store.timeEntries.filter(t => t.project_id === proj.id && t.date === dateStr(d))).reduce((s, t) => s + t.duration, 0);
                                return (<div key={proj.id} className="flex items-center gap-2">
                                    <div className="w-2.5 h-8 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[10px] font-bold text-white truncate">{proj.name}</div>
                                        <div className="flex items-center justify-between text-[9px] text-slate-600"><span>{proj.status}</span><span className="text-white">{weekH.toFixed(1)}h/Woche</span></div>
                                    </div>
                                </div>);
                            })}
                        </div>
                    </div>
                </div>}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap text-[10px] font-bold text-slate-600 uppercase pb-2">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500/25 border-l-2 border-blue-500" />Einsatz geplant</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/30" />Urlaub/Abwesend</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-500/20 border border-orange-500/30" />Konflikt</span>
                {isAdmin && <span className="text-slate-700">Doppelklick auf Zelle = Einsatz planen</span>}
            </div>

            {/* Add/Edit Modal */}
            <Modal open={!!addModal} onClose={() => { setAddModal(null); setEditEntry(null); }} title={editEntry ? "Einsatz bearbeiten" : "Einsatz planen"} size="md"
                footer={<>
                    {editEntry && isAdmin && <button onClick={() => { store.deleteTimeEntry(editEntry.id); toast("Gelöscht", "info"); setAddModal(null); setEditEntry(null); }} className="px-4 py-2 text-sm font-bold text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl mr-auto">Löschen</button>}
                    <button onClick={() => { setAddModal(null); setEditEntry(null); }} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button>
                    <button onClick={saveAssignment} className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">Speichern</button>
                </>}>
                {addModal && (<div className="space-y-4">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ backgroundColor: (store.employees.find(e => e.id === addModal.empId)?.color || "#3b82f6") + "40" }}>
                                {store.getEmployeeName(addModal.empId).split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">{store.getEmployeeName(addModal.empId)}</div>
                                <div className="text-xs text-slate-500">{new Date(addModal.date + "T12:00:00").toLocaleDateString("de", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Projekt</label>
                        <select value={selProj} onChange={e => setSelProj(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                            <option value="">— Kein Projekt / Allgemein —</option>
                            {store.projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.status})</option>)}
                        </select>
                        {selProj && (() => { const proj = store.projects.find(p => p.id === selProj); return proj?.address ? <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500"><MapPin className="w-3 h-3" />{proj.address}</div> : null; })()}
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Von</label><input type="time" value={selStart} onChange={e => setSelStart(e.target.value)} className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Bis</label><input type="time" value={selEnd} onChange={e => setSelEnd(e.target.value)} className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Pause (min)</label><input type="number" min={0} max={480} step={15} value={selPause} onChange={e => setSelPause(Number(e.target.value))} className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white outline-none" /></div>
                    </div>

                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm ${dur > 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                        <span className="text-slate-400">Netto-Stunden:</span>
                        <span className={`font-black ${dur > 0 ? "text-emerald-400" : "text-red-400"}`}>{dur > 0 ? `${dur.toFixed(2)}h` : "ungültig"}</span>
                    </div>

                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Notiz (optional)</label><input value={selNote} onChange={e => setSelNote(e.target.value)} placeholder="z.B. Material vorbestellen, Abschnitt B..." className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none" /></div>

                    {/* Live conflict warning */}
                    {addModal && !editEntry && (() => {
                        const ov = store.timeEntries.find(t => t.employee_id === addModal.empId && t.date === addModal.date && t.start_time && t.end_time && selStart < t.end_time && selEnd > t.start_time);
                        return ov ? (<div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl"><AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" /><div className="text-xs text-orange-300"><div className="font-bold mb-0.5">Überschneidung erkannt!</div><div className="text-orange-400">{store.getProjectName(ov.project_id)} ({ov.start_time}–{ov.end_time})</div></div></div>) : null;
                    })()}
                </div>)}
            </Modal>
        </div>
    );
}

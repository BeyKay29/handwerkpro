"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatDate, today } from "@/lib/utils";
import {
    Plus, Clock, Play, Square, CheckCircle2, XCircle,
    Calendar, Users, Briefcase, Search, ChevronLeft, ChevronRight,
    Trash2, MessageSquare, PalmtreeIcon, AlertCircle, Filter, Download
} from "lucide-react";
import { useState, useEffect } from "react";
import { LeaveRequest, TimeEntry } from "@/types";

const typeColors: Record<string, string> = {
    arbeit: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    fahrt: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    pause: "bg-slate-500/15 text-slate-400 border-slate-700",
    urlaub: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    krankheit: "bg-red-500/15 text-red-400 border-red-500/20",
};
const typeLabels: Record<string, string> = { arbeit: "Arbeit", fahrt: "Fahrt", pause: "Pause", urlaub: "Urlaub", krankheit: "Krankheit" };

const leaveTypeColors: Record<string, string> = {
    urlaub: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    krankheit: "bg-red-500/10 text-red-400 border-red-500/20",
    sonderurlaub: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    freizeitausgleich: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};
const leaveTypeLabels: Record<string, string> = {
    urlaub: "Urlaub",
    krankheit: "Krankmeldung",
    sonderurlaub: "Sonderurlaub",
    freizeitausgleich: "Freizeitausgleich",
};
const leaveStatusColors: Record<string, string> = {
    beantragt: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    genehmigt: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    abgelehnt: "bg-red-500/10 text-red-400 border-red-500/20",
    storniert: "bg-slate-500/10 text-slate-500 border-slate-700",
};
const leaveStatusLabels: Record<string, string> = {
    beantragt: "Beantragt",
    genehmigt: "Genehmigt",
    abgelehnt: "Abgelehnt",
    storniert: "Storniert",
};

type Tab = "zeiten" | "urlaub";

export default function ZeitenPage() {
    const store = useStore();
    const { toast } = useToast();
    const isAdmin = store.currentUser?.role === "Admin";
    const [tab, setTab] = useState<Tab>("zeiten");

    // Live timer
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerProject, setTimerProject] = useState("");
    const [timerDesc, setTimerDesc] = useState("");
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (store.activeTimer) {
            const start = new Date(store.activeTimer.startTime).getTime();
            const tick = () => setTimerSeconds(Math.floor((Date.now() - start) / 1000));
            tick();
            interval = setInterval(tick, 1000);
            setTimerProject(store.activeTimer.projectId || "");
            setTimerDesc(store.activeTimer.description || "");
        } else {
            setTimerSeconds(0);
        }
        return () => clearInterval(interval);
    }, [store.activeTimer]);

    const formatTimer = (s: number) => {
        const h = String(Math.floor(s / 3600)).padStart(2, "0");
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${h}:${m}:${sec}`;
    };

    function startTimer() {
        if (!store.currentUser) { toast("Bitte einloggen", "error"); return; }
        store.startTimer(timerProject || undefined, timerDesc || undefined);
        toast("Zeiterfassung gestartet", "success");
    }
    function stopTimer() {
        store.stopTimer();
        toast("Zeit erfolgreich gebucht", "success");
    }

    // Filters
    const [search, setSearch] = useState("");
    const [filterEmp, setFilterEmp] = useState(isAdmin ? "" : (store.currentUser?.id || ""));
    const [filterWeekOffset, setFilterWeekOffset] = useState(0);

    const getWeekDates = (offset = 0) => {
        const now = new Date();
        const day = now.getDay() || 7;
        const mon = new Date(now);
        mon.setDate(now.getDate() - day + 1 + offset * 7);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(mon);
            d.setDate(mon.getDate() + i);
            return d.toISOString().split("T")[0];
        });
    };
    const weekDates = getWeekDates(filterWeekOffset);
    const weekLabel = `${new Date(weekDates[0]).toLocaleDateString("de", { day: "2-digit", month: "short" })} – ${new Date(weekDates[6]).toLocaleDateString("de", { day: "2-digit", month: "short", year: "numeric" })}`;

    const filteredEntries = store.timeEntries.filter(e => {
        const emp = filterEmp ? e.employee_id === filterEmp : true;
        const inWeek = weekDates.includes(e.date);
        const q = search.toLowerCase();
        const matchSearch = !search || store.getEmployeeName(e.employee_id).toLowerCase().includes(q) || store.getProjectName(e.project_id).toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q);
        return emp && inWeek && matchSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));

    const totalHours = filteredEntries.reduce((s, e) => s + e.duration, 0);
    const pendingCount = store.timeEntries.filter(e => !e.is_approved).length;

    // Manual entry modal
    const [manualOpen, setManualOpen] = useState(false);
    const [empId, setEmpId] = useState(store.currentUser?.id || "");
    const [projId, setProjId] = useState("");
    const [entDate, setEntDate] = useState(today());
    const [entStart, setEntStart] = useState("07:00");
    const [entEnd, setEntEnd] = useState("15:30");
    const [entType, setEntType] = useState("arbeit");
    const [entDesc, setEntDesc] = useState("");

    function openManual() {
        setEmpId(store.currentUser?.id || store.employees[0]?.id || "");
        setProjId(""); setEntDate(today()); setEntStart("07:00"); setEntEnd("15:30"); setEntType("arbeit"); setEntDesc("");
        setManualOpen(true);
    }
    function saveManual() {
        const [sh, sm] = entStart.split(":").map(Number);
        const [eh, em] = entEnd.split(":").map(Number);
        const dur = (eh + em / 60) - (sh + sm / 60);
        if (dur <= 0) { toast("Ungültige Zeitspanne", "error"); return; }
        store.addTimeEntry({ employee_id: empId, project_id: projId || undefined, date: entDate, start_time: entStart, end_time: entEnd, duration: Math.round(dur * 100) / 100, type: entType as any, description: entDesc, is_approved: false });
        toast("Eintrag gespeichert", "success");
        setManualOpen(false);
    }

    // Approve/Reject time entry modal
    const [actionEntry, setActionEntry] = useState<TimeEntry | null>(null);
    const [actionNote, setActionNote] = useState("");
    const [actionType, setActionType] = useState<"approve" | "reject">("approve");

    function openAction(entry: TimeEntry, type: "approve" | "reject") {
        setActionEntry(entry);
        setActionNote("");
        setActionType(type);
    }
    function executeAction() {
        if (!actionEntry) return;
        if (actionType === "approve") {
            store.approveTimeEntry(actionEntry.id, actionNote || undefined);
            toast("Eintrag genehmigt", "success");
        } else {
            if (!actionNote.trim()) { toast("Bitte eine Begründung eingeben", "error"); return; }
            store.rejectTimeEntry(actionEntry.id, actionNote);
            toast("Eintrag abgelehnt", "warning");
        }
        setActionEntry(null);
    }

    // Leave requests
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [leaveType, setLeaveType] = useState<"urlaub" | "krankheit" | "sonderurlaub" | "freizeitausgleich">("urlaub");
    const [leaveStart, setLeaveStart] = useState(today());
    const [leaveEnd, setLeaveEnd] = useState(today());
    const [leaveReason, setLeaveReason] = useState("");

    function calcDays(start: string, end: string) {
        const ms = new Date(end).getTime() - new Date(start).getTime();
        return Math.max(1, Math.floor(ms / 86400000) + 1);
    }
    function saveLeave() {
        if (!store.currentUser) return;
        store.addLeaveRequest({ employee_id: store.currentUser.id, type: leaveType, start_date: leaveStart, end_date: leaveEnd, days: calcDays(leaveStart, leaveEnd), reason: leaveReason });
        toast("Antrag eingereicht", "success");
        setLeaveOpen(false);
    }

    const [leaveActionId, setLeaveActionId] = useState<string | null>(null);
    const [leaveNote, setLeaveNote] = useState("");
    const [leaveAction, setLeaveAction] = useState<"genehmigen" | "ablehnen">("genehmigen");

    function openLeaveAction(id: string, action: "genehmigen" | "ablehnen") {
        setLeaveActionId(id);
        setLeaveNote("");
        setLeaveAction(action);
    }
    function executeLeaveAction() {
        if (!leaveActionId) return;
        if (leaveAction === "genehmigen") {
            store.approveLeaveRequest(leaveActionId, leaveNote || undefined);
            toast("Antrag genehmigt", "success");
        } else {
            if (!leaveNote.trim()) { toast("Bitte Begründung eingeben", "error"); return; }
            store.rejectLeaveRequest(leaveActionId, leaveNote);
            toast("Antrag abgelehnt", "warning");
        }
        setLeaveActionId(null);
    }

    const leaveRequests = isAdmin
        ? [...store.leaveRequests].sort((a, b) => b.created_at.localeCompare(a.created_at))
        : store.leaveRequests.filter(r => r.employee_id === store.currentUser?.id).sort((a, b) => b.created_at.localeCompare(a.created_at));

    const pendingLeave = store.leaveRequests.filter(r => r.status === "beantragt").length;

    return (
        <div className="p-5 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl lg:text-4xl font-black text-white tracking-tight">Zeiterfassung</h1>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {pendingCount > 0 && isAdmin && (
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest">
                                <AlertCircle className="w-3 h-3" />{pendingCount} ausstehend
                            </span>
                        )}
                        {pendingLeave > 0 && isAdmin && (
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest">
                                <PalmtreeIcon className="w-3 h-3" />{pendingLeave} Urlaubsanträge
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={() => setLeaveOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-sm font-bold rounded-xl transition-all">
                        <PalmtreeIcon className="w-4 h-4" /> Abwesenheit beantragen
                    </button>
                    <button onClick={openManual} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-bold rounded-xl transition-all">
                        <Plus className="w-4 h-4" /> Manuell erfassen
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900 p-1 rounded-xl w-fit border border-slate-800">
                {([["zeiten", "Stunden & Zeiten", Clock], ["urlaub", "Abwesenheiten", PalmtreeIcon]] as const).map(([key, label, Icon]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key as Tab)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === key ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                        {key === "urlaub" && pendingLeave > 0 && isAdmin && (
                            <span className="w-4 h-4 bg-amber-500 rounded-full text-[9px] font-black text-slate-950 flex items-center justify-center">{pendingLeave}</span>
                        )}
                    </button>
                ))}
            </div>

            {tab === "zeiten" && (
                <>
                    {/* Timer */}
                    <div className="glass rounded-2xl p-6 border-blue-500/10 bg-blue-500/[0.02]">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Live-Timer</div>
                                <div className={`font-display text-5xl font-black tabular-nums ${store.activeTimer ? "text-white" : "text-slate-600"}`}>
                                    {formatTimer(timerSeconds)}
                                </div>
                                {store.activeTimer && (
                                    <div className="text-xs text-slate-400 mt-1">
                                        {store.getProjectName(store.activeTimer.projectId)} {store.activeTimer.description ? `— ${store.activeTimer.description}` : ""}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                                <select
                                    disabled={!!store.activeTimer}
                                    value={timerProject}
                                    onChange={e => setTimerProject(e.target.value)}
                                    className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none disabled:opacity-40"
                                >
                                    <option value="">— kein Projekt —</option>
                                    {store.projects.filter(p => p.status === "aktiv").map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input
                                    disabled={!!store.activeTimer}
                                    value={timerDesc}
                                    onChange={e => setTimerDesc(e.target.value)}
                                    placeholder="Notiz (optional)"
                                    className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none disabled:opacity-40"
                                />
                                {store.activeTimer ? (
                                    <button onClick={stopTimer} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-all shadow-lg shadow-red-500/20 animate-pulse shrink-0">
                                        <Square className="w-4 h-4 fill-current" /> STOPP
                                    </button>
                                ) : (
                                    <button onClick={startTimer} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 shrink-0">
                                        <Play className="w-4 h-4 fill-current" /> START
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filters + Week Navigation */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex-1 max-w-xs">
                            <Search className="w-4 h-4 text-slate-500" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche..." className="bg-transparent text-sm text-white outline-none flex-1 placeholder-slate-600" />
                        </div>
                        {isAdmin && (
                            <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                                <option value="">Alle Mitarbeiter</option>
                                {store.employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                            </select>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                            <button onClick={() => setFilterWeekOffset(w => w - 1)} className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 transition"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="text-xs font-bold text-slate-300 min-w-[160px] text-center">{weekLabel}</span>
                            <button onClick={() => setFilterWeekOffset(w => w + 1)} className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 transition"><ChevronRight className="w-4 h-4" /></button>
                            {filterWeekOffset !== 0 && <button onClick={() => setFilterWeekOffset(0)} className="px-2.5 py-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition">Heute</button>}
                        </div>
                        <div className="text-xs font-bold text-slate-400">
                            <span className="text-white">{totalHours.toFixed(1)}h</span> diese Woche · {filteredEntries.length} Einträge
                        </div>
                    </div>

                    {/* Time Journal Table */}
                    <div className="glass rounded-2xl overflow-hidden border border-slate-800/60">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-950/60 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                        <th className="px-6 py-4">Datum</th>
                                        <th className="px-6 py-4">Mitarbeiter</th>
                                        <th className="px-6 py-4">Projekt / Beschreibung</th>
                                        <th className="px-6 py-4 text-center">Zeit</th>
                                        <th className="px-6 py-4 text-center">Dauer</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        {isAdmin && <th className="px-6 py-4"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {filteredEntries.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-600 text-sm">Keine Einträge in dieser Woche</td></tr>
                                    ) : filteredEntries.map(e => (
                                        <tr key={e.id} className="group hover:bg-white/[0.015] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-white">{new Date(e.date + "T12:00:00").toLocaleDateString("de", { weekday: "short", day: "2-digit", month: "2-digit" })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white uppercase" style={{ backgroundColor: store.employees.find(emp => emp.id === e.employee_id)?.color + "40", border: `1px solid ${store.employees.find(emp => emp.id === e.employee_id)?.color}40` }}>
                                                        {store.getEmployeeName(e.employee_id).split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <span className="text-sm font-bold text-white">{store.getEmployeeName(e.employee_id)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-white">{store.getProjectName(e.project_id)}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${typeColors[e.type]}`}>{typeLabels[e.type]}</span>
                                                    {e.description && <span className="text-[10px] text-slate-500 italic truncate max-w-[200px]">{e.description}</span>}
                                                </div>
                                                {e.admin_note && (
                                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-400 italic">
                                                        <MessageSquare className="w-3 h-3" /> {e.admin_note}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-xs text-slate-400 font-mono">{e.start_time} – {e.end_time}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm font-black text-white">{e.duration.toFixed(1)}h</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${e.is_approved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
                                                    {e.is_approved ? <><CheckCircle2 className="w-3 h-3" /> Genehmigt</> : "Offen"}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!e.is_approved && (
                                                            <button onClick={() => openAction(e, "approve")} title="Genehmigen" className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button onClick={() => openAction(e, "reject")} title="Ablehnen / Notiz" className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-all">
                                                            <MessageSquare className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => { store.deleteTimeEntry(e.id); toast("Eintrag gelöscht", "info"); }} title="Löschen" className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {tab === "urlaub" && (
                <>
                    <div className="glass rounded-2xl overflow-hidden border border-slate-800/60">
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                {isAdmin ? "Alle Abwesenheitsanträge" : "Meine Abwesenheiten"}
                            </h3>
                            <span className="text-xs text-slate-500">{leaveRequests.length} Einträge</span>
                        </div>
                        <div className="divide-y divide-slate-800/40">
                            {leaveRequests.length === 0 ? (
                                <div className="py-12 text-center text-slate-600 text-sm">Keine Anträge vorhanden</div>
                            ) : leaveRequests.map(r => {
                                const emp = store.employees.find(e => e.id === r.employee_id);
                                return (
                                    <div key={r.id} className="px-6 py-4 hover:bg-white/[0.01] group transition">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div className="flex items-center gap-3">
                                                {isAdmin && emp && (
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ backgroundColor: emp.color + "30", border: `1px solid ${emp.color}30` }}>
                                                        {emp.first_name[0]}{emp.last_name[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    {isAdmin && <div className="text-sm font-bold text-white">{emp?.first_name} {emp?.last_name}</div>}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${leaveTypeColors[r.type]}`}>{leaveTypeLabels[r.type]}</span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${leaveStatusColors[r.status]}`}>{leaveStatusLabels[r.status]}</span>
                                                        <span className="text-xs text-slate-400">{r.days} {r.days === 1 ? "Tag" : "Tage"}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {new Date(r.start_date + "T12:00:00").toLocaleDateString("de", { day: "2-digit", month: "long" })} – {new Date(r.end_date + "T12:00:00").toLocaleDateString("de", { day: "2-digit", month: "long", year: "numeric" })}
                                                    </div>
                                                    {r.reason && <div className="text-xs text-slate-500 mt-0.5 italic">{r.reason}</div>}
                                                    {r.admin_note && (
                                                        <div className="flex items-start gap-1 mt-1.5 px-2 py-1 bg-slate-900 rounded-lg border border-slate-800">
                                                            <MessageSquare className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                                                            <span className="text-[10px] text-slate-400 italic">{r.admin_note}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {isAdmin && r.status === "beantragt" && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openLeaveAction(r.id, "genehmigen")} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-all">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Genehmigen
                                                    </button>
                                                    <button onClick={() => openLeaveAction(r.id, "ablehnen")} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all">
                                                        <XCircle className="w-3.5 h-3.5" /> Ablehnen
                                                    </button>
                                                </div>
                                            )}
                                            {!isAdmin && r.status === "beantragt" && (
                                                <button onClick={() => { store.updateLeaveRequest(r.id, { status: "storniert" }); toast("Antrag storniert", "info"); }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 text-xs font-bold rounded-lg transition-all">Stornieren</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Manual Entry Modal */}
            <Modal open={manualOpen} onClose={() => setManualOpen(false)} title="Zeit manuell erfassen" size="md"
                footer={<>
                    <button onClick={() => setManualOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-white border border-slate-800 rounded-xl transition-all">Abbrechen</button>
                    <button onClick={saveManual} className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20">Speichern</button>
                </>}>
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Mitarbeiter</label>
                            <select disabled={!isAdmin} value={empId} onChange={e => setEmpId(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none disabled:opacity-60">
                                {store.employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Projekt</label>
                            <select value={projId} onChange={e => setProjId(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                                <option value="">— kein Projekt —</option>
                                {store.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="col-span-3 sm:col-span-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Datum</label>
                            <input type="date" value={entDate} onChange={e => setEntDate(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Von</label>
                            <input type="time" value={entStart} onChange={e => setEntStart(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Bis</label>
                            <input type="time" value={entEnd} onChange={e => setEntEnd(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tätigkeitstyp</label>
                        <div className="grid grid-cols-5 gap-2">
                            {Object.entries(typeLabels).map(([k, v]) => (
                                <button key={k} onClick={() => setEntType(k)} className={`py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${entType === k ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"}`}>{v}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Notiz</label>
                        <textarea value={entDesc} onChange={e => setEntDesc(e.target.value)} placeholder="z.B. Wände gespachtelt, Material geholt..." rows={2} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none resize-none" />
                    </div>
                </div>
            </Modal>

            {/* Admin Action Modal (approve/reject time entry) */}
            <Modal open={!!actionEntry} onClose={() => setActionEntry(null)} title={actionType === "approve" ? "Eintrag genehmigen" : "Eintrag ablehnen / Notiz"} size="sm"
                footer={<>
                    <button onClick={() => setActionEntry(null)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button>
                    <button onClick={executeAction} className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"}`}>
                        {actionType === "approve" ? "Genehmigen" : "Ablehnen"}
                    </button>
                </>}>
                {actionEntry && (
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-sm">
                            <div className="font-bold text-white">{store.getEmployeeName(actionEntry.employee_id)}</div>
                            <div className="text-slate-400 text-xs mt-1">{formatDate(actionEntry.date)} · {actionEntry.duration.toFixed(1)}h · {store.getProjectName(actionEntry.project_id)}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{actionType === "approve" ? "Notiz (optional)" : "Begründung (erforderlich)"}</label>
                            <textarea value={actionNote} onChange={e => setActionNote(e.target.value)} placeholder={actionType === "approve" ? "Optionale Bemerkung..." : "Begründung für Ablehnung..."} rows={3} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none resize-none" />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Leave Request Modal */}
            <Modal open={leaveOpen} onClose={() => setLeaveOpen(false)} title="Abwesenheit beantragen" size="sm"
                footer={<>
                    <button onClick={() => setLeaveOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button>
                    <button onClick={saveLeave} className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all">Einreichen</button>
                </>}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Art der Abwesenheit</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["urlaub", "krankheit", "sonderurlaub", "freizeitausgleich"] as const).map(k => (
                                <button key={k} onClick={() => setLeaveType(k)} className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left ${leaveType === k ? "bg-amber-500/10 border-amber-500/40 text-amber-400" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"}`}>
                                    {leaveTypeLabels[k]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Von</label>
                            <input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Bis</label>
                            <input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 rounded-xl px-3 py-2 border border-slate-800">
                        <span>Berechnung:</span>
                        <span className="font-black text-white">{calcDays(leaveStart, leaveEnd)} {calcDays(leaveStart, leaveEnd) === 1 ? "Tag" : "Tage"}</span>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Begründung (optional)</label>
                        <textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} placeholder="z.B. Familienurlaub, Arzttermin..." rows={2} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none resize-none" />
                    </div>
                </div>
            </Modal>

            {/* Leave Action Modal (admin approve/reject) */}
            <Modal open={!!leaveActionId} onClose={() => setLeaveActionId(null)} title={leaveAction === "genehmigen" ? "Antrag genehmigen" : "Antrag ablehnen"} size="sm"
                footer={<>
                    <button onClick={() => setLeaveActionId(null)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button>
                    <button onClick={executeLeaveAction} className={`px-5 py-2 text-sm font-bold rounded-xl ${leaveAction === "genehmigen" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"}`}>
                        {leaveAction === "genehmigen" ? "Genehmigen" : "Ablehnen"}
                    </button>
                </>}>
                <div className="space-y-4">
                    {leaveActionId && (() => {
                        const r = store.leaveRequests.find(x => x.id === leaveActionId);
                        return r ? (
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-sm">
                                <div className="font-bold text-white">{store.getEmployeeName(r.employee_id)}</div>
                                <div className="text-slate-400 text-xs mt-1">{leaveTypeLabels[r.type]} · {r.days} Tage · {formatDate(r.start_date)} – {formatDate(r.end_date)}</div>
                                {r.reason && <div className="text-slate-500 text-xs mt-1 italic">{r.reason}</div>}
                            </div>
                        ) : null;
                    })()}
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{leaveAction === "genehmigen" ? "Notiz für Mitarbeiter (optional)" : "Begründung (erforderlich)"}</label>
                        <textarea value={leaveNote} onChange={e => setLeaveNote(e.target.value)} placeholder={leaveAction === "genehmigen" ? "z.B. Bitte vorher Aufgaben übergeben..." : "Begründung..."} rows={3} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none resize-none" />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

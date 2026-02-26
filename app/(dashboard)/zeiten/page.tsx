"use client";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatDate, today } from "@/lib/utils";
import { Plus, Clock, Play, Square, CheckCircle2, XCircle, Calendar, Users, Search, ChevronLeft, ChevronRight, Trash2, MessageSquare, PalmtreeIcon, AlertCircle, Filter, Download, TrendingUp, BarChart3 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { TimeEntry } from "@/types";

const TYPE_LABELS: Record<string, string> = { arbeit: "Arbeitszeit", fahrt: "Fahrtzeit", pause: "Pause", urlaub: "Urlaub", krankheit: "Krankheit", schlechtwetter: "Schlechtwetter", schulung: "Schulung" };
const TYPE_COLORS: Record<string, string> = { arbeit: "bg-blue-500/15 text-blue-400 border-blue-500/20", fahrt: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", pause: "bg-slate-500/15 text-slate-400 border-slate-700", urlaub: "bg-amber-500/15 text-amber-400 border-amber-500/20", krankheit: "bg-red-500/15 text-red-400 border-red-500/20", schlechtwetter: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20", schulung: "bg-purple-500/15 text-purple-400 border-purple-500/20" };
const LEAVE_TYPE_LABELS: Record<string, string> = { urlaub: "Urlaub", krankheit: "Krankmeldung", sonderurlaub: "Sonderurlaub", freizeitausgleich: "Freizeitausgleich" };
const LEAVE_STATUS_COLORS: Record<string, string> = { beantragt: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", genehmigt: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", abgelehnt: "bg-red-500/10 text-red-400 border-red-500/20", storniert: "bg-slate-500/10 text-slate-500 border-slate-700" };
const LEAVE_STATUS_LABELS: Record<string, string> = { beantragt: "Beantragt", genehmigt: "Genehmigt", abgelehnt: "Abgelehnt", storniert: "Storniert" };

function getWeekDates(offset = 0) { const n = new Date(), day = n.getDay() || 7, m = new Date(n); m.setDate(n.getDate() - day + 1 + offset * 7); return Array.from({ length: 7 }, (_, i) => { const d = new Date(m); d.setDate(m.getDate() + i); return d.toISOString().split("T")[0] }) }
function getMonthDates(year: number, month: number) { const first = new Date(year, month, 1), last = new Date(year, month + 1, 0); const startDay = (first.getDay() + 6) % 7; const dates: string[] = []; for (let i = -startDay; i < 42 - startDay; i++) { const d = new Date(year, month, 1 + i); dates.push(d.toISOString().split("T")[0]) } return dates }
function calcDur(start: string, end: string, pauseMin = 0) { const [sh, sm] = start.split(":").map(Number), [eh, em] = end.split(":").map(Number); return Math.max(0, (eh + em / 60) - (sh + sm / 60) - (pauseMin / 60)) }

type Tab = "liste" | "woche" | "monat" | "urlaub";

export default function ZeitenPage() {
    const store = useStore();
    const { toast } = useToast();
    const isAdmin = store.currentUser?.role === "Admin";
    const [tab, setTab] = useState<Tab>("liste");

    // Timer
    const [timerSec, setTimerSec] = useState(0);
    const [timerProj, setTimerProj] = useState("");
    const [timerDesc, setTimerDesc] = useState("");
    useEffect(() => { let iv: NodeJS.Timeout; if (store.activeTimer) { const s = new Date(store.activeTimer.startTime).getTime(); const t = () => setTimerSec(Math.floor((Date.now() - s) / 1000)); t(); iv = setInterval(t, 1000); setTimerProj(store.activeTimer.projectId || ""); setTimerDesc(store.activeTimer.description || "") } else setTimerSec(0); return () => clearInterval(iv) }, [store.activeTimer]);
    const fmtTimer = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    // Filters
    const [search, setSearch] = useState("");
    const [filterEmp, setFilterEmp] = useState(isAdmin ? "" : (store.currentUser?.id || ""));
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [weekOff, setWeekOff] = useState(0);
    const [monthYear, setMonthYear] = useState(new Date().getFullYear());
    const [monthMonth, setMonthMonth] = useState(new Date().getMonth());

    const weekDates = getWeekDates(weekOff);
    const weekLabel = `${new Date(weekDates[0] + "T12:00:00").toLocaleDateString("de", { day: "2-digit", month: "short" })} – ${new Date(weekDates[6] + "T12:00:00").toLocaleDateString("de", { day: "2-digit", month: "short", year: "numeric" })}`;

    // KPIs
    const kpis = useMemo(() => {
        const myId = isAdmin ? filterEmp : store.currentUser?.id;
        const all = myId ? store.timeEntries.filter(e => e.employee_id === myId) : store.timeEntries;
        const thisWeek = all.filter(e => weekDates.includes(e.date));
        const now = new Date();
        const thisMonth = all.filter(e => { const d = new Date(e.date + "T12:00:00"); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() });
        const weekH = thisWeek.reduce((s, e) => s + e.duration, 0);
        const monthH = thisMonth.reduce((s, e) => s + e.duration, 0);
        const workDays = new Set(thisWeek.map(e => e.date)).size || 1;
        return { weekH, monthH, avg: weekH / workDays, pending: store.timeEntries.filter(e => !e.is_approved).length };
    }, [store.timeEntries, filterEmp, weekDates, isAdmin, store.currentUser]);

    // Filtered entries for list
    const filtered = useMemo(() => {
        let list = [...store.timeEntries];
        if (filterEmp) list = list.filter(e => e.employee_id === filterEmp);
        else if (!isAdmin && store.currentUser) list = list.filter(e => e.employee_id === store.currentUser!.id);
        if (filterType) list = list.filter(e => e.type === filterType);
        if (filterStatus === "genehmigt") list = list.filter(e => e.is_approved);
        if (filterStatus === "ausstehend") list = list.filter(e => !e.is_approved);
        if (search) { const q = search.toLowerCase(); list = list.filter(e => store.getEmployeeName(e.employee_id).toLowerCase().includes(q) || store.getProjectName(e.project_id).toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q)) }
        return list.sort((a, b) => b.date.localeCompare(a.date) || ((b.start_time || "").localeCompare(a.start_time || "")));
    }, [store.timeEntries, filterEmp, filterType, filterStatus, search, isAdmin, store.currentUser]);

    // Bulk select
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const toggleSel = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n });
    const toggleAll = () => { const pending = filtered.filter(e => !e.is_approved); setSelected(p => p.size >= pending.length ? new Set() : new Set(pending.map(e => e.id))) };
    function bulkApprove() { selected.forEach(id => store.approveTimeEntry(id)); toast(`${selected.size} Einträge genehmigt`, "success"); setSelected(new Set()) }

    // Manual entry modal
    const [manualOpen, setManualOpen] = useState(false);
    const [empId, setEmpId] = useState(""); const [projId, setProjId] = useState(""); const [entDate, setEntDate] = useState(today());
    const [entStart, setEntStart] = useState("07:00"); const [entEnd, setEntEnd] = useState("15:30"); const [entPause, setEntPause] = useState(30);
    const [entType, setEntType] = useState("arbeit"); const [entDesc, setEntDesc] = useState("");
    const computedDur = calcDur(entStart, entEnd, entPause);

    function openManual() { setEmpId(store.currentUser?.id || ""); setProjId(""); setEntDate(today()); setEntStart("07:00"); setEntEnd("15:30"); setEntPause(30); setEntType("arbeit"); setEntDesc(""); setManualOpen(true) }
    function saveManual() {
        if (computedDur <= 0) { toast("Ungültige Zeitspanne", "error"); return }
        if (entDate > today()) { toast("Datum darf nicht in der Zukunft liegen", "error"); return }
        // Overlap check
        const overlap = store.timeEntries.find(t => t.employee_id === empId && t.date === entDate && t.start_time && t.end_time && entStart < t.end_time && entEnd > t.start_time);
        if (overlap) { toast("Überschneidung mit bestehendem Eintrag!", "error"); return }
        store.addTimeEntry({ employee_id: empId, project_id: projId || undefined, date: entDate, start_time: entStart, end_time: entEnd, pause_minutes: entPause, duration: Math.round(computedDur * 100) / 100, type: entType as any, description: entDesc, is_approved: false });
        toast("Zeit erfolgreich erfasst ✅", "success"); setManualOpen(false)
    }

    // Action modal (approve/reject with note)
    const [actEntry, setActEntry] = useState<TimeEntry | null>(null); const [actNote, setActNote] = useState(""); const [actType, setActType] = useState<"approve" | "reject">("approve");
    function doAction() { if (!actEntry) return; if (actType === "approve") { store.approveTimeEntry(actEntry.id, actNote || undefined); toast("Genehmigt ✅", "success") } else { if (!actNote.trim()) { toast("Begründung erforderlich", "error"); return } store.rejectTimeEntry(actEntry.id, actNote); toast("Abgelehnt", "warning") } setActEntry(null) }

    // Leave
    const [leaveOpen, setLeaveOpen] = useState(false); const [leaveType, setLeaveType] = useState<"urlaub" | "krankheit" | "sonderurlaub" | "freizeitausgleich">("urlaub");
    const [leaveStart, setLeaveStart] = useState(today()); const [leaveEnd, setLeaveEnd] = useState(today()); const [leaveReason, setLeaveReason] = useState("");
    const leaveDays = Math.max(1, Math.floor((new Date(leaveEnd).getTime() - new Date(leaveStart).getTime()) / 86400000) + 1);
    function saveLeave() { if (!store.currentUser) return; store.addLeaveRequest({ employee_id: store.currentUser.id, type: leaveType, start_date: leaveStart, end_date: leaveEnd, days: leaveDays, reason: leaveReason }); toast("Antrag eingereicht", "success"); setLeaveOpen(false) }

    const [leaveActId, setLeaveActId] = useState<string | null>(null); const [leaveNote, setLeaveNote] = useState(""); const [leaveAct, setLeaveAct] = useState<"g" | "a">("g");
    function doLeaveAction() { if (!leaveActId) return; if (leaveAct === "g") { store.approveLeaveRequest(leaveActId, leaveNote || undefined); toast("Genehmigt", "success") } else { if (!leaveNote.trim()) { toast("Begründung erforderlich", "error"); return } store.rejectLeaveRequest(leaveActId, leaveNote); toast("Abgelehnt", "warning") } setLeaveActId(null) }

    const leaveList = isAdmin ? [...store.leaveRequests].sort((a, b) => b.created_at.localeCompare(a.created_at)) : store.leaveRequests.filter(r => r.employee_id === store.currentUser?.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const pendingLeave = store.leaveRequests.filter(r => r.status === "beantragt").length;

    // CSV Export
    function exportCSV() {
        const rows = [["Datum", "Mitarbeiter", "Projekt", "Start", "Ende", "Pause (min)", "Stunden", "Typ", "Status", "Notiz"].join(";")];
        filtered.forEach(e => { rows.push([e.date, store.getEmployeeName(e.employee_id), store.getProjectName(e.project_id), e.start_time || "", e.end_time || "", String(e.pause_minutes || 0), e.duration.toFixed(2), TYPE_LABELS[e.type] || e.type, e.is_approved ? "Genehmigt" : "Offen", e.description || ""].join(";")) });
        const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `zeiterfassung_${today()}.csv`; a.click()
    }

    // Week view data
    const weekData = useMemo(() => {
        const empId = isAdmin ? filterEmp : (store.currentUser?.id || "");
        return weekDates.map(d => {
            const entries = store.timeEntries.filter(e => e.date === d && (empId ? e.employee_id === empId : true));
            const byType: Record<string, number> = {}; entries.forEach(e => { byType[e.type] = (byType[e.type] || 0) + e.duration });
            const total = entries.reduce((s, e) => s + e.duration, 0);
            return { date: d, entries, byType, total };
        });
    }, [weekDates, store.timeEntries, filterEmp, isAdmin, store.currentUser]);
    const weekTotal = weekData.reduce((s, d) => s + d.total, 0);

    // Month calendar
    const monthDates = getMonthDates(monthYear, monthMonth);
    const monthData = useMemo(() => {
        const empId = isAdmin ? filterEmp : (store.currentUser?.id || "");
        const map: Record<string, number> = {};
        store.timeEntries.filter(e => empId ? e.employee_id === empId : true).forEach(e => { map[e.date] = (map[e.date] || 0) + e.duration });
        return map;
    }, [store.timeEntries, filterEmp, monthYear, monthMonth, isAdmin, store.currentUser]);
    const monthName = new Date(monthYear, monthMonth).toLocaleDateString("de", { month: "long", year: "numeric" });

    return (
        <div className="p-5 lg:p-8 max-w-[1600px] mx-auto space-y-5 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl lg:text-4xl font-black text-white tracking-tight">Zeiterfassung</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {isAdmin && kpis.pending > 0 && <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-400 uppercase">{kpis.pending} ausstehend</span>}
                        {isAdmin && pendingLeave > 0 && <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase">{pendingLeave} Urlaubsanträge</span>}
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"><Download className="w-3.5 h-3.5" />CSV Export</button>
                    <button onClick={() => setLeaveOpen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition"><PalmtreeIcon className="w-3.5 h-3.5" />Abwesenheit</button>
                    <button onClick={openManual} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/20"><Plus className="w-3.5 h-3.5" />Zeit erfassen</button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[{ label: "Diese Woche", val: `${kpis.weekH.toFixed(1)}h`, icon: Calendar, color: "blue" }, { label: "Dieser Monat", val: `${kpis.monthH.toFixed(1)}h`, icon: BarChart3, color: "emerald" }, { label: "Ø pro Tag", val: `${kpis.avg.toFixed(1)}h`, icon: TrendingUp, color: "amber" }, { label: "Ausstehend", val: String(kpis.pending), icon: AlertCircle, color: "red" }].map(({ label, val, icon: I, color }) => (
                    <div key={label} className={`glass rounded-xl p-4 border border-${color}-500/10`}>
                        <div className="flex items-center justify-between mb-2"><I className={`w-4 h-4 text-${color}-400`} /><span className={`text-[9px] font-black text-${color}-400 uppercase tracking-widest`}>{label}</span></div>
                        <div className="text-2xl font-black text-white">{val}</div>
                    </div>
                ))}
            </div>

            {/* Timer */}
            <div className="glass rounded-xl p-4 border-blue-500/10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    <div className="min-w-[200px]">
                        <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Live-Timer</div>
                        <div className={`font-display text-4xl font-black tabular-nums ${store.activeTimer ? "text-white" : "text-slate-700"}`}>{fmtTimer(timerSec)}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-1 flex-wrap">
                        <select disabled={!!store.activeTimer} value={timerProj} onChange={e => setTimerProj(e.target.value)} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white outline-none disabled:opacity-40 min-w-[180px]">
                            <option value="">— Kein Projekt —</option>
                            {store.projects.filter(p => p.status === "aktiv").map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input disabled={!!store.activeTimer} value={timerDesc} onChange={e => setTimerDesc(e.target.value)} placeholder="Notiz..." className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white outline-none disabled:opacity-40 flex-1 min-w-[120px]" />
                        {store.activeTimer
                            ? <button onClick={() => { store.stopTimer(); toast("Gestoppt & gebucht", "success") }} className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition animate-pulse"><Square className="w-4 h-4 fill-current" />STOPP</button>
                            : <button onClick={() => { if (!store.currentUser) { toast("Einloggen", "error"); return } store.startTimer(timerProj || undefined, timerDesc || undefined); toast("Gestartet", "success") }} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition"><Play className="w-4 h-4 fill-current" />START</button>}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {([["liste", "Übersicht"], ["woche", "Woche"], ["monat", "Monat"], ["urlaub", "Abwesenheiten"]] as const).map(([k, l]) => (<button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${tab === k ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}>{l}{k === "urlaub" && pendingLeave > 0 && isAdmin ? <span className="ml-1 w-4 h-4 bg-amber-500 rounded-full text-[8px] text-slate-950 inline-flex items-center justify-center font-black">{pendingLeave}</span> : null}</button>))}
                </div>
                {tab !== "urlaub" && <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5"><Search className="w-3.5 h-3.5 text-slate-600" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche..." className="bg-transparent text-xs text-white outline-none w-24 placeholder-slate-600" /></div>
                    {isAdmin && <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white outline-none"><option value="">Alle MA</option>{store.employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}</select>}
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white outline-none"><option value="">Alle Typen</option>{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white outline-none"><option value="">Alle Status</option><option value="genehmigt">Genehmigt</option><option value="ausstehend">Ausstehend</option></select>
                </div>}
            </div>

            {/* === LIST VIEW === */}
            {tab === "liste" && <div className="glass rounded-xl overflow-hidden border border-slate-800/60">
                {isAdmin && selected.size > 0 && <div className="px-4 py-2 bg-blue-500/10 border-b border-blue-500/20 flex items-center gap-3"><span className="text-xs font-bold text-blue-400">{selected.size} ausgewählt</span><button onClick={bulkApprove} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition">Alle genehmigen</button><button onClick={() => setSelected(new Set())} className="text-xs text-slate-500 hover:text-white">Auswahl aufheben</button></div>}
                <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="bg-slate-950/60 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    {isAdmin && <th className="px-4 py-3 w-8"><input type="checkbox" onChange={toggleAll} checked={selected.size > 0 && selected.size >= filtered.filter(e => !e.is_approved).length} className="accent-blue-500" /></th>}
                    <th className="px-4 py-3">Datum</th><th className="px-4 py-3">Mitarbeiter</th><th className="px-4 py-3">Projekt</th><th className="px-4 py-3 text-center">Zeit</th><th className="px-4 py-3 text-center">Pause</th><th className="px-4 py-3 text-center">Gesamt</th><th className="px-4 py-3 text-center">Typ</th><th className="px-4 py-3 text-center">Status</th>{isAdmin && <th className="px-4 py-3" />}
                </tr></thead><tbody className="divide-y divide-slate-800/40">
                        {filtered.length === 0 ? <tr><td colSpan={10} className="px-6 py-12 text-center text-slate-600 text-sm">Keine Einträge gefunden</td></tr> : filtered.slice(0, 30).map(e => (<tr key={e.id} className={`group hover:bg-white/[0.015] transition ${!e.is_approved ? "bg-amber-500/[0.02]" : ""}`}>
                            {isAdmin && <td className="px-4 py-3">{!e.is_approved && <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSel(e.id)} className="accent-blue-500" />}</td>}
                            <td className="px-4 py-3 text-xs font-medium text-white">{new Date(e.date + "T12:00:00").toLocaleDateString("de", { weekday: "short", day: "2-digit", month: "2-digit" })}</td>
                            <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: (store.employees.find(x => x.id === e.employee_id)?.color || "#555") + "40" }}>{store.getEmployeeName(e.employee_id).split(" ").map(n => n[0]).join("")}</div><span className="text-xs font-bold text-white">{store.getEmployeeName(e.employee_id)}</span></div></td>
                            <td className="px-4 py-3"><div className="text-xs text-white">{store.getProjectName(e.project_id)}</div>{e.description && <div className="text-[10px] text-slate-600 italic truncate max-w-[180px]">{e.description}</div>}{e.admin_note && <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5"><MessageSquare className="w-2.5 h-2.5" />{e.admin_note}</div>}</td>
                            <td className="px-4 py-3 text-center text-xs text-slate-400 font-mono">{e.start_time}–{e.end_time}</td>
                            <td className="px-4 py-3 text-center text-xs text-slate-500">{e.pause_minutes || 0}m</td>
                            <td className="px-4 py-3 text-center text-sm font-black text-white">{e.duration.toFixed(2)}h</td>
                            <td className="px-4 py-3 text-center"><span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${TYPE_COLORS[e.type]}`}>{TYPE_LABELS[e.type]}</span></td>
                            <td className="px-4 py-3 text-center"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${e.is_approved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>{e.is_approved ? "✅ Genehmigt" : "⏳ Offen"}</span></td>
                            {isAdmin && <td className="px-4 py-3"><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                {!e.is_approved && <button onClick={() => { setActEntry(e); setActType("approve"); setActNote("") }} title="Genehmigen" className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md"><CheckCircle2 className="w-3.5 h-3.5" /></button>}
                                <button onClick={() => { setActEntry(e); setActType("reject"); setActNote("") }} title="Ablehnen/Notiz" className="p-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-md"><MessageSquare className="w-3.5 h-3.5" /></button>
                                <button onClick={() => { store.deleteTimeEntry(e.id); toast("Gelöscht", "info") }} title="Löschen" className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div></td>}
                        </tr>))}
                    </tbody></table></div>
            </div>}

            {/* === WEEK VIEW === */}
            {tab === "woche" && <div className="space-y-3">
                <div className="flex items-center gap-3"><button onClick={() => setWeekOff(w => w - 1)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400"><ChevronLeft className="w-4 h-4" /></button><span className="text-sm font-bold text-white min-w-[200px] text-center">{weekLabel}</span><button onClick={() => setWeekOff(w => w + 1)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400"><ChevronRight className="w-4 h-4" /></button>{weekOff !== 0 && <button onClick={() => setWeekOff(0)} className="px-2.5 py-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg">Heute</button>}</div>

                <div className="glass rounded-xl overflow-hidden border border-slate-800/60"><table className="w-full text-left"><thead><tr className="bg-slate-950/60 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800"><th className="px-4 py-3">Tag</th>{Object.entries(TYPE_LABELS).map(([k, v]) => <th key={k} className="px-3 py-3 text-center">{v}</th>)}<th className="px-4 py-3 text-center font-black">Gesamt</th></tr></thead>
                    <tbody className="divide-y divide-slate-800/40">{weekData.map(d => {
                        const wd = new Date(d.date + "T12:00:00"); const isToday = d.date === today(); return (
                            <tr key={d.date} className={`${isToday ? "bg-blue-500/5" : ""} hover:bg-white/[0.02] transition`}>
                                <td className="px-4 py-3"><div className={`text-xs font-bold ${isToday ? "text-blue-400" : "text-white"}`}>{wd.toLocaleDateString("de", { weekday: "short" })}</div><div className="text-[10px] text-slate-500">{wd.toLocaleDateString("de", { day: "2-digit", month: "2-digit" })}</div></td>
                                {Object.keys(TYPE_LABELS).map(t => <td key={t} className="px-3 py-3 text-center text-xs font-medium text-slate-400">{d.byType[t] ? `${d.byType[t].toFixed(1)}h` : "—"}</td>)}
                                <td className="px-4 py-3 text-center"><span className={`text-sm font-black ${d.total >= 8 ? "text-emerald-400" : d.total >= 6 ? "text-amber-400" : d.total > 0 ? "text-red-400" : "text-slate-700"}`}>{d.total > 0 ? `${d.total.toFixed(1)}h` : "—"}</span></td>
                            </tr>)
                    })}
                        <tr className="bg-slate-900/50 font-black"><td className="px-4 py-3 text-xs text-white uppercase">Summe</td>{Object.keys(TYPE_LABELS).map(t => { const sum = weekData.reduce((s, d) => s + (d.byType[t] || 0), 0); return <td key={t} className="px-3 py-3 text-center text-xs text-white">{sum > 0 ? `${sum.toFixed(1)}h` : "—"}</td> })}<td className="px-4 py-3 text-center text-sm text-white">{weekTotal.toFixed(1)}h</td></tr>
                    </tbody></table></div>
            </div>}

            {/* === MONTH VIEW === */}
            {tab === "monat" && <div className="space-y-3">
                <div className="flex items-center gap-3"><button onClick={() => { if (monthMonth === 0) { setMonthMonth(11); setMonthYear(y => y - 1) } else setMonthMonth(m => m - 1) }} className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400"><ChevronLeft className="w-4 h-4" /></button><span className="text-sm font-bold text-white min-w-[180px] text-center capitalize">{monthName}</span><button onClick={() => { if (monthMonth === 11) { setMonthMonth(0); setMonthYear(y => y + 1) } else setMonthMonth(m => m + 1) }} className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400"><ChevronRight className="w-4 h-4" /></button></div>

                <div className="glass rounded-xl border border-slate-800/60 p-4">
                    <div className="grid grid-cols-7 gap-1 mb-2">{["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(d => <div key={d} className="text-[10px] font-black text-slate-600 uppercase text-center py-1">{d}</div>)}</div>
                    <div className="grid grid-cols-7 gap-1">{monthDates.map((d, i) => {
                        const dt = new Date(d + "T12:00:00"); const inMonth = dt.getMonth() === monthMonth; const h = monthData[d] || 0; const isT = d === today(); return (
                            <div key={i} className={`rounded-lg p-2 text-center transition ${!inMonth ? "opacity-20" : ""} ${isT ? "ring-1 ring-blue-500/50" : ""} ${h >= 8 ? "bg-emerald-500/10 border border-emerald-500/10" : h >= 6 ? "bg-amber-500/10 border border-amber-500/10" : h > 0 ? "bg-red-500/10 border border-red-500/10" : "bg-slate-900/50 border border-slate-800/50"}`}>
                                <div className={`text-xs font-bold ${isT ? "text-blue-400" : "text-slate-400"}`}>{dt.getDate()}</div>
                                <div className={`text-[10px] font-black mt-0.5 ${h >= 8 ? "text-emerald-400" : h >= 6 ? "text-amber-400" : h > 0 ? "text-red-400" : "text-slate-700"}`}>{h > 0 ? `${h.toFixed(1)}h` : ""}</div>
                            </div>)
                    })}</div>
                    <div className="flex items-center gap-4 mt-3 text-[9px] font-bold text-slate-600 uppercase">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/20" />≥8h</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-amber-500/20" />6-8h</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/20 border border-red-500/20" />&lt;6h</span>
                    </div>
                </div>
            </div>}

            {/* === LEAVE VIEW === */}
            {tab === "urlaub" && <div className="glass rounded-xl overflow-hidden border border-slate-800/60">
                <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between"><h3 className="text-sm font-black text-white uppercase tracking-widest">{isAdmin ? "Alle Abwesenheitsanträge" : "Meine Abwesenheiten"}</h3><span className="text-xs text-slate-500">{leaveList.length} Einträge</span></div>
                <div className="divide-y divide-slate-800/40">{leaveList.length === 0 ? <div className="py-10 text-center text-slate-600 text-sm">Keine Anträge</div> : leaveList.map(r => {
                    const emp = store.employees.find(e => e.id === r.employee_id); return (
                        <div key={r.id} className="px-5 py-3 hover:bg-white/[0.01] transition">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2.5">
                                    {isAdmin && emp && <div className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-black text-white shrink-0" style={{ backgroundColor: emp.color + "30" }}>{emp.first_name[0]}{emp.last_name[0]}</div>}
                                    <div>
                                        {isAdmin && <div className="text-xs font-bold text-white">{emp?.first_name} {emp?.last_name}</div>}
                                        <div className="flex items-center gap-1.5 flex-wrap"><span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${TYPE_COLORS[r.type] || "bg-slate-800 text-slate-400 border-slate-700"}`}>{LEAVE_TYPE_LABELS[r.type]}</span><span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${LEAVE_STATUS_COLORS[r.status]}`}>{LEAVE_STATUS_LABELS[r.status]}</span><span className="text-[10px] text-slate-500">{r.days}T</span></div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">{formatDate(r.start_date)} – {formatDate(r.end_date)}</div>
                                        {r.reason && <div className="text-[10px] text-slate-600 italic mt-0.5">{r.reason}</div>}
                                        {r.admin_note && <div className="flex items-start gap-1 mt-1 px-2 py-1 bg-slate-900 rounded border border-slate-800"><MessageSquare className="w-2.5 h-2.5 text-slate-500 shrink-0 mt-0.5" /><span className="text-[10px] text-slate-400 italic">{r.admin_note}</span></div>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {isAdmin && r.status === "beantragt" && <><button onClick={() => { setLeaveActId(r.id); setLeaveAct("g"); setLeaveNote("") }} className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/20 transition">Genehmigen</button><button onClick={() => { setLeaveActId(r.id); setLeaveAct("a"); setLeaveNote("") }} className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-md border border-red-500/20 transition">Ablehnen</button></>}
                                    {!isAdmin && r.status === "beantragt" && <button onClick={() => { store.updateLeaveRequest(r.id, { status: "storniert" }); toast("Storniert", "info") }} className="px-2.5 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-md border border-slate-700">Stornieren</button>}
                                </div>
                            </div>
                        </div>)
                })}</div>
            </div>}

            {/* MODALS */}
            <Modal open={manualOpen} onClose={() => setManualOpen(false)} title="Zeit erfassen" size="md" footer={<><button onClick={() => setManualOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button><button onClick={saveManual} className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">Speichern</button></>}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Mitarbeiter</label><select disabled={!isAdmin} value={empId} onChange={e => setEmpId(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none disabled:opacity-60">{store.employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}</select></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Projekt</label><select value={projId} onChange={e => setProjId(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none"><option value="">— Kein Projekt —</option>{store.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Datum</label><input type="date" max={today()} value={entDate} onChange={e => setEntDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Von</label><input type="time" value={entStart} onChange={e => setEntStart(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Bis</label><input type="time" value={entEnd} onChange={e => setEntEnd(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Pause (min)</label><input type="number" min={0} max={480} step={15} value={entPause} onChange={e => setEntPause(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white outline-none" /></div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl text-sm"><span className="text-slate-400">Netto-Stunden:</span><span className="font-black text-white">{computedDur > 0 ? computedDur.toFixed(2) + "h" : "—"}</span></div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Typ</label><div className="grid grid-cols-4 gap-1.5">{Object.entries(TYPE_LABELS).map(([k, v]) => <button key={k} onClick={() => setEntType(k)} className={`py-1.5 rounded-lg text-[9px] font-black uppercase border transition ${entType === k ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"}`}>{v}</button>)}</div></div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Beschreibung <span className="text-slate-700">({entDesc.length}/500)</span></label><textarea maxLength={500} value={entDesc} onChange={e => setEntDesc(e.target.value)} placeholder="z.B. Tapezierarbeiten Schlafzimmer" rows={2} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none resize-none" /></div>
                </div>
            </Modal>

            <Modal open={!!actEntry} onClose={() => setActEntry(null)} title={actType === "approve" ? "Eintrag genehmigen" : "Eintrag ablehnen"} size="sm" footer={<><button onClick={() => setActEntry(null)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button><button onClick={doAction} className={`px-5 py-2 text-sm font-bold rounded-xl ${actType === "approve" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"}`}>{actType === "approve" ? "Genehmigen" : "Ablehnen"}</button></>}>
                {actEntry && <div className="space-y-3"><div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-sm"><div className="font-bold text-white">{store.getEmployeeName(actEntry.employee_id)}</div><div className="text-slate-400 text-xs mt-0.5">{formatDate(actEntry.date)} · {actEntry.duration.toFixed(1)}h · {store.getProjectName(actEntry.project_id)}</div></div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{actType === "approve" ? "Notiz (optional)" : "Begründung (erforderlich)"}</label><textarea value={actNote} onChange={e => setActNote(e.target.value)} rows={3} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none resize-none" /></div></div>}
            </Modal>

            <Modal open={leaveOpen} onClose={() => setLeaveOpen(false)} title="Abwesenheit beantragen" size="sm" footer={<><button onClick={() => setLeaveOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button><button onClick={saveLeave} className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl">Einreichen</button></>}>
                <div className="space-y-3">
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Art</label><div className="grid grid-cols-2 gap-1.5">{(["urlaub", "krankheit", "sonderurlaub", "freizeitausgleich"] as const).map(k => <button key={k} onClick={() => setLeaveType(k)} className={`py-2 px-2 rounded-lg text-xs font-bold border transition text-left ${leaveType === k ? "bg-amber-500/10 border-amber-500/40 text-amber-400" : "bg-slate-900 border-slate-800 text-slate-500"}`}>{LEAVE_TYPE_LABELS[k]}</button>)}</div></div>
                    <div className="grid grid-cols-2 gap-3"><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Von</label><input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none" /></div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Bis</label><input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none" /></div></div>
                    <div className="flex justify-between px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400"><span>Tage:</span><span className="font-black text-white">{leaveDays}</span></div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Begründung</label><textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} rows={2} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none resize-none" /></div>
                </div>
            </Modal>

            <Modal open={!!leaveActId} onClose={() => setLeaveActId(null)} title={leaveAct === "g" ? "Antrag genehmigen" : "Antrag ablehnen"} size="sm" footer={<><button onClick={() => setLeaveActId(null)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button><button onClick={doLeaveAction} className={`px-5 py-2 text-sm font-bold rounded-xl ${leaveAct === "g" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>{leaveAct === "g" ? "Genehmigen" : "Ablehnen"}</button></>}>
                {leaveActId && (() => { const r = store.leaveRequests.find(x => x.id === leaveActId); return r ? <div className="space-y-3"><div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-sm"><div className="font-bold text-white">{store.getEmployeeName(r.employee_id)}</div><div className="text-xs text-slate-400 mt-0.5">{LEAVE_TYPE_LABELS[r.type]} · {r.days}T · {formatDate(r.start_date)}–{formatDate(r.end_date)}</div>{r.reason && <div className="text-xs text-slate-500 italic mt-0.5">{r.reason}</div>}</div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{leaveAct === "g" ? "Notiz (optional)" : "Begründung (erforderlich)"}</label><textarea value={leaveNote} onChange={e => setLeaveNote(e.target.value)} rows={3} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none resize-none" /></div></div> : null })()}
            </Modal>
        </div>
    );
}

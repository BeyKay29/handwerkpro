"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatDate, today } from "@/lib/utils";
import {
    Plus, Clock, Play, Square, Download, CheckCircle2,
    Calendar, Users, Briefcase, Filter, MoreVertical, Search,
    ChevronLeft, ChevronRight, History
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const typeLabels: Record<string, string> = { arbeit: "Arbeit", fahrt: "Fahrt", pause: "Pause", urlaub: "Urlaub", krankheit: "Krankheit" };
const typeColors: Record<string, string> = {
    arbeit: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    fahrt: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    pause: "bg-slate-500/15 text-slate-400 border-slate-700",
    urlaub: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    krankheit: "bg-red-500/15 text-red-400 border-red-500/20"
};

export default function ZeitenPage() {
    const store = useStore();
    const { toast } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerProject, setTimerProject] = useState("");
    const [timerDesc, setTimerDesc] = useState("");

    // Sync timer seconds if activeTimer exists
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (store.activeTimer) {
            const start = new Date(store.activeTimer.startTime).getTime();
            const update = () => {
                const now = new Date().getTime();
                setTimerSeconds(Math.floor((now - start) / 1000));
            };
            update();
            interval = setInterval(update, 1000);
            setTimerProject(store.activeTimer.projectId || "");
            setTimerDesc(store.activeTimer.description || "");
        } else {
            setTimerSeconds(0);
        }
        return () => clearInterval(interval);
    }, [store.activeTimer]);

    // Manual entry form
    const [empId, setEmpId] = useState(store.currentUser?.id || "");
    const [projId, setProjId] = useState("");
    const [entDate, setEntDate] = useState(today());
    const [entStart, setEntStart] = useState("07:00");
    const [entEnd, setEntEnd] = useState("15:30");
    const [entType, setEntType] = useState("arbeit");
    const [entDesc, setEntDesc] = useState("");

    function handleStartTimer() {
        if (!store.currentUser) { toast("Bitte erst einloggen", "error"); return; }
        store.startTimer(timerProject || undefined, timerDesc || undefined);
        toast("Zeiterfassung gestartet", "success");
    }

    function handleStopTimer() {
        store.stopTimer();
        toast("Zeit gebucht", "success");
        setTimerProject("");
        setTimerDesc("");
    }

    const formatTimer = (s: number) => {
        const h = String(Math.floor(s / 3600)).padStart(2, "0");
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${h}:${m}:${sec}`;
    };

    function openManual() {
        setEmpId(store.currentUser?.id || store.employees[0]?.id || "");
        setProjId(""); setEntDate(today());
        setEntStart("07:00"); setEntEnd("15:30"); setEntType("arbeit"); setEntDesc("");
        setModalOpen(true);
    }

    function handleManualSave() {
        if (!empId) { toast("Mitarbeiter wählen", "error"); return; }
        const [sh, sm] = entStart.split(":").map(Number);
        const [eh, em] = entEnd.split(":").map(Number);
        const dur = (eh + em / 60) - (sh + sm / 60);
        store.addTimeEntry({
            employee_id: empId,
            project_id: projId || undefined,
            date: entDate,
            start_time: entStart,
            end_time: entEnd,
            duration: Math.round(dur * 100) / 100,
            type: entType as any,
            description: entDesc,
            is_approved: false,
        });
        toast("Eintrag manuell erstellt", "success");
        setModalOpen(false);
    }

    function approveEntry(id: string) {
        store.updateTimeEntry(id, { is_approved: true });
        toast("Zeit genehmigt", "success");
    }

    const pending = store.timeEntries.filter((e) => !e.is_approved);
    const displayEntries = [...store.timeEntries].sort((a, b) => b.created_at.localeCompare(a.created_at));

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-4xl font-black text-white tracking-tight">Zeiterfassung</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">Live System</div>
                        <p className="text-slate-500 text-xs font-bold">{store.timeEntries.length} Einträge insgesamt</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={openManual} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-sm font-bold rounded-2xl transition-all"><Plus className="w-4 h-4" /> Manueler Eintrag</button>
                </div>
            </header>

            {/* Main Tracker Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timer Card */}
                <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 relative overflow-hidden group border-blue-500/20 bg-blue-500/[0.02]">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity -rotate-12"><Clock className="w-64 h-64 text-blue-500" /></div>

                    <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Projekt Tracker</h2>
                                <div className={`font-display text-7xl font-black tracking-tight tabular-nums ${store.activeTimer ? "text-white" : "text-slate-600"}`}>
                                    {formatTimer(timerSeconds)}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {store.activeTimer ? (
                                    <button onClick={handleStopTimer} className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-500/30 animate-pulse">
                                        <Square className="w-5 h-5 fill-current" /> STOPP
                                    </button>
                                ) : (
                                    <button onClick={handleStartTimer} className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/30">
                                        <Play className="w-5 h-5 fill-current" /> START
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Mitarbeiter</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <div className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-bold text-white">
                                        {store.currentUser ? `${store.currentUser.first_name} ${store.currentUser.last_name}` : "Nicht angemeldet"}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Projektzuordnung</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <select
                                        disabled={!!store.activeTimer}
                                        value={timerProject}
                                        onChange={(e) => setTimerProject(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm text-white appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                                    >
                                        <option value="">-- Allgemein / Kein Projekt --</option>
                                        {store.projects.filter(p => p.status === 'aktiv').map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approvals Sidebar */}
                <div className="glass rounded-[2.5rem] border-amber-500/20 bg-amber-500/[0.01] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-amber-500" />
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">Prüfung offen</h3>
                        </div>
                        <span className="bg-amber-500 text-[10px] font-black text-slate-950 px-2.5 py-1 rounded-lg">{pending.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar p-1">
                        {pending.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-600 italic">
                                <CheckCircle2 className="w-8 h-8 opacity-20 mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Alles erledigt</p>
                            </div>
                        ) : (
                            pending.map(e => (
                                <div key={e.id} className="p-4 hover:bg-white/5 transition-all group border-b border-slate-800/40 last:border-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${typeColors[e.type]}`}>{typeLabels[e.type]}</span>
                                        <span className="text-[10px] font-black text-white">{e.duration.toFixed(1)}h</span>
                                    </div>
                                    <div className="text-xs font-bold text-white mb-1">{store.getEmployeeName(e.employee_id)}</div>
                                    <div className="text-[10px] text-slate-500 mb-3 truncate">{store.getProjectName(e.project_id)} &bull; {formatDate(e.date)}</div>
                                    <button
                                        onClick={() => approveEntry(e.id)}
                                        className="w-full py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest border border-amber-500/20 shadow-lg hover:shadow-amber-500/20"
                                    >
                                        Genehmigen
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-800/60">
                <div className="bg-slate-900/40 px-8 py-6 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-lg font-black text-white tracking-tight">Zeitjournal</h3>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/40 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-8 py-5">Datum</th>
                                <th className="px-8 py-5">Mitarbeiter</th>
                                <th className="px-8 py-5">Projekt / Beschreibung</th>
                                <th className="px-8 py-5 text-center">Dauer</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {displayEntries.map((e) => (
                                <tr key={e.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-8 py-5 text-sm font-medium text-slate-400">{formatDate(e.date)}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">
                                                {store.getEmployeeName(e.employee_id).split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <span className="text-sm font-bold text-white">{store.getEmployeeName(e.employee_id)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-white mb-0.5">{store.getProjectName(e.project_id)}</div>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${typeColors[e.type]}`}>{typeLabels[e.type]}</span>
                                            <span className="italic">{e.description || "\u2014"}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="text-sm font-black text-white">{e.duration.toFixed(1)}h</div>
                                        <div className="text-[9px] text-slate-600 font-bold">{e.start_time} - {e.end_time}</div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${e.is_approved ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500 border border-slate-700"}`}>
                                            {e.is_approved ? <><CheckCircle2 className="w-3 h-3" /> Genehmigt</> : "Offen"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><MoreVertical className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manual Entry Modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Smarter Zeiteintrag"
                size="md"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-white border border-slate-800 rounded-xl transition-all">Abbrechen</button>
                    <button onClick={handleManualSave} className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xl shadow-blue-500/20">Eintrag speichern</button>
                </>}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Mitarbeiter *</label>
                            <select
                                disabled={!!store.currentUser}
                                value={empId}
                                onChange={(e) => setEmpId(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all disabled:opacity-50"
                            >
                                {store.employees.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Projektzuordnung</label>
                            <select value={projId} onChange={(e) => setProjId(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all">
                                <option value="">-- kein Projekt --</option>
                                {store.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="space-y-2 col-span-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Datum</label>
                            <input type="date" value={entDate} onChange={(e) => setEntDate(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Von</label>
                            <input type="time" value={entStart} onChange={(e) => setEntStart(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Bis</label>
                            <input type="time" value={entEnd} onChange={(e) => setEntEnd(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tätigkeitstyp</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {Object.entries(typeLabels).map(([k, v]) => (
                                <button
                                    key={k}
                                    onClick={() => setEntType(k)}
                                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${entType === k ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Notizen / Details</label>
                        <textarea
                            value={entDesc}
                            onChange={(e) => setEntDesc(e.target.value)}
                            placeholder="z.B. Decke gespachtelt, Material geladen..."
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

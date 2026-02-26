"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatDate, today } from "@/lib/utils";
import { Plus, Clock, Play, Square, Download, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

const typeLabels: Record<string, string> = { arbeit: "Arbeit", fahrt: "Fahrt", pause: "Pause", urlaub: "Urlaub", krankheit: "Krankheit" };
const typeColors: Record<string, string> = { arbeit: "bg-blue-500/15 text-blue-400", fahrt: "bg-emerald-500/15 text-emerald-400", pause: "bg-slate-500/15 text-slate-400", urlaub: "bg-amber-500/15 text-amber-400", krankheit: "bg-red-500/15 text-red-400" };

export default function ZeitenPage() {
    const store = useStore();
    const { toast } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerProject, setTimerProject] = useState("");
    const [timerEmployee, setTimerEmployee] = useState("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const timerStartRef = useRef<Date | null>(null);

    // Manual entry form
    const [empId, setEmpId] = useState("");
    const [projId, setProjId] = useState("");
    const [entDate, setEntDate] = useState(today());
    const [entStart, setEntStart] = useState("07:00");
    const [entEnd, setEntEnd] = useState("15:30");
    const [entType, setEntType] = useState("arbeit");
    const [entDesc, setEntDesc] = useState("");

    function startTimer() {
        if (!timerEmployee) { toast("Mitarbeiter waehlen", "error"); return; }
        setTimerRunning(true); setTimerSeconds(0);
        timerStartRef.current = new Date();
        timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
        toast("Timer gestartet", "success");
    }

    function stopTimer() {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimerRunning(false);
        const hours = timerSeconds / 3600;
        const startTime = timerStartRef.current;
        const start = startTime ? `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}` : "00:00";
        const now = new Date();
        const end = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        store.addTimeEntry({
            employee_id: timerEmployee, project_id: timerProject || undefined,
            date: today(), start_time: start, end_time: end,
            duration: Math.round(hours * 100) / 100, type: "arbeit",
            description: "Timer-Eintrag", is_approved: false,
        });
        setTimerSeconds(0);
        toast("Zeiteintrag gespeichert", "success", `${hours.toFixed(1)} Stunden`);
    }

    useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

    const formatTimer = (s: number) => {
        const h = String(Math.floor(s / 3600)).padStart(2, "0");
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${h}:${m}:${sec}`;
    };

    function openManual() {
        setEmpId(store.employees[0]?.id || ""); setProjId(""); setEntDate(today());
        setEntStart("07:00"); setEntEnd("15:30"); setEntType("arbeit"); setEntDesc("");
        setModalOpen(true);
    }

    function handleManualSave() {
        if (!empId) { toast("Mitarbeiter waehlen", "error"); return; }
        const [sh, sm] = entStart.split(":").map(Number);
        const [eh, em] = entEnd.split(":").map(Number);
        const dur = (eh + em / 60) - (sh + sm / 60);
        store.addTimeEntry({
            employee_id: empId, project_id: projId || undefined,
            date: entDate, start_time: entStart, end_time: entEnd,
            duration: Math.round(dur * 100) / 100, type: entType as any,
            description: entDesc, is_approved: false,
        });
        toast("Zeiteintrag angelegt", "success");
        setModalOpen(false);
    }

    function approveEntry(id: string) {
        store.updateTimeEntry(id, { is_approved: true });
        toast("Eintrag genehmigt", "success");
    }

    function exportCSV() {
        const rows = [["Datum", "Mitarbeiter", "Projekt", "Start", "Ende", "Stunden", "Typ", "Beschreibung", "Genehmigt"]];
        store.timeEntries.forEach((e) => {
            rows.push([e.date, store.getEmployeeName(e.employee_id), store.getProjectName(e.project_id), e.start_time || "", e.end_time || "", e.duration.toFixed(1), e.type, e.description || "", e.is_approved ? "Ja" : "Nein"]);
        });
        const csv = rows.map((r) => r.join(";")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `zeiten_export_${today()}.csv`; a.click();
        toast("CSV exportiert", "success");
    }

    const pending = store.timeEntries.filter((e) => !e.is_approved);

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Zeiterfassung</h1>
                    <p className="text-slate-400 text-sm mt-1">{store.timeEntries.length} Eintraege | {pending.length} zur Genehmigung</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm font-semibold rounded-lg transition-colors"><Download className="w-4 h-4" /> CSV</button>
                    <button onClick={openManual} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4" /> Manuell</button>
                </div>
            </header>

            {/* Timer */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-6 flex-wrap">
                    <div className={`font-display text-4xl font-extrabold tracking-tight tabular-nums ${timerRunning ? "text-emerald-400" : "text-white"}`}>{formatTimer(timerSeconds)}</div>
                    {!timerRunning ? (
                        <button onClick={startTimer} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors"><Play className="w-4 h-4" /> Starten</button>
                    ) : (
                        <button onClick={stopTimer} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors"><Square className="w-4 h-4" /> Stoppen</button>
                    )}
                    <select value={timerEmployee} onChange={(e) => setTimerEmployee(e.target.value)} className="bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white px-3 py-2.5">
                        <option value="">Mitarbeiter</option>
                        {store.employees.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                    </select>
                    <select value={timerProject} onChange={(e) => setTimerProject(e.target.value)} className="bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white px-3 py-2.5">
                        <option value="">Projekt</option>
                        {store.projects.filter((p) => p.status === "aktiv").map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Pending */}
            {pending.length > 0 && (
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold text-white">Genehmigungen offen</h2>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold">{pending.length}</span>
                    </div>
                    <div className="divide-y divide-slate-800/40">
                        {pending.map((e) => (
                            <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${typeColors[e.type]}`}>{typeLabels[e.type]}</span>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-white">{store.getEmployeeName(e.employee_id)}</div>
                                    <div className="text-xs text-slate-500">{store.getProjectName(e.project_id)} | {formatDate(e.date)} | {e.description || "\u2014"}</div>
                                </div>
                                <div className="text-sm font-bold text-white">{e.duration.toFixed(1)}h</div>
                                <button onClick={() => approveEntry(e.id)} className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors">Genehmigen</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/60"><h2 className="font-display text-lg font-bold text-white">Alle Eintraege</h2></div>
                <div className="divide-y divide-slate-800/40">
                    {store.timeEntries.map((e) => (
                        <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${typeColors[e.type]}`}>{typeLabels[e.type]}</span>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white">{store.getEmployeeName(e.employee_id)}</div>
                                <div className="text-xs text-slate-500">{store.getProjectName(e.project_id)} | {formatDate(e.date)} | {e.start_time}–{e.end_time}</div>
                            </div>
                            <div className="text-sm font-bold text-white">{e.duration.toFixed(1)}h</div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.is_approved ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"}`}>
                                {e.is_approved ? "Genehmigt" : "Offen"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Manual Entry Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Manueller Zeiteintrag" size="md"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-400 border border-slate-700 rounded-lg">Abbrechen</button>
                    <button onClick={handleManualSave} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20">Speichern</button>
                </>}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mitarbeiter *</label>
                            <select value={empId} onChange={(e) => setEmpId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                {store.employees.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                            </select></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Projekt</label>
                            <select value={projId} onChange={(e) => setProjId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                <option value="">-- kein Projekt --</option>
                                {store.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select></div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Datum</label><input type="date" value={entDate} onChange={(e) => setEntDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Von</label><input type="time" value={entStart} onChange={(e) => setEntStart(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Bis</label><input type="time" value={entEnd} onChange={(e) => setEntEnd(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Typ</label>
                            <select value={entType} onChange={(e) => setEntType(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select></div>
                    </div>
                    <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Beschreibung</label><input value={entDesc} onChange={(e) => setEntDesc(e.target.value)} placeholder="Taetigkeit beschreiben..." className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                </div>
            </Modal>
        </div>
    );
}

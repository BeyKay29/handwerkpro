"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import StatusBadge from "@/components/ui/status-badge";
import { formatCurrency, formatDate, today } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Project } from "@/types";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#f97316"];

export default function ProjektePage() {
    const store = useStore();
    const { toast } = useToast();
    const [filter, setFilter] = useState("alle");
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState<Project["status"]>("planung");
    const [budget, setBudget] = useState(0);
    const [progress, setProgress] = useState(0);
    const [startDate, setStartDate] = useState(today());
    const [endDate, setEndDate] = useState("");
    const [notes, setNotes] = useState("");
    const [team, setTeam] = useState<string[]>([]);

    const filtered = store.projects.filter((p) => {
        const statusMatch = filter === "alle" || p.status === filter;
        const searchMatch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return statusMatch && searchMatch;
    });

    function openCreate() {
        setEditId(null); setName(""); setCustomerId(store.customers[0]?.id || ""); setAddress("");
        setStatus("planung"); setBudget(0); setProgress(0); setStartDate(today()); setEndDate(""); setNotes(""); setTeam([]);
        setModalOpen(true);
    }

    function openEdit(p: Project) {
        setEditId(p.id); setName(p.name); setCustomerId(p.customer_id || ""); setAddress(p.address || "");
        setStatus(p.status); setBudget(p.budget); setProgress(p.progress); setStartDate(p.start_date || ""); setEndDate(p.end_date || "");
        setNotes(p.notes || ""); setTeam(p.team || []);
        setModalOpen(true);
    }

    function handleSave() {
        if (!name.trim()) { toast("Bitte Projektname eingeben", "error"); return; }
        const data = { name, customer_id: customerId || undefined, address, status, budget, progress, start_date: startDate, end_date: endDate, notes, team, color: COLORS[store.projects.length % COLORS.length] };
        if (editId) {
            store.updateProject(editId, data);
            toast("Projekt aktualisiert", "success", name);
        } else {
            store.addProject(data);
            toast("Projekt angelegt", "success", name);
        }
        setModalOpen(false);
    }

    function handleDelete(id: string, pName: string) {
        if (!confirm(`"${pName}" wirklich loschen?`)) return;
        store.deleteProject(id);
        toast("Projekt geloscht", "info", pName);
    }

    function toggleTeam(empId: string) {
        setTeam((prev) => prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]);
    }

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Projekte</h1>
                    <p className="text-slate-400 text-sm mt-1">{filtered.length} Projekte</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4" /> Neues Projekt
                </button>
            </header>

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Projekt suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600" />
                </div>
                <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
                    {[{ k: "alle", l: "Alle" }, { k: "aktiv", l: "Aktiv" }, { k: "planung", l: "Planung" }, { k: "abgeschlossen", l: "Abgeschlossen" }].map((tab) => (
                        <button key={tab.k} onClick={() => setFilter(tab.k)} className={`px-4 py-2 text-xs font-semibold transition-colors ${filter === tab.k ? "bg-blue-600/15 text-blue-400" : "text-slate-400 hover:text-white"}`}>{tab.l}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((project) => {
                    const invoiced = store.getProjectInvoiced(project.id);
                    const paid = store.getProjectPaid(project.id);
                    return (
                        <div key={project.id} className="glass rounded-2xl overflow-hidden hover:border-slate-700/60 transition-all duration-300 group">
                            <div className="h-1" style={{ backgroundColor: project.color }} />
                            <div className="p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{project.name}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{store.getCustomerName(project.customer_id || "")}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <StatusBadge status={project.status} />
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(project)} className="w-6 h-6 rounded border border-slate-700 hover:border-blue-500 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors"><Pencil className="w-2.5 h-2.5" /></button>
                                            <button onClick={() => handleDelete(project.id, project.name)} className="w-6 h-6 rounded border border-slate-700 hover:border-red-500 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Fortschritt</span><span className="text-white font-bold">{project.progress}%</span></div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${project.progress}%`, backgroundColor: project.color }} /></div>
                                </div>
                                {/* Budget vs Invoiced vs Paid */}
                                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/60">
                                    <div className="text-center"><div className="text-[13px] font-bold text-white">{formatCurrency(project.budget)}</div><div className="text-[10px] text-slate-500">Budget</div></div>
                                    <div className="text-center"><div className="text-[13px] font-bold text-blue-400">{formatCurrency(invoiced)}</div><div className="text-[10px] text-slate-500">Fakturiert</div></div>
                                    <div className="text-center"><div className="text-[13px] font-bold text-emerald-400">{formatCurrency(paid)}</div><div className="text-[10px] text-slate-500">Bezahlt</div></div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                                    <div className="flex -space-x-2">
                                        {(project.team || []).map((eid) => {
                                            const emp = store.employees.find((e) => e.id === eid);
                                            if (!emp) return null;
                                            return <div key={eid} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-900" style={{ backgroundColor: emp.color }}>{emp.first_name[0]}{emp.last_name[0]}</div>;
                                        })}
                                    </div>
                                    <span className="text-[11px] text-slate-500">{formatDate(project.start_date)} &ndash; {formatDate(project.end_date)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Projekt bearbeiten" : "Neues Projekt"} size="md"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-400 border border-slate-700 rounded-lg">Abbrechen</button>
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20">{editId ? "Speichern" : "Anlegen"}</button>
                </>}>
                <div className="space-y-4">
                    <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Projektname *</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kunde</label>
                            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                <option value="">-- kein Kunde --</option>{store.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as Project["status"])} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                <option value="planung">Planung</option><option value="aktiv">Aktiv</option><option value="abgeschlossen">Abgeschlossen</option><option value="storniert">Storniert</option>
                            </select></div>
                    </div>
                    <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Adresse</label><input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                    <div className="grid grid-cols-4 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Budget</label><input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Fortschritt %</label><input type="number" value={progress} onChange={(e) => setProgress(Number(e.target.value))} min={0} max={100} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Start</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ende</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Team</label>
                        <div className="flex flex-wrap gap-2">
                            {store.employees.map((emp) => (
                                <button key={emp.id} onClick={() => toggleTeam(emp.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${team.includes(emp.id) ? "bg-blue-500/15 border-blue-500/30 text-blue-400" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: emp.color }} />{emp.first_name} {emp.last_name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notizen</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white resize-none" /></div>
                </div>
            </Modal>
        </div>
    );
}

"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Employee } from "@/types";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#f97316"];

export default function MitarbeiterPage() {
    const store = useStore();
    const { toast } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("");
    const [hourlyRate, setHourlyRate] = useState(45);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [skillsStr, setSkillsStr] = useState("");

    function openCreate() {
        setEditId(null); setFirstName(""); setLastName(""); setRole("Geselle");
        setHourlyRate(45); setEmail(""); setPhone(""); setSkillsStr("");
        setModalOpen(true);
    }

    function openEdit(m: Employee) {
        setEditId(m.id); setFirstName(m.first_name); setLastName(m.last_name); setRole(m.role || "");
        setHourlyRate(m.hourly_rate); setEmail(m.email || ""); setPhone(m.phone || ""); setSkillsStr((m.skills || []).join(", "));
        setModalOpen(true);
    }

    function handleSave() {
        if (!firstName.trim() || !lastName.trim()) { toast("Vor- und Nachname eingeben", "error"); return; }
        const data = { first_name: firstName, last_name: lastName, role, hourly_rate: hourlyRate, email, phone, skills: skillsStr.split(",").map((s) => s.trim()).filter(Boolean), color: COLORS[store.employees.length % COLORS.length], is_active: true };
        if (editId) {
            store.updateEmployee(editId, data);
            toast("Mitarbeiter aktualisiert", "success", `${firstName} ${lastName}`);
        } else {
            store.addEmployee(data);
            toast("Mitarbeiter angelegt", "success", `${firstName} ${lastName}`);
        }
        setModalOpen(false);
    }

    function handleDelete(id: string, name: string) {
        if (!confirm(`"${name}" wirklich loschen?`)) return;
        store.deleteEmployee(id);
        toast("Mitarbeiter geloscht", "info", name);
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Mitarbeiter</h1>
                    <p className="text-slate-400 text-sm mt-1">{store.employees.length} Mitarbeiter</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4" /> Hinzufuegen
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {store.employees.map((m) => {
                    const hours = store.timeEntries.filter((t) => t.employee_id === m.id).reduce((s, t) => s + t.duration, 0);
                    return (
                        <div key={m.id} className="glass rounded-2xl p-6 hover:border-slate-700/60 transition-all duration-300 text-center group space-y-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-lg font-bold text-white" style={{ background: `linear-gradient(135deg, ${m.color}, #8b5cf6)` }}>
                                    {m.first_name[0]}{m.last_name[0]}
                                </div>
                                <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(m)} className="w-6 h-6 rounded border border-slate-700 hover:border-blue-500 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors bg-slate-900"><Pencil className="w-2.5 h-2.5" /></button>
                                    <button onClick={() => handleDelete(m.id, `${m.first_name} ${m.last_name}`)} className="w-6 h-6 rounded border border-slate-700 hover:border-red-500 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors bg-slate-900"><Trash2 className="w-2.5 h-2.5" /></button>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">{m.first_name} {m.last_name}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{m.role}</div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1.5">
                                {(m.skills || []).map((s) => (
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

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"} size="md"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-400 border border-slate-700 rounded-lg">Abbrechen</button>
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20">{editId ? "Speichern" : "Anlegen"}</button>
                </>}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Vorname *</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nachname *</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rolle</label><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="z.B. Geselle, Bauleiter" className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Stundensatz (EUR)</label><input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">E-Mail</label><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Telefon</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                    </div>
                    <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Skills (kommagetrennt)</label><input value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)} placeholder="Malerei, Tapezieren, Fassade" className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                </div>
            </Modal>
        </div>
    );
}

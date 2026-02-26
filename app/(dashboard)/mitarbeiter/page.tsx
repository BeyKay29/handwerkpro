"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Employee, ContractType } from "@/types";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#f97316"];
const contractLabels: Record<string, string> = { vollzeit: "Vollzeit", teilzeit: "Teilzeit", minijob: "Minijob", freelancer: "Freelancer" };

export default function MitarbeiterPage() {
    const store = useStore();
    const { toast } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [showPw, setShowPw] = useState(false);

    // Form fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [hourlyRate, setHourlyRate] = useState(45);
    const [monthlySalary, setMonthlySalary] = useState(0);
    const [contractType, setContractType] = useState<ContractType>("vollzeit");
    const [skillsStr, setSkillsStr] = useState("");

    function openCreate() {
        setEditId(null); setFirstName(""); setLastName(""); setRole("Geselle");
        setEmail(""); setPassword(""); setPhone(""); setHourlyRate(45); setMonthlySalary(0);
        setContractType("vollzeit"); setSkillsStr(""); setShowPw(false);
        setModalOpen(true);
    }

    function openEdit(m: Employee) {
        setEditId(m.id); setFirstName(m.first_name); setLastName(m.last_name); setRole(m.role || "");
        setEmail(m.email || ""); setPassword(m.password || ""); setPhone(m.phone || "");
        setHourlyRate(m.hourly_rate); setMonthlySalary(m.monthly_salary || 0);
        setContractType((m.contract_type || "vollzeit") as ContractType);
        setSkillsStr((m.skills || []).join(", ")); setShowPw(false);
        setModalOpen(true);
    }

    function handleSave() {
        if (!firstName.trim() || !lastName.trim()) { toast("Vor- und Nachname eingeben", "error"); return; }
        if (!email.trim()) { toast("E-Mail-Adresse eingeben", "error"); return; }
        const data = {
            first_name: firstName, last_name: lastName, role, email, password, phone,
            hourly_rate: hourlyRate, monthly_salary: monthlySalary || undefined,
            contract_type: contractType,
            skills: skillsStr.split(",").map((s) => s.trim()).filter(Boolean),
            color: COLORS[store.employees.length % COLORS.length], is_active: true,
        };
        if (editId) {
            store.updateEmployee(editId, data);
            toast("Profil aktualisiert", "success", `${firstName} ${lastName}`);
        } else {
            store.addEmployee(data);
            toast("Mitarbeiter angelegt", "success", `${firstName} ${lastName}`);
        }
        setModalOpen(false);
    }

    function handleDelete(id: string, name: string) {
        if (!confirm(`"${name}" wirklich entfernen?`)) return;
        store.deleteEmployee(id);
        toast("Mitarbeiter entfernt", "info", name);
    }

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-slate-400 text-sm">{store.employees.length} Mitarbeiter</p>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20 w-fit">
                    <Plus className="w-4 h-4" /> Neues Profil
                </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {store.employees.map((m) => {
                    const hours = store.timeEntries.filter((t) => t.employee_id === m.id).reduce((s, t) => s + t.duration, 0);
                    return (
                        <div key={m.id} className="glass rounded-2xl p-5 hover:border-slate-700/60 transition-all duration-300 group space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${m.color}, #8b5cf6)` }}>
                                        {m.first_name[0]}{m.last_name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{m.first_name} {m.last_name}</div>
                                        <div className="text-[11px] text-slate-500">{m.role || "Mitarbeiter"}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(m)} className="w-6 h-6 rounded border border-slate-700 hover:border-blue-500 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors bg-slate-900"><Pencil className="w-2.5 h-2.5" /></button>
                                    <button onClick={() => handleDelete(m.id, `${m.first_name} ${m.last_name}`)} className="w-6 h-6 rounded border border-slate-700 hover:border-red-500 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors bg-slate-900"><Trash2 className="w-2.5 h-2.5" /></button>
                                </div>
                            </div>

                            {/* Contract Badge */}
                            <div className="flex items-center gap-2">
                                {m.contract_type && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400">
                                        {contractLabels[m.contract_type] || m.contract_type}
                                    </span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"}`}>
                                    {m.is_active ? "Aktiv" : "Inaktiv"}
                                </span>
                            </div>

                            {/* Contact */}
                            <div className="space-y-1.5">
                                {m.email && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Mail className="w-3 h-3 text-slate-600" />{m.email}
                                    </div>
                                )}
                                {m.phone && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Phone className="w-3 h-3 text-slate-600" />{m.phone}
                                    </div>
                                )}
                            </div>

                            {/* Skills */}
                            {(m.skills || []).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {m.skills.map((s) => (
                                        <span key={s} className="px-2 py-0.5 bg-slate-800/80 rounded-full text-[10px] font-semibold text-slate-400">{s}</span>
                                    ))}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/60">
                                <div className="text-center">
                                    <div className="text-[13px] font-bold text-blue-400">{formatCurrency(m.hourly_rate)}</div>
                                    <div className="text-[10px] text-slate-500">/ Std.</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[13px] font-bold text-white">{m.monthly_salary ? formatCurrency(m.monthly_salary) : "\u2014"}</div>
                                    <div className="text-[10px] text-slate-500">/ Monat</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[13px] font-bold text-white">{hours.toFixed(1)}h</div>
                                    <div className="text-[10px] text-slate-500">erfasst</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create/Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Profil bearbeiten" : "Neues Mitarbeiterprofil"} size="lg"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-400 border border-slate-700 rounded-lg transition-colors hover:text-white hover:border-slate-600">Abbrechen</button>
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20">{editId ? "Speichern" : "Anlegen"}</button>
                </>}>
                <div className="space-y-6">
                    {/* Section: Persoenliche Daten */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Persoenliche Daten</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Vorname *</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600" placeholder="Max" /></div>
                            <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nachname *</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600" placeholder="Mustermann" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rolle / Position</label><input value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600" placeholder="z.B. Geselle, Bauleiter, Azubi" /></div>
                            <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Telefon</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600" placeholder="0171 1234567" /></div>
                        </div>
                    </div>

                    {/* Section: Zugangsdaten */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Zugangsdaten</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">E-Mail-Adresse *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600" placeholder="max@firma.de" /></div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Passwort</label>
                                <div className="relative">
                                    <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 pr-10 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600" placeholder="Mindestens 8 Zeichen" />
                                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Verguetung */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Verguetung</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Vertragsart</label>
                                <select value={contractType} onChange={(e) => setContractType(e.target.value as ContractType)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                    <option value="vollzeit">Vollzeit</option><option value="teilzeit">Teilzeit</option><option value="minijob">Minijob</option><option value="freelancer">Freelancer</option>
                                </select></div>
                            <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Stundensatz (EUR)</label><input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} step="0.50" className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                            <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Monatsgehalt (EUR)</label><input type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} step="100" className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" placeholder="z.B. 3200" /></div>
                        </div>
                    </div>

                    {/* Section: Skills */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Qualifikationen</h3>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Skills (kommagetrennt)</label><input value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)} placeholder="Malerei, Tapezieren, Fassade, Trockenbau" className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600" /></div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

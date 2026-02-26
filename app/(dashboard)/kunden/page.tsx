"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Customer } from "@/types";

const emptyForm = { name: "", type: "Gewerblich", email: "", phone: "", address: "", payment_terms: 14, credit_limit: 10000, notes: "" };

export default function KundenPage() {
    const store = useStore();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    const customers = store.customers.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

    function openCreate() {
        setEditId(null);
        setForm(emptyForm);
        setModalOpen(true);
    }

    function openEdit(c: Customer) {
        setEditId(c.id);
        setForm({ name: c.name, type: c.type, email: c.email || "", phone: c.phone || "", address: c.address || "", payment_terms: c.payment_terms, credit_limit: c.credit_limit, notes: c.notes || "" });
        setModalOpen(true);
    }

    function handleSave() {
        if (!form.name.trim()) { toast("Bitte Name eingeben", "error"); return; }
        if (editId) {
            store.updateCustomer(editId, form);
            toast("Kunde aktualisiert", "success", form.name);
        } else {
            store.addCustomer(form);
            toast("Kunde angelegt", "success", form.name);
        }
        setModalOpen(false);
    }

    function handleDelete(id: string, name: string) {
        if (!confirm(`"${name}" wirklich loschen?`)) return;
        store.deleteCustomer(id);
        toast("Kunde geloscht", "info", name);
    }

    const set = (key: string, val: string | number) => setForm((prev) => ({ ...prev, [key]: val }));

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Kunden</h1>
                    <p className="text-slate-400 text-sm mt-1">{customers.length} Kunden</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4" /> Neuer Kunde
                </button>
            </header>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Kunden suchen..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {customers.map((c) => {
                    const revenue = store.invoices.filter((d) => d.customer_id === c.id && d.status === "bezahlt").reduce((s, d) => s + d.total_amount, 0);
                    const projCount = store.projects.filter((p) => p.customer_id === c.id).length;
                    const docCount = store.invoices.filter((d) => d.customer_id === c.id).length;
                    const initials = c.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
                    const typeColor = c.type === "Stammkunde" ? "bg-emerald-500/15 text-emerald-400" : c.type === "Gewerblich" ? "bg-blue-500/15 text-blue-400" : "bg-slate-500/15 text-slate-400";

                    return (
                        <div key={c.id} className="glass rounded-2xl p-6 hover:border-slate-700/60 transition-all duration-300 group space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-sm font-bold text-blue-400">{initials}</div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{c.name}</div>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColor}`}>{c.type}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-md border border-slate-700 hover:border-blue-500 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors">
                                        <Pencil className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => handleDelete(c.id, c.name)} className="w-7 h-7 rounded-md border border-slate-700 hover:border-red-500 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5 text-xs text-slate-400">
                                {c.email && <div>{c.email}</div>}
                                {c.phone && <div>{c.phone}</div>}
                                {c.address && <div>{c.address}</div>}
                            </div>
                            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800/60">
                                <div className="text-center"><div className="text-sm font-bold text-white">{formatCurrency(revenue)}</div><div className="text-[10px] text-slate-500">Umsatz</div></div>
                                <div className="text-center"><div className="text-sm font-bold text-white">{docCount}</div><div className="text-[10px] text-slate-500">Dokumente</div></div>
                                <div className="text-center"><div className="text-sm font-bold text-white">{projCount}</div><div className="text-[10px] text-slate-500">Projekte</div></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editId ? "Kunde bearbeiten" : "Neuer Kunde"}
                size="md"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
                            Abbrechen
                        </button>
                        <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                            {editId ? "Speichern" : "Anlegen"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Name *</label>
                        <input value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" placeholder="Firmenname oder Name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Typ</label>
                            <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                <option>Gewerblich</option><option>Privat</option><option>Stammkunde</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">E-Mail</label>
                            <input value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" placeholder="info@firma.de" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Telefon</label>
                            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" placeholder="06221/12345" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Zahlungsziel (Tage)</label>
                            <input type="number" value={form.payment_terms} onChange={(e) => set("payment_terms", Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Adresse</label>
                        <input value={form.address} onChange={(e) => set("address", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" placeholder="Strasse, PLZ Ort" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notizen</label>
                        <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white resize-none" placeholder="Interne Notizen..." />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

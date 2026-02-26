"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2, User } from "lucide-react";
import { useState } from "react";
import { Customer } from "@/types";

const emptyForm = { name: "", type: "Gewerblich", contact_person: "", email: "", phone: "", address: "", notes: "" };

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
        setForm({
            name: c.name,
            type: c.type,
            contact_person: c.contact_person || "",
            email: c.email || "",
            phone: c.phone || "",
            address: c.address || "",
            notes: c.notes || ""
        });
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
        if (!confirm(`"${name}" wirklich löschen?`)) return;
        store.deleteCustomer(id);
        toast("Kunde gelöscht", "info", name);
    }

    const set = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((c) => {
                    const revenue = store.getCustomerRevenue(c.id);
                    const openAmount = store.getCustomerOpenAmount(c.id);
                    const projCount = store.getCustomerProjectCount(c.id);
                    const docCount = store.getCustomerDocCount(c.id);
                    const initials = c.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
                    const typeColor = c.type === "Stammkunde" ? "bg-emerald-500/15 text-emerald-400" : c.type === "Gewerblich" ? "bg-blue-500/15 text-blue-400" : "bg-slate-500/15 text-slate-400";

                    return (
                        <div key={c.id} className="glass rounded-2xl p-5 hover:border-slate-700/60 transition-all duration-300 group space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-sm font-bold text-blue-400 flex-shrink-0">{initials}</div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-white truncate">{c.name}</div>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColor}`}>{c.type}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-md border border-slate-700 hover:border-blue-500 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors">
                                        <Pencil className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => handleDelete(c.id, c.name)} className="w-7 h-7 rounded-md border border-slate-700 hover:border-red-500 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1 text-xs text-slate-400">
                                {c.contact_person && <div className="flex items-center gap-1.5"><User className="w-3 h-3 opacity-40" /> {c.contact_person}</div>}
                                {c.email && <div className="truncate">{c.email}</div>}
                                {c.phone && <div>{c.phone}</div>}
                            </div>
                            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800/60">
                                <div className="text-center"><div className="text-[13px] font-bold text-emerald-400">{formatCurrency(revenue)}</div><div className="text-[10px] text-slate-500">Umsatz</div></div>
                                <div className="text-center"><div className="text-[13px] font-bold text-amber-400">{openAmount > 0 ? formatCurrency(openAmount) : "\u2014"}</div><div className="text-[10px] text-slate-500">Offen</div></div>
                                <div className="text-center"><div className="text-[13px] font-bold text-white">{docCount}</div><div className="text-[10px] text-slate-500">Dokum.</div></div>
                                <div className="text-center"><div className="text-[13px] font-bold text-white">{projCount}</div><div className="text-[10px] text-slate-500">Projekte</div></div>
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
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kundenname / Firma *</label>
                        <input value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" placeholder="z.B. Schmidt & Co" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kontaktperson</label>
                            <input value={form.contact_person} onChange={(e) => set("contact_person", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" placeholder="Max Mustermann" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kundentyp</label>
                            <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                <option>Gewerblich</option><option>Privat</option><option>Stammkunde</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Telefon</label>
                            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" placeholder="06221 / 12345" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">E-Mail</label>
                            <input value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" placeholder="info@kunde.de" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Adresse</label>
                        <input value={form.address} onChange={(e) => set("address", e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" placeholder="Strasse 123, 12345 Ort" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notizen</label>
                        <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white resize-none font-sans" placeholder="Interne Anmerkungen..." />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

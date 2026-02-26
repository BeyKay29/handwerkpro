"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { CatalogItem } from "@/types";

export default function LeistungenPage() {
    const store = useStore();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [unit, setUnit] = useState("m2");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");

    const items = store.catalog.filter((l) => !search || (l.name + l.category).toLowerCase().includes(search.toLowerCase()));

    function openCreate() {
        setEditId(null); setName(""); setCategory(""); setUnit("m2"); setPrice(0); setDescription("");
        setModalOpen(true);
    }

    function openEdit(l: CatalogItem) {
        setEditId(l.id); setName(l.name); setCategory(l.category || ""); setUnit(l.unit); setPrice(l.price); setDescription(l.description || "");
        setModalOpen(true);
    }

    function handleSave() {
        if (!name.trim()) { toast("Bitte Name eingeben", "error"); return; }
        const data = { name, category, unit, price, description };
        if (editId) {
            store.updateCatalogItem(editId, data);
            toast("Leistung aktualisiert", "success", name);
        } else {
            store.addCatalogItem(data);
            toast("Leistung angelegt", "success", name);
        }
        setModalOpen(false);
    }

    function handleDelete(id: string, lName: string) {
        if (!confirm(`"${lName}" wirklich loschen?`)) return;
        store.deleteCatalogItem(id);
        toast("Leistung geloscht", "info", lName);
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Leistungskatalog</h1>
                    <p className="text-slate-400 text-sm mt-1">{items.length} Leistungen</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4" /> Neue Leistung
                </button>
            </header>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Leistung suchen..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {items.map((l) => (
                    <div key={l.id} className="glass rounded-2xl p-6 hover:border-slate-700/60 transition-all duration-300 group space-y-3">
                        <div className="flex items-start justify-between">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{l.category}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(l)} className="w-6 h-6 rounded border border-slate-700 hover:border-blue-500 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors"><Pencil className="w-2.5 h-2.5" /></button>
                                <button onClick={() => handleDelete(l.id, l.name)} className="w-6 h-6 rounded border border-slate-700 hover:border-red-500 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
                            </div>
                        </div>
                        <div className="text-sm font-bold text-white">{l.name}</div>
                        <p className="text-xs text-slate-500 leading-relaxed">{l.description}</p>
                        <div className="flex items-baseline gap-1 pt-2 border-t border-slate-800/60">
                            <span className="font-display text-lg font-extrabold text-white">{formatCurrency(l.price)}</span>
                            <span className="text-xs text-slate-500">/ {l.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Leistung bearbeiten" : "Neue Leistung"} size="md"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-400 border border-slate-700 rounded-lg">Abbrechen</button>
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20">{editId ? "Speichern" : "Anlegen"}</button>
                </>}>
                <div className="space-y-4">
                    <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kategorie</label><input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="z.B. Malerei Innen" className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Einheit</label>
                            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                {["m2", "Std.", "Stueck", "pauschal", "m", "lfdm", "Liter"].map((u) => <option key={u}>{u}</option>)}
                            </select></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Preis (EUR)</label><input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} step="0.01" className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                    </div>
                    <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Beschreibung</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white resize-none" /></div>
                </div>
            </Modal>
        </div>
    );
}

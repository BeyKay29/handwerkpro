"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { Plus, Pencil, Trash2, FileText, Mail, AlertTriangle, CheckCircle2, Search, Info } from "lucide-react";
import { useState } from "react";
import { TextTemplate } from "@/types";

const emptyTemplate: { name: string; type: "angebot" | "rechnung" | "mahnung"; subject: string; content: string } = { name: "", type: "angebot", subject: "", content: "" };

export default function VorlagenPage() {
    const store = useStore();
    const { toast } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyTemplate);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"alle" | "angebot" | "rechnung" | "mahnung">("alle");

    const filtered = store.templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
        const matchesTab = activeTab === "alle" || t.type === activeTab;
        return matchesSearch && matchesTab;
    });

    function openCreate() {
        setEditId(null);
        setForm(emptyTemplate);
        setModalOpen(true);
    }

    function openEdit(t: TextTemplate) {
        setEditId(t.id);
        setForm({ name: t.name, type: t.type as "angebot" | "rechnung" | "mahnung", subject: t.subject, content: t.content });
        setModalOpen(true);
    }

    function handleSave() {
        if (!form.name.trim() || !form.subject.trim() || !form.content.trim()) {
            toast("Bitte alle Pflichtfelder ausfüllen", "error");
            return;
        }
        if (editId) {
            store.updateTemplate(editId, form);
            toast("Vorlage aktualisiert", "success");
        } else {
            store.addTemplate(form);
            toast("Vorlage erstellt", "success");
        }
        setModalOpen(false);
    }

    function handleDelete(id: string, name: string) {
        if (!confirm(`"${name}" wirklich löschen?`)) return;
        store.deleteTemplate(id);
        toast("Vorlage gelöscht", "info");
    }

    const set = (key: keyof typeof emptyTemplate, val: any) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Textvorlagen</h1>
                    <p className="text-slate-400 text-sm mt-1">Verwalten Sie Ihre Standardtexte für Angebote, Rechnungen und Mahnungen.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4" /> Neue Vorlage
                </button>
            </header>

            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1 w-fit shadow-inner">
                    {["alle", "angebot", "rechnung", "mahnung"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Vorlagen suchen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((t) => (
                    <div key={t.id} className="glass rounded-3xl p-6 border border-slate-800/60 hover:border-blue-500/30 transition-all group flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2 rounded-xl ${t.type === 'angebot' ? 'bg-amber-500/10 text-amber-500' : t.type === 'rechnung' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                                {t.type === 'angebot' ? <FileText className="w-5 h-5" /> : t.type === 'rechnung' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(t)} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(t.id, t.name)} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{t.name}</h3>
                            <div className="text-xs font-semibold text-slate-500 mb-1">{t.subject}</div>
                            <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed italic">{t.content}</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">ID: {t.id.slice(0, 8)}</span>
                            <span className="text-[10px] font-bold text-slate-500">Zuletzt geändert: {new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 glass rounded-3xl border border-dashed border-slate-800">
                    <Info className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-600">Keine Vorlagen gefunden</h2>
                    <p className="text-slate-700 text-sm">Erstellen Sie Ihre erste Vorlage mit dem Button oben rechts.</p>
                </div>
            )}

            {/* Modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editId ? "Vorlage bearbeiten" : "Neue Vorlage erstellen"}
                size="lg"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-white border border-slate-800 rounded-xl transition-all">Abbrechen</button>
                    <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xl shadow-blue-500/20">{editId ? "Speichern" : "Erstellen"}</button>
                </>}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Vorlagen-Name</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => set("name", e.target.value)}
                                    placeholder="z.B. Standard Angebot"
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Dokumenttyp</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["angebot", "rechnung", "mahnung"] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => set("type", type)}
                                            className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${form.type === type ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-white"}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Betreffzeile</label>
                                <input
                                    value={form.subject}
                                    onChange={(e) => set("subject", e.target.value)}
                                    placeholder="z.B. Ihr Angebot für das Projekt..."
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Inhalt / Textkörper</label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => set("content", e.target.value)}
                                    rows={8}
                                    placeholder="Schreiben Sie hier Ihren Standardtext..."
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                />
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                <div className="flex gap-2 items-center text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
                                    <Info className="w-3 h-3" /> Tipp
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                    Verwenden Sie Platzhalter wie [KUNDENNAME] oder [PROJEKTNAME], um Ihre Texte später automatisch zu personalisieren.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

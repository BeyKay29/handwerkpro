"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import StatusBadge from "@/components/ui/status-badge";
import { formatCurrency, formatDate, daysDiff, today, uid } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2, ArrowUpDown, DollarSign, FileCheck } from "lucide-react";
import { useState } from "react";
import { Invoice, DocumentItem } from "@/types";

const typeLabels: Record<string, string> = { angebot: "Angebot", rechnung: "Rechnung" };

const emptyItem = (): DocumentItem => ({ description: "", quantity: 1, unit: "m2", unit_price: 0, total: 0, sort_order: 0 });

export default function AngebotePage() {
    const store = useStore();
    const { toast } = useToast();
    const [filter, setFilter] = useState("alle");
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [payDocId, setPayDocId] = useState<string | null>(null);
    const [payAmount, setPayAmount] = useState(0);

    // Form state
    const [docType, setDocType] = useState<"angebot" | "rechnung">("angebot");
    const [customerId, setCustomerId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [docDate, setDocDate] = useState(today());
    const [dueDate, setDueDate] = useState("");
    const [taxRate, setTaxRate] = useState(19);
    const [discountRate, setDiscountRate] = useState(0);
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<DocumentItem[]>([emptyItem()]);

    const filtered = store.invoices.filter((d) => {
        const typeMatch = filter === "alle" || d.doc_type === filter;
        const q = search.toLowerCase();
        const searchMatch = !q || (d.doc_number + store.getCustomerName(d.customer_id)).toLowerCase().includes(q);
        return typeMatch && searchMatch;
    });

    function openCreate() {
        setEditId(null); setDocType("angebot"); setCustomerId(store.customers[0]?.id || "");
        setProjectId(""); setDocDate(today());
        const d = new Date(); d.setDate(d.getDate() + 30); setDueDate(d.toISOString().split("T")[0]);
        setTaxRate(19); setDiscountRate(0); setNotes("Zahlbar innerhalb von 14 Tagen netto ohne Abzug.");
        setItems([emptyItem()]); setModalOpen(true);
    }

    function openEdit(doc: Invoice) {
        setEditId(doc.id); setDocType(doc.doc_type as "angebot" | "rechnung");
        setCustomerId(doc.customer_id); setProjectId(doc.project_id || "");
        setDocDate(doc.date); setDueDate(doc.due_date || "");
        setTaxRate(doc.tax_rate); setDiscountRate(doc.discount_rate);
        setNotes(doc.notes || ""); setItems(doc.items.length ? [...doc.items] : [emptyItem()]);
        setModalOpen(true);
    }

    function updateItem(idx: number, field: string, value: string | number) {
        setItems((prev) => prev.map((it, i) => {
            if (i !== idx) return it;
            const updated = { ...it, [field]: value };
            if (field === "quantity" || field === "unit_price") {
                updated.total = (Number(updated.quantity) || 0) * (Number(updated.unit_price) || 0);
            }
            return updated;
        }));
    }

    const subtotal = items.reduce((s, it) => s + (it.total || 0), 0);
    const discountAmount = subtotal * (discountRate / 100);
    const netAfterDiscount = subtotal - discountAmount;
    const taxAmount = netAfterDiscount * (taxRate / 100);
    const totalAmount = netAfterDiscount + taxAmount;

    function handleSave() {
        if (!customerId) { toast("Bitte Kunde waehlen", "error"); return; }
        const prefix = docType === "angebot" ? "AN" : "RE";
        const year = new Date().getFullYear();
        const num = String(store.invoices.filter((d) => d.doc_type === docType).length + 1).padStart(4, "0");

        const data: Omit<Invoice, "id" | "company_id" | "created_at"> = {
            customer_id: customerId, project_id: projectId || undefined,
            doc_type: docType, doc_number: editId ? store.invoices.find((d) => d.id === editId)!.doc_number : `${prefix}-${year}-${num}`,
            status: "offen", date: docDate, due_date: dueDate || undefined,
            tax_rate: taxRate, discount_rate: discountRate, notes,
            subtotal, tax_amount: taxAmount, total_amount: totalAmount,
            paid_amount: 0, dunning_level: 0, items,
        };

        if (editId) {
            store.updateInvoice(editId, data);
            toast("Dokument aktualisiert", "success", data.doc_number);
        } else {
            store.addInvoice(data);
            toast("Dokument erstellt", "success", data.doc_number);
        }
        setModalOpen(false);
    }

    function handleDelete(id: string, nr: string) {
        if (!confirm(`"${nr}" wirklich loschen?`)) return;
        store.deleteInvoice(id);
        toast("Dokument geloscht", "info", nr);
    }

    function openPayModal(doc: Invoice) {
        setPayDocId(doc.id); setPayAmount(doc.total_amount - doc.paid_amount);
        setPayModalOpen(true);
    }

    function handlePay() {
        if (!payDocId || payAmount <= 0) return;
        const doc = store.invoices.find((d) => d.id === payDocId);
        if (!doc) return;
        const newPaid = doc.paid_amount + payAmount;
        const isFull = newPaid >= doc.total_amount - 0.01;
        store.updateInvoice(payDocId, {
            paid_amount: isFull ? doc.total_amount : newPaid,
            status: isFull ? "bezahlt" : doc.status,
        });
        toast(isFull ? "Rechnung vollstaendig bezahlt" : "Teilzahlung gebucht", "success", formatCurrency(payAmount));
        setPayModalOpen(false);
    }

    function acceptAngebot(id: string) {
        store.updateInvoice(id, { status: "angenommen" });
        toast("Angebot angenommen", "success");
    }

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-5">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-slate-400 text-sm">{filtered.length} Eintraege</p>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20 w-fit">
                    <Plus className="w-4 h-4" /> Neues Dokument
                </button>
            </header>

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Suchen..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600" />
                </div>
                <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
                    {[{ k: "alle", l: "Alle" }, { k: "angebot", l: "Angebote" }, { k: "rechnung", l: "Rechnungen" }].map((tab) => (
                        <button key={tab.k} onClick={() => setFilter(tab.k)} className={`px-4 py-2 text-xs font-semibold transition-colors ${filter === tab.k ? "bg-blue-600/15 text-blue-400" : "text-slate-400 hover:text-white"}`}>{tab.l}</button>
                    ))}
                </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b border-slate-800/60">
                            {["Nummer", "Typ", "Kunde", "Datum", "Faellig", "Betrag", "Status", "Aktionen"].map((h) => (
                                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                        {filtered.map((doc) => {
                            const isOverdue = doc.due_date && daysDiff(doc.due_date) > 0 && doc.status !== "bezahlt";
                            return (
                                <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-5 py-4 text-sm font-bold text-white">{doc.doc_number}</td>
                                    <td className="px-5 py-4"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{typeLabels[doc.doc_type] || doc.doc_type}</span></td>
                                    <td className="px-5 py-4 text-sm text-slate-300">{store.getCustomerName(doc.customer_id)}</td>
                                    <td className="px-5 py-4 text-sm text-slate-400">{formatDate(doc.date)}</td>
                                    <td className={`px-5 py-4 text-sm ${isOverdue ? "text-red-400 font-semibold" : "text-slate-400"}`}>{formatDate(doc.due_date)}</td>
                                    <td className="px-5 py-4 text-sm font-bold text-white">{formatCurrency(doc.total_amount)}</td>
                                    <td className="px-5 py-4"><StatusBadge status={doc.status} /></td>
                                    <td className="px-5 py-4">
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(doc)} className="w-7 h-7 rounded-md border border-slate-700 hover:border-blue-500 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors" title="Bearbeiten"><Pencil className="w-3 h-3" /></button>
                                            {doc.doc_type === "rechnung" && doc.status !== "bezahlt" && (
                                                <button onClick={() => openPayModal(doc)} className="w-7 h-7 rounded-md border border-slate-700 hover:border-emerald-500 flex items-center justify-center text-slate-500 hover:text-emerald-400 transition-colors" title="Zahlung buchen"><DollarSign className="w-3 h-3" /></button>
                                            )}
                                            {doc.doc_type === "angebot" && doc.status === "offen" && (
                                                <button onClick={() => acceptAngebot(doc.id)} className="w-7 h-7 rounded-md border border-slate-700 hover:border-emerald-500 flex items-center justify-center text-slate-500 hover:text-emerald-400 transition-colors" title="Annehmen"><FileCheck className="w-3 h-3" /></button>
                                            )}
                                            <button onClick={() => handleDelete(doc.id, doc.doc_number)} className="w-7 h-7 rounded-md border border-slate-700 hover:border-red-500 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors" title="Loschen"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="px-6 py-8 text-center text-sm text-slate-500">Keine Dokumente gefunden.</div>}
            </div>

            {/* Create/Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Dokument bearbeiten" : "Neues Dokument"} size="lg"
                footer={<>
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">Abbrechen</button>
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20">Speichern</button>
                </>}>
                <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dokumenttyp</label>
                            <select value={docType} onChange={(e) => setDocType(e.target.value as "angebot" | "rechnung")} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                <option value="angebot">Angebot</option><option value="rechnung">Rechnung</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kunde *</label>
                            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                {store.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Projekt</label>
                            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                <option value="">-- kein Projekt --</option>
                                {store.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Datum</label><input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Faellig</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">MwSt. %</label><input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                        <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rabatt %</label><input type="number" value={discountRate} onChange={(e) => setDiscountRate(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" /></div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Positionen</label>
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-[1fr_80px_80px_90px_90px_32px] gap-2 items-center">
                                    <input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Beschreibung" className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" />
                                    <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" />
                                    <select value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} className="px-2 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white">
                                        {["m2", "Std.", "Stueck", "pauschal", "m", "lfdm"].map((u) => <option key={u}>{u}</option>)}
                                    </select>
                                    <input type="number" value={item.unit_price} onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))} placeholder="EP" className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" />
                                    <div className="text-sm font-bold text-white text-right">{formatCurrency(item.total)}</div>
                                    <button onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))} className="w-7 h-7 rounded-md border border-slate-700 hover:border-red-500 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors text-xs">X</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button onClick={() => setItems((prev) => [...prev, emptyItem()])} className="px-3 py-1.5 text-xs font-semibold border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-blue-400 rounded-lg transition-colors">+ Position</button>
                            <button onClick={() => {
                                /* Quick add from catalog */
                                const cat = store.catalog;
                                if (!cat.length) return;
                                const first = cat[0];
                                setItems((prev) => [...prev, { description: first.name, quantity: 1, unit: first.unit, unit_price: first.price, total: first.price, sort_order: prev.length }]);
                            }} className="px-3 py-1.5 text-xs font-semibold border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-blue-400 rounded-lg transition-colors">Aus Katalog</button>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-4 space-y-1.5 text-sm text-right">
                        <div className="flex justify-between"><span className="text-slate-400">Netto</span><span className="text-white font-bold">{formatCurrency(subtotal)}</span></div>
                        {discountRate > 0 && <div className="flex justify-between"><span className="text-slate-400">Rabatt {discountRate}%</span><span className="text-white">- {formatCurrency(discountAmount)}</span></div>}
                        <div className="flex justify-between"><span className="text-slate-400">MwSt. {taxRate}%</span><span className="text-white">{formatCurrency(taxAmount)}</span></div>
                        <div className="flex justify-between pt-2 border-t border-slate-700"><span className="font-bold text-white">Gesamt</span><span className="font-display text-lg font-extrabold text-white">{formatCurrency(totalAmount)}</span></div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notizen</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white resize-none" />
                    </div>
                </div>
            </Modal>

            {/* Payment Modal */}
            <Modal open={payModalOpen} onClose={() => setPayModalOpen(false)} title="Zahlung buchen" size="sm"
                footer={<>
                    <button onClick={() => setPayModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-400 border border-slate-700 rounded-lg">Abbrechen</button>
                    <button onClick={handlePay} className="px-5 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">Zahlung buchen</button>
                </>}>
                <div className="space-y-4">
                    {payDocId && (() => {
                        const doc = store.invoices.find((d) => d.id === payDocId);
                        if (!doc) return null;
                        return (
                            <div className="glass rounded-xl p-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-400">Rechnung</span><span className="font-bold text-white">{doc.doc_number}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Gesamt</span><span className="text-white">{formatCurrency(doc.total_amount)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Bereits bezahlt</span><span className="text-white">{formatCurrency(doc.paid_amount)}</span></div>
                                <div className="flex justify-between border-t border-slate-700 pt-2"><span className="text-slate-400">Offen</span><span className="font-bold text-amber-400">{formatCurrency(doc.total_amount - doc.paid_amount)}</span></div>
                            </div>
                        );
                    })()}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Zahlungsbetrag (EUR)</label>
                        <input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} step="0.01" className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white" />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

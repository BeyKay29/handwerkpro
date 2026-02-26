"use client";

import { useStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import Modal from "@/components/ui/modal";
import { FileText, Printer, Download, Mail, X, Check } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import { Invoice } from "@/types";

interface DocumentPreviewProps {
    documentId: string | null;
    open: boolean;
    onClose: () => void;
}

export default function DocumentPreview({ documentId, open, onClose }: DocumentPreviewProps) {
    const store = useStore();
    const doc = store.invoices.find(i => i.id === documentId);

    if (!doc) return null;

    const customer = store.customers.find(c => c.id === doc.customer_id);
    const company = {
        name: "HandwerkPro Müller GmbH",
        address: "Handwerkerstr. 1, 69115 Heidelberg",
        email: "info@handwerkpro-mueller.de",
        phone: "06221 / 123 456",
        logo: "HP"
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`${doc.doc_type === 'angebot' ? 'Angebot' : 'Rechnung'} ${doc.doc_number}`}
            size="lg"
            footer={
                <div className="flex justify-between w-full">
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all">
                            <Printer className="w-3.5 h-3.5" /> Drucken
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all">
                            <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold">
                            Schließen
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20">
                            <Mail className="w-3.5 h-3.5" /> Versenden
                        </button>
                    </div>
                </div>
            }
        >
            <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-inner min-h-[600px] flex flex-col">
                {/* Letterhead */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg shadow-blue-500/30">
                            {company.logo}
                        </div>
                        <div className="text-xl font-black tracking-tight">{company.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{company.address}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black uppercase tracking-tighter text-slate-300">
                            {doc.doc_type === 'angebot' ? 'Angebot' : 'Rechnung'}
                        </div>
                        <div className="text-sm font-bold mt-2">{doc.doc_number}</div>
                        <div className="text-xs text-slate-500 mt-1">{formatDate(doc.date)}</div>
                    </div>
                </div>

                {/* Adressen */}
                <div className="grid grid-cols-2 gap-12 mb-16">
                    <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-1">Empfänger</div>
                        <div className="text-sm font-bold">{customer?.name}</div>
                        {customer?.contact_person && <div className="text-sm text-slate-600 mt-1">{customer.contact_person}</div>}
                        <div className="text-sm text-slate-600 mt-0.5 whitespace-pre-line">{customer?.address}</div>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-1">Absender</div>
                        <div className="text-sm font-bold">{company.name}</div>
                        <div className="text-xs text-slate-500 mt-2">{company.address}</div>
                        <div className="text-xs text-slate-500 mt-1">{company.email}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{company.phone}</div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="flex-1">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className="py-2 text-left font-black uppercase tracking-widest text-[10px]">Pos.</th>
                                <th className="py-2 text-left font-black uppercase tracking-widest text-[10px]">Beschreibung</th>
                                <th className="py-2 text-right font-black uppercase tracking-widest text-[10px]">Menge</th>
                                <th className="py-2 text-right font-black uppercase tracking-widest text-[10px]">E-Preis</th>
                                <th className="py-2 text-right font-black uppercase tracking-widest text-[10px]">G-Preis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {doc.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                                    <td className="py-4 font-bold">{item.description}</td>
                                    <td className="py-4 text-right text-slate-600">{item.quantity} {item.unit}</td>
                                    <td className="py-4 text-right text-slate-600">{formatCurrency(item.unit_price)}</td>
                                    <td className="py-4 text-right font-bold">{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-8 pt-4 border-t-2 border-slate-900 flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Netto-Zwischensumme:</span>
                            <span className="font-bold">{formatCurrency(doc.subtotal)}</span>
                        </div>
                        {doc.discount_rate > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span>Rabatt ({doc.discount_rate}%):</span>
                                <span className="font-bold">-{formatCurrency((doc.subtotal * doc.discount_rate) / 100)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Umsatzsteuer ({doc.tax_rate}%):</span>
                            <span className="font-bold">{formatCurrency(doc.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span className="font-black uppercase tracking-widest text-xs">Gesamtbetrag:</span>
                            <span className="text-xl font-black">{formatCurrency(doc.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-16 text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-8">
                    <div className="flex gap-12">
                        <div className="flex-1">
                            <div className="font-bold text-slate-600 uppercase mb-2">Zahlungshinweis</div>
                            <p>{doc.notes || "Zahlbar innerhalb von 14 Tagen ohne Abzug. Bitte geben Sie bei der Überweisung die Rechnungsnummer an."}</p>
                        </div>
                        <div className="w-48">
                            <div className="font-bold text-slate-600 uppercase mb-2">Bankverbindung</div>
                            <p>HandwerkPro Bank AG<br />IBAN: DE89 1234 5678 9012 3456 78<br />BIC: HPRODE66XXX</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

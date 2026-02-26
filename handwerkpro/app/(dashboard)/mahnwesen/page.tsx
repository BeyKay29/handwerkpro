"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate, daysDiff } from "@/lib/utils";
import StatCard from "@/components/ui/stat-card";
import { AlertTriangle, DollarSign, Mail } from "lucide-react";

export default function MahnwesenPage() {
    const store = useStore();
    const { toast } = useToast();
    const overdue = store.invoices.filter((d) => d.doc_type === "rechnung" && d.status !== "bezahlt" && d.status !== "entwurf" && d.due_date && daysDiff(d.due_date) > 0);
    const totalOverdue = overdue.reduce((s, d) => s + (d.total_amount - d.paid_amount), 0);
    const totalMahnungen = store.invoices.reduce((s, d) => s + d.dunning_level, 0);

    function mahnen(id: string) {
        const doc = store.invoices.find((d) => d.id === id);
        if (!doc) return;
        const newLevel = Math.min(doc.dunning_level + 1, 3);
        store.updateInvoice(id, { dunning_level: newLevel, status: "gemahnt" });
        toast(`Mahnung Stufe ${newLevel} versendet`, "warning", doc.doc_number);
    }

    function autoMahnen() {
        let count = 0;
        overdue.forEach((doc) => {
            if (doc.dunning_level < 3) {
                const newLevel = doc.dunning_level + 1;
                store.updateInvoice(doc.id, { dunning_level: newLevel, status: "gemahnt" });
                count++;
            }
        });
        toast(`${count} Mahnungen versendet`, count > 0 ? "warning" : "info");
    }

    const stufeLabel = (l: number) => (l === 0 ? "Keine" : `Stufe ${l}`);
    const stufeColor = (l: number) => (l === 0 ? "bg-slate-500/15 text-slate-400" : l === 1 ? "bg-amber-500/15 text-amber-400" : l === 2 ? "bg-red-500/15 text-red-400" : "bg-purple-500/15 text-purple-400");

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
            <header>
                <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Mahnwesen</h1>
                <p className="text-slate-400 text-sm mt-1">{overdue.length} ueberfaellige Forderungen</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatCard title="Ueberfaellige Forderungen" value={formatCurrency(totalOverdue)} subtitle={`${overdue.length} Rechnungen`} icon={AlertTriangle} color="red" />
                <StatCard title="Gesendete Mahnungen" value={String(totalMahnungen)} subtitle="Alle Stufen" icon={Mail} color="amber" />
                <StatCard title="Hoechste Mahnstufe" value={overdue.length > 0 ? `Stufe ${Math.max(...overdue.map((d) => d.dunning_level))}` : "Keine"} subtitle={`${overdue.filter((d) => d.dunning_level >= 2).length} kritisch`} icon={DollarSign} color="emerald" />
            </div>

            <div className="flex gap-3">
                <button onClick={autoMahnen} className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/15 hover:bg-amber-600/25 text-amber-400 text-sm font-semibold rounded-lg transition-colors border border-amber-500/20">
                    <Mail className="w-4 h-4" /> Automatisch mahnen
                </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800/60">
                            {["Rechnung", "Kunde", "Offen", "Ueberfaellig", "Mahnstufe", "Aktion"].map((h) => (
                                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                        {overdue.map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-5 py-4 text-sm font-bold text-white">{doc.doc_number}</td>
                                <td className="px-5 py-4 text-sm text-slate-300">{store.getCustomerName(doc.customer_id)}</td>
                                <td className="px-5 py-4 text-sm font-bold text-red-400">{formatCurrency(doc.total_amount - doc.paid_amount)}</td>
                                <td className="px-5 py-4 text-sm text-red-400">{daysDiff(doc.due_date!)} Tage</td>
                                <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${stufeColor(doc.dunning_level)}`}>{stufeLabel(doc.dunning_level)}</span></td>
                                <td className="px-5 py-4">
                                    <button onClick={() => mahnen(doc.id)} disabled={doc.dunning_level >= 3}
                                        className="px-3 py-1.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                        {doc.dunning_level >= 3 ? "Max. erreicht" : "Mahnen"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {overdue.length === 0 && <div className="px-6 py-8 text-center text-sm text-slate-500">Keine ueberfaelligen Forderungen.</div>}
            </div>
        </div>
    );
}

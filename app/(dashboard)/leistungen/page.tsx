"use client";
import { formatCurrency } from "@/lib/utils";
import { mockCatalog } from "@/lib/mock-data";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

export default function LeistungenPage() {
    const [search, setSearch] = useState("");
    const items = mockCatalog.filter(l => !search || (l.name + l.category).toLowerCase().includes(search.toLowerCase()));
    const categories = [...new Set(mockCatalog.map(l => l.category))];

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-6">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Leistungskatalog</h1>
                    <p className="text-slate-400 text-sm mt-1">{items.length} Leistungen</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4" /> Neue Leistung
                </button>
            </header>
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Leistung suchen..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {items.map(l => (
                    <div key={l.id} className="glass rounded-2xl p-6 hover:border-slate-700/60 transition-all duration-300 cursor-pointer group space-y-3">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{l.category}</span>
                        <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{l.name}</div>
                        <p className="text-xs text-slate-500 leading-relaxed">{l.description}</p>
                        <div className="flex items-baseline gap-1 pt-2 border-t border-slate-800/60">
                            <span className="font-display text-lg font-extrabold text-white">{formatCurrency(l.price)}</span>
                            <span className="text-xs text-slate-500">/ {l.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

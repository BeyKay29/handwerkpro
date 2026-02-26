"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const pageNames: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/angebote": "Dokumente",
    "/mahnwesen": "Mahnwesen",
    "/projekte": "Projekte",
    "/plantafel": "Plantafel",
    "/zeiten": "Zeiterfassung",
    "/kunden": "Kunden",
    "/mitarbeiter": "Mitarbeiter",
    "/leistungen": "Leistungskatalog",
    "/settings": "Einstellungen",
};

export default function TopBar() {
    const pathname = usePathname();
    const pageName = pageNames[pathname || ""] || "HandwerkPro";

    return (
        <header className="sticky top-0 z-20 h-16 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-3 pl-12 lg:pl-0">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">HandwerkPro</span>
                <span className="text-slate-700 hidden sm:inline">/</span>
                <span className="text-sm font-bold text-white">{pageName}</span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button className="w-9 h-9 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
                    <Search className="w-4 h-4" />
                </button>
                <button className="relative w-9 h-9 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
                    <Bell className="w-4 h-4" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                        2
                    </div>
                </button>
                <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block" />
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
                        BK
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-xs font-bold text-white leading-none">Demo Betrieb</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Professional Plan</div>
                    </div>
                </div>
            </div>
        </header>
    );
}

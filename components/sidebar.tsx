"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    AlertTriangle,
    Briefcase,
    CalendarRange,
    Clock,
    Users,
    UsersRound,
    Wrench,
    Settings,
    LogOut,
    ChevronLeft,
} from "lucide-react";
import { useState } from "react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Dokumente", href: "/angebote", icon: FileText },
    { name: "Mahnwesen", href: "/mahnwesen", icon: AlertTriangle },
    { name: "Projekte", href: "/projekte", icon: Briefcase },
    { name: "Plantafel", href: "/plantafel", icon: CalendarRange },
    { name: "Zeiterfassung", href: "/zeiten", icon: Clock },
    { name: "Kunden", href: "/kunden", icon: Users },
    { name: "Mitarbeiter", href: "/mitarbeiter", icon: UsersRound },
    { name: "Leistungskatalog", href: "/leistungen", icon: Wrench },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800/80 flex flex-col z-50 transition-all duration-300",
                collapsed ? "w-[72px]" : "w-[260px]"
            )}
        >
            {/* Logo */}
            <div className={cn("flex items-center gap-3 border-b border-slate-800/80", collapsed ? "px-4 py-5 justify-center" : "px-6 py-5")}>
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center font-display font-extrabold text-white text-sm shadow-lg shadow-blue-500/20 flex-shrink-0">
                    HP
                </div>
                {!collapsed && (
                    <span className="font-display text-lg font-extrabold text-white tracking-tight">
                        Handwerk<span className="text-blue-500">Pro</span>
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={collapsed ? item.name : undefined}
                            className={cn(
                                "flex items-center gap-3 rounded-lg transition-all duration-200 group relative",
                                collapsed ? "px-3 py-3 justify-center" : "px-3.5 py-2.5",
                                isActive
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full" />
                            )}
                            <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                            {!collapsed && (
                                <span className={cn("text-[13px] font-semibold", isActive ? "text-blue-400" : "")}>{item.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className={cn("border-t border-slate-800/80 p-3 space-y-0.5")}>
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors"
                >
                    <Settings className="w-[18px] h-[18px]" />
                    {!collapsed && <span className="text-[13px] font-semibold">Einstellungen</span>}
                </Link>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors"
                >
                    <ChevronLeft className={cn("w-[18px] h-[18px] transition-transform duration-300", collapsed && "rotate-180")} />
                    {!collapsed && <span className="text-[13px] font-semibold">Einklappen</span>}
                </button>
            </div>
        </aside>
    );
}

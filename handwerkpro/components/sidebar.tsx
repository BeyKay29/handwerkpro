"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
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
    Menu,
    X,
    Bell,
} from "lucide-react";
import { useState, createContext, useContext } from "react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Dokumente", href: "/angebote", icon: FileText },
    { name: "Mahnwesen", href: "/mahnwesen", icon: AlertTriangle },
    { name: "Projekte", href: "/projekte", icon: Briefcase },
    { name: "Plantafel", href: "/plantafel", icon: CalendarRange },
    { name: "Zeiterfassung", href: "/zeiten", icon: Clock },
    { name: "Benachrichtigungen", href: "/notifications", icon: Bell },
    { name: "Kunden", href: "/kunden", icon: Users },
    { name: "Mitarbeiter", href: "/mitarbeiter", icon: UsersRound },
    { name: "Leistungskatalog", href: "/leistungen", icon: Wrench },
    { name: "Vorlagen", href: "/vorlagen", icon: FileText },
];

// Sidebar context so layout can read collapsed state
export const SidebarContext = createContext({ collapsed: false, mobileOpen: false, setMobileOpen: (v: boolean) => { } });

export function useSidebar() {
    return useContext(SidebarContext);
}

export default function Sidebar() {
    const pathname = usePathname();
    const store = useStore();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const currentPage = navigation.find(
        (n) => pathname === n.href || pathname?.startsWith(n.href + "/")
    );

    return (
        <SidebarContext.Provider value={{ collapsed, mobileOpen, setMobileOpen }}>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile trigger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-30 lg:hidden w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
                <Menu className="w-5 h-5" />
            </button>

            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800/80 flex flex-col z-50 transition-all duration-300",
                    // Desktop
                    "hidden lg:flex",
                    collapsed ? "w-[72px]" : "w-[248px]",
                    // Mobile
                    mobileOpen && "!flex w-[280px]"
                )}
            >
                {/* Logo */}
                <div
                    className={cn(
                        "flex items-center border-b border-slate-800/80 h-16 flex-shrink-0",
                        collapsed ? "px-4 justify-center" : "px-5 gap-3"
                    )}
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center font-display font-extrabold text-white text-xs shadow-lg shadow-blue-500/20 flex-shrink-0">
                        HP
                    </div>
                    {!collapsed && (
                        <span className="font-display text-base font-extrabold text-white tracking-tight">
                            Handwerk<span className="text-blue-500">Pro</span>
                        </span>
                    )}
                    {/* Mobile close */}
                    {mobileOpen && (
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="ml-auto lg:hidden text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Nav Label */}
                {!collapsed && (
                    <div className="px-5 pt-5 pb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            Navigation
                        </span>
                        <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-colors border",
                            store.isSupabaseConnected
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", store.isSupabaseConnected ? "bg-emerald-500" : "bg-amber-500")} />
                            {store.isSupabaseConnected ? "Live" : "Demo"}
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className="flex justify-center pt-4 pb-2">
                        <div className={cn("w-2 h-2 rounded-full", store.isSupabaseConnected ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-amber-500 shadow-sm shadow-amber-500/50")} />
                    </div>
                )}

                {/* Navigation */}
                <nav
                    className={cn(
                        "flex-1 overflow-y-auto space-y-0.5",
                        collapsed ? "px-2 pt-4" : "px-3"
                    )}
                >
                    {navigation.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            pathname?.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                title={collapsed ? item.name : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg transition-all duration-150 group relative",
                                    collapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2.5",
                                    isActive
                                        ? "bg-blue-500/10 text-blue-400"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-500 rounded-r-full" />
                                )}
                                <item.icon
                                    className={cn(
                                        "w-[18px] h-[18px] flex-shrink-0",
                                        isActive
                                            ? "text-blue-400"
                                            : "text-slate-500 group-hover:text-slate-300"
                                    )}
                                />
                                {!collapsed && (
                                    <span
                                        className={cn(
                                            "text-[13px] font-semibold truncate",
                                            isActive ? "text-blue-400" : ""
                                        )}
                                    >
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className={cn("border-t border-slate-800/80 p-3 space-y-0.5 flex-shrink-0")}>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors"
                    >
                        <ChevronLeft
                            className={cn(
                                "w-[18px] h-[18px] transition-transform duration-300",
                                collapsed && "rotate-180"
                            )}
                        />
                        {!collapsed && (
                            <span className="text-[13px] font-semibold">Einklappen</span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Spacer div to push content. This is read by the layout. */}
            <div
                className={cn(
                    "hidden lg:block flex-shrink-0 transition-all duration-300",
                    collapsed ? "w-[72px]" : "w-[248px]"
                )}
            />
        </SidebarContext.Provider>
    );
}

"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, ExternalLink, X, Check, LogOut, LogIn, ChevronDown, User, RefreshCw } from "lucide-react";
import { useStore } from "@/lib/store";
import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    "/vorlagen": "Vorlagen",
    "/settings": "Einstellungen",
};

export default function TopBar() {
    const pathname = usePathname();
    const router = useRouter();
    const store = useStore();
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const pageName = pageNames[pathname || ""] || "HandwerkPro";
    const unreadCount = store.notifications.filter(n => !n.is_read).length;

    // PROTECTION: If no user is logged in, redirect to login page
    // excluding public landing page or login page itself to avoid loops
    useEffect(() => {
        if (!store.currentUser && pathname !== "/" && pathname !== "/login") {
            router.push("/login");
        }
    }, [store.currentUser, pathname, router]);

    return (
        <header className="sticky top-0 z-20 h-16 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-3 pl-12 lg:pl-0 min-w-0">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline flex-shrink-0">HandwerkPro</span>
                <span className="text-slate-700 hidden sm:inline flex-shrink-0">/</span>
                <span className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-none">{pageName}</span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all active:scale-95 shadow-lg shadow-black/10">
                    <Search className="w-5 h-5" />
                </button>

                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`relative w-10 h-10 rounded-xl border transition-all active:scale-95 shadow-lg shadow-black/10 flex items-center justify-center ${notifOpen ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-500 hover:text-slate-300'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <div className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-600 rounded-full flex items-center justify-center text-[8px] font-black text-white ring-2 ring-slate-950 animate-pulse">
                                {unreadCount}
                            </div>
                        )}
                    </button>

                    {notifOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                            <div className="absolute right-0 mt-3 w-80 sm:w-96 glass rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-white/5">
                                    <h3 className="font-bold text-white text-sm">Benachrichtigungen</h3>
                                    <div className="flex gap-3">
                                        {store.notifications.length > 0 && (
                                            <button
                                                onClick={() => store.clearNotifications()}
                                                className="text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                                            >
                                                Löschen
                                            </button>
                                        )}
                                        <button onClick={() => setNotifOpen(false)} className="text-slate-500 hover:text-white">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {store.notifications.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500">
                                            <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                            <p className="text-xs italic">Keine Benachrichtigungen vorhanden.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-slate-800/60">
                                                {store.notifications.slice(0, 5).map((n) => (
                                                    <div
                                                        key={n.id}
                                                        className={`p-4 transition-colors relative group ${!n.is_read ? 'bg-blue-500/5' : 'hover:bg-white/5'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1" >
                                                            <h4 className={`text-sm font-bold ${!n.is_read ? 'text-blue-400' : 'text-white'}`}>{n.title}</h4>
                                                            <span className="text-[10px] text-slate-500">
                                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: de })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 leading-relaxed mb-3">{n.message}</p>

                                                        <div className="flex items-center gap-4">
                                                            {n.link && (
                                                                <Link
                                                                    href={n.link}
                                                                    onClick={() => { store.markAsRead(n.id); setNotifOpen(false); }}
                                                                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 uppercase tracking-wider transition-colors"
                                                                >
                                                                    Ansehen <ExternalLink className="w-3 h-3" />
                                                                </Link>
                                                            )}
                                                            {!n.is_read && (
                                                                <button
                                                                    onClick={() => store.markAsRead(n.id)}
                                                                    className="text-[10px] font-bold text-slate-500 hover:text-emerald-400 flex items-center gap-1 uppercase tracking-wider transition-colors"
                                                                >
                                                                    Gelesen <Check className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <Link
                                                href="/notifications"
                                                onClick={() => setNotifOpen(false)}
                                                className="block p-4 text-center text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-[0.2em] border-t border-slate-800 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                                            >
                                                Alle Benachrichtigungen anzeigen
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block" />

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/5 transition-all outline-none"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white uppercase shadow-lg">
                            {store.currentUser ? `${store.currentUser.first_name[0]}${store.currentUser.last_name[0]}` : "HP"}
                        </div>
                        <div className="hidden sm:block text-left">
                            <div className="text-xs font-bold text-white leading-none">
                                {store.currentUser ? `${store.currentUser.first_name} ${store.currentUser.last_name}` : "Anmeldung"}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">
                                {store.currentUser ? store.currentUser.role : "Benutzer"}
                            </div>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                            <div className="absolute right-0 mt-3 w-56 glass rounded-2xl shadow-3xl border border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right">
                                <div className="p-2 space-y-1">
                                    {store.currentUser ? (
                                        <button
                                            onClick={() => { store.logout(); setUserMenuOpen(false); router.push("/login"); }}
                                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-xs font-bold"
                                        >
                                            <LogOut className="w-4 h-4" /> Abmelden
                                        </button>
                                    ) : (
                                        <Link
                                            href="/login"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-400 hover:bg-blue-400/10 transition-colors text-xs font-bold"
                                        >
                                            <LogIn className="w-4 h-4" /> Anmelden
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

        </header>
    );
}

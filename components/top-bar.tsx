"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, ExternalLink, X, Check, LogOut, LogIn, ChevronDown, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

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
    const store = useStore();
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    // Login form state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPass, setLoginPass] = useState("");

    const pageName = pageNames[pathname || ""] || "HandwerkPro";
    const unreadCount = store.notifications.filter(n => !n.is_read).length;

    const handleLogin = () => {
        if (store.login(loginEmail, loginPass)) {
            setLoginModalOpen(false);
            setLoginEmail("");
            setLoginPass("");
        } else {
            alert("Ungültige Anmeldedaten");
        }
    };

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

                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`relative w-9 h-9 rounded-lg border transition-all ${notifOpen ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'border-slate-800 hover:border-slate-700 text-slate-500 hover:text-slate-300'}`}
                    >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-slate-950">
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
                                {store.currentUser ? `${store.currentUser.first_name} ${store.currentUser.last_name}` : "Admin Login"}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">
                                {store.currentUser ? store.currentUser.role : "System"}
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
                                        <>
                                            <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1 flex items-center gap-2">
                                                <User className="w-3 h-3" /> Sitzung
                                            </div>
                                            <button
                                                onClick={() => { store.logout(); setUserMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-xs font-bold"
                                            >
                                                <LogOut className="w-4 h-4" /> Abmelden
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => { setLoginModalOpen(true); setUserMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-400 hover:bg-blue-400/10 transition-colors text-xs font-bold"
                                        >
                                            <LogIn className="w-4 h-4" /> Als Mitarbeiter einloggen
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Simulated Login Modal */}
            {loginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm glass rounded-3xl border border-white/10 shadow-3xl overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-8 space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-lg mx-auto mb-4 shadow-xl shadow-blue-500/30">HP</div>
                                <h3 className="text-xl font-bold text-white">Mitarbeiter Login</h3>
                                <p className="text-xs text-slate-500">Geben Sie Ihre Zugangsdaten ein, um Ihre Zeiten zu erfassen.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">E-Mail Adresse</label>
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="name@firma.de"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Passwort</label>
                                    <input
                                        type="password"
                                        value={loginPass}
                                        onChange={(e) => setLoginPass(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-3">
                                <button
                                    onClick={handleLogin}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                                >
                                    Anmelden
                                </button>
                                <button
                                    onClick={() => setLoginModalOpen(false)}
                                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors"
                                >
                                    Abbrechen
                                </button>
                            </div>

                            <div className="p-3 bg-white/5 rounded-xl text-[10px] text-slate-500 italic text-center">
                                Tipp: In der Demo können Sie z.B. <code className="text-blue-400 font-bold not-italic">m.schulz@firma.de</code> nutzen.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

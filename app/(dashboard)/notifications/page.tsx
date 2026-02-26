"use client";

import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Bell, CheckCircle2, AlertTriangle, Info, Trash2, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
    const store = useStore();
    const { notifications, markAsRead, clearNotifications } = store;

    const unread = notifications.filter(n => !n.is_read);
    const read = notifications.filter(n => n.is_read);

    const IconMap = {
        success: <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>,
        warning: <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><AlertTriangle className="w-5 h-5" /></div>,
        error: <div className="p-2 bg-red-500/10 text-red-500 rounded-xl"><AlertTriangle className="w-5 h-5" /></div>,
        info: <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><Info className="w-5 h-5" /></div>,
    };

    return (
        <div className="p-5 lg:p-8 max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-4xl font-extrabold text-white tracking-tight">Benachrichtigungen</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Sie haben {unread.length} ungelesene {unread.length === 1 ? 'Nachricht' : 'Nachrichten'}.
                    </p>
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={() => clearNotifications()}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                    >
                        <Trash2 className="w-4 h-4" /> Alle löschen
                    </button>
                )}
            </header>

            <div className="space-y-6">
                {notifications.length === 0 ? (
                    <div className="glass rounded-[2rem] p-16 text-center border-slate-800/40">
                        <Bell className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <h2 className="text-xl font-bold text-white mb-2">Alles erledigt!</h2>
                        <p className="text-slate-500 max-w-sm mx-auto">Momentan gibt es keine neuen Benachrichtigungen für Sie.</p>
                    </div>
                ) : (
                    <>
                        {unread.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] pl-2">Neu</h2>
                                <div className="space-y-3">
                                    {unread.map(n => (
                                        <div key={n.id} className="glass group rounded-[1.5rem] p-5 border-blue-500/30 bg-blue-500/[0.02] flex gap-5 items-start hover:border-blue-500/50 transition-all">
                                            {IconMap[n.type]}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-base font-bold text-white pr-4">{n.title}</h3>
                                                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: de })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed mb-4">{n.message}</p>
                                                <div className="flex items-center gap-6">
                                                    {n.link && (
                                                        <Link
                                                            href={n.link}
                                                            onClick={() => markAsRead(n.id)}
                                                            className="text-xs font-black text-blue-400 hover:text-blue-300 flex items-center gap-1.5 uppercase tracking-widest transition-colors"
                                                        >
                                                            Ansehen <ArrowRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className="text-xs font-black text-slate-500 hover:text-emerald-400 flex items-center gap-1.5 uppercase tracking-widest transition-colors"
                                                    >
                                                        Als gelesen markieren <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {read.length > 0 && (
                            <section className="space-y-4 pt-4">
                                <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-2">Gelesen</h2>
                                <div className="space-y-2">
                                    {read.map(n => (
                                        <div key={n.id} className="glass rounded-[1.2rem] p-4 border-slate-800/40 bg-slate-900/20 flex gap-4 items-center opacity-60 hover:opacity-100 transition-opacity">
                                            <div className="opacity-50">{IconMap[n.type]}</div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-slate-300">{n.title}</h3>
                                                <p className="text-xs text-slate-500 truncate">{n.message}</p>
                                            </div>
                                            <div className="text-[10px] text-slate-600 font-medium">
                                                {formatDate(n.created_at)}
                                            </div>
                                            {n.link && (
                                                <Link href={n.link} className="p-2 text-slate-600 hover:text-white transition-colors">
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

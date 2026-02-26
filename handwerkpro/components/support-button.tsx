"use client";

import { useState } from "react";
import { Headphones, Phone, Mail, X, MessageCircle } from "lucide-react";

export default function SupportButton() {
    const [open, setOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-[90]">
            {open && (
                <div className="mb-3 w-72 glass rounded-2xl overflow-hidden shadow-2xl shadow-black/30 animate-in slide-in-from-bottom">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-blue-500/5">
                        <div className="flex items-center gap-3">
                            <Headphones className="w-5 h-5 text-blue-500" />
                            <div>
                                <div className="text-sm font-bold text-white">Support</div>
                                <div className="text-[11px] text-slate-400">Mo-Fr, 8:00 - 18:00 Uhr</div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        <a href="tel:+4962211234567" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-800/60 transition-colors group">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <Phone className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Anrufen</div>
                                <div className="text-[11px] text-slate-500">+49 6221 123 4567</div>
                            </div>
                        </a>
                        <a href="mailto:support@handwerkpro.de" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-800/60 transition-colors group">
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">E-Mail</div>
                                <div className="text-[11px] text-slate-500">support@handwerkpro.de</div>
                            </div>
                        </a>
                    </div>
                    <div className="px-4 pb-4">
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Durchschnittliche Antwortzeit: unter 2 Stunden
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen(!open)}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            >
                {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
            </button>
        </div>
    );
}

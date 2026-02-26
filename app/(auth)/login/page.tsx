"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Supabase auth integration
        // For now, redirect to dashboard
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 800);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: Branding */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-950 via-blue-950/40 to-slate-950 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(37,99,235,0.15),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.08),transparent_60%)]" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center font-display font-extrabold text-white shadow-lg shadow-blue-500/25">
                            HP
                        </div>
                        <span className="font-display text-xl font-extrabold text-white tracking-tight">
                            Handwerk<span className="text-blue-500">Pro</span>
                        </span>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    <h2 className="font-display text-4xl font-extrabold text-white leading-tight tracking-tight">
                        Ihr Betrieb.<br />
                        <span className="text-blue-400">Digital organisiert.</span>
                    </h2>
                    <p className="text-slate-400 text-base leading-relaxed max-w-md">
                        Angebote, Rechnungen, Projekte und Zeiterfassung in einer Anwendung.
                        Professionell. Effizient. Gemacht fur Handwerker.
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-4 max-w-sm">
                        {[
                            { val: "500+", lbl: "Betriebe" },
                            { val: "12k+", lbl: "Rechnungen/Monat" },
                            { val: "99.9%", lbl: "Verfugbarkeit" },
                        ].map((s) => (
                            <div key={s.lbl}>
                                <div className="font-display text-xl font-extrabold text-white">{s.val}</div>
                                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{s.lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-xs text-slate-600">
                    &copy; {new Date().getFullYear()} HandwerkPro GmbH. Alle Rechte vorbehalten.
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
                <div className="w-full max-w-[380px] mx-auto">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center font-display font-extrabold text-white shadow-lg shadow-blue-500/25">
                            HP
                        </div>
                        <span className="font-display text-xl font-extrabold text-white tracking-tight">
                            Handwerk<span className="text-blue-500">Pro</span>
                        </span>
                    </div>

                    <div className="mb-8">
                        <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
                            Willkommen zuruck
                        </h1>
                        <p className="text-sm text-slate-400 mt-2">
                            Melden Sie sich in Ihrem Konto an, um fortzufahren.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                E-Mail-Adresse
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all"
                                placeholder="name@firma.de"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Passwort
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 pr-12 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all"
                                    placeholder="Passwort eingeben"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500/40 w-3.5 h-3.5" />
                                <span className="text-xs text-slate-400 font-medium">Angemeldet bleiben</span>
                            </label>
                            <a href="#" className="text-xs text-blue-500 hover:text-blue-400 font-semibold transition-colors">
                                Passwort vergessen?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Anmelden
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            Noch kein Konto?{" "}
                            <Link href="/register" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
                                Jetzt registrieren
                            </Link>
                        </p>
                    </div>

                    <div className="mt-10 flex items-center gap-2 justify-center text-[11px] text-slate-600">
                        <Lock className="w-3 h-3" />
                        <span>Verschlusselte Ubertragung | DSGVO-konform</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

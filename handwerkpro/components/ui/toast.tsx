"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

interface Toast {
    id: string;
    message: string;
    detail?: string;
    type: "success" | "error" | "warning" | "info";
}

interface ToastCtx {
    toast: (message: string, type?: Toast["type"], detail?: string) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: "border-emerald-500/30 bg-emerald-500/5",
    error: "border-red-500/30 bg-red-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
};

const iconColors = {
    success: "text-emerald-500",
    error: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: Toast["type"] = "success", detail?: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, detail, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const remove = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => {
                    const Icon = icons[t.type];
                    return (
                        <div
                            key={t.id}
                            className={cn(
                                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/30 min-w-[280px] max-w-[420px] animate-in slide-in-from-right",
                                colors[t.type]
                            )}
                        >
                            <Icon className={cn("w-5 h-5 flex-shrink-0", iconColors[t.type])} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white">{t.message}</div>
                                {t.detail && <div className="text-xs text-slate-400 mt-0.5">{t.detail}</div>}
                            </div>
                            <button onClick={() => remove(t.id)} className="text-slate-500 hover:text-white transition-colors flex-shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

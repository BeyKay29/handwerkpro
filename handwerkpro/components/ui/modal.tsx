"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    footer?: ReactNode;
}

const sizeMap = {
    sm: "sm:max-w-md",
    md: "sm:max-w-xl",
    lg: "sm:max-w-3xl",
    xl: "sm:max-w-5xl",
};

export default function Modal({ open, onClose, title, children, size = "md", footer }: ModalProps) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className={cn(
                    "relative w-full bg-slate-900 border-t sm:border border-slate-800 sm:rounded-2xl shadow-2xl shadow-black/40 flex flex-col",
                    "max-h-[92vh] sm:max-h-[85vh]",
                    "rounded-t-2xl sm:rounded-2xl",
                    sizeMap[size]
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag handle on mobile */}
                <div className="sm:hidden flex justify-center pt-2 pb-1">
                    <div className="w-10 h-1 bg-slate-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-4 border-b border-slate-800/60 flex-shrink-0">
                    <h2 className="font-display text-base sm:text-lg font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg border border-slate-700 hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 overscroll-contain">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-3 sm:py-4 border-t border-slate-800/60 flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

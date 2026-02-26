"use client";

import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; classes: string }> = {
    entwurf: { label: "Entwurf", classes: "bg-slate-500/15 text-slate-400" },
    offen: { label: "Offen", classes: "bg-blue-500/15 text-blue-400" },
    angenommen: { label: "Angenommen", classes: "bg-emerald-500/15 text-emerald-400" },
    abgelehnt: { label: "Abgelehnt", classes: "bg-red-500/15 text-red-400" },
    ueberfaellig: { label: "Uberfaellig", classes: "bg-red-500/15 text-red-400" },
    bezahlt: { label: "Bezahlt", classes: "bg-emerald-500/15 text-emerald-400" },
    gemahnt: { label: "Gemahnt", classes: "bg-amber-500/15 text-amber-400" },
    planung: { label: "Planung", classes: "bg-amber-500/15 text-amber-400" },
    aktiv: { label: "Aktiv", classes: "bg-blue-500/15 text-blue-400" },
    abgeschlossen: { label: "Abgeschlossen", classes: "bg-emerald-500/15 text-emerald-400" },
    storniert: { label: "Storniert", classes: "bg-red-500/15 text-red-400" },
};

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || { label: status, classes: "bg-slate-500/15 text-slate-400" };
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
            config.classes,
            className,
        )}>
            {config.label}
        </span>
    );
}

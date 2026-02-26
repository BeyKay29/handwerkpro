"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    color?: "blue" | "emerald" | "amber" | "red" | "indigo" | "slate";
}

const colorMap = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: "text-blue-500" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: "text-emerald-500" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: "text-amber-500" },
    red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: "text-red-500" },
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20", icon: "text-indigo-500" },
    slate: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20", icon: "text-slate-500" },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = "blue" }: StatCardProps) {
    const c = colorMap[color];
    return (
        <div className={cn(
            "glass rounded-2xl p-6 hover:border-slate-700/60 transition-all duration-300 group cursor-default",
        )}>
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", c.bg)}>
                    <Icon className={cn("w-5 h-5", c.icon)} />
                </div>
            </div>
            <div className="font-display text-2xl font-extrabold text-white tracking-tight mb-1">
                {value}
            </div>
            <div className="text-sm text-slate-400 font-medium">{title}</div>
            {subtitle && (
                <div className={cn("text-xs mt-2 font-semibold", c.text)}>{subtitle}</div>
            )}
        </div>
    );
}

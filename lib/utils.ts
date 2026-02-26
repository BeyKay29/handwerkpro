/** Format number as Euro currency */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
    }).format(value);
}

/** Format ISO date string to German locale */
export function formatDate(dateStr?: string | null): string {
    if (!dateStr) return "\u2014";
    return new Date(dateStr + "T12:00:00").toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

/** Get today as ISO string */
export function today(): string {
    return new Date().toISOString().split("T")[0];
}

/** Calculate days between a date and today */
export function daysDiff(dateStr?: string | null): number {
    if (!dateStr) return 0;
    const d = new Date(dateStr + "T12:00:00");
    const n = new Date();
    n.setHours(12, 0, 0, 0);
    return Math.round((n.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

/** Generate a short random ID */
export function uid(): string {
    return Math.random().toString(36).slice(2, 10);
}

/** Combine class names, filtering falsy values */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

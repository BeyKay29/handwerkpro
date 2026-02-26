"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import Modal from "@/components/ui/modal";
import { formatCurrency, formatDate, today } from "@/lib/utils";
import {
    ArrowLeft, Mail, Phone, Calendar, Briefcase, Clock, Shield, Award,
    Settings, ChevronRight, TrendingUp, History, UserCheck, UserX,
    CheckCircle2, AlertCircle, Key, Download, FileText, Lock, Unlock,
    Eye, EyeOff, Edit3, MessageSquare, Plus, XCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CorrectionRequest } from "@/types";

const CONTRACT_LABELS: Record<string, string> = { vollzeit: "Vollzeit", teilzeit: "Teilzeit", minijob: "Minijob", freelancer: "Freelancer" };
const CORR_STATUS_COLOR: Record<string, string> = { offen: "bg-amber-500/10 text-amber-400 border-amber-500/20", genehmigt: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", abgelehnt: "bg-red-500/10 text-red-400 border-red-500/20" };
const CORR_STATUS_LABEL: Record<string, string> = { offen: "Offen", genehmigt: "Genehmigt", abgelehnt: "Abgelehnt" };

function generateContractPDF(emp: { first_name: string; last_name: string; role?: string; contract_type?: string; hourly_rate: number; monthly_salary?: number; created_at: string }) {
    // Generate a realistic HTML-based "contract" and trigger print/download
    const html = `
<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Arbeitsvertrag</title>
<style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#111;line-height:1.6}
h1{border-bottom:2px solid #333;padding-bottom:8px}h2{color:#333;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:24px}
.field{display:grid;grid-template-columns:180px 1fr;gap:4px;padding:6px 0;border-bottom:1px solid #eee}
.label{font-weight:bold;color:#666}.val{color:#111}
p{text-align:justify}footer{margin-top:40px;border-top:1px solid #ccc;padding-top:16px;font-size:12px;color:#666}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}
.sign-box{border-top:1px solid #333;padding-top:8px;font-size:11px}
</style></head><body>
<h1>Arbeitsvertrag</h1>
<p>Zwischen der <strong>HandwerkPro GmbH</strong> (nachfolgend „Arbeitgeber") und</p>
<h2>Arbeitnehmer</h2>
<div class="field"><span class="label">Name</span><span class="val">${emp.first_name} ${emp.last_name}</span></div>
<div class="field"><span class="label">Position</span><span class="val">${emp.role || "Mitarbeiter"}</span></div>
<div class="field"><span class="label">Vertragsart</span><span class="val">${CONTRACT_LABELS[emp.contract_type || "vollzeit"] || emp.contract_type}</span></div>
<div class="field"><span class="label">Stundensatz</span><span class="val">${emp.hourly_rate.toFixed(2)} EUR/Std.</span></div>
${emp.monthly_salary ? `<div class="field"><span class="label">Monatsgehalt</span><span class="val">${emp.monthly_salary.toFixed(2)} EUR brutto</span></div>` : ""}
<div class="field"><span class="label">Vertragsstart</span><span class="val">${new Date(emp.created_at).toLocaleDateString("de")}</span></div>
<h2>§ 1 – Beginn und Dauer des Arbeitsverhältnisses</h2>
<p>Das Arbeitsverhältnis beginnt am ${new Date(emp.created_at).toLocaleDateString("de")} und wird auf unbestimmte Zeit geschlossen. Die Probezeit beträgt 6 Monate.</p>
<h2>§ 2 – Tätigkeit und Arbeitsort</h2>
<p>Der Arbeitnehmer wird als ${emp.role || "Mitarbeiter"} eingestellt. Der Einsatzort richtet sich nach den betrieblichen Erfordernissen.</p>
<h2>§ 3 – Arbeitszeit</h2>
<p>Die regelmäßige wöchentliche Arbeitszeit beträgt ${emp.contract_type === "teilzeit" ? "20" : emp.contract_type === "minijob" ? "10" : "40"} Stunden. Überstunden werden nach Absprache vergütet.</p>
<h2>§ 4 – Vergütung</h2>
<p>Das monatliche Bruttogehalt beträgt ${emp.monthly_salary ? emp.monthly_salary.toFixed(2) + " EUR" : `${emp.hourly_rate.toFixed(2)} EUR/Std.`}. Die Vergütung wird am letzten Werktag des Monats ausgezahlt.</p>
<h2>§ 5 – Urlaub</h2>
<p>Der Arbeitnehmer hat Anspruch auf 30 Arbeitstage Erholungsurlaub pro Kalenderjahr.</p>
<h2>§ 6 – Kündigung</h2>
<p>Während der Probezeit beträgt die Kündigungsfrist 2 Wochen, danach gelten die gesetzlichen Regelungen gemäß § 622 BGB.</p>
<div class="sign">
<div class="sign-box">Ort, Datum, Arbeitgeber<br><br><br>___________________________<br>HandwerkPro GmbH</div>
<div class="sign-box">Ort, Datum, Arbeitnehmer<br><br><br>___________________________<br>${emp.first_name} ${emp.last_name}</div>
</div>
<footer>Dieses Dokument wurde automatisch generiert von HandwerkPro — vertraulich</footer>
</body></html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Arbeitsvertrag_${emp.first_name}_${emp.last_name}.html`;
    a.click();
}

export default function EmployeeDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const store = useStore();
    const { toast } = useToast();
    const isAdmin = store.currentUser?.role === "Admin";

    const employee = store.employees.find(e => e.id === id);
    if (!employee) return <div className="p-8 text-white">Mitarbeiter nicht gefunden.</div>;

    const timeEntries = store.timeEntries.filter(t => t.employee_id === employee.id);
    const projects = store.projects.filter(p => p.team?.includes(employee.id));
    const corrReqs = store.correctionRequests.filter(r => r.employee_id === employee.id).sort((a, b) => b.created_at.localeCompare(a.created_at));

    const totalHours = timeEntries.reduce((s, t) => s + t.duration, 0);
    const thisMonthHours = timeEntries.filter(t => {
        const d = new Date(t.date + "T12:00:00"); const n = new Date();
        return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).reduce((s, t) => s + t.duration, 0);

    // ── Login modal ────────────────────────────────────────────────────
    const [loginOpen, setLoginOpen] = useState(false);
    const [newEmail, setNewEmail] = useState(employee.email || "");
    const [newPw, setNewPw] = useState(employee.password || "");
    const [showPw, setShowPw] = useState(false);
    function saveLogin() {
        store.updateEmployee(employee.id, { email: newEmail });
        if (newPw && newPw !== employee.password) store.changeEmployeePassword(employee.id, newPw);
        toast("Zugangsdaten aktualisiert", "success");
        setLoginOpen(false);
    }

    // ── Lock modal ─────────────────────────────────────────────────────
    const [lockOpen, setLockOpen] = useState(false);
    const [lockReason, setLockReason] = useState("");
    function lockAccount() {
        if (!lockReason.trim()) { toast("Begründung erforderlich", "error"); return; }
        store.lockEmployee(employee.id, lockReason);
        toast(`Account von ${employee.first_name} ${employee.last_name} gesperrt`, "warning");
        setLockReason(""); setLockOpen(false);
    }
    function unlockAccount() {
        store.unlockEmployee(employee.id);
        toast(`Account entsperrt`, "success");
    }

    // ── Correction Request modal ───────────────────────────────────────
    const [corrOpen, setCorrOpen] = useState(false);
    const [corrDate, setCorrDate] = useState(today());
    const [corrEntryId, setCorrEntryId] = useState("");
    const [corrStart, setCorrStart] = useState("07:00");
    const [corrEnd, setCorrEnd] = useState("15:30");
    const [corrPause, setCorrPause] = useState(30);
    const [corrType, setCorrType] = useState("arbeit");
    const [corrReason, setCorrReason] = useState("");
    function submitCorrection() {
        if (!corrReason.trim()) { toast("Begründung angeben", "error"); return; }
        store.addCorrectionRequest({
            employee_id: employee.id, time_entry_id: corrEntryId || undefined, date: corrDate,
            requested_start: corrStart, requested_end: corrEnd, requested_pause: corrPause,
            requested_type: corrType, reason: corrReason
        });
        toast("Korrekturantrag eingereicht", "success");
        setCorrOpen(false); setCorrReason("");
    }

    // ── Admin: review correction ──────────────────────────────────────
    const [reviewId, setReviewId] = useState<string | null>(null);
    const [reviewNote, setReviewNote] = useState("");
    const [reviewAct, setReviewAct] = useState<"g" | "a">("g");
    function doReview() {
        if (!reviewId) return;
        if (reviewAct === "g") { store.approveCorrectionRequest(reviewId, reviewNote || undefined); toast("Genehmigt ✅", "success"); }
        else { if (!reviewNote.trim()) { toast("Begründung erforderlich", "error"); return; } store.rejectCorrectionRequest(reviewId, reviewNote); toast("Abgelehnt", "warning"); }
        setReviewId(null);
    }

    return (
        <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Back */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors w-fit text-sm font-semibold">
                <ArrowLeft className="w-4 h-4" /> Zurück zur Mitarbeiterliste
            </button>

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 shrink-0">
                        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl" style={{ background: `linear-gradient(135deg, ${employee.color}, #8b5cf6)` }}>
                            {employee.first_name[0]}{employee.last_name[0]}
                        </div>
                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-slate-950 flex items-center justify-center ${employee.is_active ? "bg-emerald-500" : "bg-red-600"}`}>
                            {employee.is_active ? <UserCheck className="w-4 h-4 text-white" /> : <UserX className="w-4 h-4 text-white" />}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">{employee.first_name} {employee.last_name}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${employee.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                {employee.is_active ? "AKTIV" : "GESPERRT"}
                            </span>
                            {employee.contract_type && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border bg-blue-500/10 text-blue-400 border-blue-500/20">{CONTRACT_LABELS[employee.contract_type]}</span>}
                        </div>
                        <p className="text-slate-400 font-medium">{employee.role || "Mitarbeiter"}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                            {employee.email && <a href={`mailto:${employee.email}`} className="text-xs text-slate-500 hover:text-blue-400 transition flex items-center gap-1.5 font-semibold"><Mail className="w-3.5 h-3.5" />{employee.email}</a>}
                            {employee.phone && <a href={`tel:${employee.phone}`} className="text-xs text-slate-500 hover:text-blue-400 transition flex items-center gap-1.5 font-semibold"><Phone className="w-3.5 h-3.5" />{employee.phone}</a>}
                        </div>
                        {employee.locked_at && <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5">
                            <Lock className="w-3 h-3" /><span className="font-bold">Gesperrt am {new Date(employee.locked_at).toLocaleDateString("de")}</span>{employee.locked_reason && <span className="text-red-500/70">— {employee.locked_reason}</span>}
                        </div>}
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {isAdmin && <button onClick={() => { setNewEmail(employee.email || ""); setNewPw(employee.password || ""); setLoginOpen(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"><Key className="w-3.5 h-3.5" />Zugangsdaten</button>}
                    {isAdmin && <button onClick={() => generateContractPDF(employee)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"><Download className="w-3.5 h-3.5" />Vertrag</button>}
                    {isAdmin && (employee.is_active
                        ? <button onClick={() => setLockOpen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl transition"><Lock className="w-3.5 h-3.5" />Sperren</button>
                        : <button onClick={unlockAccount} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition"><Unlock className="w-3.5 h-3.5" />Entsperren</button>
                    )}
                    <button onClick={() => setCorrOpen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition"><Edit3 className="w-3.5 h-3.5" />Korrekturantrag</button>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Arbeitszeit Total", val: `${totalHours.toFixed(1)}h`, sub: "Alle Einträge", icon: Clock, color: "blue" },
                    { label: "Dieser Monat", val: `${thisMonthHours.toFixed(1)}h`, sub: `Soll: 160h (${((thisMonthHours / 160) * 100).toFixed(0)}%)`, icon: Calendar, color: "amber" },
                    { label: "Stundensatz", val: formatCurrency(employee.hourly_rate), sub: "Abrechnung", icon: TrendingUp, color: "emerald" },
                    { label: "Monatsgehalt", val: employee.monthly_salary ? formatCurrency(employee.monthly_salary) : "—", sub: CONTRACT_LABELS[employee.contract_type || "vollzeit"] || "", icon: Shield, color: "purple" },
                ].map(({ label, val, sub, icon: I, color }) => (
                    <div key={label} className={`glass p-5 rounded-2xl border border-${color}-500/10`}>
                        <div className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between items-center`}>{label}<I className={`w-3 h-3 text-${color}-500`} /></div>
                        <div className="text-2xl font-black text-white">{val}</div>
                        <div className={`mt-1 text-[10px] text-${color}-500 font-bold`}>{sub}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Projects + Time Entries + Correction Requests */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Projects */}
                    <div className="glass rounded-2xl overflow-hidden border border-slate-800/60">
                        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-500" /><h2 className="font-bold text-white text-sm">Aktuelle Projekte</h2>
                        </div>
                        {projects.length === 0
                            ? <div className="p-8 text-center text-slate-500 italic text-sm">Keine zugewiesenen Projekte</div>
                            : <div className="divide-y divide-slate-800">
                                {projects.map(p => (
                                    <Link href={`/projekte/${p.id}`} key={p.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition group">
                                        <div className="flex items-center gap-3"><div className="w-2 h-8 rounded-full" style={{ backgroundColor: p.color }} /><div><div className="text-sm font-bold text-white group-hover:text-blue-400 transition">{p.name}</div><div className="text-[10px] text-slate-500">{store.getCustomerName(p.customer_id || "")}</div></div></div>
                                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white transition" />
                                    </Link>
                                ))}
                            </div>}
                    </div>

                    {/* Correction Requests */}
                    <div className="glass rounded-2xl overflow-hidden border border-slate-800/60">
                        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2"><Edit3 className="w-4 h-4 text-amber-500" /><h2 className="font-bold text-white text-sm">Korrekturanträge</h2>{corrReqs.filter(r => r.status === "offen").length > 0 && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-black rounded border border-amber-500/20">{corrReqs.filter(r => r.status === "offen").length} offen</span>}</div>
                            <button onClick={() => setCorrOpen(true)} className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300"><Plus className="w-3 h-3" />Neu</button>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {corrReqs.length === 0
                                ? <div className="p-8 text-center text-slate-500 text-sm italic">Keine Korrekturanträge</div>
                                : corrReqs.map(r => {
                                    const te = r.time_entry_id ? store.timeEntries.find(t => t.id === r.time_entry_id) : null;
                                    return (
                                        <div key={r.id} className="px-5 py-3 hover:bg-white/[0.01] transition">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${CORR_STATUS_COLOR[r.status]}`}>{CORR_STATUS_LABEL[r.status]}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono">{new Date(r.date + "T12:00:00").toLocaleDateString("de", { weekday: "short", day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
                                                        {r.requested_start && <span className="text-[10px] text-slate-500">{r.requested_start}–{r.requested_end} ({r.requested_pause}m Pause)</span>}
                                                    </div>
                                                    {te && <div className="text-[10px] text-slate-600 mb-0.5">Bezug: {store.getProjectName(te.project_id)} am {formatDate(te.date)} · {te.duration}h</div>}
                                                    <div className="text-xs text-slate-300 italic">{r.reason}</div>
                                                    {r.admin_note && <div className="flex items-start gap-1 mt-1 text-[10px] text-slate-500"><MessageSquare className="w-2.5 h-2.5 mt-0.5 shrink-0" />{r.admin_note}</div>}
                                                </div>
                                                {isAdmin && r.status === "offen" && <div className="flex gap-1 shrink-0">
                                                    <button onClick={() => { setReviewId(r.id); setReviewAct("g"); setReviewNote(""); }} className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded border border-emerald-500/20">Genehmigen</button>
                                                    <button onClick={() => { setReviewId(r.id); setReviewAct("a"); setReviewNote(""); }} className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] font-bold rounded border border-red-500/20">Ablehnen</button>
                                                </div>}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Work Journal */}
                    <div className="glass rounded-2xl overflow-hidden border border-slate-800/60">
                        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
                            <History className="w-4 h-4 text-amber-500" /><h2 className="font-bold text-white text-sm">Letzte Tätigkeiten</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/60 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                    <tr><th className="px-5 py-3">Datum</th><th className="px-5 py-3">Projekt</th><th className="px-5 py-3">Tätigkeit</th><th className="px-5 py-3 text-center">Stunden</th><th className="px-5 py-3 text-center">Status</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {timeEntries.slice(0, 10).map(t => (
                                        <tr key={t.id} className="text-xs hover:bg-white/5 transition">
                                            <td className="px-5 py-3 text-slate-400 font-mono">{formatDate(t.date)}</td>
                                            <td className="px-5 py-3 text-white font-bold">{store.getProjectName(t.project_id)}</td>
                                            <td className="px-5 py-3 text-slate-500 italic truncate max-w-[180px]">{t.description || "—"}</td>
                                            <td className="px-5 py-3 text-center font-black text-white">{t.duration.toFixed(1)}h</td>
                                            <td className="px-5 py-3 text-center"><span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${t.is_approved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>{t.is_approved ? "✅" : "⏳"}</span></td>
                                        </tr>
                                    ))}
                                    {timeEntries.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500 italic text-sm">Keine Einträge</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* Qualifications */}
                    <div className="glass rounded-2xl p-5 border border-slate-800/60">
                        <div className="flex items-center justify-between mb-4"><h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Qualifikationen</h3><Award className="w-3.5 h-3.5 text-blue-500" /></div>
                        <div className="flex flex-wrap gap-2">
                            {(employee.skills || []).length > 0
                                ? employee.skills.map(s => <span key={s} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-bold uppercase tracking-tight">{s}</span>)
                                : <p className="text-xs text-slate-500 italic">Keine Qualifikationen hinterlegt</p>}
                        </div>
                    </div>

                    {/* Admin Panel */}
                    {isAdmin && <div className="glass rounded-2xl p-5 border border-slate-800/60">
                        <div className="flex items-center justify-between mb-4"><h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Adminbereich</h3><Settings className="w-3.5 h-3.5 text-slate-600" /></div>
                        <div className="space-y-1.5">
                            <button onClick={() => { setNewEmail(employee.email || ""); setNewPw(employee.password || ""); setLoginOpen(true); }} className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-blue-500/5 border border-transparent hover:border-blue-500/20 transition text-xs text-white font-semibold group">
                                <span className="flex items-center gap-2"><Key className="w-3.5 h-3.5 text-blue-400" />Login-Daten verwalten</span><ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-white transition" />
                            </button>
                            <button onClick={() => generateContractPDF(employee)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-emerald-500/5 border border-transparent hover:border-emerald-500/20 transition text-xs text-white font-semibold group">
                                <span className="flex items-center gap-2"><Download className="w-3.5 h-3.5 text-emerald-400" />Vertrag herunterladen</span><ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-white transition" />
                            </button>
                            <button onClick={() => setCorrOpen(true)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-amber-500/5 border border-transparent hover:border-amber-500/20 transition text-xs text-white font-semibold group">
                                <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-amber-400" />Korrekturantrag einreichen</span><ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-white transition" />
                            </button>
                            <div className="border-t border-slate-800 pt-1.5 mt-1.5">
                                {employee.is_active
                                    ? <button onClick={() => setLockOpen(true)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition text-xs text-red-400 font-semibold group">
                                        <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" />Account sperren</span><AlertCircle className="w-3 h-3 text-red-900 group-hover:text-red-500 transition" />
                                    </button>
                                    : <button onClick={unlockAccount} className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition text-xs text-emerald-400 font-semibold group">
                                        <span className="flex items-center gap-2"><Unlock className="w-3.5 h-3.5" />Account entsperren</span><CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    </button>}
                            </div>
                        </div>
                    </div>}

                    {/* Account Status Box */}
                    <div className={`glass rounded-2xl p-5 border ${employee.is_active ? "border-emerald-500/10" : "border-red-500/20 bg-red-500/5"}`}>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Account-Status</h3>
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${employee.is_active ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
                            <span className={`text-sm font-black ${employee.is_active ? "text-emerald-400" : "text-red-400"}`}>{employee.is_active ? "Aktiv" : "Gesperrt"}</span>
                        </div>
                        {employee.locked_reason && <div className="text-xs text-red-400/70 italic mb-2">Grund: {employee.locked_reason}</div>}
                        <div className="space-y-1 text-[11px] text-slate-600">
                            <div className="flex justify-between"><span>Erstellt</span><span>{new Date(employee.created_at).toLocaleDateString("de")}</span></div>
                            <div className="flex justify-between"><span>E-Mail</span><span className="text-slate-400">{employee.email || "—"}</span></div>
                            <div className="flex justify-between"><span>Passwort</span><span className="font-mono text-slate-600">{"•".repeat(Math.max(4, (employee.password || "").length))}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Login-Daten */}
            <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="Login-Daten verwalten" size="sm"
                footer={<><button onClick={() => setLoginOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button><button onClick={saveLogin} className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Speichern</button></>}>
                <div className="space-y-4">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2"><Key className="w-3.5 h-3.5 text-blue-400 shrink-0" />Änderungen gelten sofort. Teile neue Login-Daten si­cher mit dem Mitarbeiter.</div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">E-Mail / Login</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none" /></div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Neues Passwort</label>
                        <div className="relative"><input type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Leer lassen = unverändert" className="w-full px-3 py-2.5 pr-10 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none placeholder-slate-700" />
                            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                    </div>
                    <div className="p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[10px] text-amber-400">Aktuelle Login-Daten: <strong>{employee.email}</strong> / <strong className="font-mono">{employee.password || "—"}</strong></div>
                </div>
            </Modal>

            {/* Modal: Account sperren */}
            <Modal open={lockOpen} onClose={() => setLockOpen(false)} title="Account sperren" size="sm"
                footer={<><button onClick={() => setLockOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button><button onClick={lockAccount} className="px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl">Sperren</button></>}>
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl"><AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /><div className="text-xs text-red-300"><div className="font-bold mb-0.5">Zugang sperren für {employee.first_name} {employee.last_name}</div><div className="text-red-400">Der Mitarbeiter kann sich nach der Sperrung nicht mehr einloggen.</div></div></div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Begründung (erforderlich)</label><textarea value={lockReason} onChange={e => setLockReason(e.target.value)} rows={3} placeholder="z.B. Kündigung, Datenschutzvorfall, temporäre Deaktivierung..." className="w-full px-3 py-2.5 bg-slate-900 border border-red-500/20 rounded-xl text-sm text-white outline-none resize-none" /></div>
                </div>
            </Modal>

            {/* Modal: Korrekturantrag */}
            <Modal open={corrOpen} onClose={() => setCorrOpen(false)} title="Korrekturantrag einreichen" size="md"
                footer={<><button onClick={() => setCorrOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button><button onClick={submitCorrection} className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl">Einreichen</button></>}>
                <div className="space-y-4">
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-300/80">Reichen Sie hier eine Korrektur für eine fehlerhafte Zeiterfassung ein. Der Admin prüft und genehmigt den Antrag.</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Datum</label><input type="date" max={today()} value={corrDate} onChange={e => setCorrDate(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Bezug (optional)</label>
                            <select value={corrEntryId} onChange={e => setCorrEntryId(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
                                <option value="">— Neuer Eintrag —</option>
                                {store.timeEntries.filter(t => t.employee_id === employee.id).map(t => <option key={t.id} value={t.id}>{t.date} · {store.getProjectName(t.project_id)} ({t.duration}h)</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Von</label><input type="time" value={corrStart} onChange={e => setCorrStart(e.target.value)} className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Bis</label><input type="time" value={corrEnd} onChange={e => setCorrEnd(e.target.value)} className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Pause (min)</label><input type="number" min={0} max={480} step={15} value={corrPause} onChange={e => setCorrPause(Number(e.target.value))} className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white outline-none" /></div>
                    </div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Begründung (erforderlich)</label><textarea value={corrReason} onChange={e => setCorrReason(e.target.value)} rows={3} placeholder="z.B. Die Stempeluhr hat nicht reagiert, tatsächliche Arbeitszeit war..." className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none resize-none" /></div>
                </div>
            </Modal>

            {/* Modal: Review correction */}
            <Modal open={!!reviewId} onClose={() => setReviewId(null)} title={reviewAct === "g" ? "Korrektur genehmigen" : "Korrektur ablehnen"} size="sm"
                footer={<><button onClick={() => setReviewId(null)} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-800 rounded-xl">Abbrechen</button><button onClick={doReview} className={`px-5 py-2 text-sm font-bold rounded-xl ${reviewAct === "g" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>{reviewAct === "g" ? "Genehmigen" : "Ablehnen"}</button></>}>
                {reviewId && (() => { const r = store.correctionRequests.find(x => x.id === reviewId); return r ? <div className="space-y-3"><div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs"><div className="font-bold text-white">{formatDate(r.date)} · {r.requested_start}–{r.requested_end}</div><div className="text-slate-400 mt-0.5 italic">{r.reason}</div></div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{reviewAct === "g" ? "Notiz (optional)" : "Begründung (erforderlich)"}</label><textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={3} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none resize-none" /></div></div> : null; })()}
            </Modal>
        </div>
    );
}

export type DocumentType = "angebot" | "rechnung" | "auftragsbestaetigung" | "lieferschein";
export type DocumentStatus = "entwurf" | "offen" | "angenommen" | "abgelehnt" | "ueberfaellig" | "bezahlt" | "gemahnt";
export type ProjectStatus = "planung" | "aktiv" | "abgeschlossen" | "storniert";
export type TimeEntryType = "arbeit" | "fahrt" | "pause" | "urlaub" | "krankheit" | "schlechtwetter" | "schulung";
export type LeaveStatus = "beantragt" | "genehmigt" | "abgelehnt" | "storniert";
export type LeaveType = "urlaub" | "krankheit" | "sonderurlaub" | "freizeitausgleich";
export type CorrectionStatus = "offen" | "genehmigt" | "abgelehnt";

export interface Customer {
    id: string;
    company_id: string;
    name: string;
    type: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    created_at: string;
}

export type ContractType = "vollzeit" | "teilzeit" | "minijob" | "freelancer";

export interface Employee {
    id: string;
    company_id: string;
    first_name: string;
    last_name: string;
    role?: string;
    email?: string;
    password?: string;
    phone?: string;
    hourly_rate: number;
    monthly_salary?: number;
    contract_type?: ContractType;
    skills: string[];
    color: string;
    is_active: boolean;
    locked_at?: string;          // ISO timestamp when account was locked
    locked_reason?: string;      // Reason for locking
    created_at: string;
}

export interface Project {
    id: string;
    company_id: string;
    customer_id?: string;
    name: string;
    address?: string;
    status: ProjectStatus;
    budget: number;
    progress: number;
    start_date?: string;
    end_date?: string;
    color: string;
    notes?: string;
    team: string[];
    created_at: string;
    customer?: Customer;
}

export interface DocumentItem {
    id?: string;
    document_id?: string;
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total: number;
    sort_order: number;
}

export interface Invoice {
    id: string;
    company_id: string;
    customer_id: string;
    project_id?: string;
    doc_type: DocumentType;
    doc_number: string;
    status: DocumentStatus;
    date: string;
    due_date?: string;
    tax_rate: number;
    discount_rate: number;
    notes?: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    dunning_level: number;
    items: DocumentItem[];
    created_at: string;
    customer?: Customer;
    project?: Project;
}

export interface TimeEntry {
    id: string;
    company_id: string;
    employee_id: string;
    project_id?: string;
    date: string;
    start_time?: string;
    end_time?: string;
    pause_minutes?: number;     // Pause in Minuten
    duration: number;           // netto Stunden (nach Pause)
    type: TimeEntryType;
    description?: string;
    is_approved: boolean;
    admin_note?: string;
    created_at: string;
    employee?: Employee;
    project?: Project;
}

export interface LeaveRequest {
    id: string;
    company_id: string;
    employee_id: string;
    type: LeaveType;
    status: LeaveStatus;
    start_date: string;
    end_date: string;
    days: number;
    reason?: string;
    admin_note?: string;
    approved_by?: string;
    created_at: string;
}

export interface CatalogItem {
    id: string;
    company_id: string;
    name: string;
    article_number?: string;
    category?: string;
    unit: string;
    price: number;
    description?: string;
    created_at: string;
}

export interface Notification {
    id: string;
    company_id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    link?: string;
    is_read: boolean;
    created_at: string;
}

export interface TextTemplate {
    id: string;
    company_id: string;
    name: string;
    type: "angebot" | "rechnung" | "mahnung";
    subject: string;
    content: string;
    created_at: string;
}

export interface DashboardStats {
    totalRevenue: number;
    openInvoicesAmount: number;
    overdueCount: number;
    activeProjects: number;
    planningProjects: number;
    openProposals: number;
    proposalVolume: number;
    customerCount: number;
}

export interface CorrectionRequest {
    id: string;
    company_id: string;
    employee_id: string;
    time_entry_id?: string;      // Existing entry to correct (optional)
    date: string;                // Date of the correction
    requested_start?: string;    // What employee claims it should be
    requested_end?: string;
    requested_pause?: number;
    requested_type?: string;
    reason: string;              // Why the correction is needed
    status: CorrectionStatus;
    admin_note?: string;
    reviewed_by?: string;       // Employee ID of admin who reviewed
    reviewed_at?: string;
    created_at: string;
}

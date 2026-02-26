export type DocumentType = "angebot" | "rechnung" | "auftragsbestaetigung" | "lieferschein";
export type DocumentStatus = "entwurf" | "offen" | "angenommen" | "abgelehnt" | "ueberfaellig" | "bezahlt" | "gemahnt";
export type ProjectStatus = "planung" | "aktiv" | "abgeschlossen" | "storniert";
export type TimeEntryType = "arbeit" | "fahrt" | "pause" | "urlaub" | "krankheit";

export interface Customer {
    id: string;
    company_id: string;
    name: string;
    type: string;
    email?: string;
    phone?: string;
    address?: string;
    payment_terms: number;
    credit_limit: number;
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
    duration: number;
    type: TimeEntryType;
    description?: string;
    is_approved: boolean;
    created_at: string;
    employee?: Employee;
    project?: Project;
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

"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Customer, Employee, Project, Invoice, TimeEntry, CatalogItem } from "@/types";
import { mockCustomers, mockEmployees, mockProjects, mockInvoices, mockTimeEntries, mockCatalog } from "@/lib/mock-data";
import { uid } from "@/lib/utils";

interface Store {
    customers: Customer[];
    employees: Employee[];
    projects: Project[];
    invoices: Invoice[];
    timeEntries: TimeEntry[];
    catalog: CatalogItem[];

    // Customers
    addCustomer: (c: Omit<Customer, "id" | "company_id" | "created_at">) => Customer;
    updateCustomer: (id: string, c: Partial<Customer>) => void;
    deleteCustomer: (id: string) => void;

    // Employees
    addEmployee: (e: Omit<Employee, "id" | "company_id" | "created_at">) => Employee;
    updateEmployee: (id: string, e: Partial<Employee>) => void;
    deleteEmployee: (id: string) => void;

    // Projects
    addProject: (p: Omit<Project, "id" | "company_id" | "created_at">) => Project;
    updateProject: (id: string, p: Partial<Project>) => void;
    deleteProject: (id: string) => void;

    // Invoices
    addInvoice: (d: Omit<Invoice, "id" | "company_id" | "created_at">) => Invoice;
    updateInvoice: (id: string, d: Partial<Invoice>) => void;
    deleteInvoice: (id: string) => void;

    // Time Entries
    addTimeEntry: (t: Omit<TimeEntry, "id" | "company_id" | "created_at">) => TimeEntry;
    updateTimeEntry: (id: string, t: Partial<TimeEntry>) => void;
    deleteTimeEntry: (id: string) => void;

    // Catalog
    addCatalogItem: (c: Omit<CatalogItem, "id" | "company_id" | "created_at">) => CatalogItem;
    updateCatalogItem: (id: string, c: Partial<CatalogItem>) => void;
    deleteCatalogItem: (id: string) => void;

    // Helpers
    getCustomerName: (id: string) => string;
    getEmployeeName: (id: string) => string;
    getProjectName: (id?: string) => string;

    // Aggregation
    getCustomerRevenue: (customerId: string) => number;
    getCustomerOpenAmount: (customerId: string) => number;
    getCustomerDocCount: (customerId: string) => number;
    getCustomerProjectCount: (customerId: string) => number;
    getProjectInvoiced: (projectId: string) => number;
    getProjectPaid: (projectId: string) => number;
}

const StoreContext = createContext<Store | null>(null);

function loadOrDefault<T>(key: string, fallback: T[]): T[] {
    if (typeof window === "undefined") return fallback;
    try {
        const stored = localStorage.getItem("hwp_" + key);
        if (stored) return JSON.parse(stored);
    } catch { }
    return fallback;
}

function persist<T>(key: string, data: T[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("hwp_" + key, JSON.stringify(data));
}

export function StoreProvider({ children }: { children: ReactNode }) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setCustomers(loadOrDefault("customers", mockCustomers));
        setEmployees(loadOrDefault("employees", mockEmployees));
        setProjects(loadOrDefault("projects", mockProjects));
        setInvoices(loadOrDefault("invoices", mockInvoices));
        setTimeEntries(loadOrDefault("timeEntries", mockTimeEntries));
        setCatalog(loadOrDefault("catalog", mockCatalog));
        setLoaded(true);
    }, []);

    useEffect(() => { if (loaded) persist("customers", customers); }, [customers, loaded]);
    useEffect(() => { if (loaded) persist("employees", employees); }, [employees, loaded]);
    useEffect(() => { if (loaded) persist("projects", projects); }, [projects, loaded]);
    useEffect(() => { if (loaded) persist("invoices", invoices); }, [invoices, loaded]);
    useEffect(() => { if (loaded) persist("timeEntries", timeEntries); }, [timeEntries, loaded]);
    useEffect(() => { if (loaded) persist("catalog", catalog); }, [catalog, loaded]);

    const now = () => new Date().toISOString().split("T")[0];

    // --- Customers ---
    const addCustomer = useCallback((c: Omit<Customer, "id" | "company_id" | "created_at">) => {
        const entry: Customer = { ...c, id: uid(), company_id: "co1", created_at: now() };
        setCustomers((prev) => [...prev, entry]);
        return entry;
    }, []);
    const updateCustomer = useCallback((id: string, c: Partial<Customer>) => {
        setCustomers((prev) => prev.map((x) => (x.id === id ? { ...x, ...c } : x)));
    }, []);
    const deleteCustomer = useCallback((id: string) => {
        setCustomers((prev) => prev.filter((x) => x.id !== id));
    }, []);

    // --- Employees ---
    const addEmployee = useCallback((e: Omit<Employee, "id" | "company_id" | "created_at">) => {
        const entry: Employee = { ...e, id: uid(), company_id: "co1", created_at: now() };
        setEmployees((prev) => [...prev, entry]);
        return entry;
    }, []);
    const updateEmployee = useCallback((id: string, e: Partial<Employee>) => {
        setEmployees((prev) => prev.map((x) => (x.id === id ? { ...x, ...e } : x)));
    }, []);
    const deleteEmployee = useCallback((id: string) => {
        setEmployees((prev) => prev.filter((x) => x.id !== id));
    }, []);

    // --- Projects ---
    const addProject = useCallback((p: Omit<Project, "id" | "company_id" | "created_at">) => {
        const entry: Project = { ...p, id: uid(), company_id: "co1", created_at: now() };
        setProjects((prev) => [...prev, entry]);
        return entry;
    }, []);
    const updateProject = useCallback((id: string, p: Partial<Project>) => {
        setProjects((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
    }, []);
    const deleteProject = useCallback((id: string) => {
        setProjects((prev) => prev.filter((x) => x.id !== id));
    }, []);

    // --- Invoices ---
    const addInvoice = useCallback((d: Omit<Invoice, "id" | "company_id" | "created_at">) => {
        const entry: Invoice = { ...d, id: uid(), company_id: "co1", created_at: now() };
        setInvoices((prev) => [...prev, entry]);
        return entry;
    }, []);
    const updateInvoice = useCallback((id: string, d: Partial<Invoice>) => {
        setInvoices((prev) => prev.map((x) => (x.id === id ? { ...x, ...d } : x)));
    }, []);
    const deleteInvoice = useCallback((id: string) => {
        setInvoices((prev) => prev.filter((x) => x.id !== id));
    }, []);

    // --- Time Entries ---
    const addTimeEntry = useCallback((t: Omit<TimeEntry, "id" | "company_id" | "created_at">) => {
        const entry: TimeEntry = { ...t, id: uid(), company_id: "co1", created_at: now() };
        setTimeEntries((prev) => [...prev, entry]);
        return entry;
    }, []);
    const updateTimeEntry = useCallback((id: string, t: Partial<TimeEntry>) => {
        setTimeEntries((prev) => prev.map((x) => (x.id === id ? { ...x, ...t } : x)));
    }, []);
    const deleteTimeEntry = useCallback((id: string) => {
        setTimeEntries((prev) => prev.filter((x) => x.id !== id));
    }, []);

    // --- Catalog ---
    const addCatalogItem = useCallback((c: Omit<CatalogItem, "id" | "company_id" | "created_at">) => {
        const entry: CatalogItem = { ...c, id: uid(), company_id: "co1", created_at: now() };
        setCatalog((prev) => [...prev, entry]);
        return entry;
    }, []);
    const updateCatalogItem = useCallback((id: string, c: Partial<CatalogItem>) => {
        setCatalog((prev) => prev.map((x) => (x.id === id ? { ...x, ...c } : x)));
    }, []);
    const deleteCatalogItem = useCallback((id: string) => {
        setCatalog((prev) => prev.filter((x) => x.id !== id));
    }, []);

    // --- Helpers ---
    const getCustomerName = useCallback((id: string) => customers.find((c) => c.id === id)?.name || "\u2014", [customers]);
    const getEmployeeName = useCallback((id: string) => {
        const e = employees.find((e) => e.id === id);
        return e ? `${e.first_name} ${e.last_name}` : "\u2014";
    }, [employees]);
    const getProjectName = useCallback((id?: string) => (id ? projects.find((p) => p.id === id)?.name || "\u2014" : "\u2014"), [projects]);

    // --- Aggregation Helpers ---
    const getCustomerRevenue = useCallback((customerId: string) => {
        return invoices.filter((d) => d.customer_id === customerId && d.status === "bezahlt").reduce((s, d) => s + d.total_amount, 0);
    }, [invoices]);
    const getCustomerOpenAmount = useCallback((customerId: string) => {
        return invoices.filter((d) => d.customer_id === customerId && d.doc_type === "rechnung" && d.status !== "bezahlt" && d.status !== "entwurf").reduce((s, d) => s + (d.total_amount - d.paid_amount), 0);
    }, [invoices]);
    const getCustomerDocCount = useCallback((customerId: string) => {
        return invoices.filter((d) => d.customer_id === customerId).length;
    }, [invoices]);
    const getCustomerProjectCount = useCallback((customerId: string) => {
        return projects.filter((p) => p.customer_id === customerId).length;
    }, [projects]);
    const getProjectInvoiced = useCallback((projectId: string) => {
        return invoices.filter((d) => d.project_id === projectId && d.doc_type === "rechnung").reduce((s, d) => s + d.total_amount, 0);
    }, [invoices]);
    const getProjectPaid = useCallback((projectId: string) => {
        return invoices.filter((d) => d.project_id === projectId && d.status === "bezahlt").reduce((s, d) => s + d.total_amount, 0);
    }, [invoices]);

    const store: Store = {
        customers, employees, projects, invoices, timeEntries, catalog,
        addCustomer, updateCustomer, deleteCustomer,
        addEmployee, updateEmployee, deleteEmployee,
        addProject, updateProject, deleteProject,
        addInvoice, updateInvoice, deleteInvoice,
        addTimeEntry, updateTimeEntry, deleteTimeEntry,
        addCatalogItem, updateCatalogItem, deleteCatalogItem,
        getCustomerName, getEmployeeName, getProjectName,
        getCustomerRevenue, getCustomerOpenAmount, getCustomerDocCount, getCustomerProjectCount,
        getProjectInvoiced, getProjectPaid,
    };

    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useStore must be used within StoreProvider");
    return ctx;
}

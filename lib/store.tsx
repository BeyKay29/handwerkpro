"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Customer, Employee, Project, Invoice, TimeEntry, CatalogItem, Notification, TextTemplate, LeaveRequest } from "@/types";
import { mockCustomers, mockEmployees, mockProjects, mockInvoices, mockTimeEntries, mockCatalog, mockLeaveRequests } from "@/lib/mock-data";
import { uid } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

interface Store {
    customers: Customer[];
    employees: Employee[];
    projects: Project[];
    invoices: Invoice[];
    timeEntries: TimeEntry[];
    leaveRequests: LeaveRequest[];
    catalog: CatalogItem[];
    notifications: Notification[];
    templates: TextTemplate[];
    currentUser: Employee | null;
    activeTimer: { startTime: string; projectId?: string; description?: string } | null;
    isSupabaseConnected: boolean;
    loaded: boolean;

    // Auth
    login: (email: string, password?: string) => boolean;
    logout: () => void;

    // Timer
    startTimer: (projectId?: string, description?: string) => void;
    stopTimer: () => void;

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
    approveTimeEntry: (id: string, note?: string) => void;
    rejectTimeEntry: (id: string, note: string) => void;

    // Leave Requests
    addLeaveRequest: (r: Omit<LeaveRequest, "id" | "company_id" | "created_at" | "status">) => LeaveRequest;
    updateLeaveRequest: (id: string, r: Partial<LeaveRequest>) => void;
    deleteLeaveRequest: (id: string) => void;
    approveLeaveRequest: (id: string, note?: string) => void;
    rejectLeaveRequest: (id: string, note: string) => void;

    // Catalog
    addCatalogItem: (c: Omit<CatalogItem, "id" | "company_id" | "created_at">) => CatalogItem;
    updateCatalogItem: (id: string, c: Partial<CatalogItem>) => void;
    deleteCatalogItem: (id: string) => void;

    // Notifications
    addNotification: (n: Omit<Notification, "id" | "company_id" | "created_at" | "is_read">) => void;
    markAsRead: (id: string) => void;
    clearNotifications: () => void;

    // Templates
    addTemplate: (t: Omit<TextTemplate, "id" | "company_id" | "created_at">) => void;
    updateTemplate: (id: string, t: Partial<TextTemplate>) => void;
    deleteTemplate: (id: string) => void;

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

    // Simulations
    simulateOfferAccepted: (invoiceId: string) => void;
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
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [templates, setTemplates] = useState<TextTemplate[]>([]);
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [activeTimer, setActiveTimer] = useState<{ startTime: string; projectId?: string; description?: string } | null>(null);
    const [loaded, setLoaded] = useState(false);
    const isSupabaseConnected = !!supabase;

    useEffect(() => {
        async function initStore() {
            setCustomers(loadOrDefault("customers", mockCustomers));
            setEmployees(loadOrDefault("employees", mockEmployees));
            setProjects(loadOrDefault("projects", mockProjects));
            setInvoices(loadOrDefault("invoices", mockInvoices));
            setTimeEntries(loadOrDefault("timeEntries", mockTimeEntries));
            setLeaveRequests(loadOrDefault("leaveRequests", mockLeaveRequests));
            setCatalog(loadOrDefault("catalog", mockCatalog));
            setNotifications(loadOrDefault("notifications", []));
            setTemplates(loadOrDefault("templates", [
                { id: "t1", company_id: "co1", name: "Standard Angebot", type: "angebot", subject: "Angebot für Handwerksleistungen", content: "Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes Angebot...", created_at: new Date().toISOString() },
                { id: "t2", company_id: "co1", name: "Standard Rechnung", type: "rechnung", subject: "Rechnung [NR]", content: "Sehr geehrte Damen und Herren,\n\nanbei erhalten Sie die Rechnung für die erbrachten Leistungen zu Projekt [PROJEKT]...", created_at: new Date().toISOString() }
            ]));

            const storedUser = localStorage.getItem("hwp_currentUser");
            if (storedUser) {
                try { setCurrentUser(JSON.parse(storedUser)); } catch { }
            }

            // Pick up pending login from the login page (avoids useStore in login page at prerender)
            const pendingLogin = localStorage.getItem("hwp_pendingLogin");
            if (pendingLogin && !storedUser) {
                localStorage.removeItem("hwp_pendingLogin");
                const allEmps = loadOrDefault("employees", mockEmployees);
                const emp = allEmps.find((e: Employee) => e.email === pendingLogin);
                if (emp) setCurrentUser(emp);
            }

            const storedTimer = localStorage.getItem("hwp_activeTimer");
            if (storedTimer) {
                try { setActiveTimer(JSON.parse(storedTimer)); } catch { }
            }

            // Sync with Supabase if available
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    // Fetch real data from Supabase
                    console.log("Supabase session found. Fetching real data...");
                    // In a real app, we'd fetch all tables here. For now, we keep the sync simple.
                }
            }

            setLoaded(true);
        }
        initStore();
    }, []);

    useEffect(() => { if (loaded) persist("customers", customers); }, [customers, loaded]);
    useEffect(() => { if (loaded) persist("employees", employees); }, [employees, loaded]);
    useEffect(() => { if (loaded) persist("projects", projects); }, [projects, loaded]);
    useEffect(() => { if (loaded) persist("invoices", invoices); }, [invoices, loaded]);
    useEffect(() => { if (loaded) persist("timeEntries", timeEntries); }, [timeEntries, loaded]);
    useEffect(() => { if (loaded) persist("leaveRequests", leaveRequests); }, [leaveRequests, loaded]);
    useEffect(() => { if (loaded) persist("catalog", catalog); }, [catalog, loaded]);
    useEffect(() => { if (loaded) persist("notifications", notifications); }, [notifications, loaded]);
    useEffect(() => { if (loaded) persist("templates", templates); }, [templates, loaded]);

    useEffect(() => {
        if (loaded) {
            if (currentUser) localStorage.setItem("hwp_currentUser", JSON.stringify(currentUser));
            else localStorage.removeItem("hwp_currentUser");
        }
    }, [currentUser, loaded]);

    useEffect(() => {
        if (loaded) {
            if (activeTimer) localStorage.setItem("hwp_activeTimer", JSON.stringify(activeTimer));
            else localStorage.removeItem("hwp_activeTimer");
        }
    }, [activeTimer, loaded]);

    const now = () => new Date().toISOString().split("T")[0];

    // --- Notifications ---
    const addNotification = useCallback((n: Omit<Notification, "id" | "company_id" | "created_at" | "is_read">) => {
        const entry: Notification = { ...n, id: uid(), company_id: "co1", created_at: new Date().toISOString(), is_read: false };
        setNotifications(prev => [entry, ...prev]);
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // --- Auth ---
    const login = useCallback((email: string, password?: string) => {
        // First try mock login for fast demo
        const emp = employees.find(e => e.email === email && (!password || e.password === password));
        if (emp) {
            setCurrentUser(emp);
            return true;
        }

        // Potential Supabase Auth integration
        /*
        if (supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error) return true;
        }
        */

        return false;
    }, [employees]);

    const logout = useCallback(() => {
        setCurrentUser(null);
        setActiveTimer(null);
        if (supabase) supabase.auth.signOut();
    }, []);

    // --- Simulation ---
    const simulateOfferAccepted = useCallback((invoiceId: string) => {
        setInvoices(prev => prev.map(i => {
            if (i.id === invoiceId && i.doc_type === "angebot") {
                addNotification({
                    title: "Angebot angenommen",
                    message: `Das Angebot ${i.doc_number} wurde vom Kunden akzeptiert (via Mail).`,
                    type: "success",
                    link: "/angebote"
                });
                return { ...i, status: "angenommen" as any };
            }
            return i;
        }));
    }, [addNotification]);

    // --- Templates ---
    const addTemplate = useCallback((t: Omit<TextTemplate, "id" | "company_id" | "created_at">) => {
        const entry: TextTemplate = { ...t, id: uid(), company_id: "co1", created_at: new Date().toISOString() };
        setTemplates(prev => [...prev, entry]);
    }, []);

    const updateTemplate = useCallback((id: string, t: Partial<TextTemplate>) => {
        setTemplates(prev => prev.map(x => x.id === id ? { ...x, ...t } : x));
    }, []);

    const deleteTemplate = useCallback((id: string) => {
        setTemplates(prev => prev.filter(x => x.id !== id));
    }, []);

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
    const approveTimeEntry = useCallback((id: string, note?: string) => {
        setTimeEntries((prev) => prev.map((x) => x.id === id ? { ...x, is_approved: true, admin_note: note || x.admin_note } : x));
    }, []);
    const rejectTimeEntry = useCallback((id: string, note: string) => {
        setTimeEntries((prev) => prev.map((x) => x.id === id ? { ...x, is_approved: false, admin_note: note } : x));
    }, []);

    // --- Leave Requests ---
    const addLeaveRequest = useCallback((r: Omit<LeaveRequest, "id" | "company_id" | "created_at" | "status">) => {
        const entry: LeaveRequest = { ...r, id: uid(), company_id: "co1", status: "beantragt", created_at: now() };
        setLeaveRequests((prev) => [...prev, entry]);
        return entry;
    }, []);
    const updateLeaveRequest = useCallback((id: string, r: Partial<LeaveRequest>) => {
        setLeaveRequests((prev) => prev.map((x) => (x.id === id ? { ...x, ...r } : x)));
    }, []);
    const deleteLeaveRequest = useCallback((id: string) => {
        setLeaveRequests((prev) => prev.filter((x) => x.id !== id));
    }, []);
    const approveLeaveRequest = useCallback((id: string, note?: string) => {
        setLeaveRequests((prev) => prev.map((x) =>
            x.id === id ? { ...x, status: "genehmigt" as const, admin_note: note, approved_by: currentUser?.id } : x
        ));
    }, [currentUser]);
    const rejectLeaveRequest = useCallback((id: string, note: string) => {
        setLeaveRequests((prev) => prev.map((x) =>
            x.id === id ? { ...x, status: "abgelehnt" as const, admin_note: note, approved_by: currentUser?.id } : x
        ));
    }, [currentUser]);

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

    // --- Timer ---
    const startTimer = useCallback((projectId?: string, description?: string) => {
        setActiveTimer({
            startTime: new Date().toISOString(),
            projectId,
            description
        });
    }, []);

    const stopTimer = useCallback(() => {
        if (!activeTimer || !currentUser) return;

        const start = new Date(activeTimer.startTime);
        const end = new Date();
        const duration = (end.getTime() - start.getTime()) / (1000 * 3600);

        const pad = (n: number) => String(n).padStart(2, '0');
        const startStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
        const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

        addTimeEntry({
            employee_id: currentUser.id,
            project_id: activeTimer.projectId,
            date: now(),
            start_time: startStr,
            end_time: endStr,
            duration: Math.round(duration * 100) / 100,
            type: "arbeit",
            description: activeTimer.description || "Timer-Eintrag",
            is_approved: false
        });

        setActiveTimer(null);
    }, [activeTimer, currentUser, addTimeEntry, now]);

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
        customers, employees, projects, invoices, timeEntries, leaveRequests, catalog, notifications, templates,
        addCustomer, updateCustomer, deleteCustomer,
        addEmployee, updateEmployee, deleteEmployee,
        addProject, updateProject, deleteProject,
        addInvoice, updateInvoice, deleteInvoice,
        addTimeEntry, updateTimeEntry, deleteTimeEntry, approveTimeEntry, rejectTimeEntry,
        addLeaveRequest, updateLeaveRequest, deleteLeaveRequest, approveLeaveRequest, rejectLeaveRequest,
        addCatalogItem, updateCatalogItem, deleteCatalogItem,
        addNotification, markAsRead, clearNotifications,
        addTemplate, updateTemplate, deleteTemplate,
        login, logout,
        getCustomerName, getEmployeeName, getProjectName,
        getCustomerRevenue, getCustomerOpenAmount, getCustomerDocCount, getCustomerProjectCount,
        getProjectInvoiced, getProjectPaid,
        simulateOfferAccepted,
        currentUser,
        activeTimer,
        startTimer,
        stopTimer,
        isSupabaseConnected,
        loaded
    };

    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useStore must be used within StoreProvider");
    return ctx;
}

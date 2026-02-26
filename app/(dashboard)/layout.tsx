"use client";

import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StoreProvider>
            <ToastProvider>
                <div className="flex min-h-screen bg-slate-950">
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-w-0">
                        <TopBar />
                        <main className="flex-1 overflow-x-hidden">
                            {children}
                        </main>
                    </div>
                </div>
            </ToastProvider>
        </StoreProvider>
    );
}

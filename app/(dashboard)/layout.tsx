import Sidebar from "@/components/sidebar";
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
                    <main className="flex-1 ml-[260px] transition-all duration-300">
                        {children}
                    </main>
                </div>
            </ToastProvider>
        </StoreProvider>
    );
}

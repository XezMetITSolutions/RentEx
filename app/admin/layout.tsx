import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { getSidebarStats } from '@/lib/adminStats';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const stats = await getSidebarStats();

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar
                activeRentals={stats.activeRentals}
                todayRevenue={stats.todayRevenue}
                pendingNotifications={stats.pendingNotifications}
            />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                    {children}
                </main>
            </div>
        </div>
    );
}

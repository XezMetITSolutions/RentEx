'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutWrapperProps {
    children: React.ReactNode;
    stats: {
        activeRentals: number;
        todayRevenue: number;
        pendingNotifications: number;
    };
}

export default function AdminLayoutWrapper({ children, stats }: AdminLayoutWrapperProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on mobile when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Sidebar with mobile toggle logic */}
            <Sidebar
                activeRentals={stats.activeRentals}
                todayRevenue={stats.todayRevenue}
                pendingNotifications={stats.pendingNotifications}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                    {children}
                </main>
            </div>
        </div>
    );
}

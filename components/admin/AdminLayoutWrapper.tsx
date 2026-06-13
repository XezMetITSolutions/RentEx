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
    staff: any;
}

export default function AdminLayoutWrapper({ children, stats, staff }: AdminLayoutWrapperProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarPinned, setIsSidebarPinned] = useState(true);
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    // Load pin preference from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('admin_sidebar_pinned');
        if (stored !== null) {
            setIsSidebarPinned(stored === 'true');
        }
    }, []);

    const handlePinToggle = () => {
        const newValue = !isSidebarPinned;
        setIsSidebarPinned(newValue);
        localStorage.setItem('admin_sidebar_pinned', String(newValue));
    };

    // Close sidebar on mobile when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Sidebar with mobile toggle & pin logic */}
            <Sidebar
                activeRentals={stats.activeRentals}
                todayRevenue={stats.todayRevenue}
                pendingNotifications={stats.pendingNotifications}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                staff={staff}
                isPinned={isSidebarPinned}
                onPinToggle={handlePinToggle}
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

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
    permissions?: Record<string, string[]>;
}

import { hmFontVariables } from '@/lib/hmFonts';

export default function AdminLayoutWrapper({ children, stats, staff, permissions }: AdminLayoutWrapperProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login/');

    // Close sidebar on mobile when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className={`hm-admin flex min-h-screen bg-hm-paper-2 text-hm-ink font-sans ${hmFontVariables}`}>
            {/* Mobile Backdrop - ensure z-50 to cover the sticky header (z-40) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar with mobile toggle logic (z-[60] so it sits above backdrop) */}
            <div className="relative z-[60]">
                <Sidebar
                    activeRentals={stats.activeRentals}
                    todayRevenue={stats.todayRevenue}
                    pendingNotifications={stats.pendingNotifications}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    staff={staff}
                    permissions={permissions}
                />
            </div>

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-5 sm:p-8 overflow-y-auto bg-hm-paper-2 text-hm-ink">
                    {children}
                </main>
            </div>
        </div>
    );
}

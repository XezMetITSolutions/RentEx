'use client';

import { Bell, Search, UserCircle, Menu, ChevronRight } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GlobalSearch from '@/components/admin/GlobalSearch';
import { useState } from 'react';

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Simple Breadcrumb logic
    const pathSegments = pathname.split('/').filter(p => p !== '');
    
    const getBreadcrumbName = (segment: string) => {
        const names: Record<string, string> = {
            'admin': 'Übersicht',
            'reservations': 'Reservierungen',
            'customers': 'Kunden',
            'check-in-setup': 'Check-In',
            'fleet': 'Fahrzeugflotte',
            'tracking': 'GPS Tracking',
            'maintenance': 'Wartung',
            'strafzettel': 'Strafzettel',
            'finance': 'Finanzen',
            'rechnungen': 'Rechnungen',
            'fahrtenbuch': 'Fahrtenbuch',
            'reports': 'Berichte',
            'staff': 'Mitarbeiter',
            'settings': 'Einstellungen',
            'new': 'Neu'
        };
        return names[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    };

    return (
        <>
            <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 px-4 md:px-6 backdrop-blur-md transition-all">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden text-gray-500 dark:text-gray-400"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    
                    {/* Dynamic Breadcrumbs */}
                    <div className="hidden sm:flex items-center gap-2 text-sm">
                        {pathSegments.map((segment, index) => {
                            const isLast = index === pathSegments.length - 1;
                            const isFirst = index === 0;
                            
                            return (
                                <div key={segment} className="flex items-center gap-2">
                                    <span className={isLast ? "text-gray-900 dark:text-gray-100 font-semibold" : "text-gray-500 dark:text-gray-400 font-medium"}>
                                        {getBreadcrumbName(segment)}
                                    </span>
                                    {!isLast && <ChevronRight className="h-4 w-4 text-gray-400" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Search Trigger */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <button
                            onClick={() => {
                                // Simulate Cmd+K event for GlobalSearch
                                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                                window.dispatchEvent(event);
                            }}
                            className="flex items-center justify-between h-10 w-64 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-3 text-sm text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left"
                        >
                            <span>Suchen...</span>
                            <div className="flex gap-1">
                                <kbd className="px-1.5 py-0.5 rounded text-[10px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-sans font-semibold">Cmd</kbd>
                                <kbd className="px-1.5 py-0.5 rounded text-[10px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-sans font-semibold">K</kbd>
                            </div>
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-700 pl-6">
                        <ThemeToggle />

                        <Link 
                            href="/admin/notifications"
                            className="relative rounded-full p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
                        </Link>

                        <button className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="h-9 w-9 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <UserCircle className="h-6 w-6" />
                            </div>
                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Admin User</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                            </div>
                        </button>
                    </div>
                </div>
            </header>
            
            <GlobalSearch />
        </>
    );
}

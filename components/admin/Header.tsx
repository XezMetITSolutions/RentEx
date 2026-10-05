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
            <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-hm-rule bg-hm-paper/90 px-4 md:px-6 backdrop-blur-md transition-all text-hm-ink">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        aria-label="Menü öffnen"
                        className="p-2 -ml-2 rounded-[var(--hm-radius-input)] hover:bg-hm-paper-2 lg:hidden text-hm-muted hover:text-hm-ink transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    
                    {/* Dynamic Breadcrumbs */}
                    <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                        {pathSegments.map((segment, index) => {
                            const isLast = index === pathSegments.length - 1;
                            
                            return (
                                <div key={segment} className="flex items-center gap-2">
                                    <span className={isLast ? "text-hm-ink font-bold uppercase tracking-wider" : "text-hm-muted uppercase tracking-wider"}>
                                        {getBreadcrumbName(segment)}
                                    </span>
                                    {!isLast && <ChevronRight className="h-3.5 w-3.5 text-hm-muted" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    {/* Search Trigger */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-hm-muted" />
                        <button
                            onClick={() => {
                                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                                window.dispatchEvent(event);
                            }}
                            className="flex items-center justify-between h-10 w-64 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 pl-10 pr-3 text-xs text-hm-muted hover:border-hm-muted hover:text-hm-ink transition-all text-left"
                        >
                            <span>Schnellsuche …</span>
                            <div className="flex gap-1 font-mono">
                                <kbd className="px-1.5 py-0.5 rounded text-[10px] border border-hm-rule bg-hm-paper text-hm-ink">⌘</kbd>
                                <kbd className="px-1.5 py-0.5 rounded text-[10px] border border-hm-rule bg-hm-paper text-hm-ink">K</kbd>
                            </div>
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-l border-hm-rule pl-4">
                        <ThemeToggle />

                        <Link 
                            href="/admin/notifications"
                            aria-label="Benachrichtigungen"
                            className="relative rounded-[var(--hm-radius-input)] p-2 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 transition-colors border border-transparent hover:border-hm-rule"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-hm-accent ring-2 ring-hm-paper"></span>
                        </Link>
                    </div>
                </div>
            </header>
            
            <GlobalSearch />
        </>
    );
}

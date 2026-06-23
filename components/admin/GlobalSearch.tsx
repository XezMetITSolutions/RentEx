'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Car, Users, CalendarDays, FileText, Settings, Wallet } from 'lucide-react';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleNavigate = (href: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(href);
    };

    if (!isOpen) return null;

    const quickLinks = [
        { name: 'Neue Reservierung', icon: CalendarDays, href: '/admin/reservations/new' },
        { name: 'Fahrzeugrückgabe (Check-In)', icon: Car, href: '/admin/check-in-setup' },
        { name: 'Kundenliste', icon: Users, href: '/admin/customers' },
        { name: 'Fahrzeugflotte', icon: Car, href: '/admin/fleet' },
        { name: 'Rechnungen', icon: FileText, href: '/admin/rechnungen' },
        { name: 'Einstellungen', icon: Settings, href: '/admin/settings' },
        { name: 'Finanzen', icon: Wallet, href: '/admin/finance' },
    ];

    const filteredLinks = quickLinks.filter(link => 
        link.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 bg-gray-900/50 backdrop-blur-sm">
            {/* Backdrop click handler */}
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
                    <Search className="h-5 w-5 text-gray-400 shrink-0" />
                    <input
                        autoFocus
                        type="text"
                        className="w-full bg-transparent border-0 h-14 px-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 text-base outline-none"
                        placeholder="Suchen nach Kunden, Fahrzeugen oder Aktionen..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {query.length === 0 && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Schnellzugriff
                        </div>
                    )}
                    
                    {filteredLinks.length > 0 ? (
                        <div className="space-y-1">
                            {filteredLinks.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => handleNavigate(link.href)}
                                    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-700 dark:text-gray-200 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-left"
                                >
                                    <link.icon className="h-5 w-5 text-gray-400" />
                                    {link.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            Keine Ergebnisse für "{query}" gefunden.
                        </div>
                    )}
                </div>

                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <span>Bestätigen mit <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono">Klick</kbd></span>
                    </div>
                    <span>Schließen mit <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono">Esc</kbd></span>
                </div>
            </div>
        </div>
    );
}

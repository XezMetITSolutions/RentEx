'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Car,
    CalendarDays,
    Users,
    Wallet,
    Settings,
    LogOut,
    Bell,
    Activity,
    FileText,
    BarChart3,
    Wrench,
    TrendingUp,
    MapPin,
    BookOpen,
    Receipt,
    Tag,
    X,
    ClipboardCheck,
    ShieldCheck,
    AlertTriangle,
    Zap,
    Pin
} from 'lucide-react';
import { clsx } from 'clsx';

const menuGroups = [
    {
        title: 'Hauptmenü',
        items: [
            { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
            { name: 'Aufgaben', icon: Activity, href: '/admin/tasks' },
            { name: 'Benachrichtigungen', icon: Bell, href: '/admin/notifications', badgeKey: 'notifications' },
        ]
    },
    {
        title: 'Operativ',
        items: [
            { name: 'Reservierungen', icon: CalendarDays, href: '/admin/reservations' },
            { name: 'Kunden', icon: Users, href: '/admin/customers' },
            { name: 'Check-In', icon: ClipboardCheck, href: '/admin/check-in-setup' },
            { name: 'Standorte', icon: MapPin, href: '/admin/locations' },
        ]
    },
    {
        title: 'Flotte',
        items: [
            { name: 'Fahrzeugflotte', icon: Car, href: '/admin/fleet' },
            { name: 'Wartung', icon: Wrench, href: '/admin/maintenance' },
            { name: 'KM Transfer', icon: Zap, href: '/admin/km-transfer' },
        ]
    },
    {
        title: 'Finanzen & Doc',
        items: [
            { name: 'Finanzen', icon: Wallet, href: '/admin/finance' },
            { name: 'Rechnungen', icon: Receipt, href: '/admin/rechnungen' },
            { name: 'Strafzettel', icon: AlertTriangle, href: '/admin/strafzettel' },
        ]
    },
    {
        title: 'Marketing & Analyse',
        items: [
            { name: 'Marketing', icon: TrendingUp, href: '/admin/marketing' },
            { name: 'Berichte', icon: BarChart3, href: '/admin/reports' },
            { name: 'Fahrtenbuch', icon: BookOpen, href: '/admin/fahrtenbuch' },
        ]
    },
    {
        title: 'System',
        items: [
            { name: 'Mitarbeiter', icon: ShieldCheck, href: '/admin/staff' },
            { name: 'AGB Versionen', icon: FileText, href: '/admin/agb' },
            { name: 'Zusatzoptionen', icon: Tag, href: '/admin/options' },
            { name: 'Einstellungen', icon: Settings, href: '/admin/settings' },
        ]
    }
];

interface SidebarProps {
    activeRentals: number;
    todayRevenue: number;
    pendingNotifications: number;
    isOpen?: boolean;
    onClose?: () => void;
    staff: any;
    isPinned: boolean;
    onPinToggle: () => void;
}

const rolePermissions: Record<string, string[]> = {
    'ADMINISTRATOR': ['all'],
    'FILIALLEITER': [
        'Dashboard', 'Fahrzeugflotte', 'Aufgaben', 'Standorte', 
        'Reservierungen', 'Kunden', 'Wartung', 'Fahrtenbuch', 'Rechnungen', 
        'Berichte', 'Benachrichtigungen', 'KM Transfer', 'Check-In', 
        'Strafzettel', 'Mitarbeiter'
    ],
    'MITARBEITER': [
        'Dashboard', 'Fahrzeugflotte', 'Aufgaben', 
        'Reservierungen', 'Kunden', 'Check-In', 'Rechnungen', 
        'Strafzettel', 'Benachrichtigungen'
    ],
    'FAHRER': [
        'Dashboard', 'Aufgaben', 'KM Transfer'
    ]
};

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export default function Sidebar({ activeRentals, todayRevenue, pendingNotifications, isOpen, onClose, staff, isPinned, onPinToggle }: SidebarProps) {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = isPinned || isHovered;

    const getBadge = (item: any) => {
        if (item.badgeKey === 'live') return 'Live';
        if (item.badgeKey === 'notifications' && pendingNotifications > 0) return String(pendingNotifications);
        return null;
    };

    const isItemAllowed = (name: string) => {
        if (!staff) return false;
        const perms = rolePermissions[staff.role] || [];
        return perms.includes('all') || perms.includes(name);
    };

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={clsx(
                "fixed inset-y-0 left-0 z-50 bg-slate-900 dark:bg-gray-950 text-white transition-all duration-300 ease-in-out lg:static lg:inset-0 shadow-xl flex flex-col border-r border-slate-800 dark:border-gray-800 shrink-0",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                isExpanded ? "w-64" : "lg:w-20"
            )}
        >
            {/* Logo Area */}
            <div className="flex items-center justify-between h-20 border-b border-slate-800 dark:border-gray-800 bg-slate-950 dark:bg-gray-900 px-5 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden shrink-0">
                        <Image src="/assets/logo.png" alt="RentEx Logo" fill className="object-contain p-0.5" />
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Pin button on desktop */}
                    <button
                        onClick={onPinToggle}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title={isPinned ? "Menü einklappen" : "Menü anheften"}
                    >
                        <Pin className={clsx("h-4 w-4 transform transition-transform duration-200", isPinned ? "rotate-45 text-red-500" : "")} />
                    </button>

                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 space-y-6 px-3 custom-scrollbar">
                {menuGroups.map((group) => {
                    const filteredItems = group.items.filter(i => isItemAllowed(i.name));
                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={group.title} className="space-y-1">
                            {isExpanded ? (
                                <h4 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 truncate transition-all duration-200">
                                    {group.title}
                                </h4>
                            ) : (
                                <div className="border-t border-slate-800/80 dark:border-gray-800/80 my-4 mx-2" />
                            )}
                            {filteredItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={clsx(
                                            'flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group/item',
                                            isExpanded ? 'justify-between' : 'justify-center',
                                            isActive
                                                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30'
                                                : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-gray-800 hover:text-white'
                                        )}
                                        title={!isExpanded ? item.name : undefined}
                                    >
                                        <div className="flex items-center min-w-0">
                                            <item.icon className={clsx(
                                                'h-5 w-5 transition-transform group-hover/item:scale-110 shrink-0',
                                                isExpanded ? 'mr-3' : '',
                                                isActive ? 'text-white' : 'text-slate-500'
                                            )} />
                                            {isExpanded && <span className="truncate">{item.name}</span>}
                                        </div>
                                        {isExpanded && getBadge(item) && (
                                            <span className={clsx(
                                                'px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0',
                                                isActive
                                                    ? 'bg-white text-red-600'
                                                    : 'bg-red-50 text-white'
                                            )}>
                                                {getBadge(item)}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* Quick Stats - from DB */}
            {isExpanded && (
                <div className="px-6 py-4 border-t border-slate-800 dark:border-gray-800 bg-slate-950/50 dark:bg-gray-900/50 transition-all duration-200">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="bg-slate-800/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Aktive Mietvorgänge</div>
                            <div className="text-lg font-bold text-white">{activeRentals}</div>
                        </div>
                        <div className="bg-slate-800/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Umsatz Heute</div>
                            <div className="text-lg font-bold text-green-400">
                                {todayRevenue >= 1000
                                    ? `€${(todayRevenue / 1000).toFixed(1)}k`
                                    : new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(todayRevenue)}
                            </div>
                        </div>
                    </div>
                    {staff.location && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-[10px] font-bold uppercase tracking-wider justify-center">
                            <MapPin className="w-3 h-3" />
                            {staff.location.name}
                        </div>
                    )}
                </div>
            )}

            {/* User / Footer */}
            <div className="p-4 border-t border-slate-800 dark:border-gray-800 bg-slate-950 dark:bg-gray-900 shrink-0">
                <div className={clsx("flex items-center gap-3 px-2", isExpanded ? "mb-3" : "justify-center mb-0")}>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0" title={!isExpanded ? staff.name : undefined}>
                        {getInitials(staff.name)}
                    </div>
                    {isExpanded && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{staff.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{staff.role}</p>
                        </div>
                    )}
                </div>
                <form action="/api/admin/logout" method="POST">
                    <button type="submit" className={clsx("flex w-full items-center text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 dark:hover:bg-gray-800 group/logout", isExpanded ? "px-4 py-2.5 gap-3" : "p-2.5 justify-center")} title={!isExpanded ? "Abmelden" : undefined}>
                        <LogOut className="h-4 w-4 transition-transform group-hover/logout:-translate-x-1 shrink-0" />
                        {isExpanded && <span>Abmelden</span>}
                    </button>
                </form>
            </div>
        </aside>
    );
}

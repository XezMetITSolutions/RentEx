'use client';

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
    Zap
} from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Fahrzeugflotte', icon: Car, href: '/admin/fleet' },
    { name: 'GPS Tracking', icon: MapPin, href: '/admin/tracking', badgeKey: 'live' },
    { name: 'Aufgaben', icon: Activity, href: '/admin/tasks' },
    { name: 'Marketing', icon: TrendingUp, href: '/admin/marketing' },
    { name: 'Standorte', icon: MapPin, href: '/admin/locations' },
    { name: 'Reservierungen', icon: CalendarDays, href: '/admin/reservations' },
    { name: 'Kunden', icon: Users, href: '/admin/customers' },
    { name: 'Wartung', icon: Wrench, href: '/admin/maintenance' },
    { name: 'Finanzen', icon: Wallet, href: '/admin/finance' },
    { name: 'Fahrtenbuch', icon: BookOpen, href: '/admin/fahrtenbuch' },
    { name: 'Rechnungen', icon: Receipt, href: '/admin/rechnungen' },
    { name: 'Berichte', icon: BarChart3, href: '/admin/reports' },
    { name: 'Benachrichtigungen', icon: Bell, href: '/admin/notifications', badgeKey: 'notifications' },
    { name: 'Zusatzoptionen', icon: Tag, href: '/admin/options' },
    { name: 'Check-In', icon: ClipboardCheck, href: '/admin/check-in-setup' },
    // --- Neue Seiten ---
    { name: 'Mitarbeiter', icon: ShieldCheck, href: '/admin/staff' },
    { name: 'Strafzettel', icon: AlertTriangle, href: '/admin/strafzettel' },
    { name: 'AGB Versionen', icon: FileText, href: '/admin/agb' },
    { name: 'KM Transfer', icon: Zap, href: '/admin/km-transfer' },
    { name: 'Einstellungen', icon: Settings, href: '/admin/settings' },
];

interface SidebarProps {
    activeRentals: number;
    todayRevenue: number;
    pendingNotifications: number;
    isOpen?: boolean;
    onClose?: () => void;
    staff: any;
}

const rolePermissions: Record<string, string[]> = {
    'ADMINISTRATOR': ['all'],
    'FILIALLEITER': [
        'Dashboard', 'Fahrzeugflotte', 'GPS Tracking', 'Aufgaben', 'Standorte', 
        'Reservierungen', 'Kunden', 'Wartung', 'Fahrtenbuch', 'Rechnungen', 
        'Berichte', 'Benachrichtigungen', 'KM Transfer', 'Check-In'
    ],
    'MITARBEITER': [
        'Dashboard', 'Fahrzeugflotte', 'GPS Tracking', 'Aufgaben', 
        'Reservierungen', 'Kunden', 'Check-In', 'Rechnungen'
    ],
    'FAHRER': [
        'Dashboard', 'Aufgaben', 'Fahrzeugflotte'
    ]
};

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export default function Sidebar({ activeRentals, todayRevenue, pendingNotifications, isOpen, onClose, staff }: SidebarProps) {
    const pathname = usePathname();

    const allowedItems = menuItems.filter(item => {
        const perms = rolePermissions[staff.role] || [];
        return perms.includes('all') || perms.includes(item.name);
    });

    const getBadge = (item: (typeof menuItems)[0]) => {
        if (item.badgeKey === 'live') return 'Live';
        if (item.badgeKey === 'notifications' && pendingNotifications > 0) return String(pendingNotifications);
        return null;
    };

    return (
        <aside className={clsx(
            "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-gray-950 text-white transition-transform duration-300 ease-in-out lg:static lg:inset-0 shadow-xl flex flex-col border-r border-slate-800 dark:border-gray-800",
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
            {/* Logo Area */}
            <div className="flex items-center justify-between h-20 border-b border-slate-800 dark:border-gray-800 bg-slate-950 dark:bg-gray-900 px-6">
                <div className="flex items-center gap-2">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shrink-0">
                        <Image src="/assets/logo.png" alt="RentEx Logo" fill className="object-contain p-1" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">
                            <span className="text-white">RENT</span>
                            <span className="text-red-500">-EX</span>
                        </h1>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3">
                {allowedItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg group',
                                isActive
                                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30'
                                    : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-gray-800 hover:text-white'
                            )}
                        >
                            <div className="flex items-center">
                                <item.icon className={clsx(
                                    'mr-3 h-5 w-5 transition-transform group-hover:scale-110',
                                    isActive ? 'text-white' : 'text-slate-500'
                                )} />
                                {item.name}
                            </div>
                            {getBadge(item) && (
                                <span className={clsx(
                                    'px-2 py-0.5 text-[10px] font-bold rounded-full',
                                    isActive
                                        ? 'bg-white text-red-600'
                                        : 'bg-red-500 text-white'
                                )}>
                                    {getBadge(item)}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Quick Stats - from DB */}
            <div className="px-6 py-4 border-t border-slate-800 dark:border-gray-800 bg-slate-950/50 dark:bg-gray-900/50">
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
                                : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(todayRevenue)}
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

            {/* User / Footer */}
            <div className="p-4 border-t border-slate-800 dark:border-gray-800 bg-slate-950 dark:bg-gray-900">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                        {getInitials(staff.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{staff.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{staff.role}</p>
                    </div>
                </div>
                <form action="/api/admin/logout" method="POST">
                    <button type="submit" className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 dark:hover:bg-gray-800 group">
                        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Abmelden</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}

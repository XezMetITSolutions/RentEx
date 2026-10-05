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

const menuGroups = [
    {
        title: 'Hauptmenü',
        items: [
            { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
            { name: 'Benachrichtigungen', icon: Bell, href: '/admin/notifications', badgeKey: 'notifications' },
        ]
    },
    {
        title: 'Operativ',
        items: [
            { name: 'Reservierungen', icon: CalendarDays, href: '/admin/reservations' },
            { name: 'Kunden', icon: Users, href: '/admin/customers' },
            { name: 'Check-In', icon: ClipboardCheck, href: '/admin/check-in-setup' },
        ]
    },
    {
        title: 'Flotte',
        items: [
            { name: 'Fahrzeugflotte', icon: Car, href: '/admin/fleet' },
            { name: 'Wartung', icon: Wrench, href: '/admin/maintenance' },
            { name: 'Strafzettel', icon: AlertTriangle, href: '/admin/strafzettel' },
        ]
    },
    {
        title: 'Finanzen & Analyse',
        items: [
            { name: 'Finanzen', icon: Wallet, href: '/admin/finance' },
            { name: 'Rechnungen', icon: Receipt, href: '/admin/rechnungen' },
            { name: 'Fahrtenbuch', icon: BookOpen, href: '/admin/fahrtenbuch' },
            { name: 'Berichte', icon: BarChart3, href: '/admin/reports' },
        ]
    },
    {
        title: 'System',
        items: [
            { name: 'Mitarbeiter', icon: ShieldCheck, href: '/admin/staff' },
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
}

const rolePermissions: Record<string, string[]> = {
    'SUPERADMIN': ['all'],
    'ADMINISTRATOR': ['all'],
    'FILIALLEITER': [
        'Dashboard', 'Fahrzeugflotte', 'GPS Tracking', 'Aufgaben', 
        'Reservierungen', 'Kunden', 'Wartung', 'Fahrtenbuch', 'Rechnungen', 
        'Berichte', 'Check-In', 'Finanzen', 'Strafzettel'
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
        <aside className={clsx(
            "fixed inset-y-0 left-0 z-50 w-64 bg-hm-paper text-hm-ink transition-transform duration-[var(--hm-dur-med)] ease-hm-out lg:static lg:inset-0 flex flex-col border-r border-hm-rule shadow-sm",
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
            {/* Logo Area */}
            <div className="flex items-center justify-between h-20 border-b border-hm-rule px-5 bg-hm-paper">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="w-fit rounded-[var(--hm-radius-input)] bg-hm-stage-ink px-2.5 py-1.5 shadow-sm">
                        <div className="relative h-6 w-20">
                            <Image src="/assets/logo.png" alt="Rent-Ex" fill priority className="object-contain" sizes="80px" />
                        </div>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-hm-muted uppercase tracking-wider group-hover:text-hm-ink transition-colors">
                        Admin
                    </span>
                </Link>

                <button
                    onClick={onClose}
                    aria-label="Menü schließen"
                    className="lg:hidden p-2 rounded-[var(--hm-radius-input)] hover:bg-hm-paper-2 text-hm-muted hover:text-hm-ink transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-5 space-y-6 px-3">
                {menuGroups.map((group) => {
                    const filteredItems = group.items.filter(i => isItemAllowed(i.name));
                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={group.title} className="space-y-1">
                            <h4 className="px-3 text-[10px] font-bold text-hm-muted uppercase tracking-wider mb-2">
                                {group.title}
                            </h4>
                            {filteredItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={clsx(
                                            'flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-[background-color,color] duration-[var(--hm-dur-short)] ease-hm-out rounded-[var(--hm-radius-input)] group',
                                            isActive
                                                ? 'bg-hm-accent text-hm-accent-ink shadow-sm font-semibold'
                                                : 'text-hm-ink-2 hover:bg-hm-paper-2 hover:text-hm-ink'
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className={clsx(
                                                'mr-2.5 h-4 w-4 shrink-0 transition-colors',
                                                isActive ? 'text-hm-accent-ink' : 'text-hm-muted group-hover:text-hm-ink'
                                            )} />
                                            <span>{item.name}</span>
                                        </div>
                                        {getBadge(item) && (
                                            <span className={clsx(
                                                'px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full',
                                                isActive
                                                    ? 'bg-hm-accent-ink text-hm-accent'
                                                    : 'bg-hm-accent/15 text-hm-accent-text border border-hm-accent/20'
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
            <div className="px-4 py-3 border-t border-hm-rule bg-hm-paper-2/60">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-input)] p-2.5 text-center">
                        <div className="text-[9px] font-bold text-hm-muted uppercase tracking-wider mb-0.5">Aktiv</div>
                        <div className="text-base font-bold font-mono text-hm-ink">{activeRentals}</div>
                    </div>
                    <div className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-input)] p-2.5 text-center">
                        <div className="text-[9px] font-bold text-hm-muted uppercase tracking-wider mb-0.5">Umsatz Heute</div>
                        <div className="text-base font-bold font-mono text-hm-ink">
                            {todayRevenue >= 1000
                                ? `€${(todayRevenue / 1000).toFixed(1)}k`
                                : new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(todayRevenue)}
                        </div>
                    </div>
                </div>
                {staff?.location && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-input)] text-hm-ink text-[10px] font-medium justify-center truncate">
                        <MapPin className="w-3 h-3 text-hm-accent shrink-0" />
                        <span className="truncate">{staff.location.name}</span>
                    </div>
                )}
            </div>

            {/* User / Footer */}
            <div className="p-3 border-t border-hm-rule bg-hm-paper">
                <div className="flex items-center gap-2.5 mb-2 px-1">
                    <div className="h-8 w-8 rounded-[var(--hm-radius-input)] bg-hm-stage-ink flex items-center justify-center text-hm-stage-ink text-white font-mono text-xs font-bold shrink-0">
                        {getInitials(staff?.name || 'AD')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-hm-ink truncate">{staff?.name}</p>
                        <p className="text-[10px] font-mono text-hm-muted truncate uppercase tracking-tight">{staff?.role}</p>
                    </div>
                </div>
                <form action="/api/admin/logout" method="POST">
                    <button type="submit" className="flex w-full items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 transition-colors rounded-[var(--hm-radius-input)] border border-transparent hover:border-hm-rule">
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Abmelden</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}

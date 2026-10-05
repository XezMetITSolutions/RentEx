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
    AlertTriangle,
    Zap,
    Radio,
    LineChart,
    Building2,
    Shield,
    PackageCheck,
    type LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
    DEFAULT_ROLE_PERMISSIONS,
    getAdminMenuGroups,
    staffCanAccessModule,
    type AdminModuleItem,
} from '@/lib/rolePermissions';

const MODULE_ICONS: Record<string, LucideIcon> = {
    Dashboard: LayoutDashboard,
    Aufgaben: Activity,
    Benachrichtigungen: Bell,
    Aktivitätsprotokoll: FileText,
    Reservierungen: CalendarDays,
    Kunden: Users,
    'Check-In': ClipboardCheck,
    'Check-Out': PackageCheck,
    Standorte: MapPin,
    Fahrzeugflotte: Car,
    'GPS Tracking': Radio,
    Wartung: Wrench,
    'KM Transfer': Zap,
    Strafzettel: AlertTriangle,
    Marketing: TrendingUp,
    'Preise & Marktanalyse': LineChart,
    Mitbewerber: Building2,
    Zusatzoptionen: Tag,
    Finanzen: Wallet,
    Rechnungen: Receipt,
    Fahrtenbuch: BookOpen,
    Berichte: BarChart3,
    Mitarbeiter: Users,
    Berechtigungen: Shield,
    'AGB Versionen': FileText,
    Einstellungen: Settings,
};

const menuGroups = getAdminMenuGroups();

interface SidebarProps {
    activeRentals: number;
    todayRevenue: number;
    pendingNotifications: number;
    isOpen?: boolean;
    onClose?: () => void;
    staff: { name?: string; role?: string; location?: { name: string } | null } | null;
    permissions?: Record<string, string[]>;
}

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

function isNavItemActive(pathname: string, href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ activeRentals, todayRevenue, pendingNotifications, isOpen, onClose, staff, permissions }: SidebarProps) {
    const pathname = usePathname();
    const activePermissions = permissions ?? DEFAULT_ROLE_PERMISSIONS;

    const getBadge = (item: AdminModuleItem) => {
        if (item.badgeKey === 'live') return 'Live';
        if (item.badgeKey === 'notifications' && pendingNotifications > 0) return String(pendingNotifications);
        return null;
    };

    const isItemAllowed = (moduleId: string) => {
        if (!staff?.role) return false;
        return staffCanAccessModule({ role: staff.role }, activePermissions, moduleId);
    };

    return (
        <aside className={clsx(
            "fixed inset-y-0 left-0 z-50 w-64 bg-hm-paper text-hm-ink transition-transform duration-[var(--hm-dur-med)] ease-hm-out lg:static lg:inset-0 flex flex-col border-r border-hm-rule shadow-sm",
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
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

            <nav className="flex-1 overflow-y-auto py-5 space-y-6 px-3">
                {menuGroups.map((group) => {
                    const filteredItems = group.items.filter((i) => isItemAllowed(i.id));
                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={group.title} className="space-y-1">
                            <h4 className="px-3 text-[10px] font-bold text-hm-muted uppercase tracking-wider mb-2">
                                {group.title}
                            </h4>
                            {filteredItems.map((item) => {
                                const Icon = MODULE_ICONS[item.id] ?? FileText;
                                const isActive = isNavItemActive(pathname, item.href);
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
                                        <div className="flex items-center min-w-0">
                                            <Icon className={clsx(
                                                'mr-2.5 h-4 w-4 shrink-0 transition-colors',
                                                isActive ? 'text-hm-accent-ink' : 'text-hm-muted group-hover:text-hm-ink'
                                            )} />
                                            <span className="truncate">{item.name}</span>
                                        </div>
                                        {getBadge(item) && (
                                            <span className={clsx(
                                                'px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full shrink-0 ml-1',
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

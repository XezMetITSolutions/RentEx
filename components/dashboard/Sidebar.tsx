"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, CalendarClock, CreditCard, Settings, LogOut, User } from "lucide-react";

const navigation = [
    { name: "Genel Bakış", href: "/dashboard", icon: LayoutDashboard },
    { name: "Kiralamalarım", href: "/dashboard/rentals", icon: Car },
    { name: "Rezervasyonlar", href: "/dashboard/reservations", icon: CalendarClock },
    { name: "Ödemeler", href: "/dashboard/payments", icon: CreditCard },
    { name: "Profil Ayarları", href: "/dashboard/profile", icon: User },
    { name: "Ayarlar", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-zinc-900 dark:text-zinc-100">
                    <span className="text-blue-600">Rent</span>Ex
                </Link>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-6">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                                }`}
                        >
                            <item.icon
                                className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400"
                                    }`}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10">
                    <LogOut className="h-5 w-5" />
                    Çıkış Yap
                </button>
            </div>
        </div>
    );
}

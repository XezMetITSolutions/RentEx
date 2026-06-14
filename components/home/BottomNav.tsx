"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Car, Phone, User } from "lucide-react";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: "Home",
            href: "/",
            icon: Home,
        },
        {
            label: "Flotte",
            href: "/fleet",
            icon: Car,
        },
        {
            label: "Kontakt",
            href: "/contact",
            icon: Phone,
        },
        {
            label: "Konto",
            href: "/login",
            icon: User,
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-black/85 backdrop-blur-md border-t border-gray-200 dark:border-white/10 px-6 py-2 shadow-2xl safe-bottom">
            <div className="flex items-center justify-between max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 active:scale-90"
                        >
                            <div
                                className={`p-2 rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                            <span
                                className={`text-[10px] font-bold tracking-wider ${
                                    isActive
                                        ? "text-red-500 dark:text-red-400 font-extrabold"
                                        : "text-gray-500 dark:text-gray-400"
                                }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

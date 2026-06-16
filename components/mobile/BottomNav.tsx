"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Car, CalendarClock, Phone, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Start", href: "/mobile", icon: Home },
    { name: "Fuhrpark", href: "/mobile/fleet", icon: Car },
    { name: "Buchungen", href: "/mobile/bookings", icon: CalendarClock },
    { name: "Kontakt", href: "/mobile/contact", icon: Phone },
    { name: "Konto", href: "/mobile/account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-white/10 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/mobile" && pathname?.startsWith(tab.href));
          const Icon = tab.icon;
          
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                isActive ? "text-[#E53935]" : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              <Icon className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

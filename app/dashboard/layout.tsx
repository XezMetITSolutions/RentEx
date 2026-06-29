"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import MobileHeaderWrapper from "@/components/dashboard/MobileHeaderWrapper";
import { X } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-900">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar / Drawer Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative flex w-64 animate-in slide-in-from-left duration-250">
                        <Sidebar />
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 -right-12 p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 shadow-md"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Click outside to close */}
                    <div className="flex-1" onClick={() => setIsSidebarOpen(false)}></div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <MobileHeaderWrapper />
                <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

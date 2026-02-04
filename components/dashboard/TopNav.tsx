"use client";

import { Bell, Menu, User } from "lucide-react";

export default function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
    return (
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hidden sm:inline-block">
                    Willkommen
                </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button className="relative rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950"></span>
                </button>

                <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800"></div>

                <button className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 pr-3 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <User className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mein Konto</span>
                </button>
            </div>
        </header>
    );
}

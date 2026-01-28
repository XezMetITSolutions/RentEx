'use client';

import { Bell, Search, UserCircle } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 px-6 backdrop-blur-md transition-all">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Übersicht</h2>
            </div>

            <div className="flex items-center gap-6">
                {/* Search - Visual Only for now */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Suchen..."
                        className="h-10 w-64 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-4 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-700 pl-6">
                    <ThemeToggle />

                    <button className="relative rounded-full p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
                    </button>

                    <button className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="h-9 w-9 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                            <UserCircle className="h-6 w-6" />
                        </div>
                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Admin User</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}

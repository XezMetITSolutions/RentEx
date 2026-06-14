'use client';

import { Bell, Search, UserCircle, Menu, LogOut, User, ChevronDown } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
    onMenuClick?: () => void;
    staff?: any;
}

export default function Header({ onMenuClick, staff }: HeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getInitials = (name: string) => {
        if (!name) return 'A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 px-4 md:px-6 backdrop-blur-md transition-all">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden text-gray-550 dark:text-gray-400"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">Übersicht</h2>
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

                    <Link 
                        href="/admin/notifications"
                        className="relative rounded-full p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
                    </Link>

                    {/* Profile Dropdown Container */}
                    <div ref={dropdownRef} className="relative">
                        <button 
                            onClick={() => setIsDropdownOpen(prev => !prev)}
                            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer select-none"
                        >
                            <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                                {staff ? getInitials(staff.name) : <UserCircle className="h-6 w-6" />}
                            </div>
                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{staff?.name ?? 'Admin User'}</p>
                                <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-550 leading-tight">{staff?.role ?? 'Administrator'}</p>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-900 mb-1">
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Angemeldet als</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">{staff?.name ?? 'Admin User'}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-mono">{staff?.email ?? ''}</p>
                                </div>

                                <Link
                                    href="/admin/staff"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-colors font-medium"
                                >
                                    <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span>Mein Profil</span>
                                </Link>

                                <div className="h-px bg-gray-100 dark:bg-gray-900 my-1" />

                                <form action="/api/admin/logout" method="POST">
                                    <button 
                                        type="submit" 
                                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors font-medium text-left cursor-pointer"
                                    >
                                        <LogOut className="h-4 w-4 shrink-0" />
                                        <span>Abmelden</span>
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

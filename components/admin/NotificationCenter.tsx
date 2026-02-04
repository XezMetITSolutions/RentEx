'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare, Check, X, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { clsx } from 'clsx';

interface Notification {
    id: number;
    type: 'email' | 'sms' | 'system' | 'alert' | string;
    title: string | null;
    message: string;
    status: 'unread' | 'read' | string;
    priority: 'low' | 'medium' | 'high' | string;
    createdAt: Date;
    actionUrl?: string;
}

interface NotificationCenterProps {
    initialNotifications: Notification[];
}

export default function NotificationCenter({ initialNotifications = [] }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => n.status === 'unread' || n.status === 'Pending').length;

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => n.status === 'unread' || n.status === 'Pending');

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, status: 'read' as const } : n)
        );
        // In a real app, you would call a Server Action here to update DB
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'email': return Mail;
            case 'sms': return MessageSquare;
            case 'alert': return AlertCircle;
            default: return Bell;
        }
    };

    const getPriorityColor = (priority: string = 'low') => {
        switch (priority.toLowerCase()) {
            case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'medium': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            default: return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Benachrichtigungen</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} ungelesene Nachrichten</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={clsx(
                                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            )}
                        >
                            Alle
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={clsx(
                                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                                filter === 'unread'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            )}
                        >
                            Ungelesen
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                Alle als gelesen markieren
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Keine Benachrichtigungen</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => {
                        const Icon = getIcon(notification.type);
                        const isUnread = notification.status === 'unread' || notification.status === 'Pending';

                        return (
                            <div
                                key={notification.id}
                                className={clsx(
                                    'px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors',
                                    isUnread && 'bg-blue-50/30 dark:bg-blue-900/10'
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={clsx(
                                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                                        getPriorityColor(notification.priority)
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title || 'Benachrichtigung'}</h4>
                                            {isUnread && (
                                                <span className="flex h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5"></span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{notification.message}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: de })}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {notification.actionUrl && (
                                                    <a
                                                        href={notification.actionUrl}
                                                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                                    >
                                                        Anzeigen →
                                                    </a>
                                                )}
                                                {isUnread && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                        title="Als gelesen markieren"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                    title="Löschen"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

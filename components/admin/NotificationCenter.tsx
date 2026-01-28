'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare, Check, X, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { clsx } from 'clsx';

interface Notification {
    id: number;
    type: 'email' | 'sms' | 'system' | 'alert';
    title: string;
    message: string;
    status: 'unread' | 'read';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    actionUrl?: string;
}

const mockNotifications: Notification[] = [
    {
        id: 1,
        type: 'alert',
        title: 'Wartung fällig',
        message: 'BMW 320i (34 AR 1234) benötigt Ölwechsel in 500 km',
        status: 'unread',
        priority: 'high',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        actionUrl: '/admin/fleet'
    },
    {
        id: 2,
        type: 'email',
        title: 'Neue Reservierung',
        message: 'Neue Buchung von Max Mustermann für Mercedes C200',
        status: 'unread',
        priority: 'medium',
        createdAt: new Date(Date.now() - 1000 * 60 * 120),
        actionUrl: '/admin/reservations'
    },
    {
        id: 3,
        type: 'system',
        title: 'Zahlung eingegangen',
        message: '€1,050.00 für Reservierung #0001 erhalten',
        status: 'read',
        priority: 'low',
        createdAt: new Date(Date.now() - 1000 * 60 * 180),
    },
    {
        id: 4,
        type: 'sms',
        title: 'Erinnerung versendet',
        message: 'Rückgabe-Erinnerung an Ahmet Yılmaz gesendet',
        status: 'read',
        priority: 'low',
        createdAt: new Date(Date.now() - 1000 * 60 * 240),
    },
];

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => n.status === 'unread');

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, status: 'read' as const } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'email': return Mail;
            case 'sms': return MessageSquare;
            case 'alert': return AlertCircle;
            default: return Bell;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                            <Bell className="h-5 w-5 text-blue-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Benachrichtigungen</h3>
                            <p className="text-sm text-gray-500">{unreadCount} ungelesene Nachrichten</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={clsx(
                                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                        >
                            Alle
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={clsx(
                                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                                filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                        >
                            Ungelesen
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Alle als gelesen markieren
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">Keine Benachrichtigungen</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => {
                        const Icon = getIcon(notification.type);
                        return (
                            <div
                                key={notification.id}
                                className={clsx(
                                    'px-6 py-4 hover:bg-gray-50/50 transition-colors',
                                    notification.status === 'unread' && 'bg-blue-50/30'
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
                                            <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                                            {notification.status === 'unread' && (
                                                <span className="flex h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5"></span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: de })}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {notification.actionUrl && (
                                                    <a
                                                        href={notification.actionUrl}
                                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                                    >
                                                        Anzeigen →
                                                    </a>
                                                )}
                                                {notification.status === 'unread' && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                        title="Als gelesen markieren"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare, Check, X, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { clsx } from 'clsx';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification as deleteNotificationAction } from '@/app/actions/admin';

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

    const markAsRead = async (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, status: 'read' as const } : n)
        );
        await markNotificationAsRead(id);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
        await markAllNotificationsAsRead();
    };

    const deleteNotification = async (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        await deleteNotificationAction(id);
    };

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'email': return Mail;
            case 'sms': return MessageSquare;
            case 'alert': return AlertCircle;
            default: return Bell;
        }
    };

    return (
        <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden text-hm-ink">
            <div className="border-b border-hm-rule px-6 py-4 bg-hm-paper">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-hm-accent font-mono text-[9px] font-bold text-hm-accent-ink">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="hm-display text-base font-bold text-hm-ink tracking-tight">Nachrichtenverlauf</h3>
                            <p className="text-[11px] font-mono text-hm-muted uppercase tracking-wider">{unreadCount} ungelesene Mitteilungen</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-hm-paper-2 rounded-[var(--hm-radius-input)] p-1 border border-hm-rule font-mono text-xs">
                            <button
                                onClick={() => setFilter('all')}
                                className={clsx(
                                    'px-3 py-1 font-semibold uppercase tracking-wider rounded-[calc(var(--hm-radius-input)-2px)] transition-all',
                                    filter === 'all'
                                        ? 'bg-hm-paper text-hm-ink shadow-xs border border-hm-rule'
                                        : 'text-hm-muted hover:text-hm-ink'
                                )}
                            >
                                Alle
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={clsx(
                                    'px-3 py-1 font-semibold uppercase tracking-wider rounded-[calc(var(--hm-radius-input)-2px)] transition-all',
                                    filter === 'unread'
                                        ? 'bg-hm-paper text-hm-ink shadow-xs border border-hm-rule'
                                        : 'text-hm-muted hover:text-hm-ink'
                                )}
                            >
                                Ungelesen
                            </button>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted hover:text-hm-accent transition-colors"
                            >
                                Alle als gelesen markieren
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="divide-y divide-hm-rule max-h-[640px] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Bell className="h-10 w-10 text-hm-muted/40 mb-3" />
                        <p className="text-xs font-mono uppercase tracking-wider text-hm-muted">Keine Benachrichtigungen vorhanden</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => {
                        const Icon = getIcon(notification.type);
                        const isUnread = notification.status === 'unread' || notification.status === 'Pending';

                        return (
                            <div
                                key={notification.id}
                                className={clsx(
                                    'px-6 py-4 hover:bg-hm-paper-2/50 transition-colors',
                                    isUnread && 'bg-hm-accent/5'
                                )}
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className={clsx(
                                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--hm-radius-input)] border',
                                        isUnread ? 'bg-hm-accent/10 text-hm-accent border-hm-accent/20' : 'bg-hm-paper-2 text-hm-muted border-hm-rule'
                                    )}>
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="text-xs font-bold text-hm-ink tracking-tight">
                                                {notification.title || 'Systemnachricht'}
                                            </h4>
                                            {isUnread && (
                                                <span className="flex h-2 w-2 rounded-full bg-hm-accent flex-shrink-0 mt-1"></span>
                                            )}
                                        </div>

                                        <p className="text-xs text-hm-ink-2 mb-2 leading-relaxed">{notification.message}</p>

                                        <div className="flex items-center justify-between font-mono text-[11px]">
                                            <div className="flex items-center gap-1.5 text-hm-muted">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: de })}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {notification.actionUrl && (
                                                    <a
                                                        href={notification.actionUrl}
                                                        className="text-hm-muted hover:text-hm-accent uppercase tracking-wider font-semibold transition-colors"
                                                    >
                                                        Details →
                                                    </a>
                                                )}
                                                {isUnread && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-1 text-hm-muted hover:text-emerald-600 transition-colors"
                                                        title="Als gelesen markieren"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-1 text-hm-muted hover:text-red-600 transition-colors"
                                                    title="Löschen"
                                                >
                                                    <X className="h-3.5 w-3.5" />
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

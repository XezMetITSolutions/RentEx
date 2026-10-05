/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
import prisma from '@/lib/prisma';
import NotificationCenter from '@/components/admin/NotificationCenter';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
    const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    const serializedNotifications = notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.subject || 'Systemnachricht',
        message: n.message,
        status: n.status === 'Pending' ? 'unread' : 'read',
        priority: 'medium',
        createdAt: new Date(n.createdAt),
        actionUrl: n.relatedType === 'Rental' ? `/admin/reservations` : undefined
    }));

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            System · Benachrichtigungen & Ereignisse
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Benachrichtigungszentrale
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Echtzeitmeldungen zu Buchungen, Check-Ins, Systemereignissen und Kundensupport
                    </p>
                </div>
            </div>

            <NotificationCenter initialNotifications={JSON.parse(JSON.stringify(serializedNotifications))} />
        </div>
    );
}

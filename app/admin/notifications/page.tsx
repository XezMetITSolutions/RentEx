import prisma from '@/lib/prisma';
import NotificationCenter from '@/components/admin/NotificationCenter';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
    const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    // Transform Prisma data to component interface
    const serializedNotifications = notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.subject || 'Systemnachricht',
        message: n.message,
        // Map 'Pending' status in DB to 'unread' in UI logic if needed
        status: n.status === 'Pending' ? 'unread' : 'read',
        priority: 'medium', // Default priority as it's not in DB yet
        createdAt: new Date(n.createdAt), // Ensure date object
        actionUrl: n.relatedType === 'Rental' ? `/admin/reservations` : undefined
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Benachrichtigungen</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verwalten Sie alle Systembenachrichtigungen</p>
            </div>

            <NotificationCenter initialNotifications={JSON.parse(JSON.stringify(serializedNotifications))} />
        </div>
    );
}

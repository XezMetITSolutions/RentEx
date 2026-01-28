import NotificationCenter from '@/components/admin/NotificationCenter';

export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Benachrichtigungen</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verwalten Sie alle Systembenachrichtigungen</p>
            </div>

            <NotificationCenter />
        </div>
    );
}

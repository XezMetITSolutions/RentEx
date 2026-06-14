import ActivityLogPanel from '@/components/admin/ActivityLogPanel';
import { getActivityLogs } from '@/app/actions/admin';
import { getAdminSession } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';

export default async function ActivityPage() {
    const staff = await getAdminSession();

    if (!staff) {
        redirect('/admin/login');
        return null;
    }

    if (staff.role !== 'ADMINISTRATOR') {
        redirect('/admin');
        return null;
    }

    const logs = await getActivityLogs();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aktivitätsprotokoll</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Überwachen Sie alle Systemaktivitäten und Änderungen</p>
            </div>

            <ActivityLogPanel initialLogs={logs} />
        </div>
    );
}

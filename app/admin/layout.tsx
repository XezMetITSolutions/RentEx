import { getSidebarStats } from '@/lib/adminStats';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { getAdminSession } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [stats, staff] = await Promise.all([
        getSidebarStats(),
        getAdminSession()
    ]);

    if (!staff) {
        redirect('/admin/login');
    }

    return (
        <AdminLayoutWrapper stats={stats} staff={staff}>
            {children}
        </AdminLayoutWrapper>
    );
}

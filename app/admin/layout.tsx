import { getSidebarStats } from '@/lib/adminStats';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { getAdminSession } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const EMPTY_STATS = { activeRentals: 0, todayRevenue: 0, pendingNotifications: 0 };

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = (await headers()).get('x-pathname') ?? '';
    const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login/');

    const staff = await getAdminSession();
    if (!staff) {
        if (!isLoginPage) redirect('/admin/login');
        return <AdminLayoutWrapper stats={EMPTY_STATS} staff={null}>{children}</AdminLayoutWrapper>;
    }

    const stats = await getSidebarStats();

    return (
        <AdminLayoutWrapper stats={stats} staff={staff}>
            {children}
        </AdminLayoutWrapper>
    );
}

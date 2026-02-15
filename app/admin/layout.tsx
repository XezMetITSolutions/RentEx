import { getSidebarStats } from '@/lib/adminStats';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const stats = await getSidebarStats();

    return (
        <AdminLayoutWrapper stats={stats}>
            {children}
        </AdminLayoutWrapper>
    );
}

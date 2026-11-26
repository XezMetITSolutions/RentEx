import { getAdminSession, requireAdmin } from '@/lib/adminAuth';
import AdminProfileView from './AdminProfileView';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
    const staff = await getAdminSession();
    if (!staff) {
        redirect('/admin/login');
    }

    return (
        <AdminProfileView
            staff={{
                id: staff.id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                location: staff.location?.name || 'Zentrale (Alle Standorte)',
                twoFactorEnabled: staff.twoFactorEnabled,
                createdAt: staff.createdAt ? staff.createdAt.toISOString() : null,
            }}
        />
    );
}

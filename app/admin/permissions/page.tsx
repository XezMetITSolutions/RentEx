import { getAdminSession } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import { ALL_ADMIN_MODULES, getRolePermissions } from '@/lib/rolePermissions';
import PermissionsManager from '@/components/admin/PermissionsManager';

export const dynamic = 'force-dynamic';

export default async function PermissionsPage() {
    const staff = await getAdminSession();
    if (!staff || (staff.role !== 'SUPERADMIN' && staff.role !== 'ADMINISTRATOR')) {
        redirect('/admin');
    }

    const permissions = await getRolePermissions();

    return (
        <PermissionsManager
            initialPermissions={permissions}
            modules={ALL_ADMIN_MODULES}
        />
    );
}

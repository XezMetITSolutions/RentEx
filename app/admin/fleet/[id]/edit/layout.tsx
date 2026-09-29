import { guardAdminArea } from '@/lib/adminAccess';

/** Adding or editing cars is for branch managers and administrators only. */
export default async function FleetManagementLayout({ children }: { children: React.ReactNode }) {
    await guardAdminArea('fleet-management');
    return children;
}

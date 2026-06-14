import { getAdminSession } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import CheckInSetupClient from './CheckInSetupClient';

export default async function CheckInSetupPage() {
    const staff = await getAdminSession();
    if (!staff) {
        redirect('/admin/login');
        return null;
    }
    if (staff.role !== 'ADMINISTRATOR') {
        redirect('/admin');
        return null;
    }
    return <CheckInSetupClient />;
}

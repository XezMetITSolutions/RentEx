import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';
import TwoFactorView from './TwoFactorView';

export const dynamic = 'force-dynamic';

export default async function Admin2FASettingsPage() {
    const session = await getAdminSession();
    if (!session) redirect('/admin/login');

    const staff = await prisma.staff.findUnique({
        where: { id: session.id },
        select: { twoFactorEnabled: true, twoFactorVerifiedAt: true, email: true },
    });

    return (
        <TwoFactorView
            email={staff?.email ?? ''}
            enabled={staff?.twoFactorEnabled ?? false}
            verifiedAt={staff?.twoFactorVerifiedAt?.toISOString() ?? null}
        />
    );
}

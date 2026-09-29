import prisma from '@/lib/prisma';
import SettingsView from '@/components/admin/SettingsView';
import { guardAdminArea } from '@/lib/adminAccess';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    // Admin-only (the /admin/settings/2fa page stays open to every staff member).
    await guardAdminArea('settings');
    const settingsList = await prisma.systemSettings.findMany();

    // Convert list to key-value object
    const settings: Record<string, string> = {};
    settingsList.forEach(s => {
        settings[s.key] = s.value;
    });

    return <SettingsView initialSettings={settings} />;
}
 

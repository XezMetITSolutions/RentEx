import prisma from '@/lib/prisma';
import SettingsView from '@/components/admin/SettingsView';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const settingsList = await prisma.systemSettings.findMany();

    // Convert list to key-value object
    const settings: Record<string, string> = {};
    settingsList.forEach(s => {
        settings[s.key] = s.value;
    });

    return <SettingsView initialSettings={settings} />;
}
 
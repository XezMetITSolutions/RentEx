import { guardAdminArea } from '@/lib/adminAccess';

/** Role check for this admin area; the sidebar alone only hides the link. */
export default async function AreaLayout({ children }: { children: React.ReactNode }) {
    await guardAdminArea('reservations');
    return children;
}

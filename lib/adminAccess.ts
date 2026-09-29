import { redirect } from 'next/navigation';
import { getAdminSession } from './adminAuth';
import { canAccessAdminArea, type AdminArea } from './staffRoles';

/**
 * Server-side guard for an admin area. Used by the area layouts so a role
 * cannot open a page just by typing its URL (the sidebar only hides links).
 */
export async function guardAdminArea(area: AdminArea): Promise<void> {
    const staff = await getAdminSession();
    if (!staff) redirect('/admin/login');
    if (!canAccessAdminArea(staff.role, area)) redirect('/admin?kein-zugriff=1');
}

/**
 * Same check for server actions and API routes. Returns the staff member, or
 * null when not logged in or not allowed.
 */
export async function getAdminForArea(area: AdminArea) {
    const staff = await getAdminSession();
    if (!staff || !canAccessAdminArea(staff.role, area)) return null;
    return staff;
}

/** Throwing variant for server actions. */
export async function requireAdminArea(area: AdminArea) {
    const staff = await getAdminForArea(area);
    if (!staff) throw new Error('Nicht autorisiert');
    return staff;
}

import { redirect } from 'next/navigation';

export default function CheckOutRedirectPage() {
    // Check-Out station is now integrated into the central Reservations workbench
    redirect('/admin/reservations');
}

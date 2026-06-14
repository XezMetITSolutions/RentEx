import prisma from '@/lib/prisma';
import ReservationsPanel from '@/components/admin/ReservationsPanel';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

async function getRentals(locationId?: number | null) {
    const where: any = {};
    if (locationId) {
        where.pickupLocationId = locationId;
    }

    const rentals = await prisma.rental.findMany({
        where,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            car: true,
            customer: true
        }
    });
    
    // Map Decimal/Date objects if needed, or serialize cleanly. 
    // totalAmount might be Prisma.Decimal, convert to number or string.
    return rentals.map(rental => ({
        ...rental,
        totalAmount: Number(rental.totalAmount),
        startDate: rental.startDate.toISOString(),
        endDate: rental.endDate.toISOString(),
        createdAt: rental.createdAt.toISOString(),
        updatedAt: rental.updatedAt.toISOString(),
    }));
}

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    const resolvedSearchParams = await searchParams;
    const staff = await getAdminSession();
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR';
    
    const rentals = await getRentals(isRestricted ? staff?.locationId : undefined);
    const view = resolvedSearchParams.view || 'list';

    return <ReservationsPanel initialRentals={rentals} initialView={view} />;
}

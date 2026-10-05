/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
import prisma from '@/lib/prisma';
import ReservationsManager, { RentalItem } from '@/components/admin/ReservationsManager';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

async function getRentals(locationId?: number | null): Promise<RentalItem[]> {
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
            car: {
                select: {
                    id: true,
                    brand: true,
                    model: true,
                    plate: true,
                    imageUrl: true,
                }
            },
            customer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                }
            },
            pickupLocation: {
                select: {
                    id: true,
                    name: true,
                }
            },
            returnLocation: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });

    return rentals.map(r => ({
        ...r,
        totalAmount: Number(r.totalAmount)
    }));
}

export default async function ReservationsPage({
    searchParams
}: {
    searchParams: Promise<{ view?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const staff = await getAdminSession();
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR' && staff.role !== 'SUPERADMIN';
    
    const rentals = await getRentals(isRestricted ? staff?.locationId : undefined);

    return (
        <ReservationsManager 
            initialRentals={rentals} 
            initialView={resolvedSearchParams.view} 
        />
    );
}

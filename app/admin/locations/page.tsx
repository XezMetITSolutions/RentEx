import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';
import { LocationsManager, LocationItem } from '@/components/admin/LocationsManager';

export const dynamic = 'force-dynamic';

async function getLocations(locationId?: number | null): Promise<LocationItem[]> {
    const where: any = {};
    if (locationId) {
        where.id = locationId;
    }

    const locations = await prisma.location.findMany({
        where,
        include: {
            cars: { select: { id: true, status: true } },
            homeCars: { select: { id: true, status: true } },
            staff: { select: { id: true, name: true, role: true } },
            _count: {
                select: {
                    pickups: true,
                    returns: true,
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });

    return locations.map(loc => {
        const uniqueCarsMap = new Map<number, { id: number; status: string }>();
        loc.cars.forEach(c => uniqueCarsMap.set(c.id, c));
        loc.homeCars.forEach(c => uniqueCarsMap.set(c.id, c));
        const uniqueCars = Array.from(uniqueCarsMap.values());

        const availableVehicles = uniqueCars.filter(c => c.status === 'Active').length;
        const rentedVehicles = uniqueCars.filter(c => c.status === 'Rented').length;

        return {
            id: loc.id,
            name: loc.name,
            code: loc.code,
            address: loc.address,
            city: loc.city,
            country: loc.country,
            phone: loc.phone,
            email: loc.email,
            latitude: loc.latitude,
            longitude: loc.longitude,
            openingTime: loc.openingTime,
            closingTime: loc.closingTime,
            isOpenSundays: loc.isOpenSundays,
            status: loc.status,
            totalVehicles: uniqueCars.length,
            availableVehicles,
            rentedVehicles,
            pickupsCount: loc._count?.pickups ?? 0,
            returnsCount: loc._count?.returns ?? 0,
            staff: loc.staff,
        };
    });
}

export default async function LocationsPage() {
    const staff = await getAdminSession();
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR' && staff.role !== 'SUPERADMIN';
    const locations = await getLocations(isRestricted ? staff?.locationId : undefined);
    const isSup = staff?.role === 'ADMINISTRATOR' || staff?.role === 'SUPERADMIN';

    return (
        <LocationsManager
            initialLocations={locations}
            isSup={isSup}
            isRestricted={Boolean(isRestricted)}
        />
    );
}

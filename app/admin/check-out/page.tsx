/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';
import Link from 'next/link';
import { PackageCheck, ArrowRight } from 'lucide-react';
import { getAdminSession } from '@/lib/adminAuth';
import CheckOutManager, { CheckOutRentalItem } from '@/components/admin/CheckOutManager';

export const dynamic = 'force-dynamic';

function serializeRental(r: any): CheckOutRentalItem {
    return {
        id: r.id,
        status: r.status,
        startDate: r.startDate.toISOString(),
        endDate: r.endDate.toISOString(),
        actualReturnDate: r.actualReturnDate ? r.actualReturnDate.toISOString() : null,
        pickupMileage: r.pickupMileage,
        returnMileage: r.returnMileage,
        includedKm: r.includedKm,
        fuelLevelPickup: r.fuelLevelPickup,
        fuelLevelReturn: r.fuelLevelReturn,
        fuelCharge: r.fuelCharge ? Number(r.fuelCharge) : null,
        damageReport: r.damageReport,
        notes: r.notes,
        contractNumber: r.contractNumber,
        totalAmount: Number(r.totalAmount || 0),
        car: {
            id: r.car.id,
            brand: r.car.brand,
            model: r.car.model,
            plate: r.car.plate,
            currentMileage: r.car.currentMileage || 0,
            fuelType: r.car.fuelType,
            imageUrl: r.car.imageUrl,
        },
        customer: {
            id: r.customer.id,
            firstName: r.customer.firstName,
            lastName: r.customer.lastName,
            email: r.customer.email,
            phone: r.customer.phone,
        },
        pickupLocation: r.pickupLocation,
        returnLocation: r.returnLocation,
    };
}

export default async function CheckOutPage() {
    const staff = await getAdminSession();
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR' && staff.role !== 'SUPERADMIN';
    const locationId = isRestricted ? staff?.locationId : undefined;

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // Fetch active rentals (for today, overdue, and upcoming returns)
    const [activeRentals, completedRentals] = await Promise.all([
        prisma.rental.findMany({
            where: {
                status: 'Active',
                ...(locationId ? { pickupLocationId: locationId } : {}),
            },
            orderBy: { endDate: 'asc' },
            include: {
                car: {
                    select: {
                        id: true,
                        brand: true,
                        model: true,
                        plate: true,
                        currentMileage: true,
                        fuelType: true,
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
                    select: { id: true, name: true }
                },
                returnLocation: {
                    select: { id: true, name: true }
                }
            },
        }),
        prisma.rental.findMany({
            where: {
                status: 'Completed',
                actualReturnDate: {
                    gte: todayStart,
                    lte: todayEnd,
                },
                ...(locationId ? { pickupLocationId: locationId } : {}),
            },
            orderBy: { actualReturnDate: 'desc' },
            include: {
                car: {
                    select: {
                        id: true,
                        brand: true,
                        model: true,
                        plate: true,
                        currentMileage: true,
                        fuelType: true,
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
                    select: { id: true, name: true }
                },
                returnLocation: {
                    select: { id: true, name: true }
                }
            },
        })
    ]);

    const serializedActive = activeRentals.map(serializeRental);
    const serializedCompleted = completedRentals.map(serializeRental);

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Operativ · Rückgabe
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink flex items-center gap-3">
                        <PackageCheck className="h-8 w-8 text-hm-accent" />
                        Check-Out Station
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Fahrzeugrücknahme · Endkontrolle, Tacho & Protokollierung
                    </p>
                </div>
                <Link
                    href="/admin/reservations"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted hover:text-hm-accent transition-colors"
                >
                    <span>Alle Reservierungen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Interactive Manager */}
            <CheckOutManager
                rentals={serializedActive}
                completedToday={serializedCompleted}
            />
        </div>
    );
}

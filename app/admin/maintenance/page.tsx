/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
import prisma from '@/lib/prisma';
import MaintenanceManager, {
    MaintenanceRecordItem,
    CarAlertItem,
    SimpleCarOption
} from '@/components/admin/MaintenanceManager';
import Link from 'next/link';
import { Wrench, Plus, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

function serializeRecord(r: any): MaintenanceRecordItem {
    return {
        id: r.id,
        carId: r.carId,
        maintenanceType: r.maintenanceType,
        description: r.description,
        cost: r.cost ? Number(r.cost) : null,
        mileage: r.mileage,
        performedBy: r.performedBy,
        performedDate: r.performedDate.toISOString(),
        nextDueDate: r.nextDueDate ? r.nextDueDate.toISOString() : null,
        nextDueMileage: r.nextDueMileage,
        invoiceNumber: r.invoiceNumber,
        invoiceUrl: r.invoiceUrl,
        notes: r.notes,
        createdAt: r.createdAt.toISOString(),
        car: {
            id: r.car.id,
            brand: r.car.brand,
            model: r.car.model,
            plate: r.car.plate,
            status: r.car.status,
            currentMileage: r.car.currentMileage,
            imageUrl: r.car.imageUrl,
        }
    };
}

function serializeCarAlert(c: any): CarAlertItem {
    return {
        id: c.id,
        brand: c.brand,
        model: c.model,
        plate: c.plate,
        status: c.status,
        currentMileage: c.currentMileage,
        nextInspection: c.nextInspection ? c.nextInspection.toISOString() : null,
        nextOilChange: c.nextOilChange ? c.nextOilChange.toISOString() : null,
        nextServiceDate: c.nextServiceDate ? c.nextServiceDate.toISOString() : null,
    };
}

export default async function MaintenancePage() {
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [rawRecords, rawCarsNeedingMaintenance, rawAllCars] = await Promise.all([
        prisma.maintenanceRecord.findMany({
            include: {
                car: true
            },
            orderBy: {
                performedDate: 'desc'
            }
        }),
        prisma.car.findMany({
            where: {
                OR: [
                    { nextOilChange: { lte: in30Days } },
                    { nextServiceDate: { lte: in30Days } },
                    { nextInspection: { lte: in30Days } },
                ]
            },
            orderBy: {
                nextInspection: 'asc'
            }
        }),
        prisma.car.findMany({
            select: {
                id: true,
                brand: true,
                model: true,
                plate: true,
                currentMileage: true,
                status: true
            },
            orderBy: {
                brand: 'asc'
            }
        })
    ]);

    const records = rawRecords.map(serializeRecord);
    const carsNeedingMaintenance = rawCarsNeedingMaintenance.map(serializeCarAlert);
    const allCars: SimpleCarOption[] = rawAllCars.map(c => ({
        id: c.id,
        brand: c.brand,
        model: c.model,
        plate: c.plate,
        currentMileage: c.currentMileage,
        status: c.status
    }));

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Flotte · Werkstatt & Service
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink flex items-center gap-3">
                        <Wrench className="w-7 h-7 text-hm-accent" />
                        Wartungsverwaltung
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Prüftermine (§57a TÜV), Serviceintervalle, Werkstattbelege & Reparaturen
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/fleet"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted hover:text-hm-accent transition-colors"
                    >
                        <span>Fahrzeugflotte</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Interactive Manager */}
            <MaintenanceManager
                records={records}
                carsNeedingMaintenance={carsNeedingMaintenance}
                allCars={allCars}
            />
        </div>
    );
}

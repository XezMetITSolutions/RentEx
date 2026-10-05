'use server';

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getRolePermissions } from "@/lib/rolePermissions.server";
import { staffCanAccessModule } from "@/lib/rolePermissions";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export interface CheckOutInput {
    returnMileage: number;
    fuelLevelReturn?: string;
    fuelCharge?: number;
    damageNotes?: string;
    extraCharges?: number;
    extraChargesNote?: string;
    notes?: string;
}

export async function performCheckOut(rentalId: number, data: CheckOutInput) {
    const staff = await requireAdmin();
    const permissions = await getRolePermissions();
    const canCheckOut =
        staffCanAccessModule(staff, permissions, 'Check-Out') ||
        staffCanAccessModule(staff, permissions, 'Reservierungen');

    if (!canCheckOut) {
        throw new Error('Keine Berechtigung für dieses Modul');
    }

    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { customer: true, car: true }
    });

    if (!rental) {
        throw new Error("Mietvertrag nicht gefunden");
    }

    const returnKm = Math.round(Number(data.returnMileage));
    const pickupKm = Math.round(Number(rental.pickupMileage || rental.car.currentMileage || 0));

    if (returnKm < pickupKm) {
        throw new Error(
            `Der Rückgabe-Kilometerstand (${returnKm.toLocaleString('de-DE')} km) darf nicht geringer sein als der Start-Kilometerstand (${pickupKm.toLocaleString('de-DE')} km).`
        );
    }

    const usedKm = returnKm - pickupKm;
    const includedKm = Number(rental.includedKm || 0);
    const surplusKm = includedKm > 0 ? includedKm - usedKm : 0;

    // KM bonus calculation if surplus
    if (surplusKm > 0) {
        await prisma.kmBalance.upsert({
            where: { customerId: rental.customerId },
            update: { balance: { increment: surplusKm } },
            create: { customerId: rental.customerId, balance: surplusKm }
        });

        await prisma.kmTransfer.create({
            data: {
                fromId: rental.customerId,
                toId: rental.customerId,
                amount: surplusKm,
                note: `Automatische Rückgabe-Gutschrift aus Vertrag #${rental.contractNumber || rental.id} (${includedKm} km inkludiert - ${usedKm} km gefahren)`
            }
        });
    }

    // Damage record if notes provided
    if (data.damageNotes && data.damageNotes.trim()) {
        await prisma.damageRecord.create({
            data: {
                carId: rental.carId,
                rentalId: rental.id,
                type: 'Rückgabe-Feststellung',
                description: data.damageNotes.trim(),
                severity: 'Medium',
                status: 'open',
                locationOnCar: 'Prüfung bei Rücknahme',
            }
        });
    }

    // Prepare note strings
    const existingDamage = rental.damageReport ? `${rental.damageReport}\n` : '';
    const updatedDamageReport = data.damageNotes?.trim()
        ? `${existingDamage}[Rückgabe ${new Date().toLocaleDateString('de-DE')}]: ${data.damageNotes.trim()}`
        : rental.damageReport;

    const existingNotes = rental.notes ? `${rental.notes}\n` : '';
    const updatedNotes = data.notes?.trim()
        ? `${existingNotes}[Rückgabe-Notiz]: ${data.notes.trim()}`
        : rental.notes;

    // Update rental to Completed
    await prisma.rental.update({
        where: { id: rentalId },
        data: {
            status: 'Completed',
            returnMileage: returnKm,
            fuelLevelReturn: data.fuelLevelReturn || undefined,
            fuelCharge: data.fuelCharge ? new Prisma.Decimal(data.fuelCharge) : undefined,
            extraCharges: data.extraCharges ? new Prisma.Decimal(data.extraCharges) : undefined,
            extraChargesNote: data.extraChargesNote || undefined,
            damageReport: updatedDamageReport,
            notes: updatedNotes,
            actualReturnDate: new Date(),
        }
    });

    // Update car status to 'Active' (Available) and update currentMileage
    await prisma.car.update({
        where: { id: rental.carId },
        data: {
            status: 'Active',
            currentMileage: returnKm
        }
    });

    revalidatePath('/admin/check-out');
    revalidatePath('/admin/reservations');
    revalidatePath(`/admin/reservations/${rentalId}`);
    revalidatePath('/admin/fleet');
    revalidatePath('/admin/km-transfer');

    return {
        success: true,
        usedKm,
        surplusKm
    };
}

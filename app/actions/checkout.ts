'use server';

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getRolePermissions } from "@/lib/rolePermissions.server";
import { staffCanAccessModule } from "@/lib/rolePermissions";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { RENTAL_TERMS } from "@/lib/config";
import { settleReturnMileage } from "@/lib/returnSettlement";
import { assertReturnMileage } from "@/lib/rentalGuards";

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
    if (rental.status === 'Completed') {
        throw new Error('Diese Miete wurde bereits zurückgenommen.');
    }
    if (rental.status !== 'Active') {
        throw new Error('Nur eine laufende Miete kann zurückgenommen werden.');
    }

    const pickupKm = Math.round(Number(rental.pickupMileage || rental.car.currentMileage || 0));
    const returnKm = assertReturnMileage(Number(data.returnMileage), pickupKm, rental.totalDays);

    const settlement = await settleReturnMileage(rental, returnKm);
    const { usedKm, surplusKm } = settlement;

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

    const notFull = !!data.fuelLevelReturn && data.fuelLevelReturn !== '100%' && data.fuelLevelReturn.toLowerCase() !== 'full';
    const fuelCharge = data.fuelCharge != null
        ? data.fuelCharge
        : notFull ? RENTAL_TERMS.REFUEL_FEE_EUR : 0;
    const kmMarker = `rental:${rental.id}:km`;
    const kmAlreadyBilled = (rental.extraChargesNote || '').includes(kmMarker);
    const kmCharge = kmAlreadyBilled ? 0 : settlement.kmCharge;
    const staffExtras = data.extraCharges ?? 0;
    const extraCharges = Number(rental.extraCharges || 0) + staffExtras + kmCharge;
    const kmNote = kmCharge > 0
        ? `${kmMarker} Mehrkilometer: ${settlement.overKm} km, davon ${settlement.balanceUsed} aus Guthaben, €${kmCharge.toFixed(2)}`
        : '';
    const extraChargesNote = [rental.extraChargesNote, data.extraChargesNote, kmNote].filter(Boolean).join('\n') || undefined;
    const moneyDue = kmCharge + (fuelCharge || 0) + staffExtras;
    const paymentStatus = moneyDue > 0 && rental.paymentStatus === 'Paid' ? 'Partial' : rental.paymentStatus;

    // Update rental to Completed
    await prisma.rental.update({
        where: { id: rentalId },
        data: {
            status: 'Completed',
            returnMileage: returnKm,
            fuelLevelReturn: data.fuelLevelReturn || undefined,
            fuelCharge: fuelCharge ? new Prisma.Decimal(fuelCharge) : undefined,
            extraCharges: extraCharges ? new Prisma.Decimal(extraCharges) : undefined,
            extraChargesNote,
            damageReport: updatedDamageReport,
            notes: updatedNotes,
            actualReturnDate: new Date(),
            isOverdue: false,
            paymentStatus,
        }
    });

    const stillOut = await prisma.rental.count({
        where: { carId: rental.carId, status: 'Active', id: { not: rentalId } },
    });
    await prisma.car.update({
        where: { id: rental.carId },
        data: {
            status: stillOut > 0 ? 'Rented' : 'Active',
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
        surplusKm,
        overKm: settlement.overKm,
        kmCharge,
        balanceUsed: settlement.balanceUsed,
        fuelCharge,
    };
}

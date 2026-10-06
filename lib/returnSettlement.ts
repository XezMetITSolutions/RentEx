/**
 * One place for the kilometre account at return.
 * Unused included kilometres become balance. Kilometres over the included
 * amount are taken from that balance first, then billed at the car's rate.
 * A second call for the same rental does not credit or bill again.
 */
import prisma from '@/lib/prisma';

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface MileageSettlement {
    usedKm: number;
    surplusKm: number;
    overKm: number;
    /** Euros still owed after the kilometre balance was applied. */
    kmCharge: number;
    balanceUsed: number;
    alreadySettled: boolean;
}

export async function settleReturnMileage(rental: {
    id: number;
    customerId: number;
    contractNumber: string | null;
    pickupMileage: number | null;
    includedKm: number | null;
    car: { extraKmCost: unknown; currentMileage: number | null };
}, returnKm: number): Promise<MileageSettlement> {
    const pickupKm = Math.round(Number(rental.pickupMileage || rental.car.currentMileage || 0));
    const back = Math.round(returnKm);
    const usedKm = Math.max(0, back - pickupKm);
    const includedKm = Number(rental.includedKm || 0);
    const marker = `rental:${rental.id}:km-settle`;

    const prior = await prisma.kmTransfer.findFirst({
        where: { note: { contains: marker } },
        select: { id: true },
    });
    if (prior) {
        const note = await prisma.kmTransfer.findFirst({
            where: { note: { contains: marker } },
            select: { note: true },
        });
        const parsed = note?.note?.match(/€(\d+(?:\.\d+)?)/);
        return {
            usedKm,
            surplusKm: 0,
            overKm: 0,
            kmCharge: parsed ? Number(parsed[1]) : 0,
            balanceUsed: 0,
            alreadySettled: true,
        };
    }

    const surplusKm = includedKm > 0 ? Math.max(0, includedKm - usedKm) : 0;
    const overKm = includedKm > 0 ? Math.max(0, usedKm - includedKm) : 0;
    const rate = rental.car.extraKmCost != null ? Number(rental.car.extraKmCost) : 0;

    let balanceUsed = 0;
    let kmCharge = 0;

    if (surplusKm > 0) {
        await prisma.$transaction([
            prisma.kmBalance.upsert({
                where: { customerId: rental.customerId },
                update: { balance: { increment: surplusKm } },
                create: { customerId: rental.customerId, balance: surplusKm },
            }),
            prisma.kmTransfer.create({
                data: {
                    fromId: rental.customerId,
                    toId: rental.customerId,
                    amount: surplusKm,
                    note: `${marker} | Gutschrift Vertrag ${rental.contractNumber || rental.id}: ${includedKm} km inklusive, ${usedKm} km gefahren`,
                },
            }),
        ]);
    } else if (overKm > 0) {
        const balance = await prisma.kmBalance.findUnique({ where: { customerId: rental.customerId } });
        balanceUsed = Math.min(balance?.balance ?? 0, overKm);
        const billedKm = overKm - balanceUsed;
        kmCharge = rate > 0 ? round2(billedKm * rate) : 0;

        const writes = [];
        if (balanceUsed > 0) {
            writes.push(prisma.kmBalance.update({
                where: { customerId: rental.customerId },
                data: { balance: { decrement: balanceUsed } },
            }));
        }
        writes.push(prisma.kmTransfer.create({
            data: {
                fromId: rental.customerId,
                toId: rental.customerId,
                amount: balanceUsed > 0 ? -balanceUsed : 0,
                note: `${marker} | Mehrkilometer Vertrag ${rental.contractNumber || rental.id}: ${overKm} km über Inklusivleistung, ${balanceUsed} km aus Guthaben, €${kmCharge.toFixed(2)} berechnet`,
            },
        }));
        await prisma.$transaction(writes);
    }

    return { usedKm, surplusKm, overKm, kmCharge, balanceUsed, alreadySettled: false };
}

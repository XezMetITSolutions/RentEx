'use server';

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { cancelRental, completeRental, sendCancellationEmail } from "@/lib/bookingLifecycle";

const RENTAL_STATUSES = ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];
const PAYMENT_STATUSES = ['Pending', 'Partial', 'Paid', 'Refunded', 'Overdue'];

export async function updateRentalStatus(id: number, status: string, returnMileageOrFormData?: number | FormData) {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");
    if (!RENTAL_STATUSES.includes(status)) throw new Error("Ungültiger Status");

    let returnMileage: number | undefined;
    if (typeof returnMileageOrFormData === 'number') {
        returnMileage = returnMileageOrFormData;
    } else if (returnMileageOrFormData instanceof FormData) {
        const mileageStr = returnMileageOrFormData.get('returnMileage') as string;
        if (mileageStr) returnMileage = parseInt(mileageStr, 10);
    }

    const rental = await prisma.rental.findUnique({
        where: { id },
        include: { customer: true }
    });

    if (!rental) throw new Error("Rental not found");

    if (status === 'Completed') {
        const finalReturnMileage = returnMileage ?? (rental.returnMileage != null ? Number(rental.returnMileage) : null);
        if (finalReturnMileage == null || Number.isNaN(finalReturnMileage)) {
            throw new Error("KM-Stand bei Rückgabe fehlt");
        }

        await completeRental(id, { returnMileage: finalReturnMileage });
    } else if (status === 'Cancelled') {
        // Releases the coupon use and, for a handed-over car, the car itself.
        if (await cancelRental(id)) await sendCancellationEmail(id);
    } else if (status === 'Active') {
        await prisma.$transaction(async (tx) => {
            const activated = await tx.rental.updateMany({
                where: { id, status: { in: ['Pending', 'Confirmed'] } },
                data: { status: 'Active', checkInAt: rental.checkInAt ?? new Date() }
            });
            // The car is handed over, so it must no longer show as available.
            if (activated.count > 0) {
                await tx.car.update({ where: { id: rental.carId }, data: { status: 'Rented' } });
            }
        });
    } else {
        await prisma.rental.update({
            where: { id: id },
            data: { status }
        });
    }

    revalidatePath(`/admin/reservations/${id}`);
    revalidatePath('/admin/reservations');
    revalidatePath('/admin/km-transfer');
    revalidatePath('/admin/fleet');
}

export async function updatePaymentStatus(id: number, paymentStatus: string) {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");
    if (!PAYMENT_STATUSES.includes(paymentStatus)) throw new Error("Ungültiger Zahlungsstatus");
    await prisma.rental.update({
        where: { id },
        data: { paymentStatus }
    });
    revalidatePath(`/admin/reservations/${id}`);
}

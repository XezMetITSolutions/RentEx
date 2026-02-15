'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function extendRental(rentalId: number, newEndDate: string, additionalCost: number) {
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId }
    });

    if (!rental) throw new Error("Rental not found");

    const updatedEndDate = new Date(newEndDate);
    const oldEndDate = new Date(rental.endDate);

    // Calculate new total days
    const diffTime = Math.abs(updatedEndDate.getTime() - new Date(rental.startDate).getTime());
    const newTotalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    await prisma.rental.update({
        where: { id: rentalId },
        data: {
            endDate: updatedEndDate,
            totalDays: newTotalDays,
            totalAmount: Number(rental.totalAmount) + additionalCost
        }
    });

    revalidatePath(`/admin/reservations/${rentalId}`);
    revalidatePath('/admin/reservations');

    return { success: true };
}

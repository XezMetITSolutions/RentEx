'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateRentalStatus(id: number, status: string) {
    await prisma.rental.update({
        where: { id },
        data: { status }
    });
    revalidatePath(`/admin/reservations/${id}`);
    revalidatePath('/admin/reservations');
}

export async function updatePaymentStatus(id: number, paymentStatus: string) {
    await prisma.rental.update({
        where: { id },
        data: { paymentStatus }
    });
    revalidatePath(`/admin/reservations/${id}`);
}

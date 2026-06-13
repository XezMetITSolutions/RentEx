'use server';

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";

export async function updateRentalStatus(id: number, status: string, returnMileageOrFormData?: number | FormData) {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");

    let returnMileage: number | undefined;
    if (typeof returnMileageOrFormData === 'number') {
        returnMileage = returnMileageOrFormData;
    } else if (returnMileageOrFormData instanceof FormData) {
        const mileageStr = returnMileageOrFormData.get('returnMileage') as string;
        if (mileageStr) returnMileage = parseInt(mileageStr, 10);
    }

    const rental = await prisma.rental.findUnique({
        where: { id },
        include: { customer: true, car: true }
    });

    if (!rental) throw new Error("Rental not found");

    if (status === 'Completed') {
        const finalReturnMileage = returnMileage || Number(rental.returnMileage || 0);
        const usedKm = finalReturnMileage - Number(rental.pickupMileage || 0);
        const includedKm = Number(rental.includedKm || 0);
        const surplusKm = includedKm - usedKm;

        if (surplusKm > 0) {
            // Add surplus KM to customer's balance
            await prisma.kmBalance.upsert({
                where: { customerId: rental.customerId },
                update: { balance: { increment: surplusKm } },
                create: { customerId: rental.customerId, balance: surplusKm }
            });

            // Create a transfer record for tracking (system transfer)
            await prisma.kmTransfer.create({
                data: {
                    fromId: rental.customerId, 
                    toId: rental.customerId,
                    amount: surplusKm,
                    note: `Automatische Gutschrift aus Vertrag #${rental.contractNumber || rental.id} (${includedKm} paket - ${usedKm} used)`
                }
            });
        }

        await prisma.rental.update({
            where: { id },
            data: { 
                status: 'Completed',
                returnMileage: finalReturnMileage || undefined,
                actualReturnDate: new Date()
            }
        });

        // Also update car status to 'Active' (Available)
        await prisma.car.update({
            where: { id: rental.carId },
            data: { status: 'Active', currentMileage: finalReturnMileage || undefined }
        });

        // Send return / completion confirmation email
        try {
            const { sendEmail } = require('@/lib/notificationTemplates');
            const subject = `Fahrzeug-Rückgabeprotokoll - ${rental.contractNumber || rental.id}`;
            const body = `
Sehr geehrte/r ${rental.customer.firstName} ${rental.customer.lastName},

wir bestätigen die erfolgreiche Rückgabe des Fahrzeugs für den Mietvertrag ${rental.contractNumber || rental.id}.

Rückgabedetails:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rückgabekilometerstand: ${finalReturnMileage} km
Rückgabedatum: ${new Date().toLocaleDateString()}
Fahrzeug: ${rental.car?.brand} ${rental.car?.model}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vielen Dank, dass Sie sich für RentEx entschieden haben!

Mit freundlichen Grüßen,
Ihr RentEx-Team
            `.trim();
            await sendEmail(rental.customer.email, { subject, body });
        } catch (mailError) {
            console.error('[updateRentalStatus] Failed to send return email:', mailError);
        }
    } else {
        await prisma.rental.update({
            where: { id: id },
            data: { status: status as any }
        });

        // If cancelled, send cancellation confirmation
        if (status === 'Cancelled') {
            try {
                const { sendEmail } = require('@/lib/notificationTemplates');
                const subject = `Buchungsstornierung - ${rental.contractNumber || rental.id}`;
                const body = `
Sehr geehrte/r ${rental.customer.firstName} ${rental.customer.lastName},

hiermit bestätigen wir die Stornierung Ihres Mietvertrags ${rental.contractNumber || rental.id}.

Falls bereits Zahlungen getätigt wurden, werden diese gemäß unseren Stornierungsbedingungen innerhalb der nächsten Werktage zurückerstattet.

Wir hoffen, Sie bald wieder als Kunden begrüßen zu dürfen.

Mit freundlichen Grüßen,
Ihr RentEx-Team
                `.trim();
                await sendEmail(rental.customer.email, { subject, body });
            } catch (mailError) {
                console.error('[updateRentalStatus] Failed to send cancellation email:', mailError);
            }
        }
    }

    revalidatePath(`/admin/reservations/${id}`);
    revalidatePath('/admin/reservations');
    revalidatePath('/admin/km-transfer');
}

export async function updatePaymentStatus(id: number, paymentStatus: string) {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");
    await prisma.rental.update({
        where: { id },
        data: { paymentStatus }
    });
    revalidatePath(`/admin/reservations/${id}`);
}

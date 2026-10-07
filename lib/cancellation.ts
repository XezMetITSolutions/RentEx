/**
 * One cancellation rule for the dashboard and the mobile app:
 * unpaid reservations can always be dropped; a paid one is free until
 * FREE_CANCEL_HOURS before pickup, then the customer has to call.
 */
import prisma from '@/lib/prisma';
import { RENTAL_TERMS } from '@/lib/config';
import { releaseCouponUse } from '@/lib/coupons';
import { refundRental, type RefundActor } from '@/lib/refunds';
import { sendRentalMail } from '@/lib/rentalMail';

export function cancellationBlockReason(rental: {
    status: string;
    paymentStatus: string;
    startDate: Date;
}): string | null {
    if (rental.status === 'Cancelled') return 'Die Reservierung ist bereits storniert.';
    if (rental.status !== 'Pending' && rental.status !== 'Confirmed') {
        return 'Eine laufende oder beendete Miete kann online nicht storniert werden. Bitte rufen Sie uns an.';
    }
    const paid = rental.paymentStatus === 'Paid' || rental.paymentStatus === 'Partial';
    const hoursLeft = (new Date(rental.startDate).getTime() - Date.now()) / (60 * 60 * 1000);
    if (paid && hoursLeft < RENTAL_TERMS.FREE_CANCEL_HOURS) {
        return `Kostenlose Stornierung ist nur bis ${RENTAL_TERMS.FREE_CANCEL_HOURS} Stunden vor Abholung möglich. Bitte rufen Sie uns an.`;
    }
    return null;
}

export async function cancelRentalForCustomer(opts: {
    rentalId: number;
    customerId: number;
    actor: RefundActor;
}): Promise<{ ok: true; refundedAmount: number } | { ok: false; error: string }> {
    const rental = await prisma.rental.findFirst({
        where: { id: opts.rentalId, customerId: opts.customerId },
    });
    if (!rental) return { ok: false, error: 'Reservierung nicht gefunden.' };

    const blocked = cancellationBlockReason(rental);
    if (blocked) return { ok: false, error: blocked };

    let refundedAmount = 0;
    if (rental.paymentStatus === 'Paid' || rental.paymentStatus === 'Partial') {
        const refund = await refundRental({
            rentalId: rental.id,
            reason: 'Stornierung durch Kunden',
            actor: opts.actor,
        });
        if (!refund.ok) return { ok: false, error: refund.error };
        refundedAmount = refund.amount;
    }

    await releaseCouponUse(rental.discountReason);
    await prisma.rental.update({
        where: { id: rental.id },
        data: { status: 'Cancelled' },
    });
    await sendRentalMail(rental.id, { type: 'cancelled', by: 'customer', refundedAmount });

    return { ok: true, refundedAmount };
}

import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { lockCarForBooking } from '@/lib/availability';
import { releaseCouponUse } from '@/lib/coupons';
import { sendRentalMail } from '@/lib/rentalMail';
import type { RefundActor } from '@/lib/refunds';
import { cancellationQuote, cancellationBlockReason } from './cancellationPolicy';
export { cancellationBlockReason } from './cancellationPolicy';

export async function cancelRentalForCustomer(opts: {
    rentalId: number; customerId: number; actor: RefundActor; acceptedFee: number;
}): Promise<{ ok: true; refundedAmount: number } | { ok: false; error: string }> {
    try {
        const target = await prisma.rental.findFirst({ where: { id: opts.rentalId, customerId: opts.customerId } });
        if (!target) return { ok: false, error: 'Reservierung nicht gefunden.' };
        const result = await prisma.$transaction(async tx => {
            await lockCarForBooking(tx, target.carId);
            await tx.$queryRaw`SELECT id FROM "Rental" WHERE id = ${target.id} FOR UPDATE`;
            const rental = await tx.rental.findFirstOrThrow({ where: { id: target.id, customerId: opts.customerId }, include: { payments: { orderBy: { id: 'asc' } } } });
            const blocked = cancellationBlockReason(rental);
            if (blocked) throw new Error(blocked);
            const paid = rental.payments.reduce((n, p) => n + Number(p.amount), 0);
            const quote = cancellationQuote(rental, paid);
            if (!Number.isFinite(opts.acceptedFee) || Math.abs(opts.acceptedFee - quote.fee) > 0.001) throw new Error("Stornokosten bitte erneut prüfen und bestätigen.");
            const charges = rental.payments.filter(p => Number(p.amount) > 0 && p.paymentMethod === 'Online' && p.transactionId);
            if (quote.refund > 0 && charges.reduce((n,p) => n + Number(p.amount), 0) + 0.01 < quote.refund) {
                throw new Error('Für die Erstattung Ihrer vor Ort geleisteten Zahlung kontaktieren Sie uns bitte.');
            }
            let remaining = Math.round(quote.refund * 100);
            for (const charge of charges) {
                if (remaining <= 0) break;
                const session = charge.transactionId!.startsWith('cs_') ? await stripe.checkout.sessions.retrieve(charge.transactionId!) : null;
                const intentId = session ? (typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id) : charge.transactionId!;
                if (!intentId) throw new Error('Zahlung konnte nicht zugeordnet werden. Bitte kontaktieren Sie uns.');
                const amount = Math.min(remaining, Math.round(Number(charge.amount) * 100));
                const refund = await stripe.refunds.create({ payment_intent: intentId, amount, reason: 'requested_by_customer', metadata: { rentalId: String(rental.id) } }, { idempotencyKey: `customer-cancel-${rental.id}-${charge.id}` });
                await tx.payment.create({ data: { rentalId: rental.id, amount: -amount / 100, paymentMethod: 'Online', transactionId: refund.id, notes: 'Stornierung gemäß AGB §7; Stornokosten werden einbehalten.' } });
                remaining -= amount;
            }
            await tx.rental.update({ where: { id: rental.id }, data: {
                status: 'Cancelled', totalAmount: quote.fee, extrasCost: 0, insuranceCost: 0,
                paymentStatus: quote.outstanding > 0 ? (paid > 0 ? 'Partial' : 'Pending') : 'Paid',
                notes: `${rental.notes || ''}\nStorno AGB §7: ursprünglicher Mietpreis €${Number(rental.totalAmount).toFixed(2)}, Stornokosten €${quote.fee.toFixed(2)}, Erstattung €${quote.refund.toFixed(2)}, offen €${quote.outstanding.toFixed(2)}.`,
            } });
            await tx.rentalExtension.updateMany({ where: { rentalId: rental.id, status: { in: ['Requested', 'Approved'] } }, data: { status: 'Rejected' } });
            return { ...quote, discountReason: rental.discountReason };
        }, { timeout: 60000 });
        await releaseCouponUse(result.discountReason);
        await sendRentalMail(target.id, { type: 'cancelled', by: 'customer', refundedAmount: result.refund, cancellationFee: result.fee, outstanding: result.outstanding });
        return { ok: true, refundedAmount: result.refund };
    } catch (e) {
        console.error('[customer-cancel]', e);
        return { ok: false, error: e instanceof Error ? e.message : 'Stornierung fehlgeschlagen. Bitte erneut versuchen.' };
    }
}

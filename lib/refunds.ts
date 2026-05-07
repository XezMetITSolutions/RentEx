/**
 * refunds.ts — Centralized refund logic.
 *
 * Both the admin refund endpoint and the customer self-cancel flow need to:
 * 1. Refund the Stripe payment (if any)
 * 2. Mark the rental's paymentStatus as Refunded
 * 3. Record the refund as a negative Payment entry
 *
 * This module is the single source of truth for those steps so the two
 * surfaces stay in sync.
 */
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { auditLog } from '@/lib/audit';

export type RefundActor =
    | { kind: 'admin'; staffId: number; staffName: string }
    | { kind: 'customer'; customerId: number };

export interface RefundOptions {
    rentalId: number;
    actor: RefundActor;
    /** Free-form reason persisted in the Payment entry */
    reason?: string;
}

export interface RefundOk {
    ok: true;
    /** Stripe refund id, or null if the rental had no online payment */
    stripeRefundId: string | null;
    /** Refunded amount (positive number) */
    amount: number;
}
export interface RefundErr {
    ok: false;
    status: number;
    error: string;
}
export type RefundResult = RefundOk | RefundErr;

export async function refundRental(opts: RefundOptions): Promise<RefundResult> {
    const rental = await prisma.rental.findUnique({
        where: { id: opts.rentalId },
        include: { payments: { orderBy: { createdAt: 'desc' } } },
    });

    if (!rental) {
        return { ok: false, status: 404, error: 'Reservierung nicht gefunden.' };
    }
    if (rental.paymentStatus === 'Refunded') {
        return { ok: false, status: 400, error: 'Bereits erstattet.' };
    }
    if (rental.paymentStatus === 'Pending') {
        // No payment to refund — caller should still proceed with cancellation
        // but we report no-op here so it can decide.
        return { ok: true, stripeRefundId: null, amount: 0 };
    }

    const stripePayment = rental.payments.find(
        (p) => p.paymentMethod === 'Online' && p.transactionId
    );

    let stripeRefundId: string | null = null;
    if (stripePayment?.transactionId) {
        try {
            const checkoutSession = await stripe.checkout.sessions.retrieve(
                stripePayment.transactionId
            );
            const paymentIntentId =
                typeof checkoutSession.payment_intent === 'string'
                    ? checkoutSession.payment_intent
                    : checkoutSession.payment_intent?.id ?? null;

            if (paymentIntentId) {
                const refund = await stripe.refunds.create({
                    payment_intent: paymentIntentId,
                    reason: 'requested_by_customer',
                    metadata: {
                        rentalId: String(opts.rentalId),
                        actor: opts.actor.kind,
                        actorId:
                            opts.actor.kind === 'admin'
                                ? String(opts.actor.staffId)
                                : String(opts.actor.customerId),
                    },
                });
                stripeRefundId = refund.id;
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
            console.error('[refundRental] Stripe refund failed:', message);
            return {
                ok: false,
                status: 500,
                error: `Stripe-Erstattung fehlgeschlagen: ${message}`,
            };
        }
    }

    const totalPaid = rental.payments.reduce((sum, p) => sum + Number(p.amount), 0);

    await prisma.rental.update({
        where: { id: opts.rentalId },
        data: { paymentStatus: 'Refunded' },
    });

    const actorLabel =
        opts.actor.kind === 'admin'
            ? `${opts.actor.staffName} (Admin ID ${opts.actor.staffId})`
            : `Kunde (ID ${opts.actor.customerId})`;

    await prisma.payment.create({
        data: {
            rentalId: opts.rentalId,
            amount: -totalPaid,
            paymentMethod: stripeRefundId ? 'Online' : 'Manual',
            transactionId: stripeRefundId ?? null,
            notes: `Erstattung${opts.reason ? `: ${opts.reason}` : ''} — ${actorLabel}`,
        },
    });

    await auditLog({
        action: 'REFUND_ISSUED',
        entityType: 'Rental',
        entityId: opts.rentalId,
        actor:
            opts.actor.kind === 'admin'
                ? { kind: 'admin', id: opts.actor.staffId, name: opts.actor.staffName }
                : { kind: 'customer', id: opts.actor.customerId },
        description: `Erstattung €${totalPaid.toFixed(2)}${opts.reason ? ` — ${opts.reason}` : ''}`,
        metadata: { amount: totalPaid, stripeRefundId, reason: opts.reason ?? null },
    });

    return { ok: true, stripeRefundId, amount: totalPaid };
}

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { sendRentalMail } from '@/lib/rentalMail';
import { notifyCustomer } from '@/lib/pushNotifications';
import { UNPAID_ONLINE } from '@/lib/availability';
import { releaseCouponUse } from '@/lib/coupons';
import { refundRental } from '@/lib/refunds';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig || !endpointSecret) {
        return NextResponse.json({ error: 'Missing signature or endpoint secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // `completed` can arrive with payment_status 'unpaid' for delayed methods;
    // those are confirmed later via `async_payment_succeeded`.
    const isPaymentEvent =
        event.type === 'checkout.session.completed' ||
        event.type === 'checkout.session.async_payment_succeeded';

    if (isPaymentEvent) {
        const session = event.data.object as Stripe.Checkout.Session;
        const rentalId = session.metadata?.rentalId;
        const id = rentalId ? parseInt(rentalId, 10) : NaN;

        if (session.payment_status === 'paid' && Number.isInteger(id)) {
            // Stripe retries and duplicates events. The conditional update makes
            // processing idempotent: only the first delivery flips the status,
            // records the payment and sends notifications.
            const firstDelivery = await prisma.$transaction(async (tx) => {
                const current = await tx.rental.findUnique({ where: { id } });
                if (!current || current.paymentStatus === 'Paid' || current.paymentStatus === 'Refunded') return null;
                const duplicate = await tx.payment.findFirst({
                    where: { transactionId: session.id },
                    select: { id: true },
                });
                if (duplicate) return null;

                const paidNow = (session.amount_total || 0) / 100;
                const already = await tx.payment.aggregate({
                    where: { rentalId: id },
                    _sum: { amount: true },
                });
                const covered = Number(already._sum.amount || 0) + paidNow;
                const expected = Number(current.totalAmount);
                const short = covered + 0.01 < expected;
                await tx.payment.create({
                    data: {
                        rentalId: id,
                        amount: paidNow,
                        paymentMethod: 'Online',
                        transactionId: session.id,
                        notes: short
                            ? `Unterzahlung: €${covered.toFixed(2)} von €${expected.toFixed(2)}.`
                            : 'Stripe Checkout Session confirmed.',
                    },
                });
                await tx.rental.update({
                    where: { id },
                    data: {
                        paymentStatus: short ? 'Partial' : 'Paid',
                        status: current.status === 'Cancelled'
                            ? 'Cancelled'
                            : !short && current.status === 'Pending'
                                ? 'Confirmed'
                                : current.status,
                        notes: short
                            ? `${current.notes ? current.notes + '\n' : ''}Unterzahlung: €${covered.toFixed(2)} statt €${expected.toFixed(2)}.`
                            : current.notes,
                    },
                });
                return { short, cancelled: current.status === 'Cancelled' };
            });

            if (!firstDelivery) {
                console.log(`[stripe-webhook] Rental ${id} already paid — duplicate event ${event.id} ignored.`);
                return NextResponse.json({ received: true });
            }

            const rental = await prisma.rental.findUniqueOrThrow({
                where: { id },
                include: { customer: true, car: true },
            });

            // Paid after the booking was released (expired window or restarted
            // checkout): the car may be rebooked, so staff must refund or rebook manually.
            if (rental.status === 'Cancelled') {
                console.warn(`[stripe-webhook] Payment received for cancelled rental ${id}.`);
                const refund = await refundRental({
                    rentalId: id,
                    reason: 'Zahlung nach Storno — automatische Erstattung',
                    actor: { kind: 'admin', staffId: 0, staffName: 'Stripe-Webhook' },
                });
                if (!refund.ok) console.error(`[stripe-webhook] Auto-refund failed for rental ${id}: ${refund.error}`);
                else if (refund.amount > 0) {
                    await sendRentalMail(id, {
                        type: 'refunded',
                        amount: refund.amount,
                        reason: 'Die Zahlung ging erst nach Ablauf der Reservierung ein.',
                    });
                }
                await prisma.notification.create({
                    data: {
                        type: 'System',
                        subject: 'Zahlung für stornierte Buchung',
                        message: `Für die bereits stornierte Buchung ${rental.contractNumber ?? id} ist eine Online-Zahlung eingegangen. Die Erstattung wurde automatisch angestoßen; bitte prüfen, ob das Fahrzeug noch frei ist.`,
                        status: 'Pending',
                        relatedType: 'Rental',
                        relatedId: id,
                        recipient: 'Admin',
                    },
                });
            }

            const expectedCents = Math.round(Number(rental.totalAmount) * 100);
            if (session.amount_total !== expectedCents) {
                console.warn(`[stripe-webhook] Amount mismatch for rental ${id}: paid ${session.amount_total}, expected ${expectedCents}.`);
            }

            if (firstDelivery.short && rental.status !== 'Cancelled') {
                await prisma.notification.create({
                    data: {
                        type: 'System',
                        subject: 'Unterzahlung',
                        message: `Buchung ${rental.contractNumber ?? id} wurde nicht vollständig bezahlt und bleibt unbestätigt, bis der Rest eingegangen ist.`,
                        status: 'Pending',
                        relatedType: 'Rental',
                        relatedId: id,
                        recipient: 'Admin',
                    },
                });
            }

            // Confirmation to customer + office. A cancelled booking is refunded above.
            if (!firstDelivery.short && rental.status !== 'Cancelled') {
                await sendRentalMail(id, { type: 'paid' });

                // Push notification (best effort — never blocks)
                notifyCustomer(rental.customer.id, {
                    title: 'Zahlung bestätigt',
                    body: `Buchung ${rental.contractNumber} ist jetzt bezahlt.`,
                    data: { type: 'payment_confirmed', rentalId: rental.id },
                }).catch((err) => console.error('[stripe-webhook] push failed:', err));
            }

            console.log(`Rental ${rentalId} marked as Paid.`);
        }
    }

    // Checkout window closed without payment: release the car.
    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const id = session.metadata?.rentalId ? parseInt(session.metadata.rentalId, 10) : NaN;
        if (Number.isInteger(id)) {
            const existing = await prisma.rental.findUnique({
                where: { id },
                select: { discountReason: true },
            });
            const released = await prisma.rental.updateMany({
                where: { id, ...UNPAID_ONLINE },
                data: {
                    status: 'Cancelled',
                    notes: event.type === 'checkout.session.expired'
                        ? 'Automatisch storniert: Stripe-Checkout abgelaufen.'
                        : 'Automatisch storniert: Zahlung fehlgeschlagen.',
                },
            });
            if (released.count > 0) {
                await releaseCouponUse(existing?.discountReason);
                await sendRentalMail(id, { type: 'paymentExpired' });
                console.log(`[stripe-webhook] Rental ${id} released (${event.type}).`);
            }
        }
    }

    return NextResponse.json({ received: true });
}

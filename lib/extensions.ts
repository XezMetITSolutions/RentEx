import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { quoteBooking } from '@/lib/bookingPrice';
import { chargeableDaysBetween } from '@/lib/bookingUtils';
import { bookingRejectedReason } from '@/lib/rentalGuards';
import { lockCarForBooking, overlapWhere, CAR_BUSY_MESSAGE } from '@/lib/availability';
import { sendRentalMail } from '@/lib/rentalMail';
import { sendEmail, COMPANY_EMAIL } from '@/lib/notificationTemplates';
import { renderEmail } from '@/lib/email/layout';
import { SITE_URL } from '@/lib/config';
import type { Prisma } from '@prisma/client';
import type Stripe from 'stripe';

type Db = Prisma.TransactionClient;
export async function extensionQuote(db: Db, rentalId: number, newEnd: Date, customerId?: number) {
    const rental = await db.rental.findFirst({ where: { id: rentalId, ...(customerId ? { customerId } : {}) }, include: { car: true, customer: true, options: { include: { option: true } } } });
    if (!rental) throw new Error('Miete nicht gefunden.');
    if (!['Confirmed', 'Active'].includes(rental.status) || rental.endDate <= new Date()) throw new Error('Eine Verlängerung ist nur für bestätigte oder laufende Mieten vor dem vereinbarten Mietende möglich.');
    if (rental.paymentStatus !== 'Paid') throw new Error('Bitte begleichen Sie zuerst den offenen Mietbetrag. Bei Fragen kontaktieren Sie uns.');
    if (!Number.isFinite(newEnd.getTime()) || newEnd <= rental.endDate) throw new Error('Die neue Rückgabe muss nach dem bisherigen Mietende liegen.');
    if (!rental.customer.licenseExpiryDate || rental.customer.licenseExpiryDate < newEnd) throw new Error('Ihr Führerschein muss bis zum neuen Mietende gültig sein. Bitte kontaktieren Sie uns.');
    const days = chargeableDaysBetween(rental.startDate, newEnd);
    const rejected = bookingRejectedReason(rental.car, newEnd, days);
    if (rejected) throw new Error(rejected);
    if (await db.rental.count({ where: { carId: rental.carId, id: { not: rental.id }, ...overlapWhere(rental.startDate, newEnd) } })) throw new Error(CAR_BUSY_MESSAGE);
    const options = rental.options.map(({option:o}) => ({ ...o, price: Number(o.price), maxPrice: o.maxPrice == null ? null : Number(o.maxPrice) }));
    const quote = quoteBooking(rental.car, options, days, null, rental.startDate);
    const total = Math.max(Number(rental.totalAmount), Math.round((quote.baseTotal - Number(rental.discountAmount || 0)) * 100) / 100);
    return { rental, data: { previousEnd: rental.endDate, newEnd, previousTotal: Number(rental.totalAmount), totalAmount: total, additionalAmount: Math.round((total - Number(rental.totalAmount)) * 100) / 100, totalDays: days, includedKm: quote.includedKm, extrasCost: quote.extrasCost, insuranceCost: quote.insuranceCost } };
}

export async function extensionNotice(id: number, text: string) {
    const ext = await prisma.rentalExtension.findUniqueOrThrow({ where: { id }, include: { rental: { include: { customer: true } } } });
    const subject = `Mietverlängerung ${ext.rental.contractNumber || ext.rentalId}`;
    const rendered = renderEmail({ preheader: subject, heading: subject, blocks: [{ kind: 'p', text }, { kind: 'button', label: 'Buchung ansehen', href: `${SITE_URL}/dashboard/rentals/${ext.rentalId}` }] });
    const message = { subject, body: rendered.text, html: rendered.html };
    await Promise.all([sendEmail(ext.rental.customer.email, message), sendEmail(COMPANY_EMAIL, message)]);
}

/** Called only for a signature-verified Stripe event. Row locks and unique session IDs make retries safe. */
export async function completeExtension(session: Stripe.Checkout.Session) {
    const id = Number(session.metadata?.extensionId);
    if (!Number.isInteger(id) || session.payment_status !== 'paid') return;
    const target = await prisma.rentalExtension.findUnique({ where: { id }, include: { rental: true } });
    if (!target || target.stripeSessionId !== session.id) throw new Error('Unbekannte Verlängerungszahlung.');
    const outcome = await prisma.$transaction(async tx => {
        await lockCarForBooking(tx, target.rental.carId);
        await tx.$queryRaw`SELECT id FROM "Rental" WHERE id = ${target.rentalId} FOR UPDATE`;
        const ext = await tx.rentalExtension.findUniqueOrThrow({ where: { id }, include: { rental: true } });
        if (ext.status === 'Completed' || ext.status === 'Refunded') return null;
        let failure: string | null = null;
        let current: Awaited<ReturnType<typeof extensionQuote>> | null = null;
        try {
            if (ext.status !== 'Approved' || session.currency !== 'eur' || session.amount_total !== Math.round(Number(ext.additionalAmount) * 100)) throw new Error('Zahlung stimmt nicht mit der genehmigten Verlängerung überein.');
            current = await extensionQuote(tx, ext.rentalId, ext.newEnd);
            if (current.rental.endDate.getTime() !== ext.previousEnd.getTime() || Number(current.rental.totalAmount) !== Number(ext.previousTotal)) throw new Error('Die ursprüngliche Miete wurde inzwischen geändert.');
        } catch (e) { failure = e instanceof Error ? e.message : 'Verlängerung nicht mehr möglich.'; }
        const exists = await tx.payment.findFirst({ where: { transactionId: session.id } });
        const amount = (session.amount_total || 0) / 100;
        if (!exists) await tx.payment.create({ data: { rentalId: ext.rentalId, amount, paymentMethod: 'Online', transactionId: session.id, notes: `Vorauszahlung Verlängerung #${id}` } });
        if (failure) {
            const intent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
            if (!intent) throw new Error('Zahlung ohne PaymentIntent.');
            const refund = await stripe.refunds.create({ payment_intent: intent }, { idempotencyKey: `extension-refund-${id}` });
            await tx.payment.create({ data: { rentalId: ext.rentalId, amount: -amount, paymentMethod: 'Online', transactionId: refund.id, notes: failure } });
            await tx.rentalExtension.update({ where: { id }, data: { status: 'Refunded' } });
            return { failure };
        }
        const data = ext;
        await tx.rental.update({ where: { id: ext.rentalId }, data: { endDate: ext.newEnd, totalDays: data.totalDays, totalAmount: ext.totalAmount, includedKm: data.includedKm, extrasCost: data.extrasCost, insuranceCost: data.insuranceCost } });
        await tx.rentalExtension.update({ where: { id }, data: { status: 'Completed' } });
        return { failure: null };
    }, { timeout: 60000 });
    if (!outcome) return;
    if (outcome.failure) await extensionNotice(id, `Die Verlängerung konnte nicht abgeschlossen werden. Ihre Zahlung wird vollständig erstattet. Das bisherige Mietende bleibt bestehen. ${outcome.failure}`);
    else {
        await sendRentalMail(target.rentalId, { type: 'changed', previousEnd: target.previousEnd, previousTotal: Number(target.previousTotal) });
        await extensionNotice(id, 'Die genehmigte Verlängerung ist bezahlt und bestätigt. Das neue Mietende gilt jetzt.');
    }
}

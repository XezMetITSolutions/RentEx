/**
 * Rental e-mails, keyed by event. Callers pass a rental id; this module loads
 * what the templates need, sends to the customer (and the office where it
 * matters) and never throws — a failed e-mail must not fail a booking.
 */
import prisma from '@/lib/prisma';
import { formatInTimeZone } from 'date-fns-tz';
import { BUSINESS, SITE_URL } from '@/lib/config';
import { isOutsideOpeningHours } from '@/lib/bookingUtils';
import { emailTemplates, sendEmail, COMPANY_EMAIL } from '@/lib/notificationTemplates';
import type { CancelReason, MailRental } from '@/lib/email/templates';

const PICKUP_PLACE = {
    name: 'Rent-Ex Feldkirch',
    address: `${BUSINESS.PICKUP_ADDRESS}, ${BUSINESS.PICKUP_POSTAL_CODE} ${BUSINESS.PICKUP_CITY}`,
};

const viennaParts = (d: Date) => [
    formatInTimeZone(d, BUSINESS.TIME_ZONE, 'yyyy-MM-dd'),
    formatInTimeZone(d, BUSINESS.TIME_ZONE, 'HH:mm'),
] as const;

export async function loadMailRental(rentalId: number): Promise<MailRental | null> {
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: {
            customer: true,
            car: true,
            payments: { select: { amount: true } },
            options: { include: { option: { select: { name: true } } } },
        },
    });
    if (!rental?.customer || !rental.car) return null;

    const returned = rental.status === 'Completed' && rental.actualReturnDate
        ? {
            at: rental.actualReturnDate,
            drivenKm: rental.returnMileage != null && rental.pickupMileage != null
                ? Math.max(0, rental.returnMileage - rental.pickupMileage)
                : null,
            fuelCharge: Number(rental.fuelCharge ?? 0),
            extraCharges: Number(rental.extraCharges ?? 0),
            extraChargesNote: rental.extraChargesNote,
        }
        : undefined;

    return {
        id: rental.id,
        contractNumber: rental.contractNumber ?? `#${rental.id}`,
        customer: {
            firstName: rental.customer.firstName,
            lastName: rental.customer.lastName,
            email: rental.customer.email,
            hasAccount: !!rental.customer.passwordHash,
        },
        car: { brand: rental.car.brand, model: rental.car.model, plate: rental.car.plate },
        startDate: rental.startDate,
        endDate: rental.endDate,
        // One branch today; the stored Location address is not maintained, the config is.
        pickupPlace: PICKUP_PLACE,
        returnPlace: PICKUP_PLACE,
        totalDays: rental.totalDays,
        totalAmount: Number(rental.totalAmount),
        paid: rental.payments.reduce((sum, p) => sum + Number(p.amount), 0),
        paymentMethod: rental.paymentMethod,
        paymentStatus: rental.paymentStatus,
        extras: rental.options.map((o) => o.option.name),
        includedKm: rental.includedKm,
        deposit: rental.car.depositAmount != null ? Number(rental.car.depositAmount) : null,
        discount: Number(rental.discountAmount ?? 0),
        pickupOutsideHours: isOutsideOpeningHours(...viennaParts(rental.startDate)),
        returnOutsideHours: isOutsideOpeningHours(...viennaParts(rental.endDate)),
        returned,
    };
}

export type RentalMailEvent =
    /** `staff: false` when the office created the booking itself. */
    | { type: 'confirmed'; staff?: boolean }
    | { type: 'paid' }
    | { type: 'pickupReminder' }
    | { type: 'returnReminder' }
    | { type: 'cancelled'; by: CancelReason; refundedAmount?: number }
    | { type: 'paymentExpired' }
    | { type: 'refunded'; amount: number; reason?: string | null }
    | { type: 'changed'; previousEnd: Date; previousTotal: number }
    | { type: 'completed' }
    | { type: 'reviewRequest'; reviewUrl: string };

/** Link back into the checkout with the same car and dates, while they are still in the future. */
function retryUrl(r: MailRental, carId: number): string | null {
    if (r.startDate.getTime() < Date.now() + 60 * 60 * 1000) return null;
    const [startDate, pickupTime] = viennaParts(r.startDate);
    const [endDate, returnTime] = viennaParts(r.endDate);
    const params = new URLSearchParams({ carId: String(carId), startDate, endDate, pickupTime, returnTime });
    return `${SITE_URL}/checkout?${params}`;
}

/**
 * Sends the customer e-mail for `event` and, for bookings and customer
 * cancellations, a short notice to the office. Returns whether the
 * customer e-mail went out.
 */
export async function sendRentalMail(rentalId: number, event: RentalMailEvent): Promise<boolean> {
    try {
        const r = await loadMailRental(rentalId);
        if (!r) return false;
        const t = emailTemplates;
        let message;
        let staff;
        switch (event.type) {
            case 'confirmed':
                message = t.bookingConfirmation(r);
                if (event.staff !== false) staff = t.staffNewBooking(r, { paid: false });
                break;
            case 'paid':
                message = t.bookingConfirmation(r, { paid: true });
                staff = t.staffNewBooking(r, { paid: true });
                break;
            case 'pickupReminder':
                message = t.pickupReminder(r);
                break;
            case 'returnReminder':
                message = t.returnReminder(r);
                break;
            case 'cancelled':
                message = t.cancellation(r, event);
                if (event.by !== 'company') staff = t.staffCancellation(r, event);
                break;
            case 'paymentExpired': {
                const rental = await prisma.rental.findUnique({ where: { id: rentalId }, select: { carId: true } });
                message = t.paymentExpired(r, { retryUrl: rental ? retryUrl(r, rental.carId) : null });
                break;
            }
            case 'refunded':
                message = t.refund(r, event);
                break;
            case 'changed':
                message = t.bookingChanged(r, event);
                break;
            case 'completed':
                message = t.rentalCompleted(r);
                break;
            case 'reviewRequest':
                message = t.reviewRequest(r, event);
                break;
        }
        const sent = await sendEmail(r.customer.email, message);
        if (staff) await sendEmail(COMPANY_EMAIL, staff);
        return sent;
    } catch (err) {
        console.error(`[rentalMail] ${event.type} for rental ${rentalId} failed:`, err);
        return false;
    }
}

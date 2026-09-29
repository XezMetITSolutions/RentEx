import prisma from './prisma';
import { stripe } from './stripe';
import { getSession } from './auth';
import { getAdminSession } from './adminAuth';
import { verifySessionToken } from './sessionToken';

/**
 * Loads a booking for its confirmation page. Rental ids are sequential, so
 * access requires the signed token from the booking redirect, the owning
 * customer's session, or an admin session. Returns null otherwise.
 */
export async function getBookingForConfirmation(rentalId: number, token: string | undefined, stripeSessionId: string | undefined) {
    if (!Number.isInteger(rentalId)) return null;

    const tokenRentalId = await verifySessionToken('booking', token);
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { car: true, customer: true },
    });
    if (!rental) return null;

    if (tokenRentalId !== rentalId) {
        const [customerId, admin] = await Promise.all([getSession(), getAdminSession()]);
        if (customerId !== rental.customerId && !admin) return null;
    }

    let isPaid = rental.paymentStatus === 'Paid';
    // The webhook can arrive after the redirect; ask Stripe directly in that case.
    if (!isPaid && stripeSessionId && stripeSessionId === rental.stripeSessionId) {
        try {
            const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
            isPaid = session.payment_status === 'paid';
        } catch (error) {
            console.error(`[booking] Could not verify Stripe session for rental ${rentalId}:`, error);
        }
    }

    return { rental, isPaid, isOnline: rental.paymentMethod === 'Online' };
}

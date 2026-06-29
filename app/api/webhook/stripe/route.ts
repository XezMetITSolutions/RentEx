import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { emailTemplates, sendEmail, COMPANY_EMAIL } from '@/lib/notificationTemplates';
import { notifyCustomer } from '@/lib/pushNotifications';

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

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const rentalId = session.metadata?.rentalId;

        if (rentalId) {
            const id = parseInt(rentalId);

            const rental = await prisma.rental.update({
                where: { id },
                data: { paymentStatus: 'Paid' },
                include: { customer: true, car: true },
            });

            // Create a Payment record
            await prisma.payment.create({
                data: {
                    rentalId: id,
                    amount: (session.amount_total || 0) / 100,
                    paymentMethod: 'Online',
                    transactionId: session.id,
                    notes: `Stripe Checkout Session confirmed.`,
                }
            });

            // Send payment confirmation email
            if (rental.customer && rental.car && rental.contractNumber) {
                const templateData = {
                    contractNumber: rental.contractNumber,
                    customer: {
                        firstName: rental.customer.firstName,
                        lastName: rental.customer.lastName,
                        email: rental.customer.email,
                    },
                    car: {
                        brand: rental.car.brand,
                        model: rental.car.model,
                        plate: rental.car.plate,
                    },
                    rental: {
                        startDate: rental.startDate,
                        endDate: rental.endDate,
                        totalAmount: Number(rental.totalAmount),
                    },
                };
                await sendEmail(rental.customer.email, emailTemplates.paymentConfirmation(templateData));
                // Send a copy to the company email address
                await sendEmail(COMPANY_EMAIL, {
                    ...emailTemplates.paymentConfirmation(templateData),
                    subject: `[ZAHLUNG ERHALTEN] ${templateData.contractNumber} - ${templateData.customer.firstName} ${templateData.customer.lastName}`
                });

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

    return NextResponse.json({ received: true });
}

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

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

            await prisma.rental.update({
                where: { id },
                data: {
                    paymentStatus: 'Paid',
                },
            });

            // Create a Payment record
            await prisma.payment.create({
                data: {
                    rentalId: id,
                    amount: (session.amount_total || 0) / 100,
                    paymentMethod: 'Online',
                    transactionId: session.id, // Or session.payment_intent
                    notes: `Stripe Checkout Session confirmed.`,
                }
            });

            console.log(`Rental ${rentalId} marked as Paid.`);
        }
    }

    return NextResponse.json({ received: true });
}

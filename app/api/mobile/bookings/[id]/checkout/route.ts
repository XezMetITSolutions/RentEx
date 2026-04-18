import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getAuthCustomerId } from '@/lib/mobileAuth';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const customerId = getAuthCustomerId(req);
  if (!customerId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }
  const { id } = await context.params;
  const bookingId = Number(id);
  if (!bookingId) {
    return NextResponse.json({ error: 'Ungültige ID.' }, { status: 400 });
  }

  const rental = await prisma.rental.findUnique({
    where: { id: bookingId },
    include: { car: true, customer: true },
  });
  if (!rental || rental.customerId !== customerId) {
    return NextResponse.json({ error: 'Buchung nicht gefunden.' }, { status: 404 });
  }
  if (rental.paymentStatus === 'Paid') {
    return NextResponse.json({ error: 'Bereits bezahlt.' }, { status: 400 });
  }
  if (rental.status === 'Cancelled') {
    return NextResponse.json({ error: 'Storniert.' }, { status: 400 });
  }

  const amount = Math.round(Number(rental.totalAmount) * 100);
  if (!amount || amount < 50) {
    return NextResponse.json({ error: 'Ungültiger Betrag.' }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rent-ex.vercel.app';
  const scheme = process.env.MOBILE_APP_SCHEME || 'rentex';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'sepa_debit', 'sofort', 'paypal', 'klarna'] as any,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${rental.car?.brand || ''} ${rental.car?.model || ''} Miete`.trim() || 'Miete',
              description: `Buchung #${rental.id}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/api/mobile/bookings/${rental.id}/checkout/return?status=success&app=${scheme}`,
      cancel_url: `${baseUrl}/api/mobile/bookings/${rental.id}/checkout/return?status=cancel&app=${scheme}`,
      customer_email: rental.customer?.email || undefined,
      metadata: {
        rentalId: String(rental.id),
        channel: 'mobile',
      },
    });

    await prisma.rental.update({
      where: { id: rental.id },
      data: { stripeSessionId: session.id },
    }).catch(() => null);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Zahlung konnte nicht gestartet werden.' },
      { status: 500 }
    );
  }
}

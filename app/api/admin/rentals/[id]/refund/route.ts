import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';
import { stripe } from '@/lib/stripe';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const { id } = await context.params;
  const rentalId = Number(id);
  if (!rentalId) {
    return NextResponse.json({ error: 'Ungültige ID.' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { reason } = body;

  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { payments: { orderBy: { createdAt: 'desc' } }, customer: true },
  });

  if (!rental) {
    return NextResponse.json({ error: 'Reservierung nicht gefunden.' }, { status: 404 });
  }

  if (rental.paymentStatus === 'Refunded') {
    return NextResponse.json({ error: 'Bereits erstattet.' }, { status: 400 });
  }

  if (rental.paymentStatus === 'Pending') {
    return NextResponse.json({ error: 'Keine Zahlung zum Erstatten vorhanden.' }, { status: 400 });
  }

  // Find the Stripe online payment (if any)
  const stripePayment = rental.payments.find(
    (p) => p.paymentMethod === 'Online' && p.transactionId
  );

  let stripeRefundId: string | null = null;

  if (stripePayment?.transactionId) {
    try {
      // transactionId is the Stripe Checkout Session ID — retrieve payment_intent from it
      const checkoutSession = await stripe.checkout.sessions.retrieve(stripePayment.transactionId);
      const paymentIntentId =
        typeof checkoutSession.payment_intent === 'string'
          ? checkoutSession.payment_intent
          : checkoutSession.payment_intent?.id ?? null;

      if (paymentIntentId) {
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'requested_by_customer',
          metadata: { rentalId: String(rentalId), adminId: String(session.id) },
        });
        stripeRefundId = refund.id;
      }
    } catch (err: any) {
      console.error('[refund] Stripe refund failed:', err?.message);
      return NextResponse.json(
        { error: `Stripe-Erstattung fehlgeschlagen: ${err?.message ?? 'Unbekannter Fehler'}` },
        { status: 500 }
      );
    }
  }

  // Update rental payment status
  await prisma.rental.update({
    where: { id: rentalId },
    data: { paymentStatus: 'Refunded' },
  });

  // Record the refund as a payment entry
  const totalPaid = rental.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  await prisma.payment.create({
    data: {
      rentalId,
      amount: -totalPaid,
      paymentMethod: stripeRefundId ? 'Online' : 'Manual',
      transactionId: stripeRefundId ?? null,
      notes: `Erstattung${reason ? `: ${reason}` : ''} — von ${session.name} (ID ${session.id})`,
    },
  });

  return NextResponse.json({
    success: true,
    stripeRefundId,
    message: stripeRefundId
      ? 'Stripe-Erstattung erfolgreich initiiert.'
      : 'Erstattung manuell als erstattet markiert.',
  });
}

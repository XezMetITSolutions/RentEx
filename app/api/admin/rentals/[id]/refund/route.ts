import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { refundRental } from '@/lib/refunds';

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

  const result = await refundRental({
    rentalId,
    reason,
    actor: { kind: 'admin', staffId: session.id, staffName: session.name },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (result.amount === 0) {
    return NextResponse.json(
      { error: 'Keine Zahlung zum Erstatten vorhanden.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    stripeRefundId: result.stripeRefundId,
    message: result.stripeRefundId
      ? 'Stripe-Erstattung erfolgreich initiiert.'
      : 'Erstattung manuell als erstattet markiert.',
  });
}

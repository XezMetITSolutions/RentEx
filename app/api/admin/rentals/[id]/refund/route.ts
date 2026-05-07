import { NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { refundRental } from '@/lib/refunds';
import { apiOk, apiUnauthorized, apiValidation, apiError, ERROR_CODES } from '@/lib/apiResponse';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return apiUnauthorized();
  }

  const { id } = await context.params;
  const rentalId = Number(id);
  if (!rentalId) {
    return apiValidation('Ungültige ID.');
  }

  const body = await req.json().catch(() => ({}));
  const { reason } = body;

  const result = await refundRental({
    rentalId,
    reason,
    actor: { kind: 'admin', staffId: session.id, staffName: session.name },
  });

  if (!result.ok) {
    const code =
      result.status === 404 ? ERROR_CODES.NOT_FOUND :
      result.status === 500 ? ERROR_CODES.PAYMENT_FAILED :
      ERROR_CODES.VALIDATION;
    return apiError(result.error, result.status, code);
  }

  if (result.amount === 0) {
    return apiValidation('Keine Zahlung zum Erstatten vorhanden.');
  }

  return apiOk({
    success: true,
    stripeRefundId: result.stripeRefundId,
    message: result.stripeRefundId
      ? 'Stripe-Erstattung erfolgreich initiiert.'
      : 'Erstattung manuell als erstattet markiert.',
  });
}

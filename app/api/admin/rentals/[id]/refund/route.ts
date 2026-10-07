import { NextRequest } from 'next/server';
import { requireAdminApiModule } from '@/lib/adminAccess';
import { refundRental } from '@/lib/refunds';
import { apiOk, apiUnauthorized, apiValidation, apiError, ERROR_CODES } from '@/lib/apiResponse';
import { auditLog } from '@/lib/audit';
import { sendRentalMail } from '@/lib/rentalMail';


export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApiModule('Finanzen');
    if (auth.response) return auth.response;
    const session = auth.session;

  // RBAC: Only SUPERADMIN/ADMINISTRATOR and MANAGER/FILIALLEITER can process refunds
  const allowedRefundRoles = ['SUPERADMIN', 'ADMINISTRATOR', 'MANAGER', 'FILIALLEITER'];
  if (!allowedRefundRoles.includes(session.role)) {
    return apiError('Forbidden: Insufficient permissions', 403, ERROR_CODES.FORBIDDEN);
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

  // AUDIT LOG
  await auditLog({
    userId: session.id,
    userName: session.name,
    action: 'REFUND',
    entityType: 'Rental',
    entityId: rentalId,
    description: `Refund processed for rental ${rentalId}. Amount: ${result.amount}€. Reason: ${reason || 'Not specified'}`,
    metadata: { stripeRefundId: result.stripeRefundId, amount: result.amount, reason },
    ipAddress: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined
  });

  await sendRentalMail(rentalId, { type: 'refunded', amount: result.amount, reason: reason || null });

  return apiOk({
    success: true,
    stripeRefundId: result.stripeRefundId,
    message: result.stripeRefundId
      ? 'Stripe-Erstattung erfolgreich initiiert.'
      : 'Erstattung manuell als erstattet markiert.',
  });
}

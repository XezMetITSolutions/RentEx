import prisma from './prisma';

export type AuditAction = 
    | 'CREATE' | 'UPDATE' | 'DELETE' | 'Created'
    | 'LOGIN' | 'LOGOUT' | 'EXPORT' 
    | 'REFUND' | 'REFUND_ISSUED' | 'STATUS_CHANGE'
    | 'ADMIN_LOGIN_FAILED' | 'ADMIN_LOGIN_SUCCESS' | 'ADMIN_LOGIN_2FA_PENDING' | 'ADMIN_LOGIN_2FA_SUCCESS'
    | 'ADMIN_2FA_ENABLED' | 'ADMIN_2FA_DISABLED'
    | 'STAFF_CREATED' | 'STAFF_UPDATED' | 'STAFF_DELETED'
    | 'PUSH_TOKEN_REGISTERED' | 'RENTAL_CHECKOUT' | 'RENTAL_CHECKIN'
    | (string & {}); // Allow any string while keeping autocomplete for known types

interface AuditParams {
  userId?: string | number;
  userName?: string;
  action: AuditAction;
  entityType: string;
  entityId?: number;
  actor?: { kind: 'system' | 'admin' | 'customer'; id?: number; name?: string };
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function auditLog({
  userId,
  userName,
  action,
  entityType,
  entityId,
  actor,
  description,
  metadata,
  ipAddress,
  userAgent
}: AuditParams) {
  try {
    const finalUserId = userId?.toString() || actor?.id?.toString() || (actor?.kind === 'system' ? 'SYSTEM' : undefined);
    const finalUserName = userName || actor?.name || (actor?.kind === 'system' ? 'System Process' : undefined);

    await prisma.activityLog.create({
      data: {
        userId: finalUserId,
        userName: finalUserName,
        action: action as string,
        entityType,
        entityId,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('[AuditLog Error]:', error);
  }
}

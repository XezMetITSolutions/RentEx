import prisma from './prisma';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'REFUND' | 'STATUS_CHANGE';

interface AuditParams {
  userId?: string | number;
  userName?: string;
  action: AuditAction;
  entityType: string;
  entityId?: number;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity({
  userId,
  userName,
  action,
  entityType,
  entityId,
  description,
  metadata,
  ipAddress,
  userAgent
}: AuditParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId?.toString(),
        userName,
        action,
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
    // We don't want to crash the main operation if logging fails
  }
}

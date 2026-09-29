import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/mobileAuth';
import { verifyPassword } from '@/lib/auth';
import { verifyStaffSecondFactor } from '@/lib/totp';
import { rateLimit, getClientIp, RATE_LIMITS, rateLimitErrorMessage } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';

const BACKUP_CODE_RE = /^[0-9A-F]{5}-[0-9A-F]{5}$/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const totpCode = typeof body?.totpCode === 'string' ? body.totpCode.trim() : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'E-Mail und Passwort erforderlich.' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const rl = rateLimit(`mobile-admin-login:${ip}:${email}`, RATE_LIMITS.AUTH_LOGIN);
    if (!rl.allowed) {
      return NextResponse.json({ error: rateLimitErrorMessage(rl) }, { status: 429 });
    }

    const staff = await prisma.staff.findUnique({
      where: { email },
      include: { location: true },
    });

    if (!staff || !staff.passwordHash || !staff.isActive || !verifyPassword(password, staff.passwordHash)) {
      await auditLog({
        action: 'ADMIN_LOGIN_FAILED',
        entityType: 'Auth',
        entityId: staff?.id,
        actor: { kind: 'system' },
        description: `Mobile Admin-Anmeldung fehlgeschlagen für ${email}`,
        metadata: { email, channel: 'mobile' },
        ipAddress: ip,
      });
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten oder Konto deaktiviert.' },
        { status: 401 }
      );
    }

    if (staff.twoFactorEnabled && staff.twoFactorSecret) {
      if (!totpCode) {
        return NextResponse.json(
          { error: 'Bitte geben Sie Ihren 2FA-Code ein.', code: 'TOTP_REQUIRED' },
          { status: 401 }
        );
      }

      // Separate per-account budget so a stolen password cannot be paired with
      // a brute-forced code by rotating IPs.
      const rl2fa = rateLimit(`mobile-admin-2fa:${staff.id}`, RATE_LIMITS.AUTH_LOGIN);
      if (!rl2fa.allowed) {
        return NextResponse.json({ error: rateLimitErrorMessage(rl2fa) }, { status: 429 });
      }

      const useBackup = BACKUP_CODE_RE.test(totpCode);
      if (!(await verifyStaffSecondFactor(staff, totpCode, useBackup))) {
        await auditLog({
          action: 'ADMIN_LOGIN_FAILED',
          entityType: 'Auth',
          entityId: staff.id,
          actor: { kind: 'system' },
          description: `Mobile 2FA-Code ungültig für ${email}`,
          metadata: { email, channel: 'mobile', reason: 'invalid_2fa' },
          ipAddress: ip,
        });
        return NextResponse.json(
          { error: useBackup ? 'Backup-Code ungültig.' : '2FA-Code ungültig.', code: 'TOTP_INVALID' },
          { status: 401 }
        );
      }
    }

    await prisma.staff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    await auditLog({
      action: 'ADMIN_LOGIN_SUCCESS',
      entityType: 'Auth',
      entityId: staff.id,
      actor: { kind: 'admin', id: staff.id, name: staff.name },
      description: `Admin mobil angemeldet: ${staff.email}`,
      metadata: { channel: 'mobile', twoFactor: staff.twoFactorEnabled },
      ipAddress: ip,
    });

    const token = signToken(staff.id, 'staff', { staffRole: staff.role });
    return NextResponse.json({
      token,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        locationId: staff.locationId,
        locationName: staff.location?.name ?? null,
      },
    });
  } catch (err) {
    console.error('[mobile-admin-login]', err);
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}

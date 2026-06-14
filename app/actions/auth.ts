'use server';

import prisma from '@/lib/prisma';
import { setSession, getSession, clearSession, verifyPassword, hashPassword } from '@/lib/auth';
import {
    setAdminSession,
    setAdmin2FAPending,
    getAdmin2FAPendingStaffId,
    clearAdmin2FAPending,
    getAdminSession,
} from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import { validateName } from '@/lib/nameValidation';
import { rateLimit, getClientIpFromHeaders, RATE_LIMITS, rateLimitErrorMessage } from '@/lib/rateLimit';
import {
    generateTotpSecret,
    buildOtpauthUri,
    buildQrDataUrl,
    verifyTotpCode,
    generateBackupCodes,
    consumeBackupCode,
} from '@/lib/totp';
import { auditLog } from '@/lib/audit';

export async function adminLogin(formData: FormData) {
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'E-Mail und Passwort eingeben.' };
    }

    const ip = await getClientIpFromHeaders();
    const rl = rateLimit(`admin-login:${ip}:${email.toLowerCase()}`, RATE_LIMITS.AUTH_LOGIN);
    if (!rl.allowed) {
        return { error: rateLimitErrorMessage(rl) };
    }

    const staff = await prisma.staff.findUnique({
        where: { email },
        include: { location: true }
    });

    if (!staff || !staff.passwordHash || !staff.isActive) {
        await auditLog({
            action: 'ADMIN_LOGIN_FAILED',
            entityType: 'Auth',
            actor: { kind: 'system' },
            description: `Ungültige Anmeldedaten für ${email}`,
            metadata: { email, reason: 'unknown_or_inactive' },
        });
        return { error: 'Ungültige Anmeldedaten oder Konto deaktiviert.' };
    }

    if (!verifyPassword(password, staff.passwordHash)) {
        await auditLog({
            action: 'ADMIN_LOGIN_FAILED',
            entityType: 'Auth',
            entityId: staff.id,
            actor: { kind: 'system' },
            description: `Falsches Passwort für ${email}`,
            metadata: { email, reason: 'wrong_password' },
        });
        return { error: 'Ungültige Anmeldedaten.' };
    }

    if (staff.twoFactorEnabled && staff.twoFactorSecret) {
        await setAdmin2FAPending(staff.id);
        await auditLog({
            action: 'ADMIN_LOGIN_2FA_PENDING',
            entityType: 'Auth',
            entityId: staff.id,
            actor: { kind: 'admin', id: staff.id, name: staff.name },
            description: 'Passwort akzeptiert, 2FA-Code erforderlich',
        });
        redirect('/admin/login/2fa');
    }

    await setAdminSession(staff.id);
    await prisma.staff.update({
        where: { id: staff.id },
        data: { lastLoginAt: new Date() },
    });

    await auditLog({
        action: 'ADMIN_LOGIN_SUCCESS',
        entityType: 'Auth',
        entityId: staff.id,
        actor: { kind: 'admin', id: staff.id, name: staff.name },
        description: `Admin angemeldet: ${staff.email}`,
    });

    redirect('/admin');
}

export async function verifyAdmin2FA(formData: FormData) {
    const staffId = await getAdmin2FAPendingStaffId();
    if (staffId == null) {
        return { error: '2FA-Sitzung abgelaufen. Bitte erneut anmelden.' };
    }

    const code = (formData.get('code') as string)?.trim() ?? '';
    const useBackup = formData.get('useBackup') === '1';

    const ip = await getClientIpFromHeaders();
    const rl = rateLimit(`admin-2fa:${ip}:${staffId}`, RATE_LIMITS.AUTH_LOGIN);
    if (!rl.allowed) return { error: rateLimitErrorMessage(rl) };

    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff || !staff.isActive || !staff.twoFactorEnabled || !staff.twoFactorSecret) {
        await clearAdmin2FAPending();
        return { error: '2FA ist nicht aktiv. Bitte erneut anmelden.' };
    }

    if (useBackup) {
        const result = consumeBackupCode(staff.twoFactorBackupCodes, code);
        if (!result.ok) return { error: 'Backup-Code ungültig.' };
        await prisma.staff.update({
            where: { id: staff.id },
            data: { twoFactorBackupCodes: JSON.stringify(result.remaining) },
        });
    } else {
        if (!(await verifyTotpCode(staff.twoFactorSecret, code))) {
            return { error: 'Code ungültig.' };
        }
    }

    await clearAdmin2FAPending();
    await setAdminSession(staff.id);
    await prisma.staff.update({
        where: { id: staff.id },
        data: { lastLoginAt: new Date() },
    });

    await auditLog({
        action: 'ADMIN_LOGIN_2FA_SUCCESS',
        entityType: 'Auth',
        entityId: staff.id,
        actor: { kind: 'admin', id: staff.id, name: staff.name },
        description: useBackup
            ? '2FA mit Backup-Code bestanden'
            : '2FA mit Authenticator-Code bestanden',
        metadata: { method: useBackup ? 'backup_code' : 'totp' },
    });

    redirect('/admin');
}

// ─────────────────────────────────────────────
// 2FA setup (logged-in staff turning on/off)
// ─────────────────────────────────────────────

export async function startAdmin2FASetup(): Promise<
    { error: string } | { secret: string; otpauthUri: string; qrDataUrl: string }
> {
    const session = await getAdminSession();
    if (!session) return { error: 'Nicht autorisiert.' };

    const secret = generateTotpSecret();
    const uri = buildOtpauthUri(secret, session.email);
    const qrDataUrl = await buildQrDataUrl(uri);

    // Store the unconfirmed secret. It only becomes active once the user
    // submits a valid TOTP code via confirmAdmin2FASetup().
    await prisma.staff.update({
        where: { id: session.id },
        data: { twoFactorSecret: secret, twoFactorEnabled: false },
    });

    return { secret, otpauthUri: uri, qrDataUrl };
}

export async function confirmAdmin2FASetup(formData: FormData): Promise<
    { error: string } | { backupCodes: string[] }
> {
    const session = await getAdminSession();
    if (!session) return { error: 'Nicht autorisiert.' };

    const code = (formData.get('code') as string)?.trim() ?? '';
    const staff = await prisma.staff.findUnique({ where: { id: session.id } });
    if (!staff?.twoFactorSecret) return { error: 'Kein Setup aktiv. Bitte neu starten.' };
    if (!(await verifyTotpCode(staff.twoFactorSecret, code))) return { error: 'Code ungültig.' };

    const { plaintext, hashed } = generateBackupCodes(10);
    await prisma.staff.update({
        where: { id: staff.id },
        data: {
            twoFactorEnabled: true,
            twoFactorVerifiedAt: new Date(),
            twoFactorBackupCodes: JSON.stringify(hashed),
        },
    });

    await auditLog({
        action: 'ADMIN_2FA_ENABLED',
        entityType: 'Staff',
        entityId: staff.id,
        actor: { kind: 'admin', id: staff.id, name: staff.name },
        description: '2FA aktiviert',
    });

    return { backupCodes: plaintext };
}

export async function disableAdmin2FA(formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const session = await getAdminSession();
    if (!session) return { error: 'Nicht autorisiert.' };

    const code = (formData.get('code') as string)?.trim() ?? '';
    const staff = await prisma.staff.findUnique({ where: { id: session.id } });
    if (!staff?.twoFactorEnabled || !staff.twoFactorSecret) {
        return { error: '2FA ist nicht aktiv.' };
    }
    if (!(await verifyTotpCode(staff.twoFactorSecret, code))) {
        return { error: 'Code ungültig.' };
    }

    await prisma.staff.update({
        where: { id: staff.id },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: null,
            twoFactorVerifiedAt: null,
        },
    });

    await auditLog({
        action: 'ADMIN_2FA_DISABLED',
        entityType: 'Staff',
        entityId: staff.id,
        actor: { kind: 'admin', id: staff.id, name: staff.name },
        description: '2FA deaktiviert',
    });

    return { success: true };
}

export async function login(formData: FormData) {
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const from = (formData.get('from') as string) || '/dashboard';

    if (!email || !password) {
        redirect(`/login?error=${encodeURIComponent('E-Mail und Passwort eingeben.')}&from=${encodeURIComponent(from)}`);
    }

    const ip = await getClientIpFromHeaders();
    const rl = rateLimit(`login:${ip}:${email.toLowerCase()}`, RATE_LIMITS.AUTH_LOGIN);
    if (!rl.allowed) {
        redirect(`/login?error=${encodeURIComponent(rateLimitErrorMessage(rl))}&from=${encodeURIComponent(from)}`);
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.passwordHash) {
        redirect(`/login?error=${encodeURIComponent('Ungültige Anmeldedaten.')}&from=${encodeURIComponent(from)}`);
    }

    if (!verifyPassword(password, customer.passwordHash)) {
        redirect(`/login?error=${encodeURIComponent('Ungültige Anmeldedaten.')}&from=${encodeURIComponent(from)}`);
    }

    if (customer.isBlacklisted) {
        redirect(`/login?error=${encodeURIComponent('Konto gesperrt. Bitte kontaktieren Sie den Support.')}&from=${encodeURIComponent(from)}`);
    }

    await setSession(customer.id);
    redirect(from);
}

export async function register(formData: FormData) {
    const firstName = (formData.get('firstName') as string)?.trim();
    const lastName = (formData.get('lastName') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const phone = (formData.get('phone') as string)?.trim() || null;

    if (!firstName || !lastName || !email || !password) {
        redirect(`/register?error=${encodeURIComponent('Bitte alle Pflichtfelder ausfüllen.')}`);
    }

    const ip = await getClientIpFromHeaders();
    const rl = rateLimit(`register:${ip}`, RATE_LIMITS.AUTH_REGISTER);
    if (!rl.allowed) {
        redirect(`/register?error=${encodeURIComponent(rateLimitErrorMessage(rl))}`);
    }

    if (password.length < 6) {
        redirect(`/register?error=${encodeURIComponent('Passwort mindestens 6 Zeichen.')}`);
    }

    // Falsche / verdächtige Namensprüfung
    const nameCheck = validateName(firstName, lastName);
    if (nameCheck.riskScore >= 60) {
        redirect(`/register?error=${encodeURIComponent(`Ungültiger Name: ${nameCheck.reasons.join(', ')}`)}`);
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
        redirect(`/register?error=${encodeURIComponent('Diese E-Mail ist bereits registriert.')}`);
    }

    const passwordHash = hashPassword(password);
    const customer = await prisma.customer.create({
        data: {
            firstName,
            lastName,
            email,
            phone,
            passwordHash,
        },
    });

    await setSession(customer.id);
    redirect('/dashboard');
}

export async function logout() {
    await clearSession();
    redirect('/');
}

export async function changePassword(formData: FormData) {
    const customerId = await getSession();
    if (customerId == null) return { error: 'Nicht angemeldet.' };

    const ip = await getClientIpFromHeaders();
    const rl = rateLimit(`change-pw:${ip}:${customerId}`, RATE_LIMITS.AUTH_PASSWORD);
    if (!rl.allowed) return { error: rateLimitErrorMessage(rl) };

    const current = formData.get('currentPassword') as string;
    const newPwd = formData.get('newPassword') as string;
    const confirm = formData.get('confirmPassword') as string;

    if (!current || !newPwd || !confirm) return { error: 'Alle Felder ausfüllen.' };
    if (newPwd.length < 6) return { error: 'Neues Passwort mindestens 6 Zeichen.' };
    if (newPwd !== confirm) return { error: 'Neues Passwort und Bestätigung stimmen nicht überein.' };

    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { passwordHash: true },
    });
    if (!customer?.passwordHash) return { error: 'Kein Passwort gesetzt. Bitte nutzen Sie „Registrieren“ oder Support.' };
    if (!verifyPassword(current, customer.passwordHash)) return { error: 'Aktuelles Passwort ist falsch.' };

    await prisma.customer.update({
        where: { id: customerId },
        data: { passwordHash: hashPassword(newPwd) },
    });
    return { success: true };
}

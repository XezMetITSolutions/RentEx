import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { setAdminSession, setAdmin2FAPending } from '@/lib/adminAuth';
import { rateLimit, getClientIpFromHeaders, RATE_LIMITS, rateLimitErrorMessage } from '@/lib/rateLimit';
import { auditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const email = (body.email as string)?.trim();
        const password = body.password as string;

        if (!email || !password) {
            return NextResponse.json({ error: 'E-Mail und Passwort eingeben.' }, { status: 400 });
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const rl = rateLimit(`admin-login:${ip}:${email.toLowerCase()}`, RATE_LIMITS.AUTH_LOGIN);
        if (!rl.allowed) {
            return NextResponse.json({ error: rateLimitErrorMessage(rl) }, { status: 429 });
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
            return NextResponse.json({ error: 'Ungültige Anmeldedaten oder Konto deaktiviert.' }, { status: 401 });
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
            return NextResponse.json({ error: 'Ungültige Anmeldedaten.' }, { status: 401 });
        }

        // 2FA check
        if (staff.twoFactorEnabled && staff.twoFactorSecret) {
            await setAdmin2FAPending(staff.id);
            await auditLog({
                action: 'ADMIN_LOGIN_2FA_PENDING',
                entityType: 'Auth',
                entityId: staff.id,
                actor: { kind: 'admin', id: staff.id, name: staff.name },
                description: 'Passwort akzeptiert, 2FA-Code erforderlich',
            });
            return NextResponse.json({ redirect: '/admin/login/2fa' });
        }

        // Set session cookie via NextResponse (reliable on Vercel)
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

        // Build response and set cookie
        const response = NextResponse.json({ redirect: '/admin' });
        await setAdminSession(staff.id, response);
        return response;

    } catch (e: any) {
        console.error('[admin-login API]', e);
        return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 });
    }
}

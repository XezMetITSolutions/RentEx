import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
        }

        const staff = await prisma.staff.findUnique({
            where: { email }
        });

        if (!staff) {
            return NextResponse.json({ error: `Staff email ${email} not found in database.` });
        }

        const isPasswordOk = verifyPassword(password, staff.passwordHash || '');

        return NextResponse.json({
            email,
            staffFound: true,
            isActive: staff.isActive,
            role: staff.role,
            hasPasswordHash: !!staff.passwordHash,
            isPasswordCorrect: isPasswordOk,
            twoFactorEnabled: staff.twoFactorEnabled,
            twoFactorSecretSet: !!staff.twoFactorSecret
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

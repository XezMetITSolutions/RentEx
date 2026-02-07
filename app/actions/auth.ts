'use server';

import prisma from '@/lib/prisma';
import { setSession, clearSession, verifyPassword, hashPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const from = (formData.get('from') as string) || '/dashboard';

    if (!email || !password) {
        redirect(`/login?error=${encodeURIComponent('E-Mail und Passwort eingeben.')}&from=${encodeURIComponent(from)}`);
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

    if (password.length < 6) {
        redirect(`/register?error=${encodeURIComponent('Passwort mindestens 6 Zeichen.')}`);
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

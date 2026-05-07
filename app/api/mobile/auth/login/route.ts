import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { signToken } from '@/lib/mobileAuth';
import { rateLimit, getClientIp, RATE_LIMITS, rateLimitErrorMessage } from '@/lib/rateLimit';
import { apiOk, apiValidation, apiUnauthorized, apiForbidden, apiInternal, apiRateLimited } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return apiValidation('E-Mail und Passwort erforderlich.');
    }

    const ip = getClientIp(req);
    const rl = rateLimit(`mobile-login:${ip}:${email}`, RATE_LIMITS.AUTH_LOGIN);
    if (!rl.allowed) {
      return apiRateLimited(rl, rateLimitErrorMessage(rl));
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.passwordHash) {
      return apiUnauthorized('Ungültige Anmeldedaten.');
    }

    if (!verifyPassword(password, customer.passwordHash)) {
      return apiUnauthorized('Ungültige Anmeldedaten.');
    }

    if (customer.isBlacklisted) {
      return apiForbidden('Konto gesperrt. Bitte kontaktieren Sie den Support.');
    }

    const token = signToken(customer.id, 'customer');
    return apiOk({
      token,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postalCode: customer.postalCode,
        country: customer.country,
      },
    });
  } catch (err) {
    console.error('[mobile-login]', err);
    return apiInternal();
  }
}

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { signToken } from '@/lib/mobileAuth';
import { rateLimit, getClientIp, RATE_LIMITS, rateLimitErrorMessage } from '@/lib/rateLimit';
import { apiOk, apiValidation, apiUnauthorized, apiForbidden, apiInternal, apiRateLimited, apiError, ERROR_CODES } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
  let step = 'init';
  try {
    step = 'parsing-body';
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return apiValidation('E-Mail und Passwort erforderlich.');
    }

    step = 'rate-limiting';
    const ip = getClientIp(req);
    const rl = rateLimit(`mobile-login:${ip}:${email}`, RATE_LIMITS.AUTH_LOGIN);
    if (!rl.allowed) {
      return apiRateLimited(rl, rateLimitErrorMessage(rl));
    }

    step = 'db-lookup';
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.passwordHash) {
      return apiUnauthorized('Ungültige Anmeldedaten.');
    }

    step = 'password-verify';
    if (!verifyPassword(password, customer.passwordHash)) {
      return apiUnauthorized('Ungültige Anmeldedaten.');
    }

    step = 'blacklist-check';
    if (customer.isBlacklisted) {
      return apiForbidden('Konto gesperrt. Bitte kontaktieren Sie den Support.');
    }

    step = 'token-signing';
    const token = signToken(customer.id, 'customer');

    step = 'success-response';
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
  } catch (err: any) {
    console.error(`[mobile-login] Error at step: ${step}`, err);
    return apiError(`[${step}] ${err?.message || 'Serverfehler'}`, 500, ERROR_CODES.INTERNAL);
  }
}

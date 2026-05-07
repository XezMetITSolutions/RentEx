import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { signToken } from '@/lib/mobileAuth';
import { validateName } from '@/lib/nameValidation';
import { rateLimit, getClientIp, RATE_LIMITS, rateLimitErrorMessage } from '@/lib/rateLimit';
import { apiOk, apiValidation, apiInternal, apiRateLimited, apiError, ERROR_CODES } from '@/lib/apiResponse';
import { registerMobileSchema, safeValidate } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`mobile-register:${ip}`, RATE_LIMITS.AUTH_REGISTER);
    if (!rl.allowed) {
      return apiRateLimited(rl, rateLimitErrorMessage(rl));
    }

    const body = await req.json().catch(() => null);
    const parsed = safeValidate(registerMobileSchema, body);
    if (!parsed.ok) return apiValidation(parsed.error);
    const { firstName, lastName, email, password, phone } = parsed.data;

    const nameCheck = validateName(firstName, lastName);
    if (nameCheck.riskScore >= 60) {
      return apiValidation(`Ungültiger Name: ${nameCheck.reasons.join(', ')}`);
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return apiError('Diese E-Mail ist bereits registriert.', 409, ERROR_CODES.CONFLICT);
    }

    const passwordHash = hashPassword(password);
    const customer = await prisma.customer.create({
      data: { firstName, lastName, email, phone, passwordHash },
    });

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
    console.error('[mobile-register]', err);
    return apiInternal();
  }
}

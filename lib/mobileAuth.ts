import crypto from 'crypto';
import { NextRequest } from 'next/server';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days for customer
const STAFF_TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 hours for staff

function getSecret(): string {
  const secret = process.env.MOBILE_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('MOBILE_TOKEN_SECRET environment variable is not set. Refusing to sign/verify tokens with an insecure fallback.');
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

export type Role = 'customer' | 'staff';

export interface MobileTokenPayload {
  sub: number;
  role: Role;
  staffRole?: string; // Staff.role (SUPERADMIN | MANAGER | AGENT | DRIVER)
  exp: number;
  iat: number;
}

export function signToken(
  id: number,
  role: Role,
  extra?: { staffRole?: string }
): string {
  const iat = Math.floor(Date.now() / 1000);
  const ttl = role === 'staff' ? STAFF_TOKEN_TTL_SECONDS : TOKEN_TTL_SECONDS;
  const payload: MobileTokenPayload = {
    sub: id,
    role,
    iat,
    exp: iat + ttl,
    ...(extra?.staffRole ? { staffRole: extra.staffRole } : {}),
  };
  const payloadB64 = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest();
  return `${payloadB64}.${base64url(sig)}`;
}

// Legacy alias
export function signMobileToken(customerId: number): string {
  return signToken(customerId, 'customer');
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  try {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return null;
    const expected = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest();
    const received = fromBase64url(sigB64);
    if (expected.length !== received.length) return null;
    if (!crypto.timingSafeEqual(expected, received)) return null;
    const payload = JSON.parse(fromBase64url(payloadB64).toString('utf8')) as MobileTokenPayload;
    if (!payload.sub || !payload.exp) return null;
    if (!payload.role) (payload as MobileTokenPayload).role = 'customer';
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function extractToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/);
  return match ? match[1].trim() : null;
}

export function getAuthCustomerId(req: NextRequest): number | null {
  const token = extractToken(req);
  if (!token) return null;
  const payload = verifyMobileToken(token);
  if (!payload || payload.role !== 'customer') return null;
  return payload.sub;
}

export interface StaffAuth {
  id: number;
  role: string;
}

export function getAuthStaff(req: NextRequest): StaffAuth | null {
  const token = extractToken(req);
  if (!token) return null;
  const payload = verifyMobileToken(token);
  if (!payload || payload.role !== 'staff') return null;
  return { id: payload.sub, role: payload.staffRole ?? 'AGENT' };
}

export function requireStaffRole(staff: StaffAuth | null, roles: string[]): boolean {
  if (!staff) return false;
  if (staff.role === 'SUPERADMIN') return true;
  return roles.includes(staff.role);
}

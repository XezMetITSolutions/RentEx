import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const AUTH_CONFIG = {
    PASSWORD_SALT_LENGTH: 16,
    PASSWORD_KEY_LENGTH: 64,
    PASSWORD_SCRYPT_OPTS: { N: 16384, r: 8, p: 1 },
};

function hashCustomerPassword(password: string): string {
    const salt = crypto.randomBytes(AUTH_CONFIG.PASSWORD_SALT_LENGTH).toString('hex');
    const hash = crypto.scryptSync(password, salt, AUTH_CONFIG.PASSWORD_KEY_LENGTH, AUTH_CONFIG.PASSWORD_SCRYPT_OPTS).toString('hex');
    return `${salt}:${hash}`;
}

async function resetUserPassword(email: string, newPassword: string) {
    const hash = hashCustomerPassword(newPassword);
    await prisma.customer.update({
        where: { email },
        data: { passwordHash: hash, isBlacklisted: false }
    });
    console.log(`Password reset for ${email} successfully.`);
}

// Never hard-code credentials: pass them in, e.g.
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/reset_password.ts
const email = process.env.ADMIN_EMAIL;
const pass = process.env.ADMIN_PASSWORD;
if (!email || !pass) {
    console.error('ADMIN_EMAIL und ADMIN_PASSWORD müssen gesetzt sein.');
    process.exit(1);
}

resetUserPassword(email, pass)
    .catch(console.error)
    .finally(() => prisma.$disconnect());

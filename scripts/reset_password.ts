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

const email = 'gsgmete68@gmail.com';
const pass = '01528797Mb##';

resetUserPassword(email, pass)
    .catch(console.error)
    .finally(() => prisma.$disconnect());

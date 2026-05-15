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

function hashStaffPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

async function main() {
    console.log('--- Creating Test Users ---');

    // 1. Create/Update Test Customer
    const customerEmail = 'test@test.com';
    const customerPassword = process.env.TEST_CUSTOMER_PASSWORD || 'testpassword';
    const customerHash = hashCustomerPassword(customerPassword);

    await prisma.customer.upsert({
        where: { email: customerEmail },
        update: { passwordHash: customerHash, isBlacklisted: false },
        create: {
            email: customerEmail,
            firstName: 'Test',
            lastName: 'User',
            passwordHash: customerHash,
            phone: '+905555555555',
        },
    });
    console.log(`Customer: ${customerEmail} / ${customerPassword}`);

    // 2. Create/Update Test Admin
    const adminEmail = 'admin@test.com';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'adminpassword';
    const adminHash = hashStaffPassword(adminPassword);

    await prisma.staff.upsert({
        where: { email: adminEmail },
        update: { passwordHash: adminHash, isActive: true, role: 'SUPERADMIN' },
        create: {
            email: adminEmail,
            name: 'Test Admin',
            role: 'SUPERADMIN',
            passwordHash: adminHash,
            isActive: true,
        },
    });
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);

    console.log('--- Done ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

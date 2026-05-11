import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashStaffPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

async function makeAdmin(email: string, password: string) {
    const hash = hashStaffPassword(password);
    
    await prisma.staff.upsert({
        where: { email },
        update: { passwordHash: hash, isActive: true, role: 'SUPERADMIN' },
        create: {
            email,
            name: 'Mete',
            role: 'SUPERADMIN',
            passwordHash: hash,
            isActive: true,
        },
    });
    console.log(`User ${email} is now a SUPERADMIN.`);
}

const email = 'gsgmete68@gmail.com';
const pass = '01528797Mb##';

makeAdmin(email, pass)
    .catch(console.error)
    .finally(() => prisma.$disconnect());

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

// Never hard-code credentials: pass them in, e.g.
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/make_admin.ts
const email = process.env.ADMIN_EMAIL;
const pass = process.env.ADMIN_PASSWORD;
if (!email || !pass) {
    console.error('ADMIN_EMAIL und ADMIN_PASSWORD müssen gesetzt sein.');
    process.exit(1);
}

makeAdmin(email, pass)
    .catch(console.error)
    .finally(() => prisma.$disconnect());

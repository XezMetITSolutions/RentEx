import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
    // Usage: npx tsx scripts/force-login.ts <email> <password>
    const [email, password] = process.argv.slice(2);
    if (!email || !password || password.length < 12) {
        console.error('Usage: npx tsx scripts/force-login.ts <email> <password (min. 12 chars)>');
        process.exit(1);
    }
    
    console.log('Generating hash...');
    const passwordHash = await hashPassword(password);
    console.log('Hash generated.');

    console.log('Upserting Staff...');
    const staff = await prisma.staff.upsert({
        where: { email },
        update: { passwordHash, role: 'SUPERADMIN', isActive: true },
        create: {
            name: 'RentEx Admin',
            email,
            role: 'SUPERADMIN',
            passwordHash,
            isActive: true
        }
    });
    console.log('Staff updated:', staff.email);

    console.log('Upserting Customer...');
    const customer = await prisma.customer.upsert({
        where: { email },
        update: { passwordHash, isActive: true },
        create: {
            firstName: 'RentEx',
            lastName: 'Admin',
            email,
            passwordHash,
            isActive: true,
            customerType: 'VIP'
        }
    });
    console.log('Customer updated:', customer.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());

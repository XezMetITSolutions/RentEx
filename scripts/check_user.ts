import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser(email: string) {
    console.log(`--- Checking User: ${email} ---`);
    
    const customer = await prisma.customer.findUnique({
        where: { email }
    });
    
    if (customer) {
        console.log('Customer found:');
        console.log({
            id: customer.id,
            email: customer.email,
            isBlacklisted: customer.isBlacklisted,
            hasPassword: !!customer.passwordHash
        });
    } else {
        console.log('Customer NOT found.');
    }

    const staff = await prisma.staff.findUnique({
        where: { email }
    });

    if (staff) {
        console.log('Staff found:');
        console.log({
            id: staff.id,
            email: staff.email,
            role: staff.role,
            isActive: staff.isActive,
            hasPassword: !!staff.passwordHash
        });
    } else {
        console.log('Staff NOT found.');
    }
}

const emailToCheck = 'gsgmete68@gmail.com';
checkUser(emailToCheck)
    .catch(console.error)
    .finally(() => prisma.$disconnect());

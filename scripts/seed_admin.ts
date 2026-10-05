import prisma from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth';

async function main() {
    const email = 'info@rent-ex.at'.toLowerCase();
    const name = 'Rent-Ex Admin';
    const password = 'RentEx300326';
    const role = 'ADMINISTRATOR';

    const passwordHash = hashPassword(password);
    console.log('Testing password verification locally:', verifyPassword(password, passwordHash));

    const staff = await prisma.staff.upsert({
        where: { email },
        update: {
            name,
            passwordHash,
            role,
            isActive: true,
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: null,
        },
        create: {
            email,
            name,
            role,
            passwordHash,
            isActive: true,
            twoFactorEnabled: false,
        },
    });

    console.log('Staff created / updated successfully:', {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        isActive: staff.isActive,
    });
}

main()
    .catch((err) => {
        console.error('Error seeding admin:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

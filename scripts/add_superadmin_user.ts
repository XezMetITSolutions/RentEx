import prisma from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth';

async function main() {
    const email = 'admin@rent-ex.at'.toLowerCase();
    const name = 'Rent-Ex Superadmin';
    const password = '01528797Mb##';
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

    console.log('Superadmin created / updated successfully in database:', {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        isActive: staff.isActive,
    });
}

main()
    .catch((err) => {
        console.error('Error adding superadmin:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

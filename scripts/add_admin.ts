import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function addAdmin() {
    console.log('Adding new admin: admin@rent-ex.at');

    const email = 'admin@rent-ex.at';
    const password = '01528797Mb##';
    
    // Hash password using the same method as app/api/admin/staff/route.ts
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    const passwordHash = `${salt}:${hash}`;

    try {
        const existingAdmin = await prisma.staff.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            console.log('Admin already exists! Updating password...');
            await prisma.staff.update({
                where: { email },
                data: { passwordHash }
            });
            console.log('Admin password updated successfully!');
        } else {
            await prisma.staff.create({
                data: {
                    name: 'Super Admin',
                    email,
                    role: 'ADMINISTRATOR',
                    passwordHash,
                }
            });
            console.log('Admin created successfully!');
        }
    } catch (error) {
        console.error('Error adding admin:', error);
    }
}

addAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

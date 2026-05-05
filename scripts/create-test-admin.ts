import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

async function createTestAdmin() {
    const password = 'test1234';
    const passwordHash = await hashPassword(password);
    
    const staff = await prisma.staff.create({
        data: {
            name: 'Test Admin',
            email: 'test@rent-ex.at',
            role: 'SUPERADMIN',
            passwordHash,
            isActive: true,
        }
    });
    
    console.log('✅ Test staff/admin created:');
    console.log('Email:', staff.email);
    console.log('Password:', password);
    console.log('ID:', staff.id);
}

createTestAdmin().catch(console.error).finally(() => process.exit(0));

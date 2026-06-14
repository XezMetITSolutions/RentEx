import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.staff.findMany({
        orderBy: { lastLoginAt: 'desc' }
    });

    console.log(staff.map(s => ({
        id: s.id,
        email: s.email,
        name: s.name,
        role: s.role,
        lastLoginAt: s.lastLoginAt
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());

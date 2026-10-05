import prisma from '../lib/prisma';

async function main() {
    const staff = await prisma.staff.findMany({
        select: { id: true, email: true, name: true, role: true, isActive: true }
    });
    console.log(JSON.stringify(staff, null, 2));
}

main().finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.staff.findMany();
    console.log(`Staff count: ${staff.length}`);
    console.log(staff.map(s => ({ id: s.id, name: s.name, email: s.email, role: s.role })));
}

main().catch(console.error).finally(() => prisma.$disconnect());

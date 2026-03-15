import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.staff.findMany();
    for (const s of staff) {
        console.log(`Email: ${s.email} | Role: ${s.role} | Name: ${s.name}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

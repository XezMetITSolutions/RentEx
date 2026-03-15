import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.staff.findMany({
        select: {
            name: true,
            email: true,
            role: true
        }
    });
    console.log(JSON.stringify(staff, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

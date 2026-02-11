
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const options = await prisma.option.findMany({
        select: { id: true, name: true }
    });
    console.log(JSON.stringify(options, null, 2));
}
main().finally(() => prisma.$disconnect());

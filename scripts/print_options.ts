
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const options = await prisma.option.findMany();
    options.forEach(o => console.log(o.name));
}
main().finally(() => prisma.$disconnect());

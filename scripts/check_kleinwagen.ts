import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const opts = await prisma.option.findMany({
        where: { name: { contains: 'Kleinwagen' } }
    });
    fs.writeFileSync('kleinwagen_opts.json', JSON.stringify(opts, null, 2));
}

main().finally(() => prisma.$disconnect());

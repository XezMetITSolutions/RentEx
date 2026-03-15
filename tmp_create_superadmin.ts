import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@rentex.at';
    const password = 'admin';
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    const passwordHash = `${salt}:${hash}`;

    const admin = await prisma.staff.upsert({
        where: { email },
        update: {
            passwordHash,
            role: 'ADMINISTRATOR'
        },
        create: {
            name: 'SuperAdmin',
            email,
            passwordHash,
            role: 'ADMINISTRATOR'
        }
    });
    console.log("Created/Updated SuperAdmin:");
    console.log("Email:", admin.email);
    console.log("Password:", password);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

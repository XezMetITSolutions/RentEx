import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Migrating staff roles to German...');

    const roleMap: Record<string, string> = {
        'SUPERADMIN': 'ADMINISTRATOR',
        'MANAGER': 'FILIALLEITER',
        'AGENT': 'MITARBEITER',
        'DRIVER': 'FAHRER'
    };

    const staffList = await prisma.staff.findMany();

    for (const staff of staffList) {
        const newRole = roleMap[staff.role];
        if (newRole) {
            console.log(`Updating ${staff.name}: ${staff.role} -> ${newRole}`);
            await prisma.staff.update({
                where: { id: staff.id },
                data: { role: newRole }
            });
        }
    }

    console.log('Migration completed.');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

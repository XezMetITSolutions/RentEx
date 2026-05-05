import prisma from '@/lib/prisma';

async function createCompetitors() {
    const companies = [
        { name: 'Hertz', website: 'https://www.hertz.at' },
        { name: 'Avis', website: 'https://www.avis.at' },
        { name: 'Enterprise', website: 'https://www.enterprise.at' },
        { name: 'Europcar', website: 'https://www.europcar.at' },
    ];
    
    for (const company of companies) {
        try {
            await prisma.competitorCompany.create({
                data: { ...company, isActive: true },
            });
            console.log(`✅ Created: ${company.name}`);
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.log(`⏭️  Already exists: ${company.name}`);
            } else {
                console.error(`❌ Error creating ${company.name}:`, error.message);
            }
        }
    }
    
    const count = await prisma.competitorCompany.count();
    console.log(`\nTotal competitors: ${count}`);
}

createCompetitors().finally(() => process.exit(0));

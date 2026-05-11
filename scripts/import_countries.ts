import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const sqlPath = path.join(process.cwd(), '.claude', 'countries.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Parsing SQL content...');

    // Extract values from INSERT INTO `country` (...) VALUES (...)
    const regex = /\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(?:'([^']*)'|NULL),\s*(?:(\d+)|NULL),\s*(\d+)\)/g;
    
    let match;
    const countries = [];

    while ((match = regex.exec(sqlContent)) !== null) {
        countries.push({
            id: parseInt(match[1]),
            iso: match[2],
            name: match[3],
            nicename: match[4],
            iso3: match[5] || null,
            numcode: match[6] ? parseInt(match[7]) : null, // Wait, match[6] is numcode, match[7] is phonecode
            phonecode: parseInt(match[7])
        });
    }

    // Re-check regex group indices
    // 1: id
    // 2: iso
    // 3: name
    // 4: nicename
    // 5: iso3
    // 6: numcode
    // 7: phonecode

    console.log(`Found ${countries.length} countries. Starting import...`);

    // Clean up current table first to avoid duplicates if re-run
    await prisma.country.deleteMany({});

    // Import in batches to avoid large transaction issues
    const batchSize = 50;
    for (let i = 0; i < countries.length; i += batchSize) {
        const batch = countries.slice(i, i + batchSize);
        await prisma.country.createMany({
            data: batch
        });
        console.log(`Imported ${i + batch.length}/${countries.length}`);
    }

    console.log('Import completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

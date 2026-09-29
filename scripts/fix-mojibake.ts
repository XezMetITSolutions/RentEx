/**
 * Repairs double-encoded text ("hinzugefÃ¼gt" → "hinzugefügt") in customer-
 * visible master data: options, cars and locations. Such text was UTF-8 that
 * got read as Windows-1252 and saved again.
 *
 * Dry run (default, writes nothing):
 *   npx tsx scripts/fix-mojibake.ts
 * Apply (take a database backup first!):
 *   npx tsx scripts/fix-mojibake.ts --apply
 *
 * A value is only changed when reversing the encoding yields valid UTF-8, so
 * correct text is never touched and running it twice is harmless.
 */
import 'dotenv/config';
import prisma from '../lib/prisma';

// Windows-1252 code points 0x80–0x9F that differ from Latin-1.
const CP1252: Record<string, number> = {
    '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88,
    '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93,
    '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b,
    'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
};

const SUSPICIOUS = /[ÃÂâ][\u0080-¿‘-›€ŒœŠšŸŽžƒˆ˜™]/;
const decoder = new TextDecoder('utf-8', { fatal: true });

/** Returns the repaired string, or null when `value` is not double-encoded. */
function repair(value: string | null): string | null {
    if (!value || !SUSPICIOUS.test(value)) return null;
    const bytes: number[] = [];
    for (const ch of value) {
        const code = ch.codePointAt(0)!;
        if (code <= 0xff) bytes.push(code);
        else if (CP1252[ch] !== undefined) bytes.push(CP1252[ch]);
        else return null; // not representable in cp1252 → not simple mojibake
    }
    try {
        const fixed = decoder.decode(new Uint8Array(bytes));
        return fixed !== value ? fixed : null;
    } catch {
        return null; // not valid UTF-8 → leave as is
    }
}

type Change = { model: string; id: number; field: string; from: string; to: string };

async function main() {
    const apply = process.argv.includes('--apply');
    const changes: Change[] = [];
    const collect = (model: string, rows: Record<string, unknown>[], fields: string[]) => {
        for (const row of rows) {
            for (const field of fields) {
                const fixed = repair(row[field] as string | null);
                if (fixed) changes.push({ model, id: row.id as number, field, from: row[field] as string, to: fixed });
            }
        }
    };

    collect('option', await prisma.option.findMany(), ['name', 'description']);
    collect('car', await prisma.car.findMany(), ['brand', 'model', 'category', 'description', 'features', 'color']);
    collect('location', await prisma.location.findMany(), ['name', 'address', 'city']);

    for (const c of changes) {
        console.log(`${c.model} #${c.id}.${c.field}: "${c.from.slice(0, 60)}" → "${c.to.slice(0, 60)}"`);
    }
    console.log(`\n${changes.length} Felder betroffen.`);

    if (!apply) {
        console.log('Trockenlauf — nichts geändert. Mit --apply ausführen (vorher Backup!).');
        return;
    }

    await prisma.$transaction(async (tx) => {
        for (const c of changes) {
            const data = { [c.field]: c.to };
            if (c.model === 'option') await tx.option.update({ where: { id: c.id }, data });
            else if (c.model === 'car') await tx.car.update({ where: { id: c.id }, data });
            else await tx.location.update({ where: { id: c.id }, data });
        }
    }, { timeout: 120_000 });
    console.log(`${changes.length} Felder korrigiert.`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());

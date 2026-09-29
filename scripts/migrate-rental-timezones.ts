/**
 * One-off fix for rental times stored before the Vienna time-zone fix.
 *
 * Until then the server (Vercel / Cloudflare Workers, both UTC) parsed a
 * pickup of "10:00" as 10:00 UTC, i.e. 11:00/12:00 in Vienna. Emails and all
 * pages now show times in Vienna, so those old rentals appear 1–2 h late.
 * This script re-interprets the stored UTC wall-clock time as Vienna time for
 * every rental created before --cutoff (the moment the fix went live).
 *
 * Dry run (default, writes nothing):
 *   npx tsx scripts/migrate-rental-timezones.ts --cutoff=2026-09-30T08:00:00Z
 * Apply (take a database backup first!):
 *   npx tsx scripts/migrate-rental-timezones.ts --cutoff=2026-09-30T08:00:00Z --apply
 *
 * The run is recorded in SystemSettings and refuses to run twice.
 */
import 'dotenv/config';
import { fromZonedTime } from 'date-fns-tz';
import prisma from '../lib/prisma';

const TIME_ZONE = 'Europe/Vienna';
const MARKER_KEY = 'rentalTimezoneMigration';

function arg(name: string): string | undefined {
    const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
    return hit?.slice(name.length + 3);
}

/** Treats the UTC wall-clock of `stored` as Vienna local time. */
function reinterpret(stored: Date): Date {
    const wallClock = stored.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"
    return fromZonedTime(wallClock, TIME_ZONE);
}

async function main() {
    const cutoffStr = arg('cutoff');
    const apply = process.argv.includes('--apply');
    const cutoff = cutoffStr ? new Date(cutoffStr) : null;
    if (!cutoff || isNaN(cutoff.getTime())) {
        console.error('Bitte --cutoff=<ISO-Zeitpunkt des Deployments> angeben.');
        process.exit(1);
    }

    const marker = await prisma.systemSettings.findUnique({ where: { key: MARKER_KEY } });
    if (marker) {
        console.error(`Bereits ausgeführt: ${marker.value}. Abbruch.`);
        process.exit(1);
    }

    const allRentals = await prisma.rental.findMany({
        where: { createdAt: { lt: cutoff } },
        select: { id: true, contractNumber: true, startDate: true, endDate: true },
        orderBy: { id: 'asc' },
    });

    const fmt = (d: Date) => d.toLocaleString('de-AT', { timeZone: TIME_ZONE });
    // The booking forms only produce :00/:30 slots (admin and app: whole dates).
    // Other values (e.g. 10:23:17 from seed scripts) are real instants — skip them.
    const isFormTime = (d: Date) => d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0 && d.getUTCMinutes() % 30 === 0;
    const skipped = allRentals.filter((r) => !(isFormTime(r.startDate) && isFormTime(r.endDate)));
    const rentals = allRentals.filter((r) => isFormTime(r.startDate) && isFormTime(r.endDate));
    console.log(`${allRentals.length} Mieten vor ${cutoff.toISOString()}: ${rentals.length} zu korrigieren, ${skipped.length} übersprungen.`);
    for (const r of skipped.slice(0, 10)) {
        console.log(`  übersprungen #${r.id} ${r.contractNumber ?? ''}: ${fmt(r.startDate)} – ${fmt(r.endDate)} (keine Formular-Uhrzeit)`);
    }
    for (const r of rentals.slice(0, 10)) {
        console.log(
            `  #${r.id} ${r.contractNumber ?? ''}: ${fmt(r.startDate)} → ${fmt(reinterpret(r.startDate))}` +
            ` | ${fmt(r.endDate)} → ${fmt(reinterpret(r.endDate))}`
        );
    }
    if (rentals.length > 10) console.log(`  … und ${rentals.length - 10} weitere`);

    if (!apply) {
        console.log('\nTrockenlauf — nichts geändert. Mit --apply ausführen (vorher Backup!).');
        return;
    }

    await prisma.$transaction(async (tx) => {
        for (const r of rentals) {
            await tx.rental.update({
                where: { id: r.id },
                data: { startDate: reinterpret(r.startDate), endDate: reinterpret(r.endDate) },
            });
        }
        await tx.systemSettings.create({
            data: {
                key: MARKER_KEY,
                value: `${new Date().toISOString()} (cutoff ${cutoff.toISOString()}, ${rentals.length} Mieten)`,
                description: 'Einmalige Korrektur der Mietzeiten auf Europe/Vienna',
                category: 'system',
            },
        });
    }, { timeout: 120_000 });

    console.log(`\n${rentals.length} Mieten korrigiert.`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());

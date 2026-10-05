/**
 * Create (or reset) a SUPERADMIN staff account.
 *
 *   npx tsx scripts/create-superadmin.ts info@rent-ex.at "Geschäftsführung"
 *
 * The password is asked for interactively (hidden), so it never ends up in
 * shell history or logs. Uses the same scrypt parameters as lib/auth.ts.
 */
import 'dotenv/config';
import crypto from 'crypto';
import readline from 'readline';
import prisma from '../lib/prisma';
import { AUTH_CONFIG } from '../lib/config';

function hashPassword(password: string): string {
    const salt = crypto.randomBytes(AUTH_CONFIG.PASSWORD_SALT_LENGTH).toString('hex');
    const hash = crypto
        .scryptSync(password, salt, AUTH_CONFIG.PASSWORD_KEY_LENGTH, AUTH_CONFIG.PASSWORD_SCRYPT_OPTS)
        .toString('hex');
    return `${salt}:${hash}`;
}

function askHidden(question: string): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
        const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
        let muted = false;
        out._writeToOutput = (s: string) => {
            if (!muted || s.includes(question)) out.output.write(s);
        };
        rl.question(question, (answer) => {
            rl.close();
            process.stdout.write('\n');
            resolve(answer);
        });
        muted = true;
    });
}

async function main() {
    const email = process.argv[2]?.trim().toLowerCase();
    const name = process.argv[3]?.trim() || 'Administrator';
    if (!email || !email.includes('@')) {
        console.error('Usage: npx tsx scripts/create-superadmin.ts <email> ["Name"]');
        process.exit(1);
    }

    const password = await askHidden('Neues Passwort: ');
    const repeat = await askHidden('Passwort wiederholen: ');
    if (password !== repeat) {
        console.error('Die Passwörter stimmen nicht überein.');
        process.exit(1);
    }
    if (password.length < 10) {
        console.error('Das Passwort muss mindestens 10 Zeichen haben.');
        process.exit(1);
    }

    const passwordHash = hashPassword(password);
    const staff = await prisma.staff.upsert({
        where: { email },
        update: { passwordHash, isActive: true, role: 'SUPERADMIN' },
        create: { email, name, role: 'SUPERADMIN', passwordHash, isActive: true },
    });

    console.log(`OK: ${staff.email} ist aktiv (SUPERADMIN, id ${staff.id}).`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());

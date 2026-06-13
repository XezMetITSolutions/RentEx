'use server';

import { createBooking } from './booking';
import prisma from '@/lib/prisma';
const nodemailer = require('nodemailer');

interface MailTestResult {
    success: boolean;
    error?: string;
    logs: string[];
    response?: any;
}

function getDebugTransporter(logger: any) {
    const host = process.env.SMTP_HOST || 'w01dc0ea.kasserver.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER || 'rentex@metechnik.at';
    const pass = process.env.SMTP_PASS || '01528797Mb##';

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
        debug: true,
        logger: logger,
    });
}

export async function sendTestEmail(targetEmail: string): Promise<MailTestResult> {
    const logs: string[] = [];
    const customLogger = {
        info: (msg: any, ...args: any[]) => {
            logs.push(`[INFO] ${msg} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
        },
        warn: (msg: any, ...args: any[]) => {
            logs.push(`[WARN] ${msg} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
        },
        error: (msg: any, ...args: any[]) => {
            logs.push(`[ERROR] ${msg} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
        },
    };

    if (!targetEmail || !targetEmail.includes('@')) {
        return { success: false, error: 'Ungültige E-Mail-Adresse', logs };
    }

    try {
        const subject = 'RentEx SMTP Test-E-Mail';
        const body = `Hallo,

dies ist eine Test-E-Mail vom RentEx SMTP-System.

Wenn Sie diese E-Mail erhalten, funktioniert der SMTP-Versand erfolgreich!

Ziel-Adresse: ${targetEmail}
Gesendet am: ${new Date().toLocaleString()}

Mit freundlichen Grüßen,
Ihr RentEx-Entwickler-Team`;

        const transporter = getDebugTransporter(customLogger);
        const from = process.env.EMAIL_FROM || 'rentex@metechnik.at';

        logs.push(`Attempting to send mail to user: ${targetEmail}`);
        const infoUser = await transporter.sendMail({
            from: `"RentEx" <${from}>`,
            to: targetEmail,
            subject: subject,
            text: body,
        });
        logs.push(`User mail response received.`);

        logs.push(`Attempting to send copy to admin: rentex@metechnik.at`);
        const infoAdmin = await transporter.sendMail({
            from: `"RentEx" <${from}>`,
            to: 'rentex@metechnik.at',
            subject: `[Test Copy] ${subject} - ${targetEmail}`,
            body: `Dies ist eine Kopie des SMTP-Tests.

Empfänger: ${targetEmail}
Gesendet am: ${new Date().toLocaleString()}

Inhalt:
------------------------------------------
${body}`
        });
        logs.push(`Admin mail response received.`);

        return { 
            success: true, 
            logs, 
            response: { 
                userResponse: infoUser.response, 
                adminResponse: infoAdmin.response 
            } 
        };
    } catch (error: any) {
        console.error('[sendTestEmail] Error:', error);
        logs.push(`[CRITICAL ERROR] ${error.message || error}`);
        return { success: false, error: error.message || 'Interner Serverfehler', logs };
    }
}

export async function runRealBookingTest(targetEmail: string) {
    if (!targetEmail || !targetEmail.includes('@')) {
        return { success: false, error: 'Ungültige E-Mail-Adresse' };
    }

    try {
        // 1. Get an active car
        const car = await prisma.car.findFirst({
            where: { status: 'Active', isActive: true }
        });

        if (!car) {
            return { success: false, error: 'Keine aktiven Fahrzeuge in der Datenbank gefunden.' };
        }

        // 2. Set random future dates to avoid conflicts
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 30 + Math.floor(Math.random() * 90));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 2);

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // 3. Construct FormData
        const formData = new FormData();
        formData.append('carId', car.id.toString());
        formData.append('startDate', startDateStr);
        formData.append('endDate', endDateStr);
        formData.append('options', '');
        formData.append('totalAmount', (Number(car.dailyRate) * 2).toString());
        formData.append('paymentMethod', 'arrival'); // Bezahlung bei Abholung
        formData.append('customerType', 'Private');
        formData.append('firstName', 'Test-Mete');
        formData.append('lastName', 'Burcak');
        formData.append('email', targetEmail);
        formData.append('phone', '+43 660 1234567');
        formData.append('dateOfBirth', '1995-05-15');
        formData.append('licenseNumber', 'AT-TEST-888');
        formData.append('address', 'Hauptstraße 15');
        formData.append('city', 'Feldkirch');
        formData.append('postalCode', '6800');
        formData.append('country', 'Österreich');
        formData.append('agbAccepted', 'true');

        // 4. Call createBooking
        // Since createBooking will redirect on success, we catch the redirect or let it bubble up.
        // In Next.js, a redirect throws an error with digest 'NEXT_REDIRECT'.
        await createBooking(null, formData);

        return { success: true };
    } catch (err: any) {
        // If it's a redirect, bubble it up so Next.js redirects the browser
        if (err.digest && err.digest.startsWith('NEXT_REDIRECT')) {
            throw err;
        }
        console.error('[runRealBookingTest] Error:', err);
        return { success: false, error: err.message || 'Fehler bei der Test-Buchung' };
    }
}



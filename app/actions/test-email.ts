'use server';

export async function sendTestEmail(targetEmail: string) {
    if (!targetEmail || !targetEmail.includes('@')) {
        return { success: false, error: 'Ungültige E-Mail-Adresse' };
    }

    const host = process.env.SMTP_HOST || 'w01dc0ea.kasserver.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER || 'rentex@metechnik.at';
    const pass = process.env.SMTP_PASS || '01528797Mb##';

    const diagnosticInfo = {
        host,
        port,
        user,
        passLength: pass.length,
        hasPass: !!pass,
    };

    try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
            connectionTimeout: 10000, // 10 seconds timeout
        });

        const subject = 'RentEx SMTP Test-E-Mail';
        const body = `Hallo,

dies ist eine Test-E-Mail vom RentEx SMTP-System.

Wenn Sie diese E-Mail erhalten, funktioniert der SMTP-Versand erfolgreich!

Ziel-Adresse: ${targetEmail}
Gesendet am: ${new Date().toLocaleString()}

Mit freundlichen Grüßen,
Ihr RentEx-Entwickler-Team`;

        console.log(`[sendTestEmail] Attempting test send using config:`, { ...diagnosticInfo, pass: '***' });

        // 1. Send to target email
        await transporter.sendMail({
            from: `"RentEx Test" <${user}>`,
            to: targetEmail,
            subject: subject,
            text: body,
        });

        // 2. Send to admin copy
        try {
            await transporter.sendMail({
                from: `"RentEx Test" <${user}>`,
                to: 'rentex@metechnik.at',
                subject: `[Test Copy] ${subject} - ${targetEmail}`,
                text: `Dies ist eine Kopie des SMTP-Tests.

Empfänger: ${targetEmail}
Gesendet am: ${new Date().toLocaleString()}

Inhalt:
------------------------------------------
${body}`,
            });
        } catch (adminErr: any) {
            console.error('[sendTestEmail] Admin copy failed:', adminErr);
            return {
                success: false,
                error: `Mail an Kunden gesendet, aber Admin-Kopie fehlgeschlagen: ${adminErr.message || adminErr}`
            };
        }

        return { success: true };
    } catch (error: any) {
        console.error('[sendTestEmail] Detailed Error:', error);
        return {
            success: false,
            error: `SMTP Fehler: ${error.message || error} (Host: ${host}, Port: ${port}, User: ${user}, Pass-Len: ${pass.length})`
        };
    }
}

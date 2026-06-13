'use server';

import { sendEmail } from '@/lib/notificationTemplates';

export async function sendTestEmail(targetEmail: string) {
    if (!targetEmail || !targetEmail.includes('@')) {
        return { success: false, error: 'Ungültige E-Mail-Adresse' };
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

        // 1. Send to user-entered email
        const sentToUser = await sendEmail(targetEmail, { subject, body });

        // 2. Send to admin copy
        const sentToAdmin = await sendEmail('rentex@metechnik.at', {
            subject: `[Test Copy] ${subject} - ${targetEmail}`,
            body: `Dies ist eine Kopie des SMTP-Tests.

Empfänger: ${targetEmail}
Gesendet am: ${new Date().toLocaleString()}

Inhalt:
------------------------------------------
${body}`
        });

        if (sentToUser && sentToAdmin) {
            return { success: true };
        } else {
            return { 
                success: false, 
                error: `E-Mail-Versand fehlgeschlagen (Kunde: ${sentToUser ? 'OK' : 'Fehler'}, Admin: ${sentToAdmin ? 'OK' : 'Fehler'})` 
            };
        }
    } catch (error: any) {
        console.error('[sendTestEmail] Error:', error);
        return { success: false, error: error.message || 'Interner Serverfehler' };
    }
}

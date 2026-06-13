import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { de } from 'date-fns/locale';
// format is used inside fmt() below

const TZ = 'Europe/Vienna';

function fmt(date: Date, pattern: string): string {
    return format(toZonedTime(date, TZ), pattern, { locale: de });
}

const COMPANY_NAME    = process.env.COMPANY_NAME    || 'RentEx GmbH';
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || 'Hauptstraße 1, 6800 Feldkirch, Österreich';
const COMPANY_PHONE   = process.env.COMPANY_PHONE   || '+43 5522 123456';
const COMPANY_EMAIL   = process.env.COMPANY_EMAIL   || 'info@rent-ex.at';
const COMPANY_WEB     = process.env.COMPANY_WEB     || 'www.rent-ex.at';
const APP_URL         = process.env.NEXT_PUBLIC_APP_URL || 'https://rent-ex.at';
const DEFAULT_BRANCH  = process.env.DEFAULT_BRANCH  || 'Hauptstandort Feldkirch';

interface EmailTemplate {
    subject: string;
    body: string;
    html?: string;
}

interface RentalData {
    contractNumber: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    };
    car: {
        brand: string;
        model: string;
        plate: string;
    };
    rental: {
        startDate: Date;
        endDate: Date;
        pickupLocation?: string;
        totalAmount: number;
    };
}

export const emailTemplates = {
    // Booking Confirmation
    bookingConfirmation: (data: RentalData): EmailTemplate => ({
        subject: `Buchungsbestätigung - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

vielen Dank für Ihre Buchung bei RentEx!

Ihre Buchungsdetails:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vertragsnummer: ${data.contractNumber}
Fahrzeug: ${data.car.brand} ${data.car.model}
Kennzeichen: ${data.car.plate}

Mietbeginn: ${fmt(data.rental.startDate, 'dd.MM.yyyy HH:mm')}
Mietende: ${fmt(data.rental.endDate, 'dd.MM.yyyy HH:mm')}
Abholort: ${data.rental.pickupLocation || DEFAULT_BRANCH}

Gesamtbetrag: €${data.rental.totalAmount.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wichtige Hinweise:
• Bitte bringen Sie Ihren Führerschein und Personalausweis mit
• Die Fahrzeugübergabe erfolgt nach Vorlage aller Dokumente
• Bei Fragen erreichen Sie uns unter ${COMPANY_PHONE}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kein Konto? Registrieren Sie sich, um Ihre Buchungen
zu verwalten und von exklusiven Vorteilen zu profitieren:
${APP_URL}/register?email=${encodeURIComponent(data.customer.email)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wir freuen uns auf Ihren Besuch!

Mit freundlichen Grüßen
Ihr RentEx Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${COMPANY_NAME}
${COMPANY_ADDRESS}
Tel: ${COMPANY_PHONE} | Email: ${COMPANY_EMAIL}
Web: ${COMPANY_WEB}
    `.trim()
    }),

    // Pickup Reminder
    pickupReminder: (data: RentalData): EmailTemplate => ({
        subject: `Erinnerung: Fahrzeugabholung morgen - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

dies ist eine freundliche Erinnerung an Ihre morgige Fahrzeugabholung.

Abholtermin: ${fmt(data.rental.startDate, 'dd.MM.yyyy HH:mm')}
Fahrzeug: ${data.car.brand} ${data.car.model}
Abholort: ${data.rental.pickupLocation || DEFAULT_BRANCH}

Bitte bringen Sie mit:
✓ Gültiger Führerschein
✓ Personalausweis/Reisepass
✓ Kreditkarte für die Kaution

Bei Verspätung oder Änderungen kontaktieren Sie uns bitte umgehend.

Mit freundlichen Grüßen
Ihr RentEx Team

Tel: ${COMPANY_PHONE}
    `.trim()
    }),

    // Return Reminder
    returnReminder: (data: RentalData): EmailTemplate => ({
        subject: `Erinnerung: Fahrzeugrückgabe morgen - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

Ihre Mietdauer endet morgen. Bitte geben Sie das Fahrzeug rechtzeitig zurück.

Rückgabetermin: ${fmt(data.rental.endDate, 'dd.MM.yyyy HH:mm')}
Fahrzeug: ${data.car.brand} ${data.car.model} (${data.car.plate})
Rückgabeort: ${data.rental.pickupLocation || DEFAULT_BRANCH}

Wichtig:
• Bitte tanken Sie das Fahrzeug voll
• Entfernen Sie alle persönlichen Gegenstände
• Bei verspäteter Rückgabe fallen zusätzliche Gebühren an

Vielen Dank für Ihr Vertrauen!

Mit freundlichen Grüßen
Ihr RentEx Team
    `.trim()
    }),

    // Payment Confirmation
    paymentConfirmation: (data: RentalData): EmailTemplate => ({
        subject: `Zahlungsbestätigung - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

wir bestätigen den Eingang Ihrer Zahlung.

Vertragsnummer: ${data.contractNumber}
Betrag: €${data.rental.totalAmount.toFixed(2)}
Datum: ${fmt(new Date(), 'dd.MM.yyyy HH:mm')}

Eine detaillierte Rechnung finden Sie im Anhang.

Vielen Dank für Ihr Vertrauen!

Mit freundlichen Grüßen
Ihr RentEx Team

${COMPANY_NAME}
${COMPANY_EMAIL} | ${COMPANY_PHONE}
    `.trim()
    }),

    // Cancellation Confirmation
    cancellationConfirmation: (data: RentalData): EmailTemplate => ({
        subject: `Stornierungsbestätigung - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

wir bestätigen die Stornierung Ihrer Buchung.

Vertragsnummer: ${data.contractNumber}
Fahrzeug: ${data.car.brand} ${data.car.model}
Ursprünglicher Termin: ${fmt(data.rental.startDate, 'dd.MM.yyyy')}

Gemäß unseren Stornierungsbedingungen wird die Rückerstattung innerhalb von 5-7 Werktagen bearbeitet.

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
Ihr RentEx Team
    `.trim()
    }),

    // Maintenance Notification
    maintenanceNotification: (carData: { brand: string; model: string; plate: string; maintenanceType: string; dueDate: Date }): EmailTemplate => ({
        subject: `Wartungserinnerung: ${carData.brand} ${carData.model}`,
        body: `
Wartungserinnerung

Fahrzeug: ${carData.brand} ${carData.model}
Kennzeichen: ${carData.plate}
Wartungsart: ${carData.maintenanceType}
Fällig am: ${fmt(carData.dueDate, 'dd.MM.yyyy')}

Bitte planen Sie die Wartung rechtzeitig ein.

RentEx Wartungsmanagement
    `.trim()
    }),
};

export const smsTemplates = {
    pickupReminder: (data: RentalData): string =>
        `RentEx: Erinnerung - Fahrzeugabholung morgen ${fmt(data.rental.startDate, 'dd.MM HH:mm')}. ${data.car.brand} ${data.car.model}. Führerschein mitbringen!`,

    returnReminder: (data: RentalData): string =>
        `RentEx: Rückgabe morgen ${fmt(data.rental.endDate, 'dd.MM HH:mm')}. ${data.car.brand} ${data.car.model} (${data.car.plate}). Bitte vollgetankt zurückgeben.`,

    bookingConfirmation: (data: RentalData): string =>
        `RentEx: Buchung bestätigt! ${data.contractNumber}. ${data.car.brand} ${data.car.model}. Abholung: ${fmt(data.rental.startDate, 'dd.MM HH:mm')}`,

    paymentReceived: (data: RentalData): string =>
        `RentEx: Zahlung €${data.rental.totalAmount.toFixed(2)} erhalten. Vielen Dank! ${data.contractNumber}`,
};

function getTransporter() {
    const host = process.env.SMTP_HOST || 'w01dc0ea.kasserver.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER || 'rentex@metechnik.at';
    const pass = process.env.SMTP_PASS || '01528797Mb##';

    const nodemailer = require('nodemailer');
    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user,
            pass,
        },
    });
}

const FROM = process.env.EMAIL_FROM || 'rentex@metechnik.at';

export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
        const transporter = getTransporter();
        await transporter.sendMail({
            from: `"RentEx" <${FROM}>`,
            to,
            subject: template.subject,
            text: template.body,
            html: template.html,
        });
        return true;
    } catch (err) {
        console.error('[sendEmail] Failed:', err);
        return false;
    }
}

// SMS is not yet integrated — log only
export async function sendSMS(to: string, message: string): Promise<boolean> {
    console.log('[sendSMS] (not integrated) to:', to, 'message:', message);
    return false;
}


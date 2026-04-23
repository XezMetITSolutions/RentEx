import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { de } from 'date-fns/locale';
// format is used inside fmt() below

const TZ = 'Europe/Vienna';

function fmt(date: Date, pattern: string): string {
    return format(toZonedTime(date, TZ), pattern, { locale: de });
}

const COMPANY_NAME    = process.env.COMPANY_NAME    || 'RentEx GmbH';
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || 'HauptstraÃŸe 1, 6800 Feldkirch, Ã–sterreich';
const COMPANY_PHONE   = process.env.COMPANY_PHONE   || '+43 5522 123456';
const COMPANY_EMAIL   = process.env.COMPANY_EMAIL   || 'info@rent-ex.at';
const COMPANY_WEB     = process.env.COMPANY_WEB     || 'www.rent-ex.at';
const APP_URL         = process.env.NEXT_PUBLIC_APP_URL || 'https://rent-ex.at';
const DEFAULT_BRANCH  = process.env.DEFAULT_BRANCH  || 'Hauptstandort Feldkirch';

interface EmailTemplate {
    subject: string;
    body: string;
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
        subject: `BuchungsbestÃ¤tigung - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

vielen Dank fÃ¼r Ihre Buchung bei RentEx!

Ihre Buchungsdetails:
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Vertragsnummer: ${data.contractNumber}
Fahrzeug: ${data.car.brand} ${data.car.model}
Kennzeichen: ${data.car.plate}

Mietbeginn: ${fmt(data.rental.startDate, 'dd.MM.yyyy HH:mm')}
Mietende: ${fmt(data.rental.endDate, 'dd.MM.yyyy HH:mm')}
Abholort: ${data.rental.pickupLocation || DEFAULT_BRANCH}

Gesamtbetrag: â‚¬${data.rental.totalAmount.toFixed(2)}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

Wichtige Hinweise:
â€¢ Bitte bringen Sie Ihren FÃ¼hrerschein und Personalausweis mit
â€¢ Die FahrzeugÃ¼bergabe erfolgt nach Vorlage aller Dokumente
â€¢ Bei Fragen erreichen Sie uns unter ${COMPANY_PHONE}

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Kein Konto? Registrieren Sie sich, um Ihre Buchungen
zu verwalten und von exklusiven Vorteilen zu profitieren:
${APP_URL}/register?email=${encodeURIComponent(data.customer.email)}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

Wir freuen uns auf Ihren Besuch!

Mit freundlichen GrÃ¼ÃŸen
Ihr RentEx Team

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
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
âœ“ GÃ¼ltiger FÃ¼hrerschein
âœ“ Personalausweis/Reisepass
âœ“ Kreditkarte fÃ¼r die Kaution

Bei VerspÃ¤tung oder Ã„nderungen kontaktieren Sie uns bitte umgehend.

Mit freundlichen GrÃ¼ÃŸen
Ihr RentEx Team

Tel: ${COMPANY_PHONE}
    `.trim()
    }),

    // Return Reminder
    returnReminder: (data: RentalData): EmailTemplate => ({
        subject: `Erinnerung: FahrzeugrÃ¼ckgabe morgen - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

Ihre Mietdauer endet morgen. Bitte geben Sie das Fahrzeug rechtzeitig zurÃ¼ck.

RÃ¼ckgabetermin: ${fmt(data.rental.endDate, 'dd.MM.yyyy HH:mm')}
Fahrzeug: ${data.car.brand} ${data.car.model} (${data.car.plate})
RÃ¼ckgabeort: ${data.rental.pickupLocation || DEFAULT_BRANCH}

Wichtig:
â€¢ Bitte tanken Sie das Fahrzeug voll
â€¢ Entfernen Sie alle persÃ¶nlichen GegenstÃ¤nde
â€¢ Bei verspÃ¤teter RÃ¼ckgabe fallen zusÃ¤tzliche GebÃ¼hren an

Vielen Dank fÃ¼r Ihr Vertrauen!

Mit freundlichen GrÃ¼ÃŸen
Ihr RentEx Team
    `.trim()
    }),

    // Payment Confirmation
    paymentConfirmation: (data: RentalData): EmailTemplate => ({
        subject: `ZahlungsbestÃ¤tigung - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

wir bestÃ¤tigen den Eingang Ihrer Zahlung.

Vertragsnummer: ${data.contractNumber}
Betrag: â‚¬${data.rental.totalAmount.toFixed(2)}
Datum: ${fmt(new Date(), 'dd.MM.yyyy HH:mm')}

Eine detaillierte Rechnung finden Sie im Anhang.

Vielen Dank fÃ¼r Ihr Vertrauen!

Mit freundlichen GrÃ¼ÃŸen
Ihr RentEx Team

${COMPANY_NAME}
${COMPANY_EMAIL} | ${COMPANY_PHONE}
    `.trim()
    }),

    // Cancellation Confirmation
    cancellationConfirmation: (data: RentalData): EmailTemplate => ({
        subject: `StornierungsbestÃ¤tigung - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

wir bestÃ¤tigen die Stornierung Ihrer Buchung.

Vertragsnummer: ${data.contractNumber}
Fahrzeug: ${data.car.brand} ${data.car.model}
UrsprÃ¼nglicher Termin: ${fmt(data.rental.startDate, 'dd.MM.yyyy')}

GemÃ¤ÃŸ unseren Stornierungsbedingungen wird die RÃ¼ckerstattung innerhalb von 5-7 Werktagen bearbeitet.

Bei Fragen stehen wir Ihnen gerne zur VerfÃ¼gung.

Mit freundlichen GrÃ¼ÃŸen
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
FÃ¤llig am: ${fmt(carData.dueDate, 'dd.MM.yyyy')}

Bitte planen Sie die Wartung rechtzeitig ein.

RentEx Wartungsmanagement
    `.trim()
    }),
};

export const smsTemplates = {
    pickupReminder: (data: RentalData): string =>
        `RentEx: Erinnerung - Fahrzeugabholung morgen ${fmt(data.rental.startDate, 'dd.MM HH:mm')}. ${data.car.brand} ${data.car.model}. FÃ¼hrerschein mitbringen!`,

    returnReminder: (data: RentalData): string =>
        `RentEx: RÃ¼ckgabe morgen ${fmt(data.rental.endDate, 'dd.MM HH:mm')}. ${data.car.brand} ${data.car.model} (${data.car.plate}). Bitte vollgetankt zurÃ¼ckgeben.`,

    bookingConfirmation: (data: RentalData): string =>
        `RentEx: Buchung bestÃ¤tigt! ${data.contractNumber}. ${data.car.brand} ${data.car.model}. Abholung: ${fmt(data.rental.startDate, 'dd.MM HH:mm')}`,

    paymentReceived: (data: RentalData): string =>
        `RentEx: Zahlung â‚¬${data.rental.totalAmount.toFixed(2)} erhalten. Vielen Dank! ${data.contractNumber}`,
};

function getResend() {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY is not configured');
    const { Resend } = require('resend');
    return new Resend(key);
}

const FROM = process.env.EMAIL_FROM || 'noreply@rent-ex.at';

export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
        const resend = getResend();
        const { error } = await resend.emails.send({
            from: FROM,
            to,
            subject: template.subject,
            text: template.body,
        });
        if (error) {
            console.error('[sendEmail] Resend error:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('[sendEmail] Failed:', err);
        return false;
    }
}

// SMS is not yet integrated â€” log only
export async function sendSMS(to: string, message: string): Promise<boolean> {
    console.log('[sendSMS] (not integrated) to:', to, 'message:', message);
    return false;
}

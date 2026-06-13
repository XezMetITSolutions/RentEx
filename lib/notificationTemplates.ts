import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { de } from 'date-fns/locale';
// format is used inside fmt() below

const TZ = 'Europe/Vienna';

function fmt(date: Date, pattern: string): string {
    return format(toZonedTime(date, TZ), pattern, { locale: de });
}

const COMPANY_NAME    = process.env.COMPANY_NAME    || 'Rent-Ex GmbH';
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || 'Illstraße 75a, 6800 Feldkirch, Österreich';
const COMPANY_PHONE   = process.env.COMPANY_PHONE   || '+43 660 9996800';
const COMPANY_EMAIL   = process.env.COMPANY_EMAIL   || 'info@rent-ex.at';
const COMPANY_WEB     = process.env.COMPANY_WEB     || 'www.rent-ex.at';
const APP_URL         = process.env.NEXT_PUBLIC_APP_URL || 'https://rent-ex.vercel.app';
const DEFAULT_BRANCH  = process.env.DEFAULT_BRANCH  || 'Rent-Ex Feldkirch';

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
    bookingConfirmation: (data: RentalData): EmailTemplate => {
        const startDateStr = fmt(data.rental.startDate, 'dd.MM.yyyy HH:mm');
        const endDateStr = fmt(data.rental.endDate, 'dd.MM.yyyy HH:mm');
        const pickupLoc = data.rental.pickupLocation || DEFAULT_BRANCH;

        const body = `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

vielen Dank für Ihre Buchung bei RentEx!

Ihre Buchungsdetails:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vertragsnummer: ${data.contractNumber}
Fahrzeug: ${data.car.brand} ${data.car.model}
Kennzeichen: ${data.car.plate}

Mietbeginn: ${startDateStr}
Mietende: ${endDateStr}
Abholort: ${pickupLoc}

Gesamtbetrag: €${data.rental.totalAmount.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wichtige Hinweise:
• Bitte bringen Sie Ihren Führerschein und Personalausweis mit.
• Die Fahrzeugübergabe erfolgt nach Vorlage aller Dokumente.
• Unsere Allgemeinen Geschäftsbedingungen (AGB) finden Sie unter: ${APP_URL}/terms

Bei Fragen erreichen Sie uns unter ${COMPANY_PHONE}.

Mit freundlichen Grüßen
Ihr RentEx Team
        `.trim();

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buchungsbestätigung</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f0f11; padding: 30px 15px;">
        <tr>
            <td>
                <table width="100%" maxWidth="600px" align="center" cellpadding="0" cellspacing="0" border="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; max-width: 600px; margin: 0 auto;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #09090b; padding: 25px 25px 20px 25px; border-bottom: 3px solid #dc2626;">
                            <img src="${APP_URL}/assets/logo.png" alt="Rent-Ex Logo" style="height: 45px; width: auto; display: block; border: 0; margin-bottom: 8px;">
                            <span style="color: #ffffff; font-size: 14px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; display: block;">RENT<span style="color: #dc2626;">EX</span></span>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px 25px;">
                            <!-- Success Badge -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.25); border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td align="center" style="padding: 15px;">
                                        <span style="color: #ef4444; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 4px;">BUCHUNG BESTÄTIGT</span>
                                        <span style="color: #ffffff; font-size: 16px; font-weight: bold; letter-spacing: 1px;">SPO-VERT-NR: ${data.contractNumber}</span>
                                    </td>
                                </tr>
                            </table>

                            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
                            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                                vielen Dank für Ihre Buchung bei <strong>RentEx</strong>! Wir haben Ihr Fahrzeug für Sie reserviert. Nachfolgend finden Sie alle Details zu Ihrer Anmietung.
                            </p>

                            <!-- Rental Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Fahrzeugdaten</h3>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Fahrzeug:</strong> ${data.car.brand} ${data.car.model}</p>
                                        <p style="margin: 0; font-size: 15px; color: #f4f4f5;"><strong>Kennzeichen:</strong> ${data.car.plate}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 20px 20px 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Mietzeitraum & Ort</h3>
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td width="50%" style="padding-right: 10px; vertical-align: top;">
                                                    <span style="color: #a1a1aa; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">Abholung</span>
                                                    <strong style="color: #f4f4f5; font-size: 14px; display: block;">${startDateStr}</strong>
                                                    <span style="color: #a1a1aa; font-size: 12px; display: block; margin-top: 2px;">${pickupLoc}</span>
                                                </td>
                                                <td width="50%" style="vertical-align: top;">
                                                    <span style="color: #a1a1aa; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">Rückgabe</span>
                                                    <strong style="color: #f4f4f5; font-size: 14px; display: block;">${endDateStr}</strong>
                                                    <span style="color: #a1a1aa; font-size: 12px; display: block; margin-top: 2px;">${pickupLoc}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Cost Breakdown -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090b; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="color: #a1a1aa; font-size: 14px; padding-bottom: 8px;">Gesamtbetrag (inkl. MwSt.)</td>
                                                <td align="right" style="color: #ffffff; font-size: 20px; font-weight: bold; padding-bottom: 8px;">€${data.rental.totalAmount.toFixed(2)}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Important Checklist -->
                            <h3 style="color: #ffffff; font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 12px;">Bitte bringen Sie zur Abholung mit:</h3>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; font-size: 14px; color: #a1a1aa;">
                                <tr>
                                    <td width="24px" style="vertical-align: top; color: #dc2626; font-weight: bold;">✓</td>
                                    <td style="padding-bottom: 8px; color: #e4e4e7;">Gültiger Führerschein (Original)</td>
                                </tr>
                                <tr>
                                    <td width="24px" style="vertical-align: top; color: #dc2626; font-weight: bold;">✓</td>
                                    <td style="padding-bottom: 8px; color: #e4e4e7;">Lichtbildausweis (Personalausweis oder Reisepass)</td>
                                </tr>
                                <tr>
                                    <td width="24px" style="vertical-align: top; color: #dc2626; font-weight: bold;">✓</td>
                                    <td style="color: #e4e4e7;">Kredit-/Debitkarte für eventuelle Kautionshinterlegung</td>
                                </tr>
                            </table>

                            <!-- Legal Section (AGB) -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090b; border-left: 4px solid #dc2626; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 15px; font-size: 13px; line-height: 1.5; color: #a1a1aa;">
                                        <strong style="color: #ffffff; display: block; margin-bottom: 4px;">Rechtliche Hinweise:</strong>
                                        Mit dem Abschluss der Buchung haben Sie unsere Allgemeinen Geschäftsbedingungen (AGB) und die Datenschutzerklärung akzeptiert. Die AGB finden Sie jederzeit online unter: <br>
                                        <a href="${APP_URL}/terms" target="_blank" style="color: #dc2626; font-weight: bold; text-decoration: none;">${APP_URL}/terms</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 0;">
                                Haben Sie Fragen? Kontaktieren Sie uns telefonisch unter <a href="tel:${COMPANY_PHONE}" style="color: #ffffff; text-decoration: none; font-weight: bold;">${COMPANY_PHONE}</a> oder per E-Mail.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #09090b; padding: 25px; font-size: 12px; color: #71717a; border-top: 1px solid #27272a;">
                            <p style="margin: 0 0 4px 0; font-weight: bold; color: #a1a1aa;">${COMPANY_NAME}</p>
                            <p style="margin: 0 0 10px 0;">${COMPANY_ADDRESS}</p>
                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} RentEx GmbH. Alle Rechte vorbehalten.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        return { subject: `Buchungsbestätigung - ${data.contractNumber}`, body, html };
    },

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


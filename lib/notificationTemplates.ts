import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { de } from 'date-fns/locale';
import nodemailer from 'nodemailer';

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

export function wrapHtmlLayout(title: string, subtitle: string, contentHtml: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f0f11; padding: 30px 15px;">
        <tr>
            <td>
                <table width="100%" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; max-width: 600px; margin: 0 auto;" align="center" cellpadding="0" cellspacing="0" border="0">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #09090b; padding: 25px; border-bottom: 3px solid #dc2626;">
                            <img src="${APP_URL}/assets/logo.png" alt="Rent-Ex Logo" style="height: 45px; width: auto; display: block; border: 0;">
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px 25px;">
                            <!-- Status Badge -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.25); border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td align="center" style="padding: 15px;">
                                        <span style="color: #ef4444; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 4px;">${title}</span>
                                        <span style="color: #ffffff; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${subtitle}</span>
                                    </td>
                                </tr>
                            </table>

                            ${contentHtml}

                            <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 40px 0 0 0;">
                                Haben Sie Fragen? Kontaktieren Sie uns telefonisch unter <a href="tel:${COMPANY_PHONE.replace(/\s+/g, '')}" style="color: #ffffff; text-decoration: none; font-weight: bold;">${COMPANY_PHONE}</a> oder per E-Mail.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #09090b; padding: 25px; font-size: 12px; color: #71717a; border-top: 1px solid #27272a;">
                            <p style="margin: 0 0 4px 0; font-weight: bold; color: #a1a1aa;">${COMPANY_NAME}</p>
                            <p style="margin: 0 0 10px 0;">${COMPANY_ADDRESS}</p>
                            <p style="margin: 0;">&copy; 2026 ${COMPANY_NAME}. Alle Rechte vorbehalten.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

export const emailTemplates = {
    // Booking Confirmation
    bookingConfirmation: (data: RentalData): EmailTemplate => {
        const title = "BUCHUNG BESTÄTIGT";
        const subtitle = `VERT-NR: ${data.contractNumber}`;
        const contentHtml = `
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                vielen Dank für Ihre Buchung bei <strong>${COMPANY_NAME}</strong>! Wir haben Ihr Fahrzeug für Sie reserviert. Nachfolgend finden Sie alle Details zu Ihrer Anmietung.
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
                                    <strong style="color: #f4f4f5; font-size: 14px; display: block;">${fmt(data.rental.startDate, 'dd.MM.yyyy HH:mm')}</strong>
                                    <span style="color: #a1a1aa; font-size: 12px; display: block; margin-top: 2px;">${data.rental.pickupLocation || DEFAULT_BRANCH}</span>
                                </td>
                                <td width="50%" style="vertical-align: top;">
                                    <span style="color: #a1a1aa; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">Rückgabe</span>
                                    <strong style="color: #f4f4f5; font-size: 14px; display: block;">${fmt(data.rental.endDate, 'dd.MM.yyyy HH:mm')}</strong>
                                    <span style="color: #a1a1aa; font-size: 12px; display: block; margin-top: 2px;">${data.rental.pickupLocation || DEFAULT_BRANCH}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <!-- Fuel Policy Badge -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 12px; margin-bottom: 25px;">
                <tr>
                    <td style="padding: 15px; font-size: 14px; line-height: 1.5; color: #e4e4e7;">
                        <strong style="color: #eab308; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Tankregelung (Voll / Voll)</strong>
                        Sie erhalten das Fahrzeug vollgetankt und geben es bitte ebenfalls vollgetankt wieder zurück. Fehlender Kraftstoff wird andernfalls bei Rückgabe in Rechnung gestellt.
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
        `;

        return {
            subject: `Buchungsbestätigung - ${data.contractNumber}`,
            body: `Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName}, vielen Dank für Ihre Buchung bei RentEx! Vertragsnummer: ${data.contractNumber}. Fahrzeug: ${data.car.brand} ${data.car.model}. Gesamtbetrag: €${data.rental.totalAmount.toFixed(2)}.`,
            html: wrapHtmlLayout(title, subtitle, contentHtml)
        };
    },

    // Pickup Reminder
    pickupReminder: (data: RentalData): EmailTemplate => {
        const title = "ABHOLERINNERUNG";
        const subtitle = `VERT-NR: ${data.contractNumber}`;
        const contentHtml = `
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                dies ist eine freundliche Erinnerung an Ihre morgige Fahrzeugabholung.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                    <td style="padding: 20px;">
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Fahrzeug:</strong> ${data.car.brand} ${data.car.model}</p>
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Abholzeitpunkt:</strong> ${fmt(data.rental.startDate, 'dd.MM.yyyy HH:mm')}</p>
                        <p style="margin: 0; font-size: 15px; color: #f4f4f5;"><strong>Abholort:</strong> ${data.rental.pickupLocation || DEFAULT_BRANCH}</p>
                    </td>
                </tr>
            </table>

            <h3 style="color: #ffffff; font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 12px;">Bitte bringen Sie mit:</h3>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; font-size: 14px; color: #a1a1aa;">
                <tr>
                    <td width="24px" style="vertical-align: top; color: #dc2626; font-weight: bold;">✓</td>
                    <td style="padding-bottom: 8px; color: #e4e4e7;">Gültiger Führerschein</td>
                </tr>
                <tr>
                    <td width="24px" style="vertical-align: top; color: #dc2626; font-weight: bold;">✓</td>
                    <td style="padding-bottom: 8px; color: #e4e4e7;">Personalausweis oder Reisepass</td>
                </tr>
                <tr>
                    <td width="24px" style="vertical-align: top; color: #dc2626; font-weight: bold;">✓</td>
                    <td style="color: #e4e4e7;">Kreditkarte für die Kaution</td>
                </tr>
            </table>
        `;

        return {
            subject: `Erinnerung: Fahrzeugabholung morgen - ${data.contractNumber}`,
            body: `Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName}, dies ist eine freundliche Erinnerung an Ihre morgige Fahrzeugabholung.`,
            html: wrapHtmlLayout(title, subtitle, contentHtml)
        };
    },

    // Return Reminder
    returnReminder: (data: RentalData): EmailTemplate => {
        const title = "RÜCKGABEERINNERUNG";
        const subtitle = `VERT-NR: ${data.contractNumber}`;
        const contentHtml = `
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                Ihre Mietdauer endet morgen. Bitte geben Sie das Fahrzeug rechtzeitig zurück.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                    <td style="padding: 20px;">
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Fahrzeug:</strong> ${data.car.brand} ${data.car.model} (${data.car.plate})</p>
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Rückgabezeitpunkt:</strong> ${fmt(data.rental.endDate, 'dd.MM.yyyy HH:mm')}</p>
                        <p style="margin: 0; font-size: 15px; color: #f4f4f5;"><strong>Rückgabeort:</strong> ${data.rental.pickupLocation || DEFAULT_BRANCH}</p>
                    </td>
                </tr>
            </table>

            <h3 style="color: #ffffff; font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 12px;">Wichtige Hinweise zur Rückgabe:</h3>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; font-size: 14px; color: #a1a1aa;">
                <tr>
                    <td width="24px" style="vertical-align: top; color: #dc2626; font-weight: bold;">•</td>
                    <td style="padding-bottom: 8px; color: #e4e4e7;">Bitte tanken Sie das Fahrzeug vor Rückgabe voll.</td>
                </tr>
                <tr>
                    <td width="24px" style="vertical-align: top; color: #dc2626; font-weight: bold;">•</td>
                    <td style="padding-bottom: 8px; color: #e4e4e7;">Entfernen Sie alle persönlichen Gegenstände.</td>
                </tr>
                <tr>
                    <td width="24px" style="vertical-align: top; color: #dc2626; font-weight: bold;">•</td>
                    <td style="color: #e4e4e7;">Bei verspäteter Rückgabe fallen zusätzliche Gebühren an.</td>
                </tr>
            </table>
        `;

        return {
            subject: `Erinnerung: Fahrzeugrückgabe morgen - ${data.contractNumber}`,
            body: `Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName}, Ihre Mietdauer endet morgen.`,
            html: wrapHtmlLayout(title, subtitle, contentHtml)
        };
    },

    // Payment Confirmation
    paymentConfirmation: (data: RentalData): EmailTemplate => {
        const title = "ZAHLUNGSBESTÄTIGUNG";
        const subtitle = `VERT-NR: ${data.contractNumber}`;
        const contentHtml = `
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                wir bestätigen den erfolgreichen Eingang Ihrer Online-Zahlung.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                    <td style="padding: 20px;">
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Vertragsnummer:</strong> ${data.contractNumber}</p>
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Bezahlter Betrag:</strong> €${data.rental.totalAmount.toFixed(2)}</p>
                        <p style="margin: 0; font-size: 15px; color: #f4f4f5;"><strong>Datum:</strong> ${fmt(new Date(), 'dd.MM.yyyy HH:mm')}</p>
                    </td>
                </tr>
            </table>

            <p style="color: #a1a1aa; font-size: 14px;">
                Die detaillierte Rechnung finden Sie als PDF-Dokument in Ihrem Dashboard.
            </p>
        `;

        return {
            subject: `Zahlungsbestätigung - ${data.contractNumber}`,
            body: `Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName}, wir bestätigen den Eingang Ihrer Zahlung.`,
            html: wrapHtmlLayout(title, subtitle, contentHtml)
        };
    },

    // Cancellation Confirmation
    cancellationConfirmation: (data: RentalData): EmailTemplate => {
        const title = "STORNIERUNGSBESTÄTIGUNG";
        const subtitle = `VERT-NR: ${data.contractNumber}`;
        const contentHtml = `
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                wir bestätigen hiermit die Stornierung Ihrer Buchung.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                    <td style="padding: 20px;">
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Vertragsnummer:</strong> ${data.contractNumber}</p>
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Fahrzeug:</strong> ${data.car.brand} ${data.car.model}</p>
                        <p style="margin: 0; font-size: 15px; color: #f4f4f5;"><strong>Mietzeitraum:</strong> ${fmt(data.rental.startDate, 'dd.MM.yyyy')}</p>
                    </td>
                </tr>
            </table>

            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5;">
                Eventuelle Rückerstattungen werden gemäß unseren Stornierungsbedingungen innerhalb der nächsten 5-7 Werktage auf Ihr ursprüngliches Zahlungsmittel überwiesen.
            </p>
        `;

        return {
            subject: `Stornierungsbestätigung - ${data.contractNumber}`,
            body: `Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName}, wir bestätigen die Stornierung Ihrer Buchung.`,
            html: wrapHtmlLayout(title, subtitle, contentHtml)
        };
    },

    // Maintenance Notification
    maintenanceNotification: (carData: { brand: string; model: string; plate: string; maintenanceType: string; dueDate: Date }): EmailTemplate => {
        const title = "WARTUNGSERINNERUNG";
        const subtitle = `KENNZEICHEN: ${carData.plate}`;
        const contentHtml = `
            <h2 style="color: #ffffff; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Wartung fällig</h2>
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                    <td style="padding: 20px;">
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Fahrzeug:</strong> ${carData.brand} ${carData.model}</p>
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Kennzeichen:</strong> ${carData.plate}</p>
                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Wartungstyp:</strong> ${carData.maintenanceType}</p>
                        <p style="margin: 0; font-size: 15px; color: #f4f4f5;"><strong>Fällig am:</strong> ${fmt(carData.dueDate, 'dd.MM.yyyy')}</p>
                    </td>
                </tr>
            </table>

            <p style="color: #a1a1aa; font-size: 14px;">
                Bitte planen Sie das Fahrzeug zeitnah für die Wartung ein.
            </p>
        `;

        return {
            subject: `Wartungserinnerung: ${carData.brand} ${carData.model}`,
            body: `Wartung fällig für ${carData.brand} ${carData.model} (${carData.plate}).`,
            html: wrapHtmlLayout(title, subtitle, contentHtml)
        };
    },
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

const FROM = process.env.EMAIL_FROM || 'noreply@rent-ex.at';

export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
        if (process.env.SMTP_HOST) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: FROM,
                to,
                subject: template.subject,
                text: template.body,
                html: template.html,
            });

            return true;
        }

        const key = process.env.RESEND_API_KEY;
        if (!key) throw new Error('Neither SMTP_HOST nor RESEND_API_KEY is configured');
        const { Resend } = require('resend');
        const resend = new Resend(key);
        const { error } = await resend.emails.send({
            from: FROM,
            to,
            subject: template.subject,
            text: template.body,
            html: template.html,
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

export async function sendSMS(to: string, message: string): Promise<boolean> {
    console.log('[sendSMS] (not integrated) to:', to, 'message:', message);
    return false;
}

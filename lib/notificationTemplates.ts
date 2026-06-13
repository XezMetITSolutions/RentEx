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
        color?: string;
    };
    rental: {
        startDate: Date;
        endDate: Date;
        pickupLocation?: string;
        pickupAddress?: string;
        totalAmount: number;
    };
}

function wrapInEmailLayout(title: string, badgeText: string, subText: string, badgeBg: string, badgeBorder: string, badgeColor: string, contentHtml: string): string {
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
                <table width="100%" maxWidth="600px" align="center" cellpadding="0" cellspacing="0" border="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; max-width: 600px; margin: 0 auto;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #09090b; padding: 25px; border-bottom: 3px solid #dc2626;">
                            <img src="${APP_URL}/assets/logo.png" alt="Rent-Ex Logo" style="height: 45px; width: auto; display: block; border: 0;">
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px 25px;">
                            <!-- Success/Status Badge -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td align="center" style="padding: 15px;">
                                        <span style="color: ${badgeColor}; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: block;${subText ? ' margin-bottom: 4px;' : ''}">${badgeText}</span>
                                        ${subText ? `<span style="color: #ffffff; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${subText}</span>` : ''}
                                    </td>
                                </tr>
                            </table>

                            ${contentHtml}

                            <!-- Contact info -->
                            <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 25px 0 0 0;">
                                Haben Sie Fragen? Kontaktieren Sie uns telefonisch unter <a href="tel:${COMPANY_PHONE}" style="color: #ffffff; text-decoration: none; font-weight: bold;">${COMPANY_PHONE}</a> oder per E-Mail.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #09090b; padding: 25px; font-size: 12px; color: #71717a; border-top: 1px solid #27272a;">
                            <p style="margin: 0 0 4px 0; font-weight: bold; color: #a1a1aa;">${COMPANY_NAME}</p>
                            <p style="margin: 0 0 10px 0;">${COMPANY_ADDRESS}</p>
                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. Alle Rechte vorbehalten.</p>
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
        const startDateStr = fmt(data.rental.startDate, 'dd.MM.yyyy HH:mm');
        const endDateStr = fmt(data.rental.endDate, 'dd.MM.yyyy HH:mm');
        const pickupLoc = data.rental.pickupLocation || DEFAULT_BRANCH;

        const body = `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

vielen Dank für Ihre Buchung bei Rent-Ex!

Ihre Buchungsdetails:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vertragsnummer: ${data.contractNumber}
Fahrzeug: ${data.car.brand} ${data.car.model} (${data.car.color || ''})
Kennzeichen: ${data.car.plate}

Mietbeginn: ${startDateStr}
Mietende: ${endDateStr}
Abholort: ${pickupLoc} ${data.rental.pickupAddress ? `(${data.rental.pickupAddress})` : ''}

Gesamtbetrag: €${data.rental.totalAmount.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wichtige Hinweise:
• Bitte bringen Sie Ihren Führerschein und Personalausweis mit.
• Die Fahrzeugübergabe erfolgt nach Vorlage aller Dokumente.
• Tankregelung (Voll/Voll): Sie erhalten das Fahrzeug vollgetankt und geben es ebenfalls vollgetankt wieder zurück.
• Unsere Allgemeinen Geschäftsbedingungen (AGB) finden Sie unter: ${APP_URL}/terms

Bei Fragen erreichen Sie uns unter ${COMPANY_PHONE}.

Mit freundlichen Grüßen
Ihr Rent-Ex Team
        `.trim();

        const contentHtml = `
                            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
                            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                                vielen Dank für Ihre Buchung bei <strong>Rent-Ex</strong>! Wir haben Ihr Fahrzeug für Sie reserviert. Nachfolgend finden Sie alle Details zu Ihrer Anmietung.
                            </p>

                            <!-- Rental Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Fahrzeugdaten</h3>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Fahrzeug:</strong> ${data.car.brand} ${data.car.model}</p>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Farbe:</strong> ${data.car.color || '-'}</p>
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
                                                    ${data.rental.pickupAddress ? `<span style="color: #71717a; font-size: 11px; display: block; margin-top: 2px;">${data.rental.pickupAddress}</span>` : ''}
                                                </td>
                                                <td width="50%" style="vertical-align: top;">
                                                    <span style="color: #a1a1aa; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">Rückgabe</span>
                                                    <strong style="color: #f4f4f5; font-size: 14px; display: block;">${endDateStr}</strong>
                                                    <span style="color: #a1a1aa; font-size: 12px; display: block; margin-top: 2px;">${pickupLoc}</span>
                                                    ${data.rental.pickupAddress ? `<span style="color: #71717a; font-size: 11px; display: block; margin-top: 2px;">${data.rental.pickupAddress}</span>` : ''}
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
        `.trim();

        const html = wrapInEmailLayout(
            `Buchungsbestätigung - ${data.contractNumber}`,
            'BUCHUNG BESTÄTIGT',
            `SPO-VERT-NR: ${data.contractNumber}`,
            'rgba(220, 38, 38, 0.08)',
            'rgba(220, 38, 38, 0.25)',
            '#ef4444',
            contentHtml
        );

        return { subject: `Buchungsbestätigung - ${data.contractNumber}`, body, html };
    },

    // Pickup Reminder
    pickupReminder: (data: RentalData): EmailTemplate => {
        const startDateStr = fmt(data.rental.startDate, 'dd.MM.yyyy HH:mm');
        const pickupLoc = data.rental.pickupLocation || DEFAULT_BRANCH;

        const body = `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

dies ist eine freundliche Erinnerung an Ihre morgige Fahrzeugabholung.

Abholtermin: ${startDateStr}
Fahrzeug: ${data.car.brand} ${data.car.model}
Abholort: ${pickupLoc} ${data.rental.pickupAddress ? `(${data.rental.pickupAddress})` : ''}

Bitte bringen Sie mit:
✓ Gültiger Führerschein (Original)
✓ Personalausweis/Reisepass
✓ Kreditkarte für die Kaution

Bei Verspätung oder Änderungen kontaktieren Sie uns bitte umgehend unter ${COMPANY_PHONE}.

Mit freundlichen Grüßen
Ihr Rent-Ex Team
        `.trim();

        const contentHtml = `
                            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
                            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                                dies ist eine freundliche Erinnerung an Ihre morgige Fahrzeugabholung. Ihr Fahrzeug steht für Sie bereit!
                            </p>

                            <!-- Rental Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Fahrzeugdaten</h3>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Fahrzeug:</strong> ${data.car.brand} ${data.car.model}</p>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Farbe:</strong> ${data.car.color || '-'}</p>
                                        <p style="margin: 0; font-size: 15px; color: #f4f4f5;"><strong>Kennzeichen:</strong> ${data.car.plate}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 20px 20px 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Abholdetails</h3>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Abholzeit:</strong> ${startDateStr}</p>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Abholort:</strong> ${pickupLoc}</p>
                                        ${data.rental.pickupAddress ? `<p style="margin: 0; font-size: 14px; color: #a1a1aa;">${data.rental.pickupAddress}</p>` : ''}
                                    </td>
                                </tr>
                            </table>

                            <!-- Fuel Policy Badge -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 15px; font-size: 14px; line-height: 1.5; color: #e4e4e7;">
                                        <strong style="color: #eab308; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Tankregelung (Voll / Voll)</strong>
                                        Sie erhalten das Fahrzeug vollgetankt und geben es bitte ebenfalls vollgetankt wieder zurück.
                                    </td>
                                </tr>
                            </table>

                            <!-- Important Checklist -->
                            <h3 style="color: #ffffff; font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 12px;">Bitte bringen Sie unbedingt mit:</h3>
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
        `.trim();

        const html = wrapInEmailLayout(
            `Fahrzeugabholung morgen - ${data.contractNumber}`,
            'ABHOLUNG MORGEN',
            `SPO-VERT-NR: ${data.contractNumber}`,
            'rgba(234, 179, 8, 0.08)',
            'rgba(234, 179, 8, 0.25)',
            '#f59e0b',
            contentHtml
        );

        return { subject: `Erinnerung: Fahrzeugabholung morgen - ${data.contractNumber}`, body, html };
    },

    // Return Reminder
    returnReminder: (data: RentalData): EmailTemplate => {
        const endDateStr = fmt(data.rental.endDate, 'dd.MM.yyyy HH:mm');
        const pickupLoc = data.rental.pickupLocation || DEFAULT_BRANCH;

        const body = `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

Ihre Mietdauer endet morgen. Bitte geben Sie das Fahrzeug rechtzeitig zurück.

Rückgabetermin: ${endDateStr}
Fahrzeug: ${data.car.brand} ${data.car.model} (${data.car.plate})
Rückgabeort: ${pickupLoc} ${data.rental.pickupAddress ? `(${data.rental.pickupAddress})` : ''}

Wichtig:
• Bitte tanken Sie das Fahrzeug voll
• Entfernen Sie alle persönlichen Gegenstände
• Bei verspäteter Rückgabe fallen zusätzliche Gebühren an

Vielen Dank für Ihr Vertrauen!

Mit freundlichen Grüßen
Ihr Rent-Ex Team
        `.trim();

        const contentHtml = `
                            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
                            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                                Ihre Mietdauer endet morgen. Bitte geben Sie das Fahrzeug pünktlich an der Station zurück.
                            </p>

                            <!-- Rental Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Fahrzeugdaten</h3>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Fahrzeug:</strong> ${data.car.brand} ${data.car.model}</p>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Farbe:</strong> ${data.car.color || '-'}</p>
                                        <p style="margin: 0; font-size: 15px; color: #f4f4f5;"><strong>Kennzeichen:</strong> ${data.car.plate}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 20px 20px 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Rückgabedetails</h3>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Rückgabezeit:</strong> ${endDateStr}</p>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Rückgabeort:</strong> ${pickupLoc}</p>
                                        ${data.rental.pickupAddress ? `<p style="margin: 0; font-size: 14px; color: #a1a1aa;">${data.rental.pickupAddress}</p>` : ''}
                                    </td>
                                </tr>
                            </table>

                            <!-- Important Checklist -->
                            <h3 style="color: #ffffff; font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 12px;">Wichtige Rückgabehinweise:</h3>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; font-size: 14px; color: #a1a1aa;">
                                <tr>
                                    <td width="24px" style="vertical-align: top; color: #3b82f6; font-weight: bold;">✓</td>
                                    <td style="padding-bottom: 8px; color: #e4e4e7;"><strong>Vollgetankt zurückgeben:</strong> Bitte tanken Sie das Fahrzeug voll, um zusätzliche Gebühren zu vermeiden.</td>
                                </tr>
                                <tr>
                                    <td width="24px" style="vertical-align: top; color: #3b82f6; font-weight: bold;">✓</td>
                                    <td style="padding-bottom: 8px; color: #e4e4e7;"><strong>Wertsachen kontrollieren:</strong> Bitte prüfen Sie Handschuhfach, Türtaschen und Kofferraum auf persönliche Gegenstände.</td>
                                </tr>
                                <tr>
                                    <td width="24px" style="vertical-align: top; color: #3b82f6; font-weight: bold;">✓</td>
                                    <td style="color: #e4e4e7;"><strong>Pünktlichkeit:</strong> Bei verspäteter Rückgabe können zusätzliche Tagesgebühren anfallen.</td>
                                </tr>
                            </table>
        `.trim();

        const html = wrapInEmailLayout(
            `Fahrzeugrückgabe morgen - ${data.contractNumber}`,
            'RÜCKGABE MORGEN',
            `SPO-VERT-NR: ${data.contractNumber}`,
            'rgba(59, 130, 246, 0.08)',
            'rgba(59, 130, 246, 0.25)',
            '#3b82f6',
            contentHtml
        );

        return { subject: `Erinnerung: Fahrzeugrückgabe morgen - ${data.contractNumber}`, body, html };
    },

    // Payment Confirmation
    paymentConfirmation: (data: RentalData): EmailTemplate => {
        const body = `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

wir bestätigen den Eingang Ihrer Zahlung.

Vertragsnummer: ${data.contractNumber}
Betrag: €${data.rental.totalAmount.toFixed(2)}
Datum: ${fmt(new Date(), 'dd.MM.yyyy HH:mm')}

Eine detaillierte Rechnung finden Sie im Anhang.

Vielen Dank für Ihr Vertrauen!

Mit freundlichen Grüßen
Ihr Rent-Ex Team
        `.trim();

        const contentHtml = `
                            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
                            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                                wir bestätigen dankend den Eingang Ihrer Zahlung für die Buchung ${data.contractNumber}.
                            </p>

                            <!-- Payment details card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Zahlungsinformationen</h3>
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #e4e4e7;">
                                            <tr>
                                                <td width="50%" style="color: #a1a1aa; padding-bottom: 6px;">Vertragsnummer:</td>
                                                <td style="padding-bottom: 6px; font-weight: bold;">${data.contractNumber}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa; padding-bottom: 6px;">Zahlbetrag (Brutto):</td>
                                                <td style="padding-bottom: 6px; font-weight: bold; color: #10b981;">€${data.rental.totalAmount.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa;">Zahlungsdatum:</td>
                                                <td>${fmt(new Date(), 'dd.MM.yyyy HH:mm')}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                                Eine detaillierte Rechnung finden Sie als PDF-Dokument im Anhang dieser E-Mail. Sie können Ihre Buchungsdetails und Rechnungen auch jederzeit online über Ihren Kundenbereich einsehen.
                            </p>
        `.trim();

        const html = wrapInEmailLayout(
            `Zahlungsbestätigung - ${data.contractNumber}`,
            'ZAHLUNG ERHALTEN',
            `SPO-VERT-NR: ${data.contractNumber}`,
            'rgba(16, 185, 129, 0.08)',
            'rgba(16, 185, 129, 0.25)',
            '#10b981',
            contentHtml
        );

        return { subject: `Zahlungsbestätigung - ${data.contractNumber}`, body, html };
    },

    // Cancellation Confirmation
    cancellationConfirmation: (data: RentalData): EmailTemplate => {
        const startDateStr = fmt(data.rental.startDate, 'dd.MM.yyyy');

        const body = `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

wir bestätigen die Stornierung Ihrer Buchung.

Vertragsnummer: ${data.contractNumber}
Fahrzeug: ${data.car.brand} ${data.car.model}
Ursprünglicher Termin: ${startDateStr}

Gemäß unseren Stornierungsbedingungen wird die Rückerstattung innerhalb von 5-7 Werktagen bearbeitet.

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
Ihr Rent-Ex Team
        `.trim();

        const contentHtml = `
                            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${data.customer.firstName} ${data.customer.lastName},</h2>
                            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                                wir bestätigen hiermit die erfolgreiche Stornierung Ihrer Reservierung.
                            </p>

                            <!-- Rental Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Stornierte Buchungsdaten</h3>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Vertragsnummer:</strong> ${data.contractNumber}</p>
                                        <p style="margin: 0 0 6px 0; font-size: 15px; color: #f4f4f5;"><strong>Fahrzeug:</strong> ${data.car.brand} ${data.car.model}</p>
                                        <p style="margin: 0; font-size: 15px; color: #f4f4f5;"><strong>Ursprünglicher Mietbeginn:</strong> ${startDateStr}</p>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                                Gemäß unseren Stornierungsbedingungen wird eine eventuell bereits geleistete Anzahlung oder Rückerstattung innerhalb von 5-7 Werktagen auf das bei der Buchung genutzte Zahlungsmittel gutgeschrieben.
                            </p>
        `.trim();

        const html = wrapInEmailLayout(
            `Stornierungsbestätigung - ${data.contractNumber}`,
            'STORNIERUNG BESTÄTIGT',
            `SPO-VERT-NR: ${data.contractNumber}`,
            'rgba(244, 63, 94, 0.08)',
            'rgba(244, 63, 94, 0.25)',
            '#f43f5e',
            contentHtml
        );

        return { subject: `Stornierungsbestätigung - ${data.contractNumber}`, body, html };
    },

    // Maintenance Notification
    maintenanceNotification: (carData: { brand: string; model: string; plate: string; maintenanceType: string; dueDate: Date }): EmailTemplate => {
        const body = `
Wartungserinnerung

Fahrzeug: ${carData.brand} ${carData.model}
Kennzeichen: ${carData.plate}
Wartungsart: ${carData.maintenanceType}
Fällig am: ${fmt(carData.dueDate, 'dd.MM.yyyy')}

Bitte planen Sie die Wartung rechtzeitig ein.

Rent-Ex Wartungsmanagement
        `.trim();

        const contentHtml = `
                            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Wartungsbenachrichtigung,</h2>
                            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                                Für folgendes Flottenfahrzeug steht ein wichtiger Wartungstermin an:
                            </p>

                            <!-- Vehicle Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #3f3f46; padding-bottom: 6px;">Fahrzeug & Wartungsart</h3>
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #e4e4e7;">
                                            <tr>
                                                <td width="40%" style="color: #a1a1aa; padding-bottom: 6px;">Fahrzeug:</td>
                                                <td style="padding-bottom: 6px; font-weight: bold;">${carData.brand} ${carData.model}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa; padding-bottom: 6px;">Kennzeichen:</td>
                                                <td style="padding-bottom: 6px; font-weight: bold;">${carData.plate}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa; padding-bottom: 6px;">Wartungsart:</td>
                                                <td style="padding-bottom: 6px; color: #f59e0b; font-weight: bold;">${carData.maintenanceType}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #a1a1aa;">Fälligkeitsdatum:</td>
                                                <td style="font-weight: bold;">${fmt(carData.dueDate, 'dd.MM.yyyy')}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                                Bitte planen Sie den Servicetermin zeitnah im Werkstatt-Kalender ein und setzen Sie den Fahrzeugstatus nach der Wartung im Admin-Panel zurück.
                            </p>
        `.trim();

        const html = wrapInEmailLayout(
            `Wartungserinnerung: ${carData.brand} ${carData.model}`,
            'WARTUNG FÄLLIG',
            'FAHRZEUG-WARTUNGSPLANUNG',
            'rgba(245, 158, 11, 0.08)',
            'rgba(245, 158, 11, 0.25)',
            '#f59e0b',
            contentHtml
        );

        return { subject: `Wartungserinnerung: ${carData.brand} ${carData.model}`, body, html };
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


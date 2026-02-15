import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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
        subject: `Buchungsbestätigung - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

vielen Dank für Ihre Buchung bei RentEx!

Ihre Buchungsdetails:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vertragsnummer: ${data.contractNumber}
Fahrzeug: ${data.car.brand} ${data.car.model}
Kennzeichen: ${data.car.plate}

Mietbeginn: ${format(data.rental.startDate, 'dd.MM.yyyy HH:mm', { locale: de })}
Mietende: ${format(data.rental.endDate, 'dd.MM.yyyy HH:mm', { locale: de })}
Abholort: ${data.rental.pickupLocation || 'Hauptfiliale München'}

Gesamtbetrag: €${data.rental.totalAmount.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wichtige Hinweise:
• Bitte bringen Sie Ihren Führerschein und Personalausweis mit
• Die Fahrzeugübergabe erfolgt nach Vorlage aller Dokumente
• Bei Fragen erreichen Sie uns unter +49 89 123456

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎁 EXKLUSIVE VORTEILE SICHERN!
Besitzen Sie noch kein Passwort? Erstellen Sie eines, 
um Ihre Buchungen zu verwalten und von Rabatten zu profitieren:
https://rent-ex.vercel.app/register?email=${encodeURIComponent(data.customer.email)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wir freuen uns auf Ihren Besuch!

Mit freundlichen Grüßen
Ihr RentEx Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RentEx Autovermietung GmbH
Hauptstraße 123, 80331 München
Tel: +49 89 123456 | Email: info@rentex.de
Web: www.rentex.de
    `.trim()
    }),

    // Pickup Reminder
    pickupReminder: (data: RentalData): EmailTemplate => ({
        subject: `Erinnerung: Fahrzeugabholung morgen - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

dies ist eine freundliche Erinnerung an Ihre morgige Fahrzeugabholung.

Abholtermin: ${format(data.rental.startDate, 'dd.MM.yyyy HH:mm', { locale: de })}
Fahrzeug: ${data.car.brand} ${data.car.model}
Abholort: ${data.rental.pickupLocation || 'Hauptfiliale München'}

Bitte bringen Sie mit:
✓ Gültiger Führerschein
✓ Personalausweis/Reisepass
✓ Kreditkarte für die Kaution

Bei Verspätung oder Änderungen kontaktieren Sie uns bitte umgehend.

Mit freundlichen Grüßen
Ihr RentEx Team

Tel: +49 89 123456
    `.trim()
    }),

    // Return Reminder
    returnReminder: (data: RentalData): EmailTemplate => ({
        subject: `Erinnerung: Fahrzeugrückgabe morgen - ${data.contractNumber}`,
        body: `
Sehr geehrte/r ${data.customer.firstName} ${data.customer.lastName},

Ihre Mietdauer endet morgen. Bitte geben Sie das Fahrzeug rechtzeitig zurück.

Rückgabetermin: ${format(data.rental.endDate, 'dd.MM.yyyy HH:mm', { locale: de })}
Fahrzeug: ${data.car.brand} ${data.car.model} (${data.car.plate})
Rückgabeort: ${data.rental.pickupLocation || 'Hauptfiliale München'}

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
Datum: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}

Eine detaillierte Rechnung finden Sie im Anhang.

Vielen Dank für Ihr Vertrauen!

Mit freundlichen Grüßen
Ihr RentEx Team

RentEx Autovermietung GmbH
info@rentex.de | +49 89 123456
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
Ursprünglicher Termin: ${format(data.rental.startDate, 'dd.MM.yyyy', { locale: de })}

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
Fällig am: ${format(carData.dueDate, 'dd.MM.yyyy', { locale: de })}

Bitte planen Sie die Wartung rechtzeitig ein.

RentEx Wartungsmanagement
    `.trim()
    }),
};

export const smsTemplates = {
    pickupReminder: (data: RentalData): string =>
        `RentEx: Erinnerung - Fahrzeugabholung morgen ${format(data.rental.startDate, 'dd.MM HH:mm', { locale: de })}. ${data.car.brand} ${data.car.model}. Führerschein mitbringen!`,

    returnReminder: (data: RentalData): string =>
        `RentEx: Rückgabe morgen ${format(data.rental.endDate, 'dd.MM HH:mm', { locale: de })}. ${data.car.brand} ${data.car.model} (${data.car.plate}). Bitte vollgetankt zurückgeben.`,

    bookingConfirmation: (data: RentalData): string =>
        `RentEx: Buchung bestätigt! ${data.contractNumber}. ${data.car.brand} ${data.car.model}. Abholung: ${format(data.rental.startDate, 'dd.MM HH:mm', { locale: de })}`,

    paymentReceived: (data: RentalData): string =>
        `RentEx: Zahlung €${data.rental.totalAmount.toFixed(2)} erhalten. Vielen Dank! ${data.contractNumber}`,
};

// Helper function to send email (mock - integrate with actual email service)
export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    console.log('Sending email to:', to);
    console.log('Subject:', template.subject);
    console.log('Body:', template.body);

    // In production, integrate with services like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Nodemailer

    return true;
}

// Helper function to send SMS (mock - integrate with actual SMS service)
export async function sendSMS(to: string, message: string): Promise<boolean> {
    console.log('Sending SMS to:', to);
    console.log('Message:', message);

    // In production, integrate with services like:
    // - Twilio
    // - AWS SNS
    // - Vonage (Nexmo)

    return true;
}

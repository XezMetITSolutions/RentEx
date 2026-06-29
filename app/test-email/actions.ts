'use server';

import { sendEmail, emailTemplates, wrapHtmlLayout } from "@/lib/notificationTemplates";

const mockRentalData = {
    contractNumber: "RX-2026-TEST-001",
    customer: {
        firstName: "Max",
        lastName: "Mustermann",
        email: "", // replaced dynamically
    },
    car: {
        brand: "VW",
        model: "Golf Kombi",
        plate: "IL-999-AB",
    },
    rental: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        pickupLocation: "Hauptstandort Feldkirch",
        totalAmount: 227.50,
    }
};

const mockMaintenanceData = {
    brand: "VW",
    model: "Golf Kombi",
    plate: "IL-999-AB",
    maintenanceType: "Jahresservice & Ölwechsel",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
};

export async function triggerTestEmail(email: string, templateType: string) {
    if (!email || email.indexOf('@') === -1) {
        return { success: false, error: "Gültige E-Mail-Adresse erforderlich." };
    }

    try {
        const data = {
            ...mockRentalData,
            customer: {
                ...mockRentalData.customer,
                email: email
            }
        };

        let template;
        switch (templateType) {
            case 'bookingConfirmation':
                template = emailTemplates.bookingConfirmation(data);
                break;
            case 'pickupReminder':
                template = emailTemplates.pickupReminder(data);
                break;
            case 'returnReminder':
                template = emailTemplates.returnReminder(data);
                break;
            case 'paymentConfirmation':
                template = emailTemplates.paymentConfirmation(data);
                break;
            case 'cancellationConfirmation':
                template = emailTemplates.cancellationConfirmation(data);
                break;
            case 'maintenanceNotification':
                template = emailTemplates.maintenanceNotification(mockMaintenanceData);
                break;
            case 'birthdayCoupon':
                template = {
                    subject: `🎂 Alles Gute zum Geburtstag, Max! Ihr Geschenk wartet.`,
                    body: `Alles Gute zum Geburtstag! Ihr 10% Rabattcode lautet: BDAY-TEST-CODE. Gilt für 30 Tage.`,
                    html: wrapHtmlLayout(
                        "ALLES GUTE ZUM GEBURTSTAG",
                        "IHR GESCHENK IST DA",
                        `
                        <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo Max,</h2>
                        <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                            wir wünschen Ihnen von Herzen alles Gute zum Geburtstag! 🎉
                        </p>
                        <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                            Als kleines Geschenk erhalten Sie einen <strong>10% Rabattgutschein</strong> für Ihre nächste Fahrzeugmiete bei uns.
                        </p>

                        <!-- Coupon Code Card -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                            <tr>
                                <td align="center" style="padding: 25px;">
                                    <span style="color: #dc2626; font-size: 12px; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 6px;">Ihr exklusiver Geburtstagscode:</span>
                                    <strong style="color: #ffffff; font-size: 22px; letter-spacing: 2px; font-family: monospace; display: block; background-color: #09090b; padding: 10px 20px; border-radius: 8px; width: fit-content; margin: 0 auto;">BDAY-TEST-CODE</strong>
                                    <span style="color: #a1a1aa; font-size: 11px; display: block; margin-top: 10px;">Gültig für 30 Tage ab heute.</span>
                                </td>
                            </tr>
                        </table>
                        `
                    )
                };
                break;
            default:
                return { success: false, error: "Unbekanntes Template." };
        }

        const sent = await sendEmail(email, template);
        if (sent) {
            return { success: true };
        } else {
            return { success: false, error: "Fehler beim E-Mail-Versand (Bitte Server-Log oder SMTP-Einstellungen prüfen)." };
        }
    } catch (e: any) {
        console.error("Test email trigger failed:", e);
        return { success: false, error: e.message || "Unerwarteter Serverfehler." };
    }
}

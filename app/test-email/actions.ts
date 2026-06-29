'use server';

import { sendEmail, emailTemplates } from "@/lib/notificationTemplates";

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

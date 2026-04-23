import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const COMPANY_NAME    = process.env.COMPANY_NAME    || 'RentEx GmbH';
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || 'HauptstraÃŸe 1, 6800 Feldkirch, Ã–sterreich';
const COMPANY_PHONE   = process.env.COMPANY_PHONE   || '+43 5522 123456';
const COMPANY_EMAIL   = process.env.COMPANY_EMAIL   || 'info@rent-ex.at';
const COMPANY_VAT     = process.env.COMPANY_VAT     || 'ATU12345678';
const COMPANY_IBAN    = process.env.COMPANY_IBAN    || 'AT89 3700 0044 0532 0130';

interface RentalContract {
    contractNumber: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        address?: string;
        licenseNumber?: string;
    };
    car: {
        brand: string;
        model: string;
        plate: string;
        year: number;
        vin?: string;
    };
    rental: {
        startDate: Date;
        endDate: Date;
        pickupLocation?: string;
        returnLocation?: string;
        dailyRate: number;
        totalDays: number;
        totalAmount: number;
        depositAmount?: number;
        insuranceType?: string;
    };
}

export function generateRentalContract(data: RentalContract): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text('MIETVERTRAG', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(COMPANY_NAME, 105, 28, { align: 'center' });
    doc.text(COMPANY_ADDRESS, 105, 33, { align: 'center' });

    // Contract Number
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Vertragsnummer: ${data.contractNumber}`, 20, 45);
    doc.text(`Datum: ${format(new Date(), 'dd.MM.yyyy', { locale: de })}`, 150, 45);

    // Customer Information
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('Mieter', 20, 60);

    doc.setFontSize(10);
    doc.setTextColor(0);
    const customerInfo = [
        `Name: ${data.customer.firstName} ${data.customer.lastName}`,
        `Email: ${data.customer.email}`,
        data.customer.phone ? `Telefon: ${data.customer.phone}` : '',
        data.customer.address ? `Adresse: ${data.customer.address}` : '',
        data.customer.licenseNumber ? `FÃ¼hrerschein-Nr.: ${data.customer.licenseNumber}` : '',
    ].filter(Boolean);

    let yPos = 68;
    customerInfo.forEach(info => {
        doc.text(info, 20, yPos);
        yPos += 6;
    });

    // Vehicle Information
    yPos += 5;
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('Fahrzeug', 20, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(0);
    const vehicleInfo = [
        `Marke & Modell: ${data.car.brand} ${data.car.model}`,
        `Kennzeichen: ${data.car.plate}`,
        `Baujahr: ${data.car.year}`,
        data.car.vin ? `FIN: ${data.car.vin}` : '',
    ].filter(Boolean);

    vehicleInfo.forEach(info => {
        doc.text(info, 20, yPos);
        yPos += 6;
    });

    // Rental Details
    yPos += 5;
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('Mietdetails', 20, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(0);

    const rentalDetails = [
        ['Mietbeginn:', format(data.rental.startDate, 'dd.MM.yyyy HH:mm', { locale: de })],
        ['Mietende:', format(data.rental.endDate, 'dd.MM.yyyy HH:mm', { locale: de })],
        ['Abholort:', data.rental.pickupLocation || 'Hauptfiliale'],
        ['RÃ¼ckgabeort:', data.rental.returnLocation || 'Hauptfiliale'],
        ['Mietdauer:', `${data.rental.totalDays} Tage`],
        ['Tagespreis:', `â‚¬${data.rental.dailyRate.toFixed(2)}`],
        ['Versicherung:', data.rental.insuranceType || 'Basis'],
        ['Kaution:', data.rental.depositAmount ? `â‚¬${data.rental.depositAmount.toFixed(2)}` : 'Keine'],
    ];

    autoTable(doc, {
        startY: yPos,
        head: [],
        body: rentalDetails,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 'auto' }
        },
        margin: { left: 20 }
    });

    // Total Amount
    yPos = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFillColor(37, 99, 235);
    doc.rect(20, yPos, 170, 12, 'F');
    doc.setTextColor(255);
    doc.text('GESAMTBETRAG:', 25, yPos + 8);
    doc.text(`â‚¬${data.rental.totalAmount.toFixed(2)}`, 165, yPos + 8, { align: 'right' });

    // Terms and Conditions
    yPos += 20;
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('Allgemeine GeschÃ¤ftsbedingungen', 20, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(0);
    const terms = [
        '1. Das Fahrzeug wird in einwandfreiem Zustand Ã¼bergeben und ist in gleichem Zustand zurÃ¼ckzugeben.',
        '2. Der Mieter haftet fÃ¼r alle SchÃ¤den am Fahrzeug wÃ¤hrend der Mietdauer.',
        '3. Die Kaution wird nach ordnungsgemÃ¤ÃŸer RÃ¼ckgabe des Fahrzeugs erstattet.',
        '4. Das Fahrzeug darf nur vom Mieter oder autorisierten Fahrern gefÃ¼hrt werden.',
        '5. Bei verspÃ¤teter RÃ¼ckgabe wird eine zusÃ¤tzliche GebÃ¼hr berechnet.',
    ];

    terms.forEach(term => {
        const lines = doc.splitTextToSize(term, 170);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 5;
    });

    // Signatures
    yPos += 10;
    doc.setDrawColor(200);
    doc.line(20, yPos, 90, yPos);
    doc.line(120, yPos, 190, yPos);

    yPos += 5;
    doc.setFontSize(9);
    doc.text('Unterschrift Mieter', 20, yPos);
    doc.text('Unterschrift Vermieter', 120, yPos);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${COMPANY_NAME} | Tel: ${COMPANY_PHONE} | Email: ${COMPANY_EMAIL}`, 105, 285, { align: 'center' });

    // Save PDF
    doc.save(`Mietvertrag_${data.contractNumber}.pdf`);
}

export function generateInvoice(data: RentalContract): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text('RECHNUNG', 105, 20, { align: 'center' });

    // Company Info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(COMPANY_NAME, 20, 40);
    doc.text(COMPANY_ADDRESS, 20, 45);
    doc.text(`USt-IdNr.: ${COMPANY_VAT}`, 20, 50);

    // Invoice Details
    doc.text(`Rechnungsnummer: ${data.contractNumber}`, 120, 40);
    doc.text(`Datum: ${format(new Date(), 'dd.MM.yyyy', { locale: de })}`, 120, 45);
    doc.text(`Vertragsnummer: ${data.contractNumber}`, 120, 50);

    // Customer Address
    doc.setFontSize(11);
    doc.text(`${data.customer.firstName} ${data.customer.lastName}`, 20, 75);
    if (data.customer.address) {
        doc.setFontSize(10);
        doc.text(data.customer.address, 20, 80);
    }

    // Invoice Table
    const tableData = [
        ['Fahrzeugmiete', `${data.car.brand} ${data.car.model}`, `${data.rental.totalDays} Tage`, `â‚¬${data.rental.dailyRate.toFixed(2)}`, `â‚¬${(data.rental.totalDays * data.rental.dailyRate).toFixed(2)}`],
    ];

    if (data.rental.insuranceType) {
        tableData.push(['Versicherung', data.rental.insuranceType, `${data.rental.totalDays} Tage`, 'â‚¬10.00', `â‚¬${(data.rental.totalDays * 10).toFixed(2)}`]);
    }

    autoTable(doc, {
        startY: 100,
        head: [['Beschreibung', 'Details', 'Menge', 'Einzelpreis', 'Gesamt']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 10 },
        columnStyles: {
            4: { halign: 'right', fontStyle: 'bold' }
        }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    const subtotal = data.rental.totalAmount;
    const tax = subtotal * 0.20;
    const total = subtotal;

    doc.setFontSize(10);
    doc.text('Zwischensumme:', 120, finalY);
    doc.text(`â‚¬${subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });

    doc.text('MwSt. (20%):', 120, finalY + 6);
    doc.text(`â‚¬${tax.toFixed(2)}`, 190, finalY + 6, { align: 'right' });

    doc.setFontSize(12);
    doc.setFillColor(37, 99, 235);
    doc.rect(115, finalY + 12, 75, 10, 'F');
    doc.setTextColor(255);
    doc.text('GESAMTBETRAG:', 120, finalY + 19);
    doc.text(`â‚¬${total.toFixed(2)}`, 185, finalY + 19, { align: 'right' });

    // Payment Info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Zahlungsinformationen:', 20, finalY + 30);
    doc.setFontSize(9);
    doc.text(`IBAN: ${COMPANY_IBAN}`, 20, finalY + 36);
    doc.text('Verwendungszweck: ' + data.contractNumber, 20, finalY + 46);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Vielen Dank fÃ¼r Ihr Vertrauen!', 105, 280, { align: 'center' });
    doc.text(`${COMPANY_NAME} | Tel: ${COMPANY_PHONE} | Email: ${COMPANY_EMAIL}`, 105, 285, { align: 'center' });

    doc.save(`Rechnung_${data.contractNumber}.pdf`);
}

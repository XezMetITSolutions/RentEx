import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ExportData {
    headers: string[];
    data: any[][];
    filename: string;
    sheetName?: string;
}

export function exportToExcel(config: ExportData): void {
    const { headers, data, filename, sheetName = 'Daten' } = config;

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate and download file
    XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

export function exportRentalsToExcel(rentals: any[]): void {
    const headers = [
        'Vertrags-Nr.',
        'Fahrzeug',
        'Kennzeichen',
        'Kunde',
        'Email',
        'Startdatum',
        'Enddatum',
        'Tage',
        'Tagespreis',
        'Gesamtbetrag',
        'Status',
        'Zahlungsstatus',
    ];

    const data = rentals.map(rental => [
        rental.contractNumber || `#${rental.id}`,
        `${rental.car.brand} ${rental.car.model}`,
        rental.car.plate,
        `${rental.customer.firstName} ${rental.customer.lastName}`,
        rental.customer.email,
        format(new Date(rental.startDate), 'dd.MM.yyyy', { locale: de }),
        format(new Date(rental.endDate), 'dd.MM.yyyy', { locale: de }),
        rental.totalDays,
        `€${Number(rental.dailyRate).toFixed(2)}`,
        `€${Number(rental.totalAmount).toFixed(2)}`,
        rental.status,
        rental.paymentStatus,
    ]);

    exportToExcel({
        headers,
        data,
        filename: 'Vermietungen',
        sheetName: 'Vermietungen'
    });
}

export function exportCarsToExcel(cars: any[]): void {
    const headers = [
        'Marke',
        'Modell',
        'Kennzeichen',
        'Baujahr',
        'Kategorie',
        'Kraftstoff',
        'Getriebe',
        'Status',
        'Tagespreis',
        'Kilometerstand',
        'Standort',
    ];

    const data = cars.map(car => [
        car.brand,
        car.model,
        car.plate,
        car.year,
        car.category || '-',
        car.fuelType,
        car.transmission || '-',
        car.status,
        `€${Number(car.dailyRate).toFixed(2)}`,
        car.currentMileage || '-',
        car.currentLocation || '-',
    ]);

    exportToExcel({
        headers,
        data,
        filename: 'Fahrzeugflotte',
        sheetName: 'Fahrzeuge'
    });
}

export function exportCustomersToExcel(customers: any[]): void {
    const headers = [
        'Vorname',
        'Nachname',
        'Email',
        'Telefon',
        'Stadt',
        'PLZ',
        'Kundentyp',
        'Führerschein-Nr.',
        'Registriert am',
    ];

    const data = customers.map(customer => [
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.phone || '-',
        customer.city || '-',
        customer.postalCode || '-',
        customer.customerType || 'Private',
        customer.licenseNumber || '-',
        format(new Date(customer.createdAt), 'dd.MM.yyyy', { locale: de }),
    ]);

    exportToExcel({
        headers,
        data,
        filename: 'Kunden',
        sheetName: 'Kunden'
    });
}

export function exportFinancialReport(rentals: any[]): void {
    // Summary Sheet
    const totalRevenue = rentals.reduce((sum, r) => sum + Number(r.totalAmount), 0);
    const paidRevenue = rentals.filter(r => r.paymentStatus === 'Paid').reduce((sum, r) => sum + Number(r.totalAmount), 0);
    const pendingRevenue = rentals.filter(r => r.paymentStatus === 'Pending').reduce((sum, r) => sum + Number(r.totalAmount), 0);

    const summaryHeaders = ['Kennzahl', 'Wert'];
    const summaryData = [
        ['Gesamtumsatz', `€${totalRevenue.toFixed(2)}`],
        ['Bezahlt', `€${paidRevenue.toFixed(2)}`],
        ['Ausstehend', `€${pendingRevenue.toFixed(2)}`],
        ['Anzahl Vermietungen', rentals.length.toString()],
        ['Durchschnitt pro Vermietung', `€${(totalRevenue / rentals.length).toFixed(2)}`],
    ];

    // Detailed transactions
    const detailHeaders = [
        'Datum',
        'Vertrags-Nr.',
        'Kunde',
        'Fahrzeug',
        'Betrag',
        'Zahlungsstatus',
        'Zahlungsmethode',
    ];

    const detailData = rentals.map(rental => [
        format(new Date(rental.createdAt), 'dd.MM.yyyy', { locale: de }),
        rental.contractNumber || `#${rental.id}`,
        `${rental.customer.firstName} ${rental.customer.lastName}`,
        `${rental.car.brand} ${rental.car.model}`,
        `€${Number(rental.totalAmount).toFixed(2)}`,
        rental.paymentStatus,
        rental.paymentMethod || '-',
    ]);

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();

    // Add summary sheet
    const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Zusammenfassung');

    // Add details sheet
    const detailWs = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailData]);
    XLSX.utils.book_append_sheet(wb, detailWs, 'Transaktionen');

    // Download
    XLSX.writeFile(wb, `Finanzbericht_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

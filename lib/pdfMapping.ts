import fs from 'fs';
import path from 'path';

export interface PdfFieldMapping {
    field: string;
    x: number;
    y: number;
    page: number;
    fontSize?: number;
    label: string; // Human readable name for the admin UI
}

const CONFIG_PATH = path.join(process.cwd(), 'config', 'pdf-mapping.json');

// Default coordinates based on a standard A4 (595 x 842 points) - simplified example
// 0,0 is bottom-left in pdf-lib
export const defaultMapping: PdfFieldMapping[] = [
    // A - Accident Info
    { field: 'accidentDate', label: 'Unfalldatum', x: 50, y: 750, page: 0 },
    { field: 'accidentTime', label: 'Unfallzeit', x: 200, y: 750, page: 0 },
    { field: 'accidentPlace', label: 'Unfallort', x: 50, y: 720, page: 0 },
    { field: 'accidentCountry', label: 'Land', x: 300, y: 720, page: 0 },
    { field: 'injuries', label: 'Verletzte (Ja/Nein)', x: 450, y: 720, page: 0 },

    // B - Vehicle 1 (Rental)
    { field: 'rental.car.plate', label: 'Kennzeichen (Fahrzeug 1)', x: 50, y: 650, page: 0 },
    { field: 'rental.car.brand', label: 'Marke/Typ (Fahrzeug 1)', x: 150, y: 650, page: 0 },
    { field: 'rental.car.insuranceCompany', label: 'Versicherung (Fahrzeug 1)', x: 300, y: 650, page: 0 },
    { field: 'customer.lastName', label: 'Nachname (Fahrer 1)', x: 50, y: 620, page: 0 },
    { field: 'customer.firstName', label: 'Vorname (Fahrer 1)', x: 150, y: 620, page: 0 },
    { field: 'customerAddress', label: 'Adresse (Fahrer 1)', x: 50, y: 590, page: 0 },
    { field: 'customer.phone', label: 'Telefon (Fahrer 1)', x: 300, y: 590, page: 0 },

    // Damage Description Vehicle 1
    { field: 'description', label: 'Schadenbeschreibung (Fahrzeug 1)', x: 50, y: 550, page: 0 },
    { field: 'locationOnCar', label: 'Schadensort am Fahrzeug (Fahrzeug 1)', x: 50, y: 530, page: 0 },

    // B - Vehicle 2 (Other Party)
    { field: 'otherPartyDriverName', label: 'Fahrer Name (Fahrzeug 2)', x: 50, y: 450, page: 0 },
    { field: 'otherPartyAddress', label: 'Adresse (Fahrzeug 2)', x: 50, y: 420, page: 0 },
    { field: 'otherPartyPhone', label: 'Telefon (Fahrzeug 2)', x: 300, y: 420, page: 0 },
    { field: 'otherPartyRegistration', label: 'Kennzeichen (Fahrzeug 2)', x: 50, y: 390, page: 0 },
    { field: 'otherPartyVehicle', label: 'Marke/Typ (Fahrzeug 2)', x: 150, y: 390, page: 0 },
    { field: 'otherPartyInsurance', label: 'Versicherung (Fahrzeug 2)', x: 300, y: 390, page: 0 },
    { field: 'otherPartyPolicyNumber', label: 'Policennummer (Fahrzeug 2)', x: 450, y: 390, page: 0 },
    { field: 'otherPartyDamage', label: 'Schaden (Fahrzeug 2)', x: 50, y: 360, page: 0 },

    // Witness
    { field: 'witnessName', label: 'Zeuge Name', x: 50, y: 280, page: 0 },
    { field: 'witnessPhone', label: 'Zeuge Telefon', x: 300, y: 280, page: 0 },
    { field: 'witnessAddress', label: 'Zeuge Adresse', x: 50, y: 250, page: 0 },

    // Circumstances / Sketch
    { field: 'circumstances', label: 'Unfallumstände (IDs)', x: 50, y: 180, page: 0 }, // Maybe list IDs or text
    { field: 'sketchNotes', label: 'Skizze / Bemerkungen', x: 50, y: 140, page: 0 },
];

export function getPdfMapping(): PdfFieldMapping[] {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (error) {
        console.error('Error reading PDF mapping config:', error);
    }
    return defaultMapping;
}

export function savePdfMapping(mapping: PdfFieldMapping[]) {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(mapping, null, 2), 'utf-8');
}

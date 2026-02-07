import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FLEET_CARS = [
    { brand: 'Seat', model: 'Leon Kombi', category: 'Kombi', transmission: 'Manuell', basePrice: 72, seats: 5, doors: 5, fuelType: 'Benzin' as const },
    { brand: 'Peugeot', model: 'Traveller Automatic', category: 'Van', transmission: 'Automatik', basePrice: 115, seats: 8, doors: 4, fuelType: 'Diesel' as const },
    { brand: 'Ford', model: 'Mustang Mach-E GT', category: 'SUV', transmission: 'Automatik', basePrice: 149, seats: 5, doors: 5, fuelType: 'Elektro' as const },
    { brand: 'Fiat', model: 'Ducato L3H2 Plus', category: 'Transporter', transmission: 'Manuell', basePrice: 109, seats: 3, doors: 4, fuelType: 'Diesel' as const },
    { brand: 'Hyundai', model: 'Ioniq Elektro', category: 'Kombi', transmission: 'Automatik', basePrice: 79, seats: 5, doors: 5, fuelType: 'Elektro' as const },
    { brand: 'VW', model: 'Polo', category: 'Kleinwagen', transmission: 'Manuell', basePrice: 49, seats: 5, doors: 5, fuelType: 'Benzin' as const },
    { brand: 'Opel', model: 'Corsa', category: 'Kleinwagen', transmission: 'Manuell', basePrice: 45, seats: 5, doors: 5, fuelType: 'Benzin' as const },
    { brand: 'VW', model: 'Golf Kombi', category: 'Kombi', transmission: 'Manuell', basePrice: 65, seats: 5, doors: 5, fuelType: 'Diesel' as const },
    { brand: 'Skoda', model: 'Superb Kombi', category: 'Kombi', transmission: 'Automatik', basePrice: 85, seats: 5, doors: 5, fuelType: 'Diesel' as const },
    { brand: 'Ford', model: 'Transit Custom Langversion Automatik', category: 'Bus', transmission: 'Automatik', basePrice: 120, seats: 9, doors: 4, fuelType: 'Diesel' as const },
    { brand: 'Ford', model: 'Transit Custom L1', category: 'Bus', transmission: 'Manuell', basePrice: 100, seats: 9, doors: 4, fuelType: 'Diesel' as const },
    { brand: 'Fiat', model: 'Ducato L4H2', category: 'Transporter', transmission: 'Manuell', basePrice: 95, seats: 3, doors: 4, fuelType: 'Diesel' as const },
    { brand: 'Fiat', model: 'Ducato L3H2', category: 'Transporter', transmission: 'Manuell', basePrice: 105, seats: 3, doors: 4, fuelType: 'Diesel' as const },
];

const CAR_IMAGES: Record<string, string> = {
    'Fiat Ducato L3H2': '/assets/cars/fiat_ducato.png',
    'Fiat Ducato L4H2': '/assets/cars/fiat_ducato.png',
    'Fiat Ducato L3H2 Plus': '/assets/cars/fiat_ducato.png',
    'Ford Transit Custom L1': '/assets/cars/ford_transit.png',
    'Ford Transit Custom Langversion Automatik': '/assets/cars/ford_transit.png',
    'Peugeot Traveller Automatic': '/assets/cars/peugeot_traveller.jpg',
    'Skoda Superb Kombi': '/assets/cars/skoda_superb.png',
    'VW Golf Kombi': '/assets/cars/vw_golf_kombi.jpg',
};

const PLATE_SUFFIXES = ['SL', 'PT', 'FM', 'FD', 'HI', 'VP', 'OC', 'VG', 'SS', 'FT', 'F1', 'D4', 'D3'];
function plateForIndex(index: number): string {
    const s = PLATE_SUFFIXES[index - 1] ?? `X${index}`;
    return `FK-${index.toString().padStart(2, '0')}-${s}`;
}

async function main() {
    console.log('Seeding cars...');
    await prisma.car.deleteMany({});
    console.log('Alte Fahrzeuge entfernt.');

    const feldkirch = await prisma.location.findFirst({
        where: { OR: [{ name: 'Rent-Ex Feldkirch' }, { code: 'FK-01' }] },
    });

    for (let i = 0; i < FLEET_CARS.length; i++) {
        const car = FLEET_CARS[i];
        const plate = plateForIndex(i + 1);
        const imageUrl = CAR_IMAGES[`${car.brand} ${car.model}`] ?? '/assets/cars/fiat_ducato.png';

        console.log(`Creating ${car.brand} ${car.model} (${plate})...`);

        await prisma.car.create({
            data: {
                brand: car.brand,
                model: car.model,
                plate,
                year: 2025,
                color: 'Weiß',
                fuelType: car.fuelType,
                transmission: car.transmission,
                category: car.category,
                doors: car.doors,
                seats: car.seats,
                status: 'Active',
                dailyRate: car.basePrice,
                locationId: feldkirch?.id,
                homeLocationId: feldkirch?.id,
                hasAirConditioning: true,
                hasBluetoothAudio: true,
                hasGPS: true,
                description: `${car.brand} ${car.model} – Zuverlässiges Mietfahrzeug.`,
                features: 'Klimaanlage, Bluetooth, GPS',
                imageUrl,
                vin: `SEED${Date.now()}${i}`.slice(0, 17),
            },
        });
    }

    console.log(`✅ ${FLEET_CARS.length} Fahrzeuge angelegt.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

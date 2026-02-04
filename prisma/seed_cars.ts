
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const carsToCreate = [
    {
        brand: 'VW',
        model: 'Golf Kombi',
        category: 'Kombi',
        transmission: 'Manuell',
        count: 2,
        basePrice: 65,
        seats: 5,
        doors: 5,
    },
    {
        brand: 'Skoda',
        model: 'Superb Kombi',
        category: 'Kombi',
        transmission: 'Automatik',
        count: 1,
        basePrice: 85,
        seats: 5,
        doors: 5,
    },
    {
        brand: 'Ford',
        model: 'Transit Custom Langversion',
        category: 'Bus',
        transmission: 'Automatik',
        count: 1,
        basePrice: 120,
        seats: 9,
        doors: 4,
    },
    {
        brand: 'Ford',
        model: 'Transit Custom L1',
        category: 'Bus',
        transmission: 'Manuell',
        count: 1,
        basePrice: 100,
        seats: 9,
        doors: 4,
    },
    {
        brand: 'Fiat',
        model: 'Ducato L4H2',
        category: 'Transporter',
        transmission: 'Manuell',
        count: 3,
        basePrice: 95,
        seats: 3,
        doors: 4,
    },
    {
        brand: 'Fiat',
        model: 'Ducato L3H2',
        category: 'Transporter',
        transmission: 'Automatik',
        count: 1,
        basePrice: 105,
        seats: 3,
        doors: 4,
    },
];

function generatePlate() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
    const randomNum = () => nums[Math.floor(Math.random() * nums.length)];

    return `M-${randomChar()}${randomChar()}-${randomNum()}${randomNum()}${randomNum()}${randomNum()}`;
}

async function main() {
    console.log('Seeding cars...');

    for (const carType of carsToCreate) {
        for (let i = 0; i < carType.count; i++) {
            const plate = generatePlate();

            console.log(`Creating ${carType.brand} ${carType.model} (${plate})...`);

            await prisma.car.create({
                data: {
                    brand: carType.brand,
                    model: carType.model,
                    plate: plate,
                    year: 2025,
                    color: 'Weiß', // Standard rental color
                    fuelType: 'Diesel',
                    transmission: carType.transmission,
                    category: carType.category,
                    doors: carType.doors,
                    seats: carType.seats,
                    status: 'Active',
                    dailyRate: carType.basePrice,
                    hasAirConditioning: true,
                    hasBluetoothAudio: true,
                    hasGPS: true,
                    description: `${carType.brand} ${carType.model} - Zuverlässiges Fahrzeug für Ihre Bedürfnisse.`,
                    features: 'Klimaanlage, Bluetooth, GPS, ABS',
                    // Random dummy VIN
                    vin: Math.random().toString(36).substring(2, 15).toUpperCase(),
                },
            });
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

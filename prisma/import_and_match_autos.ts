import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CARS_TO_IMPORT = [
    {
        brand: 'Ford',
        model: '616',
        category: 'Kleinwagen',
        transmission: 'Manuell',
        basePrice: 55,
        seats: 5,
        doors: 5,
        fuelType: 'Benzin',
        checkInTemplate: 'Ford 616',
        color: 'Silber'
    },
    {
        brand: 'Seat',
        model: 'Ibiza',
        category: 'Kleinwagen',
        transmission: 'Manuell',
        basePrice: 49,
        seats: 5,
        doors: 5,
        fuelType: 'Benzin',
        checkInTemplate: 'Seat Ibiza',
        color: 'Weiß'
    },
    {
        brand: 'Skoda',
        model: 'Octavia',
        category: 'Mittelklasse',
        transmission: 'Manuell',
        basePrice: 75,
        seats: 5,
        doors: 5,
        fuelType: 'Diesel',
        checkInTemplate: 'Skoda Octavia',
        color: 'Schwarz'
    },
    {
        brand: 'Skoda',
        model: '082',
        category: 'Kleinwagen',
        transmission: 'Manuell',
        basePrice: 49,
        seats: 5,
        doors: 5,
        fuelType: 'Benzin',
        checkInTemplate: 'Skod_082',
        color: 'Grau'
    }
];

const MATCHES_TO_UPDATE = [
    {
        brand: 'Fiat',
        model: 'Ducato L4H2',
        checkInTemplate: 'Fiat Ducator Kasten L4H2 FK993 IU'
    },
    {
        brand: 'Ford',
        model: 'Mustang Mach-E GT',
        checkInTemplate: 'Ford Mustang normal' // generic mapping
    },
    {
        brand: 'Seat',
        model: 'Leon Kombi',
        checkInTemplate: 'Seat Kombi'
    },
    {
        brand: 'Skoda',
        model: 'Superb Kombi',
        checkInTemplate: 'Skodo superb'
    }
];

async function main() {
    console.log('--- 🚗 Arabaları Eşleştirme ve İçe Aktarma Başlatılıyor 🚗 ---');

    // 1. Mevcut arabaların checkInTemplate sütunlarını güncelle
    for (const match of MATCHES_TO_UPDATE) {
        const existing = await prisma.car.findFirst({
            where: {
                brand: match.brand,
                model: match.model
            }
        });

        if (existing) {
            await prisma.car.update({
                where: { id: existing.id },
                data: { checkInTemplate: match.checkInTemplate }
            });
            console.log(`✅ Mevcut araç güncellendi: ${match.brand} ${match.model} -> Şablon: "${match.checkInTemplate}"`);
        } else {
            console.log(`⚠️ Mevcut araç veri tabanında bulunamadı: ${match.brand} ${match.model}`);
        }
    }

    // 2. Eksik arabaları (sadece fotoğrafı olanlar) ekle
    const feldkirch = await prisma.location.findFirst({
        where: { OR: [{ name: 'Rent-Ex Feldkirch' }, { code: 'FK-01' }, { city: 'Feldkirch' }] }
    });
    
    let importedCount = 0;
    for (const newCar of CARS_TO_IMPORT) {
        // Zaten eklenmiş mi kontrol et
        const existing = await prisma.car.findFirst({
            where: {
                brand: newCar.brand,
                model: newCar.model
            }
        });

        if (!existing) {
            const plate = `FK-${Math.floor(100 + Math.random() * 900)}-XX`; // Unique random plate
            await prisma.car.create({
                data: {
                    brand: newCar.brand,
                    model: newCar.model,
                    plate,
                    year: 2025,
                    color: newCar.color,
                    fuelType: newCar.fuelType,
                    transmission: newCar.transmission,
                    category: newCar.category,
                    doors: newCar.doors,
                    seats: newCar.seats,
                    status: 'Active',
                    dailyRate: newCar.basePrice,
                    locationId: feldkirch?.id,
                    homeLocationId: feldkirch?.id,
                    hasAirConditioning: true,
                    hasBluetoothAudio: true,
                    hasGPS: true,
                    description: `${newCar.brand} ${newCar.model} – Check-in sistemine yeni tanımlanmış araç.`,
                    features: 'Klimaanlage, Bluetooth, GPS',
                    checkInTemplate: newCar.checkInTemplate,
                    imageUrl: '/assets/cars/kleinwagen.jpg',
                    vin: `NEW${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 10)}`.slice(0, 17)
                }
            });
            console.log(`➕ Yeni araç eklendi: ${newCar.brand} ${newCar.model} (Plaka: ${plate}) -> Şablon: "${newCar.checkInTemplate}"`);
            importedCount++;
        } else {
            // Sadece checkInTemplate güncelle
            await prisma.car.update({
                where: { id: existing.id },
                data: { checkInTemplate: newCar.checkInTemplate }
            });
            console.log(`ℹ️ Yeni araç zaten kayıtlıymış, şablonu güncellendi: ${newCar.brand} ${newCar.model} -> Şablon: "${newCar.checkInTemplate}"`);
        }
    }

    console.log(`\n🎉 İşlem başarıyla tamamlandı. ${importedCount} yeni araç eklendi ve tüm eşleşmeler güncellendi.`);
}

main()
    .catch((e) => {
        console.error('Hata oluştu:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

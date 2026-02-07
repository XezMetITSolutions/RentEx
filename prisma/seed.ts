import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Clean up existing data
    await prisma.payment.deleteMany()
    await prisma.maintenanceRecord.deleteMany()
    await prisma.rental.deleteMany()
    await prisma.car.deleteMany()
    await prisma.option.deleteMany()
    await prisma.location.deleteMany() // Added location cleanup
    await prisma.customer.deleteMany()

    console.log('✅ Cleaned existing data')

    // Create Locations
    const feldkirch = await prisma.location.create({
        data: {
            name: 'Hauptfiliale Feldkirch',
            code: 'FK-MAIN',
            address: 'Hauptstraße 1',
            city: 'Feldkirch',
            country: 'Österreich',
            phone: '+43 123 456789',
            email: 'feldkirch@rentex.com',
            openingTime: '08:00',
            closingTime: '18:00',
            isOpenSundays: false,
        }
    })

    const muenchen = await prisma.location.create({
        data: {
            name: 'Hauptfiliale München',
            code: 'MUC-MAIN',
            address: 'Hauptstraße 123',
            city: 'München',
            country: 'Deutschland',
            phone: '+49 89 123456',
            email: 'muenchen@rentex.com',
            openingTime: '08:00',
            closingTime: '20:00',
            isOpenSundays: true,
        }
    })

    const frankfurt = await prisma.location.create({
        data: {
            name: 'Filiale Frankfurt',
            code: 'FRA-APT',
            address: 'Flughafen Terminal 1',
            city: 'Frankfurt',
            country: 'Deutschland',
            phone: '+49 69 123456',
            email: 'frankfurt@rentex.com',
            openingTime: '06:00',
            closingTime: '23:00',
            isOpenSundays: true,
        }
    })

    const berlin = await prisma.location.create({
        data: {
            name: 'Filiale Berlin',
            code: 'BER-MAIN',
            address: 'Alexanderplatz 1',
            city: 'Berlin',
            country: 'Deutschland',
            phone: '+49 30 123456',
            email: 'berlin@rentex.com',
            openingTime: '08:00',
            closingTime: '19:00',
        }
    })

    const hamburg = await prisma.location.create({
        data: {
            name: 'Filiale Hamburg',
            code: 'HAM-PORT',
            address: 'HafenCity 1',
            city: 'Hamburg',
            country: 'Deutschland',
            phone: '+49 40 123456',
            email: 'hamburg@rentex.com',
        }
    })

    const koeln = await prisma.location.create({
        data: {
            name: 'Filiale Köln',
            code: 'CGN-MAIN',
            address: 'Domkloster 4',
            city: 'Köln',
            country: 'Deutschland',
            phone: '+49 221 123456',
            email: 'koeln@rentex.com',
        }
    })

    const stuttgart = await prisma.location.create({
        data: {
            name: 'Filiale Stuttgart',
            code: 'STR-MAIN',
            address: 'Königstraße 1',
            city: 'Stuttgart',
            country: 'Deutschland',
            phone: '+49 711 123456',
            email: 'stuttgart@rentex.com',
        }
    })

    console.log('✅ Created 7 Locations')

    // Create Cars with real data based on user fleet
    // Categories: PKW, Kastenwagen, Bus

    // 1. Fiat Ducato L3H2 (Kastenwagen)
    const ducatoL3 = await prisma.car.create({
        data: {
            brand: 'Fiat',
            model: 'Ducato L3H2',
            plate: 'FK-FD 3032',
            year: 2024,
            color: 'Weiß',
            fuelType: 'Diesel',
            transmission: 'Manuell',
            category: 'Kastenwagen',
            doors: 4,
            seats: 3,
            engineSize: '2.3L',
            horsePower: 140,
            fuelConsumption: '8.5 L/100km',
            co2Emission: '220 g/km',
            status: 'Active',
            vin: 'ZFA30320000000001',
            dailyRate: 119.00,
            weeklyRate: 650.00,
            monthlyRate: 1900.00,
            depositAmount: 500.00,
            currentMileage: 5000,
            maxMileagePerDay: 200,
            hasAirConditioning: true,
            hasGPS: true,
            hasParkingSensors: true,
            description: 'Großer Transporter für Umzüge und gewerbliche Transporte.',
            features: 'Klimaanlage, Parksensoren, Hohes Dach',
            imageUrl: '/assets/cars/fiat_ducato.png',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 2. Fiat Ducato L4H2 (Kastenwagen)
    const ducatoL4 = await prisma.car.create({
        data: {
            brand: 'Fiat',
            model: 'Ducato L4H2',
            plate: 'FK-FD 4042',
            year: 2023,
            color: 'Weiß',
            fuelType: 'Diesel',
            transmission: 'Manuell',
            category: 'Kastenwagen',
            doors: 4,
            seats: 3,
            engineSize: '2.3L',
            horsePower: 160,
            fuelConsumption: '9.0 L/100km',
            co2Emission: '230 g/km',
            status: 'Active',
            vin: 'ZFA40420000000002',
            dailyRate: 129.00,
            weeklyRate: 700.00,
            monthlyRate: 2100.00,
            depositAmount: 500.00,
            currentMileage: 15000,
            maxMileagePerDay: 200,
            hasAirConditioning: true,
            hasGPS: true,
            hasParkingSensors: true,
            hasBackupCamera: true,
            description: 'Maximaler Stauraum für große Transporte.',
            features: 'Rückfahrkamera, Navi, Klimaanlage',
            imageUrl: '/assets/cars/fiat_ducato.png',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 3. Ford Transit Custom L1 (Bus)
    const transitL1 = await prisma.car.create({
        data: {
            brand: 'Ford',
            model: 'Transit Custom L1',
            plate: 'FK-FT 1001',
            year: 2024,
            color: 'Silber',
            fuelType: 'Diesel',
            transmission: 'Manuell',
            category: 'Bus',
            doors: 4,
            seats: 9,
            engineSize: '2.0L',
            horsePower: 130,
            fuelConsumption: '7.5 L/100km',
            co2Emission: '190 g/km',
            status: 'Active',
            vin: 'WFO10010000000003',
            dailyRate: 139.00,
            weeklyRate: 800.00,
            monthlyRate: 2400.00,
            depositAmount: 400.00,
            currentMileage: 3000,
            maxMileagePerDay: 250,
            hasAirConditioning: true,
            hasGPS: false,
            hasBluetoothAudio: true,
            description: 'Komfortabler 9-Sitzer für Gruppenreisen.',
            features: '9 Sitze, Bluetooth, Klimaanlage',
            imageUrl: '/assets/cars/ford_transit.png',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 4. Ford Transit Custom LANGVERSION Automatik (Bus)
    const transitLang = await prisma.car.create({
        data: {
            brand: 'Ford',
            model: 'Transit Custom Lang',
            plate: 'FK-FT 2002',
            year: 2024,
            color: 'Schwarz',
            fuelType: 'Diesel',
            transmission: 'Automatik',
            category: 'Bus',
            doors: 5,
            seats: 9,
            engineSize: '2.0L',
            horsePower: 170,
            fuelConsumption: '7.8 L/100km',
            co2Emission: '200 g/km',
            status: 'Active',
            vin: 'WFO20020000000004',
            dailyRate: 159.00,
            weeklyRate: 900.00,
            monthlyRate: 2700.00,
            depositAmount: 500.00,
            currentMileage: 1000,
            maxMileagePerDay: 300,
            hasAirConditioning: true,
            hasGPS: true,
            hasBluetoothAudio: true,
            hasCruiseControl: true,
            description: 'Langversion mit Automatikgetriebe für maximalen Komfort.',
            features: 'Automatik, Navi, Langversion, Tempomat',
            imageUrl: '/assets/cars/ford_transit.png',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 5. Skoda Superb Kombi (PKW)
    const skodaSuperb = await prisma.car.create({
        data: {
            brand: 'Skoda',
            model: 'Superb Kombi',
            plate: 'FK-SK 5001',
            year: 2023,
            color: 'Grau',
            fuelType: 'Diesel',
            transmission: 'Automatik',
            category: 'PKW',
            doors: 5,
            seats: 5,
            engineSize: '2.0L',
            horsePower: 150,
            fuelConsumption: '5.5 L/100km',
            co2Emission: '135 g/km',
            status: 'Active',
            vin: 'TMB50010000000005',
            dailyRate: 109.00,
            weeklyRate: 600.00,
            monthlyRate: 1800.00,
            depositAmount: 400.00,
            currentMileage: 20000,
            maxMileagePerDay: 250,
            hasAirConditioning: true,
            hasGPS: true,
            hasHeatedSeats: true,
            hasCruiseControl: true,
            description: 'Geräumiger Kombi mit Premium-Ausstattung.',
            features: 'Navi, Sitzheizung, Automatik, Viel Platz',
            imageUrl: '/assets/cars/skoda_superb.png',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 6. VW Golf Kombi (PKW)
    const vwGolf = await prisma.car.create({
        data: {
            brand: 'VW',
            model: 'Golf Kombi',
            plate: 'FK-VW 6001',
            year: 2023,
            color: 'Silber',
            fuelType: 'Diesel',
            transmission: 'Automatik',
            category: 'PKW',
            doors: 5,
            seats: 5,
            engineSize: '2.0L',
            horsePower: 150,
            fuelConsumption: '5.0 L/100km',
            co2Emission: '130 g/km',
            status: 'Active',
            vin: 'WVW60010000000006',
            dailyRate: 95.00,
            weeklyRate: 550.00,
            monthlyRate: 1600.00,
            depositAmount: 350.00,
            currentMileage: 25000,
            maxMileagePerDay: 250,
            hasAirConditioning: true,
            hasGPS: true,
            hasBluetoothAudio: true,
            description: 'Der Klassiker unter den Kombis.',
            features: 'Klimaanlage, Navi, Isofix',
            imageUrl: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 7. VW Polo (PKW)
    const vwPolo = await prisma.car.create({
        data: {
            brand: 'VW',
            model: 'Polo',
            plate: 'FK-VW 7001',
            year: 2024,
            color: 'Weiß',
            fuelType: 'Benzin',
            transmission: 'Manuell',
            category: 'PKW',
            doors: 5,
            seats: 5,
            engineSize: '1.0L',
            horsePower: 95,
            fuelConsumption: '5.2 L/100km',
            co2Emission: '118 g/km',
            status: 'Active',
            vin: 'WVW70010000000007',
            dailyRate: 65.00,
            weeklyRate: 380.00,
            monthlyRate: 1100.00,
            depositAmount: 300.00,
            currentMileage: 5000,
            maxMileagePerDay: 200,
            hasAirConditioning: true,
            hasBluetoothAudio: true,
            description: 'Wendiger Kleinwagen für die Stadt.',
            features: 'Klimaanlage, Bluetooth, Kompakt',
            imageUrl: 'https://images.unsplash.com/photo-1591112611240-540af4ee74db?auto=format&fit=crop&q=80&w=800',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 8. Hyundai Ioniq Elektro (PKW - Elektro)
    const ioniq = await prisma.car.create({
        data: {
            brand: 'Hyundai',
            model: 'Ioniq Elektro',
            plate: 'FK-HY 8001',
            year: 2023,
            color: 'Grau',
            fuelType: 'Elektro',
            transmission: 'Automatik',
            category: 'PKW',
            doors: 5,
            seats: 5,
            engineSize: 'Electric',
            horsePower: 136,
            fuelConsumption: '13.8 kWh/100km',
            co2Emission: '0 g/km',
            status: 'Active',
            vin: 'KMH80010000000008',
            dailyRate: 85.00,
            weeklyRate: 500.00,
            monthlyRate: 1500.00,
            depositAmount: 350.00,
            currentMileage: 12000,
            maxMileagePerDay: 250,
            hasAirConditioning: true,
            hasGPS: true,
            hasHeatedSeats: true,
            hasBackupCamera: true,
            description: 'Umweltfreundlich und effizient.',
            features: 'Elektroantrieb, Navi, Sitzheizung',
            imageUrl: 'https://images.unsplash.com/photo-1609529669235-c07e4e1bd6e9?auto=format&fit=crop&q=80&w=800',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 9. Fiat Ducato L3H2 Plus (Kastenwagen)
    const ducatoPlus = await prisma.car.create({
        data: {
            brand: 'Fiat',
            model: 'Ducato L3H2 Plus',
            plate: 'FK-FD 9001',
            year: 2024,
            color: 'Weiß',
            fuelType: 'Diesel',
            transmission: 'Manuell',
            category: 'Kastenwagen',
            doors: 4,
            seats: 3,
            engineSize: '2.3L',
            horsePower: 160,
            fuelConsumption: '8.8 L/100km',
            co2Emission: '225 g/km',
            status: 'Active',
            vin: 'ZFA90010000000009',
            dailyRate: 125.00,
            weeklyRate: 680.00,
            monthlyRate: 2000.00,
            depositAmount: 500.00,
            currentMileage: 2000,
            maxMileagePerDay: 200,
            hasAirConditioning: true,
            hasGPS: true,
            hasParkingSensors: true,
            description: 'Plus-Version mit extra Ausstattung für Profis.',
            features: 'Verstärkte Federung, Großer Laderaum',
            imageUrl: '/assets/cars/fiat_ducato.png',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 10. Ford Mustang Mach-E GT (PKW)
    const mustang = await prisma.car.create({
        data: {
            brand: 'Ford',
            model: 'Mustang Mach-E GT',
            plate: 'FK-FM 1010',
            year: 2024,
            color: 'Blau',
            fuelType: 'Elektro',
            transmission: 'Automatik',
            category: 'PKW',
            doors: 5,
            seats: 5,
            engineSize: 'Electric',
            horsePower: 487,
            fuelConsumption: '20.0 kWh/100km',
            co2Emission: '0 g/km',
            status: 'Active',
            vin: 'WFO10100000000010',
            dailyRate: 199.00,
            weeklyRate: 1200.00,
            monthlyRate: 3500.00,
            depositAmount: 1000.00,
            currentMileage: 1500,
            maxMileagePerDay: 200,
            hasAirConditioning: true,
            hasGPS: true,
            hasHeatedSeats: true,
            hasBackupCamera: true,
            hasCruiseControl: true,
            description: 'Vollelektrische Performance mit GT-Power.',
            features: '487 PS, Allrad, 0-100 in 3.7s, Panoramadach',
            imageUrl: 'https://images.unsplash.com/photo-1570733577530-363675629c41?auto=format&fit=crop&q=80&w=800',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 11. Peugeot Traveller Automatic (Bus)
    const peugeot = await prisma.car.create({
        data: {
            brand: 'Peugeot',
            model: 'Traveller',
            plate: 'FK-PT 1111',
            year: 2023,
            color: 'Grau',
            fuelType: 'Diesel',
            transmission: 'Automatik',
            category: 'Bus',
            doors: 5,
            seats: 8,
            engineSize: '2.0L',
            horsePower: 177,
            fuelConsumption: '7.2 L/100km',
            co2Emission: '190 g/km',
            status: 'Active',
            vin: 'VF311110000000011',
            dailyRate: 149.00,
            weeklyRate: 850.00,
            monthlyRate: 2600.00,
            depositAmount: 500.00,
            currentMileage: 25000,
            maxMileagePerDay: 300,
            hasAirConditioning: true,
            hasGPS: true,
            hasBluetoothAudio: true,
            hasBackupCamera: true,
            description: 'Reisen mit französischem Komfort.',
            features: '8 Sitze, Automatik, Schiebetüren beidseitig',
            imageUrl: '/assets/cars/peugeot_traveller.jpg',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 12. Seat Leon Kombi (PKW)
    const seatLeon = await prisma.car.create({
        data: {
            brand: 'Seat',
            model: 'Leon Kombi',
            plate: 'FK-SL 1212',
            year: 2023,
            color: 'Rot',
            fuelType: 'Benzin',
            transmission: 'Manuell',
            category: 'PKW',
            doors: 5,
            seats: 5,
            engineSize: '1.5L',
            horsePower: 130,
            fuelConsumption: '5.8 L/100km',
            co2Emission: '132 g/km',
            status: 'Active',
            vin: 'VSS12120000000012',
            dailyRate: 79.00,
            weeklyRate: 450.00,
            monthlyRate: 1400.00,
            depositAmount: 350.00,
            currentMileage: 18000,
            maxMileagePerDay: 250,
            hasAirConditioning: true,
            hasBluetoothAudio: true,
            hasCruiseControl: true,
            description: 'Sportlicher Kombi mit viel Platz.',
            features: 'Klimaanlage, Tempomat, Sportliches Design',
            imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=800',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 13. Skoda Oktavia Kombi (PKW)
    const skodaOktavia = await prisma.car.create({
        data: {
            brand: 'Skoda',
            model: 'Oktavia Kombi',
            plate: 'FK-SO 1313',
            year: 2024,
            color: 'Blau',
            fuelType: 'Diesel',
            transmission: 'Automatik',
            category: 'PKW',
            doors: 5,
            seats: 5,
            engineSize: '2.0L',
            horsePower: 150,
            fuelConsumption: '4.8 L/100km',
            co2Emission: '125 g/km',
            status: 'Active',
            vin: 'TMB13130000000013',
            dailyRate: 99.00,
            weeklyRate: 580.00,
            monthlyRate: 1700.00,
            depositAmount: 400.00,
            currentMileage: 8000,
            maxMileagePerDay: 250,
            hasAirConditioning: true,
            hasGPS: true,
            hasHeatedSeats: true,
            hasCruiseControl: true,
            description: 'Der beliebteste Kombi für Business und Familie.',
            features: 'Automatik, Navi, ACC, Sitzheizung',
            imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ebcc3?auto=format&fit=crop&q=80&w=800',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    // 14. Seat Ibiza (PKW)
    const seatIbiza = await prisma.car.create({
        data: {
            brand: 'Seat',
            model: 'Ibiza',
            plate: 'FK-SI 1414',
            year: 2023,
            color: 'Weiß',
            fuelType: 'Benzin',
            transmission: 'Manuell',
            category: 'PKW',
            doors: 5,
            seats: 5,
            engineSize: '1.0L',
            horsePower: 95,
            fuelConsumption: '5.5 L/100km',
            co2Emission: '125 g/km',
            status: 'Active',
            vin: 'VSS14140000000014',
            dailyRate: 59.00,
            weeklyRate: 350.00,
            monthlyRate: 1000.00,
            depositAmount: 300.00,
            currentMileage: 22000,
            maxMileagePerDay: 200,
            hasAirConditioning: true,
            hasBluetoothAudio: true,
            description: 'Jugendlicher Kleinwagen mit Stil.',
            features: 'Klimaanlage, Bluetooth, LED-Tagfahrlicht',
            imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    console.log('✅ Created 14 real cars based on fleet')

    // Create Options
    await prisma.option.createMany({
        data: [
            { name: 'Mehrkilometer 200 Paket', price: 66.00, type: 'package' },
            { name: 'Mehrkilometer 500 Paket', price: 150.00, type: 'package' },
            { name: 'Mehrkilometer 900 Paket', price: 247.00, type: 'package' },
            { name: 'Selbstbehalt Ermäßigung', price: 8.64, type: 'insurance', isPerDay: true },
            { name: 'Zusatzfahrer', price: 4.80, type: 'driver', isPerDay: true },
            { name: 'Mehrkilometer 1500 Paket', price: 400.00, type: 'package' },
            { name: 'Mehrkilometer 200 Paket Kleinwagen', price: 50.00, type: 'package' },
            { name: 'Mehrkilometer 500 Paket Kleinwagen', price: 125.00, type: 'package' },
            { name: 'Mehrkilometer 900 Paket Kleinwagen', price: 225.00, type: 'package' },
            { name: 'Mehrkilometer 1500 Paket Kleinwagen', price: 375.00, type: 'package' },
            { name: 'Mehrkilometer 2000 Paket', price: 519.00, type: 'package' },
            { name: 'Kindersitz 9-18 kg', price: 4.80, type: 'equipment', isPerDay: true },
            { name: 'Kindersitzerhöhung 15-36 kg', price: 2.40, type: 'equipment', isPerDay: true }
        ]
    })

    console.log('✅ Created 13 options')


    // Create Customers
    const customer1 = await prisma.customer.create({
        data: {
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'max.mustermann@example.com',
            phone: '+49 176 12345678',
            address: 'Hauptstraße 123',
            city: 'München',
            postalCode: '80331',
            country: 'Deutschland',
            licenseNumber: 'B1234567890',
            customerType: 'Private',
        }
    })

    const customer2 = await prisma.customer.create({
        data: {
            firstName: 'Anna',
            lastName: 'Schmidt',
            email: 'anna.schmidt@example.com',
            phone: '+49 176 23456789',
            address: 'Berliner Allee 45',
            city: 'Frankfurt',
            postalCode: '60311',
            country: 'Deutschland',
            licenseNumber: 'B9876543210',
            customerType: 'Business',
            company: 'Tech Solutions GmbH',
        }
    })

    const customer3 = await prisma.customer.create({
        data: {
            firstName: 'Thomas',
            lastName: 'Weber',
            email: 'thomas.weber@example.com',
            phone: '+49 176 34567890',
            address: 'Königsweg 78',
            city: 'Berlin',
            postalCode: '10115',
            country: 'Deutschland',
            licenseNumber: 'B5555555555',
            customerType: 'Private',
        }
    })

    const customer4 = await prisma.customer.create({
        data: {
            firstName: 'Lisa',
            lastName: 'Müller',
            email: 'lisa.mueller@example.com',
            phone: '+49 176 45678901',
            address: 'Hafenstraße 12',
            city: 'Hamburg',
            postalCode: '20095',
            country: 'Deutschland',
            licenseNumber: 'B1111111111',
            customerType: 'VIP',
        }
    })

    const customer5 = await prisma.customer.create({
        data: {
            firstName: 'Michael',
            lastName: 'Schneider',
            email: 'michael.schneider@example.com',
            phone: '+49 176 56789012',
            address: 'Gartenstraße 56',
            city: 'Köln',
            postalCode: '50667',
            country: 'Deutschland',
            licenseNumber: 'B2222222222',
            customerType: 'Private',
        }
    })

    console.log('✅ Created 5 customers')

    // Create Rentals - Today's pickups and returns
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Today 09:00 - Pickup
    const rental1 = await prisma.rental.create({
        data: {
            carId: mustang.id,
            customerId: customer1.id,
            startDate: new Date(today.setHours(9, 0, 0, 0)),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            pickupLocationId: muenchen.id,
            returnLocationId: muenchen.id,
            dailyRate: 150.00,
            totalDays: 7,
            totalAmount: 1050.00,
            depositPaid: 500.00,
            insuranceType: 'Vollkasko',
            insuranceCost: 15.00,
            hasGPS: true,
            paymentStatus: 'Pending',
            paymentMethod: 'Card',
            status: 'Pending',
            contractNumber: 'RNT-2026-001',
        }
    })

    // Today 11:30 - Return
    await prisma.rental.create({
        data: {
            carId: skodaSuperb.id,
            customerId: customer2.id,
            startDate: new Date(new Date().setDate(new Date().getDate() - 5)),
            endDate: new Date(today.setHours(11, 30, 0, 0)),
            pickupLocationId: frankfurt.id,
            returnLocationId: frankfurt.id,
            pickupMileage: 21500,
            dailyRate: 180.00,
            totalDays: 5,
            totalAmount: 900.00,
            depositPaid: 600.00,
            insuranceType: 'Teilkasko',
            insuranceCost: 10.00,
            paymentStatus: 'Paid',
            paymentMethod: 'Card',
            status: 'Active',
            contractNumber: 'RNT-2026-002',
        }
    })

    // Today 14:00 - Pickup
    await prisma.rental.create({
        data: {
            carId: skodaOktavia.id,
            customerId: customer3.id,
            startDate: new Date(today.setHours(14, 0, 0, 0)),
            endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
            pickupLocationId: berlin.id,
            returnLocationId: berlin.id,
            dailyRate: 160.00,
            totalDays: 3,
            totalAmount: 480.00,
            depositPaid: 550.00,
            insuranceType: 'Vollkasko',
            insuranceCost: 12.00,
            paymentStatus: 'Pending',
            status: 'Pending',
            contractNumber: 'RNT-2026-003',
        }
    })

    // Today 16:00 - Return
    await prisma.rental.create({
        data: {
            carId: vwGolf.id,
            customerId: customer4.id,
            startDate: new Date(new Date().setDate(new Date().getDate() - 3)),
            endDate: new Date(today.setHours(16, 0, 0, 0)),
            pickupLocationId: hamburg.id,
            returnLocationId: hamburg.id,
            pickupMileage: 27500,
            dailyRate: 70.00,
            totalDays: 3,
            totalAmount: 210.00,
            depositPaid: 350.00,
            insuranceType: 'Basis',
            paymentStatus: 'Paid',
            paymentMethod: 'Cash',
            status: 'Active',
            contractNumber: 'RNT-2026-004',
        }
    })

    // Completed rental
    await prisma.rental.create({
        data: {
            carId: vwPolo.id,
            customerId: customer5.id,
            startDate: new Date(new Date().setDate(new Date().getDate() - 10)),
            endDate: new Date(new Date().setDate(new Date().getDate() - 5)),
            actualReturnDate: new Date(new Date().setDate(new Date().getDate() - 5)),
            pickupLocationId: koeln.id,
            returnLocationId: koeln.id,
            pickupMileage: 34500,
            returnMileage: 35000,
            dailyRate: 60.00,
            totalDays: 5,
            totalAmount: 300.00,
            depositPaid: 300.00,
            depositReturned: 300.00,
            insuranceType: 'Basis',
            paymentStatus: 'Paid',
            paymentMethod: 'Transfer',
            status: 'Completed',
            contractNumber: 'RNT-2026-005',
        }
    })

    console.log('✅ Created 5 rentals')

    // Create Maintenance Records
    await prisma.maintenanceRecord.create({
        data: {
            carId: mustang.id,
            maintenanceType: 'Oil Change',
            description: 'Vollständiger Ölwechsel mit Filteraustausch',
            cost: 120.50,
            mileage: 14500,
            performedBy: 'BMW Service München',
            performedDate: new Date('2024-10-15'),
            nextDueDate: new Date('2026-01-23'),
            invoiceNumber: 'INV-2024-001',
        }
    })

    await prisma.maintenanceRecord.create({
        data: {
            carId: skodaSuperb.id,
            maintenanceType: 'Inspection',
            description: 'Jährliche Hauptuntersuchung',
            cost: 250.00,
            mileage: 21000,
            performedBy: 'Mercedes Service Frankfurt',
            performedDate: new Date('2024-08-10'),
            nextDueDate: new Date('2026-01-18'),
            invoiceNumber: 'INV-2024-002',
        }
    })

    await prisma.maintenanceRecord.create({
        data: {
            carId: vwPolo.id,
            maintenanceType: 'Tire Change',
            description: 'Wechsel auf Winterreifen',
            cost: 180.00,
            mileage: 34500,
            performedBy: 'Reifen Müller Köln',
            performedDate: new Date('2024-07-15'),
            nextDueDate: new Date('2026-02-05'),
            invoiceNumber: 'INV-2024-003',
        }
    })

    await prisma.maintenanceRecord.create({
        data: {
            carId: vwGolf.id,
            maintenanceType: 'Service',
            description: 'Inspektion und Bremsencheck',
            cost: 320.00,
            mileage: 27000,
            performedBy: 'VW Service Hamburg',
            performedDate: new Date('2024-09-01'),
            nextDueDate: new Date('2026-03-01'),
            invoiceNumber: 'INV-2024-004',
        }
    })

    console.log('✅ Created 4 maintenance records')

    console.log('🎉 Seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

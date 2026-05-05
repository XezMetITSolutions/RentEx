import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('ðŸŒ± Seeding database...')

    // Clean up existing data
    await prisma.payment.deleteMany()
    await prisma.maintenanceRecord.deleteMany()
    await prisma.rental.deleteMany()
    await prisma.car.deleteMany()
    await prisma.option.deleteMany()
    await prisma.location.deleteMany() // Added location cleanup
    await prisma.customer.deleteMany()

    console.log('âœ… Cleaned existing data')

    // Create Locations
    const feldkirch = await prisma.location.create({
        data: {
            name: 'Hauptfiliale Feldkirch',
            code: 'FK-MAIN',
            address: 'HauptstraÃŸe 1',
            city: 'Feldkirch',
            country: 'Ã–sterreich',
            phone: '+43 123 456789',
            email: 'feldkirch@rentex.com',
            openingTime: '08:00',
            closingTime: '18:00',
            isOpenSundays: false,
        }
    })

    const wien = await prisma.location.create({
        data: {
            name: 'Filiale Wien',
            code: 'VIE-MAIN',
            address: 'Mariahilfer StraÃŸe 1',
            city: 'Wien',
            country: 'Ã–sterreich',
            phone: '+43 1 123456',
            email: 'wien@rent-ex.at',
            openingTime: '08:00',
            closingTime: '20:00',
            isOpenSundays: true,
        }
    })

    const innsbruck = await prisma.location.create({
        data: {
            name: 'Filiale Innsbruck',
            code: 'INN-MAIN',
            address: 'Maria-Theresien-StraÃŸe 5',
            city: 'Innsbruck',
            country: 'Ã–sterreich',
            phone: '+43 512 123456',
            email: 'innsbruck@rent-ex.at',
            openingTime: '08:00',
            closingTime: '19:00',
        }
    })

    const salzburg = await prisma.location.create({
        data: {
            name: 'Filiale Salzburg',
            code: 'SZG-MAIN',
            address: 'Getreidegasse 1',
            city: 'Salzburg',
            country: 'Ã–sterreich',
            phone: '+43 662 123456',
            email: 'salzburg@rent-ex.at',
            openingTime: '08:00',
            closingTime: '19:00',
        }
    })

    const graz = await prisma.location.create({
        data: {
            name: 'Filiale Graz',
            code: 'GRZ-MAIN',
            address: 'Herrengasse 1',
            city: 'Graz',
            country: 'Ã–sterreich',
            phone: '+43 316 123456',
            email: 'graz@rent-ex.at',
        }
    })

    const linz = await prisma.location.create({
        data: {
            name: 'Filiale Linz',
            code: 'LNZ-MAIN',
            address: 'LandstraÃŸe 1',
            city: 'Linz',
            country: 'Ã–sterreich',
            phone: '+43 732 123456',
            email: 'linz@rent-ex.at',
        }
    })

    const bregenz = await prisma.location.create({
        data: {
            name: 'Filiale Bregenz',
            code: 'BRG-MAIN',
            address: 'Kornmarktplatz 1',
            city: 'Bregenz',
            country: 'Ã–sterreich',
            phone: '+43 5574 123456',
            email: 'bregenz@rent-ex.at',
        }
    })

    console.log('âœ… Created 7 Locations')

    // Create Cars with real data based on user fleet
    // Categories: PKW, Kastenwagen, Bus

    // 1. Fiat Ducato L3H2 (Kastenwagen)
    const ducatoL3 = await prisma.car.create({
        data: {
            brand: 'Fiat',
            model: 'Ducato L3H2',
            plate: 'FK-FD 3032',
            year: 2024,
            color: 'WeiÃŸ',
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
            description: 'GroÃŸer Transporter fÃ¼r UmzÃ¼ge und gewerbliche Transporte.',
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
            color: 'WeiÃŸ',
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
            description: 'Maximaler Stauraum fÃ¼r groÃŸe Transporte.',
            features: 'RÃ¼ckfahrkamera, Navi, Klimaanlage',
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
            description: 'Komfortabler 9-Sitzer fÃ¼r Gruppenreisen.',
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
            description: 'Langversion mit Automatikgetriebe fÃ¼r maximalen Komfort.',
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
            description: 'GerÃ¤umiger Kombi mit Premium-Ausstattung.',
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
            imageUrl: '/assets/cars/vw_golf_kombi.jpg',
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
            color: 'WeiÃŸ',
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
            description: 'Wendiger Kleinwagen fÃ¼r die Stadt.',
            features: 'Klimaanlage, Bluetooth, Kompakt',
            imageUrl: '/assets/cars/VWPolo.png',
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
            imageUrl: '/assets/cars/hyundai_ioniq.jpg',
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
            color: 'WeiÃŸ',
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
            description: 'Plus-Version mit extra Ausstattung fÃ¼r Profis.',
            features: 'VerstÃ¤rkte Federung, GroÃŸer Laderaum',
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
            imageUrl: '/assets/cars/Ford_Mustang_MachE_GT.png',
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
            description: 'Reisen mit franzÃ¶sischem Komfort.',
            features: '8 Sitze, Automatik, SchiebetÃ¼ren beidseitig',
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
            imageUrl: '/assets/cars/Seat_Leon_Kombi.png',
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
            description: 'Der beliebteste Kombi fÃ¼r Business und Familie.',
            features: 'Automatik, Navi, ACC, Sitzheizung',
            imageUrl: '/assets/cars/Skoda_Superb_Kombi.png',
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
            color: 'WeiÃŸ',
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
            imageUrl: '/assets/cars/VW_Golf_Kombi.png',
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    })

    console.log('âœ… Created 14 real cars based on fleet')

    // Create Option Groups
    const pkwGroup = await prisma.optionGroup.create({
        data: {
            name: 'PKW',
            description: 'Personenkraftwagen Optionen'
        }
    })

    console.log('âœ… Created Option Groups')

    // Create Options
    await prisma.option.createMany({
        data: [
            { name: 'Mehrkilometer 200 Paket', description: 'Zur Ihrer Buchung werden 200km Mehrkilometer hinzugefÃ¼gt', price: 66.00, type: 'package', groupId: pkwGroup.id },
            { name: 'Mehrkilometer 500 Paket', description: 'Zur Ihrer Buchung werden 500km Mehrkilometer hinzugefÃ¼gt', price: 150.00, type: 'package', groupId: pkwGroup.id },
            { name: 'Mehrkilometer 900 Paket', description: 'Zur Ihrer Buchung werden 900km Mehrkilometer hinzugefÃ¼gt', price: 247.00, type: 'package', groupId: pkwGroup.id },
            { name: 'Mehrkilometer 1500 Paket', description: 'Zur Ihrer Buchung werden 1500km Mehrkilometer hinzugefÃ¼gt', price: 400.00, type: 'package', groupId: pkwGroup.id },
            { name: 'Mehrkilometer 2000 Paket', description: 'Zur Ihrer Buchung werden 2000km Mehrkilometer hinzugefÃ¼gt', price: 519.00, type: 'package', groupId: pkwGroup.id },
            { name: 'Selbstbehalt ErmÃ¤ÃŸigung', description: 'Diese ErmÃ¤ÃŸigung reduziert den Selbstbehalt auf 500â‚¬. Gilt fÃ¼r den gesamten Mietzeitraum', price: 60.48, type: 'insurance', isPerDay: false, groupId: pkwGroup.id },
            { name: 'Zusatzfahrer', description: 'Ein Zusatzfahrer fÃ¼r den gesamten Mietzeitraum', price: 33.60, type: 'driver', isPerDay: false, groupId: pkwGroup.id },
            { name: 'Kindersitz 9-18 kg', price: 4.80, type: 'equipment', isPerDay: true },
            { name: 'KindersitzerhÃ¶hung 15-36 kg', price: 2.40, type: 'equipment', isPerDay: true }
        ]
    })

    console.log('âœ… Created 9 options')


    // Create Customers
    const customer1 = await prisma.customer.create({
        data: {
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'max.mustermann@example.com',
            phone: '+43 676 1234567',
            address: 'Mariahilfer StraÃŸe 123',
            city: 'Wien',
            postalCode: '1060',
            country: 'Ã–sterreich',
            licenseNumber: 'B1234567890',
            customerType: 'Private',
        }
    })

    const customer2 = await prisma.customer.create({
        data: {
            firstName: 'Anna',
            lastName: 'Schmidt',
            email: 'anna.schmidt@example.com',
            phone: '+43 676 2345678',
            address: 'BahnhofstraÃŸe 45',
            city: 'Innsbruck',
            postalCode: '6020',
            country: 'Ã–sterreich',
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
            phone: '+43 676 3456789',
            address: 'Getreidegasse 78',
            city: 'Salzburg',
            postalCode: '5020',
            country: 'Ã–sterreich',
            licenseNumber: 'B5555555555',
            customerType: 'Private',
        }
    })

    const customer4 = await prisma.customer.create({
        data: {
            firstName: 'Lisa',
            lastName: 'MÃ¼ller',
            email: 'lisa.mueller@example.com',
            phone: '+43 676 4567890',
            address: 'Herrengasse 12',
            city: 'Graz',
            postalCode: '8010',
            country: 'Ã–sterreich',
            licenseNumber: 'B1111111111',
            customerType: 'VIP',
        }
    })

    const customer5 = await prisma.customer.create({
        data: {
            firstName: 'Michael',
            lastName: 'Schneider',
            email: 'michael.schneider@example.com',
            phone: '+43 676 5678901',
            address: 'LandstraÃŸe 56',
            city: 'Linz',
            postalCode: '4020',
            country: 'Ã–sterreich',
            licenseNumber: 'B2222222222',
            customerType: 'Private',
        }
    })

    console.log('âœ… Created 5 customers')

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
            pickupLocationId: feldkirch.id,
            returnLocationId: feldkirch.id,
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
            pickupLocationId: wien.id,
            returnLocationId: wien.id,
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
            pickupLocationId: innsbruck.id,
            returnLocationId: innsbruck.id,
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
            pickupLocationId: salzburg.id,
            returnLocationId: salzburg.id,
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
            pickupLocationId: graz.id,
            returnLocationId: graz.id,
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

    console.log('âœ… Created 5 rentals')

    // Create Maintenance Records
    await prisma.maintenanceRecord.create({
        data: {
            carId: mustang.id,
            maintenanceType: 'Oil Change',
            description: 'VollstÃ¤ndiger Ã–lwechsel mit Filteraustausch',
            cost: 120.50,
            mileage: 14500,
            performedBy: 'Ford Service Feldkirch',
            performedDate: new Date('2024-10-15'),
            nextDueDate: new Date('2026-01-23'),
            invoiceNumber: 'INV-2024-001',
        }
    })

    await prisma.maintenanceRecord.create({
        data: {
            carId: skodaSuperb.id,
            maintenanceType: 'Inspection',
            description: 'JÃ¤hrliche Hauptuntersuchung',
            cost: 250.00,
            mileage: 21000,
            performedBy: 'Skoda Service Innsbruck',
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
            performedBy: 'Reifen Huber Salzburg',
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
            performedBy: 'VW Service Wien',
            performedDate: new Date('2024-09-01'),
            nextDueDate: new Date('2026-03-01'),
            invoiceNumber: 'INV-2024-004',
        }
    })

    console.log('âœ… Created 4 maintenance records')

    console.log('ðŸŽ‰ Seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('âŒ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

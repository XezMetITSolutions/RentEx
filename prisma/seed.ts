import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Clean up existing data
    await prisma.payment.deleteMany()
    await prisma.maintenanceRecord.deleteMany()
    await prisma.rental.deleteMany()
    await prisma.car.deleteMany()
    await prisma.customer.deleteMany()

    console.log('✅ Cleaned existing data')

    // Create Cars with comprehensive data
    const bmw = await prisma.car.create({
        data: {
            brand: 'BMW',
            model: '320i',
            plate: 'M-AR 1234',
            year: 2024,
            color: 'Schwarz',
            fuelType: 'Benzin',
            transmission: 'Automatik',
            category: 'Limousine',
            doors: 4,
            seats: 5,
            engineSize: '2.0L',
            horsePower: 184,
            fuelConsumption: '6.2 L/100km',
            co2Emission: '142 g/km',
            status: 'Active',
            vin: 'WBA12345678901234',
            dailyRate: 150.00,
            weeklyRate: 900.00,
            monthlyRate: 3200.00,
            depositAmount: 500.00,
            currentMileage: 15000,
            maxMileagePerDay: 250,
            hasAirConditioning: true,
            hasGPS: true,
            hasHeatedSeats: true,
            hasParkingSensors: true,
            hasBackupCamera: true,
            hasCruiseControl: true,
            hasBluetoothAudio: true,
            hasUSBPorts: true,
            description: 'Sportliche Limousine mit modernster Ausstattung',
            features: 'GPS Navigation, Klimaautomatik, Sitzheizung, Parksensoren',
            currentLocation: 'Hauptfiliale München',
            homeLocation: 'Hauptfiliale München',
            lastOilChange: new Date('2024-10-15'),
            nextOilChange: new Date('2026-01-23'),
            vignetteValidUntil: new Date('2026-12-31'),
            nextInspection: new Date('2026-06-15'),
        }
    })

    const mercedes = await prisma.car.create({
        data: {
            brand: 'Mercedes',
            model: 'C200',
            plate: 'F-AB 5678',
            year: 2023,
            color: 'Weiß',
            fuelType: 'Diesel',
            transmission: 'Automatik',
            category: 'Limousine',
            doors: 4,
            seats: 5,
            engineSize: '2.0L',
            horsePower: 204,
            fuelConsumption: '5.1 L/100km',
            co2Emission: '134 g/km',
            status: 'Rented',
            vin: 'WDD12345678901234',
            dailyRate: 180.00,
            weeklyRate: 1100.00,
            monthlyRate: 3800.00,
            depositAmount: 600.00,
            currentMileage: 22000,
            maxMileagePerDay: 250,
            hasAirConditioning: true,
            hasGPS: true,
            hasHeatedSeats: true,
            hasParkingSensors: true,
            hasBackupCamera: true,
            hasCruiseControl: true,
            hasBluetoothAudio: true,
            hasUSBPorts: true,
            description: 'Elegante Business-Limousine',
            features: 'GPS, Klimaautomatik, Ledersitze, Parksensoren',
            currentLocation: 'Filiale Frankfurt',
            homeLocation: 'Filiale Frankfurt',
            lastOilChange: new Date('2024-08-10'),
            nextOilChange: new Date('2026-02-10'),
            nextInspection: new Date('2026-01-18'),
            vignetteValidUntil: new Date('2026-12-31'),
        }
    })

    const audi = await prisma.car.create({
        data: {
            brand: 'Audi',
            model: 'A4',
            plate: 'B-CD 3456',
            year: 2024,
            color: 'Grau',
            fuelType: 'Benzin',
            transmission: 'Automatik',
            category: 'Limousine',
            doors: 4,
            seats: 5,
            engineSize: '2.0L',
            horsePower: 190,
            fuelConsumption: '6.0 L/100km',
            co2Emission: '138 g/km',
            status: 'Active',
            vin: 'WAU12345678901234',
            dailyRate: 160.00,
            weeklyRate: 950.00,
            monthlyRate: 3400.00,
            depositAmount: 550.00,
            currentMileage: 12000,
            maxMileagePerDay: 250,
            hasAirConditioning: true,
            hasGPS: true,
            hasHeatedSeats: true,
            hasParkingSensors: true,
            hasBackupCamera: true,
            hasCruiseControl: true,
            hasBluetoothAudio: true,
            hasUSBPorts: true,
            description: 'Moderne Limousine mit Quattro-Antrieb',
            features: 'GPS, Klimaautomatik, Quattro, LED-Scheinwerfer',
            currentLocation: 'Filiale Berlin',
            homeLocation: 'Filiale Berlin',
            lastOilChange: new Date('2024-11-20'),
            nextOilChange: new Date('2026-05-20'),
            vignetteValidUntil: new Date('2026-12-31'),
        }
    })

    const vw = await prisma.car.create({
        data: {
            brand: 'VW',
            model: 'Golf',
            plate: 'HH-EF 7890',
            year: 2023,
            color: 'Blau',
            fuelType: 'Benzin',
            transmission: 'Manuell',
            category: 'Kleinwagen',
            doors: 5,
            seats: 5,
            engineSize: '1.5L',
            horsePower: 130,
            fuelConsumption: '5.2 L/100km',
            co2Emission: '120 g/km',
            status: 'Active',
            vin: 'WVW12345678901234',
            dailyRate: 70.00,
            weeklyRate: 420.00,
            monthlyRate: 1500.00,
            depositAmount: 350.00,
            currentMileage: 28000,
            maxMileagePerDay: 200,
            hasAirConditioning: true,
            hasGPS: false,
            hasBluetoothAudio: true,
            hasUSBPorts: true,
            description: 'Zuverlässiger Kompaktwagen',
            features: 'Klimaanlage, Bluetooth, USB',
            currentLocation: 'Filiale Hamburg',
            homeLocation: 'Filiale Hamburg',
            lastTireChange: new Date('2024-09-01'),
            nextOilChange: new Date('2026-03-01'),
            vignetteValidUntil: new Date('2026-12-31'),
        }
    })

    const renault = await prisma.car.create({
        data: {
            brand: 'Renault',
            model: 'Clio',
            plate: 'K-RC 9876',
            year: 2022,
            color: 'Rot',
            fuelType: 'Benzin',
            transmission: 'Manuell',
            category: 'Kleinwagen',
            doors: 5,
            seats: 5,
            engineSize: '1.0L',
            horsePower: 90,
            fuelConsumption: '4.8 L/100km',
            co2Emission: '110 g/km',
            status: 'Active',
            vin: 'VF112345678901234',
            dailyRate: 60.00,
            weeklyRate: 350.00,
            monthlyRate: 1200.00,
            depositAmount: 300.00,
            currentMileage: 35000,
            maxMileagePerDay: 200,
            hasAirConditioning: true,
            hasGPS: false,
            hasBluetoothAudio: true,
            hasUSBPorts: true,
            description: 'Kompakter Stadtflitzer',
            features: 'Klimaanlage, Bluetooth, USB',
            currentLocation: 'Filiale Köln',
            homeLocation: 'Filiale Köln',
            lastTireChange: new Date('2024-07-15'),
            nextOilChange: new Date('2026-02-05'),
            vignetteValidUntil: new Date('2026-01-27'),
        }
    })

    const fiat = await prisma.car.create({
        data: {
            brand: 'Fiat',
            model: 'Egea',
            plate: 'S-FE 5555',
            year: 2023,
            color: 'Grau',
            fuelType: 'Diesel',
            transmission: 'Manuell',
            category: 'Mittelklasse',
            doors: 4,
            seats: 5,
            engineSize: '1.6L',
            horsePower: 120,
            fuelConsumption: '4.2 L/100km',
            co2Emission: '112 g/km',
            status: 'Active',
            vin: 'ZFA12345678901234',
            dailyRate: 50.00,
            weeklyRate: 300.00,
            monthlyRate: 1000.00,
            depositAmount: 250.00,
            currentMileage: 18000,
            maxMileagePerDay: 200,
            hasAirConditioning: true,
            hasGPS: false,
            hasBluetoothAudio: true,
            hasUSBPorts: true,
            description: 'Zuverlässige Familienlimousine',
            features: 'Klimaanlage, Bluetooth',
            currentLocation: 'Filiale Stuttgart',
            homeLocation: 'Filiale Stuttgart',
            lastOilChange: new Date('2024-12-01'),
            nextOilChange: new Date('2026-06-01'),
            vignetteValidUntil: new Date('2026-12-31'),
        }
    })

    console.log('✅ Created 6 cars')

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
            carId: bmw.id,
            customerId: customer1.id,
            startDate: new Date(today.setHours(9, 0, 0, 0)),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            pickupLocation: 'Hauptfiliale München',
            returnLocation: 'Hauptfiliale München',
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
            carId: mercedes.id,
            customerId: customer2.id,
            startDate: new Date(new Date().setDate(new Date().getDate() - 5)),
            endDate: new Date(today.setHours(11, 30, 0, 0)),
            pickupLocation: 'Filiale Frankfurt',
            returnLocation: 'Filiale Frankfurt',
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
            carId: audi.id,
            customerId: customer3.id,
            startDate: new Date(today.setHours(14, 0, 0, 0)),
            endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
            pickupLocation: 'Filiale Berlin',
            returnLocation: 'Filiale Berlin',
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
            carId: vw.id,
            customerId: customer4.id,
            startDate: new Date(new Date().setDate(new Date().getDate() - 3)),
            endDate: new Date(today.setHours(16, 0, 0, 0)),
            pickupLocation: 'Filiale Hamburg',
            returnLocation: 'Filiale Hamburg',
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
            carId: renault.id,
            customerId: customer5.id,
            startDate: new Date(new Date().setDate(new Date().getDate() - 10)),
            endDate: new Date(new Date().setDate(new Date().getDate() - 5)),
            actualReturnDate: new Date(new Date().setDate(new Date().getDate() - 5)),
            pickupLocation: 'Filiale Köln',
            returnLocation: 'Filiale Köln',
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
            carId: bmw.id,
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
            carId: mercedes.id,
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
            carId: renault.id,
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
            carId: vw.id,
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

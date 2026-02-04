'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { differenceInDays } from 'date-fns';

export async function createCar(formData: FormData) {
    const rawData = {
        // Basic Information
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        plate: formData.get('plate') as string,
        year: Number(formData.get('year')),
        color: formData.get('color') as string,

        // Technical Specifications
        fuelType: formData.get('fuelType') as string || 'Benzin',
        transmission: formData.get('transmission') as string,
        category: formData.get('category') as string,
        doors: formData.get('doors') ? Number(formData.get('doors')) : null,
        seats: formData.get('seats') ? Number(formData.get('seats')) : null,
        engineSize: formData.get('engineSize') as string || null,
        horsePower: formData.get('horsePower') ? Number(formData.get('horsePower')) : null,
        fuelConsumption: formData.get('fuelConsumption') as string || null,
        co2Emission: formData.get('co2Emission') as string || null,

        // Status & Identification
        status: formData.get('status') as string,
        vin: formData.get('vin') as string || null,

        // Pricing
        dailyRate: Number(formData.get('dailyRate')),
        weeklyRate: formData.get('weeklyRate') ? Number(formData.get('weeklyRate')) : null,
        monthlyRate: formData.get('monthlyRate') ? Number(formData.get('monthlyRate')) : null,
        depositAmount: formData.get('depositAmount') ? Number(formData.get('depositAmount')) : null,

        // Promotional Pricing
        promoPrice: formData.get('promoPrice') ? Number(formData.get('promoPrice')) : null,
        promoStartDate: formData.get('promoStartDate') ? new Date(formData.get('promoStartDate') as string) : null,
        promoEndDate: formData.get('promoEndDate') ? new Date(formData.get('promoEndDate') as string) : null,

        // Insurance & Documents
        insuranceCompany: formData.get('insuranceCompany') as string || null,
        insurancePolicyNumber: formData.get('insurancePolicyNumber') as string || null,
        insuranceValidUntil: formData.get('insuranceValidUntil') ? new Date(formData.get('insuranceValidUntil') as string) : null,
        registrationDate: formData.get('registrationDate') ? new Date(formData.get('registrationDate') as string) : null,
        nextInspection: formData.get('nextInspection') ? new Date(formData.get('nextInspection') as string) : null,

        // Mileage & Usage
        currentMileage: formData.get('currentMileage') ? Number(formData.get('currentMileage')) : null,
        purchaseMileage: formData.get('purchaseMileage') ? Number(formData.get('purchaseMileage')) : null,

        // Content & Media
        description: formData.get('description') as string || null,
        features: formData.get('features') as string || null,

        // Equipment & Features
        hasAirConditioning: formData.get('hasAirConditioning') === 'on',
        hasGPS: formData.get('hasGPS') === 'on',
        hasHeatedSeats: formData.get('hasHeatedSeats') === 'on',
        hasParkingSensors: formData.get('hasParkingSensors') === 'on',
        hasBackupCamera: formData.get('hasBackupCamera') === 'on',
        hasCruiseControl: formData.get('hasCruiseControl') === 'on',
        hasBluetoothAudio: formData.get('hasBluetoothAudio') === 'on',
        hasUSBPorts: formData.get('hasUSBPorts') === 'on',
        hasChildSeatAnchors: formData.get('hasChildSeatAnchors') === 'on',
        hasSkiRack: formData.get('hasSkiRack') === 'on',
        hasTowHitch: formData.get('hasTowHitch') === 'on',

        // Maintenance & Services
        vignetteValidUntil: formData.get('vignetteValidUntil') ? new Date(formData.get('vignetteValidUntil') as string) : null,
        lastOilChange: formData.get('lastOilChange') ? new Date(formData.get('lastOilChange') as string) : null,
        nextOilChange: formData.get('nextOilChange') ? new Date(formData.get('nextOilChange') as string) : null,
        lastTireChange: formData.get('lastTireChange') ? new Date(formData.get('lastTireChange') as string) : null,
        tireType: formData.get('tireType') as string || null,
        nextServiceDate: formData.get('nextServiceDate') ? new Date(formData.get('nextServiceDate') as string) : null,
        lastServiceDate: formData.get('lastServiceDate') ? new Date(formData.get('lastServiceDate') as string) : null,

        // Location & Availability
        // Location & Availability
        locationId: formData.get('locationId') ? Number(formData.get('locationId')) : null,
        homeLocationId: formData.get('homeLocationId') ? Number(formData.get('homeLocationId')) : null,

        // Financial
        purchasePrice: formData.get('purchasePrice') ? Number(formData.get('purchasePrice')) : null,
        purchaseDate: formData.get('purchaseDate') ? new Date(formData.get('purchaseDate') as string) : null,
        currentValue: formData.get('currentValue') ? Number(formData.get('currentValue')) : null,

        // Internal Management
        internalNotes: formData.get('internalNotes') as string || null,
        isActive: true,
    };

    await prisma.car.create({
        data: rawData
    });

    revalidatePath('/admin/fleet');
    redirect('/admin/fleet');
}

export async function updateCar(id: number, formData: FormData) {
    const rawData = {
        // Basic Information
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        plate: formData.get('plate') as string,
        year: Number(formData.get('year')),
        color: formData.get('color') as string,

        // Technical Specifications
        fuelType: formData.get('fuelType') as string || 'Benzin',
        transmission: formData.get('transmission') as string,
        category: formData.get('category') as string,
        doors: formData.get('doors') ? Number(formData.get('doors')) : null,
        seats: formData.get('seats') ? Number(formData.get('seats')) : null,
        engineSize: formData.get('engineSize') as string || null,
        horsePower: formData.get('horsePower') ? Number(formData.get('horsePower')) : null,
        fuelConsumption: formData.get('fuelConsumption') as string || null,
        co2Emission: formData.get('co2Emission') as string || null,

        // Status & Identification
        status: formData.get('status') as string,
        vin: formData.get('vin') as string || null,

        // Pricing
        dailyRate: Number(formData.get('dailyRate')),
        weeklyRate: formData.get('weeklyRate') ? Number(formData.get('weeklyRate')) : null,
        monthlyRate: formData.get('monthlyRate') ? Number(formData.get('monthlyRate')) : null,
        depositAmount: formData.get('depositAmount') ? Number(formData.get('depositAmount')) : null,

        // Promotional Pricing
        promoPrice: formData.get('promoPrice') ? Number(formData.get('promoPrice')) : null,
        promoStartDate: formData.get('promoStartDate') ? new Date(formData.get('promoStartDate') as string) : null,
        promoEndDate: formData.get('promoEndDate') ? new Date(formData.get('promoEndDate') as string) : null,

        // Insurance & Documents
        insuranceCompany: formData.get('insuranceCompany') as string || null,
        insurancePolicyNumber: formData.get('insurancePolicyNumber') as string || null,
        insuranceValidUntil: formData.get('insuranceValidUntil') ? new Date(formData.get('insuranceValidUntil') as string) : null,
        registrationDate: formData.get('registrationDate') ? new Date(formData.get('registrationDate') as string) : null,
        nextInspection: formData.get('nextInspection') ? new Date(formData.get('nextInspection') as string) : null,

        // Mileage & Usage
        currentMileage: formData.get('currentMileage') ? Number(formData.get('currentMileage')) : null,
        purchaseMileage: formData.get('purchaseMileage') ? Number(formData.get('purchaseMileage')) : null,

        // Content & Media
        description: formData.get('description') as string || null,
        features: formData.get('features') as string || null,
        imageUrl: formData.get('imageUrl') as string || null,

        // Equipment & Features
        hasAirConditioning: formData.get('hasAirConditioning') === 'on',
        hasGPS: formData.get('hasGPS') === 'on',
        hasHeatedSeats: formData.get('hasHeatedSeats') === 'on',
        hasParkingSensors: formData.get('hasParkingSensors') === 'on',
        hasBackupCamera: formData.get('hasBackupCamera') === 'on',
        hasCruiseControl: formData.get('hasCruiseControl') === 'on',
        hasBluetoothAudio: formData.get('hasBluetoothAudio') === 'on',
        hasUSBPorts: formData.get('hasUSBPorts') === 'on',
        hasChildSeatAnchors: formData.get('hasChildSeatAnchors') === 'on',
        hasSkiRack: formData.get('hasSkiRack') === 'on',
        hasTowHitch: formData.get('hasTowHitch') === 'on',

        // Maintenance & Services
        vignetteValidUntil: formData.get('vignetteValidUntil') ? new Date(formData.get('vignetteValidUntil') as string) : null,
        lastOilChange: formData.get('lastOilChange') ? new Date(formData.get('lastOilChange') as string) : null,
        nextOilChange: formData.get('nextOilChange') ? new Date(formData.get('nextOilChange') as string) : null,
        lastTireChange: formData.get('lastTireChange') ? new Date(formData.get('lastTireChange') as string) : null,
        tireType: formData.get('tireType') as string || null,
        nextServiceDate: formData.get('nextServiceDate') ? new Date(formData.get('nextServiceDate') as string) : null,
        lastServiceDate: formData.get('lastServiceDate') ? new Date(formData.get('lastServiceDate') as string) : null,

        // Location & Availability
        locationId: formData.get('locationId') ? Number(formData.get('locationId')) : null,
        homeLocationId: formData.get('homeLocationId') ? Number(formData.get('homeLocationId')) : null,

        // Financial
        purchasePrice: formData.get('purchasePrice') ? Number(formData.get('purchasePrice')) : null,
        purchaseDate: formData.get('purchaseDate') ? new Date(formData.get('purchaseDate') as string) : null,
        currentValue: formData.get('currentValue') ? Number(formData.get('currentValue')) : null,

        // Internal Management
        internalNotes: formData.get('internalNotes') as string || null,
    };

    await prisma.car.update({
        where: { id },
        data: rawData
    });

    revalidatePath('/admin/fleet');
    revalidatePath(`/admin/fleet/${id}`);
    redirect(`/admin/fleet/${id}`);
}

export async function createCustomer(formData: FormData) {
    const data = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || null,
        address: formData.get('address') as string || null,
        city: formData.get('city') as string || null,
        postalCode: formData.get('postalCode') as string || null,
        country: formData.get('country') as string || 'Deutschland',
        licenseNumber: formData.get('licenseNumber') as string || null,
        dateOfBirth: formData.get('dateOfBirth') ? new Date(formData.get('dateOfBirth') as string) : null,
        notes: formData.get('notes') as string || null,
    };

    await prisma.customer.create({
        data
    });

    revalidatePath('/admin/customers');
    redirect('/admin/customers');
}

export async function createRental(formData: FormData) {
    const carId = Number(formData.get('carId'));
    const customerId = Number(formData.get('customerId'));
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);

    // Fetch car for rate calculation
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) throw new Error('Car not found');

    const days = differenceInDays(endDate, startDate) || 1;
    const totalAmount = Number(car.dailyRate) * days;

    const data = {
        carId,
        customerId,
        startDate,
        endDate,
        dailyRate: car.dailyRate,
        totalDays: days,
        totalAmount,
        status: 'Active',
        paymentStatus: 'Pending',
        fuelLevelPickup: formData.get('fuelLevelPickup') as string || 'Full',
        pickupLocationId: formData.get('pickupLocationId') ? Number(formData.get('pickupLocationId')) : null,
        returnLocationId: formData.get('returnLocationId') ? Number(formData.get('returnLocationId')) : null,
        depositPaid: formData.get('depositPaid') ? Number(formData.get('depositPaid')) : null,
        notes: formData.get('notes') as string || null,
    };

    await prisma.rental.create({
        data
    });

    await prisma.car.update({
        where: { id: carId },
        data: { status: 'Rented' }
    });

    revalidatePath('/admin/reservations');
    revalidatePath('/admin/fleet');
    redirect('/admin/reservations');
}

export async function createMaintenance(formData: FormData) {
    const carId = Number(formData.get('carId'));
    const data = {
        carId,
        maintenanceType: formData.get('maintenanceType') as string,
        description: formData.get('description') as string,
        cost: formData.get('cost') ? Number(formData.get('cost')) : null,
        performedBy: formData.get('performedBy') as string || null,
        performedDate: new Date(formData.get('performedDate') as string),
        mileage: formData.get('mileage') ? Number(formData.get('mileage')) : null,
        notes: formData.get('notes') as string || null,
    };

    await prisma.maintenanceRecord.create({
        data
    });

    // Optionally update car status to 'Maintenance' if date is today or present
    if (data.maintenanceType === 'Repair' || data.maintenanceType === 'Service') {
        const isToday = new Date().toDateString() === data.performedDate.toDateString();
        if (isToday) {
            await prisma.car.update({
                where: { id: carId },
                data: { status: 'Maintenance' }
            });
        }
    }

    revalidatePath('/admin/maintenance');
    redirect('/admin/maintenance');
}

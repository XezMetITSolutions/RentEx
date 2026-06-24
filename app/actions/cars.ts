'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────
// Helpers — kept private to this module
// ─────────────────────────────────────────────────────────────────

const safeNumber = (val: any) => {
    const n = Number(val);
    return isNaN(n) ? null : n;
};

const safeDate = (val: any) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
};

const extractCarData = (formData: FormData) => {
    return {
        // Basic Information
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        plate: formData.get('plate') as string,
        year: safeNumber(formData.get('year')) || new Date().getFullYear(),
        color: formData.get('color') as string,

        // Technical Specifications
        fuelType: formData.get('fuelType') as string || 'Benzin',
        transmission: formData.get('transmission') as string,
        category: formData.get('category') as string,
        doors: safeNumber(formData.get('doors')),
        seats: safeNumber(formData.get('seats')),
        engineSize: formData.get('engineSize') as string || null,
        horsePower: safeNumber(formData.get('horsePower')),
        fuelConsumption: formData.get('fuelConsumption') as string || null,
        co2Emission: formData.get('co2Emission') as string || null,

        // Status & Identification
        status: formData.get('status') as string,
        vin: (formData.get('vin') as string)?.trim() || null,
        chassisNumber: (formData.get('chassisNumber') as string)?.trim() || null,

        // Pricing
        dailyRate: safeNumber(formData.get('dailyRate')) ?? 0,
        weeklyRate: safeNumber(formData.get('weeklyRate')),
        monthlyRate: safeNumber(formData.get('monthlyRate')),
        longTermRate: safeNumber(formData.get('longTermRate')),
        minDaysForLongTerm: safeNumber(formData.get('minDaysForLongTerm')),
        depositAmount: safeNumber(formData.get('depositAmount')),

        // Promotional Pricing
        promoPrice: safeNumber(formData.get('promoPrice')),
        promoStartDate: safeDate(formData.get('promoStartDate')),
        promoEndDate: safeDate(formData.get('promoEndDate')),

        // Insurance & Documents
        insuranceCompany: formData.get('insuranceCompany') as string || null,
        insurancePolicyNumber: formData.get('insurancePolicyNumber') as string || null,
        insuranceValidUntil: safeDate(formData.get('insuranceValidUntil')),
        registrationDate: safeDate(formData.get('registrationDate')),
        nextInspection: safeDate(formData.get('nextInspection')),

        // Mileage & Usage
        currentMileage: safeNumber(formData.get('currentMileage')),
        purchaseMileage: safeNumber(formData.get('purchaseMileage')),
        maxMileagePerDay: safeNumber(formData.get('maxMileagePerDay')),

        // Content & Media
        description: (formData.get('description') as string)?.trim() || null,
        features: (formData.get('features') as string)?.trim() || null,
        imageUrl: (formData.get('imageUrl') as string)?.trim() || null,
        images: (formData.get('images') as string)?.trim() || null,

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
        vignetteValidUntil: safeDate(formData.get('vignetteValidUntil')),
        vignetteType: (formData.get('vignetteType') as string)?.trim() || null,
        lastOilChange: safeDate(formData.get('lastOilChange')),
        nextOilChange: safeDate(formData.get('nextOilChange')),
        lastTireChange: safeDate(formData.get('lastTireChange')),
        tireType: formData.get('tireType') as string || null,
        nextServiceDate: safeDate(formData.get('nextServiceDate')),
        lastServiceDate: safeDate(formData.get('lastServiceDate')),

        // Location & Availability
        locationId: safeNumber(formData.get('locationId')),
        homeLocationId: safeNumber(formData.get('homeLocationId')),

        // Financial
        purchasePrice: safeNumber(formData.get('purchasePrice')),
        purchaseDate: safeDate(formData.get('purchaseDate')),
        currentValue: safeNumber(formData.get('currentValue')),

        // Internal Management
        internalNotes: (formData.get('internalNotes') as string)?.trim() || null,
        damageHistory: (formData.get('damageHistory') as string)?.trim() || null,
        isActive: formData.get('isActive') === 'on',

        // GPS
        latitude: formData.get('latitude') ? safeNumber(formData.get('latitude')) : null,
        longitude: formData.get('longitude') ? safeNumber(formData.get('longitude')) : null,
    };
};

// ─────────────────────────────────────────────────────────────────
// Public actions
// ─────────────────────────────────────────────────────────────────

export async function getFeaturedCars() {
    const cars = await prisma.car.findMany({
        where: { status: 'Active' },
        orderBy: { dailyRate: 'asc' },
    });

    const grouped = cars.reduce((acc, car) => {
        const key = `${car.brand}-${car.model}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(car);
        return acc;
    }, {} as Record<string, typeof cars>);

    const uniqueCars = Object.values(grouped).map((group) => {
        const randomIndex = Math.floor(Math.random() * group.length);
        return group[randomIndex];
    });

    return uniqueCars.sort((a, b) => Number(a.dailyRate) - Number(b.dailyRate));
}

export async function createCar(formData: FormData) {
    try {
        const rawData = extractCarData(formData);
        const optionIds = formData.getAll('options').map((id) => Number(id));

        const templates = await prisma.option.findMany({
            where: { id: { in: optionIds } },
        });

        const optionsToCreate = templates.map((t) => ({
            name: t.name,
            description: t.description,
            price: Number(t.price),
            type: t.type,
            carCategory: t.carCategory,
            isPerDay: t.isPerDay,
            maxPrice: t.maxPrice ? Number(t.maxPrice) : null,
            maxDays: t.maxDays,
            isMandatory: t.isMandatory,
            maxQuantity: t.maxQuantity,
            status: t.status,
            imageUrl: t.imageUrl,
            groupId: t.groupId,
        }));

        await prisma.car.create({
            data: {
                ...rawData,
                isActive: true,
                options: { create: optionsToCreate },
            } as any,
        });
    } catch (error) {
        console.error('Error creating car:', error);
        return { success: false, error: 'Fehler beim Erstellen des Fahrzeugs' };
    }

    revalidatePath('/admin/fleet');
    redirect('/admin/fleet');
}

export async function updateCar(id: number, formData: FormData) {
    try {
        const rawData = extractCarData(formData);
        const submittedOptionIds = formData.getAll('options').map((oid) => Number(oid));

        const currentCar = await prisma.car.findUnique({
            where: { id },
            include: { options: true },
        });

        if (!currentCar) throw new Error('Fahrzeug nicht gefunden');

        const currentOptionIds = currentCar.options.map((o) => o.id);
        const optionsToDeleteIds = currentOptionIds.filter((cid) => !submittedOptionIds.includes(cid));
        const optionsToCloneIds = submittedOptionIds.filter((sid) => !currentOptionIds.includes(sid));

        const templatesToClone = await prisma.option.findMany({
            where: { id: { in: optionsToCloneIds } },
        });

        await prisma.$transaction([
            prisma.option.deleteMany({ where: { id: { in: optionsToDeleteIds } } }),
            prisma.option.createMany({
                data: templatesToClone.map((t) => ({
                    name: t.name,
                    description: t.description,
                    price: Number(t.price),
                    type: t.type,
                    carCategory: t.carCategory,
                    isPerDay: t.isPerDay,
                    maxPrice: t.maxPrice ? Number(t.maxPrice) : null,
                    maxDays: t.maxDays,
                    isMandatory: t.isMandatory,
                    maxQuantity: t.maxQuantity,
                    status: t.status,
                    imageUrl: t.imageUrl,
                    groupId: t.groupId,
                    carId: id,
                })),
            }),
            prisma.car.update({ where: { id }, data: rawData as any }),
        ]);
    } catch (error) {
        console.error('Error updating car:', error);
        return { success: false, error: 'Fehler beim Aktualisieren des Fahrzeugs' };
    }

    revalidatePath('/admin/fleet');
    revalidatePath(`/admin/fleet/${id}`);
    redirect(`/admin/fleet/${id}`);
}

export async function deleteCar(id: number) {
    try {
        await prisma.car.delete({ where: { id } });
        revalidatePath('/admin/fleet');
        return { success: true };
    } catch (error) {
        console.error('Error deleting car:', error);
        return { success: false, error: 'Failed to delete vehicle' };
    }
}

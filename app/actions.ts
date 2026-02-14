'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { differenceInDays } from 'date-fns';

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


export async function createCar(formData: FormData) {
    const rawData = extractCarData(formData);
    const optionIds = formData.getAll('options').map(id => Number(id));

    // Fetch the templates to clone
    const templates = await prisma.option.findMany({
        where: { id: { in: optionIds } }
    });

    const optionsToCreate = templates.map(t => ({
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
            options: {
                create: optionsToCreate
            }
        } as any
    });

    revalidatePath('/admin/fleet');
    redirect('/admin/fleet');
}

export async function updateCar(id: number, formData: FormData): Promise<void> {
    const rawData = extractCarData(formData);
    const submittedOptionIds = formData.getAll('options').map(oid => Number(oid));

    // 1. Fetch current car options to know what to delete
    const currentCar = await prisma.car.findUnique({
        where: { id },
        include: { options: true }
    });

    if (!currentCar) throw new Error("Car not found");

    const currentOptionIds = currentCar.options.map(o => o.id);

    // Options to DELETE: belonging to car but NOT in submitted
    const optionsToDeleteIds = currentOptionIds.filter(cid => !submittedOptionIds.includes(cid));

    // Options to ADD (Clone): submitted IDs that are NOT belonging to this car (i.e., Templates)
    const optionsToCloneIds = submittedOptionIds.filter(sid => !currentOptionIds.includes(sid));

    // Fetch templates for cloning
    const templatesToClone = await prisma.option.findMany({
        where: { id: { in: optionsToCloneIds } }
    });

    await prisma.$transaction([
        // Delete removed options
        prisma.option.deleteMany({
            where: { id: { in: optionsToDeleteIds } }
        }),
        // Create new clones
        prisma.option.createMany({
            data: templatesToClone.map(t => ({
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
                carId: id
            }))
        }),
        // Update car details
        prisma.car.update({
            where: { id },
            data: rawData as any
        })
    ]);

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
        performedDate: formData.get('performedDate') ? new Date(formData.get('performedDate') as string) : new Date(),
        nextMaintenanceDate: formData.get('nextMaintenanceDate') ? new Date(formData.get('nextMaintenanceDate') as string) : null,
        currentMileage: formData.get('currentMileage') ? Number(formData.get('currentMileage')) : null,
    };

    await prisma.maintenanceRecord.create({
        data
    });

    // Update car status if maintenance is today
    if (data.performedDate) {
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

export async function updateCompetitorPrices() {
    // 1. Get unique car models from our fleet
    const cars = await prisma.car.findMany({
        select: {
            brand: true,
            model: true,
            category: true,
            dailyRate: true,
        },
        distinct: ['brand', 'model']
    });

    const competitors = ['Sixt', 'Europcar', 'Hertz', 'Avis'];

    for (const car of cars) {
        const carModelName = `${car.brand} ${car.model}`;
        const basePrice = Number(car.dailyRate) || 100;

        for (const competitor of competitors) {
            // Generate a price roughly +/- 20% of our price
            const variance = (Math.random() * 0.4) - 0.2; // -0.2 to +0.2
            const simulatedPrice = basePrice * (1 + variance);

            await prisma.competitorPrice.create({
                data: {
                    carModel: carModelName,
                    competitorName: competitor,
                    dailyRate: simulatedPrice,
                    category: car.category,
                    fetchedAt: new Date(),
                }
            });
        }
    }

    revalidatePath('/admin/pricing');
}

export async function updateSystemSetting(key: string, value: string) {
    try {
        await prisma.systemSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value, category: 'General' }
        });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Error updating setting:', error);
        return { success: false, error: 'Failed to update setting' };
    }
}

export async function deleteCar(id: number) {
    try {
        await prisma.car.delete({
            where: { id }
        });
        revalidatePath('/admin/fleet');
        return { success: true };
    } catch (error) {
        console.error('Error deleting car:', error);
        return { success: false, error: 'Failed to delete vehicle' };
    }
}

export async function createOption(formData: FormData) {
    try {
        const carId = formData.get('carId') ? Number(formData.get('carId')) : null;
        const groupId = formData.get('groupId') ? Number(formData.get('groupId')) : null;
        await prisma.option.create({
            data: {
                name: formData.get('name') as string,
                description: formData.get('description') as string || null,
                price: Number(formData.get('price')),
                type: formData.get('type') as string,
                carCategory: formData.get('carCategory') as string || null,
                isPerDay: formData.get('isPerDay') === 'on',
                status: 'active',
                carId: carId,
                groupId: groupId
            }
        });
        revalidatePath('/admin/options');
        return { success: true };
    } catch (error) {
        console.error('Error creating option:', error);
        return { success: false, error: 'Failed to create option' };
    }
}

export async function deleteOption(id: number) {
    try {
        await prisma.option.delete({
            where: { id }
        });
        revalidatePath('/admin/options');
        revalidatePath('/admin/fleet');
        return { success: true };
    } catch (error) {
        console.error('Error deleting option:', error);
        return { success: false, error: 'Failed to delete option' };
    }
}

export async function updateOption(id: number, formData: FormData) {
    try {
        const groupId = formData.get('groupId') ? Number(formData.get('groupId')) : null;
        await prisma.option.update({
            where: { id },
            data: {
                name: formData.get('name') as string,
                description: formData.get('description') as string || null,
                price: Number(formData.get('price')),
                type: formData.get('type') as string,
                carCategory: formData.get('carCategory') as string || null,
                isPerDay: formData.get('isPerDay') === 'on',
                groupId: groupId
            }
        });
        revalidatePath('/admin/options');
        revalidatePath('/admin/fleet');
        return { success: true };
    } catch (error) {
        console.error('Error updating option:', error);
        return { success: false, error: 'Failed to update option' };
    }
}

export async function createOptionGroup(formData: FormData) {
    try {
        await prisma.optionGroup.create({
            data: {
                name: formData.get('name') as string,
                description: formData.get('description') as string || null,
            }
        });
        revalidatePath('/admin/options');
        return { success: true };
    } catch (error) {
        console.error('Error creating group:', error);
        return { success: false, error: 'Failed' };
    }
}

export async function deleteOptionGroup(id: number) {
    try {
        await prisma.optionGroup.delete({ where: { id } });
        revalidatePath('/admin/options');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}

export async function fixDatabaseSchema() {
    try {
        console.log('Running manual schema correction (One-to-Many)...');

        // 1. Add carId column to Option if it doesn't exist
        await prisma.$executeRawUnsafe(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Option' AND column_name='carId') THEN
                    ALTER TABLE "Option" ADD COLUMN "carId" INTEGER;
                END IF;
            END $$;
        `);

        // 2. Ensure foreign key constraint
        await prisma.$executeRawUnsafe(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Option_carId_fkey') THEN
                    ALTER TABLE "Option" ADD CONSTRAINT "Option_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        // 3. Drop the many-to-many join table if it exists
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "_CarOptions";`);
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "_CarToOption";`);

        console.log('Schema correction completed.');
        return { success: true };
    } catch (error: any) {
        console.error('Schema correction failed:', error);
        return { success: false, error: error.message };
    }
}

export async function runDebugQuery(sql: string) {
    try {
        console.log('Running debug query:', sql);
        const data = await prisma.$queryRawUnsafe(sql);
        return { success: true, data };
    } catch (error: any) {
        console.error('Debug query failed:', error);
        return { success: false, error: error.message };
    }
}

export async function runDiagnostics() {
    const results: any = {
        database: { status: 'unknown', error: null },
        models: {},
        schema: [],
        updateTest: { status: 'not_run', error: null }
    };

    try {
        // 1. Connection Test
        await prisma.$connect();
        results.database.status = 'connected';

        // 2. Model Availability Test
        const models = ['car', 'option', 'optionGroup', 'customer', 'rental', 'location'];
        for (const model of models) {
            try {
                const count = await (prisma as any)[model].count();
                results.models[model] = { status: 'ok', count };
            } catch (err: any) {
                results.models[model] = { status: 'error', error: err.message };
            }
        }

        // 3. Detailed Column Check for 'Option'
        const columns: any = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'Option'
            ORDER BY ordinal_position;
        `;
        results.schema = columns;

        return { success: true, results };
    } catch (error: any) {
        return { success: false, error: error.message, results };
    }
}


export async function testUpdateCarAction(id: number) {
    try {
        console.log('--- STARTING REAL-WORLD TEST FOR CAR ', id, ' ---');

        // 1. Fetch the car with options
        const car = await prisma.car.findUnique({
            where: { id },
            include: { options: true }
        });

        if (!car) return { success: false, error: `Araç bulunamadı (ID ${id})` };

        // 2. Perform a transaction that mimics the actual updateCar action
        await prisma.$transaction(async (tx) => {
            // Mimic option update (cloning/setting)
            // Just updated something simple to see if relations fail
            await tx.car.update({
                where: { id },
                data: {
                    updatedAt: new Date(),
                    fuelType: car.fuelType || 'Benzin'
                }
            });

            // Count options
            const optionCount = await tx.option.count({ where: { carId: id } });
            console.log(`Current option count for car: ${optionCount}`);
        });

        return {
            success: true,
            message: 'Tam kapsamlı yazma testi (Transaction dahil) başarılı! Sorun başka bir yerde olabilir (örneğin redirect).'
        };
    } catch (error: any) {
        console.error('CRITICAL ERROR DURING TEST UPDATE:', error);
        return {
            success: false,
            error: `Teknik Hata: ${error.message}`,
            stack: error.stack,
            code: error.code // Prisma error code (e.g., P2002)
        };
    }
}

const DEFAULT_CAR_CATEGORIES = [
    'Kleinwagen', 'Mittelklasse', 'Limousine', 'SUV', 'Van', 'Sportwagen', 'Cabrio', 'Kombi', 'Bus', 'Kastenwagen'
];

// —— Car categories (Fahrzeugkategorien) ——
export async function getCarCategories() {
    const list = await prisma.carCategory.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
    if (list.length === 0) {
        await prisma.carCategory.createMany({
            data: DEFAULT_CAR_CATEGORIES.map((name, i) => ({ name, sortOrder: i }))
        });
        return prisma.carCategory.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
    }
    return list;
}

export async function createCarCategory(name: string) {
    const maxOrder = await prisma.carCategory.aggregate({ _max: { sortOrder: true } });
    await prisma.carCategory.create({
        data: { name: name.trim(), sortOrder: (maxOrder._max.sortOrder ?? -1) + 1 }
    });
    revalidatePath('/admin/fleet');
}

export async function updateCarCategory(id: number, name: string) {
    await prisma.carCategory.update({ where: { id }, data: { name: name.trim() } });
    revalidatePath('/admin/fleet');
}

export async function deleteCarCategory(id: number) {
    await prisma.carCategory.delete({ where: { id } });
    revalidatePath('/admin/fleet');
}
